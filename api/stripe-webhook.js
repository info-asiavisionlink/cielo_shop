'use strict';

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const FROM = 'CIELO <orders@asiavision.link>';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ── 注文確認メール HTML
function buildOrderConfirmationHtml({ customerName, orderId, items, total }) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:9px 0;font-size:13px;color:#f0f4ff;border-bottom:1px solid rgba(240,244,255,0.06);">
        ${item.productName}${item.variantLabel ? ` <span style="color:rgba(240,244,255,0.45);font-size:12px;">/ ${item.variantLabel}</span>` : ''}
      </td>
      <td style="padding:9px 0;font-size:13px;color:rgba(240,244,255,0.6);text-align:center;border-bottom:1px solid rgba(240,244,255,0.06);">× ${item.quantity}</td>
      <td style="padding:9px 0;font-size:13px;color:#f0f4ff;text-align:right;border-bottom:1px solid rgba(240,244,255,0.06);">¥${item.subtotal.toLocaleString('ja-JP')}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;">
  <tr><td align="center" style="padding:48px 20px;">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <tr><td style="padding-bottom:32px;text-align:center;border-bottom:1px solid rgba(200,169,110,0.25);">
        <p style="margin:0;font-size:22px;font-weight:300;letter-spacing:0.28em;color:#f0f4ff;text-transform:uppercase;">CIELO</p>
      </td></tr>

      <tr><td style="padding:36px 0 24px 0;text-align:center;">
        <p style="margin:0 0 10px 0;font-size:10px;font-weight:700;letter-spacing:0.18em;color:#c8a96e;text-transform:uppercase;">Order Confirmed</p>
        <p style="margin:0;font-size:26px;font-weight:300;color:#f0f4ff;letter-spacing:0.04em;">ご注文ありがとうございます</p>
      </td></tr>

      <tr><td style="padding-bottom:28px;font-size:14px;color:rgba(240,244,255,0.7);line-height:1.8;">
        ${customerName ? `${customerName} 様、` : ''}この度はご注文いただきありがとうございます。<br>
        ご注文内容を受け付けました。発送準備が整い次第、発送通知メールをお送りします。
      </td></tr>

      <tr><td>
        <p style="margin:0 0 12px 0;font-size:10px;font-weight:700;letter-spacing:0.14em;color:rgba(240,244,255,0.4);text-transform:uppercase;">Order Items</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <th style="padding-bottom:8px;font-size:11px;font-weight:500;color:rgba(240,244,255,0.35);text-align:left;letter-spacing:0.08em;">商品</th>
            <th style="padding-bottom:8px;font-size:11px;font-weight:500;color:rgba(240,244,255,0.35);text-align:center;letter-spacing:0.08em;">数量</th>
            <th style="padding-bottom:8px;font-size:11px;font-weight:500;color:rgba(240,244,255,0.35);text-align:right;letter-spacing:0.08em;">小計</th>
          </tr>
          ${itemRows}
          <tr>
            <td colspan="2" style="padding:14px 0 0 0;font-size:12px;font-weight:600;letter-spacing:0.08em;color:rgba(240,244,255,0.45);">合計金額</td>
            <td style="padding:14px 0 0 0;font-size:18px;font-weight:700;color:#f0f4ff;text-align:right;">¥${total.toLocaleString('ja-JP')}</td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="height:28px;"></td></tr>
      <tr><td style="padding:14px 16px;background:rgba(240,244,255,0.03);border:1px solid rgba(240,244,255,0.07);border-radius:4px;">
        <p style="margin:0;font-size:12px;color:rgba(240,244,255,0.4);line-height:1.7;">
          注文ID: <span style="font-family:monospace;color:rgba(240,244,255,0.6);">${orderId.slice(0, 8)}...</span>
        </p>
      </td></tr>
      <tr><td style="height:36px;"></td></tr>

      <tr><td style="padding-top:28px;border-top:1px solid rgba(240,244,255,0.07);text-align:center;">
        <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.12em;color:rgba(240,244,255,0.3);text-transform:uppercase;">CIELO / ASIA VISION LINK</p>
        <p style="margin:0;font-size:11px;color:rgba(240,244,255,0.2);">お問い合わせ: <a href="mailto:info@asiavision.link" style="color:#c8a96e;text-decoration:none;">info@asiavision.link</a></p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

async function sendOrderConfirmationEmail({ to, customerName, orderId, items, total }) {
  if (!to || !process.env.RESEND_API_KEY) return;
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to: [to],
      subject: 'ご注文ありがとうございます | CIELO',
      html: buildOrderConfirmationHtml({ customerName, orderId, items, total }),
    });
    console.log(`[CIELO Email] 注文確認メール送信完了: ${to}`);
  } catch (err) {
    console.error('[CIELO Email] 注文確認メール送信失敗:', err.message);
  }
}

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
      customer_name:            customerName,
      customer_email:           customerEmail,
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
  const emailItems = [];
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

    emailItems.push({
      productName:  prod?.name  || '',
      variantLabel: variant.label || '',
      quantity:     item.quantity,
      unitPrice:    unitPrice,
      subtotal:     unitPrice * item.quantity,
    });
  }

  // ── 注文確認メール送信
  await sendOrderConfirmationEmail({
    to:           customerEmail,
    customerName: customerName,
    orderId:      order.id,
    items:        emailItems,
    total:        session.amount_total,
  });

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
