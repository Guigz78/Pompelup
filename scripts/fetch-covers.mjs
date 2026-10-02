// Récupère la vraie pochette (Deezer, puis iTunes) et l'extrait audio (iTunes, liens stables)
// de chaque chanson, et écrit covers.js + previews.js embarqués dans l'app :
// plus aucune recherche côté navigateur.
// Usage : node scripts/fetch-covers.mjs   (tourne dans la GitHub Action « covers »)
import fs from 'fs';
import vm from 'vm';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('songs.js', 'utf8'), ctx);
const SONGS = ctx.window.SONGS;
const OUT = 'covers.js';
const prev = (() => { try { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(OUT, 'utf8'), c); return c.window.COVERS || {}; } catch (e) { return {}; } })();

const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\(.*?\)|\[.*?\]|\s-\s.*$/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(url, tries = 3) {
  for (let k = 0; k < tries; k++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Pompelup covers (github.com/Guigz78/Pompelup)' } });
      if (r.status === 429 || r.status >= 500) { await sleep(2000 * (k + 1)); continue; }
      return await r.json();
    } catch (e) { await sleep(1000 * (k + 1)); }
  }
  return null;
}
// Le bon morceau : même titre et même artiste (tolérant aux « feat. », accents…)
function best(list, song, title, artist) {
  const t = norm(song.title), words = norm(song.artist).split(' ').filter(w => w.length > 2 && !['the', 'and', 'feat'].includes(w));
  const artistOk = x => { const n = norm(artist(x)); return words.length ? words.some(w => n.includes(w)) : n.includes(norm(song.artist)); };
  const score = x => (norm(title(x)) === t ? 3 : norm(title(x)).includes(t) || t.includes(norm(title(x))) ? 2 : 0) + (artistOk(x) ? 2 : 0);
  const ranked = list.map(x => [score(x), x]).filter(([s]) => s >= 3).sort((p, q) => q[0] - p[0]);
  return ranked[0]?.[1] || null;
}
async function deezer(song) {
  for (const q of [`artist:"${song.artist}" track:"${song.title}"`, `${song.title} ${song.artist}`]) {
    const d = await getJSON(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=10`);
    const t = d?.data && best(d.data, song, x => x.title, x => x.artist?.name || '');
    if (t?.album?.md5_image) return `d:${t.album.md5_image}`;
    await sleep(120);
  }
  return null;
}
const itCache = new Map();
// Plusieurs essais : boutique FR puis US, « titre artiste » puis titre seul (l'artiste reste vérifié)
async function itunesTrack(song) {
  if (itCache.has(song.id)) return itCache.get(song.id);
  let t = null;
  const terms = [`${song.title} ${song.artist}`, song.title.replace(/\(.*?\)|\[.*?\]/g, '').trim()];
  outer: for (const country of ['fr', 'us']) {
    for (const term of terms) {
      const d = await getJSON(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=25&country=${country}`);
      t = d?.results && best(d.results.filter(x => x.previewUrl), song, x => x.trackName, x => x.artistName || '');
      if (t) break outer;
      await sleep(3100);
    }
  }
  itCache.set(song.id, t || null);
  return t || null;
}
async function itunes(song) {
  const t = await itunesTrack(song);
  return t?.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '600x600bb') : null;
}

const out = { ...prev };
const todo = SONGS.filter(s => !out[s.id]);
console.log(`${SONGS.length} chansons, ${todo.length} pochettes à chercher`);
let found = 0, i = 0;
async function worker() {
  while (i < todo.length) {
    const s = todo[i++];
    let c = await deezer(s);
    if (!c) { c = await itunes(s); await sleep(3100); } // iTunes : ~20 requêtes/min
    if (c) { out[s.id] = c; found++; }
    else console.log('introuvable :', s.id, s.title, '—', s.artist);
    await sleep(150);
  }
}
await Promise.all([worker(), worker(), worker()]);
const keys = SONGS.map(s => s.id).filter(id => out[id]);
const body = keys.map(id => `${JSON.stringify(id)}:${JSON.stringify(out[id])}`).join(',\n');
fs.writeFileSync(OUT, `/* Pompelup — vraies pochettes d'album (généré par scripts/fetch-covers.mjs, ne pas éditer) */\n/* « d:<md5> » = pochette Deezer, sinon URL iTunes. ${keys.length}/${SONGS.length} titres. */\nwindow.COVERS = {\n${body}\n};\n`);
console.log(`+${found} trouvées · total ${keys.length}/${SONGS.length}`);

// ---------- Extraits audio (iTunes : ~20 requêtes/min, on reprend là où on s'est arrêté) ----------
const POUT = 'previews.js', PREFIX = 'https://audio-ssl.itunes.apple.com/itunes-assets/';
const pprev = (() => { try { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(POUT, 'utf8'), c); return c.window.PREVIEWS || {}; } catch (e) { return {}; } })();
const pout = { ...pprev };
const ptodo = SONGS.filter(s => !pout[s.id]);
console.log(`${ptodo.length} extraits à chercher`);
const writeP = () => {
  const ks = SONGS.map(s => s.id).filter(id => pout[id]);
  fs.writeFileSync(POUT, `/* Pompelup — extraits audio iTunes (généré par scripts/fetch-covers.mjs, ne pas éditer) */\n/* Chemin relatif à ${PREFIX} sauf URL complète. ${ks.length}/${SONGS.length} titres. */\nwindow.PREVIEWS = {\n${ks.map(id => `${JSON.stringify(id)}:${JSON.stringify(pout[id])}`).join(',\n')}\n};\n`);
};
const deadline = Date.now() + 75 * 60 * 1000;
let pn = 0;
for (const s of ptodo) {
  if (Date.now() > deadline) { console.log('temps écoulé : la suite au prochain passage'); break; }
  const t = await itunesTrack(s);
  if (t?.previewUrl) { pout[s.id] = t.previewUrl.startsWith(PREFIX) ? t.previewUrl.slice(PREFIX.length) : t.previewUrl; pn++; }
  if (pn % 50 === 0) writeP();
  await sleep(3100);
}
writeP();
console.log(`extraits : +${pn} · total ${Object.keys(pout).length}/${SONGS.length}`);
