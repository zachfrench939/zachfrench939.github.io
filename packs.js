(() => {
const $ = s => document.querySelector(s);
const SERIES = window.SERIES || [];
const ODDS = window.PULL_ODDS || { scale: 10000, tiers: [] };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PACK_KEY = 'st365_pack_v2';
const COL_KEY = 'st365_collection_v2';
const QUEUE_KEY = 'st365_pack_queue';
const UNLIM_KEY = 'st365_unlimited';
const SERIES_KEY = 'st365_series';
const MUTE_KEY = 'st365_mute';
const COOLDOWN = 60 * 60 * 1000;

const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k) || ''); } catch { return fallback; } };
const packState = () => read(PACK_KEY, {}) || {};
function collection() {
  const cur = read(COL_KEY, null);
  if (cur && typeof cur === 'object') return cur;
  const col = {};
  const old = read('st365_collection_v1', []);
  const s1 = SERIES.find(s => s.id === 's1');
  if (s1 && Array.isArray(old)) {
    col.s1 = s1.cards.filter(c => c.videoId && old.includes(c.videoId)).map(c => c.cid);
    localStorage.setItem(COL_KEY, JSON.stringify(col));
  }
  return col;
}
const saveCol = col => localStorage.setItem(COL_KEY, JSON.stringify(col));
const queue = () => { const q = read(QUEUE_KEY, []); return Array.isArray(q) ? q : []; };
const saveQueue = q => localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
const unlimited = () => localStorage.getItem(UNLIM_KEY) === '1';
let seriesId = localStorage.getItem(SERIES_KEY) || (SERIES[0] && SERIES[0].id) || 's1';
const series = () => SERIES.find(s => s.id === seriesId) || SERIES[0];
const liveCards = s => ((s || series()).cards || []).filter(c => !c.preview);
const ownedSet = s => new Set((collection()[s.id] || []));

let vaultFilter = 'all';
let vaultSort = 'number';

const tierMeta = id => ODDS.tiers.find(t => t.id === id) || { id, name: id, weight: 0 };
const tierRank = id => { const i = ODDS.tiers.findIndex(t => t.id === id); return i < 0 ? 0 : i; };

function boostedTiers(boost) {
  return ODDS.tiers.map(t => ({ ...t, weight: t.weight * (boost && boost[t.id] ? Number(boost[t.id]) : 1) }));
}
function rollCard(cards, boost) {
  const tiers = boostedTiers(boost);
  const total = tiers.reduce((sum, t) => sum + t.weight, 0) || 1;
  let r = Math.random() * total;
  let rarity = tiers[0] ? tiers[0].id : 'common';
  for (const t of tiers) { r -= t.weight; if (r < 0) { rarity = t.id; break; } }
  const pool = cards.filter(c => c.rarity === rarity);
  const from = pool.length ? pool : cards;
  return from[Math.floor(Math.random() * from.length)];
}
function nextSpec() {
  const q = queue();
  if (q.length) return { ...q[0], fromQueue: true };
  return { boost: null, packType: 'standard', fromQueue: false, label: 'Destination pack' };
}
const remain = () => {
  if (unlimited() || queue().length) return 0;
  const at = +packState().at || 0;
  return at ? Math.max(0, at + COOLDOWN - Date.now()) : 0;
};
const ready = () => { const s = series(); return !!(s && s.status === 'live' && liveCards(s).length && remain() <= 0); };
const fmt = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
function countdownText() {
  const s = series();
  if (!s || s.status !== 'live') return 'This series is coming soon';
  if (unlimited()) return queue().length ? `Unlimited · ${queue().length} special pack${queue().length === 1 ? '' : 's'} waiting` : 'Unlimited · pack ready';
  if (queue().length) return `Special pack ready · ${queue().length} waiting`;
  const ms = remain();
  return ms <= 0 ? 'Pack ready' : `Next pack in ${fmt(ms)}`;
}
function paint() {
  const ok = ready();
  const text = countdownText();
  document.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = text; });
  document.querySelectorAll('[data-open-pack]').forEach(btn => {
    btn.disabled = !ok;
    btn.classList.toggle('is-locked', !ok);
    btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
  });
  const spec = nextSpec();
  document.querySelectorAll('.pack.big, .pack.mini').forEach(el => {
    el.classList.toggle('pack-boosted', spec.packType === 'boosted');
    el.classList.toggle('pack-foil', spec.packType === 'foil');
  });
  const s = series();
  const total = s ? (liveCards(s).length || s.size || 0) : 0;
  document.querySelectorAll('.pack-series').forEach(el => {
    el.textContent = s ? `${s.name} · ${total || s.size || 0} cards` : 'Destination pack';
  });
  const note = $('#queueNote');
  if (note) {
    if (spec.fromQueue && spec.boost) {
      const bits = Object.entries(spec.boost).map(([k, v]) => `${tierMeta(k).name} ×${v}`);
      note.textContent = `Next pack: ${spec.label || 'Bonus'} (${bits.join(', ')})`;
    } else if (spec.fromQueue) note.textContent = `Next pack skips the hour cooldown${spec.label ? ` · ${spec.label}` : ''}.`;
    else if (unlimited()) note.textContent = 'Cooldown is off on this browser.';
    else note.textContent = '';
  }
  const last = $('#lastPull');
  const id = packState().last;
  if (last && s) {
    const card = (s.cards || []).find(c => c.cid === id || c.videoId === id);
    last.innerHTML = card ? `Last pull: <b>${esc(card.name)}</b>` : 'Unzip a pack to start your set';
  }
}

