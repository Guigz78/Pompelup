/* ============================================
   Pompelup — personnage maison (le skin EST l'avatar)
   Mascotte « sticker » : grosse tête, petit corps, contour encré,
   ombre douce par pièce. Poses : relax, wave, hips ; option lying (canapé).
   ============================================ */
(() => {
'use strict';

const INK = '#1B1026';

// hair : [style, couleur] · top : [style, couleur, couleur secondaire] · arms : relax | wave | hips
const SKINS = [
  { id: 'rookie', name: 'Le Débutant', rarity: 'common', price: 0, desc: 'Hoodie orange, casque violet : le style Pompelup.',
    skin: '#F6C9A8', hair: ['swept', '#6B3F26'], top: ['hoodie', '#F97316'], pant: '#3B4A6B', shoe: '#FFFFFF', arms: 'wave', acc: { ears: { type: 'phones', color: '#7C3AED' } } },
  { id: 'crate', name: 'Crate Digger', rarity: 'common', price: 0, desc: 'Bonnet lavande, mèches orange et pull en maille.',
    skin: '#F7D2BC', hair: ['long', '#EA6A2A'], top: ['sweater', '#72B56B'], pant: '#2B3345', shoe: '#FBBF24', arms: 'relax', acc: { head: { type: 'beanie', color: '#9B7BC4' } } },
  { id: 'disco', name: 'Disco Fever', rarity: 'rare', price: 450, desc: 'Boucles roses et t-shirt pop.',
    skin: '#D9A07A', hair: ['curls', '#F2A0A8'], top: ['tee', '#FFFFFF', '#EC4899'], pant: '#6D28D9', shoe: '#FBBF24', arms: 'wave', acc: { eyes: { type: 'stars', color: '#FBBF24' } } },
  { id: 'rocker', name: 'Rockeur', rarity: 'rare', price: 450, desc: 'Crête rouge et perfecto noir.',
    skin: '#F6C9A8', hair: ['mohawk', '#E11D48'], top: ['jacket', '#1F2937', '#F3F4F6'], pant: '#111827', shoe: '#E11D48', arms: 'hips', acc: { eyes: { type: 'shades', color: '#111827' } } },
  { id: 'mc', name: 'MC Flow', rarity: 'rare', price: 500, desc: 'Casquette et chaîne en or.',
    skin: '#9C6446', hair: ['short', '#1A1210'], top: ['hoodie', '#7C3AED'], pant: '#1F2937', shoe: '#FFFFFF', arms: 'hips', acc: { head: { type: 'cap', color: '#111827' }, neck: { type: 'chain', color: '#FBBF24' } } },
  { id: 'buns', name: 'Space Buns', rarity: 'rare', price: 500, desc: 'Petits chignons à perles colorées.',
    skin: '#EBC0A5', hair: ['buns', '#7A4A2E'], top: ['tee', '#DDD6FE', '#7C3AED'], pant: '#F472B6', shoe: '#FFFFFF', arms: 'wave' },
  { id: 'kpop', name: 'Idol K-Pop', rarity: 'epic', price: 800, desc: 'Carré pastel et veste de scène.',
    skin: '#F8D8C4', hair: ['bob', '#F9A8D4'], top: ['jacket', '#FFFFFF', '#C084FC'], pant: '#1F2937', shoe: '#C084FC', arms: 'hips', acc: { ears: { type: 'phones', color: '#C084FC' } } },
  { id: 'chanson', name: 'Chanson française', rarity: 'epic', price: 800, desc: 'Béret, marinière et moustache.',
    skin: '#F6C9A8', hair: ['short', '#3B2A20'], top: ['stripes', '#1E3A8A'], pant: '#1F2937', shoe: '#7C2D12', arms: 'relax', extra: 'moustache', acc: { head: { type: 'beret', color: '#1F2937' }, neck: { type: 'scarf', color: '#DC2626' } } },
  { id: 'seventies', name: 'Rétro 70s', rarity: 'epic', price: 850, desc: 'Cheveux longs et costume moutarde.',
    skin: '#D9A07A', hair: ['long', '#7C4A21'], top: ['suit', '#C27D14', '#FDE68A'], pant: '#7C2D12', shoe: '#FDE68A', arms: 'wave', acc: { eyes: { type: 'round', color: '#78350F' } } },
  { id: 'neon', name: 'Néon Rider', rarity: 'epic', unlock: true, desc: 'Visière néon, vitesse lumière.',
    skin: '#E8B394', hair: ['mohawk', '#22D3EE'], top: ['jacket', '#231A45', '#EC4899'], pant: '#111827', shoe: '#22D3EE', arms: 'hips', acc: { eyes: { type: 'visor', color: '#22D3EE' } } },
  { id: 'dj', name: 'DJ de minuit', rarity: 'epic', unlock: true, desc: 'Le casque qui brille dans le noir.',
    skin: '#C98E6B', hair: ['bun', '#1A1210'], top: ['hoodie', '#1F2937'], pant: '#111827', shoe: '#22D3EE', arms: 'wave', acc: { ears: { type: 'phones', color: '#22D3EE', glow: true } } },
  { id: 'astro', name: 'Funk astronaute', rarity: 'legendary', unlock: true, desc: 'En orbite autour de la platine.',
    skin: '#F6C9A8', hair: ['swept', '#6B3F26'], top: ['space', '#F1F5F9', '#F97316'], pant: '#E2E8F0', shoe: '#F97316', arms: 'wave', acc: { head: { type: 'helmet', color: '#BAE6FD' } } },
  { id: 'gold', name: 'Disque d’or', rarity: 'legendary', unlock: true, desc: 'Costume doré, couronne et casque en or.',
    skin: '#E8B394', hair: ['swept', '#2B1B12'], top: ['suit', '#E8B230', '#78350F'], pant: '#78350F', shoe: '#FBBF24', arms: 'hips', acc: { head: { type: 'crown', color: '#FBBF24' }, ears: { type: 'phones', color: '#FBBF24', glow: true } } },
];

const ACCESSORIES = [
  { id: 'cap-red', slot: 'head', type: 'cap', color: '#DC2626', name: 'Casquette rouge', rarity: 'common', price: 150 },
  { id: 'beanie', slot: 'head', type: 'beanie', color: '#9B7BC4', name: 'Bonnet lavande', rarity: 'common', price: 150 },
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
  { id: 'ph-violet', slot: 'ears', type: 'phones', color: '#7C3AED', name: 'Casque violet', rarity: 'common', price: 150 },
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
// Forme encrée : remplissage + contour
const ink = (w = 3.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const P = (d, fill, w) => `<path d="${d}" fill="${fill}" ${ink(w)}/>`;
// Membre en « capsule » : contour épais puis couleur
const limb = (pts, color, r) => { const d = 'M' + pts.map(p => p.join(' ')).join(' L'); return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${2 * r + 7}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${2 * r}" stroke-linecap="round" stroke-linejoin="round"/>`; };

let uid = 0;
/* opts : mood (happy | grin | smirk | wow | sad | wink | talk), head (tête seule),
   lying (allongé, pour le canapé), accs ({ head, eyes, ears, neck } → accessoire) */
function svg(sk, opts = {}) {
  const u = `pc${++uid}`, mood = opts.mood || 'happy';
  const acc = Object.assign({}, sk.acc || {}, opts.accs || {});
  const [hairStyle, hairC = '#2B1B12'] = sk.hair || ['short'];
  const [topStyle, topC, topC2 = '#FFFFFF'] = sk.top || ['tee', '#F97316'];
  const skin = sk.skin || '#F6C9A8', skinD = shade(skin, -.14);
  const pant = sk.pant || '#3B4A6B', shoe = sk.shoe || '#FFFFFF';
  const arms = opts.lying ? 'relax' : (sk.arms || 'relax');
  const hD = shade(hairC, -.22), hL = shade(hairC, .3);
  const topD = shade(topC, -.2);

  const defs = `<clipPath id="${u}h"><ellipse cx="100" cy="92" rx="60" ry="56"/></clipPath><clipPath id="${u}t"><path d="M62 170 Q62 150 84 147 L116 147 Q138 150 138 170 L134 216 Q100 224 66 216 Z"/></clipPath>`;

  /* ---------- Jambes ---------- */
  const legs = [];
  legs.push(`<ellipse cx="100" cy="271" rx="50" ry="7" fill="${INK}" opacity=".14"/>`);
  [[88, -1], [112, 1]].forEach(([x, s]) => {
    legs.push(`<rect x="${x - 10}" y="205" width="20" height="54" rx="9" fill="${pant}" ${ink()}/>`);
    legs.push(`<rect x="${x - 10 + (s > 0 ? 12 : 0)}" y="210" width="6" height="44" rx="3" fill="#000" opacity=".12"/>`);
    legs.push(P(`M${x - 12 + s * 3} 252 Q${x - 14 + s * 3} 268 ${x + s * 8} 268 L${x + 14 + s * 10} 268 Q${x + 18 + s * 10} 256 ${x + 6 + s * 3} 250 Z`, shoe));
    legs.push(`<path d="M${x - 11 + s * 3} 264 L${x + 15 + s * 10} 264" stroke="${shade(shoe, -.25)}" stroke-width="3" stroke-linecap="round"/>`);
  });

  /* ---------- Bras ---------- */
  const sleeve = topStyle === 'tee' ? topC2 : topC;
  const arm = (side, pose) => {
    const sx = side < 0 ? 68 : 132, out = [];
    let pts;
    if (pose === 'wave' && side > 0) pts = [[sx, 160], [150, 136], [156, 108]];
    else if (pose === 'hips') pts = [[sx, 160], [sx + side * 20, 184], [sx + side * 4, 206]];
    else pts = [[sx, 160], [sx + side * 10, 186], [sx + side * 8, 208]];
    if (topStyle === 'tee') { out.push(limb(pts, skin, 8)); out.push(limb([pts[0], [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2]], sleeve, 10)); }
    else out.push(limb(pts, sleeve, 9));
    const [hx, hy] = pts[pts.length - 1];
    out.push(`<circle cx="${hx}" cy="${hy}" r="9" fill="${skin}" ${ink()}/>`);
    if (pose === 'wave' && side > 0) out.push(`<path d="M${hx - 12} ${hy - 12} q-4 -6 0 -10 M${hx + 12} ${hy - 12} q4 -6 0 -10" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
    return out.join('');
  };

  /* ---------- Buste ---------- */
  const torsoD = 'M62 170 Q62 150 84 147 L116 147 Q138 150 138 170 L134 216 Q100 224 66 216 Z';
  const body = [];
  if (topStyle === 'hoodie') body.push(P('M70 156 Q100 132 130 156 Q128 168 100 164 Q72 168 70 156 Z', shade(topC, -.1)));
  body.push(P(torsoD, topC));
  const T = [];
  if (topStyle === 'sweater') { for (let y = 158; y < 222; y += 8) T.push(`<path d="M60 ${y} q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0" stroke="#000" stroke-width="1.2" fill="none" opacity=".13"/>`); T.push(`<rect x="60" y="208" width="80" height="12" fill="${shade(topC, -.12)}"/>`); }
  if (topStyle === 'sequin') for (let y = 154; y < 222; y += 9) for (let x = 58 + (y % 18 ? 4 : 0); x < 142; x += 9) T.push(`<circle cx="${x}" cy="${y}" r="2.4" fill="#fff" opacity=".5"/>`);
  if (topStyle === 'stripes') for (let y = 156; y < 222; y += 12) T.push(`<rect x="56" y="${y}" width="88" height="6" fill="#FFFFFF"/>`);
  if (topStyle === 'hoodie') { T.push(`<rect x="80" y="186" width="40" height="18" rx="7" fill="${shade(topC, -.12)}" ${ink(2.5)}/>`); }
  if (topStyle === 'space') { T.push(`<rect x="78" y="176" width="44" height="22" rx="7" fill="#CBD5E1" ${ink(2.5)}/><circle cx="90" cy="187" r="4" fill="${topC2}"/><circle cx="100" cy="187" r="4" fill="#22D3EE"/><circle cx="110" cy="187" r="4" fill="#FBBF24"/>`); }
  if (topStyle === 'jacket' || topStyle === 'suit') T.push(P('M88 148 L100 218 L112 148 Z', topC2, 2.5));
  // Ombre latérale du buste
  T.push(`<ellipse cx="146" cy="196" rx="30" ry="50" fill="#000" opacity=".12"/>`);
  body.push(`<g clip-path="url(#${u}t)">${T.join('')}</g>`);
  if (topStyle === 'jacket' || topStyle === 'suit') {
    body.push(P('M86 148 L78 176 L92 172 L98 214 Z', topD, 2.5) + P('M114 148 L122 176 L108 172 L102 214 Z', topD, 2.5));
    if (topStyle === 'suit') body.push(P('M100 154 L95 168 L100 196 L105 168 Z', shade(topC2, -.45), 2));
  }
  if (topStyle === 'hoodie') body.push(`<path d="M93 158 L91 180 M107 158 L109 180" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="91" cy="182" r="2.6" fill="#fff"/><circle cx="109" cy="182" r="2.6" fill="#fff"/>`);
  if (topStyle === 'tee' || topStyle === 'sweater' || topStyle === 'stripes') body.push(`<path d="M86 149 Q100 160 114 149" stroke="${topStyle === 'tee' ? topC2 : shade(topC, -.15)}" stroke-width="5" fill="none" stroke-linecap="round"/>`);

  /* ---------- Accessoires de cou ---------- */
  const neckA = [];
  if (acc.neck) {
    const c = acc.neck.color, d = shade(c, -.25);
    const t = acc.neck.type;
    if (t === 'chain') neckA.push(`<path d="M84 150 Q100 184 116 150" fill="none" stroke="${INK}" stroke-width="6"/><path d="M84 150 Q100 184 116 150" fill="none" stroke="${c}" stroke-width="3.5" stroke-dasharray="4 2"/><circle cx="100" cy="176" r="7" fill="${c}" ${ink(2.5)}/>`);
    if (t === 'bowtie') neckA.push(P('M100 152 L84 144 L84 160 Z', c, 2.5) + P('M100 152 L116 144 L116 160 Z', c, 2.5) + `<circle cx="100" cy="152" r="4.5" fill="${d}" ${ink(2.5)}/>`);
    if (t === 'scarf') neckA.push(P('M76 146 Q100 160 124 146 L126 158 Q100 172 74 158 Z', c) + P('M108 158 L118 158 L120 194 L108 196 Z', d));
    if (t === 'bandana') neckA.push(P('M78 148 Q100 158 122 148 L100 178 Z', c) + `<circle cx="96" cy="156" r="2" fill="#fff"/><circle cx="106" cy="158" r="2" fill="#fff"/><circle cx="101" cy="166" r="2" fill="#fff"/>`);
    if (t === 'medal') neckA.push(`<path d="M88 148 L100 172 L112 148" fill="none" stroke="${INK}" stroke-width="7"/><path d="M88 148 L100 172 L112 148" fill="none" stroke="${c}" stroke-width="4"/><circle cx="100" cy="180" r="10" fill="#1d1233" stroke="#FBBF24" stroke-width="3"/><circle cx="100" cy="180" r="3.5" fill="${c}"/>`);
  }

  /* ---------- Tête ---------- */
  const back = [], H = [];
  // Cheveux derrière la tête
  if (hairStyle === 'long') back.push(P('M40 92 Q34 36 100 30 Q166 36 160 92 L166 190 Q150 202 138 190 L136 136 L64 136 L62 190 Q50 202 34 190 Z', hairC));
  if (hairStyle === 'bob') back.push(P('M38 100 Q30 34 100 30 Q170 34 162 100 Q166 142 146 150 L54 150 Q34 142 38 100 Z', hairC));
  if (hairStyle === 'afro') back.push(`<circle cx="100" cy="80" r="78" fill="${hairC}" ${ink()}/>`);
  if (hairStyle === 'curls') [[46, 70], [54, 46], [74, 30], [100, 24], [126, 30], [146, 46], [154, 70], [44, 96], [156, 96], [48, 120], [152, 120]].forEach(([x, y], i) => back.push(`<circle cx="${x}" cy="${y}" r="${17 + (i % 2) * 3}" fill="${i % 3 ? hairC : hD}" ${ink(3)}/>`));
  if (hairStyle === 'bun') back.push(`<circle cx="100" cy="30" r="20" fill="${hairC}" ${ink()}/>`);
  if (hairStyle === 'buns') [[52, 50, -35, '#F97316'], [76, 30, -14, '#EC4899'], [124, 30, 14, '#6D8BD8'], [148, 50, 35, '#EC4899'], [40, 80, -60, '#F97316'], [160, 80, 60, '#6D8BD8']].forEach(([x, y, r, b]) => back.push(`<g transform="rotate(${r} ${x} ${y + 14})">${P(`M${x - 9} ${y + 16} Q${x - 6} ${y - 10} ${x} ${y - 14} Q${x + 6} ${y - 10} ${x + 9} ${y + 16} Z`, hairC, 3)}<circle cx="${x}" cy="${y + 16}" r="7" fill="${b}" ${ink(2.5)}/></g>`));
  if (acc.head?.type === 'halo') back.push(`<ellipse cx="100" cy="14" rx="42" ry="10" fill="none" stroke="${acc.head.color}" stroke-width="14" opacity=".25"/><ellipse cx="100" cy="14" rx="42" ry="10" fill="none" stroke="${INK}" stroke-width="9"/><ellipse cx="100" cy="14" rx="42" ry="10" fill="none" stroke="${acc.head.color}" stroke-width="5"/>`);
  // Cou, oreilles, visage
  H.push(`<rect x="90" y="134" width="20" height="18" rx="6" fill="${skinD}" ${ink(3)}/>`);
  H.push(`<ellipse cx="41" cy="98" rx="11" ry="13" fill="${skin}" ${ink()}/><ellipse cx="159" cy="98" rx="11" ry="13" fill="${skin}" ${ink()}/>`);
  H.push(`<ellipse cx="100" cy="92" rx="60" ry="56" fill="${skin}" ${ink()}/>`);
  H.push(`<g clip-path="url(#${u}h)"><ellipse cx="142" cy="120" rx="36" ry="40" fill="#000" opacity=".07"/><ellipse cx="74" cy="60" rx="24" ry="12" fill="#fff" opacity=".22"/></g>`);
  H.push(`<ellipse cx="70" cy="114" rx="10" ry="6" fill="#F4727A" opacity=".45"/><ellipse cx="130" cy="114" rx="10" ry="6" fill="#F4727A" opacity=".45"/>`);
  // Yeux
  const eyeO = (x, big) => `<ellipse cx="${x}" cy="100" rx="${big ? 8.5 : 7}" ry="${big ? 10.5 : 9}" fill="${INK}"/><circle cx="${x + 2.4}" cy="96.5" r="${big ? 3.4 : 2.8}" fill="#fff"/><circle cx="${x - 2.2}" cy="104" r="1.2" fill="#fff" opacity=".8"/>`;
  const eyeC = (x, up) => up ? `<path d="M${x - 9} 103 Q${x} 92 ${x + 9} 103" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>` : `<path d="M${x - 9} 98 Q${x} 106 ${x + 9} 98" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  let eyes;
  if (mood === 'grin') eyes = eyeC(80, true) + eyeC(120, true);
  else if (mood === 'sad') eyes = eyeC(80, false) + eyeC(120, false);
  else if (mood === 'wink') eyes = eyeO(80) + eyeC(120, true);
  else if (mood === 'smirk') eyes = eyeO(80) + eyeO(120) + `<path d="M71 95 L89 95 M111 95 L129 95" stroke="${skin}" stroke-width="7"/><path d="M71 97 L89 97 M111 97 L129 97" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  else eyes = eyeO(80, mood === 'wow') + eyeO(120, mood === 'wow');
  const eyeAcc = acc.eyes && ['shades', 'visor', 'stars', 'hearts'].includes(acc.eyes.type);
  const robot = acc.head?.type === 'robot';
  if (!eyeAcc && !robot) H.push(`<g class="ch-eyes">${eyes}</g>`);
  // Sourcils
  const bc = hairStyle === 'none' ? '#3B2A20' : shade(hairC, -.1);
  const by = { wow: -6, sad: 0, grin: -2 }[mood] || 0;
  const brow = mood === 'sad' ? ['M71 86 Q80 83 89 88', 'M111 88 Q120 83 129 86'] : [`M71 ${86 + by} Q80 ${80 + by} 89 ${84 + by}`, `M111 ${84 + by} Q120 ${80 + by} 129 ${86 + by}`];
  if (!robot) H.push(`<path d="${brow[0]}" stroke="${bc}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${brow[1]}" stroke="${bc}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  // Nez + bouche
  if (!robot) {
    H.push(`<ellipse cx="100" cy="110" rx="4.5" ry="3.2" fill="${shade(skin, -.2)}"/>`);
    const mouth = {
      happy: `<path d="M89 119 Q100 130 111 119" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      wink: `<path d="M89 119 Q100 131 111 119" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      smirk: `<path d="M91 123 Q104 128 113 118" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      sad: `<path d="M90 127 Q100 119 110 127" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      grin: `${P('M85 117 Q100 140 115 117 Z', '#8B1E2B', 3)}<path d="M88 118.5 L112 118.5" stroke="#fff" stroke-width="4"/><ellipse cx="100" cy="130" rx="6" ry="3" fill="#F16B7C"/>`,
      wow: `<ellipse cx="100" cy="124" rx="7" ry="9" fill="#8B1E2B" ${ink(3)}/>`,
      talk: `<ellipse cx="100" cy="123" rx="9" ry="7" fill="#8B1E2B" ${ink(3)}/><ellipse cx="100" cy="126" rx="5" ry="2.4" fill="#F16B7C"/>`,
    };
    H.push(`<g class="ch-mouth">${mouth[mood] || mouth.happy}</g>`);
    if (sk.extra === 'moustache') H.push(P('M84 116 Q92 108 100 114 Q108 108 116 116 Q108 121 100 117 Q92 121 84 116 Z', shade(hairC, -.05), 2.5));
  }
  // Cheveux devant
  const F = [];
  if (hairStyle === 'swept') F.push(P('M42 96 Q36 40 100 34 Q164 40 158 96 Q150 64 124 60 Q132 48 116 42 Q112 62 86 60 Q56 62 42 96 Z', hairC));
  if (hairStyle === 'short') F.push(P('M44 88 Q42 36 100 34 Q158 36 156 88 Q142 58 100 58 Q58 58 44 88 Z', hairC));
  if (hairStyle === 'long' || hairStyle === 'bob') F.push(P('M40 104 Q34 36 100 32 Q166 36 160 104 Q154 70 132 62 Q100 80 68 62 Q46 70 40 104 Z', hairC));
  if (hairStyle === 'mohawk') { F.push(P('M50 80 Q54 44 100 38 Q146 44 150 80 Q128 60 100 60 Q72 60 50 80 Z', hD)); F.push(P('M84 56 L88 14 L96 40 L102 4 L108 40 L116 16 L118 56 Q100 48 84 56 Z', hairC)); }
  if (hairStyle === 'curls' || hairStyle === 'afro') [[60, 54], [80, 42], [100, 38], [120, 42], [140, 54]].forEach(([x, y], i) => F.push(`<circle cx="${x}" cy="${y}" r="${style15(hairStyle)}" fill="${i % 2 ? hairC : hD}" ${ink(3)}/>`));
  if (hairStyle === 'bun' || hairStyle === 'buns') F.push(P('M44 88 Q42 36 100 34 Q158 36 156 88 Q142 58 100 58 Q58 58 44 88 Z', hairC));
  if (hairStyle !== 'none' && hairStyle !== 'mohawk') F.push(`<path d="M62 52 Q78 42 96 42" stroke="${hL}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`);
  H.push(F.join(''));

  // Coiffes
  const HA = [];
  if (acc.head) {
    const c = acc.head.color, d = shade(c, -.2), l = shade(c, .35), t = acc.head.type;
    if (t === 'beanie') { HA.push(P('M38 88 Q34 20 100 18 Q166 20 162 88 Z', c)); for (let x = 50; x < 156; x += 10) HA.push(`<path d="M${x} 40 L${x} 80" stroke="#000" stroke-width="1.4" opacity=".12"/>`); HA.push(`<rect x="34" y="72" width="132" height="22" rx="11" fill="${d}" ${ink()}/><circle cx="100" cy="14" r="13" fill="${l}" ${ink()}/>`); }
    if (t === 'cap') HA.push(P('M42 84 Q40 26 100 24 Q160 26 158 84 Z', c) + P('M122 80 Q170 72 186 86 Q164 98 124 92 Z', d) + `<circle cx="100" cy="24" r="6" fill="${l}" ${ink(2.5)}/>`);
    if (t === 'bob') HA.push(P('M52 76 Q52 28 100 28 Q148 28 148 76 Z', c) + P('M26 82 Q100 58 174 82 L178 96 Q100 74 22 96 Z', d));
    if (t === 'beret') HA.push(`<ellipse cx="94" cy="42" rx="66" ry="20" fill="${c}" ${ink()} transform="rotate(-8 94 42)"/><rect x="90" y="16" width="7" height="12" rx="3" fill="${c}" ${ink(2.5)}/>`);
    if (t === 'fedora') HA.push(`<ellipse cx="100" cy="60" rx="82" ry="13" fill="${d}" ${ink()}/>` + P('M60 60 L64 22 Q100 8 136 22 L140 60 Z', c) + `<rect x="61" y="46" width="78" height="9" fill="#F5F5F4" ${ink(2.5)}/>`);
    if (t === 'crown') HA.push(P('M56 44 L60 6 L80 26 L100 -2 L120 26 L140 6 L144 44 Z', c) + `<circle cx="100" cy="26" r="5" fill="#EF4444" ${ink(2)}/><circle cx="74" cy="36" r="3.5" fill="#38BDF8" ${ink(2)}/><circle cx="126" cy="36" r="3.5" fill="#38BDF8" ${ink(2)}/>`);
    if (t === 'helmet') HA.push(`<circle cx="100" cy="92" r="80" fill="${c}" opacity=".32" ${ink(4)}/><path d="M50 50 Q64 26 92 20" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/><rect x="58" y="164" width="84" height="14" rx="7" fill="#CBD5E1" ${ink(3)}/>`);
    if (t === 'robot') HA.push(`<ellipse cx="100" cy="90" rx="66" ry="62" fill="${c}" ${ink()}/><rect x="52" y="80" width="96" height="30" rx="15" fill="${INK}"/><rect x="60" y="92" width="80" height="6" rx="3" fill="#F43F5E"/><path d="M60 50 Q72 34 94 30" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>`);
  }
  // Lunettes
  if (acc.eyes && !robot) {
    const c = acc.eyes.color, d = shade(c, -.3), t = acc.eyes.type;
    if (t === 'shades') HA.push(`<rect x="62" y="89" width="36" height="22" rx="9" fill="${c}" ${ink(3)}/><rect x="102" y="89" width="36" height="22" rx="9" fill="${c}" ${ink(3)}/><path d="M98 96 L102 96" stroke="${INK}" stroke-width="4"/><path d="M68 94 L78 94 M108 94 L118 94" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`);
    if (t === 'round') HA.push(`<circle cx="80" cy="100" r="15" fill="rgba(255,255,255,.18)" stroke="${c}" stroke-width="4.5"/><circle cx="120" cy="100" r="15" fill="rgba(255,255,255,.18)" stroke="${c}" stroke-width="4.5"/><path d="M95 100 L105 100" stroke="${c}" stroke-width="4"/>`);
    if (t === 'hearts') { const h = x => P(`M${x} 114 C${x - 22} 100 ${x - 16} 82 ${x} 92 C${x + 16} 82 ${x + 22} 100 ${x} 114 Z`, c, 3); HA.push(h(80) + h(120) + `<path d="M96 98 L104 98" stroke="${INK}" stroke-width="4"/>`); }
    if (t === 'stars') { const st = cx => { let p = ''; for (let k = 0; k < 10; k++) { const an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 8 : 18; p += `${k ? 'L' : 'M'}${(cx + Math.cos(an) * rr).toFixed(1)} ${(100 + Math.sin(an) * rr).toFixed(1)} `; } return P(p + 'Z', c, 3); }; HA.push(st(80) + st(120)); }
    if (t === 'visor') HA.push(`<rect x="50" y="86" width="100" height="26" rx="13" fill="${c}" ${ink()} opacity=".95"/><rect x="62" y="91" width="40" height="5" rx="2.5" fill="#fff" opacity=".75"/>`);
  }
  // Casque audio
  if (acc.ears) {
    const c = acc.ears.color;
    if (acc.ears.glow) HA.push(`<circle cx="38" cy="98" r="26" fill="${c}" opacity=".22"/><circle cx="162" cy="98" r="26" fill="${c}" opacity=".22"/>`);
    HA.push(`<path d="M40 96 Q34 16 100 14 Q166 16 160 96" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M40 96 Q34 16 100 14 Q166 16 160 96" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`);
    HA.push(`<rect x="24" y="78" width="26" height="42" rx="13" fill="${c}" ${ink()}/><rect x="150" y="78" width="26" height="42" rx="13" fill="${c}" ${ink()}/><rect x="30" y="86" width="5" height="24" rx="2.5" fill="#fff" opacity=".45"/>`);
  }

  const headG = `<g class="ch-head">${back.join('')}${H.join('')}${HA.join('')}</g>`;
  const armsBack = arm(-1, arms), armsFront = arm(1, arms);
  const bodyG = `<g class="ch-body">${legs.join('')}${body.join('')}${neckA.join('')}${armsBack}${armsFront}</g>`;
  const label = `role="img" aria-label="${(sk.name || '').replace(/"/g, '')}"`;
  const NS = 'xmlns="http://www.w3.org/2000/svg"';

  if (opts.head) return `<svg class="char char-head" viewBox="14 -10 172 172" ${NS} ${label}><defs>${defs}</defs>${headG}</svg>`;
  if (opts.lying) {
    // Allongé sur le dos, la tête posée sur l'accoudoir gauche
    return `<svg class="char char-lying" viewBox="36 4 268 236" ${NS} ${label}><defs>${defs}</defs>
      <g transform="translate(150 160) rotate(-90) translate(-100 -150)">${bodyG}</g>
      <g transform="translate(150 160) rotate(-90) translate(-100 -150) rotate(62 100 148)">${headG}</g></svg>`;
  }
  return `<svg class="char char-full" viewBox="0 -8 200 286" ${NS} ${label}><defs>${defs}</defs>${bodyG}${headG}</svg>`;
}
function style15(s) { return s === 'afro' ? 20 : 15; }

// Rendu en <img> mis en cache : le navigateur rastérise une seule fois.
const imgCache = new Map();
function html(sk, opts = {}) {
  const a = opts.accs || {};
  const key = JSON.stringify([sk.id || sk, opts.mood || 'happy', opts.head ? 1 : opts.lying ? 2 : 0, Object.keys(a).sort().map(k => a[k] && (a[k].id || a[k].type + a[k].color))]);
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
