// s07 · Blackout curtains (docs/shots/s07.md). Animatic blocking on proxies until art is frozen.
// One locked frame, a time-lapse: four stations, each opened by a single-frame pose pop, then pose to pose on 2s.
// Keys switch on beats (README §5): moonlight through the window (dawnLight, k 0) → black at curtainsDone (8.0) →
// the phone at 8.5, whose spot sits 2 cm in front of the blob and throws it 20× (0.40 / 0.02) over wall, floor and
// ceiling. The montage keeps the blob out of the moon patch, so its first readable shadow is the peak.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, dawnLight, ambient, aim } from '../lights.js';
import { kf, ease, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { POSES, specPose } from '../characters/poses.js';
import { makeExam } from '../characters/exam.js';

const DEG = Math.PI / 180;
const F = (s) => Math.round(s * 12) / 12;  // spec times (0.17, 0.33 ...) are 2s drawings: snap them to twelfths
const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
const L = [0, 0.004, 0.40];                 // the phone light
const B = [-0.005, 0, 0.38];                // the blob's contact point; its centre is r above (the spec's y 0.012)
const CAM = { pos: [-0.06, 0.14, 1.30], look: [-0.06, 0.14, 0.20] };
const WIN = { x0: -0.20, x1: -0.10, y0: 0.12, y1: 0.24 };
const MOON_X = [0.30, 0.25, 0.20, 0.15];    // per station: time passing
const LADDER_X = [-0.23, -0.07, -0.15, -0.15];
const AMB = 0.8;                            // ambient()'s own intensity, which s02 uses as is
// ponytail: intensities tuned by eye for the animatic (absolute values wait on mod-lights calibration).
const SPOT = 0.4;
// The face fill as a fraction of the spot. README §4 says 15–30%, but three clamps 1/d² at d = 0.1 m, so a fill 3 cm
// from his face (100/m²) out-lights the spot on the wall 0.42 m away (5.7/m²) per candela, and at 15% his face
// measured 218% of the lit wall. Set instead to README §10's 30–45% of the key-lit wall: no fill measures 29%, this 40%.
const FACE_FILL = 0.0015;
// Ambient through the black (8.0–8.5), as a fraction of s02's: the night grade alone floors black at 4.3% mean luma.
const BLACK = 0.01;

// A path rectangle that fills its canvas has no edge to tear, so it's inset 4% and the size grown to keep [w, h] (as s01).
function torn(w, h) {
  const m = 0.04 * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}

// ---- The Student, one drawing at a time (T on twos). Standing poses in the s15 convention; the named s07 poses
// from poses.js where they exist. → { pose, st (station 0–4), eyes, mouth }
const up = (o) => specPose({ leg: 0, farLeg: 8, ...o });
const RAISE = up({ lean: 0, arm: 61, far: 56, head: 20 });       // drill up at the bracket, before the anticipation
const HOLD_ROD = up({ lean: 0, arm: 70, far: 70, head: 12 });    // station 3 pop: rod and panels in raised hands
const REACH = up({ lean: 0, arm: 25, far: 15 });                 // station 4 pop: a hand on the panel's edge
function act(T) {
  const wig = Math.round(T * 12) % 2 ? POSES.drill_b : POSES.drill_a;   // ±1° jitter, alternating every drawing
  if (T < 2) {
    const pose = T < F(0.17) ? RAISE : T < F(0.33) ? POSES.drill_a : T < F(1.67) ? wig : T < F(1.83) ? POSES.drill_a : POSES.blow;
    return { st: 0, pose, eyes: T >= F(0.33) && T < F(1.67) ? 'closed' : 'open', mouth: T < F(1.83) ? 'line' : 'o' };
  }
  if (T < 4) {
    const pose = T < F(2.17) ? RAISE : T < F(3.5) ? wig : T < F(3.67) ? POSES.drill_a : RAISE;
    return { st: 1, pose, eyes: 'closed', mouth: T < F(3.67) ? 'line' : 'smile' };
  }
  if (T < 6) {
    const pose = T < F(4.17) ? HOLD_ROD : T < F(4.5) ? POSES.crouch : T < F(5.17) ? POSES.lift_rod
      : T < F(5.42) ? POSES.tug : T < F(5.5) ? POSES.lift_rod : T < F(5.83) ? POSES.tug : POSES.stand;
    return { st: 2, pose, eyes: 'open', mouth: 'smile' };
  }
  if (T < 8.5) {  // the left panel facing −x (6.0–7.0), the right facing +x (7.0–), then step back and nod
    const s = T < 7 ? T - 6 : T - 7, end = T < 7 ? F(0.83) : F(0.67);
    let pose = s < F(0.17) ? REACH : s < end ? POSES.pull_curtain : POSES.stand;
    if (T >= F(7.83) && T < 8) pose = POSES.nod;
    return { st: 3, pose, eyes: 'open', mouth: T >= F(7.83) ? 'smile' : 'neutral' };
  }
  const flick = Math.abs(T - 9) < 1e-6 || Math.abs(T - 9.5) < 1e-6;
  return { st: 4, pose: flick ? POSES.prone_flick : POSES.prone, eyes: 'tired', mouth: 'neutral' };
}
// Where the root goes: [hip x, floor y under the feet, body plane z, facing (+1 = +x)].
function place(T, st) {
  if (st === 0) return [LADDER_X[0] - 0.02, 0.18, 0.048, 1];      // hand at the left bracket, feet on the top step
  if (st === 1) return [LADDER_X[1] + 0.02, 0.18, 0.048, -1];     // mirrored at the right bracket
  if (st === 2) return [-0.165, 0.18, 0.048, 1];                  // hands at the rod's middle
  if (st === 3) return [-0.15, 0, T >= F(7.67) ? 0.07 : 0.06, T < 7 ? -1 : 1];   // 7.67: one step back from the window
  return [0.075, 0, 0.405, -1];                                   // prone, head x ≈ 0.03, feet ≈ 0.11, facing frame-left
}
// The Exam's eyes as time passes: [eyes, look].
function examEyes(T) {
  if (T < 2) return ['open', 1];
  if (T < 4) return ['side', -1];
  if (T < 8.5) return ['tired', 1];
  if (T < 9) return ['open', 1];
  if (T < 9.5) return ['side', -1];   // up-left at its own shadow, s03's glance mirrored
  return ['worried', 1];
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (k) => new THREE.Color(PALETTE[k]);
  scene.background = col('navy');
  camera.position.set(...CAM.pos);
  camera.lookAt(...CAM.look);

  const tiltOf = (layer) => { const r = mulberry32(seedOf('s07', layer)); return [(2 * r() - 1) * 1.5 * DEG, (2 * r() - 1) * 1.5 * DEG, 0]; };
  const boiling = [];  // [mesh, seed => PaperSheet]
  // One paper piece in its own group. `at` is where the VISIBLE shape's centre goes (asset bitmaps are padded; `vis` is
  // the shape's uv box), `flat` lays it on the floor (normal +y), `ceil` hangs it from the ceiling (normal −y).
  function piece(layer, opts, { at, flat = false, ceil = false, tilt = false, boil = true, vis = [0, 0, 1, 1], parent = scene, cast = true, ...mat }) {
    const make = (s) => makePaper({ ...opts, key: `s07-${layer}`, seed: s });
    const sheet = make(0), mesh = paperMesh(sheet, mat), [w, h] = sheet.size;
    mesh.position.set((0.5 - (vis[0] + vis[2]) / 2) * w, ((vis[1] + vis[3]) / 2 - 0.5) * h, 0);
    mesh.castShadow = cast;
    const g = new THREE.Group();
    g.add(mesh);
    g.position.set(...at);
    if (tilt) g.rotation.set(...tiltOf(layer));
    if (flat) g.rotation.x = -Math.PI / 2;
    if (ceil) g.rotation.x = Math.PI / 2;
    parent.add(g);
    if (boil) boiling.push([mesh, make]);
    return mesh;
  }
  // A loaded piece scaled so its visible shape is `h` tall (or `w` wide): → { opts, vis, size: visible [w, h] }.
  const art = (a, name, { h, w, ...extra } = {}) => {
    const vis = a.visible[name], s = a.sizes[name], vw = s[0] * (vis[2] - vis[0]), vh = s[1] * (vis[3] - vis[1]);
    const k = h ? h / vh : w ? w / vw : 1;
    return { opts: { art: a.pieces[name], size: s.map((v) => v * k), ...extra }, vis, size: [vw * k, vh * k] };
  };

  // ---- Wall (z 0): apt_wall, cream cardstock, x −0.6…0.4, y −0.02…0.32 (2 cm over the ceiling seam, so the seam
  // never shows a torn gap). It doesn't cast: the hidden blocker below does the wall's job for the moon, with a
  // window-exact hole. A torn hole in a 1 m sheet wobbles by several mm, and the curtain seams are 1–3 mm.
  piece('apt_wall', { ...torn(1.0, 0.34), color: PALETTE.cream, res: 2048 }, { at: [-0.1, 0.15, 0], boil: false, cast: false });
  {
    const block = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    for (const [x0, x1, y0, y1] of [[-2, WIN.x0, -1, 2], [WIN.x1, 2, -1, 2], [WIN.x0, WIN.x1, WIN.y1, 2], [WIN.x0, WIN.x1, -1, WIN.y0]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), block);
      m.position.set((x0 + x1) / 2, (y0 + y1) / 2, -0.004);
      m.castShadow = true;
      scene.add(m);
    }
  }
  // Floor (y 0, kraft) and ceiling (y 0.30, flat Night Navy). Both receive the phone shadow's runs; neither casts.
  // The floor runs to z 0.62, not 0.5: the frame's bottom edge meets y 0 at z 0.506.
  piece('apt_floor', { ...torn(1.0, 0.62), color: PALETTE.kraft, weight: 'kraft', res: 2048 }, { at: [-0.1, 0, 0.31], flat: true, boil: false, cast: false });
  piece('apt_ceiling', { ...torn(1.0, 0.46), color: PALETTE.navy, res: 1024 }, { at: [-0.1, 0.30, 0.22], ceil: true, boil: false, cast: false });

  // ---- Window (z 0.002): apt_window, a tissue pane over the window, lit from behind through the blocker's hole, and
  // a scissor-cut navy cross (s01's mullions), so the floor patch reads as a window.
  piece('apt_window', { ...torn(0.10, 0.12), color: PALETTE.cream, weight: 'tissue', res: 512 },
    { at: [(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, 0.002], cast: false, translucency: 0.8 });
  piece('mullion-v', { path: RECT, color: PALETTE.navy, size: [0.004, 0.12], res: 256 }, { at: [-0.15, 0.18, 0.003], boil: false });
  piece('mullion-h', { path: RECT, color: PALETTE.navy, size: [0.10, 0.004], res: 256 }, { at: [-0.15, 0.18, 0.003], boil: false });

  // ---- blackout_curtains (README §7): opaque Night Navy cardstock. Brackets (z 0.007) at x −0.23 and −0.07, a rod
  // (z 0.008, y 0.26, x −0.24…−0.06), two 0.047 × 0.15 panels (z 0.006) hanging from it. All scissor-cut (straight
  // edges): a torn edge wanders ±1 mm, which would open and shut the 1 mm centre seam on every boil.
  const brackets = [-0.23, -0.07].map((x, i) => piece(`bracket${i}`, { path: RECT, color: PALETTE.navy, size: [0.005, 0.012], res: 128 },
    { at: [x, 0.258, 0.007], boil: false }));
  const rod = new THREE.Group();
  scene.add(rod);
  piece('rod', { path: RECT, color: PALETTE.navy, size: [0.18, 0.004], res: 512 }, { at: [0, 0, 0], parent: rod, boil: false });
  const PANEL = [0.047, 0.15];
  const panels = ['l', 'r'].map((s) => {
    const g = new THREE.Group();
    rod.add(g);
    piece(`panel-${s}`, { path: RECT, color: PALETTE.navy, size: PANEL, res: 512 }, { at: [0, -PANEL[1] / 2, -0.002], parent: g, boil: false });
    return g;
  });
  // Rod-local edges [left, right] open (bunched at the ends) and closed (3 mm side seams, 1 mm centre seam).
  const OPEN = [[-0.09, -0.07], [0.07, 0.09]], SHUT = [[-0.047, -0.0005], [0.0005, 0.047]];
  const setPanel = (g, i, p, crooked) => {
    const [a, b] = [0, 1].map((j) => OPEN[i][j] + (SHUT[i][j] - OPEN[i][j]) * p);
    g.position.x = (a + b) / 2;
    g.scale.x = (b - a) / PANEL[0];
    g.rotation.z = crooked;
  };

  // ---- Ladder (kraft, z 0.04): 0.20 tall, rungs at y 0.04 / 0.08 / 0.12 / 0.16, top step 0.18. The proxy is a
  // plain rectangle, so it's drawn as rails and rungs here; real art is scaled to 0.20 tall.
  const props = await assets.load('apt_props_sheet');
  let ladder;
  if (props.proxy) {
    const W = 0.04, H = 0.20, px = 2000, m = 0.004, cv = Object.assign(document.createElement('canvas'), { width: Math.round((W + 2 * m) * px), height: Math.round((H + 2 * m) * px) });
    const g = cv.getContext('2d'), X = (x) => (x + m) * px, Y = (y) => (H - y + m) * px;
    g.fillStyle = PALETTE.kraft;
    for (const x of [0, W - 0.007]) g.fillRect(X(x), Y(H), 0.007 * px, H * px);
    for (const y of [0.04, 0.08, 0.12, 0.16]) g.fillRect(X(0), Y(y + 0.0025), W * px, 0.005 * px);
    g.fillRect(X(-0.002), Y(0.18 + 0.004), (W + 0.004) * px, 0.006 * px);   // the top step, a little proud of the rails
    ladder = piece('ladder', { art: cv, size: [W + 2 * m, H + 2 * m], weight: 'kraft', res: 1024 }, { at: [0, 0.10, 0.04], tilt: true });
  } else {
    const { opts, vis } = art(props, 'ladder', { h: 0.20, weight: 'kraft' });
    ladder = piece('ladder', opts, { at: [0, 0.10, 0.04], tilt: true, vis });
  }
  // Drill: one in his hand (stations 1–2), one standing on the floor at (−0.08, 0, 0.10) from 3.67.
  const drill = art(props, 'drill', { w: 0.02 });
  const drillFloor = piece('drill-floor', drill.opts, { at: [-0.08, drill.size[1] / 2, 0.10], vis: drill.vis, tilt: true });

  // ---- Bed (apt_furniture_sheet, set dressing frame-right; he uses it in s08): mattress x 0.13…0.36 top y 0.034,
  // pillow x 0.165…0.21 top y 0.045, tissue blanket over the foot end. Upright cutouts between z 0.30 and 0.345.
  const fur = await assets.load('apt_furniture_sheet');
  {
    const m = art(fur, 'apt_bed_mattress', { w: 0.23 });
    piece('mattress', { ...m.opts, size: [m.opts.size[0], m.opts.size[1] * 0.034 / m.size[1]] }, { at: [0.245, 0.017, 0.33], vis: m.vis });
    const p = art(fur, 'apt_bed_pillow', { w: 0.045 });
    piece('pillow', p.opts, { at: [0.1875, 0.045 - p.size[1] / 2, 0.30], vis: p.vis, tilt: true });
    const b = art(fur, 'apt_bed_blanket', { w: 0.15, weight: 'tissue' });
    piece('blanket', b.opts, { at: [0.29, 0.046 - b.size[1] / 2, 0.345], vis: b.vis, tilt: true });
  }

  // ---- Phone (study_props_sheet): lying face-up on the floor at L from the 8.5 pop. Cyan screen on its face; nothing on
  // it casts, since the light sits inside it.
  const sp = await assets.load('study_props_sheet');
  const phone = new THREE.Group();
  phone.position.set(L[0], 0.0008, L[2]);
  scene.add(phone);
  {
    const { opts, vis } = art(sp, 'phone_face');
    piece('phone_face', opts, { at: [0, 0, 0], flat: true, vis, parent: phone, cast: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0058), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
    screen.rotation.x = -Math.PI / 2; screen.position.y = 0.0003;
    phone.add(screen);
  }

  // ---- The Student: the legged side rig; root at the hip.
  const gator = await makeGator({ assets }, { seed: 7 });
  scene.add(gator.group);
  const drillHand = piece('drill-hand', drill.opts, { at: [0.006, -0.004, 0.001], vis: drill.vis, parent: gator.hand });
  const POSE = {}, KEYS = [];
  for (let i = 0; i <= 120; i++) { POSE[i] = act(i / 12).pose; KEYS.push([i / 12, String(i)]); }

  // ---- The Exam at B, r 0.012, its stain under it. Wobble 1 all shot.
  const exam = makeExam({ shot: 's07', seed: 1 });
  exam.mesh.position.set(...B);
  exam.stain.position.set(B[0], 0.0003, B[2]);
  scene.add(exam.mesh, exam.stain);

  // ---- Light.
  // Moon (0–8): dawnLight at k 0 behind the wall at (x_m, 0.8, −1.0), aimed at the window centre. It drops to 5% on
  // the 8.0 frame (the seams' hairlines), as s08 picks it up.
  const moon = dawnLight();
  moon.light.target.position.set(-0.15, 0.18, 0);
  scene.add(moon.light, moon.light.target);
  // Phone (8.5–): the spot at L, aimed along L → blob centre to its wall hit, and the unshadowed cyan face fill.
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 1.0, intensity: 0 });
  spot.position.set(...L);
  scene.add(spot, spot.target);
  const P = new THREE.Vector3(...L), C = new THREE.Vector3(B[0], B[1] + exam.radius, B[2]);
  aim(spot, C.clone().sub(P).multiplyScalar(-P.z / (C.z - P.z)).add(P));   // the 20× centre, (−0.100, 0.164, 0)
  // The fill sits 2.5 cm toward camera from the phone: at the phone itself it would be behind his planes (z 0.405+)
  // and light only their back rims.
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);
  fill.position.set(L[0] + 0.012, L[1] + 0.010, L[2] + 0.025);
  const amb = ambient();
  scene.add(fill, amb);

  const fx = post({ focus: 1.25, lut: 'night' });
  const hand = new THREE.Vector3();

  return {
    parts: { exam, spot, moon, gator, fill, amb },  // read by evidence/anim-s07/measure.html only
    update(tLocal) {
      const T = onTwos(tLocal), a = act(T), [hx, fy, hz, face] = place(T, a.st);

      // Paper boils at 10/s; the Student on 2s.
      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));
      gator.boil(tLocal, 10);
      gator.blend(POSE, KEYS, tLocal);
      gator.face({ eyes: a.eyes, mouth: a.mouth });
      gator.group.position.set(hx, fy + hipHeight(a.pose), hz);
      gator.group.scale.x = face;
      drillHand.parent.visible = T < F(3.67);
      drillHand.parent.rotation.z = -(gator.joints.body.rotation.z + gator.joints.arm_r.rotation.z);  // held level, nose forward
      drillFloor.parent.visible = T >= F(3.67);

      // Props: the ladder pops per station; brackets go on at the 2.0 pop and 3.67; the rod rides his hands from the
      // 4.0 pop until it snaps onto the brackets at 4.83; panels hang crooked until each tug, then close on his pulls.
      ladder.parent.position.x = LADDER_X[Math.min(3, Math.floor(T / 2))];
      brackets[0].parent.visible = T >= 2;
      brackets[1].parent.visible = T >= F(3.67);
      rod.visible = T >= 4;
      if (T < F(4.83)) {
        gator.group.updateMatrixWorld(true);
        gator.hand.getWorldPosition(hand);
        rod.position.set(-0.15, hand.y - 0.002, 0.008);
      } else rod.position.set(-0.15, 0.26, 0.008);
      setPanel(panels[0], 0, kf(T, [[F(6.17), 0], [F(6.83), 1]], ease), T < F(5.17) ? 5 * DEG : 0);
      setPanel(panels[1], 1, kf(T, [[F(7.0), 0], [F(7.67), 1]], ease), T < F(5.5) ? -4 * DEG : 0);
      const phoneOn = tLocal >= 8.5;
      phone.visible = phoneOn;

      // Light on 1s. Moon full until 8.0, then 5%. Ambient 40% of s02's, then BLACK for the black, 15% from 8.5 (spec
      // deviation: at 15% the night grade puts the black at 8.6% mean luma against the spec's < 5%); phone on at 8.5.
      moon.update(tLocal, 0);
      moon.light.position.set(MOON_X[Math.min(3, Math.floor(tLocal / 2))], 0.8, -1.0);
      if (tLocal >= 8) moon.light.intensity *= 0.05;
      amb.intensity = AMB * (tLocal < 8 ? 0.4 : tLocal < 8.5 ? BLACK : 0.15);
      spot.intensity = phoneOn ? SPOT : 0;
      fill.intensity = phoneOn ? FACE_FILL * SPOT : 0;

      // The Exam: at B all shot, its eyes changing at each pop. Its key is pinned (README §11): fills sit near it.
      const [eyes, look] = examEyes(T);
      exam.update(tLocal, { wobble: 1, eyes, look, key: phoneOn ? spot : moon.light });

      // DOF: the window and ladder until the black, then between him (0.90 m) and the wall (1.30 m).
      fx.set(tLocal < 8 ? { focus: 1.25, aperture: 0.02 } : { focus: 1.10, aperture: 0.012 });
    },
  };
}
