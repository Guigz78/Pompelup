/* ============================================
   Pompelup — avatars 3D (Three.js)
   Buste modelé façon « figurine en pâte » : chaque combinaison skin +
   accessoires + humeur est rendue une fois en image, puis mise en cache.
   Sans WebGL, on retombe sur le dessin SVG de character.js.
   ============================================ */
(() => {
'use strict';
const T = window.THREE;
const C = window.PompeChar;
if (!C) return;

let renderer = null, ok = !!T;
function getRenderer() {
  if (renderer || !ok) return renderer;
  try {
    const canvas = document.createElement('canvas');
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .96;
  } catch (e) { ok = false; renderer = null; }
  return renderer;
}

/* ---------- utilitaires ---------- */
const col = c => new T.Color(c).convertSRGBToLinear();
function mix(a, b, t) { return '#' + new T.Color(a).lerp(new T.Color(b), t).getHexString(); }
function shade(c, amt) { const k = new T.Color(c); return '#' + (amt < 0 ? k.multiplyScalar(1 + amt) : k.lerp(new T.Color('#fff'), amt)).getHexString(); }
const trash = [];
function mat(color, o = {}) {
  const m = new T.MeshStandardMaterial(Object.assign({ color: col(color), roughness: .62, metalness: 0 }, o));
  trash.push(m);
  return m;
}
function metal(color) { return mat(color, { metalness: .55, roughness: .3, emissive: col(color).multiplyScalar(.18) }); }
function glow(color) { return mat(color, { emissive: col(color), emissiveIntensity: .9, roughness: .3 }); }
function mesh(geo, material, pos, rot, scl) {
  trash.push(geo);
  const m = new T.Mesh(geo, material);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scl) m.scale.set(...scl);
  return m;
}
const sphere = (r, ws = 40, hs = 28, ...rest) => new T.SphereGeometry(r, ws, hs, ...rest);
function tube(points, r, material, closedEnds = true) {
  const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
  const g = new T.Group();
  g.add(mesh(new T.TubeGeometry(curve, 40, r, 12, false), material));
  if (closedEnds) [0, 1].forEach(t => { const p = curve.getPoint(t); g.add(mesh(sphere(r, 12, 8), material, [p.x, p.y, p.z])); });
  return g;
}
function extrude(shape, depth, material, bevel = .03) {
  return mesh(new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 18 }), material);
}
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c);
  t.encoding = T.sRGBEncoding;
  if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(...repeat); }
  trash.push(t);
  return t;
}

/* ---------- tête ---------- */
const HY = 1.1, HZ = .95;             // étirement de la tête (ovale, légèrement aplatie)
// Point à la surface du visage (coordonnées tête), décalé de `off` vers l'extérieur
function S(x, y, off = 0) {
  const ny = y / HY, taper = y < 0 ? 1 - .16 * Math.pow(-ny, 1.6) : 1;
  const xx = x / taper;
  const z = Math.sqrt(Math.max(0, 1 - xx * xx - ny * ny)) * HZ;
  return [x, y, z + off];
}
function headGeometry() {
  const g = sphere(1, 72, 56), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const taper = y < 0 ? 1 - .16 * Math.pow(-y, 1.6) : 1;
    x *= taper; z *= taper * HZ; y *= HY;
    if (y < -.4 && z > 0) z += .05 * (-y - .4);      // menton légèrement en avant
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}
function skinTexture(skin) {
  return canvasTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = skin; ctx.fillRect(0, 0, w, h);
    const blush = (u, v, r) => {
      const g = ctx.createRadialGradient(u * w, v * h, 0, u * w, v * h, r);
      g.addColorStop(0, 'rgba(236,110,110,.55)'); g.addColorStop(1, 'rgba(236,110,110,0)');
      ctx.fillStyle = g; ctx.fillRect(u * w - r, v * h - r, 2 * r, 2 * r);
    };
    blush(.25 - .1, .56, 30); blush(.25 + .1, .56, 30);
    // léger rosé du bout du menton et du front
    const g2 = ctx.createRadialGradient(.25 * w, .82 * h, 0, .25 * w, .82 * h, 40);
    g2.addColorStop(0, 'rgba(230,120,110,.18)'); g2.addColorStop(1, 'rgba(230,120,110,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
  });
}
function knitTexture() {
  return canvasTex(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(x + 1, y + 1); ctx.lineTo(x + 4, y + 7); ctx.lineTo(x + 7, y + 1); ctx.stroke();
      ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 4, y + 7.5); ctx.lineTo(x + 4, y + 8); ctx.stroke();
    }
  }, [22, 12]);
}

