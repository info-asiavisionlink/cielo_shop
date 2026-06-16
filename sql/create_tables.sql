-- ============================================================
-- CIELO_SHOP — create_tables.sql
-- Supabase / PostgreSQL
-- 最終更新: 2026-06-17
-- ============================================================
-- 実行順序: このファイルを最初に実行する
-- ============================================================

-- ============================================================
-- CLEANUP（再実行時のリセット）
-- ============================================================
DROP TABLE IF EXISTS product_tags     CASCADE;
DROP TABLE IF EXISTS tags             CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_images   CASCADE;
DROP TABLE IF EXISTS products         CASCADE;
DROP TYPE  IF EXISTS product_category;
DROP TYPE  IF EXISTS product_status;

-- ============================================================
-- ENUM 型
-- ============================================================
CREATE TYPE product_category AS ENUM (
  'jewelry',
  'apparel',
  'art'
);

CREATE TYPE product_status AS ENUM (
  'draft',     -- 下書き（非公開）
  'active',    -- 公開中
  'archived'   -- アーカイブ（販売終了・非表示）
);

-- ============================================================
-- products — 商品マスタ
-- ============================================================
CREATE TABLE products (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT              UNIQUE NOT NULL,           -- URL: /product?slug=xxx
  name            TEXT              NOT NULL,                  -- 商品名（英）
  name_ja         TEXT,                                        -- 商品名（日）
  category        product_category  NOT NULL,                  -- jewelry | apparel | art
  subcategory     TEXT              NOT NULL,                  -- necklace / ring / tshirt / pop_culture etc.
  price           INTEGER           NOT NULL CHECK (price >= 0), -- JPY 税込（整数）
  description     TEXT,                                        -- 商品説明（英）
  description_ja  TEXT,                                        -- 商品説明（日）
  story           TEXT,                                        -- ブランドコピー（英）
  story_ja        TEXT,                                        -- ブランドコピー（日）
  status          product_status    NOT NULL DEFAULT 'draft',
  featured        BOOLEAN           NOT NULL DEFAULT false,    -- トップページフィーチャー対象
  stock_count     INTEGER           NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  attributes      JSONB             NOT NULL DEFAULT '{}',     -- カテゴリ固有データ（下記参照）
  seo_title       TEXT,                                        -- <title> タグ
  seo_description TEXT,                                        -- <meta name="description">
  og_image_url    TEXT,                                        -- OGP / og:image URL
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- attributes JSONB スキーマ定義（カテゴリ別）
-- Jewelry:
--   { material, metal_color, stone_type, stone_size_ct,
--     stone_color, stone_clarity, moissanite_hardness, moissanite_ri, setting }
--
-- Apparel:
--   { material, print_method, country_of_origin }
--
-- Art:
--   { medium, edition, edition_total, signed, framed, certificate }

COMMENT ON TABLE products IS 'CIELO 商品マスタ。カテゴリ固有データは attributes (JSONB) に格納。';
COMMENT ON COLUMN products.slug IS 'URLスラッグ。/product?slug={slug} で商品詳細ページを生成。';
COMMENT ON COLUMN products.price IS 'JPY 税込価格（整数）。';
COMMENT ON COLUMN products.attributes IS 'カテゴリ固有データ。Jewelry/Apparel/Art で異なるスキーマ。';

-- ============================================================
-- product_images — 商品画像（無制限管理）
-- ============================================================
-- image_1 / image_2 カラム方式は禁止。
-- sort_order で順序管理、is_thumbnail でサムネイル1枚を管理。
-- ============================================================
CREATE TABLE product_images (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url     TEXT          NOT NULL,
  alt_text      TEXT,
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  is_thumbnail  BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 1商品につきサムネイルは1枚のみ（部分ユニーク制約）
CREATE UNIQUE INDEX uq_product_images_one_thumbnail
  ON product_images(product_id)
  WHERE is_thumbnail = true;

COMMENT ON TABLE product_images IS '商品画像。1商品につき上限なし（最低5枚推奨）。サムネイルは is_thumbnail=true の1枚のみ。';

-- ============================================================
-- product_variants — サイズ / カラー / エディション / 長さ / 額装
-- ============================================================
CREATE TABLE product_variants (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku             TEXT          UNIQUE NOT NULL,     -- CL-TS-001-BLK-M / CL-RING-001-09 etc.
  type            TEXT          NOT NULL,            -- 'size' | 'color_size' | 'length' | 'frame'
  label           TEXT          NOT NULL,            -- 'S' | 'Black / M' | '40cm' | 'With Frame'
  label_ja        TEXT,
  stock_count     INTEGER       NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  price_modifier  INTEGER       NOT NULL DEFAULT 0,  -- バリアント追加料金 (JPY)
  sort_order      INTEGER       NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE product_variants IS 'Jewelry: size/length, Apparel: color_size(組み合わせ), Art: size/frame に使用。';
COMMENT ON COLUMN product_variants.sku IS 'CL-{CAT}-{NUM}-{VARIANT}。例: CL-TS-001-BLK-M, CL-RING-001-09, CL-NCK-001-45CM';
COMMENT ON COLUMN product_variants.type IS 'size | color_size | length | frame';
COMMENT ON COLUMN product_variants.price_modifier IS 'バリアント追加料金。基本価格 (products.price) に加算。';

-- ============================================================
-- tags — タグマスタ
-- ============================================================
CREATE TABLE tags (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    UNIQUE NOT NULL,  -- 'moissanite' | 'street-luxury' | 'hiphop'
  name_ja     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- product_tags — 商品×タグ（多対多）
-- ============================================================
CREATE TABLE product_tags (
  product_id  UUID  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id      UUID  NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_products_category      ON products(category);
CREATE INDEX idx_products_subcategory   ON products(subcategory);
CREATE INDEX idx_products_status        ON products(status);
CREATE INDEX idx_products_featured      ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_slug          ON products(slug);
CREATE INDEX idx_products_status_cat    ON products(status, category);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_sort    ON product_images(product_id, sort_order);
CREATE INDEX idx_product_images_thumb   ON product_images(product_id) WHERE is_thumbnail = true;
CREATE INDEX idx_product_variants_prod  ON product_variants(product_id);
CREATE INDEX idx_product_variants_type  ON product_variants(product_id, type);
CREATE INDEX idx_product_tags_product   ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag       ON product_tags(tag_id);

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags     ENABLE ROW LEVEL SECURITY;

-- 公開ポリシー: status = 'active' の商品のみ読み取り可能
CREATE POLICY "public_select_active_products"
  ON products FOR SELECT
  USING (status = 'active');

-- active 商品の画像のみ公開
CREATE POLICY "public_select_product_images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
        AND p.status = 'active'
    )
  );

-- active 商品のバリアントのみ公開
CREATE POLICY "public_select_product_variants"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_variants.product_id
        AND p.status = 'active'
    )
  );

-- タグは全公開
CREATE POLICY "public_select_tags"
  ON tags FOR SELECT
  USING (true);

-- 商品タグは全公開（products ポリシーで間接的に制御済み）
CREATE POLICY "public_select_product_tags"
  ON product_tags FOR SELECT
  USING (true);

-- ============================================================
-- [FUTURE] Stripe 連携後に追加するテーブル
-- ============================================================
-- DROP TYPE  IF EXISTS order_status;
-- CREATE TYPE order_status AS ENUM (
--   'pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'
-- );
--
-- CREATE TABLE orders (
--   id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
--   stripe_session_id         TEXT          UNIQUE,
--   stripe_payment_intent_id  TEXT          UNIQUE,
--   status                    order_status  NOT NULL DEFAULT 'pending',
--   subtotal                  INTEGER       NOT NULL,          -- JPY 税抜
--   tax                       INTEGER       NOT NULL DEFAULT 0, -- JPY 消費税
--   total                     INTEGER       NOT NULL,          -- JPY 税込
--   currency                  TEXT          NOT NULL DEFAULT 'jpy',
--   customer_email            TEXT,
--   customer_name             TEXT,
--   shipping_address          JSONB,
--   created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
--   updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
-- );
--
-- CREATE TABLE order_items (
--   id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_id        UUID      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
--   product_id      UUID      NOT NULL REFERENCES products(id),
--   variant_id      UUID      REFERENCES product_variants(id),
--   product_name    TEXT      NOT NULL,  -- 購入時点のスナップショット
--   product_slug    TEXT      NOT NULL,
--   variant_label   TEXT,
--   unit_price      INTEGER   NOT NULL,  -- JPY 税込単価
--   quantity        INTEGER   NOT NULL DEFAULT 1,
--   subtotal        INTEGER   NOT NULL,  -- unit_price × quantity
--   created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );
