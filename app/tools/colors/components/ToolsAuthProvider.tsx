'use client'

// ミニアプリ用認証プロバイダー（admin/portalとは独立の軽量版）
// admin_users / members テーブルへの問い合わせは不要
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { MiniAppSession } from '@/lib/types/color-tool'

interface ToolsAuthContextType {
  user: User | null
  session: MiniAppSession | null
  loading: boolean
  signOut: () => Promise<void>
}

const ToolsAuthContext = createContext<ToolsAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function useToolsAuth() {
  return useContext(ToolsAuthContext)
}

export function ToolsAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<MiniAppSession | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // useRef で最新の値をコールバック内から参照（クロージャの古い値問題を回避）
  const loadedRef = useRef(false)
  const sessionRef = useRef<MiniAppSession | null>(null)
  useEffect(() => { sessionRef.current = session }, [session])

  useEffect(() => {
    // 10秒タイムアウト: INITIAL_SESSION が来なければ強制リダイレクト
    const timeoutId = setTimeout(() => {
      console.warn('[ToolsAuth] 10秒タイムアウト: ランディングへリダイレクト')
      setLoading(false)
      router.replace('/tools/colors')
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, authSession) => {
        console.log('[ToolsAuth] onAuthStateChange:', event, authSession?.user?.email)

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // イベントが来た時点でタイムアウトは不要
          clearTimeout(timeoutId)

          if (!authSession?.user) {
            // 未認証 → ランディングへ（INITIAL_SESSION + session=null のケース）
            setUser(null)
            setLoading(false)
            return
          }

          setUser(authSession.user)

          // TOKEN_REFRESHED: データ取得済みなら再取得スキップ（リダイレクトもしない）
          if (event === 'TOKEN_REFRESHED' && loadedRef.current) {
            return
          }

          // SIGNED_IN: データ取得済みなら再取得スキップ
          if (event === 'SIGNED_IN' && loadedRef.current) {
            setLoading(false)
            return
          }

          // mini_app_sessions から最新セッション取得
          try {
            const { data: sessionData } = await supabase
              .from('mini_app_sessions')
              .select('*')
              .eq('user_id', authSession.user.id)
              .eq('app_type', 'brand_colors')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (sessionData) {
              setSession(sessionData as MiniAppSession)
            }
            loadedRef.current = true
          } catch (err) {
            console.error('[ToolsAuth] セッション取得エラー:', err)
          }

          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          clearTimeout(timeoutId)
          setUser(null)
          setSession(null)
          loadedRef.current = false
          setLoading(false)
          router.replace('/tools/colors')
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
  }

  return (
    <ToolsAuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </ToolsAuthContext.Provider>
  )
}
