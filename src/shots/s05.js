// s05 · Game night: a roommate walks through it (docs/shots/s05.md). Animatic blocking on proxies until art is frozen.
// The living room, locked camera. The Student on a floor cushion at frame right holds the phone (the key, README §4)
// and never looks up; the Exam sits on the coffee table 5 cm from it, so its wall shadow is 8.0× by geometry
// (0.40 / 0.05). roommate_round sits inside that shadow on the couch; roommate_tall gets up at 3.0 and walks straight
// through it at z 0.16. What moves: all puppets on 2s (the Student, both roommates, the Exam), the TV flicker on 1s,
// the window ramp at 24, boil 10/s. The camera, the phone and the blob don't move.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, dawnLight, ambient, aim } from '../lights.js';
import { kf, spring, onTwos } from '../core/ease.js';
import { hash, mulberry32, seedOf } from '../core/rng.js';
import { makeGator } from '../characters/gator.js';
import { makeRoommateTall, makeRoommateRound } from '../characters/roommates.js';
import { POSES, specPose, walk } from '../characters/poses.js';
import { makeExam } from '../characters/exam.js';

const DEG = Math.PI / 180;
const F = (s) => Math.round(s * 12) / 12;  // spec times (2.67, 3.33, 4.83 ...) are 2s drawings: snap them to twelfths
const L = [0.075, 0.035, 0.40];            // the phone: key light (spec)
const B = [0.060, 0.030, 0.35];            // blob contact point on the table top (its centre is r = 0.012 above)
const CAM = { pos: [-0.04, 0.17, 1.15], look: [-0.04, 0.10, 0.15] };
const KEY = 0.40;                          // phone spot, cd: a cream wall 0.42 m away lands lit but below white (NoToneMapping)
const TV = 0.36;                           // 25% of the key's irradiance at the wall: 0.25 · 0.40 / 0.42² · 0.80²
const TALL_S = 0.9;                        // roommates_sheet's tall is 0.111 m standing at scale 1; the spec wants head top 0.10
const WALK = { x0: -0.15, x1: 0.30, t0: F(3.33), t1: F(6.33), z: 0.16 };
const STUDENT_HIP_Y = 0.012;               // sits on the cushion, so the head top lands at the spec's 0.06
const lerp01 = (u) => u;

// A path rectangle that fills its canvas has no edge to tear, so it's inset 4% and the size grown to keep [w, h] (as s03).
function torn(w, h) {
  const m = 0.04 * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}
const ellipse = (w, h) => ({ path: Array.from({ length: 24 }, (_, i) => [0.5 + 0.46 * Math.cos(i * Math.PI / 12), 0.5 + 0.46 * Math.sin(i * Math.PI / 12)]), size: [w / 0.92, h / 0.92] });

