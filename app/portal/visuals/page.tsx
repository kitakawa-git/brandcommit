'use client'

// ビジュアルアイデンティティ 閲覧ページ（ロゴセクション＋カラー＋フォント＋ガイドライン）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchWithRetry } from '@/lib/supabase-fetch'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { getSubtitle } from '@/lib/portal-subtitles'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getPageCache, setPageCache } from '@/lib/page-cache'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { LayoutGrid, Columns3 } from 'lucide-react'
import Masonry from 'react-masonry-css'

type LogoItem = { url: string; caption: string; added_index?: number }
type LogoSection = { title: string; items: LogoItem[] }
type ColorItem = { name: string; hex: string }
type ColorPalette = {
  brand_colors: ColorItem[]
  secondary_colors: ColorItem[]
  accent_colors: ColorItem[]
  utility_colors: ColorItem[]
}

type ColorCategory = { key: keyof ColorPalette; label: string }

const COLOR_CATEGORIES: ColorCategory[] = [
  { key: 'brand_colors', label: 'プライマリカラー' },
  { key: 'secondary_colors', label: 'セカンダリカラー' },
  { key: 'accent_colors', label: 'アクセントカラー' },
  { key: 'utility_colors', label: 'ユーティリティカラー' },
]

type FontPair = { primary: string; secondary: string }
type Fonts = {
  latin: FontPair
  japanese: FontPair
}

type GuidelineImage = { url: string; caption: string; added_index?: number }

type Visuals = {
  fonts: Fonts
  visual_guidelines: string | null
  visual_guidelines_images: GuidelineImage[]
  visual_guidelines_sort: 'registered' | 'custom'
  logo_concept: string | null
  logo_sections: LogoSection[]
  logo_sections_sort: 'registered' | 'custom'
  color_palette: ColorPalette | null
}

