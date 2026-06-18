-- ============================================================
-- CIELO_SHOP — create_orders.sql
-- Supabase / PostgreSQL
-- Stripe 連携テーブル + 在庫減算 RPC
-- ============================================================
-- 実行順序: create_tables.sql の後に実行
-- ============================================================

-- ============================================================
-- CLEANUP（再実行時のリセット）
-- ============================================================
DROP FUNCTION IF EXISTS decrement_stock(UUID, INTEGER);
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders     CASCADE;
DROP TABLE IF EXISTS customers  CASCADE;
DROP TYPE  IF EXISTS order_status;

-- ============================================================
-- ENUM
-- ============================================================
CREATE TYPE order_status AS ENUM (
  'pending',    -- 決済前
  'paid',       -- 決済完了
  'processing', -- 梱包中
  'shipped',    -- 発送済み
  'delivered',  -- 配達完了
  'cancelled',  -- キャンセル
  'refunded'    -- 返金済み
);

-- ============================================================
-- customers — 顧客マスタ
-- ============================================================
CREATE TABLE customers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        UNIQUE NOT NULL,
  name        TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);

-- ============================================================
-- orders — 注文（Stripe Checkout Session と 1:1）
-- ============================================================
CREATE TABLE orders (
  id                        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id         TEXT         UNIQUE NOT NULL,
  stripe_payment_intent_id  TEXT         UNIQUE,
  customer_id               UUID         REFERENCES customers(id),
  customer_name             TEXT,                            -- ダッシュボード表示用（スナップショット）
  customer_email            TEXT,                            -- ダッシュボード表示用（スナップショット）
  status                    order_status NOT NULL DEFAULT 'pending',
  subtotal                  INTEGER      NOT NULL,           -- JPY
  tax                       INTEGER      NOT NULL DEFAULT 0, -- JPY
  total                     INTEGER      NOT NULL,           -- JPY 税込
  currency                  TEXT         NOT NULL DEFAULT 'jpy',
  shipping_address          JSONB,
  tracking_number           TEXT,                            -- 発送追跡番号
  notes                     TEXT,                            -- 管理者メモ
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_session     ON orders(stripe_session_id);
CREATE INDEX idx_orders_customer    ON orders(customer_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created_at  ON orders(created_at DESC);

-- ============================================================
-- order_items — 注文明細
-- ============================================================
CREATE TABLE order_items (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID      NOT NULL REFERENCES products(id),
  variant_id    UUID      REFERENCES product_variants(id),
  product_name  TEXT      NOT NULL,  -- 購入時点スナップショット
  product_slug  TEXT      NOT NULL,
  variant_label TEXT,
  unit_price    INTEGER   NOT NULL,  -- JPY 税込単価
  quantity      INTEGER   NOT NULL DEFAULT 1,
  subtotal      INTEGER   NOT NULL,  -- unit_price × quantity
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- updated_at トリガー
-- ============================================================
CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 公開ポリシーなし（Service Role のみアクセス可）
-- Service Role Key は RLS を自動バイパスするため追加設定不要

-- ============================================================
-- decrement_stock — 在庫原子的減算 RPC
-- ============================================================
-- Webhook から呼び出し。stock_count >= p_quantity の場合のみ更新。
-- 戻り値: true=成功 / false=在庫不足
-- ============================================================
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE product_variants
     SET stock_count = stock_count - p_quantity
   WHERE id = p_variant_id
     AND stock_count >= p_quantity;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;
