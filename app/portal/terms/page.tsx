'use client'

// 用語ルール 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'

type Term = {
  preferred_term: string
  avoided_term: string
  context: string | null
}

export default function PortalTermsPage() {
  const { companyId } = usePortalAuth()
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('brand_terms')
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order')
      .then(({ data }) => {
        if (data) {
          setTerms(data.map((d: Record<string, unknown>) => ({
            preferred_term: (d.preferred_term as string) || '',
            avoided_term: (d.avoided_term as string) || '',
            context: (d.context as string) || null,
          })))
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>
  if (terms.length === 0) return <div style={portalStyles.empty}>まだ登録されていません</div>

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>用語ルール</h1>
      <p style={portalStyles.pageDescription}>
        ブランドで推奨する表現と避けるべき表現
      </p>

      <div style={portalStyles.section}>
        <table style={portalStyles.table}>
          <thead>
            <tr>
              <th style={{ ...portalStyles.th, width: '30%' }}>推奨する表現</th>
              <th style={{ ...portalStyles.th, width: '30%' }}>避ける表現</th>
              <th style={portalStyles.th}>補足・文脈</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term, i) => (
              <tr key={i}>
                <td style={{ ...portalStyles.td, fontWeight: 'bold', color: portalColors.success }}>
                  {term.preferred_term}
                </td>
                <td style={{ ...portalStyles.td, color: portalColors.danger, textDecoration: 'line-through' }}>
                  {term.avoided_term}
                </td>
                <td style={{ ...portalStyles.td, color: portalColors.textSecondary, fontSize: 13 }}>
                  {term.context || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
