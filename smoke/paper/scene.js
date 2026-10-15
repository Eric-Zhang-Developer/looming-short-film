// smoke-paper: one torn-paper cutout, a paper wall, two lights. Every frame is a pure function of t.
// Units are meters. Wall at z=0, desk top at y=0, camera out on +z.
import * as THREE from 'three';

const W = 1920, H = 1080;
const CUT_Z = 0.15;              // cutout stands 15 cm in front of the wall
const CUT_C = new THREE.Vector3(0, 0.025, CUT_Z);  // cutout center: its flat torn base sits on the desk
const PLANE = 0.075;             // the cutout texture spans 7.5 cm; the blob inside it is ~6 cm
const TEX = 512;                 // cutout texture px
const R_PX = 205;                // blob base radius in px: 2*205/512*0.075 = 6.0 cm
const TARGET_PHONE_SCALE = 3;
const BOIL_RATE = 10;            // edge re-tears 10x a second (doc 03: 8-12)

// ---------- seeded randomness ----------
export function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Periodic 1D value noise on u in [0,1), n lattice points, smoothstep between them.
function loopNoise(rng, n) {
  const v = Array.from({ length: n }, rng);
  return (u) => {
    const x = (((u % 1) + 1) % 1) * n, i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
    return v[i % n] * (1 - s) + v[(i + 1) % n] * s;
  };
}
// Layered value noise in [-1,1]: octaves double in frequency, halve in amplitude.
function fbm(rng, base, octaves) {
  const layers = Array.from({ length: octaves }, (_, o) => loopNoise(rng, base << o));
  return (u) => {
    let sum = 0, amp = 1, norm = 0;
    for (const l of layers) { sum += (l(u) * 2 - 1) * amp; norm += amp; amp *= 0.5; }
    return sum / norm;
  };
}

// ---------- paper textures (2D canvas) ----------
const canvas2d = (w, h = w) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const hex = (c) => new THREE.Color(c);

function grain(ctx, size, rng, amt) {
  const img = ctx.getImageData(0, 0, size, size), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 1 + (rng() * 2 - 1) * amt;
    d[i] *= g; d[i + 1] *= g; d[i + 2] *= g;
  }
  ctx.putImageData(img, 0, 0);
}

// A closed curve pushed in and out along its normals by `offset(u)` px.
function offsetCurve(base, offset) {
  const n = base.length;
  return base.map(([x, y], i) => {
    const [ax, ay] = base[(i - 1 + n) % n], [bx, by] = base[(i + 1) % n];
    let nx = by - ay, ny = -(bx - ax); // tangent rotated -90deg: outward for a CCW-in-canvas loop
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const o = offset(i / n);
    return [x + nx * o, y + ny * o];
  });
}
function tracePath(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}
function circle(cx, cy, r, n, radial) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, rr = r * (1 + radial(i / n));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
}

// The cutout: fixed blob silhouette, torn edge + rim + eye holes re-seeded every boil step.
// Returns { map, alphaMap } like doc 04's makePaper().
const SHAPE = fbm(mulberry32(7), 3, 2);   // the silhouette itself never boils
const EYES = [[TEX / 2 - 54, 214], [TEX / 2 + 54, 214]];
const EYE_R = 21;                          // ~3 mm
function makeCutout(seed) {
  const rng = mulberry32(1000 + seed);
  const tear = fbm(rng, 28, 5), rimN = fbm(rng, 40, 3);
  const N = 900;
  // A blob with a flattened base so it can stand on the desk (canvas y grows downward).
  const base = circle(TEX / 2, TEX / 2 + 4, R_PX, N, (u) => 0.08 * SHAPE(u)).map(([x, y]) => [x, Math.min(y, TEX / 2 + 4 + 0.8 * R_PX)]);
  const outer = offsetCurve(base, (u) => 8 * tear(u));                    // torn edge, +-8 px (~1 mm)
  const rimW = (u) => 2 + 4 * (rimN(u) * 0.5 + 0.5);                      // 2-6 px fiber rim
  const inner = offsetCurve(outer, (u) => -rimW(u));
  const eyes = EYES.map(([x, y]) => {
    const e = fbm(rng, 6, 3);
    return { hole: circle(x, y, EYE_R, 120, (u) => 0.12 * e(u)), rim: circle(x, y, EYE_R + 4, 120, (u) => 0.12 * e(u) + 0.04 * rimN(u)) };
  });

  // color map
  const c = canvas2d(TEX), ctx = c.getContext('2d');
  const rimCol = '#ECE6D4', green = '#6F8F5E';
  ctx.fillStyle = rimCol; ctx.fillRect(0, 0, TEX, TEX);
  ctx.fillStyle = green; tracePath(ctx, inner); ctx.fill();
  ctx.save(); tracePath(ctx, inner); ctx.clip();          // dry-brush streaks inside the fill
  for (let k = 0; k < 50; k++) {
    const y = rng() * TEX, x = rng() * TEX;
    ctx.strokeStyle = rng() < 0.5 ? 'rgba(40,60,35,0.10)' : 'rgba(170,200,150,0.08)';
    ctx.lineWidth = 4 + rng() * 12;
    ctx.beginPath(); ctx.moveTo(x - 120, y + (rng() - 0.5) * 20); ctx.lineTo(x + 120, y + (rng() - 0.5) * 20); ctx.stroke();
  }
  ctx.restore();
  for (const e of eyes) { ctx.fillStyle = rimCol; tracePath(ctx, e.rim); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,252,242,0.55)'; ctx.lineWidth = 1;             // streaky fibers along the rim
  for (let k = 0; k < 260; k++) {
    const i = Math.floor(rng() * N), [x, y] = outer[i], [bx, by] = outer[(i + 4) % N];
    const t = 0.3 + rng() * 0.6;
    const ix = x + (inner[i][0] - x) * t, iy = y + (inner[i][1] - y) * t;
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + (bx - x) * 2, iy + (by - y) * 2); ctx.stroke();
  }
  grain(ctx, TEX, rng, 0.07);

  // alpha mask: white paper, black holes
  const a = canvas2d(TEX), actx = a.getContext('2d');
  actx.fillStyle = '#000'; actx.fillRect(0, 0, TEX, TEX);
  actx.fillStyle = '#fff'; tracePath(actx, outer); actx.fill();
  actx.fillStyle = '#000'; for (const e of eyes) { tracePath(actx, e.hole); actx.fill(); }

  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const alphaMap = new THREE.CanvasTexture(a);
  return { map, alphaMap };
}

