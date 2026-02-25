'use client'

// アカウント作成（ポータル） — 招待リンク管理 + アカウント手動作成
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { commonStyles } from '../components/AdminStyles'
import { cn } from '@/lib/utils'

type InviteLink = {
  id: string
  token: string
  is_active: boolean
  created_at: string
}

function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let pw = ''
  for (let i = 0; i < 8; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pw
}

export default function MembersPortalPage() {
  const { companyId } = useAuth()
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // アカウント手動作成用
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [creating, setCreating] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)

  useEffect(() => {
    if (!companyId) return
    fetchData()
  }, [companyId])

  const fetchData = async () => {
    if (!companyId) return

    const { data } = await supabase
      .from('invite_links')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (data) setInviteLinks(data)
    setLoading(false)
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
  }

  // ── 招待リンク生成 ──
  const handleGenerateLink = async () => {
    if (!companyId) return
    setGeneratingLink(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/invite_links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ company_id: companyId }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(`HTTP ${res.status}: ${body}`)
      }

      showMessage('招待リンクを生成しました', 'success')
      await fetchData()
    } catch (err) {
      showMessage('生成に失敗しました: ' + (err instanceof Error ? err.message : '不明'), 'error')
    } finally {
      setGeneratingLink(false)
    }
  }

  // ── 招待リンク無効化 ──
  const handleDeactivateLink = async (linkId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/invite_links?id=eq.${linkId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ is_active: false }),
        }
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      showMessage('招待リンクを無効化しました', 'success')
      await fetchData()
    } catch (err) {
      showMessage('無効化に失敗: ' + (err instanceof Error ? err.message : '不明'), 'error')
    }
  }

  // ── クリップボードにコピー ──
  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/portal/register?token=${token}`
    navigator.clipboard.writeText(url)
    showMessage('コピーしました', 'success')
  }

  // ── アカウント手動作成 ──
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    setCreating(true)

    try {
      const res = await fetch('/api/members/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          display_name: newDisplayName,
          company_id: companyId,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || '作成に失敗')

      showMessage('アカウントを作成しました', 'success')
      setNewEmail('')
      setNewPassword('')
      setNewDisplayName('')
      await fetchData()
    } catch (err) {
      showMessage('作成に失敗: ' + (err instanceof Error ? err.message : '不明'), 'error')
    } finally {
      setCreating(false)
    }
  }


  if (loading) {
    return (
      <p className="text-gray-500 text-center p-10">
        読み込み中...
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        アカウント作成
      </h2>

      {message && (
        <div className={messageType === 'success' ? commonStyles.success : commonStyles.error}>
          {message}
        </div>
      )}

      {/* ── セクション1: 招待リンク ── */}
      <div className={cn(commonStyles.card, 'mb-6')}>
        <h3 className="text-base font-bold text-gray-900 mb-4">
          招待リンク
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          従業員に共有すると、セルフ登録でアカウントを作成できます
        </p>

        <button
          onClick={handleGenerateLink}
          disabled={generatingLink}
          className={cn(commonStyles.button, 'mb-4', generatingLink && 'opacity-60')}
        >
          {generatingLink ? '生成中...' : '招待リンクを生成'}
        </button>

        {inviteLinks.length > 0 && (
          <table className={commonStyles.table}>
            <thead>
              <tr>
                <th className={commonStyles.th}>リンク</th>
                <th className={commonStyles.th}>ステータス</th>
                <th className={commonStyles.th}>作成日</th>
                <th className={commonStyles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {inviteLinks.map((link) => (
                <tr key={link.id}>
                  <td className={cn(commonStyles.td, 'text-xs break-all')}>
                    /portal/register?token={link.token.substring(0, 8)}...
                  </td>
                  <td className={commonStyles.td}>
                    <span
                      className="py-0.5 px-2 rounded text-xs font-bold"
                      style={{
                        backgroundColor: link.is_active ? '#dcfce7' : '#f3f4f6',
                        color: link.is_active ? '#16a34a' : '#6b7280',
                      }}
                    >
                      {link.is_active ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className={cn(commonStyles.td, 'text-xs')}>
                    {new Date(link.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className={commonStyles.td}>
                    {link.is_active && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyLink(link.token)}
                          className={cn(commonStyles.buttonOutline, 'py-1 px-2.5 text-xs')}
                        >
                          コピー
                        </button>
                        <button
                          onClick={() => handleDeactivateLink(link.id)}
                          className={cn(commonStyles.dangerButton, 'py-1 px-2.5 text-xs')}
                        >
                          無効化
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── セクション2: アカウント手動作成 ── */}
      <div className={cn(commonStyles.card, 'mb-6')}>
        <h3 className="text-base font-bold text-gray-900 mb-4">
          アカウント手動作成
        </h3>

        <p className="text-xs text-gray-500 mb-4">
          名刺プロフィールも同時に作成されます
        </p>

        <form onSubmit={handleCreateMember}>
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>メールアドレス</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="member@example.com"
              required
              className={commonStyles.input}
            />
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>パスワード</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8文字以上"
                required
                minLength={8}
                className={cn(commonStyles.input, 'flex-1')}
              />
              <button
                type="button"
                onClick={() => setNewPassword(generatePassword())}
                className={cn(commonStyles.buttonOutline, 'py-2 px-3 text-xs whitespace-nowrap')}
              >
                自動生成
              </button>
            </div>
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>名前</label>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="山田太郎"
              required
              className={commonStyles.input}
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className={cn(commonStyles.button, creating && 'opacity-60')}
          >
            {creating ? '作成中...' : 'アカウントを作成'}
          </button>
        </form>
      </div>

    </div>
  )
}
