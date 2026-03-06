'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Footer from '@/components/Footer'

const navItems = [
  { href: '/', label: 'トップ' },
  { href: '/plan', label: '料金' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'お問い合わせ' },
]

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isOverDark, setIsOverDark] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const headerBottom = 56 // h-14 = 56px
      // フッター等の暗い背景セクションとの重なりを検出
      const darkElements = document.querySelectorAll('footer, [data-dark]')
      let overDark = false
      darkElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < headerBottom && rect.bottom > 0) {
          overDark = true
        }
      })
      setIsOverDark(overDark)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
    {/* ロゴ（独立レイヤー: mix-blend-mode: difference で背景色に応じて自動反転） */}
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ mixBlendMode: 'difference' }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
        <Link href="/" className="text-lg font-bold text-white no-underline hover:opacity-80 pointer-events-auto">
          branding.bz
        </Link>
      </div>
    </div>

    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* ロゴの幅分のスペーサー */}
        <div className="text-lg font-bold invisible" aria-hidden="true">branding.bz</div>

        {/* デスクトップナビ */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${
                isOverDark
                  ? 'text-gray-300 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/portal/login" className="ml-3">
            <button
              className={`relative h-8 px-4 rounded-full text-sm font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${isOverDark ? 'text-white' : 'text-gray-900'}`}
              style={{
                background: isOverDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                border: `1px solid ${isOverDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)'}`,
                boxShadow: isOverDark
                  ? '0px 4px 12px 0 rgba(0, 0, 0, 0.3), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.1)'
                  : '0px 4px 12px 0 rgba(12, 74, 110, 0.08), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.3)',
              }}
            >
              <span className="relative z-10">ログイン</span>
            </button>
          </Link>
        </nav>

        {/* モバイルハンバーガー */}
        <button
          className={`md:hidden p-2 transition-colors duration-300 ${isOverDark ? 'text-white' : 'text-gray-900'}`}
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
    </>
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
