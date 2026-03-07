'use client'

import { ColorCard } from './ColorCard'
import type { PaletteProposal } from '@/lib/types/color-tool'

interface ColorItem {
  role: string
  name: string
  hex: string
  rgb: { r: number; g: number; b: number }
}

interface ColorPaletteDisplayProps {
  colors: ColorItem[]
  layout: 'grid' | 'inline'
  editable?: boolean
  onColorChange?: (index: number, hex: string) => void
  showColorBar?: boolean
}

// PaletteProposal からカラー配列を抽出するヘルパー
export function extractColors(palette: PaletteProposal): ColorItem[] {
  return [
    { role: 'メインカラー', name: palette.primary.name, hex: palette.primary.hex, rgb: palette.primary.rgb },
    ...palette.secondary.map((c, i) => ({
      role: `サブカラー${i + 1}`,
      name: c.name,
      hex: c.hex,
      rgb: c.rgb,
    })),
    { role: 'アクセントカラー', name: palette.accent.name, hex: palette.accent.hex, rgb: palette.accent.rgb },
    { role: '明るい背景', name: palette.neutrals.light.name, hex: palette.neutrals.light.hex, rgb: palette.neutrals.light.rgb },
    { role: '暗い背景/文字', name: palette.neutrals.dark.name, hex: palette.neutrals.dark.hex, rgb: palette.neutrals.dark.rgb },
  ]
}

export function ColorPaletteDisplay({
  colors,
  layout,
  editable = false,
  onColorChange,
  showColorBar = false,
}: ColorPaletteDisplayProps) {
  if (layout === 'inline') {
    return (
      <div>
        {showColorBar && (
          <div className="mb-3 flex h-5 overflow-hidden rounded">
            {colors.map((c, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {colors.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="h-5 w-5 flex-shrink-0 rounded-full border border-gray-200"
                style={{ backgroundColor: item.hex }}
              />
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                {item.role === 'メインカラー' ? 'メイン' :
                 item.role === 'アクセントカラー' ? 'アクセント' :
                 item.role === '明るい背景' ? '明' :
                 item.role === '暗い背景/文字' ? '暗' :
                 item.role.replace('カラー', '')}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {item.name}
              </span>
              <span className="font-mono text-[10px] text-gray-400 whitespace-nowrap">
                {item.hex}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // layout === 'grid'
  return (
    <div>
      {showColorBar && (
        <div className="mb-4 flex h-[60px] w-full overflow-hidden rounded-lg">
          {colors.map((c, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {colors.map((item, i) => (
          <ColorCard
            key={i}
            role={item.role}
            name={item.name}
            hex={item.hex}
            rgb={item.rgb}
            editable={editable}
            onChange={onColorChange ? (hex) => onColorChange(i, hex) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
