/* ============================================================
   CIELO CART UI — cart-ui.js
   Cart Drawer + Header icon.
   Depends on: cart.js (window.CieloCart)
   ============================================================ */

(function () {
  'use strict';

  /* ── Engraving type labels ── */
  const ENG_LABELS = {
    personal_mark: 'Personal Mark',
    date:          'Date Mark',
    short_message: 'Short Message',
  };

  /* ── Format price ── */
  function fmt(n) { return '¥' + (n || 0).toLocaleString('ja-JP'); }

  /* ── Build cart item row HTML ── */
  function buildItemHTML(item) {
    const img = item.imageUrl
      ? `<img src="${item.imageUrl}" alt="${item.productName}" loading="lazy">`
      : `<div class="cart-item-img-placeholder">CIELO</div>`;

    const inscriptionHtml = item.engravingType
      ? `<div class="cart-item-inscription">${ENG_LABELS[item.engravingType] || item.engravingType}: ${item.engravingText || ''}</div>`
      : '';

    const sizeLine = item.variantLabel
      ? `<div class="cart-item-meta">${item.variantLabel}${item.color ? ' / ' + item.color : ''}</div>`
      : (item.color ? `<div class="cart-item-meta">${item.color}</div>` : '');

    return `
      <div class="cart-item" data-id="${item.cartItemId}">
        <a class="cart-item-img" href="product.html?slug=${item.productSlug}">${img}</a>
        <div class="cart-item-info">
          <a class="cart-item-name" href="product.html?slug=${item.productSlug}">${item.productName}</a>
          ${sizeLine}
          ${inscriptionHtml}
          <div class="cart-item-price">${fmt(item.unitPrice)}</div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn" data-action="dec" data-id="${item.cartItemId}" aria-label="数量を減らす">−</button>
            <span class="cart-qty-val">${item.quantity}</span>
            <button class="cart-qty-btn" data-action="inc" data-id="${item.cartItemId}" aria-label="数量を増やす">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.cartItemId}" aria-label="削除">×</button>
      </div>`;
  }

  /* ── Render cart drawer contents ── */
  function renderDrawer(cart) {
    const body  = document.getElementById('cartDrawerBody');
    const footer = document.getElementById('cartDrawerFooter');
    if (!body || !footer) return;

    if (!cart.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <p class="cart-empty-icon">◻</p>
          <p class="cart-empty-text">カートは空です</p>
          <a href="index.html" class="cart-continue-link">SHOP を見る</a>
        </div>`;
      footer.innerHTML = '';
      return;
    }

    body.innerHTML = cart.map(buildItemHTML).join('');

    const total = window.CieloCart.getTotal(cart);
    footer.innerHTML = `
      <div class="cart-subtotal">
        <span class="cart-subtotal-label">Subtotal</span>
        <span class="cart-subtotal-val">${fmt(total)}</span>
      </div>
      <p class="cart-subtotal-note">送料・税は注文確認時に計算されます</p>
      <button id="cartCheckoutBtn" class="btn-cart-checkout">PROCEED TO CHECKOUT</button>
      <a href="index.html" class="cart-continue-link">← ショッピングを続ける</a>`;

    document.getElementById('cartCheckoutBtn')?.addEventListener('click', handleCheckout);

    /* qty + remove event delegation */
    body.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.id;
        const item = window.CieloCart.getCart().find(i => i.cartItemId === id);
        if (!item) return;
        const delta = btn.dataset.action === 'inc' ? 1 : -1;
        window.CieloCart.updateQuantity(id, item.quantity + delta);
      });
    });

    body.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        window.CieloCart.removeFromCart(btn.dataset.id);
      });
    });
  }

  /* ── Checkout from cart ── */
  async function handleCheckout() {
    const cart = window.CieloCart.getCart();
    if (!cart.length) return;

    const btn = document.getElementById('cartCheckoutBtn');
    if (btn) { btn.disabled = true; btn.textContent = '処理中...'; }

    try {
      const payload = {
        items: cart.map(item => ({
          productId:     item.productId,
          variantId:     item.variantId     || null,
          quantity:      item.quantity,
          engravingType: item.engravingType || null,
          engravingText: item.engravingText || null,
        })),
      };

      const res  = await fetch('/api/create-checkout-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '決済の開始に失敗しました');
      window.location.href = data.url;
    } catch (err) {
      console.error('[CIELO Cart] Checkout error:', err);
      alert(err.message || '決済の開始に失敗しました。もう一度お試しください。');
      if (btn) { btn.disabled = false; btn.textContent = 'PROCEED TO CHECKOUT'; }
    }
  }

  /* ── Update header cart icon badge ── */
  function updateBadge(count) {
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent  = count > 0 ? String(count) : '';
      el.style.display = count > 0 ? '' : 'none';
    });
    document.querySelectorAll('.cart-icon-btn').forEach(btn => {
      btn.setAttribute('aria-label', `カート (${count}点)`);
    });
  }

  /* ── Drawer open / close ── */
  function openDrawer() {
    const drawer  = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer) return;
    renderDrawer(window.CieloCart.getCart());
    drawer.classList.add('open');
    overlay?.classList.add('open');
    document.body.classList.add('cart-open');
  }

  function closeDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.classList.remove('cart-open');
  }

  /* ── Create DOM ── */
  function createDOM() {
    /* Cart icon is injected into nav by calling injectCartIcon() */

    /* Overlay */
    const overlay = document.createElement('div');
    overlay.id = 'cartOverlay';
    overlay.className = 'cart-overlay';
    overlay.addEventListener('click', closeDrawer);
    document.body.appendChild(overlay);

    /* Drawer */
    const drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'カート');
    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <span class="cart-drawer-title">CART</span>
        <button class="cart-drawer-close" id="cartDrawerClose" aria-label="カートを閉じる">×</button>
      </div>
      <div class="cart-drawer-body" id="cartDrawerBody"></div>
      <div class="cart-drawer-footer" id="cartDrawerFooter"></div>`;
    document.body.appendChild(drawer);

    document.getElementById('cartDrawerClose')?.addEventListener('click', closeDrawer);

    /* Keyboard close */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ── Inject cart icon into nav ── */
  function injectCartIcon() {
    /* index.html: .nav-links ul */
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      const li = document.createElement('li');
      li.innerHTML = `
        <button class="cart-icon-btn" id="cartIconBtn" aria-label="カート (0点)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span class="cart-count" style="display:none" aria-hidden="true">0</span>
        </button>`;
      navLinks.appendChild(li);
      li.querySelector('#cartIconBtn')?.addEventListener('click', openDrawer);
    }

    /* Mobile nav: add cart icon next to hamburger */
    const navToggle = document.getElementById('navToggle');
    if (navToggle && !document.getElementById('mobileCartBtn')) {
      const btn = document.createElement('button');
      btn.id        = 'mobileCartBtn';
      btn.className = 'cart-icon-btn cart-icon-mobile';
      btn.setAttribute('aria-label', 'カート (0点)');
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <span class="cart-count" style="display:none" aria-hidden="true">0</span>`;
      navToggle.parentNode.insertBefore(btn, navToggle);
      btn.addEventListener('click', openDrawer);
    }
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    createDOM();
    injectCartIcon();
    updateBadge(window.CieloCart?.getCount() || 0);

    window.addEventListener('cielo:cart-update', e => {
      const cart = e.detail?.cart || [];
      const count = cart.reduce((n, i) => n + i.quantity, 0);
      updateBadge(count);
      /* If drawer is open, re-render */
      if (document.getElementById('cartDrawer')?.classList.contains('open')) {
        renderDrawer(cart);
      }
    });
  });

  window.CieloCartUI = { open: openDrawer, close: closeDrawer };
})();
