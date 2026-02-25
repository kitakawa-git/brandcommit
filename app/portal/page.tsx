'use client'

// ポータルトップ: ブランド要素へのナビゲーションカード
import Link from 'next/link'
import { usePortalAuth } from './components/PortalAuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, Palette, MessageSquare, Target, type LucideIcon } from 'lucide-react'

const cards: { href: string; icon: LucideIcon; title: string; description: string }[] = [
  {
    href: '/portal/guidelines',
    icon: ClipboardList,
    title: 'ブランド方針',
    description: 'MVV・スローガン・ブランドストーリー',
  },
  {
    href: '/portal/visuals',
    icon: Palette,
    title: 'ビジュアルアイデンティティ',
    description: 'カラー・ロゴ・フォント規定',
  },
  {
    href: '/portal/verbal',
    icon: MessageSquare,
    title: 'バーバル',
    description: 'トーン・コミュニケーション・用語ルール',
  },
  {
    href: '/portal/strategy',
    icon: Target,
    title: 'ブランド戦略',
    description: 'ターゲット・ペルソナ・ポジショニング・行動指針',
  },
]

export default function PortalTopPage() {
  const { member } = usePortalAuth()

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          ブランドポータル
        </h1>
        {member && (
          <p className="text-sm text-muted-foreground m-0">
            ようこそ、{member.display_name} さん
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="no-underline group"
            >
              <Card className="bg-muted/50 border shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all h-full">
                <CardContent className="p-6 text-center">
                  <div className="mb-3 flex justify-center text-blue-600">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground m-0 leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
