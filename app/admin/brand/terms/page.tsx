'use client'

// 用語ルール 編集ページ（全削除→全INSERT方式）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { colors, commonStyles } from '../../components/AdminStyles'

type TermItem = {
  preferred_term: string
  avoided_term: string
  context: string
}

export default function BrandTermsPage() {
  const { companyId } = useAuth()
  const [terms, setTerms] = useState<TermItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchTerms = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('brand_terms')
          .select('*')
          .eq('company_id', companyId)
          .order('sort_order'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.error) throw new Error(result.error.message)
      if (result.data && result.data.length > 0) {
        setTerms(result.data.map((d: Record<string, unknown>) => ({
          preferred_term: (d.preferred_term as string) || '',
          avoided_term: (d.avoided_term as string) || '',
          context: (d.context as string) || '',
        })))
      }
    } catch (err) {
      console.error('[BrandTerms] データ取得エラー:', err)
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
    fetchTerms()
  }, [companyId])

  const addTerm = () => {
    setTerms([...terms, { preferred_term: '', avoided_term: '', context: '' }])
  }

  const updateTerm = (index: number, field: keyof TermItem, value: string) => {
    const updated = [...terms]
    updated[index] = { ...updated[index], [field]: value }
    setTerms(updated)
  }

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index))
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
      const delRes = await fetch(`${supabaseUrl}/rest/v1/brand_terms?company_id=eq.${companyId}`, {
        method: 'DELETE',
        headers,
      })
      if (!delRes.ok) {
        const body = await delRes.text()
        throw new Error(`削除エラー: HTTP ${delRes.status}: ${body}`)
      }

      // 2. 現在のリストを全INSERT
      const cleanedTerms = terms.filter(t => t.preferred_term.trim() !== '')
      if (cleanedTerms.length > 0) {
        const insertData = cleanedTerms.map((t, i) => ({
          company_id: companyId,
          preferred_term: t.preferred_term,
          avoided_term: t.avoided_term || null,
          context: t.context || null,
          sort_order: i,
        }))

        const insRes = await fetch(`${supabaseUrl}/rest/v1/brand_terms`, {
          method: 'POST',
          headers,
          body: JSON.stringify(insertData),
        })
        if (!insRes.ok) {
          const body = await insRes.text()
          throw new Error(`挿入エラー: HTTP ${insRes.status}: ${body}`)
        }
      }

      setTerms(cleanedTerms)
      setMessage('保存しました')
      setMessageType('success')
    } catch (err) {
      console.error('[BrandTerms Save] エラー:', err)
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
        <button onClick={fetchTerms} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
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
        用語ルール
      </h2>

      <div style={commonStyles.card}>
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 16px' }}>
            ブランドで使用する推奨用語と避けるべき用語を設定します
          </p>

          {/* ヘッダー行 */}
          {terms.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 'bold', color: colors.textSecondary }}>推奨用語</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 'bold', color: colors.textSecondary }}>非推奨用語</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 'bold', color: colors.textSecondary }}>使い分け説明</span>
              <span style={{ width: 56 }} />
            </div>
          )}

          {terms.map((term, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <input
                type="text"
                value={term.preferred_term}
                onChange={(e) => updateTerm(index, 'preferred_term', e.target.value)}
                placeholder="推奨用語"
                style={{ ...commonStyles.input, flex: 1 }}
              />
              <input
                type="text"
                value={term.avoided_term}
                onChange={(e) => updateTerm(index, 'avoided_term', e.target.value)}
                placeholder="非推奨用語"
                style={{ ...commonStyles.input, flex: 1 }}
              />
              <input
                type="text"
                value={term.context}
                onChange={(e) => updateTerm(index, 'context', e.target.value)}
                placeholder="使い分け説明"
                style={{ ...commonStyles.input, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeTerm(index)}
                style={{
                  ...commonStyles.dangerButton,
                  padding: '8px 14px',
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                }}
              >
                削除
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addTerm}
            style={{
              ...commonStyles.buttonOutline,
              padding: '8px 16px',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            + 用語ルールを追加
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
