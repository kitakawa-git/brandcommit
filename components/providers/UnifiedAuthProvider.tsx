'use client'

// 統一認証プロバイダー
// ツール・ポータル共通で使える軽量な認証チェック
// admin_users / members テーブルへの問い合わせは行わない（各サービスのProvider側で実施）
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UnifiedAuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function useUnifiedAuth() {
  return useContext(UnifiedAuthContext)
}

interface UnifiedAuthProviderProps {
  children: React.ReactNode
  redirectTo?: string // 未認証時のリダイレクト先（デフォルト: '/portal/auth'）
}

export function UnifiedAuthProvider({
  children,
  redirectTo = '/portal/auth',
}: UnifiedAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const loadedRef = useRef(false)

  useEffect(() => {
    // 10秒タイムアウト
    const timeoutId = setTimeout(() => {
      console.warn('[UnifiedAuth] 10秒タイムアウト')
      setLoading(false)
      router.replace(redirectTo)
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, authSession) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          clearTimeout(timeoutId)

          if (!authSession?.user) {
            setUser(null)
            setLoading(false)
            return
          }

          setUser(authSession.user)

          if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && loadedRef.current) {
            setLoading(false)
            return
          }

          loadedRef.current = true
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          clearTimeout(timeoutId)
          setUser(null)
          loadedRef.current = false
          setLoading(false)
          router.replace(redirectTo)
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
    <UnifiedAuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}
