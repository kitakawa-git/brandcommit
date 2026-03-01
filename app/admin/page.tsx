// 管理画面ルート: ダッシュボードにリダイレクト
import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/dashboard')
}
