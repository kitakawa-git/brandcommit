'use client'

// STP分析ツール — セッション付きメインページ（プレースホルダー）
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function STPSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [session, setSession] = useState<Record<string, unknown> | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      // 認証チェック
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/tools/stp/auth')
        return
      }

      // セッション取得
      try {
        const res = await fetch(`/api/tools/stp/sessions/${sessionId}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'セッションの取得に失敗しました')
          return
        }
        const { session: sessionData } = await res.json()
        setSession(sessionData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-lg bg-red-50 px-6 py-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">STP分析ツール</h1>
        <p className="text-gray-500 mb-4">準備中です。もうしばらくお待ちください。</p>
        <p className="text-xs text-gray-400">セッションID: {sessionId}</p>
      </div>
    </div>
  )
}
