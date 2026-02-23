'use client'

// 企業情報編集ページ
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from '../components/ImageUpload'
import { colors, commonStyles } from '../components/AdminStyles'

type Company = {
  id: string
  name: string
  logo_url: string
  slogan: string
  mvv: string
  brand_color_primary: string
  brand_color_secondary: string
  website_url: string
}

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    // 最初の企業レコードを取得
    const fetchCompany = async () => {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single()

      if (data) {
        setCompany({
          id: data.id,
          name: data.name || '',
          logo_url: data.logo_url || '',
          slogan: data.slogan || '',
          mvv: data.mvv || '',
          brand_color_primary: data.brand_color_primary || '#1a1a1a',
          brand_color_secondary: data.brand_color_secondary || '#666666',
          website_url: data.website_url || '',
        })
      }
      setLoading(false)
    }
    fetchCompany()
  }, [])

  const handleChange = (field: keyof Company, value: string) => {
    setCompany(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('companies')
      .update({
        name: company.name,
        logo_url: company.logo_url,
        slogan: company.slogan,
        mvv: company.mvv,
        brand_color_primary: company.brand_color_primary,
        brand_color_secondary: company.brand_color_secondary,
        website_url: company.website_url,
      })
      .eq('id', company.id)

    if (error) {
      setMessage('保存に失敗しました: ' + error.message)
      setMessageType('error')
    } else {
      setMessage('保存しました')
      setMessageType('success')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        読み込み中...
      </p>
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
        企業情報
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
            <label style={commonStyles.label}>企業名</label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="株式会社○○"
              style={commonStyles.input}
            />
          </div>

          {/* スローガン */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>スローガン</label>
            <input
              type="text"
              value={company.slogan}
              onChange={(e) => handleChange('slogan', e.target.value)}
              placeholder="企業のスローガン"
              style={commonStyles.input}
            />
          </div>

          {/* MVV（ミッション・ビジョン・バリュー） */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ミッション・ビジョン・バリュー</label>
            <textarea
              value={company.mvv}
              onChange={(e) => handleChange('mvv', e.target.value)}
              placeholder="企業のミッション・ビジョン・バリューを入力"
              style={{ ...commonStyles.textarea, minHeight: 150 }}
            />
          </div>

          {/* ブランドカラー（プライマリ） */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドカラー（プライマリ）</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                value={company.brand_color_primary}
                onChange={(e) => handleChange('brand_color_primary', e.target.value)}
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
                value={company.brand_color_primary}
                onChange={(e) => handleChange('brand_color_primary', e.target.value)}
                placeholder="#1a1a1a"
                style={{ ...commonStyles.input, width: 140 }}
              />
              {/* カラープレビュー */}
              <div style={{
                width: 80,
                height: 40,
                backgroundColor: company.brand_color_primary,
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
              }} />
            </div>
          </div>

          {/* ブランドカラー（セカンダリ） */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドカラー（セカンダリ）</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                value={company.brand_color_secondary}
                onChange={(e) => handleChange('brand_color_secondary', e.target.value)}
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
                value={company.brand_color_secondary}
                onChange={(e) => handleChange('brand_color_secondary', e.target.value)}
                placeholder="#666666"
                style={{ ...commonStyles.input, width: 140 }}
              />
              {/* カラープレビュー */}
              <div style={{
                width: 80,
                height: 40,
                backgroundColor: company.brand_color_secondary,
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
              }} />
            </div>
          </div>

          {/* WebサイトURL */}
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>Webサイト URL</label>
            <input
              type="url"
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
