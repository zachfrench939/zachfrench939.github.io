(() => {
const $ = s => document.querySelector(s);
const CARDS = window.CARDS || [];
const TIERS = window.TIERS || {};
const ORDER = window.TIER_ORDER || [];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num = n => String(n).padStart(2, '0');
const watchUrl = c => c.kind === 'video' ? `https://www.youtube.com/watch?v=${c.id}` : `https://www.youtube.com/shorts/${c.id}`;
const label = t => `${t.name} – ${t.rank}`;

const DEALS = {
  stay:{site:'Booking.com',what:'Hotels & apartments',href:'https://www.booking.com/',code:null},
  hostel:{site:'Hostelworld',what:'Solo-friendly hostels',href:'https://www.hostelworld.com/',code:null},
  flights:{site:'Skyscanner',what:'Compare cheap flights',href:'https://www.skyscanner.net/',code:null},
  esim:{site:'Airalo',what:'Travel eSIM data',href:'https://www.airalo.com/',code:null}
};
const codeTxt = d => d.code ? `Code: ${d.code}` : 'Code coming soon';
const dealRow = $('#dealRow');
if (dealRow) dealRow.innerHTML = Object.values(DEALS).map(d =>
  `<a class="deal reveal in" href="${d.href}" target="_blank" rel="noopener sponsored" data-affiliate-placeholder><span class="l"><small>Deal link</small><b>${d.site}</b><p>${d.what}</p><span class="code">${codeTxt(d)}</span></span><span class="r">OPEN ↗</span></a>`).join('');

const PACK_KEY = 'st365_pack_v2';
const COL_KEY = 'st365_collection_v1';
const COOLDOWN = 2 * 60 * 60 * 1000;
const pk = $('#pk'), pack = $('#pkPack'), res = $('#pkResult'), hint = $('#pkHint');
const packState = () => { try { return JSON.parse(localStorage.getItem(PACK_KEY) || '{}'); } catch { return {}; } };
const owned = () => { try { return JSON.parse(localStorage.getItem(COL_KEY) || '[]'); } catch { return []; } };
const remain = () => {
  const at = +packState().at || 0;
  return at ? Math.max(0, at + COOLDOWN - Date.now()) : 0;
};
const ready = () => remain() <= 0;
const fmt = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

function paint() {
  const ms = remain();
  const ok = ms <= 0;
  const text = ok ? 'Pack ready' : `Next pack in ${fmt(ms)}`;
  document.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = text; });
  document.querySelectorAll('[data-open-pack]').forEach(btn => {
    btn.disabled = !ok;
    btn.classList.toggle('is-locked', !ok);
    btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
  });
  const s = packState(), d = CARDS.find(c => c.id === s.last), el = $('#lastPull');
  if (el) el.innerHTML = d ? `Last pull: <b>${esc(d.name)}</b>` : 'Pull the tab to open your first pack';
}

function renderCollection() {
  const have = new Set(owned());
  const count = $('#colCount');
  if (count) count.textContent = `${have.size}/25`;
  const grid = $('#colGrid');
  if (!grid) return;
  grid.innerHTML = CARDS.map(c => have.has(c.id)
    ? `<button type="button" class="tcard mini tier-${c.tier}" data-card="${c.id}" style="--hx:0px;--hy:0px">
        <span class="art" style="background-image:url(${c.img})"></span>
        <span class="holo"></span>
        <span class="mini-name"><b>${esc(c.name)}</b><small>S01 · ${num(c.no)}/25</small></span>
      </button>`
    : `<div class="tcard mini missing" aria-label="Uncollected card ${num(c.no)}"><span class="q">?</span><small>S01 · ${num(c.no)}</small></div>`
  ).join('');
}

