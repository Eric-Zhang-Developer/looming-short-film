// s07 · Blackout blinds: each one feeds it (docs/shots/s07.md, G4). v2 on the frozen home_kit: the bedroom in the
// morning, one locked frame, a time-lapse in single-frame pose pops. Two windows let the sun in as two bands on the
// floor; band B lies across the blob and the laptop. He installs two roller blinds, then games prone on the floor. Each
// time he looks at the blob he looks away to a window and pulls its blind down: that band goes out on the beat
// (blind1, blind2), the room steps darker, and half a second later the blob gulps (gulp3, gulp4) and its wall shadow
// steps up a size. Cause and effect: less day → the screen owns the room → the shadow grows.
// Light: the sun is a dawnLight behind the wall that reaches the room only through two exact window holes in a hidden
// blocker; each blind has its own hidden blocker (1.5 mm side gaps). The laptop screen is the loom key at L (S = 10).
// Its level steps with the daylight (README §4's out-shone rule), and a warm daylight bounce steps down with each band,
// so the loom's contrast goes about 20% → 50% → full. Characters on 2s, light at 24, boil 10/s.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, dawnLight, ambient, aim } from '../lights.js';
import { onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { POSES, specPose } from '../characters/poses.js';

const ID = 's07', DEG = Math.PI / 180;
const F = (s) => Math.round(s * 12) / 12;   // spec times (0.17, 0.33 ...) are 2s drawings: snap them to twelfths
const BLOB_R = { start: 0.018, gulp3: 0.021, gulp4: 0.024 };   // METER.gulp2 → gulp3 → gulp4 (README §1)
const GULP = { gulp3: 6.5, gulp4: 8.5 };                       // src/timeline.js beats (local)
const BLIND = { A: 6.0, B: 8.0 };                              // blind1, blind2
const CEIL = 0.145;                       // cartoon allowance over the real 0.134, so the 2× shadow's eyes land on the wall
const L = new THREE.Vector3(-0.010, 0.018, 0.4222);            // the screen light: the spec's z (S = 10); x, y moved (see B)
// The blob's contact point. Spec x −0.005 with L.x 0: both move 1 cm left so his head and the blob don't overlap on
// screen, and L.y sits at the lid's top so the 2× shadow's eyes land on the wall, not the ceiling (S depends on z only).
const B = new THREE.Vector3(-0.019, 0, 0.38);
const CAM = new THREE.Vector3(-0.04, 0.084, 0.95), LOOK = new THREE.Vector3(-0.04, 0.072, 0.20);   // under the ceiling, a little down onto the floor
// Windows: centres, the frame's visible height, and the glass hole (relative to the centre) the sun passes through.
const WIN = { A: -0.168, B: -0.088, y: 0.068, h: 0.062 };
const HOLE = { hw: 0.0245, y0: -0.024, y1: 0.024 };            // half-width; bottom and top from WIN.y
const GAP = 0.0015;                                            // blind side gaps (s08's dawn seams)
const SUN = { k: 0.9, el: 12 * DEG, az: 17 * DEG, gain: 3 };   // morning gold; elevation, azimuth toward +x; × dawnLight's level
const DROP = 1.13;                                             // blind_down's y stretch so its cloth reaches the sill
// Loom and room levels (ponytail: tuned by measurement, evidence/v2-home-b/checks.txt).
const SPOT = 0.75;                                             // screen spot at level 1.0, cd
const LEVEL = [[0, 0.2], [BLIND.A, 0.5], [BLIND.B, 1.0]];      // screen level steps with the daylight (spec)
// Ambient as a fraction of s02's 0.8: the spec's 0.6 / 0.35, then 0.03, not 0.15, so the full loom clears 90% contrast
// through the night LUT's lifted blacks (measured).
const AMB = [[0, 0.6], [BLIND.A, 0.35], [BLIND.B, 0.03]];
// Warm daylight bounce (a hemisphere fill) with both bands in, one, none: the sun's share of the room, which is what
// keeps the loom faint in the morning and what each blind takes away.
const BOUNCE = [[0, 1.6], [BLIND.A, 0.4], [BLIND.B, 0]];
const FACE_FILL = 0.0008;                                      // the cyan face fill as a fraction of the spot (by eye: his snout read white at 0.0015)
const step = (t, keys) => keys.reduce((v, [k, x]) => (t >= k ? x : v), keys[0][1]);

const PAD = 0.04;
function torn(w, h) {
  const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}

// ---- The Student, one drawing at a time. → { st (0 window A, 1 window B, 2 prone, 3 at A, 4 at B), pose, eyes, mouth, lift }
const up = (o) => specPose({ leg: 0, farLeg: 8, ...o });
const RAISE = up({ lean: 0, arm: 61, far: 56, head: 20 });
const HOLD_UP = up({ lean: -2, arm: 85, far: 85, head: 15 });
const BAR = up({ lean: -4, arm: 40, far: 30, head: 12 });     // a hand on the blind's bottom bar
const PULL = up({ lean: -6, arm: -10, far: -20, head: 4 });   // the bar pulled down to the sill
const LOOK_UP = { ...POSES.prone, head: POSES.prone.head - 12 * DEG };   // chin lifts toward the window
const TAPS = [4.33, 4.83, 5.17, 6.67, 7.17, ...Array.from({ length: 6 }, (_, i) => 9.33 + 0.5 * i)].map(F);
function act(T) {
  if (T < 2) {
    const pose = T < F(0.17) ? RAISE : T < F(0.33) ? POSES.drill_a : T < F(1.67) ? (Math.round(T * 12) % 2 ? POSES.drill_b : POSES.drill_a)
      : T < F(1.83) ? POSES.drill_a : POSES.blow;
    return { st: 0, pose, eyes: T >= F(0.33) && T < F(1.67) ? 'closed' : 'open', mouth: T < F(1.83) ? 'line' : 'o', lift: 0.003 };
  }
  if (T < 4) {
    const pose = T < F(2.17) ? HOLD_UP : T < F(2.5) ? POSES.crouch : T < F(3.67) ? HOLD_UP : POSES.stand;
    return { st: 1, pose, eyes: 'open', mouth: T < F(3.67) ? 'line' : 'smile', lift: T >= F(2.5) && T < F(3.67) ? 0.003 : 0 };
  }
  const prone = (eyes, mouth = 'neutral') => ({ st: 2, pose: TAPS.some((k) => Math.abs(T - k) < 1e-6) ? POSES.prone_flick : POSES.prone, eyes, mouth, lift: 0 });
  if (T < F(5.67)) {
    if (T >= F(4.5) && T < F(4.67)) return prone('closed', 'line');   // the glare: a squint
    if (T >= F(5.33) && T < F(5.5)) return prone('side');              // the look, at the blob
    if (T >= F(5.5)) return { ...prone('open'), pose: LOOK_UP };        // the look-away, to the window
    return prone('tired');
  }
  if (T < F(6.17)) return { st: 3, pose: T < F(5.83) ? BAR : PULL, eyes: 'open', mouth: 'line', lift: 0 };
  if (T < F(7.67)) {
    if (T >= F(7.33) && T < F(7.5)) return prone('side');
    if (T >= F(7.5)) return { ...prone('open'), pose: LOOK_UP };
    return prone('tired');
  }
  if (T < 9) return { st: 4, pose: T < F(7.83) ? BAR : PULL, eyes: 'open', mouth: 'line', lift: 0 };
  return prone('tired');
}
// Root [hip x, body-plane z, facing] per station. Prone: head x ≈ 0.045, feet ≈ 0.155, facing frame-left.
const PLACE = [[WIN.A - 0.022, 0.03, 1], [WIN.B + 0.020, 0.03, -1], [0.090, 0.405, -1], [WIN.A - 0.020, 0.03, 1], [WIN.B - 0.020, 0.03, 1]];
// The Exam's eyes as time passes: [eyes, look].
function examEyes(T) {
  if (T < 2) return ['open', 1];
  if (T < 4) return ['side', -1];
  if ((T >= F(GULP.gulp3 - 0.083) && T < GULP.gulp3) || (T >= F(GULP.gulp4 - 0.083) && T < GULP.gulp4)) return ['closed', 1];
  if (T >= F(10.25)) return ['worried', 1];
  if (T >= F(9.42)) return ['side', -1];   // up-left at its own shadow
  return ['open', 1];
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (a, b, k) => '#' + new THREE.Color(PALETTE[a]).lerp(new THREE.Color(PALETTE[b]), k).getHexString();
  const tiltOf = (k) => { const r = mulberry32(seedOf(ID, k)); return [(2 * r() - 1) * 1.2 * DEG, (2 * r() - 1) * 1.2 * DEG, 0]; };
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.copy(CAM);
  camera.lookAt(LOOK);

  // ---------- paper helpers (as s04): nothing casts unless it is set to below ----------
  const boiling = [];
  const paper = (key, opts, mat) => {
    const make = (s) => makePaper({ ...opts, key: `${ID}-${key}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    mesh.castShadow = false;
    boiling.push([mesh, make]);
    return mesh;
  };
  const group = (mesh, at, { rot = null } = {}) => {
    const g = new THREE.Group();
    g.add(mesh); g.position.set(...at);
    if (rot) g.rotation.set(...rot);
    scene.add(g);
    return g;
  };
  const cut = (a, p, [w, h], key, o = {}) => {
    const [sw, sh] = a.sizes[p], [u0, v0, u1, v1] = a.visible[p], vw = sw * (u1 - u0), vh = sh * (v1 - v0);
    const sx = w != null ? w / vw : h / vh, sy = h != null ? h / vh : sx, [ax, ay] = o.anchor ?? [0.5, 0.5];
    const mesh = paper(key, { art: a.pieces[p], size: [sw, sh], weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat);
    mesh.scale.set(sx, sy, 1);
    mesh.position.set(-((u0 + u1) / 2 - 0.5) * sw * sx + (0.5 - ax) * vw * sx, ((v0 + v1) / 2 - 0.5) * sh * sy + (0.5 - ay) * vh * sy, 0);
    const inner = new THREE.Group(); inner.add(mesh);
    if (o.tilt) inner.rotation.set(...tiltOf(key));
    const g = new THREE.Group(); g.add(inner); (o.parent ?? scene).add(g);
    if (o.at) g.position.set(...o.at);
    if (o.rot) g.rotation.set(...o.rot);
    return { g, inner, mesh, size: [vw * sx, vh * sy] };
  };
  const tiled = (a, p, nx, ny) => {
    const bmp = a.pieces[p], [u0, v0, u1, v1] = a.visible[p], E = 4;
    const tw = Math.round((u1 - u0) * bmp.width) - 2 * E, th = Math.round((v1 - v0) * bmp.height) - 2 * E;
    const c = Object.assign(document.createElement('canvas'), { width: tw * nx, height: th * ny }), g = c.getContext('2d');
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g.drawImage(bmp, u0 * bmp.width + E, v0 * bmp.height + E, tw, th, i * tw, j * th, tw, th);
    return c;
  };
  // A shadow-only plane: invisible to the camera, opaque to shadow maps.
  const ghost = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
  const blocker = ([x0, x1, y0, y1], z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), ghost);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z);
    m.castShadow = true;
    scene.add(m);
    return m;
  };

  const home = await assets.load('home_kit');

  // ---------- room shell ----------
  // Wall (z 0, the shadow receiver, untilted, no translucency: the sun behind it must reach the room only through the
  // blocker's holes). Ceiling (lifted navy so the loom reads on it), floor (the kit's plank strip, tiled).
  const wall = paper('apt_wall', { ...torn(1.1, CEIL + 0.04), color: PALETTE.cream, res: 2048 }, { translucency: 0, edgeCatch: 0 });
  group(wall, [-0.05, CEIL / 2, 0]);
  group(paper('apt_ceiling', { ...torn(1.1, 0.6), color: col('navy', 'cream', 0.12), res: 512 }, { translucency: 0, edgeCatch: 0 }), [-0.05, CEIL, 0.3], { rot: [Math.PI / 2, 0, 0] });
  group(paper('apt_floor', { art: tiled(home, 'floor_strip', 4, 12), size: [1.1, 0.66], weight: 'kraft', res: 2048 }, { translucency: 0, edgeCatch: 0 }),
    [-0.05, 0, 0.33], { rot: [-Math.PI / 2, 0, 0] });
  // Hidden blocker behind the wall with the two exact window holes.
  const holes = ['A', 'B'].map((k) => [WIN[k] - HOLE.hw, WIN[k] + HOLE.hw, WIN.y + HOLE.y0, WIN.y + HOLE.y1]);
  const [ha, hb] = holes;
  for (const r of [[-2, ha[0], -1, 2], [ha[1], hb[0], -1, 2], [hb[1], 2, -1, 2], [ha[0], hb[1], ha[3], 2], [ha[0], hb[1], -1, ha[2]]]) blocker(r, -0.004);

  // ---------- windows: tissue glass, the kit's frame, the rolled blind (up) and the blind (down) with a hidden blocker ----------
  const blinds = {};
  for (const [i, k] of [[0, 'A'], [1, 'B']]) {
    const x = WIN[k];
    const glass = cut(home, 'window_glass', [2 * HOLE.hw + 0.004, HOLE.y1 - HOLE.y0 + 0.004], `glass${k}`, { weight: 'tissue', mat: { translucency: 0.9, edgeCatch: 0 }, at: [x, WIN.y, 0.002] });
    const fr = cut(home, 'window_frame', [null, WIN.h], `frame${k}`, { at: [x, WIN.y - 0.002, 0.003], mat: { edgeCatch: 0 } });   // no rim glow: behind a blind the sill read as broken white
    fr.mesh.castShadow = true;   // its mullions put a cross in each floor patch
    const top = WIN.y - 0.002 + WIN.h / 2;
    const upPiece = cut(home, 'blind_up', [fr.size[0] * 0.98, null], `blindup${k}`, { anchor: [0.5, 1], at: [x, top + 0.004, 0.006] });
    // Down: the roller stays at the top and the cloth runs to the sill, anchored at its top so half down is a y scale.
    const down = cut(home, 'blind_down', [fr.size[0] * 0.98, null], `blinddown${k}`, { anchor: [0.5, 1], at: [x, top + 0.004, 0.0055] });
    down.mesh.material.color.setScalar(0.55);   // a blackout cloth: the painted cream, dimmed
    down.mesh.material.userData.paper.uTranslucency.value = 0;
    const block = blocker([x - HOLE.hw + GAP, x + HOLE.hw - GAP, WIN.y + HOLE.y0 - 0.002, WIN.y + HOLE.y1 + 0.002], 0.0045);
    blinds[k] = { up: upPiece, down, block, glass, hole: holes[i] };
  }

  // ---------- dressing: bookshelf and floor lamp (left), poster (right of the windows), bed (frame-right), rug, laundry ----------
  cut(home, 'bookshelf', [null, 0.090], 'bookshelf', { anchor: [0.5, 0], at: [-0.275, 0, 0.012] });
  cut(home, 'poster_b', [0.034, null], 'poster', { at: [0.012, 0.080, 0.002], tilt: true });
  cut(home, 'floor_lamp', [null, 0.080], 'floor_lamp', { anchor: [0.5, 0], at: [-0.225, 0, 0.03] });
  // The bed, made as s08 makes it (keep the two in step): near side at z 0.355, the mattress top a card back to z 0.27.
  const BED = { x0: 0.10, z: 0.355, back: 0.27, matB: 0.021, matH: 0.016 }, MT = BED.matB + BED.matH;
  cut(home, 'bed_frame', [0.120, null], 'bed_frame', { anchor: [0, 0], at: [BED.x0, 0, BED.z] });
  cut(home, 'bed_mattress', [0.104, BED.matH], 'bed_mattress', { anchor: [0, 0], at: [BED.x0 + 0.008, BED.matB, BED.z + 0.002] });
  group(paper('bed-top', { ...torn(0.104, BED.z - BED.back), color: col('cream', 'kraft', 0.12), res: 512 }),
    [BED.x0 + 0.060, MT - 0.0005, (BED.z + BED.back) / 2], { rot: [-Math.PI / 2, 0, 0] });
  cut(home, 'bed_pillow', [0.036, null], 'bed_pillow', { anchor: [0.5, 0], at: [0.172, MT - 0.002, 0.292] });
  cut(home, 'bed_blanket', [0.080, null], 'bed_blanket', { anchor: [0.5, 1], at: [0.185, MT + 0.010, 0.318], weight: 'tissue' });
  cut(home, 'laundry_pile', [0.030, null], 'laundry', { anchor: [0.5, 0], at: [0.115, 0, 0.33], tilt: true });
  cut(home, 'rug', [0.10, null], 'rug', { at: [0.05, 0.0006, 0.40], rot: [-Math.PI / 2, 0, 0] });
  // The drill: apt_props_sheet isn't frozen and its proxy is a plain navy box, so it's drawn here: body, grip, bit, battery.
  const drillArt = (() => {
    const c = Object.assign(document.createElement('canvas'), { width: 256, height: 224 }), g = c.getContext('2d');
    g.fillStyle = col('navy', 'kraft', 0.25);
    g.beginPath(); g.roundRect(40, 20, 170, 64, 26); g.fill();           // body
    g.beginPath(); g.roundRect(70, 70, 50, 110, 14); g.fill();           // grip
    g.fillStyle = col('kraft', 'navy', 0.2); g.beginPath(); g.roundRect(50, 170, 92, 40, 10); g.fill();   // battery
    g.fillStyle = col('cream', 'navy', 0.3); g.fillRect(208, 44, 40, 14);   // bit
    return c;
  })();
  const drillPiece = (key, o) => {
    const mesh = paper(key, { art: drillArt, size: [0.016, 0.014], res: 256 });
    const g = new THREE.Group(); g.add(mesh); (o.parent ?? scene).add(g); g.position.set(...o.at);
    return { g, mesh };
  };
  const drill = drillPiece('drill', { at: [-0.06, 0.007, 0.10] });

  // ---------- the laptop on the floor: screen toward his face (+x), turned 40° toward camera. The screen glows. ----------
  const laptop = new THREE.Group();
  laptop.position.set(L.x - 0.002, 0, L.z);
  laptop.rotation.y = 50 * DEG;   // local +z (the screen's face) → (+x, +z)
  scene.add(laptop);
  cut(home, 'laptop_base', [0.018, null], 'laptop_base', { anchor: [0.5, 0], parent: laptop, at: [0, 0.0003, 0.004] });
  const scr = cut(home, 'laptop_screen', [0.0185, null], 'laptop_screen', { anchor: [0.5, 0], parent: laptop, at: [0, 0.005, 0] });
  const gameArt = (() => {   // a game, no text: a cyan sky, navy platforms, a cream hero dot
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 80 }), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 80); gr.addColorStop(0, PALETTE.phone); gr.addColorStop(1, col('phone', 'cream', 0.5));
    g.fillStyle = gr; g.fillRect(0, 0, 128, 80);
    g.fillStyle = col('navy', 'phone', 0.3);
    for (const [x, y, w] of [[6, 62, 44], [60, 48, 30], [96, 34, 26], [0, 74, 128]]) g.fillRect(x, y, w, 6);
    g.fillStyle = PALETTE.cream; g.beginPath(); g.arc(72, 41, 5, 0, 7); g.fill();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(scr.size[0] * 0.78, scr.size[1] * 0.70), new THREE.MeshBasicMaterial({ map: gameArt }));
  glow.position.set(0, 0.005 + scr.size[1] * 0.53, 0.0006);
  laptop.add(glow);

  // ---------- the Student ----------
  const gator = await makeGator({ assets }, { seed: 7 });
  scene.add(gator.group);
  const drillHand = drillPiece('drill-hand', { parent: gator.hand, at: [0.005, -0.003, 0.001] });
  const roller = cut(home, 'blind_up', [0.062, null], 'roller-hand');   // blind B's roller, in his raised hands until 3.50
  gator.group.traverse((o) => { o.castShadow = false; });   // 2 cm from the screen he would throw a 25× shadow; the spec has him throw none
  const POSE = {}, KEYS = [];
  for (let i = 0; i <= 144; i++) { POSE[i] = act(i / 12).pose; KEYS.push([i / 12, String(i)]); }

  // ---------- the Exam on the floor at B: 1.5×, gulps to 1.75× (blind 1) and 2× (blind 2) ----------
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.mesh.position.copy(B);
  exam.stain.position.set(B.x, 0.0008, B.z);
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  const sun = dawnLight();
  const sunDir = new THREE.Vector3(Math.sin(SUN.az) * Math.cos(SUN.el), -Math.sin(SUN.el), Math.cos(SUN.az) * Math.cos(SUN.el));   // travel
  sun.light.target.position.set((WIN.A + WIN.B) / 2, WIN.y, 0);
  Object.assign(sun.light.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3, near: 0.5, far: 3 });
  sun.light.shadow.mapSize.set(4096, 4096); sun.light.shadow.radius = 1;
  sun.light.shadow.camera.updateProjectionMatrix();
  scene.add(sun.light, sun.light.target);
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 1.0, intensity: 0 });
  spot.position.copy(L);
  scene.add(spot, spot.target);
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);   // cyan face fill, toward camera from the screen
  fill.position.set(L.x + 0.015, L.y + 0.004, L.z + 0.012);
  const amb = ambient();
  const bounce = new THREE.HemisphereLight(new THREE.Color(PALETTE.lamp).lerp(new THREE.Color(PALETTE.cream), 0.5), PALETTE.kraft, 0);
  scene.add(fill, amb, bounce);

  const fx = post({ focus: 0.95, aperture: 0.012, lut: 'dawn' });
  const C = new THREE.Vector3(), hit = new THREE.Vector3(), hand = new THREE.Vector3();

  return {
    exam, spot, sun, amb, bounce,   // for measurement pages only
    update(tLocal) {
      const T = onTwos(tLocal), A = act(T), [hx, hz, face] = PLACE[A.st];
      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));

      // ---- Student ----
      gator.boil(tLocal, 10);
      gator.blend(POSE, KEYS, tLocal);
      gator.face({ eyes: A.eyes, mouth: A.mouth });
      gator.group.position.set(hx, hipHeight(A.pose) + A.lift, hz);
      gator.group.scale.x = face;
      drillHand.g.visible = T < 2;
      drillHand.g.rotation.z = -(gator.joints.body.rotation.z + gator.joints.arm_r.rotation.z);   // held level
      drill.g.visible = T >= 2;
      gator.group.updateMatrixWorld(true);
      gator.hand.getWorldPosition(hand);
      roller.g.visible = T >= 2 && T < F(3.5);
      roller.g.position.set(hand.x, hand.y + 0.002, 0.045);

      // ---- blinds: A is up from the 2.0 pop; B snaps in at 3.50. Each comes half down one drawing before its beat. ----
      for (const k of ['A', 'B']) {
        const { up, down, block, glass, hole } = blinds[k], at = BLIND[k], installed = k === 'A' ? T >= 2 : T >= F(3.5);
        const frac = T >= at ? 1 : T >= F(at - 0.17) ? 0.5 : 0;
        up.g.visible = installed && frac === 0;
        down.g.visible = frac > 0;
        down.g.scale.y = (frac || 1) * DROP;
        block.visible = frac > 0;
        glass.g.visible = frac < 1;   // a blackout blind: no glow below its cloth once it's down
        const h = hole[3] - hole[2] + 0.004;
        block.scale.y = frac || 1;
        block.position.y = hole[3] + 0.002 - h * (frac || 1) / 2;
      }

      // ---- the Exam: gulps on the beats (README §1): squash and eyes closed one drawing before, the snap stretched on
      // the beat, a settle over 0.25 s, wobble down 0.2 for a second ----
      const g0 = tLocal >= GULP.gulp4 ? GULP.gulp4 : tLocal >= GULP.gulp3 ? GULP.gulp3 : null;
      const r = g0 === GULP.gulp4 ? BLOB_R.gulp4 : g0 === GULP.gulp3 ? BLOB_R.gulp3 : BLOB_R.start;
      exam.mesh.scale.setScalar(r / BLOB_R.start);
      exam.stain.scale.setScalar(r / BLOB_R.start);
      let squash = 0, wobble = 1;
      if ((T >= F(GULP.gulp3 - 0.083) && T < GULP.gulp3) || (T >= F(GULP.gulp4 - 0.083) && T < GULP.gulp4)) squash = 0.3;
      else if (g0 !== null && T < g0 + 0.25) squash = -0.2 * Math.exp(-12 * (T - g0));
      else if (T >= F(5.33) && T < F(5.5)) squash = -0.1;   // a hopeful stretch when he looks
      if (g0 !== null && T < g0 + 1) wobble = 0.8;
      const [eyes, look] = examEyes(T);
      const bands = (tLocal < BLIND.A ? 1 : 0) + (tLocal < BLIND.B ? 1 : 0);
      exam.update(tLocal, { squash, wobble, eyes, look, key: bands > 0 ? sun.light : spot });

      // ---- light: the sun through the windows; the screen spot at L aimed along L → blob centre to its wall hit ----
      sun.update(tLocal, SUN.k);
      sun.light.intensity *= SUN.gain;
      sun.light.position.copy(sun.light.target.position).addScaledVector(sunDir, -1.5);
      C.set(B.x, B.y + 1.08 * r, B.z);
      hit.copy(C).sub(L).multiplyScalar(L.z / (L.z - C.z)).add(L);
      aim(spot, exam.mesh);
      spot.shadow.camera.near = 0.004;
      spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hit);
      spot.target.updateMatrixWorld();
      const level = step(tLocal, LEVEL);
      spot.intensity = SPOT * level;
      fill.intensity = FACE_FILL * SPOT * Math.max(level, 0.5);
      amb.intensity = 0.8 * step(tLocal, AMB);
      bounce.intensity = step(tLocal, BOUNCE);

      // DOF: the windows during the installs, then him and the blob.
      fx.set(T < 4 ? { focus: 0.93, aperture: 0.012 } : { focus: 0.56, aperture: 0.010 });
      fx.set({ lut: bands > 0 ? 'dawn' : 'night' });   // morning while any sun is in; the screen's night from blind2
    },
  };
}
