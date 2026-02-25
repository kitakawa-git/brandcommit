'use client'

// 画像アップロードコンポーネント（Supabase Storage）
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  bucket: string            // Storageバケット名（'avatars'）
  currentUrl?: string       // 既存画像URL（編集時）
  onUpload: (url: string) => void  // アップロード完了時のコールバック
  folder?: string           // Storage内フォルダ（'profiles' or 'logos'）
}

export function ImageUpload({ bucket, currentUrl, onUpload, folder = '' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    // ユニークなファイル名を生成
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

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    setPreview(publicUrl)
    onUpload(publicUrl)
    setUploading(false)
  }

  return (
    <div>
      {/* プレビュー画像 */}
      {preview && (
        <img
          src={preview}
          alt="プレビュー"
          className="w-[100px] h-[100px] object-cover rounded-lg mb-2 block border border-gray-200"
        />
      )}

      {/* ファイル選択 */}
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm"
      />

      {uploading && (
        <p className="text-xs text-gray-500 mt-1">
          アップロード中...
        </p>
      )}
    </div>
  )
}
