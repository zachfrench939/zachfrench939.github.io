// Series 01. Each card is one real Solo Travel 365 video (Shorts first, then films
// to fill the set of 25). Tier is the view-count rank of that video:
// top 1 Golden Passport, next 2 Legend, 3 Voyager, 4 Globetrotter, 6 Explorer, rest Backpacker.
// View counts are intentionally not stored here.
window.TIERS = {
  backpacker: { name: 'Backpacker', odds: '55%', n: 55 },
  explorer: { name: 'Explorer', odds: '25%', n: 25 },
  globetrotter: { name: 'Globetrotter', odds: '12%', n: 12 },
  voyager: { name: 'Voyager', odds: '6%', n: 6 },
  legend: { name: 'Legend', odds: '1.9%', n: 1.9 },
  passport: { name: 'Golden Passport', odds: '0.1%', n: 0.1, ultra: true }
};
window.TIER_ORDER = ['backpacker', 'explorer', 'globetrotter', 'voyager', 'legend', 'passport'];

window.CARDS = [
  { no: 1, id: '6pF15VIiB8Y', kind: 'short', tier: 'passport', name: 'Positano', country: 'Italy', title: 'positano at golden hour hits different', why: 'Pastel cliffs that glow at golden hour.', budget: '£110–170', img: 'img/v_6pF15VIiB8Y.jpg' },
  { no: 2, id: '6oLT68G4bZU', kind: 'short', tier: 'legend', name: 'Christmas Markets', country: 'Europe', title: "Top 5 Christmas Markets in Europe You Can't Miss", why: 'Markets worth crossing a border for.', budget: '£80–140', img: 'img/v_6oLT68G4bZU.jpg' },
  { no: 3, id: 'tbWId8Hk1Sk', kind: 'short', tier: 'legend', name: 'The Amazon', country: 'South America', title: "The Amazon Rainforest Like You've Never Seen It", why: 'The rainforest, closer than a postcard.', budget: '£50–90', img: 'img/v_tbWId8Hk1Sk.jpg' },
  { no: 4, id: 'wnWW6ZbRaYU', kind: 'short', tier: 'voyager', name: 'October Places', country: 'Worldwide', title: 'Places That Look Best in October (Autumn Bucket List)', why: 'Where autumn does the heavy lifting.', budget: '£70–120', img: 'img/v_wnWW6ZbRaYU.jpg' },
  { no: 5, id: 'TSaO4o9Hwhk', kind: 'short', tier: 'voyager', name: 'Tenerife', country: 'Spain', title: 'Tenerife in November: Winter Sun in the Canary Islands', why: 'Winter sun, a short flight from the UK.', budget: '£60–100', img: 'img/v_TSaO4o9Hwhk.jpg' },
  { no: 6, id: 'yC_5FU0fVHs', kind: 'short', tier: 'voyager', name: 'The Sahara', country: 'Morocco', title: 'do it. go as far as you can', why: 'Go as far as the dunes will take you.', budget: '£35–60', img: 'img/sahara.jpg' },
  { no: 7, id: 'r1t4Z4x1VTc', kind: 'short', tier: 'globetrotter', name: 'January Sun', country: 'Worldwide', title: "Where's Actually Warm in January from the UK", why: 'Warm in January, if you pick the right map.', budget: '£60–110', img: 'img/v_r1t4Z4x1VTc.jpg' },
  { no: 8, id: 'bGaxF4qm52Q', kind: 'short', tier: 'globetrotter', name: 'London to Amalfi', country: 'Europe', title: '2 Week Europe Itinerary: London to the Amalfi Coast', why: 'Two weeks from the Thames to the coast.', budget: '£90–150', img: 'img/v_bGaxF4qm52Q.jpg' },
  { no: 9, id: 'leFPo_T6hhU', kind: 'short', tier: 'globetrotter', name: 'The Dolomites', country: 'Italy', title: '5 Hidden Spots in the Dolomites Most People Miss', why: 'Jagged peaks most people walk straight past.', budget: '£90–140', img: 'img/dolomites.jpg' },
  { no: 10, id: 'GVDQUI_M5UE', kind: 'short', tier: 'globetrotter', name: 'Daintree', country: 'Australia', title: 'Oh, So You Like Green? Daintree Rainforest & Lush Places', why: 'Green so thick it barely looks real.', budget: '£70–120', img: 'img/v_GVDQUI_M5UE.jpg' },
  { no: 11, id: 'xndt8ebd04M', kind: 'short', tier: 'explorer', name: 'Northern Lights', country: 'Europe', title: '4 Places to See the Northern Lights in Europe This Winter', why: 'Four winter skies worth staying up for.', budget: '£100–160', img: 'img/aurora.jpg' },
  { no: 12, id: '0XHZqT9axpE', kind: 'short', tier: 'explorer', name: 'Safari Trails', country: 'Worldwide', title: 'top 5 cheapest safaris in the world (part 2)', why: 'A safari that does not need a luxury budget.', budget: '£80–150', img: 'img/v_0XHZqT9axpE.jpg' },
  { no: 13, id: 'RtqLmOsaA6E', kind: 'short', tier: 'explorer', name: 'Andalucía', country: 'Spain', title: "5 Places You Can't Miss in Andalucía, Spain", why: 'White villages, cliff paths and late tapas.', budget: '£55–90', img: 'img/v_RtqLmOsaA6E.jpg' },
  { no: 14, id: 'zzaxRp9UsPs', kind: 'short', tier: 'explorer', name: 'Bali', country: 'Indonesia', title: 'Bali Rice Terraces & Waterfalls You Need to See', why: 'Terraces and waterfalls on a backpacker budget.', budget: '£30–55', img: 'img/v_zzaxRp9UsPs.jpg' },
  { no: 15, id: 'lCGpA713IwQ', kind: 'short', tier: 'explorer', name: 'Norway', country: 'Norway', title: "top 5 trips you cannot miss in norway", why: 'Fjords and red cabins straight out of the sea.', budget: '£120–180', img: 'img/lofoten2.jpg' },
  { no: 16, id: 'BsHZaVbjJX8', kind: 'video', tier: 'explorer', name: 'Winter Sun', country: 'Worldwide', title: '5 Cheapest Winter Sun Destinations From the UK (From £50)', why: 'Five ways to leave a grey UK winter.', budget: '£50–100', img: 'img/v_BsHZaVbjJX8.jpg' },
  { no: 17, id: '0KZoxJimJxE', kind: 'video', tier: 'backpacker', name: 'Budget Europe', country: 'Europe', title: 'Cheapest Countries in Europe to Travel (Under £30 a Day)', why: 'The countries that still stretch a small daily budget.', budget: '£25–40', img: 'img/v_0KZoxJimJxE.jpg' },
  { no: 18, id: 'OBMhUd8vorU', kind: 'video', tier: 'backpacker', name: 'Kraków', country: 'Poland', title: '3 Days in Kraków Solo for Under £200 (Flights Included)', why: 'A solo weekend that stays on a shoestring.', budget: '£40–70', img: 'img/v_OBMhUd8vorU.jpg' },
  { no: 19, id: 'GAOQ-ainiDA', kind: 'short', tier: 'backpacker', name: 'Cappadocia', country: 'Türkiye', title: 'woke up at 4am for this in cappadocia', why: 'Worth the 4am alarm.', budget: '£45–80', img: 'img/cappadocia.jpg' },
  { no: 20, id: 'VOT7Cx6sfgA', kind: 'video', tier: 'backpacker', name: 'Cairns', country: 'Australia', title: 'Cairns Australia Itinerary: 10 Days (From £60 a Day)', why: 'Ten days between reef and rainforest.', budget: '£60–100', img: 'img/v_VOT7Cx6sfgA.jpg' },
  { no: 21, id: 'kdzA0qlIvi0', kind: 'short', tier: 'backpacker', name: 'Portugal', country: 'Portugal', title: "top 5 places you can't miss in portugal (part 2)", why: 'Five stops that belong on the second list.', budget: '£50–90', img: 'img/v_kdzA0qlIvi0.jpg' },
  { no: 22, id: 'RX0J5ZkjD6Q', kind: 'short', tier: 'backpacker', name: 'Golden Hour Road', country: 'Open road', title: 'road trip at golden hour', why: 'The hour when the road looks borrowed from a film.', budget: '£40–80', img: 'img/v_RX0J5ZkjD6Q.jpg' },
  { no: 23, id: 'adj82M1nwnI', kind: 'short', tier: 'backpacker', name: 'Thailand', country: 'Thailand', title: 'thailand by longtail boat', why: 'A longtail, warm water, and nowhere to be.', budget: '£30–55', img: 'img/v_adj82M1nwnI.jpg' },
  { no: 24, id: 'H9APzkdPPn4', kind: 'short', tier: 'backpacker', name: 'Swiss Alps', country: 'Switzerland', title: 'swiss alps', why: 'High, bright, and quieter than the brochure.', budget: '£140–220', img: 'img/v_H9APzkdPPn4.jpg' },
  { no: 25, id: 'GI1wpp0yxH0', kind: 'short', tier: 'backpacker', name: 'One-way Ticket', country: 'Anywhere', title: 'one way ticket', why: 'The trip you do not book a return for.', budget: '£40–90', img: 'img/v_GI1wpp0yxH0.jpg' }
];

window.VIDEOS = window.CARDS.filter(c => c.kind === 'short').map(c => [c.id, c.title, c.country]);
