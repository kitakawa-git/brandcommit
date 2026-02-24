'use client'

// ブランド方針 編集ページ（MVV・スローガン・ストーリー等）
// コードパターン: app/admin/company/page.tsx に準拠
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { colors, commonStyles } from '../../components/AdminStyles'

type ValueItem = {
  name: string
  description: string
}

type Guidelines = {
  mission: string
  vision: string
  values: ValueItem[]
  slogan: string
  brand_statement: string
  brand_story: string
  brand_video_url: string
}

export default function BrandGuidelinesPage() {
  const { companyId } = useAuth()
  const [guidelinesId, setGuidelinesId] = useState<string | null>(null)
  const [guidelines, setGuidelines] = useState<Guidelines>({
    mission: '',
    vision: '',
    values: [],
    slogan: '',
    brand_statement: '',
    brand_story: '',
    brand_video_url: '',
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
          mission: result.data.mission || '',
          vision: result.data.vision || '',
          values: result.data.values || [],
          slogan: result.data.slogan || '',
          brand_statement: result.data.brand_statement || '',
          brand_story: result.data.brand_story || '',
          brand_video_url: result.data.brand_video_url || '',
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

  const handleChange = (field: keyof Guidelines, value: string | ValueItem[]) => {
    setGuidelines(prev => ({ ...prev, [field]: value }))
  }

  // バリューの追加
  const addValue = () => {
    if (guidelines.values.length >= 10) return
    handleChange('values', [...guidelines.values, { name: '', description: '' }])
  }

  // バリューの更新
  const updateValue = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...guidelines.values]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('values', updated)
  }

  // バリューの削除
  const removeValue = (index: number) => {
    const updated = guidelines.values.filter((_, i) => i !== index)
    handleChange('values', updated)
  }

  // URL正規化: http(s)://がなければhttps://を自動付与、空欄はそのまま
  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    return 'https://' + trimmed
  }

  // Supabase REST APIに直接fetchで保存（JSクライアントの認証ハングを回避）
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
        return { ok: false, error: 'タイムアウト（10秒）: サーバーからの応答がありません。' }
      }
      return { ok: false, error: err instanceof Error ? err.message : '不明なエラー' }
    }
  }

  // Supabase REST APIに直接fetchでINSERT
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
        return { ok: false, error: 'タイムアウト（10秒）: サーバーからの応答がありません。' }
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
      // セッショントークンを取得（RLSポリシー用）
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      // 空のバリューを除外
      const cleanedValues = guidelines.values.filter(v => v.name.trim() !== '')

      const saveData: Record<string, unknown> = {
        company_id: companyId,
        mission: guidelines.mission || null,
        vision: guidelines.vision || null,
        values: cleanedValues.length > 0 ? cleanedValues : [],
        slogan: guidelines.slogan || null,
        brand_statement: guidelines.brand_statement || null,
        brand_story: guidelines.brand_story || null,
        brand_video_url: guidelines.brand_video_url ? normalizeUrl(guidelines.brand_video_url) : null,
      }

      console.log('[BrandGuidelines Save] 保存開始', { guidelinesId, companyId })

      let result: { ok: boolean; error?: string; data?: Record<string, unknown> }

      if (guidelinesId) {
        // 既存レコードの更新
        result = await supabasePatch('brand_guidelines', guidelinesId, saveData, token)
      } else {
        // 新規作成
        result = await supabaseInsert('brand_guidelines', saveData, token)
        if (result.ok && result.data) {
          setGuidelinesId(result.data.id as string)
        }
      }

      if (result.ok) {
        console.log('[BrandGuidelines Save] 保存成功')
        setMessage('保存しました')
        setMessageType('success')
        handleChange('values', cleanedValues)
        if (guidelines.brand_video_url) {
          handleChange('brand_video_url', normalizeUrl(guidelines.brand_video_url))
        }
      } else {
        console.error('[BrandGuidelines Save] エラー:', result.error)
        setMessage('保存に失敗しました: ' + result.error)
        setMessageType('error')
      }
    } catch (err) {
      console.error('[BrandGuidelines Save] 予期しないエラー:', err)
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました'
      setMessage('保存に失敗しました: ' + errorMessage)
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
        <button onClick={fetchGuidelines} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
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
        ブランド方針
      </h2>

      <div style={commonStyles.card}>
        {/* メッセージ */}
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ミッション */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ミッション</label>
            <textarea
              value={guidelines.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              placeholder="私たちの使命は..."
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          {/* ビジョン */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ビジョン</label>
            <textarea
              value={guidelines.vision}
              onChange={(e) => handleChange('vision', e.target.value)}
              placeholder="私たちが目指す未来は..."
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          {/* バリュー */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>バリュー（最大10個）</label>
            <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 8px' }}>
              企業が大切にする価値観を設定します
            </p>
            {guidelines.values.map((value, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: 8,
                marginBottom: 8,
                alignItems: 'flex-start',
              }}>
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
                <button
                  type="button"
                  onClick={() => removeValue(index)}
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
            {guidelines.values.length < 10 && (
              <button
                type="button"
                onClick={addValue}
                style={{
                  ...commonStyles.buttonOutline,
                  padding: '8px 16px',
                  fontSize: 13,
                }}
              >
                + バリューを追加
              </button>
            )}
          </div>

          {/* スローガン */}
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

          {/* ブランドステートメント */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドステートメント</label>
            <textarea
              value={guidelines.brand_statement}
              onChange={(e) => handleChange('brand_statement', e.target.value)}
              placeholder="ブランドとしての宣言文"
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          {/* ブランドストーリー */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドストーリー</label>
            <textarea
              value={guidelines.brand_story}
              onChange={(e) => handleChange('brand_story', e.target.value)}
              placeholder="企業の成り立ちや想いを物語として..."
              style={{ ...commonStyles.textarea, minHeight: 200 }}
            />
          </div>

          {/* ブランド動画URL */}
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

          {/* 保存ボタン */}
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
