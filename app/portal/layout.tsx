'use client'

// ポータルレイアウト: サイドバー + コンテンツ
import { usePathname } from 'next/navigation'
import { PortalAuthProvider } from './components/PortalAuthProvider'
import { PortalSidebar } from './components/PortalSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

// 認証不要のパス
const publicPaths = ['/portal/login', '/portal/register']

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  // 公開パス（ログイン・登録）ではサイドバーなし
  if (isPublic) {
    return <>{children}</>
  }

  return (
    <div data-portal="">
      <SidebarProvider>
        <PortalSidebar />
        <SidebarInset>
          <header className="h-[60px] bg-white border-b border-border flex items-center px-4 gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
          </header>
          <main className="flex-1 bg-white">
            {children}
          </main>
          <footer className="px-6 py-4 text-center">
            <Separator className="mb-4" />
            <p className="text-xs text-muted-foreground m-0">
              Powered by brandcommit
            </p>
          </footer>
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
