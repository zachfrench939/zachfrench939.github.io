(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
$('#yr').textContent = new Date().getFullYear();

/* nav */
const nav = $('#nav');
const burger = $('#burger');
burger.onclick = () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
};
$$('#links a').forEach(a => a.onclick = () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
document.addEventListener('click', e => {
  const a = e.target.closest('[data-affiliate-placeholder]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href === '#') e.preventDefault();
});

/* videos */
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('#vgrid').innerHTML = (window.VIDEOS || []).map(([id, t, tag], i) =>
  `<button class="vcard reveal tilt" style="--d:${(i % 4) * 0.08}s" data-id="${id}" aria-label="Play: ${esc(t)}">
     <img src="img/v_${id}.jpg" alt="" loading="lazy"><span class="play"></span>
     <span class="vt"><small>${esc(tag)}</small><h3>${esc(t)}</h3><i class="bc"></i></span></button>`).join('');
const modal = $('#modal'), frame = $('#mframe');
$('#vgrid').addEventListener('click', e => {
  const c = e.target.closest('.vcard'); if (!c) return;
  frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${c.dataset.id}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Solo Travel 365 Short"></iframe>`;
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
});
const closeM = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); setTimeout(() => frame.innerHTML = '', 350); };
$('#mclose').onclick = closeM; modal.onclick = e => { if (e.target === modal) closeM(); };
addEventListener('keydown', e => e.key === 'Escape' && closeM());