function pct(weight, total) {
  const n = Math.round((weight / total) * 10000) / 100;
  return (Number.isInteger(n) ? n.toFixed(0) : String(n)) + '%';
}
function oneIn(weight, total, count) {
  if (!weight || !count) return '—';
  const n = Math.max(1, Math.round(1 / ((weight / total) / count)));
  return '1 in ' + n.toLocaleString('en-GB');
}
function renderRates() {
  const box = $('#pullRates');
  const s = series();
  if (!box || !s) return;
  const spec = nextSpec();
  const tiers = boostedTiers(spec.fromQueue ? spec.boost : null);
  const totalW = tiers.reduce((sum, t) => sum + t.weight, 0) || 1;
  const cards = liveCards(s);
  const rows = tiers.map(t => {
    const count = cards.filter(c => c.rarity === t.id).length || (s.status === 'live' ? 0 : '—');
    const klass = s.classes && s.classes[t.id] ? ` · ${s.classes[t.id]}` : '';
    const each = typeof count === 'number' && count ? oneIn(t.weight, totalW, count) : '—';
    return `<li class="tier-${t.id}"><i class="swatch"></i><span><b>${esc(t.name)}${esc(klass)}</b><small>${typeof count === 'number' ? count + ' in the set' : 'Set size ' + (s.size || 40)} · each about ${each}</small></span><b class="odds">${pct(t.weight, totalW)}</b></li>`;
  }).join('');
  const extra = spec.fromQueue && spec.boost ? '<p class="fine">The percentages above include the odds boost on your next special pack. Base rates return after it.</p>' : '';
  box.innerHTML = `<h3>Pull rates</h3><p class="fine">Every pack rolls one rarity with these odds, then a random card of that rarity. Ultra Rare and Mythic are the same weights in every series.</p><ul>${rows}</ul>${extra}`;
}
function renderPrize() {
  const s = series();
  const box = $('#mythicPrizeBox');
  const line = $('#mythicPrize');
  if (!box || !line) return;
  const text = s && s.mythicPrize;
  box.hidden = !text;
  line.textContent = text || '';
}
function renderSwitch(root) {
  if (!root) return;
  root.innerHTML = SERIES.map(s => `<button type="button" role="tab" data-series="${s.id}" aria-selected="${s.id === seriesId}" class="${s.id === seriesId ? 'on' : ''}">${esc(s.name)} · ${esc(s.themeName)}${s.status === 'soon' ? ' · soon' : ''}</button>`).join('');
}
function setSeries(id) {
  if (!SERIES.some(s => s.id === id)) return;
  seriesId = id;
  localStorage.setItem(SERIES_KEY, id);
  vaultFilter = 'all';
  document.querySelectorAll('.series-switch').forEach(renderSwitch);
  renderFilters();
  renderRates();
  renderPrize();
  renderShelf();
  paint();
}
function renderFilters() {
  const s = series();
  const root = $('#vaultFilters');
  if (!root || !s) return;
  const buttons = [{ id: 'all', name: 'All', className: '' }].concat(ODDS.tiers.map(t => ({ id: t.id, name: t.name, className: s.classes && s.classes[t.id] ? s.classes[t.id] : '' })));
  root.innerHTML = buttons.map(b => `<button type="button" role="tab" data-filter="${b.id}" class="${vaultFilter === b.id ? 'on' : ''}" aria-selected="${vaultFilter === b.id}">${esc(b.name)}${b.className ? ' · ' + esc(b.className) : ''}</button>`).join('');
}

