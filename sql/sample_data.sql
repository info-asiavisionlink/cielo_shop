-- ============================================================
-- CIELO_SHOP — sample_data.sql
-- ============================================================
-- 前提: create_tables.sql を先に実行すること
-- SKU規則: CL-{CAT}-{NUM}-{VARIANT}
--   CAT: NCK/RING/BRC/PIER/TS/LS/MTS/NEO/HH/PC/SC/OC
--   Apparel バリアント: type='color_size', label='Black / M'
-- ============================================================

DELETE FROM product_tags;
DELETE FROM product_variants;
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM tags;

-- ============================================================
-- Tags
-- ============================================================
INSERT INTO tags (id, name, name_ja) VALUES
  ('00000000-0000-0000-0000-000000000001', 'moissanite',    'モアサナイト'),
  ('00000000-0000-0000-0000-000000000002', 'jewelry',       'ジュエリー'),
  ('00000000-0000-0000-0000-000000000003', 'necklace',      'ネックレス'),
  ('00000000-0000-0000-0000-000000000004', 'ring',          'リング'),
  ('00000000-0000-0000-0000-000000000005', 'bracelet',      'ブレスレット'),
  ('00000000-0000-0000-0000-000000000006', 'apparel',       'アパレル'),
  ('00000000-0000-0000-0000-000000000007', 'tshirt',        'Tシャツ'),
  ('00000000-0000-0000-0000-000000000008', 'art',           'アート'),
  ('00000000-0000-0000-0000-000000000009', 'neon',          'ネオン'),
  ('00000000-0000-0000-0000-000000000010', 'hiphop',        'ヒップホップ'),
  ('00000000-0000-0000-0000-000000000011', 'pop-culture',   'ポップカルチャー'),
  ('00000000-0000-0000-0000-000000000012', 'street-luxury', 'ストリートラグジュアリー'),
  ('00000000-0000-0000-0000-000000000013', 'featured',      'フィーチャード'),
  ('00000000-0000-0000-0000-000000000014', 'limited',       'リミテッド'),
  ('00000000-0000-0000-0000-000000000015', 'street-culture','ストリートカルチャー');

-- ============================================================
-- JEWELRY — 1: CIELO Solitaire Necklace
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '11111111-1111-1111-1111-111111111101',
  'cielo-solitaire-necklace',
  'CIELO Solitaire Necklace',
  'シエロ ソリテール ネックレス',
  'jewelry', 'necklace', 28600,
  'A single moissanite at the center. The light you deserve.',
  '中央に一粒のモアサナイト。あなたに相応しい輝き。',
  'One stone. One statement. CIELO.',
  '一粒の石が、全てを語る。',
  'active', true, 15,
  '{"material":"925 Sterling Silver","metal_color":"Silver","stone_type":"Moissanite","stone_size_ct":"1.0","stone_color":"D Color","stone_clarity":"VVS1","moissanite_hardness":"9.25","moissanite_ri":"2.65-2.69","setting":"Solitaire"}',
  'CIELO Solitaire Necklace — ¥28,600 | CIELO',
  '一粒のモアサナイトが放つ圧倒的な存在感。¥28,600（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('11111111-1111-1111-1111-111111111101','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace/image_1.webp','CIELO Solitaire Necklace — メインビジュアル',0,true),
  ('11111111-1111-1111-1111-111111111101','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace/image_2.webp','CIELO Solitaire Necklace — 着用シーン',1,false),
  ('11111111-1111-1111-1111-111111111101','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace/image_3.webp','CIELO Solitaire Necklace — クローズアップ',2,false),
  ('11111111-1111-1111-1111-111111111101','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace/image_4.webp','CIELO Solitaire Necklace — サイドビュー',3,false),
  ('11111111-1111-1111-1111-111111111101','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace/image_5.webp','CIELO Solitaire Necklace — 光の反射',4,false);

-- Jewelry: type='length', SKU = CL-NCK-001-{LENGTH}
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111101','CL-NCK-001-40CM','length','40cm','40cm',8,0,0),
  ('11111111-1111-1111-1111-111111111101','CL-NCK-001-45CM','length','45cm','45cm',7,0,1);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('11111111-1111-1111-1111-111111111101','00000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111101','00000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111101','00000000-0000-0000-0000-000000000003'),
  ('11111111-1111-1111-1111-111111111101','00000000-0000-0000-0000-000000000012'),
  ('11111111-1111-1111-1111-111111111101','00000000-0000-0000-0000-000000000013');

