import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'

type Props = {
  params: Promise<{ slug: string }>
}

// SNSアイコンSVG
function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  )
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

  // SNSリンクの存在チェック
  const snsLinks = [
    { url: profile.sns_x, icon: <XIcon />, label: 'X' },
    { url: profile.sns_linkedin, icon: <LinkedInIcon />, label: 'LinkedIn' },
    { url: profile.sns_facebook, icon: <FacebookIcon />, label: 'Facebook' },
    { url: profile.sns_instagram, icon: <InstagramIcon />, label: 'Instagram' },
  ].filter(s => s.url)

  // 提供価値
  const providedValues: string[] = company?.provided_values || []

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      fontFamily: 'sans-serif',
    }}>
      {/* 1. ヘッダー（写真・名前・役職） */}
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

      {/* コンテンツ */}
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '24px 20px',
      }}>
        {/* 2. 自己紹介 */}
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

        {/* 3. SNSリンク（アイコン横並び） */}
        {snsLinks.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 16,
          }}>
            {snsLinks.map((sns) => (
              <a
                key={sns.label}
                href={sns.url}
                target="_blank"
                rel="noopener noreferrer"
                title={sns.label}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: company?.brand_color_primary || '#1a1a1a',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s',
                }}
              >
                {sns.icon}
              </a>
            ))}
          </div>
        )}

        {/* 4. 連絡先ボタン（メール・電話） */}
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

        {/* 5. 企業情報（ロゴ・企業名・スローガン・MVV） */}
        {company && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            {company.logo_url && (
              <img
                src={company.logo_url}
                alt={company.name}
                style={{
                  maxWidth: 120,
                  maxHeight: 48,
                  objectFit: 'contain',
                  marginBottom: 12,
                }}
              />
            )}
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
              <p style={{ fontSize: 13, color: '#333', lineHeight: 1.8, margin: 0 }}>
                {company.mvv}
              </p>
            )}
          </div>
        )}

        {/* 6. 提供価値（カード形式） */}
        {providedValues.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{
              fontSize: 15, fontWeight: 'bold', margin: '0 0 12px',
              color: company?.brand_color_primary || '#1a1a1a',
            }}>
              提供価値
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}>
              {providedValues.map((value, i) => (
                <div key={i} style={{
                  flex: '1 1 calc(50% - 5px)',
                  minWidth: 130,
                  backgroundColor: '#ffffff',
                  borderRadius: 10,
                  padding: '14px 16px',
                  fontSize: 13,
                  color: '#333',
                  fontWeight: '600',
                  textAlign: 'center',
                  borderLeft: `3px solid ${company?.brand_color_primary || '#1a1a1a'}`,
                }}>
                  {value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. ブランドストーリー */}
        {company?.brand_story && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}>
            <h3 style={{
              fontSize: 15, fontWeight: 'bold', margin: '0 0 12px',
              color: company.brand_color_primary || '#1a1a1a',
            }}>
              ブランドストーリー
            </h3>
            <p style={{
              fontSize: 13, color: '#333', lineHeight: 1.8, margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {company.brand_story}
            </p>
          </div>
        )}

        {/* 8. コーポレートサイトリンク */}
        {company?.website_url && (
          <a href={company.website_url} target="_blank" style={{
            display: 'block', textAlign: 'center', padding: '14px 0',
            backgroundColor: company.brand_color_primary || '#1a1a1a',
            borderRadius: 10, color: '#ffffff', textDecoration: 'none', fontSize: 14,
            fontWeight: 'bold', marginBottom: 16,
          }}>
            コーポレートサイトを見る →
          </a>
        )}

        {/* 9. QRコード */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
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

        {/* 10. フッター */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#999', marginTop: 16 }}>
          Powered by brandcommit
        </p>
      </div>
    </div>
  )
}