function buildEyes(g, mood, iris, skin) {
  const white = mat('#FAF7F2', { roughness: .25 }), dark = mat(mix(iris, '#0b0706', .5), { roughness: .12 });
  const irisM = mat(iris, { roughness: .18 }), lidM = mat(skin, { roughness: .55 }), line = mat('#2A160E', { roughness: .5 });
  const closedArc = (x, up) => tube(up ? [[x - .19, .03, 0], [x, .15, .05], [x + .19, .03, 0]] : [[x - .19, .12, 0], [x, .03, .05], [x + .19, .12, 0]], .038, line).translateZ(S(x, .08)[2] - .02);
  [-1, 1].forEach(side => {
    const x = .34 * side;
    const closed = mood === 'grin' ? 'up' : mood === 'sad' ? 'down' : mood === 'wink' && side > 0 ? 'up' : null;
    if (closed) { g.add(closedArc(x, closed === 'up')); return; }
    const [, , zs] = S(x, .08);
    const big = mood === 'wow';
    const R = big ? .26 : .245;
    const eye = new T.Group();
    eye.position.set(x, .06, zs - .17);
    eye.add(mesh(sphere(R), white));
    eye.add(mesh(sphere(R * .74, 32, 24), irisM, [0, -.005, R * .36]));
    eye.add(mesh(sphere(R * .5, 24, 16), dark, [0, -.005, R * .56]));
    eye.add(mesh(sphere(R * .16, 12, 8), mat('#fff', { emissive: col('#fff'), emissiveIntensity: .9 }), [R * .3, R * .3, R * .92]));
    eye.add(mesh(sphere(R * .07, 8, 6), mat('#fff', { emissive: col('#fff'), emissiveIntensity: .7 }), [-R * .25, -R * .28, R * .9]));
    // paupière supérieure : plus elle descend, plus le regard est « malin »
    const cover = { happy: .92, talk: .92, wink: .92, wow: .62, smirk: 1.55 }[mood] || .92;
    const lid = mesh(sphere(R * 1.07, 32, 16, 0, Math.PI * 2, 0, cover), lidM, [0, 0, 0], [.55, 0, 0]);
    eye.add(lid);
    g.add(eye);
  });
}
function buildBrows(g, mood, color) {
  const m = mat(color, { roughness: .7 });
  const shapes = {
    happy: [[-.6, .38], [-.4, .47], [-.16, .42]], talk: [[-.6, .4], [-.4, .49], [-.16, .44]], grin: [[-.6, .4], [-.4, .5], [-.16, .45]],
    wow: [[-.6, .46], [-.4, .58], [-.16, .52]], sad: [[-.6, .38], [-.4, .42], [-.18, .5]], wink: [[-.6, .38], [-.4, .47], [-.16, .42]],
    smirk: [[-.6, .42], [-.4, .5], [-.16, .44]],
  }[mood] || [[-.6, .38], [-.4, .47], [-.16, .42]];
  [-1, 1].forEach(side => {
    let pts = shapes.map(([x, y]) => [side < 0 ? x : -x, y]);
    if (mood === 'smirk' && side > 0) pts = pts.map(([x, y]) => [x, y - .06]);
    if (mood === 'wink' && side > 0) pts = pts.map(([x, y]) => [x, y - .04]);
    g.add(tube(pts.map(([x, y]) => S(x, y, .02)), .058, m));
  });
}
function buildMouth(g, mood, skin) {
  const lip = mat(mix(skin, '#9E3434', .55), { roughness: .5 });
  const inside = mat('#5E1717', { roughness: .8 }), teeth = mat('#FFFFFF', { roughness: .3 }), tongue = mat('#E36B6B', { roughness: .6 });
  if (mood === 'grin' || mood === 'wow' || mood === 'talk') {
    const w = mood === 'grin' ? .3 : mood === 'wow' ? .12 : .14, hgt = mood === 'grin' ? .2 : mood === 'wow' ? .19 : .12;
    const shape = new T.Shape();
    if (mood === 'grin') { shape.moveTo(-w, 0); shape.quadraticCurveTo(-w, -hgt * 1.2, 0, -hgt * 1.2); shape.quadraticCurveTo(w, -hgt * 1.2, w, 0); shape.quadraticCurveTo(0, .04, -w, 0); }
    else shape.absellipse(0, 0, w, hgt, 0, Math.PI * 2, false, 0);
    const [x, y, z] = S(0, -.5, -.05);
    const m = extrude(shape, .04, inside, .012);
    m.position.set(x, y, z); m.rotation.x = -.35;
    g.add(m);
    if (mood === 'grin') {
      const ts = new T.Shape(); ts.moveTo(-w * .92, -.01); ts.quadraticCurveTo(0, .03, w * .92, -.01); ts.lineTo(w * .8, -.07); ts.quadraticCurveTo(0, -.05, -w * .8, -.07); ts.lineTo(-w * .92, -.01);
      const t = extrude(ts, .03, teeth, .01); t.position.set(x, y, z + .035); t.rotation.x = -.35; g.add(t);
    }
    g.add(mesh(sphere(1, 20, 12), tongue, [x, y - hgt * (mood === 'grin' ? .9 : .6), z + .02], [-.35, 0, 0], [w * .6, .045, .05]));
    return;
  }
  const pts = {
    happy: [[-.27, -.42], [0, -.55], [.27, -.42]], wink: [[-.26, -.42], [0, -.55], [.26, -.42]],
    smirk: [[-.18, -.5], [.05, -.52], [.25, -.42]], sad: [[-.18, -.53], [0, -.47], [.18, -.53]],
  }[mood] || [[-.22, -.44], [0, -.53], [.22, -.44]];
  g.add(tube(pts.map(([x, y]) => S(x, y, .005)), .038, lip));
}

