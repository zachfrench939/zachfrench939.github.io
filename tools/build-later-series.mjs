#!/usr/bin/env node
// Lithographs and card lists for Series 02 and Series 03.
// Run: node tools/build-later-series.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'img/cards');
mkdirSync(outDir, { recursive: true });

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const S2 = [
  ['Venice Night Landing', 'Italy', 'City', 'mythic', 'A stamp that looks painted on.', 'April–June and October', '£90–150', 'LHR', 'VCE', 'night'],
  ['Tokyo Rain Crossing', 'Japan', 'City', 'ultra', 'Neon on wet pavement, and a quiet train home.', 'March–May and October', '£80–140', 'LHR', 'HND', 'night'],
  ['New York Brownstones', 'USA', 'City', 'ultra', 'Stoops, steam, and a long walk uptown.', 'April–June and September', '£120–200', 'LHR', 'JFK', 'city'],
  ['Prague River Bridges', 'Czechia', 'City', 'rare', 'Stone arches and a castle that stays in the sky.', 'May–June and September', '£45–80', 'LHR', 'PRG', 'city'],
  ['Istanbul Ferry Dawn', 'Türkiye', 'City', 'rare', 'Tea, gulls, and two continents before breakfast.', 'April–June and September', '£40–70', 'LHR', 'IST', 'coast'],
  ['Seoul Palace Light', 'South Korea', 'City', 'rare', 'Gates, pines, and a city that starts early.', 'March–May and October', '£60–110', 'LHR', 'ICN', 'city'],
  ['Mexico City Colour', 'Mexico', 'City', 'rare', 'Murals, markets, and a park bigger than you expect.', 'November–April', '£35–65', 'LHR', 'MEX', 'city'],
  ['Budapest Chain Bridge', 'Hungary', 'City', 'rare', 'The river does the lighting after dark.', 'May–September', '£40–70', 'LHR', 'BUD', 'night'],
  ['Havana Malecón', 'Cuba', 'Coast', 'rare', 'Salt air, old cars, and a wall against the sea.', 'November–April', '£40–75', 'LHR', 'HAV', 'coast'],
  ['Vienna Coffee Hour', 'Austria', 'City', 'uncommon', 'A marble table and nowhere else to be.', 'April–June and September', '£70–120', 'LHR', 'VIE', 'city'],
  ['Amsterdam Canals', 'Netherlands', 'City', 'uncommon', 'Bikes, bridges, and brick that goes on.', 'April–June and September', '£80–130', 'LHR', 'AMS', 'lake'],
  ['Barcelona Tiles', 'Spain', 'City', 'uncommon', 'Colour on the walls and the sea at the end of the street.', 'May–June and September', '£70–120', 'LHR', 'BCN', 'coast'],
  ['Copenhagen Harbour', 'Denmark', 'Coast', 'uncommon', 'Clean light and a swim off the steps.', 'May–August', '£90–150', 'LHR', 'CPH', 'coast'],
  ['Dublin Painted Doors', 'Ireland', 'City', 'uncommon', 'A walk that keeps finding another colour.', 'May–September', '£70–120', 'LHR', 'DUB', 'city'],
  ['Porto River Tiles', 'Portugal', 'City', 'uncommon', 'Azulejos, a steep hill, and port after.', 'March–June and September', '£50–90', 'LHR', 'OPO', 'city'],
  ['Athens Acropolis Hour', 'Greece', 'Culture', 'uncommon', 'Stone in the last light, city underneath.', 'April–June and September', '£55–95', 'LHR', 'ATH', 'peaks'],
  ['Bruges Canals', 'Belgium', 'City', 'uncommon', 'Bells, still water, and a town that fits in a day.', 'April–June and September', '£70–110', 'LHR', 'BRU', 'lake'],
  ['Quebec Winter Stairs', 'Canada', 'City', 'uncommon', 'Snow on stone and a café that knows.', 'December–March', '£70–120', 'LHR', 'YQB', 'ice'],
  ['Valparaíso Hills', 'Chile', 'City', 'uncommon', 'Houses stacked in paint up a cliff.', 'October–April', '£35–60', 'LHR', 'SCL', 'city'],
  ['Oaxaca Courtyards', 'Mexico', 'Culture', 'uncommon', 'Markets, mole, and courtyards that stay cool.', 'October–March', '£30–55', 'LHR', 'OAX', 'city'],
  ['Tallinn Old Town', 'Estonia', 'City', 'common', 'Towers, cobbles, and a short flight from home.', 'May–September', '£45–80', 'LHR', 'TLL', 'city'],
  ['Riga Facades', 'Latvia', 'City', 'common', 'Faces on the buildings if you look up.', 'May–September', '£40–75', 'LHR', 'RIX', 'city'],
  ['Vilnius Hill Lanes', 'Lithuania', 'City', 'common', 'A university town that still feels small.', 'May–September', '£40–70', 'LHR', 'VNO', 'city'],
  ['Tbilisi Balconies', 'Georgia', 'City', 'common', 'Wood balconies over a river that cuts the city.', 'April–June and September', '£30–55', 'LHR', 'TBS', 'city'],
  ['Yerevan Pink Stone', 'Armenia', 'City', 'common', 'The buildings hold the sunset longer than the sky.', 'May–June and September', '£30–55', 'LHR', 'EVN', 'desert'],
  ['Baku Old Walls', 'Azerbaijan', 'City', 'common', 'Old city walls and a wind off the Caspian.', 'April–June and September', '£35–65', 'LHR', 'GYD', 'coast'],
  ['Samarkand Blue Dome', 'Uzbekistan', 'Culture', 'common', 'Blue domes in a square that has seen centuries.', 'April–June and September', '£25–45', 'LHR', 'SKD', 'desert'],
  ['Luang Prabang Dawn', 'Laos', 'Culture', 'common', 'Monks, mist, and a river before the heat.', 'November–February', '£25–45', 'LHR', 'LPQ', 'jungle'],
  ['Hoi An Lanterns', 'Vietnam', 'City', 'common', 'A yellow town that turns the river into lights.', 'February–April', '£25–45', 'LHR', 'DAD', 'night'],
  ['Penang Shop Houses', 'Malaysia', 'City', 'common', 'Shop houses and a table that never really closes.', 'December–February', '£25–45', 'LHR', 'PEN', 'city'],
  ['Colombo Coast Line', 'Sri Lanka', 'Coast', 'common', 'The railway that runs between the sea and the tea.', 'December–March', '£25–50', 'LHR', 'CMB', 'coast'],
  ['Zanzibar Stone Door', 'Tanzania', 'Island', 'common', 'Carved wood, coral stone, and a warm sea.', 'June–October', '£40–70', 'LHR', 'ZNZ', 'coast'],
  ['Chefchaouen Blue', 'Morocco', 'City', 'common', 'A town that decided on one colour and kept it.', 'March–May and September', '£30–55', 'LHR', 'TNG', 'city'],
  ['Valletta Limestone', 'Malta', 'City', 'common', 'Golden stone and a harbour on both sides.', 'April–June and September', '£55–95', 'LHR', 'MLA', 'coast'],
  ['Kotor Bay Walls', 'Montenegro', 'Coast', 'common', 'A deep bay and walls you can walk.', 'May–June and September', '£40–70', 'LHR', 'TIV', 'peaks'],
  ['Mostar Old Bridge', 'Bosnia', 'Culture', 'common', 'One arch, green water, and a town rebuilt in stone.', 'May–September', '£30–55', 'LHR', 'SJJ', 'city'],
  ['Český Krumlov Bend', 'Czechia', 'City', 'common', 'A river loop and a castle you keep seeing.', 'May–September', '£40–70', 'LHR', 'PRG', 'lake'],
  ['Hallstatt Mirror', 'Austria', 'Mountains', 'common', 'A village that sits in its own reflection.', 'May–June and September', '£80–130', 'LHR', 'SZG', 'lake'],
  ['Sintra Hill Palaces', 'Portugal', 'Culture', 'common', 'Colour on a hill, fog in the trees.', 'April–June and September', '£55–95', 'LHR', 'LIS', 'jungle'],
  ['Essaouira Ramparts', 'Morocco', 'Coast', 'common', 'Blue boats, a wind, and a wall you can walk.', 'April–June and September', '£30–55', 'LHR', 'RAK', 'coast']
];

