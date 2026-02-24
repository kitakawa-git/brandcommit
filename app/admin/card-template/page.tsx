'use client'

// 名刺テンプレートページ: QRコードの印刷ガイド・一括ダウンロード
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { colors, commonStyles } from '../components/AdminStyles'
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: 0,
        }}>
          名刺テンプレート
        </h2>
        <button
          onClick={handleBulkDownload}
          disabled={bulkDownloading || members.length === 0}
          style={{
            ...commonStyles.button,
            opacity: (bulkDownloading || members.length === 0) ? 0.6 : 1,
          }}
        >
          {bulkDownloading ? '生成中...' : '一括ダウンロード（ZIP）'}
        </button>
      </div>

      {/* 印刷ガイド */}
      <div style={{
        ...commonStyles.card,
        marginBottom: 24,
        backgroundColor: '#f0f9ff',
        borderColor: '#bae6fd',
      }}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 12px',
        }}>
          QRコード印刷ガイド
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: 20,
          fontSize: 14,
          color: colors.textPrimary,
          lineHeight: 2,
        }}>
          <li>推奨サイズ: <strong>20mm x 20mm</strong>（名刺裏面に最適）</li>
          <li>推奨配置: 名刺裏面の右下または中央</li>
          <li>解像度: 1000 x 1000 px（300dpi相当の印刷用高解像度）</li>
          <li>形式: PNG（白背景）</li>
          <li>余白を確保し、QRコードの周囲に最低2mmの白マージンを設けてください</li>
          <li>読み取りテスト: 印刷後、スマートフォンで読み取れることを必ず確認してください</li>
        </ul>
      </div>

      {/* メンバー一覧 */}
      <div style={commonStyles.card}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 16px',
        }}>
          QRコード一覧
        </h3>

        {loading ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
            読み込み中...
          </p>
        ) : members.length === 0 ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
            従業員が登録されていません
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {members.map((member) => (
              <div key={member.id} style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: 20,
                textAlign: 'center' as const,
              }}>
                {member.qrPreview && (
                  <img
                    src={member.qrPreview}
                    alt={`${member.name} QR`}
                    width={120}
                    height={120}
                    style={{ display: 'block', margin: '0 auto 12px' }}
                  />
                )}
                <p style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: colors.textPrimary,
                  margin: '0 0 4px',
                }}>
                  {member.name}
                </p>
                <p style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  margin: '0 0 12px',
                }}>
                  {member.position || '-'} / {member.department || '-'}
                </p>
                <button
                  onClick={() => handleDownload(member.slug, member.name, member.id)}
                  disabled={downloadingId === member.id}
                  style={{
                    ...commonStyles.buttonOutline,
                    width: '100%',
                    fontSize: 13,
                    padding: '8px 12px',
                    opacity: downloadingId === member.id ? 0.5 : 1,
                  }}
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
