'use client'

// 社員編集ページ（マルチテナント対応: 自社の社員のみ編集可能）
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../../components/AuthProvider'
import { MemberForm } from '../../../components/MemberForm'
import { colors } from '../../../components/AdminStyles'

export default function EditMemberPage() {
  const params = useParams()
  const id = params.id as string
  const { companyId } = useAuth()

  const [profile, setProfile] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return

    const fetchProfile = async () => {
      // 自社のprofileのみ取得（company_idフィルタ付き）
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single()

      if (!error && data) {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [id, companyId])

  if (loading) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        読み込み中...
      </p>
    )
  }

  if (!profile) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
        社員データが見つかりません
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
        社員を編集
      </h2>
      <MemberForm
        initialData={{
          id: profile.id,
          name: profile.name || '',
          position: profile.position || '',
          department: profile.department || '',
          bio: profile.bio || '',
          email: profile.email || '',
          phone: profile.phone || '',
          slug: profile.slug || '',
          photo_url: profile.photo_url || '',
          company_id: profile.company_id || '',
          sns_x: profile.sns_x || '',
          sns_linkedin: profile.sns_linkedin || '',
          sns_facebook: profile.sns_facebook || '',
          sns_instagram: profile.sns_instagram || '',
        }}
        companyId={profile.company_id || ''}
      />
    </div>
  )
}
