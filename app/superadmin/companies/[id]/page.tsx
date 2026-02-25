'use client'

// スーパー管理画面: 企業詳細ページ（編集+社員一覧+管理者一覧）
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { commonStyles } from '../../../admin/components/AdminStyles'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

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
      <p className="text-gray-500 text-center p-10">
        読み込み中...
      </p>
    )
  }

  if (!company) {
    return (
      <p className="text-gray-500 text-center p-10">
        企業が見つかりません
      </p>
    )
  }

  return (
    <div>
      {/* ナビ */}
      <Link
        href="/superadmin/companies"
        className="text-gray-500 no-underline text-sm inline-block mb-4"
      >
        <ArrowLeft size={14} className="inline" /> 企業一覧に戻る
      </Link>

      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {company.name}
      </h2>

      {/* === アクセス解析サマリー === */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '総閲覧数', value: viewStats.total, color: '#2563eb' },
          { label: '今月', value: viewStats.month, color: '#16a34a' },
          { label: '今週', value: viewStats.week, color: '#f59e0b' },
        ].map((stat) => (
          <div key={stat.label} className={cn(commonStyles.card, 'text-center p-5')}>
            <p className="text-xs text-gray-500 mb-1.5">
              📊 {stat.label}
            </p>
            <p className="text-[28px] font-bold m-0" style={{ color: stat.color }}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* === 企業情報編集セクション === */}
      <div className={cn(commonStyles.card, 'mb-6')}>
        <h3 className="text-base font-bold text-gray-900 mb-4">
          企業情報
        </h3>

        {message && (
          <div className={messageType === 'success' ? commonStyles.success : commonStyles.error}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>企業名</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={commonStyles.input}
            />
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>スローガン</label>
            <input
              type="text"
              value={editSlogan}
              onChange={(e) => setEditSlogan(e.target.value)}
              className={commonStyles.input}
            />
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>ミッション・ビジョン・バリュー</label>
            <textarea
              value={editMvv}
              onChange={(e) => setEditMvv(e.target.value)}
              className={cn(commonStyles.textarea, 'min-h-[100px]')}
            />
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>ブランドカラー（プライマリ）</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={editBrandColorPrimary}
                onChange={(e) => setEditBrandColorPrimary(e.target.value)}
                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={editBrandColorPrimary}
                onChange={(e) => setEditBrandColorPrimary(e.target.value)}
                className={cn(commonStyles.input, 'w-[140px]')}
              />
              <div
                className="w-20 h-10 rounded-md border border-gray-200"
                style={{ backgroundColor: editBrandColorPrimary }}
              />
            </div>
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>ブランドカラー（セカンダリ）</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={editBrandColorSecondary}
                onChange={(e) => setEditBrandColorSecondary(e.target.value)}
                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={editBrandColorSecondary}
                onChange={(e) => setEditBrandColorSecondary(e.target.value)}
                className={cn(commonStyles.input, 'w-[140px]')}
              />
              <div
                className="w-20 h-10 rounded-md border border-gray-200"
                style={{ backgroundColor: editBrandColorSecondary }}
              />
            </div>
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>Webサイト URL</label>
            <input
              type="url"
              value={editWebsiteUrl}
              onChange={(e) => setEditWebsiteUrl(e.target.value)}
              className={commonStyles.input}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={cn(commonStyles.button, 'bg-[#1e3a5f] hover:bg-[#2a4a6f]', saving && 'opacity-60')}
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>

      {/* === 社員一覧セクション === */}
      <div className={cn(commonStyles.card, 'mb-6')}>
        <h3 className="text-base font-bold text-gray-900 mb-4">
          従業員一覧（{profiles.length}名）
        </h3>

        {profiles.length === 0 ? (
          <p className="text-gray-500 text-sm">
            従業員が登録されていません
          </p>
        ) : (
          <table className={commonStyles.table}>
            <thead>
              <tr>
                <th className={commonStyles.th}>名前</th>
                <th className={commonStyles.th}>部署</th>
                <th className={commonStyles.th}>役職</th>
                <th className={commonStyles.th}>メール</th>
                <th className={commonStyles.th}>slug</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className={cn(commonStyles.td, 'font-semibold')}>{profile.name}</td>
                  <td className={cn(commonStyles.td, 'text-gray-500')}>
                    {profile.department || '—'}
                  </td>
                  <td className={cn(commonStyles.td, 'text-gray-500')}>
                    {profile.position || '—'}
                  </td>
                  <td className={cn(commonStyles.td, 'text-gray-500 text-[13px]')}>
                    {profile.email || '—'}
                  </td>
                  <td className={cn(commonStyles.td, 'text-[13px]')}>
                    <Link
                      href={`/card/${profile.slug}`}
                      target="_blank"
                      className="text-blue-600 no-underline"
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
      <div className={commonStyles.card}>
        <h3 className="text-base font-bold text-gray-900 mb-4">
          管理者（{adminUsers.length}名）
        </h3>

        {adminUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">
            管理者が登録されていません
          </p>
        ) : (
          <table className={commonStyles.table}>
            <thead>
              <tr>
                <th className={commonStyles.th}>権限</th>
                <th className={commonStyles.th}>スーパー管理者</th>
                <th className={commonStyles.th}>登録日</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((admin) => (
                <tr key={admin.id}>
                  <td className={commonStyles.td}>
                    <span
                      className="py-0.5 px-2 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: admin.role === 'owner' ? '#dbeafe' : '#f3f4f6',
                        color: admin.role === 'owner' ? '#1e40af' : '#6b7280',
                      }}
                    >
                      {admin.role}
                    </span>
                  </td>
                  <td className={commonStyles.td}>
                    {admin.is_superadmin ? (
                      <span className="py-0.5 px-2 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                        YES
                      </span>
                    ) : '—'}
                  </td>
                  <td className={cn(commonStyles.td, 'text-gray-500 text-[13px]')}>
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
