/* ============================================
   Pompelup — personnages « blob velours » en 3D (Three.js)
   Formes douces modelées, matière velours floqué (reflet de bord + duvet), visages
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
    renderer.toneMapping = CFG.tm === 'aces' ? T.ACESFilmicToneMapping : T.NoToneMapping;
    renderer.toneMappingExposure = CFG.exp;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
  } catch (e) { ok = false; renderer = null; }
  return renderer;
}

const lin = c => new T.Color(c).convertSRGBToLinear();
// Éclairage doux sans tone mapping : couleurs franches et saturées comme la réf « dots »
const CFG = { tm: 'none', exp: 1, hemi: .4, key: .8, back: .55, fill: .12, rimPow: 2.4, rimMix: .6, rimL: .4 };
const trash = [];
const keep = o => (trash.push(o), o);

// Micro-relief du tissu : bruit très fin, à peine perceptible (fait « vibrer » le reflet)
let grainTex = null;
function grain() {
  if (grainTex) return grainTex;
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d'), d = x.createImageData(N, N);
  for (let i = 0; i < N * N; i++) { const v = 128 + (Math.random() - .5) * 90; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  x.putImageData(d, 0, 0);
  grainTex = new T.CanvasTexture(c);
  grainTex.wrapS = grainTex.wrapT = T.RepeatWrapping;
  grainTex.repeat.set(2.6, 1.3);
  return grainTex;
}
// Velours floqué : mat, couleur profonde de face, bords qui s'éclaircissent (duvet qui accroche la lumière)
function velvet(color) {
  const hsl = {}; new T.Color(color).getHSL(hsl);
  const rim = new T.Color().setHSL(hsl.h, Math.min(1, hsl.s * .85), Math.min(.92, hsl.l + (1 - hsl.l) * CFG.rimL)).convertSRGBToLinear();
  const m = keep(new T.MeshStandardMaterial({ color: lin(color), roughness: 1, metalness: 0, bumpMap: grain(), bumpScale: .006 }));
  m.userData.velvet = true;
  m.onBeforeCompile = sh => {
    sh.uniforms.uRim = { value: rim };
    sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', `
      float nv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
      float up = clamp(normal.y * .5 + .5, 0.0, 1.0);
      float fres = pow(1.0 - nv, ${CFG.rimPow.toFixed(2)}) * (.45 + .55 * up);
      outgoingLight = mix(outgoingLight, uRim * (.6 + .5 * up), clamp(fres * ${CFG.rimMix.toFixed(2)}, 0.0, 1.0));
      gl_FragColor = vec4( outgoingLight, diffuseColor.a );`);
  };
  return m;
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
// Rayon de la courbe de cœur selon l'angle (normalisé, creux et pointe adoucis)
const heartR = (() => {
  const n = 720, R = new Float32Array(n);
  for (let k = 0; k < 4000; k++) {
    const t = k / 4000 * Math.PI * 2, x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.5;
    const b = Math.floor((Math.atan2(y, x) + Math.PI) / (2 * Math.PI) * n) % n;
    R[b] = Math.max(R[b], Math.hypot(x, y));
  }
  for (let b = 0; b < n; b++) if (!R[b]) R[b] = (R[(b + n - 1) % n] + R[(b + 1) % n]) / 2 || 15;
  const mean = R.reduce((a, v) => a + v, 0) / n;
  const S = R.map((v, b) => { let a = 0; for (let o = -6; o <= 6; o++) a += R[(b + o + n) % n]; return 1 + (a / 13 / mean - 1) * .72; });
  return th => S[Math.floor((th + Math.PI) / (2 * Math.PI) * n) % n];
})();
const SHAPES = {
  // Dôme rond (la « tête d'œuf »)
  dome: () => blobGeo(v => { v.y *= 1.05; v.x *= 1.02; }),
  // Haricot large aux bords ondulés
  bean: () => blobGeo(v => { v.x *= 1.18; v.y *= .82; v.z *= .95; const a = Math.atan2(v.z, v.x); const w = 1 + .08 * Math.sin(a * 4 + .6) * Math.max(0, 1 - Math.abs(v.y)); v.x *= w; v.z *= w; }),
  // Goutte : sommet en pointe douce
  peak: () => blobGeo(v => { if (v.y > 0) { const t = v.y; v.x *= 1 - .62 * t * t; v.z *= 1 - .62 * t * t; v.y = t * 1.45; } v.x *= 1.08; }),
  // Grenouille : dôme bas, bosses des yeux ajoutées à part
  frog: () => blobGeo(v => { v.x *= 1.12; v.y *= .88; }),
  // Cœur : section en cœur (courbe classique adoucie), volume bombé
  heart: () => blobGeo(v => { const th = Math.atan2(v.y, v.x), rho = Math.hypot(v.x, v.y), R = heartR(th); v.x = Math.cos(th) * rho * R * 1.02; v.y = Math.sin(th) * rho * R + .12; v.z *= .8; }),
  // Nuage : bosses tout autour
  cloud: () => blobGeo(v => { const a = Math.atan2(v.y, v.x); const b = 1 + .09 * Math.max(0, Math.sin(a * 6)) * Math.max(0, v.y + .3); v.x *= 1.2 * b; v.y *= .95 * b; v.z *= b; }),
};
// Hauteur du sommet de chaque forme (pour poser les chapeaux)
const TOP = { dome: 1.05, bean: .82, peak: 1.45, frog: .88, heart: 1.05, cloud: 1.25 };
const WIDTH = { dome: 1.02, bean: 1.18, peak: 1.08, frog: 1.12, heart: 1.17, cloud: 1.2 };
const EYE_Y = { dome: .22, bean: .12, peak: .1, frog: .18, heart: .2, cloud: .18 };

/* ---------- surface réelle du corps ---------- */
// Des rayons trouvent la peau du personnage : yeux, lunettes et bijoux s'y posent quelle que soit la forme
const rc = ok ? new T.Raycaster() : null;
let S = null;
function surface(parts) {
  parts.forEach(p => p.updateMatrixWorld(true));
  const hit = (o, d) => { rc.set(o, d); const h = rc.intersectObjects(parts, false)[0]; return h ? h.point : null; };
  return {
    z: (x, y) => { const p = hit(new T.Vector3(x, y, 5), new T.Vector3(0, 0, -1)); return p ? p.z : .9; },
    x: y => { const p = hit(new T.Vector3(5, y, 0), new T.Vector3(-1, 0, 0)); return p ? p.x : 1; },
  };
}

