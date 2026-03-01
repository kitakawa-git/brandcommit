'use client'

// ポータル用サイドバー（floating + 明るい配色）
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePortalAuth } from './PortalAuthProvider'
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
  FileText,
  Compass,
  Palette,
  MessageSquare,
  Trophy,
  Target,
  LayoutDashboard,
  CircleUser,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

// ブランド掲示グループ
const brandItems: NavItem[] = [
  { href: '/portal/guidelines', label: 'ブランド方針', icon: FileText },
  { href: '/portal/strategy', label: 'ブランド戦略', icon: Compass },
  { href: '/portal/visuals', label: 'ビジュアル', icon: Palette },
  { href: '/portal/verbal', label: 'バーバル', icon: MessageSquare },
]

// 浸透グループ
const engagementItems: NavItem[] = [
  { href: '/portal', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/portal/timeline', label: 'タイムライン', icon: Trophy },
  { href: '/portal/kpi', label: '目標・KPI', icon: Target },
]

// マイページグループ
const myPageItems: NavItem[] = [
  { href: '/portal/profile', label: 'マイプロフィール', icon: CircleUser },
  { href: '/portal/card-preview', label: '名刺プレビュー', icon: CreditCard },
]

function NavGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={item.href === '/portal' ? pathname === '/portal' : pathname.startsWith(item.href)}>
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
  )
}

export function PortalSidebar() {
  const pathname = usePathname()
  const { companyName, companyLogoUrl, slogan } = usePortalAuth()

  const brandInitial = companyName?.slice(0, 1) || 'B'

  return (
    <Sidebar variant="floating">
      {/* ブランド情報ヘッダー（サンプル準拠: SidebarMenuButton size="lg"） */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/portal">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                  {companyLogoUrl ? (
                    <img src={companyLogoUrl} alt={companyName || ''} className="size-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold">{brandInitial}</span>
                  )}
                </div>
                <div className={`flex flex-col leading-none ${slogan ? 'gap-0.5' : 'justify-center'}`}>
                  <span className="font-semibold">{companyName || 'brandcommit'}</span>
                  {slogan && <span className="text-xs text-sidebar-foreground/70">{slogan}</span>}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* 浸透（ラベルなし） */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {engagementItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={item.href === '/portal' ? pathname === '/portal' : pathname.startsWith(item.href)}>
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
        <NavGroup label="ブランド掲示" items={brandItems} pathname={pathname} />
        <NavGroup label="マイページ" items={myPageItems} pathname={pathname} />
      </SidebarContent>
    </Sidebar>
  )
}
