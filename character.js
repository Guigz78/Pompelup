/* ============================================
   Pompelup — personnages (le skin EST l'avatar)
   Petites créatures en velours floqué : forme + couleur + accessoires.
   Le rendu 3D est fait par blobs3d.js ; sans WebGL, repli en dessin plat.
   ============================================ */
(() => {
'use strict';

// shape : dome | bean | peak | frog | heart | cloud · acc : accessoires fournis avec le skin
const SKINS = [
  { id: 'rookie', name: 'Blobby', shape: 'dome', color: '#F97316', rarity: 'common', price: 0, desc: 'La mascotte Pompelup, casque vissé sur la tête.', acc: { ears: { type: 'phones', color: '#6D28D9' } } },
  { id: 'crate', name: 'Froggy', shape: 'frog', color: '#8FE03A', rarity: 'common', price: 0, desc: 'Une grenouille qui connaît tous les refrains.' },
  { id: 'chanson', name: 'Monsieur Béret', shape: 'bean', color: '#2F6BEA', rarity: 'rare', price: 450, desc: 'Chanson française et béret de velours.', acc: { head: { type: 'beret', color: '#1B1B1F' } } },
  { id: 'seventies', name: 'Pépito', shape: 'peak', color: '#F5E03A', rarity: 'rare', price: 450, desc: 'Lunettes rondes, sourire zen.', acc: { eyes: { type: 'round', color: '#15101C' } } },
  { id: 'disco', name: 'Cœur Disco', shape: 'heart', color: '#E23CC8', rarity: 'rare', price: 500, desc: 'Lunettes noires et cœur qui bat au tempo.', acc: { eyes: { type: 'shades', color: '#15101C' } } },
  { id: 'buns', name: 'Nuage Pop', shape: 'cloud', color: '#B79CFA', rarity: 'rare', price: 500, desc: 'Doux comme une ballade des années 80.' },
  { id: 'rocker', name: 'Rocky', shape: 'dome', color: '#E11D48', rarity: 'epic', price: 800, desc: 'Casquette à l’envers, riff à fond.', acc: { head: { type: 'cap', color: '#111827' }, eyes: { type: 'shades', color: '#111827' } } },
  { id: 'mc', name: 'MC Mousse', shape: 'bean', color: '#10B981', rarity: 'epic', price: 800, desc: 'Chaîne en or et flow en velours.', acc: { neck: { type: 'chain', color: '#FBBF24' } } },
  { id: 'kpop', name: 'Idol Bonbon', shape: 'heart', color: '#F9A8D4', rarity: 'epic', price: 850, desc: 'Casque bonbon et cœur de star.', acc: { ears: { type: 'phones', color: '#C084FC' } } },
  { id: 'neon', name: 'Néon', shape: 'peak', color: '#22D3EE', rarity: 'epic', unlock: true, desc: 'Visière néon, vitesse lumière.', acc: { eyes: { type: 'visor', color: '#EC4899' } } },
  { id: 'dj', name: 'DJ Minuit', shape: 'cloud', color: '#312E81', rarity: 'epic', unlock: true, desc: 'Le casque qui brille dans le noir.', acc: { ears: { type: 'phones', color: '#22D3EE', glow: true } } },
  { id: 'astro', name: 'Grenouille d’argent', shape: 'frog', color: '#CBD5E1', rarity: 'legendary', unlock: true, desc: 'Velours argenté et auréole néon.', acc: { head: { type: 'halo', color: '#22D3EE' } } },
  { id: 'gold', name: 'Disque d’or', shape: 'dome', color: '#F5B81C', rarity: 'legendary', unlock: true, desc: 'Tout en or, couronne comprise.', acc: { head: { type: 'crown', color: '#FBBF24' }, ears: { type: 'phones', color: '#111827' } } },
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
  const c = sk.color || '#F97316';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="80" ry="10" fill="#1B1026" opacity=".15"/><path d="M20 200 Q14 60 100 50 Q186 60 180 200 Z" fill="${c}"/><ellipse cx="78" cy="130" rx="9" ry="13" fill="#15101C"/><ellipse cx="122" cy="130" rx="9" ry="13" fill="#15101C"/></svg>`;
}
const flatURL = sk => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(flatSVG(sk));

function keyOf(sk, opts) {
  const a = mergeAccs(sk, opts.accs);
  return JSON.stringify([sk.id || '', sk.shape, sk.color, opts.mood || 'happy', opts.head ? 1 : opts.lying ? 2 : 0, Object.keys(a).sort().map(k => a[k] && (a[k].id || a[k].type + a[k].color))]);
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
