/* ============================================
   Pompelup Web — Gartic-inspired with sidebar
   ============================================ */

const STATE = {
  player: { name: 'Guigz', avatar: 'guigz-vibe', level: 12, xp: 847, tokens: 142 },
  packsAvailable: 1,
  presenter: 'dj-funky',
  room: { code: 'K9XQ4P', mode: 'classic', rounds: 5, duration: 30 },
  animDensity: 'normal',
  bots: [
    { name: 'Cath',  seed: 'cath-vibe',   color: '#3B4FE8', level: 18, host: false, accuracy: 0.7, delay: 0.45 },
    { name: 'Jules', seed: 'jules-fresh', color: '#22C55E', level: 7,  host: false, accuracy: 0.5, delay: 0.7 },
    { name: 'Léa',   seed: 'lea-sunset',  color: '#F472B6', level: 24, host: false, accuracy: 0.65, delay: 0.55 }
  ],
  game: {
    round: 0, total: 5, time: 30, maxTime: 30,
    pointsAvail: 1000, found: false, currentSong: null,
    jokers: {},
    perRound: { points: 0, xp: 0, foundBy: 0 },
    history: []
  },
  totals: { Guigz: 0, Cath: 0, Jules: 0, 'Léa': 0 },
  scores: {}
};

const SONGS = [
  { id: 's1',  title: 'Smells Like Teen Spirit',      artist: 'Nirvana',           year: 1991, emoji: '🎸', bpm: 117, color: '#F97316' },
  { id: 's2',  title: 'Billie Jean',                  artist: 'Michael Jackson',   year: 1982, emoji: '🕺', bpm: 116, color: '#3B4FE8' },
  { id: 's3',  title: 'Bohemian Rhapsody',            artist: 'Queen',             year: 1975, emoji: '👑', bpm: 144, color: '#FBBF24' },
  { id: 's4',  title: 'Lose Yourself',                artist: 'Eminem',            year: 2002, emoji: '🎤', bpm: 86,  color: '#22C55E' },
  { id: 's5',  title: 'Take On Me',                   artist: 'a-ha',              year: 1985, emoji: '📻', bpm: 169, color: '#F472B6' },
  { id: 's6',  title: 'Blinding Lights',              artist: 'The Weeknd',        year: 2019, emoji: '🌙', bpm: 171, color: '#EF4444' },
  { id: 's7',  title: 'Shape of You',                 artist: 'Ed Sheeran',        year: 2017, emoji: '💚', bpm: 96,  color: '#22C55E' },
  { id: 's8',  title: 'Uptown Funk',                  artist: 'Mark Ronson',       year: 2014, emoji: '🕶️', bpm: 115, color: '#F97316' },
  { id: 's9',  title: 'Rolling in the Deep',          artist: 'Adele',             year: 2010, emoji: '🖤', bpm: 105, color: '#374151' },
  { id: 's10', title: 'Happy',                        artist: 'Pharrell Williams', year: 2013, emoji: '😊', bpm: 160, color: '#FBBF24' },
  { id: 's11', title: 'Get Lucky',                    artist: 'Daft Punk',         year: 2013, emoji: '🤖', bpm: 116, color: '#FBBF24' },
  { id: 's12', title: "Stayin' Alive",                artist: 'Bee Gees',          year: 1977, emoji: '🪩', bpm: 103, color: '#8B5CF6' },
  { id: 's13', title: 'Africa',                       artist: 'Toto',              year: 1982, emoji: '🌍', bpm: 93,  color: '#22C55E' },
  { id: 's14', title: "Sweet Child O' Mine",          artist: "Guns N' Roses",     year: 1987, emoji: '🎸', bpm: 122, color: '#EF4444' },
  { id: 's15', title: 'Hotel California',             artist: 'Eagles',            year: 1977, emoji: '🏨', bpm: 75,  color: '#A16207' },
  { id: 's16', title: 'Like a Prayer',                artist: 'Madonna',           year: 1989, emoji: '🙏', bpm: 128, color: '#8B5CF6' },
  { id: 's17', title: 'Mr. Brightside',               artist: 'The Killers',       year: 2003, emoji: '🌅', bpm: 148, color: '#F97316' },
  { id: 's18', title: 'Somebody That I Used to Know', artist: 'Gotye',             year: 2011, emoji: '💔', bpm: 129, color: '#3B4FE8' },
  { id: 's19', title: 'Pumped Up Kicks',              artist: 'Foster the People', year: 2010, emoji: '👟', bpm: 128, color: '#F472B6' },
  { id: 's20', title: 'Chandelier',                   artist: 'Sia',               year: 2014, emoji: '💡', bpm: 124, color: '#FBBF24' },
  { id: 's21', title: 'Levitating',                   artist: 'Dua Lipa',          year: 2020, emoji: '🚀', bpm: 103, color: '#8B5CF6' },
  { id: 's22', title: 'drivers license',              artist: 'Olivia Rodrigo',    year: 2021, emoji: '🚗', bpm: 75,  color: '#3B4FE8' },
  { id: 's23', title: 'Watermelon Sugar',             artist: 'Harry Styles',      year: 2020, emoji: '🍉', bpm: 95,  color: '#EF4444' },
  { id: 's24', title: 'Dance Monkey',                 artist: 'Tones and I',       year: 2019, emoji: '🐒', bpm: 98,  color: '#F97316' },
  { id: 's25', title: 'Thunder',                      artist: 'Imagine Dragons',   year: 2017, emoji: '⚡', bpm: 168, color: '#FBBF24' },
  { id: 's26', title: 'Shallow',                      artist: 'Lady Gaga',         year: 2018, emoji: '🎬', bpm: 96,  color: '#3B4FE8' },
  { id: 's27', title: 'Bad Guy',                      artist: 'Billie Eilish',     year: 2019, emoji: '😈', bpm: 135, color: '#22C55E' },
  { id: 's28', title: 'Old Town Road',                artist: 'Lil Nas X',         year: 2019, emoji: '🤠', bpm: 136, color: '#F97316' },
  { id: 's29', title: 'Despacito',                    artist: 'Luis Fonsi',        year: 2017, emoji: '🎵', bpm: 89,  color: '#F472B6' },
  { id: 's30', title: 'Believer',                     artist: 'Imagine Dragons',   year: 2017, emoji: '✊', bpm: 125, color: '#EF4444' },
];

const FRIENDS = [
  { name: 'Cath',   code: 'Cath#7281',   seed: 'cath-vibe',    level: 18, online: 'playing', status: 'En partie · Mode Rush' },
  { name: 'Jules',  code: 'Jules#0024',  seed: 'jules-fresh',  level: 7,  online: 'online',  status: 'En ligne · Disponible' },
  { name: 'Léa',    code: 'Lea#9912',    seed: 'lea-sunset',   level: 24, online: 'online',  status: 'Dans le salon Boogie' },
  { name: 'Marco',  code: 'Marco#3344',  seed: 'marco-disco',  level: 31, online: 'offline', status: 'Hier soir' },
  { name: 'Sofia',  code: 'Sofia#1122',  seed: 'sofia-stars',  level: 14, online: 'offline', status: 'Il y a 3 jours' },
  { name: 'Tom',    code: 'Tom#5566',    seed: 'tom-fresh',    level: 9,  online: 'online',  status: 'En ligne · Pause' },
  { name: 'Nour',   code: 'Nour#7790',   seed: 'nour-wave',    level: 22, online: 'offline', status: 'La semaine dernière' }
];

const COLLECTION_DATA = [
  { title: 'Voyage Voyage',      artist: 'Desireless',   rarity: 'rare',       label: '#F472B6', year: 1986, genre: 'Pop',        plays: 12, locked: false },
  { title: 'Joe le Taxi',        artist: 'V. Paradis',   rarity: 'common',     label: '#F97316', year: 1987, genre: 'Pop',        plays: 5,  locked: false },
  { title: 'Stayin\' Alive',     artist: 'Bee Gees',     rarity: 'legendary',  label: '#FBBF24', year: 1977, genre: 'Disco',      plays: 28, locked: false, isNew: true },
  { title: 'Africa',             artist: 'Toto',         rarity: 'rare',       label: '#22C55E', year: 1982, genre: 'Pop Rock',   plays: 9,  locked: false },
  { title: 'Sweet Dreams',       artist: 'Eurythmics',   rarity: 'common',     label: '#3B4FE8', year: 1983, genre: 'Synthpop',   plays: 7,  locked: false },
  { title: 'Take On Me',         artist: 'a-ha',         rarity: 'rare',       label: '#8B5CF6', year: 1985, genre: 'Synthpop',   plays: 14, locked: false },
  { title: 'Billie Jean',        artist: 'M. Jackson',   rarity: 'legendary',  label: '#FBBF24', year: 1982, genre: 'Pop',        plays: 41, locked: false },
  { title: 'Wonderwall',         artist: 'Oasis',        rarity: 'common',     label: '#F97316', year: 1995, genre: 'Britpop',    plays: 11, locked: false },
  { title: 'Hey Ya!',            artist: 'OutKast',      rarity: 'rare',       label: '#F472B6', year: 2003, genre: 'Hip-Hop',    plays: 18, locked: false },
  { title: 'Smells Like...',     artist: 'Nirvana',      rarity: 'rare',       label: '#EF4444', year: 1991, genre: 'Grunge',     plays: 16, locked: false },
  { title: 'Bohemian Rhapsody',  artist: 'Queen',        rarity: 'legendary',  label: '#FBBF24', year: 1975, genre: 'Rock',       plays: 52, locked: false, isNew: true },
  { title: 'Like a Prayer',      artist: 'Madonna',      rarity: 'common',     label: '#A78BFA', year: 1989, genre: 'Pop',        plays: 6,  locked: false },
  { title: 'Lose Yourself',      artist: 'Eminem',       rarity: 'rare',       label: '#16A34A', year: 2002, genre: 'Rap',        plays: 21, locked: false },
  { title: 'Get Lucky',          artist: 'Daft Punk',    rarity: 'rare',       label: '#FBBF24', year: 2013, genre: 'Electro',    plays: 19, locked: false },
  { title: 'Hotel California',   artist: 'Eagles',       rarity: 'common',     label: '#A16207', year: 1976, genre: 'Rock',       plays: 4,  locked: false },
  { title: 'Imagine',            artist: 'J. Lennon',    rarity: 'rare',       label: '#3B82F6', year: 1971, genre: 'Pop Rock',   plays: 8,  locked: false },
  { title: '???',                artist: '???',          rarity: 'common',     label: '#888',    year: null, genre: '—',          plays: 0,  locked: true },
  { title: '???',                artist: '???',          rarity: 'rare',       label: '#888',    year: null, genre: '—',          plays: 0,  locked: true },
  { title: '???',                artist: '???',          rarity: 'common',     label: '#888',    year: null, genre: '—',          plays: 0,  locked: true },
  { title: '???',                artist: '???',          rarity: 'common',     label: '#888',    year: null, genre: '—',          plays: 0,  locked: true },
  { title: '???',                artist: '???',          rarity: 'legendary',  label: '#888',    year: null, genre: '—',          plays: 0,  locked: true },
  { title: '???',                artist: '???',          rarity: 'common',     label: '#888',    year: null, genre: '—',          plays: 0,  locked: true },
  { title: '???',                artist: '???',          rarity: 'rare',       label: '#888',    year: null, genre: '—',          plays: 0,  locked: true },
  { title: '???',                artist: '???',          rarity: 'legendary',  label: '#888',    year: null, genre: '—',          plays: 0,  locked: true }
];
const COLLECTION_DATA_IDX = COLLECTION_DATA.map((v, i) => Object.assign({}, v, { _idx: i }));

const HISTORY = [
  { place: 1, mode: 'Classic',   players: ['cath-vibe', 'jules-fresh', 'lea-sunset'],   pts: 4720, when: 'Il y a 2h' },
  { place: 2, mode: 'Tune Rush', players: ['marco-disco', 'cath-vibe', 'tom-fresh'],    pts: 3180, when: 'Il y a 5h' },
  { place: 1, mode: 'Pistes',    players: ['jules-fresh', 'sofia-stars'],               pts: 5620, when: 'Hier soir' },
  { place: 3, mode: 'Classic',   players: ['cath-vibe', 'lea-sunset', 'nour-wave', 'jules-fresh'], pts: 2890, when: 'Hier matin' },
  { place: 1, mode: 'Tune Rush', players: ['marco-disco', 'tom-fresh'],                 pts: 4100, when: 'Avant-hier' },
  { place: 4, mode: 'Classic',   players: ['jules-fresh', 'sofia-stars', 'nour-wave', 'lea-sunset'], pts: 1980, when: 'Il y a 3 jours' },
  { place: 2, mode: 'Pistes',    players: ['cath-vibe', 'lea-sunset'],                  pts: 3520, when: 'Il y a 3 jours' },
  { place: 1, mode: 'Classic',   players: ['tom-fresh', 'marco-disco'],                 pts: 4980, when: 'Il y a 4 jours' }
];

const PAGE_INFO = {
  home:       { title: 'ACCUEIL',     sub: 'Yo Guigz — prêt à lancer une partie ?' },
  quests:     { title: 'QUÊTES',      sub: '6 quêtes actives · 1 récompense à récupérer' },
  pass:       { title: 'GROOVY PASS', sub: 'Saison 03 · Boogie Woogie' },
  friends:    { title: 'AMIS',        sub: '7 amis · 3 en ligne · 2 demandes en attente' },
  history:    { title: 'HISTOIRE',    sub: 'Tes 142 dernières parties' },
  collection: { title: 'COLLECTION',  sub: '34 / 180 vinyles débloqués' },
  skins:      { title: 'MON PROFIL',  sub: 'Skin · Lobby · Sons — fais-en ton spot' },
  shop:       { title: 'BOUTIQUE',    sub: 'Dépense tes mics, deviens la légende' },
  lobby:      { title: 'SALON',       sub: 'En attente du lancement' },
  game:       { title: 'PARTIE',      sub: 'Mode Classic · 5 manches' },
  results:    { title: 'RÉSULTATS',   sub: 'Partie terminée' }
};

const SCREENS_WITHOUT_CHROME = ['lobby', 'game', 'results'];

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const escHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const avatarUrl = (seed) => {
  if (!seed) return '';
  if (seed.startsWith('data:') || seed.startsWith('http://') || seed.startsWith('https://')) return seed;
  if (/\.(png|jpg|jpeg|svg|webp|gif)$/i.test(seed)) return seed;
  return `https://api.dicebear.com/9.x/big-smile/svg?seed=${encodeURIComponent(seed)}&size=128&radius=50&backgroundColor=ffd5dc,c0aede,b6e3f4,fff1e4,fad9c1`;
};

function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ').trim();
}
function similarity(a, b) {
  a = normalize(a); b = normalize(b);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const al = a.length, bl = b.length;
  const mat = Array.from({ length: bl + 1 }, (_, i) =>
    Array.from({ length: al + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= bl; i++)
    for (let j = 1; j <= al; j++)
      mat[i][j] = b[i - 1] === a[j - 1]
        ? mat[i - 1][j - 1]
        : 1 + Math.min(mat[i - 1][j], mat[i][j - 1], mat[i - 1][j - 1]);
  return 1 - mat[bl][al] / Math.max(al, bl, 1);
}
function checkAnswer(answer, song) {
  if (!answer.trim()) return { correct: false, partial: false };
  const sim = Math.max(
    similarity(answer, song.title),
    similarity(answer, song.artist),
    similarity(answer, `${song.title} ${song.artist}`)
  );
  if (sim >= 0.78) return { correct: true };
  if (sim >= 0.50) return { correct: false, partial: true };
  return { correct: false, partial: false };
}


// ===== NAVIGATION =====
function navigateTo(id) {
  const cur = $('.screen.active');
  const next = $('#screen-' + id);
  if (!next) return;
  if (cur === next) { onScreenEnter(id); return; }

  if (cur && cur.id === 'screen-game') stopGameLoop();

  // Sidebar / topbar / ads visibility
  const fullscreen = SCREENS_WITHOUT_CHROME.includes(id);
  $('#sidebar').classList.toggle('hidden', fullscreen);
  $('#topbar').style.display = fullscreen ? 'none' : 'flex';
  $('#content-area').classList.toggle('fullscreen', fullscreen);
  $('#tb-room').style.display = (id === 'lobby' || id === 'game') ? 'flex' : 'none';

  // Topbar title
  const info = PAGE_INFO[id];
  if (info) {
    $('#tb-title').textContent = info.title;
    $('#tb-sub').textContent = info.sub;
  }

  // Sidebar active state
  $$('.sb-item').forEach(b => b.classList.toggle('active', b.dataset.nav === id));
  // Mobile bottom nav active state (Skins/Profile, Shop, Collection, Home, Lobby)
  const mobileNavMap = { home: 'home', collection: 'collection', shop: 'shop', skins: 'skins', lobby: 'lobby' };
  const mnTarget = mobileNavMap[id];
  $$('.mn-item').forEach(b => b.classList.toggle('active', mnTarget && b.dataset.nav === mnTarget));

  gsap.to(cur, {
    opacity: 0, duration: 0.2, ease: 'power2.in',
    onComplete: () => {
      cur.classList.remove('active');
      cur.style.opacity = 1;
      next.classList.add('active');
      next.scrollTop = 0;
      gsap.fromTo(next, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      onScreenEnter(id);
    }
  });
}
function onScreenEnter(id) {
  if (id === 'home')       initHome();
  if (id === 'quests')     initQuests();
  if (id === 'pass')       initPass();
  if (id === 'friends')    initFriends();
  if (id === 'history')    initHistory();
  if (id === 'collection') initCollection();
  if (id === 'skins')      initSkins();
  if (id === 'shop')       initShop();
  if (id === 'lobby')      initLobby();
  if (id === 'game')       startGame();
  if (id === 'results')    initResults();
}
document.body.addEventListener('click', (e) => {
  const t = e.target.closest('[data-nav]');
  if (t) {
    navigateTo(t.dataset.nav);
    return;
  }
  const a = e.target.closest('[data-action]');
  if (a) {
    if (a.dataset.action === 'create-room') {
      STATE.room._isHost = true;
      STATE.room._joined = false;
      navigateTo('lobby');
    }
    if (a.dataset.action === 'play-solo') {
      openSoloModal();
    }
    if (a.dataset.action === 'join-room') {
      if (e.target.tagName !== 'INPUT') {
        const code = document.getElementById('join-code-input')?.value?.trim().toUpperCase();
        if (code && code.length === 6) {
          STATE.room.code = code;
          STATE.room._isHost = false;
          STATE.room._joined = true;
          navigateTo('lobby');
        } else if (code && code.length > 0) {
          showJoinCodeError();
        } else {
          document.getElementById('join-code-input')?.focus();
        }
      }
    }
  }
});

// ===== SOLO MODAL =====
const SOLO_STATE = { mode: 'classic', rounds: 10, diff: 'normal' };
const SOLO_BOTS = {
  easy:   [
    { name: 'Cath',  seed: 'cath-vibe',   color: '#3B4FE8', level: 6,  accuracy: 0.35, delay: 0.9 },
    { name: 'Jules', seed: 'jules-fresh', color: '#22C55E', level: 4,  accuracy: 0.25, delay: 1.1 },
    { name: 'Léa',   seed: 'lea-sunset',  color: '#F472B6', level: 5,  accuracy: 0.3,  delay: 1.0 }
  ],
  normal: [
    { name: 'Cath',  seed: 'cath-vibe',   color: '#3B4FE8', level: 18, accuracy: 0.7,  delay: 0.45 },
    { name: 'Jules', seed: 'jules-fresh', color: '#22C55E', level: 7,  accuracy: 0.5,  delay: 0.7 },
    { name: 'Léa',   seed: 'lea-sunset',  color: '#F472B6', level: 24, accuracy: 0.65, delay: 0.55 }
  ],
  hard: [
    { name: 'Cath',  seed: 'cath-vibe',   color: '#3B4FE8', level: 42, accuracy: 0.92, delay: 0.12 },
    { name: 'Jules', seed: 'jules-fresh', color: '#22C55E', level: 38, accuracy: 0.85, delay: 0.18 },
    { name: 'Léa',   seed: 'lea-sunset',  color: '#F472B6', level: 50, accuracy: 0.95, delay: 0.08 }
  ]
};

function openSoloModal() {
  document.getElementById('solo-overlay').classList.add('active');
  gsap.fromTo('.solo-sheet', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' });
}

function closeSoloModal() {
  gsap.to('.solo-sheet', { y: 40, opacity: 0, duration: 0.22, ease: 'power2.in',
    onComplete: () => document.getElementById('solo-overlay').classList.remove('active')
  });
}

function launchSolo() {
  closeSoloModal();
  STATE.room.mode = SOLO_STATE.mode;
  STATE.game.total = SOLO_STATE.rounds;
  STATE._multiPlayers = null;
  STATE.bots = SOLO_BOTS[SOLO_STATE.diff].map(b => ({ ...b }));
  STATE.totals = {};
  STATE.totals[STATE.player.name] = 0;
  STATE.bots.forEach(b => { STATE.totals[b.name] = 0; });
  const songs = [...SONGS].sort(() => Math.random() - 0.5).slice(0, STATE.game.total);
  STATE.game.songs = songs;
  setTimeout(() => navigateTo('game'), 260);
}

(function initSoloModal() {
  document.getElementById('solo-close').onclick = closeSoloModal;
  document.getElementById('solo-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSoloModal();
  });

  document.getElementById('solo-mode-seg').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-v]');
    if (!btn) return;
    $$('#solo-mode-seg [data-v]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    SOLO_STATE.mode = btn.dataset.v;
  });

  document.getElementById('solo-diff-seg').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-v]');
    if (!btn) return;
    $$('#solo-diff-seg [data-v]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    SOLO_STATE.diff = btn.dataset.v;
  });

  $$('.solo-rnd-btn').forEach(btn => {
    btn.onclick = () => {
      $$('.solo-rnd-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SOLO_STATE.rounds = parseInt(btn.dataset.r);
      document.getElementById('solo-rounds-val').textContent = btn.dataset.r;
    };
  });

  document.getElementById('solo-play-btn').onclick = launchSolo;
})();

