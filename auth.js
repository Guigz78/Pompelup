/* ============================================
   Pompelup — comptes (Supabase) : Google, Apple, email
   + sauvegarde de la progression dans le cloud.
   Dans l'app native, la connexion Google/Apple passe par la feuille
   de connexion sécurisée du système (Google refuse les WebView).
   ============================================ */
(() => {
'use strict';
const URL_ = 'https://bplagnxryyxqwumhrxco.supabase.co';
const KEY = 'sb_publishable_ynAVmoK3cLsEX2UvPO2ltQ_jeVCQShY';
const NATIVE_REDIRECT = 'pompelup://auth';
const sb = window.supabase ? window.supabase.createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' } }) : null;
let user = null;
const listeners = new Set();
const emit = () => listeners.forEach(f => { try { f(user); } catch (e) {} });

const frError = e => {
  const m = String(e?.message || e || '');
  if (/invalid login/i.test(m)) return 'Email ou mot de passe incorrect.';
  if (/already registered|already exists/i.test(m)) return 'Un compte existe déjà avec cet email.';
  if (/password.*(6|short|least)/i.test(m)) return 'Le mot de passe doit faire au moins 6 caractères.';
  if (/email.*(invalid|valid)/i.test(m)) return 'Adresse email invalide.';
  if (/not confirmed/i.test(m)) return 'Confirme ton adresse email (regarde ta boîte de réception).';
  if (/provider is not enabled|unsupported provider/i.test(m)) return 'Cette connexion n’est pas encore activée.';
  if (/fetch|network/i.test(m)) return 'Pas de connexion internet.';
  return m || 'Une erreur est survenue.';
};

async function init() {
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    user = data.session?.user || null;
  } catch (e) { user = null; }
  sb.auth.onAuthStateChange((_ev, session) => { const was = user?.id; user = session?.user || null; if (was !== user?.id) emit(); });
  return user;
}

// Google / Apple
async function oauth(provider) {
  if (!sb) throw new Error('fetch');
  if (window.PompeNative) {
    // App native : on récupère l'URL d'autorisation et on la confie à la feuille système
    const { data, error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true } });
    if (error) throw error;
    window.PompeNative.post('oauth', { url: data.url, redirect: NATIVE_REDIRECT });
    return 'pending';
  }
  const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.href.split('#')[0] } });
  if (error) throw error;
  return 'redirect';
}
// Retour de la feuille système (appelé par l'app native) : pompelup://auth#access_token=…
async function fromRedirect(url) {
  const hash = new URLSearchParams(String(url).split('#')[1] || String(url).split('?')[1] || '');
  const access_token = hash.get('access_token'), refresh_token = hash.get('refresh_token');
  if (!access_token || !refresh_token) { emitError(hash.get('error_description') || 'Connexion annulée.'); return; }
  const { error } = await sb.auth.setSession({ access_token, refresh_token });
  if (error) emitError(frError(error));
}
const errListeners = new Set();
function emitError(msg) { errListeners.forEach(f => f(msg)); }

// Email
async function signUp(email, password, name) {
  const { data, error } = await sb.auth.signUp({ email, password, options: { data: { username: name } } });
  if (error) throw error;
  return data.session ? 'ok' : 'confirm';
}
async function signIn(email, password) {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return 'ok';
}
async function resetPassword(email) {
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split('#')[0] });
  if (error) throw error;
}
async function signOut() { if (sb) await sb.auth.signOut(); user = null; emit(); }

// Profil public (pseudo unique)
async function ensureProfile(name) {
  if (!user) return;
  const base = (name || user.user_metadata?.username || user.user_metadata?.full_name || (user.email || 'joueur').split('@')[0]).trim().slice(0, 16) || 'Joueur';
  const { data } = await sb.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (data) return;
  for (let k = 0; k < 4; k++) {
    const username = k ? `${base.slice(0, 12)}${Math.floor(Math.random() * 9000 + 1000)}` : base;
    const { error } = await sb.from('profiles').insert({ id: user.id, username });
    if (!error) return;
  }
}

// Sauvegarde cloud
async function loadSave() {
  if (!user) return null;
  const { data, error } = await sb.from('saves').select('data, updated_at').eq('user_id', user.id).maybeSingle();
  if (error) { console.warn('[Pompelup] Chargement de la sauvegarde cloud impossible :', error); throw error; }
  return data;
}
let pushTimer = null, pending = null;
function pushSave(obj, now) {
  if (!user) return;
  pending = obj;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const d = pending; pending = null;
    try {
      const { error } = await sb.from('saves').upsert({ user_id: user.id, data: d, updated_at: new Date().toISOString() });
      if (error) console.warn('[Pompelup] Sauvegarde cloud impossible :', error);
    } catch (e) { console.warn('[Pompelup] Sauvegarde cloud impossible :', e); }
  }, now ? 0 : 3000);
}
// Achat de jetons (Stripe Checkout, via la fonction Edge « payments »)
async function callPayments(body) {
  const { data, error } = await sb.functions.invoke('payments', { body });
  if (error) {
    let code = 'network';
    try { code = (await error.context?.json())?.error || code; } catch (e) {}
    throw new Error(code);
  }
  return data;
}
const buyCoins = (pack, returnUrl) => callPayments({ action: 'checkout', pack, returnUrl });
const confirmPurchase = sessionId => callPayments({ action: 'confirm', sessionId });
// Encaisse une seule fois les achats payés (renvoie le nombre de jetons à ajouter)
async function claimPurchases() {
  if (!user) return 0;
  const { data, error } = await sb.rpc('claim_coin_purchases');
  if (error) throw error;
  return data || 0;
}
async function claimPass() {
  if (!user) return 0;
  const { data, error } = await sb.rpc('claim_pass_purchases');
  if (error) throw error;
  return data || 0;
}
// Pseudo affiché pour un compte
const displayName = () => user?.user_metadata?.username || user?.user_metadata?.full_name || user?.user_metadata?.name || '';

window.PompeAuth = {
  ready: !!sb, init, oauth, fromRedirect, signUp, signIn, resetPassword, signOut, ensureProfile, loadSave, pushSave, frError, buyCoins, confirmPurchase, claimPurchases, claimPass,
  get user() { return user; }, displayName, client: sb,
  onChange: f => listeners.add(f), onError: f => errListeners.add(f),
};
})();
