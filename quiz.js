/* ============================================
   Pompelup — blind test + boosters de vinyles
   Mobile first · vanilla JS · état en localStorage
   ============================================ */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ico = (n, c) => window.ico(n, c);
const SONGS = window.SONGS || [];
const SONG = new Map(SONGS.map(s => [s.id, s]));
const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Math.round(n).toLocaleString('fr-FR');
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
const pickOne = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hashStr(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }

/* ---------------- Sauvegarde ---------------- */
const STORE_KEY = 'pompelup_quiz_v1';
const GAUGE_MAX = 6;
const defaults = () => ({
  xp: 0, best: 0, games: 0, found: 0, played: 0,
  streak: { count: 0, last: null },
  daily: null,
  boosters: 1, goldBoosters: 0, gauge: 0, opened: 0, coll: {},
  coins: 100, gift: null, name: '', onboarded: false,
  owned: { skin: ['rookie', 'crate'], acc: [], disc: ['classic'], theme: ['nuit'], fx: ['sparks'] },
  equip: { skin: 'rookie', acc: { head: null, eyes: null, ears: null, neck: null }, disc: 'classic', theme: 'nuit', fx: 'sparks' },
  story: {},
  stats: { bestCombo: 0, fast: 0, perfect: 0, dailyWins: 0, bestStreak: 0 },
  ach: {}, achSeen: {}, missions: null, pass: null,
  settings: { sound: true, haptics: true },
  prefs: { cat: 'all', mode: 'choice', rounds: 10 },
});
const store = (() => {
  const d = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    const merged = Object.assign(d, raw);
    for (const k of ['prefs', 'streak', 'equip', 'stats', 'settings', 'ach', 'achSeen', 'story']) merged[k] = Object.assign(defaults()[k], raw[k]);
    delete merged.equip.avatar;
    merged.equip.acc = Object.assign(defaults().equip.acc, (raw.equip || {}).acc);
    for (const k of Object.keys(merged.equip.acc)) if (!(k in defaults().equip.acc)) delete merged.equip.acc[k];
    merged.owned = Object.fromEntries(Object.entries(defaults().owned).map(([k, base]) => [k, [...new Set([...base, ...((raw.owned || {})[k] || [])])]]));
    merged.coll = Object.assign({}, raw.coll);
    return merged;
  } catch (e) { return d; }
})();
const save = () => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
  // Connecté : la progression part aussi dans le cloud (regroupée toutes les 3 s)
  if (window.PompeAuth?.user) window.PompeAuth.pushSave(store);
};
store.stats.bestStreak = Math.max(store.stats.bestStreak, store.streak.count || 0);

/* ---------------- Dates, streak, niveau ---------------- */
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayDiff = (a, b) => {
  const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
};
const currentStreak = () => { const s = store.streak; return s.last && dayDiff(s.last, dayKey()) <= 1 ? s.count : 0; };
const playedToday = () => store.streak.last === dayKey();
function recordPlay() {
  const today = dayKey(), s = store.streak;
  if (s.last === today) return false;
  s.count = s.last && dayDiff(s.last, today) === 1 ? s.count + 1 : 1;
  s.last = today;
  return true;
}
function levelOf(xp) {
  let lvl = 1, need = 300, rest = xp;
  while (rest >= need) { rest -= need; lvl++; need = Math.round(need * 1.15); }
  return { lvl, rest, need, pct: rest / need };
}
// Chaque niveau gagné offre un booster.
function addXP(n) {
  const before = levelOf(store.xp).lvl;
  store.xp += n;
  const gained = levelOf(store.xp).lvl - before;
  if (gained > 0) { store.boosters += gained; store.coins += 100 * gained; }
  return gained;
}
// Retourne le nombre de boosters gagnés par la jauge.
function addGauge(n) {
  store.gauge += n;
  let won = 0;
  while (store.gauge >= GAUGE_MAX) { store.gauge -= GAUGE_MAX; store.boosters++; won++; }
  return won;
}
const msToMidnight = () => { const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); return m - n; };
const hms = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return [s / 3600, (s % 3600) / 60, s % 60].map(v => String(Math.floor(v)).padStart(2, '0')).join(':'); };

/* ---------------- Catégories ---------------- */
// illu : illustration de genre, pos : cadrage, bg : fond de la vignette
const CATS = [
  { id: 'all', name: 'Tout mélangé', illu: 'assets/illu-dance.svg', pos: '50% 40%', bg: '#FDE68A', test: () => true },
  { id: 'Pop', name: 'Pop', illu: 'assets/illu-pop.png', pos: '50% 30%', bg: '#BAE6FD' },
  { id: 'Rock', name: 'Rock', illu: 'assets/illu-rock.svg', pos: '40% 30%', bg: '#A7F3D0' },
  { id: 'Hip-Hop', name: 'Hip-Hop', illu: 'assets/illu-rap.svg', pos: '50% 35%', bg: '#FBCFE8' },
  { id: 'Dance', name: 'Dance', illu: 'assets/illu-dance.svg', pos: '30% 60%', bg: '#DDD6FE' },
  { id: 'Pop Française', name: 'Pop FR', illu: 'assets/illu-pop.png', pos: '70% 70%', bg: '#FECACA' },
  { id: 'Rap Français', name: 'Rap FR', illu: 'assets/illu-rap.svg', pos: '30% 70%', bg: '#FED7AA' },
  { id: 'Latino', name: 'Latino', illu: 'assets/illu-monde.svg', pos: '50% 40%', bg: '#FDE68A' },
  { id: 'K-Pop', name: 'K-Pop', illu: 'assets/illu-pop.png', pos: '20% 50%', bg: '#F5D0FE' },
  { id: 'd70', name: '60s & 70s', illu: 'assets/illu-jazz.svg', pos: '60% 30%', bg: '#FED7AA', test: s => s.year < 1980 },
  { id: 'd80', name: 'Années 80', illu: 'assets/illu-rap.svg', pos: '60% 20%', bg: '#C7D2FE', test: s => s.year >= 1980 && s.year < 1990 },
  { id: 'd90', name: 'Années 90', illu: 'assets/illu-rock.svg', pos: '80% 70%', bg: '#BBF7D0', test: s => s.year >= 1990 && s.year < 2000 },
  { id: 'd00', name: 'Années 2000', illu: 'assets/illu-dance.svg', pos: '80% 40%', bg: '#FBCFE8', test: s => s.year >= 2000 && s.year < 2010 },
  { id: 'd10', name: 'Années 2010', illu: 'assets/illu-pop.png', pos: '80% 20%', bg: '#BAE6FD', test: s => s.year >= 2010 && s.year < 2020 },
  { id: 'd20', name: 'Années 2020', illu: 'assets/illu-monde.svg', pos: '20% 60%', bg: '#A5F3FC', test: s => s.year >= 2020 },
].map(c => Object.assign(c, { test: c.test || (s => s.genre === c.id) }));
const catById = id => CATS.find(c => c.id === id) || CATS[0];
const poolFor = id => SONGS.filter(catById(id).test);

/* ---------------- Raretés des vinyles ---------------- */
const RARITIES = ['common', 'rare', 'epic', 'legendary'];
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 };
const R_NAME = { common: 'Commune', rare: 'Rare', epic: 'Épique', legendary: 'Légendaire' };
const R_NAMES = { common: 'Communes', rare: 'Rares', epic: 'Épiques', legendary: 'Légendaires' };
const R_COLOR = { common: '#AFAFAF', rare: '#1CB0F6', epic: '#CE82FF', legendary: '#FFC800' };
const R_GLOW = { common: 'rgba(175,175,175,.28)', rare: 'rgba(28,176,246,.55)', epic: 'rgba(206,130,255,.6)', legendary: 'rgba(255,200,0,.7)' };
const R_RAY = { common: 'rgba(255,255,255,.05)', rare: 'rgba(28,176,246,.14)', epic: 'rgba(206,130,255,.18)', legendary: 'rgba(255,200,0,.24)' };
const DUP_COINS = { common: 15, rare: 40, epic: 100, legendary: 250 };
const LEGENDARY_IDS = new Set(['s3', 's2', 's1', 's16', 's15', 's211', 's286', 's4', 's6', 's29', 's331', 's76', 's5', 's39', 's186', 's156', 's661', 's11', 's490', 's894', 's75', 's12', 's157', 's868', 's188', 's53', 's27', 's14']);
const EPIC_IDS = new Set(['s52', 's9', 's7', 's8', 's13', 's91', 's38', 's37', 's200', 's49', 's195', 's487', 's78', 's496', 's352', 's34', 's48', 's10', 's462', 's453', 's71', 's35', 's68', 's246', 's280', 's17', 's21', 's23', 's121', 's359', 's673', 's167', 's851', 's206', 's187', 's189']);
const RARITY = new Map(SONGS.map(s => {
  if (LEGENDARY_IDS.has(s.id)) return [s.id, 'legendary'];
  if (EPIC_IDS.has(s.id)) return [s.id, 'epic'];
  const h = hashStr(s.id) % 100;
  return [s.id, h < 5 ? 'epic' : h < 31 ? 'rare' : 'common'];
}));
const BY_RARITY = Object.fromEntries(RARITIES.map(r => [r, SONGS.filter(s => RARITY.get(s.id) === r)]));
const ODDS = { common: 62, rare: 28, epic: 8.5, legendary: 1.5 };
const ODDS_LAST = { rare: 75, epic: 20, legendary: 5 };
const ODDS_WELCOME = { epic: 70, legendary: 30 };
const ODDS_GOLD = { rare: 55, epic: 35, legendary: 10 };
const ODDS_GOLD_LAST = { epic: 75, legendary: 25 };
function roll(table) {
  let r = Math.random() * Object.values(table).reduce((a, b) => a + b, 0);
  for (const [k, w] of Object.entries(table)) { if ((r -= w) < 0) return k; }
  return Object.keys(table)[0];
}

/* ================= MÉTA-JEU : jetons, skins, succès, missions ================= */
const COSMETICS = {
  disc: [
    { id: 'classic', name: 'Classique', rarity: 'common', price: 0, desc: 'Le noir mat indémodable.' },
    { id: 'crystal', name: 'Cristal', rarity: 'rare', price: 350, desc: 'Un vinyle translucide couleur glacier.' },
    { id: 'splatter', name: 'Éclaboussures', rarity: 'rare', price: 450, desc: 'Vinyle blanc éclaboussé de peinture.' },
    { id: 'marble', name: 'Marbre bleu', rarity: 'rare', price: 500, desc: 'Des volutes bleues pressées dans la cire.' },
    { id: 'neon', name: 'Néon', rarity: 'epic', price: 750, desc: 'Des sillons qui brillent comme en boîte de nuit.' },
    { id: 'lava', name: 'Lave', rarity: 'epic', price: 850, desc: 'Un disque en fusion, à ne pas toucher.' },
    { id: 'holo', name: 'Holographique', rarity: 'legendary', unlock: 'legend', desc: 'Toutes les couleurs à la fois.' },
    { id: 'gold', name: 'Disque d’or', rarity: 'legendary', unlock: 'level', desc: 'Réservé aux légendes du blind test.' },
  ],
  theme: [
    { id: 'nuit', name: 'Nuit violette', rarity: 'common', price: 0, desc: 'La scène d’origine de Pompelup.' },
    { id: 'sunset', name: 'Coucher de soleil', rarity: 'rare', price: 400, desc: 'Orange et rose, ambiance plage.' },
    { id: 'ocean', name: 'Océan', rarity: 'rare', price: 400, desc: 'Bleu profond et reflets turquoise.' },
    { id: 'retro', name: 'Rétro 70s', rarity: 'epic', price: 650, desc: 'Brun, moutarde et boule à facettes.' },
    { id: 'club', name: 'Club laser', rarity: 'epic', unlock: 'perfect', desc: 'Noir total, lasers vert et violet.' },
    { id: 'aurora', name: 'Aurore boréale', rarity: 'legendary', unlock: 'streak', desc: 'Le ciel du Grand Nord en fond de scène.' },
  ],
  fx: [
    { id: 'sparks', name: 'Étincelles', rarity: 'common', price: 0, glyphs: ['sparkle', 'star', 'sparkle'], desc: 'Une gerbe d’étoiles dorées.' },
    { id: 'notes', name: 'Notes de musique', rarity: 'rare', price: 300, glyphs: ['note', 'note', 'note'], desc: 'Des notes qui s’envolent.' },
    { id: 'hearts', name: 'Cœurs', rarity: 'rare', price: 300, glyphs: ['heart', 'heart', 'heart'], desc: 'Pour les coups de cœur musicaux.' },
    { id: 'flames', name: 'Flammes', rarity: 'epic', price: 550, glyphs: ['flame'], desc: 'Tu es en feu, et ça se voit.' },
    { id: 'coins', name: 'Pluie de jetons', rarity: 'legendary', unlock: 'combo', glyphs: ['coin'], desc: 'Chaque bonne réponse fait pleuvoir des jetons.' },
  ],
  skin: window.PompeChar.SKINS,
  acc: window.PompeChar.ACCESSORIES,
};
const KINDS = ['skin', 'acc', 'disc', 'theme', 'fx'];
const KIND_NAME = { skin: 'Skin', acc: 'Accessoire', disc: 'Vinyle de platine', theme: 'Scène', fx: 'Effet de victoire' };
const KIND_NAMES = { skin: 'Skins', acc: 'Accessoires', disc: 'Vinyles de platine', theme: 'Scènes', fx: 'Effets de victoire' };
const itemOf = (kind, id) => COSMETICS[kind]?.find(i => i.id === id);
const itemName = (kind, it) => it.name;
const mySkin = () => window.PompeChar.byId(store.equip.skin);
const charHTML = (sk = mySkin(), opts) => (window.PompeChar.html || window.PompeChar.svg)(sk, opts || {});
// Accessoires équipés, indexés par emplacement, prêts pour le rendu
const myAccs = (extra) => {
  const out = {};
  for (const [slot, id] of Object.entries(store.equip.acc)) { const a = id && window.PompeChar.accById(id); if (a) out[slot] = a; }
  if (extra) out[extra.slot] = extra;
  return out;
};
const meHTML = (opts = {}) => charHTML(mySkin(), Object.assign({ accs: myAccs() }, opts));
const isEquipped = (kind, id) => kind === 'acc' ? Object.values(store.equip.acc).includes(id) : store.equip[kind] === id;
const isOwned = (kind, id) => store.owned[kind].includes(id);
function own(kind, id) { if (!isOwned(kind, id)) store.owned[kind].push(id); }

function discPrevHTML(id) { return `<span class="disc-prev skin-${id}"></span>`; }
function itemPreviewHTML(kind, it) {
  if (kind === 'disc') return discPrevHTML(it.id);
  if (kind === 'theme') return `<span class="theme-prev theme-${it.id}">${discPrevHTML(store.equip.disc)}</span>`;
  if (kind === 'fx') return `<span class="fx-prev">${[0, 1, 2].map(i => it.glyphs[i % it.glyphs.length]).map(g => g === 'coin' ? '<i class="coin"></i>' : `<i>${ico(g)}</i>`).join('')}</span>`;
  if (kind === 'acc') return `<span class="char-prev acc-prev">${charHTML(mySkin(), { accs: myAccs(it) })}</span>`;
  return `<span class="char-prev">${charHTML(it)}</span>`;
}
function applySkins() {
  const disc = $('#disc'), game = $('#screen-game');
  [...disc.classList].filter(c => c.startsWith('skin-')).forEach(c => disc.classList.remove(c));
  disc.classList.add(`skin-${store.equip.disc}`);
  [...game.classList].filter(c => c.startsWith('theme-')).forEach(c => game.classList.remove(c));
  game.classList.add(`theme-${store.equip.theme}`);
  $('#tab-avatar').innerHTML = meHTML({ head: true });
  $('#pf-avatar-emoji').innerHTML = meHTML({ mood: 'happy' });
}
function equipItem(kind, id) {
  if (!isOwned(kind, id)) return;
  if (kind === 'acc') { const a = itemOf('acc', id); store.equip.acc[a.slot] = id; }
  else store.equip[kind] = id;
  save();
  applySkins();
}

/* Jetons */
function renderCoins(bump = false) {
  $$('.coins-n').forEach(el => {
    el.textContent = fmt(store.coins);
    if (bump) { el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); }
  });
}
function addCoins(n) {
  if (!n) return;
  sfx.coin();
  store.coins += n;
  save();
  renderCoins(true);
}
function spendCoins(n) {
  if (store.coins < n) return false;
  store.coins -= n;
  save();
  renderCoins(true);
  return true;
}

/* Succès à paliers */
const ACHS = [
  { id: 'games', icon: 'g-play', color: 'blue', name: 'Habitué', label: n => `Joue ${plural(n, 'partie', 'parties')}`, val: () => store.games,
    tiers: [[1, { coins: 50 }], [10, { coins: 100, boosters: 1 }], [50, { coins: 300 }], [200, { coins: 500, gold: 1 }]] },
  { id: 'found', icon: 'g-note', color: 'purple', name: 'Mélomane', label: n => `Trouve ${n} chansons`, val: () => store.found,
    tiers: [[25, { coins: 60 }], [100, { coins: 150 }], [500, { coins: 400 }], [2000, { coins: 1000, gold: 1 }]] },
  { id: 'combo', icon: 'g-bolt', color: 'red', name: 'En feu', label: n => `Atteins un combo ×${n}`, val: () => store.stats.bestCombo,
    tiers: [[3, { coins: 40 }], [5, { coins: 100, item: 'skin:neon' }], [8, { item: 'fx:coins' }], [12, { gold: 1 }]] },
  { id: 'fast', icon: 'g-clock', color: 'blue2', name: 'Oreille d’or', label: n => `Trouve ${n} chansons en moins de 3 s`, val: () => store.stats.fast,
    tiers: [[5, { coins: 60 }], [25, { coins: 150 }], [100, { coins: 400 }]] },
  { id: 'perfect', icon: 'g-target', color: 'green', name: 'Sans faute', label: n => `Termine ${plural(n, 'partie', 'parties')} sans faute (5 manches min.)`, val: () => store.stats.perfect,
    tiers: [[1, { coins: 100 }], [3, { item: 'theme:club' }], [10, { gold: 1 }]] },
  { id: 'coll', icon: 'g-vinyl', color: 'teal', name: 'Collectionneur', label: n => `Possède ${n} vinyles`, val: () => ownedIds().length,
    tiers: [[10, { coins: 80 }], [50, { coins: 200 }], [150, { coins: 500 }], [400, { coins: 1000 }]] },
  { id: 'legend', icon: 'g-star', color: 'gold', name: 'Légendes', label: n => `Possède ${plural(n, 'vinyle légendaire', 'vinyles légendaires')}`, val: () => ownedIds().filter(id => RARITY.get(id) === 'legendary').length,
    tiers: [[1, { coins: 100 }], [5, { item: 'disc:holo' }], [10, { item: 'skin:gold' }], [15, { coins: 1000, gold: 1 }]] },
  { id: 'streak', icon: 'g-flame', color: 'orange', name: 'Fidèle', label: n => `Joue ${n} jours d’affilée`, val: () => store.stats.bestStreak,
    tiers: [[3, { boosters: 1 }], [7, { item: 'theme:aurora' }], [30, { coins: 1500, gold: 1 }]] },
  { id: 'daily', icon: 'g-eye', color: 'blue2', name: 'Détective', label: n => `Réussis ${plural(n, 'défi du jour', 'défis du jour')}`, val: () => store.stats.dailyWins,
    tiers: [[1, { coins: 50 }], [7, { boosters: 1, item: 'skin:dj' }], [30, { coins: 500 }]] },
  { id: 'opened', icon: 'g-chest', color: 'purple', name: 'Ouvreur', label: n => `Ouvre ${plural(n, 'booster', 'boosters')}`, val: () => store.opened,
    tiers: [[5, { coins: 80 }], [25, { gold: 1 }], [100, { coins: 600 }]] },
  { id: 'level', icon: 'g-crown', color: 'gold', name: 'Légende vivante', label: n => `Atteins le niveau ${n}`, val: () => levelOf(store.xp).lvl,
    tiers: [[5, { coins: 300 }], [10, { item: 'skin:astro' }], [15, { item: 'disc:gold' }], [20, { coins: 1000, gold: 1 }]] },
];
const ACH_COLORS = { blue: ['#1CB0F6', '#1899D6'], blue2: ['#2B70C9', '#1453A3'], purple: ['#CE82FF', '#A568CC'], red: ['#FF4B4B', '#EA2B2B'], green: ['#58CC02', '#58A700'], teal: ['#00CD9C', '#00A47D'], gold: ['#FFC800', '#E5A500'], orange: ['#FF9600', '#CD7900'] };
function achState(a) {
  const claimed = store.ach[a.id] || 0, v = a.val();
  const reached = a.tiers.filter(([n]) => v >= n).length;
  const next = a.tiers[claimed];
  return { claimed, reached, v, next, max: claimed >= a.tiers.length, claimable: reached > claimed };
}
const claimableAchs = () => ACHS.filter(a => achState(a).claimable).length;
// Élément cosmétique débloqué par un succès : palier et progression.
function unlockInfo(kind, id) {
  for (const a of ACHS) for (const [n, r] of a.tiers) if (r.item === `${kind}:${id}`) return { text: a.label(n), v: Math.min(a.val(), n), n, ach: a };
  return null;
}
function rewardParts(r) {
  const parts = [];
  if (r.coins) parts.push(`+${fmt(r.coins)} jetons`);
  if (r.boosters) parts.push(`+${plural(r.boosters, 'booster', 'boosters')}`);
  if (r.gold) parts.push(`+${plural(r.gold, 'Booster Or', 'Boosters Or')}`);
  if (r.item) { const [k, id] = r.item.split(':'); const it = itemOf(k, id); parts.push(`${KIND_NAME[k]} « ${itemName(k, it).replace('Avatar ', '')} »`); }
  return parts;
}
function rewardInline(r) {
  if (r.item) { const [k, id] = r.item.split(':'); return k === 'skin' ? `<span class="rw-mini">${charHTML(itemOf(k, id), { head: true })}</span>` : ico('palette'); }
  if (r.gold) return '<i class="mini-booster mp-gold"></i>';
  if (r.boosters) return '<i class="mini-booster"></i>';
  return `<i class="coin"></i>${fmt(r.coins)}`;
}
function grantReward(r) {
  if (r.coins) store.coins += r.coins;
  if (r.boosters) store.boosters += r.boosters;
  if (r.gold) store.goldBoosters += r.gold;
  if (r.item) { const [k, id] = r.item.split(':'); own(k, id); }
  save();
  renderCoins(true);
}
function claimAch(id) {
  const a = ACHS.find(x => x.id === id), st = achState(a);
  if (!st.claimable) return;
  let [n, r] = a.tiers[st.claimed];
  if (r.item) { const [k, id] = r.item.split(':'); if (isOwned(k, id)) r = Object.assign({}, r, { item: undefined, coins: (r.coins || 0) + 300 }); }
  store.ach[a.id] = st.claimed + 1;
  grantReward(r);
  sfx.fanfare(); buzz([30, 40, 60]);
  showReward({ kicker: `Succès · ${a.name} niveau ${st.claimed + 1}`, title: a.label(n), reward: r });
  renderBadges();
}
// Signale une seule fois chaque palier atteint.
function checkAchievements() {
  ACHS.forEach(a => {
    const st = achState(a), seen = store.achSeen[a.id] || 0;
    if (st.reached > seen) {
      store.achSeen[a.id] = st.reached;
      toast(`Succès « ${a.name} » niveau ${st.reached} : récompense dans ton profil`);
    }
  });
  save();
  renderBadges();
}