// ===== NOTES CANVAS =====
const canvas = $('#notes-canvas');
let ctx, notes = [];
function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  for (let i = 0; i < 22; i++) {
    notes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: 0.15 + Math.random() * 0.5,
      r: 12 + Math.random() * 16,
      o: 0.08 + Math.random() * 0.18,
      ch: ['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)],
      hue: ['#F97316', '#FBBF24', '#F472B6', '#3B4FE8'][Math.floor(Math.random() * 4)]
    });
  }
}
function drawNotes() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const mult = STATE.animDensity === 'calm' ? 0.3 : STATE.animDensity === 'chaos' ? 2 : 1;
  const cnt = Math.floor(notes.length * (STATE.animDensity === 'calm' ? 0.4 : 1));
  for (let i = 0; i < cnt; i++) {
    const n = notes[i];
    ctx.font = `${n.r * 2}px "Bebas Neue", serif`;
    ctx.fillStyle = n.hue;
    ctx.globalAlpha = n.o;
    ctx.fillText(n.ch, n.x, n.y);
    n.y -= n.v * mult;
    if (n.y < -30) { n.y = canvas.height + 10; n.x = Math.random() * canvas.width; }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawNotes);
}

// ===== SIDEBAR INIT =====
function refreshSidebar() {
  $('#sb-avatar').src = avatarUrl(STATE.player.avatar);
  $('#sb-name').textContent = STATE.player.name;
  $('#sb-tokens').textContent = STATE.player.tokens;
  if ($('#you-chat-avatar')) $('#you-chat-avatar').src = avatarUrl(STATE.player.avatar);
  const mnAvt = $('#mn-avatar');
  if (mnAvt) mnAvt.src = avatarUrl(STATE.player.avatar);
}

// ===== HOME =====
function initHome() {
  const mult = STATE.animDensity === 'calm' ? 0.5 : STATE.animDensity === 'chaos' ? 1.4 : 1;
  gsap.from('.home-eyebrow', { y: -10, opacity: 0, duration: 0.4 / mult });
  gsap.from('.home-title', { y: 30, opacity: 0, duration: 0.7 / mult, ease: 'back.out(1.3)' });
  gsap.from('.home-desc', { y: 20, opacity: 0, duration: 0.4 / mult, delay: 0.2 / mult });
  gsap.from('.home-cta-card', { y: 30, opacity: 0, stagger: 0.1 / mult, duration: 0.5 / mult, delay: 0.3 / mult, ease: 'back.out(1.3)' });
  gsap.from('.disc', { scale: 0, rotation: 180, opacity: 0, stagger: 0.1 / mult, duration: 0.7 / mult, delay: 0.4 / mult, ease: 'back.out(1.5)' });
  gsap.from('.cute-tag', { scale: 0, opacity: 0, stagger: 0.1 / mult, duration: 0.4 / mult, delay: 0.9 / mult, ease: 'back.out(1.6)' });
  gsap.from('.cat-illu-card', { y: 30, opacity: 0, stagger: 0.06 / mult, duration: 0.4 / mult, delay: 0.6 / mult, ease: 'back.out(1.3)' });
  gsap.from('.act-card', { y: 20, opacity: 0, stagger: 0.08 / mult, duration: 0.4 / mult, delay: 1 / mult });

  // continuous disc spin is handled by setupVinylScratch (which also wires up scratch interactions)
  gsap.killTweensOf(['.cute-tag']);

  // gentle bob on tags
  $$('.cute-tag').forEach((t, i) => {
    gsap.to(t, { y: -8, duration: 1.4 + i * 0.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });

  // Illustration bobbing
  $$('.cat-illu-card .cat-illu').forEach((img, i) => {
    gsap.to(img, { y: -6, duration: 1.6 + (i * 0.2), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.15 });
  });
}

// ===== QUESTS =====
function initQuests() {
  gsap.from('.quest-tabs', { y: -10, opacity: 0, duration: 0.4 });
  gsap.from('.quest-card', { y: 30, opacity: 0, stagger: 0.08, duration: 0.4, ease: 'back.out(1.3)' });
}

// ===== PASS =====
function initPass() {
  const track = $('#pass-track');
  if (!track.children.length) {
    const rewards = ['🎵', '🎤', '🎁', '⭐', '🎵', '🎁', '👑', '🎤', '🎵', '🎁',
                     '⭐', '🎵', '🎤', '🎁', '🎵', '👑', '⭐', '🎵', '🎁', '🎤'];
    const premium = ['👑', '🎨', '💎', '🎵', '✨', '🎁', '👑', '🎤', '🎚️', '💎',
                     '🎨', '🎵', '👑', '🎁', '🎤', '💎', '👑', '🎵', '⭐', '🎁'];
    const labels = ['20 🎤', 'XP+', 'PACK', '50 XP', '40 🎤', 'PACK', 'PACK★', 'XP+', '30 🎤', 'PACK',
                    '70 XP', '50 🎤', 'XP+', 'PACK', '60 🎤', 'PACK★', '90 XP', '80 🎤', '+XP', 'PACK'];
    const premLabels = ['SKIN', 'EMOTE', '50 🎤', 'XP+', 'BADGE', 'PACK★', 'SKIN', 'EMOTE', 'PACK★', '80 🎤',
                        'BADGE', 'XP++', 'SKIN★', 'PACK★', 'EMOTE', '100 🎤', 'SKIN★', 'XP++', 'BADGE', 'PACK★'];
    let html = '';
    for (let i = 0; i < 20; i++) {
      const num = i + 1;
      const claimed = i < 14;
      const current = i === 16;
      html += `
        <div class="pass-tier-col ${current ? 'current' : ''}">
          <div class="pass-tier-num">${num.toString().padStart(2, '0')}</div>
          <div class="pass-reward ${claimed ? 'claimed' : i > 17 ? 'locked' : ''}">
            <span>${rewards[i]}</span>
            <span class="lbl">${labels[i]}</span>
          </div>
          <div class="pass-reward premium ${claimed ? 'claimed' : i > 17 ? 'locked' : ''}">
            <span>${premium[i]}</span>
            <span class="lbl">${premLabels[i]}</span>
          </div>
        </div>
      `;
    }
    track.innerHTML = html;
  }
  gsap.from('.pass-hero', { y: -20, opacity: 0, duration: 0.5 });
  gsap.from('.pass-tier-col', { y: 30, opacity: 0, stagger: 0.04, duration: 0.4, delay: 0.2, ease: 'back.out(1.3)' });

  setTimeout(() => {
    const cur = $('.pass-tier-col.current');
    if (cur) cur.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, 600);
}

// ===== FRIENDS =====
function initFriends() {
  const list = $('#friends-list');
  list.innerHTML = FRIENDS.map(f => `
    <div class="friend-row">
      <div class="fav">
        <img src="${avatarUrl(f.seed)}" alt="">
        <div class="online-dot ${f.online}"></div>
      </div>
      <div class="finfo">
        <div class="fnm">${f.name} <span class="lvl-chip">Nv${f.level}</span></div>
        <div class="fstatus">${f.status}</div>
      </div>
      <div class="factions">
        ${f.online === 'offline'
          ? '<button>Message</button>'
          : `<button>Profil</button><button class="invite">Inviter</button>`}
      </div>
    </div>
  `).join('');

  gsap.from('.requests-count', { y: -20, opacity: 0, duration: 0.4 });
  gsap.from('.friend-row', { x: -20, opacity: 0, stagger: 0.06, duration: 0.35, delay: 0.2 });
  gsap.from('.add-friend-card', { x: 30, opacity: 0, duration: 0.5, delay: 0.2 });
}

// ===== HISTORY =====
function initHistory() {
  const list = $('#history-list');
  list.innerHTML = HISTORY.map(h => {
    const placeClass = h.place === 1 ? 'first' : h.place === 2 ? 'second' : h.place === 3 ? 'third' : '';
    return `<div class="history-row">
      <div class="place ${placeClass}">#${h.place}</div>
      <div class="h-mode">${h.mode}<div class="h-meta">5 manches</div></div>
      <div class="h-players">
        ${h.players.map(p => `<img src="${avatarUrl(p)}" alt="">`).join('')}
      </div>
      <div class="h-pts">${h.pts.toLocaleString('fr')} pts</div>
      <div class="h-date">${h.when}</div>
    </div>`;
  }).join('');

  gsap.from('.hstat-card', { y: 30, opacity: 0, stagger: 0.08, duration: 0.4, ease: 'back.out(1.3)' });
  gsap.from('.history-row', { x: -20, opacity: 0, stagger: 0.05, duration: 0.35, delay: 0.4 });
}

// ===== PRESENTERS (MC SKINS) =====
const PRESENTERS = {
  'dj-funky': {
    name: 'DJ FUNKY', seed: 'dj-funky-mc', hat: '🎧', mic: '🎤',
    accent: '#F97316', rarity: 'common', locked: false,
    quote: 'Yo la teamz, on lance ça en douceur ?',
    tags: ['ÉNERGIQUE', 'DÉFAUT'],
    lines: {
      intro: ['Yo la teamz !', 'On chauffe les disques !', 'Aller, on enchaîne !'],
      tease: ['Allez, fouillez vos souvenirs 🎵', 'Pensez à votre playlist ado', 'Ça va parler à quelqu\'un'],
      correct: ['VOILÀ COMMENT ON FAIT !', 'Trop fort !', 'Pas un classique pour rien'],
      tooLate: ['Aïe, on s\'endort', 'Trop tard la team', 'On laisse passer'],
      timer: ['10 secondes !', 'Ça chauffe !', 'Vite vite vite'],
      victory: ['Boom, partie pliée !', 'Quelle ambiance !', 'On remet ça ?']
    }
  },
  'mc-classic': {
    name: 'MC MARCEL', seed: 'mc-marcel-vibe', hat: '🎩', mic: '🎙️',
    accent: '#3B4FE8', rarity: 'common', locked: false,
    quote: 'Mesdames et messieurs, bienvenue dans le show !',
    tags: ['ÉLÉGANT', 'GENTLEMAN'],
    lines: {
      intro: ['Mesdames et messieurs !', 'Que le show commence', 'Tenez-vous prêts'],
      tease: ['Un classique de l\'âge d\'or', 'Tendez l\'oreille', 'Une vraie perle'],
      correct: ['Magnifique, mes hommages !', 'Quelle élégance', 'Un vrai connaisseur'],
      tooLate: ['Hélas, le temps file', 'Dommage, dommage', 'On laisse passer'],
      timer: ['Le temps presse !', 'Plus que 10 secondes', 'Hâtez-vous'],
      victory: ['Bravo bravissimo !', 'Quelle partie !', 'Standing ovation']
    }
  },
  'kawaii': {
    name: 'MIKA-CHAN', seed: 'mika-kawaii', hat: '🎀', mic: '🍡',
    accent: '#F472B6', rarity: 'rare', locked: false,
    quote: 'Ganbatte les amis ! On y va kawaii style 💖',
    tags: ['MIGNON', 'POSITIVE'],
    lines: {
      intro: ['Ganbatte ! 💖', 'C\'est parti minna !', 'On joue avec le sourire'],
      tease: ['Ça sonne familier non ?', 'Cherchez bien~', 'Indice : c\'est mignon'],
      correct: ['SUGOI ! 🌸', 'Trop bien joué !', 'Genki desu yo'],
      tooLate: ['Ah snif… 😢', 'C\'est passé', 'Plus de chance la prochaine'],
      timer: ['Hayaku ! ⏰', 'Vite vite !', 'Le temps !!'],
      victory: ['SUGOI minna ! 🎉', 'Quelle équipe !', 'On a tout déchiré']
    }
  },
  'disco-diva': {
    name: 'DISCO STELLA', seed: 'disco-stella-glitter', hat: '✨', mic: '💎',
    accent: '#FBBF24', rarity: 'rare', locked: false,
    quote: 'Sparkle, baby ! Ce soir on brille fort 💎',
    tags: ['GLAM', 'DISCO'],
    lines: {
      intro: ['SPARKLE TIME ✨', 'On brille fort ce soir', 'Disco fever'],
      tease: ['Ça groove, ça swing', 'Bouge tes hanches', 'C\'est dans le rythme'],
      correct: ['BRILLIANT, DARLING ✨', 'Tu déchires babe', 'Star quality'],
      tooLate: ['Trop tard, sweetie', 'Le miroir a tourné', 'Snif snif'],
      timer: ['Vite, le disco s\'éteint !', 'Le temps file darling', 'Plus que quelques sec'],
      victory: ['STAR QUALITY ✨', 'Quelle prestation !', 'Tu mérites le strass']
    }
  },
  'retro-80s': {
    name: 'NEON RICK', seed: 'neon-rick-80s', hat: '🕶️', mic: '📻',
    accent: '#8B5CF6', rarity: 'rare', locked: false,
    quote: 'Direct des années 80, prêts à voyager dans le temps ?',
    tags: ['RÉTRO', 'NEON'],
    lines: {
      intro: ['Direction années 80 !', 'On allume le synthé', 'Néon power'],
      tease: ['Du synthwave pur jus', 'Ça sent les épaulettes', 'Indice : néon'],
      correct: ['RADICAL !', 'Hit eighties confirmé', 'Old school score'],
      tooLate: ['Bande passée…', 'Le néon clignote', 'On rembobine ?'],
      timer: ['10 au compteur !', 'Le walkman accélère', 'Ça presse'],
      victory: ['MAXIMUM RADNESS', 'Hall of fame', '1985 confirmé']
    }
  },
  'crooner': {
    name: 'SIR CROONER', seed: 'crooner-jazzy', hat: '🎷', mic: '🎤',
    accent: '#1a1a1a', rarity: 'rare', locked: true,
    quote: 'Baisse la lumière, allume la fumée… c\'est l\'heure du jazz.',
    tags: ['JAZZ', 'COOL'],
    lines: {
      intro: ['Baisse la lumière…', 'Allume la fumée…', 'Voici le jazz'],
      tease: ['Notes de blues là-dedans', 'Saxo qui swing', 'Sens-tu le swing ?'],
      correct: ['Smooth comme du velours', 'Class act', 'Old soul'],
      tooLate: ['Le morceau s\'éteint', 'Fade out…', 'Le bar ferme'],
      timer: ['Last call mes amis', 'Le set se termine', 'Plus que dix mesures'],
      victory: ['Magistral !', 'Standing ovation', 'Un toast à ce score']
    }
  },
  'rap-king': {
    name: 'MC GROOVE', seed: 'mc-groove-fresh', hat: '👑', mic: '🎙️',
    accent: '#F97316', rarity: 'legendary', locked: true,
    quote: 'Posé sur le beat, on lâche pas le mic. Représente.',
    tags: ['LÉGENDAIRE', 'FLOW'],
    lines: {
      intro: ['On lâche pas le mic', 'Représente la team', 'Posé sur le beat'],
      tease: ['Flow reconnaissable entre mille', 'Couplet de fou', 'Ça vient du game'],
      correct: ['HARDCORE !', 'Tu maîtrises le game', 'Légende'],
      tooLate: ['Le beat est passé', 'Tu glisses sur le rythme', 'Trop late'],
      timer: ['10 au chrono !', 'Le temps t\'éclate', 'Sors le punchline'],
      victory: ['LÉGENDE INSCRITE', 'Hall of fame', 'On t\'attendait là']
    }
  },
  'mystery': {
    name: '???', seed: 'mystery-hooded', hat: '👁️', mic: '🔮',
    accent: '#A78BFA', rarity: 'legendary', locked: true,
    quote: 'Je sais tout. Je vois tout. Devinerez-vous mon nom ?',
    tags: ['MYSTÈRE', 'EXCLUSIF'],
    lines: {
      intro: ['J\'observe…', 'Vous êtes prêts ?', 'Le rideau se lève'],
      tease: ['Quelque chose flotte', 'Une vibe étrange', 'L\'inconnu vous appelle'],
      correct: ['Vous voyez l\'invisible', 'Bien deviné', 'Étrangement précis'],
      tooLate: ['Le temps vous a échappé', 'Disparu…', 'Le silence l\'emporte'],
      timer: ['Le sablier se vide', 'Plus que dix battements', 'Le temps…'],
      victory: ['Vous m\'avez vaincu', 'Étonnante équipe', 'À la prochaine séance']
    }
  },
  'boogie-boss': {
    name: 'BOOGIE BOSS', seed: 'assets/skin-disco-boss.png', hat: '🕶️', mic: '🎤',
    accent: '#8B5CF6', rarity: 'legendary', locked: false,
    quote: 'Costard violet, moustache au vent — c\'est la nuit du boogie, baby.',
    tags: ['LÉGENDAIRE', 'DISCO', 'NEW'],
    lines: {
      intro: ['On enflamme la piste !', 'Costard violet · ça part', 'Le boss du boogie est là'],
      tease: ['Tu sens cette basse ?', 'Funky pour les oreilles', 'Hips don\'t lie ici'],
      correct: ['GROOVY ! Trop classe', 'Disco approved', 'Boogie king/queen'],
      tooLate: ['La piste est passée', 'Pas dans le tempo', 'Reviens swinguer'],
      timer: ['10 secondes pour danser', 'Le DJ va couper', 'Vite, sur la piste'],
      victory: ['Couronnement disco', 'Tu domines la piste', 'Standing ovation, baby']
    }
  },
  'neon-diva': {
    name: 'NEON DIVA', seed: 'assets/skin-neon-diva.svg', hat: '✨', mic: '🎤',
    accent: '#F472B6', rarity: 'legendary', locked: false,
    quote: 'Lights on me, mic in hand — la scène m\'appartient, chérie.',
    tags: ['LÉGENDAIRE', 'POP', 'NEW'],
    lines: {
      intro: ['Lights up, baby !', 'La diva entre en scène', 'Cette voix t\'attrape direct'],
      tease: ['Tu connais cette mélodie ?', 'Mon vibrato te dit rien ?', 'Écoute ce refrain…'],
      correct: ['Brillante performance !', 'Voix d\'or, oreilles d\'or', 'Standing ovation'],
      tooLate: ['Le rideau retombe', 'La note s\'évapore', 'Encore, encore !'],
      timer: ['Dix secondes pour briller', 'Le solo va finir', 'Vite, encore une note'],
      victory: ['REINE/ROI DE LA SCÈNE', 'Tu m\'as outrillée', 'Diva approved']
    }
  }
};

let presenterBubbleTimeout = null;
function refreshPresenter() {
  const p = PRESENTERS[STATE.presenter];
  if (!p) return;
  const avt = $('#presenter-avatar');
  if (avt) avt.innerHTML = `<img src="${avatarUrl(p.seed)}" alt="">`;
  if ($('#presenter-hat')) $('#presenter-hat').textContent = p.hat;
  const micEl = document.querySelector('#presenter-wrap .presenter-mic');
  if (micEl) micEl.textContent = p.mic;
  if ($('#presenter-name')) $('#presenter-name').textContent = p.name;
  // Sync DJ scene avatar (game screen)
  const sceneAvt = $('#dj-scene-avatar');
  if (sceneAvt) sceneAvt.src = avatarUrl(p.seed);
  if ($('#dj-scene-hat')) $('#dj-scene-hat').textContent = p.hat;
  if ($('#dj-scene-mic')) $('#dj-scene-mic').textContent = p.mic;
  if ($('#dj-scene-name')) $('#dj-scene-name').textContent = p.name;
}
function presenterSay(category, mood = 'idle', dur = 3500) {
  const p = PRESENTERS[STATE.presenter];
  if (!p) return;
  const lines = p.lines[category] || p.lines.intro;
  const line = lines[Math.floor(Math.random() * lines.length)];
  const wrap = $('#presenter-wrap');
  const bubble = $('#presenter-bubble');
  if (!wrap || !bubble) return;
  bubble.textContent = line;
  bubble.classList.remove('hidden');
  wrap.classList.remove('idle', 'excited', 'sad');
  wrap.classList.add(mood);
  gsap.fromTo(bubble, { scale: 0.7, opacity: 0, y: 10 },
    { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)' });
  clearTimeout(presenterBubbleTimeout);
  presenterBubbleTimeout = setTimeout(() => {
    gsap.to(bubble, { opacity: 0, y: -10, duration: 0.3, onComplete: () => bubble.classList.add('hidden') });
    wrap.classList.remove('excited', 'sad');
    wrap.classList.add('idle');
  }, dur);
}

// ===== SKINS SCREEN =====
function initSkins() {
  const grid = $('#skins-grid');
  grid.innerHTML = Object.entries(PRESENTERS).map(([id, p]) => {
    let tag = '';
    if (id === STATE.presenter) tag = '<div class="sc-tag">ÉQUIPÉ</div>';
    else if (p.rarity === 'legendary') tag = '<div class="sc-tag" style="background: linear-gradient(135deg, var(--yellow), var(--orange)); color: var(--text);">LÉG</div>';
    else if (p.rarity === 'rare') tag = '<div class="sc-tag" style="background: var(--purple);">RARE</div>';
    return `<div class="skin-card ${id === STATE.presenter ? 'equipped' : ''} ${p.locked ? 'locked' : ''}" data-skin="${id}">
      ${tag}
      <div class="sc-preview">
        <div class="sc-hat">${p.hat}</div>
        <div class="sc-avatar"><img src="${avatarUrl(p.seed)}" alt=""></div>
      </div>
      <div class="sc-name">${p.name}</div>
      <div class="sc-rarity ${p.rarity}">${p.rarity}</div>
    </div>`;
  }).join('');

  updateSkinHero(STATE.presenter);

  $$('.skin-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.skin;
      const p = PRESENTERS[id];
      if (!p) return;
      if (p.locked) {
        gsap.fromTo(card, { x: 0 }, { x: 0, duration: 0.4, keyframes: [{ x: -6 }, { x: 6 }, { x: -4 }, { x: 4 }, { x: 0 }] });
        return;
      }
      updateSkinHero(id);
    });
  });

  gsap.from('.skins-hero', { y: -20, opacity: 0, duration: 0.5 });
  gsap.from('.skin-card', { y: 30, opacity: 0, stagger: 0.04, duration: 0.4, ease: 'back.out(1.3)', delay: 0.2 });

  // Also prep the Lobby & Sound tabs so switching is instant
  initLobbyPerso();
  initSoundTab();
  initMeTab();
}

// ===== ME (Profile) TAB =====
const ME_AVATAR_SEEDS = [
  'guigz-vibe', 'cath-vibe', 'jules-fresh', 'lea-sunset', 'marco-disco',
  'tom-fresh', 'sofia-stars', 'nour-wave', 'mc-groove-fresh', 'mystery-hooded',
  'dj-funky-mc', 'pop-queen', 'rocker-soul', 'jazz-pro', 'world-traveler',
  'dancer-fly'
];
const ME_DRAFT = { name: '', avatar: '' };

function initMeTab() {
  ME_DRAFT.name = STATE.player.name;
  ME_DRAFT.avatar = STATE.player.avatar;
  const nameInput = $('#me-name-input');
  const fileInput = $('#me-photo-input');
  if (!nameInput) return;
  nameInput.value = ME_DRAFT.name;
  $('#me-name-count').textContent = nameInput.value.length;
  $('#me-xp').textContent = STATE.player.xp;
  $('#me-lvl').textContent = STATE.player.level;
  updateMePreview();
  renderAvatarGrid();

  nameInput.oninput = () => {
    ME_DRAFT.name = nameInput.value;
    $('#me-name-count').textContent = nameInput.value.length;
  };
  $('#me-upload').onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      shopToast('Format non supporté — choisis une image', 'bad');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      shopToast('Image trop lourde (max 4 Mo)', 'bad');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      ME_DRAFT.avatar = ev.target.result;
      updateMePreview();
      renderAvatarGrid();
      gsap.fromTo('#me-avatar-img', { scale: 0.6, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.8)' });
      shopToast('✓ Photo importée — clique sur Enregistrer', 'good');
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  };
  $('#me-random').onclick = () => {
    const seed = 'random-' + Math.random().toString(36).slice(2, 9);
    ME_DRAFT.avatar = seed;
    updateMePreview();
    renderAvatarGrid();
    gsap.fromTo('#me-avatar-img', { scale: 0.6, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(1.8)' });
  };
  $('#me-save').onclick = () => {
    const name = (ME_DRAFT.name || '').trim();
    if (!name) { shopToast('Le pseudo ne peut pas être vide', 'bad'); return; }
    STATE.player.name = name;
    STATE.player.avatar = ME_DRAFT.avatar;
    refreshSidebar();
    shopToast('✓ Profil mis à jour', 'good');
    gsap.fromTo('.sb-user', { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
  };
  $('#me-reset').onclick = () => {
    ME_DRAFT.name = STATE.player.name;
    ME_DRAFT.avatar = STATE.player.avatar;
    nameInput.value = ME_DRAFT.name;
    $('#me-name-count').textContent = nameInput.value.length;
    updateMePreview();
    renderAvatarGrid();
  };

  // Spotify connect
  spLoadFromStorage();
  refreshSpotifyUI();
  const spBtn = $('#sp-connect-btn');
  if (spBtn) {
    spBtn.onclick = async () => {
      if (spIsConnected()) {
        spDisconnect();
        refreshSpotifyUI();
        shopToast('Spotify déconnecté', '');
      } else {
        await spConnect();
      }
    };
  }
}

function updateMePreview() {
  const img = $('#me-avatar-img');
  if (img) img.src = avatarUrl(ME_DRAFT.avatar);
}

function renderAvatarGrid() {
  const grid = $('#avatar-grid');
  if (!grid) return;
  grid.innerHTML = ME_AVATAR_SEEDS.map(seed => `
    <button class="avatar-card ${seed === ME_DRAFT.avatar ? 'equipped' : ''}" data-seed="${seed}">
      <img src="${avatarUrl(seed)}" alt="" />
      ${seed === ME_DRAFT.avatar ? '<span class="ac-tick">✓</span>' : ''}
    </button>
  `).join('');
  $$('.avatar-card', grid).forEach(b => {
    b.onclick = () => {
      ME_DRAFT.avatar = b.dataset.seed;
      updateMePreview();
      renderAvatarGrid();
      gsap.fromTo('#me-avatar-img', { scale: 0.7 }, { scale: 1, duration: 0.35, ease: 'back.out(1.8)' });
    };
  });
}

function updateSkinHero(id) {
  const p = PRESENTERS[id];
  if (!p) return;
  $('#skins-name').textContent = p.name;
  $('#skins-quote').textContent = p.quote;
  $('#skins-rarity').textContent = p.rarity[0].toUpperCase() + p.rarity.slice(1);
  $('#skins-tags').innerHTML = p.tags.map(t => `<span class="stag">${t}</span>`).join('');
  $('#skins-preview').innerHTML = `
    <div class="sp-platform">${p.name}</div>
    <div class="sp-mic">${p.mic}</div>
    <div class="sp-hat">${p.hat}</div>
    <div class="sp-avatar"><img src="${avatarUrl(p.seed)}" alt=""></div>
  `;
  // platform color
  const plat = $('#skins-preview .sp-platform');
  if (plat) plat.style.background = `linear-gradient(180deg, ${p.accent}, ${p.accent}dd)`;

  const btn = $('#skin-equip-btn');
  if (id === STATE.presenter) {
    btn.textContent = 'ÉQUIPÉ ✓';
    btn.classList.remove('btn-accent'); btn.classList.add('btn-dark');
  } else if (p.locked) {
    btn.textContent = '🔒 VERROUILLÉ';
    btn.classList.remove('btn-accent'); btn.classList.add('btn-dark');
  } else {
    btn.textContent = 'ÉQUIPER';
    btn.classList.remove('btn-dark'); btn.classList.add('btn-accent');
  }
  btn.onclick = () => {
    if (p.locked || id === STATE.presenter) return;
    STATE.presenter = id;
    refreshPresenter();
    // refresh grid tags
    $$('.skin-card').forEach(c => {
      c.classList.toggle('equipped', c.dataset.skin === id);
      const tag = c.querySelector('.sc-tag');
      if (tag) tag.remove();
      if (c.dataset.skin === id) {
        const t = document.createElement('div');
        t.className = 'sc-tag'; t.textContent = 'ÉQUIPÉ';
        c.appendChild(t);
      } else {
        const op = PRESENTERS[c.dataset.skin];
        if (op.rarity === 'legendary') {
          const t = document.createElement('div'); t.className = 'sc-tag';
          t.style.cssText = 'background: linear-gradient(135deg, var(--yellow), var(--orange)); color: var(--text);';
          t.textContent = 'LÉG'; c.appendChild(t);
        } else if (op.rarity === 'rare') {
          const t = document.createElement('div'); t.className = 'sc-tag';
          t.style.cssText = 'background: var(--purple);';
          t.textContent = 'RARE'; c.appendChild(t);
        }
      }
    });
    updateSkinHero(id);
  };

  gsap.fromTo('#skins-preview .sp-avatar', { scale: 0.8, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.6)' });
  gsap.fromTo('#skins-preview .sp-hat', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'bounce.out' });
  gsap.fromTo('#skins-preview .sp-mic', { scale: 0, rotation: 180 }, { scale: 1, rotation: -15, duration: 0.4, delay: 0.2, ease: 'back.out(1.6)' });
}

// ===== LOBBY PERSO =====
const LOBBY_THEMES = [
  { id: 'peach',    name: 'Pêche chaude', tagline: "L'ambiance par défaut, chaleureuse et accueillante.", bg: 'linear-gradient(135deg, #FFECD9, #FAD9C1)' },
  { id: 'sunset',   name: 'Sunset',       tagline: "Chaud, doux, parfait pour les soirées.",              bg: 'linear-gradient(135deg, #FFB88C, #F472B6)' },
  { id: 'midnight', name: 'Midnight',     tagline: "Profond et stylé — on baisse les lumières.",          bg: 'linear-gradient(135deg, #1e1b4b, #0f172a)' },
  { id: 'neon',     name: 'Neon',         tagline: "Pour les vrais ravers — couleurs flashy.",            bg: 'linear-gradient(135deg, #2a0a4e, #16003d)', locked: true },
  { id: 'beach',    name: 'Beach',        tagline: "Vibes vacances, parasol obligatoire.",                bg: 'linear-gradient(135deg, #BFDBFE, #FDE68A)', locked: true },
  { id: 'forest',   name: 'Forest',       tagline: "Calme, concentré, on respire.",                       bg: 'linear-gradient(135deg, #14532D, #064E3B)', locked: true }
];
const LOBBY_STICKERS = ['🎉','🎤','💿','🔥','✨','💜','🦄','🌈','👑','🎧','🍑','🌙','🪩','🥳','🍕','🎮'];
const LOBBY_JINGLES = [
  { id: 'rec-blip', name: 'Record Blip',  desc: 'Une note vinyl sympa', icon: '💿' },
  { id: 'crowd',    name: 'Crowd Cheer',  desc: 'La foule applaudit',   icon: '👏' },
  { id: 'airhorn',  name: 'DJ Airhorn',   desc: 'Le classique',         icon: '📯' },
  { id: 'soft',     name: 'Soft Bell',    desc: 'Discret et élégant',   icon: '🔔' },
  { id: 'silence',  name: 'Silence',      desc: 'Pas de son',           icon: '🤫' }
];
if (!STATE.lobbyPerso) STATE.lobbyPerso = { theme: 'peach', sticker: '🎉', jingle: 'rec-blip', customSounds: [] };
if (!STATE.lobbyPerso.customSounds) STATE.lobbyPerso.customSounds = [];

function renderThemes() {
  const grid = $('#theme-grid'); if (!grid) return;
  grid.innerHTML = LOBBY_THEMES.map(t => `
    <div class="theme-card ${t.id === STATE.lobbyPerso.theme ? 'equipped' : ''} ${t.locked ? 'locked' : ''}"
         data-theme="${t.id}" style="background: ${t.bg};">
      ${t.id === STATE.lobbyPerso.theme ? '<div class="tc-equipped">ACTIF</div>' : ''}
      ${t.locked ? '<div class="tc-lock">🔒</div>' : ''}
      <div class="tc-name">${t.name}</div>
    </div>`).join('');
  $$('.theme-card').forEach(c => c.addEventListener('click', () => {
    if (c.classList.contains('locked')) return;
    STATE.lobbyPerso.theme = c.dataset.theme;
    const t = LOBBY_THEMES.find(x => x.id === c.dataset.theme);
    if (t) {
      $('#lpp-name').textContent = t.name.toUpperCase();
      $('#lpp-tagline').textContent = t.tagline;
      $('#lpp-preview').style.background = t.bg;
    }
    renderThemes();
  }));
}
function renderStickers() {
  const grid = $('#sticker-grid'); if (!grid) return;
  grid.innerHTML = LOBBY_STICKERS.map(s => `
    <div class="sticker-card ${s === STATE.lobbyPerso.sticker ? 'equipped' : ''}" data-sticker="${s}">${s}</div>
  `).join('');
  $$('.sticker-card').forEach(c => c.addEventListener('click', () => {
    STATE.lobbyPerso.sticker = c.dataset.sticker;
    $('#lpp-sticker').textContent = c.dataset.sticker;
    gsap.fromTo('#lpp-sticker', { scale: 0.6, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(1.8)' });
    renderStickers();
  }));
}
function renderJingles() {
  const grid = $('#jingle-grid'); if (!grid) return;
  grid.innerHTML = LOBBY_JINGLES.map(j => `
    <div class="jingle-card ${j.id === STATE.lobbyPerso.jingle ? 'equipped' : ''}" data-jingle="${j.id}">
      <div class="j-icon">${j.icon}</div>
      <div class="j-body">
        <div class="j-name">${j.name}</div>
        <div class="j-desc">${j.desc}</div>
      </div>
      <div class="j-play">▶</div>
    </div>`).join('');
  $$('.jingle-card').forEach(c => c.addEventListener('click', () => {
    STATE.lobbyPerso.jingle = c.dataset.jingle;
    renderJingles();
  }));
}
function initLobbyPerso() {
  const t = LOBBY_THEMES.find(x => x.id === STATE.lobbyPerso.theme) || LOBBY_THEMES[0];
  $('#lpp-name').textContent = t.name.toUpperCase();
  $('#lpp-tagline').textContent = t.tagline;
  $('#lpp-preview').style.background = t.bg;
  $('#lpp-sticker').textContent = STATE.lobbyPerso.sticker;
  renderThemes(); renderStickers(); renderJingles();
  initCustomSounds();
}

// ===== CUSTOM SOUNDS =====
function loadCustomSounds() {
  try {
    const raw = localStorage.getItem('pompelup-custom-sounds');
    if (raw) STATE.lobbyPerso.customSounds = JSON.parse(raw).filter(s => s.source !== 'local');
  } catch(e) {}
}
function saveCustomSounds() {
  try { localStorage.setItem('pompelup-custom-sounds', JSON.stringify(STATE.lobbyPerso.customSounds.filter(s => s.source !== 'local'))); } catch(e) {}
}

function renderCustomSoundsLibrary() {
  const lib = $('#cs-library'); if (!lib) return;
  const sounds = STATE.lobbyPerso.customSounds;
  if (!sounds.length) {
    lib.innerHTML = '<div class="cs-empty">Aucun son ajouté · max 8 · apparaissent dans le soundboard</div>';
  } else {
    lib.innerHTML = `<div class="cs-lib-title">MA BIBLIOTHÈQUE <span>${sounds.length}/8</span></div>` +
      sounds.map(s => `
        <div class="cs-lib-row">
          <button class="cs-play-btn" data-url="${escHtml(s.url)}">▶</button>
          <div class="cs-lib-info">
            <div class="cs-lib-name">${escHtml(s.name)}</div>
            <div class="cs-lib-src">${s.source === 'local' ? '📁 Local' : '🌐 MyInstants'}</div>
          </div>
          <button class="cs-remove-btn" data-cs-id="${escHtml(s.id)}">×</button>
        </div>`).join('');
    $$('.cs-play-btn', lib).forEach(btn => {
      btn.onclick = () => { previewSfx(btn.dataset.url); gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' }); };
    });
    $$('.cs-remove-btn', lib).forEach(btn => {
      btn.onclick = () => {
        STATE.lobbyPerso.customSounds = STATE.lobbyPerso.customSounds.filter(s => s.id !== btn.dataset.csId);
        saveCustomSounds(); renderCustomSoundsLibrary(); updateLobbyCustomPads();
      };
    });
  }
  updateLobbyCustomPads();
}

function updateLobbyCustomPads() {
  const pads = $('#sb-custom-pads');
  if (!pads) return;
  const sounds = STATE.lobbyPerso.customSounds;
  if (!sounds.length) {
    pads.innerHTML = '<div class="sb-empty-hint">Ajoute tes sons dans Personnalisation → Sons custom</div>';
    return;
  }
  const colors = ['#8B5CF6','#F97316','#3B4FE8','#22C55E','#F472B6','#FBBF24','#EF4444','#06B6D4'];
  pads.innerHTML = sounds.map((s, i) => `
    <button class="sb-pad sb-pad-sound" data-sound-url="${escHtml(s.url)}" style="--pad: ${colors[i % colors.length]};">
      <span class="pad-emoji">🎵</span>
      <span class="pad-name">${escHtml(s.name.slice(0, 10))}</span>
    </button>`).join('');
}

function initCustomSounds() {
  loadCustomSounds(); renderCustomSoundsLibrary();
  const fileInput = $('#cs-file-input'); const importBtn = $('#cs-import-btn');
  if (!importBtn) return;
  importBtn.onclick = () => fileInput?.click();
  if (fileInput) {
    fileInput.onchange = (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      if (!file.type.startsWith('audio/')) { shopToast('Format non supporté — MP3, WAV, OGG…', 'bad'); return; }
      if (file.size > 5 * 1024 * 1024) { shopToast('Fichier trop lourd (max 5 Mo)', 'bad'); return; }
      if (STATE.lobbyPerso.customSounds.length >= 8) { shopToast('Max 8 sons custom atteint', 'bad'); return; }
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 24);
      STATE.lobbyPerso.customSounds.push({ id: 'cs-' + Date.now(), name, url, source: 'local' });
      saveCustomSounds(); renderCustomSoundsLibrary();
      shopToast('✓ ' + name + ' importé !', 'good');
      fileInput.value = '';
    };
  }
}

// ===== SOUND TAB =====
function renderSoundGrid(containerId, list, prefKey) {
  const grid = $('#' + containerId); if (!grid) return;
  const cur = SOUND_PREFS[prefKey];
  const cards = [
    `<div class="sound-card ${cur === 'random' ? 'equipped' : ''}" data-val="random">
       <div class="sc-icon" style="background: linear-gradient(135deg, var(--purple), var(--blue));">🎲</div>
       <div class="sc-body">
         <div class="sc-name">ALÉATOIRE</div>
         <div class="sc-desc">Un son différent à chaque drop</div>
       </div>
       <div class="sc-tick">✓</div>
     </div>`,
    ...list.map((s, i) => `
      <div class="sound-card ${cur === s.id ? 'equipped' : ''}" data-val="${s.id}" data-src="${s.src}">
        <div class="sc-icon" style="background: linear-gradient(135deg, var(--orange), var(--yellow));">${prefKey === 'legendary' ? '👑' : '✨'}</div>
        <div class="sc-body">
          <div class="sc-name">${s.name}</div>
          <div class="sc-desc">${s.desc}</div>
        </div>
        <button class="sc-play" data-play="${s.src}" title="Écouter">▶</button>
        <div class="sc-tick">✓</div>
      </div>`),
    `<div class="sound-card sound-card-off ${cur === 'off' ? 'equipped' : ''}" data-val="off">
       <div class="sc-icon" style="background: #94a3b8;">🔇</div>
       <div class="sc-body">
         <div class="sc-name">DÉSACTIVÉ</div>
         <div class="sc-desc">Pas de son pour ce niveau</div>
       </div>
       <div class="sc-tick">✓</div>
     </div>`
  ].join('');
  grid.innerHTML = cards;
  $$('.sound-card', grid).forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.sc-play')) return;
      SOUND_PREFS[prefKey] = card.dataset.val;
      saveSoundPrefs();
      renderSoundGrid(containerId, list, prefKey);
      // Auto-preview the chosen sound (skip for random/off)
      if (card.dataset.src) previewSfx(card.dataset.src);
    });
  });
  $$('.sc-play', grid).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      previewSfx(btn.dataset.play);
      gsap.fromTo(btn, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    });
  });
}
function initSoundTab() {
  renderSoundGrid('snd-legendary-grid', LEGENDARY_SFX, 'legendary');
  renderSoundGrid('snd-epic-grid',      EPIC_SFX,      'epic');
  const master = $('#snd-master');
  const vol    = $('#snd-volume');
  const volVal = $('#snd-vol-val');
  if (master) {
    master.checked = !!SOUND_PREFS.master;
    master.onchange = () => { SOUND_PREFS.master = master.checked; saveSoundPrefs(); };
  }
  if (vol && volVal) {
    vol.value = Math.round(SOUND_PREFS.volume * 100);
    volVal.textContent = vol.value;
    vol.oninput = () => {
      SOUND_PREFS.volume = vol.value / 100;
      volVal.textContent = vol.value;
      saveSoundPrefs();
    };
  }
}

