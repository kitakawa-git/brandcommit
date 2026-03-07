'use client'

import { ColorPicker } from './ColorPicker'

interface ColorCardProps {
  role: string
  name: string
  hex: string
  rgb: { r: number; g: number; b: number }
  editable?: boolean
  onChange?: (hex: string) => void
}

export function ColorCard({
  role,
  name,
  hex,
  rgb,
  editable = false,
  onChange,
}: ColorCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
      {editable && onChange ? (
        <ColorPicker value={hex} onChange={onChange} />
      ) : (
        <div
          className="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-200"
          style={{ backgroundColor: hex }}
        />
      )}
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400">{role}</p>
        <p className="truncate text-sm font-medium text-gray-900">{name}</p>
        <p className="font-mono text-xs text-gray-500">{hex.toUpperCase()}</p>
        <p className="text-[10px] text-gray-400">
          RGB({rgb.r}, {rgb.g}, {rgb.b})
        </p>
      </div>
    </div>
  )
}
