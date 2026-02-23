'use client'

// ログインページ
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { colors, commonStyles } from '../components/AdminStyles'

export default function LoginPage() {
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
      // 1. Supabase Authでログイン
      console.log('[Login] 認証開始:', email)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('[Login] 認証エラー:', authError.message)
        setError('メールアドレスまたはパスワードが正しくありません')
        setLoading(false)
        return
      }

      console.log('[Login] 認証成功: userId =', authData.user.id)

      // 2. admin_usersテーブルで管理者として登録されているか確認
      console.log('[Login] admin_users検索中...')
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('company_id, role')
        .eq('auth_id', authData.user.id)
        .single()

      console.log('[Login] admin_users結果:', { adminUser, adminError: adminError?.message })

      if (adminError || !adminUser) {
        // 管理者として未登録 → ログアウトしてエラー表示
        const errorMsg = adminError
          ? `管理者データ取得エラー: ${adminError.message}（RLSが有効の可能性があります。sql/002_disable_rls.sql を実行してください）`
          : 'このアカウントは管理者として登録されていません。admin_usersテーブルにデータがあるか確認してください。'
        console.error('[Login]', errorMsg)
        setError(errorMsg)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // 3. ログイン成功 → 社員一覧へリダイレクト
      console.log('[Login] リダイレクト: /admin/members (companyId:', adminUser.company_id, ')')
      router.replace('/admin/members')
    } catch (err) {
      // 予期しないエラー
      console.error('[Login] 予期しないエラー:', err)
      setError(`ログイン処理中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.pageBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 40,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 8px',
          }}>
            brandcommit
          </h1>
          <p style={{
            fontSize: 14,
            color: colors.textSecondary,
            margin: 0,
          }}>
            管理画面にログイン
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div style={{
            ...commonStyles.error,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {error}
          </div>
        )}

        {/* ログインフォーム */}
        <form onSubmit={handleLogin}>
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={commonStyles.input}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              style={commonStyles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...commonStyles.button,
              width: '100%',
              padding: '12px 20px',
              fontSize: 16,
              opacity: loading ? 0.6 : 1,
              textAlign: 'center' as const,
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
