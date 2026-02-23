'use client'

// 画像アップロードコンポーネント（Supabase Storage）
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { colors } from './AdminStyles'

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
          style={{
            width: 100,
            height: 100,
            objectFit: 'cover',
            borderRadius: 8,
            marginBottom: 8,
            display: 'block',
            border: `1px solid ${colors.border}`,
          }}
        />
      )}

      {/* ファイル選択 */}
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ fontSize: 14 }}
      />

      {uploading && (
        <p style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
          アップロード中...
        </p>
      )}
    </div>
  )
}
