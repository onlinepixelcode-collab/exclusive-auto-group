/* Exclusive Auto Group — shared site script (header, menu, footer, theme, motion, analytics, helpers) */
(function () {
  'use strict';

  // ---------- business config (edit here) ----------
  const EAG = window.EAG = {
    name: 'Exclusive Auto Group',
    phone: '+27 87 896 9192',
    tel: '+27878969192',
    email: 'Keegan@exclusiveag.co.za',
    whatsapp: '',            // TODO: client WhatsApp number in 27XXXXXXXXX format. Empty = WhatsApp buttons fall back to calling.
    googleRating: null,      // TODO: real Google rating, e.g. 4.8. Null = the stat shows nationwide delivery instead.
    assistant: 'Valet',      // name of the on-site AI assistant
    instagram: 'https://www.instagram.com/exclusive.auto.group',
    facebook: 'https://www.facebook.com/exclusiveautogroup', // TODO: confirm page URL
    address: '6 Manus Gerber Street, Pivot Square, N1 City, Goodwood, Cape Town, 7460',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=6+Manus+Gerber+Street+Goodwood+Cape+Town+7460',
    hours: [['Mon – Fri', '08:00 – 17:00'], ['Saturday', '08:30 – 13:00'], ['Sun & public holidays', 'Closed']],
    stock: window.EAG_STOCK || []
  };

  // ---------- helpers ----------
  const R = n => 'R' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ').replace(/ /g, ' ');
  const km = n => n == null ? '—' : Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ').replace(/ /g, ' ') + ' km';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const img = (url, size) => size === 'full' ? url : url + '/' + (size || 'Crop800x600');
  const carUrl = c => 'car.html?id=' + c.id;
  function waLink(text) {
    if (!EAG.whatsapp) return 'tel:' + EAG.tel;
    return 'https://wa.me/' + EAG.whatsapp + '?text=' + encodeURIComponent(text || 'Hi Exclusive Auto Group');
  }
  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data || {}));
    if (typeof window.gtag === 'function') window.gtag('event', event, data || {});
  }
  Object.assign(EAG, { R, km, esc, img, carUrl, waLink, track });


  // ---------- My Garage + Compare (saved in this browser) ----------
  function store(key, max) {
    const read = () => { try { return JSON.parse(localStorage.getItem(key) || '[]').filter(id => EAG.stock.some(c => c.id === id)); } catch (e) { return []; } };
    const write = l => { try { localStorage.setItem(key, JSON.stringify(l)); } catch (e) {} document.dispatchEvent(new CustomEvent('eag:lists')); };
    return {
      list: read, has: id => read().includes(id),
      toggle(id) { let l = read(); if (l.includes(id)) l = l.filter(x => x !== id); else { if (max && l.length >= max) l.shift(); l.push(id); } write(l); return l.includes(id); },
      set: write, clear: () => write([])
    };
  }
  EAG.garage = store('eag-garage', 0);
  EAG.compare = store('eag-compare', 3);
  function syncLists() {
    const g = EAG.garage.list(), cm = EAG.compare.list();
    document.querySelectorAll('[data-fav]').forEach(b => { const on = g.includes(b.dataset.fav); b.setAttribute('aria-pressed', on); b.classList.toggle('is-on', on); });
    document.querySelectorAll('[data-cmp]').forEach(b => { const on = cm.includes(b.dataset.cmp); b.setAttribute('aria-pressed', on); b.classList.toggle('is-on', on); });
    document.querySelectorAll('[data-garage-count]').forEach(n => { n.textContent = g.length; n.hidden = !g.length; });
    renderTray(cm);
  }
  EAG.syncLists = syncLists;
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-fav]'), m = e.target.closest('[data-cmp]');
    if (f) { e.preventDefault(); const on = EAG.garage.toggle(f.dataset.fav); f.classList.add('pop'); setTimeout(() => f.classList.remove('pop'), 400); toast(on ? 'Saved to My Garage' : 'Removed from My Garage', on ? 'garage.html' : null, 'View garage'); track(on ? 'garage_add' : 'garage_remove', { id: f.dataset.fav }); }
    if (m) { e.preventDefault(); const was = EAG.compare.list().length >= 3 && !EAG.compare.has(m.dataset.cmp); const on = EAG.compare.toggle(m.dataset.cmp); if (was) toast('Compare holds 3 cars, so the oldest pick was swapped out'); track(on ? 'compare_add' : 'compare_remove', { id: m.dataset.cmp }); }
  });
  document.addEventListener('eag:lists', syncLists);
  window.addEventListener('storage', e => { if (e.key === 'eag-garage' || e.key === 'eag-compare') syncLists(); });

  // small toast
  let toastEl, toastT;
  function toast(msg, href, linkText) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = esc(msg) + (href ? ` <a href="${href}">${esc(linkText)}</a>` : '');
    toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  }
  EAG.toast = toast;

  // compare tray
  let tray;
  function renderTray(ids) {
    if (page === 'compare') { if (tray) tray.hidden = true; return; }
    if (!tray) { tray = document.createElement('div'); tray.className = 'cmp-tray'; tray.setAttribute('role', 'region'); tray.setAttribute('aria-label', 'Cars to compare'); document.body.appendChild(tray); }
    if (!ids.length) { tray.classList.remove('is-on'); return; }
    const cars = ids.map(id => EAG.stock.find(c => c.id === id)).filter(Boolean);
    tray.innerHTML = `<span class="tiny">Compare</span><div class="cmp-slots">${[0, 1, 2].map(i => cars[i]
        ? `<span class="cmp-slot"><img src="${img(cars[i].images[0], 'Crop213x160')}" alt=""><button type="button" data-cmp="${cars[i].id}" aria-label="Remove ${esc(cars[i].title)}">×</button></span>`
        : '<span class="cmp-slot is-empty">+</span>').join('')}</div>
      <a class="btn btn--white" href="compare.html?ids=${ids.join(',')}" ${cars.length < 2 ? 'aria-disabled="true"' : ''}>${cars.length < 2 ? 'Add one more' : 'Compare ' + cars.length}</a>
      <button type="button" class="cmp-clear" aria-label="Clear compare">Clear</button>`;
    tray.querySelector('.cmp-clear').onclick = () => EAG.compare.clear();
    const go = tray.querySelector('.btn'); go.onclick = e => { if (cars.length < 2) { e.preventDefault(); toast('Pick at least two cars to compare'); } };
    tray.classList.add('is-on');
  }

  // ---------- live opening hours (Cape Town time) ----------
  // [day 0=Sun..6=Sat] -> [open, close] in minutes, null = closed. Public holidays not included.
  const WEEK = [null, [480, 1020], [480, 1020], [480, 1020], [480, 1020], [480, 1020], [510, 780]];
  const DAYN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  function nowSA() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const g = t => (parts.find(p => p.type === t) || {}).value;
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: (+g('hour') % 24) * 60 + +g('minute') };
  }
  EAG.hoursStatus = function () {
    const n = nowSA(), today = WEEK[n.day];
    if (today && n.min >= today[0] && n.min < today[1]) {
      const left = today[1] - n.min;
      return { open: true, text: 'Open now', sub: left <= 60 ? `Closes in ${left} min` : `Until ${hm(today[1])} today`, day: n.day };
    }
    for (let i = 0; i < 8; i++) {
      const d = (n.day + i) % 7, w = WEEK[d];
      if (!w || (i === 0 && n.min >= w[0])) continue;
      return { open: false, text: 'Closed', sub: `Opens ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYN[d]} at ${hm(w[0])}`, day: n.day };
    }
    return { open: false, text: 'Closed', sub: '', day: n.day };
  };
  EAG.hoursHTML = function (compact) {
    const st = EAG.hoursStatus();
    const order = [1, 2, 3, 4, 5, 6, 0];
    const rows = order.map(d => `<li class="${d === st.day ? 'is-today' : ''}${WEEK[d] ? '' : ' is-off'}"><span class="hd">${compact ? DAYN[d].slice(0, 3) : DAYN[d]}</span><i></i><span class="ht">${WEEK[d] ? hm(WEEK[d][0]) + ' – ' + hm(WEEK[d][1]) : 'Closed'}</span></li>`).join('');
    return `<div class="hours"><div class="hours-status ${st.open ? 'is-open' : 'is-closed'}"><span class="hours-dot" aria-hidden="true"></span><b>${st.text}</b><span>${st.sub}</span></div>
      <ul class="hours-list">${rows}</ul><p class="hours-note">Closed on public holidays · Cape Town time</p></div>`;
  };
  EAG.fillHours = function () {
    document.querySelectorAll('[data-hours]').forEach(el => { el.innerHTML = EAG.hoursHTML(el.dataset.hours === 'compact'); });
    document.querySelectorAll('[data-hours-status]').forEach(el => { const st = EAG.hoursStatus(); el.classList.add('hours-pill'); el.classList.toggle('is-open', st.open); el.classList.toggle('is-closed', !st.open); el.innerHTML = `<span class="hours-dot" aria-hidden="true"></span>${st.text} · ${st.sub}`; });
  };

  // trim: model name split into a short display name + trim line
  EAG.splitTitle = function (c) {
    let words = c.model.replace(/\b(\d{3}) ([A-Z])\b/g, '$1$2').split(' ');           // "570 S" -> "570S"
    if (words.length > 1 && words[1].toUpperCase().startsWith(words[0].toUpperCase()) && words[1].length > words[0].length) words = words.slice(1); // "GLE GLE400d" -> "GLE400d"
    words = words.filter(w => !/^(A\/T|Auto)$/i.test(w));
    // keep short suffixes with the model name: "911 Turbo S", "X5 M", "G-Class G63"
    let n = Math.min(2, words.length);
    while (n < words.length && n < 4 && (words[n].length <= 2 || /^(M|S|RS|GT|GTS|CSL)$/i.test(words[n]))) n++;
    const shortModel = words.slice(0, n).join(' ');
    const trim = words.slice(n).join(' ');
    const make = c.make === 'Mercedes-Benz' ? 'Mercedes' : c.make === 'Mercedes-AMG' ? 'AMG' : c.make;
    const name = (make + ' ' + shortModel).trim();
    const trimOut = trim && !name.toLowerCase().endsWith(trim.toLowerCase()) ? trim : (name.toLowerCase().includes(c.body.toLowerCase()) ? '' : c.body);
    return { name, trim: trimOut };
  };

  EAG.cardHTML = function (c, opts) {
    const t = EAG.splitTitle(c);
    const tag = opts && opts.tag ? `<span class="card-tag">${esc(opts.tag)}</span>` : '';
    const nm = esc(c.year + ' ' + c.title);
    return `<article class="card" itemscope itemtype="https://schema.org/Car" data-car="${c.id}">
      <div class="card-actions">
        <button type="button" class="ca-btn ca-fav" data-fav="${c.id}" aria-pressed="false" aria-label="Save ${nm} to My Garage" title="Save to My Garage">${EAG.icons.heart}</button>
        <button type="button" class="ca-btn ca-cmp" data-cmp="${c.id}" aria-pressed="false" aria-label="Add ${nm} to compare" title="Compare">${EAG.icons.compare}</button>
      </div>
      <a class="card-media" href="${carUrl(c)}" tabindex="-1" aria-hidden="true" data-cycle="${c.images.slice(0, 5).map(u => u.split('/').pop()).join(',')}">${tag}<span class="card-dots">${c.images.slice(0, 5).map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</span>
        <img src="${img(c.images[0], 'Crop800x600')}" alt="${esc(c.year + ' ' + c.title)}" loading="lazy" width="800" height="600">
      </a>
      <div class="card-body">
        <span class="card-year">${c.year}</span>
        <h3 class="card-title" itemprop="name">${esc(t.name)}</h3>
        <p class="card-trim" style="margin:0">${[t.trim, c.transmission].filter(Boolean).map(esc).join(' · ')}</p>
        <dl class="specs">
          <div><dt>Mileage</dt><dd>${km(c.mileage)}</dd></div>
          <div><dt>Engine</dt><dd>${esc((c.engine || '—').split(' ').slice(0, 2).join(' '))}</dd></div>
          <div><dt>Power</dt><dd>${c.kw ? c.kw + ' kW' : '—'}</dd></div>
        </dl>
        <div class="card-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer"><span itemprop="price" content="${c.price}">${R(c.price)}</span><meta itemprop="priceCurrency" content="ZAR"></div>
        <div class="card-pm">${esc(c.body)} · ${esc(c.fuel)} · Ref ${c.id}</div>
        <a class="btn" href="${carUrl(c)}">View details<span class="sr-only"> — ${esc(c.year + ' ' + c.title)}</span></a>
      </div>
    </article>`;
  };

  // ---------- icons ----------
  const I = {
    arrow: '<svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true"><path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>',
    sun: '<svg class="i-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></svg>',
    moon: '<svg class="i-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/></svg>',
    ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    fb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.8c0-.8.5-1.3 1.3-1.3H17V2.3h-2.6C11.7 2.3 10.5 4 10.5 6.4v2.1H8V12h2.5v9.7H14V12h2.7l.4-3.5H14Z"/></svg>',
    wa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.4Z"/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path class="hf" d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.5 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"/></svg>',
    compare: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 4v16M17 4v16"/><path d="M3 8l4-4 4 4M13 16l4 4 4-4"/></svg>',
    garage: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 10 12 3.5 21.5 10"/><path d="M4.5 9v11.5h15V9"/><path d="M7.5 20.5v-8h9v8"/><path d="M7.5 15h9M7.5 17.75h9"/></svg>'
  };
  EAG.icons = I;

  // ---------- theme ----------
  const root = document.documentElement;
  function setTheme(t, save) {
    root.setAttribute('data-theme', t);
    if (save) { try { localStorage.setItem('eag-theme', t); } catch (e) {} }
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    document.dispatchEvent(new CustomEvent('eag:theme', { detail: t }));
  }

  // ---------- header + menu ----------
  const page = document.body.dataset.page || '';
  const NAV = [
    ['index.html', 'Home', ''],
    ['inventory.html', 'Inventory', ''],
    ['brands.html', 'Brands', ''],
    ['sell.html', 'Sell / Trade-in', ''],
    ['find.html', 'Find My Ride', ''],
    ['garage.html', 'My Garage', ''],
    ['about.html', 'About', ''],
    ['contact.html', 'Contact', '']
  ];
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `<div class="header-row">
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu"><span class="burger" aria-hidden="true"></span><span>Menu</span></button>
      <a class="brand" href="index.html" aria-label="Exclusive Auto Group — home"><img src="assets/img/logo.png" alt="Exclusive Auto Group" width="184" height="46"></a>
      <nav class="main-nav" aria-label="Main">${NAV.filter(n => n[1] !== 'Home').map(n => { const f = n[0].split(/[?#]/)[0]; const on = f === (location.pathname.split('/').pop() || 'index.html') || (page === 'car' && f === 'inventory.html'); return `<a href="${n[0]}"${on ? ' aria-current="page"' : ''}>${n[1]}</a>`; }).join('')}</nav>
      <div class="header-actions">
        <a class="garage-link" href="garage.html" aria-label="My Garage, saved cars">${I.garage}<span class="garage-count" data-garage-count hidden>0</span></a>
        <button class="theme-toggle" type="button" aria-label="Switch theme">${I.sun}${I.moon}</button>
        <a class="btn" href="contact.html?type=viewing" data-track="cta_book_viewing">Book a viewing</a>
      </div>
    </div>`;
  const menu = document.createElement('div');
  menu.className = 'menu'; menu.id = 'site-menu';
  menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', 'Site menu');
  menu.innerHTML = `<button class="menu-close" type="button">${I.close}<span>Close</span></button>
    <nav class="menu-nav" aria-label="Main">${NAV.map((n, i) => `<a href="${n[0]}" style="transition-delay:${.08 + i * .05}s"><small>0${i + 1}</small>${n[1]}${n[2] ? `<small>${n[2]}</small>` : ''}</a>`).join('')}</nav>
    <aside class="menu-aside">
      <div class="menu-photo"><img src="assets/img/hero-2-revuelto.jpg" alt="" loading="lazy"><span class="eyebrow">Now in the showroom</span><b>Lamborghini Revuelto</b></div>
      <div class="menu-info">
        <div><strong>Sales hours</strong><div data-hours="compact"></div></div>
        <div><strong>Visit</strong><p><a href="${EAG.mapUrl}" target="_blank" rel="noopener">${EAG.address}</a></p></div>
      </div>
      <div class="menu-actions"><a class="btn btn--white" href="tel:${EAG.tel}" data-track="call">${I.phone} Call</a><a class="btn btn--light" href="${waLink()}" data-track="whatsapp">${I.wa} WhatsApp</a></div>
      <div class="socials"><a href="${EAG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a><a href="${EAG.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb}</a><a href="mailto:${EAG.email}" aria-label="Email" data-track="email">@</a></div>
    </aside>
    <button class="menu-scrim" type="button" tabindex="-1" aria-label="Close menu"></button>`;

  const skip = document.createElement('a');
  skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
  document.body.prepend(menu); document.body.prepend(header); document.body.prepend(skip);

  const menuBtn = header.querySelector('.menu-btn');
  let lastFocus = null;
  function toggleMenu(open) {
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (EAG.lenis) open ? EAG.lenis.stop() : EAG.lenis.start();
    if (open) { lastFocus = document.activeElement; setTimeout(() => menu.querySelector('.menu-close').focus(), 50); }
    else if (lastFocus) lastFocus.focus();
  }
  menuBtn.addEventListener('click', () => toggleMenu(true));
  menu.querySelector('.menu-close').addEventListener('click', () => toggleMenu(false));
  menu.querySelector('.menu-scrim').addEventListener('click', () => toggleMenu(false));
  menu.addEventListener('click', e => { if (e.target.closest('a')) toggleMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) toggleMenu(false);
    if (e.key === 'Tab' && menu.classList.contains('is-open')) {
      const f = menu.querySelectorAll('a,button'); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  header.querySelector('.theme-toggle').addEventListener('click', () => {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    track('theme_toggle', { theme: root.getAttribute('data-theme') });
  });
  setTheme(root.getAttribute('data-theme') || 'dark', false);

  const solidAt = () => (document.body.dataset.solidAt ? parseFloat(document.body.dataset.solidAt) : 40);
  function onScroll() { header.classList.toggle('is-solid', window.scrollY > solidAt()); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- brand slider + footer ----------
  const BRAND_LOGOS_OLD = [['lamborghini', 'Lamborghini'], ['mclaren', 'McLaren'], ['porsche', 'Porsche'], ['bentley', 'Bentley'], ['mercedes', 'Mercedes-AMG'], ['bmw', 'BMW M'], ['audi', 'Audi Sport'], ['maserati', 'Maserati'], ['landrover', 'Land Rover'], ['toyota', 'Toyota'], ['ford', 'Ford'], ['volkswagen', 'Volkswagen'], ['alfaromeo', 'Alfa Romeo'], ['jeep', 'Jeep'], ['mini', 'MINI'], ['hyundai', 'Hyundai']];
  const BRAND_LOGOS = [['lamborghini', 'Lamborghini'], ['mclaren', 'McLaren'], ['porsche', 'Porsche'], ['bentley', 'Bentley'], ['mercedes-amg', 'Mercedes-AMG'], ['mercedes-benz', 'Mercedes-Benz'], ['bmw-m', 'BMW M'], ['bmw', 'BMW'], ['audi', 'Audi'], ['maserati', 'Maserati'], ['land-rover', 'Land Rover'], ['toyota', 'Toyota'], ['ford', 'Ford'], ['volkswagen', 'Volkswagen'], ['alfa-romeo', 'Alfa Romeo'], ['jeep', 'Jeep'], ['mini', 'MINI'], ['hyundai', 'Hyundai']];
  const marquee = document.createElement('section');
  marquee.className = 'marquee';
  marquee.setAttribute('aria-label', 'Marques we deal in');
  const logoRow = BRAND_LOGOS.map(b => `<a class="marquee-item" href="inventory.html?brand=${encodeURIComponent(b[1])}"><span class="mq-plate mq-plate--lg"><img src="assets/img/logos/${b[0]}.png" alt="${b[1]} logo" loading="lazy" width="160" height="100"></span><span class="marquee-name">${b[1]}</span></a>`).join('');
  marquee.innerHTML = `<div class="wrap marquee-head"><span class="eyebrow">Marques we deal in</span><span class="tiny">If we don't have it, we'll find it</span></div>
    <div class="marquee-viewport"><div class="marquee-track">${logoRow}<div class="marquee-dup" aria-hidden="true">${logoRow.replace(/href="[^"]*"/g, 'tabindex="-1"')}</div></div></div>`;
  document.body.appendChild(marquee);

  const heart = '<svg class="heart" width="14" height="13" viewBox="0 0 24 22" aria-label="love" role="img"><path fill="#FFFFFF" d="M12 21.6 10.3 20C4.2 14.5 0 10.7 0 6.1 0 2.6 2.7 0 6.2 0c1.9 0 3.8.9 5 2.3C13.2.9 15 0 17 0c3.4 0 6.1 2.6 6.1 6.1 0 4.6-4.1 8.4-10.3 13.9L12 21.6Z"/></svg>';
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
  <div class="foot-band">
    <img src="assets/img/detail-mclaren.jpg" alt="" loading="lazy">
    <div class="wrap foot-band-inner">
      <div><span class="eyebrow">Exclusive Auto Group · Cape Town · Est. 2014</span>
        <h2 class="foot-statement"><span class="l1">Exclusive,</span><span class="l2">by nature.</span></h2></div>
      <div class="foot-actions">
        <a class="btn btn--white" href="contact.html?type=viewing" data-track="cta_book_viewing">Book a viewing</a>
        <a class="btn btn--light" href="inventory.html">Explore inventory</a>
      </div>
    </div>
  </div>
  <div class="wrap">
    <div class="foot-cols">
      <div class="foot-col foot-brand">
        <img src="assets/img/logo.png" alt="Exclusive Auto Group" width="200" height="50" loading="lazy">
        <p>Premium and performance pre-owned cars, hand-picked in Cape Town since 2014.</p>
        <div class="socials">
          <a href="${EAG.instagram}" target="_blank" rel="noopener" aria-label="Instagram @exclusive.auto.group">${I.ig}</a>
          <a href="${EAG.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb}</a>
          <a href="${waLink()}" aria-label="WhatsApp" data-track="whatsapp">${I.wa}</a>
        </div>
      </div>
      <nav class="foot-col" aria-label="Footer"><h4>Explore</h4>
        <ul class="foot-links">
          <li><a href="inventory.html">Inventory</a></li><li><a href="brands.html">Brands</a></li>
          <li><a href="sell.html">Sell / trade-in</a></li><li><a href="find.html">Find my ride</a></li>
          <li><a href="about.html">About us</a></li><li><a href="about.html#delivery">Delivery</a></li>
          <li><a href="about.html#reviews">Reviews</a></li><li><a href="contact.html">Contact</a></li>
        </ul></nav>
      <div class="foot-col"><h4>Visit the showroom</h4>
        <address><a href="${EAG.mapUrl}" target="_blank" rel="noopener">6 Manus Gerber Street, Pivot Square<br>N1 City, Goodwood, Cape Town 7460</a></address>
        <span data-hours-status></span>
        <a class="link-arrow foot-dir" href="${EAG.mapUrl}" target="_blank" rel="noopener">Get directions ${I.arrow}</a>
      </div>
      <div class="foot-col"><h4>Talk to us</h4>
        <a class="foot-phone" href="tel:${EAG.tel}" data-track="call">${EAG.phone}</a>
        <a class="foot-mail" href="mailto:${EAG.email}" data-track="email">${EAG.email}</a>
        <a class="link-arrow foot-dir" href="${waLink()}" data-track="whatsapp">${EAG.whatsapp ? 'WhatsApp us' : 'Call the sales team'} ${I.arrow}</a>
      </div>
    </div>
    <div class="foot-hours-row"><h4>Sales hours</h4><div data-hours="compact"></div></div>
    <div class="foot-bottom">
      <span>© ${new Date().getFullYear()} Exclusive Auto Group. All rights reserved.</span>
      <span class="made-by">Made with ${heart} by <a href="https://pixelcode.co.za" target="_blank" rel="noopener">Pixel Code</a></span>
      <span><a href="privacy.html">Privacy policy</a> · <a href="terms.html">Terms &amp; conditions</a></span>
    </div>
  </div>
  <div class="foot-watermark" aria-hidden="true">Exclusive</div>`;
  document.body.appendChild(footer);
  EAG.fillHours(); setInterval(EAG.fillHours, 60000);

  // ---------- page transitions ----------
  const curtain = document.createElement('div');
  curtain.className = 'curtain is-on'; curtain.setAttribute('aria-hidden', 'true');
  let firstVisit = false;
  try { firstVisit = !sessionStorage.getItem('eag-intro'); sessionStorage.setItem('eag-intro', '1'); } catch (e) {}
  const reducedIntro = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introDone = !firstVisit || reducedIntro, pageReady = false, hideCurtain;
  if (firstVisit && !reducedIntro) {
    // first visit: a glowing ENGINE START button pulses while the site loads, then presses itself
    curtain.classList.add('is-intro', 'is-start');
    curtain.setAttribute('aria-hidden', 'false'); curtain.setAttribute('role', 'status'); curtain.setAttribute('aria-label', 'Loading Exclusive Auto Group');
    curtain.innerHTML = `<img class="es-logo" src="assets/img/logo.png" alt="" width="220" height="55">
      <button type="button" class="es-btn" aria-label="Engine start: enter the site">
        <svg class="es-ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" class="es-track"/><circle cx="100" cy="100" r="92" class="es-prog"/></svg>
        <span class="es-face"><span class="es-sm">Engine</span><b>Start</b><span class="es-sm">Stop</span></span>
      </button>
      <span class="es-status">Warming up<span class="es-dots"><i>.</i><i>.</i><i>.</i></span></span>`;
    const prog = curtain.querySelector('.es-prog'), status = curtain.querySelector('.es-status'), btn = curtain.querySelector('.es-btn');
    const C = 2 * Math.PI * 92; prog.style.strokeDasharray = C; prog.style.strokeDashoffset = C;
    const t0 = performance.now(); let shown = 0;
    const setP = v => { shown = v; prog.style.strokeDashoffset = C * (1 - v); };
    // creep towards 90% while loading; finish when the page is ready
    (function creep() { if (introDone) return; const t = (performance.now() - t0) / 1000; const target = pageReady ? 1 : Math.min(.9, 1 - Math.exp(-t * 1.1)); setP(shown + (target - shown) * .12); if (pageReady && shown > .985 && t > 1.2) return ignite(); requestAnimationFrame(creep); })();
    function ignite() {
      if (introDone) return; introDone = true; setP(1);
      status.textContent = 'Ready';
      curtain.classList.add('is-press');
      setTimeout(() => { curtain.classList.add('is-ignite'); }, 260);
      setTimeout(() => { curtain.classList.remove('is-on', 'is-intro'); curtain.setAttribute('aria-hidden', 'true'); }, 900);
      setTimeout(() => { curtain.classList.remove('is-start', 'is-press', 'is-ignite'); curtain.innerHTML = '<img src="assets/img/logo.png" alt="" width="200" height="50">'; }, 1500);
      track('intro_engine_start', { page });
    }
    btn.addEventListener('click', () => { pageReady = true; ignite(); });
    hideCurtain = () => { pageReady = true; };
  } else {
    curtain.innerHTML = '<img src="assets/img/logo.png" alt="" width="200" height="50">';
    hideCurtain = () => setTimeout(() => curtain.classList.remove('is-on', 'is-intro'), 80);
  }
  document.body.appendChild(curtain);
  EAG.revealPage = function () { hideCurtain(); };
  if (page !== 'home' && page !== 'car') window.addEventListener('DOMContentLoaded', EAG.revealPage);
  window.addEventListener('load', EAG.revealPage);
  setTimeout(() => { pageReady = true; if (introDone) curtain.classList.remove('is-on', 'is-intro'); }, 6000); // safety
  setTimeout(() => { if (curtain.classList.contains('is-on') && !curtain.classList.contains('is-start')) curtain.classList.remove('is-on'); }, 3500);
  window.addEventListener('pageshow', e => { if (e.persisted) curtain.classList.remove('is-on', 'is-intro', 'is-start'); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!/^[a-z-]+\.html/.test(href) && href !== 'index.html') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault(); curtain.classList.add('is-on');
    setTimeout(() => { location.href = href; }, 360);
  });

  // ---------- cookie banner (POPIA) ----------
  let consent = null;
  try { consent = localStorage.getItem('eag-consent'); } catch (e) {}
  if (!consent) {
    const c = document.createElement('div');
    c.className = 'cookie'; c.setAttribute('role', 'region'); c.setAttribute('aria-label', 'Cookie notice');
    c.innerHTML = `<p>We use essential cookies to run this site and, with your permission, analytics cookies to improve it. Read our <a href="privacy.html">privacy policy</a> (POPIA).</p>
      <div class="cookie-actions"><button class="btn btn--solid" data-c="all">Accept all</button><button class="btn" data-c="essential">Essential only</button></div>`;
    document.body.appendChild(c);
    c.addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      try { localStorage.setItem('eag-consent', b.dataset.c); } catch (err) {}
      track('cookie_consent', { choice: b.dataset.c }); c.remove();
    });
  }

  // ---------- analytics on clicks ----------
  document.addEventListener('click', e => {
    const a = e.target.closest('a,button'); if (!a) return;
    const href = a.getAttribute('href') || '';
    if (a.dataset.track) track(a.dataset.track, { label: a.textContent.trim().slice(0, 60), page });
    else if (href.startsWith('tel:')) track('call', { page });
    else if (href.includes('wa.me')) track('whatsapp', { page });
    else if (href.startsWith('mailto:')) track('email', { page });
  });

  // ---------- motion ----------
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  EAG.reduced = reduced;
  if (reduced) root.classList.add('reduced');

  function initMotion() {
    if (!window.gsap) { document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
    gsap.registerPlugin(ScrollTrigger);
    if (!reduced && window.Lenis) {
      const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      EAG.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href') === '#') return;
        const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -84 }); }
      });
    }
    if (reduced) { document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
    EAG.reveal = function (scope) {
      (scope || document).querySelectorAll('.reveal:not(.is-in)').forEach(el => {
        el.classList.add('is-in');
        gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: parseFloat(el.dataset.delay || 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });
    };
    EAG.reveal();
    // Ken Burns on media while in view
    document.querySelectorAll('[data-kenburns]').forEach(el => {
      gsap.fromTo(el, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // headlines slide up line by line
    document.querySelectorAll('.h2 > span').forEach(sp => { if (!sp.querySelector('.ln-i')) sp.innerHTML = `<span class="ln-i">${sp.innerHTML}</span>`; });
    document.querySelectorAll('.h2').forEach(h => {
      if (h.closest('.hero-tagline')) return;
      gsap.from(h.querySelectorAll('.ln-i'), { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: .1, scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
    });
    // image wipes
    EAG.wipe = function (scope) {
      (scope || document).querySelectorAll('.tile, .card-media, .mosaic a, .pillar-img, .member-img, .split-media, .about-split-media, .brand-card-img, .h-slide-img').forEach(el => {
        if (el.dataset.wiped) return; el.dataset.wiped = 1;
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, clearProps: 'clipPath' });
      });
    };
    EAG.wipe();
    // parallax
    document.querySelectorAll('[data-parallax]').forEach(el => gsap.fromTo(el, { yPercent: -8, scale: 1.15 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    // manifesto: words light up as you scroll
    document.querySelectorAll('[data-words]').forEach(el => {
      el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
      gsap.fromTo(el.querySelectorAll('.w'), { opacity: .14 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
    // counters
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.textContent.replace(/\D/g, '')) || 0, o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
    });
    // magnetic buttons (desktop pointers only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.addEventListener('pointermove', e => {
        const b = e.target.closest('.btn, .chat-fab, .tile-arrow'); if (!b) return;
        const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .18, y: (e.clientY - r.top - r.height / 2) * .25, duration: .4, ease: 'power3.out' });
      });
      document.addEventListener('pointerout', e => { const b = e.target.closest('.btn, .chat-fab, .tile-arrow'); if (b && !b.contains(e.relatedTarget)) gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, .4)' }); });
    }
    // pinned horizontal sliders
    document.querySelectorAll('.h-strip').forEach(sec => {
      const track = sec.querySelector('.h-strip-track'); if (!track || !track.children.length) return;
      if (window.matchMedia('(max-width: 767px)').matches) return; // native swipe on phones
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
      track.querySelectorAll('.h-slide-img img').forEach(im => gsap.fromTo(im, { xPercent: -10 }, { xPercent: 10, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), scrub: true } }));
    });
    setTimeout(() => ScrollTrigger.refresh(), 600);

  }
  EAG.initMotion = initMotion;

  // pause videos off-screen, lazy-load sources
  function initVideos() {
    const vids = document.querySelectorAll('video[data-lazy]');
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) {
        if (!v.dataset.loaded) { v.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; }); v.load(); v.dataset.loaded = 1; }
        if (!reduced) v.play().catch(() => {});
      } else v.pause();
    }), { rootMargin: '200px' });
    vids.forEach(v => io.observe(v));
  }

  // horizontal slider content (home: the collection, about: inside the showroom)
  function fillStrips() {
    document.querySelectorAll('.h-strip-track:empty').forEach(t => {
      const picks = EAG.stock.slice().sort((a, b) => b.price - a.price).slice(0, 8);
      t.innerHTML = picks.map((c, i) => `<a class="h-slide" href="${carUrl(c)}"><span class="h-slide-img"><img src="${img(c.images[i % 2 ? 1 : 0], 'full')}" alt="${esc(c.year + ' ' + c.title)}" decoding="async"></span>
        <span class="h-slide-meta"><span class="tiny">${String(i + 1).padStart(2, '0')} / ${String(picks.length).padStart(2, '0')} · ${c.year}</span><b>${esc(c.make)} ${esc(c.model.split(' ').slice(0, 2).join(' '))}</b><span>${R(c.price)} · ${c.kw ? c.kw + ' kW' : ''}</span></span></a>`).join('');
    });
  }
  // cards cycle through their photos on hover
  let cyc = null;
  document.addEventListener('pointerover', e => {
    const m = e.target.closest('.card-media[data-cycle]'); if (!m || m === cyc) return;
    cyc = m; const ids = m.dataset.cycle.split(','), im = m.querySelector('img'), dots = m.querySelectorAll('.card-dots i'); let i = 0;
    ids.forEach(id => { const p = new Image(); p.src = 'https://img.autotrader.co.za/' + id + '/Crop800x600'; });
    clearInterval(m._t); m._t = setInterval(() => { i = (i + 1) % ids.length; im.src = 'https://img.autotrader.co.za/' + ids[i] + '/Crop800x600'; dots.forEach((d, j) => d.classList.toggle('on', j === i)); }, 850);
    const leave = ev => { if (m.contains(ev.relatedTarget)) return; clearInterval(m._t); im.src = 'https://img.autotrader.co.za/' + ids[0] + '/Crop800x600'; dots.forEach((d, j) => d.classList.toggle('on', !j)); cyc = null; m.removeEventListener('pointerout', leave); };
    m.addEventListener('pointerout', leave);
  });


  // ---------- live Cape Town clock (test-drive band) ----------
  function initClocks() {
    const clocks = [...document.querySelectorAll('[data-clock]')]; if (!clocks.length) return;
    const fmtT = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const fmtD = new Intl.DateTimeFormat('en-ZA', { timeZone: 'Africa/Johannesburg', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    clocks.forEach(cl => {
      cl.querySelector('.cc-time').innerHTML = [0, 1, ':', 2, 3, ':', 4, 5].map(k => k === ':' ? '<i class="cc-sep">:</i>'
        : `<span class="cc-d${k > 3 ? ' cc-s' : ''}"><span class="cc-roll">${Array.from({ length: 10 }, (_, n) => `<b>${n}</b>`).join('')}</span></span>`).join('');
    });
    function tick() {
      const now = new Date(), t = fmtT.format(now).replace(/\D/g, '').padStart(6, '0'), d = fmtD.format(now);
      clocks.forEach(cl => {
        cl.querySelectorAll('.cc-roll').forEach((r, k) => { r.style.transform = `translateY(${-t[k] * 10}%)`; });
        cl.querySelector('.cc-date').textContent = d;
        const sr = cl.querySelector('.cc-sr'); if (now.getSeconds() === 0 || !sr.textContent) sr.textContent = `Cape Town time ${t.slice(0, 2)}:${t.slice(2, 4)}, ${d}`;
      });
      if (now.getSeconds() === 0) EAG.fillHours();
    }
    tick(); setTimeout(() => { tick(); setInterval(tick, 1000); }, 1000 - (Date.now() % 1000));
  }
  document.addEventListener('DOMContentLoaded', () => { initVideos(); fillStrips(); EAG.fillHours(); initClocks(); syncLists(); });
  window.addEventListener('load', syncLists);
  window.addEventListener('load', () => { if (!document.body.dataset.manualMotion) initMotion(); });

  // ---------- forms: no backend in the demo, so hand off to email/WhatsApp ----------
  EAG.handleForm = function (form, kind) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const lines = [];
      data.forEach((v, k) => { if (v && typeof v === 'string' && k !== 'consent') lines.push(k.replace(/_/g, ' ') + ': ' + v); });
      const subject = 'Website ' + kind + ' — ' + (data.get('name') || '');
      track(kind.toLowerCase().replace(/\s+/g, '_') + '_submit', { page });
      const body = lines.join('\n');
      const ok = document.createElement('div');
      ok.className = 'form-ok';
      ok.innerHTML = `<b class="h3" style="font-size:26px">Thank you${data.get('name') ? ', ' + esc(String(data.get('name')).split(' ')[0]) : ''}.</b>
        <p class="form-note" style="margin-top:8px">Your ${esc(kind.toLowerCase())} is ready to send. Choose how you'd like to send it and our team will come back to you within business hours.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
          <a class="btn btn--solid" href="mailto:${EAG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Send by email</a>
          <a class="btn" href="${waLink(subject + '\n' + body)}" data-track="whatsapp">${EAG.whatsapp ? 'Send on WhatsApp' : 'Call us instead'}</a>
        </div>`;
      form.querySelectorAll('.form-ok').forEach(n => n.remove());
      form.appendChild(ok);
      ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

})();
