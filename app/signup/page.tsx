'use client'

// セルフサービス登録ページ（3ステップフォーム）
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // フォームデータ
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [userName, setUserName] = useState('')
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')

  // ステップ1バリデーション
  const validateStep1 = (): boolean => {
    if (!email) {
      setError('メールアドレスを入力してください')
      return false
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return false
    }
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return false
    }
    return true
  }

  // ステップ2バリデーション
  const validateStep2 = (): boolean => {
    if (!companyName) {
      setError('企業名を入力してください')
      return false
    }
    return true
  }

  // ステップ3バリデーション
  const validateStep3 = (): boolean => {
    if (!userName) {
      setError('氏名を入力してください')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateStep3()) return

    setLoading(true)
    try {
      // API呼び出し
      console.log('[Signup] 登録API呼び出し開始')
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          companyName,
          userName,
          position,
          department,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('[Signup] API エラー:', data.error)
        setError(data.error || '登録に失敗しました')
        return
      }

      console.log('[Signup] 登録成功、自動ログイン中...')

      // 自動ログイン
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        console.error('[Signup] 自動ログイン失敗:', loginError.message)
        // 登録自体は成功しているのでログインページへ案内
        setError('登録は完了しましたが、自動ログインに失敗しました。ログインページからログインしてください。')
        return
      }

      console.log('[Signup] 自動ログイン成功、管理画面へリダイレクト')
      router.replace('/admin/members')
    } catch (err) {
      console.error('[Signup] 予期しないエラー:', err)
      setError(`登録中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['アカウント', '企業情報', '個人情報']

  const inputClassName = 'w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none box-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  const labelClassName = 'block text-sm font-bold text-gray-900 mb-1.5'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-5">
      <div className="bg-white rounded-xl p-10 w-full max-w-[460px] shadow-sm">
        {/* タイトル */}
        <div className="text-center mb-6">
          <Link href="/" className="no-underline">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              brandcommit
            </h1>
          </Link>
          <p className="text-sm text-gray-500 m-0">
            無料アカウント登録
          </p>
        </div>

        {/* ステップインジケーター */}
        <div className="flex justify-center gap-2 mb-7">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1
            const isActive = stepNum === step
            const isDone = stepNum < step
            return (
              <div key={stepNum} className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold"
                  style={{
                    backgroundColor: isDone ? '#16a34a' : isActive ? '#2563eb' : '#e5e7eb',
                    color: isDone || isActive ? '#fff' : '#6b7280',
                  }}
                >
                  {isDone ? '✓' : stepNum}
                </div>
                <span
                  className={`text-xs ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500 font-normal'}`}
                >
                  {label}
                </span>
                {i < stepLabels.length - 1 && (
                  <div className="w-6 h-px bg-gray-200 ml-1" />
                )}
              </div>
            )
          })}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 text-red-600 py-3 px-4 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ステップ1: アカウント情報 */}
          {step === 1 && (
            <>
              <div className="mb-5">
                <label className={labelClassName}>
                  メールアドレス *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className={inputClassName}
                />
              </div>

              <div className="mb-5">
                <label className={labelClassName}>
                  パスワード *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  required
                  minLength={6}
                  className={inputClassName}
                />
              </div>

              <div className="mb-5">
                <label className={labelClassName}>
                  パスワード（確認） *
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="パスワードを再入力"
                  required
                  minLength={6}
                  className={inputClassName}
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 px-5 bg-blue-600 text-white border-none rounded-lg text-base font-bold cursor-pointer text-center"
              >
                次へ
              </button>
            </>
          )}

          {/* ステップ2: 企業情報 */}
          {step === 2 && (
            <>
              <div className="mb-5">
                <label className={labelClassName}>
                  企業名 *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="株式会社○○"
                  required
                  className={inputClassName}
                />
                <p className="text-xs text-gray-500 mt-1">
                  後から管理画面で詳細情報を追加できます
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-5 bg-transparent text-gray-900 border border-gray-200 rounded-lg text-base cursor-pointer text-center"
                >
                  戻る
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 px-5 bg-blue-600 text-white border-none rounded-lg text-base font-bold cursor-pointer text-center"
                >
                  次へ
                </button>
              </div>
            </>
          )}

          {/* ステップ3: 個人情報 */}
          {step === 3 && (
            <>
              <div className="mb-5">
                <label className={labelClassName}>
                  氏名 *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="山田太郎"
                  required
                  className={inputClassName}
                />
              </div>

              <div className="mb-5">
                <label className={labelClassName}>
                  役職
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="代表取締役（任意）"
                  className={inputClassName}
                />
              </div>

              <div className="mb-5">
                <label className={labelClassName}>
                  部署
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="経営企画部（任意）"
                  className={inputClassName}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-5 bg-transparent text-gray-900 border border-gray-200 rounded-lg text-base cursor-pointer text-center"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 px-5 bg-blue-600 text-white border-none rounded-lg text-base font-bold text-center ${loading ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  {loading ? '登録中...' : '登録する'}
                </button>
              </div>
            </>
          )}
        </form>

        {/* ログインリンク */}
        <p className="text-center text-[13px] text-gray-500 mt-6 mb-0">
          既にアカウントをお持ちの方は{' '}
          <Link href="/admin/login" className="text-blue-600 no-underline font-bold">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
