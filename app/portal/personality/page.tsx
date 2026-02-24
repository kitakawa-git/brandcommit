'use client'

// パーソナリティ 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'

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

  // 未入力の特性を除外（デフォルト値「特性 1」等、空文字を除外）
  const filteredTraits = data.traits.filter(
    t => t.name && !t.name.match(/^特性\s?\d+$/)
  )

  // レーダーチャート用データ
  const chartData = filteredTraits.map(t => ({
    name: t.name,
    score: t.score,
  }))

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>ブランドパーソナリティ</h1>
      <p style={portalStyles.pageDescription}>
        ブランドの特性・トーン・コミュニケーションスタイル
      </p>

      {/* 特性 */}
      {filteredTraits.length > 0 && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>パーソナリティ特性</h2>

          {/* レーダーチャート（3つ以上の特性がある場合のみ表示） */}
          {chartData.length >= 3 && (
            <div style={{
              width: '100%',
              maxWidth: 400,
              margin: '0 auto 24px',
              aspectRatio: '1',
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: portalColors.textSecondary }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fontSize: 10, fill: portalColors.textMuted }}
                    tickCount={6}
                  />
                  <Radar
                    dataKey="score"
                    stroke={portalColors.primary}
                    fill={portalColors.primary}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {filteredTraits.map((trait, i) => (
            <div key={i} style={{ ...portalStyles.card, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 4 }}>
                  {trait.name}
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
