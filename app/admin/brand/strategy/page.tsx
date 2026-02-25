'use client'

// ブランド戦略 編集ページ（ターゲット・ペルソナ・ポジショニングマップ・行動指針）
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type PersonaItem = {
  name: string
  age_range: string
  occupation: string
  description: string
  needs: string[]
  pain_points: string[]
}

type ActionGuideline = {
  title: string
  description: string
}

const emptyPersona = (): PersonaItem => ({
  name: '',
  age_range: '',
  occupation: '',
  description: '',
  needs: [],
  pain_points: [],
})

const emptyGuideline = (): ActionGuideline => ({
  title: '',
  description: '',
})

export default function BrandStrategyPage() {
  const { companyId } = useAuth()
  const [target, setTarget] = useState('')
  const [personas, setPersonas] = useState<PersonaItem[]>([])
  const [positioningMapUrl, setPositioningMapUrl] = useState('')
  const [actionGuidelines, setActionGuidelines] = useState<ActionGuideline[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError('')

    try {
      const result = await Promise.race([
        supabase
          .from('brand_personas')
          .select('*')
          .eq('company_id', companyId)
          .order('sort_order'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])

      if (result.error) throw new Error(result.error.message)
      if (result.data && result.data.length > 0) {
        // 最初のレコードからtarget, positioning_map_url, action_guidelinesを取得
        const first = result.data[0] as Record<string, unknown>
        setTarget((first.target as string) || '')
        setPositioningMapUrl((first.positioning_map_url as string) || '')
        setActionGuidelines((first.action_guidelines as ActionGuideline[]) || [])

        setPersonas(result.data.map((d: Record<string, unknown>) => ({
          name: (d.name as string) || '',
          age_range: (d.age_range as string) || '',
          occupation: (d.occupation as string) || '',
          description: (d.description as string) || '',
          needs: (d.needs as string[]) || [],
          pain_points: (d.pain_points as string[]) || [],
        })))
      }
    } catch (err) {
      console.error('[BrandStrategy] データ取得エラー:', err)
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

  // ペルソナ操作
  const addPersona = () => {
    if (personas.length >= 5) return
    setPersonas([...personas, emptyPersona()])
  }

  const updatePersona = (index: number, field: keyof PersonaItem, value: string | string[]) => {
    const updated = [...personas]
    updated[index] = { ...updated[index], [field]: value }
    setPersonas(updated)
  }

  const removePersona = (index: number) => {
    setPersonas(personas.filter((_, i) => i !== index))
  }

  // ニーズの操作
  const addNeed = (personaIndex: number) => {
    const updated = [...personas]
    updated[personaIndex] = {
      ...updated[personaIndex],
      needs: [...updated[personaIndex].needs, ''],
    }
    setPersonas(updated)
  }

  const updateNeed = (personaIndex: number, needIndex: number, value: string) => {
    const updated = [...personas]
    const needs = [...updated[personaIndex].needs]
    needs[needIndex] = value
    updated[personaIndex] = { ...updated[personaIndex], needs }
    setPersonas(updated)
  }

  const removeNeed = (personaIndex: number, needIndex: number) => {
    const updated = [...personas]
    updated[personaIndex] = {
      ...updated[personaIndex],
      needs: updated[personaIndex].needs.filter((_, i) => i !== needIndex),
    }
    setPersonas(updated)
  }

  // 課題の操作
  const addPainPoint = (personaIndex: number) => {
    const updated = [...personas]
    updated[personaIndex] = {
      ...updated[personaIndex],
      pain_points: [...updated[personaIndex].pain_points, ''],
    }
    setPersonas(updated)
  }

  const updatePainPoint = (personaIndex: number, pointIndex: number, value: string) => {
    const updated = [...personas]
    const pain_points = [...updated[personaIndex].pain_points]
    pain_points[pointIndex] = value
    updated[personaIndex] = { ...updated[personaIndex], pain_points }
    setPersonas(updated)
  }

  const removePainPoint = (personaIndex: number, pointIndex: number) => {
    const updated = [...personas]
    updated[personaIndex] = {
      ...updated[personaIndex],
      pain_points: updated[personaIndex].pain_points.filter((_, i) => i !== pointIndex),
    }
    setPersonas(updated)
  }

  // 行動指針の操作
  const addGuideline = () => {
    if (actionGuidelines.length >= 10) return
    setActionGuidelines([...actionGuidelines, emptyGuideline()])
  }

  const updateGuideline = (index: number, field: keyof ActionGuideline, value: string) => {
    const updated = [...actionGuidelines]
    updated[index] = { ...updated[index], [field]: value }
    setActionGuidelines(updated)
  }

  const removeGuideline = (index: number) => {
    setActionGuidelines(actionGuidelines.filter((_, i) => i !== index))
  }

  // ポジショニングマップ画像アップロード
  const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !companyId) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage('ファイルサイズは5MB以下にしてください')
      setMessageType('error')
      return
    }

    setUploading(true)
    try {
      const timestamp = Date.now()
      const ext = file.name.split('.').pop() || 'png'
      const random = Math.random().toString(36).substring(2, 8)
      const path = `${companyId}/strategy/${timestamp}-${random}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(path)

      setPositioningMapUrl(publicUrl)
    } catch (err) {
      console.error('[MapUpload] エラー:', err)
      setMessage('画像のアップロードに失敗しました')
      setMessageType('error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeMap = () => {
    setPositioningMapUrl('')
  }

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)
    setMessage('')
    setMessageType('error')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || ''

    const headers = {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=minimal',
    }

    // 行動指針をクリーンアップ
    const cleanedGuidelines = actionGuidelines.filter(g =>
      g.title.trim() !== '' || g.description.trim() !== ''
    )

    try {
      // 1. 既存を全削除
      const delRes = await fetch(`${supabaseUrl}/rest/v1/brand_personas?company_id=eq.${companyId}`, {
        method: 'DELETE',
        headers,
      })
      if (!delRes.ok) {
        const body = await delRes.text()
        throw new Error(`削除エラー: HTTP ${delRes.status}: ${body}`)
      }

      // 2. 現在のリストを全INSERT
      const cleanedPersonas = personas.filter(p =>
        p.name.trim() !== '' || p.age_range.trim() !== '' || p.occupation.trim() !== ''
      )

      if (cleanedPersonas.length > 0) {
        const insertData = cleanedPersonas.map((p, i) => ({
          company_id: companyId,
          name: p.name,
          age_range: p.age_range || null,
          occupation: p.occupation || null,
          description: p.description || null,
          needs: p.needs.filter(n => n.trim() !== ''),
          pain_points: p.pain_points.filter(pp => pp.trim() !== ''),
          sort_order: i,
          target: i === 0 ? (target || null) : null,
          positioning_map_url: i === 0 ? (positioningMapUrl || null) : null,
          action_guidelines: i === 0 ? (cleanedGuidelines.length > 0 ? cleanedGuidelines : null) : null,
        }))

        const insRes = await fetch(`${supabaseUrl}/rest/v1/brand_personas`, {
          method: 'POST',
          headers,
          body: JSON.stringify(insertData),
        })
        if (!insRes.ok) {
          const body = await insRes.text()
          throw new Error(`挿入エラー: HTTP ${insRes.status}: ${body}`)
        }
      } else {
        // ペルソナがなくてもtarget等を保存するためダミーレコードを作成
        if (target || positioningMapUrl || cleanedGuidelines.length > 0) {
          const insertData = [{
            company_id: companyId,
            name: '',
            sort_order: 0,
            target: target || null,
            positioning_map_url: positioningMapUrl || null,
            action_guidelines: cleanedGuidelines.length > 0 ? cleanedGuidelines : null,
          }]

          const insRes = await fetch(`${supabaseUrl}/rest/v1/brand_personas`, {
            method: 'POST',
            headers,
            body: JSON.stringify(insertData),
          })
          if (!insRes.ok) {
            const body = await insRes.text()
            throw new Error(`挿入エラー: HTTP ${insRes.status}: ${body}`)
          }
        }
      }

      setPersonas(cleanedPersonas)
      setActionGuidelines(cleanedGuidelines)
      setMessage('保存しました')
      setMessageType('success')
    } catch (err) {
      console.error('[BrandStrategy Save] エラー:', err)
      setMessage('保存に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'))
      setMessageType('error')
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
        <Button variant="outline" onClick={fetchData} className="py-2 px-4 text-[13px]">
          再読み込み
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">
        ブランド戦略
      </h2>

      <Card className="bg-muted/50 border shadow-none">
        <CardContent className="p-6">
          {message && (
            <div className={messageType === 'success' ? 'bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4' : 'bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4'}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ===== ターゲット ===== */}
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-foreground mb-3 pb-2 border-b border-border">ターゲット</h3>
              <textarea
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="ブランドのターゲット市場や顧客層を記述"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* ===== ペルソナ ===== */}
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-foreground mb-3 pb-2 border-b border-border">ペルソナ</h3>
              <p className="text-xs text-muted-foreground mb-4">
                ターゲット顧客のペルソナを設定します（最大5件）
              </p>

              {personas.map((persona, index) => (
                <div key={index} className="border border-border rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] font-bold text-muted-foreground">
                      ペルソナ {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removePersona(index)}
                      className="py-1 px-3 text-xs"
                    >
                      削除
                    </Button>
                  </div>

                  <div className="mb-5">
                    <Label className="mb-1.5 font-bold">ペルソナ名称</Label>
                    <Input
                      type="text"
                      value={persona.name}
                      onChange={(e) => updatePersona(index, 'name', e.target.value)}
                      placeholder="例: 情報感度の高いマーケター"
                      className="h-10"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="mb-5 flex-1">
                      <Label className="mb-1.5 font-bold">年齢層</Label>
                      <Input
                        type="text"
                        value={persona.age_range}
                        onChange={(e) => updatePersona(index, 'age_range', e.target.value)}
                        placeholder="例: 30-40代"
                        className="h-10"
                      />
                    </div>
                    <div className="mb-5 flex-1">
                      <Label className="mb-1.5 font-bold">職業</Label>
                      <Input
                        type="text"
                        value={persona.occupation}
                        onChange={(e) => updatePersona(index, 'occupation', e.target.value)}
                        placeholder="例: マーケティング担当者"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <Label className="mb-1.5 font-bold">説明</Label>
                    <textarea
                      value={persona.description}
                      onChange={(e) => updatePersona(index, 'description', e.target.value)}
                      placeholder="このペルソナの背景や特徴"
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none resize-y min-h-[80px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-5">
                    <Label className="mb-1.5 font-bold">ニーズ</Label>
                    {persona.needs.map((need, needIndex) => (
                      <div key={needIndex} className="flex gap-2 mb-2">
                        <Input
                          type="text"
                          value={need}
                          onChange={(e) => updateNeed(index, needIndex, e.target.value)}
                          placeholder={`ニーズ ${needIndex + 1}`}
                          className="h-10 flex-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeNeed(index, needIndex)}
                          className="py-2 px-3.5 text-[13px] whitespace-nowrap"
                        >
                          削除
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addNeed(index)}
                      className="py-1.5 px-3 text-xs"
                    >
                      + ニーズを追加
                    </Button>
                  </div>

                  <div>
                    <Label className="mb-1.5 font-bold">課題・ペインポイント</Label>
                    {persona.pain_points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex gap-2 mb-2">
                        <Input
                          type="text"
                          value={point}
                          onChange={(e) => updatePainPoint(index, pointIndex, e.target.value)}
                          placeholder={`課題 ${pointIndex + 1}`}
                          className="h-10 flex-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removePainPoint(index, pointIndex)}
                          className="py-2 px-3.5 text-[13px] whitespace-nowrap"
                        >
                          削除
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addPainPoint(index)}
                      className="py-1.5 px-3 text-xs"
                    >
                      + 課題を追加
                    </Button>
                  </div>
                </div>
              ))}

              {personas.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPersona}
                  className="py-2 px-4 text-[13px]"
                >
                  + ペルソナを追加
                </Button>
              )}
            </div>

            {/* ===== ポジショニングマップ ===== */}
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-foreground mb-3 pb-2 border-b border-border">ポジショニングマップ</h3>

              {positioningMapUrl ? (
                <div className="mb-3">
                  <div className="relative inline-block border border-border rounded-lg overflow-hidden">
                    <img
                      src={positioningMapUrl}
                      alt="ポジショニングマップ"
                      className="max-w-full max-h-[300px] block"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={removeMap}
                      className="absolute top-2 right-2 py-1 px-2.5 text-xs"
                    >
                      削除
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-muted-foreground mb-3">
                  ポジショニングマップ画像をアップロードしてください
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMapUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`py-2 px-4 text-[13px] ${uploading ? 'opacity-60' : ''}`}
              >
                {uploading ? 'アップロード中...' : '画像をアップロード'}
              </Button>
            </div>

            {/* ===== 行動指針 ===== */}
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-foreground mb-3 pb-2 border-b border-border">行動指針</h3>

              {actionGuidelines.map((guideline, index) => (
                <div key={index} className="flex gap-2 mb-2 items-start">
                  <Input
                    type="text"
                    value={guideline.title}
                    onChange={(e) => updateGuideline(index, 'title', e.target.value)}
                    placeholder="タイトル（例: 顧客第一）"
                    className="h-10 flex-[0_0_200px]"
                  />
                  <Input
                    type="text"
                    value={guideline.description}
                    onChange={(e) => updateGuideline(index, 'description', e.target.value)}
                    placeholder="説明（例: 常に顧客の視点で考える）"
                    className="h-10 flex-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeGuideline(index)}
                    className="py-2 px-3.5 text-[13px] whitespace-nowrap"
                  >
                    削除
                  </Button>
                </div>
              ))}

              {actionGuidelines.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addGuideline}
                  className="py-1.5 px-3 text-xs"
                >
                  + 行動指針を追加
                </Button>
              )}
            </div>

            <div>
              <Button
                type="submit"
                disabled={saving}
                className={`mt-2 ${saving ? 'opacity-60' : ''}`}
              >
                {saving ? '保存中...' : '保存する'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