function sortedCards(s) {
  const have = ownedSet(s);
  let list = liveCards(s).filter(c => vaultFilter === 'all' || c.rarity === vaultFilter);
  const byNo = (a, b) => a.no - b.no;
  list = list.slice().sort((a, b) => {
    if (vaultSort === 'name') return a.name.localeCompare(b.name) || byNo(a, b);
    if (vaultSort === 'rarity') return tierRank(b.rarity) - tierRank(a.rarity) || byNo(a, b);
    if (vaultSort === 'owned') return (have.has(b.cid) - have.has(a.cid)) || byNo(a, b);
    return byNo(a, b);
  });
  return list;
}
function renderShelf() {
  const s = series();
  const track = $('#shelfTrack');
  const count = $('#colCount');
  const fill = $('#vaultFill');
  if (!s || !track) return;
  const cards = liveCards(s);
  const have = ownedSet(s);
  const total = cards.length || s.size || 0;
  const got = cards.filter(c => have.has(c.cid)).length;
  if (count) count.textContent = s.status !== 'live' ? 'Coming soon' : `${got}/${total}`;
  if (fill) fill.style.width = total ? (got / total * 100) + '%' : '0%';
  if (s.status !== 'live') {
    track.innerHTML = s.renderPreview ? s.renderPreview() : '<p class="soon-note">Coming soon</p>';
    track.classList.add('is-soon');
    return;
  }
  track.classList.remove('is-soon');
  const ctx = { total: cards.length };
  track.innerHTML = sortedCards(s).map(c => s.renderShelf ? s.renderShelf(c, have.has(c.cid), { ...ctx, className: (s.classes && s.classes[c.rarity]) || '' }) : '').join('');
  layoutShelf(null);
}

const pk = $('#pk'), pack = $('#pkPack'), res = $('#pkResult'), hint = $('#pkHint'), stage = $('#pkStage');
let busy = false, dragging = false, prog = 0, originX = 0, travel = 1, anim = 0, opening = null, gestured = false, lastStep = 0;
let audioCtx = null, muted = localStorage.getItem(MUTE_KEY) === '1';

