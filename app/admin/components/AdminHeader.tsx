'use client'

// 管理画面ヘッダー（ログアウトボタン付き）
import Link from 'next/link'
import { useAuth } from './AuthProvider'

export function AdminHeader() {
  const { user, isSuperAdmin, signOut } = useAuth()

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4">
      {/* スーパー管理者の場合: スーパー管理画面へのリンク */}
      {isSuperAdmin && (
        <Link
          href="/superadmin/companies"
          className="mr-auto px-3.5 py-1.5 bg-[#1e3a5f] text-white text-[13px] font-bold rounded-md no-underline hover:bg-[#152d4a] transition-colors"
        >
          スーパー管理画面へ →
        </Link>
      )}
      <span className="text-sm text-gray-500">
        {user?.email}
      </span>
      <button
        onClick={signOut}
        className="px-4 py-2 bg-transparent border border-gray-200 rounded-md text-sm cursor-pointer text-gray-900 hover:bg-gray-50 transition-colors"
      >
        ログアウト
      </button>
    </header>
  )
}
