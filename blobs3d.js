/* ============================================
   Pompelup — personnages « blob velours » en 3D (Three.js)
   Formes douces modelées, matière floquée (sheen + grain), visages
   minimalistes et accessoires en volume. Chaque combinaison est rendue
   une fois en image puis mise en cache (et gardée d'une session à l'autre).
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
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .9;
  } catch (e) { ok = false; renderer = null; }
  return renderer;
}

const lin = c => new T.Color(c).convertSRGBToLinear();
const trash = [];
const keep = o => (trash.push(o), o);

// Grain du flocage : bruit fin, réutilisé par tous les matériaux velours
let grainTex = null;
function grain() {
  if (grainTex) return grainTex;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), d = x.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = 110 + Math.random() * 145; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  x.putImageData(d, 0, 0);
  grainTex = new T.CanvasTexture(c);
  grainTex.wrapS = grainTex.wrapT = T.RepeatWrapping;
  grainTex.repeat.set(6, 6);
  return grainTex;
}
function velvet(color) {
  const base = new T.Color(color);
  const hsl = {}; base.getHSL(hsl);
  const sheen = new T.Color().setHSL(hsl.h, Math.min(1, hsl.s), Math.min(.8, hsl.l + .06));
  return keep(new T.MeshPhysicalMaterial({ color: lin(color), roughness: 1, metalness: 0, sheen: sheen.convertSRGBToLinear(), bumpMap: grain(), bumpScale: .018 }));
}
const gloss = (c, r = .25) => keep(new T.MeshPhysicalMaterial({ color: lin(c), roughness: r, clearcoat: .6, clearcoatRoughness: .2 }));
const matte = c => keep(new T.MeshStandardMaterial({ color: lin(c), roughness: .55 }));
function mesh(geo, mat, p, r, s) { keep(geo); const m = new T.Mesh(geo, mat); if (p) m.position.set(...p); if (r) m.rotation.set(...r); if (s) m.scale.set(...s); return m; }
const sph = (r, a = 64, b = 48) => new T.SphereGeometry(r, a, b);

/* ---------- corps ---------- */
// Sphère déformée : f(x,y,z) → nouveau point ; base aplatie pour poser au sol
function blobGeo(fn) {
  const g = new T.SphereGeometry(1, 96, 72), p = g.attributes.position, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); if (v.y < -.72) v.y = -.72 - (v.y + .72) * .08; p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals();
  return g;
}
const SHAPES = {
  // Dôme rond (la « tête d'œuf »)
  dome: () => blobGeo(v => { v.y *= 1.05; v.x *= 1.02; }),
  // Haricot large aux bords ondulés
  bean: () => blobGeo(v => { v.x *= 1.18; v.y *= .82; v.z *= .95; const a = Math.atan2(v.z, v.x); const w = 1 + .06 * Math.sin(a * 5) * Math.max(0, 1 - Math.abs(v.y)); v.x *= w; v.z *= w; }),
  // Goutte : sommet en pointe douce
  peak: () => blobGeo(v => { if (v.y > 0) { const t = v.y; v.x *= 1 - .62 * t * t; v.z *= 1 - .62 * t * t; v.y = t * 1.45; } v.x *= 1.08; }),
  // Grenouille : dôme bas, bosses des yeux ajoutées à part
  frog: () => blobGeo(v => { v.x *= 1.12; v.y *= .88; }),
  // Cœur : deux lobes au sommet
  heart: () => blobGeo(v => { v.x *= 1.12; v.y *= .92; }),
  // Nuage : bosses tout autour
  cloud: () => blobGeo(v => { const a = Math.atan2(v.y, v.x); const b = 1 + .09 * Math.max(0, Math.sin(a * 6)) * Math.max(0, v.y + .3); v.x *= 1.2 * b; v.y *= .95 * b; v.z *= b; }),
};
// Hauteur du sommet de chaque forme (pour poser les chapeaux)
const TOP = { dome: 1.05, bean: .82, peak: 1.45, frog: .88, heart: 1.12, cloud: 1.25 };
const WIDTH = { dome: 1.02, bean: 1.18, peak: 1.08, frog: 1.12, heart: 1.12, cloud: 1.2 };
const EYE_Y = { dome: .22, bean: .12, peak: .1, frog: .18, heart: .2, cloud: .18 };

