'use client'

// スーパー管理画面プロバイダー: is_superadmin=trueのユーザーのみアクセス可能
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { SuperAdminSidebar } from './SuperAdminSidebar'
import { SuperAdminHeader } from './SuperAdminHeader'
import { colors, layout } from '../../admin/components/AdminStyles'

type SuperAdminContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const SuperAdminContext = createContext<SuperAdminContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // admin_usersテーブルからis_superadminを確認
  const checkSuperAdmin = async (authId: string) => {
    try {
      console.log('[SuperAdmin] 権限確認中... authId:', authId)
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_superadmin')
        .eq('auth_id', authId)
        .single()

      console.log('[SuperAdmin] 結果:', { data, error: error?.message })

      if (error || !data || !data.is_superadmin) {
        console.warn('[SuperAdmin] スーパー管理者ではありません')
        setIsSuperAdmin(false)
        setAccessDenied(true)
        return false
      }

      setIsSuperAdmin(true)
      setAccessDenied(false)
      return true
    } catch (err) {
      console.error('[SuperAdmin] 権限確認エラー:', err)
      setAccessDenied(true)
      return false
    }
  }

  useEffect(() => {
    console.log('[SuperAdmin] セッション確認中...')
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      console.log('[SuperAdmin] セッション:', currentUser ? currentUser.email : 'なし')
      setUser(currentUser)

      if (currentUser) {
        await checkSuperAdmin(currentUser.id)
      } else {
        // 未ログイン → ログインページへ
        router.push('/admin/login')
      }

      setLoading(false)
    }).catch((err) => {
      console.error('[SuperAdmin] セッション確認エラー:', err)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await checkSuperAdmin(currentUser.id)
        } else {
          setIsSuperAdmin(false)
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

  // ローディング中
  if (loading) {
    return (
      <SuperAdminContext.Provider value={contextValue}>
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
      </SuperAdminContext.Provider>
    )
  }

  // 未認証
  if (!user) {
    return null
  }

  // スーパー管理者でない場合 → アクセス拒否
  if (accessDenied || !isSuperAdmin) {
    return (
      <SuperAdminContext.Provider value={contextValue}>
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
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
              スーパー管理画面はID INC.スタッフのみアクセスできます。
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/admin')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'transparent',
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                管理画面へ
              </button>
              <button
                onClick={signOut}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#1e3a5f',
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
        </div>
      </SuperAdminContext.Provider>
    )
  }

  // スーパー管理者: サイドバー + ヘッダー + コンテンツ
  return (
    <SuperAdminContext.Provider value={contextValue}>
      {/* レスポンシブ対応 */}
      <style>{`
        @media (max-width: 768px) {
          .superadmin-sidebar { display: none !important; }
          .superadmin-main { margin-left: 0 !important; }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className="superadmin-sidebar">
          <SuperAdminSidebar />
        </div>
        <div className="superadmin-main" style={{
          flex: 1,
          marginLeft: layout.sidebarWidth,
        }}>
          <SuperAdminHeader />
          <main style={{
            padding: 24,
            backgroundColor: colors.pageBg,
            minHeight: `calc(100vh - ${layout.headerHeight}px)`,
          }}>
            {children}
          </main>
        </div>
      </div>
    </SuperAdminContext.Provider>
  )
}

export const useSuperAdmin = () => useContext(SuperAdminContext)
