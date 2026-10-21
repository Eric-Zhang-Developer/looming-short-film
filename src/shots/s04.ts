// s04 · The fridge loop (docs/shots/s04.md, v7). On the frozen kitchen_kit: a counter run along the back wall (sink under
// a window, counter, stove with the microwave over it, upper cabinets, tiled backsplash) and a full-height fridge at the
// right, turned to show its lit inside. v7: he opens the fridge, stares, closes it, turns away, comes back and opens it
// again, three times, blank-faced; nothing inside changes. The fridge light is the low, close key and it only exists while
// the door is open: open, the blob's shadow springs up across the cabinets; shut, the kitchen goes dim and the shadow is
// gone. Between opens the blob (1.5×, METER.gulp1, no gulp) scoots toward the light, so each time the light comes back the
// shadow is bigger: 4.0 → 4.5 → 5.2 units by the light rule alone. He stands in front of the light (z 0.30 > L.z), so he
// throws nothing on the wall. Sizes are the scale table's (evidence/asset-home-kit/scale_table.md: 1 real m = 0.055 film
// m against the 0.096 m gator). Characters and the door on 2s, the light switches with the door, boil 10/s.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.ts';
import { paperMesh, updatePaperMesh } from '../material.ts';
import { phoneLight, dawnLight, ambient, aim } from '../lights.ts';
import { kf, onTwos } from '../core/ease.ts';
import { mulberry32, seedOf } from '../core/rng.ts';
import { createBlob } from '../blob.ts';
import { makeGator, hipHeight } from '../characters/gator.ts';
import { specPose, walk, POSES } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import type { PaperOptions, PaperSheet } from '../paper.ts';
import type { PaperMesh } from '../material.ts';
import type { Kit } from '../assets.ts';
import type { SpecOpts } from '../characters/poses.ts';
import type { ShotCtx } from '../film.ts';
import type { Palette, MatOpts } from './s02.ts';

const ID = 's04', DEG = Math.PI / 180;
// v11 (docs/notes/v11-beats.md): the fridge feeds it too. 0.8× of v10's birth, one gulp on the third open (gulpFridge 5.5) → 1.25×.
const BLOB_R = { start: 0.010, gulpFridge: 0.015 };
const GULP = 66;                                              // gulpFridge, 5.5 (drawing): the light's been on 0.83 s, he leans in at 6.0
const CAM = new THREE.Vector3(-0.092, 0.068, 0.86), LOOK = new THREE.Vector3(-0.092, 0.072, 0);   // below the ceiling, pitched up ~0.3°: sink at the left edge, fridge at the right
const CEIL = 0.13;
const COUNTER_Y = 0.0495;                                     // 91 cm: the counter_run's painted top
const UPPER_Y = 0.078;                                        // upper cabinets' and microwave's bottom (1.42 m)
const UPPER_Z = 0.004;                                        // v3: the uppers hang flush to the wall (were 0.014), so the blob's shadow doesn't jump at their edges
const SEAT_Y = 0.042;                                         // bar-stool seat, 76 cm
// Fridge light: the spec's x and z (S 3.20 → 3.62 → 4.17), at the middle shelf, 5 mm over the seat. The spec puts it
// 10 mm under the seat; there the 5.2-unit shadow rode up so far its eyes went onto the navy ceiling. S is z-only.
const L = new THREE.Vector3(0.030, SEAT_Y + 0.005, 0.2763);
const KEY_I = 0.3, FILL_K = 0.2, FACE_I = 0.014;              // spot (cd), interior fill as a fraction, face fill
const AMB = 0.7;                                              // ambient: 70% of s02's
const NEAR_TRIM = 0.15;                                       // albedo trim on the stool, 5–8 cm from the key
// Fridge: centre, yaw (its mouth turns to −x and 35° toward camera), height. Door hinged on its front edge, swung open.
const FRIDGE = { x: 0.056, z: 0.276, yaw: -42 * DEG, h: 0.100, doorOpen: 150 * DEG };
const BODY_Z = 0.30, HIP_X = -0.002;                           // the Student's body plane and root x
const HAND_DZ = 0.013;                                        // near arm +0.012, hand +0.001 (contracts §characters)
// Blob contact [x, z] by local t (spec Exam table).
// v4: the blob is 1.5× (r 0.018) but the wall shadow keeps the spec's 4.0 → 4.5 → 5.2 units (README §1: units = S · r / 0.012). The light
// stays at the fridge mouth, so each mark's depth is solved from its units: S = units · 0.012 / r, z = L.z · (1 − 1 / S).
// (G4/v3 had z 0.19 → 0.20 → 0.21 for the 1.25× blob.) x is unchanged, so the shadow sits a little further right than before.
// v11: the marks stay where v10 solved them for its r 0.018 (S 2.67 → 3.0 → 3.47); the shadow now follows the body by the light
// alone: 2.2 → 2.5 → 2.9 units, and 4.3 after the gulp.
const UNITS = [4.0, 4.5, 5.2], V10_R = 0.018;
const MARK_Z = UNITS.map((u) => L.z * (1 - V10_R / (u * 0.012)));
const STOOL_Z = MARK_Z[0] - 0.001;                              // stool cut 1 mm behind the blob's first mark (v3: 0.189 for 0.19), so the blob is never behind it
// v7 timing (local s, on 2s). OPENS: [door starts to open, door shut]. The door takes two drawings each way; the light is
// on whenever the door is off its seal. The shot opens on two dark drawings so the first open shows the rule; the third holds to the cut.
const OPENS = [[0.17, 1.58], [2.5, 3.83], [4.67, 7.5]];
const DOOR_IN = [0.6, 1], DOOR_OUT = [0.6, 0.2];               // door fraction open on the two drawings after/before
// The blob scoots in the dark, between opens, where he isn't covering it (the first once he has walked back past the stool).
const BLOB: [number, number[]][] = [[0, [-0.015, MARK_Z[0]]], [2.25, [-0.015, MARK_Z[0]]], [2.42, [-0.017, MARK_Z[1]]], [4.08, [-0.017, MARK_Z[1]]], [4.25, [-0.020, MARK_Z[2]]]];
const LANDS = [2.42, 4.25];
const fr = (s: number) => Math.round(s * 12);                           // a time on 2s → its drawing number (12/s)
// Turned away (rig mirrored, facing −x): after each close until he turns back. WALKS: [t0, t1, from x, to x] on 2s steps.
const AWAY = [[1.67, 2.17], [3.92, 4.33]];
const WALKS = [[1.67, 2.0, 0, -0.014], [2.17, 2.42, -0.014, 0]];

