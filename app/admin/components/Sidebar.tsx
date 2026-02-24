'use client'

// サイドバーナビゲーション
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { colors, layout } from './AdminStyles'

const navItems = [
  { href: '/admin/members', label: '社員一覧', icon: '👤' },
  { href: '/admin/company', label: '企業情報', icon: '🏢' },
  { href: '/admin/analytics', label: 'アクセス解析', icon: '📊' },
  { href: '/admin/card-template', label: '名刺テンプレート', icon: '🖨️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: layout.sidebarWidth,
      backgroundColor: colors.sidebarBg,
      minHeight: '100vh',
      padding: '24px 0',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      {/* ロゴ・タイトル */}
      <div style={{ padding: '0 20px', marginBottom: 32 }}>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: 18,
            margin: 0,
            fontWeight: 'bold',
          }}>
            brandcommit
          </h1>
        </Link>
        <p style={{
          color: colors.sidebarText,
          fontSize: 12,
          margin: '4px 0 0',
        }}>
          管理画面
        </p>
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
                color: isActive ? colors.sidebarActiveText : colors.sidebarText,
                backgroundColor: isActive ? colors.sidebarActiveBg : 'transparent',
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
    </aside>
  )
}
