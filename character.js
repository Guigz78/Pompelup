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
  H({ id: 'rookie', name: 'Julien Le Peps', rarity: 'common', price: 0, desc: 'Le fan de musique du quartier, casque vissé sur les oreilles.', skin: '#EDB08F', hair: 'short', hairColor: '#4A3226', top: '#F28C38', shirt: '#F28C38', pants: '#3F4A63', acc: { ears: { type: 'phones', color: '#6D28D9' } } }),
  H({ id: 'crate', name: 'Bob Marlou', rarity: 'common', price: 0, desc: 'Bob sur la tête, lunettes noires, toujours au premier rang.', skin: '#EBAD8B', hair: 'short', hairColor: '#6B4A32', top: '#D9692E', shirt: '#F4F1EA', pants: '#4B5563', acc: { head: { type: 'bob', color: '#8B5A3C' }, eyes: { type: 'shades', color: '#15101C' } } }),
  H({ id: 'chanson', name: 'Serge Gainsbarre', rarity: 'rare', price: 450, desc: 'Moustache, béret et chanson française.', skin: '#E9A886', hair: 'short', hairColor: '#2B2320', face: 'mustache', top: '#2F6BEA', shirt: '#F4F1EA', pants: '#1F2937', acc: { head: { type: 'beret', color: '#1B1B1F' } } }),
  H({ id: 'seventies', name: 'Michel Polnaroïde', rarity: 'rare', price: 450, desc: 'Bouclettes, lunettes rondes et chemise à fleurs dans l’âme.', skin: '#E8B894', hair: 'afro', hairColor: '#3A2418', top: '#F2C230', shirt: '#F2C230', pants: '#8B5A3C', acc: { eyes: { type: 'round', color: '#15101C' } } }),
  H({ id: 'disco', name: 'Bruno Marsien', rarity: 'rare', price: 500, desc: 'Veste rose et lunettes noires, il vit la nuit.', skin: '#C68863', hair: 'curly', hairColor: '#1E1612', top: '#E23CC8', shirt: '#1F1B2E', pants: '#1F1B2E', acc: { eyes: { type: 'shades', color: '#15101C' } } }),
  H({ id: 'buns', name: 'Line Renaudette', rarity: 'rare', price: 500, desc: 'Chignon gris et gilet lilas, elle connaît tous les refrains.', skin: '#EFB89D', hair: 'bun', hairColor: '#C9C4CF', top: '#B79CFA', shirt: '#F4F1EA', pants: '#6B6478', acc: { eyes: { type: 'round', color: '#8B6BB0' } } }),
  H({ id: 'rocker', name: 'Eddy Mixtape', rarity: 'epic', price: 800, desc: 'Casquette, lunettes noires et blouson rouge, riff à fond.', skin: '#EBAD8B', hair: 'short', hairColor: '#6B4A32', face: 'beard', top: '#E11D48', shirt: '#1F2937', pants: '#1F2937', fit: { finish: 'leather', pin: '#E5E7EB', belt: '#1E1A22', beltFinish: 'leather', buckle: '#D1D5DB' }, acc: { head: { type: 'cap', color: '#111827' }, eyes: { type: 'shades', color: '#111827' } } }),
  H({ id: 'mc', name: 'MC Solaire', rarity: 'epic', price: 800, desc: 'Chaîne en or et sweat vert, flow impeccable.', skin: '#8D5A3B', hair: 'short', hairColor: '#15100D', face: 'beard', top: '#10B981', shirt: '#10B981', pants: '#374151', acc: { neck: { type: 'chain', color: '#FBBF24' } } }),
  H({ id: 'kpop', name: 'Lady Gagaa', rarity: 'epic', price: 850, desc: 'Cheveux roses et casque bonbon, star du karaoké.', skin: '#F0B99C', hair: 'long', hairColor: '#F48FC1', top: '#F9A8D4', shirt: '#FFFFFF', pants: '#F4F1EA', acc: { ears: { type: 'phones', color: '#C084FC' } } }),
  H({ id: 'neon', name: 'Stromaé-Néon', rarity: 'epic', unlock: true, desc: 'Crête, visière néon, vitesse lumière.', skin: '#EBAD8B', hair: 'mohawk', hairColor: '#22D3EE', top: '#1F1B2E', shirt: '#22D3EE', pants: '#1F1B2E', acc: { eyes: { type: 'visor', color: '#EC4899' } } }),
  H({ id: 'dj', name: 'David Guettapens', rarity: 'epic', unlock: true, desc: 'Sweat indigo et casque qui brille dans le noir.', skin: '#C68863', hair: 'short', hairColor: '#15100D', top: '#312E81', shirt: '#312E81', pants: '#1F1B2E', acc: { ears: { type: 'phones', color: '#22D3EE', glow: true } } }),
  H({ id: 'astro', name: 'Jean-Michel Starre', rarity: 'legendary', unlock: true, desc: 'Combinaison argentée et auréole néon, venu d’une autre planète.', skin: '#EDB08F', hair: 'bald', top: '#CBD5E1', shirt: '#CBD5E1', pants: '#CBD5E1', shoes: '#F4F1EA', fit: { finish: 'metal', trim: '#22D3EE', gloves: '#F4F1EA', belt: '#94A3B8', buckle: '#22D3EE', pin: '#22D3EE' }, acc: { head: { type: 'halo', color: '#22D3EE' } } }),
  H({ id: 'groovy', name: 'Claude Groovçois', rarity: 'epic', unlock: 'pass', desc: 'Offert par le pass de saison : costume violet et lunettes disco.', skin: '#E8A986', hair: 'afro', hairColor: '#E2632B', top: '#7B3FC4', shirt: '#FFC800', pants: '#7B3FC4', fit: { finish: 'sequin', lapels: '#FFC800', belt: '#FFC800', buckle: '#FFC800' }, acc: { eyes: { type: 'shades', color: '#15101C' }, neck: { type: 'bowtie', color: '#FFC800' } } }),
  H({ id: 'crooner', name: 'Frank Sinatruc', rarity: 'epic', unlock: 'pass', desc: 'Exclusif au Pass Or : smoking à revers satinés, boutons nacrés et micro vintage.', skin: '#C68863', hair: 'pompadour', hairColor: '#1E1612', face: 'mustache', top: '#1F1F24', shirt: '#F4F1EA', pants: '#1F1F24', fit: { lapels: '#0B0B0E', lapelFinish: 'sequin', buttons: '#F4F1EA', pin: '#D4A23A', prop: 'mic' }, acc: { neck: { type: 'bowtie', color: '#DC2626' } } }),
  H({ id: 'passking', name: 'Nikos Aliapass', rarity: 'legendary', unlock: 'pass', desc: 'Exclusif au Pass Or : veste de capitaine galonnée, cape royale et casque doré.', skin: '#EBAD8B', hair: 'short', hairColor: '#2B2320', face: 'beard', top: '#2B70C9', shirt: '#FFC800', pants: '#1F1B2E', fit: { lapels: '#FFC800', lapelFinish: 'metal', buttons: '#FFC800', belt: '#FFC800', buckle: '#FFC800', buckleGem: '#2B70C9', cape: '#1F3A8A', capeTrim: '#FFC800', gloves: '#F4F1EA', pin: '#FFC800' }, acc: { head: { type: 'cap', color: '#FFC800' }, ears: { type: 'phones', color: '#FFC800', glow: true } } }),
  H({ id: 'gold', name: 'Freddie Mercurieux', rarity: 'legendary', unlock: true, desc: 'Veste dorée, cape d’hermine et couronne : la légende du blind test.', skin: '#E8B894', hair: 'short', hairColor: '#2B2320', face: 'mustache', top: '#F5B81C', shirt: '#1F1B2E', pants: '#1F1B2E', fit: { finish: 'metal', cape: '#B91C1C', capeTrim: '#F4F1EA', belt: '#1F1B2E', buckle: '#FBBF24', prop: 'mic', pin: '#FBBF24' }, acc: { head: { type: 'crown', color: '#FBBF24' }, ears: { type: 'phones', color: '#111827' } } }),
  // ——— Nouveaux skins ———
  H({ id: 'beatle', name: 'Paul McCarotte', rarity: 'rare', price: 700, desc: 'Coupe au bol, costume ajusté à revers fins : la beatlemania en personne.', skin: '#F0C2A2', hair: 'bowl', hairColor: '#5A3A24', top: '#2F3542', shirt: '#F4F1EA', pants: '#2F3542', fit: { lapels: '#1E222B', buttons: '#1E222B' }, acc: { neck: { type: 'bowtie', color: '#111827' } } }),
  H({ id: 'jul', name: 'Jul Verne', rarity: 'rare', price: 700, desc: 'Survêt à bandes, baskets neuves et chaîne : vingt mille titres sous les mers.', skin: '#E3A47E', hair: 'spiky', hairColor: '#15100D', top: '#111827', shirt: '#111827', pants: '#111827', fit: { stripes: '#FACC15', sneakers: '#FACC15' }, acc: { neck: { type: 'chain', color: '#E5E7EB' } } }),
  H({ id: 'angele', name: 'Angèle Lumière', rarity: 'epic', price: 1300, desc: 'Queue de cheval blonde, créoles dorées et micro à la main.', skin: '#F7D6C1', hair: 'ponytail', hairColor: '#F2D27B', top: '#C4B5FD', shirt: '#FFFFFF', pants: '#4C3F7A', fit: { earrings: '#FBBF24', prop: 'mic', buttons: '#FFFFFF' }, acc: {} }),
  H({ id: 'aya', name: 'Aya Nakamarrante', rarity: 'epic', price: 1300, desc: 'Tresses perlées, top à paillettes framboise et créoles XXL.', skin: '#8D5A3B', hair: 'braids', hairColor: '#15100D', top: '#E11D74', shirt: '#E11D74', pants: '#1F1B2E', fit: { finish: 'sequin', earrings: '#FBBF24', belt: '#FBBF24', buckle: '#FBBF24' }, acc: {} }),
  H({ id: 'mozart', name: 'Wolfgang Amadeus Mozzarella', rarity: 'epic', price: 1500, desc: 'Perruque poudrée, redingote rouge à galons d’or et boutons dorés.', skin: '#F3D1BD', hair: 'curly', hairColor: '#F1F0EC', top: '#B91C1C', shirt: '#FFF7EC', pants: '#F1F0EC', fit: { lapels: '#FBBF24', lapelFinish: 'metal', buttons: '#FBBF24' }, acc: { neck: { type: 'bowtie', color: '#FFFFFF' } } }),
  H({ id: 'rockstar', name: 'Jimi Hendrixe', rarity: 'epic', price: 1500, desc: 'Veste de cuir cloutée et guitare de feu sur les genoux.', skin: '#8D5A3B', hair: 'afro', hairColor: '#15100D', top: '#3B2A20', shirt: '#F59E0B', pants: '#1F2937', fit: { finish: 'leather', prop: 'guitar', propColor: '#F4F1EA', strap: '#B91C1C', pin: '#F59E0B' }, acc: { neck: { type: 'bandana', color: '#7C3AED' } } }),
  // ——— Premium : matières, cape, micro, bijoux ———
  H({ id: 'elvis', premium: true, name: 'Elvis Presqueley', rarity: 'legendary', price: 4000, desc: 'Combinaison blanche à paillettes, cape à liseré doré, ceinture de champion et banane parfaite.', skin: '#F0C2A2', hair: 'pompadour', hairColor: '#15100D', top: '#F8F7F2', shirt: '#F8F7F2', pants: '#F8F7F2', shoes: '#F8F7F2', fit: { finish: 'sequin', cape: '#FFFFFF', capeTrim: '#FBBF24', belt: '#FBBF24', buckle: '#FBBF24', buckleGem: '#DC2626', lapels: '#FBBF24', lapelFinish: 'metal', prop: 'mic', earrings: null }, acc: { eyes: { type: 'shades', color: '#B45309' } } }),
  H({ id: 'elton', premium: true, name: 'Elton Jaune', rarity: 'legendary', price: 4500, desc: 'Veste à sequins jaune soleil, revers roses, lunettes étoiles et gants de scène.', skin: '#F0C2A2', hair: 'short', hairColor: '#B45309', top: '#FFC800', shirt: '#FF4FA3', pants: '#1F1B2E', fit: { finish: 'sequin', lapels: '#FF4FA3', lapelFinish: 'sequin', gloves: '#FFFFFF', pin: '#FF4FA3', sneakers: '#FF4FA3', cape: '#FF4FA3', capeTrim: '#FFC800' }, acc: { eyes: { type: 'stars', color: '#FF4FA3' } } }),
  H({ id: 'queenb', premium: true, name: 'Queen Bé', rarity: 'legendary', price: 4500, desc: 'Body doré effet miroir, créoles, ceinture à pierre et micro serti : la reine de la scène.', skin: '#9A6646', hair: 'long', hairColor: '#C8913D', top: '#E9B949', shirt: '#E9B949', pants: '#2A1B12', fit: { finish: 'metal', earrings: '#FDE68A', belt: '#FDE68A', buckle: '#FDE68A', buckleGem: '#A855F7', prop: 'mic', propColor: '#E9B949', trim: '#FDE68A', trimGlow: false }, acc: {} }),
  H({ id: 'daftponk', premium: true, name: 'Daft Ponk', rarity: 'legendary', price: 5000, desc: 'Casque chromé doré, blouson de cuir à liserés néon et gants : un robot du dancefloor.', skin: '#E8B894', hair: 'bald', top: '#121016', shirt: '#121016', pants: '#121016', fit: { finish: 'leather', trim: '#22D3EE', gloves: '#121016', belt: '#C0C4CC', buckle: '#22D3EE', sneakers: '#22D3EE' }, acc: { head: { type: 'robot', color: '#E9B949' } } }),
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
  return JSON.stringify([sk.id || '', sk.kind || sk.shape, sk.color || sk.top, opts.mood || 'happy', opts.head ? 1 : opts.lying ? 2 : opts.sit ? 3 : 0, Object.keys(a).sort().map(k => a[k] && (a[k].id || a[k].type + a[k].color))]);
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
