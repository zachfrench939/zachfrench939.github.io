/* Solo Journey — idle travel that earns a pack. */
(() => {
  const CFG = window.JOURNEY_CONFIG || { milesPerPack: 1050, offlineRate: 0.12, offlineCapMs: 3 * 60 * 60 * 1000 };
  const KEY = 'st365_journey_v1';
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RIDES = [
    { id: 'walk', name: 'Walking', rate: 0.18, tap: 1.2, cost: 0 },
    { id: 'bus', name: 'Bus', rate: 0.32, tap: 1.6, cost: 80 },
    { id: 'train', name: 'Train', rate: 0.55, tap: 2.2, cost: 260 },
    { id: 'plane', name: 'Plane', rate: 0.9, tap: 3, cost: 700 }
  ];
  const PACK_ITEMS = ['Passport', 'Charger', 'Toothbrush', 'Jacket', 'Rain cover', 'Sofa', 'Fridge', 'Kettle'];
  const PACK_GOOD = new Set(['Passport', 'Charger', 'Toothbrush', 'Jacket', 'Rain cover']);

  const stops = () => {
    const cards = ((window.SERIES || []).find(s => s.id === 's1') || {}).cards || [];
    return [{ name: 'London', country: 'Home', why: 'Where the ticket starts.' }].concat(cards.map(c => ({
      name: c.name, country: c.country, why: c.why, cid: c.cid
    })));
  };

  function blank() {
    return { miles: 0, meter: 0, earned: 0, ride: 0, place: 0, stamps: [], last: Date.now(), challengeAt: 0, eventAt: 0, seen: 0 };
  }
  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!raw || typeof raw !== 'object') return blank();
      return Object.assign(blank(), raw);
    } catch { return blank(); }
  }
  let state = loadState();
  let tapLock = 0;
  let audioCtx = null;

  function muted() { return localStorage.getItem('st365_mute') === '1'; }
  function persist() {
    state.last = Date.now();
    const copy = Object.assign({}, state);
    delete copy._saved;
    localStorage.setItem(KEY, JSON.stringify(copy));
    try { if (window.Auth && window.Auth.onLocalChange) window.Auth.onLocalChange(); } catch (err) {}
  }
  function ride() { return RIDES[Math.max(0, Math.min(RIDES.length - 1, state.ride | 0))]; }
  function place() {
    const list = stops();
    return list[Math.max(0, Math.min(list.length - 1, state.place | 0))] || list[0];
  }
  function beep(freq, dur, gain) {
    if (muted() || reduce) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function credit(n) {
    if (!n) return 0;
    state.miles = Math.max(0, +(state.miles || 0) + n);
    let packs = 0;
    if (n > 0) {
      state.meter = +(state.meter || 0) + n;
      while (state.meter >= CFG.milesPerPack) {
        state.meter -= CFG.milesPerPack;
        state.earned = (state.earned || 0) + 1;
        packs++;
      }
    }
    return packs;
  }
  function grantPacks(packs) {
    if (!packs || !window.__collection || !window.__collection.grantPack) return;
    for (let i = 0; i < packs; i++) {
      window.__collection.grantPack({ type: 'journey', boost: null, packType: 'standard', label: 'Journey pack' });
    }
    beep(660, 0.18, 0.07);
    setTimeout(() => beep(880, 0.22, 0.06), 120);
    note(packs === 1 ? 'Pack earned. It skips the hourly cooldown.' : packs + ' packs earned.');
  }
  function addMiles(n, why) {
    const packs = credit(n);
    if (packs) grantPacks(packs);
    else if (why) note(why);
    persist();
    paint();
  }

  function note(text) {
    const el = $('#jEvent');
    if (!el || !text) return;
    el.textContent = text;
  }

  function paint() {
    const here = place();
    const r = ride();
    const scene = $('#jTap');
    if (scene) {
      scene.dataset.ride = r.id;
      const k = $('#jPlace');
      if (k) k.textContent = here.country || '';
      const d = $('#jDest');
      if (d) d.textContent = here.name;
    }
    const miles = $('#jMiles');
    if (miles) miles.textContent = Math.floor(state.miles) + ' miles · ' + r.name;
    const fill = $('#jMeterFill');
    const pct = Math.max(0, Math.min(1, state.meter / CFG.milesPerPack));
    if (fill) fill.style.transform = 'scaleX(' + pct + ')';
    const label = $('#jMeterText');
    if (label) label.textContent = 'Pack meter ' + Math.floor(state.meter) + ' / ' + CFG.milesPerPack;
    const eta = $('#jEta');
    if (eta) {
      const perSec = r.rate + (r.tap / 1.7);
      const left = Math.max(0, CFG.milesPerPack - state.meter);
      if (left <= r.tap) eta.textContent = 'The next tap earns a pack.';
      else {
        const mins = Math.max(1, Math.round(left / perSec / 60));
        eta.textContent = 'About ' + mins + ' min of tapping from here. Challenges and travel shorten that.';
      }
    }
    const ups = $('#jUpgrades');
    if (ups && ups.dataset.ride !== String(state.ride)) {
      ups.dataset.ride = String(state.ride);
      ups.innerHTML = RIDES.map((item, i) => {
        const owned = i <= state.ride;
        const next = i === state.ride + 1;
        return `<button type="button" class="j-ride${owned ? ' on' : ''}" data-ride="${i}" ${owned || !next ? 'disabled' : ''}>
          <b>${item.name}</b><small>${owned ? 'In use' : item.cost + ' miles'}</small>
        </button>`;
      }).join('');
    }
    const list = stops();
    const pass = $('#jPass');
    const stampKey = (state.stamps || []).join(',');
    if (pass && pass.dataset.stamps !== stampKey) {
      pass.dataset.stamps = stampKey;
      pass.innerHTML = list.slice(1).map((s, i) => {
        const got = (state.stamps || []).includes(i + 1);
        return `<span class="j-stamp${got ? ' got' : ''}" title="${s.name}">${got ? '✦' : '·'}<small>${s.name.split(' ')[0]}</small></span>`;
      }).join('') + `<span class="j-stamp more">${(state.stamps || []).length} stamps</span>`;
    }
    const open = $('#jOpen');
    if (open) {
      let n = 0;
      try { n = (JSON.parse(localStorage.getItem('st365_pack_queue') || '[]') || []).length; } catch (err) { n = 0; }
      open.hidden = n < 1;
      open.textContent = n > 1 ? `Open ${n} packs` : 'Open pack';
    }
    const mute = $('#jMute');
    if (mute) mute.textContent = muted() ? 'Sound off' : 'Sound on';
    const travel = $('#jTravel');
    if (travel) {
      const next = state.place + 1;
      if (next >= list.length) travel.textContent = 'You have stamped the set';
      else {
        const cost = 20 + state.place * 6;
        travel.textContent = `Travel to ${list[next].name} · ${cost} miles`;
      }
    }
  }

  function tickFocused(dt) {
    const packs = credit(ride().rate * dt);
    if (packs) grantPacks(packs);
    paint();
  }

  function catchUp() {
    const now = Date.now();
    const elapsed = Math.max(0, now - (state.last || now));
    state.last = now;
    if (!elapsed) return;
    const visible = document.visibilityState === 'visible';
    const seconds = Math.min(elapsed, visible ? 20000 : CFG.offlineCapMs) / 1000;
    const rate = ride().rate * (visible ? 1 : CFG.offlineRate);
    const gain = rate * seconds;
    if (gain >= 1) addMiles(gain, visible ? '' : 'While you were away: ' + Math.floor(gain) + ' gentle miles.');
    else persist();
    if (visible) maybeEvent();
  }

  function maybeEvent() {
    const now = Date.now();
    if (now - (state.eventAt || 0) < 70000) return;
    if (Math.random() > 0.35) return;
    state.eventAt = now;
    const here = place();
    const roll = Math.random();
    if (roll < 0.45) addMiles(18, 'A lookout above ' + here.name + '. +18 miles.');
    else if (roll < 0.75) addMiles(26, 'A local points out a shortcut. +26 miles.');
    else addMiles(8, 'Weather slows the ' + ride().name.toLowerCase() + ', but the view is worth it. +8 miles.');
    beep(520, 0.08, 0.04);
  }

  function onTap() {
    const now = performance.now();
    if (now - tapLock < 650) return;
    tapLock = now;
    const scene = $('#jTap');
    if (scene && !reduce) {
      scene.animate([{ transform: 'scale(1)' }, { transform: 'scale(.98)' }, { transform: 'scale(1)' }], { duration: 180, easing: 'ease-out' });
    }
    beep(440 + state.ride * 40, 0.05, 0.04);
    addMiles(ride().tap);
    maybeEvent();
  }

  function buy(index) {
    const item = RIDES[index];
    if (!item || index !== state.ride + 1) return;
    if (state.miles < item.cost) { note('Not enough miles for the ' + item.name.toLowerCase() + ' yet.'); return; }
    state.miles -= item.cost;
    state.ride = index;
    beep(540, 0.1, 0.05);
    note(item.name + ' unlocked. You cover more ground.');
    persist();
    paint();
  }

  function travel() {
    const list = stops();
    const next = state.place + 1;
    if (next >= list.length) { note('Every stamp in this set is in the passport.'); return; }
    const cost = 20 + state.place * 6;
    if (state.miles < cost) { note('Gather ' + cost + ' miles before the next hop.'); return; }
    state.miles -= cost;
    state.place = next;
    if (!(state.stamps || []).includes(next)) state.stamps.push(next);
    beep(600, 0.12, 0.05);
    addMiles(22, 'Arrived in ' + list[next].name + '. Stamp earned.');
  }

  function quiz() {
    const list = stops().slice(1);
    const pick = list[Math.floor(Math.random() * list.length)];
    const countries = [...new Set(list.map(s => s.country))];
    const options = new Set([pick.country]);
    while (options.size < 3 && options.size < countries.length) options.add(countries[Math.floor(Math.random() * countries.length)]);
    const choices = [...options].sort(() => Math.random() - 0.5);
    return {
      title: 'Geography',
      text: 'Which country is ' + pick.name + ' in?',
      choices,
      answer: pick.country,
      reward: 70
    };
  }
  function packing() {
    const bag = ['Passport', 'Charger', 'Toothbrush', 'Jacket', 'Sofa', 'Fridge'].sort(() => Math.random() - 0.5);
    return { title: 'Pack the bag', text: 'Tap the things that belong in a carry-on. Leave the house behind.', choices: bag, multi: true, reward: 64 };
  }
  function landmark() {
    const list = stops().slice(1).filter(s => s.why);
    const pick = list[Math.floor(Math.random() * list.length)];
    const names = new Set([pick.name]);
    while (names.size < 3) names.add(list[Math.floor(Math.random() * list.length)].name);
    return { title: 'Spot the place', text: pick.why, choices: [...names].sort(() => Math.random() - 0.5), answer: pick.name, reward: 72 };
  }

  function openChallenge() {
    const now = Date.now();
    if (now - (state.challengeAt || 0) < 180000) {
      const left = Math.ceil((180000 - (now - state.challengeAt)) / 1000);
      note('Next challenge in ' + left + 's. Keep travelling in the meantime.');
      return;
    }
    const box = $('#jChallengeBox');
    if (!box) return;
    const made = [quiz, packing, landmark][Math.floor(Math.random() * 3)]();
    const picked = new Set();
    box.hidden = false;
    box.innerHTML = `<div class="j-quiz"><p class="eyebrow">${made.title}</p><p>${made.text}</p><div class="j-choices"></div><div class="j-quiz-actions"><button type="button" class="btn" id="jAnswer">Check</button><button type="button" class="text-btn" id="jSkip">Not now</button></div><p class="form-error" id="jQuizMsg" role="status"></p></div>`;
    const holder = box.querySelector('.j-choices');
    made.choices.forEach(choice => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'j-choice';
      b.textContent = choice;
      b.addEventListener('click', () => {
        if (made.multi) {
          if (picked.has(choice)) { picked.delete(choice); b.classList.remove('on'); }
          else { picked.add(choice); b.classList.add('on'); }
        } else {
          picked.clear();
          holder.querySelectorAll('.j-choice').forEach(x => x.classList.remove('on'));
          picked.add(choice);
          b.classList.add('on');
        }
      });
      holder.appendChild(b);
    });
    box.querySelector('#jSkip').onclick = () => { box.hidden = true; box.innerHTML = ''; };
    box.querySelector('#jAnswer').onclick = () => {
      let ok = false;
      if (made.multi) ok = picked.size === 4 && [...picked].every(item => PACK_GOOD.has(item));
      else ok = picked.has(made.answer);
      state.challengeAt = Date.now();
      box.hidden = true;
      box.innerHTML = '';
      if (ok) addMiles(made.reward, made.title + ' cleared. +' + made.reward + ' miles.');
      else addMiles(12, 'Not quite. The road still teaches you something. +12 miles.');
      beep(ok ? 700 : 300, 0.1, 0.05);
    };
  }

  function boot() {
    catchUp();
    paint();
    const tap = $('#jTap');
    if (tap) tap.addEventListener('click', onTap);
    const ups = $('#jUpgrades');
    if (ups) ups.addEventListener('click', e => {
      const b = e.target.closest('[data-ride]');
      if (!b || b.disabled) return;
      buy(+b.dataset.ride);
    });
    const travelBtn = $('#jTravel');
    if (travelBtn) travelBtn.addEventListener('click', travel);
    const ch = $('#jChallenge');
    if (ch) ch.addEventListener('click', openChallenge);
    const open = $('#jOpen');
    if (open) open.addEventListener('click', () => { if (window.__pack && window.__pack.open) window.__pack.open(); });
    const mute = $('#jMute');
    if (mute) mute.addEventListener('click', () => {
      localStorage.setItem('st365_mute', muted() ? '0' : '1');
      paint();
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') catchUp(); else state.last = Date.now(); });
    setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      tickFocused(1);
      state.last = Date.now();
      if (!state._saved || Date.now() - state._saved > 4000) {
        state._saved = Date.now();
        persist();
      }
    }, 1000);
  }

  window.Journey = {
    load(data) {
      if (!data || typeof data !== 'object') return;
      state = Object.assign(blank(), data);
      paint();
    },
    snapshot() { return state; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
