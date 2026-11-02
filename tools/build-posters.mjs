#!/usr/bin/env node
// Builds the Series 01 lithograph posters into img/cards/.
// Run: node tools/build-posters.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../img/cards');
mkdirSync(outDir, { recursive: true });

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function grad(id, stops, x2 = '0', y2 = '1') {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
}
function sun(x, y, r, core, glow) {
  return `<radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${core}"/><stop offset=".4" stop-color="${core}"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
  <circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="url(#sun)"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="${core}"/>`;
}
function cloud(x, y, s, c) {
  return `<g fill="${c}" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="${26 * s}" ry="${12 * s}"/><ellipse cx="${x + 22 * s}" cy="${y + 3 * s}" rx="${32 * s}" ry="${14 * s}"/><ellipse cx="${x - 18 * s}" cy="${y + 4 * s}" rx="${20 * s}" ry="${11 * s}"/></g>`;
}
function peaks(color, d) { return `<path d="${d}" fill="${color}"/>`; }
function water(y, c1, c2) {
  let lines = '';
  for (let i = 0; i < 7; i++) {
    const yy = y + 18 + i * 16;
    lines += `<path d="M0 ${yy} C140 ${yy - 8}, 260 ${yy + 10}, 420 ${yy} S 680 ${yy - 6}, 800 ${yy}" fill="none" stroke="${c1}" stroke-opacity="${0.35 - i * 0.03}" stroke-width="2"/>`;
  }
  return `<rect y="${y}" width="800" height="${500 - y}" fill="${c2}"/>${lines}`;
}
function house(x, y, w, h, wall, roof) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wall}"/><path d="M${x - 2} ${y} L${x + w / 2} ${y - h * 0.45} L${x + w + 2} ${y} Z" fill="${roof}"/><rect x="${x + w * 0.35}" y="${y + h * 0.35}" width="${Math.max(4, w * 0.18)}" height="${h * 0.28}" fill="#1c140c" opacity=".55"/>`;
}
function tree(x, y, h, leaf, trunk = '#3a2a1c') {
  return `<rect x="${x - 3}" y="${y}" width="6" height="${h * 0.4}" fill="${trunk}"/><ellipse cx="${x}" cy="${y}" rx="${h * 0.28}" ry="${h * 0.45}" fill="${leaf}"/>`;
}
function caption(label) {
  const w = Math.min(720, label.length * 16 + 36);
  return `<rect x="28" y="28" width="${w}" height="40" fill="#1b140f" opacity=".88"/>
  <text x="42" y="56" fill="#f6edd6" font-family="Georgia, 'Times New Roman', serif" font-size="22" letter-spacing="3">${esc(label.toUpperCase())}</text>`;
}
function frame() {
  return `<rect x="12" y="12" width="776" height="476" fill="none" stroke="#1b140f" stroke-opacity=".55" stroke-width="4"/>`;
}
function hatch(y0, y1, color) {
  let s = '';
  for (let y = y0; y < y1; y += 7) s += `<line x1="0" y1="${y}" x2="800" y2="${y - 18}" stroke="${color}" stroke-opacity=".13" stroke-width="1"/>`;
  return s;
}

