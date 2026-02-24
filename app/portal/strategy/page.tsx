'use client'

// ブランド戦略 閲覧ページ
import { useEffect, useState, useCallback } from 'react'
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

type ActionGuideline = {
  title: string
  description: string
}

export default function PortalStrategyPage() {
  const { companyId } = usePortalAuth()
  const [target, setTarget] = useState('')
  const [personas, setPersonas] = useState<Persona[]>([])
  const [positioningMapUrl, setPositioningMapUrl] = useState('')
  const [actionGuidelines, setActionGuidelines] = useState<ActionGuideline[]>([])
  const [loading, setLoading] = useState(true)
  const [modalImage, setModalImage] = useState<string | null>(null)

  const closeModal = useCallback(() => setModalImage(null), [])

  useEffect(() => {
    if (!modalImage) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [modalImage, closeModal])

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('brand_personas')
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          const first = data[0] as Record<string, unknown>
          setTarget((first.target as string) || '')
          setPositioningMapUrl((first.positioning_map_url as string) || '')
          setActionGuidelines((first.action_guidelines as ActionGuideline[]) || [])

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

  const hasContent = target || personas.some(p => p.name) || positioningMapUrl || actionGuidelines.length > 0
  if (!hasContent) return <div style={portalStyles.empty}>まだ登録されていません</div>

  // ペルソナは名前があるものだけ表示
  const validPersonas = personas.filter(p => p.name)

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>ブランド戦略</h1>
      <p style={portalStyles.pageDescription}>
        ターゲット・ペルソナ・ポジショニング・行動指針
      </p>

      {/* ===== ターゲット ===== */}
      {target && (
        <div style={{ ...portalStyles.card, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 12px' }}>
            ターゲット
          </h3>
          <div style={{
            fontSize: 14,
            color: portalColors.textPrimary,
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
          }}>
            {target}
          </div>
        </div>
      )}

      {/* ===== ペルソナ ===== */}
      {validPersonas.length > 0 && (
        <h3 style={{ fontSize: 16, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 12px' }}>
          ペルソナ
        </h3>
      )}
      {validPersonas.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}>
          {validPersonas.map((persona, i) => (
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
      )}

      {/* ===== ポジショニングマップ ===== */}
      {positioningMapUrl && (
        <h3 style={{ fontSize: 16, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 12px' }}>
          ポジショニングマップ
        </h3>
      )}
      {positioningMapUrl && (
        <div style={{ ...portalStyles.card, marginBottom: 16 }}>
          <img
            src={positioningMapUrl}
            alt="ポジショニングマップ"
            onClick={() => setModalImage(positioningMapUrl)}
            style={{
              maxWidth: '100%',
              maxHeight: 400,
              borderRadius: 8,
              border: `1px solid ${portalColors.cardBorder}`,
              cursor: 'pointer',
            }}
          />
        </div>
      )}

      {/* ===== 行動指針 ===== */}
      {actionGuidelines.length > 0 && (
        <h3 style={{ fontSize: 16, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 12px' }}>
          行動指針
        </h3>
      )}
      {actionGuidelines.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {actionGuidelines.map((g, i) => (
            <div key={i} style={portalStyles.card}>
              <h4 style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: portalColors.textPrimary,
                margin: '0 0 8px',
              }}>
                {g.title}
              </h4>
              <p style={{
                fontSize: 14,
                color: portalColors.textSecondary,
                margin: 0,
                lineHeight: 1.7,
              }}>
                {g.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ===== 画像モーダル ===== */}
      {modalImage && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer',
          }}
        >
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={modalImage}
              alt="拡大表示"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: 8,
              }}
            />
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                fontSize: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
