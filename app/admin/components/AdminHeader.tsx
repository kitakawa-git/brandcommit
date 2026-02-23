'use client'

// 管理画面ヘッダー（ログアウトボタン付き）
import { useAuth } from './AuthProvider'
import { colors, layout } from './AdminStyles'

export function AdminHeader() {
  const { user, signOut } = useAuth()

  return (
    <header style={{
      height: layout.headerHeight,
      backgroundColor: colors.headerBg,
      borderBottom: `1px solid ${colors.headerBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
    }}>
      <span style={{
        fontSize: 14,
        color: colors.textSecondary,
        marginRight: 16,
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
