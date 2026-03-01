'use client'

// ポータルレイアウト: floating サイドバー + コンテンツ
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PortalAuthProvider, usePortalAuth } from './components/PortalAuthProvider'
import { PortalSidebar } from './components/PortalSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, CircleUser, LogOut } from 'lucide-react'

// 認証不要のパス
const publicPaths = ['/portal/login', '/portal/register']

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, companyId, member, profileName, profilePhotoUrl, signOut } = usePortalAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  useEffect(() => {
    if (!companyId || !user?.id) return
    const fetchUnread = async () => {
      try {
        const [publishedRes, readsRes] = await Promise.all([
          supabase.from('announcements').select('id').eq('company_id', companyId).eq('is_published', true),
          supabase.from('announcement_reads').select('announcement_id').eq('user_id', user.id).eq('company_id', companyId),
        ])
        const published = publishedRes.data || []
        const readIds = new Set((readsRes.data || []).map(r => r.announcement_id))
        setUnreadCount(published.filter(a => !readIds.has(a.id)).length)
      } catch {
        // ヘッダーのバッジなのでエラーは無視
      }
    }
    fetchUnread()
  }, [companyId, user?.id])

  if (isPublic) {
    return <>{children}</>
  }

  return (
    <div data-portal="">
      <SidebarProvider
        style={{ '--sidebar-width': '19rem' } as React.CSSProperties}
      >
        <PortalSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 px-4 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {/* 右端: お知らせベル + アカウントメニュー */}
            <div className="ml-auto flex items-center gap-1">
              <Link
                href="/portal/announcements"
                className="relative inline-flex items-center justify-center size-9 rounded-md hover:bg-muted transition-colors no-underline"
              >
                <Bell size={20} className={pathname.startsWith('/portal/announcements') ? 'text-foreground' : 'text-muted-foreground'} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted transition-colors border-0 bg-transparent cursor-pointer p-0">
                    <Avatar className="size-8">
                      {profilePhotoUrl && <AvatarImage src={profilePhotoUrl} alt={profileName || member?.display_name || ''} />}
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {profilePhotoUrl
                          ? (profileName || member?.display_name || '?').slice(0, 1)
                          : <CircleUser className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground m-0 truncate">
                      {profileName || member?.display_name || member?.email}
                    </p>
                    {(profileName || member?.display_name) && member?.email && (
                      <p className="text-xs text-muted-foreground m-0 truncate">
                        {member.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 size-4" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex flex-1 flex-col">
            <main className="flex-1">{children}</main>
            <footer className="px-6 py-4 text-center">
              <Separator className="mb-4" />
              <p className="text-xs text-muted-foreground m-0">
                Powered by brandcommit
              </p>
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalAuthProvider>
      <PortalLayoutInner>
        {children}
      </PortalLayoutInner>
    </PortalAuthProvider>
  )
}
