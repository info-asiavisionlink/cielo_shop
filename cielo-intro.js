/* ============================================================
   CIELO — Immersive Intro & Motion System
   cielo-intro.js

   Handles:
   1. Page transition  — 7×4 grid cell wipe (pantone style)
   2. Hero intro       — brand reveal sequence
   3. Text animation   — mask reveal utility
   4. Stagger links    — nav hover ghost-text trick
   5. Scroll parallax  — subtle depth on brand / bg
   6. Page intercept   — cover → navigate
   ============================================================ */

/* immediately mark JS available — CSS uses .cielo-js for initial states */
document.documentElement.classList.add('cielo-js');

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── constants ─────────────────────────────────────── */
  const PT_COLS   = 7;
  const PT_ROWS   = 4;
  const EASE_OUT  = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const EASE_IN   = 'cubic-bezier(0.7, 0, 1, 0.7)';
  const SESSION_KEY = 'cielo-pt';

  /* ─── PageTransition ─────────────────────────────────
     Grid of black cells that wipe on/off screen.
     cover()  → fills screen before navigation
     reveal() → uncovers screen after new page loads
  ───────────────────────────────────────────────────── */
  const PT = (function () {
    let el    = null;
    let cells = [];

    function init() {
      el = document.getElementById('cielo-pt');
      if (!el) return;

      for (let i = 0; i < PT_COLS * PT_ROWS; i++) {
        const cell = document.createElement('div');
        cell.className = 'pt-cell';
        el.appendChild(cell);
        cells.push(cell);
      }
    }

    /* set all cells instantly (no transition) */
    function snapAll(scaleY, origin) {
      cells.forEach(cell => {
        cell.style.transition = 'none';
        cell.style.transformOrigin = origin;
        cell.style.transform = `scaleY(${scaleY})`;
      });
    }

    /* animate cells staggered by column */
    function animateAll(toScale, origin, duration, easing, colDelay, onDone) {
      cells.forEach((cell, i) => {
        const col   = i % PT_COLS;
        const delay = col * colDelay;
        requestAnimationFrame(() => {
          cell.style.transformOrigin = origin;
          cell.style.transition = `transform ${duration}ms ${easing} ${delay}ms`;
          cell.style.transform  = `scaleY(${toScale})`;
        });
      });
      if (onDone) {
        const total = (PT_COLS - 1) * colDelay + duration;
        setTimeout(onDone, total);
      }
    }

    /* reveal — uncovers page (used on page load from transition) */
    function reveal(baseDelay) {
      if (!el || REDUCED) return;
      el.style.pointerEvents = 'none';

      snapAll(1, 'top');

      setTimeout(() => {
        animateAll(0, 'top', 720, EASE_OUT, 55, () => {
          el.style.display = 'none';
        });
      }, baseDelay || 0);
    }

    /* cover — fills screen before navigating */
    function cover(callback) {
      if (!el || REDUCED) {
        if (callback) callback();
        return;
      }
      el.style.display = 'grid';
      el.style.pointerEvents = 'all';

      snapAll(0, 'bottom');

      setTimeout(() => {
        animateAll(1, 'bottom', 550, EASE_IN, 42, () => {
          sessionStorage.setItem(SESSION_KEY, '1');
          if (callback) callback();
        });
      }, 10);
    }

    /* did we arrive here from a within-site navigation? */
    function fromTransition() {
      const flag = sessionStorage.getItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      return !!flag;
    }

    return { init, reveal, cover, fromTransition };
  })();

  /* ─── HeroBackground ─────────────────────────────────
     shop.js calls window.cieloSetHeroBg(url) after
     fetching hero slides from Supabase.
  ───────────────────────────────────────────────────── */
  window.cieloSetHeroBg = function (url) {
    if (!url) return;
    const bgEl = document.getElementById('hiBgImg');
    if (!bgEl) return;

    const img = new Image();
    img.onload = function () {
      bgEl.style.backgroundImage = `url('${url}')`;
      /* tiny delay so the transition fires */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bgEl.classList.add('loaded');
        });
      });
    };
    img.src = url;
  };

  /* ─── HeroIntro ──────────────────────────────────────
     Orchestrates the brand reveal sequence.

     Timeline (from intro start):
       0ms   eyebrow mask slides up
      250ms  C appears
      310ms  I appears
      370ms  E appears
      430ms  L appears
      490ms  O appears
      700ms  subtitle slides up
      920ms  scroll indicator grows
      300ms  nav fades in (relative to PT start)
  ───────────────────────────────────────────────────── */
  function runHeroIntro(delay) {
    const BASE = delay || 0;

    if (REDUCED) {
      /* instantly show everything */
      document.querySelectorAll('.hi-char, .hi-eyebrow, .hi-sub').forEach(el => {
        el.classList.add('animate');
      });
      const scroll = document.querySelector('.hi-scroll');
      if (scroll) scroll.classList.add('animate');
      const nav = document.getElementById('nav');
      if (nav) nav.classList.add('intro-done');
      return;
    }

    const eyebrow = document.querySelector('.hi-eyebrow');
    const chars   = document.querySelectorAll('.hi-char');
    const sub     = document.querySelector('.hi-sub');
    const scroll  = document.querySelector('.hi-scroll');
    const nav     = document.getElementById('nav');

    /* nav */
    if (nav) {
      setTimeout(() => nav.classList.add('intro-done'), BASE + 200);
    }

    /* eyebrow */
    if (eyebrow) {
      setTimeout(() => eyebrow.classList.add('animate'), BASE);
    }

    /* brand letters */
    chars.forEach(char => {
      const charDelay = parseInt(char.dataset.delay || 0, 10);
      setTimeout(() => char.classList.add('animate'), BASE + 250 + charDelay);
    });

    /* subtitle */
    if (sub) {
      setTimeout(() => sub.classList.add('animate'), BASE + 700);
    }

    /* scroll indicator */
    if (scroll) {
      setTimeout(() => scroll.classList.add('animate'), BASE + 920);
    }
  }

  /* ─── StaggerLinks ───────────────────────────────────
     text-shadow ghost trick: the link text scrolls up
     on hover, revealing a shadow "copy" below.
     Same technique as the Gabriele Serrini reference.
  ───────────────────────────────────────────────────── */
  function initStaggerLinks() {
    if (REDUCED) return;
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.add('stagger-link');
    });
  }

  /* ─── ScrollParallax ─────────────────────────────────
     Brand: moves up slowly as user scrolls (parallax).
     Background image: opposite direction at half speed.
  ───────────────────────────────────────────────────── */
  function initScrollParallax() {
    if (REDUCED) return;

    const brand = document.querySelector('.hi-brand');
    const bg    = document.getElementById('hiBgImg');
    const hero  = document.querySelector('.hero-immersive');
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y  = window.scrollY;
          const vh = hero ? hero.offsetHeight : window.innerHeight;

          if (y > vh) { ticking = false; return; }

          const progress = y / vh; /* 0 → 1 as user scrolls through hero */

          if (brand) {
            brand.style.transform = `translateY(${y * -0.12}px)`;
          }
          if (bg) {
            /* keep the base scale(1.07) from CSS */
            bg.style.transform = `scale(1.07) translateY(${y * 0.04}px)`;
          }

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─── PageIntercept ──────────────────────────────────
     Intercept local link clicks → cover → navigate.
  ───────────────────────────────────────────────────── */
  function initPageIntercept() {
    if (REDUCED) return;

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href   = link.getAttribute('href');
      const target = link.getAttribute('target');
      if (!href) return;

      /* skip: anchors, mail, external, new-tab, JS */
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('javascript') ||
        target === '_blank'
      ) return;

      e.preventDefault();
      PT.cover(() => {
        window.location.href = href;
      });
    });
  }

  /* ─── Boot ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    PT.init();

    if (!REDUCED && PT.fromTransition()) {
      /* came from within-site navigation: reveal cells, then start intro */
      PT.reveal(0);
      runHeroIntro(420); /* start after PT begins revealing */
    } else {
      /* direct load: no PT needed, start intro gently */
      runHeroIntro(REDUCED ? 0 : 120);
    }

    initStaggerLinks();
    initScrollParallax();
    initPageIntercept();
  });

})();
