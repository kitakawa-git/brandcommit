'use client'

// 管理画面ヘッダー（SidebarTriggerのみ）
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 px-4 bg-background/80 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
    </header>
  )
}
