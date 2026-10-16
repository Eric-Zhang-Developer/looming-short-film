// s08 · Game to sunrise (docs/shots/s08.md, G4). v2 on the frozen home_kit: s07's bedroom framed on the bed, both
// blackout blinds down. He lies tucked in, head propped on the pillow facing camera, gaming on the laptop on the
// mattress (the front turnaround, upright, sunk behind the bed's near side: its head reads; on its side it read as a lump); the 2× blob sits
// beside his head and its shadow (S 6.3, 12.6 units) lies over both blinds. Dawn creeps in only through the blinds'
// 1.5 mm side gaps: four seams that glow from nothing to hot gold, and a thin gold slash into the room from the last.
// The blob notices the morning (5.0); he doesn't. Characters on 2s, light at 24, boil 10/s.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, dawnLight, ambient, aim } from '../lights.js';
import { kf, easeIn, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator } from '../characters/gator.js';
import { specPose } from '../characters/poses.js';

const ID = 's08', DEG = Math.PI / 180;
const F = (s) => Math.round(s * 12) / 12;
const BLOB_R = { start: 0.024 };                               // METER.gulp4 (README §1): 2× all shot
// The bedroom, as s07 (keep the two in step): windows, glass holes, blind gaps, ceiling, bed.
const CEIL = 0.145;
const WIN = { A: -0.168, B: -0.088, y: 0.068, h: 0.062 };
const HOLE = { hw: 0.0245, y0: -0.024, y1: 0.024 };
const GAP = 0.0015;
const DROP = 1.13;
// The bed seen from its long side: frame and mattress faces on the near side (z 0.355), the mattress top a flat card back
// to the wall side (z 0.27), so the blob, his head and the laptop stand on it and the near side hides what's below.
const BED = { x0: 0.10, z: 0.355, back: 0.27, matB: 0.021, matH: 0.016 };
const MT = BED.matB + BED.matH;                                // mattress top, 0.037 (67 cm)
// Key and blob: z from the spec; the blob 1 cm left of the spec's x so it doesn't cover his eyes (its shadow moves 6 cm
// left and still lies over both blinds) (S = 0.3447 / (0.3447 − 0.29) = 6.3); y on this mattress, with L at the lid's top,
// 1.6 cm over the mattress, so the shadow's eyes land on the wall under the 0.145 ceiling.
const L = new THREE.Vector3(0.180, MT + 0.016, 0.3447), B = new THREE.Vector3(0.125, MT, 0.29);
const CAM = new THREE.Vector3(0.050, 0.076, 0.90), LOOK = new THREE.Vector3(0.050, 0.068, 0.20);   // under the ceiling: both blinds, the bed, his face; his feet run off right
const SPOT = 0.12, ANGLE = 0.78;                               // phone-light key, cd; cone (anim-s08 widened the spec's 0.6)
const FACE_FILL = 0.12;                                        // the face fill, fraction of the spot (v3-readability: was 0.2, pure cyan)
// v3-readability: the cold viewer saw "a green frog" in the bed. The front turnaround has no snout, and the hoodie sat
// below the mattress line. Now it's the profile rig sitting up against the pillow, hoodie above the covers, snout over
// the laptop on his lap, legs under the blanket: the long snout and the hoodie are what say "him". The spot, the blob
// and the shadow are unchanged (L and B didn't move).
const SIT = { hip: [0.146, MT + 0.003, 0.300], pose: specPose({ lean: -10, arm: -40, far: -48, head: -16, leg: 82, farLeg: 80, tail: -10 }) };
const WARM = [1.18, 0.96, 0.82];   // his paper's colour multiplier against the screen's cyan, which he sits inside
const PILLOW_X = 0.128;                                        // behind his back (was 0.172, behind the front head)
const SUN = { I: 15, path: [[0, [-0.9, 0.45, -1.0]], [6, [-0.9, 0.70, -1.0]]], k: [[0, 0.0], [6, 0.8]] };
const SEAM = 2.2;                                              // seam glow at k 0.8 (MeshBasic gain on lamp gold)
const AMB = [[0, 0.15], [6, 0.30]];                            // ambient, fraction of s02's 0.8
const TAPS = Array.from({ length: 12 }, (_, i) => F(0.25 + 0.5 * i));
const at = (T, a, b) => T >= F(a) && T < F(b);
const lin = (x) => x;