/* ---------- cheveux ---------- */
function hairCap(g, m, opt = {}) {
  const r = opt.r || 1.07, len = opt.len || 1.38;
  g.add(mesh(sphere(r, 56, 32, 0, Math.PI * 2, 0, len), m, [0, opt.y || .02, opt.z || -.03], [opt.tilt ?? -.38, 0, 0], [1, HY, HZ + .05]));
}
function buildHair(g, style, color) {
  if (style === 'none') return;
  const m = mat(color, { roughness: .55 });
  const dark = mat(shade(color, -.18), { roughness: .6 });
  if (style === 'swept') {
    hairCap(g, m);
    g.add(tube([[.92, .5, .3], [.55, .82, .6], [.05, .9, .62], [-.45, .82, .5], [-.85, .52, .3]], .19, m));
    g.add(tube([[.6, .85, .55], [.2, 1.02, .45], [-.3, .98, .38]], .16, m));
    [-1, 1].forEach(s => g.add(mesh(sphere(.2), m, [.9 * s, .2, .2], 0, [.45, 1, .6])));
  }
  if (style === 'short') hairCap(g, m, { len: 1.3 });
  if (style === 'long' || style === 'bob') {
    hairCap(g, m, { len: 1.42 });
    const bottom = style === 'long' ? 2.55 : 2.05;
    // masse arrière + côtés, ouverte devant le visage
    g.add(mesh(sphere(1.12, 56, 32, Math.PI / 2 + 1.05, Math.PI * 2 - 2.1, .3, bottom), m, [0, style === 'long' ? -.25 : -.05, -.05], null, [1.02, style === 'long' ? 1.35 : 1.05, 1]));
    if (style === 'long') for (let s of [-1, 1]) for (let k = 0; k < 5; k++) {
      const x0 = (.72 + k * .06) * s, z0 = .42 - k * .12;
      g.add(tube([[x0, .55, z0], [x0 * 1.1, -.2, z0 + .05], [x0 * 1.14, -1.1, z0 + .1], [x0 * 1.16, -1.75, z0 + .05]], .085 + (k % 2) * .02, k % 2 ? dark : m));
    }
    if (style === 'bob') g.add(tube([[-.8, .62, .55], [-.3, .8, .78], [.3, .8, .78], [.8, .62, .55]], .16, m));
  }
  if (style === 'curls' || style === 'afro') {
    hairCap(g, m, { len: style === 'afro' ? 1.25 : 1.45, r: style === 'afro' ? 1.02 : 1.06 });
    const n = style === 'afro' ? 70 : 150;
    for (let i = 0; i < n; i++) {
      const th = Math.acos(1 - (i / n) * 1.55), ph = i * 2.399;
      const x = Math.sin(th) * Math.cos(ph), z = Math.sin(th) * Math.sin(ph), y = Math.cos(th);
      if (z > .35 && y < .52) continue;                        // dégage le visage
      const R = style === 'afro' ? 1.3 : 1.12;
      const p = [x * R * 1.02, y * R * HY + .05, z * R * .98 - .03];
      if (style === 'afro') g.add(mesh(sphere(.3, 16, 12), i % 3 ? m : dark, p));
      else g.add(mesh(new T.TorusGeometry(.105, .07, 12, 24), i % 3 ? m : dark, p, [ph * 1.3, th * 2 + i, i * .9], [1, 1, 1.4]));
    }
  }
  if (style === 'mohawk') {
    hairCap(g, dark, { len: 1.2, r: 1.02 });
    for (let k = 0; k < 6; k++) {
      const a = -.55 + k * .3;
      g.add(mesh(new T.ConeGeometry(.16, .55, 16), m, [0, Math.cos(a) * 1.15 * HY + .12, Math.sin(a) * 1.1 - .1], [a - .2, 0, 0]));
    }
  }
  if (style === 'bun') { hairCap(g, m, { len: 1.3 }); g.add(mesh(sphere(.36), m, [0, 1.25, -.35])); }
  if (style === 'buns') {
    hairCap(g, m, { len: 1.3 });
    const beads = ['#F97316', '#EC4899', '#6D8BD8', '#EC4899', '#F97316', '#EC4899', '#6D8BD8'];
    [[-.55, 1.02, -.12], [-.2, 1.22, -.15], [.2, 1.22, -.15], [.55, 1.02, -.12], [-.85, .6, -.1], [.85, .6, -.1], [0, 1.1, -.55]].forEach(([x, y, z], i) => {
      const dir = new T.Vector3(x, y - .1, z).normalize();
      const cone = mesh(new T.ConeGeometry(.13, .5, 16), m, [x + dir.x * .22, y + dir.y * .22, z + dir.z * .22]);
      cone.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir);
      g.add(cone);
      g.add(mesh(sphere(.13, 16, 12), mat(beads[i], { roughness: .25 }), [x, y, z]));
    });
  }
}

