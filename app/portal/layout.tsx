'use client'

// ポータルレイアウト: floating サイドバー + コンテンツ
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
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
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
