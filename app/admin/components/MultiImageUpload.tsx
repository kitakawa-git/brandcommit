'use client'

// 複数画像アップロードコンポーネント（最大3枚、お知らせ用）
// Previews: 画像プレビューのみ表示
// Trigger: アップロードボタン + hidden input（flex rowの中に配置可能）
import { useState, useRef, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'

type ContextValue = {
  currentUrls: string[]
  onUpdate: (urls: string[]) => void
  maxImages: number
  uploading: boolean
  triggerUpload: () => void
}

const Ctx = createContext<ContextValue | null>(null)

type Props = {
  bucket: string
  folder?: string
  currentUrls: string[]
  onUpdate: (urls: string[]) => void
  maxImages?: number
  children: React.ReactNode
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function MultiImageUpload({ bucket, folder = '', currentUrls, onUpdate, maxImages = 3, children }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('JPG、PNG、WebP形式の画像を選択してください')
      return
    }

    if (currentUrls.length >= maxImages) {
      alert(`画像は最大${maxImages}枚までです`)
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

    onUpdate([...currentUrls, publicUrl])
    setUploading(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Ctx.Provider value={{ currentUrls, onUpdate, maxImages, uploading, triggerUpload: () => fileInputRef.current?.click() }}>
      {children}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
    </Ctx.Provider>
  )
}

/** 画像プレビュー（タイムラインと同じスタイル） */
export function ImagePreviews() {
  const ctx = useContext(Ctx)
  if (!ctx || ctx.currentUrls.length === 0) return null

  return (
    <div className="flex gap-2 flex-wrap">
      {ctx.currentUrls.map((url, i) => (
        <div key={i} className="relative">
          <img
            src={url}
            alt={`画像 ${i + 1}`}
            className="w-20 h-20 object-cover rounded-lg border border-border"
          />
          <button
            type="button"
            onClick={() => ctx.onUpdate(ctx.currentUrls.filter(u => u !== url))}
            className="absolute -top-1.5 -right-1.5 size-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

/** 画像追加ボタン（flex row内に配置可能） */
export function ImageUploadButton() {
  const ctx = useContext(Ctx)
  if (!ctx) return null

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={ctx.triggerUpload}
      disabled={ctx.uploading || ctx.currentUrls.length >= ctx.maxImages}
    >
      <ImagePlus className="size-4 mr-1.5" />
      {ctx.uploading ? 'アップロード中...' : '画像'}
    </Button>
  )
}
