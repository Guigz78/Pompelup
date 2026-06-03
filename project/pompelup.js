/* ============================================
   Pompelup — Prototype Logic (vanilla JS)
   ============================================ */

// ===== STATE =====
const STATE = {
  player: { name: 'Guigz', avatar: 'guigz-default', level: 12, xp: 847, tokens: 142 },
  room: { code: 'K9XQ4P', mode: 'classic' },
  game: {
    round: 0, total: 5, time: 30, maxTime: 30,
    pointsAvail: 1000, found: false, partial: false, currentSong: null,
    jokers: { letter: false, artist: false, time: false, tempo: false },
    perRound: { points: 0, xp: 0 }
  },
  totals: {
    Guigz: 0, Cath: 0, Jules: 0, 'Léa': 0
  },
  scores: {},
  bots: [
    { name: 'Cath',  seed: 'cath-vibe',    color: '#3B4FE8', delay: 0.45, accuracy: 0.75 },
    { name: 'Jules', seed: 'jules-fresh',  color: '#22C55E', delay: 0.7,  accuracy: 0.55 },
    { name: 'Léa',   seed: 'lea-sunset',   color: '#F472B6', delay: 0.55, accuracy: 0.65 }
  ],
  tones: 'default',
  animDensity: 'normal'
};

const SONGS = [
  { id: 's1', title: 'Smells Like Teen Spirit', artist: 'Nirvana', year: 1991, emoji: '🎸',
    bpm: 117, color: '#F97316' },
  { id: 's2', title: 'Billie Jean', artist: 'Michael Jackson', year: 1982, emoji: '🕺',
    bpm: 116, color: '#3B4FE8' },
  { id: 's3', title: 'Bohemian Rhapsody', artist: 'Queen', year: 1975, emoji: '👑',
    bpm: 144, color: '#FBBF24' },
  { id: 's4', title: 'Lose Yourself', artist: 'Eminem', year: 2002, emoji: '🎤',
    bpm: 86, color: '#22C55E' },
  { id: 's5', title: 'Take On Me', artist: 'a-ha', year: 1985, emoji: '📻',
    bpm: 169, color: '#F472B6' }
];

const COLLECTION = [
  { title: 'Voyage Voyage', artist: 'Desireless', rarity: 'rare', label: '#F472B6', locked: false },
  { title: 'Joe le Taxi', artist: 'V. Paradis', rarity: 'common', label: '#F97316', locked: false },
  { title: 'Stayin\' Alive', artist: 'Bee Gees', rarity: 'legendary', label: '#FBBF24', locked: false },
  { title: 'Africa', artist: 'Toto', rarity: 'rare', label: '#22C55E', locked: false },
  { title: 'Sweet Dreams', artist: 'Eurythmics', rarity: 'common', label: '#3B4FE8', locked: false },
  { title: 'Take On Me', artist: 'a-ha', rarity: 'rare', label: '#8B5CF6', locked: false },
  { title: '???', artist: '???', rarity: 'common', label: '#888', locked: true },
  { title: '???', artist: '???', rarity: 'common', label: '#888', locked: true },
  { title: '???', artist: '???', rarity: 'legendary', label: '#888', locked: true }
];

// ===== UTIL =====
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const avatarUrl = (seed) =>
  `https://api.dicebear.com/9.x/big-smile/svg?seed=${encodeURIComponent(seed)}&size=128&radius=50&backgroundColor=ffd5dc,c0aede,b6e3f4,fff1e4,fad9c1`;

