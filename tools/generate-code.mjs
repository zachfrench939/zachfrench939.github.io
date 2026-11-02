#!/usr/bin/env node
// Generate a pack code, print it once, and append only its SHA-256 hash to codes.json.
//
//   node tools/generate-code.mjs --type extra --packs 3 --single-use
//   node tools/generate-code.mjs --type boost --packs 1 --boost rare=3,ultra=8,mythic=20 --pack-type boosted --label "Weekend boost"
//   node tools/generate-code.mjs --type extra --packs 2 --expires 2026-12-31 --multi-use
//   node tools/generate-code.mjs --type unlimited --label "Crew"
//
// --code lets you choose the plaintext (it is printed, not written to the repo).
// Shell history may keep that argument. Prefer a random code.

import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIERS = ['common', 'uncommon', 'rare', 'ultra', 'mythic'];
const TYPES = ['boost', 'extra', 'unlimited'];
const PACKS = ['standard', 'boosted', 'foil'];
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'codes.json');

function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(12);
  let s = '';
  for (let i = 0; i < 12; i++) s += alphabet[bytes[i] % alphabet.length];
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

const opt = args(process.argv.slice(2));
if (opt.help || opt.h) {
  console.log('See the header comment in tools/generate-code.mjs and the README.');
  process.exit(0);
}

const type = String(opt.type || '');
if (!TYPES.includes(type)) die('--type must be boost, extra, or unlimited');

const packType = String(opt['pack-type'] || (type === 'boost' ? 'boosted' : 'standard'));
if (!PACKS.includes(packType)) die('--pack-type must be standard, boosted, or foil');

let packs = type === 'unlimited' ? 0 : Number(opt.packs ?? 1);
if (!Number.isInteger(packs) || packs < 0 || (type !== 'unlimited' && packs < 1) || packs > 100) {
  die('--packs must be a whole number from 1 to 100 (0 only for unlimited)');
}

let boost = null;
if (opt.boost) {
  boost = {};
  for (const part of String(opt.boost).split(',')) {
    const [k, v] = part.split('=');
    if (!TIERS.includes(k)) die(`Unknown tier "${k}" in --boost`);
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) die(`Boost for ${k} must be a positive number`);
    boost[k] = n;
  }
} else if (type === 'boost') {
  boost = { rare: 3, ultra: 8, mythic: 20 };
}

let expires = null;
if (opt.expires) {
  const day = String(opt.expires);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day + 'T23:59:59Z'))) {
    die('--expires must be YYYY-MM-DD');
  }
  expires = day + 'T23:59:59Z';
}

const singleUse = type === 'unlimited' ? Boolean(opt['single-use']) : !opt['multi-use'];
const code = opt.code ? String(opt.code).trim() : randomCode();
if (!code || code.length > 80) die('Code must be 1–80 characters');

const hash = createHash('sha256').update(code).digest('hex');
const db = JSON.parse(readFileSync(file, 'utf8'));
if (!Array.isArray(db.codes)) die('codes.json is missing a codes array');
if (db.codes.some(c => c.hash === hash)) die('That code is already in codes.json (same hash). Nothing was written.');

db.codes.push({
  hash,
  type,
  packs,
  packType,
  boost,
  expires,
  singleUse,
  label: opt.label ? String(opt.label).slice(0, 80) : (type === 'unlimited' ? 'Unlimited packs' : type === 'boost' ? 'Boosted pack' : 'Extra pack')
});
writeFileSync(file, JSON.stringify(db, null, 2) + '\n');

console.log('');
console.log('New pack code (copy it now — it is not saved in the repo):');
console.log(code);
console.log('');
console.log(`SHA-256 stored in codes.json: ${hash}`);
console.log(`${type} · ${singleUse ? 'single-use' : 'multi-use'} · pack type ${packType}${expires ? ` · expires ${expires}` : ''}`);
if (boost) console.log('Odds multipliers: ' + Object.entries(boost).map(([k, v]) => `${k} ×${v}`).join(', '));
console.log('');
