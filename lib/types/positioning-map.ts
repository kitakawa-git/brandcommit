// ポジショニングマップ データ型定義

export type PositioningMapSize = 'sm' | 'md' | 'lg' | 'custom'

export type PositioningMapItem = {
  name: string
  color: string
  x: number
  y: number
  size: PositioningMapSize
  customSize?: number
}

export type PositioningMapData = {
  x_axis: { left: string; right: string }
  y_axis: { bottom: string; top: string }
  items: PositioningMapItem[]
}