// ===== STAB (sub-tab) routing inside Skins screen =====
document.body.addEventListener('click', (e) => {
  const tab = e.target.closest('.skins-tabs .stab');
  if (!tab) return;
  const key = tab.dataset.stab;
  $$('.skins-tabs .stab').forEach(b => b.classList.toggle('active', b === tab));
  $$('.stab-panel').forEach(p => p.classList.toggle('active', p.dataset.stabPanel === key));
  if (key === 'lobby') initLobbyPerso();
  if (key === 'sound') initSoundTab();
  if (key === 'me')    initMeTab();
  // Animate entering panel content
  const panel = $(`.stab-panel[data-stab-panel="${key}"]`);
  if (panel) gsap.fromTo(panel, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
});

// ===== COLLECTION =====
const COLLECTION_STATE = { filter: 'all', sort: 'recent', search: '' };

function rarityRank(r) { return r === 'legendary' ? 0 : r === 'rare' ? 1 : 2; }

function getFilteredCollection() {
  let list = COLLECTION_DATA_IDX.slice();
  const q = COLLECTION_STATE.search.trim().toLowerCase();
  if (q) {
    list = list.filter(v => !v.locked && (v.title + ' ' + v.artist + ' ' + v.genre).toLowerCase().includes(q));
  } else {
    const f = COLLECTION_STATE.filter;
    if (f === 'common' || f === 'rare' || f === 'legendary') {
      list = list.filter(v => v.rarity === f && !v.locked);
    } else if (f === 'owned')  list = list.filter(v => !v.locked);
    else if (f === 'locked')   list = list.filter(v => v.locked);
  }
  const s = COLLECTION_STATE.sort;
  if (s === 'rarity') list.sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || a._idx - b._idx);
  else if (s === 'alpha') list.sort((a, b) => (a.locked ? 1 : 0) - (b.locked ? 1 : 0) || a.title.localeCompare(b.title));
  else if (s === 'year')  list.sort((a, b) => (a.locked ? 1 : 0) - (b.locked ? 1 : 0) || (b.year || 0) - (a.year || 0));
  else if (s === 'plays') list.sort((a, b) => (b.plays || 0) - (a.plays || 0));
  return list;
}

