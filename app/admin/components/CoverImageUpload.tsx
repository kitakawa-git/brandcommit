'use client'

// カバー写真アップロードコンポーネント（横長画像対応）
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Upload, Trash2 } from 'lucide-react'

type Props = {
  bucket: string
  folder?: string
  currentUrl?: string
  onUpload: (url: string) => void
  onRemove: () => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function CoverImageUpload({ bucket, folder = '', currentUrl, onUpload, onRemove }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('JPG、PNG、WebP形式の画像を選択してください')
      return
    }

    setUploading(true)

    const ext = file.name.split('.').pop()
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true })

    if (error) {
      alert('アップロードに失敗しました: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    setPreview(publicUrl)
    onUpload(publicUrl)
    setUploading(false)

    // input をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    setPreview('')
    onRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      {/* プレビュー（横長） */}
      {preview ? (
        <div className="relative mb-3">
          <img
            src={preview}
            alt="カバー写真プレビュー"
            className="w-full h-[120px] object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 size-8"
            onClick={handleRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          className="w-full h-[120px] rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors mb-3"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-6 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground m-0">クリックして画像を選択</p>
        </div>
      )}

      {/* ファイル選択 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm"
      />

      <p className="text-xs text-muted-foreground mt-1.5 m-0">
        推奨サイズ: 1200×400px（横長）/ JPG・PNG・WebP / 最大5MB
      </p>

      {uploading && (
        <p className="text-xs text-muted-foreground mt-1">
          アップロード中...
        </p>
      )}
    </div>
  )
}
