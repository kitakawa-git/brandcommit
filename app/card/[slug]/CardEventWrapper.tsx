'use client'

// 名刺ページ上のリンククリックをトラッキングするラッパー
// display: contents でレイアウトに影響を与えず、子要素のクリックを検知する
import { trackCardEvent } from '@/lib/analytics/track'

type CardEventType = 'sns_click' | 'website_click' | 'phone_click' | 'email_click'

export function CardEventWrapper({
  profileId,
  companyId,
  eventType,
  eventData,
  children,
}: {
  profileId: string
  companyId: string
  eventType: CardEventType
  eventData?: Record<string, unknown>
  children: React.ReactNode
}) {
  return (
    <span
      onClick={() => {
        trackCardEvent({ profileId, companyId, eventType, eventData })
      }}
      style={{ display: 'contents' }}
    >
      {children}
    </span>
  )
}
