// Vérifie depuis GitHub (accès internet) qu'un échantillon d'extraits et de pochettes répond vraiment.
// Écrit media-check.json : statut HTTP, type de contenu et taille de chaque lien testé.
import fs from 'fs';
import vm from 'vm';
const load = (f, k) => { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(f, 'utf8'), c); return c.window[k] || {}; };
const P = load('previews.js', 'PREVIEWS'), C = load('covers.js', 'COVERS');
const pick = (o, n) => { const k = Object.keys(o); const step = Math.max(1, Math.floor(k.length / n)); return k.filter((_, i) => i % step === 0).slice(0, n); };
const pUrl = p => /^https?:/.test(p) ? p : `https://audio-ssl.itunes.apple.com/itunes-assets/${p}`;
const cUrl = c => c.startsWith('d:') ? `https://e-cdns-images.dzcdn.net/images/cover/${c.slice(2)}/500x500-000000-80-0-0.jpg` : c;
async function probe(url) {
  try {
    const r = await fetch(url, { headers: { Range: 'bytes=0-2047' } });
    const buf = Buffer.from(await r.arrayBuffer());
    return { ok: r.ok, status: r.status, type: r.headers.get('content-type'), bytes: buf.length, magic: buf.subarray(4, 12).toString('latin1') };
  } catch (e) { return { ok: false, status: 0, error: String(e) }; }
}
const out = { checkedAt: new Date().toISOString(), previews: {}, covers: {} };
for (const id of pick(P, 40)) out.previews[id] = await probe(pUrl(P[id]));
for (const id of pick(C, 20)) out.covers[id] = await probe(cUrl(C[id]));
const sum = o => `${Object.values(o).filter(x => x.ok).length}/${Object.keys(o).length}`;
out.summary = { previews: sum(out.previews), covers: sum(out.covers) };
fs.writeFileSync('media-check.json', JSON.stringify(out, null, 1));
console.log('extraits OK', out.summary.previews, '· pochettes OK', out.summary.covers);
