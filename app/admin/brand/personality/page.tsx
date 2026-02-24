'use client'

// ブランドパーソナリティ 編集ページ（トーンオブボイス・コミュニケーションスタイルのみ）
// 特性（traits）はブランド方針ページに移動済み
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { colors, commonStyles } from '../../components/AdminStyles'

type Personality = {
  tone_of_voice: string
  communication_style: string
}

export default function BrandPersonalityPage() {
  const { companyId } = useAuth()
  const [personalityId, setPersonalityId] = useState<string | null>(null)
  const [personality, setPersonality] = useState<Personality>({
    tone_of_voice: '',
    communication_style: '',
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchPersonality = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('brand_personalities')
          .select('*')
          .eq('company_id', companyId)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.data) {
        setPersonalityId(result.data.id)
        setPersonality({
          tone_of_voice: result.data.tone_of_voice || '',
          communication_style: result.data.communication_style || '',
        })
      }
    } catch (err) {
      console.error('[BrandPersonality] データ取得エラー:', err)
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
    fetchPersonality()
  }, [companyId])

  const handleChange = (field: keyof Personality, value: string) => {
    setPersonality(prev => ({ ...prev, [field]: value }))
  }

  // Supabase REST API直接fetch
  const supabasePatch = async (table: string, id: string, data: Record<string, unknown>, token: string): Promise<{ ok: boolean; error?: string }> => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (!res.ok) {
        const body = await res.text()
        return { ok: false, error: `HTTP ${res.status}: ${body}` }
      }
      return { ok: true }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { ok: false, error: 'タイムアウト（10秒）' }
      }
      return { ok: false, error: err instanceof Error ? err.message : '不明なエラー' }
    }
  }

  const supabaseInsert = async (table: string, data: Record<string, unknown>, token: string): Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }> => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (!res.ok) {
        const body = await res.text()
        return { ok: false, error: `HTTP ${res.status}: ${body}` }
      }
      const result = await res.json()
      return { ok: true, data: result[0] }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { ok: false, error: 'タイムアウト（10秒）' }
      }
      return { ok: false, error: err instanceof Error ? err.message : '不明なエラー' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)
    setMessage('')
    setMessageType('error')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const saveData: Record<string, unknown> = {
        company_id: companyId,
        tone_of_voice: personality.tone_of_voice || null,
        communication_style: personality.communication_style || null,
      }

      let result: { ok: boolean; error?: string; data?: Record<string, unknown> }
      if (personalityId) {
        result = await supabasePatch('brand_personalities', personalityId, saveData, token)
      } else {
        result = await supabaseInsert('brand_personalities', saveData, token)
        if (result.ok && result.data) {
          setPersonalityId(result.data.id as string)
        }
      }

      if (result.ok) {
        setMessage('保存しました')
        setMessageType('success')
      } else {
        setMessage('保存に失敗しました: ' + result.error)
        setMessageType('error')
      }
    } catch (err) {
      setMessage('保存に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'))
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>読み込み中...</p>
  }

  if (fetchError) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{fetchError}</p>
        <button onClick={fetchPersonality} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>再読み込み</button>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 24px' }}>
        ブランドパーソナリティ
      </h2>

      <div style={commonStyles.card}>
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* トーンオブボイス */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>トーンオブボイス</label>
            <textarea
              value={personality.tone_of_voice}
              onChange={(e) => handleChange('tone_of_voice', e.target.value)}
              placeholder="フォーマルだが親しみやすい、専門用語は最小限に..."
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          {/* コミュニケーションスタイル */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>コミュニケーションスタイル</label>
            <textarea
              value={personality.communication_style}
              onChange={(e) => handleChange('communication_style', e.target.value)}
              placeholder="結論から伝える、データで裏付ける..."
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{ ...commonStyles.button, marginTop: 8, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  )
}