export default function PortalVisualsPage() {
  const { companyId, portalSubtitles } = usePortalAuth()
  const cacheKey = `portal-visuals-${companyId}`
  const cached = companyId ? getPageCache<Visuals>(cacheKey) : null
  const [data, setData] = useState<Visuals | null>(cached)
  const [loading, setLoading] = useState(!cached)
  const [modalImage, setModalImage] = useState<string | null>(null)
  const [guidelineLayout, setGuidelineLayout] = useState<'grid' | 'masonry'>(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )guidelineLayout=(grid|masonry)/)
      if (match) return match[1] as 'grid' | 'masonry'
    }
    return 'grid'
  })

  const changeLayout = (layout: 'grid' | 'masonry') => {
    setGuidelineLayout(layout)
    document.cookie = `guidelineLayout=${layout}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  useEffect(() => {
    if (!companyId) return
    if (getPageCache<Visuals>(cacheKey)) return
    fetchWithRetry(() =>
      supabase
        .from('brand_visuals')
        .select('fonts, visual_guidelines, visual_guidelines_images, visual_guidelines_sort, logo_concept, logo_sections, logo_sections_sort, color_palette')
        .eq('company_id', companyId)
        .single()
    ).then(({ data: d }) => {
      if (d) {
        const rec = d as Record<string, unknown>
        const parsed: Visuals = {
          fonts: (() => {
            const raw = rec.fonts as Record<string, unknown> | null
            if (raw && raw.latin) return raw as unknown as Fonts
            return {
              latin: { primary: '', secondary: '' },
              japanese: { primary: (raw?.primary as string) || '', secondary: (raw?.secondary as string) || '' },
            }
          })(),
          visual_guidelines: (rec.visual_guidelines as string) || null,
          visual_guidelines_images: (rec.visual_guidelines_images as GuidelineImage[]) || [],
          visual_guidelines_sort: (rec.visual_guidelines_sort as 'registered' | 'custom') || 'registered',
          logo_concept: (rec.logo_concept as string) || null,
          logo_sections: (rec.logo_sections as LogoSection[]) || [],
          logo_sections_sort: (rec.logo_sections_sort as 'registered' | 'custom') || 'registered',
          color_palette: (rec.color_palette as ColorPalette) || null,
        }
        setData(parsed)
        setPageCache(cacheKey, parsed)
      }
      setLoading(false)
    })
  }, [companyId, cacheKey])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
        <CardContent className="p-5 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-36" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-[160px] w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
        <CardContent className="p-5">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-lg border border-border overflow-hidden bg-background">
                <Skeleton className="h-20 w-full" />
                <div className="p-3">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-40" />
        </CardContent>
      </Card>
    </div>
  )
  if (!data) return <div className="text-center py-16 text-muted-foreground text-[15px]">まだ登録されていません</div>

  // 画像があるセクションのみ表示
  const validSections = data.logo_sections.filter(s => s.items && s.items.length > 0)

  // ガイドライン画像のソート
  const sortedGuidelineImages = data.visual_guidelines_sort === 'custom'
    ? data.visual_guidelines_images
    : [...data.visual_guidelines_images].sort((a, b) => (a.added_index ?? 0) - (b.added_index ?? 0))

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

  // カラーパレットを構築
  const palette: ColorPalette = data.color_palette || {
    brand_colors: [],
    secondary_colors: [],
    accent_colors: [],
    utility_colors: [],
  }

  // 表示するカテゴリ（色が1つ以上あるもの）
  const visibleCategories = COLOR_CATEGORIES.filter(cat => palette[cat.key].length > 0)

  const colorCard = (color: ColorItem) => {
    const { r, g, b } = hexToRgb(color.hex)
    const { h, s, l } = rgbToHsl(r, g, b)
    return (
      <div className="rounded-lg border border-border overflow-hidden bg-background">
        <div
          className="h-20 w-full"
          style={{ backgroundColor: color.hex }}
        />
        <div className="p-3">
          <p className="text-sm font-bold text-foreground mb-0.5 m-0">{color.name || color.hex.toUpperCase()}</p>
          <p className="text-[11px] text-muted-foreground font-mono m-0 leading-relaxed">
            HEX: {color.hex.toUpperCase()}<br />
            RGB: {r}, {g}, {b}<br />
            HSL: {h}, {s}%, {l}%
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">ビジュアルアイデンティティ</h1>
        <p className="text-sm text-muted-foreground">
          {getSubtitle(portalSubtitles, 'visuals')}
        </p>
      </div>

      {/* 1. ロゴコンセプト＆ロゴガイドライン */}
      {(data.logo_concept || validSections.length > 0) && (
        <section>
          <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
            <CardContent className="p-5 space-y-4">
              {data.logo_concept && (
                <div>
                  <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ロゴコンセプト</h2>
                  <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{data.logo_concept}</p>
                </div>
              )}

              {validSections.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ロゴガイドライン</h2>
                  {validSections.map((section, sIdx) => (
                    <div key={sIdx}>
                      {sIdx > 0 && <Separator className="my-5" />}

                      {section.title && (
                        <h3 className="text-sm font-bold text-foreground mb-3 m-0">
                          {section.title}
                        </h3>
                      )}

                      <div className="grid grid-cols-3 gap-4">
                        {(data.logo_sections_sort === 'custom'
                          ? section.items
                          : [...section.items].sort((a, b) => (a.added_index ?? 0) - (b.added_index ?? 0))
                        ).map((item, iIdx) => (
                          <div key={iIdx} className="text-center">
                            <div
                              onClick={() => setModalImage(item.url)}
                              className="h-[160px] cursor-pointer rounded-lg hover:bg-muted transition-colors overflow-hidden"
                            >
                              <img
                                src={item.url}
                                alt={item.caption || ''}
                                className="w-full h-full object-cover rounded-lg"
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
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* 2. ブランドカラー */}
      {visibleCategories.length > 0 && (
        <section>
          <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ブランドカラー</h2>

              {visibleCategories.map((cat, catIdx) => (
                <div key={cat.key}>
                  {catIdx > 0 && <Separator className="my-5" />}
                  <h3 className="text-sm font-bold text-foreground mb-3 m-0">
                    {cat.label}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {palette[cat.key].map((color, cIdx) => (
                      <div key={cIdx}>
                        {colorCard(color)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* 3. フォント */}
      {(data.fonts.latin.primary || data.fonts.latin.secondary || data.fonts.japanese.primary || data.fonts.japanese.secondary) && (
        <section>
          <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">フォント</h2>

              {(data.fonts.latin.primary || data.fonts.latin.secondary) && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 m-0">欧文</h3>
                  {data.fonts.latin.primary && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-0.5 m-0">プライマリフォント</p>
                      <p className="text-lg text-foreground m-0" style={{ fontFamily: data.fonts.latin.primary }}>
                        {data.fonts.latin.primary}
                      </p>
                    </div>
                  )}
                  {data.fonts.latin.secondary && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5 m-0">セカンダリフォント</p>
                      <p className="text-lg text-foreground m-0" style={{ fontFamily: data.fonts.latin.secondary }}>
                        {data.fonts.latin.secondary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(data.fonts.latin.primary || data.fonts.latin.secondary) && (data.fonts.japanese.primary || data.fonts.japanese.secondary) && (
                <Separator className="my-5" />
              )}

              {(data.fonts.japanese.primary || data.fonts.japanese.secondary) && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 m-0">和文</h3>
                  {data.fonts.japanese.primary && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-0.5 m-0">プライマリフォント</p>
                      <p className="text-lg text-foreground m-0" style={{ fontFamily: data.fonts.japanese.primary }}>
                        {data.fonts.japanese.primary}
                      </p>
                    </div>
                  )}
                  {data.fonts.japanese.secondary && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5 m-0">セカンダリフォント</p>
                      <p className="text-lg text-foreground m-0" style={{ fontFamily: data.fonts.japanese.secondary }}>
                        {data.fonts.japanese.secondary}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* 4. ビジュアルガイドライン */}
      {(data.visual_guidelines || data.visual_guidelines_images.length > 0) && (
        <section>
          <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground tracking-wide">ビジュアルガイドライン</h2>
                {data.visual_guidelines_images.length > 0 && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => changeLayout('grid')}
                      className={`p-1.5 rounded transition-colors ${guidelineLayout === 'grid' ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => changeLayout('masonry')}
                      className={`p-1.5 rounded transition-colors ${guidelineLayout === 'masonry' ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Columns3 size={16} />
                    </button>
                  </div>
                )}
              </div>
              {data.visual_guidelines && (
                <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{data.visual_guidelines}</p>
              )}
              {sortedGuidelineImages.length > 0 && guidelineLayout === 'grid' && (
                <div className={`grid grid-cols-3 gap-4 ${data.visual_guidelines ? 'mt-4' : ''}`}>
                  {sortedGuidelineImages.map((img, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        onClick={() => setModalImage(img.url)}
                        className="h-[160px] cursor-pointer rounded-lg hover:bg-muted transition-colors overflow-hidden"
                      >
                        <img
                          src={img.url}
                          alt={img.caption || ''}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {img.caption && (
                        <p className="text-xs text-muted-foreground mt-1.5 m-0">{img.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {sortedGuidelineImages.length > 0 && guidelineLayout === 'masonry' && (
                <Masonry
                  breakpointCols={3}
                  className={`flex gap-4 ${data.visual_guidelines ? 'mt-4' : ''}`}
                  columnClassName="flex flex-col gap-4"
                >
                  {sortedGuidelineImages.map((img, idx) => (
                    <div key={idx} className="text-center">
                      <div
                        onClick={() => setModalImage(img.url)}
                        className="cursor-pointer rounded-lg hover:bg-muted transition-colors"
                      >
                        <img
                          src={img.url}
                          alt={img.caption || ''}
                          className="w-full rounded-lg"
                        />
                      </div>
                      {img.caption && (
                        <p className="text-xs text-muted-foreground mt-1.5 m-0">{img.caption}</p>
                      )}
                    </div>
                  ))}
                </Masonry>
              )}
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
