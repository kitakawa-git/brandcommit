'use client'

// 認証プロバイダー: ログイン状態を管理し、未ログイン時はリダイレクト
// マルチテナント対応: admin_usersテーブルからcompany_idを取得
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './AdminHeader'

type AuthContextType = {
  user: User | null
  companyId: string | null
  role: string | null
  isSuperAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  companyId: null,
  role: null,
  isSuperAdmin: false,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const init = async () => {
      timeoutId = setTimeout(() => {
        console.warn('[AuthProvider] 10秒タイムアウト: ログインページへリダイレクト')
        setLoading(false)
        router.replace('/admin/login')
      }, 10000)

      try {
        console.log('[AuthProvider] 初回セッション確認中...')
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        console.log('[AuthProvider] セッション結果:', currentUser ? `user=${currentUser.email}` : 'なし')

        if (!currentUser) {
          clearTimeout(timeoutId)
          setUser(null)
          setLoading(false)
          if (pathname !== '/admin/login') {
            router.replace('/admin/login')
          }
          return
        }

        setUser(currentUser)
        await fetchAdminUser(currentUser.id)
        clearTimeout(timeoutId)
        setLoading(false)
      } catch (err) {
        console.error('[AuthProvider] getSession例外:', err)
        clearTimeout(timeoutId)
        setLoading(false)
        router.replace('/admin/login')
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        console.log('[AuthProvider] onAuthStateChange:', event)
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setCompanyId(null)
          setRole(null)
          setIsSuperAdmin(false)
          setAdminError(false)
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
    await supabase.auth.signOut()
    setCompanyId(null)
    setRole(null)
    setIsSuperAdmin(false)
    setAdminError(false)
    router.push('/admin/login')
  }

  const contextValue = { user, companyId, role, isSuperAdmin, loading, signOut }

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
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              アクセス権限がありません
            </h2>
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
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 ml-0 md:ml-[240px]">
          <AdminHeader />
          <main className="p-6 bg-gray-50 min-h-[calc(100vh-60px)]">
            {children}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
