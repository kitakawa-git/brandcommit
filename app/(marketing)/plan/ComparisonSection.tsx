'use client'

import { useState } from 'react'
import { Check, X, ChevronDown, ChevronUp, Sparkles, Users, CreditCard, Shield } from 'lucide-react'

const COMMON_ITEMS = [
  '初期費用 ¥0',
  '月払い（年払い割引は今後検討）',
  'データエクスポート対応',
  'SSL暗号化通信',
  'プランの変更・解約はいつでも可能',
  '名刺カードは追加発注可（実費）',
]

type CellValue = string

interface CompRow {
  feature: string
  free: CellValue
  card: CellValue
  standard: CellValue
  premium: CellValue
}

interface CompSectionData {
  title: string
  icon: 'sparkles' | 'users' | 'creditcard'
  rows: CompRow[]
}

const COMPARISON_DATA: CompSectionData[] = [
  {
    title: '構築（ミニアプリ群）',
    icon: 'sparkles',
    rows: [
      { feature: 'AI生成・チャット', free: '月3回/5ターン', card: '月3回/5ターン', standard: '無制限', premium: '無制限' },
      { feature: '結果の画面上確認', free: '○', card: '○', standard: '○', premium: '○' },
      { feature: 'PDF出力', free: '✗', card: '✗', standard: '○', premium: '○' },
      { feature: '本体への結果反映', free: '✗', card: '✗', standard: '○', premium: '○' },
    ],
  },
  {
    title: '浸透（プラットフォーム）',
    icon: 'users',
    rows: [
      { feature: 'ブランド掲示', free: '✗', card: '閲覧のみ', standard: '編集＋閲覧', premium: '編集＋閲覧' },
      { feature: 'メンバー管理', free: '✗', card: '○', standard: '○', premium: '○' },
      { feature: 'KPI・目標管理', free: '✗', card: '✗', standard: '✗', premium: '○' },
      { feature: 'Good Jobタイムライン', free: '✗', card: '✗', standard: '✗', premium: '○' },
      { feature: 'お知らせ管理', free: '✗', card: '✗', standard: '✗', premium: '○' },
      { feature: 'CIマニュアルPDF', free: '✗', card: '✗', standard: '○', premium: '○' },
      { feature: 'インナーサーベイ', free: '✗', card: '✗', standard: '✗', premium: '無制限' },
      { feature: 'AI設問生成', free: '✗', card: '✗', standard: '✗', premium: '無制限' },
      { feature: '統合ブランドスコア', free: '✗', card: '✗', standard: '✗', premium: '○' },
      { feature: 'スコア推移グラフ', free: '✗', card: '✗', standard: '✗', premium: '○' },
      { feature: '部署別ヒートマップ', free: '✗', card: '✗', standard: '✗', premium: '○' },
      { feature: 'ギャップ分析', free: '✗', card: '✗', standard: '✗', premium: '○' },
      { feature: 'スナップショットエクスポート', free: '✗', card: '✗', standard: '✗', premium: '○' },
    ],
  },
  {
    title: '発信（スマート名刺）',
    icon: 'creditcard',
    rows: [
      { feature: '名刺カード発行', free: '✗', card: '初回無料', standard: '初回無料', premium: '初回無料' },
      { feature: 'プロフィール編集', free: '✗', card: '○', standard: '○', premium: '○' },
      { feature: 'QRコード出力', free: '✗', card: '○', standard: '○', premium: '○' },
      { feature: '閲覧解析', free: '✗', card: '○', standard: '○', premium: '○' },
      { feature: 'アウタースコア', free: '✗', card: '基本指標', standard: '基本指標', premium: 'フル' },
      { feature: 'マイクロフィードバック（印象タグ）', free: '✗', card: '○', standard: '○', premium: '○' },
      { feature: '印象タグマッピング AI提案', free: '✗', card: '✗', standard: '✗', premium: '○' },
      { feature: '名刺ページ公開閲覧', free: '○', card: '○', standard: '○', premium: '○' },
    ],
  },
]

