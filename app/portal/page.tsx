'use client'

// ポータルトップ: ブランド要素へのナビゲーションカード
import Link from 'next/link'
import { usePortalAuth } from './components/PortalAuthProvider'
import { portalStyles } from './components/PortalStyles'

const cards = [
  {
    href: '/portal/guidelines',
    icon: '📋',
    title: 'ブランド方針',
    description: 'MVV・スローガン・ブランドストーリー',
  },
  {
    href: '/portal/visuals',
    icon: '🎨',
    title: 'ビジュアルアイデンティティ',
    description: 'カラー・ロゴ・フォント規定',
  },
  {
    href: '/portal/verbal',
    icon: '👤',
    title: 'バーバル',
    description: 'トーン・コミュニケーション・用語ルール',
  },
  {
    href: '/portal/strategy',
    icon: '🎯',
    title: 'ブランド戦略',
    description: 'ターゲット・ペルソナ・ポジショニング・行動指針',
  },
]

export default function PortalTopPage() {
  const { member } = usePortalAuth()

  return (
    <div className={portalStyles.pageContainer}>
      <div className="text-center mb-10">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          ブランドポータル
        </h1>
        {member && (
          <p className="text-sm text-gray-500 m-0">
            ようこそ、{member.display_name} さん
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block bg-white border border-gray-200 rounded-xl p-6 no-underline text-center hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="text-[40px] mb-3">{card.icon}</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {card.title}
            </h3>
            <p className="text-[13px] text-gray-500 m-0 leading-normal">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
