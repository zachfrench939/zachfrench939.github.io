/* Series 01 — vintage boarding passes.
   Add a card by copying a row. videoId is the YouTube id (blank links the channel).
   kind: "short" or "video". art: [motif, sky, sky2, land, sea, accent].
   Motifs: cliffs dunes aurora peaks canopy reef terraces city balloon coast boat
   market rail road ice lanterns lake salt plain facade. */
(() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = n => String(n).padStart(2, '0');
  const CARDS = [
    { no: 1, rarity: 'mythic', name: 'Positano Cliffside', country: 'Italy', type: 'Coast', videoId: '6pF15VIiB8Y', kind: 'short', title: 'positano at golden hour hits different', why: 'Pastel cliffs that glow at golden hour.', when: 'April–June and September', budget: '£110–170', from: 'LHR', to: 'NAP', dos: ['Walk the cliff path', 'Stay for the last light'], art: ['cliffs', '#f6c98a', '#e27a3a', '#d85a4a', '#3d6f8f', '#fff4df'] },
    { no: 2, rarity: 'ultra', name: 'Northern Lights Chase', country: 'Arctic Europe', type: 'Arctic', videoId: 'xndt8ebd04M', kind: 'short', title: '4 Places to See the Northern Lights in Europe This Winter', why: 'A winter sky worth losing sleep for.', when: 'December–March', budget: '£100–160', from: 'LHR', to: 'TOS', dos: ['Get away from town lights', 'Stay up past midnight'], art: ['aurora', '#071427', '#123a4a', '#0c1c18', '#1d6b4a', '#b6ff9a'] },
    { no: 3, rarity: 'ultra', name: 'Sahara Camel Trek', country: 'Morocco', type: 'Desert', videoId: 'yC_5FU0fVHs', kind: 'short', title: 'do it. go as far as you can', why: 'Dunes, then more stars than you packed for.', when: 'October–April', budget: '£35–60', from: 'LHR', to: 'RAK', dos: ['Ride out before sunset', 'Sleep in the dunes'], art: ['dunes', '#f0a35a', '#c45b3e', '#e6b15a', '#7a3b2e', '#ffe7b0'] },
    { no: 4, rarity: 'rare', name: 'Dolomite Hidden Lake', country: 'Italy', type: 'Mountains', videoId: 'leFPo_T6hhU', kind: 'short', title: '5 Hidden Spots in the Dolomites Most People Miss', why: 'A lake the bus tours never reach.', when: 'June–September', budget: '£90–140', from: 'LHR', to: 'VRN', dos: ['Take the quieter trail', 'Stay until the peaks go pink'], art: ['peaks', '#9fd0ea', '#e8f4fb', '#8ea4b3', '#3f7ea1', '#fff'] },
    { no: 5, rarity: 'rare', name: 'Amalfi Coast Road', country: 'Italy', type: 'Coast', videoId: 'bGaxF4qm52Q', kind: 'short', title: '2 Week Europe Itinerary: London to the Amalfi Coast', why: 'Two weeks from the city to the cliffs.', when: 'May–June and September', budget: '£90–150', from: 'LHR', to: 'NAP', dos: ['Ride the coast road', 'Stop where the light turns gold'], art: ['coast', '#8ec8e8', '#f2d7a2', '#d86b4a', '#1f6f8a', '#fff6df'] },
    { no: 6, rarity: 'rare', name: 'Cappadocia Balloon Dawn', country: 'Türkiye', type: 'Desert', videoId: 'GAOQ-ainiDA', kind: 'short', title: 'woke up at 4am for this in cappadocia', why: 'Worth the 4am alarm.', when: 'April–June and September', budget: '£45–80', from: 'LHR', to: 'ASR', dos: ['Set the alarm for 4am', 'Watch the valley fill with balloons'], art: ['balloon', '#f3b183', '#f6d7b0', '#c9846a', '#8d5a6a', '#ffe9c4'] },
    { no: 7, rarity: 'rare', name: 'Lofoten Fjord Trip', country: 'Norway', type: 'Mountains', videoId: 'lCGpA713IwQ', kind: 'short', title: 'top 5 trips you cannot miss in norway', why: 'Red cabins under peaks that rise from the sea.', when: 'June–September', budget: '£120–180', from: 'LHR', to: 'EVE', dos: ['Watch the light move on the peaks', 'Stay in a cabin by the water'], art: ['peaks', '#6ea0c4', '#d5e4ef', '#3e5c4e', '#1d4e68', '#f4f7fb'] },
    { no: 8, rarity: 'rare', name: 'Amazon Canopy Walk', country: 'Brazil', type: 'Jungle', videoId: 'tbWId8Hk1Sk', kind: 'short', title: "The Amazon Rainforest Like You've Never Seen It", why: 'Green above you, river below.', when: 'June–September', budget: '£50–90', from: 'LHR', to: 'MAO', dos: ['Be on the water at dawn', 'Walk a canopy bridge'], art: ['canopy', '#163c28', '#2f6b3a', '#0e2a18', '#1d4d3a', '#d6f5a3'] },
    { no: 9, rarity: 'rare', name: 'Daintree Rainforest', country: 'Australia', type: 'Jungle', videoId: 'GVDQUI_M5UE', kind: 'short', title: 'Oh, So You Like Green? Daintree Rainforest & Lush Places', why: 'Green so thick it barely looks real.', when: 'May–September', budget: '£70–120', from: 'LHR', to: 'CNS', dos: ['Walk a boardwalk at dawn', 'Look up, not just ahead'], art: ['canopy', '#11402c', '#3e8f55', '#0c2416', '#1a5c40', '#e7ffb0'] },
    { no: 10, rarity: 'uncommon', name: 'Christmas Market Stroll', country: 'Europe', type: 'City', videoId: '6oLT68G4bZU', kind: 'short', title: "Top 5 Christmas Markets in Europe You Can't Miss", why: 'Stalls, lights, and a mug that warms your hands.', when: 'Late November–December', budget: '£80–140', from: 'LHR', to: 'VIE', dos: ['Go after dark', 'Wander between the stalls'], art: ['market', '#1b2744', '#3a2a38', '#6b1d2a', '#c9a15a', '#ffd978'] },
    { no: 11, rarity: 'uncommon', name: 'Tenerife Winter Sun', country: 'Spain', type: 'Island', videoId: 'TSaO4o9Hwhk', kind: 'short', title: 'Tenerife in November: Winter Sun in the Canary Islands', why: 'Warm coast, a short flight from the UK.', when: 'November–March', budget: '£60–100', from: 'LHR', to: 'TFS', dos: ['Walk the coast', 'Ride up to the volcanic parks'], art: ['coast', '#7ec8ea', '#f6e3b0', '#2f6f4a', '#1a6f93', '#fff'] },
    { no: 12, rarity: 'uncommon', name: 'Bali Rice Terraces', country: 'Indonesia', type: 'Island', videoId: 'zzaxRp9UsPs', kind: 'short', title: 'Bali Rice Terraces & Waterfalls You Need to See', why: 'Terraces first, waterfall after.', when: 'April–June and September', budget: '£30–55', from: 'LHR', to: 'DPS', dos: ['Walk the terraces early', 'Cool off at a waterfall'], art: ['terraces', '#b7d98a', '#e7f2c4', '#3f7a32', '#2f6a4a', '#fff8d8'] },
    { no: 13, rarity: 'uncommon', name: 'Andalucía White Villages', country: 'Spain', type: 'City', videoId: 'RtqLmOsaA6E', kind: 'short', title: "5 Places You Can't Miss in Andalucía, Spain", why: 'White walls, cliff paths, and late tapas.', when: 'March–June and September', budget: '£55–90', from: 'LHR', to: 'AGP', dos: ['Wander a white village', 'Eat late and walk it off'], art: ['city', '#9fd4ef', '#f7f1e4', '#f4f7fb', '#d08a4a', '#fff'] },
    { no: 14, rarity: 'uncommon', name: 'Swiss Alps Ridge', country: 'Switzerland', type: 'Mountains', videoId: 'H9APzkdPPn4', kind: 'short', title: 'swiss alps', why: 'High, bright, and quieter than the brochure.', when: 'June–September', budget: '£140–220', from: 'LHR', to: 'ZRH', dos: ['Ride up and walk the ridge', 'Stay for the late light'], art: ['peaks', '#7eb6e0', '#f4fbff', '#d5dde6', '#4d7594', '#fff'] },
    { no: 15, rarity: 'uncommon', name: 'Safari Dawn Drive', country: 'East Africa', type: 'Wildlife', videoId: '0XHZqT9axpE', kind: 'short', title: 'top 5 cheapest safaris in the world (part 2)', why: 'Out at first light, camera ready.', when: 'The local dry season', budget: '£80–150', from: 'LHR', to: 'NBO', dos: ['Book the dawn drive', 'Keep the lens cap off'], art: ['plain', '#f2b15a', '#f6d59a', '#c47a32', '#6b4a28', '#ffe7b8'] },
    { no: 16, rarity: 'uncommon', name: 'October Colour Hunt', country: 'Worldwide', type: 'Season', videoId: 'wnWW6ZbRaYU', kind: 'short', title: 'Places That Look Best in October (Autumn Bucket List)', why: 'The month the trees do the decorating.', when: 'October', budget: '£70–120', from: 'LHR', to: 'YUL', dos: ['Chase the colour', 'Shoot in late afternoon'], art: ['peaks', '#e7a15a', '#f3d2a4', '#a33b24', '#6e4428', '#ffe1a8'] },
    { no: 17, rarity: 'uncommon', name: 'January Sun Escape', country: 'Worldwide', type: 'Coast', videoId: 'r1t4Z4x1VTc', kind: 'short', title: "Where's Actually Warm in January from the UK", why: 'Leave the grey month behind.', when: 'January', budget: '£60–110', from: 'LHR', to: 'CUN', dos: ['Pick a coast that stays warm', 'Keep the days slow'], art: ['coast', '#5eb0d8', '#f6e7c0', '#e0b15a', '#147ea0', '#fff'] },
    { no: 18, rarity: 'uncommon', name: 'Thailand Longtail', country: 'Thailand', type: 'Island', videoId: 'adj82M1nwnI', kind: 'short', title: 'thailand by longtail boat', why: 'A longtail, warm water, nowhere to be.', when: 'November–March', budget: '£30–55', from: 'LHR', to: 'HKT', dos: ['Take a longtail at dusk', 'Swim where the boat stops'], art: ['boat', '#f0a06a', '#f6d2a4', '#1f6f62', '#0e4e68', '#fff4df'] },
    { no: 19, rarity: 'uncommon', name: 'Kraków Old Town', country: 'Poland', type: 'City', videoId: 'OBMhUd8vorU', kind: 'video', title: '3 Days in Kraków Solo for Under £200 (Flights Included)', why: 'A solo weekend that stays on a shoestring.', when: 'May–September', budget: '£40–70', from: 'LHR', to: 'KRK', dos: ['Walk the square at dusk', 'Cross the river for the view'], art: ['city', '#c9b7d4', '#efe6d6', '#6d2430', '#d8c4a0', '#fff8ee'] },
    { no: 20, rarity: 'uncommon', name: 'Cairns Reef Day', country: 'Australia', type: 'Reef', videoId: 'VOT7Cx6sfgA', kind: 'video', title: 'Cairns Australia Itinerary: 10 Days (From £60 a Day)', why: 'Reef in the morning, rainforest after.', when: 'June–October', budget: '£60–100', from: 'LHR', to: 'CNS', dos: ['Get on the water early', 'Leave a day for the forest'], art: ['reef', '#0c4c6e', '#1a8ea0', '#0a6e62', '#f2c14a', '#e8fff8'] },
    { no: 21, rarity: 'common', name: 'Budget Europe Rail', country: 'Europe', type: 'City', videoId: '0KZoxJimJxE', kind: 'video', title: 'Cheapest Countries in Europe to Travel (Under £30 a Day)', why: 'The countries that still stretch a small budget.', when: 'April–June and September', budget: '£25–40', from: 'LHR', to: 'BUD', dos: ['Travel by train', 'Eat where locals eat'], art: ['rail', '#d7e6c8', '#f4efe4', '#3d4a38', '#8aa0a8', '#f2c14a'] },
    { no: 22, rarity: 'common', name: 'Portugal Coast Hop', country: 'Portugal', type: 'Coast', videoId: 'kdzA0qlIvi0', kind: 'short', title: "top 5 places you can't miss in portugal (part 2)", why: 'Five more stops along the coast.', when: 'May–June and September', budget: '£50–90', from: 'LHR', to: 'LIS', dos: ['Follow the coast', 'Stop in a town you had not planned'], art: ['coast', '#8ec4e0', '#f7e2b8', '#e07a3a', '#1a6a8a', '#fff'] },
    { no: 23, rarity: 'common', name: 'Golden Hour Drive', country: 'Open road', type: 'Road', videoId: 'RX0J5ZkjD6Q', kind: 'short', title: 'road trip at golden hour', why: 'The hour the road looks borrowed from a film.', when: 'Whenever the light goes long', budget: '£40–80', from: 'LHR', to: 'RD1', dos: ['Point the car at the sunset', 'Pull over when it peaks'], art: ['road', '#f2a04a', '#f6c98a', '#5c3a28', '#2a2420', '#ffe1a0'] },
    { no: 24, rarity: 'common', name: 'Winter Sun Break', country: 'Worldwide', type: 'Coast', videoId: 'BsHZaVbjJX8', kind: 'video', title: '5 Cheapest Winter Sun Destinations From the UK (From £50)', why: 'A warm week when home is grey.', when: 'November–February', budget: '£50–100', from: 'LHR', to: 'TFS', dos: ['Fly somewhere that stays warm', 'Keep the plan loose'], art: ['coast', '#f0c07a', '#f6e2b4', '#2f8f78', '#1a6f93', '#fff8e8'] },
    { no: 25, rarity: 'common', name: 'One-way Departure', country: 'Anywhere', type: 'Road', videoId: 'GI1wpp0yxH0', kind: 'short', title: 'one way ticket', why: 'The trip you do not book a return for.', when: 'When you are ready to go', budget: '£40–90', from: 'LHR', to: 'OWY', dos: ['Pack lighter than you think', 'Leave the return date open'], art: ['road', '#6e8cae', '#d5e0ea', '#243044', '#c9844a', '#fff'] },
    { no: 26, rarity: 'common', name: 'Kyoto Lantern Alley', country: 'Japan', type: 'City', videoId: '', kind: 'short', title: 'Kyoto after dark', why: 'Wood, paper light, and a lane that goes quiet.', when: 'March–May and October–November', budget: '£70–120', from: 'LHR', to: 'KIX', dos: ['Walk Gion after dark', 'Keep to the side streets'], art: ['lanterns', '#1a1428', '#3a2438', '#6b1d2a', '#e8b15a', '#ffd2a0'] },
    { no: 27, rarity: 'common', name: 'Reykjavík Blue Hour', country: 'Iceland', type: 'Coast', videoId: '', kind: 'short', title: 'Reykjavík blue hour', why: 'Harbour cranes, low sun, and weather that changes its mind.', when: 'June–August, or winter for dark skies', budget: '£90–150', from: 'LHR', to: 'KEF', dos: ['Walk the harbour', 'Leave a day for the weather'], art: ['coast', '#16324a', '#4d6d86', '#1c2838', '#2a4a62', '#d5e6f2'] },
    { no: 28, rarity: 'common', name: 'Ha Long Junk Dawn', country: 'Vietnam', type: 'Island', videoId: '', kind: 'short', title: 'Ha Long at dawn', why: 'Limestone, still water, and a deck before anyone else is up.', when: 'October–April', budget: '£30–55', from: 'LHR', to: 'HAN', dos: ['Be on deck at sunrise', 'Kayak a quiet cove'], art: ['boat', '#8eb8c8', '#d5e4ea', '#3d5a4a', '#1a3d4a', '#fff'] },
    { no: 29, rarity: 'common', name: 'Machu Picchu Terraces', country: 'Peru', type: 'Mountains', videoId: '', kind: 'short', title: 'Machu Picchu terraces', why: 'Stone steps and a ridge that keeps its own weather.', when: 'May–September', budget: '£40–70', from: 'LHR', to: 'CUZ', dos: ['Enter when the gate opens', 'Walk the terraces before the buses'], art: ['terraces', '#6ea86a', '#d7e6b4', '#3d6b3a', '#6b5430', '#f4e6c0'] },
    { no: 30, rarity: 'common', name: 'Dubrovnik Walls', country: 'Croatia', type: 'City', videoId: '', kind: 'short', title: 'Dubrovnik city walls', why: 'Stone walls, red roofs, and the Adriatic on both sides.', when: 'May–June and September', budget: '£60–100', from: 'LHR', to: 'DBV', dos: ['Walk the walls early', 'Swim off the rocks after'], art: ['city', '#7eb4d8', '#f6e2c4', '#c4503a', '#1f6a8a', '#fff'] },
    { no: 31, rarity: 'common', name: 'Milford Sound Mist', country: 'New Zealand', type: 'Mountains', videoId: '', kind: 'short', title: 'Milford Sound', why: 'Cliffs that disappear into the cloud, and water that stays dark.', when: 'November–April', budget: '£70–120', from: 'LHR', to: 'ZQN', dos: ['Take the early cruise', 'Stay if the rain starts'], art: ['lake', '#8aa8b4', '#d5e2e6', '#2c3e3a', '#1a3338', '#f4f7f6'] },
    { no: 32, rarity: 'common', name: 'Santorini Caldera', country: 'Greece', type: 'Island', videoId: '', kind: 'short', title: 'Santorini caldera', why: 'White rooms stacked over a very blue drop.', when: 'May–June and September', budget: '£80–140', from: 'LHR', to: 'JTR', dos: ['Watch the caldera from a terrace', 'Walk before the cruise ships'], art: ['cliffs', '#6eb0e0', '#f4d2a8', '#f7f4ef', '#1a6ea8', '#e24b3a'] },
    { no: 33, rarity: 'common', name: 'Marrakech Medina', country: 'Morocco', type: 'City', videoId: '', kind: 'short', title: 'Marrakech medina', why: 'Alleys, lamps, and a square that does not really sleep.', when: 'March–May and October–November', budget: '£35–60', from: 'LHR', to: 'RAK', dos: ['Get lost on purpose', 'Eat where the stools are'], art: ['market', '#c45a3a', '#e8a06a', '#6b2430', '#e6b15a', '#ffe1a8'] },
    { no: 34, rarity: 'common', name: 'Banff Turquoise Lake', country: 'Canada', type: 'Mountains', videoId: '', kind: 'short', title: 'Banff lakes', why: 'Water the colour of melted glass, peaks still holding snow.', when: 'June–September', budget: '£80–140', from: 'LHR', to: 'YYC', dos: ['Start at the lake before the car park fills', 'Walk one trail further'], art: ['lake', '#7eb6e0', '#e7f4fb', '#4d6b58', '#1aa0a8', '#fff'] },
    { no: 35, rarity: 'common', name: 'Petra Treasury', country: 'Jordan', type: 'Culture', videoId: '', kind: 'short', title: 'Petra treasury', why: 'A rose-coloured facade at the end of a long slot canyon.', when: 'March–May and September–November', budget: '£40–70', from: 'LHR', to: 'AMM', dos: ['Walk the siq in the morning', 'Stay until the stone changes colour'], art: ['facade', '#e7b48a', '#f6ddc4', '#c4714a', '#8d4e3a', '#fff1df'] },
    { no: 36, rarity: 'common', name: 'Edinburgh Close', country: 'Scotland', type: 'City', videoId: '', kind: 'short', title: 'Edinburgh closes', why: 'Stairs, stone, and a city stacked on itself.', when: 'May–September', budget: '£70–110', from: 'LHR', to: 'EDI', dos: ['Take a close at random', 'Walk the ridge at dusk'], art: ['city', '#8aa0b4', '#d5dde6', '#3a4554', '#6d2430', '#f4efe6'] },
    { no: 37, rarity: 'common', name: 'Lisbon Tram Seven', country: 'Portugal', type: 'City', videoId: '', kind: 'short', title: 'Lisbon tram 28', why: 'Hills, tiles, and a tram that complains the whole way up.', when: 'March–June and September', budget: '£55–90', from: 'LHR', to: 'LIS', dos: ['Ride it early', 'Get off when the view opens'], art: ['rail', '#f2c14a', '#f6e2b0', '#c4503a', '#3d6f8f', '#fff'] },
    { no: 38, rarity: 'common', name: 'Svalbard Ice Edge', country: 'Norway', type: 'Arctic', videoId: '', kind: 'short', title: 'Svalbard ice', why: 'The edge of the map, bright and very quiet.', when: 'March–May for light and snow', budget: '£150–250', from: 'LHR', to: 'LYR', dos: ['Go with a guide', 'Dress for the wind, then add a layer'], art: ['ice', '#d5e6f2', '#f7fbfe', '#9fb4c4', '#6e8ca0', '#fff'] },
    { no: 39, rarity: 'common', name: 'Atacama Salt Flats', country: 'Chile', type: 'Desert', videoId: '', kind: 'short', title: 'Atacama salt flats', why: 'A white plain, a huge sky, and lagoons that look dyed.', when: 'May–September', budget: '£40–70', from: 'LHR', to: 'CJC', dos: ['Be there for the mirror hour', 'Give the altitude a day'], art: ['salt', '#f2e6c8', '#fffaf0', '#e8dcc0', '#7eb8c8', '#f4f1ea'] },
    { no: 40, rarity: 'common', name: 'Faroe Cliffs', country: 'Faroe Islands', type: 'Coast', videoId: '', kind: 'short', title: 'Faroe cliffs', why: 'Grass on top of a drop, and weather that arrives sideways.', when: 'June–August', budget: '£90–150', from: 'LHR', to: 'FAE', dos: ['Stay on the marked path', 'Wait ten minutes if it is raining'], art: ['cliffs', '#9eb8c4', '#d5e2e6', '#3d6b4a', '#1a3d4e', '#f4f7f4'] }
  ];

  CARDS.forEach(c => { c.cid = 's1-' + num(c.no); });

  function pal(c) {
    const a = c.art || ['peaks', '#8eb4d0', '#e7f2f8', '#4d6470', '#1d4e68', '#fff'];
    return { motif: a[0], sky: a[1], sky2: a[2], land: a[3], sea: a[4], accent: a[5], no: c.no };
  }
  function sun(p, x, y, r) { return `<circle cx="${x}" cy="${y}" r="${r || 18}" fill="${p.accent}"/>`; }
  const MOTIF = {
    cliffs(p) {
      const x = 40 + (p.no * 37) % 200;
      return `${sun(p, x, 42, 20)}<path d="M0 118 L36 78 L70 104 L108 46 L146 96 L184 58 L220 100 L258 64 L320 112 L320 200 L0 200Z" fill="${p.land}"/><path d="M0 158 C70 140 150 176 320 148 L320 200 L0 200Z" fill="${p.sea}"/>`;
    },
    dunes(p) {
      return `${sun(p, 250, 48, 16)}<path d="M0 120 C40 80 80 150 130 110 C180 70 220 140 270 100 C300 80 320 96 320 96 L320 200 L0 200Z" fill="${p.land}"/><path d="M0 150 C60 130 100 170 170 146 C230 124 270 160 320 142 L320 200 L0 200Z" fill="${p.sea}"/>`;
    },
    aurora(p) {
      return `<path d="M0 40 C60 10 80 70 140 36 C200 4 240 80 320 30 L320 110 C240 90 200 140 140 100 C80 150 60 90 0 120Z" fill="${p.accent}" opacity=".85"/><path d="M0 70 C80 40 120 120 200 70 C250 40 280 100 320 80 L320 150 C240 130 180 170 100 140 C40 170 20 130 0 150Z" fill="${p.sea}" opacity=".7"/><path d="M0 150 L320 130 L320 200 L0 200Z" fill="${p.land}"/>`;
    },
    peaks(p) {
      return `${sun(p, 60, 46, 16)}<path d="M0 200 L0 120 L50 70 L90 110 L140 36 L190 100 L240 58 L290 108 L320 80 L320 200Z" fill="${p.land}"/><path d="M128 58 L140 36 L152 58 L140 54Z" fill="${p.accent}"/><path d="M0 168 C80 150 140 180 220 160 C270 150 300 166 320 158 L320 200 L0 200Z" fill="${p.sea}"/>`;
    },
    canopy(p) {
      return `<rect width="320" height="200" fill="${p.sky}"/><circle cx="70" cy="70" r="46" fill="${p.land}"/><circle cx="150" cy="54" r="58" fill="${p.sea}"/><circle cx="240" cy="72" r="50" fill="${p.land}"/><circle cx="40" cy="120" r="36" fill="${p.sky2}"/><rect x="150" y="120" width="8" height="80" fill="${p.accent}"/><rect y="160" width="320" height="40" fill="${p.sea}"/>`;
    },
    reef(p) {
      return `<rect width="320" height="200" fill="${p.sky}"/><ellipse cx="90" cy="120" rx="70" ry="28" fill="${p.sea}"/><ellipse cx="210" cy="100" rx="80" ry="26" fill="${p.land}"/><circle cx="250" cy="70" r="10" fill="${p.accent}"/><path d="M40 80 C70 60 80 90 110 74" fill="none" stroke="${p.accent}" stroke-width="4"/><path d="M180 150 C220 130 240 160 280 140" fill="none" stroke="${p.accent}" stroke-width="3"/>`;
    },
    terraces(p) {
      return `${sun(p, 260, 40, 14)}${['70,150 70,90', '110,150 50,70', '150,150 40,60', '190,150 36,54', '230,150 40,64'].map(pair => {
        const [a, b] = pair.split(' ');
        const [y, h] = a.split(',');
        const [x2, y2] = b.split(',');
        return `<path d="M0 ${y} Q160 ${y2} 320 ${y}" fill="none" stroke="${p.land}" stroke-width="${h > 80 ? 18 : 14}"/>`;
      }).join('')}<rect y="168" width="320" height="32" fill="${p.sea}"/>`;
    },
    city(p) {
      const blocks = [20, 36, 28, 48, 22, 40, 30, 18].map((h, i) => `<rect x="${i * 40 + 6}" y="${150 - h * 2}" width="28" height="${h * 2}" fill="${i % 2 ? p.land : p.sea}"/>`).join('');
      return `${sun(p, 270, 42, 16)}${blocks}<rect y="164" width="320" height="36" fill="${p.accent}" opacity=".35"/>`;
    },
    balloon(p) {
      return `<path d="M0 160 C80 140 240 180 320 150 L320 200 L0 200Z" fill="${p.land}"/>${[70, 150, 230].map((x, i) => `<ellipse cx="${x}" cy="${78 - i * 6}" rx="22" ry="30" fill="${i === 1 ? p.accent : p.sea}"/><path d="M${x - 8} 108 L${x} 122 L${x + 8} 108Z" fill="${p.land}"/>`).join('')}`;
    },
    coast(p) {
      const x = 50 + (p.no * 23) % 180;
      return `${sun(p, x, 48, 18)}<path d="M0 130 C80 110 120 150 200 124 C260 106 290 136 320 120 L320 200 L0 200Z" fill="${p.sea}"/><path d="M0 150 L80 120 L110 138 L160 100 L200 132 L250 108 L320 140 L320 200 L0 200Z" fill="${p.land}"/>`;
    },
    boat(p) {
      return `${sun(p, 250, 46, 16)}<path d="M0 150 L320 130 L320 200 L0 200Z" fill="${p.sea}"/><path d="M70 150 L140 78 L150 150Z" fill="${p.accent}"/><path d="M150 150 L210 96 L214 150Z" fill="${p.land}"/><path d="M60 148 H230 L210 166 H80Z" fill="${p.land}"/>`;
    },
    market(p) {
      return `<rect width="320" height="120" fill="${p.sky}"/>${[40, 100, 160, 220].map(x => `<path d="M${x} 70 L${x + 36} 118 L${x - 36} 118Z" fill="${p.accent}"/><rect x="${x - 6}" y="118" width="12" height="40" fill="${p.land}"/>`).join('')}<rect y="158" width="320" height="42" fill="${p.sea}"/>`;
    },
    rail(p) {
      return `${sun(p, 40, 40, 14)}<path d="M0 120 L320 90 L320 200 L0 200Z" fill="${p.sky2}"/><rect x="40" y="108" width="150" height="36" rx="6" fill="${p.land}"/><rect x="150" y="92" width="70" height="52" fill="${p.sea}"/><circle cx="78" cy="148" r="10" fill="${p.accent}"/><circle cx="150" cy="148" r="10" fill="${p.accent}"/>`;
    },
    road(p) {
      return `${sun(p, 230, 48, 20)}<path d="M0 90 L320 70 L320 200 L0 200Z" fill="${p.sky2}"/><path d="M150 200 L190 90 L230 200Z" fill="${p.land}"/><path d="M188 140 H214" stroke="${p.accent}" stroke-width="6"/>`;
    },
    ice(p) {
      return `${sun(p, 60, 44, 14)}<path d="M0 110 L40 80 L70 120 L110 60 L150 120 L190 70 L240 130 L280 84 L320 120 L320 200 L0 200Z" fill="${p.land}"/><path d="M0 160 L320 146 L320 200 L0 200Z" fill="${p.sea}"/>`;
    },
    lanterns(p) {
      return `<rect width="320" height="200" fill="${p.sky}"/>${[50, 120, 190, 260].map((x, i) => `<line x1="${x}" y1="0" x2="${x}" y2="${50 + i * 8}" stroke="${p.accent}" stroke-width="2"/><rect x="${x - 14}" y="${50 + i * 8}" width="28" height="36" rx="4" fill="${i % 2 ? p.land : p.sea}"/>`).join('')}`;
    },
    lake(p) {
      return `${sun(p, 240, 42, 14)}<path d="M0 100 L60 70 L100 96 L150 48 L210 90 L260 60 L320 96 L320 130 L0 140Z" fill="${p.land}"/><path d="M0 132 C80 150 160 120 320 142 L320 200 L0 200Z" fill="${p.sea}"/>`;
    },
    salt(p) {
      return `${sun(p, 160, 48, 18)}<path d="M0 120 L320 108 L320 200 L0 200Z" fill="${p.land}"/>${[40, 120, 200, 270].map(x => `<polygon points="${x},150 ${x + 18},166 ${x},182 ${x - 18},166" fill="${p.sea}"/>`).join('')}`;
    },
    plain(p) {
      return `${sun(p, 70, 56, 18)}<path d="M0 140 C100 120 220 160 320 130 L320 200 L0 200Z" fill="${p.land}"/><path d="M200 140 L230 80 L236 140Z" fill="${p.sea}"/><circle cx="232" cy="78" r="16" fill="${p.sea}"/><circle cx="40" cy="150" r="6" fill="${p.accent}"/><circle cx="90" cy="156" r="5" fill="${p.accent}"/>`;
    },
    facade(p) {
      return `${rectSky(p)}<path d="M110 170 L110 70 L160 40 L210 70 L210 170Z" fill="${p.land}"/><rect x="142" y="88" width="36" height="50" fill="${p.sky}"/><rect x="70" y="120" width="180" height="50" fill="${p.sea}"/>`;
    }
  };
  function rectSky(p) { return `<rect width="320" height="200" fill="url(#sk)"/>`; }
  function artUri(c) {
    const p = pal(c);
    const draw = (MOTIF[p.motif] || MOTIF.peaks)(p);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky}"/><stop offset="1" stop-color="${p.sky2}"/></linearGradient></defs><rect width="320" height="200" fill="url(#sk)"/>${draw}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function bars(c) {
    let s = '';
    let n = c.no * 97 + 13;
    for (let i = 0; i < 28; i++) {
      n = (n * 17 + 3) % 97;
      const w = 1 + (n % 3);
      s += `<i style="width:${w}px"></i>`;
    }
    return s;
  }
  function seat(c) {
    if (c.rarity === 'mythic') return '1A';
    if (c.rarity === 'ultra') return c.no % 2 ? '2A' : '2K';
    const row = c.rarity === 'rare' ? 3 + (c.no % 4) : c.rarity === 'uncommon' ? 8 + (c.no % 6) : 16 + (c.no % 14);
    return row + String.fromCharCode(65 + (c.no % 6));
  }
  function gate(c) {
    return String.fromCharCode(65 + (c.no % 6)) + ((c.no % 9) + 1);
  }
  function watch(c) {
    if (!c.videoId) return 'https://www.youtube.com/@Solotravel_365/shorts';
    return c.kind === 'video' ? `https://www.youtube.com/watch?v=${c.videoId}` : `https://www.youtube.com/shorts/${c.videoId}`;
  }
  function watchLabel(c) { return c.videoId ? 'Watch the video' : 'Watch the channel'; }

  function renderCard(c, ctx) {
    const klass = (ctx && ctx.className) || c.rarity;
    const total = (ctx && ctx.total) || CARDS.length;
    const dos = (c.dos || []).map(d => `<li>${esc(d)}</li>`).join('');
    const stamp = (c.rarity === 'mythic' || c.rarity === 'ultra') ? `<span class="pass-stamp" aria-hidden="true">${esc(klass)}</span>` : '';
    return `<article class="tcard theme-pass tier-${c.rarity}" data-cid="${c.cid}" style="--rx:0deg;--ry:0deg">
      <div class="tcard-inner">
        <div class="tcard-back">
          <p class="pass-k">Itinerary · ${esc(c.country)}</p>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.why)}</p>
          <p class="pass-k">Best time</p><p>${esc(c.when)}</p>
          <p class="pass-k">Rough daily budget</p><p>${esc(c.budget)}</p>
          ${dos ? `<p class="pass-k">Do this</p><ul>${dos}</ul>` : ''}
          <a class="btn" href="${watch(c)}" target="_blank" rel="noopener">${watchLabel(c)}</a>
        </div>
        <div class="tcard-face">
          <header class="pass-head"><span>✈ Solo Travel 365</span><b>Boarding pass</b></header>
          <p class="pass-class"><i>Class</i> <strong>${esc(klass)}</strong></p>
          <div class="pass-art"><img src="${artUri(c)}" alt="" width="320" height="200"><span class="foil" aria-hidden="true"></span></div>
          <h3 class="pass-name">${esc(c.name)}</h3>
          <p class="pass-sub">${esc(c.country)} · ${esc(c.type)}</p>
          <dl class="pass-grid">
            <div><dt>From</dt><dd>${esc(c.from)}</dd></div>
            <div><dt>To</dt><dd>${esc(c.to)}</dd></div>
            <div><dt>Flight</dt><dd>ST${num(c.no)}</dd></div>
            <div><dt>Gate</dt><dd>${gate(c)}</dd></div>
            <div><dt>Seat</dt><dd>${seat(c)}</dd></div>
            <div><dt>No.</dt><dd>${num(c.no)}/${total}</dd></div>
          </dl>
          <div class="pass-perf" aria-hidden="true"></div>
          <dl class="pass-stats">
            <div><dt>Budget</dt><dd>${esc(c.budget)}</dd></div>
            <div><dt>Season</dt><dd>${esc(c.when)}</dd></div>
            <div><dt>Type</dt><dd>${esc(c.type)}</dd></div>
          </dl>
          <p class="pass-flavour">${esc(c.why)}</p>
          <footer class="pass-foot"><span class="pass-barcode" aria-hidden="true">${bars(c)}</span><a href="${watch(c)}" target="_blank" rel="noopener">${watchLabel(c)}</a></footer>
          ${stamp}
        </div>
      </div>
    </article>`;
  }

  function renderShelf(c, owned, ctx) {
    const klass = (ctx && ctx.className) || '';
    if (!owned) {
      return `<button type="button" class="shelf-card theme-pass tier-${c.rarity} is-locked" data-cid="${c.cid}" aria-label="Locked card ${num(c.no)} of 40">
        <span class="spine"><span class="spine-art"></span><span class="spine-meta"><b>Locked</b><small>${num(c.no)}</small></span></span>
      </button>`;
    }
    return `<button type="button" class="shelf-card theme-pass tier-${c.rarity} is-owned" data-cid="${c.cid}" aria-label="${esc(c.name)}, ${esc(klass)}">
      <span class="spine"><span class="spine-art" style="background-image:url(${artUri(c)})"></span><span class="spine-meta"><b>${esc(c.name)}</b><small>${num(c.no)}</small></span></span>
    </button>`;
  }

  window.SERIES = window.SERIES || [];
  window.SERIES.push({
    id: 's1',
    number: 1,
    name: 'Series 01',
    themeName: 'Boarding passes',
    theme: 'pass',
    status: 'live',
    size: 40,
    classes: {
      common: 'Economy',
      uncommon: 'Premium',
      rare: 'Business',
      ultra: 'First Class',
      mythic: 'Concorde Edition'
    },
    mythicPrize: 'Mythic prize: coming soon',
    cards: CARDS,
    artUri,
    renderCard,
    renderShelf
  });
})();
