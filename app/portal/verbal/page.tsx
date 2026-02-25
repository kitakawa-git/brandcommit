'use client'

// バーバルアイデンティティ 閲覧ページ（トーンオブボイス・コミュニケーションスタイル・用語ルール統合）
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePortalAuth } from '../components/PortalAuthProvider'
import { Card, CardContent } from '@/components/ui/card'

type Personality = {
  tone_of_voice: string | null
  communication_style: string | null
}

type Term = {
  preferred_term: string
  avoided_term: string
  context: string | null
}

export default function PortalVerbalIdentityPage() {
  const { companyId } = usePortalAuth()
  const [personality, setPersonality] = useState<Personality | null>(null)
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return

    Promise.all([
      supabase.from('brand_personalities').select('*').eq('company_id', companyId).single(),
      supabase.from('brand_terms').select('*').eq('company_id', companyId).order('sort_order'),
    ]).then(([pRes, tRes]) => {
      if (pRes.data) {
        setPersonality({
          tone_of_voice: pRes.data.tone_of_voice,
          communication_style: pRes.data.communication_style,
        })
      }
      if (tRes.data) {
        setTerms(tRes.data.map((d: Record<string, unknown>) => ({
          preferred_term: (d.preferred_term as string) || '',
          avoided_term: (d.avoided_term as string) || '',
          context: (d.context as string) || null,
        })))
      }
      setLoading(false)
    })
  }, [companyId])

  if (loading) return <div className="text-center py-16 text-muted-foreground text-[15px]">読み込み中...</div>

  const hasTone = personality?.tone_of_voice
  const hasStyle = personality?.communication_style
  const hasTerms = terms.length > 0

  if (!hasTone && !hasStyle && !hasTerms) {
    return <div className="text-center py-16 text-muted-foreground text-[15px]">まだ登録されていません</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">バーバルアイデンティティ</h1>
        <p className="text-sm text-muted-foreground">
          ブランドのトーン・コミュニケーションスタイル・用語ルール
        </p>
      </div>

      {/* 1. トーン・オブ・ボイス */}
      {hasTone && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">トーン・オブ・ボイス</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{personality!.tone_of_voice}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 2. コミュニケーションスタイル */}
      {hasStyle && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">コミュニケーションスタイル</h2>
          <Card className="bg-muted/50 border shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap m-0">{personality!.communication_style}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 3. 用語ルール */}
      {hasTerms && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3 tracking-wide">用語ルール</h2>
          <Card className="bg-muted/50 border shadow-none overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs w-[30%]">
                      推奨する表現
                    </th>
                    <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs w-[30%]">
                      避ける表現
                    </th>
                    <th className="text-left px-4 py-3 bg-muted text-muted-foreground font-semibold border-b border-border text-xs">
                      補足・文脈
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {terms.map((term, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 border-b border-border font-bold text-green-600 text-sm">
                        {term.preferred_term}
                      </td>
                      <td className="px-4 py-3 border-b border-border text-red-500 line-through text-sm">
                        {term.avoided_term}
                      </td>
                      <td className="px-4 py-3 border-b border-border text-muted-foreground text-xs">
                        {term.context || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
