'use client'

// スーパー管理画面: 企業一覧ページ
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { colors, commonStyles } from '../../admin/components/AdminStyles'

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
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        読み込み中...
      </p>
    )
  }

  return (
    <div>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: 0,
        }}>
          企業一覧
        </h2>
        <Link
          href="/superadmin/companies/new"
          style={{
            ...commonStyles.button,
            backgroundColor: '#1e3a5f',
          }}
        >
          ＋ 新規企業を登録
        </Link>
      </div>

      {/* テーブル */}
      <div style={commonStyles.card}>
        {companies.length === 0 ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
            企業データがありません
          </p>
        ) : (
          <table style={commonStyles.table}>
            <thead>
              <tr>
                <th style={commonStyles.th}>企業名</th>
                <th style={commonStyles.th}>スローガン</th>
                <th style={{ ...commonStyles.th, textAlign: 'center' }}>従業員数</th>
                <th style={{ ...commonStyles.th, textAlign: 'center' }}>管理者</th>
                <th style={commonStyles.th}>作成日</th>
                <th style={commonStyles.th}></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td style={commonStyles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt=""
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          backgroundColor: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                        }}>
                          🏢
                        </div>
                      )}
                      <span style={{ fontWeight: '600' }}>{company.name}</span>
                    </div>
                  </td>
                  <td style={{ ...commonStyles.td, color: colors.textSecondary, fontSize: 13 }}>
                    {company.slogan || '—'}
                  </td>
                  <td style={{ ...commonStyles.td, textAlign: 'center' }}>
                    {company.member_count}名
                  </td>
                  <td style={{ ...commonStyles.td, textAlign: 'center' }}>
                    {company.admin_count}名
                  </td>
                  <td style={{ ...commonStyles.td, color: colors.textSecondary, fontSize: 13 }}>
                    {new Date(company.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td style={commonStyles.td}>
                    <Link
                      href={`/superadmin/companies/${company.id}`}
                      style={{
                        color: colors.primary,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: '600',
                      }}
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
      <div style={{
        marginTop: 16,
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'right',
      }}>
        全{companies.length}社
      </div>
    </div>
  )
}
