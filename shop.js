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

// ─── カテゴリ別タグマップ ─────────────────────
// { all: Tag[], jewelry: Tag[], apparel: Tag[], art: Tag[] }
let categoryTagMap = { all: [], jewelry: [], apparel: [], art: [] };

function buildCategoryTagMap(products) {
  const maps = { jewelry: new Map(), apparel: new Map(), art: new Map() };

  products.forEach(p => {
    const cat = p.category;
    if (!maps[cat]) return;
    (p.product_tags || []).forEach(pt => {
      const tag = pt.tags;
      if (tag && !maps[cat].has(tag.id)) maps[cat].set(tag.id, tag);
    });
  });

  // ALL: 各カテゴリから最大3件ずつ
  const allMap = new Map();
  ['jewelry', 'apparel', 'art'].forEach(cat => {
    [...maps[cat].values()].slice(0, 3).forEach(tag => {
      if (!allMap.has(tag.id)) allMap.set(tag.id, tag);
    });
  });

  categoryTagMap.all     = [...allMap.values()];
  categoryTagMap.jewelry = [...maps.jewelry.values()];
  categoryTagMap.apparel = [...maps.apparel.values()];
  categoryTagMap.art     = [...maps.art.values()];
}

// ─── タグドロップダウン ───────────────────────
function getTagDropdownEls() {
  return {
    btn:   document.getElementById('tagDropdownBtn'),
    label: document.getElementById('tagDropdownLabel'),
    menu:  document.getElementById('tagDropdownMenu'),
  };
}

function closeTagDropdown() {
  const { btn, menu } = getTagDropdownEls();
  menu?.classList.remove('open');
  btn?.classList.remove('open');
  btn?.setAttribute('aria-expanded', 'false');
}

function updateTagDropdown() {
  const { btn, label, menu } = getTagDropdownEls();
  if (!menu) return;

  const tags = categoryTagMap[activeCat] || [];

  // 選択中タグが新カテゴリに存在しない場合はリセット
  if (activeTag !== 'all' && !tags.some(t => t.id === activeTag)) {
    activeTag = 'all';
    if (label) label.textContent = 'タグ検索';
    btn?.classList.remove('has-selection');
  }

  // メニュー再構築
  menu.innerHTML = '';

  // リセット行
  const resetBtn = document.createElement('button');
  resetBtn.className = 'tag-dropdown-item reset-item' + (activeTag === 'all' ? ' active' : '');
  resetBtn.textContent = 'すべて';
  resetBtn.addEventListener('click', () => {
    activeTag = 'all';
    label.textContent = 'タグ検索';
    btn.classList.remove('has-selection');
    closeTagDropdown();
    renderProducts();
  });
  menu.appendChild(resetBtn);

  // タグ行
  tags.forEach(tag => {
    const item = document.createElement('button');
    item.className = 'tag-dropdown-item' + (activeTag === tag.id ? ' active' : '');
    item.textContent = tag.name_ja || tag.name;
    item.addEventListener('click', () => {
      activeTag = tag.id;
      label.textContent = tag.name_ja || tag.name;
      btn.classList.add('has-selection');
      closeTagDropdown();
      renderProducts();
    });
    menu.appendChild(item);
  });
}

function initTagDropdown() {
  const { btn, menu } = getTagDropdownEls();
  if (!btn || !menu) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
      closeTagDropdown();
    } else {
      menu.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  // メニュー内クリックは伝播しない（closeTagDropdownが発火しないよう）
  menu.addEventListener('click', e => e.stopPropagation());

  // 外側クリックで閉じる
  document.addEventListener('click', closeTagDropdown);
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
      const { label } = getTagDropdownEls();
      if (label) label.textContent = 'タグ検索';
      document.getElementById('tagDropdownBtn')?.classList.remove('has-selection');
      updateTagDropdown();
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
  initTagDropdown();
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
    buildCategoryTagMap(products);
    updateTagDropdown();
  }

  renderProducts();
}

document.addEventListener('DOMContentLoaded', init);
