import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div style={{ padding: 40 }}>
        <h1>環境変数エラー</h1>
        <p>URL: {supabaseUrl ? '設定済み' : '未設定'}</p>
        <p>KEY: {supabaseKey ? '設定済み' : '未設定'}</p>
      </div>
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <h1>データ取得エラー</h1>
        <p>slug: {slug}</p>
        <p>エラー: {error.message}</p>
      </div>
    )
  }

  if (!profile) {
    notFound()
  }

  const company = profile.companies

  // QRコードをサーバーサイドで生成
  const cardUrl = `https://brandcommit.vercel.app/card/${slug}`
  const qrDataUrl = await QRCode.toDataURL(cardUrl, {
    width: 160,
    margin: 1,
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      fontFamily: 'sans-serif',
    }}>
      {/* ヘッダー */}
      <div style={{
        backgroundColor: company?.brand_color_primary || '#1a1a1a',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#ffffff',
      }}>
        {profile.photo_url ? (
          <img
            src={profile.photo_url}
            alt={profile.name}
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              objectFit: 'cover',
              margin: '0 auto 16px',
              display: 'block',
              border: '3px solid #ffffff',
            }}
          />
        ) : (
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            color: company?.brand_color_primary || '#1a1a1a',
          }}>
            {profile.name?.charAt(0)}
          </div>
        )}
        <h1 style={{ fontSize: 24, margin: '0 0 4px' }}>{profile.name}</h1>
        <p style={{ fontSize: 14, margin: 0, opacity: 0.8 }}>
          {profile.position} / {profile.department}
        </p>
      </div>

      {/* 個人セクション */}
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '24px 20px',
      }}>
        {profile.bio && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 14, lineHeight: 1.8, margin: 0, color: '#333' }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* 連絡先 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {profile.email && (
            <a href={`mailto:${profile.email}`} style={{
              flex: 1, display: 'block', textAlign: 'center', padding: '12px 0',
              backgroundColor: '#ffffff', borderRadius: 12,
              color: company?.brand_color_primary || '#1a1a1a',
              textDecoration: 'none', fontSize: 14, fontWeight: 'bold',
            }}>
              ✉ メール
            </a>
          )}
          {profile.phone && (
            <a href={`tel:${profile.phone}`} style={{
              flex: 1, display: 'block', textAlign: 'center', padding: '12px 0',
              backgroundColor: '#ffffff', borderRadius: 12,
              color: company?.brand_color_primary || '#1a1a1a',
              textDecoration: 'none', fontSize: 14, fontWeight: 'bold',
            }}>
              📞 電話
            </a>
          )}
        </div>

        {/* 企業セクション */}
        {company && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 20 }}>
            <h2 style={{
              fontSize: 18, margin: '0 0 8px',
              color: company.brand_color_primary || '#1a1a1a',
            }}>
              {company.name}
            </h2>
            {company.slogan && (
              <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px', fontStyle: 'italic' }}>
                {company.slogan}
              </p>
            )}
            {company.mvv && (
              <p style={{ fontSize: 13, color: '#333', lineHeight: 1.8, margin: '0 0 16px' }}>
                {company.mvv}
              </p>
            )}
            {company.website_url && (
              <a href={company.website_url} target="_blank" style={{
                display: 'block', textAlign: 'center', padding: '12px 0',
                backgroundColor: company.brand_color_primary || '#1a1a1a',
                borderRadius: 8, color: '#ffffff', textDecoration: 'none', fontSize: 14,
              }}>
                コーポレートサイトを見る →
              </a>
            )}
          </div>
        )}

        {/* QRコード */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <img
            src={qrDataUrl}
            alt="QRコード"
            width={160}
            height={160}
            style={{ display: 'block', margin: '0 auto' }}
          />
          <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
            名刺に印刷用
          </p>
        </div>

        {/* フッター */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#999', marginTop: 16 }}>
          Powered by brandcommit
        </p>
      </div>
    </div>
  )
}