function normalize(str) {
  return str.toLowerCase()
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
  const current = $('.screen.active');
  const next = $('#screen-' + id);
  if (!next || current === next) return;

  // stop any ongoing game audio/timers if leaving game
  if (current && current.id === 'screen-game') stopGameLoop();

  gsap.to(current, {
    opacity: 0, x: -20, duration: 0.25, ease: 'power2.in',
    onComplete: () => {
      current.classList.remove('active');
      current.style.opacity = 1;
      current.style.transform = '';
      next.classList.add('active');
      next.scrollTop = 0;
      gsap.fromTo(next, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
      onScreenEnter(id);
    }
  });
}

function onScreenEnter(id) {
  if (id === 'home') animateHome();
  if (id === 'auth') initAuth();
  if (id === 'lobby') initLobby();
  if (id === 'vote') initVote();
  if (id === 'game') startGame();
  if (id === 'results') animateResults();
  if (id === 'profile') initProfile();
  if (id === 'battlepass') initBattlepass();
}

document.body.addEventListener('click', (e) => {
  const t = e.target.closest('[data-nav]');
  if (t) navigateTo(t.dataset.nav);
});

// ===== HOME =====
const homeCanvas = $('#home-canvas');
let homeCtx, notes = [];
function setupHomeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  homeCanvas.width = 365 * dpr;
  homeCanvas.height = 800 * dpr;
  homeCanvas.style.width = '365px';
  homeCanvas.style.height = '800px';
  homeCtx = homeCanvas.getContext('2d');
  homeCtx.scale(dpr, dpr);
  for (let i = 0; i < 14; i++) {
    notes.push({
      x: Math.random() * 365,
      y: Math.random() * 800,
      v: 0.2 + Math.random() * 0.5,
      r: 8 + Math.random() * 10,
      o: 0.15 + Math.random() * 0.25,
      ch: ['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)],
      hue: ['#F97316', '#FBBF24', '#F472B6', '#3B4FE8'][Math.floor(Math.random() * 4)]
    });
  }
}
function drawNotes() {
  if (!homeCtx) return;
  homeCtx.clearRect(0, 0, 365, 800);
  const mult = STATE.animDensity === 'calm' ? 0.3 : STATE.animDensity === 'chaotic' ? 2 : 1;
  const count = Math.floor(notes.length * (STATE.animDensity === 'calm' ? 0.4 : 1));
  for (let i = 0; i < count; i++) {
    const n = notes[i];
    homeCtx.font = `${n.r * 2}px "Bebas Neue", serif`;
    homeCtx.fillStyle = n.hue;
    homeCtx.globalAlpha = n.o;
    homeCtx.fillText(n.ch, n.x, n.y);
    n.y -= n.v * mult;
    if (n.y < -20) { n.y = 820; n.x = Math.random() * 365; }
  }
  homeCtx.globalAlpha = 1;
  requestAnimationFrame(drawNotes);
}

function animateHome() {
  $('#home-avatar').src = avatarUrl(STATE.player.avatar);
  $('#home-name').textContent = STATE.player.name;
  $('#home-lvl').textContent = STATE.player.level;
  $('#home-tokens').textContent = STATE.player.tokens;

  const mult = STATE.animDensity === 'calm' ? 0.5 : STATE.animDensity === 'chaotic' ? 1.4 : 1;
  gsap.from('.hero h1', { y: 30, opacity: 0, duration: 0.6 / mult, ease: 'back.out(1.4)' });
  gsap.from('.hero p', { y: 20, opacity: 0, duration: 0.4 / mult, delay: 0.2 / mult });
  gsap.from('.hero-vinyl', { scale: 0, rotate: 180, opacity: 0, duration: 0.7 / mult, delay: 0.3 / mult, ease: 'back.out(1.6)', stagger: 0.1 });
  gsap.from('.hero-cta .btn', { y: 30, opacity: 0, duration: 0.5 / mult, delay: 0.5 / mult, ease: 'back.out(1.3)' });
  gsap.from('.cat-card', { x: 40, opacity: 0, stagger: 0.06 / mult, delay: 0.6 / mult, duration: 0.4 / mult });
  gsap.from('.hot-banner', { y: 20, opacity: 0, delay: 0.8 / mult, duration: 0.4 / mult });
  gsap.from('.bottom-nav', { y: 30, opacity: 0, delay: 0.9 / mult, duration: 0.4 / mult });

  // continuous vinyl rotation
  gsap.to('#hero-vinyl-1', { rotation: 360, duration: 12 / mult, repeat: -1, ease: 'none' });
  gsap.to('#hero-vinyl-2', { rotation: -360, duration: 18 / mult, repeat: -1, ease: 'none' });

  // CTA pulse
  gsap.to('.hero-cta .btn', {
    scale: 1.03, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1
  });
}

// ===== AUTH =====
let avatarSeeds = [];
function regenAvatars() {
  avatarSeeds = Array.from({ length: 9 }, () =>
    Math.random().toString(36).slice(2, 10)
  );
  const grid = $('#avatar-grid');
  grid.innerHTML = avatarSeeds.map((s, i) =>
    `<div class="avatar-cell ${i === 0 ? 'selected' : ''}" data-seed="${s}"><img src="${avatarUrl(s)}" alt=""></div>`
  ).join('');
  STATE.player.avatar = avatarSeeds[0];
  gsap.from('.avatar-cell', { scale: 0, opacity: 0, stagger: 0.04, duration: 0.35, ease: 'back.out(1.6)' });
}
function initAuth() {
  if (avatarSeeds.length === 0) regenAvatars();
  $('#auth-name').value = STATE.player.name;
}
$('#avatar-grid').addEventListener('click', (e) => {
  const cell = e.target.closest('.avatar-cell');
  if (!cell) return;
  $$('.avatar-cell').forEach(c => c.classList.remove('selected'));
  cell.classList.add('selected');
  STATE.player.avatar = cell.dataset.seed;
  gsap.fromTo(cell, { scale: 1.15 }, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
});
$('#shuffle-avatars').addEventListener('click', regenAvatars);
$('#auth-name').addEventListener('input', (e) => {
  STATE.player.name = e.target.value || 'Joueur';
});

// ===== LOBBY =====
function initLobby() {
  const list = $('#player-list');
  const players = [
    { name: STATE.player.name, seed: STATE.player.avatar, host: true, you: true, level: STATE.player.level },
    { name: 'Cath',  seed: 'cath-vibe',   host: false, level: 18 },
    { name: 'Jules', seed: 'jules-fresh', host: false, level: 7 },
    { name: 'Léa',   seed: 'lea-sunset',  host: false, level: 24 }
  ];
  list.innerHTML = players.map(p => `
    <div class="player-row ${p.you ? 'you' : ''}">
      <div class="avatar"><img src="${avatarUrl(p.seed)}" alt=""></div>
      <div class="info">
        <div class="pname">${p.name} ${p.you ? '<span style="font-size:10px;color:var(--orange)">(toi)</span>' : ''} ${p.host ? '<span class="host-tag">HÔTE</span>' : ''}</div>
        <div class="pmeta">Niveau ${p.level}</div>
      </div>
      <div class="ready-dot"></div>
    </div>
  `).join('');

  gsap.from('.player-row', { x: -30, opacity: 0, stagger: 0.08, duration: 0.4, ease: 'power3.out' });
  gsap.from('.room-code span', { y: -20, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'back.out(1.5)' });
  gsap.from('.mode-pick', { scale: 0.8, opacity: 0, stagger: 0.06, duration: 0.4, ease: 'back.out(1.4)' });
}

// mode picker
document.addEventListener('click', (e) => {
  const m = e.target.closest('.mode-pick');
  if (!m) return;
  $$('.mode-pick').forEach(x => x.classList.remove('active'));
  m.classList.add('active');
  gsap.fromTo(m, { scale: 0.92 }, { scale: 1, duration: 0.25, ease: 'back.out(1.7)' });
});

// ===== VOTE =====
let voteTimer = null;
function initVote() {
  let t = 8;
  $('#vote-timer').textContent = t + 's';
  $$('.vote-card').forEach(c => c.classList.remove('voted'));

  // reset votes
  const votes = { '80s': 1, 'pop-fr': 1, 'rap': 0, 'hits': 1 };
  updateVoteUI(votes);

  gsap.from('.vote-card', { y: 30, opacity: 0, stagger: 0.08, duration: 0.4, ease: 'back.out(1.3)' });

  clearInterval(voteTimer);
  voteTimer = setInterval(() => {
    t--;
    $('#vote-timer').textContent = t + 's';
    // simulate other votes
    if (t === 6) { votes['80s']++; updateVoteUI(votes); }
    if (t === 4) { votes['hits']++; updateVoteUI(votes); }
    if (t === 2) { votes['rap']++; updateVoteUI(votes); }
    if (t <= 0) { clearInterval(voteTimer); setTimeout(() => navigateTo('game'), 600); }
  }, 1000);
}
function updateVoteUI(votes) {
  const total = Object.values(votes).reduce((a, b) => a + b, 0) || 1;
  $$('.vote-card').forEach(c => {
    const k = c.dataset.cat;
    c.querySelector('.vote-count').textContent = votes[k];
    c.querySelector('.vote-bar-fill').style.width = (votes[k] / total * 100) + '%';
  });
}
document.addEventListener('click', (e) => {
  const card = e.target.closest('.vote-card');
  if (!card) return;
  $$('.vote-card').forEach(c => c.classList.remove('voted'));
  card.classList.add('voted');
  gsap.fromTo(card, { scale: 1.05 }, { scale: 1, duration: 0.3, ease: 'back.out(1.6)' });
});

// ===== AUDIO (procedural) =====
let audioCtx = null, currentLoop = null, analyser = null, freqData = null;
function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  catch (e) { audioCtx = null; }
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
  out.gain.value = 0.15;
  out.connect(analyser);

  // Bass line based on song.bpm
  const beat = 60 / song.bpm;
  const bassNotes = [55, 55, 73.5, 65.5, 49, 49, 65.5, 73.5]; // varied progression
  const bass = ctx.createOscillator();
  bass.type = 'sawtooth';
  const bassGain = ctx.createGain();
  bassGain.gain.value = 0;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 300;
  bass.connect(filt); filt.connect(bassGain); bassGain.connect(out);
  bass.frequency.value = bassNotes[0];
  bass.start();

  // schedule a 4-bar pattern, looping
  const startAt = ctx.currentTime;
  const loopLen = beat * 8;
  for (let cycle = 0; cycle < 100; cycle++) {
    for (let s = 0; s < 8; s++) {
      const t0 = startAt + cycle * loopLen + s * beat;
      bass.frequency.setValueAtTime(bassNotes[s], t0);
      bassGain.gain.setValueAtTime(0, t0);
      bassGain.gain.linearRampToValueAtTime(0.6, t0 + 0.02);
      bassGain.gain.linearRampToValueAtTime(0, t0 + beat * 0.9);
    }
  }

  // Kick drum
  const kickInt = setInterval(() => {
    if (!currentLoop || currentLoop.stopped) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.2);
  }, beat * 1000);

  // Hihat
  const hatInt = setInterval(() => {
    if (!currentLoop || currentLoop.stopped) return;
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, 0.05 * ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000;
    const g = ctx.createGain(); g.gain.value = 0.2;
    noise.connect(hp); hp.connect(g); g.connect(out);
    noise.start();
  }, beat * 500);

  // Chord pad (subtle)
  const chord = ctx.createOscillator();
  chord.type = 'triangle';
  chord.frequency.value = 220;
  const chordGain = ctx.createGain(); chordGain.gain.value = 0.08;
  chord.connect(chordGain); chordGain.connect(out);
  chord.start();
  const chordNotes = [220, 220, 261.6, 246.9];
  for (let i = 0; i < 100; i++) {
    chord.frequency.setValueAtTime(chordNotes[i % 4], startAt + i * loopLen / 4);
  }

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
    setTimeout(() => {
      try { currentLoop.bass.stop(); currentLoop.chord.stop(); } catch (e) {}
    }, 250);
  } catch (e) {}
  currentLoop = null;
}
function playWinSound() {
  initAudio();
  if (!audioCtx) return;
  const ctx = audioCtx;
  if (ctx.state === 'suspended') ctx.resume();
  const t = ctx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t + i * 0.08);
    g.gain.linearRampToValueAtTime(0.2, t + i * 0.08 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3);
    o.connect(g); g.connect(ctx.destination);
    o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.4);
  });
}
function playWrongSound() {
  initAudio();
  if (!audioCtx) return;
  const ctx = audioCtx;
  if (ctx.state === 'suspended') ctx.resume();
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square'; o.frequency.value = 180;
  o.frequency.exponentialRampToValueAtTime(80, t + 0.25);
  g.gain.value = 0.12;
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + 0.35);
}

