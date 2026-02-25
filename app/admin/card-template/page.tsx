'use client'

// 名刺テンプレートページ: QRコードの印刷ガイド・一括ダウンロード
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { commonStyles } from '../components/AdminStyles'
import { cn } from '@/lib/utils'
import {
  generatePreviewQRDataURL,
  generateHighResQRDataURL,
  downloadDataURLAsFile,
  getQRFilename,
  dataURLToUint8Array,
  downloadQRCode,
} from '@/lib/qr-download'

type MemberWithQR = {
  id: string
  name: string
  slug: string
  position: string
  department: string
  qrPreview: string
}

export default function CardTemplatePage() {
  const { companyId } = useAuth()
  const [members, setMembers] = useState<MemberWithQR[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkDownloading, setBulkDownloading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, position, department, slug')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        // QRプレビューを並行生成
        const withQR = await Promise.all(
          data.map(async (m) => ({
            ...m,
            qrPreview: await generatePreviewQRDataURL(m.slug),
          }))
        )
        setMembers(withQR)
      }
      setLoading(false)
    }
    fetchMembers()
  }, [companyId])

  // 個別ダウンロード
  const handleDownload = async (slug: string, name: string, id: string) => {
    setDownloadingId(id)
    try {
      await downloadQRCode(slug, name)
    } catch (err) {
      console.error('QRコード生成エラー:', err)
    }
    setDownloadingId(null)
  }

  // 一括ダウンロード（ZIP）
  const handleBulkDownload = async () => {
    setBulkDownloading(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // 全メンバーの高解像度QRコードを並行生成
      await Promise.all(
        members.map(async (m) => {
          const dataUrl = await generateHighResQRDataURL(m.slug)
          const uint8 = dataURLToUint8Array(dataUrl)
          zip.file(getQRFilename(m.name), uint8)
        })
      )

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      downloadDataURLAsFile(url, '名刺QR_一括.zip')
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('一括ダウンロードエラー:', err)
      alert('一括ダウンロードに失敗しました')
    }
    setBulkDownloading(false)
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          QRコード出力
        </h2>
        <button
          onClick={handleBulkDownload}
          disabled={bulkDownloading || members.length === 0}
          className={cn(commonStyles.button, (bulkDownloading || members.length === 0) && 'opacity-60')}
        >
          {bulkDownloading ? '生成中...' : '一括ダウンロード（ZIP）'}
        </button>
      </div>

      {/* 印刷ガイド */}
      <div className={cn(commonStyles.card, 'mb-6 bg-sky-50 border-sky-200')}>
        <h3 className="text-[15px] font-bold text-gray-900 mb-3">
          印刷ガイド
        </h3>
        <ul className="m-0 pl-5 text-sm text-gray-900 leading-8">
          <li>推奨サイズ: <strong>20mm x 20mm</strong>（名刺裏面に最適）</li>
          <li>推奨配置: 名刺裏面の右下または中央</li>
          <li>解像度: 1000 x 1000 px（300dpi相当の印刷用高解像度）</li>
          <li>形式: PNG（白背景）</li>
          <li>余白を確保し、QRコードの周囲に最低2mmの白マージンを設けてください</li>
          <li>読み取りテスト: 印刷後、スマートフォンで読み取れることを必ず確認してください</li>
        </ul>
      </div>

      {/* メンバー一覧 */}
      <div className={commonStyles.card}>
        <h3 className="text-[15px] font-bold text-gray-900 mb-4">
          QRコード一覧
        </h3>

        {loading ? (
          <p className="text-gray-500 text-center p-10">
            読み込み中...
          </p>
        ) : members.length === 0 ? (
          <p className="text-gray-500 text-center p-10">
            従業員が登録されていません
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {members.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-xl p-5 text-center">
                {member.qrPreview && (
                  <img
                    src={member.qrPreview}
                    alt={`${member.name} QR`}
                    width={120}
                    height={120}
                    className="block mx-auto mb-3"
                  />
                )}
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {member.name}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {member.position || '-'} / {member.department || '-'}
                </p>
                <button
                  onClick={() => handleDownload(member.slug, member.name, member.id)}
                  disabled={downloadingId === member.id}
                  className={cn(commonStyles.buttonOutline, 'w-full text-[13px] py-2 px-3', downloadingId === member.id && 'opacity-50')}
                >
                  {downloadingId === member.id ? '生成中...' : 'ダウンロード'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
