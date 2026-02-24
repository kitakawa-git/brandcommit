'use client'

// アクセス記録用クライアントコンポーネント
// サーバーコンポーネント（CardPage）から呼び出し、ページ表示時に1回だけAPIを叩く
import { useEffect } from 'react'

type Props = {
  profileId: string
}

export function CardViewTracker({ profileId }: Props) {
  useEffect(() => {
    // ページ表示時に1回だけアクセス記録
    const recordView = async () => {
      try {
        await fetch('/api/card-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId }),
        })
      } catch {
        // アクセス記録の失敗はユーザー体験に影響しないため無視
      }
    }
    recordView()
  }, [profileId])

  // UIは何もレンダリングしない
  return null
}
