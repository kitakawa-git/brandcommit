'use client'

// スーパー管理画面プロバイダー: is_superadmin=trueのユーザーのみアクセス可能
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { SuperAdminSidebar } from './SuperAdminSidebar'
import { SuperAdminHeader } from './SuperAdminHeader'
import { ShieldAlert } from 'lucide-react'

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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 text-base text-gray-500">
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
          <div className="bg-white rounded-xl p-10 text-center max-w-[400px] shadow-sm">
            <div className="mb-4 flex justify-center text-gray-400">
              <ShieldAlert size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              アクセス権限がありません
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              スーパー管理画面はID INC.スタッフのみアクセスできます。
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/admin')}
                className="py-2.5 px-6 bg-transparent text-gray-900 border border-gray-200 rounded-lg text-sm cursor-pointer"
              >
                管理画面へ
              </button>
              <button
                onClick={signOut}
                className="py-2.5 px-6 bg-[#1e3a5f] text-white border-none rounded-lg text-sm font-bold cursor-pointer"
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
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <SuperAdminSidebar />
        </div>
        <div className="flex-1 ml-0 md:ml-[240px]">
          <SuperAdminHeader />
          <main className="p-6 bg-gray-50 min-h-[calc(100vh-60px)]">
            {children}
          </main>
        </div>
      </div>
    </SuperAdminContext.Provider>
  )
}

export const useSuperAdmin = () => useContext(SuperAdminContext)
