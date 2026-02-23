'use client'

// スーパー管理画面ヘッダー
import { useSuperAdmin } from './SuperAdminProvider'
import { colors, layout } from '../../admin/components/AdminStyles'

export function SuperAdminHeader() {
  const { user, signOut } = useSuperAdmin()

  return (
    <header style={{
      height: layout.headerHeight,
      backgroundColor: colors.headerBg,
      borderBottom: `1px solid ${colors.headerBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      {/* スーパー管理バッジ */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          padding: '4px 10px',
          backgroundColor: '#1e3a5f',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          borderRadius: 4,
        }}>
          スーパー管理
        </span>
      </div>

      {/* ユーザー情報+ログアウト */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
      </div>
    </header>
  )
}
