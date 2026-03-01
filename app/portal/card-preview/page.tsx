'use client'

// 名刺プレビュー フォールバックページ
// サイドバーからはDialogで開くが、直接URLアクセス時はダッシュボードにリダイレクト
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CardPreviewPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/portal')
  }, [router])

  return null
}
