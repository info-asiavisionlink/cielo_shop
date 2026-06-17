-- ============================================================
-- CIELO SHOP — Migration: product_type & product_specs
-- 実行日: 2026-06-17
-- ============================================================
-- Supabase Dashboard → SQL Editor で実行してください
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. products テーブルに product_type カラム追加
-- ────────────────────────────────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT;

-- 既存商品の product_type を subcategory から自動設定
UPDATE products SET product_type = CASE
  WHEN subcategory = 'necklace'                       THEN 'Necklace'
  WHEN subcategory = 'ring'                           THEN 'Ring'
  WHEN subcategory = 'bracelet'                       THEN 'Bracelet'
  WHEN subcategory = 'pierce'                         THEN 'Pierce'
  WHEN subcategory IN ('tshirt','moissanite_apparel') THEN 'Tshirt'
  WHEN subcategory = 'long_sleeve'                    THEN 'Hoodie'
  WHEN category = 'art'                               THEN 'Art'
  ELSE NULL
END
WHERE product_type IS NULL;

-- ────────────────────────────────────────────────────────────
-- 2. product_specs テーブル新規作成
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_specs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec_type   TEXT        NOT NULL,   -- 'jewelry' | 'apparel' | 'art'
  spec_key    TEXT        NOT NULL,   -- 'material' | 'stone_type' | 'carat' 等
  spec_value  TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. インデックス
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_product_specs_product
  ON product_specs(product_id);

CREATE INDEX IF NOT EXISTS idx_product_specs_type
  ON product_specs(product_id, spec_type);

-- ────────────────────────────────────────────────────────────
-- 4. Row Level Security
-- ────────────────────────────────────────────────────────────
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'product_specs'
      AND policyname = 'public_select_product_specs'
  ) THEN
    CREATE POLICY "public_select_product_specs"
      ON product_specs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM products p
          WHERE p.id = product_specs.product_id
            AND p.status = 'active'
        )
      );
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- 5. 既存 attributes JSONB → product_specs へ移行
-- ────────────────────────────────────────────────────────────
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order)
SELECT
  p.id,
  p.category::TEXT AS spec_type,
  kv.key           AS spec_key,
  CASE
    WHEN jsonb_typeof(kv.value) = 'boolean'
      THEN CASE WHEN (kv.value)::boolean THEN 'あり' ELSE 'なし' END
    ELSE kv.value #>> '{}'
  END              AS spec_value,
  (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY kv.key) - 1) AS sort_order
FROM products p,
LATERAL jsonb_each(p.attributes) kv
WHERE p.attributes IS NOT NULL
  AND p.attributes != '{}'::jsonb
  AND kv.value IS NOT NULL
  AND kv.value != 'null'::jsonb
  AND kv.value #>> '{}' IS NOT NULL
  AND kv.value #>> '{}' != ''
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 6. 移行確認クエリ（コメントアウト解除して実行）
-- ────────────────────────────────────────────────────────────
-- SELECT p.slug, p.product_type, ps.spec_key, ps.spec_value
-- FROM products p
-- LEFT JOIN product_specs ps ON ps.product_id = p.id
-- ORDER BY p.slug, ps.sort_order;