/* ---------- coiffes, lunettes, casque ---------- */
function buildHead(g, acc) {
  const c = acc.color, t = acc.type, m = mat(c, { roughness: .6 });
  if (t === 'beanie') {
    const knit = knitTexture(); knit.repeat.set(14, 6);
    const km = mat(c, { roughness: .9, bumpMap: knit, bumpScale: .025 });
    g.add(mesh(sphere(1.13, 56, 32, 0, Math.PI * 2, 0, 1.4), km, [0, .05, -.04], [-.28, 0, 0], [1, 1.12, 1.02]));
    g.add(mesh(new T.TorusGeometry(1.07, .11, 16, 56), km, [0, .3, .08], [Math.PI / 2 - .28, 0, 0], [1, 1.03, 1]));
  }
  if (t === 'cap') {
    g.add(mesh(sphere(1.09, 56, 32, 0, Math.PI * 2, 0, 1.35), m, [0, .05, -.02], [-.25, 0, 0], [1, 1.02, 1]));
    g.add(mesh(sphere(.95, 40, 16), mat(shade(c, -.15)), [0, .48, .88], [.08, 0, 0], [1, .08, .72]));
    g.add(mesh(sphere(.11, 16, 12), mat(shade(c, .3)), [0, 1.18, -.05]));
  }
  if (t === 'beret') { g.add(mesh(sphere(1.1, 48, 24), m, [-.12, .98, -.05], [.1, 0, .22], [1.18, .3, 1.1])); g.add(mesh(new T.CylinderGeometry(.05, .05, .2, 12), m, [-.22, 1.35, -.05])); }
  if (t === 'crown') {
    const gm = metal(c);
    g.add(mesh(new T.CylinderGeometry(.62, .56, .32, 40, 1, true), gm, [0, 1.2, -.05]));
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + Math.PI / 2; g.add(mesh(new T.ConeGeometry(.13, .38, 16), gm, [Math.cos(a) * .6, 1.52, Math.sin(a) * .6 - .05])); g.add(mesh(sphere(.07, 12, 8), metal(k % 2 ? '#EF4444' : '#38BDF8'), [Math.cos(a) * .62, 1.18, Math.sin(a) * .62 - .05])); }
  }
  if (t === 'fedora') {
    g.add(mesh(new T.CylinderGeometry(1.65, 1.65, .07, 56), mat(shade(c, -.1)), [0, .78, 0], [-.08, 0, 0]));
    g.add(mesh(new T.CylinderGeometry(.9, 1.02, .7, 48), m, [0, 1.15, -.03], [-.08, 0, 0]));
    g.add(mesh(new T.CylinderGeometry(1.03, 1.04, .16, 48, 1, true), mat('#F5F5F4'), [0, .92, -.01], [-.08, 0, 0]));
  }
  if (t === 'bob') {
    g.add(mesh(sphere(1.08, 48, 28, 0, Math.PI * 2, 0, 1.35), m, [0, .12, -.02], [-.2, 0, 0], [1, 1, 1]));
    g.add(mesh(new T.CylinderGeometry(1.2, 1.55, .3, 56, 1, true), mat(shade(c, -.1), { side: T.DoubleSide }), [0, .5, .02], [-.2, 0, 0]));
  }
  if (t === 'robot') {
    g.add(mesh(sphere(1.28, 64, 48), metal(c), [0, .02, 0], null, [1, 1.08, 1]));
    g.add(mesh(sphere(1.3, 64, 16, Math.PI / 2 - 1.2, 2.4, 1.35, .45), mat('#111827', { roughness: .15 }), [0, .05, .02], null, [1, 1.08, 1]));
    g.add(mesh(new T.BoxGeometry(1.1, .05, .05), glow('#F43F5E'), [0, .08, 1.28]));
  }
  if (t === 'helmet') {
    g.add(mesh(sphere(1.55, 48, 32), mat(c, { transparent: true, opacity: .22, roughness: .05 }), [0, .05, 0]));
    g.add(mesh(new T.TorusGeometry(1.2, .12, 16, 48), mat('#E2E8F0'), [0, -1.1, 0], [Math.PI / 2, 0, 0]));
  }
  if (t === 'halo') g.add(mesh(new T.TorusGeometry(.8, .08, 16, 64), glow(c), [0, 1.62, -.1], [Math.PI / 2 - .25, 0, 0]));
}
function buildEyewear(g, acc) {
  const c = acc.color, t = acc.type;
  const E = side => { const [x, y, z] = S(.34 * side, .06, .1); return [x, y, z]; };
  if (t === 'round') {
    const m = metal(c);
    [-1, 1].forEach(s => g.add(mesh(new T.TorusGeometry(.25, .035, 12, 40), m, E(s))));
    g.add(tube([E(-1).map((v, i) => i === 0 ? v + .25 : v), [0, .12, E(1)[2] + .04], E(1).map((v, i) => i === 0 ? v - .25 : v)], .025, m, false));
  }
  const flat = (shape, m) => [-1, 1].forEach(s => { const e = extrude(shape, .05, m, .02); const [x, y, z] = E(s); e.position.set(x, y, z - .02); e.rotation.y = s * .18; g.add(e); });
  if (t === 'shades') {
    const sh = new T.Shape(); const w = .27, h = .19, r = .08;
    sh.moveTo(-w + r, -h); sh.lineTo(w - r, -h); sh.quadraticCurveTo(w, -h, w, -h + r); sh.lineTo(w, h - r); sh.quadraticCurveTo(w, h, w - r, h); sh.lineTo(-w + r, h); sh.quadraticCurveTo(-w, h, -w, h - r); sh.lineTo(-w, -h + r); sh.quadraticCurveTo(-w, -h, -w + r, -h);
    flat(sh, mat(c, { roughness: .12 }));
    g.add(mesh(new T.BoxGeometry(.2, .05, .05), mat(c), [0, .14, E(1)[2] + .02]));
  }
  if (t === 'hearts') {
    const sh = new T.Shape(); sh.moveTo(0, -.22); sh.bezierCurveTo(-.34, 0, -.26, .26, 0, .1); sh.bezierCurveTo(.26, .26, .34, 0, 0, -.22);
    flat(sh, mat(c, { roughness: .25 }));
  }
  if (t === 'stars') {
    const sh = new T.Shape();
    for (let k = 0; k < 10; k++) { const a = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? .12 : .27; k ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    flat(sh, metal(c));
  }
  if (t === 'visor') g.add(mesh(new T.CylinderGeometry(1.02, 1.02, .34, 48, 1, true, -1.05, 2.1), mat(c, { emissive: col(c), emissiveIntensity: .6, transparent: true, opacity: .92, side: T.DoubleSide, roughness: .1 }), [0, .06, .02], null, [1.02, 1, 1.02]));
}
function buildPhones(g, acc) {
  const m = mat(acc.color, { roughness: .35 }), pad = mat(shade(acc.color, -.45), { roughness: .8 });
  g.add(mesh(new T.TorusGeometry(1.14, .085, 16, 56, Math.PI), m, [0, .05, -.05], [-.12, 0, 0]));
  [-1, 1].forEach(s => {
    g.add(mesh(new T.CylinderGeometry(.32, .32, .24, 32), m, [1.1 * s, .02, 0], [0, 0, Math.PI / 2]));
    g.add(mesh(new T.CylinderGeometry(.28, .28, .08, 32), pad, [.97 * s, .02, 0], [0, 0, Math.PI / 2]));
    if (acc.glow) g.add(mesh(new T.TorusGeometry(.3, .03, 8, 32), glow(acc.color), [1.23 * s, .02, 0], [0, Math.PI / 2, 0]));
  });
}

/* ---------- buste ---------- */
function torsoGeometry() {
  const pts = [[0, .36], [.36, .36], [.62, .33], [.95, .24], [1.22, .06], [1.4, -.22], [1.5, -.62], [1.55, -1.6]].map(([x, y]) => new T.Vector2(x, y));
  return new T.LatheGeometry(pts, 72);
}
const TZ = .64;                      // aplatissement avant/arrière du buste
function frontZ(x, y) {
  const prof = [[.36, .36], [.62, .33], [.95, .24], [1.22, .06], [1.4, -.22], [1.5, -.62], [1.55, -1.3]];
  let r = 1.55;
  for (let i = 0; i < prof.length - 1; i++) { const [r0, y0] = prof[i], [r1, y1] = prof[i + 1]; if (y <= y0 && y >= y1) { r = r0 + (r1 - r0) * (y0 - y) / (y0 - y1); break; } }
  return Math.sqrt(Math.max(0, r * r - x * x)) * TZ;
}
function buildBody(g, sk) {
  const [style, c1, c2 = '#FFFFFF'] = sk.top;
  let tmat;
  if (style === 'sweater') { const k = knitTexture(); tmat = mat(c1, { roughness: .92, bumpMap: k, bumpScale: .03 }); }
  else if (style === 'stripes') tmat = mat('#fff', { map: canvasTex(8, 64, (ctx, w, h) => { for (let y = 0; y < h; y += 8) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(0, y, w, 4); ctx.fillStyle = c1; ctx.fillRect(0, y + 4, w, 4); } }, [1, 3]), roughness: .7 });
  else if (style === 'sequin') tmat = mat('#fff', { map: canvasTex(32, 32, (ctx, w, h) => { ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h); ctx.fillStyle = shade(c1, .45); for (let y = 0; y < h; y += 8) for (let x = (y / 8 % 2) * 4; x < w; x += 8) { ctx.beginPath(); ctx.arc(x + 2, y + 2, 2.2, 0, 7); ctx.fill(); } }, [40, 20]), roughness: .3, metalness: .35 });
  else if (style === 'tee') tmat = mat('#fff', { roughness: .75, map: canvasTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = c2;
    [.25, .75].forEach(u => { const x0 = (u - .13) * w, x1 = (u + .13) * w, top = .56 * h; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, top - 30); ctx.quadraticCurveTo(u * w, top + 40, x1, top - 30); ctx.lineTo(x1, 0); ctx.fill(); });
  }) });
  else tmat = mat(c1, { roughness: style === 'jacket' || style === 'suit' ? .45 : .75 });
  g.add(mesh(torsoGeometry(), tmat, [0, 0, 0], null, [1, 1, TZ]));
  const collar = style === 'tee' ? c2 : style === 'sweater' ? shade(c1, -.1) : c1;
  if (style !== 'jacket' && style !== 'suit') g.add(mesh(new T.TorusGeometry(.4, .09, 16, 48), mat(collar, { roughness: .85 }), [0, .36, -.03], [Math.PI / 2, 0, 0], [1, TZ + .1, 1]));
  if (style === 'hoodie') {
    g.add(mesh(new T.TorusGeometry(.6, .24, 20, 48), mat(shade(c1, -.08), { roughness: .8 }), [0, .38, -.2], [Math.PI / 2 + .2, 0, 0], [1, .85, 1]));
    const s = mat('#FFFFFF', { roughness: .5 });
    [-1, 1].forEach(k => { const x = .17 * k; g.add(tube([[x, .28, frontZ(x, .28) + .06], [x * 1.1, -.05, frontZ(x, -.05) + .05], [x * 1.15, -.42, frontZ(x, -.42) + .05]], .035, s)); g.add(mesh(new T.CylinderGeometry(.05, .04, .12, 12), s, [x * 1.15, -.48, frontZ(x, -.42) + .05])); });
  }
  if (style === 'jacket' || style === 'suit') {
    const V = new T.Shape(); V.moveTo(-.34, .36); V.lineTo(.34, .36); V.lineTo(0, -.7); V.lineTo(-.34, .36);
    const shirt = extrude(V, .05, mat(c2, { roughness: .6 }), .015); shirt.position.set(0, 0, frontZ(0, 0) - .05); shirt.rotation.x = -.18; g.add(shirt);
    [-1, 1].forEach(k => {
      const L = new T.Shape(); L.moveTo(0, .38); L.lineTo(.2 * k, .38); L.lineTo(.5 * k, -.1); L.lineTo(.06 * k, -.75); L.lineTo(0, .38);
      const lap = extrude(L, .04, mat(shade(c1, -.12), { roughness: .4 }), .02); lap.position.set(.3 * k, 0, frontZ(.3, 0) - .02); lap.rotation.set(-.2, .28 * k, 0); g.add(lap);
    });
    if (style === 'suit') { const D = new T.Shape(); D.moveTo(0, .1); D.lineTo(.07, -.05); D.lineTo(0, -.55); D.lineTo(-.07, -.05); D.lineTo(0, .1); const tie = extrude(D, .03, mat(shade(c2, -.35)), .015); tie.position.set(0, .2, frontZ(0, .1) + .01); tie.rotation.x = -.18; g.add(tie); }
  }
  if (style === 'space') {
    const P = new T.Shape(); P.moveTo(-.42, -.2); P.lineTo(.42, -.2); P.lineTo(.42, .2); P.lineTo(-.42, .2); P.lineTo(-.42, -.2);
    const panel = extrude(P, .06, mat('#CBD5E1'), .05); panel.position.set(0, -.38, frontZ(0, -.38) - .01); panel.rotation.x = -.1; g.add(panel);
    ['#F97316', '#22D3EE', '#FBBF24'].forEach((c, i) => g.add(mesh(sphere(.07, 16, 12), glow(c), [-.22 + i * .22, -.38, frontZ(0, -.38) + .1])));
    g.add(mesh(new T.TorusGeometry(.62, .09, 16, 48), mat(c2), [0, .3, -.02], [Math.PI / 2, 0, 0], [1, TZ + .2, 1]));
  }
}
function buildNeckAcc(g, acc) {
  const c = acc.color, t = acc.type;
  if (t === 'chain') {
    const curve = new T.CatmullRomCurve3([[-.42, .34, .1], [-.3, .02, frontZ(.3, .02) + .04], [0, -.2, frontZ(0, -.2) + .05], [.3, .02, frontZ(.3, .02) + .04], [.42, .34, .1]].map(p => new T.Vector3(...p)));
    const gm = metal(c);
    for (let i = 0; i <= 26; i++) { const p = curve.getPoint(i / 26); g.add(mesh(sphere(.042, 10, 8), gm, [p.x, p.y, p.z])); }
    g.add(mesh(new T.CylinderGeometry(.13, .13, .05, 24), gm, [0, -.33, frontZ(0, -.33) + .06], [Math.PI / 2 - .15, 0, 0]));
  }
  if (t === 'bowtie') { const m = mat(c, { roughness: .45 }), z = frontZ(0, .28) + .12; [-1, 1].forEach(s => g.add(mesh(new T.ConeGeometry(.13, .28, 20), m, [.13 * s, .3, z], [0, 0, s * Math.PI / 2]))); g.add(mesh(sphere(.07, 16, 12), m, [0, .3, z + .02])); }
  if (t === 'scarf') { const m = mat(c, { roughness: .85, bumpMap: knitTexture(), bumpScale: .02 }); g.add(mesh(new T.TorusGeometry(.48, .18, 20, 48), m, [0, .42, 0], [Math.PI / 2 + .1, 0, 0], [1, TZ + .15, 1])); g.add(mesh(new T.BoxGeometry(.3, .75, .1), m, [.28, -.05, frontZ(.28, -.05) + .05], [-.12, 0, .1])); }
  if (t === 'bandana') { const m = mat(c, { roughness: .6 }); g.add(mesh(new T.ConeGeometry(.42, .6, 3), m, [0, .1, frontZ(0, .1) + .02], [Math.PI - .25, 0, 0], [1, 1, .25])); g.add(mesh(new T.TorusGeometry(.42, .07, 12, 40), m, [0, .38, 0], [Math.PI / 2, 0, 0], [1, TZ + .15, 1])); }
  if (t === 'medal') {
    const rib = mat(c, { roughness: .6 });
    [-1, 1].forEach(s => g.add(mesh(new T.BoxGeometry(.1, .6, .02), rib, [.14 * s, .08, frontZ(.14, .08) + .03], [-.2, 0, s * .35])));
    g.add(mesh(new T.CylinderGeometry(.2, .2, .05, 32), metal('#FBBF24'), [0, -.25, frontZ(0, -.25) + .06], [Math.PI / 2 - .15, 0, 0]));
    g.add(mesh(new T.CylinderGeometry(.13, .13, .06, 32), mat('#1d1233', { roughness: .2 }), [0, -.25, frontZ(0, -.25) + .08], [Math.PI / 2 - .15, 0, 0]));
  }
}

