/* ============================================
   Pompelup — personnages (le skin EST l'avatar)
   Musiciens tirés des illustrations colorées de Pompelup (chars-svg.js),
   déclinés en skins par recoloration ; accessoires posés sur la tête.
   avatar3d.js les met en relief.
   ============================================ */
(() => {
'use strict';
const SRC = window.CHAR_SVG || {};

// Tête de chaque musicien (repère de l'illustration) : sommet du crâne, largeur, inclinaison, regard (-1 = vers la gauche)
const HEAD = {
  rap: { x: 566, y: 138, w: 70, rot: 10, dir: 1 },
  rock: { x: 197, y: 58, w: 84, rot: -12, dir: -1 },
  jazz: { x: 582, y: 176, w: 62, rot: 12, dir: -1 },
  bass: { x: 130, y: 160, w: 44, rot: -10, dir: -1 },
  drum: { x: 506, y: 204, w: 54, rot: 0, dir: 1 },
};
const NAMES = { rap: 'la rappeuse', rock: 'le rockeur', jazz: 'le trompettiste', bass: 'le contrebassiste', drum: 'le batteur' };

// base = musicien ; map = couleurs d'origine → nouvelles couleurs
const SKINS = [
  { id: 'rookie', base: 'rap', name: 'Boombox Queen', rarity: 'common', price: 0, desc: 'Le boombox sur l’épaule, toujours prête à danser.' },
  { id: 'crate', base: 'jazz', name: 'Trompette Jazz', rarity: 'common', price: 0, desc: 'Une note de trompette et tout le club se lève.' },
  { id: 'rocker', base: 'rock', name: 'Guitar Hero', rarity: 'rare', price: 450, desc: 'Solo de guitare et cornes du diable.' },
  { id: 'mc', base: 'drum', name: 'Batteur Swing', rarity: 'rare', price: 500, desc: 'Il tient le rythme de tout le groupe.' },
  { id: 'chanson', base: 'bass', name: 'Contrebasse Club', rarity: 'rare', price: 500, desc: 'La ligne de basse la plus classe de la ville.' },
  { id: 'disco', base: 'rap', name: 'Pink Party', rarity: 'rare', price: 450, desc: 'Pantalon violet et boombox fuchsia.',
    map: { F89B0F: '#8B5CF6', F68113: '#7C3AED', F9A60D: '#A78BFA', F7980F: '#8B5CF6', '216751': '#DB2777', '31AB60': '#F472B6' } },
  { id: 'buns', base: 'rap', name: 'Menthe à l’eau', rarity: 'epic', price: 800, desc: 'Tout en menthe et bleu glacier.',
    map: { F89B0F: '#34D399', F68113: '#10B981', F9A60D: '#6EE7B7', F7980F: '#34D399', '5BA7E0': '#E0F2FE', '5991D4': '#BAE6FD', '5B8FD2': '#BAE6FD', EF372C: '#0EA5E9' } },
  { id: 'kpop', base: 'rock', name: 'Glam Rock', rarity: 'epic', price: 800, desc: 'Paillettes roses sur la scène.',
    map: { '4669BB': '#EC4899', '3D54AD': '#BE185D', '4361B6': '#DB2777', F04035: '#A855F7', '36B66B': '#FBBF24', F7981C: '#F9A8D4', F6821E: '#F472B6' } },
  { id: 'seventies', base: 'jazz', name: 'Rétro Groove', rarity: 'epic', price: 850, desc: 'Costume moutarde, pantalon chocolat.',
    map: { '55A5E0': '#D97706', '5496D7': '#B45309', '4C72C1': '#92400E', '4361B6': '#92400E', '36B66B': '#78350F', '2D8668': '#5B2A0B', '226953': '#451A03' } },
  { id: 'neon', base: 'rock', name: 'Néon Shredder', rarity: 'epic', unlock: true, desc: 'La guitare qui brille dans le noir.',
    map: { '4669BB': '#1E1B4B', '3D54AD': '#111827', '4361B6': '#1E1B4B', F04035: '#22D3EE', '36B66B': '#F0ABFC', F7981C: '#A3E635', F6821E: '#84CC16' } },
  { id: 'dj', base: 'drum', name: 'Minuit Swing', rarity: 'epic', unlock: true, desc: 'Costume noir et batterie néon.',
    map: { '5799D9': '#1F2937', '5BB0E6': '#374151', '4B60B6': '#111827', F89B0F: '#22D3EE', F9D107: '#A78BFA', F68541: '#F97316' } },
  { id: 'astro', base: 'bass', name: 'Contrebasse d’argent', rarity: 'legendary', unlock: true, desc: 'Costume blanc et instrument chromé.',
    map: { '5BA7E0': '#F1F5F9', '5BB0E6': '#E2E8F0', '5993D5': '#CBD5E1', '4B60B6': '#94A3B8', F89B0F: '#CBD5E1', EF372C: '#64748B' } },
  { id: 'gold', base: 'jazz', name: 'Trompette d’or', rarity: 'legendary', unlock: true, desc: 'Un costume en or pour le roi du jazz.',
    map: { '55A5E0': '#FBBF24', '5496D7': '#F59E0B', '4C72C1': '#D97706', '4361B6': '#B45309', '36B66B': '#111827', '2D8668': '#1F2937', '226953': '#030712' } },
];

const ACCESSORIES = [
  { id: 'cap-red', slot: 'head', type: 'cap', color: '#DC2626', name: 'Casquette rouge', rarity: 'common', price: 150 },
  { id: 'beanie', slot: 'head', type: 'beanie', color: '#8E6BB0', name: 'Bonnet lavande', rarity: 'common', price: 150 },
  { id: 'bob', slot: 'head', type: 'bob', color: '#86C59A', name: 'Bob de festival', rarity: 'rare', price: 300 },
  { id: 'beret', slot: 'head', type: 'beret', color: '#1F2937', name: 'Béret parisien', rarity: 'rare', price: 300 },
  { id: 'fedora', slot: 'head', type: 'fedora', color: '#2B2F3A', name: 'Fedora du crooner', rarity: 'epic', price: 650 },
  { id: 'crown', slot: 'head', type: 'crown', color: '#FBBF24', name: 'Couronne du roi', rarity: 'legendary', price: 1200 },
  { id: 'halo', slot: 'head', type: 'halo', color: '#22D3EE', name: 'Auréole néon', rarity: 'legendary', price: 1200 },
  { id: 'shades', slot: 'eyes', type: 'shades', color: '#111827', name: 'Lunettes noires', rarity: 'common', price: 120 },
  { id: 'round', slot: 'eyes', type: 'round', color: '#78350F', name: 'Lunettes rondes', rarity: 'common', price: 120 },
  { id: 'hearts', slot: 'eyes', type: 'hearts', color: '#EC4899', name: 'Lunettes cœur', rarity: 'rare', price: 300 },
  { id: 'stars', slot: 'eyes', type: 'stars', color: '#FBBF24', name: 'Lunettes étoiles', rarity: 'epic', price: 550 },
  { id: 'visor', slot: 'eyes', type: 'visor', color: '#22D3EE', name: 'Visière néon', rarity: 'epic', price: 650 },
  { id: 'ph-violet', slot: 'ears', type: 'phones', color: '#6D28D9', name: 'Casque violet', rarity: 'common', price: 150 },
  { id: 'ph-pink', slot: 'ears', type: 'phones', color: '#F472B6', name: 'Casque bonbon', rarity: 'rare', price: 300 },
  { id: 'ph-neon', slot: 'ears', type: 'phones', color: '#22D3EE', glow: true, name: 'Casque néon', rarity: 'epic', price: 650 },
  { id: 'ph-gold', slot: 'ears', type: 'phones', color: '#FBBF24', glow: true, name: 'Casque doré', rarity: 'legendary', price: 1100 },
  { id: 'bowtie', slot: 'neck', type: 'bowtie', color: '#DC2626', name: 'Nœud papillon', rarity: 'common', price: 120 },
  { id: 'scarf', slot: 'neck', type: 'scarf', color: '#F97316', name: 'Écharpe orange', rarity: 'common', price: 150 },
  { id: 'bandana', slot: 'neck', type: 'bandana', color: '#2563EB', name: 'Bandana bleu', rarity: 'rare', price: 300 },
  { id: 'chain', slot: 'neck', type: 'chain', color: '#FBBF24', name: 'Chaîne en or', rarity: 'rare', price: 350 },
  { id: 'medal', slot: 'neck', type: 'medal', color: '#F97316', name: 'Médaille vinyle', rarity: 'epic', price: 600 },
];
const SLOTS_OLD = { head: 'Tête', eyes: 'Yeux', ears: 'Oreilles', neck: 'Cou' };

const SLOTS = { head: 'Tête', eyes: 'Yeux', ears: 'Oreilles', neck: 'Cou' };

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('')}`;
}
function drawAcc(a) {
  const c = a.color, d = shade(c, -.25), l = shade(c, .35);
  switch (a.type) {
    case 'beanie': return `<path d="M-25 20 C-27 -4 -12 -14 2 -14 C18 -14 30 -4 27 20 Z" fill="${c}"/><rect x="-27" y="13" width="56" height="10" rx="5" fill="${d}"/><circle cx="1" cy="-16" r="6" fill="${l}"/>`;
    case 'cap': return `<path d="M-22 16 C-24 -6 -8 -12 4 -12 C18 -12 26 -2 24 16 Z" fill="${c}"/><path d="M18 12 C30 10 42 12 46 17 C38 19 26 18 18 17 Z" fill="${d}"/><circle cx="2" cy="-12" r="2.5" fill="${l}"/>`;
    case 'bob': return `<path d="M-19 12 C-20 -8 -8 -12 3 -12 C16 -12 24 -6 23 12 Z" fill="${c}"/><path d="M-32 14 C-10 6 16 6 36 14 L38 19 C14 13 -12 13 -34 19 Z" fill="${d}"/>`;
    case 'beret': return `<ellipse cx="-2" cy="2" rx="30" ry="10" fill="${c}" transform="rotate(-10 -2 2)"/><rect x="-3" y="-11" width="3.5" height="7" rx="1.5" fill="${c}"/>`;
    case 'fedora': return `<ellipse cx="2" cy="10" rx="38" ry="6" fill="${d}"/><path d="M-16 10 L-14 -12 C-6 -18 10 -18 18 -12 L20 10 Z" fill="${c}"/><rect x="-16" y="2" width="36" height="5" fill="#F5F5F4"/>`;
    case 'crown': return `<path d="M-18 6 L-20 -16 L-10 -6 L0 -20 L10 -6 L20 -16 L18 6 Z" fill="${c}"/><rect x="-18" y="2" width="36" height="6" rx="2" fill="${d}"/><circle cx="0" cy="-6" r="2.6" fill="#EF4444"/><circle cx="-10" cy="1" r="1.8" fill="#38BDF8"/><circle cx="10" cy="1" r="1.8" fill="#38BDF8"/>`;
    case 'halo': return `<ellipse cx="0" cy="-14" rx="20" ry="5" fill="none" stroke="${c}" stroke-width="4"/><ellipse cx="0" cy="-14" rx="20" ry="5" fill="none" stroke="${c}" stroke-width="10" opacity=".25"/>`;
    case 'helmet': return `<circle cx="2" cy="26" r="36" fill="${c}" opacity=".35"/><circle cx="2" cy="26" r="36" fill="none" stroke="#E2E8F0" stroke-width="4"/><path d="M-22 6 C-16 -4 -6 -8 4 -8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`;
    case 'robot': return `<circle cx="2" cy="24" r="30" fill="${c}"/><rect x="-22" y="16" width="50" height="14" rx="7" fill="#111827"/><rect x="-16" y="21" width="38" height="3" rx="1.5" fill="#F43F5E"/>`;
    case 'shades': return `<rect x="8" y="22" width="20" height="10" rx="4" fill="${c}"/><rect x="-6" y="22" width="11" height="10" rx="4" fill="${c}"/><rect x="4" y="24" width="5" height="2.5" fill="${c}"/><rect x="11" y="24" width="7" height="2" rx="1" fill="#fff" opacity=".5"/>`;
    case 'round': return `<circle cx="18" cy="27" r="7" fill="rgba(255,255,255,.25)" stroke="${c}" stroke-width="2.5"/><circle cx="1" cy="27" r="6" fill="rgba(255,255,255,.25)" stroke="${c}" stroke-width="2.5"/><path d="M7 27 L11 27" stroke="${c}" stroke-width="2.5"/>`;
    case 'hearts': { const h = (x, y, s) => `<path d="M${x} ${y + 6 * s} C${x - 10 * s} ${y} ${x - 7 * s} ${y - 7 * s} ${x} ${y - 3 * s} C${x + 7 * s} ${y - 7 * s} ${x + 10 * s} ${y} ${x} ${y + 6 * s} Z" fill="${c}"/>`; return h(18, 27, 1.05) + h(1, 27, .9) + `<rect x="7" y="25" width="5" height="2.5" fill="${d}"/>`; }
    case 'stars': { const st = (cx, cy, r) => { let p = ''; for (let k = 0; k < 10; k++) { const an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; p += `${k ? 'L' : 'M'}${(cx + Math.cos(an) * rr).toFixed(1)} ${(cy + Math.sin(an) * rr).toFixed(1)} `; } return `<path d="${p}Z" fill="${c}" stroke="${d}" stroke-width="1"/>`; }; return st(18, 27, 9) + st(1, 27, 7.5); }
    case 'visor': return `<rect x="-10" y="21" width="42" height="11" rx="5.5" fill="${c}" opacity=".92"/><rect x="0" y="23" width="18" height="2.5" rx="1.2" fill="#fff" opacity=".7"/>`;
    case 'phones': { const g = a.glow ? `<circle cx="-6" cy="30" r="11" fill="${c}" opacity=".25"/>` : ''; return `${g}<path d="M-12 30 C-16 4 -2 -12 8 -11 C18 -10 26 0 24 14" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/><rect x="-14" y="21" width="15" height="19" rx="7" fill="${c}"/><rect x="-11" y="24" width="3" height="12" rx="1.5" fill="#fff" opacity=".4"/>`; }
    case 'bowtie': return `<path d="M4 70 L-8 64 L-8 76 Z M4 70 L16 64 L16 76 Z" fill="${c}"/><circle cx="4" cy="70" r="3" fill="${d}"/>`;
    case 'scarf': return `<path d="M-14 62 C-4 70 12 70 22 62 L23 71 C12 79 -4 79 -15 71 Z" fill="${c}"/><rect x="10" y="68" width="9" height="24" rx="4" fill="${d}" transform="rotate(-10 14 68)"/>`;
    case 'bandana': return `<path d="M-12 63 C0 70 12 70 22 63 L6 84 Z" fill="${c}"/><circle cx="4" cy="69" r="1.5" fill="#fff"/><circle cx="11" cy="67" r="1.5" fill="#fff"/><circle cx="7" cy="75" r="1.5" fill="#fff"/>`;
    case 'chain': return `<path d="M-10 64 C-6 82 14 82 18 64" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 1.6"/><circle cx="4" cy="80" r="4.5" fill="${c}" stroke="${d}" stroke-width="1"/>`;
    case 'medal': return `<path d="M-6 64 L4 80 L14 64" fill="none" stroke="${c}" stroke-width="3"/><circle cx="4" cy="84" r="6.5" fill="#1d1233" stroke="#FBBF24" stroke-width="2"/><circle cx="4" cy="84" r="2.2" fill="${c}"/>`;
  }
  return '';
}


