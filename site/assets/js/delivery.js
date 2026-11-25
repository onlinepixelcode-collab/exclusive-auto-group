/* Nationwide delivery map: dot-matrix South Africa, routes drawn from the N1 City showroom, cars driving to each city */
(function () {
  'use strict';
  const EAG = window.EAG, M = window.EAG_SAMAP, host = document.getElementById('delivery-map');
  if (!host || !M) return;
  const NS = 'http://www.w3.org/2000/svg';
  const fmt = n => Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ').replace(/ /g, ' ');
  const CT = M.cities[0], DEST = M.cities.slice(1);
  // label nudges for the crowded Gauteng / North West cluster
  const LBL = { Pretoria: { dy: -16 }, Johannesburg: { dy: 22 }, Rustenburg: { end: true, dy: -10 }, Mbombela: { dy: -26 }, 'Richards Bay': { end: true, dy: -12 }, Durban: { end: true, dy: 18 } };

  // curved route: quadratic bezier bowed to one side so routes fan out
  function route(c, i) {
    const dx = c.x - CT.x, dy = c.y - CT.y, len = Math.hypot(dx, dy);
    const bow = Math.min(120, len * .22) * (i % 2 ? 1 : -1) * (c.y < CT.y - 200 ? 1 : .6);
    const mx = (CT.x + c.x) / 2 - dy / len * bow, my = (CT.y + c.y) / 2 + dx / len * bow;
    return `M${CT.x},${CT.y} Q${mx.toFixed(1)},${my.toFixed(1)} ${c.x},${c.y}`;
  }

  host.innerHTML = `
  <svg viewBox="0 0 ${M.w} ${M.h}" class="dm-svg" role="img" aria-label="Map of South Africa showing delivery routes from the Exclusive Auto Group showroom in Cape Town to cities nationwide">
    <defs>
      <pattern id="dm-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.35" class="dm-dot"/></pattern>
      <clipPath id="dm-clip"><path d="${M.za}"/></clipPath>
      <filter id="dm-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="dm-halo"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <path d="${M.near}" class="dm-near"/>
    <path d="${M.za}" class="dm-land"/>
    <rect width="${M.w}" height="${M.h}" fill="url(#dm-dots)" clip-path="url(#dm-clip)" class="dm-matrix"/>
    <path d="${M.za}" class="dm-coast"/>
    <path d="${M.ls}${M.sz}" class="dm-enclave"/>
    <circle cx="${CT.x}" cy="${CT.y}" r="140" fill="url(#dm-halo)" class="dm-halo"/>
    <g class="dm-routes">${DEST.map((c, i) => `<path d="${route(c, i)}" class="dm-route" data-i="${i}"/>`).join('')}</g>
    <g class="dm-trails">${DEST.map((c, i) => `<path d="${route(c, i)}" class="dm-trail" data-i="${i}"/>`).join('')}</g>
    <g class="dm-cities">${DEST.map((c, i) => `<g class="dm-city" data-i="${i}" transform="translate(${c.x},${c.y})" tabindex="0" role="button" aria-label="${c.n}, about ${fmt(c.km)} km from Cape Town">
        <circle r="16" class="dm-ping"/><circle r="5" class="dm-pin"/>
        ${(() => { const o = LBL[c.n] || {}, end = o.end != null ? o.end : c.x > M.w * .78, dx = end ? -12 : 12, dy = o.dy || 0;
          return `<text x="${dx}" y="${-9 + dy}" class="dm-label" text-anchor="${end ? 'end' : 'start'}">${c.n}</text><text x="${dx}" y="${7 + dy}" class="dm-km" text-anchor="${end ? 'end' : 'start'}">≈ ${fmt(c.km)} km</text>`; })()}</g>`).join('')}</g>
    <g class="dm-cars"></g>
    <g class="dm-hq" transform="translate(${CT.x},${CT.y})">
      <circle r="10" class="dm-hq-ring r1"/><circle r="10" class="dm-hq-ring r2"/><circle r="8" class="dm-hq-pin"/>
      <text x="16" y="34" class="dm-hq-label">Exclusive Auto Group</text><text x="16" y="50" class="dm-km">N1 City, Cape Town</text>
    </g>
  </svg>`;

  const svg = host.querySelector('svg'), routes = [...svg.querySelectorAll('.dm-route')], trails = [...svg.querySelectorAll('.dm-trail')];
  const cityEls = [...svg.querySelectorAll('.dm-city')], carsG = svg.querySelector('.dm-cars');
  const lens = routes.map(r => r.getTotalLength());
  routes.forEach((r, i) => { r.style.strokeDasharray = lens[i]; r.style.strokeDashoffset = lens[i]; });
  trails.forEach((t, i) => { t.style.strokeDasharray = `40 ${lens[i]}`; t.style.strokeDashoffset = 40; });

  const tick = document.getElementById('dm-ticker'), sel = document.getElementById('dm-select'), out = document.getElementById('dm-result');
  const cta = document.getElementById('dm-cta');
  sel.innerHTML = '<option value="">Choose your city</option>' + DEST.map((c, i) => `<option value="${i}">${c.n}</option>`).sort().join('') + '<option value="other">Somewhere else</option>';

  // a small top-down car that drives along a route
  function makeCar() {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'dm-car');
    g.innerHTML = '<circle r="11" class="dm-car-glow"/><rect x="-7" y="-4" width="14" height="8" rx="3" class="dm-car-body"/><rect x="-1.5" y="-3" width="4.5" height="6" rx="1.2" class="dm-car-glass"/>';
    carsG.appendChild(g); return g;
  }
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function drive(i, dur, done) {
    const car = makeCar(), r = routes[i], L = lens[i], t0 = performance.now();
    cityEls[i].classList.add('is-target');
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur), e = ease(p), d = e * L;
      const a = r.getPointAtLength(d), b = r.getPointAtLength(Math.min(L, d + 1));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      car.setAttribute('transform', `translate(${a.x.toFixed(1)},${a.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      trails[i].style.strokeDashoffset = 40 - d;
      if (p < 1) return requestAnimationFrame(step);
      car.classList.add('is-arrived'); setTimeout(() => car.remove(), 700);
      cityEls[i].classList.remove('is-target'); cityEls[i].classList.add('is-delivered');
      setTimeout(() => cityEls[i].classList.remove('is-delivered'), 1600);
      if (done) done();
    })(t0);
  }

  let running = false, focusIdx = null, loopT;
  const order = DEST.map((_, i) => i);
  function announce(i) { if (tick) tick.innerHTML = `<span class="dm-live"></span>Now delivering to <b>${DEST[i].n}</b> · ≈ ${fmt(DEST[i].km)} km`; }
  function intro() {
    // draw every route outward, staggered, then start the delivery loop
    routes.forEach((r, i) => { r.style.transition = `stroke-dashoffset 1.6s cubic-bezier(.6,0,.2,1) ${i * .09}s`; requestAnimationFrame(() => { r.style.strokeDashoffset = 0; }); });
    cityEls.forEach((c, i) => setTimeout(() => c.classList.add('is-on'), 600 + i * 90));
    setTimeout(loop, 1900);
  }
  let li = 0;
  function loop() {
    if (!running || focusIdx != null) return;
    const i = order[li++ % order.length]; announce(i);
    drive(i, 1500 + DEST[i].km * 1.1);
    loopT = setTimeout(loop, 1100);
  }
  function focusCity(i) {
    clearTimeout(loopT); focusIdx = i;
    svg.classList.add('is-focus'); routes.forEach((r, j) => r.classList.toggle('is-sel', j === i)); cityEls.forEach((c, j) => c.classList.toggle('is-sel', j === i));
    const c = DEST[i]; announce(i);
    out.innerHTML = `<span class="tiny">Cape Town → ${c.n}</span><b>≈ ${fmt(c.km)} km</b><span class="dm-res-sub">Door-to-door, enclosed transport</span>`;
    cta.href = `contact.html?type=delivery&city=${encodeURIComponent(c.n)}`; cta.textContent = `Ask about delivery to ${c.n}`;
    drive(i, 2200 + c.km * .9, () => { if (focusIdx === i) setTimeout(() => focusIdx === i && drive(i, 2200 + c.km * .9), 900); });
    EAG.track('delivery_city', { city: c.n });
  }
  function clearFocus() { focusIdx = null; svg.classList.remove('is-focus'); routes.forEach(r => r.classList.remove('is-sel')); cityEls.forEach(c => c.classList.remove('is-sel')); out.innerHTML = ''; cta.href = 'contact.html?type=delivery'; cta.textContent = 'Ask about delivery'; loop(); }
  sel.addEventListener('change', () => {
    if (sel.value === 'other') { clearFocus(); out.innerHTML = '<span class="tiny">Anywhere in South Africa</span><b>We deliver nationwide</b><span class="dm-res-sub">Tell us your town and we\'ll quote</span>'; return; }
    sel.value === '' ? clearFocus() : focusCity(+sel.value);
  });
  cityEls.forEach((c, i) => {
    c.addEventListener('click', () => { sel.value = i; focusCity(i); });
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel.value = i; focusCity(i); } });
  });

  if (EAG.reduced) { routes.forEach(r => { r.style.strokeDashoffset = 0; }); cityEls.forEach(c => c.classList.add('is-on')); announce(0); return; }
  new IntersectionObserver(en => {
    if (en[0].isIntersecting && !running) { running = true; if (!svg.dataset.drawn) { svg.dataset.drawn = 1; intro(); } else loop(); }
    else if (!en[0].isIntersecting) { running = false; clearTimeout(loopT); }
  }, { threshold: .3 }).observe(host);
})();
