'use client'

// パーソナリティ 閲覧ページ（トーンオブボイス・コミュニケーションスタイルのみ）
// 特性（traits）・レーダーチャートはブランド方針ページに移動済み
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalStyles } from '../components/PortalStyles'

type Personality = {
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
            tone_of_voice: d.tone_of_voice,
            communication_style: d.communication_style,
          })
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>
  if (!data || (!data.tone_of_voice && !data.communication_style)) {
    return <div style={portalStyles.empty}>まだ登録されていません</div>
  }

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>ブランドパーソナリティ</h1>
      <p style={portalStyles.pageDescription}>
        ブランドのトーン・コミュニケーションスタイル
      </p>

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
