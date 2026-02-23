'use client'

// /superadmin → /superadmin/companies にリダイレクト
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperAdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/superadmin/companies')
  }, [router])

  return null
}
