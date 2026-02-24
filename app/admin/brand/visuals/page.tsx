'use client'

// ブランドビジュアル 編集ページ（ロゴセクション＋カラー＋フォント＋ガイドライン）
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { colors, commonStyles } from '../../components/AdminStyles'

type Fonts = { primary: string; secondary: string }
type LogoItem = { url: string; caption: string }
type LogoSection = { title: string; items: LogoItem[] }

type Visuals = {
  primary_color: string
  secondary_color: string
  accent_color: string
  fonts: Fonts
  visual_guidelines: string
  logo_sections: LogoSection[]
}

export default function BrandVisualsPage() {
  const { companyId } = useAuth()
  const [visualsId, setVisualsId] = useState<string | null>(null)
  const [visuals, setVisuals] = useState<Visuals>({
    primary_color: '#1a1a1a',
    secondary_color: '#666666',
    accent_color: '#2563eb',
    fonts: { primary: '', secondary: '' },
    visual_guidelines: '',
    logo_sections: [],
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const fetchVisuals = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')
    try {
      const result = await Promise.race([
        supabase.from('brand_visuals').select('*').eq('company_id', companyId).single(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ])
      if (result.data) {
        setVisualsId(result.data.id)
        setVisuals({
          primary_color: result.data.primary_color || '#1a1a1a',
          secondary_color: result.data.secondary_color || '#666666',
          accent_color: result.data.accent_color || '#2563eb',
          fonts: result.data.fonts || { primary: '', secondary: '' },
          visual_guidelines: result.data.visual_guidelines || '',
          logo_sections: result.data.logo_sections || [],
        })
      }
    } catch (err) {
      console.error('[BrandVisuals] データ取得エラー:', err)
      setFetchError(err instanceof Error && err.message === 'timeout' ? 'データの取得がタイムアウトしました' : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!companyId) return
    fetchVisuals()
  }, [companyId])

  const handleChange = (field: keyof Visuals, value: unknown) => {
    setVisuals(prev => ({ ...prev, [field]: value }))
  }

  const handleFontChange = (field: 'primary' | 'secondary', value: string) => {
    setVisuals(prev => ({ ...prev, fonts: { ...prev.fonts, [field]: value } }))
  }

  // --- ロゴセクション操作 ---
  const addSection = () => {
    if (visuals.logo_sections.length >= 10) return
    handleChange('logo_sections', [...visuals.logo_sections, { title: '', items: [] }])
  }

  const updateSectionTitle = (sIdx: number, title: string) => {
    const updated = [...visuals.logo_sections]
    updated[sIdx] = { ...updated[sIdx], title }
    handleChange('logo_sections', updated)
  }

  const removeSection = (sIdx: number) => {
    handleChange('logo_sections', visuals.logo_sections.filter((_, i) => i !== sIdx))
  }

  const updateItemCaption = (sIdx: number, iIdx: number, caption: string) => {
    const updated = [...visuals.logo_sections]
    const items = [...updated[sIdx].items]
    items[iIdx] = { ...items[iIdx], caption }
    updated[sIdx] = { ...updated[sIdx], items }
    handleChange('logo_sections', updated)
  }

  const removeItem = async (sIdx: number, iIdx: number) => {
    const item = visuals.logo_sections[sIdx].items[iIdx]
    // Storage から画像を削除（URLからパスを抽出）
    if (item.url) {
      try {
        const pathMatch = item.url.match(/\/brand-assets\/(.+)$/)
        if (pathMatch) {
          await supabase.storage.from('brand-assets').remove([pathMatch[1]])
        }
      } catch {
        // Storage 削除エラーは無視
      }
    }
    const updated = [...visuals.logo_sections]
    const items = updated[sIdx].items.filter((_, i) => i !== iIdx)
    updated[sIdx] = { ...updated[sIdx], items }
    handleChange('logo_sections', updated)
  }

  // 画像アップロード
  const handleImageUpload = async (sIdx: number, file: File) => {
    if (!companyId) return
    const key = `${sIdx}`
    setUploadingKey(key)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!ext || !['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
        alert('対応形式: PNG, JPG, SVG, WebP')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください')
        return
      }

      const fileName = `${companyId}/logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('brand-assets').upload(fileName, file, { upsert: true })

      if (error) {
        alert('アップロードに失敗しました: ' + error.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(fileName)

      const updated = [...visuals.logo_sections]
      updated[sIdx] = {
        ...updated[sIdx],
        items: [...updated[sIdx].items, { url: publicUrl, caption: '' }],
      }
      handleChange('logo_sections', updated)
    } catch (err) {
      alert('アップロードエラー: ' + (err instanceof Error ? err.message : '不明'))
    } finally {
      setUploadingKey(null)
      // ファイル入力をリセット
      const ref = fileInputRefs.current[`section-${sIdx}`]
      if (ref) ref.value = ''
    }
  }

  // REST API helpers
  const supabasePatch = async (table: string, id: string, data: Record<string, unknown>, token: string) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', 'Authorization': `Bearer ${token}`, 'Prefer': 'return=minimal' }, body: JSON.stringify(data), signal: controller.signal })
      clearTimeout(tid)
      if (!res.ok) { const body = await res.text(); return { ok: false, error: `HTTP ${res.status}: ${body}` } }
      return { ok: true }
    } catch (err) { clearTimeout(tid); return { ok: false, error: err instanceof DOMException && err.name === 'AbortError' ? 'タイムアウト' : (err instanceof Error ? err.message : '不明なエラー') } }
  }

  const supabaseInsert = async (table: string, data: Record<string, unknown>, token: string) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', 'Authorization': `Bearer ${token}`, 'Prefer': 'return=representation' }, body: JSON.stringify(data), signal: controller.signal })
      clearTimeout(tid)
      if (!res.ok) { const body = await res.text(); return { ok: false as const, error: `HTTP ${res.status}: ${body}` } }
      const result = await res.json()
      return { ok: true as const, data: result[0] }
    } catch (err) { clearTimeout(tid); return { ok: false as const, error: err instanceof DOMException && err.name === 'AbortError' ? 'タイムアウト' : (err instanceof Error ? err.message : '不明なエラー') } }
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

      // セクション内の空タイトルセクションも保存（画像があれば）
      const cleanedSections = visuals.logo_sections
        .filter(s => s.title.trim() !== '' || s.items.length > 0)
        .map(s => ({ ...s, items: s.items.filter(item => item.url) }))

      const saveData: Record<string, unknown> = {
        company_id: companyId,
        primary_color: visuals.primary_color,
        secondary_color: visuals.secondary_color,
        accent_color: visuals.accent_color,
        fonts: visuals.fonts,
        visual_guidelines: visuals.visual_guidelines || null,
        logo_sections: cleanedSections,
      }

      let result: { ok: boolean; error?: string; data?: Record<string, unknown> }
      if (visualsId) {
        result = await supabasePatch('brand_visuals', visualsId, saveData, token)
      } else {
        result = await supabaseInsert('brand_visuals', saveData, token)
        if (result.ok && 'data' in result && result.data) {
          setVisualsId(result.data.id as string)
        }
      }

      if (result.ok) {
        setMessage('保存しました')
        setMessageType('success')
        handleChange('logo_sections', cleanedSections)
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

  if (loading) return <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>読み込み中...</p>
  if (fetchError) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{fetchError}</p>
      <button onClick={fetchVisuals} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>再読み込み</button>
    </div>
  )

  const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div style={commonStyles.formGroup}>
      <label style={commonStyles.label}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 48, height: 48, border: `1px solid ${colors.inputBorder}`, borderRadius: 8, cursor: 'pointer', padding: 2 }} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={{ ...commonStyles.input, width: 140 }} />
        <div style={{ width: 80, height: 40, backgroundColor: value, borderRadius: 6, border: `1px solid ${colors.border}` }} />
      </div>
    </div>
  )

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 24px' }}>
        ブランドビジュアル
      </h2>

      <div style={commonStyles.card}>
        {message && <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>{message}</div>}

        <form onSubmit={handleSubmit}>
          {/* ロゴガイドライン */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 8px' }}>
              ロゴガイドライン
            </h3>
            <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 16px' }}>
              セクションごとにロゴ画像とキャプションを管理します（最大10セクション）
            </p>

            {visuals.logo_sections.map((section, sIdx) => (
              <div key={sIdx} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
                {/* セクションヘッダー */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                    placeholder="セクションタイトル（例: ロゴ）"
                    style={{ ...commonStyles.input, flex: 1, fontWeight: 'bold' }}
                  />
                  <button type="button" onClick={() => removeSection(sIdx)} style={{ ...commonStyles.dangerButton, padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
                    セクション削除
                  </button>
                </div>

                {/* 画像グリッド */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, overflow: 'hidden' }}>
                      {/* サムネイル */}
                      <div style={{ backgroundColor: '#f5f5f5', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
                        <img src={item.url} alt={item.caption || ''} style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain' }} />
                      </div>
                      {/* キャプション＋削除 */}
                      <div style={{ padding: 8 }}>
                        <input
                          type="text"
                          value={item.caption}
                          onChange={(e) => updateItemCaption(sIdx, iIdx, e.target.value)}
                          placeholder="キャプション"
                          style={{ ...commonStyles.input, fontSize: 12, padding: '4px 8px' }}
                        />
                        <button type="button" onClick={() => removeItem(sIdx, iIdx)} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, padding: 0 }}>
                          画像を削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 画像追加 */}
                {section.items.length < 10 && (
                  <div>
                    <input
                      ref={el => { fileInputRefs.current[`section-${sIdx}`] = el }}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(sIdx, file)
                      }}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[`section-${sIdx}`]?.click()}
                      disabled={uploadingKey === `${sIdx}`}
                      style={{ ...commonStyles.buttonOutline, padding: '6px 12px', fontSize: 12 }}
                    >
                      {uploadingKey === `${sIdx}` ? 'アップロード中...' : '+ 画像を追加'}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {visuals.logo_sections.length < 10 && (
              <button type="button" onClick={addSection} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
                + セクションを追加
              </button>
            )}
          </div>

          {/* 区切り */}
          <div style={{ borderTop: `1px solid ${colors.border}`, margin: '8px 0 20px' }} />

          {/* カラー */}
          <ColorField label="プライマリカラー" value={visuals.primary_color} onChange={(v) => handleChange('primary_color', v)} />
          <ColorField label="セカンダリカラー" value={visuals.secondary_color} onChange={(v) => handleChange('secondary_color', v)} />
          <ColorField label="アクセントカラー" value={visuals.accent_color} onChange={(v) => handleChange('accent_color', v)} />

          {/* フォント */}
          <div style={{ marginTop: 8, marginBottom: 20, paddingTop: 20, borderTop: `1px solid ${colors.border}` }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 16px' }}>フォント設定</h3>
            <div style={commonStyles.formGroup}>
              <label style={commonStyles.label}>プライマリフォント</label>
              <input type="text" value={visuals.fonts.primary} onChange={(e) => handleFontChange('primary', e.target.value)} placeholder="Noto Sans JP" style={commonStyles.input} />
            </div>
            <div style={commonStyles.formGroup}>
              <label style={commonStyles.label}>セカンダリフォント</label>
              <input type="text" value={visuals.fonts.secondary} onChange={(e) => handleFontChange('secondary', e.target.value)} placeholder="Inter" style={commonStyles.input} />
            </div>
          </div>

          {/* ビジュアルガイドライン */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ビジュアルガイドライン</label>
            <textarea value={visuals.visual_guidelines} onChange={(e) => handleChange('visual_guidelines', e.target.value)} placeholder="写真のトーン、イラストのスタイルなど" style={{ ...commonStyles.textarea, minHeight: 100 }} />
          </div>

          <button type="submit" disabled={saving} style={{ ...commonStyles.button, marginTop: 8, opacity: saving ? 0.6 : 1 }}>
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  )
}
