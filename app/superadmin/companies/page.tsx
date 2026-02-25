'use client'

// スーパー管理画面: 企業一覧ページ
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { commonStyles } from '../../admin/components/AdminStyles'
import { cn } from '@/lib/utils'

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
      <p className="text-gray-500 text-center p-10">
        読み込み中...
      </p>
    )
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          企業一覧
        </h2>
        <Link
          href="/superadmin/companies/new"
          className={cn(commonStyles.button, 'bg-[#1e3a5f] hover:bg-[#2a4a6f]')}
        >
          ＋ 新規企業を登録
        </Link>
      </div>

      {/* テーブル */}
      <div className={commonStyles.card}>
        {companies.length === 0 ? (
          <p className="text-gray-500 text-center p-10">
            企業データがありません
          </p>
        ) : (
          <table className={commonStyles.table}>
            <thead>
              <tr>
                <th className={commonStyles.th}>企業名</th>
                <th className={commonStyles.th}>スローガン</th>
                <th className={cn(commonStyles.th, 'text-center')}>従業員数</th>
                <th className={cn(commonStyles.th, 'text-center')}>管理者</th>
                <th className={commonStyles.th}>作成日</th>
                <th className={commonStyles.th}></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className={commonStyles.td}>
                    <div className="flex items-center gap-2.5">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt=""
                          className="w-8 h-8 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center text-sm">
                          🏢
                        </div>
                      )}
                      <span className="font-semibold">{company.name}</span>
                    </div>
                  </td>
                  <td className={cn(commonStyles.td, 'text-gray-500 text-[13px]')}>
                    {company.slogan || '—'}
                  </td>
                  <td className={cn(commonStyles.td, 'text-center')}>
                    {company.member_count}名
                  </td>
                  <td className={cn(commonStyles.td, 'text-center')}>
                    {company.admin_count}名
                  </td>
                  <td className={cn(commonStyles.td, 'text-gray-500 text-[13px]')}>
                    {new Date(company.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className={commonStyles.td}>
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
      </div>

      {/* 統計サマリー */}
      <div className="mt-4 text-[13px] text-gray-500 text-right">
        全{companies.length}社
      </div>
    </div>
  )
}
