'use client'

// 招待リンクからのセルフ登録ページ（API Route経由）
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { portalColors } from '../components/PortalStyles'

export default function PortalRegisterPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        color: '#6b7280',
      }}>
        読み込み中...
      </div>
    }>
      <PortalRegisterContent />
    </Suspense>
  )
}

function PortalRegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [companyName, setCompanyName] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null) // null = 検証中

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // トークン検証
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    const verifyToken = async () => {
      const { data, error } = await supabase
        .from('invite_links')
        .select('company_id')
        .eq('token', token)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setTokenValid(false)
        return
      }

      // 会社名を取得
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', data.company_id)
        .single()

      if (company) setCompanyName(company.name)
      setTokenValid(true)
    }

    verifyToken()
  }, [token])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    setLoading(true)

    try {
      // API Route経由でサーバーサイドでAuth + profiles + members を一括作成
      const res = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
          token,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || '登録に失敗しました')

      // 登録成功 → signInWithPassword でログイン
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: result.password,
      })

      if (signInError) {
        throw new Error('ログインに失敗しました: ' + signInError.message)
      }

      // ポータルへリダイレクト
      router.replace('/portal')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid #d1d5db`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  // トークン検証中
  if (tokenValid === null) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        color: portalColors.textSecondary,
      }}>
        招待リンクを確認中...
      </div>
    )
  }

  // 無効なトークン
  if (tokenValid === false) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          maxWidth: 400,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 12px' }}>
            無効な招待リンク
          </h2>
          <p style={{ fontSize: 14, color: portalColors.textSecondary, margin: 0, lineHeight: 1.6 }}>
            この招待リンクは無効または期限切れです。管理者に新しいリンクを発行してもらってください。
          </p>
        </div>
      </div>
    )
  }

  // 登録フォーム
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 40,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 8px' }}>
            brandcommit
          </h1>
          <p style={{ fontSize: 14, color: portalColors.textSecondary, margin: 0 }}>
            メンバー登録
          </p>
          {companyName && (
            <p style={{
              fontSize: 13,
              color: portalColors.primary,
              margin: '8px 0 0',
              fontWeight: 'bold',
            }}>
              {companyName}
            </p>
          )}
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: portalColors.danger,
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 6 }}>
              表示名
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="山田太郎"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 6 }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 6 }}>
              パスワード（8文字以上）
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              minLength={8}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 'bold', color: portalColors.textPrimary, marginBottom: 6 }}>
              パスワード確認
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="もう一度入力"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: portalColors.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
              textAlign: 'center' as const,
            }}
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}
