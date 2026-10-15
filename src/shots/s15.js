// s15 · The pen, the light, the look, the name (docs/shots/s15.md). The film's turn, and the master s06 copies:
// Camera A, the desk unit, the K0–K7 timing and the press at local 0.500 are the numbers in UNIT below. Marston has no desk
// lamp: the reach for the pen wakes the motion-sensor zone over the desk (README §3), on the press drawing.
// Marston reading room at night, side view: desk top y 0, floor y −0.034, window wall z 0, the gator faces +x.
// Characters (gator, blob, the props he handles) step on 2s; light and camera run at 24.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, sensorLight, fluorescent, ambient, aim, shadowScale } from '../lights.js';
import { kf, ease, clamp } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator } from '../characters/gator.js';
import { createBlob } from '../blob.js';
import { POSES, specPose, pressKeys } from '../characters/poses.js';

const ID = 's15', D = Math.PI / 180;
const BLOB_R = 0.012;                                        // the Exam's radius here (README §1); the blob-meter pass changes this line
const dr = (n) => n / 12;                                    // drawing n (12 fps) → local seconds
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;          // onTwos, but 100.0833 − 100 = 0.08333333333332860 floors to drawing 0 there (evidence/anim-s15/ontwos.txt)

// ---------- the master numbers (s06 copies these; docs/shots/README.md §2–§4) ----------
export const UNIT = {
  hip: [-0.075, -0.012], bodyZ: 0.074,                       // gator root (makeGator puts the near arm at +0.012 → z 0.086)
  camA: { pos: [-0.010, 0.118, 0.392], look: [-0.010, 0.0385, 0.080] },   // spec look y 0.030, tilted up 1.45° (loom fix)
  camB: { pos: [-0.022, 0.090, 0.292], look: [-0.022, 0.020, 0.084] },
  focus: [-0.024, 0.020, 0.086], aperture: 0.02, maxblur: 0.01,
  fill: [-0.046, 0.040, 0.114],                             // character fill (README §10): before him, just above eye line
  tube: [0, 0.127, 0.040],                                   // sensor_trough tube centre (README §3), above the frame in A and B
  blob: [0, BLOB_R, 0.0884], phone: [-0.010, 0.0015, 0.116], phoneLight: [-0.014, 0.006, 0.116],   // loom fix: 4.2x, see done note
  press: 0.5,                                                // K6, drawing 6: the pen's capped point meets the page = the sensor
                                                             // wake time (lampClickMarston). Beat-locked: don't move it.
};
// Intensities (candela for spots/points, lux for the directional), tuned by eye on the animatic sheet.
const PHONE_I = 1.0, ZONE_I = 0.8, FLUOR_I = 1.0, AMB_K = 0.45;   // ZONE_I: lights.js's default, the old lamp pool at the blob
const PHONE_OUTSHONE = 0.02;   // README §4 says 0.2. anim-s15 took 0.05 (0.2 left the loom at 43%); the zone doesn't reach the
                               // wall as the lamp's cone did, so 0.05 still read as a face: 0.02 (reel-s15, by eye)
const FILL_PHONE = 0.003, FILL_ZONE = 0.02;   // character fill (README §10), set against anim-s15's face/wall ratio

