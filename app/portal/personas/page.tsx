'use client'

// 顧客ペルソナ 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'

type Persona = {
  name: string
  age_range: string | null
  occupation: string | null
  description: string | null
  needs: string[]
  pain_points: string[]
}

export default function PortalPersonasPage() {
  const { companyId } = usePortalAuth()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('brand_personas')
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order')
      .then(({ data }) => {
        if (data) {
          setPersonas(data.map((d: Record<string, unknown>) => ({
            name: (d.name as string) || '',
            age_range: (d.age_range as string) || null,
            occupation: (d.occupation as string) || null,
            description: (d.description as string) || null,
            needs: (d.needs as string[]) || [],
            pain_points: (d.pain_points as string[]) || [],
          })))
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>
  if (personas.length === 0) return <div style={portalStyles.empty}>まだ登録されていません</div>

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>顧客ペルソナ</h1>
      <p style={portalStyles.pageDescription}>
        ターゲット顧客の人物像・ニーズ・課題
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {personas.map((persona, i) => (
          <div key={i} style={portalStyles.card}>
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 4px' }}>
                {persona.name}
              </h3>
              <div style={{ fontSize: 13, color: portalColors.textSecondary }}>
                {[persona.age_range, persona.occupation].filter(Boolean).join(' / ')}
              </div>
            </div>

            {persona.description && (
              <div style={{ fontSize: 14, color: portalColors.textPrimary, lineHeight: 1.7, marginBottom: 16 }}>
                {persona.description}
              </div>
            )}

            {persona.needs.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ ...portalStyles.label, marginBottom: 8 }}>ニーズ</div>
                {persona.needs.map((need, ni) => (
                  <div key={ni} style={portalStyles.tag}>
                    {need}
                  </div>
                ))}
              </div>
            )}

            {persona.pain_points.length > 0 && (
              <div>
                <div style={{ ...portalStyles.label, marginBottom: 8 }}>課題</div>
                {persona.pain_points.map((point, pi) => (
                  <div key={pi} style={{
                    ...portalStyles.tag,
                    backgroundColor: '#fef2f2',
                    borderColor: '#fecaca',
                    color: portalColors.danger,
                  }}>
                    {point}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
