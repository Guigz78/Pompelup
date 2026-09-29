/* ============================================
   Pompelup — personnage (le skin EST l'avatar)
   Personnage « jouet » en SVG : dégradés et reflets pour le volume.
   ============================================ */
(() => {
'use strict';

// Tenues. rarity/price/unlock sont lus par la boutique et les succès.
const SKINS = [
  { id: 'rookie', name: 'Le Débutant', rarity: 'common', price: 0, desc: 'Hoodie orange, casque violet : le style Pompelup.',
    skin: '#F5C7A1', hair: ['tuft', '#5B3A29'], top: ['hoodie', '#F97316'], phones: '#6D28D9' },
  { id: 'crate', name: 'Crate Digger', rarity: 'common', price: 0, desc: 'Toujours à fouiller les bacs des disquaires.',
    skin: '#E0A57E', hair: ['tuft', '#2B1B12'], top: ['jacket', '#4D7C0F', '#FDE68A'], acc: ['beanie', '#F59E0B'] },
  { id: 'disco', name: 'Disco Fever', rarity: 'rare', price: 450, desc: 'Paillettes, afro et lunettes étoiles.',
    skin: '#B97A55', hair: ['afro', '#1F140E'], top: ['sequin', '#EC4899'], acc: ['stars', '#FBBF24'] },
  { id: 'rocker', name: 'Rockeur', rarity: 'rare', price: 450, desc: 'Crête rouge et perfecto noir.',
    skin: '#F2C6A6', hair: ['mohawk', '#DC2626'], top: ['jacket', '#1F2937', '#E5E7EB'], acc: ['shades', '#111827'] },
  { id: 'mc', name: 'MC Flow', rarity: 'rare', price: 500, desc: 'Casquette à l’envers et chaîne en or.',
    skin: '#8D5A3B', hair: ['none'], top: ['hoodie', '#7C3AED'], acc: ['cap', '#111827'], extra: 'chain' },
  { id: 'kpop', name: 'Idol K-Pop', rarity: 'epic', price: 800, desc: 'Carré rose pastel et veste de scène.',
    skin: '#F6D2B8', hair: ['bob', '#F9A8D4'], top: ['jacket', '#F8FAFC', '#C084FC'], phones: '#C084FC' },
  { id: 'chanson', name: 'Chanson française', rarity: 'epic', price: 800, desc: 'Béret, marinière et moustache.',
    skin: '#F2C6A6', hair: ['tuft', '#3B2A20'], top: ['stripes', '#1E3A8A'], acc: ['beret', '#111827'], extra: 'moustache' },
  { id: 'seventies', name: 'Rétro 70s', rarity: 'epic', price: 850, desc: 'Cheveux longs, costume moutarde.',
    skin: '#D9A07A', hair: ['long', '#7C4A21'], top: ['suit', '#B45309', '#FDE68A'], acc: ['round', '#78350F'] },
  { id: 'neon', name: 'Néon Rider', rarity: 'epic', unlock: true, desc: 'Visière néon, vitesse lumière.',
    skin: '#E8B089', hair: ['mohawk', '#22D3EE'], top: ['jacket', '#120a24', '#EC4899'], acc: ['visor', '#22D3EE'] },
  { id: 'dj', name: 'DJ de minuit', rarity: 'epic', unlock: true, desc: 'Le casque qui brille dans le noir.',
    skin: '#C68863', hair: ['bun', '#111827'], top: ['hoodie', '#111827'], phones: '#22D3EE', glow: '#22D3EE' },
  { id: 'astro', name: 'Funk astronaute', rarity: 'legendary', unlock: true, desc: 'En orbite autour de la platine.',
    skin: '#F5C7A1', hair: ['tuft', '#5B3A29'], top: ['space', '#F1F5F9', '#F97316'], acc: ['helmet', '#BAE6FD'] },
  { id: 'gold', name: 'Disque d’or', rarity: 'legendary', unlock: true, desc: 'Costume en or, couronne et casque doré.',
    skin: '#F2C6A6', hair: ['tuft', '#2B1B12'], top: ['suit', '#FBBF24', '#78350F'], acc: ['crown', '#FBBF24'], phones: '#FBBF24', glow: '#FBBF24' },
];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

let uid = 0;
// mood : happy | wow | sad | wink
function svg(sk, opts = {}) {
  const u = `ch${++uid}`, mood = opts.mood || 'happy';
  const [topStyle, topC, topC2 = '#FFFFFF'] = sk.top;
  const [hairStyle, hairC = '#000'] = sk.hair;
  const [acc, accC = '#111827'] = sk.acc || [];
  const skin = sk.skin;
  const g = (id, a, b, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `<linearGradient id="${u}${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const rg = (id, a, b) => `<radialGradient id="${u}${id}" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  const defs = [
    rg('skin', shade(skin, .25), shade(skin, -.12)),
    g('top', shade(topC, .18), shade(topC, -.28)),
    g('top2', shade(topC2, .12), shade(topC2, -.2)),
    g('hair', shade(hairC, .22), shade(hairC, -.3), 0, 0, 0, 1),
    g('acc', shade(accC, .28), shade(accC, -.3), 0, 0, 0, 1),
    sk.phones ? g('ph', shade(sk.phones, .3), shade(sk.phones, -.3), 0, 0, 0, 1) : '',
    `<pattern id="${u}sq" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.7" fill="#fff" opacity=".45"/></pattern>`,
    `<pattern id="${u}st" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="5" fill="#fff"/></pattern>`,
  ].join('');
  const P = [];
  // Ombre au sol
  P.push(`<ellipse cx="80" cy="193" rx="44" ry="7" fill="rgba(27,16,38,.2)"/>`);
  if (sk.glow) P.push(`<circle cx="80" cy="100" r="78" fill="${sk.glow}" opacity=".16"/>`);
  // Cheveux derrière la tête
  if (hairStyle === 'afro') P.push(`<circle cx="80" cy="70" r="56" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'long') P.push(`<path d="M34 72 Q30 128 44 150 L116 150 Q130 128 126 72 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'bob') P.push(`<path d="M32 76 Q30 118 46 124 L114 124 Q130 118 128 76 Z" fill="url(#${u}hair)"/>`);
  // Bras
  P.push(`<g fill="url(#${u}top)"><rect x="27" y="128" width="19" height="48" rx="9.5" transform="rotate(10 36 130)"/><rect x="114" y="128" width="19" height="48" rx="9.5" transform="rotate(-10 124 130)"/></g>`);
  P.push(`<g fill="url(#${u}skin)"><circle cx="33" cy="176" r="9"/><circle cx="127" cy="176" r="9"/></g>`);
  // Buste
  P.push(`<path d="M42 190 Q39 142 56 126 Q80 115 104 126 Q121 142 118 190 Z" fill="url(#${u}top)"/>`);
  if (topStyle === 'sequin') P.push(`<path d="M42 190 Q39 142 56 126 Q80 115 104 126 Q121 142 118 190 Z" fill="url(#${u}sq)"/>`);
  if (topStyle === 'stripes') P.push(`<path d="M42 190 Q39 142 56 126 Q80 115 104 126 Q121 142 118 190 Z" fill="url(#${u}st)" opacity=".9"/>`);
  if (topStyle === 'hoodie') P.push(`<path d="M58 124 Q80 140 102 124" fill="none" stroke="${shade(topC, -.35)}" stroke-width="5" stroke-linecap="round"/><path d="M72 134 L70 152 M88 134 L90 152" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><rect x="60" y="160" width="40" height="18" rx="7" fill="${shade(topC, -.18)}"/>`);
  if (topStyle === 'jacket' || topStyle === 'suit') P.push(`<path d="M70 124 L80 190 L90 124 Q80 128 70 124 Z" fill="url(#${u}top2)"/><path d="M68 124 L78 150 M92 124 L82 150" stroke="${shade(topC, -.45)}" stroke-width="3" stroke-linecap="round"/>`);
  if (topStyle === 'suit') P.push(`<path d="M80 130 L75 152 L80 160 L85 152 Z" fill="${shade(topC2, -.35)}"/>`);
  if (topStyle === 'space') P.push(`<rect x="58" y="148" width="44" height="24" rx="8" fill="#CBD5E1"/><circle cx="70" cy="160" r="4" fill="${topC2}"/><circle cx="82" cy="160" r="4" fill="#22D3EE"/><circle cx="94" cy="160" r="4" fill="#FBBF24"/><path d="M50 132 Q80 146 110 132" fill="none" stroke="${topC2}" stroke-width="6"/>`);
  if (sk.extra === 'chain') P.push(`<path d="M62 128 Q80 158 98 128" fill="none" stroke="#FBBF24" stroke-width="4" stroke-dasharray="4 2"/><circle cx="80" cy="150" r="7" fill="#FBBF24" stroke="#B45309" stroke-width="2"/>`);
  // Reflet du buste
  P.push(`<path d="M50 150 Q54 134 66 128" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".25"/>`);
  // Cou + tête
  P.push(`<rect x="70" y="108" width="20" height="18" rx="6" fill="${shade(skin, -.14)}"/>`);
  P.push(`<circle cx="36" cy="80" r="9" fill="url(#${u}skin)"/><circle cx="124" cy="80" r="9" fill="url(#${u}skin)"/>`);
  P.push(`<circle cx="80" cy="76" r="44" fill="url(#${u}skin)"/>`);
  // Joues
  P.push(`<ellipse cx="56" cy="92" rx="8" ry="5" fill="#FB7185" opacity=".35"/><ellipse cx="104" cy="92" rx="8" ry="5" fill="#FB7185" opacity=".35"/>`);
  // Yeux
  const eye = x => mood === 'sad'
    ? `<path d="M${x - 6} 80 Q${x} 76 ${x + 6} 80" stroke="#1B1026" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="${x}" cy="80" rx="${mood === 'wow' ? 6.5 : 5.5}" ry="${mood === 'wow' ? 8 : 7}" fill="#1B1026"/><circle cx="${x + 2}" cy="77" r="2.2" fill="#fff"/>`;
  const eyes = mood === 'wink'
    ? `${eye(64)}<path d="M90 80 Q96 75 102 80" stroke="#1B1026" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : `${eye(64)}${eye(96)}`;
  if (!['shades', 'visor', 'stars', 'robot'].includes(acc)) P.push(`<g class="ch-eyes">${eyes}</g>`);
  // Bouche
  const mouth = { happy: '<path d="M70 97 Q80 108 90 97" fill="#7F1D1D" stroke="#1B1026" stroke-width="2.5" stroke-linejoin="round"/>', wink: '<path d="M70 97 Q80 108 90 97" fill="#7F1D1D" stroke="#1B1026" stroke-width="2.5"/>', wow: '<ellipse cx="80" cy="101" rx="6" ry="7.5" fill="#7F1D1D" stroke="#1B1026" stroke-width="2.5"/>', sad: '<path d="M71 103 Q80 95 89 103" fill="none" stroke="#1B1026" stroke-width="3" stroke-linecap="round"/>' };
  P.push(mouth[mood] || mouth.happy);
  if (sk.extra === 'moustache') P.push(`<path d="M66 94 Q73 88 80 93 Q87 88 94 94 Q88 98 80 95 Q72 98 66 94 Z" fill="${shade(hairC, -.1)}"/>`);
  // Cheveux devant
  if (hairStyle === 'tuft') P.push(`<path d="M38 70 Q40 34 80 32 Q120 34 122 70 Q108 52 88 54 Q96 44 86 40 Q84 52 64 50 Q48 54 38 70 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'afro') P.push(`<path d="M40 66 Q44 36 80 34 Q116 36 120 66 Q100 50 80 52 Q60 50 40 66 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'mohawk') P.push(`<path d="M66 44 L70 10 L78 36 L82 4 L88 36 L96 12 L96 44 Q80 38 66 44 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'bob' || hairStyle === 'long') P.push(`<path d="M36 76 Q36 32 80 30 Q124 32 124 76 Q118 58 102 52 Q80 62 58 52 Q42 58 36 76 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'bun') P.push(`<circle cx="80" cy="26" r="13" fill="url(#${u}hair)"/><path d="M38 70 Q40 34 80 32 Q120 34 122 70 Q100 50 80 52 Q60 50 38 70 Z" fill="url(#${u}hair)"/>`);
  // Reflet de la tête (effet jouet verni)
  P.push(`<ellipse cx="62" cy="52" rx="12" ry="7" fill="#fff" opacity=".28" transform="rotate(-25 62 52)"/>`);
  // Accessoires
  if (acc === 'beanie') P.push(`<path d="M36 66 Q36 26 80 24 Q124 26 124 66 Z" fill="url(#${u}acc)"/><rect x="33" y="58" width="94" height="14" rx="7" fill="${shade(accC, -.2)}"/><circle cx="80" cy="20" r="9" fill="${shade(accC, .35)}"/>`);
  if (acc === 'cap') P.push(`<path d="M38 64 Q38 28 80 28 Q122 28 122 64 Z" fill="url(#${u}acc)"/><path d="M102 60 Q136 56 146 66 Q130 72 104 68 Z" fill="${shade(accC, -.25)}"/><circle cx="80" cy="30" r="4" fill="${shade(accC, .4)}"/>`);
  if (acc === 'beret') P.push(`<ellipse cx="74" cy="38" rx="44" ry="15" fill="url(#${u}acc)" transform="rotate(-8 74 38)"/><rect x="72" y="18" width="5" height="10" rx="2" fill="${accC}"/>`);
  if (acc === 'crown') P.push(`<path d="M52 36 L56 12 L68 26 L80 6 L92 26 L104 12 L108 36 Z" fill="url(#${u}acc)" stroke="#B45309" stroke-width="2"/><circle cx="80" cy="22" r="3.5" fill="#EF4444"/>`);
  if (acc === 'fedora') P.push(`<ellipse cx="80" cy="44" rx="56" ry="10" fill="${shade(accC, -.2)}"/><path d="M50 44 Q50 14 80 14 Q110 14 110 44 Z" fill="url(#${u}acc)"/><rect x="50" y="34" width="60" height="7" fill="#fff" opacity=".85"/>`);
  if (acc === 'robot') P.push(`<rect x="32" y="28" width="96" height="88" rx="42" fill="url(#${u}acc)" stroke="${shade(accC, -.35)}" stroke-width="3"/><rect x="42" y="66" width="76" height="20" rx="10" fill="#111827"/><rect x="48" y="70" width="64" height="4" rx="2" fill="#F43F5E" opacity=".9"/><path d="M46 48 Q56 36 72 34" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`);
  if (acc === 'shades') P.push(`<g fill="${accC}"><rect x="50" y="72" width="26" height="16" rx="6"/><rect x="84" y="72" width="26" height="16" rx="6"/><rect x="74" y="76" width="12" height="4" rx="2"/></g><path d="M55 76 L63 76" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>`);
  if (acc === 'round') P.push(`<g fill="none" stroke="${accC}" stroke-width="3"><circle cx="64" cy="80" r="11"/><circle cx="96" cy="80" r="11"/><path d="M75 80 L85 80"/></g>`);
  if (acc === 'stars') { const star = (cx, cy) => `<path d="M${cx} ${cy - 13} L${cx + 4} ${cy - 4} L${cx + 13} ${cy - 3} L${cx + 6} ${cy + 3} L${cx + 8} ${cy + 12} L${cx} ${cy + 7} L${cx - 8} ${cy + 12} L${cx - 6} ${cy + 3} L${cx - 13} ${cy - 3} L${cx - 4} ${cy - 4} Z" fill="${accC}" stroke="#B45309" stroke-width="1.5"/>`; P.push(star(63, 81) + star(97, 81) + `<rect x="74" y="78" width="12" height="3" rx="1.5" fill="#B45309"/>`); }
  if (acc === 'visor') P.push(`<rect x="44" y="70" width="72" height="18" rx="9" fill="${accC}" opacity=".9"/><rect x="50" y="73" width="30" height="4" rx="2" fill="#fff" opacity=".7"/>`);
  if (acc === 'helmet') P.push(`<circle cx="80" cy="76" r="56" fill="${accC}" opacity=".22" stroke="#E2E8F0" stroke-width="5"/><path d="M44 50 Q52 32 72 26" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/><rect x="50" y="122" width="60" height="10" rx="5" fill="#CBD5E1"/>`);
  // Casque audio
  if (sk.phones) P.push(`<path d="M34 78 Q34 26 80 26 Q126 26 126 78" fill="none" stroke="url(#${u}ph)" stroke-width="8" stroke-linecap="round"/><rect x="24" y="66" width="20" height="32" rx="9" fill="url(#${u}ph)"/><rect x="116" y="66" width="20" height="32" rx="9" fill="url(#${u}ph)"/><rect x="28" y="72" width="5" height="18" rx="2.5" fill="#fff" opacity=".35"/>${sk.glow ? `<rect x="24" y="66" width="20" height="32" rx="9" fill="none" stroke="${sk.glow}" stroke-width="2" opacity=".9"/><rect x="116" y="66" width="20" height="32" rx="9" fill="none" stroke="${sk.glow}" stroke-width="2" opacity=".9"/>` : ''}`);
  const vb = opts.head ? '22 4 116 116' : '0 0 160 200';
  return `<svg class="char${opts.head ? ' char-head' : ''}" viewBox="${vb}" role="img" aria-label="${sk.name}"><defs>${defs}</defs><g class="ch-body">${P.join('')}</g></svg>`;
}

window.PompeChar = { SKINS, svg, byId: id => SKINS.find(s => s.id === id) || SKINS[0] };
})();
