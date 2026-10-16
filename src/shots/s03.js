// s03 · The laptop: the shadow climbs (docs/shots/s03.md, G4). v2 on the real-scale home desk (s02.js's unit).
// He shrugs off the blob's look, opens his laptop and plays. The screen is a low, close light (README §4: a spot at
// the screen centre, aimed screen → blob → wall), so the blob's shadow climbs the wall at 3× (S = screenZ / (screenZ −
// B.z) = 0.0225 / 0.0075) the moment the screen wakes, and swells to 3.75 units on gulp 1 (4.5), the first meter step.
// Characters on 2s, light on 1s, boil 10/s.
import * as THREE from 'three';
import { phoneLight, dawnLight, ambient, aim } from '../lights.js';
import { kf, ease, onTwos } from '../core/ease.js';
import { hash2 } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator } from '../characters/gator.js';
import { specPose } from '../characters/poses.js';
import { DESK, B, tools, homeDesk, seatReach } from './s02.js';

const ID = 's03', DEG = Math.PI / 180;
const BLOB_R = { start: 0.012, gulp1: 0.015 };            // METER.birth → METER.gulp1 (README §1)
const CAM = { pos: [0.055, 0.075, 0.40], look: [0.055, 0.047, 0.012] };   // v3: pulled back and right so the bigger shadow fits
const FOCUS = [[2.0, 0.385], [3.0, 0.40]];                 // blob → wall over 2–3, eased, on 1s
const SCREEN_Z = 0.0195;                                   // v3: the screen sits 3 mm closer than s02's unit, so S = 0.0195 / 0.0045 = 4.33 (was 3.0): 5.4 units at 1.25×
const SPOT_I = 0.022, FILL_K = 0.15, SUN_K = 0.35, SUN_SCALE = 0.8 * 0.03, SUN_SCALE_OFF = 0.8 * 0.3;   // v3: after the wake the window drops from 30% to 3% so the shadow goes dark, not pink
const AMB_K = 0.2, AMB_K_OFF = 0.55;                                        // v3: ambient trimmed so the shadow is the darkest thing on the wall
const BREATHE = 0.7 * DEG;                                  // v3 secondary motion: his back rises on a 2.8 s breath (a function of t, on 2s)
const FLICK = 0.05;                                        // ±5% game flicker per 2s drawing
const FACE_I = 0.012;                                      // character fill (README §10): cyan-navy, no shadow, dies before the wall
const F = (n) => n / 12, fr = (t) => Math.floor(t * 12 + 1e-6);
const TAPS = [2.33, 2.67, 3.17, 3.5, 4.0, 4.67, 5.17, 5.67].map((s) => Math.round(s * 12));

