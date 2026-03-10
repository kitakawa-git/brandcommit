'use client'

// スーパー管理画面: ニュース新規作成ページ
import NewsForm from '../_components/NewsForm'

export default function NewNewsPage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">
        ニュース新規作成
      </h2>
      <NewsForm />
    </div>
  )
}
