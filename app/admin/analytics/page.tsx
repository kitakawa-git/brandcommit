'use client'

// アクセス解析ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { colors, commonStyles } from '../components/AdminStyles'

type ViewRecord = {
  id: string
  profile_id: string
  viewed_at: string
  ip_address: string | null
  country: string | null
  city: string | null
  profiles: {
    name: string
    slug: string
  } | null
}

type MemberRanking = {
  name: string
  slug: string
  count: number
}

type DailyCount = {
  date: string
  count: number
}

export default function AnalyticsPage() {
  const { companyId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [totalViews, setTotalViews] = useState(0)
  const [monthViews, setMonthViews] = useState(0)
  const [weekViews, setWeekViews] = useState(0)
  const [ranking, setRanking] = useState<MemberRanking[]>([])
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([])
  const [recentViews, setRecentViews] = useState<ViewRecord[]>([])

  useEffect(() => {
    if (!companyId) return

    const fetchAnalytics = async () => {
      try {
        // まず自社の社員IDを取得
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, slug')
          .eq('company_id', companyId)

        if (!profiles || profiles.length === 0) {
          setLoading(false)
          return
        }

        const profileIds = profiles.map(p => p.id)
        const profileMap = new Map(profiles.map(p => [p.id, p]))

        // 全アクセスデータ取得
        const { data: allViews } = await supabase
          .from('card_views')
          .select('id, profile_id, viewed_at, ip_address, country, city')
          .in('profile_id', profileIds)
          .order('viewed_at', { ascending: false })

        const views = allViews || []

        // 総閲覧数
        setTotalViews(views.length)

        // 今月の閲覧数
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const monthCount = views.filter(v => v.viewed_at >= monthStart).length
        setMonthViews(monthCount)

        // 今週の閲覧数（月曜始まり）
        const today = new Date()
        const dayOfWeek = today.getDay()
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - diff)
        weekStart.setHours(0, 0, 0, 0)
        const weekCount = views.filter(v => new Date(v.viewed_at) >= weekStart).length
        setWeekViews(weekCount)

        // 社員別ランキング
        const countByProfile = new Map<string, number>()
        views.forEach(v => {
          countByProfile.set(v.profile_id, (countByProfile.get(v.profile_id) || 0) + 1)
        })
        const rankingData: MemberRanking[] = []
        countByProfile.forEach((count, profileId) => {
          const p = profileMap.get(profileId)
          if (p) {
            rankingData.push({ name: p.name, slug: p.slug, count })
          }
        })
        rankingData.sort((a, b) => b.count - a.count)
        setRanking(rankingData)

        // 日別推移（過去30日）
        const dailyMap = new Map<string, number>()
        for (let i = 29; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
          dailyMap.set(key, 0)
        }
        views.forEach(v => {
          const key = v.viewed_at.slice(0, 10)
          if (dailyMap.has(key)) {
            dailyMap.set(key, dailyMap.get(key)! + 1)
          }
        })
        const dailyData: DailyCount[] = []
        dailyMap.forEach((count, date) => {
          dailyData.push({ date, count })
        })
        setDailyCounts(dailyData)

        // 最近のアクセス（10件）
        const recentData = views.slice(0, 10).map(v => ({
          ...v,
          profiles: profileMap.get(v.profile_id)
            ? { name: profileMap.get(v.profile_id)!.name, slug: profileMap.get(v.profile_id)!.slug }
            : null,
        }))
        setRecentViews(recentData)
      } catch (err) {
        console.error('[Analytics] データ取得エラー:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [companyId])

  if (loading) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        読み込み中...
      </p>
    )
  }

  // 日別棒グラフの最大値
  const maxDaily = Math.max(...dailyCounts.map(d => d.count), 1)

  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        margin: '0 0 24px',
      }}>
        📊 アクセス解析
      </h2>

      {/* === 全体サマリー === */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <SummaryCard label="総閲覧数" value={totalViews} color="#2563eb" />
        <SummaryCard label="今月の閲覧数" value={monthViews} color="#16a34a" />
        <SummaryCard label="今週の閲覧数" value={weekViews} color="#f59e0b" />
      </div>

      {/* === 日別推移（過去30日） === */}
      <div style={{ ...commonStyles.card, marginBottom: 24 }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 16px',
        }}>
          日別推移（過去30日）
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          height: 160,
          padding: '0 4px',
        }}>
          {dailyCounts.map((d) => {
            const barHeight = maxDaily > 0 ? (d.count / maxDaily) * 140 : 0
            const dateLabel = d.date.slice(5) // MM-DD
            return (
              <div
                key={d.date}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
                title={`${d.date}: ${d.count}件`}
              >
                {d.count > 0 && (
                  <span style={{ fontSize: 9, color: colors.textSecondary }}>
                    {d.count}
                  </span>
                )}
                <div style={{
                  width: '100%',
                  maxWidth: 20,
                  height: Math.max(barHeight, d.count > 0 ? 4 : 1),
                  backgroundColor: d.count > 0 ? '#2563eb' : '#e5e7eb',
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.3s',
                }} />
                {/* 5日ごとにラベル表示 */}
                {dailyCounts.indexOf(d) % 5 === 0 && (
                  <span style={{ fontSize: 9, color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                    {dateLabel}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 2カラム: ランキング + 最近のアクセス */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24,
      }}>
        {/* === 社員別ランキング === */}
        <div style={commonStyles.card}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 16px',
          }}>
            社員別ランキング
          </h3>
          {ranking.length === 0 ? (
            <p style={{ color: colors.textSecondary, fontSize: 14 }}>
              まだアクセスデータがありません
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ranking.map((member, i) => {
                const maxCount = ranking[0]?.count || 1
                const barWidth = (member.count / maxCount) * 100
                return (
                  <div key={member.slug}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}>
                      <span style={{ fontSize: 14, color: colors.textPrimary }}>
                        <span style={{
                          display: 'inline-block',
                          width: 24,
                          fontWeight: 'bold',
                          color: i < 3 ? '#f59e0b' : colors.textSecondary,
                        }}>
                          {i + 1}.
                        </span>
                        {member.name}
                      </span>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: colors.primary,
                      }}>
                        {member.count}件
                      </span>
                    </div>
                    <div style={{
                      height: 8,
                      backgroundColor: '#f3f4f6',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#2563eb',
                        borderRadius: 4,
                        transition: 'width 0.5s',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* === 最近のアクセス === */}
        <div style={commonStyles.card}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 16px',
          }}>
            最近のアクセス
          </h3>
          {recentViews.length === 0 ? (
            <p style={{ color: colors.textSecondary, fontSize: 14 }}>
              まだアクセスデータがありません
            </p>
          ) : (
            <table style={{ ...commonStyles.table, fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ ...commonStyles.th, fontSize: 12 }}>日時</th>
                  <th style={{ ...commonStyles.th, fontSize: 12 }}>社員名</th>
                  <th style={{ ...commonStyles.th, fontSize: 12 }}>地域</th>
                </tr>
              </thead>
              <tbody>
                {recentViews.map((view) => {
                  const dt = new Date(view.viewed_at)
                  const dateStr = `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`
                  const location = [view.city, view.country].filter(Boolean).join(', ') || '—'
                  return (
                    <tr key={view.id}>
                      <td style={{ ...commonStyles.td, whiteSpace: 'nowrap', fontSize: 12 }}>
                        {dateStr}
                      </td>
                      <td style={{ ...commonStyles.td, fontWeight: '600' }}>
                        {view.profiles?.name || '—'}
                      </td>
                      <td style={{ ...commonStyles.td, color: colors.textSecondary, fontSize: 12 }}>
                        {location}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// サマリーカードコンポーネント
function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      padding: 24,
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: 13,
        color: colors.textSecondary,
        margin: '0 0 8px',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 32,
        fontWeight: 'bold',
        color: color,
        margin: 0,
      }}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}
