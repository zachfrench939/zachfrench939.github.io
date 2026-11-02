# Solo Travel 365

Static site for [zachfrench939.github.io](https://zachfrench939.github.io). No build step: GitHub Pages serves these files as they are.

Series 01 is a set of 40 boarding-pass cards. Pull rates live in `odds.js`. Each series is a folder-level pair of `series/sN.js` (data + card template) and `series/sN.css`. Series 02 (passport) and Series 03 (fridge magnet) are coming-soon placeholders. To add a series, copy one of those pairs, push an object onto `window.SERIES`, and add the stylesheet and script tags in `index.html`.

Packs open once an hour unless a code says otherwise. The Vault stores the collection in this browser's `localStorage`.

## Pack codes

Codes unlock special packs: extra packs that skip the one-hour cooldown, bonus packs with boosted odds, or unlimited packs (no cooldown). **Only SHA-256 hashes are stored in `codes.json`.** Plaintext codes are never committed.

The check runs in the browser (`codes.js`, `CodeGate.redeem`). That is enough to stop casual sharing from being obvious, and it is **not** real security. Anyone who can edit their browser storage, or who reads the hash list, can bypass a client-side single-use flag. True single-use needs a backend that records redemptions somewhere the visitor cannot edit — for example Supabase or Firebase: the page sends the code to a function, the function hashes it, checks expiry and a server-side “already used” row, then returns the reward. When you add that, replace `CodeGate.redeem` in `codes.js` and leave the packs UI as it is.

### Generate a code

From the repo root, with Node:

```bash
node tools/generate-code.mjs --type extra --packs 3 --single-use
node tools/generate-code.mjs --type boost --packs 1 --boost rare=3,ultra=8,mythic=20 --pack-type boosted --label "Weekend boost"
node tools/generate-code.mjs --type extra --packs 2 --expires 2026-12-31 --multi-use
node tools/generate-code.mjs --type unlimited --label "Crew"
```

The script prints the new code **once** in the terminal and appends only the hash to `codes.json`. Copy the code before you close the terminal. Commit the updated `codes.json`. Do not commit a file of plaintext codes.

- `--type` is `extra` (skip the cooldown, normal odds), `boost` (skip the cooldown, multiply the tier weights you pass), or `unlimited` (turn the cooldown off on that browser).
- `--single-use` is the default except for `unlimited`, which is multi-use unless you pass `--single-use`. Multi-use codes repeat until they expire.
- `--pack-type` is `standard`, `boosted`, or `foil` (changes the wrapper).
- `--expires YYYY-MM-DD` is optional.
- `--code` sets the plaintext yourself. Your shell history will keep it. The repo still only gets the hash.

An unlimited-packs code is already listed in `codes.json` as a hash. It is not written anywhere else in the source.
