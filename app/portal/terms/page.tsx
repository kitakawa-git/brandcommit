'use client'

// 用語ルールはバーバルアイデンティティページに統合済み → リダイレクト
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PortalTermsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/portal/verbal') }, [router])
  return null
}
