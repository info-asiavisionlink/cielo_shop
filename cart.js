/* ============================================================
   CIELO CART — cart.js
   localStorage-based cart state management.
   No external dependencies.

   Cart Item:
   {
     cartItemId:    string  — productId::variantId::engravingText (identity key)
     productId:     string
     productSlug:   string
     productName:   string
     variantId:     string | null
     variantLabel:  string | null  — size label (e.g. "M", "40cm")
     color:         string | null  — product color info
     unitPrice:     number         — JPY, validated server-side on checkout
     quantity:      number
     engravingType: 'personal_mark'|'date'|'short_message'|null
     engravingText: string | null
     imageUrl:      string | null
   }
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'cielo_cart_v2';
  const MAX_QTY     = 99;

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
     Two items are the same if they share the same product+variant+engraving.
     Different sizes or different inscriptions = different items.
  ── */
  function makeId(productId, variantId, engravingType, engravingText) {
    return [
      productId       || '',
      variantId       || 'no-variant',
      engravingType   || 'none',
      (engravingText  || '').trim(),
    ].join('::');
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
    const cid    = makeId(item.productId, item.variantId, item.engravingType, item.engravingText);
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
  }

  window.CieloCart = { getCart, getCount, getTotal, addToCart, updateQuantity, removeFromCart, clearCart };
})();
