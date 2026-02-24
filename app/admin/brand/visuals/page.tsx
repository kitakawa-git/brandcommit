'use client'

// ブランドビジュアル 編集ページ（1企業1レコード、upsert方式）
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { colors, commonStyles } from '../../components/AdminStyles'

type Fonts = {
  primary: string
  secondary: string
}

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
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const fetchVisuals = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('brand_visuals')
          .select('*')
          .eq('company_id', companyId)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.data) {
        setVisualsId(result.data.id)
        setVisuals({
          primary_color: result.data.primary_color || '#1a1a1a',
          secondary_color: result.data.secondary_color || '#666666',
          accent_color: result.data.accent_color || '#2563eb',
          fonts: result.data.fonts || { primary: '', secondary: '' },
          visual_guidelines: result.data.visual_guidelines || '',
          logo_sections: (result.data.logo_sections as LogoSection[]) || [],
        })
      }
    } catch (err) {
      console.error('[BrandVisuals] データ取得エラー:', err)
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
    fetchVisuals()
  }, [companyId])

  const handleChange = (field: keyof Visuals, value: string) => {
    setVisuals(prev => ({ ...prev, [field]: value }))
  }

  const handleFontChange = (field: 'primary' | 'secondary', value: string) => {
    setVisuals(prev => ({
      ...prev,
      fonts: { ...prev.fonts, [field]: value },
    }))
  }

  // --- ロゴセクション操作 ---
  const addSection = () => {
    if (visuals.logo_sections.length >= 10) return
    setVisuals(prev => ({
      ...prev,
      logo_sections: [...prev.logo_sections, { title: '', items: [] }],
    }))
  }

  const removeSection = (sIdx: number) => {
    setVisuals(prev => ({
      ...prev,
      logo_sections: prev.logo_sections.filter((_, i) => i !== sIdx),
    }))
  }

  const updateSectionTitle = (sIdx: number, title: string) => {
    setVisuals(prev => {
      const sections = [...prev.logo_sections]
      sections[sIdx] = { ...sections[sIdx], title }
      return { ...prev, logo_sections: sections }
    })
  }

  const handleImageUpload = async (sIdx: number, file: File) => {
    if (!companyId) return
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    const key = `${sIdx}`
    setUploadingMap(prev => ({ ...prev, [key]: true }))

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${companyId}/logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file, { upsert: true })

      if (error) {
        alert('アップロードに失敗しました: ' + error.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName)

      setVisuals(prev => {
        const sections = [...prev.logo_sections]
        const items = [...sections[sIdx].items, { url: publicUrl, caption: '' }]
        sections[sIdx] = { ...sections[sIdx], items }
        return { ...prev, logo_sections: sections }
      })
    } catch {
      alert('アップロード中にエラーが発生しました')
    } finally {
      setUploadingMap(prev => ({ ...prev, [key]: false }))
    }
  }

  const removeImage = async (sIdx: number, iIdx: number) => {
    const url = visuals.logo_sections[sIdx].items[iIdx].url
    // Storage から削除
    try {
      const pathMatch = url.match(/brand-assets\/(.+)$/)
      if (pathMatch) {
        await supabase.storage.from('brand-assets').remove([pathMatch[1]])
      }
    } catch {
      // Storage削除失敗は無視（UIからは消す）
    }

    setVisuals(prev => {
      const sections = [...prev.logo_sections]
      const items = sections[sIdx].items.filter((_, i) => i !== iIdx)
      sections[sIdx] = { ...sections[sIdx], items }
      return { ...prev, logo_sections: sections }
    })
  }

  const updateCaption = (sIdx: number, iIdx: number, caption: string) => {
    setVisuals(prev => {
      const sections = [...prev.logo_sections]
      const items = [...sections[sIdx].items]
      items[iIdx] = { ...items[iIdx], caption }
      sections[sIdx] = { ...sections[sIdx], items }
      return { ...prev, logo_sections: sections }
    })
  }

  // Supabase REST APIに直接fetchで保存
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

      // 空タイトル・空アイテムのセクションをクリーンアップ
      const cleanedSections = visuals.logo_sections
        .filter(s => s.title.trim() || s.items.length > 0)
        .map(s => ({
          title: s.title.trim(),
          items: s.items.map(item => ({ url: item.url, caption: item.caption.trim() })),
        }))

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
        if (result.ok && result.data) {
          setVisualsId(result.data.id as string)
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

  if (fetchError) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{fetchError}</p>
        <button onClick={fetchVisuals} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
          再読み込み
        </button>
      </div>
    )
  }

  // カラーピッカーUI
  const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div style={commonStyles.formGroup}>
      <label style={commonStyles.label}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 48,
            height: 48,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: 8,
            cursor: 'pointer',
            padding: 2,
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...commonStyles.input, width: 140 }}
        />
        <div style={{
          width: 80,
          height: 40,
          backgroundColor: value,
          borderRadius: 6,
          border: `1px solid ${colors.border}`,
        }} />
      </div>
    </div>
  )

  return (
    <div>
      <h2 style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        margin: '0 0 24px',
      }}>
        ブランドビジュアル
      </h2>

      <div style={commonStyles.card}>
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ロゴガイドライン */}
          <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${colors.border}` }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 16px' }}>
              ロゴガイドライン
            </h3>

            {visuals.logo_sections.map((section, sIdx) => (
              <div key={sIdx} style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}>
                {/* セクションヘッダー */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                    placeholder="セクションタイトル（例: ロゴ、余白の指定、禁止事項）"
                    style={{ ...commonStyles.input, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(sIdx)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      color: colors.danger,
                      border: `1px solid ${colors.danger}`,
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    削除
                  </button>
                </div>

                {/* 画像一覧 */}
                {section.items.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#f9fafb',
                      }}>
                        <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100, backgroundColor: '#f3f4f6' }}>
                          <img
                            src={item.url}
                            alt={item.caption || ''}
                            style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ padding: 8 }}>
                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => updateCaption(sIdx, iIdx, e.target.value)}
                            placeholder="キャプション"
                            style={{ ...commonStyles.input, fontSize: 12, padding: '6px 8px' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(sIdx, iIdx)}
                            style={{
                              marginTop: 6,
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              color: colors.danger,
                              border: 'none',
                              fontSize: 12,
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'center',
                            }}
                          >
                            画像を削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 画像追加 */}
                {section.items.length < 10 && (
                  <div>
                    <input
                      ref={(el) => { fileInputRefs.current[`file-${sIdx}`] = el }}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(sIdx, file)
                        e.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingMap[`${sIdx}`]}
                      onClick={() => fileInputRefs.current[`file-${sIdx}`]?.click()}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: 'transparent',
                        color: colors.textSecondary,
                        border: `1px dashed ${colors.inputBorder}`,
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {uploadingMap[`${sIdx}`] ? 'アップロード中...' : '+ 画像を追加'}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {visuals.logo_sections.length < 10 && (
              <button
                type="button"
                onClick={addSection}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}`,
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                + セクションを追加
              </button>
            )}
          </div>

          {/* カラー */}
          <ColorField label="プライマリカラー" value={visuals.primary_color} onChange={(v) => handleChange('primary_color', v)} />
          <ColorField label="セカンダリカラー" value={visuals.secondary_color} onChange={(v) => handleChange('secondary_color', v)} />
          <ColorField label="アクセントカラー" value={visuals.accent_color} onChange={(v) => handleChange('accent_color', v)} />

          {/* フォント設定 */}
          <div style={{
            marginTop: 8,
            marginBottom: 20,
            paddingTop: 20,
            borderTop: `1px solid ${colors.border}`,
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 16px' }}>
              フォント設定
            </h3>

            <div style={commonStyles.formGroup}>
              <label style={commonStyles.label}>プライマリフォント</label>
              <input
                type="text"
                value={visuals.fonts.primary}
                onChange={(e) => handleFontChange('primary', e.target.value)}
                placeholder="Noto Sans JP"
                style={commonStyles.input}
              />
            </div>

            <div style={commonStyles.formGroup}>
              <label style={commonStyles.label}>セカンダリフォント</label>
              <input
                type="text"
                value={visuals.fonts.secondary}
                onChange={(e) => handleFontChange('secondary', e.target.value)}
                placeholder="Inter"
                style={commonStyles.input}
              />
            </div>
          </div>

          {/* ビジュアルガイドライン */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ビジュアルガイドライン</label>
            <textarea
              value={visuals.visual_guidelines}
              onChange={(e) => handleChange('visual_guidelines', e.target.value)}
              placeholder="写真のトーン、イラストのスタイルなど"
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
