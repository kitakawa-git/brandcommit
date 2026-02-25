'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type VCardProps = {
  name: string
  position?: string
  department?: string
  companyName?: string
  email?: string
  phone?: string
  websiteUrl?: string
  photoUrl?: string
  primaryColor: string
}

function splitJapaneseName(name: string): { family: string; given: string } {
  // スペース区切りがあればそれで分割
  const spaceMatch = name.match(/^(\S+)\s+(\S+)$/)
  if (spaceMatch) {
    return { family: spaceMatch[1], given: spaceMatch[2] }
  }
  // 2文字以上なら最初の文字を姓、残りを名
  if (name.length >= 2) {
    return { family: name.slice(0, name.length > 3 ? 2 : 1), given: name.slice(name.length > 3 ? 2 : 1) }
  }
  return { family: name, given: '' }
}

function escapeVCard(str: string): string {
  return str.replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n')
}

export function VCardButton({
  name,
  position,
  department,
  companyName,
  email,
  phone,
  websiteUrl,
  photoUrl,
  primaryColor,
}: VCardProps) {
  const handleDownload = () => {
    const { family, given } = splitJapaneseName(name)
    const lines: string[] = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVCard(name)}`,
      `N:${escapeVCard(family)};${escapeVCard(given)};;;`,
    ]

    if (companyName || department) {
      const org = [companyName || '', department || ''].filter(Boolean).join(';')
      lines.push(`ORG:${escapeVCard(org)}`)
    }
    if (position) lines.push(`TITLE:${escapeVCard(position)}`)
    if (phone) lines.push(`TEL;TYPE=WORK:${phone}`)
    if (email) lines.push(`EMAIL;TYPE=WORK:${email}`)
    if (websiteUrl) lines.push(`URL:${websiteUrl}`)
    if (photoUrl) lines.push(`PHOTO;VALUE=URI:${photoUrl}`)

    lines.push('END:VCARD')

    const vcfContent = lines.join('\r\n')
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      onClick={handleDownload}
      className="contact-btn"
      style={{
        width: '100%',
        padding: '12px 0',
        backgroundColor: primaryColor,
        borderRadius: 12,
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <UserPlus size={18} />
      アドレス帳に保存
    </Button>
  )
}
