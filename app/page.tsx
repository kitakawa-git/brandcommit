// brandcommit ランディングページ
import Link from 'next/link'
import { ContactRound, Palette, Users, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ContactRound,
    title: 'スマート名刺',
    description: 'QRコード対応のデジタル名刺を簡単作成。印刷用の高解像度QRコードもワンクリックでダウンロード。',
  },
  {
    icon: Palette,
    title: 'ブランド管理',
    description: 'MVV・ブランドカラー・ストーリーを一元管理。名刺ページに自動反映されます。',
  },
  {
    icon: Users,
    title: 'チーム連携',
    description: '全従業員の名刺を統一されたブランドデザインで管理。一括QRコードダウンロードにも対応。',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen font-sans bg-white">
      {/* ヘッダー */}
      <header className="px-6 py-4 flex justify-between items-center max-w-[1080px] mx-auto">
        <span className="text-xl font-bold text-foreground">
          brandcommit
        </span>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-blue-600 font-bold">
            <Link href="/portal/login">ログイン</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground text-xs">
            <Link href="/admin/login">管理者</Link>
          </Button>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="text-center px-6 pt-20 pb-[60px] max-w-[720px] mx-auto">
        <h1 className="text-[40px] font-bold text-foreground mb-4 leading-[1.3]">
          ブランドを、約束にする。
        </h1>
        <p className="text-lg text-muted-foreground mb-10 leading-[1.7]">
          中小企業のためのスマート名刺 × ブランディングSaaS
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="h-12 px-8 text-base font-bold">
            <Link href="/signup">無料で始める</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
            <Link href="/portal/login">ログイン</Link>
          </Button>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="px-6 pt-[60px] pb-20 max-w-[960px] mx-auto">
        <h2 className="text-center text-2xl font-bold text-foreground mb-12">
          主な機能
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="bg-muted/50 border shadow-none">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex justify-center text-blue-600">
                    <Icon size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground m-0 leading-[1.7]">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* フッター */}
      <footer className="px-6 py-4 text-center">
        <Separator className="mb-4" />
        <p className="text-xs text-muted-foreground m-0">
          &copy; brandcommit
        </p>
      </footer>
    </div>
  )
}