const S3 = [
  ['Aurora Fridge Magnet', 'Arctic Europe', 'Arctic', 'mythic', 'The sky you stick on the fridge and still miss.', 'December–March', '£100–160', 'LHR', 'TOS', 'night'],
  ['Eiffel Dusk Magnet', 'France', 'City', 'ultra', 'Iron lace and a city going gold.', 'April–June and September', '£90–150', 'LHR', 'CDG', 'city'],
  ['Colosseum Arch Magnet', 'Italy', 'Culture', 'ultra', 'Stone arches that have outlasted the queue.', 'April–June and October', '£70–120', 'LHR', 'FCO', 'desert'],
  ['Big Ben Rain Magnet', 'England', 'City', 'rare', 'The clock, the river, and a coat you needed.', 'Any month, bring a layer', '£40–80', 'LHR', 'LHR', 'city'],
  ['Sydney Shell Magnet', 'Australia', 'Coast', 'rare', 'White shells on a harbour that keeps moving.', 'September–November', '£70–120', 'LHR', 'SYD', 'coast'],
  ['Sagrada Colour Magnet', 'Spain', 'Culture', 'rare', 'A building that is still becoming itself.', 'May–June and September', '£70–120', 'LHR', 'BCN', 'city'],
  ['Neuschwanstein Magnet', 'Germany', 'Mountains', 'rare', 'A castle that looks borrowed from a story.', 'May–September', '£70–120', 'LHR', 'MUC', 'peaks'],
  ['Moai Coast Magnet', 'Chile', 'Island', 'rare', 'Stone faces and a very long Pacific.', 'October–April', '£50–90', 'LHR', 'IPC', 'coast'],
  ['Christ Ridge Magnet', 'Brazil', 'City', 'rare', 'Arms open over a city that does not sit still.', 'May–September', '£40–80', 'LHR', 'GIG', 'peaks'],
  ['Canal House Magnet', 'Netherlands', 'City', 'uncommon', 'A skinny house and a bike that is not yours.', 'April–September', '£80–130', 'LHR', 'AMS', 'lake'],
  ['Fjords Cabin Magnet', 'Norway', 'Mountains', 'uncommon', 'Red wood, dark water, a peak behind.', 'June–September', '£120–180', 'LHR', 'BGO', 'peaks'],
  ['Souk Lamp Magnet', 'Morocco', 'City', 'uncommon', 'Brass light in a lane that turns twice.', 'March–May and October', '£35–60', 'LHR', 'RAK', 'night'],
  ['Torii Gate Magnet', 'Japan', 'Culture', 'uncommon', 'One gate, then water, then another gate.', 'March–May and October', '£70–120', 'LHR', 'ITM', 'coast'],
  ['Tulip Field Magnet', 'Netherlands', 'Season', 'uncommon', 'Stripes of colour that only last a minute.', 'April', '£80–130', 'LHR', 'AMS', 'city'],
  ['Safari Truck Magnet', 'Kenya', 'Wildlife', 'uncommon', 'Dust, acacia, and an early start.', 'The dry months', '£80–150', 'LHR', 'NBO', 'desert'],
  ['Glacier Blue Magnet', 'Iceland', 'Ice', 'uncommon', 'Ice the colour of a held breath.', 'June–August or winter dark', '£90–150', 'LHR', 'KEF', 'ice'],
  ['Rice Terrace Magnet', 'Vietnam', 'Mountains', 'uncommon', 'Steps of green that follow the hill.', 'September–November', '£25–50', 'LHR', 'HAN', 'jungle'],
  ['Tram Climb Magnet', 'Portugal', 'City', 'uncommon', 'A yellow tram and a hill that wins.', 'March–June and September', '£55–90', 'LHR', 'LIS', 'city'],
  ['Desert Camp Magnet', 'Jordan', 'Desert', 'uncommon', 'A tent, a fire, and more stars than seats.', 'March–May and September', '£40–70', 'LHR', 'AMM', 'desert'],
  ['Harbour Crane Magnet', 'Iceland', 'Coast', 'uncommon', 'Painted metal and a low sun on the water.', 'June–August', '£90–150', 'LHR', 'KEF', 'ice'],
  ['Red Bus Magnet', 'England', 'City', 'common', 'The upstairs seat, if you get it.', 'Any month', '£30–60', 'LHR', 'LHR', 'city'],
  ['Gondola Bow Magnet', 'Italy', 'City', 'common', 'A curve of black wood on green water.', 'April–October', '£90–150', 'LHR', 'VCE', 'lake'],
  ['Windmill Magnet', 'Netherlands', 'Country', 'common', 'Four sails and a very flat horizon.', 'April–September', '£70–120', 'LHR', 'AMS', 'coast'],
  ['Cable Car Magnet', 'Switzerland', 'Mountains', 'common', 'A box of glass going up into the white.', 'June–September', '£140–220', 'LHR', 'ZRH', 'peaks'],
  ['Market Spice Magnet', 'India', 'City', 'common', 'Colour in piles, and a city that starts loud.', 'November–February', '£25–50', 'LHR', 'DEL', 'city'],
  ['Longtail Bow Magnet', 'Thailand', 'Island', 'common', 'A ribbon on the prow and warm water.', 'November–March', '£30–55', 'LHR', 'HKT', 'coast'],
  ['Volcano Rim Magnet', 'Italy', 'Mountains', 'common', 'A path on the edge and a view that smokes.', 'April–June and September', '£60–100', 'LHR', 'NAP', 'desert'],
  ['Lighthouse Magnet', 'Scotland', 'Coast', 'common', 'White tower, black rock, weather on the way.', 'May–September', '£70–110', 'LHR', 'INV', 'coast'],
  ['Night Market Magnet', 'Taiwan', 'City', 'common', 'Steam, stools, and a street that feeds you.', 'October–April', '£40–70', 'LHR', 'TPE', 'night'],
  ['Olive Grove Magnet', 'Greece', 'Country', 'common', 'Silver leaves and a hill you walk slowly.', 'May–June and September', '£50–90', 'LHR', 'ATH', 'desert'],
  ['Funicular Magnet', 'Chile', 'City', 'common', 'A box that climbs a painted hill.', 'October–April', '£35–60', 'LHR', 'SCL', 'city'],
  ['Tea Hill Magnet', 'Sri Lanka', 'Mountains', 'common', 'Green clipped into the shape of the slope.', 'December–March', '£25–50', 'LHR', 'CMB', 'jungle'],
  ['Ice Hotel Magnet', 'Sweden', 'Ice', 'common', 'A room that exists until spring.', 'December–March', '£100–180', 'LHR', 'KRN', 'ice'],
  ['Coral Garden Magnet', 'Maldives', 'Reef', 'common', 'Colour under a very clear roof of water.', 'December–April', '£80–150', 'LHR', 'MLE', 'coast'],
  ['Castle Walk Magnet', 'Wales', 'Mountains', 'common', 'Stone on a ridge and a long view west.', 'May–September', '£50–90', 'LHR', 'CWL', 'peaks'],
  ['Bazaar Arch Magnet', 'Turkey', 'City', 'common', 'Lamps, brass, and a lane that folds back.', 'April–June and September', '£40–70', 'LHR', 'IST', 'night'],
  ['Alpine Lake Magnet', 'Italy', 'Mountains', 'common', 'Boats the colour of the shutters.', 'June–September', '£80–140', 'LHR', 'MXP', 'lake'],
  ['Street Art Magnet', 'Germany', 'City', 'common', 'A wall that changed its mind.', 'May–September', '£60–100', 'LHR', 'BER', 'city'],
  ['Fishing Boat Magnet', 'Greece', 'Coast', 'common', 'Blue hull, white wake, nowhere urgent.', 'May–September', '£50–90', 'LHR', 'JTR', 'coast'],
  ['Cabin Porch Magnet', 'Canada', 'Mountains', 'common', 'A chair, a lake, and no agenda.', 'June–September', '£80–140', 'LHR', 'YVR', 'lake']
];

