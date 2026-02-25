'use client'

// ブランド方針 編集ページ
// スローガン・コンセプトビジュアル・動画・メッセージ・MVV・ストーリー・沿革・事業内容・特性
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { ImageUpload } from '../../components/ImageUpload'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ValueItem = { name: string; description: string }
type HistoryItem = { year: string; event: string }
type BusinessItem = { title: string; description: string }
type TraitItem = { name: string; score: number; description: string }

type Guidelines = {
  slogan: string
  concept_visual_url: string
  brand_video_url: string
  brand_statement: string
  mission: string
  vision: string
  values: ValueItem[]
  brand_story: string
  history: HistoryItem[]
  business_content: BusinessItem[]
  traits: TraitItem[]
}

export default function BrandGuidelinesPage() {
  const { companyId } = useAuth()
  const [guidelinesId, setGuidelinesId] = useState<string | null>(null)
  const [guidelines, setGuidelines] = useState<Guidelines>({
    slogan: '',
    concept_visual_url: '',
    brand_video_url: '',
    brand_statement: '',
    mission: '',
    vision: '',
    values: [],
    brand_story: '',
    history: [],
    business_content: [],
    traits: [],
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchGuidelines = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('brand_guidelines')
          .select('*')
          .eq('company_id', companyId)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.data) {
        setGuidelinesId(result.data.id)
        setGuidelines({
          slogan: result.data.slogan || '',
          concept_visual_url: result.data.concept_visual_url || '',
          brand_video_url: result.data.brand_video_url || '',
          brand_statement: result.data.brand_statement || '',
          mission: result.data.mission || '',
          vision: result.data.vision || '',
          values: result.data.values || [],
          brand_story: result.data.brand_story || '',
          history: result.data.history || [],
          business_content: result.data.business_content || [],
          traits: result.data.traits || [],
        })
      }
    } catch (err) {
      console.error('[BrandGuidelines] データ取得エラー:', err)
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
    fetchGuidelines()
  }, [companyId])

  // --- ジェネリック更新 ---
  const handleChange = (field: keyof Guidelines, value: unknown) => {
    setGuidelines(prev => ({ ...prev, [field]: value }))
  }

  // --- バリュー ---
  const addValue = () => {
    if (guidelines.values.length >= 10) return
    handleChange('values', [...guidelines.values, { name: '', description: '' }])
  }
  const updateValue = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...guidelines.values]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('values', updated)
  }
  const removeValue = (index: number) => {
    handleChange('values', guidelines.values.filter((_, i) => i !== index))
  }

  // --- 沿革 ---
  const addHistory = () => {
    handleChange('history', [...guidelines.history, { year: '', event: '' }])
  }
  const updateHistory = (index: number, field: 'year' | 'event', value: string) => {
    const updated = [...guidelines.history]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('history', updated)
  }
  const removeHistory = (index: number) => {
    handleChange('history', guidelines.history.filter((_, i) => i !== index))
  }

  // --- 事業内容 ---
  const addBusiness = () => {
    handleChange('business_content', [...guidelines.business_content, { title: '', description: '' }])
  }
  const updateBusiness = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...guidelines.business_content]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('business_content', updated)
  }
  const removeBusiness = (index: number) => {
    handleChange('business_content', guidelines.business_content.filter((_, i) => i !== index))
  }

  // --- ブランド特性 ---
  const addTrait = () => {
    if (guidelines.traits.length >= 5) return
    handleChange('traits', [...guidelines.traits, { name: '', score: 5, description: '' }])
  }
  const updateTrait = (index: number, field: keyof TraitItem, value: string | number) => {
    const updated = [...guidelines.traits]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('traits', updated)
  }
  const removeTrait = (index: number) => {
    handleChange('traits', guidelines.traits.filter((_, i) => i !== index))
  }

  // URL正規化
  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    return 'https://' + trimmed
  }

  // Supabase REST API直接fetch (PATCH)
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

  // Supabase REST API直接fetch (INSERT)
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

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const cleanedValues = guidelines.values.filter(v => v.name.trim() !== '')
      const cleanedHistory = guidelines.history.filter(h => h.year.trim() !== '' || h.event.trim() !== '')
      const cleanedBusiness = guidelines.business_content.filter(b => b.title.trim() !== '')
      const cleanedTraits = guidelines.traits.filter(t => t.name.trim() !== '')

      const saveData: Record<string, unknown> = {
        company_id: companyId,
        slogan: guidelines.slogan || null,
        concept_visual_url: guidelines.concept_visual_url || null,
        brand_video_url: guidelines.brand_video_url ? normalizeUrl(guidelines.brand_video_url) : null,
        brand_statement: guidelines.brand_statement || null,
        mission: guidelines.mission || null,
        vision: guidelines.vision || null,
        values: cleanedValues.length > 0 ? cleanedValues : [],
        brand_story: guidelines.brand_story || null,
        history: cleanedHistory.length > 0 ? cleanedHistory : [],
        business_content: cleanedBusiness.length > 0 ? cleanedBusiness : [],
        traits: cleanedTraits.length > 0 ? cleanedTraits : [],
      }

      let result: { ok: boolean; error?: string; data?: Record<string, unknown> }

      if (guidelinesId) {
        result = await supabasePatch('brand_guidelines', guidelinesId, saveData, token)
      } else {
        result = await supabaseInsert('brand_guidelines', saveData, token)
        if (result.ok && result.data) {
          setGuidelinesId(result.data.id as string)
        }
      }

      if (result.ok) {
        toast.success('保存しました')
        handleChange('values', cleanedValues)
        handleChange('history', cleanedHistory)
        handleChange('business_content', cleanedBusiness)
        handleChange('traits', cleanedTraits)
        if (guidelines.brand_video_url) {
          handleChange('brand_video_url', normalizeUrl(guidelines.brand_video_url))
        }
      } else {
        toast.error('保存に失敗しました: ' + result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました'
      toast.error('保存に失敗しました: ' + errorMessage)
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
        <Button variant="outline" onClick={fetchGuidelines} className="py-2 px-4 text-[13px]">再読み込み</Button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">
        ブランド方針
      </h2>

      <Card className="bg-muted/50 border shadow-none">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            {/* 1. スローガン */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">スローガン</Label>
              <Input
                type="text"
                value={guidelines.slogan}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="企業スローガン"
                className="h-10"
              />
            </div>

            {/* 2. コンセプトビジュアル */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">コンセプトビジュアル</Label>
              <ImageUpload
                bucket="avatars"
                folder="concept-visuals"
                currentUrl={guidelines.concept_visual_url}
                onUpload={(url) => handleChange('concept_visual_url', url)}
              />
            </div>

            {/* 3. ブランド動画URL */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">ブランド動画URL</Label>
              <Input
                type="text"
                value={guidelines.brand_video_url}
                onChange={(e) => handleChange('brand_video_url', e.target.value)}
                placeholder="https://youtube.com/..."
                className="h-10"
              />
            </div>

            {/* 4. メッセージ（旧ブランドステートメント） */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">メッセージ</Label>
              <textarea
                value={guidelines.brand_statement}
                onChange={(e) => handleChange('brand_statement', e.target.value)}
                placeholder="ブランドとしてのメッセージ"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 5. ミッション */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">ミッション</Label>
              <textarea
                value={guidelines.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                placeholder="私たちの使命は..."
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 6. ビジョン */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">ビジョン</Label>
              <textarea
                value={guidelines.vision}
                onChange={(e) => handleChange('vision', e.target.value)}
                placeholder="私たちが目指す未来は..."
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 7. バリュー */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">バリュー（最大10個）</Label>
              <p className="text-xs text-muted-foreground mb-2">
                企業が大切にする価値観を設定します
              </p>
              {guidelines.values.map((value, index) => (
                <div key={index} className="flex gap-2 mb-2 items-start">
                  <Input
                    type="text"
                    value={value.name}
                    onChange={(e) => updateValue(index, 'name', e.target.value)}
                    placeholder={`バリュー名 ${index + 1}`}
                    className="h-10 flex-1"
                  />
                  <Input
                    type="text"
                    value={value.description}
                    onChange={(e) => updateValue(index, 'description', e.target.value)}
                    placeholder="説明"
                    className="h-10 flex-[2]"
                  />
                  <Button type="button" variant="outline" onClick={() => removeValue(index)} className="py-2 px-3.5 text-[13px] whitespace-nowrap">
                    削除
                  </Button>
                </div>
              ))}
              {guidelines.values.length < 10 && (
                <Button type="button" variant="outline" onClick={addValue} className="py-2 px-4 text-[13px]">
                  + バリューを追加
                </Button>
              )}
            </div>

            {/* 8. ブランドストーリー */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">ブランドストーリー</Label>
              <textarea
                value={guidelines.brand_story}
                onChange={(e) => handleChange('brand_story', e.target.value)}
                placeholder="企業の成り立ちや想いを物語として..."
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[200px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 9. 沿革 */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">沿革</Label>
              <p className="text-xs text-muted-foreground mb-2">
                企業の歩みを年と出来事で記録します
              </p>
              {guidelines.history.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <Input
                    type="text"
                    value={item.year}
                    onChange={(e) => updateHistory(index, 'year', e.target.value)}
                    placeholder="年"
                    className="h-10 w-20 shrink-0"
                  />
                  <Input
                    type="text"
                    value={item.event}
                    onChange={(e) => updateHistory(index, 'event', e.target.value)}
                    placeholder="出来事"
                    className="h-10 flex-1"
                  />
                  <Button type="button" variant="outline" onClick={() => removeHistory(index)} className="py-2 px-3.5 text-[13px] whitespace-nowrap">
                    削除
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addHistory} className="py-2 px-4 text-[13px]">
                + 沿革を追加
              </Button>
            </div>

            {/* 10. 事業内容 */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">事業内容</Label>
              {guidelines.business_content.map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-3 mb-2">
                  <div className="flex gap-2 mb-2 items-center">
                    <Input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateBusiness(index, 'title', e.target.value)}
                      placeholder="事業タイトル"
                      className="h-10 flex-1"
                    />
                    <Button type="button" variant="outline" onClick={() => removeBusiness(index)} className="py-2 px-3.5 text-[13px] whitespace-nowrap">
                      削除
                    </Button>
                  </div>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateBusiness(index, 'description', e.target.value)}
                    placeholder="事業の説明"
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[60px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addBusiness} className="py-2 px-4 text-[13px]">
                + 事業内容を追加
              </Button>
            </div>

            {/* 11. ブランド特性 */}
            <div className="mb-5">
              <Label className="mb-1.5 font-bold">ブランド特性（最大5つ）</Label>
              <p className="text-xs text-muted-foreground mb-2">
                ブランドの性格を表す特性とスコア（1〜10）を設定します
              </p>
              {guidelines.traits.map((trait, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <Input
                    type="text"
                    value={trait.name}
                    onChange={(e) => updateTrait(index, 'name', e.target.value)}
                    placeholder="特性名"
                    className="h-10 flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={trait.score}
                    onChange={(e) => updateTrait(index, 'score', parseInt(e.target.value) || 5)}
                    className="h-10 w-[70px] text-center"
                  />
                  <Input
                    type="text"
                    value={trait.description}
                    onChange={(e) => updateTrait(index, 'description', e.target.value)}
                    placeholder="この特性の説明"
                    className="h-10 flex-[2]"
                  />
                  <Button type="button" variant="outline" onClick={() => removeTrait(index)} className="py-2 px-3.5 text-[13px] whitespace-nowrap">
                    削除
                  </Button>
                </div>
              ))}
              {guidelines.traits.length < 5 && (
                <Button type="button" variant="outline" onClick={addTrait} className="py-2 px-4 text-[13px]">
                  + 特性を追加
                </Button>
              )}
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
