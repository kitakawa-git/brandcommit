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
    description: '全従業員の名刺を統一されたブランドデザインで管理。一括QRコードダウンロードにも対応。',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen font-sans bg-white">
      {/* ヘッダー */}
      <header className="px-6 py-4 flex justify-between items-center max-w-[1080px] mx-auto">
        <span className="text-xl font-bold text-gray-900">
          brandcommit
        </span>
        <Link href="/admin/login" className="text-blue-600 no-underline text-sm font-bold">
          ログイン
        </Link>
      </header>

      {/* ヒーローセクション */}
      <section className="text-center px-6 pt-20 pb-[60px] max-w-[720px] mx-auto">
        <h1 className="text-[40px] font-bold text-gray-900 mb-4 leading-[1.3]">
          ブランドを、約束にする。
        </h1>
        <p className="text-lg text-gray-500 mb-10 leading-[1.7]">
          中小企業のためのスマート名刺 × ブランディングSaaS
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signup"
            className="py-3.5 px-8 bg-blue-600 text-white border-none rounded-lg text-base font-bold no-underline inline-block"
          >
            無料で始める
          </Link>
          <Link
            href="/admin/login"
            className="py-3.5 px-8 bg-transparent text-gray-900 border border-gray-200 rounded-lg text-base no-underline inline-block"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="px-6 pt-[60px] pb-20 max-w-[960px] mx-auto">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">
          主な機能
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 m-0 leading-[1.7]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="p-6 text-center border-t border-gray-200">
        <p className="text-[13px] text-gray-400 m-0">
          &copy; brandcommit
        </p>
      </footer>
    </div>
  )
}
