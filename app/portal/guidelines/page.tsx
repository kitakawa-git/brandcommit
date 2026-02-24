'use client'

// ブランド方針 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'
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

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>
  if (!data) return <div style={portalStyles.empty}>まだ登録されていません</div>

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
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>ブランド方針</h1>
      <p style={portalStyles.pageDescription}>
        ブランドのビジョン・ミッション・バリューとメッセージ
      </p>

      {/* 1. スローガン */}
      {data.slogan && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>スローガン</h2>
          <div style={portalStyles.card}>
            <div style={{ ...portalStyles.value, fontSize: 20, fontWeight: 'bold' }}>{data.slogan}</div>
          </div>
        </div>
      )}

      {/* 2. コンセプトビジュアル */}
      {data.concept_visual_url && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>コンセプトビジュアル</h2>
          <div style={portalStyles.card}>
            <img
              src={data.concept_visual_url}
              alt="コンセプトビジュアル"
              style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
            />
          </div>
        </div>
      )}

      {/* 3. ブランド動画 */}
      {data.brand_video_url && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ブランド動画</h2>
          <div style={portalStyles.card}>
            {embedUrl ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={embedUrl}
                  title="ブランド動画"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={data.brand_video_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: portalColors.primary, fontSize: 14 }}
              >
                {data.brand_video_url}
              </a>
            )}
          </div>
        </div>
      )}

      {/* 4. メッセージ */}
      {data.brand_statement && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>メッセージ</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.brand_statement}</div>
          </div>
        </div>
      )}

      {/* 5. ミッション */}
      {data.mission && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ミッション</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.mission}</div>
          </div>
        </div>
      )}

      {/* 6. ビジョン */}
      {data.vision && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ビジョン</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.vision}</div>
          </div>
        </div>
      )}

      {/* 7. バリュー */}
      {filteredValues.length > 0 && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>バリュー</h2>
          <div style={portalStyles.card}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {filteredValues.map((v, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <span style={portalStyles.tag}>{v.name}</span>
                  {v.description && (
                    <div style={{ fontSize: 13, color: portalColors.textSecondary, marginTop: 4, paddingLeft: 4 }}>
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
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ブランドストーリー</h2>
          <div style={portalStyles.card}>
            <div style={portalStyles.value}>{data.brand_story}</div>
          </div>
        </div>
      )}

      {/* 9. 沿革（タイムライン形式） */}
      {filteredHistory.length > 0 && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>沿革</h2>
          <div style={portalStyles.card}>
            {filteredHistory.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 16,
                paddingBottom: i < filteredHistory.length - 1 ? 16 : 0,
                marginBottom: i < filteredHistory.length - 1 ? 16 : 0,
                borderBottom: i < filteredHistory.length - 1 ? `1px solid ${portalColors.border}` : 'none',
              }}>
                <div style={{
                  flexShrink: 0,
                  width: 64,
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: portalColors.primary,
                  position: 'relative',
                  paddingLeft: 16,
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 6,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: portalColors.primary,
                  }} />
                  {item.year}
                </div>
                <div style={{ fontSize: 14, color: portalColors.textPrimary, lineHeight: 1.6 }}>
                  {item.event}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. 事業内容（カードグリッド） */}
      {filteredBusiness.length > 0 && (
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>事業内容</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {filteredBusiness.map((item, i) => (
              <div key={i} style={portalStyles.card}>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 8 }}>
                  {item.title}
                </div>
                {item.description && (
                  <div style={{ fontSize: 14, color: portalColors.textSecondary, lineHeight: 1.6 }}>
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
        <div style={portalStyles.section}>
          <h2 style={portalStyles.sectionTitle}>ブランド特性</h2>

          {/* レーダーチャート（3つ以上の場合のみ） */}
          {chartData.length >= 3 && (
            <div style={{ width: '100%', maxWidth: 400, margin: '0 auto 24px', aspectRatio: '1' }}>
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
            <div key={i} style={{ ...portalStyles.card, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 4 }}>
                  {trait.name}
                </div>
                {trait.description && (
                  <div style={{ fontSize: 13, color: portalColors.textSecondary, lineHeight: 1.5 }}>
                    {trait.description}
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  backgroundColor: portalColors.primary, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 'bold',
                }}>
                  {trait.score}
                </div>
                <div style={{ fontSize: 10, color: portalColors.textMuted, marginTop: 4 }}>/10</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
