'use client'

// ポータルレイアウト: ヘッダー + ナビ + コンテンツ + フッター
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PortalAuthProvider, usePortalAuth } from './components/PortalAuthProvider'
import { portalColors } from './components/PortalStyles'

const navLinks = [
  { href: '/portal/guidelines', label: 'ブランド方針' },
  { href: '/portal/visuals', label: 'ビジュアル' },
  { href: '/portal/verbal', label: 'バーバル' },
  { href: '/portal/strategy', label: 'ブランド戦略' },
  { href: '/portal/values', label: '提供価値' },
]

// 認証不要のパス
const publicPaths = ['/portal/login', '/portal/register']

function PortalHeader() {
  const { member, signOut } = usePortalAuth()

  return (
    <header style={{
      backgroundColor: portalColors.headerBg,
      color: portalColors.headerText,
      padding: '0 24px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link href="/portal" style={{
        color: '#fff',
        textDecoration: 'none',
        fontSize: 18,
        fontWeight: 'bold',
      }}>
        brandcommit
      </Link>
      {member && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#d1d5db' }}>
            {member.display_name}
          </span>
          <button
            onClick={signOut}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              color: '#d1d5db',
              border: '1px solid #4b5563',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
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
    <nav style={{
      backgroundColor: portalColors.navBg,
      borderBottom: `1px solid ${portalColors.navBorder}`,
      padding: '0 24px',
      display: 'flex',
      gap: 0,
      overflowX: 'auto',
    }}>
      {navLinks.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: isActive ? 'bold' : 'normal',
              color: isActive ? portalColors.navActiveText : portalColors.navText,
              textDecoration: 'none',
              borderBottom: isActive ? `2px solid ${portalColors.navActiveBorder}` : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}
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
    <footer style={{
      backgroundColor: portalColors.footerBg,
      borderTop: `1px solid ${portalColors.navBorder}`,
      padding: '16px 24px',
      textAlign: 'center',
      fontSize: 12,
      color: portalColors.footerText,
    }}>
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
    }}>
      <PortalHeader />
      <PortalNav />
      <main style={{
        flex: 1,
        backgroundColor: portalColors.bg,
      }}>
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