/* ---------- pose assise (bras + jambes) ---------- */
function buildSitting(g, sk) {
  const [style, c1, c2 = '#fff'] = sk.top;
  const sleeve = mat(style === 'tee' ? c2 : style === 'stripes' ? c1 : c1, { roughness: .75 });
  const skinM = mat(sk.skin, { roughness: .55 });
  const pants = mat(sk.pants || '#3B4A6B', { roughness: .8 });
  const shoe = mat(sk.shoes || '#F8FAFC', { roughness: .5 }), sole = mat('#E5E7EB');
  [-1, 1].forEach(s => {
    const x = s;
    const upper = style === 'tee' ? [[1.3 * x, -.05, 0], [1.45 * x, -.5, .1]] : [[1.3 * x, -.05, 0], [1.5 * x, -.7, .12]];
    g.add(tube([...upper], .3, sleeve));
    const fore = style === 'tee' ? skinM : sleeve;
    g.add(tube([[1.47 * x, -.55, .12], [1.45 * x, -1.05, .45], [1.0 * x, -1.28, .95]], .25, fore));
    g.add(mesh(sphere(.23, 24, 16), skinM, [.9 * x, -1.3, 1.05], null, [1, .75, 1.1]));
    g.add(tube([[.55 * x, -1.55, .1], [.6 * x, -1.6, .9], [.62 * x, -1.62, 1.5]], .42, pants));
    g.add(tube([[.62 * x, -1.62, 1.55], [.62 * x, -2.3, 1.62], [.62 * x, -2.85, 1.66]], .34, pants));
    g.add(mesh(sphere(.36, 24, 16), shoe, [.62 * x, -3.02, 1.86], null, [.95, .55, 1.35]));
    g.add(mesh(new T.CylinderGeometry(.34, .36, .07, 24), sole, [.62 * x, -3.2, 1.86], null, [1, 1, 1.4]));
  });
}
function roundedBox(w, h, d, r, material) {
  const sh = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
  sh.moveTo(x, y - r); sh.lineTo(x + W, y - r); sh.quadraticCurveTo(x + W + r, y - r, x + W + r, y); sh.lineTo(x + W + r, y + H); sh.quadraticCurveTo(x + W + r, y + H + r, x + W, y + H + r);
  sh.lineTo(x, y + H + r); sh.quadraticCurveTo(x - r, y + H + r, x - r, y + H); sh.lineTo(x - r, y); sh.quadraticCurveTo(x - r, y - r, x, y - r);
  const geo = new T.ExtrudeGeometry(sh, { depth: Math.max(.01, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r * .98, bevelSegments: 6, curveSegments: 10 });
  geo.translate(0, 0, -(d - 2 * r) / 2);
  return mesh(geo, material);
}
function buildLounge(g) {
  const velvet = mat('#2E8A7E', { roughness: .88 }), velvetD = mat('#256F66', { roughness: .9 });
  const wood = mat('#8B5A34', { roughness: .55 }), woodL = mat('#B07A4C', { roughness: .5 });
  const add = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); g.add(m); return m; };
  // Canapé
  add(roundedBox(6.2, .8, 2.3, .25, velvetD), 0, -2.6, .35);
  add(roundedBox(2.7, .55, 1.95, .24, velvet), -1.4, -1.95, .6);
  add(roundedBox(2.7, .55, 1.95, .24, velvet), 1.4, -1.95, .6);
  add(roundedBox(2.75, 1.9, .7, .3, velvet), -1.4, -.9, -.78, -.08);
  add(roundedBox(2.75, 1.9, .7, .3, velvet), 1.4, -.9, -.78, -.08);
  [-1, 1].forEach(s => add(roundedBox(.8, 1.55, 2.3, .34, velvetD), 3.2 * s, -1.75, .35));
  [[-2.8, .9], [2.8, .9], [-2.8, -.5], [2.8, -.5]].forEach(([x, z]) => add(mesh(new T.CylinderGeometry(.09, .06, .45, 12), wood), x, -3.18, z));
  add(roundedBox(1.05, 1.05, .34, .16, mat('#F97316', { roughness: .85 })), -2.35, -1.05, -.2, -.15, .35, .25);
  add(roundedBox(.95, .95, .3, .15, mat('#FBBF24', { roughness: .85 })), 2.45, -1.15, -.2, -.12, -.4, -.2);
  // Table d'appoint + platine
  const tx = 4.6;
  add(mesh(new T.CylinderGeometry(.95, .95, .12, 40), woodL), tx, -1.4, .5);
  add(mesh(new T.CylinderGeometry(.1, .14, 1.9, 16), wood), tx, -2.4, .5);
  add(mesh(new T.CylinderGeometry(.6, .7, .1, 32), wood), tx, -3.35, .5);
  add(roundedBox(1.25, .28, 1.0, .08, mat('#F5E6D3', { roughness: .5 })), tx, -1.2, .5);
  add(mesh(new T.CylinderGeometry(.4, .4, .04, 40), mat('#15101F', { roughness: .3 })), tx - .12, -1.04, .5);
  add(mesh(new T.CylinderGeometry(.13, .13, .05, 24), mat('#F97316')), tx - .12, -1.02, .5);
  add(mesh(new T.CylinderGeometry(.025, .025, .6, 8), metal('#D1D5DB')), tx + .38, -.99, .45, Math.PI / 2, 0, .5);
  // Lampe sur pied
  const lx = -4.7;
  add(mesh(new T.CylinderGeometry(.5, .6, .08, 32), wood), lx, -3.35, 0);
  add(mesh(new T.CylinderGeometry(.05, .05, 4.1, 12), mat('#3B2A20')), lx, -1.3, 0);
  add(mesh(new T.CylinderGeometry(.42, .78, .85, 32, 1, true), mat('#FFE8B0', { emissive: col('#FFC56B'), emissiveIntensity: .75, side: T.DoubleSide, roughness: .8 })), lx, .95, 0);
  // Plante
  add(mesh(new T.CylinderGeometry(.42, .32, .7, 24), mat('#C2410C', { roughness: .7 })), -3.55, -3.05, 1.5);
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; add(mesh(sphere(.3, 16, 12), mat(k % 2 ? '#4D7C0F' : '#65A30D', { roughness: .7 }), [0, 0, 0], null, [.45, 1.3, .25]), -3.55 + Math.cos(a) * .3, -2.1 + (k % 3) * .15, 1.5 + Math.sin(a) * .3, Math.sin(a) * .5, 0, -Math.cos(a) * .5); }
  // Ombre au sol
  const sh = mesh(new T.CircleGeometry(1, 48), new T.MeshBasicMaterial({ color: 0x3b1d10, transparent: true, opacity: .22, depthWrite: false }), [0, -3.39, .5], [-Math.PI / 2, 0, 0], [5.4, 1.9, 1]);
  trash.push(sh.material);
  g.add(sh);
}

