-- ============================================================
-- CIELO — 配送先・刻印機能 追加マイグレーション
-- 実行前提: 既存テーブル(orders, order_items, products)が存在すること
-- 過去データとの後方互換性を維持（NULL許容 or DEFAULT付き）
-- ============================================================

-- ──────────────────────────────────────────
-- orders テーブル: 配送先氏名・電話番号を追加
-- ──────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_name  TEXT,   -- Stripe shipping_details.name
  ADD COLUMN IF NOT EXISTS shipping_phone TEXT;   -- Stripe customer_details.phone

COMMENT ON COLUMN orders.shipping_name  IS 'Stripe checkout の配送先氏名 (shipping_details.name)';
COMMENT ON COLUMN orders.shipping_phone IS 'Stripe checkout の電話番号 (customer_details.phone)';

-- shipping_address JSONB は既存カラム。Stripe 形式:
--   { line1, line2, city, state, postal_code, country }
-- state = 都道府県（prefecture相当）

-- ──────────────────────────────────────────
-- order_items テーブル: 刻印テキストを追加
-- ──────────────────────────────────────────
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS engraving_text TEXT;   -- 刻印内容（NULL = 刻印なし）

COMMENT ON COLUMN order_items.engraving_text IS '刻印内容。NULL = 刻印なし。最大文字数は商品設定による。';

-- ──────────────────────────────────────────
-- products テーブル: 刻印設定を追加
-- ──────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS engraving_available BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS engraving_required  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS engraving_max_chars INTEGER  NOT NULL DEFAULT 20;

COMMENT ON COLUMN products.engraving_available IS '刻印オプション対応商品の場合 true';
COMMENT ON COLUMN products.engraving_required  IS '刻印必須の場合 true (engraving_available=true 前提)';
COMMENT ON COLUMN products.engraving_max_chars IS '刻印最大文字数 (デフォルト: 20文字)';

-- ──────────────────────────────────────────
-- 確認クエリ（実行後に結果を確認してください）
-- ──────────────────────────────────────────
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('orders', 'order_items', 'products')
  AND column_name IN (
    'shipping_name', 'shipping_phone',
    'engraving_text',
    'engraving_available', 'engraving_required', 'engraving_max_chars'
  )
ORDER BY table_name, column_name;
