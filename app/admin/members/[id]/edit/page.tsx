'use client'

// 従業員編集ページ（マルチテナント対応: 自社の従業員のみ編集可能）
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../../components/AuthProvider'
import { MemberForm } from '../../../components/MemberForm'
import { colors, commonStyles } from '../../../components/AdminStyles'
import { downloadQRCode, generatePreviewQRDataURL, getCardUrl } from '@/lib/qr-download'

export default function EditMemberPage() {
  const params = useParams()
  const id = params.id as string
  const { companyId } = useAuth()

  const [profile, setProfile] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrPreview, setQrPreview] = useState<string>('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!companyId) return

    const fetchProfile = async () => {
      // 自社のprofileのみ取得（company_idフィルタ付き）
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single()

      if (!error && data) {
        setProfile(data)
        // QRプレビュー生成
        if (data.slug) {
          generatePreviewQRDataURL(data.slug).then(setQrPreview)
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [id, companyId])

  if (loading) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        読み込み中...
      </p>
    )
  }

  if (!profile) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        従業員データが見つかりません
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
        従業員を編集
      </h2>
      <MemberForm
        initialData={{
          id: profile.id,
          name: profile.name || '',
          position: profile.position || '',
          department: profile.department || '',
          bio: profile.bio || '',
          email: profile.email || '',
          phone: profile.phone || '',
          slug: profile.slug || '',
          photo_url: profile.photo_url || '',
          company_id: profile.company_id || '',
          sns_x: profile.sns_x || '',
          sns_linkedin: profile.sns_linkedin || '',
          sns_facebook: profile.sns_facebook || '',
          sns_instagram: profile.sns_instagram || '',
        }}
        companyId={profile.company_id || ''}
      />

      {/* QRコードプレビュー */}
      {profile.slug && (
        <div style={{
          ...commonStyles.card,
          marginTop: 24,
          textAlign: 'center' as const,
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 16px',
          }}>
            QRコード
          </h3>
          {qrPreview && (
            <img
              src={qrPreview}
              alt="QRコード"
              width={160}
              height={160}
              style={{ display: 'block', margin: '0 auto 12px' }}
            />
          )}
          <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 16px' }}>
            {getCardUrl(profile.slug)}
          </p>
          <button
            onClick={async () => {
              setDownloading(true)
              try {
                await downloadQRCode(profile.slug, profile.name || 'member')
              } catch (err) {
                console.error('QRコード生成エラー:', err)
              }
              setDownloading(false)
            }}
            disabled={downloading}
            style={{
              ...commonStyles.button,
              opacity: downloading ? 0.6 : 1,
            }}
          >
            {downloading ? '生成中...' : 'QRコードをダウンロード（印刷用）'}
          </button>
        </div>
      )}
    </div>
  )
}
