-- ============================================================
-- CIELO. — メッセージカード刻印サービス
-- 刻印サービス廃止 → メッセージカードサービスへ移行
-- orders テーブルにメッセージカード3項目を追加
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS message_card_to      TEXT,
  ADD COLUMN IF NOT EXISTS message_card_message TEXT,
  ADD COLUMN IF NOT EXISTS message_card_from    TEXT;

COMMENT ON COLUMN orders.message_card_to      IS 'メッセージカード宛名（相手のお名前）';
COMMENT ON COLUMN orders.message_card_message IS 'メッセージカード本文（最大30文字）';
COMMENT ON COLUMN orders.message_card_from    IS 'メッセージカード差出人（贈る方のお名前）';
