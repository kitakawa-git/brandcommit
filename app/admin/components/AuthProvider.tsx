'use client'

// 認証プロバイダー: ログイン状態を管理し、未ログイン時はリダイレクト
// マルチテナント対応: admin_usersテーブルからcompany_idを取得
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './AdminHeader'
import { colors, layout } from './AdminStyles'

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
  const [adminError, setAdminError] = useState(false) // admin_users未登録エラー
  const router = useRouter()
  const pathname = usePathname()

  // admin_usersテーブルからcompany_idとroleを取得
  // select('*') を使用: is_superadminカラムが未追加でもエラーにならない
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
        // admin_usersに未登録またはRLSでブロック
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

  // 初回マウント時: getSession() で直接セッション確認 + 10秒タイムアウト
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const init = async () => {
      // 10秒経っても完了しなければ強制リダイレクト
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

    // onAuthStateChange は SIGNED_OUT 監視用のみ
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: colors.pageBg,
          fontSize: 16,
          color: colors.textSecondary,
        }}>
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: colors.pageBg,
          fontFamily: 'sans-serif',
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            maxWidth: 400,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16,
            }}>
              🚫
            </div>
            <h2 style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.textPrimary,
              margin: '0 0 12px',
            }}>
              アクセス権限がありません
            </h2>
            <p style={{
              fontSize: 14,
              color: colors.textSecondary,
              margin: '0 0 24px',
              lineHeight: 1.6,
            }}>
              このアカウント（{user.email}）は管理者として登録されていません。
              管理者に連絡してください。
            </p>
            <button
              onClick={signOut}
              style={{
                padding: '10px 24px',
                backgroundColor: colors.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
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
      {/* レスポンシブ対応: モバイルでサイドバー非表示 */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-main { margin-left: 0 !important; }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className="admin-sidebar">
          <Sidebar />
        </div>
        <div className="admin-main" style={{
          flex: 1,
          marginLeft: layout.sidebarWidth,
        }}>
          <AdminHeader />
          <main style={{
            padding: 24,
            backgroundColor: colors.pageBg,
            minHeight: `calc(100vh - ${layout.headerHeight}px)`,
          }}>
            {children}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
