'use client'

// 認証プロバイダー: ログイン状態を管理し、未ログイン時はリダイレクト
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './AdminHeader'
import { colors, layout } from './AdminStyles'

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 現在のセッション確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (!session?.user && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    })

    // 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user && pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [pathname, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const contextValue = { user, loading, signOut }

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

  // 認証済み: サイドバー + ヘッダー + コンテンツ
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
