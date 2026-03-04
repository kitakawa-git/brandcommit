'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'トップ' },
  { href: '/plan', label: '料金' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'お問い合わせ' },
]

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* ロゴ */}
        <Link href="/" className="text-lg font-bold text-gray-900 no-underline hover:opacity-80">
          brandconnect
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/portal/login" className="ml-3">
            <Button variant="outline" size="sm">ログイン</Button>
          </Link>
        </nav>

        {/* モバイルハンバーガー */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/portal/login"
            className="block px-3 py-2.5 text-sm font-medium text-gray-900"
            onClick={() => setMenuOpen(false)}
          >
            ログイン
          </Link>
          <Link
            href="/admin/login"
            className="block px-3 py-2.5 text-xs text-gray-400"
            onClick={() => setMenuOpen(false)}
          >
            管理者ログイン
          </Link>
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-white">
      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          {/* ブランド */}
          <div>
            <p className="text-lg font-bold mb-3">brandconnect</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              ブランドを「作る → 根づかせる → 届ける」まで<br />
              一貫支援するSaaS
            </p>
          </div>

          {/* サービス */}
          <div>
            <p className="text-sm font-bold mb-4">サービス</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/plan" className="hover:text-white transition-colors">料金プラン</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">よくある質問</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
              <li><Link href="/tools/colors" className="hover:text-white transition-colors">ブランドカラー定義ツール</Link></li>
            </ul>
          </div>

          {/* リーガル */}
          <div>
            <p className="text-sm font-bold mb-4">その他</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/portal/terms" className="hover:text-white transition-colors">利用規約</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/portal/login" className="hover:text-white transition-colors">メンバーログイン</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors">管理者ログイン</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} brandconnect — ID INC.</p>
          <p className="text-xs text-gray-500">川崎市 | CEO 北川巧</p>
        </div>
      </div>
    </footer>
  )
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