/* ---------- visage ---------- */
function eyes(g, sk, mood, shape) {
  const ink = matte('#15101C'), y = EYE_Y[shape], sx = shape === 'bean' ? .34 : .3;
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
    const z = S.z(x, y);
    if (closed) {
      g.add(mesh(new T.TorusGeometry(.12, .026, 12, 32, Math.PI), ink, [x, y + (closed === 'up' ? -.02 : .05), z + .005], [0, 0, closed === 'up' ? 0 : Math.PI]));
      return;
    }
    const big = mood === 'wow';
    const eye = mesh(sph(big ? .13 : .11, 32, 24), gloss('#15101C', .12), [x, y, z - .015], null, [.82, big ? 1.45 : 1.3, .42]);
    g.add(eye);
    g.add(mesh(sph(.028, 12, 8), matte('#FFFFFF'), [x + .035, y + .07, z + .03]));
    if (mood === 'smirk') g.add(mesh(new T.CylinderGeometry(.1, .1, .03, 24, 1, false, 0, Math.PI), velvet(sk.color), [x, y + .06, z + .005], [Math.PI / 2, 0, 0]));
  });
  if (mood === 'talk' || mood === 'wow') g.add(mesh(sph(.06, 24, 16), matte('#3B0F1E'), [0, y - .2, S.z(0, y - .2) - .01], null, [1, mood === 'wow' ? 1.3 : .8, .4]));
  if (sk.blush) [-1, 1].forEach(s => g.add(mesh(sph(.07, 24, 16), (() => { const m = keep(new T.MeshStandardMaterial({ color: lin('#FF7A9C'), roughness: 1, transparent: true, opacity: .35 })); m.userData.noMask = true; return m; })(), [sx * s * 1.55, y - .14, S.z(sx * s * 1.55, y - .14) - .02], null, [1, .55, .3])));
}

