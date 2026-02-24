'use client'

// ブランドビジュアル 閲覧ページ（ロゴセクション＋カラー＋フォント＋ガイドライン）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'

type LogoItem = { url: string; caption: string }
type LogoSection = { title: string; items: LogoItem[] }

type Visuals = {
  primary_color: string
  secondary_color: string
  accent_color: string
  fonts: { primary: string; secondary: string }
  visual_guidelines: string | null
  logo_sections: LogoSection[]
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
            fonts: (d.fonts as { primary: string; secondary: string }) || { primary: '', secondary: '' },
            visual_guidelines: d.visual_guidelines,
            logo_sections: (d.logo_sections as LogoSection[]) || [],
          })
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>
  if (!data) return <div style={portalStyles.empty}>まだ登録されていません</div>

  // 画像があるセクションのみ表示
  const validSections = data.logo_sections.filter(s => s.items && s.items.length > 0)

  const colorSwatch = (color: string, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 8,
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
        ロゴガイドライン・ブランドカラー・フォント規定
      </p>

      {/* ロゴガイドライン */}
      {validSections.length > 0 && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ロゴガイドライン</h2>

          <div style={portalStyles.card}>
            {validSections.map((section, sIdx) => (
              <div key={sIdx} style={{
                paddingBottom: sIdx < validSections.length - 1 ? 20 : 0,
                marginBottom: sIdx < validSections.length - 1 ? 20 : 0,
                borderBottom: sIdx < validSections.length - 1 ? `1px solid ${portalColors.border}` : 'none',
              }}>
                {/* セクションタイトル */}
                {section.title && (
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: portalColors.textPrimary,
                    margin: '0 0 12px',
                  }}>
                    {section.title}
                  </h3>
                )}

                {/* 画像グリッド */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                }}>
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} style={{ textAlign: 'center' }}>
                      <div style={{
                        padding: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 120,
                      }}>
                        <img
                          src={item.url}
                          alt={item.caption || ''}
                          style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }}
                        />
                      </div>
                      {item.caption && (
                        <div style={{
                          fontSize: 13,
                          color: portalColors.textSecondary,
                        }}>
                          {item.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ブランドカラー */}
      <div style={portalStyles.section}>
        <h2 style={portalStyles.sectionTitle}>ブランドカラー</h2>
        <div style={portalStyles.card}>
          {colorSwatch(data.primary_color, 'プライマリカラー')}
          {colorSwatch(data.secondary_color, 'セカンダリカラー')}
          {colorSwatch(data.accent_color, 'アクセントカラー')}
        </div>
      </div>

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