export async function build({ scene, camera, assets, PALETTE, post }) {
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.set(...CAM.pos);
  camera.lookAt(...CAM.look);

  const tiltOf = (layer) => { const r = mulberry32(seedOf('s02', layer)); return [(2 * r() - 1) * 1.5 * DEG, (2 * r() - 1) * 1.5 * DEG, 0]; };
  const boiling = [];
  // One paper piece. `at` is where the VISIBLE shape's centre goes (`vis` is its uv box inside the padded bitmap),
  // `flat` lays it on the floor/table (normal +y), `tilt` applies s02's seeded tilt, `fit` squeezes it to [w, h].
  // Returns the mesh; mesh.parent is the placed group.
  function piece(layer, opts, { at, flat = false, tilt = false, boil = true, rotZ = 0, vis = [0, 0, 1, 1], parent = scene, fit, ...mat }) {
    const make = (s) => makePaper({ ...opts, key: `s05-${layer}`, seed: s });
    const sheet = make(0), mesh = paperMesh(sheet, mat), [w, h] = sheet.size;
    mesh.position.set((0.5 - (vis[0] + vis[2]) / 2) * w, ((vis[1] + vis[3]) / 2 - 0.5) * h, 0);
    const g = new THREE.Group();
    g.add(mesh);
    g.position.set(...at);
    if (fit) g.scale.set(fit[0] / (w * (vis[2] - vis[0])), fit[1] / (h * (vis[3] - vis[1])), 1);
    if (tilt) g.rotation.set(...tiltOf(layer));
    if (flat) g.rotation.x = -Math.PI / 2;
    g.rotation.z = rotZ;
    parent.add(g);
    if (boil) boiling.push([mesh, make]);
    return mesh;
  }
  const art = (a, name, extra = {}) => ({ opts: { art: a.pieces[name], size: a.sizes[name], ...extra }, vis: a.visible?.[name] });

  // ---- Wall (z 0): apt_wall, cream cardstock x −0.6…0.4, y −0.02…0.32, the shadow's receiver. Its edges are out of frame.
  piece('apt_wall', { ...torn(1.0, 0.34), color: PALETTE.cream, res: 2048 }, { at: [-0.1, 0.15, 0], boil: false }).castShadow = false;
  // Floor (y 0, z 0…0.5): kraft.
  piece('apt_floor', { ...torn(1.0, 0.5), color: PALETTE.kraft, weight: 'kraft', res: 2048 }, { at: [-0.1, 0, 0.25], flat: true, boil: false }).castShadow = false;
  // Window (z 0.002, x 0.15…0.21, y 0.17…0.23): a tissue pane. ponytail: no hole in the wall, so the dusk light is front fill.
  piece('apt_window', { ...torn(0.06, 0.06), color: PALETTE.cream, weight: 'tissue' }, { at: [0.18, 0.20, 0.002] }).castShadow = false;

  // ---- Couch (z 0.02…0.10, x −0.24…0.04, seat top 0.035, back top 0.075): the art as the back, behind the roommates
  // (z 0.05); a kraft seat-cushion strip in front (z 0.10) hides their legs.
  const fur = await assets.load('apt_furniture_sheet');
  { const { opts, vis } = art(fur, 'apt_couch'); piece('apt_couch', opts, { at: [-0.10, 0.0375, 0.05], tilt: true, vis, fit: [0.28, 0.075] }); }
  piece('couch_seat', { ...torn(0.28, 0.035), color: PALETTE.kraft, weight: 'kraft' }, { at: [-0.10, 0.0175, 0.10], tilt: true });
  const tableTop = '#' + new THREE.Color(PALETTE.kraft).lerp(new THREE.Color(PALETTE.navy), 0.5).getHexString();  // the key grazes it at 5°: kraft would burn out
  // ---- Coffee table (x 0…0.14, top y 0.03, z 0.30…0.37): the art as the front fascia, a kraft top.
  { const { opts, vis } = art(fur, 'apt_coffee_table', { weight: 'kraft' }); piece('apt_coffee_table', opts, { at: [0.07, 0.015, 0.37], tilt: true, vis, fit: [0.14, 0.03] }); }
  piece('table_top', { ...torn(0.14, 0.07), color: tableTop, weight: 'kraft' }, { at: [0.07, 0.03, 0.335], flat: true }).castShadow = false;
  // ---- The Student's floor cushion (z 0.405).
  piece('cushion', { ...ellipse(0.06, 0.014), color: PALETTE.kraft, weight: 'kraft' }, { at: [0.12, 0.007, 0.405], tilt: true }).castShadow = false;

  // ---- Roommates. roommate_tall at x −0.15 (feet on the floor when standing), roommate_round at x −0.06: the root is
  // its bottom, so the hidden 3 cm sit behind the seat strip and the head top lands at the spec's 0.08.
  const ctx = { assets };
  const tall = await makeRoommateTall(ctx, { scale: TALL_S, res: 512 });
  const round = await makeRoommateRound(ctx, { res: 512 });
  scene.add(tall.group, round.group);
  round.group.position.set(-0.06, 0.005, 0.09);
  // Controllers (apt_props_sheet) in the near hands; the tall one's goes to the couch arm at 2.67.
  const props = await assets.load('apt_props_sheet');
  const ctrl = (layer, name, parent, at = [0, 0, 0]) => {
    const { opts, vis } = art(props, name);
    const m = piece(layer, opts, { at, vis, parent });
    m.castShadow = false;
    return m.parent;
  };
  ctrl('ctrl_round', 'controller_1', round.hand);
  const tallCtrlHand = ctrl('ctrl_tall_hand', 'controller_2', tall.hand);
  const tallCtrlCouch = ctrl('ctrl_tall_couch', 'controller_2', scene, [-0.20, 0.038, 0.098]);

  // ---- The Student (side rig, mirrored to face frame-left), on the cushion, body plane z 0.405. The hand is placed so the
  // fingertip lands on the phone at L: the phone is in his hand.
  const gator = await makeGator(ctx, { res: 1024 });
  gator.group.scale.x = -1;
  scene.add(gator.group);
  const HUNCH = { lean: 24, arm: 2, far: -40, head: -10, leg: 60, farLeg: 54 };
  const studentPose = (flick) => specPose({ ...HUNCH, arm: HUNCH.arm + flick });
  gator.pose(studentPose(0));
  gator.group.position.set(0, STUDENT_HIP_Y, 0.405);
  gator.group.updateMatrixWorld(true);
  const tip = gator.hand.getWorldPosition(new THREE.Vector3());
  gator.group.position.x = L[0] - tip.x;
  const STUDENT_POSE = { flat: studentPose(0), flick: studentPose(2) };

  // The phone: an upright card at L just behind the near arm, with a cyan screen on its face. Nothing on it casts.
  const study = await assets.load('study_props_sheet');
  { const { opts, vis } = art(study, 'phone_face'); piece('phone', opts, { at: [L[0], L[1], L[2] + 0.002], vis, rotZ: 80 * DEG, boil: false }).castShadow = false; }
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0058), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
  screen.rotation.z = 80 * DEG; screen.position.set(L[0], L[1], L[2] + 0.0035);
  scene.add(screen);

  // ---- The Exam on the coffee table.
  const exam = makeExam({ shot: 's05', seed: 1 });
  scene.add(exam.mesh, exam.stain);
  exam.mesh.position.set(...B);
  exam.stain.position.set(B[0], B[1] + 0.0003, B[2]);

  // ---- Light. Key: the phone spot (angle 1.0, penumbra 0.4), at L, aimed along L → blob to its wall hit (README §4).
  // Student face fill: unshadowed cyan point at the phone, distance 0.06. TV fill (spec): a flickering cream-cyan spot
  // from the camera side, 25% of the key at the wall. §10 character fills for the roommates: short-reach points in front of
  // them, no shadow, so they reach the roommates and not the wall. Window: s04's dusk-to-night ramp, front fill here.
  const spot = phoneLight({ angle: 1.0, penumbra: 0.4, distance: 0.8, intensity: KEY });
  spot.position.set(...L);
  const C = new THREE.Vector3(B[0], B[1] + exam.radius, B[2]), P = new THREE.Vector3(...L);
  aim(spot, new THREE.Vector3().subVectors(C, P).multiplyScalar(-P.z / (C.z - P.z)).add(P));  // wall hit (−0.045, 0.091, 0)
  const face = new THREE.PointLight(PALETTE.phone, 0.03, 0.06, 2);
  face.position.set(L[0] - 0.006, L[1] + 0.006, L[2] + 0.01);
  const tvColor = new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.cream), 0.6);
  const tv = phoneLight({ color: tvColor, angle: 0.5, penumbra: 0.5, distance: 2, intensity: TV });
  tv.position.set(-0.04, 0.06, 0.80);
  aim(tv, new THREE.Vector3(-0.08, 0.05, 0.09));
  const stFill = new THREE.PointLight(PALETTE.phone, 0.03, 0.2, 2);    // §10: the Student's body, 9.5 cm in front of him; the wall is 0.5 m away
  stFill.position.set(0.10, 0.09, 0.50);
  const coFill = new THREE.PointLight(PALETTE.phone, 0.05, 0.17, 2);   // seated pair
  coFill.position.set(-0.10, 0.12, 0.20);
  const wlFill = new THREE.PointLight(PALETTE.phone, 0.05, 0.17, 2);   // follows the walker
  const dawn = dawnLight();
  dawn.light.target.position.set(0.0, 0.05, 0.1);
  dawn.light.castShadow = false;
  const amb = ambient();
  amb.intensity *= 0.55;
  scene.add(spot, spot.target, face, stFill, tv, tv.target, coFill, wlFill, dawn.light, dawn.light.target, amb);

  const fx = post({ focus: 0.95, aperture: 0.012, lut: 'night' });

  return {
    parts: { exam, spot, tv, dawn, gator, tall, round },  // read by evidence/anim-s05/measure.html only
    update(tLocal) {
      const T = onTwos(tLocal);

      // Paper boils at 10/s.
      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));
      for (const r of [gator, tall, round]) r.boil(tLocal, 10);

      // ---- The Student: hunched over the phone the whole shot. Thumb flick (+2°) for one drawing every 0.5 s from 0.33.
      const flick = Array.from({ length: 16 }, (_, i) => F(0.33 + 0.5 * i)).some((f) => Math.abs(T - f) < 1e-6);
      gator.pose(flick ? STUDENT_POSE.flick : STUDENT_POSE.flat);
      gator.follow('tail', tLocal, { k: 6, w: 18 });
      gator.face({ eyes: 'tired', mouth: T >= F(4.5) && T < F(4.83) ? 'smile' : 'neutral' });

      // ---- roommate_round: mashes (arms alternate every 0.25 s), 4.83 dip, 5.00 wins, back to mashing at 6.00.
      const mash = Math.floor((T + 1e-6) / 0.25) % 2 ? 'b' : 'a';
      let rp = `round_mash_${mash}`, rf = { eyes: 'open', mouth: 'line' };
      if (T >= F(4.83) && T < F(5.0)) rp = 'round_cheer_antic';
      else if (T >= F(5.0) && T < F(5.67)) { rp = 'round_cheer60'; rf = { eyes: 'closed', mouth: 'smile' }; }
      else if (T >= F(5.67) && T < F(6.0)) rp = 'round_cheer_antic';
      round.blend({ ...POSES, round_cheer60: { arm_r: 60 * DEG, arm_l: 60 * DEG } }, [[0, rp], [1, rp]], tLocal);
      round.face(rf);

      // ---- roommate_tall: mashes to 2.67, controller to the couch arm and a 12° lean to 3.0, stands and steps to z 0.16 by
      // 3.33, then walks frame-right 3.33–6.33 (one step per 0.33 s, 2 mm bob), eyes and mouth unchanged through the shadow.
      let x = WALK.x0, y = 0.027 * TALL_S, z = 0.09, keys, handCtrl = false;
      if (T < F(2.67)) { const p = `tall_mash_${mash}`; keys = [[0, p], [1, p]]; handCtrl = true; }
      else if (T < F(3.0)) keys = [[0, 'tall_lean'], [1, 'tall_lean']];
      else if (T < WALK.t0) { keys = [[0, 'tall_stand'], [1, 'tall_stand']]; z = kf(T, [[F(3.0), 0.09], [WALK.t0, WALK.z]], lerp01); }
      else {
        const w = walk(T, { set: 'tall', step: 1 / 3, t0: WALK.t0, rise: 0.0015 });
        keys = w.keys; y += w.lift; z = WALK.z;
        x = kf(T, [[WALK.t0, WALK.x0], [WALK.t1, WALK.x1]], lerp01);
      }
      tall.blend(POSES, keys, tLocal);
      tall.face(T < F(2.67) ? { eyes: 'open', mouth: 'line' } : { eyes: 'open', mouth: 'neutral' });
      tall.group.position.set(x, y, z);
      tall.group.visible = T <= WALK.t1;
      tallCtrlHand.visible = handCtrl;
      tallCtrlCouch.visible = !handCtrl;

      // ---- The Exam: eyes up toward the roommates and the TV (side, −x), track the walker (flip as he passes at 4.5),
      // 5.00 squash, 5.08 hop (4 mm up), 5.17 lands and settles on a spring, 5.50 eyes open on the Student.
      let eyes = 'side', look = -1;
      if (T >= F(3.33)) look = T < F(4.5) ? -1 : 1;
      if (T >= F(5.5)) eyes = 'open';
      const at = (t) => Math.abs(T - F(t)) < 1e-6;
      const squash = at(5.0) ? 0.25 : at(5.08) ? 0 : 0.2 * spring(T, F(5.17));
      exam.mesh.position.y = B[1] + (at(5.08) ? 0.004 : 0);
      exam.update(tLocal, { squash, wobble: 1, eyes, look, key: spot });

      // ---- Light. The key is steady (the phone doesn't move); the TV flickers on 1s (4 Hz); the window ramps at 24.
      tv.intensity = TV * (0.85 + 0.15 * hash(Math.floor(tLocal * 4)));
      wlFill.position.set(x, 0.13, 0.30);
      wlFill.visible = T >= WALK.t0 && T <= WALK.t1;
      dawn.update(tLocal, kf(tLocal, [[0, 0.3], [8, 0.0]], lerp01));
      dawn.light.position.set(0.8, 0.6, 0.6);
      dawn.light.intensity *= 0.3;
    },
  };
}
