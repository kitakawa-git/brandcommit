'use client'

// 管理画面ヘッダー（SidebarTriggerのみ）
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export function AdminHeader() {
  return (
    <header className="h-[60px] bg-white border-b border-border flex items-center px-4 gap-2">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
    </header>
  )
}