/* ---------- accessoires ---------- */
// Hauteur où un chapeau tient (la pointe de la goutte est trop fine)
const HAT = { peak: 1.2 };
// Les formes larges portent des chapeaux plus larges
const HAT_W = { bean: 1.2, cloud: 1.12, heart: 1.06 };
function headAcc(g, a, top, shape) {
  const c = a.color, t = a.type, y = (HAT[shape] ?? top) - .05;
  if (t === 'beret') {
    const m = velvet(c), b = new T.Group();
    b.add(mesh(sph(1), m, null, null, [.98, .3, .92]));
    b.add(mesh(new T.CylinderGeometry(.035, .05, .16, 12), m, [0, .32, 0]));
    b.add(mesh(sph(.065, 16, 12), m, [0, .41, 0]));
    b.position.set(-.16, y - .08, -.04); b.rotation.set(-.12, 0, .3);
    g.add(b);
  }
  if (t === 'beanie') { const m = velvet(c); g.add(mesh(sph(.78, 64, 32), m, [0, y - .18, 0], null, [1, .85, 1])); g.add(mesh(new T.TorusGeometry(.7, .12, 16, 48), m, [0, y - .28, 0], [Math.PI / 2, 0, 0])); g.add(mesh(sph(.16), velvet('#FFFFFF'), [0, y + .52, 0])); }
  if (t === 'cap') { const m = matte(c); g.add(mesh(sph(.74, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), m, [0, y - .32, 0])); g.add(mesh(new T.CylinderGeometry(.62, .62, .05, 40, 1, false, -Math.PI / 2 - .9, 1.8), m, [0, y - .3, .38])); }
  if (t === 'bob') { const m = velvet(c); m.side = T.DoubleSide; const pr = [[0, .42], [.3, .41], [.5, .37], [.6, .28], [.64, .14], [.65, .04], [.72, -.01], [.86, -.08], [.98, -.15], [1.01, -.18]].map(([u, v]) => new T.Vector2(u, v)); g.add(mesh(new T.LatheGeometry(pr, 64), m, [0, y - .22, 0])); }
  if (t === 'fedora') { const m = matte(c); g.add(mesh(new T.CylinderGeometry(1.05, 1.05, .05, 48), m, [0, y - .18, 0])); g.add(mesh(new T.CylinderGeometry(.5, .56, .45, 40), m, [0, y + .05, 0])); g.add(mesh(new T.CylinderGeometry(.565, .565, .1, 40), matte('#F5F5F5'), [0, y - .1, 0])); }
  if (t === 'crown') { const m = gloss(c, .2); m.metalness = .6; g.add(mesh(new T.CylinderGeometry(.42, .38, .22, 40, 1, true), m, [0, y + .06, 0])); for (let k = 0; k < 5; k++) { const an = k / 5 * Math.PI * 2; g.add(mesh(new T.ConeGeometry(.1, .24, 16), m, [Math.cos(an) * .4, y + .28, Math.sin(an) * .4])); g.add(mesh(sph(.05, 12, 8), gloss(k % 2 ? '#EF4444' : '#38BDF8', .1), [Math.cos(an) * .41, y + .06, Math.sin(an) * .41])); } }
  if (t === 'halo') g.add(mesh(new T.TorusGeometry(.5, .06, 16, 48), keep(new T.MeshStandardMaterial({ color: lin(c), emissive: lin(c), emissiveIntensity: .8 })), [0, y + .4, 0], [Math.PI / 2 - .2, 0, 0]));
  if (t === 'helmet') { const m = keep(new T.MeshPhysicalMaterial({ color: lin(c), transparent: true, opacity: .22, roughness: .05, clearcoat: 1 })); m.userData.noMask = true; g.add(mesh(sph(1.3), m, [0, .1, 0])); }
  if (t === 'robot') g.add(mesh(sph(1.12), gloss(c, .2), [0, .05, 0]));
}
function eyeAcc(g, a, shape) {
  const c = a.color, t = a.type, y = EYE_Y[shape], sx = shape === 'bean' ? .32 : .28, z = Math.max(S.z(-sx, y), S.z(sx, y), S.z(0, y + .02)) + .06;
  const wire = matte(t === 'round' ? '#15101C' : c);
  if (t === 'round') { [-1, 1].forEach(s => g.add(mesh(new T.TorusGeometry(.19, .018, 12, 48), wire, [sx * s, y, z]))); g.add(mesh(new T.TorusGeometry(.07, .015, 8, 24, Math.PI), wire, [0, y + .02, z + .01])); }
  if (t === 'shades') { [-1, 1].forEach(s => g.add(mesh(new T.CylinderGeometry(.16, .16, .05, 40), gloss(c, .1), [sx * s, y, z], [Math.PI / 2, 0, 0]))); g.add(mesh(new T.CylinderGeometry(.015, .015, .2, 8), matte('#15101C'), [0, y + .03, z], [0, 0, Math.PI / 2])); }
  if (t === 'hearts') [-1, 1].forEach(s => { const sh = new T.Shape(); sh.moveTo(0, -.14); sh.bezierCurveTo(-.22, 0, -.14, .17, 0, .06); sh.bezierCurveTo(.14, .17, .22, 0, 0, -.14); g.add(mesh(new T.ExtrudeGeometry(sh, { depth: .04, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 3 }), gloss(c, .2), [sx * s, y, S.z(sx * s, y) + .02])); });
  if (t === 'stars') [-1, 1].forEach(s => { const sh = new T.Shape(); for (let k = 0; k < 10; k++) { const an = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? .07 : .17; k ? sh.lineTo(Math.cos(an) * r, Math.sin(an) * r) : sh.moveTo(Math.cos(an) * r, Math.sin(an) * r); } g.add(mesh(new T.ExtrudeGeometry(sh, { depth: .04, bevelEnabled: true, bevelThickness: .015, bevelSize: .012, bevelSegments: 3 }), gloss(c, .2), [sx * s, y, S.z(sx * s, y) + .02])); });
  if (t === 'visor') g.add(mesh(new T.CylinderGeometry(1.0, 1.0, .24, 48, 1, true, -1.1, 2.2), (() => { const v = keep(new T.MeshPhysicalMaterial({ color: lin(c), emissive: lin(c), emissiveIntensity: .45, transparent: true, opacity: .5, side: T.DoubleSide, roughness: .1, clearcoat: 1, depthWrite: false })); v.userData.noMask = true; return v; })(), [0, y + .02, .02], null, [WIDTH[shape] + .04, .92, 1.06]));
}
function earAcc(g, a, top, shape) {
  const m = gloss(a.color, .3), pad = velvet('#2A2433'), w = WIDTH[shape], R = Math.max(w, top) + .02;
  g.add(mesh(new T.TorusGeometry(R, .07, 16, 48, Math.PI), m, [0, 0, 0], null, [1, (top + .05) / R, 1]));
  [-1, 1].forEach(s => { g.add(mesh(new T.CylinderGeometry(.26, .26, .2, 32), m, [(w + .02) * s, .05, 0], [0, 0, Math.PI / 2])); g.add(mesh(new T.CylinderGeometry(.21, .21, .06, 32), pad, [(w - .08) * s, .05, 0], [0, 0, Math.PI / 2])); });
  if (a.glow) [-1, 1].forEach(s => g.add(mesh(new T.TorusGeometry(.26, .03, 8, 32), keep(new T.MeshStandardMaterial({ color: lin(a.color), emissive: lin(a.color), emissiveIntensity: 1 })), [(w + .13) * s, .05, 0], [0, Math.PI / 2, 0])));
}
// Hauteur du cou de chaque forme
const NECK_Y = { dome: -.34, bean: -.5, peak: -.36, frog: -.42, heart: -.3, cloud: -.38 };
function neckAcc(g, a, shape) {
  const c = a.color, t = a.type, ny = NECK_Y[shape], nw = S.x(ny), nz = S.z(0, ny), sx = nw / .95;
  if (t === 'bowtie') { const m = velvet(c), z = S.z(0, ny + .04); [-1, 1].forEach(s => g.add(mesh(new T.ConeGeometry(.12, .24, 24), m, [.12 * s, ny + .04, z + .01], [0, 0, s * Math.PI / 2]))); g.add(mesh(sph(.06), m, [0, ny + .04, z + .05])); }
  if (t === 'scarf' || t === 'bandana') { const m = velvet(c); g.add(mesh(new T.TorusGeometry(1, .1, 16, 64), m, [0, ny, 0], [Math.PI / 2, 0, 0], [nw * .98, nz * .97, 1])); if (t === 'scarf') g.add(mesh(new T.BoxGeometry(.22, .36, .1), m, [.32 * sx, ny - .18, S.z(.32 * sx, ny - .18) + .03], [-.2, 0, .12])); }
  if (t === 'chain' || t === 'medal') {
    const m = gloss(t === 'chain' ? c : '#FBBF24', .2); m.metalness = .7;
    const pts = []; for (let k = 0; k <= 24; k++) { const an = -Math.PI * .42 + k / 24 * Math.PI * .84, x = Math.sin(an) * .7 * sx, y = ny + .24 - Math.cos(an) * .26; pts.push(new T.Vector3(x, y, S.z(x, y) + .025)); }
    const curve = new T.CatmullRomCurve3(pts);
    g.add(mesh(new T.TubeGeometry(curve, 48, .012, 6), m));
    curve.getSpacedPoints(22).forEach(q => g.add(mesh(sph(.03, 12, 8), m, [q.x, q.y, q.z])));
    const mz = S.z(0, ny - .06) + .04;
    g.add(mesh(new T.CylinderGeometry(.13, .13, .045, 40), m, [0, ny - .06, mz], [Math.PI / 2 - .2, 0, 0]));
    if (t === 'medal') g.add(mesh(new T.CylinderGeometry(.075, .075, .05, 24), gloss(c, .2), [0, ny - .06, mz + .03], [Math.PI / 2 - .2, 0, 0]));
  }
}

