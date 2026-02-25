'use client'

// アカウント一覧ページ（統合: members + profiles JOIN）
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Plus } from 'lucide-react'

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

  const fetchMembers = async (retryCount = 0) => {
    if (!companyId) return
    if (retryCount === 0) {
      setLoading(true)
      setFetchError('')
    }

    const MAX_RETRIES = 2

    try {
      const result = await Promise.race([
        supabase
          .from('members')
          .select('id, auth_id, display_name, email, is_active, created_at, profile:profiles(id, name, slug, card_enabled)')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        ),
      ])

      if (result.error) throw new Error(result.error.message)
      if (result.data) {
        setMembers(result.data as unknown as MemberWithProfile[])
      }
    } catch (err) {
      console.error(`[Members] データ取得エラー (試行${retryCount + 1}/${MAX_RETRIES + 1}):`, err)

      if (retryCount < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
        return fetchMembers(retryCount + 1)
      }

      const msg = err instanceof Error && err.message === 'timeout'
        ? 'データの取得がタイムアウトしました。再読み込みをお試しください。'
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

      setMembers(prev => prev.map(m => {
        if (m.profile?.id === profileId) {
          return { ...m, profile: { ...m.profile!, card_enabled: !currentValue } }
        }
        return m
      }))
    } catch (err) {
      console.error('card_enabled更新エラー:', err)
      toast.error('名刺設定の更新に失敗しました')
    } finally {
      setTogglingId(null)
    }
  }

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

      setMembers(prev => prev.map(m =>
        m.id === memberId ? { ...m, is_active: false } : m
      ))
    } catch (err) {
      console.error('無効化エラー:', err)
      toast.error('アカウントの無効化に失敗しました')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">アカウント一覧</h2>
        <Button asChild size="sm">
          <Link href="/admin/members-portal">
            <Plus size={16} /> 新規追加
          </Link>
        </Button>
      </div>

      <Card className="bg-muted/50 border shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-center p-10">読み込み中...</p>
          ) : fetchError ? (
            <div className="text-center p-10">
              <p className="text-red-600 text-sm mb-3">{fetchError}</p>
              <Button variant="outline" size="sm" onClick={() => fetchMembers(0)}>再読み込み</Button>
            </div>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground text-center p-10">アカウントが登録されていません</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">名前</th>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">メール</th>
                  <th className="text-center px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">名刺</th>
                  <th className="text-center px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">ステータス</th>
                  <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">登録日</th>
                  <th className="text-center px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const cardEnabled = member.profile?.card_enabled ?? false
                  const profileId = member.profile?.id
                  return (
                    <tr key={member.id}>
                      <td className="px-4 py-3 border-b border-border text-foreground">
                        <span className="font-medium">{member.display_name}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-border text-foreground text-xs">{member.email}</td>
                      <td className="px-4 py-3 border-b border-border text-center">
                        {profileId ? (
                          <button
                            onClick={() => toggleCard(profileId, cardEnabled)}
                            disabled={togglingId === profileId}
                            className={`py-1 px-3 rounded-xl border-none text-xs font-bold cursor-pointer ${cardEnabled ? 'bg-green-50 text-green-600' : 'bg-muted text-muted-foreground'} ${togglingId === profileId ? 'opacity-50 cursor-default' : ''}`}
                          >
                            {cardEnabled ? <><Check size={14} className="inline" /> ON</> : 'OFF'}
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-border text-center">
                        <span className={`py-0.5 px-2 rounded text-xs font-bold ${member.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {member.is_active ? '有効' : '無効'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-border text-xs text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 border-b border-border text-center">
                        <div className="flex gap-3 justify-center">
                          {profileId && cardEnabled ? (
                            <Link href={`/admin/members/${profileId}/edit`} className="text-blue-600 no-underline text-sm font-medium">編集</Link>
                          ) : (
                            <span className="text-muted-foreground/50 text-sm font-medium">編集</span>
                          )}
                          {member.is_active && (
                            <button onClick={() => handleDeactivate(member.id)} className="text-red-600 bg-transparent border-none text-sm font-medium cursor-pointer p-0">無効化</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
