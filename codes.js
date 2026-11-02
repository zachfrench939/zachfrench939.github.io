/* Pack-code validation.
   The repo stores SHA-256 hashes only (see codes.json). Plaintext codes never live here.

   Swap point: replace CodeGate.redeem with a request to your own backend
   (Supabase, Firebase, or similar) when a code must be truly single-use.
   A backend should receive the plaintext once, hash it, check expiry and a
   server-side redemption record, then return { ok, entry }. This browser
   copy can be bypassed by anyone who edits localStorage. */
(() => {
  const USED_KEY = 'st365_codes_used';
  let entries = [];
  const ready = fetch('codes.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error('codes'); return r.json(); })
    .then(j => { entries = Array.isArray(j.codes) ? j.codes : []; })
    .catch(() => { entries = []; });

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function used() {
    try { return JSON.parse(localStorage.getItem(USED_KEY) || '[]'); }
    catch { return []; }
  }

  async function lookup(hash) {
    await ready;
    return entries.find(e => e && e.hash === hash) || null;
  }

  async function redeem(plain) {
    const code = String(plain || '').trim();
    if (!code) return { ok: false, reason: 'empty' };
    if (!crypto.subtle) return { ok: false, reason: 'unsupported' };
    const hash = await sha256(code);
    const entry = await lookup(hash);
    if (!entry) return { ok: false, reason: 'unknown', hash };
    if (entry.expires && Date.now() > Date.parse(entry.expires)) {
      return { ok: false, reason: 'expired', hash, entry };
    }
    const seen = used();
    if (entry.singleUse && seen.includes(hash)) {
      return { ok: false, reason: 'used', hash, entry };
    }
    if (entry.singleUse) {
      seen.push(hash);
      localStorage.setItem(USED_KEY, JSON.stringify(seen));
    }
    return { ok: true, hash, entry };
  }

  window.CodeGate = { redeem, lookup, sha256 };
})();
