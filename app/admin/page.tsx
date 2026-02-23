// ダッシュボードのルート: 社員一覧にリダイレクト
import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/members')
}