/* ---------- visage ---------- */
function eyes(g, sk, mood, shape) {
  const ink = matte('#15101C'), y = EYE_Y[shape], z = shape === 'bean' ? .9 : .94, sx = shape === 'bean' ? .34 : .3;
  if (shape === 'frog') {
    // Yeux de grenouille : bosses velours + globes blancs
    const body = velvet(sk.color);
    [-1, 1].forEach(s => {
      g.add(mesh(sph(.34), body, [.4 * s, .72, .22]));
      if (mood === 'grin' || mood === 'sad') { g.add(mesh(new T.TorusGeometry(.12, .025, 12, 32, Math.PI), ink, [.4 * s, .78, .54], [0, 0, mood === 'sad' ? Math.PI : 0])); return; }
      g.add(mesh(sph(.22), gloss('#FFFFFF', .15), [.4 * s, .76, .44]));
      g.add(mesh(sph(.11), gloss('#15101C', .1), [.4 * s + .02 * s, .76, .63]));
      g.add(mesh(sph(.035), matte('#FFFFFF'), [.4 * s + .06 * s, .81, .72]));
    });
    return;
  }
  [-1, 1].forEach(s => {
    const x = sx * s;
    const closed = mood === 'grin' ? 'up' : mood === 'sad' ? 'down' : (mood === 'wink' && s > 0) ? 'up' : null;
    if (closed) {
      g.add(mesh(new T.TorusGeometry(.12, .026, 12, 32, Math.PI), ink, [x, y + (closed === 'up' ? -.02 : .05), z + .01], [0, 0, closed === 'up' ? 0 : Math.PI]));
      return;
    }
    const big = mood === 'wow';
    const eye = mesh(sph(big ? .13 : .11, 32, 24), gloss('#15101C', .12), [x, y, z], null, [.82, big ? 1.45 : 1.3, .42]);
    g.add(eye);
    g.add(mesh(sph(.028, 12, 8), matte('#FFFFFF'), [x + .035, y + .07, z + .045]));
    if (mood === 'smirk') g.add(mesh(new T.CylinderGeometry(.1, .1, .03, 24, 1, false, 0, Math.PI), velvet(sk.color), [x, y + .06, z + .02], [Math.PI / 2, 0, 0]));
  });
  if (mood === 'talk' || mood === 'wow') g.add(mesh(sph(.06, 24, 16), matte('#3B0F1E'), [0, y - .2, z - .02], null, [1, mood === 'wow' ? 1.3 : .8, .4]));
  if (sk.blush !== false) [-1, 1].forEach(s => g.add(mesh(sph(.07, 24, 16), keep(new T.MeshStandardMaterial({ color: lin('#FF7A9C'), roughness: 1, transparent: true, opacity: .35 })), [sx * s * 1.55, y - .14, z - .06], null, [1, .55, .3])));
}

