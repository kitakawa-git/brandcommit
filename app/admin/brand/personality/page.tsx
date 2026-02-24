'use client'

// ブランドパーソナリティ 編集ページ（1企業1レコード、upsert方式）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { colors, commonStyles } from '../../components/AdminStyles'

type TraitItem = {
  name: string
  score: number
  description: string
}

type Personality = {
  traits: TraitItem[]
  tone_of_voice: string
  communication_style: string
}

const defaultTraits: TraitItem[] = Array.from({ length: 5 }, () => ({
  name: '',
  score: 5,
  description: '',
}))

export default function BrandPersonalityPage() {
  const { companyId } = useAuth()
  const [personalityId, setPersonalityId] = useState<string | null>(null)
  const [personality, setPersonality] = useState<Personality>({
    traits: [...defaultTraits],
    tone_of_voice: '',
    communication_style: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (!companyId) return

    const fetchPersonality = async () => {
      const { data } = await supabase
        .from('brand_personalities')
        .select('*')
        .eq('company_id', companyId)
        .single()

      if (data) {
        setPersonalityId(data.id)
        const traits = data.traits && Array.isArray(data.traits) && data.traits.length === 5
          ? data.traits
          : [...defaultTraits]
        setPersonality({
          traits,
          tone_of_voice: data.tone_of_voice || '',
          communication_style: data.communication_style || '',
        })
      }
      setLoading(false)
    }
    fetchPersonality()
  }, [companyId])

  const handleChange = (field: 'tone_of_voice' | 'communication_style', value: string) => {
    setPersonality(prev => ({ ...prev, [field]: value }))
  }

  const updateTrait = (index: number, field: keyof TraitItem, value: string | number) => {
    const updated = [...personality.traits]
    updated[index] = { ...updated[index], [field]: value }
    setPersonality(prev => ({ ...prev, traits: updated }))
  }

  // Supabase REST API直接fetch
  const supabasePatch = async (table: string, id: string, data: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
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

  const supabaseInsert = async (table: string, data: Record<string, unknown>): Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }> => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
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
      const saveData: Record<string, unknown> = {
        company_id: companyId,
        traits: personality.traits,
        tone_of_voice: personality.tone_of_voice || null,
        communication_style: personality.communication_style || null,
      }

      let result: { ok: boolean; error?: string; data?: Record<string, unknown> }
      if (personalityId) {
        result = await supabasePatch('brand_personalities', personalityId, saveData)
      } else {
        result = await supabaseInsert('brand_personalities', saveData)
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
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        読み込み中...
      </p>
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
        ブランドパーソナリティ
      </h2>

      <div style={commonStyles.card}>
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 特性（5つ固定） */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>特性（5つ）</label>
            <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 12px' }}>
              ブランドの性格を表す特性とスコア（1〜10）を設定します
            </p>
            {personality.traits.map((trait, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: 8,
                marginBottom: 8,
                alignItems: 'center',
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: colors.textSecondary,
                  minWidth: 20,
                }}>
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={trait.name}
                  onChange={(e) => updateTrait(index, 'name', e.target.value)}
                  placeholder="特性名"
                  style={{ ...commonStyles.input, flex: 1 }}
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={trait.score}
                  onChange={(e) => updateTrait(index, 'score', parseInt(e.target.value) || 5)}
                  style={{ ...commonStyles.input, width: 70, textAlign: 'center' }}
                />
                <input
                  type="text"
                  value={trait.description}
                  onChange={(e) => updateTrait(index, 'description', e.target.value)}
                  placeholder="この特性の説明"
                  style={{ ...commonStyles.input, flex: 2 }}
                />
              </div>
            ))}
          </div>

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
            style={{
              ...commonStyles.button,
              marginTop: 8,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  )
}