/* ---------- scène ---------- */
function build(sk, opts) {
  const g = new T.Group(), shape = sk.shape || 'dome';
  const body = mesh(SHAPES[shape](), velvet(sk.color)), parts = [body];
  g.add(body);
  if (shape === 'cloud') [[-.62, .5], [0, .78], [.62, .5]].forEach(([x, y]) => { const b = mesh(sph(.5), velvet(sk.color), [x, y, -.1]); parts.push(b); g.add(b); });
  S = surface(parts);
  const accs = opts.accs || {}, top = TOP[shape];
  eyes(g, sk, opts.mood || 'happy', shape);
  if (accs.neck) neckAcc(g, accs.neck, shape);
  if (accs.eyes) eyeAcc(g, accs.eyes, shape);
  if (accs.ears) earAcc(g, accs.ears, top, shape);
  if (accs.head) { const hg = new T.Group(), hw = HAT_W[shape] || 1; headAcc(hg, accs.head, top, shape); hg.scale.set(hw, 1, hw); if (shape === 'frog') { hg.scale.setScalar(.8); hg.position.set(0, .32, -.25); } g.add(hg); }
  return g;
}

function render(sk, opts = {}) {
  const r = getRenderer();
  if (!r) return null;
  const head = !!opts.head, lying = !!opts.lying;
  const W = lying ? 520 : 400, H = lying ? 300 : head ? 400 : 440;
  r.setSize(W, H, false);
  const scene = new T.Scene();
  scene.add(new T.HemisphereLight(0xFFFFFF, 0x6B5A7A, CFG.hemi));
  const key = new T.DirectionalLight(0xFFF1E4, CFG.key); key.position.set(-2.5, 3.5, 4);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
  Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: .5, far: 12 });
  scene.add(key);
  const rim = new T.DirectionalLight(0xDCCBFF, CFG.back); rim.position.set(3, 2, -3); scene.add(rim);
  const fill = new T.DirectionalLight(0xFFFFFF, CFG.fill); fill.position.set(2, -1, 3); scene.add(fill);
  const ch = build(sk, opts);
  if (lying) { ch.scale.set(1.35, .72, 1); ch.rotation.set(0, -.15, 0); }
  else ch.rotation.set(.08, opts.turn ?? -.28, 0);
  ch.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(ch);
  // ombre de contact douce
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(20,10,30,.45)'); gr.addColorStop(1, 'rgba(20,10,30,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const st = keep(new T.CanvasTexture(c));
  if (!head) { const sm = keep(new T.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false })); sm.userData.noMask = true; scene.add(mesh(new T.PlaneGeometry(3.2, 1.3), sm, [0, lying ? -.52 : -.73, 0], [-Math.PI / 2, 0, 0])); }
  const cam = new T.PerspectiveCamera(head ? 26 : 30, W / H, .1, 50);
  if (lying) { cam.position.set(0, .5, 4.3); cam.lookAt(0, -.05, 0); }
  else if (head) { cam.position.set(0, .45, 5.4); cam.lookAt(0, .25, 0); }
  else { cam.position.set(0, .7, 6.4); cam.lookAt(0, .25, 0); }
  r.setClearColor(0, 0);
  r.render(scene, cam);
  const gl = r.getContext(), px = new Uint8Array(W * H * 4), mp = new Uint8Array(W * H * 4);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
  // Passe masque : blanc = velours, noir = le reste (yeux, lunettes, métal…)
  const white = keep(new T.MeshBasicMaterial({ color: 0xFFFFFF, toneMapped: false }));
  const black = keep(new T.MeshBasicMaterial({ color: 0x000000, toneMapped: false }));
  scene.traverse(o => { if (!o.isMesh) return; if (o.material.userData.noMask) o.visible = false; else o.material = o.material.userData.velvet ? white : black; });
  r.render(scene, cam);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, mp);
  while (trash.length) { try { trash.pop().dispose(); } catch (e) {} }
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const ox = out.getContext('2d'), img = ox.createImageData(W, H), d = img.data, mk = new Uint8Array(W * H);
  // WebGL lit de bas en haut, en alpha prémultiplié
  for (let y = 0; y < H; y++) {
    for (let x = 0, s = (H - 1 - y) * W * 4, i = y * W; x < W; x++, s += 4, i++) {
      const a = px[s + 3];
      mk[i] = mp[s];
      if (!a) continue;
      const u = 255 / a, j = i * 4;
      d[j] = px[s] * u; d[j + 1] = px[s + 1] * u; d[j + 2] = px[s + 2] * u; d[j + 3] = a;
    }
  }
  flock(d, mk, W, H, W / 400);
  ox.putImageData(img, 0, 0);
  // Safari n'encode pas le WebP : il renvoie alors directement du PNG
  return { url: out.toDataURL('image/webp', .93) };
}

