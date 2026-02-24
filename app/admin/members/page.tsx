'use client'

// アカウント一覧ページ（統合: members + profiles JOIN）
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { colors, commonStyles } from '../components/AdminStyles'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

type MemberWithProfile = {
  id: string
  auth_id: string
  display_name: string
  email: string
  is_active: boolean
  created_at: string
  profile_id: string | null
  profile: {
    id: string
    name: string
    slug: string
    card_enabled: boolean
  } | null
}

export default function MembersPage() {
  const { companyId } = useAuth()
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    fetchMembers()
  }, [companyId])

  const fetchMembers = async () => {
    if (!companyId) return

    const { data, error } = await supabase
      .from('members')
      .select('*, profile:profiles(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMembers(data as unknown as MemberWithProfile[])
    }
    setLoading(false)
  }

  // 名刺 ON/OFF トグル
  const toggleCard = async (profileId: string, currentValue: boolean) => {
    setTogglingId(profileId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ card_enabled: !currentValue }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      // ローカルステートを更新
      setMembers(prev => prev.map(m => {
        if (m.profile?.id === profileId) {
          return {
            ...m,
            profile: { ...m.profile!, card_enabled: !currentValue }
          }
        }
        return m
      }))
    } catch (err) {
      console.error('card_enabled更新エラー:', err)
      alert('名刺設定の更新に失敗しました')
    } finally {
      setTogglingId(null)
    }
  }

  // アカウント無効化
  const handleDeactivate = async (memberId: string) => {
    if (!confirm('このアカウントを無効化しますか？')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const res = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ is_active: false }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      // ローカルステートを更新
      setMembers(prev => prev.map(m =>
        m.id === memberId ? { ...m, is_active: false } : m
      ))
    } catch (err) {
      console.error('無効化エラー:', err)
      alert('アカウントの無効化に失敗しました')
    }
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: 0,
        }}>
          アカウント一覧
        </h2>
        <Link href="/admin/members-portal" style={commonStyles.button}>
          ＋ 新規追加
        </Link>
      </div>

      {/* テーブル */}
      <div style={commonStyles.card}>
        {loading ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
            読み込み中...
          </p>
        ) : members.length === 0 ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
            アカウントが登録されていません
          </p>
        ) : (
          <table style={commonStyles.table}>
            <thead>
              <tr>
                <th style={commonStyles.th}>名前</th>
                <th style={commonStyles.th}>メール</th>
                <th style={{ ...commonStyles.th, textAlign: 'center' as const }}>名刺</th>
                <th style={{ ...commonStyles.th, textAlign: 'center' as const }}>ステータス</th>
                <th style={commonStyles.th}>登録日</th>
                <th style={{ ...commonStyles.th, textAlign: 'center' as const }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const cardEnabled = member.profile?.card_enabled ?? false
                const profileId = member.profile?.id
                return (
                  <tr key={member.id}>
                    {/* 表示名 */}
                    <td style={commonStyles.td}>
                      <span style={{ fontWeight: '500' }}>{member.display_name}</span>
                    </td>

                    {/* メール */}
                    <td style={{ ...commonStyles.td, fontSize: 13 }}>
                      {member.email}
                    </td>

                    {/* 名刺 ON/OFF */}
                    <td style={{ ...commonStyles.td, textAlign: 'center' as const }}>
                      {profileId ? (
                        <button
                          onClick={() => toggleCard(profileId, cardEnabled)}
                          disabled={togglingId === profileId}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 12,
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: togglingId === profileId ? 'default' : 'pointer',
                            opacity: togglingId === profileId ? 0.5 : 1,
                            backgroundColor: cardEnabled ? '#dcfce7' : '#f3f4f6',
                            color: cardEnabled ? '#16a34a' : '#9ca3af',
                          }}
                        >
                          {cardEnabled ? '✅ ON' : 'OFF'}
                        </button>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>-</span>
                      )}
                    </td>

                    {/* ステータス */}
                    <td style={{ ...commonStyles.td, textAlign: 'center' as const }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 'bold',
                        backgroundColor: member.is_active ? '#dcfce7' : '#fee2e2',
                        color: member.is_active ? '#16a34a' : '#dc2626',
                      }}>
                        {member.is_active ? '有効' : '無効'}
                      </span>
                    </td>

                    {/* 登録日 */}
                    <td style={{ ...commonStyles.td, fontSize: 12, color: colors.textSecondary }}>
                      {new Date(member.created_at).toLocaleDateString('ja-JP')}
                    </td>

                    {/* 操作 */}
                    <td style={{ ...commonStyles.td, textAlign: 'center' as const }}>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        {profileId && cardEnabled ? (
                          <Link
                            href={`/admin/members/${profileId}/edit`}
                            style={{
                              color: colors.primary,
                              textDecoration: 'none',
                              fontSize: 14,
                              fontWeight: '500',
                            }}
                          >
                            編集
                          </Link>
                        ) : (
                          <span style={{
                            color: '#d1d5db',
                            fontSize: 14,
                            fontWeight: '500',
                          }}>
                            編集
                          </span>
                        )}
                        {member.is_active && (
                          <button
                            onClick={() => handleDeactivate(member.id)}
                            style={{
                              color: '#dc2626',
                              background: 'none',
                              border: 'none',
                              fontSize: 14,
                              fontWeight: '500',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            無効化
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
