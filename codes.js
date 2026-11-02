/* Pack-code redemption.
   The browser hashes the trimmed code with SHA-256 and sends only that hash,
   plus a random per-browser id, to Supabase RPC redeem_code. Plaintext codes
   are never sent and are not stored in this repo.

   The publishable key is anon-safe. pack_codes and code_redemptions are locked
   by row-level security; this page can only call the function. */
(() => {
  const SUPABASE_URL = 'https://bscfakjprzouiizmgvky.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_TthQpJUasgihazHEubJDqg_nAeWp3rc';
  const CLIENT_KEY = 'st365_client';

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function mintId() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function clientId() {
    try {
      let id = localStorage.getItem(CLIENT_KEY);
      if (!id || id.length < 8) {
        id = mintId();
        localStorage.setItem(CLIENT_KEY, id);
      }
      return id;
    } catch {
      if (!window.__st365Client || window.__st365Client.length < 8) window.__st365Client = mintId();
      return window.__st365Client;
    }
  }

  function normalizeEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;
    let boost = entry.boost == null ? null : entry.boost;
    if (typeof boost === 'string') {
      try { boost = JSON.parse(boost); } catch { boost = null; }
    }
    return {
      type: entry.type,
      packs: entry.packs,
      packType: entry.packType || entry.pack_type || 'standard',
      boost,
      label: entry.label || ''
    };
  }

  async function redeem(plain) {
    const code = String(plain || '').trim();
    if (!code) return { ok: false, reason: 'empty' };
    if (!crypto.subtle) return { ok: false, reason: 'unsupported' };
    let hash = '';
    try {
      hash = await sha256(code);
      const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/redeem_code', {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_hash: hash, p_client: clientId() })
      });
      if (!res.ok) return { ok: false, reason: 'network', hash };
      let data = await res.json();
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { data = null; }
      }
      if (!data || typeof data !== 'object') return { ok: false, reason: 'network', hash };
      if (!data.ok) return { ok: false, reason: data.reason || 'unknown', hash };
      return { ok: true, hash, entry: normalizeEntry(data.entry) };
    } catch {
      return { ok: false, reason: 'network', hash };
    }
  }

  window.SUPABASE_PUBLIC = { url: SUPABASE_URL, key: SUPABASE_KEY };
  window.CodeGate = { redeem, sha256, clientId };
})();
