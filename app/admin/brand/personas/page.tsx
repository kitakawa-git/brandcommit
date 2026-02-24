'use client'

// 顧客ペルソナ 編集ページ（全削除→全INSERT方式）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { colors, commonStyles } from '../../components/AdminStyles'

type PersonaItem = {
  name: string
  age_range: string
  occupation: string
  description: string
  needs: string[]
  pain_points: string[]
}

const emptyPersona = (): PersonaItem => ({
  name: '',
  age_range: '',
  occupation: '',
  description: '',
  needs: [],
  pain_points: [],
})

export default function BrandPersonasPage() {
  const { companyId } = useAuth()
  const [personas, setPersonas] = useState<PersonaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchPersonas = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('brand_personas')
          .select('*')
          .eq('company_id', companyId)
          .order('sort_order'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.error) throw new Error(result.error.message)
      if (result.data && result.data.length > 0) {
        setPersonas(result.data.map((d: Record<string, unknown>) => ({
          name: (d.name as string) || '',
          age_range: (d.age_range as string) || '',
          occupation: (d.occupation as string) || '',
          description: (d.description as string) || '',
          needs: (d.needs as string[]) || [],
          pain_points: (d.pain_points as string[]) || [],
        })))
      }
    } catch (err) {
      console.error('[BrandPersonas] データ取得エラー:', err)
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
    fetchPersonas()
  }, [companyId])

  const addPersona = () => {
    if (personas.length >= 5) return
    setPersonas([...personas, emptyPersona()])
  }

  const updatePersona = (index: number, field: keyof PersonaItem, value: string | string[]) => {
    const updated = [...personas]
    updated[index] = { ...updated[index], [field]: value }
    setPersonas(updated)
  }

  const removePersona = (index: number) => {
    setPersonas(personas.filter((_, i) => i !== index))
  }

  // ニーズの操作
  const addNeed = (personaIndex: number) => {
    const updated = [...personas]
    updated[personaIndex] = {
      ...updated[personaIndex],
      needs: [...updated[personaIndex].needs, ''],
    }
    setPersonas(updated)
  }

  const updateNeed = (personaIndex: number, needIndex: number, value: string) => {
    const updated = [...personas]
    const needs = [...updated[personaIndex].needs]
    needs[needIndex] = value
    updated[personaIndex] = { ...updated[personaIndex], needs }
    setPersonas(updated)
  }

  const removeNeed = (personaIndex: number, needIndex: number) => {
    const updated = [...personas]
    updated[personaIndex] = {
      ...updated[personaIndex],
      needs: updated[personaIndex].needs.filter((_, i) => i !== needIndex),
    }
    setPersonas(updated)
  }

  // 課題の操作
  const addPainPoint = (personaIndex: number) => {
    const updated = [...personas]
    updated[personaIndex] = {
      ...updated[personaIndex],
      pain_points: [...updated[personaIndex].pain_points, ''],
    }
    setPersonas(updated)
  }

  const updatePainPoint = (personaIndex: number, pointIndex: number, value: string) => {
    const updated = [...personas]
    const pain_points = [...updated[personaIndex].pain_points]
    pain_points[pointIndex] = value
    updated[personaIndex] = { ...updated[personaIndex], pain_points }
    setPersonas(updated)
  }

  const removePainPoint = (personaIndex: number, pointIndex: number) => {
    const updated = [...personas]
    updated[personaIndex] = {
      ...updated[personaIndex],
      pain_points: updated[personaIndex].pain_points.filter((_, i) => i !== pointIndex),
    }
    setPersonas(updated)
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
      const delRes = await fetch(`${supabaseUrl}/rest/v1/brand_personas?company_id=eq.${companyId}`, {
        method: 'DELETE',
        headers,
      })
      if (!delRes.ok) {
        const body = await delRes.text()
        throw new Error(`削除エラー: HTTP ${delRes.status}: ${body}`)
      }

      // 2. 現在のリストを全INSERT（名前・年齢層・職業のいずれかが入力されていれば登録）
      const cleanedPersonas = personas.filter(p =>
        p.name.trim() !== '' || p.age_range.trim() !== '' || p.occupation.trim() !== ''
      )
      if (cleanedPersonas.length > 0) {
        const insertData = cleanedPersonas.map((p, i) => ({
          company_id: companyId,
          name: p.name,
          age_range: p.age_range || null,
          occupation: p.occupation || null,
          description: p.description || null,
          needs: p.needs.filter(n => n.trim() !== ''),
          pain_points: p.pain_points.filter(pp => pp.trim() !== ''),
          sort_order: i,
        }))

        const insRes = await fetch(`${supabaseUrl}/rest/v1/brand_personas`, {
          method: 'POST',
          headers,
          body: JSON.stringify(insertData),
        })
        if (!insRes.ok) {
          const body = await insRes.text()
          throw new Error(`挿入エラー: HTTP ${insRes.status}: ${body}`)
        }
      }

      setPersonas(cleanedPersonas)
      setMessage('保存しました')
      setMessageType('success')
    } catch (err) {
      console.error('[BrandPersonas Save] エラー:', err)
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
        <button onClick={fetchPersonas} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
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
        顧客ペルソナ
      </h2>

      <div style={commonStyles.card}>
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 16px' }}>
            ターゲット顧客のペルソナを設定します（最大5件）
          </p>

          {personas.map((persona, index) => (
            <div key={index} style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: colors.textSecondary }}>
                  ペルソナ {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePersona(index)}
                  style={{
                    ...commonStyles.dangerButton,
                    padding: '4px 12px',
                    fontSize: 12,
                  }}
                >
                  削除
                </button>
              </div>

              {/* ペルソナ名称 */}
              <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>ペルソナ名称</label>
                <input
                  type="text"
                  value={persona.name}
                  onChange={(e) => updatePersona(index, 'name', e.target.value)}
                  placeholder="例: 情報感度の高いマーケター"
                  style={commonStyles.input}
                />
              </div>

              {/* 年齢層・職業 */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
                <div style={{ ...commonStyles.formGroup, flex: 1 }}>
                  <label style={commonStyles.label}>年齢層</label>
                  <input
                    type="text"
                    value={persona.age_range}
                    onChange={(e) => updatePersona(index, 'age_range', e.target.value)}
                    placeholder="例: 30-40代"
                    style={commonStyles.input}
                  />
                </div>
                <div style={{ ...commonStyles.formGroup, flex: 1 }}>
                  <label style={commonStyles.label}>職業</label>
                  <input
                    type="text"
                    value={persona.occupation}
                    onChange={(e) => updatePersona(index, 'occupation', e.target.value)}
                    placeholder="例: マーケティング担当者"
                    style={commonStyles.input}
                  />
                </div>
              </div>

              {/* 説明 */}
              <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>説明</label>
                <textarea
                  value={persona.description}
                  onChange={(e) => updatePersona(index, 'description', e.target.value)}
                  placeholder="このペルソナの背景や特徴"
                  style={{ ...commonStyles.textarea, minHeight: 80 }}
                />
              </div>

              {/* ニーズ */}
              <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>ニーズ</label>
                {persona.needs.map((need, needIndex) => (
                  <div key={needIndex} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={need}
                      onChange={(e) => updateNeed(index, needIndex, e.target.value)}
                      placeholder={`ニーズ ${needIndex + 1}`}
                      style={{ ...commonStyles.input, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNeed(index, needIndex)}
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
                  onClick={() => addNeed(index)}
                  style={{
                    ...commonStyles.buttonOutline,
                    padding: '6px 12px',
                    fontSize: 12,
                  }}
                >
                  + ニーズを追加
                </button>
              </div>

              {/* 課題 */}
              <div style={{ marginBottom: 0 }}>
                <label style={commonStyles.label}>課題・ペインポイント</label>
                {persona.pain_points.map((point, pointIndex) => (
                  <div key={pointIndex} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updatePainPoint(index, pointIndex, e.target.value)}
                      placeholder={`課題 ${pointIndex + 1}`}
                      style={{ ...commonStyles.input, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removePainPoint(index, pointIndex)}
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
                  onClick={() => addPainPoint(index)}
                  style={{
                    ...commonStyles.buttonOutline,
                    padding: '6px 12px',
                    fontSize: 12,
                  }}
                >
                  + 課題を追加
                </button>
              </div>
            </div>
          ))}

          {personas.length < 5 && (
            <button
              type="button"
              onClick={addPersona}
              style={{
                ...commonStyles.buttonOutline,
                padding: '8px 16px',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              + ペルソナを追加
            </button>
          )}

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
