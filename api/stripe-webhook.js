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

// Stripe 署名検証には生の Buffer が必要
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ── checkout.session.completed ハンドラ
async function handleCheckoutCompleted(session) {
  const supabase = getSupabase();

  const { productId, productSlug, itemsJson } = session.metadata || {};
  let items = [];
  try { items = itemsJson ? JSON.parse(itemsJson) : []; }
  catch { console.error('[CIELO Webhook] itemsJson parse error'); return; }

  const customerEmail   = session.customer_details?.email || null;
  const customerName    = session.customer_details?.name  || null;
  const shippingAddress = session.shipping_details?.address || null;

  // ── ① customers upsert（email でユニーク）
  let customerId = null;
  if (customerEmail) {
    const { data: customer, error } = await supabase
      .from('customers')
      .upsert(
        { email: customerEmail, name: customerName },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id')
      .single();

    if (error) {
      console.error('[CIELO Webhook] customers upsert error:', error.message);
    } else {
      customerId = customer?.id || null;
    }
  }

  // ── ② orders insert
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      stripe_session_id:        session.id,
      stripe_payment_intent_id: session.payment_intent || null,
      customer_id:              customerId,
      status:                   'paid',
      subtotal:                 session.amount_subtotal  ?? session.amount_total,
      tax:                      session.total_details?.amount_tax ?? 0,
      total:                    session.amount_total,
      currency:                 session.currency,
      shipping_address:         shippingAddress,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[CIELO Webhook] orders insert error:', orderError?.message);
    return;
  }

  // ── ③ order_items insert + 在庫減算
  for (const item of items) {
    // バリアント + 商品情報を取得（価格はDB基準で再取得）
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('id, product_id, label, sku, price_modifier, products(name, slug, price)')
      .eq('id', item.variantId)
      .single();

    if (variantError || !variant) {
      console.error('[CIELO Webhook] variant not found:', item.variantId);
      continue;
    }

    const prod      = variant.products;
    const unitPrice = (prod?.price || 0) + (variant.price_modifier || 0);

    // order_items insert
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id:     order.id,
        product_id:   variant.product_id,
        variant_id:   variant.id,
        product_name: prod?.name  || '',
        product_slug: prod?.slug  || productSlug || '',
        variant_label: variant.label,
        unit_price:   unitPrice,
        quantity:     item.quantity,
        subtotal:     unitPrice * item.quantity,
      });

    if (itemError) {
      console.error('[CIELO Webhook] order_items insert error:', itemError.message);
    }

    // 在庫原子的減算（stock_count >= quantity の場合のみ更新）
    const { data: decremented, error: stockError } = await supabase
      .rpc('decrement_stock', {
        p_variant_id: variant.id,
        p_quantity:   item.quantity,
      });

    if (stockError) {
      console.error('[CIELO Webhook] decrement_stock error:', stockError.message);
    } else if (!decremented) {
      console.warn(`[CIELO Webhook] 在庫不足（購入後検知）: variant ${variant.id}`);
    }
  }

  console.log(`[CIELO Webhook] 注文完了: order_id=${order.id} email=${customerEmail}`);
}

// ── メインハンドラ
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).send('Missing stripe-signature header');
  }

  // ── Stripe 署名検証（改ざん・なりすまし防止）
  let event;
  try {
    const rawBody = await getRawBody(req);
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[CIELO Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── イベントハンドラ
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      default:
        // 未処理イベントは無視（200 を返して Stripe の再試行を防ぐ）
        break;
    }
  } catch (err) {
    console.error('[CIELO Webhook] Handler error:', err.message);
    // 内部エラーでも 200 を返す（Stripe がリトライしないよう）
    return res.status(200).json({ received: true, error: err.message });
  }

  return res.status(200).json({ received: true });
};
