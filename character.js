/* ============================================
   Pompelup — personnages (le skin EST l'avatar)
   Illustrations d'origine : « Big Smile » d'Ashley Seo (CC BY 4.0, via DiceBear)
   et Neon Diva. avatar3d.js les transforme en relief 3D.
   ============================================ */
(() => {
'use strict';
const BS = window.BigSmile;

// Humeurs → yeux / bouche de l'illustration
const MOODS = {
  grin: { eyes: ['cheery'], mouth: ['teethSmile'] },
  smirk: { eyes: ['normal'], mouth: ['awkwardSmile'] },
  wow: { eyes: ['starstruck'], mouth: ['openedSmile'] },
  sad: { eyes: ['sad'], mouth: ['openSad'] },
  wink: { eyes: ['winking'], mouth: ['openedSmile'] },
  talk: { mouth: ['openedSmile'] },
};

// Accessoires d'origine, déclinés en couleurs. recolor : ancienne couleur → nouvelle.
const ACCESSORIES = [
  { id: 'cat-grey', slot: 'head', type: 'catEars', name: 'Oreilles de chat', rarity: 'common', price: 150 },
  { id: 'cat-black', slot: 'head', type: 'catEars', recolor: { A09B9B: '#26222E', C4C4C4: '#45404F' }, name: 'Oreilles de chat noir', rarity: 'rare', price: 300 },
  { id: 'cat-pink', slot: 'head', type: 'catEars', recolor: { A09B9B: '#EC4899', C4C4C4: '#F9A8D4' }, name: 'Oreilles bonbon', rarity: 'epic', price: 600 },
  { id: 'crown-silver', slot: 'head', type: 'sailormoonCrown', recolor: { FFC00C: '#9CA3AF', FFD45B: '#E5E7EB' }, name: 'Diadème d’argent', rarity: 'epic', price: 700 },
  { id: 'crown-gold', slot: 'head', type: 'sailormoonCrown', name: 'Diadème d’or', rarity: 'legendary', price: 1200 },
  { id: 'glasses-gold', slot: 'eyes', type: 'glasses', name: 'Lunettes dorées', rarity: 'common', price: 120 },
  { id: 'glasses-red', slot: 'eyes', type: 'glasses', recolor: { '896307': '#991B1B', C5900F: '#DC2626' }, name: 'Lunettes rouges', rarity: 'rare', price: 300 },
  { id: 'sunglasses', slot: 'eyes', type: 'sunglasses', name: 'Lunettes noires', rarity: 'common', price: 150 },
  { id: 'sunglasses-neon', slot: 'eyes', type: 'sunglasses', recolor: { '595757': '#0E7490' }, name: 'Lunettes néon', rarity: 'epic', price: 650 },
  { id: 'sleepmask-pink', slot: 'eyes', type: 'sleepMask', name: 'Masque de nuit rose', rarity: 'rare', price: 300 },
  { id: 'sleepmask-blue', slot: 'eyes', type: 'sleepMask', recolor: { '5E0E56': '#1E3A8A', '9A3E91': '#3B82F6', F9ACF1: '#BFDBFE' }, name: 'Masque de nuit bleu', rarity: 'rare', price: 300 },
  { id: 'clown', slot: 'face', type: 'clownNose', name: 'Nez de clown', rarity: 'rare', price: 250 },
  { id: 'facemask-white', slot: 'face', type: 'faceMask', name: 'Masque blanc', rarity: 'common', price: 120 },
  { id: 'facemask-black', slot: 'face', type: 'faceMask', recolor: { fff: '#2A2733', F7F7F7: '#34303F', EDEDED: '#1E1B26' }, name: 'Masque noir', rarity: 'rare', price: 300 },
  { id: 'mustache-brown', slot: 'face', type: 'mustache', name: 'Moustache', rarity: 'common', price: 120 },
  { id: 'mustache-gold', slot: 'face', type: 'mustache', recolor: { '71472D': '#D4A017', '5E351B': '#A87B0A' }, name: 'Moustache dorée', rarity: 'epic', price: 550 },
];
const SLOTS = { head: 'Tête', eyes: 'Yeux', face: 'Visage' };
const accById = id => ACCESSORIES.find(a => a.id === id);

// Les présentateurs et amis de la toute première version de Pompelup
const SKINS = [
  { id: 'rookie', name: 'DJ Funky', rarity: 'common', price: 0, desc: 'Le présentateur historique : énergie à fond.', seed: 'dj-funky-mc', opts: { eyes: ['winking'], mouth: ['openedSmile'] }, acc: { head: 'cat-grey' } },
  { id: 'crate', name: 'MC Marcel', rarity: 'common', price: 0, desc: 'Mesdames et messieurs, bienvenue dans le show !', seed: 'mc-marcel-vibe', acc: { face: 'mustache-brown' } },
  { id: 'disco', name: 'Disco Stella', rarity: 'rare', price: 450, desc: 'Paillettes et regard de braise.', seed: 'disco-stella-glitter', opts: { eyes: ['cheery'], mouth: ['teethSmile'] }, acc: { eyes: 'glasses-red' } },
  { id: 'rocker', name: 'Neon Rick', rarity: 'rare', price: 450, desc: 'Tout droit sorti des années 80.', seed: 'neon-rick-80s', acc: { eyes: 'sunglasses' } },
  { id: 'mc', name: 'MC Groove', rarity: 'rare', price: 500, desc: 'Des étoiles plein les yeux.', seed: 'mc-groove-fresh', acc: { face: 'mustache-brown' } },
  { id: 'buns', name: 'Mika-chan', rarity: 'rare', price: 500, desc: 'Ganbatte les amis ! Kawaii style.', seed: 'mika-kawaii', opts: { eyes: ['cheery'], mouth: ['kawaii'] }, acc: { head: 'cat-pink' } },
  { id: 'kpop', name: 'Léa', rarity: 'epic', price: 800, desc: 'Toujours dans le salon Boogie.', seed: 'lea-sunset', opts: { eyes: ['cheery'] } },
  { id: 'chanson', name: 'Sir Crooner', rarity: 'epic', price: 800, desc: 'Le jazz, les yeux fermés.', seed: 'crooner-jazzy', acc: { eyes: 'sleepmask-pink' } },
  { id: 'seventies', name: 'Cath', rarity: 'epic', price: 850, desc: 'Reine du Mode Rush.', seed: 'cath-vibe', opts: { eyes: ['normal'], mouth: ['teethSmile'] }, acc: { eyes: 'glasses-gold' } },
  { id: 'neon', name: '???', rarity: 'epic', unlock: true, desc: 'Personne ne connaît son visage.', seed: 'mystery-hooded', acc: { face: 'facemask-black' } },
  { id: 'dj', name: 'Jules', rarity: 'epic', unlock: true, desc: 'Toujours frais, toujours à l’heure.', seed: 'jules-fresh', opts: { eyes: ['cheery'], mouth: ['openedSmile'] }, acc: { head: 'cat-black' } },
  { id: 'astro', name: 'Boogie Boss', rarity: 'legendary', unlock: true, desc: 'Le boss du dancefloor.', seed: 'boogie-boss', opts: { hair: ['froBun'], hairColor: ['d56c0c'], skinColor: ['c99c62'], eyes: ['starstruck'], mouth: ['teethSmile'] }, acc: { eyes: 'sunglasses-neon', face: 'mustache-gold' } },
  { id: 'gold', name: 'Neon Diva', rarity: 'legendary', unlock: true, desc: 'La diva aux paillettes dorées.', src: 'assets/skin-neon-diva.svg' },
];

/* ---------- composition SVG ---------- */
const recolor = (str, map) => { if (!map) return str; for (const [from, to] of Object.entries(map)) str = str.replace(new RegExp(`#${from}(?![0-9a-f])`, 'gi'), to); return str; };
const accCache = new Map();
function accGroup(a) {
  if (accCache.has(a.id)) return accCache.get(a.id);
  const s = BS({ seed: 'acc', accessories: [a.type], accessoriesProbability: 100 });
  const parts = s.split('<g transform');
  let g = '<g transform' + parts[parts.length - 1];
  g = g.slice(0, g.lastIndexOf('</g>', g.lastIndexOf('</g>') - 1) + 4);
  g = recolor(g, a.recolor);
  accCache.set(a.id, g);
  return g;
}
function resolveAccs(sk, extra) {
  const out = {};
  for (const [slot, id] of Object.entries(sk.acc || {})) { const a = typeof id === 'string' ? accById(id) : id; if (a) out[slot] = a; }
  for (const [slot, a] of Object.entries(extra || {})) if (a) out[slot] = a;
  return out;
}
const diva = { svg: null };
function svgOf(sk, opts = {}) {
  if (sk.src) { if (diva.svg == null) diva.svg = window.DIVA_SVG || ''; return diva.svg; }
  if (!BS) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"></svg>';
  const base = BS(Object.assign({ seed: sk.seed || sk.name || 'x', accessoriesProbability: 0 }, sk.opts || {}, MOODS[opts.mood] || {}));
  const accs = resolveAccs(sk, opts.accs);
  // L'ordre visage → yeux → tête garantit la superposition correcte
  const add = ['face', 'eyes', 'head'].map(k => accs[k] ? accGroup(accs[k]) : '').join('');
  const cut = base.lastIndexOf('</g></svg>');
  return cut > 0 ? base.slice(0, cut) + add + base.slice(cut) : base;
}

/* ---------- rendu (3D si disponible, sinon illustration plate) ---------- */
const flatCache = new Map();
function keyOf(sk, opts) {
  const a = opts.accs || {};
  return JSON.stringify([sk.id || sk.seed || sk.name, sk.seed, opts.mood || 'happy', Object.keys(a).sort().map(k => a[k] && a[k].id)]);
}
function html(sk, opts = {}) {
  if (window.Pompe3D && window.Pompe3D.ok()) return window.Pompe3D.html(sk, opts, keyOf(sk, opts));
  const k = keyOf(sk, opts);
  let src = flatCache.get(k);
  if (!src) { src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgOf(sk, opts)); flatCache.set(k, src); }
  return `<img class="char${sk.src ? ' char-tall' : ''}" src="${src}" alt="${String(sk.name || '').replace(/"/g, '&quot;')}" draggable="false">`;
}

window.PompeChar = {
  html, svgOf, keyOf, SKINS, ACCESSORIES, SLOTS, accById,
  byId: id => SKINS.find(s => s.id === id) || SKINS[0],
};
})();
