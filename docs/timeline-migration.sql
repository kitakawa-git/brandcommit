-- Good Job タイムライン機能用 DBマイグレーション
-- Supabase SQLエディターで実行してください

-- ============================================
-- 1. テーブル作成
-- ============================================

-- timeline_posts: タイムライン投稿
CREATE TABLE IF NOT EXISTS timeline_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- timeline_likes: いいね
CREATE TABLE IF NOT EXISTS timeline_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- timeline_comments: コメント
CREATE TABLE IF NOT EXISTS timeline_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_timeline_posts_company_id ON timeline_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_created_at ON timeline_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_likes_post_id ON timeline_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_timeline_likes_user_id ON timeline_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_comments_post_id ON timeline_comments(post_id);

-- ============================================
-- 2. RLS有効化
-- ============================================

ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLSポリシー: timeline_posts
-- ============================================

-- SELECT: 同一company_idのメンバーのみ
CREATE POLICY "timeline_posts_select" ON timeline_posts
  FOR SELECT USING (
    company_id IN (
      SELECT m.company_id FROM members m WHERE m.auth_id = auth.uid() AND m.is_active = true
    )
  );

-- INSERT: 全メンバー（自分のuser_idのみ）
CREATE POLICY "timeline_posts_insert" ON timeline_posts
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND company_id IN (
      SELECT m.company_id FROM members m WHERE m.auth_id = auth.uid() AND m.is_active = true
    )
  );

-- UPDATE: 投稿者本人のみ
CREATE POLICY "timeline_posts_update" ON timeline_posts
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: 投稿者本人 + 管理者
CREATE POLICY "timeline_posts_delete" ON timeline_posts
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM admin_users au WHERE au.auth_id = auth.uid() AND au.company_id = timeline_posts.company_id
    )
  );

-- ============================================
-- 4. RLSポリシー: timeline_likes
-- ============================================

-- SELECT: 同一company_idのメンバーのみ
CREATE POLICY "timeline_likes_select" ON timeline_likes
  FOR SELECT USING (
    company_id IN (
      SELECT m.company_id FROM members m WHERE m.auth_id = auth.uid() AND m.is_active = true
    )
  );

-- INSERT: 本人のみ
CREATE POLICY "timeline_likes_insert" ON timeline_likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND company_id IN (
      SELECT m.company_id FROM members m WHERE m.auth_id = auth.uid() AND m.is_active = true
    )
  );

-- DELETE: 本人のみ
CREATE POLICY "timeline_likes_delete" ON timeline_likes
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 5. RLSポリシー: timeline_comments
-- ============================================

-- SELECT: 同一company_idのメンバーのみ
CREATE POLICY "timeline_comments_select" ON timeline_comments
  FOR SELECT USING (
    company_id IN (
      SELECT m.company_id FROM members m WHERE m.auth_id = auth.uid() AND m.is_active = true
    )
  );

-- INSERT: 全メンバー（自分のuser_idのみ）
CREATE POLICY "timeline_comments_insert" ON timeline_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND company_id IN (
      SELECT m.company_id FROM members m WHERE m.auth_id = auth.uid() AND m.is_active = true
    )
  );

-- DELETE: コメント投稿者本人 + 管理者
CREATE POLICY "timeline_comments_delete" ON timeline_comments
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM admin_users au WHERE au.auth_id = auth.uid() AND au.company_id = timeline_comments.company_id
    )
  );

-- ============================================
-- 6. Storageバケット作成
-- ============================================

-- timeline-images バケット（公開）
INSERT INTO storage.buckets (id, name, public)
VALUES ('timeline-images', 'timeline-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: SELECT（公開バケットなので全員閲覧可能）
CREATE POLICY "timeline_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'timeline-images');

-- Storage RLS: INSERT（認証済みユーザー）
CREATE POLICY "timeline_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'timeline-images'
    AND auth.uid() IS NOT NULL
  );

-- Storage RLS: DELETE（認証済みユーザー）
CREATE POLICY "timeline_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'timeline-images'
    AND auth.uid() IS NOT NULL
  );
