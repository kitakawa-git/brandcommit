'use client'

// メンバーログインページ
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { portalColors } from '../components/PortalStyles'

export default function PortalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Supabase Auth でログイン
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('メールアドレスまたはパスワードが正しくありません')
        return
      }

      // 2. members テーブルで確認
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('auth_id', authData.user.id)
        .eq('is_active', true)
        .single()

      if (memberError || !memberData) {
        setError('メンバーとして登録されていません。管理者に連絡してください。')
        await supabase.auth.signOut()
        return
      }

      // 3. ポータルトップへ
      router.replace('/portal')
    } catch (err) {
      setError(`ログイン処理中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`)
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
            メンバーログイン
          </p>
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

        <form onSubmit={handleLogin}>
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
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
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
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: 13,
          color: portalColors.textSecondary,
          marginTop: 24,
          marginBottom: 0,
        }}>
          <Link href="/admin/login" style={{ color: portalColors.primary, textDecoration: 'none' }}>
            管理者ログインはこちら
          </Link>
        </p>
      </div>
    </div>
  )
}
