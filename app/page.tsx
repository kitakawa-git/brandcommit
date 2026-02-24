// brandcommit ランディングページ
import Link from 'next/link'

const features = [
  {
    icon: '📇',
    title: 'スマート名刺',
    description: 'QRコード対応のデジタル名刺を簡単作成。印刷用の高解像度QRコードもワンクリックでダウンロード。',
  },
  {
    icon: '🎨',
    title: 'ブランド管理',
    description: 'MVV・ブランドカラー・ストーリーを一元管理。名刺ページに自動反映されます。',
  },
  {
    icon: '👥',
    title: 'チーム連携',
    description: '全社員の名刺を統一されたブランドデザインで管理。一括QRコードダウンロードにも対応。',
  },
]

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#ffffff',
    }}>
      {/* ヘッダー */}
      <header style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1080,
        margin: '0 auto',
      }}>
        <span style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: '#111827',
        }}>
          brandcommit
        </span>
        <Link href="/admin/login" style={{
          color: '#2563eb',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 'bold',
        }}>
          ログイン
        </Link>
      </header>

      {/* ヒーローセクション */}
      <section style={{
        textAlign: 'center',
        padding: '80px 24px 60px',
        maxWidth: 720,
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: 40,
          fontWeight: 'bold',
          color: '#111827',
          margin: '0 0 16px',
          lineHeight: 1.3,
        }}>
          ブランドを、約束にする。
        </h1>
        <p style={{
          fontSize: 18,
          color: '#6b7280',
          margin: '0 0 40px',
          lineHeight: 1.7,
        }}>
          中小企業のためのスマート名刺 × ブランディングSaaS
        </p>
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link href="/signup" style={{
            padding: '14px 32px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            無料で始める
          </Link>
          <Link href="/admin/login" style={{
            padding: '14px 32px',
            backgroundColor: 'transparent',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 16,
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            ログイン
          </Link>
        </div>
      </section>

      {/* 特徴セクション */}
      <section style={{
        padding: '60px 24px 80px',
        maxWidth: 960,
        margin: '0 auto',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: 24,
          fontWeight: 'bold',
          color: '#111827',
          margin: '0 0 48px',
        }}>
          主な機能
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 32,
        }}>
          {features.map((feature) => (
            <div key={feature.title} style={{
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              padding: 32,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#111827',
                margin: '0 0 12px',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 14,
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.7,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb',
      }}>
        <p style={{
          fontSize: 13,
          color: '#9ca3af',
          margin: 0,
        }}>
          &copy; brandcommit
        </p>
      </footer>
    </div>
  )
}
