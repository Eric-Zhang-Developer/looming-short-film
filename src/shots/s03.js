// s03 · Phone up: the shadow climbs (docs/shots/s03.md). Animatic blocking on proxies until art is frozen.
// The home desk unit (docs/shots/README.md §2), cut in on s02's axis. What moves: the Student on 2s (shrug, phone up,
// hunch, thumb flicks), the Exam on 2s (glances, the 7 mm scoot), the phone light on 1s, the focus pull on 1s, boil 10/s.
// The rule, first time: the phone spot sits at the phone and aims phone → blob, so the wall shadow is 2.33× at the lift,
// 3.0× in the hunch and 3.33× after the scoot (evidence/sb-reconcile/geometry.txt), all by geometry.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, dawnLight, ambient, aim } from '../lights.js';
import { kf, ease, easeOut, spring, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator } from '../characters/gator.js';
import { specPose } from '../characters/poses.js';
import { makeExam } from '../characters/exam.js';

const DEG = Math.PI / 180;
const F = (s) => Math.round(s * 12) / 12;  // spec times (0.17, 0.33, 3.67 ...) are 2s drawings: snap them to twelfths
const HIP = [-0.075, -0.012, 0.074];
const B = [0.040, 0, 0.060], B2 = [0.034, 0, 0.063];   // blob contact points (its centre is r above: the spec's y 0.012)
const REST = [-0.010, 0.0015, 0.114], LIFT = [-0.015, 0.010, 0.105], L = [-0.012, 0.004, 0.090];
const SPOT = 0.04;  // phone spot, cd at decay 2: a cream wall 10–15 cm away lands lit but below white (NoToneMapping)
const CAM = { pos: [0.060, 0.090, 0.530], look: [0.060, 0.038, 0.060] };
const FOCUS = [[1.5, 0.477], [2.5, 0.540]];             // blob → wall, eased, on 1s

// A path rectangle that fills its canvas has no edge to tear, so it's inset 4% and the size grown to keep [w, h] (as s01).
function torn(w, h) {
  const m = 0.04 * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}

// The Student as spec numbers (s15 convention, degrees), sampled per 2s drawing.
// 0–0.17 anticipation (head −3°, shoulders sink 1.5 mm), 0.17–0.33 the shrug (POSES.shrug: arms +20°, head up),
// 0.33–0.42 drop back, gaze down to the phone, 0.50 phoneUp (lean 16, arm −6: fingertip on the phone's left end),
// 0.50–1.50 ease-out into the hunch (lean 24, arm −11: fingertip at L's left end), then hold with thumb flicks (+2°).
const EARLY = [  // [t, lean, arm, far, head, shoulder drop (m)]
  [0, 10, 35, -40, -8, 0], [F(0.17), 10, 35, -40, -11, -0.0015], [F(0.33), 8, 55, -20, 6, 0.0010], [F(0.42), 10, 35, -40, -10, 0],
];
const LATE = [[F(0.5), 16, -6, -40, -10, 0], [F(1.5), 24, -11, -40, -10, 0]];
const FLICKS = [1.83, 2.33, 2.83, 3.33, 3.83, 4.33].map(F);
function body(T) {
  const keys = T < F(0.5) ? EARLY : LATE;
  const [lean, arm, far, head, drop] = kf(T, keys.map(([t, ...r]) => [t, r]), T < F(0.5) ? ease : easeOut);
  const flick = FLICKS.some((f) => Math.abs(T - f) < 1e-6) ? 2 : 0;
  return { pose: specPose({ lean, arm: arm + flick, far, head, leg: 60, farLeg: 54 }), drop };
}
// The phone rides the same keys: at rest until the 0.50 drawing, then lifted and flipped, then eased to L.
const phoneAt = (T) => (T < F(0.5) ? REST : kf(T, [[F(0.5), LIFT], [F(1.5), L]], easeOut));

