// ランダムスラッグ生成ユーティリティ
// プロフィール作成時にURL用の8文字英数小文字スラッグを自動生成

export function generateRandomSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return slug
}
