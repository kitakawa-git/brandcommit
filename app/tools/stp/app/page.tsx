'use client'

// STP分析ツール — プレースホルダーページ（認証チェック付き）
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function STPAppPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/tools/stp/auth')
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">STP分析ツール</h1>
        <p className="text-gray-500">準備中です。もうしばらくお待ちください。</p>
      </div>
    </div>
  )
}
