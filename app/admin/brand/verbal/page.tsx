'use client'

// バーバルアイデンティティ 編集ページ（トーンオブボイス・コミュニケーションスタイル・用語ルール統合）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Personality = {
  tone_of_voice: string
  communication_style: string
}

type TermItem = {
  preferred_term: string
  avoided_term: string
  context: string
}

export default function VerbalIdentityPage() {
  const { companyId } = useAuth()
  const [personalityId, setPersonalityId] = useState<string | null>(null)
  const [personality, setPersonality] = useState<Personality>({
    tone_of_voice: '',
    communication_style: '',
  })
  const [terms, setTerms] = useState<TermItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const [personalityResult, termsResult] = await Promise.all([
        Promise.race([
          supabase.from('brand_personalities').select('*').eq('company_id', companyId).single(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
        ]),
        Promise.race([
          supabase.from('brand_terms').select('*').eq('company_id', companyId).order('sort_order'),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
        ]),
      ])

      if (personalityResult.data) {
        setPersonalityId(personalityResult.data.id)
        setPersonality({
          tone_of_voice: personalityResult.data.tone_of_voice || '',
          communication_style: personalityResult.data.communication_style || '',
        })
      }

      if (termsResult.data && termsResult.data.length > 0) {
        setTerms(termsResult.data.map((d: Record<string, unknown>) => ({
          preferred_term: (d.preferred_term as string) || '',
          avoided_term: (d.avoided_term as string) || '',
          context: (d.context as string) || '',
        })))
      }
    } catch (err) {
      console.error('[VerbalIdentity] データ取得エラー:', err)
      const msg = err instanceof Error && err.message === 'timeout'
        ? 'データの取得がタイムアウトしました'
        : 'データの取得に失敗しました'
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!companyId) return
    fetchData()
  }, [companyId])

  const handleChange = (field: keyof Personality, value: string) => {
    setPersonality(prev => ({ ...prev, [field]: value }))
  }

  // --- 用語ルール操作 ---
  const addTerm = () => {
    setTerms([...terms, { preferred_term: '', avoided_term: '', context: '' }])
  }

  const updateTerm = (index: number, field: keyof TermItem, value: string) => {
    const updated = [...terms]
    updated[index] = { ...updated[index], [field]: value }
    setTerms(updated)
  }

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index))
  }

  // Supabase REST API直接fetch
  const supabasePatch = async (table: string, id: string, data: Record<string, unknown>, token: string): Promise<{ ok: boolean; error?: string }> => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
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
        return { ok: false, error: 'タイムアウト（10秒）' }
      }
      return { ok: false, error: err instanceof Error ? err.message : '不明なエラー' }
    }
  }

  const supabaseInsert = async (table: string, data: Record<string, unknown>, token: string): Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }> => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (!res.ok) {
        const body = await res.text()
        return { ok: false, error: `HTTP ${res.status}: ${body}` }
      }
      const result = await res.json()
      return { ok: true, data: result[0] }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { ok: false, error: 'タイムアウト（10秒）' }
      }
      return { ok: false, error: err instanceof Error ? err.message : '不明なエラー' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)
    setMessage('')
    setMessageType('error')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

      // --- 1. パーソナリティ保存 ---
      const personalityData: Record<string, unknown> = {
        company_id: companyId,
        tone_of_voice: personality.tone_of_voice || null,
        communication_style: personality.communication_style || null,
      }

      let pResult: { ok: boolean; error?: string; data?: Record<string, unknown> }
      if (personalityId) {
        pResult = await supabasePatch('brand_personalities', personalityId, personalityData, token)
      } else {
        pResult = await supabaseInsert('brand_personalities', personalityData, token)
        if (pResult.ok && pResult.data) {
          setPersonalityId(pResult.data.id as string)
        }
      }

      if (!pResult.ok) {
        throw new Error('パーソナリティ保存エラー: ' + pResult.error)
      }

      // --- 2. 用語ルール保存（全削除→全INSERT） ---
      const headers = {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=minimal',
      }

      const delRes = await fetch(`${supabaseUrl}/rest/v1/brand_terms?company_id=eq.${companyId}`, {
        method: 'DELETE',
        headers,
      })
      if (!delRes.ok) {
        const body = await delRes.text()
        throw new Error(`用語削除エラー: HTTP ${delRes.status}: ${body}`)
      }

      const cleanedTerms = terms.filter(t => t.preferred_term.trim() !== '')
      if (cleanedTerms.length > 0) {
        const insertData = cleanedTerms.map((t, i) => ({
          company_id: companyId,
          preferred_term: t.preferred_term,
          avoided_term: t.avoided_term || null,
          context: t.context || null,
          sort_order: i,
        }))

        const insRes = await fetch(`${supabaseUrl}/rest/v1/brand_terms`, {
          method: 'POST',
          headers,
          body: JSON.stringify(insertData),
        })
        if (!insRes.ok) {
          const body = await insRes.text()
          throw new Error(`用語挿入エラー: HTTP ${insRes.status}: ${body}`)
        }
      }
      setTerms(cleanedTerms)

      setMessage('保存しました')
      setMessageType('success')
    } catch (err) {
      console.error('[VerbalIdentity Save] エラー:', err)
      setMessage('保存に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'))
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-center p-10">読み込み中...</p>
  }

  if (fetchError) {
    return (
      <div className="text-center p-10">
        <p className="text-red-600 text-sm mb-3">{fetchError}</p>
        <Button variant="outline" onClick={fetchData} className="py-2 px-4 text-[13px]">再読み込み</Button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">
        バーバルアイデンティティ
      </h2>

      <Card className="bg-muted/50 border shadow-none">
        <CardContent className="p-6">
          {message && (
            <div className={messageType === 'success' ? 'bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4' : 'bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4'}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* トーンオブボイス */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">トーンオブボイス</Label>
              <textarea
                value={personality.tone_of_voice}
                onChange={(e) => handleChange('tone_of_voice', e.target.value)}
                placeholder="フォーマルだが親しみやすい、専門用語は最小限に..."
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* コミュニケーションスタイル */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">コミュニケーションスタイル</Label>
              <textarea
                value={personality.communication_style}
                onChange={(e) => handleChange('communication_style', e.target.value)}
                placeholder="結論から伝える、データで裏付ける..."
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 用語ルール */}
            <div className="mt-2 pt-5 border-t border-border">
              <h3 className="text-[15px] font-bold text-foreground mb-2">
                用語ルール
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                ブランドで使用する推奨用語と避けるべき用語を設定します
              </p>

              {/* ヘッダー行 */}
              {terms.length > 0 && (
                <div className="flex gap-2 mb-2">
                  <span className="flex-1 text-xs font-bold text-muted-foreground">推奨用語</span>
                  <span className="flex-1 text-xs font-bold text-muted-foreground">非推奨用語</span>
                  <span className="flex-1 text-xs font-bold text-muted-foreground">使い分け説明</span>
                  <span className="w-14" />
                </div>
              )}

              {terms.map((term, index) => (
                <div key={index} className="flex gap-2 mb-2 items-start">
                  <Input
                    type="text"
                    value={term.preferred_term}
                    onChange={(e) => updateTerm(index, 'preferred_term', e.target.value)}
                    placeholder="推奨用語"
                    className="h-10 flex-1"
                  />
                  <Input
                    type="text"
                    value={term.avoided_term}
                    onChange={(e) => updateTerm(index, 'avoided_term', e.target.value)}
                    placeholder="非推奨用語"
                    className="h-10 flex-1"
                  />
                  <Input
                    type="text"
                    value={term.context}
                    onChange={(e) => updateTerm(index, 'context', e.target.value)}
                    placeholder="使い分け説明"
                    className="h-10 flex-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeTerm(index)}
                    className="py-2 px-3.5 text-[13px] whitespace-nowrap"
                  >
                    削除
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addTerm}
                className="py-2 px-4 text-[13px] mb-5"
              >
                + 用語ルールを追加
              </Button>
            </div>

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
