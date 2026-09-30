// Embarque le jeu web (../) dans un seul fichier HTML autonome pour l'app native.
// Usage : node scripts/build-web.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, '../..');
const OUT = path.resolve(HERE, '../assets/web/index.html');
const MIME = { '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };

const read = p => fs.readFileSync(path.join(WEB, p), 'utf8');
const assets = {};
for (const dir of ['assets', 'fonts']) {
  for (const f of fs.readdirSync(path.join(WEB, dir))) {
    const mime = MIME[path.extname(f)];
    if (mime) assets[`${dir}/${f}`] = `data:${mime};base64,${fs.readFileSync(path.join(WEB, dir, f)).toString('base64')}`;
  }
}
const inlineAssets = t => Object.keys(assets).sort((a, b) => b.length - a.length).reduce((s, k) => s.split(k).join(assets[k]), t);

let html = read('index.html');
html = html.replace(/<link rel="(?:preload|manifest|icon|apple-touch-icon)"[^>]*>\n?/g, '');
html = html.replace(/<meta name="(?:apple-mobile-web-app-[a-z-]+|mobile-web-app-capable)"[^>]*>\n?/g, '');
html = html.replace(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g, (m, href) => href.startsWith('http') ? m : `<style>\n${inlineAssets(read(href))}\n</style>`);
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => src.startsWith('http') ? m : `<script>\n${inlineAssets(read(src)).split('</script>').join('<\\/script>')}\n</script>`);
html = inlineAssets(html);
html = html.replace('<body>', '<body class="is-native">');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
const left = [...html.matchAll(/<(?:script src|link rel="stylesheet" href)="([^"]+)"/g)].map(m => m[1]).filter(u => !u.startsWith('http'));
console.log(`web → ${path.relative(process.cwd(), OUT)} (${(html.length / 1e6).toFixed(2)} Mo)${left.length ? ' · références locales restantes : ' + left.join(', ') : ''}`);