const SKY = {
  peaks: ['#7eb6e0', '#e8f4fb', '#c5d4e0'],
  coast: ['#f2b56b', '#e07a4a', '#f6e2c0'],
  city: ['#9eb4d0', '#f6f1e4', '#d7c4a8'],
  desert: ['#f0a35a', '#f3d2a4', '#c45b3e'],
  jungle: ['#163c28', '#3e8f55', '#d7f0b0'],
  ice: ['#d5e6f2', '#f7fbfe', '#8ea6b8'],
  lake: ['#6ea8c8', '#d7eaf2', '#2c4a44'],
  night: ['#0e1830', '#24385c', '#6b3048']
};

function sun(x, y, r, core, glow) {
  return `<radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${core}"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
  <circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="url(#sun)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${core}"/>`;
}
function caption(label, wide) {
  const w = Math.min(wide - 80, label.length * 15 + 36);
  return `<rect x="24" y="24" width="${w}" height="36" fill="#1b140f" opacity=".9"/>
  <text x="36" y="48" fill="#f6edd6" font-family="Georgia, 'Times New Roman', serif" font-size="20" letter-spacing="2">${esc(label.toUpperCase())}</text>`;
}

function bodyOf(kind, i, pal, wide, tall) {
  const sx = 80 + (i * 47) % (wide - 160);
  const land = pal[2];
  const sea = kind === 'night' ? '#0a1020' : '#1d4e68';
  const accent = kind === 'jungle' ? '#d6f08a' : kind === 'night' ? '#ffd27a' : '#fff4d2';
  if (kind === 'peaks' || kind === 'ice') {
    return `${sun(sx, 90, 28, accent, pal[0])}
    <path d="M0 ${tall * .55} L${wide * .15} ${tall * .32} L${wide * .28} ${tall * .48} L${wide * .42} ${tall * .28} L${wide * .55} ${tall * .5} L${wide * .7} ${tall * .3} L${wide * .85} ${tall * .46} L${wide} ${tall * .36} L${wide} ${tall * .72} L0 ${tall * .72} Z" fill="${land}"/>
    <rect y="${tall * .68}" width="${wide}" height="${tall * .32}" fill="${kind === 'ice' ? '#e7f2f8' : sea}"/>`;
  }
  if (kind === 'coast' || kind === 'lake') {
    return `${sun(sx, 84, 30, accent, pal[0])}
    <path d="M0 ${tall * .5} C${wide * .3} ${tall * .42}, ${wide * .6} ${tall * .58}, ${wide} ${tall * .46} L${wide} ${tall * .62} L0 ${tall * .66} Z" fill="${land}"/>
    <rect y="${tall * .6}" width="${wide}" height="${tall * .4}" fill="${sea}"/>
    <path d="M${wide * .15} ${tall * .58} l18 -26 h10 l-8 26 z" fill="#f4efe6"/>`;
  }
  if (kind === 'desert') {
    return `${sun(sx, 88, 32, '#fff1c4', pal[0])}
    <path d="M0 ${tall * .62} C${wide * .2} ${tall * .4}, ${wide * .45} ${tall * .7}, ${wide * .7} ${tall * .48} C${wide * .85} ${tall * .38}, ${wide} ${tall * .5}, ${wide} ${tall * .5} L${wide} ${tall} L0 ${tall} Z" fill="${land}"/>
    <path d="M0 ${tall * .75} C${wide * .3} ${tall * .66}, ${wide * .6} ${tall * .82}, ${wide} ${tall * .7} L${wide} ${tall} L0 ${tall} Z" fill="#c47a3a"/>`;
  }
  if (kind === 'jungle') {
    return `<rect width="${wide}" height="${tall}" fill="${pal[0]}"/>
    <circle cx="${wide * .25}" cy="${tall * .42}" r="${tall * .22}" fill="${pal[1]}"/>
    <circle cx="${wide * .55}" cy="${tall * .36}" r="${tall * .26}" fill="${land}"/>
    <circle cx="${wide * .8}" cy="${tall * .46}" r="${tall * .2}" fill="#1f6b3a"/>
    <rect x="${wide * .5}" y="${tall * .5}" width="10" height="${tall * .35}" fill="#3a2a1c"/>
    <rect y="${tall * .78}" width="${wide}" height="${tall * .22}" fill="#0e2a18"/>`;
  }
  if (kind === 'night') {
    return `${sun(sx, tall * .28, 18, '#ffe7a8', '#24385c')}
    <path d="M0 ${tall * .45} C${wide * .2} ${tall * .3}, ${wide * .4} ${tall * .55}, ${wide * .65} ${tall * .34} C${wide * .8} ${tall * .22}, ${wide} ${tall * .4}, ${wide} ${tall * .4} L${wide} ${tall * .7} L0 ${tall * .72} Z" fill="#142033"/>
    <rect y="${tall * .66}" width="${wide}" height="${tall * .34}" fill="#070d18"/>
    ${[0.2, 0.45, 0.7].map(x => `<rect x="${wide * x}" y="${tall * .58}" width="16" height="28" fill="#ffd27a" opacity=".85"/>`).join('')}`;
  }
  const blocks = [0.08, 0.22, 0.36, 0.5, 0.64, 0.78].map((x, n) => {
    const bh = 40 + ((i * 13 + n * 17) % 70);
    return `<rect x="${wide * x}" y="${tall * .62 - bh}" width="${wide * .12}" height="${bh}" fill="${n % 2 ? land : '#f4efe6'}"/>`;
  }).join('');
  return `${sun(sx, 78, 26, accent, pal[0])}
  <rect y="${tall * .62}" width="${wide}" height="${tall * .38}" fill="${sea}"/>
  ${blocks}`;
}