/* ---------- accessoires ---------- */
function headAcc(g, a, top, shape) {
  const c = a.color, t = a.type, y = top - .05;
  if (t === 'beret') { const m = velvet(c); g.add(mesh(sph(.78), m, [-.12, y + .08, 0], [0, 0, .22], [1, .28, 1])); g.add(mesh(sph(.12), m, [-.08, y + .32, 0])); }
  if (t === 'beanie') { const m = velvet(c); g.add(mesh(sph(.78, 64, 32), m, [0, y - .18, 0], null, [1, .85, 1])); g.add(mesh(new T.TorusGeometry(.7, .12, 16, 48), m, [0, y - .28, 0], [Math.PI / 2, 0, 0])); g.add(mesh(sph(.16), velvet('#FFFFFF'), [0, y + .52, 0])); }
  if (t === 'cap') { const m = matte(c); g.add(mesh(sph(.74, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), m, [0, y - .32, 0])); g.add(mesh(new T.CylinderGeometry(.62, .62, .05, 40, 1, false, -Math.PI / 2 - .9, 1.8), m, [0, y - .3, .38])); }
  if (t === 'bob') { const m = velvet(c); g.add(mesh(sph(.7, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), m, [0, y - .28, 0])); g.add(mesh(new T.CylinderGeometry(.82, 1.02, .16, 48, 1, true), keep(new T.MeshPhysicalMaterial({ color: lin(c), roughness: 1, side: T.DoubleSide, sheen: new T.Color(0xffffff) })), [0, y - .3, 0])); }
  if (t === 'fedora') { const m = matte(c); g.add(mesh(new T.CylinderGeometry(1.05, 1.05, .05, 48), m, [0, y - .18, 0])); g.add(mesh(new T.CylinderGeometry(.5, .56, .45, 40), m, [0, y + .05, 0])); g.add(mesh(new T.CylinderGeometry(.565, .565, .1, 40), matte('#F5F5F5'), [0, y - .1, 0])); }
  if (t === 'crown') { const m = gloss(c, .2); m.metalness = .6; g.add(mesh(new T.CylinderGeometry(.42, .38, .22, 40, 1, true), m, [0, y + .06, 0])); for (let k = 0; k < 5; k++) { const an = k / 5 * Math.PI * 2; g.add(mesh(new T.ConeGeometry(.1, .24, 16), m, [Math.cos(an) * .4, y + .28, Math.sin(an) * .4])); g.add(mesh(sph(.05, 12, 8), gloss(k % 2 ? '#EF4444' : '#38BDF8', .1), [Math.cos(an) * .41, y + .06, Math.sin(an) * .41])); } }
  if (t === 'halo') g.add(mesh(new T.TorusGeometry(.5, .06, 16, 48), keep(new T.MeshStandardMaterial({ color: lin(c), emissive: lin(c), emissiveIntensity: .8 })), [0, y + .4, 0], [Math.PI / 2 - .2, 0, 0]));
  if (t === 'helmet') g.add(mesh(sph(1.3), keep(new T.MeshPhysicalMaterial({ color: lin(c), transparent: true, opacity: .22, roughness: .05, clearcoat: 1 })), [0, .1, 0]));
  if (t === 'robot') g.add(mesh(sph(1.12), gloss(c, .2), [0, .05, 0]));
}
function eyeAcc(g, a, shape) {
  const c = a.color, t = a.type, y = EYE_Y[shape], z = shape === 'bean' ? .98 : 1.0, sx = shape === 'bean' ? .32 : .28;
  const wire = matte(t === 'round' ? '#15101C' : c);
  if (t === 'round') { [-1, 1].forEach(s => g.add(mesh(new T.TorusGeometry(.19, .018, 12, 48), wire, [sx * s, y, z]))); g.add(mesh(new T.TorusGeometry(.07, .015, 8, 24, Math.PI), wire, [0, y + .02, z + .01])); }
  if (t === 'shades') { [-1, 1].forEach(s => g.add(mesh(new T.CylinderGeometry(.16, .16, .05, 40), gloss(c, .1), [sx * s, y, z], [Math.PI / 2, 0, 0]))); g.add(mesh(new T.CylinderGeometry(.015, .015, .2, 8), matte('#15101C'), [0, y + .03, z], [0, 0, Math.PI / 2])); }
  if (t === 'hearts') [-1, 1].forEach(s => { const sh = new T.Shape(); sh.moveTo(0, -.14); sh.bezierCurveTo(-.22, 0, -.14, .17, 0, .06); sh.bezierCurveTo(.14, .17, .22, 0, 0, -.14); g.add(mesh(new T.ExtrudeGeometry(sh, { depth: .04, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 3 }), gloss(c, .2), [sx * s, y, z - .02])); });
  if (t === 'stars') [-1, 1].forEach(s => { const sh = new T.Shape(); for (let k = 0; k < 10; k++) { const an = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? .07 : .17; k ? sh.lineTo(Math.cos(an) * r, Math.sin(an) * r) : sh.moveTo(Math.cos(an) * r, Math.sin(an) * r); } g.add(mesh(new T.ExtrudeGeometry(sh, { depth: .04, bevelEnabled: true, bevelThickness: .015, bevelSize: .012, bevelSegments: 3 }), gloss(c, .2), [sx * s, y, z - .02])); });
  if (t === 'visor') g.add(mesh(new T.CylinderGeometry(1.0, 1.0, .24, 48, 1, true, -1.1, 2.2), keep(new T.MeshPhysicalMaterial({ color: lin(c), emissive: lin(c), emissiveIntensity: .35, transparent: true, opacity: .9, side: T.DoubleSide, roughness: .1, clearcoat: 1 })), [0, y, .02], null, [WIDTH[shape] + .02, 1, 1.04]));
}
function earAcc(g, a, top, shape) {
  const m = gloss(a.color, .3), pad = velvet('#2A2433'), w = WIDTH[shape], R = Math.max(w, top) + .02;
  g.add(mesh(new T.TorusGeometry(R, .07, 16, 48, Math.PI), m, [0, 0, 0], null, [1, (top + .05) / R, 1]));
  [-1, 1].forEach(s => { g.add(mesh(new T.CylinderGeometry(.26, .26, .2, 32), m, [(w + .02) * s, .05, 0], [0, 0, Math.PI / 2])); g.add(mesh(new T.CylinderGeometry(.21, .21, .06, 32), pad, [(w - .08) * s, .05, 0], [0, 0, Math.PI / 2])); });
  if (a.glow) [-1, 1].forEach(s => g.add(mesh(new T.TorusGeometry(.26, .03, 8, 32), keep(new T.MeshStandardMaterial({ color: lin(a.color), emissive: lin(a.color), emissiveIntensity: 1 })), [(w + .13) * s, .05, 0], [0, Math.PI / 2, 0])));
}
function neckAcc(g, a, shape) {
  const c = a.color, t = a.type, w = WIDTH[shape];
  if (t === 'bowtie') { const m = velvet(c); [-1, 1].forEach(s => g.add(mesh(new T.ConeGeometry(.12, .24, 24), m, [.12 * s, -.3, .93], [0, 0, s * Math.PI / 2]))); g.add(mesh(sph(.06), m, [0, -.3, .97])); }
  if (t === 'scarf' || t === 'bandana') { const m = velvet(c); g.add(mesh(new T.TorusGeometry(1, .1, 16, 64), m, [0, -.34, 0], [Math.PI / 2, 0, 0], [w * .93, .9, 1])); if (t === 'scarf') g.add(mesh(new T.BoxGeometry(.22, .36, .1), m, [.32, -.52, .86], [-.2, 0, .12])); }
  if (t === 'chain' || t === 'medal') {
    const m = gloss(t === 'chain' ? c : '#FBBF24', .2); m.metalness = .7;
    const pts = []; for (let k = 0; k <= 24; k++) { const an = -Math.PI * .42 + k / 24 * Math.PI * .84; pts.push(new T.Vector3(Math.sin(an) * .6, -.1 - Math.cos(an) * .22, .82 + Math.cos(an) * .12)); }
    g.add(mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 48, .022, 8), m));
    g.add(mesh(new T.CylinderGeometry(.11, .11, .04, 32), m, [0, -.36, .95], [Math.PI / 2 - .2, 0, 0]));
    if (t === 'medal') g.add(mesh(new T.CylinderGeometry(.065, .065, .05, 24), gloss(c, .2), [0, -.36, .98], [Math.PI / 2 - .2, 0, 0]));
  }
}

