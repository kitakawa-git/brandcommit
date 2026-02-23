'use client'

// 社員新規追加ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MemberForm } from '../../components/MemberForm'
import { colors } from '../../components/AdminStyles'

export default function NewMemberPage() {
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 最初の企業レコードのIDを取得（ハードコード仕様）
    const fetchCompany = async () => {
      const { data } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()

      if (data) setCompanyId(data.id)
      setLoading(false)
    }
    fetchCompany()
  }, [])

  if (loading) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        読み込み中...
      </p>
    )
  }

  if (!companyId) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        企業データが見つかりません。先に企業情報を登録してください。
      </p>
    )
  }

  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        margin: '0 0 24px',
      }}>
        社員を追加
      </h2>
      <MemberForm companyId={companyId} />
    </div>
  )
}