function makeStock(color, seed, fibers) {
  const S = 1024, c = canvas2d(S), ctx = c.getContext('2d'), rng = mulberry32(seed);
  ctx.fillStyle = color; ctx.fillRect(0, 0, S, S);
  for (let k = 0; k < fibers; k++) {
    const x = rng() * S, y = rng() * S, a = rng() * Math.PI, l = 6 + rng() * 30;
    ctx.strokeStyle = rng() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  grain(ctx, S, rng, 0.05);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

// ---------- renderer, scene, camera ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
// PCFSoftShadowMap was removed in three r186 (it logs a warning and falls back to PCFShadowMap,
// which is now a soft Vogel-disk PCF). Ask for PCF directly; softness comes from shadow.radius.
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = hex('#1E2440');
const camera = new THREE.PerspectiveCamera(20, W / H, 0.05, 10);
camera.position.set(0, 0.16, 1.05);
camera.lookAt(0, 0.075, 0.08);

// Ambient: navy above, a dim kraft bounce below. The unlit cream wall should land near night navy.
scene.add(new THREE.HemisphereLight(hex('#34489A'), hex('#4A3A28'), 1.2));

const wallTex = makeStock('#F2E8D5', 11, 1500); wallTex.repeat.set(6.4, 3.6);
const wall = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshLambertMaterial({ map: wallTex }));
wall.position.set(0, 0.42, 0); wall.receiveShadow = true; scene.add(wall);

const kraftTex = makeStock('#A8835A', 23, 9000); kraftTex.repeat.set(6.4, 1.7);
const deskMat = new THREE.MeshLambertMaterial({ map: kraftTex });
const desk = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.42), deskMat);
desk.rotation.x = -Math.PI / 2; desk.position.set(0, 0, 0.21); desk.receiveShadow = true; scene.add(desk);
const deskEdge = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.03), deskMat);
deskEdge.position.set(0, -0.015, 0.42); deskEdge.receiveShadow = true; scene.add(deskEdge);

// The cutout. alphaTest gives the crisp torn silhouette; customDepthMaterial puts the same alpha
// map in the shadow pass so the shadow is the torn shape with eye holes, not a rectangle.
const cutMat = new THREE.MeshLambertMaterial({ alphaTest: 0.5, side: THREE.DoubleSide });
const cutout = new THREE.Mesh(new THREE.PlaneGeometry(PLANE, PLANE), cutMat);
cutout.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5, side: THREE.DoubleSide });
cutout.position.copy(CUT_C); cutout.rotation.set(-0.03, 0.12, 0); // doc 03: nothing is perfectly flat
cutout.castShadow = true; scene.add(cutout);
const cutCache = new Map();
function setBoil(seed) {
  if (!cutCache.has(seed)) cutCache.set(seed, makeCutout(seed));
  const { map, alphaMap } = cutCache.get(seed);
  if (cutMat.map !== map) {
    cutMat.map = map; cutMat.alphaMap = alphaMap; cutMat.needsUpdate = true;
    cutout.customDepthMaterial.alphaMap = alphaMap; cutout.customDepthMaterial.needsUpdate = true;
  }
}

