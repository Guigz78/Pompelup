// Diagnostic : pour les chansons sans extrait vérifié, que renvoient vraiment iTunes et Deezer ?
// Écrit media-report.json (statut HTTP, nombre de résultats, 6 premiers titres/artistes).
// Usage : node scripts/diagnose-media.mjs   (GitHub Action « media-diagnose »)
import fs from 'fs';
import vm from 'vm';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('songs.js', 'utf8'), ctx);
const SONGS = ctx.window.SONGS;
const meta = JSON.parse(fs.readFileSync('media-meta.json', 'utf8'));
const ids = (process.env.IDS || '').split(',').filter(Boolean);
const list = ids.length ? SONGS.filter(s => ids.includes(s.id)) : SONGS.filter(s => meta.previews[s.id]?.none);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function probe(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Pompelup diagnose (github.com/Guigz78/Pompelup)' } });
    const txt = await r.text();
    let j = null; try { j = JSON.parse(txt); } catch (e) {}
    return { status: r.status, j, head: j ? undefined : txt.slice(0, 120) };
  } catch (e) { return { status: 0, err: String(e).slice(0, 120) }; }
}
const report = [];
console.log(`${list.length} chansons à diagnostiquer`);
for (const s of list) {
  const clean = s.title.replace(/\(.*?\)|\[.*?\]/g, '').trim(), row = { id: s.id, title: s.title, artist: s.artist, genre: s.genre, year: s.year };
  for (const [key, country, term] of [['it_fr', 'fr', `${clean} ${s.artist}`], ['it_us', 'us', `${clean} ${s.artist}`], ['it_title', 'fr', clean]]) {
    const r = await probe(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=10&country=${country}`);
    row[key] = { st: r.status, n: r.j?.resultCount, top: (r.j?.results || []).slice(0, 6).map(x => `${x.trackName} — ${x.artistName}${x.previewUrl ? '' : ' [sans extrait]'}`), head: r.head, err: r.err };
    await sleep(3500);
  }
  const d = await probe(`https://api.deezer.com/search?q=${encodeURIComponent(`${clean} ${s.artist}`)}&limit=6`);
  row.dz = { st: d.status, n: d.j?.total, top: (d.j?.data || []).slice(0, 6).map(x => `${x.title} — ${x.artist?.name}`), error: d.j?.error?.message };
  const dt = await probe(`https://api.deezer.com/search?q=${encodeURIComponent(clean)}&limit=6`);
  row.dz_title = { st: dt.status, n: dt.j?.total, top: (dt.j?.data || []).slice(0, 6).map(x => `${x.title} — ${x.artist?.name}`) };
  report.push(row);
  if (report.length % 10 === 0) { fs.writeFileSync('media-report.json', JSON.stringify(report, null, 1)); console.log(report.length, 'faites'); }
}
fs.writeFileSync('media-report.json', JSON.stringify(report, null, 1));
console.log('rapport écrit :', report.length);