export async function build(ctx) {
  const { scene, camera, PALETTE, post } = ctx;
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.set(...CAM.pos);
  camera.lookAt(...CAM.look);
  const T = tools(ctx, ID);
  const set = await homeDesk(ctx, T);
  set.laptop.position.z += SCREEN_Z - DESK.screenZ;
  const fx = post({ focus: FOCUS[0][1], aperture: 0.01, lut: 'dawn' });

  // ---- the Student and his hand targets (solved through this camera) ----
  const gator = await makeGator(ctx, { seed: 2 });
  gator.group.position.set(...DESK.hip);
  scene.add(gator.group);
  const cam = new THREE.Vector3(...CAM.pos), wp = (o, x, y, z) => { set.laptop.updateMatrixWorld(true); return o.localToWorld(new THREE.Vector3(x, y, z)); };
  set.setLid(0);
  const lidEdge = (deg) => { set.setLid(deg); const p = wp(set.lid.g, 0, set.lid.size[1], 0); set.setLid(0); return p; };
  const keys = wp(set.laptop, 0, 0.0008, 0.002);
  const seat = (o) => specPose({ leg: 60, farLeg: 54, far: -40, ...o });
  const at = (p, range, o = {}) => { const r = seatReach(cam, p, range); return seat({ lean: r.lean, arm: r.arm, ...o }); };
  // [drawing, pose, shoulder drop (m)]. 0–0.17 anticipation, 0.17–0.33 the shrug, 0.42 back, 0.50 hand on the lid's
  // front edge, 0.67 / 0.83 the lid at 30° / 60°, 1.00 hands on the keys (laptopUp), 2.00 settled into the hunch.
  const P = {
    slump: seat({ lean: 10, arm: 35, head: -8 }),
    antic: seat({ lean: 10, arm: 35, head: -11 }),
    shrug: seat({ lean: 8, arm: 55, far: -20, head: 6 }),
    back: seat({ lean: 10, arm: 35, head: -10 }),
    lid0: at(lidEdge(0), [6, 30], { head: -10 }),
    lid30: at(lidEdge(30), [6, 30], { head: -8 }),
    lid60: at(lidEdge(60), [6, 30], { head: -8 }),
    keys: at(keys, [18, 30], { head: -10 }),
    hunch: at(keys, [22, 34], { head: -14 }),
  };
  P.tap = { ...P.hunch, arm_r: P.hunch.arm_r + 2 * DEG };
  const KEYS = [[0, 'slump'], [F(2), 'antic'], [F(4), 'shrug'], [F(5), 'back'], [F(6), 'lid0'], [F(8), 'lid30'], [F(10), 'lid60'],
    [F(12), 'keys'], [F(24), 'hunch'], ...TAPS.flatMap((n) => [[F(n - 1), 'hunch'], [F(n), 'tap'], [F(n + 1), 'hunch']]), [6, 'hunch']];

  // ---- the Exam at B ----
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh, exam.stain);
  exam.mesh.position.fromArray(B);
  exam.stain.position.set(B[0], 0.0003, B[2]);

  // ---- light. Key: the laptop screen (README §4). Fill: the window at 30%, ambient, a cyan face fill at the screen.
  const L = set.screenCentre();
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 0.6, intensity: 0 });
  spot.position.copy(L);
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);
  fill.position.copy(L).add(new THREE.Vector3(-0.004, 0.004, 0));
  const sun = dawnLight();
  sun.light.target.position.set(0.01, 0.03, 0.01);
  Object.assign(sun.light.shadow.camera, { left: -0.15, right: 0.15, top: 0.15, bottom: -0.15 });
  sun.light.shadow.camera.updateProjectionMatrix();
  sun.update(0, SUN_K);
  sun.light.position.set(0.8, 0.6, 0.6);
  const sunI = sun.light.intensity;
  const face = new THREE.PointLight(new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.navy), 0.4), 0, 0.07, 2);
  face.position.set(-0.025, 0.035, 0.065);
  scene.add(face);
  const amb = ambient();
  const ambI = amb.intensity;
  scene.add(spot, spot.target, fill, sun.light, sun.light.target, amb);

  const C = new THREE.Vector3(), hit = new THREE.Vector3();
  return {
    exam, gator, spot,
    update(t) {
      T.boil(t);
      const f = fr(t);

      // The Student.
      gator.boil(t, 10);
      gator.blend(P, KEYS, t);
      gator.joints.body.rotation.z += BREATHE * Math.sin(2 * Math.PI * onTwos(t) / 2.8);
      gator.follow('tail', t, { k: 6, w: 18 });
      gator.group.position.y = DESK.hip[1] + (f >= 2 && f < 4 ? -0.0015 : 0);
      const eyes = f < 2 ? 'side' : f < 5 ? 'closed' : 'tired';
      const mouth = f < 24 ? 'line' : f >= 42 && f < 46 ? 'smile' : 'neutral';
      gator.face({ eyes, mouth });

      // The laptop: lid 30° at 0.67, 60° at 0.83, 110° on laptopUp (1.00), the screen awake on that frame.
      set.setLid(f < 8 ? 0 : f < 10 ? 30 : f < 12 ? 60 : 110);
      const on = t >= 1.0 - 1e-6;
      set.glow.visible = on;
      sun.light.intensity = sunI * (on ? SUN_SCALE : SUN_SCALE_OFF);   // before the wake the window is the room; after it the screen is
      amb.intensity = ambI * (on ? AMB_K : AMB_K_OFF);

      // The Exam: open on him; side toward the screen at 1.08; up-right at its shadow at 3.0; back to him at 4.33.
      // Gulp 1 (4.5): squash 0.3 eyes closed on 4.417, snap to 1.25× stretched on 4.5, settled by 4.75.
      let eyesB = 'open', look = 1, squash = 0;
      if (f >= 13 && f < 52) { eyesB = 'side'; look = f < 36 ? -1 : 1; }
      if (f === 53) { squash = 0.3; eyesB = 'closed'; }
      const grown = f >= 54;
      if (f >= 54 && f < 57) squash = -0.2 * Math.exp(-6 * (F(f) - 4.5)) * Math.cos(18 * (F(f) - 4.5));   // settles by 4.75
      const r = grown ? BLOB_R.gulp1 : BLOB_R.start;
      exam.mesh.scale.setScalar(r / BLOB_R.start);
      exam.update(t, { squash, wobble: f >= 54 && f < 66 ? 0.8 : 1, eyes: eyesB, look, key: on ? spot : sun.light });

      // Key on 1s: 0 before 1.00, full from that frame, ±5% flicker per drawing. Aimed screen → blob centre → wall.
      const flick = 1 + FLICK * (2 * hash2(1303, f) - 1);
      spot.intensity = on ? SPOT_I * flick : 0;
      fill.intensity = FILL_K * spot.intensity;
      face.intensity = on ? FACE_I : 0;
      C.set(B[0], r, B[2]);
      hit.subVectors(C, L).multiplyScalar(-L.z / (C.z - L.z)).add(L);
      aim(spot, exam.mesh);
      spot.shadow.camera.near = 0.002;
      spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hit);
      spot.target.updateMatrixWorld();

      fx.set({ focus: kf(t, FOCUS, ease) });
    },
  };
}
