'use client'

// shadcn/ui Sidebar ベースの管理画面サイドバー
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
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
  type LucideIcon,
} from 'lucide-react'

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

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      {/* ロゴ・タイトル */}
      <SidebarHeader className="px-5 py-6">
        <Link href="/admin" className="no-underline">
          <h1 className="text-lg font-bold text-sidebar-primary-foreground m-0" style={{ color: 'hsl(var(--sidebar-primary))' }}>
            brandcommit
          </h1>
        </Link>
        <p className="text-xs text-sidebar-foreground mt-1 m-0">
          管理画面
        </p>
      </SidebarHeader>

      <SidebarContent>
        {/* メインナビゲーション */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                      <Link href={item.href}>
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ブランド掲示セクション */}
        <SidebarGroup>
          <SidebarGroupLabel>ブランド掲示</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {brandItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                      <Link href={item.href}>
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
