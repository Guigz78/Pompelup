/* ============================================
   Pompelup — personnage (le skin EST l'avatar)
   Style « avatar 3D en pâte » : buste, tête ovale, nez rond, yeux sombres
   brillants, sourcils épais. Le volume vient d'un filtre d'éclairage SVG
   (lumière diffuse + spéculaire) appliqué à chaque pièce.
   ============================================ */
(() => {
'use strict';

// hair : [style, couleur] · top : [style, couleur, couleur secondaire] · eyes : couleur d'iris
const SKINS = [
  { id: 'rookie', name: 'Le Débutant', rarity: 'common', price: 0, desc: 'Hoodie orange, casque violet : le style Pompelup.',
    skin: '#F2C4A8', eyes: '#3B2417', hair: ['swept', '#6B3F26'], top: ['hoodie', '#F97316'], phones: '#6D28D9' },
  { id: 'crate', name: 'Crate Digger', rarity: 'common', price: 0, desc: 'Bonnet, cheveux longs et pull en maille.',
    skin: '#F4CDB6', eyes: '#2A1A12', hair: ['long', '#E8621F'], top: ['sweater', '#6FAE6A'], acc: ['beanie', '#8E6BB0'] },
  { id: 'disco', name: 'Disco Fever', rarity: 'rare', price: 450, desc: 'Boucles roses et t-shirt pop.',
    skin: '#D9A07A', eyes: '#2A1A12', hair: ['curls', '#E99A9A'], top: ['tee', '#F5F5F4', '#EC4899'] },
  { id: 'rocker', name: 'Rockeur', rarity: 'rare', price: 450, desc: 'Crête rouge et perfecto noir.',
    skin: '#F2C4A8', eyes: '#1E2A44', hair: ['mohawk', '#DC2626'], top: ['jacket', '#1F2937', '#E5E7EB'], acc: ['shades', '#111827'] },
  { id: 'mc', name: 'MC Flow', rarity: 'rare', price: 500, desc: 'Casquette et chaîne en or.',
    skin: '#9C6446', eyes: '#1A0F0A', hair: ['short', '#1A1210'], top: ['hoodie', '#7C3AED'], acc: ['cap', '#111827'], extra: 'chain' },
  { id: 'buns', name: 'Space Buns', rarity: 'rare', price: 500, desc: 'Petits chignons à perles colorées.',
    skin: '#EBC0A5', eyes: '#1A0F0A', hair: ['buns', '#7A4A2E'], top: ['tee', '#DDD6FE', '#6D28D9'] },
  { id: 'kpop', name: 'Idol K-Pop', rarity: 'epic', price: 800, desc: 'Carré pastel et veste de scène.',
    skin: '#F6D2BD', eyes: '#2A1A12', hair: ['bob', '#F9A8D4'], top: ['jacket', '#F8FAFC', '#C084FC'], phones: '#C084FC' },
  { id: 'chanson', name: 'Chanson française', rarity: 'epic', price: 800, desc: 'Béret, marinière et moustache.',
    skin: '#F2C4A8', eyes: '#1E2A44', hair: ['short', '#3B2A20'], top: ['stripes', '#1E3A8A'], acc: ['beret', '#111827'], extra: 'moustache' },
  { id: 'seventies', name: 'Rétro 70s', rarity: 'epic', price: 850, desc: 'Cheveux longs et costume moutarde.',
    skin: '#D9A07A', eyes: '#3B2417', hair: ['long', '#7C4A21'], top: ['suit', '#B45309', '#FDE68A'], acc: ['round', '#78350F'] },
  { id: 'neon', name: 'Néon Rider', rarity: 'epic', unlock: true, desc: 'Visière néon, vitesse lumière.',
    skin: '#E8B394', eyes: '#0E3A4A', hair: ['mohawk', '#22D3EE'], top: ['jacket', '#1E1638', '#EC4899'], acc: ['visor', '#22D3EE'] },
  { id: 'dj', name: 'DJ de minuit', rarity: 'epic', unlock: true, desc: 'Le casque qui brille dans le noir.',
    skin: '#C98E6B', eyes: '#1A0F0A', hair: ['bun', '#1A1210'], top: ['hoodie', '#1F2937'], phones: '#22D3EE', glow: '#22D3EE' },
  { id: 'astro', name: 'Funk astronaute', rarity: 'legendary', unlock: true, desc: 'En orbite autour de la platine.',
    skin: '#F2C4A8', eyes: '#1E2A44', hair: ['swept', '#6B3F26'], top: ['space', '#F1F5F9', '#F97316'], acc: ['helmet', '#BAE6FD'] },
  { id: 'gold', name: 'Disque d’or', rarity: 'legendary', unlock: true, desc: 'Costume doré, couronne et casque en or.',
    skin: '#E8B394', eyes: '#3B2417', hair: ['swept', '#2B1B12'], top: ['suit', '#E8B230', '#78350F'], acc: ['crown', '#FBBF24'], phones: '#FBBF24', glow: '#FBBF24' },
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
const HEAD_TYPES = ['beanie', 'cap', 'beret', 'crown', 'fedora', 'helmet', 'robot', 'bob', 'halo'];
const EYE_TYPES = ['shades', 'round', 'stars', 'visor', 'hearts'];

function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function shade(c, amt) {
  const f = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return `#${hex(c).map(f).map(v => v.toString(16).padStart(2, '0')).join('')}`;
}
function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

let uid = 0;
/* opts : mood (happy | grin | smirk | wow | sad | wink | talk), head (tête seule),
   full (plan large pour le salon), accs ({ head, eyes, ears, neck } → accessoire) */
function svg(sk, opts = {}) {
  const u = `ch${++uid}`, mood = opts.mood || 'happy', accs = opts.accs || {};
  const [topStyle, topC, topC2 = '#FFFFFF'] = sk.top;
  const [hairStyle, hairC = '#000'] = sk.hair;
  const skinAcc = sk.acc || [];
  let head = HEAD_TYPES.includes(skinAcc[0]) ? { type: skinAcc[0], color: skinAcc[1] } : null;
  let eyesAcc = EYE_TYPES.includes(skinAcc[0]) ? { type: skinAcc[0], color: skinAcc[1] } : null;
  let ears = sk.phones ? { type: 'phones', color: sk.phones, glow: !!sk.glow } : null;
  let neck = sk.extra === 'chain' ? { type: 'chain', color: '#FBBF24' } : null;
  if (accs.head) head = accs.head;
  if (accs.eyes) eyesAcc = accs.eyes;
  if (accs.ears) ears = accs.ears;
  if (accs.neck) neck = accs.neck;
  const skin = sk.skin, iris = sk.eyes || '#2A1A12';
  const nose = mix(skin, '#E0706A', .32), lip = mix(skin, '#B5474A', .5);
  const hc = head?.color || '#111827', ec = eyesAcc?.color || '#111827';
  const clay = `filter="url(#${u}c)"`, soft = `filter="url(#${u}s)"`;

  const defs = `
    <filter id="${u}c" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b"/>
      <feDiffuseLighting in="b" surfaceScale="3.2" diffuseConstant="1.2" lighting-color="#fff" result="d"><feDistantLight azimuth="230" elevation="52"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.05" result="lit"/>
      <feSpecularLighting in="b" surfaceScale="3.2" specularConstant=".42" specularExponent="16" lighting-color="#fff" result="sp"><feDistantLight azimuth="230" elevation="58"/></feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi"/>
      <feComposite in="lit" in2="spi" operator="arithmetic" k2="1" k3=".35" result="o"/>
      <feComposite in="o" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="${u}s" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/>
      <feDiffuseLighting in="b" surfaceScale="3" diffuseConstant="1.1" lighting-color="#fff" result="d"><feDistantLight azimuth="230" elevation="55"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.06" result="lit"/>
      <feSpecularLighting in="b" surfaceScale="3" specularConstant=".7" specularExponent="22" lighting-color="#fff" result="sp"><feDistantLight azimuth="230" elevation="60"/></feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi"/>
      <feComposite in="lit" in2="spi" operator="arithmetic" k2="1" k3=".45" result="o"/>
      <feComposite in="o" in2="SourceAlpha" operator="in"/>
    </filter>
    <radialGradient id="${u}bl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F08A8A" stop-opacity=".55"/><stop offset="1" stop-color="#F08A8A" stop-opacity="0"/></radialGradient>
    <radialGradient id="${u}neckao" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#3b1d10" stop-opacity=".38"/><stop offset="1" stop-color="#3b1d10" stop-opacity="0"/></radialGradient>
    <pattern id="${u}knit" width="6" height="7" patternUnits="userSpaceOnUse"><path d="M0 0 Q1.5 3.5 3 7 M3 0 Q4.5 3.5 6 7 M3 0 Q1.5 3.5 0 7 M6 0 Q4.5 3.5 3 7" stroke="#000" stroke-width=".7" fill="none" opacity=".16"/></pattern>
    <pattern id="${u}sq" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.8" fill="#fff" opacity=".5"/></pattern>
    <pattern id="${u}st" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="6" fill="#fff"/></pattern>`;

  const P = [];
  const glowC = sk.glow || (ears?.glow && ears.color);
  if (glowC) P.push(`<circle cx="100" cy="110" r="96" fill="${glowC}" opacity=".16"/>`);

  /* --- Cheveux derrière --- */
  if (hairStyle === 'long') P.push(`<path d="M50 96 Q44 60 62 42 Q100 18 138 42 Q156 60 150 96 L154 176 Q140 186 128 176 L126 120 L74 120 L72 176 Q60 186 46 176 Z" fill="${hairC}" ${clay}/>`);
  if (hairStyle === 'bob') P.push(`<path d="M50 100 Q42 56 70 40 Q100 26 130 40 Q158 56 150 100 Q152 132 138 140 L62 140 Q48 132 50 100 Z" fill="${hairC}" ${clay}/>`);
  if (hairStyle === 'curls' || hairStyle === 'afro') {
    const pts = [[62, 54], [80, 40], [100, 34], [120, 40], [138, 54], [148, 74], [150, 96], [54, 74], [50, 96], [52, 116], [148, 116], [70, 44], [130, 44], [90, 36], [110, 36]];
    P.push(`<g fill="${hairC}" ${clay}>${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${hairStyle === 'afro' ? 22 : 15 + (i % 3) * 2}"/>`).join('')}</g>`);
  }
  if (head?.type === 'halo') P.push(`<ellipse cx="100" cy="24" rx="38" ry="9" fill="none" stroke="${hc}" stroke-width="6" ${soft}/><ellipse cx="100" cy="24" rx="38" ry="9" fill="none" stroke="${hc}" stroke-width="16" opacity=".25"/>`);

  /* --- Buste --- */
  const torso = 'M18 222 Q16 176 52 162 Q76 154 100 154 Q124 154 148 162 Q184 176 182 222 Z';
  if (topStyle === 'hoodie') P.push(`<path d="M60 150 Q100 132 140 150 Q148 164 140 172 Q100 160 60 172 Q52 164 60 150 Z" fill="${shade(topC, -.12)}" ${clay}/>`);
  P.push(`<path d="${torso}" fill="${topC}" ${clay}/>`);
  if (topStyle === 'sweater') P.push(`<path d="${torso}" fill="url(#${u}knit)"/><path d="M76 158 Q100 170 124 158" stroke="${shade(topC, -.18)}" stroke-width="7" fill="none" stroke-linecap="round" ${soft}/>`);
  if (topStyle === 'tee') P.push(`<path d="M18 222 Q16 184 44 168 L58 164 L64 222 Z" fill="${topC2}" ${clay}/><path d="M182 222 Q184 184 156 168 L142 164 L136 222 Z" fill="${topC2}" ${clay}/><path d="M76 158 Q100 172 124 158" stroke="${topC2}" stroke-width="6" fill="none" stroke-linecap="round" ${soft}/>`);
  if (topStyle === 'sequin') P.push(`<path d="${torso}" fill="url(#${u}sq)"/>`);
  if (topStyle === 'stripes') P.push(`<path d="${torso}" fill="url(#${u}st)" opacity=".92"/>`);
  if (topStyle === 'hoodie') P.push(`<path d="M88 166 L86 196 M112 166 L114 196" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".9"/><circle cx="86" cy="197" r="3" fill="#fff"/><circle cx="114" cy="197" r="3" fill="#fff"/>`);
  if (topStyle === 'jacket' || topStyle === 'suit') P.push(`<path d="M84 156 L100 222 L116 156 Q100 162 84 156 Z" fill="${topC2}" ${soft}/><path d="M80 156 L94 200 M120 156 L106 200" stroke="${shade(topC, -.4)}" stroke-width="4" stroke-linecap="round"/>`);
  if (topStyle === 'suit') P.push(`<path d="M100 164 L94 190 L100 200 L106 190 Z" fill="${shade(topC2, -.4)}" ${soft}/>`);
  if (topStyle === 'space') P.push(`<rect x="70" y="186" width="60" height="30" rx="10" fill="#CBD5E1" ${soft}/><circle cx="86" cy="201" r="5" fill="${topC2}"/><circle cx="100" cy="201" r="5" fill="#22D3EE"/><circle cx="114" cy="201" r="5" fill="#FBBF24"/><path d="M58 166 Q100 184 142 166" fill="none" stroke="${topC2}" stroke-width="8" ${soft}/>`);

  /* --- Cou --- */
  P.push(`<path d="M82 118 L82 158 Q100 170 118 158 L118 118 Z" fill="${shade(skin, -.06)}" ${soft}/>`);
  P.push(`<path d="M80 118 L120 118 L120 150 Q100 140 80 150 Z" fill="url(#${u}neckao)"/>`);
  if (neck) {
    const c = neck.color;
    if (neck.type === 'chain') P.push(`<path d="M80 156 Q100 188 120 156" fill="none" stroke="${c}" stroke-width="4.5" stroke-dasharray="5 2.5"/><circle cx="100" cy="180" r="8" fill="${c}" ${soft}/>`);
    if (neck.type === 'bowtie') P.push(`<path d="M100 162 L82 152 Q78 162 82 172 Z M100 162 L118 152 Q122 162 118 172 Z" fill="${c}" ${soft}/><circle cx="100" cy="162" r="5.5" fill="${shade(c, -.15)}" ${soft}/>`);
    if (neck.type === 'scarf') P.push(`<path d="M72 150 Q100 170 128 150 Q134 160 128 168 Q100 184 72 168 Q66 160 72 150 Z" fill="${c}" ${clay}/><rect x="108" y="164" width="16" height="40" rx="7" fill="${shade(c, -.1)}" transform="rotate(-8 116 164)" ${clay}/>`);
    if (neck.type === 'bandana') P.push(`<path d="M74 152 Q100 168 126 152 L100 186 Z" fill="${c}" ${soft}/><circle cx="92" cy="164" r="2" fill="#fff"/><circle cx="106" cy="168" r="2" fill="#fff"/><circle cx="112" cy="158" r="2" fill="#fff"/>`);
    if (neck.type === 'medal') P.push(`<path d="M86 154 L100 180 L114 154" fill="none" stroke="${c}" stroke-width="5"/><circle cx="100" cy="188" r="12" fill="#1d1233" stroke="#FBBF24" stroke-width="2.5" ${soft}/><circle cx="100" cy="188" r="4" fill="${c}"/>`);
  }

  /* --- Tête --- */
  P.push(`<g ${clay}><ellipse cx="53" cy="96" rx="9" ry="13" fill="${skin}"/><ellipse cx="147" cy="96" rx="9" ry="13" fill="${skin}"/></g>`);
  P.push(`<path d="M100 36 C134 36 150 62 150 94 C150 128 128 148 100 148 C72 148 50 128 50 94 C50 62 66 36 100 36 Z" fill="${skin}" ${clay}/>`);
  P.push(`<ellipse cx="74" cy="112" rx="13" ry="9" fill="url(#${u}bl)"/><ellipse cx="126" cy="112" rx="13" ry="9" fill="url(#${u}bl)"/>`);
  // Yeux sombres et brillants
  const eyeOpen = (x, big) => `<ellipse cx="${x}" cy="96" rx="${big ? 7.5 : 6.5}" ry="${big ? 8.5 : 7}" fill="${mix(iris, '#0d0808', .55)}"/><ellipse cx="${x}" cy="97" rx="${big ? 5 : 4.2}" ry="${big ? 6 : 5}" fill="${iris}" opacity=".55"/><circle cx="${x + 2.3}" cy="93" r="${big ? 2.6 : 2.2}" fill="#fff"/><circle cx="${x - 2}" cy="99.5" r="1" fill="#fff" opacity=".7"/>`;
  const eyeClosed = (x, up) => up ? `<path d="M${x - 8} 98 Q${x} 89 ${x + 8} 98" stroke="#20120C" stroke-width="3.6" fill="none" stroke-linecap="round"/>` : `<path d="M${x - 8} 94 Q${x} 102 ${x + 8} 94" stroke="#20120C" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  const lid = x => `<path d="M${x - 9} 94 Q${x} 86 ${x + 9} 94 L${x + 9} 88 L${x - 9} 88 Z" fill="${skin}"/><path d="M${x - 8.5} 94 Q${x} 90.5 ${x + 8.5} 94" stroke="#20120C" stroke-width="2" fill="none"/>`;
  let eyes;
  if (mood === 'grin') eyes = eyeClosed(80, true) + eyeClosed(120, true);
  else if (mood === 'sad') eyes = eyeClosed(80, false) + eyeClosed(120, false);
  else if (mood === 'wink') eyes = eyeOpen(80) + eyeClosed(120, true);
  else if (mood === 'smirk') eyes = eyeOpen(80) + lid(80) + eyeOpen(120) + lid(120);
  else eyes = eyeOpen(80, mood === 'wow') + eyeOpen(120, mood === 'wow');
  const hideEyes = (eyesAcc && ['shades', 'visor', 'stars', 'hearts'].includes(eyesAcc.type)) || head?.type === 'robot';
  if (!hideEyes) P.push(`<g class="ch-eyes">${eyes}</g>`);
  // Sourcils épais en volume
  const bc = hairStyle === 'none' ? '#2A1810' : mix(hairC, '#2A1810', .15);
  const brows = {
    happy: ['M68 80 Q79 73 91 77', 'M109 77 Q121 73 132 80'], talk: ['M68 79 Q79 72 91 76', 'M109 76 Q121 72 132 79'],
    grin: ['M68 78 Q79 71 91 75', 'M109 75 Q121 71 132 78'], wow: ['M68 74 Q79 65 91 70', 'M109 70 Q121 65 132 74'],
    sad: ['M69 79 Q80 77 90 82', 'M110 82 Q120 77 131 79'], wink: ['M68 80 Q79 73 91 77', 'M109 80 Q121 78 132 81'],
    smirk: ['M68 78 Q79 70 91 76', 'M109 79 Q121 76 132 80'],
  }[mood] || [];
  if (head?.type !== 'robot' && head?.type !== 'beanie' || true) P.push(`<g ${soft}><path d="${brows[0]}" stroke="${bc}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${brows[1]}" stroke="${bc}" stroke-width="7" fill="none" stroke-linecap="round"/></g>`);
  // Nez rond et rosé
  P.push(`<ellipse cx="100" cy="110" rx="10" ry="8.5" fill="${nose}" ${soft}/>`);
  // Bouche
  const mouths = {
    happy: `<path d="M86 126 Q100 136 114 126" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    smirk: `<path d="M88 128 Q104 133 116 124" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M80 122 Q100 146 120 122 Q100 128 80 122 Z" fill="#9B2C2C"/><path d="M82 123 Q100 129 118 123 L116 128 Q100 132 84 128 Z" fill="#fff"/><path d="M90 136 Q100 141 110 136 Q100 133 90 136 Z" fill="#EF6B6B"/>`,
    talk: `<ellipse cx="100" cy="129" rx="8" ry="6.5" fill="#9B2C2C"/><ellipse cx="100" cy="132.5" rx="5" ry="2.2" fill="#EF6B6B"/>`,
    wow: `<ellipse cx="100" cy="130" rx="7" ry="8.5" fill="#9B2C2C"/><ellipse cx="100" cy="134" rx="4.5" ry="2.3" fill="#EF6B6B"/>`,
    sad: `<path d="M88 132 Q100 124 112 132" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    wink: `<path d="M86 125 Q100 137 114 125" stroke="${lip}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
  };
  if (head?.type !== 'robot') P.push(`<g class="ch-mouth">${mouths[mood] || mouths.happy}</g>`);
  if (sk.extra === 'moustache') P.push(`<path d="M84 120 Q92 113 100 118 Q108 113 116 120 Q108 125 100 121 Q92 125 84 120 Z" fill="${shade(hairC, -.05)}" ${soft}/>`);

  /* --- Cheveux devant --- */
  if (hairStyle === 'swept') P.push(`<path d="M50 90 Q46 50 78 38 Q108 28 132 40 Q152 54 150 88 Q140 64 118 60 Q124 50 112 46 Q108 62 84 60 Q60 64 50 90 Z" fill="${hairC}" ${clay}/>`);
  if (hairStyle === 'short') P.push(`<path d="M52 82 Q52 44 100 38 Q148 44 148 82 Q134 58 100 58 Q66 58 52 82 Z" fill="${hairC}" ${clay}/>`);
  if (hairStyle === 'long') P.push(`<path d="M52 104 Q48 50 100 38 Q152 50 148 104 Q142 72 118 60 Q100 72 82 60 Q58 72 52 104 Z" fill="${hairC}" ${clay}/><path d="M56 100 Q54 140 62 170 M144 100 Q146 140 138 170" stroke="${shade(hairC, -.2)}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`);
  if (hairStyle === 'bob') P.push(`<path d="M50 96 Q46 44 100 38 Q154 44 150 96 Q146 70 128 62 Q100 76 72 62 Q54 70 50 96 Z" fill="${hairC}" ${clay}/>`);
  if (hairStyle === 'mohawk') P.push(`<path d="M86 50 L90 8 L98 38 L102 2 L108 38 L116 10 L116 50 Q100 42 86 50 Z" fill="${hairC}" ${clay}/><path d="M56 76 Q58 52 86 46 M144 76 Q142 52 114 46" stroke="${shade(hairC, -.25)}" stroke-width="3" fill="none" opacity=".35"/>`);
  if (hairStyle === 'curls') P.push(`<g fill="${hairC}" ${clay}>${[[66, 60], [84, 50], [100, 46], [116, 50], [134, 60], [74, 66], [126, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13"/>`).join('')}</g><g fill="none" stroke="${shade(hairC, -.25)}" stroke-width="2" opacity=".45">${[[66, 60], [100, 46], [134, 60], [84, 50], [116, 50]].map(([x, y]) => `<path d="M${x - 5} ${y} a5 5 0 1 1 5 5"/>`).join('')}</g>`);
  if (hairStyle === 'afro') P.push(`<path d="M54 84 Q58 50 100 44 Q142 50 146 84 Q126 62 100 62 Q74 62 54 84 Z" fill="${hairC}" ${clay}/>`);
  if (hairStyle === 'bun') P.push(`<circle cx="100" cy="26" r="16" fill="${hairC}" ${clay}/><path d="M52 84 Q52 44 100 38 Q148 44 148 84 Q134 58 100 58 Q66 58 52 84 Z" fill="${hairC}" ${clay}/>`);
  if (hairStyle === 'buns') {
    const buns = [[62, 46, -30], [82, 30, -12], [118, 30, 12], [138, 46, 30], [54, 70, -50], [146, 70, 50]];
    const beads = ['#F97316', '#EC4899', '#6D8BD8', '#EC4899', '#F97316', '#EC4899'];
    P.push(`<path d="M52 84 Q52 44 100 38 Q148 44 148 84 Q134 58 100 58 Q66 58 52 84 Z" fill="${hairC}" ${clay}/>`);
    P.push(buns.map(([x, y, r], i) => `<g transform="rotate(${r} ${x} ${y + 10})"><path d="M${x - 7} ${y + 12} Q${x - 4} ${y - 8} ${x} ${y - 10} Q${x + 4} ${y - 8} ${x + 7} ${y + 12} Z" fill="${hairC}" ${clay}/><circle cx="${x}" cy="${y + 12}" r="6" fill="${beads[i]}" ${soft}/></g>`).join(''));
  }

  /* --- Coiffes --- */
  if (head) {
    const t = head.type;
    if (t === 'beanie') P.push(`<path d="M50 92 Q46 34 100 28 Q154 34 150 92 Q100 78 50 92 Z" fill="${hc}" ${clay}/><path d="M50 92 Q100 78 150 92" stroke="${shade(hc, -.15)}" stroke-width="3" fill="none" opacity=".5"/>`);
    if (t === 'cap') P.push(`<path d="M52 78 Q52 34 100 34 Q148 34 148 78 Q100 66 52 78 Z" fill="${hc}" ${clay}/><path d="M112 72 Q160 64 172 80 Q150 88 116 82 Z" fill="${shade(hc, -.2)}" ${clay}/><circle cx="100" cy="36" r="5" fill="${shade(hc, .3)}" ${soft}/>`);
    if (t === 'beret') P.push(`<ellipse cx="94" cy="46" rx="56" ry="18" fill="${hc}" transform="rotate(-8 94 46)" ${clay}/><rect x="91" y="22" width="6" height="12" rx="3" fill="${hc}"/>`);
    if (t === 'crown') P.push(`<path d="M66 50 L70 20 L85 36 L100 12 L115 36 L130 20 L134 50 Z" fill="${hc}" ${clay}/><circle cx="100" cy="30" r="4.5" fill="#EF4444" ${soft}/>`);
    if (t === 'fedora') P.push(`<ellipse cx="100" cy="58" rx="70" ry="13" fill="${shade(hc, -.15)}" ${clay}/><path d="M64 58 Q64 20 100 20 Q136 20 136 58 Z" fill="${hc}" ${clay}/><rect x="64" y="46" width="72" height="9" fill="#F5F5F4" opacity=".9"/>`);
    if (t === 'bob') P.push(`<path d="M40 74 Q100 54 160 74 L168 88 Q100 72 32 88 Z" fill="${shade(hc, -.12)}" ${clay}/><path d="M56 76 Q56 30 100 30 Q144 30 144 76 Z" fill="${hc}" ${clay}/>`);
    if (t === 'robot') P.push(`<rect x="44" y="30" width="112" height="120" rx="54" fill="${hc}" ${clay}/><rect x="56" y="80" width="88" height="26" rx="13" fill="#111827"/><rect x="62" y="85" width="76" height="5" rx="2.5" fill="#F43F5E"/>`);
    if (t === 'helmet') P.push(`<circle cx="100" cy="94" r="70" fill="${hc}" opacity=".2" stroke="#E2E8F0" stroke-width="6"/><path d="M52 60 Q62 38 86 30" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>`);
  }
  /* --- Lunettes --- */
  if (eyesAcc) {
    const t = eyesAcc.type;
    if (t === 'shades') P.push(`<g ${soft}><rect x="64" y="86" width="32" height="20" rx="8" fill="${ec}"/><rect x="104" y="86" width="32" height="20" rx="8" fill="${ec}"/><rect x="94" y="91" width="12" height="5" rx="2.5" fill="${ec}"/></g>`);
    if (t === 'round') P.push(`<g fill="rgba(255,255,255,.12)" stroke="${ec}" stroke-width="3.5"><circle cx="80" cy="96" r="13"/><circle cx="120" cy="96" r="13"/></g><path d="M93 96 L107 96" stroke="${ec}" stroke-width="3.5"/>`);
    if (t === 'stars') { const st = (cx, cy) => `<path d="M${cx} ${cy - 15} L${cx + 5} ${cy - 5} L${cx + 15} ${cy - 4} L${cx + 7} ${cy + 4} L${cx + 9} ${cy + 14} L${cx} ${cy + 8} L${cx - 9} ${cy + 14} L${cx - 7} ${cy + 4} L${cx - 15} ${cy - 4} L${cx - 5} ${cy - 5} Z" fill="${ec}"/>`; P.push(`<g ${soft}>${st(80, 97)}${st(120, 97)}<rect x="93" y="94" width="14" height="4" rx="2" fill="${shade(ec, -.3)}"/></g>`); }
    if (t === 'hearts') { const ht = (cx, cy) => `<path d="M${cx} ${cy + 12} C${cx - 19} ${cy} ${cx - 14} ${cy - 14} ${cx} ${cy - 6} C${cx + 14} ${cy - 14} ${cx + 19} ${cy} ${cx} ${cy + 12} Z" fill="${ec}"/>`; P.push(`<g ${soft}>${ht(80, 96)}${ht(120, 96)}<rect x="93" y="93" width="14" height="4" rx="2" fill="${shade(ec, -.3)}"/></g>`); }
    if (t === 'visor') P.push(`<rect x="58" y="84" width="84" height="22" rx="11" fill="${ec}" opacity=".92" ${soft}/>`);
  }
  /* --- Casque audio --- */
  if (ears) {
    P.push(`<path d="M50 96 Q48 30 100 28 Q152 30 150 96" fill="none" stroke="${ears.color}" stroke-width="10" stroke-linecap="round" ${soft}/>`);
    P.push(`<g ${clay}><rect x="36" y="80" width="24" height="38" rx="11" fill="${ears.color}"/><rect x="140" y="80" width="24" height="38" rx="11" fill="${ears.color}"/></g>`);
    if (ears.glow) P.push(`<g fill="none" stroke="${ears.color}" stroke-width="2.5" opacity=".9"><rect x="36" y="80" width="24" height="38" rx="11"/><rect x="140" y="80" width="24" height="38" rx="11"/></g>`);
  }

  const vb = opts.head ? '28 12 144 144' : '0 0 200 222';
  return `<svg class="char${opts.head ? ' char-head' : ' char-bust'}" viewBox="${vb}" role="img" aria-label="${sk.name || ''}"><defs>${defs}</defs><g class="ch-body">${P.join('')}</g></svg>`;
}

// Rendu en <img> : le navigateur rastérise le SVG une fois (filtres compris) au lieu de
// le recalculer à chaque rafraîchissement — bien plus fluide sur mobile.
const imgCache = new Map();
function html(sk, opts = {}) {
  const a = opts.accs || {};
  const key = JSON.stringify([sk.id || sk, opts.mood || 'happy', opts.head ? 1 : 0, Object.keys(a).sort().map(k => a[k] && (a[k].id || a[k].type + a[k].color))]);
  let src = imgCache.get(key);
  if (!src) {
    src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(sk, opts).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
    imgCache.set(key, src);
  }
  const cls = `char${opts.head ? ' char-head' : ' char-bust'}`;
  const alt = sk.name ? String(sk.name).replace(/"/g, '&quot;') : '';
  return `<img class="${cls}" src="${src}" alt="${alt}" draggable="false">`;
}

window.PompeChar = {
  html,
  SKINS, ACCESSORIES, SLOTS, svg,
  byId: id => SKINS.find(s => s.id === id) || SKINS[0],
  accById: id => ACCESSORIES.find(a => a.id === id),
};
})();
