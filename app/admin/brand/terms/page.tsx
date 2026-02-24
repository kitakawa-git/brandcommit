'use client'

// 用語ルールはバーバルアイデンティティページに統合済み → リダイレクト
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BrandTermsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/brand/personality') }, [router])
  return null
}
