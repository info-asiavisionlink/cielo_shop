-- ============================================================
-- CIELO — order_items に engraving_type カラムを追加
-- 実行済み: add_shipping_engraving.sql の後に実行
-- ============================================================

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS engraving_type TEXT;
-- 値: 'personal_mark' | 'date' | 'short_message' | NULL

COMMENT ON COLUMN order_items.engraving_type IS '刻印タイプ: personal_mark / date / short_message / NULL=刻印なし';
