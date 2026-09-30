/* ============================================
   Pompelup — relief 3D des illustrations (Three.js)
   L'illustration est dessinée en texture ; une carte de relief est tirée de
   sa silhouette et de ses aplats (chaque zone de couleur se bombe), puis la
   figurine est éclairée et légèrement tournée. Rendu une fois, mis en cache.
   ============================================ */
(() => {
'use strict';
const T = window.THREE;
let renderer = null, ok = !!T;
function getRenderer() {
  if (renderer || !ok) return renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.outputEncoding = T.sRGBEncoding;
  } catch (e) { ok = false; renderer = null; }
  return renderer;
}

function loadImage(svg) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
// Flou rapide (box blur séparable) sur un tableau de flottants
function blur(src, w, h, r) {
  if (r < 1) return src;
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), d = 2 * r + 1;
  for (let y = 0; y < h; y++) { let s = 0; const row = y * w; for (let x = -r; x <= r; x++) s += src[row + Math.min(w - 1, Math.max(0, x))]; for (let x = 0; x < w; x++) { tmp[row + x] = s / d; s += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)]; } }
  for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]; for (let y = 0; y < h; y++) { out[y * w + x] = s / d; s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; } }
  return out;
}

async function render(svg, opts = {}) {
  const r = getRenderer();
  if (!r) return null;
  const img = await loadImage(svg);
  const vb = (/viewBox="([^"]+)"/.exec(svg) || [])[1];
  const [, , vw, vh] = vb ? vb.split(/[ ,]+/).map(Number) : [0, 0, 1, 1];
  const long = 640, W = Math.round(vw >= vh ? long : long * vw / vh), H = Math.round(vh >= vw ? long : long * vh / vw);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H);
  const px = x.getImageData(0, 0, W, H).data;
  // Hauteur : silhouette arrondie + chaque aplat de couleur bombé depuis ses bords
  const alpha = new Float32Array(W * H), edge = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) alpha[i] = px[i * 4 + 3] / 255;
  for (let yy = 1; yy < H - 1; yy++) for (let xx = 1; xx < W - 1; xx++) {
    const i = yy * W + xx, j = i * 4;
    let dmax = 0;
    for (const k of [i - 1, i + 1, i - W, i + W]) { const q = k * 4; const d = Math.abs(px[j] - px[q]) + Math.abs(px[j + 1] - px[q + 1]) + Math.abs(px[j + 2] - px[q + 2]); if (d > dmax) dmax = d; }
    edge[i] = dmax > 40 ? 1 : 0;
  }
  const inner = new Float32Array(W * H);
  const e1 = blur(edge, W, H, 3);
  for (let i = 0; i < W * H; i++) inner[i] = alpha[i] * (1 - Math.min(1, e1[i] * 2.2));
  const soft = blur(inner, W, H, 4), big = blur(alpha, W, H, 18);
  const hgt = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) hgt[i] = big[i] * .9 + soft[i] * .55;
  const nmap = new Uint8ClampedArray(W * H * 4), S = 9;
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
    const i = yy * W + xx;
    const hl = hgt[yy * W + Math.max(0, xx - 1)], hr = hgt[yy * W + Math.min(W - 1, xx + 1)], hu = hgt[Math.max(0, yy - 1) * W + xx], hd = hgt[Math.min(H - 1, yy + 1) * W + xx];
    let nx = (hl - hr) * S, ny = (hd - hu) * S, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    nmap[i * 4] = (nx * .5 + .5) * 255; nmap[i * 4 + 1] = (ny * .5 + .5) * 255; nmap[i * 4 + 2] = (nz * .5 + .5) * 255; nmap[i * 4 + 3] = 255;
  }
  const nc = document.createElement('canvas'); nc.width = W; nc.height = H; nc.getContext('2d').putImageData(new ImageData(nmap, W, H), 0, 0);
  const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
  const ntex = new T.CanvasTexture(nc);
  // Dos de la figurine : silhouette assombrie, légèrement décalée = épaisseur
  const back = document.createElement('canvas'); back.width = W; back.height = H;
  const bx = back.getContext('2d'); bx.drawImage(c, 0, 0); bx.globalCompositeOperation = 'source-in'; bx.fillStyle = 'rgba(40,20,50,.85)'; bx.fillRect(0, 0, W, H);
  const btex = new T.CanvasTexture(back);

  const aspect = W / H, pw = aspect >= 1 ? 2 : 2 * aspect, ph = aspect >= 1 ? 2 / aspect : 2;
  const scene = new T.Scene();
  scene.add(new T.HemisphereLight(0xFFFFFF, 0xB09080, .72));
  const key = new T.DirectionalLight(0xFFF4E8, .95); key.position.set(-1, 1.3, 1.6); scene.add(key);
  const rim = new T.DirectionalLight(0xFFFFFF, .35); rim.position.set(1.5, .5, .5); scene.add(rim);
  const grp = new T.Group();
  const geo = new T.PlaneGeometry(pw, ph);
  const front = new T.Mesh(geo, new T.MeshStandardMaterial({ map: tex, normalMap: ntex, normalScale: new T.Vector2(1.1, 1.1), transparent: true, alphaTest: .3, roughness: .55 }));
  grp.add(front);
  for (let k = 1; k <= 4; k++) { const m = new T.Mesh(geo, new T.MeshBasicMaterial({ map: btex, transparent: true, alphaTest: .3 })); m.position.set(.006 * k, -.004 * k, -.012 * k); grp.add(m); }
  grp.rotation.set(.05, opts.turn ?? -.22, 0);
  scene.add(grp);
  const OW = Math.round(W * .75), OH = Math.round(H * .75);
  r.setSize(OW, OH, false);
  const cam = new T.PerspectiveCamera(20, OW / OH, .1, 50);
  cam.position.set(0, 0, Math.max(pw / (OW / OH), ph) * 1.06 / 2 / Math.tan(10 * Math.PI / 180));
  cam.lookAt(0, 0, 0);
  r.setClearColor(0, 0);
  r.render(scene, cam);
  let url = r.domElement.toDataURL('image/webp', .92);
  if (!url.startsWith('data:image/webp')) url = r.domElement.toDataURL('image/png');
  [tex, ntex, btex, geo].forEach(o => o.dispose()); grp.children.forEach(m => m.material.dispose());
  return { url };
}

