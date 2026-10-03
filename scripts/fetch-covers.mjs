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
// Correspondance stricte : même titre ET même artiste principal, jamais une reprise / karaoké
function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  let prev = Array.from({ length: a.length + 1 }, (_, j) => j);
  for (let i = 1; i <= b.length; i++) {
    const cur = [i];
    for (let j = 1; j <= a.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[a.length] / Math.max(a.length, b.length);
}
const BAD = /karaoke|tribute|cover|in the style|made famous|originally performed|instrumental|lullaby|8 bit|piano version|workout|re recorded|as made|sing along|backing track/;
const parts = a => norm(a).replace(/^the /, '').split(/ (?:feat|ft|featuring|and|x|et|with|vs) /).map(x => x.trim()).filter(Boolean);
function artistOk(cand, song) {
  const want = parts(song.artist)[0] || norm(song.artist), got = parts(cand), whole = ` ${norm(cand).replace(/^the /, '')} `;
  return got.includes(want) || similarity(got[0] || '', want) >= .88 || (want.length >= 4 && whole.includes(` ${want} `));
}
const ttl = s => norm(s).replace(/^the /, '');
function titleOk(cand, song) { const a = ttl(cand), b = ttl(song.title); return a === b || similarity(a, b) >= .85; }
function best(list, song, title, artist, extra = () => '') {
  const ok = list.filter(x => titleOk(title(x), song) && artistOk(artist(x), song) && !BAD.test(norm(`${title(x)} ${artist(x)} ${extra(x)}`)));
  const rank = x => (ttl(title(x)) === ttl(song.title) ? 2 : 0) + (/live|remix|edit|version|acoustic|demo|karaoke/i.test(`${title(x)} ${extra(x)}`) ? 0 : 1);
  return ok.sort((p, q) => rank(q) - rank(p))[0] || null;
}
async function deezerMatch(song) {
  for (const q of [`artist:"${song.artist}" track:"${song.title}"`, `${song.title} ${song.artist}`]) {
    const d = await getJSON(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=15`);
    const t = d?.data && best(d.data, song, x => x.title, x => x.artist?.name || '', x => x.album?.title || '');
    if (t?.album?.md5_image) return t;
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
      t = d?.results && best(d.results.filter(x => x.previewUrl), song, x => x.trackName, x => x.artistName || '', x => x.collectionName || '');
      if (t) break outer;
      await sleep(3100);
    }
  }
  itCache.set(song.id, t || null);
  return t || null;
}

// Méta : ce qui a été vérifié (artiste et titre trouvés) ; tout ce qui n'y est pas est re-vérifié
const MOUT = 'media-meta.json';
const meta = (() => { try { return JSON.parse(fs.readFileSync(MOUT, 'utf8')); } catch (e) { return { covers: {}, previews: {} }; } })();
const writeM = () => fs.writeFileSync(MOUT, JSON.stringify(meta, null, 0).replace(/},"/g, '},\n"'));

const out = { ...prev };
const todo = SONGS.filter(s => !meta.covers[s.id]);
console.log(`${SONGS.length} chansons, ${todo.length} pochettes à vérifier`);
let found = 0, i = 0;
const coverMiss = new Set();
async function worker() {
  while (i < todo.length) {
    const s = todo[i++];
    const d = await deezerMatch(s);
    if (d) { out[s.id] = `d:${d.album.md5_image}`; meta.covers[s.id] = { a: d.artist?.name, t: d.title, src: 'deezer' }; found++; }
    else coverMiss.add(s.id);
    await sleep(150);
  }
}
await Promise.all([worker(), worker(), worker()]);
const writeC = () => {
  const keys = SONGS.map(s => s.id).filter(id => out[id]);
  const body = keys.map(id => `${JSON.stringify(id)}:${JSON.stringify(out[id])}`).join(',\n');
  fs.writeFileSync(OUT, `/* Pompelup — vraies pochettes d'album (généré par scripts/fetch-covers.mjs, ne pas éditer) */\n/* « d:<md5> » = pochette Deezer, sinon URL iTunes. ${keys.length}/${SONGS.length} titres. */\nwindow.COVERS = {\n${body}\n};\n`);
};
writeC(); writeM();
console.log(`pochettes Deezer vérifiées : +${found}, ${coverMiss.size} à chercher sur iTunes`);

// ---------- Extraits audio (iTunes : ~20 requêtes/min, on reprend là où on s'est arrêté) ----------
const POUT = 'previews.js', PREFIX = 'https://audio-ssl.itunes.apple.com/itunes-assets/';
const pprev = (() => { try { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(POUT, 'utf8'), c); return c.window.PREVIEWS || {}; } catch (e) { return {}; } })();
const pout = { ...pprev };
// D'abord les titres jamais vérifiés, puis les pochettes manquantes
const ptodo = SONGS.filter(s => !meta.previews[s.id]);
console.log(`${ptodo.length} extraits à vérifier`);
const writeP = () => {
  const ks = SONGS.map(s => s.id).filter(id => pout[id]);
  fs.writeFileSync(POUT, `/* Pompelup — extraits audio iTunes (généré par scripts/fetch-covers.mjs, ne pas éditer) */\n/* Chemin relatif à ${PREFIX} sauf URL complète. ${ks.length}/${SONGS.length} titres. */\nwindow.PREVIEWS = {\n${ks.map(id => `${JSON.stringify(id)}:${JSON.stringify(pout[id])}`).join(',\n')}\n};\n`);
};
const deadline = Date.now() + 80 * 60 * 1000;
let pn = 0, removed = 0, k = 0;
for (const s of ptodo) {
  if (Date.now() > deadline) { console.log('temps écoulé : la suite au prochain passage'); break; }
  const t = await itunesTrack(s);
  if (t?.previewUrl) {
    pout[s.id] = t.previewUrl.startsWith(PREFIX) ? t.previewUrl.slice(PREFIX.length) : t.previewUrl;
    meta.previews[s.id] = { a: t.artistName, t: t.trackName };
    pn++;
    if (coverMiss.has(s.id) && t.artworkUrl100) { out[s.id] = t.artworkUrl100.replace('100x100bb', '600x600bb'); meta.covers[s.id] = { a: t.artistName, t: t.trackName, src: 'itunes' }; coverMiss.delete(s.id); }
  } else {
    // Introuvable avec le bon artiste : on retire l'extrait douteux plutôt que de jouer une autre chanson
    if (pout[s.id]) removed++;
    delete pout[s.id];
    meta.previews[s.id] = { none: true };
    console.log('pas d’extrait vérifié :', s.id, s.title, '—', s.artist);
  }
  if (coverMiss.has(s.id)) { delete out[s.id]; meta.covers[s.id] = { none: true }; coverMiss.delete(s.id); }
  if (++k % 40 === 0) { writeP(); writeC(); writeM(); }
}
writeP(); writeC(); writeM();
console.log(`extraits vérifiés : +${pn}, retirés : ${removed} · total ${Object.keys(pout).length}/${SONGS.length}`);