function updateCollectionKpis() {
  let cmnOwned=0, rareOwned=0, legOwned=0, cmnAll=0, rareAll=0, legAll=0, locked=0;
  COLLECTION_DATA.forEach(v => {
    if (v.rarity === 'common') cmnAll++;
    else if (v.rarity === 'rare') rareAll++;
    else if (v.rarity === 'legendary') legAll++;
    if (v.locked) { locked++; }
    else if (v.rarity === 'common') cmnOwned++;
    else if (v.rarity === 'rare') rareOwned++;
    else if (v.rarity === 'legendary') legOwned++;
  });
  const owned = cmnOwned + rareOwned + legOwned;
  const totalGoal = 180;
  const pct = Math.round((owned / totalGoal) * 100);
  $('#kpi-common').textContent = cmnOwned;
  $('#kpi-rare').textContent = rareOwned;
  $('#kpi-legendary').textContent = legOwned;
  $('#kpi-locked').textContent = totalGoal - owned;
  $('#ring-num').textContent = pct + '%';
  const r = 42, c = 2 * Math.PI * r;
  const fg = $('#ring-fg');
  if (fg) { fg.style.strokeDasharray = c; fg.style.strokeDashoffset = c - (c * pct / 100); }
  $('#cnt-all').textContent = COLLECTION_DATA.length;
  $('#cnt-common').textContent = cmnAll;
  $('#cnt-rare').textContent = rareAll;
  $('#cnt-legendary').textContent = legAll;
  $('#cnt-owned').textContent = owned;
  $('#cnt-locked').textContent = locked;
}

function updateCollectionFeatured() {
  const candidates = COLLECTION_DATA.filter(v => !v.locked && v.rarity === 'legendary');
  const f = candidates.find(v => v.isNew) || candidates[0];
  if (!f) return;
  $('#ch-meta-title').innerHTML = f.title.toUpperCase().replace(' ', '<br>');
  $('#ch-meta-artist').textContent = f.artist;
  $('#ch-meta-year').textContent = `${f.year || '—'} · ${f.genre.toUpperCase()}`;
  $('#ch-meta-plays').textContent = (f.plays || 0) + '×';
  const disk = $('#ch-disk');
  if (disk) disk.style.setProperty('--label', f.label);
  const featured = $('#ch-featured');
  if (featured) featured.onclick = () => openVinylModal(f);
}

function renderCollectionGrid() {
  const grid = $('#collection-grid');
  const empty = $('#col-empty');
  const list = getFilteredCollection();
  if (!list.length) { grid.innerHTML = ''; empty.style.display = 'flex'; return; }
  empty.style.display = 'none';
  grid.innerHTML = list.map(v => `
    <div class="vinyl-card v-${v.rarity} ${v.locked ? 'locked' : ''}" data-idx="${v._idx}">
      ${v.isNew && !v.locked ? '<div class="v-new">NEW</div>' : ''}
      ${!v.locked && v.rarity !== 'common' ? `<div class="v-rar ${v.rarity}">${v.rarity === 'legendary' ? '👑 LÉG' : '💎 RARE'}</div>` : ''}
      ${v.locked ? '<div class="v-lock">🔒</div>' : ''}
      <div class="v-art">
        <div class="v-disk" style="--label: ${v.label}">
          ${!v.locked && SP_ART_CACHE[`${v.title}|||${v.artist}`] ? `<img class="v-disk-art" src="${escHtml(SP_ART_CACHE[`${v.title}|||${v.artist}`])}" alt="">` : ''}
        </div>
        ${!v.locked && v.rarity === 'legendary' ? '<div class="v-shine"></div>' : ''}
      </div>
      <div class="v-info">
        <div class="v-title">${v.title}</div>
        <div class="v-artist">${v.artist}</div>
        ${!v.locked ? `<div class="v-meta"><span class="v-year">${v.year || ''}</span><span class="v-plays">▶ ${v.plays}</span></div>` : '<div class="v-meta v-meta-locked">À débloquer</div>'}
      </div>
    </div>`).join('');
  $$('.vinyl-card', grid).forEach(card => {
    card.addEventListener('click', () => {
      const v = COLLECTION_DATA[parseInt(card.dataset.idx, 10)];
      if (v) openVinylModal(v);
    });
  });
  gsap.from('.vinyl-card', { y: 30, opacity: 0, scale: 0.85, stagger: 0.03, duration: 0.35, ease: 'back.out(1.4)' });
}

function openVinylModal(v) {
  if (v.locked) {
    shopToast('Vinyle verrouillé — ouvre des packs pour le débloquer 🎁', 'bad');
    return;
  }
  $('#vm-title').textContent = v.title;
  $('#vm-artist').textContent = v.artist;
  $('#vm-year').textContent = v.year || '—';
  $('#vm-genre').textContent = v.genre;
  $('#vm-plays').textContent = (v.plays || 0) + ' fois';
  $('#vm-obtained').textContent = v.isNew ? 'Pack quotidien · aujourd\'hui' : 'Pack quotidien · cette semaine';
  $('#vm-rarity').className = 'vm-rarity ' + v.rarity;
  $('#vm-rarity').textContent = v.rarity === 'legendary' ? '👑 LÉGENDAIRE' : v.rarity === 'rare' ? '💎 RARE' : 'COMMUN';
  $('#vm-disk').style.setProperty('--label', v.label);
  // Streaming search links
  const q = encodeURIComponent(`${v.title} ${v.artist}`);
  $('#vm-spotify').href = `https://open.spotify.com/search/${q}`;
  $('#vm-apple').href   = `https://music.apple.com/search?term=${q}`;
  $('#vm-deezer').href  = `https://www.deezer.com/search/${q}`;
  const rays = $('#vm-rays');
  rays.style.display = (v.rarity === 'legendary' || v.rarity === 'rare') ? 'block' : 'none';
  rays.dataset.rarity = v.rarity;
  const modal = $('#vinyl-modal');
  modal.classList.add('active');
  gsap.fromTo('.vm-card', { scale: 0.85, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' });
  gsap.fromTo('.vm-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.25 });
}
function closeVinylModal() {
  const modal = $('#vinyl-modal');
  if (!modal) return;
  modal.classList.remove('active');
  gsap.to('.vm-card', { scale: 0.9, opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' });
  gsap.to('.vm-backdrop', { opacity: 0, duration: 0.25 });
}

let _colSearchTimer = null;
const SP_ART_CACHE = {};

// iTunes Search API — CORS ouvert, previews 30s AAC, aucune auth
async function itunesSearch(title, artist) {
  try {
    const q = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&media=music&entity=song&limit=5`);
    const data = await res.json();
    const track = (data.results || []).find(t => t.previewUrl);
    if (!track) return null;
    return {
      previewUrl: track.previewUrl,
      albumArt: track.artworkUrl100?.replace('100x100', '300x300') || null
    };
  } catch(e) { return null; }
}

async function loadGamePreviews(songs) {
  return Promise.all(songs.map(async s => {
    const it = await itunesSearch(s.title, s.artist);
    if (it) return { ...s, ...it };
    // Fallback : Spotify art uniquement (preview_url déprécié par Spotify)
    if (spIsConnected()) {
      const sp = await spSearchPreviews(s.title, s.artist);
      if (sp?.albumArt) return { ...s, albumArt: sp.albumArt };
    }
    return s;
  }));
}

async function spFetchArt(title, artist) {
  const key = `${title}|||${artist}`;
  if (SP_ART_CACHE[key] !== undefined) return SP_ART_CACHE[key];
  SP_ART_CACHE[key] = null;
  const it = await itunesSearch(title, artist);
  SP_ART_CACHE[key] = it?.albumArt || null;
  return SP_ART_CACHE[key];
}

async function loadCollectionArt() {
  const unlocked = COLLECTION_DATA.filter(v => !v.locked);
  for (const v of unlocked) {
    await spFetchArt(v.title, v.artist);
    renderCollectionGrid();
  }
}

function initCollection() {
  updateCollectionKpis();
  updateCollectionFeatured();
  loadCollectionArt();
  // Sync UI controls with persisted state
  const searchEl = $('#col-search');
  if (searchEl) searchEl.value = COLLECTION_STATE.search;
  const sortEl = $('#col-sort');
  if (sortEl) sortEl.value = COLLECTION_STATE.sort;
  $$('.col-chip', $('#col-chips')).forEach(c => {
    c.classList.toggle('active', c.dataset.filter === COLLECTION_STATE.filter);
    c.onclick = () => {
      $$('.col-chip', $('#col-chips')).forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      COLLECTION_STATE.filter = c.dataset.filter;
      renderCollectionGrid();
    };
  });
  renderCollectionGrid();
  if (sortEl) sortEl.onchange = (e) => { COLLECTION_STATE.sort = e.target.value; renderCollectionGrid(); };
  if (searchEl) searchEl.oninput = (e) => {
    COLLECTION_STATE.search = e.target.value;
    clearTimeout(_colSearchTimer);
    _colSearchTimer = setTimeout(renderCollectionGrid, 200);
  };
  $$('[data-close], .vm-backdrop', $('#vinyl-modal')).forEach(el => el.onclick = closeVinylModal);
  $('#vm-equip').onclick = () => { shopToast('✓ Mis en avant sur ton profil', 'good'); closeVinylModal(); };
  $('#vm-share').onclick = () => { shopToast('Lien copié 🔗', 'good'); };
  gsap.from('.col-hero > *', { y: -20, opacity: 0, stagger: 0.1, duration: 0.5 });
  gsap.from('.col-chip', { y: -10, opacity: 0, stagger: 0.04, duration: 0.3, delay: 0.15 });
  gsap.from('.col-tools > *', { y: -10, opacity: 0, stagger: 0.06, duration: 0.3, delay: 0.2 });
}

// ===== SPOTIFY =====
const SPOTIFY_CLIENT_ID = 'd6fc0be86a20420aba09326f27cabefa';
const SPOTIFY_SCOPES = 'user-read-email user-read-private';
let _spToken = null;
let _spExpires = 0;
let _spAudio = null;

function spIsConnected() { return !!_spToken && Date.now() < _spExpires; }

function spLoadFromStorage() {
  const tok = localStorage.getItem('sp_token');
  const exp = parseInt(localStorage.getItem('sp_expires') || '0');
  if (tok && exp > Date.now()) { _spToken = tok; _spExpires = exp; return true; }
  return false;
}

async function spConnect() {
  const verifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  localStorage.setItem('sp_verifier', verifier);
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: window.location.origin,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state: 'sp_auth'
  });
  window.location.href = 'https://accounts.spotify.com/authorize?' + params;
}

async function spHandleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code || params.get('state') !== 'sp_auth') return;
  const verifier = localStorage.getItem('sp_verifier');
  if (!verifier) return;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: window.location.origin,
      code_verifier: verifier
    })
  });
  const data = await res.json();
  if (data.access_token) {
    _spToken = data.access_token;
    _spExpires = Date.now() + data.expires_in * 1000;
    localStorage.setItem('sp_token', _spToken);
    localStorage.setItem('sp_expires', _spExpires.toString());
    if (data.refresh_token) localStorage.setItem('sp_refresh', data.refresh_token);
    localStorage.removeItem('sp_verifier');
    window.history.replaceState({}, '', window.location.pathname);
  }
}

async function spRefreshToken() {
  const refresh = localStorage.getItem('sp_refresh');
  if (!refresh) return false;
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh,
        client_id: SPOTIFY_CLIENT_ID
      })
    });
    const data = await res.json();
    if (data.access_token) {
      _spToken = data.access_token;
      _spExpires = Date.now() + data.expires_in * 1000;
      localStorage.setItem('sp_token', _spToken);
      localStorage.setItem('sp_expires', _spExpires.toString());
      if (data.refresh_token) localStorage.setItem('sp_refresh', data.refresh_token);
      return true;
    }
  } catch(e) {}
  return false;
}

function spDisconnect() {
  _spToken = null; _spExpires = 0;
  ['sp_token', 'sp_expires', 'sp_refresh', 'sp_verifier'].forEach(k => localStorage.removeItem(k));
}

async function spSearchPreviews(title, artist) {
  if (!spIsConnected()) return null;
  try {
    const q = encodeURIComponent(`track:${title} artist:${artist}`);
    const res = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=3`, {
      headers: { 'Authorization': 'Bearer ' + _spToken }
    });
    const data = await res.json();
    const track = (data.tracks?.items || []).find(t => t.preview_url);
    if (!track) return null;
    return { previewUrl: track.preview_url, albumArt: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url };
  } catch(e) { return null; }
}

async function spLoadPreviews(songs) {
  if (!spIsConnected()) return songs;
  const enriched = await Promise.all(songs.map(async s => {
    const info = await spSearchPreviews(s.title, s.artist);
    return info ? { ...s, ...info } : s;
  }));
  return enriched;
}

function spPlayPreview(url) {
  spStopPreview();
  if (!url) return;
  _spAudio = new Audio(url);
  _spAudio.volume = 0.55;
  _spAudio.play().catch(() => {});
}

function spStopPreview() {
  if (_spAudio) { _spAudio.pause(); _spAudio.src = ''; _spAudio = null; }
}

function refreshSpotifyUI() {
  const btn = $('#sp-connect-btn');
  const status = $('#sp-status');
  if (!btn) return;
  if (spIsConnected()) {
    btn.textContent = 'Déconnecter Spotify';
    btn.className = 'btn btn-ghost btn-sm';
    if (status) status.textContent = '✓ Connecté — les previews Spotify sont actives';
  } else {
    btn.textContent = 'Connecter Spotify';
    btn.className = 'btn btn-accent btn-sm';
    if (status) status.textContent = 'Connecte ton compte pour les previews 30s en jeu';
  }
}

// ===== LOBBY =====
const PLAYER_POSITIONS = []; // (déprécié — le salon utilise maintenant une grille CSS)

function initLobby() {
  if (!STATE.room._joined) {
    STATE.room.code = generateRoomCode();
    STATE.room._isHost = true;
  }
  $$('.rcode').forEach(el => el.textContent = STATE.room.code);

  const titleEl = document.querySelector('.lobby-title');
  if (titleEl) titleEl.textContent = 'SALON DE ' + (sbGetProfile()?.username || STATE.player.name).toUpperCase();

  const settingsPanel = document.querySelector('.lobby-grid .panel');
  if (settingsPanel) settingsPanel.style.display = STATE.room._isHost ? '' : 'none';

  const chatList = $('#chat-list');
  if (chatList) chatList.innerHTML = '<div class="chat-msg system"><div class="cm-body"><div class="ct">En attente des joueurs...</div></div></div>';

  renderLobbyPlayers([]);

  function broadcastSoundsSync() {
    if (!sbIsHost()) return;
    const sounds = STATE.lobbyPerso.customSounds.map(s => ({ id: s.id, name: s.name, url: s.url, source: s.source }));
    sbBroadcast('sync', { type: 'sounds', sounds });
  }

  const connectFn = STATE.room._isHost ? sbCreateRoom : sbJoinRoom;
  connectFn(STATE.room.code, (event, data) => {
    if (event === 'ready') {
      renderLobbyPlayers(sbRoomPlayers());
      updateLobbyCount();
      broadcastSoundsSync();
    }
    if (event === 'join' || event === 'leave') {
      renderLobbyPlayers(sbRoomPlayers());
      updateLobbyCount();
      if (event === 'join' && data && data.id !== sbMyId()) {
        pushChatMsg('system', `${data.name} a rejoint le salon 👋`);
        broadcastSoundsSync();
      }
      if (event === 'leave' && data && data.name) {
        pushChatMsg('system', `${data.name} a quitté le salon`);
      }
    }
    if (event === 'chat') pushChatMsg('msg', data.content, data.name, data.avatar);
    if (event === 'sound') {
      if (data.soundUrl) previewSfx(data.soundUrl);
      spawnLobbyEmote(data.emoji || '🎵');
      pushChatMsg('system', `${data.name} a joué un son 🔊`);
    }
    if (event === 'sync' && data.type === 'sounds' && !sbIsHost()) {
      STATE.lobbyPerso.customSounds = data.sounds || [];
      updateLobbyCustomPads();
    }
    if (event === 'game' && data.type === 'start') {
      STATE.game.songs = data.songs;
      STATE.game.total = data.total;
      pushChatMsg('system', 'La partie commence !');
      setTimeout(() => navigateTo('game'), 400);
    }
  });

  const backBtn = document.getElementById('lobby-back-btn');
  if (backBtn) {
    backBtn.onclick = () => {
      sbLeaveRoom();
      STATE.room = { code: null, _isHost: false, _joined: false };
      navigateTo('home');
    };
  }

  const copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.onclick = () => {
      const url = 'https://pompelup.vercel.app/' + STATE.room.code;
      navigator.clipboard?.writeText(url).catch(() => {});
      const icon = copyLinkBtn.querySelector('.copy-icon');
      if (icon) {
        icon.textContent = 'COPIÉ ✓';
        copyLinkBtn.style.background = 'rgba(34,197,94,0.12)';
        setTimeout(() => { icon.textContent = 'COPIER'; copyLinkBtn.style.background = ''; }, 2000);
      }
    };
  }

  const mult = STATE.animDensity === 'calm' ? 0.5 : STATE.animDensity === 'chaos' ? 1.6 : 1;
  gsap.from('.lobby-title', { y: -20, opacity: 0, duration: 0.5 / mult });
  gsap.from('.lobby-grid .panel', { x: -30, opacity: 0, stagger: 0.08, duration: 0.4 });
  gsap.from('.copy-link-btn', { y: 20, opacity: 0, duration: 0.4, delay: 0.4 });
  updateLobbyCustomPads();
  gsap.killTweensOf('#start-game-btn');
  gsap.set('#start-game-btn', { scale: 1, clearProps: 'box-shadow' });
  gsap.fromTo('#start-game-btn', { scale: 0 }, { scale: 1, duration: 0.55, delay: 0.5, ease: 'back.out(1.7)', overwrite: 'auto' });
}

function renderLobbyPlayers(players) {
  const stage = $('#players-stage');
  if (!stage) return;
  stage.innerHTML = '';
  const myId = sbMyId();
  for (let i = 0; i < 8; i++) {
    const node = document.createElement('div');
    if (i < players.length) {
      const p = players[i];
      const isMe = p.id === myId;
      node.className = 'lp-card' + (p.isHost ? ' host' : '') + (isMe ? ' you' : '');
      node.innerHTML = `
        <div class="lp-bubble"><img src="${avatarUrl(p.avatar)}" alt=""></div>
        <div class="lp-name">${p.isHost ? '<span>👑</span>' : ''}${p.name}${isMe ? ' <span style="opacity:0.6">(toi)</span>' : ''}<span class="lvl">${p.level}</span></div>
        <div class="ready-tick">✓</div>
      `;
    } else {
      node.className = 'lp-card lp-empty';
      node.innerHTML = '<div class="lp-bubble">+</div><div class="lp-name">Libre</div>';
    }
    stage.appendChild(node);
  }
  const mult = STATE.animDensity === 'calm' ? 0.5 : STATE.animDensity === 'chaos' ? 1.6 : 1;
  gsap.from('#players-stage .lp-card:not(.lp-empty)', { scale: 0, opacity: 0, stagger: 0.06 / mult, duration: 0.4, ease: 'back.out(1.5)' });
}

function updateLobbyCount() {
  const sub = document.querySelector('.lobby-subtitle');
  if (!sub) return;
  const n = sbRoomPlayers().length;
  sub.textContent = `${n} joueur${n > 1 ? 's' : ''} sur 8 — partagez le code pour inviter`;
  const startBtn = document.getElementById('start-game-btn');
  if (startBtn && STATE.room._isHost) {
    if (n <= 1) {
      startBtn.disabled = true;
      startBtn.textContent = 'EN ATTENTE DE JOUEURS…';
      startBtn.title = 'Attends au moins 1 autre joueur pour lancer';
    } else {
      startBtn.disabled = false;
      startBtn.textContent = 'LANCER LA PARTIE';
      startBtn.title = '';
    }
  }
}

// Settings / chip / segment handlers
document.addEventListener('click', (e) => {
  const seg = e.target.closest('.seg-control');
  if (seg) {
    const btn = e.target.closest('button');
    if (btn) {
      const key = seg.dataset.set;
      const val = btn.dataset.v;
      if (key === 'goto') { navigateTo(val); return; }
      $$('button', seg).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (key === 'mode') $('#set-mode-val').textContent = val.toUpperCase();
      if (key === 'anim') STATE.animDensity = val;
      if (key === 'duration') STATE.room.duration = parseInt(val);
    }
  }
  const chip = e.target.closest('.chip');
  if (chip && !seg) chip.classList.toggle('active');
  const colChip = e.target.closest('.col-chip');
  if (colChip) {
    $$('.col-chip').forEach(c => c.classList.remove('active'));
    colChip.classList.add('active');
  }
});

// Slider — rounds
(function setupSlider() {
  const s = $('[data-set="rounds"]');
  if (!s) return;
  let drag = false;
  function setVal(clientX) {
    const rect = s.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const min = parseInt(s.dataset.min), max = parseInt(s.dataset.max);
    const v = Math.round(min + pct * (max - min));
    s.querySelector('.fill').style.width = (pct * 100) + '%';
    s.querySelector('.thumb').style.left = (pct * 100) + '%';
    $('#set-rounds-val').textContent = v;
    $('#set-rounds-v').textContent = v;
    STATE.game.total = v;
  }
  s.addEventListener('mousedown', (e) => { drag = true; setVal(e.clientX); });
  window.addEventListener('mousemove', (e) => { if (drag) setVal(e.clientX); });
  window.addEventListener('mouseup', () => { drag = false; });
})();

$('#start-game-btn').addEventListener('click', async () => {
  if (!sbIsHost()) return;
  const songs = [...SONGS].sort(() => Math.random() - 0.5).slice(0, STATE.game.total);
  STATE.game.songs = songs;
  await sbBroadcast('game', { type: 'start', songs, total: STATE.game.total });
  pushChatMsg('system', 'La partie commence !');
  setTimeout(() => navigateTo('game'), 400);
});

// ===== SOUNDBOARD =====
function playSoundFx(kind) {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const ctx = audioCtx;
  const t = ctx.currentTime;

  if (kind === 'airhorn') {
    // 3-note brassy horn
    [0, 0.18, 0.36].forEach((d, idx) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = 220;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 1200; f.Q.value = 6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + d);
      g.gain.linearRampToValueAtTime(0.32, t + d + 0.02);
      g.gain.setValueAtTime(0.32, t + d + 0.14);
      g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.18);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t + d); o.stop(t + d + 0.2);
      // octave layer
      const o2 = ctx.createOscillator();
      o2.type = 'square'; o2.frequency.value = 440;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, t + d);
      g2.gain.linearRampToValueAtTime(0.15, t + d + 0.02);
      g2.gain.exponentialRampToValueAtTime(0.001, t + d + 0.18);
      o2.connect(g2); g2.connect(ctx.destination);
      o2.start(t + d); o2.stop(t + d + 0.2);
    });
  } else if (kind === 'drumroll') {
    // Fast tom hits accelerating
    const totalHits = 18;
    for (let i = 0; i < totalHits; i++) {
      const ratio = i / totalHits;
      const at = t + ratio * ratio * 1.2;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(140 + Math.random() * 30, at);
      o.frequency.exponentialRampToValueAtTime(50, at + 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.1);
      o.connect(g); g.connect(ctx.destination);
      o.start(at); o.stop(at + 0.12);
    }
    // Crash at end
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / d.length * 4);
    const n = ctx.createBufferSource(); n.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000;
    const g = ctx.createGain(); g.gain.value = 0.4;
    n.connect(hp); hp.connect(g); g.connect(ctx.destination);
    n.start(t + 1.2);
  } else if (kind === 'rimshot') {
    // Snare + woodblock
    const snareBuf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const sd = snareBuf.getChannelData(0);
    for (let i = 0; i < sd.length; i++) sd[i] = (Math.random() * 2 - 1) * Math.exp(-i / sd.length * 6);
    const sn = ctx.createBufferSource(); sn.buffer = snareBuf;
    const sg = ctx.createGain(); sg.gain.value = 0.4;
    sn.connect(sg); sg.connect(ctx.destination); sn.start(t);
    // Tom (cymbal)
    setTimeout(() => {
      const tBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const td = tBuf.getChannelData(0);
      for (let i = 0; i < td.length; i++) td[i] = (Math.random() * 2 - 1) * Math.exp(-i / td.length * 3);
      const tn = ctx.createBufferSource(); tn.buffer = tBuf;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000;
      const tg = ctx.createGain(); tg.gain.value = 0.3;
      tn.connect(hp); hp.connect(tg); tg.connect(ctx.destination); tn.start(ctx.currentTime);
    }, 180);
  } else if (kind === 'boo') {
    // Crowd-like noise pitched down
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.7;
    const n = ctx.createBufferSource(); n.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 2;
    bp.frequency.setValueAtTime(800, t);
    bp.frequency.exponentialRampToValueAtTime(200, t + 1.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.1);
    g.gain.linearRampToValueAtTime(0, t + 1.4);
    n.connect(bp); bp.connect(g); g.connect(ctx.destination);
    n.start(t);
  } else if (kind === 'applause') {
    // Crowd applause via filtered noise bursts
    for (let i = 0; i < 30; i++) {
      const at = t + Math.random() * 1.8;
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / d.length * 5);
      const n = ctx.createBufferSource(); n.buffer = buf;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
      const g = ctx.createGain(); g.gain.value = 0.04 + Math.random() * 0.06;
      n.connect(hp); hp.connect(g); g.connect(ctx.destination);
      n.start(at);
    }
  } else if (kind === 'bass') {
    // Sub bass drop
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 0.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.55, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 1.05);
    // sub layer
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(240, t);
    o2.frequency.exponentialRampToValueAtTime(60, t + 0.8);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.2, t + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 1);
    o2.connect(g2); g2.connect(ctx.destination);
    o2.start(t); o2.stop(t + 1.05);
  } else if (kind === 'ding') {
    // Bell ding
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25 - i * 0.08, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 1.3);
    });
  } else if (kind === 'laugh') {
    // Cartoon "ha ha ha"
    for (let i = 0; i < 4; i++) {
      const at = t + i * 0.18;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(380 - i * 30, at);
      o.frequency.exponentialRampToValueAtTime(200 - i * 20, at + 0.12);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 1500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.2, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(at); o.stop(at + 0.18);
    }
  }
}