// ===== GAME =====
let gameTimer = null, vizAnim = null, pointsAnim = null;
let botTimers = [];

function buildVizBars() {
  const bars = $('#viz-bars');
  bars.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const b = document.createElement('div');
    b.className = 'bar';
    b.style.height = (20 + Math.random() * 60) + '%';
    bars.appendChild(b);
  }
}
function animateViz() {
  const bars = $$('#viz-bars .bar');
  if (!analyser) {
    // fallback fake bars
    bars.forEach((b, i) => {
      const h = 20 + Math.abs(Math.sin(Date.now() / 200 + i * 0.4)) * 60;
      b.style.height = h + '%';
    });
  } else {
    analyser.getByteFrequencyData(freqData);
    bars.forEach((b, i) => {
      const idx = Math.floor(i / bars.length * freqData.length);
      const v = freqData[idx] / 255;
      b.style.height = Math.max(15, 15 + v * 75) + '%';
    });
  }
  vizAnim = requestAnimationFrame(animateViz);
}

function startGame() {
  STATE.totals = { Guigz: 0, Cath: 0, Jules: 0, 'Léa': 0 };
  STATE.game.round = 0;
  document.body.classList.remove('mode-classic', 'mode-tune-rush', 'mode-stem');
  document.body.classList.add('mode-classic');
  $('#game-total').textContent = STATE.game.total;
  buildVizBars();
  animateViz();
  startRound();
}

