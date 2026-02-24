'use client'

// パーソナリティ 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'

type Personality = {
  traits: { name: string; score: number; description: string }[]
  tone_of_voice: string | null
  communication_style: string | null
}

export default function PortalPersonalityPage() {
  const { companyId } = usePortalAuth()
  const [data, setData] = useState<Personality | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('brand_personalities')
      .select('*')
      .eq('company_id', companyId)
      .single()
      .then(({ data: d }) => {
        if (d) {
          setData({
            traits: (d.traits as { name: string; score: number; description: string }[]) || [],
            tone_of_voice: d.tone_of_voice,
            communication_style: d.communication_style,
          })
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>
  if (!data) return <div style={portalStyles.empty}>まだ登録されていません</div>

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>ブランドパーソナリティ</h1>
      <p style={portalStyles.pageDescription}>
        ブランドの特性・トーン・コミュニケーションスタイル
      </p>

      {/* 特性 */}
      {data.traits.length > 0 && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>パーソナリティ特性</h2>
          {data.traits.map((trait, i) => (
            <div key={i} style={{ ...portalStyles.card, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 4 }}>
                  {trait.name || `特性 ${i + 1}`}
                </div>
                {trait.description && (
                  <div style={{ fontSize: 13, color: portalColors.textSecondary, lineHeight: 1.5 }}>
                    {trait.description}
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: portalColors.primary,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                  {trait.score}
                </div>
                <div style={{ fontSize: 10, color: portalColors.textMuted, marginTop: 4 }}>/10</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* トーン */}
      {data.tone_of_voice && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>トーン・オブ・ボイス</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.tone_of_voice}</div>
          </div>
        </div>
      )}

      {/* コミュニケーションスタイル */}
      {data.communication_style && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>コミュニケーションスタイル</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.communication_style}</div>
          </div>
        </div>
      )}
    </div>
  )
}
