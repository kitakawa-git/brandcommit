'use client'

// ポータルレイアウト: ヘッダー + ナビ + コンテンツ + フッター
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PortalAuthProvider, usePortalAuth } from './components/PortalAuthProvider'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/portal/guidelines', label: 'ブランド方針' },
  { href: '/portal/strategy', label: 'ブランド戦略' },
  { href: '/portal/visuals', label: 'ビジュアル' },
  { href: '/portal/verbal', label: 'バーバル' },
]

// 認証不要のパス
const publicPaths = ['/portal/login', '/portal/register']

function PortalHeader() {
  const { member, signOut } = usePortalAuth()

  return (
    <header className="bg-gray-800 text-white px-6 h-14 flex items-center justify-between">
      <Link href="/portal" className="text-white no-underline text-lg font-bold">
        brandcommit
      </Link>
      {member && (
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-gray-300">
            {member.display_name}
          </span>
          <button
            onClick={signOut}
            className="px-3.5 py-1.5 bg-transparent text-gray-300 border border-gray-600 rounded-md text-xs cursor-pointer hover:bg-gray-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      )}
    </header>
  )
}

function PortalNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-50 border-b border-gray-200 px-6 flex overflow-x-auto">
      {navLinks.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-4 py-3 text-[13px] no-underline whitespace-nowrap border-b-2',
              isActive
                ? 'font-bold text-blue-600 border-blue-600'
                : 'font-normal text-gray-700 border-transparent hover:text-blue-600'
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

function PortalFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-400">
      Powered by brandcommit
    </footer>
  )
}

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  // 公開パス（ログイン・登録）ではヘッダー・ナビなし
  if (isPublic) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <PortalHeader />
      <PortalNav />
      <main className="flex-1 bg-white">
        {children}
      </main>
      <PortalFooter />
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
