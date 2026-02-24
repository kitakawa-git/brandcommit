'use client'

// ブランド方針 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'

type Guidelines = {
  mission: string | null
  vision: string | null
  values: { name: string; description: string }[]
  slogan: string | null
  brand_statement: string | null
  brand_story: string | null
  brand_video_url: string | null
}

export default function PortalGuidelinesPage() {
  const { companyId } = usePortalAuth()
  const [data, setData] = useState<Guidelines | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('brand_guidelines')
      .select('*')
      .eq('company_id', companyId)
      .single()
      .then(({ data: d }) => {
        if (d) {
          setData({
            mission: d.mission,
            vision: d.vision,
            values: (d.values as { name: string; description: string }[]) || [],
            slogan: d.slogan,
            brand_statement: d.brand_statement,
            brand_story: d.brand_story,
            brand_video_url: d.brand_video_url,
          })
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) {
    return <div style={portalStyles.empty}>読み込み中...</div>
  }

  if (!data) {
    return <div style={portalStyles.empty}>まだ登録されていません</div>
  }

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>ブランド方針</h1>
      <p style={portalStyles.pageDescription}>
        企業のミッション・ビジョン・バリューとブランドメッセージ
      </p>

      {/* MVV */}
      <div style={portalStyles.section}>
        <h2 style={portalStyles.sectionTitle}>ミッション・ビジョン・バリュー</h2>

        {data.mission && (
          <div style={portalStyles.card}>
            <div style={portalStyles.label}>ミッション</div>
            <div style={portalStyles.value}>{data.mission}</div>
          </div>
        )}

        {data.vision && (
          <div style={portalStyles.card}>
            <div style={portalStyles.label}>ビジョン</div>
            <div style={portalStyles.value}>{data.vision}</div>
          </div>
        )}

        {data.values.length > 0 && (
          <div style={portalStyles.card}>
            <div style={portalStyles.label}>バリュー</div>
            <div style={{ marginTop: 8 }}>
              {data.values.map((v, i) => (
                <div key={i} style={{ marginBottom: i < data.values.length - 1 ? 12 : 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 'bold', color: portalColors.textPrimary }}>
                    {v.name}
                  </div>
                  {v.description && (
                    <div style={{ fontSize: 14, color: portalColors.textSecondary, marginTop: 2, lineHeight: 1.6 }}>
                      {v.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ブランドメッセージ */}
      {(data.slogan || data.brand_statement || data.brand_story) && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ブランドメッセージ</h2>

          {data.slogan && (
            <div style={portalStyles.card}>
              <div style={portalStyles.label}>スローガン</div>
              <div style={{ ...portalStyles.value, fontSize: 20, fontWeight: 'bold' }}>{data.slogan}</div>
            </div>
          )}

          {data.brand_statement && (
            <div style={portalStyles.card}>
              <div style={portalStyles.label}>ブランドステートメント</div>
              <div style={portalStyles.value}>{data.brand_statement}</div>
            </div>
          )}

          {data.brand_story && (
            <div style={portalStyles.card}>
              <div style={portalStyles.label}>ブランドストーリー</div>
              <div style={portalStyles.value}>{data.brand_story}</div>
            </div>
          )}
        </div>
      )}

      {/* 動画 */}
      {data.brand_video_url && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ブランド動画</h2>
          <div style={portalStyles.card}>
            <a
              href={data.brand_video_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: portalColors.primary, fontSize: 14 }}
            >
              {data.brand_video_url}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
