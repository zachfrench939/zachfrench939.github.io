# Solo Travel 365

Static site for [zachfrench939.github.io](https://zachfrench939.github.io). No build step: GitHub Pages serves these files as they are.

Series 01 is 40 boarding-pass cards. Series 02 is 40 passport pages and Series 03 is 40 fridge magnets. Each series has its own frame and lithographs in `img/cards/`. Pull rates for every series live in `odds.js`. A series is `series/sN.js` plus `series/sN.css`, registered on `window.SERIES`.

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
node tools/generate-code.mjs --type allcards --label "Full set"
```

The script prints the new code **once** in the terminal and prints an `insert` for `pack_codes` (`hash`, `type`, `packs`, `pack_type`, `boost`, `label`, `expires_at`, `max_uses`). Paste that SQL into the Supabase SQL editor. Do not commit the plaintext code.

- `--type` is `packs` (skip the cooldown, normal odds), `boost` (skip the cooldown and multiply the tier weights you pass), `unlimited` (turn the cooldown off on that browser), or `allcards` (add every card in the current released series, for example all 40 Series 01 cards, and do not start the hourly cooldown).
- `--single-use` sets `max_uses` to 1. That is the default for `packs`, `boost`, and `allcards`. `--multi-use` sets `max_uses` to null. `--max-uses N` sets a specific cap. `unlimited` defaults to no cap.
- `--pack-type` is `standard`, `boosted`, or `foil` (changes the wrapper).
- `--expires YYYY-MM-DD` is optional.
- `--code` sets the plaintext yourself. Your shell history will keep it. The SQL still contains only the hash.

## Solo Journey

The Play page is an idle trip through the Series 01 destinations. Tapping, travelling, and the short challenges earn miles. The pack meter uses `milesPerPack` in `journey-config.js`.

That number is tuned for about 15 minutes of active play: roughly 35 taps a minute, the walking income while the page is open, a challenge every few minutes, and the occasional event. Lower `milesPerPack` if you want a faster pack. Raise it if you want a slower one. The other two settings are `offlineRate` (share of transport income earned while the tab is closed) and `offlineCapMs` (how long that away-from-keyboard income can run, currently 3 hours).

A filled meter adds a Journey pack to the same queue as code packs, so it skips the hourly cooldown and opens with the tear and rarity reveal. Progress is kept in this browser and, once you run `supabase/migrations/20261102210000_journey.sql`, it syncs with the signed-in account.

## Accounts and privacy

This is a good-faith implementation for a UK individual site. It is not legal advice.

Signed-out visitors keep using `localStorage`. Signing in merges that data into the account tables in `supabase/migrations/20261102180000_user_account_data.sql`. Run that SQL yourself in the Supabase SQL editor. It was not applied from this repo.

`allcards` codes add every card in the current released series and do not start the hourly cooldown. The same is true of the one-time welcome pack, which stays pending on the device until the person signs in.

Deleting saved rows uses `delete_my_data()`. Removing the auth user needs the Edge Function in `supabase/functions/delete-account/index.ts`, deployed with the Supabase CLI. Until then, delete removes the collection data and signs the person out, and the login email remains.

Still for Zach to do:

- Fill in the controller name and email on the Privacy notice and Terms pages.
- Consider ICO data protection fee registration and the self-assessment, if they apply to you.
- In Supabase Auth, set the site URL to `https://zachfrench939.github.io` and add redirect URLs for `https://zachfrench939.github.io` and `https://zachfrench939.github.io/#/account`.
- Set the confirmation and password-reset email templates.
- Turn on leaked-password protection and set the minimum password length to at least 8.
- Decide whether email confirmation is required, and confirm the Supabase region and data-processing terms.
- Run the migration SQL, and deploy `delete-account` if logins should be removable from the site.
