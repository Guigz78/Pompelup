/* ============================================
   Pompelup — personnages illustrés en pied (le skin EST l'avatar)
   Base : Humaaans de Pablo Stanley (CC BY 4.0), recolorés aux couleurs
   Pompelup ; accessoires dessinés dans le même style (aplats, sans contour).
   ============================================ */
(() => {
'use strict';
const H = window.HUMAAANS;

// Position de la tête dans chaque pose (mesurée) : face = [x, y, l, h], rot en degrés, flip = regarde à gauche
const ANCH = {
  standing1: { face: [149.7, 54.5, 52.8, 80.9], rot: -7, body: [17.6, 15.2, 308.6, 454.8] },
  standing2: { face: [175.8, 50.3, 43.8, 76.1], rot: 0, body: [52, 48.3, 264.8, 413.8] },
  standing3: { face: [188.3, 56, 62, 84.9], rot: 15, body: [111.6, 32.2, 228.7, 438.8] },
  standing4: { face: [189.1, 56.9, 49, 79], rot: 4, body: [29.2, 39, 326.1, 434] },
  standing5: { face: [174.8, 46.3, 43.8, 76.1], rot: 0, body: [52, 42.5, 269.6, 419.7] },
  standing6: { face: [170.2, 51.9, 63.1, 87.1], rot: 14, body: [55.1, 33.6, 286.1, 444.9] },
  standing7: { face: [175.3, 42.6, 45.5, 79.1], rot: 0, body: [27.7, 34.7, 335.1, 435.8] },
  standing8: { face: [176, 58, 42, 73], rot: 0, body: [39.7, 54, 278.3, 399] },
  standing9: { face: [176, 58, 42, 73], rot: 0, body: [53, 20, 276.4, 433] },
  standing10: { face: [176, 58, 42, 73], rot: 0, body: [39.7, 31, 309.3, 422] },
  standing11: { face: [176, 58, 42, 73], rot: 0, body: [66.6, 56, 238.2, 397] },
  standing12: { face: [179, 66, 42, 73], rot: 0, body: [99.2, 48, 209.5, 413] },
  standing13: { face: [140.7, 44.5, 64.2, 87.5], rot: -15, body: [27.6, 39, 308.4, 438.6] },
  standing14: { face: [200.1, 51.6, 69.8, 89.9], rot: 20, body: [25.7, 42.8, 335.1, 437.4] },
  standing15: { face: [196.5, 51.6, 69.8, 89.9], rot: 20, body: [25.7, 22.9, 328.5, 457.2] },
  standing16: { face: [175.3, 42.6, 45.5, 79.1], rot: 0, body: [51.4, 24.2, 277.8, 446.3] },
  standing17: { face: [140.6, 45.5, 64.2, 87.5], rot: -15, body: [40.1, 17.5, 294.5, 461] },
  standing18: { face: [175.3, 42.6, 45.5, 79.1], rot: 0, body: [27.7, 1.4, 335.1, 469.1] },
  standing19: { face: [140.6, 45.5, 64.2, 87.5], rot: -15, body: [46.6, 43.1, 284.7, 435.4] },
  standing20: { face: [175.8, 50.3, 43.8, 76.1], rot: 0, body: [60.1, 47.6, 275.8, 414.5] },
  standing21: { face: [186.2, 56, 62, 84.9], rot: 15, body: [60.1, 49, 275.8, 422] },
  standing22: { face: [186.3, 56, 62, 84.9], rot: 15, body: [29.2, 32.2, 327, 438.8] },
  standing23: { face: [175.8, 50.3, 43.8, 76.1], rot: 0, body: [56.5, 32.6, 258, 429.4] },
  standing24: { face: [142.4, 52.2, 62, 84.9], rot: -15, body: [33.7, 44.1, 296.9, 425.8] },
  sitting1: { face: [162, 55, 42, 73], rot: 0, flip: true, body: [18, 17, 309, 368] },
  sitting2: { face: [162, 55, 42, 73], rot: 0, flip: true, body: [39, 39, 236, 338] },
  sitting4: { face: [162, 55, 42, 73], rot: 0, flip: true, body: [18, 38, 269, 345] },
  sitting5: { face: [162, 55, 42, 73], rot: 0, flip: true, body: [39, 52.7, 256.8, 324.3] },
  sitting8: { face: [178, 55, 42, 73], rot: 0, flip: true, body: [9, 48, 294, 335] },
};

// c = couleurs (skin, hair, shirt, coat, pant, shoe) · acc = accessoires fournis avec la tenue
const SKINS = [
  { id: 'rookie', name: 'Le Débutant', rarity: 'common', price: 0, desc: 'Veste orange, casque violet : le style Pompelup.',
    pose: 'standing12', c: { skin: '#F2C4A8', hair: '#6B3F26', shirt: '#FDE68A', coat: '#F97316', pant: '#3B4A6B', shoe: '#FFFFFF' }, acc: { ears: { type: 'phones', color: '#6D28D9' } } },
  { id: 'crate', name: 'Crate Digger', rarity: 'common', price: 0, desc: 'Bonnet lavande et long manteau vert.',
    pose: 'standing17', c: { skin: '#F4CDB6', hair: '#E8621F', shirt: '#F5F5F4', coat: '#6FAE6A', pant: '#1F2937', shoe: '#FBBF24' }, acc: { head: { type: 'beanie', color: '#8E6BB0' } } },
  { id: 'disco', name: 'Disco Fever', rarity: 'rare', price: 450, desc: 'Rose bonbon et chaussures dorées.',
    pose: 'standing6', c: { skin: '#D9A07A', hair: '#E99A9A', shirt: '#FBBF24', coat: '#EC4899', pant: '#6D28D9', shoe: '#FBBF24' }, acc: { eyes: { type: 'stars', color: '#FBBF24' } } },
  { id: 'rocker', name: 'Rockeur', rarity: 'rare', price: 450, desc: 'Perfecto noir et lunettes de star.',
    pose: 'standing19', c: { skin: '#F2C4A8', hair: '#DC2626', shirt: '#E5E7EB', coat: '#1F2937', pant: '#111827', shoe: '#DC2626' }, acc: { eyes: { type: 'shades', color: '#111827' } } },
  { id: 'mc', name: 'MC Flow', rarity: 'rare', price: 500, desc: 'Casquette et chaîne en or.',
    pose: 'standing4', c: { skin: '#9C6446', hair: '#1A1210', shirt: '#111827', coat: '#7C3AED', pant: '#1F2937', shoe: '#FFFFFF' }, acc: { head: { type: 'cap', color: '#111827' }, neck: { type: 'chain', color: '#FBBF24' } } },
  { id: 'buns', name: 'Space Buns', rarity: 'rare', price: 500, desc: 'Lilas, rose et énergie à revendre.',
    pose: 'standing15', c: { skin: '#EBC0A5', hair: '#7A4A2E', shirt: '#6D28D9', coat: '#DDD6FE', pant: '#F472B6', shoe: '#FFFFFF' } },
  { id: 'kpop', name: 'Idol K-Pop', rarity: 'epic', price: 800, desc: 'Cheveux roses et veste de scène.',
    pose: 'standing8', c: { skin: '#F6D2BD', hair: '#F9A8D4', shirt: '#C084FC', coat: '#F8FAFC', pant: '#1F2937', shoe: '#C084FC' }, acc: { ears: { type: 'phones', color: '#C084FC' } } },
  { id: 'chanson', name: 'Chanson française', rarity: 'epic', price: 800, desc: 'Béret et veste bleu marine.',
    pose: 'standing2', c: { skin: '#F2C4A8', hair: '#3B2A20', shirt: '#FFFFFF', coat: '#1E3A8A', pant: '#1F2937', shoe: '#7C2D12' }, acc: { head: { type: 'beret', color: '#111827' }, neck: { type: 'scarf', color: '#DC2626' } } },
  { id: 'seventies', name: 'Rétro 70s', rarity: 'epic', price: 850, desc: 'Manteau moutarde et lunettes rondes.',
    pose: 'standing13', c: { skin: '#D9A07A', hair: '#7C4A21', shirt: '#FDE68A', coat: '#B45309', pant: '#7C2D12', shoe: '#FDE68A' }, acc: { eyes: { type: 'round', color: '#78350F' } } },
  { id: 'neon', name: 'Néon Rider', rarity: 'epic', unlock: true, desc: 'Visière néon, vitesse lumière.',
    pose: 'standing21', c: { skin: '#E8B394', hair: '#22D3EE', shirt: '#EC4899', coat: '#1E1638', pant: '#111827', shoe: '#22D3EE' }, acc: { eyes: { type: 'visor', color: '#22D3EE' } } },
  { id: 'dj', name: 'DJ de minuit', rarity: 'epic', unlock: true, desc: 'Le casque qui brille dans le noir.',
    pose: 'standing10', c: { skin: '#C98E6B', hair: '#1A1210', shirt: '#22D3EE', coat: '#1F2937', pant: '#111827', shoe: '#22D3EE' }, acc: { ears: { type: 'phones', color: '#22D3EE', glow: true } } },
  { id: 'astro', name: 'Funk astronaute', rarity: 'legendary', unlock: true, desc: 'En orbite autour de la platine.',
    pose: 'standing16', c: { skin: '#F2C4A8', hair: '#6B3F26', shirt: '#F97316', coat: '#F1F5F9', pant: '#E2E8F0', shoe: '#F97316' }, acc: { head: { type: 'helmet', color: '#BAE6FD' } } },
  { id: 'gold', name: 'Disque d’or', rarity: 'legendary', unlock: true, desc: 'Costume doré, couronne et casque en or.',
    pose: 'standing3', c: { skin: '#E8B394', hair: '#2B1B12', shirt: '#78350F', coat: '#E8B230', pant: '#78350F', shoe: '#FBBF24' }, acc: { head: { type: 'crown', color: '#FBBF24' }, ears: { type: 'phones', color: '#FBBF24', glow: true } } },
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
const SLOTS = { head: 'Tête', eyes: 'Yeux', ears: 'Oreilles', neck: 'Cou' };

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/* Accessoires en coordonnées « tête » : origine au sommet du crâne, x vers l'avant du visage,
   largeur de tête ≈ 44, hauteur tête + cou ≈ 80. */
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

function colorsOf(sk) {
  const c = sk.c || {};
  return { skinColor: c.skin, hairColor: c.hair, shirtColor: c.shirt, coatColor: c.coat, pantColor: c.pant, shoeColor: c.shoe || '#FFFFFF', hatColor: c.hat || c.hair };
}
const inner = s => s.slice(s.indexOf('>') + 1, s.lastIndexOf('</svg>'));
// Retire le siège (ballon, cube…) fourni avec les poses assises
function stripSeat(str) {
  try {
    const doc = new DOMParser().parseFromString(str, 'image/svg+xml');
    doc.querySelectorAll('[id^="Objects/"]').forEach(n => n.remove());
    return new XMLSerializer().serializeToString(doc.documentElement);
  } catch (e) { return str; }
}
const NS = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';

/* opts : head (cadrage tête), lying (allongé, pour le canapé), accs ({ head, eyes, ears, neck } → accessoire) */
function svg(sk, opts = {}) {
  const pose = opts.lying ? 'sitting2' : (ANCH[sk.pose] ? sk.pose : 'standing12');
  const A = ANCH[pose];
  const accs = Object.assign({}, sk.acc || {}, opts.accs || {});
  let raw = H ? H[pose](colorsOf(sk)) : '<svg></svg>';
  if (opts.lying) raw = stripSeat(raw);
  const body = inner(raw);
  const [fx, fy, fw, fh] = A.face;
  const s = fh / 80;
  const hx = fx + fw / 2, hy = fy - 2;
  const tf = A.flip ? `translate(${hx} ${hy}) scale(${-s} ${s})` : `translate(${hx} ${hy}) rotate(${A.rot}) scale(${s})`;
  const accSvg = ['ears', 'neck', 'eyes', 'head'].map(k => accs[k] ? drawAcc(accs[k]) : '').join('');
  const content = `<g>${body}</g><g transform="${tf}">${accSvg}</g>`;
  const [bx, by, bw, bh] = A.body;
  const label = `role="img" aria-label="${sk.name || ''}"`;
  if (opts.lying) {
    // Allongé sur le côté, la tête sur l'accoudoir : on couche la pose assise
    return `<svg class="char char-lying" viewBox="-60 40 500 300" ${NS} ${label}><g transform="rotate(72 190 200)">${content}</g></svg>`;
  }
  let vb;
  if (opts.head) { const size = fh * 1.25; vb = [fx + fw / 2 - size / 2 - fw * .15, fy - size * .3, size, size]; }
  else vb = [bx - 14, by - 26, bw + 28, bh + 34];
  return `<svg class="char${opts.head ? ' char-head' : ' char-full'}" viewBox="${vb.map(v => v.toFixed(1)).join(' ')}" ${NS} ${label}>${content}</svg>`;
}

// Rendu en <img> mis en cache : le navigateur rastérise une seule fois.
const imgCache = new Map();
function html(sk, opts = {}) {
  const a = opts.accs || {};
  const key = JSON.stringify([sk.id || sk, opts.head ? 1 : opts.lying ? 2 : 0, Object.keys(a).sort().map(k => a[k] && (a[k].id || a[k].type + a[k].color))]);
  let src = imgCache.get(key);
  if (!src) { src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(sk, opts)); imgCache.set(key, src); }
  const cls = `char${opts.head ? ' char-head' : opts.lying ? ' char-lying' : ' char-full'}`;
  const alt = sk.name ? String(sk.name).replace(/"/g, '&quot;') : '';
  return `<img class="${cls}" src="${src}" alt="${alt}" draggable="false">`;
}

window.PompeChar = {
  html, svg, SKINS, ACCESSORIES, SLOTS,
  byId: id => SKINS.find(s => s.id === id) || SKINS[0],
  accById: id => ACCESSORIES.find(a => a.id === id),
};
})();
