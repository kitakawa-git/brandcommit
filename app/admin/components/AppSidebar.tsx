'use client'

// shadcn/ui Sidebar ベースの管理画面サイドバー
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  CircleUser,
  LogOut,
  ShieldCheck,
  ChevronsUpDown,
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
  const { user, isSuperAdmin, signOut } = useAuth()

  return (
    <Sidebar>
      {/* ロゴ・タイトル */}
      <SidebarHeader className="px-5 py-6">
        <Link href="/admin" className="no-underline">
          <h1 className="text-lg font-bold m-0" style={{ color: 'hsl(var(--sidebar-primary))' }}>
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

      {/* ユーザーメニュー（フッター固定） */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <CircleUser className="size-5 shrink-0" />
                  <span className="flex-1 truncate text-sm">{user?.email}</span>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
              >
                {isSuperAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/superadmin/companies" className="no-underline">
                        <ShieldCheck className="mr-2 size-4" />
                        スーパー管理画面
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 size-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
