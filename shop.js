/* =============================================
   CIELO SHOP — shop.js
   Supabase のみからデータ取得。モックデータなし。
   ============================================= */

const PLACEHOLDER_IMG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
  '<rect fill="#171717" width="400" height="400"/>' +
  '<text x="200" y="196" text-anchor="middle" dominant-baseline="middle" ' +
  'fill="#2A2A2A" font-size="14" font-family="sans-serif" letter-spacing="8">CIELO</text>' +
  '</svg>'
);

// ─── 状態管理 ────────────────────────────────
let allProducts = [];
let activeCat   = 'all';
let activeTag   = 'all';
let searchQuery = '';
let fetchError  = null;

// ─── Supabase 接続確認 ────────────────────────
async function logTableCounts() {
  const [pRes, iRes, vRes] = await Promise.all([
    db.from('products').select('*', { count: 'exact', head: true }),
    db.from('product_images').select('*', { count: 'exact', head: true }),
    db.from('product_variants').select('*', { count: 'exact', head: true }),
  ]);

  if (pRes.error || iRes.error || vRes.error) {
    const err = pRes.error || iRes.error || vRes.error;
    console.error('[CIELO] テーブルカウント取得失敗:', err.message);
    return;
  }
  console.log(`Products: ${pRes.count} / Images: ${iRes.count} / Variants: ${vRes.count}`);
}

window._cieloDebug = async function () {
  console.log('[CIELO Debug] URL:', SUPABASE_URL);
  const { data, error } = await db.from('products').select('id').limit(1);
  if (error) {
    console.error('[CIELO Debug] 接続失敗:', error);
  } else {
    console.log('[CIELO Debug] 接続OK:', data);
    await logTableCounts();
  }
};

// ─── 商品取得 ────────────────────────────────
async function fetchProducts() {
  const { data, error } = await db
    .from('products')
    .select(`
      id, slug, name, name_ja, category, subcategory,
      price, stock_count, featured,
      product_images ( image_url, alt_text, is_thumbnail ),
      product_tags ( tags ( id, name, name_ja ) )
    `)
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    fetchError = error;
    console.error('[CIELO] products 取得エラー:', error.message, '| code:', error.code);
    return null;
  }
  fetchError = null;
  return data || [];
}

// ─── タグ取得 ────────────────────────────────
async function fetchTags() {
  const { data, error } = await db
    .from('tags')
    .select('id, name, name_ja')
    .order('name');
  if (error) {
    console.warn('[CIELO] tags 取得エラー:', error.message);
    return [];
  }
  return data || [];
}

// ─── タグ描画 ────────────────────────────────
function renderTags(tags, usedTagIds) {
  const container = document.getElementById('tagFilter');
  const used = tags.filter(t => usedTagIds.has(t.id));

  used.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.dataset.tag = tag.id;
    btn.textContent = tag.name_ja || tag.name;
    btn.addEventListener('click', () => {
      activeTag = tag.id;
      container.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    });
    container.appendChild(btn);
  });
}

// ─── フィルター ──────────────────────────────
function filterProducts() {
  return allProducts.filter(p => {
    const matchCat  = activeCat === 'all' || p.category === activeCat;
    const matchTag  = activeTag === 'all'
      || (p.product_tags || []).some(pt => pt.tags?.id === activeTag);
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || (p.name || '').toLowerCase().includes(q)
      || (p.name_ja || '').toLowerCase().includes(q)
      || (p.subcategory || '').toLowerCase().includes(q);
    return matchCat && matchTag && matchSearch;
  });
}

// ─── 商品カード ──────────────────────────────
function getThumbnail(product) {
  const imgs = product.product_images || [];
  return imgs.find(i => i.is_thumbnail) || imgs[0] || null;
}

function renderCard(product) {
  const thumb  = getThumbnail(product);
  const imgSrc = thumb?.image_url || PLACEHOLDER_IMG;
  const imgAlt = thumb?.alt_text  || product.name;

  return `
    <a class="product-card" href="product.html?slug=${product.slug}">
      <div class="product-card-img">
        <img
          src="${imgSrc}"
          alt="${imgAlt}"
          loading="lazy"
          onerror="this.onerror=null;this.src=PLACEHOLDER_IMG"
        >
        ${product.featured ? '<span class="product-card-badge">Featured</span>' : ''}
      </div>
      <div class="product-card-info">
        <p class="product-card-name">${product.name}</p>
        <p class="product-card-price">¥${product.price.toLocaleString('ja-JP')}</p>
      </div>
    </a>`;
}