/* ---------- cache + file de rendu ---------- */
const STORE = 'pompelup_mus3d_v1', KEEP = 14;
const cache = new Map();
try { JSON.parse(localStorage.getItem(STORE) || '[]').forEach(([k, v]) => cache.set(k, v)); } catch (e) {}
let saveT = null;
function persist() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    const recent = [...cache].slice(-KEEP);
    for (let n = recent.length; n > 0; n--) { try { localStorage.setItem(STORE, JSON.stringify(recent.slice(-n))); return; } catch (e) {} }
  }, 800);
}
const queue = new Map();
let busy = false;
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const hashKey = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return 'm' + h.toString(36); };
async function pump() {
  if (busy) return;
  busy = true;
  while (queue.size) {
    const [k, job] = queue.entries().next().value;
    queue.delete(k);
    let res = null;
    const svg = window.PompeChar.svgOf(job.sk, job.opts);
    try { res = await render(svg, job.opts); } catch (e) { console.warn('avatar3d', e); }
    const imgs = document.querySelectorAll(`img[data-ck="${k}"]`);
    if (!res) { const flat = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); imgs.forEach(img => { img.src = flat; img.classList.add('is-ready'); }); continue; }
    cache.set(k, res); persist();
    imgs.forEach(img => { img.src = res.url; img.classList.add('is-ready'); });
    await new Promise(r => requestAnimationFrame(r));
  }
  busy = false;
}
function html(sk, opts, rawKey) {
  const k = hashKey(rawKey), alt = String(sk.name || '').replace(/"/g, '&quot;');
  const cls = `char char3d${opts.head ? ' char-head' : ''}`;
  if (cache.has(k)) { const v = cache.get(k); cache.delete(k); cache.set(k, v); return `<img class="${cls} is-ready" src="${v.url}" alt="${alt}" draggable="false">`; }
  if (!queue.has(k)) queue.set(k, { sk, opts });
  pump();
  return `<img class="${cls}" data-ck="${k}" src="${BLANK}" alt="${alt}" draggable="false">`;
}
window.Pompe3D = { ok: () => ok && !!getRenderer(), html, render };
})();
