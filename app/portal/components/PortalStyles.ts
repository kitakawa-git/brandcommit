// ポータル専用スタイル定数（Tailwind CSS版）

// カラー定数（チャート等でHEX値が必要な箇所用）
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

// Tailwind クラス文字列（className で使用）
export const portalStyles = {
  pageContainer: 'max-w-[960px] mx-auto px-6 py-8',
  pageTitle: 'text-2xl font-bold text-gray-900 mb-2',
  pageDescription: 'text-sm text-gray-500 mb-8 leading-relaxed',
  section: 'mb-8',
  sectionTitle: 'text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200',
  card: 'bg-white border border-gray-200 rounded-xl p-6 mb-4',
  label: 'text-xs font-bold text-gray-500 uppercase tracking-wide mb-1',
  value: 'text-base text-gray-900 leading-[1.8] whitespace-pre-wrap',
  empty: 'text-center py-[60px] px-5 text-gray-400 text-[15px]',
  tag: 'inline-block px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[13px] text-gray-900 mr-2 mb-2',
  table: 'w-full border-collapse text-sm',
  th: 'text-left px-4 py-3 bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 text-[13px]',
  td: 'px-4 py-3 border-b border-gray-200 text-gray-900',
}