function startRound() {
  STATE.game.round++;
  if (STATE.game.round > STATE.game.total) {
    return endGame();
  }
  $('#game-round').textContent = STATE.game.round;
  const song = SONGS[(STATE.game.round - 1) % SONGS.length];
  STATE.game.currentSong = song;
  STATE.game.time = STATE.game.maxTime = 30;
  STATE.game.pointsAvail = 1000;
  STATE.game.found = false;
  STATE.game.partial = false;
  STATE.game.jokers = { letter: false, artist: false, time: false, tempo: false };
  STATE.scores = { Guigz: null, Cath: null, Jules: null, 'Léa': null };
  STATE.game.perRound = { points: 0, xp: 0 };

  $('#answer-input').value = '';
  $('#answer-input').disabled = false;
  $('#answer-hint').textContent = '';
  $('.answer-input').classList.remove('correct', 'wrong', 'partial');
  $$('.joker-chip').forEach(c => c.classList.remove('used'));
  $('#round-end').classList.remove('active');

  updateScoresMini();
  startSongLoop(song);

  // GSAP entrance
  gsap.from('.game-canvas-wrap', { y: -20, opacity: 0, duration: 0.4 });
  gsap.from('.answer-input', { y: 20, opacity: 0, duration: 0.4, delay: 0.1 });
  setTimeout(() => $('#answer-input').focus(), 400);

  // Timer
  clearInterval(gameTimer);
  const ring = $('#timer-ring');
  const total = STATE.game.maxTime;
  gameTimer = setInterval(() => {
    if (STATE.game.found && everyoneAnswered()) {} // doesn't auto-stop
    STATE.game.time -= 0.1;
    const tLeft = Math.max(0, STATE.game.time);
    $('#timer-num').textContent = Math.ceil(tLeft);
    const dash = 157 * (1 - tLeft / total);
    ring.style.strokeDashoffset = dash;
    $('#timer').classList.toggle('danger', tLeft <= 6);

    // points decay
    STATE.game.pointsAvail = Math.max(100, Math.floor(100 + 900 * (tLeft / total)));
    $('#points-avail').textContent = STATE.game.pointsAvail.toLocaleString('fr');

    if (tLeft <= 0) {
      clearInterval(gameTimer);
      endRound();
    }
  }, 100);

  // Bot answers
  clearBotTimers();
  STATE.bots.forEach(b => {
    if (Math.random() > b.accuracy) return; // bot doesn't find this round
    const at = (total * b.delay + Math.random() * 4) * 1000;
    const t = setTimeout(() => {
      if (!STATE.game.found || Math.random() < 0.4) {
        const pts = Math.floor(STATE.game.pointsAvail * (0.9 + Math.random() * 0.1));
        STATE.scores[b.name] = pts;
        STATE.totals[b.name] = (STATE.totals[b.name] || 0) + pts;
        flashCorrect(b);
        updateScoresMini();
      }
    }, at);
    botTimers.push(t);
  });

  // Random emote from bots
  for (let i = 0; i < 3; i++) {
    const t = setTimeout(() => {
      if (STATE.game.found) return;
      const b = STATE.bots[Math.floor(Math.random() * STATE.bots.length)];
      spawnFloatingEmote(['🔥', '😭', '🤯', '👀', '💀', '👏'][Math.floor(Math.random() * 6)]);
    }, 2000 + i * 6000 + Math.random() * 3000);
    botTimers.push(t);
  }
}