function spawnLobbyEmote(emoji, fromX, fromY) {
  const center = $('.lobby-center');
  if (!center) return;
  const rect = center.getBoundingClientRect();
  const span = document.createElement('div');
  span.className = 'lobby-floating-emote';
  span.textContent = emoji;
  const startX = (fromX !== undefined ? fromX : 50 + Math.random() * (rect.width - 100));
  const startY = (fromY !== undefined ? fromY : rect.height - 100);
  span.style.left = startX + 'px';
  span.style.top = startY + 'px';
  center.appendChild(span);
  gsap.fromTo(span,
    { y: 0, opacity: 1, scale: 0.4, rotation: (Math.random() - 0.5) * 30 },
    {
      y: -(rect.height * 0.7), opacity: 0,
      scale: 1.4, rotation: (Math.random() - 0.5) * 60,
      duration: 1.8 + Math.random() * 0.6, ease: 'power1.out',
      onComplete: () => span.remove()
    }
  );
}

// Wire up sound pads
document.addEventListener('click', (e) => {
  const sound = e.target.closest('.sb-pad-sound');
  if (sound) {
    sound.classList.remove('firing');
    void sound.offsetWidth;
    sound.classList.add('firing');
    if (sound.dataset.soundUrl) {
      previewSfx(sound.dataset.soundUrl);
    } else if (sound.dataset.sound) {
      playSoundFx(sound.dataset.sound);
    }
    setTimeout(() => sound.classList.remove('firing'), 400);
    const cRect = $('.lobby-center')?.getBoundingClientRect();
    if (cRect) {
      const rect = sound.getBoundingClientRect();
      spawnLobbyEmote(sound.querySelector('.pad-emoji')?.textContent || '🎵',
        rect.left - cRect.left + rect.width / 2,
        rect.top - cRect.top);
    }
    pushChatMsg('system', `${STATE.player.name} a joué un son 🔊`);
    if (sbHasRoom()) sbBroadcast('sound', { soundUrl: sound.dataset.soundUrl, emoji: sound.querySelector('.pad-emoji')?.textContent, name: STATE.player.name });
  }
  const emote = e.target.closest('.sb-pad-emote');
  if (emote) {
    emote.classList.remove('firing');
    void emote.offsetWidth;
    emote.classList.add('firing');
    setTimeout(() => emote.classList.remove('firing'), 400);
    // burst 3 emotes
    const em = emote.dataset.emote;
    const rect = emote.getBoundingClientRect();
    const cRect = $('.lobby-center').getBoundingClientRect();
    const x = rect.left - cRect.left + rect.width / 2;
    const y = rect.top - cRect.top;
    spawnLobbyEmote(em, x, y);
    setTimeout(() => spawnLobbyEmote(em, x + 30, y), 120);
    setTimeout(() => spawnLobbyEmote(em, x - 30, y), 240);
    playSoundFx('ding');
  }
});

function _pushMsg(listId, kind, content, name, seed, maxMsgs) {
  const list = $('#' + listId);
  if (!list) return;
  const div = document.createElement('div');
  const safe = escHtml(content);
  if (kind === 'system') {
    div.className = 'chat-msg system';
    div.innerHTML = `<div class="cm-body"><div class="ct">${safe}</div></div>`;
  } else {
    div.className = 'chat-msg' + (kind === 'you' ? ' you' : '');
    div.innerHTML = `
      <div class="ca"><img src="${escHtml(avatarUrl(seed))}" alt=""></div>
      <div class="cm-body">
        <div class="cn"><b>${escHtml(name || '')}</b></div>
        <div class="ct">${safe}</div>
      </div>
    `;
  }
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
  gsap.from(div, { y: 12, opacity: 0, duration: 0.3 });
  if (maxMsgs) while (list.children.length > maxMsgs) list.removeChild(list.firstChild);
}
function pushChatMsg(kind, content, name, seed) { _pushMsg('chat-list', kind, content, name, seed); }

const chatField = $('#chat-input-field');
if (chatField) {
  chatField.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const msg = e.target.value.trim();
      pushChatMsg('you', msg, STATE.player.name, STATE.player.avatar);
      e.target.value = '';
      if (sbHasRoom()) {
        await sbBroadcast('chat', { content: msg, name: STATE.player.name, avatar: STATE.player.avatar });
      } else {
        setTimeout(() => {
          const replies = ['lol', 'go go go 🔥', 'on lance ?', 'cap', 'bro 💀', '+1', 'hâte'];
          const b = STATE.bots[Math.floor(Math.random() * STATE.bots.length)];
          if (b) pushChatMsg('msg', replies[Math.floor(Math.random() * replies.length)], b.name, b.seed);
        }, 800 + Math.random() * 1200);
      }
    }
  });
}

function showJoinCodeError() {
  const input = document.getElementById('join-code-input');
  if (!input) return;
  input.classList.add('shake');
  input.style.borderColor = '#EF4444';
  let hint = input.parentElement.querySelector('.join-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.className = 'join-hint';
    input.parentElement.appendChild(hint);
  }
  hint.textContent = '6 caractères requis';
  hint.style.cssText = 'color:#EF4444;font-size:11px;text-align:center;margin-top:4px;';
  input.value = '';
  setTimeout(() => {
    input.classList.remove('shake');
    input.style.borderColor = '';
    if (hint) hint.textContent = '';
  }, 1500);
  input.focus();
}

const joinInput = document.getElementById('join-code-input');
if (joinInput) {
  joinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const code = joinInput.value.trim().toUpperCase();
      if (code.length === 6) {
        STATE.room.code = code;
        STATE.room._isHost = false;
        STATE.room._joined = true;
        navigateTo('lobby');
      } else {
        showJoinCodeError();
      }
    }
  });
}

// ===== GAME =====
let gameTimer = null, vizAnim = null, botTimers = [];

function buildRadialBars() {
  const wrap = $('#viz-bars-radial');
  if (!wrap) return;
  wrap.innerHTML = '';
  const count = 28;
  for (let i = 0; i < count; i++) {
    const bar = document.createElement('div');
    bar.className = 'eq-bar';
    wrap.appendChild(bar);
  }
}

// Audio
let audioCtx = null, analyser = null, freqData = null, currentLoop = null;
function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
  if (audioCtx) {
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.connect(audioCtx.destination);
  }
}
function startSongLoop(song) {
  initAudio();
  if (!audioCtx) return null;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  stopSongLoop();

  const ctx = audioCtx;
  const out = ctx.createGain();
  out.gain.value = 0.13;
  out.connect(analyser);

  const beat = 60 / song.bpm;
  const bassNotes = [55, 55, 73.5, 65.5, 49, 49, 65.5, 73.5];
  const bass = ctx.createOscillator();
  bass.type = 'sawtooth';
  const bassGain = ctx.createGain(); bassGain.gain.value = 0;
  const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 300;
  bass.connect(filt); filt.connect(bassGain); bassGain.connect(out);
  bass.frequency.value = bassNotes[0];
  bass.start();
  const startAt = ctx.currentTime;
  const loopLen = beat * 8;
  for (let cycle = 0; cycle < 60; cycle++) {
    for (let s = 0; s < 8; s++) {
      const t0 = startAt + cycle * loopLen + s * beat;
      bass.frequency.setValueAtTime(bassNotes[s], t0);
      bassGain.gain.setValueAtTime(0, t0);
      bassGain.gain.linearRampToValueAtTime(0.6, t0 + 0.02);
      bassGain.gain.linearRampToValueAtTime(0, t0 + beat * 0.9);
    }
  }
  const kickInt = setInterval(() => {
    if (!currentLoop || currentLoop.stopped) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2);
  }, beat * 1000);
  const hatInt = setInterval(() => {
    if (!currentLoop || currentLoop.stopped) return;
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, 0.05 * ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000;
    const g = ctx.createGain(); g.gain.value = 0.18;
    noise.connect(hp); hp.connect(g); g.connect(out);
    noise.start();
  }, beat * 500);
  const chord = ctx.createOscillator();
  chord.type = 'triangle'; chord.frequency.value = 220;
  const chordGain = ctx.createGain(); chordGain.gain.value = 0.06;
  chord.connect(chordGain); chordGain.connect(out);
  chord.start();
  const cn = [220, 220, 261.6, 246.9];
  for (let i = 0; i < 60; i++) chord.frequency.setValueAtTime(cn[i % 4], startAt + i * loopLen / 4);

  currentLoop = { stopped: false, out, bass, chord, kickInt, hatInt };
  return currentLoop;
}
function stopSongLoop() {
  if (!currentLoop) return;
  currentLoop.stopped = true;
  clearInterval(currentLoop.kickInt);
  clearInterval(currentLoop.hatInt);
  try {
    currentLoop.out.gain.setValueAtTime(currentLoop.out.gain.value, audioCtx.currentTime);
    currentLoop.out.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
    setTimeout(() => { try { currentLoop.bass.stop(); currentLoop.chord.stop(); } catch (e) {} }, 250);
  } catch (e) {}
  currentLoop = null;
}
function playWinSound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t + i * 0.08);
    g.gain.linearRampToValueAtTime(0.2, t + i * 0.08 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.4);
  });
}
function playWrongSound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
  o.type = 'square'; o.frequency.value = 180;
  o.frequency.exponentialRampToValueAtTime(80, t + 0.25);
  g.gain.value = 0.1; g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.35);
}

function animateViz() {
  const bars = $$('#viz-bars-radial .eq-bar');
  if (!bars.length) { vizAnim = requestAnimationFrame(animateViz); return; }
  if (!analyser) {
    const now = Date.now();
    bars.forEach((b, i) => {
      const h = 8 + Math.abs(Math.sin(now / 200 + i * 0.4)) * 38
              + Math.abs(Math.sin(now / 90 + i * 0.7)) * 14;
      b.style.height = h + 'px';
    });
  } else {
    analyser.getByteFrequencyData(freqData);
    bars.forEach((b, i) => {
      const idx = Math.floor((i / bars.length) * freqData.length);
      const v = freqData[idx] / 255;
      const h = 8 + v * 56;
      b.style.height = h + 'px';
    });
  }
  vizAnim = requestAnimationFrame(animateViz);
}

async function startGame() {
  const rp = sbRoomPlayers();
  if (rp.length > 1) {
    STATE._multiPlayers = rp;
    STATE.bots = [];
    STATE.totals = {};
    rp.forEach(p => { STATE.totals[p.name] = 0; });
  } else {
    STATE._multiPlayers = null;
    if (!STATE.bots.length) {
      STATE.bots = [
        { name: 'Cath',  seed: 'cath-vibe',   color: '#3B4FE8', level: 18, accuracy: 0.7, delay: 0.45 },
        { name: 'Jules', seed: 'jules-fresh', color: '#22C55E', level: 7,  accuracy: 0.5, delay: 0.7 },
        { name: 'Léa',   seed: 'lea-sunset',  color: '#F472B6', level: 24, accuracy: 0.65, delay: 0.55 }
      ];
    }
    STATE.totals = {};
    STATE.totals[STATE.player.name] = 0;
    STATE.bots.forEach(b => { STATE.totals[b.name] = 0; });
  }
  STATE.game.round = 0;
  STATE.game.history = [];
  $('#g-total').textContent = STATE.game.total;
  const prog = $('#g-progress');
  prog.innerHTML = '';
  for (let i = 0; i < STATE.game.total; i++) {
    const d = document.createElement('div');
    d.className = 'rcp';
    prog.appendChild(d);
  }
  $('#g-chat').innerHTML = '';
  buildRadialBars();
  animateViz();
  refreshPresenter();
  setTimeout(() => presenterSay('intro', 'excited', 2500), 300);

  // Unlock AudioContext NOW while still in user-gesture context
  initAudio();
  if (audioCtx?.state === 'suspended') audioCtx.resume();

  // Songs set by lobby/solo launch; if missing, pick a random pool
  if (!STATE.game.songs || STATE.game.songs.length < STATE.game.total) {
    STATE.game.songs = [...SONGS].sort(() => Math.random() - 0.5).slice(0, STATE.game.total);
  }

  pushGameChat('system', '🎵 Chargement des musiques…');
  STATE.game.songs = await loadGamePreviews(STATE.game.songs);
  const n = STATE.game.songs.filter(s => s.previewUrl).length;
  pushGameChat('system', n > 0
    ? `✓ ${n} / ${STATE.game.total} previews prêtes`
    : '🎛️ Mode synthèse audio');

  startRound();
}

function pushGameChat(kind, content, name, seed) { _pushMsg('g-chat', kind, content, name, seed, 12); }

$('#g-chat-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $('#g-chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  pushGameChat('you', msg, STATE.player.name, STATE.player.avatar);
  if (sbHasRoom()) {
    await sbBroadcast('chat', { content: msg, name: STATE.player.name, avatar: STATE.player.avatar });
  }
});

function startRound() {
  STATE.game.round++;
  $$('#g-progress .rcp').forEach((d, i) => {
    d.classList.remove('current');
    if (i < STATE.game.round - 1) d.classList.add('done');
    if (i === STATE.game.round - 1) d.classList.add('current');
  });
  if (STATE.game.round > STATE.game.total) return endGame();

  $('#g-round').textContent = STATE.game.round;
  const songPool = STATE.game.songs || SONGS;
  const song = songPool[(STATE.game.round - 1) % songPool.length];
  STATE.game.currentSong = song;
  STATE.game.time = STATE.game.maxTime = 30;
  STATE.game.pointsAvail = 1000;
  STATE.game.found = false;
  STATE.game.jokers = {};
  STATE.game.doubleNext = false;
  STATE.scores = {};
  const allInGame = STATE._multiPlayers || [{ name: STATE.player.name }, ...STATE.bots];
  allInGame.forEach(p => { STATE.scores[p.name] = null; });
  STATE.game.perRound = { points: 0, xp: 0, foundBy: 0 };

  $('#g-input').value = '';
  $('#g-input').disabled = false;
  $('#g-hint').textContent = '';
  $('#answer-card').classList.remove('correct', 'wrong', 'partial');
  $$('.joker-pill').forEach(p => p.classList.remove('used'));
  $('#round-end').classList.remove('active');
  $('#timer-big').classList.remove('danger');

  updatePlayersRail();
  if (song.previewUrl) {
    spPlayPreview(song.previewUrl);
  } else {
    startSongLoop(song);
  }
  // Show album art in round-end overlay if available
  if (song.albumArt) {
    const reArt = $('#re-art');
    if (reArt) { reArt.innerHTML = `<img src="${escHtml(song.albumArt)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="">`; }
  }

  gsap.from('.viz-card', { y: -20, opacity: 0, duration: 0.4 });
  gsap.from('.answer-card', { y: 20, opacity: 0, duration: 0.4, delay: 0.1 });
  gsap.from('.joker-pill', { y: 10, opacity: 0, stagger: 0.05, duration: 0.3, delay: 0.2 });
  setTimeout(() => $('#g-input').focus(), 400);
  // Presenter teases after a beat
  setTimeout(() => { if (!STATE.game.found && STATE.game.time > 12) presenterSay('tease', 'idle', 3000); }, 3500);
  STATE.game.timerWarned = false;

  clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    STATE.game.time -= 0.1;
    const t = Math.max(0, STATE.game.time);
    $('#timer-num').textContent = Math.ceil(t);
    $('#timer-big').classList.toggle('danger', t <= 6);
    STATE.game.pointsAvail = Math.max(100, Math.floor(100 + 900 * (t / STATE.game.maxTime)));
    $('#g-points').textContent = STATE.game.pointsAvail.toLocaleString('fr');
    if (t <= 10 && t > 0 && !STATE.game.timerWarned && !STATE.game.found) {
      STATE.game.timerWarned = true;
      presenterSay('timer', 'excited', 2000);
    }
    if (t <= 0) { clearInterval(gameTimer); endRound(); }
  }, 100);

  clearBotTimers();
  STATE.bots.forEach(b => {
    if (Math.random() > b.accuracy) return;
    const at = (STATE.game.maxTime * b.delay + Math.random() * 4) * 1000;
    const t = setTimeout(() => {
      if (STATE.scores[b.name] != null) return;
      const pts = Math.floor(STATE.game.pointsAvail * (0.9 + Math.random() * 0.1));
      STATE.scores[b.name] = pts;
      STATE.totals[b.name] = (STATE.totals[b.name] || 0) + pts;
      STATE.game.perRound.foundBy++;
      pushGameChat('msg', `${song.title.split(' ').slice(0, 2).join(' ').toLowerCase()} ?`, b.name, b.seed);
      setTimeout(() => pushGameChat('system', `${b.name} a trouvé ! +${pts} pts`), 200);
      updatePlayersRail();
    }, at);
    botTimers.push(t);
  });

  for (let i = 0; i < 3; i++) {
    const t = setTimeout(() => {
      if (STATE.game.found || STATE.game.time <= 0) return;
      const b = STATE.bots[Math.floor(Math.random() * STATE.bots.length)];
      const msgs = ['🤔', 'je connais...', '😭', 'attends', 'mais nan', '🔥🔥', 'jconnais ce truc', '👀'];
      pushGameChat('msg', msgs[Math.floor(Math.random() * msgs.length)], b.name, b.seed);
    }, 3000 + i * 5000 + Math.random() * 2000);
    botTimers.push(t);
  }
}

function updatePlayersRail() {
  const myId = sbMyId();
  const players = STATE._multiPlayers
    ? STATE._multiPlayers.map(p => ({ name: p.name, seed: p.avatar, you: p.id === myId }))
    : [{ name: STATE.player.name, seed: STATE.player.avatar, you: true }, ...STATE.bots];
  const sorted = players.slice().sort((a, b) => (STATE.totals[b.name] || 0) - (STATE.totals[a.name] || 0));
  $('#pr-list').innerHTML = sorted.map((p, i) => {
    const total = STATE.totals[p.name] || 0;
    const round = STATE.scores[p.name];
    const found = round != null;
    return `<div class="pr-row ${found ? 'found' : ''} ${p.you ? 'you' : ''}">
      <span class="rank">#${i + 1}</span>
      <div class="pa"><img src="${avatarUrl(p.seed)}" alt=""></div>
      <div class="nm">${p.name}${p.you ? ' <span class="you-tag">(toi)</span>' : ''}</div>
      <div class="pts">${total.toLocaleString('fr')}</div>
      ${found ? `<div class="float-pts">+${round}</div>` : ''}
    </div>`;
  }).join('');
  updateSceneWall();
}

