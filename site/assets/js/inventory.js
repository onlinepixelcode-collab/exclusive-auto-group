/* Inventory page: detailed filter sidebar, active-filter chips, sort, URL sync */
(function () {
  'use strict';
  const EAG = window.EAG, stock = EAG.stock, { esc, R, km } = EAG;
  const $ = s => document.querySelector(s);
  const uniq = a => [...new Set(a)];
  const count = (key, v) => stock.filter(c => c[key] === v).length;
  const prices = stock.map(c => c.price), kms = stock.map(c => c.mileage || 0), years = stock.map(c => c.year);
  const P = { min: 0, max: Math.ceil(Math.max(...prices) / 100000) * 100000 };
  const KM = Math.ceil(Math.max(...kms) / 10000) * 10000;
  const Y = { min: Math.min(...years), max: Math.max(...years) };

  // ----- build sidebar -----
  const checks = (name, list, key) => list.map(v => `<label class="chk"><input type="checkbox" name="${name}" value="${esc(v)}"><span>${esc(v)}</span><em>${count(key, v)}</em></label>`).join('');
  const groups = uniq(stock.map(c => c.brandGroup)).sort((a, b) => count('brandGroup', b) - count('brandGroup', a) || a.localeCompare(b));
  $('#fx-make').innerHTML = checks('brand', groups, 'brandGroup');
  $('#fx-body').innerHTML = uniq(stock.map(c => c.body)).sort().map(b => `<label class="pill"><input type="checkbox" name="body" value="${b}"><span>${b} <em>${count('body', b)}</em></span></label>`).join('');
  $('#fx-fuel').innerHTML = checks('fuel', uniq(stock.map(c => c.fuel)).sort(), 'fuel');
  $('#fx-trans').innerHTML = checks('trans', uniq(stock.map(c => c.transmission)).sort(), 'transmission');
  $('#fx-engine').innerHTML = ['V8', 'V10', 'V12', 'I6', 'Hybrid'].map(e => `<label class="chk"><input type="checkbox" name="engine" value="${e}"><span>${e === 'I6' ? 'Straight-six' : e}</span><em>${stock.filter(c => (c.engine || '').includes(e)).length}</em></label>`).join('');
  const yOpts = uniq(years).sort((a, b) => b - a);
  $('#fx-ymin').innerHTML = '<option value="">From</option>' + yOpts.slice().reverse().map(y => `<option>${y}</option>`).join('');
  $('#fx-ymax').innerHTML = '<option value="">To</option>' + yOpts.map(y => `<option>${y}</option>`).join('');
  const pmin = $('#fx-pmin'), pmax = $('#fx-pmax'), kmax = $('#fx-km');
  [pmin, pmax].forEach(r => { r.min = P.min; r.max = P.max; r.step = 50000; });
  pmin.value = P.min; pmax.value = P.max; kmax.max = KM; kmax.step = 5000; kmax.value = KM;
  document.getElementById('inv-total').textContent = stock.length;

  // ----- read URL -----
  const q = new URLSearchParams(location.search);
  const setChecks = (name, vals) => document.querySelectorAll(`input[name="${name}"]`).forEach(i => { i.checked = vals.includes(i.value); });
  if (q.get('brand')) {
    const want = q.get('brand').split(',').map(b => b.toLowerCase());
    setChecks('brand', groups.filter(g => want.includes(g.toLowerCase()) || (want.includes('mercedes') && g.startsWith('Mercedes')) || (want.includes('bmw') && g.startsWith('BMW'))));
  }
  ['body', 'fuel', 'trans', 'engine'].forEach(k => { if (q.get(k)) setChecks(k, q.get(k).split(',')); });
  if (q.get('max')) pmax.value = Math.min(P.max, +q.get('max'));
  if (q.get('min')) pmin.value = +q.get('min');
  if (q.get('km')) kmax.value = +q.get('km');
  if (q.get('minYear')) $('#fx-ymin').value = q.get('minYear');
  if (q.get('maxYear')) $('#fx-ymax').value = q.get('maxYear');
  if (q.get('q')) $('#fx-q').value = q.get('q');
  if (q.get('sort')) $('#fx-sort').value = q.get('sort');

  const vals = name => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
  function state() {
    return { brand: vals('brand'), body: vals('body'), fuel: vals('fuel'), trans: vals('trans'), engine: vals('engine'),
      min: +pmin.value, max: +pmax.value, km: +kmax.value, ymin: +$('#fx-ymin').value || 0, ymax: +$('#fx-ymax').value || 0,
      q: $('#fx-q').value.trim().toLowerCase(), sort: $('#fx-sort').value };
  }
  const grid = $('#inv-grid');
  function apply(push) {
    if (+pmin.value > +pmax.value) [pmin.value, pmax.value] = [pmax.value, pmin.value];
    const s = state();
    $('#o-price').textContent = R(s.min) + ' – ' + (s.max >= P.max ? R(P.max) + '+' : R(s.max));
    $('#o-km').textContent = s.km >= KM ? 'Any' : 'Up to ' + km(s.km);
    let list = stock.filter(c => (!s.brand.length || s.brand.includes(c.brandGroup)) && (!s.body.length || s.body.includes(c.body))
      && (!s.fuel.length || s.fuel.includes(c.fuel)) && (!s.trans.length || s.trans.includes(c.transmission))
      && (!s.engine.length || s.engine.some(e => (c.engine || '').includes(e)))
      && c.price >= s.min && (s.max >= P.max || c.price <= s.max) && (s.km >= KM || (c.mileage || 0) <= s.km)
      && (!s.ymin || c.year >= s.ymin) && (!s.ymax || c.year <= s.ymax)
      && (!s.q || (c.year + ' ' + c.title + ' ' + c.features.join(' ')).toLowerCase().includes(s.q)));
    const sorts = { newest: (a, b) => b.id - a.id, 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price,
      'km-asc': (a, b) => (a.mileage || 0) - (b.mileage || 0), 'year-desc': (a, b) => b.year - a.year || b.price - a.price, 'kw-desc': (a, b) => (b.kw || 0) - (a.kw || 0) };
    list.sort(sorts[s.sort] || sorts.newest);
    $('#inv-count').textContent = list.length + (list.length === 1 ? ' car' : ' cars');
    $('#fx-open-count').textContent = list.length;
    grid.innerHTML = list.length ? list.map(c => EAG.cardHTML(c)).join('')
      : `<div class="empty" style="grid-column:1/-1"><p class="h3">No exact match</p><p>If we don't have your vehicle, we will find it for you.</p><a class="btn" href="find.html">Start a search</a></div>`;
    if (window.gsap && !EAG.reduced) gsap.fromTo(grid.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .6, stagger: .04, ease: 'power3.out', clearProps: 'transform' });
    // active chips
    const chips = [];
    s.brand.forEach(v => chips.push(['brand', v, v])); s.body.forEach(v => chips.push(['body', v, v])); s.fuel.forEach(v => chips.push(['fuel', v, v]));
    s.trans.forEach(v => chips.push(['trans', v, v])); s.engine.forEach(v => chips.push(['engine', v, v]));
    if (s.min > P.min) chips.push(['min', '', 'From ' + R(s.min)]); if (s.max < P.max) chips.push(['max', '', 'Up to ' + R(s.max)]);
    if (s.km < KM) chips.push(['km', '', 'Under ' + km(s.km)]); if (s.ymin) chips.push(['ymin', '', s.ymin + '+']); if (s.ymax) chips.push(['ymax', '', 'Up to ' + s.ymax]);
    if (s.q) chips.push(['q', '', '"' + s.q + '"']);
    $('#active-chips').innerHTML = chips.map(c => `<button type="button" class="chip" data-k="${c[0]}" data-v="${esc(c[1])}">${esc(c[2])} <span aria-hidden="true">×</span><span class="sr-only"> remove filter</span></button>`).join('');
    if (push) {
      const u = new URLSearchParams();
      if (s.brand.length) u.set('brand', s.brand.join(',')); ['body', 'fuel', 'trans', 'engine'].forEach(k => { if (s[k].length) u.set(k, s[k].join(',')); });
      if (s.min > P.min) u.set('min', s.min); if (s.max < P.max) u.set('max', s.max); if (s.km < KM) u.set('km', s.km);
      if (s.ymin) u.set('minYear', s.ymin); if (s.ymax) u.set('maxYear', s.ymax); if (s.q) u.set('q', s.q); if (s.sort !== 'newest') u.set('sort', s.sort);
      history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
      EAG.track('inventory_filter', Object.fromEntries(u));
    }
  }
  let tmr;
  const side = $('#filter-side');
  side.addEventListener('input', e => { if (e.target.type === 'range') apply(false); clearTimeout(tmr); tmr = setTimeout(() => apply(true), 250); });
  side.addEventListener('change', () => apply(true));
  $('#fx-sort').addEventListener('change', () => apply(true));
  side.addEventListener('submit', e => e.preventDefault());
  $('#active-chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    const k = b.dataset.k, v = b.dataset.v;
    if (['brand', 'body', 'fuel', 'trans', 'engine'].includes(k)) document.querySelectorAll(`input[name="${k}"]`).forEach(i => { if (i.value === v) i.checked = false; });
    if (k === 'min') pmin.value = P.min; if (k === 'max') pmax.value = P.max; if (k === 'km') kmax.value = KM;
    if (k === 'ymin') $('#fx-ymin').value = ''; if (k === 'ymax') $('#fx-ymax').value = ''; if (k === 'q') $('#fx-q').value = '';
    apply(true);
  });
  function clearAll() { side.querySelectorAll('input[type=checkbox]').forEach(i => i.checked = false); pmin.value = P.min; pmax.value = P.max; kmax.value = KM; $('#fx-ymin').value = ''; $('#fx-ymax').value = ''; $('#fx-q').value = ''; apply(true); }
  document.querySelectorAll('[data-clear]').forEach(b => b.addEventListener('click', clearAll));
  // quick presets
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    clearAll(); const p = b.dataset.preset;
    if (p === 'supercars') { setChecks('brand', groups.filter(g => ['Lamborghini', 'McLaren', 'Porsche'].includes(g))); }
    if (p === 'suv') setChecks('body', ['SUV']); if (p === 'under1m') pmax.value = 1000000; if (p === 'low-km') kmax.value = 30000;
    if (p === 'v8') setChecks('engine', ['V8']); if (p === 'bakkie') setChecks('body', ['Bakkie']);
    apply(true);
  }));
  // mobile drawer
  const open = v => { document.body.classList.toggle('filters-open', v); $('#fx-open').setAttribute('aria-expanded', v); if (EAG.lenis) v ? EAG.lenis.stop() : EAG.lenis.start(); };
  $('#fx-open').addEventListener('click', () => open(true));
  document.querySelectorAll('[data-close-filters]').forEach(b => b.addEventListener('click', () => open(false)));
  side.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
  apply(false);

  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: stock.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: location.origin + location.pathname.replace(/[^/]*$/, '') + 'car.html?id=' + c.id, name: c.year + ' ' + c.title })) });
  document.head.appendChild(ld);
})();