-- ============================================================
-- JEWELRY — 2: CIELO Eternal Ring
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '11111111-1111-1111-1111-111111111102',
  'cielo-eternal-ring',
  'CIELO Eternal Ring',
  'シエロ エターナル リング',
  'jewelry', 'ring', 19800,
  'Pavé-set moissanite. Endless light on every finger.',
  'パヴェセッティングのモアサナイト。指先に宿る無限の輝き。',
  'Wear the light. Own the moment.',
  '輝きを纏う。瞬間を所有する。',
  'active', false, 20,
  '{"material":"925 Sterling Silver","metal_color":"Silver","stone_type":"Moissanite","stone_size_ct":"0.5","stone_color":"D Color","stone_clarity":"VVS1","moissanite_hardness":"9.25","moissanite_ri":"2.65-2.69","setting":"Pavé"}',
  'CIELO Eternal Ring — ¥19,800 | CIELO',
  'パヴェセッティングのモアサナイトリング。¥19,800（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-eternal-ring/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('11111111-1111-1111-1111-111111111102','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-eternal-ring/image_1.webp','CIELO Eternal Ring — メインビジュアル',0,true),
  ('11111111-1111-1111-1111-111111111102','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-eternal-ring/image_2.webp','CIELO Eternal Ring — 着用シーン',1,false),
  ('11111111-1111-1111-1111-111111111102','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-eternal-ring/image_3.webp','CIELO Eternal Ring — クローズアップ',2,false),
  ('11111111-1111-1111-1111-111111111102','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-eternal-ring/image_4.webp','CIELO Eternal Ring — サイドビュー',3,false),
  ('11111111-1111-1111-1111-111111111102','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-eternal-ring/image_5.webp','CIELO Eternal Ring — 光の反射',4,false);

-- Jewelry Ring: type='size', SKU = CL-RING-001-{号数2桁}
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111102','CL-RING-001-07','size','7', '7号', 4,0,0),
  ('11111111-1111-1111-1111-111111111102','CL-RING-001-09','size','9', '9号', 5,0,1),
  ('11111111-1111-1111-1111-111111111102','CL-RING-001-11','size','11','11号',5,0,2),
  ('11111111-1111-1111-1111-111111111102','CL-RING-001-13','size','13','13号',4,0,3),
  ('11111111-1111-1111-1111-111111111102','CL-RING-001-15','size','15','15号',2,0,4);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('11111111-1111-1111-1111-111111111102','00000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111102','00000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111102','00000000-0000-0000-0000-000000000004'),
  ('11111111-1111-1111-1111-111111111102','00000000-0000-0000-0000-000000000012');

-- ============================================================
-- JEWELRY — 3: CIELO Tennis Bracelet
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '11111111-1111-1111-1111-111111111103',
  'cielo-tennis-bracelet',
  'CIELO Tennis Bracelet',
  'シエロ テニス ブレスレット',
  'jewelry', 'bracelet', 45100,
  'Full moissanite tennis bracelet. The wrist that commands attention.',
  'フルモアサナイト テニスブレスレット。視線を独占する手首へ。',
  'Every stone. Every movement. All CIELO.',
  '全ての石が、全ての動きに輝く。',
  'active', true, 8,
  '{"material":"925 Sterling Silver","metal_color":"Silver","stone_type":"Moissanite","stone_count":"45","total_carat":"5.0","stone_color":"D Color","stone_clarity":"VVS1","moissanite_hardness":"9.25","moissanite_ri":"2.65-2.69"}',
  'CIELO Tennis Bracelet — ¥45,100 | CIELO',
  'フルモアサナイトのテニスブレスレット。圧倒的な存在感。¥45,100（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-tennis-bracelet/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('11111111-1111-1111-1111-111111111103','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-tennis-bracelet/image_1.webp','CIELO Tennis Bracelet — メインビジュアル',0,true),
  ('11111111-1111-1111-1111-111111111103','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-tennis-bracelet/image_2.webp','CIELO Tennis Bracelet — 着用シーン',1,false),
  ('11111111-1111-1111-1111-111111111103','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-tennis-bracelet/image_3.webp','CIELO Tennis Bracelet — クローズアップ',2,false),
  ('11111111-1111-1111-1111-111111111103','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-tennis-bracelet/image_4.webp','CIELO Tennis Bracelet — サイドビュー',3,false),
  ('11111111-1111-1111-1111-111111111103','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-tennis-bracelet/image_5.webp','CIELO Tennis Bracelet — 光の反射',4,false);

INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111103','CL-BRC-001-16CM','length','16cm','16cm',4,0,0),
  ('11111111-1111-1111-1111-111111111103','CL-BRC-001-18CM','length','18cm','18cm',4,0,1);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('11111111-1111-1111-1111-111111111103','00000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111103','00000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111103','00000000-0000-0000-0000-000000000005'),
  ('11111111-1111-1111-1111-111111111103','00000000-0000-0000-0000-000000000012'),
  ('11111111-1111-1111-1111-111111111103','00000000-0000-0000-0000-000000000013');

-- ============================================================
-- APPAREL — 4: CIELO Signature Tee
-- type='color_size', label='Black / M', SKU=CL-TS-001-BLK-M
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '22222222-2222-2222-2222-222222222201',
  'cielo-signature-tee',
  'CIELO Signature Tee',
  'シエロ シグネチャー Tシャツ',
  'apparel', 'tshirt', 11000,
  'The CIELO wordmark on heavyweight cotton. Simple. Powerful.',
  'ヘビーウェイトコットンにCIELOワードマーク。シンプル。圧倒的。',
  'Wear CIELO. Own the room.',
  'CIELOを纏う。空間を支配する。',
  'active', true, 50,
  '{"material":"100% Cotton, 400g/m²","print_method":"Screen Print","country_of_origin":"Japan"}',
  'CIELO Signature Tee — ¥11,000 | CIELO',
  'ヘビーウェイトコットンのCIELOシグネチャーTシャツ。¥11,000（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-signature-tee/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('22222222-2222-2222-2222-222222222201','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-signature-tee/image_1.webp','CIELO Signature Tee — メインビジュアル',0,true),
  ('22222222-2222-2222-2222-222222222201','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-signature-tee/image_2.webp','CIELO Signature Tee — 着用（フロント）',1,false),
  ('22222222-2222-2222-2222-222222222201','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-signature-tee/image_3.webp','CIELO Signature Tee — 着用（バック）',2,false),
  ('22222222-2222-2222-2222-222222222201','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-signature-tee/image_4.webp','CIELO Signature Tee — ディテール',3,false),
  ('22222222-2222-2222-2222-222222222201','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-signature-tee/image_5.webp','CIELO Signature Tee — スタイリング',4,false);

-- Apparel: color_size 組み合わせ単位でSKU管理
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-BLK-S',  'color_size','Black / S',  'ブラック / S',  8, 0, 0),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-BLK-M',  'color_size','Black / M',  'ブラック / M',  10,0, 1),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-BLK-L',  'color_size','Black / L',  'ブラック / L',  10,0, 2),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-BLK-XL', 'color_size','Black / XL', 'ブラック / XL', 6, 0, 3),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-BLK-XXL','color_size','Black / XXL','ブラック / XXL',2, 0, 4),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-WHT-S',  'color_size','White / S',  'ホワイト / S',  6, 0, 5),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-WHT-M',  'color_size','White / M',  'ホワイト / M',  5, 0, 6),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-WHT-L',  'color_size','White / L',  'ホワイト / L',  5, 0, 7),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-WHT-XL', 'color_size','White / XL', 'ホワイト / XL', 3, 0, 8),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-NVY-S',  'color_size','Navy / S',   'ネイビー / S',  4, 0, 9),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-NVY-M',  'color_size','Navy / M',   'ネイビー / M',  4, 0,10),
  ('22222222-2222-2222-2222-222222222201','CL-TS-001-NVY-L',  'color_size','Navy / L',   'ネイビー / L',  3, 0,11);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('22222222-2222-2222-2222-222222222201','00000000-0000-0000-0000-000000000006'),
  ('22222222-2222-2222-2222-222222222201','00000000-0000-0000-0000-000000000007'),
  ('22222222-2222-2222-2222-222222222201','00000000-0000-0000-0000-000000000012'),
  ('22222222-2222-2222-2222-222222222201','00000000-0000-0000-0000-000000000013');

