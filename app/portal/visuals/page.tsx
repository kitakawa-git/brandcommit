'use client'

// ビジュアルアイデンティティ 閲覧ページ（ロゴセクション＋カラー＋フォント＋ガイドライン）
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

  if (loading) return <div className="text-center py-16 text-muted-foreground text-[15px]">読み込み中...</div>
  if (!data) return <div className="text-center py-16 text-muted-foreground text-[15px]">まだ登録されていません</div>

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
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-lg border border-border shrink-0"
          style={{ backgroundColor: color }}
        />
        <div>
          <p className="text-sm font-bold text-foreground mb-0.5 m-0">{label}</p>
          <p className="text-xs text-muted-foreground font-mono m-0">
            HEX: {color.toUpperCase()} · RGB: {r}, {g}, {b} · HSL: {h}°, {s}%, {l}%
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">ビジュアルアイデンティティ</h1>
        <p className="text-sm text-muted-foreground">
          ロゴガイドライン・ブランドカラー・フォント規定
        </p>
      </div>

      {/* 1. ロゴコンセプト */}
      {data.logo_concept && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ロゴコンセプト</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{data.logo_concept}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 2. ロゴガイドライン */}
      {validSections.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ロゴガイドライン</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              {validSections.map((section, sIdx) => (
                <div key={sIdx}>
                  {sIdx > 0 && <Separator className="my-5" />}

                  {section.title && (
                    <h3 className="text-sm font-bold text-foreground mb-3 m-0">
                      {section.title}
                    </h3>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="text-center">
                        <div
                          onClick={() => setModalImage(item.url)}
                          className="p-3 flex items-center justify-center min-h-[100px] cursor-pointer rounded-lg hover:bg-muted transition-colors"
                        >
                          <img
                            src={item.url}
                            alt={item.caption || ''}
                            className="max-w-full max-h-[140px] object-contain"
                          />
                        </div>
                        {item.caption && (
                          <p className="text-xs text-muted-foreground mt-1.5 m-0">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* 3. ブランドカラー */}
      <section>
        <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ブランドカラー</h2>
        <Card className="bg-muted/50 border shadow-none">
          <CardContent className="p-5 space-y-4">
            {colorSwatch(data.primary_color, 'プライマリカラー')}
            <Separator />
            {colorSwatch(data.secondary_color, 'セカンダリカラー')}
            <Separator />
            {colorSwatch(data.accent_color, 'アクセントカラー')}
          </CardContent>
        </Card>
      </section>

      {/* 4. フォント */}
      {(data.fonts.primary || data.fonts.secondary) && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">フォント</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5 space-y-4">
              {data.fonts.primary && (
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 m-0">
                    プライマリフォント
                  </p>
                  <p
                    className="text-lg text-foreground m-0"
                    style={{ fontFamily: data.fonts.primary }}
                  >
                    {data.fonts.primary}
                  </p>
                </div>
              )}
              {data.fonts.primary && data.fonts.secondary && <Separator />}
              {data.fonts.secondary && (
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 m-0">
                    セカンダリフォント
                  </p>
                  <p
                    className="text-lg text-foreground m-0"
                    style={{ fontFamily: data.fonts.secondary }}
                  >
                    {data.fonts.secondary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* 5. ビジュアルガイドライン */}
      {data.visual_guidelines && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ビジュアルガイドライン</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{data.visual_guidelines}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 画像拡大ダイアログ */}
      <Dialog open={!!modalImage} onOpenChange={(open) => { if (!open) setModalImage(null) }}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">画像拡大表示</DialogTitle>
          {modalImage && (
            <img
              src={modalImage}
              alt="拡大表示"
              className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
