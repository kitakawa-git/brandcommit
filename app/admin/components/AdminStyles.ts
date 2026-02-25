// 管理画面のスタイル定数（Tailwind CSS版）

// カラー定数（動的参照が必要な箇所用）
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

// Tailwind クラス文字列（className で使用）
export const commonStyles = {
  button: 'inline-block px-5 py-2.5 bg-blue-600 text-white border-none rounded-lg text-sm font-bold cursor-pointer no-underline hover:bg-blue-700 transition-colors',
  buttonOutline: 'inline-block px-5 py-2.5 bg-transparent text-gray-900 border border-gray-200 rounded-lg text-sm cursor-pointer no-underline hover:bg-gray-50 transition-colors',
  dangerButton: 'px-5 py-2.5 bg-red-600 text-white border-none rounded-lg text-sm font-bold cursor-pointer hover:bg-red-700 transition-colors',
  input: 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
  textarea: 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
  label: 'block text-sm font-bold text-gray-900 mb-1.5',
  formGroup: 'mb-5',
  card: 'bg-white rounded-xl border border-gray-200 p-6',
  table: 'w-full border-collapse text-sm',
  th: 'text-left px-4 py-3 bg-gray-100 text-gray-500 font-semibold border-b border-gray-200',
  td: 'px-4 py-3 border-b border-gray-200 text-gray-900',
  error: 'bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4',
  success: 'bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4',
}
