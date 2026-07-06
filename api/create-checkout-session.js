'use strict';

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

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

// ── 刻印テキストのサーバーサイドバリデーション
function validateEngraving(raw, maxChars) {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw !== 'string') throw new Error('刻印内容の形式が不正です');

  // trim（前後空白のみ除去）
  let val = raw.trim();
  if (!val) return null;

  // 制御文字・改行除去
  val = val.replace(/[\x00-\x1F\x7F]/g, '');
  // HTML タグ除去
  val = val.replace(/<[^>]*>/g, '');

  const limit = Math.min(maxChars || 20, 50); // DB上限50字
  if (val.length > limit) {
    throw new Error(`刻印は${limit}文字以内で入力してください`);
  }

  return val || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = await parseBody(req);
  } catch {
    return res.status(400).json({ error: 'リクエストの形式が不正です' });
  }

  const { productId, productSlug, items } = body;

  // ── 入力バリデーション
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

  // ── 商品情報をサーバーサイドで取得
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, price, status, engraving_available, engraving_required, engraving_max_chars, product_images(image_url, is_thumbnail)')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }
  if (product.status !== 'active') {
    return res.status(400).json({ error: 'この商品は現在購入できません' });
  }

  // ── 刻印バリデーション（サーバーサイド）
  // 全 items から刻印テキストを取得して検証
  const maxC     = product.engraving_max_chars || 20;
  const validatedEngravings = [];

  for (const item of items) {
    let engText = null;
    try {
      engText = validateEngraving(item.engraving, maxC);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    // 必須チェック
    if (product.engraving_available && product.engraving_required && !engText) {
      return res.status(400).json({ error: '刻印内容を入力してください' });
    }
    // 非対応商品に刻印を送ってきた場合は無視（不正ではないが保存しない）
    if (!product.engraving_available) {
      engText = null;
    }
    validatedEngravings.push(engText);
  }

  const thumbnail = product.product_images?.find(i => i.is_thumbnail)?.image_url || null;
  const images = thumbnail ? [thumbnail] : [];

  // ── バリアントごとに検証・価格算出
  const lineItems      = [];
  const validatedItems = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('id, product_id, label, stock_count, price_modifier, sku')
      .eq('id', item.variantId)
      .single();

    if (variantError || !variant) {
      return res.status(404).json({ error: 'バリアントが見つかりません' });
    }
    if (variant.product_id !== productId) {
      return res.status(400).json({ error: '不正なバリアントです' });
    }
    if (variant.stock_count < item.quantity) {
      return res.status(400).json({ error: `在庫が不足しています: ${variant.label}` });
    }

    const unitAmount   = product.price + (variant.price_modifier || 0);
    const engravingText = validatedEngravings[i];

    lineItems.push({
      price_data: {
        currency: 'jpy',
        product_data: {
          name: `${product.name} — ${variant.label}`,
          images,
          metadata: {
            sku:       variant.sku,
            engraving: engravingText || '',
          },
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    });

    validatedItems.push({
      variantId: variant.id,
      quantity:  item.quantity,
      engraving: engravingText || null,
    });
  }

  // ── Stripe Checkout Session 作成
  const baseUrl   = process.env.BASE_URL || `https://${req.headers.host}`;
  const cancelUrl = productSlug
    ? `${baseUrl}/product.html?slug=${encodeURIComponent(productSlug)}`
    : `${baseUrl}/index.html`;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types:         ['card'],
      line_items:                   lineItems,
      mode:                         'payment',
      success_url:                  `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:                   cancelUrl,
      metadata: {
        productId,
        productSlug: productSlug || '',
        itemsJson:   JSON.stringify(validatedItems),
      },
      billing_address_collection:  'required',
      shipping_address_collection: { allowed_countries: ['JP'] },
      phone_number_collection:     { enabled: true },
      locale:                      'ja',
    });
  } catch (err) {
    console.error('[CIELO] Stripe session create error:', err.message);
    return res.status(500).json({ error: '決済セッションの作成に失敗しました' });
  }

  return res.status(200).json({ url: session.url });
};
