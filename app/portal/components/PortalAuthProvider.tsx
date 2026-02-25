'use client'

// ポータル認証プロバイダー: members テーブルを参照
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

type MemberInfo = {
  id: string
  display_name: string
  email: string
}

type PortalAuthContextType = {
  user: User | null
  companyId: string | null
  companyName: string | null
  companyLogoUrl: string | null
  member: MemberInfo | null
  profileName: string | null
  profilePhotoUrl: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const PortalAuthContext = createContext<PortalAuthContextType>({
  user: null,
  companyId: null,
  companyName: null,
  companyLogoUrl: null,
  member: null,
  profileName: null,
  profilePhotoUrl: null,
  loading: true,
  signOut: async () => {},
})

// 認証不要のパス
const publicPaths = ['/portal/login', '/portal/register']

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)
  const [member, setMember] = useState<MemberInfo | null>(null)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

  const fetchMember = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*, profile:profiles(name, photo_url)')
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

      // プロフィール情報を取得（join 結果から）
      const profileRaw = data.profile as { name: string; photo_url: string } | { name: string; photo_url: string }[] | null
      const profile = Array.isArray(profileRaw) ? profileRaw[0] ?? null : profileRaw
      setProfileName(profile?.name || data.display_name || null)
      setProfilePhotoUrl(profile?.photo_url || null)

      // 会社情報を取得
      try {
        const { data: companyData } = await supabase
          .from('companies')
          .select('name, logo_url')
          .eq('id', data.company_id)
          .single()
        if (companyData) {
          setCompanyName(companyData.name || null)
          setCompanyLogoUrl(companyData.logo_url || null)
        }
      } catch {
        // 会社情報取得失敗は無視
      }

      return true
    } catch {
      setCompanyId(null)
      setMember(null)
      return false
    }
  }

  // onAuthStateChange を唯一の認証ソースとして使用（Supabase推奨パターン）
  useEffect(() => {
    // 10秒経っても INITIAL_SESSION が来なければ強制リダイレクト
    const timeoutId = setTimeout(() => {
      console.warn('[PortalAuth] 10秒タイムアウト')
      setLoading(false)
      if (!isPublicPath) {
        router.replace('/portal/login')
      }
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[PortalAuth] onAuthStateChange:', event, session?.user?.email)

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          clearTimeout(timeoutId)
          const currentUser = session?.user ?? null

          if (!currentUser) {
            setUser(null)
            setLoading(false)
            if (!isPublicPath) {
              router.replace('/portal/login')
            }
            return
          }

          setUser(currentUser)
          await fetchMember(currentUser.id)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          clearTimeout(timeoutId)
          setUser(null)
          setCompanyId(null)
          setMember(null)
          setLoading(false)
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
    setCompanyName(null)
    setCompanyLogoUrl(null)
    setMember(null)
    setProfileName(null)
    setProfilePhotoUrl(null)
    router.push('/portal/login')
  }

  const contextValue = { user, companyId, companyName, companyLogoUrl, member, profileName, profilePhotoUrl, loading, signOut }

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
          <Card className="bg-muted/50 border shadow-none max-w-[400px] w-full mx-5">
            <CardContent className="p-10 text-center">
              <div className="mb-4 flex justify-center text-muted-foreground">
                <ShieldAlert size={48} />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">
                アクセス権限がありません
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                このアカウントはメンバーとして登録されていません。管理者に連絡してください。
              </p>
              <Button onClick={signOut} className="rounded-lg">
                ログアウト
              </Button>
            </CardContent>
          </Card>
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
