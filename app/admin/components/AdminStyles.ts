// 管理画面のスタイル定数

export const colors = {
  sidebarBg: '#1f2937',
  sidebarText: '#d1d5db',
  sidebarActiveText: '#ffffff',
  sidebarActiveBg: '#374151',
  headerBg: '#ffffff',
  headerBorder: '#e5e7eb',
  pageBg: '#f9fafb',
  white: '#ffffff',
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  danger: '#dc2626',
  success: '#16a34a',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  inputBorder: '#d1d5db',
} as const

export const layout = {
  sidebarWidth: 240,
  headerHeight: 60,
} as const

// 共通スタイルオブジェクト
export const commonStyles = {
  // ボタン
  button: {
    padding: '10px 20px',
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  buttonOutline: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  dangerButton: {
    padding: '10px 20px',
    backgroundColor: colors.danger,
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  // 入力フィールド
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    minHeight: 100,
  },
  // ラベル
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  // フォームグループ
  formGroup: {
    marginBottom: 20,
  },
  // カード
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    padding: 24,
  },
  // テーブル
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    color: colors.textSecondary,
    fontWeight: '600' as const,
    borderBottom: `1px solid ${colors.border}`,
  },
  td: {
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  },
  // エラーメッセージ
  error: {
    backgroundColor: '#fef2f2',
    color: colors.danger,
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  // 成功メッセージ
  success: {
    backgroundColor: '#f0fdf4',
    color: colors.success,
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
}
