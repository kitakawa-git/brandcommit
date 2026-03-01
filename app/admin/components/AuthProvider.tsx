'use client'

// 認証プロバイダー: ログイン状態を管理し、未ログイン時はリダイレクト
// マルチテナント対応: admin_usersテーブルからcompany_idを取得
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { clearPageCache } from '@/lib/page-cache'
import { AppSidebar } from './AppSidebar'
import { AdminHeader } from './AdminHeader'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

type AuthContextType = {
  user: User | null
  companyId: string | null
  role: string | null
  isSuperAdmin: boolean
  profileName: string | null
  profilePhotoUrl: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  companyId: null,
  role: null,
  isSuperAdmin: false,
  profileName: null,
  profilePhotoUrl: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminError, setAdminError] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const fetchAdminUser = async (authId: string) => {
    try {
      console.log('[AuthProvider] ステップ1: admin_users検索中... authId:', authId)
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_id', authId)
        .single()

      console.log('[AuthProvider] ステップ2: admin_users結果:', {
        data: data ? { company_id: data.company_id, role: data.role, is_superadmin: data.is_superadmin } : null,
        error: error?.message,
      })

      if (error || !data) {
        console.warn('[AuthProvider] admin_user見つからず:', error?.message || '該当レコードなし')
        setAdminError(true)
        setCompanyId(null)
        setRole(null)
        setIsSuperAdmin(false)
        return false
      }

      console.log('[AuthProvider] ステップ3: companyId=', data.company_id, 'role=', data.role, 'isSuperAdmin=', data.is_superadmin)
      setCompanyId(data.company_id)
      setRole(data.role)
      setIsSuperAdmin(data.is_superadmin === true)
      setAdminError(false)

      // ステップ4: members → profiles からプロフィール情報を取得
      try {
        const { data: memberData } = await supabase
          .from('members')
          .select('display_name, profile:profiles(name, photo_url)')
          .eq('auth_id', authId)
          .single()

        if (memberData) {
          const profileRaw = memberData.profile as { name: string; photo_url: string } | { name: string; photo_url: string }[] | null
          const profile = Array.isArray(profileRaw) ? profileRaw[0] ?? null : profileRaw
          setProfileName(profile?.name || memberData.display_name || null)
          setProfilePhotoUrl(profile?.photo_url || null)
        }
      } catch {
        // プロフィール取得失敗は無視（表示に影響するだけ）
      }

      return true
    } catch (err) {
      console.error('[AuthProvider] fetchAdminUser例外:', err)
      setAdminError(true)
      setCompanyId(null)
      setRole(null)
      setIsSuperAdmin(false)
      return false
    }
  }

  // onAuthStateChange を唯一の認証ソースとして使用（Supabase推奨パターン）
  useEffect(() => {
    const isLoginPage = pathname === '/admin/login'

    // 10秒経っても INITIAL_SESSION が来なければ強制リダイレクト
    const timeoutId = setTimeout(() => {
      console.warn('[AuthProvider] 10秒タイムアウト: ログインページへリダイレクト')
      setLoading(false)
      if (!isLoginPage) {
        router.replace('/admin/login')
      }
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] onAuthStateChange:', event, session?.user?.email)

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          clearTimeout(timeoutId)
          const currentUser = session?.user ?? null

          if (!currentUser) {
            setUser(null)
            setLoading(false)
            if (!isLoginPage) {
              router.replace('/admin/login')
            }
            return
          }

          setUser(currentUser)

          // TOKEN_REFRESHED: データ既取得済みなら再取得スキップ（スケルトン回避）
          if (event === 'TOKEN_REFRESHED' && companyId) {
            return
          }

          await fetchAdminUser(currentUser.id)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          clearTimeout(timeoutId)
          setUser(null)
          setCompanyId(null)
          setRole(null)
          setIsSuperAdmin(false)
          setProfileName(null)
          setProfilePhotoUrl(null)
          setAdminError(false)
          setLoading(false)
          router.replace('/admin/login')
        }
      }
    )

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    clearPageCache()
    await supabase.auth.signOut()
    setCompanyId(null)
    setRole(null)
    setIsSuperAdmin(false)
    setProfileName(null)
    setProfilePhotoUrl(null)
    setAdminError(false)
    router.push('/admin/login')
  }

  const contextValue = { user, companyId, role, isSuperAdmin, profileName, profilePhotoUrl, loading, signOut }

  // ログインページではそのまま表示（サイドバー・ヘッダーなし）
  if (pathname === '/admin/login') {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    )
  }

  // ローディング中
  if (loading) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 text-base text-gray-500">
          読み込み中...
        </div>
      </AuthContext.Provider>
    )
  }

  // 未認証時は何も表示しない（リダイレクト中）
  if (!user) {
    return null
  }

  // admin_usersに未登録のユーザー
  if (adminError || !companyId) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
          <div className="bg-white rounded-xl p-10 text-center max-w-[400px] shadow-sm">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              アクセス権限がありません
            </h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              このアカウント（{user.email}）は管理者として登録されていません。
              管理者に連絡してください。
            </p>
            <button
              onClick={signOut}
              className="px-6 py-2.5 bg-blue-600 text-white border-none rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  // 認証済み + admin_users登録済み: サイドバー + ヘッダー + コンテンツ
  return (
    <AuthContext.Provider value={contextValue}>
      <SidebarProvider
        style={{ '--sidebar-width': '19rem' } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset>
          <AdminHeader />
          <main className="max-w-4xl mx-auto px-5 py-6 w-full">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
