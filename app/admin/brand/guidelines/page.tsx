'use client'

// ブランド方針 編集ページ
// スローガン・コンセプトビジュアル・動画・メッセージ・MVV・ストーリー・沿革・事業内容・特性
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { ImageUpload } from '../../components/ImageUpload'
import { colors, commonStyles } from '../../components/AdminStyles'

type ValueItem = { name: string; description: string }
type HistoryItem = { year: string; event: string }
type BusinessItem = { title: string; description: string }
type TraitItem = { name: string; score: number; description: string }

type Guidelines = {
  slogan: string
  concept_visual_url: string
  brand_video_url: string
  brand_statement: string
  mission: string
  vision: string
  values: ValueItem[]
  brand_story: string
  history: HistoryItem[]
  business_content: BusinessItem[]
  traits: TraitItem[]
}

export default function BrandGuidelinesPage() {
  const { companyId } = useAuth()
  const [guidelinesId, setGuidelinesId] = useState<string | null>(null)
  const [guidelines, setGuidelines] = useState<Guidelines>({
    slogan: '',
    concept_visual_url: '',
    brand_video_url: '',
    brand_statement: '',
    mission: '',
    vision: '',
    values: [],
    brand_story: '',
    history: [],
    business_content: [],
    traits: [],
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchGuidelines = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('brand_guidelines')
          .select('*')
          .eq('company_id', companyId)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.data) {
        setGuidelinesId(result.data.id)
        setGuidelines({
          slogan: result.data.slogan || '',
          concept_visual_url: result.data.concept_visual_url || '',
          brand_video_url: result.data.brand_video_url || '',
          brand_statement: result.data.brand_statement || '',
          mission: result.data.mission || '',
          vision: result.data.vision || '',
          values: result.data.values || [],
          brand_story: result.data.brand_story || '',
          history: result.data.history || [],
          business_content: result.data.business_content || [],
          traits: result.data.traits || [],
        })
      }
    } catch (err) {
      console.error('[BrandGuidelines] データ取得エラー:', err)
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
    fetchGuidelines()
  }, [companyId])

  // --- ジェネリック更新 ---
  const handleChange = (field: keyof Guidelines, value: unknown) => {
    setGuidelines(prev => ({ ...prev, [field]: value }))
  }

  // --- バリュー ---
  const addValue = () => {
    if (guidelines.values.length >= 10) return
    handleChange('values', [...guidelines.values, { name: '', description: '' }])
  }
  const updateValue = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...guidelines.values]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('values', updated)
  }
  const removeValue = (index: number) => {
    handleChange('values', guidelines.values.filter((_, i) => i !== index))
  }

  // --- 沿革 ---
  const addHistory = () => {
    handleChange('history', [...guidelines.history, { year: '', event: '' }])
  }
  const updateHistory = (index: number, field: 'year' | 'event', value: string) => {
    const updated = [...guidelines.history]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('history', updated)
  }
  const removeHistory = (index: number) => {
    handleChange('history', guidelines.history.filter((_, i) => i !== index))
  }

  // --- 事業内容 ---
  const addBusiness = () => {
    handleChange('business_content', [...guidelines.business_content, { title: '', description: '' }])
  }
  const updateBusiness = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...guidelines.business_content]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('business_content', updated)
  }
  const removeBusiness = (index: number) => {
    handleChange('business_content', guidelines.business_content.filter((_, i) => i !== index))
  }

  // --- ブランド特性 ---
  const addTrait = () => {
    if (guidelines.traits.length >= 5) return
    handleChange('traits', [...guidelines.traits, { name: '', score: 5, description: '' }])
  }
  const updateTrait = (index: number, field: keyof TraitItem, value: string | number) => {
    const updated = [...guidelines.traits]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('traits', updated)
  }
  const removeTrait = (index: number) => {
    handleChange('traits', guidelines.traits.filter((_, i) => i !== index))
  }

  // URL正規化
  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    return 'https://' + trimmed
  }

  // Supabase REST API直接fetch (PATCH)
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

  // Supabase REST API直接fetch (INSERT)
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

      const cleanedValues = guidelines.values.filter(v => v.name.trim() !== '')
      const cleanedHistory = guidelines.history.filter(h => h.year.trim() !== '' || h.event.trim() !== '')
      const cleanedBusiness = guidelines.business_content.filter(b => b.title.trim() !== '')
      const cleanedTraits = guidelines.traits.filter(t => t.name.trim() !== '')

      const saveData: Record<string, unknown> = {
        company_id: companyId,
        slogan: guidelines.slogan || null,
        concept_visual_url: guidelines.concept_visual_url || null,
        brand_video_url: guidelines.brand_video_url ? normalizeUrl(guidelines.brand_video_url) : null,
        brand_statement: guidelines.brand_statement || null,
        mission: guidelines.mission || null,
        vision: guidelines.vision || null,
        values: cleanedValues.length > 0 ? cleanedValues : [],
        brand_story: guidelines.brand_story || null,
        history: cleanedHistory.length > 0 ? cleanedHistory : [],
        business_content: cleanedBusiness.length > 0 ? cleanedBusiness : [],
        traits: cleanedTraits.length > 0 ? cleanedTraits : [],
      }

      let result: { ok: boolean; error?: string; data?: Record<string, unknown> }

      if (guidelinesId) {
        result = await supabasePatch('brand_guidelines', guidelinesId, saveData, token)
      } else {
        result = await supabaseInsert('brand_guidelines', saveData, token)
        if (result.ok && result.data) {
          setGuidelinesId(result.data.id as string)
        }
      }

      if (result.ok) {
        setMessage('保存しました')
        setMessageType('success')
        handleChange('values', cleanedValues)
        handleChange('history', cleanedHistory)
        handleChange('business_content', cleanedBusiness)
        handleChange('traits', cleanedTraits)
        if (guidelines.brand_video_url) {
          handleChange('brand_video_url', normalizeUrl(guidelines.brand_video_url))
        }
      } else {
        setMessage('保存に失敗しました: ' + result.error)
        setMessageType('error')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました'
      setMessage('保存に失敗しました: ' + errorMessage)
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
        <button onClick={fetchGuidelines} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>再読み込み</button>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 24px' }}>
        ブランド方針
      </h2>

      <div style={commonStyles.card}>
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. スローガン */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>スローガン</label>
            <input
              type="text"
              value={guidelines.slogan}
              onChange={(e) => handleChange('slogan', e.target.value)}
              placeholder="企業スローガン"
              style={commonStyles.input}
            />
          </div>

          {/* 2. コンセプトビジュアル */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>コンセプトビジュアル</label>
            <ImageUpload
              bucket="avatars"
              folder="concept-visuals"
              currentUrl={guidelines.concept_visual_url}
              onUpload={(url) => handleChange('concept_visual_url', url)}
            />
          </div>

          {/* 3. ブランド動画URL */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランド動画URL</label>
            <input
              type="text"
              value={guidelines.brand_video_url}
              onChange={(e) => handleChange('brand_video_url', e.target.value)}
              placeholder="https://youtube.com/..."
              style={commonStyles.input}
            />
          </div>

          {/* 4. メッセージ（旧ブランドステートメント） */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>メッセージ</label>
            <textarea
              value={guidelines.brand_statement}
              onChange={(e) => handleChange('brand_statement', e.target.value)}
              placeholder="ブランドとしてのメッセージ"
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          {/* 5. ミッション */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ミッション</label>
            <textarea
              value={guidelines.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              placeholder="私たちの使命は..."
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          {/* 6. ビジョン */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ビジョン</label>
            <textarea
              value={guidelines.vision}
              onChange={(e) => handleChange('vision', e.target.value)}
              placeholder="私たちが目指す未来は..."
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          {/* 7. バリュー */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>バリュー（最大10個）</label>
            <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 8px' }}>
              企業が大切にする価値観を設定します
            </p>
            {guidelines.values.map((value, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <input
                  type="text"
                  value={value.name}
                  onChange={(e) => updateValue(index, 'name', e.target.value)}
                  placeholder={`バリュー名 ${index + 1}`}
                  style={{ ...commonStyles.input, flex: 1 }}
                />
                <input
                  type="text"
                  value={value.description}
                  onChange={(e) => updateValue(index, 'description', e.target.value)}
                  placeholder="説明"
                  style={{ ...commonStyles.input, flex: 2 }}
                />
                <button type="button" onClick={() => removeValue(index)} style={{ ...commonStyles.dangerButton, padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
                  削除
                </button>
              </div>
            ))}
            {guidelines.values.length < 10 && (
              <button type="button" onClick={addValue} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
                + バリューを追加
              </button>
            )}
          </div>

          {/* 8. ブランドストーリー */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドストーリー</label>
            <textarea
              value={guidelines.brand_story}
              onChange={(e) => handleChange('brand_story', e.target.value)}
              placeholder="企業の成り立ちや想いを物語として..."
              style={{ ...commonStyles.textarea, minHeight: 200 }}
            />
          </div>

          {/* 9. 沿革 */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>沿革</label>
            <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 8px' }}>
              企業の歩みを年と出来事で記録します
            </p>
            {guidelines.history.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={item.year}
                  onChange={(e) => updateHistory(index, 'year', e.target.value)}
                  placeholder="年"
                  style={{ ...commonStyles.input, width: 80, flexShrink: 0 }}
                />
                <input
                  type="text"
                  value={item.event}
                  onChange={(e) => updateHistory(index, 'event', e.target.value)}
                  placeholder="出来事"
                  style={{ ...commonStyles.input, flex: 1 }}
                />
                <button type="button" onClick={() => removeHistory(index)} style={{ ...commonStyles.dangerButton, padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
                  削除
                </button>
              </div>
            ))}
            <button type="button" onClick={addHistory} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
              + 沿革を追加
            </button>
          </div>

          {/* 10. 事業内容 */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>事業内容</label>
            {guidelines.business_content.map((item, index) => (
              <div key={index} style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateBusiness(index, 'title', e.target.value)}
                    placeholder="事業タイトル"
                    style={{ ...commonStyles.input, flex: 1 }}
                  />
                  <button type="button" onClick={() => removeBusiness(index)} style={{ ...commonStyles.dangerButton, padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
                    削除
                  </button>
                </div>
                <textarea
                  value={item.description}
                  onChange={(e) => updateBusiness(index, 'description', e.target.value)}
                  placeholder="事業の説明"
                  style={{ ...commonStyles.textarea, minHeight: 60 }}
                />
              </div>
            ))}
            <button type="button" onClick={addBusiness} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
              + 事業内容を追加
            </button>
          </div>

          {/* 11. ブランド特性 */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランド特性（最大5つ）</label>
            <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 8px' }}>
              ブランドの性格を表す特性とスコア（1〜10）を設定します
            </p>
            {guidelines.traits.map((trait, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
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
                <button type="button" onClick={() => removeTrait(index)} style={{ ...commonStyles.dangerButton, padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
                  削除
                </button>
              </div>
            ))}
            {guidelines.traits.length < 5 && (
              <button type="button" onClick={addTrait} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
                + 特性を追加
              </button>
            )}
          </div>

          {/* 保存ボタン */}
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
