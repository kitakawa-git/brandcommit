// 企業+管理者アカウント同時作成API
// POST /api/superadmin/create-company
// サービスロールキーを使用してAuth userを作成するため、サーバーサイドで実行
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // 1. リクエストユーザーがスーパー管理者か確認
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // ユーザーのトークンでSupabaseクライアントを作成して認証確認
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 })
    }

    // admin_usersからis_superadmin確認
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('is_superadmin')
      .eq('auth_id', user.id)
      .single()

    if (adminError || !adminUser?.is_superadmin) {
      return NextResponse.json({ error: 'スーパー管理者権限が必要です' }, { status: 403 })
    }

    // 2. リクエストBody取得
    const body = await request.json()
    const {
      companyName,
      slogan,
      mvv,
      brandColorPrimary,
      brandColorSecondary,
      websiteUrl,
      adminEmail,
      adminPassword,
    } = body

    if (!companyName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: '企業名、管理者メールアドレス、パスワードは必須です' },
        { status: 400 }
      )
    }

    // 3. Auth userを作成
    console.log('[CreateCompany] Auth user作成中:', adminEmail)
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // メール確認をスキップ
    })

    if (createUserError) {
      console.error('[CreateCompany] Auth user作成エラー:', createUserError.message)
      return NextResponse.json(
        { error: `アカウント作成エラー: ${createUserError.message}` },
        { status: 400 }
      )
    }

    console.log('[CreateCompany] Auth user作成成功:', authData.user.id)

    // 4. 企業レコードを作成
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyName,
        slogan: slogan || '',
        mvv: mvv || '',
        brand_color_primary: brandColorPrimary || '#1a1a1a',
        brand_color_secondary: brandColorSecondary || '#666666',
        website_url: websiteUrl || '',
      })
      .select()
      .single()

    if (companyError) {
      console.error('[CreateCompany] 企業作成エラー:', companyError.message)
      // Auth userを削除（ロールバック）
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `企業作成エラー: ${companyError.message}` },
        { status: 400 }
      )
    }

    console.log('[CreateCompany] 企業作成成功:', company.id)

    // 5. admin_usersに紐づけ
    const { error: adminInsertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        auth_id: authData.user.id,
        company_id: company.id,
        role: 'owner',
      })

    if (adminInsertError) {
      console.error('[CreateCompany] admin_users紐づけエラー:', adminInsertError.message)
      // ロールバック
      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `管理者紐づけエラー: ${adminInsertError.message}` },
        { status: 400 }
      )
    }

    console.log('[CreateCompany] 完了: company_id =', company.id, 'auth_id =', authData.user.id)

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
      },
      admin: {
        email: adminEmail,
      },
    })
  } catch (err) {
    console.error('[CreateCompany] 予期しないエラー:', err)
    return NextResponse.json(
      { error: `サーバーエラー: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }
}
