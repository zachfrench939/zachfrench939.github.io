/* Account: Supabase Auth plus collection sync.
   Signed-out play stays in localStorage. Signing in merges that data,
   claims any welcome-pack cards, and upserts the user's own rows.
   Passwords are only sent to Supabase Auth. This file never logs them. */
(() => {
  const cfg = window.SUPABASE_PUBLIC || {};
  const $ = s => document.querySelector(s);
  const redirectTo = () => location.origin + location.pathname + '#/account';
  let client = null;
  let user = null;
  let pushTimer = 0;
  const PREF_KEY = 'st365_signup_prefs';

  function ensureClient() {
    if (client) return client;
    if (!window.supabase || !cfg.url || !cfg.key) return null;
    client = window.supabase.createClient(cfg.url, cfg.key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return client;
  }

  function routeKey() {
    return decodeURIComponent(location.hash.replace(/^#/, '')).replace(/^\//, '').split(/[?#]/)[0];
  }

  function showPanel(name) {
    document.querySelectorAll('[data-auth-panel]').forEach(panel => {
      panel.hidden = panel.dataset.authPanel !== name;
    });
  }

  function setError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message || '';
  }

  function paintNav() {
    const label = user ? 'Account' : 'Sign in';
    document.querySelectorAll('[data-auth-label]').forEach(el => { el.textContent = label; });
    const who = $('#authWho');
    if (who) who.textContent = user ? user.email || 'Signed in' : '';
    const pending = $('#welcomeHint');
    if (pending && window.__collection) {
      const snap = window.__collection.snapshot();
      const w = snap.welcome;
      const waiting = w && w.pending && w.pending.length && !w.claimed;
      pending.hidden = !waiting;
    }
  }

  function showAccount(mode) {
    if (mode === 'recovery') { showPanel('newpass'); return; }
    if (user && (mode === 'account' || mode === 'signin' || mode === '' )) { showPanel('settings'); paintSettings(); return; }
    if (mode === 'signup') { showPanel('signup'); return; }
    if (mode === 'reset') { showPanel('reset'); return; }
    if (user) { showPanel('settings'); paintSettings(); return; }
    showPanel('signin');
  }

  function paintSettings() {
    const email = $('#settingsEmail');
    if (email) email.textContent = user ? user.email || '' : '';
    const box = $('#settingsMarketing');
    if (box && user) box.checked = !!(user.user_metadata && user.user_metadata.marketing_opt_in);
  }

  function authMessage(err, mode) {
    const text = (err && err.message || '').toLowerCase();
    if (text.includes('network') || text.includes('fetch')) return 'Could not reach the account server. Check your connection and try again.';
    if (text.includes('password') && (text.includes('least') || text.includes('short') || text.includes('weak'))) return 'Use at least 8 characters.';
    if (mode === 'signin') return 'Email or password is incorrect, or the email is not confirmed yet.';
    if (mode === 'signup') return 'If this email can be registered, we have sent a confirmation link. If you already have an account, try signing in.';
    if (mode === 'reset') return 'If an account exists for that email, we have sent a reset link.';
    return 'Something went wrong. Please try again.';
  }

  function mergeIds(a, b) {
    const out = { ...(a || {}) };
    Object.entries(b || {}).forEach(([key, ids]) => {
      const set = new Set([...(out[key] || []), ...(Array.isArray(ids) ? ids : [])]);
      out[key] = [...set];
    });
    return out;
  }

  async function pullRemote(uid) {
    const db = ensureClient();
    const [col, pack, pref] = await Promise.all([
      db.from('user_collections').select('cards').eq('user_id', uid).maybeSingle(),
      db.from('user_pack_state').select('queue,unlimited,cooldown_at,last_card').eq('user_id', uid).maybeSingle(),
      db.from('user_preferences').select('marketing_opt_in').eq('user_id', uid).maybeSingle()
    ]);
    if (col.error || pack.error) throw col.error || pack.error;
    return { col: col.data, pack: pack.data, pref: pref.data };
  }

  async function pushState() {
    const db = ensureClient();
    if (!db || !user || !window.__collection) return;
    const snap = window.__collection.snapshot();
    const at = snap.pack && snap.pack.at ? new Date(snap.pack.at).toISOString() : null;
    const col = db.from('user_collections').upsert({ user_id: user.id, cards: snap.collection || {}, updated_at: new Date().toISOString() });
    const pack = db.from('user_pack_state').upsert({
      user_id: user.id,
      queue: snap.queue || [],
      unlimited: !!snap.unlimited,
      cooldown_at: at,
      last_card: (snap.pack && snap.pack.last) || null,
      updated_at: new Date().toISOString()
    });
    await Promise.all([col, pack]);
  }

  function onLocalChange() {
    if (!user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => { pushState().catch(() => {}); }, 400);
  }

  async function applySignupPrefs() {
    if (!user) return;
    let prefs = null;
    try { prefs = JSON.parse(sessionStorage.getItem(PREF_KEY) || 'null'); } catch (err) { prefs = null; }
    if (!prefs) return;
    const db = ensureClient();
    await db.from('user_preferences').upsert({
      user_id: user.id,
      marketing_opt_in: !!prefs.marketing,
      age_confirmed: true,
      terms_accepted_at: prefs.at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    await db.auth.updateUser({ data: { marketing_opt_in: !!prefs.marketing, age_confirmed: true } });
    sessionStorage.removeItem(PREF_KEY);
    user = (await db.auth.getUser()).data.user || user;
  }

  async function syncAccount() {
    if (!user || !window.__collection) return;
    const local = window.__collection.snapshot();
    let remote = { col: null, pack: null };
    try { remote = await pullRemote(user.id); }
    catch (err) { /* Tables may not be created yet. Local play still works. */ }
    let cards = mergeIds(local.collection, remote.col && remote.col.cards);
    const claimed = window.__collection.claimWelcome();
    if (claimed) cards = mergeIds(window.__collection.snapshot().collection, {});
    const localQueue = local.queue || [];
    const remoteQueue = (remote.pack && remote.pack.queue) || [];
    const queue = localQueue.length >= remoteQueue.length ? localQueue : remoteQueue;
    const unlimited = !!(local.unlimited || (remote.pack && remote.pack.unlimited));
    const localAt = local.pack && local.pack.at ? +local.pack.at : 0;
    const remoteAt = remote.pack && remote.pack.cooldown_at ? Date.parse(remote.pack.cooldown_at) : 0;
    const at = Math.max(localAt, remoteAt || 0);
    const last = at === remoteAt && remote.pack ? remote.pack.last_card : (local.pack && local.pack.last);
    window.__collection.apply({
      collection: cards,
      queue,
      unlimited,
      pack: { at: at || 0, last: last || '' }
    });
    try { await pushState(); } catch (err) {}
    try { await applySignupPrefs(); } catch (err) {}
    paintNav();
  }

  async function setSession(session, event) {
    user = session && session.user ? session.user : null;
    paintNav();
    const key = routeKey();
    if (event === 'PASSWORD_RECOVERY') {
      if (!/account$/.test(routeKey())) location.hash = '#/account';
      showAccount('recovery');
    } else if (event === 'SIGNED_IN' && /access_token|type=/.test(location.hash)) {
      location.hash = '#/account';
      showAccount('account');
    } else if (key === 'account' || key === 'signin' || key === 'signup' || key === 'reset') showAccount(key);
    if (user) {
      try { await syncAccount(); } catch (err) {}
    }
  }

  function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

  function bind() {
    const signin = $('#formSignIn');
    if (signin) signin.addEventListener('submit', async e => {
      e.preventDefault();
      setError('signinError', '');
      const email = $('#signinEmail').value.trim();
      const password = $('#signinPassword').value;
      if (!validEmail(email) || password.length < 8) {
        setError('signinError', 'Enter the email and a password of at least 8 characters.');
        return;
      }
      const db = ensureClient();
      if (!db) { setError('signinError', 'Account sign-in is not available in this browser.'); return; }
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) setError('signinError', authMessage(error, 'signin'));
      else { signin.reset(); location.hash = '#/account'; }
    });

    const signup = $('#formSignUp');
    if (signup) signup.addEventListener('submit', async e => {
      e.preventDefault();
      setError('signupError', '');
      const email = $('#signupEmail').value.trim();
      const password = $('#signupPassword').value;
      const again = $('#signupPassword2').value;
      const age = $('#signupAge').checked;
      const terms = $('#signupTerms').checked;
      const marketing = $('#signupMarketing').checked;
      if (!validEmail(email)) { setError('signupError', 'Enter a valid email address.'); $('#signupEmail').focus(); return; }
      if (password.length < 8) { setError('signupError', 'Use at least 8 characters.'); $('#signupPassword').focus(); return; }
      if (password !== again) { setError('signupError', 'Those passwords do not match.'); $('#signupPassword2').focus(); return; }
      if (!age) { setError('signupError', 'Please confirm you are 13 or over.'); $('#signupAge').focus(); return; }
      if (!terms) { setError('signupError', 'Please accept the Terms and acknowledge the Privacy Notice.'); $('#signupTerms').focus(); return; }
      const db = ensureClient();
      if (!db) { setError('signupError', 'Account sign-up is not available in this browser.'); return; }
      sessionStorage.setItem(PREF_KEY, JSON.stringify({ marketing, at: new Date().toISOString() }));
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo(), data: { marketing_opt_in: marketing, age_confirmed: true } }
      });
      if (error) {
        sessionStorage.removeItem(PREF_KEY);
        setError('signupError', authMessage(error, 'signup'));
        return;
      }
      signup.reset();
      if (data.session) {
        setError('signupError', '');
        location.hash = '#/account';
      } else {
        showPanel('signin');
        setError('signinError', 'Check your email to confirm the account. Welcome cards stay on this device and are added when you sign in.');
      }
    });

    const reset = $('#formReset');
    if (reset) reset.addEventListener('submit', async e => {
      e.preventDefault();
      setError('resetError', '');
      const email = $('#resetEmail').value.trim();
      if (!validEmail(email)) { setError('resetError', 'Enter a valid email address.'); return; }
      const db = ensureClient();
      if (!db) { setError('resetError', 'Password reset is not available in this browser.'); return; }
      await db.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() });
      reset.reset();
      setError('resetError', 'If an account exists for that email, we have sent a reset link.');
    });

    const newer = $('#formNewPassword');
    if (newer) newer.addEventListener('submit', async e => {
      e.preventDefault();
      setError('newPassError', '');
      const password = $('#newPassword').value;
      const again = $('#newPassword2').value;
      if (password.length < 8) { setError('newPassError', 'Use at least 8 characters.'); return; }
      if (password !== again) { setError('newPassError', 'Those passwords do not match.'); return; }
      const db = ensureClient();
      if (!db) return;
      const { error } = await db.auth.updateUser({ password });
      if (error) { setError('newPassError', 'Could not update the password. Request a new reset link and try again.'); return; }
      newer.reset();
      location.hash = '#/account';
      showAccount('account');
    });

    const out = $('#signOutBtn');
    if (out) out.addEventListener('click', async () => {
      const db = ensureClient();
      if (db) await db.auth.signOut();
      user = null;
      paintNav();
      showPanel('signin');
    });

    const marketing = $('#settingsMarketing');
    if (marketing) marketing.addEventListener('change', async () => {
      if (!user) return;
      const db = ensureClient();
      const on = marketing.checked;
      try {
        await db.from('user_preferences').upsert({ user_id: user.id, marketing_opt_in: on, age_confirmed: true, updated_at: new Date().toISOString() });
        await db.auth.updateUser({ data: { marketing_opt_in: on } });
        setError('settingsNotice', on ? 'You will get occasional emails. You can untick this at any time.' : 'Marketing emails are off.');
      } catch (err) {
        setError('settingsNotice', 'Could not save that choice. Try again when you are online.');
      }
    });

    const download = $('#downloadData');
    if (download) download.addEventListener('click', async () => {
      if (!user) return;
      const snap = window.__collection ? window.__collection.snapshot() : {};
      let remote = {};
      try { remote = await pullRemote(user.id); } catch (err) { remote = {}; }
      const data = {
        exported_at: new Date().toISOString(),
        account: { id: user.id, email: user.email, created_at: user.created_at, marketing_opt_in: !!(user.user_metadata && user.user_metadata.marketing_opt_in) },
        on_this_device: snap,
        on_the_server: remote
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'solo-travel-365-data.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });

    const del = $('#deleteData');
    if (del) del.addEventListener('click', async () => {
      setError('deleteError', '');
      if (!$('#deleteConfirm').checked) {
        setError('deleteError', 'Tick the box to confirm you want your saved data deleted.');
        $('#deleteConfirm').focus();
        return;
      }
      const db = ensureClient();
      if (!db || !user) return;
      const { error } = await db.rpc('delete_my_data');
      if (error) {
        setError('deleteError', 'Could not delete the server copy yet. Your data on this device is unchanged. If this keeps happening, the account tables may not be set up.');
        return;
      }
      if (window.__collection) window.__collection.clearPlay();
      let authGone = false;
      try {
        const fn = await db.functions.invoke('delete-account', { method: 'POST' });
        authGone = !fn.error;
      } catch (err) { authGone = false; }
      await db.auth.signOut();
      user = null;
      paintNav();
      showPanel('signin');
      setError('signinError', authGone
        ? 'Your account and saved data have been deleted.'
        : 'Your saved cards and pack data were deleted, and you have been signed out. Removing the login email itself needs the delete-account function, which is not deployed yet.');
    });

    document.querySelectorAll('[data-auth-jump]').forEach(btn => btn.addEventListener('click', () => {
      const name = btn.dataset.authJump;
      if (name === 'signup') location.hash = '#/signup';
      else if (name === 'reset') location.hash = '#/reset';
      else location.hash = '#/signin';
    }));
  }

  async function boot() {
    bind();
    paintNav();
    const db = ensureClient();
    if (!db) {
      showAccount(routeKey());
      if (window.__pack && window.__pack.maybeWelcome) window.__pack.maybeWelcome();
      return;
    }
    db.auth.onAuthStateChange((event, session) => { setSession(session, event); });
    const { data } = await db.auth.getSession();
    await setSession(data.session, data.session ? 'INITIAL' : '');
    if (window.__pack && window.__pack.maybeWelcome) window.__pack.maybeWelcome();
    addEventListener('hashchange', () => {
      const key = routeKey();
      if (key === 'account' || key === 'signin' || key === 'signup' || key === 'reset') showAccount(key);
    });
  }

  window.Auth = { onLocalChange, user: () => user };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