function writeSvg(file, title, kind, i, square) {
  const wide = square ? 640 : 800;
  const tall = square ? 640 : 500;
  const pal = SKY[kind] || SKY.city;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wide} ${tall}" role="img">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset=".55" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[0]}"/></linearGradient></defs>
<rect width="${wide}" height="${tall}" fill="url(#sky)"/>
${bodyOf(kind, i, pal, wide, tall)}
${caption(title.split(' ')[0], wide)}
<rect x="10" y="10" width="${wide - 20}" height="${tall - 20}" fill="none" stroke="#1b140f" stroke-opacity=".55" stroke-width="4"/>
</svg>`;
  writeFileSync(join(outDir, file), svg);
}

function jsString(s) {
  return `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function emit(seriesId, number, themeName, theme, classes, mythicName, cards, square) {
  cards.forEach((row, i) => {
    const file = `${seriesId}-${String(i + 1).padStart(2, '0')}.svg`;
    writeSvg(file, row[0], row[8], i + (square ? 40 : 0), square);
  });
  const rows = cards.map((row, i) => `    { no: ${i + 1}, rarity: ${jsString(row[3])}, name: ${jsString(row[0])}, country: ${jsString(row[1])}, type: ${jsString(row[2])}, why: ${jsString(row[4])}, when: ${jsString(row[5])}, budget: ${jsString(row[6])}, from: ${jsString(row[7])}, to: ${jsString(row[7] === row[7] ? row[7] : 'LHR')} }`.replace(
    /to: '[^']*'/,
    `to: ${jsString(row[7])}`
  ));
  // The replace above is messy because from and to are both in the tuple as index 7 and I stored only `to` in index 7 and from is always LHR except I put the destination code in index 7.
  return rows;
}

if (S2.length !== 40 || S3.length !== 40) {
  console.error('expected 40 cards', S2.length, S3.length);
  process.exit(1);
}
const counts = list => list.reduce((m, r) => (m[r[3]] = (m[r[3]] || 0) + 1, m), {});
console.log('s2', counts(S2));
console.log('s3', counts(S3));
S2.forEach((row, i) => writeSvg(`s2-${String(i + 1).padStart(2, '0')}.svg`, row[0], row[9], i, false));
S3.forEach((row, i) => writeSvg(`s3-${String(i + 1).padStart(2, '0')}.svg`, row[0], row[9], i + 17, true));
writeFileSync(join(root, 'tools/series-later-data.json'), JSON.stringify({ s2: S2, s3: S3 }));
console.log('wrote 80 svgs');