// ─── 商品グリッド描画 ────────────────────────
function renderProducts() {
  const grid    = document.getElementById('productGrid');
  const countEl = document.getElementById('productsCount');

  if (fetchError) {
    grid.innerHTML = `
      <div class="products-empty" style="grid-column:1/-1">
        <p>商品を読み込めませんでした</p>
        <p style="font-size:12px;margin-top:8px;">しばらく時間をおいて再度お試しください</p>
        <button
          onclick="location.reload()"
          style="margin-top:20px;padding:12px 24px;font-size:11px;font-weight:700;
                 letter-spacing:0.12em;text-transform:uppercase;
                 border:1px solid rgba(240,244,255,0.18);color:rgba(240,244,255,0.6);background:none;cursor:pointer;">
          再読み込み
        </button>
      </div>`;
    countEl.textContent = '';
    return;
  }

  const filtered = filterProducts();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="products-empty" style="grid-column:1/-1">
        <p>商品が見つかりません</p>
        <p style="font-size:13px;margin-top:6px;">条件を変更してお試しください</p>
      </div>`;
    countEl.textContent = '0 items';
    return;
  }

  grid.innerHTML  = filtered.map(renderCard).join('');
  countEl.textContent = `${filtered.length} items`;
}

// ─── カテゴリフィルター ──────────────────────
function initCategoryFilter() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat;
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTag = 'all';
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.tag-btn[data-tag="all"]')?.classList.add('active');
      renderProducts();
    });
  });
}

// ─── 検索 ────────────────────────────────────
function initSearch() {
  const input = document.getElementById('searchInput');
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchQuery = input.value.trim();
      renderProducts();
    }, 250);
  });
}

// ─── ナビゲーション (スクロール + モバイルトグル) ──
function initNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

// ─── Hero Slider ─────────────────────────────
function initHero() {
  const container   = document.getElementById('heroSlides');
  const dotsEl      = document.getElementById('heroDots');
  const titleLine1  = document.getElementById('heroTitleLine1');
  const titleLine2  = document.getElementById('heroTitleLine2');
  const counterCur  = document.getElementById('heroCounterCurrent');
  const counterTot  = document.getElementById('heroCounterTotal');
  const progressFill = document.getElementById('heroProgressFill');
  const prevBtn     = document.getElementById('heroPrev');
  const nextBtn     = document.getElementById('heroNext');

  if (!container || typeof IMAGES === 'undefined' || !IMAGES.length) return;

  const total    = IMAGES.length;
  let current    = 0;
  let timer;
  const INTERVAL = 5000;

  if (counterTot) counterTot.textContent = String(total).padStart(2, '0');

  // スライドとドットを生成
  IMAGES.forEach((item, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    if (item.image) {
      const img = new Image();
      img.onload = () => { slide.style.backgroundImage = `url('${item.image}')`; };
      img.src = item.image;
    }
    container.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `スライド ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsEl.appendChild(dot);
  });

  function updateContent(idx) {
    const item = IMAGES[idx];
    if (titleLine1) titleLine1.textContent = item.title    || '';
    if (titleLine2) titleLine2.textContent = item.subtitle || '';
    if (counterCur) counterCur.textContent = String(idx + 1).padStart(2, '0');
  }

  function startProgress() {
    if (!progressFill) return;
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressFill.style.transition = `width ${INTERVAL}ms linear`;
        progressFill.style.width = '100%';
      });
    });
  }

  function goTo(idx) {
    const slides = container.querySelectorAll('.hero-slide');
    const dots   = dotsEl.querySelectorAll('.hero-dot');
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = ((idx % total) + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    updateContent(current);
    startProgress();
  }

  function startTimer() { timer = setInterval(() => goTo(current + 1), INTERVAL); }
  function resetTimer()  { clearInterval(timer); startTimer(); }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetTimer(); });

  updateContent(0);
  startProgress();
  startTimer();
}

// ─── URL パラメータ (?cat=jewelry) ───────────
function applyUrlParams() {
  const cat = new URLSearchParams(window.location.search).get('cat');
  if (cat && ['jewelry', 'apparel', 'art'].includes(cat)) {
    activeCat = cat;
    document.querySelectorAll('.cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === cat);
    });
  }
}

// ─── メイン初期化 ────────────────────────────
async function init() {
  initNav();
  initHero();
  initCategoryFilter();
  initSearch();
  applyUrlParams();

  const [products, tags] = await Promise.all([
    fetchProducts(),
    fetchTags(),
    logTableCounts(),
  ]);

  if (products === null) {
    allProducts = [];
  } else {
    allProducts = products;
    const usedTagIds = new Set();
    products.forEach(p => {
      (p.product_tags || []).forEach(pt => {
        if (pt.tags?.id) usedTagIds.add(pt.tags.id);
      });
    });
    renderTags(tags, usedTagIds);
  }

  renderProducts();
}

document.addEventListener('DOMContentLoaded', init);
