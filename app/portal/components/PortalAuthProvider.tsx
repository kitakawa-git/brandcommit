'use client'

// ポータル認証プロバイダー: members テーブルを参照
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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

  // 初回マウント時: getSession() で直接セッション確認 + 10秒タイムアウト
  useEffect(() => {
    // 公開パスではセッション確認のみ行い、リダイレクトしない
    let timeoutId: NodeJS.Timeout

    const init = async () => {
      // 10秒経っても完了しなければ強制リダイレクト（公開パス以外）
      timeoutId = setTimeout(() => {
        console.warn('[PortalAuth] 10秒タイムアウト')
        setLoading(false)
        if (!isPublicPath) {
          router.replace('/portal/login')
        }
      }, 10000)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null

        if (!currentUser) {
          clearTimeout(timeoutId)
          setUser(null)
          setLoading(false)
          if (!isPublicPath) {
            router.replace('/portal/login')
          }
          return
        }

        setUser(currentUser)
        await fetchMember(currentUser.id)
        clearTimeout(timeoutId)
        setLoading(false)
      } catch {
        clearTimeout(timeoutId)
        setLoading(false)
        if (!isPublicPath) {
          router.replace('/portal/login')
        }
      }
    }

    init()

    // onAuthStateChange は SIGNED_OUT 監視用のみ
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setCompanyId(null)
          setMember(null)
          router.replace('/portal/login')
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
        <div className="flex items-center justify-center min-h-screen bg-white text-base text-gray-500 font-sans">
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
        <div className="flex items-center justify-center min-h-screen bg-white font-sans">
          <div className="bg-white rounded-xl p-10 text-center max-w-[400px] shadow-sm">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              アクセス権限がありません
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              このアカウントはメンバーとして登録されていません。管理者に連絡してください。
            </p>
            <button
              onClick={signOut}
              className="px-6 py-2.5 bg-blue-600 text-white border-none rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors"
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
