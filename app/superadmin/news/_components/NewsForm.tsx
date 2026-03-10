'use client'

// ニュース作成・編集フォーム
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { NewsItem, NewsCategory } from '@/lib/types/news'
import { NEWS_CATEGORY_LABELS } from '@/lib/types/news'

interface NewsFormProps {
  initialData?: NewsItem
}

export default function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || `news-${Date.now()}`)
  const [category, setCategory] = useState<NewsCategory>(initialData?.category || 'announcement')
  const [summary, setSummary] = useState(initialData?.summary || '')
  const [body, setBody] = useState(initialData?.body || '')
  const [publishedAt, setPublishedAt] = useState(() => {
    if (initialData?.published_at) {
      // ISO → datetime-local 形式に変換
      const d = new Date(initialData.published_at)
      const offset = d.getTimezoneOffset()
      const local = new Date(d.getTime() - offset * 60000)
      return local.toISOString().slice(0, 16)
    }
    return ''
  })
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('タイトルを入力してください')
      return
    }
    if (!slug.trim()) {
      toast.error('スラッグを入力してください')
      return
    }

    setSaving(true)

    try {
      const record = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        summary: summary.trim() || null,
        body: body.trim() || null,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && initialData) {
        const { error } = await supabase
          .from('news')
          .update(record)
          .eq('id', initialData.id)

        if (error) throw error
        toast.success('ニュースを更新しました')
      } else {
        const { error } = await supabase
          .from('news')
          .insert({ ...record, created_at: new Date().toISOString() })

        if (error) throw error
        toast.success('ニュースを作成しました')
      }

      router.push('/superadmin/news')
    } catch (err) {
      console.error('[NewsForm] 保存エラー:', err)
      toast.error(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-muted/50 border shadow-none">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div>
            <Label className="mb-1.5 font-bold">タイトル <span className="text-red-500">*</span></Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ニュースのタイトルを入力"
              required
              className="h-10"
            />
          </div>

          {/* スラッグ */}
          <div>
            <Label className="mb-1.5 font-bold">スラッグ <span className="text-red-500">*</span></Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="news-example"
              required
              className="h-10 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URLに使用されます: /news/{slug}
            </p>
          </div>

          {/* カテゴリ */}
          <div>
            <Label className="mb-1.5 font-bold">カテゴリ</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as NewsCategory)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(NEWS_CATEGORY_LABELS) as [NewsCategory, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* サマリー */}
          <div>
            <Label className="mb-1.5 font-bold">サマリー</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="一覧ページに表示される短い説明文"
              rows={2}
              className="text-sm"
            />
          </div>

          {/* 本文 */}
          <div>
            <Label className="mb-1.5 font-bold">本文</Label>
            <AutoResizeTextarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="ニュースの本文を入力"
              style={{ minHeight: '200px' }}
            />
          </div>

          {/* 公開日時 */}
          <div>
            <Label className="mb-1.5 font-bold">公開日時</Label>
            <Input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="h-10 w-auto"
            />
          </div>

          {/* 公開状態 */}
          <div className="flex items-center gap-3">
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label className="font-bold cursor-pointer" onClick={() => setIsPublished(!isPublished)}>
              {isPublished ? '公開中' : '下書き'}
            </Label>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#1e3a5f] hover:bg-[#2a4a6f]"
            >
              {saving ? '保存中...' : isEditing ? '更新する' : '作成する'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/superadmin/news')}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
