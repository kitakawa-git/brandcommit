'use client'

// 企業情報編集ページ（マルチテナント対応: 自社のレコードのみ表示・編集）
// ブランド関連項目（スローガン、MVV、ブランドストーリー、提供価値、ブランドカラー）は
// ブランド掲示の各ページで管理するため、ここでは企業名・ロゴ・WebサイトURLのみ管理
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { ImageUpload } from '../components/ImageUpload'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Company = {
  id: string
  name: string
  logo_url: string
  website_url: string
}

export default function CompanyPage() {
  const { companyId } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCompany = async (retryCount = 0) => {
    if (!companyId) return
    if (retryCount === 0) {
      setLoading(true)
      setFetchError('')
    }

    const MAX_RETRIES = 2

    try {
      const result = await Promise.race([
        supabase
          .from('companies')
          .select('id, name, logo_url, website_url')
          .eq('id', companyId)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        ),
      ])

      if (result.error) throw new Error(result.error.message)
      if (result.data) {
        setCompany({
          id: result.data.id,
          name: result.data.name || '',
          logo_url: result.data.logo_url || '',
          website_url: result.data.website_url || '',
        })
      }
    } catch (err) {
      console.error(`[Company] データ取得エラー (試行${retryCount + 1}/${MAX_RETRIES + 1}):`, err)

      if (retryCount < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
        return fetchCompany(retryCount + 1)
      }

      const msg = err instanceof Error && err.message === 'timeout'
        ? 'データの取得がタイムアウトしました。再読み込みをお試しください。'
        : 'データの取得に失敗しました'
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!companyId) return
    fetchCompany()
  }, [companyId])

  const handleChange = (field: keyof Company, value: string) => {
    setCompany(prev => prev ? { ...prev, [field]: value } : null)
  }

  // URL正規化: http(s)://がなければhttps://を自動付与、空欄はそのまま
  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    return 'https://' + trimmed
  }

  // Supabase REST APIに直接fetchで保存（JSクライアントの認証ハングを回避）
  const supabasePatch = async (table: string, id: string, data: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // セッショントークンを取得（RLSポリシー用）
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || ''

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        const body = await res.text()
        return { ok: false, error: `HTTP ${res.status}: ${body}` }
      }
      return { ok: true }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { ok: false, error: 'タイムアウト（10秒）: サーバーからの応答がありません。' }
      }
      return { ok: false, error: err instanceof Error ? err.message : '不明なエラー' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return
    setSaving(true)

    try {
      const normalizedWebsiteUrl = normalizeUrl(company.website_url)

      const updateData: Record<string, unknown> = {
        name: company.name,
        logo_url: company.logo_url,
        website_url: normalizedWebsiteUrl,
      }

      const result = await supabasePatch('companies', company.id, updateData)

      if (!result.ok) {
        console.error('[Company Save] エラー:', result.error)
        toast.error('保存に失敗しました: ' + result.error)
      } else {
        toast.success('保存しました')
        handleChange('website_url', normalizedWebsiteUrl)
      }
    } catch (err) {
      console.error('[Company Save] 予期しないエラー:', err)
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました'
      toast.error('保存に失敗しました: ' + errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="text-muted-foreground text-center p-10">
        読み込み中...
      </p>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center p-10">
        <p className="text-red-600 text-sm mb-3">{fetchError}</p>
        <Button variant="outline" onClick={() => fetchCompany(0)} className="py-2 px-4 text-[13px]">
          再読み込み
        </Button>
      </div>
    )
  }

  if (!company) {
    return (
      <p className="text-muted-foreground text-center p-10">
        企業データが見つかりません
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">
        ブランド基本情報
      </h2>

      <Card className="bg-muted/50 border shadow-none">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            {/* ロゴ */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">ロゴ</Label>
              <ImageUpload
                bucket="avatars"
                folder="logos"
                currentUrl={company.logo_url}
                onUpload={(url) => handleChange('logo_url', url)}
              />
            </div>

            {/* 企業名 */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">ブランド名</Label>
              <Input
                type="text"
                value={company.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="株式会社○○"
                className="h-10"
              />
              <p className="text-[13px] text-muted-foreground mt-1.5">
                企業名・サービス名・個人名など、ブランディングの対象となる名称を入力してください
              </p>
            </div>

            {/* WebサイトURL */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">ウェブサイトURL</Label>
              <Input
                type="text"
                value={company.website_url}
                onChange={(e) => handleChange('website_url', e.target.value)}
                placeholder="https://example.com"
                className="h-10"
              />
            </div>

            {/* 保存ボタン */}
            <Button
              type="submit"
              disabled={saving}
              className={`mt-2 ${saving ? 'opacity-60' : ''}`}
            >
              {saving ? '保存中...' : '保存する'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