-- ============================================================
-- APPAREL — 5: CIELO Long Sleeve
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '22222222-2222-2222-2222-222222222202',
  'cielo-long-sleeve',
  'CIELO Long Sleeve',
  'シエロ ロングスリーブ',
  'apparel', 'long_sleeve', 14300,
  'Long sleeve heavyweight. CIELO graphic, front and back.',
  'ヘビーウェイトロングスリーブ。フロントバックにCIELOグラフィック。',
  'The detail is in the sleeve.',
  '細部に宿るCIELO。',
  'active', false, 30,
  '{"material":"100% Cotton, 380g/m²","print_method":"Screen Print","country_of_origin":"Japan"}',
  'CIELO Long Sleeve — ¥14,300 | CIELO',
  'ヘビーウェイトのCIELOロングスリーブ。¥14,300（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-long-sleeve/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('22222222-2222-2222-2222-222222222202','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-long-sleeve/image_1.webp','CIELO Long Sleeve — メインビジュアル',0,true),
  ('22222222-2222-2222-2222-222222222202','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-long-sleeve/image_2.webp','CIELO Long Sleeve — 着用（フロント）',1,false),
  ('22222222-2222-2222-2222-222222222202','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-long-sleeve/image_3.webp','CIELO Long Sleeve — 着用（バック）',2,false),
  ('22222222-2222-2222-2222-222222222202','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-long-sleeve/image_4.webp','CIELO Long Sleeve — ディテール',3,false),
  ('22222222-2222-2222-2222-222222222202','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-long-sleeve/image_5.webp','CIELO Long Sleeve — スタイリング',4,false);

INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('22222222-2222-2222-2222-222222222202','CL-LS-001-BLK-S', 'color_size','Black / S', 'ブラック / S', 5, 0,0),
  ('22222222-2222-2222-2222-222222222202','CL-LS-001-BLK-M', 'color_size','Black / M', 'ブラック / M', 8, 0,1),
  ('22222222-2222-2222-2222-222222222202','CL-LS-001-BLK-L', 'color_size','Black / L', 'ブラック / L', 8, 0,2),
  ('22222222-2222-2222-2222-222222222202','CL-LS-001-BLK-XL','color_size','Black / XL','ブラック / XL',4, 0,3),
  ('22222222-2222-2222-2222-222222222202','CL-LS-001-WHT-S', 'color_size','White / S', 'ホワイト / S', 5, 0,4),
  ('22222222-2222-2222-2222-222222222202','CL-LS-001-WHT-M', 'color_size','White / M', 'ホワイト / M', 5, 0,5),
  ('22222222-2222-2222-2222-222222222202','CL-LS-001-WHT-L', 'color_size','White / L', 'ホワイト / L', 5, 0,6),
  ('22222222-2222-2222-2222-222222222202','CL-LS-001-WHT-XL','color_size','White / XL','ホワイト / XL',3, 0,7);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('22222222-2222-2222-2222-222222222202','00000000-0000-0000-0000-000000000006'),
  ('22222222-2222-2222-2222-222222222202','00000000-0000-0000-0000-000000000012');

-- ============================================================
-- APPAREL — 6: CIELO Moissanite Tee
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '22222222-2222-2222-2222-222222222203',
  'cielo-moissanite-tee',
  'CIELO Moissanite Tee',
  'シエロ モアサナイト Tシャツ',
  'apparel', 'moissanite_apparel', 24200,
  'Moissanite-encrusted logo. Where jewelry meets apparel.',
  'モアサナイト装飾ロゴ。ジュエリーとアパレルの境界を崩す。',
  'You are the jewelry.',
  'あなた自身がジュエリーだ。',
  'active', true, 12,
  '{"material":"100% Cotton, 400g/m²","print_method":"Embroidery + Moissanite Embellishment","country_of_origin":"Japan"}',
  'CIELO Moissanite Tee — ¥24,200 | CIELO',
  'モアサナイト装飾ロゴのTシャツ。着るジュエリー。¥24,200（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-moissanite-tee/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('22222222-2222-2222-2222-222222222203','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-moissanite-tee/image_1.webp','CIELO Moissanite Tee — メインビジュアル',0,true),
  ('22222222-2222-2222-2222-222222222203','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-moissanite-tee/image_2.webp','CIELO Moissanite Tee — 着用シーン',1,false),
  ('22222222-2222-2222-2222-222222222203','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-moissanite-tee/image_3.webp','CIELO Moissanite Tee — モアサナイトディテール',2,false),
  ('22222222-2222-2222-2222-222222222203','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-moissanite-tee/image_4.webp','CIELO Moissanite Tee — ロゴクローズアップ',3,false),
  ('22222222-2222-2222-2222-222222222203','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-moissanite-tee/image_5.webp','CIELO Moissanite Tee — スタイリング',4,false);

INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('22222222-2222-2222-2222-222222222203','CL-MTS-001-BLK-S', 'color_size','Black / S', 'ブラック / S', 2, 0,0),
  ('22222222-2222-2222-2222-222222222203','CL-MTS-001-BLK-M', 'color_size','Black / M', 'ブラック / M', 3, 0,1),
  ('22222222-2222-2222-2222-222222222203','CL-MTS-001-BLK-L', 'color_size','Black / L', 'ブラック / L', 3, 0,2),
  ('22222222-2222-2222-2222-222222222203','CL-MTS-001-BLK-XL','color_size','Black / XL','ブラック / XL',1, 0,3),
  ('22222222-2222-2222-2222-222222222203','CL-MTS-001-WHT-S', 'color_size','White / S', 'ホワイト / S', 1, 0,4),
  ('22222222-2222-2222-2222-222222222203','CL-MTS-001-WHT-M', 'color_size','White / M', 'ホワイト / M', 2, 0,5),
  ('22222222-2222-2222-2222-222222222203','CL-MTS-001-WHT-L', 'color_size','White / L', 'ホワイト / L', 1, 0,6);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('22222222-2222-2222-2222-222222222203','00000000-0000-0000-0000-000000000001'),
  ('22222222-2222-2222-2222-222222222203','00000000-0000-0000-0000-000000000006'),
  ('22222222-2222-2222-2222-222222222203','00000000-0000-0000-0000-000000000012'),
  ('22222222-2222-2222-2222-222222222203','00000000-0000-0000-0000-000000000013');

-- ============================================================
-- ART — 7: CIELO Neon City
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '33333333-3333-3333-3333-333333333301',
  'cielo-neon-city',
  'CIELO Neon City',
  'シエロ ネオン シティ',
  'art', 'neon', 55000,
  'The city that never sleeps. UV acrylic on aluminum. Limited to 30.',
  '眠らない都市。UVアクリル on アルミニウム。30枚限定。',
  'The city does not sleep. Neither does CIELO.',
  '都市は眠らない。CIELOも眠らない。',
  'active', true, 30,
  '{"medium":"UV Acrylic Print on Aluminum","edition":"Limited 30","edition_total":30,"signed":true,"framed":false,"certificate":true}',
  'CIELO Neon City — ¥55,000 | CIELO Art',
  'ネオンカラーで描く眠らない都市。30枚限定。¥55,000（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-neon-city/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('33333333-3333-3333-3333-333333333301','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-neon-city/image_1.webp','CIELO Neon City — メインビジュアル',0,true),
  ('33333333-3333-3333-3333-333333333301','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-neon-city/image_2.webp','CIELO Neon City — ディテール',1,false),
  ('33333333-3333-3333-3333-333333333301','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-neon-city/image_3.webp','CIELO Neon City — 空間設置（オフィス）',2,false),
  ('33333333-3333-3333-3333-333333333301','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-neon-city/image_4.webp','CIELO Neon City — 空間設置（リビング）',3,false),
  ('33333333-3333-3333-3333-333333333301','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-neon-city/image_5.webp','CIELO Neon City — サインディテール',4,false);

-- Art: type='size', price_modifier で A2/A1 追加料金
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333301','CL-NEO-001-A3',   'size', 'A3 (297×420mm)','A3（297×420mm）',10,0,    0),
  ('33333333-3333-3333-3333-333333333301','CL-NEO-001-A2',   'size', 'A2 (420×594mm)','A2（420×594mm）',10,11000,1),
  ('33333333-3333-3333-3333-333333333301','CL-NEO-001-A1',   'size', 'A1 (594×841mm)','A1（594×841mm）',10,33000,2);

-- Art: type='frame'
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333301','CL-NEO-001-NOFRM','frame','Without Frame','フレームなし',20,0,    0),
  ('33333333-3333-3333-3333-333333333301','CL-NEO-001-FRM',  'frame','With Frame',   'フレームあり',10,11000,1);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('33333333-3333-3333-3333-333333333301','00000000-0000-0000-0000-000000000008'),
  ('33333333-3333-3333-3333-333333333301','00000000-0000-0000-0000-000000000009'),
  ('33333333-3333-3333-3333-333333333301','00000000-0000-0000-0000-000000000012'),
  ('33333333-3333-3333-3333-333333333301','00000000-0000-0000-0000-000000000013'),
  ('33333333-3333-3333-3333-333333333301','00000000-0000-0000-0000-000000000014');

