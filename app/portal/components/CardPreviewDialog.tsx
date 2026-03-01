'use client'

// 名刺プレビューDialog: スマホフレーム内にiframeで名刺ページを表示
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { downloadQRCode } from '@/lib/qr-download'
import { ExternalLink, QrCode } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string | null
  name: string | null
}

export function CardPreviewDialog({ open, onOpenChange, slug, name }: Props) {
  const [downloading, setDownloading] = useState(false)

  if (!slug) return null

  const cardUrl = `/card/${slug}`

  const handleDownloadQR = async () => {
    setDownloading(true)
    try {
      await downloadQRCode(slug, name || 'member')
    } catch (err) {
      console.error('QRコード生成エラー:', err)
    }
    setDownloading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px] p-0 gap-0 bg-transparent border-0 shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">名刺プレビュー</DialogTitle>

        <div className="flex flex-col items-center">
          {/* スマホフレーム */}
          <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
            {/* ノッチ */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-gray-900 rounded-b-2xl z-10" />

            {/* スクリーン */}
            <div className="relative bg-white rounded-[2rem] overflow-hidden" style={{ width: 375, height: 667 }}>
              <iframe
                src={cardUrl}
                className="w-full h-full border-0"
                title="名刺プレビュー"
              />
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 mt-5 w-full max-w-[375px]">
            <Button
              asChild
              className="flex-1 h-10 gap-2"
            >
              <a href={cardUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
                名刺ページを開く
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadQR}
              disabled={downloading}
              className="flex-1 h-10 gap-2"
            >
              <QrCode size={14} />
              {downloading ? '生成中...' : 'QRダウンロード'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
