/* ============================================
   Pompelup — blind test + boosters de vinyles
   Mobile first · vanilla JS · état en localStorage
   ============================================ */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
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
  boosters: 1, gauge: 0, opened: 0, coll: {},
  prefs: { cat: 'all', mode: 'choice', rounds: 10 },
});
const store = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    const d = defaults();
    return Object.assign(d, raw, { prefs: Object.assign(d.prefs, raw.prefs), streak: Object.assign(d.streak, raw.streak), coll: Object.assign({}, raw.coll) });
  } catch (e) { return defaults(); }
})();
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {} };

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
  if (gained > 0) store.boosters += gained;
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
const CATS = [
  { id: 'all', name: 'Tout mélangé', emoji: '🎲', test: () => true },
  { id: 'Pop', name: 'Pop', emoji: '🎤' },
  { id: 'Rock', name: 'Rock', emoji: '🎸' },
  { id: 'Hip-Hop', name: 'Hip-Hop', emoji: '🎧' },
  { id: 'Dance', name: 'Dance', emoji: '🪩' },
  { id: 'Pop Française', name: 'Pop FR', emoji: '🥖' },
  { id: 'Rap Français', name: 'Rap FR', emoji: '🎙️' },
  { id: 'Latino', name: 'Latino', emoji: '💃' },
  { id: 'K-Pop', name: 'K-Pop', emoji: '💜' },
  { id: 'd70', name: '60s & 70s', emoji: '🕺', test: s => s.year < 1980 },
  { id: 'd80', name: 'Années 80', emoji: '📼', test: s => s.year >= 1980 && s.year < 1990 },
  { id: 'd90', name: 'Années 90', emoji: '💿', test: s => s.year >= 1990 && s.year < 2000 },
  { id: 'd00', name: 'Années 2000', emoji: '📱', test: s => s.year >= 2000 && s.year < 2010 },
  { id: 'd10', name: 'Années 2010', emoji: '🔊', test: s => s.year >= 2010 && s.year < 2020 },
  { id: 'd20', name: 'Années 2020', emoji: '✨', test: s => s.year >= 2020 },
].map(c => Object.assign(c, { test: c.test || (s => s.genre === c.id) }));
const catById = id => CATS.find(c => c.id === id) || CATS[0];
const poolFor = id => SONGS.filter(catById(id).test);

