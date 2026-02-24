'use client'

// サイドバーナビゲーション
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { colors, layout } from './AdminStyles'

const navItems = [
  { href: '/admin/members', label: 'アカウント一覧', icon: '👤' },
  { href: '/admin/company', label: '企業情報', icon: '🏢' },
  { href: '/admin/analytics', label: 'アクセス解析', icon: '📊' },
  { href: '/admin/card-template', label: '名刺テンプレート', icon: '🖨️' },
  { href: '/admin/members-portal', label: 'アカウント作成', icon: '🔑' },
]

const brandItems = [
  { href: '/admin/brand/guidelines', label: 'ブランド方針', icon: '📋' },
  { href: '/admin/brand/values', label: '提供価値', icon: '💎' },
  { href: '/admin/brand/visuals', label: 'ビジュアル', icon: '🎨' },
  { href: '/admin/brand/personality', label: 'パーソナリティ', icon: '👤' },
  { href: '/admin/brand/terms', label: '用語ルール', icon: '📝' },
  { href: '/admin/brand/personas', label: '顧客ペルソナ', icon: '🎯' },
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

        {/* 区切り線 + ブランド掲示セクション */}
        <div style={{
          borderTop: `1px solid ${colors.sidebarActiveBg}`,
          margin: '12px 20px',
        }} />
        <p style={{
          padding: '4px 20px 8px',
          fontSize: 11,
          color: colors.sidebarText,
          margin: 0,
          letterSpacing: 1,
        }}>
          ブランド掲示
        </p>
        {brandItems.map((item) => {
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
