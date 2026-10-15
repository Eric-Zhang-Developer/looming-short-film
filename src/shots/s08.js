// s08 · Scroll to sunrise (docs/shots/s08.md). Animatic blocking: proxies until art is frozen, shared rigs.
// Locked camera on the bed. Key: the phone, aimed every frame along L → blob to its wall hit (12.6×). Rival: dawn, a
// directional light behind the wall that reaches the room only through the curtain seams. Characters on 2s, light at 24,
// boil 10/s. The Student lies on his side facing camera: the front turnaround rotated 90° (head toward −x).
import * as THREE from 'three';
import { makePaper } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, dawnLight, ambient, aim } from '../lights.js';
import { kf, easeIn, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator } from '../characters/gator.js';
import { makeExam } from '../characters/exam.js';

const ID = 's08', DEG = Math.PI / 180;
const CAM = new THREE.Vector3(0.04, 0.15, 1.15), LOOK = new THREE.Vector3(0.04, 0.13, 0.15);
const L = new THREE.Vector3(0.180, 0.036, 0.315), B = new THREE.Vector3(0.155, 0.046, 0.29);  // phone (key) and blob centre
const TOP = 0.034, CEIL = 0.30;                                  // mattress top, ceiling
const WIN = { x0: -0.20, x1: -0.10, y0: 0.12, y1: 0.24 };         // apt_window; the curtain panels cover x −0.197..−0.103
const ANGLE = 0.78;                                              // spec 0.6; see the done note
const SPOT = 0.10;                                                // phone key, cd (decay 2): tuned so the lit wall sits well below white
const SUN = { I: 15, gold: 0.5, x: -0.9, z: -1.0, y: [[0, 0.45], [6, 0.70]] };  // dawn light: peak intensity, position, rising y (spec)
const F = (s) => Math.round(s * 12) / 12;                         // spec times are 2s drawings
const FLICKS = Array.from({ length: 12 }, (_, i) => 0.25 + 0.5 * i);  // 0.25, 0.75 … 5.75
const at = (T, a, b) => T >= F(a) && T < F(b);
const lin = (x) => x;

