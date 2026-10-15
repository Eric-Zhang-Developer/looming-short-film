// s04 · The fridge dodge (docs/shots/s04.md). Animatic blocking: proxies until art is frozen, shared rigs.
// Locked camera. Key: the fridge light just outside the mouth, aimed every frame along L → blob to its wall hit, so the
// blob's shadow on the kitchen wall is 4.17× → 5.0× → 6.25× as it scoots toward him. He kneels in front of the light
// (z 0.30 > L.z 0.25), so he throws nothing on the wall. Characters and props on 2s, light at 24, boil 10/s.
import * as THREE from 'three';
import { makePaper } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, dawnLight, ambient, aim } from '../lights.js';
import { kf, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { POSES, specPose } from '../characters/poses.js';
import { makeExam } from '../characters/exam.js';

const ID = 's04', DEG = Math.PI / 180;
const CAM = new THREE.Vector3(-0.11, 0.15, 1.0), LOOK = new THREE.Vector3(-0.11, 0.12, 0.12);
const L = new THREE.Vector3(0.030, 0.035, 0.25), FILL = new THREE.Vector3(0.065, 0.035, 0.25);
const SEAT_Y = 0.045, STOOL_Z = 0.189;      // stool cut at the back of its z 0.19..0.21, so the blob is never behind it
const BODY_Z = 0.30, HAND_Z = BODY_Z + 0.013; // near arm +0.012, hand +0.001 (contracts §characters)
const HIP_X = 0.005;                          // body center lands at x ≈ 0.01
const PROP_Z = 0.245;                         // inside the spec's 0.24..0.26; at L.z exactly the jars would be edge-on to both lights
const TOP_Y = 0.05;
const NEAR_TRIM = 0.15;                        // see the stool                           // fridge top
// Blob center [x, z] by local t (spec Exam table); y is SEAT_Y + r.
const BLOB = [[0, [-0.015, 0.19]], [2.17, [-0.015, 0.19]], [2.33, [-0.017, 0.20]], [5.17, [-0.017, 0.20]], [5.33, [-0.020, 0.21]]];
const step = (t, keys) => keys.reduce((v, [k, x]) => (t >= k ? x : v), keys[0][1]);
const EYES = [[0, 'open'], [1.5, 'side'], [2.17, 'open'], [5.0, 'closed'], [5.83, 'side'], [6.5, 'closed'], [7.0, 'open']];
const MOUTH = [[0, 'neutral'], [1.67, 'o'], [2.17, 'neutral'], [5.0, 'smile'], [5.83, 'neutral'], [6.5, 'smile']];
const BLOB_EYES = [[0, 'side'], [5.0, 'closed'], [5.5, 'open'], [5.83, 'side']];

// A shape that fills its canvas has no edge to tear, so rects are inset by 4% of the long side (as s01).
const PAD = 0.04;
function torn(w, h) {
  const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (a, b, k) => '#' + new THREE.Color(PALETTE[a]).lerp(new THREE.Color(PALETTE[b]), k).getHexString();
  const tiltOf = (k) => { const r = mulberry32(seedOf(ID, k)); return [(2 * r() - 1) * 1.5 * DEG, (2 * r() - 1) * 1.5 * DEG, 0]; };
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.copy(CAM);
  camera.lookAt(LOOK);

  // ---------- paper helpers ----------
  const boiling = [];  // [mesh, seed => PaperSheet], re-torn every boil step
  const paper = (key, opts, mat) => {
    const make = (s) => makePaper({ ...opts, key: `${ID}-${key}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    boiling.push([mesh, make]);
    return mesh;
  };
  // A plane in a group whose origin is its center: the group is placed and turned, the mesh carries the tilt.
  const place = (mesh, at, { tilt = null, rot = null } = {}) => {
    const g = new THREE.Group();
    g.add(mesh); g.position.set(...at);
    if (rot) g.rotation.set(...rot);
    if (tilt) mesh.rotation.set(...tiltOf(tilt));
    scene.add(g);
    return { g, mesh };
  };
  const DISC = Array.from({ length: 16 }, (_, i) => [0.5 + 0.4 * Math.cos(i * Math.PI / 8), 0.5 + 0.4 * Math.sin(i * Math.PI / 8)]);
  const knobAt = (key, d, at) => place(paper(key, { path: DISC, color: knob, size: [d / 0.8, d / 0.8], res: 128 }), at, { tilt: key });
  const rect = (key, color, [w, h], at, o = {}) =>
    place(paper(key, { ...torn(w, h), color, weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat), at,
      { tilt: o.tilt === false ? null : key, rot: o.rot });
  // A cut piece fitted so its visible (opaque) box is [w, h] (one may be null: keep the art's aspect); origin at that
  // box's center. The spec's sizes win over PIECES, so a proxy is scaled to them (real art at the right aspect scales uniformly).
  const cut = (a, p, [w, h], key, o = {}) => {
    const [sw, sh] = a.sizes[p], [u0, v0, u1, v1] = a.visible[p], vw = sw * (u1 - u0), vh = sh * (v1 - v0);
    const sx = w != null ? w / vw : h / vh, sy = h != null ? h / vh : sx;
    const mesh = paper(key, { art: a.pieces[p], size: [sw, sh], weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat);
    mesh.scale.set(sx, sy, 1);
    mesh.position.set(-((u0 + u1) / 2 - 0.5) * sw * sx, ((v0 + v1) / 2 - 0.5) * sh * sy, 0);
    const inner = new THREE.Group(); inner.add(mesh);
    if (o.tilt !== false) inner.rotation.set(...tiltOf(key));
    const g = new THREE.Group(); g.add(inner); scene.add(g);
    return { g, inner, mesh };
  };

  const [furn, props] = await Promise.all([assets.load('apt_furniture_sheet'), assets.load('apt_props_sheet')]);
  const cream = PALETTE.cream, cab = col('cream', 'kraft', 0.25), knob = col('kraft', 'navy', 0.35), grey = col('cream', 'navy', 0.15);

  // ---------- wall (z 0): apt_kitchen plate with the window hole; the shadow receiver, so it is never tilted ----------
  const WALL = { x0: -0.6, x1: 0.4, y0: -0.02, y1: 0.32 }, HOLE = { x0: 0.02, x1: 0.08, y0: 0.12, y1: 0.18 };
  const wallArt = (() => {
    const W = 2048, H = Math.round(W * (WALL.y1 - WALL.y0) / (WALL.x1 - WALL.x0));
    const c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d');
    g.fillStyle = cream; g.fillRect(0, 0, W, H);
    const px = (x) => (x - WALL.x0) / (WALL.x1 - WALL.x0) * W, py = (y) => (WALL.y1 - y) / (WALL.y1 - WALL.y0) * H;
    g.clearRect(px(HOLE.x0), py(HOLE.y1), px(HOLE.x1) - px(HOLE.x0), py(HOLE.y0) - py(HOLE.y1));
    return c;
  })();
  place(paper('apt_kitchen', { art: wallArt, size: [WALL.x1 - WALL.x0, WALL.y1 - WALL.y0], res: 2048 }),
    [(WALL.x0 + WALL.x1) / 2, (WALL.y0 + WALL.y1) / 2, 0]);

  // Upper cabinets y 0.09..0.22. The spec runs them to x 0.05, which would cover the window (x 0.02..0.08), so they stop
  // at x 0.01. Four doors with 4 mm gaps, 4 mm off the wall, round knobs by the meeting edges.
  const UP = { x0: -0.45, x1: 0.01, y0: 0.09, y1: 0.22 }, nUp = 4, dw = (UP.x1 - UP.x0) / nUp;
  for (let i = 0; i < nUp; i++) {
    const cx = UP.x0 + dw * (i + 0.5);
    rect(`cab-up${i}`, cab, [dw - 0.004, UP.y1 - UP.y0 - 0.004], [cx, (UP.y0 + UP.y1) / 2, 0.004]);
    knobAt(`knob-up${i}`, 0.007, [cx + (i % 2 ? -1 : 1) * (dw / 2 - 0.012), UP.y0 + 0.014, 0.008]);
  }
  // Lower cabinets y 0..0.045, under the counter's front edge (4 mm behind it, not on the wall plate, or the 3 cm
  // counter overhang would hang in the air).
  const LO = { x0: -0.45, x1: 0.05 }, nLo = 5, lw = (LO.x1 - LO.x0) / nLo;
  for (let i = 0; i < nLo; i++) {
    const cx = LO.x0 + lw * (i + 0.5);
    rect(`cab-lo${i}`, cab, [lw - 0.004, 0.036], [cx, 0.020, 0.026]);
    knobAt(`knob-lo${i}`, 0.006, [cx + (i % 2 ? -1 : 1) * (lw / 2 - 0.011), 0.031, 0.029]);
  }
  // Counter: kraft top at y 0.045, z 0..0.03, with a 6 mm front edge.
  rect('counter-top', PALETTE.kraft, [0.5, 0.03], [-0.2, 0.045, 0.015], { weight: 'kraft', rot: [-Math.PI / 2, 0, 0], tilt: false });
  rect('counter-edge', col('kraft', 'navy', 0.2), [0.5, 0.006], [-0.2, 0.042, 0.0305], { weight: 'kraft', tilt: false });

  // Window (apt_window, procedural): tissue pane a few mm larger than the hole, two cardstock mullion strips.
  const wx = (HOLE.x0 + HOLE.x1) / 2, wy = (HOLE.y0 + HOLE.y1) / 2;
  rect('window-pane', cream, [0.066, 0.066], [wx, wy, 0.002], { weight: 'tissue', tilt: false, mat: { translucency: 0.8 } });
  rect('window-mullion-v', col('cream', 'kraft', 0.4), [0.004, 0.066], [wx, wy, 0.003], { tilt: false, res: 256 });
  rect('window-mullion-h', col('cream', 'kraft', 0.4), [0.066, 0.004], [wx, wy, 0.003], { tilt: false, res: 256 });

  // Floor (apt_floor, procedural): kraft with faint board seams running across, y = 0, z 0..0.5.
  const floorArt = (() => {
    const W = 2048, H = 1024, c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d');
    const r = mulberry32(seedOf(ID, 'floor'));
    g.fillStyle = PALETTE.kraft; g.fillRect(0, 0, W, H);
    g.strokeStyle = col('kraft', 'ink', 0.25); g.lineCap = 'round';
    for (let y = 40; y < H; y += 120) {
      g.lineWidth = 2 + 2 * r(); g.beginPath(); g.moveTo(0, y + 6 * (r() - 0.5));
      g.quadraticCurveTo(W / 2, y + 12 * (r() - 0.5), W, y + 6 * (r() - 0.5)); g.stroke();
    }
    return c;
  })();
  place(paper('apt_floor', { art: floorArt, size: [1.0, 0.5], weight: 'kraft', res: 2048 }), [-0.1, 0, 0.25], { rot: [-Math.PI / 2, 0, 0] });

  // ---------- fridge (mini_fridge): x 0.035..0.10, y 0..0.05, body z 0.22..0.28, mouth facing −x ----------
  cut(furn, 'mini_fridge', [0.065, 0.05], 'mini_fridge').g.position.set(0.0675, 0.025, 0.28);
  rect('fridge-top', grey, [0.065, 0.06], [0.0675, TOP_Y, 0.25], { rot: [-Math.PI / 2, 0, 0], tilt: false });
  rect('fridge-back', grey, [0.065, 0.05], [0.0675, 0.025, 0.22], { tilt: false });
  rect('fridge-inside', cream, [0.06, 0.05], [0.10, 0.025, 0.25], { rot: [0, -Math.PI / 2, 0], tilt: false });
  // Door: hinged on its wall-side edge (x 0.035, z 0.22). At the spec's 100° it stands in front of the stool and cuts
  // the light to the blob's lower half (the ray to the blob's center crosses it 3 cm from the hinge at y 0.048 < 0.05),
  // so it swings to 135°: then it sits behind the stool and every ray from L to the blob passes above it.
  const door = cut(furn, 'mini_fridge_door', [0.06, 0.05], 'mini_fridge_door', { tilt: false });
  door.inner.position.x = -0.03;
  door.g.position.set(0.035, 0.025, 0.22);
  door.g.rotation.y = (90 - 135) * DEG;
  door.mesh.castShadow = false;  // at 135° its shadow is a big wedge beside the blob's on the wall, a second shape competing

  // Stool (kitchen_stool): seat top y 0.045, 0.03 across, centered x −0.02.
  const stool = cut(furn, 'kitchen_stool', [0.03, SEAT_Y], 'kitchen_stool', { weight: 'kraft' });
  stool.g.position.set(-0.02, SEAT_Y / 2, STOOL_Z);
  // Stool and door stand 5–8 cm from the key and get ~15–20× the wall's light (inverse square), which blows them to
  // white. ponytail: an albedo trim stands in for exposure, per object; drop it if the director wants them hot.
  for (const m of [stool.mesh, door.mesh]) m.material.color.setScalar(NEAR_TRIM);

  // Fridge contents: 3 jars of falling size (spec heights) and a carton. Blank labels: the proxies carry none.
  const JARS = [
    { p: 'jar_l', h: 0.012, home: [0.050, 0.015], spots: [[0, 0.045]] },
    { p: 'jar_m', h: 0.010, home: [0.065, 0.014], spots: [[0, 0.062], [6.17, 0.060]] },  // placed 2 mm out of line, nudged back
    { p: 'jar_s', h: 0.008, home: [0.078, 0.013], spots: [[0, 0.073]] },
  ];
  for (const j of JARS) Object.assign(j, cut(props, j.p, [null, j.h], j.p));
  const carton = cut(props, 'carton', [null, 0.014], 'carton');
  const CARTON_HOME = [0.088, 0.016];

  // ---------- the Student, kneeling at the mouth, facing +x (frame right) ----------
  const rig = await makeGator({ assets }, { seed: 4 });
  const HIP_Y = hipHeight(POSES.kneel_reach);
  rig.group.position.set(HIP_X, HIP_Y, BODY_Z);
  scene.add(rig.group);

  // Poses whose hand must land on a spot: lean and arm solved so the fingertip, seen from the camera, covers the spot.
  const SH = [0.013, 0.030], ARM = 0.032;
  const toPlane = (p, z) => CAM.clone().add(p.clone().sub(CAM).multiplyScalar((z - CAM.z) / (p.z - CAM.z)));
  function reachTo(x, y) {
    const T = toPlane(new THREE.Vector3(x, y, PROP_Z), HAND_Z);
    let best = null;
    for (let i = 0; i <= 400; i++) {
      const lean = -10 + i * 0.1, c = Math.cos(-lean * DEG), s = Math.sin(-lean * DEG);
      const sx = HIP_X + SH[0] * c - SH[1] * s, sy = HIP_Y + SH[0] * s + SH[1] * c;
      const err = Math.abs(Math.hypot(T.x - sx, T.y - sy) - ARM);
      if (!best || err < best.err) best = { err, lean, arm: Math.atan2(T.y - sy, T.x - sx) / DEG };
    }
    return specPose({ leg: -90, lean: best.lean, arm: best.arm });
  }
  const jarY = (j) => TOP_Y + j.h / 2;
  const P = {
    ...POSES,
    place1: reachTo(0.045, jarY(JARS[0])),
    place2: reachTo(0.062, jarY(JARS[1])),
    place3: reachTo(0.073, jarY(JARS[2])),
    antic2: specPose({ leg: -90, lean: -13, arm: -70, head: 4 }),
  };
  const KEYS = [
    [0, 'kneel_reach'], [0.5, 'kneel_reach'], [0.67, 'kneel_antic'], [0.83, 'place1'], [1.0, 'place1'],
    [1.33, 'kneel_reach'], [1.5, 'inspect'], [2.0, 'inspect'], [2.17, 'place2'],
    [2.33, 'kneel_reach'], [2.5, 'inspect'], [3.17, 'inspect'], [3.33, 'place3'], [3.42, 'place3'],
    [3.5, 'kneel_reach'], [3.67, 'shake_a'], [3.83, 'shake_b'], [4.0, 'shake_a'], [4.17, 'shake_b'], [4.33, 'kneel_reach'],
    [4.5, 'kneel_reach'], [5.0, 'sit_heels'], [5.83, 'sit_heels'], [6.0, 'antic2'], [6.17, 'place2'], [6.33, 'place2'],
    [6.5, 'sit_heels'], [7.0, 'kneel_reach'], [8, 'kneel_reach'],
  ];
  const HELD = [[0, 0.83], [1.33, 2.17], [2.33, 3.33]], CARTON_HELD = [3.5, 4.33];  // [grab, release] per jar, local s

  // ---------- the Exam on the stool ----------
  const exam = makeExam({ shot: ID });
  scene.add(exam.mesh);

  // ---------- light ----------
  // Key: the fridge light by the phone-light convention, Phone Cyan 40% toward Cream. Intensity tuned so the lit wall
  // sits below white under NoToneMapping.
  const fridge = new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.cream), 0.4);
  const KEY_I = 0.3;
  const spot = phoneLight({ color: fridge, intensity: KEY_I, angle: 0.9, penumbra: 0.5, distance: 0.8 });
  spot.position.copy(L);
  scene.add(spot, spot.target);
  // Interior fill (README §5): unshadowed, same color, distance 0.05, 20% of the spot.
  const fill = new THREE.PointLight(fridge, 0.2 * KEY_I, 0.05, 2);
  fill.position.copy(FILL);
  scene.add(fill);
  // Window rig: dawnLight behind the wall, aimed at the window; the wall's own shadow keeps it to the hole and pane.
  // Capped at 20% of the spot's irradiance at the wall (at the first shadow center).
  const dawn = dawnLight();
  dawn.light.target.position.set(wx, wy, 0);
  Object.assign(dawn.light.shadow.camera, { left: -0.25, right: 0.25, top: 0.25, bottom: -0.25, near: 0.1, far: 3 });
  dawn.light.shadow.camera.updateProjectionMatrix();
  scene.add(dawn.light, dawn.light.target);
  const toL = L.clone().sub(new THREE.Vector3(-0.158, 0.127, 0));
  const E_KEY = KEY_I * (toL.z / toL.length()) / toL.lengthSq();
  // Character fill (README §10): the key is behind him, so a shadowless cool point light in front of his face, a little
  // above eye line. Its 0.15 m reach dies long before the wall (0.38 m away) and the stool (0.20 m), so the loom
  // shadow's contrast is untouched; FACE_I is set so his face reads at ~30–45% of the key-lit wall (measure.txt).
  const FACE_I = 0.014;
  const face = new THREE.PointLight(new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.navy), 0.4), FACE_I, 0.15, 2);
  face.position.set(0.03, 0.075, 0.38);
  scene.add(face);
  const amb = ambient();
  amb.intensity *= 0.7;  // 70% of s02's default
  scene.add(amb);

  // DOF on the Student (his body center, along the look direction). The spec's 0.89 m is not where he kneels (0.70 m);
  // aperture 0.015 keeps the wall's blur at 768 · 0.015 · (1.0 − 0.70) ≈ 3.4 px, inside the 4 px limit.
  const look = LOOK.clone().sub(CAM).normalize();
  post({ focus: new THREE.Vector3(0.01, 0.04, BODY_Z).sub(CAM).dot(look), aperture: 0.015, lut: 'night' });

  const v = new THREE.Vector3(), B = new THREE.Vector3(), hitW = new THREE.Vector3();
  const setAt = (obj, x, y) => obj.g.position.set(x, y, PROP_Z);

  return {
    exam, rig, spot, face,  // for evidence/anim-s04/measure.html
    update(t) {
      const T = onTwos(t);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(Math.floor(t * 10)));

      // Student
      rig.blend(P, KEYS, t);
      rig.follow('tail', t);
      if (T >= 5.0 && T < 5.83) rig.joints.tail.rotation.z += 4 * DEG * Math.sin(2 * Math.PI * (T - 5.0) / 0.33);  // happy swish
      rig.face({ eyes: step(t, EYES), mouth: step(t, MOUTH) });
      rig.boil(t, 10);
      rig.group.updateMatrixWorld(true);
      const hand = toPlane(rig.hand.getWorldPosition(v), PROP_Z);

      // Props: in the fridge, in his hand (seen from the camera, behind his fingers), or on the fridge top.
      JARS.forEach((j, i) => {
        const [g0, g1] = HELD[i];
        if (T < g0) setAt(j, ...j.home);
        else if (T < g1) setAt(j, hand.x, hand.y);
        else setAt(j, step(T, j.spots), jarY(j));
      });
      // Jar 3: two turns 2.50–3.17 (0.33 s each) so the blank label faces out.
      JARS[2].g.scale.x = T >= 2.5 && T < 3.17 ? Math.cos(2 * Math.PI * (T - 2.5) / 0.333) : 1;
      const held = T >= CARTON_HELD[0] && T < CARTON_HELD[1];
      if (held) setAt(carton, hand.x, hand.y); else setAt(carton, ...CARTON_HOME);
      // Carton shakes ±10°: it follows the arm's world angle about the shake poses' 40°.
      carton.g.rotation.z = held && T >= 3.67 ? rig.joints.arm_r.rotation.z + rig.joints.body.rotation.z - 40 * DEG : 0;

      // Exam: scoots on 2s, squash 0.2 for one drawing as it lands at 2.33.
      const [bx, bz] = kf(T, BLOB);
      exam.mesh.position.set(bx, SEAT_Y, bz);
      exam.update(t, { squash: T >= 2.33 && T < 2.4 ? 0.2 : 0, wobble: 1, eyes: step(t, BLOB_EYES), look: 1 });
      exam.mesh.updateMatrixWorld();

      // Key aimed along L → blob center to its wall hit. aim() at the blob first, so the shadow frustum's near plane
      // sits in front of it (aimed at a bare wall point, near would be 0.16 m and the blob, 0.08 m away, would not cast).
      B.set(bx, SEAT_Y + exam.radius, bz);
      hitW.copy(B).sub(L).multiplyScalar(L.z / (L.z - B.z)).add(L);
      aim(spot, exam.mesh);
      spot.shadow.camera.near = 0.004;  // README §11: the blob is within 10 cm of L
      spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hitW);
      spot.target.updateMatrixWorld();

      // Window: late-afternoon gold sliding toward evening, from the spec's position (dawnLight places its own).
      dawn.update(t, kf(t, [[0, 0.8], [8, 0.5]]));
      dawn.light.position.set(0.4, 0.6, -1.0);
      dawn.light.intensity = Math.min(dawn.light.intensity, 0.2 * E_KEY);
    },
  };
}
