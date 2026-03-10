-- companies テーブルにターゲットセグメント（構造化データ）を追加
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS target_segments JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN companies.target_segments IS 'ターゲットセグメント構造化データ: [{name, description}]';
