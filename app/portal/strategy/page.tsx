'use client'

// ブランド戦略 閲覧ページ
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalStyles } from '../components/PortalStyles'
import { cn } from '@/lib/utils'

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

  if (loading) return <div className={portalStyles.empty}>読み込み中...</div>

  const hasContent = target || personas.some(p => p.name) || positioningMapUrl || actionGuidelines.length > 0
  if (!hasContent) return <div className={portalStyles.empty}>まだ登録されていません</div>

  // ペルソナは名前があるものだけ表示
  const validPersonas = personas.filter(p => p.name)

  return (
    <div className={portalStyles.pageContainer}>
      <h1 className={portalStyles.pageTitle}>ブランド戦略</h1>
      <p className={portalStyles.pageDescription}>
        ターゲット・ペルソナ・ポジショニング・行動指針
      </p>

      {/* ===== ターゲット ===== */}
      {target && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ターゲット</h2>
          <div className={portalStyles.card}>
            <div className={cn(portalStyles.value, 'whitespace-pre-wrap')}>{target}</div>
          </div>
        </div>
      )}

      {/* ===== ペルソナ ===== */}
      {validPersonas.length > 0 && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ペルソナ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validPersonas.map((persona, i) => (
              <div key={i} className={portalStyles.card}>
                <div className="mb-3">
                  <div className="text-base font-bold text-gray-900 mb-1">
                    {persona.name}
                  </div>
                  <div className="text-[13px] text-gray-500">
                    {[persona.age_range, persona.occupation].filter(Boolean).join(' / ')}
                  </div>
                </div>

                {persona.description && (
                  <div className="text-sm text-gray-500 leading-relaxed mb-4">
                    {persona.description}
                  </div>
                )}

                {persona.needs.length > 0 && (
                  <div className="mb-3">
                    <div className={cn(portalStyles.label, 'mb-2')}>ニーズ</div>
                    {persona.needs.map((need, ni) => (
                      <span key={ni} className={portalStyles.tag}>
                        {need}
                      </span>
                    ))}
                  </div>
                )}

                {persona.pain_points.length > 0 && (
                  <div>
                    <div className={cn(portalStyles.label, 'mb-2')}>課題</div>
                    {persona.pain_points.map((point, pi) => (
                      <span key={pi} className="inline-block px-3 py-1 bg-red-50 border border-red-200 rounded-full text-[13px] text-red-600 mr-2 mb-2">
                        {point}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ポジショニングマップ ===== */}
      {positioningMapUrl && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ポジショニングマップ</h2>
          <div className={portalStyles.card}>
            <img
              src={positioningMapUrl}
              alt="ポジショニングマップ"
              onClick={() => setModalImage(positioningMapUrl)}
              className="max-w-full max-h-[400px] rounded-lg border border-gray-200 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ===== 行動指針 ===== */}
      {actionGuidelines.length > 0 && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>行動指針</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionGuidelines.map((g, i) => (
              <div key={i} className={portalStyles.card}>
                <div className="text-base font-bold text-gray-900 mb-2">
                  {g.title}
                </div>
                <div className="text-sm text-gray-500 leading-relaxed">
                  {g.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 画像モーダル ===== */}
      {modalImage && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] cursor-pointer"
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={modalImage}
              alt="拡大表示"
              className="max-w-[90vw] max-h-[90vh] rounded-lg"
            />
            <button
              onClick={closeModal}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-gray-300 text-lg cursor-pointer flex items-center justify-center leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
