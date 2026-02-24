'use client'

// ログインページ
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { colors, commonStyles } from '../components/AdminStyles'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // ステップ1: Supabase Authでログイン
      console.log('[Login] ステップ1: 認証開始 email=', email)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('[Login] ステップ1失敗: 認証エラー:', authError.message)
        setError('メールアドレスまたはパスワードが正しくありません')
        return
      }

      console.log('[Login] ステップ1完了: 認証成功 userId=', authData.user.id)

      // ステップ2: admin_usersテーブルで管理者か確認
      // select('*') を使用: is_superadminカラムが未追加でもエラーにならない
      console.log('[Login] ステップ2: admin_users検索中...')
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single()

      console.log('[Login] ステップ2結果:', {
        adminUser: adminUser ? { company_id: adminUser.company_id, role: adminUser.role, is_superadmin: adminUser.is_superadmin } : null,
        adminError: adminError?.message,
      })

      if (adminError || !adminUser) {
        // 管理者として未登録 → ログアウトしてエラー表示
        const errorMsg = adminError
          ? `管理者データ取得エラー: ${adminError.message}（RLSが有効の場合 sql/002_disable_rls.sql を実行してください）`
          : 'このアカウントは管理者として登録されていません。admin_usersテーブルにデータがあるか確認してください。'
        console.error('[Login] ステップ2失敗:', errorMsg)
        setError(errorMsg)
        await supabase.auth.signOut()
        return
      }

      // ステップ3: スーパー管理者かどうか判定
      const superAdmin = adminUser.is_superadmin === true
      console.log('[Login] ステップ3: is_superadmin=', superAdmin)

      if (superAdmin) {
        console.log('[Login] ステップ3: スーパー管理者 → 遷移先選択画面を表示')
        setIsSuperAdmin(true)
        setLoggedIn(true)
        // ※ setLoading(false) は finally で実行
        return
      }

      // ステップ4: 通常管理者 → 社員一覧へリダイレクト
      console.log('[Login] ステップ4: 通常管理者 → /admin/members にリダイレクト (companyId:', adminUser.company_id, ')')
      router.replace('/admin/members')
      // ※ setLoading(false) は finally で実行
    } catch (err) {
      // 予期しないエラー
      console.error('[Login] 予期しないエラー:', err)
      setError(`ログイン処理中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      // どのパスを通っても必ず loading を解除
      console.log('[Login] finally: setLoading(false)')
      setLoading(false)
    }
  }

  // スーパー管理者用の遷移先選択画面
  if (loggedIn && isSuperAdmin) {
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
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
              ログイン成功 — 遷移先を選択
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              href="/superadmin/companies"
              style={{
                display: 'block',
                padding: '16px 20px',
                backgroundColor: '#1e3a5f',
                color: '#ffffff',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              スーパー管理画面
            </Link>
            <Link
              href="/admin/members"
              style={{
                display: 'block',
                padding: '16px 20px',
                backgroundColor: colors.primary,
                color: '#ffffff',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              通常管理画面
            </Link>
          </div>
        </div>
      </div>
    )
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
