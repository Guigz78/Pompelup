/* ============================================
   Pompelup Web — Gartic-inspired with sidebar
   ============================================ */

const STATE = {
  player: { name: 'Guigz', avatar: 'guigz-vibe', level: 12, xp: 847, tokens: 142 },
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
  { id: 's1', title: 'Smells Like Teen Spirit', artist: 'Nirvana', year: 1991, emoji: '🎸', bpm: 117, color: '#F97316' },
  { id: 's2', title: 'Billie Jean', artist: 'Michael Jackson', year: 1982, emoji: '🕺', bpm: 116, color: '#3B4FE8' },
  { id: 's3', title: 'Bohemian Rhapsody', artist: 'Queen', year: 1975, emoji: '👑', bpm: 144, color: '#FBBF24' },
  { id: 's4', title: 'Lose Yourself', artist: 'Eminem', year: 2002, emoji: '🎤', bpm: 86, color: '#22C55E' },
  { id: 's5', title: 'Take On Me', artist: 'a-ha', year: 1985, emoji: '📻', bpm: 169, color: '#F472B6' }
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
  { title: 'Voyage Voyage',      artist: 'Desireless',          rarity: 'rare',       label: '#F472B6', locked: false },
  { title: 'Joe le Taxi',        artist: 'V. Paradis',          rarity: 'common',     label: '#F97316', locked: false },
  { title: 'Stayin\' Alive',     artist: 'Bee Gees',            rarity: 'legendary',  label: '#FBBF24', locked: false },
  { title: 'Africa',             artist: 'Toto',                rarity: 'rare',       label: '#22C55E', locked: false },
  { title: 'Sweet Dreams',       artist: 'Eurythmics',          rarity: 'common',     label: '#3B4FE8', locked: false },
  { title: 'Take On Me',         artist: 'a-ha',                rarity: 'rare',       label: '#8B5CF6', locked: false },
  { title: 'Billie Jean',        artist: 'M. Jackson',          rarity: 'legendary',  label: '#FBBF24', locked: false },
  { title: 'Wonderwall',         artist: 'Oasis',               rarity: 'common',     label: '#F97316', locked: false },
  { title: 'Hey Ya!',            artist: 'OutKast',             rarity: 'rare',       label: '#F472B6', locked: false },
  { title: 'Smells Like...',     artist: 'Nirvana',             rarity: 'rare',       label: '#EF4444', locked: false },
  { title: 'Bohemian Rhapsody',  artist: 'Queen',               rarity: 'legendary',  label: '#FBBF24', locked: false },
  { title: 'Like a Prayer',      artist: 'Madonna',             rarity: 'common',     label: '#A78BFA', locked: false },
  { title: '???',                artist: '???',                 rarity: 'common',     label: '#888',    locked: true },
  { title: '???',                artist: '???',                 rarity: 'rare',       label: '#888',    locked: true },
  { title: '???',                artist: '???',                 rarity: 'common',     label: '#888',    locked: true },
  { title: '???',                artist: '???',                 rarity: 'common',     label: '#888',    locked: true },
  { title: '???',                artist: '???',                 rarity: 'legendary',  label: '#888',    locked: true },
  { title: '???',                artist: '???',                 rarity: 'common',     label: '#888',    locked: true }
];

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
  home:       { title: 'ACCUEIL',     sub: 'Yo Guigz — prêt à pomper l\'up ?' },
  quests:     { title: 'QUÊTES',      sub: '6 quêtes actives · 1 récompense à récupérer' },
  pass:       { title: 'GROOVY PASS', sub: 'Saison 03 · Boogie Woogie' },
  friends:    { title: 'AMIS',        sub: '7 amis · 3 en ligne · 2 demandes en attente' },
  history:    { title: 'HISTOIRE',    sub: 'Tes 142 dernières parties' },
  collection: { title: 'COLLECTION',  sub: '34 / 180 vinyles débloqués' },
  lobby:      { title: 'SALON',       sub: 'En attente du lancement' },
  game:       { title: 'PARTIE',      sub: 'Mode Classic · 5 manches' },
  results:    { title: 'RÉSULTATS',   sub: 'Partie terminée' }
};

