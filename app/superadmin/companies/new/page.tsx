'use client'

// スーパー管理画面: 新規企業+管理者アカウント同時作成
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { colors, commonStyles } from '../../../admin/components/AdminStyles'

export default function NewCompanyPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 企業情報
  const [companyName, setCompanyName] = useState('')
  const [slogan, setSlogan] = useState('')
  const [mvv, setMvv] = useState('')
  const [brandColorPrimary, setBrandColorPrimary] = useState('#1a1a1a')
  const [brandColorSecondary, setBrandColorSecondary] = useState('#666666')
  const [websiteUrl, setWebsiteUrl] = useState('')

  // 管理者アカウント情報
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      // ステップ1: 認証トークンを取得
      console.log('[NewCompany] ステップ1: 認証セッション取得中...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('[NewCompany] ステップ1失敗: セッションエラー:', sessionError.message)
        setError(`セッションエラー: ${sessionError.message}`)
        return
      }

      if (!session) {
        console.error('[NewCompany] ステップ1失敗: セッションなし')
        setError('認証セッションがありません。再ログインしてください。')
        return
      }

      console.log('[NewCompany] ステップ1完了: トークン取得成功')

      // ステップ2: API Routeにリクエスト
      console.log('[NewCompany] ステップ2: API呼び出し中... POST /api/superadmin/create-company')
      console.log('[NewCompany] 送信データ:', { companyName, adminEmail, slogan: slogan ? '(あり)' : '(なし)' })

      let res: Response
      try {
        res = await fetch('/api/superadmin/create-company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            companyName,
            slogan,
            mvv,
            brandColorPrimary,
            brandColorSecondary,
            websiteUrl,
            adminEmail,
            adminPassword,
          }),
        })
      } catch (fetchErr) {
        // ネットワークエラー（fetch自体が失敗）
        console.error('[NewCompany] ステップ2失敗: fetch例外:', fetchErr)
        setError(`ネットワークエラー: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`)
        return
      }

      console.log('[NewCompany] ステップ2完了: APIレスポンス status=', res.status)

      // ステップ3: レスポンス解析
      console.log('[NewCompany] ステップ3: レスポンス解析中...')
      let result
      try {
        result = await res.json()
      } catch (jsonErr) {
        console.error('[NewCompany] ステップ3失敗: JSON解析エラー:', jsonErr)
        setError(`APIレスポンス解析エラー (status=${res.status}): レスポンスがJSONではありません`)
        return
      }

      console.log('[NewCompany] ステップ3完了: レスポンス=', JSON.stringify(result))

      if (!res.ok) {
        console.error('[NewCompany] APIエラー:', result.error)
        setError(result.error || `作成に失敗しました (status=${res.status})`)
        return
      }

      // ステップ4: 成功
      console.log('[NewCompany] ステップ4: 作成成功! → 企業一覧へ遷移')
      setSuccessMessage(`企業「${result.company?.name}」を作成しました。リダイレクト中...`)
      setTimeout(() => {
        router.push('/superadmin/companies')
      }, 1000)
    } catch (err) {
      console.error('[NewCompany] 予期しないエラー:', err)
      setError(`予期しないエラー: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      // どのパスを通っても必ず saving を解除
      console.log('[NewCompany] finally: setSaving(false)')
      setSaving(false)
    }
  }

  return (
    <div>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
      }}>
        <Link
          href="/superadmin/companies"
          style={{
            color: colors.textSecondary,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          ← 企業一覧に戻る
        </Link>
      </div>

      <h2 style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        margin: '0 0 24px',
      }}>
        新規企業を登録
      </h2>

      <div style={{ ...commonStyles.card, maxWidth: 600 }}>
        {/* 成功メッセージ */}
        {successMessage && (
          <div style={commonStyles.success}>
            {successMessage}
          </div>
        )}

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

        <form onSubmit={handleSubmit}>
          {/* === 企業情報セクション === */}
          <h3 style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 16px',
            paddingBottom: 8,
            borderBottom: `1px solid ${colors.border}`,
          }}>
            企業情報
          </h3>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>企業名 *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="株式会社○○"
              required
              style={commonStyles.input}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>スローガン</label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="企業のスローガン"
              style={commonStyles.input}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ミッション・ビジョン・バリュー</label>
            <textarea
              value={mvv}
              onChange={(e) => setMvv(e.target.value)}
              placeholder="企業のMVVを入力"
              style={{ ...commonStyles.textarea, minHeight: 100 }}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドカラー（プライマリ）</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                value={brandColorPrimary}
                onChange={(e) => setBrandColorPrimary(e.target.value)}
                style={{
                  width: 48,
                  height: 48,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  padding: 2,
                }}
              />
              <input
                type="text"
                value={brandColorPrimary}
                onChange={(e) => setBrandColorPrimary(e.target.value)}
                style={{ ...commonStyles.input, width: 140 }}
              />
            </div>
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>ブランドカラー（セカンダリ）</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="color"
                value={brandColorSecondary}
                onChange={(e) => setBrandColorSecondary(e.target.value)}
                style={{
                  width: 48,
                  height: 48,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  padding: 2,
                }}
              />
              <input
                type="text"
                value={brandColorSecondary}
                onChange={(e) => setBrandColorSecondary(e.target.value)}
                style={{ ...commonStyles.input, width: 140 }}
              />
            </div>
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>Webサイト URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              style={commonStyles.input}
            />
          </div>

          {/* === 管理者アカウントセクション === */}
          <h3 style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '24px 0 16px',
            paddingBottom: 8,
            borderBottom: `1px solid ${colors.border}`,
          }}>
            管理者アカウント
          </h3>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>メールアドレス *</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@company.com"
              required
              style={commonStyles.input}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>パスワード *</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="8文字以上の安全なパスワード"
              required
              minLength={8}
              style={commonStyles.input}
            />
            <p style={{
              fontSize: 12,
              color: colors.textSecondary,
              margin: '4px 0 0',
            }}>
              ※ このメールアドレスとパスワードで管理画面にログインできます
            </p>
          </div>

          {/* ボタン */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...commonStyles.button,
                backgroundColor: '#1e3a5f',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '作成中...' : '企業+管理者を作成'}
            </button>
            <Link
              href="/superadmin/companies"
              style={commonStyles.buttonOutline}
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
