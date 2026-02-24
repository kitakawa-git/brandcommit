'use client'

// セルフサービス登録ページ（3ステップフォーム）
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const pageBg = '#f9fafb'
const white = '#ffffff'
const primary = '#2563eb'
const textPrimary = '#111827'
const textSecondary = '#6b7280'
const inputBorder = '#d1d5db'
const border = '#e5e7eb'
const danger = '#dc2626'
const success = '#16a34a'

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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: pageBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: white,
        borderRadius: 12,
        padding: 40,
        width: '100%',
        maxWidth: 460,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: textPrimary,
              margin: '0 0 8px',
            }}>
              brandcommit
            </h1>
          </Link>
          <p style={{
            fontSize: 14,
            color: textSecondary,
            margin: 0,
          }}>
            無料アカウント登録
          </p>
        </div>

        {/* ステップインジケーター */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 28,
        }}>
          {stepLabels.map((label, i) => {
            const stepNum = i + 1
            const isActive = stepNum === step
            const isDone = stepNum < step
            return (
              <div key={stepNum} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: isDone ? success : isActive ? primary : border,
                  color: isDone || isActive ? '#fff' : textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 'bold',
                }}>
                  {isDone ? '✓' : stepNum}
                </div>
                <span style={{
                  fontSize: 12,
                  color: isActive ? textPrimary : textSecondary,
                  fontWeight: isActive ? 'bold' : 'normal',
                }}>
                  {label}
                </span>
                {i < stepLabels.length - 1 && (
                  <div style={{
                    width: 24,
                    height: 1,
                    backgroundColor: border,
                    marginLeft: 4,
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: danger,
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ステップ1: アカウント情報 */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: textPrimary,
                  marginBottom: 6,
                }}>
                  メールアドレス *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: textPrimary,
                  marginBottom: 6,
                }}>
                  パスワード *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: textPrimary,
                  marginBottom: 6,
                }}>
                  パスワード（確認） *
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="パスワードを再入力"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  backgroundColor: primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                次へ
              </button>
            </>
          )}

          {/* ステップ2: 企業情報 */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: textPrimary,
                  marginBottom: 6,
                }}>
                  企業名 *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="株式会社○○"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>
                  後から管理画面で詳細情報を追加できます
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: 'transparent',
                    color: textPrimary,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  戻る
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  次へ
                </button>
              </div>
            </>
          )}

          {/* ステップ3: 個人情報 */}
          {step === 3 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: textPrimary,
                  marginBottom: 6,
                }}>
                  氏名 *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="山田太郎"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: textPrimary,
                  marginBottom: 6,
                }}>
                  役職
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="代表取締役（任意）"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: textPrimary,
                  marginBottom: 6,
                }}>
                  部署
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="経営企画部（任意）"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: 'transparent',
                    color: textPrimary,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  戻る
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: loading ? 'default' : 'pointer',
                    textAlign: 'center',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? '登録中...' : '登録する'}
                </button>
              </div>
            </>
          )}
        </form>

        {/* ログインリンク */}
        <p style={{
          textAlign: 'center',
          fontSize: 13,
          color: textSecondary,
          marginTop: 24,
          marginBottom: 0,
        }}>
          既にアカウントをお持ちの方は{' '}
          <Link href="/admin/login" style={{ color: primary, textDecoration: 'none', fontWeight: 'bold' }}>
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
