(() => {
const $ = s => document.querySelector(s);
// Destinations: each links to a real Solo Travel 365 Short. Budgets are rough solo mid-range daily estimates (GBP).
const DEST = [
  {n:'Positano',c:'Italy',why:'Pastel cliffs that glow at golden hour.',b:'£110–170',img:'img/v_6pF15VIiB8Y.jpg',v:'6pF15VIiB8Y',perk:'stay'},
  {n:'The Dolomites',c:'Italy',why:'Jagged peaks and hidden lakes most people miss.',b:'£90–140',img:'img/dolomites.jpg',v:'leFPo_T6hhU',perk:'hostel'},
  {n:'Cappadocia',c:'Türkiye',why:'Hundreds of balloons over fairy chimneys at sunrise.',b:'£45–80',img:'img/cappadocia.jpg',v:'GAOQ-ainiDA',perk:'flights'},
  {n:'The Sahara',c:'Morocco',why:'Sleep under more stars than you knew existed.',b:'£35–60',img:'img/sahara.jpg',v:'yC_5FU0fVHs',perk:'hostel'},
  {n:'Lofoten',c:'Norway',why:'Fjords, red cabins and peaks straight out of the sea.',b:'£120–180',img:'img/lofoten2.jpg',v:'lCGpA713IwQ',perk:'stay'},
  {n:'Abisko',c:'Sweden',why:'One of Europe\'s best bets for the northern lights.',b:'£100–160',img:'img/aurora.jpg',v:'xndt8ebd04M',perk:'esim'},
  {n:'Bali',c:'Indonesia',why:'Rice terraces and jungle waterfalls on a backpacker budget.',b:'£30–55',img:'img/v_zzaxRp9UsPs.jpg',v:'zzaxRp9UsPs',perk:'esim'},
  {n:'Tenerife',c:'Spain',why:'Winter sun, a short flight from the UK.',b:'£60–100',img:'img/v_TSaO4o9Hwhk.jpg',v:'TSaO4o9Hwhk',perk:'flights'},
  {n:'Andalucía',c:'Spain',why:'White villages, cliff walks and cheap tapas.',b:'£55–90',img:'img/v_RtqLmOsaA6E.jpg',v:'RtqLmOsaA6E',perk:'hostel'},
  {n:'The Amazon',c:'South America',why:'The rainforest like you\'ve never seen it.',b:'£50–90',img:'img/v_tbWId8Hk1Sk.jpg',v:'tbWId8Hk1Sk',perk:'flights'}
];
// PERKS / DEALS: real sites, NO codes (none verified). Replace href + code with Zach's own affiliate link/code once approved.
const DEALS = {
  stay:{site:'Booking.com',what:'Hotels & apartments',href:'https://www.booking.com/',code:null},
  hostel:{site:'Hostelworld',what:'Solo-friendly hostels',href:'https://www.hostelworld.com/',code:null},
  flights:{site:'Skyscanner',what:'Compare cheap flights',href:'https://www.skyscanner.net/',code:null},
  esim:{site:'Airalo',what:'Travel eSIM data',href:'https://www.airalo.com/',code:null}
};
const codeTxt = d => d.code ? `Code: ${d.code}` : 'Code coming soon';
$('#dealRow').innerHTML = Object.values(DEALS).map(d =>
  `<a class="deal reveal in" href="${d.href}" target="_blank" rel="noopener sponsored" data-affiliate-placeholder><span class="l"><small>Deal link</small><b>${d.site}</b><p>${d.what}</p><span class="code">${codeTxt(d)}</span></span><span class="r">OPEN ↗</span></a>`).join('');

const KEY = 'st365_pack_v1', today = new Date().toISOString().slice(0, 10);
const pk = $('#pk'), pack = $('#pkPack'), spin = $('#pkSpin'), res = $('#pkResult'), hint = $('#pkHint');
const state = () => JSON.parse(localStorage.getItem(KEY) || '{}');
function showLast() {
  const s = state(), d = DEST[s.last];
  $('#lastPull').innerHTML = d ? `Today's pull: <b>${d.n}, ${d.c}</b><br>${s.day === today ? 'Next free pack tomorrow · or open another below' : 'Your free pack is ready'}` : 'Your first pack is free';
}
function reset() { pack.className = 'pack big'; pack.style.display = ''; hint.style.display = ''; hint.textContent = 'Tap the pack to tear it open'; spin.className = 'pk-spin'; spin.innerHTML = ''; res.className = 'pk-result'; res.innerHTML = ''; }
function open() { reset(); pk.classList.add('open'); pk.setAttribute('aria-hidden', 'false'); }
function close() { pk.classList.remove('open'); pk.setAttribute('aria-hidden', 'true'); showLast(); }
let busy = false;
pack.onclick = () => {
  if (busy) return; busy = true; hint.textContent = 'Tearing…';
  navigator.vibrate && navigator.vibrate([30, 40, 30, 40, 80]);
  pack.classList.add('shake');
  setTimeout(() => {
    pack.classList.remove('shake'); pack.classList.add('burst');
    const f = document.createElement('div'); f.className = 'pk-flash'; $('#pkStage').appendChild(f); setTimeout(() => f.remove(), 700);
    setTimeout(() => { pack.style.display = 'none'; hint.style.display = 'none'; spinThrough(); }, 450);
  }, 700);
};
function spinThrough() {
  const pick = Math.floor(Math.random() * DEST.length);
  spin.classList.add('on'); let i = 0, delay = 70; const total = 16;
  const tick = () => {
    const d = DEST[(pick + i + 1) % DEST.length];
    spin.innerHTML = `<div class="spin-card" style="background-image:url(${d.img})"><b>${d.n}</b></div>`;
    i++; delay *= 1.13;
    if (i < total) setTimeout(tick, delay); else setTimeout(() => reveal(pick), 250);
  };
  tick();
}
function reveal(k) {
  const d = DEST[k], p = DEALS[d.perk];
  localStorage.setItem(KEY, JSON.stringify({ day: today, last: k }));
  spin.className = 'pk-spin';
  res.innerHTML = `<div class="dcard">
    <div class="ph" style="background-image:url(${d.img})"><div class="stamp">NEXT<br>STOP<br><b>✓</b></div></div>
    <div class="in"><span class="k">Your next destination is…</span><h3>${d.n}</h3><span class="k" style="color:var(--text)">${d.c}</span>
    <p class="why">${d.why}</p>
    <div class="meta"><span>Rough daily budget<b>${d.b}</b></span><span>Pack<b>Series 01</b></span></div>
    <div class="perk"><b>Perk: ${p.site}</b><a href="${p.href}" target="_blank" rel="noopener sponsored">${p.what} ↗</a><span>${codeTxt(p)}</span></div>
    <div class="acts"><a class="btn" href="https://www.youtube.com/shorts/${d.v}" target="_blank" rel="noopener">Watch the Short</a><button type="button" class="btn btn-ghost" id="again">Open another</button></div>
    </div></div>`;
  res.classList.add('on'); busy = false;
  $('#again').onclick = reset;
}
document.addEventListener('click', e => { if (e.target.closest('[data-open-pack]')) { e.preventDefault(); open(); } });
$('#pkClose').onclick = close;
addEventListener('keydown', e => e.key === 'Escape' && pk.classList.contains('open') && close());
showLast();
// first visit: auto-show the pack
if (!state().day && !/noPack/.test(location.search)) setTimeout(open, 900);
window.__pack = { open, reveal };
})();
