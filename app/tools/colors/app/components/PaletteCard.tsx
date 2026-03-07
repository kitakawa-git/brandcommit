'use client'

import type { PaletteProposal } from '@/lib/types/color-tool'
import { AccessibilityBadge } from './AccessibilityBadge'
import { ColorPaletteDisplay, extractColors } from './ColorPaletteDisplay'
import { PalettePreview } from './PalettePreview'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface PaletteCardProps {
  proposal: PaletteProposal
  selected: boolean
  onSelect: (id: string) => void
}

export function PaletteCard({ proposal, selected, onSelect }: PaletteCardProps) {
  const colors = extractColors(proposal)

  return (
    <div
      className={`rounded-lg border-2 bg-white transition-all ${
        selected
          ? 'border-blue-500 shadow-lg shadow-blue-100'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* 上部: カラーバー（5色横並び） */}
      <div className="flex h-20 overflow-hidden rounded-t-[6px]">
        {colors.map((item, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ backgroundColor: item.hex }}
          />
        ))}
      </div>

      {/* 下部: テキスト情報 */}
      <div className="space-y-3 p-5">
        {/* 1行目: パレット名 + AA準拠バッジ */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900">{proposal.name}</h3>
          <AccessibilityBadge score={proposal.accessibilityScore} />
        </div>

        {/* 2行目: 説明文 */}
        <p className="text-sm text-gray-600">{proposal.concept}</p>

        {/* 3行目: カラー詳細（inline表示） */}
        <ColorPaletteDisplay colors={colors} layout="inline" />

        {/* 4行目: 提案理由 */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">提案理由</p>
          <p className="text-xs leading-relaxed text-gray-600">
            {proposal.reasoning}
          </p>
        </div>

        {/* 5行目: プレビュー */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">プレビュー</p>
          <PalettePreview proposal={proposal} />
        </div>

        {/* 6行目: 選択ボタン（右寄せ） */}
        <div className="flex justify-end">
        <Button
          onClick={() => onSelect(proposal.id)}
          variant={selected ? 'default' : 'outline'}
        >
          {selected ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              選択中
            </>
          ) : (
            'この案を選ぶ'
          )}
        </Button>
        </div>
      </div>
    </div>
  )
}
