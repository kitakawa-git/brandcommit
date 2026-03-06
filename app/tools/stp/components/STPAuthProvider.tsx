'use client'

// STP分析ツール用認証プロバイダー（colors版をベースにSTP用に調整）
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface STPAuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const STPAuthContext = createContext<STPAuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function useSTPAuth() {
  return useContext(STPAuthContext)
}

export function STPAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const loadedRef = useRef(false)

  useEffect(() => {
    // 10秒タイムアウト: INITIAL_SESSION が来なければ強制リダイレクト
    const timeoutId = setTimeout(() => {
      console.warn('[STPAuth] 10秒タイムアウト: ランディングへリダイレクト')
      setLoading(false)
      router.replace('/tools/stp')
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, authSession) => {
        console.log('[STPAuth] onAuthStateChange:', event, authSession?.user?.email)

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
          router.replace('/tools/stp')
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
    <STPAuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </STPAuthContext.Provider>
  )
}
