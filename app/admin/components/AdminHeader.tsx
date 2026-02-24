'use client'

// 管理画面ヘッダー（ログアウトボタン付き）
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { colors, layout } from './AdminStyles'

export function AdminHeader() {
  const { user, isSuperAdmin, signOut } = useAuth()

  return (
    <header style={{
      height: layout.headerHeight,
      backgroundColor: colors.headerBg,
      borderBottom: `1px solid ${colors.headerBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      gap: 16,
    }}>
      {/* スーパー管理者の場合: スーパー管理画面へのリンク */}
      {isSuperAdmin && (
        <Link
          href="/superadmin/companies"
          style={{
            marginRight: 'auto',
            padding: '6px 14px',
            backgroundColor: '#1e3a5f',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 'bold',
            borderRadius: 6,
            textDecoration: 'none',
          }}
        >
          スーパー管理画面へ →
        </Link>
      )}
      <span style={{
        fontSize: 14,
        color: colors.textSecondary,
      }}>
        {user?.email}
      </span>
      <button
        onClick={signOut}
        style={{
          padding: '8px 16px',
          backgroundColor: 'transparent',
          border: `1px solid ${colors.border}`,
          borderRadius: 6,
          fontSize: 14,
          cursor: 'pointer',
          color: colors.textPrimary,
        }}
      >
        ログアウト
      </button>
    </header>
  )
}
