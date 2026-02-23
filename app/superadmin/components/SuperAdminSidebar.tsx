'use client'

// スーパー管理画面サイドバー（紺色: 通常管理画面と区別）
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { layout } from '../../admin/components/AdminStyles'

// スーパー管理画面専用カラー（紺色ベース）
const superAdminColors = {
  sidebarBg: '#1e3a5f',
  sidebarText: '#94b8d9',
  sidebarActiveText: '#ffffff',
  sidebarActiveBg: '#2a4a6f',
} as const

const navItems = [
  { href: '/superadmin/companies', label: '企業一覧', icon: '🏢' },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: layout.sidebarWidth,
      backgroundColor: superAdminColors.sidebarBg,
      minHeight: '100vh',
      padding: '24px 0',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      {/* ロゴ・タイトル */}
      <div style={{ padding: '0 20px', marginBottom: 32 }}>
        <Link href="/superadmin" style={{ textDecoration: 'none' }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: 18,
            margin: 0,
            fontWeight: 'bold',
          }}>
            brandcommit
          </h1>
        </Link>
        <div style={{
          display: 'inline-block',
          marginTop: 6,
          padding: '2px 8px',
          backgroundColor: '#f59e0b',
          color: '#1e3a5f',
          fontSize: 10,
          fontWeight: 'bold',
          borderRadius: 4,
          letterSpacing: '0.05em',
        }}>
          SUPER ADMIN
        </div>
      </div>

      {/* ナビゲーションリンク */}
      <nav>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '12px 20px',
                color: isActive ? superAdminColors.sidebarActiveText : superAdminColors.sidebarText,
                backgroundColor: isActive ? superAdminColors.sidebarActiveBg : 'transparent',
                textDecoration: 'none',
                fontSize: 14,
                transition: 'background-color 0.15s',
              }}
            >
              {item.icon}　{item.label}
            </Link>
          )
        })}
      </nav>

      {/* 通常管理画面へのリンク */}
      <div style={{ padding: '24px 20px 0', borderTop: '1px solid #2a4a6f', marginTop: 24 }}>
        <Link
          href="/admin"
          style={{
            display: 'block',
            padding: '10px 0',
            color: superAdminColors.sidebarText,
            textDecoration: 'none',
            fontSize: 13,
          }}
        >
          ← 通常管理画面へ
        </Link>
      </div>
    </aside>
  )
}
