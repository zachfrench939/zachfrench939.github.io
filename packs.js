(() => {
const $ = s => document.querySelector(s);
const CARDS = window.CARDS || [];
const TIERS = window.TIERS || {};
const ORDER = window.TIER_ORDER || [];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num = n => String(n).padStart(2, '0');
const watchUrl = c => c.kind === 'video' ? `https://www.youtube.com/watch?v=${c.id}` : `https://www.youtube.com/shorts/${c.id}`;

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

const PACK_KEY = 'st365_pack_v1';
const COL_KEY = 'st365_collection_v1';
const today = new Date().toISOString().slice(0, 10);
const pk = $('#pk'), pack = $('#pkPack'), res = $('#pkResult'), hint = $('#pkHint'), foil = $('#pkFoil'), tear = $('#pkTear');
const packState = () => { try { return JSON.parse(localStorage.getItem(PACK_KEY) || '{}'); } catch { return {}; } };
const owned = () => { try { return JSON.parse(localStorage.getItem(COL_KEY) || '[]'); } catch { return []; } };

function showLast() {
  const s = packState(), d = CARDS.find(c => c.id === s.last);
  const el = $('#lastPull');
  if (!el) return;
  const free = s.day === today ? 'Next free pack tomorrow · or rip another below' : 'Your free pack is ready';
  el.innerHTML = d ? `Today's pull: <b>${esc(d.name)}, ${esc(d.country)}</b><br>${free}` : 'Your first pack is free · swipe the foil to rip it';
}

function renderCollection() {
  const have = new Set(owned());
  const count = $('#colCount');
  if (count) count.textContent = `${have.size}/25`;
  const grid = $('#colGrid');
  if (!grid) return;
  grid.innerHTML = CARDS.map(c => have.has(c.id)
    ? `<a class="tcard mini tier-${c.tier}" href="${watchUrl(c)}" target="_blank" rel="noopener" style="--hx:0px;--hy:0px">
        <span class="tcard-photo" style="background-image:url(${c.img})"></span>
        <span class="holo"></span>
        <span class="tcard-mini"><b>${esc(c.name)}</b><small>${esc(TIERS[c.tier].name)}</small><small>No. ${num(c.no)}/25</small></span>
      </a>`
    : `<div class="tcard mini missing" aria-label="Uncollected card ${num(c.no)}"><span class="q">?</span><small>No. ${num(c.no)}</small></div>`
  ).join('');
}

function cardFace(c) {
  const tier = TIERS[c.tier];
  const ultra = tier.ultra ? ' · Ultra rare' : '';
  return `<article class="tcard tier-${c.tier}" style="--rx:0deg;--ry:0deg;--hx:0px;--hy:0px">
    <div class="tcard-inner">
      <div class="tcard-back"><span>Solo Travel 365</span><b>Series 01</b><em>25 cards</em></div>
      <div class="tcard-front">
        <div class="tcard-photo" style="background-image:url(${c.img})"></div>
        <div class="holo"></div>
        <div class="tcard-body">
          <div class="tcard-top"><span>No. ${num(c.no)}/25</span><span>Series 01</span></div>
          <h3>${esc(c.name)}</h3>
          <p class="tcard-country">${esc(c.country)}</p>
          <p class="tcard-why">${esc(c.why)}</p>
          <p class="tcard-budget"><span>Rough daily budget</span><b>${esc(c.budget)}</b></p>
          <p class="tcard-tier">${esc(tier.name)}${ultra}</p>
          <a class="btn" href="${watchUrl(c)}" target="_blank" rel="noopener">Watch the video</a>
        </div>
      </div>
    </div>
  </article>`;
}

let busy = false, ripping = false, pts = [];
function reset() {
  busy = false; ripping = false; pts = [];
  if (!pack) return;
  pack.className = 'pack big';
  pack.style.display = '';
  if (hint) { hint.style.display = ''; hint.textContent = 'Swipe across to rip'; }
  if (foil) foil.style.clipPath = '';
  if (tear) tear.innerHTML = '';
  if (res) { res.className = 'pk-result'; res.innerHTML = ''; }
  const spark = document.querySelector('.sparkburst');
  if (spark) spark.remove();
}
function open() { reset(); pk.classList.add('open'); pk.setAttribute('aria-hidden', 'false'); }
function close() { pk.classList.remove('open'); pk.setAttribute('aria-hidden', 'true'); showLast(); }

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

function drawTear() {
  if (!tear || !pack) return;
  const r = pack.getBoundingClientRect();
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(p.x / r.width * 100).toFixed(2)} ${(p.y / r.height * 100).toFixed(2)}`).join(' ');
  tear.innerHTML = `<path d="${d}" fill="none" stroke="rgba(27,42,74,.55)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fffaf0" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (!foil || pts.length < 2) return;
  const fh = r.height * 0.36;
  const last = pts[pts.length - 1];
  const x = Math.max(0, Math.min(100, last.x / r.width * 100));
  const y = Math.max(0, Math.min(100, last.y / fh * 100));
  const dir = last.x >= pts[0].x ? 1 : -1;
  foil.style.clipPath = dir > 0
    ? `polygon(${x}% ${y}%, 100% 0, 100% 100%, ${x}% 100%)`
    : `polygon(0 0, ${x}% ${y}%, ${x}% 100%, 0 100%)`;
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

function reveal(c) {
  const have = new Set(owned());
  const isNew = !have.has(c.id);
  have.add(c.id);
  localStorage.setItem(COL_KEY, JSON.stringify([...have]));
  localStorage.setItem(PACK_KEY, JSON.stringify({ day: today, last: c.id }));
  renderCollection();
  res.innerHTML = cardFace(c) + `<p class="pull-note">${isNew ? 'New card · added to your collection' : 'Already in your collection'}</p><button type="button" class="btn btn-ghost" id="again">Open another</button>`;
  res.classList.add('on');
  if (c.tier === 'passport') { res.classList.add('ultra'); sparks(); }
  requestAnimationFrame(() => requestAnimationFrame(() => res.querySelector('.tcard').classList.add('show')));
  $('#again').onclick = reset;
  busy = false;
}

function burst() {
  if (busy) return;
  busy = true; ripping = false;
  hint.textContent = 'Ripped';
  navigator.vibrate && navigator.vibrate([20, 30, 40]);
  pack.classList.add('burst');
  const f = document.createElement('div'); f.className = 'pk-flash'; $('#pkStage').appendChild(f); setTimeout(() => f.remove(), 700);
  const card = rollCard();
  setTimeout(() => {
    pack.style.display = 'none';
    hint.style.display = 'none';
    reveal(card);
  }, 460);
}

if (pack) {
  pack.addEventListener('pointerdown', e => {
    if (busy || !pk.classList.contains('open')) return;
    const r = pack.getBoundingClientRect();
    const y = e.clientY - r.top;
    if (y > r.height * 0.42) return;
    ripping = true; pts = [{ x: e.clientX - r.left, y }];
    try { pack.setPointerCapture(e.pointerId); } catch (err) {}
    pack.classList.add('ripping');
    hint.textContent = 'Keep swiping…';
    e.preventDefault();
  });
  pack.addEventListener('pointermove', e => {
    if (!ripping || busy) return;
    const r = pack.getBoundingClientRect();
    pts.push({ x: e.clientX - r.left, y: e.clientY - r.top });
    if (pts.length > 48) pts.shift();
    drawTear();
    const xs = pts.map(p => p.x);
    if ((Math.max(...xs) - Math.min(...xs)) / r.width >= 0.7) burst();
  });
  const cancel = () => {
    if (!ripping || busy) return;
    ripping = false; pts = [];
    pack.classList.remove('ripping');
    if (foil) foil.style.clipPath = '';
    if (tear) tear.innerHTML = '';
    if (hint) hint.textContent = 'Swipe across to rip';
  };
  pack.addEventListener('pointerup', cancel);
  pack.addEventListener('pointercancel', cancel);
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

document.addEventListener('click', e => { if (e.target.closest('[data-open-pack]')) { e.preventDefault(); open(); } });
if ($('#pkClose')) $('#pkClose').onclick = close;
addEventListener('keydown', e => e.key === 'Escape' && pk && pk.classList.contains('open') && close());
showLast();
renderCollection();
function onHome() {
  const h = location.hash.replace(/^#\/?/, '');
  return h === '' || h === 'home' || h === 'top';
}
if (onHome() && !packState().day && !/noPack/.test(location.search)) setTimeout(open, 900);
window.__pack = { open, reveal };
window.__renderCollection = renderCollection;
})();