function audio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function tone(ctx, freq, dur, type, gain) {
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = type || 'triangle';
  o.frequency.setValueAtTime(freq, t);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain || 0.06, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
function zipperTick(strength) {
  if (muted || reduce) return;
  const ctx = audio();
  if (!ctx) return;
  const dur = 0.028;
  const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 700 + strength * 2400;
  f.Q.value = 5;
  const g = ctx.createGain();
  g.gain.value = 0.22 * strength;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start();
  tone(ctx, 140 + strength * 80, 0.03, 'square', 0.03);
}
function ripSound() {
  if (muted || reduce) return;
  const ctx = audio();
  if (!ctx) return;
  const dur = 0.22;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(2400, ctx.currentTime);
  f.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.18, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start();
}
function chime() {
  if (muted || reduce) return;
  const ctx = audio();
  if (!ctx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.045;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.52);
  });
}
function buzz(ms) {
  if (!gestured) return;
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (err) {}
}
function paintZip(p, play) {
  prog = p < 0 ? 0 : p > 1 ? 1 : p;
  if (pack) {
    pack.style.setProperty('--p', prog.toFixed(4));
    pack.setAttribute('aria-valuenow', String(Math.round(prog * 100)));
  }
  if (play && !reduce) {
    const step = Math.floor(prog * 22);
    if (step > lastStep) {
      zipperTick(0.35 + prog * 0.65);
      buzz(8);
      lastStep = step;
    }
  }
}
function stopAnim() { if (anim) cancelAnimationFrame(anim); anim = 0; }
function glide(to, ms) {
  stopAnim();
  const from = prog, t0 = performance.now();
  const step = now => {
    if (busy) { anim = 0; return; }
    const t = Math.min(1, (now - t0) / ms);
    const e = 1 - Math.pow(1 - t, 3);
    paintZip(from + (to - from) * e, true);
    if (prog >= 0.97) { finish(); return; }
    if (t < 1) anim = requestAnimationFrame(step);
    else anim = 0;
  };
  anim = requestAnimationFrame(step);
}
function springBack() {
  stopAnim();
  let x = prog, v = 0, last = performance.now();
  const step = now => {
    if (busy) { anim = 0; return; }
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    v += ((0 - x) * 240 - v * 22) * dt;
    x += v * dt;
    paintZip(x, false);
    if (Math.abs(x) < 0.004 && Math.abs(v) < 0.05) { paintZip(0, false); anim = 0; if (hint && !busy) hint.textContent = hintText(); return; }
    anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}
function hintText() { return reduce ? 'Tap the pack to open' : 'Drag the zipper across, or tap the pack'; }
function lockPage(on) { document.documentElement.classList.toggle('pull-lock', on); }
function resetZip() {
  busy = false; dragging = false; lastStep = 0;
  stopAnim();
  lockPage(false);
  if (pack) {
    pack.classList.remove('pack-gone', 'dragging');
    pack.style.visibility = '';
    pack.style.display = '';
    paintZip(0, false);
  }
  if (hint) { hint.hidden = false; hint.textContent = hintText(); }
  if (res) { res.className = 'pk-result'; res.innerHTML = ''; }
  document.querySelectorAll('.sparkburst,.pk-flash').forEach(el => el.remove());
}
function openOverlay() {
  if (!pk) return;
  pk.classList.add('open');
  pk.setAttribute('aria-hidden', 'false');
}
function open() {
  if (!ready()) return;
  opening = nextSpec();
  resetZip();
  openOverlay();
  if (pack) pack.focus({ preventScroll: true });
}
function close() { if (pk) { pk.classList.remove('open'); pk.setAttribute('aria-hidden', 'true'); } paint(); }

function sparks(n) {
  if (!stage || reduce) return;
  const layer = document.createElement('div');
  layer.className = 'sparkburst';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.setProperty('--a', (i / n * 360) + 'deg');
    s.style.setProperty('--d', (60 + (i % 6) * 16) + 'px');
    layer.appendChild(s);
  }
  stage.appendChild(layer);
  setTimeout(() => layer.remove(), 1000);
}
function flash(kind) {
  if (!stage || reduce) return;
  const el = document.createElement('div');
  el.className = 'pk-flash flash-' + kind;
  stage.appendChild(el);
  setTimeout(() => el.remove(), 800);
}
function bindCard(card) {
  let sx = 0, moved = 0, swiped = false;
  card.addEventListener('pointerdown', e => { if (e.target.closest('a')) return; sx = e.clientX; moved = 0; });
  card.addEventListener('pointermove', e => { if (sx) moved = Math.max(moved, Math.abs(e.clientX - sx)); });
  card.addEventListener('pointerup', () => { if (moved > 48) { card.classList.toggle('show'); swiped = true; } });
  card.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    if (swiped) { swiped = false; return; }
    card.classList.toggle('show');
  });
}
function showCard(c, save) {
  const s = series();
  if (!s || !res || !c) return;
  const have = ownedSet(s);
  let note = 'Tap the card to flip it. The watch link opens the video.';
  if (save) {
    const isNew = !have.has(c.cid);
    have.add(c.cid);
    const col = collection();
    col[s.id] = [...have];
    saveCol(col);
    note = `${isNew ? 'New card · in the Vault' : 'Already in the Vault'}. Tap to flip.`;
    const spec = opening || nextSpec();
    const prev = packState();
    const stampCooldown = !spec.fromQueue && !unlimited();
    localStorage.setItem(PACK_KEY, JSON.stringify({ at: stampCooldown ? Date.now() : (prev.at || 0), last: c.cid }));
    if (spec.fromQueue) saveQueue(queue().slice(1));
    renderShelf();
    renderRates();
    paint();
  }
  const ctx = { className: (s.classes && s.classes[c.rarity]) || c.rarity, total: liveCards(s).length || s.size || 40 };
  const banner = save && (c.rarity === 'ultra' || c.rarity === 'mythic')
    ? `<p class="hit-banner tier-${c.rarity}"><i>${c.rarity === 'mythic' ? 'Mythic' : 'Ultra Rare'}</i><b>${esc(ctx.className)}</b></p>` : '';
  res.innerHTML = banner + s.renderCard(c, ctx) + `<p class="pull-note">${note}</p>`;
  res.classList.add('on');
  if (save && c.rarity === 'mythic') { res.classList.add('hit-mythic'); flash('mythic'); sparks(36); chime(); buzz([40, 30, 40, 30, 90]); }
  else if (save && c.rarity === 'ultra') { res.classList.add('hit-ultra'); flash('ultra'); sparks(22); buzz([24, 40, 24, 70]); }
  const card = res.querySelector('.tcard');
  if (!card) return;
  card.classList.add('deal');
  card.addEventListener('animationend', () => card.classList.remove('deal'), { once: true });
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('show')));
  bindCard(card);
}
function finish() {
  if (busy) return;
  const s = series();
  const cards = s ? liveCards(s) : [];
  if (!cards.length) return;
  busy = true; dragging = false;
  lockPage(false);
  ripSound();
  buzz(18);
  const spec = opening || nextSpec();
  const card = rollCard(cards, spec.boost);
  if (hint) hint.textContent = '';
  const reveal = () => {
    if (pack) { pack.classList.add('pack-gone'); pack.style.visibility = 'hidden'; pack.style.display = 'none'; }
    if (hint) hint.hidden = true;
    showCard(card, true);
    busy = false;
  };
  if (reduce) { paintZip(1, false); if (pack) pack.style.display = 'none'; reveal(); return; }
  glideDone(reveal);
}
function glideDone(done) {
  stopAnim();
  const from = prog, t0 = performance.now();
  const step = now => {
    const t = Math.min(1, (now - t0) / 260);
    paintZip(from + (1 - from) * t, false);
    if (t < 1) anim = requestAnimationFrame(step);
    else { anim = 0; setTimeout(done, 180); }
  };
  anim = requestAnimationFrame(step);
}
function measure() { travel = Math.max(80, (pack ? pack.clientWidth : 230) - 28); }
function beginPull(clientX, pointerId) {
  if (busy || !pk || !pk.classList.contains('open') || (pack && pack.style.visibility === 'hidden')) return;
  gestured = true;
  dragging = true;
  audio();
  measure();
  originX = clientX - prog * travel;
  if (pack) {
    pack.classList.add('dragging');
    if (pointerId != null) { try { pack.setPointerCapture(pointerId); } catch (err) {} }
  }
  lockPage(true);
  if (hint) hint.textContent = 'Keep unzipping…';
}
function movePull(clientX) {
  if (!dragging || busy) return;
  paintZip((clientX - originX) / travel, true);
  if (prog >= 0.97) finish();
}
function endPull(tap) {
  if (!dragging || busy) return;
  dragging = false;
  if (pack) pack.classList.remove('dragging');
  lockPage(false);
  if (tap || prog >= 0.97) { if (prog >= 0.97) finish(); else { gestured = true; audio(); if (reduce) finish(); else glide(1, 820); } return; }
  springBack();
}
if (pack) {
  let downX = 0, moved = 0, active = false;
  pack.addEventListener('pointerdown', e => {
    if (busy) return;
    active = true; downX = e.clientX; moved = 0;
    beginPull(e.clientX, e.pointerId);
    e.preventDefault();
  });
  pack.addEventListener('pointermove', e => {
    if (!active || !dragging) return;
    moved = Math.max(moved, Math.abs(e.clientX - downX));
    movePull(e.clientX);
    e.preventDefault();
  });
  const up = () => { if (!active) return; const tap = moved < 8; active = false; endPull(tap); };
  pack.addEventListener('pointerup', up);
  pack.addEventListener('pointercancel', () => { active = false; if (dragging) { dragging = false; springBack(); } });
  pack.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gestured = true; audio(); if (reduce) finish(); else glide(1, 820); }
    if (e.key === 'ArrowRight') { e.preventDefault(); gestured = true; audio(); paintZip(prog + 0.08, true); if (prog >= 0.97) finish(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); paintZip(prog - 0.08, false); }
  });
}

