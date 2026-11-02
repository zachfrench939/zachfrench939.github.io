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
const WELCOME_KEY = 'st365_welcome_v1';
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
const saveCol = col => { localStorage.setItem(COL_KEY, JSON.stringify(col)); if (!applyingCloud) notifyCloud(); };
const queue = () => { const q = read(QUEUE_KEY, []); return Array.isArray(q) ? q : []; };
const saveQueue = q => { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); if (!applyingCloud) notifyCloud(); };
const unlimited = () => localStorage.getItem(UNLIM_KEY) === '1';
let applyingCloud = false;
function notifyCloud() { try { if (window.Auth && window.Auth.onLocalChange) window.Auth.onLocalChange(); } catch (err) {} }
const RARITY_ICON = { common: '●', uncommon: '◆', rare: '★', ultra: '✦', mythic: '✶' };
const RARITY_NAME = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', ultra: 'Ultra Rare', mythic: 'Mythic' };
const rarityName = id => RARITY_NAME[id] || id;
const rarityIcon = id => RARITY_ICON[id] || '●';
function readWelcome() { const w = read(WELCOME_KEY, null); return w && typeof w === 'object' ? w : null; }
function saveWelcome(w) { localStorage.setItem(WELCOME_KEY, JSON.stringify(w)); }
function welcomeEligible() {
  const w = readWelcome();
  if (w && (w.opened || (w.pending && w.pending.length))) return false;
  try { if (window.Auth && window.Auth.user()) return false; } catch (err) {}
  const col = collection();
  if (Object.values(col).some(a => Array.isArray(a) && a.length)) return false;
  if (packState().at) return false;
  return true;
}
function paintClaimBanner() {
  const el = $('#claimBanner');
  if (!el) return;
  const w = readWelcome();
  const modal = document.querySelector('.claim-panel');
  const modalOpen = modal && pk && pk.classList.contains('open');
  const show = !!(w && w.pending && w.pending.length && !w.claimed && !w.bannerHidden && !modalOpen);
  el.hidden = !show;
  const text = $('#claimBannerText');
  if (show && text) {
    const n = w.pending.length;
    text.textContent = `${n} welcome card${n === 1 ? '' : 's'} saved on this device. Sign up or log in to add them to your collection. The rest of the site works without an account.`;
  }
}
function claimWelcomeInto(col) {
  const w = readWelcome();
  if (!w || w.claimed || !w.pending || !w.pending.length) return col;
  const key = w.series || 's1';
  const next = { ...col };
  const have = new Set(next[key] || []);
  w.pending.forEach(id => have.add(id));
  next[key] = [...have];
  w.claimed = true;
  saveWelcome(w);
  paintClaimBanner();
  return next;
}
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
    return `<li class="tier-${t.id}"><i class="swatch" aria-hidden="true"></i><span><b><span class="ricon" aria-hidden="true">${rarityIcon(t.id)}</span> ${esc(t.name)}${esc(klass)}</b><small>${typeof count === 'number' ? count + ' in the set' : 'Set size ' + (s.size || 40)} · each about ${each}</small></span><b class="odds">${pct(t.weight, totalW)}</b></li>`;
  }).join('');
  const extra = spec.fromQueue && spec.boost ? '<p class="fine">The percentages above include the odds boost on your next special pack. Base rates return after it.</p>' : '';
  box.innerHTML = `<h2>Pull rates</h2><p class="fine">Every pack rolls one rarity, then a random card of that rarity. The name and symbol show the rarity. Colour is extra. Ultra Rare and Mythic use the same weights in every series.</p><ul>${rows}</ul>${extra}`;
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
let busy = false, dragging = false, prog = 0, originX = 0, originY = 0, travel = 1, anim = 0, opening = null, gestured = false, lastStep = 0;
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
function paintTear(p, play) {
  const prev = prog;
  prog = p < 0 ? 0 : p > 1 ? 1 : p;
  const flap = document.getElementById('tearFlap');
  const glow = document.getElementById('tearGlow');
  const rag = document.getElementById('tearRag');
  if (flap) {
    flap.style.transform = `translate3d(${(-10 * prog).toFixed(2)}px, ${(-36 * prog).toFixed(2)}px, 0) rotateX(${(70 * prog).toFixed(2)}deg) rotateZ(${(-12 * prog).toFixed(2)}deg)`;
  }
  if (glow) glow.style.opacity = String(Math.min(1, prog * 1.2));
  if (rag) rag.style.opacity = String(Math.min(1, 0.12 + prog * 0.88));
  if (pack) {
    pack.style.setProperty('--p', prog.toFixed(4));
    pack.setAttribute('aria-valuenow', String(Math.round(prog * 100)));
  }
  if (play && !reduce) {
    const step = Math.floor(prog * 28);
    if (step > lastStep) {
      zipperTick(Math.min(1, 0.2 + prog * 0.7 + Math.abs(prog - prev) * 6));
      buzz(prog > 0.7 ? 12 : 7);
      lastStep = step;
    }
  }
}
function paintZip(p, play) { paintTear(p, play); }
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
function hintText() { return reduce ? 'Tap the pack to open' : 'Drag the top strip up to tear it off, or tap the pack'; }
function lockPage(on) { document.documentElement.classList.toggle('pull-lock', on); }
function resetZip() {
  busy = false; dragging = false; lastStep = 0;
  stopAnim();
  lockPage(false);
  const flap = document.getElementById('tearFlap');
  if (flap) { flap.getAnimations().forEach(a => a.cancel()); flap.style.opacity = '1'; flap.style.transform = ''; }
  const glow = document.getElementById('tearGlow');
  if (glow) glow.style.opacity = '0';
  const rag = document.getElementById('tearRag');
  if (rag) rag.style.opacity = '';
  const sky = document.getElementById('mythicSky');
  if (sky) sky.style.opacity = '0';
  if (pk) pk.classList.remove('fx-common', 'fx-uncommon', 'fx-rare', 'fx-ultra', 'fx-mythic', 'shake');
  if (pack) {
    pack.getAnimations().forEach(a => a.cancel());
    pack.classList.remove('pack-gone', 'dragging');
    pack.style.visibility = '';
    pack.style.display = '';
    pack.style.opacity = '';
    pack.style.transform = '';
    paintTear(0, false);
  }
  if (hint) { hint.hidden = false; hint.textContent = hintText(); }
  if (res) { res.className = 'pk-result'; res.innerHTML = ''; }
  document.querySelectorAll('.sparkburst,.pk-flash').forEach(el => el.remove());
  paintClaimBanner();
}
let packReturn = null;
function openOverlay() {
  if (!pk) return;
  packReturn = document.activeElement;
  pk.inert = false;
  pk.classList.add('open');
  pk.setAttribute('aria-hidden', 'false');
  pk.setAttribute('role', 'dialog');
  pk.setAttribute('aria-modal', 'true');
  pk.setAttribute('aria-labelledby', 'pkHint');
}
function open() {
  if (!ready()) return;
  opening = nextSpec();
  resetZip();
  openOverlay();
  if (pack) pack.focus({ preventScroll: true });
}
function openWelcome() {
  if (!welcomeEligible()) return;
  opening = { welcome: true, boost: null, fromQueue: false, packType: 'standard', label: 'Welcome pack' };
  resetZip();
  openOverlay();
  if (hint) hint.textContent = hintText();
  if (pack) pack.focus({ preventScroll: true });
}
function close() {
  if (pk) {
    pk.classList.remove('open');
    pk.setAttribute('aria-hidden', 'true');
    pk.removeAttribute('role');
    pk.removeAttribute('aria-modal');
    pk.inert = true;
  }
  paint();
  paintClaimBanner();
  const back = packReturn;
  packReturn = null;
  if (back && back.focus && document.contains(back)) back.focus();
}

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
function mythSound() {
  chime();
  if (muted || reduce) return;
  const ctx = audio();
  if (!ctx) return;
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  const t = ctx.currentTime;
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(640, t + 0.85);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 1200;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.045, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
  o.connect(f).connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + 1.2);
}
function shakeStage() {
  if (!stage || reduce) return;
  stage.animate([
    { transform: 'translate3d(0,0,0)' },
    { transform: 'translate3d(-8px,2px,0)' },
    { transform: 'translate3d(7px,-3px,0)' },
    { transform: 'translate3d(-4px,1px,0)' },
    { transform: 'translate3d(0,0,0)' }
  ], { duration: 460, easing: 'linear' });
}
function celebrate(c, big) {
  if (pk) pk.classList.add('fx-' + c.rarity);
  if (!big) return;
  if (c.rarity === 'uncommon') buzz(14);
  else if (c.rarity === 'rare') { flash('rare'); buzz([16, 22, 16]); }
  else if (c.rarity === 'ultra') { flash('ultra'); sparks(28); shakeStage(); buzz([30, 36, 30, 36, 90]); }
  else if (c.rarity === 'mythic') {
    const sky = document.getElementById('mythicSky');
    if (sky) sky.style.opacity = '1';
    if (pk) pk.classList.add('fx-mythic');
    flash('mythic'); sparks(40); shakeStage(); mythSound();
    buzz([40, 28, 40, 28, 70, 28, 90, 40, 160]);
  }
}
function rollUnique(pool, n, boost) {
  const picked = [];
  const used = new Set();
  let guard = 0;
  while (picked.length < n && pool.length && guard++ < 80) {
    const c = rollCard(pool, boost);
    if (!c || used.has(c.cid)) continue;
    used.add(c.cid);
    picked.push(c);
  }
  return picked.length ? picked : pool.slice(0, n);
}
function shareCaption(name, rarity) {
  return `I pulled ${rarity} ${name} on Solo Travel 365.`;
}
function shareUrl() {
  return location.origin + location.pathname + '#/vault';
}
async function copyShare(value) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (err) {}
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.left = '-999px';
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
  field.remove();
  return ok;
}
async function shareCard(btn) {
  const name = btn.dataset.shareName || 'a card';
  const rarity = btn.dataset.shareRarity || '';
  const text = shareCaption(name, rarity);
  const url = shareUrl();
  const status = btn.parentElement && btn.parentElement.querySelector('.share-status');
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Solo Travel 365', text, url });
      if (status) status.textContent = '';
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  const copied = await copyShare(`${text} ${url}`);
  if (status) status.textContent = copied ? 'Link copied.' : 'Copy this link: ' + url;
}
function revealCards(list, spec) {
  const s = series();
  if (!s || !res || !list.length) return;
  const welcome = !!(spec && spec.welcome);
  const viewing = !!(spec && spec.view);
  const summary = list.map(c => `${rarityIcon(c.rarity)} ${rarityName(c.rarity)}`).join(', ');
  const total = liveCards(s).length || s.size || 40;
  const slots = list.map(c => {
    const ctx = { className: (s.classes && s.classes[c.rarity]) || rarityName(c.rarity), total };
    return `<div class="reveal-slot tier-${c.rarity}">
      <p class="rarity-banner tier-${c.rarity}"><span aria-hidden="true">${rarityIcon(c.rarity)}</span> ${esc(rarityName(c.rarity))}</p>
      ${s.renderCard(c, ctx)}
      <button type="button" class="btn btn-ghost share-card" data-share-name="${esc(c.name)}" data-share-rarity="${esc(rarityName(c.rarity))}">Share this card</button>
      <p class="share-status" role="status"></p>
    </div>`;
  }).join('');
  const claim = welcome ? `<div class="claim-panel" id="claimPanel">
      <h2>Sign up to keep these cards</h2>
      <p>Creating an account is how these cards join your collection. They stay on this device until you sign up or log in, including if you leave and come back. You can keep using the rest of the site without an account.</p>
      <div class="claim-actions">
        <a class="btn" href="#/signup">Sign up</a>
        <a class="btn btn-ghost" href="#/signin">Log in</a>
        <button type="button" class="text-btn" id="claimLater">Not now</button>
      </div>
    </div>` : '';
  const note = welcome
    ? 'Not in your collection yet. Sign up or log in to claim them.'
    : (viewing ? 'Tap a card to flip it. The watch link opens the video.' : 'In your collection. Tap a card to flip it.');
  res.innerHTML = `<p class="pull-summary">You pulled ${esc(summary)}.</p><div class="reveal-fan${list.length > 1 ? ' multi' : ''}">${slots}</div><p class="pull-note">${note}</p>${claim}`;
  res.classList.add('on');
  res.querySelectorAll('.share-card').forEach(btn => btn.addEventListener('click', () => shareCard(btn)));
  const els = [...res.querySelectorAll('.reveal-slot')];
  const n = els.length;
  els.forEach((el, i) => {
    const spread = 0;
    const x = 0;
    const card = el.querySelector('.tcard');
    if (reduce) {
      el.style.opacity = '1';
      el.style.transform = `translate3d(${x}px,0,0) rotate(${spread}deg)`;
      if (card) card.classList.add('show');
    } else {
      el.animate([
        { transform: `translate3d(${x}px, 120px, 0) rotate(${spread}deg) scale(.9)`, opacity: 0 },
        { transform: `translate3d(${x}px, 0, 0) rotate(${spread}deg) scale(1)`, opacity: 1 }
      ], { duration: 760, delay: 90 + i * 180, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
      if (card) setTimeout(() => card.classList.add('show'), 90 + i * 180);
    }
    setTimeout(() => celebrate(list[i], !viewing), reduce ? 0 : 90 + i * 180);
    if (card) bindCard(card);
  });
  const later = $('#claimLater');
  if (later) later.addEventListener('click', () => {
    const w = readWelcome() || {};
    w.dismissed = true;
    saveWelcome(w);
    close();
    paintClaimBanner();
  });
  res.querySelectorAll('a[href^="#/"]').forEach(a => a.addEventListener('click', () => {
    const w = readWelcome();
    if (w && !w.claimed) { w.dismissed = true; saveWelcome(w); }
    close();
  }));
}
function showCard(c, save) { revealCards([c], save ? {} : { view: true }); }
function rememberPull(card, spec) {
  const s = series();
  const have = ownedSet(s);
  have.add(card.cid);
  const col = collection();
  col[s.id] = [...have];
  saveCol(col);
  const prev = packState();
  const stamp = !spec.fromQueue && !unlimited() && !spec.welcome;
  localStorage.setItem(PACK_KEY, JSON.stringify({ at: stamp ? Date.now() : (prev.at || 0), last: card.cid }));
  if (!applyingCloud) notifyCloud();
  if (spec.fromQueue) saveQueue(queue().slice(1));
  renderShelf();
  renderRates();
  paint();
}
function finishReveal() {
  if (busy) return;
  const s = series();
  const pool = s ? liveCards(s) : [];
  if (!pool.length) return;
  busy = true; dragging = false;
  lockPage(false);
  ripSound();
  const spec = opening || nextSpec();
  const welcome = !!spec.welcome;
  const pulled = welcome ? rollUnique(pool, 3, null) : [rollCard(pool, spec.boost)];
  if (welcome) {
    saveWelcome({ opened: true, series: s.id, pending: pulled.map(c => c.cid), dismissed: false, bannerHidden: false, claimed: false });
  } else {
    rememberPull(pulled[0], spec);
  }
  if (hint) hint.textContent = '';
  const go = () => { fadePack(); revealCards(pulled, spec); busy = false; };
  if (reduce) { paintTear(1, false); go(); return; }
  flyFlap(go);
}
function fadePack() {
  if (!pack) return;
  if (reduce) { pack.style.visibility = 'hidden'; pack.style.display = 'none'; return; }
  const anim = pack.animate([
    { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
    { opacity: 0, transform: 'translate3d(0,28px,0) scale(.96)' }
  ], { duration: 540, delay: 60, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
  anim.onfinish = () => { pack.style.visibility = 'hidden'; pack.style.display = 'none'; };
}
function flyFlap(done) {
  const flap = document.getElementById('tearFlap');
  if (!flap || reduce) { done && done(); return; }
  const current = flap.style.transform || 'translate3d(0,-36px,0) rotateX(70deg) rotateZ(-12deg)';
  const anim = flap.animate([
    { transform: current, opacity: 1 },
    { transform: 'translate3d(-42px, -72vh, 0) rotateX(82deg) rotateZ(-28deg)', opacity: 0 }
  ], { duration: 720, easing: 'cubic-bezier(.15,.75,.2,1)', fill: 'forwards' });
  anim.onfinish = () => { if (done) done(); };
}
function finish() { finishReveal(); }
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
function beginPull(clientX, clientY, pointerId) {
  if (busy || !pk || !pk.classList.contains('open') || (pack && pack.style.visibility === 'hidden')) return;
  gestured = true;
  dragging = true;
  audio();
  measure();
  originX = clientX - prog * travel;
  originY = clientY + prog * 150;
  if (pack) {
    pack.classList.add('dragging');
    if (pointerId != null) { try { pack.setPointerCapture(pointerId); } catch (err) {} }
  }
  lockPage(true);
  if (hint) hint.textContent = 'Keep tearing…';
}
function movePull(clientX, clientY) {
  if (!dragging || busy) return;
  const right = (clientX - originX) / travel;
  const up = (originY - clientY) / 150;
  paintTear(Math.max(right, up), true);
  if (prog >= 0.55) finish();
}
function endPull(tap) {
  if (!dragging || busy) return;
  dragging = false;
  if (pack) pack.classList.remove('dragging');
  lockPage(false);
  if (tap || prog >= 0.55) {
    if (prog >= 0.55) finish();
    else { gestured = true; audio(); if (reduce) finish(); else glide(1, 880); }
    return;
  }
  springBack();
}
if (pack) {
  let downX = 0, downY = 0, moved = 0, active = false;
  pack.addEventListener('pointerdown', e => {
    if (busy) return;
    active = true; downX = e.clientX; downY = e.clientY; moved = 0;
    beginPull(e.clientX, e.clientY, e.pointerId);
    e.preventDefault();
  });
  pack.addEventListener('pointermove', e => {
    if (!active || !dragging) return;
    moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
    movePull(e.clientX, e.clientY);
    e.preventDefault();
  });
  const up = () => { if (!active) return; const tap = moved < 10; active = false; endPull(tap); };
  pack.addEventListener('pointerup', up);
  pack.addEventListener('pointercancel', () => { active = false; if (dragging) { dragging = false; springBack(); } });
  pack.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gestured = true; audio(); if (reduce) finish(); else glide(1, 880); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); gestured = true; audio(); paintTear(prog + 0.08, true); if (prog >= 0.55) finish(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); paintTear(prog - 0.08, false); }
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
  revealCards([c], { view: true });
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
if (pk) pk.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !pk.classList.contains('open')) return;
  const items = [...pk.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

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
  invalid: 'That code is not valid.',
  expired: 'That code has expired.',
  used: 'That code has already been used.',
  unsupported: 'This browser cannot check codes (no secure crypto). Open the site over HTTPS.',
  network: 'Could not reach the code server. Check your connection and try again.'
};
if (codeForm) codeForm.addEventListener('submit', async e => {
  e.preventDefault();
  const input = $('#codeInput');
  if (!window.CodeGate || !input) return;
  const result = await window.CodeGate.redeem(input.value);
  if (!result.ok) { if (codeMsg) codeMsg.textContent = REASONS[result.reason] || 'That code is not valid.'; return; }
  const entry = result.entry || {};
  if (entry.type === 'allcards') {
    let target = series();
    let cards = target ? liveCards(target) : [];
    if (!cards.length) {
      target = SERIES.find(s => s.status === 'live' && liveCards(s).length) || target;
      cards = target ? liveCards(target) : [];
    }
    if (!target || !cards.length) {
      if (codeMsg) codeMsg.textContent = 'That code is for a full set, and there is no released series to fill yet.';
      input.value = '';
      return;
    }
    const col = collection();
    const have = new Set(col[target.id] || []);
    const before = have.size;
    cards.forEach(c => have.add(c.cid));
    col[target.id] = [...have];
    saveCol(col);
    renderShelf();
    paint();
    const added = have.size - before;
    if (codeMsg) codeMsg.textContent = `All ${cards.length} ${target.name} cards are in your collection${added ? ` · ${added} new` : ''}. This did not use your hourly cooldown.`;
    input.value = '';
    return;
  }
  if (entry.type === 'unlimited') {
    localStorage.setItem(UNLIM_KEY, '1');
    notifyCloud();
    if (codeMsg) codeMsg.textContent = entry.label ? `${entry.label}. Cooldown is off on this browser.` : 'Cooldown is off on this browser.';
  } else {
    const q = queue();
    const n = Math.max(1, Math.min(100, entry.packs || 1));
    for (let i = 0; i < n; i++) q.push({ type: entry.type || 'packs', boost: entry.boost || null, packType: entry.packType || 'standard', label: entry.label || 'Special pack' });
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
window.__collection = {
  grantPack(item) {
    const q = queue();
    q.push(item || { type: 'journey', boost: null, packType: 'standard', label: 'Journey pack' });
    saveQueue(q);
    paint();
  },
  snapshot() {
    let journey = null;
    try { journey = JSON.parse(localStorage.getItem('st365_journey_v1') || 'null'); } catch (err) { journey = null; }
    return { collection: collection(), queue: queue(), unlimited: unlimited(), pack: packState(), welcome: readWelcome(), journey };
  },
  apply(state) {
    applyingCloud = true;
    try {
      if (state.collection) localStorage.setItem(COL_KEY, JSON.stringify(state.collection));
      if (state.queue) localStorage.setItem(QUEUE_KEY, JSON.stringify(state.queue));
      localStorage.setItem(UNLIM_KEY, state.unlimited ? '1' : '0');
      if (state.pack) localStorage.setItem(PACK_KEY, JSON.stringify(state.pack || {}));
      if (state.journey) {
        localStorage.setItem('st365_journey_v1', JSON.stringify(state.journey));
        if (window.Journey && window.Journey.load) window.Journey.load(state.journey);
      }
      renderShelf();
      renderRates();
      paint();
      paintClaimBanner();
    } finally { applyingCloud = false; }
  },
  claimWelcome() {
    const before = collection();
    const next = claimWelcomeInto(before);
    if (next === before) return false;
    saveCol(next);
    renderShelf();
    paint();
    return true;
  },
  clearPlay() {
    applyingCloud = true;
    try {
      localStorage.removeItem(COL_KEY);
      localStorage.removeItem(QUEUE_KEY);
      localStorage.removeItem(UNLIM_KEY);
      localStorage.removeItem(PACK_KEY);
      localStorage.removeItem(WELCOME_KEY);
      renderShelf();
      renderRates();
      paint();
      paintClaimBanner();
    } finally { applyingCloud = false; }
  }
};
window.__pack = { open, openWelcome, maybeWelcome, view: viewCard, ready, remain, series: () => seriesId };
let welcomeScheduled = false;
function maybeWelcome() {
  paintClaimBanner();
  const key = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split(/[?#]/)[0];
  if (welcomeScheduled || /noPack|noWelcome/.test(location.search)) return;
  if (key === 'account' || key === 'signin' || key === 'signup' || key === 'reset' || key === 'privacy' || key === 'terms' || key === 'play') return;
  if (!welcomeEligible()) return;
  welcomeScheduled = true;
  setTimeout(() => { welcomeScheduled = false; if (welcomeEligible()) openWelcome(); }, 450);
}
const hideBanner = $('#claimBannerHide');
if (hideBanner) hideBanner.addEventListener('click', () => {
  const w = readWelcome();
  if (w) { w.bannerHidden = true; w.dismissed = true; saveWelcome(w); }
  paintClaimBanner();
});
paintClaimBanner();
setTimeout(() => { if (!window.Auth) maybeWelcome(); }, 1200);
})();
