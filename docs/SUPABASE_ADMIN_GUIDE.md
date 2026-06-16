# CIELO SHOP — Supabase Table Editor 運用ガイド

**対象者:** CIELO オーナー（SQL不要・GUI操作のみ）  
**最終更新:** 2026-06-17  
**このガイドの特徴:** SQL は一切使いません。マウス操作だけで全作業できます。

---

## はじめに

このガイドは **Supabase の Table Editor（画面操作）だけで商品を管理する方法**をまとめたものです。

コードや SQL を書く必要はありません。すべてブラウザ上の画面操作で完結します。

**Supabase 管理画面 URL:**
```
https://supabase.com/dashboard/project/bturaaafeetnfptpqwai
```

---

## 目次

1. [Supabase 管理画面の見方](#1-supabase-管理画面の見方)
2. [Table Editor の基本操作](#2-table-editor-の基本操作)
3. [新商品を登録する（products）](#3-新商品を登録するproducts)
4. [商品画像を登録する（product_images）](#4-商品画像を登録するproduct_images)
5. [バリアントを登録する（product_variants）](#5-バリアントを登録するproduct_variants)
6. [タグを紐づける（product_tags）](#6-タグを紐づけるproduct_tags)
7. [商品を公開する](#7-商品を公開する)
8. [日常の修正操作](#8-日常の修正操作)
9. [操作トラブル対処法](#9-操作トラブル対処法)

---

## 1. Supabase 管理画面の見方

### ログイン手順

1. ブラウザで `https://supabase.com` を開く
2. 右上の **Sign In** をクリック
3. メールアドレスとパスワードでログイン
4. 上部ナビゲーションから **Dashboard** を選択
5. プロジェクト一覧から **CIELO_SHOP（bturaaafeetnfptpqwai）** をクリック

---

### 管理画面の左側メニュー（サイドバー）

ログイン後、画面左側にメニューが並んでいます。それぞれの役割は以下のとおりです。

---

#### 🗂 Table Editor（テーブルエディター）

**→ 商品管理はここを使います**

データベースの内容をスプレッドシートのように見て、直接編集できる画面です。
商品の追加・修正・削除はすべてここで行います。

```
左サイドバー → Table Editor アイコン（表のようなアイコン）をクリック
```

---

#### 💻 SQL Editor（SQLエディター）

コードを書いてデータを操作する画面です。  
**このガイドでは使いません。** エンジニアが複雑な操作をするときに使う場所です。

---

#### 📦 Storage（ストレージ）

画像や動画ファイルを直接 Supabase に保存する場所です。  
CIELO SHOP では画像は **Cloudinary** を使っているため、ここは通常使いません。

---

#### 👤 Authentication（認証）

ユーザーのログイン管理を行う場所です。  
現在の CIELO SHOP では顧客ログイン機能がないため、ここは使いません。

---

### Table Editor の画面構成

Table Editor を開くと、以下の構成が表示されます。

```
┌─────────────────────────────────────────────────────────────┐
│ 上部: テーブル操作ボタン                                       │
│ [+ Insert row] [Edit] [Delete] [Filter] [Sort]              │
├────────────┬────────────────────────────────────────────────┤
│            │ id | slug | name | price | status | ...        │
│ テーブル    ├────────────────────────────────────────────────┤
│ 一覧       │ 行1のデータ                                      │
│            │ 行2のデータ                                      │
│ products   │ 行3のデータ                                      │
│ product_   │ ...                                            │
│ images     │                                                │
│ ...        │                                                │
└────────────┴────────────────────────────────────────────────┘
```

**左パネル:** テーブル（表）の一覧。クリックして切り替えます  
**右パネル:** 選択したテーブルのデータが行と列で表示されます  
**上部ボタン:** データの追加・編集・削除などの操作ボタン

---

## 2. Table Editor の基本操作

### 行を追加する（Insert Row）

1. 左パネルで対象のテーブルをクリック（例: `products`）
2. 上部の **「＋ Insert row」** ボタンをクリック
3. 右側にパネルが開く
4. 各カラム（項目）に値を入力
5. 下部の **「Save」** ボタンをクリック → 保存完了

---

### 行を編集する（Edit Row）

**方法A: セルを直接ダブルクリック**
1. 編集したいセル（マス目）をダブルクリック
2. テキスト入力できる状態になる
3. 値を修正して **Enter** キーを押す → 即座に保存

**方法B: 行全体を選択して編集**
1. 編集したい行の左端にある **小さな四角**（チェックボックス）をクリックして行を選択
2. 上部の **「Edit」** ボタンをクリック
3. 右側に編集パネルが開く
4. 修正したい項目を変更
5. **「Save」** ボタンをクリック

---

### 行を削除する（Delete Row）

> ⚠️ 削除は元に戻せません。アーカイブを推奨します（後述）。

1. 削除したい行の左端のチェックボックスをクリックして選択
2. 上部の **「Delete」** ボタン（赤いゴミ箱アイコン）をクリック
3. 確認ダイアログが出るので **「Confirm」** をクリック → 削除完了

---

### 行を検索・絞り込む（Filter）

特定の商品だけを探したい場合:

1. 上部の **「Filter」** ボタンをクリック
2. **「＋ Add filter」** をクリック
3. カラム名を選択（例: `slug`）
4. 条件を選択（例: `contains`）
5. 値を入力（例: `necklace`）
6. **「Apply」** をクリック → 該当する行だけが表示される

フィルターを解除するには: Filter パネルの **「Clear all」** をクリック

---

### product_id をコピーする方法

product_images や product_variants を登録する際、products テーブルの `id` が必要です。

1. 左パネルで **「products」** をクリック
2. 対象の商品の行を見つける
3. `id` 列のセルをクリック
4. セルに表示されている UUID 全体（`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）を選択してコピー

> **コツ:** `slug` カラムでフィルターすると商品を素早く見つけられます。

---

## 3. 新商品を登録する（products）

### 全カテゴリ共通の手順

#### 画面へのアクセス

```
Table Editor → 左パネル「products」をクリック
```

#### Insert Row の手順

**① 「＋ Insert row」ボタンをクリック**

右側にフォームパネルが開きます。上から順番に入力していきます。

---

**② 各項目を入力する**

> 灰色の `id` `created_at` `updated_at` は **自動入力されるため触らない**

---

**`slug`（必須）**

URLに使われる識別子です。**小文字・ハイフンのみ**使えます。

```
入力例:
  cielo-solitaire-necklace-002
  cielo-graphic-tee-003
  cielo-neon-city-002
```

入力欄: テキスト入力  
ルール: 他の商品と被らないユニークな値

---

**`name`（必須）**

商品名（英語）です。

```
入力例:
  CIELO Solitaire Necklace 002
  CIELO Graphic Tee 003
  CIELO Neon City 002
```

---

**`name_ja`（任意）**

商品名（日本語）です。

```
入力例:
  シエロ ソリテール ネックレス 002
  シエロ グラフィック Tシャツ 003
  シエロ ネオン シティ 002
```

---

**`category`（必須）**

ドロップダウンから選択します。

```
jewelry  ← ジュエリー
apparel  ← アパレル
art      ← アート
```

> **注意:** 手入力する場合は **小文字のみ**。`Jewelry` は間違い。

---

**`subcategory`（必須）**

カテゴリに応じて入力します。

```
jewelry の場合:
  necklace / ring / bracelet / pierce / moissanite_jewelry

apparel の場合:
  tshirt / long_sleeve / moissanite_apparel

art の場合:
  pop_culture / street_culture / hiphop / neon / original_character
```

---

**`price`（必須）**

税込価格を**半角数字のみ**で入力します。

```
入力例:
  28600   ← ¥28,600（税込）
  11000   ← ¥11,000（税込）
  55000   ← ¥55,000（税込）
```

> **注意:** ¥マークやカンマは入力しない。数字だけを入力してください。

---

**`description`（任意）**

商品説明（英語）。1〜3文で。

```
入力例:
  A single moissanite at the center. The light you deserve.
```

---

**`description_ja`（任意）**

商品説明（日本語）。1〜3文で。

```
入力例:
  中央に一粒のモアサナイト。あなたに相応しい輝き。
```

---

**`story`（任意）**

ブランドコピー（英語）。短く強い言葉で。

```
入力例:
  One stone. One statement. CIELO.
```

---

**`story_ja`（任意）**

ブランドコピー（日本語）。

```
入力例:
  一粒の石が、全てを語る。
```

---

**`status`（必須）**

最初は必ず **`draft`** を入力します。

```
draft    ← 最初はこれ（サイトに表示されない）
active   ← 公開するときに変更する
archived ← 販売終了したとき
```

> **重要:** 画像やバリアントを登録し終わるまで `draft` のままにしてください。

---

**`featured`（任意）**

トップページのおすすめ欄に表示するかどうかです。

```
true  ← トップページに表示する
false ← 通常の商品ページのみ
```

トグルスイッチをクリックして切り替えます。

---

**`stock_count`（必須）**

在庫数の合計を半角数字で入力します。

```
入力例:
  15   ← 15個在庫がある
  0    ← 在庫なし（SOLD OUT表示）
```

---

**`attributes`（任意・重要）**

カテゴリによって入力内容が異なります。  
JSON形式で入力します。**以下のテンプレートをそのままコピーして貼り付け**、値だけ変更してください。

入力欄をクリックすると、テキストエリアが表示されます。そこにコピー＆ペーストします。

**Jewelry（ジュエリー）用:**
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

> `setting` の値: `Solitaire`（一粒） / `Pavé`（パヴェ） / `Bezel`（ベゼル） / `Eternity`（エタニティ）

**Apparel（アパレル）用:**
```json
{
  "material": "100% Cotton, 400g/m²",
  "print_method": "Screen Print",
  "country_of_origin": "Japan"
}
```

**Art（アート）用 — 限定品:**
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

**Art（アート）用 — オープンエディション:**
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

**`seo_title`（任意）**

Googleで表示されるタイトルです。

```
入力例:
  CIELO Solitaire Necklace — ¥28,600 | CIELO
```

---

**`seo_description`（任意）**

Googleの検索結果に表示される説明文（80文字以内推奨）。

```
入力例:
  一粒のモアサナイトが放つ圧倒的な存在感。¥28,600（税込）
```

---

**`og_image_url`（任意）**

LINEやInstagramでシェアされたときに表示される画像のURLです。  
**画像を Cloudinary にアップロードしてから**貼り付けます。

```
入力例:
  https://res.cloudinary.com/deyc8gz2k/image/upload/cielo_products/cielo-solitaire-necklace-002/image_1.webp
```

---

**③ 「Save」をクリック**

フォームの一番下にある **「Save」** ボタンをクリックします。  
成功すると、テーブルに新しい行が追加されます。

**④ id をコピーしておく**

登録が完了したら、追加された行の `id` カラムをクリックしてコピーします。  
次のステップ（画像・バリアント登録）で使います。

---

## 4. 商品画像を登録する（product_images）

### 事前準備: Cloudinary に画像をアップロードする

1. `https://cloudinary.com` にログイン
2. **Media Library** を開く
3. 左上の **「＋ Upload」** ボタンをクリック
4. 画像ファイルを選択してアップロード
5. アップロード後、画像をクリックすると右側に **URL** が表示される
6. URL をコピーしておく

**フォルダ構造のルール:**

Cloudinary のフォルダは以下の形式で作成してください。

```
cielo_products/
└── {商品のslug}/
    ├── image_1.webp   ← メインビジュアル（サムネイルにする）
    ├── image_2.webp   ← 着用シーン
    ├── image_3.webp   ← クローズアップ
    ├── image_4.webp   ← サイドビュー
    └── image_5.webp   ← 光の反射 / 空間設置
```

**例:**
```
cielo_products/cielo-solitaire-necklace-002/image_1.webp
cielo_products/cielo-solitaire-necklace-002/image_2.webp
...
```

---

### product_images テーブルに登録する手順

5枚の画像を1枚ずつ登録します。

#### 1枚目（サムネイル）の登録

```
Table Editor → 左パネル「product_images」をクリック → 「＋ Insert row」
```

**各項目の入力:**

| 項目 | 入力内容 | 説明 |
|------|---------|------|
| `product_id` | 先ほどコピーした products の `id` | どの商品の画像か |
| `image_url` | Cloudinary の image_1.webp の URL | 画像のURL |
| `alt_text` | `CIELO 商品名 — メインビジュアル` | 画像の説明（SEO用） |
| `sort_order` | `0` | 1番目に表示 |
| `is_thumbnail` | `true`（トグルをオンにする） | サムネイルにする |

**「Save」をクリック**

---

#### 2〜5枚目の登録

2枚目以降は `is_thumbnail` を **必ず `false`** にします。

| 枚数 | `image_url` | `alt_text` | `sort_order` | `is_thumbnail` |
|------|------------|-----------|:-----------:|:-----------:|
| 1枚目 | image_1.webp のURL | 商品名 — メインビジュアル | `0` | `true` |
| 2枚目 | image_2.webp のURL | 商品名 — 着用シーン | `1` | `false` |
| 3枚目 | image_3.webp のURL | 商品名 — クローズアップ | `2` | `false` |
| 4枚目 | image_4.webp のURL | 商品名 — サイドビュー | `3` | `false` |
| 5枚目 | image_5.webp のURL | 商品名 — 光の反射 | `4` | `false` |

各枚数で **「＋ Insert row」→ 入力 → 「Save」** を繰り返します。

---

### 画像が正しく登録されたか確認する

1. `product_images` テーブルを開く
2. 上部の **「Filter」** をクリック
3. `product_id` = `（先ほどの商品のid）` でフィルターする
4. 5行表示されていることを確認
5. `is_thumbnail = true` の行が **1行だけ** あることを確認

---

## 5. バリアントを登録する（product_variants）

### product_variants テーブルへのアクセス

```
Table Editor → 左パネル「product_variants」をクリック → 「＋ Insert row」
```

### 全カラムの入力ガイド

| カラム | 入力内容 | 必須 |
|-------|---------|:---:|
| `product_id` | 商品の id | ✅ |
| `sku` | 在庫管理コード（後述） | ✅ |
| `type` | バリアントの種類（後述） | ✅ |
| `label` | 英語ラベル（例: `40cm`, `Black / M`） | ✅ |
| `label_ja` | 日本語ラベル（例: `40cm`, `ブラック / M`） | — |
| `stock_count` | この選択肢の在庫数 | ✅ |
| `price_modifier` | 追加料金（追加なしは `0`） | ✅ |
| `sort_order` | 表示順（0から始まる連番） | ✅ |

---

### SKU の作り方

SKU（在庫管理コード）は以下の形式で作ります。

```
CL - カテゴリコード - 商品番号 - バリアント

カテゴリコード一覧:
  NCK  = ネックレス
  RING = リング
  BRC  = ブレスレット
  PIER = ピアス
  TS   = Tシャツ
  LS   = ロングスリーブ
  MTS  = モアサナイトTシャツ
  NEO  = ネオンアート
  HH   = ヒップホップアート
  PC   = ポップカルチャー
  SC   = ストリートカルチャー
  OC   = オリジナルキャラクター
```

**入力例:**

| 商品 | SKU例 |
|-----|-------|
| ネックレス002・40cm | `CL-NCK-002-40CM` |
| リング002・9号 | `CL-RING-002-09` |
| Tシャツ003・ブラック・M | `CL-TS-003-BLK-M` |
| ネオンアート002・A3 | `CL-NEO-002-A3` |
| ネオンアート002・フレームあり | `CL-NEO-002-FRM` |

---

### ネックレスのバリアント登録

**type: `length`（チェーン長）**

以下を1行ずつ「Insert row」で登録します。

**1行目（40cm）:**
```
product_id  : 商品の id を貼り付け
sku         : CL-NCK-002-40CM
type        : length
label       : 40cm
label_ja    : 40cm
stock_count : 8
price_modifier: 0
sort_order  : 0
```

**2行目（45cm）:**
```
product_id  : 商品の id を貼り付け
sku         : CL-NCK-002-45CM
type        : length
label       : 45cm
label_ja    : 45cm
stock_count : 7
price_modifier: 0
sort_order  : 1
```

---

### リングのバリアント登録

**type: `size`（リングサイズ）**

取り扱うサイズ分だけ行を追加します。

**7号の場合:**
```
product_id  : 商品の id
sku         : CL-RING-002-07
type        : size
label       : 7
label_ja    : 7号
stock_count : 3
price_modifier: 0
sort_order  : 0
```

**9号の場合（sort_orderを1に変える）:**
```
product_id  : 商品の id
sku         : CL-RING-002-09
type        : size
label       : 9
label_ja    : 9号
stock_count : 4
price_modifier: 0
sort_order  : 1
```

これをサイズ分（7号 / 9号 / 11号 / 13号 / 15号）繰り返します。

---

### Tシャツのバリアント登録

**type: `color_size`（色とサイズの組み合わせ）**

アパレルは色×サイズの組み合わせで1行ずつ登録します。

> **重要:** `label` は `カラー / サイズ` の形式（スペースあり）で入力してください。

**Black / S の場合:**
```
product_id  : 商品の id
sku         : CL-TS-003-BLK-S
type        : color_size
label       : Black / S
label_ja    : ブラック / S
stock_count : 8
price_modifier: 0
sort_order  : 0
```

**同様に全パターンを登録します（例: Black, White の S/M/L/XL）:**

| label | label_ja | sku | sort_order |
|-------|---------|-----|:----------:|
| `Black / S` | `ブラック / S` | `CL-TS-003-BLK-S` | 0 |
| `Black / M` | `ブラック / M` | `CL-TS-003-BLK-M` | 1 |
| `Black / L` | `ブラック / L` | `CL-TS-003-BLK-L` | 2 |
| `Black / XL` | `ブラック / XL` | `CL-TS-003-BLK-XL` | 3 |
| `Black / XXL` | `ブラック / XXL` | `CL-TS-003-BLK-XXL` | 4 |
| `White / S` | `ホワイト / S` | `CL-TS-003-WHT-S` | 5 |
| `White / M` | `ホワイト / M` | `CL-TS-003-WHT-M` | 6 |
| `White / L` | `ホワイト / L` | `CL-TS-003-WHT-L` | 7 |
| `White / XL` | `ホワイト / XL` | `CL-TS-003-WHT-XL` | 8 |

各行で「Insert row」→ 入力 → 「Save」を繰り返してください。

---

### アートのバリアント登録

アートは **サイズ** と **額装** の2種類を登録します。

#### サイズバリアント（type: `size`）

**A3（基本サイズ・追加料金なし）:**
```
product_id    : 商品の id
sku           : CL-NEO-002-A3
type          : size
label         : A3 (297×420mm)
label_ja      : A3（297×420mm）
stock_count   : 10
price_modifier: 0
sort_order    : 0
```

**A2（追加料金あり）:**
```
product_id    : 商品の id
sku           : CL-NEO-002-A2
type          : size
label         : A2 (420×594mm)
label_ja      : A2（420×594mm）
stock_count   : 10
price_modifier: 11000        ← ¥11,000 追加
sort_order    : 1
```

**A1（さらに追加料金あり）:**
```
product_id    : 商品の id
sku           : CL-NEO-002-A1
type          : size
label         : A1 (594×841mm)
label_ja      : A1（594×841mm）
stock_count   : 10
price_modifier: 33000        ← ¥33,000 追加
sort_order    : 2
```

#### 額装バリアント（type: `frame`）

**フレームなし（追加料金なし）:**
```
product_id    : 商品の id
sku           : CL-NEO-002-NOFRM
type          : frame
label         : Without Frame
label_ja      : フレームなし
stock_count   : 20
price_modifier: 0
sort_order    : 0
```

**フレームあり（追加料金あり）:**
```
product_id    : 商品の id
sku           : CL-NEO-002-FRM
type          : frame
label         : With Frame
label_ja      : フレームあり
stock_count   : 10
price_modifier: 11000        ← ¥11,000 追加
sort_order    : 1
```

---

## 6. タグを紐づける（product_tags）

### 事前: tags テーブルでタグの id を確認する

```
Table Editor → 左パネル「tags」をクリック
```

タグ一覧が表示されます。使いたいタグの `id` 列の値をコピーします。

**主要タグの id 確認方法:**
1. `tags` テーブルを開く
2. `name` 列でタグ名を探す（例: `moissanite`）
3. 同じ行の `id` 列の値をコピーする

---

### product_tags テーブルに登録する

```
Table Editor → 左パネル「product_tags」をクリック → 「＋ Insert row」
```

**入力内容（1タグにつき1行）:**

| カラム | 入力内容 |
|-------|---------|
| `product_id` | 商品の id |
| `tag_id` | タグの id |

1つの商品に複数のタグをつける場合は、タグの数だけ「Insert row」を繰り返します。

---

### カテゴリ別の推奨タグ

**Jewelry の場合:**
```
moissanite（必須）
jewelry（必須）
necklace または ring または bracelet（商品種別）
street-luxury（必須）
featured（トップ掲載したい場合のみ）
```

**Apparel の場合:**
```
apparel（必須）
tshirt または long_sleeve（商品種別）
street-luxury（必須）
```

**Art の場合:**
```
art（必須）
neon または hiphop または pop-culture 等（アートジャンル）
street-luxury（必須）
limited（限定品の場合のみ）
```

---

## 7. 商品を公開する

### draft → active に変更する手順

すべての準備（products / product_images / product_variants / product_tags）が完了したら公開します。

1. **Table Editor → 「products」**をクリック
2. 公開したい商品の行を探す
   - 上部の「Filter」で `slug` を使うと素早く見つけられます
3. `status` 列のセルを**ダブルクリック**
4. `draft` を消して `active` と入力
5. **Enter** キーを押す → 即座にサイトに反映

---

### 公開前の確認チェック（product_images 確認）

1. `product_images` テーブルを開く
2. 「Filter」で `product_id` = 商品のid でフィルター
3. **5行以上ある**ことを確認
4. `is_thumbnail = true` が **1行だけ**あることを確認

---

### featured（おすすめ表示）の切り替え

1. `products` テーブルで対象商品の行を選択
2. `featured` 列のトグルスイッチをクリック
   - オン（青）= トップページに表示
   - オフ（灰）= 通常表示のみ

---

## 8. 日常の修正操作

### 価格を変更する

1. `products` テーブルを開く
2. Filter で `slug` を指定して商品を見つける
3. `price` 列のセルをダブルクリック
4. 新しい価格を半角数字で入力（¥マークなし）
5. **Enter** キーで確定 → 即座に反映

---

### 在庫数を更新する

**全体の在庫数（products.stock_count）を変更する場合:**

1. `products` テーブルを開く
2. 対象商品を見つける
3. `stock_count` 列をダブルクリックして数字を変更
4. Enter で確定

**バリアント別の在庫数を変更する場合（サイズ・カラー別）:**

1. `product_variants` テーブルを開く
2. Filter で `product_id` = 商品のidでフィルター
3. 変更したいバリアント（例: `Black / M`）の行の `stock_count` をダブルクリック
4. 新しい在庫数を入力
5. Enter で確定

---

### 商品説明を修正する

1. `products` テーブルを開く
2. 対象商品の行の左端チェックボックスをクリックして選択
3. 上部の **「Edit」** ボタンをクリック
4. 右パネルで `description_ja` などの項目を修正
5. **「Save」** をクリック

---

### 画像を差し替える

1. **新しい画像を Cloudinary にアップロード**し、URLをコピーする
2. `product_images` テーブルを開く
3. Filter で `product_id` = 商品のidでフィルター
4. 差し替えたい行（例: sort_order=1 の着用シーン）の `image_url` セルをダブルクリック
5. 古いURLを消して、新しいURLを貼り付ける
6. **Enter** で確定 → 即座に反映

---

### 画像を追加する（6枚目以降）

1. `product_images` テーブルで **「＋ Insert row」**をクリック
2. 以下を入力:
   - `product_id` : 商品のid
   - `image_url` : 新しい画像のURL
   - `alt_text` : 画像の説明
   - `sort_order` : 現在最大の番号 + 1（例: 5枚すでにあれば `5`）
   - `is_thumbnail` : `false`
3. **「Save」**をクリック

---

### 商品名を修正する

1. `products` テーブルを開く
2. 対象商品の `name` または `name_ja` のセルをダブルクリック
3. 修正して Enter

---

### 商品をアーカイブ（販売終了）する

1. `products` テーブルを開く
2. 対象商品の `status` セルをダブルクリック
3. `active` を `archived` に変更
4. Enter → サイトから非表示になる

> **データは残ります。** 将来また販売する場合は `active` に戻すだけです。

---

### featured を一時的に外す

1. `products` テーブルを開く
2. 対象商品の `featured` 列のトグルスイッチをクリックしてオフにする
3. → トップページのおすすめ欄から消える

---

### タグを追加する

1. `tags` テーブルで追加したいタグの `id` を確認してコピー
2. `product_tags` テーブルで **「＋ Insert row」**
3. `product_id` と `tag_id` を入力して **「Save」**

---

### タグを外す

1. `product_tags` テーブルを開く
2. Filter で `product_id` = 商品のidでフィルター
3. 外したいタグの行を選択（チェックボックスをクリック）
4. 上部の **「Delete」** ボタンをクリック
5. 確認ダイアログで **「Confirm」**

---

## 9. 操作トラブル対処法

### 「Save」を押してもエラーが出る場合

**原因1: slug が重複している**

エラーメッセージに `unique constraint` や `duplicate key` と表示されます。

対処: `slug` の値を変更する（末尾に `-002` や `-v2` を追加する）

---

**原因2: 必須項目が空になっている**

エラーメッセージに `null value` と表示されます。

対処: 空欄になっているカラムを確認し、値を入力する

---

**原因3: is_thumbnail が既に true の画像がある**

1枚の商品に `is_thumbnail = true` が2枚以上あるとエラーになります。

対処: 既存の `is_thumbnail = true` の画像を `false` に変更してから新しい画像を登録する

---

**原因4: product_id が間違っている**

存在しない product_id を入力するとエラーになります。

対処:
1. `products` テーブルを開く
2. 対象商品の行の `id` を再確認してコピーする
3. 貼り直す

---

### 商品がサイトに表示されない場合

**確認手順:**

1. `products` テーブルで対象商品の `status` を確認
   - `draft` になっていれば → `active` に変更する
   - `archived` になっていれば → `active` に変更する

2. 画像が登録されているか確認
   - `product_images` テーブルで `product_id` でフィルター
   - 1行以上あることを確認

3. `is_thumbnail = true` の画像が1枚あるか確認
   - ない場合: いずれかの画像の `is_thumbnail` を `true` にする

---

### 間違えて行を削除してしまった場合

残念ながら、**Table Editor での削除は元に戻せません。**

もし重要なデータを削除してしまった場合は、最初からその商品を再登録してください。

**今後の予防策:**
- 削除する前に `status = 'archived'` に変更することを習慣にする
- 削除ボタンをクリックする前に、本当に削除してよいか必ず確認する

---

### サイトの変更が反映されるまでの時間

Table Editor で変更すると、**数秒〜30秒以内にサイトに反映**されます。

反映されない場合は、ブラウザで **Ctrl + Shift + R**（Mac: Cmd + Shift + R）で強制リロードしてください。

---

## まとめ: よく使う操作の早見表

| やりたいこと | テーブル | 操作 |
|------------|---------|------|
| 新商品を登録する | products | Insert row |
| 商品を公開する | products | status を `active` に変更 |
| 商品を非表示にする | products | status を `draft` に変更 |
| 商品を販売終了する | products | status を `archived` に変更 |
| 価格を変更する | products | price セルをダブルクリック |
| 在庫数を変更する | products または product_variants | stock_count を変更 |
| 商品名を変更する | products | name / name_ja を変更 |
| 画像を追加する | product_images | Insert row |
| 画像URLを変更する | product_images | image_url を変更 |
| バリアントの在庫を変える | product_variants | stock_count を変更 |
| おすすめ欄に追加する | products | featured を true に |
| タグを追加する | product_tags | Insert row |
| タグを外す | product_tags | 行を Delete |

---

*© CIELO / ASIA VISION LINK — Supabase Table Editor 運用ガイド*
