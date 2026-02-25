'use client'

// アカウント一覧ページ（統合: members + profiles JOIN）
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { commonStyles } from '../components/AdminStyles'
import { cn } from '@/lib/utils'

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
  const [fetchError, setFetchError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('members')
          .select('*, profile:profiles(*)')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.error) throw new Error(result.error.message)
      if (result.data) {
        setMembers(result.data as unknown as MemberWithProfile[])
      }
    } catch (err) {
      console.error('[Members] データ取得エラー:', err)
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
    fetchMembers()
  }, [companyId])

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          アカウント一覧
        </h2>
        <Link href="/admin/members-portal" className={commonStyles.button}>
          ＋ 新規追加
        </Link>
      </div>

      {/* テーブル */}
      <div className={commonStyles.card}>
        {loading ? (
          <p className="text-gray-500 text-center p-10">
            読み込み中...
          </p>
        ) : fetchError ? (
          <div className="text-center p-10">
            <p className="text-red-600 text-sm mb-3">{fetchError}</p>
            <button onClick={fetchMembers} className={cn(commonStyles.buttonOutline, 'py-2 px-4 text-[13px]')}>
              再読み込み
            </button>
          </div>
        ) : members.length === 0 ? (
          <p className="text-gray-500 text-center p-10">
            アカウントが登録されていません
          </p>
        ) : (
          <table className={commonStyles.table}>
            <thead>
              <tr>
                <th className={commonStyles.th}>名前</th>
                <th className={commonStyles.th}>メール</th>
                <th className={cn(commonStyles.th, 'text-center')}>名刺</th>
                <th className={cn(commonStyles.th, 'text-center')}>ステータス</th>
                <th className={commonStyles.th}>登録日</th>
                <th className={cn(commonStyles.th, 'text-center')}>操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const cardEnabled = member.profile?.card_enabled ?? false
                const profileId = member.profile?.id
                return (
                  <tr key={member.id}>
                    {/* 表示名 */}
                    <td className={commonStyles.td}>
                      <span className="font-medium">{member.display_name}</span>
                    </td>

                    {/* メール */}
                    <td className={cn(commonStyles.td, 'text-[13px]')}>
                      {member.email}
                    </td>

                    {/* 名刺 ON/OFF */}
                    <td className={cn(commonStyles.td, 'text-center')}>
                      {profileId ? (
                        <button
                          onClick={() => toggleCard(profileId, cardEnabled)}
                          disabled={togglingId === profileId}
                          className="py-1 px-3 rounded-xl border-none text-xs font-bold"
                          style={{
                            cursor: togglingId === profileId ? 'default' : 'pointer',
                            opacity: togglingId === profileId ? 0.5 : 1,
                            backgroundColor: cardEnabled ? '#dcfce7' : '#f3f4f6',
                            color: cardEnabled ? '#16a34a' : '#9ca3af',
                          }}
                        >
                          {cardEnabled ? '✅ ON' : 'OFF'}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>

                    {/* ステータス */}
                    <td className={cn(commonStyles.td, 'text-center')}>
                      <span
                        className="py-0.5 px-2 rounded text-xs font-bold"
                        style={{
                          backgroundColor: member.is_active ? '#dcfce7' : '#fee2e2',
                          color: member.is_active ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {member.is_active ? '有効' : '無効'}
                      </span>
                    </td>

                    {/* 登録日 */}
                    <td className={cn(commonStyles.td, 'text-xs text-gray-500')}>
                      {new Date(member.created_at).toLocaleDateString('ja-JP')}
                    </td>

                    {/* 操作 */}
                    <td className={cn(commonStyles.td, 'text-center')}>
                      <div className="flex gap-3 justify-center">
                        {profileId && cardEnabled ? (
                          <Link
                            href={`/admin/members/${profileId}/edit`}
                            className="text-blue-600 no-underline text-sm font-medium"
                          >
                            編集
                          </Link>
                        ) : (
                          <span className="text-gray-300 text-sm font-medium">
                            編集
                          </span>
                        )}
                        {member.is_active && (
                          <button
                            onClick={() => handleDeactivate(member.id)}
                            className="text-red-600 bg-transparent border-none text-sm font-medium cursor-pointer p-0"
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
