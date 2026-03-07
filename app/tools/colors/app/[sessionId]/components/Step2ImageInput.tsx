'use client'

// Step 2: イメージ入力
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { KeywordSelector } from '../../components/KeywordSelector'
import { MoodboardPairSelector } from '../../components/MoodboardPair'
import { ColorPicker } from '../../components/ColorPicker'
import type {
  BrandColorProject,
  ApproachType,
  KeywordSelection,
  MoodboardChoice,
} from '@/lib/types/color-tool'

interface Step2Props {
  project: BrandColorProject
  onNext: (data: Record<string, unknown>) => Promise<boolean>
  onBack: () => Promise<boolean>
  onSaveField: (data: Record<string, unknown>) => Promise<void>
}

export function Step2ImageInput({ project, onNext, onBack, onSaveField }: Step2Props) {
  const [approach, setApproach] = useState<ApproachType | null>(
    project.approach_type || null
  )
  const [keywords, setKeywords] = useState<KeywordSelection[]>(
    project.keywords || []
  )
  const [moodboardChoices, setMoodboardChoices] = useState<MoodboardChoice[]>(
    project.moodboard_choices || []
  )
  const [avoidColors, setAvoidColors] = useState<string[]>(
    project.avoid_colors || []
  )
  const [referenceBrands, setReferenceBrands] = useState<string[]>(
    project.reference_brands || []
  )
  const [showAdditional, setShowAdditional] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!approach) {
      newErrors.approach = 'アプローチを選択してください'
      setErrors(newErrors)
      return false
    }

    if (approach === 'keyword' && keywords.length < 3) {
      newErrors.keywords = 'キーワードを3つ以上選択してください'
    }

    if (approach === 'moodboard' && moodboardChoices.length < 5) {
      newErrors.moodboard = '5問以上回答してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validate()) return

    setSaving(true)
    const data: Record<string, unknown> = {
      approach_type: approach,
      keywords: approach === 'keyword' ? keywords : [],
      moodboard_choices: approach === 'moodboard' ? moodboardChoices : [],
      avoid_colors: avoidColors.filter(c => c),
      reference_brands: referenceBrands.filter(b => b.trim()),
    }

    const success = await onNext(data)
    if (!success) setSaving(false)
  }

  // 避けたい色の操作
  const addAvoidColor = () => {
    if (avoidColors.length >= 3) return
    setAvoidColors([...avoidColors, '#ff0000'])
  }

  const removeAvoidColor = (index: number) => {
    setAvoidColors(avoidColors.filter((_, i) => i !== index))
  }

  const updateAvoidColor = (index: number, hex: string) => {
    const updated = [...avoidColors]
    updated[index] = hex
    setAvoidColors(updated)
  }

  // 参考ブランドの操作
  const addReferenceBrand = () => {
    if (referenceBrands.length >= 3) return
    setReferenceBrands([...referenceBrands, ''])
  }

  const removeReferenceBrand = (index: number) => {
    setReferenceBrands(referenceBrands.filter((_, i) => i !== index))
  }

  const updateReferenceBrand = (index: number, value: string) => {
    const updated = [...referenceBrands]
    updated[index] = value
    setReferenceBrands(updated)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Step 2: イメージ入力</h1>

      <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
        <CardContent className="p-5">
          <p className="mb-5 text-[13px] text-muted-foreground">
            ブランドのイメージに近い方向性を選んでください
          </p>

          {/* アプローチ選択 */}
      {!approach && (
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setApproach('keyword')}
            className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-2 text-2xl">🏷️</div>
            <h3 className="mb-1 text-base font-bold text-gray-900">キーワードで選ぶ</h3>
            <p className="text-sm text-gray-500">
              ブランドの印象に近いキーワードを3〜5個選んでください
            </p>
          </button>
          <button
            onClick={() => setApproach('moodboard')}
            className="rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-2 text-2xl">🎨</div>
            <h3 className="mb-1 text-base font-bold text-gray-900">直感で選ぶ</h3>
            <p className="text-sm text-gray-500">
              2つの雰囲気からブランドに近い方を直感的に選んでください
            </p>
          </button>
        </div>
      )}

      {/* アプローチ選択済みの場合のヘッダー */}
      {approach && (
        <div className="flex items-center gap-2">
          <span className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            approach === 'keyword'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          )}>
            {approach === 'keyword' ? 'キーワード' : 'ムードボード'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setApproach(null); setErrors({}) }}
            className="text-xs"
          >
            変更する
          </Button>
        </div>
      )}

      {/* キーワードモード */}
      {approach === 'keyword' && (
        <div>
          <KeywordSelector value={keywords} onChange={setKeywords} />
          {errors.keywords && (
            <p className="mt-2 text-xs text-red-500">{errors.keywords}</p>
          )}
          {keywords.length >= 3 && !showAdditional && (
            <div className="mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdditional(true)}
              >
                追加の質問に答える（任意）→
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ムードボードモード */}
      {approach === 'moodboard' && (
        <div>
          <MoodboardPairSelector
            value={moodboardChoices}
            onChange={setMoodboardChoices}
            onComplete={() => setShowAdditional(true)}
          />
          {errors.moodboard && (
            <p className="mt-2 text-xs text-red-500">{errors.moodboard}</p>
          )}
        </div>
      )}

      {/* 共通の追加質問 */}
      {showAdditional && (
        <div className="mt-5 space-y-5 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-bold mb-3">追加の質問（任意）</h2>

          {/* 避けたい色 */}
          <div>
            <h2 className="text-sm font-bold mb-3">
              避けたい色はありますか？
            </h2>
            <div className="space-y-2">
              {avoidColors.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ColorPicker
                    value={color}
                    onChange={(hex) => updateAvoidColor(i, hex)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAvoidColor(i)}
                    className="shrink-0 h-9 w-9 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {avoidColors.length < 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAvoidColor}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  色を追加（最大3色）
                </Button>
              )}
            </div>
          </div>

          {/* 参考ブランド */}
          <div>
            <h2 className="text-sm font-bold mb-3">
              参考にしたいブランドがあれば教えてください
            </h2>
            <div className="space-y-2">
              {referenceBrands.map((brand, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={brand}
                    onChange={(e) => updateReferenceBrand(i, e.target.value)}
                    placeholder="ブランド名"
                    className="h-10 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReferenceBrand(i)}
                    className="shrink-0 h-9 w-9 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {referenceBrands.length < 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addReferenceBrand}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  ブランドを追加（最大3件）
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

        </CardContent>
      </Card>

      {/* ナビゲーション */}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          戻る
        </Button>
        {((approach === 'keyword' && keywords.length >= 3) ||
          (approach === 'moodboard' && moodboardChoices.length >= 5)) && (
          <Button
            onClick={handleNext}
            disabled={saving}
            className="font-bold"
          >
            {saving ? '保存中...' : '次へ：AI提案を受ける'}
          </Button>
        )}
      </div>
    </div>
  )
}
