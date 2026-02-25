'use client'

// ブランド方針 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type ValueItem = { name: string; description: string }
type HistoryItem = { year: string; event: string }
type BusinessItem = { title: string; description: string }
type TraitItem = { name: string; score: number; description: string }

type Guidelines = {
  slogan: string | null
  concept_visual_url: string | null
  brand_video_url: string | null
  brand_statement: string | null
  mission: string | null
  vision: string | null
  values: ValueItem[]
  brand_story: string | null
  history: HistoryItem[]
  business_content: BusinessItem[]
  traits: TraitItem[]
}

// YouTube URL をembedに変換
function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function PortalGuidelinesPage() {
  const { companyId } = usePortalAuth()
  const [data, setData] = useState<Guidelines | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('brand_guidelines')
      .select('*')
      .eq('company_id', companyId)
      .single()
      .then(({ data: d }) => {
        if (d) {
          setData({
            slogan: d.slogan,
            concept_visual_url: d.concept_visual_url,
            brand_video_url: d.brand_video_url,
            brand_statement: d.brand_statement,
            mission: d.mission,
            vision: d.vision,
            values: (d.values as ValueItem[]) || [],
            brand_story: d.brand_story,
            history: (d.history as HistoryItem[]) || [],
            business_content: (d.business_content as BusinessItem[]) || [],
            traits: (d.traits as TraitItem[]) || [],
          })
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) return <div className="text-center py-16 text-muted-foreground text-[15px]">読み込み中...</div>
  if (!data) return <div className="text-center py-16 text-muted-foreground text-[15px]">まだ登録されていません</div>

  // フィルター: 入力済みの特性のみ
  const filteredTraits = data.traits.filter(t => t.name && !t.name.match(/^特性\s?\d+$/))
  const chartData = filteredTraits.map(t => ({ name: t.name, score: t.score }))
  const radarConfig = {
    score: {
      label: 'スコア',
      color: 'hsl(217, 91%, 60%)',
    },
  } satisfies ChartConfig

  // フィルター: 入力済みのバリューのみ
  const filteredValues = data.values.filter(v => v.name)

  // フィルター: 入力済みの沿革のみ
  const filteredHistory = data.history.filter(h => h.year || h.event)

  // フィルター: 入力済みの事業内容のみ
  const filteredBusiness = data.business_content.filter(b => b.title)

  const embedUrl = data.brand_video_url ? getYouTubeEmbedUrl(data.brand_video_url) : null

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">ブランド方針</h1>
        <p className="text-sm text-muted-foreground">
          ブランドのビジョン・ミッション・バリューとメッセージ
        </p>
      </div>

      {/* 1. スローガン */}
      {data.slogan && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">スローガン</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-xl font-bold text-foreground m-0">{data.slogan}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 2. コンセプトビジュアル */}
      {data.concept_visual_url && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">コンセプトビジュアル</h2>
          <Card className="bg-muted/50 border shadow-none overflow-hidden">
            <CardContent className="p-4">
              <img
                src={data.concept_visual_url}
                alt="コンセプトビジュアル"
                className="w-full max-h-[400px] object-contain rounded-lg"
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* 3. ブランド動画 */}
      {data.brand_video_url && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ブランド動画</h2>
          <Card className="bg-muted/50 border shadow-none overflow-hidden">
            <CardContent className="p-4">
              {embedUrl ? (
                <div className="relative pb-[56.25%] h-0">
                  <iframe
                    src={embedUrl}
                    title="ブランド動画"
                    className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={data.brand_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm"
                >
                  {data.brand_video_url}
                </a>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* 4. メッセージ */}
      {data.brand_statement && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">メッセージ</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{data.brand_statement}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 5. ミッション */}
      {data.mission && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ミッション</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{data.mission}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 6. ビジョン */}
      {data.vision && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ビジョン</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{data.vision}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 7. バリュー */}
      {filteredValues.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">バリュー</h2>
          <div className="space-y-2">
            {filteredValues.map((v, i) => (
              <Card key={i} className="bg-muted/50 border shadow-none border-l-2 border-l-blue-600 rounded-lg">
                <CardContent className="p-4 flex gap-3">
                  <span className="text-xs font-mono text-muted-foreground tabular-nums pt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground">{v.name}</span>
                    {v.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1 m-0">
                        {v.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 8. ブランドストーリー */}
      {data.brand_story && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ブランドストーリー</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{data.brand_story}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 9. 沿革（タイムライン形式） */}
      {filteredHistory.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">沿革</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              {filteredHistory.map((item, i) => (
                <div key={i}>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-16 text-sm font-bold text-blue-600 relative pl-4">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-600" />
                      {item.year}
                    </div>
                    <div className="text-sm text-foreground leading-relaxed">
                      {item.event}
                    </div>
                  </div>
                  {i < filteredHistory.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* 10. 事業内容（カードグリッド） */}
      {filteredBusiness.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">事業内容</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBusiness.map((item, i) => (
              <Card key={i} className="bg-muted/50 border shadow-none">
                <CardContent className="p-5">
                  <p className="text-base font-bold text-foreground mb-1.5 m-0">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed m-0">
                      {item.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 11. ブランド特性（レーダーチャート＋リスト） */}
      {filteredTraits.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">ブランド特性</h2>

          {/* レーダーチャート（3つ以上の場合のみ） */}
          {chartData.length >= 3 && (
            <div className="w-full max-w-[400px] mx-auto mb-6">
              <ChartContainer config={radarConfig} className="aspect-square">
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} tickCount={6} />
                  <Radar
                    dataKey="score"
                    fill="var(--color-score)"
                    fillOpacity={0.2}
                    stroke="var(--color-score)"
                    strokeWidth={2}
                    dot={{ r: 4, fillOpacity: 1, fill: 'var(--color-score)' }}
                  />
                </RadarChart>
              </ChartContainer>
            </div>
          )}

          <div className="space-y-2">
            {filteredTraits.map((trait, i) => (
              <Card key={i} className="bg-muted/50 border shadow-none">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground mb-0.5 m-0">
                      {trait.name}
                    </p>
                    {trait.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed m-0">
                        {trait.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-bold">
                      {trait.score}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">/10</div>
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