function viewCard(c) {
  if (!c) return;
  resetZip();
  busy = true;
  openOverlay();
  if (pack) { pack.style.visibility = 'hidden'; pack.style.display = 'none'; }
  if (hint) hint.hidden = true;
  opening = null;
  showCard(c, false);
  busy = false;
}

const shelf = $('#shelf');
const track = $('#shelfTrack');
let shelfRaf = 0, shelfX = null, shelfMoved = 0, shelfDown = 0;
function layoutShelf(clientX) {
  if (!track || track.classList.contains('is-soon')) return;
  const cards = [...track.querySelectorAll('.shelf-card')];
  cards.forEach(el => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const dx = clientX == null ? 9999 : clientX - cx;
    const inf = Math.exp(-(dx * dx) / (2 * 72 * 72));
    const scale = 1 + inf * 1.15;
    const lift = -inf * (reduce ? 16 : 42);
    const rot = Math.max(-18, Math.min(18, -dx / 9)) * inf;
    el.style.transform = `translate3d(0,${lift.toFixed(1)}px,0) scale(${scale.toFixed(3)}) rotateY(${rot.toFixed(2)}deg)`;
    el.style.zIndex = String(10 + Math.round(inf * 120));
  });
}
if (shelf) {
  shelf.addEventListener('pointermove', e => {
    shelfX = e.clientX;
    if (e.buttons || e.pointerType === 'touch') shelfMoved = Math.max(shelfMoved, Math.abs(e.clientX - shelfDown));
    if (!shelfRaf) shelfRaf = requestAnimationFrame(() => { shelfRaf = 0; layoutShelf(shelfX); });
  });
  shelf.addEventListener('pointerdown', e => { shelfDown = e.clientX; shelfMoved = 0; });
  shelf.addEventListener('pointerleave', () => { shelfX = null; layoutShelf(null); });
  shelf.addEventListener('click', e => {
    const btn = e.target.closest('.shelf-card');
    if (!btn) return;
    if (shelfMoved > 14) { shelfMoved = 0; return; }
    if (btn.classList.contains('is-locked')) return;
    const s = series();
    const c = s && (s.cards || []).find(x => x.cid === btn.dataset.cid);
    if (c) viewCard(c);
  });
}

