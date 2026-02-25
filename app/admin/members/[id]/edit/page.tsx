'use client'

// 従業員編集ページ（マルチテナント対応: 自社の従業員のみ編集可能）
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../../components/AuthProvider'
import { MemberForm } from '../../../components/MemberForm'
import { commonStyles } from '../../../components/AdminStyles'
import { cn } from '@/lib/utils'
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
      <p className="text-gray-500 text-center p-10">
        読み込み中...
      </p>
    )
  }

  if (!profile) {
    return (
      <p className="text-gray-500 text-center p-10">
        従業員データが見つかりません
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        アカウント編集
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
        <div className={cn(commonStyles.card, 'mt-6 text-center')}>
          <h3 className="text-base font-bold text-gray-900 mb-4">
            QRコード
          </h3>
          {qrPreview && (
            <img
              src={qrPreview}
              alt="QRコード"
              width={160}
              height={160}
              className="block mx-auto mb-3"
            />
          )}
          <p className="text-xs text-gray-500 mb-4">
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
            className={cn(commonStyles.button, downloading && 'opacity-60')}
          >
            {downloading ? '生成中...' : 'QRコードをダウンロード（印刷用）'}
          </button>
        </div>
      )}
    </div>
  )
}