/* Missions du jour */
const MISSION_POOL = [
  { id: 'find10', text: 'Trouve 10 chansons', ev: 'found', target: 10, reward: 60 },
  { id: 'find25', text: 'Trouve 25 chansons', ev: 'found', target: 25, reward: 120 },
  { id: 'games2', text: 'Termine 2 parties', ev: 'game', target: 2, reward: 60 },
  { id: 'combo4', text: 'Fais un combo ×4', ev: 'combo', target: 4, max: true, reward: 70 },
  { id: 'fast3', text: 'Trouve 3 chansons en moins de 5 s', ev: 'fast5', target: 3, reward: 70 },
  { id: 'type5', text: 'Trouve 5 chansons en mode Saisie', ev: 'typeFound', target: 5, reward: 100 },
  { id: 'daily', text: 'Réussis le défi du jour', ev: 'dailyWin', target: 1, reward: 80 },
  { id: 'open1', text: 'Ouvre un booster', ev: 'opened', target: 1, reward: 50 },
  { id: 'score', text: 'Marque 5 000 points en une partie', ev: 'score', target: 5000, max: true, reward: 80 },
  { id: 'nohint', text: 'Termine une partie sans indice', ev: 'noHint', target: 1, reward: 60 },
  { id: 'cat', text: 'Termine une partie', ev: 'catGame', target: 1, reward: 70 },
];
function ensureMissions() {
  const today = dayKey();
  if (store.missions?.date === today) return store.missions;
  const h = hashStr(`missions-${today}`), pool = MISSION_POOL.slice(), picks = [], evs = new Set();
  let k = h;
  while (picks.length < 3 && pool.length) {
    const m = pool.splice(k % pool.length, 1)[0];
    k = Math.imul(k ^ (k >>> 13), 2654435761) >>> 0;
    if (evs.has(m.ev)) continue;
    evs.add(m.ev);
    const entry = { id: m.id, text: m.text, ev: m.ev, target: m.target, max: !!m.max, reward: m.reward, p: 0, claimed: false };
    if (m.ev === 'catGame') { const cats = CATS.filter(c => c.id !== 'all'); const c = cats[h % cats.length]; entry.cat = c.id; entry.text = `Termine une partie ${c.name}`; }
    picks.push(entry);
  }
  store.missions = { date: today, list: picks, bonus: false };
  save();
  return store.missions;
}
function missionEvent(ev, val = 1, extra) {
  const M = ensureMissions();
  M.list.forEach(m => {
    if (m.ev !== ev || m.p >= m.target) return;
    if (m.cat && m.cat !== extra) return;
    m.p = Math.min(m.target, m.max ? Math.max(m.p, val) : m.p + val);
    if (m.p >= m.target) toast(`Mission accomplie : ${m.text} — récupère +${m.reward} jetons`);
  });
  save();
}
const missionsClaimable = () => { const M = ensureMissions(); return M.list.filter(m => m.p >= m.target && !m.claimed).length + (M.list.every(m => m.claimed) && !M.bonus ? 1 : 0); };
function claimMission(i) {
  const m = ensureMissions().list[i];
  if (!m || m.claimed || m.p < m.target) return;
  m.claimed = true;
  addCoins(m.reward);
  sfx.booster(); buzz(30);
  renderMissionsSheet();
  renderHome();
}
function claimMissionBonus() {
  const M = ensureMissions();
  if (M.bonus || !M.list.every(m => m.claimed)) return;
  M.bonus = true;
  grantReward({ boosters: 1 });
  showReward({ kicker: 'Missions du jour', title: '3 missions sur 3 !', reward: { boosters: 1 } });
  renderMissionsSheet();
  renderHome();
}

/* Offre du jour */
function dealOfTheDay() {
  const cands = [];
  for (const kind of KINDS) COSMETICS[kind].forEach(it => { if (it.price > 0 && !isOwned(kind, it.id)) cands.push({ kind, it }); });
  if (!cands.length) return null;
  const d = cands[hashStr(`deal-${dayKey()}`) % cands.length];
  return Object.assign(d, { price: Math.round(d.it.price * .6 / 10) * 10 });
}
const PACKS = [
  { id: 'std', name: 'Booster', short: '3 vinyles', desc: '3 vinyles, dont au moins 1 rare.', price: 150, give: { boosters: 1 } },
  { id: 'gold', name: 'Booster Or', short: 'Épique garanti', desc: '3 vinyles de qualité : 1 épique garanti et 25 % de chances de légendaire sur le dernier.', price: 450, give: { gold: 1 } },
  { id: 'bundle', name: 'Lot de 5', short: '5 boosters', desc: '5 boosters vinyle d’un coup, soit 150 jetons d’économie.', price: 600, give: { boosters: 5 }, tag: '−20 %' },
];
const TITLES = [[1, 'Apprenti mélomane'], [3, 'DJ de salon'], [6, 'Oreille affûtée'], [10, 'Maître du blind test'], [15, 'Légende du vinyle']];
const titleFor = lvl => TITLES.filter(([n]) => lvl >= n).pop()[1];
const displayName = () => store.name.trim() || 'Joueur';

/* ---------------- Réponses ---------------- */
const normalize = s => String(s).toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ').trim();
const cleanTitle = s => normalize(String(s).replace(/\(.*?\)|\[.*?\]|\s-\s.*$/g, '')).replace(/^the /, '');
function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const al = a.length, bl = b.length;
  let prev = Array.from({ length: al + 1 }, (_, j) => j);
  for (let i = 1; i <= bl; i++) {
    const cur = [i];
    for (let j = 1; j <= al; j++)
      cur[j] = b[i - 1] === a[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
    prev = cur;
  }
  return 1 - prev[al] / Math.max(al, bl);
}
// 'title' | 'artist' | null — une lettre seule ou un petit bout de titre ne compte jamais.
function judge(input, song) {
  const a = cleanTitle(input);
  if (a.length < 2) return null;
  const t = cleanTitle(song.title), ar = normalize(song.artist).replace(/^the /, '');
  if (a === t) return 'title';
  if (a.length >= Math.max(4, t.length * 0.6) && t.includes(a)) return 'title';
  if (t.length >= 3 && a.includes(t) && a.length <= t.length + ar.length + 4) return 'title';
  if (similarity(a, t) >= 0.8) return 'title';
  if (a === ar || similarity(a, ar) >= 0.85) return 'artist';
  return null;
}

/* ---------------- Extraits & pochettes (iTunes) ---------------- */
const ART_KEY = 'pompelup_art_v2';
try { localStorage.removeItem('pompelup_art_v1'); } catch (e) {}
const artCache = (() => { try { return JSON.parse(localStorage.getItem(ART_KEY) || '{}'); } catch (e) { return {}; } })();
let artSaveTimer;
// Catalogue de pochettes pré-construit (covers.js) : fiable, sans appel réseau de recherche.
const COVERS = window.COVERS || {};
const catalogArt = id => { const c = COVERS[id]; return !c ? null : c.startsWith('d:') ? `https://e-cdns-images.dzcdn.net/images/cover/${c.slice(2)}/500x500-000000-80-0-0.jpg` : c; };
function rememberArt(id, url) {
  if (!url) return;   // un échec (réseau, quota) ne doit jamais bloquer les essais suivants
  artCache[id] = url;
  clearTimeout(artSaveTimer);
  artSaveTimer = setTimeout(() => { try { localStorage.setItem(ART_KEY, JSON.stringify(artCache)); } catch (e) {} }, 400);
}
const previewCache = new Map();
// JSONP : contourne l'absence d'en-têtes CORS de certaines API musicales
let jsonpN = 0;
function jsonp(url, ms = 6000) {
  return new Promise((resolve, reject) => {
    const cb = `__pq_jp${++jsonpN}`, s = document.createElement('script');
    const done = (err, data) => { clearTimeout(t); delete window[cb]; s.remove(); err ? reject(err) : resolve(data); };
    const t = setTimeout(() => done(new Error('timeout')), ms);
    window[cb] = data => done(null, data);
    s.onerror = () => done(new Error('jsonp'));
    s.src = `${url}${url.includes('?') ? '&' : '?'}callback=${cb}`;
    document.head.appendChild(s);
  });
}
function pickTrack(list, song, artistOf) {
  const ar = normalize(song.artist), ti = cleanTitle(song.title);
  const score = x => (normalize(artistOf(x)).includes(ar) || similarity(normalize(artistOf(x)), ar) > .6 ? 2 : 0) + (similarity(cleanTitle(x.trackName || x.title || ''), ti) > .7 ? 1 : 0);
  return list.slice().sort((a, b) => score(b) - score(a))[0];
}
async function searchItunes(song) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(`${song.title} ${song.artist}`)}&media=music&entity=song&limit=8`;
  let data;
  try {
    const ctrl = new AbortController(), to = setTimeout(() => ctrl.abort(), 5000);
    try { data = await (await fetch(url, { signal: ctrl.signal })).json(); } finally { clearTimeout(to); }
  } catch (e) { data = await jsonp(url); }
  const list = (data.results || []).filter(t => t.previewUrl);
  const t = list.length && pickTrack(list, song, x => x.artistName || '');
  return t ? { url: t.previewUrl, art: t.artworkUrl100 ? t.artworkUrl100.replace(/100x100/, '600x600') : null } : null;
}
async function searchDeezer(song) {
  const data = await jsonp(`https://api.deezer.com/search?q=${encodeURIComponent(`artist:"${song.artist}" track:"${song.title}"`)}&limit=8&output=jsonp`);
  const list = (data.data || []).filter(t => t.preview);
  const t = list.length && pickTrack(list, song, x => (x.artist && x.artist.name) || '');
  return t ? { url: t.preview, art: (t.album && (t.album.cover_big || t.album.cover_medium)) || null } : null;
}
// Extraits pré-catalogués (previews.js) : lecture immédiate, sans recherche réseau
const PREVIEWS = window.PREVIEWS || {};
const catalogPreview = id => { const p = PREVIEWS[id]; return !p ? null : /^https?:/.test(p) ? p : `https://audio-ssl.itunes.apple.com/itunes-assets/${p}`; };
function fetchPreview(song) {
  if (previewCache.has(song.id)) return previewCache.get(song.id);
  if (catalogPreview(song.id)) { const r = Promise.resolve({ url: catalogPreview(song.id), art: knownArt(song.id), catalog: true }); previewCache.set(song.id, r); return r; }
  return livePreview(song);
}
// Recherche en direct (iTunes puis Deezer) : sans catalogue, ou si le lien catalogué ne joue plus
function livePreview(song) {
  const p = (async () => {
    let r = null;
    try { r = await searchItunes(song); } catch (e) {}
    if (!r || !r.art) { try { const d = await searchDeezer(song); if (d) r = r ? Object.assign({}, r, { art: r.art || d.art }) : d; } catch (e) {} }
    if (!r) { previewCache.delete(song.id); return null; }
    if (catalogArt(song.id)) r = Object.assign({}, r, { art: catalogArt(song.id) });
    rememberArt(song.id, r.art);
    return r;
  })();
  previewCache.set(song.id, p);
  return p;
}
const knownArt = id => catalogArt(id) || artCache[id] || null;
async function getArt(song) {
  if (knownArt(song.id)) return knownArt(song.id);
  const p = await fetchPreview(song);
  return p?.art || null;
}
// File d'attente polie pour ne pas mitrailler iTunes depuis la collection.
const artQueue = [];
let artActive = 0;
function queueArt(song, cb) {
  if (song.id in artCache) { cb(artCache[song.id] || null); return; }
  artQueue.push([song, cb]);
  pumpArt();
}
function pumpArt() {
  while (artActive < 3 && artQueue.length) {
    const [song, cb] = artQueue.shift();
    artActive++;
    getArt(song).then(cb, () => cb(null)).finally(() => { artActive--; pumpArt(); });
  }
}

function fallbackCover(song) {
  // Pochette typographique (en attendant la vraie pochette de l'album)
  return `<span class="cover-fb"><span class="cf-disc"></span><span class="cf-txt"><span class="cf-title">${esc(song.title)}</span><span class="cf-artist">${esc(song.artist)} · ${song.year}</span></span></span>`;
}
function coverHTML(song, art = knownArt(song.id)) {
  return `<span class="cover" data-cover="${song.id}" style="--sc:${song.color || '#6D28D9'}">${art ? `<img src="${esc(art)}" alt="" loading="lazy" decoding="async">` : fallbackCover(song)}</span>`;
}
function fillCover(el, art) {
  const cov = el.matches?.('.cover') ? el : el.querySelector('.cover');
  if (!cov || !art || cov.querySelector('img')) return;
  const img = new Image();
  img.alt = '';
  img.decoding = 'async';
  img.onload = () => { cov.innerHTML = ''; cov.appendChild(img); };
  img.src = art;
}
// Une pochette qui ne charge pas retombe sur la pochette dessinée.
document.addEventListener('error', e => {
  const img = e.target;
  if (img.tagName !== 'IMG') return;
  const cov = img.closest('.cover');
  if (cov && SONG.get(cov.dataset.cover)) { cov.innerHTML = fallbackCover(SONG.get(cov.dataset.cover)); return; }
  if (img.closest('.recap-art, .vs-label, .vc-label')) img.remove();
}, true);

/* ---------------- Audio ---------------- */
const player = $('#player');
const listen = new Audio();
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
let actx = null, beatTimer = null, audioUnlocked = false;
function unlockAudio() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch (e) {}
  if (!audioUnlocked) {
    audioUnlocked = true;
    player.src = SILENT;
    player.play().catch(() => {});
  }
}
/* Sound design : timbres doux (cloches, marimba, nappes), passés dans une petite
   réverbération de pièce et un compresseur pour un rendu chaud et homogène. */
let bus = null;
function impulse(sec, decay) {
  const n = Math.floor(actx.sampleRate * sec), b = actx.createBuffer(2, n, actx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
  return b;
}
function out() {
  if (bus) return bus;
  const inp = actx.createGain(), warm = actx.createBiquadFilter(), comp = actx.createDynamicsCompressor(), verb = actx.createConvolver(), wet = actx.createGain();
  inp.gain.value = .9;
  warm.type = 'lowpass'; warm.frequency.value = 6500;
  comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .25;
  verb.buffer = impulse(2.2, 3.2);
  wet.gain.value = .26;
  inp.connect(warm); warm.connect(comp); comp.connect(actx.destination);
  warm.connect(verb); verb.connect(wet); wet.connect(comp);
  bus = inp;
  return bus;
}
const note = m => 440 * Math.pow(2, (m - 69) / 12);
const soundOn = () => actx && store.settings.sound;
function rawTone(freq, dur = .12, type = 'sine', gain = .18, when = 0, slideTo) {
  if (!actx) return;
  const t = actx.currentTime + when, o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + .012);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(out());
  o.start(t); o.stop(t + dur + .03);
}
const tone = (...a) => { if (store.settings.sound) rawTone(...a); };
// Cloche / boîte à musique : fondamentale + partiels qui s'éteignent plus vite
function bell(m, when = 0, gain = .1, dur = 1.3) {
  if (!soundOn()) return;
  [[1, 1, 1], [2.01, .35, .55], [3.99, .12, .35], [5.43, .05, .2]].forEach(([r, gm, dm]) => rawTone(note(m) * r, dur * dm, 'sine', gain * gm, when));
}
// Marimba : attaque boisée, très courte
function mallet(m, when = 0, gain = .09, dur = .35) {
  if (!soundOn()) return;
  rawTone(note(m), dur, 'sine', gain, when);
  rawTone(note(m) * 4, dur * .25, 'sine', gain * .25, when);
}
// Nappe chaude (accord tenu, légèrement désaccordé)
function pad(ms, when = 0, gain = .035, dur = 1.8) {
  if (!soundOn()) return;
  ms.forEach(m => { rawTone(note(m), dur, 'triangle', gain, when); rawTone(note(m) * 1.004, dur, 'triangle', gain * .8, when + .01); });
}
function noise(dur = .3, from = 3000, to = 600, gain = .25, type = 'bandpass', when = 0) {
  if (!soundOn()) return;
  const len = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
  const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain(), t = actx.currentTime + when;
  src.buffer = buf;
  f.type = type; f.Q.value = .8;
  f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.value = gain;
  src.connect(f).connect(g).connect(out());
  src.start(t);
}
const MAJOR = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
const sfx = {
  // Bonne réponse : arpège qui monte d'un degré à chaque combo
  right: combo => { const base = 67 + MAJOR[Math.min(Math.max(combo, 1) - 1, 7)]; [0, 4, 7, 12].forEach((iv, i) => bell(base + iv, i * .07, .09)); },
  wrong: () => { tone(note(57), .32, 'sine', .14, 0, note(50)); mallet(50, .04, .05); },
  tick: last => mallet(last ? 96 : 91, 0, .045, .12),
  timeout: () => [67, 63, 60].forEach((m, i) => bell(m, i * .14, .07, 1)),
  tap: () => mallet(79, 0, .05, .18),
  pop: () => { mallet(84, 0, .06); mallet(91, .06, .05); },
  coin: () => { bell(88, 0, .07, .5); bell(95, .08, .07, .9); },
  fanfare: () => { [60, 64, 67, 72, 76].forEach((m, i) => bell(m, i * .09, .09)); pad([60, 64, 67], .1, .03, 2); },
  booster: () => { [84, 88, 91, 96].forEach((m, i) => bell(m, i * .05, .06, .9)); pad([72, 76, 79], 0, .02, 1.2); },
  needle: () => { noise(.08, 2500, 1800, .05, 'highpass'); tone(90, .18, 'sine', .08, .02, 55); },
  whoosh: () => noise(.5, 500, 2200, .07, 'bandpass'),
  // La pochette qui glisse : papier + petit bruit sourd
  tear: () => { noise(.6, 900, 2600, .09, 'bandpass'); tone(110, .25, 'sine', .08, .45, 70); },
  zip: p => mallet(55 + Math.round(p * 17), 0, .03, .12),
  charge: ms => { const d = ms / 1000; tone(note(48), d, 'triangle', .04, 0, note(72)); noise(d, 400, 3000, .035, 'bandpass'); },
  reveal: r => {
    if (r === 'common') { [72, 76, 79].forEach((m, i) => bell(m, i * .06, .08)); return; }
    if (r === 'rare') { [72, 76, 79, 84].forEach((m, i) => bell(m, i * .06, .09)); pad([72, 76, 79], .05, .025, 1.4); return; }
    if (r === 'epic') { [74, 78, 81, 86, 90].forEach((m, i) => bell(m, i * .07, .09)); pad([62, 69, 74, 78], .05, .03, 2.2); return; }
    tone(65, 1.4, 'sine', .2, 0, 44);
    [72, 74, 76, 79, 81, 84, 88, 91].forEach((m, i) => bell(m, .05 + i * .07, .085, 1.6));
    pad([60, 64, 67, 72], .1, .035, 2.8);
  },
};
// Ambiance du salon : crépitement de vinyle très doux, en boucle
const ambience = {
  src: null,
  start() {
    if (!soundOn() || this.src) return;
    const sec = 4, n = actx.sampleRate * sec, b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * .015 + (Math.random() < .0009 ? (Math.random() * 2 - 1) * .6 : 0);
    const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    src.buffer = b; src.loop = true;
    f.type = 'lowpass'; f.frequency.value = 3500;
    g.gain.value = 0; g.gain.linearRampToValueAtTime(.5, actx.currentTime + 1.2);
    src.connect(f).connect(g).connect(actx.destination);
    src.start();
    this.src = src; this.g = g;
  },
  stop() {
    if (!this.src) return;
    const s = this.src, g = this.g;
    g.gain.linearRampToValueAtTime(0, actx.currentTime + .4);
    setTimeout(() => { try { s.stop(); } catch (e) {} }, 450);
    this.src = null;
  },
};
const buzz = p => { if (!store.settings.haptics) return; try { navigator.vibrate?.(p); } catch (e) {} };
// Le focus programmatique n'est donné qu'aux joueurs au clavier (pas d'anneau parasite au doigt).
let keyboardUser = false;
document.addEventListener('keydown', () => { keyboardUser = true; }, true);
document.addEventListener('pointerdown', () => { keyboardUser = false; }, true);
const kbFocus = el => { if (el && keyboardUser) el.focus({ preventScroll: true }); };

function startBeat(bpm) {
  stopBeat();
  if (!actx) return;
  const period = 60000 / Math.max(70, Math.min(bpm || 110, 170));
  let n = 0;
  const hit = () => { rawTone(n % 2 ? 180 : 70, .12, n % 2 ? 'triangle' : 'sine', n % 2 ? .06 : .22); rawTone(6000, .03, 'square', .015, period / 2000); n++; };
  hit();
  beatTimer = setInterval(hit, period);
}
function stopBeat() { clearInterval(beatTimer); beatTimer = null; }
function stopMusic() { stopBeat(); try { player.pause(); } catch (e) {} try { stemAudio.pause(); } catch (e) {} }
function playPreview(url) {
  return new Promise(resolve => {
    let done = false;
    const finish = ok => { if (done) return; done = true; player.removeEventListener('playing', onPlay); resolve(ok); };
    const onPlay = () => finish(true);
    player.addEventListener('playing', onPlay);
    player.src = url;
    player.currentTime = 0;
    player.volume = 1;
    player.play().catch(() => finish(false));
    setTimeout(() => finish(!player.paused), 3500);
  });
}