document.addEventListener('pointermove', e => {
  const card = e.target.closest && e.target.closest('.tcard');
  document.querySelectorAll('.tcard.hot').forEach(x => {
    if (x !== card) { x.classList.remove('hot'); x.style.removeProperty('--rx'); x.style.removeProperty('--ry'); }
  });
  if (!card || reduce) return;
  const r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  card.classList.add('hot');
  card.style.setProperty('--ry', (x * 10) + 'deg');
  card.style.setProperty('--rx', (-y * 8) + 'deg');
});

document.addEventListener('click', e => {
  const shelfBtn = e.target.closest('.shelf-card');
  if (shelfBtn) return;
  const legacy = e.target.closest('[data-card]');
  if (legacy) {
    const s = series();
    const c = s && s.cards.find(x => x.cid === legacy.dataset.card);
    if (c) viewCard(c);
    return;
  }
  if (e.target.closest('[data-open-pack]')) { e.preventDefault(); open(); }
});
if ($('#pkClose')) $('#pkClose').onclick = close;
addEventListener('keydown', e => { if (e.key === 'Escape' && pk && pk.classList.contains('open')) close(); });

const muteBtn = $('#pkMute');
function paintMute() {
  if (!muteBtn) return;
  muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
  muteBtn.textContent = muted ? 'Sound off' : 'Sound on';
}
if (muteBtn) muteBtn.onclick = () => { muted = !muted; localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); paintMute(); };
paintMute();