/* ---------------- Raretés des vinyles ---------------- */
const RARITIES = ['common', 'rare', 'epic', 'legendary'];
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 };
const R_NAME = { common: 'Commune', rare: 'Rare', epic: 'Épique', legendary: 'Légendaire' };
const R_NAMES = { common: 'Communes', rare: 'Rares', epic: 'Épiques', legendary: 'Légendaires' };
const R_COLOR = { common: '#B9B3C4', rare: '#38BDF8', epic: '#C084FC', legendary: '#FBBF24' };
const R_GLOW = { common: 'rgba(185,179,196,.28)', rare: 'rgba(56,189,248,.42)', epic: 'rgba(192,132,252,.5)', legendary: 'rgba(251,191,36,.62)' };
const R_RAY = { common: 'rgba(255,255,255,.05)', rare: 'rgba(56,189,248,.14)', epic: 'rgba(192,132,252,.18)', legendary: 'rgba(251,191,36,.24)' };
const R_ICON = { common: '●', rare: '◆', epic: '✦', legendary: '★' };
const DUP_XP = { common: 10, rare: 25, epic: 60, legendary: 150 };
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
function roll(table) {
  let r = Math.random() * Object.values(table).reduce((a, b) => a + b, 0);
  for (const [k, w] of Object.entries(table)) { if ((r -= w) < 0) return k; }
  return Object.keys(table)[0];
}

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
const ART_KEY = 'pompelup_art_v1';
const artCache = (() => { try { return JSON.parse(localStorage.getItem(ART_KEY) || '{}'); } catch (e) { return {}; } })();
let artSaveTimer;
function rememberArt(id, url) {
  artCache[id] = url || '';
  clearTimeout(artSaveTimer);
  artSaveTimer = setTimeout(() => { try { localStorage.setItem(ART_KEY, JSON.stringify(artCache)); } catch (e) {} }, 400);
}
const previewCache = new Map();
function fetchPreview(song) {
  if (previewCache.has(song.id)) return previewCache.get(song.id);
  const p = (async () => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 6000);
    try {
      const q = encodeURIComponent(`${song.title} ${song.artist}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${q}&media=music&entity=song&limit=8`, { signal: ctrl.signal });
      const data = await res.json();
      const list = (data.results || []).filter(t => t.previewUrl);
      const ar = normalize(song.artist);
      const t = list.find(x => { const n = normalize(x.artistName || ''); return n.includes(ar) || similarity(n, ar) > 0.6; }) || list[0];
      if (!t) { rememberArt(song.id, ''); return null; }
      const art = t.artworkUrl100 ? t.artworkUrl100.replace(/100x100/, '400x400') : null;
      rememberArt(song.id, art);
      return { url: t.previewUrl, art };
    } catch (e) {
      previewCache.delete(song.id);
      return null;
    } finally { clearTimeout(to); }
  })();
  previewCache.set(song.id, p);
  return p;
}
const knownArt = id => (artCache[id] || null);
async function getArt(song) {
  if (song.id in artCache) return artCache[song.id] || null;
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
  return `<span class="cover-fb"><span class="cf-emoji">${song.emoji || '🎵'}</span><span><span class="cf-title">${esc(song.title)}</span><span class="cf-artist">${esc(song.artist)}</span></span></span>`;
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
function tone(freq, dur = .12, type = 'sine', gain = .18, when = 0, slideTo) {
  if (!actx) return;
  const t = actx.currentTime + when, o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + .01);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(actx.destination);
  o.start(t); o.stop(t + dur + .02);
}
function noise(dur = .3, from = 3000, to = 600, gain = .25) {
  if (!actx) return;
  const len = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain(), t = actx.currentTime;
  src.buffer = buf;
  f.type = 'bandpass'; f.Q.value = .9;
  f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.value = gain;
  src.connect(f).connect(g).connect(actx.destination);
  src.start();
}
function playFile(src, vol = .8) { try { const a = new Audio(src); a.volume = vol; a.play().catch(() => {}); return a; } catch (e) { return null; } }
const LEGENDARY_SFX = ['assets/legendary-1.mp3', 'assets/legendary-2.mp3', 'assets/legendary-3.mp3', 'assets/legendary-4.mp3'];
const EPIC_SFX = ['assets/epic-1.mp3', 'assets/epic-2.mp3'];
const sfx = {
  right: combo => { [660, 880, 1320].forEach((f, i) => tone(f * (1 + Math.min(combo, 6) * .03), .16, 'triangle', .16, i * .07)); },
  wrong: () => { tone(200, .25, 'sawtooth', .09); tone(150, .3, 'sawtooth', .07, .08); },
  tick: last => tone(last ? 1320 : 1000, .05, 'square', .05),
  timeout: () => { tone(330, .18, 'triangle', .12); tone(247, .3, 'triangle', .12, .15); },
  tap: () => tone(700, .04, 'sine', .06),
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .22, 'triangle', .14, i * .11)),
  booster: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, .18, 'triangle', .14, i * .06)); tone(392, .5, 'sine', .12); },
  whoosh: () => noise(.45, 400, 2400, .12),
  tear: () => { noise(.32, 5000, 900, .3); noise(.2, 2000, 400, .2); },
  zip: p => tone(420 + p * 900, .03, 'square', .035),
  charge: ms => { tone(180, ms / 1000, 'sawtooth', .05, 0, 900); tone(90, ms / 1000, 'sine', .12, 0, 360); },
  reveal: r => {
    const seq = r === 'legendary' ? [523, 659, 784, 1047, 1319] : r === 'epic' ? [523, 784, 1047, 1319] : r === 'rare' ? [523, 784, 1047] : [659, 880];
    seq.forEach((f, i) => tone(f, .55, r === 'legendary' ? 'sine' : 'triangle', r === 'common' ? .12 : .17, i * .06));
    if (r === 'legendary') { tone(110, 1.6, 'sine', .3); playFile(pickOne(LEGENDARY_SFX), .75); }
    if (r === 'epic') playFile(pickOne(EPIC_SFX), .7);
  },
};
const buzz = p => { try { navigator.vibrate?.(p); } catch (e) {} };
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
  const hit = () => { tone(n % 2 ? 180 : 70, .12, n % 2 ? 'triangle' : 'sine', n % 2 ? .06 : .22); tone(6000, .03, 'square', .015, period / 2000); n++; };
  hit();
  beatTimer = setInterval(hit, period);
}
function stopBeat() { clearInterval(beatTimer); beatTimer = null; }
function stopMusic() { stopBeat(); try { player.pause(); } catch (e) {} }
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
function show(id) {
  $$('.screen').forEach(s => s.classList.toggle('is-active', s.id === `screen-${id}`));
  $('meta[name="theme-color"]')?.setAttribute('content', id === 'game' ? '#1C1230' : '#FFF4EA');
  window.scrollTo(0, 0);
  if (id === 'home') renderHome();
  if (id === 'collection') renderCollection();
}