const PAD = 0.04;
function torn(w, h) {
  const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (a, b, k) => '#' + new THREE.Color(PALETTE[a]).lerp(new THREE.Color(PALETTE[b]), k).getHexString();
  const tiltOf = (k) => { const r = mulberry32(seedOf(ID, k)); return [(2 * r() - 1) * 1.2 * DEG, (2 * r() - 1) * 1.2 * DEG, 0]; };
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.copy(CAM);
  camera.lookAt(LOOK);

  // ---------- paper helpers (as s07): nothing casts unless set to ----------
  const boiling = [];
  const paper = (key, opts, mat) => {
    const make = (s) => makePaper({ ...opts, key: `${ID}-${key}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    mesh.castShadow = false;
    boiling.push([mesh, make]);
    return mesh;
  };
  const group = (mesh, pos, { rot = null } = {}) => {
    const g = new THREE.Group();
    g.add(mesh); g.position.set(...pos);
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
  const ghost = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
  const blocker = ([x0, x1, y0, y1], z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), ghost);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z);
    m.castShadow = true;
    scene.add(m);
    return m;
  };

  const home = await assets.load('home_kit');

  // ---------- room shell (as s07) ----------
  const wall = paper('apt_wall', { ...torn(1.1, CEIL + 0.04), color: PALETTE.cream, res: 2048 }, { translucency: 0, edgeCatch: 0 });
  group(wall, [-0.05, CEIL / 2, 0]);
  group(paper('apt_ceiling', { ...torn(1.1, 0.6), color: col('navy', 'cream', 0.12), res: 512 }, { translucency: 0, edgeCatch: 0 }), [-0.05, CEIL, 0.3], { rot: [Math.PI / 2, 0, 0] });
  group(paper('apt_floor', { art: tiled(home, 'floor_strip', 4, 12), size: [1.1, 0.66], weight: 'kraft', res: 2048 }, { translucency: 0, edgeCatch: 0 }),
    [-0.05, 0, 0.33], { rot: [-Math.PI / 2, 0, 0] });
  const holes = ['A', 'B'].map((k) => [WIN[k] - HOLE.hw, WIN[k] + HOLE.hw, WIN.y + HOLE.y0, WIN.y + HOLE.y1]);
  const [ha, hb] = holes;
  for (const r of [[-2, ha[0], -1, 2], [ha[1], hb[0], -1, 2], [hb[1], 2, -1, 2], [ha[0], hb[1], ha[3], 2], [ha[0], hb[1], -1, ha[2]]]) blocker(r, -0.004);

  // ---------- windows, blinds down (s07's end): frame, dimmed blind cloth, hidden blocker with the 1.5 mm side gaps ----------
  // The glass sits hidden behind the cloth (s07 hides it once a blind is down); the seams are drawn: a gold hairline at
  // each gap that glows with the dawn (a 1.5 mm gap is under a pixel's worth of lit tissue at this distance).
  const seams = [];
  const seamMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (const k of ['A', 'B']) {
    const x = WIN[k];
    const fr = cut(home, 'window_frame', [null, WIN.h], `frame${k}`, { at: [x, WIN.y - 0.002, 0.003], mat: { edgeCatch: 0 } });   // no rim glow: the sill read as broken white
    const top = WIN.y - 0.002 + WIN.h / 2;
    const down = cut(home, 'blind_down', [fr.size[0] * 0.98, null], `blinddown${k}`, { anchor: [0.5, 1], at: [x, top + 0.004, 0.0055] });
    down.g.scale.y = DROP;
    down.mesh.material.color.setScalar(0.55);
    down.mesh.material.userData.paper.uTranslucency.value = 0;
    blocker([x - HOLE.hw + GAP, x + HOLE.hw - GAP, WIN.y + HOLE.y0 - 0.002, WIN.y + HOLE.y1 + 0.002], 0.0045);
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.0016, HOLE.y1 - HOLE.y0), seamMat);
      m.position.set(x + s * (HOLE.hw - GAP / 2), WIN.y, 0.0062);
      scene.add(m); seams.push(m);
    }
  }

  // ---------- the bed (as s07): frame, mattress (near face and top), pillow behind his head, tissue blanket over him ----------
  cut(home, 'bed_frame', [0.120, null], 'bed_frame', { anchor: [0, 0], at: [BED.x0, 0, BED.z] });
  cut(home, 'bed_mattress', [0.104, BED.matH], 'bed_mattress', { anchor: [0, 0], at: [BED.x0 + 0.008, BED.matB, BED.z + 0.002] });
  group(paper('bed-top', { ...torn(0.104, BED.z - BED.back), color: col('cream', 'kraft', 0.12), res: 512 }),
    [BED.x0 + 0.060, MT - 0.0005, (BED.z + BED.back) / 2], { rot: [-Math.PI / 2, 0, 0] });
  cut(home, 'bed_pillow', [0.036, null], 'bed_pillow', { anchor: [0.5, 0], at: [PILLOW_X, MT - 0.002, 0.292] });
  cut(home, 'bed_blanket', [0.080, null], 'bed_blanket', { anchor: [0.5, 1], at: [0.200, MT + 0.010, 0.318], weight: 'tissue' });
  cut(home, 'laundry_pile', [0.030, null], 'laundry', { anchor: [0.5, 0], at: [0.085, 0, 0.33], tilt: true });
  cut(home, 'poster_b', [0.034, null], 'poster', { at: [0.012, 0.080, 0.002], tilt: true });

  // ---------- the laptop on the mattress, its screen toward his face: the camera sees the lid's back, dark ----------
  const laptop = new THREE.Group();
  laptop.position.set(L.x, MT, L.z);
  laptop.rotation.y = -0.7 * Math.PI;   // screen toward him (−x), its back turned partly to camera
  scene.add(laptop);
  const lid = cut(home, 'laptop_screen', [0.0185, null], 'laptop_lid', { anchor: [0.5, 0], parent: laptop, at: [0, 0.001, 0] });
  lid.mesh.material.color.setScalar(0.25);   // the lid's back: the painting seen from behind, dimmed to a dark card

  // ---------- the Student: the profile rig sitting up in bed (SIT) ----------
  const rig = await makeGator({ assets }, { seed: 8, res: 1024 });
  rig.group.position.set(...SIT.hip);
  scene.add(rig.group);
  rig.group.traverse((o) => { o.castShadow = false; });
  for (const [n, m] of Object.entries(rig.meshes)) if (n !== 'eyes' && n !== 'mouth') m.material.color.setRGB(...WARM);

  // ---------- the Exam beside his head ----------
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.mesh.position.copy(B);
  exam.stain.position.set(B.x, MT + 0.0004, B.z);
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  const spot = phoneLight({ intensity: SPOT, angle: ANGLE, penumbra: 0.2, distance: 1.0 });
  spot.position.copy(L);
  scene.add(spot, spot.target);
  const fill = new THREE.PointLight(new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.cream), 0.5), FACE_FILL * SPOT, 0.06, 2);
  fill.position.set(L.x - 0.004, L.y + 0.022, SIT.hip[2] + 0.015);   // his face and hoodie, from the screen's side
  scene.add(fill);
  const dawn = dawnLight(), sun = dawn.light;
  sun.target.position.set((WIN.A + WIN.B) / 2, WIN.y, 0);
  Object.assign(sun.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3, near: 0.5, far: 3 });
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 1;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  const amb = ambient();
  scene.add(amb);
  const GOLD = new THREE.Color(PALETTE.lamp).lerp(new THREE.Color(PALETTE.cream), 0.25);

  const look = LOOK.clone().sub(CAM).normalize();
  post({ focus: new THREE.Vector3(0.17, 0.055, 0.30).sub(CAM).dot(look), aperture: 0.009, lut: 'night' });
  const hit = new THREE.Vector3(), C = new THREE.Vector3(B.x, B.y + 1.08 * BLOB_R.start, B.z);

  return {
    exam, rig, spot, sun, amb, seams,
    update(t) {
      const T = onTwos(t);
      const seed = boilSeed(t, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));

      // ---- Student: tired eyes, the slow blink, the yawn, a key tap every half second ----
      const yawn = at(T, 3.0, 3.67);
      rig.face({ eyes: at(T, 1.5, 1.67) || yawn || at(T, 4.5, 4.58) ? 'closed' : 'tired', mouth: yawn ? 'o' : 'neutral' });
      rig.boil(t, 10);
      const tap = TAPS.some((f) => Math.abs(T - f) < 1e-6) ? 2 : 0;
      rig.blend({ sit: SIT.pose }, [[0, 'sit']], 0);
      rig.joints.arm_r.rotation.z += tap * DEG;                                 // a key tap
      if (at(T, 2.83, 3.67)) { rig.joints.body.rotation.z += 4 * DEG; rig.joints.head.rotation.z += 12 * DEG; }   // the yawn tips him back

      // ---- the Exam: tired, closed with his yawn, then side toward the seams (frame-left) at 5.0 ----
      exam.update(t, { wobble: 0.8, eyes: T >= F(5.0) ? 'side' : yawn ? 'closed' : 'tired', look: -1, key: spot });
      exam.mesh.updateMatrixWorld();

      // ---- key: the screen at L, aimed along L → blob centre to its wall hit ----
      aim(spot, exam.mesh);
      hit.copy(C).sub(L).multiplyScalar(L.z / (L.z - C.z)).add(L);
      spot.shadow.camera.near = 0.004;
      spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hit);
      spot.target.updateMatrixWorld();

      // ---- rival: dawn rising behind the wall, through the gaps only; the seams glow with it ----
      const k = kf(t, SUN.k, lin);
      dawn.update(t, k);
      sun.position.set(...kf(t, SUN.path, lin));
      sun.intensity = SUN.I * kf(t, [[0, 0], [6, 1]], easeIn);
      sun.target.updateMatrixWorld();
      seamMat.color.copy(GOLD).multiplyScalar(SEAM * easeIn(t / 6));
      amb.intensity = 0.8 * kf(t, AMB, lin);
    },
  };
}