export async function build({ scene, camera, assets, PALETTE, post }) {
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.set(...CAM.pos);
  camera.lookAt(...CAM.look);

  // Small upright cutouts get s02's seeded ±1.5° tilt. Wall, desk top and apron stay true: the wall is the shadow's
  // receiver at z 0, and a tilted 0.33 m apron would swing ±4 mm into the phone's rest spot 6 mm behind it.
  const tiltOf = (layer) => { const r = mulberry32(seedOf('s02', layer)); return [(2 * r() - 1) * 1.5 * DEG, (2 * r() - 1) * 1.5 * DEG, 0]; };
  const boiling = [];  // [mesh, seed => PaperSheet]
  // One paper piece. `at` is where the VISIBLE shape's centre goes (asset bitmaps are padded; `vis` is the shape's
  // uv box), `flat` lays it on the desk (normal +y), `tilt` applies the seeded tilt.
  function piece(layer, opts, { at, flat = false, tilt = false, boil = true, rotZ = 0, vis = [0, 0, 1, 1], parent = scene, ...mat }) {
    const make = (s) => makePaper({ ...opts, key: `s03-${layer}`, seed: s });
    const sheet = make(0), mesh = paperMesh(sheet, mat), [w, h] = sheet.size;
    mesh.position.set((0.5 - (vis[0] + vis[2]) / 2) * w, ((vis[1] + vis[3]) / 2 - 0.5) * h, 0);
    const g = new THREE.Group();
    g.add(mesh);
    g.position.set(...at);
    if (tilt) g.rotation.set(...tiltOf(layer));
    if (flat) g.rotation.x = -Math.PI / 2;
    g.rotation.z = rotZ;
    parent.add(g);
    if (boil) boiling.push([mesh, make]);
    return mesh;
  }
  const art = (a, name, extra = {}) => ({ opts: { art: a.pieces[name], size: a.sizes[name], ...extra }, vis: a.visible?.[name] });

  // ---- Wall (z 0): apt_wall, cream cardstock, x −0.40…0.45, y −0.034…0.40. Its edges are out of frame, so it doesn't
  // boil (boil only re-tears edges); 2048 px keeps its tooth near 2.4 px/mm.
  const wall = piece('apt_wall', { ...torn(0.85, 0.434), color: PALETTE.cream, res: 2048 }, { at: [0.025, 0.183, 0], boil: false });
  wall.castShadow = false;
  // Floor at y −0.034 (README §2), seen only at frame left under the chair.
  piece('floor', { ...torn(0.6, 0.3), color: PALETTE.kraft, weight: 'kraft' }, { at: [0, -0.034, 0.15], flat: true, boil: false }).castShadow = false;

  // ---- Calendar (z 0.006): sheet 1, centre (0.150, 0.100), 0.10 × 0.12. The proxy is a blank cream sheet, so it gets
  // a faint glyph-free month grid and Friday's red circle (Ø 0.012 at (0.170, 0.095)) drawn on; real art has its own.
  const cal = await assets.load('calendar');
  {
    const { opts, vis } = art(cal, 'sheet1');
    if (cal.proxy) {
      const src = opts.art, cv = Object.assign(document.createElement('canvas'), { width: src.width, height: src.height }), g = cv.getContext('2d');
      g.drawImage(src, 0, 0);
      const [u0, v0, u1, v1] = vis, X = (u) => (u0 + u * (u1 - u0)) * cv.width, Y = (v) => (v0 + v * (v1 - v0)) * cv.height;
      g.strokeStyle = PALETTE.navy; g.globalAlpha = 0.25; g.lineWidth = cv.width * 0.004;
      for (let i = 1; i < 7; i++) { g.beginPath(); g.moveTo(X(i / 7), Y(0.22)); g.lineTo(X(i / 7), Y(0.95)); g.stroke(); }
      for (let j = 0; j < 6; j++) { const v = 0.22 + j * 0.146; g.beginPath(); g.moveTo(X(0.03), Y(v)); g.lineTo(X(0.97), Y(v)); g.stroke(); }
      g.globalAlpha = 1; g.strokeStyle = PALETTE.calendarRed; g.lineWidth = cv.width * 0.012;
      g.beginPath(); g.arc(X(0.7), Y(0.5417), 0.06 * (u1 - u0) * cv.width, 0, 2 * Math.PI); g.stroke();  // (0.170, 0.095) in sheet uv
      opts.art = cv;
    }
    piece('calendar', opts, { at: [0.150, 0.100, 0.006], tilt: true, vis });
  }

  // ---- Desk: apt_desk top (y 0, z 0…0.120, x −0.033…0.300) and apron (z 0.120, y −0.034…0).
  piece('desk_top', { ...torn(0.333, 0.120), color: PALETTE.kraft, weight: 'kraft' }, { at: [0.1335, 0, 0.060], flat: true }).castShadow = false;
  piece('desk_apron', { ...torn(0.333, 0.034), color: PALETTE.kraft, weight: 'kraft' }, { at: [0.1335, -0.017, 0.120] });

  // ---- Lamp, off (z 0.078): base x −0.028…−0.012, stem x −0.022…−0.018 to y 0.070, knob (−0.0228, 0.0228),
  // arm (−0.020, 0.070)→(0.004, 0.068), tissue shade with its mouth centred at (0.004, 0.056).
  const lamp = await assets.load('desk_lamp');
  const lampPart = (name, at, extra = {}, rotZ = 0) => { const { opts, vis } = art(lamp, name, extra); return piece(`lamp_${name}`, opts, { at, vis, rotZ }); };
  lampPart('base', [-0.020, 0.002, 0.078]);
  lampPart('stem', [-0.020, 0.035, 0.0785]);
  lampPart('knob', [-0.0228, 0.0228, 0.0795]);
  lampPart('arm', [-0.008, 0.069, 0.0785], {}, Math.atan2(-0.002, 0.024));
  lampPart('shade', [0.004, 0.063, 0.079], { weight: 'tissue' });

  // ---- Props: exam_page flat on the desk (x −0.033…−0.008, z 0.080…0.110), and the phone.
  const props = await assets.load('study_props_sheet');
  { const { opts, vis } = art(props, 'exam_page'); piece('exam_page', opts, { at: [-0.0205, 0.0003, 0.095], flat: true, vis }); }
  // The phone is a two-sided card lying flat: back (navy) up at rest, face (ink + a cyan screen) up once flipped.
  // Nothing on it casts: the phone light sits inside it.
  const phone = new THREE.Group();
  scene.add(phone);
  for (const [name, y, rx] of [['phone_back', 0.0003, -Math.PI / 2], ['phone_face', -0.0003, Math.PI / 2]]) {
    const { opts, vis } = art(props, name);
    const m = piece(name, opts, { at: [0, y, 0], vis, parent: phone });
    m.parent.rotation.x = rx; m.castShadow = false;
  }
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0058), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
  screen.rotation.x = Math.PI / 2; screen.position.y = -0.0006;  // on the face side, so it comes up with the flip
  phone.add(screen);

  // ---- Chair (z 0.071, marston chair art as the home chair), x −0.092…−0.060, standing on the floor.
  const fur = await assets.load('marston_furniture_sheet');
  {
    const { opts, vis } = art(fur, 'chair'), k = 0.032 / (opts.size[0] * (vis[2] - vis[0]));
    opts.size = opts.size.map((s) => s * k);
    piece('chair', { ...opts, weight: 'kraft' }, { at: [-0.076, -0.034 + opts.size[1] * (vis[3] - vis[1]) / 2, 0.071], vis });
  }

  // ---- The Student: seated in profile facing +x, hip (−0.075, −0.012), body plane z 0.074.
  const gator = await makeGator({ assets }, { res: 1024 });
  gator.group.position.set(...HIP);
  scene.add(gator.group);
  // Every 2s drawing is its own blend key, so blend() lands exactly on the spec values and follow() has a track.
  const POSE = {}, KEYS = [];
  for (let i = 0; i <= 60; i++) { POSE[i] = body(i / 12).pose; KEYS.push([i / 12, String(i)]); }

  // ---- The Exam at B, r 0.012, its stain under it.
  const exam = makeExam({ shot: 's03', seed: 1 });
  scene.add(exam.mesh, exam.stain);

  // ---- Light. Key: the phone spot (README §4), aimed every frame along phone → blob to its wall hit. Face fill: an
  // unshadowed cyan point at the phone + (−0.005, 0.008, 0), 15%. Window: s02's dawnLight at k 0.35, held at 30%.
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 0.6, intensity: SPOT });
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);
  const dawn = dawnLight();
  dawn.light.target.position.set(0.06, 0.05, 0.06);
  scene.add(spot, spot.target, fill, dawn.light, dawn.light.target, ambient());

  const fx = post({ focus: FOCUS[0][1], lut: 'night' });
  const P = new THREE.Vector3(), C = new THREE.Vector3(), hit = new THREE.Vector3();

  return {
    parts: { exam, spot, dawn, gator, phone },  // read by evidence/anim-s03/measure.html only
    update(tLocal) {
      const T = onTwos(tLocal);

      // Paper boils at 10/s; the Student on 2s.
      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));
      gator.boil(tLocal, 10);
      gator.blend(POSE, KEYS, tLocal);
      gator.follow('tail', tLocal, { k: 6, w: 18 });
      gator.group.position.y = HIP[1] + body(T).drop;
      gator.face({ eyes: T < F(0.17) ? 'side' : T < F(0.42) ? 'closed' : 'tired', mouth: T < F(2.0) ? 'line' : 'neutral' });

      // The phone: rest (screen down) → the 0.50 drawing lifts and flips it, screen awake → eases to L.
      const up = T >= F(0.5);
      phone.position.fromArray(phoneAt(T));
      phone.rotation.x = up ? Math.PI : 0;
      screen.visible = up;

      // The Exam: open on him, side toward the phone at 0.58, up-right at its own shadow at 2.50, back at 3.33.
      // 3.50 squash (one drawing), 3.58 mid-hop, 3.67 lands at B2 and settles on a spring.
      let eyes = 'open', look = 1;
      if (T >= F(0.58) && T < F(3.33)) { eyes = 'side'; look = T < F(2.5) ? -1 : 1; }
      const at = T < F(3.5) ? B : T >= F(3.67) ? B2 : [0.037, 0.002, 0.0615];
      const squash = Math.abs(T - F(3.5)) < 1e-6 ? 0.2 : 0.2 * spring(T, F(3.67));
      exam.mesh.position.fromArray(at);
      exam.stain.position.set(at[0], 0.0003, at[2]);
      exam.update(tLocal, { squash, wobble: 1, eyes, look });

      // Light on 1s: dark until 0.50, full from that frame. Aimed along phone → blob centre, to its wall hit.
      P.fromArray(phoneAt(T));
      C.set(at[0], at[1] + exam.radius, at[2]);
      hit.subVectors(C, P).multiplyScalar(-P.z / (C.z - P.z)).add(P);
      spot.position.copy(P);
      spot.intensity = tLocal >= 0.5 ? SPOT : 0;
      aim(spot, hit);
      // aim() puts the shadow camera's near plane at half the light→target distance (~6 cm here), behind the blob
      // (5 cm from the phone), which would drop the blob from its own shadow map. Pull it in to just past the phone.
      spot.shadow.camera.near = 0.004;
      spot.shadow.camera.updateProjectionMatrix();
      fill.position.set(P.x - 0.005, P.y + 0.008, P.z);
      fill.intensity = 0.15 * spot.intensity;
      dawn.update(tLocal, 0.35);
      dawn.light.position.set(0.8, 0.6, 0.6);
      dawn.light.intensity *= 0.3;

      fx.set({ focus: kf(tLocal, FOCUS, ease) });
    },
  };
}
