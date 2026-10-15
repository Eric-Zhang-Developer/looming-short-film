// s11 · Laptop, then phone (docs/shots/s11.md). Animatic blocking on proxies until art is frozen.
// The Marston hero desk unit (docs/shots/README.md §2) seen side-on at desk height. He opens the laptop (1.0), stares
// at it, then picks up the phone instead (3.6): the phone becomes the key and the blob's shadow springs up the window
// wall, while the desk fluorescent flickers and dies (4.2–5.0). Characters and handled props on 2s, light and camera on 1s,
// boil 10/s. Shared positions are s15's merged ones (done/anim-s15.md "numbers to copy"), not the older spec values.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, fluorescent, ambient, aim } from '../lights.js';
import { kf, ease, clamp } from '../core/ease.js';
import { hash2, seedOf } from '../core/rng.js';
import { makeGator } from '../characters/gator.js';
import { specPose } from '../characters/poses.js';
import { makeExam } from '../characters/exam.js';

const ID = 's11', D = Math.PI / 180;
const dr = (n) => n / 12;
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;   // core onTwos can land on the previous drawing (float error; contract fix pending)

const HIP = [-0.075, -0.012, 0.074];
const BLOB = [0, 0.012, 0.0884];                        // centre; mesh at its contact point (0, 0, 0.0884), s15 merge
const REST = [-0.010, 0.0015, 0.116];                   // phone rest, s15 merge
// Held phone: the spec's x, y; z solved so the wall shadow keeps the spec's 4.77x / 5.90x (and so its centre and size)
// with the blob moved back to z 0.0884: z = s·Bz / (s − 1). The spec's 0.124 / 0.118 would give 3.4x / 4.0x.
const zFor = (s) => s * BLOB[2] / (s - 1);
const LIFT = [-0.012, 0.008, zFor(4.77)], SETTLE = [-0.014, 0.008, zFor(5.90)];
const CAM = [0.020, 0.033], CAM_Z = [[2.6, 0.668], [6.0, 0.628]];
const HINGE = [0.015, 0.002], LID_LEN = 0.035;

// Intensities (cd for spots/points, lux for the directional), by eye on the animatic sheet.
const FLUOR_I = 0.6, PHONE_I = 1.0, LAPTOP_I = 0.15, FILL_I = 0.3 * 0.03, AMB_K = 0.4, CHAR_FILL_I = 0.008;

