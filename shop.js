/* =============================================
   CIELO SHOP — shop.js
   Supabase のみからデータ取得。モックデータなし。
   ============================================= */

// ─── 画像が存在しない場合のプレースホルダー ──────────
const PLACEHOLDER_IMG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
  '<rect fill="#1A1A1A" width="400" height="400"/>' +
  '<text x="200" y="196" text-anchor="middle" dominant-baseline="middle" ' +
  'fill="#2A2A2A" font-size="14" font-family="sans-serif" letter-spacing="8">CIELO</text>' +
  '</svg>'
);

// ─── 状態管理 ────────────────────────────────
let allProducts  = [];
let activeCat    = 'all';
let activeTag    = 'all';
let searchQuery  = '';
let fetchError   = null;   // null = 正常, Error = 接続失敗

// ─── Supabase 接続確認 & テーブルカウント ────────
async function logTableCounts() {
  const [pRes, iRes, vRes] = await Promise.all([
    db.from('products').select('*', { count: 'exact', head: true }),
    db.from('product_images').select('*', { count: 'exact', head: true }),
    db.from('product_variants').select('*', { count: 'exact', head: true }),
  ]);

  const pErr = pRes.error || iRes.error || vRes.error;
  if (pErr) {
    console.error('[CIELO] テーブルカウント取得失敗:', pErr.message, '| code:', pErr.code);
    console.warn('[CIELO] SQLが未実行の可能性があります。Supabase SQL Editor で create_tables.sql を実行してください。');
    return;
  }

  console.log(`Products: ${pRes.count}`);
  console.log(`Images: ${iRes.count}`);
  console.log(`Variants: ${vRes.count}`);
}

// ─── ブラウザコンソールから再テスト可能 ──────
window._cieloDebug = async function () {
  console.log('[CIELO Debug] Supabase URL:', SUPABASE_URL);
  console.log('[CIELO Debug] 接続テスト中...');
  const { data, error } = await db.from('products').select('id').limit(1);
  if (error) {
    console.error('[CIELO Debug] 接続失敗:', error);
  } else {
    console.log('[CIELO Debug] 接続OK。レスポンス:', data);
    await logTableCounts();
  }
};

// ─── 商品取得 ────────────────────────────────
// 戻り値: Product[] | null（null = 接続エラー）
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
    const matchCat = activeCat === 'all' || p.category === activeCat;
    const matchTag = activeTag === 'all'
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
  const grid     = document.getElementById('productGrid');
  const countEl  = document.getElementById('productsCount');

  // 接続エラー
  if (fetchError) {
    grid.innerHTML = `
      <div class="products-empty" style="grid-column:1/-1">
        <p>商品を読み込めませんでした</p>
        <p style="font-size:12px;color:var(--white-dim);margin-top:8px;">
          しばらく時間をおいて再度お試しください
        </p>
        <button
          onclick="location.reload()"
          style="margin-top:16px;padding:10px 20px;font-size:12px;font-weight:600;
                 letter-spacing:0.08em;text-transform:uppercase;
                 border:1px solid var(--border-h);color:var(--white-dim);background:none;cursor:pointer;">
          再読み込み
        </button>
      </div>`;
    countEl.textContent = '';
    return;
  }

  const filtered = filterProducts();

  // 検索・フィルター結果なし
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="products-empty" style="grid-column:1/-1">
        <p>商品が見つかりません</p>
        <p style="font-size:13px;margin-top:4px;color:var(--white-dim);">条件を変更してお試しください</p>
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

// ─── Hero Slider (3秒フェード) ───────────────
function initHero() {
  const container = document.getElementById('heroSlides');
  const dotsEl    = document.getElementById('heroDots');
  const titleEl   = document.getElementById('heroTitle');
  const titleJaEl = document.getElementById('heroTitleJa');
  let current = 0;
  let timer;

  if (!container || !window.HERO_IMAGES || HERO_IMAGES.length === 0) return;

  HERO_IMAGES.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    // 画像読み込みエラー時はフォールバック（グラデーション背景のまま）
    const img = new Image();
    img.onload = () => { slide.style.backgroundImage = `url('${src}')`; };
    img.src = src;
    container.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `スライド ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsEl.appendChild(dot);
  });

  function goTo(idx) {
    const slides = container.querySelectorAll('.hero-slide');
    const dots   = dotsEl.querySelectorAll('.hero-dot');
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + HERO_IMAGES.length) % HERO_IMAGES.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');

    if (window.HERO_CAPTIONS?.[current]) {
      titleEl.innerHTML    = HERO_CAPTIONS[current].en.replace('. ', '.<br>');
      titleJaEl.textContent = HERO_CAPTIONS[current].ja;
    }
  }

  function startTimer() { timer = setInterval(() => goTo(current + 1), 3000); }
  function resetTimer()  { clearInterval(timer); startTimer(); }
  startTimer();
}

// ─── モバイルメニュー ────────────────────────
function initMobileMenu() {
  const menu  = document.getElementById('mobileMenu');
  const open  = document.getElementById('menuOpen');
  const close = document.getElementById('menuClose');
  open?.addEventListener('click',  () => menu.classList.add('open'));
  close?.addEventListener('click', () => menu.classList.remove('open'));
  menu?.addEventListener('click',  e => { if (e.target === menu) menu.classList.remove('open'); });
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
  initHero();
  initCategoryFilter();
  initSearch();
  initMobileMenu();
  applyUrlParams();

  // 並行取得: 商品 + タグ + テーブルカウント（コンソールログ用）
  const [products, tags] = await Promise.all([
    fetchProducts(),
    fetchTags(),
    logTableCounts(),
  ]);

  // products が null = Supabase 接続失敗
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
