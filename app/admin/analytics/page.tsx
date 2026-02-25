'use client'

// アクセス解析ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { commonStyles } from '../components/AdminStyles'
import { cn } from '@/lib/utils'

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
      <p className="text-gray-500 text-center p-10">
        読み込み中...
      </p>
    )
  }

  // 日別棒グラフの最大値
  const maxDaily = Math.max(...dailyCounts.map(d => d.count), 1)

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        アクセス解析
      </h2>

      {/* === 全体サマリー === */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <SummaryCard label="総閲覧数" value={totalViews} color="#2563eb" />
        <SummaryCard label="今月の閲覧数" value={monthViews} color="#16a34a" />
        <SummaryCard label="今週の閲覧数" value={weekViews} color="#f59e0b" />
      </div>

      {/* === 日別推移（過去30日） === */}
      <div className={cn(commonStyles.card, 'mb-6')}>
        <h3 className="text-base font-bold text-gray-900 mb-4">
          日別推移（過去30日）
        </h3>
        <div className="flex items-end gap-0.5 h-40 px-1">
          {dailyCounts.map((d) => {
            const barHeight = maxDaily > 0 ? (d.count / maxDaily) * 140 : 0
            const dateLabel = d.date.slice(5) // MM-DD
            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-0.5"
                title={`${d.date}: ${d.count}件`}
              >
                {d.count > 0 && (
                  <span className="text-[9px] text-gray-500">
                    {d.count}
                  </span>
                )}
                <div
                  className="w-full max-w-5 rounded-t-sm transition-[height] duration-300"
                  style={{
                    height: Math.max(barHeight, d.count > 0 ? 4 : 1),
                    backgroundColor: d.count > 0 ? '#2563eb' : '#e5e7eb',
                  }}
                />
                {/* 5日ごとにラベル表示 */}
                {dailyCounts.indexOf(d) % 5 === 0 && (
                  <span className="text-[9px] text-gray-500 whitespace-nowrap">
                    {dateLabel}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 2カラム: ランキング + 最近のアクセス */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-6">
        {/* === 社員別ランキング === */}
        <div className={commonStyles.card}>
          <h3 className="text-base font-bold text-gray-900 mb-4">
            アクセスランキング
          </h3>
          {ranking.length === 0 ? (
            <p className="text-gray-500 text-sm">
              まだアクセスデータがありません
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {ranking.map((member, i) => {
                const maxCount = ranking[0]?.count || 1
                const barWidth = (member.count / maxCount) * 100
                return (
                  <div key={member.slug}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-900">
                        <span
                          className="inline-block w-6 font-bold"
                          style={{ color: i < 3 ? '#f59e0b' : undefined }}
                        >
                          {i + 1}.
                        </span>
                        {member.name}
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {member.count}件
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-[width] duration-500"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#2563eb',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* === 最近のアクセス === */}
        <div className={commonStyles.card}>
          <h3 className="text-base font-bold text-gray-900 mb-4">
            最近のアクセス
          </h3>
          {recentViews.length === 0 ? (
            <p className="text-gray-500 text-sm">
              まだアクセスデータがありません
            </p>
          ) : (
            <table className={cn(commonStyles.table, 'text-[13px]')}>
              <thead>
                <tr>
                  <th className={cn(commonStyles.th, 'text-xs')}>日時</th>
                  <th className={cn(commonStyles.th, 'text-xs')}>名前</th>
                  <th className={cn(commonStyles.th, 'text-xs')}>地域</th>
                </tr>
              </thead>
              <tbody>
                {recentViews.map((view) => {
                  const dt = new Date(view.viewed_at)
                  const dateStr = `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`
                  const location = [view.city, view.country].filter(Boolean).join(', ') || '—'
                  return (
                    <tr key={view.id}>
                      <td className={cn(commonStyles.td, 'whitespace-nowrap text-xs')}>
                        {dateStr}
                      </td>
                      <td className={cn(commonStyles.td, 'font-semibold')}>
                        {view.profiles?.name || '—'}
                      </td>
                      <td className={cn(commonStyles.td, 'text-gray-500 text-xs')}>
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <p className="text-[13px] text-gray-500 mb-2">
        {label}
      </p>
      <p className="text-[32px] font-bold m-0" style={{ color }}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}
