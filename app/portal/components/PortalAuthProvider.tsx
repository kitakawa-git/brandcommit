'use client'

// ポータル認証プロバイダー: members テーブルを参照
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { portalColors } from './PortalStyles'

type MemberInfo = {
  id: string
  display_name: string
  email: string
}

type PortalAuthContextType = {
  user: User | null
  companyId: string | null
  member: MemberInfo | null
  loading: boolean
  signOut: () => Promise<void>
}

const PortalAuthContext = createContext<PortalAuthContextType>({
  user: null,
  companyId: null,
  member: null,
  loading: true,
  signOut: async () => {},
})

// 認証不要のパス
const publicPaths = ['/portal/login', '/portal/register']

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [member, setMember] = useState<MemberInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

  const fetchMember = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('auth_id', authId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setCompanyId(null)
        setMember(null)
        return false
      }

      setCompanyId(data.company_id)
      setMember({
        id: data.id,
        display_name: data.display_name,
        email: data.email,
      })
      return true
    } catch {
      setCompanyId(null)
      setMember(null)
      return false
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchMember(currentUser.id)
      }

      setLoading(false)

      if (!currentUser && !isPublicPath) {
        router.push('/portal/login')
      }
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchMember(currentUser.id)
        } else {
          setCompanyId(null)
          setMember(null)
        }

        if (!currentUser && !isPublicPath) {
          router.push('/portal/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [pathname, router, isPublicPath])

  const signOut = async () => {
    await supabase.auth.signOut()
    setCompanyId(null)
    setMember(null)
    router.push('/portal/login')
  }

  const contextValue = { user, companyId, member, loading, signOut }

  // 公開パスではそのまま表示
  if (isPublicPath) {
    return (
      <PortalAuthContext.Provider value={contextValue}>
        {children}
      </PortalAuthContext.Provider>
    )
  }

  // ローディング中
  if (loading) {
    return (
      <PortalAuthContext.Provider value={contextValue}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: portalColors.bg,
          fontSize: 16,
          color: portalColors.textSecondary,
          fontFamily: 'sans-serif',
        }}>
          読み込み中...
        </div>
      </PortalAuthContext.Provider>
    )
  }

  // 未認証
  if (!user) {
    return null
  }

  // membersに未登録
  if (!member || !companyId) {
    return (
      <PortalAuthContext.Provider value={contextValue}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: portalColors.bg,
          fontFamily: 'sans-serif',
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            maxWidth: 400,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 12px' }}>
              アクセス権限がありません
            </h2>
            <p style={{ fontSize: 14, color: portalColors.textSecondary, margin: '0 0 24px', lineHeight: 1.6 }}>
              このアカウントはメンバーとして登録されていません。管理者に連絡してください。
            </p>
            <button
              onClick={signOut}
              style={{
                padding: '10px 24px',
                backgroundColor: portalColors.primary,
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
      </PortalAuthContext.Provider>
    )
  }

  // 認証済み
  return (
    <PortalAuthContext.Provider value={contextValue}>
      {children}
    </PortalAuthContext.Provider>
  )
}

export const usePortalAuth = () => useContext(PortalAuthContext)
