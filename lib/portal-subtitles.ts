// ポータルページのデフォルトサブタイトル定数

export const PORTAL_PAGE_KEYS = ['guidelines', 'strategy', 'verbal', 'visuals', 'values'] as const

export type PortalPageKey = (typeof PORTAL_PAGE_KEYS)[number]

export type PortalSubtitles = Partial<Record<PortalPageKey, string>>

export const DEFAULT_SUBTITLES: Record<PortalPageKey, string> = {
  guidelines: 'ブランドのビジョン・ミッション・バリューとメッセージ',
  strategy: 'ターゲット・ペルソナ・ポジショニング・行動指針',
  verbal: 'ブランドのトーン・用語ルール',
  visuals: 'ロゴガイドライン・ブランドカラー・フォント規定',
  values: 'ブランドが提供する主要な価値と差別化要因',
}

export const PAGE_LABELS: Record<PortalPageKey, string> = {
  guidelines: 'ブランド方針',
  strategy: 'ブランド戦略',
  verbal: 'バーバルアイデンティティ',
  visuals: 'ビジュアルアイデンティティ',
  values: '提供価値',
}

/** カスタムサブタイトルがあればそれを返し、なければデフォルトを返す */
export function getSubtitle(
  subtitles: PortalSubtitles | null | undefined,
  key: PortalPageKey
): string {
  const custom = subtitles?.[key]
  return custom && custom.trim() !== '' ? custom : DEFAULT_SUBTITLES[key]
}
