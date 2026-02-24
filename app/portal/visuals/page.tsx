'use client'

// ブランドビジュアル 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'

type Visuals = {
  primary_color: string
  secondary_color: string
  accent_color: string
  logo_url: string | null
  logo_white_url: string | null
  logo_dark_url: string | null
  logo_usage_rules: string | null
  fonts: { primary: string; secondary: string }
  visual_guidelines: string | null
}

export default function PortalVisualsPage() {
  const { companyId } = usePortalAuth()
  const [data, setData] = useState<Visuals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('brand_visuals')
      .select('*')
      .eq('company_id', companyId)
      .single()
      .then(({ data: d }) => {
        if (d) {
          setData({
            primary_color: d.primary_color || '#2563eb',
            secondary_color: d.secondary_color || '#64748b',
            accent_color: d.accent_color || '#f59e0b',
            logo_url: d.logo_url,
            logo_white_url: d.logo_white_url,
            logo_dark_url: d.logo_dark_url,
            logo_usage_rules: d.logo_usage_rules,
            fonts: (d.fonts as { primary: string; secondary: string }) || { primary: '', secondary: '' },
            visual_guidelines: d.visual_guidelines,
          })
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>
  if (!data) return <div style={portalStyles.empty}>まだ登録されていません</div>

  const colorSwatch = (color: string, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: color,
        border: `1px solid ${portalColors.border}`,
        flexShrink: 0,
      }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: portalColors.textPrimary }}>{label}</div>
        <div style={{ fontSize: 13, color: portalColors.textSecondary, fontFamily: 'monospace' }}>{color}</div>
      </div>
    </div>
  )

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>ブランドビジュアル</h1>
      <p style={portalStyles.pageDescription}>
        ブランドカラー・ロゴ・フォント規定
      </p>

      {/* カラー */}
      <div style={portalStyles.section}>
        <h2 style={portalStyles.sectionTitle}>ブランドカラー</h2>
        <div style={portalStyles.card}>
          {colorSwatch(data.primary_color, 'プライマリカラー')}
          {colorSwatch(data.secondary_color, 'セカンダリカラー')}
          {colorSwatch(data.accent_color, 'アクセントカラー')}
        </div>
      </div>

      {/* ロゴ */}
      {(data.logo_url || data.logo_white_url || data.logo_dark_url) && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ロゴ</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {data.logo_url && (
              <div style={{ ...portalStyles.card, flex: '1 1 200px', textAlign: 'center' }}>
                <div style={portalStyles.label}>標準ロゴ</div>
                <img src={data.logo_url} alt="標準ロゴ" style={{ maxWidth: '100%', maxHeight: 120, marginTop: 8 }} />
              </div>
            )}
            {data.logo_white_url && (
              <div style={{ ...portalStyles.card, flex: '1 1 200px', textAlign: 'center', backgroundColor: '#374151' }}>
                <div style={{ ...portalStyles.label, color: '#d1d5db' }}>白ロゴ</div>
                <img src={data.logo_white_url} alt="白ロゴ" style={{ maxWidth: '100%', maxHeight: 120, marginTop: 8 }} />
              </div>
            )}
            {data.logo_dark_url && (
              <div style={{ ...portalStyles.card, flex: '1 1 200px', textAlign: 'center' }}>
                <div style={portalStyles.label}>ダークロゴ</div>
                <img src={data.logo_dark_url} alt="ダークロゴ" style={{ maxWidth: '100%', maxHeight: 120, marginTop: 8 }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ロゴ使用ルール */}
      {data.logo_usage_rules && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ロゴ使用ルール</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.logo_usage_rules}</div>
          </div>
        </div>
      )}

      {/* フォント */}
      {(data.fonts.primary || data.fonts.secondary) && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>フォント</h2>
          <div style={portalStyles.card}>
            {data.fonts.primary && (
              <div style={{ marginBottom: data.fonts.secondary ? 12 : 0 }}>
                <div style={portalStyles.label}>プライマリフォント</div>
                <div style={{ ...portalStyles.value, fontFamily: data.fonts.primary }}>{data.fonts.primary}</div>
              </div>
            )}
            {data.fonts.secondary && (
              <div>
                <div style={portalStyles.label}>セカンダリフォント</div>
                <div style={{ ...portalStyles.value, fontFamily: data.fonts.secondary }}>{data.fonts.secondary}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ビジュアルガイドライン */}
      {data.visual_guidelines && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ビジュアルガイドライン</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.visual_guidelines}</div>
          </div>
        </div>
      )}
    </div>
  )
}
