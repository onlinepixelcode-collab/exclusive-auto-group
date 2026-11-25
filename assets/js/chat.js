/* Valet — Exclusive Auto Group's on-page assistant that works on the live stock list.
   Runs fully in the browser (no API key needed for the demo). The `reply()` function is the single place to swap in an LLM backend later. */
(function () {
  'use strict';
  const EAG = window.EAG; if (!EAG) return;
  const { R, km, esc, img, carUrl, waLink, track } = EAG;
  const NAME = EAG.assistant || 'Valet';
  const stock = EAG.stock;
  const I = EAG.icons;

  // ---------- UI ----------
  const fab = document.createElement('button');
  fab.className = 'chat-fab'; fab.type = 'button';
  fab.setAttribute('aria-label', 'Open ' + NAME + ', the Exclusive Auto Group assistant'); fab.setAttribute('aria-expanded', 'false');
  fab.classList.add('orb-fab');
  fab.innerHTML = `<span class="orb" aria-hidden="true">
      <span class="orb-halo"></span>
      <span class="orb-core"><span class="orb-liquid l1"></span><span class="orb-liquid l2"></span><span class="orb-liquid l3"></span><span class="orb-gloss"></span></span>
      <span class="orb-wave"><i></i><i></i><i></i><i></i><i></i></span>
      <svg class="orb-x" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </span>
    <span class="orb-label">Ask ${NAME}</span>`;
  const panel = document.createElement('section');
  panel.className = 'chat'; panel.setAttribute('aria-label', NAME + ' chat'); panel.setAttribute('role', 'dialog');
  panel.innerHTML = `<header class="chat-head"><span class="chat-avatar orb-mini" aria-hidden="true"><span class="orb-core"><span class="orb-liquid l1"></span><span class="orb-liquid l2"></span><span class="orb-gloss"></span></span><span class="orb-wave"><i></i><i></i><i></i></span></span><div><b>${NAME}</b><small>Exclusive Auto Group</small></div>
      <button class="chat-x" type="button" aria-label="Close chat">${I.close}</button></header>
    <div class="chat-log" aria-live="polite"></div>
    <div class="chips"></div>
    <form class="chat-form">
      <label class="attach" title="Add photos (trade-in)"><input type="file" accept="image/*" multiple class="sr-only"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 12.5 12.6 21a5.5 5.5 0 0 1-7.8-7.8l9-9a3.7 3.7 0 0 1 5.2 5.2l-9 9a1.8 1.8 0 0 1-2.6-2.6l8.3-8.3"/></svg><span class="sr-only">Attach photos</span></label>
      <label class="sr-only" for="chat-in">Message</label>
      <input id="chat-in" type="text" autocomplete="off" placeholder="e.g. black AMG under R1.2m, low mileage">
      <button type="button" class="chat-mic" aria-label="Speak to ${NAME}" aria-pressed="false" hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>
        <span class="mic-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>
      <button type="submit" class="chat-send" aria-label="Send" disabled><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg></button>
    </form>`;
  document.body.append(panel, fab);
  const sendBtn = panel.querySelector('.chat-send'), micBtn = panel.querySelector('.chat-mic');
  const syncSend = () => { sendBtn.disabled = !panel.querySelector('#chat-in').value.trim(); };
  panel.querySelector('#chat-in').addEventListener('input', syncSend);
  // voice input (Chrome, Edge, Safari): speak and Valet hears it
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    micBtn.hidden = false;
    let rec = null, listening = false;
    const stop = () => { listening = false; micBtn.classList.remove('is-on'); micBtn.setAttribute('aria-pressed', 'false'); panel.querySelector('#chat-in').placeholder = 'e.g. black AMG under R1.2m, low mileage'; };
    micBtn.addEventListener('click', () => {
      if (listening && rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = 'en-ZA'; rec.interimResults = true; rec.maxAlternatives = 1;
      const inp = panel.querySelector('#chat-in'); let final = '';
      rec.onresult = ev => { let txt = ''; for (const r of ev.results) { txt += r[0].transcript; if (r.isFinal) final = txt; } inp.value = txt; syncSend(); };
      rec.onerror = () => stop();
      rec.onend = () => { stop(); const v = (final || inp.value).trim(); if (v) { inp.value = ''; syncSend(); send(v); track('ai_chat_voice'); } };
      try { rec.start(); listening = true; micBtn.classList.add('is-on'); micBtn.setAttribute('aria-pressed', 'true'); inp.value = ''; inp.placeholder = 'Listening…'; } catch (e) { stop(); }
    });
  }
  const log = panel.querySelector('.chat-log');
  const chipsEl = panel.querySelector('.chips');
  const input = panel.querySelector('#chat-in');
  const transcript = [];
  let started = false;

  function open(v) {
    document.body.classList.toggle('chat-open', v);
    fab.setAttribute('aria-expanded', v);
    if (v) {
      if (!started) { started = true; welcome(); track('ai_chat_open'); }
      setTimeout(() => input.focus(), 250);
      if (window.matchMedia('(max-width:640px)').matches && EAG.lenis) EAG.lenis.stop();
    } else if (EAG.lenis) EAG.lenis.start();
  }
  fab.addEventListener('click', () => open(!document.body.classList.contains('chat-open')));
  panel.querySelector('.chat-x').addEventListener('click', () => { open(false); fab.focus(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('chat-open')) open(false); });
  log.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
  document.querySelectorAll('[data-open-chat]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); open(true); if (b.dataset.openChat) send(b.dataset.openChat); }));
  EAG.openChat = (msg) => { open(true); if (msg) send(msg); };

  function add(html, who) {
    const d = document.createElement('div');
    d.className = 'msg msg--' + (who || 'bot');
    d.innerHTML = html; log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    transcript.push((who === 'me' ? 'Customer: ' : NAME + ': ') + d.textContent.trim());
    return d;
  }
  function addCards(list) {
    const w = document.createElement('div'); w.className = 'chat-cards';
    w.innerHTML = list.map(c => `<a class="mini" href="${carUrl(c)}"><img src="${img(c.images[0], 'Crop213x160')}" alt="" loading="lazy">
      <div><b>${c.year} ${esc(c.make.replace('Mercedes-', 'Merc-'))} ${esc(c.model.split(' ').slice(0, 3).join(' '))}</b><span>${km(c.mileage)} · ${esc(c.engine || '')}</span><strong>${R(c.price)}</strong></div></a>`).join('');
    log.appendChild(w); log.scrollTop = log.scrollHeight;
    transcript.push(NAME + ' showed: ' + list.map(c => c.year + ' ' + c.title + ' ' + R(c.price)).join('; '));
  }
  function chips(list) {
    chipsEl.innerHTML = list.map(c => `<button class="chip" type="button">${esc(c)}</button>`).join('');
  }
  chipsEl.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) send(b.textContent); });
  const MAIN_CHIPS = ['Filter cars', 'Find me a car', 'Value my trade-in', 'Book a test drive', 'Delivery', 'Hours & directions'];

  function welcome() {
    add(`Welcome to Exclusive Auto Group. I'm ${NAME}. What are you looking to drive?\n\nType it in your own words, or tap <b>Filter cars</b> to narrow down all ${stock.length} cars step by step.`);
    chips(MAIN_CHIPS);
  }

  panel.querySelector('.chat-form').addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ''; syncSend(); send(v); } });
  panel.querySelector('input[type=file]').addEventListener('change', e => {
    const files = [...e.target.files]; if (!files.length) return;
    const d = add(`📷 ${files.length} photo${files.length > 1 ? 's' : ''} attached`, 'me');
    const strip = document.createElement('div'); strip.style.cssText = 'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap';
    files.slice(0, 6).forEach(f => { const im = new Image(); im.src = URL.createObjectURL(f); im.style.cssText = 'width:56px;height:56px;object-fit:cover'; strip.appendChild(im); });
    d.appendChild(strip);
    state.photos = (state.photos || 0) + files.length;
    track('ai_chat_photos', { count: files.length });
    think(() => {
      if (state.flow === 'trade') add('Great photos, thank you. ' + (state.step === 'photos' ? '' : 'I\'ve added them to your trade-in.'));
      else add('Thanks, I\'ve got the photos. Are these for a trade-in? Tell me the year, make, model and mileage and I\'ll put it together for our buyers.');
      if (state.flow === 'trade' && state.step === 'photos') next();
    });
  });

  function send(text) {
    add(esc(text), 'me');
    track('ai_chat_message', { flow: state.flow || 'none' });
    think(() => reply(text));
  }
  function think(fn) {
    fab.classList.add('is-thinking'); clearTimeout(think.t); think.t = setTimeout(() => fab.classList.remove('is-thinking'), 1400);
    const t = document.createElement('div'); t.className = 'msg msg--bot'; t.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    log.appendChild(t); log.scrollTop = log.scrollHeight;
    setTimeout(() => { t.remove(); fn(); }, 450 + Math.random() * 350);
  }

  // ---------- language parsing ----------
  const MAKES = [
    ['lamborghini', /lambo|lamborghini|revuelto|huracan/], ['mclaren', /mclaren|720s|570/], ['porsche', /porsche|911/],
    ['bentley', /bentley|bentayga/], ['maserati', /maserati|granturismo/], ['mercedes-amg', /\bamg\b|g63|g-wagon|g wagon|gwagon|c63|e63|a35|gle ?53|gle ?63|glc ?43/],
    ['mercedes', /merc|mercedes|benz|\bgle\b|\bglc\b|\bcla\b|v-class|vito/], ['bmw m', /\bm[2-8]\b|x[56] ?m\b|m760|m50|m60|m135|bmw m\b|m competition|csl/],
    ['bmw', /bmw|beemer|\bx[1-7]\b|3 series|7 series|\bi8\b/], ['audi', /audi|\brs ?3|\brs ?6|rsq8|tt rs/], ['land rover', /land rover|range rover|evoque|range/],
    ['toyota', /toyota|hilux|land cruiser|cruiser/], ['ford', /ford|raptor|ranger/], ['volkswagen', /vw|volkswagen|polo|golf|tiguan/],
    ['alfa romeo', /alfa|stelvio/], ['jeep', /jeep|wrangler/], ['mini', /\bmini\b/], ['hyundai', /hyundai|staria/]
  ];
  const BODIES = [['SUV', /suv|4x4 family|family car/], ['Bakkie', /bakkie|pickup|pick-up|double cab/], ['Convertible', /convertible|cabrio|roadster|spider|drop ?top/],
    ['Coupe', /coupe|coupé|2 door|two door/], ['Sedan', /sedan|saloon/], ['Hatchback', /hatch/], ['MPV', /mpv|van|7 seat|8 seat|people carrier/], ['Wagon', /wagon|estate|avant/]];
  function money(s) { // "1.2m", "800k", "R1 200 000", "25 000"
    const m = s.replace(/\s(?=\d{3}\b)/g, '').match(/r?\s?(\d+(?:[.,]\d+)?)\s?(m|mil|million|k|thousand)?/i);
    if (!m) return null;
    let n = parseFloat(m[1].replace(',', '.'));
    const u = (m[2] || '').toLowerCase();
    if (u.startsWith('m')) n *= 1e6; else if (u === 'k' || u === 'thousand') n *= 1e3;
    return n;
  }
  function parse(q) {
    const t = q.toLowerCase();
    const f = {};
    for (const [k, re] of MAKES) if (re.test(t)) { f.make = k; break; }
    for (const [k, re] of BODIES) if (re.test(t)) { f.body = k; break; }
    const under = t.match(/(?:under|below|less than|max(?:imum)?|up to|budget(?: of)?|<)\s*(r?\s?[\d.,\s]+\s?(?:m|mil|million|k|thousand)?)/);
    if (under && !/pm|per month|p\/m|a month|monthly/.test(t)) f.maxPrice = money(under[1]);
    const over = t.match(/(?:over|above|more than|from|min(?:imum)?)\s*(r?\s?[\d.,\s]+\s?(?:m|mil|million|k)?)(?!\s?km)/);
    if (over && !/pm|per month/.test(t)) f.minPrice = money(over[1]);
    if (/low mileage|low km|low kilomet/.test(t)) f.maxKm = 50000;
    const kmm = t.match(/(?:under|below|less than)\s*([\d\s.,]+k?)\s?km/); if (kmm) f.maxKm = money(kmm[1]);
    const yr = t.match(/(20[012]\d)\s*(?:or newer|\+|and newer|onwards|or later)|(?:newer than|after|from)\s*(20[012]\d)/);
    if (yr) f.minYear = +(yr[1] || yr[2]) + (yr[2] && /newer than|after/.test(t) ? 1 : 0);
    else { const y = t.match(/\b(20[012]\d)\b/); if (y && !f.maxPrice) f.year = +y[1]; }
    if (/diesel/.test(t)) f.fuel = 'Diesel'; else if (/hybrid|electric/.test(t)) f.fuel = 'Hybrid'; else if (/petrol/.test(t)) f.fuel = 'Petrol';
    if (/manual/.test(t)) f.trans = 'Manual';
    if (/v8/.test(t)) f.engine = 'V8'; else if (/v12/.test(t)) f.engine = 'V12'; else if (/v10/.test(t)) f.engine = 'V10';
    if (/cheapest|lowest price|most affordable/.test(t)) f.sort = 'price-asc';
    else if (/fastest|most powerful|quickest/.test(t)) f.sort = 'kw-desc';
    else if (/newest|latest/.test(t)) f.sort = 'year-desc';
    else if (/most expensive|flagship|top of the range/.test(t)) f.sort = 'price-desc';
    const colour = t.match(/\b(black|white|grey|gray|silver|blue|red|green|yellow|orange)\b/); if (colour) f.colour = colour[1];
    return f;
  }
  function makeMatch(c, m) {
    if (!m) return true;
    const mk = c.make.toLowerCase(), g = c.brandGroup.toLowerCase();
    if (m === 'mercedes') return mk.startsWith('mercedes');
    if (m === 'bmw') return mk === 'bmw';
    return g === m || mk === m;
  }
  function search(f) {
    let r = stock.filter(c => makeMatch(c, f.make) && (!f.body || c.body === f.body) && (!f.maxPrice || c.price <= f.maxPrice) && (!f.minPrice || c.price >= f.minPrice)
      && (!f.maxKm || (c.mileage || 0) <= f.maxKm) && (!f.minYear || c.year >= f.minYear) && (!f.year || c.year === f.year) && (!f.fuel || c.fuel === f.fuel)
      && (!f.trans || c.transmission === f.trans) && (!f.engine || (c.engine || '').includes(f.engine)));
    const s = f.sort || (f.maxPrice ? 'price-desc' : f.maxKm ? 'km-asc' : 'kw-desc');
    const by = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, 'kw-desc': (a, b) => (b.kw || 0) - (a.kw || 0), 'year-desc': (a, b) => b.year - a.year, 'km-asc': (a, b) => (a.mileage || 0) - (b.mileage || 0) };
    return r.sort(by[s]);
  }
  function describe(f) {
    const p = [];
    if (f.make) p.push(f.make.replace(/\b\w/g, x => x.toUpperCase()).replace('Bmw', 'BMW').replace('Amg', 'AMG'));
    if (f.body) p.push(f.body + 's'); if (f.fuel) p.push(f.fuel.toLowerCase());
    if (f.maxPrice) p.push('under ' + R(f.maxPrice)); if (f.minPrice) p.push('over ' + R(f.minPrice));
    if (f.maxKm) p.push('under ' + km(f.maxKm)); if (f.minYear) p.push(f.minYear + ' or newer'); if (f.year) p.push('from ' + f.year);
    return p.join(', ') || 'your search';
  }
  function findCarsByText(s) {
    const t = s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
    const toks = t.split(/\s+/).filter(w => w.length > 1 && !['the', 'and', 'or', 'a', 'vs', 'versus', 'compare', 'with', 'to', 'i', 'want', 'in', 'on'].includes(w));
    if (!toks.length) return [];
    return stock.map(c => {
      const hay = (c.year + ' ' + c.title + ' ' + c.brandGroup).toLowerCase();
      return { c, s: toks.reduce((a, w) => a + (hay.includes(w) ? (/\d/.test(w) ? 2 : 1) : 0), 0) };
    }).filter(x => x.s > 0).sort((a, b) => b.s - a.s || b.c.price - a.c.price).map(x => x.c);
  }


  // ---------- filter panel inside the chat ----------
  let lastFilter = null;
  const uniqSorted = a => [...new Set(a)].sort();
  function filterPanel(pre) {
    pre = pre || {};
    const sel = (name, label, opts) => `<label><span>${label}</span><select name="${name}">${opts.map(o => `<option value="${esc(o[0])}" ${String(pre[name] || '') === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select></label>`;
    const d = add('Choose what matters to you. Leave anything on "Any".');
    const f = document.createElement('form');
    f.className = 'chat-filter';
    f.innerHTML =
      sel('make', 'Make', [['', 'Any make']].concat(uniqSorted(stock.map(c => c.brandGroup)).map(g => [g.toLowerCase(), g]))) +
      sel('body', 'Body type', [['', 'Any body']].concat(uniqSorted(stock.map(c => c.body)).map(b => [b, b]))) +
      sel('maxPrice', 'Max price', [['', 'Any price'], [500000, 'R500 000'], [800000, 'R800 000'], [1200000, 'R1.2m'], [2000000, 'R2m'], [4000000, 'R4m'], [7000000, 'R7m']]) +
      sel('minPrice', 'Min price', [['', 'No minimum'], [500000, 'R500 000'], [1000000, 'R1m'], [2000000, 'R2m'], [4000000, 'R4m']]) +
      sel('minYear', 'Year from', [['', 'Any year']].concat([...new Set(stock.map(c => c.year))].sort((a, b) => b - a).map(y => [y, y + '+']))) +
      sel('maxKm', 'Mileage', [['', 'Any mileage'], [20000, 'Under 20 000 km'], [50000, 'Under 50 000 km'], [80000, 'Under 80 000 km'], [120000, 'Under 120 000 km']]) +
      sel('fuel', 'Fuel', [['', 'Any fuel'], ['Petrol', 'Petrol'], ['Diesel', 'Diesel'], ['Hybrid', 'Hybrid']]) +
      sel('trans', 'Gearbox', [['', 'Any gearbox'], ['Automatic', 'Automatic'], ['Manual', 'Manual']]) +
      sel('engine', 'Engine', [['', 'Any engine'], ['V8', 'V8'], ['V10', 'V10'], ['V12', 'V12'], ['I6', 'Straight-six']]) +
      sel('sort', 'Sort by', [['kw-desc', 'Most powerful'], ['price-asc', 'Lowest price'], ['price-desc', 'Highest price'], ['year-desc', 'Newest'], ['km-asc', 'Lowest mileage']]) +
      `<div class="chat-filter-foot"><span class="chat-filter-count" aria-live="polite"></span><button class="btn btn--solid" type="submit">Show cars</button></div>`;
    d.after(f);
    const read = () => { const o = {}; new FormData(f).forEach((v, k) => { if (v) o[k] = /Price|Km|Year/.test(k) ? +v : v; }); return o; };
    const upd = () => { const n = search(read()).length; f.querySelector('.chat-filter-count').textContent = n + (n === 1 ? ' car matches' : ' cars match'); };
    f.addEventListener('change', upd); upd();
    f.addEventListener('submit', e => { e.preventDefault(); const o = read(); add('Show me: ' + esc(describe(o) || 'all cars'), 'me'); think(() => showResults(o)); track('ai_chat_filter', o); });
    log.scrollTop = log.scrollHeight;
  }
  function invLink(f) {
    const q = new URLSearchParams();
    if (f.make) { const g = [...new Set(stock.map(c => c.brandGroup))].find(x => x.toLowerCase() === f.make); q.set('brand', g || f.make); }
    if (f.body) q.set('body', f.body); if (f.maxPrice) q.set('max', Math.round(f.maxPrice)); if (f.minPrice) q.set('min', Math.round(f.minPrice));
    if (f.minYear) q.set('minYear', f.minYear); if (f.maxKm) q.set('km', f.maxKm); if (f.fuel) q.set('fuel', f.fuel); if (f.trans) q.set('trans', f.trans); if (f.engine) q.set('engine', f.engine);
    return 'inventory.html' + (q.toString() ? '?' + q : '');
  }
  function showResults(f, note) {
    lastFilter = Object.assign({}, f);
    const list = search(f);
    if (!list.length) {
      add(`Nothing in stock matches ${esc(describe(f))} right now. If we don't have your vehicle, we will find it for you.`);
      return chips(['Change filters', 'Yes, find it for me', 'Talk to a salesperson']);
    }
    add(`${note ? note + ' ' : ''}${list.length} match${list.length > 1 ? 'es' : ''} for ${esc(describe(f))}.${list.length > 4 ? ' The top four:' : ''}`);
    addCards(list.slice(0, 4));
    if (list.length > 4) add(`<a href="${invLink(f)}">See all ${list.length} in the inventory</a>`);
    chips(['Refine: lowest mileage', 'Refine: newest first', 'Refine: lowest price', 'Change filters', 'Book a test drive']);
  }

  // ---------- conversation ----------
  const state = { flow: null, step: null, data: {} };
  EAG.chatState = state;
  const FLOWS = {
    trade: { steps: ['car', 'km', 'photos', 'contact'], ask: {
      car: 'Let\'s value your car. What is the year, make and model? (e.g. 2019 BMW X5 xDrive30d)',
      km: 'And the mileage, roughly? Any service history or motorplan left?',
      photos: 'If you can, add a few photos with the 📎 button (front, rear, interior, dash with mileage). Or type "skip".',
      contact: 'Last one: your name and the best number to reach you on?' } },
    find: { steps: ['car', 'budget', 'contact'], ask: {
      car: 'If we don\'t have your vehicle, we will find it for you. What are you after? Make, model, year range, colour, must-have extras.',
      budget: 'What budget are you working with? And are you trading anything in?',
      contact: 'Perfect. Your name and number so our sourcing team can come back to you?' } },
    book: { steps: ['car', 'when', 'contact'], ask: {
      car: 'Which car would you like to see? Tell me the model, or say "not sure" and we\'ll show you a few.',
      when: 'When suits you? We\'re open Mon–Fri 08:00–17:00 and Sat 08:30–13:00.',
      contact: 'Great. Your name and mobile number to confirm the booking?' } }
  };
  function startFlow(name, prefill) {
    state.flow = name; state.data = {}; state.photos = state.photos || 0;
    state.steps = FLOWS[name].steps.slice(); state.step = state.steps.shift();
    if (prefill && state.step === 'car') { state.data.car = prefill; state.step = state.steps.shift(); }
    add(FLOWS[name].ask[state.step]);
    chips(state.step === 'photos' ? ['Skip'] : ['Cancel']);
  }
  function next() {
    state.step = state.steps.shift();
    if (!state.step) return finishFlow();
    if (state.step === 'photos' && state.photos) return next();
    add(FLOWS[state.flow].ask[state.step]);
    chips(state.step === 'photos' ? ['Skip'] : state.step === 'when' ? ['Tomorrow morning', 'Saturday', 'Cancel'] : ['Cancel']);
  }
  function finishFlow() {
    const d = state.data, kind = { trade: 'Trade-in valuation', find: 'Find my ride request', book: 'Test drive booking' }[state.flow];
    const summary = `${kind}\n` + Object.entries(d).map(([k, v]) => `• ${({ car: 'Vehicle', km: 'Mileage / history', budget: 'Budget', when: 'Preferred time', contact: 'Contact' })[k] || k}: ${v}`).join('\n') + (state.flow === 'trade' ? `\n• Photos: ${state.photos || 0}` : '');
    track({ trade: 'trade_in_submit', find: 'find_my_car_submit', book: 'test_drive_booking' }[state.flow], { source: 'ai_chat' });
    add(`Done. Here's what I've captured:\n\n${esc(summary)}\n\n${state.flow === 'book' ? 'A salesperson will confirm your slot shortly.' : state.flow === 'trade' ? 'Our buyers usually come back with a figure the same business day.' : 'Our team will start searching and come back to you within one business day.'}`);
    handoff(summary);
    state.flow = null; state.step = null;
    chips(MAIN_CHIPS);
  }
  function handoff(summary) {
    const text = 'Hi Exclusive Auto Group, I chatted with ' + NAME + ' on your website.\n\n' + summary;
    const d = add(`<div style="display:flex;gap:8px;flex-wrap:wrap">
      <a class="chip" href="${waLink(text)}" data-track="whatsapp" target="_blank" rel="noopener">${EAG.whatsapp ? 'Send on WhatsApp' : 'Call sales'}</a>
      <a class="chip" href="mailto:${EAG.email}?subject=${encodeURIComponent('Website enquiry — ' + NAME)}&body=${encodeURIComponent(text)}" data-track="email">Email it</a>
      <a class="chip" href="tel:${EAG.tel}" data-track="call">Call ${EAG.phone}</a></div>`);
    d.style.background = 'transparent'; d.style.padding = '0';
    track('ai_chat_handoff');
  }

  function reply(q) {
    const t = q.toLowerCase().trim();

    if (/^(cancel|stop|never ?mind|restart|menu|start over)$/.test(t)) { state.flow = null; add('No problem. What else can I help with?'); return chips(MAIN_CHIPS); }

    // in a guided flow: store the answer
    if (state.flow) {
      if (state.step === 'photos' && /skip|no|later/.test(t)) return next();
      if (state.step === 'contact' && (q.replace(/\D/g, '').length < 9 && !/@/.test(q))) {
        add('Could you add a phone number or email so we can reach you?'); return;
      }
      if (state.step === 'car' && state.flow === 'book' && /not sure|any|show me/.test(t)) {
        add('Here are a few favourites on the floor right now:'); addCards(search({ sort: 'kw-desc' }).slice(0, 3));
        add('Tap one to open it, or tell me which you\'d like to see.'); return;
      }
      state.data[state.step] = q;
      return next();
    }

    // filter panel + refinements
    if (/^(filter cars|filter|filters|change filters|show filters|narrow down)$/.test(t) || /filter/.test(t) && t.length < 30) return filterPanel(lastFilter);
    const ref = t.match(/^refine: (lowest mileage|newest first|lowest price)$/);
    if (ref) {
      const base = Object.assign({}, lastFilter || {});
      base.sort = { 'lowest mileage': 'km-asc', 'newest first': 'year-desc', 'lowest price': 'price-asc' }[ref[1]];
      return showResults(base, 'Sorted by ' + ref[1] + '.');
    }

    // handoff
    if (/human|person|salesperson|sales person|agent|speak to|talk to|call me|keegan|ridah|manager/.test(t)) {
      add('Of course. Ridah Jappie (Sales Manager) and the team are on the floor during sales hours. I\'ll pass on our chat so you don\'t need to repeat yourself:');
      return handoff(transcript.slice(-12).join('\n'));
    }
    // greetings
    if (/^(hi|hello|hey|howzit|good (morning|afternoon|evening)|yo)\b/.test(t) && t.length < 25) { add('Hi there! Are you browsing, or after something specific? I can search all ' + stock.length + ' cars in stock for you.'); return chips(MAIN_CHIPS); }

    // flows
    if (/trade|value my|valuation|sell my|what.*worth/.test(t)) return startFlow('trade');
    if (/test drive|book|viewing|appointment|come see|come in/.test(t)) {
      const hit = findCarsByText(q.replace(/test drive|book|viewing|a |the /gi, ''));
      return startFlow('book', hit.length && hit[0] && /\d|[a-z]{3,}/.test(q.replace(/book|test drive|viewing|a|the/gi, '').trim()) && findCarsByText(q).length < 6 ? hit[0].year + ' ' + hit[0].title : null);
    }
    if (/find (it|my car|me a car for)|source|don.?t have|not in stock|looking for something specific|can you get/.test(t) && !/find me a car$/.test(t)) return startFlow('find');

    // compare
    if (/compare|vs\.?|versus|difference between/.test(t)) {
      const parts = q.split(/\bvs\.?\b|versus|\band\b|\bor\b|,|\bwith\b/i).map(s => s.replace(/compare|difference between/gi, '').trim()).filter(Boolean);
      const picks = []; parts.forEach(p => { const h = findCarsByText(p).find(c => !picks.includes(c)); if (h) picks.push(h); });
      if (picks.length >= 2) {
        const [a, b] = picks;
        const row = (l, x, y) => `${l}: ${x}  |  ${y}`;
        add(`<b>${esc(a.year + ' ' + a.title)}</b>\nvs\n<b>${esc(b.year + ' ' + b.title)}</b>\n\n` + [
          row('Price', R(a.price), R(b.price)), row('Mileage', km(a.mileage), km(b.mileage)),
          row('Engine', a.engine, b.engine), row('Power', a.kw + ' kW', b.kw + ' kW'), row('Body', a.body, b.body)].join('\n') +
          `\n\n${a.kw > b.kw ? 'The ' + a.model.split(' ')[0] + ' has more power' : 'The ' + b.model.split(' ')[0] + ' has more power'}; ${a.price < b.price ? 'the ' + a.model.split(' ')[0] + ' is ' + R(b.price - a.price) + ' less' : 'the ' + b.model.split(' ')[0] + ' is ' + R(a.price - b.price) + ' less'}.`);
        addCards([a, b]);
        return chips(['Book a test drive', 'Filter cars', 'Talk to a salesperson']);
      }
      add('Tell me the two cars, e.g. "compare M4 CSL vs 911 Turbo S".'); return;
    }

    // FAQs
    if (/hour|open|close|time|when are you/.test(t)) { add('Sales hours:\n' + EAG.hours.map(h => h.join(': ')).join('\n') + '\n\nWe\'re at 6 Manus Gerber Street, Pivot Square, N1 City, Goodwood. <a href="' + EAG.mapUrl + '" target="_blank" rel="noopener">Get directions</a>.'); return chips(['Book a test drive', 'Find me a car']); }
    if (/where|address|direction|location|find you|map/.test(t)) { add('6 Manus Gerber Street, Pivot Square, N1 City, Goodwood, Cape Town, 7460. Easy access off the N1. <a href="' + EAG.mapUrl + '" target="_blank" rel="noopener">Open in Google Maps</a>.'); return; }
    if (/finance|loan|bank|interest rate|credit|instal|pm\b|per month/.test(t)) { add('For payment options, our sales team will talk you through it personally. Want me to pass your details on?'); return chips(['Talk to a salesperson', 'Filter cars']); }
    if (/deliver|courier|ship|other province|johannesburg|joburg|durban|pretoria|gauteng|nationwide/.test(t)) { add('Yes, we deliver anywhere in South Africa. Many of our clients buy remotely: we send a detailed video walk-around, handle the paperwork digitally and deliver to your door by enclosed transport.'); return chips(['Find me a car', 'Talk to a salesperson']); }
    if (/document|paperwork|need to bring|fica|licen[cs]e|registration|natis/.test(t)) { add('To buy, you\'ll need your ID, driver\'s licence and proof of address (FICA). For finance add 3 months\' payslips and bank statements. We handle registration and licensing for you.'); return; }
    if (/warrant|certif|inspect|service history|motorplan|condition/.test(t)) { add('Every car is hand-picked and checked before it goes on the floor. Most have full service histories, and many still carry a manufacturer motorplan. Each listing shows the details, and we can send the service book on request.'); return; }
    if (/^find me a car$|browse|show me|what do you have|in stock|inventory|recommend/.test(t) && Object.keys(parse(q)).length === 0) {
      add(`We have ${stock.length} cars in stock right now, from Hilux bakkies to a Lamborghini Revuelto. Tell me what you're after in your own words, e.g. "AMG under R1.2m, low mileage", or use the filter.`);
      return chips(['Filter cars', 'SUV under R800k', 'BMW M under R1.2m', 'Supercars', 'Diesel bakkie']);
    }
    if (/supercar|exotic|hypercar/.test(t)) { add('The headline acts on the floor right now:'); addCards(stock.filter(c => ['Lamborghini', 'McLaren', 'Porsche'].includes(c.make) || (c.kw || 0) >= 440).sort((a, b) => b.price - a.price).slice(0, 4)); return chips(['Compare 720S vs Huracan', 'Book a test drive']); }

    // stock search
    const f = parse(q);
    if (Object.keys(f).length) {
      const list = search(f);
      const colourNote = f.colour ? ` Colour isn't listed on every car yet, so check the photos, or ask a salesperson to confirm a ${f.colour} one.` : '';
      if (list.length) {
        lastFilter = Object.assign({}, f);
        add(`I found ${list.length} match${list.length > 1 ? 'es' : ''} for ${esc(describe(f))}.${colourNote}${list.length > 4 ? ' Here are the best four:' : ''}`);
        addCards(list.slice(0, 4));
        if (list.length > 4) add(`<a href="${invLink(f)}">See all ${list.length} in the inventory</a>.`);
        return chips(['Refine: lowest mileage', 'Refine: newest first', 'Refine: lowest price', 'Filter cars', 'Book a test drive']);
      }
      const loose = search(Object.assign({}, f, { maxKm: null, minYear: null, year: null, fuel: null, body: null })).slice(0, 3);
      add(`Nothing in stock matches ${esc(describe(f))} exactly right now.${loose.length ? ' These are the closest:' : ''}`);
      if (loose.length) addCards(loose);
      add('If we don\'t have your vehicle, we will find it for you. Want me to start a search?');
      return chips(['Yes, find it for me', 'Cancel']);
    }
    if (/yes, find it|find it for me|start a search/.test(t)) return startFlow('find');
    if (/compare two cars/.test(t)) { add('Which two? e.g. "compare X5 M Competition vs RSQ8".'); return; }
    if (/thank|cheers|awesome|great|perfect/.test(t)) { add('My pleasure. Anything else I can help with?'); return chips(MAIN_CHIPS); }

    // fallback: try model names
    const hits = findCarsByText(q);
    if (hits.length) { add('Here\'s what I found in stock:'); addCards(hits.slice(0, 3)); return chips(['Book a test drive', 'Filter cars']); }
    add('I\'m not sure I caught that. I can filter and search stock, compare cars, value your trade-in, book a test drive or answer questions on delivery, documents and hours. Or I can hand you to a salesperson.');
    chips(['Filter cars'].concat(MAIN_CHIPS.slice(1), ['Talk to a salesperson']));
  }
})();
