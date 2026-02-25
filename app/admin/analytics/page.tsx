'use client'

// アクセス解析ページ
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Eye, CalendarDays, CalendarClock } from 'lucide-react'

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

const chartConfig = {
  count: {
    label: 'アクセス数',
    color: 'hsl(217, 91%, 60%)',
  },
} satisfies ChartConfig

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
      <p className="text-muted-foreground text-center p-10">
        読み込み中...
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">
        アクセス解析
      </h2>

      {/* === 全体サマリー === */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <Card className="bg-muted/50 border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-[13px]">総閲覧数</CardDescription>
            <Eye className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {totalViews.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-[13px]">今月の閲覧数</CardDescription>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {monthViews.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-[13px]">今週の閲覧数</CardDescription>
            <CalendarClock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">
              {weekViews.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === 日別推移（過去30日） === */}
      <Card className="bg-muted/50 border shadow-none mb-6">
        <CardHeader>
          <CardTitle className="text-base">日別推移</CardTitle>
          <CardDescription>過去30日間のアクセス数</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart
              data={dailyCounts}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value: string) => {
                  const [, m, d] = value.split('-')
                  return `${parseInt(m)}/${parseInt(d)}`
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const str = String(value)
                      const [y, m, d] = str.split('-')
                      return `${y}年${parseInt(m)}月${parseInt(d)}日`
                    }}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 2カラム: ランキング + 最近のアクセス */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-6">
        {/* === 社員別ランキング === */}
        <Card className="bg-muted/50 border shadow-none">
          <CardHeader>
            <CardTitle className="text-base">アクセスランキング</CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-muted-foreground text-sm">
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
                        <span className="text-sm text-foreground">
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
          </CardContent>
        </Card>

        {/* === 最近のアクセス === */}
        <Card className="bg-muted/50 border shadow-none">
          <CardHeader>
            <CardTitle className="text-base">最近のアクセス</CardTitle>
          </CardHeader>
          <CardContent>
            {recentViews.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                まだアクセスデータがありません
              </p>
            ) : (
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">日時</th>
                    <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">名前</th>
                    <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">地域</th>
                  </tr>
                </thead>
                <tbody>
                  {recentViews.map((view) => {
                    const dt = new Date(view.viewed_at)
                    const dateStr = `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`
                    const location = [view.city, view.country].filter(Boolean).join(', ') || '—'
                    return (
                      <tr key={view.id}>
                        <td className="px-4 py-3 border-b border-border text-foreground whitespace-nowrap text-xs">
                          {dateStr}
                        </td>
                        <td className="px-4 py-3 border-b border-border text-foreground font-semibold">
                          {view.profiles?.name || '—'}
                        </td>
                        <td className="px-4 py-3 border-b border-border text-muted-foreground text-xs">
                          {location}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
