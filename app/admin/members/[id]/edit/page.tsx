'use client'

// 社員編集ページ
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MemberForm } from '../../../components/MemberForm'
import { colors } from '../../../components/AdminStyles'

export default function EditMemberPage() {
  const params = useParams()
  const id = params.id as string

  const [profile, setProfile] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [id])

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
        }}
        companyId={profile.company_id || ''}
      />
    </div>
  )
}
