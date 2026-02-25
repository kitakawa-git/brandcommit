'use client'

// ビジュアルアイデンティティ 編集ページ（1企業1レコード、upsert方式）
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useAuth } from '../../components/AuthProvider'
import { commonStyles } from '../../components/AdminStyles'

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
  logo_concept: string
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
    logo_concept: '',
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
          logo_concept: result.data.logo_concept || '',
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
        logo_concept: visuals.logo_concept || null,
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
      <p className="text-gray-500 text-center p-10">
        読み込み中...
      </p>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center p-10">
        <p className="text-red-600 text-sm mb-3">{fetchError}</p>
        <button onClick={fetchVisuals} className={cn(commonStyles.buttonOutline, 'py-2 px-4 text-[13px]')}>
          再読み込み
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        ビジュアルアイデンティティ
      </h2>

      <div className={commonStyles.card}>
        {message && (
          <div className={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ロゴコンセプト */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>ロゴコンセプト</label>
            <textarea
              value={visuals.logo_concept}
              onChange={(e) => handleChange('logo_concept', e.target.value)}
              placeholder="ロゴに込めた意味やコンセプトを記述"
              className={cn(commonStyles.textarea, 'min-h-[100px]')}
            />
          </div>

          {/* ロゴガイドライン */}
          <div className="mb-5 pb-5 border-b border-gray-200">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">
              ロゴガイドライン
            </h3>

            {visuals.logo_sections.map((section, sIdx) => (
              <div key={sIdx} className="border border-gray-200 rounded-lg p-4 mb-3">
                {/* セクションヘッダー */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                    placeholder="セクションタイトル（例: ロゴ、余白の指定、禁止事項）"
                    className={cn(commonStyles.input, 'flex-1')}
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(sIdx)}
                    className="py-2 px-3 bg-transparent text-red-600 border border-red-600 rounded-md text-[13px] cursor-pointer whitespace-nowrap"
                  >
                    削除
                  </button>
                </div>

                {/* 画像一覧 */}
                {section.items.length > 0 && (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 mb-3">
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <div className="p-2 flex items-center justify-center min-h-[100px] bg-gray-100">
                          <img
                            src={item.url}
                            alt={item.caption || ''}
                            className="max-w-full max-h-[100px] object-contain"
                          />
                        </div>
                        <div className="p-2">
                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => updateCaption(sIdx, iIdx, e.target.value)}
                            placeholder="キャプション"
                            className={cn(commonStyles.input, 'text-xs py-1.5 px-2')}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(sIdx, iIdx)}
                            className="mt-1.5 py-1 px-2 bg-transparent text-red-600 border-none text-xs cursor-pointer w-full text-center"
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
                      className="hidden"
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
                      className="py-1.5 px-3.5 bg-transparent text-gray-500 border border-dashed border-gray-300 rounded-md text-[13px] cursor-pointer"
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
                className="py-2 px-4 bg-transparent text-blue-600 border border-blue-600 rounded-md text-[13px] cursor-pointer"
              >
                + セクションを追加
              </button>
            )}
          </div>

          {/* カラー */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>プライマリカラー</label>
            <div className="flex items-center gap-3">
              <input type="color" value={visuals.primary_color} onChange={(e) => handleChange('primary_color', e.target.value)} className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer p-0.5" />
              <input type="text" value={visuals.primary_color} onChange={(e) => handleChange('primary_color', e.target.value)} className={cn(commonStyles.input, 'w-[140px]')} />
              <div className="w-20 h-10 rounded-md border border-gray-200" style={{ backgroundColor: visuals.primary_color }} />
            </div>
          </div>
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>セカンダリカラー</label>
            <div className="flex items-center gap-3">
              <input type="color" value={visuals.secondary_color} onChange={(e) => handleChange('secondary_color', e.target.value)} className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer p-0.5" />
              <input type="text" value={visuals.secondary_color} onChange={(e) => handleChange('secondary_color', e.target.value)} className={cn(commonStyles.input, 'w-[140px]')} />
              <div className="w-20 h-10 rounded-md border border-gray-200" style={{ backgroundColor: visuals.secondary_color }} />
            </div>
          </div>
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>アクセントカラー</label>
            <div className="flex items-center gap-3">
              <input type="color" value={visuals.accent_color} onChange={(e) => handleChange('accent_color', e.target.value)} className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer p-0.5" />
              <input type="text" value={visuals.accent_color} onChange={(e) => handleChange('accent_color', e.target.value)} className={cn(commonStyles.input, 'w-[140px]')} />
              <div className="w-20 h-10 rounded-md border border-gray-200" style={{ backgroundColor: visuals.accent_color }} />
            </div>
          </div>

          {/* フォント設定 */}
          <div className="mt-2 mb-5 pt-5 border-t border-gray-200">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4">
              フォント設定
            </h3>

            <div className={commonStyles.formGroup}>
              <label className={commonStyles.label}>プライマリフォント</label>
              <input
                type="text"
                value={visuals.fonts.primary}
                onChange={(e) => handleFontChange('primary', e.target.value)}
                placeholder="Noto Sans JP"
                className={commonStyles.input}
              />
            </div>

            <div className={commonStyles.formGroup}>
              <label className={commonStyles.label}>セカンダリフォント</label>
              <input
                type="text"
                value={visuals.fonts.secondary}
                onChange={(e) => handleFontChange('secondary', e.target.value)}
                placeholder="Inter"
                className={commonStyles.input}
              />
            </div>
          </div>

          {/* ビジュアルガイドライン */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>ビジュアルガイドライン</label>
            <textarea
              value={visuals.visual_guidelines}
              onChange={(e) => handleChange('visual_guidelines', e.target.value)}
              placeholder="写真のトーン、イラストのスタイルなど"
              className={cn(commonStyles.textarea, 'min-h-[100px]')}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={cn(commonStyles.button, 'mt-2', saving && 'opacity-60')}
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  )
}