/* reveal + counters */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
  $$('.count', e.target).concat(e.target.matches('.count') ? [e.target] : []).forEach(countUp);
}), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
$$('.reveal, .about-img').forEach(el => io.observe(el));
function countUp(el) {
  const to = +el.dataset.to, t0 = performance.now(), dur = reduce ? 0 : 1600;
  const step = now => { const p = dur ? Math.min(1, (now - t0) / dur) : 1, v = Math.round(to * (1 - Math.pow(1 - p, 4)));
    el.textContent = v.toLocaleString('en-GB'); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* scroll: parallax, nav, progress */
const hero = $('[data-parallax]'), prog = $('.progress');
let ticking = false;
const onScroll = () => { ticking = false; const y = scrollY;
  nav.classList.toggle('scrolled', y > 40);
  prog.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
  if (hero && !reduce && y < innerHeight * 1.2) hero.style.transform = `translate3d(0,${y * hero.dataset.parallax}px,0)`;
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();

/* tilt + magnetic (pointer devices only) */
if (fine && !reduce) {
  document.addEventListener('pointermove', e => {
    const t = e.target.closest('.tilt');
    $$('.tilt.tilting').forEach(x => x !== t && (x.classList.remove('tilting'), x.style.transform = ''));
    if (t) { const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      t.classList.add('tilting'); t.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`; }
    const m = e.target.closest('.magnetic');
    $$('.magnetic.mag').forEach(x => x !== m && (x.classList.remove('mag'), x.style.transform = ''));
    if (m) { const r = m.getBoundingClientRect(); m.classList.add('mag');
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; }
  });
  document.addEventListener('pointerleave', () => $$('.tilting,.mag').forEach(x => x.style.transform = ''));
}

/* ---------- currency rates ---------- */
const CUR = { GBP:'British pound', EUR:'Euro', USD:'US dollar', AUD:'Australian dollar', CAD:'Canadian dollar', NZD:'NZ dollar', JPY:'Japanese yen', CHF:'Swiss franc', NOK:'Norwegian krone', SEK:'Swedish krona', DKK:'Danish krone', ISK:'Icelandic króna', PLN:'Polish złoty', CZK:'Czech koruna', HUF:'Hungarian forint', TRY:'Turkish lira', MAD:'Moroccan dirham', AED:'UAE dirham', THB:'Thai baht', IDR:'Indonesian rupiah', VND:'Vietnamese dong', MYR:'Malaysian ringgit', SGD:'Singapore dollar', INR:'Indian rupee', MXN:'Mexican peso', BRL:'Brazilian real', PEN:'Peruvian sol', ZAR:'South African rand', KRW:'South Korean won', EGP:'Egyptian pound' };
// Offline fallback only (approximate, per 1 GBP). Used if both live sources fail.
const FALLBACK = { GBP:1, EUR:1.17, USD:1.30, AUD:2.0, CAD:1.80, NZD:2.2, JPY:195, CHF:1.05, NOK:14, SEK:14, DKK:8.7, ISK:180, PLN:5.0, CZK:29, HUF:470, TRY:50, MAD:12.5, AED:4.8, THB:43, IDR:21000, VND:33000, MYR:5.7, SGD:1.7, INR:110, MXN:25, BRL:7.2, PEN:4.6, ZAR:23.5, KRW:1800, EGP:63 };
let rates = { ...FALLBACK }, rateSrc = 'offline';
const fill = (sel, def) => { sel.innerHTML = Object.keys(CUR).map(c => `<option value="${c}"${c === def ? ' selected' : ''}>${c} · ${CUR[c]}</option>`).join(''); };
fill($('#outCur'), 'GBP'); fill($('#fxFrom'), 'GBP'); fill($('#fxTo'), 'EUR');
const convert = (v, from, to) => v / rates[from] * rates[to];
const money = (v, c) => { try { return new Intl.NumberFormat('en-GB', { style:'currency', currency:c, maximumFractionDigits: v >= 1000 || ['JPY','IDR','VND','KRW','HUF','ISK'].includes(c) ? 0 : 2 }).format(v); } catch { return c + ' ' + Math.round(v); } };

async function loadRates() {
  const note = $('#fxNote');
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/GBP'); const j = await r.json();
    if (j.result !== 'success') throw 0;
    Object.keys(CUR).forEach(c => j.rates[c] && (rates[c] = j.rates[c])); rateSrc = 'live';
    note.textContent = `Live rates from ExchangeRate-API · updated ${new Date(j.time_last_update_unix * 1000).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}`;
  } catch {
    try {
      const r = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/gbp.json'); const j = await r.json();
      Object.keys(CUR).forEach(c => j.gbp[c.toLowerCase()] && (rates[c] = j.gbp[c.toLowerCase()])); rateSrc = 'live';
      note.textContent = `Live rates (backup source) · ${j.date}`;
    } catch { note.textContent = 'Offline: showing approximate rates. Check again with a connection.'; }
  }
  fx(); calc();
}

/* ---------- currency converter ---------- */
function fx() {
  const a = parseFloat($('#fxAmt').value) || 0, f = $('#fxFrom').value, t = $('#fxTo').value;
  const out = convert(a, f, t);
  $('#fxOut').innerHTML = `${money(out, t)}<br><span class="fine">1 ${f} = ${convert(1, f, t).toLocaleString('en-GB', { maximumFractionDigits: 4 })} ${t}</span>`;
}
['#fxAmt', '#fxFrom', '#fxTo'].forEach(s => $(s).addEventListener('input', fx));
$('#fxSwap').onclick = () => { const f = $('#fxFrom'), t = $('#fxTo'); [f.value, t.value] = [t.value, f.value]; fx(); };

/* ---------- budget calculator ----------
   Baseline GBP costs at a "1.0" cost level; scaled by the destination multiplier.
   stay = per room per night (2 travellers share a room); others = per person per day. */
const BASE = { stay:[28, 80, 210], food:[16, 35, 80], move:[5, 12, 35], do:[5, 20, 60] };
const LABEL = { stay:'Accommodation', food:'Food & drink', move:'Local transport', do:'Activities', flights:'Flights / getting there' };
const level = { stay:1, food:1, move:1, do:1 };
$$('.seg').forEach(seg => seg.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); level[seg.dataset.key] = +b.dataset.v; calc();
}));
['#tier', '#days', '#pax', '#flights', '#outCur'].forEach(s => $(s).addEventListener('input', calc));
let shown = 0;
function calc() {
  const m = +$('#tier').value, d = Math.max(1, Math.min(365, +$('#days').value || 1)), p = Math.max(1, Math.min(20, +$('#pax').value || 1)), cur = $('#outCur').value;
  const rooms = Math.ceil(p / 2);
  const parts = {
    stay: BASE.stay[level.stay] * m * rooms * d,
    food: BASE.food[level.food] * m * p * d,
    move: BASE.move[level.move] * m * p * d,
    do: BASE.do[level.do] * m * p * d,
    flights: (Math.max(0, +$('#flights').value || 0)) * p
  };
  const totalGBP = Object.values(parts).reduce((a, b) => a + b, 0), total = convert(totalGBP, 'GBP', cur);
  animateTotal(total, cur);
  $('#perday').textContent = money(total / d, cur);
  $('#perperson').textContent = money(total / p, cur);
  $('#breakdown').innerHTML = Object.entries(parts).filter(([k, v]) => v > 0).map(([k, v]) =>
    `<li><span>${LABEL[k]}</span><b>${money(convert(v, 'GBP', cur), cur)}</b><span class="bar"><i style="width:${(v / totalGBP * 100).toFixed(1)}%"></i></span></li>`).join('');
}
function animateTotal(to, cur) {
  const from = shown, t0 = performance.now(), el = $('#total');
  const step = now => { const k = reduce ? 1 : Math.min(1, (now - t0) / 600), v = from + (to - from) * (1 - Math.pow(1 - k, 3));
    el.textContent = money(v, cur); if (k < 1) requestAnimationFrame(step); else shown = to; };
  requestAnimationFrame(step);
}
calc(); fx(); loadRates();

/* ---------- survey (localStorage only, needs a backend/form service later) ---------- */
const KEY = 'st365_survey_v1', picks = {};
$$('.chips').forEach(ch => ch.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const on = !b.classList.contains('on'); $$('button', ch).forEach(x => x.classList.remove('on'));
  if (on) b.classList.add('on'); picks[ch.dataset.name] = on ? b.textContent : null;
  if (ch.dataset.name === 'dest' && on) $('#destOther').value = '';
}));
$('#destOther').addEventListener('input', e => { if (e.target.value) { $$('[data-name=dest] button').forEach(x => x.classList.remove('on')); picks.dest = null; } });
$('#sform').addEventListener('submit', e => {
  e.preventDefault();
  const entry = { dest: ($('#destOther').value.trim() || picks.dest || ''), style: picks.style || '', budget: picks.budget || '', at: new Date().toISOString() };
  if (!entry.dest && !entry.style && !entry.budget) { $('#sThanks').textContent = 'Pick at least one answer first.'; return; }
  const all = JSON.parse(localStorage.getItem(KEY) || '[]'); all.push(entry); localStorage.setItem(KEY, JSON.stringify(all));
  // TODO: POST `entry` to a form service / backend here (e.g. fetch('https://formspree.io/f/XXXX', {method:'POST', body: JSON.stringify(entry)})).
  $('#sThanks').textContent = `Thanks! Saved${entry.dest ? ` · next stop vote: ${entry.dest}` : ''}. Follow along to see if it wins.`;
  e.target.querySelector('.btn').textContent = 'Picks saved ✓';
});

/* hash router: one page at a time, back button via the hash */
const ROUTES = { '': 'home', home: 'home', top: 'home', about: 'home', follow: 'home', videos: 'videos', destinations: 'destinations', packs: 'packs', tools: 'calculator', calculator: 'calculator', survey: 'survey', shop: 'shop', deals: 'shop', collection: 'vault', cards: 'vault', vault: 'vault' };
function routeName() {
  const key = decodeURIComponent(location.hash.replace(/^#/, '')).replace(/^\//, '').split(/[?#]/)[0];
  return ROUTES[key] || 'home';
}
function applyRoute() {
  const name = routeName();
  $$('.page').forEach(p => {
    const on = p.dataset.page === name;
    p.classList.toggle('on', on);
    if (!on) return;
    $$('.reveal', p).forEach(el => {
      if (el.classList.contains('in')) return;
      el.classList.add('in');
      $$('.count', el).forEach(countUp);
    });
  });
  $$('[data-nav]').forEach(a => {
    const on = a.dataset.nav === name;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  nav.classList.remove('open');
  if (burger) burger.setAttribute('aria-expanded', 'false');
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  scrollTo(0, 0);
  root.style.scrollBehavior = prev;
}
addEventListener('hashchange', applyRoute);
applyRoute();
})();