// A shape that fills its canvas has no edge to tear, so rects are inset by 4% of the long side (as s01).
function torn(w, h) {
  const m = 0.04 * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (a, b, k) => '#' + new THREE.Color(PALETTE[a]).lerp(new THREE.Color(PALETTE[b]), k).getHexString();
  const tiltOf = (k) => { const r = mulberry32(seedOf(ID, k)); return [(2 * r() - 1) * 1.5 * DEG, (2 * r() - 1) * 1.5 * DEG, 0]; };
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.copy(CAM);
  camera.lookAt(LOOK);

  // ---------- paper helpers ----------
  const boiling = [];  // [mesh, seed => PaperSheet, last seed]
  const paper = (key, opts, mat, boil = true) => {
    const make = (s) => makePaper({ ...opts, key: `${ID}-${key}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    if (boil) boiling.push([mesh, make, 0]);
    return mesh;
  };
  const place = (mesh, pos, { tilt = null, rot = null } = {}) => {
    const g = new THREE.Group();
    g.add(mesh); g.position.set(...pos);
    if (rot) g.rotation.set(...rot);
    if (tilt) mesh.rotation.set(...tiltOf(tilt));
    scene.add(g);
    return { g, mesh };
  };
  const rect = (key, color, [w, h], pos, o = {}) =>
    place(paper(key, { ...torn(w, h), color, weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat, o.boil ?? true), pos,
      { tilt: o.tilt ? key : null, rot: o.rot });
  // A cut piece fitted so its visible (opaque) box is [w, h]; origin at that box's centre (as s04).
  const cut = (a, p, [w, h], key, o = {}) => {
    const [sw, sh] = a.sizes[p], [u0, v0, u1, v1] = a.visible[p], vw = sw * (u1 - u0), vh = sh * (v1 - v0);
    const sx = w / vw, sy = h / vh;
    const mesh = paper(key, { art: o.art ?? a.pieces[p], size: [sw, sh], weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat);
    mesh.scale.set(sx, sy, 1);
    mesh.position.set(-((u0 + u1) / 2 - 0.5) * sw * sx, ((v0 + v1) / 2 - 0.5) * sh * sy, 0);
    const inner = new THREE.Group(); inner.add(mesh);
    if (o.tilt) inner.rotation.set(...tiltOf(key));
    const g = new THREE.Group(); g.add(inner); scene.add(g);
    return { g, inner, mesh };
  };

  const [furn, props, study] = await Promise.all([assets.load('apt_furniture_sheet'), assets.load('apt_props_sheet'), assets.load('study_props_sheet')]);
  const cream = PALETTE.cream, navy = PALETTE.navy;

  // ---------- wall (z 0): cream cardstock, the shadow receiver, never tilted ----------
  // A big torn sheet wanders by centimetres at its edge, so the wall only gets a generous opening (x −0.215..−0.085,
  // y 0.105..0.255); the exact window hole is cut in a small frame plate in front of it, whose tear is millimetres.
  // No translucency or edge catch on the wall: the sun behind it must reach the room only through the window.
  const WALL = { x0: -0.9, x1: 0.5, y0: -0.03, y1: CEIL }, OPEN = { x0: -0.215, x1: -0.085, y0: 0.105, y1: 0.255 };
  const wallArt = (() => {
    const W = 4096, H = Math.round(W * (WALL.y1 - WALL.y0) / (WALL.x1 - WALL.x0));
    const c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d');
    g.fillStyle = cream; g.fillRect(0, 0, W, H);
    const px = (x) => (x - WALL.x0) / (WALL.x1 - WALL.x0) * W, py = (y) => (WALL.y1 - y) / (WALL.y1 - WALL.y0) * H;
    g.clearRect(px(OPEN.x0), py(OPEN.y1), px(OPEN.x1) - px(OPEN.x0), py(OPEN.y0) - py(OPEN.y1));
    return c;
  })();
  place(paper('apt_wall', { art: wallArt, size: [WALL.x1 - WALL.x0, WALL.y1 - WALL.y0], res: 4096 }, { translucency: 0, edgeCatch: 0 }, false),
    [(WALL.x0 + WALL.x1) / 2, (WALL.y0 + WALL.y1) / 2, 0]);

  // Frame plate (z 0.001): cream, 0.24 × 0.22 around the window, with the exact window hole cut in it.
  const FR = { x0: -0.27, x1: -0.03, y0: 0.07, y1: 0.29 };
  const frameArt = (() => {
    const m = 0.04 * (FR.x1 - FR.x0), w = FR.x1 - FR.x0 + 2 * m, h = FR.y1 - FR.y0 + 2 * m, k = 2048 / w;  // px per m
    const c = Object.assign(document.createElement('canvas'), { width: 2048, height: Math.round(h * k) }), g = c.getContext('2d');
    g.fillStyle = cream; g.fillRect(m * k, m * k, (FR.x1 - FR.x0) * k, (FR.y1 - FR.y0) * k);
    g.clearRect((WIN.x0 - FR.x0 + m) * k, (FR.y1 - WIN.y1 + m) * k, (WIN.x1 - WIN.x0) * k, (WIN.y1 - WIN.y0) * k);
    return { c, size: [w, h] };
  })();
  place(paper('apt_frame', { art: frameArt.c, size: frameArt.size, res: 2048 }, { translucency: 0, edgeCatch: 0.6 }),
    [(FR.x0 + FR.x1) / 2, (FR.y0 + FR.y1) / 2, 0.001]);

  // Window pane (apt_window, z 0.002): tissue, a few mm bigger than the window hole. It glows when the sun is behind it
  // and lets the sun on to the curtains, so it casts nothing.
  rect('window-pane', cream, [WIN.x1 - WIN.x0 + 0.006, WIN.y1 - WIN.y0 + 0.006], [-0.15, 0.18, 0.002],
    { weight: 'tissue', res: 1024, mat: { translucency: 0.9, edgeCatch: 0 } }).mesh.castShadow = false;

  // Curtains (blackout_curtains, procedural): two Night Navy cardstock panels at z 0.006 covering x −0.197..−0.103, y
  // 0.11..0.26, with a 1 mm gap at x −0.15; rod y 0.26, x −0.24..−0.06 at z 0.008, brackets at x −0.23 and −0.07.
  // Untilted: a ±1.5° lean would swing a panel's foot 4 mm and close the seams.
  const PW = (0.094 - 0.001) / 2, PY = [0.11, 0.26];
  for (const [i, cx] of [[0, -0.197 + PW / 2], [1, -0.103 - PW / 2]]) rect(`curtain${i}`, navy, [PW, PY[1] - PY[0]], [cx, (PY[0] + PY[1]) / 2, 0.006], { res: 1024 });
  rect('rod', col('kraft', 'navy', 0.5), [0.18, 0.004], [-0.15, 0.262, 0.008], { weight: 'kraft', res: 512 });
  for (const [i, x] of [[0, -0.23], [1, -0.07]]) rect(`bracket${i}`, col('kraft', 'navy', 0.5), [0.005, 0.012], [x, 0.258, 0.007], { weight: 'kraft', res: 256 });

  // Ceiling (apt_ceiling, y 0.30, z 0..0.45): flat Night Navy cardstock, faces down. Floor (apt_floor, y 0): kraft, boards.
  place(paper('apt_ceiling', { ...torn(1.4, 0.45), color: navy, res: 1024 }, { translucency: 0, edgeCatch: 0 }, false), [-0.2, CEIL, 0.225], { rot: [Math.PI / 2, 0, 0] });
  const floorArt = (() => {
    const W = 2048, H = Math.round(W * 0.5 / 1.4), c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d');
    const r = mulberry32(seedOf(ID, 'floor'));
    g.fillStyle = PALETTE.kraft; g.fillRect(0, 0, W, H);
    g.strokeStyle = col('kraft', 'ink', 0.25); g.lineCap = 'round';
    for (let y = 30; y < H; y += 70) {
      g.lineWidth = 2 + 2 * r(); g.beginPath(); g.moveTo(0, y + 6 * (r() - 0.5));
      g.quadraticCurveTo(W / 2, y + 12 * (r() - 0.5), W, y + 6 * (r() - 0.5)); g.stroke();
    }
    return c;
  })();
  place(paper('apt_floor', { art: floorArt, size: [1.4, 0.5], weight: 'kraft', res: 2048 }, { translucency: 0, edgeCatch: 0 }, false), [-0.2, 0, 0.25], { rot: [-Math.PI / 2, 0, 0] });

  // ---------- props left from s07: ladder (x −0.15, z 0.04) and drill on the floor (−0.08, z 0.10) ----------
  // The proxy ladder is a solid slab that would hide the middle seam, so it is opened up between rungs (proxies only).
  let ladderArt;
  if (props.proxy) {
    const src = props.pieces.ladder, [u0, v0, u1, v1] = props.visible.ladder;
    ladderArt = Object.assign(document.createElement('canvas'), { width: src.width, height: src.height });
    const g = ladderArt.getContext('2d');
    g.drawImage(src, 0, 0);
    const X = (u) => (u0 + u * (u1 - u0)) * src.width, Y = (v) => (v0 + v * (v1 - v0)) * src.height;
    const rungs = [0.18, 0.16, 0.12, 0.08, 0.04].map((y) => (0.2 - y) / 0.2), th = 0.02;  // v of each rung centre, from the top
    let prev = 0;
    for (const v of [...rungs, 1 + th]) { g.clearRect(X(0.2), Y(prev), X(0.8) - X(0.2), Y(Math.min(v - th, 1)) - Y(prev)); prev = v + th; }
  }
  const ladder = cut(props, 'ladder', [0.04, 0.20], 'ladder', { weight: 'kraft', art: ladderArt, tilt: true });
  ladder.g.position.set(-0.15, 0.10, 0.04);
  const drill = cut(props, 'drill', [0.02, 0.018], 'drill', { tilt: true });
  drill.g.position.set(-0.08, 0.009, 0.10);

  // ---------- the bed (apt_bed): mattress x 0.13..0.36 top y 0.034, pillow x 0.165..0.21 top 0.045, tissue blanket ----------
  const mattress = cut(furn, 'apt_bed_mattress', [0.23, TOP], 'bed-mattress');
  mattress.g.position.set(0.245, TOP / 2, 0.36);
  const bedTop = rect('bed-top', col('cream', 'kraft', 0.15), [0.23, 0.12], [0.245, TOP, 0.30], { rot: [-Math.PI / 2, 0, 0], boil: false });
  const pillow = cut(furn, 'apt_bed_pillow', [0.045, 0.011], 'bed-pillow', { tilt: true });
  pillow.g.position.set(0.1875, TOP + 0.0055, 0.285);
  const blanket = cut(furn, 'apt_bed_blanket', [0.145, 0.035], 'bed-blanket', { weight: 'tissue', tilt: true });
  blanket.g.position.set(0.2875, TOP + 0.0175, 0.32);

  // ---------- the phone (study_props_sheet): leans back toward him, its back to the camera, screen cyan ----------
  const phone = new THREE.Group();
  for (const [name, z, ry] of [['phone_back', 0, 0], ['phone_face', -0.0004, Math.PI]]) {
    const [sw, sh] = study.sizes[name], [u0, v0, u1, v1] = study.visible[name];
    const m = paper(name, { art: study.pieces[name], size: [sw, sh], res: 512 });
    m.position.set(-((u0 + u1) / 2 - 0.5) * sw, ((v0 + v1) / 2 - 0.5) * sh, 0);
    m.castShadow = false;
    const g = new THREE.Group(); g.add(m); g.position.z = z; g.rotation.y = ry; phone.add(g);
  }
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0058), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
  screen.rotation.y = Math.PI; screen.position.z = -0.0008;
  phone.add(screen);
  phone.rotation.x = -35 * DEG;                       // top tips back toward him
  phone.position.set(L.x, TOP + 0.004 * Math.cos(35 * DEG), L.z);
  scene.add(phone);

  // ---------- the Student: the front turnaround lying on his side, head toward −x, feet at x 0.25 ----------
  const rig = await makeGator({ assets }, { seed: 8, facing: 'front', res: 1024 });
  rig.group.position.set(0.25, 0.052, 0.30);
  rig.group.rotation.z = 90 * DEG;
  scene.add(rig.group);

  // The phone sits 2–3 cm from everything on the bed, so each of those would throw its own 10–25× shadow beside the blob's.
  // The spec has the phone's shadow the only big one (he is outside the cone; the bed is not mentioned), so the bed and he cast nothing.
  rig.group.traverse((o) => { o.castShadow = false; });
  for (const o of [mattress, pillow, blanket, bedTop]) o.g.traverse((m) => { m.castShadow = false; });
  // ---------- the Exam beside his head ----------
  const exam = makeExam({ shot: ID });
  scene.add(exam.mesh, exam.stain);
  exam.stain.position.set(B.x, TOP + 0.0003, B.z);
  exam.mesh.position.set(B.x, TOP, B.z);  // the blob's origin is its bottom: its centre is B

  // ---------- light ----------
  // Key: the phone at L, a cone that holds the blob (19°) and not his head (47°) or body (112°) (spec).
  const spot = phoneLight({ intensity: SPOT, angle: ANGLE, penumbra: 0.2, distance: 1.0 });
  spot.position.copy(L);
  scene.add(spot, spot.target);
  // Face fill (README §4): unshadowed cyan point at the phone, just below his eyes, constant.
  const fill = new THREE.PointLight(PALETTE.phone, 0.2 * SPOT, 0.06, 2);
  fill.position.set(L.x, L.y - 0.002, L.z + 0.003);
  scene.add(fill);
  // Rival: dawn behind the wall. The wall and the curtains block it; only the seams pass it.
  const dawn = dawnLight();
  const sun = dawn.light;
  sun.target.position.set(-0.15, 0.18, 0);
  Object.assign(sun.shadow.camera, { left: -0.8, right: 0.8, top: 0.8, bottom: -0.8, near: 0.1, far: 4 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 1;
  scene.add(sun, sun.target);
  const amb = ambient();
  scene.add(amb);

  // DOF on his face (0.85 m along the look direction; the wall seams stay at 1.15 m). Aperture 0.009, not the spec's 0.012: at 1080 px
  // the blur is 1080 · aperture · (1.15 − 0.85) = 2.9 px (3.9 at 0.012), and the spec wants the seams at 3 px or less.
  const look = LOOK.clone().sub(CAM).normalize();
  post({ focus: new THREE.Vector3(0.18, 0.05, 0.30).sub(CAM).dot(look), aperture: 0.009, lut: 'night' });

  const hit = new THREE.Vector3(), GOLD = new THREE.Color(PALETTE.lamp);

  return {
    exam, rig, spot, fill, sun, amb, phone, camera,  // for evidence/anim-s08/*.html only; the film ignores them
    update(t) {
      const T = onTwos(t);
      const bs = Math.floor(t * 10 + 1e-6);
      for (const b of boiling) if (bs !== b[2]) { b[2] = bs; updatePaperMesh(b[0], b[1](bs)); }

      // ---- Student: tired eyes, the slow blink, the yawn, thumb flicks on every half second ----
      const yawn = at(T, 3.0, 3.67);
      rig.face({ eyes: at(T, 1.5, 1.67) || yawn || at(T, 4.5, 4.58) ? 'closed' : 'tired', mouth: yawn ? 'o' : 'neutral' });
      rig.boil(t, 10);
      const flick = FLICKS.some((f) => Math.abs(T - F(f)) < 1e-6) ? 2 : 0;
      // arm_r lies along the body toward his head, tip on the phone; head tips back 2° from 2.83 to 3.67 (the body joint).
      rig.joints.arm_r.rotation.z = (172 + flick) * DEG;
      rig.joints.arm_l.rotation.z = 8 * DEG;
      rig.joints.body.rotation.z = at(T, 2.83, 3.67) ? 2 * DEG : 0;
      rig.group.updateMatrixWorld(true);

      // ---- Exam: tired, closed with his yawn, then at 5.0 eyes side toward the glowing seams (frame left) ----
      exam.update(t, { wobble: 0.8, eyes: T >= F(5.0) ? 'side' : yawn ? 'closed' : 'tired', look: -1, key: spot });
      exam.mesh.updateMatrixWorld();

      // ---- Key: phone at L, aimed along L → blob centre to the wall hit (blob first, so the shadow frustum fits it) ----
      aim(spot, exam.mesh);
      hit.copy(B).sub(L).multiplyScalar(L.z / (L.z - B.z)).add(L);
      spot.shadow.camera.near = 0.004;  // README §11: the blob is within 4 cm of L
      spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hit);
      spot.target.updateMatrixWorld();

      // ---- Rival: dawn, night to gold, rising behind the wall; 0 at 0.0 ----
      dawn.update(t, kf(t, [[0, 0], [6, 0.8]], lin));
      sun.color.lerp(GOLD, SUN.gold);  // the night grade pulls gold toward lilac; a deeper gold survives it
      sun.position.set(SUN.x, kf(t, SUN.y, lin), SUN.z);
      sun.intensity = SUN.I * kf(t, [[0, 0], [6, 1]], easeIn);
      sun.target.updateMatrixWorld();
      // ---- Fill: the room greys toward morning, 15% → 30% of ambient's s02 level ----
      amb.intensity = 0.8 * kf(t, [[0, 0.15], [6, 0.30]], lin);
    },
  };
}