/* ---------------- Navigation ---------------- */
function currentScreen() { return $('.screen.is-active')?.id.replace('screen-', ''); }
const TAB_SCREENS = ['home', 'boosters', 'story', 'pass', 'collection', 'shop', 'profile'];
function show(id) {
  $$('.screen').forEach(s => s.classList.toggle('is-active', s.id === `screen-${id}`));
  $('meta[name="theme-color"]')?.setAttribute('content', id === 'profile' ? '#DDF4FF' : '#FFFFFF');
  window.PompeNative?.post('theme', 'light');
  $('#tabbar').hidden = !TAB_SCREENS.includes(id);
  $$('#tabbar .tab').forEach(t => { const on = t.dataset.tab === id; t.classList.toggle('is-active', on); t.setAttribute('aria-current', on ? 'page' : 'false'); });
  window.scrollTo(0, 0);
  if (id === 'home') renderHome();
  if (id === 'collection') renderCollection();
  ambience.stop();
  if (id === 'shop') renderShop();
  if (id === 'pass') renderPass();
  if (id === 'boosters') renderBoosters();
  if (id === 'profile') renderProfile();
  if (id === 'story') { renderStory(); requestAnimationFrame(() => scrollToCurrent(false)); }
  renderBadges();
}
function renderBadges() {
  const unseen = ownedIds().filter(id => store.coll[id].seen === false).length;
  const setBadge = (el, v) => { el.hidden = !v; el.textContent = v === true ? '!' : v; };
  setBadge($('#tb-coll'), unseen > 9 ? '9+' : unseen);
  setBadge($('#tb-shop'), store.gift !== dayKey() ? true : 0);
  setBadge($('#tb-story'), totalBoosters());
  setBadge($('#tb-pass'), passClaimable());
  setBadge($('#tb-prof'), claimableAchs());
  $('#pt-badge').hidden = !claimableAchs();
}

/* ---------------- Toast & FX ---------------- */
const toastQueue = [];
let toastBusy = false;
function toast(msg) {
  if (toastQueue.includes(msg)) return;
  toastQueue.push(msg);
  // Un message vieux de plusieurs événements n'a plus de sens : on garde les plus récents.
  while (toastQueue.length > 2) toastQueue.shift();
  if (!toastBusy) nextToast();
}
function nextToast() {
  const ms = toastQueue.length > 1 ? 1700 : 2300;
  const msg = toastQueue.shift();
  const t = $('#toast');
  if (!msg) { toastBusy = false; return; }
  toastBusy = true;
  t.textContent = msg;
  t.classList.add('is-on');
  setTimeout(() => { t.classList.remove('is-on'); setTimeout(nextToast, 220); }, ms);
}
function winFx(el) {
  if (REDUCED) return;
  const it = itemOf('fx', store.equip.fx) || COSMETICS.fx[0], r = el?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : innerWidth / 2, y = r ? r.top + r.height / 2 : innerHeight / 2;
  const layer = $('#fx-layer');
  for (let i = 0; i < 16; i++) {
    const g = it.glyphs[i % it.glyphs.length], p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
    p.className = g === 'coin' ? 'wfx coin' : 'wfx';
    if (g !== 'coin') p.innerHTML = ico(g);
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty('--s', `${14 + Math.random() * 16}px`);
    p.style.setProperty('--dx', `${Math.cos(a) * d}px`);
    p.style.setProperty('--dy', `${Math.sin(a) * d - 40}px`);
    p.style.setProperty('--rot', `${(Math.random() - .5) * 120}deg`);

    layer.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}
function flyPoints(text, el) {
  const r = el?.getBoundingClientRect(), d = document.createElement('div');
  d.className = 'fx-points';
  d.textContent = text;
  d.style.left = `${r ? r.left + r.width / 2 : innerWidth / 2}px`;
  d.style.top = `${r ? r.top + r.height / 2 : innerHeight / 2}px`;
  $('#fx-layer').appendChild(d);
  setTimeout(() => d.remove(), 1200);
}
function confetti(n = 60, colors = ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF', '#FF9600']) {
  if (REDUCED) return;
  const layer = $('#fx-layer');
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = colors[i % colors.length];
    c.style.setProperty('--dx', `${(Math.random() - .5) * 200}px`);
    c.style.setProperty('--rot', `${Math.random() * 720}deg`);
    c.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    c.style.animationDelay = `${Math.random() * .3}s`;
    layer.appendChild(c);
    setTimeout(() => c.remove(), 3400);
  }
}

/* ---------------- Accueil ---------------- */
let dailyTicker = null;
function renderHome() {
  const streak = currentStreak();
  $('#home-streak-n').textContent = streak;
  $('#home-streak').classList.toggle('is-cold', !playedToday());
  $('#home-streak').setAttribute('aria-label', `Série : ${plural(streak, 'jour', 'jours')}${playedToday() ? '' : ' — joue aujourd’hui pour la garder'}`);
  const nb = totalBoosters(), hb = $('#home-boosters');
  $('#home-boosters-n').textContent = nb;
  hb.classList.toggle('is-empty', !nb);
  hb.classList.toggle('has-boosters', nb > 0);
  hb.querySelector('use').setAttribute('href', store.goldBoosters ? '#i-booster-gold' : '#i-booster');
  renderCoins();

  const list = $('#cat-list');
  if (!list.children.length) {
    list.innerHTML = CATS.map(c => `
      <button class="cat" type="button" role="radio" data-cat="${c.id}">
        <span class="cat-illu" aria-hidden="true" style="background:${c.bg}"><img src="${c.illu}" alt="" loading="lazy" style="object-position:${c.pos}"></span>
        <span class="cat-name">${esc(c.name)}</span>
        <span class="cat-count">${poolFor(c.id).length} titres</span>
      </button>`).join('');
  }
  $$('.cat', list).forEach(b => b.setAttribute('aria-checked', String(b.dataset.cat === store.prefs.cat)));
  $$('#mode-seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.mode === store.prefs.mode)));
  $$('#rounds-seg button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.rounds === store.prefs.rounds)));
  $('#play-sub').textContent = `${catById(store.prefs.cat).name} · ${store.prefs.rounds} manches${store.prefs.mode === 'type' ? ' · saisie' : store.prefs.mode === 'stems' ? ' · rapide' : ''}`;
  renderBoosterCard();
  renderMissionsCard();
  renderStoryCard();
  renderPassCard();
  renderDaily();
  clearInterval(dailyTicker);
  dailyTicker = setInterval(() => { if (currentScreen() === 'home') renderDaily(); else clearInterval(dailyTicker); }, 1000);
}
const totalBoosters = () => store.boosters + store.goldBoosters;
function renderBoosterCard() {
  const n = totalBoosters(), card = $('#booster-card');
  card.classList.toggle('is-empty', n === 0);
  $$('.hero-pack use', card).forEach(u => u.setAttribute('href', store.goldBoosters ? '#i-booster-gold' : '#i-booster'));
  $('.hp-2', card).style.display = n < 2 ? 'none' : '';
  $('.hp-3', card).style.display = n < 3 ? 'none' : '';
  $('#bcard-badge').hidden = n < 2;
  $('#bcard-badge').textContent = n;
  const welcome = store.opened === 0 && n > 0;
  $('.hero-kicker', card).textContent = welcome ? 'Cadeau de bienvenue' : store.goldBoosters ? 'Booster Or disponible !' : 'Boosters de vinyles';
  $('#bcard-title').textContent = welcome ? '1 booster offert\u00A0!' : n ? `${plural(n, 'booster', 'boosters')} à ouvrir` : 'Prochain booster';
  $('#bcard-gauge-fill').style.width = `${store.gauge / GAUGE_MAX * 100}%`;
  $('#bcard-gauge-txt').textContent = n
    ? `Prochain : ${store.gauge}/${GAUGE_MAX} bonnes réponses`
    : `${store.gauge}/${GAUGE_MAX} bonnes réponses · encore ${GAUGE_MAX - store.gauge} !`;
  $('#btn-open-booster').textContent = n ? 'Ouvrir' : 'Boutique';
}
function ownedIds() { return Object.keys(store.coll).filter(id => SONG.has(id)); }
function renderMissionsCard() {
  const M = ensureMissions(), done = M.list.filter(m => m.p >= m.target).length;
  $('#mis-done').textContent = done;
  $$('#mis-dots i').forEach((d, i) => { const m = M.list[i]; d.className = m?.claimed ? 'is-claimed' : m && m.p >= m.target ? 'is-done' : ''; });
  const next = M.list.find(m => m.p < m.target);
  const claim = missionsClaimable();
  $('#mis-next').textContent = claim ? `${plural(claim, 'récompense', 'récompenses')} à récupérer` : next ? `${next.text} (${next.max ? fmt(next.p) : next.p}/${next.max ? fmt(next.target) : next.target})` : 'Toutes les missions sont faites !';
  $('#mis-badge').hidden = !claim;
}
function dailyToday() { return store.daily && store.daily.date === dayKey() ? store.daily : null; }
function renderDaily() {
  const d = dailyToday(), card = $('#daily-card');
  card.classList.toggle('is-done', !!d);
  if (!d) {
    $('#daily-title').textContent = 'Chanson mystère';
    $('#daily-sub').textContent = '3 essais · +1 booster';
    $('#daily-cta').textContent = 'Jouer';
    return;
  }
  $('#daily-title').textContent = d.won ? 'Défi réussi !' : 'Raté !';
  $('#daily-sub').textContent = d.title ? `« ${d.title} »` : 'Défi abandonné';
  $('#daily-cta').textContent = hms(msToMidnight());
}
function dailySongCandidates() {
  const h = hashStr(`pompelup-${dayKey()}`), out = [];
  for (let k = 0; k < 6; k++) out.push(SONGS[(h + k * 7919) % SONGS.length]);
  return out;
}

/* ---------------- Partie ---------------- */
const G = { phase: 'idle', token: 0 };
const NO_AUTO = /[?&]noauto\b/.test(location.search);   // tests automatisés uniquement

function startGame(cfg) {
  unlockAudio();
  const pool = cfg.daily ? cfg.candidates.slice() : shuffle(poolFor(cfg.cat).slice());
  const rounds = Math.min(cfg.rounds, pool.length);
  Object.assign(G, {
    cfg, token: G.token + 1, phase: 'loading',
    songs: pool.slice(0, rounds), spares: pool.slice(rounds, rounds + 12),
    i: 0, score: 0, combo: 0, bestCombo: 0, results: [], boostersWon: 0, hintUsed: false,
    dur: cfg.daily ? 30 : cfg.mode === 'type' ? 25 : 20,
  });
  if (cfg.daily) { store.daily = { date: dayKey(), won: false, tries: 0, done: false }; save(); }
  $('#game-score').textContent = '0';
  $('#game-score').dataset.v = 0;
  $('#game-gauge').hidden = !!cfg.daily;
  $('.game-score').hidden = !!cfg.daily;
  $('#game-combo').hidden = true;
  $('#game-prog').style.width = '0';
  updateGameGauge();
  applySkins();
  host.mood = null;
  host.render('happy');
  // Pré-rendu des autres humeurs : pas d'à-coup au moment de la réponse
  ['wow', 'sad', 'wink'].forEach(mood => charHTML(HOST, { head: true, mood }));
  $('#screen-game').classList.toggle('is-rapid', cfg.mode === 'stems');
  show('game');
  G.songs.slice(0, 2).forEach(fetchPreview);
  startRound();
}
function updateGameGauge() { $('#game-gauge-n').textContent = `${store.gauge}/${GAUGE_MAX}`; }

async function resolveRound(i) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const song = G.songs[i];
    const pv = await fetchPreview(song);
    if (pv) return { song, pv };
    if (!G.spares.length) break;
    G.songs[i] = G.spares.shift();
  }
  return { song: G.songs[i], pv: null };
}

function distractors(song, n = 3) {
  const src = G.cfg.daily ? SONGS : poolFor(G.cfg.cat);
  const seen = new Set([cleanTitle(song.title)]);
  const same = shuffle(src.filter(s => s.genre === song.genre && s.id !== song.id));
  const other = shuffle(src.filter(s => s.genre !== song.genre && s.id !== song.id));
  const out = [];
  for (const s of [...same, ...other, ...shuffle(SONGS.slice())]) {
    const k = cleanTitle(s.title);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
    if (out.length === n) break;
  }
  return out;
}

async function startRound() {
  const token = ++G.token;
  G.phase = 'loading';
  G.hint = 0;
  G.tries = 0;
  stopMusic();
  $('#combo').classList.remove('is-on');
  const disc = $('#disc');
  disc.classList.remove('is-revealed', 'is-spinning');
  $('#tonearm').classList.remove('is-on');
  const img = $('#disc-art');
  img.classList.remove('has-src');
  img.removeAttribute('src');
  $('#reveal').hidden = true;
  $('#screen-game').classList.remove('is-reveal');
  $('#clues').hidden = true;
  $('#rapid').hidden = true;
  $('#btn-next').hidden = true;
  $('#game-prog').style.width = `${G.i / G.songs.length * 100}%`;
  $('#game-title').textContent = G.cfg.daily ? 'Chanson mystère du jour' : G.cfg.mode === 'type' ? 'Écris le titre de cette chanson' : G.cfg.mode === 'stems' ? 'Maintiens le disque pour écouter' : 'Quelle est cette chanson ?';
  G.holding = false;
  if (!G.cfg.daily) say(G.i === G.songs.length - 1 && G.i > 0 ? HOST_LINES.last() : HOST_LINES.start(G.i + 1));
  else say('Le défi du jour : 3 essais, pas un de plus !');
  $('#game-round').textContent = G.cfg.daily ? 'Défi du jour' : `Manche ${G.i + 1}/${G.songs.length}`;
  $('#stage-status').textContent = G.i === 0 ? 'On chauffe les platines…' : 'Chargement de l’extrait…';
  setTimer(1, G.dur);
  $('#choices').innerHTML = '';
  $('#type-box').hidden = true;
  const hintBtn = $('#btn-hint');
  hintBtn.hidden = !!G.cfg.daily || G.cfg.mode === 'stems';
  hintBtn.disabled = true;
  $('#hint-label').textContent = G.cfg.mode === 'type' ? 'Indice (−30 %)' : '50/50 (−30 %)';

  const { song, pv } = await resolveRound(G.i);
  if (token !== G.token) return;
  G.song = song;
  G.pv = pv;
  if (G.songs[G.i + 1]) fetchPreview(G.songs[G.i + 1]);
  const art = pv?.art || knownArt(song.id);
  if (art) { img.onload = () => img.classList.add('has-src'); img.src = art; }
  $('#disc-label').style.background = song.color || 'var(--orange)';
  $('#btn-replay-audio').hidden = G.cfg.mode === 'stems';

  if (G.cfg.mode === 'type') {
    $('#type-box').hidden = false;
    $('#type-input').value = '';
    $('#type-input').classList.remove('is-wrong');
    $('#suggest').innerHTML = '';
    $('#attempts').hidden = !G.cfg.daily;
    renderAttempts();
  } else {
    const opts = shuffle([song, ...distractors(song)]);
    $('#choices').innerHTML = opts.map((s, k) => `
      <button class="choice" type="button" data-id="${s.id}" disabled>
        <span class="choice-key" aria-hidden="true">${k + 1}</span>
        <span class="choice-txt"><span class="choice-title">${esc(s.title)}</span><span class="choice-artist">${esc(s.artist)}</span></span>
      </button>`).join('');
  }

  $('#tonearm').classList.add('is-on');
  sfx.needle();
  if (G.cfg.mode === 'stems') { await startRapidRound(token, song, pv); return; }
  let playing = false;
  if (pv) playing = await playPreview(pv.url);
  if (!playing && pv?.catalog && token === G.token) {
    const lv = await livePreview(song);
    if (token !== G.token) return;
    if (lv) { G.pv = lv; playing = await playPreview(lv.url); }
  }
  if (token !== G.token) return;
  if (!playing) {
    // Pas d'extrait (hors ligne, bloqué…) : on joue avec des indices et un beat au bon tempo.
    startBeat(song.bpm);
    $('#clues').hidden = false;
    $('#clues').innerHTML = `<span class="clue">Année <b>${song.year}</b></span><span class="clue">${esc(song.genre)}</span>`;
    $('#stage-status').textContent = 'Extrait indisponible — devine avec les indices';
  } else {
    $('#stage-status').textContent = G.cfg.daily ? 'Quelle est cette chanson ?' : 'Écoute bien…';
  }

  G.phase = 'playing';
  G.t0 = performance.now();
  G.lastSec = null;
  disc.classList.add('is-spinning');
  $$('.choice').forEach(b => { b.disabled = false; });
  hintBtn.disabled = false;
  if (G.cfg.mode === 'type' && matchMedia('(pointer: fine)').matches) $('#type-input').focus();
  loop(token);
}

// Anneau du minuteur : bleu, puis orange sous 10 s, rouge sous 5 s
function setTimer(frac, secs) {
  const low = secs <= 5 && secs > 0, mid = secs <= 10 && !low && secs > 0;
  const ring = $('#ring-fg');
  ring.style.strokeDashoffset = String(100 * (1 - Math.max(0, Math.min(1, frac))));
  ring.classList.toggle('is-low', low);
  ring.classList.toggle('is-mid', mid);
  const num = $('#timer-num');
  num.textContent = Math.max(0, Math.ceil(secs));
  num.classList.toggle('is-low', low);
  num.classList.toggle('is-mid', mid);
}

function loop(token) {
  if (token !== G.token || G.phase !== 'playing') return;
  const left = G.dur - (performance.now() - G.t0) / 1000;
  setTimer(left / G.dur, left);
  const sec = Math.ceil(left);
  if (sec !== G.lastSec) {
    G.lastSec = sec;
    if (sec === 5) say(HOST_LINES.hurry(), 'wow', 1500);
    if (sec <= 5 && sec > 0) {
      sfx.tick(sec === 1);
      const n = $('#timer-num');
      n.classList.remove('is-low'); void n.offsetWidth; n.classList.add('is-low');
    }
  }
  if (left <= 0) return finishRound(false, 'timeout');
  requestAnimationFrame(() => loop(token));
}

function points() {
  if (G.cfg.mode === 'stems') return Math.round(rapidPoints() * (1 + Math.min(.5, .1 * (G.combo - 1))) / 10) * 10;
  const left = Math.max(0, G.dur - (performance.now() - G.t0) / 1000);
  const base = 100 + 900 * (left / G.dur);
  const comboMult = 1 + Math.min(.5, .1 * (G.combo - 1));
  const modeMult = G.cfg.mode === 'type' ? 1.5 : 1;
  const hintMult = G.hint ? .7 : 1;
  return Math.round(base * comboMult * modeMult * hintMult / 10) * 10;
}

function finishRound(ok, reason, sourceEl) {
  if (G.phase !== 'playing') return;
  G.phase = 'reveal';
  const rapid = G.cfg.mode === 'stems';
  if (rapid) holdEnd();
  const song = G.song, elapsed = rapid ? G.heard : (performance.now() - G.t0) / 1000;
  let pts = 0;
  if (ok) {
    G.combo++;
    G.bestCombo = Math.max(G.bestCombo, G.combo);
    pts = points();
    G.score += pts;
    sfx.right(G.combo);
    buzz(35);
    flyPoints(`+${fmt(pts)}`, sourceEl || $('#disc'));
    winFx(sourceEl || $('#disc'));
    store.stats.bestCombo = Math.max(store.stats.bestCombo, G.combo);
    if (elapsed < 3) store.stats.fast++;
    missionEvent('found');
    if (!G.cfg.daily) addPassPts(10);
    missionEvent('combo', G.combo);
    if (elapsed < 5) missionEvent('fast5');
    if (G.cfg.mode === 'type') missionEvent('typeFound');
    if (G.combo >= 2) {
      const c = $('#combo');
      c.innerHTML = `${ico('flame')} COMBO ×${G.combo}`;
      c.classList.remove('is-on'); void c.offsetWidth; c.classList.add('is-on');
      $('#game-combo').hidden = false;
      $('#game-combo-n').textContent = G.combo;
    }
    animateScore();
    if (!G.cfg.daily) {
      const won = addGauge(1);
      save();
      updateGameGauge();
      const gg = $('#game-gauge');
      gg.classList.remove('is-hit'); void gg.offsetWidth; gg.classList.add('is-hit');
      if (won) {
        G.boostersWon += won;
        setTimeout(() => { sfx.booster(); buzz([30, 50, 30]); toast('Booster gagné ! Ouvre-le à la fin de la partie'); }, 450);
      }
    }
  } else {
    if (G.combo >= 3) toast(`Combo ×${G.combo} cassé…`);
    G.combo = 0;
    $('#game-combo').hidden = true;
    reason === 'timeout' ? sfx.timeout() : sfx.wrong();
    buzz([50, 40, 50]);
  }
  G.results.push({ song, ok, pts, time: elapsed, art: G.pv?.art || knownArt(song.id) });

  $('#disc').classList.remove('is-spinning');
  $('#disc').classList.add('is-revealed');
  $('#tonearm').classList.remove('is-on');
  stopBeat();
  $('#btn-hint').disabled = true;
  $$('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.id === song.id) b.classList.add('is-right');
  });
  $('#type-input').blur();
  $('#suggest').innerHTML = '';
  if (!rapid) setTimer(ok ? (G.dur - elapsed) / G.dur : 0, ok ? G.dur - elapsed : 0);
  say(ok ? HOST_LINES.right(G.combo, elapsed < 3) : reason === 'timeout' ? HOST_LINES.timeout(song) : HOST_LINES.wrong(song), ok ? (G.combo >= 3 ? 'wow' : 'happy') : 'sad', 2600);
  if (rapid) {
    renderStems();
    $('#rapid').hidden = true;
    // Récompense : on entend enfin le morceau complet
    if (G.rapidSrc === 'stems') { setStemLevel(4); stemAudio.play().catch(() => {}); }
    else if (G.rapidSrc === 'plain') player.play().catch(() => {});
    $('#disc').classList.remove('is-spinning');
  }
  $('#timer-num').classList.remove('is-low');
  $('#ring-fg').classList.remove('is-low');

  // Feuille de verdict en bas de l'écran, verte ou rouge
  const v = $('#reveal-verdict');
  v.className = `reveal-verdict ${ok ? 'ok' : 'ko'}`;
  v.textContent = ok ? (G.combo >= 3 ? `${G.combo} d’affilée !` : pickOne(['Excellent !', 'Bien joué !', 'Trop fort !', 'Parfait !']))
    : reason === 'timeout' ? 'Temps écoulé !' : 'Presque !';
  $('#reveal-title').textContent = ok ? song.title : `Réponse : ${song.title}`;
  $('#reveal-artist').textContent = `${song.artist} · ${song.year}${ok && pts ? ` · +${fmt(pts)} pts` : ''}`;
  $('#reveal').className = `feedback ${ok ? 'is-ok' : 'is-ko'}`;
  $('#reveal').hidden = false;
  $('#screen-game').classList.add('is-reveal');
  $('#game-prog').style.width = `${(G.i + 1) / G.songs.length * 100}%`;
  $('#clues').hidden = true;
  $('#stage-status').textContent = '';

  const last = G.i >= G.songs.length - 1;
  const next = $('#btn-next');
  next.querySelector('span').textContent = last ? 'Voir les résultats' : 'Continuer';
  next.hidden = false;
  const bar = $('#next-progress');
  const wait = G.cfg.daily ? 4200 : 3600;
  bar.style.transition = 'none'; bar.style.width = '0';
  void bar.offsetWidth;
  bar.style.transition = `width ${wait}ms linear`; bar.style.width = '100%';
  const token = G.token;
  if (!NO_AUTO) G.autoNext = setTimeout(() => { if (token === G.token && G.phase === 'reveal') nextRound(); }, wait);
}

