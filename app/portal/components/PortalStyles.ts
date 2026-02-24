// ポータル専用スタイル定数（閲覧体験重視）

export const portalColors = {
  bg: '#ffffff',
  headerBg: '#1f2937',
  headerText: '#ffffff',
  navBg: '#f9fafb',
  navBorder: '#e5e7eb',
  navText: '#374151',
  navActiveText: '#2563eb',
  navActiveBorder: '#2563eb',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  primary: '#2563eb',
  cardBg: '#ffffff',
  cardBorder: '#e5e7eb',
  sectionBg: '#f9fafb',
  success: '#16a34a',
  danger: '#dc2626',
  footerBg: '#f9fafb',
  footerText: '#9ca3af',
} as const

export const portalStyles = {
  // ページコンテナ
  pageContainer: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '32px 24px',
  } as React.CSSProperties,

  // ページタイトル
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: portalColors.textPrimary,
    margin: '0 0 8px',
  } as React.CSSProperties,

  // ページ説明
  pageDescription: {
    fontSize: 14,
    color: portalColors.textSecondary,
    margin: '0 0 32px',
    lineHeight: 1.6,
  } as React.CSSProperties,

  // セクション
  section: {
    marginBottom: 32,
  } as React.CSSProperties,

  // セクションタイトル
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: portalColors.textPrimary,
    margin: '0 0 16px',
    paddingBottom: 8,
    borderBottom: `2px solid ${portalColors.border}`,
  } as React.CSSProperties,

  // カード
  card: {
    backgroundColor: portalColors.cardBg,
    border: `1px solid ${portalColors.cardBorder}`,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  } as React.CSSProperties,

  // ラベル
  label: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: portalColors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  } as React.CSSProperties,

  // 値テキスト
  value: {
    fontSize: 16,
    color: portalColors.textPrimary,
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap' as const,
  } as React.CSSProperties,

  // 空状態
  empty: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: portalColors.textMuted,
    fontSize: 15,
  } as React.CSSProperties,

  // タグ
  tag: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: portalColors.sectionBg,
    border: `1px solid ${portalColors.border}`,
    borderRadius: 20,
    fontSize: 13,
    color: portalColors.textPrimary,
    marginRight: 8,
    marginBottom: 8,
  } as React.CSSProperties,

  // テーブル
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  } as React.CSSProperties,

  th: {
    textAlign: 'left' as const,
    padding: '12px 16px',
    backgroundColor: portalColors.sectionBg,
    color: portalColors.textSecondary,
    fontWeight: '600' as const,
    borderBottom: `1px solid ${portalColors.border}`,
    fontSize: 13,
  } as React.CSSProperties,

  td: {
    padding: '12px 16px',
    borderBottom: `1px solid ${portalColors.border}`,
    color: portalColors.textPrimary,
  } as React.CSSProperties,
}
