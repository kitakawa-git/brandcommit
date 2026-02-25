'use client'

// ポータル用サイドバー（floating + 明るい配色）
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePortalAuth } from './PortalAuthProvider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FileText,
  Compass,
  Palette,
  MessageSquare,
  CircleUser,
  LogOut,
  ChevronsUpDown,
  type LucideIcon,
} from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: '/portal/guidelines', label: 'ブランド方針', icon: FileText },
  { href: '/portal/strategy', label: 'ブランド戦略', icon: Compass },
  { href: '/portal/visuals', label: 'ビジュアル', icon: Palette },
  { href: '/portal/verbal', label: 'バーバル', icon: MessageSquare },
]

export function PortalSidebar() {
  const pathname = usePathname()
  const { member, companyName, companyLogoUrl, profileName, profilePhotoUrl, signOut } = usePortalAuth()

  const brandInitial = companyName?.slice(0, 1) || 'B'

  const profileInitial = profileName
    ? profileName.slice(0, 1)
    : member?.display_name?.slice(0, 1) || '?'

  const displayName = profileName || member?.display_name || member?.email

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
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">{companyName || 'brandcommit'}</span>
                  <span className="text-xs">ブランドポータル</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
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
      </SidebarContent>

      {/* ユーザーメニュー */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="size-8 shrink-0">
                    {profilePhotoUrl && <AvatarImage src={profilePhotoUrl} alt={displayName || ''} />}
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                      {profilePhotoUrl ? profileInitial : <CircleUser className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 leading-tight">
                    <span className="block truncate text-sm font-semibold">
                      {displayName}
                    </span>
                    {profileName && member?.email && (
                      <span className="block truncate text-xs opacity-70">
                        {member.email}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
              >
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
