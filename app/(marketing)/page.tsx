import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'brandconnect — ブランドを、つくり、根づかせ、届ける',
  description: '中小企業のブランドを「構築→浸透→発信」まで一貫支援するSaaS。ミニアプリでブランドを作り、社内に根づかせ、スマート名刺で届ける。',
}

/* ─── セクション1: Hero ─── */
function HeroSection() {
  return (
    <section className="bg-white px-4 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
          <Sparkles className="h-4 w-4" />
          Build — Embed — Deliver
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
          ブランドを、つくり、<br className="sm:hidden" />
          根づかせ、届ける。
        </h1>
        <p className="mx-auto mb-4 max-w-2xl text-lg text-gray-600 leading-relaxed">
          中小企業のためのブランディングSaaS。<br className="hidden sm:block" />
          AIでブランドを構築し、社内に浸透させ、スマート名刺で社外に届ける。
        </p>
        <p className="text-blue-600 text-base font-semibold mb-8">
          &ldquo;らしさ&rdquo;をひろげよう
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/contact">
            <Button size="lg" className="h-12 px-8 text-base font-bold">
              無料で始める
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/plan">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
              料金を見る
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── セクション2: 3レイヤー ─── */
const layers = [
  {
    num: '01',
    label: '構築',
    title: 'ミニアプリでブランドを作る',
    description:
      '理念・コピー・カラー・ペルソナをAIがガイド。専門知識がなくても、プロ品質のブランドアイデンティティを短時間で策定できます。',
    icon: '/marketing/icons/auto-awesome.svg',
  },
  {
    num: '02',
    label: '浸透',
    title: 'brandconnect で社内に根づかせる',
    description:
      'ブランド掲示・Good Job タイムライン・KPI管理・学習コンテンツを統合。日々の業務のなかでブランドが自然と「わがこと」になります。',
    icon: '/marketing/icons/explore.svg',
  },
  {
    num: '03',
    label: '発信',
    title: 'スマート名刺で社外に届ける',
    description:
      'QRコードから個人プロフィール＋企業ブランドの簡易ページを表示。ブランドの「らしさ」を一人ひとりが体現する発信ツールです。',
    icon: '/marketing/icons/accessibility_new.svg',
  },
]

function LayersSection() {
  return (
    <section className="bg-gray-50 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          3つのレイヤーで、ブランドを支える
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          作って終わりにしない。構築から浸透・発信まで、ブランドの旅路をまるごとサポートします。
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {layers.map((layer) => (
            <Card key={layer.num} className="overflow-hidden transition-shadow hover:shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {layer.num}
                  </div>
                  <span className="text-sm font-semibold tracking-wide text-gray-700">
                    {layer.label}
                  </span>
                </div>
                <div className="mb-4 flex justify-center">
                  <Image src={layer.icon} alt="" width={56} height={56} className="opacity-70" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{layer.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{layer.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── セクション3: About + YouTube ─── */
function AboutSection() {
  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          brandconnect とは
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          ノーコードでブランド構築から学習・運用・共有まで実現するクラウドサービス。<br className="hidden md:block" />
          3つのレイヤーが連動し、企業のブランド力を日々少しずつ底上げします。
        </p>

        {/* YouTube 埋め込み */}
        <div className="aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <iframe
            src="https://www.youtube.com/embed/AhhiwxAgnxM"
            title="brandconnect紹介動画"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}

/* ─── セクション4: 機能紹介 ─── */
const features = [
  {
    title: 'ダッシュボード',
    description: '行動指針別の投稿数やKPI進捗をリアルタイムで表示。チームのブランド浸透度が一目でわかります。',
    gif: '/marketing/gifs/dashboard.gif',
    icon: '/marketing/icons/splitscreen.svg',
  },
  {
    title: 'Good Job タイムライン',
    description: '行動指針に基づいた行動を、タイムラインで手軽にシェア。互いに称え合う文化を醸成します。',
    gif: '/marketing/gifs/timeline.gif',
    icon: '/marketing/icons/explore.svg',
  },
  {
    title: '個人目標と KPI',
    description: '年度目標に沿ったKPIを設定し、達成状況を管理。優先順位と期限を見える化します。',
    gif: '/marketing/gifs/kpi.gif',
    icon: '/marketing/icons/fact_check.svg',
  },
  {
    title: 'ブランド掲示',
    description: 'ブランド方針・戦略・ビジュアルID・バーバルIDを全社に掲示。いつでも「らしさ」を参照できます。',
    gif: '/marketing/gifs/guidelines.gif',
    icon: '/marketing/icons/folder_special.svg',
  },
  {
    title: 'お知らせ',
    description: '社内イベントやブランド戦略の進捗を全メンバーに配信。情報の一元化で認識を揃えます。',
    gif: '/marketing/gifs/announcements.gif',
    icon: '/marketing/icons/notifications-1.svg',
  },
  {
    title: 'スマート名刺',
    description: 'QRコードからプロフィール＋企業ブランドページを表示。名刺交換の瞬間がブランド体験になります。',
    gif: null,
    icon: '/marketing/icons/accessibility_new.svg',
  },
  {
    title: '効果計測',
    description: '利用率や投稿分類などを計測。ブランド浸透を定量評価し、次のアクションにつなげます。',
    gif: null,
    icon: '/marketing/icons/pie_chart.svg',
  },
  {
    title: 'ブランディングサポート',
    description: 'ブランド構築の専門サポートをオプションで提供。戦略策定からデザイン相談まで対応します。',
    gif: '/marketing/gifs/support.gif',
    icon: '/marketing/icons/design_services.svg',
  },
]

function FeaturesSection() {
  return (
    <section className="bg-gray-50 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          主な機能
        </h2>
        <p className="text-center text-gray-500 mb-12">
          ブランドの浸透に必要なすべてを、ひとつのプラットフォームに。
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className={`overflow-hidden transition-shadow hover:shadow-lg ${
                i === features.length - 1 && features.length % 2 !== 0 ? 'md:col-span-2 md:max-w-[calc(50%-0.75rem)] md:mx-auto' : ''
              }`}
            >
              {feature.gif && (
                <div className="aspect-video bg-gray-100">
                  <Image
                    src={feature.gif}
                    alt={`${feature.title}のデモ`}
                    width={600}
                    height={338}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <CardContent className="p-6 flex items-start gap-4">
                <Image src={feature.icon} alt="" width={32} height={32} className="mt-1 opacity-60 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── セクション5: CTA ─── */
function CTASection() {
  return (
    <section className="bg-white px-4 py-16 md:py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          さぁ、&ldquo;らしさ&rdquo;をひろげよう
        </h2>
        <p className="text-gray-500 mb-6">
          brandconnect で、ブランドを社内に根づかせ、社外に届けましょう。
        </p>

        {/* βテスター募集 */}
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-5 py-2 mb-8">
          <span className="text-blue-700 font-bold text-sm">残り2社限定</span>
          <span className="text-gray-700 text-sm">βテスター企業 募集中！</span>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/contact">
            <Button size="lg" className="h-12 px-8 text-base font-bold">
              お問い合わせ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/plan">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
              料金プランを見る
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          無料で最新バージョンをいち早くお試しいただけます
        </p>
      </div>
    </section>
  )
}

/* ─── メインページ ─── */
export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <LayersSection />
      <AboutSection />
      <FeaturesSection />
      <CTASection />
    </>
  )
}