function cardHTML(c) {
  const tier = TIERS[c.tier];
  const dos = (c.dos || []).map(d => `<li>${esc(d)}</li>`).join('');
  return `<article class="tcard tier-${c.tier}" style="--rx:0deg;--ry:0deg;--hx:0px;--hy:0px">
    <div class="tcard-inner">
      <div class="tcard-back">
        <p class="back-k">Country</p><p>${esc(c.country)}</p>
        <p class="back-k">Best time to go</p><p>${esc(c.when || '')}</p>
        <p class="back-k">Rough daily budget</p><p>${esc(c.budget)}</p>
        <p class="back-k">Do this</p><ul>${dos}</ul>
        <a class="btn" href="${watchUrl(c)}" target="_blank" rel="noopener">Watch the video</a>
      </div>
      <div class="tcard-face">
        <div class="art" style="background-image:url(${c.img})"></div>
        <div class="holo"></div>
        <div class="banner">
          <div><h3>${esc(c.name)}</h3><p class="rarity">${esc(label(tier))}</p></div>
          <i class="gem" aria-hidden="true"></i>
        </div>
        <p class="flavour">${esc(c.why)}</p>
        <p class="setno">S01 · ${num(c.no)}/25</p>
      </div>
    </div>
  </article>`;
}

function bindCard(card) {
  let sx = 0, moved = 0, swiped = false;
  card.addEventListener('pointerdown', e => { if (e.target.closest('a')) return; sx = e.clientX; moved = 0; });
  card.addEventListener('pointermove', e => { if (sx) moved = Math.max(moved, Math.abs(e.clientX - sx)); });
  card.addEventListener('pointerup', () => {
    if (moved > 48) { card.classList.toggle('show'); swiped = true; }
  });
  card.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    if (swiped) { swiped = false; return; }
    card.classList.toggle('show');
  });
}

function sparks() {
  const layer = document.createElement('div');
  layer.className = 'sparkburst';
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('i');
    s.style.setProperty('--a', (i / 22 * 360) + 'deg');
    s.style.setProperty('--d', (48 + (i % 5) * 14) + 'px');
    layer.appendChild(s);
  }
  $('#pkStage').appendChild(layer);
  setTimeout(() => layer.remove(), 1000);
}

function showCard(c, save) {
  let note = 'Tap or swipe the card to flip it';
  if (save) {
    const have = new Set(owned());
    const isNew = !have.has(c.id);
    have.add(c.id);
    localStorage.setItem(COL_KEY, JSON.stringify([...have]));
    note = `${isNew ? 'New card · in your collection' : 'Already in your collection'}. Tap or swipe to flip`;
    renderCollection();
    paint();
  }
  res.innerHTML = cardHTML(c) + `<p class="pull-note">${note}</p>`;
  res.classList.add('on');
  if (c.tier === 'passport') { res.classList.add('ultra'); sparks(); }
  const card = res.querySelector('.tcard');
  card.classList.add('deal');
  card.addEventListener('animationend', () => card.classList.remove('deal'), { once: true });
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('show')));
  bindCard(card);
}

let busy = false, dragging = false, prog = 0, startX = 0;
function setP(v) {
  prog = Math.max(0, Math.min(1, v));
  if (pack) pack.style.setProperty('--p', prog.toFixed(4));
}
function reset() {
  busy = false; dragging = false;
  if (!pack) return;
  pack.className = 'pack big';
  pack.style.display = '';
  pack.classList.remove('spring');
  setP(0);
  if (hint) { hint.style.display = ''; hint.textContent = 'Drag the tab across'; }
  if (res) { res.className = 'pk-result'; res.innerHTML = ''; }
  const spark = document.querySelector('.sparkburst');
  if (spark) spark.remove();
}
function open() {
  if (!ready()) return;
  reset();
  pk.classList.add('open');
  pk.setAttribute('aria-hidden', 'false');
}
function close() { pk.classList.remove('open'); pk.setAttribute('aria-hidden', 'true'); paint(); }
function view(c) {
  reset();
  busy = true;
  pk.classList.add('open');
  pk.setAttribute('aria-hidden', 'false');
  pack.style.display = 'none';
  if (hint) hint.style.display = 'none';
  showCard(c, false);
}