// Mur des participants dans la scène de jeu : pas de siège vide,
// check vert à la place de l'avatar dès qu'un joueur a trouvé.
function updateSceneWall() {
  const wall = document.getElementById('scene-wall');
  if (!wall) return;
  const myId2 = sbMyId();
  const players = STATE._multiPlayers
    ? STATE._multiPlayers.map(p => ({ name: p.name, seed: p.avatar, you: p.id === myId2 }))
    : [{ name: STATE.player.name, seed: STATE.player.avatar, you: true }, ...STATE.bots];
  wall.innerHTML = players.map(p => {
    const found = STATE.scores[p.name] != null;
    return `<div class="sw-player ${found ? 'found' : ''} ${p.you ? 'you' : ''}">
      <div class="sw-bubble">
        <img src="${avatarUrl(p.seed)}" alt="">
        <div class="sw-check"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
      </div>
      <div class="sw-name">${p.name}${p.you ? ' (toi)' : ''}</div>
    </div>`;
  }).join('');
}

function clearBotTimers() { botTimers.forEach(clearTimeout); botTimers = []; }
function stopGameLoop() {
  clearInterval(gameTimer);
  clearBotTimers();
  cancelAnimationFrame(vizAnim);
  stopSongLoop();
  spStopPreview();
}

const gForm = $('#g-form');
if (gForm) gForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = $('#g-input').value;
  if (!val.trim()) return;
  const song = STATE.game.currentSong;
  if (!song) return;
  const result = checkAnswer(val, song);
  const card = $('#answer-card');
  card.classList.remove('correct', 'wrong', 'partial');

  if (result.correct && !STATE.game.found) {
    STATE.game.found = true;
    let pts = STATE.game.pointsAvail;
    if (STATE.game.doubleNext) { pts *= 2; STATE.game.doubleNext = false; }
    STATE.scores[STATE.player.name] = pts;
    STATE.totals[STATE.player.name] = (STATE.totals[STATE.player.name] || 0) + pts;
    STATE.game.perRound.points = pts;
    STATE.game.perRound.xp = 80 + Math.floor(pts / 30);
    STATE.game.perRound.foundBy++;
    card.classList.add('correct');
    $('#g-hint').textContent = '✓ Trouvé !';
    $('#g-input').disabled = true;
    playWinSound();
    spawnConfetti();
    pushGameChat('you', val, STATE.player.name, STATE.player.avatar);
    pushGameChat('system', `${STATE.player.name} a trouvé ! +${pts} pts`);
    updatePlayersRail();
    presenterSay('correct', 'excited', 2500);
    setTimeout(endRound, 2400);
  } else if (result.partial) {
    card.classList.add('partial');
    $('#g-hint').textContent = '🔥 Tu brûles…';
    gsap.fromTo(card, { x: -4 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
  } else {
    card.classList.add('wrong');
    $('#g-hint').textContent = '❌ Pas ça';
    gsap.fromTo(card, { x: 0 }, {
      x: 0, duration: 0.4,
      keyframes: [{ x: -10 }, { x: 10 }, { x: -7 }, { x: 7 }, { x: 0 }]
    });
    playWrongSound();
    setTimeout(() => { card.classList.remove('wrong'); $('#g-hint').textContent = ''; }, 1200);
  }
});

$$('.joker-pill').forEach(p => {
  p.addEventListener('click', () => {
    if (p.classList.contains('used')) return;
    const j = p.dataset.joker;
    if (STATE.game.jokers[j]) return;
    STATE.game.jokers[j] = true;
    p.classList.add('used');
    const song = STATE.game.currentSong;
    let msg = '';
    if (j === 'letter') msg = `🔤 Commence par "${song.title[0]}"`;
    if (j === 'artist') msg = `🎤 Artiste : ${song.artist}`;
    if (j === 'tempo')  msg = `🎵 ${song.bpm} BPM`;
    if (j === 'decade') msg = `📅 Années ${Math.floor(song.year / 10) * 10}`;
    if (j === 'length') {
      const letters = song.title.replace(/[^a-zA-ZÀ-ÿ]/g, '').length;
      const words = song.title.trim().split(/\s+/).length;
      msg = `📏 ${words} mot${words > 1 ? 's' : ''} · ${letters} lettres`;
    }
    if (j === 'time') {
      STATE.game.time += 10;
      STATE.game.maxTime += 10;
      msg = '⏱ +10 secondes';
    }
    if (j === 'double') {
      STATE.game.doubleNext = true;
      msg = '💎 Tes prochains points seront doublés !';
    }
    if (j === 'skip') {
      msg = '⏭️ Manche passée — on enchaîne';
      $('#g-hint').textContent = msg;
      $('#g-hint').style.color = 'var(--blue)';
      gsap.fromTo(p, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(1.6)' });
      setTimeout(endRound, 500);
      return;
    }
    $('#g-hint').textContent = msg;
    $('#g-hint').style.color = 'var(--blue)';
    setTimeout(() => $('#g-hint').style.color = '', 3000);
    gsap.fromTo(p, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(1.6)' });
  });
});

$$('.emote-btn:not(.gif-btn)').forEach(b => {
  b.addEventListener('click', () => spawnFloatingEmote(b.dataset.emote));
});

// ===== GIF PICKER (Giphy) =====
const GIPHY_KEY = 'sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh';
let _gifSearchTimer = null;

function openGifPicker() {
  const picker = $('#gif-picker'); if (!picker) return;
  picker.classList.add('active');
  const input = $('#gif-search-input');
  if (input) { input.value = ''; input.focus(); }
  loadGifs('trending');
}
function closeGifPicker() {
  const picker = $('#gif-picker'); if (!picker) return;
  picker.classList.remove('active');
}

async function loadGifs(query) {
  const grid = $('#gif-grid'); if (!grid) return;
  grid.innerHTML = '<div class="gif-loading">⏳</div>';
  try {
    const isTrending = query === 'trending';
    const url = isTrending
      ? `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=18&rating=g`
      : `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=18&rating=g`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Giphy error');
    const json = await res.json();
    const gifs = json.data;
    if (!gifs.length) { grid.innerHTML = '<div class="gif-loading">Aucun résultat</div>'; return; }
    grid.innerHTML = gifs.map(g => `
      <button class="gif-item" data-gif-url="${escHtml(g.images.fixed_height_small.url)}" data-gif-full="${escHtml(g.images.fixed_height.url)}" title="${escHtml(g.title)}">
        <img src="${escHtml(g.images.fixed_height_small.url)}" alt="${escHtml(g.title)}" loading="lazy">
      </button>`).join('');
    $$('.gif-item', grid).forEach(btn => {
      btn.onclick = () => {
        sendGif(btn.dataset.gifFull, btn.dataset.gifUrl);
        closeGifPicker();
      };
    });
    gsap.from('.gif-item', { scale: 0.8, opacity: 0, stagger: 0.02, duration: 0.25, ease: 'back.out(1.4)' });
  } catch(e) {
    grid.innerHTML = '<div class="gif-loading">Erreur de chargement</div>';
  }
}

function sendGif(gifUrl, previewUrl) {
  const list = $('#g-chat'); if (!list) return;
  const div = document.createElement('div');
  div.className = 'chat-msg you gif-msg';
  div.innerHTML = `
    <div class="ca"><img src="${escHtml(avatarUrl(STATE.player.avatar))}" alt=""></div>
    <div class="cm-body">
      <div class="cn"><b>${escHtml(STATE.player.name)}</b></div>
      <div class="ct ct-gif"><img class="chat-gif" src="${escHtml(gifUrl)}" alt="GIF" loading="lazy"></div>
    </div>`;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
  gsap.from(div, { y: 12, opacity: 0, duration: 0.3 });
  while (list.children.length > 12) list.removeChild(list.firstChild);
  if (sbHasRoom()) sbBroadcast('chat', { gif: gifUrl, name: STATE.player.name, avatar: STATE.player.avatar });
}

document.getElementById('game-gif-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const picker = $('#gif-picker');
  if (picker?.classList.contains('active')) closeGifPicker(); else openGifPicker();
});
document.getElementById('gif-picker-close')?.addEventListener('click', closeGifPicker);
document.getElementById('gif-search-input')?.addEventListener('input', (e) => {
  clearTimeout(_gifSearchTimer);
  const q = e.target.value.trim();
  _gifSearchTimer = setTimeout(() => loadGifs(q || 'trending'), 400);
});
document.addEventListener('mousedown', (e) => {
  const picker = $('#gif-picker');
  if (picker?.classList.contains('active') && !picker.contains(e.target) && e.target.id !== 'game-gif-btn') {
    closeGifPicker();
  }
});
function spawnFloatingEmote(em) {
  const stage = $('#stage');
  const span = document.createElement('div');
  span.className = 'floating-emote';
  span.textContent = em;
  span.style.left = (1100 + Math.random() * 200) + 'px';
  span.style.bottom = '120px';
  stage.appendChild(span);
  gsap.fromTo(span, { y: 0, opacity: 1, scale: 0.3 },
    { y: -400 - Math.random() * 100, opacity: 0, scale: 1.6, duration: 2.2, ease: 'power2.out',
      onComplete: () => span.remove() });
}

function spawnConfetti() {
  const stage = $('#stage');
  const mult = STATE.animDensity === 'calm' ? 15 : STATE.animDensity === 'chaos' ? 80 : 40;
  for (let i = 0; i < mult; i++) {
    const c = document.createElement('div');
    c.style.cssText = `position:absolute; width:10px; height:16px; left:50%; top:30%; background:${['#F97316','#FBBF24','#3B4FE8','#22C55E','#F472B6'][i%5]}; z-index:60; pointer-events:none; border-radius:2px;`;
    stage.appendChild(c);
    gsap.fromTo(c, { x: 0, y: 0, rotation: 0, opacity: 1 },
      { x: (Math.random() - 0.5) * 600, y: 500 + Math.random() * 200, rotation: Math.random() * 720,
        opacity: 0, duration: 1.6 + Math.random(), ease: 'power2.out',
        onComplete: () => c.remove() });
  }
}

function endRound() {
  clearInterval(gameTimer);
  clearBotTimers();
  stopSongLoop();
  spStopPreview();
  if (!STATE.game.found) {
    presenterSay('tooLate', 'sad', 2500);
  }
  const song = STATE.game.currentSong;
  STATE.game.history.push({ song, ...STATE.game.perRound });

  const reArt = $('#re-art');
  if (song.albumArt) {
    reArt.innerHTML = `<img src="${escHtml(song.albumArt)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="">`;
    reArt.style.background = '';
  } else {
    reArt.innerHTML = '';
    reArt.textContent = song.emoji;
    reArt.style.background = `linear-gradient(135deg, ${song.color}, #1a1a1a)`;
  }
  $('#re-title').innerHTML = song.title.toUpperCase().replace(' ', '<br>');
  $('#re-artist').textContent = `${song.artist} · ${song.year}`;
  $('#re-pts').textContent = '+' + STATE.game.perRound.points;
  $('#re-xp').textContent = '+' + STATE.game.perRound.xp;
  $('#re-found').textContent = STATE.game.perRound.foundBy + '/4';
  $('#round-end').classList.add('active');

  gsap.fromTo('.re-art', { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.5)' });
  gsap.from('.re-title', { y: 30, opacity: 0, duration: 0.5, delay: 0.2 });
  gsap.from('.re-artist', { y: 20, opacity: 0, duration: 0.4, delay: 0.4 });
  gsap.from('.re-stat', { scale: 0, opacity: 0, stagger: 0.1, duration: 0.4, ease: 'back.out(1.6)', delay: 0.5 });

  setTimeout(() => {
    if (STATE.game.round >= STATE.game.total) endGame();
    else startRound();
  }, 3200);
}

function endGame() {
  stopGameLoop();
  STATE.player.xp = Math.min(2400, STATE.player.xp + 290);
  navigateTo('results');
}

// ===== RESULTS =====
function initResults() {
  const realPlayers = STATE._multiPlayers;
  const players = realPlayers
    ? realPlayers.map(p => ({ name: p.name, seed: p.avatar || 'guest' }))
    : [
        { name: STATE.player.name, seed: STATE.player.avatar },
        ...STATE.bots.map(b => ({ name: b.name, seed: b.seed }))
      ];
  if (!Object.keys(STATE.totals).some(k => STATE.totals[k] > 0)) {
    const demo = {};
    players.forEach((p, i) => { demo[p.name] = [4720, 3240, 2100, 1880][i] || 1000; });
    STATE.totals = demo;
  }
  const sorted = players.slice().sort((a, b) => (STATE.totals[b.name] || 0) - (STATE.totals[a.name] || 0));

  $('#pod1-name').textContent = sorted[0]?.name ?? '—';
  $('#pod1-score').textContent = (STATE.totals[sorted[0]?.name] || 0).toLocaleString('fr');
  $('#pod1-img').src = sorted[0] ? avatarUrl(sorted[0].seed) : '';
  $('#pod2-name').textContent = sorted[1]?.name ?? '—';
  $('#pod2-score').textContent = (STATE.totals[sorted[1]?.name] || 0).toLocaleString('fr');
  $('#pod2-img').src = sorted[1] ? avatarUrl(sorted[1].seed) : '';
  $('#pod3-name').textContent = sorted[2]?.name ?? '—';
  $('#pod3-score').textContent = (STATE.totals[sorted[2]?.name] || 0).toLocaleString('fr');
  $('#pod3-img').src = sorted[2] ? avatarUrl(sorted[2].seed) : '';

  const playerRank = sorted.findIndex(p => p.name === STATE.player.name) + 1;
  const title = $('.r-title');
  if (playerRank === 1) {
    title.innerHTML = `VICTOIRE <span class="winner">${sorted[0].name.toUpperCase()}</span> !`;
  } else if (playerRank === 2) {
    title.innerHTML = `PRESQUE...<br><span class="winner" style="font-size:80%">${sorted[0].name.toUpperCase()}</span> GAGNE`;
  } else {
    title.innerHTML = `BRAVO <span class="winner">${sorted[0].name.toUpperCase()}</span>`;
  }

  const history = STATE.game.history.length ? STATE.game.history : SONGS.slice(0, 5).map(s => ({
    song: s, points: Math.floor(Math.random() * 1000 + 300), foundBy: Math.floor(Math.random() * 4) + 1
  }));
  $('#songs-recap').innerHTML = history.map((h, i) => `<div class="song-row">
    <div class="sa" style="background: linear-gradient(135deg, ${h.song.color}, #1a1a1a); color:#fff;">${h.song.emoji}</div>
    <div class="sb">
      <div class="st">${h.song.title}</div>
      <div class="sa-name">${h.song.artist} · ${h.song.year}</div>
    </div>
    <div class="ss">
      <div class="ss-l">M${i + 1}</div>
      <div class="ss-v">${h.points ? '+' + h.points : 'raté'}</div>
    </div>
  </div>`).join('');

  $('#xp-cur').textContent = STATE.player.xp;

  gsap.from('.r-eyebrow', { y: -10, opacity: 0, duration: 0.4 });
  gsap.from('.r-title', { y: 30, opacity: 0, duration: 0.6, delay: 0.1, ease: 'back.out(1.3)' });
  gsap.from('.r-sub', { y: 20, opacity: 0, duration: 0.4, delay: 0.3 });
  gsap.from('.pcol', { y: 60, opacity: 0, stagger: 0.15, duration: 0.55, ease: 'back.out(1.4)', delay: 0.5 });
  gsap.from('.pcol .crown', { y: -40, opacity: 0, duration: 0.6, delay: 1.1, ease: 'bounce.out' });
  gsap.from('.results-right', { x: 30, opacity: 0, duration: 0.5, delay: 0.3 });
  gsap.from('.song-row', { x: 20, opacity: 0, stagger: 0.07, duration: 0.35, delay: 0.7 });

  setTimeout(() => {
    $('#xp-fill').style.width = (STATE.player.xp / 2400 * 100) + '%';
  }, 1200);

  if (playerRank === 1) setTimeout(() => spawnConfetti(), 600);

  // Wire results tabs
  $$('[data-results-tab]').forEach(btn => {
    btn.onclick = () => {
      $$('[data-results-tab]').forEach(b => b.classList.toggle('active', b === btn));
      const tab = btn.dataset.resultsTab;
      $('#songs-recap').style.display = tab === 'recap' ? '' : 'none';
      const statsPanel = $('#results-panel-stats');
      const vinylsPanel = $('#results-panel-vinyls');
      if (statsPanel) statsPanel.style.display = tab === 'stats' ? '' : 'none';
      if (vinylsPanel) vinylsPanel.style.display = tab === 'vinyls' ? '' : 'none';
      if (tab === 'stats' && statsPanel && !statsPanel.innerHTML) {
        statsPanel.innerHTML = `<div class="results-stats-panel">${
          sorted.map((p, i) => `<div class="rs-row${p.name === STATE.player.name ? ' you' : ''}">
            <div class="rs-rank">#${i + 1}</div>
            <div class="rs-avt"><img src="${avatarUrl(p.seed)}" alt=""></div>
            <div class="rs-name">${escHtml(p.name)}</div>
            <div class="rs-score">${(STATE.totals[p.name] || 0).toLocaleString('fr')} pts</div>
          </div>`).join('')
        }</div>`;
        gsap.from('.rs-row', { x: -20, opacity: 0, stagger: 0.08, duration: 0.4 });
      }
      if (tab === 'vinyls' && vinylsPanel && !vinylsPanel.innerHTML) {
        const gameSongs = STATE.game.history.length
          ? STATE.game.history.map(h => h.song)
          : (STATE.game.songs || SONGS).slice(0, STATE.game.total);
        vinylsPanel.innerHTML = `<div class="results-vinyls-panel">
          <div class="rv-heading">🎵 Musiques de la partie</div>
          ${gameSongs.map(song => `<div class="rv-item">
            ${song.albumArt
              ? `<img class="rv-album-art" src="${escHtml(song.albumArt)}" alt="">`
              : `<div class="v-disk rv-disk" style="--label:${song.color}"></div>`}
            <div class="rv-info">
              <div class="rv-name">${escHtml(song.title)}</div>
              <div class="rv-artist">${escHtml(song.artist)} · ${song.year}</div>
            </div>
          </div>`).join('')}
          <div class="rv-heading" style="margin-top:10px;">🎁 Vinyles gagnés</div>
          ${PACK_ITEMS.map(item => `<div class="rv-item ${item.rarity}">
            <div class="v-disk rv-disk" style="--label:${item.color}"></div>
            <div class="rv-info">
              <div class="rv-name">${escHtml(item.title)}</div>
              <div class="rv-artist">${escHtml(item.artist)}</div>
              <div class="rv-rar">${item.rarity === 'legendary' ? '👑 LÉG' : item.rarity === 'rare' ? '💎 RARE' : 'COMMUN'}</div>
            </div>
          </div>`).join('')}
        </div>`;
        gsap.from('.rv-item', { y: 20, opacity: 0, stagger: 0.1, duration: 0.4 });
      }
    };
  });
}

// ===== TWEAKS =====
$('#tweaks-fab').addEventListener('click', () => $('#tweaks-pop').classList.toggle('active'));

// Hide tweaks button in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  const fab = document.getElementById('tweaks-fab');
  if (fab) fab.style.display = 'none';
}

// ===== VINYL SCRATCH (home) =====
function playScratchSound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const ctx = audioCtx;
  const t = ctx.currentTime;
  const dur = 0.5;
  // Noise burst with sweep filter
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 8;
  bp.frequency.setValueAtTime(2400, t);
  bp.frequency.exponentialRampToValueAtTime(280, t + 0.18);
  bp.frequency.exponentialRampToValueAtTime(2400, t + 0.36);
  bp.frequency.exponentialRampToValueAtTime(180, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.35, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  noise.connect(bp); bp.connect(g); g.connect(ctx.destination);
  noise.start(t); noise.stop(t + dur);

  // Wobble tone underneath
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.4);
  osc.frequency.exponentialRampToValueAtTime(30, t + dur);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.linearRampToValueAtTime(0.12, t + 0.02);
  og.gain.exponentialRampToValueAtTime(0.001, t + dur);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 600;
  osc.connect(lp); lp.connect(og); og.connect(ctx.destination);
  osc.start(t); osc.stop(t + dur);
}

function setupVinylScratch() {
  $$('.disc').forEach((disc) => {
    let scratching = false;
    let lastX = 0;
    let velocity = 0;
    let currentRotation = 0;
    let baseSpin = null;

    function startBaseSpin() {
      const dir = disc.classList.contains('d2') || disc.classList.contains('d4') ? -1 : 1;
      const dur = disc.classList.contains('d1') ? 20 : disc.classList.contains('d2') ? 24 :
                  disc.classList.contains('d3') ? 16 : 28;
      baseSpin = gsap.to(disc, {
        rotation: '+=' + (dir * 360),
        duration: dur,
        repeat: -1,
        ease: 'none'
      });
    }
    startBaseSpin();

    disc.addEventListener('mousedown', (e) => {
      e.preventDefault();
      scratching = true;
      lastX = e.clientX;
      velocity = 0;
      if (baseSpin) baseSpin.pause();
      disc.classList.add('scratch-glow');
      currentRotation = gsap.getProperty(disc, 'rotation') || 0;
      playScratchSound();
    });

    window.addEventListener('mousemove', (e) => {
      if (!scratching) return;
      const dx = e.clientX - lastX;
      velocity = dx;
      currentRotation += dx * 0.8;
      gsap.set(disc, { rotation: currentRotation });
      lastX = e.clientX;
      // re-trigger scratch sound on fast motion
      if (Math.abs(dx) > 14 && Math.random() < 0.2) playScratchSound();
    });

    window.addEventListener('mouseup', () => {
      if (!scratching) return;
      scratching = false;
      disc.classList.remove('scratch-glow');
      // Inertia spin-down then resume base
      gsap.to(disc, {
        rotation: '+=' + (velocity * 3),
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          if (baseSpin) baseSpin.resume();
        }
      });
    });

    // Quick tap (no drag) = scratch effect
    disc.addEventListener('click', (e) => {
      if (Math.abs(velocity) > 2) return; // was a drag
      e.preventDefault();
      playScratchSound();
      if (baseSpin) baseSpin.pause();
      const dir = Math.random() > 0.5 ? 1 : -1;
      gsap.fromTo(disc, { rotation: gsap.getProperty(disc, 'rotation') }, {
        rotation: '+=' + (dir * 180),
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(disc, {
            rotation: '-=' + (dir * 90),
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => { if (baseSpin) baseSpin.resume(); }
          });
        }
      });
    });
  });
}