// ---------- lights, placed by doc 02's rule: scale = d(light->wall) / d(light->cutout) ----------
function spot(color, intensity, angle, penumbra, near) {
  const s = new THREE.SpotLight(hex(color), intensity, 0, angle, penumbra, 2);
  s.castShadow = true;
  s.shadow.mapSize.set(2048, 2048);
  s.shadow.camera.near = near; s.shadow.camera.far = 2;
  s.shadow.radius = 3;
  scene.add(s, s.target);
  return s;
}
// Where the ray light -> cutout center lands: first of the desk (y=0) or the wall (z=0).
function receiverHit(L) {
  const d = CUT_C.clone().sub(L).normalize();
  const ts = [];
  if (d.z < 0) ts.push(-L.z / d.z);
  if (d.y < 0) ts.push(-L.y / d.y);
  const t = Math.min(...ts);
  return L.clone().addScaledVector(d, t);
}
const shadowScale = (L) => L.distanceTo(receiverHit(L)) / L.distanceTo(CUT_C);

// Phone: low (lying near the desk), close, in front and a little to the left. Solve its distance
// along the chosen direction so the computed scale is exactly the target.
const phoneDir = new THREE.Vector3(-0.22, -0.15, 1).normalize();     // from cutout toward phone
const toWall = CUT_C.z / phoneDir.z;                                  // cutout -> wall along that ray
const phonePos = CUT_C.clone().addScaledVector(phoneDir, toWall / (TARGET_PHONE_SCALE - 1));
const phone = spot('#6FD3E3', 0.1, THREE.MathUtils.degToRad(35), 0.5, 0.005);
phone.position.copy(phonePos);
phone.target.position.copy(receiverHit(phonePos)).add(new THREE.Vector3(0, 0.05, 0));
phone.shadow.bias = -0.0004; phone.shadow.normalBias = 0.0;

// Lamp: high above, to the right and a little in front, so the pool shows beside the base.
const lampPos = new THREE.Vector3(0.2, 0.55, 0.24);
const lamp = spot('#F0A84A', 4.0, THREE.MathUtils.degToRad(17), 0.6, 0.2);
lamp.position.copy(lampPos);
lamp.target.position.set(0, 0, CUT_Z);
lamp.shadow.bias = -0.0003; lamp.shadow.normalBias = 0.0;

const info = {
  phone: { pos: phonePos.toArray(), scale: shadowScale(phonePos), hit: receiverHit(phonePos).toArray() },
  lamp: { pos: lampPos.toArray(), scale: shadowScale(lampPos), hit: receiverHit(lampPos).toArray() },
};

// ---------- tissue (optional): Lambert + back-lit translucency via onBeforeCompile ----------
// Adds translucency * max(0, -N.L) per direct light (doc 04 paperMaterial "Back" term).
function tissueMaterial(map, alphaMap) {
  const m = new THREE.MeshLambertMaterial({ map, alphaMap, alphaTest: 0.5, side: THREE.DoubleSide });
  m.userData.uTrans = { value: 0 };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTrans = m.userData.uTrans;
    const from = 'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );';
    const chunk = THREE.ShaderChunk.lights_lambert_pars_fragment;
    if (!chunk.includes(from)) throw new Error('lambert chunk changed; translucency hook needs updating');
    sh.fragmentShader = 'uniform float uTrans;\n' + sh.fragmentShader.replace('#include <lights_lambert_pars_fragment>',
      chunk.replace(from, from + '\n\tdotNL += uTrans * saturate( -dot( geometryNormal, directLight.direction ) );'));
  };
  return m;
}
function makeShade() {
  const S = 512, rng = mulberry32(77), tear = fbm(rng, 16, 4);
  const top = 0.32, bot = 0.48; // half-widths as fraction of S: a trapezoid lampshade
  const edge = [[0.5 - top, 0.12], [0.5 + top, 0.12], [0.5 + bot, 0.88], [0.5 - bot, 0.88]].map(([x, y]) => [x * S, y * S]);
  const pts = [];
  for (let k = 0; k < 4; k++) for (let i = 0; i < 200; i++) {
    const [ax, ay] = edge[k], [bx, by] = edge[(k + 1) % 4], f = i / 200;
    pts.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
  }
  const outer = offsetCurve(pts, (u) => 7 * tear(u)); // tissue: ragged, bigger tear
  const c = canvas2d(S), ctx = c.getContext('2d');
  ctx.fillStyle = '#F2E8D5'; ctx.fillRect(0, 0, S, S); grain(ctx, S, rng, 0.06);
  const a = canvas2d(S), actx = a.getContext('2d');
  actx.fillStyle = '#000'; actx.fillRect(0, 0, S, S); actx.fillStyle = '#fff'; tracePath(actx, outer); actx.fill();
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  return tissueMaterial(map, new THREE.CanvasTexture(a));
}
const shadeMat = makeShade();
const shade = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), shadeMat);
shade.position.set(0.12, 0.05, 0.12); shade.visible = false; scene.add(shade);
const bulb = new THREE.SpotLight(hex('#F0A84A'), 0.03, 0, THREE.MathUtils.degToRad(80), 0.5, 2);
bulb.position.set(0.12, 0.05, 0.1); bulb.target.position.set(0.12, 0.05, 1); bulb.visible = false;
scene.add(bulb, bulb.target);

