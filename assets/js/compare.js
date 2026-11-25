/* Compare up to 3 cars side by side, with rev dials that race */
(function () {
  'use strict';
  const EAG = window.EAG, stock = EAG.stock, { esc, R, km, img, carUrl } = EAG;
  const q = new URLSearchParams(location.search);
  let ids = (q.get('ids') || '').split(',').filter(id => stock.some(c => c.id === id));
  if (!ids.length) ids = EAG.compare.list();
  ids = ids.slice(0, 3);
  const wrap = document.getElementById('cmp');
  const byId = id => stock.find(c => c.id === id);
  const sorted = stock.slice().sort((a, b) => a.make.localeCompare(b.make) || b.year - a.year);
  const engineOf = c => {
    const cyl = /V12/.test(c.engine) ? 12 : /V10/.test(c.engine) ? 10 : /V8/.test(c.engine) ? 8 : /6/.test(c.engine) ? 6 : /5-Cyl/.test(c.engine) ? 5 : 4;
    return { redline: c.fuel === 'Diesel' ? 4.5 : cyl >= 10 ? 9 : cyl === 8 ? 7.5 : 7, max: c.fuel === 'Diesel' ? 6 : cyl >= 10 ? 10 : 8 };
  };
  const SW = 240, A0 = -120;
  function dial(max, ticks, red, label, unit, val, cls) {
    const r = 80, cx = 100, cy = 100, pt = (d, rr) => { const a = (d - 90) * Math.PI / 180; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
    const arc = (f, t, rr) => { const [x1, y1] = pt(f, rr), [x2, y2] = pt(t, rr); return `M${x1} ${y1} A${rr} ${rr} 0 ${t - f > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
    let tk = '';
    for (let i = 0; i <= ticks; i++) { const d = A0 + SW * i / ticks, [x1, y1] = pt(d, r), [x2, y2] = pt(d, r - 10), [tx, ty] = pt(d, r - 22), hot = red != null && i >= red / max * ticks;
      tk += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="tk${hot ? ' hot' : ''}"/><text x="${tx}" y="${ty + 4}" class="tn${hot ? ' hot' : ''}">${Math.round(max * i / ticks)}</text>`; }
    return `<figure class="gauge cg ${cls}"><svg viewBox="0 0 200 200" role="img" aria-label="${label}"><circle cx="100" cy="100" r="96" class="g-ring"/><path d="${arc(A0, A0 + SW, r + 4)}" class="g-arc"/>
      ${red != null ? `<path d="${arc(A0 + SW * red / max, A0 + SW, r + 4)}" class="red-arc"/>` : ''}${tk}
      <g class="needle cg-needle" style="transform-origin:100px 100px"><line x1="100" y1="110" x2="100" y2="30"/><circle cx="100" cy="100" r="6"/></g>
      <text x="100" y="140" class="g-val cg-val">${val}</text><text x="100" y="156" class="g-unit">${unit}</text></svg><figcaption>${label}</figcaption></figure>`;
  }
  const ROWS = [
    ['Price', c => R(c.price), c => -c.price], ['Year', c => c.year, c => c.year], ['Mileage', c => km(c.mileage), c => -(c.mileage || 0)],
    ['Power', c => c.kw ? c.kw + ' kW' : '—', c => c.kw || 0], ['Engine', c => esc(c.engine || '—'), null], ['Gearbox', c => esc(c.transmission), null],
    ['Fuel', c => esc(c.fuel), null], ['Body', c => esc(c.body), null], ['Make', c => esc(c.brandGroup), null]
  ];

  function render() {
    const cars = ids.map(byId).filter(Boolean);
    const slots = [0, 1, 2].map(i => cars[i] || null);
    const best = {};
    ROWS.forEach(([l, , score]) => { if (!score || cars.length < 2) return; const vals = cars.map(score); const m = Math.max(...vals); if (vals.filter(v => v === m).length < cars.length) best[l] = cars[vals.indexOf(m)].id; });
    const opts = sel => '<option value="">Choose a car</option>' + sorted.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.year + ' ' + c.title)} · ${R(c.price)}</option>`).join('');
    const top = (c, i) => `<div class="cmp-cell cmp-top${c ? '' : ' is-empty'}" data-i="${i}">
        <label class="cmp-pick"><span class="sr-only">Car ${i + 1}</span><select data-slot="${i}">${opts(c && c.id)}</select></label>
        ${c ? `<a class="cmp-img" href="${carUrl(c)}"><img src="${img(c.images[0], 'Crop800x600')}" alt="${esc(c.year + ' ' + c.title)}"><span class="cmp-place" aria-live="polite"></span></a>
          <b class="cmp-name">${c.year} ${esc(EAG.splitTitle(c).name)}</b><span class="cmp-price">${R(c.price)}</span>
          <div class="cmp-dials">${dial(engineOf(c).max, engineOf(c).max, engineOf(c).redline, 'Rev', 'x1000 rpm', '0.0', 'cg-rpm')}${dial(800, 8, null, 'Power', 'kW', c.kw || '—', 'cg-kw')}</div>`
          : `<div class="cmp-add"><span>+</span><p>Add a car to compare</p></div>`}
      </div>`;
    wrap.innerHTML = `<div class="cmp-grid" style="--n:${slots.length}">
        <div class="cmp-cell cmp-top cmp-corner"><span class="eyebrow">Side by side</span><button type="button" class="btn btn--solid cmp-race" id="race" ${cars.length < 2 ? 'disabled' : ''}>Race them</button></div>
        ${slots.map(top).join('')}
        ${ROWS.map(([l, f]) => `<div class="cmp-cell cmp-row-l">${l}</div>` + slots.map((c, i) => `<div class="cmp-cell cmp-row${c && best[l] === c.id ? ' is-best' : ''}" data-col="${i}">${c ? f(c) : '—'}</div>`).join('')).join('')}
        <div class="cmp-cell cmp-cta-l"></div>
        ${slots.map((c, i) => `<div class="cmp-cell cmp-cta" data-col="${i}">${c ? `<a class="btn btn--solid" href="${carUrl(c)}">View car</a><a class="btn" href="contact.html?type=viewing&car=${c.id}">Book viewing</a><button type="button" class="cmp-rm" data-rm="${i}">Remove</button>` : ''}</div>`).join('')}
      </div>`;
    wrap.querySelectorAll('select[data-slot]').forEach(s => s.addEventListener('change', () => { const i = +s.dataset.slot; const next = ids.slice(); next[i] = s.value; ids = next.filter(Boolean).filter((v, k, a) => a.indexOf(v) === k).slice(0, 3); save(); render(); }));
    wrap.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { ids.splice(+b.dataset.rm, 1); save(); render(); }));
    const rb = document.getElementById('race'); if (rb) rb.addEventListener('click', race);
    wrap.querySelectorAll('.cmp-top[data-i]').forEach(col => {
      const c = cars[+col.dataset.i]; if (!c) return;
      setNeedle(col.querySelector('.cg-kw .cg-needle'), Math.min(1, (c.kw || 0) / 800));
      setNeedle(col.querySelector('.cg-rpm .cg-needle'), 0);
    });
  }
  function setNeedle(n, f) { if (n) n.style.transform = `rotate(${A0 + SW * Math.max(0, Math.min(1, f))}deg)`; }
  function save() { EAG.compare.set(ids.slice(0, 3)); history.replaceState(null, '', location.pathname + (ids.length ? '?ids=' + ids.join(',') : '')); }

  let racing = false;
  function race() {
    if (racing) return; racing = true;
    const cars = ids.map(byId).filter(Boolean);
    const cols = cars.map((c, i) => wrap.querySelector(`.cmp-top[data-i="${i}"]`));
    const colCells = i => wrap.querySelectorAll(`[data-col="${i}"]`);
    const maxKw = Math.max(...cars.map(c => c.kw || 1));
    const btn = document.getElementById('race'); btn.disabled = true;
    cols.forEach((col, i) => { col.classList.remove('is-winner'); colCells(i).forEach(x => x.classList.remove('is-winner')); col.querySelector('.cmp-place').textContent = ''; });
    let n = 3; btn.textContent = n;
    const cd = setInterval(() => {
      n--; if (n > 0) { btn.textContent = n; return; }
      clearInterval(cd); btn.textContent = 'Go!';
      const t0 = performance.now(), finish = [];
      // more power = quicker to the redline (a fun, relative race, not a timed claim)
      const durs = cars.map(c => 1400 + 2600 * (1 - (c.kw || 1) / maxKw) + 400);
      (function step(now) {
        let done = 0;
        cars.forEach((c, i) => {
          const e = engineOf(c), p = Math.min(1, (now - t0) / durs[i]), ease = 1 - Math.pow(1 - p, 3);
          const rpm = e.redline * ease; setNeedle(cols[i].querySelector('.cg-rpm .cg-needle'), rpm / e.max);
          cols[i].querySelector('.cg-val').textContent = rpm.toFixed(1);
          cols[i].classList.toggle('is-red', p > .92);
          if (p >= 1) { done++; if (!finish.includes(i)) { finish.push(i); const pl = finish.length; cols[i].querySelector('.cmp-place').textContent = pl === 1 ? '1st' : pl === 2 ? '2nd' : '3rd'; if (pl === 1) { cols[i].classList.add('is-winner'); colCells(i).forEach(x => x.classList.add('is-winner')); } } }
        });
        if (done < cars.length) return requestAnimationFrame(step);
        setTimeout(() => { cols.forEach((col, i) => { col.classList.remove('is-red'); setNeedle(col.querySelector('.cg-rpm .cg-needle'), .1); col.querySelector('.cg-val').textContent = '0.9'; }); btn.disabled = false; btn.textContent = 'Race again'; racing = false; }, 1600);
      })(t0);
      EAG.track('compare_race', { ids: ids.join(',') });
    }, 650);
  }
  render();
})();