// ===== PACK OPENING (EPIC) =====
const PACK_ITEMS = [
  { title: 'Voyage Voyage',     artist: 'Desireless',   rarity: 'common',    color: '#F472B6' },
  { title: 'Africa',            artist: 'Toto',         rarity: 'rare',      color: '#22C55E' },
  { title: 'Sweet Dreams',      artist: 'Eurythmics',   rarity: 'epic',      color: '#A78BFA' },
  { title: 'Bohemian Rhapsody', artist: 'Queen',        rarity: 'legendary', color: '#FBBF24' }
];


function playRevealChime(rarity, delaySec = 0) {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const ctx = audioCtx;
  const t = ctx.currentTime + delaySec;
  const seq = rarity === 'legendary' ? [523, 659, 784, 1047, 1319]
            : rarity === 'rare'      ? [523, 784, 1047]
                                     : [659, 880];
  seq.forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = rarity === 'legendary' ? 'sine' : 'triangle';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t + i * 0.06);
    g.gain.linearRampToValueAtTime(rarity === 'legendary' ? 0.22 : 0.18, t + i * 0.06 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.6);
    o.connect(g); g.connect(ctx.destination);
    o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.7);
  });
  if (rarity === 'legendary') {
    // Big gong on legendary
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.value = 220;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 1.6);
  }
}

function renderPackCta() {
  const cta = $('#sb-pack-cta');
  if (!cta) return;
  const n = STATE.packsAvailable || 0;
  if (n <= 0) {
    cta.style.display = 'none';
  } else {
    cta.style.display = '';
    const label = $('#sb-pack-label');
    if (label) label.textContent = 'PACK DISPONIBLE · ' + n;
  }
}

function openDailyPack() {
  if ((STATE.packsAvailable || 0) <= 0) return;
  const overlay = $('#pack-overlay');
  const stage = $('#pack-stage');
  const art = $('#pack-art');
  const hint = $('#pack-tap-hint');
  const grid = $('#reveal-grid');
  const rays = $('#pack-rays');
  const halo = $('#pack-halo');
  const flash = $('#rarity-flash');

  overlay.classList.add('active');
  grid.classList.remove('active');
  grid.innerHTML = '';
  stage.style.display = '';
  flash.style.opacity = 0;

  // Reset transforms
  gsap.killTweensOf([art, hint, rays, halo, stage, flash]);
  gsap.set(art, { scale: 0, rotation: -25, y: 50, opacity: 1 });
  gsap.set(hint, { opacity: 0, y: 20 });
  gsap.set(rays, { opacity: 0, rotation: 0 });
  gsap.set(halo, { scale: 0.4, opacity: 0 });
  gsap.set(stage, { display: 'flex', opacity: 1 });

  // Build sequence
  const tl = gsap.timeline();
  tl.to(rays, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0)
    .to(rays, { rotation: 360, duration: 30, repeat: -1, ease: 'none' }, 0)
    .to(halo, { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' }, 0.1)
    .to(art, { scale: 1, rotation: 0, y: 0, duration: 0.7, ease: 'back.out(1.4)' }, 0.2)
    .to(hint, { opacity: 1, y: 0, duration: 0.4 }, 0.9)
    .to(art, { rotation: 4, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 1.2);

}

function revealPack() {
  // Le pack est consommé : on décrémente et on met à jour l'encart sidebar.
  if (STATE.packsAvailable > 0) {
    STATE.packsAvailable--;
    renderPackCta();
  }
  const stage = $('#pack-stage');
  const art = $('#pack-art');
  const hint = $('#pack-tap-hint');
  const flash = $('#rarity-flash');
  const overlay = $('#pack-overlay');

  // Determine top rarity in pack
  const topRarity = PACK_ITEMS.some(i => i.rarity === 'legendary') ? 'legendary'
                  : PACK_ITEMS.some(i => i.rarity === 'epic') ? 'epic'
                  : PACK_ITEMS.some(i => i.rarity === 'rare') ? 'rare'
                  : 'common';

  gsap.killTweensOf([art, hint]);

  // PHASE 1: anticipation shake
  const shake = gsap.timeline();
  shake.to(art, { rotation: -15, duration: 0.08 })
       .to(art, { rotation: 15, duration: 0.08 })
       .to(art, { rotation: -18, duration: 0.08 })
       .to(art, { rotation: 18, duration: 0.08 })
       .to(art, { rotation: -20, duration: 0.08 })
       .to(art, { rotation: 20, duration: 0.08 })
       .to(art, { rotation: 0, scale: 1.1, duration: 0.15, ease: 'power2.out' });

  // PHASE 2: tear-open animation
  shake.add(() => {
    // Burst particles
    packBurst(topRarity);
    // Pack splits horizontally
    gsap.to(art, {
      duration: 0.4,
      keyframes: [
        { scale: 1.3, rotation: -5 },
        { scale: 1.6, opacity: 0, y: -40 }
      ],
      ease: 'power3.out',
      onComplete: () => {
        art.style.display = 'none';
        hint.style.display = 'none';
        showRevealed();
      }
    });
  });
  gsap.to(hint, { opacity: 0, duration: 0.2 });
}

const LEGENDARY_SFX = [
  { id: 'leg-1', src: 'assets/legendary-1.mp3', name: 'WOOOOOH',     desc: 'Le cri de victoire' },
  { id: 'leg-2', src: 'assets/legendary-2.mp3', name: 'ÉPIC RISE',   desc: 'Montée épique' },
  { id: 'leg-3', src: 'assets/legendary-3.mp3', name: 'HYPE WAVE',   desc: 'Vague de hype' },
  { id: 'leg-4', src: 'assets/legendary-4.mp3', name: 'WOO !',       desc: 'Court et claqué' }
];
const EPIC_SFX = [
  { id: 'epic-1', src: 'assets/epic-1.mp3', name: 'BUILD UP',  desc: 'Montée en intensité' },
  { id: 'epic-2', src: 'assets/epic-2.mp3', name: 'BIG DROP',  desc: 'Drop épique' }
];

const SOUND_PREFS_DEFAULTS = { master: true, volume: 0.9, legendary: 'random', epic: 'random' };
const SOUND_PREFS = Object.assign({}, SOUND_PREFS_DEFAULTS);
function loadSoundPrefs() {
  try {
    const raw = localStorage.getItem('pompelup-sound-prefs');
    if (raw) Object.assign(SOUND_PREFS, JSON.parse(raw));
  } catch (e) {}
}
function saveSoundPrefs() {
  try { localStorage.setItem('pompelup-sound-prefs', JSON.stringify(SOUND_PREFS)); } catch (e) {}
}
loadSoundPrefs();

let _sfxAudio = null;
function _playSfx(list, prefKey) {
  if (!SOUND_PREFS.master) return;
  const pref = SOUND_PREFS[prefKey];
  if (pref === 'off') return;
  let item;
  if (pref && pref !== 'random') item = list.find(s => s.id === pref);
  if (!item) item = list[Math.floor(Math.random() * list.length)];
  try {
    if (_sfxAudio) { try { _sfxAudio.pause(); } catch(e){} _sfxAudio = null; }
    const a = new Audio(item.src);
    a.volume = SOUND_PREFS.volume;
    _sfxAudio = a;
    a.play().catch(() => {});
  } catch (e) {}
}
function playLegendarySfx() { _playSfx(LEGENDARY_SFX, 'legendary'); }
function playEpicSfx()      { _playSfx(EPIC_SFX,      'epic'); }

// Preview a single sound (ignores master toggle so user can hear what they pick)
let _previewAudio = null;
function previewSfx(src) {
  try {
    if (_previewAudio) { try { _previewAudio.pause(); } catch(e){} _previewAudio = null; }
    const a = new Audio(src);
    a.volume = SOUND_PREFS.volume;
    _previewAudio = a;
    a.play().catch(() => {});
  } catch (e) {}
}

function showRarityFlash(rarity) {
  const flash = $('#rarity-flash');
  const labels = {
    common: 'PAS MAL !',
    rare: '✨ RARE ! ✨',
    epic: '💎 ÉPIQUE ! 💎',
    legendary: '👑 LÉGENDAIRE ! 👑'
  };
  flash.className = 'rarity-flash ' + rarity;
  flash.textContent = labels[rarity] || labels.common;
  gsap.killTweensOf(flash);
  gsap.set(flash, { scale: 0, opacity: 0 });

  const tl = gsap.timeline();
  tl.to(flash, { scale: 1.15, opacity: 1, duration: 0.35, ease: 'back.out(2)' })
    .to(flash, { scale: 1, duration: 0.2, ease: 'power2.in' })
    .to(flash, { scale: 1.8, opacity: 0, duration: 0.5, delay: 0.4, ease: 'power2.in' });

  // Screen-shake effect on legendary
  if (rarity === 'legendary') {
    const overlay = $('#pack-overlay');
    gsap.to(overlay, {
      x: 0, duration: 0.6,
      keyframes: [{ x: -8 }, { x: 8 }, { x: -6 }, { x: 6 }, { x: 0 }],
      ease: 'power1.inOut'
    });
  }
}

function packBurst(topRarity) {
  const canvas = $('#pack-canvas');
  const rect = $('#pack-overlay').getBoundingClientRect();
  const stage = $('#stage');
  const scale = parseFloat((stage.style.transform || 'scale(1)').match(/scale\(([0-9.]+)\)/)?.[1] || 1);
  canvas.width = rect.width / scale;
  canvas.height = rect.height / scale;
  canvas.style.width = (rect.width / scale) + 'px';
  canvas.style.height = (rect.height / scale) + 'px';
  const cctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const parts = [];
  const palette = topRarity === 'legendary'
    ? ['#FBBF24', '#F97316', '#fff', '#FCD34D', '#FB923C']
    : topRarity === 'rare'
    ? ['#A78BFA', '#F472B6', '#fff', '#8B5CF6', '#3B4FE8']
    : ['#F97316', '#FBBF24', '#3B4FE8', '#22C55E', '#F472B6'];
  const count = topRarity === 'legendary' ? 220 : topRarity === 'rare' ? 150 : 100;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 8 + Math.random() * 18;
    parts.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      r: 3 + Math.random() * 6,
      c: palette[i % palette.length],
      life: 1,
      shape: Math.random() < 0.3 ? 'star' : Math.random() < 0.6 ? 'rect' : 'circle',
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.3
    });
  }
  function step() {
    cctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.32;
      p.vx *= 0.99;
      p.rot += p.rotV;
      p.life -= 0.011;
      cctx.globalAlpha = Math.max(0, p.life);
      cctx.fillStyle = p.c;
      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);
      if (p.shape === 'rect') {
        cctx.fillRect(-p.r, -p.r * 1.5, p.r * 2, p.r * 3);
      } else if (p.shape === 'star') {
        cctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = (k * 144 - 90) * Math.PI / 180;
          const r = k % 2 === 0 ? p.r * 1.5 : p.r * 0.7;
          cctx[k === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
        }
        cctx.closePath(); cctx.fill();
      } else {
        cctx.beginPath();
        cctx.arc(0, 0, p.r, 0, Math.PI * 2);
        cctx.fill();
      }
      cctx.restore();
    });
    cctx.globalAlpha = 1;
    if (parts.some(p => p.life > 0)) requestAnimationFrame(step);
    else cctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  step();
}

const VINYL_PREVIEW_CACHE = {};

async function playVinylHoverPreview(wrap) {
  if (!wrap.classList.contains('revealed')) return;
  const title  = wrap.querySelector('.rcb-title')?.textContent?.trim();
  const artist = wrap.querySelector('.rcb-artist')?.textContent?.trim();
  if (!title || !artist) return;
  const key = `${title}|||${artist}`;
  let url = VINYL_PREVIEW_CACHE[key];
  if (url === null) return;
  if (!url) {
    try {
      const it = await itunesSearch(title, artist);
      VINYL_PREVIEW_CACHE[key] = it?.previewUrl || null;
      url = VINYL_PREVIEW_CACHE[key];
    } catch(e) { return; }
  }
  if (!url) return;
  // Only play if still hovering
  if (!wrap.matches(':hover')) return;
  spStopPreview();
  spPlayPreview(url);
  if (!wrap.querySelector('.rcb-music-playing')) {
    const badge = document.createElement('div');
    badge.className = 'rcb-music-playing';
    badge.innerHTML = '🎵';
    wrap.querySelector('.rcb-art')?.appendChild(badge);
    gsap.fromTo(badge, { scale:0, opacity:0 }, { scale:1, opacity:1, duration:0.3, ease:'back.out(2)' });
  }
}

function stopVinylHoverPreview(wrap) {
  spStopPreview();
  const badge = wrap.querySelector('.rcb-music-playing');
  if (badge) gsap.to(badge, { scale:0, opacity:0, duration:0.2, onComplete: () => badge.remove() });
}

function showRevealed() {
  const grid = $('#reveal-grid');
  // Shuffle items so legendary isn't always last
  const items = [...PACK_ITEMS].sort(() => Math.random() - 0.5);
  const rarityLabels = { common: 'COMMUN', rare: 'RARE', epic: 'ÉPIQUE', legendary: 'LÉGENDAIRE' };
  const auraColors = {
    common:    'rgba(156,163,175,0.5)',
    rare:      'rgba(59,79,232,0.85)',
    epic:      'rgba(167,139,250,0.9)',
    legendary: 'rgba(251,191,36,0.95)'
  };

  const cardHTML = (item) => `
    <div class="reveal-card-big ${item.rarity}" style="--rcb-color:${item.color}">
      <span class="rcb-rar-badge">${rarityLabels[item.rarity] || item.rarity}</span>
      ${item.rarity === 'legendary' || item.rarity === 'epic' || item.rarity === 'rare' ? `
        <div class="rcb-beams"></div>
        <div class="rcb-frame">
          <span class="cn cn-tl"></span><span class="cn cn-tr"></span>
          <span class="cn cn-bl"></span><span class="cn cn-br"></span>
          <span class="ed ed-t"></span><span class="ed ed-r"></span>
          <span class="ed ed-b"></span><span class="ed ed-l"></span>
          ${item.rarity === 'legendary' ? '<span class="rcb-crown">👑</span>' : item.rarity === 'epic' ? '<span class="rcb-crown rcb-gem">💎</span>' : ''}
        </div>
        <div class="rcb-sparkles"></div>
      ` : ''}
      <div class="rcb-art"><div class="rcb-disk"></div></div>
      <div class="rcb-info">
        <div class="rcb-title">${escHtml(item.title)}</div>
        <div class="rcb-artist">${escHtml(item.artist)}</div>
      </div>
    </div>`;

  grid.innerHTML = '<h3>NOUVEAUX VINYLES</h3>' +
    `<div class="reveal-row">${items.map((item) => `
      <div class="pochette-wrap ${item.rarity}" style="--aura-color:${auraColors[item.rarity]}; --rcb-color:${item.color}">
        <div class="pochette-sleeve">
          <div class="pochette-icon">♪</div>
          <div class="pochette-tap">Appuyer pour révéler</div>
        </div>
        ${cardHTML(item)}
      </div>
    `).join('')}</div>
    <div class="reveal-actions">
      <button class="btn btn-ghost" id="reveal-share" style="color:#fff;background:rgba(255,255,255,0.15);">PARTAGER</button>
      <button class="btn btn-accent" id="reveal-continue">CONTINUER</button>
    </div>`;

  grid.classList.add('active');

  // All cards start hidden behind their sleeves
  $$('.pochette-wrap .reveal-card-big').forEach(c => gsap.set(c, { opacity: 0, y: 30, scale: 0.92 }));

  gsap.from('#reveal-grid h3', { y: -30, opacity: 0, duration: 0.6, ease: 'back.out(1.4)' });
  $$('.pochette-wrap').forEach((wrap, i) => {
    gsap.from(wrap, { y: 80, opacity: 0, scale: 0.7, duration: 0.6, delay: 0.25 + i * 0.18, ease: 'back.out(1.8)' });
  });

  let revealedCount = 0;

  $$('.pochette-wrap').forEach((wrap) => {
    const sleeve = wrap.querySelector('.pochette-sleeve');
    const card   = wrap.querySelector('.reveal-card-big');
    const rarity = wrap.classList.contains('legendary') ? 'legendary'
                 : wrap.classList.contains('epic')      ? 'epic'
                 : wrap.classList.contains('rare')      ? 'rare' : 'common';

    function revealCard() {
      wrap.removeEventListener('click', revealCard);
      wrap.style.cursor = 'default';
      wrap.classList.add('revealed');

      // Sleeve flies up and away
      gsap.to(sleeve, {
        y: -280, opacity: 0, scale: 0.7,
        rotation: (Math.random() - 0.5) * 45,
        duration: 0.38, ease: 'power3.in',
        onComplete: () => { sleeve.style.display = 'none'; }
      });

      // Vinyl pops out
      gsap.to(card, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.55, delay: 0.12, ease: 'back.out(2)',
        onStart: () => playRevealChime(rarity, 0)
      });

      if (rarity === 'legendary' || rarity === 'epic' || rarity === 'rare') {
        const content = card.querySelectorAll('.rcb-art, .rcb-info');
        const beams   = card.querySelector('.rcb-beams');
        const corners = card.querySelectorAll('.rcb-frame .cn');
        const edges   = card.querySelectorAll('.rcb-frame .ed');
        const crown   = card.querySelector('.rcb-crown');
        gsap.set(content, { opacity: 0 });
        gsap.set(beams,   { opacity: 0, scale: 0.4 });
        gsap.set(corners, { opacity: 0, scale: 0.3 });
        gsap.set(edges,   { scaleX: 0, scaleY: 0, opacity: 0 });
        if (crown) gsap.set(crown, { opacity: 0, y: -30, scale: 0 });

        const isLeg = rarity === 'legendary';
        const isEpic = rarity === 'epic';
        const settleScale = isLeg ? 1.08 : isEpic ? 1.06 : 1.04;

        if (isLeg) {
          const offs = [[-46,-46],[46,-46],[-46,46],[46,46]];
          corners.forEach((cn, k) => gsap.set(cn, { x: offs[k][0], y: offs[k][1], rotation: k%2?60:-60, scale: 0.3, opacity: 0 }));
          legendaryScreenShake();
        }

        const tl = gsap.timeline({ delay: 0.5 });
        tl.to(beams,   { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' })
          .to(corners[0], { opacity:1, scale:1, x:0, y:0, rotation:0, duration:0.3, ease:'back.out(2.4)' }, '+=0.04')
          .to(corners[1], { opacity:1, scale:1, x:0, y:0, rotation:0, duration:0.3, ease:'back.out(2.4)' }, '-=0.2')
          .to(corners[2], { opacity:1, scale:1, x:0, y:0, rotation:0, duration:0.3, ease:'back.out(2.4)' }, '-=0.2')
          .to(corners[3], { opacity:1, scale:1, x:0, y:0, rotation:0, duration:0.3, ease:'back.out(2.4)' }, '-=0.2')
          .to(edges[0], { scaleX:1, opacity:1, duration:0.25, ease:'power3.out' }, '-=0.08')
          .to(edges[1], { scaleY:1, opacity:1, duration:0.25, ease:'power3.out' }, '-=0.25')
          .to(edges[2], { scaleX:1, opacity:1, duration:0.25, ease:'power3.out' }, '-=0.25')
          .to(edges[3], { scaleY:1, opacity:1, duration:0.25, ease:'power3.out' }, '-=0.25');
        if (crown) tl.to(crown, { opacity:1, y:0, scale:1, duration:0.38, ease:'back.out(2.2)' }, '-=0.1');
        tl.to(card, { scale: settleScale, duration:0.4, ease:'power3.out' }, '-=0.08');
        tl.to(content, { opacity:1, duration:0.4, ease:'power2.out' }, '-=0.35');
        tl.call(() => startSparkles(card, rarity), null, '-=0.25');
      }

      // Hover preview on this card once revealed
      setTimeout(() => {
        wrap.addEventListener('mouseenter', () => playVinylHoverPreview(wrap));
        wrap.addEventListener('mouseleave', () => stopVinylHoverPreview(wrap));
      }, 600);

      revealedCount++;
      if (revealedCount === items.length) {
        gsap.to('.reveal-actions', { opacity: 1, duration: 0.5, delay: 0.9 });
      }
    }

    wrap.addEventListener('click', revealCard);
  });

  // Wire up continue
  setTimeout(() => {
    const btn = $('#reveal-continue');
    if (btn) btn.addEventListener('click', () => {
      spStopPreview();
      $('#pack-overlay').classList.remove('active');
    });
  }, 100);
}

function legendaryScreenShake() {
  const overlay = $('#pack-overlay');
  if (!overlay) return;
  gsap.to(overlay, {
    x: 0, duration: 0.45,
    keyframes: [{ x: -10 }, { x: 12 }, { x: -8 }, { x: 6 }, { x: -3 }, { x: 0 }],
    ease: 'power2.out'
  });
}

function startSparkles(card, rarity) {
  const host = card.querySelector('.rcb-sparkles');
  if (!host) return;
  const isLeg = rarity === 'legendary';
  const symbols = isLeg
    ? ['✦', '✧', '✨', '⭐', '★']
    : ['✦', '✧', '✨', '•', '◆'];
  const colors = isLeg
    ? ['#FBBF24', '#fff', '#F59E0B']
    : ['#A78BFA', '#fff', '#C4B5FD', '#F472B6'];
  const maxParticles = isLeg ? 40 : 24;
  let spawned = 0;
  function spawn() {
    if (!card.isConnected || !host.isConnected) return;
    const s = document.createElement('span');
    s.className = 'spark';
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    s.style.left = (5 + Math.random() * 90) + '%';
    s.style.top  = (5 + Math.random() * 90) + '%';
    s.style.fontSize = (10 + Math.random() * 18) + 'px';
    s.style.color = colors[Math.floor(Math.random() * colors.length)];
    s.style.textShadow = isLeg
      ? '0 0 8px rgba(251,191,36,0.9)'
      : '0 0 8px rgba(167,139,250,0.9)';
    host.appendChild(s);
    gsap.fromTo(s,
      { scale: 0, opacity: 0, rotation: 0 },
      { scale: 1, opacity: 1, rotation: 180, duration: 0.35, ease: 'back.out(2)' }
    );
    gsap.to(s, {
      y: -30 - Math.random() * 40, opacity: 0, scale: 0.4,
      duration: 1.1 + Math.random() * 0.6,
      delay: 0.3,
      ease: 'power1.out',
      onComplete: () => s.remove()
    });
    spawned++;
    if (spawned < maxParticles && card.isConnected) {
      setTimeout(spawn, 120 + Math.random() * 200);
    }
  }
  for (let i = 0; i < 6; i++) setTimeout(spawn, i * 40);
}

$('#sb-pack-cta').addEventListener('click', openDailyPack);
$('#pack-art').addEventListener('click', revealPack);
$('#pack-close').addEventListener('click', () => {
  $('#pack-overlay').classList.remove('active');
});

// ===== SHOP =====
const SHOP_ITEMS = [
  // Packs
  { id: 'pack-standard',  cat: 'packs',    name: 'Pack Standard',   sub: '3 vinyles aléatoires',                 price: 80,  emoji: '🎁', tint: 'orange',   tag: '' },
  { id: 'pack-premium',   cat: 'packs',    name: 'Pack Premium',    sub: '5 vinyles · 1 rare garanti',           price: 220, emoji: '💎', tint: 'purple',   tag: 'POPULAIRE' },
  { id: 'pack-legendes',  cat: 'packs',    name: 'Pack Légendes',   sub: '3 vinyles · 1 légendaire garanti',     price: 360, emoji: '👑', tint: 'gold',     tag: '−40%', oldPrice: 600 },
  { id: 'pack-80s',       cat: 'packs',    name: 'Pack Décennie 80', sub: '4 vinyles des années 80',             price: 160, emoji: '📻', tint: 'pink',     tag: '' },
  { id: 'pack-rap',       cat: 'packs',    name: 'Pack Hip-Hop',    sub: '5 vinyles rap & soul',                 price: 200, emoji: '🎤', tint: 'blue',     tag: '' },
  { id: 'pack-rock',      cat: 'packs',    name: 'Pack Rock Légende', sub: '4 vinyles riffs garantis',           price: 180, emoji: '🎸', tint: 'red',      tag: '' },
  // Skins MC
  { id: 'skin-mc-groove', cat: 'skins',    name: 'MC GROOVE',       sub: 'Skin légendaire · MC rap',             price: 800, emoji: '🎙️', tint: 'gold',    tag: 'LÉGENDAIRE' },
  { id: 'skin-mystery',   cat: 'skins',    name: '??? (Mystery)',   sub: 'Devine son nom pour la débloquer',     price: 1500, emoji: '👁️', tint: 'purple',  tag: 'EXCLUSIF' },
  // Thèmes & Stickers
  { id: 'theme-neon',     cat: 'themes',   name: 'Thème Neon',      sub: 'Vibes rave · couleurs flashy',         price: 250, emoji: '🪩', tint: 'pink',     tag: '' },
  { id: 'theme-beach',    cat: 'themes',   name: 'Thème Beach',     sub: 'Vacances permanentes',                 price: 180, emoji: '🏖️', tint: 'blue',    tag: '' },
  { id: 'theme-forest',   cat: 'themes',   name: 'Thème Forest',    sub: 'Calme et concentré',                   price: 220, emoji: '🌲', tint: 'green',    tag: '' },
  { id: 'sticker-pack',   cat: 'themes',   name: 'Pack stickers',   sub: '10 stickers d\'ambiance bonus',        price: 120, emoji: '✨', tint: 'gold',     tag: '' },
  { id: 'sound-pack-pro', cat: 'themes',   name: 'Son Pack PRO',    sub: '8 jingles d\'accueil exclusifs',       price: 280, emoji: '🔊', tint: 'purple',   tag: 'NEW' },
  // Boosters
  { id: 'boost-jokers',   cat: 'boosters', name: 'Pass Jokers',     sub: 'Jokers illimités pour 1 partie',       price: 100, emoji: '🃏', tint: 'orange',   tag: '' },
  { id: 'boost-xp',       cat: 'boosters', name: 'XP Boost ×2',     sub: 'Double l\'XP pendant 1h',              price: 150, emoji: '⚡', tint: 'gold',     tag: '' },
  { id: 'boost-slot',     cat: 'boosters', name: '+1 Slot pack',    sub: 'Ouvre un 2ème pack quotidien',         price: 200, emoji: '📦', tint: 'green',    tag: '' },
  { id: 'boost-revenge',  cat: 'boosters', name: 'Revanche instant', sub: 'Relance la dernière manche',          price: 80,  emoji: '↩️', tint: 'blue',     tag: '' },
  // Recharge (real $)
  { id: 'rech-100',  cat: 'recharge', name: '100 Mics',           sub: 'Le starter',                   price: '0,99 €', tokens: 100,  emoji: '🎤', tint: 'orange', tag: '', real: true },
  { id: 'rech-550',  cat: 'recharge', name: '500 + 50 Mics',      sub: '10 % bonus inclus',            price: '4,99 €', tokens: 550,  emoji: '🎤', tint: 'purple', tag: 'POPULAIRE', real: true },
  { id: 'rech-1400', cat: 'recharge', name: '1 200 + 200 Mics',   sub: '17 % bonus · gros stack',      price: '9,99 €', tokens: 1400, emoji: '💎', tint: 'gold',   tag: '', real: true },
  { id: 'rech-3800', cat: 'recharge', name: '3 000 + 800 Mics',   sub: 'Le studio entier · 27 % bonus', price: '19,99 €', tokens: 3800, emoji: '👑', tint: 'pink',  tag: 'BEST', real: true }
];

const TINTS = {
  orange: ['#FED7AA', '#F97316'],
  purple: ['#DDD6FE', '#8B5CF6'],
  gold:   ['#FEF3C7', '#F59E0B'],
  pink:   ['#FBCFE8', '#EC4899'],
  blue:   ['#BFDBFE', '#3B82F6'],
  green:  ['#BBF7D0', '#16A34A'],
  red:    ['#FECACA', '#EF4444']
};

function refreshShopBalance() {
  if ($('#shop-balance')) $('#shop-balance').textContent = STATE.player.tokens;
  $('#sb-tokens').textContent = STATE.player.tokens;
}

function shopToast(msg, kind) {
  let t = $('#shop-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'shop-toast';
    t.className = 'shop-toast';
    document.body.appendChild(t);
  }
  t.className = 'shop-toast ' + (kind || '') + ' show';
  t.textContent = msg;
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2400);
}

