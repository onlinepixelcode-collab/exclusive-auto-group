/* Home page: scroll-scrubbed hero, marque showcase, featured carousel, new arrivals, match step form, detail ribbon */
(function () {
  'use strict';
  const EAG = window.EAG, stock = EAG.stock, { img, esc, carUrl, R, km } = EAG;
  const byId = id => stock.find(c => c.id === id);
  const arrow = '<svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true"><path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>';
  const count = g => stock.filter(c => c.brandGroup === g).length;
  const LOGO = { 'Lamborghini': 'lamborghini', 'McLaren': 'mclaren', 'Porsche': 'porsche', 'Bentley': 'bentley', 'Mercedes-AMG': 'mercedes-amg', 'Mercedes-Benz': 'mercedes-benz', 'BMW M': 'bmw-m', 'BMW': 'bmw', 'Audi': 'audi', 'Maserati': 'maserati', 'Land Rover': 'land-rover', 'Toyota': 'toyota', 'Ford': 'ford', 'Volkswagen': 'volkswagen', 'Alfa Romeo': 'alfa-romeo', 'Jeep': 'jeep', 'MINI': 'mini', 'Hyundai': 'hyundai' };
  EAG.LOGO = LOGO;

  // ---------- [02] marque showcase: detail shots of the company's own cars ----------
  const MARQUES = [
    { g: 'Lamborghini', tag: 'Supercar', shot: 'assets/img/engine-revuelto.jpg', car: '28679986', line: 'V12 hybrid. Doors to the sky.' },
    { g: 'McLaren', tag: 'Supercar', shot: 'assets/img/detail-mclaren.jpg', car: '28767658', line: 'Carbon, light and lightning fast.' },
    { g: 'Porsche', tag: 'Sports', shot: 'assets/img/rear-911.jpg', car: '28515515', line: 'The benchmark, in Turbo S form.' },
    { g: 'Bentley', tag: 'Grand Tourer', shot: 'assets/img/detail-bentley.jpg', car: '28505509', line: 'Handcrafted in Crewe.' },
    { g: 'Mercedes-AMG', tag: 'Performance', shot: 'assets/img/detail-amg.jpg', car: '28531484', line: 'One man, one engine.' },
    { g: 'BMW M', tag: 'M Power', shot: 'assets/img/detail-bmw-m.jpg', car: '28405854', line: 'The most powerful letter in the world.' }
  ];
  const mList = document.getElementById('marques-list'), mStage = document.getElementById('marques-stage');
  mList.innerHTML = MARQUES.map((m, i) => `<li role="presentation"><button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">
      <span class="mq-plate"><img src="assets/img/logos/${LOGO[m.g]}.png" alt="" loading="lazy"></span>
      <span class="mq-name">${m.g}</span><span class="mq-count">${String(count(m.g)).padStart(2, '0')}</span><span class="mq-bar"><i></i></span></button></li>`).join('')
    + `<li class="mq-more"><a href="brands.html">+ ${new Set(stock.map(c => c.brandGroup)).size - MARQUES.length} more marques ${arrow}</a></li>`;
  mStage.innerHTML = MARQUES.map((m, i) => { const c = byId(m.car); return `<a class="mq-slide${i === 0 ? ' is-on' : ''}" href="inventory.html?brand=${encodeURIComponent(m.g)}" data-i="${i}" tabindex="${i === 0 ? 0 : -1}">
      <img src="${m.shot}" alt="${esc(m.g)} detail, ${c ? esc(c.year + ' ' + c.title) : ''} in stock" loading="lazy">
      <span class="mq-meta"><span class="eyebrow">${m.tag} · ${count(m.g)} in stock</span><b>${m.g}</b><em>${m.line}</em>
      ${c ? `<span class="mq-car">${c.year} ${esc(c.model.split(' ').slice(0, 3).join(' '))} · ${R(c.price)}</span>` : ''}<span class="link-arrow">View ${m.g} ${arrow}</span></span></a>`; }).join('');
  let mi = 0, mTimer;
  function showMarque(i, user) {
    mi = i;
    mList.querySelectorAll('[role=tab]').forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.classList.toggle('is-on', j === i); });
    mStage.querySelectorAll('.mq-slide').forEach((s, j) => { s.classList.toggle('is-on', j === i); s.tabIndex = j === i ? 0 : -1; });
    clearTimeout(mTimer); mTimer = setTimeout(() => showMarque((mi + 1) % MARQUES.length), user ? 9000 : 5000);
  }
  mList.addEventListener('mouseover', e => { const b = e.target.closest('[role=tab]'); if (b && +b.dataset.i !== mi) showMarque(+b.dataset.i, true); });
  mList.addEventListener('click', e => { const b = e.target.closest('[role=tab]'); if (b) showMarque(+b.dataset.i, true); });
  mList.addEventListener('focusin', e => { const b = e.target.closest('[role=tab]'); if (b) showMarque(+b.dataset.i, true); });
  showMarque(0);

  // ---------- [04] featured: auto-sliding carousel ----------
  const FEATURED = ['28679986', '28767658', '28515515', '28531484', '28405854', '28351486', '28505509', '28085854'];
  const fCars = FEATURED.map(byId).filter(Boolean);
  const fTrack = document.getElementById('featured-cards');
  fTrack.innerHTML = fCars.map(c => EAG.cardHTML(c, { tag: 'Featured' })).join('');
  let fi = 0, fTimer, fPaused = false;
  const perView = () => window.innerWidth < 640 ? 1 : window.innerWidth < 1180 ? 2 : 4;
  const fBar = document.getElementById('feat-bar'), fCount = document.getElementById('feat-count');
  function fGo(i) {
    const max = Math.max(0, fCars.length - perView());
    fi = i > max ? 0 : i < 0 ? max : i;
    const card = fTrack.children[0]; const step = card ? card.getBoundingClientRect().width + 20 : 0;
    fTrack.style.transform = `translateX(${-fi * step}px)`;
    fCount.textContent = String(fi + 1).padStart(2, '0') + ' / ' + String(max + 1).padStart(2, '0');
    fBar.style.transition = 'none'; fBar.style.transform = 'scaleX(0)';
    requestAnimationFrame(() => requestAnimationFrame(() => { fBar.style.transition = fPaused ? 'none' : 'transform 4.5s linear'; fBar.style.transform = fPaused ? 'scaleX(0)' : 'scaleX(1)'; }));
    clearTimeout(fTimer); if (!fPaused) fTimer = setTimeout(() => fGo(fi + 1), 4500);
  }
  document.getElementById('feat-next').onclick = () => fGo(fi + 1);
  document.getElementById('feat-prev').onclick = () => fGo(fi - 1);
  const fWrap = document.getElementById('featured-carousel');
  fWrap.addEventListener('mouseenter', () => { fPaused = true; clearTimeout(fTimer); fBar.style.transition = 'none'; fBar.style.transform = 'scaleX(0)'; });
  fWrap.addEventListener('mouseleave', () => { fPaused = false; fGo(fi); });
  fWrap.addEventListener('focusin', () => { fPaused = true; clearTimeout(fTimer); });
  let fx0 = null; fWrap.addEventListener('touchstart', e => { fx0 = e.touches[0].clientX; fPaused = true; clearTimeout(fTimer); }, { passive: true });
  fWrap.addEventListener('touchend', e => { if (fx0 == null) return; const dx = e.changedTouches[0].clientX - fx0; if (Math.abs(dx) > 40) fGo(fi + (dx < 0 ? 1 : -1)); fx0 = null; fPaused = false; setTimeout(() => fGo(fi), 10); });
  window.addEventListener('resize', () => fGo(fi));
  new IntersectionObserver(en => { if (en[0].isIntersecting) fGo(fi); else clearTimeout(fTimer); }, { threshold: .2 }).observe(fWrap);

  // ---------- new in the showroom: spotlight + arrivals list ----------
  (function arrivals() {
    const box = document.getElementById('arrivals'); if (!box) return;
    const latest = stock.slice().sort((a, b) => b.id - a.id).slice(0, 6);
    const name = c => `${esc(c.make.replace('Mercedes-', 'Mercedes '))} ${esc(c.model.replace(/\b(\w+) \1\b/i, '$1').split(' ').slice(0, 3).join(' '))}`;
    box.innerHTML = `
      <div class="ar-spot" id="ar-spot">
        <div class="ar-media" id="ar-media"></div>
        <div class="ar-info">
          <span class="ar-badge"><i></i>Just arrived</span>
          <span class="ar-count" id="ar-num">01 / ${String(latest.length).padStart(2, '0')}</span>
          <h3 class="ar-name" id="ar-name"></h3>
          <dl class="ar-specs" id="ar-specs"></dl>
          <div class="ar-bottom"><div class="ar-price" id="ar-price"></div>
            <div class="ar-actions"><a class="btn btn--white" id="ar-view" href="#">View car</a><a class="btn btn--light" id="ar-book" href="#" data-track="cta_book_viewing">Book a viewing</a></div></div>
        </div>
        <div class="ar-progress"><i id="ar-bar"></i></div>
      </div>
      <ol class="ar-list" id="ar-list" role="tablist" aria-label="Latest arrivals">
        ${latest.map((c, i) => `<li role="presentation"><button type="button" role="tab" class="ar-row" data-i="${i}" aria-selected="${i === 0}">
          <span class="ar-thumb"><img src="${img(c.images[0], 'Crop213x160')}" alt="" loading="lazy"></span>
          <span class="ar-row-text"><span class="tiny">${c.year} · ${km(c.mileage)}</span><b>${name(c)}</b></span>
          <span class="ar-row-price">${R(c.price)}</span></button></li>`).join('')}
      </ol>`;
    const media = box.querySelector('#ar-media'), list = box.querySelector('#ar-list'), bar = box.querySelector('#ar-bar');
    let cur = -1, timer, photoTimer, paused = false;
    function photos(c) {
      clearInterval(photoTimer);
      const pics = c.images.slice(0, 4);
      media.innerHTML = pics.map((u, k) => `<img src="${img(u, 'full')}" alt="${k ? '' : esc(c.year + ' ' + c.title)}" class="${k ? '' : 'on'}" ${k ? 'loading="lazy"' : ''}>`).join('');
      let k = 0; const ims = [...media.querySelectorAll('img')];
      photoTimer = setInterval(() => { ims[k].classList.remove('on'); k = (k + 1) % ims.length; ims[k].classList.add('on'); }, 2000);
    }
    function show(i, user) {
      if (i === cur && !user) return;
      cur = (i + latest.length) % latest.length; const c = latest[cur];
      photos(c);
      box.querySelector('#ar-name').innerHTML = `<span>${c.year}</span> ${name(c)}`;
      box.querySelector('#ar-specs').innerHTML = [['Mileage', km(c.mileage)], ['Engine', esc((c.engine || '—').split(' ').slice(0, 2).join(' '))], ['Power', c.kw ? c.kw + ' kW' : '—'], ['Gearbox', esc(c.transmission)]]
        .map(([l, v]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('');
      box.querySelector('#ar-price').textContent = R(c.price);
      box.querySelector('#ar-view').href = carUrl(c);
      box.querySelector('#ar-book').href = `contact.html?type=viewing&car=${c.id}`;
      box.querySelector('#ar-num').textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(latest.length).padStart(2, '0');
      list.querySelectorAll('.ar-row').forEach((r, j) => { r.setAttribute('aria-selected', j === cur); r.classList.toggle('is-on', j === cur); });
      if (window.gsap && !EAG.reduced) gsap.fromTo(box.querySelectorAll('#ar-name, #ar-specs > div, #ar-price, .ar-actions'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, stagger: .05, ease: 'power3.out' });
      clearTimeout(timer); bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)';
      if (paused) return;
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = 'transform 7s linear'; bar.style.transform = 'scaleX(1)'; }));
      timer = setTimeout(() => show(cur + 1), 7000);
    }
    list.addEventListener('mouseover', e => { const r = e.target.closest('.ar-row'); if (r && +r.dataset.i !== cur) show(+r.dataset.i, true); });
    list.addEventListener('click', e => { const r = e.target.closest('.ar-row'); if (!r) return; if (+r.dataset.i === cur && window.matchMedia('(hover: hover)').matches) location.href = carUrl(latest[cur]); else show(+r.dataset.i, true); });
    list.addEventListener('focusin', e => { const r = e.target.closest('.ar-row'); if (r) show(+r.dataset.i, true); });
    box.addEventListener('mouseenter', () => { paused = true; clearTimeout(timer); bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; });
    box.addEventListener('mouseleave', () => { paused = false; show(cur, true); });
    new IntersectionObserver(en => { if (en[0].isIntersecting) { if (cur < 0) show(0); else if (!paused) show(cur, true); } else { clearTimeout(timer); clearInterval(photoTimer); } }, { threshold: .25 }).observe(box);
  })();

  // ---------- [05] find your perfect match: step form ----------
  const numEl = document.getElementById('stock-count');
  numEl.textContent = EAG.reduced ? stock.length : '0';
  (function match() {
    const form = document.getElementById('match-form');
    const sel = { body: null, make: null, max: null, min: null };
    const BODIES = [['SUV', 'Room for everyone'], ['Coupe', 'Two doors, all drama'], ['Sedan', 'Fast and refined'], ['Convertible', 'Roof optional'], ['Bakkie', 'Built for anything'], ['Hatchback', 'Hot and practical']];
    const BUDGETS = [['Under R800k', 0, 800000], ['R800k – R1.5m', 800000, 1500000], ['R1.5m – R3m', 1500000, 3000000], ['R3m and up', 3000000, 0]];
    const filt = (o = sel) => stock.filter(c => (!o.body || c.body === o.body) && (!o.make || c.brandGroup === o.make) && (!o.min || c.price >= o.min) && (!o.max || c.price <= o.max));
    const opt = (key, val, label, sub, extra) => `<button type="button" class="m-opt" data-key="${key}" data-val="${esc(val)}" ${extra || ''}>${label}<span>${sub}</span></button>`;
    const steps = [...form.querySelectorAll('.match-step')], labels = ['Body type', 'Marque', 'Budget', 'Your matches'];
    let cur = 0;
    function renderOptions() {
      document.getElementById('mo-body').innerHTML = BODIES.map(([b, d]) => { const n = filt({ ...sel, body: b }).length; return opt('body', b, `<b>${b}</b>`, `${d} · ${n} in stock`, n ? '' : 'disabled'); }).join('');
      const groups = [...new Set(filt({ ...sel, make: null }).map(c => c.brandGroup))].sort((a, b) => count(b) - count(a));
      document.getElementById('mo-make').innerHTML = groups.map(g => opt('make', g, `<span class="mq-plate"><img src="assets/img/logos/${LOGO[g] || 'bmw'}.png" alt=""></span><b>${g}</b>`, `${filt({ ...sel, make: g }).length} cars`)).join('') + opt('make', '', '<b>Surprise me</b>', 'Show every marque');
      document.getElementById('mo-budget').innerHTML = BUDGETS.map(([l, mn, mx]) => { const n = filt({ ...sel, min: mn, max: mx }).length; return opt('budget', l, `<b>${l}</b>`, `${n} cars`, n ? '' : 'disabled'); }).join('');
    }
    function update() {
      const list = filt();
      document.getElementById('match-count').textContent = list.length;
      document.getElementById('match-bar').style.transform = `scaleX(${(cur + 1) / 4})`;
      document.getElementById('match-step-label').textContent = `Step ${Math.min(cur + 1, 3)} of 3 · ${labels[cur]}`;
      if (cur === 3) {
        document.getElementById('match-step-label').textContent = 'Done · ' + [sel.body, sel.make, sel.budget].filter(Boolean).join(' · ');
        document.getElementById('match-result-title').textContent = list.length ? `${list.length} car${list.length > 1 ? 's' : ''} made for you` : 'Nothing exact today';
        document.getElementById('match-results').innerHTML = list.length ? list.slice().sort((a, b) => b.price - a.price).slice(0, 3).map(c => `<a class="mini" href="${carUrl(c)}"><img src="${img(c.images[0], 'Crop213x160')}" alt=""><div><b>${c.year} ${esc(c.make)} ${esc(c.model.split(' ').slice(0, 2).join(' '))}</b><span>${km(c.mileage)} · ${esc(c.engine || '')}</span><strong>${R(c.price)}</strong></div></a>`).join('')
          : `<p class="lede" style="margin:0">If we don't have your vehicle, we will find it for you.</p><a class="btn" href="find.html">Find my ride</a>`;
        const q = new URLSearchParams(); if (sel.make) q.set('brand', sel.make); if (sel.body) q.set('body', sel.body); if (sel.max) q.set('max', sel.max); if (sel.min) q.set('min', sel.min);
        const go = document.getElementById('match-go'); go.href = 'inventory.html' + (q.toString() ? '?' + q : ''); go.textContent = list.length > 3 ? `Show all ${list.length} matches` : 'Open in inventory'; go.hidden = !list.length;
      } else document.getElementById('match-go').hidden = true;
      document.getElementById('match-back').hidden = cur === 0;
      document.getElementById('match-skip').hidden = cur === 3;
    }
    function goStep(i) {
      cur = i; renderOptions();
      steps.forEach((s, j) => { s.hidden = j !== i; });
      if (window.gsap && !EAG.reduced) gsap.fromTo(steps[i].querySelectorAll('.match-q, .m-opt, .mini, .match-results > *'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .55, stagger: .04, ease: 'power3.out' });
      update(); EAG.track('match_step', { step: i + 1 });
    }
    form.addEventListener('click', e => {
      const o = e.target.closest('.m-opt');
      if (o && !o.disabled) {
        if (o.dataset.key === 'body') sel.body = o.dataset.val;
        if (o.dataset.key === 'make') sel.make = o.dataset.val || null;
        if (o.dataset.key === 'budget') { const b = BUDGETS.find(x => x[0] === o.dataset.val); sel.budget = b[0]; sel.min = b[1] || null; sel.max = b[2] || null; }
        o.classList.add('is-picked'); setTimeout(() => goStep(Math.min(3, cur + 1)), 220);
      }
    });
    document.getElementById('match-back').onclick = () => { const k = ['body', 'make', 'budget'][cur - 1]; if (k === 'budget') { sel.budget = sel.min = sel.max = null; } else sel[k] = null; goStep(cur - 1); };
    document.getElementById('match-skip').onclick = () => goStep(Math.min(3, cur + 1));
    goStep(0);
  })();

  // ---------- [07] rating stat ----------
  if (EAG.googleRating) document.getElementById('stat-rating').innerHTML = `<b>${EAG.googleRating}★</b><span>Google rating</span>`;

  // ---------- [08] detail ribbon: only close-ups of the cars in stock ----------
  const D = [['28679986', [7, 8, 10, 11, 13, 14, 16, 18, 21]], ['28767658', [3, 6, 9, 13, 14, 16]], ['28515515', [5, 8, 9, 11, 13, 14]], ['28085854', [5, 9, 12, 13, 14, 18]],
    ['28405854', [5, 6, 9, 10, 13, 21]], ['28351486', [9, 10, 11, 16]], ['28505509', [1, 9, 13]], ['28531484', [9, 10, 13, 18]]];
  const shots = []; D.forEach(([id, idx]) => { const c = byId(id); if (c) idx.forEach(i => c.images[i] && shots.push({ c, u: c.images[i] })); });
  for (let i = shots.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [shots[i], shots[j]] = [shots[j], shots[i]]; }
  const half = Math.ceil(shots.length / 2);
  const row = list => list.map(s => `<a class="rb-item" href="${carUrl(s.c)}"><img src="${img(s.u, 'Crop800x600')}" alt="${esc(s.c.year + ' ' + s.c.make)} detail" loading="lazy"><span>${esc(s.c.make)} ${esc(s.c.model.split(' ')[0])}</span></a>`).join('');
  document.querySelectorAll('.ribbon-row').forEach((r, k) => { const list = k ? shots.slice(half) : shots.slice(0, half); const h = row(list); r.innerHTML = `<div class="ribbon-track">${h}<div class="ribbon-dup" aria-hidden="true">${h.replace(/href="[^"]*"/g, 'tabindex="-1"')}</div></div>`; });

  document.querySelectorAll('.js-wa').forEach(a => { a.href = EAG.waLink('Hi Exclusive Auto Group, I found you on your website.'); });

  // ---------- [01] hero ----------
  // Fly-through built from Exclusive Auto Group's own showroom photography
  const SCENES = [
    { src: 'assets/img/hero-1-showroom.jpg', fx: .5, fy: .55, z0: 1.0, z1: 1.45, label: 'The showroom' },
    { src: 'assets/img/hero-2-revuelto.jpg', fx: .45, fy: .6, z0: 1.0, z1: 1.5, label: 'The icon' },
    { src: 'assets/img/hero-3-lights.jpg', fx: .5, fy: .45, z0: 1.0, z1: 1.4, label: 'The details' },
    { src: 'assets/img/hero-4-wheel.jpg', fx: .5, fy: .5, z0: 1.0, z1: 1.5, label: 'The craft' },
    { src: 'assets/img/hero-5-cockpit.jpg', fx: .5, fy: .5, z0: 1.0, z1: 1.8, label: "The driver's seat" }
  ];
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const poster = hero.querySelector('.hero-poster');
  const tag = hero.querySelector('.hero-tagline');
  const chap = hero.querySelector('.hero-chapter');
  const bar = hero.querySelector('.hero-progress i');
  const hint = hero.querySelector('.scroll-hint'), dot = hero.querySelector('.scroll-dot');
  const images = SCENES.map(s => { const im = new Image(); im.decoding = 'async'; im.src = s.src; return im; });
  let W = 0, H = 0, progress = 0, ready = false;
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  function drawImg(im, zoom, fx, fy, alpha) {
    if (!im.complete || !im.naturalWidth) return;
    const s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * zoom;
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    // keep the focal point fixed on screen while zooming, clamped so the image always covers
    const x = fx * (W - w), y = fy * (H - h);
    ctx.globalAlpha = alpha; ctx.drawImage(im, x, y, w, h);
  }
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function draw() {
    if (!W) return;
    const n = SCENES.length, span = 1 / n, xfade = .32; // last 32% of each scene crossfades into the next
    const p = Math.min(.9999, Math.max(0, progress));
    const i = Math.floor(p / span), local = (p - i * span) / span;
    ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const a = SCENES[i];
    // accelerate the push-in during the transition so it feels like flying through
    const zA = a.z0 + (a.z1 - a.z0) * (local < 1 - xfade ? local / (1 - xfade) * .7 : .7 + .3 * ease((local - (1 - xfade)) / xfade) * 1.4);
    drawImg(images[i], zA, a.fx, a.fy, 1);
    if (local > 1 - xfade && i < n - 1) {
      const t = ease((local - (1 - xfade)) / xfade), b = SCENES[i + 1];
      drawImg(images[i + 1], b.z0 + .18 * (1 - t), b.fx, b.fy, t);
    }
    ctx.globalAlpha = 1;
    const idx = Math.min(n - 1, Math.floor((p + span * .25) / span));
    if (chap.dataset.i !== String(idx)) { chap.dataset.i = idx; chap.innerHTML = `<b>0${idx + 1}</b><span>${SCENES[idx].label}</span>`; }
    bar.style.transform = `scaleX(${p})`;
    const tg = Math.max(0, Math.min(1, (p - .78) / .12)); // tagline stays on the final frame
    if (tg > 0) { ctx.globalAlpha = tg * .4; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    tag.style.opacity = tg; tag.style.transform = `translateY(calc(-50% + ${(1 - tg) * 30}px))`;
    const hv = p < .03 ? 1 : Math.max(0, 1 - (p - .03) / .05);
    hint.style.opacity = hv; dot.style.opacity = hv;
  }

  function startHero() {
    ready = true; poster.style.opacity = 0; poster.style.transition = 'opacity .6s';
    size(); window.addEventListener('resize', size);
    if (EAG.reduced) { // static hero
      hero.style.height = '100vh'; setSolid(); if (window.ScrollTrigger) ScrollTrigger.refresh(); progress = .78; draw(); tag.style.opacity = 1; tag.style.transform = 'translateY(-50%)'; return;
    }
    if (isMobile()) { // shorter autoplaying version
      hero.style.height = '100svh'; setSolid();
      hint.textContent = 'Scroll';
      ScrollTrigger.refresh(); window.addEventListener('load', () => ScrollTrigger.refresh());
      const st = { p: 0 };
      gsap.to(st, { p: .999, duration: 14, ease: 'none', repeat: -1, repeatDelay: 1.2, onUpdate: () => { progress = st.p; draw(); hint.style.opacity = 1; dot.style.opacity = 1; } });
      return;
    }
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom bottom', scrub: .6,
      onUpdate: self => { progress = self.progress; requestAnimationFrame(draw); }
    });
  }
  // wait for the first two frames, then go; the rest stream in
  Promise.all(images.slice(0, 2).map(im => im.decode ? im.decode().catch(() => {}) : Promise.resolve())).then(() => {
    if (EAG.revealPage) EAG.revealPage();
    if (window.gsap) startHero(); else window.addEventListener('load', startHero);
  });
  images.forEach(im => im.addEventListener('load', () => ready && draw()));

  // header turns solid after the hero
  function setSolid() { document.body.dataset.solidAt = Math.max(40, hero.offsetHeight - window.innerHeight - 40); }
  setSolid(); window.addEventListener('resize', setSolid);
  window.addEventListener('load', setSolid);

  // ---------- counter + gallery zoom (after motion boots) ----------
  window.addEventListener('load', () => {
    if (!window.gsap || EAG.reduced) { numEl.textContent = stock.length; return; }
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: numEl, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: stock.length, duration: 2, ease: 'power3.out', onUpdate: () => { numEl.textContent = Math.round(o.v); } }) });
    document.querySelectorAll('[data-mosaic]').forEach(im => gsap.fromTo(im, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: im, start: 'top bottom', end: 'bottom top', scrub: true } }));
    document.querySelectorAll('.vbreak video, .split-media video').forEach(v => gsap.fromTo(v, { scale: 1.1 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: v.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });
})();
