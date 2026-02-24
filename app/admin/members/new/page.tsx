// アカウント作成は /admin/members-portal に統合済み
import { redirect } from 'next/navigation'

export default function NewMemberPage() {
  redirect('/admin/members-portal')
}
