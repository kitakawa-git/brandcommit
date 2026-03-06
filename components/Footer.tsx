import Link from 'next/link'

// フッターリンクデータ
const footerLinks = {
  product: [
    { href: '/', label: 'トップ' },
    { href: '/plan', label: '料金プラン' },
    { href: '/faq', label: 'よくある質問' },
    { href: '/contact', label: 'お問い合わせ' },
  ],
  tools: [
    { href: '/tools/colors', label: 'ブランドカラー定義' },
  ],
  legal: [
    { href: '/portal/terms', label: '利用規約' },
    { href: '/privacy-policy', label: 'プライバシーポリシー' },
    { href: '/tokusho', label: '特定商取引法に基づく表記' },
  ],
  login: [
    { href: '/portal/login', label: 'メンバーログイン' },
    { href: '/admin/login', label: '管理者ログイン' },
  ],
}

/**
 * 共通フッターコンポーネント
 * マーケティングページ・ツールLPなど公開ページで共通使用
 */
export default function Footer() {
  return (
    <footer className="relative z-10 bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        {/* 上部: ロゴ + リンク群 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          {/* ブランド */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold text-white no-underline">
              branding.bz
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              AIで、ブランディングを加速させる
            </p>
          </div>

          {/* プロダクト */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Product</p>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ツール */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Tools</p>
            <ul className="space-y-2.5">
              {footerLinks.tools.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* リーガル */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Legal</p>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ログイン */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Account</p>
            <ul className="space-y-2.5">
              {footerLinks.login.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 下部: コピーライト + 運営情報 */}
        <div className="mt-14 pt-8 border-t border-gray-800/60 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} branding.bz — ID INC.
          </p>
          <p className="text-xs text-gray-600">
            川崎市 | CEO 北川巧
          </p>
        </div>
      </div>
    </footer>
  )
}
