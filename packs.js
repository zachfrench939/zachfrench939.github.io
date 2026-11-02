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

let vaultFilter = 'all';
function renderCollection() {
  const have = new Set(owned());
  const count = $('#colCount');
  if (count) count.textContent = `${have.size}/25`;
  const fill = $('#vaultFill');
  if (fill) fill.style.width = (have.size / 25 * 100) + '%';
  const grid = $('#colGrid');
  if (!grid) return;
  const list = CARDS.filter(c => vaultFilter === 'all' || c.tier === vaultFilter);
  grid.innerHTML = list.map(c => have.has(c.id)
    ? `<button type="button" class="tcard mini tier-${c.tier}" data-card="${c.id}" style="--hx:0px;--hy:0px">
        <span class="art" style="background-image:url(${c.img})"></span>
        <span class="holo"></span>
        <span class="mini-name"><b>${esc(c.name)}</b><small>${esc(TIERS[c.tier].rank)}</small><small>S01 · ${num(c.no)}/25</small></span>
      </button>`
    : `<div class="tcard mini locked" aria-label="Locked card ${num(c.no)}"><span class="lock" aria-hidden="true">🔒</span><small>S01 · ${num(c.no)}</small></div>`
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

const foil = pack && pack.querySelector('.pack-foil');
const tear = pack && pack.querySelector('.pack-tear');
const tab = pack && pack.querySelector('.pack-tab');
const glow = pack && pack.querySelector('.pack-glow');
const TAB_W = 72;
let busy = false, dragging = false, prog = 0, originX = 0, travel = 1, packW = 230, anim = 0, eTrusted = false;
function stopAnim() { if (anim) cancelAnimationFrame(anim); anim = 0; }
function paintProgress(p) {
  prog = p < 0 ? 0 : p > 1 ? 1 : p;
  const visual = p < -0.03 ? -0.03 : p > 1 ? 1 : p;
  const x = travel * visual;
  if (tab) tab.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
  if (foil) foil.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
  if (tear) tear.style.clipPath = `inset(0 ${(Math.max(0, packW - Math.max(0, x))).toFixed(2)}px 0 0)`;
  if (glow) glow.style.opacity = String(Math.max(0, Math.min(1, visual)));
}
function measure() {
  packW = pack.clientWidth || 230;
  travel = Math.max(48, packW - TAB_W);
}
function glide(to, ms, done) {
  stopAnim();
  const from = prog, t0 = performance.now();
  const step = now => {
    const t = Math.min(1, (now - t0) / ms);
    const e = 1 - Math.pow(1 - t, 3);
    paintProgress(from + (to - from) * e);
    if (t < 1) anim = requestAnimationFrame(step);
    else { anim = 0; done && done(); }
  };
  anim = requestAnimationFrame(step);
}
function springBack(done) {
  stopAnim();
  let x = prog, v = 0, last = performance.now();
  const step = now => {
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    v += ((0 - x) * 240 - v * 22) * dt;
    x += v * dt;
    paintProgress(x);
    if (Math.abs(x) < 0.004 && Math.abs(v) < 0.05) { paintProgress(0); anim = 0; done && done(); return; }
    anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}
function lockPage(on) { document.documentElement.classList.toggle('pull-lock', on); }
function reset() {
  busy = false; dragging = false; eTrusted = false;
  stopAnim();
  lockPage(false);
  if (!pack) return;
  pack.className = 'pack big';
  pack.style.visibility = '';
  pack.style.display = '';
  measure();
  paintProgress(0);
  if (hint) { hint.style.visibility = ''; hint.style.display = ''; hint.textContent = 'Drag the tab across'; }
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
  pack.style.visibility = 'hidden';
  if (hint) hint.style.visibility = 'hidden';
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
  lockPage(false);
  pack.classList.remove('dragging');
  if (hint) hint.textContent = '';
  const card = rollCard();
  localStorage.setItem(PACK_KEY, JSON.stringify({ at: Date.now(), last: card.id }));
  paint();
  if (eTrusted) { try { navigator.vibrate && navigator.vibrate(18); } catch (err) {} }
  glide(1, 180, () => {
    pack.classList.add('pack-gone');
    setTimeout(() => {
      pack.style.visibility = 'hidden';
      if (hint) hint.style.visibility = 'hidden';
      showCard(card, true);
      busy = false;
    }, 260);
  });
}

function beginPull(clientX, trusted, pointerId) {
  if (busy || anim || !pk.classList.contains('open') || pack.style.visibility === 'hidden') return false;
  dragging = true;
  eTrusted = !!trusted;
  measure();
  originX = clientX - prog * travel;
  pack.classList.add('dragging');
  lockPage(true);
  if (pointerId != null) { try { pack.setPointerCapture(pointerId); } catch (err) {} }
  if (hint) hint.textContent = 'Keep pulling…';
  return true;
}
function movePull(clientX) {
  if (!dragging || busy) return;
  paintProgress((clientX - originX) / travel);
  if (prog >= 0.85) finish();
}
function endPull() {
  if (!dragging || busy) return;
  dragging = false;
  pack.classList.remove('dragging');
  lockPage(false);
  if (prog >= 0.85) { finish(); return; }
  springBack(() => { if (hint && !busy) hint.textContent = 'Drag the tab across'; });
}
if (pack) {
  const onTab = e => !!(e.target.closest && e.target.closest('.pack-tab'));
  pack.addEventListener('pointerdown', e => {
    if (!onTab(e)) return;
    if (!beginPull(e.clientX, e.isTrusted, e.pointerId)) return;
    e.preventDefault();
  });
  pack.addEventListener('pointermove', e => { if (dragging) { movePull(e.clientX); e.preventDefault(); } });
  pack.addEventListener('pointerup', endPull);
  pack.addEventListener('pointercancel', endPull);
  pack.addEventListener('touchmove', e => { if (dragging) e.preventDefault(); }, { passive: false });
  pk.addEventListener('touchmove', e => { if (dragging) e.preventDefault(); }, { passive: false });
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
const filters = $('#vaultFilters');
if (filters) filters.addEventListener('click', e => {
  const b = e.target.closest('[data-filter]');
  if (!b) return;
  vaultFilter = b.dataset.filter;
  filters.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  renderCollection();
});
renderCollection();
paint();
setInterval(paint, 250);
window.__packProgress = () => prog;
function onHome() {
  const h = location.hash.replace(/^#\/?/, '');
  return h === '' || h === 'home' || h === 'top';
}
if (onHome() && ready() && !packState().at && !/noPack/.test(location.search)) setTimeout(open, 900);
window.__pack = { open, view, ready, remain };
})();