// The Student in the s15 convention: [t, lean, arm, head]. Every key is a 2s drawing.
const seat = (lean, arm, head = 0) => specPose({ lean, arm, head, leg: 60, farLeg: 54 });
const BODY = [
  [0, 0, -30, 0], [dr(6), 0, -30, 0],                   // sit_upright, hand on the desk edge
  [dr(9), -4, -50, 0], [dr(10), -4, -50, 0],            // anticipation: leans back
  [dr(12), 23, -12, -3],                                // lid_reach: fingertip on the closed lid's front edge
  [dr(14), 28, 10, -3],                                 // lid_lift: edge at 20°, then the flick
  [dr(15), 18, 14, -3],                                 // follow-through of the flick
  [dr(18), 4, -30, -5], [dr(31), 4, -30, -5],           // sit_screen
  [dr(32), 4, -30, -8], [dr(35), 4, -30, -8],           // glance down at the phone
  [dr(37), -2, -50, -8],                                // anticipation: shoulders drop
  [dr(40), 30, -12, -10], [dr(41), 30, -12, -10],       // grip: fingertip on the phone's left end
  [dr(43), 23, -5, -10],                                // lift_phone
  [dr(53), 22, -6, -15], [6, 22, -6, -15],              // sit_phone_hunch (arm solved for the settled phone's left end)
];
const LID = [[dr(12), 0], [dr(14), 20], [dr(16), 75], [dr(17), 96], [dr(18), 100]];   // degrees, swings on by itself
const PHONE = [[dr(41), REST], [dr(43), LIFT], [dr(53), SETTLE]];
const TILT = [[dr(41), [0, 0]], [dr(43), [0.5, 0.6]]];   // [toward camera, toward his face] rad: the lifted screen reads
const eyesAt = (T) => T < 2 ? 'open' : T < 2.6 ? 'tired' : T < 3.6 ? 'side' : T < 5 ? 'open' : 'tired';
const mouthAt = (T) => (T >= 2 && T < 3.6 ? 'line' : 'neutral');

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const [furn, lampA, props] = await Promise.all(['marston_furniture_sheet', 'desk_lamp', 'study_props_sheet'].map((n) => assets.load(n)));
  const boiling = [];
  const sheet = (opts, parent = scene, mat) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }), mat);
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  // An asset piece in a holder whose origin is the centre of its visible shape (s15's cut()).
  const cut = (a, name, { weight, res = 512, parent = scene, mat } = {}) => {
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${name}`, weight, res }, holder, mat);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    holder.userData.vis = [w * (u1 - u0), h * (v1 - v0)];
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };
  const noCast = (g) => { g.traverse((o) => { o.castShadow = false; }); return g; };
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // ---------- set (s15's desk unit) ----------
  // marston_window_wall: navy cardstock with six window holes; window_tissue panes behind at z −0.001. Receives only.
  const WALL = [1.3, 0.394], PX = 2048 / WALL[0], WINDOWS = [-0.51, -0.31, -0.11, 0.09, 0.29, 0.49];
  const wallArt = Object.assign(document.createElement('canvas'), { width: 2048, height: Math.round(WALL[1] * PX) });
  { const g = wallArt.getContext('2d'); g.fillStyle = PALETTE.navy; g.fillRect(0, 0, wallArt.width, wallArt.height);
    for (const cx of WINDOWS) g.clearRect((cx - 0.05 + 0.65) * PX, (0.36 - 0.300) * PX, 0.10 * PX, (0.300 - 0.066) * PX); }
  const wall = sheet({ art: wallArt, size: WALL, key: `${ID}-marston_window_wall`, res: 2048 });
  wall.position.set(0, (0.36 - 0.034) / 2, 0); wall.castShadow = false;
  const paneCol = '#' + C('navy').lerp(C('ink'), 0.35).getHexString();
  const panes = WINDOWS.map((cx) => {
    const m = sheet({ path: RECT, color: paneCol, weight: 'tissue', size: [0.11, 0.245], key: `${ID}-pane${cx}`, res: 256 });
    m.position.set(cx, 0.183, -0.001); m.castShadow = false; return m;
  });
  const floor = flat(sheet({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [0.8, 0.45], key: `${ID}-marston_floor`, res: 512 }));
  floor.position.set(0, -0.034, 0.225); floor.castShadow = false;
  const deskTop = flat(cut(furn, 'desk_top', { weight: 'kraft', res: 1024 }));
  deskTop.position.set(0.0585, 0, 0.075);                                   // x −0.033…0.150, z 0.030…0.120
  cut(furn, 'desk_apron', { weight: 'kraft', res: 1024 }).position.set(0.0585, -0.017, 0.120);
  cut(furn, 'chair', { weight: 'kraft' }).position.set(-0.076, -0.034 + 0.025, 0.071);
  { // backpack, side view, on the floor behind the chair: 0.035 × 0.04 centred x −0.145, z 0.028
    const b = cut(props, 'backpack_side'), [vw, vh] = b.userData.vis;
    b.scale.set(0.035 / vw, 0.04 / vh, 1); b.position.set(-0.145, -0.034 + 0.02, 0.028);
  }

  // laptop, profile cutout at z 0.060: base x −0.030…0.015, lid 0.035 hinged at (0.015, 0.002), closed at the start.
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, 0.060);
  const lid = new THREE.Group(); lid.position.set(HINGE[0], HINGE[1] + 0.0015, 0.0601); scene.add(lid);
  { const l = cut(props, 'laptop_lid', { parent: lid }); l.scale.x = LID_LEN / l.userData.vis[0]; l.position.x = -LID_LEN / 2; }
  // The screen: a glowing cream strip on the lid's inner face with scribble glyphs, never letters.
  const SCRL = Object.assign(document.createElement('canvas'), { width: 280, height: 24 });
  { const g = SCRL.getContext('2d'); g.fillStyle = PALETTE.cream; g.fillRect(0, 0, 280, 24);
    g.strokeStyle = PALETTE.navy; g.globalAlpha = 0.45; g.lineWidth = 3;
    for (const [x0, x1, y] of [[20, 120, 8], [140, 250, 8], [20, 200, 16], [215, 260, 16]]) {
      g.beginPath(); for (let x = x0; x <= x1; x += 6) g.lineTo(x, y + 2 * Math.sin(x * 0.7)); g.stroke(); } }
  const scrlTex = new THREE.CanvasTexture(SCRL); scrlTex.colorSpace = THREE.SRGBColorSpace;
  const lidScreen = new THREE.Mesh(new THREE.PlaneGeometry(LID_LEN - 0.002, 0.0026), new THREE.MeshBasicMaterial({ map: scrlTex }));
  lidScreen.position.set(-LID_LEN / 2, -0.0028, 0.0002); lid.add(lidScreen);

  // desk_lamp, unlit, cutout plane z 0.078 (s15's placements, knob at its z 0.0855).
  const LZ = 0.078;
  cut(lampA, 'base').position.set(-0.020, 0.002, LZ);
  cut(lampA, 'stem').position.set(-0.020, 0.035, LZ);
  cut(lampA, 'knob').position.set(-0.0228, 0.0228, 0.0855);
  { const arm = cut(lampA, 'arm'); arm.position.set(-0.008, 0.069, LZ); arm.rotation.z = Math.atan2(-0.002, 0.024); }
  // The tubes light the scene from behind (spec's 15° tilt toward camera), and tissue at its default translucency 0.8
  // glowed as if the lamp were on, which spends s15's click early. Back-lighting held to 0.15 while it is off.
  { const shade = cut(lampA, 'shade', { weight: 'tissue', mat: { translucency: 0.15 } }), [sw, sh] = shade.userData.vis, sk = 0.016 / sh;
    shade.rotation.z = Math.PI / 2; shade.scale.setScalar(sk);
    shade.position.set(0.004, 0.056 + sw * sk / 2, LZ + 0.0005); }   // unlit: it casts (README §4, its own smaller shadow)

  // exam_page, blank, flat; the capped pen on its front edge.
  flat(cut(props, 'exam_page', { res: 1024 })).position.set(-0.0205, 0.0003, 0.095);
  flat(cut(props, 'pen')).position.set(-0.022, 0.0006, 0.106);
  flat(cut(props, 'pen_cap')).position.set(-0.018, 0.0009, 0.106);

  // phone: flat face-up at rest, dark. Glyph-bar screen (s15's), dimmed until 3.6. Nothing on it casts.
  const phone = new THREE.Group(); phone.rotation.order = 'ZYX'; scene.add(phone);
  flat(cut(props, 'phone_face', { parent: phone })).position.y = 0.0004;
  { const back = cut(props, 'phone_back', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0064), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);
  noCast(phone);

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(...HIP);
  scene.add(hero.group);
  hero.meshes.arm_r.castShadow = false;   // its tip is at the phone, inside the cone: it would throw a wall-sized arm
  const exam = makeExam({ shot: ID, seed: 1 });
  exam.mesh.position.set(BLOB[0], 0, BLOB[2]);
  exam.stain.position.set(BLOB[0], 0.0004, BLOB[2]);
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  const FL = C('cream').lerp(C('gator'), 0.15);   // the Marston fluorescent tone (README §6)
  // Key 0–3.6: one dim directional, pointing down and tilted 15° toward camera, so the pool falls in front of the blob.
  const tube = fluorescent({ flickerSeed: seedOf(ID, 1), intensity: FLUOR_I });
  tube.light.color.copy(FL);
  tube.light.target.position.set(BLOB[0], 0, BLOB[2]);
  tube.light.position.set(BLOB[0], 1.5 * Math.cos(15 * D), BLOB[2] - 1.5 * Math.sin(15 * D));
  Object.assign(tube.light.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3 });
  scene.add(tube.light, tube.light.target);
  const flSeed = seedOf(ID, 'tableLightDies') % 65536;
  const tubeLevel = (t) => {   // 1, then a seeded chatter 4.2–5.0 under a falling ceiling, dark from 5.0
    if (t < 4.2) return 1;
    if (t >= 5.0) return 0;
    const f = Math.floor(t * 24), ceil = 1 - 0.7 * (t - 4.2) / 0.8;
    return t - 4.2 < 1 / 24 || hash2(flSeed, f) < 0.45 ? 0.08 * ceil : ceil;   // starts with a drop on the beat frame
  };
  // Laptop screen 1.5–5.0: cream point at the lid centre, no shadow.
  const screenLight = new THREE.PointLight(PALETTE.cream, 0, 0.08, 2); scene.add(screenLight);
  // Key from 3.6: the phone spot (README §4), aimed phone → blob every frame.
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 0.6, intensity: 0 });
  scene.add(spot, spot.target);
  // Face fill from 3.6: shadowless cyan at the phone.
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2); scene.add(fill);
  // Character fill (README §10): the tubes come from behind the wall, so every camera-facing cutout is a silhouette
  // under them. Shadowless, fluorescent-toned, in front of him just above eye line (s15's spot), short reach; it dies
  // with the tubes.
  const charFill = new THREE.PointLight(FL, 0, 0.07, 2); charFill.position.set(-0.046, 0.040, 0.114); scene.add(charFill);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  const fx = post({ focus: 0.668 - BLOB[2], aperture: 0.025, maxblur: 0.01, lut: 'marston' });
  const P = new THREE.Vector3(), BC = V(BLOB), lc = new THREE.Vector3();
  let lastSeed = null;

  function update(t) {
    const T = on2s(t), seed = boilSeed(t, 10);
    if (seed !== lastSeed) { lastSeed = seed; for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed })); }

    // Camera: held to 2.6, then a 0.04 m push-in on z only, eased (on 1s). Focus rides the blob.
    const cz = kf(t, CAM_Z, ease);
    camera.position.set(CAM[0], CAM[1], cz);
    camera.rotation.set(0, 0, 0);
    fx.set({ focus: cz - BLOB[2] });

    // The Student on 2s.
    const [lean, arm, head] = kf(T, BODY.map(([k, ...v]) => [k, v]));
    hero.boil(t, 10);
    hero.blend({ now: seat(lean, arm, head) }, [[0, 'now']], 0);
    hero.face({ eyes: eyesAt(T), mouth: mouthAt(T) });

    // Laptop lid (on 2s) and its screen: on at 1.5, asleep at 5.0.
    lid.rotation.z = -kf(T, LID) * D;
    const lit = t >= 1.5 && t < 5.0;
    lidScreen.visible = t >= 1.5;
    lidScreen.material.color.setScalar(lit ? 1 : 0.06);
    lid.updateMatrixWorld(true);
    screenLight.position.copy(lid.localToWorld(lc.set(-LID_LEN / 2, -0.004, 0)));
    screenLight.intensity = lit ? LAPTOP_I : 0;

    // Phone (on 2s): rest, then lifted and tilted toward his face, then settling as he hunches.
    phone.position.fromArray(kf(T, PHONE));
    const [ax, az] = kf(T, TILT);
    phone.rotation.set(ax, 0, az);
    const awake = t >= 3.6;
    screen.material.color.setScalar(awake ? 1 : 0.06);

    // The Exam: looking at him throughout; perks up at the lid, wobbles when the phone light hits it.
    const squash = kf(T, [[1.5, 0], [dr(19), 0.15], [dr(20), 0.15], [dr(21), -0.1], [2.0, -0.1], [dr(27), 0]]);
    const wobble = kf(T, [[3.6, 1], [dr(46), 1.6], [dr(55), 1]]);

    // Light on 1s.
    tube.light.intensity = FLUOR_I * tubeLevel(t);
    charFill.intensity = CHAR_FILL_I * tubeLevel(t);
    P.copy(phone.position);
    spot.position.copy(P);
    spot.intensity = awake ? PHONE_I * clamp(0.5 + (t - 3.6) * 12) : 0;   // 0 → 1 over 2 frames at 3.6
    aim(spot, BC);
    spot.shadow.camera.near = 0.004; spot.shadow.camera.updateProjectionMatrix();
    fill.position.copy(P);
    fill.intensity = awake ? FILL_I * spot.intensity / PHONE_I : 0;
    exam.update(t, { squash, wobble, eyes: 'side', look: -1, key: awake ? spot : tube.light });
  }

  return { parts: { charFill, exam, spot, tube, hero, phone, wall, panes, deskTop, lid, camera }, update };   // parts: evidence/anim-s11/measure.html only
}