// ---------- the hand: K0–K3 from poses.js (shared with s06), K4–K7 down to the pen, then the rest of s15's table ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });   // poses.js's seated legs
const P = {
  ...POSES,
  pen_reach: seat({ lean: 19, arm: -15 }),    // K4 0.333, hand 3 mm over the capped pen
  pen_touch: seat({ lean: 21, arm: -19 }),    // K5 0.417, fingertip on the pen
  pen_press: seat({ lean: 24, arm: -16 }),    // K6 0.500 = K7: the capped point on the name line (the wake)
  let_go: seat({ lean: 10, arm: -10 }),       // 1.167
  settle: seat({ lean: 6, arm: -30 }),        // 1.333, tip (−0.031, 0.000): hand flat on the desk
  phone_antic: seat({ lean: 4, arm: -36 }),   // 7.000
  flip: seat({ lean: 30, arm: -4.5 }),        // 7.333, solved for the spec's tip (−0.017, 0.005)
  to_pen: seat({ lean: 10, arm: -30 }),       // 7.583
  line1: seat({ lean: 14, arm: -21 }),        // 13.0, tip 2.5 mm above the desk (problem line 1)
};
const WRITE = ['write_a', 'write_b', 'write_c'];
const BODY = [
  ...pressKeys(0).slice(0, 4),                                // K0–K3: drawings 0–3, identical to s06
  [dr(4), 'pen_reach'], [dr(5), 'pen_touch'], [dr(6), 'pen_press'], [dr(7), 'pen_press'],   // K4–K7, press on 6 (0.500)
  [dr(12), 'pen_press'], [dr(14), 'let_go'], [dr(16), 'settle'],
  [dr(83), 'settle'], [dr(84), 'phone_antic'], [dr(86), 'grab'], [dr(87), 'grip'], [dr(88), 'flip'], [dr(89), 'grip'],
  [dr(90), 'grip'], [dr(91), 'to_pen'], [dr(92), 'to_pen'], [dr(93), 'uncap'], [dr(95), 'uncap'], [dr(96), 'uncap_pull'],
  [dr(100), 'poise'], [dr(105), 'poise'],
  ...Array.from({ length: 14 }, (_, i) => [dr(106 + i), WRITE[i % 3]]),   // 8.833–10.0: the name, 14 drawings
  [dr(120), 'poise'], [dr(144), 'poise'], [dr(146), 'exhale'], [dr(150), 'exhale'], [dr(156), 'line1'],
];
// Head on body (deg, + snout up), set with pose() after blend: K2's dip, the turn down to the blob, the look at the name.
const HEAD = [[0, 0], [dr(1), 0], [dr(2), -3], [dr(3), 0], [dr(29), 0], [dr(30), 2], [dr(32), -6], [dr(34), -10],
  [dr(120), -10], [dr(126), -14]];
const eyesAt = (t) => t < dr(6) ? 'open' : t < dr(8) ? 'closed' : t < dr(32) ? 'open' : t < dr(60) ? 'side'
  : t >= dr(75) && t < dr(77) ? 'closed' : t < dr(84) ? 'open' : t < dr(93) ? 'side' : t < dr(132) ? 'open'
  : t < dr(162) ? 'side' : 'worried';
const mouthAt = (t) => t < dr(60) || t >= dr(93) ? 'line' : 'neutral';

