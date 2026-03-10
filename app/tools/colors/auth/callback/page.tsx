'use client'

// OAuth コールバックページ（Googleログイン後のリダイレクト先）
// ※ implicit flow ではトークンが URL hash fragment で返るため、
//    サーバー route.ts ではなくクライアント page.tsx で処理する
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

export default function ColorsAuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    // Supabase クライアントが hash fragment から自動的にセッションを復元する
    // onAuthStateChange で SIGNED_IN を待ち、成功したらアプリへリダイレクト
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe()
          router.replace('/tools/colors/app')
        }
      }
    )

    // 既にセッションがある場合（リロード等）も即リダイレクト
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/tools/colors/app')
      }
    })

    // タイムアウト: 10秒以内に認証が完了しなければエラー
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      setError('認証に失敗しました')
      setTimeout(() => {
        router.replace('/tools/colors/auth?error=auth_failed')
      }, 1500)
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 px-6 py-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Skeleton className="mx-auto mb-4 h-8 w-48" />
        <p className="text-sm text-gray-500">認証中...</p>
      </div>
    </div>
  )
}