const SCREENS_WITHOUT_CHROME = ['lobby', 'game', 'results'];

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const avatarUrl = (seed) => {
  if (window.__resources && window.__resources['avatar_' + seed]) {
    return window.__resources['avatar_' + seed];
  }
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

// ===== SCALING =====
function scaleStage() {
  const stage = $('#stage');
  const wrap = stage.parentElement;
  const sw = wrap.clientWidth, sh = wrap.clientHeight;
  const scale = Math.min(sw / 1440, sh / 900);
  stage.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', scaleStage);
scaleStage();

// ===== NAVIGATION =====
function navigateTo(id) {
  const cur = $('.screen.active');
  const next = $('#screen-' + id);
  if (!next) return;
  if (cur === next) return;

  if (cur && cur.id === 'screen-game') stopGameLoop();

  // Sidebar / topbar visibility
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
    if (a.dataset.action === 'create-room') navigateTo('lobby');
    if (a.dataset.action === 'join-room') {
      // if clicked on the join card outside the input
      if (e.target.tagName !== 'INPUT') navigateTo('lobby');
    }
  }
});

// ===== NOTES CANVAS =====
const canvas = $('#notes-canvas');
let ctx, notes = [];
function setupCanvas() {
  canvas.width = 1440;
  canvas.height = 900;
  ctx = canvas.getContext('2d');
  for (let i = 0; i < 22; i++) {
    notes.push({
      x: Math.random() * 1440,
      y: Math.random() * 900,
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
  ctx.clearRect(0, 0, 1440, 900);
  const mult = STATE.animDensity === 'calm' ? 0.3 : STATE.animDensity === 'chaos' ? 2 : 1;
  const cnt = Math.floor(notes.length * (STATE.animDensity === 'calm' ? 0.4 : 1));
  for (let i = 0; i < cnt; i++) {
    const n = notes[i];
    ctx.font = `${n.r * 2}px "Bebas Neue", serif`;
    ctx.fillStyle = n.hue;
    ctx.globalAlpha = n.o;
    ctx.fillText(n.ch, n.x, n.y);
    n.y -= n.v * mult;
    if (n.y < -30) { n.y = 920; n.x = Math.random() * 1440; }
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

  // continuous disc spin
  gsap.killTweensOf(['.disc.d1', '.disc.d2', '.disc.d3', '.disc.d4']);
  gsap.to('.disc.d1', { rotation: 360, duration: 20 / mult, repeat: -1, ease: 'none' });
  gsap.to('.disc.d2', { rotation: -360, duration: 24 / mult, repeat: -1, ease: 'none' });
  gsap.to('.disc.d3', { rotation: 360, duration: 16 / mult, repeat: -1, ease: 'none' });
  gsap.to('.disc.d4', { rotation: -360, duration: 28 / mult, repeat: -1, ease: 'none' });

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

// ===== COLLECTION =====
function initCollection() {
  const grid = $('#collection-grid');
  grid.innerHTML = COLLECTION_DATA.map(v => `
    <div class="vinyl-card ${v.locked ? 'locked' : ''}">
      ${!v.locked && v.rarity !== 'common' ? `<div class="v-rar ${v.rarity}">${v.rarity === 'legendary' ? 'LÉG' : 'RARE'}</div>` : ''}
      <div class="v-art">
        <div class="v-disk" style="--label: ${v.label}"></div>
      </div>
      <div class="v-info">
        <div class="v-title">${v.title}</div>
        <div class="v-artist">${v.artist}</div>
      </div>
    </div>
  `).join('');

  gsap.from('.col-chip', { y: -10, opacity: 0, stagger: 0.04, duration: 0.3 });
  gsap.from('.col-progress', { x: 20, opacity: 0, duration: 0.4 });
  gsap.from('.vinyl-card', { y: 30, opacity: 0, scale: 0.85, stagger: 0.04, duration: 0.35, ease: 'back.out(1.4)' });
}

// ===== LOBBY =====
const PLAYER_POSITIONS = [
  { x: 50, y: 30 },
  { x: 16, y: 50 },
  { x: 84, y: 50 },
  { x: 30, y: 80 },
  { x: 70, y: 80 },
  { x: 50, y: 95 },
  { x: 8, y: 78 },
  { x: 92, y: 78 }
];

function initLobby() {
  const stage = $('#players-stage');
  const players = [
    { name: STATE.player.name, seed: STATE.player.avatar, level: STATE.player.level, host: true, you: true, ready: true },
    { name: 'Cath',  seed: 'cath-vibe',   level: 18, host: false, ready: true },
    { name: 'Jules', seed: 'jules-fresh', level: 7,  host: false, ready: true },
    { name: 'Léa',   seed: 'lea-sunset',  level: 24, host: false, ready: false }
  ];

  stage.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const pos = PLAYER_POSITIONS[i];
    if (i < players.length) {
      const p = players[i];
      const node = document.createElement('div');
      node.className = 'lp-card' + (p.host ? ' host' : '') + (p.you ? ' you' : '');
      node.style.left = pos.x + '%';
      node.style.top = pos.y + '%';
      node.style.transform = 'translate(-50%, -50%)';
      node.innerHTML = `
        <div class="lp-bubble"><img src="${avatarUrl(p.seed)}" alt=""></div>
        <div class="lp-name">
          ${p.host ? '<span>👑</span>' : ''}
          ${p.name}${p.you ? ' (toi)' : ''}
          <span class="lvl">${p.level}</span>
        </div>
        ${p.ready ? '<div class="ready-tick">✓</div>' : ''}
      `;
      stage.appendChild(node);
    } else {
      const node = document.createElement('div');
      node.className = 'lp-card lp-empty';
      node.style.left = pos.x + '%';
      node.style.top = pos.y + '%';
      node.style.transform = 'translate(-50%, -50%)';
      node.innerHTML = `<div class="lp-bubble">+</div><div class="lp-name">Libre</div>`;
      stage.appendChild(node);
    }
  }

  const mult = STATE.animDensity === 'calm' ? 0.5 : STATE.animDensity === 'chaos' ? 1.6 : 1;
  gsap.from('.lp-card', { scale: 0, opacity: 0, stagger: 0.06 / mult, duration: 0.5 / mult, ease: 'back.out(1.5)' });
  gsap.from('.lobby-title', { y: -20, opacity: 0, duration: 0.5 / mult });
  gsap.from('.lobby-grid .panel', { x: (i) => i === 0 ? -30 : 30, opacity: 0, stagger: 0.08, duration: 0.4 });
  gsap.from('.copy-link-btn', { y: 20, opacity: 0, duration: 0.4, delay: 0.4 });
  gsap.from('#start-game-btn', { scale: 0, duration: 0.5, delay: 0.5, ease: 'back.out(1.6)' });

  $$('.lp-card:not(.lp-empty)').forEach((card, i) => {
    gsap.to(card.querySelector('.lp-bubble'), {
      y: -8, duration: 1.4 + (i * 0.15), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.1
    });
  });
  gsap.to('#start-game-btn', {
    scale: 1.03, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1
  });
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

$('#start-game-btn').addEventListener('click', () => {
  pushChatMsg('system', 'La partie commence !');
  setTimeout(() => navigateTo('game'), 400);
});

function pushChatMsg(kind, content, name, seed) {
  const list = $('#chat-list');
  if (!list) return;
  const div = document.createElement('div');
  if (kind === 'system') {
    div.className = 'chat-msg system';
    div.innerHTML = `<div class="cm-body"><div class="ct">${content}</div></div>`;
  } else {
    div.className = 'chat-msg' + (kind === 'you' ? ' you' : '');
    div.innerHTML = `
      <div class="ca"><img src="${avatarUrl(seed)}" alt=""></div>
      <div class="cm-body">
        <div class="cn"><b>${name}</b></div>
        <div class="ct">${content}</div>
      </div>
    `;
  }
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
  gsap.from(div, { y: 12, opacity: 0, duration: 0.3 });
}

const chatField = $('#chat-input-field');
if (chatField) {
  chatField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      pushChatMsg('you', e.target.value.trim(), STATE.player.name, STATE.player.avatar);
      e.target.value = '';
      setTimeout(() => {
        const replies = ['lol', 'go go go 🔥', 'on lance ?', 'cap', 'bro 💀', '+1', 'hâte'];
        const b = STATE.bots[Math.floor(Math.random() * STATE.bots.length)];
        pushChatMsg('msg', replies[Math.floor(Math.random() * replies.length)], b.name, b.seed);
      }, 800 + Math.random() * 1200);
    }
  });
}

// ===== GAME =====
let gameTimer = null, vizAnim = null, botTimers = [];

function buildRadialBars() {
  const wrap = $('#viz-bars-radial');
  wrap.innerHTML = '';
  const count = 48;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    bar.style.height = '40px';
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
  const bars = $$('#viz-bars-radial .bar');
  const radius = 65;
  if (!analyser) {
    bars.forEach((b, i) => {
      const h = 30 + Math.abs(Math.sin(Date.now() / 250 + i * 0.3)) * 60;
      b.style.height = h + 'px';
      b.style.transform = `translateX(-50%) rotate(${(i / bars.length) * 360}deg) translateY(-${radius}px)`;
    });
  } else {
    analyser.getByteFrequencyData(freqData);
    bars.forEach((b, i) => {
      const idx = Math.floor(i / bars.length * freqData.length);
      const v = freqData[idx] / 255;
      const h = 30 + v * 80;
      b.style.height = h + 'px';
      b.style.transform = `translateX(-50%) rotate(${(i / bars.length) * 360}deg) translateY(-${radius}px)`;
    });
  }
  vizAnim = requestAnimationFrame(animateViz);
}

function startGame() {
  STATE.totals = { Guigz: 0, Cath: 0, Jules: 0, 'Léa': 0 };
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
  pushGameChat('system', 'Manche 1 — Catégorie : Hits 80s 🎵');
  buildRadialBars();
  animateViz();
  startRound();
}

function pushGameChat(kind, content, name, seed) {
  const list = $('#g-chat');
  if (!list) return;
  const div = document.createElement('div');
  if (kind === 'system') {
    div.className = 'chat-msg system';
    div.innerHTML = `<div class="cm-body"><div class="ct">${content}</div></div>`;
  } else {
    div.className = 'chat-msg' + (kind === 'you' ? ' you' : '');
    div.innerHTML = `
      <div class="ca"><img src="${avatarUrl(seed)}" alt=""></div>
      <div class="cm-body">
        <div class="cn"><b>${name}</b></div>
        <div class="ct">${content}</div>
      </div>
    `;
  }
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
  gsap.from(div, { y: 10, opacity: 0, duration: 0.3 });
  while (list.children.length > 12) list.removeChild(list.firstChild);
}

function startRound() {
  STATE.game.round++;
  $$('#g-progress .rcp').forEach((d, i) => {
    d.classList.remove('current');
    if (i < STATE.game.round - 1) d.classList.add('done');
    if (i === STATE.game.round - 1) d.classList.add('current');
  });
  if (STATE.game.round > STATE.game.total) return endGame();

  $('#g-round').textContent = STATE.game.round;
  const song = SONGS[(STATE.game.round - 1) % SONGS.length];
  STATE.game.currentSong = song;
  STATE.game.time = STATE.game.maxTime = 30;
  STATE.game.pointsAvail = 1000;
  STATE.game.found = false;
  STATE.game.jokers = {};
  STATE.scores = { Guigz: null, Cath: null, Jules: null, 'Léa': null };
  STATE.game.perRound = { points: 0, xp: 0, foundBy: 0 };

  $('#g-input').value = '';
  $('#g-input').disabled = false;
  $('#g-hint').textContent = '';
  $('#answer-card').classList.remove('correct', 'wrong', 'partial');
  $$('.joker-pill').forEach(p => p.classList.remove('used'));
  $('#round-end').classList.remove('active');
  $('#timer-big').classList.remove('danger');

  updatePlayersRail();
  startSongLoop(song);

  gsap.from('.viz-card', { y: -20, opacity: 0, duration: 0.4 });
  gsap.from('.answer-card', { y: 20, opacity: 0, duration: 0.4, delay: 0.1 });
  gsap.from('.joker-pill', { y: 10, opacity: 0, stagger: 0.05, duration: 0.3, delay: 0.2 });
  setTimeout(() => $('#g-input').focus(), 400);

  clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    STATE.game.time -= 0.1;
    const t = Math.max(0, STATE.game.time);
    $('#timer-num').textContent = Math.ceil(t);
    $('#timer-big').classList.toggle('danger', t <= 6);
    STATE.game.pointsAvail = Math.max(100, Math.floor(100 + 900 * (t / STATE.game.maxTime)));
    $('#g-points').textContent = STATE.game.pointsAvail.toLocaleString('fr');
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
  const players = [
    { name: STATE.player.name, seed: STATE.player.avatar, you: true },
    ...STATE.bots
  ];
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
}

function clearBotTimers() { botTimers.forEach(clearTimeout); botTimers = []; }
function stopGameLoop() {
  clearInterval(gameTimer);
  clearBotTimers();
  cancelAnimationFrame(vizAnim);
  stopSongLoop();
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
    const pts = STATE.game.pointsAvail;
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
    if (j === 'tempo')  msg = `🎵 ${song.bpm} BPM · années ${Math.floor(song.year/10)*10}`;
    if (j === 'time') {
      STATE.game.time += 10;
      STATE.game.maxTime += 10;
      msg = '⏱ +10 secondes';
    }
    $('#g-hint').textContent = msg;
    $('#g-hint').style.color = 'var(--blue)';
    setTimeout(() => $('#g-hint').style.color = '', 3000);
    gsap.fromTo(p, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(1.6)' });
  });
});