function poster(file, title, skyStops, body) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img">
<defs>${grad('sky', skyStops)}</defs>
<rect width="800" height="500" fill="url(#sky)"/>
${body}
${caption(title)}
${frame()}
</svg>`;
  writeFileSync(join(outDir, file), svg);
}

const scenes = {
  's1-01.svg': () => poster('s1-01.svg', 'Positano', ['#f6b26b', '#e36a4f', '#f3d2a4'], `
    ${sun(620, 90, 36, '#fff4d2', '#f6b26b')}
    ${cloud(140, 78, 1.1, '#fff1df')}${cloud(300, 60, .7, '#ffe7d0')}
    ${peaks('#c65a55', 'M0 250 C80 210, 140 280, 220 230 C300 180, 360 260, 460 210 C540 170, 620 240, 800 190 L800 360 L0 360 Z')}
    ${peaks('#e7b5a4', 'M40 280 L90 240 L130 286 L180 220 L230 290 L280 236 L340 300 L40 320 Z')}
    ${water(330, '#f2d2b0', '#2f6f8c')}
    ${Array.from({ length: 18 }, (_, i) => house(70 + (i % 6) * 22 + Math.floor(i / 6) * 10, 250 - Math.floor(i / 6) * 28, 20, 26, ['#fff6ea', '#f3c7b4', '#f7e2c4'][i % 3], '#c4473a')).join('')}
    ${tree(520, 300, 70, '#1f4d38')}${tree(560, 310, 90, '#16382a')}
    ${hatch(340, 442, '#14384a')}`),
  's1-02.svg': () => poster('s1-02.svg', 'Northern lights', ['#07111f', '#12324a', '#1c4a3a'], `
    <path d="M0 40 C90 10, 120 120, 220 50 C320 0, 380 130, 500 40 C600 -10, 700 110, 800 30 L800 220 C680 180, 560 250, 420 190 C280 140, 140 240, 0 180 Z" fill="#b6ff9a" opacity=".75"/>
    <path d="M0 90 C120 40, 200 160, 340 80 C480 10, 560 150, 800 70 L800 260 C620 220, 480 300, 300 230 C140 170, 40 250, 0 210 Z" fill="#7dffa8" opacity=".45"/>
    ${peaks('#0c1c18', 'M0 300 L80 250 L140 290 L220 210 L300 280 L400 190 L500 270 L620 200 L800 260 L800 380 L0 380 Z')}
    ${house(90, 300, 70, 40, '#1a2744', '#6b1d2a')}<rect x="118" y="312" width="16" height="12" fill="#ffe7a0"/>
    ${water(360, '#163028', '#07140f')}`),
  's1-03.svg': () => poster('s1-03.svg', 'Sahara', ['#f0a35a', '#c45b3e', '#7a3b2e'], `
    ${sun(160, 110, 40, '#fff1c9', '#f0a35a')}
    ${Array.from({ length: 28 }, (_, i) => `<circle cx="${(i * 97) % 800}" cy="${20 + (i * 53) % 140}" r="${i % 3 === 0 ? 1.6 : 1}" fill="#fff6df" opacity=".8"/>`).join('')}
    <path d="M0 240 C80 180, 140 280, 240 210 C340 140, 400 260, 520 190 C620 130, 700 230, 800 180 L800 360 L0 360 Z" fill="#e6b15a"/>
    <path d="M0 300 C120 250, 200 340, 340 280 C480 220, 560 330, 800 260 L800 420 L0 420 Z" fill="#c9844a"/>
    <path d="M0 360 C160 320, 280 400, 460 350 C600 310, 700 390, 800 340 L800 442 L0 442 Z" fill="#8d4a32"/>
    <path d="M560 330 C575 300, 590 300, 605 330 L590 328 L575 330 Z" fill="#3a2418"/><ellipse cx="582" cy="332" rx="16" ry="5" fill="#3a2418"/>
    ${hatch(300, 442, '#5a2e22')}`),
  's1-04.svg': () => poster('s1-04.svg', 'Dolomites', ['#9fd0ea', '#e8f4fb', '#d5e6ef'], `
    ${sun(120, 80, 28, '#fff', '#d5eefb')}
    ${peaks('#8ea4b3', 'M0 280 L70 160 L130 250 L210 90 L280 240 L360 70 L450 230 L540 100 L640 220 L720 140 L800 230 L800 360 L0 360 Z')}
    ${peaks('#f7f4ef', 'M190 150 L210 90 L230 150 Z M340 130 L360 70 L380 130 Z')}
    ${peaks('#5e7384', 'M0 320 L90 250 L160 310 L250 230 L340 320 L430 240 L540 330 L640 250 L800 320 L800 400 L0 400 Z')}
    <ellipse cx="400" cy="390" rx="220" ry="28" fill="#3f7ea1"/>
    <ellipse cx="400" cy="394" rx="180" ry="14" fill="#d5eef8" opacity=".55"/>
    ${tree(80, 360, 80, '#2f4a38')}${tree(130, 370, 60, '#1e3a2c')}`),
  's1-05.svg': () => poster('s1-05.svg', 'Amalfi', ['#8ec8e8', '#f2d7a2', '#e7c39a'], `
    ${sun(640, 100, 34, '#fff6df', '#f2d7a2')}
    ${peaks('#d86b4a', 'M0 220 C100 160, 180 250, 280 180 C380 110, 460 230, 580 160 C680 110, 740 190, 800 150 L800 340 L0 340 Z')}
    ${water(310, '#d7e6ef', '#1f6f8a')}
    <path d="M40 300 C120 260, 180 320, 260 270 C340 230, 420 310, 520 250" fill="none" stroke="#f4e6c8" stroke-width="8"/>
    ${house(200, 230, 36, 40, '#fff6ea', '#c4473a')}${house(250, 210, 28, 32, '#f3c7b4', '#a33b32')}
    ${tree(620, 280, 70, '#1f4d38')}`),
  's1-06.svg': () => poster('s1-06.svg', 'Cappadocia', ['#f3b183', '#f6d7b0', '#e7c4a8'], `
    ${sun(100, 90, 30, '#fff1d4', '#f3b183')}
    ${[180, 300, 430].map((x, i) => `<ellipse cx="${x}" cy="${70 + i * 8}" rx="22" ry="30" fill="${['#e24b3a', '#f6d98a', '#c9846a'][i]}"/><path d="M${x - 6} ${100 + i * 8} L${x} ${118 + i * 8} L${x + 6} ${100 + i * 8} Z" fill="#5a3a32"/>`).join('')}
    <path d="M80 300 C100 180, 140 180, 160 300 Z" fill="#c9846a"/><path d="M200 320 C230 140, 280 150, 300 320 Z" fill="#a86858"/><path d="M340 310 C360 200, 400 190, 430 310 Z" fill="#d7a48a"/>
    <path d="M0 340 C200 300, 400 380, 800 320 L800 442 L0 442 Z" fill="#8d5a6a"/>
    ${hatch(340, 442, '#5a3040')}`),
  's1-07.svg': () => poster('s1-07.svg', 'Lofoten', ['#6ea0c4', '#d5e4ef', '#b7c9d4'], `
    ${sun(80, 70, 22, '#fff', '#d5e4ef')}
    ${peaks('#3e5c4e', 'M0 260 L60 180 L120 250 L200 80 L280 240 L360 60 L460 220 L560 90 L660 230 L760 120 L800 200 L800 360 L0 360 Z')}
    ${peaks('#1d4e68', 'M180 160 L200 80 L230 170 Z M340 140 L360 60 L390 150 Z')}
    ${house(70, 280, 50, 36, '#b42316', '#1b140f')}${house(140, 290, 40, 30, '#f4e6c8', '#6b1d2a')}
    ${water(330, '#d5e4ef', '#1d4e68')}`),
  's1-08.svg': () => poster('s1-08.svg', 'Amazon', ['#163c28', '#2f6b3a', '#1d4d3a'], `
    <circle cx="620" cy="70" r="28" fill="#d6f5a3"/>
    ${[40, 140, 250, 380, 520, 660].map((x, i) => `<circle cx="${x}" cy="${90 + (i % 3) * 20}" r="${50 + (i % 3) * 16}" fill="${['#0e2a18', '#1d4d3a', '#2f6b3a'][i % 3]}"/>`).join('')}
    <rect y="300" width="800" height="142" fill="#0c3a38"/>
    <path d="M0 330 C160 300, 240 360, 400 320 S 640 360, 800 310 L800 442 L0 442 Z" fill="#1a5c48"/>
    <path d="M120 250 L160 120 L200 250" fill="none" stroke="#d6f5a3" stroke-width="3"/><path d="M480 260 L500 140 L530 270" fill="none" stroke="#e7ffb0" stroke-width="3"/>
    ${hatch(300, 442, '#062018')}`),
  's1-09.svg': () => poster('s1-09.svg', 'Daintree', ['#11402c', '#3e8f55', '#e7f2c4'], `
    ${sun(140, 80, 26, '#e7ffb0', '#3e8f55')}
    ${[60, 180, 300, 440, 580, 700].map((x, i) => tree(x, 250 - (i % 2) * 20, 120 + (i % 3) * 20, ['#0c2416', '#145c32', '#1f6b3a'][i % 3])).join('')}
    <path d="M500 180 C520 240, 540 240, 560 320" fill="none" stroke="#9fd0ea" stroke-width="10"/>
    <path d="M0 360 C200 330, 400 400, 800 340 L800 442 L0 442 Z" fill="#0e2a18"/>
    <rect x="80" y="340" width="120" height="8" fill="#c4a574"/>`),
  's1-20.svg': () => poster('s1-20.svg', 'Great Barrier Reef', ['#0c4c6e', '#1a8ea0', '#083044'], `
    ${sun(400, 40, 30, '#fff6d0', '#7ec8c8')}
    ${[0, 1, 2, 3, 4].map(i => `<path d="M${80 + i * 40} 0 L${120 + i * 50} 280" stroke="#fff6d0" stroke-opacity=".18" stroke-width="28"/>`).join('')}
    <path d="M0 150 C200 120, 400 190, 800 130 L800 200 L0 200 Z" fill="#14624a"/>
    ${[80, 200, 340, 500, 660].map((x, i) => `<ellipse cx="${x}" cy="${250 + (i % 2) * 30}" rx="${70 + i * 4}" ry="${28 + (i % 3) * 6}" fill="${['#e07a3a', '#f2c14a', '#c4476a', '#2f8f78', '#d86b4a'][i]}"/>
      <path d="M${x - 20} ${230 + (i % 2) * 30} C${x} ${200 + i * 6}, ${x + 30} ${210}, ${x + 10} ${250}" fill="none" stroke="${['#fff1df', '#ffe7a0', '#f6b4c4', '#d6f5e4', '#fff'][i]}" stroke-width="4"/>`).join('')}
    ${[40, 160, 300, 480, 640].map((x, i) => `<ellipse cx="${x}" cy="${340 + (i % 3) * 18}" rx="16" ry="7" fill="#14384a"/><path d="M${x + 14} ${340 + (i % 3) * 18} l12 -6 l-12 4 z" fill="#0c2430"/>`).join('')}
    ${water(400, '#9ad7e0', '#0a3044')}`),
};

// Remaining posters share the same lithograph kit with a unique landmark stack.
const more = [
  ['s1-10.svg', 'Christmas markets', ['#1b2744', '#3a2a38', '#6b1d2a'], (p) => `${p.sun(500, 70, 18, '#ffd978', '#3a2a38')}${[80, 200, 340, 480, 620].map((x, i) => `<path d="M${x} 180 L${x + 50} 280 L${x - 50} 280 Z" fill="${i % 2 ? '#c9a15a' : '#8d1e2a'}"/><rect x="${x - 8}" y="280" width="16" height="50" fill="#1b140f"/>`).join('')}<rect y="340" width="800" height="102" fill="#120c18"/>`],
  ['s1-11.svg', 'Tenerife', ['#7ec8ea', '#f6e3b0', '#2f6f4a'], (p) => `${p.sun(180, 100, 34, '#fff', '#f6e3b0')}<path d="M260 340 L400 120 L520 340 Z" fill="#5c4636"/><path d="M360 200 L400 120 L430 190 Z" fill="#f4f1ea"/><path d="M0 360 C200 330, 600 390, 800 340 L800 442 L0 442 Z" fill="#1a6f93"/>`],
  ['s1-12.svg', 'Bali terraces', ['#b7d98a', '#e7f2c4', '#3f7a32'], (p) => `${p.sun(640, 80, 26, '#fff8d8', '#e7f2c4')}${[0, 1, 2, 3, 4, 5].map(i => `<path d="M0 ${160 + i * 36} Q400 ${120 + i * 36} 800 ${170 + i * 36}" fill="none" stroke="${i % 2 ? '#2f6a32' : '#5a8f3a'}" stroke-width="22"/>`).join('')}${p.tree(120, 300, 90, '#145c32')}<path d="M560 80 C580 160, 600 160, 620 300" fill="none" stroke="#7eb6e0" stroke-width="8"/>`],
  ['s1-13.svg', 'Andalucía', ['#9fd4ef', '#f7f1e4', '#d7e6ef'], (p) => `${p.sun(100, 80, 28, '#fff', '#f7f1e4')}<path d="M200 360 L280 180 L360 360 Z" fill="#c4b49a"/>${[0, 1, 2, 3, 4].map(i => p.house(230 + i * 22, 240 - i * 16, 26, 30, '#f7f4ef', '#c4503a')).join('')}${p.tree(500, 320, 70, '#3d6b3a')}<rect y="360" width="800" height="82" fill="#e7d3b0"/>`],
  ['s1-14.svg', 'Swiss Alps', ['#7eb6e0', '#f4fbff', '#d5dde6'], (p) => `${p.sun(80, 70, 24, '#fff', '#d5eefb')}<path d="M0 300 L120 140 L200 260 L320 60 L440 250 L560 90 L700 240 L800 160 L800 380 L0 380 Z" fill="#4d7594"/><path d="M280 140 L320 60 L360 140 Z" fill="#fff"/><path d="M520 160 L560 90 L600 160 Z" fill="#fff"/>${p.tree(60, 320, 70, '#1e3a2c')}<rect x="40" y="300" width="90" height="10" fill="#c4503a"/>`],
  ['s1-15.svg', 'Safari', ['#f2b15a', '#f6d59a', '#c47a32'], (p) => `${p.sun(140, 110, 36, '#fff1c4', '#f2b15a')}<path d="M0 340 C200 300, 500 390, 800 320 L800 442 L0 442 Z" fill="#6b4a28"/><path d="M520 340 L560 200 L600 340" fill="#2f4a28"/><ellipse cx="560" cy="190" rx="46" ry="18" fill="#1e3a22"/><ellipse cx="180" cy="360" rx="28" ry="12" fill="#3a2418"/><circle cx="200" cy="350" r="8" fill="#3a2418"/>`],
  ['s1-16.svg', 'October colour', ['#e7a15a', '#f3d2a4', '#6e4428'], (p) => `${p.sun(600, 90, 30, '#ffe1a8', '#e7a15a')}${[80, 200, 320, 460, 600].map((x, i) => p.tree(x, 280, 110, ['#a33b24', '#e07a3a', '#c45a28', '#6e4428', '#d86b4a'][i])).join('')}<ellipse cx="400" cy="390" rx="240" ry="26" fill="#3d6f8f"/>`],
  ['s1-17.svg', 'January sun', ['#5eb0d8', '#f6e7c0', '#147ea0'], (p) => `${p.sun(200, 100, 40, '#fff', '#f6e7c0')}${p.tree(620, 300, 100, '#2f6f4a')}${p.tree(700, 320, 70, '#1f4d38')}${p.water(320, '#f6e7c0', '#147ea0')}`],
  ['s1-18.svg', 'Thailand', ['#f0a06a', '#f6d2a4', '#1f6f62'], (p) => `${p.sun(620, 90, 32, '#fff4df', '#f0a06a')}<path d="M80 200 L160 80 L200 200 Z" fill="#1f4d3a"/><path d="M200 210 L300 60 L340 210 Z" fill="#16382a"/><path d="M360 190 L430 100 L470 190 Z" fill="#2f6a4a"/>${p.water(280, '#f6d2a4', '#0e4e68')}<path d="M80 340 L140 300 L150 360 Z" fill="#f4e6c8"/><path d="M70 348 H220 L200 370 H90 Z" fill="#6b3a2a"/>`],
  ['s1-19.svg', 'Kraków', ['#c9b7d4', '#efe6d6', '#6d2430'], (p) => `${p.cloud(200, 80, 1, '#fff')}<rect x="180" y="180" width="440" height="160" fill="#efe6d6"/><path d="M180 180 L400 80 L620 180 Z" fill="#6d2430"/><rect x="360" y="80" width="40" height="120" fill="#8d2430"/><rect x="250" y="230" width="40" height="70" fill="#1b140f" opacity=".35"/><rect x="500" y="220" width="50" height="80" fill="#1b140f" opacity=".35"/><rect y="340" width="800" height="102" fill="#d8c4a0"/>`],
  ['s1-21.svg', 'Europe by rail', ['#d7e6c8', '#f4efe4', '#8aa0a8'], (p) => `${p.sun(80, 70, 22, '#fff6d0', '#f4efe4')}<path d="M0 260 L800 180 L800 360 L0 360 Z" fill="#3d4a38"/><rect x="180" y="250" width="220" height="50" rx="8" fill="#c4503a"/><rect x="300" y="220" width="70" height="80" fill="#1b2a4a"/><circle cx="220" cy="310" r="16" fill="#1b140f"/><circle cx="340" cy="310" r="16" fill="#1b140f"/><path d="M0 330 H800" stroke="#c4a574" stroke-width="4"/>`],
  ['s1-22.svg', 'Portugal coast', ['#8ec4e0', '#f7e2b8', '#e07a3a'], (p) => `${p.sun(500, 90, 32, '#fff', '#f7e2b8')}<path d="M0 240 L120 160 L180 230 L280 120 L360 220 L800 180 L800 340 L0 340 Z" fill="#e07a3a"/>${p.water(300, '#f7e2b8', '#1a6a8a')}${p.house(200, 200, 30, 36, '#fff', '#c4503a')}`],
  ['s1-23.svg', 'Golden hour', ['#f2a04a', '#f6c98a', '#5c3a28'], (p) => `${p.sun(400, 160, 48, '#fff1c4', '#f2a04a')}<path d="M360 442 L430 200 L470 442 Z" fill="#2a2420"/><path d="M430 280 H470" stroke="#f6edd6" stroke-width="8"/><path d="M0 300 L800 220 L800 360 L0 360 Z" fill="#6b4428"/>`],
  ['s1-24.svg', 'Winter sun', ['#f0c07a', '#f6e2b4', '#1a6f93'], (p) => `${p.sun(160, 90, 36, '#fff', '#f6e2b4')}${p.tree(600, 280, 110, '#2f8f78')}${p.tree(700, 300, 80, '#1f6b62')}${p.water(320, '#fff', '#1a6f93')}`],
  ['s1-25.svg', 'One way', ['#6e8cae', '#d5e0ea', '#243044'], (p) => `${p.sun(640, 80, 26, '#fff', '#d5e0ea')}<path d="M200 442 L380 160 L460 442 Z" fill="#243044"/><rect x="300" y="220" width="70" height="40" fill="#c9844a"/><text x="312" y="246" fill="#1b140f" font-size="18" font-family="Georgia">ONE WAY</text><path d="M0 300 L800 240 L800 360 L0 360 Z" fill="#3a4554"/>`],
  ['s1-26.svg', 'Kyoto', ['#1a1428', '#3a2438', '#6b1d2a'], (p) => `${[120, 240, 380, 520, 660].map((x, i) => `<line x1="${x}" y1="40" x2="${x}" y2="${120 + i * 10}" stroke="#e8b15a" stroke-width="3"/><rect x="${x - 18}" y="${120 + i * 10}" width="36" height="48" rx="4" fill="${i % 2 ? '#c4473a' : '#e8b15a'}"/>`).join('')}<path d="M0 360 L800 300 L800 442 L0 442 Z" fill="#120c16"/>`],
  ['s1-27.svg', 'Reykjavík', ['#16324a', '#4d6d86', '#1c2838'], (p) => `${p.sun(80, 200, 20, '#d5e6f2', '#4d6d86')}${[80, 150, 220, 300].map((x, i) => p.house(x, 250, 50, 60, ['#c4503a', '#f2c14a', '#2f6f8a', '#f4efe6'][i], '#1b140f')).join('')}<path d="M400 300 L520 140 L640 300 Z" fill="#2a3a4a"/>${p.water(340, '#9fb4c4', '#1a3344')}`],
  ['s1-28.svg', 'Ha Long', ['#8eb8c8', '#d5e4ea', '#1a3d4a'], (p) => `${p.sun(120, 80, 24, '#fff', '#d5e4ea')}<path d="M200 340 L280 80 L340 340 Z" fill="#3d5a4a"/><path d="M360 360 L460 40 L540 360 Z" fill="#2c4a3c"/><path d="M560 330 L620 120 L680 330 Z" fill="#1e3a32"/>${p.water(300, '#fff', '#1a3d4a')}<path d="M60 360 L120 300 L130 370 Z" fill="#6b3a2a"/><path d="M40 368 H200 L180 392 H60 Z" fill="#3a2418"/>`],
  ['s1-29.svg', 'Machu Picchu', ['#6ea86a', '#d7e6b4', '#3d6b3a'], (p) => `${p.sun(100, 70, 24, '#fff8d8', '#d7e6b4')}<path d="M300 200 L420 60 L540 200 Z" fill="#4d6b48"/>${[0, 1, 2, 3, 4].map(i => `<path d="M180 ${240 + i * 28} H620" stroke="${i % 2 ? '#6b5430' : '#3d6b3a'}" stroke-width="16"/>`).join('')}<rect x="340" y="180" width="80" height="40" fill="#c4b49a"/>`],
  ['s1-30.svg', 'Dubrovnik', ['#7eb4d8', '#f6e2c4', '#1f6a8a'], (p) => `${p.sun(80, 80, 26, '#fff', '#f6e2c4')}<path d="M120 200 H680 V340 H120 Z" fill="#e7d3b0"/><path d="M120 200 H680" stroke="#c4503a" stroke-width="16"/>${[160, 240, 320, 400, 480, 560].map(x => `<path d="M${x} 200 L${x + 28} 150 L${x + 56} 200 Z" fill="#a33b24"/>`).join('')}${p.water(340, '#fff', '#1f6a8a')}`],
  ['s1-31.svg', 'Milford Sound', ['#8aa8b4', '#d5e2e6', '#2c3e3a'], (p) => `${cloud(200, 70, 1.4, '#f4f7f6')}<path d="M0 180 L180 80 L220 220 L400 40 L460 200 L800 100 L800 360 L0 360 Z" fill="#2c3e3a"/><path d="M400 40 L430 200" stroke="#d5e2e6" stroke-width="6"/>${p.water(320, '#c5d4d8', '#1a3338')}`],
  ['s1-32.svg', 'Santorini', ['#6eb0e0', '#f4d2a8', '#1a6ea8'], (p) => `${p.sun(620, 90, 30, '#fff', '#f4d2a8')}<path d="M0 260 C200 200, 400 320, 800 220 L800 400 L0 400 Z" fill="#1a3d5c"/>${[120, 200, 280, 360].map((x, i) => `<rect x="${x}" y="${180 - i * 10}" width="50" height="70" fill="#f7f4ef"/><path d="M${x + 10} ${180 - i * 10} Q${x + 25} ${150 - i * 10} ${x + 40} ${180 - i * 10}" fill="#1a4c78"/>`).join('')}${p.water(340, '#fff', '#1a6ea8')}`],
  ['s1-33.svg', 'Marrakech', ['#c45a3a', '#e8a06a', '#6b2430'], (p) => `${p.sun(100, 80, 28, '#ffe1a8', '#e8a06a')}<rect x="360" y="80" width="36" height="220" fill="#f3d2a4"/><path d="M360 80 L378 40 L396 80 Z" fill="#c9a15a"/>${[80, 180, 500, 620].map((x, i) => `<path d="M${x} 220 L${x + 60} 300 L${x - 20} 300 Z" fill="${i % 2 ? '#e6b15a' : '#8d1e2a'}"/>`).join('')}<rect y="320" width="800" height="122" fill="#6b2430"/>`],
  ['s1-34.svg', 'Banff', ['#7eb6e0', '#e7f4fb', '#4d6b58'], (p) => `${p.sun(80, 70, 22, '#fff', '#e7f4fb')}<path d="M200 300 L320 80 L420 300 Z" fill="#4d7594"/><path d="M300 160 L320 80 L340 160 Z" fill="#fff"/><path d="M460 320 L560 120 L660 320 Z" fill="#3e5c4e"/>${p.water(300, '#fff', '#1aa0a8')}${p.tree(80, 300, 80, '#1e3a2c')}`],
  ['s1-35.svg', 'Petra', ['#e7b48a', '#f6ddc4', '#c4714a'], (p) => `<path d="M0 0 H220 V442 H0 Z" fill="#a86858"/><path d="M580 0 H800 V442 H580 Z" fill="#8d4e3a"/><path d="M260 200 H540 V380 H260 Z" fill="#f3d2a4"/><path d="M300 200 L400 90 L500 200 Z" fill="#e7b48a"/><rect x="360" y="230" width="80" height="110" fill="#6b3a32"/><circle cx="400" cy="160" r="28" fill="#c4714a"/>`],
  ['s1-36.svg', 'Edinburgh', ['#8aa0b4', '#d5dde6', '#3a4554'], (p) => `${p.cloud(160, 70, 1.2, '#f4f7f6')}<path d="M300 340 L380 120 L520 340 Z" fill="#3a4554"/><rect x="390" y="140" width="90" height="50" fill="#6d2430"/><rect x="420" y="100" width="20" height="50" fill="#1b140f"/>${[80, 140, 200].map((x, i) => p.house(x, 260, 40, 70, '#c4b49a', '#3a4554')).join('')}<rect y="340" width="800" height="102" fill="#2a3340"/>`],
  ['s1-37.svg', 'Lisbon tram', ['#f2c14a', '#f6e2b0', '#3d6f8f'], (p) => `${p.sun(80, 80, 26, '#fff', '#f6e2b0')}<path d="M0 220 L800 140 L800 300 L0 320 Z" fill="#e7d3b0"/>${[200, 280, 360, 440].map((x, i) => `<rect x="${x}" y="${160 + i * 8}" width="40" height="50" fill="${['#f7f4ef', '#f2c14a', '#c4503a', '#3d6f8f'][i]}"/>`).join('')}<rect x="80" y="250" width="160" height="70" rx="10" fill="#f2c14a"/><rect x="100" y="265" width="36" height="28" fill="#1b2a4a"/><circle cx="120" cy="330" r="12" fill="#1b140f"/><circle cx="200" cy="330" r="12" fill="#1b140f"/>`],
  ['s1-38.svg', 'Svalbard', ['#d5e6f2', '#f7fbfe', '#9fb4c4'], (p) => `${p.sun(120, 90, 22, '#fff', '#d5e6f2')}<path d="M0 220 L100 120 L180 240 L300 60 L400 230 L520 100 L640 220 L800 80 L800 380 L0 380 Z" fill="#e7f1f6"/><path d="M260 140 L300 60 L340 150 Z" fill="#fff"/><path d="M0 340 C200 300, 500 390, 800 320 L800 442 L0 442 Z" fill="#6e8ca0"/>`],
  ['s1-39.svg', 'Atacama', ['#f2e6c8', '#fffaf0', '#e8dcc0'], (p) => `${p.sun(400, 80, 30, '#fff', '#f2e6c8')}<path d="M0 200 L800 160 L800 280 L0 300 Z" fill="#c4b49a"/>${[60, 180, 300, 440, 580, 700].map(x => `<polygon points="${x},300 ${x + 40},340 ${x},380 ${x - 40},340" fill="#f7f4ef" stroke="#c4b49a"/>`).join('')}<path d="M80 250 C160 180, 200 180, 260 250" fill="#7eb8c8" opacity=".8"/>`],
  ['s1-40.svg', 'Faroe cliffs', ['#9eb8c4', '#d5e2e6', '#3d6b4a'], (p) => `${cloud(500, 70, 1.3, '#f4f7f4')}<path d="M0 180 L200 120 L220 360 L0 400 Z" fill="#3d6b4a"/><path d="M180 160 L400 80 L420 420 L200 400 Z" fill="#2f5a3c"/><path d="M300 80 L320 300" stroke="#d5e2e6" stroke-width="8"/>${p.house(60, 200, 40, 28, '#6b1d2a', '#1e3a2c')}${p.water(360, '#fff', '#1a3d4e')}`],
];

const api = { sun, cloud, tree, house, water, hatch };
for (const build of Object.values(scenes)) build();
for (const [file, title, sky, draw] of more) poster(file, title, sky, draw(api));

console.log('wrote', 8 + more.length, 'posters to', outDir);
