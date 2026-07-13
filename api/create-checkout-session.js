'use strict';

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

function getStripe()   { return new Stripe(process.env.STRIPE_SECRET_KEY); }
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

/* ── Message Card server-side validation ── */
function validateMessageCard(mc) {
  if (!mc || !mc.enabled) return null;

  const to      = (typeof mc.to      === 'string' ? mc.to.trim()      : '');
  const message = (typeof mc.message === 'string' ? mc.message.trim() : '');
  const from    = (typeof mc.from    === 'string' ? mc.from.trim()    : '');

  // Strip control chars + HTML
  const clean = s => s.replace(/[\x00-\x1F\x7F]/g, '').replace(/<[^>]*>/g, '').trim();

  if (!clean(to))      throw new Error('相手のお名前を入力してください');
  if (!clean(message)) throw new Error('メッセージを入力してください');
  if (clean(message).length > 30) throw new Error('メッセージは30文字以内で入力してください');
  if (!clean(from))    throw new Error('贈る方のお名前を入力してください');

  return { to: clean(to), message: clean(message), from: clean(from) };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try { body = await parseBody(req); }
  catch { return res.status(400).json({ error: 'リクエストの形式が不正です' }); }

  const { items, messageCard: rawMsgCard } = body;

  // ── Input validation
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    return res.status(400).json({ error: '不正なリクエストです' });
  }
  for (const item of items) {
    if (
      !item.productId || typeof item.productId !== 'string' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 || item.quantity > 99
    ) {
      return res.status(400).json({ error: '不正なアイテムです' });
    }
  }

  // ── Message Card validation
  let msgCard = null;
  try { msgCard = validateMessageCard(rawMsgCard); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  const supabase = getSupabase();
  const stripe   = getStripe();
  const lineItems      = [];
  const validatedItems = [];

  for (const item of items) {
    // ── Fetch product (server-side; never trust client price)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, product_images(image_url, is_thumbnail)')
      .eq('id', item.productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: '商品が見つかりません: ' + item.productId });
    }
    if (product.status !== 'active') {
      return res.status(400).json({ error: 'この商品は現在購入できません: ' + product.name });
    }

    const thumbnail = product.product_images?.find(i => i.is_thumbnail)?.image_url || null;
    const images    = thumbnail ? [thumbnail] : [];

    // ── Variant validation (optional; some products have no variants)
    let unitAmount = product.price;

    if (item.variantId) {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('id, product_id, label, stock_count, price_modifier, sku')
        .eq('id', item.variantId)
        .single();

      if (variantError || !variant) {
        return res.status(404).json({ error: 'バリアントが見つかりません' });
      }
      if (variant.product_id !== item.productId) {
        return res.status(400).json({ error: '不正なバリアントです' });
      }
      unitAmount = product.price + (variant.price_modifier || 0);
    }

    const lineItemName = item.variantId
      ? `${product.name} — ${(await supabase.from('product_variants').select('label').eq('id', item.variantId).single()).data?.label || ''}`
      : product.name;

    lineItems.push({
      price_data: {
        currency:     'jpy',
        product_data: { name: lineItemName, images },
        unit_amount:  unitAmount,
      },
      quantity: item.quantity,
    });

    validatedItems.push({
      p: item.productId,
      v: item.variantId || '',
      q: item.quantity,
    });
  }

  // ── Stripe Checkout Session
  const baseUrl = process.env.BASE_URL || `https://${req.headers.host}`;

  // Build metadata (500文字制限対応)
  const metadata = {
    itemsJson: JSON.stringify(validatedItems),
  };
  if (msgCard) {
    metadata.mc_to      = msgCard.to.slice(0, 50);
    metadata.mc_message = msgCard.message.slice(0, 30);
    metadata.mc_from    = msgCard.from.slice(0, 50);
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types:         ['card'],
      line_items:                   lineItems,
      mode:                         'payment',
      success_url:                  `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:                   `${baseUrl}/index.html`,
      metadata,
      billing_address_collection:   'required',
      shipping_address_collection:  { allowed_countries: ['JP'] },
      phone_number_collection:      { enabled: true },
      locale:                       'ja',
    });
  } catch (err) {
    console.error('[CIELO] Stripe session create error:', err.message);
    return res.status(500).json({ error: '決済セッションの作成に失敗しました' });
  }

  return res.status(200).json({ url: session.url });
};
