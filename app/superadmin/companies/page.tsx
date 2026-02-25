'use client'

// スーパー管理画面: 企業一覧ページ
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Plus } from 'lucide-react'

type CompanyWithCount = {
  id: string
  name: string
  logo_url: string | null
  slogan: string | null
  created_at: string
  member_count: number
  admin_count: number
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // 全企業を取得
        const { data: companiesData, error } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[SuperAdmin] 企業一覧取得エラー:', error.message)
          setLoading(false)
          return
        }

        // 各企業の社員数と管理者数を取得
        const companiesWithCounts = await Promise.all(
          (companiesData || []).map(async (company) => {
            // 社員数
            const { count: memberCount } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id)

            // 管理者数
            const { count: adminCount } = await supabase
              .from('admin_users')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id)

            return {
              id: company.id,
              name: company.name || '（名前なし）',
              logo_url: company.logo_url,
              slogan: company.slogan,
              created_at: company.created_at,
              member_count: memberCount || 0,
              admin_count: adminCount || 0,
            }
          })
        )

        setCompanies(companiesWithCounts)
      } catch (err) {
        console.error('[SuperAdmin] 企業一覧取得例外:', err)
      }
      setLoading(false)
    }

    fetchCompanies()
  }, [])

  if (loading) {
    return (
      <p className="text-muted-foreground text-center p-10">
        読み込み中...
      </p>
    )
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">
          企業一覧
        </h2>
        <Button asChild className="bg-[#1e3a5f] hover:bg-[#2a4a6f]">
          <Link href="/superadmin/companies/new">
            <Plus size={16} className="inline" /> 新規企業を登録
          </Link>
        </Button>
      </div>

      {/* テーブル */}
      <Card className="bg-muted/50 border shadow-none">
        <CardContent className="p-6">
          {companies.length === 0 ? (
            <p className="text-muted-foreground text-center p-10">
              企業データがありません
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">企業名</th>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">スローガン</th>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs text-center">従業員数</th>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs text-center">管理者</th>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">作成日</th>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs"></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className="px-4 py-3 border-b border-border text-foreground">
                      <div className="flex items-center gap-2.5">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center">
                            <Building2 size={16} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-semibold">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-border text-muted-foreground text-[13px]">
                      {company.slogan || '—'}
                    </td>
                    <td className="px-4 py-3 border-b border-border text-foreground text-center">
                      {company.member_count}名
                    </td>
                    <td className="px-4 py-3 border-b border-border text-foreground text-center">
                      {company.admin_count}名
                    </td>
                    <td className="px-4 py-3 border-b border-border text-muted-foreground text-[13px]">
                      {new Date(company.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 border-b border-border text-foreground">
                      <Link
                        href={`/superadmin/companies/${company.id}`}
                        className="text-blue-600 no-underline text-sm font-semibold"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* 統計サマリー */}
      <div className="mt-4 text-[13px] text-muted-foreground text-right">
        全{companies.length}社
      </div>
    </div>
  )
}