function attemptBuy(id) {
  const item = SHOP_ITEMS.find(i => i.id === id);
  if (!item) return;
  if (item.real) {
    // Real-money recharge: simulate add to balance
    STATE.player.tokens += item.tokens;
    refreshShopBalance();
    shopToast(`+${item.tokens} 🎤 ajoutés !`, 'good');
    gsap.fromTo('#shop-balance', { scale: 1.4, color: '#16A34A' },
      { scale: 1, color: '', duration: 0.6, ease: 'back.out(2)' });
    return;
  }
  if (STATE.player.tokens < item.price) {
    shopToast('Pas assez de mics 🎤', 'bad');
    gsap.fromTo('.shop-balance', { x: 0 },
      { x: 0, duration: 0.4, keyframes: [{ x: -8 }, { x: 8 }, { x: -6 }, { x: 6 }, { x: 0 }] });
    return;
  }
  STATE.player.tokens -= item.price;
  refreshShopBalance();
  shopToast(`✓ ${item.name} acheté !`, 'good');
  gsap.fromTo('#shop-balance', { scale: 1.3, color: '#EF4444' },
    { scale: 1, color: '', duration: 0.55, ease: 'back.out(2)' });
  // Small confetti pop near balance
  spawnShopBurst();
}

function spawnShopBurst() {
  const target = document.querySelector('.shop-balance');
  if (!target) return;
  const r = target.getBoundingClientRect();
  const stage = $('#stage');
  const sRect = stage.getBoundingClientRect();
  const scale = parseFloat((stage.style.transform || 'scale(1)').match(/scale\(([0-9.]+)\)/)?.[1] || 1);
  const cx = (r.left + r.width / 2 - sRect.left) / scale;
  const cy = (r.top + r.height / 2 - sRect.top) / scale;
  const colors = ['#F97316','#FBBF24','#22C55E','#3B82F6','#F472B6'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute; left:${cx}px; top:${cy}px; width:8px; height:8px; border-radius:50%; background:${colors[i%colors.length]}; z-index:200; pointer-events:none;`;
    stage.appendChild(p);
    const a = (i / 16) * Math.PI * 2;
    gsap.to(p, {
      x: Math.cos(a) * (40 + Math.random() * 30),
      y: Math.sin(a) * (40 + Math.random() * 30),
      opacity: 0, duration: 0.7, ease: 'power2.out',
      onComplete: () => p.remove()
    });
  }
}

function renderShop(cat) {
  const grid = $('#shop-grid');
  if (!grid) return;
  let items = SHOP_ITEMS;
  if (cat && cat !== 'all') items = items.filter(i => i.cat === cat);

  // For "all", group by category
  let html = '';
  if (!cat || cat === 'all') {
    const order = [
      ['packs',    '🎁 PACKS'],
      ['skins',    '🎭 SKINS MC'],
      ['themes',   '🏠 THÈMES & PERSO'],
      ['boosters', '⚡ BOOSTERS'],
      ['recharge', '💰 RECHARGER EN MICS']
    ];
    order.forEach(([k, label]) => {
      const slice = SHOP_ITEMS.filter(i => i.cat === k);
      if (!slice.length) return;
      html += `<div class="shop-section-bar"><h3>${label}</h3></div>`;
      const rowClass = k === 'packs' ? 'shop-row shop-row-packs' : 'shop-row';
      html += `<div class="${rowClass}">${slice.map(renderShopCard).join('')}</div>`;
    });
  } else {
    html = `<div class="shop-row">${items.map(renderShopCard).join('')}</div>`;
  }
  grid.innerHTML = html;

  // Wire buy buttons
  $$('.shop-card .sc-buy, .pack-pochette .pp-buy', grid).forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      attemptBuy(b.dataset.id);
    });
  });

  gsap.from('.shop-card', { y: 24, opacity: 0, stagger: 0.04, duration: 0.4, ease: 'back.out(1.3)' });
}

const PACK_AURA = {
  'pack-standard': '#3B82F6',
  'pack-premium':  '#8B5CF6',
  'pack-legendes': '#F59E0B',
  'pack-80s':      '#EC4899',
  'pack-rap':      '#22C55E',
  'pack-rock':     '#EF4444'
};

function renderPackPochette(item) {
  const [c1, c2] = TINTS[item.tint] || TINTS.orange;
  const aura = PACK_AURA[item.id] || '#3B82F6';
  const insufficient = STATE.player.tokens < item.price;
  const oldPriceHtml = item.oldPrice
    ? `<span class="pp-price-old">${item.oldPrice}</span> ` : '';
  return `
    <div class="pack-pochette shop-item" style="--c1:${c1};--c2:${c2};--aura:${aura};" data-id="${item.id}">
      ${item.tag ? `<div class="pack-tag">${item.tag}</div>` : ''}
      <div class="pp-illu">
        <div class="pp-bg"></div>
        <div class="pp-shine"></div>
        <div class="pp-emoji">${item.emoji}</div>
        <div class="pp-lines"></div>
      </div>
      <div class="pp-body">
        <div class="pp-name">${item.name}</div>
        <div class="pp-sub">${item.sub}</div>
        <div class="pp-price-row">${oldPriceHtml}<span class="pp-price">${item.price} 🎤</span></div>
        <button class="pp-buy${insufficient ? ' disabled' : ''}" data-id="${item.id}" ${insufficient ? 'disabled' : ''}>
          ${insufficient ? 'MANQUE' : 'OUVRIR'}
        </button>
      </div>
    </div>`;
}

function renderShopCard(item) {
  if (item.cat === 'packs') return renderPackPochette(item);
  const [c1, c2] = TINTS[item.tint] || TINTS.orange;
  const insufficient = !item.real && STATE.player.tokens < item.price;
  const priceMarkup = item.real
    ? `<span class="sc-price-real">${item.price}</span><span class="sc-price-bonus">→ ${item.tokens} 🎤</span>`
    : (item.oldPrice
        ? `<span class="sc-price-old">${item.oldPrice} 🎤</span><span class="sc-price">${item.price} 🎤</span>`
        : `<span class="sc-price">${item.price} 🎤</span>`);
  const btnLabel = item.real ? 'ACHETER' : (insufficient ? 'PAS ASSEZ' : 'ACHETER');
  const btnCls = item.real ? 'btn-light-green' : (insufficient ? 'btn-disabled' : 'btn-light');
  return `
    <div class="shop-card shop-item" style="--c1: ${c1}; --c2: ${c2};">
      ${item.tag ? `<div class="sc-tag-tl">${item.tag}</div>` : ''}
      <div class="sc-illu">
        <div class="sc-illu-bg"></div>
        <div class="sc-illu-emoji">${item.emoji}</div>
      </div>
      <div class="sc-body">
        <div class="sc-name">${item.name}</div>
        <div class="sc-sub">${item.sub}</div>
        <div class="sc-foot">
          <div class="sc-price-wrap">${priceMarkup}</div>
          <button class="sc-buy ${btnCls}" data-id="${item.id}" ${insufficient ? 'disabled' : ''}>${btnLabel}</button>
        </div>
      </div>
    </div>`;
}

function initShop() {
  refreshShopBalance();
  renderShop('all');
  $$('.shop-chip').forEach(c => {
    c.onclick = () => {
      $$('.shop-chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      renderShop(c.dataset.cat);
      gsap.fromTo('#shop-grid', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 });
    };
  });
  // Jump link from balance card
  $$('[data-shop-jump]').forEach(b => {
    b.onclick = () => {
      const cat = b.dataset.shopJump;
      const chip = $(`.shop-chip[data-cat="${cat}"]`);
      if (chip) chip.click();
      $('#shop-grid').scrollIntoView?.({ behavior: 'smooth' });
    };
  });
  // Featured card buy
  const f = document.querySelector('[data-shop-buy]');
  if (f) f.onclick = (e) => {
    if (e.target.closest('.sf-cta') || e.currentTarget === e.target.closest('.shop-featured')) {
      attemptBuy(f.dataset.shopBuy);
    }
  };

  gsap.from('.shop-top > *', { y: -20, opacity: 0, stagger: 0.1, duration: 0.4 });
  gsap.from('.shop-chips .shop-chip', { y: -10, opacity: 0, stagger: 0.04, duration: 0.3, delay: 0.15 });
}

// ===== TOPBAR SEARCH DROPDOWN =====
(function setupSearchDropdown() {
  const wrap = $('#tb-search');
  const input = $('#tb-search-input');
  const dd = $('#tb-dropdown');
  if (!wrap || !input || !dd) return;

  function open() {
    wrap.classList.add('open');
    gsap.killTweensOf(dd);
    gsap.fromTo(dd, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: 'power2.out' });
  }
  function close() {
    if (!wrap.classList.contains('open')) return;
    gsap.to(dd, { y: -6, opacity: 0, duration: 0.14, ease: 'power2.in',
      onComplete: () => wrap.classList.remove('open') });
  }
  input.addEventListener('focus', open);
  input.addEventListener('click', open);

  // Close when clicking outside
  document.addEventListener('mousedown', (e) => {
    if (!wrap.contains(e.target)) close();
  });
  // Cmd/Ctrl + K to focus
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      input.focus();
      input.select();
    } else if (e.key === 'Escape' && wrap.classList.contains('open')) {
      input.blur();
      close();
    }
  });

  // Filter dropdown items based on input
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    $$('.tbd-item', dd).forEach(item => {
      const text = item.textContent.toLowerCase();
      const show = !q || text.includes(q);
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    // Hide empty sections
    $$('.tbd-section', dd).forEach(s => {
      const items = $$('.tbd-item, .tbd-chip', s);
      const anyVisible = items.some(i => i.style.display !== 'none');
      s.style.display = anyVisible ? '' : 'none';
    });
  });

  // Click handler: navigate then close
  dd.addEventListener('click', (e) => {
    const t = e.target.closest('[data-search-action]');
    if (!t) return;
    const nav = t.dataset.nav;
    if (nav) navigateTo(nav);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.blur();
    close();
  });
})();

setupCanvas();
drawNotes();
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
refreshSidebar();
renderPackCta();
initHome();
setupVinylScratch();

// ===== SUPABASE AUTH =====

function applyProfileToState() {
  const profile = sbGetProfile();
  if (!profile) return;
  STATE.player.name = profile.username;
  STATE.player.avatar = profile.avatar_seed;
  STATE.player.level = profile.level || 1;
  STATE.player.xp = profile.xp || 0;
  STATE.player.tokens = profile.tokens || 100;
  refreshSidebar();
  PAGE_INFO.home.sub = `Yo ${profile.username} — prêt à lancer une partie ?`;
  const sub = $('#tb-sub');
  if (sub) sub.textContent = PAGE_INFO.home.sub;
}

function hideAuth() {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;
  if (!sbGetProfile()) {
    PAGE_INFO.home.sub = 'Prêt à jouer ? Lance une partie !';
    const sub = document.getElementById('tb-sub');
    if (sub) sub.textContent = PAGE_INFO.home.sub;
  }
  gsap.to(overlay, { opacity: 0, scale: 0.97, duration: 0.35, ease: 'power2.in', onComplete: () => overlay.remove() });
}

async function handleAuthLogin() {
  const email = document.getElementById('auth-email-login').value.trim();
  const pass = document.getElementById('auth-pass-login').value;
  const err = document.getElementById('auth-login-err');
  const btn = document.getElementById('auth-login-btn');
  try {
    err.textContent = '';
    if (!email) throw new Error('Email requis');
    if (!pass) throw new Error('Mot de passe requis');
    btn.textContent = '...';
    await sbSignIn(email, pass);
    applyProfileToState();
    hideAuth();
  } catch(e) {
    err.textContent = e.message;
    btn.textContent = 'Se connecter';
  }
}

async function handleAuthSignup() {
  const username = document.getElementById('auth-username').value.trim();
  const email = document.getElementById('auth-email-signup').value.trim();
  const pass = document.getElementById('auth-pass-signup').value;
  const err = document.getElementById('auth-signup-err');
  const btn = document.getElementById('auth-signup-btn');
  try {
    err.textContent = '';
    if (!username || username.length < 2) throw new Error('Pseudo trop court (2 car. min)');
    if (!email) throw new Error('Email requis');
    if (pass.length < 6) throw new Error('Mot de passe trop court (6 car. min)');
    btn.textContent = '...';
    await sbSignUp(email, pass, username);
    applyProfileToState();
    hideAuth();
  } catch(e) {
    err.textContent = e.message;
    btn.textContent = 'Créer un compte';
  }
}

document.addEventListener('click', (e) => {
  const tab = e.target.closest('.auth-tab');
  if (tab) {
    const name = tab.dataset.authTab;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('auth-panel-' + name)?.classList.add('active');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (document.getElementById('auth-panel-login')?.classList.contains('active') &&
      (e.target.id === 'auth-email-login' || e.target.id === 'auth-pass-login')) {
    handleAuthLogin();
  }
  if (document.getElementById('auth-panel-signup')?.classList.contains('active') &&
      ['auth-username', 'auth-email-signup', 'auth-pass-signup'].includes(e.target.id)) {
    handleAuthSignup();
  }
});

document.getElementById('auth-login-btn')?.addEventListener('click', handleAuthLogin);
document.getElementById('auth-signup-btn')?.addEventListener('click', handleAuthSignup);
document.getElementById('auth-guest-btn')?.addEventListener('click', hideAuth);

document.getElementById('auth-forgot-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('auth-email-login').value.trim();
  const err = document.getElementById('auth-login-err');
  if (!email) {
    err.style.color = '';
    err.textContent = 'Saisis ton email d\'abord';
    document.getElementById('auth-email-login').focus();
    return;
  }
  try {
    await sbResetPassword(email);
    err.style.color = '#22C55E';
    err.textContent = '✓ Email de réinitialisation envoyé !';
  } catch(e) {
    err.style.color = '';
    err.textContent = e.message;
  }
});

document.getElementById('auth-google-btn')?.addEventListener('click', async () => {
  try { await sbSignInWithProvider('google'); }
  catch(e) { document.getElementById('auth-login-err').textContent = e.message; }
});
document.getElementById('auth-apple-btn')?.addEventListener('click', async () => {
  try { await sbSignInWithProvider('apple'); }
  catch(e) { document.getElementById('auth-login-err').textContent = e.message; }
});

(async () => {
  spLoadFromStorage();
  if (!spIsConnected() && localStorage.getItem('sp_refresh')) {
    try { await spRefreshToken(); } catch(e) {}
  }
  try { await spHandleCallback(); } catch(e) { console.warn('spHandleCallback:', e); }
  try {
    const ok = await sbInit();
    if (ok) { applyProfileToState(); hideAuth(); }
  } catch(e) { console.warn('sbInit:', e); }
})();
