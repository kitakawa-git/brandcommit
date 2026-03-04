import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'branding.bz — AIで、ブランディングを加速させる。',
  description: '社員が体現し、顧客に届く。ブランドの構築・浸透・発信をひとつのプラットフォームで。branding.bz はブランディング会社の現場から生まれたSaaSです。',
  openGraph: {
    title: 'branding.bz — AIで、ブランディングを加速させる。',
    description: '社員が体現し、顧客に届く。ブランドの構築・浸透・発信をひとつのプラットフォームで。',
    siteName: 'branding.bz',
  },
}

/* ─── セクション1: Hero ─── */
function HeroSection() {
  return (
    <section className="bg-white px-6 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
          AIで、ブランディングを加速させる。
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 leading-relaxed">
          社員が体現し、顧客に届く。<br className="hidden sm:block" />
          ブランドの構築・浸透・発信を、ひとつのプラットフォームで。
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

/* ─── セクション2: 課題提起（新規） ─── */
function ProblemSection() {
  return (
    <section className="bg-gray-50 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">
          ブランド、作って終わりに<br className="sm:hidden" />なっていませんか？
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed mb-10">
          <p>立派な理念を掲げても、社員に伝わっていない。</p>
          <p>ロゴやカラーを刷新しても、日々の行動は変わらない。</p>
          <p>名刺交換しても、会社の&ldquo;らしさ&rdquo;は何も伝わらない。</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-900 font-semibold leading-relaxed">
            ブランディングの本当の課題は、「作ること」ではなく「届けること」。
          </p>
          <p className="text-gray-900 font-semibold leading-relaxed">
            branding.bz は、この課題を解決するために生まれました。
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── セクション3: 3レイヤー ─── */
const layers = [
  {
    num: '01',
    label: '構築',
    title: '"らしさ"を、言葉にする。',
    description:
      '理念、コピー、カラー、ペルソナ——ブランドの核をAIがガイド。専門知識がなくても、対話するだけでプロ品質のアイデンティティが生まれます。',
    icon: '/marketing/icons/auto-awesome.svg',
  },
  {
    num: '02',
    label: '浸透',
    title: '"らしさ"を、日常にする。',
    description:
      'ブランド掲示・Good Job タイムライン・KPI・学習をひとつの場所に。日々の業務のなかで、ブランドが自然と「わがこと」になっていきます。',
    icon: '/marketing/icons/explore.svg',
  },
  {
    num: '03',
    label: '発信',
    title: '"らしさ"を、一人ひとりが届ける。',
    description:
      'QRコードを読み取ると、社員のプロフィールと企業のブランドストーリーが一体になったページが開く。名刺交換の瞬間が、ブランド体験に変わります。',
    icon: '/marketing/icons/accessibility_new.svg',
  },
]

function LayersSection() {
  return (
    <section className="bg-white px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-12">
          構築・浸透・発信。<br className="sm:hidden" />
          3つのステップで、ブランドが走り出す。
        </h2>

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

/* ─── セクション4: About ─── */
function AboutSection() {
  return (
    <section className="bg-gray-50 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-10">
          ブランディング会社の現場から生まれたSaaS
        </h2>

        <div className="mx-auto max-w-3xl space-y-4 text-gray-600 leading-relaxed text-center">
          <p>
            ID INC. は15年以上、企業のブランディングを手がけてきました。<br className="hidden md:block" />
            その現場で何度も直面したのは、「作ったブランドが浸透しない」という壁。<br className="hidden md:block" />
            どれだけ良い理念を作っても、社員の行動が変わらなければ意味がない。
          </p>
          <p className="text-gray-900 font-semibold">
            この「浸透の壁」をAIとテクノロジーで壊すために、branding.bz は生まれました。<br className="hidden md:block" />
            構築から浸透、発信まで——ブランドの旅路をまるごと支える、はじめてのプラットフォームです。
          </p>
        </div>

        {/* YouTube 埋め込み */}
        <div className="aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg mt-12">
          <iframe
            src="https://www.youtube.com/embed/AhhiwxAgnxM"
            title="branding.bz 紹介動画"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}

/* ─── セクション5: 機能紹介 ─── */
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
    description: 'ブランド方針・戦略・ビジュアルID・バーバルIDを全社に掲示。いつでも"らしさ"を参照できます。',
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
    <section className="bg-white px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          ブランドを加速させる機能
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

/* ─── セクション6: CTA ─── */
function CTASection() {
  return (
    <section className="bg-gray-50 px-6 py-16 md:py-24 text-center">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          さぁ、&ldquo;らしさ&rdquo;をひろげよう。
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          ブランドは、作った瞬間から走り出す。<br className="hidden sm:block" />
          branding.bz で、その加速を始めませんか。
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
      <ProblemSection />
      <LayersSection />
      <AboutSection />
      <FeaturesSection />
      <CTASection />
    </>
  )
}
