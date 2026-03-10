'use client'

// 統一OAuth コールバックページ（implicit flow: クライアントサイド処理）
// Supabase が hash fragment でトークンを返すので、onAuthStateChange で検知する
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

export default function PortalAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center font-sans">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    }>
      <PortalAuthCallbackContent />
    </Suspense>
  )
}

function PortalAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const from = searchParams.get('from')

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe()
          // from がある場合は選択ページへ、ない場合はポータルダッシュボードへ
          if (from) {
            router.replace(`/portal/auth/select?from=${from}`)
          } else {
            router.replace('/portal')
          }
        }
      }
    )

    // すでにセッションがある場合（ページリロード時など）
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (from) {
          router.replace(`/portal/auth/select?from=${from}`)
        } else {
          router.replace('/portal')
        }
      }
    })

    // 10秒タイムアウト
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      setError('認証に失敗しました')
      setTimeout(() => {
        const errorUrl = from
          ? `/portal/auth?from=${from}&error=auth_failed`
          : '/portal/auth?error=auth_failed'
        router.replace(errorUrl)
      }, 1500)
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans">
        <div className="rounded-lg bg-red-50 px-6 py-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <div className="text-center">
        <Skeleton className="mx-auto mb-4 h-8 w-48" />
        <p className="text-sm text-gray-500">認証を確認しています...</p>
      </div>
    </div>
  )
}
