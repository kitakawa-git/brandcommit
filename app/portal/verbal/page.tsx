'use client'

// バーバルアイデンティティ 閲覧ページ（トーンオブボイス・コミュニケーションスタイル・用語ルール統合）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'

type Personality = {
  tone_of_voice: string | null
  communication_style: string | null
}

type Term = {
  preferred_term: string
  avoided_term: string
  context: string | null
}

export default function PortalVerbalIdentityPage() {
  const { companyId } = usePortalAuth()
  const [personality, setPersonality] = useState<Personality | null>(null)
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return

    Promise.all([
      supabase.from('brand_personalities').select('*').eq('company_id', companyId).single(),
      supabase.from('brand_terms').select('*').eq('company_id', companyId).order('sort_order'),
    ]).then(([pRes, tRes]) => {
      if (pRes.data) {
        setPersonality({
          tone_of_voice: pRes.data.tone_of_voice,
          communication_style: pRes.data.communication_style,
        })
      }
      if (tRes.data) {
        setTerms(tRes.data.map((d: Record<string, unknown>) => ({
          preferred_term: (d.preferred_term as string) || '',
          avoided_term: (d.avoided_term as string) || '',
          context: (d.context as string) || null,
        })))
      }
      setLoading(false)
    })
  }, [companyId])

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>

  const hasTone = personality?.tone_of_voice
  const hasStyle = personality?.communication_style
  const hasTerms = terms.length > 0

  if (!hasTone && !hasStyle && !hasTerms) {
    return <div style={portalStyles.empty}>まだ登録されていません</div>
  }

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>バーバルアイデンティティ</h1>
      <p style={portalStyles.pageDescription}>
        ブランドのトーン・コミュニケーションスタイル・用語ルール
      </p>

      {/* トーン */}
      {hasTone && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>トーン・オブ・ボイス</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{personality!.tone_of_voice}</div>
          </div>
        </div>
      )}

      {/* コミュニケーションスタイル */}
      {hasStyle && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>コミュニケーションスタイル</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{personality!.communication_style}</div>
          </div>
        </div>
      )}

      {/* 用語ルール */}
      {hasTerms && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>用語ルール</h2>
          <table style={portalStyles.table}>
            <thead>
              <tr>
                <th style={{ ...portalStyles.th, width: '30%' }}>推奨する表現</th>
                <th style={{ ...portalStyles.th, width: '30%' }}>避ける表現</th>
                <th style={portalStyles.th}>補足・文脈</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term, i) => (
                <tr key={i}>
                  <td style={{ ...portalStyles.td, fontWeight: 'bold', color: portalColors.success }}>
                    {term.preferred_term}
                  </td>
                  <td style={{ ...portalStyles.td, color: portalColors.danger, textDecoration: 'line-through' }}>
                    {term.avoided_term}
                  </td>
                  <td style={{ ...portalStyles.td, color: portalColors.textSecondary, fontSize: 13 }}>
                    {term.context || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
