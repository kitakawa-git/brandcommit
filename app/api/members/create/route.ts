import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Service Role Key（サーバーサイド専用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, password, display_name, company_id } = await req.json()

    if (!email || !password || !display_name || !company_id) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    // 1. Supabase Auth でユーザー作成
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // メール確認をスキップ
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2. members テーブルにレコード作成
    const { error: memberError } = await supabaseAdmin
      .from('members')
      .insert({
        auth_id: authData.user.id,
        company_id,
        display_name,
        email,
      })

    if (memberError) {
      // Auth ユーザーを削除してロールバック
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, member_id: authData.user.id })
  } catch (err) {
    console.error('[API members/create] エラー:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '不明なエラー' },
      { status: 500 }
    )
  }
}
