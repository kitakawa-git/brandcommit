'use client'

// 管理画面ヘッダー（SidebarTrigger + ログアウトボタン付き）
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
  const { user, isSuperAdmin, signOut } = useAuth()

  return (
    <header className="h-[60px] bg-white border-b border-border flex items-center px-4 gap-2">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />

      {/* スーパー管理者の場合: スーパー管理画面へのリンク */}
      {isSuperAdmin && (
        <Button asChild size="sm" className="bg-[#1e3a5f] hover:bg-[#152d4a] text-xs font-bold">
          <Link href="/superadmin/companies">
            スーパー管理画面へ →
          </Link>
        </Button>
      )}

      <span className="ml-auto text-sm text-muted-foreground">
        {user?.email}
      </span>
      <Button variant="outline" size="sm" onClick={signOut}>
        ログアウト
      </Button>
    </header>
  )
}
