'use client'

// 社員フォーム（新規追加・編集共通）
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from './ImageUpload'
import { colors, commonStyles } from './AdminStyles'

type ProfileData = {
  id?: string
  name: string
  position: string
  department: string
  bio: string
  email: string
  phone: string
  slug: string
  photo_url: string
  company_id: string
}

type Props = {
  initialData?: ProfileData   // 編集時に既存データを渡す
  companyId: string           // 所属企業ID
}

export function MemberForm({ initialData, companyId }: Props) {
  const isEdit = !!initialData?.id
  const router = useRouter()

  const [form, setForm] = useState<ProfileData>({
    name: initialData?.name || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    bio: initialData?.bio || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    slug: initialData?.slug || '',
    photo_url: initialData?.photo_url || '',
    company_id: companyId,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: keyof ProfileData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // バリデーション
    if (!form.name || !form.slug) {
      setError('名前とスラッグは必須です')
      setSaving(false)
      return
    }

    const payload = {
      name: form.name,
      position: form.position,
      department: form.department,
      bio: form.bio,
      email: form.email,
      phone: form.phone,
      slug: form.slug,
      photo_url: form.photo_url,
      company_id: form.company_id,
    }

    if (isEdit) {
      // 更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', initialData!.id)

      if (updateError) {
        setError('更新に失敗しました: ' + updateError.message)
        setSaving(false)
        return
      }
    } else {
      // 新規追加
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(payload)

      if (insertError) {
        setError('保存に失敗しました: ' + insertError.message)
        setSaving(false)
        return
      }
    }

    router.push('/admin/members')
  }

  return (
    <div style={commonStyles.card}>
      {/* エラーメッセージ */}
      {error && <div style={commonStyles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* プロフィール写真 */}
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>プロフィール写真</label>
          <ImageUpload
            bucket="avatars"
            folder="profiles"
            currentUrl={form.photo_url}
            onUpload={(url) => handleChange('photo_url', url)}
          />
        </div>

        {/* 名前 */}
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>名前 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="山田太郎"
            required
            style={commonStyles.input}
          />
        </div>

        {/* 役職 */}
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>役職</label>
          <input
            type="text"
            value={form.position}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder="代表取締役"
            style={commonStyles.input}
          />
        </div>

        {/* 部署 */}
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>部署</label>
          <input
            type="text"
            value={form.department}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="経営企画部"
            style={commonStyles.input}
          />
        </div>

        {/* 自己紹介 */}
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>自己紹介</label>
          <textarea
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="自己紹介を入力してください"
            style={commonStyles.textarea}
          />
        </div>

        {/* メール */}
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>メールアドレス</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="taro@example.com"
            style={commonStyles.input}
          />
        </div>

        {/* 電話番号 */}
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>電話番号</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="090-1234-5678"
            style={commonStyles.input}
          />
        </div>

        {/* スラッグ */}
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>スラッグ（URL） *</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="taro-yamada"
            required
            style={commonStyles.input}
          />
          <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            名刺ページURL: brandcommit.vercel.app/card/{form.slug || '...'}
          </p>
        </div>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...commonStyles.button,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? '保存中...' : (isEdit ? '更新する' : '追加する')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/members')}
            style={commonStyles.buttonOutline}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