function animateScore() {
  const el = $('#game-score'), from = +el.dataset.v || 0, to = G.score, t0 = performance.now();
  el.dataset.v = to;
  const step = t => { const k = Math.min(1, (t - t0) / 500); el.textContent = fmt(from + (to - from) * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

function nextRound() {
  if (G.phase !== 'reveal') return;
  clearTimeout(G.autoNext);
  if (G.i >= G.songs.length - 1) return endGame();
  G.i++;
  startRound();
}

/* ================= PRÉSENTATRICE ================= */
const HOST = { id: 'host', kind: 'human', name: 'DJ Patator', skin: '#F3CDB8', hair: 'short', hairColor: '#6B4A32', face: 'beard', top: '#F5B81C', shirt: '#1F1B2E', pants: '#3F4A63', acc: { head: { type: 'bob', color: '#8B5A3C' }, eyes: { type: 'shades', color: '#111827' }, ears: { type: 'phones', color: '#EC4899' } } };
const host = {
  mood: null, timer: null,
  render(mood) {
    if (mood === this.mood) return;
    this.mood = mood;
    $('#host-av').innerHTML = `<span class="hv hv-rest">${charHTML(HOST, { head: true, mood })}</span>`;
  },
  // Petite voix musicale : une syllabe = une note douce de la gamme pentatonique
  voice(text) {
    if (!soundOn()) return;
    const syl = Math.min(9, Math.max(2, Math.round(text.replace(/[^a-zà-ÿ]/gi, '').length / 3)));
    const scale = [74, 76, 79, 81, 84, 86];
    for (let i = 0; i < syl; i++) mallet(scale[(i * 3 + text.length) % scale.length], i * .075, .035, .12);
  },
  say(text, mood = 'talk', ms = 2200) {
    const av = $('#host-av'), bubble = $('#host-bubble');
    $('#host-text').textContent = text;
    bubble.classList.remove('is-pop'); void bubble.offsetWidth; bubble.classList.add('is-pop');
    this.render(mood === 'talk' ? 'happy' : mood);
    av.classList.remove('is-bounce'); void av.offsetWidth; av.classList.add('is-bounce');
    av.classList.add('is-talking');
    this.voice(text);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => av.classList.remove('is-talking'), Math.min(ms, 280 + text.length * 38));
  },
};
const say = (...a) => host.say(...a);
const HOST_LINES = {
  start: n => pickOne([`Manche ${n} ! Tends l’oreille…`, 'Attention, ça démarre !', 'Voilà le prochain extrait !', 'Tu la connais, celle-là ?']),
  last: () => 'Dernière manche, tout se joue maintenant !',
  hurry: () => pickOne(['Plus que 5 secondes !', 'Vite, vite !', 'Le temps file…']),
  right: (combo, fast) => combo >= 3 ? `Combo ×${combo} ! Tu es en feu !` : fast ? pickOne(['Réflexe de DJ !', 'Trop rapide !', 'Instantané !']) : pickOne(['Bien joué !', 'Exactement !', `Bravo ${displayName()} !`, 'Oreille d’or !']),
  wrong: s => pickOne(['Aïe, raté…', 'Pas cette fois !', 'Presque !']) + ` C’était « ${s.title} ».`,
  timeout: s => `Temps écoulé ! C’était « ${s.title} ».`,
  hint: () => pickOne(['Un petit coup de pouce…', 'Je t’aide un peu !']),
  end: ratio => ratio >= .8 ? 'Quelle partie, bravo !' : ratio >= .5 ? 'Belle partie !' : 'On remet ça ?',
};

/* ================= PARTIE RAPIDE : écoute au doigt + stems ================= */
const RAPID_MAX = 12;            // secondes d'écoute avant que la jauge soit pleine
const STEMS = [
  { id: 'voice', label: 'Voix', icon: 'g-mic', cost: 0 },
  { id: 'guitar', label: 'Guitare', icon: 'g-guitar', cost: 100 },
  { id: 'drums', label: 'Batterie', icon: 'g-drum', cost: 100 },
  { id: 'bass', label: 'Basse', icon: 'g-bass', cost: 100 },
  { id: 'full', label: 'Tout', icon: 'g-sliders', cost: 150 },
];
const stemAudio = new Audio();
stemAudio.crossOrigin = 'anonymous';
stemAudio.preload = 'auto';
let stemGraph = null;
// Séparation approximative d'un mix stéréo : centre filtré = voix, côtés = guitares/mélodies,
// aigus = batterie (cymbales), graves du centre = basse.
function buildStemGraph() {
  if (stemGraph || !actx) return stemGraph;
  try {
    const src = actx.createMediaElementSource(stemAudio);
    const split = actx.createChannelSplitter(2);
    src.connect(split);
    const mid = actx.createGain(), side = actx.createGain(), inv = actx.createGain();
    mid.gain.value = .5; side.gain.value = .5; inv.gain.value = -.5;
    split.connect(mid, 0); split.connect(mid, 1);
    split.connect(side, 0); split.connect(inv, 1); inv.connect(side);
    const filt = (input, type, freq, q = .7, gain) => { const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; if (gain != null) f.gain.value = gain; input.connect(f); return f; };
    const outG = actx.createGain();
    outG.connect(actx.destination);
    const stemGain = node => { const g = actx.createGain(); g.gain.value = 0; node.connect(g); g.connect(outG); return g; };
    const voice = filt(filt(filt(mid, 'highpass', 220), 'lowpass', 4200), 'peaking', 1800, 1, 5);
    const guitar = filt(filt(side, 'highpass', 180), 'lowpass', 7000);
    const drums = filt(src, 'highpass', 4500);
    const kick = filt(mid, 'bandpass', 65, 1.4);
    const bass = filt(mid, 'lowpass', 190);
    const full = actx.createGain(); src.connect(full);
    stemGraph = {
      voice: stemGain(voice), guitar: stemGain(guitar), drums: stemGain(drums), kick: stemGain(kick), bass: stemGain(bass), full: stemGain(full),
    };
    stemGraph.guitar.connect(outG);
  } catch (e) { stemGraph = null; }
  return stemGraph;
}
function setStemLevel(stage) {
  if (!stemGraph) return;
  const t = actx.currentTime, set = (g, v) => { g.gain.cancelScheduledValues(t); g.gain.linearRampToValueAtTime(v, t + .25); };
  const fullOn = stage >= 4;
  set(stemGraph.voice, fullOn ? 0 : 1.2);
  set(stemGraph.guitar, fullOn ? 0 : stage >= 1 ? 1.4 : 0);
  set(stemGraph.drums, fullOn ? 0 : stage >= 2 ? 1.3 : 0);
  set(stemGraph.kick, fullOn ? 0 : stage >= 2 ? .8 : 0);
  set(stemGraph.bass, fullOn ? 0 : stage >= 3 ? 1.1 : 0);
  set(stemGraph.full, fullOn ? 1 : 0);
}
// Charge l'extrait pour les stems ; si le serveur refuse le CORS, on retombe sur l'écoute complète.
function loadStemAudio(url) {
  return new Promise(resolve => {
    let done = false;
    const finish = ok => { if (done) return; done = true; stemAudio.removeEventListener('canplay', onOk); stemAudio.removeEventListener('error', onErr); resolve(ok); };
    const onOk = () => finish(true), onErr = () => finish(false);
    stemAudio.addEventListener('canplay', onOk);
    stemAudio.addEventListener('error', onErr);
    stemAudio.src = url;
    stemAudio.load();
    setTimeout(() => finish(stemAudio.readyState >= 2), 4000);
  });
}
async function startRapidRound(token, song, pv) {
  G.heard = 0; G.stem = 0; G.holding = false; G.maxed = false;
  G.rapidSrc = null;
  if (pv) {
    unlockAudio();
    let ok = await loadStemAudio(pv.url);
    if (token !== G.token) return;
    if (!ok && pv.catalog) {
      const lv = await livePreview(song);
      if (token !== G.token) return;
      if (lv) { pv = G.pv = lv; ok = await loadStemAudio(pv.url); if (token !== G.token) return; }
    }
    if (ok && buildStemGraph()) { G.rapidSrc = 'stems'; setStemLevel(0); }
    else { G.rapidSrc = 'plain'; player.src = pv.url; }
  }
  if (!G.rapidSrc) {
    G.rapidSrc = 'beat';
    $('#clues').hidden = false;
    $('#clues').innerHTML = `<span class="clue">Année <b>${song.year}</b></span><span class="clue">${esc(song.genre)}</span>`;
  }
  renderStems();
  $('#rapid').hidden = false;
  $('#hold-hint').textContent = 'Maintiens le disque pour écouter';
  $('#stage-status').textContent = `${fmt(rapidPoints())} pts en jeu`;
  G.phase = 'playing';
  G.t0 = performance.now();
  G.lastTick = G.t0;
  setTimer(1, RAPID_MAX);
  $$('.choice').forEach(b => { b.disabled = false; });
  rapidLoop(token);
}
function renderStems() {
  const avail = G.rapidSrc === 'stems';
  $('#stems').innerHTML = STEMS.map((s, i) => {
    const on = i <= G.stem, next = i === G.stem + 1;
    return `<button class="stem${on ? ' is-on' : ''}${next ? ' is-next' : ''}" type="button" data-stem="${i}" ${!next || !avail || G.phase === 'reveal' ? 'disabled' : ''}>
      ${ico(s.icon)}<b>${s.label}</b>${next ? `<small>−${s.cost}</small>` : ''}</button>`;
  }).join('');
  $('#stems').hidden = !avail;
}
function addStem() {
  if (G.phase !== 'playing' || G.stem >= STEMS.length - 1) return;
  G.stem++;
  setStemLevel(G.stem);
  const s = STEMS[G.stem];
  sfx.tap(); buzz(20);
  say(s.id === 'full' ? 'Et voilà le morceau complet !' : `Et voilà ${s.id === 'drums' ? 'la batterie' : s.id === 'bass' ? 'la basse' : 'la guitare'} !`, 'wink');
  renderStems();
  $('#stage-status').textContent = `${fmt(rapidPoints())} pts en jeu`;
}
function rapidPoints() {
  const cost = STEMS.slice(1, G.stem + 1).reduce((a, s) => a + s.cost, 0);
  return Math.max(50, Math.round((1000 * (1 - G.heard / RAPID_MAX) - cost) / 10) * 10);
}
function holdStart() {
  if (G.phase !== 'playing' || G.cfg.mode !== 'stems' || G.holding || G.maxed) return;
  G.holding = true;
  G.lastTick = performance.now();
  $('#disc').classList.add('is-spinning');
  $('#hold').classList.add('is-held');
  $('#hold-hint').textContent = 'Écoute… relâche pour réfléchir';
  if (G.rapidSrc === 'stems') { if (actx?.state === 'suspended') actx.resume(); stemAudio.play().catch(() => {}); }
  else if (G.rapidSrc === 'plain') player.play().catch(() => {});
  else startBeat(G.song.bpm);
}
function holdEnd() {
  if (!G.holding) return;
  G.holding = false;
  $('#disc').classList.remove('is-spinning');
  $('#hold').classList.remove('is-held');
  if (G.phase === 'playing') $('#hold-hint').textContent = G.maxed ? 'Plus d’écoute : choisis ta réponse !' : 'Maintiens le disque pour écouter';
  try { stemAudio.pause(); } catch (e) {}
  try { player.pause(); } catch (e) {}
  stopBeat();
}
function rapidLoop(token) {
  if (token !== G.token || G.phase !== 'playing') return;
  const now = performance.now();
  if (G.holding) {
    G.heard = Math.min(RAPID_MAX, G.heard + (now - G.lastTick) / 1000);
    const left = RAPID_MAX - G.heard;
    setTimer(left / RAPID_MAX, left);
    $('#stage-status').textContent = `${fmt(rapidPoints())} pts en jeu`;
    const sec = Math.ceil(left);
    if (sec !== G.lastSec) { G.lastSec = sec; if (sec <= 3 && sec > 0) sfx.tick(sec === 1); }
    if (G.heard >= RAPID_MAX) {
      G.maxed = true;
      holdEnd();
      say('Plus d’écoute ! Fais ton choix…', 'wow');
    }
  }
  G.lastTick = now;
  requestAnimationFrame(() => rapidLoop(token));
}

/* ----- Réponses ----- */
function onChoice(btn) {
  if (G.phase !== 'playing' || btn.disabled) return;
  const ok = btn.dataset.id === G.song.id;
  if (!ok) btn.classList.add('is-wrong');
  finishRound(ok, 'wrong', btn);
}
function renderAttempts() {
  if (!G.cfg.daily) return;
  const max = G.cfg.attempts, left = max - G.tries;
  $('#attempts').innerHTML = `<span class="att-dots">${'<i class="is-on"></i>'.repeat(left)}${'<i></i>'.repeat(max - left)}</span>${plural(left, 'essai restant', 'essais restants')}`;
}
function submitText(text, pickedId) {
  if (G.phase !== 'playing') return;
  if (!text.trim() && !pickedId) return;
  const input = $('#type-input');
  if (!pickedId && cleanTitle(text).length < 2) { toast('Un peu court… tape le titre'); input.focus(); return; }
  const picked = pickedId && SONG.get(pickedId);
  const verdict = picked ? (picked.id === G.song.id || cleanTitle(picked.title) === cleanTitle(G.song.title) ? 'title' : null) : judge(text, G.song);
  if (verdict === 'title') return finishRound(true, 'right', input);
  if (verdict === 'artist' && !picked) {
    toast('Bon artiste ! Et le titre ?');
    input.select();
    return;
  }
  G.tries++;
  input.classList.remove('is-wrong'); void input.offsetWidth; input.classList.add('is-wrong');
  sfx.wrong();
  buzz(40);
  input.value = '';
  $('#suggest').innerHTML = '';
  if (G.cfg.daily) {
    renderAttempts();
    if (G.tries >= G.cfg.attempts) return finishRound(false, 'wrong');
  }
}
function renderSuggestions(q) {
  const box = $('#suggest'), n = normalize(q);
  if (n.length < 2 || G.phase !== 'playing') { box.innerHTML = ''; return; }
  const scored = [];
  for (const s of SONGS) {
    const t = normalize(s.title), a = normalize(s.artist);
    const sc = t.startsWith(n) ? 3 : t.includes(` ${n}`) ? 2 : t.includes(n) ? 1 : a.startsWith(n) ? .5 : 0;
    if (sc) scored.push([sc - t.length / 1000, s]);
  }
  scored.sort((x, y) => y[0] - x[0]);
  const seen = new Set();
  const top = scored.map(x => x[1]).filter(s => { const k = `${cleanTitle(s.title)}|${s.artist}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
  box.innerHTML = top.map(s => `<button class="sug" type="button" role="option" data-id="${s.id}"><b>${esc(s.title)}</b><span>${esc(s.artist)}</span></button>`).join('');
}
function useHint() {
  if (G.phase !== 'playing' || G.hint) return;
  G.hint = 1;
  G.hintUsed = true;
  say(HOST_LINES.hint(), 'wink');
  $('#btn-hint').disabled = true;
  sfx.tap();
  if (G.cfg.mode === 'type') {
    const first = G.song.title.split(/\s+/).map(w => w[0] + '·'.repeat(Math.max(0, Math.min(w.length - 1, 8)))).join(' ');
    $('#clues').hidden = false;
    $('#clues').innerHTML = `<span class="clue">Artiste : <b>${esc(G.song.artist)}</b></span><span class="clue"><b>${esc(first)}</b></span>`;
  } else {
    shuffle($$('.choice').filter(b => b.dataset.id !== G.song.id)).slice(0, 2).forEach(b => { b.disabled = true; b.classList.add('is-gone'); });
  }
}

/* ----- Fin de partie ----- */
function endGame() {
  G.phase = 'done';
  G.token++;
  clearTimeout(G.autoNext);
  stopMusic();
  const found = G.results.filter(r => r.ok).length, n = G.results.length;
  let xp, coins;
  if (G.cfg.daily) {
    const won = found === 1;
    xp = won ? 150 : 20;
    coins = won ? 60 : 10;
    if (won) { store.boosters++; G.boostersWon++; store.stats.dailyWins++; missionEvent('dailyWin'); addPassPts(50); }
    store.daily = { date: dayKey(), won, tries: won ? G.tries + 1 : G.cfg.attempts, done: true, title: G.song.title, artist: G.song.artist };
  } else {
    xp = Math.round(G.score / 25) + found * 5;
    coins = Math.round(G.score / 100) + found * 5;
    if (n >= 5 && found === n) store.stats.perfect++;
    missionEvent('game');
    addPassPts(30);
    missionEvent('score', G.score);
    missionEvent('catGame', 1, G.cfg.cat);
    if (!G.hintUsed) missionEvent('noHint');
  }
  store.coins += coins;
  const record = !G.cfg.daily && G.score > store.best && G.score > 0;
  if (record) store.best = G.score;
  if (!G.cfg.daily) store.games++;
  store.found += found;
  store.played += n;
  const levels = addXP(xp);
  G.boostersWon += levels;
  const streakUp = recordPlay();
  store.stats.bestStreak = Math.max(store.stats.bestStreak, store.streak.count);
  save();
  const after = levelOf(store.xp);

  const ratio = n ? found / n : 0;
  $('#res-char').innerHTML = meHTML({ mood: record ? 'grin' : ratio >= .6 ? 'happy' : ratio >= .3 ? 'smirk' : 'sad' });
  $('#res-title').textContent = G.cfg.daily ? (found ? 'Défi réussi !' : 'Défi raté…') : found === n && n > 0 ? 'Partie parfaite !' : ratio >= .5 ? 'Partie terminée !' : 'On remet ça ?';
  $('#res-kicker').textContent = G.cfg.daily ? 'Défi du jour' : `${catById(G.cfg.cat).name} · ${G.cfg.mode === 'type' ? 'saisie' : G.cfg.mode === 'stems' ? 'partie rapide' : '4 choix'}`;
  $('#res-record').hidden = !record;
  $('#res-acc').textContent = `${Math.round(ratio * 100)} %`;
  $('#res-acc-label').textContent = ratio === 1 ? 'Parfait' : ratio >= .8 ? 'Génial' : ratio >= .5 ? 'Bien' : 'Précision';
  $('#res-line').textContent = G.cfg.daily
    ? (found ? `Trouvé en ${plural(G.tries + 1, 'essai', 'essais')} !` : 'Pas cette fois… reviens demain !')
    : `${found}/${n} trouvée${found > 1 ? 's' : ''}${found === n && n > 0 ? ' — sans faute !' : ''}`;
  $('#res-combo').textContent = `×${G.bestCombo}`;
  const okTimes = G.results.filter(r => r.ok).map(r => r.time), avg = okTimes.length ? okTimes.reduce((a, b) => a + b, 0) / okTimes.length : 0;
  $('#res-time').textContent = okTimes.length ? `${avg.toFixed(1).replace('.', ',')} s` : '–';
  $('#res-speed-label').textContent = !okTimes.length ? 'Rapidité' : avg < 3 ? 'Éclair' : avg < 6 ? 'Rapide' : 'Appliqué';
  $('#res-xp').textContent = `+${xp} XP`;
  $('#res-coins').textContent = `+${fmt(coins)}`;
  $('#res-level').textContent = after.lvl;
  $('#res-level-2').textContent = after.lvl;
  $('#res-level-fill').style.width = '0';
  $('#recap').innerHTML = G.results.map((r, i) => `
    <li class="${r.ok ? 'ok' : 'ko'}" style="animation-delay:${.15 + i * .05}s">
      <span class="recap-art">${coverHTML(r.song, r.art)}</span>
      <span class="recap-txt"><b>${esc(r.song.title)}</b><span>${esc(r.song.artist)} · ${r.song.year}</span></span>
      <span class="recap-pts">${r.ok ? (G.cfg.daily ? 'Trouvé' : `+${fmt(r.pts)}`) : '—'}</span>
    </li>`).join('');
  $('#btn-replay').textContent = G.cfg.daily ? 'Accueil' : 'Rejouer';
  renderResBooster();
  show('results');

  const el = $('#res-score');
  if (G.cfg.daily) el.textContent = found ? '+150' : '0';
  else {
    const target = G.score, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 900); el.textContent = fmt(target * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  setTimeout(() => { $('#res-level-fill').style.width = `${Math.round(after.pct * 100)}%`; }, 250);

  if (record || (G.cfg.daily && found) || (found === n && n >= 5)) { sfx.fanfare(); confetti(); }
  if (levels) setTimeout(() => { toast(`Niveau ${after.lvl} atteint ! +${plural(levels, 'booster', 'boosters')} et +${100 * levels} jetons`); confetti(40); }, 900);
  if (streakUp) setTimeout(showStreak, 1300);
  setTimeout(checkAchievements, 1500);
}
function renderResBooster() {
  const box = $('#res-booster'), won = G.boostersWon || 0, n = totalBoosters();
  box.classList.toggle('is-earned', won > 0);
  $('#rb-title').textContent = won ? `+${plural(won, 'booster', 'boosters')} !` : 'Jauge booster';
  $('#rb-fill').style.width = `${store.gauge / GAUGE_MAX * 100}%`;
  $('#rb-txt').textContent = `${store.gauge}/${GAUGE_MAX} bonnes réponses${n ? ` · ${plural(n, 'booster', 'boosters')} en stock` : ''}`;
  const btn = $('#rb-open');
  btn.hidden = n === 0;
  btn.textContent = n > 1 ? `Ouvrir (${n})` : 'Ouvrir';
}

function showStreak() {
  const n = store.streak.count;
  $('#streak-n').textContent = n;
  $('#streak-label').textContent = n > 1 ? 'jours de série !' : 'jour de série !';
  // Les 7 derniers jours : les jours joués de la série s'allument
  const days = [];
  for (let k = 6; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); days.push({ k, d }); }
  $('#streak-week').innerHTML = days.map(({ k, d }) => `<span class="sw-day${k < n ? ' is-on' : ''}${k === 0 ? ' is-today' : ''}"><i>${k < n ? ico('g-check') : ''}</i>${'DLMMJVS'[d.getDay()]}</span>`).join('');
  $('#streak-msg').textContent = n > 1 ? 'Ta série continue. Reviens demain pour l’allonger !' : 'Série lancée ! Reviens demain pour la garder.';
  $('#streak-overlay').hidden = false;
  sfx.fanfare();
  buzz([30, 60, 30]);
  kbFocus($('#streak-ok'));
}

function quitGame() {
  G.token++;
  clearTimeout(G.autoNext);
  G.phase = 'idle';
  stopMusic();
  if (G.cfg?.daily && store.daily && !store.daily.done) {
    Object.assign(store.daily, { done: true, won: false, title: G.song?.title, artist: G.song?.artist });
    save();
  }
  $('#quit-sheet').hidden = true;
  show('home');
}

function share() {
  const found = G.results.filter(r => r.ok).length;
  const grid = G.results.map(r => (r.ok ? '■' : '□')).join('');
  const text = G.cfg.daily
    ? `Pompelup — Défi du ${new Date().toLocaleDateString('fr-FR')} : ${found ? `trouvé en ${plural(G.tries + 1, 'essai', 'essais')} !` : 'raté…'}`
    : `Pompelup — ${fmt(G.score)} pts · ${found}/${G.results.length} ${grid}\nMeilleur combo ×${G.bestCombo}. Tu fais mieux ?`;
  const url = location.href.split(/[?#]/)[0];
  const copy = () => {
    if (!navigator.clipboard) { toast('Partage indisponible ici'); return; }
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => toast('Copié ! Colle-le à tes potes'), () => toast('Partage indisponible ici'));
  };
  if (navigator.share) navigator.share({ title: 'Pompelup', text, url }).catch(e => { if (e?.name !== 'AbortError') copy(); });
  else copy();
}

/* ================= BOOSTERS ================= */
let BO = null;

// Un booster peut contenir un accessoire à la place d'un vinyle.
const ACC_DROP = { std: .3, gold: .6 };
function pickAccessory(rarity) {
  const all = COSMETICS.acc, order = [rarity, 'rare', 'common', 'epic', 'legendary'];
  for (const r of order) {
    const pool = all.filter(a => a.rarity === r);
    if (!pool.length) continue;
    const fresh = pool.filter(a => !isOwned('acc', a.id));
    return pickOne(fresh.length && Math.random() < .8 ? fresh : pool);
  }
  return all[0];
}
function makeBooster(kind = 'std') {
  const welcome = store.opened === 0;
  const cards = [], used = new Set();
  for (let k = 0; k < 3; k++) {
    const rarity = kind === 'gold' ? roll(k === 2 ? ODDS_GOLD_LAST : ODDS_GOLD) : roll(k === 2 ? (welcome ? ODDS_WELCOME : ODDS_LAST) : ODDS);
    const pool = BY_RARITY[rarity].filter(s => !used.has(s.id));
    const fresh = pool.filter(s => !store.coll[s.id]);
    const src = fresh.length && Math.random() < .75 ? fresh : pool;
    const song = pickOne(src);
    used.add(song.id);
    cards.push({ song, rarity });
  }
  if (!welcome && Math.random() < ACC_DROP[kind]) {
    const i = Math.random() < .5 ? 0 : 1;
    const acc = pickAccessory(cards[i].rarity);
    cards[i] = { acc, rarity: acc.rarity };
  }
  return cards.sort((a, b) => RANK[a.rarity] - RANK[b.rarity]);
}
function commitBooster(cards, kind) {
  if (kind === 'gold') store.goldBoosters = Math.max(0, store.goldBoosters - 1);
  else store.boosters = Math.max(0, store.boosters - 1);
  store.opened++;
  let coins = 0;
  for (const c of cards) {
    if (c.acc) {
      c.isNew = !isOwned('acc', c.acc.id);
      if (c.isNew) own('acc', c.acc.id); else { c.dupCoins = DUP_COINS[c.rarity]; coins += c.dupCoins; }
      continue;
    }
    const e = store.coll[c.song.id];
    c.isNew = !e;
    if (e) { e.n++; c.dupCoins = DUP_COINS[c.rarity]; coins += c.dupCoins; }
    else store.coll[c.song.id] = { n: 1, t: Date.now(), seen: false };
  }
  store.coins += coins;
  missionEvent('opened');
  save();
}

function openBooster() {
  if (totalBoosters() <= 0) { toast('Pas de booster… trouve des chansons ou passe à la boutique !'); return; }
  unlockAudio();
  stopMusic();
  try { listen.pause(); } catch (e) {}
  const kind = store.goldBoosters > 0 ? 'gold' : 'std';
  const cards = makeBooster(kind);
  const best = cards[cards.length - 1].rarity;
  BO = { cards, idx: 0, state: 'pack', best, kind, welcome: store.opened === 0 && kind === 'std' };
  cards.forEach(c => { if (!c.song) return; c.art = knownArt(c.song.id); getArt(c.song).then(a => { if (a) c.art = a; }); });

  const bo = $('#booster'), pack = $('#pack');
  bo.hidden = false;
  bo.className = 'bo';
  bo.style.setProperty('--glow', 'rgba(206,130,255,.32)');
  bo.style.setProperty('--ray', 'rgba(255,255,255,.05)');
  pack.className = kind === 'gold' ? 'pack is-gold' : 'pack';
  pack.hidden = false;
  $('.pack-name', pack).innerHTML = kind === 'gold' ? 'Booster<br>Or' : 'Booster<br>vinyle';
  $('.pack-sub', pack).textContent = kind === 'gold' ? '3 vinyles · épique garanti' : '3 vinyles · 1 rare garanti';
  pack.style.setProperty('--tear', 0);
  pack.style.setProperty('--leak', R_COLOR[best]);
  $('#vstack').innerHTML = '';
  $('#bo-fx').innerHTML = '';
  $('#bo-stage').hidden = false;
  $('#bo-summary').hidden = true;
  $('#bo-hint').hidden = false;
  $('#bo-hint').textContent = 'Glisse ton doigt pour ouvrir la pochette';
  $('#bo-count').textContent = BO.welcome ? 'Booster de bienvenue' : kind === 'gold' ? 'Booster Or' : 'Booster vinyle';
  $('#bo-left').textContent = totalBoosters() > 1 ? `×${totalBoosters()}` : '';
  document.body.style.overflow = 'hidden';
  sfx.whoosh();
  setTimeout(() => kbFocus(pack), 50);
}

function closeBooster() {
  if (!BO) return;
  BO = null;
  $('#booster').hidden = true;
  $('#bo-fx').innerHTML = '';
  document.body.style.overflow = '';
  const s = currentScreen();
  if (s === 'home') renderHome();
  if (s === 'collection') renderCollection();
  if (s === 'results') renderResBooster();
  if (s === 'shop') renderShop();
  if (s === 'profile') renderProfile();
  if (s === 'boosters') renderBoosters();
  renderCoins();
  checkAchievements();
}

/* Déchirer : glisser, taper ou clavier */
let drag = null;
function setTilt(e) {
  const pack = $('#pack'), r = pack.getBoundingClientRect();
  const mx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), my = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
  pack.style.setProperty('--rx', `${(mx - .5) * 20}deg`);
  pack.style.setProperty('--ry', `${(.5 - my) * 16}deg`);
  pack.style.setProperty('--mx', mx.toFixed(3));
  pack.classList.add('has-tilt');
}
function resetTilt() {
  const pack = $('#pack');
  pack.style.setProperty('--rx', '0deg');
  pack.style.setProperty('--ry', '0deg');
  pack.classList.remove('has-tilt');
}
function onPackDown(e) {
  if (BO?.state !== 'pack') return;
  const pack = $('#pack');
  drag = { x: e.clientX, max: 0, moved: false, w: pack.getBoundingClientRect().width };
  pack.setPointerCapture?.(e.pointerId);
  pack.classList.add('is-dragging');
  setTilt(e);
}
function onPackMove(e) {
  if (BO?.state !== 'pack') return;
  if (e.pointerType === 'mouse' || drag) setTilt(e);
  if (!drag) return;
  const dx = Math.abs(e.clientX - drag.x);
  if (dx > 8) drag.moved = true;
  const p = Math.min(1, dx / (drag.w * .7));
  if (p > drag.max) {
    if (Math.floor(p * 8) > Math.floor(drag.max * 8)) { sfx.zip(p); buzz(8); }
    drag.max = p;
    $('#pack').style.setProperty('--tear', p.toFixed(3));
  }
  if (drag.max >= 1) { drag = null; $('#pack').classList.remove('is-dragging'); tearPack(); }
}
function onPackUp() {
  if (!drag) return;
  const d = drag;
  drag = null;
  $('#pack').classList.remove('is-dragging');
  if (!d.moved || d.max >= .3) autoTear(d.max);
  else { $('#pack').style.setProperty('--tear', 0); resetTilt(); }
}
function autoTear(from = 0) {
  if (BO?.state !== 'pack') return;
  BO.state = 'autotear';
  const pack = $('#pack'), t0 = performance.now(), dur = 380 * (1 - from) + 80;
  let lastStep = -1;
  const step = t => {
    const k = Math.min(1, (t - t0) / dur), p = from + (1 - from) * k;
    pack.style.setProperty('--tear', p.toFixed(3));
    const s = Math.floor(p * 8);
    if (s !== lastStep) { lastStep = s; sfx.zip(p); }
    if (k < 1) requestAnimationFrame(step); else { BO.state = 'pack'; tearPack(); }
  };
  requestAnimationFrame(step);
}
function tearPack() {
  if (BO?.state !== 'pack') return;
  BO.state = 'tearing';
  commitBooster(BO.cards, BO.kind);
  const bo = $('#booster'), pack = $('#pack');
  sfx.tear();
  buzz([20, 30, 60]);
  pack.classList.add('is-torn');
  resetTilt();
  bo.style.setProperty('--glow', R_GLOW[BO.best]);
  $('#bo-hint').textContent = '';
  burst(RANK[BO.best] >= 2 ? 30 : 16, R_COLOR[BO.best], '44%');
  setTimeout(() => { pack.classList.add('is-out'); sfx.whoosh(); dealCards(); }, 700);
}

function cardHTML(c, i) {
  if (c.acc) {
    const a = c.acc;
    return `<div class="vc vc-acc r-${c.rarity}" data-i="${i}" role="button" tabindex="-1" aria-label="Carte ${i + 1} sur 3">
    <div class="vc-flip">
      <div class="vc-back"><span class="vc-back-logo">pompelup</span><span class="vc-back-q">?</span><span class="vc-back-tap">Tape pour révéler</span></div>
      <div class="vc-front"><div class="vc-sleeve vc-acc-box">${charHTML(mySkin(), { mood: 'wow', accs: myAccs(a) })}</div></div>
    </div>
    <div class="vc-info">
      <span class="rar-pill r-${c.rarity}">${R_NAME[c.rarity]} · Accessoire</span>
      <div class="vc-title">${esc(a.name)}</div>
      <div class="vc-artist">${window.PompeChar.SLOTS[a.slot]} · se porte avec tous tes skins</div>
      ${c.isNew ? '<span class="vc-tag is-new">Nouveau !</span>' : `<span class="vc-tag is-dup">Doublon · +${c.dupCoins} <i class="coin"></i></span>`}
    </div>
  </div>`;
  }
  const s = c.song;
  return `<div class="vc r-${c.rarity}" data-i="${i}" style="--sc:${s.color || '#6D28D9'}" role="button" tabindex="-1" aria-label="Vinyle ${i + 1} sur 3">
    <div class="vc-flip">
      <div class="vc-back"><span class="vc-back-logo">pompelup</span><span class="vc-back-q">?</span><span class="vc-back-tap">Tape pour révéler</span></div>
      <div class="vc-front">
        <div class="vc-disc"><div class="vc-disc-spin"><div class="vc-label">${c.art ? `<img src="${esc(c.art)}" alt="">` : ''}</div></div></div>
        <div class="vc-sleeve">${coverHTML(s, c.art)}</div>
      </div>
    </div>
    <div class="vc-info">
      <span class="rar-pill r-${c.rarity}">${R_NAME[c.rarity]}</span>
      <div class="vc-title">${esc(s.title)}</div>
      <div class="vc-artist">${esc(s.artist)} · ${s.year}</div>
      ${c.isNew ? '<span class="vc-tag is-new">Nouveau !</span>' : `<span class="vc-tag is-dup">Doublon · +${c.dupCoins} <i class="coin"></i></span>`}
    </div>
  </div>`;
}
function stackPositions() {
  $$('#vstack .vc').forEach((el, i) => {
    const pos = i - BO.idx;
    if (pos < 0) { el.classList.remove('is-current'); el.setAttribute('tabindex', '-1'); return; }
    el.dataset.pos = pos;
    el.classList.toggle('is-current', pos === 0);
    el.setAttribute('tabindex', pos === 0 ? '0' : '-1');
    el.style.zIndex = String(10 - pos);
  });
}
function dealCards() {
  const stack = $('#vstack');
  stack.innerHTML = BO.cards.map(cardHTML).join('');
  const els = $$('.vc', stack);
  els.forEach(el => el.classList.add('is-entering'));
  void stack.offsetWidth;
  stackPositions();
  els.slice().reverse().forEach((el, i) => setTimeout(() => el.classList.remove('is-entering'), 60 + i * 110));
  setTimeout(() => {
    if (!BO) return;
    BO.state = 'cards';
    $('#pack').hidden = true;
    $('#bo-hint').textContent = 'Tape sur le vinyle pour le révéler';
    kbFocus($('.vc.is-current', stack));
  }, 520);
}
function refreshCardArt(el, c) {
  if (!c.art) return;
  fillCover(el.querySelector('.vc-sleeve'), c.art);
  const label = el.querySelector('.vc-label');
  if (label && !label.querySelector('img')) label.innerHTML = `<img src="${esc(c.art)}" alt="">`;
}
function revealCard() {
  if (BO?.state !== 'cards') return;
  const c = BO.cards[BO.idx], el = $$('#vstack .vc')[BO.idx];
  BO.state = 'revealing';
  $('#bo-hint').textContent = '';
  refreshCardArt(el, c);
  const charge = REDUCED ? 0 : c.rarity === 'legendary' ? 1150 : c.rarity === 'epic' ? 620 : 0;
  if (charge) {
    el.classList.add('is-charging');
    $('#booster').style.setProperty('--glow', R_GLOW[c.rarity]);
    sfx.charge(charge);
    buzz(c.rarity === 'legendary' ? [40, 60, 40, 60, 40, 60, 120] : [30, 50, 30]);
  }
  setTimeout(() => {
    if (!BO) return;
    el.classList.remove('is-charging');
    el.classList.add('is-flipped');
    sfx.whoosh();
    setTimeout(() => { if (BO) rarityImpact(c.rarity); }, 280);
    setTimeout(() => {
      if (!BO) return;
      el.classList.add('is-open');
      BO.state = 'revealed';
      $('#bo-hint').textContent = BO.idx < BO.cards.length - 1 ? 'Tape pour le vinyle suivant' : 'Tape pour voir ton butin';
    }, 700);
  }, charge);
}
function rarityImpact(r) {
  const bo = $('#booster');
  bo.style.setProperty('--glow', R_GLOW[r]);
  bo.style.setProperty('--ray', R_RAY[r]);
  bo.classList.toggle('is-hot', RANK[r] >= 2);
  sfx.reveal(r);
  burst([14, 26, 42, 70][RANK[r]], R_COLOR[r], '40%', RANK[r] >= 2);
  if (r === 'legendary') {
    bo.classList.remove('is-flash', 'is-shake'); void bo.offsetWidth;
    bo.classList.add('is-flash', 'is-shake');
    setTimeout(() => bo.classList.remove('is-flash', 'is-shake'), 750);
    buzz([80, 40, 160]);
    confetti(70, ['#FFC800', '#FFE066', '#FF9600', '#FFFFFF']);
  } else if (r === 'epic') {
    bo.classList.remove('is-shake'); void bo.offsetWidth;
    bo.classList.add('is-shake');
    setTimeout(() => bo.classList.remove('is-shake'), 600);
    buzz([50, 30, 80]);
  } else buzz(25);
}
function burst(n, color, top = '44%', stars = false) {
  if (REDUCED) return;
  const fx = $('#bo-fx');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'), a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 190;
    const star = stars && i % 3 === 0;
    s.className = `spark${star ? ' is-star' : ''}`;
    if (star) s.innerHTML = ico('sparkle');
    s.style.top = top;
    s.style.setProperty('--c', i % 4 === 0 ? '#fff' : color);
    s.style.setProperty('--s', `${4 + Math.random() * 8}px`);
    s.style.setProperty('--dx', `${Math.cos(a) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * dist}px`);
    s.style.setProperty('--rot', `${Math.random() * 360}deg`);
    s.style.setProperty('--d', `${.7 + Math.random() * .6}s`);
    fx.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
}
function nextCard() {
  if (BO?.state !== 'revealed') return;
  const el = $$('#vstack .vc')[BO.idx];
  el.classList.add('is-gone');
  sfx.whoosh();
  BO.idx++;
  const bo = $('#booster');
  bo.style.setProperty('--glow', 'rgba(206,130,255,.28)');
  bo.style.setProperty('--ray', 'rgba(255,255,255,.05)');
  bo.classList.remove('is-hot');
  if (BO.idx >= BO.cards.length) { BO.state = 'summary'; setTimeout(showSummary, 380); return; }
  stackPositions();
  BO.state = 'cards';
  $('#bo-hint').textContent = 'Tape sur le vinyle pour le révéler';
  kbFocus($$('#vstack .vc')[BO.idx]);
}
function showSummary() {
  if (!BO) return;
  const cards = BO.cards, best = BO.best, fresh = cards.filter(c => c.isNew).length;
  $('#bo-stage').hidden = true;
  $('#bo-hint').hidden = true;
  $('#bo-sum-title').textContent = best === 'legendary' ? 'Légendaire !' : fresh === 3 ? '3 nouveaux vinyles !' : fresh ? `${plural(fresh, 'nouveau vinyle', 'nouveaux vinyles')} !` : 'Que des doublons… +jetons !';
  $('#bo-sum-grid').innerHTML = cards.map(c => `
    <div class="bs r-${c.rarity}">
      <span class="bs-cover${c.acc ? ' bs-acc' : ''}">${c.acc ? charHTML(mySkin(), { accs: myAccs(c.acc) }) : coverHTML(c.song, c.art)}</span>
      <span class="rar-pill r-${c.rarity}">${R_NAME[c.rarity]}</span>
      <b>${esc(c.acc ? c.acc.name : c.song.title)}</b>
    </div>`).join('');
  const n = totalBoosters();
  $('#bo-next').textContent = n ? `Ouvrir le suivant (${n})` : 'Continuer';
  $('#bo-summary').hidden = false;
  $('#bo-left').textContent = '';
  const dup = cards.reduce((a, c) => a + (c.dupCoins || 0), 0);
  if (dup) toast(`Doublons convertis : +${fmt(dup)} jetons`);
  kbFocus($('#bo-next'));
}

/* ================= COLLECTION ================= */
const COLL = { filter: 'all', shown: 60 };
let tileObserver = null;
function renderCollection() {
  const ids = ownedIds();
  const total = SONGS.length;
  $('#coll-n').textContent = ids.length;
  $('#coll-of').textContent = `/ ${total} vinyles`;
  $('#coll-pct').textContent = `${(ids.length / total * 100).toFixed(1).replace('.', ',')} %`;
  $('#coll-fill').style.width = `${Math.max(ids.length ? 1.5 : 0, ids.length / total * 100)}%`;
  const nb = totalBoosters(), ob = $('#coll-open');
  $('#coll-boosters').textContent = nb;
  ob.classList.toggle('has-boosters', nb > 0);
  ob.classList.toggle('is-empty', !nb);

  const counts = Object.fromEntries(RARITIES.map(r => [r, 0]));
  ids.forEach(id => counts[RARITY.get(id)]++);
  $('#rar-filter').innerHTML = [['all', 'Tous', ids.length, total], ...RARITIES.slice().reverse().map(r => [r, R_NAMES[r], counts[r], BY_RARITY[r].length])]
    .map(([k, label, have, of]) => `<button class="rf ${k === 'all' ? '' : `r-${k}`}" type="button" role="radio" data-r="${k}" aria-checked="${COLL.filter === k}">${k === 'all' ? '' : '<i></i>'}${label} <small>${have}/${of}</small></button>`).join('');

  const list = ids.filter(id => COLL.filter === 'all' || RARITY.get(id) === COLL.filter)
    .sort((a, b) => (RANK[RARITY.get(b)] - RANK[RARITY.get(a)]) || (store.coll[b].t - store.coll[a].t));
  $('#coll-empty').hidden = ids.length > 0;
  $('#coll-empty-play').textContent = totalBoosters() ? 'Ouvrir mon booster' : 'Jouer une partie';
  const grid = $('#coll-grid');
  const shown = list.slice(0, COLL.shown);
  const frameHTML = (id, i) => {
    const s = SONG.get(id), r = RARITY.get(id), e = store.coll[id];
    return `<button class="frame vt r-${r}" type="button" data-id="${id}" style="animation-delay:${Math.min(i, 18) * .025}s" aria-label="${esc(s.title)} — ${esc(s.artist)}, ${R_NAME[r].toLowerCase()}">
      <span class="frame-in"><span class="frame-disc"></span><span class="frame-cover">${coverHTML(s)}</span></span>
      ${e.seen === false ? '<span class="vt-new">NEW</span>' : e.n > 1 ? `<span class="vt-n">×${e.n}</span>` : ''}
    </button>`;
  };
  const emptyFrame = '<span class="frame frame-empty" aria-hidden="true"><span class="frame-in"><span class="frame-q">?</span></span></span>';
  // Les 6 plus belles pièces au-dessus du canapé, le reste sur les étagères
  const top = shown.slice(0, 6), rest = shown.slice(6);
  $('#coll-top').innerHTML = top.map(frameHTML).join('') + emptyFrame.repeat(Math.max(0, 6 - top.length));
  $('#living-img').innerHTML = `<span class="cs">
      <span class="cs-lamp"><i></i></span>
      <span class="couch">
        <i class="c-back"></i><i class="c-pillow c-pl"></i><i class="c-pillow c-pr"></i>
        <span class="c-char">${meHTML({ lying: true, mood: 'grin' })}</span>
        <i class="c-seat"></i><i class="c-arm c-al"></i><i class="c-arm c-ar"></i><i class="c-foot c-fl"></i><i class="c-foot c-fr"></i>
      </span>
      <span class="cs-table"><i class="cs-player"></i></span>
      <span class="cs-plant"><i></i><i></i><i></i></span>
    </span>`;
  const restSlots = rest.length ? Math.ceil(rest.length / 4) * 4 : 0;
  grid.innerHTML = rest.map((id, i) => frameHTML(id, i + 6)).join('') + emptyFrame.repeat(Math.max(0, restSlots - rest.length));
  $('#shelf-title').hidden = !rest.length;
  grid.hidden = !rest.length;
  $('#coll-more')?.remove();
  if (list.length > shown.length) grid.insertAdjacentHTML('afterend', `<button class="btn-secondary coll-more" id="coll-more" type="button">Voir plus de vinyles (${list.length - shown.length})</button>`);

  tileObserver?.disconnect();
  tileObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      tileObserver.unobserve(en.target);
      const s = SONG.get(en.target.dataset.id);
      if (s && !knownArt(s.id)) queueArt(s, a => fillCover(en.target, a));
    });
  }, { rootMargin: '200px' }) : null;
  $$('#screen-collection .vt').forEach(t => tileObserver?.observe(t));

  let changed = false;
  ids.forEach(id => { if (store.coll[id].seen === false) { store.coll[id].seen = true; changed = true; } });
  if (changed) save();
}

const CHAR_LINES = [
  n => n ? `${plural(n, 'vinyle', 'vinyles')} au mur, pas mal !` : 'Mon mur est tout vide…',
  () => `Encore ${fmt(SONGS.length - ownedIds().length)} vinyles à trouver !`,
  () => totalBoosters() ? `Tu as ${plural(totalBoosters(), 'booster', 'boosters')} à ouvrir !` : 'On se fait une partie ?',
  () => `J’adore ${pickOne(ownedIds().map(id => SONG.get(id).artist).concat(['le disco', 'le vinyle']))} !`,
];
let chatIdx = 0, chatTimer;
function charChat() {
  const b = $('#nook-bubble'), c = $('#living-img');
  b.textContent = CHAR_LINES[chatIdx++ % CHAR_LINES.length](ownedIds().length);
  b.hidden = false;
  c.classList.remove('is-wave'); void c.offsetWidth; c.classList.add('is-wave');
  sfx.pop();
  clearTimeout(chatTimer);
  chatTimer = setTimeout(() => { b.hidden = true; }, 2600);
}

let vsSong = null;
function openVinyl(id) {
  const s = SONG.get(id), e = store.coll[id];
  if (!s || !e) return;
  vsSong = s;
  const r = RARITY.get(id), art = knownArt(id);
  const vis = $('#vs-visual');
  vis.className = `vs-visual r-${r}`;
  vis.innerHTML = `<div class="vs-disc"><div class="vs-label">${art ? `<img src="${esc(art)}" alt="">` : ''}</div></div><div class="vs-sleeve">${coverHTML(s, art)}</div>`;
  const pill = $('#vs-rarity');
  pill.className = `rar-pill r-${r}`;
  pill.textContent = R_NAME[r];
  $('#vs-title').textContent = s.title;
  $('#vs-meta').textContent = `${s.artist} · ${s.year} · ${s.genre}`;
  $('#vs-own').textContent = `${plural(e.n, 'exemplaire', 'exemplaires')} · obtenu le ${new Date(e.t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
  $('#vs-play').textContent = 'Écouter';
  $('#vinyl-sheet').hidden = false;
  if (!art) getArt(s).then(a => { if (a && vsSong === s) { fillCover(vis, a); $('.vs-label', vis).innerHTML = `<img src="${esc(a)}" alt="">`; } });
  kbFocus($('#vs-close'));
}
function closeVinyl() {
  try { listen.pause(); } catch (e) {}
  vsSong = null;
  $('#vinyl-sheet').hidden = true;
}
async function toggleListen() {
  const btn = $('#vs-play'), vis = $('#vs-visual');
  if (!listen.paused) { listen.pause(); btn.textContent = 'Écouter'; vis.classList.remove('is-playing'); return; }
  const s = vsSong;
  btn.textContent = 'Chargement…';
  const pv = await fetchPreview(s);
  if (vsSong !== s) return;
  if (!pv) { btn.textContent = 'Écouter'; toast('Extrait indisponible pour ce vinyle'); return; }
  listen.src = pv.url;
  listen.currentTime = 0;
  listen.play().then(() => { btn.textContent = 'Pause'; vis.classList.add('is-playing'); }, () => { btn.textContent = 'Écouter'; toast('Lecture impossible'); });
}
listen.addEventListener('ended', () => { $('#vs-play').textContent = 'Écouter'; $('#vs-visual').classList.remove('is-playing'); });

/* ================= BOUTIQUE ================= */
let shopTicker = null;
function packArt(id) {
  return `<span class="row-art">${ico(id === 'gold' ? 'booster-gold' : 'booster')}</span>`;
}
function itemCardHTML(kind, it, deal) {
  const owned = isOwned(kind, it.id), eq = isEquipped(kind, it.id), locked = !owned && !it.price;
  const isDeal = !owned && deal && deal.kind === kind && deal.it.id === it.id;
  const price = isDeal ? deal.price : it.price;
  const state = eq ? '<span class="item-state">Équipé</span>' : owned ? '<span class="item-state">Possédé</span>' : locked ? `<span class="item-state">${ico('g-lock')}${it.unlock === 'pass' ? 'Pass Or' : 'Succès'}</span>` : `<span class="item-price"><i class="coin"></i>${fmt(price)}</span>`;
  const cls = `item r-${it.rarity}${kind === 'skin' ? ' skin-item' : ''}${eq ? ' is-equipped' : ''}${owned ? ' is-owned' : ''}${locked ? ' is-locked' : ''}${isDeal ? ' is-deal' : ''}`;
  const label = `${itemName(kind, it)}, ${R_NAME[it.rarity].toLowerCase()}`;
  return `<button class="${cls}" type="button" data-kind="${kind}" data-id="${it.id}" aria-label="${esc(label)}"><span class="rar-dot"></span>${itemPreviewHTML(kind, it)}<span class="item-name">${esc(it.name)}</span><span class="item-foot">${state}</span></button>`;
}
function renderShopTimers() {
  const t = hms(msToMidnight());
  if (store.gift === dayKey()) $('#gift-sub').textContent = `Prochain cadeau dans ${t}`;
  $('#deal-timer').textContent = `Encore ${t}`;
}
function renderShop() {
  renderCoins();
  const claimed = store.gift === dayKey();
  $('#gift-card').classList.toggle('is-claimed', claimed);
  $('#gift-title').textContent = claimed ? 'Coffre récupéré' : 'Coffre du jour';
  $('#gift-sub').textContent = '50 jetons offerts chaque jour';
  $('#gift-cta').textContent = claimed ? 'Pris' : 'Ouvrir';
  $('#gift-card .gift-ico use').setAttribute('href', claimed ? '#i-chest-open' : '#i-chest');
  const d = dealOfTheDay(), dc = $('#deal-card');
  dc.hidden = !d;
  if (d) {
    dc.dataset.kind = d.kind;
    dc.dataset.id = d.it.id;
    $('#deal-preview').innerHTML = itemPreviewHTML(d.kind, d.it);
    $('#deal-name').textContent = itemName(d.kind, d.it);
    $('#deal-old').textContent = fmt(d.it.price);
    $('#deal-new').textContent = fmt(d.price);
  }
  renderShopTimers();
  $('#shop-packs').innerHTML = PACKS.map(p => `
    <button class="row pk" type="button" data-pack="${p.id}">${p.tag ? `<span class="row-tag">${p.tag}</span>` : ''}
      ${packArt(p.id)}<span class="row-txt"><b>${p.name}</b><small>${p.desc}</small></span>
      <span class="price-btn"><i class="coin"></i>${fmt(p.price)}</span>
    </button>`).join('');
  for (const kind of KINDS) $(`#shop-${kind}`).innerHTML = COSMETICS[kind].map(it => itemCardHTML(kind, it, d)).join('');
  clearInterval(shopTicker);
  shopTicker = setInterval(() => { if (currentScreen() === 'shop') renderShopTimers(); else clearInterval(shopTicker); }, 1000);
}
function claimGift() {
  if (store.gift === dayKey()) { toast(`Prochain coffre dans ${hms(msToMidnight())}`); return; }
  store.gift = dayKey();
  grantReward({ coins: 50 });
  sfx.booster(); buzz([30, 40, 30]);
  showReward({ kicker: 'Coffre du jour', title: 'Merci d’être là !', reward: { coins: 50 } });
  renderShop();
  renderBadges();
}

/* Fiche article (skins, boosters) */
let IS = null;
function openItem(kind, id) {
  const it = itemOf(kind, id);
  if (!it) return;
  const deal = dealOfTheDay();
  const price = deal && deal.kind === kind && deal.it.id === id ? deal.price : it.price;
  IS = { kind, id, price };
  $('#is-preview').innerHTML = itemPreviewHTML(kind, it);
  const pill = $('#is-rarity');
  pill.className = `rar-pill r-${it.rarity}`;
  pill.textContent = `${R_NAME[it.rarity]} · ${kind === 'acc' ? `Accessoire ${window.PompeChar.SLOTS[it.slot].toLowerCase()}` : KIND_NAME[kind]}`;
  $('#is-name').textContent = it.name;
  $('#is-desc').textContent = it.desc || (kind === 'acc' ? `Se porte avec tous les skins. Un seul accessoire par emplacement (${window.PompeChar.SLOTS[it.slot].toLowerCase()}).` : '');
  const lock = !isOwned(kind, id) && !it.price ? unlockInfo(kind, id) : null;
  $('#is-lock').hidden = !lock;
  if (lock) {
    $('#is-lock-txt').textContent = `Succès « ${lock.ach.name} » : ${lock.text} (${fmt(lock.v)}/${fmt(lock.n)})`;
    $('#is-lock-fill').style.width = `${lock.v / lock.n * 100}%`;
  }
  renderItemAction();
  $('#item-sheet').hidden = false;
  kbFocus($('#is-action'));
}
function renderItemAction() {
  const { kind, id, price } = IS, btn = $('#is-action'), it = itemOf(kind, id);
  btn.disabled = false;
  if (kind === 'acc' && isEquipped(kind, id)) btn.textContent = 'Retirer';
  else if (isEquipped(kind, id)) { btn.textContent = 'Équipé'; btn.disabled = true; }
  else if (isOwned(kind, id)) btn.textContent = 'Équiper';
  else if (!it.price) btn.textContent = it.unlock === 'pass' ? 'Voir le Pass' : 'Voir mes succès';
  else if (store.coins < price) { btn.textContent = `Il te manque ${fmt(price - store.coins)} jetons`; btn.disabled = true; }
  else btn.innerHTML = `Acheter · <i class="coin"></i>${fmt(price)}`;
}
function itemAction() {
  const { kind, id, price } = IS, it = itemOf(kind, id);
  if (kind === 'acc' && isEquipped(kind, id)) {
    store.equip.acc[it.slot] = null;
    save(); applySkins(); sfx.tap();
    toast(`${it.name} retiré`);
  } else if (isOwned(kind, id)) {
    equipItem(kind, id);
    sfx.tap(); buzz(20);
    toast(`${it.name} équipé`);
  } else if (!it.price) {
    closeItem();
    if (it.unlock === 'pass') { show('pass'); return; }
    PF_TAB = 'ach';
    show('profile');
    return;
  } else {
    if (!spendCoins(price)) { toast('Pas assez de jetons'); return; }
    own(kind, id);
    equipItem(kind, id);
    sfx.reveal(it.rarity); buzz([30, 40, 60]);
    confetti(50);
    toast(`${it.name} acheté et équipé !`);
  }
  renderItemAction();
  refreshScreen();
}
function closeItem() { $('#item-sheet').hidden = true; IS = null; }
function openPack(id) {
  const p = PACKS.find(x => x.id === id);
  IS = { pack: p };
  $('#is-preview').innerHTML = packArt(p.id);
  const pill = $('#is-rarity');
  pill.className = `rar-pill r-${p.id === 'gold' ? 'legendary' : 'epic'}`;
  pill.textContent = p.id === 'gold' ? 'Premium' : 'Booster';
  $('#is-name').textContent = p.name;
  $('#is-desc').textContent = p.desc;
  $('#is-lock').hidden = true;
  const btn = $('#is-action');
  btn.disabled = store.coins < p.price;
  if (btn.disabled) btn.textContent = `Il te manque ${fmt(p.price - store.coins)} jetons`;
  else btn.innerHTML = `Acheter · <i class="coin"></i>${fmt(p.price)}`;
  $('#item-sheet').hidden = false;
}
function buyPack() {
  const p = IS.pack;
  if (!spendCoins(p.price)) { toast('Pas assez de jetons'); return; }
  grantReward(p.give);
  sfx.booster(); buzz([30, 40, 30]);
  closeItem();
  renderBadges();
  openBooster();
}

/* ================= RÉCOMPENSES ================= */
const rewardQueue = [];
let RW = null;
function showReward(opts) {
  rewardQueue.push(opts);
  if (!RW) nextReward();
}
function nextReward() {
  RW = rewardQueue.shift() || null;
  const ov = $('#reward-overlay');
  if (!RW) { ov.hidden = true; return; }
  const r = RW.reward || {};
  let visual = `<span class="rw-coins"><i class="coin"></i>+${fmt(r.coins || 0)}</span>`, action = null;
  if (r.item) {
    const [k, id] = r.item.split(':');
    visual = itemPreviewHTML(k, itemOf(k, id));
    action = { label: 'Équiper', run: () => { equipItem(k, id); toast('Équipé !'); refreshScreen(); } };
  } else if (r.gold || r.boosters) {
    visual = packArt(r.gold ? 'gold' : 'std');
    action = { label: 'Ouvrir', run: () => openBooster() };
  }
  RW.action = action;
  $('#rw-kicker').textContent = RW.kicker || 'Récompense';
  $('#rw-visual').innerHTML = visual;
  $('#rw-title').textContent = RW.title || '';
  $('#rw-sub').textContent = [rewardParts(r).join(' · '), RW.extra].filter(Boolean).join(' ');
  $('#rw-later').hidden = !action;
  $('.rw-actions').classList.toggle('is-single', !action);
  $('#rw-ok').textContent = action ? action.label : 'Super !';
  ov.hidden = false;
  confetti(40, ['#FFC800', '#58CC02', '#1CB0F6', '#FF9600']);
  kbFocus($('#rw-ok'));
}
function closeReward(run) {
  const act = RW?.action;
  $('#reward-overlay').hidden = true;
  RW = null;
  if (run && act) act.run();
  if (rewardQueue.length) setTimeout(nextReward, 200);
  refreshScreen();
}
function refreshScreen() {
  const s = currentScreen();
  if (s === 'home') renderHome();
  if (s === 'shop') renderShop();
  if (s === 'profile') renderProfile();
  if (s === 'results') renderResBooster();
  if (s === 'boosters') renderBoosters();
  renderCoins();
  renderBadges();
}

/* ================= MISSIONS ================= */
const MISSION_ICON = { found: 'note', combo: 'flame', fast5: 'clock', typeFound: 'keyboard', game: 'headphones', score: 'xp', catGame: 'target', noHint: 'bulb', dailyWin: 'mystery', opened: 'booster' };
let misTicker = null;
function renderMissionsSheet() {
  const M = ensureMissions();
  $('#ms-sub').textContent = `Nouvelles missions dans ${hms(msToMidnight())}`;
  $('#ms-list').innerHTML = M.list.map((m, i) => {
    const done = m.p >= m.target, pct = Math.round(m.p / m.target * 100);
    return `<div class="ms-item${m.claimed ? ' is-claimed' : done ? ' is-done' : ''}">
      ${ico(MISSION_ICON[m.ev] || 'xp', 'ms-ico')}
      <div><b>${esc(m.text)}</b><span class="ms-bar"><span class="bar"><span style="width:${pct}%"></span></span><small>${m.max ? fmt(m.p) : m.p} / ${m.max ? fmt(m.target) : m.target}</small></span></div>
      ${m.claimed ? ico('chest-open', 'ms-chest') : done ? `<button class="btn btn-sm btn-green ms-claim" type="button" data-i="${i}"><i class="coin"></i>+${m.reward}</button>` : ico('chest', 'ms-chest')}
    </div>`;
  }).join('');
  const allClaimed = M.list.every(m => m.claimed), bonus = $('#ms-bonus');
  bonus.disabled = !allClaimed || M.bonus;
  bonus.classList.toggle('is-ready', allClaimed && !M.bonus);
  $('#ms-bonus-txt').textContent = M.bonus ? 'Bonus récupéré' : allClaimed ? 'Touche pour récupérer ton booster !' : `Récupère les 3 missions (${M.list.filter(m => m.claimed).length}/3)`;
}
function openMissions() {
  renderMissionsSheet();
  $('#missions-sheet').hidden = false;
  clearInterval(misTicker);
  misTicker = setInterval(() => { if ($('#missions-sheet').hidden) clearInterval(misTicker); else $('#ms-sub').textContent = `Nouvelles missions dans ${hms(msToMidnight())}`; }, 1000);
}

/* ================= PROFIL ================= */
let PF_TAB = 'ach';
function renderProfile() {
  const L = levelOf(store.xp);
  applySkins();
  const nameInput = $('#pf-name');
  if (document.activeElement !== nameInput) nameInput.value = store.name;
  $('#pf-title').textContent = titleFor(L.lvl);
  $('#pf-level').textContent = L.lvl;
  $('#pf-level-fill').style.width = `${Math.round(L.pct * 100)}%`;
  $('#pf-level-txt').textContent = `${fmt(L.rest)} / ${fmt(L.need)} XP`;
  renderCoins();
  $('#pf-boosters').textContent = totalBoosters();
  $('#pf-vinyls').textContent = ownedIds().length;
  $('#pf-streak').textContent = currentStreak();
  $('#pf-xp').textContent = fmt(store.xp);
  $('#pf-best').textContent = fmt(store.best);
  $$('#pf-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.pt === PF_TAB)));
  for (const t of ['ach', 'skins', 'stats', 'settings']) $(`#pf-${t}`).hidden = t !== PF_TAB;
  if (PF_TAB === 'ach') renderAchPanel();
  if (PF_TAB === 'skins') renderSkinsPanel();
  if (PF_TAB === 'stats') renderStatsPanel();
  if (PF_TAB === 'settings') { $('#set-sound').checked = store.settings.sound; $('#set-haptics').checked = store.settings.haptics; }
}
function renderAchPanel() {
  const rows = ACHS.map(a => ({ a, st: achState(a) }))
    .sort((x, y) => (y.st.claimable - x.st.claimable) || (x.st.max - y.st.max));
  $('#pf-ach').innerHTML = rows.map(({ a, st }) => {
    const [n, r] = st.max ? a.tiers[a.tiers.length - 1] : a.tiers[st.claimed];
    const pct = Math.min(100, st.v / n * 100);
    const tier = st.max ? 'MAX' : `NIV. ${st.claimed + 1}`;
    const right = st.claimable ? `<button class="btn btn-sm btn-green ach-claim" type="button" data-ach="${a.id}">Prendre</button>`
      : st.max ? `<span class="ach-reward">${ico('g-check')}</span>` : `<span class="ach-reward">${rewardInline(r)}</span>`;
    const [c, lip] = ACH_COLORS[a.color] || ACH_COLORS.blue;
    return `<div class="ach${st.claimable ? ' is-claimable' : ''}${st.max ? ' is-max' : ''}">
      <span class="ach-badge" style="--ab:${c};--ab-lip:${lip}" aria-hidden="true">${ico(a.icon)}<em>${tier}</em></span>
      <div class="ach-body"><b>${esc(a.name)}</b><small>${esc(a.label(n))}</small>
        <span class="ach-prog-row"><span class="bar bar-sm bar-gold"><span style="width:${pct}%"></span></span><small class="ach-prog">${fmt(Math.min(st.v, n))} / ${fmt(n)}</small></span></div>
      ${right}
    </div>`;
  }).join('');
}
function renderSkinsPanel() {
  const order = (kind, it) => (isEquipped(kind, it.id) ? 0 : isOwned(kind, it.id) ? 1 : 2);
  $('#pf-skins').innerHTML = KINDS.map(kind => {
    const items = COSMETICS[kind].slice().sort((x, y) => order(kind, x) - order(kind, y));
    const have = items.filter(it => isOwned(kind, it.id)).length;
    return `<h3 id="pf-sec-${kind}">${KIND_NAMES[kind]} · ${have}/${items.length}</h3>
      <div class="item-grid">${items.map(it => itemCardHTML(kind, it, null)).join('')}</div>`;
  }).join('');
}
function renderStatsPanel() {
  const legend = ownedIds().filter(id => RARITY.get(id) === 'legendary').length;
  const S = [
    ['Record', fmt(store.best)], ['Parties', fmt(store.games)],
    ['Réussite', store.played ? `${Math.round(store.found / store.played * 100)} %` : '–'], ['Chansons trouvées', fmt(store.found)],
    ['Combo max', `×${store.stats.bestCombo}`], ['Réponses éclair', fmt(store.stats.fast)],
    ['Parties sans faute', fmt(store.stats.perfect)], ['Défis réussis', fmt(store.stats.dailyWins)],
    ['Meilleure série', plural(store.stats.bestStreak, 'jour', 'jours')], ['Vinyles', `${ownedIds().length}/${SONGS.length}`],
    ['Légendaires', `${legend}/${BY_RARITY.legendary.length}`], ['Boosters ouverts', fmt(store.opened)],
  ];
  $('#pf-stats').innerHTML = `<div class="stat-grid">${S.map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join('')}</div>`;
}

/* ================= BIENVENUE ================= */
let wlAvatar = null;
function maybeWelcome() {
  if (store.onboarded) return;
  wlAvatar = store.equip.skin;
  $('#wl-avatars').innerHTML = COSMETICS.skin.filter(a => !a.price && !a.unlock).map(a => `<button class="wl-av" type="button" role="radio" data-av="${a.id}" aria-checked="${a.id === wlAvatar}" aria-label="${esc(a.name)}">${charHTML(a)}<b>${esc(a.name)}</b></button>`).join('');
  $('#wl-name').value = store.name || window.PompeAuth?.displayName() || '';
  $('#wl-host').innerHTML = charHTML(HOST, { head: true, mood: 'happy' });
  $('#welcome-sheet').hidden = false;
}
function finishWelcome(keep) {
  if (keep) {
    const name = $('#wl-name').value.trim().slice(0, 16);
    if (name) store.name = name;
    if (wlAvatar) store.equip.skin = wlAvatar;
  }
  store.onboarded = true;
  save();
  $('#welcome-sheet').hidden = true;
  applySkins();
  renderHome();
  if (totalBoosters()) toast(keep && store.name ? `Salut ${store.name} ! Ouvre ton booster de bienvenue` : 'Ouvre ton booster de bienvenue');
}

/* ================= MODE HISTOIRE : le parcours ================= */
const ARTISTS = window.STORY_ARTISTS || [];
const CHAPTERS = (window.STORY_CHAPTERS || []).map((c, i) => Object.assign(c, { minLevel: i + 1 }));
const artistById = id => ARTISTS.find(a => a.id === id);
const artistLook = a => Object.assign({ id: 'artist-' + a.id, name: a.name }, (window.STORY_LOOKS || {})[a.id] || { kind: 'human', top: a.color });
// L'intro (bio) est la première étape de chaque parcours ; un coffre clôt chaque artiste.
const stepsOf = a => [{ type: 'intro' }, ...a.steps];
const storySt = a => store.story[a.id] || (store.story[a.id] = { step: 0 });
const storyDone = () => ARTISTS.filter(a => store.story[a.id]?.done).length;
const UNIT_COLORS = [['#58CC02', '#58A700'], ['#CE82FF', '#A568CC'], ['#00CD9C', '#00A47D'], ['#1CB0F6', '#1899D6'], ['#FF9600', '#CD7900'], ['#FF4B4B', '#EA2B2B'], ['#2B70C9', '#1453A3'], ['#FF86D0', '#E05FAF']];
const NODE_X = [0, -46, -72, -46, 0, 46, 72, 46];
const STEP_ICON = { intro: 'g-star', listen: 'g-headphones', fact: 'g-book', mcq: 'g-trophy' };
// Ordre du parcours : chapitres puis artistes ; un artiste s'ouvre quand le précédent est terminé.
const pathOrder = () => CHAPTERS.flatMap(c => c.artists.map(id => ({ a: artistById(id), c })).filter(x => x.a));
function artistAccess() {
  const lvl = levelOf(store.xp).lvl, out = new Map();
  let prevDone = true;
  for (const { a, c } of pathOrder()) {
    const st = store.story[a.id] || {}, levelOk = lvl >= c.minLevel;
    out.set(a.id, levelOk && (st.done || (st.step || 0) > 0 || prevDone));
    prevDone = !!st.done;
  }
  return out;
}
const chestReady = () => ARTISTS.some(a => { const st = store.story[a.id]; return st && !st.done && st.step >= stepsOf(a).length; });
function stepLabel(a, step) {
  if (step.type === 'intro') return `Rencontre ${a.name}`;
  if (step.type === 'listen') return `Écoute : ${SONG.get(step.songId)?.title || 'un tube'}`;
  if (step.type === 'fact') return 'Le savais-tu ?';
  return 'Question finale';
}
function renderStoryCard() {
  const art = $('#story-card-art');
  art.innerHTML = ARTISTS.slice(0, 3).map(a => `<span style="background:${a.color}">${charHTML(artistLook(a), { head: true })}</span>`).join('');
  const d = storyDone();
  $('#story-card-sub').textContent = chestReady() ? 'Un coffre t’attend !' : d ? `${d}/${ARTISTS.length} artistes découverts` : `${ARTISTS.length} artistes · écoute, anecdotes, quiz`;
}
let POP = null;
function renderStory() {
  const lvl = levelOf(store.xp).lvl, access = artistAccess();
  $('#story-prog').textContent = `${storyDone()}/${ARTISTS.length}`;
  renderCoins();
  let unitIdx = 0, current = null;
  $('#story-list').innerHTML = CHAPTERS.map(c => {
    const locked = lvl < c.minLevel;
    const units = c.artists.map(id => {
      const a = artistById(id); if (!a) return '';
      const u = unitIdx++, [col, lip] = UNIT_COLORS[u % UNIT_COLORS.length];
      const st = store.story[a.id] || {}, steps = stepsOf(a), N = steps.length, done = st.done ? N : Math.min(N, st.step || 0);
      const open = access.get(a.id);
      const nodes = steps.map((stp, k) => {
        const state = k < done ? 'is-done' : open && k === done ? 'is-current' : 'is-locked';
        if (state === 'is-current' && !current) current = `${a.id}:${k}`;
        const isCur = state === 'is-current' && current === `${a.id}:${k}`;
        return `<div class="node-row" style="--x:${NODE_X[k % NODE_X.length] * (u % 2 ? -1 : 1)}px">
          ${isCur ? `<span class="node-ring" style="--p:${(done / N).toFixed(3)}"></span><span class="node-start">${done ? 'Continuer' : 'Commencer'}</span>` : ''}
          <button class="node ${state}" type="button" data-artist="${a.id}" data-k="${k}" aria-label="${esc(stepLabel(a, stp))}">${ico(state === 'is-locked' ? 'g-lock' : state === 'is-done' ? 'g-check' : STEP_ICON[stp.type])}</button>
        </div>`;
      }).join('');
      const chestState = st.done ? 'is-open' : open && done >= N ? 'is-ready' : 'is-locked';
      if (chestState === 'is-ready' && !current) current = `${a.id}:${N}`;
      const chest = `<div class="node-row" style="--x:${NODE_X[N % NODE_X.length] * (u % 2 ? -1 : 1)}px">
          <button class="node node-chest ${chestState}" type="button" data-artist="${a.id}" data-k="${N}" aria-label="Coffre de ${esc(a.name)}">${ico(st.done ? 'chest-open' : 'chest')}</button>
        </div>`;
      const side = u % 2 ? -1 : 1;
      return `<section class="unit${open ? '' : ' is-locked'}" style="--u:${open ? col : '#E5E5E5'};--u-lip:${open ? lip : '#B7B7B7'}" data-unit="${a.id}">
        <header class="unit-banner">
          <div><small>Chapitre ${c.num} · ${esc(a.genre)}</small><b>${esc(a.name)}</b><span class="unit-meta">${esc(a.origin)} · ${esc(a.active)}</span></div>
          <span class="unit-av">${charHTML(artistLook(a), { head: true })}</span>
        </header>
        <div class="path">
          ${nodes}${chest}
          <span class="path-mascot" style="top:${2 * 86 + 56}px;left:calc(50% + ${side * 96}px - 59px)">${charHTML(artistLook(a), { mood: st.done ? 'grin' : 'happy' })}</span>
        </div>
      </section>`;
    }).join('');
    return `<div class="chapter-sep${locked ? ' is-locked' : ''}">${locked ? ico('lock') : ''}<span>Chapitre ${c.num} · ${esc(c.title)}${locked ? ` · niveau ${c.minLevel}` : ''}</span></div>${units}`;
  }).join('');
  POP = null;
  $('#story-back').hidden = !current;
  STORY_CURRENT = current;
}
let STORY_CURRENT = null;
function scrollToCurrent(smooth) {
  if (!STORY_CURRENT) return;
  const [id, k] = STORY_CURRENT.split(':');
  const el = $(`#story-list .node[data-artist="${id}"][data-k="${k}"]`);
  el?.scrollIntoView({ behavior: smooth && !REDUCED ? 'smooth' : 'auto', block: 'center' });
}
function closePopover() { $('#story-list .popover')?.remove(); POP = null; }
function openPopover(node) {
  const id = node.dataset.artist, k = +node.dataset.k;
  if (POP && POP.id === id && POP.k === k) { closePopover(); return; }
  closePopover();
  const a = artistById(id), steps = stepsOf(a), N = steps.length, st = store.story[id] || {};
  const locked = node.classList.contains('is-locked'), isChest = k === N;
  let cls = '', title, sub, btn;
  if (isChest) {
    title = `Coffre de ${a.name}`;
    if (st.done) { cls = 'is-done'; sub = 'Déjà ouvert : ton vinyle est au mur.'; btn = '<button class="btn btn-white" type="button" disabled>Ouvert</button>'; }
    else if (locked) { cls = 'is-locked'; sub = `Termine le parcours de ${a.name} pour l’ouvrir.`; btn = '<button class="btn btn-outline" type="button" disabled>Verrouillé</button>'; }
    else { sub = 'Jetons, XP et un vinyle de l’artiste.'; btn = `<button class="btn btn-white pop-go" type="button" data-artist="${id}" data-k="${k}">Ouvrir</button>`; }
  } else {
    title = stepLabel(a, steps[k]);
    sub = `Étape ${k + 1} sur ${N}`;
    if (locked) { cls = 'is-locked'; sub += ' · termine les étapes précédentes'; btn = '<button class="btn btn-outline" type="button" disabled>Verrouillé</button>'; }
    else if (node.classList.contains('is-done')) { cls = 'is-done'; btn = `<button class="btn btn-white pop-go" type="button" data-artist="${id}" data-k="${k}">Revoir</button>`; }
    else btn = `<button class="btn btn-white pop-go" type="button" data-artist="${id}" data-k="${k}">Commencer +10 XP</button>`;
  }
  node.insertAdjacentHTML('afterend', `<div class="popover ${cls}" role="dialog"><b>${esc(title)}</b><small>${esc(sub)}</small>${btn}</div>`);
  POP = { id, k };
  sfx.tap();
}

let ST = null;
function openStep(id, k) {
  const a = artistById(id); if (!a) return;
  const steps = stepsOf(a);
  if (k >= steps.length) return openChest(a);
  closePopover();
  unlockAudio();
  ST = { a, i: k, answered: false, firstTry: true };
  $('#ss-portrait').innerHTML = `<span>${charHTML(artistLook(a), { mood: 'happy' })}</span>`;
  $('#story-step').hidden = false;
  renderStep();
}
function closeArtist() {
  try { listen.pause(); } catch (e) {}
  $('#story-step').hidden = true;
  ST = null;
  if (currentScreen() === 'story') renderStory();
  if (currentScreen() === 'home') renderHome();
}
function renderStep() {
  const { a } = ST, steps = stepsOf(a), step = steps[ST.i];
  try { listen.pause(); } catch (e) {}
  ST.answered = false;
  $('#ss-fill').style.width = `${ST.i / steps.length * 100}%`;
  $('#ss-count').textContent = `${ST.i + 1}/${steps.length}`;
  const body = $('#ss-body'), actions = $('#ss-actions');
  const nextBtn = (label = 'Continuer') => `<button class="btn btn-green ss-next" id="ss-next" type="button">${label}</button>`;
  $('#ss-portrait').hidden = step.type === 'fact';
  if (step.type === 'intro') {
    $('#ss-kicker').textContent = `${a.origin} · ${a.active}`;
    $('#ss-title').textContent = a.name;
    body.innerHTML = `<p>${esc(a.bio)}</p>`;
    actions.innerHTML = nextBtn('C’est parti !');
  } else if (step.type === 'listen') {
    const s = SONG.get(step.songId);
    $('#ss-kicker').textContent = 'Écoute';
    $('#ss-title').textContent = s.title;
    body.innerHTML = `<div class="ss-listen"><span class="ss-sleeve">${coverHTML(s)}</span><span class="ss-disc" id="ss-disc"></span></div><p>${esc(step.label)} · ${s.year}</p>`;
    getArt(s).then(art => { if (art && ST) fillCover(body, art); });
    actions.innerHTML = `<button class="btn btn-blue" id="ss-play" type="button">${ico('g-play')}<span>Écouter</span></button>${nextBtn()}`;
  } else if (step.type === 'fact') {
    $('#ss-kicker').textContent = 'Le savais-tu ?';
    $('#ss-title').innerHTML = ico('bulb');
    body.innerHTML = `<p class="ss-fact">${esc(step.text)}</p>`;
    actions.innerHTML = nextBtn();
  } else if (step.type === 'mcq') {
    $('#ss-kicker').textContent = 'Question finale';
    $('#ss-title').textContent = step.question;
    body.innerHTML = `<div class="ss-opts">${step.opts.map((o, k) => `<button class="choice ss-opt" type="button" data-k="${k}"><span class="choice-key">${k + 1}</span><span class="choice-txt"><span class="choice-title">${esc(o)}</span></span></button>`).join('')}</div>`;
    actions.innerHTML = '';
  }
}
function setListenBtn(playing) {
  const b = $('#ss-play'); if (!b) return;
  b.innerHTML = `${ico(playing ? 'g-pause' : 'g-play')}<span>${playing ? 'Pause' : 'Écouter'}</span>`;
}
async function storyListen() {
  const step = stepsOf(ST.a)[ST.i], s = SONG.get(step.songId), btn = $('#ss-play');
  if (!listen.paused) { listen.pause(); setListenBtn(false); $('#ss-disc')?.classList.remove('is-playing'); return; }
  btn.innerHTML = '<span>Chargement…</span>';
  const pv = await fetchPreview(s);
  if (!ST || !$('#ss-play')) return;
  if (!pv) { setListenBtn(false); toast('Extrait indisponible pour le moment'); return; }
  listen.src = pv.url;
  listen.play().then(() => { setListenBtn(true); $('#ss-disc')?.classList.add('is-playing'); }, () => setListenBtn(false));
}
function storyAnswer(k) {
  if (ST.answered) return;
  const step = stepsOf(ST.a)[ST.i], ok = k === step.correct;
  const opts = $$('.ss-opt');
  if (!ok) {
    ST.firstTry = false;
    opts[k].classList.remove('is-wrong'); void opts[k].offsetWidth;
    opts[k].classList.add('is-wrong');
    sfx.wrong(); buzz(40);
    return;
  }
  ST.answered = true;
  opts[k].classList.add('is-right');
  opts.forEach(o => { o.disabled = true; });
  sfx.right(3); buzz(30);
  winFx(opts[k]);
  $('#ss-actions').innerHTML = `<div class="ss-good"><b>${ico('check-circle')}${pickOne(['Excellent !', 'Bravo !', 'Parfait !'])}</b><button class="btn btn-green ss-next" id="ss-next" type="button">Continuer</button></div>`;
}
// Étape terminée : on avance dans le parcours et on revient au chemin
function storyNext() {
  const a = ST.a, steps = stepsOf(a), st = storySt(a);
  const fresh = !st.done && ST.i === (st.step || 0);
  if (fresh) {
    st.step = ST.i + 1;
    if (!ST.firstTry) st.miss = true;
    addXP(10);
    save();
  }
  $('#ss-fill').style.width = `${(ST.i + 1) / steps.length * 100}%`;
  sfx.tap();
  setTimeout(() => {
    closeArtist();
    if (fresh && st.step >= steps.length) { toast(`Coffre de ${a.name} débloqué !`); sfx.booster(); }
    requestAnimationFrame(() => scrollToCurrent(true));
  }, 220);
}
function openChest(a) {
  const st = storySt(a);
  if (st.done || st.step < stepsOf(a).length) return;
  closePopover();
  st.done = true;
  const vinyl = a.steps.find(s => s.songId)?.songId;
  const coins = st.miss ? 100 : 150;
  if (vinyl && !store.coll[vinyl]) store.coll[vinyl] = { n: 1, t: Date.now(), seen: false };
  store.coins += coins;
  addXP(30);
  save();
  renderCoins(true);
  const s = SONG.get(vinyl);
  sfx.fanfare(); buzz([30, 60, 30]);
  showReward({ kicker: 'Artiste découvert', title: a.name, reward: { coins }, extra: s ? `+ le vinyle « ${s.title} » sur ton mur` : '' });
  renderStory();
  checkAchievements();
}



/* ================= ÉCRAN BOOSTERS ================= */
function renderBoosters() {
  renderCoins();
  const n = totalBoosters(), gold = store.goldBoosters > 0;
  $('#bx-hero').classList.toggle('is-empty', !n);
  $('#bx-hero').classList.toggle('is-gold', gold);
  $$('#bx-hero .bx-pack use').forEach(u => u.setAttribute('href', gold ? '#i-booster-gold' : '#i-booster'));
  $('.bx-2').style.display = n < 2 ? 'none' : '';
  $('.bx-3').style.display = n < 3 ? 'none' : '';
  $('#bx-n').textContent = n;
  $('#bx-label').textContent = n ? `${n > 1 ? 'boosters' : 'booster'} à ouvrir${gold ? ' · dont Or' : ''}` : 'Aucun booster pour l’instant';
  $('#bx-open').textContent = n ? 'Ouvrir' : 'Jouer pour en gagner';
  $('#bx-g-txt').textContent = `${store.gauge}/${GAUGE_MAX} bonnes réponses`;
  $('#bx-g-fill').style.width = `${store.gauge / GAUGE_MAX * 100}%`;
  $('#bx-packs').innerHTML = PACKS.map(p => `
    <button class="row pk" type="button" data-pack="${p.id}">${p.tag ? `<span class="row-tag">${p.tag}</span>` : ''}
      ${packArt(p.id)}<span class="row-txt"><b>${p.name}</b><small>${p.desc}</small></span>
      <span class="price-btn"><i class="coin"></i>${fmt(p.price)}</span>
    </button>`).join('');
  $('#bx-odds').innerHTML = RARITIES.slice().reverse().map(r => `<div class="bx-odd r-${r}"><span class="rar-pill r-${r}">${R_NAME[r]}</span><span class="bar bar-sm"><span style="width:${Math.max(3, ODDS[r])}%;--bar:${R_COLOR[r]}"></span></span><b>${String(ODDS[r]).replace('.', ',')} %</b></div>`).join('')
    + '<small class="bx-g-help">Chaque booster contient 3 vinyles, dont au moins 1 rare. Le Booster Or garantit un épique.</small>';
  const recent = ownedIds().sort((a, b) => store.coll[b].t - store.coll[a].t).slice(0, 6);
  $('#bx-recent').innerHTML = recent.length ? recent.map(id => { const s = SONG.get(id), r = RARITY.get(id); return `<button class="bs r-${r} bx-v" type="button" data-id="${id}"><span class="bs-cover">${coverHTML(s)}</span><b>${esc(s.title)}</b></button>`; }).join('') : '<p class="bx-g-help">Ouvre ton premier booster pour commencer ta collection !</p>';
}

/* ================= PASS DE SAISON (façon Pass Royale) ================= */
// Saison = mois calendaire. 30 paliers de 100 notes. Piste gratuite + piste Or (1 500 jetons).
const PASS_TIERS = 30, PASS_STEP = 100, PASS_PRICE = 1500;
const PASS_NAMES = ['Disco Fever', 'Rock Arena', 'Hip-Hop Block Party', 'Pop Explosion', 'Électro Nights', 'Chanson Café', 'Latino Fiesta', 'K-Pop Stage', 'Summer Hits', 'Back to the 80s', 'Unplugged', 'Legends Live'];
const seasonKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}`; };
const seasonNum = () => { const d = new Date(); return (d.getFullYear() - 2026) * 12 + d.getMonth() - 7; };
function passState() {
  if (!store.pass || store.pass.season !== seasonKey()) store.pass = { season: seasonKey(), pts: 0, gold: false, free: [], paid: [] };
  return store.pass;
}
const passTier = () => Math.min(PASS_TIERS, Math.floor(passState().pts / PASS_STEP));
function passReward(k, gold) {
  if (!gold) {
    if (k === PASS_TIERS) return { gold: 1 };
    if (k % 10 === 0) return { item: k === 10 ? 'acc:bandana' : 'acc:stars' };
    if (k % 5 === 0) return { boosters: 1 };
    return { coins: 40 + k * 5 };
  }
  if (k === PASS_TIERS) return { item: 'skin:passking' };
  if (k % 10 === 0) return { gold: 1 };
  if (k === 5) return { item: 'acc:fedora' };
  if (k === 15) return { item: 'acc:ph-gold' };
  if (k === 25) return { gold: 1, coins: 500 };
  if (k % 2 === 0) return { boosters: 1 };
  return { coins: 100 + k * 10 };
}
const passClaimable = () => { const P = passState(), t = passTier(); let n = 0; for (let k = 1; k <= t; k++) { if (!P.free.includes(k)) n++; if (P.gold && !P.paid.includes(k)) n++; } return n; };
function addPassPts(n) {
  const P = passState(), before = passTier();
  P.pts = Math.min(PASS_TIERS * PASS_STEP, P.pts + n);
  if (passTier() > before) setTimeout(() => toast(`Pass de saison : palier ${passTier()} atteint !`), 700);
}
function rewardArt(r) {
  if (r.item) { const [k, id] = r.item.split(':'); const it = itemOf(k, id); return k === 'skin' ? `<span class="pr-char">${charHTML(it, { head: true })}</span>` : k === 'acc' ? ico('gift') : ico('vinyl'); }
  if (r.gold) return ico('booster-gold');
  if (r.boosters) return ico('booster');
  return ico('coin');
}
function rewardLabel(r) {
  if (r.item) { const [k, id] = r.item.split(':'); return itemOf(k, id)?.name || 'Objet'; }
  if (r.gold) return 'Booster Or';
  if (r.boosters) return 'Booster';
  return `${fmt(r.coins)} jetons`;
}
function renderPassCard() {
  const P = passState(), t = passTier();
  $('#pass-card-title').textContent = t >= PASS_TIERS ? 'Pass terminé !' : `Palier ${t + 1} · ${P.pts % PASS_STEP}/${PASS_STEP} notes`;
  $('#pass-card-fill').style.width = `${t >= PASS_TIERS ? 100 : P.pts % PASS_STEP}%`;
  const c = passClaimable();
  $('#pass-card-badge').hidden = !c;
  $('#pass-card-badge').textContent = c;
}
function passTimer() { const d = new Date(), end = new Date(d.getFullYear(), d.getMonth() + 1, 1), ms = end - d, days = Math.floor(ms / 864e5); return days >= 1 ? `${days} j ${Math.floor(ms % 864e5 / 36e5)} h` : hms(ms); }
function renderPass() {
  const P = passState(), t = passTier();
  renderCoins();
  $('#pass-season').textContent = `Saison ${Math.max(1, seasonNum())}`;
  $('#pass-name').textContent = PASS_NAMES[new Date().getMonth()];
  $('#pass-timer').textContent = passTimer();
  $('#pass-tier').textContent = Math.min(PASS_TIERS, t + (t < PASS_TIERS ? 1 : 0));
  $('#pass-fill').style.width = `${t >= PASS_TIERS ? 100 : P.pts % PASS_STEP}%`;
  $('#pass-pts').textContent = t >= PASS_TIERS ? 'Tous les paliers atteints !' : `${P.pts % PASS_STEP} / ${PASS_STEP} notes`;
  const buy = $('#pass-buy');
  buy.hidden = P.gold;
  buy.innerHTML = `Pass Or <i class="coin"></i>${fmt(PASS_PRICE)}`;
  $('#pass-hero').classList.toggle('is-gold', P.gold);
  const cell = (k, gold) => {
    const r = passReward(k, gold), done = (gold ? P.paid : P.free).includes(k), reached = k <= t, locked = gold && !P.gold;
    const st = done ? 'is-claimed' : reached && !locked ? 'is-ready' : 'is-locked';
    return `<button class="pr ${gold ? 'pr-gold' : ''} ${st}" type="button" data-k="${k}" data-gold="${gold ? 1 : 0}" ${st === 'is-ready' ? '' : 'tabindex="-1"'}>
      <span class="pr-art">${rewardArt(r)}</span><span class="pr-name">${esc(rewardLabel(r))}</span>
      ${done ? `<span class="pr-state">${ico('g-check')}</span>` : locked ? `<span class="pr-state">${ico('g-lock')}</span>` : reached ? '<span class="pr-take">Prendre</span>' : ''}
    </button>`;
  };
  $('#pass-track').innerHTML = Array.from({ length: PASS_TIERS }, (_, i) => i + 1).map(k => `
    <div class="pt-row${k <= t ? ' is-reached' : ''}${k === t + 1 ? ' is-next' : ''}">
      ${cell(k, false)}<span class="pt-num">${k}</span>${cell(k, true)}
    </div>`).join('');
  renderBadges();
}
function claimPass(k, gold) {
  const P = passState();
  if (k > passTier() || (gold && !P.gold)) return;
  const list = gold ? P.paid : P.free;
  if (list.includes(k)) return;
  let r = passReward(k, gold);
  if (r.item) { const [kind, id] = r.item.split(':'); if (isOwned(kind, id)) r = { coins: 300 }; }
  list.push(k);
  grantReward(r);
  sfx.booster(); buzz([30, 40, 30]);
  showReward({ kicker: `Pass de saison · palier ${k}`, title: rewardLabel(r), reward: r });
  renderPass();
}
function buyPass() {
  const P = passState();
  if (P.gold) return;
  if (!spendCoins(PASS_PRICE)) { toast(`Il te manque ${fmt(PASS_PRICE - store.coins)} jetons`); return; }
  P.gold = true;
  save();
  sfx.fanfare(); confetti(60, ['#FFC800', '#FF9600', '#FFFFFF', '#1CB0F6']);
  toast('Pass Or débloqué !');
  renderPass();
}


/* ================= COMPTE : Google, Apple, email ================= */
const A = window.PompeAuth;
let authMode = 'signup', signedInDone = false;
function showAuth() {
  $('#auth-host').innerHTML = charHTML(HOST, { mood: 'happy' });
  $('#auth-screen').hidden = false;
  $('#auth-home').hidden = false;
  $('#auth-form').hidden = true;
  $('#auth-wait').hidden = true;
}
const hideAuth = () => { $('#auth-screen').hidden = true; };
function authWait(on, txt = 'Connexion…') { $('#auth-wait').hidden = !on; $('#auth-wait-txt').textContent = txt; }
function authMsg(msg, ok) {
  authWait(false);
  const el = $('#auth-msg');
  if (!$('#auth-form').hidden) { el.textContent = msg || ''; el.classList.toggle('is-ok', !!ok); } else if (msg) toast(msg);
}
function authForm(mode) {
  authMode = mode;
  const up = mode === 'signup';
  $('#auth-home').hidden = true;
  $('#auth-form').hidden = false;
  $('#auth-form-title').textContent = up ? 'Crée ton compte' : 'Content de te revoir !';
  $('#auth-name-row').hidden = !up;
  $('#auth-pass').autocomplete = up ? 'new-password' : 'current-password';
  $('#auth-submit').textContent = up ? 'Créer mon compte' : 'Me connecter';
  $('#auth-switch').textContent = up ? 'J’ai déjà un compte' : 'Créer un compte';
  $('#auth-forgot').hidden = up;
  $('#auth-msg').textContent = '';
  if (up && store.name) $('#auth-name').value = store.name;
  setTimeout(() => (up ? $('#auth-name') : $('#auth-email')).focus(), 50);
}
// Récupère la progression du compte : on garde la plus avancée des deux
async function syncFromCloud() {
  try {
    const row = await A.loadSave();
    const cloud = row?.data;
    const prog = d => (d?.xp || 0) + (d?.games || 0) * 10 + Object.keys(d?.coll || {}).length;
    if (cloud && typeof cloud === 'object' && prog(cloud) > prog(store)) {
      localStorage.setItem(STORE_KEY, JSON.stringify(Object.assign(cloud, { guest: false })));
      location.reload();
      return true;
    }
    A.pushSave(store, true);
  } catch (e) {}
  return false;
}
async function onSignedIn() {
  if (signedInDone) return;
  signedInDone = true;
  hideAuth();
  store.guest = false;
  const name = $('#auth-name').value.trim() || store.name;
  if (name && !store.name) store.name = name.slice(0, 16);
  save();
  A.ensureProfile(store.name).catch(() => {});
  if (await syncFromCloud()) return;
  renderAccount();
  if (!store.onboarded) maybeWelcome();
  else toast(`Connecté${store.name ? ` : salut ${store.name} !` : ' !'}`);
  refreshScreen();
}
function renderAccount() {
  const u = A?.user;
  $('#acc-sub').textContent = u ? (u.email || 'Compte connecté') : 'Joue avec un compte pour sauvegarder ta progression';
  $('#acc-btn').textContent = u ? 'Se déconnecter' : 'Se connecter';
}
async function startAccount() {
  if (!A?.ready) { setTimeout(maybeWelcome, 500); return; }
  A.onError(msg => authMsg(msg));
  A.onChange(u => { if (u) onSignedIn(); else { signedInDone = false; renderAccount(); } });
  await A.init();
  renderAccount();
  if (A.user) { onSignedIn(); return; }
  if (store.guest) { setTimeout(maybeWelcome, 300); return; }
  showAuth();
}
$('#auth-screen').addEventListener('click', async e => {
  const o = e.target.closest('[data-oauth]');
  if (o) {
    unlockAudio();
    authWait(true, o.dataset.oauth === 'apple' ? 'Connexion avec Apple…' : 'Connexion avec Google…');
    try { await A.oauth(o.dataset.oauth); } catch (err) { authMsg(A.frError(err)); }
    return;
  }
  if (e.target.closest('#auth-to-signup')) authForm('signup');
  else if (e.target.closest('#auth-to-login')) authForm('login');
  else if (e.target.closest('#auth-switch')) authForm(authMode === 'signup' ? 'login' : 'signup');
  else if (e.target.closest('#auth-back')) showAuth();
  else if (e.target.closest('#auth-guest')) { store.guest = true; save(); hideAuth(); maybeWelcome(); }
  else if (e.target.closest('#auth-forgot')) {
    const email = $('#auth-email').value.trim();
    if (!email) { authMsg('Entre ton email pour recevoir un lien.'); return; }
    try { await A.resetPassword(email); authMsg('Lien envoyé ! Regarde ta boîte mail.', true); } catch (err) { authMsg(A.frError(err)); }
  }
});
$('#auth-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('#auth-email').value.trim(), pass = $('#auth-pass').value, name = $('#auth-name').value.trim();
  if (authMode === 'signup' && name.length < 2) { authMsg('Choisis un pseudo (2 caractères minimum).'); return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { authMsg('Adresse email invalide.'); return; }
  if (pass.length < 6) { authMsg('Le mot de passe doit faire au moins 6 caractères.'); return; }
  authWait(true, authMode === 'signup' ? 'Création du compte…' : 'Connexion…');
  try {
    if (authMode === 'signup') {
      store.name = name.slice(0, 16); save();
      if (await A.signUp(email, pass, name) === 'confirm') { authForm('login'); $('#auth-email').value = email; authMsg('Compte créé ! Confirme ton email (lien reçu), puis connecte-toi.', true); }
    } else await A.signIn(email, pass);
  } catch (err) { authMsg(A.frError(err)); }
});
$('#acc-btn').addEventListener('click', async () => {
  if (A?.user) { await A.signOut(); store.guest = true; save(); toast('Déconnecté. Ta progression reste sur cet appareil.'); renderAccount(); }
  else showAuth();
});

/* ---------------- Événements ---------------- */
const quickPlay = () => { const p = store.prefs; startGame({ cat: p.cat, mode: p.mode, rounds: p.rounds }); };
$('#btn-play').addEventListener('click', quickPlay);
$('#home-boosters').addEventListener('click', () => { totalBoosters() ? openBooster() : show('shop'); });
$('#tabbar').addEventListener('click', e => { const t = e.target.closest('.tab'); if (t && t.dataset.tab !== currentScreen()) { unlockAudio(); show(t.dataset.tab); } });
$('#home-coins').addEventListener('click', () => show('shop'));
$('#mis-card').addEventListener('click', openMissions);
$('#daily-card').addEventListener('click', () => {
  if (dailyToday()) { toast(`Nouveau défi dans ${hms(msToMidnight())}`); return; }
  startGame({ daily: true, mode: 'type', rounds: 1, attempts: 3, candidates: dailySongCandidates() });
});
$('#home-streak').addEventListener('click', () => {
  const s = currentStreak();
  toast(playedToday() ? `${plural(s, 'jour', 'jours')} d’affilée, bravo !` : s ? `Joue aujourd’hui pour garder ta série de ${s} jours` : 'Joue une partie pour lancer ta série');
});
$('#cat-list').addEventListener('click', e => { const b = e.target.closest('.cat'); if (!b) return; store.prefs.cat = b.dataset.cat; save(); renderHome(); });
$('#mode-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; store.prefs.mode = b.dataset.mode; save(); renderHome(); });
$('#rounds-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; store.prefs.rounds = +b.dataset.rounds; save(); renderHome(); });
$('#btn-open-booster').addEventListener('click', e => { e.stopPropagation(); totalBoosters() ? openBooster() : show('shop'); });
$('#booster-card').addEventListener('click', () => { totalBoosters() ? openBooster() : show('shop'); });

$('#choices').addEventListener('click', e => { const b = e.target.closest('.choice'); if (b) onChoice(b); });
$('#type-box').addEventListener('submit', e => { e.preventDefault(); submitText($('#type-input').value); });
$('#type-input').addEventListener('input', e => renderSuggestions(e.target.value));
$('#suggest').addEventListener('click', e => {
  const b = e.target.closest('.sug'); if (!b) return;
  $('#type-input').value = b.querySelector('b').textContent;
  submitText(b.querySelector('b').textContent, b.dataset.id);
});
$('#btn-hint').addEventListener('click', useHint);
// Réécouter l'extrait depuis la bulle du présentateur
$('#btn-replay-audio').addEventListener('click', () => {
  if (!G.pv || G.cfg?.mode === 'stems' || (G.phase !== 'playing' && G.phase !== 'reveal')) return;
  unlockAudio();
  try { player.currentTime = 0; player.play().catch(() => {}); } catch (e) {}
  const b = $('#btn-replay-audio');
  b.classList.remove('is-playing'); void b.offsetWidth; b.classList.add('is-playing');
  setTimeout(() => b.classList.remove('is-playing'), 1600);
});
const holdEl = $('#hold');
holdEl.addEventListener('pointerdown', e => { if (G.cfg?.mode !== 'stems') return; e.preventDefault(); holdEl.setPointerCapture?.(e.pointerId); holdStart(); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => holdEl.addEventListener(ev, holdEnd));
holdEl.addEventListener('contextmenu', e => { if (G.cfg?.mode === 'stems') e.preventDefault(); });
$('#stems').addEventListener('click', e => { const b = e.target.closest('.stem'); if (b && !b.disabled) addStem(); });
document.addEventListener('keydown', e => { if (e.code === 'Space' && G.cfg?.mode === 'stems' && G.phase === 'playing' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); holdStart(); } });
document.addEventListener('keyup', e => { if (e.code === 'Space') holdEnd(); });
$('#btn-next').addEventListener('click', nextRound);
$('#btn-quit').addEventListener('click', () => {
  if (G.phase === 'done' || G.phase === 'idle') return show('home');
  $('#quit-char').innerHTML = meHTML({ mood: 'sad' });
  $('#quit-sheet').hidden = false;
  kbFocus($('#quit-cancel'));
});
$('#quit-cancel').addEventListener('click', () => { $('#quit-sheet').hidden = true; });
$('#quit-confirm').addEventListener('click', quitGame);
$('#quit-sheet').addEventListener('click', e => { if (e.target.id === 'quit-sheet') $('#quit-sheet').hidden = true; });
$('#btn-home').addEventListener('click', () => show('home'));
$('#btn-replay').addEventListener('click', () => { if (G.cfg?.daily) show('home'); else startGame(G.cfg); });
$('#btn-share').addEventListener('click', share);
$('#rb-open').addEventListener('click', openBooster);
$('#streak-ok').addEventListener('click', () => { $('#streak-overlay').hidden = true; });

// Booster
const packEl = $('#pack');
packEl.addEventListener('pointerdown', onPackDown);
packEl.addEventListener('pointermove', onPackMove);
packEl.addEventListener('pointerup', onPackUp);
packEl.addEventListener('pointercancel', onPackUp);
packEl.addEventListener('pointerleave', () => { if (!drag) resetTilt(); });
packEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); autoTear(0); } });
$('#bo-stage').addEventListener('click', e => {
  if (!BO) return;
  if (BO.state === 'cards' && e.target.closest('.vc.is-current')) revealCard();
  else if (BO.state === 'revealed') nextCard();
});
$('#bo-close').addEventListener('click', closeBooster);
$('#bo-next').addEventListener('click', () => { if (totalBoosters()) openBooster(); else closeBooster(); });
$('#bo-to-coll').addEventListener('click', () => { closeBooster(); show('collection'); });

// Collection
$('#coll-open').addEventListener('click', openBooster);
$('#coll-empty-play').addEventListener('click', () => {
  if (totalBoosters()) openBooster();
  else { const p = store.prefs; startGame({ cat: p.cat, mode: p.mode, rounds: p.rounds }); }
});
$('#rar-filter').addEventListener('click', e => { const b = e.target.closest('.rf'); if (!b) return; COLL.filter = b.dataset.r; COLL.shown = 60; renderCollection(); });
$('#screen-collection').addEventListener('click', e => {
  if (e.target.closest('#coll-more')) { COLL.shown += 60; renderCollection(); return; }
  if (e.target.closest('#nook-char')) { charChat(); return; }
  const t = e.target.closest('.frame.vt'); if (t) openVinyl(t.dataset.id);
});
$('#vs-close').addEventListener('click', closeVinyl);

$('#bx-open').addEventListener('click', () => { totalBoosters() ? openBooster() : show('home'); });
$('#screen-boosters').addEventListener('click', e => {
  const pk = e.target.closest('.pk'); if (pk) { openPack(pk.dataset.pack); return; }
  const v = e.target.closest('.bx-v'); if (v) openVinyl(v.dataset.id);
});
$('#story-home').addEventListener('click', () => show('home'));
$('#me-btn').addEventListener('click', () => show('profile'));
$('#pf-back').addEventListener('click', () => show('home'));
$('#pass-card').addEventListener('click', () => show('pass'));
$('#pass-buy').addEventListener('click', buyPass);
$('#pass-track').addEventListener('click', e => { const b = e.target.closest('.pr.is-ready'); if (b) claimPass(+b.dataset.k, b.dataset.gold === '1'); });
// Histoire
$('#story-card').addEventListener('click', () => show('story'));
$('#story-back').addEventListener('click', () => scrollToCurrent(true));
$('#story-list').addEventListener('click', e => {
  const go = e.target.closest('.pop-go'); if (go) { openStep(go.dataset.artist, +go.dataset.k); return; }
  const n = e.target.closest('.node'); if (n) { openPopover(n); return; }
  if (!e.target.closest('.popover')) closePopover();
});
$('#ss-close').addEventListener('click', closeArtist);
$('#story-step').addEventListener('click', e => {
  if (e.target.closest('#ss-next')) storyNext();
  else if (e.target.closest('#ss-play')) storyListen();
  else { const o = e.target.closest('.ss-opt'); if (o) storyAnswer(+o.dataset.k); }
});

// Boutique
$('#gift-card').addEventListener('click', claimGift);
$('#deal-card').addEventListener('click', e => openItem(e.currentTarget.dataset.kind, e.currentTarget.dataset.id));
$('#screen-shop').addEventListener('click', e => {
  const pk = e.target.closest('.pk'); if (pk) { openPack(pk.dataset.pack); return; }
  const it = e.target.closest('.item'); if (it) openItem(it.dataset.kind, it.dataset.id);
});
$('#is-close').addEventListener('click', closeItem);
$('#is-action').addEventListener('click', () => { if (!IS) return; IS.pack ? buyPack() : itemAction(); });
$('#item-sheet').addEventListener('click', e => { if (e.target.id === 'item-sheet') closeItem(); });

// Missions
$('#ms-list').addEventListener('click', e => { const b = e.target.closest('.ms-claim'); if (b) claimMission(+b.dataset.i); });
$('#ms-bonus').addEventListener('click', claimMissionBonus);
$('#ms-close').addEventListener('click', () => { $('#missions-sheet').hidden = true; });
$('#missions-sheet').addEventListener('click', e => { if (e.target.id === 'missions-sheet') $('#missions-sheet').hidden = true; });

// Récompenses
$('#rw-ok').addEventListener('click', () => closeReward(true));
$('#rw-later').addEventListener('click', () => closeReward(false));

// Profil
$('#pf-tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; PF_TAB = b.dataset.pt; renderProfile(); });
$('#pf-name').addEventListener('change', e => {
  store.name = e.target.value.trim().slice(0, 16);
  e.target.value = store.name;
  save();
  toast(store.name ? `C’est noté, ${store.name} !` : 'Pseudo effacé');
});
$('#pf-name').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
$('#pf-avatar').addEventListener('click', () => {
  PF_TAB = 'skins';
  renderProfile();
  $('#pf-sec-skin')?.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
});
$('#pf-ach').addEventListener('click', e => { const b = e.target.closest('.ach-claim'); if (b) claimAch(b.dataset.ach); });
$('#pf-gear').addEventListener('click', () => { PF_TAB = 'settings'; renderProfile(); $('#pf-tabs').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }); });
$('#pf-skins').addEventListener('click', e => { const it = e.target.closest('.item'); if (it) openItem(it.dataset.kind, it.dataset.id); });
$('#set-sound').addEventListener('change', e => { store.settings.sound = e.target.checked; save(); if (e.target.checked) { unlockAudio(); sfx.tap(); } else ambience.stop(); });
$('#set-haptics').addEventListener('change', e => { store.settings.haptics = e.target.checked; save(); buzz(40); });
$('#set-reset').addEventListener('click', () => { $('#reset-sheet').hidden = false; kbFocus($('#rs-cancel')); });
$('#rs-cancel').addEventListener('click', () => { $('#reset-sheet').hidden = true; });
$('#reset-sheet').addEventListener('click', e => { if (e.target.id === 'reset-sheet') $('#reset-sheet').hidden = true; });
$('#rs-confirm').addEventListener('click', () => {
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  location.reload();
});

// Bienvenue
$('#wl-avatars').addEventListener('click', e => {
  const b = e.target.closest('.wl-av'); if (!b) return;
  wlAvatar = b.dataset.av;
  $$('.wl-av').forEach(x => x.setAttribute('aria-checked', String(x === b)));
});
$('#wl-go').addEventListener('click', () => finishWelcome(true));
$('#wl-skip').addEventListener('click', () => finishWelcome(false));
$('#wl-name').addEventListener('keydown', e => { if (e.key === 'Enter') finishWelcome(true); });
$('#vs-play').addEventListener('click', toggleListen);
$('#vinyl-sheet').addEventListener('click', e => { if (e.target.id === 'vinyl-sheet') closeVinyl(); });

document.addEventListener('keydown', e => {
  if (BO) {
    if (e.key === 'Escape') { closeBooster(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && (BO.state === 'cards' || BO.state === 'revealed')) {
      e.preventDefault();
      BO.state === 'cards' ? revealCard() : nextCard();
    }
    return;
  }
  if (e.key === 'Escape') {
    if (!$('#vinyl-sheet').hidden) { closeVinyl(); return; }
    if (!$('#item-sheet').hidden) { closeItem(); return; }
    if (!$('#missions-sheet').hidden) { $('#missions-sheet').hidden = true; return; }
    if (!$('#reset-sheet').hidden) { $('#reset-sheet').hidden = true; return; }
    if (!$('#reward-overlay').hidden) { closeReward(false); return; }
    if (!$('#story-step').hidden) { closeArtist(); return; }
  }
  if (currentScreen() !== 'game') return;
  if (e.key === 'Escape') { $('#quit-sheet').hidden ? $('#btn-quit').click() : ($('#quit-sheet').hidden = true); return; }
  if (G.phase === 'reveal' && (e.key === 'Enter' || e.key === ' ') && document.activeElement?.id !== 'type-input') { e.preventDefault(); nextRound(); return; }
  if (G.phase === 'playing' && G.cfg.mode !== 'type' && /^[1-4]$/.test(e.key)) {
    const b = $$('.choice')[+e.key - 1]; if (b) onChoice(b);
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    try { listen.pause(); } catch (e) {}
    if (G.phase === 'playing') { try { player.pause(); } catch (e) {} stopBeat(); }
  } else if (G.phase === 'playing' && G.pv) player.play().catch(() => {});
});

if (/[?&]debug\b/.test(location.search)) window.__PQ = { audio: () => ({ ctx: actx?.state || null, src: player.currentSrc, paused: player.paused, time: player.currentTime }), G, store, save, openBooster, get BO() { return BO; }, RARITY, BY_RARITY, ACHS, achState, ensureMissions, checkAchievements };
// Le son se débloque au tout premier toucher, quel que soit l'endroit (iOS / WebView)
['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, unlockAudio, { once: true, passive: true }));
ensureMissions();
applySkins();
renderCoins();
show('home');
startAccount();
})();
