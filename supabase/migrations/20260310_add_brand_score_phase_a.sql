-- Phase A: アウターブランディング計測テーブル

-- 1. card_events: 名刺ページ上のアクションイベント
CREATE TABLE card_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  visitor_id text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_card_events_company_created ON card_events (company_id, created_at);
CREATE INDEX idx_card_events_profile_type ON card_events (profile_id, event_type);

-- 2. brand_page_views: ブランドページ閲覧行動
CREATE TABLE brand_page_views (
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
);

CREATE INDEX idx_brand_page_views_company_created ON brand_page_views (company_id, created_at);
CREATE INDEX idx_brand_page_views_company_page ON brand_page_views (company_id, page_type);