function rollCard() {
  const roll = Math.random() * 100;
  let acc = 0, tier = 'backpacker';
  for (const key of ORDER) {
    acc += TIERS[key].n;
    if (roll < acc) { tier = key; break; }
  }
  const pool = CARDS.filter(c => c.tier === tier);
  return pool[Math.floor(Math.random() * pool.length)] || CARDS[0];
}

function finish() {
  if (busy) return;
  busy = true; dragging = false;
  pack.classList.add('spring');
  setP(1);
  if (hint) hint.textContent = '';
  const card = rollCard();
  localStorage.setItem(PACK_KEY, JSON.stringify({ at: Date.now(), last: card.id }));
  paint();
  if (eTrusted) { try { navigator.vibrate && navigator.vibrate(18); } catch (err) {} }
  setTimeout(() => {
    pack.style.display = 'none';
    if (hint) hint.style.display = 'none';
    showCard(card, true);
    busy = false;
  }, 520);
}
let eTrusted = false;

if (pack) {
  pack.addEventListener('pointerdown', e => {
    if (busy || !pk.classList.contains('open') || pack.style.display === 'none') return;
    const r = pack.getBoundingClientRect();
    const y = e.clientY - r.top;
    if (!e.target.closest('.pack-tab') && y > r.height * 0.24) return;
    dragging = true;
    eTrusted = e.isTrusted;
    startX = e.clientX;
    pack.classList.remove('spring');
    pack.classList.add('dragging');
    try { pack.setPointerCapture(e.pointerId); } catch (err) {}
    if (hint) hint.textContent = 'Keep pulling…';
    e.preventDefault();
  });
  pack.addEventListener('pointermove', e => {
    if (!dragging || busy) return;
    const r = pack.getBoundingClientRect();
    setP((e.clientX - startX) / r.width);
    if (prog >= 0.85) finish();
  });
  const release = () => {
    if (!dragging || busy) return;
    dragging = false;
    pack.classList.remove('dragging');
    if (prog >= 0.85) { finish(); return; }
    pack.classList.add('spring');
    setP(0);
    if (hint) hint.textContent = 'Drag the tab across';
  };
  pack.addEventListener('pointerup', release);
  pack.addEventListener('pointercancel', release);
}

document.addEventListener('pointermove', e => {
  const card = e.target.closest && e.target.closest('.tcard:not(.missing)');
  document.querySelectorAll('.tcard.hot').forEach(x => {
    if (x !== card) { x.classList.remove('hot'); x.style.removeProperty('--rx'); x.style.removeProperty('--ry'); x.style.removeProperty('--hx'); x.style.removeProperty('--hy'); }
  });
  if (!card) return;
  const r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  card.classList.add('hot');
  card.style.setProperty('--ry', (x * 14) + 'deg');
  card.style.setProperty('--rx', (-y * 12) + 'deg');
  card.style.setProperty('--hx', (x * 46) + 'px');
  card.style.setProperty('--hy', (y * 36) + 'px');
});

document.addEventListener('click', e => {
  const cardBtn = e.target.closest('[data-card]');
  if (cardBtn) {
    const c = CARDS.find(x => x.id === cardBtn.dataset.card);
    if (c) view(c);
    return;
  }
  if (e.target.closest('[data-open-pack]')) { e.preventDefault(); open(); }
});
if ($('#pkClose')) $('#pkClose').onclick = close;
addEventListener('keydown', e => e.key === 'Escape' && pk && pk.classList.contains('open') && close());
renderCollection();
paint();
setInterval(paint, 250);
function onHome() {
  const h = location.hash.replace(/^#\/?/, '');
  return h === '' || h === 'home' || h === 'top';
}
if (onHome() && ready() && !packState().at && !/noPack/.test(location.search)) setTimeout(open, 900);
window.__pack = { open, view, ready, remain };
})();
