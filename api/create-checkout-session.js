'use strict';

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// ── クライアントは関数内で生成（コールドスタート時の初期化エラーを防ぐ）
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ── リクエストボディを JSON としてパース
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── ① リクエストパース
  let body;
  try {
    body = await parseBody(req);
  } catch {
    return res.status(400).json({ error: 'リクエストの形式が不正です' });
  }

  const { productId, productSlug, items } = body;

  // ── ② 入力バリデーション（IDと数量のみ受け取る。価格は受け取らない）
  if (!productId || !Array.isArray(items) || items.length === 0 || items.length > 20) {
    return res.status(400).json({ error: '不正なリクエストです' });
  }
  for (const item of items) {
    if (
      !item.variantId ||
      typeof item.variantId !== 'string' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      return res.status(400).json({ error: '不正なアイテムです' });
    }
  }

  const supabase = getSupabase();
  const stripe   = getStripe();

  // ── ③ 商品情報をサーバーサイドで Supabase から取得（価格・名称・在庫すべてDB基準）
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, price, status, product_images(image_url, is_thumbnail)')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }

  // 非公開商品への直接攻撃を防ぐ
  if (product.status !== 'active') {
    return res.status(400).json({ error: 'この商品は現在購入できません' });
  }

  // サムネイル画像（Stripe Checkout に表示）
  const thumbnail = product.product_images?.find(i => i.is_thumbnail)?.image_url || null;
  const images = thumbnail ? [thumbnail] : [];

  // ── ④ バリアントごとに検証・価格算出（すべてサーバーサイド）
  const lineItems      = [];
  const validatedItems = [];

  for (const item of items) {
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('id, product_id, label, stock_count, price_modifier, sku')
      .eq('id', item.variantId)
      .single();

    if (variantError || !variant) {
      return res.status(404).json({ error: `バリアントが見つかりません` });
    }

    // 別商品のバリアントIDすり替え攻撃を防ぐ
    if (variant.product_id !== productId) {
      return res.status(400).json({ error: '不正なバリアントです' });
    }

    // 在庫チェック（サーバーサイド）
    if (variant.stock_count < item.quantity) {
      return res.status(400).json({ error: `在庫が不足しています: ${variant.label}` });
    }

    // 価格をサーバーサイドで計算（フロントの値は一切使わない）
    const unitAmount = product.price + (variant.price_modifier || 0);

    lineItems.push({
      price_data: {
        currency: 'jpy',
        product_data: {
          name: `${product.name} — ${variant.label}`,
          images,
          metadata: { sku: variant.sku },
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    });

    validatedItems.push({
      variantId: variant.id,
      quantity:  item.quantity,
    });
  }

  // ── ⑤ Stripe Checkout Session 作成
  const baseUrl   = process.env.BASE_URL || `https://${req.headers.host}`;
  const cancelUrl = productSlug
    ? `${baseUrl}/product.html?slug=${encodeURIComponent(productSlug)}`
    : `${baseUrl}/index.html`;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items:           lineItems,
      mode:                 'payment',
      success_url:          `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           cancelUrl,
      metadata: {
        productId,
        productSlug: productSlug || '',
        itemsJson:   JSON.stringify(validatedItems),
      },
      billing_address_collection:  'required',
      shipping_address_collection: { allowed_countries: ['JP'] },
      locale: 'ja',
    });
  } catch (err) {
    console.error('[CIELO] Stripe session create error:', err.message);
    return res.status(500).json({ error: '決済セッションの作成に失敗しました' });
  }

  return res.status(200).json({ url: session.url });
};
