'use client'

// 従業員編集ページ（マルチテナント対応: 自社の従業員のみ編集可能）
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../../components/AuthProvider'
import { MemberForm } from '../../../components/MemberForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single()

      if (!error && data) {
        setProfile(data)
        if (data.slug) {
          generatePreviewQRDataURL(data.slug).then(setQrPreview)
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [id, companyId])

  if (loading) {
    return <p className="text-muted-foreground text-center p-10">読み込み中...</p>
  }

  if (!profile) {
    return <p className="text-muted-foreground text-center p-10">従業員データが見つかりません</p>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">アカウント編集</h2>
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
        <Card className="bg-muted/50 border shadow-none mt-6">
          <CardContent className="p-6 text-center">
            <h3 className="text-sm font-bold text-foreground mb-4">QRコード</h3>
            {qrPreview && (
              <img
                src={qrPreview}
                alt="QRコード"
                width={160}
                height={160}
                className="block mx-auto mb-3"
              />
            )}
            <p className="text-xs text-muted-foreground mb-4 m-0">
              {getCardUrl(profile.slug)}
            </p>
            <Button
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
            >
              {downloading ? '生成中...' : 'QRコードをダウンロード（印刷用）'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
