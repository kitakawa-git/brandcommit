'use client'

// STP分析ツール用ログイン / サインアップページ
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'

type AuthMode = 'login' | 'signup'

export default function STPAuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // セッション作成してリダイレクト
  const createSessionAndRedirect = async (userId: string) => {
    const res = await fetch('/api/tools/stp/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'セッション作成に失敗しました')
    }

    const { sessionId } = await res.json()
    router.replace(`/tools/stp/app/${sessionId}`)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('メールアドレスまたはパスワードが正しくありません')
        return
      }

      await createSessionAndRedirect(data.user.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログイン中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    try {
      // サインアップAPI経由でAuth user作成
      const res = await fetch('/api/tools/stp/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isNewUser: true }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'アカウント作成に失敗しました')
      }

      // 作成成功 → ログイン
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        throw new Error('アカウントは作成されましたがログインに失敗しました。ログイン画面からお試しください。')
      }

      const { sessionId } = await res.json()
      router.replace(`/tools/stp/app/${sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アカウント作成中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center font-sans"
      style={{
        background: [
          'radial-gradient(ellipse 180% 160% at 5% 20%, rgba(196, 181, 253, 0.7) 0%, transparent 55%)',
          'radial-gradient(ellipse 160% 140% at 85% 10%, rgba(253, 186, 116, 0.65) 0%, transparent 55%)',
          'radial-gradient(ellipse 150% 130% at 50% 90%, rgba(251, 207, 232, 0.6) 0%, transparent 55%)',
          'radial-gradient(ellipse 130% 110% at 95% 65%, rgba(167, 139, 250, 0.45) 0%, transparent 55%)',
          'linear-gradient(135deg, rgba(245, 243, 255, 1) 0%, rgba(255, 251, 245, 1) 40%, rgba(255, 241, 248, 1) 100%)',
        ].join(', '),
      }}
    >
      <div
        className="relative w-full max-w-[400px] mx-5 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0px 8px 24px 0 rgba(12, 74, 110, 0.12), inset 0px 0px 4px 2px rgba(255, 255, 255, 0.15)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'linear-gradient(to left top, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)' }} />
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)' }} />

        <div className="relative z-10 p-10">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              branding.bz
            </h1>
            <p className="m-0 text-sm text-gray-500">
              {mode === 'login' ? 'STP分析ツールにログイン' : 'アカウントを作成'}
            </p>
          </div>

          {error && (
            <div className="mb-4 whitespace-pre-wrap break-words rounded-lg bg-red-50/80 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            <div className="mb-5">
              <h2 className="mb-1.5 text-sm font-bold text-gray-700">メールアドレス</h2>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-10 bg-white/60 border-white/80 focus-visible:ring-gray-400"
              />
            </div>

            <div className="mb-5">
              <h2 className="mb-1.5 text-sm font-bold text-gray-700">パスワード</h2>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                required
                minLength={6}
                className="h-10 bg-white/60 border-white/80 focus-visible:ring-gray-400"
              />
            </div>

            {mode === 'signup' && (
              <div className="mb-5">
                <h2 className="mb-1.5 text-sm font-bold text-gray-700">パスワード（確認）</h2>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="パスワードを再入力"
                  required
                  minLength={6}
                  className="h-10 bg-white/60 border-white/80 focus-visible:ring-gray-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-11 rounded-full text-base font-bold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0px 8px 24px 0 rgba(0, 0, 0, 0.2), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.15)',
              }}
            >
              {loading
                ? (mode === 'login' ? 'ログイン中...' : 'アカウント作成中...')
                : (mode === 'login' ? 'ログイン' : 'アカウントを作成')
              }
            </button>
          </form>

          <p className="mb-0 mt-6 text-center text-xs">
            {mode === 'login' ? (
              <span className="text-gray-500">
                アカウントをお持ちでない方は{' '}
                <button
                  onClick={() => { setMode('signup'); setError('') }}
                  className="font-bold text-blue-600 underline-offset-2 hover:underline bg-transparent border-0 cursor-pointer"
                >
                  新規登録
                </button>
              </span>
            ) : (
              <span className="text-gray-500">
                アカウントをお持ちの方は{' '}
                <button
                  onClick={() => { setMode('login'); setError('') }}
                  className="font-bold text-blue-600 underline-offset-2 hover:underline bg-transparent border-0 cursor-pointer"
                >
                  ログイン
                </button>
              </span>
            )}
          </p>

          <p className="mb-0 mt-3 text-center text-xs text-gray-500">
            branding.bz本体をご利用の方も
            <br />
            同じアカウントでログインできます
          </p>
        </div>
      </div>
    </div>
  )
}
