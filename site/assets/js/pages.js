/* Finance, sell, find, about and contact pages */
(function () {
  'use strict';
  const EAG = window.EAG, stock = EAG.stock, q = new URLSearchParams(location.search);
  const $ = s => document.querySelector(s);
  const carById = id => stock.find(c => c.id === id);

  document.querySelectorAll('.js-wa').forEach(a => { a.href = EAG.waLink('Hi Exclusive Auto Group, I found you on your website.'); if (!EAG.whatsapp) a.textContent = 'Call the sales team'; });
  if ($('#about-count')) $('#about-count').textContent = stock.length;


  const forms = { '#find-form': 'Find my ride request', '#contact-form': 'Enquiry' };
  Object.entries(forms).forEach(([sel, kind]) => { const f = $(sel); if (f) EAG.handleForm(f, kind); });

  // contact: prefill request type + car
  const cs = $('#c-car');
  if (cs) {
    cs.insertAdjacentHTML('beforeend', stock.slice().sort((a, b) => a.make.localeCompare(b.make) || b.year - a.year)
      .map(c => `<option value="${EAG.esc(c.year + ' ' + c.title + ' (Ref ' + c.id + ')')}" data-id="${c.id}">${EAG.esc(c.year + ' ' + c.title)} · ${EAG.R(c.price)}</option>`).join(''));
    const c = carById(q.get('car'));
    if (c) [...cs.options].forEach(o => { if (o.dataset.id === c.id) o.selected = true; });
    const type = (q.get('type') || '').toLowerCase();
    const map = { viewing: 'Viewing', 'test-drive': 'Test drive', enquiry: 'Enquiry', delivery: 'Delivery' };
    if (map[type]) $('#c-type').value = map[type];
    if (q.get('city') && $('#contact-form textarea')) $('#contact-form textarea').value = `I'd like to know about delivery to ${q.get('city')}.`;
    if (q.get('msg') === 'inspection' && $('#contact-form textarea')) $('#contact-form textarea').value = 'Please send me the inspection report for this car.';
    if (q.get('cars') && $('#contact-form textarea')) { const list = q.get('cars').split(',').map(carById).filter(Boolean); if (list.length) $('#contact-form textarea').value = 'I\'m interested in these cars from my shortlist:\n' + list.map(c => `• ${c.year} ${c.title} (Ref ${c.id})`).join('\n'); }
    // ---- viewing calendar: real opening-hour slots, past times blocked ----
    (function slots() {
      const daysEl = $('#slot-days'); if (!daysEl) return;
      const timesEl = $('#slot-times'), sum = $('#slot-sum'), dIn = $('#c-date'), tIn = $('#c-time');
      const HOURS = { 1: [510, 990], 2: [510, 990], 3: [510, 990], 4: [510, 990], 5: [510, 990], 6: [540, 750] }; // first/last slot start (mins); Sun closed
      const sa = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      const g = k => +sa.find(p => p.type === k).value;
      const today = new Date(Date.UTC(g('year'), g('month') - 1, g('day'))), nowMin = (g('hour') % 24) * 60 + g('minute');
      const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      const days = [];
      for (let i = 0; days.length < 12 && i < 21; i++) {
        const d = new Date(today); d.setUTCDate(d.getUTCDate() + i); const dow = d.getUTCDay(), h = HOURS[dow];
        if (!h) continue;
        const times = []; for (let m = h[0]; m <= h[1]; m += 30) if (i > 0 || m >= nowMin + 60) times.push(m);
        if (times.length) days.push({ d, i, dow, times });
      }
      let selDay = 0, selTime = null;
      const fmtDay = d => d.toLocaleDateString('en-ZA', { weekday: 'short', timeZone: 'UTC' }), fmtNum = d => d.getUTCDate(), fmtMon = d => d.toLocaleDateString('en-ZA', { month: 'short', timeZone: 'UTC' });
      daysEl.innerHTML = days.map((x, k) => `<button type="button" role="option" class="slot-day" data-k="${k}" aria-selected="${k === 0}"><span>${x.i === 0 ? 'Today' : x.i === 1 ? 'Tomorrow' : fmtDay(x.d)}</span><b>${fmtNum(x.d)}</b><span>${fmtMon(x.d)}</span></button>`).join('');
      function drawTimes() {
        const x = days[selDay];
        timesEl.innerHTML = x.times.map(m => `<button type="button" role="option" class="slot-time" data-m="${m}" aria-selected="${selTime === m}">${hm(m)}</button>`).join('');
      }
      function update() {
        const x = days[selDay];
        daysEl.querySelectorAll('.slot-day').forEach((b, k) => b.setAttribute('aria-selected', k === selDay));
        drawTimes();
        if (selTime != null) {
          const iso = x.d.toISOString().slice(0, 10);
          dIn.value = iso; tIn.value = hm(selTime);
          sum.innerHTML = `<b>${x.d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })} at ${hm(selTime)}</b> · requested. We'll confirm by phone or WhatsApp.`;
        } else { dIn.value = ''; tIn.value = ''; sum.textContent = 'Choose a time. We\'ll confirm by phone or WhatsApp.'; }
      }
      daysEl.addEventListener('click', e => { const b = e.target.closest('.slot-day'); if (!b) return; selDay = +b.dataset.k; selTime = null; update(); });
      timesEl.addEventListener('click', e => { const b = e.target.closest('.slot-time'); if (!b) return; selTime = +b.dataset.m; update(); EAG.track('viewing_slot_pick'); });
      $('#contact-form').addEventListener('submit', e => {
        const need = ['Viewing', 'Test drive'].includes($('#c-type').value);
        if (need && !tIn.value) { e.preventDefault(); e.stopImmediatePropagation(); sum.innerHTML = '<b style="color:#FF4D4D">Please pick a day and time for your visit.</b>'; timesEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }, true);
      update();
    })();
    $('#contact-form').addEventListener('submit', () => { const v = $('#c-type').value; EAG.track(v === 'Test drive' ? 'test_drive_booking' : v === 'Viewing' ? 'viewing_booking' : 'enquiry', { source: 'contact_form' }); });
  }

  // ---------- brands page ----------
  const bg = $('#brand-wall');
  if (bg) {
    const LOGO = { 'BMW M': 'bmw-m', 'BMW': 'bmw', 'Mercedes-AMG': 'mercedes-amg', 'Mercedes-Benz': 'mercedes-benz', 'Land Rover': 'land-rover', 'Alfa Romeo': 'alfa-romeo', 'MINI': 'mini' };
    const groups = [...new Set(stock.map(c => c.brandGroup))].map(g => ({ g, n: stock.filter(c => c.brandGroup === g).length, top: stock.filter(c => c.brandGroup === g).sort((a, b) => b.price - a.price)[0] }))
      .sort((a, b) => b.top.price - a.top.price);
    bg.innerHTML = groups.map((o, i) => `<a class="brand-card reveal" data-delay="${(i % 4) * .06}" href="inventory.html?brand=${encodeURIComponent(o.g)}">
      <span class="brand-card-img"><img src="${EAG.img(o.top.images[0], 'Crop800x600')}" alt="" loading="lazy"></span>
      <span class="mq-plate brand-card-logo"><img src="assets/img/logos/${LOGO[o.g] || o.g.toLowerCase().replace(/[^a-z]/g, '')}.png" alt="${EAG.esc(o.g)} logo" loading="lazy"></span>
      <span class="brand-card-body"><b>${EAG.esc(o.g)}</b><span>${o.n} in stock · from ${EAG.R(Math.min(...stock.filter(c => c.brandGroup === o.g).map(c => c.price)))}</span></span>
      <span class="brand-card-arrow" aria-hidden="true">${'<svg width="18" height="12" viewBox="0 0 18 12" fill="none"><path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>'}</span></a>`).join('');
    if ($('#brand-count')) $('#brand-count').textContent = groups.length;
  }

  // ---------- sell / trade-in: step-by-step wizard ----------
  const wz = $('#sell-wizard');
  if (wz) {
    const steps = [...wz.querySelectorAll('.wz-step')];
    const dots = [...document.querySelectorAll('.wz-progress li')];
    const bar = $('.wz-bar i');
    let cur = 0;
    const pre = carById(q.get('car'));
    if (pre && wz.querySelector('[name=interested_in]')) wz.querySelector('[name=interested_in]').value = pre.year + ' ' + pre.title + ' (Ref ' + pre.id + ')';
    function show(i, focus) {
      cur = i;
      steps.forEach((s, j) => { s.hidden = j !== i; s.classList.toggle('is-active', j === i); });
      dots.forEach((d, j) => { d.classList.toggle('is-done', j < i); d.classList.toggle('is-active', j === i); d.toggleAttribute('aria-current', j === i); });
      bar.style.transform = `scaleX(${(i + 1) / steps.length})`;
      $('#wz-count').textContent = `Step ${i + 1} of ${steps.length}`;
      if (i === steps.length - 1) review();
      if (window.gsap && !EAG.reduced) gsap.fromTo(steps[i], { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: .6, ease: 'power3.out' });
      if (focus) { const f = steps[i].querySelector('input,select,textarea,button'); if (f) f.focus({ preventScroll: true }); wz.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      EAG.track('trade_in_step', { step: i + 1 });
    }
    function valid(i) {
      const fields = [...steps[i].querySelectorAll('input,select,textarea')];
      for (const f of fields) if (!f.checkValidity()) { f.reportValidity(); return false; }
      return true;
    }
    // photo previews
    const ph = wz.querySelector('input[type=file]');
    if (ph) ph.addEventListener('change', () => {
      const box = $('#wz-previews'); box.innerHTML = '';
      [...ph.files].slice(0, 8).forEach(f => { const im = new Image(); im.src = URL.createObjectURL(f); im.alt = f.name; box.appendChild(im); });
    });
    // condition choice cards
    wz.querySelectorAll('.choice input').forEach(i => i.addEventListener('change', () => wz.querySelectorAll(`.choice input[name="${i.name}"]`).forEach(x => x.closest('.choice').classList.toggle('is-on', x.checked))));
    function review() {
      const d = new FormData(wz), rows = [];
      const label = { make: 'Make', model: 'Model', year: 'Year', mileage: 'Mileage (km)', colour: 'Colour', condition: 'Condition', service_history: 'Service history', finance_outstanding: 'Finance outstanding', accidents: 'Accident history', notes: 'Notes', name: 'Name', phone: 'Mobile', email: 'Email', interested_in: 'Interested in', plan: 'Plan' };
      d.forEach((v, k) => { if (typeof v === 'string' && v && label[k]) rows.push(`<div><dt>${label[k]}</dt><dd>${EAG.esc(v)}</dd></div>`); });
      const n = ph && ph.files.length; if (n) rows.push(`<div><dt>Photos</dt><dd>${n} attached</dd></div>`);
      $('#wz-review').innerHTML = rows.join('');
    }
    wz.addEventListener('click', e => {
      if (e.target.closest('[data-next]')) { if (valid(cur)) show(Math.min(cur + 1, steps.length - 1), true); }
      if (e.target.closest('[data-prev]')) show(Math.max(cur - 1, 0), true);
      const ed = e.target.closest('[data-goto]'); if (ed) show(+ed.dataset.goto, true);
    });
    wz.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && cur < steps.length - 1) { e.preventDefault(); if (valid(cur)) show(cur + 1, true); } });
    EAG.handleForm(wz, 'Trade-in valuation');
    show(0, false);
  }
})();
