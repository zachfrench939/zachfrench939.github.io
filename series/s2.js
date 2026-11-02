/* Series 02 — Passport.
   Cover art is img/cards/s2-NN.svg (see tools/build-later-series.mjs). */
(() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = n => String(n).padStart(2, '0');
  const MARK = { common: '●', uncommon: '◆', rare: '★', ultra: '✦', mythic: '✶' };
  const RANK = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', ultra: 'Ultra Rare', mythic: 'Mythic' };
  const CARDS = [
    { no: 1, rarity: 'mythic', name: 'Venice Night Landing', country: 'Italy', type: 'City', why: 'A stamp that looks painted on.', when: 'April–June and October', budget: '£90–150', from: 'LHR', to: 'VCE' },
    { no: 2, rarity: 'ultra', name: 'Tokyo Rain Crossing', country: 'Japan', type: 'City', why: 'Neon on wet pavement, and a quiet train home.', when: 'March–May and October', budget: '£80–140', from: 'LHR', to: 'HND' },
    { no: 3, rarity: 'ultra', name: 'New York Brownstones', country: 'USA', type: 'City', why: 'Stoops, steam, and a long walk uptown.', when: 'April–June and September', budget: '£120–200', from: 'LHR', to: 'JFK' },
    { no: 4, rarity: 'rare', name: 'Prague River Bridges', country: 'Czechia', type: 'City', why: 'Stone arches and a castle that stays in the sky.', when: 'May–June and September', budget: '£45–80', from: 'LHR', to: 'PRG' },
    { no: 5, rarity: 'rare', name: 'Istanbul Ferry Dawn', country: 'Türkiye', type: 'City', why: 'Tea, gulls, and two continents before breakfast.', when: 'April–June and September', budget: '£40–70', from: 'LHR', to: 'IST' },
    { no: 6, rarity: 'rare', name: 'Seoul Palace Light', country: 'South Korea', type: 'City', why: 'Gates, pines, and a city that starts early.', when: 'March–May and October', budget: '£60–110', from: 'LHR', to: 'ICN' },
    { no: 7, rarity: 'rare', name: 'Mexico City Colour', country: 'Mexico', type: 'City', why: 'Murals, markets, and a park bigger than you expect.', when: 'November–April', budget: '£35–65', from: 'LHR', to: 'MEX' },
    { no: 8, rarity: 'rare', name: 'Budapest Chain Bridge', country: 'Hungary', type: 'City', why: 'The river does the lighting after dark.', when: 'May–September', budget: '£40–70', from: 'LHR', to: 'BUD' },
    { no: 9, rarity: 'rare', name: 'Havana Malecón', country: 'Cuba', type: 'Coast', why: 'Salt air, old cars, and a wall against the sea.', when: 'November–April', budget: '£40–75', from: 'LHR', to: 'HAV' },
    { no: 10, rarity: 'uncommon', name: 'Vienna Coffee Hour', country: 'Austria', type: 'City', why: 'A marble table and nowhere else to be.', when: 'April–June and September', budget: '£70–120', from: 'LHR', to: 'VIE' },
    { no: 11, rarity: 'uncommon', name: 'Amsterdam Canals', country: 'Netherlands', type: 'City', why: 'Bikes, bridges, and brick that goes on.', when: 'April–June and September', budget: '£80–130', from: 'LHR', to: 'AMS' },
    { no: 12, rarity: 'uncommon', name: 'Barcelona Tiles', country: 'Spain', type: 'City', why: 'Colour on the walls and the sea at the end of the street.', when: 'May–June and September', budget: '£70–120', from: 'LHR', to: 'BCN' },
    { no: 13, rarity: 'uncommon', name: 'Copenhagen Harbour', country: 'Denmark', type: 'Coast', why: 'Clean light and a swim off the steps.', when: 'May–August', budget: '£90–150', from: 'LHR', to: 'CPH' },
    { no: 14, rarity: 'uncommon', name: 'Dublin Painted Doors', country: 'Ireland', type: 'City', why: 'A walk that keeps finding another colour.', when: 'May–September', budget: '£70–120', from: 'LHR', to: 'DUB' },
    { no: 15, rarity: 'uncommon', name: 'Porto River Tiles', country: 'Portugal', type: 'City', why: 'Azulejos, a steep hill, and port after.', when: 'March–June and September', budget: '£50–90', from: 'LHR', to: 'OPO' },
    { no: 16, rarity: 'uncommon', name: 'Athens Acropolis Hour', country: 'Greece', type: 'Culture', why: 'Stone in the last light, city underneath.', when: 'April–June and September', budget: '£55–95', from: 'LHR', to: 'ATH' },
    { no: 17, rarity: 'uncommon', name: 'Bruges Canals', country: 'Belgium', type: 'City', why: 'Bells, still water, and a town that fits in a day.', when: 'April–June and September', budget: '£70–110', from: 'LHR', to: 'BRU' },
    { no: 18, rarity: 'uncommon', name: 'Quebec Winter Stairs', country: 'Canada', type: 'City', why: 'Snow on stone and a café that knows.', when: 'December–March', budget: '£70–120', from: 'LHR', to: 'YQB' },
    { no: 19, rarity: 'uncommon', name: 'Valparaíso Hills', country: 'Chile', type: 'City', why: 'Houses stacked in paint up a cliff.', when: 'October–April', budget: '£35–60', from: 'LHR', to: 'SCL' },
    { no: 20, rarity: 'uncommon', name: 'Oaxaca Courtyards', country: 'Mexico', type: 'Culture', why: 'Markets, mole, and courtyards that stay cool.', when: 'October–March', budget: '£30–55', from: 'LHR', to: 'OAX' },
    { no: 21, rarity: 'common', name: 'Tallinn Old Town', country: 'Estonia', type: 'City', why: 'Towers, cobbles, and a short flight from home.', when: 'May–September', budget: '£45–80', from: 'LHR', to: 'TLL' },
    { no: 22, rarity: 'common', name: 'Riga Facades', country: 'Latvia', type: 'City', why: 'Faces on the buildings if you look up.', when: 'May–September', budget: '£40–75', from: 'LHR', to: 'RIX' },
    { no: 23, rarity: 'common', name: 'Vilnius Hill Lanes', country: 'Lithuania', type: 'City', why: 'A university town that still feels small.', when: 'May–September', budget: '£40–70', from: 'LHR', to: 'VNO' },
    { no: 24, rarity: 'common', name: 'Tbilisi Balconies', country: 'Georgia', type: 'City', why: 'Wood balconies over a river that cuts the city.', when: 'April–June and September', budget: '£30–55', from: 'LHR', to: 'TBS' },
    { no: 25, rarity: 'common', name: 'Yerevan Pink Stone', country: 'Armenia', type: 'City', why: 'The buildings hold the sunset longer than the sky.', when: 'May–June and September', budget: '£30–55', from: 'LHR', to: 'EVN' },
    { no: 26, rarity: 'common', name: 'Baku Old Walls', country: 'Azerbaijan', type: 'City', why: 'Old city walls and a wind off the Caspian.', when: 'April–June and September', budget: '£35–65', from: 'LHR', to: 'GYD' },
    { no: 27, rarity: 'common', name: 'Samarkand Blue Dome', country: 'Uzbekistan', type: 'Culture', why: 'Blue domes in a square that has seen centuries.', when: 'April–June and September', budget: '£25–45', from: 'LHR', to: 'SKD' },
    { no: 28, rarity: 'common', name: 'Luang Prabang Dawn', country: 'Laos', type: 'Culture', why: 'Monks, mist, and a river before the heat.', when: 'November–February', budget: '£25–45', from: 'LHR', to: 'LPQ' },
    { no: 29, rarity: 'common', name: 'Hoi An Lanterns', country: 'Vietnam', type: 'City', why: 'A yellow town that turns the river into lights.', when: 'February–April', budget: '£25–45', from: 'LHR', to: 'DAD' },
    { no: 30, rarity: 'common', name: 'Penang Shop Houses', country: 'Malaysia', type: 'City', why: 'Shop houses and a table that never really closes.', when: 'December–February', budget: '£25–45', from: 'LHR', to: 'PEN' },
    { no: 31, rarity: 'common', name: 'Colombo Coast Line', country: 'Sri Lanka', type: 'Coast', why: 'The railway that runs between the sea and the tea.', when: 'December–March', budget: '£25–50', from: 'LHR', to: 'CMB' },
    { no: 32, rarity: 'common', name: 'Zanzibar Stone Door', country: 'Tanzania', type: 'Island', why: 'Carved wood, coral stone, and a warm sea.', when: 'June–October', budget: '£40–70', from: 'LHR', to: 'ZNZ' },
    { no: 33, rarity: 'common', name: 'Chefchaouen Blue', country: 'Morocco', type: 'City', why: 'A town that decided on one colour and kept it.', when: 'March–May and September', budget: '£30–55', from: 'LHR', to: 'TNG' },
    { no: 34, rarity: 'common', name: 'Valletta Limestone', country: 'Malta', type: 'City', why: 'Golden stone and a harbour on both sides.', when: 'April–June and September', budget: '£55–95', from: 'LHR', to: 'MLA' },
    { no: 35, rarity: 'common', name: 'Kotor Bay Walls', country: 'Montenegro', type: 'Coast', why: 'A deep bay and walls you can walk.', when: 'May–June and September', budget: '£40–70', from: 'LHR', to: 'TIV' },
    { no: 36, rarity: 'common', name: 'Mostar Old Bridge', country: 'Bosnia', type: 'Culture', why: 'One arch, green water, and a town rebuilt in stone.', when: 'May–September', budget: '£30–55', from: 'LHR', to: 'SJJ' },
    { no: 37, rarity: 'common', name: 'Český Krumlov Bend', country: 'Czechia', type: 'City', why: 'A river loop and a castle you keep seeing.', when: 'May–September', budget: '£40–70', from: 'LHR', to: 'PRG' },
    { no: 38, rarity: 'common', name: 'Hallstatt Mirror', country: 'Austria', type: 'Mountains', why: 'A village that sits in its own reflection.', when: 'May–June and September', budget: '£80–130', from: 'LHR', to: 'SZG' },
    { no: 39, rarity: 'common', name: 'Sintra Hill Palaces', country: 'Portugal', type: 'Culture', why: 'Colour on a hill, fog in the trees.', when: 'April–June and September', budget: '£55–95', from: 'LHR', to: 'LIS' },
    { no: 40, rarity: 'common', name: 'Essaouira Ramparts', country: 'Morocco', type: 'Coast', why: 'Blue boats, a wind, and a wall you can walk.', when: 'April–June and September', budget: '£30–55', from: 'LHR', to: 'RAK' }
  ];
  CARDS.forEach(c => { c.cid = 's2-' + num(c.no); });
  const artUri = c => 'img/cards/s2-' + num(c.no) + '.svg';
  const watch = () => 'https://www.youtube.com/@Solotravel_365/shorts';
  function renderCard(c, ctx) {
    const klass = (ctx && ctx.className) || RANK[c.rarity] || c.rarity;
    const total = (ctx && ctx.total) || CARDS.length;
    const face = passportFace(c, klass, total);
    return `<article class="tcard theme-passport tier-${c.rarity}" data-cid="${c.cid}" style="--rx:0deg;--ry:0deg">
      <div class="tcard-inner">
        <div class="tcard-back">
          <p class="pass-k">${esc(c.country)} · ${esc(c.type)}</p>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.why)}</p>
          <p class="pass-k">Best time</p><p>${esc(c.when)}</p>
          <p class="pass-k">Rough daily budget</p><p>${esc(c.budget)}</p>
          <a class="btn" href="${watch()}" target="_blank" rel="noopener">Watch the channel</a>
        </div>
        ${face}
      </div>
    </article>`;
  }
  function passportFace(c, klass, total) {
    const mrz = ('P<ST365' + c.name.toUpperCase().replace(/[^A-Z]+/g, '<')).slice(0, 28);
    return `<div class="tcard-face">
      <header><span>Solo Travel 365</span><b>Passport</b></header>
      <p class="rarity-badge"><span aria-hidden="true">${MARK[c.rarity] || '●'}</span> ${esc(RANK[c.rarity] || c.rarity)}</p>
      <div class="pp-photo"><img src="${artUri(c)}" alt="" width="800" height="500"></div>
      <h3 class="pp-name">${esc(c.name)}</h3>
      <p class="pp-sub">${esc(c.country)} · ${esc(c.type)}</p>
      <p class="pp-class">${esc(klass)} · ${num(c.no)}/${total}</p>
      <p class="pp-mrz">${esc(mrz)}<<<</p>
      <span class="pp-stamp" aria-hidden="true">${esc(klass)}</span>
    </div>`;
  }
  function magnetFace(c, klass, total) {
    return `<div class="tcard-face">
      <div class="mag-art"><img src="${artUri(c)}" alt="" width="640" height="640"></div>
      <p class="rarity-badge"><span aria-hidden="true">${MARK[c.rarity] || '●'}</span> ${esc(RANK[c.rarity] || c.rarity)}</p>
      <h3 class="mag-name">${esc(c.name)}</h3>
      <p>${esc(c.country)} · ${esc(klass)}</p>
      <span>${num(c.no)} / ${total} · Solo Travel 365</span>
    </div>`;
  }
  function renderShelf(c, owned, ctx) {
    const klass = (ctx && ctx.className) || '';
    if (!owned) {
      return `<button type="button" class="shelf-card theme-passport tier-${c.rarity} is-locked" data-cid="${c.cid}" aria-label="Locked card ${num(c.no)}, ${esc(RANK[c.rarity] || c.rarity)}">
        <span class="spine"><span class="spine-art"></span><span class="spine-meta"><b>Locked</b><small>${MARK[c.rarity] || '●'} ${esc(RANK[c.rarity] || '')}</small><small>${num(c.no)}</small></span></span>
      </button>`;
    }
    return `<button type="button" class="shelf-card theme-passport tier-${c.rarity} is-owned" data-cid="${c.cid}" aria-label="${esc(c.name)}, ${esc(klass)}">
      <span class="spine"><span class="spine-art" style="background-image:url(${artUri(c)})"></span><span class="spine-meta"><b>${esc(c.name)}</b><small>${MARK[c.rarity] || '●'} ${esc(RANK[c.rarity] || klass)}</small><small>${num(c.no)}</small></span></span>
    </button>`;
  }
  window.SERIES = window.SERIES || [];
  window.SERIES.push({
    id: 's2',
    number: 2,
    name: 'Series 02',
    themeName: 'Passport',
    theme: 'passport',
    status: 'live',
    size: 40,
    classes: {
      common: 'Visitor',
      uncommon: 'Visa',
      rare: 'Diplomatic',
      ultra: 'Black Visa',
      mythic: 'Golden Eagle'
    },
    mythicPrize: 'Mythic prize: coming soon',
    cards: CARDS,
    artUri,
    renderCard,
    renderShelf
  });
})();
