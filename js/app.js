(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const money = n => CURRENCY + n.toLocaleString('en-US');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ } }
  };

  /* ---------- Broken image fallback ---------- */
  document.addEventListener('error', e => {
    const img = e.target;
    if (img.tagName === 'IMG') { img.classList.add('img-fallback'); img.parentElement?.classList.add('img-wrap-fallback'); }
  }, true);

  const heroImg = $('.hero__arch video');
  let heroIntroDone = false;

  /* ---------- Split text ---------- */
  $$('[data-split]').forEach(word => {
    const text = word.textContent;
    const gold = word.classList.contains('word--gold');
    word.textContent = '';
    // gold word is revealed as one unit so its gradient stays continuous
    const parts = gold ? [text] : [...text];
    parts.forEach(ch => {
      const mask = document.createElement('span');
      mask.className = 'char-mask';
      const c = document.createElement('span');
      c.className = 'char' + (gold ? ' gold-fill' : '');
      c.textContent = ch;
      mask.appendChild(c);
      word.appendChild(mask);
    });
  });
  $$('.hero__title .char').forEach((c, i) => { c.style.transitionDelay = (0.15 + i * 0.02) + 's'; });

  /* ---------- Preloader ---------- */
  const start = performance.now();
  const finishLoading = () => {
    const wait = Math.max(0, 2700 - (performance.now() - start));
    setTimeout(() => {
      $('#preloader').classList.add('is-done');
      setTimeout(() => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
        runCounters();
        // after the intro zoom, let scroll parallax drive the hero image directly
        setTimeout(() => { heroImg.style.transition = 'none'; heroIntroDone = true; onScroll(); }, 1800);
      }, 1000); // start the hero intro just before the loader's curtain lifts
    }, reduceMotion ? 0 : wait);
  };
  let loaded = false;
  const onceLoaded = () => { if (!loaded) { loaded = true; finishLoading(); } };
  window.addEventListener('load', onceLoaded);
  setTimeout(onceLoaded, 4000); // don't let slow images hold the page hostage

  /* ---------- Counters ---------- */
  function runCounters() {
    $$('[data-count]').forEach(el => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || '';
      const dur = 1200, t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, Math.max(0, (now - t0) / dur));
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Custom cursor ---------- */
  const cursor = $('.cursor');
  if (finePointer && !reduceMotion) {
    const dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px)`; });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      const labelled = e.target.closest('[data-cursor]');
      const hoverable = e.target.closest('a, button, [data-hover], .card__media');
      cursor.classList.toggle('has-label', !!labelled);
      cursor.classList.toggle('is-hover', !!hoverable && !labelled);
      if (labelled) label.textContent = labelled.dataset.cursor;
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = 1; });
  } else {
    cursor.remove();
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  let lastY = 0;
  const onNavScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    const menuOpen = $('#mmenu').classList.contains('is-open');
    nav.classList.toggle('is-hidden', !menuOpen && y > 700 && y > lastY + 4);
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
  };

  const burger = $('#burger'), mmenu = $('#mmenu');
  const toggleMenu = open => {
    burger.classList.toggle('is-open', open);
    mmenu.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
  };
  burger.addEventListener('click', () => toggleMenu(!mmenu.classList.contains('is-open')));
  $$('#mmenu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Hero mouse parallax ---------- */
  const hero = $('.hero');
  if (finePointer && !reduceMotion) {
    const layers = $$('[data-depth]', hero);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    });
    hero.addEventListener('mouseleave', () => { tx = ty = 0; });
    (function loop() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      layers.forEach(l => {
        const d = +l.dataset.depth;
        l.style.translate = `${cx * d * -14}px ${cy * d * -14}px`;
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Scroll-driven effects ---------- */
  const storyImg = $('.story__img--main img');
  const lookbook = $('#lookbook'), lbTrack = $('#lbTrack'), lbProgress = $('#lbProgress');

  const onScroll = () => {
    onNavScroll();
    if (reduceMotion) return;
    const y = scrollY, vh = innerHeight;

    if (y < vh * 1.2 && heroIntroDone) {
      // zoom anchored at the top so the model's head always stays in frame
      heroImg.style.transform = `scale(${1 + Math.min(y, vh) * 0.00012})`;
    }

    const sr = storyImg.getBoundingClientRect();
    if (sr.bottom > 0 && sr.top < vh) {
      const p = (sr.top + sr.height / 2 - vh / 2) / vh;
      storyImg.style.transform = `scale(1.15) translateY(${p * 60}px)`;
    }
  };

  const updateLookbook = () => {
    const r = lookbook.getBoundingClientRect();
    const total = lookbook.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / total));
    const max = lbTrack.scrollWidth - innerWidth + 60;
    lbTrack.style.transform = `translate3d(${-p * Math.max(0, max)}px,0,0)`;
    lbProgress.style.transform = `scaleX(${p})`;
  };

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); updateLookbook(); ticking = false; });
  }, { passive: true });
  addEventListener('resize', updateLookbook);

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Products ---------- */
  const grid = $('#products');
  let wishlist = new Set(store.get('evermade-wish', []));

  const heartSVG = '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.3C1.4 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.3 4.3 6.7-1.8 4.7-9.3 9.3-9.3 9.3Z"/></svg>';
  const plusSVG = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';

  function cardHTML(p, i) {
    const badge = p.badge ? `<span class="card__badge ${p.badge === 'Sale' ? 'card__badge--sale' : ''}">${p.badge}</span>` : '';
    return `
      <article class="card${p.featured ? ' card--feature' : ''}" data-id="${p.id}" data-cat="${p.category}" style="transition-delay:${(i % 4) * 0.08}s">
        <div class="card__media" data-cursor="View">
          ${badge}
          <button class="card__wish ${wishlist.has(p.id) ? 'is-active' : ''}" aria-label="Add to wishlist">${heartSVG}</button>
          <img class="main" src="${p.images[0]}" alt="${p.name}" loading="lazy" />
          <img class="alt" src="${p.images[1] || p.images[0]}" alt="" loading="lazy" />
          <div class="card__quick">
            <p>Quick add — select size</p>
            <div class="card__sizes">${p.sizes.map(s => `<button data-size="${s}">${s}</button>`).join('')}</div>
          </div>
          <button class="card__add-mobile" aria-label="Add ${p.name} to bag">${plusSVG}</button>
        </div>
        <div class="card__body">
          <div>
            <div class="card__cat">${p.category}</div>
            <h3 class="card__name">${p.name}</h3>
            <div class="card__colors">${p.colors.map(c => `<i style="background:${c.hex}" title="${c.name}"></i>`).join('')}</div>
          </div>
          <div class="card__price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</div>
        </div>
      </article>`;
  }

  const cardIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); cardIO.unobserve(en.target); } });
  }, { threshold: 0.1 });

  function renderProducts(filter = 'all') {
    const list = PRODUCTS.filter(p => filter === 'all' || p.category === filter);
    // feature the first piece on the full grid so 13 products fill whole rows
    list.forEach((p, i) => { p.featured = filter === 'all' && i === 0; });
    grid.innerHTML = list.map(cardHTML).join('');
    $$('.card', grid).forEach(c => cardIO.observe(c));
    if (finePointer && !reduceMotion) bindTilt();
  }

  function bindTilt() {
    $$('.card__media', grid).forEach(m => {
      m.addEventListener('mousemove', e => {
        const r = m.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        m.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      m.addEventListener('mouseleave', () => {
        m.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1)';
        m.style.transform = '';
        setTimeout(() => { m.style.transition = ''; }, 800);
      });
    });
  }

  renderProducts();

  // Filters with sliding pill
  const filters = $('#filters'), pill = $('#filterPill');
  const movePill = btn => {
    pill.style.width = btn.offsetWidth + 'px';
    pill.style.height = btn.offsetHeight + 'px';
    pill.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
  };
  const setFilter = f => {
    const btn = $(`.filter[data-filter="${f}"]`, filters);
    if (!btn || btn.classList.contains('is-active')) return;
    $$('.filter', filters).forEach(b => b.classList.toggle('is-active', b === btn));
    movePill(btn);
    $$('.card', grid).forEach(c => c.classList.add('is-out'));
    setTimeout(() => renderProducts(f), reduceMotion ? 0 : 320);
  };
  filters.addEventListener('click', e => { const b = e.target.closest('.filter'); if (b) setFilter(b.dataset.filter); });
  requestAnimationFrame(() => movePill($('.filter.is-active', filters)));
  addEventListener('resize', () => movePill($('.filter.is-active', filters)));
  document.fonts?.ready.then(() => movePill($('.filter.is-active', filters)));
  $$('[data-filter-link]').forEach(a => a.addEventListener('click', () => setFilter(a.dataset.filterLink)));

  // Card interactions (delegated)
  grid.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const p = PRODUCTS.find(x => x.id === card.dataset.id);
    const img = $('img.main', card);

    const wish = e.target.closest('.card__wish');
    if (wish) { toggleWish(p.id, wish); return; }

    const sizeBtn = e.target.closest('[data-size]');
    if (sizeBtn) { addToCart(p, sizeBtn.dataset.size, p.colors[0].name, 1, img); return; }

    if (e.target.closest('.card__add-mobile') || e.target.closest('.card__media') || e.target.closest('.card__name')) {
      openModal(p);
    }
  });

  // Hero card + lookbook looks open their product
  $$('[data-product]').forEach(el => el.addEventListener('click', () => {
    const p = PRODUCTS.find(x => x.id === el.dataset.product);
    if (p) openModal(p);
  }));

  /* ---------- Wishlist ---------- */
  const wishCount = $('#wishCount');
  const renderWish = () => {
    wishCount.textContent = wishlist.size;
    wishCount.classList.toggle('is-visible', wishlist.size > 0);
  };
  function toggleWish(id, btn) {
    const p = PRODUCTS.find(x => x.id === id);
    if (wishlist.has(id)) { wishlist.delete(id); btn.classList.remove('is-active'); }
    else { wishlist.add(id); btn.classList.add('is-active'); toast(p.images[0], 'Saved to wishlist', p.name); }
    store.set('evermade-wish', [...wishlist]);
    renderWish();
  }
  renderWish();
  $('#wishBtn').addEventListener('click', () => {
    toast(null, `${wishlist.size} saved ${wishlist.size === 1 ? 'piece' : 'pieces'}`, 'Wishlist page coming soon');
  });
  $('#searchBtn').addEventListener('click', () => toast(null, 'Search', 'Coming soon'));

  /* ---------- Quick view modal ---------- */
  const modal = $('#modal');
  const m = { product: null, size: null, color: null, qty: 1 };

  function openModal(p) {
    Object.assign(m, { product: p, size: null, color: p.colors[0].name, qty: 1 });
    $('#mImg').src = p.images[0];
    $('#mImg').alt = p.name;
    $('#mThumbs').innerHTML = p.images.length < 2 ? '' : p.images.map((src, i) => `<button class="${i === 0 ? 'is-active' : ''}" data-src="${src}"><img src="${src}" alt="" /></button>`).join('');
    $('#mCat').innerHTML = `<span class="line"></span> ${p.category}`;
    $('#mName').textContent = p.name;
    $('#mPrice').innerHTML = money(p.price) + (p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : '');
    $('#mRating').innerHTML = `<b>★★★★★</b> ${p.rating.toFixed(1)} · ${p.reviews} reviews`;
    $('#mDesc').textContent = p.desc;
    $('#mColorName').textContent = m.color;
    $('#mColors').innerHTML = p.colors.map((c, i) => `<button class="${i === 0 ? 'is-active' : ''}" style="background:${c.hex}" data-color="${c.name}" aria-label="${c.name}"></button>`).join('');
    $('#mSizes').innerHTML = p.sizes.map(s => `<button data-size="${s}">UK ${s}</button>`).join('');
    $('#mQty').textContent = 1;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!cartEl.classList.contains('is-open')) document.body.classList.remove('no-scroll');
  }
  modal.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return closeModal();
    const thumb = e.target.closest('#mThumbs button');
    if (thumb) {
      $$('#mThumbs button').forEach(b => b.classList.toggle('is-active', b === thumb));
      const big = $('#mImg');
      big.style.opacity = 0;
      setTimeout(() => { big.src = thumb.dataset.src; big.style.opacity = 1; }, 200);
    }
    const sw = e.target.closest('#mColors button');
    if (sw) {
      m.color = sw.dataset.color;
      $$('#mColors button').forEach(b => b.classList.toggle('is-active', b === sw));
      $('#mColorName').textContent = m.color;
    }
    const sz = e.target.closest('#mSizes button');
    if (sz) {
      m.size = sz.dataset.size;
      $$('#mSizes button').forEach(b => b.classList.toggle('is-active', b === sz));
    }
  });
  $('#mMinus').addEventListener('click', () => { m.qty = Math.max(1, m.qty - 1); $('#mQty').textContent = m.qty; });
  $('#mPlus').addEventListener('click', () => { m.qty = Math.min(10, m.qty + 1); $('#mQty').textContent = m.qty; });
  $('#mAdd').addEventListener('click', () => {
    if (!m.size) {
      const s = $('#mSizes');
      s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
      toast(null, 'Please select a size', m.product.name);
      return;
    }
    addToCart(m.product, m.size, m.color, m.qty, $('#mImg'));
    closeModal();
  });

  /* ---------- Cart ---------- */
  const cartEl = $('#cart'), overlay = $('#overlay');
  let cart = store.get('evermade-cart', []).filter(i => PRODUCTS.some(p => p.id === i.id));

  const openCart = () => {
    cartEl.classList.add('is-open'); overlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
  };
  const closeCart = () => {
    cartEl.classList.remove('is-open'); overlay.classList.remove('is-open');
    if (!modal.classList.contains('is-open')) document.body.classList.remove('no-scroll');
  };
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  $('#emptyShop').addEventListener('click', closeCart);
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('is-open')) closeModal();
    else if (cartEl.classList.contains('is-open')) closeCart();
    else if (mmenu.classList.contains('is-open')) toggleMenu(false);
  });

  function addToCart(p, size, color, qty, sourceImg) {
    const key = `${p.id}|${size}|${color}`;
    const existing = cart.find(i => i.key === key);
    if (existing) existing.qty = Math.min(10, existing.qty + qty);
    else cart.push({ key, id: p.id, size, color, qty });
    saveCart();
    flyToCart(sourceImg, p.images[0], () => {
      renderCart();
      const btn = $('#cartBtn');
      btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
    });
    toast(p.images[0], 'Added to bag', `${p.name} · UK ${size}`);
  }

  function flyToCart(sourceImg, src, done) {
    const target = $('#cartBtn').getBoundingClientRect();
    const from = sourceImg?.getBoundingClientRect();
    if (reduceMotion || !from || !from.width || !Element.prototype.animate) { done(); return; }
    const clone = document.createElement('img');
    clone.src = src; clone.className = 'fly';
    const w = Math.min(from.width, 220), h = w * 1.3;
    const sx = from.left + from.width / 2 - w / 2, sy = from.top + from.height / 2 - h / 2;
    Object.assign(clone.style, { left: sx + 'px', top: sy + 'px', width: w + 'px', height: h + 'px' });
    document.body.appendChild(clone);
    const dx = target.left + target.width / 2 - (sx + w / 2);
    const dy = target.top + target.height / 2 - (sy + h / 2);
    const anim = clone.animate([
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1, borderRadius: '14px' },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 80}px) scale(.6) rotate(-8deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.08) rotate(10deg)`, opacity: 0.3, borderRadius: '50%' }
    ], { duration: 950, easing: 'cubic-bezier(.65,0,.35,1)' });
    anim.onfinish = () => { clone.remove(); done(); };
  }

  function saveCart() { store.set('evermade-cart', cart.map(({ key, id, size, color, qty }) => ({ key, id, size, color, qty }))); }

  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const subtotal = cart.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0);

    const badge = $('#cartCount');
    badge.textContent = count;
    badge.classList.toggle('is-visible', count > 0);
    $('#cartHeadCount').textContent = `(${count})`;
    cartEl.classList.toggle('is-empty', count === 0);

    $('#cartItems').innerHTML = cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return `
        <div class="citem" data-key="${i.key}">
          <img src="${p.images[0]}" alt="${p.name}" />
          <div>
            <div class="citem__top">
              <div><div class="citem__name">${p.name}</div><div class="citem__meta">${i.color} · UK ${i.size}</div></div>
              <strong>${money(p.price * i.qty)}</strong>
            </div>
            <div class="citem__bottom">
              <div class="qty"><button data-act="dec" aria-label="Decrease">−</button><span>${i.qty}</span><button data-act="inc" aria-label="Increase">+</button></div>
              <button class="citem__remove" data-act="remove">Remove</button>
            </div>
          </div>
        </div>`;
    }).join('');

    $('#cartSubtotal').textContent = money(subtotal);
    const left = FREE_SHIP - subtotal;
    $('#shipText').innerHTML = left > 0
      ? `You're <b>${money(left)}</b> away from complimentary shipping`
      : `✦ You've unlocked <b>complimentary shipping</b>`;
    $('#shipBar').style.width = Math.min(100, (subtotal / FREE_SHIP) * 100) + '%';
    $('#cartShipping').textContent = left > 0 ? 'Calculated at checkout' : 'Complimentary';
  }

  $('#cartItems').addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const row = btn.closest('.citem');
    const item = cart.find(i => i.key === row.dataset.key);
    const act = btn.dataset.act;
    if (act === 'inc') item.qty = Math.min(10, item.qty + 1);
    if (act === 'dec') item.qty -= 1;
    if (act === 'remove' || item.qty < 1) {
      cart = cart.filter(i => i !== item);
      saveCart();
      row.classList.add('is-removing');
      setTimeout(renderCart, reduceMotion ? 0 : 450);
      return;
    }
    saveCart();
    renderCart();
  });

  $('#checkoutBtn').addEventListener('click', () => {
    toast(null, 'Checkout', 'This is a frontend demo — no payment backend connected');
  });

  renderCart();

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(img, title, text) {
    const ti = $('#toastImg');
    ti.style.display = img ? '' : 'none';
    if (img) ti.src = img;
    $('#toastTitle').textContent = title;
    $('#toastText').textContent = text;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2800);
  }

  /* ---------- Reels: only play while on screen ---------- */
  const videoIO = new IntersectionObserver(entries => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting && !reduceMotion) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.2 });
  $$('video[data-autoplay]').forEach(v => videoIO.observe(v));

  /* ---------- Testimonials ---------- */
  const slides = $$('.tslide'), dots = $$('#tdots button');
  let current = 0, sliderTimer;
  const goTo = n => {
    current = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  };
  const autoplay = () => { clearInterval(sliderTimer); sliderTimer = setInterval(() => goTo(current + 1), 6000); };
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); autoplay(); }));
  autoplay();

  /* ---------- Newsletter ---------- */
  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    e.target.reset();
    toast(null, 'Welcome to the Inner Circle', 'Your 10% code: EVERMADE10');
  });

  onScroll();
  updateLookbook();
})();
