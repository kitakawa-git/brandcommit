'use client'

// スーパー管理画面: 企業詳細ページ（編集+社員一覧+管理者一覧）
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { colors, commonStyles } from '../../../admin/components/AdminStyles'

type Company = {
  id: string
  name: string
  logo_url: string | null
  slogan: string | null
  mvv: string | null
  brand_color_primary: string | null
  brand_color_secondary: string | null
  website_url: string | null
  created_at: string
}

type Profile = {
  id: string
  name: string
  position: string | null
  department: string | null
  email: string | null
  slug: string
}

type AdminUser = {
  id: string
  role: string
  is_superadmin: boolean
  created_at: string
  auth_email: string | null
}

export default function CompanyDetailPage() {
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [viewStats, setViewStats] = useState({ total: 0, month: 0, week: 0 })

  // 編集用フォーム
  const [editName, setEditName] = useState('')
  const [editSlogan, setEditSlogan] = useState('')
  const [editMvv, setEditMvv] = useState('')
  const [editBrandColorPrimary, setEditBrandColorPrimary] = useState('#1a1a1a')
  const [editBrandColorSecondary, setEditBrandColorSecondary] = useState('#666666')
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 企業データ
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single()

        if (companyData) {
          setCompany(companyData)
          setEditName(companyData.name || '')
          setEditSlogan(companyData.slogan || '')
          setEditMvv(companyData.mvv || '')
          setEditBrandColorPrimary(companyData.brand_color_primary || '#1a1a1a')
          setEditBrandColorSecondary(companyData.brand_color_secondary || '#666666')
          setEditWebsiteUrl(companyData.website_url || '')
        }

        // 社員一覧
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, position, department, email, slug')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })

        setProfiles(profilesData || [])

        // 管理者一覧（auth.usersのメールをサブクエリで取得できないので別途処理）
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id, role, is_superadmin, created_at, auth_id')
          .eq('company_id', companyId)
          .order('created_at', { ascending: true })

        // admin_usersのauth_idからメールを取得するため、一旦表示
        const adminsWithEmail = (adminData || []).map((admin) => ({
          id: admin.id,
          role: admin.role,
          is_superadmin: admin.is_superadmin,
          created_at: admin.created_at,
          auth_email: null, // クライアントサイドではauth.usersにアクセスできないため
        }))
        setAdminUsers(adminsWithEmail)

        // アクセス解析サマリー
        if (profilesData && profilesData.length > 0) {
          const profileIds = profilesData.map((p: Profile) => p.id)
          const { data: viewsData } = await supabase
            .from('card_views')
            .select('viewed_at')
            .in('profile_id', profileIds)

          if (viewsData) {
            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            const dayOfWeek = now.getDay()
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff)
            weekStart.setHours(0, 0, 0, 0)

            setViewStats({
              total: viewsData.length,
              month: viewsData.filter(v => v.viewed_at >= monthStart).length,
              week: viewsData.filter(v => new Date(v.viewed_at) >= weekStart).length,
            })
          }
        }
      } catch (err) {
        console.error('[SuperAdmin] 企業詳細取得エラー:', err)
      }
      setLoading(false)
    }

    fetchData()
  }, [companyId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('companies')
      .update({
        name: editName,
        slogan: editSlogan,
        mvv: editMvv,
        brand_color_primary: editBrandColorPrimary,
        brand_color_secondary: editBrandColorSecondary,
        website_url: editWebsiteUrl,
      })
      .eq('id', companyId)

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
        企業が見つかりません
      </p>
    )
  }

  return (
    <div>
      {/* ナビ */}
      <Link
        href="/superadmin/companies"
        style={{
          color: colors.textSecondary,
          textDecoration: 'none',
          fontSize: 14,
          display: 'inline-block',
          marginBottom: 16,
        }}
      >
        ← 企業一覧に戻る
      </Link>

      <h2 style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        margin: '0 0 24px',
      }}>
        {company.name}
      </h2>

      {/* === アクセス解析サマリー === */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        {[
          { label: '総閲覧数', value: viewStats.total, color: '#2563eb' },
          { label: '今月', value: viewStats.month, color: '#16a34a' },
          { label: '今週', value: viewStats.week, color: '#f59e0b' },
        ].map((stat) => (
          <div key={stat.label} style={{
            ...commonStyles.card,
            textAlign: 'center',
            padding: 20,
          }}>
            <p style={{ fontSize: 12, color: colors.textSecondary, margin: '0 0 6px' }}>
              📊 {stat.label}
            </p>
            <p style={{ fontSize: 28, fontWeight: 'bold', color: stat.color, margin: 0 }}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* === 企業情報編集セクション === */}
      <div style={{ ...commonStyles.card, marginBottom: 24 }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 16px',
        }}>
          企業情報
        </h3>

        {message && (
          <div style={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>企業名</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={commonStyles.input}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>スローガン</label>
            <input
              type="text"
              value={editSlogan}
              onChange={(e) => setEditSlogan(e.target.value)}
              style={commonStyles.input}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ミッション・ビジョン・バリュー</label>
            <textarea
              value={editMvv}
              onChange={(e) => setEditMvv(e.target.value)}
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドカラー（プライマリ）</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                value={editBrandColorPrimary}
                onChange={(e) => setEditBrandColorPrimary(e.target.value)}
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
                value={editBrandColorPrimary}
                onChange={(e) => setEditBrandColorPrimary(e.target.value)}
                style={{ ...commonStyles.input, width: 140 }}
              />
              <div style={{
                width: 80,
                height: 40,
                backgroundColor: editBrandColorPrimary,
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
              }} />
            </div>
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドカラー（セカンダリ）</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                value={editBrandColorSecondary}
                onChange={(e) => setEditBrandColorSecondary(e.target.value)}
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
                value={editBrandColorSecondary}
                onChange={(e) => setEditBrandColorSecondary(e.target.value)}
                style={{ ...commonStyles.input, width: 140 }}
              />
              <div style={{
                width: 80,
                height: 40,
                backgroundColor: editBrandColorSecondary,
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
              }} />
            </div>
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>Webサイト URL</label>
            <input
              type="url"
              value={editWebsiteUrl}
              onChange={(e) => setEditWebsiteUrl(e.target.value)}
              style={commonStyles.input}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              ...commonStyles.button,
              backgroundColor: '#1e3a5f',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>

      {/* === 社員一覧セクション === */}
      <div style={{ ...commonStyles.card, marginBottom: 24 }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 16px',
        }}>
          社員一覧（{profiles.length}名）
        </h3>

        {profiles.length === 0 ? (
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>
            社員が登録されていません
          </p>
        ) : (
          <table style={commonStyles.table}>
            <thead>
              <tr>
                <th style={commonStyles.th}>名前</th>
                <th style={commonStyles.th}>部署</th>
                <th style={commonStyles.th}>役職</th>
                <th style={commonStyles.th}>メール</th>
                <th style={commonStyles.th}>slug</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td style={{ ...commonStyles.td, fontWeight: '600' }}>{profile.name}</td>
                  <td style={{ ...commonStyles.td, color: colors.textSecondary }}>
                    {profile.department || '—'}
                  </td>
                  <td style={{ ...commonStyles.td, color: colors.textSecondary }}>
                    {profile.position || '—'}
                  </td>
                  <td style={{ ...commonStyles.td, color: colors.textSecondary, fontSize: 13 }}>
                    {profile.email || '—'}
                  </td>
                  <td style={{ ...commonStyles.td, fontSize: 13 }}>
                    <Link
                      href={`/card/${profile.slug}`}
                      target="_blank"
                      style={{ color: colors.primary, textDecoration: 'none' }}
                    >
                      {profile.slug}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* === 管理者一覧セクション === */}
      <div style={commonStyles.card}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 16px',
        }}>
          管理者（{adminUsers.length}名）
        </h3>

        {adminUsers.length === 0 ? (
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>
            管理者が登録されていません
          </p>
        ) : (
          <table style={commonStyles.table}>
            <thead>
              <tr>
                <th style={commonStyles.th}>権限</th>
                <th style={commonStyles.th}>スーパー管理者</th>
                <th style={commonStyles.th}>登録日</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((admin) => (
                <tr key={admin.id}>
                  <td style={commonStyles.td}>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: admin.role === 'owner' ? '#dbeafe' : '#f3f4f6',
                      color: admin.role === 'owner' ? '#1e40af' : colors.textSecondary,
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: '600',
                    }}>
                      {admin.role}
                    </span>
                  </td>
                  <td style={commonStyles.td}>
                    {admin.is_superadmin ? (
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: '600',
                      }}>
                        YES
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ ...commonStyles.td, color: colors.textSecondary, fontSize: 13 }}>
                    {new Date(admin.created_at).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
