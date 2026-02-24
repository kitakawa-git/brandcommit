'use client'

// 提供価値 編集ページ（全削除→全INSERT方式）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { colors, commonStyles } from '../../components/AdminStyles'

type ValueItem = {
  title: string
  description: string
}

export default function BrandValuesPage() {
  const { companyId } = useAuth()
  const [values, setValues] = useState<ValueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchValues = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('brand_values')
          .select('*')
          .eq('company_id', companyId)
          .order('sort_order'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.error) throw new Error(result.error.message)
      if (result.data && result.data.length > 0) {
        setValues(result.data.map((d: Record<string, unknown>) => ({
          title: (d.title as string) || '',
          description: (d.description as string) || '',
        })))
      }
    } catch (err) {
      console.error('[BrandValues] データ取得エラー:', err)
      const msg = err instanceof Error && err.message === 'timeout'
        ? 'データの取得がタイムアウトしました'
        : 'データの取得に失敗しました'
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!companyId) return
    fetchValues()
  }, [companyId])

  const addValue = () => {
    setValues([...values, { title: '', description: '' }])
  }

  const updateValue = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...values]
    updated[index] = { ...updated[index], [field]: value }
    setValues(updated)
  }

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)
    setMessage('')
    setMessageType('error')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    // セッショントークンを取得（RLSポリシー用）
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || ''

    const headers = {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=minimal',
    }

    try {
      // 1. 既存を全削除
      const delRes = await fetch(`${supabaseUrl}/rest/v1/brand_values?company_id=eq.${companyId}`, {
        method: 'DELETE',
        headers,
      })
      if (!delRes.ok) {
        const body = await delRes.text()
        throw new Error(`削除エラー: HTTP ${delRes.status}: ${body}`)
      }

      // 2. 現在のリストを全INSERT（空のtitleは除外）
      const cleanedValues = values.filter(v => v.title.trim() !== '')
      if (cleanedValues.length > 0) {
        const insertData = cleanedValues.map((v, i) => ({
          company_id: companyId,
          title: v.title,
          description: v.description || null,
          sort_order: i,
        }))

        const insRes = await fetch(`${supabaseUrl}/rest/v1/brand_values`, {
          method: 'POST',
          headers,
          body: JSON.stringify(insertData),
        })
        if (!insRes.ok) {
          const body = await insRes.text()
          throw new Error(`挿入エラー: HTTP ${insRes.status}: ${body}`)
        }
      }

      setValues(cleanedValues)
      setMessage('保存しました')
      setMessageType('success')
    } catch (err) {
      console.error('[BrandValues Save] エラー:', err)
      setMessage('保存に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'))
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        読み込み中...
      </p>
    )
  }

  if (fetchError) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{fetchError}</p>
        <button onClick={fetchValues} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
          再読み込み
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        margin: '0 0 24px',
      }}>
        提供価値
      </h2>

      <div style={commonStyles.card}>
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {values.map((value, index) => (
            <div key={index} style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: colors.textSecondary }}>
                  提供価値 {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  style={{
                    ...commonStyles.dangerButton,
                    padding: '4px 12px',
                    fontSize: 12,
                  }}
                >
                  削除
                </button>
              </div>

              <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>タイトル</label>
                <input
                  type="text"
                  value={value.title}
                  onChange={(e) => updateValue(index, 'title', e.target.value)}
                  placeholder="提供価値のタイトル"
                  style={commonStyles.input}
                />
              </div>

              <div style={{ marginBottom: 0 }}>
                <label style={commonStyles.label}>説明</label>
                <textarea
                  value={value.description}
                  onChange={(e) => updateValue(index, 'description', e.target.value)}
                  placeholder="この提供価値の詳細説明"
                  style={{ ...commonStyles.textarea, minHeight: 80 }}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addValue}
            style={{
              ...commonStyles.buttonOutline,
              padding: '8px 16px',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            + 提供価値を追加
          </button>

          <div>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...commonStyles.button,
                marginTop: 8,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
