const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  // ステートメントを個別に実行
  const statements = [
    `CREATE TABLE card_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
      event_type text NOT NULL,
      event_data jsonb DEFAULT '{}',
      visitor_id text,
      ip_address text,
      user_agent text,
      created_at timestamptz DEFAULT now()
    )`,
    `CREATE INDEX idx_card_events_company_created ON card_events (company_id, created_at)`,
    `CREATE INDEX idx_card_events_profile_type ON card_events (profile_id, event_type)`,
    `CREATE TABLE brand_page_views (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
      source_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
      page_type text NOT NULL,
      visitor_id text,
      sections_viewed text[] DEFAULT '{}',
      scroll_depth int DEFAULT 0,
      duration_seconds int DEFAULT 0,
      ip_address text,
      user_agent text,
      created_at timestamptz DEFAULT now()
    )`,
    `CREATE INDEX idx_brand_page_views_company_created ON brand_page_views (company_id, created_at)`,
    `CREATE INDEX idx_brand_page_views_company_page ON brand_page_views (company_id, page_type)`,
  ]

  for (const sql of statements) {
    const label = sql.substring(0, 60).replace(/\n/g, ' ')
    const { error } = await supabase.rpc('pg_execute', { query: sql })
    if (error) {
      // rpc不可ならスキップして手動実行案内
      console.log(`⚠️  rpc不可 (${label}...): ${error.message}`)
    } else {
      console.log(`✅ ${label}...`)
    }
  }

  // 検証
  const { error: ceErr } = await supabase.from('card_events').select('id').limit(0)
  const { error: bpvErr } = await supabase.from('brand_page_views').select('id').limit(0)
  console.log('')
  console.log(ceErr ? '❌ card_events: 未作成' : '✅ card_events: 存在確認OK')
  console.log(bpvErr ? '❌ brand_page_views: 未作成' : '✅ brand_page_views: 存在確認OK')
}

run()
