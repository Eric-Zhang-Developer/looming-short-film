// @ts-check
// s09c · The walk (docs/shots/s09c.md, v4; climax-a2). Campus at night, side on: a straight paver path under five
// low street lamps, Century Tower ahead, the oaks and the campus roofs behind. He walks to Marston on the pulse. Every
// lamp is a heartbeat: under a lamp the light is overhead and the blob's shadow is a puddle; between lamps the light is
// far and low and the shadow runs long (the film's rule). Once the blob plants itself in his path and lamp 4 throws its
// shadow back over him; he looks at it and steps around it. Then Marston's ribbon windows, warm, and he turns into depth
// toward its door. Characters on 2s, light and camera on 1s, boil 10/s.
// The 2.5× blob (Q16, director 2026-10-18). s10 imports the lamp constants: lamp 5 is the light behind him at the door.
import * as THREE from 'three';
import { ambient } from '../lights.js';
import { kf, ease, clamp, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { SHOTS } from '../timeline.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { POSES, specPose, walk } from '../characters/poses.js';
import { act } from '../characters/acting.js';
import { createBlob } from '../blob.js';
import { kitTools, mppOf, noCast, glow } from './s11.js';
import { closeupRig, HEAD_AT } from './s09b.js';

const ID = 's09c', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;
export const BLOB_R = { start: 0.030 };                 // 2.5× (README §1, Q16)
const lin = (x) => x;

// His root x(t): the spec's table, keyed on the timeline's beats (never hard-coded beat times). The resolve lands at
// DECIDE, not 11.0: act() needs 12 frames of flinch and 12 of dread after the block (see done note), so he stands until it.
const DECIDE = B.blobBlocks + 7 / 6;                    // 11.167
const XT = [[B.walkStart, -0.120], [B.lamp1, 0.000], [B.lamp2, 0.238], [B.lamp3, 0.478], [9.5, 0.558], [B.blobBlocks, 0.590],
  [DECIDE, 0.590], [B.stepAround, 0.690], [B.lamp4, 0.825], [B.lamp5, 0.975], [18.0, 1.305]];
export const X = (t) => kf(t, XT, lin);
const WALK_Z = 0.10, AROUND_Z = 0.13, HEEL = [-0.045, 0.015];   // blob contact from his root: behind him, camera side
const TURN = 18.0, END = [1.36, -0.115];                // the turn into depth, and where he is at the cut
const BLOCK = [0.650, 0.104];                           // the block: in his path, a hair in front of his plane

// The lamps. Each lamp beat is the frame the blob is under that lamp, so the lamp x's come from x(t) − 0.045.
export const LAMP_H = 0.095;   // the light point, just above his head top (0.085). fix-walk: 0.105 → 0.095 stretches the
// shadow's tip (s = H / (H − 0.060): 2.33 → 2.71); the puddles grow a little (1.32–1.36 → 1.41–1.45×, probe). Mid-span the shadow
// now runs to the frame's edge, so the frame, not the lamp, sets how long it measures.
// fix-walk: the lamps stand on the path's far edge, behind the hedge line, not on his walk line. The blob is a flat
// cutout facing the lens; a lamp in its own plane throws it as a hairline along the path (cold-v4: "a ground puddle").
// 7 cm behind it, the lamp throws it forward across the paving as a wedge as wide as the blob is tall.
const LAMP_Z = 0.045;
const LAMP_BEATS = ['lamp1', 'lamp2', 'lamp3', 'lamp4', 'lamp5'];
export const LAMP_X = LAMP_BEATS.map((b) => X(B[b]) + HEEL[0]);   // −0.045, 0.193, 0.433, 0.780, 0.930
// Key hand-overs (1 → 2, 2 → 3, 3 → 4 on the blob's landing, 4 → 5), each a 0.25 s crossfade centred on a pulse beat.
const HANDOVER = [4.0, 7.0, B.blobBlocks, 14.5], FADE = 0.25;
export const LAMP_COOL = (PALETTE) => new THREE.Color(PALETTE.cream).lerp(new THREE.Color(PALETTE.phone), 0.3);
export const KEY_I = 1.6;                                // cd, decay 0 (stylized: the long shadow stays as dark as the puddle)
const POOL_I = 0.002, POOL_D = 0.22;                    // each lamp's own non-casting pool light, decay 2
const AMB_K = 0.3, FILL_I = 0.010, WARM_I = 0.25;
// fix-walk: the wide is pushed in (0.71 → 0.59 m) and looks down 11° (was 9°), so his slump reads at 400 px and the
// paving, the shadow's receiver, is a band; steeper lost the sky and the tower. It centres on the blob, so the key lamp and the shadow's tip
// both stay in frame either side of each lamp.
const CAM_Y = 0.160, CAM_Z = [[B.blobBlocks, 0.70], [B.stepAround, 0.62]], LOOK_Y = 0.050, LOOK_Z = 0.12;
// The block's close-up (fix-walk): cut in after the stop and the flinch, the painted dread head (sweat) held, resolve on
// DECIDE, and cut back to the wide as he side-steps past it.
const CU = [B.blobBlocks + 1 / 3, DECIDE + 0.5], CU_I = 0.007;
// At the block the wide slides 8.5 cm ahead, so lamp 4, beyond the blob, is in frame with the shadow it throws back at him.
const BLOCK_PAN = [[9.0, 0], [B.blobBlocks, 0.085], [B.stepAround + 0.5, 0.085], [B.lamp4, 0]];
const HOP = 0.5, HOP_H = 0.003;
// walk-redo: the gait is timed, not phased on distance: a contact every STEP from PULSE0 (global 84.0), so every other
// footfall lands on the 120 bpm pulse. His legs are short (hip 0.015 m), so at x(t)'s 0.06–0.11 m/s that means four
// steps a second; each step's leg spread is scaled to the distance x(t) covers in it, so the planted foot barely skates.
const PULSE0 = B.lamp1, STEP = 0.25, SPREAD0 = 0.024;   // SPREAD0: the side set's contact spacing (poses.js)
const SWING = 14 * D, SWAY = 8 * D;                     // extra arm swing and tail sway on top of the poses' ±15° / ±6°
// walk-redo: the blob trails a further GAP behind HEEL, so it reads as its own shape beside him. LAMP_X (exported) still
// comes from HEEL alone; on a lamp beat the blob is GAP short of the lamp, which still lights it nearly from overhead.
const GAP = 0.035;
// walk-redo: his own light. The lamps sit behind him, so he was lit by their torn-edge rim and the through-light alone
// (muddy hoodie, white fringe). The paper lights itself at SELF (its painted colour, so cream stays cream), no edge catch.
const SELF = 0.45, THROUGH = 0.1;

// A lamppost from marston_ext_kit, globe centre at the light point. Returns its glowing material.
/**
 * @param {import('../assets.js').Kit} ext marston_ext_kit
 * @param {Function} art kitTools' art
 * @param {THREE.Object3D} parent
 * @param {string} key
 * @param {number[]} xz [x, z]
 * @param {THREE.ColorRepresentation} color
 */
export function lamppost(ext, art, parent, key, [x, z], color) {
  const img = ext.pieces.lamppost_black, k = mppOf(ext, 'lamppost_black');
  const GLOBE = [22, 13];                                // the globe's centre in the 44 × 163 cut (px)
  const s = LAMP_H / ((img.height - 3 - GLOBE[1]) * k);   // foot (row 160) on the ground, globe at LAMP_H
  const h = noCast(art(img, key, { mpp: k * s, anchor: [GLOBE[0], img.height - 3], parent, res: 512 }));
  h.position.set(x, 0, z);
  const m = glow(h); m.emissive.copy(color); m.emissiveIntensity = 0.9;
  return m;
}

// The key light at a lamp: straight down, wide, decay 0, only the blob casts into it.
export function lampKey(color) {
  const s = new THREE.SpotLight(color, 0, 0, 1.45, 0.2, 0);   // 83°: the spec's 1.2 cut the long shadow's tip off in the dark
  s.castShadow = true; s.shadow.mapSize.set(2048, 2048); s.shadow.bias = -0.0004; s.shadow.radius = 1;
  s.shadow.camera.near = 0.004; s.shadow.camera.far = 1.0;
  return s;
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]), hex = (c) => '#' + c.getHexString();
  const COOL = LAMP_COOL(PALETTE), WARM = C('lamp').lerp(C('cream'), 0.3);
  scene.background = C('navy').lerp(C('ink'), 0.35);
  const tools = kitTools(ID), { sheet, art, boil } = tools;
  const [ext, props] = await Promise.all([assets.load('marston_ext_kit'), assets.load('props_kit')]);
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const flat = (m) => { m.rotation.x = -Math.PI / 2; return m; };
  const rnd = mulberry32(seedOf(ID, 'set'));
  // Long strips are laid as overlapping short sheets: a tear's wobble scales with a sheet's long edge.
  const strip = (x0, x1, piece, place) => { for (let x = x0, i = 0; x < x1; x += piece * 0.92, i++) place(x + piece / 2, i); };

  // ---- Distance layers. The track runs 1.5 m; true parallax would sweep the tower across the whole frame, so the far
  // layers ride with the camera at a fraction (a multiplane rig, README §8): sky 1, tower 0.85.
  const far = { sky: new THREE.Group(), tower: new THREE.Group() };
  Object.values(far).forEach((g) => scene.add(g));
  const sky = sheet({ path: RECT, color: hex(C('navy').multiplyScalar(0.85)), size: [3.2, 1.8], key: `${ID}-night_sky`, res: 512 }, far.sky);
  sky.position.set(0, 0.0, -3.0); sky.castShadow = false;
  const DISK = Array.from({ length: 24 }, (_, i) => [0.5 + 0.47 * Math.cos(i * Math.PI / 12), 0.5 + 0.47 * Math.sin(i * Math.PI / 12)]);
  const moon = sheet({ path: DISK, color: PALETTE.cream, size: [0.07, 0.07], key: `${ID}-moon`, res: 256 }, far.sky);
  moon.position.set(-0.45, 0.17, -2.99); moon.castShadow = false;
  const tw = noCast(art(ext.pieces.century_tower, 'century_tower', { mpp: 0.60 / ext.pieces.century_tower.height, anchor: [ext.pieces.century_tower.width / 2, ext.pieces.century_tower.height - 4], parent: far.tower, res: 1024 }));
  tw.position.set(0.50, -0.45, -2.0);   // top just under the frame's top; the tree line and plaza hide its foot
  glow(tw).emissiveIntensity = 0.08;                      // the dim lit clock face is painted; a faint self-light lifts it
  { // far campus tree line at z −1.2, navy, riding with the tower layer (s09's seeded canopy line)
    const r = mulberry32(seedOf(ID, 'trees')), pts = [[0, 1]];
    for (let u = 0; u < 1; u += 0.008 + 0.02 * r()) pts.push([u, 0.55 * r() * r()]);
    pts.push([1, 0.3], [1, 1]);
    const tl = sheet({ path: pts, color: hex(C('navy').multiplyScalar(0.6)), size: [2.4, 0.16], key: `${ID}-trees`, res: 1024, rim: 'none' }, far.tower);
    tl.position.set(0, -0.12, -1.2); tl.castShadow = false;
  }
  // ---- Oaks at z −0.60, three crops and seeds; their moss hangs over the path's sky.
  const ok = mppOf(ext, 'oak_canopy');
  [[0.0, 0.62, 1], [0.6, 0.55, -1], [1.1, 0.5, 1]].forEach(([x, k, sx], i) => {
    const o = noCast(art(ext.pieces.oak_canopy, `oak-${i}`, { mpp: ok * k, sx, anchor: [326, 200], parent: scene, res: 1024 }));
    o.position.set(x, 0.13 + 0.02 * i, -0.60);
    o.children[0].material.color.setScalar(0.5 + 0.1 * rnd());
  });

  // ---- Marston at z −0.35: the breezeway (its entrance) at x 1.42, the ribbon facade running right of it, and a warm
  // lit strip behind each row of the facade's openings. Brick at night: its paint mixed toward navy.
  const MZ = -0.35, BK = 0.4;
  const night = C('navy').lerp(new THREE.Color(1, 1, 1), 0.55);
  const brick = (h) => { h.children[0].material.color.copy(night); return h; };
  const wm = BK * mppOf(ext, 'breezeway_frame'), fm = BK * mppOf(ext, 'facade_block');
  brick(noCast(art(ext.pieces.breezeway_frame, 'breezeway', { mpp: wm, anchor: [156.5, 247], parent: scene, res: 1024 }))).position.set(1.42, 0, MZ);
  const FX = 1.42 - 140 * wm - 680 * fm;                   // the facade runs LEFT of the breezeway, so its windows come in first
  brick(noCast(art(ext.pieces.facade_block, 'facade', { mpp: fm, anchor: [8, 171], parent: scene, res: 2048 }))).position.set(FX, 0, MZ + 0.002);
  const winMats = [];
  for (const [y0, y1] of [[45, 79], [112, 146]]) {        // the facade's two window rows (px)
    const ls = ext.pieces.lit_window_strip, lk = (680 * fm) / ls.width;
    const h = noCast(art(ls, `lit_strip-${y0}`, { mpp: lk, sy: ((y1 - y0 + 10) * fm) / (ls.height * lk), anchor: [0, ls.height / 2], parent: scene, res: 1024 }));
    h.position.set(FX + 14 * fm, (171 - (y0 + y1) / 2) * fm, MZ - 0.004);
    const m = glow(h); m.emissive.copy(WARM); winMats.push(m);
  }
  { // the entrance: a warm lit lobby plate behind the breezeway's opening, brightest of all
    const c = Object.assign(document.createElement('canvas'), { width: 280, height: 340 }), g = c.getContext('2d');
    g.fillStyle = hex(WARM); g.fillRect(0, 0, 280, 340);                 // the glass doors, lit from inside
    g.strokeStyle = hex(C('navy').multiplyScalar(0.6)); g.lineWidth = 16;
    g.strokeRect(30, 40, 110, 300); g.strokeRect(140, 40, 110, 300);
    g.lineWidth = 8; g.beginPath(); g.moveTo(45, 190); g.lineTo(125, 190); g.moveTo(155, 190); g.lineTo(235, 190); g.stroke();
    const e = sheet({ art: c, size: [0.070, 0.085], key: `${ID}-lobby`, res: 256 }, scene);
    e.position.set(1.42, 0.040, MZ - 0.01); e.castShadow = false;
    e.material.emissive.copy(WARM); e.material.emissiveMap = e.material.map; e.material.color.setScalar(0.2); e.material.emissiveIntensity = 0.6;
  }

  // ---- Ground: navy plaza from z −0.4 to 0.6; the paver path (the shadow receiver) z 0.07…0.17, x −0.40…1.60.
  // Wider than the spec's 0.07…0.14: the 2.5× blob's puddle reaches z 0.15, and a broader band reads as the receiver.
  const PZ = [0.03, 0.26];   // fix-walk: to 0.26, the lamps behind the hedge throw the shadow forward to z 0.21
  const paver = (() => {
    const c = Object.assign(document.createElement('canvas'), { width: 1000, height: 400 }), g = c.getContext('2d');
    g.fillStyle = hex(C('cream').lerp(C('navy'), 0.12)); g.fillRect(0, 0, 1000, 400);
    g.strokeStyle = hex(C('cream').lerp(C('navy'), 0.3)); g.lineWidth = 4;
    for (let x = 0; x <= 1000; x += 125) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 400); g.stroke(); }
    g.beginPath(); g.moveTo(0, 200); g.lineTo(1000, 200); g.stroke();
    return c;
  })();
  strip(-0.42, 1.62, 0.26, (x, i) => {
    const p = flat(sheet({ art: paver, size: [0.26, PZ[1] - PZ[0]], key: `${ID}-path-${i}`, res: 1024 }, scene));
    p.position.set(x, 0.0002 * (i % 2), (PZ[0] + PZ[1]) / 2); p.castShadow = false;
  });
  strip(-1.2, 1.9, 0.5, (x, i) => {   // fix-walk: from −1.2, the pushed-in camera saw the first strip's corner
    const p = flat(sheet({ path: RECT, color: hex(C('navy').multiplyScalar(0.75)), size: [0.5, 1.6], key: `${ID}-plaza-${i}`, res: 512, rim: 'none', mat: { edgeCatch: 0 } }, scene));
    p.position.set(x, -0.0004, -0.2); p.castShadow = false;   // its far edge hides behind Marston and the trees
  });
  // Hedge strip behind the path at z 0.05, y 0…0.020: a dark torn line.
  strip(-0.45, 1.3, 0.3, (x, i) => {
    const r = mulberry32(seedOf(ID, 'hedge', i)), pts = [[0, 1]];
    for (let u = 0; u <= 1; u += 0.04 + 0.04 * r()) pts.push([u, 0.1 + 0.35 * r()]);
    pts.push([1, 1]);
    const h = sheet({ path: pts, color: hex(C('navy').lerp(C('gator'), 0.25).multiplyScalar(0.55)), size: [0.3, 0.022], key: `${ID}-hedge-${i}`, res: 512, rim: 'none', mat: { edgeCatch: 0.05 } }, scene);
    h.position.set(x, 0.010, 0.05); h.castShadow = false;
  });
  // ---- The lamps.
  const lanterns = LAMP_X.map((x, i) => lamppost(ext, art, scene, `lamp-${i}`, [x, LAMP_Z], COOL));
  const pools = LAMP_X.map((x) => { const p = new THREE.PointLight(COOL, POOL_I, POOL_D, 2); p.position.set(x, LAMP_H, LAMP_Z); scene.add(p); return p; });
  // The two shadow keys: A takes lamps 1, 3, 5, B takes 2 and 4. Each moves to its next lamp while the other is key.
  const keyA = lampKey(COOL), keyB = lampKey(COOL);
  // fix-walk: no penumbra and a wider cone, here only (s10's lamp 5 keeps lampKey's), so the paving stays at full light out
  // to where the long shadow's tip lands (the 0.2 penumbra faded it from 66°). It did not change the probe's lengths.
  for (const k of [keyA, keyB]) { k.penumbra = 0; k.angle = 1.5; scene.add(k, k.target); }
  // Lamp i's share of the key: 1 − u(h0) for lamp 1, u(h_{i−1}) − u(h_i) after; u ramps over FADE centred on hand-over h.
  const u = (h, t) => clamp((t - (h - FADE / 2)) / FADE);
  const share = (i, t) => (i ? u(HANDOVER[i - 1], t) : 1) - (i < 4 ? u(HANDOVER[i], t) : 0);
  const keyMix = (t) => [[0, 2, 4], [1, 3]].map((set) => set.reduce((best, i) => (share(i, t) > best[1] ? [i, share(i, t)] : best), [-1, 0]));
  const warm = new THREE.DirectionalLight(WARM, 0); warm.position.set(1.42, 0.3, -1.0); scene.add(warm, warm.target);
  const fill = new THREE.PointLight(COOL.clone().lerp(C('navy'), 0.3), 0, 0.05, 2); scene.add(fill);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---- The Student: side rig, and the back turnaround swapped in on one frame at TURN. Both wear the backpack.
  const side = await makeGator({ assets }, { seed: 91, res: 1024 }), back = await makeGator({ assets }, { seed: 91, facing: 'back' });
  scene.add(side.group, back.group); noCast(side.group); noCast(back.group);   // only the blob casts
  const pack = (rig, [x, y, z], sx = 1) => {
    const h = noCast(art(props.pieces.backpack, `pack-${rig.facing}`, { mpp: 0.034 / props.pieces.backpack.height, sx, parent: rig.joints.body }));
    h.position.set(x, y, z);
  };
  pack(side, [-0.020, 0.026, -0.0045], -1);              // hip space, behind the body plane
  pack(back, [0, 0.045, 0.003]);                          // feet space, on his back
  // Sweat at 6.0 (README §12 dread + sweat): one drop at the temple, sliding 1 mm by 6.5.
  const DROP = [[0.5, 0], [0.85, 0.15], [1, 0.5], [0.85, 0.85], [0.5, 1], [0.15, 0.85], [0, 0.5], [0.15, 0.15]];
  const sweat = sheet({ path: DROP, color: hex(C('cream').lerp(C('phone'), 0.35)), weight: 'vellum', size: [0.0024, 0.0034], key: `${ID}-sweat`, res: 128 }, side.joints.head);
  sweat.castShadow = false;
  // The block's close-up rig (s09b's): the side Student with the painted heads, backpack on. Its own cool key from the
  // lamp side: lamp 4 is beyond him and edge-on to the head's paper, so on its own it lights only the rim.
  const cu = await closeupRig({ assets }, tools, ['dread', 'resolve'], { seed: 94 });
  scene.add(cu.rig.group); noCast(cu.rig.group); pack(cu.rig, [-0.020, 0.026, -0.0045], -1);
  const cuKey = new THREE.PointLight(COOL, 0, 0.10, 2); scene.add(cuKey);
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh);

  const fx = post({ focus: 0.7, aperture: 0.012, maxblur: 0.008, lut: 'night' });
  const P = POSES, STAND = specPose({ lean: 0, arm: -92, far: -92, head: 0, leg: 0, farLeg: 8 });
  const RECOIL = specPose({ lean: -2, arm: -98, far: -98, head: 2, leg: 0, farLeg: 8 });
  /** @type {[number, string][]} */
  const CUES = [[0, 'dread'], [B.blobBlocks, 'flinch'], [B.blobBlocks + 7 / 12, 'dread'], [DECIDE, 'resolve']];
  const camX = (t) => {                                   // the blob's x + 0.02, smoothed: a 1 s box average of x(t). Before
    let s = 0; for (let i = -5; i <= 5; i++) s += X(Math.min(t, TURN) + i * 0.1);   // lamp 1 it sits 3 cm further back, so the
    return s / 11 + HEEL[0] - GAP / 2 + 0.02 - 0.03 * (1 - ease(t / B.lamp1))                // long shadow behind them is in frame
      + kf(t, BLOCK_PAN, ease);
  };
  const bc = new THREE.Vector3();
  // every frame, after the rigs' boil / face / mouth-bar swaps (each replaces a map); act() adds the mouth bar late
  const selfLit = (g) => g.traverse((o) => {
    const m = /** @type {any} */ (o).material, u = m?.userData?.paper;
    if (!u) return;
    m.emissive.setScalar(1); m.emissiveMap = m.map; m.emissiveIntensity = SELF;
    u.uEdgeCatch.value = 0; u.uTranslucency.value = THROUGH;
  });

  function update(t) {
    const T = onTwos(t);
    boil(t, 10);

    // ---------- the Student, on 2s
    const turned = T >= TURN;
    side.group.visible = !turned; back.group.visible = turned;
    /** @type {Vec3} */
    let root;
    const close = t >= CU[0] && t < CU[1];
    if (!turned) {
      side.boil(t, 10);
      const walking = T < B.blobBlocks || T >= B.stepAround;
      // after the side-steps the cycle picks up on the b foot, where they ended (stepAround is a b contact at t0 + STEP)
      const t0 = T < B.blobBlocks ? PULSE0 : PULSE0 + STEP;
      if (walking) {
        const w = walk(T, { set: 'side', step: STEP, t0 });
        side.blend(P, w.keys, T);
        const j = side.joints, b = j.body.rotation.z;
        const k = clamp((X(T + STEP / 2) - X(T - STEP / 2)) / SPREAD0, 0.7, 1.2);   // ponytail: linear in angle, close enough
        for (const leg of [j.leg_r, j.leg_l]) leg.rotation.z = k * (b + leg.rotation.z) - b;
      } else if (T < DECIDE) {                            // the stop drawing, a recoil lean, then still
        side.blend({ stand: STAND, recoil: RECOIL }, [[B.blobBlocks, 'stand'], [B.blobBlocks + 1 / 12, 'recoil'], [B.blobBlocks + 0.5, 'stand']], T);
      } else {                                            // three side-steps, toward the camera and past it
        const step = (B.stepAround - DECIDE) / 3, w = walk(T, { set: 'side', step, t0: DECIDE });
        side.blend(P, w.keys, T);
      }
      // Acting: 36/min to the decision, 40/min after; head down 8° under dread. fix-walk: hunched and tail drooped until
      // he decides (cold-v4 read the upright plod as "out for a walk with his pet"), upright and tail level after.
      const breath = T < DECIDE ? 60 / 36 : 60 / 40;
      const f = act(side, t, CUES, { breath, slump: T < DECIDE ? 0.6 : 0, tail: T < DECIDE ? -16 : 0 });
      if (walking) {                                      // arms swing against the legs, the tail sways with the hips
        const c = Math.cos(Math.PI * (T - t0) / STEP), j = side.joints;
        j.arm_r.rotation.z += SWING * c; j.arm_l.rotation.z -= SWING * c; j.tail.rotation.z += SWAY * c;
      }
      // the root's height from the final legs (after act's lean), so the lower foot is on the paving: the step's bob
      const j = side.joints, hip = hipHeight({ body: j.body.rotation.z, leg_r: j.leg_r.rotation.z, leg_l: j.leg_l.rotation.z });
      const z = kf(T, [[DECIDE, WALK_Z], [B.stepAround, AROUND_Z], [B.stepAround + 0.5, WALK_Z]], ease);
      root = [X(T), hip, z];
      side.group.position.set(...root);
      const head = kf(T, [[0, -10], [B.blobBlocks, -10], [B.blobBlocks + 1 / 12, 0], [DECIDE, -2], [B.lamp4, -2], [B.lamp4 + 1 / 3, 0],
        [B.marstonSeen, 0], [B.marstonSeen + 1 / 3, 4]], ease);
      side.joints.head.rotation.z += head * D;
      if (T >= B.marstonSeen) side.joints.tail.rotation.z += 5 * D;
      // walk-redo: one head for the whole wide: the open eye and its blinks. The worried / gasp / side takes read at this
      // size as a different, bug-eyed head (director's note); the fear is the close-up's, and the hunch's here.
      side.face({ eyes: f.eyes === 'closed' ? 'closed' : 'open', mouth: f.mouth });
      sweat.visible = T >= 6.0 && T < 7.0;
      sweat.position.set(-0.0018, 0.0254 - 0.001 * clamp((T - 6.0) / 0.5), 0.003);
      fill.position.set(root[0] + 0.035, 0.07, root[2] + 0.03);
      // the close-up: the same pose and place, the painted head; dread (sweat) → resolve on DECIDE, the swallow 10.75
      side.group.visible = !close; cu.rig.group.visible = close;
      if (close) {
        cu.rig.boil(t, 10);
        cu.rig.group.position.set(...root);
        if (T < DECIDE) cu.rig.blend({ s: STAND }, [[0, 's']], T);
        else { const w = walk(T, { set: 'side', step: (B.stepAround - DECIDE) / 3, t0: DECIDE }); cu.rig.blend(P, w.keys, T); }
        cu.show(T < DECIDE ? 'dread' : 'resolve', { antic: T >= DECIDE - 1 / 12 - 1e-6 && T < DECIDE });
        const swallow = T >= 10.75 - 1e-6 && T < 10.917 - 1e-6;
        cu.holder.position.y = HEAD_AT[1] + (swallow ? (T < 10.833 ? 0.0006 : -0.0003) : 0);
        cu.rig.joints.head.rotation.z = kf(T, [[DECIDE - 1e-3, -6], [DECIDE + 1 / 6, 2]], ease) * D;   // head down, then level
        cu.rig.joints.body.scale.y = 1 + (T < DECIDE ? 0.004 * Math.sin(2 * Math.PI * T / (60 / 36)) : 0);   // the held breath, shallow
      }
    } else {                                              // into depth toward the entrance, back view, step 1/4
      back.boil(t, 10);
      const w = walk(T, { set: 'back', step: 0.25, t0: TURN });
      back.blend(P, w.keys, T);
      const k = (T - TURN) / 2;
      root = [X(TURN) + (END[0] - X(TURN)) * k, w.lift, WALK_Z + (END[1] - WALK_Z) * k];
      back.group.position.set(...root);
      fill.position.set(root[0], 0.07, root[2] + 0.04);
    }

    // ---------- the Exam, on 2s: one hop per pulse at his heels; the block; the hop after him
    const ph = ((T + 1e-6) % HOP) / HOP, landing = ph < 1 / 6;
    let bx, by = 0, bz, sq = landing ? 0.2 : 0, mirror = false, eyes = 'open', look = 1;
    const heel = (tt) => [X(tt) + HEEL[0] - GAP, WALK_Z + HEEL[1]];
    if (T < 9.5) { [bx, bz] = heel(T); by = HOP_H * Math.sin(Math.PI * ph); }
    else if (T < B.blobBlocks) {                          // one big hop past him on the camera side: crouch, two drawings up
      const [x0, z0] = heel(9.5);
      if (T < 9.5 + 1 / 12) { [bx, bz] = [x0, z0]; sq = 0.25; }
      else if (T < 9.75) { bx = X(9.5) + HEEL[0] + 0.06; by = 0.022; bz = 0.125; sq = -0.2; }
      else { bx = BLOCK[0] - 0.02; by = 0.014; bz = 0.115; sq = -0.15; }
      eyes = 'open';
    } else if (T < B.stepAround + 0.5) {                  // planted square in his path, turned to face him
      [bx, bz] = BLOCK; mirror = true; sq = T < B.stepAround + 0.5 ? 0.25 : 0;
      eyes = T < DECIDE ? 'worried' : T < B.stepAround ? 'side' : 'gasp'; look = T < DECIDE ? 1 : -1;
    } else if (T < B.stepAround + 1) {                    // un-squashes, surprised, and hops after him
      const k = (T - B.stepAround - 0.5) / 0.5, [hx, hz] = heel(B.stepAround + 1);
      bx = BLOCK[0] + (hx - BLOCK[0]) * k; bz = BLOCK[1] + (hz - BLOCK[1]) * k; by = 0.010 * Math.sin(Math.PI * k);
      sq = k < 1 / 6 ? -0.1 : 0; eyes = 'gasp';
    } else if (T < TURN) { [bx, bz] = heel(T); by = HOP_H * Math.sin(Math.PI * ph); }
    else { bx = root[0] - 0.045 - GAP; bz = root[2] + 0.02; by = HOP_H * Math.sin(Math.PI * ph); }   // beside and a step behind him
    if (LAMP_BEATS.some((b) => Math.abs(T - B[b]) < 1e-3)) sq = 0.3;   // the light presses it down on each puddle beat
    if (T >= B.marstonSeen && T < TURN) { eyes = 'side'; look = 1; }
    exam.mesh.position.set(bx, by, bz);
    cuKey.intensity = close ? CU_I : 0;
    if (close) cuKey.position.set(root[0] + 0.03, 0.10, root[2] + 0.05);
    exam.mesh.scale.set(mirror ? -1 : 1, 1, 1);

    // ---------- light, on 1s
    const mix = keyMix(t);
    /** @type {[THREE.SpotLight, number[]][]} */ ([[keyA, mix[0]], [keyB, mix[1]]]).forEach(([k, [i, w]]) => {
      if (i < 0) { k.intensity = 0; return; }
      k.position.set(LAMP_X[i], LAMP_H, LAMP_Z);
      k.target.position.set(LAMP_X[i], 0, LAMP_Z); k.target.updateMatrixWorld();
      k.intensity = KEY_I * w;
    });
    const key = (mix[0][1] >= mix[1][1] ? keyA : keyB);
    // character fill: dim, only away from a pool (README §10)
    const dLamp = Math.min(...LAMP_X.map((x) => Math.abs(x - root[0])));
    fill.intensity = FILL_I * clamp((dLamp - 0.04) / 0.06);
    warm.intensity = WARM_I * clamp((t - 17) / 0.5);
    warm.target.position.set(root[0], 0.04, root[2]); warm.target.updateMatrixWorld();
    winMats.forEach((m) => { m.emissiveIntensity = 0.75; });
    exam.update(t, { squash: sq, wobble: 1, eyes, look, key });
    selfLit(side.group); selfLit(back.group);            // last: after every boil, face and mouth-bar swap this frame

    // ---------- camera, on 1s: lateral track at his x + 0.06, the block's push-in in z, locked from the turn
    const cx = camX(t), cz = kf(t, CAM_Z, ease);
    if (close) {                                          // the close-up: level, from the camera side, on his head
      cu.rig.joints.head.getWorldPosition(bc);
      camera.position.set(bc.x + 0.018, bc.y + 0.009, root[2] + 0.20);
      camera.lookAt(bc.x + 0.018, bc.y + 0.009, root[2]);
      far.sky.position.x = bc.x; far.tower.visible = false;   // the tower sat on the blob's crown like a hat
      fx.set({ focus: 0.20, aperture: 0.008 });
    } else {
      camera.position.set(cx, CAM_Y, cz);
      camera.lookAt(cx, LOOK_Y, LOOK_Z);
      far.sky.position.x = cx; far.tower.position.x = 0.85 * cx; far.tower.visible = true;
      bc.set(root[0], 0.04, root[2]);
      fx.set({ focus: camera.position.distanceTo(bc), aperture: 0.012 });
    }
  }

  return { parts: { exam, camera, side, back, cu, keyA, keyB, X, LAMP_X }, update };
}