$$('.emote-btn').forEach(b => {
  b.addEventListener('click', () => spawnFloatingEmote(b.dataset.emote));
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
  const song = STATE.game.currentSong;
  STATE.game.history.push({ song, ...STATE.game.perRound });

  $('#re-art').textContent = song.emoji;
  $('#re-art').style.background = `linear-gradient(135deg, ${song.color}, #1a1a1a)`;
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
  const players = [
    { name: STATE.player.name, seed: STATE.player.avatar },
    { name: 'Cath',  seed: 'cath-vibe' },
    { name: 'Jules', seed: 'jules-fresh' },
    { name: 'Léa',   seed: 'lea-sunset' }
  ];
  if (!STATE.totals[STATE.player.name]) {
    STATE.totals = { 'Guigz': 4720, 'Cath': 3240, 'Jules': 2100, 'Léa': 1880 };
  }
  const sorted = players.slice().sort((a, b) => (STATE.totals[b.name] || 0) - (STATE.totals[a.name] || 0));

  $('#pod1-name').textContent = sorted[0].name;
  $('#pod1-score').textContent = (STATE.totals[sorted[0].name] || 0).toLocaleString('fr');
  $('#pod1-img').src = avatarUrl(sorted[0].seed);
  $('#pod2-name').textContent = sorted[1].name;
  $('#pod2-score').textContent = (STATE.totals[sorted[1].name] || 0).toLocaleString('fr');
  $('#pod2-img').src = avatarUrl(sorted[1].seed);
  $('#pod3-name').textContent = sorted[2].name;
  $('#pod3-score').textContent = (STATE.totals[sorted[2].name] || 0).toLocaleString('fr');
  $('#pod3-img').src = avatarUrl(sorted[2].seed);

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
}

// ===== TWEAKS =====
$('#tweaks-fab').addEventListener('click', () => $('#tweaks-pop').classList.toggle('active'));

// ===== INIT =====
setupCanvas();
drawNotes();
refreshSidebar();
initHome();