function SectionIcon({ type }: { type: CompSectionData['icon'] }) {
  if (type === 'sparkles') return <Sparkles size={15} />
  if (type === 'users') return <Users size={15} />
  return <CreditCard size={15} />
}

function CellRenderer({ value, isStandard }: { value: CellValue; isStandard?: boolean }) {
  if (value === '○') {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <Check size={12} className="text-green-600" strokeWidth={2.5} />
        </div>
      </div>
    )
  }
  if (value === '✗') {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
          <X size={12} className="text-gray-400" strokeWidth={2.5} />
        </div>
      </div>
    )
  }
  return (
    <p className={`text-center text-xs font-medium leading-tight ${isStandard ? 'text-amber-700' : 'text-gray-600'}`}>
      {value}
    </p>
  )
}

export default function ComparisonSection() {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
  })

  const toggleSection = (idx: number) => {
    setOpenSections(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <section className="bg-gray-50 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* セクション見出し */}
        <h2 className="text-center text-xl md:text-[1.625rem] font-bold text-gray-900 mb-10">
          プラン別機能比較
        </h2>

        {/* 比較表カード */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0px 8px 24px 0 rgba(12, 74, 110, 0.12), inset 0px 0px 4px 2px rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* リフレクション */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: 'linear-gradient(to left top, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)' }} />
          <div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)' }} />

          <div className="relative z-10 divide-y divide-gray-100">
            {COMPARISON_DATA.map((section, idx) => (
              <div key={section.title}>
                {/* セクションアコーディオンヘッダー */}
                <button
                  onClick={() => toggleSection(idx)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <SectionIcon type={section.icon} />
                    {section.title}
                  </div>
                  {openSections[idx]
                    ? <ChevronUp size={15} className="text-gray-400" />
                    : <ChevronDown size={15} className="text-gray-400" />
                  }
                </button>

                {/* テーブル（横スクロール対応） */}
                {openSections[idx] && (
                  <div className="overflow-x-auto border-t border-gray-100">
                    <table className="w-full min-w-[580px] text-sm">
                      <thead>
                        <tr className="bg-gray-50/80">
                          <th className="text-left py-3 px-6 font-medium text-gray-400 text-xs w-44">機能</th>
                          <th className="py-3 px-4 font-semibold text-center text-gray-600 text-xs w-24">Free</th>
                          <th className="py-3 px-4 font-semibold text-center text-gray-600 text-xs w-28">Brand Card</th>
                          <th className="py-3 px-4 font-semibold text-center text-xs w-32 text-amber-700 bg-amber-50/70">Brand Standard</th>
                          <th className="py-3 px-4 font-semibold text-center text-gray-600 text-xs w-32">Brand Premium</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {section.rows.map((row) => (
                          <tr
                            key={row.feature}
                            className="hover:bg-gray-50/60 transition-colors"
                          >
                            <td className="py-3 px-6 text-gray-700 text-sm">{row.feature}</td>
                            <td className="py-3 px-4"><CellRenderer value={row.free} /></td>
                            <td className="py-3 px-4"><CellRenderer value={row.card} /></td>
                            <td className="py-3 px-4 bg-amber-50/40"><CellRenderer value={row.standard} isStandard /></td>
                            <td className="py-3 px-4"><CellRenderer value={row.premium} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* すべてのプランに共通カード */}
      <div
        className="relative rounded-2xl overflow-hidden mt-6"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0px 8px 24px 0 rgba(12, 74, 110, 0.08), inset 0px 0px 4px 2px rgba(255, 255, 255, 0.3)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'linear-gradient(to left top, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)' }} />
        <div className="px-6 py-8 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-gray-500" strokeWidth={1.5} />
            <p className="text-lg font-semibold text-gray-700">すべてのプランに共通</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COMMON_ITEMS.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-green-600" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
