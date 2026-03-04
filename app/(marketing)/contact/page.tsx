'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    message: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.contact_name.trim()) e.contact_name = '担当者名は必須です'
    if (!form.email.trim()) e.email = 'メールアドレスは必須です'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '有効なメールアドレスを入力してください'
    if (!form.message.trim()) e.message = 'お問い合わせ内容は必須です'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('送信に失敗しました')
      setSubmitted(true)
    } catch {
      toast.error('送信に失敗しました。しばらく経ってから再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // 送信完了
  if (submitted) {
    return (
      <section className="bg-white px-4 py-32 text-center">
        <div className="mx-auto max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            お問い合わせありがとうございます
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            内容を確認のうえ、担当者より折り返しご連絡いたします。<br />
            通常2営業日以内にお返事いたします。
          </p>
          <Link href="/">
            <Button size="lg" className="h-12 px-8 font-bold">
              トップに戻る
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  const inputBase = "w-full px-4 py-3 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"

  return (
    <>
      {/* ヒーロー */}
      <section className="bg-white px-4 pt-16 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          お問い合わせ
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          ご質問・ご相談・お申し込みなど、お気軽にお問い合わせください。
        </p>
      </section>

      {/* フォーム */}
      <section className="bg-white px-4 pb-16">
        <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
          {/* 会社名 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              会社名
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="株式会社○○○"
              className={`${inputBase} border-gray-200`}
            />
          </div>

          {/* 担当者名 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              担当者名 <span className="text-red-500 text-xs">*必須</span>
            </label>
            <input
              type="text"
              value={form.contact_name}
              onChange={(e) => handleChange('contact_name', e.target.value)}
              placeholder="山田 太郎"
              className={`${inputBase} ${errors.contact_name ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.contact_name && <p className="mt-1 text-xs text-red-500">{errors.contact_name}</p>}
          </div>

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              メールアドレス <span className="text-red-500 text-xs">*必須</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@example.com"
              className={`${inputBase} ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* 電話番号 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              電話番号 <span className="text-xs text-gray-400">（任意）</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="03-1234-5678"
              className={`${inputBase} border-gray-200`}
            />
          </div>

          {/* お問い合わせ内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              お問い合わせ内容 <span className="text-red-500 text-xs">*必須</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={6}
              placeholder="ご質問・ご相談内容をお書きください"
              className={`${inputBase} resize-none ${errors.message ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
          </div>

          {/* 送信ボタン */}
          <div className="text-center pt-4">
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="h-12 px-12 text-base font-bold"
            >
              {loading ? '送信中...' : '送信する'}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400">
            <Link href="/portal/terms" className="underline hover:text-gray-600">利用規約</Link>
            {' & '}
            <Link href="/privacy-policy" className="underline hover:text-gray-600">プライバシーポリシー</Link>
            {' '}に同意のうえ、送信してください。
          </p>
        </form>
      </section>
    </>
  )
}
