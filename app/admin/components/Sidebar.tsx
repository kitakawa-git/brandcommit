'use client'

// サイドバーナビゲーション
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  Sparkles,
  BarChart3,
  CreditCard,
  UserPlus,
  FileText,
  Palette,
  MessageSquare,
  Compass,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: '/admin/members', label: 'アカウント一覧', icon: Users },
  { href: '/admin/company', label: 'ブランド基本情報', icon: Sparkles },
  { href: '/admin/analytics', label: 'アクセス解析', icon: BarChart3 },
  { href: '/admin/card-template', label: 'QRコード出力', icon: CreditCard },
  { href: '/admin/members-portal', label: 'アカウント作成', icon: UserPlus },
]

const brandItems: NavItem[] = [
  { href: '/admin/brand/guidelines', label: 'ブランド方針', icon: FileText },
  { href: '/admin/brand/strategy', label: 'ブランド戦略', icon: Compass },
  { href: '/admin/brand/visuals', label: 'ビジュアル', icon: Palette },
  { href: '/admin/brand/verbal', label: 'バーバル', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname.startsWith(item.href)
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 px-5 py-3 no-underline text-sm transition-colors',
          isActive
            ? 'text-white bg-gray-700'
            : 'text-gray-300 hover:bg-gray-700/50'
        )}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    )
  }

  return (
    <aside className="w-[240px] bg-gray-800 min-h-screen py-6 fixed left-0 top-0">
      {/* ロゴ・タイトル */}
      <div className="px-5 mb-8">
        <Link href="/admin" className="no-underline">
          <h1 className="text-white text-lg m-0 font-bold">
            brandcommit
          </h1>
        </Link>
        <p className="text-gray-300 text-xs mt-1 m-0">
          管理画面
        </p>
      </div>

      {/* ナビゲーションリンク */}
      <nav>
        {navItems.map(renderNavLink)}

        {/* 区切り線 + ブランド掲示セクション */}
        <div className="border-t border-gray-700 mx-5 my-3" />
        <p className="px-5 py-1 pb-2 text-[11px] text-gray-300 m-0 tracking-wider">
          ブランド掲示
        </p>
        {brandItems.map(renderNavLink)}
      </nav>
    </aside>
  )
}
