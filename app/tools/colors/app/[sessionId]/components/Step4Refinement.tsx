'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { AccessibilityBadge } from '../../components/AccessibilityBadge'
import { ColorPaletteDisplay, extractColors } from '../../components/ColorPaletteDisplay'
import { PalettePreview } from '../../components/PalettePreview'
import { ChatInterface } from '../../components/ChatInterface'
import { calculateAccessibilityScore } from '@/lib/color-utils'
import type { BrandColorProject, PaletteProposal } from '@/lib/types/color-tool'

interface Step4RefinementProps {
  project: BrandColorProject
  sessionId: string
  onNext: (data: Record<string, unknown>) => Promise<boolean>
  onBack: () => Promise<boolean>
  onSaveField: (data: Record<string, unknown>) => Promise<void>
}

export function Step4Refinement({
  project,
  sessionId,
  onNext,
  onBack,
  onSaveField,
}: Step4RefinementProps) {
  const [palette, setPalette] = useState<PaletteProposal>(
    project.current_palette || project.proposals[0]
  )
  const [adjustmentCount, setAdjustmentCount] = useState(project.adjustment_count)
  const [showPreview, setShowPreview] = useState(false)

  // カラー配列とパスマッピング
  const colors = extractColors(palette)
  const colorPaths = [
    'primary',
    ...palette.secondary.map((_, i) => `secondary.${i}`),
    'accent',
    'neutrals.light',
    'neutrals.dark',
  ]

  // パレットの色を更新
  const updateColor = useCallback(
    (path: string, hex: string) => {
      setPalette((prev) => {
        const updated = structuredClone(prev)
        const rgb = hexToRgbObj(hex)

        switch (path) {
          case 'primary':
            updated.primary = { ...updated.primary, hex, rgb }
            break
          case 'accent':
            updated.accent = { ...updated.accent, hex, rgb }
            break
          case 'neutrals.light':
            updated.neutrals.light = { ...updated.neutrals.light, hex, rgb }
            break
          case 'neutrals.dark':
            updated.neutrals.dark = { ...updated.neutrals.dark, hex, rgb }
            break
          default:
            if (path.startsWith('secondary.')) {
              const idx = parseInt(path.split('.')[1])
              if (updated.secondary[idx]) {
                updated.secondary[idx] = { ...updated.secondary[idx], hex, rgb }
              }
            }
        }

        // アクセシビリティスコア再計算
        updated.accessibilityScore = calculateAccessibilityScore(updated)

        // 自動保存
        onSaveField({ current_palette: updated })

        return updated
      })
    },
    [onSaveField]
  )

  // チャットからのパレット更新
  const handlePaletteUpdate = useCallback(
    (updatedPalette: PaletteProposal) => {
      setPalette(updatedPalette)
      onSaveField({ current_palette: updatedPalette })
      toast.success('パレットが更新されました')
    },
    [onSaveField]
  )

  // インデックスからパスに変換してupdateColorを呼ぶ
  const handleColorChange = useCallback(
    (index: number, hex: string) => {
      updateColor(colorPaths[index], hex)
    },
    [updateColor, colorPaths]
  )

  const handleNext = async () => {
    const ok = await onNext({ current_palette: palette })
    if (!ok) toast.error('保存に失敗しました')
  }

  return (
    <>
    <Card className="bg-[hsl(0_0%_97%)] border shadow-none">
      <CardContent className="p-5">
        <div className="space-y-5">
          {/* 【1】パレット情報ヘッダー */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">{palette.name}</h2>
              <AccessibilityBadge score={palette.accessibilityScore} />
            </div>
            <p className="mt-1 text-sm text-gray-600">{palette.concept}</p>
          </div>

          {/* 【2】2カラムエリア */}
          <div className="flex flex-col gap-5 md:flex-row">
            {/* 左カラム: 5色カラーカード */}
            <div className="w-full md:w-1/2">
              <ColorPaletteDisplay
                colors={colors}
                layout="grid"
                editable
                onColorChange={handleColorChange}
                showColorBar
              />
            </div>

            {/* 右カラム: AIチャット */}
            <div className="w-full md:w-1/2">
              <div className="h-[300px] rounded-lg border border-gray-200 bg-white md:h-full md:min-h-[400px]">
                <ChatInterface
                  sessionId={sessionId}
                  currentPalette={palette}
                  adjustmentCount={adjustmentCount}
                  onPaletteUpdate={handlePaletteUpdate}
                  onAdjustmentCountChange={setAdjustmentCount}
                />
              </div>
            </div>
          </div>

          {/* 【4】プレビュー（アコーディオン） */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${showPreview ? 'rotate-90' : ''}`}
              />
              プレビュー
            </button>
            {showPreview && (
              <div className="mt-3">
                <PalettePreview proposal={palette} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* 【5】フッター */}
    <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 bg-background/80 backdrop-blur border-t border-border px-6 py-3 flex items-center justify-between">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        戻る
      </Button>
      <Button onClick={handleNext}>
        確定・出力へ進む
        <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  </>
  )
}

// HEX → RGB オブジェクト変換
function hexToRgbObj(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16) || 0,
    g: parseInt(clean.slice(2, 4), 16) || 0,
    b: parseInt(clean.slice(4, 6), 16) || 0,
  }
}