/* ---------- scène ---------- */
function buildCharacter(sk, opts) {
  const accs = opts.accs || {};
  const skinAcc = sk.acc || [];
  const HEAD = ['beanie', 'cap', 'beret', 'crown', 'fedora', 'helmet', 'robot', 'bob', 'halo'], EYES = ['shades', 'round', 'stars', 'visor', 'hearts'];
  const head = accs.head || (HEAD.includes(skinAcc[0]) ? { type: skinAcc[0], color: skinAcc[1] } : null);
  const eyes = accs.eyes || (EYES.includes(skinAcc[0]) ? { type: skinAcc[0], color: skinAcc[1] } : null);
  const ears = accs.ears || (sk.phones ? { type: 'phones', color: sk.phones, glow: !!sk.glow } : null);
  const neck = accs.neck || (sk.extra === 'chain' ? { type: 'chain', color: '#FBBF24' } : null);
  const mood = opts.mood || 'happy';
  const [hairStyle, hairC = '#000'] = sk.hair;
  const skin = sk.skin;
  const root = new T.Group();

  buildBody(root, sk);
  if (neck) buildNeckAcc(root, neck);
  const neckM = mat(shade(skin, -.08), { roughness: .6 });
  root.add(mesh(new T.CylinderGeometry(.3, .36, .9, 32), neckM, [0, .72, -.04]));

  const H = new T.Group();
  H.position.set(0, 1.68, 0);
  H.rotation.set(.04, .12, 0);
  root.add(H);
  const skinM = mat('#fff', { map: skinTexture(skin), roughness: .52, emissive: col(skin).multiplyScalar(.1) });
  H.add(mesh(headGeometry(), skinM));
  const earM = mat(skin, { roughness: .55, emissive: col(skin).multiplyScalar(.08) });
  [-1, 1].forEach(s => H.add(mesh(sphere(.22, 24, 16), earM, [1.0 * s, .02, -.04], [0, s * .3, 0], [.5, 1, .75])));
  H.add(mesh(sphere(.17, 28, 20), mat(mix(skin, '#E06F66', .3), { roughness: .45 }), (() => { const [x, y, z] = S(0, -.2, -.07); return [x, y, z]; })(), null, [1.05, .88, .95]));
  const robot = head?.type === 'robot';
  if (!robot) {
    if (!(eyes && ['shades', 'visor', 'stars', 'hearts'].includes(eyes.type))) buildEyes(H, mood, sk.eyes || '#2A1A12', skin);
    buildBrows(H, mood, hairStyle === 'none' ? '#2A1810' : mix(hairC, '#2A1810', .1));
    buildMouth(H, mood, skin);
    if (sk.extra === 'moustache') { const m = mat(shade(hairC, -.05), { roughness: .7 }); [-1, 1].forEach(s => H.add(tube([S(.03 * s, -.33, .03), S(.16 * s, -.34, .02), S(.28 * s, -.42, 0)], .05, m))); }
  }
  buildHair(H, head && ['beanie', 'cap', 'fedora', 'bob'].includes(head.type) && hairStyle !== 'long' ? 'none' : hairStyle, hairC);
  if (head) buildHead(H, head);
  if (eyes && !robot) buildEyewear(H, eyes);
  if (ears) buildPhones(H, ears);
  return root;
}

