export type NewsCategory = 'press_release' | 'service_update' | 'media' | 'announcement'

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  press_release: 'プレスリリース',
  service_update: 'サービスアップデート',
  media: 'メディア掲載',
  announcement: 'お知らせ',
}

export interface NewsItem {
  id: string
  title: string
  slug: string
  category: NewsCategory
  body: string | null
  summary: string | null
  published_at: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}
