-- ============================================================
-- CIELO — 刻印管理カラム追加
-- products: 利用可能タイプ・刻印場所
-- order_items: 刻印場所スナップショット
-- ============================================================

-- products: 利用可能な刻印タイプ (NULL = 全タイプ使用可能)
-- 例: '{initials,name,date}'::TEXT[]
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS inscription_available_types TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS inscription_location TEXT DEFAULT NULL;

COMMENT ON COLUMN products.inscription_available_types IS
  '利用可能な刻印タイプ。NULL=全タイプ。例: {initials,name,date,short_message}';
COMMENT ON COLUMN products.inscription_location IS
  '刻印場所。例: インナータグ / バックプレート / リング内側';

-- order_items: 注文時点の刻印場所スナップショット
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS inscription_location TEXT DEFAULT NULL;

COMMENT ON COLUMN order_items.inscription_location IS
  '注文時点の刻印場所スナップショット (products.inscription_location より転記)';