function makeScene(sk, opts) {
  const scene = new T.Scene();
  scene.add(new T.HemisphereLight(0xE4EEFF, 0x8A5A44, .62));
  const key = new T.DirectionalLight(0xFFF0E0, 1.45); key.position.set(-2.4, 3.4, 4.4); scene.add(key);
  const fill = new T.DirectionalLight(0xD6E4FF, .55); fill.position.set(3.4, .6, 3.2); scene.add(fill);
  const rim = new T.DirectionalLight(0xFFFFFF, 1.1); rim.position.set(1.8, 2.8, -4); scene.add(rim);
  const glowC = sk.glow || (opts.accs?.ears?.glow && opts.accs.ears.color);
  if (glowC) { const pl = new T.PointLight(col(glowC), .8, 6); pl.position.set(0, 1.7, 1.6); scene.add(pl); }
  scene.add(buildCharacter(sk, opts));
  return scene;
}

function render(sk, opts = {}) {
  const r = getRenderer();
  if (!r) return null;
  const head = !!opts.head, room = !!opts.room;
  const w = room ? 720 : head ? 256 : 400, h = room ? 520 : head ? 256 : 440;
  r.setSize(w, h, false);
  const cam = new T.PerspectiveCamera(room ? 30 : head ? 24 : 27, w / h, .1, 60);
  if (room) { cam.position.set(0, 1.4, 17); cam.lookAt(0, -.75, 0); }
  else if (head) { cam.position.set(0, 1.85, 6.4); cam.lookAt(0, 1.72, 0); }
  else { cam.position.set(0, 1.75, 8.9); cam.lookAt(0, 1.2, 0); }
  const scene = makeScene(sk, opts);
  if (room) {
    const ch = scene.children[scene.children.length - 1];
    buildSitting(ch, sk);
    ch.position.set(0, .1, .35);
    const lounge = new T.Group(); buildLounge(lounge); scene.add(lounge);
    const lamp = new T.PointLight(0xFFC56B, .9, 12); lamp.position.set(-4.4, 1, 1.5); scene.add(lamp);
  }
  r.setClearColor(0x000000, 0);
  r.render(scene, cam);
  let url = r.domElement.toDataURL('image/webp', .9);
  if (!url.startsWith('data:image/webp')) url = r.domElement.toDataURL('image/png');
  while (trash.length) { const o = trash.pop(); try { o.dispose(); } catch (e) {} }
  return url;
}