function flashCorrect(player) {
  // little notification, but mainly the score row updates
  const row = $$(`.score-row`).find(r => r.dataset.name === player.name);
  if (row) {
    gsap.fromTo(row, { backgroundColor: 'rgba(34,197,94,0.4)' }, { backgroundColor: 'rgba(34,197,94,0.12)', duration: 1 });
  }
}

function everyoneAnswered() {
  return Object.values(STATE.scores).every(v => v !== null);
}

function updateScoresMini() {
  const players = [
    { name: STATE.player.name, seed: STATE.player.avatar, color: '#F97316', you: true },
    ...STATE.bots
  ];
  $('#scores-mini').innerHTML = players.map(p => {
    const name = p.you ? STATE.player.name : p.name;
    const total = STATE.totals[name] || 0;
    const roundScore = STATE.scores[name];
    const found = roundScore !== null && roundScore !== undefined;
    return `<div class="score-row ${found ? 'found' : ''}" data-name="${name}">
      <div class="dot" style="background: ${p.color}"></div>
      <div class="sname">${name}${p.you ? ' (toi)' : ''}</div>
      ${found ? '<span class="check">+' + roundScore + '</span>' : ''}
      <div class="spts">${total.toLocaleString('fr')}</div>
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

$('#answer-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const val = $('#answer-input').value;
  if (!val.trim()) return;
  const song = STATE.game.currentSong;
  if (!song) return;

  const result = checkAnswer(val, song);
  const wrap = $('.answer-input');
  wrap.classList.remove('correct', 'wrong', 'partial');

  if (result.correct && !STATE.game.found) {
    STATE.game.found = true;
    const pts = STATE.game.pointsAvail;
    STATE.scores[STATE.player.name] = pts;
    STATE.totals[STATE.player.name] = (STATE.totals[STATE.player.name] || 0) + pts;
    STATE.game.perRound.points = pts;
    STATE.game.perRound.xp = 80 + Math.floor(pts / 30);
    wrap.classList.add('correct');
    $('#answer-hint').textContent = '✓ Bonne réponse !';
    $('#answer-input').disabled = true;
    playWinSound();
    spawnConfetti();
    updateScoresMini();
    // accelerate end of round (5s more for late bots)
    setTimeout(endRound, 2500);
  } else if (result.partial) {
    wrap.classList.add('partial');
    $('#answer-hint').textContent = '🔥 Tu brûles…';
    gsap.fromTo(wrap, { x: -4 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
  } else {
    wrap.classList.add('wrong');
    $('#answer-hint').textContent = '❌ Pas ça';
    gsap.fromTo(wrap, { x: 0 }, {
      x: 0, duration: 0.4,
      keyframes: [{ x: -8 }, { x: 8 }, { x: -6 }, { x: 6 }, { x: 0 }]
    });
    playWrongSound();
    setTimeout(() => { wrap.classList.remove('wrong'); $('#answer-hint').textContent = ''; }, 1200);
  }
});

function endRound() {
  clearInterval(gameTimer);
  clearBotTimers();
  stopSongLoop();

  const song = STATE.game.currentSong;
  $('#re-pochette').textContent = song.emoji;
  $('#re-pochette').style.background = `linear-gradient(135deg, ${song.color}, #1a1a1a)`;
  $('#re-title').innerHTML = song.title.toUpperCase().replace(' ', '<br>');
  $('#re-artist').textContent = `${song.artist} · ${song.year}`;
  $('#re-pts').textContent = '+' + STATE.game.perRound.points;
  $('#re-xp').textContent = '+' + STATE.game.perRound.xp;

  $('#round-end').classList.add('active');
  gsap.fromTo('.re-pochette', { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.5)' });
  gsap.from('.re-title', { y: 30, opacity: 0, duration: 0.5, delay: 0.2 });
  gsap.from('.re-artist', { y: 20, opacity: 0, duration: 0.4, delay: 0.4 });
  gsap.from('.re-pts-card', { scale: 0, opacity: 0, stagger: 0.1, duration: 0.4, ease: 'back.out(1.6)', delay: 0.5 });

  setTimeout(() => {
    if (STATE.game.round >= STATE.game.total) {
      endGame();
    } else {
      startRound();
    }
  }, 3200);
}

function endGame() {
  stopGameLoop();
  // Apply XP gain
  STATE.player.xp = Math.min(2400, STATE.player.xp + 290);
  navigateTo('results');
}

// ===== JOKERS =====
$('#joker-bar').addEventListener('click', (e) => {
  const chip = e.target.closest('.joker-chip');
  if (!chip || chip.classList.contains('used')) return;
  const j = chip.dataset.joker;
  if (STATE.game.jokers[j]) return;
  STATE.game.jokers[j] = true;
  chip.classList.add('used');
  const song = STATE.game.currentSong;
  let msg = '';
  if (j === 'letter') msg = `🔤 Commence par "${song.title[0]}"`;
  if (j === 'artist') msg = `🎤 Artiste : ${song.artist}`;
  if (j === 'tempo')  msg = `🎵 ${song.bpm} BPM · ${Math.floor(song.year/10)*10}s`;
  if (j === 'time') {
    STATE.game.time += 10;
    STATE.game.maxTime += 10;
    msg = '⏱️ +10 secondes';
  }
  $('#answer-hint').textContent = msg;
  $('#answer-hint').style.color = 'var(--blue-primary)';
  setTimeout(() => $('#answer-hint').style.color = '', 3000);
  gsap.fromTo(chip, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(1.6)' });
  STATE.player.tokens = Math.max(0, STATE.player.tokens - parseInt(chip.querySelector('.jp').textContent));
});

// ===== EMOTES =====
$('.emote-bar').addEventListener('click', (e) => {
  const b = e.target.closest('.emote-btn');
  if (!b) return;
  spawnFloatingEmote(b.dataset.emote);
});
function spawnFloatingEmote(em) {
  const wrap = $('#screen-game');
  const span = document.createElement('div');
  span.className = 'floating-emote';
  span.textContent = em;
  span.style.left = (40 + Math.random() * 280) + 'px';
  span.style.bottom = '100px';
  wrap.appendChild(span);
  gsap.fromTo(span, { y: 0, opacity: 1, scale: 0.3 },
    { y: -300 - Math.random() * 100, opacity: 0, scale: 1.4, duration: 2, ease: 'power2.out',
      onComplete: () => span.remove() });
}

// ===== CONFETTI =====
function spawnConfetti() {
  const wrap = $('#screen-game');
  const mult = STATE.animDensity === 'calm' ? 8 : STATE.animDensity === 'chaotic' ? 50 : 24;
  for (let i = 0; i < mult; i++) {
    const c = document.createElement('div');
    c.style.cssText = `position:absolute; width:8px; height:14px; left:50%; top:30%; background:${['#F97316','#FBBF24','#3B4FE8','#22C55E','#F472B6'][i%5]}; z-index:60; pointer-events:none; border-radius:2px;`;
    wrap.appendChild(c);
    gsap.fromTo(c,
      { x: 0, y: 0, rotation: 0, opacity: 1 },
      {
        x: (Math.random() - 0.5) * 360,
        y: 400 + Math.random() * 200,
        rotation: Math.random() * 720,
        opacity: 0,
        duration: 1.5 + Math.random(),
        ease: 'power2.out',
        onComplete: () => c.remove()
      });
  }
}

// ===== RESULTS =====
function animateResults() {
  // Determine podium from totals
  const players = [
    { name: STATE.player.name, seed: STATE.player.avatar },
    { name: 'Cath',  seed: 'cath-vibe' },
    { name: 'Jules', seed: 'jules-fresh' },
    { name: 'Léa',   seed: 'lea-sunset' }
  ];
  // If no game played, mock
  if (!STATE.totals[STATE.player.name]) {
    STATE.totals = { 'Guigz': 4720, 'Cath': 3240, 'Jules': 2100, 'Léa': 1880 };
  }
  // sort
  const sorted = players.slice().sort((a, b) => (STATE.totals[b.name] || 0) - (STATE.totals[a.name] || 0));

  // Podium top 3
  $('#pod1-name').textContent = sorted[0].name;
  $('#pod1-pts').textContent = (STATE.totals[sorted[0].name] || 0).toLocaleString('fr');
  $('#pod1-avatar').src = avatarUrl(sorted[0].seed);

  $('#pod2-name').textContent = sorted[1].name;
  $('#pod2-pts').textContent = (STATE.totals[sorted[1].name] || 0).toLocaleString('fr');
  $('#pod2-avatar').src = avatarUrl(sorted[1].seed);

  $('#pod3-name').textContent = sorted[2].name;
  $('#pod3-pts').textContent = (STATE.totals[sorted[2].name] || 0).toLocaleString('fr');
  $('#pod3-avatar').src = avatarUrl(sorted[2].seed);

  // Title based on rank
  const playerRank = sorted.findIndex(p => p.name === STATE.player.name) + 1;
  $('.results-title').textContent = playerRank === 1 ? 'VICTOIRE !' : playerRank === 2 ? 'PRESQUE !' : 'DOMMAGE...';

  // Results list (all players incl 4th)
  $('#results-list').innerHTML = sorted.map((p, i) => `
    <div class="result-row">
      <div class="rank">#${i + 1}</div>
      <div class="pavatar"><img src="${avatarUrl(p.seed)}" alt=""></div>
      <div class="pname">${p.name}${p.name === STATE.player.name ? ' (toi)' : ''}</div>
      <div class="ppts">${(STATE.totals[p.name] || 0).toLocaleString('fr')}</div>
    </div>
  `).join('');

  $('#rxp-level').textContent = STATE.player.level;
  $('#rxp-current').textContent = STATE.player.xp;
  $('#rxp-total').textContent = '2400';

  gsap.from('.podium-col', {
    y: 60, opacity: 0, stagger: 0.15, duration: 0.55, ease: 'back.out(1.4)'
  });
  gsap.from('.podium-col .crown', { y: -40, opacity: 0, duration: 0.5, delay: 0.6, ease: 'bounce.out' });
  gsap.from('.result-row', { x: -20, opacity: 0, stagger: 0.08, duration: 0.4, delay: 0.7 });

  // XP fill
  setTimeout(() => {
    $('#rxp-fill').style.width = (STATE.player.xp / 2400 * 100) + '%';
  }, 1000);

  if (playerRank === 1) {
    setTimeout(() => spawnConfettiResults(), 400);
  }
}
function spawnConfettiResults() {
  const wrap = $('#screen-results');
  const mult = STATE.animDensity === 'calm' ? 15 : STATE.animDensity === 'chaotic' ? 80 : 40;
  for (let i = 0; i < mult; i++) {
    const c = document.createElement('div');
    c.style.cssText = `position:absolute; width:8px; height:14px; left:${30 + Math.random() * 80}%; top:0; background:${['#F97316','#FBBF24','#3B4FE8','#22C55E','#F472B6'][i%5]}; z-index:5; pointer-events:none; border-radius:2px;`;
    wrap.appendChild(c);
    gsap.to(c, {
      y: 800,
      x: (Math.random() - 0.5) * 200,
      rotation: Math.random() * 720,
      opacity: 0,
      duration: 2 + Math.random() * 2,
      ease: 'power1.in',
      delay: Math.random() * 0.6,
      onComplete: () => c.remove()
    });
  }
}

// ===== PROFILE =====
function initProfile() {
  $('#prof-avatar').src = avatarUrl(STATE.player.avatar);
  $('#prof-name').textContent = STATE.player.name;
  $('#prof-lvl-num').textContent = STATE.player.level;

  const grid = $('#collection-grid');
  grid.innerHTML = COLLECTION.map(v => `
    <div class="vinyl-card ${v.locked ? 'locked' : ''}" style="--label:${v.label}">
      ${!v.locked && v.rarity !== 'common' ? `<div class="rarity-tag ${v.rarity}">${v.rarity === 'legendary' ? 'LÉG' : 'RARE'}</div>` : ''}
      <div class="vinyl-art"><div class="disk"></div></div>
      <div class="vinyl-info">
        <div class="vt">${v.title}</div>
        <div class="va">${v.artist}</div>
      </div>
    </div>
  `).join('');

  gsap.from('.profile-hero .avatar-lg', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' });
  gsap.from('.profile-hero .pname', { y: 20, opacity: 0, duration: 0.4, delay: 0.2 });
  gsap.from('.level-pill', { scale: 0, duration: 0.4, delay: 0.3, ease: 'back.out(1.7)' });
  gsap.from('.stat-card', { y: 30, opacity: 0, stagger: 0.08, duration: 0.4, delay: 0.4, ease: 'back.out(1.3)' });
  gsap.from('.daily-pack-banner', { y: 30, opacity: 0, duration: 0.4, delay: 0.6 });
  gsap.from('.vinyl-card', { y: 30, opacity: 0, scale: 0.85, stagger: 0.04, duration: 0.35, delay: 0.7, ease: 'back.out(1.4)' });

  // Pulse on pack
  gsap.to('.daily-pack-banner .pack-glow', {
    rotation: 6, duration: 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
}

$('#daily-pack').addEventListener('click', openPack);

// ===== PACK OPENING =====
function openPack() {
  const modal = $('#pack-modal');
  modal.classList.add('active');
  $('#pack-art').style.display = '';
  $('#pack-tap-hint').style.display = '';
  $('#reveal-grid').classList.remove('active');

  gsap.fromTo('#pack-art', { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.6)' });
  gsap.to('#pack-art', {
    rotation: 3, duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
  gsap.fromTo('#pack-tap-hint', { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
}

$('#pack-art').addEventListener('click', revealPack);

function revealPack() {
  const art = $('#pack-art');
  gsap.killTweensOf(art);

  // Shake first then explode
  gsap.fromTo(art, { rotation: 0 }, {
    rotation: 0, duration: 0.6,
    keyframes: [{ rotation: -8 }, { rotation: 8 }, { rotation: -10 }, { rotation: 10 }, { rotation: 0 }],
    onComplete: () => {
      // Particles
      packBurst();
      gsap.to(art, {
        scale: 1.4, opacity: 0, duration: 0.4, ease: 'power3.out',
        onComplete: () => {
          art.style.display = 'none';
          $('#pack-tap-hint').style.display = 'none';
          showRevealed();
        }
      });
    }
  });

  playWinSound();
}

function packBurst() {
  const canvas = $('#pack-canvas');
  const rect = $('#pack-modal').getBoundingClientRect();
  canvas.width = rect.width; canvas.height = rect.height;
  const ctx = canvas.getContext('2d');
  const cx = rect.width / 2, cy = rect.height / 2;
  const parts = [];
  for (let i = 0; i < 80; i++) {
    parts.push({
      x: cx, y: cy,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      r: 3 + Math.random() * 4,
      c: ['#F97316', '#FBBF24', '#F472B6', '#3B4FE8', '#fff'][i % 5],
      life: 1
    });
  }
  function step() {
    ctx.clearRect(0, 0, rect.width, rect.height);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.25;
      p.life -= 0.018;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (parts.some(p => p.life > 0)) requestAnimationFrame(step);
    else ctx.clearRect(0, 0, rect.width, rect.height);
  }
  step();
}

function showRevealed() {
  const grid = $('#reveal-grid');
  const items = [
    { title: 'Voyage Voyage', artist: 'Desireless', rarity: 'common', label: '#F472B6' },
    { title: 'Africa', artist: 'Toto', rarity: 'rare', label: '#22C55E' },
    { title: 'Bohemian Rhapsody', artist: 'Queen', rarity: 'legendary', label: '#FBBF24' }
  ];
  grid.innerHTML = items.map(i => `
    <div class="reveal-card ${i.rarity}">
      <div class="disk" style="--label:${i.label}"></div>
      <div class="info">
        <div class="t">${i.title}</div>
        <div class="a">${i.artist}</div>
        <div class="rar">${i.rarity.toUpperCase()}</div>
      </div>
    </div>
  `).join('');
  grid.classList.add('active');

  const cards = $$('.reveal-card');
  cards.forEach((c, i) => {
    gsap.to(c, {
      opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)',
      delay: 0.2 + i * 0.4
    });
    if (c.classList.contains('legendary')) {
      gsap.fromTo(c, { boxShadow: '0 0 0 rgba(251,191,36,0.8)' }, {
        boxShadow: '0 0 50px rgba(251,191,36,0.8)', duration: 0.5, delay: 0.2 + i * 0.4,
        repeat: 2, yoyo: true
      });
    }
  });
}

$('#pack-close').addEventListener('click', () => {
  $('#pack-modal').classList.remove('active');
});

// ===== BATTLEPASS =====
function initBattlepass() {
  const track = $('#bp-track');
  const tiers = [];
  const rewards = ['🎵', '🎤', '🎁', '⭐', '🎵', '🎁', '👑', '🎤', '🎵', '🎁',
                   '⭐', '🎵', '🎤', '🎁', '🎵', '👑', '⭐', '🎵', '🎁', '🎤'];
  const premium = ['👑', '🎨', '💎', '🎵', '✨', '🎁', '👑', '🎤', '🎚️', '💎',
                   '🎨', '🎵', '👑', '🎁', '🎤', '💎', '👑', '🎵', '⭐', '🎁'];
  for (let i = 0; i < 20; i++) {
    const num = i + 1;
    const claimed = i < 14;
    const current = i === 16; // tier 17
    tiers.push(`
      <div class="bp-tier ${current ? 'current' : ''}">
        <div class="bp-tier-num">${num.toString().padStart(2, '0')}</div>
        <div class="bp-reward ${claimed ? 'claimed' : i > 17 ? 'locked' : ''}">
          <span>${rewards[i]}</span>
          <span class="lbl">${i % 5 === 0 ? '20 🎤' : i % 3 === 0 ? 'PACK' : 'XP'}</span>
        </div>
        <div class="bp-reward premium ${claimed ? 'claimed' : i > 17 ? 'locked' : ''}">
          <span>${premium[i]}</span>
          <span class="lbl">${i % 4 === 0 ? 'SKIN' : i % 3 === 0 ? 'EMOTE' : '50 🎤'}</span>
        </div>
      </div>
    `);
  }
  track.innerHTML = tiers.join('');

  gsap.from('.bp-hero', { y: -30, opacity: 0, duration: 0.5 });
  gsap.from('.bp-toggle', { y: 20, opacity: 0, duration: 0.4, delay: 0.2 });
  gsap.from('.bp-tier', { y: 30, opacity: 0, stagger: 0.04, duration: 0.4, delay: 0.3, ease: 'back.out(1.3)' });
  gsap.from('.bp-premium-cta', { y: 30, opacity: 0, duration: 0.5, delay: 0.8 });

  // scroll to current tier
  setTimeout(() => {
    const cur = $('.bp-tier.current');
    if (cur) cur.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, 700);
}

// ===== TWEAKS PANEL =====
$('#tweaks-fab').addEventListener('click', () => {
  $('#tweaks-panel').classList.toggle('active');
});
$$('.tweak-seg').forEach(seg => {
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const tweak = seg.dataset.tweak;
    const val = b.dataset.val;
    if (tweak === 'tone') {
      $$('[data-tweak="tone"] button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.body.classList.remove('tone-kawaii', 'tone-arcade', 'tone-premium');
      if (val !== 'default') document.body.classList.add('tone-' + val);
      STATE.tones = val;
    } else if (tweak === 'anim') {
      $$('[data-tweak="anim"] button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      STATE.animDensity = val;
      const mult = val === 'calm' ? 0.3 : val === 'chaotic' ? 1.6 : 1;
      document.documentElement.style.setProperty('--anim-mult', mult);
    } else if (tweak === 'goto') {
      navigateTo(val);
    }
  });
});

// ===== INIT =====
setupHomeCanvas();
drawNotes();
onScreenEnter('home');