const PAD = 0.04;   // a shape that fills its canvas has no edge to tear, so rects are inset 4% of the long side
function torn(w: number, h: number) {
  const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}

export async function build({ scene, camera, assets, PALETTE, post }: ShotCtx) {
  const col = (a: keyof Palette, b: keyof Palette, k: number) => '#' + new THREE.Color(PALETTE[a]).lerp(new THREE.Color(PALETTE[b]), k).getHexString();
  const tiltOf = (k: string): Vec3 => { const r = mulberry32(seedOf(ID, k)); return [(2 * r() - 1) * 1.2 * DEG, (2 * r() - 1) * 1.2 * DEG, 0]; };
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.copy(CAM);
  camera.lookAt(LOOK);

  // ---------- paper helpers ----------
  const boiling: [PaperMesh, (s: number) => PaperSheet][] = [];
  const paper = (key: string, opts: PaperOptions, mat?: MatOpts) => {
    const make = (s: number) => makePaper({ ...opts, key: `${ID}-${key}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    mesh.castShadow = false;   // only the blob (and the wall, for the window) cast: set below
    boiling.push([mesh, make]);
    return mesh;
  };
  const group = (mesh: THREE.Object3D, at: Vec3, { tilt = null, rot = null, parent = scene }: { tilt?: string | null, rot?: Vec3 | null, parent?: THREE.Object3D } = {}) => {
    const g = new THREE.Group();
    g.add(mesh); g.position.set(...at);
    if (rot) g.rotation.set(...rot);
    if (tilt) mesh.rotation.set(...tiltOf(tilt));
    parent.add(g);
    return g;
  };
  const rect = (key: string, color: string, [w, h]: number[], at: Vec3, o: { weight?: string, res?: number, mat?: MatOpts, tilt?: boolean, rot?: Vec3 | null, parent?: THREE.Object3D } = {}) =>
    group(paper(key, { ...torn(w, h), color, weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat), at,
      { tilt: o.tilt === false ? null : key, rot: o.rot, parent: o.parent });
  // A cut piece whose visible (opaque) box is [w, h] (null keeps the art's aspect), its origin at that box's
  // [ax, ay] (0..1 from the left / bottom; default the centre).
  const cut = (a: Kit, p: string, [w, h]: (number | null)[], key: string, o: { anchor?: number[], weight?: string, res?: number, mat?: MatOpts, tilt?: boolean, parent?: THREE.Object3D } = {}) => {
    const [sw, sh] = a.sizes[p], [u0, v0, u1, v1] = a.visible[p], vw = sw * (u1 - u0), vh = sh * (v1 - v0);
    const sx = w != null ? w / vw : h! / vh, sy = h != null ? h / vh : sx, [ax, ay] = o.anchor ?? [0.5, 0.5];
    const mesh = paper(key, { art: a.pieces[p], size: [sw, sh], weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat);
    mesh.scale.set(sx, sy, 1);
    mesh.position.set(-((u0 + u1) / 2 - 0.5) * sw * sx + (0.5 - ax) * vw * sx, ((v0 + v1) / 2 - 0.5) * sh * sy + (0.5 - ay) * vh * sy, 0);
    const inner = new THREE.Group(); inner.add(mesh);
    if (o.tilt) inner.rotation.set(...tiltOf(key));
    const g = new THREE.Group(); g.add(inner); (o.parent ?? scene).add(g);
    return { g, inner, mesh, size: [vw * sx, vh * sy] };
  };
  // A piece's visible box tiled edge to edge into one canvas, [nx, ny] copies (the floor).
  const tiled = (a: Kit, p: string, nx: number, ny: number) => {
    const bmp = a.pieces[p], [u0, v0, u1, v1] = a.visible[p], E = 4;   // E px trimmed off each side: the painted rim would seam
    const tw = Math.round((u1 - u0) * bmp.width) - 2 * E, th = Math.round((v1 - v0) * bmp.height) - 2 * E;
    const c = Object.assign(document.createElement('canvas'), { width: tw * nx, height: th * ny }), g = c.getContext('2d')!;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g.drawImage(bmp, u0 * bmp.width + E, v0 * bmp.height + E, tw, th, i * tw, j * th, tw, th);
    return c;
  };

  const [kit, home] = await Promise.all([assets.load('kitchen_kit'), assets.load('home_kit')]);
  const cream = PALETTE.cream;

  // ---------- room shell: back wall (z 0, the shadow receiver, never tilted) with the window hole over the sink ----------
  const SINK_X = -0.31;
  const WALL = { x0: -0.6, x1: 0.09, y0: -0.02, y1: CEIL + 0.02 };
  const HOLE = { x0: SINK_X - 0.019, x1: SINK_X + 0.019, y0: 0.087, y1: 0.120 };
  const wallArt = (() => {
    const W = 2048, H = Math.round(W * (WALL.y1 - WALL.y0) / (WALL.x1 - WALL.x0));
    const c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d')!;
    g.fillStyle = cream; g.fillRect(0, 0, W, H);
    const px = (x: number) => (x - WALL.x0) / (WALL.x1 - WALL.x0) * W, py = (y: number) => (WALL.y1 - y) / (WALL.y1 - WALL.y0) * H;
    g.clearRect(px(HOLE.x0), py(HOLE.y1), px(HOLE.x1) - px(HOLE.x0), py(HOLE.y0) - py(HOLE.y1));
    return c;
  })();
  const wall = paper('apt_wall', { art: wallArt, size: [WALL.x1 - WALL.x0, WALL.y1 - WALL.y0], res: 2048 });
  group(wall, [(WALL.x0 + WALL.x1) / 2, (WALL.y0 + WALL.y1) / 2, 0]);
  // Side wall behind the fridge (x 0.09), the corner of the L; ceiling (Night Navy, facing down); floor (the kit's
  // checker strip, tiled, laid flat).
  rect('side-wall', col('cream', 'navy', 0.12), [0.45, CEIL + 0.02], [0.09, CEIL / 2, 0.225], { rot: [0, -Math.PI / 2, 0], tilt: false, res: 1024 });
  rect('apt_ceiling', PALETTE.navy, [0.8, 0.8], [-0.25, CEIL, 0.4], { rot: [Math.PI / 2, 0, 0], tilt: false, res: 256 });
  group(paper('apt_floor', { art: tiled(kit, 'floor_strip', 3, 12), size: [0.84, 0.66], weight: 'kraft', res: 2048 }), [-0.2, 0, 0.33], { rot: [-Math.PI / 2, 0, 0] });

  // ---------- counter run along the back wall: sink (under the window) | counter | stove | counter ----------
  // Base units stand at the counter's front edge (z 0.026), their painted counter tops all at COUNTER_Y. The sink's and
  // stove's paintings carry a tap and a cooktop above that line, so they are sized by their bodies (k = body / height,
  // measured on the cut PNGs in px).
  const BASE_Z = 0.026, unit = (p: string, k: number, x0: number, key = p) => {
    const c = cut(kit, p, [null, COUNTER_Y / k], key, { anchor: [0, 0] });
    c.g.position.set(x0, 0, BASE_Z);
    return x0 + c.size[0];
  };
  let x = unit('sink', 218 / 336, SINK_X - 0.034);
  x = unit('counter_run', 1, x);
  const STOVE_X0 = x;
  x = unit('stove', 240 / 352, x);
  const STOVE_X1 = x;
  unit('counter_run', 1, x, 'counter_run_2');
  // Backsplash (tiles on the wall, counter to cabinets), upper cabinets either side of the microwave over the stove.
  for (const [i, x0] of [[0, SINK_X - 0.034], [1, SINK_X - 0.034 + 0.18]]) {
    cut(kit, 'backsplash_strip', [null, UPPER_Y - COUNTER_Y], `backsplash_${i}`, { anchor: [0, 0] }).g.position.set(x0, COUNTER_Y - 0.002, 0.003);
  }
  cut(kit, 'upper_cabinets', [null, 0.0385], 'upper_l', { anchor: [1, 0] }).g.position.set(STOVE_X0 - 0.002, UPPER_Y, UPPER_Z);
  cut(kit, 'upper_cabinets', [null, 0.0385], 'upper_r', { anchor: [0, 0] }).g.position.set(STOVE_X1 + 0.002, UPPER_Y, UPPER_Z);
  cut(kit, 'microwave', [STOVE_X1 - STOVE_X0 - 0.004, null], 'microwave', { anchor: [0.5, 0] }).g.position.set((STOVE_X0 + STOVE_X1) / 2, UPPER_Y, UPPER_Z + 0.002);
  // Window over the sink: home_kit's frame over a tissue pane, lit from behind through the hole.
  cut(home, 'window_frame', [null, 0.044], 'window_frame').g.position.set(SINK_X, (HOLE.y0 + HOLE.y1) / 2 - 0.002, 0.003);
  cut(home, 'window_glass', [HOLE.x1 - HOLE.x0 + 0.004, null], 'apt_window', { weight: 'tissue', mat: { translucency: 0.8 } })
    .g.position.set(SINK_X, (HOLE.y0 + HOLE.y1) / 2, 0.0015);
  // Counter dressing: kettle on the stove, dish rack by the sink, fruit bowl and a mug on the counter.
  const onCounter = (p: string, h: number, cx: number) => cut(kit, p, [null, h], p, { anchor: [0.5, 0] }).g.position.set(cx, COUNTER_Y - 0.0015, BASE_Z + 0.002);
  onCounter('kettle', 0.0125, STOVE_X0 + 0.016);
  onCounter('dish_rack', 0.011, SINK_X + 0.050);
  onCounter('fruit_bowl', 0.011, STOVE_X0 - 0.030);
  onCounter('mug', 0.0055, STOVE_X1 + 0.022);

  // ---------- the fridge: open body turned toward camera, door swung wide on its front edge ----------
  const fridge = new THREE.Group();
  fridge.position.set(FRIDGE.x, 0, FRIDGE.z);
  fridge.rotation.y = FRIDGE.yaw;
  scene.add(fridge);
  const fb = cut(kit, 'fridge_body', [null, FRIDGE.h], 'fridge_body', { anchor: [0.5, 0], parent: fridge });
  const FW = fb.size[0];
  // A grey-cream side panel from the mouth back toward the side wall, so it reads as a box, not a card.
  rect('fridge-side', col('cream', 'navy', 0.25), [0.034, FRIDGE.h * 0.97], [-FW / 2, FRIDGE.h * 0.49, -0.017],
    { rot: [0, Math.PI / 2, 0], tilt: false, parent: fridge, res: 256 });
  const hinge = new THREE.Group();
  hinge.position.set(FW / 2, 0, 0.001);
  hinge.rotation.y = Math.PI + FRIDGE.doorOpen;   // closed is π (lying across the mouth); it opens toward camera
  fridge.add(hinge);
  cut(kit, 'fridge_door', [null, FRIDGE.h], 'fridge_door', { anchor: [0, 0], parent: hinge });
  // Shelves in fridge-local y: the painting's two glass shelves and the crisper's top.
  const SHELF = [0.069, 0.050, 0.031].map((y) => y * FRIDGE.h / 0.1);
  fridge.updateMatrixWorld(true);
  const fridgePt = (u: number, y: number) => fridge.localToWorld(new THREE.Vector3(u, y, 0.003));

  // ---------- what he stares at: three jars in size order on the middle shelf, the carton (the kit's cereal box) and a mug
  // up top. Nothing in here changes between opens: that's the joke.
  const prop = (p: string, h: number, key: string) => cut(kit, p, [null, h], key, { anchor: [0.5, 0] });
  // uy: [u, y]
  const inFridge = (o: ReturnType<typeof prop>, [u, y]: number[]) => { o.g.position.copy(fridgePt(u, y)); o.g.rotation.set(0, FRIDGE.yaw, 0); };
  [[0.0095, -0.014], [0.0078, -0.003], [0.0062, 0.007]].forEach(([h, u], i) => inFridge(prop('jar', h, `jar_${i}`), [u, SHELF[1]]));
  inFridge(prop('cereal_box', 0.012, 'carton'), [0.011, SHELF[0]]);
  inFridge(prop('mug', 0.005, 'fridge_mug'), [-0.012, SHELF[0]]);

  // ---------- the bar stool (procedural kraft: a round seat, two splayed legs, a footrest) ----------
  const STOOL_H = SEAT_Y * 512 / 494;   // the canvas is 512 px tall, the seat's top at px 18
  const stoolArt = (() => {
    const c = Object.assign(document.createElement('canvas'), { width: 256, height: 512 }), g = c.getContext('2d')!;
    g.strokeStyle = col('kraft', 'navy', 0.2); g.lineCap = 'round';
    g.lineWidth = 22; g.beginPath(); g.moveTo(80, 60); g.lineTo(40, 500); g.moveTo(176, 60); g.lineTo(216, 500); g.stroke();
    g.lineWidth = 16; g.beginPath(); g.moveTo(58, 330); g.lineTo(198, 330); g.stroke();
    g.fillStyle = PALETTE.kraft; g.beginPath(); g.roundRect(14, 18, 228, 52, 24); g.fill();
    return c;
  })();
  const stoolMesh = paper('kitchen_stool', { art: stoolArt, size: [0.021, STOOL_H], weight: 'kraft', res: 512 });
  group(stoolMesh, [-0.02, STOOL_H / 2 - (STOOL_H - SEAT_Y) + 0.0002, STOOL_Z]);
  stoolMesh.material.color.setScalar(NEAR_TRIM / 0.15 * 0.4);

  // ---------- the Student, standing at the mouth, upright, facing +x into the fridge ----------
  const rig = await makeGator({ assets }, { seed: 4 });
  scene.add(rig.group);
  const up = (o: SpecOpts) => specPose({ leg: 0, farLeg: 8, far: -100, ...o });
  const HIP_Y = hipHeight(up({ lean: 0 }));
  rig.group.position.set(HIP_X, HIP_Y, BODY_Z);
  const SH = [0.013, 0.030], ARM = 0.032, HAND_Z = BODY_Z + HAND_DZ;
  const toPlane = (p: THREE.Vector3, z: number) => CAM.clone().add(p.clone().sub(CAM).multiplyScalar((z - CAM.z) / (p.z - CAM.z)));
  // The lean (10..40° forward) and arm angle that put the fingertip, seen from the camera, on world point p.
  function reachTo(p: THREE.Vector3, extra: SpecOpts = {}) {
    const T = toPlane(p, HAND_Z);
    let best: { err: number, lean: number, arm: number } | null = null;
    for (let i = 0; i <= 300; i++) {
      const lean = 10 + i * 0.1, c = Math.cos(-lean * DEG), s = Math.sin(-lean * DEG);
      const sx = HIP_X + SH[0] * c - SH[1] * s, sy = HIP_Y + SH[0] * s + SH[1] * c;
      const err = Math.abs(Math.hypot(T.x - sx, T.y - sy) - ARM);
      if (!best || err < best.err) best = { err, lean, arm: Math.atan2(T.y - sy, T.x - sx) / DEG };
    }
    return up({ lean: best!.lean, arm: best!.arm, ...extra });   // the loop runs 301 times
  }
  // The door's handle (near its free edge, at shelf height) with the door 60% open: where his hand pulls and pushes.
  const doorAt = (k: number) => { hinge.rotation.y = Math.PI + k * FRIDGE.doorOpen; fridge.updateMatrixWorld(true); };
  doorAt(0.6);
  const HANDLE = hinge.localToWorld(new THREE.Vector3(0.9 * FW, SHELF[1], 0.002));
  doorAt(1);
  // Blank, every time: the stare is the same drawing in all three opens (the third leans in a hair, nothing else).
  const P = {
    ...POSES,
    stare: up({ lean: 4, arm: -95, head: -6 }),
    stare_in: up({ lean: 7, arm: -95, head: -8 }),
    handle: reachTo(HANDLE),
    stand: up({ lean: 0, arm: -95, head: 0 }),
  };
  const KEYS: [number, string][] = [
    [0, 'handle'], [0.17, 'handle'], [0.33, 'stare'], [1.42, 'stare'], [1.5, 'handle'], [1.58, 'handle'], [1.67, 'stand'],
    [2.42, 'handle'], [2.58, 'handle'], [2.75, 'stare'], [3.67, 'stare'], [3.75, 'handle'], [3.83, 'handle'], [3.92, 'stand'],
    [4.33, 'stand'], [4.5, 'handle'], [4.75, 'handle'], [4.92, 'stare'], [5.75, 'stare'], [6.0, 'stare_in'], [7.5, 'stare_in'],
  ];

  // ---------- the Exam on the stool (ink, code) ----------
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh);

  // ---------- light ----------
  // Key: the fridge light by the phone-light convention, Phone Cyan 40% toward Cream (doc 03 allows two light colours).
  const fridgeCol = new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.cream), 0.4);
  const spot = phoneLight({ color: fridgeCol, intensity: KEY_I, angle: 0.9, penumbra: 0.5, distance: 0.8 });
  spot.position.copy(L);
  scene.add(spot, spot.target);
  // Interior fill (README §5): unshadowed, same colour, 20% of the spot, just inside the mouth so the shelves glow.
  const fill = new THREE.PointLight(fridgeCol, FILL_K * KEY_I, 0.06, 2);
  fill.position.copy(fridgePt(0, FRIDGE.h * 0.5)).add(new THREE.Vector3(-0.012, 0, 0.008));
  scene.add(fill);
  // Character fill (README §10): shadowless, in front of his face, dying long before the wall.
  const face = new THREE.PointLight(new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.navy), 0.4), FACE_I, 0.15, 2);
  face.position.set(0.02, 0.085, 0.40);
  scene.add(face);
  // Window rig: dawnLight behind the wall aimed at the window; the wall's shadow keeps it to the hole and the pane.
  const dawn = dawnLight();
  dawn.light.target.position.set(SINK_X, (HOLE.y0 + HOLE.y1) / 2, 0);
  Object.assign(dawn.light.shadow.camera, { left: -0.25, right: 0.25, top: 0.25, bottom: -0.25, near: 0.1, far: 3 });
  dawn.light.shadow.camera.updateProjectionMatrix();
  scene.add(dawn.light, dawn.light.target);
  const toL = L.clone().sub(new THREE.Vector3(-0.114, 0.083, 0));   // the first shadow's centre
  const E_KEY = KEY_I * (toL.z / toL.length()) / toL.lengthSq();
  const amb = new THREE.HemisphereLight(PALETTE.navy, col('navy', 'phone', 0.25), 0.8 * AMB);   // v3: cool bounce, not kraft's: the shadow is a navy shape, not a brown blotch
  scene.add(amb);
  wall.castShadow = true;   // for the window rig; the fridge spot sits in front of it, so the wall can't shade the room

  // DOF on the Student; the wall's blur stays under 4 px (spec).
  const look = LOOK.clone().sub(CAM).normalize();
  post({ focus: new THREE.Vector3(0.02, 0.05, BODY_Z).sub(CAM).dot(look), aperture: 0.012, lut: 'night' });

  const B = new THREE.Vector3(), hitW = new THREE.Vector3();
  // Door fraction open at drawing F (12/s): two drawings to open (DOOR_IN), wide open, two drawings to shut (DOOR_OUT), shut.
  const doorOpen = (F: number) => {
    for (const [o, c] of OPENS) {
      const i = F - fr(o), j = fr(c) - F;
      if (i < 0 || j <= 0) continue;
      return j <= 2 ? DOOR_OUT[2 - j] : i < 2 ? DOOR_IN[i] : 1;
    }
    return 0;
  };

  return {
    exam, rig, spot, face,
    update(t: number) {
      const T = onTwos(t), F = fr(T);
      const seed = boilSeed(t, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));

      // The door (on 2s) and the light with it: on whenever the door is off its seal, so the shadow comes and goes with it.
      const door = doorOpen(F);
      doorAt(door);
      spot.intensity = door > 0 ? KEY_I : 0;
      fill.intensity = door > 0 ? FILL_K * KEY_I : 0;

      // Student: stare, push it shut, turn away (mirrored; the first time he walks off two steps), turn back, pull it open.
      const inside = ([a, b]: number[]) => F >= fr(a) && F < fr(b);
      const w = WALKS.find(inside);
      rig.group.scale.x = AWAY.some(inside) ? -1 : 1;
      if (w) {
        const wk = walk(T, { set: 'side', step: 1 / 6, t0: w[0] });
        rig.blend(P, wk.keys, t);
        rig.group.position.set(HIP_X + kf(T, [[w[0], w[2]], [w[1], w[3]]], (x) => x), wk.hip!, BODY_Z);   // 'side' is a legged set: walk() returns its hip
      } else {
        rig.blend(P, KEYS, t);
        rig.group.position.set(HIP_X + (inside([WALKS[0][1], WALKS[1][0]]) ? WALKS[0][3] : 0), HIP_Y, BODY_Z);
      }
      rig.follow('tail', t);
      // His face never changes: neutral, eyes open, no blinks, no acting beats. That's the joke.
      act(rig, t, [[0, 'neutral']], { slump: 0, breath: 5, blink: false });
      rig.face({ eyes: 'open', mouth: 'neutral' });
      rig.boil(t, 10);

      // Exam: scoots on 2s while the door is shut, squash 0.2 for the drawing it lands on. v9: worried, growing; a side
      // glance at him on each scoot and the second after it lands, and one blink (5.5, two drawings): fewer than s02's.
      const [bx, bz] = kf(T, BLOB);
      exam.mesh.position.set(bx, SEAT_Y, bz);
      // v11: gulpFridge (5.5) replaces v9's blink there: squash 0.3 eyes closed on 5.417, snap to 1.25× stretched on 5.5, settled by
      // 5.75 (s03's gulp1), wobble down for a second, `plead` at him 5.67–6.17 (v9's map: after each gulp), then worried again.
      const grown = F >= GULP, tg = (F - GULP) / 12, r = grown ? BLOB_R.gulpFridge : BLOB_R.start;
      let squash = LANDS.some((l) => F === fr(l)) ? 0.2 : 0;
      if (F === GULP - 1) squash = 0.3;
      if (grown && F < GULP + 3) squash = -0.2 * Math.exp(-6 * tg) * Math.cos(18 * tg);
      const glance = BLOB.some(([k], i) => i % 2 === 1 && F >= fr(k) && F < fr(k) + 14);
      const eyes = F === GULP - 1 ? 'closed' : F >= GULP + 2 && F < GULP + 8 ? 'plead' : glance ? 'side' : 'worried';
      exam.mesh.scale.setScalar(r / BLOB_R.start);
      exam.update(t, { squash, wobble: grown && F < GULP + 12 ? 0.8 : 1, eyes, look: 1, key: spot });
      exam.mesh.updateMatrixWorld();

      // Key aimed along L → blob centre to its wall hit (aim() at the blob first so its frustum holds it).
      B.set(bx, SEAT_Y + r, bz);
      hitW.copy(B).sub(L).multiplyScalar(L.z / (L.z - B.z)).add(L);
      aim(spot, exam.mesh);
      spot.shadow.camera.near = 0.004;
      spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hitW);
      spot.target.updateMatrixWorld();

      // Window: late-afternoon gold sliding toward evening, at most 20% of the fridge spot at the wall.
      dawn.update(t, kf(t, [[0, 0.8], [7, 0.5]]));
      dawn.light.position.set(0.4, 0.6, -1.0);
      dawn.light.intensity = Math.min(dawn.light.intensity, 0.2 * E_KEY);
    },
  };
}