// ---------- entry points ----------
function setState(t) {
  setBoil(Math.floor(t * BOIL_RATE));
  phone.visible = t < 2.5;
  lamp.visible = t >= 2.5;
}
window.renderFrame = (t) => { setState(t); renderer.render(scene, camera); };

// Tissue test: lamp off, a bulb behind the shade. trans=0 is plain Lambert, trans>0 adds the back term.
window.renderTissue = (trans) => {
  setState(0);
  phone.visible = lamp.visible = false;
  shade.visible = bulb.visible = true;
  shadeMat.userData.uTrans.value = trans;
  renderer.render(scene, camera);
  shade.visible = bulb.visible = false;
};

const gl = renderer.getContext();
function pixels() { const p = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, p); return p; }
function bbox(test) {
  let x0 = W, x1 = -1, y0 = H, y1 = -1, n = 0;
  for (let r = 0; r < H; r++) for (let x = 0; x < W; x++) {
    if (!test((r * W + x) * 4)) continue;
    const y = H - 1 - r; n++;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x0, x1, y0, y1, w: x1 - x0 + 1, h: y1 - y0 + 1, n };
}
// Screen px -> world point on a plane (to undo perspective: wall is farther than the cutout).
function onPlane(px, py, plane) {
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2((px + 0.5) / W * 2 - 1, -((py + 0.5) / H * 2 - 1)), camera);
  return ray.ray.intersectPlane(plane, new THREE.Vector3());
}
const worldWidth = (b, plane) => onPlane(b.x0, (b.y0 + b.y1) / 2, plane).distanceTo(onPlane(b.x1 + 1, (b.y0 + b.y1) / 2, plane));

// Measure the shadow against the cutout in the rendered image.
// Shadow = pixels that get darker when the (camera-invisible) cutout casts. Cutout = its own silhouette.
window.measure = (t, receiver) => {
  setState(t);
  cutMat.colorWrite = false; cutMat.depthWrite = false;
  renderer.render(scene, camera); const A = pixels();
  cutout.castShadow = false; renderer.render(scene, camera); const B = pixels();
  cutout.castShadow = true; cutMat.colorWrite = true; cutMat.depthWrite = true;
  const others = [wall, desk, deskEdge], bg = scene.background;
  others.forEach((m) => (m.visible = false)); scene.background = hex('#000');
  const flat = new THREE.MeshBasicMaterial({ color: '#fff', alphaMap: cutMat.alphaMap, alphaTest: 0.5, side: THREE.DoubleSide });
  cutout.material = flat; renderer.render(scene, camera); const C = pixels();
  cutout.material = cutMat; others.forEach((m) => (m.visible = true)); scene.background = bg; flat.dispose();
  const sh = bbox((i) => (B[i] + B[i + 1] + B[i + 2]) - (A[i] + A[i + 1] + A[i + 2]) > 24);
  const cu = bbox((i) => C[i] > 128);
  const recv = receiver === 'desk' ? new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) : new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const cutPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -CUT_Z);
  const shW = worldWidth(sh, recv), cuW = worldWidth(cu, cutPlane);
  renderFrame(t);
  return { shadowPx: sh, cutoutPx: cu, screenRatioW: sh.w / cu.w, screenRatioH: sh.h / cu.h, shadowWidth_m: shW, cutoutWidth_m: cuW, worldRatioW: shW / cuW };
};

// Crop helpers return PNG data URLs built from the WebGL canvas.
window.crop = (x, y, w, h) => {
  const c = canvas2d(w, h); c.getContext('2d').drawImage(renderer.domElement, x, y, w, h, 0, 0, w, h);
  return c.toDataURL('image/png');
};
window.strip = (times, x, y, w, h) => {
  const gap = 8, c = canvas2d(times.length * w + (times.length - 1) * gap, h), ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
  times.forEach((t, k) => { renderFrame(t); ctx.drawImage(renderer.domElement, x, y, w, h, k * (w + gap), 0, w, h); });
  return c.toDataURL('image/png');
};
window.png = () => renderer.domElement.toDataURL('image/png');
window.info = info;
window.ready = true;
