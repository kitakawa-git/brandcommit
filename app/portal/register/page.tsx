'use client'

// 招待リンクからのセルフ登録ページ（API Route経由）
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'

export default function PortalRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-gray-500">
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

  const inputClassName = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

  // トークン検証中
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-gray-500">
        招待リンクを確認中...
      </div>
    )
  }

  // 無効なトークン
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="bg-white rounded-xl p-10 text-center max-w-[400px] shadow-sm">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            無効な招待リンク
          </h2>
          <p className="text-sm text-gray-500 m-0 leading-relaxed">
            この招待リンクは無効または期限切れです。管理者に新しいリンクを発行してもらってください。
          </p>
        </div>
      </div>
    )
  }

  // 登録フォーム
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <Card className="w-full max-w-[400px] border-0 shadow-sm">
        <CardContent className="p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              brandcommit
            </h1>
            <p className="text-sm text-gray-500 m-0">
              メンバー登録
            </p>
            {companyName && (
              <p className="text-[13px] text-blue-600 mt-2 font-bold">
                {companyName}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                表示名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="山田太郎"
                required
                className={inputClassName}
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
                required
                className={inputClassName}
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                パスワード（8文字以上）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                minLength={8}
                className={inputClassName}
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                パスワード確認
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="もう一度入力"
                required
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 bg-blue-600 text-white border-none rounded-lg text-base font-bold cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? '登録中...' : '登録する'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
