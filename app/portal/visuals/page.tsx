'use client'

// ブランドビジュアル 閲覧ページ（ロゴセクション＋カラー＋フォント＋ガイドライン）
import { useEffect, useState, useCallback } from 'react'
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
  logo_concept: string | null
  logo_sections: LogoSection[]
}

export default function PortalVisualsPage() {
  const { companyId } = usePortalAuth()
  const [data, setData] = useState<Visuals | null>(null)
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
            logo_concept: d.logo_concept || null,
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

  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return { r, g, b }
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    const rn = r / 255, gn = g / 255, bn = b / 255
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
    const l = (max + min) / 2
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const colorSwatch = (color: string, label: string) => {
    const { r, g, b } = hexToRgb(color)
    const { h, s, l } = rgbToHsl(r, g, b)
    const monoStyle: React.CSSProperties = { fontSize: 13, color: portalColors.textSecondary, fontFamily: 'monospace' }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 8,
          backgroundColor: color,
          border: `1px solid ${portalColors.border}`,
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 2 }}>{label}</div>
          <div style={monoStyle}>HEX: {color.toUpperCase()}</div>
          <div style={monoStyle}>RGB: {r}, {g}, {b}</div>
          <div style={monoStyle}>HSL: {h}°, {s}%, {l}%</div>
        </div>
      </div>
    )
  }

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>ブランドビジュアル</h1>
      <p style={portalStyles.pageDescription}>
        ロゴガイドライン・ブランドカラー・フォント規定
      </p>

      {/* ロゴコンセプト */}
      {data.logo_concept && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ロゴコンセプト</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.logo_concept}</div>
          </div>
        </div>
      )}

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
                      <div
                        onClick={() => setModalImage(item.url)}
                        style={{
                          padding: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 120,
                          cursor: 'pointer',
                        }}
                      >
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

      {/* 画像拡大モーダル */}
      {modalImage && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: 16, right: 16,
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: 32,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
          <img
            src={modalImage}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  )
}
