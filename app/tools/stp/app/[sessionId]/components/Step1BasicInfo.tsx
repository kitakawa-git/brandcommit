'use client'

// Step 1: 基本情報フォーム（会社名・業種・商品/サービス・顧客・競合）
import { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronRight } from 'lucide-react'

// 業種リスト
const INDUSTRIES = [
  '製造業',
  '情報通信業',
  '小売・卸売業',
  'サービス業',
  '建設・不動産業',
  '飲食業',
  '医療・福祉',
  '教育・学習支援',
  '金融・保険業',
  '運輸・物流業',
  'その他',
] as const

interface BasicInfo {
  company_name: string
  industry: string
  industry_other?: string
  products: string
  current_customers: string
  competitors: string
}

interface Step1Props {
  basicInfo: BasicInfo
  onNext: (data: BasicInfo) => Promise<boolean>
  onSaveField: (data: BasicInfo) => Promise<void>
}

export function Step1BasicInfo({ basicInfo, onNext, onSaveField }: Step1Props) {
  const [companyName, setCompanyName] = useState(basicInfo.company_name || '')
  const [industry, setIndustry] = useState(basicInfo.industry || '')
  const [industryOther, setIndustryOther] = useState(basicInfo.industry_other || '')
  const [products, setProducts] = useState(basicInfo.products || '')
  const [currentCustomers, setCurrentCustomers] = useState(basicInfo.current_customers || '')
  const [competitors, setCompetitors] = useState(basicInfo.competitors || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // デバウンス用タイマー
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 現在のフォームデータを取得
  const getCurrentData = useCallback((): BasicInfo => ({
    company_name: companyName.trim(),
    industry,
    industry_other: industry === 'その他' ? industryOther.trim() : undefined,
    products: products.trim(),
    current_customers: currentCustomers.trim(),
    competitors: competitors.trim(),
  }), [companyName, industry, industryOther, products, currentCustomers, competitors])

  // 1秒デバウンスのオートセーブ
  const triggerAutoSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onSaveField(getCurrentData())
    }, 1000)
  }, [getCurrentData, onSaveField])

  // フォーム値が変わるたびにオートセーブをトリガー
  useEffect(() => {
    // 初回レンダリングではスキップ
    const hasData = companyName || industry || products || currentCustomers || competitors
    if (hasData) {
      triggerAutoSave()
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, industry, industryOther, products, currentCustomers, competitors])

  // バリデーション
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!companyName.trim()) {
      newErrors.companyName = '企業名・ブランド名を入力してください'
    }

    if (!industry) {
      newErrors.industry = '業種を選択してください'
    }

    if (industry === 'その他' && !industryOther.trim()) {
      newErrors.industryOther = '業種を入力してください'
    }

    if (!products.trim()) {
      newErrors.products = '主な商品・サービスを入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validate()) return

    setSaving(true)
    // デバウンス中のオートセーブをキャンセル
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const data = getCurrentData()
    const success = await onNext(data)
    if (!success) setSaving(false)
  }

  // 必須フィールドが埋まっているかチェック（次へボタンの活性化用）
  const isValid =
    companyName.trim() !== '' &&
    industry !== '' &&
    (industry !== 'その他' || industryOther.trim() !== '') &&
    products.trim() !== ''

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">基本情報</h2>
        <p className="mt-1 text-sm text-gray-500">
          STP分析の対象となる事業の基本情報を入力してください
        </p>
      </div>

      {/* 企業名・ブランド名 */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <label className="text-sm font-bold text-gray-700">企業名・ブランド名</label>
          <span className="text-xs text-red-500">*</span>
        </div>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="例: 株式会社○○ / ブランド名"
          maxLength={100}
          className={errors.companyName ? 'border-red-400' : ''}
        />
        {errors.companyName && (
          <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>
        )}
      </div>

      {/* 業種 */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <label className="text-sm font-bold text-gray-700">業種</label>
          <span className="text-xs text-red-500">*</span>
        </div>
        <Select
          value={industry}
          onValueChange={(val) => {
            setIndustry(val)
            if (val !== 'その他') {
              setIndustryOther('')
            }
          }}
        >
          <SelectTrigger className={errors.industry ? 'border-red-400' : ''}>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="mt-1 text-xs text-red-500">{errors.industry}</p>
        )}

        {/* その他の場合のテキストフィールド */}
        {industry === 'その他' && (
          <div className="mt-3">
            <Input
              value={industryOther}
              onChange={(e) => setIndustryOther(e.target.value)}
              placeholder="業種を入力してください"
              maxLength={50}
              className={errors.industryOther ? 'border-red-400' : ''}
            />
            {errors.industryOther && (
              <p className="mt-1 text-xs text-red-500">{errors.industryOther}</p>
            )}
          </div>
        )}
      </div>

      {/* 主な商品・サービス */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <label className="text-sm font-bold text-gray-700">主な商品・サービス</label>
          <span className="text-xs text-red-500">*</span>
        </div>
        <Textarea
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder="例: Webマーケティング支援サービス、自社開発のCRMツール など"
          rows={3}
          maxLength={500}
          className={errors.products ? 'border-red-400' : ''}
        />
        {errors.products && (
          <p className="mt-1 text-xs text-red-500">{errors.products}</p>
        )}
      </div>

      {/* 現在の主な顧客層 */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <label className="text-sm font-bold text-gray-700">現在の主な顧客層</label>
          <span className="text-xs text-gray-400">（任意）</span>
        </div>
        <Textarea
          value={currentCustomers}
          onChange={(e) => setCurrentCustomers(e.target.value)}
          placeholder="例: 中小企業の経営者・マーケティング担当者（従業員30〜100名規模）"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* 競合企業・サービス */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <label className="text-sm font-bold text-gray-700">競合企業・サービス</label>
          <span className="text-xs text-gray-400">（任意）</span>
        </div>
        <Textarea
          value={competitors}
          onChange={(e) => setCompetitors(e.target.value)}
          placeholder="例: A社（大手向けCRM）、B社（低価格帯のマーケ支援）、C社（コンサルティング型）"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* フッターナビゲーション */}
      <div className="flex items-center justify-between border-t pt-6">
        {/* Step1では「戻る」は無効 */}
        <div />

        <Button
          onClick={handleNext}
          disabled={saving || !isValid}
          className="gap-1"
        >
          {saving ? '保存中...' : '次へ：セグメンテーション'}
          {!saving && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
