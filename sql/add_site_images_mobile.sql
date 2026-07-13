-- ============================================================
-- CIELO. — site_images にスマホ用画像カラムを追加
-- ============================================================

ALTER TABLE site_images
  ADD COLUMN IF NOT EXISTS mobile_image_url TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN site_images.mobile_image_url IS 'スマホ用画像URL（省略するとPC用を使用）';