-- ============================================================
-- ART — 8: CIELO Hip Hop Rise
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '33333333-3333-3333-3333-333333333302',
  'cielo-hiphop-rise',
  'CIELO Hip Hop Rise',
  'シエロ ヒップホップ ライズ',
  'art', 'hiphop', 77000,
  'Born from the culture. UV acrylic on aluminum. Limited to 20.',
  'カルチャーから生まれた。UVアクリル。20枚限定。',
  'From the streets to the walls. CIELO.',
  'ストリートから壁へ。CIELO。',
  'active', false, 20,
  '{"medium":"UV Acrylic Print on Aluminum","edition":"Limited 20","edition_total":20,"signed":true,"framed":false,"certificate":true}',
  'CIELO Hip Hop Rise — ¥77,000 | CIELO Art',
  'ヒップホップカルチャーから生まれたアート。20枚限定。¥77,000（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-hiphop-rise/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('33333333-3333-3333-3333-333333333302','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-hiphop-rise/image_1.webp','CIELO Hip Hop Rise — メインビジュアル',0,true),
  ('33333333-3333-3333-3333-333333333302','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-hiphop-rise/image_2.webp','CIELO Hip Hop Rise — ディテール',1,false),
  ('33333333-3333-3333-3333-333333333302','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-hiphop-rise/image_3.webp','CIELO Hip Hop Rise — 空間設置（スタジオ）',2,false),
  ('33333333-3333-3333-3333-333333333302','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-hiphop-rise/image_4.webp','CIELO Hip Hop Rise — 空間設置（オフィス）',3,false),
  ('33333333-3333-3333-3333-333333333302','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-hiphop-rise/image_5.webp','CIELO Hip Hop Rise — サインディテール',4,false);

INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333302','CL-HH-001-A2',    'size', 'A2 (420×594mm)','A2（420×594mm）',10,0,    0),
  ('33333333-3333-3333-3333-333333333302','CL-HH-001-A1',    'size', 'A1 (594×841mm)','A1（594×841mm）',10,22000,1);

INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333302','CL-HH-001-NOFRM', 'frame','Without Frame','フレームなし',15,0,    0),
  ('33333333-3333-3333-3333-333333333302','CL-HH-001-FRM',   'frame','With Frame',   'フレームあり', 5,13200,1);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('33333333-3333-3333-3333-333333333302','00000000-0000-0000-0000-000000000008'),
  ('33333333-3333-3333-3333-333333333302','00000000-0000-0000-0000-000000000010'),
  ('33333333-3333-3333-3333-333333333302','00000000-0000-0000-0000-000000000012'),
  ('33333333-3333-3333-3333-333333333302','00000000-0000-0000-0000-000000000014');

