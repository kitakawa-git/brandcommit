'use client'

// 提供価値 閲覧ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { portalColors, portalStyles } from '../components/PortalStyles'

type ValueItem = {
  title: string
  description: string | null
}

export default function PortalValuesPage() {
  const { companyId } = usePortalAuth()
  const [values, setValues] = useState<ValueItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('brand_values')
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order')
      .then(({ data }) => {
        if (data) {
          setValues(data.map((d: Record<string, unknown>) => ({
            title: (d.title as string) || '',
            description: (d.description as string) || null,
          })))
        }
        setLoading(false)
      })
  }, [companyId])

  if (loading) return <div style={portalStyles.empty}>読み込み中...</div>
  if (values.length === 0) return <div style={portalStyles.empty}>まだ登録されていません</div>

  return (
    <div style={portalStyles.pageContainer}>
      <h1 style={portalStyles.pageTitle}>提供価値</h1>
      <p style={portalStyles.pageDescription}>
        ブランドが提供する主要な価値と差別化要因
      </p>

      <div style={portalStyles.section}>
        {values.map((val, i) => (
          <div key={i} style={{
            ...portalStyles.card,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
          }}>
            <div style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: portalColors.primary,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 'bold',
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 4 }}>
                {val.title}
              </div>
              {val.description && (
                <div style={{ fontSize: 14, color: portalColors.textSecondary, lineHeight: 1.7 }}>
                  {val.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
