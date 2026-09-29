/* ============================================
   Pompelup — personnage (le skin EST l'avatar)
   Style « avatar 3D » : grosse tête, yeux brillants à iris,
   sourcils expressifs, peau douce éclairée, volumes en dégradés.
   ============================================ */
(() => {
'use strict';

// Tenues. rarity/price/unlock sont lus par la boutique et les succès.
// eyes = couleur d'iris ; acc/phones/extra = accessoires fournis avec la tenue.
const SKINS = [
  { id: 'rookie', name: 'Le Débutant', rarity: 'common', price: 0, desc: 'Hoodie orange, casque violet : le style Pompelup.',
    skin: '#F5C7A1', eyes: '#6B4226', hair: ['tuft', '#5B3A29'], top: ['hoodie', '#F97316'], phones: '#6D28D9' },
  { id: 'crate', name: 'Crate Digger', rarity: 'common', price: 0, desc: 'Toujours à fouiller les bacs des disquaires.',
    skin: '#E0A57E', eyes: '#3F6212', hair: ['tuft', '#2B1B12'], top: ['jacket', '#4D7C0F', '#FDE68A'], acc: ['beanie', '#F59E0B'] },
  { id: 'disco', name: 'Disco Fever', rarity: 'rare', price: 450, desc: 'Paillettes, afro et lunettes étoiles.',
    skin: '#B97A55', eyes: '#4A2511', hair: ['afro', '#1F140E'], top: ['sequin', '#EC4899'], acc: ['stars', '#FBBF24'] },
  { id: 'rocker', name: 'Rockeur', rarity: 'rare', price: 450, desc: 'Crête rouge et perfecto noir.',
    skin: '#F2C6A6', eyes: '#1E3A8A', hair: ['mohawk', '#DC2626'], top: ['jacket', '#1F2937', '#E5E7EB'], acc: ['shades', '#111827'] },
  { id: 'mc', name: 'MC Flow', rarity: 'rare', price: 500, desc: 'Casquette à l’envers et chaîne en or.',
    skin: '#8D5A3B', eyes: '#3B1F0E', hair: ['none'], top: ['hoodie', '#7C3AED'], acc: ['cap', '#111827'], extra: 'chain' },
  { id: 'kpop', name: 'Idol K-Pop', rarity: 'epic', price: 800, desc: 'Carré rose pastel et veste de scène.',
    skin: '#F6D2B8', eyes: '#7C3AED', hair: ['bob', '#F9A8D4'], top: ['jacket', '#F8FAFC', '#C084FC'], phones: '#C084FC' },
  { id: 'chanson', name: 'Chanson française', rarity: 'epic', price: 800, desc: 'Béret, marinière et moustache.',
    skin: '#F2C6A6', eyes: '#1E40AF', hair: ['tuft', '#3B2A20'], top: ['stripes', '#1E3A8A'], acc: ['beret', '#111827'], extra: 'moustache' },
  { id: 'seventies', name: 'Rétro 70s', rarity: 'epic', price: 850, desc: 'Cheveux longs, costume moutarde.',
    skin: '#D9A07A', eyes: '#78350F', hair: ['long', '#7C4A21'], top: ['suit', '#B45309', '#FDE68A'], acc: ['round', '#78350F'] },
  { id: 'neon', name: 'Néon Rider', rarity: 'epic', unlock: true, desc: 'Visière néon, vitesse lumière.',
    skin: '#E8B089', eyes: '#0E7490', hair: ['mohawk', '#22D3EE'], top: ['jacket', '#120a24', '#EC4899'], acc: ['visor', '#22D3EE'] },
  { id: 'dj', name: 'DJ de minuit', rarity: 'epic', unlock: true, desc: 'Le casque qui brille dans le noir.',
    skin: '#C68863', eyes: '#0E7490', hair: ['bun', '#111827'], top: ['hoodie', '#111827'], phones: '#22D3EE', glow: '#22D3EE' },
  { id: 'astro', name: 'Funk astronaute', rarity: 'legendary', unlock: true, desc: 'En orbite autour de la platine.',
    skin: '#F5C7A1', eyes: '#1D4ED8', hair: ['tuft', '#5B3A29'], top: ['space', '#F1F5F9', '#F97316'], acc: ['helmet', '#BAE6FD'] },
  { id: 'gold', name: 'Disque d’or', rarity: 'legendary', unlock: true, desc: 'Costume en or, couronne et casque doré.',
    skin: '#F2C6A6', eyes: '#92400E', hair: ['tuft', '#2B1B12'], top: ['suit', '#FBBF24', '#78350F'], acc: ['crown', '#FBBF24'], phones: '#FBBF24', glow: '#FBBF24' },
];

// Accessoires : un par emplacement (tête, yeux, oreilles, cou). Achetables et à gagner dans les boosters.
const ACCESSORIES = [
  { id: 'cap-red', slot: 'head', type: 'cap', color: '#DC2626', name: 'Casquette rouge', rarity: 'common', price: 150 },
  { id: 'beanie', slot: 'head', type: 'beanie', color: '#F59E0B', name: 'Bonnet moutarde', rarity: 'common', price: 150 },
  { id: 'bob', slot: 'head', type: 'bob', color: '#86EFAC', name: 'Bob de festival', rarity: 'rare', price: 300 },
  { id: 'beret', slot: 'head', type: 'beret', color: '#111827', name: 'Béret parisien', rarity: 'rare', price: 300 },
  { id: 'fedora', slot: 'head', type: 'fedora', color: '#1F2937', name: 'Fedora du crooner', rarity: 'epic', price: 650 },
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
const HEAD_TYPES = ['beanie', 'cap', 'beret', 'crown', 'fedora', 'helmet', 'robot', 'bob', 'halo'];
const EYE_TYPES = ['shades', 'round', 'stars', 'visor', 'hearts'];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

let uid = 0;
// opts : mood (happy | wow | sad | wink | talk), bust (cadrage buste), head (tête seule), accs ({ head, eyes, ears, neck } → accessoire)
function svg(sk, opts = {}) {
  const u = `ch${++uid}`, mood = opts.mood || 'happy', accs = opts.accs || {};
  const [topStyle, topC, topC2 = '#FFFFFF'] = sk.top;
  const [hairStyle, hairC = '#000'] = sk.hair;
  // Emplacements effectifs : l'accessoire équipé remplace celui de la tenue.
  const skinAcc = sk.acc || [];
  let head = HEAD_TYPES.includes(skinAcc[0]) ? { type: skinAcc[0], color: skinAcc[1] } : null;
  let eyesAcc = EYE_TYPES.includes(skinAcc[0]) ? { type: skinAcc[0], color: skinAcc[1] } : null;
  let ears = sk.phones ? { type: 'phones', color: sk.phones, glow: !!sk.glow } : null;
  let neck = sk.extra === 'chain' ? { type: 'chain', color: '#FBBF24' } : null;
  if (accs.head) head = accs.head;
  if (accs.eyes) eyesAcc = accs.eyes;
  if (accs.ears) ears = accs.ears;
  if (accs.neck) neck = accs.neck;
  const skin = sk.skin, iris = sk.eyes || '#5B3A29';
  const hc = head?.color || '#111827', ec = eyesAcc?.color || '#111827';
  const g = (id, a, b, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `<linearGradient id="${u}${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const rg = (id, stops, cx = .36, cy = .3, r = .75) => `<radialGradient id="${u}${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`).join('')}</radialGradient>`;
  const defs = [
    rg('skin', [[0, shade(skin, .3)], [.55, skin], [1, shade(skin, -.2)]]),
    rg('iris', [[0, shade(iris, .45)], [.7, iris], [1, shade(iris, -.45)]], .4, .35, .7),
    rg('blush', [[0, '#FB7185', .45], [1, '#FB7185', 0]], .5, .5, .5),
    rg('ao', [[.6, '#000', 0], [1, '#3b1d10', .22]], .5, .38, .62),
    g('top', shade(topC, .22), shade(topC, -.32)),
    g('top2', shade(topC2, .12), shade(topC2, -.22)),
    g('hair', shade(hairC, .3), shade(hairC, -.35), 0, 0, 0, 1),
    g('acc', shade(hc, .3), shade(hc, -.32), 0, 0, 0, 1),
    ears ? g('ph', shade(ears.color, .35), shade(ears.color, -.32), 0, 0, 0, 1) : '',
    `<linearGradient id="${u}sclera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7E2EF"/><stop offset=".35" stop-color="#fff"/></linearGradient>`,
    `<pattern id="${u}sq" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.7" fill="#fff" opacity=".45"/></pattern>`,
    `<pattern id="${u}st" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="5" fill="#fff"/></pattern>`,
  ].join('');

  /* ---------- Corps (coordonnées « buste » : centre x=80, épaules y≈115) ---------- */
  const B = [];
  if (sk.glow || ears?.glow) B.push(`<circle cx="80" cy="96" r="70" fill="${sk.glow || ears.color}" opacity=".14"/>`);
  B.push(`<g fill="url(#${u}top)"><rect x="27" y="128" width="19" height="48" rx="9.5" transform="rotate(10 36 130)"/><rect x="114" y="128" width="19" height="48" rx="9.5" transform="rotate(-10 124 130)"/></g>`);
  B.push(`<g fill="${shade(skin, -.02)}"><circle cx="33" cy="176" r="9"/><circle cx="127" cy="176" r="9"/></g>`);
  B.push(`<rect x="70" y="104" width="20" height="22" rx="7" fill="${shade(skin, -.16)}"/>`);
  const torso = 'M42 190 Q39 142 56 126 Q80 115 104 126 Q121 142 118 190 Z';
  B.push(`<path d="${torso}" fill="url(#${u}top)"/>`);
  if (topStyle === 'sequin') B.push(`<path d="${torso}" fill="url(#${u}sq)"/>`);
  if (topStyle === 'stripes') B.push(`<path d="${torso}" fill="url(#${u}st)" opacity=".9"/>`);
  if (topStyle === 'hoodie') B.push(`<path d="M58 124 Q80 140 102 124" fill="none" stroke="${shade(topC, -.35)}" stroke-width="5" stroke-linecap="round"/><path d="M72 134 L70 152 M88 134 L90 152" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><rect x="60" y="160" width="40" height="18" rx="7" fill="${shade(topC, -.18)}"/>`);
  if (topStyle === 'jacket' || topStyle === 'suit') B.push(`<path d="M70 124 L80 190 L90 124 Q80 128 70 124 Z" fill="url(#${u}top2)"/><path d="M68 124 L78 150 M92 124 L82 150" stroke="${shade(topC, -.45)}" stroke-width="3" stroke-linecap="round"/>`);
  if (topStyle === 'suit') B.push(`<path d="M80 130 L75 152 L80 160 L85 152 Z" fill="${shade(topC2, -.35)}"/>`);
  if (topStyle === 'space') B.push(`<rect x="58" y="148" width="44" height="24" rx="8" fill="#CBD5E1"/><circle cx="70" cy="160" r="4" fill="${topC2}"/><circle cx="82" cy="160" r="4" fill="#22D3EE"/><circle cx="94" cy="160" r="4" fill="#FBBF24"/><path d="M50 132 Q80 146 110 132" fill="none" stroke="${topC2}" stroke-width="6"/>`);
  // Plis et reflet de tissu
  B.push(`<path d="M50 150 Q54 134 66 128" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".28"/><path d="M104 168 Q108 178 106 188" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".12"/>`);
  // Ombre portée de la tête sur le buste
  B.push(`<ellipse cx="80" cy="124" rx="26" ry="6" fill="#000" opacity=".12"/>`);
  if (neck) {
    const c = neck.color;
    if (neck.type === 'chain') B.push(`<path d="M62 128 Q80 158 98 128" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="4 2"/><circle cx="80" cy="150" r="7" fill="${c}" stroke="${shade(c, -.4)}" stroke-width="2"/>`);
    if (neck.type === 'bowtie') B.push(`<path d="M80 128 L66 121 Q63 128 66 135 Z M80 128 L94 121 Q97 128 94 135 Z" fill="${c}" stroke="${shade(c, -.35)}" stroke-width="1.5"/><circle cx="80" cy="128" r="4" fill="${shade(c, -.2)}"/>`);
    if (neck.type === 'scarf') B.push(`<path d="M56 124 Q80 138 104 124 Q106 132 102 136 Q80 146 58 136 Q54 132 56 124 Z" fill="${c}"/><rect x="88" y="132" width="12" height="30" rx="5" fill="${shade(c, -.15)}" transform="rotate(-8 94 132)"/><path d="M58 128 Q80 140 102 128" stroke="#fff" stroke-width="2" fill="none" opacity=".3"/>`);
    if (neck.type === 'bandana') B.push(`<path d="M58 124 Q80 136 102 124 L80 150 Z" fill="${c}"/><circle cx="72" cy="132" r="1.8" fill="#fff"/><circle cx="84" cy="136" r="1.8" fill="#fff"/><circle cx="90" cy="128" r="1.8" fill="#fff"/>`);
    if (neck.type === 'medal') B.push(`<path d="M68 124 L80 146 L92 124" fill="none" stroke="${c}" stroke-width="4"/><circle cx="80" cy="152" r="10" fill="#1d1233" stroke="#FBBF24" stroke-width="2"/><circle cx="80" cy="152" r="3.5" fill="${c}"/>`);
  }

  /* ---------- Tête (coordonnées d'origine : centre 80,76, r 44) ---------- */
  const H = [];
  if (hairStyle === 'afro') H.push(`<circle cx="80" cy="70" r="56" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'long') H.push(`<path d="M34 72 Q30 128 44 150 L116 150 Q130 128 126 72 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'bob') H.push(`<path d="M32 76 Q30 118 46 124 L114 124 Q130 118 128 76 Z" fill="url(#${u}hair)"/>`);
  if (head?.type === 'halo') H.push(`<ellipse cx="80" cy="18" rx="30" ry="8" fill="none" stroke="${hc}" stroke-width="5" opacity=".95"/><ellipse cx="80" cy="18" rx="30" ry="8" fill="none" stroke="${hc}" stroke-width="12" opacity=".25"/>`);
  // Oreilles avec creux
  H.push(`<g><ellipse cx="36" cy="82" rx="9" ry="11" fill="url(#${u}skin)"/><ellipse cx="37" cy="82" rx="4" ry="6" fill="${shade(skin, -.2)}" opacity=".6"/><ellipse cx="124" cy="82" rx="9" ry="11" fill="url(#${u}skin)"/><ellipse cx="123" cy="82" rx="4" ry="6" fill="${shade(skin, -.2)}" opacity=".6"/></g>`);
  // Visage : volume, occlusion, liseré de lumière
  H.push(`<ellipse cx="80" cy="78" rx="45" ry="43" fill="url(#${u}skin)"/>`);
  H.push(`<ellipse cx="80" cy="78" rx="45" ry="43" fill="url(#${u}ao)"/>`);
  H.push(`<path d="M116 56 Q126 78 116 102" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".22"/>`);
  H.push(`<ellipse cx="57" cy="94" rx="10" ry="7" fill="url(#${u}blush)"/><ellipse cx="103" cy="94" rx="10" ry="7" fill="url(#${u}blush)"/>`);
  // Yeux à iris brillant
  const bigEye = (x, closed) => closed
    ? `<path d="M${x - 7} 81 Q${x} 76 ${x + 7} 81" stroke="#2A1810" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="${x}" cy="80" rx="8" ry="${mood === 'wow' ? 10 : 9}" fill="url(#${u}sclera)"/>
       <circle cx="${x + .5}" cy="81" r="5.8" fill="url(#${u}iris)"/><circle cx="${x + .5}" cy="81" r="2.8" fill="#140c1c"/>
       <circle cx="${x + 2.6}" cy="78" r="2" fill="#fff"/><circle cx="${x - 1.8}" cy="83.6" r=".9" fill="#fff" opacity=".85"/>
       <path d="M${x - 8.5} 77 Q${x} 69 ${x + 8.5} 77" stroke="#2A1810" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  let eyesSvg;
  if (mood === 'sad') eyesSvg = bigEye(64, true) + bigEye(96, true);
  else if (mood === 'wink') eyesSvg = bigEye(64) + bigEye(96, true);
  else eyesSvg = bigEye(64) + bigEye(96);
  // Sourcils expressifs
  const bc = shade(hairStyle === 'none' ? '#2A1810' : hairC, -.15);
  const brow = { happy: ['M55 66 Q63 61 71 64', 'M89 64 Q97 61 105 66'], talk: ['M55 65 Q63 60 71 63', 'M89 63 Q97 60 105 65'], wow: ['M55 61 Q63 55 71 59', 'M89 59 Q97 55 105 61'], sad: ['M56 64 Q64 62 71 67', 'M89 67 Q96 62 104 64'], wink: ['M55 66 Q63 61 71 64', 'M89 67 Q97 65 105 67'] }[mood] || [];
  const hideEyes = eyesAcc && ['shades', 'visor', 'stars', 'hearts'].includes(eyesAcc.type) || head?.type === 'robot';
  if (!hideEyes) H.push(`<g class="ch-eyes">${eyesSvg}</g>`);
  if (head?.type !== 'robot') H.push(`<path d="${brow[0]}" stroke="${bc}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="${brow[1]}" stroke="${bc}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
  // Nez
  H.push(`<ellipse cx="80" cy="90" rx="4.2" ry="3.2" fill="${shade(skin, -.14)}"/><circle cx="78.6" cy="89" r="1.2" fill="#fff" opacity=".45"/>`);
  // Bouche
  const mouth = {
    happy: `<path d="M69 97 Q80 110 91 97 Q80 101 69 97 Z" fill="#7F1D1D"/><path d="M71 97.5 Q80 100.5 89 97.5 L88 99.5 Q80 101.5 72 99.5 Z" fill="#fff"/><ellipse cx="80" cy="104" rx="5" ry="2.4" fill="#F87171"/>`,
    talk: `<ellipse cx="80" cy="101" rx="7" ry="6" fill="#7F1D1D"/><ellipse cx="80" cy="104" rx="4.5" ry="2.2" fill="#F87171"/>`,
    wink: `<path d="M70 98 Q80 107 90 98" fill="none" stroke="#7F1D1D" stroke-width="3" stroke-linecap="round"/>`,
    wow: `<ellipse cx="80" cy="102" rx="6" ry="7.5" fill="#7F1D1D"/><ellipse cx="80" cy="106" rx="4" ry="2" fill="#F87171"/>`,
    sad: `<path d="M71 104 Q80 96 89 104" fill="none" stroke="#7F1D1D" stroke-width="3" stroke-linecap="round"/>`,
  };
  if (head?.type !== 'robot') H.push(`<g class="ch-mouth">${mouth[mood] || mouth.happy}</g>`);
  if (sk.extra === 'moustache') H.push(`<path d="M66 95 Q73 89 80 94 Q87 89 94 95 Q88 99 80 96 Q72 99 66 95 Z" fill="${shade(hairC, -.1)}"/>`);
  // Cheveux devant + mèches de lumière
  if (hairStyle === 'tuft') H.push(`<path d="M38 70 Q40 34 80 32 Q120 34 122 70 Q108 52 88 54 Q96 44 86 40 Q84 52 64 50 Q48 54 38 70 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'afro') H.push(`<path d="M40 66 Q44 36 80 34 Q116 36 120 66 Q100 50 80 52 Q60 50 40 66 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'mohawk') H.push(`<path d="M66 44 L70 10 L78 36 L82 4 L88 36 L96 12 L96 44 Q80 38 66 44 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'bob' || hairStyle === 'long') H.push(`<path d="M36 76 Q36 32 80 30 Q124 32 124 76 Q118 58 102 52 Q80 62 58 52 Q42 58 36 76 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle === 'bun') H.push(`<circle cx="80" cy="26" r="13" fill="url(#${u}hair)"/><path d="M38 70 Q40 34 80 32 Q120 34 122 70 Q100 50 80 52 Q60 50 38 70 Z" fill="url(#${u}hair)"/>`);
  if (hairStyle !== 'none') H.push(`<path d="M52 44 Q64 36 78 36" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".3"/>`);
  // Reflet spéculaire du front
  H.push(`<ellipse cx="96" cy="58" rx="9" ry="5" fill="#fff" opacity=".22" transform="rotate(20 96 58)"/>`);
  // Coiffes
  if (head) {
    const t = head.type;
    if (t === 'beanie') H.push(`<path d="M36 66 Q36 26 80 24 Q124 26 124 66 Z" fill="url(#${u}acc)"/><rect x="33" y="58" width="94" height="14" rx="7" fill="${shade(hc, -.2)}"/><circle cx="80" cy="20" r="9" fill="${shade(hc, .35)}"/>`);
    if (t === 'cap') H.push(`<path d="M38 64 Q38 28 80 28 Q122 28 122 64 Z" fill="url(#${u}acc)"/><path d="M102 60 Q136 56 146 66 Q130 72 104 68 Z" fill="${shade(hc, -.25)}"/><circle cx="80" cy="30" r="4" fill="${shade(hc, .4)}"/>`);
    if (t === 'beret') H.push(`<ellipse cx="74" cy="38" rx="44" ry="15" fill="url(#${u}acc)" transform="rotate(-8 74 38)"/><rect x="72" y="18" width="5" height="10" rx="2" fill="${hc}"/>`);
    if (t === 'crown') H.push(`<path d="M52 36 L56 12 L68 26 L80 6 L92 26 L104 12 L108 36 Z" fill="url(#${u}acc)" stroke="${shade(hc, -.45)}" stroke-width="2"/><circle cx="80" cy="22" r="3.5" fill="#EF4444"/>`);
    if (t === 'fedora') H.push(`<ellipse cx="80" cy="44" rx="56" ry="10" fill="${shade(hc, -.2)}"/><path d="M50 44 Q50 14 80 14 Q110 14 110 44 Z" fill="url(#${u}acc)"/><rect x="50" y="34" width="60" height="7" fill="#fff" opacity=".85"/>`);
    if (t === 'bob') H.push(`<path d="M34 58 Q80 44 126 58 L134 70 Q80 58 26 70 Z" fill="${shade(hc, -.15)}"/><path d="M42 60 Q42 24 80 24 Q118 24 118 60 Z" fill="url(#${u}acc)"/><path d="M44 52 Q80 42 116 52" stroke="#fff" stroke-width="2" fill="none" opacity=".4"/>`);
    if (t === 'robot') H.push(`<rect x="32" y="28" width="96" height="88" rx="42" fill="url(#${u}acc)" stroke="${shade(hc, -.35)}" stroke-width="3"/><rect x="42" y="66" width="76" height="20" rx="10" fill="#111827"/><rect x="48" y="70" width="64" height="4" rx="2" fill="#F43F5E" opacity=".9"/><path d="M46 48 Q56 36 72 34" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`);
    if (t === 'helmet') H.push(`<circle cx="80" cy="76" r="56" fill="${hc}" opacity=".22" stroke="#E2E8F0" stroke-width="5"/><path d="M44 50 Q52 32 72 26" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/><rect x="50" y="122" width="60" height="10" rx="5" fill="#CBD5E1"/>`);
  }
  // Lunettes
  if (eyesAcc) {
    const t = eyesAcc.type;
    if (t === 'shades') H.push(`<g fill="${ec}"><rect x="50" y="72" width="26" height="16" rx="6"/><rect x="84" y="72" width="26" height="16" rx="6"/><rect x="74" y="76" width="12" height="4" rx="2"/></g><path d="M55 76 L63 76 M89 76 L97 76" stroke="#fff" stroke-width="2.5" opacity=".55" stroke-linecap="round"/>`);
    if (t === 'round') H.push(`<g fill="rgba(255,255,255,.15)" stroke="${ec}" stroke-width="3"><circle cx="64" cy="80" r="11"/><circle cx="96" cy="80" r="11"/></g><path d="M75 80 L85 80" stroke="${ec}" stroke-width="3"/>`);
    if (t === 'stars') { const star = (cx, cy) => `<path d="M${cx} ${cy - 13} L${cx + 4} ${cy - 4} L${cx + 13} ${cy - 3} L${cx + 6} ${cy + 3} L${cx + 8} ${cy + 12} L${cx} ${cy + 7} L${cx - 8} ${cy + 12} L${cx - 6} ${cy + 3} L${cx - 13} ${cy - 3} L${cx - 4} ${cy - 4} Z" fill="${ec}" stroke="${shade(ec, -.4)}" stroke-width="1.5"/>`; H.push(star(63, 81) + star(97, 81) + `<rect x="74" y="78" width="12" height="3" rx="1.5" fill="${shade(ec, -.4)}"/>`); }
    if (t === 'hearts') { const heart = (cx, cy) => `<path d="M${cx} ${cy + 10} C${cx - 16} ${cy} ${cx - 12} ${cy - 12} ${cx} ${cy - 5} C${cx + 12} ${cy - 12} ${cx + 16} ${cy} ${cx} ${cy + 10} Z" fill="${ec}" stroke="${shade(ec, -.35)}" stroke-width="1.5"/>`; H.push(heart(64, 80) + heart(96, 80) + `<rect x="74" y="77" width="12" height="3" rx="1.5" fill="${shade(ec, -.35)}"/><circle cx="59" cy="76" r="2" fill="#fff" opacity=".6"/><circle cx="91" cy="76" r="2" fill="#fff" opacity=".6"/>`); }
    if (t === 'visor') H.push(`<rect x="44" y="70" width="72" height="18" rx="9" fill="${ec}" opacity=".9"/><rect x="50" y="73" width="30" height="4" rx="2" fill="#fff" opacity=".7"/>`);
  }
  // Casque audio
  if (ears) {
    const glow = ears.glow ? `<rect x="24" y="66" width="20" height="32" rx="9" fill="none" stroke="${ears.color}" stroke-width="2" opacity=".9"/><rect x="116" y="66" width="20" height="32" rx="9" fill="none" stroke="${ears.color}" stroke-width="2" opacity=".9"/>` : '';
    H.push(`<path d="M34 78 Q34 26 80 26 Q126 26 126 78" fill="none" stroke="url(#${u}ph)" stroke-width="8" stroke-linecap="round"/><rect x="24" y="66" width="20" height="32" rx="9" fill="url(#${u}ph)"/><rect x="116" y="66" width="20" height="32" rx="9" fill="url(#${u}ph)"/><rect x="28" y="72" width="5" height="18" rx="2.5" fill="#fff" opacity=".35"/>${glow}`);
  }

  // Tête agrandie (look « avatar 3D ») posée sur le buste
  const headG = `<g class="ch-head" transform="translate(80 78) scale(1.18) translate(-80 -80)">${H.join('')}</g>`;
  const shadow = opts.bust || opts.head ? '' : `<ellipse cx="80" cy="193" rx="44" ry="7" fill="rgba(27,16,38,.2)"/>`;
  const vb = opts.head ? '8 4 144 144' : opts.bust ? '0 -16 160 180' : '0 -14 160 214';
  return `<svg class="char${opts.head ? ' char-head' : ''}${opts.bust ? ' char-bust' : ''}" viewBox="${vb}" role="img" aria-label="${sk.name || ''}"><defs>${defs}</defs>${shadow}<g class="ch-body"><g class="ch-torso">${B.join('')}</g>${headG}</g></svg>`;
}

window.PompeChar = {
  SKINS, ACCESSORIES, SLOTS, svg,
  byId: id => SKINS.find(s => s.id === id) || SKINS[0],
  accById: id => ACCESSORIES.find(a => a.id === id),
};
})();
