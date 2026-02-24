'use client'

// 従業員一覧ページ（マルチテナント対応: 自社の従業員のみ表示）
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { colors, commonStyles } from '../components/AdminStyles'
import { downloadQRCode } from '@/lib/qr-download'

type Profile = {
  id: string
  name: string
  position: string
  department: string
  slug: string
  photo_url: string | null
}

export default function MembersPage() {
  const { companyId } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleQRDownload = async (slug: string, name: string, id: string) => {
    setDownloadingId(id)
    try {
      await downloadQRCode(slug, name)
    } catch (err) {
      console.error('QRコード生成エラー:', err)
      alert('QRコードの生成に失敗しました')
    }
    setDownloadingId(null)
  }

  useEffect(() => {
    if (!companyId) return

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, position, department, slug, photo_url')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setMembers(data)
      }
      setLoading(false)
    }
    fetchMembers()
  }, [companyId])

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
          従業員一覧
        </h2>
        <Link href="/admin/members/new" style={commonStyles.button}>
          ＋ 新規追加
        </Link>
      </div>

      {/* テーブル */}
      <div style={commonStyles.card}>
        {loading ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
            読み込み中...
          </p>
        ) : members.length === 0 ? (
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>
            従業員が登録されていません
          </p>
        ) : (
          <table style={commonStyles.table}>
            <thead>
              <tr>
                <th style={commonStyles.th}>名前</th>
                <th style={commonStyles.th}>役職</th>
                <th style={commonStyles.th}>部署</th>
                <th style={commonStyles.th}>スラッグ</th>
                <th style={{ ...commonStyles.th, textAlign: 'center' as const }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td style={commonStyles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* サムネイル */}
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: colors.primary,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}>
                          {member.name?.charAt(0)}
                        </div>
                      )}
                      <span style={{ fontWeight: '500' }}>{member.name}</span>
                    </div>
                  </td>
                  <td style={commonStyles.td}>{member.position || '-'}</td>
                  <td style={commonStyles.td}>{member.department || '-'}</td>
                  <td style={commonStyles.td}>
                    <code style={{
                      backgroundColor: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 13,
                    }}>
                      {member.slug}
                    </code>
                  </td>
                  <td style={{ ...commonStyles.td, textAlign: 'center' as const }}>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <Link
                        href={`/admin/members/${member.id}/edit`}
                        style={{
                          color: colors.primary,
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: '500',
                        }}
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleQRDownload(member.slug, member.name, member.id)}
                        disabled={downloadingId === member.id}
                        style={{
                          color: colors.primary,
                          background: 'none',
                          border: 'none',
                          fontSize: 14,
                          fontWeight: '500',
                          cursor: downloadingId === member.id ? 'default' : 'pointer',
                          opacity: downloadingId === member.id ? 0.5 : 1,
                          padding: 0,
                        }}
                      >
                        {downloadingId === member.id ? '生成中...' : 'QR'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