const accById = id => ACCESSORIES.find(a => a.id === id);
const recolor = (str, map) => { if (!map) return str; for (const [from, to] of Object.entries(map)) str = str.replace(new RegExp(`#${from}(?![0-9a-f])`, 'gi'), to); return str; };
function resolveAccs(sk, extra) {
  const out = {};
  for (const [slot, id] of Object.entries(sk.acc || {})) { const a = typeof id === 'string' ? accById(id) : id; if (a) out[slot] = a; }
  for (const [slot, a] of Object.entries(extra || {})) if (a) out[slot] = a;
  return out;
}
// opts : accs ({ head, eyes, ears, neck } → accessoire), head (cadrage sur la tête)
function svgOf(sk, opts = {}) {
  const base = sk.base || 'rap';
  let s = SRC[base] || '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>';
  s = recolor(s, sk.map);
  const h = HEAD[base], accs = resolveAccs(sk, opts.accs);
  const sc = h.w / 44;
  const acc = ['ears', 'neck', 'eyes', 'head'].map(k => accs[k] ? drawAcc(accs[k]) : '').join('');
  if (acc) s = s.replace(/<\/svg>$/, `<g transform="translate(${h.x} ${h.y}) rotate(${h.rot}) scale(${sc * h.dir} ${sc})">${acc}</g></svg>`);
  if (opts.head) {
    const size = h.w * 2.1;
    s = s.replace(/viewBox="[^"]+"/, `viewBox="${h.x - size / 2} ${h.y - size * .22} ${size} ${size}"`);
  }
  return s;
}
function keyOf(sk, opts) {
  const a = opts.accs || {};
  return JSON.stringify([sk.id || sk.base, sk.base, sk.map ? Object.values(sk.map).join('') : '', opts.head ? 1 : 0, Object.keys(a).sort().map(k => a[k] && a[k].id)]);
}
const flatCache = new Map();
function html(sk, opts = {}) {
  if (window.Pompe3D && window.Pompe3D.ok()) return window.Pompe3D.html(sk, opts, keyOf(sk, opts));
  const k = keyOf(sk, opts);
  let src = flatCache.get(k);
  if (!src) { src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgOf(sk, opts)); flatCache.set(k, src); }
  return `<img class="char${opts.head ? ' char-head' : ''}" src="${src}" alt="${String(sk.name || '').replace(/"/g, '&quot;')}" draggable="false">`;
}

window.PompeChar = {
  html, svgOf, keyOf, SKINS, ACCESSORIES, SLOTS, accById, NAMES,
  byId: id => SKINS.find(s => s.id === id) || SKINS[0],
};
})();
