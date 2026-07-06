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

/* ── Engraving server-side validation ── */
function validateEngraving(rawText, rawType, maxChars, engAvail, engRequired) {
  // Non-engraving product: discard any client-sent engraving silently
  if (!engAvail) return { type: null, text: null };

  const type = rawType || null;
  if (!type || type === 'none') return { type: null, text: null };

  // Validate type value (personal_mark は旧データ後方互換で残す)
  const VALID_TYPES = ['initials', 'name', 'date', 'short_message', 'personal_mark'];
  if (!VALID_TYPES.includes(type)) {
    throw new Error('不正な刻印タイプです');
  }

  let text = typeof rawText === 'string' ? rawText.trim() : '';
  // Strip control chars + HTML tags
  text = text.replace(/[\x00-\x1F\x7F]/g, '').replace(/<[^>]*>/g, '').trim();

  if (engRequired && !text) {
    throw new Error('刻印内容を入力してください');
  }

  const limit = Math.min(maxChars || 20, 50);
  if (text.length > limit) {
    throw new Error(`刻印は${limit}文字以内で入力してください`);
  }

  return { type, text: text || null };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try { body = await parseBody(req); }
  catch { return res.status(400).json({ error: 'リクエストの形式が不正です' }); }

  const { items } = body;

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

    // ── Engraving validation (server-side)
    let engravingType = null;
    let engravingText = null;
    const engAvail    = product.engraving_available ?? false;
    const engRequired = product.engraving_required  ?? false;
    const maxChars    = product.engraving_max_chars  ?? 20;

    try {
      const eng = validateEngraving(
        item.engravingText, item.engravingType,
        maxChars, engAvail, engRequired
      );
      engravingType = eng.type;
      engravingText = eng.text;
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

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
      if (variant.stock_count < item.quantity) {
        return res.status(400).json({ error: `在庫が不足しています: ${variant.label}` });
      }
      unitAmount = product.price + (variant.price_modifier || 0);
    }

    // Build product name for Stripe line item
    const lineItemName = item.variantId
      ? `${product.name} — ${(await supabase.from('product_variants').select('label').eq('id', item.variantId).single()).data?.label || ''}`
      : product.name;

    lineItems.push({
      price_data: {
        currency:     'jpy',
        product_data: {
          name:   lineItemName,
          images,
          metadata: {
            engraving_type: engravingType || '',
            engraving_text: engravingText || '',
          },
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    });

    validatedItems.push({
      p:  item.productId,
      v:  item.variantId || '',
      q:  item.quantity,
      et: engravingType  || '',
      e:  engravingText  || '',
      il: item.inscriptionLocation || '',
    });
  }

  // ── Stripe Checkout Session
  const baseUrl = process.env.BASE_URL || `https://${req.headers.host}`;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types:         ['card'],
      line_items:                   lineItems,
      mode:                         'payment',
      success_url:                  `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:                   `${baseUrl}/index.html`,
      metadata: {
        // Compact format to stay within 500-char limit
        itemsJson: JSON.stringify(validatedItems),
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