// The blob's startle and flinch: spring()'s own damping (k 6, w 18) in cosine phase, so the kick peaks on the beat frame.
const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const [furn, props] = await Promise.all(['marston_furniture_sheet', 'study_props_sheet'].map((n) => assets.load(n)));
  const boiling = [];
  const sheet = (opts, parent = scene) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  // An asset piece in a holder whose origin is the centre of the piece's visible shape, so the spec's boxes place it.
  const cut = (a, name, { weight, res = 512, parent = scene } = {}) => {
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${name}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };   // lying on the desk: local +y runs away from camera
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // ---------- set ----------
  // marston_window_wall: navy cardstock x −0.65…0.65, y −0.034…0.36, six window holes torn through it.
  const WALL = [1.3, 0.394], PX = 2048 / WALL[0], WINDOWS = [-0.51, -0.31, -0.11, 0.09, 0.29, 0.49];
  const wallArt = Object.assign(document.createElement('canvas'), { width: 2048, height: Math.round(WALL[1] * PX) });
  { const g = wallArt.getContext('2d'); g.fillStyle = PALETTE.navy; g.fillRect(0, 0, wallArt.width, wallArt.height);
    for (const cx of WINDOWS) g.clearRect((cx - 0.05 + 0.65) * PX, (0.36 - 0.300) * PX, 0.10 * PX, (0.300 - 0.066) * PX); }
  sheet({ art: wallArt, size: WALL, key: `${ID}-marston_window_wall`, res: 2048 }).position.set(0, (0.36 - 0.034) / 2, 0);
  const paneCol = '#' + C('navy').lerp(C('ink'), 0.35).getHexString();
  for (const cx of WINDOWS) {   // window_tissue: unlit night; casts nothing so later light can pass
    const m = sheet({ path: RECT, color: paneCol, weight: 'tissue', size: [0.11, 0.245], key: `${ID}-pane${cx}`, res: 256 });
    m.position.set(cx, 0.183, -0.001); m.castShadow = false;
  }
  flat(sheet({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [0.8, 0.45], key: `${ID}-marston_floor`, res: 512 }))
    .position.set(0, -0.034, 0.225);
  flat(cut(furn, 'desk_top', { weight: 'kraft', res: 1024 })).position.set(0.0585, 0, 0.075);   // x −0.033…0.150, z 0.030…0.120
  cut(furn, 'desk_apron', { weight: 'kraft', res: 1024 }).position.set(0.0585, -0.017, 0.120);
  cut(furn, 'chair', { weight: 'kraft' }).position.set(-0.076, -0.034 + 0.025, 0.071);           // feet on the floor
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, 0.060);                                  // closed, lid down
  cut(props, 'laptop_lid').position.set(-0.0075, 0.0045, 0.0601);

  // ---------- props he handles ----------
  // exam_page lying flat, x −0.033…−0.008, z 0.080…0.110, plus an ink layer: glyph problem lines (proxy only; frozen
  // art carries its own) and the name squiggle, drawn up to the pen's progress.
  const page = flat(cut(props, 'exam_page', { res: 1024 })); page.position.set(-0.0205, 0.0003, 0.095);
  const INK = Object.assign(document.createElement('canvas'), { width: 500, height: 600 });   // 0.025 × 0.030 m
  const inkTex = new THREE.CanvasTexture(INK); inkTex.colorSpace = THREE.SRGBColorSpace;
  const inkPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.030),
    new THREE.MeshLambertMaterial({ map: inkTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  flat(inkPlane).position.set(-0.0205, 0.00035, 0.095); inkPlane.receiveShadow = true; scene.add(inkPlane);
  const rng = mulberry32(seedOf(ID, 'ink'));
  const vOf = (z) => (z - 0.080) / 0.030 * 600;   // canvas row of a world z on the page
  const glyphs = props.proxy ? [0.093, 0.100, 0.107].map((z) => {   // problem lines: a number glyph, then a wavy rule
    const pts = []; for (let u = 0.3; u <= 0.88; u += 0.02) pts.push([u * 500, vOf(z) + (rng() - 0.5) * 6]);
    return { y: vOf(z), x: 0.12 * 500, pts };
  }) : [];
  const NAME = []; for (let i = 0; i <= 90; i++) {   // name squiggle, page u 0.15–0.60 on the name line (z 0.086): illegible loops
    const u = 0.15 + 0.45 * i / 90, ph = i * 0.55;
    NAME.push([u * 500 + 6 * Math.sin(ph * 1.3), vOf(0.086) - 9 * Math.sin(ph) * (0.6 + 0.4 * Math.sin(i * 0.21)) + (rng() - 0.5) * 2]);
  }
  let drawnTo = -1;
  const drawInk = (k) => {   // k: 0..1 of the name drawn; redraws only when it changes, so the canvas is a function of k
    const n = Math.round(k * (NAME.length - 1));
    if (n === drawnTo) return; drawnTo = n;
    const g = INK.getContext('2d'); g.clearRect(0, 0, 500, 600); g.lineCap = g.lineJoin = 'round';
    g.strokeStyle = '#' + C('navy').lerp(C('cream'), 0.25).getHexString(); g.lineWidth = 4;
    for (const l of glyphs) {
      g.beginPath(); g.arc(l.x, l.y, 9, 0.3, 5.9); g.stroke();
      g.beginPath(); l.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    }
    if (n > 0) { g.strokeStyle = PALETTE.ink; g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= n; i++) g[i ? 'lineTo' : 'moveTo'](...NAME[i]); g.stroke(); }
    inkTex.needsUpdate = true;
  };

  // phone: 0.015 × 0.008 lying flat, long side along x. Face up (glyph screen) at rest; flips about its long axis.
  const phone = new THREE.Group(); phone.position.set(...UNIT.phone); scene.add(phone);
  flat(cut(props, 'phone_face', { parent: phone })).position.y = 0.0004;
  const back = cut(props, 'phone_back', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004;
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;   // glyph bars, no text
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0064), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);

  // pen + cap: the pen holder's origin is its tip (+x end) so it can hang off the fingertip.
  const pen = new THREE.Group(); scene.add(pen);
  cut(props, 'pen', { parent: pen }).position.x = -0.006;
  const cap = new THREE.Group(); scene.add(cap); cut(props, 'pen_cap', { parent: cap });

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
  scene.add(hero.group);
  const exam = createBlob({ radius: BLOB_R, seed: 1 });
  exam.stain.position.set(UNIT.blob[0], 0.0004, UNIT.blob[2]);
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  const BLOB_C = V(UNIT.blob);
  const phoneSpot = phoneLight({ angle: 0.9, penumbra: 0.4, intensity: PHONE_I });
  phoneSpot.position.copy(V(UNIT.phoneLight));
  scene.add(phoneSpot, phoneSpot.target);
  aim(phoneSpot, BLOB_C);   // along phone → blob, i.e. at its wall hit
  const nearFix = (spot) => { spot.shadow.camera.near = 0.004; spot.shadow.camera.updateProjectionMatrix(); };   // README §11
  nearFix(phoneSpot);
  // Character fill (README §10, which also covers §4's face fill): shadowless, in front of him just above eye line, short
  // range so it never reaches the wall. Cool under the phone, the fluorescent tone under the zone.
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.07, 2);
  fill.castShadow = false; fill.position.set(...UNIT.fill); scene.add(fill);
  const FILL = { phone: C('phone').lerp(C('navy'), 0.35), zone: C('cream').lerp(C('gator'), 0.15) };   // README §6 tone

  // His desk zone (README §3): dead until the press, then the shared wake. The trough hangs above frame in A and B.
  const zone = sensorLight({ at: UNIT.tube, aimAt: [UNIT.blob[0], 0, UNIT.blob[2]], intensity: ZONE_I });
  scene.add(zone.group, zone.light, zone.light.target);

  const tubes = fluorescent({ intensity: FLUOR_I });   // flicker amplitude 0: its update() is never called
  scene.add(tubes.light);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  const FOCUS = V(UNIT.focus), look = new THREE.Vector3(), dir = new THREE.Vector3();
  const fx = post({ focus: 0.3, aperture: UNIT.aperture, maxblur: UNIT.maxblur, lut: 'marston' });

  const hand = new THREE.Vector3(), far = new THREE.Vector3(), capOff = new THREE.Vector3();
  let lastSeed = null;

  function update(t) {
    const tc = on2s(t), seed = boilSeed(t, 10);
    if (seed !== lastSeed) { lastSeed = seed; for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed })); }

    // camera: Camera A locked to 5.0, eased push to Camera B by 10.0, locked after (on 1s)
    const k = ease((t - 5) / 5), { camA: A, camB: B } = UNIT;
    camera.position.set(...A.pos.map((v, i) => v + (B.pos[i] - v) * k));
    camera.lookAt(look.set(...A.look.map((v, i) => v + (B.look[i] - v) * k)));
    camera.getWorldDirection(dir);
    const level = zone.update(t, { wake: UNIT.press }), lit = level >= 0.5;   // on 1s; README §4's outshone switch
    fx.set({ focus: dir.dot(FOCUS.clone().sub(camera.position)), lut: lit ? 'amber' : 'marston' });

    // gator
    hero.boil(t, 10);
    hero.blend(P, BODY, tc + 1e-6);
    hero.pose({ head: kf(tc, HEAD) * D });
    hero.face({ eyes: eyesAt(t + 1e-6), mouth: mouthAt(t + 1e-6) });
    hero.group.position.y = UNIT.hip[1] - (tc >= dr(146) ? 0.001 : 0);   // the exhale's shoulder drop
    hero.group.updateMatrixWorld(true);
    hero.hand.getWorldPosition(hand); hero.hands.arm_l.getWorldPosition(far);

    // phone: flat to 7.25, on edge at 7.333, face-down from 7.417 (phoneFaceDown)
    const flip = tc >= dr(89) ? Math.PI : tc >= dr(88) ? Math.PI / 2 : 0;
    phone.rotation.x = flip;
    phone.position.y = UNIT.phone[1] + 0.0025 * Math.sin(flip);

    // pen and cap
    const pressing = tc >= dr(6) && tc < dr(14), held = tc >= dr(5) && tc < dr(14);   // K5 grab to the 1.167 let-go
    const lying = !held && tc < dr(92), levelPen = tc >= dr(93) && tc < dr(97);
    if (lying) {   // on the page's front edge, x −0.028…−0.016
      pen.position.set(-0.016, 0.0006, 0.106); pen.rotation.set(-Math.PI / 2, 0, 0);
    } else if (held && !pressing) {   // K5: on the fingertip, still lying flat (the flat-puppet cheat)
      pen.position.set(hand.x + 0.006, 0.0006, 0.0868); pen.rotation.set(-Math.PI / 2, 0, 0);
    } else if (pressing) {   // K6–1.0: tipped up 45° on the fingertip, the capped point on the name line
      pen.position.set(hand.x, 0.0003, 0.0868); pen.rotation.set(0, 0, -Math.PI / 4);
    } else {       // tip on the fingertip: level for the uncap, else 45° down-forward; touching y 0 while writing
      pen.rotation.set(0, 0, levelPen ? 0 : -Math.PI / 4);
      const writing = tc >= dr(106) && tc < dr(120), bob = writing ? (Math.round(tc * 12) % 2) * 0.0005 : 0;
      pen.position.set(hand.x + (levelPen ? 0.006 : 0), writing ? 0.0002 + bob : hand.y + 0.0003, 0.0868);
    }
    if (tc < dr(96)) {   // on the pen's tip end until the uncap
      cap.rotation.copy(pen.rotation);
      cap.position.copy(pen.position).add(capOff.set(-0.002, 0, 0).applyEuler(pen.rotation)).add(capOff.set(0, 0.0002, 0.0002));
    } else if (tc < dr(100)) {   // 8.0: jerked off in the far hand, then set down by 8.333
      const s = clamp((tc - dr(96)) / (dr(100) - dr(96)));
      cap.rotation.set(0, 0, 0);
      cap.position.set(far.x + (-0.030 - far.x) * s, far.y + (0.001 - far.y) * s, 0.0868 + (0.100 - 0.0868) * s);
    } else { cap.position.set(-0.030, 0.0008, 0.100); cap.rotation.set(-Math.PI / 2, 0, 0); }
    drawInk(clamp((tc - dr(105)) * 12 / 14));   // drawings 106–119

    // blob (on 2s)
    exam.update(t, {
      wobble: tc < UNIT.press ? 1.4 : tc >= 5 && tc < 7 ? 0 : 1,
      squash: kick(tc, UNIT.press, 0.3) + kick(tc, 10, 0.35),
      eyes: (tc >= dr(21) && tc < dr(23)) || (tc >= dr(138) && tc < dr(139)) ? 'closed' : tc >= 3.5 && tc < 7 ? 'side' : 'open',
      look: -1, key: lit ? zone.light : phoneSpot,   // README §11: the face fill sits near the blob
    });
    exam.mesh.scale.set(1, tc >= 5 && tc < 7 ? 1 + 0.03 * Math.sin(2 * Math.PI * (tc - 5) / 1.6) : 1, 1);   // breathing
    exam.mesh.rotation.z = kf(tc, [[3.5, 0], [dr(44), 10], [4.5, 10], [dr(58), 0]]) * D;                   // tilts toward him
    exam.mesh.position.set(UNIT.blob[0] + kick(tc, 10, 0.002), Math.abs(tc - dr(45)) < 1e-6 ? 0.001 : 0, UNIT.blob[2]);

    // light: phone is the key until the wake; out-shone on every frame the zone is ≥ 0.5, so the loom flashes back on the
    // stutter's dark frames; off once the screen is face-down (7.417).
    phoneSpot.intensity = PHONE_I * (t >= dr(89) ? 0 : lit ? PHONE_OUTSHONE : 1);
    fill.color.copy(lit ? FILL.zone : FILL.phone); fill.intensity = lit ? FILL_ZONE : FILL_PHONE;
    screen.material.color.setScalar(t < UNIT.press ? 1 : 0.6);
  }

  // For evidence/anim-s15/measure.html: the world points the acceptance checks project.
  const probe = () => ({
    hand: hand.toArray(), head: hero.meshes.head.getWorldPosition(new THREE.Vector3()).toArray(), pen: pen.getWorldPosition(new THREE.Vector3()).toArray(),
    wallScale: shadowScale(phoneSpot.position, BLOB_C, 0),
    poolScale: zone.light.position.y / (zone.light.position.y - BLOB_R),
    joints: Object.fromEntries(Object.entries(hero.joints).map(([n, j]) => [n, j.rotation.z])),
  });
  return { update, probe };
}
