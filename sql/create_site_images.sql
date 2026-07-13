-- ============================================================
-- CIELO. — site_images テーブル
-- WEBSITE / SHOP の商品画像以外の画像をコンソールから管理
-- ============================================================

CREATE TABLE IF NOT EXISTS site_images (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  site          TEXT         NOT NULL CHECK (site IN ('website', 'shop')),
  section       TEXT         NOT NULL,
  slot_key      TEXT         NOT NULL,
  slot_label    TEXT         NOT NULL,
  display_order INTEGER      NOT NULL DEFAULT 0,
  image_url     TEXT         NOT NULL DEFAULT '',
  alt_text      TEXT         NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (site, slot_key)
);

CREATE INDEX IF NOT EXISTS idx_site_images_site    ON site_images(site);
CREATE INDEX IF NOT EXISTS idx_site_images_section ON site_images(site, section);

DROP TRIGGER IF EXISTS site_images_set_updated_at ON site_images;
CREATE TRIGGER site_images_set_updated_at
  BEFORE UPDATE ON site_images
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_images" ON site_images;
CREATE POLICY "public_read_site_images"
  ON site_images FOR SELECT USING (true);

COMMENT ON TABLE  site_images              IS 'WEBSITE / SHOP の商品画像以外の画像管理';
COMMENT ON COLUMN site_images.site         IS '''website'' | ''shop''';
COMMENT ON COLUMN site_images.section      IS 'hero_slider | about | collections | presentation';
COMMENT ON COLUMN site_images.slot_key     IS 'HERO_001, IMAGE_023 など画像の識別キー';
COMMENT ON COLUMN site_images.slot_label   IS 'コンソール表示用ラベル';
COMMENT ON COLUMN site_images.display_order IS 'セクション内の表示順';

-- ── 初期データ（CIELO WEBSITE 現在使用中の画像） ──
INSERT INTO site_images (site, section, slot_key, slot_label, display_order, image_url, alt_text)
VALUES
  -- Hero スライダー
  ('website', 'hero_slider', 'HERO_001', 'Hero スライダー — 1枚目', 1,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781601145/u7696224659_luxury_street_culture_campaign_image_confident_fi_dcc726dd-2037-4618-a928-19668510b940_1_loinoe.png',
   'CIELO アパレルキャンペーン 1'),
  ('website', 'hero_slider', 'HERO_002', 'Hero スライダー — 2枚目', 2,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781601291/u7696224659_luxury_street_culture_campaign_image_person_weari_d25b4b11-329c-4e6c-9e42-fecf7bc7efc1_2_dwhuor.png',
   'CIELO アパレルキャンペーン 2'),
  ('website', 'hero_slider', 'HERO_003', 'Hero スライダー — 3枚目', 3,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781601495/u7696224659_luxury_street_culture_campaign_image_person_weari_01b29187-2494-4549-9b9c-8084daf4eb95_2_tkdltf.png',
   'CIELO アパレルキャンペーン 3'),
  ('website', 'hero_slider', 'HERO_004', 'Hero スライダー — 4枚目', 4,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781601612/u7696224659_luxury_street_culture_campaign_finale_two_or_thre_a03f5736-c745-4865-b60a-78a80b85f5e0_0_a9jzrn.png',
   'CIELO アパレルキャンペーン 4'),
  -- About セクション
  ('website', 'about', 'IMAGE_023', 'About — ブランドストーリー画像', 1,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781599798/u7696224659_CIELO_brand_story_portrait_luxury_entrepreneur_an_d6e68f78-b3a4-4430-a4cf-aeed9111f5d1_0_ntwaji.png',
   'CIELO. ブランドストーリー'),
  -- Collections
  ('website', 'collections', 'IMAGE_007', 'Collections — T-Shirts', 1,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781589694/u7696224659_street_luxury_lifestyle_portrait_artist_wearing_p_156ec8df-546f-4aea-9540-66a11823cf0d_3_bgx80c.png',
   'CIELO T-Shirt'),
  ('website', 'collections', 'IMAGE_009', 'Collections — Long Sleeve', 2,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781590182/u7696224659_premium_long_sleeve_streetwear_styling_sapphire_b_519ccf77-aad0-47a9-a623-3acd63ce8959_1_zib0k4.png',
   'CIELO Long Sleeve'),
  ('website', 'collections', 'IMAGE_011', 'Collections — Setup · Hoodie', 3,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781590680/u7696224659_luxury_streetwear_editorial_portrait_person_weari_88e9061e-de4c-4d99-954f-41942db16018_1_yurjeo.png',
   'CIELO Setup · Hoodie'),
  -- Presentation
  ('website', 'presentation', 'IMAGE_024', 'Presentation — 背景画像', 1,
   'https://res.cloudinary.com/deyc8gz2k/image/upload/v1781599985/u7696224659_luxury_philosophy_campaign_image_dark_architectur_50d3aaa9-d6b9-4529-899c-2335ff807336_3_ytcj9y.png',
   'CIELO ブランド哲学')
ON CONFLICT (site, slot_key) DO NOTHING;
