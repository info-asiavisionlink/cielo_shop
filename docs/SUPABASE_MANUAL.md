# CIELO SHOP — Supabase 運用マニュアル

**対象者:** CIELO オーナー（非エンジニア）  
**最終更新:** 2026-06-17  
**前提:** Supabase Dashboard へのアクセス権がある状態

---

## はじめに — Supabase とは

Supabase は **CIELO SHOP の商品データベース**です。

ここに商品情報を登録することで、サイトに自動的に商品が表示されます。

```
あなたが Supabase に商品を登録
        ↓
CIELO SHOP に自動反映
        ↓
お客様が商品を見る
```

Supabase へのアクセス URL:
```
https://supabase.com/dashboard/project/bturaaafeetnfptpqwai
```

---

## 目次

1. [データベース全体構造](#1-データベース全体構造)
2. [products テーブル](#2-products-テーブル)
3. [product_images テーブル](#3-product_images-テーブル)
4. [product_variants テーブル](#4-product_variants-テーブル)
5. [tags / product_tags テーブル](#5-tags--product_tags-テーブル)
6. [商品登録の入力順序](#6-商品登録の入力順序)
7. [Jewelry 登録マニュアル](#7-jewelry-登録マニュアル)
8. [Apparel 登録マニュアル](#8-apparel-登録マニュアル)
9. [Art 登録マニュアル](#9-art-登録マニュアル)
10. [商品公開フロー](#10-商品公開フロー)
11. [商品削除フロー](#11-商品削除フロー)
12. [よくあるミス](#12-よくあるミス)
13. [CIELO 専用運用ルール](#13-cielo-専用運用ルール)
14. [新商品登録チェックリスト](#14-新商品登録チェックリスト)

---

## 1. データベース全体構造

### テーブル一覧（全5テーブル）

```
┌─────────────────────────────────────────────────────┐
│                     products                        │
│         （商品の基本情報をすべて管理する）              │
│                                                     │
│  id / slug / name / price / category / status など  │
└──────────────┬──────────────────────────────────────┘
               │
     ┌─────────┼─────────┬──────────────────┐
     ↓         ↓         ↓                  ↓
┌──────────┐ ┌───────────────┐ ┌───────────────────┐
│ product  │ │   product_    │ │   product_tags    │
│ _images  │ │   variants    │ │   （中間テーブル）   │
│          │ │               │ └────────┬──────────┘
│ 商品画像  │ │ サイズ/カラー  │          │
│ を管理   │ │ 等を管理      │          ↓
└──────────┘ └───────────────┘ ┌──────────────────┐
                                │       tags       │
                                │ （タグマスタ）     │
                                └──────────────────┘
```

### 各テーブルの役割

| テーブル名 | 役割 | たとえると |
|-----------|------|----------|
| **products** | 商品の基本情報 | 商品台帳 |
| **product_images** | 商品画像のURL一覧 | 写真アルバム |
| **product_variants** | サイズ・カラー・在庫数 | 商品バリエーション表 |
| **tags** | タグの一覧（マスタ） | タグの辞書 |
| **product_tags** | 商品とタグの紐づけ | 商品×タグの対応表 |

### テーブル間の関係

- 1つの商品（products）に対して → 複数の画像（product_images）がある
- 1つの商品（products）に対して → 複数のバリアント（product_variants）がある
- 1つの商品（products）に対して → 複数のタグ（product_tags 経由）をつけられる

> **ポイント:** 登録は必ず **products から始める**。他のテーブルはすべて products.id に紐づきます。

---

## 2. products テーブル

### テーブルの場所

```
Supabase Dashboard → Table Editor → products
```

### 全カラム解説

#### 基本情報

| カラム名 | 説明 | 必須 | 例 |
|---------|------|:---:|-----|
| `id` | 自動生成されるID（触らない） | 自動 | `11111111-...` |
| `slug` | URLに使う識別子 | ✅ | `cielo-solitaire-necklace` |
| `name` | 商品名（英語） | ✅ | `CIELO Solitaire Necklace` |
| `name_ja` | 商品名（日本語） | — | `シエロ ソリテール ネックレス` |
| `category` | カテゴリ（3択） | ✅ | `jewelry` / `apparel` / `art` |
| `subcategory` | サブカテゴリ | ✅ | `necklace` / `ring` / `tshirt` 等 |
| `price` | 価格（税込・円） | ✅ | `28600` |
| `description` | 商品説明（英語） | — | `A single moissanite...` |
| `description_ja` | 商品説明（日本語） | — | `中央に一粒のモアサナイト...` |
| `story` | ブランドコピー（英語） | — | `One stone. One statement.` |
| `story_ja` | ブランドコピー（日本語） | — | `一粒の石が、全てを語る。` |
| `status` | 公開状態（3択） | ✅ | `draft` / `active` / `archived` |
| `featured` | トップ表示するか | — | `true` / `false` |
| `stock_count` | 在庫数（合計） | ✅ | `15` |
| `attributes` | カテゴリ固有の詳細情報 | — | JSON形式（後述） |
| `seo_title` | SEO用タイトル | — | `CIELO Solitaire Necklace — ¥28,600` |
| `seo_description` | SEO用説明文 | — | `一粒のモアサナイトが放つ...` |
| `og_image_url` | SNS共有時の画像URL | — | Cloudinary の画像URL |

#### `slug`（スラッグ）のルール

URL に使われる識別子です。**世界で1つだけの値**にしてください。

```
✅ 正しい形式
cielo-solitaire-necklace
cielo-signature-tee
cielo-neon-city-v2

❌ 間違い
CIELO Solitaire Necklace  ← 大文字・スペース禁止
necklace                  ← 他と被る可能性がある短すぎる名前
cielo-solitaire-necklace  ← 既存と重複（エラーになる）
```

#### `category` の選択肢（3択固定）

```
jewelry   ← ジュエリー
apparel   ← アパレル
art       ← アート
```

#### `subcategory` の選択肢

| category | subcategory |
|---------|------------|
| `jewelry` | `necklace` / `ring` / `bracelet` / `pierce` / `moissanite_jewelry` |
| `apparel` | `tshirt` / `long_sleeve` / `moissanite_apparel` |
| `art` | `pop_culture` / `street_culture` / `hiphop` / `neon` / `original_character` |

#### `status` の選択肢

```
draft    ← 下書き（サイトに表示されない）
active   ← 公開中（サイトに表示される）
archived ← 販売終了（サイトに表示されない）
```

#### `attributes`（カテゴリ固有情報）の入力方法

`attributes` カラムは「JSON形式」という特殊な形式で入力します。
**カテゴリごとにコピー＆ペーストしてから値を変更**してください。

**Jewelry 用テンプレート:**
```json
{
  "material": "925 Sterling Silver",
  "metal_color": "Silver",
  "stone_type": "Moissanite",
  "stone_size_ct": "1.0",
  "stone_color": "D Color",
  "stone_clarity": "VVS1",
  "moissanite_hardness": "9.25",
  "moissanite_ri": "2.65-2.69",
  "setting": "Solitaire"
}
```

**Apparel 用テンプレート:**
```json
{
  "material": "100% Cotton, 400g/m²",
  "print_method": "Screen Print",
  "country_of_origin": "Japan"
}
```

**Art 用テンプレート（限定品）:**
```json
{
  "medium": "UV Acrylic Print on Aluminum",
  "edition": "Limited 30",
  "edition_total": 30,
  "signed": true,
  "framed": false,
  "certificate": true
}
```

**Art 用テンプレート（オープンエディション）:**
```json
{
  "medium": "UV Acrylic Print",
  "edition": "Open Edition",
  "edition_total": null,
  "signed": false,
  "framed": false,
  "certificate": false
}
```

---

## 3. product_images テーブル

### テーブルの場所

```
Supabase Dashboard → Table Editor → product_images
```

### 全カラム解説

| カラム名 | 説明 | 必須 | 例 |
|---------|------|:---:|-----|
| `id` | 自動生成（触らない） | 自動 | 自動 |
| `product_id` | どの商品の画像か | ✅ | `11111111-1111-...` |
| `image_url` | 画像のURL | ✅ | Cloudinary URL |
| `alt_text` | 画像の説明文（SEO用） | — | `CIELO Solitaire Necklace — メインビジュアル` |
| `sort_order` | 表示順（0が最初） | ✅ | `0` `1` `2` `3` `4` |
| `is_thumbnail` | サムネイルにするか | ✅ | `true`（1枚だけ） / `false` |

### 重要ルール

```
1商品につき、最低5枚の画像を登録する
is_thumbnail = true にできるのは1枚だけ（必ずsort_order=0の画像）
```

### Cloudinary への画像アップロード手順

1. `https://cloudinary.com` にログイン
2. **Media Library** を開く
3. フォルダ: `cielo_products/{商品のslug}/` を作成
4. ファイル名: `image_1.webp` `image_2.webp` ... `image_5.webp` でアップロード
5. 各画像の URL をコピーして `image_url` に貼り付ける

**画像URLの例:**
```
https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace/image_1.webp
https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace/image_2.webp
```

---

## 4. product_variants テーブル

### テーブルの場所

```
Supabase Dashboard → Table Editor → product_variants
```

### 全カラム解説

| カラム名 | 説明 | 必須 | 例 |
|---------|------|:---:|-----|
| `id` | 自動生成（触らない） | 自動 | 自動 |
| `product_id` | どの商品のバリアントか | ✅ | products の id |
| `sku` | 在庫管理コード（一意） | ✅ | `CL-TS-001-BLK-M` |
| `type` | バリアントの種類 | ✅ | `size` / `length` / `color_size` / `frame` |
| `label` | 表示ラベル（英語） | ✅ | `40cm` / `Black / M` / `With Frame` |
| `label_ja` | 表示ラベル（日本語） | — | `40cm` / `ブラック / M` / `フレームあり` |
| `stock_count` | この選択肢の在庫数 | ✅ | `8` |
| `price_modifier` | 追加料金（円） | ✅ | `0`（追加なし）/ `11000`（+¥11,000） |
| `sort_order` | 表示順（0が最初） | ✅ | `0` `1` `2` ... |

### SKU（在庫管理コード）の命名ルール

```
CL - {カテゴリコード} - {商品番号} - {バリアント}

カテゴリコード:
  NCK  = ネックレス
  RING = リング
  BRC  = ブレスレット
  PIER = ピアス
  TS   = Tシャツ
  LS   = ロングスリーブ
  MTS  = モアサナイトTシャツ
  NEO  = ネオンアート
  HH   = ヒップホップアート
  PC   = ポップカルチャーアート
  SC   = ストリートカルチャーアート
  OC   = オリジナルキャラクターアート

例:
  CL-NCK-001-40CM   ← ネックレス001番・40cmチェーン
  CL-RING-001-09    ← リング001番・9号
  CL-TS-001-BLK-M   ← Tシャツ001番・ブラック・Mサイズ
  CL-NEO-001-A3     ← ネオンアート001番・A3サイズ
```

### `type` の種類と使い方

| type | 使う商品 | label の例 |
|------|---------|-----------|
| `length` | ネックレス、ブレスレット | `40cm` / `45cm` |
| `size` | リング、アート | `7号` / `A3 (297×420mm)` |
| `color_size` | アパレル（色とサイズの組み合わせ） | `Black / M` |
| `frame` | アート（額装あり/なし） | `Without Frame` / `With Frame` |

---

## 5. tags / product_tags テーブル

### tags テーブル

```
Supabase Dashboard → Table Editor → tags
```

| カラム名 | 説明 | 例 |
|---------|------|-----|
| `id` | 自動生成 | 自動 |
| `name` | タグ名（英語・小文字） | `moissanite` / `street-luxury` |
| `name_ja` | タグ名（日本語） | `モアサナイト` / `ストリートラグジュアリー` |

#### 既存のタグ一覧

| id末尾 | name | name_ja |
|--------|------|---------|
| ...001 | moissanite | モアサナイト |
| ...002 | jewelry | ジュエリー |
| ...003 | necklace | ネックレス |
| ...004 | ring | リング |
| ...005 | bracelet | ブレスレット |
| ...006 | apparel | アパレル |
| ...007 | tshirt | Tシャツ |
| ...008 | art | アート |
| ...009 | neon | ネオン |
| ...010 | hiphop | ヒップホップ |
| ...011 | pop-culture | ポップカルチャー |
| ...012 | street-luxury | ストリートラグジュアリー |
| ...013 | featured | フィーチャード |
| ...014 | limited | リミテッド |
| ...015 | street-culture | ストリートカルチャー |

### product_tags テーブル（商品×タグの紐づけ）

```
Supabase Dashboard → Table Editor → product_tags
```

| カラム名 | 説明 | 例 |
|---------|------|-----|
| `product_id` | 商品のID | products テーブルから取得 |
| `tag_id` | タグのID | tags テーブルから取得 |

---

## 6. 商品登録の入力順序

**必ずこの順番で入力してください。**

```
STEP 1: products に商品情報を登録（status=draft）
     ↓
STEP 2: Cloudinary に画像をアップロード
     ↓
STEP 3: product_images に画像URLを登録（最低5枚）
     ↓
STEP 4: product_variants にサイズ・カラーを登録
     ↓
STEP 5: product_tags でタグを紐づける
     ↓
STEP 6: products の status を active に変更 → 公開完了
```

> ⚠️ **STEP 6 は最後に行ってください。** 画像も在庫もない状態でactiveにすると、お客様に壊れた商品ページが表示されます。

---

## 7. Jewelry 登録マニュアル

### 例: ネックレスを新規登録する

#### STEP 1: products テーブルに登録

Supabase Dashboard → Table Editor → products → **Insert row**

```sql
-- SQL Editor で実行する場合
INSERT INTO products (
  slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  'cielo-pendant-necklace-002',               -- slug（ユニーク）
  'CIELO Pendant Necklace 002',               -- name
  'シエロ ペンダント ネックレス 002',            -- name_ja
  'jewelry',                                  -- category（固定）
  'necklace',                                 -- subcategory
  32500,                                      -- price（税込）
  'The pendant that speaks without words.',   -- description（英）
  '言葉なく語るペンダント。',                    -- description_ja（日）
  'Silence is power. CIELO.',                 -- story（英コピー）
  '沈黙は力だ。CIELO。',                        -- story_ja（日コピー）
  'draft',                                    -- status（最初はdraft）
  false,                                      -- featured
  12,                                         -- stock_count
  '{
    "material": "925 Sterling Silver",
    "metal_color": "Silver",
    "stone_type": "Moissanite",
    "stone_size_ct": "0.8",
    "stone_color": "D Color",
    "stone_clarity": "VVS1",
    "moissanite_hardness": "9.25",
    "moissanite_ri": "2.65-2.69",
    "setting": "Bezel"
  }',
  'CIELO Pendant Necklace 002 — ¥32,500 | CIELO',
  'ベゼルセッティングのモアサナイトペンダント。¥32,500（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pendant-necklace-002/image_1.webp'
);
```

> **登録後に `id` をコピーしておく** → 次のステップで使います

#### STEP 2: Cloudinary に画像をアップロード

フォルダ: `cielo_products/cielo-pendant-necklace-002/`
ファイル名: `image_1.webp` ～ `image_5.webp`

#### STEP 3: product_images に登録

```sql
-- products.id を確認してから実行
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
  ('ここにproducts.idを貼り付ける', 'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pendant-necklace-002/image_1.webp', 'CIELO Pendant Necklace 002 — メインビジュアル', 0, true),
  ('ここにproducts.idを貼り付ける', 'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pendant-necklace-002/image_2.webp', 'CIELO Pendant Necklace 002 — 着用シーン', 1, false),
  ('ここにproducts.idを貼り付ける', 'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pendant-necklace-002/image_3.webp', 'CIELO Pendant Necklace 002 — クローズアップ', 2, false),
  ('ここにproducts.idを貼り付ける', 'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pendant-necklace-002/image_4.webp', 'CIELO Pendant Necklace 002 — サイドビュー', 3, false),
  ('ここにproducts.idを貼り付ける', 'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-pendant-necklace-002/image_5.webp', 'CIELO Pendant Necklace 002 — 光の反射', 4, false);
```

#### STEP 4: product_variants にチェーン長を登録

ネックレスは `type = 'length'` でチェーン長を登録します。

```sql
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('products.id', 'CL-NCK-002-40CM', 'length', '40cm', '40cm', 6, 0, 0),
  ('products.id', 'CL-NCK-002-45CM', 'length', '45cm', '45cm', 6, 0, 1);
```

#### STEP 5: タグを紐づける

```sql
-- まず tags テーブルから id を確認する
SELECT id, name FROM tags;

-- product_tags に挿入
INSERT INTO product_tags (product_id, tag_id) VALUES
  ('products.id', 'moissanite の tag_id'),
  ('products.id', 'jewelry の tag_id'),
  ('products.id', 'necklace の tag_id'),
  ('products.id', 'street-luxury の tag_id');
```

#### STEP 6: 公開する

```sql
UPDATE products
SET status = 'active'
WHERE slug = 'cielo-pendant-necklace-002';
```

---

### リング登録のポイント

リングは `type = 'size'` でリングサイズを登録します。

```sql
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('products.id', 'CL-RING-002-07', 'size', '7',  '7号',  3, 0, 0),
  ('products.id', 'CL-RING-002-09', 'size', '9',  '9号',  4, 0, 1),
  ('products.id', 'CL-RING-002-11', 'size', '11', '11号', 4, 0, 2),
  ('products.id', 'CL-RING-002-13', 'size', '13', '13号', 3, 0, 3),
  ('products.id', 'CL-RING-002-15', 'size', '15', '15号', 2, 0, 4),
  ('products.id', 'CL-RING-002-17', 'size', '17', '17号', 2, 0, 5);
```

### ブレスレット登録のポイント

```sql
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('products.id', 'CL-BRC-002-16CM', 'length', '16cm', '16cm', 5, 0, 0),
  ('products.id', 'CL-BRC-002-18CM', 'length', '18cm', '18cm', 5, 0, 1);
```

---

## 8. Apparel 登録マニュアル

### アパレルのポイント

アパレルは **カラーとサイズを組み合わせた1行**として登録します。

```
❌ 間違い: カラー行とサイズ行を別々に作る
✅ 正しい: 「Black / M」のように組み合わせで1行にする
```

#### STEP 1: products テーブルに登録

```sql
INSERT INTO products (
  slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  'cielo-graphic-tee-002',
  'CIELO Graphic Tee 002',
  'シエロ グラフィック Tシャツ 002',
  'apparel',
  'tshirt',
  11000,
  'CIELO original graphic. Heavyweight cotton.',
  'CIELOオリジナルグラフィック。ヘビーウェイトコットン。',
  'The graphic speaks. You listen.',
  'グラフィックが語る。あなたが聴く。',
  'draft',
  false,
  40,
  '{
    "material": "100% Cotton, 400g/m²",
    "print_method": "Screen Print",
    "country_of_origin": "Japan"
  }',
  'CIELO Graphic Tee 002 — ¥11,000 | CIELO',
  'CIELOオリジナルグラフィックTシャツ。¥11,000（税込）',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-graphic-tee-002/image_1.webp'
);
```

#### STEP 4: product_variants に色×サイズを登録

`type = 'color_size'`、`label = 'カラー / サイズ'` の形式で登録します。

```sql
-- カラーコード: BLK=Black, WHT=White, NVY=Navy, GRY=Gray
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('products.id', 'CL-TS-002-BLK-S',   'color_size', 'Black / S',   'ブラック / S',   8,  0, 0),
  ('products.id', 'CL-TS-002-BLK-M',   'color_size', 'Black / M',   'ブラック / M',   10, 0, 1),
  ('products.id', 'CL-TS-002-BLK-L',   'color_size', 'Black / L',   'ブラック / L',   10, 0, 2),
  ('products.id', 'CL-TS-002-BLK-XL',  'color_size', 'Black / XL',  'ブラック / XL',  6,  0, 3),
  ('products.id', 'CL-TS-002-BLK-XXL', 'color_size', 'Black / XXL', 'ブラック / XXL', 2,  0, 4),
  ('products.id', 'CL-TS-002-WHT-S',   'color_size', 'White / S',   'ホワイト / S',   6,  0, 5),
  ('products.id', 'CL-TS-002-WHT-M',   'color_size', 'White / M',   'ホワイト / M',   8,  0, 6),
  ('products.id', 'CL-TS-002-WHT-L',   'color_size', 'White / L',   'ホワイト / L',   6,  0, 7),
  ('products.id', 'CL-TS-002-WHT-XL',  'color_size', 'White / XL',  'ホワイト / XL',  4,  0, 8);
```

#### タグ

```sql
INSERT INTO product_tags (product_id, tag_id) VALUES
  ('products.id', 'apparel の tag_id'),
  ('products.id', 'tshirt の tag_id'),
  ('products.id', 'street-luxury の tag_id');
```

---

## 9. Art 登録マニュアル

### アートのポイント

アートは **サイズ（size）** と **額装（frame）** の2種類のバリアントを登録します。  
サイズによって価格が変わる場合は `price_modifier` に追加料金を入力します。

#### STEP 1: products テーブルに登録（限定品の例）

```sql
INSERT INTO products (
  slug, name, name_ja, category, subcategory,
  price, description, description_ja, story, story_ja,
  status, featured, stock_count, attributes,
  seo_title, seo_description, og_image_url
) VALUES (
  'cielo-street-culture-002',
  'CIELO Street Culture 002',
  'シエロ ストリートカルチャー 002',
  'art',
  'street_culture',
  66000,                              -- A2サイズの基本価格
  'The street speaks. The wall listens.',
  'ストリートが語る。壁が聴く。',
  'Culture is not a trend. CIELO.',
  'カルチャーはトレンドじゃない。CIELO。',
  'draft',
  false,
  25,
  '{
    "medium": "UV Acrylic Print on Aluminum",
    "edition": "Limited 25",
    "edition_total": 25,
    "signed": true,
    "framed": false,
    "certificate": true
  }',
  'CIELO Street Culture 002 — ¥66,000〜 | CIELO Art',
  'ストリートカルチャーアート。25枚限定。¥66,000（税込）〜',
  'https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-street-culture-002/image_1.webp'
);
```

#### STEP 4a: サイズバリアントを登録

基本価格を最小サイズ（A3）に設定し、大きいサイズは `price_modifier` で追加料金を設定します。

```sql
-- price_modifier = 0 なら基本価格のまま
-- price_modifier = 22000 なら +¥22,000
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('products.id', 'CL-SC-002-A3', 'size', 'A3 (297×420mm)', 'A3（297×420mm）', 10, 0,     0),
  ('products.id', 'CL-SC-002-A2', 'size', 'A2 (420×594mm)', 'A2（420×594mm）', 10, 22000, 1),
  ('products.id', 'CL-SC-002-A1', 'size', 'A1 (594×841mm)', 'A1（594×841mm）', 5,  44000, 2);
```

#### STEP 4b: 額装バリアントを登録

```sql
INSERT INTO product_variants (product_id, sku, type, label, label_ja, stock_count, price_modifier, sort_order) VALUES
  ('products.id', 'CL-SC-002-NOFRM', 'frame', 'Without Frame', 'フレームなし', 20, 0,     0),
  ('products.id', 'CL-SC-002-FRM',   'frame', 'With Frame',    'フレームあり',  5, 13200, 1);
```

#### タグ

```sql
INSERT INTO product_tags (product_id, tag_id) VALUES
  ('products.id', 'art の tag_id'),
  ('products.id', 'street-culture の tag_id'),
  ('products.id', 'street-luxury の tag_id'),
  ('products.id', 'limited の tag_id');
```

---

## 10. 商品公開フロー

### 全体の流れ

```
【下書き状態】
  status = 'draft'
  → サイトに表示されない
  → 安心して準備できる

      ↓ 全準備完了後に実行

【公開状態】
  status = 'active'
  → CIELO SHOP に即座に表示される
  → お客様に見える

      ↓ 販売終了時

【アーカイブ状態】
  status = 'archived'
  → サイトに表示されない
  → データは残る（売上履歴のため）
```

### 公開コマンド（SQL）

```sql
-- 公開する（draft → active）
UPDATE products
SET status = 'active'
WHERE slug = '商品のslugを入力';

-- 確認する
SELECT slug, name, status FROM products WHERE slug = '商品のslugを入力';
```

### 公開前チェック（必ず確認）

```sql
-- この商品に何枚画像があるか確認
SELECT COUNT(*) as image_count FROM product_images WHERE product_id = '商品のid';
-- → 5以上であること

-- サムネイルが設定されているか確認
SELECT COUNT(*) as thumb_count FROM product_images WHERE product_id = '商品のid' AND is_thumbnail = true;
-- → 1 であること

-- バリアントが設定されているか確認
SELECT COUNT(*) as variant_count FROM product_variants WHERE product_id = '商品のid';
-- → 1以上であること

-- タグが設定されているか確認
SELECT COUNT(*) as tag_count FROM product_tags WHERE product_id = '商品のid';
-- → 1以上であること
```

### featured（トップ掲載）の設定

トップページのおすすめ商品として表示したい場合:

```sql
UPDATE products
SET featured = true
WHERE slug = '商品のslug';
```

---

## 11. 商品削除フロー

### 推奨: アーカイブ（データを残す）

販売終了しても **データは削除しない** ことを強く推奨します。  
将来の再販・売上履歴管理のため、アーカイブにしてください。

```sql
-- 販売終了（おすすめ）
UPDATE products
SET status = 'archived'
WHERE slug = '商品のslug';
```

### 本当に削除したい場合

> ⚠️ **警告:** 削除すると元に戻せません。画像・バリアント・タグもすべて消えます。

```sql
-- 削除（ON DELETE CASCADE により関連データも自動削除）
DELETE FROM products WHERE slug = '商品のslug';
```

### 一時的に非表示にする場合（在庫切れ等）

```sql
-- draft に戻す（いつでも再公開できる）
UPDATE products
SET status = 'draft'
WHERE slug = '商品のslug';
```

---

## 12. よくあるミス

### ❌ ミス 1: 画像を登録したが is_thumbnail を設定し忘れた

**症状:** 商品一覧に画像が表示されない

**確認方法:**
```sql
SELECT * FROM product_images WHERE product_id = '商品のid' AND is_thumbnail = true;
-- → 0件なら設定忘れ
```

**修正方法:**
```sql
-- sort_order=0 の画像をサムネイルにする
UPDATE product_images
SET is_thumbnail = true
WHERE product_id = '商品のid' AND sort_order = 0;
```

---

### ❌ ミス 2: slug が重複している

**症状:** SQL 実行時にエラーが出る（`unique constraint` というメッセージ）

**原因:** 既存の slug と同じ名前を使おうとした

**確認方法:**
```sql
SELECT slug FROM products WHERE slug = '確認したいslug';
-- → 結果が出れば既存のslugと重複
```

**解決策:** slug の末尾に `-v2` や `-002` などを付ける
```
cielo-solitaire-necklace-v2
cielo-eternal-ring-gold
```

---

### ❌ ミス 3: バリアントを登録し忘れた

**症状:** 商品詳細ページにサイズ・カラー選択肢が表示されない

**確認方法:**
```sql
SELECT * FROM product_variants WHERE product_id = '商品のid';
-- → 0件なら登録忘れ
```

---

### ❌ ミス 4: タグを設定し忘れた

**症状:** タグフィルターで商品が見つからない

**確認方法:**
```sql
SELECT * FROM product_tags WHERE product_id = '商品のid';
-- → 0件なら設定忘れ
```

---

### ❌ ミス 5: draft のまま公開を忘れた

**症状:** 商品を登録したのにサイトに表示されない

**確認方法:**
```sql
SELECT slug, name, status FROM products ORDER BY created_at DESC LIMIT 10;
-- → status が 'draft' になっていないか確認
```

---

### ❌ ミス 6: Apparel のバリアントをカラーと サイズ別々の行にした

**症状:** サイズを選ぶとカラーが消える、または在庫が正しく管理できない

**正しい形式:**
```
✅ label = 'Black / M'   （type = 'color_size'）
❌ label = 'Black'       （type = 'color'）+ label = 'M'（type = 'size'）別行
```

---

### ❌ ミス 7: Art の price_modifier を間違えた

**症状:** A2 サイズを選んだら価格が変わらない（または間違った金額になる）

**確認方法:**
```sql
SELECT label, price_modifier FROM product_variants WHERE product_id = '商品のid' AND type = 'size';
```

**注意:** `price_modifier` は **追加料金**です。基本価格ではありません。
```
基本価格（products.price）: ¥55,000
price_modifier（A2の場合）: ¥11,000
→ A2 の合計価格: ¥66,000
```

---

## 13. CIELO 専用運用ルール

### ブランドトーン（コピー記入時の注意）

| ❌ 使わない | ✅ 使う |
|-----------|--------|
| 「お得な価格で」 | 「¥14,300から始まる、本物の所有。」 |
| 「リーズナブル」 | 「CIELO だけが持つ光。」 |
| 「上品な輝き」 | 「誰もが振り向く光。」 |
| 「高品質をご提供」 | 「選ばれた石。着ける理由がある。」 |
| コスパ / お得 / プチプラ | 使用禁止 |

---

### Jewelry 専用ルール

| 項目 | ルール |
|------|-------|
| 価格帯 | ¥14,300〜（税込） |
| 素材 | 必ず `925 Sterling Silver` を記載 |
| ストーン | 必ず `Moissanite` を記載 |
| モアサナイト情報 | `moissanite_hardness: "9.25"` `moissanite_ri: "2.65-2.69"` を必ず入力 |
| タグ | `moissanite` と `jewelry` と該当カテゴリタグは必須 |
| 画像必須枚数 | 5枚（メイン/着用/クローズアップ/サイド/光の反射） |

---

### Apparel 専用ルール

| 項目 | ルール |
|------|-------|
| 価格帯 | ¥8,800〜（税込） |
| 素材 | 必ず記載（例: `100% Cotton, 400g/m²`） |
| バリアント形式 | `color_size`（「Black / M」形式） |
| SKU形式 | `CL-{カテゴリコード}-{番号}-{色3文字}-{サイズ}` |
| タグ | `apparel` と該当カテゴリタグは必須 |

---

### Art 専用ルール

| 項目 | ルール |
|------|-------|
| 価格帯 | ¥30,000〜¥300,000（税込） |
| サイズバリアント | 必ず登録（A3/A2/A1 または カスタムサイズ） |
| 額装バリアント | 必ず登録（With Frame / Without Frame） |
| エディション | `Limited XX` または `Open Edition` を明記 |
| 署名あり | `"signed": true` の場合、真正証明書も `"certificate": true` にする |
| タグ | `art` と該当カテゴリタグは必須 |

---

### products.id の確認方法

新規登録後の id は、SQL Editor で以下を実行して確認します。

```sql
SELECT id, slug, name, created_at
FROM products
ORDER BY created_at DESC
LIMIT 5;
```

最新の商品が一番上に表示されます。`id` の値（`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 形式）をコピーして使ってください。

---

### tags テーブルの id 確認方法

```sql
SELECT id, name, name_ja FROM tags ORDER BY name;
```

---

## 14. 新商品登録チェックリスト

### 事前準備

- [ ] 商品名（英・日）が決まっている
- [ ] 価格（税込）が決まっている
- [ ] 商品説明文（英・日）が書けている
- [ ] ブランドコピー（英・日）が書けている
- [ ] 高品質画像 5枚以上が手元にある（webp 推奨・800×800px 以上）
- [ ] Cloudinary にアクセスできる状態になっている

---

### STEP 1: products 登録

- [ ] `slug` がユニーク（既存と被らない）であることを確認した
- [ ] `category` を正しく選んだ（jewelry / apparel / art）
- [ ] `subcategory` を正しく入力した
- [ ] `price` を税込の整数で入力した
- [ ] `description` と `description_ja` を入力した
- [ ] `story` と `story_ja` を入力した
- [ ] `status = 'draft'` で登録した（いきなり active にしない）
- [ ] `stock_count` を入力した
- [ ] `attributes` にカテゴリ用テンプレートをコピー＆ペーストし、値を変更した
- [ ] `seo_title` / `seo_description` を入力した
- [ ] 登録後に `id` をコピーしてメモした

---

### STEP 2: 画像アップロード

- [ ] Cloudinary に `cielo_products/{slug}/` フォルダを作成した
- [ ] `image_1.webp` ～ `image_5.webp` をアップロードした（最低5枚）
- [ ] 各画像の URL をコピーした

---

### STEP 3: product_images 登録

- [ ] 5枚分の画像を登録した
- [ ] `sort_order` が `0` `1` `2` `3` `4` と正しい順番になっている
- [ ] `is_thumbnail = true` が1枚だけ設定されている（sort_order=0 の画像）
- [ ] `alt_text` を入力した
- [ ] `og_image_url`（products テーブル）を image_1 の URL で更新した

---

### STEP 4: product_variants 登録（カテゴリ別）

**Jewelry（ネックレス / ブレスレット）**
- [ ] `type = 'length'` でチェーン長を登録した（40cm / 45cm 等）
- [ ] SKU を `CL-NCK-{番号}-{長さ}` の形式で入力した
- [ ] 各バリアントの `stock_count` を入力した

**Jewelry（リング）**
- [ ] `type = 'size'` でリングサイズを登録した
- [ ] 号数（7〜20 の範囲で取り扱うサイズ）を入力した
- [ ] SKU を `CL-RING-{番号}-{号数2桁}` の形式で入力した

**Apparel**
- [ ] `type = 'color_size'` で「Black / M」形式のバリアントを登録した
- [ ] 全カラー × 全サイズの組み合わせを登録した
- [ ] SKU を `CL-{カテゴリ}-{番号}-{色}-{サイズ}` の形式で入力した
- [ ] 在庫なし（0）のサイズも行を作成した（sold-out 表示のため）

**Art**
- [ ] `type = 'size'` でサイズバリアントを登録した（A3 / A2 / A1 等）
- [ ] A3 以外は `price_modifier` に追加料金を入力した
- [ ] `type = 'frame'` で額装バリアントを登録した（Without Frame / With Frame）
- [ ] 額装ありは `price_modifier` に追加料金を入力した

---

### STEP 5: タグ登録

- [ ] `tags` テーブルから該当タグの `id` を確認した
- [ ] `product_tags` に最低2つ以上のタグを登録した
- [ ] カテゴリ共通タグ（`jewelry` / `apparel` / `art`）を入れた
- [ ] `street-luxury` タグを入れた
- [ ] 必要に応じて `featured` や `limited` タグを入れた

---

### STEP 6: 公開前確認

```sql
-- 以下を実行してすべて正しいか確認
SELECT
  p.slug,
  p.name,
  p.status,
  p.price,
  (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id) AS image_count,
  (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id AND pi.is_thumbnail = true) AS thumb_count,
  (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) AS variant_count,
  (SELECT COUNT(*) FROM product_tags pt WHERE pt.product_id = p.id) AS tag_count
FROM products p
WHERE p.slug = '登録したslugを入力';
```

**合格基準:**

| 項目 | 期待値 |
|------|-------|
| image_count | 5以上 |
| thumb_count | 1（ちょうど1枚） |
| variant_count | 1以上 |
| tag_count | 2以上 |

---

### STEP 7: 公開

- [ ] 上記の確認クエリで全項目が合格した
- [ ] ブランドコピーが CIELO トーン（強く・簡潔）になっている
- [ ] 禁止ワード（コスパ / お得 / リーズナブル）を使っていない
- [ ] 以下のコマンドで公開した

```sql
UPDATE products SET status = 'active' WHERE slug = '商品のslug';
```

- [ ] CIELO SHOP のブラウザをリロードして商品が表示されることを確認した

---

*© CIELO / ASIA VISION LINK — このマニュアルは CIELO SHOP 専用です*