/* ---------------- Toast & FX ---------------- */
let toastTimer;
function toast(msg, ms = 2300) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), ms);
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
function confetti(n = 60, colors = ['#F97316', '#FBBF24', '#6D28D9', '#16A34A', '#EC4899', '#3B82F6']) {
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
  const L = levelOf(store.xp);
  $('#home-level').textContent = L.lvl;
  $('#home-level-fill').style.width = `${Math.round(L.pct * 100)}%`;
  $('#stat-best').textContent = fmt(store.best);
  $('#stat-games').textContent = fmt(store.games);
  $('#stat-acc').textContent = store.played ? `${Math.round(store.found / store.played * 100)}%` : '–';

  const list = $('#cat-list');
  if (!list.children.length) {
    list.innerHTML = CATS.map(c => `
      <button class="cat" type="button" role="radio" data-cat="${c.id}">
        <span class="cat-emoji" aria-hidden="true">${c.emoji}</span>
        <span class="cat-name">${esc(c.name)}</span>
        <span class="cat-count">${poolFor(c.id).length} titres</span>
      </button>`).join('');
  }
  $$('.cat', list).forEach(b => b.setAttribute('aria-checked', String(b.dataset.cat === store.prefs.cat)));
  $$('#mode-seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.mode === store.prefs.mode)));
  $$('#rounds-seg button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.rounds === store.prefs.rounds)));
  $('#play-sub').textContent = `${catById(store.prefs.cat).name} · ${store.prefs.rounds} manches${store.prefs.mode === 'type' ? ' · saisie' : ''}`;
  renderBoosterCard();
  renderCollCard();
  renderDaily();
  clearInterval(dailyTicker);
  dailyTicker = setInterval(() => { if (currentScreen() === 'home') renderDaily(); else clearInterval(dailyTicker); }, 1000);
}
function renderBoosterCard() {
  const n = store.boosters, card = $('#booster-card');
  card.classList.toggle('is-empty', n === 0);
  $('.mp-2', card).hidden = n < 2;
  $('.mp-3', card).hidden = n < 3;
  $('#bcard-badge').hidden = n === 0;
  $('#bcard-badge').textContent = n;
  const welcome = store.opened === 0 && n > 0;
  $('.bcard-kicker', card).textContent = welcome ? 'Cadeau de bienvenue' : 'Boosters de vinyles';
  $('#bcard-title').textContent = welcome ? '1 booster offert !' : n ? `${plural(n, 'booster', 'boosters')} à ouvrir` : 'Prochain booster';
  $('#bcard-gauge-fill').style.width = `${store.gauge / GAUGE_MAX * 100}%`;
  $('#bcard-gauge-txt').textContent = n
    ? `Prochain : ${store.gauge}/${GAUGE_MAX} bonnes réponses`
    : `${store.gauge}/${GAUGE_MAX} bonnes réponses · encore ${GAUGE_MAX - store.gauge} !`;
  $('#btn-open-booster').textContent = n ? 'Ouvrir' : 'Ma collection';
}
function ownedIds() { return Object.keys(store.coll).filter(id => SONG.has(id)); }
function renderCollCard() {
  const ids = ownedIds();
  $('#coll-card-n').textContent = ids.length;
  $('#coll-card-total').textContent = `/${SONGS.length}`;
  const last = ids.sort((a, b) => store.coll[b].t - store.coll[a].t).slice(0, 3);
  const fan = $('#coll-fan');
  fan.innerHTML = last.length
    ? last.map((id, i) => `<span class="fan-item r-${RARITY.get(id)}" style="left:${i * 28}px; transform: rotate(${(i - 1) * 7}deg); z-index:${3 - i}">${coverHTML(SONG.get(id))}</span>`).join('')
    : [0, 1, 2].map(i => `<span class="fan-empty" style="left:${i * 28}px"></span>`).join('');
  $$('.fan-item .cover', fan).forEach(cov => { const s = SONG.get(cov.dataset.cover); if (!knownArt(s.id)) queueArt(s, a => fillCover(cov, a)); });
}
function dailyToday() { return store.daily && store.daily.date === dayKey() ? store.daily : null; }
function renderDaily() {
  const d = dailyToday(), card = $('#daily-card');
  card.classList.toggle('is-done', !!d);
  if (!d) {
    $('#daily-title').textContent = 'Chanson mystère';
    $('#daily-sub').textContent = '3 essais · +150 XP · +1 🎁';
    $('#daily-cta').textContent = 'Jouer →';
    return;
  }
  $('#daily-title').textContent = d.won ? 'Défi réussi !' : 'Raté !';
  $('#daily-sub').textContent = d.title ? `« ${d.title} »` : 'Défi abandonné';
  $('#daily-cta').textContent = `⏳ ${hms(msToMidnight())}`;
}
function dailySongCandidates() {
  const h = hashStr(`pompelup-${dayKey()}`), out = [];
  for (let k = 0; k < 6; k++) out.push(SONGS[(h + k * 7919) % SONGS.length]);
  return out;
}

/* ---------------- Partie ---------------- */
const G = { phase: 'idle', token: 0 };

function startGame(cfg) {
  unlockAudio();
  const pool = cfg.daily ? cfg.candidates.slice() : shuffle(poolFor(cfg.cat).slice());
  const rounds = Math.min(cfg.rounds, pool.length);
  Object.assign(G, {
    cfg, token: G.token + 1, phase: 'loading',
    songs: pool.slice(0, rounds), spares: pool.slice(rounds, rounds + 12),
    i: 0, score: 0, combo: 0, bestCombo: 0, results: [], boostersWon: 0,
    dur: cfg.daily ? 30 : cfg.mode === 'type' ? 25 : 20,
  });
  if (cfg.daily) { store.daily = { date: dayKey(), won: false, tries: 0, done: false }; save(); }
  $('#game-score').textContent = '0';
  $('#game-score').dataset.v = 0;
  $('#game-gauge').hidden = !!cfg.daily;
  $('.game-score').hidden = !!cfg.daily;
  updateGameGauge();
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
  $('#clues').hidden = true;
  $('#btn-next').hidden = true;
  $('#eq').classList.remove('is-playing');
  $('#game-round').textContent = G.cfg.daily ? 'Défi du jour' : `Manche ${G.i + 1}/${G.songs.length}`;
  $('#stage-status').textContent = G.i === 0 ? 'On chauffe les platines…' : 'Chargement de l’extrait…';
  setTimer(1, G.dur);
  $('#choices').innerHTML = '';
  $('#type-box').hidden = true;
  const hintBtn = $('#btn-hint');
  hintBtn.hidden = !!G.cfg.daily;
  hintBtn.disabled = true;
  $('#hint-label').textContent = G.cfg.mode === 'type' ? 'Indice (−30 %)' : '50/50 (−30 %)';

  const { song, pv } = await resolveRound(G.i);
  if (token !== G.token) return;
  G.song = song;
  G.pv = pv;
  if (G.songs[G.i + 1]) fetchPreview(G.songs[G.i + 1]);
  if (pv?.art) { img.onload = () => img.classList.add('has-src'); img.src = pv.art; }
  $('#disc-label').style.background = song.color || 'var(--orange)';

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
  let playing = false;
  if (pv) playing = await playPreview(pv.url);
  if (token !== G.token) return;
  if (!playing) {
    // Pas d'extrait (hors ligne, bloqué…) : on joue avec des indices et un beat au bon tempo.
    startBeat(song.bpm);
    $('#clues').hidden = false;
    $('#clues').innerHTML = `<span class="clue">${song.emoji || '🎵'}</span><span class="clue">Année <b>${song.year}</b></span><span class="clue">${esc(song.genre)}</span>`;
    $('#stage-status').textContent = 'Extrait indisponible — devine avec les indices';
  } else {
    $('#stage-status').textContent = G.cfg.daily ? 'Quelle est cette chanson ?' : 'Écoute bien…';
  }

  G.phase = 'playing';
  G.t0 = performance.now();
  G.lastSec = null;
  disc.classList.add('is-spinning');
  $('#eq').classList.add('is-playing');
  $$('.choice').forEach(b => { b.disabled = false; });
  hintBtn.disabled = false;
  if (G.cfg.mode === 'type' && matchMedia('(pointer: fine)').matches) $('#type-input').focus();
  loop(token);
}

function setTimer(frac, secs) {
  const low = secs <= 5;
  const ring = $('#ring-fg');
  ring.style.strokeDashoffset = String(100 * (1 - Math.max(0, Math.min(1, frac))));
  ring.classList.toggle('is-low', low && secs > 0);
  const num = $('#timer-num');
  num.textContent = Math.max(0, Math.ceil(secs));
  num.classList.toggle('is-low', low && secs > 0);
}

function loop(token) {
  if (token !== G.token || G.phase !== 'playing') return;
  const left = G.dur - (performance.now() - G.t0) / 1000;
  setTimer(left / G.dur, left);
  const sec = Math.ceil(left);
  if (sec !== G.lastSec) {
    G.lastSec = sec;
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
  const song = G.song, elapsed = (performance.now() - G.t0) / 1000;
  let pts = 0;
  if (ok) {
    G.combo++;
    G.bestCombo = Math.max(G.bestCombo, G.combo);
    pts = points();
    G.score += pts;
    sfx.right(G.combo);
    buzz(35);
    flyPoints(`+${fmt(pts)}`, sourceEl || $('#disc'));
    if (G.combo >= 2) {
      const c = $('#combo');
      c.textContent = `🔥 COMBO ×${G.combo}`;
      c.classList.remove('is-on'); void c.offsetWidth; c.classList.add('is-on');
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
        setTimeout(() => { sfx.booster(); buzz([30, 50, 30]); toast('🎁 Booster gagné ! Ouvre-le à la fin de la partie'); }, 450);
      }
    }
  } else {
    if (G.combo >= 3) toast(`Combo ×${G.combo} cassé 💔`);
    G.combo = 0;
    reason === 'timeout' ? sfx.timeout() : sfx.wrong();
    buzz([50, 40, 50]);
  }
  G.results.push({ song, ok, pts, time: elapsed, art: G.pv?.art || null });

  $('#disc').classList.remove('is-spinning');
  $('#disc').classList.add('is-revealed');
  $('#tonearm').classList.remove('is-on');
  $('#eq').classList.remove('is-playing');
  stopBeat();
  $('#btn-hint').disabled = true;
  $$('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.id === song.id) b.classList.add('is-right');
  });
  $('#type-input').blur();
  $('#suggest').innerHTML = '';
  setTimer(ok ? (G.dur - elapsed) / G.dur : 0, ok ? G.dur - elapsed : 0);
  $('#timer-num').classList.remove('is-low');
  $('#ring-fg').classList.remove('is-low');

  const v = $('#reveal-verdict');
  v.className = `reveal-verdict ${ok ? 'ok' : 'ko'}`;
  v.textContent = ok ? (G.combo >= 3 ? 'En feu !' : pickOne(['Bien joué !', 'Trouvé !', 'Imparable !', 'Oreille d’or !']))
    : reason === 'timeout' ? 'Temps écoulé' : 'Raté !';
  $('#reveal-title').textContent = song.title;
  $('#reveal-artist').textContent = `${song.artist} · ${song.year}`;
  $('#reveal').hidden = false;
  $('#clues').hidden = true;
  $('#stage-status').textContent = '';

  const last = G.i >= G.songs.length - 1;
  const next = $('#btn-next');
  next.querySelector('span').textContent = last ? 'Voir les résultats' : 'Suivant';
  next.hidden = false;
  const bar = $('#next-progress');
  const wait = G.cfg.daily ? 4200 : 3600;
  bar.style.transition = 'none'; bar.style.width = '0';
  void bar.offsetWidth;
  bar.style.transition = `width ${wait}ms linear`; bar.style.width = '100%';
  const token = G.token;
  G.autoNext = setTimeout(() => { if (token === G.token && G.phase === 'reveal') nextRound(); }, wait);
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
  $('#attempts').textContent = `${'●'.repeat(left)}${'○'.repeat(max - left)}  ${plural(left, 'essai restant', 'essais restants')}`;
}
function submitText(text, pickedId) {
  if (G.phase !== 'playing') return;
  if (!text.trim() && !pickedId) return;
  const input = $('#type-input');
  if (!pickedId && cleanTitle(text).length < 2) { toast('Un peu court… tape le titre 😉'); input.focus(); return; }
  const picked = pickedId && SONG.get(pickedId);
  const verdict = picked ? (picked.id === G.song.id || cleanTitle(picked.title) === cleanTitle(G.song.title) ? 'title' : null) : judge(text, G.song);
  if (verdict === 'title') return finishRound(true, 'right', input);
  if (verdict === 'artist' && !picked) {
    toast('Bon artiste ! Et le titre ? 👀');
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
  let xp;
  if (G.cfg.daily) {
    const won = found === 1;
    xp = won ? 150 : 20;
    if (won) { store.boosters++; G.boostersWon++; }
    store.daily = { date: dayKey(), won, tries: won ? G.tries + 1 : G.cfg.attempts, done: true, title: G.song.title, artist: G.song.artist };
  } else {
    xp = Math.round(G.score / 25) + found * 5;
  }
  const record = !G.cfg.daily && G.score > store.best && G.score > 0;
  if (record) store.best = G.score;
  if (!G.cfg.daily) store.games++;
  store.found += found;
  store.played += n;
  const levels = addXP(xp);
  G.boostersWon += levels;
  const streakUp = recordPlay();
  save();
  const after = levelOf(store.xp);

  $('#res-kicker').textContent = G.cfg.daily ? 'Défi du jour' : `${catById(G.cfg.cat).name} · ${G.cfg.mode === 'type' ? 'saisie' : '4 choix'}`;
  $('#res-record').hidden = !record;
  $('#res-line').textContent = G.cfg.daily
    ? (found ? `Trouvé en ${plural(G.tries + 1, 'essai', 'essais')} !` : 'Pas cette fois… reviens demain !')
    : `${found}/${n} trouvée${found > 1 ? 's' : ''}${found === n && n > 0 ? ' — sans faute !' : ''}`;
  $('#res-combo').textContent = `×${G.bestCombo}`;
  const okTimes = G.results.filter(r => r.ok).map(r => r.time);
  $('#res-time').textContent = okTimes.length ? `${(okTimes.reduce((a, b) => a + b, 0) / okTimes.length).toFixed(1).replace('.', ',')} s` : '–';
  $('#res-xp').textContent = `+${xp}`;
  $('#res-level').textContent = after.lvl;
  $('#res-level-fill').style.width = '0';
  $('#recap').innerHTML = G.results.map((r, i) => `
    <li class="${r.ok ? 'ok' : 'ko'}" style="animation-delay:${.15 + i * .05}s">
      <span class="recap-art">${coverHTML(r.song, r.art)}</span>
      <span class="recap-txt"><b>${esc(r.song.title)}</b><span>${esc(r.song.artist)} · ${r.song.year}</span></span>
      <span class="recap-pts">${r.ok ? (G.cfg.daily ? '✓' : `+${fmt(r.pts)}`) : '—'}</span>
    </li>`).join('');
  $('#btn-replay').textContent = G.cfg.daily ? 'Jouer' : 'Rejouer';
  renderResBooster();
  show('results');

  const el = $('#res-score');
  if (G.cfg.daily) el.textContent = found ? '+150 XP' : 'Raté';
  else {
    const target = G.score, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 900); el.textContent = fmt(target * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  setTimeout(() => { $('#res-level-fill').style.width = `${Math.round(after.pct * 100)}%`; }, 250);

  if (record || (G.cfg.daily && found) || (found === n && n >= 5)) { sfx.fanfare(); confetti(); }
  if (levels) setTimeout(() => { toast(`Niveau ${after.lvl} atteint ! +${plural(levels, 'booster', 'boosters')} 🎁`, 2800); confetti(40); }, 900);
  if (streakUp) setTimeout(showStreak, 1300);
}
function renderResBooster() {
  const box = $('#res-booster'), won = G.boostersWon || 0, n = store.boosters;
  box.classList.toggle('is-earned', won > 0);
  $('#rb-title').textContent = won ? `🎁 +${plural(won, 'booster', 'boosters')} !` : 'Jauge booster';
  $('#rb-fill').style.width = `${store.gauge / GAUGE_MAX * 100}%`;
  $('#rb-txt').textContent = `${store.gauge}/${GAUGE_MAX} bonnes réponses${n ? ` · ${plural(n, 'booster', 'boosters')} en stock` : ''}`;
  const btn = $('#rb-open');
  btn.hidden = n === 0;
  btn.textContent = n > 1 ? `Ouvrir (${n})` : 'Ouvrir';
}

function showStreak() {
  const n = store.streak.count;
  $('#streak-n').textContent = n;
  $('#streak-label').textContent = n > 1 ? 'jours d’affilée' : 'jour de série';
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
  const grid = G.results.map(r => (r.ok ? '🟩' : '🟥')).join('');
  const text = G.cfg.daily
    ? `🎵 Pompelup — Défi du ${new Date().toLocaleDateString('fr-FR')} : ${found ? `trouvé en ${plural(G.tries + 1, 'essai', 'essais')} 🔥` : 'raté 😭'}`
    : `🎵 Pompelup — ${fmt(G.score)} pts · ${found}/${G.results.length} ${grid}\nMeilleur combo ×${G.bestCombo}. Tu fais mieux ?`;
  const url = location.href.split(/[?#]/)[0];
  const copy = () => {
    if (!navigator.clipboard) { toast('Partage indisponible ici'); return; }
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => toast('Copié ! Colle-le à tes potes 📋'), () => toast('Partage indisponible ici'));
  };
  if (navigator.share) navigator.share({ title: 'Pompelup', text, url }).catch(e => { if (e?.name !== 'AbortError') copy(); });
  else copy();
}

/* ================= BOOSTERS ================= */
let BO = null;

function makeBooster() {
  const welcome = store.opened === 0;
  const cards = [], used = new Set();
  for (let k = 0; k < 3; k++) {
    const rarity = roll(k === 2 ? (welcome ? ODDS_WELCOME : ODDS_LAST) : ODDS);
    const pool = BY_RARITY[rarity].filter(s => !used.has(s.id));
    const fresh = pool.filter(s => !store.coll[s.id]);
    const src = fresh.length && Math.random() < .75 ? fresh : pool;
    const song = pickOne(src);
    used.add(song.id);
    cards.push({ song, rarity });
  }
  return cards.sort((a, b) => RANK[a.rarity] - RANK[b.rarity]);
}
function commitBooster(cards) {
  store.boosters = Math.max(0, store.boosters - 1);
  store.opened++;
  let xp = 0;
  for (const c of cards) {
    const e = store.coll[c.song.id];
    c.isNew = !e;
    if (e) { e.n++; c.dupXp = DUP_XP[c.rarity]; xp += c.dupXp; }
    else store.coll[c.song.id] = { n: 1, t: Date.now(), seen: false };
  }
  const levels = xp ? addXP(xp) : 0;
  save();
  return levels;
}

function openBooster() {
  if (store.boosters <= 0) { toast('Pas de booster… trouve des chansons pour en gagner ! 🎁'); return; }
  unlockAudio();
  stopMusic();
  try { listen.pause(); } catch (e) {}
  const cards = makeBooster();
  const best = cards[cards.length - 1].rarity;
  BO = { cards, idx: 0, state: 'pack', best, welcome: store.opened === 0 };
  cards.forEach(c => { c.art = knownArt(c.song.id); getArt(c.song).then(a => { if (a) c.art = a; }); });

  const bo = $('#booster'), pack = $('#pack');
  bo.hidden = false;
  bo.className = 'bo';
  bo.style.setProperty('--glow', 'rgba(249,115,22,.32)');
  bo.style.setProperty('--ray', 'rgba(255,255,255,.05)');
  pack.className = 'pack';
  pack.hidden = false;
  pack.style.setProperty('--tear', 0);
  pack.style.setProperty('--leak', R_COLOR[best]);
  $('#vstack').innerHTML = '';
  $('#bo-fx').innerHTML = '';
  $('#bo-stage').hidden = false;
  $('#bo-summary').hidden = true;
  $('#bo-hint').hidden = false;
  $('#bo-hint').textContent = 'Glisse ton doigt sur le booster pour le déchirer';
  $('#bo-count').textContent = BO.welcome ? 'Booster de bienvenue' : 'Booster vinyle';
  $('#bo-left').textContent = store.boosters > 1 ? `×${store.boosters}` : '';
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
  const levels = commitBooster(BO.cards);
  BO.levels = levels;
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
  const s = c.song;
  return `<div class="vc r-${c.rarity}" data-i="${i}" style="--sc:${s.color || '#6D28D9'}" role="button" tabindex="-1" aria-label="Vinyle ${i + 1} sur 3">
    <div class="vc-flip">
      <div class="vc-back"><span class="vc-back-logo">Pompe<span>lup</span></span><span class="vc-back-q">?</span><span class="vc-back-tap">Tape pour révéler</span></div>
      <div class="vc-front">
        <div class="vc-disc"><div class="vc-disc-spin"><div class="vc-label">${c.art ? `<img src="${esc(c.art)}" alt="">` : ''}</div></div></div>
        <div class="vc-sleeve">${coverHTML(s, c.art)}</div>
      </div>
    </div>
    <div class="vc-info">
      <span class="rar-pill r-${c.rarity}">${R_ICON[c.rarity]} ${R_NAME[c.rarity]}</span>
      <div class="vc-title">${esc(s.title)}</div>
      <div class="vc-artist">${esc(s.artist)} · ${s.year}</div>
      ${c.isNew ? '<span class="vc-tag is-new">Nouveau !</span>' : `<span class="vc-tag is-dup">Doublon · +${c.dupXp} XP</span>`}
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
    confetti(70, ['#FBBF24', '#FDE68A', '#F59E0B', '#FFFFFF']);
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
    if (star) s.textContent = '✦';
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
  bo.style.setProperty('--glow', 'rgba(249,115,22,.28)');
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
  $('#bo-sum-title').textContent = best === 'legendary' ? 'Légendaire ! 🏆' : fresh === 3 ? '3 nouveaux vinyles !' : fresh ? `${plural(fresh, 'nouveau vinyle', 'nouveaux vinyles')} !` : 'Que des doublons… +XP !';
  $('#bo-sum-grid').innerHTML = cards.map(c => `
    <div class="bs r-${c.rarity}">
      <span class="bs-cover">${coverHTML(c.song, c.art)}</span>
      <span class="rar-pill r-${c.rarity}">${R_NAME[c.rarity]}</span>
      <b>${esc(c.song.title)}</b>
    </div>`).join('');
  const n = store.boosters;
  $('#bo-next').textContent = n ? `Ouvrir le suivant (${n})` : 'Continuer';
  $('#bo-summary').hidden = false;
  $('#bo-left').textContent = '';
  if (BO.levels) toast(`Niveau ${levelOf(store.xp).lvl} ! +${plural(BO.levels, 'booster', 'boosters')} 🎁`, 2600);
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
  const nb = store.boosters, ob = $('#coll-open');
  $('#coll-boosters').textContent = nb;
  ob.classList.toggle('has-boosters', nb > 0);

  const counts = Object.fromEntries(RARITIES.map(r => [r, 0]));
  ids.forEach(id => counts[RARITY.get(id)]++);
  $('#rar-filter').innerHTML = [['all', 'Tous', ids.length, total], ...RARITIES.slice().reverse().map(r => [r, R_NAMES[r], counts[r], BY_RARITY[r].length])]
    .map(([k, label, have, of]) => `<button class="rf ${k === 'all' ? '' : `r-${k}`}" type="button" role="radio" data-r="${k}" aria-checked="${COLL.filter === k}">${k === 'all' ? '' : '<i></i>'}${label} <small>${have}/${of}</small></button>`).join('');

  const list = ids.filter(id => COLL.filter === 'all' || RARITY.get(id) === COLL.filter)
    .sort((a, b) => (RANK[RARITY.get(b)] - RANK[RARITY.get(a)]) || (store.coll[b].t - store.coll[a].t));
  $('#coll-empty').hidden = ids.length > 0;
  $('#coll-empty-play').textContent = nb ? 'Ouvrir mon booster' : 'Jouer une partie';
  const grid = $('#coll-grid');
  grid.hidden = ids.length === 0;
  if (ids.length && !list.length) {
    grid.innerHTML = `<p class="coll-more" style="color:var(--ink-3);text-align:center;margin:20px 0">Aucun vinyle ${R_NAME[COLL.filter].toLowerCase()} pour l’instant.</p>`;
    return;
  }
  const shown = list.slice(0, COLL.shown);
  grid.innerHTML = shown.map((id, i) => {
    const s = SONG.get(id), r = RARITY.get(id), e = store.coll[id];
    return `<button class="vt r-${r}" type="button" data-id="${id}" style="animation-delay:${Math.min(i, 18) * .02}s" aria-label="${esc(s.title)} — ${esc(s.artist)}, ${R_NAME[r].toLowerCase()}">
      <span class="vt-cover"><span class="vt-disc"></span><span class="vt-sleeve">${coverHTML(s)}</span>${e.seen === false ? '<span class="vt-new">NEW</span>' : e.n > 1 ? `<span class="vt-n">×${e.n}</span>` : ''}</span>
      <span class="vt-title">${esc(s.title)}</span><span class="vt-artist">${esc(s.artist)}</span>
    </button>`;
  }).join('') + (list.length > shown.length ? `<button class="btn-secondary coll-more" id="coll-more" type="button">Voir plus (${list.length - shown.length})</button>` : '');

  tileObserver?.disconnect();
  tileObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      tileObserver.unobserve(en.target);
      const s = SONG.get(en.target.dataset.id);
      if (s && !knownArt(s.id)) queueArt(s, a => fillCover(en.target, a));
    });
  }, { rootMargin: '200px' }) : null;
  $$('.vt', grid).forEach(t => tileObserver?.observe(t));

  let changed = false;
  ids.forEach(id => { if (store.coll[id].seen === false) { store.coll[id].seen = true; changed = true; } });
  if (changed) save();
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
  pill.textContent = `${R_ICON[r]} ${R_NAME[r]}`;
  $('#vs-title').textContent = s.title;
  $('#vs-meta').textContent = `${s.artist} · ${s.year} · ${s.genre}`;
  $('#vs-own').textContent = `${plural(e.n, 'exemplaire', 'exemplaires')} · obtenu le ${new Date(e.t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
  $('#vs-play').textContent = '▶ Écouter';
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
  if (!listen.paused) { listen.pause(); btn.textContent = '▶ Écouter'; vis.classList.remove('is-playing'); return; }
  const s = vsSong;
  btn.textContent = 'Chargement…';
  const pv = await fetchPreview(s);
  if (vsSong !== s) return;
  if (!pv) { btn.textContent = '▶ Écouter'; toast('Extrait indisponible pour ce vinyle'); return; }
  listen.src = pv.url;
  listen.currentTime = 0;
  listen.play().then(() => { btn.textContent = '⏸ Pause'; vis.classList.add('is-playing'); }, () => { btn.textContent = '▶ Écouter'; toast('Lecture impossible'); });
}
listen.addEventListener('ended', () => { $('#vs-play').textContent = '▶ Écouter'; $('#vs-visual').classList.remove('is-playing'); });

/* ---------------- Événements ---------------- */
$('#btn-play').addEventListener('click', () => {
  const p = store.prefs;
  startGame({ cat: p.cat, mode: p.mode, rounds: p.rounds });
});
$('#daily-card').addEventListener('click', () => {
  if (dailyToday()) { toast(`Nouveau défi dans ${hms(msToMidnight())} ⏳`); return; }
  startGame({ daily: true, mode: 'type', rounds: 1, attempts: 3, candidates: dailySongCandidates() });
});
$('#home-streak').addEventListener('click', () => {
  const s = currentStreak();
  toast(playedToday() ? `🔥 ${plural(s, 'jour', 'jours')} d’affilée — bravo !` : s ? `Joue aujourd’hui pour garder ta série de ${s} 🔥` : 'Joue une partie pour lancer ta série 🔥');
});
$('#cat-list').addEventListener('click', e => { const b = e.target.closest('.cat'); if (!b) return; store.prefs.cat = b.dataset.cat; save(); renderHome(); });
$('#mode-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; store.prefs.mode = b.dataset.mode; save(); renderHome(); });
$('#rounds-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; store.prefs.rounds = +b.dataset.rounds; save(); renderHome(); });
$('#btn-open-booster').addEventListener('click', e => { e.stopPropagation(); store.boosters ? openBooster() : show('collection'); });
$('#booster-card').addEventListener('click', () => { store.boosters ? openBooster() : show('collection'); });
$('#coll-card').addEventListener('click', () => show('collection'));

$('#choices').addEventListener('click', e => { const b = e.target.closest('.choice'); if (b) onChoice(b); });
$('#type-box').addEventListener('submit', e => { e.preventDefault(); submitText($('#type-input').value); });
$('#type-input').addEventListener('input', e => renderSuggestions(e.target.value));
$('#suggest').addEventListener('click', e => {
  const b = e.target.closest('.sug'); if (!b) return;
  $('#type-input').value = b.querySelector('b').textContent;
  submitText(b.querySelector('b').textContent, b.dataset.id);
});
$('#btn-hint').addEventListener('click', useHint);
$('#btn-next').addEventListener('click', nextRound);
$('#btn-quit').addEventListener('click', () => {
  if (G.phase === 'done' || G.phase === 'idle') return show('home');
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
$('#bo-next').addEventListener('click', () => { if (store.boosters) openBooster(); else closeBooster(); });
$('#bo-to-coll').addEventListener('click', () => { closeBooster(); show('collection'); });

// Collection
$('#coll-back').addEventListener('click', () => show('home'));
$('#coll-open').addEventListener('click', openBooster);
$('#coll-empty-play').addEventListener('click', () => {
  if (store.boosters) openBooster();
  else { const p = store.prefs; startGame({ cat: p.cat, mode: p.mode, rounds: p.rounds }); }
});
$('#rar-filter').addEventListener('click', e => { const b = e.target.closest('.rf'); if (!b) return; COLL.filter = b.dataset.r; COLL.shown = 60; renderCollection(); });
$('#coll-grid').addEventListener('click', e => {
  if (e.target.closest('#coll-more')) { COLL.shown += 60; renderCollection(); return; }
  const t = e.target.closest('.vt'); if (t) openVinyl(t.dataset.id);
});
$('#vs-close').addEventListener('click', closeVinyl);
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
  if (!$('#vinyl-sheet').hidden && e.key === 'Escape') { closeVinyl(); return; }
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

if (/[?&]debug\b/.test(location.search)) window.__PQ = { G, store, save, openBooster, get BO() { return BO; }, RARITY, BY_RARITY };
show('home');
})();
