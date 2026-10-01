// Signature motion layer: smooth scroll, velocity marquee, spotlight, manifesto, reveals.
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Preloader counter ---------- */
  const countEl = $('#loadCount'), lineEl = $('#loadLine');
  if (countEl) {
    const t0 = performance.now(), dur = reduce ? 1 : 2500;
    const tick = now => {
      const p = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      countEl.textContent = Math.round(e * 100);
      lineEl.style.transform = `scaleX(${e})`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    // pause while the preloader, cart, modal or menu lock the page
    const sync = () => {
      const locked = document.body.classList.contains('is-loading') || document.body.classList.contains('no-scroll');
      locked ? lenis.stop() : lenis.start();
    };
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sync();

    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      const id = a?.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.start();
      lenis.scrollTo(target, { duration: 1.6 });
    });
  }

  /* ---------- Word splitting (keeps <em>, <br> and pills intact) ---------- */
  function splitWords(root, wrap) {
    const units = [];
    [...root.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const el = wrap(part);
          units.push(el);
          frag.appendChild(el);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        if (node.classList.contains('pill')) units.push(node);
        else units.push(...splitWords(node, wrap));
      }
    });
    return units;
  }

  /* ---------- Headings rise word by word ---------- */
  const headIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-split-in'); headIO.unobserve(en.target); } });
  }, { threshold: 0.3 });
  $$('.section-head h2, .story__text h2, .newsletter__card h2, .lookbook__intro h2').forEach(h => {
    const words = splitWords(h, text => {
      const outer = document.createElement('span'); outer.className = 'sw';
      const inner = document.createElement('span'); inner.className = 'swi'; inner.textContent = text;
      outer.appendChild(inner);
      return outer;
    });
    words.forEach((w, i) => { w.firstChild.style.transitionDelay = (i * 0.07) + 's'; });
    h.classList.add('split');
    if (reduce) h.classList.add('is-split-in'); else headIO.observe(h);
  });

  /* ---------- Manifesto ---------- */
  const manifesto = $('#manifestoText');
  const mUnits = manifesto ? splitWords(manifesto, text => {
    const s = document.createElement('span'); s.className = 'mw'; s.textContent = text; return s;
  }) : [];
  let lastLit = -1;
  function updateManifesto(vh) {
    const r = manifesto.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) return;
    const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.15), 0, 1);
    const lit = Math.round(p * mUnits.length);
    if (lit === lastLit) return;
    lastLit = lit;
    mUnits.forEach((u, i) => u.classList.toggle('is-lit', i < lit));
  }
  if (reduce) mUnits.forEach(u => u.classList.add('is-lit'));

  /* ---------- Nav links roll ---------- */
  $$('.nav__links a').forEach(a => {
    const t = a.textContent.trim();
    a.innerHTML = `<span class="roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  });

  /* ---------- Footer wordmark ---------- */
  const big = $('.footer__big');
  if (big) {
    const word = big.textContent.trim();
    big.innerHTML = [...word].map((ch, i) => `<span class="fbl" style="transition-delay:${i * 0.06}s">${ch}</span>`).join('');
    const fIO = new IntersectionObserver(([en]) => { if (en.isIntersecting) { big.classList.add('is-in'); fIO.disconnect(); } }, { threshold: 0.3 });
    fIO.observe(big);
    // let the per-letter hover colour respond instantly after the entrance
    big.addEventListener('transitionend', () => $$('.fbl', big).forEach(l => { l.style.transitionDelay = '0s'; }), { once: true });
  }

  /* ---------- Product card light ---------- */
  if (fine) {
    document.addEventListener('mousemove', e => {
      const m = e.target.closest && e.target.closest('.card__media');
      if (!m) return;
      const r = m.getBoundingClientRect();
      m.style.setProperty('--sx', (e.clientX - r.left) + 'px');
      m.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- Hero spotlight targets ---------- */
  const hero = $('.hero'), gallery = $('#heroGallery');
  const heroContent = $('.hero__content'), heroVisual = $('.hero__visual');
  const spot = { x: -999, y: -999, r: 0, tx: -999, ty: -999, tr: 0 };
  if (fine && !reduce && gallery) {
    hero.addEventListener('mousemove', e => {
      const r = gallery.getBoundingClientRect();
      spot.tx = e.clientX - r.left; spot.ty = e.clientY - r.top; spot.tr = 340;
      if (spot.x < -900) { spot.x = spot.tx; spot.y = spot.ty; }
    });
    hero.addEventListener('mouseleave', () => { spot.tr = 0; });
  }

  /* ---------- Velocity marquee ---------- */
  const track = $('.marquee__track');
  let half = 0, mx = 0, dir = 1;
  const measure = () => { if (track) half = (track.scrollWidth + 32) / 2; };
  measure();
  addEventListener('resize', measure);
  document.fonts?.ready.then(measure);

  /* ---------- Main loop ---------- */
  const bar = $('#scrollProgress');
  let lastY = scrollY, vel = 0;
  (function loop() {
    const y = scrollY, vh = innerHeight;
    vel += ((y - lastY) - vel) * 0.12;
    lastY = y;

    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (!reduce) {
      if (track && half) {
        if (vel > 0.3) dir = 1; else if (vel < -0.3) dir = -1;
        mx -= (0.6 + Math.min(Math.abs(vel) * 0.3, 16)) * dir;
        if (mx <= -half) mx += half;
        if (mx > 0) mx -= half;
        track.style.transform = `translate3d(${mx}px,0,0) skewX(${clamp(-vel * 0.4, -12, 12)}deg)`;
      }

      if (y < vh * 1.3 && document.body.classList.contains('is-ready')) {
        heroContent.style.transform = `translate3d(0,${y * 0.22}px,0)`;
        heroContent.style.opacity = clamp(1 - y / (vh * 0.85), 0, 1);
        heroVisual.style.transform = `translate3d(0,${y * 0.08}px,0)`;
      }

      if (gallery) {
        spot.x += (spot.tx - spot.x) * 0.1;
        spot.y += (spot.ty - spot.y) * 0.1;
        spot.r += (spot.tr - spot.r) * 0.06;
        gallery.style.setProperty('--mx', spot.x + 'px');
        gallery.style.setProperty('--my', spot.y + 'px');
        gallery.style.setProperty('--mr', spot.r + 'px');
      }
    }

    if (manifesto && !reduce) updateManifesto(vh);
    requestAnimationFrame(loop);
  })();
})();
