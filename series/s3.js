/* Series 03 — Fridge magnets.
   Cover art is img/cards/s3-NN.svg (see tools/build-later-series.mjs). */
(() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = n => String(n).padStart(2, '0');
  const MARK = { common: '●', uncommon: '◆', rare: '★', ultra: '✦', mythic: '✶' };
  const RANK = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', ultra: 'Ultra Rare', mythic: 'Mythic' };
  const CARDS = [
    { no: 1, rarity: 'mythic', name: 'Aurora Fridge Magnet', country: 'Arctic Europe', type: 'Arctic', why: 'The sky you stick on the fridge and still miss.', when: 'December–March', budget: '£100–160', from: 'LHR', to: 'TOS' },
    { no: 2, rarity: 'ultra', name: 'Eiffel Dusk Magnet', country: 'France', type: 'City', why: 'Iron lace and a city going gold.', when: 'April–June and September', budget: '£90–150', from: 'LHR', to: 'CDG' },
    { no: 3, rarity: 'ultra', name: 'Colosseum Arch Magnet', country: 'Italy', type: 'Culture', why: 'Stone arches that have outlasted the queue.', when: 'April–June and October', budget: '£70–120', from: 'LHR', to: 'FCO' },
    { no: 4, rarity: 'rare', name: 'Big Ben Rain Magnet', country: 'England', type: 'City', why: 'The clock, the river, and a coat you needed.', when: 'Any month, bring a layer', budget: '£40–80', from: 'LHR', to: 'LHR' },
    { no: 5, rarity: 'rare', name: 'Sydney Shell Magnet', country: 'Australia', type: 'Coast', why: 'White shells on a harbour that keeps moving.', when: 'September–November', budget: '£70–120', from: 'LHR', to: 'SYD' },
    { no: 6, rarity: 'rare', name: 'Sagrada Colour Magnet', country: 'Spain', type: 'Culture', why: 'A building that is still becoming itself.', when: 'May–June and September', budget: '£70–120', from: 'LHR', to: 'BCN' },
    { no: 7, rarity: 'rare', name: 'Neuschwanstein Magnet', country: 'Germany', type: 'Mountains', why: 'A castle that looks borrowed from a story.', when: 'May–September', budget: '£70–120', from: 'LHR', to: 'MUC' },
    { no: 8, rarity: 'rare', name: 'Moai Coast Magnet', country: 'Chile', type: 'Island', why: 'Stone faces and a very long Pacific.', when: 'October–April', budget: '£50–90', from: 'LHR', to: 'IPC' },
    { no: 9, rarity: 'rare', name: 'Christ Ridge Magnet', country: 'Brazil', type: 'City', why: 'Arms open over a city that does not sit still.', when: 'May–September', budget: '£40–80', from: 'LHR', to: 'GIG' },
    { no: 10, rarity: 'uncommon', name: 'Canal House Magnet', country: 'Netherlands', type: 'City', why: 'A skinny house and a bike that is not yours.', when: 'April–September', budget: '£80–130', from: 'LHR', to: 'AMS' },
    { no: 11, rarity: 'uncommon', name: 'Fjords Cabin Magnet', country: 'Norway', type: 'Mountains', why: 'Red wood, dark water, a peak behind.', when: 'June–September', budget: '£120–180', from: 'LHR', to: 'BGO' },
    { no: 12, rarity: 'uncommon', name: 'Souk Lamp Magnet', country: 'Morocco', type: 'City', why: 'Brass light in a lane that turns twice.', when: 'March–May and October', budget: '£35–60', from: 'LHR', to: 'RAK' },
    { no: 13, rarity: 'uncommon', name: 'Torii Gate Magnet', country: 'Japan', type: 'Culture', why: 'One gate, then water, then another gate.', when: 'March–May and October', budget: '£70–120', from: 'LHR', to: 'ITM' },
    { no: 14, rarity: 'uncommon', name: 'Tulip Field Magnet', country: 'Netherlands', type: 'Season', why: 'Stripes of colour that only last a minute.', when: 'April', budget: '£80–130', from: 'LHR', to: 'AMS' },
    { no: 15, rarity: 'uncommon', name: 'Safari Truck Magnet', country: 'Kenya', type: 'Wildlife', why: 'Dust, acacia, and an early start.', when: 'The dry months', budget: '£80–150', from: 'LHR', to: 'NBO' },
    { no: 16, rarity: 'uncommon', name: 'Glacier Blue Magnet', country: 'Iceland', type: 'Ice', why: 'Ice the colour of a held breath.', when: 'June–August or winter dark', budget: '£90–150', from: 'LHR', to: 'KEF' },
    { no: 17, rarity: 'uncommon', name: 'Rice Terrace Magnet', country: 'Vietnam', type: 'Mountains', why: 'Steps of green that follow the hill.', when: 'September–November', budget: '£25–50', from: 'LHR', to: 'HAN' },
    { no: 18, rarity: 'uncommon', name: 'Tram Climb Magnet', country: 'Portugal', type: 'City', why: 'A yellow tram and a hill that wins.', when: 'March–June and September', budget: '£55–90', from: 'LHR', to: 'LIS' },
    { no: 19, rarity: 'uncommon', name: 'Desert Camp Magnet', country: 'Jordan', type: 'Desert', why: 'A tent, a fire, and more stars than seats.', when: 'March–May and September', budget: '£40–70', from: 'LHR', to: 'AMM' },
    { no: 20, rarity: 'uncommon', name: 'Harbour Crane Magnet', country: 'Iceland', type: 'Coast', why: 'Painted metal and a low sun on the water.', when: 'June–August', budget: '£90–150', from: 'LHR', to: 'KEF' },
    { no: 21, rarity: 'common', name: 'Red Bus Magnet', country: 'England', type: 'City', why: 'The upstairs seat, if you get it.', when: 'Any month', budget: '£30–60', from: 'LHR', to: 'LHR' },
    { no: 22, rarity: 'common', name: 'Gondola Bow Magnet', country: 'Italy', type: 'City', why: 'A curve of black wood on green water.', when: 'April–October', budget: '£90–150', from: 'LHR', to: 'VCE' },
    { no: 23, rarity: 'common', name: 'Windmill Magnet', country: 'Netherlands', type: 'Country', why: 'Four sails and a very flat horizon.', when: 'April–September', budget: '£70–120', from: 'LHR', to: 'AMS' },
    { no: 24, rarity: 'common', name: 'Cable Car Magnet', country: 'Switzerland', type: 'Mountains', why: 'A box of glass going up into the white.', when: 'June–September', budget: '£140–220', from: 'LHR', to: 'ZRH' },
    { no: 25, rarity: 'common', name: 'Market Spice Magnet', country: 'India', type: 'City', why: 'Colour in piles, and a city that starts loud.', when: 'November–February', budget: '£25–50', from: 'LHR', to: 'DEL' },
    { no: 26, rarity: 'common', name: 'Longtail Bow Magnet', country: 'Thailand', type: 'Island', why: 'A ribbon on the prow and warm water.', when: 'November–March', budget: '£30–55', from: 'LHR', to: 'HKT' },
    { no: 27, rarity: 'common', name: 'Volcano Rim Magnet', country: 'Italy', type: 'Mountains', why: 'A path on the edge and a view that smokes.', when: 'April–June and September', budget: '£60–100', from: 'LHR', to: 'NAP' },
    { no: 28, rarity: 'common', name: 'Lighthouse Magnet', country: 'Scotland', type: 'Coast', why: 'White tower, black rock, weather on the way.', when: 'May–September', budget: '£70–110', from: 'LHR', to: 'INV' },
    { no: 29, rarity: 'common', name: 'Night Market Magnet', country: 'Taiwan', type: 'City', why: 'Steam, stools, and a street that feeds you.', when: 'October–April', budget: '£40–70', from: 'LHR', to: 'TPE' },
    { no: 30, rarity: 'common', name: 'Olive Grove Magnet', country: 'Greece', type: 'Country', why: 'Silver leaves and a hill you walk slowly.', when: 'May–June and September', budget: '£50–90', from: 'LHR', to: 'ATH' },
    { no: 31, rarity: 'common', name: 'Funicular Magnet', country: 'Chile', type: 'City', why: 'A box that climbs a painted hill.', when: 'October–April', budget: '£35–60', from: 'LHR', to: 'SCL' },
    { no: 32, rarity: 'common', name: 'Tea Hill Magnet', country: 'Sri Lanka', type: 'Mountains', why: 'Green clipped into the shape of the slope.', when: 'December–March', budget: '£25–50', from: 'LHR', to: 'CMB' },
    { no: 33, rarity: 'common', name: 'Ice Hotel Magnet', country: 'Sweden', type: 'Ice', why: 'A room that exists until spring.', when: 'December–March', budget: '£100–180', from: 'LHR', to: 'KRN' },
    { no: 34, rarity: 'common', name: 'Coral Garden Magnet', country: 'Maldives', type: 'Reef', why: 'Colour under a very clear roof of water.', when: 'December–April', budget: '£80–150', from: 'LHR', to: 'MLE' },
    { no: 35, rarity: 'common', name: 'Castle Walk Magnet', country: 'Wales', type: 'Mountains', why: 'Stone on a ridge and a long view west.', when: 'May–September', budget: '£50–90', from: 'LHR', to: 'CWL' },
    { no: 36, rarity: 'common', name: 'Bazaar Arch Magnet', country: 'Turkey', type: 'City', why: 'Lamps, brass, and a lane that folds back.', when: 'April–June and September', budget: '£40–70', from: 'LHR', to: 'IST' },
    { no: 37, rarity: 'common', name: 'Alpine Lake Magnet', country: 'Italy', type: 'Mountains', why: 'Boats the colour of the shutters.', when: 'June–September', budget: '£80–140', from: 'LHR', to: 'MXP' },
    { no: 38, rarity: 'common', name: 'Street Art Magnet', country: 'Germany', type: 'City', why: 'A wall that changed its mind.', when: 'May–September', budget: '£60–100', from: 'LHR', to: 'BER' },
    { no: 39, rarity: 'common', name: 'Fishing Boat Magnet', country: 'Greece', type: 'Coast', why: 'Blue hull, white wake, nowhere urgent.', when: 'May–September', budget: '£50–90', from: 'LHR', to: 'JTR' },
    { no: 40, rarity: 'common', name: 'Cabin Porch Magnet', country: 'Canada', type: 'Mountains', why: 'A chair, a lake, and no agenda.', when: 'June–September', budget: '£80–140', from: 'LHR', to: 'YVR' }
  ];
  CARDS.forEach(c => { c.cid = 's3-' + num(c.no); });
  const artUri = c => 'img/cards/s3-' + num(c.no) + '.svg';
  const watch = () => 'https://www.youtube.com/@Solotravel_365/shorts';
  function renderCard(c, ctx) {
    const klass = (ctx && ctx.className) || RANK[c.rarity] || c.rarity;
    const total = (ctx && ctx.total) || CARDS.length;
    const face = magnetFace(c, klass, total);
    return `<article class="tcard theme-magnet tier-${c.rarity}" data-cid="${c.cid}" style="--rx:0deg;--ry:0deg">
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
      return `<button type="button" class="shelf-card theme-magnet tier-${c.rarity} is-locked" data-cid="${c.cid}" aria-label="Locked card ${num(c.no)}, ${esc(RANK[c.rarity] || c.rarity)}">
        <span class="spine"><span class="spine-art"></span><span class="spine-meta"><b>Locked</b><small>${MARK[c.rarity] || '●'} ${esc(RANK[c.rarity] || '')}</small><small>${num(c.no)}</small></span></span>
      </button>`;
    }
    return `<button type="button" class="shelf-card theme-magnet tier-${c.rarity} is-owned" data-cid="${c.cid}" aria-label="${esc(c.name)}, ${esc(klass)}">
      <span class="spine"><span class="spine-art" style="background-image:url(${artUri(c)})"></span><span class="spine-meta"><b>${esc(c.name)}</b><small>${MARK[c.rarity] || '●'} ${esc(RANK[c.rarity] || klass)}</small><small>${num(c.no)}</small></span></span>
    </button>`;
  }
  window.SERIES = window.SERIES || [];
  window.SERIES.push({
    id: 's3',
    number: 3,
    name: 'Series 03',
    themeName: 'Fridge magnets',
    theme: 'magnet',
    status: 'live',
    size: 40,
    classes: {
      common: 'Souvenir',
      uncommon: 'Enamel',
      rare: 'Collector',
      ultra: 'Limited run',
      mythic: 'Aurora Magnet'
    },
    mythicPrize: 'Mythic prize: coming soon',
    cards: CARDS,
    artUri,
    renderCard,
    renderShelf
  });
})();