document.querySelectorAll('.series-switch').forEach(root => {
  renderSwitch(root);
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-series]');
    if (b) setSeries(b.dataset.series);
  });
});
const filters = $('#vaultFilters');
if (filters) filters.addEventListener('click', e => {
  const b = e.target.closest('[data-filter]');
  if (!b) return;
  vaultFilter = b.dataset.filter;
  renderFilters();
  renderShelf();
});
const sort = $('#vaultSort');
if (sort) sort.addEventListener('change', () => { vaultSort = sort.value; renderShelf(); });

const codeForm = $('#codeForm');
const codeMsg = $('#codeMsg');
const REASONS = {
  empty: 'Enter a code first.',
  unknown: 'That code is not valid.',
  expired: 'That code has expired.',
  used: 'That code was already used in this browser.',
  unsupported: 'This browser cannot check codes (no secure crypto). Open the site over HTTPS.'
};
if (codeForm) codeForm.addEventListener('submit', async e => {
  e.preventDefault();
  const input = $('#codeInput');
  if (!window.CodeGate || !input) return;
  const result = await window.CodeGate.redeem(input.value);
  if (!result.ok) { if (codeMsg) codeMsg.textContent = REASONS[result.reason] || 'That code is not valid.'; return; }
  const entry = result.entry || {};
  if (entry.type === 'unlimited') {
    localStorage.setItem(UNLIM_KEY, '1');
    if (codeMsg) codeMsg.textContent = entry.label ? `${entry.label}. Cooldown is off on this browser.` : 'Cooldown is off on this browser.';
  } else {
    const q = queue();
    const n = Math.max(1, Math.min(100, entry.packs || 1));
    for (let i = 0; i < n; i++) q.push({ type: entry.type || 'extra', boost: entry.boost || null, packType: entry.packType || 'standard', label: entry.label || 'Special pack' });
    saveQueue(q);
    if (codeMsg) codeMsg.textContent = `${entry.label || 'Special pack'} · ${n} added. They skip the hour cooldown.`;
  }
  input.value = '';
  renderRates();
  paint();
});

const DEALS = {
  stay: { site: 'Booking.com', what: 'Hotels & apartments', href: 'https://www.booking.com/', code: null },
  hostel: { site: 'Hostelworld', what: 'Solo-friendly hostels', href: 'https://www.hostelworld.com/', code: null },
  flights: { site: 'Skyscanner', what: 'Compare cheap flights', href: 'https://www.skyscanner.net/', code: null },
  esim: { site: 'Airalo', what: 'Travel eSIM data', href: 'https://www.airalo.com/', code: null }
};
const dealRow = $('#dealRow');
if (dealRow) dealRow.innerHTML = Object.values(DEALS).map(d =>
  `<a class="deal reveal in" href="${d.href}" target="_blank" rel="noopener sponsored" data-affiliate-placeholder><span class="l"><small>Deal link</small><b>${esc(d.site)}</b><p>${esc(d.what)}</p><span class="code">Code coming soon</span></span><span class="r">OPEN ↗</span></a>`).join('');

renderFilters();
renderRates();
renderPrize();
renderShelf();
paint();
setInterval(paint, 250);
window.__pack = { open, view: viewCard, ready, remain, series: () => seriesId };
function onHome() {
  const h = location.hash.replace(/^#\/?/, '');
  return h === '' || h === 'home' || h === 'top';
}
if (onHome() && ready() && !packState().at && !/noPack/.test(location.search)) setTimeout(open, 900);
})();