/* ---------- scène ---------- */
function build(sk, opts) {
  const g = new T.Group(), shape = sk.shape || 'dome';
  const body = mesh(SHAPES[shape](), velvet(sk.color));
  g.add(body);
  if (shape === 'heart') [-1, 1].forEach(s => g.add(mesh(sph(.6), velvet(sk.color), [.46 * s, .5, -.12], null, [1, 1.05, .9])));
  if (shape === 'cloud') [[-.62, .5], [0, .78], [.62, .5]].forEach(([x, y]) => g.add(mesh(sph(.5), velvet(sk.color), [x, y, -.1])));
  const accs = opts.accs || {}, top = TOP[shape];
  eyes(g, sk, opts.mood || 'happy', shape);
  if (accs.neck) neckAcc(g, accs.neck, shape);
  if (accs.eyes) eyeAcc(g, accs.eyes, shape);
  if (accs.ears) earAcc(g, accs.ears, top, shape);
  if (accs.head) { const hg = new T.Group(); headAcc(hg, accs.head, top, shape); if (shape === 'frog') { hg.scale.setScalar(.8); hg.position.set(0, .32, -.25); } g.add(hg); }
  return g;
}

function render(sk, opts = {}) {
  const r = getRenderer();
  if (!r) return null;
  const head = !!opts.head, lying = !!opts.lying;
  const W = lying ? 520 : 400, H = lying ? 300 : head ? 400 : 440;
  r.setSize(W, H, false);
  const scene = new T.Scene();
  scene.add(new T.HemisphereLight(0xFFFFFF, 0x6B5A7A, .75));
  const key = new T.DirectionalLight(0xFFF1E4, 1.35); key.position.set(-2.5, 3.5, 4); scene.add(key);
  const rim = new T.DirectionalLight(0xDCCBFF, .9); rim.position.set(3, 2, -3); scene.add(rim);
  const fill = new T.DirectionalLight(0xFFFFFF, .3); fill.position.set(2, -1, 3); scene.add(fill);
  const ch = build(sk, opts);
  if (lying) { ch.scale.set(1.35, .72, 1); ch.rotation.set(0, -.15, 0); }
  else ch.rotation.set(.08, opts.turn ?? -.28, 0);
  scene.add(ch);
  // ombre de contact douce
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(20,10,30,.45)'); gr.addColorStop(1, 'rgba(20,10,30,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const st = keep(new T.CanvasTexture(c));
  if (!head) scene.add(mesh(new T.PlaneGeometry(3.2, 1.3), keep(new T.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false })), [0, lying ? -.52 : -.73, 0], [-Math.PI / 2, 0, 0]));
  const cam = new T.PerspectiveCamera(head ? 26 : 30, W / H, .1, 50);
  if (lying) { cam.position.set(0, .5, 4.3); cam.lookAt(0, -.05, 0); }
  else if (head) { cam.position.set(0, .45, 5.4); cam.lookAt(0, .25, 0); }
  else { cam.position.set(0, .7, 6.4); cam.lookAt(0, .25, 0); }
  r.setClearColor(0, 0);
  r.render(scene, cam);
  let url = r.domElement.toDataURL('image/webp', .92);
  if (!url.startsWith('data:image/webp')) url = r.domElement.toDataURL('image/png');
  while (trash.length) { try { trash.pop().dispose(); } catch (e) {} }
  return { url };
}

