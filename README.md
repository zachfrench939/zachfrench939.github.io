# Solo Travel 365

Static site for [zachfrench939.github.io](https://zachfrench939.github.io). No build step: GitHub Pages serves these files as they are.

Series 01 is a set of 40 boarding-pass cards. Pull rates live in `odds.js`. Each series is a folder-level pair of `series/sN.js` (data + card template) and `series/sN.css`. Series 02 (passport) and Series 03 (fridge magnet) are coming-soon placeholders. To add a series, copy one of those pairs, push an object onto `window.SERIES`, and add the stylesheet and script tags in `index.html`.

Packs open once an hour unless a code says otherwise. The Vault stores the collection in this browser's `localStorage`.

## Pack codes

Codes unlock special packs: extra packs that skip the one-hour cooldown (`packs`), packs with boosted odds (`boost`), or unlimited packs with no cooldown (`unlimited`). Plaintext codes are never stored in this repo and are never sent to the server.

Redemption goes through Supabase. The project URL and the publishable (anon) key live in `codes.js`. `CodeGate.redeem` hashes the trimmed code with SHA-256 in the browser, then `POST`s `{ p_hash, p_client }` to `/rest/v1/rpc/redeem_code`. `p_client` is a random id kept in `localStorage` (`st365_client`). The tables `pack_codes` and `code_redemptions` have row-level security turned on, so the site cannot read them. It can only call the function.

The function returns `{ ok: true, entry: { type, packs, packType, boost, label } }` or `{ ok: false, reason }` where `reason` is `unknown`, `expired`, `used`, or `invalid`. If the request fails, the form says the code server could not be reached and nothing is granted.

`max_uses` is enforced in Postgres, not in this browser:

- `1` (the default for `packs` and `boost`) means the code can be redeemed once in total.
- A higher number means that many successful redemptions across browsers. The same browser is recognised by `p_client`, so it cannot redeem the same code twice.
- `null` means no cap. The code keeps working until `expires_at`, if that is set.
- `expires_at` null means the code does not expire. A past `expires_at` returns `expired`.

An unlimited-packs code is already in the database as a hash. It is not written in this repo.

### Generate a code

From the repo root, with Node:

```bash
node tools/generate-code.mjs --type packs --packs 3 --single-use
node tools/generate-code.mjs --type boost --packs 1 --boost rare=3,ultra=8,mythic=20 --pack-type boosted --label "Weekend boost"
node tools/generate-code.mjs --type packs --packs 2 --expires 2026-12-31 --multi-use
node tools/generate-code.mjs --type packs --packs 5 --max-uses 10
node tools/generate-code.mjs --type unlimited --label "Crew"
```

The script prints the new code **once** in the terminal and prints an `insert` for `pack_codes` (`hash`, `type`, `packs`, `pack_type`, `boost`, `label`, `expires_at`, `max_uses`). Paste that SQL into the Supabase SQL editor. Do not commit the plaintext code.

- `--type` is `packs` (skip the cooldown, normal odds), `boost` (skip the cooldown and multiply the tier weights you pass), or `unlimited` (turn the cooldown off on that browser).
- `--single-use` sets `max_uses` to 1. That is the default for `packs` and `boost`. `--multi-use` sets `max_uses` to null. `--max-uses N` sets a specific cap. `unlimited` defaults to no cap.
- `--pack-type` is `standard`, `boosted`, or `foil` (changes the wrapper).
- `--expires YYYY-MM-DD` is optional.
- `--code` sets the plaintext yourself. Your shell history will keep it. The SQL still contains only the hash.
