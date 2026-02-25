'use client'

// ブランド方針 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'
import { cn } from '@/lib/utils'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'

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

  if (loading) return <div className={portalStyles.empty}>読み込み中...</div>
  if (!data) return <div className={portalStyles.empty}>まだ登録されていません</div>

  // フィルター: 入力済みの特性のみ
  const filteredTraits = data.traits.filter(t => t.name && !t.name.match(/^特性\s?\d+$/))
  const chartData = filteredTraits.map(t => ({ name: t.name, score: t.score }))

  // フィルター: 入力済みのバリューのみ
  const filteredValues = data.values.filter(v => v.name)

  // フィルター: 入力済みの沿革のみ
  const filteredHistory = data.history.filter(h => h.year || h.event)

  // フィルター: 入力済みの事業内容のみ
  const filteredBusiness = data.business_content.filter(b => b.title)

  const embedUrl = data.brand_video_url ? getYouTubeEmbedUrl(data.brand_video_url) : null

  return (
    <div className={portalStyles.pageContainer}>
      <h1 className={portalStyles.pageTitle}>ブランド方針</h1>
      <p className={portalStyles.pageDescription}>
        ブランドのビジョン・ミッション・バリューとメッセージ
      </p>

      {/* 1. スローガン */}
      {data.slogan && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>スローガン</h2>
          <div className={portalStyles.card}>
            <div className={cn(portalStyles.value, 'text-xl font-bold')}>{data.slogan}</div>
          </div>
        </div>
      )}

      {/* 2. コンセプトビジュアル */}
      {data.concept_visual_url && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>コンセプトビジュアル</h2>
          <div className={portalStyles.card}>
            <img
              src={data.concept_visual_url}
              alt="コンセプトビジュアル"
              className="w-full max-h-[400px] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* 3. ブランド動画 */}
      {data.brand_video_url && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ブランド動画</h2>
          <div className={portalStyles.card}>
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
          </div>
        </div>
      )}

      {/* 4. メッセージ */}
      {data.brand_statement && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>メッセージ</h2>
          <div className={portalStyles.card}>
            <div className={portalStyles.value}>{data.brand_statement}</div>
          </div>
        </div>
      )}

      {/* 5. ミッション */}
      {data.mission && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ミッション</h2>
          <div className={portalStyles.card}>
            <div className={portalStyles.value}>{data.mission}</div>
          </div>
        </div>
      )}

      {/* 6. ビジョン */}
      {data.vision && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ビジョン</h2>
          <div className={portalStyles.card}>
            <div className={portalStyles.value}>{data.vision}</div>
          </div>
        </div>
      )}

      {/* 7. バリュー */}
      {filteredValues.length > 0 && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>バリュー</h2>
          <div className={portalStyles.card}>
            <div className="flex flex-wrap gap-2">
              {filteredValues.map((v, i) => (
                <div key={i} className="mb-3">
                  <span className={portalStyles.tag}>{v.name}</span>
                  {v.description && (
                    <div className="text-[13px] text-gray-500 mt-1 pl-1">
                      {v.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. ブランドストーリー */}
      {data.brand_story && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ブランドストーリー</h2>
          <div className={portalStyles.card}>
            <div className={portalStyles.value}>{data.brand_story}</div>
          </div>
        </div>
      )}

      {/* 9. 沿革（タイムライン形式） */}
      {filteredHistory.length > 0 && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>沿革</h2>
          <div className={portalStyles.card}>
            {filteredHistory.map((item, i) => (
              <div key={i} className={cn(
                'flex gap-4',
                i < filteredHistory.length - 1 && 'pb-4 mb-4 border-b border-gray-200'
              )}>
                <div className="shrink-0 w-16 text-sm font-bold text-blue-600 relative pl-4">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-600" />
                  {item.year}
                </div>
                <div className="text-sm text-gray-900 leading-relaxed">
                  {item.event}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. 事業内容（カードグリッド） */}
      {filteredBusiness.length > 0 && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>事業内容</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBusiness.map((item, i) => (
              <div key={i} className={portalStyles.card}>
                <div className="text-base font-bold text-gray-900 mb-2">
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. ブランド特性（レーダーチャート＋リスト） */}
      {filteredTraits.length > 0 && (
        <div className={portalStyles.section}>
          <h2 className={portalStyles.sectionTitle}>ブランド特性</h2>

          {/* レーダーチャート（3つ以上の場合のみ） */}
          {chartData.length >= 3 && (
            <div className="w-full max-w-[400px] mx-auto mb-6 aspect-square">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: portalColors.textSecondary }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10, fill: portalColors.textMuted }} tickCount={6} />
                  <Radar dataKey="score" stroke={portalColors.primary} fill={portalColors.primary} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {filteredTraits.map((trait, i) => (
            <div key={i} className={cn(portalStyles.card, 'flex items-center gap-4')}>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-gray-900 mb-1">
                  {trait.name}
                </div>
                {trait.description && (
                  <div className="text-[13px] text-gray-500 leading-normal">
                    {trait.description}
                  </div>
                )}
              </div>
              <div className="shrink-0 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                  {trait.score}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">/10</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