/* ---------- cache + file de rendu ---------- */
const STORE = 'pompelup_blob3d_v1', KEEP = 16;
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
const hashKey = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return 'b' + h.toString(36); };
function pump() {
  pumping = false;
  const t0 = performance.now();
  for (const [k, job] of queue) {
    queue.delete(k);
    let res = null;
    try { res = render(job.sk, job.opts); } catch (e) { console.warn('blobs3d', e); }
    const imgs = document.querySelectorAll(`img[data-ck="${k}"]`);
    if (!res) { const flat = window.PompeChar.flatURL(job.sk, job.opts); imgs.forEach(img => { img.src = flat; img.classList.add('is-ready'); }); continue; }
    cache.set(k, res); persist();
    imgs.forEach(img => { img.src = res.url; img.classList.add('is-ready'); });
    if (performance.now() - t0 > 28) break;
  }
  if (queue.size && !pumping) { pumping = true; requestAnimationFrame(pump); }
}
function html(sk, opts, rawKey) {
  const k = hashKey(rawKey), alt = String(sk.name || '').replace(/"/g, '&quot;');
  const cls = `char char3d${opts.head ? ' char-head' : ''}${opts.lying ? ' char-lying' : ''}`;
  if (cache.has(k)) { const v = cache.get(k); cache.delete(k); cache.set(k, v); return `<img class="${cls} is-ready" src="${v.url}" alt="${alt}" draggable="false">`; }
  if (!queue.has(k)) queue.set(k, { sk, opts });
  if (!pumping) { pumping = true; requestAnimationFrame(pump); }
  return `<img class="${cls}" data-ck="${k}" src="${BLANK}" alt="${alt}" draggable="false">`;
}
window.Pompe3D = { ok: () => ok && !!getRenderer(), html, render };
})();
