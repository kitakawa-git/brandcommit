'use client'

// ブランドビジュアル 編集ページ（1企業1レコード、upsert方式）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { ImageUpload } from '../../components/ImageUpload'
import { colors, commonStyles } from '../../components/AdminStyles'

type Fonts = {
  primary: string
  secondary: string
}

type Visuals = {
  primary_color: string
  secondary_color: string
  accent_color: string
  logo_url: string
  logo_white_url: string
  logo_dark_url: string
  logo_usage_rules: string
  fonts: Fonts
  visual_guidelines: string
}

export default function BrandVisualsPage() {
  const { companyId } = useAuth()
  const [visualsId, setVisualsId] = useState<string | null>(null)
  const [visuals, setVisuals] = useState<Visuals>({
    primary_color: '#1a1a1a',
    secondary_color: '#666666',
    accent_color: '#2563eb',
    logo_url: '',
    logo_white_url: '',
    logo_dark_url: '',
    logo_usage_rules: '',
    fonts: { primary: '', secondary: '' },
    visual_guidelines: '',
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

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
          logo_url: result.data.logo_url || '',
          logo_white_url: result.data.logo_white_url || '',
          logo_dark_url: result.data.logo_dark_url || '',
          logo_usage_rules: result.data.logo_usage_rules || '',
          fonts: result.data.fonts || { primary: '', secondary: '' },
          visual_guidelines: result.data.visual_guidelines || '',
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

  const handleChange = (field: keyof Visuals, value: string | Fonts) => {
    setVisuals(prev => ({ ...prev, [field]: value }))
  }

  const handleFontChange = (field: 'primary' | 'secondary', value: string) => {
    setVisuals(prev => ({
      ...prev,
      fonts: { ...prev.fonts, [field]: value },
    }))
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
      // セッショントークンを取得（RLSポリシー用）
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const saveData: Record<string, unknown> = {
        company_id: companyId,
        primary_color: visuals.primary_color,
        secondary_color: visuals.secondary_color,
        accent_color: visuals.accent_color,
        logo_url: visuals.logo_url || null,
        logo_white_url: visuals.logo_white_url || null,
        logo_dark_url: visuals.logo_dark_url || null,
        logo_usage_rules: visuals.logo_usage_rules || null,
        fonts: visuals.fonts,
        visual_guidelines: visuals.visual_guidelines || null,
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

  // カラーピッカーUI（company/page.tsxと同パターン）
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
          {/* カラー */}
          <ColorField label="プライマリカラー" value={visuals.primary_color} onChange={(v) => handleChange('primary_color', v)} />
          <ColorField label="セカンダリカラー" value={visuals.secondary_color} onChange={(v) => handleChange('secondary_color', v)} />
          <ColorField label="アクセントカラー" value={visuals.accent_color} onChange={(v) => handleChange('accent_color', v)} />

          {/* ロゴ */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ロゴ</label>
            <ImageUpload
              bucket="avatars"
              folder="logos"
              currentUrl={visuals.logo_url}
              onUpload={(url) => handleChange('logo_url', url)}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>白背景用ロゴ</label>
            <ImageUpload
              bucket="avatars"
              folder="logos"
              currentUrl={visuals.logo_white_url}
              onUpload={(url) => handleChange('logo_white_url', url)}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>暗背景用ロゴ</label>
            <ImageUpload
              bucket="avatars"
              folder="logos"
              currentUrl={visuals.logo_dark_url}
              onUpload={(url) => handleChange('logo_dark_url', url)}
            />
          </div>

          {/* ロゴ使用ルール */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ロゴ使用ルール</label>
            <textarea
              value={visuals.logo_usage_rules}
              onChange={(e) => handleChange('logo_usage_rules', e.target.value)}
              placeholder="ロゴの最小サイズ、余白ルールなど"
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

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
