/* Car detail page */
(function () {
  'use strict';
  const EAG = window.EAG, stock = EAG.stock, { R, km, monthly, esc, img, waLink, track } = EAG;
  const id = new URLSearchParams(location.search).get('id');
  const c = stock.find(x => x.id === id) || stock[0];
  c.model = c.model.replace(/\b(\w+) \1\b/i, '$1');
  const t = EAG.splitTitle(c);
  const full = c.year + ' ' + c.title;
  document.title = `${full} for sale | ${R(c.price)} | Exclusive Auto Group Cape Town`;
  document.querySelector('meta[name=description]').setAttribute('content', `${full}, ${km(c.mileage)}, ${c.engine}, ${c.kw} kW. ${R(c.price)} at Exclusive Auto Group, N1 City, Cape Town. Finance and trade-ins welcome.`);

  // hero title over the scroll story
  document.getElementById('car-h1').innerHTML = `<span>${c.year} ${esc(c.make)}</span> ${esc(c.model.split(' ').slice(0, 4).join(' '))}`;
  document.getElementById('film-price').textContent = R(c.price);
  document.getElementById('film-crumb-car').textContent = c.make + ' ' + c.model.split(' ')[0];

  // continuous photo strip: every image of this car, pauses on hover, click to enlarge
  const strip = document.getElementById('car-strip');
  const cells = c.images.map((u, i) => `<button type="button" class="cs-item" data-i="${i}" aria-label="Open photo ${i + 1} of ${c.images.length}"><img src="${img(u, 'Crop800x600')}" alt="${esc(full)} photo ${i + 1}" loading="lazy"></button>`).join('');
  strip.innerHTML = `<div class="cs-track" style="--dur:${Math.max(40, c.images.length * 4.5)}s">${cells}<div class="cs-dup" aria-hidden="true">${cells.replace(/<button /g, '<button tabindex="-1" ')}</div></div>`;
  document.getElementById('strip-count').textContent = c.images.length + ' photos · hover to pause';
  const lb = document.getElementById('lightbox'), lbImg = lb.querySelector('img'), lbCount = lb.querySelector('.lb-count');
  let li = 0, lastF = null;
  const lbShow = i => { li = (i + c.images.length) % c.images.length; lbImg.src = img(c.images[li], 'full'); lbImg.alt = full + ' photo ' + (li + 1); lbCount.textContent = (li + 1) + ' / ' + c.images.length; };
  const lbOpen = i => { lastF = document.activeElement; lb.hidden = false; document.body.classList.add('lb-open'); if (EAG.lenis) EAG.lenis.stop(); lbShow(i); lb.querySelector('.lb-x').focus(); track('gallery_open', { id: c.id }); };
  const lbClose = () => { lb.hidden = true; document.body.classList.remove('lb-open'); if (EAG.lenis) EAG.lenis.start(); if (lastF) lastF.focus(); };
  strip.addEventListener('click', e => { const b = e.target.closest('.cs-item'); if (b) lbOpen(+b.dataset.i); });
  lb.querySelector('.lb-x').onclick = lbClose; lb.querySelector('.lb-prev').onclick = () => lbShow(li - 1); lb.querySelector('.lb-next').onclick = () => lbShow(li + 1);
  lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
  document.addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowRight') lbShow(li + 1); if (e.key === 'ArrowLeft') lbShow(li - 1); });
  let lsx = null; lb.addEventListener('touchstart', e => lsx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { if (lsx == null) return; const dx = e.changedTouches[0].clientX - lsx; if (Math.abs(dx) > 40) lbShow(li + (dx < 0 ? 1 : -1)); lsx = null; });

  // sticky panel
  const msg = `Hi Exclusive Auto Group, I'm interested in the ${full} (${R(c.price)}). Ref ${c.id}.`;
  document.getElementById('panel').innerHTML = `
    <span class="tiny">${c.year} · Ref ${c.id}</span>
    <div class="card-title" style="font-size:30px;margin:4px 0 0">${esc(t.name)}</div>
    <div class="card-trim" style="min-height:0">${esc(t.trim)}</div>
    <div class="card-price" style="margin-top:12px">${R(c.price)}</div>
    <div class="card-pm" style="margin-bottom:12px">${esc(c.body)} · ${esc(c.fuel)} · ${km(c.mileage)}</div>
    <a class="btn btn--solid btn--block" href="contact.html?type=enquiry&car=${c.id}" data-track="enquiry_click">Enquire</a>
    <a class="btn btn--block" href="contact.html?type=test-drive&car=${c.id}" data-track="test_drive_click">Book a test drive</a>
    <a class="btn btn--block" href="${waLink(msg)}" data-track="whatsapp" ${EAG.whatsapp ? 'target="_blank" rel="noopener"' : ''}>${EAG.icons.wa} WhatsApp about this car</a>
    <a class="btn btn--block" href="tel:${EAG.tel}" data-track="call">${EAG.icons.phone} Call ${EAG.phone}</a>
    <div class="panel-tools"><button type="button" class="btn ca-fav" data-fav="${c.id}" aria-pressed="false">${EAG.icons.heart}<span>Save</span></button><button type="button" class="btn ca-cmp" data-cmp="${c.id}" aria-pressed="false">${EAG.icons.compare}<span>Compare</span></button></div>
    <button class="link-arrow" type="button" style="justify-self:start;margin-top:8px;min-height:40px" id="ask-concierge">Ask ${EAG.assistant || 'Valet'} about this car</button>`;
  document.getElementById('ask-concierge').onclick = () => EAG.openChat && EAG.openChat(`Tell me about the ${c.year} ${c.title}`);

  // specs
  document.getElementById('spec-grid').innerHTML = [
    ['Mileage', km(c.mileage)], ['Year', c.year], ['Transmission', c.transmission], ['Fuel', c.fuel], ['Engine', c.engine || '—'], ['Power', c.kw ? c.kw + ' kW' : '—']
  ].map(([l, v]) => `<div><dt>${l}</dt><dd>${esc(v)}</dd></div>`).join('');
  document.getElementById('features').innerHTML = (c.features.length ? c.features : ['Full details available on request']).map(f => `<li>${esc(f)}</li>`).join('');


  // trade-in box
  const tl = document.getElementById('trade-link'); if (tl) tl.href = 'sell.html?car=' + c.id;
  const ir = document.getElementById('insp-link'); if (ir) ir.href = `contact.html?type=enquiry&car=${c.id}&msg=inspection`;

  // similar cars: up to 12 relevant matches; auto-slides when there are more than fit on screen
  const ranked = stock.filter(x => x.id !== c.id).map(x => ({ x, s: (x.brandGroup === c.brandGroup ? 3 : 0) + (x.body === c.body ? 2 : 0) + (Math.abs(x.price - c.price) / c.price < .35 ? 2 : 0) }))
    .sort((a, b) => b.s - a.s || Math.abs(a.x.price - c.price) - Math.abs(b.x.price - c.price));
  const sim = ranked.filter((o, i) => o.s >= 2 || i < 4).slice(0, 12).map(o => o.x);
  (function similarCarousel() {
    const wrap = document.getElementById('similar-carousel'), track = document.getElementById('similar');
    const nav = document.getElementById('sim-nav'), bar = document.getElementById('sim-bar'), cnt = document.getElementById('sim-count');
    track.innerHTML = sim.map(x => EAG.cardHTML(x)).join('');
    let i = 0, timer, paused = false;
    const perView = () => window.innerWidth < 640 ? 1 : window.innerWidth < 1180 ? 2 : 4;
    const slides = () => Math.max(0, sim.length - perView());
    function go(n, user) {
      const max = slides();
      nav.hidden = max === 0; document.getElementById('sim-foot').hidden = max === 0;
      i = n > max ? 0 : n < 0 ? max : n;
      const card = track.children[0], step = card ? card.getBoundingClientRect().width + 20 : 0;
      track.style.transform = `translateX(${-i * step}px)`;
      cnt.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(max + 1).padStart(2, '0');
      clearTimeout(timer);
      bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)';
      if (max === 0 || paused) return;
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = 'transform 4.5s linear'; bar.style.transform = 'scaleX(1)'; }));
      timer = setTimeout(() => go(i + 1), user ? 6000 : 4500);
    }
    document.getElementById('sim-prev').onclick = () => go(i - 1, true);
    document.getElementById('sim-next').onclick = () => go(i + 1, true);
    wrap.addEventListener('mouseenter', () => { paused = true; go(i); });
    wrap.addEventListener('mouseleave', () => { paused = false; go(i); });
    wrap.addEventListener('focusin', () => { paused = true; go(i); });
    wrap.addEventListener('focusout', e => { if (!wrap.contains(e.relatedTarget)) { paused = false; go(i); } });
    let sx = null;
    wrap.addEventListener('touchstart', e => { sx = e.touches[0].clientX; paused = true; clearTimeout(timer); }, { passive: true });
    wrap.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; paused = false; go(Math.abs(dx) > 40 ? i + (dx < 0 ? 1 : -1) : i, true); sx = null; });
    window.addEventListener('resize', () => go(i));
    new IntersectionObserver(en => { if (en[0].isIntersecting) go(i); else clearTimeout(timer); }, { threshold: .2 }).observe(wrap);
    go(0);
  })();

  // Vehicle schema
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Car', name: full, brand: { '@type': 'Brand', name: c.make }, model: c.model, vehicleModelDate: String(c.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: c.mileage, unitCode: 'KMT' }, bodyType: c.body, fuelType: c.fuel, vehicleTransmission: c.transmission,
    vehicleEngine: { '@type': 'EngineSpecification', name: c.engine, enginePower: { '@type': 'QuantitativeValue', value: c.kw, unitCode: 'KWT' } },
    itemCondition: 'https://schema.org/UsedCondition', image: c.images.slice(0, 6), description: c.features.join(', '),
    offers: { '@type': 'Offer', price: c.price, priceCurrency: 'ZAR', availability: 'https://schema.org/InStock', url: location.href,
      seller: { '@type': 'AutoDealer', name: 'Exclusive Auto Group', telephone: EAG.tel } }
  });
  document.head.appendChild(ld);

  // ---------- the story: the car's own photos play like film as you scroll ----------
  (function film() {
    const sec = document.getElementById('film'); if (!sec) return;
    const n = c.images.length, at = f => c.images[Math.min(n - 1, Math.max(0, Math.round(f * (n - 1))))];
    const feats = c.features.filter(f => !/finance|trade/i.test(f));
    const CH = [
      { label: 'Chapter 01 · First impression', big: esc(c.model.split(' ').slice(0, 2).join(' ')), text: `${c.year} · ${km(c.mileage)} · ${esc(c.transmission)}`, frames: [c.images[0], c.images[1] || c.images[0]] },
      { label: 'Chapter 02 · The stance', big: esc(c.body), text: esc([c.transmission, c.fuel].join(' · ')), frames: [c.images[2] || at(.1), c.images[3] || at(.15)] },
      { label: 'Chapter 03 · The heart', big: c.kw ? `${c.kw}<small>kW</small>` : esc(c.engine || ''), text: esc(c.engine || ''), frames: [c.images[4] || at(.2), c.images[5] || at(.25)] },
      { label: 'Chapter 04 · Inside', big: km(c.mileage), text: esc(feats.slice(0, 3).join(' · ')), frames: [at(.45), at(.55)] },
      { label: 'Chapter 05 · Yours', big: R(c.price), text: 'Viewings by appointment at N1 City, Cape Town', frames: [c.images[6] || at(.3), c.images[0]] }
    ];
    const frames = CH.flatMap((ch, i) => ch.frames.map(src => ({ src: img(src, 'full'), ch: i })));
    const imgs = frames.map(f => { const im = new Image(); im.decoding = 'async'; im.src = f.src; return im; });
    const cv = document.getElementById('film-canvas'), ctx = cv.getContext('2d');
    const eb = document.getElementById('film-eyebrow'), big = document.getElementById('film-big'), txt = document.getElementById('film-text');
    const cnt = document.getElementById('film-count'), prog = document.getElementById('film-prog');
    const list = document.getElementById('film-chapters');
    list.innerHTML = CH.map((ch, i) => `<li>${String(i + 1).padStart(2, '0')}</li>`).join('');
    let W = 0, H = 0, p = 0, chap = -1;
    function size() { const d = Math.min(devicePixelRatio || 1, 1.6); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); draw(); }
    function paint(im, z, a, drift) {
      if (!im.complete || !im.naturalWidth) return;
      const sc = Math.max(W / im.naturalWidth, H / im.naturalHeight) * z, w = im.naturalWidth * sc, h = im.naturalHeight * sc;
      ctx.globalAlpha = a; ctx.drawImage(im, (W - w) / 2 + drift * (w - W) / 2, (H - h) / 2, w, h);
    }
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function draw() {
      if (!W) return;
      const N = frames.length, f = Math.min(N - 1e-4, p * N), i = Math.floor(f), t = f - i;
      ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      paint(imgs[i], 1.04 + t * .14, 1, (i % 2 ? -1 : 1) * (t - .5) * .3);
      if (t > .7 && i < N - 1) paint(imgs[i + 1], 1.04, ease((t - .7) / .3), (i % 2 ? 1 : -1) * -.15);
      ctx.globalAlpha = 1;
      const ci = frames[Math.min(N - 1, Math.floor(p * N + .15))].ch;
      if (ci !== chap) {
        chap = ci; const ch = CH[ci];
        eb.textContent = ch.label; big.innerHTML = ch.big; txt.textContent = ch.text || '';
        cnt.textContent = String(ci + 1).padStart(2, '0');
        list.querySelectorAll('li').forEach((li, j) => li.classList.toggle('is-on', j === ci));
        if (window.gsap && !EAG.reduced) gsap.fromTo([eb, big, txt], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: 'power3.out', overwrite: true });
      }
      prog.style.transform = `scaleX(${p})`;
    }
    window.addEventListener('resize', size);
    imgs.forEach(im => im.addEventListener('load', draw));
    function start() {
      size(); if (EAG.revealPage) EAG.revealPage();
      if (EAG.reduced || !window.ScrollTrigger) { sec.style.height = '100vh'; p = 0; draw(); return; }
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .5, onUpdate: self => { p = self.progress; requestAnimationFrame(draw); } });
    }
    if (window.gsap) start(); else window.addEventListener('load', start);
  })();

  // ---------- instrument cluster with a rev pedal ----------
  (function dash() {
    const el = document.getElementById('dash'); if (!el) return;
    const litres = parseFloat((c.engine || '').match(/\d\.\d/) || 0) || 0;
    const cyl = /V12/.test(c.engine) ? 12 : /V10/.test(c.engine) ? 10 : /V8/.test(c.engine) ? 8 : /6/.test(c.engine) ? 6 : /5-Cyl/.test(c.engine) ? 5 : 4;
    const redline = c.fuel === 'Diesel' ? 4.5 : cyl >= 10 ? 9 : cyl === 8 ? 7.5 : 7;
    const maxRpm = c.fuel === 'Diesel' ? 6 : cyl >= 10 ? 10 : 8;
    const SW = 240, A0 = -120; // sweep in degrees
    function gauge(id, max, ticks, label, unit, value, red) {
      const r = 92, cx = 110, cy = 110;
      const pt = (deg, rr) => { const a = (deg - 90) * Math.PI / 180; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
      let t = '';
      for (let i = 0; i <= ticks; i++) {
        const deg = A0 + SW * i / ticks, [x1, y1] = pt(deg, r), [x2, y2] = pt(deg, r - (i % 1 === 0 ? 12 : 6)), [tx, ty] = pt(deg, r - 26);
        const hot = red != null && i >= red / max * ticks;
        t += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="tk${hot ? ' hot' : ''}"/>`;
        t += `<text x="${tx}" y="${ty + 4}" class="tn${hot ? ' hot' : ''}">${Math.round(max * i / ticks / (max > 50 ? 1 : 1))}</text>`;
        if (i < ticks) { const [mx1, my1] = pt(deg + SW / ticks / 2, r), [mx2, my2] = pt(deg + SW / ticks / 2, r - 6); t += `<line x1="${mx1}" y1="${my1}" x2="${mx2}" y2="${my2}" class="tk tk-m${hot ? ' hot' : ''}"/>`; }
      }
      const arc = (from, to, rr) => { const [x1, y1] = pt(from, rr), [x2, y2] = pt(to, rr); return `M${x1} ${y1} A${rr} ${rr} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
      const redArc = red != null ? `<path d="${arc(A0 + SW * red / max, A0 + SW, r + 4)}" class="red-arc"/>` : '';
      return `<figure class="gauge" id="${id}"><svg viewBox="0 0 220 220" role="img" aria-label="${label}: ${value} ${unit}">
        <circle cx="110" cy="110" r="106" class="g-ring"/><path d="${arc(A0, A0 + SW, r + 4)}" class="g-arc"/>${redArc}
        <path d="${arc(A0, A0 + .01, r + 4)}" class="g-fill"/>${t}
        <g class="needle"><line x1="110" y1="122" x2="110" y2="30"/><circle cx="110" cy="110" r="7"/></g>
        <text x="110" y="150" class="g-val">${value}</text><text x="110" y="168" class="g-unit">${unit}</text></svg>
        <figcaption>${label}</figcaption></figure>`;
    }
    const kmMax = 300, kmVal = Math.round((c.mileage || 0) / 1000);
    el.innerHTML = `
      <div class="dash-left">
        <div class="dash-cluster">
          ${gauge('g-odo', kmMax, 6, 'Odometer', 'km', km(c.mileage).replace(' km', ''), null)}
          ${gauge('g-rpm', maxRpm, maxRpm, 'Tachometer', 'x1000 rpm', '<tspan id="rpm-read">0.8</tspan>', redline)}
          ${gauge('g-kw', 800, 8, 'Power', 'kW', c.kw || '—', null)}
        </div>
        <div class="trip" id="trip" aria-live="polite"><span class="trip-k"></span><b class="trip-v"></b><span class="trip-dots"></span></div>
        <div class="fuel" aria-hidden="true"><span class="fuel-l">E</span><div class="fuel-cells">${Array.from({ length: 20 }, () => '<i></i>').join('')}</div><span class="fuel-l">F</span><span class="fuel-cap">Fuel</span></div>
        <div class="tells" id="tells" role="list" aria-label="Inspection status of this car"></div>
      </div>
      <div class="dash-right">
        <div class="dash-head">
          <div class="dash-title"><span class="eyebrow">The numbers</span>
          <h2 class="h2 h2--sm"><span class="l1">Hold to</span><span class="l2">Rev it</span></h2></div>
          <div class="dash-controls">
          <button type="button" class="start-btn" id="start-btn" aria-pressed="false" aria-label="Engine start / stop"><span>Engine</span><b>Start</b><span>Stop</span></button>
          <button type="button" class="pedal" id="pedal" aria-label="Hold to rev the engine" disabled>
            <svg viewBox="0 0 80 132" aria-hidden="true" class="pedal-svg">
              <defs>
                <linearGradient id="pd-alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f4f4"/><stop offset=".35" stop-color="#9a9a9a"/><stop offset=".55" stop-color="#d9d9d9"/><stop offset="1" stop-color="#6b6b6b"/></linearGradient>
                <linearGradient id="pd-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
                <pattern id="pd-brush" width="80" height="2" patternUnits="userSpaceOnUse"><rect width="80" height="1" fill="#000" opacity=".06"/></pattern>
                <clipPath id="pd-clip"><rect x="6" y="4" width="68" height="112" rx="16"/></clipPath>
                <radialGradient id="pd-stud" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#050505"/></radialGradient>
              </defs>
              <rect x="30" y="116" width="20" height="14" rx="3" class="pd-arm"/>
              <circle cx="40" cy="118" r="5" class="pd-hinge"/>
              <g class="pd-plate">
                <rect class="pd-base" x="6" y="4" width="68" height="112" rx="16"/>
                <rect class="pd-brushed" x="6" y="4" width="68" height="112" rx="16"/>
                <rect class="pd-edge" x="6.75" y="4.75" width="66.5" height="110.5" rx="15.25"/>
                ${[0, 1, 2, 3, 4, 5].map(r => (r % 2 ? [31, 49] : [22, 40, 58]).map(x => `<circle class="pd-stud" cx="${x}" cy="${20 + r * 16}" r="5.2"/>`).join('')).join('')}
                <g clip-path="url(#pd-clip)"><rect class="pd-shine" x="-40" y="4" width="34" height="112"/></g>
              </g>
            </svg>
            <span>Hold to rev</span></button>
        </div>
        </div>
        <p class="lede">Press <b>Start</b>, then hold the pedal. Gauges and readouts come from this car's listing; the warning lights show our inspection.</p>
        <dl class="dash-strip">
          <div><dt>Year</dt><dd>${c.year}</dd></div><div><dt>Engine</dt><dd>${esc(c.engine || '—')}</dd></div>
          <div><dt>Power</dt><dd>${c.kw ? c.kw + ' kW' : '—'}</dd></div><div><dt>Mileage</dt><dd>${km(c.mileage)}</dd></div>
          <div><dt>Gearbox</dt><dd>${esc(c.transmission)}</dd></div><div><dt>Fuel</dt><dd>${esc(c.fuel)}</dd></div>
        </dl>
        <div class="unlock" id="unlock" hidden role="dialog" aria-label="Test drive unlocked">
          <button type="button" class="unlock-x" aria-label="Close" onclick="this.parentElement.hidden=true">×</button>
          <span class="eyebrow">Redline × 3</span>
          <b>You'd better drive it.</b>
          <p>Book a test drive of this ${esc(c.make)} and feel the real thing at N1 City.</p>
          <a class="btn btn--white" href="contact.html?type=test-drive&car=${c.id}" data-track="rev_unlock_test_drive">Book a test drive</a>
        </div>
      </div>`;
    const needle = id => el.querySelector('#' + id + ' .needle');
    const fill = id => el.querySelector('#' + id + ' .g-fill');
    const arcPath = (frac) => { const r = 96, cx = 110, cy = 110, to = A0 + SW * Math.max(.001, frac); const p1 = (A0 - 90) * Math.PI / 180, p2 = (to - 90) * Math.PI / 180; return `M${cx + r * Math.cos(p1)} ${cy + r * Math.sin(p1)} A${r} ${r} 0 ${to - A0 > 180 ? 1 : 0} 1 ${cx + r * Math.cos(p2)} ${cy + r * Math.sin(p2)}`; };
    function set(id, frac) { frac = Math.max(0, Math.min(1, frac)); needle(id).style.transform = `rotate(${A0 + SW * frac}deg)`; fill(id).setAttribute('d', arcPath(frac)); }
    const rpmRead = el.querySelector('#rpm-read');
    const targets = { odo: Math.min(1, kmVal / kmMax), kw: Math.min(1, (c.kw || 0) / 800) };
    let rpm = 0, target = 0, holding = false, live = false, fuel = 1, looping = false, hits = 0, wasRed = false;
    const cells = [...el.querySelectorAll('.fuel-cells i')];
    const pedal = el.querySelector('#pedal'), startBtn = el.querySelector('#start-btn'), hint = el.querySelector('#redline-hint'), unlock = el.querySelector('#unlock');

    // ---- inspection warning lights: colours come ONLY from the dealership's inspection checklist ----
    // data/inspections.js -> window.EAG_INSPECTIONS[ref] = { date, by, items: { engine: 'good'|'advisory'|'attention', ... }, notes: { tyres: '…' } }
    const ICON = {
      engine: '<path d="M4 10h2V8h4V6h5v2h2l2 3h2v5h-2l-2 2h-6l-2-2H6v-2H4v-4Z"/><path d="M2 11v4"/>',
      gearbox: '<circle cx="6" cy="6" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="18" cy="6" r="1.6"/><circle cx="6" cy="18" r="1.6"/><circle cx="12" cy="18" r="1.6"/><path d="M6 7.6v8.8M12 7.6v8.8M18 7.6V12H6"/>',
      brakes: '<circle cx="12" cy="12" r="6"/><path d="M4.5 6.5a10 10 0 0 0 0 11M19.5 6.5a10 10 0 0 1 0 11"/><path d="M12 9v3.5"/><circle cx="12" cy="15" r=".6" fill="currentColor"/>',
      tyres: '<path d="M6 18.5a8 8 0 1 1 12 0"/><path d="M5 18.5h14"/><path d="M8 18.5l-.6 2M16 18.5l.6 2M12 18.5v2"/><path d="M12 8v4.5"/><circle cx="12" cy="15" r=".6" fill="currentColor"/>',
      lights: '<path d="M11 6C6 6 4 9 4 12s2 6 7 6V6Z"/><path d="M14 8h7M14 12h7M14 16h7"/>',
      battery: '<rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M7 7V5h3v2M14 7V5h3v2"/><path d="M6.5 13h3M15 13h3M16.5 11.5v3"/>',
      aircon: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 4.5 12 6l2-1.5M10 19.5 12 18l2 1.5"/>',
      suspension: '<path d="M8 3h8M8 21h8"/><path d="M12 3v2l-4 2 8 2-8 2 8 2-8 2 8 2-4 2v2"/>',
      body: '<path d="M3 15v-3l2-4h9l4 4h2a1 1 0 0 1 1 1v2"/><circle cx="7" cy="16" r="2"/><circle cx="17" cy="16" r="2"/><path d="M9 16h6"/>',
      interior: '<path d="M8 3h5a2 2 0 0 1 2 2v7H8V3Z"/><path d="M6 12h11l1 5H7l-1-5Z"/><path d="M8 17v4M16 17v4"/>',
      service: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z"/>',
      keys: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>'
    };
    const SYSTEMS = [['engine', 'Engine'], ['gearbox', 'Gearbox'], ['brakes', 'Brakes'], ['tyres', 'Tyres'], ['lights', 'Headlights'], ['battery', 'Battery'],
      ['suspension', 'Suspension'], ['service', 'Service history']];
    const STATE = { good: 'Checked: good', advisory: 'Advisory', attention: 'Needs attention' };
    const insp = (window.EAG_INSPECTIONS || {})[c.id] || null;
    const items = insp && insp.items ? insp.items : {}, notes = insp && insp.notes ? insp.notes : {};
    const tellsEl = el.querySelector('#tells');
    tellsEl.innerHTML = SYSTEMS.map(([k, label]) => {
      // green by default; a note without a status shows amber; an explicit status always wins
      const st = STATE[items[k]] ? items[k] : (notes[k] ? 'advisory' : 'good');
      const desc = (st === 'good' && !items[k] ? 'No issues noted' : STATE[st]) + (notes[k] ? ' · ' + notes[k] : '');
      return `<span class="tell st-${st}" role="listitem" tabindex="0" aria-label="${label}: ${esc(desc)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg><i>${label} · ${esc(desc)}</i></span>`;
    }).join('') + (insp && (insp.by || insp.date) ? `<div class="insp-foot"><span class="tells-count">Checked by ${esc(insp.by || 'Exclusive Auto Group')}${insp.date ? ' · ' + esc(insp.date) : ''}</span></div>` : '');
    const tellEls = [...tellsEl.querySelectorAll('.tell')];
    function lightTells(on) {
      clearTimeout(lightTells.t1); clearTimeout(lightTells.t2);
      if (!on) { tellEls.forEach(t => t.classList.remove('is-lit', 'is-test')); return; }
      tellEls.forEach(t => t.classList.add('is-test'));                 // self-test: every light flashes, like a real car
      lightTells.t1 = setTimeout(() => tellEls.forEach(t => t.classList.remove('is-test')), 900);
      lightTells.t2 = setTimeout(() => tellEls.forEach((t, k) => setTimeout(() => t.classList.add('is-lit'), k * 70)), 1000);
    }

    // ---- trip computer: figures worked out from the listing ----
    const age = Math.max(1, new Date().getFullYear() - c.year + (new Date().getMonth() > 5 ? 0 : 0));
    const perYear = c.mileage != null ? Math.round(c.mileage / age / 50) * 50 : null;
    const SHOWROOM = { lat: -33.8928, lng: 18.5601 }; // 6 Manus Gerber St, Pivot Square, N1 City (approx.)
    const fmt = n => Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ').replace(/ /g, ' ');
    const trip = el.querySelector('#trip'), tK = trip.querySelector('.trip-k'), tV = trip.querySelector('.trip-v'), tDots = trip.querySelector('.trip-dots');
    let distance = null;
    const screens = () => [
      ['Model year', `${c.year} · ${age} yr${age > 1 ? 's' : ''} old`],
      perYear != null && c.mileage > 0 ? ['Average use', `≈ ${fmt(perYear)} km / yr`] : ['Odometer', km(c.mileage)],
      ['Power', c.kw ? `${c.kw} kW · ${Math.round(c.kw * 1.341)} hp` : esc(c.engine || '—')],
      ['Range to showroom', distance != null ? `≈ ${distance < 10 ? distance.toFixed(1) : fmt(distance)} km · <a href="${EAG.mapUrl}" target="_blank" rel="noopener">Directions</a>` : `<button type="button" class="trip-btn">Tap to calculate</button>`],
      ['Listed features', (() => { const f = c.features.filter(x => !/finance|trade|bank/i.test(x)); return f.length ? `${f.length} · ${esc(f.slice(0, 2).join(', '))}${f.length > 2 ? '…' : ''}` : 'Ask our team'; })()],
      ['Delivery', 'Anywhere in SA'],
      ['Stock ref', String(c.id)]
    ];
    let si = 0, tripTimer = null;
    function showScreen(i) {
      const list = screens(); si = (i + list.length) % list.length;
      tK.textContent = list[si][0]; tV.innerHTML = list[si][1];
      tDots.innerHTML = list.map((_, k) => `<i${k === si ? ' class="on"' : ''}></i>`).join('');
      trip.classList.remove('flip'); void trip.offsetWidth; trip.classList.add('flip');
    }
    function tripRun(on) {
      clearInterval(tripTimer);
      trip.classList.toggle('is-on', on);
      if (!on) { tK.textContent = ''; tV.textContent = ''; tDots.innerHTML = ''; return; }
      showScreen(0); tripTimer = setInterval(() => { if (!trip.matches(':hover')) showScreen(si + 1); }, 2800);
    }
    trip.addEventListener('click', e => {
      if (e.target.closest('.trip-btn')) {
        if (!navigator.geolocation) { tV.textContent = 'Not available'; return; }
        tV.textContent = 'Locating…';
        navigator.geolocation.getCurrentPosition(pos => {
          const R2 = 6371, rad = d => d * Math.PI / 180, dLa = rad(SHOWROOM.lat - pos.coords.latitude), dLo = rad(SHOWROOM.lng - pos.coords.longitude);
          const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(pos.coords.latitude)) * Math.cos(rad(SHOWROOM.lat)) * Math.sin(dLo / 2) ** 2;
          distance = 2 * R2 * Math.asin(Math.sqrt(h)); showScreen(3); EAG.track('trip_distance', { km: Math.round(distance) });
        }, () => { tV.textContent = 'Location not shared'; }, { timeout: 8000, maximumAge: 600000 });
        return;
      }
      if (!e.target.closest('a')) showScreen(si + 1);
    });

    // ---- engine loop ----
    function loop() {
      const idle = live ? .85 : 0;
      target = holding && live ? redline * 1.04 : idle;
      rpm += (target - rpm) * (holding ? .06 : .045);
      if (holding && rpm > redline) rpm = redline - Math.random() * .25; // limiter bounce
      if (!live && rpm < .02) rpm = 0;
      set('g-rpm', rpm / maxRpm); rpmRead.textContent = rpm.toFixed(1);
      const red = rpm > redline * .96;
      el.classList.toggle('is-red', red);
      // count a redline once per climb: re-arm only after the needle drops well below it
      if (red && !wasRed && holding) { onRedline(); wasRed = true; }
      else if (rpm < redline * .7) wasRed = false;
      if (live) fuel = Math.max(.05, Math.min(1, fuel + (holding ? -.0025 * (rpm / maxRpm) : .0012)));
      const lit = live ? Math.round(fuel * cells.length) : 0, warn = live && lit <= 7 && lit > 3, crit = live && lit <= 3;
      cells.forEach((c2, k) => { const on = k < lit; c2.classList.toggle('on', on && !warn && !crit); c2.classList.toggle('warn', on && warn); c2.classList.toggle('crit', on && crit); });
      const fu = el.querySelector('.fuel'); fu.classList.toggle('is-warn', warn); fu.classList.toggle('is-crit', crit);
      requestAnimationFrame(loop);
    }

    // ---- rev to unlock ----
    let flashT;
    function flash() {} // no on-screen redline messages
    function onRedline() {
      if (hits >= 3) { flash('Redline!'); return; }
      hits++;
      flash(hits < 3 ? `Redline! ${hits} of 3` : 'Redline × 3 · Unlocked');
      if (navigator.vibrate) navigator.vibrate(hits < 3 ? 40 : [60, 40, 120]);
      if (hits === 3) {
        unlock.hidden = false; EAG.track('rev_unlock', { id: c.id });
        if (window.gsap && !EAG.reduced) gsap.fromTo(unlock, { opacity: 0, y: 30, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.6)' });
      }
    }

    // ---- start / stop ----
    function engine(on) {
      if (on === live) return;
      startBtn.setAttribute('aria-pressed', on); startBtn.classList.toggle('is-on', on);
      el.classList.toggle("is-live", on);
      if (!looping) { looping = true; loop(); }
      const o = { v: 0 };
      if (on) {
        lightTells(true); tripRun(true);
        if (window.gsap && !EAG.reduced) {
          gsap.timeline().to(o, { v: 1, duration: .8, ease: 'power2.out', onUpdate: () => { set('g-odo', o.v); set('g-kw', o.v); set('g-rpm', o.v); } })
            .to(o, { v: 0, duration: .7, ease: 'power2.inOut', onUpdate: () => { set('g-odo', o.v); set('g-kw', o.v); set('g-rpm', o.v); } })
            .add(() => { live = true; gsap.to({ a: 0 }, { a: 1, duration: 1.1, ease: 'power3.out', onUpdate: function () { const a = this.targets()[0].a; set('g-odo', targets.odo * a); set('g-kw', targets.kw * a); } }); });
        } else { live = true; set('g-odo', targets.odo); set('g-kw', targets.kw); }
        EAG.track('engine_start', { id: c.id });
      } else {
        live = false; holding = false; pedal.classList.remove('is-down');
        lightTells(false); tripRun(false);
        const from = { odo: targets.odo, kw: targets.kw };
        if (window.gsap && !EAG.reduced) gsap.to(from, { odo: 0, kw: 0, duration: .9, ease: 'power2.inOut', onUpdate: () => { set('g-odo', from.odo); set('g-kw', from.kw); } });
        else { set('g-odo', 0); set('g-kw', 0); }
      }
    }
    startBtn.addEventListener('click', () => engine(!live));

    const down = e => { if (e) e.preventDefault(); if (!live) { flash('Press Start first'); startBtn.classList.add('nudge'); setTimeout(() => startBtn.classList.remove('nudge'), 600); return; } holding = true; pedal.classList.add('is-down'); EAG.track('rev_pedal'); };
    const up = () => { holding = false; pedal.classList.remove('is-down'); };
    pedal.addEventListener('pointerdown', down); window.addEventListener('pointerup', up); pedal.addEventListener('pointerleave', up);
    pedal.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
    pedal.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') up(); });
    pedal.addEventListener('contextmenu', e => e.preventDefault());
    // a pedal press while the engine is off nudges the Start button (pedal stays clickable for that hint)
    pedal.disabled = false; pedal.setAttribute('aria-disabled', 'true');
    startBtn.addEventListener('click', () => pedal.setAttribute('aria-disabled', String(!live)));
    set('g-odo', 0); set('g-kw', 0); set('g-rpm', 0);
    if (EAG.reduced) engine(true);
  })();

  track('view_vehicle', { id: c.id, name: full, price: c.price });
})();
