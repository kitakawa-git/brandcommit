'use client'

// 社員新規追加ページ（マルチテナント対応: useAuth()からcompanyIdを取得）
import { useAuth } from '../../components/AuthProvider'
import { MemberForm } from '../../components/MemberForm'
import { colors } from '../../components/AdminStyles'

export default function NewMemberPage() {
  const { companyId } = useAuth()

  if (!companyId) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        企業データが見つかりません。管理者に連絡してください。
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