/* ---------- cache + file de rendu (une image par frame, sans à-coups) ---------- */
const cache = new Map(), queue = new Map();
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
function keyOf(sk, opts) {
  const a = opts.accs || {};
  const s = JSON.stringify([sk.id ? sk.id : sk, opts.mood || 'happy', opts.head ? 1 : opts.room ? 2 : 0, Object.keys(a).sort().map(k => a[k] && (a[k].id || a[k].type + a[k].color))]);
  let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return 'c' + h.toString(36);
}
let pumping = false;
function pump() {
  pumping = false;
  const t0 = performance.now();
  for (const [k, job] of queue) {
    queue.delete(k);
    let url = null;
    try { url = render(job.sk, job.opts); } catch (e) { console.warn('avatar3d', e); ok = false; }
    if (!url) { document.querySelectorAll(`img[data-ck="${k}"]`).forEach(img => { img.outerHTML = C.svg(job.sk, job.opts); }); continue; }
    cache.set(k, url);
    document.querySelectorAll(`img[data-ck="${k}"]`).forEach(img => { img.src = url; img.classList.add('is-ready'); });
    if (performance.now() - t0 > 28) break;
  }
  if (queue.size && !pumping) { pumping = true; requestAnimationFrame(pump); }
}
// Même contrat que PompeChar.svg : renvoie du HTML à insérer tout de suite.
function html(sk, opts = {}) {
  if (!ok || !T) return C.svg(sk, opts);
  const k = keyOf(sk, opts), cls = `char char3d${opts.head ? ' char-head' : opts.room ? ' char-room' : ' char-bust'}`;
  const alt = sk.name ? ` alt="${String(sk.name).replace(/"/g, '&quot;')}"` : ' alt=""';
  if (cache.has(k)) return `<img class="${cls} is-ready" src="${cache.get(k)}"${alt} draggable="false">`;
  if (!queue.has(k)) queue.set(k, { sk, opts });
  if (!pumping) { pumping = true; requestAnimationFrame(pump); }
  return `<img class="${cls}" data-ck="${k}" src="${BLANK}"${alt} draggable="false">`;
}
// Rendu immédiat (pour pré-calculer une image avant de l'afficher)
function url(sk, opts = {}) {
  const k = keyOf(sk, opts);
  if (cache.has(k)) return cache.get(k);
  const u = ok ? render(sk, opts) : null;
  if (u) cache.set(k, u);
  return u;
}

C.html = html;
C.url = url;
C.is3d = () => ok && !!getRenderer();
})();
