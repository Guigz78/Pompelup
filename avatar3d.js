/* ============================================
   Pompelup — relief 3D des illustrations (Three.js + SVGLoader)
   Chaque forme de l'illustration devient une pièce extrudée aux bords
   arrondis, empilée en profondeur puis éclairée comme une figurine.
   Rendu une fois en image, mis en cache (et gardé d'une session à l'autre).
   ============================================ */
(() => {
'use strict';
const T = window.THREE;
let renderer = null, ok = !!(T && T.SVGLoader);

function getRenderer() {
  if (renderer || !ok) return renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.outputEncoding = T.sRGBEncoding;
  } catch (e) { ok = false; renderer = null; }
  return renderer;
}

const trash = [];
const keep = o => (trash.push(o), o);
function clean(svg) {
  return svg.replace(/<metadata[\s\S]*?<\/metadata>/, '').replace(/<mask[\s\S]*?<\/mask>/g, '')
    .replace(/ mask="[^"]*"/g, '').replace(/<text[\s\S]*?<\/text>/g, '').replace(/<filter[\s\S]*?<\/filter>/g, '').replace(/ filter="[^"]*"/g, '');
}
// Dégradé → couleur médiane (le relief et la lumière remplacent le dégradé)
function paintOf(value, doc) {
  if (!value || value === 'none' || value === 'transparent') return null;
  const m = /url\(#([^)]+)\)/.exec(value);
  if (m) {
    const el = doc && doc.getElementById(m[1]);
    const stops = el ? [...el.getElementsByTagName('stop')] : [];
    if (!stops.length) return null;
    return stops[Math.floor((stops.length - 1) / 2)].getAttribute('stop-color');
  }
  return value;
}

function build(svg) {
  const loader = new T.SVGLoader();
  const data = loader.parse(clean(svg));
  const doc = data.xml && data.xml.ownerDocument ? data.xml.ownerDocument : data.xml;
  const g = new T.Group();
  const vb = (/viewBox="([^"]+)"/.exec(svg) || [])[1];
  const size = vb ? Math.max(+vb.split(/[ ,]+/)[2], +vb.split(/[ ,]+/)[3]) : 480;
  const k = size / 480;                       // épaisseurs proportionnelles à la taille du dessin
  let layer = 0;
  for (const p of data.paths) {
    const st = p.userData.style, node = p.userData.node;
    const op = +(node.getAttribute('opacity') || 1) * (st.opacity ?? 1);
    const fill = paintOf(st.fill, doc);
    if (fill && op * (st.fillOpacity ?? 1) >= .5) {
      let col;
      try { col = new T.Color().setStyle(fill).convertSRGBToLinear(); } catch (e) { col = null; }
      if (col) {
        const mat = keep(new T.MeshStandardMaterial({ color: col, roughness: .48, metalness: 0 }));
        for (const sh of T.SVGLoader.createShapes(p)) {
          const geo = keep(new T.ExtrudeGeometry(sh, { depth: 2 * k, bevelEnabled: true, bevelThickness: 7 * k, bevelSize: 3.2 * k, bevelSegments: 6, curveSegments: 16 }));
          const me = new T.Mesh(geo, mat);
          me.position.z = layer * 3 * k;
          g.add(me);
        }
        layer++;
      }
    }
    const stroke = paintOf(st.stroke, doc);
    if (stroke && op * (st.strokeOpacity ?? 1) >= .5 && st.strokeWidth > 0) {
      let col; try { col = new T.Color().setStyle(stroke).convertSRGBToLinear(); } catch (e) { col = null; }
      if (col) {
        const mat = keep(new T.MeshStandardMaterial({ color: col, roughness: .5 }));
        for (const sp of p.subPaths) {
          const geo = T.SVGLoader.pointsToStroke(sp.getPoints(), st);
          if (geo) { keep(geo); const me = new T.Mesh(geo, mat); me.position.z = layer * 3 * k + 8 * k; g.add(me); }
        }
        layer++;
      }
    }
  }
  g.scale.y = -1;
  const holder = new T.Group();
  holder.add(g);
  const box = new T.Box3().setFromObject(holder);
  const c = box.getCenter(new T.Vector3()), dims = box.getSize(new T.Vector3());
  g.position.set(-c.x, -c.y, -c.z);
  return { holder, dims };
}

function render(svg, opts = {}) {
  const r = getRenderer();
  if (!r) return null;
  const { holder, dims } = build(svg);
  const tall = dims.y > dims.x * 1.25;
  const W = tall ? 300 : 400, H = tall ? 460 : 400;
  r.setSize(W, H, false);
  const turn = opts.turn ?? -.3;
  holder.rotation.set(.06, turn, 0);
  const scene = new T.Scene();
  scene.add(new T.HemisphereLight(0xFFFFFF, 0x9C7A6A, .62));
  const key = new T.DirectionalLight(0xFFF3E6, 1.05); key.position.set(-.5, .8, 1); scene.add(key);
  const fill = new T.DirectionalLight(0xDDE8FF, .35); fill.position.set(1, .1, .6); scene.add(fill);
  const rim = new T.DirectionalLight(0xFFFFFF, .5); rim.position.set(.6, .6, -1); scene.add(rim);
  scene.add(holder);
  const fov = 22, span = Math.max(dims.x / (W / H), dims.y) * 1.14;
  const cam = new T.PerspectiveCamera(fov, W / H, 1, 1e5);
  cam.position.set(0, 0, span / 2 / Math.tan(fov * Math.PI / 360) + dims.z);
  cam.lookAt(0, 0, 0);
  r.setClearColor(0x000000, 0);
  r.render(scene, cam);
  let url = r.domElement.toDataURL('image/webp', .92);
  if (!url.startsWith('data:image/webp')) url = r.domElement.toDataURL('image/png');
  while (trash.length) { try { trash.pop().dispose(); } catch (e) {} }
  return { url, tall };
}

/* ---------- cache + file de rendu ---------- */
const STORE = 'pompelup_bs3d_v2', KEEP = 16;
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
let pumping = false;
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const hashKey = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return 'a' + h.toString(36); };
function pump() {
  pumping = false;
  const t0 = performance.now();
  for (const [k, job] of queue) {
    queue.delete(k);
    let res = null;
    try { res = render(window.PompeChar.svgOf(job.sk, job.opts), job.opts); } catch (e) { console.warn('avatar3d', e); }
    const imgs = document.querySelectorAll(`img[data-ck="${k}"]`);
    if (!res) {
      const flat = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(window.PompeChar.svgOf(job.sk, job.opts));
      imgs.forEach(img => { img.src = flat; img.classList.add('is-ready'); });
      continue;
    }
    cache.set(k, res); persist();
    imgs.forEach(img => { img.src = res.url; img.classList.add('is-ready'); img.classList.toggle('char-tall', res.tall); });
    if (performance.now() - t0 > 30) break;
  }
  if (queue.size && !pumping) { pumping = true; requestAnimationFrame(pump); }
}
function html(sk, opts, rawKey) {
  const k = hashKey(rawKey);
  const alt = String(sk.name || '').replace(/"/g, '&quot;');
  if (cache.has(k)) { const v = cache.get(k); cache.delete(k); cache.set(k, v); return `<img class="char char3d is-ready${v.tall ? ' char-tall' : ''}" src="${v.url}" alt="${alt}" draggable="false">`; }
  if (!queue.has(k)) queue.set(k, { sk, opts });
  if (!pumping) { pumping = true; requestAnimationFrame(pump); }
  return `<img class="char char3d${sk.src ? ' char-tall' : ''}" data-ck="${k}" src="${BLANK}" alt="${alt}" draggable="false">`;
}

window.Pompe3D = { ok: () => ok && !!getRenderer(), html, render };
})();
