'use client'

// ポータルトップ: ブランド要素へのナビゲーションカード
import Link from 'next/link'
import { usePortalAuth } from './components/PortalAuthProvider'
import { portalColors, portalStyles } from './components/PortalStyles'

const cards = [
  {
    href: '/portal/guidelines',
    icon: '📋',
    title: 'ブランド方針',
    description: 'MVV・スローガン・ブランドストーリー',
  },
  {
    href: '/portal/visuals',
    icon: '🎨',
    title: 'ビジュアルアイデンティティ',
    description: 'カラー・ロゴ・フォント規定',
  },
  {
    href: '/portal/verbal',
    icon: '👤',
    title: 'バーバル',
    description: 'トーン・コミュニケーション・用語ルール',
  },
  {
    href: '/portal/personas',
    icon: '🎯',
    title: '顧客ペルソナ',
    description: 'ターゲット像・ニーズ・課題',
  },
  {
    href: '/portal/values',
    icon: '💎',
    title: '提供価値',
    description: '主要な強み・差別化要因',
  },
]

export default function PortalTopPage() {
  const { member } = usePortalAuth()

  return (
    <div style={portalStyles.pageContainer}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', color: portalColors.textPrimary, margin: '0 0 8px' }}>
          ブランドポータル
        </h1>
        {member && (
          <p style={{ fontSize: 14, color: portalColors.textSecondary, margin: 0 }}>
            ようこそ、{member.display_name} さん
          </p>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280, 1fr))',
        gap: 16,
      }}>
        {/* レスポンシブ用スタイル */}
        <style>{`
          .portal-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          @media (max-width: 768px) {
            .portal-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 480px) {
            .portal-grid {
              grid-template-columns: 1fr;
            }
          }
          .portal-card {
            transition: box-shadow 0.15s, transform 0.15s;
          }
          .portal-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
          }
        `}</style>
      </div>

      <div className="portal-grid">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="portal-card"
            style={{
              display: 'block',
              backgroundColor: portalColors.cardBg,
              border: `1px solid ${portalColors.cardBorder}`,
              borderRadius: 12,
              padding: 24,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>{card.icon}</div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: portalColors.textPrimary,
              margin: '0 0 8px',
            }}>
              {card.title}
            </h3>
            <p style={{
              fontSize: 13,
              color: portalColors.textSecondary,
              margin: 0,
              lineHeight: 1.5,
            }}>
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
