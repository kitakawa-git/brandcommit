'use client'

// 従業員フォーム（新規追加・編集共通）
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from './ImageUpload'
import { commonStyles } from './AdminStyles'
import { cn } from '@/lib/utils'

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
  sns_x: string
  sns_linkedin: string
  sns_facebook: string
  sns_instagram: string
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
    sns_x: initialData?.sns_x || '',
    sns_linkedin: initialData?.sns_linkedin || '',
    sns_facebook: initialData?.sns_facebook || '',
    sns_instagram: initialData?.sns_instagram || '',
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
      sns_x: form.sns_x || null,
      sns_linkedin: form.sns_linkedin || null,
      sns_facebook: form.sns_facebook || null,
      sns_instagram: form.sns_instagram || null,
    }

    if (isEdit) {
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
    <div className={commonStyles.card}>
      {/* エラーメッセージ */}
      {error && <div className={commonStyles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* プロフィール写真 */}
        <div className={commonStyles.formGroup}>
          <label className={commonStyles.label}>プロフィール写真</label>
          <ImageUpload
            bucket="avatars"
            folder="profiles"
            currentUrl={form.photo_url}
            onUpload={(url) => handleChange('photo_url', url)}
          />
        </div>

        {/* 名前 */}
        <div className={commonStyles.formGroup}>
          <label className={commonStyles.label}>名前 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="山田太郎"
            required
            className={commonStyles.input}
          />
        </div>

        {/* 役職 */}
        <div className={commonStyles.formGroup}>
          <label className={commonStyles.label}>役職</label>
          <input
            type="text"
            value={form.position}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder="代表取締役"
            className={commonStyles.input}
          />
        </div>

        {/* 部署 */}
        <div className={commonStyles.formGroup}>
          <label className={commonStyles.label}>部署</label>
          <input
            type="text"
            value={form.department}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="経営企画部"
            className={commonStyles.input}
          />
        </div>

        {/* 自己紹介 */}
        <div className={commonStyles.formGroup}>
          <label className={commonStyles.label}>自己紹介</label>
          <textarea
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="自己紹介を入力してください"
            className={commonStyles.textarea}
          />
        </div>

        {/* メール */}
        <div className={commonStyles.formGroup}>
          <label className={commonStyles.label}>メールアドレス</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="taro@example.com"
            className={commonStyles.input}
          />
        </div>

        {/* 電話番号 */}
        <div className={commonStyles.formGroup}>
          <label className={commonStyles.label}>電話番号</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="090-1234-5678"
            className={commonStyles.input}
          />
        </div>

        {/* === SNSリンクセクション === */}
        <div className="mt-2 mb-5 pt-5 border-t border-gray-200">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">
            SNSリンク
          </h3>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>X (Twitter)</label>
            <input
              type="url"
              value={form.sns_x}
              onChange={(e) => handleChange('sns_x', e.target.value)}
              placeholder="https://x.com/username"
              className={commonStyles.input}
            />
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>LinkedIn</label>
            <input
              type="url"
              value={form.sns_linkedin}
              onChange={(e) => handleChange('sns_linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className={commonStyles.input}
            />
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>Facebook</label>
            <input
              type="url"
              value={form.sns_facebook}
              onChange={(e) => handleChange('sns_facebook', e.target.value)}
              placeholder="https://facebook.com/username"
              className={commonStyles.input}
            />
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>Instagram</label>
            <input
              type="url"
              value={form.sns_instagram}
              onChange={(e) => handleChange('sns_instagram', e.target.value)}
              placeholder="https://instagram.com/username"
              className={commonStyles.input}
            />
          </div>
        </div>

        {/* スラッグ */}
        <div className={commonStyles.formGroup}>
          <label className={commonStyles.label}>スラッグ（URL） *</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="taro-yamada"
            required
            className={commonStyles.input}
          />
          <p className="text-xs text-gray-500 mt-1">
            名刺ページURL: brandcommit.vercel.app/card/{form.slug || '...'}
          </p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className={cn(commonStyles.button, saving && 'opacity-60')}
          >
            {saving ? '保存中...' : (isEdit ? '更新する' : '追加する')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/members')}
            className={commonStyles.buttonOutline}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
