'use client'

// ビジュアルアイデンティティ 閲覧ページ（ロゴセクション＋カラー＋フォント＋ガイドライン）
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalStyles } from '../components/PortalStyles'
import { cn } from '@/lib/utils'

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

  if (loading) return <div className={portalStyles.empty}>読み込み中...</div>
  if (!data) return <div className={portalStyles.empty}>まだ登録されていません</div>

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
    return (
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-lg border border-gray-200 shrink-0"
          style={{ backgroundColor: color }}
        />
        <div>
          <div className="text-sm font-bold text-gray-900 mb-0.5">{label}</div>
          <div className="text-[13px] text-gray-500 font-mono">HEX: {color.toUpperCase()}</div>
          <div className="text-[13px] text-gray-500 font-mono">RGB: {r}, {g}, {b}</div>
          <div className="text-[13px] text-gray-500 font-mono">HSL: {h}°, {s}%, {l}%</div>
        </div>
      </div>
    )
  }

  return (
    <div className={portalStyles.pageContainer}>
      <h1 className={portalStyles.pageTitle}>ビジュアルアイデンティティ</h1>
      <p className={portalStyles.pageDescription}>
        ロゴガイドライン・ブランドカラー・フォント規定
      </p>

      {/* ロゴコンセプト */}
      {data.logo_concept && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ロゴコンセプト</h2>
          <div className={portalStyles.card}>
            <div className={portalStyles.value}>{data.logo_concept}</div>
          </div>
        </div>
      )}

      {/* ロゴガイドライン */}
      {validSections.length > 0 && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ロゴガイドライン</h2>

          <div className={portalStyles.card}>
            {validSections.map((section, sIdx) => (
              <div key={sIdx} className={cn(
                sIdx < validSections.length - 1 && 'pb-5 mb-5 border-b border-gray-200'
              )}>
                {/* セクションタイトル */}
                {section.title && (
                  <h3 className="text-[15px] font-bold text-gray-900 mb-3">
                    {section.title}
                  </h3>
                )}

                {/* 画像グリッド */}
                <div className="grid grid-cols-3 gap-4">
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="text-center">
                      <div
                        onClick={() => setModalImage(item.url)}
                        className="p-4 flex items-center justify-center min-h-[120px] cursor-pointer"
                      >
                        <img
                          src={item.url}
                          alt={item.caption || ''}
                          className="max-w-full max-h-[140px] object-contain"
                        />
                      </div>
                      {item.caption && (
                        <div className="text-[13px] text-gray-500">
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
      <div className={portalStyles.section}>
        <h2 className={portalStyles.sectionTitle}>ブランドカラー</h2>
        <div className={portalStyles.card}>
          {colorSwatch(data.primary_color, 'プライマリカラー')}
          {colorSwatch(data.secondary_color, 'セカンダリカラー')}
          {colorSwatch(data.accent_color, 'アクセントカラー')}
        </div>
      </div>

      {/* フォント */}
      {(data.fonts.primary || data.fonts.secondary) && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>フォント</h2>
          <div className={portalStyles.card}>
            {data.fonts.primary && (
              <div className={data.fonts.secondary ? 'mb-3' : ''}>
                <div className={portalStyles.label}>プライマリフォント</div>
                <div className={portalStyles.value} style={{ fontFamily: data.fonts.primary }}>{data.fonts.primary}</div>
              </div>
            )}
            {data.fonts.secondary && (
              <div>
                <div className={portalStyles.label}>セカンダリフォント</div>
                <div className={portalStyles.value} style={{ fontFamily: data.fonts.secondary }}>{data.fonts.secondary}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ビジュアルガイドライン */}
      {data.visual_guidelines && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ビジュアルガイドライン</h2>
          <div className={portalStyles.card}>
            <div className={portalStyles.value}>{data.visual_guidelines}</div>
          </div>
        </div>
      )}

      {/* 画像拡大モーダル */}
      {modalImage && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 bg-transparent border-none text-white text-[32px] cursor-pointer leading-none"
          >
            ×
          </button>
          <img
            src={modalImage}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  )
}
