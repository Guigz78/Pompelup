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
  // les humains portent du vrai tissu ; les créatures en velours gardent le velours
  const soft = col => shape === 'human' ? fabric(col, .95) : velvet(col);
  if (t === 'beret') {
    const m = soft(c), b = new T.Group();
    b.add(mesh(sph(1), m, null, null, [.98, .3, .92]));
    b.add(mesh(new T.CylinderGeometry(.035, .05, .16, 12), m, [0, .32, 0]));
    b.add(mesh(sph(.065, 16, 12), m, [0, .41, 0]));
    b.position.set(-.16, y - .08, -.04); b.rotation.set(-.12, 0, .3);
    g.add(b);
  }
  if (t === 'beanie') { const m = velvet(c); g.add(mesh(sph(.78, 64, 32), m, [0, y - .18, 0], null, [1, .85, 1])); g.add(mesh(new T.TorusGeometry(.7, .12, 16, 48), m, [0, y - .28, 0], [Math.PI / 2, 0, 0])); g.add(mesh(sph(.16), velvet('#FFFFFF'), [0, y + .52, 0])); }
  if (t === 'cap') { const m = matte(c); g.add(mesh(sph(.74, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), m, [0, y - .32, 0])); g.add(mesh(new T.CylinderGeometry(.62, .62, .05, 40, 1, false, -Math.PI / 2 - .9, 1.8), m, [0, y - .3, .38])); }
  if (t === 'bob') { const m = soft(c); m.side = T.DoubleSide; const pr = [[0, .42], [.3, .41], [.5, .37], [.6, .28], [.64, .14], [.65, .04], [.72, -.01], [.86, -.08], [.98, -.15], [1.01, -.18]].map(([u, v]) => new T.Vector2(u, v)); g.add(mesh(new T.LatheGeometry(pr, 64), m, [0, y - .22, 0])); }
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
  if (sk.kind === 'human') return buildHuman(sk, opts);
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

/* ---------- humains façon « RV There Yet? », version détaillée ----------
   Gros visage large et peau d'argile douce, mais des détails partout : yeux vivants
   (iris peint, pupille, reflets, paupière), sourcils effilés, bouche modelée (dents,
   langue), joues roses, cheveux sculptés en mèches qui épousent le crâne, mains avec
   doigts et pouce, cols, poignets, semelles, tissu tissé. Le sol est à y = 0. */
