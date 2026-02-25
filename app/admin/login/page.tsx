'use client'

// ログインページ
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { commonStyles } from '../components/AdminStyles'
import { cn } from '@/lib/utils'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="bg-white rounded-xl p-10 w-full max-w-[400px] shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              brandcommit
            </h1>
            <p className="text-sm text-gray-500 m-0">
              ログイン成功 — 遷移先を選択
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/superadmin/companies"
              className="block py-4 px-5 bg-[#1e3a5f] text-white rounded-lg no-underline text-[15px] font-bold text-center"
            >
              スーパー管理画面
            </Link>
            <Link
              href="/admin/members"
              className="block py-4 px-5 bg-blue-600 text-white rounded-lg no-underline text-[15px] font-bold text-center"
            >
              通常管理画面
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="bg-white rounded-xl p-10 w-full max-w-[400px] shadow-sm">
        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            brandcommit
          </h1>
          <p className="text-sm text-gray-500 m-0">
            管理画面にログイン
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className={cn(commonStyles.error, 'whitespace-pre-wrap break-words')}>
            {error}
          </div>
        )}

        {/* ログインフォーム */}
        <form onSubmit={handleLogin}>
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className={commonStyles.input}
            />
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              className={commonStyles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(commonStyles.button, 'w-full py-3 px-5 text-base text-center', loading && 'opacity-60')}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {/* サインアップリンク */}
        <p className="text-center text-[13px] text-gray-500 mt-6 mb-0">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="text-blue-600 no-underline font-bold">
            こちら
          </Link>
          {' '}から登録
        </p>
      </div>
    </div>
  )
}
