/* ============================================
   Pompelup — personnages (le skin EST l'avatar)
   Petites créatures en velours floqué : forme + couleur + accessoires.
   Le rendu 3D est fait par blobs3d.js ; sans WebGL, repli en dessin plat.
   ============================================ */
(() => {
'use strict';

// shape : dome | bean | peak | frog | heart | cloud · acc : accessoires fournis avec le skin
// Personnages trapus façon « RV There Yet? » : skin = peau, hair/hairColor, top (veste), shirt, pants, face
const H = o => Object.assign({ kind: 'human' }, o);
const SKINS = [
  H({ id: 'rookie', name: 'Momo', rarity: 'common', price: 0, desc: 'Le fan de musique du quartier, casque vissé sur les oreilles.', skin: '#EDB08F', hair: 'short', hairColor: '#4A3226', top: '#F28C38', shirt: '#F28C38', pants: '#3F4A63', acc: { ears: { type: 'phones', color: '#6D28D9' } } }),
  H({ id: 'crate', name: 'Bob le Bob', rarity: 'common', price: 0, desc: 'Bob sur la tête, lunettes noires, toujours au premier rang.', skin: '#EBAD8B', hair: 'short', hairColor: '#6B4A32', top: '#D9692E', shirt: '#F4F1EA', pants: '#4B5563', acc: { head: { type: 'bob', color: '#8B5A3C' }, eyes: { type: 'shades', color: '#15101C' } } }),
  H({ id: 'chanson', name: 'Monsieur Béret', rarity: 'rare', price: 450, desc: 'Moustache, béret et chanson française.', skin: '#E9A886', hair: 'short', hairColor: '#2B2320', face: 'mustache', top: '#2F6BEA', shirt: '#F4F1EA', pants: '#1F2937', acc: { head: { type: 'beret', color: '#1B1B1F' } } }),
  H({ id: 'seventies', name: 'Pépito', rarity: 'rare', price: 450, desc: 'Bouclettes, lunettes rondes et chemise à fleurs dans l’âme.', skin: '#E8B894', hair: 'afro', hairColor: '#3A2418', top: '#F2C230', shirt: '#F2C230', pants: '#8B5A3C', acc: { eyes: { type: 'round', color: '#15101C' } } }),
  H({ id: 'disco', name: 'Disco Dédé', rarity: 'rare', price: 500, desc: 'Veste rose et lunettes noires, il vit la nuit.', skin: '#C68863', hair: 'curly', hairColor: '#1E1612', top: '#E23CC8', shirt: '#1F1B2E', pants: '#1F1B2E', acc: { eyes: { type: 'shades', color: '#15101C' } } }),
  H({ id: 'buns', name: 'Mamie Lulu', rarity: 'rare', price: 500, desc: 'Chignon gris et gilet lilas, elle connaît tous les refrains.', skin: '#EFB89D', hair: 'bun', hairColor: '#C9C4CF', top: '#B79CFA', shirt: '#F4F1EA', pants: '#6B6478', acc: { eyes: { type: 'round', color: '#8B6BB0' } } }),
  H({ id: 'rocker', name: 'Rocky', rarity: 'epic', price: 800, desc: 'Casquette, lunettes noires et blouson rouge, riff à fond.', skin: '#EBAD8B', hair: 'short', hairColor: '#6B4A32', face: 'beard', top: '#E11D48', shirt: '#1F2937', pants: '#1F2937', acc: { head: { type: 'cap', color: '#111827' }, eyes: { type: 'shades', color: '#111827' } } }),
  H({ id: 'mc', name: 'MC Mousse', rarity: 'epic', price: 800, desc: 'Chaîne en or et sweat vert, flow impeccable.', skin: '#8D5A3B', hair: 'short', hairColor: '#15100D', face: 'beard', top: '#10B981', shirt: '#10B981', pants: '#374151', acc: { neck: { type: 'chain', color: '#FBBF24' } } }),
  H({ id: 'kpop', name: 'Idol Bonbon', rarity: 'epic', price: 850, desc: 'Cheveux roses et casque bonbon, star du karaoké.', skin: '#F0B99C', hair: 'long', hairColor: '#F48FC1', top: '#F9A8D4', shirt: '#FFFFFF', pants: '#F4F1EA', acc: { ears: { type: 'phones', color: '#C084FC' } } }),
  H({ id: 'neon', name: 'Néon', rarity: 'epic', unlock: true, desc: 'Crête, visière néon, vitesse lumière.', skin: '#EBAD8B', hair: 'mohawk', hairColor: '#22D3EE', top: '#1F1B2E', shirt: '#22D3EE', pants: '#1F1B2E', acc: { eyes: { type: 'visor', color: '#EC4899' } } }),
  H({ id: 'dj', name: 'DJ Minuit', rarity: 'epic', unlock: true, desc: 'Sweat indigo et casque qui brille dans le noir.', skin: '#C68863', hair: 'short', hairColor: '#15100D', top: '#312E81', shirt: '#312E81', pants: '#1F1B2E', acc: { ears: { type: 'phones', color: '#22D3EE', glow: true } } }),
  H({ id: 'astro', name: 'Cosmo', rarity: 'legendary', unlock: true, desc: 'Combinaison argentée et auréole néon, venu d’une autre planète.', skin: '#EDB08F', hair: 'bald', top: '#CBD5E1', shirt: '#CBD5E1', pants: '#CBD5E1', shoes: '#F4F1EA', acc: { head: { type: 'halo', color: '#22D3EE' } } }),
  H({ id: 'passking', name: 'Capitaine Pass', rarity: 'legendary', unlock: true, desc: 'Exclusif au Pass Or : veste de capitaine et casque doré.', skin: '#EBAD8B', hair: 'short', hairColor: '#2B2320', face: 'beard', top: '#2B70C9', shirt: '#FFC800', pants: '#1F1B2E', acc: { head: { type: 'cap', color: '#FFC800' }, ears: { type: 'phones', color: '#FFC800', glow: true } } }),
  H({ id: 'gold', name: 'Disque d’or', rarity: 'legendary', unlock: true, desc: 'Veste dorée et couronne : la légende du blind test.', skin: '#E8B894', hair: 'short', hairColor: '#2B2320', face: 'mustache', top: '#F5B81C', shirt: '#1F1B2E', pants: '#1F1B2E', acc: { head: { type: 'crown', color: '#FBBF24' }, ears: { type: 'phones', color: '#111827' } } }),
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
const SLOTS_UNUSED = { head: 'Tête', eyes: 'Yeux', ears: 'Oreilles', neck: 'Cou' };

const SLOTS = { head: 'Tête', eyes: 'Yeux', ears: 'Oreilles', neck: 'Cou' };
const accById = id => ACCESSORIES.find(a => a.id === id);

function mergeAccs(sk, extra) { return Object.assign({}, sk.acc || {}, extra || {}); }

// Repli sans WebGL : silhouette plate et yeux
function flatSVG(sk) {
  const c = sk.color || sk.top || '#F97316';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="80" ry="10" fill="#1B1026" opacity=".15"/><path d="M20 200 Q14 60 100 50 Q186 60 180 200 Z" fill="${c}"/><ellipse cx="78" cy="130" rx="9" ry="13" fill="#15101C"/><ellipse cx="122" cy="130" rx="9" ry="13" fill="#15101C"/></svg>`;
}
const flatURL = sk => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(flatSVG(sk));

function keyOf(sk, opts) {
  const a = mergeAccs(sk, opts.accs);
  return JSON.stringify([sk.id || '', sk.kind || sk.shape, sk.color || sk.top, opts.mood || 'happy', opts.head ? 1 : opts.lying ? 2 : 0, Object.keys(a).sort().map(k => a[k] && (a[k].id || a[k].type + a[k].color))]);
}
function html(sk, opts = {}) {
  const o = Object.assign({}, opts, { accs: mergeAccs(sk, opts.accs) });
  if (window.Pompe3D && window.Pompe3D.ok()) return window.Pompe3D.html(sk, o, keyOf(sk, opts));
  return `<img class="char" src="${flatURL(sk)}" alt="${String(sk.name || '').replace(/"/g, '&quot;')}" draggable="false">`;
}

window.PompeChar = {
  html, flatURL, keyOf, SKINS, ACCESSORIES, SLOTS, accById,
  byId: id => SKINS.find(s => s.id === id) || SKINS[0],
};
})();
