-- ============================================================
-- CIELO. — products テーブルから刻印関連カラムを削除
-- 刻印サービス廃止（2026-07-13）に伴うクリーンアップ
--
-- 実行前に Supabase Dashboard でバックアップを取ること
-- ============================================================

ALTER TABLE products
  DROP COLUMN IF EXISTS engraving_available,
  DROP COLUMN IF EXISTS engraving_required,
  DROP COLUMN IF EXISTS engraving_max_chars,
  DROP COLUMN IF EXISTS inscription_available_types,
  DROP COLUMN IF EXISTS inscription_location;

-- 確認クエリ
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN (
    'engraving_available','engraving_required','engraving_max_chars',
    'inscription_available_types','inscription_location'
  );
-- → 0件が正常
