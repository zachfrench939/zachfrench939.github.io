#!/usr/bin/env node
// Generate a pack code, print it once, and print the SQL to insert its hash.
// Nothing is written to the repo. Run the SQL in the Supabase SQL editor.
//
//   node tools/generate-code.mjs --type packs --packs 3 --single-use
//   node tools/generate-code.mjs --type boost --packs 1 --boost rare=3,ultra=8,mythic=20 --pack-type boosted --label "Weekend boost"
//   node tools/generate-code.mjs --type packs --packs 2 --expires 2026-12-31 --multi-use
//   node tools/generate-code.mjs --type unlimited --label "Crew"
//   node tools/generate-code.mjs --type allcards --label "Full set"
//   node tools/generate-code.mjs --type packs --packs 5 --max-uses 10
//
// --code lets you choose the plaintext (it is printed, not written anywhere).
// Shell history may keep that argument. Prefer a random code.

import { createHash, randomBytes } from 'node:crypto';

const TIERS = ['common', 'uncommon', 'rare', 'ultra', 'mythic'];
const TYPES = ['packs', 'boost', 'unlimited', 'allcards'];
const PACKS = ['standard', 'boosted', 'foil'];

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

function sqlString(value) {
  return "'" + String(value).replace(/'/g, "''") + "'";
}

const opt = args(process.argv.slice(2));
if (opt.help || opt.h) {
  console.log('See the header comment in tools/generate-code.mjs and the README.');
  process.exit(0);
}

let type = String(opt.type || '');
if (type === 'extra') type = 'packs';
if (!TYPES.includes(type)) die('--type must be packs, boost, unlimited, or allcards');

const packType = String(opt['pack-type'] || (type === 'boost' ? 'boosted' : 'standard'));
if (!PACKS.includes(packType)) die('--pack-type must be standard, boosted, or foil');

const counted = type === 'packs' || type === 'boost';
let packs = counted ? Number(opt.packs ?? 1) : 0;
if (!Number.isInteger(packs) || packs < 0 || (counted && packs < 1) || packs > 100) {
  die('--packs must be a whole number from 1 to 100 (0 for unlimited and allcards)');
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

if (opt['max-uses'] && opt['multi-use']) die('Use either --max-uses or --multi-use, not both');
let maxUses;
if (opt['max-uses'] != null && opt['max-uses'] !== true) {
  maxUses = Number(opt['max-uses']);
  if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 1000000) die('--max-uses must be a whole number from 1 up');
} else if (opt['multi-use']) {
  maxUses = null;
} else if (type === 'unlimited') {
  maxUses = opt['single-use'] ? 1 : null;
} else {
  maxUses = 1;
}

const code = opt.code ? String(opt.code).trim() : randomCode();
if (!code || code.length > 80) die('Code must be 1–80 characters');

const hash = createHash('sha256').update(code).digest('hex');
const label = opt.label ? String(opt.label).slice(0, 80) : (type === 'allcards' ? 'Full set' : type === 'unlimited' ? 'Unlimited packs' : type === 'boost' ? 'Boosted pack' : 'Extra packs');
const boostSql = boost ? `${sqlString(JSON.stringify(boost))}::jsonb` : 'null';
const expiresSql = expires ? `${sqlString(expires)}::timestamptz` : 'null';
const maxSql = maxUses == null ? 'null' : String(maxUses);

const sql = `insert into pack_codes (hash, type, packs, pack_type, boost, label, expires_at, max_uses)
values (
  ${sqlString(hash)},
  ${sqlString(type)},
  ${packs},
  ${sqlString(packType)},
  ${boostSql},
  ${sqlString(label)},
  ${expiresSql},
  ${maxSql}
);`;

console.log('');
console.log('New pack code (copy it now — it is not saved in the repo):');
console.log(code);
console.log('');
console.log('Run this in the Supabase SQL editor. It stores the hash only:');
console.log(sql);
console.log('');
console.log(`${type} · pack type ${packType} · max_uses ${maxUses == null ? 'unlimited' : maxUses}${expires ? ` · expires ${expires}` : ''}`);
if (boost) console.log('Odds multipliers: ' + Object.entries(boost).map(([k, v]) => `${k} ×${v}`).join(', '));
console.log('');
