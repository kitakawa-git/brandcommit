'use client'

// 企業情報編集ページ（マルチテナント対応: 自社のレコードのみ表示・編集）
// ブランド関連項目（スローガン、MVV、ブランドストーリー、提供価値、ブランドカラー）は
// ブランド掲示の各ページで管理するため、ここでは企業名・ロゴ・WebサイトURLのみ管理
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { ImageUpload } from '../components/ImageUpload'
import { colors, commonStyles } from '../components/AdminStyles'

type Company = {
  id: string
  name: string
  logo_url: string
  website_url: string
}

export default function CompanyPage() {
  const { companyId } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchCompany = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.error) throw new Error(result.error.message)
      if (result.data) {
        setCompany({
          id: result.data.id,
          name: result.data.name || '',
          logo_url: result.data.logo_url || '',
          website_url: result.data.website_url || '',
        })
      }
    } catch (err) {
      console.error('[Company] データ取得エラー:', err)
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
    fetchCompany()
  }, [companyId])

  const handleChange = (field: keyof Company, value: string) => {
    setCompany(prev => prev ? { ...prev, [field]: value } : null)
  }

  // URL正規化: http(s)://がなければhttps://を自動付与、空欄はそのまま
  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    return 'https://' + trimmed
  }

  // Supabase REST APIに直接fetchで保存（JSクライアントの認証ハングを回避）
  const supabasePatch = async (table: string, id: string, data: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // セッショントークンを取得（RLSポリシー用）
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || ''

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    setMessage('')
    setMessageType('error')

    try {
      const normalizedWebsiteUrl = normalizeUrl(company.website_url)

      const updateData: Record<string, unknown> = {
        name: company.name,
        logo_url: company.logo_url,
        website_url: normalizedWebsiteUrl,
      }

      const result = await supabasePatch('companies', company.id, updateData)

      if (!result.ok) {
        console.error('[Company Save] エラー:', result.error)
        setMessage('保存に失敗しました: ' + result.error)
        setMessageType('error')
      } else {
        setMessage('保存しました')
        setMessageType('success')
        handleChange('website_url', normalizedWebsiteUrl)
      }
    } catch (err) {
      console.error('[Company Save] 予期しないエラー:', err)
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
        <button onClick={fetchCompany} style={{ ...commonStyles.buttonOutline, padding: '8px 16px', fontSize: 13 }}>
          再読み込み
        </button>
      </div>
    )
  }

  if (!company) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        企業データが見つかりません
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
        ブランド基本情報
      </h2>

      <div style={commonStyles.card}>
        {/* メッセージ */}
        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ロゴ */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ロゴ</label>
            <ImageUpload
              bucket="avatars"
              folder="logos"
              currentUrl={company.logo_url}
              onUpload={(url) => handleChange('logo_url', url)}
            />
          </div>

          {/* 企業名 */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランド名</label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="株式会社○○"
              style={commonStyles.input}
            />
            <p style={{ fontSize: 13, color: colors.textSecondary, margin: '6px 0 0' }}>
              企業名・サービス名・個人名など、ブランディングの対象となる名称を入力してください
            </p>
          </div>

          {/* WebサイトURL */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ウェブサイトURL</label>
            <input
              type="text"
              value={company.website_url}
              onChange={(e) => handleChange('website_url', e.target.value)}
              placeholder="https://example.com"
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