/* ---------- matière floquée (post-traitement au pixel, sans API de tracé) ---------- */
// Mélange « source-over » d'un pixel (RGBA non prémultiplié) ; clip = masque optionnel
function over(d, W, H, x, y, r, g, b, sa, clip) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = y * W + x;
  if (clip) sa *= clip[i] / 255;
  if (sa <= .004) return;
  if (sa > 1) sa = 1;
  const j = i * 4, da = d[j + 3] / 255, oa = sa + da * (1 - sa), k = da * (1 - sa);
  d[j] = (r * sa + d[j] * k) / oa; d[j + 1] = (g * sa + d[j + 1] * k) / oa; d[j + 2] = (b * sa + d[j + 2] * k) / oa; d[j + 3] = oa * 255;
}
// Brin anti-aliasé : échantillons tous les .7 px répartis sur 4 pixels, pointe effilée
function strand(d, W, H, x, y, an, len, w, r, g, b, a, clip) {
  const cx = Math.cos(an), cy = Math.sin(an), n = Math.max(2, Math.ceil(len / .7)), q = a * Math.min(1, w) * .7;
  for (let s = 0; s <= n; s++) {
    const t = s / n, px = x + cx * len * t, py = y + cy * len * t, x0 = Math.floor(px), y0 = Math.floor(py), fx = px - x0, fy = py - y0, al = q * (1 - .55 * t);
    over(d, W, H, x0, y0, r, g, b, al * (1 - fx) * (1 - fy), clip);
    over(d, W, H, x0 + 1, y0, r, g, b, al * fx * (1 - fy), clip);
    over(d, W, H, x0, y0 + 1, r, g, b, al * (1 - fx) * fy, clip);
    over(d, W, H, x0 + 1, y0 + 1, r, g, b, al * fx * fy, clip);
  }
}
function flock(d, mk, W, H, k) {
  const N = W * H, A0 = new Uint8Array(N), edge = [];
  // Grain de velours : poudre très fine, sans taches
  for (let i = 0, j = 0; i < N; i++, j += 4) {
    A0[i] = d[j + 3];
    const m = mk[i] / 255;
    if (m < .08 || d[j + 3] < 40) continue;
    const f = 1 + (Math.random() - .5) * .07 * m;
    d[j] *= f; d[j + 1] *= f; d[j + 2] *= f;
  }
  // Pixels de bord du velours (voisin transparent)
  const A = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : A0[y * W + x];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (mk[i] < 128 || A0[i] < 150) continue;
    if (A0[i - 1] > 60 && A0[i + 1] > 60 && A0[i - W] > 60 && A0[i + W] > 60) continue;
    edge.push(i);
  }
  // Duvet : poils très courts et serrés, plus clairs que le tissu, qui adoucissent la silhouette
  for (const i of edge) {
    const x = i % W, y = (i / W) | 0;
    let nx = A(x - 1, y) - A(x + 1, y), ny = A(x, y - 1) - A(x, y + 1);
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (ny > .55 && Math.random() < .9) continue; // pas de duvet côté sol
    const j = i * 4, r0 = d[j], g0 = d[j + 1], b0 = d[j + 2];
    for (let c = 0; c < 2; c++) {
      const an = Math.atan2(ny, nx) + (Math.random() - .5) * 1.4, len = (.6 + Math.random() * 1.1) * k, t = .1 + Math.random() * .2;
      strand(d, W, H, x - nx * .8 * k, y - ny * .8 * k, an, len + .8 * k, 1,
        r0 + (255 - r0) * t, g0 + (255 - g0) * t, b0 + (255 - b0) * t, .22 + Math.random() * .25);
    }
  }
}

/* ---------- cache + file de rendu ---------- */
// BUDGET (en caractères) : laisse toujours de la place à la sauvegarde de la partie
const STORE = 'pompelup_blob3d_v3', KEEP = 16, BUDGET = 1.2e6;
const cache = new Map();
try { ['pompelup_blob3d_v1', 'pompelup_blob3d_v2'].forEach(k => localStorage.removeItem(k)); JSON.parse(localStorage.getItem(STORE) || '[]').forEach(([k, v]) => cache.set(k, v)); } catch (e) {}
let saveT = null;
function persist() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    const recent = [];
    let size = 0;
    for (const e of [...cache].reverse()) { size += e[1].url.length; if (recent.length >= KEEP || size > BUDGET) break; recent.unshift(e); }
    for (let n = recent.length; n > 0; n--) { try { localStorage.setItem(STORE, JSON.stringify(recent.slice(-n))); return; } catch (e) {} }
    try { localStorage.removeItem(STORE); } catch (e) {}
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
