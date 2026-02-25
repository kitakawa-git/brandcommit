'use client'

// ブランド戦略 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const [modalOpen, setModalOpen] = useState(false)

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

  if (loading) return <div className="text-center py-16 text-muted-foreground text-[15px]">読み込み中...</div>

  const hasContent = target || personas.some(p => p.name) || positioningMapUrl || actionGuidelines.length > 0
  if (!hasContent) return <div className="text-center py-16 text-muted-foreground text-[15px]">まだ登録されていません</div>

  const validPersonas = personas.filter(p => p.name)

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">ブランド戦略</h1>
        <p className="text-sm text-muted-foreground">
          ターゲット・ペルソナ・ポジショニング・行動指針
        </p>
      </div>

      {/* 1. ターゲット */}
      {target && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ターゲット</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{target}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 2. ペルソナ */}
      {validPersonas.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ペルソナ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {validPersonas.map((persona, i) => (
              <Card key={i} className="bg-muted/50 border shadow-none">
                <CardContent className="p-5">
                  <div className="mb-3">
                    <p className="text-base font-bold text-foreground mb-0.5 m-0">
                      {persona.name}
                    </p>
                    <p className="text-xs text-muted-foreground m-0">
                      {[persona.age_range, persona.occupation].filter(Boolean).join(' / ')}
                    </p>
                  </div>

                  {persona.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 m-0">
                      {persona.description}
                    </p>
                  )}

                  {persona.needs.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 m-0">ニーズ</p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.needs.map((need, ni) => (
                          <span key={ni} className="inline-block px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700">
                            {need}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {persona.pain_points.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 m-0">課題</p>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.pain_points.map((point, pi) => (
                          <span key={pi} className="inline-block px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-red-600">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 3. ポジショニングマップ */}
      {positioningMapUrl && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ポジショニングマップ</h2>
          <Card className="bg-muted/50 border shadow-none overflow-hidden">
            <CardContent className="p-4">
              <img
                src={positioningMapUrl}
                alt="ポジショニングマップ"
                onClick={() => setModalOpen(true)}
                className="w-full max-h-[400px] object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              />
            </CardContent>
          </Card>

          {/* 画像拡大ダイアログ */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-transparent border-none shadow-none">
              <DialogTitle className="sr-only">ポジショニングマップ拡大表示</DialogTitle>
              <img
                src={positioningMapUrl}
                alt="ポジショニングマップ 拡大表示"
                className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
              />
            </DialogContent>
          </Dialog>
        </section>
      )}

      {/* 4. 行動指針 */}
      {actionGuidelines.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">行動指針</h2>
          <div className="space-y-2">
            {actionGuidelines.map((g, i) => (
              <Card key={i} className="bg-muted/50 border shadow-none border-l-2 border-l-blue-600 rounded-lg">
                <CardContent className="p-4 flex gap-3">
                  <span className="text-xs font-mono text-muted-foreground tabular-nums pt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground">{g.title}</span>
                    {g.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1 m-0">
                        {g.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