-- ============================================================
-- ART — 9: CIELO Pop Culture 01
-- ============================================================
INSERT INTO products (
  id, slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  '33333333-3333-3333-3333-333333333303',
  'cielo-pop-culture-01',
  'CIELO Pop Culture 01',
  'シエロ ポップカルチャー 01',
  'art', 'pop_culture', 44000,
  'Pop culture reimagined through the CIELO lens. UV acrylic. Open edition.',
  'CIELOの視点で再解釈されたポップカルチャー。UVアクリル。オープンエディション。',
  'Culture is the canvas. CIELO is the brush.',
  'カルチャーはキャンバス。CIELOは筆。',
  'active', false, 100,
  '{"medium":"UV Acrylic Print","edition":"Open Edition","edition_total":null,"signed":false,"framed":false,"certificate":false}',
  'CIELO Pop Culture 01 — ¥44,000 | CIELO Art',
  'ポップカルチャーをCIELOの視点で再解釈したアート。¥44,000（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pop-culture-01/image_1.webp'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('33333333-3333-3333-3333-333333333303','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pop-culture-01/image_1.webp','CIELO Pop Culture 01 — メインビジュアル',0,true),
  ('33333333-3333-3333-3333-333333333303','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pop-culture-01/image_2.webp','CIELO Pop Culture 01 — ディテール',1,false),
  ('33333333-3333-3333-3333-333333333303','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pop-culture-01/image_3.webp','CIELO Pop Culture 01 — 空間設置（スタジオ）',2,false),
  ('33333333-3333-3333-3333-333333333303','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pop-culture-01/image_4.webp','CIELO Pop Culture 01 — 空間設置（リビング）',3,false),
  ('33333333-3333-3333-3333-333333333303','https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pop-culture-01/image_5.webp','CIELO Pop Culture 01 — スタイリング',4,false);

INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333303','CL-PC-001-A3','size','A3 (297×420mm)','A3（297×420mm）',50,0,    0),
  ('33333333-3333-3333-3333-333333333303','CL-PC-001-A2','size','A2 (420×594mm)','A2（420×594mm）',30,8800, 1),
  ('33333333-3333-3333-3333-333333333303','CL-PC-001-A1','size','A1 (594×841mm)','A1（594×841mm）',20,22000,2);

INSERT INTO product_tags (product_id, tag_id) VALUES
  ('33333333-3333-3333-3333-333333333303','00000000-0000-0000-0000-000000000008'),
  ('33333333-3333-3333-3333-333333333303','00000000-0000-0000-0000-000000000011'),
  ('33333333-3333-3333-3333-333333333303','00000000-0000-0000-0000-000000000012');

-- ============================================================
-- product_type 設定（全商品）
-- ============================================================
UPDATE products SET product_type = 'Necklace' WHERE id = '11111111-1111-1111-1111-111111111101';
UPDATE products SET product_type = 'Ring'      WHERE id = '11111111-1111-1111-1111-111111111102';
UPDATE products SET product_type = 'Bracelet'  WHERE id = '11111111-1111-1111-1111-111111111103';
UPDATE products SET product_type = 'Tshirt'    WHERE id = '22222222-2222-2222-2222-222222222201';
UPDATE products SET product_type = 'Hoodie'    WHERE id = '22222222-2222-2222-2222-222222222202';
UPDATE products SET product_type = 'Tshirt'    WHERE id = '22222222-2222-2222-2222-222222222203';
UPDATE products SET product_type = 'Art'       WHERE id IN (
  '33333333-3333-3333-3333-333333333301',
  '33333333-3333-3333-3333-333333333302',
  '33333333-3333-3333-3333-333333333303'
);

-- ============================================================
-- product_specs 投入（attributes JSONB から変換）
-- ============================================================
-- Jewelry 1: Solitaire Necklace
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111101','jewelry','material',            '925 Sterling Silver', 0),
  ('11111111-1111-1111-1111-111111111101','jewelry','metal_color',         'Silver',              1),
  ('11111111-1111-1111-1111-111111111101','jewelry','stone_type',          'Moissanite',          2),
  ('11111111-1111-1111-1111-111111111101','jewelry','carat',               '1.0',                 3),
  ('11111111-1111-1111-1111-111111111101','jewelry','stone_color',         'D Color',             4),
  ('11111111-1111-1111-1111-111111111101','jewelry','stone_clarity',       'VVS1',                5),
  ('11111111-1111-1111-1111-111111111101','jewelry','moissanite_hardness', '9.25',                6),
  ('11111111-1111-1111-1111-111111111101','jewelry','moissanite_ri',       '2.65-2.69',           7),
  ('11111111-1111-1111-1111-111111111101','jewelry','setting',             'Solitaire',           8),
  ('11111111-1111-1111-1111-111111111101','jewelry','chain_length',        '40cm / 45cm',         9);

-- Jewelry 2: Eternal Ring
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111102','jewelry','material',            '925 Sterling Silver', 0),
  ('11111111-1111-1111-1111-111111111102','jewelry','metal_color',         'Silver',              1),
  ('11111111-1111-1111-1111-111111111102','jewelry','stone_type',          'Moissanite',          2),
  ('11111111-1111-1111-1111-111111111102','jewelry','carat',               '0.5',                 3),
  ('11111111-1111-1111-1111-111111111102','jewelry','stone_color',         'D Color',             4),
  ('11111111-1111-1111-1111-111111111102','jewelry','stone_clarity',       'VVS1',                5),
  ('11111111-1111-1111-1111-111111111102','jewelry','moissanite_hardness', '9.25',                6),
  ('11111111-1111-1111-1111-111111111102','jewelry','moissanite_ri',       '2.65-2.69',           7),
  ('11111111-1111-1111-1111-111111111102','jewelry','setting',             'Pavé',                8),
  ('11111111-1111-1111-1111-111111111102','jewelry','ring_size',           '7〜15号',             9);

-- Jewelry 3: Tennis Bracelet
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111103','jewelry','material',            '925 Sterling Silver', 0),
  ('11111111-1111-1111-1111-111111111103','jewelry','metal_color',         'Silver',              1),
  ('11111111-1111-1111-1111-111111111103','jewelry','stone_type',          'Moissanite',          2),
  ('11111111-1111-1111-1111-111111111103','jewelry','carat',               '5.0',                 3),
  ('11111111-1111-1111-1111-111111111103','jewelry','stone_color',         'D Color',             4),
  ('11111111-1111-1111-1111-111111111103','jewelry','stone_clarity',       'VVS1',                5),
  ('11111111-1111-1111-1111-111111111103','jewelry','moissanite_hardness', '9.25',                6),
  ('11111111-1111-1111-1111-111111111103','jewelry','moissanite_ri',       '2.65-2.69',           7),
  ('11111111-1111-1111-1111-111111111103','jewelry','chain_length',        '16cm / 18cm',         8);

-- Apparel 1: Signature Tee
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('22222222-2222-2222-2222-222222222201','apparel','material',          '100% Cotton, 400g/m²', 0),
  ('22222222-2222-2222-2222-222222222201','apparel','fit',               'Oversized',             1),
  ('22222222-2222-2222-2222-222222222201','apparel','print_method',      'Screen Print',          2),
  ('22222222-2222-2222-2222-222222222201','apparel','country_of_origin', 'Japan',                 3),
  ('22222222-2222-2222-2222-222222222201','apparel','size_s_length',     '68',                    4),
  ('22222222-2222-2222-2222-222222222201','apparel','size_s_width',      '52',                    5),
  ('22222222-2222-2222-2222-222222222201','apparel','size_m_length',     '72',                    6),
  ('22222222-2222-2222-2222-222222222201','apparel','size_m_width',      '55',                    7),
  ('22222222-2222-2222-2222-222222222201','apparel','size_l_length',     '75',                    8),
  ('22222222-2222-2222-2222-222222222201','apparel','size_l_width',      '58',                    9),
  ('22222222-2222-2222-2222-222222222201','apparel','size_xl_length',    '78',                   10),
  ('22222222-2222-2222-2222-222222222201','apparel','size_xl_width',     '62',                   11);

-- Apparel 2: Long Sleeve
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('22222222-2222-2222-2222-222222222202','apparel','material',          '100% Cotton, 380g/m²', 0),
  ('22222222-2222-2222-2222-222222222202','apparel','fit',               'Regular',              1),
  ('22222222-2222-2222-2222-222222222202','apparel','print_method',      'Screen Print',         2),
  ('22222222-2222-2222-2222-222222222202','apparel','country_of_origin', 'Japan',                3);

-- Apparel 3: Moissanite Tee
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('22222222-2222-2222-2222-222222222203','apparel','material',          '100% Cotton, 400g/m²',              0),
  ('22222222-2222-2222-2222-222222222203','apparel','fit',               'Oversized',                         1),
  ('22222222-2222-2222-2222-222222222203','apparel','print_method',      'Embroidery + Moissanite Embellishment', 2),
  ('22222222-2222-2222-2222-222222222203','apparel','country_of_origin', 'Japan',                             3);

-- Art 1: Neon City
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333301','art','medium',      'UV Acrylic Print on Aluminum', 0),
  ('33333333-3333-3333-3333-333333333301','art','edition',     'Limited 30',                   1),
  ('33333333-3333-3333-3333-333333333301','art','edition_total','30',                          2),
  ('33333333-3333-3333-3333-333333333301','art','signed',      'あり',                         3),
  ('33333333-3333-3333-3333-333333333301','art','framed',      'なし',                         4),
  ('33333333-3333-3333-3333-333333333301','art','certificate', 'あり',                         5);

-- Art 2: Hip Hop Rise
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333302','art','medium',      'UV Acrylic Print on Aluminum', 0),
  ('33333333-3333-3333-3333-333333333302','art','edition',     'Limited 20',                   1),
  ('33333333-3333-3333-3333-333333333302','art','edition_total','20',                          2),
  ('33333333-3333-3333-3333-333333333302','art','signed',      'あり',                         3),
  ('33333333-3333-3333-3333-333333333302','art','framed',      'なし',                         4),
  ('33333333-3333-3333-3333-333333333302','art','certificate', 'あり',                         5);

-- Art 3: Pop Culture 01
INSERT INTO product_specs (product_id, spec_type, spec_key, spec_value, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333303','art','medium',      'UV Acrylic Print',  0),
  ('33333333-3333-3333-3333-333333333303','art','edition',     'Open Edition',      1),
  ('33333333-3333-3333-3333-333333333303','art','signed',      'なし',              2),
  ('33333333-3333-3333-3333-333333333303','art','framed',      'なし',              3),
  ('33333333-3333-3333-3333-333333333303','art','certificate', 'なし',              4);