TOP.human = 2.78; WIDTH.human = .96; EYE_Y.human = 2.2; NECK_Y.human = 1.4; HAT.human = 2.68; HAT_W.human = 1.22;
const clay = (c, r = .8) => keep(new T.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: 0 }));
// Teintes : mélange sRGB, plus sombre (t < 0) ou plus clair (t > 0)
const mix = (a, b, t) => '#' + new T.Color(a).lerp(new T.Color(b), t).getHexString();
const shade = (c, t) => mix(c, t < 0 ? '#000000' : '#FFFFFF', Math.abs(t));
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Tissu : armure toile très fine en relief (se voit de près, adoucit les aplats)
let weaveTex = null;
function weave() {
  if (weaveTex) return weaveTex;
  const N = 128, F = 32, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d'), d = x.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = Math.sin(i / N * Math.PI * 2 * F), v = Math.sin(j / N * Math.PI * 2 * F);
    const over = ((Math.floor(i / N * F) + Math.floor(j / N * F)) & 1) ? u : v;
    const k = (j * N + i) * 4; d.data[k] = d.data[k + 1] = d.data[k + 2] = 128 + over * 40 + (Math.random() - .5) * 26; d.data[k + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  weaveTex = new T.CanvasTexture(c); weaveTex.wrapS = weaveTex.wrapT = T.RepeatWrapping; weaveTex.repeat.set(4, 4);
  return weaveTex;
}
const fabric = (c, r = .88) => { const m = clay(c, r); m.bumpMap = weave(); m.bumpScale = .0035; return m; };
// Peau : argile douce, lumière qui « passe » sur les bords (effet de transparence chaude)
function skinMat(c, warm = 0) {
  const m = keep(new T.MeshStandardMaterial({ color: lin(warm ? mix(c, '#F2806E', warm) : c), roughness: .62 }));
  m.emissive = lin(c).multiplyScalar(.05);
  const rim = lin(mix(c, '#FF9C80', .45));
  m.onBeforeCompile = sh => {
    sh.uniforms.uRim = { value: rim };
    sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', `
      float nv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
      outgoingLight += uRim * pow(1.0 - nv, 2.6) * .3;
      gl_FragColor = vec4( outgoingLight, diffuseColor.a );`);
  };
  m.customProgramCacheKey = () => 'skin-rim';
  return m;
}
// Mèches fines en relief : rayures le long des méridiens (u), légèrement ondulées, densité irrégulière
let strandTex = null;
function strands() {
  if (strandTex) return strandTex;
  const W = 1024, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), d = x.createImageData(W, H), ph = [0, 1, 2, 3].map(() => Math.random() * 6.28);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const u = i / W * Math.PI * 2 + Math.sin(j / H * 9 + i * .002) * .012;
    const v = .5 * Math.sin(u * 140 + ph[0]) + .3 * Math.sin(u * 61 + ph[1]) + .2 * Math.sin(u * 233 + ph[2]) + .25 * Math.sin(u * 23 + ph[3]);
    const k = (j * W + i) * 4; d.data[k] = d.data[k + 1] = d.data[k + 2] = 128 + v * 70 + (Math.random() - .5) * 18; d.data[k + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  strandTex = new T.CanvasTexture(c); strandTex.wrapS = T.RepeatWrapping; strandTex.wrapT = T.ClampToEdgeWrapping;
  return strandTex;
}
// Cheveux : reflet brillant, mèches fines en relief
const hairMat = (c, curls) => { const m = keep(new T.MeshPhysicalMaterial({ color: lin(c), roughness: .46, metalness: 0, clearcoat: .3, clearcoatRoughness: .5 })); m.bumpMap = curls ? grain() : strands(); m.bumpScale = curls ? .012 : .009; return m; };
function capsule(r, mat, from, to, seg = 20) {
  const a = new T.Vector3(...from), b = new T.Vector3(...to), dir = b.clone().sub(a), g = new T.Group();
  const cyl = mesh(new T.CylinderGeometry(r, r, dir.length(), seg), mat);
  cyl.position.copy(a).add(b).multiplyScalar(.5);
  cyl.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
  g.add(cyl, mesh(sph(r, seg, 14), mat, from), mesh(sph(r, seg, 14), mat, to));
  return g;
}
// Tube effilé le long d'une courbe (sourcils, cils, paupières, mèches), bouts arrondis
function taper(points, r0, r1, seg = 24, rad = 10, round = .35) {
  const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
  const g = new T.TubeGeometry(curve, seg, 1, rad, false), p = g.attributes.position, v = new T.Vector3(), c = new T.Vector3();
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, r = (r0 + (r1 - r0) * t) * Math.max(.18, Math.sin(Math.PI * (.03 + t * .94)) ** round);
    curve.getPointAt(t, c);
    for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c); p.setXYZ(k, v.x, v.y, v.z); }
  }
  g.computeVertexNormals();
  return g;
}
const HC = [0, 2.12, 0], HS = [.95, .78, .8];   // centre et échelle de la tête
// Tête « bloc arrondi » : sphère gonflée vers le cube (super-ellipsoïde), joues pleines en bas
function headGeo(ws = 64, hs = 48) {
  const g = new T.SphereGeometry(1, ws, hs), p = g.attributes.position, v = new T.Vector3(), e = .62;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.set(Math.sign(v.x) * Math.abs(v.x) ** e, Math.sign(v.y) * Math.abs(v.y) ** e, Math.sign(v.z) * Math.abs(v.z) ** e);
    v.multiplyScalar(.86);
    if (v.y < 0) { const k = 1 + .1 * Math.min(1, -v.y * 1.4); v.x *= k; v.z *= 1 + .05 * Math.min(1, -v.y); }
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
// Avant du visage, calculé avec la même formule que headGeo (exact et instantané)
function headZ(x, y) {
  const X = (x - HC[0]) / HS[0], Y = (y - HC[1]) / HS[1], e = .62;
  const k = Y < 0 ? 1 + .1 * Math.min(1, -Y * 1.4) : 1, kz = Y < 0 ? 1 + .05 * Math.min(1, -Y) : 1;
  const uy = Math.min(1, Math.abs(Y) / .86) ** (1 / e), ux = Math.min(1, Math.abs(X) / (.86 * k)) ** (1 / e);
  return HC[2] + .86 * Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy)) ** e * kz * HS[2];
}
// Coupe chaque triangle en 4, n fois (une forme plate épouse ensuite bien la courbure)
function subdiv(geo, n) {
  let g = geo.index ? geo.toNonIndexed() : geo;
  for (let it = 0; it < n; it++) {
    const a = g.attributes.position.array, out = new Float32Array(a.length * 4), P = k => [a[k], a[k + 1], a[k + 2]];
    let o = 0;
    for (let i = 0; i < a.length; i += 9) {
      const A = P(i), B = P(i + 3), C = P(i + 6), m = (u, w) => [(u[0] + w[0]) / 2, (u[1] + w[1]) / 2, (u[2] + w[2]) / 2], ab = m(A, B), bc = m(B, C), ca = m(C, A);
      for (const tri of [[A, ab, ca], [ab, B, bc], [ca, bc, C], [ab, bc, ca]]) for (const q of tri) { out[o++] = q[0]; out[o++] = q[1]; out[o++] = q[2]; }
    }
    g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(out, 3));
  }
  return g;
}
// Décalcomanie : forme 2D posée sur la peau du visage (bouche, dents, joues, taches de rousseur)
function decal(shape, cx, cy, mat, dz = .004, seg = 14) {
  const geo = subdiv(new T.ShapeGeometry(shape, seg), 3), p = geo.attributes.position, nr = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + cx, y = p.getY(i) + cy; p.setXYZ(i, x, y, headZ(x, y) + dz); nr[i * 3 + 2] = 1; }
  geo.setAttribute('normal', new T.BufferAttribute(nr, 3));
  return mesh(geo, mat);
}
const ellipse = (rx, ry) => { const s = new T.Shape(); s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0); return s; };

/* ----- yeux ----- */
// Iris peint : dégradé, rayons, anneau sombre, pupille
const irisCache = new Map();
function irisTex(c) {
  if (irisCache.has(c)) return irisCache.get(c);
  const N = 128, R = N / 2, cv = document.createElement('canvas'); cv.width = cv.height = N;
  const x = cv.getContext('2d'), gr = x.createRadialGradient(R, R * .9, 0, R, R, R);
  gr.addColorStop(0, shade(c, -.5)); gr.addColorStop(.38, shade(c, .18)); gr.addColorStop(.74, c); gr.addColorStop(.9, shade(c, -.4)); gr.addColorStop(1, shade(c, -.75));
  x.fillStyle = shade(c, -.75); x.fillRect(0, 0, N, N);
  x.fillStyle = gr; x.beginPath(); x.arc(R, R, R, 0, 7); x.fill();
  x.strokeStyle = shade(c, .55); x.lineWidth = 1.3; x.globalAlpha = .22;
  for (let k = 0; k < 44; k++) { const a = k / 44 * Math.PI * 2; x.beginPath(); x.moveTo(R + Math.cos(a) * R * .4, R + Math.sin(a) * R * .4); x.lineTo(R + Math.cos(a + .05) * R * .84, R + Math.sin(a + .05) * R * .84); x.stroke(); }
  x.globalAlpha = 1; x.fillStyle = '#0A0710'; x.beginPath(); x.arc(R, R, R * .42, 0, 7); x.fill();
  const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding;
  irisCache.set(c, t);
  return t;
}
// Sphère dont la face avant reçoit une image plaquée à plat (iris)
function frontMapped(seg = 32) {
  const g = new T.SphereGeometry(1, seg, seg * .75), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, .5 + p.getX(i) * .5, .5 + p.getY(i) * .5);
  return g;
}
const EYE = { rx: .118, ry: .148, rz: .055 };
// Point de la courbe du bord de l'œil (angle a), posé juste sur le blanc de l'œil
function eyeRim(a, k = 1, lift = .008) {
  const x = Math.cos(a) * EYE.rx * k, y = Math.sin(a) * EYE.ry * k;
  return [x, y, -.02 + EYE.rz * Math.sqrt(Math.max(0, 1 - (x / EYE.rx) ** 2 - (y / EYE.ry) ** 2)) + lift];
}
function humanEye(g, s, sk, mood, ink) {
  const x = .29 * s, y = EYE_Y.human, z = headZ(x, y), e = new T.Group();
  e.position.set(x, y, z); e.rotation.set(-.04, x * .55, 0);
  g.add(e);
  const closed = mood === 'grin' || (mood === 'wink' && s > 0);
  if (closed) {
    // œil fermé qui sourit : arc épais, cils au coin extérieur
    const pts = [-1, -.5, 0, .5, 1].map(t => [t * .118, .045 - Math.abs(t) ** 1.7 * .075 + .02, .03]);
    e.add(mesh(taper(pts, .02, .02, 20, 8, .5), ink));
    if (sk.lashes) e.add(mesh(taper([[.108 * s, -.01, .03], [.15 * s, .02, .035], [.17 * s, .06, .04]], .012, .005, 10, 6), ink));
    return;
  }
  const wow = mood === 'wow', big = wow ? 1.12 : 1;
  const sclera = keep(new T.MeshPhysicalMaterial({ color: lin('#FBF8F4'), roughness: .2, clearcoat: .8, clearcoatRoughness: .1 }));
  e.add(mesh(sph(1, 32, 24), sclera, [0, 0, -.02], null, [EYE.rx * big, EYE.ry * big, EYE.rz]));
  // iris : sphère plus petite qui affleure (regard légèrement vers le centre)
  const irisM = keep(new T.MeshPhysicalMaterial({ map: irisTex(sk.eyeColor || '#6B4428'), roughness: .25, clearcoat: 1, clearcoatRoughness: .06 }));
  const ir = wow ? .068 : .088, look = -s * .008;
  e.add(mesh(frontMapped(), irisM, [look, -.004, -.004], null, [ir, ir * 1.1, .05]));
  // reflets : un grand, un petit
  const shine = keep(new T.MeshBasicMaterial({ color: 0xFFFFFF }));
  e.add(mesh(sph(.024, 12, 8), shine, [look + .03, .045, .044]));
  e.add(mesh(sph(.012, 10, 6), shine, [look - .03, -.035, .043]));
  // paupière : trait sombre sur le haut de l'œil, plus épais vers l'extérieur
  const lidDrop = mood === 'sad' ? .5 : mood === 'smirk' ? .32 : 0;
  if (lidDrop) {
    // paupière de peau qui couvre le haut de l'œil (penchée vers l'extérieur si triste)
    const lid = new T.Group(), tilt = mood === 'sad' ? -.32 * s : .12 * s;
    lid.rotation.z = tilt;
    const th = Math.acos(1 - lidDrop * 1.6) ;
    lid.add(mesh(new T.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, th), skinMat(sk.skin || '#F5D2BE'), [0, 0, -.02], null, [EYE.rx * 1.07, EYE.ry * 1.07, EYE.rz * 1.18]));
    const ly = Math.cos(th) * EYE.ry * 1.07;
    lid.add(mesh(taper([-1, -.5, 0, .5, 1].map(t => [t * EYE.rx * Math.sqrt(1 - (ly / (EYE.ry * 1.07)) ** 2) * 1.02, ly, .03]), .012, .012, 16, 6, .6), ink));
    e.add(lid);
  } else {
    const rim = [];
    for (let k = 0; k <= 8; k++) rim.push(eyeRim(Math.PI * (.96 - k / 8 * .92), 1.04 * big));
    if (s < 0) rim.reverse();   // toujours du coin intérieur vers le coin extérieur
    e.add(mesh(taper(rim, .009, .018, 24, 8, .45), ink));
  }
  if (sk.lashes) [.0, .22, .44].forEach((a, k) => {
    const [px, py, pz] = eyeRim(a + .12, 1.04 * big), ox = Math.cos(a + .1), oy = Math.sin(a + .1) + .4;
    const sx = s > 0 ? 1 : -1;
    e.add(mesh(taper([[px * sx, py, pz], [(px + ox * .03) * sx, py + oy * .03, pz + .004], [(px + ox * .055) * sx, py + oy * .06 + .006, pz + .006]], .009, .004, 8, 5), ink));
  });
}
function humanBrow(g, s, sk, mood, mat) {
  const x0 = .14 * s, x1 = .43 * s, y = EYE_Y.human + .205;
  let lift = [0, .02, 0], inner = 0;
  if (mood === 'wow') lift = [.05, .07, .045];
  else if (mood === 'sad') { lift = [.05, .02, -.03]; }
  else if (mood === 'smirk') lift = s > 0 ? [.04, .07, .05] : [-.01, .0, -.01];
  else if (mood === 'grin') lift = [.02, .04, .02];
  else if (mood === 'talk') lift = [.01, .03, .01];
  const pts = [[x0, y + .014 + lift[0] + inner], [(x0 + x1) / 2, y + .036 + lift[1]], [x1, y + .004 + lift[2]]].map(([px, py]) => [px, py, headZ(px, py) + .012]);
  g.add(mesh(taper(pts, sk.brow === 'thin' ? .02 : .028, sk.brow === 'thin' ? .011 : .016, 20, 8, .5), mat));
}
// Bouche selon l'humeur : sourire ouvert (langue, dents pour les grands sourires), trait, « O »
function humanMouth(g, sk, mood) {
  const my = 1.845, lipC = sk.lips || mix(sk.skin || '#F5D2BE', '#7A2434', .62);
  const cav = keep(new T.MeshStandardMaterial({ color: lin('#4A1622'), roughness: .9 })), lip = clay(lipC, .55);
  const teeth = keep(new T.MeshStandardMaterial({ color: lin('#FFFDF8'), roughness: .35 })), tongue = keep(new T.MeshStandardMaterial({ color: lin('#E86A7E'), roughness: .55 }));
  const line = (pts, r0, r1, rnd = .5) => g.add(mesh(taper(pts.map(([px, py]) => [px, py, headZ(px, py) + .008]), r0, r1, 22, 8, rnd), lip));
  if (mood === 'sad') { line([-1, -.5, 0, .5, 1].map(t => [t * .11, my - .03 + (1 - Math.abs(t) ** 1.6) * .035]), .017, .017); return; }
  if (mood === 'smirk') { line([-1, -.5, 0, .5, 1].map(t => [t * .12 + .03, my + .005 + (t + 1) ** 2 * .012 - (1 - Math.abs(t)) * .01]), .016, .016); return; }
  const poly = pts => new T.Shape(pts.map(([x, y]) => new T.Vector2(x, y)));
  if (mood === 'wow') {
    const ox = .07, oy = .088, edge = x => Math.sqrt(Math.max(0, 1 - (x / ox) ** 2)) * oy;
    g.add(decal(ellipse(ox, oy), 0, my, cav, .003));
    const tw = ox * .55, top = [], bot = [];
    for (let k = 0; k <= 10; k++) { const x = -tw + 2 * tw * k / 10; top.push([x, edge(x) - .006]); bot.unshift([x * .94, edge(x) - .04]); }
    g.add(decal(poly([...top, ...bot]), 0, my, teeth, .005));
    g.add(decal(ellipse(ox * .62, oy * .36), 0, my - oy * .55, tongue, .0045));
    const ring = []; for (let k = 0; k <= 24; k++) { const a = k / 24 * Math.PI * 2; ring.push([Math.cos(a) * ox * 1.08, my + Math.sin(a) * oy * 1.06]); }
    line(ring, .015, .015, 0);
    return;
  }
  // sourire ouvert : bord du haut un peu creusé, fond arrondi
  const big = mood === 'grin', w = big ? .175 : mood === 'talk' ? .115 : .135, top = big ? .03 : .022, bot = big ? -.1 : mood === 'talk' ? -.065 : -.07;
  const edge = x => top - .026 * (1 - (x / w) ** 2);
  const sh = new T.Shape();
  sh.moveTo(-w, top); sh.quadraticCurveTo(0, top - .052, w, top);
  sh.bezierCurveTo(w * .9, bot * .9, -w * .9, bot * .9, -w, top);
  g.add(decal(sh, 0, my, cav, .003));
  // dents du haut, sans toucher les coins (grand sourire et parole)
  if (big || mood === 'talk') {
    const tw = w * .62, h = big ? .038 : .03, tp = [], bp = [];
    for (let k = 0; k <= 12; k++) { const x = -tw + 2 * tw * k / 12; tp.push([x, edge(x) - .004]); bp.unshift([x * .95, edge(x) - h]); }
    g.add(decal(poly([...tp, ...bp]), 0, my, teeth, .005));
  }
  g.add(decal(ellipse(w * .5, (top - bot) * .26), 0, my + bot * .6, tongue, .0045));
  // lèvre du haut et petites fossettes aux coins
  const lp = []; for (let k = 0; k <= 16; k++) { const x = -w + 2 * w * k / 16; lp.push([x, my + edge(x) + .003]); }
  line(lp, .012, .012);
  [-1, 1].forEach(s => line([[s * (w + .004), my + top - .022], [s * (w + .024), my + top + .004], [s * (w + .018), my + top + .028]], .009, .006));
}
function humanFace(g, sk, mood) {
  const ink = clay('#24181C', .5), browM = hairMat(shade(sk.hairColor || '#3B2A20', sk.hair === 'bald' ? -.1 : -.12));
  const skinC = sk.skin || '#F5D2BE', beard = sk.face === 'beard';
  [-1, 1].forEach(s => { humanEye(g, s, sk, mood, ink); humanBrow(g, s, sk, mood, browM); });
  // nez arrondi, un peu plus rosé
  g.add(mesh(sph(.12, 28, 20), skinMat(skinC, .14), [0, 2.035, headZ(0, 2.035) - .055], null, [1.18, .9, .86]));
  // joues roses
  const blush = keep(new T.MeshStandardMaterial({ color: lin('#FF6F8F'), roughness: 1, transparent: true, opacity: .26, depthWrite: false }));
  [-1, 1].forEach(s => g.add(decal(ellipse(.105, .062), .47 * s, 1.985, blush, .003, 16)));
  // taches de rousseur
  if (sk.freckles) { const fm = keep(new T.MeshStandardMaterial({ color: lin(shade(mix(skinC, '#8A4A2A', .5), -.05)), roughness: 1, transparent: true, opacity: .75, depthWrite: false }));
    [-1, 1].forEach(s => [[.36, 2.06], [.43, 2.02], [.5, 2.07], [.4, 1.97], [.55, 2.0], [.47, 1.95]].forEach(([fx, fy], k) => g.add(decal(ellipse(.014 - (k % 2) * .004, .012), fx * s, fy, fm, .004, 6)))); }
  if (!beard || mood === 'wow' || mood === 'talk') humanMouth(g, sk, mood);
  const hair = hairMat(sk.hairColor || '#3B2A20');
  // moustache en deux mèches recourbées
  if (sk.face === 'mustache' || beard) [-1, 1].forEach(s => {
    const pts = [[.0, 1.93], [.08 * s, 1.925], [.16 * s, 1.9], [.21 * s, 1.92]].map(([px, py]) => [px, py, headZ(px, py) + .02]);
    g.add(mesh(taper(pts, .05, .022, 20, 10, .5), hair));
  });
  if (beard) {
    // barbe : coque autour de la mâchoire, rainurée comme les cheveux
    const bg = new T.SphereGeometry(1, 56, 28, 0, Math.PI * 2, Math.PI * .58, Math.PI * .42), p = bg.attributes.position, v = new T.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.x, v.z); v.multiplyScalar(1 + .025 * Math.abs(Math.sin(a * 14))); p.setXYZ(i, v.x, v.y, v.z); }
    bg.computeVertexNormals();
    g.add(mesh(bg, hair, HC, [.2, 0, 0], [.88, .75, .81]));
  }
}

/* ----- cheveux sculptés : coque qui épouse le crâne, mèches en relief ----- */
// Ligne d'implantation H(φ) : devant / côtés / derrière (φ = 0 devant, ±π derrière)
const hairline = (front, side, back) => { const a1 = (front - back) / 2, m = (front + back) / 2, a0 = (m + side) / 2, a2 = (m - side) / 2; return phi => a0 + a1 * Math.cos(phi) + a2 * Math.cos(2 * phi); };
// Mèches qui retombent sur le front (festons), favoris devant les oreilles
const fringe = (phi, n, depth, span) => Math.abs(phi) > span ? 0 : depth * (.5 + .5 * Math.cos(n * phi)) * Math.cos(phi / span * Math.PI / 2);
const burns = (phi, depth) => depth * Math.exp(-(((Math.abs(phi) - 1.3) / .1) ** 2));
const HAIR = {
  short: { T: .055, f: (d, phi) => d.y - (hairline(.6, .16, -.4)(phi) - fringe(phi, 9, .1, .95) - burns(phi, .3)) },
  spiky: { T: .05, f: (d, phi) => d.y - (hairline(.62, .2, -.35)(phi) - burns(phi, .25)) },
  curly: { T: .13, curls: .06, round: [.98, 1.0, .95], f: (d, phi) => d.y - hairline(.56, .12, -.38)(phi) },
  afro: { T: .3, curls: .07, round: [1.24, 1.2, 1.16], f: (d, phi) => d.y - hairline(.54, .08, -.4)(phi) },
  bowl: { T: .095, groove: 1.3, f: (d, phi) => d.y - hairline(.36, .02, -.32)(phi) },
  long: { T: .07, f: (d, phi) => d.y - (.62 - .14 * Math.exp(-(((Math.abs(phi) - .42) / .2) ** 2)) - .85 * smooth(.62, 1.15, Math.abs(phi)) - .5 * smooth(1.3, 1.8, Math.abs(phi))) },
  ponytail: { T: .05, f: (d, phi) => d.y - hairline(.6, .15, -.25)(phi) },
  bun: { T: .05, f: (d, phi) => d.y - hairline(.6, .14, -.3)(phi) },
  braids: { T: .05, f: (d, phi) => d.y - hairline(.6, .1, -.3)(phi) },
  pompadour: { T: .05, f: (d, phi) => d.y - (hairline(.7, .3, -.35)(phi) - burns(phi, .35)) },
  mohawk: { T: .05, groove: .6, f: d => Math.min(d.y - .05, .2 - Math.abs(d.x)) },
};
// Matériau qui cache la coque hors de la zone de cheveux (attribut « hm »)
function maskMat(m) {
  m.onBeforeCompile = sh => {
    sh.vertexShader = 'attribute float hm;\nvarying float vHm;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vHm = hm;');
    sh.fragmentShader = 'varying float vHm;\n' + sh.fragmentShader.replace('void main() {', 'void main() {\n  if (vHm < 0.0) discard;');
  };
  m.customProgramCacheKey = () => 'hair-mask';
  return m;
}
const CURL = (k => Array.from({ length: 12 }, () => { const r = () => (k = (k * 16807) % 2147483647) / 2147483647, a = r() * 6.28, b = Math.acos(r() * 2 - 1), f = 34 + r() * 14; return [Math.cos(a) * Math.sin(b) * f, Math.cos(b) * f, Math.sin(a) * Math.sin(b) * f, r() * 6.28]; }))(11);
function hairShell(spec, mat) {
  const g = headGeo(160, 110), p = g.attributes.position, n = g.attributes.normal, N = p.count, hm = new Float32Array(N), col = new Float32Array(N * 3).fill(1);
  const v = new T.Vector3(), nn = new T.Vector3(), d = new T.Vector3(), amp = .034 * (spec.groove ?? 1);
  for (let i = 0; i < N; i++) {
    v.fromBufferAttribute(p, i); nn.fromBufferAttribute(n, i); d.copy(v).normalize();
    const phi = Math.atan2(d.x, d.z), f = spec.f(d, phi);
    hm[i] = f;   // signé : la limite (f = 0) reste lisse une fois interpolée
    if (f < -.08) continue;
    // mèches : sillons qui partent du sommet, plus marqués loin du sommet ; bord arrondi qui rejoint la peau
    const pc = Math.atan2(d.x, d.z + .3), ridge = Math.abs(Math.sin(pc * 15 + Math.sin(pc * 3) * .6)) ** .6 * .65 + Math.abs(Math.sin(pc * 6 + 1.3)) ** 1.4 * .35;
    const deep = smooth(.05, .5, 1 - d.y) * smooth(0, .12, f);
    let off = .004 + (spec.T - .004) * smooth(0, spec.curls ? .3 : .16, f), sh;
    if (spec.curls) {
      // boucles : bosses serrées (somme d'ondes dans plusieurs directions), creux assombris
      let nz = 0; for (const [kx, ky, kz, ph] of CURL) nz += Math.sin(kx * d.x + ky * d.y + kz * d.z + ph);
      const curl = smooth(-.15, .65, nz / CURL.length * 2.4);
      off += spec.curls * (curl - .5) * smooth(0, .2, f);
      sh = .66 + .34 * curl;
    } else { off += amp * (ridge - .5) * deep; sh = 1 - .3 * (1 - ridge) * deep; }
    v.addScaledVector(nn, Math.max(.003, off));
    if (spec.round) {
      // volume arrondi (afro) : on tire la coque vers un ellipsoïde autour de la tête
      const [rx, ry, rz] = spec.round, R = .86 / Math.sqrt((d.x / rx) ** 2 + (d.y / ry) ** 2 + (d.z / rz) ** 2), w = smooth(0, .3, f);
      if (R > v.length()) v.lerp(d.clone().multiplyScalar(R + (off - spec.T)), w);
    }
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = sh;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.setAttribute('hm', new T.BufferAttribute(hm, 1));
  g.setAttribute('color', new T.BufferAttribute(col, 3));
  g.computeVertexNormals();
  mat.vertexColors = true;
  const m = mesh(g, maskMat(mat), HC, null, HS);
  const dm = keep(new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking })); maskMat(dm); m.customDepthMaterial = dm;
  return m;
}
// Volume rainuré (queue de cheval, chignon, tresses, banane) : sillons autour de l'axe, torsade possible
function grooved(n = 12, amp = .06, twist = 0, ws = 48, hs = 32) {
  const g = new T.SphereGeometry(1, ws, hs), p = g.attributes.position, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x) + v.y * twist; v.multiplyScalar(1 + amp * (Math.abs(Math.sin(a * n / 2)) ** .8 - .5) * (1 - Math.abs(v.y) ** 4)); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals();
  return g;
}
function humanHair(g, sk) {
  const t = sk.hair || 'short', c = sk.hairColor || '#3B2A20', m = hairMat(c);
  if (t === 'bald') return;
  if (HAIR[t]) g.add(hairShell(HAIR[t], hairMat(c, !!HAIR[t].curls)));
  if (t === 'long') {
    // longueurs derrière et mèches qui encadrent le visage
    g.add(mesh(grooved(26, .07, 0, 48, 32), m, [0, 1.78, -.32], null, [.92, .82, .5]));
    [-1, 1].forEach(s => g.add(mesh(taper([[.6 * s, 2.56, .3], [.84 * s, 2.3, .26], [.93 * s, 1.9, .12], [.9 * s, 1.42, -.02]], .12, .085, 28, 14, .35), m)));
  }
  if (t === 'bun') { g.add(mesh(grooved(10, .14, 2.4, 32, 24), m, [0, 2.92, -.26], null, [.27, .24, .27])); g.add(mesh(new T.TorusGeometry(.2, .035, 10, 32), clay('#8B6BB0', .5), [0, 2.82, -.24], [Math.PI / 2 - .3, 0, 0])); }
  if (t === 'mohawk') for (let k = 0; k < 7; k++) g.add(mesh(new T.ConeGeometry(.1, .36, 14), m, [0, 2.86 - Math.abs(k - 3) * .03, .5 - k * .17], [-.25 + k * .06, 0, 0]));
  if (t === 'pompadour') {
    g.add(mesh(grooved(16, .1, .3, 40, 28), m, [0, 2.84, .2], [.35, 0, Math.PI / 2], [.36, .64, .58]));
    g.add(mesh(grooved(14, .1, .3, 32, 24), m, [0, 2.97, .42], [.6, 0, Math.PI / 2], [.22, .44, .34]));
  }
  if (t === 'ponytail') {
    g.add(mesh(new T.TorusGeometry(.12, .045, 10, 28), clay('#FF4FA3', .5), [0, 2.74, -.64], [.35, 0, 0]));
    g.add(mesh(taper([[0, 2.74, -.66], [0, 2.62, -.95], [0, 2.25, -1.02], [0, 1.95, -.9]], .17, .1, 28, 16, .3), m));
  }
  if (t === 'braids') [-1, 1].forEach(s => {
    for (let k = 0; k < 6; k++) g.add(mesh(grooved(6, .16, 0, 18, 12), m, [.8 * s, 2.28 - k * .15, -.2 + k * .015], [0, 0, (k % 2 ? .5 : -.5)], [.105, .11, .1]));
    g.add(mesh(sph(.065, 14, 10), gloss('#FBBF24', .2), [.8 * s, 1.36, -.12]));
  });
  if (t === 'spiky') for (let k = 0; k < 11; k++) {
    const a = (k / 10 - .5) * 2.3;
    g.add(mesh(new T.ConeGeometry(.13, .46, 12), m, [Math.sin(a) * .6, 2.8 - Math.abs(a) * .1, -.1 + Math.cos(a) * .22], [-.3, 0, -a * .55]));
  }
}
// Couvre-chefs taillés pour la grosse tête (calotte qui épouse le crâne)
function humanHat(g, a) {
  const c = a.color, t = a.type;
  if (t === 'cap' || t === 'beanie') {
    // coque du chapeau : même principe que les cheveux, côtes pour le bonnet
    const knit = t === 'beanie', hg = headGeo(96, 72), p = hg.attributes.position, n = hg.attributes.normal, hm = new Float32Array(p.count);
    const v = new T.Vector3(), nn = new T.Vector3(), d = new T.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); nn.fromBufferAttribute(n, i); d.copy(v).normalize();
      const phi = Math.atan2(d.x, d.z), f = d.y - (knit ? hairline(.5, .22, .05)(phi) : hairline(.56, .32, .18)(phi));
      hm[i] = f;
      if (f < -.08) continue;
      const rib = knit ? (Math.abs(Math.sin(phi * 22)) ** .6 - .5) * .03 : 0, cuff = knit ? .05 * (1 - smooth(.04, .12, f)) : 0;
      v.addScaledVector(nn, ((knit ? .1 : .085) + rib + cuff) * smooth(-.02, .04, f) + .004);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    hg.setAttribute('hm', new T.BufferAttribute(hm, 1));
    hg.computeVertexNormals();
    const m = knit ? fabric(c, .95) : clay(c, .55), hat = mesh(hg, maskMat(m), HC, null, HS);
    const dm = keep(new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking })); maskMat(dm); hat.customDepthMaterial = dm;
    g.add(hat);
    if (knit) g.add(mesh(grooved(16, .25, 0, 24, 18), clay('#FFFFFF', 1), [0, 3.0, -.1], null, [.2, .2, .2]));
    else {
      g.add(mesh(sph(1, 40, 20), clay(c, .55), [0, 2.62, -.8], [.32, 0, 0], [.5, .05, .42]));        // visière à l'envers
      g.add(mesh(sph(.06, 14, 10), clay(shade(c, -.2), .5), [0, 2.84, -.05]));
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.add(mesh(sph(.018, 8, 6), clay(shade(c, -.35), .6), [Math.sin(a) * .5, 2.63, Math.cos(a) * .42 - .02])); }   // œillets
    }
  }
  if (t === 'robot' || t === 'helmet') {
    const m = t === 'robot' ? gloss(c, .15) : keep(new T.MeshPhysicalMaterial({ color: lin(c), transparent: true, opacity: .25, roughness: .05, clearcoat: 1 }));
    if (t === 'robot') m.metalness = .6;
    g.add(mesh(headGeo(), m, [0, 2.14, 0], null, [1.04, .86, .88]));
    if (t === 'robot') g.add(mesh(sph(1, 40, 20), gloss('#15101C', .08), [0, 2.16, .36], null, [.8, .26, .5]));
  }
}
// Main : paume, quatre doigts un peu repliés, pouce vers l'avant (s = côté)
function hand(g, s, mat, at, rot = [0, 0, 0]) {
  const h = new T.Group();
  h.position.set(...at); h.rotation.set(...rot);
  h.add(mesh(sph(.14, 24, 18), mat, [0, 0, 0], null, [.82, 1.02, 1]));
  [-.072, -.024, .024, .072].forEach((fz, k) => {
    const len = k === 0 || k === 3 ? .08 : .1;
    h.add(capsule(.042, mat, [-.012 * s, -.09, fz], [-.035 * s, -.09 - len, fz * 1.05 + .01], 12));
  });
  h.add(capsule(.046, mat, [-.03 * s, -.01, .1], [-.075 * s, -.075, .16], 12));
  g.add(h);
  return h;
}
function buildHuman(sk, opts) {
  const g = new T.Group(), skinC = sk.skin || '#F5D2BE', skin = skinMat(skinC);
  const topC = sk.top || '#E07A3A', shirtC = sk.shirt || '#F4F1EA', pantsC = sk.pants || '#3F4A63', shoeC = sk.shoes || '#2B2B33';
  const top = sk.fit?.finish ? finishMat(topC, sk.fit.finish) : fabric(topC), shirt = fabric(shirtC), pants = fabric(pantsC, .9), shoes = clay(shoeC, .5);
  const trim = fabric(shade(topC, -.16)), cuffPants = fabric(shade(pantsC, -.12), .9);
  const sneak = sk.fit?.sneakers, sole = clay(sneak ? '#FFFFFF' : shade(shoeC, shoeC === '#F8F7F2' || shoeC === '#F4F1EA' ? -.15 : .35), .7);
  // jambes et chaussures (assis : cuisses vers l'avant, mollets qui tombent)
  const sit = !!opts.sit;
  [-1, 1].forEach(s => {
    const fx = (sit ? .23 : .21) * s, fz = sit ? .68 : .08;
    if (sit) {
      g.add(capsule(.155, pants, [.21 * s, .52, 0], [.23 * s, .5, .5]));
      g.add(capsule(.145, pants, [.23 * s, .5, .5], [.23 * s, .2, .58]));
      g.add(mesh(new T.TorusGeometry(.15, .03, 10, 28), cuffPants, [.23 * s, .22, .58], [Math.PI / 2, 0, 0]));
    } else {
      g.add(capsule(.15, pants, [.21 * s, .2, 0], [.21 * s, .52, 0]));
      g.add(mesh(new T.TorusGeometry(.152, .032, 10, 28), cuffPants, [.21 * s, .21, 0], [Math.PI / 2, 0, 0]));   // revers
    }
    // chaussure : tige, semelle, bout renforcé, lacets
    g.add(mesh(sph(.19, 24, 16), shoes, [fx, .11, fz], null, [1, .56, 1.45]));
    g.add(mesh(sph(.2, 24, 12), sole, [fx, .045, fz + .01], null, [1.04, .2, 1.52]));
    g.add(mesh(sph(.12, 18, 12), clay(shade(shoeC, .12), .4), [fx, .085, fz + .17], null, [1.2, .5, .8]));
    if (sneak) [0, 1, 2].forEach(k => g.add(mesh(new T.CylinderGeometry(.012, .012, .13, 6), clay('#FFFFFF', .6), [fx, .19 - k * .012, fz + .02 + k * .055], [0, 0, Math.PI / 2])));
  });
  g.add(mesh(sph(.5, 32, 20), pants, [0, .6, 0], null, [1.02, .44, .8]));
  // torse trapu (veste + chemise au milieu), bande du bas, col
  const torso = mesh(sph(.57, 48, 32), top, [0, 1.02, 0], null, [1.02, 1, .82]);
  g.add(torso);
  let shirtMesh = null;
  const open = shirtC !== topC;
  if (open) {
    shirtMesh = mesh(sph(.57, 32, 24), shirt, [0, 1.0, .05], null, [.34, .95, .8]); g.add(shirtMesh);
    // col de chemise en pointes sous le menton
    [-1, 1].forEach(s => g.add(mesh(new T.ConeGeometry(.09, .2, 3), shirt, [.09 * s, 1.47, .33], [-.5, 0, s * 2.6], [1, 1, .35])));
  } else g.add(torsoRing(.66, .045, trim, .015));   // bande côtelée du bas
  // bras, poignets et mains
  [-1, 1].forEach(s => {
    const from = [.5 * s, 1.34, 0], to = sit ? [.56 * s, .88, .3] : [.7 * s, .86, .06];
    g.add(capsule(.14, top, from, to));
    const dir = new T.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
    const cuff = mesh(new T.TorusGeometry(.142, .034, 10, 28), open ? trim : trim, [to[0] + dir.x * .02, to[1] + dir.y * .02, to[2] + dir.z * .02]);
    cuff.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), dir);
    g.add(cuff);
    const gl = sk.fit?.gloves ? clay(sk.fit.gloves, .6) : skin;
    if (sit) hand(g, s, gl, [.5 * s, .74, .42], [-.9, 0, 0]);
    else hand(g, s, gl, [.73 * s, .74, .1], [0, 0, s * .12]);
  });
  // grosse tête large, oreilles avec creux
  const head = mesh(headGeo(), skin, HC, null, HS);
  g.add(head);
  g.userData.headMesh = head;
  const longHair = sk.hair === 'long';
  if (!longHair) [-1, 1].forEach(s => {
    g.add(mesh(sph(.17, 20, 16), skin, [.93 * s, 2.06, -.02], null, [.5, 1, .7]));
    g.add(mesh(sph(.1, 16, 12), skinMat(skinC, .25), [.975 * s, 2.05, .01], null, [.32, .72, .45]));
  });
  S = surface([head]);
  humanFace(g, sk, opts.mood || 'happy');
  const accs = opts.accs || {};
  // sous une casquette ou un bonnet, les longueurs restent visibles (pas les gros volumes du dessus)
  const capped = accs.head && ['beanie', 'robot', 'cap'].includes(accs.head.type);
  if (!capped || (accs.head.type !== 'robot' && ['short', 'long', 'bowl', 'ponytail', 'braids'].includes(sk.hair || 'short'))) humanHair(g, sk);
  if (accs.eyes) eyeAcc(g, accs.eyes, 'human');
  if (accs.ears) { const eg = new T.Group(); eg.position.set(...HC); earAcc(eg, accs.ears, .72, 'human'); g.add(eg); }
  const ht = accs.head && accs.head.type;
  if (['cap', 'beanie', 'robot', 'helmet'].includes(ht)) { humanHat(g, accs.head); }
  else if (accs.head) {
    const h = new T.Group(), t = accs.head.type;
    headAcc(h, accs.head, TOP.human, 'human');
    const lift = { beret: .06, halo: .05, bob: .08, fedora: .04 }[t] || 0, w = HAT_W.human;
    h.scale.set(w, 1, w);
    h.position.y = lift;
    g.add(h);
  }
  if (accs.neck) { S = surface([torso]); neckAcc(g, accs.neck, 'human'); }
  if (sk.fit) outfit(g, sk, torso, shirtMesh);
  else if (open) { S = surface([torso, shirtMesh]); [0.9, 1.06, 1.22].forEach(y => g.add(mesh(sph(.028, 12, 8), clay(shade(shirtC, -.25), .4), [0, y, S.z(0, y) + .008]))); }
  g.userData.human = true;
  return g;
}
// Matières de veste : paillettes, métal, cuir
function finishMat(c, f) {
  if (f === 'leather') return gloss(c, .32);
  const m = keep(new T.MeshPhysicalMaterial({ color: lin(c), metalness: f === 'metal' ? .75 : .55, roughness: f === 'metal' ? .28 : .38, clearcoat: .5, clearcoatRoughness: .3 }));
  if (f === 'sequin') { m.bumpMap = grain(); m.bumpScale = .03; m.emissive = lin(c).multiplyScalar(.12); }
  return m;
}
const glowMat = c => keep(new T.MeshStandardMaterial({ color: lin(c), emissive: lin(c), emissiveIntensity: .9 }));
// Anneau ajusté au torse (sphère r .57 centrée en y 1.02, échelle 1.02 × .82)
function torsoRing(y, tube, mat, pad = .012) {
  const r = Math.sqrt(Math.max(.01, .57 * .57 - (y - 1.02) ** 2));
  return mesh(new T.TorusGeometry(1, tube, 12, 64), mat, [0, y, 0], [Math.PI / 2, 0, 0], [r * 1.02 + pad, r * .82 + pad, 1]);
}
function star(r, depth) {
  const sh = new T.Shape();
  for (let k = 0; k < 10; k++) { const an = Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; k ? sh.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : sh.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); }
  return new T.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: .01, bevelSize: .01, bevelSegments: 2 });
}
// Détails de tenue des skins haut de gamme
function outfit(g, sk, torso, shirtMesh) {
  const f = sk.fit, parts = [torso]; if (shirtMesh) parts.push(shirtMesh);
  S = surface(parts);
  if (f.lapels) {
    const m = f.lapelFinish ? finishMat(f.lapels, f.lapelFinish) : gloss(f.lapels, .3);
    [-1, 1].forEach(s => { const x = .17 * s, y = 1.27; g.add(mesh(new T.BoxGeometry(.11, .46, .04), m, [x, y, S.z(x, y) + .005], [-.25, s * .1, -s * .38])); });
  }
  if (f.buttons) [0.86, 1.02, 1.18].forEach(y => g.add(mesh(sph(.035, 12, 8), gloss(f.buttons, .2), [0, y, S.z(0, y) + .01])));
  if (f.stripes) { const m = clay(f.stripes, .7); [.92, 1.08].forEach(y => g.add(torsoRing(y, .028, m))); [-1, 1].forEach(s => g.add(capsule(.032, m, [.55 * s, 1.36, .1], [.74 * s, .9, .17]))); }
  if (f.belt) {
    const m = f.beltFinish === 'leather' ? gloss(f.belt, .35) : finishMat(f.belt, 'metal');
    g.add(torsoRing(.66, .055, m, .02));
    const z = S.z(0, .66) + .05;
    g.add(mesh(new T.BoxGeometry(.24, .16, .05), finishMat(f.buckle || '#FBBF24', 'metal'), [0, .66, z]));
    if (f.buckleGem) g.add(mesh(sph(.045, 16, 12), gloss(f.buckleGem, .05), [0, .66, z + .035]));
  }
  if (f.trim) { const m = f.trimGlow === false ? finishMat(f.trim, 'metal') : glowMat(f.trim); g.add(torsoRing(1.47, .025, m, .01)); g.add(torsoRing(.6, .025, m, .03)); [-1, 1].forEach(s => g.add(mesh(new T.TorusGeometry(.15, .022, 8, 24), m, [.7 * s, .87, .06], [Math.PI / 2 - .3, 0, s * .3]))); }
  if (f.pin) { const y = 1.3, x = -.27; g.add(mesh(star(.09, .025), finishMat(f.pin, 'metal'), [x, y, S.z(x, y) + .01])); }
  if (f.earrings) { const m = finishMat(f.earrings, 'metal'); [-1, 1].forEach(s => g.add(mesh(new T.TorusGeometry(.07, .016, 8, 24), m, [.95 * s, 1.84, .02], [0, Math.PI / 2, 0]))); }
  if (f.sneakers) [-1, 1].forEach(s => g.add(mesh(sph(.06, 16, 10), clay(f.sneakers, .5), [.21 * s + .175 * s, .12, .1], null, [.25, .7, 1.6])));   // bande sur le côté
  if (f.cape) {
    const m = velvet(f.cape); m.side = T.DoubleSide;
    g.add(mesh(new T.CylinderGeometry(.6, .95, 1.25, 40, 1, true, Math.PI / 2 + .25, Math.PI - .5), m, [0, .9, -.08]));
    g.add(mesh(new T.CylinderGeometry(.56, .62, .22, 40, 1, true, Math.PI / 2 - .05, Math.PI + .1), m, [0, 1.6, -.06]));   // col montant
    if (f.capeTrim) g.add(mesh(new T.TorusGeometry(.95, .03, 8, 48, Math.PI - .5), finishMat(f.capeTrim, 'metal'), [0, .28, -.08], [Math.PI / 2, 0, Math.PI + .25]));
  }
  if (f.prop === 'mic') {
    const metal = finishMat(f.propColor || '#2A2A33', 'metal');
    g.add(mesh(new T.CylinderGeometry(.065, .042, .46, 16), metal, [.72, .9, .24], [-.4, 0, -.1]));
    g.add(mesh(sph(.15, 28, 20), keep(new T.MeshPhysicalMaterial({ color: lin('#C9CED6'), metalness: .9, roughness: .35, bumpMap: grain(), bumpScale: .03 })), [.75, 1.16, .33]));
    g.add(mesh(new T.TorusGeometry(.15, .02, 8, 28), metal, [.75, 1.1, .32], [Math.PI / 2 - .4, 0, 0]));
  }
  if (f.prop === 'guitar') {
    const wood = gloss(f.propColor || '#C2410C', .25), gtr = new T.Group();
    gtr.add(mesh(sph(.3, 32, 20), wood, [0, 0, 0], null, [1, 1.1, .32]));
    gtr.add(mesh(sph(.24, 32, 20), wood, [0, .34, 0], null, [1, 1, .32]));
    gtr.add(mesh(new T.CylinderGeometry(.08, .08, .02, 24), matte('#1E1A22'), [0, .18, .1], [Math.PI / 2, 0, 0]));
    gtr.add(mesh(new T.BoxGeometry(.09, .9, .05), matte('#3B2A20'), [0, .95, .02]));
    gtr.add(mesh(new T.BoxGeometry(.13, .2, .05), matte('#1E1A22'), [0, 1.48, .02]));
    gtr.scale.setScalar(1.3); gtr.position.set(-.12, .74, .66); gtr.rotation.set(.1, 0, -1.05);
    g.add(gtr);
    g.add(capsule(.03, clay(f.strap || '#1E1A22', .6), [.45, 1.45, .3], [-.42, .72, .45]));
  }
}
// Cadre la caméra sur une boîte (personnage entier, tête seule…)
function fitCamera(cam, box, pad) {
  const size = box.getSize(new T.Vector3()), c = box.getCenter(new T.Vector3());
  const t = Math.tan(T.MathUtils.degToRad(cam.fov / 2));
  const dist = Math.max(size.y / (2 * t), size.x / (2 * t * cam.aspect)) * pad + size.z / 2;
  cam.position.set(c.x, c.y + size.y * .04, c.z + dist);
  cam.lookAt(c.x, c.y, c.z);
  cam.updateProjectionMatrix();
}
function renderHuman(r, sk, opts, W, H) {
  const head = !!opts.head, lying = !!opts.lying;
  const scene = new T.Scene();
  r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = .95;
  scene.add(new T.HemisphereLight(0xDDEBFF, 0xE2CDB6, .78));
  const key = new T.DirectionalLight(0xFFF1E0, 1.3); key.position.set(-3, 5, 5);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0003; key.shadow.normalBias = .02; key.shadow.radius = 3;
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 4, bottom: -1, near: .5, far: 20 });
  scene.add(key);
  const fill = new T.DirectionalLight(0xFFFFFF, .35); fill.position.set(3, 1.5, 4); scene.add(fill);
  const rim = new T.DirectionalLight(0xFFFFFF, .45); rim.position.set(1, 3, -4); scene.add(rim);
  const rim2 = new T.DirectionalLight(0xE4DCFF, .3); rim2.position.set(-3.5, 2.5, -2); scene.add(rim2);   // contre-jour froid : reflets sur les cheveux
  const ch = build(sk, opts);
  const pivot = new T.Group(); pivot.add(ch);
  if (lying) { ch.position.y = -1.4; pivot.rotation.set(.35, 0, Math.PI / 2 - .06); }
  else ch.rotation.set(0, opts.turn ?? -.22, 0);
  ch.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(pivot);
  pivot.updateMatrixWorld(true);
  let box;
  if (head) {
    // Cadre sur le visage : la largeur de la tête, et en hauteur jusqu'au sommet du chapeau
    box = new T.Box3().setFromObject(ch.userData.headMesh);
    let topY = box.max.y;
    ch.traverse(o => { if (o.isMesh) { const b = new T.Box3().setFromObject(o); if (b.min.y > 1.3) topY = Math.max(topY, b.max.y); } });
    box.max.y = Math.min(topY, box.max.y + .45);
    box.min.y += .15;
  }
  else box = new T.Box3().setFromObject(pivot);
  if (!head && !lying && !opts.sit) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(40,30,60,.35)'); gr.addColorStop(1, 'rgba(40,30,60,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    scene.add(mesh(new T.PlaneGeometry(2.6, 1.3), keep(new T.MeshBasicMaterial({ map: keep(new T.CanvasTexture(c)), transparent: true, depthWrite: false })), [0, .005, 0], [-Math.PI / 2, 0, 0]));
  }
  const cam = new T.PerspectiveCamera(22, W / H, .1, 60);
  fitCamera(cam, box, head ? 1.02 : 1.1);
  r.setClearColor(0, 0);
  r.render(scene, cam);
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  out.getContext('2d').drawImage(r.domElement, 0, 0);
  while (trash.length) { try { trash.pop().dispose(); } catch (e) {} }
  r.toneMapping = CFG.tm === 'aces' ? T.ACESFilmicToneMapping : T.NoToneMapping; r.toneMappingExposure = CFG.exp;
  return { url: out.toDataURL('image/webp', .92) };
}

function render(sk, opts = {}) {
  const r = getRenderer();
  if (!r) return null;
  const head = !!opts.head, lying = !!opts.lying;
  const Q = sk.kind === 'human' ? 1.3 : 1, W = Math.round((lying ? 520 : 400) * Q), H = Math.round((lying ? 300 : head ? 400 : 440) * Q);
  r.setSize(W, H, false);
  if (sk.kind === 'human') return renderHuman(r, sk, opts, W, H);
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
const STORE = 'pompelup_blob3d_v6', KEEP = 16, BUDGET = 1.4e6;
const cache = new Map();
try { ['pompelup_blob3d_v1', 'pompelup_blob3d_v2', 'pompelup_blob3d_v3', 'pompelup_blob3d_v4', 'pompelup_blob3d_v5'].forEach(k => localStorage.removeItem(k)); JSON.parse(localStorage.getItem(STORE) || '[]').forEach(([k, v]) => cache.set(k, v)); } catch (e) {}
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
  const cls = `char char3d${opts.head ? ' char-head' : ''}${opts.lying ? ' char-lying' : ''}${opts.sit ? ' char-sit' : ''}`;
  if (cache.has(k)) { const v = cache.get(k); cache.delete(k); cache.set(k, v); return `<img class="${cls} is-ready" src="${v.url}" alt="${alt}" draggable="false">`; }
  if (!queue.has(k)) queue.set(k, { sk, opts });
  if (!pumping) { pumping = true; requestAnimationFrame(pump); }
  return `<img class="${cls}" data-ck="${k}" src="${BLANK}" alt="${alt}" draggable="false">`;
}
window.Pompe3D = { ok: () => ok && !!getRenderer(), html, render };
})();
