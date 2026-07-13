/* ============================================================
   CIELO CART — cart.js
   localStorage-based cart state management.
   No external dependencies.

   Cart Item:
   {
     cartItemId:   string  — productId::variantId (identity key)
     productId:    string
     productSlug:  string
     productName:  string
     variantId:    string | null
     variantLabel: string | null  — size label (e.g. "M", "40cm")
     color:        string | null  — product color info
     unitPrice:    number         — JPY, validated server-side on checkout
     quantity:     number
     imageUrl:     string | null
   }

   Message Card (order-level, stored separately):
   {
     enabled:  boolean
     to:       string  — 相手のお名前
     message:  string  — メッセージ（最大30文字）
     from:     string  — 贈る方のお名前
   }
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY      = 'cielo_cart_v2';
  const MSG_CARD_KEY     = 'cielo_message_card';
  const MAX_QTY          = 99;

  /* ── storage ── */
  function read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function write(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cielo:cart-update', { detail: { cart } }));
  }

  /* ── cart item identity ──
     Two items are the same if they share the same product+variant.
     Different sizes = different items.
  ── */
  function makeId(productId, variantId) {
    return [productId || '', variantId || 'no-variant'].join('::');
  }

  /* ── public API ── */
  function getCart() { return read(); }

  function getCount() {
    return read().reduce((n, i) => n + i.quantity, 0);
  }

  function getTotal(cart) {
    return (cart || read()).reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  }

  function addToCart(item) {
    const cart   = read();
    const cid    = makeId(item.productId, item.variantId);
    const exists = cart.find(i => i.cartItemId === cid);

    if (exists) {
      exists.quantity = Math.min(exists.quantity + (item.quantity || 1), MAX_QTY);
    } else {
      cart.push({ ...item, cartItemId: cid, quantity: item.quantity || 1 });
    }

    write(cart);
    return read();
  }

  function updateQuantity(cartItemId, quantity) {
    const cart = read();
    if (quantity <= 0) {
      write(cart.filter(i => i.cartItemId !== cartItemId));
      return;
    }
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (item) {
      item.quantity = Math.min(quantity, MAX_QTY);
      write(cart);
    }
  }

  function removeFromCart(cartItemId) {
    write(read().filter(i => i.cartItemId !== cartItemId));
  }

  function clearCart() {
    write([]);
    clearMessageCard();
  }

  /* ── Message Card (order-level) ── */
  function getMessageCard() {
    try { return JSON.parse(localStorage.getItem(MSG_CARD_KEY) || 'null'); }
    catch { return null; }
  }

  function setMessageCard(data) {
    if (!data || !data.enabled) {
      localStorage.removeItem(MSG_CARD_KEY);
    } else {
      localStorage.setItem(MSG_CARD_KEY, JSON.stringify(data));
    }
  }

  function clearMessageCard() {
    localStorage.removeItem(MSG_CARD_KEY);
  }

  window.CieloCart = {
    getCart, getCount, getTotal,
    addToCart, updateQuantity, removeFromCart, clearCart,
    getMessageCard, setMessageCard, clearMessageCard,
  };
})();
