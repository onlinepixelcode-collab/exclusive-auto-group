/* My Garage: saved cars, shareable shortlist link */
(function () {
  'use strict';
  const EAG = window.EAG, stock = EAG.stock, { esc, R } = EAG;
  const q = new URLSearchParams(location.search);
  const shared = (q.get('cars') || '').split(',').filter(id => stock.some(c => c.id === id));
  const grid = document.getElementById('garage-grid'), bar = document.getElementById('garage-bar'), note = document.getElementById('garage-note');
  const base = location.href.split('?')[0];

  function render() {
    const mine = EAG.garage.list();
    const ids = shared.length ? shared : mine;
    const cars = ids.map(id => stock.find(c => c.id === id)).filter(Boolean);
    document.getElementById('garage-count').textContent = cars.length;
    if (shared.length) {
      note.hidden = false;
      const allSaved = shared.every(id => mine.includes(id));
      note.innerHTML = `<span class="eyebrow">Shared shortlist</span><p>Someone shared ${cars.length} car${cars.length > 1 ? 's' : ''} from Exclusive Auto Group with you.</p>
        <div class="gn-actions"><button type="button" class="btn btn--solid" id="save-all" ${allSaved ? 'disabled' : ''}>${allSaved ? 'All saved' : 'Save all to my garage'}</button><a class="btn" href="garage.html">Open my own garage</a></div>`;
      const sa = document.getElementById('save-all'); if (sa && !allSaved) sa.onclick = () => { EAG.garage.set([...new Set(mine.concat(shared))]); EAG.toast('Saved to My Garage'); render(); };
    }
    if (!cars.length) {
      grid.innerHTML = `<div class="garage-empty"><span class="ge-icon">${EAG.icons.heart}</span><p class="h3">Your garage is empty</p>
        <p class="lede">Tap the heart on any car to save it here. Build a shortlist, compare favourites and share it with one tap.</p><a class="btn btn--solid" href="inventory.html">Browse inventory</a></div>`;
      bar.hidden = true; return;
    }
    grid.innerHTML = cars.map(c => EAG.cardHTML(c)).join('');
    bar.hidden = false;
    const total = cars.reduce((a, c) => a + c.price, 0);
    const link = base + '?cars=' + ids.join(',');
    const msg = `My shortlist from Exclusive Auto Group (${cars.length} car${cars.length > 1 ? 's' : ''}):\n` + cars.map(c => `• ${c.year} ${c.title} – ${R(c.price)}`).join('\n') + `\n\n${link}`;
    bar.innerHTML = `<div class="gb-info"><b>${cars.length} car${cars.length > 1 ? 's' : ''}</b><span>Combined ${R(total)}</span></div>
      <div class="gb-actions">
        <a class="btn btn--solid" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" data-track="garage_share_whatsapp">${EAG.icons.wa} Share on WhatsApp</a>
        <button type="button" class="btn" id="copy-link">Copy link</button>
        <a class="btn" href="compare.html?ids=${ids.slice(0, 3).join(',')}" ${cars.length < 2 ? 'aria-disabled="true"' : ''} id="cmp-these">${EAG.icons.compare} Compare${cars.length > 3 ? ' first 3' : ''}</a>
        <a class="btn" href="contact.html?type=enquiry&cars=${ids.join(',')}" data-track="garage_enquire">Enquire about these</a>
        ${!shared.length ? '<button type="button" class="gb-clear" id="clear-garage">Clear garage</button>' : ''}
      </div>`;
    document.getElementById('copy-link').onclick = async () => {
      try { await navigator.clipboard.writeText(link); EAG.toast('Link copied'); } catch (e) { prompt('Copy this link', link); }
      EAG.track('garage_copy_link');
    };
    const cc = document.getElementById('cmp-these'); cc.onclick = e => { if (cars.length < 2) { e.preventDefault(); EAG.toast('Save at least two cars to compare'); } };
    const cl = document.getElementById('clear-garage'); if (cl) cl.onclick = () => { if (confirm('Remove all cars from your garage?')) EAG.garage.clear(); };
    EAG.syncLists();
    if (window.gsap && !EAG.reduced) gsap.fromTo(grid.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power3.out' });
  }
  document.addEventListener('eag:lists', () => { if (!shared.length) render(); else render(); });
  render();
})();
