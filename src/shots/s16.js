// @ts-check
// s16 · Practice (docs/shots/s16.md, v4). 16 s on the v4 timeline: five solves from 2.5× (Q16), no neighbor wake, no
// laptop, no stand. Picks up on s15's last frame: s11's desk set (marstonDesk) and, mirrored at x' = 0.350 − x, a second
// one for the neighbor (the Drinks gator from s13), who is working under their own lit pendant from the first frame.
// Cuts: B′ (0–0.5, the brace) · P (0.5–6.5, problem 1 written on the practice sheet, the cross-out 4.6, the check) ·
// B′ (6.5–9.0, "that was it?") · D (9.0–9.5) · P2 (9.5–11.5, problem 2) · D (11.5–16, the time-lapse). Five cuts.
// The blob shrinks one step per solved problem, on the solve's drawing (README §1's SHRINK): 2.5 → 1.75 → 1 → 0.75 →
// 0.58 → 0.42. Both pendants are constant warm spots (no sensors). Only the blob casts. Characters on 2s; light and
// camera at 24.
import * as THREE from 'three';
import { sensorLight, fluorescent, ambient } from '../lights.js';
import { kf, clamp } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator } from '../characters/gator.js';
import { makeCrowd } from '../characters/crowd.js';
import { BLOB_R as OTHER_R } from '../characters/exam.js';
import { POSES, specPose } from '../characters/poses.js';
import { act } from '../characters/acting.js';
import { SHOTS } from '../timeline.js';
import { UNIT, BLOB_AT, PHONE, PAGE, CAM_B2, practiceSheet, SHEET_INK, penLine } from './s15.js';
import { kitTools, marstonDesk, mppOf, idle, castOnly } from './s11.js';

const ID = 's16', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;
const dr = (n) => n / 12;
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;   // core onTwos can land on the previous drawing (float error)

// ---------- tunables (the final pass changes these, not the staging) ----------
// The meter (README §1): SHRINK[0..5], the v4 ladder from the 2.5× peak.
const BLOB_R = { start: 0.030, problemOneSolved: 0.021, problemSolved2: 0.012, problemSolved3: 0.009, problemSolved4: 0.007,
  problemSolved5: 0.005 };
const STEPS = ['problemOneSolved', 'problemSolved2', 'problemSolved3', 'problemSolved4', 'problemSolved5'];
const SOLVES = STEPS.map((k) => B[k]);                 // 6.5, 11.5, 13, 14, 15
const radiusAfter = (n) => (n ? BLOB_R[STEPS[n - 1]] : BLOB_R.start);
// Marston mark (s15's, BLOB_DX included) while bigger than 1×; the old page-corner mark from 1× (#2) on (README §1)
const markOf = (r) => (r > 0.012 + 1e-9 ? BLOB_AT(r) : [0, 0, 0.098]);
const FLIPS = [9, 14.5];                               // page to the stack
const CUTS = { P: [0.5, B.problemOneSolved], P2: [9.5, B.problemSolved2], D: 9 };
const CAM_D = /** @type {CamKey} */ ({ pos: [0.168, 0.230, 1.010], look: [0.168, 0.040, 0.080], focus: [0.168, 0.020, 0.086] });
// Camera P: straight down on the page from 0.075 (README §8), centred on the written lines (sheet rows 38–298)
const CAM_P = /** @type {CamKey} */ ({ pos: [-0.0205, 0.0753, 0.0934], look: [-0.0205, 0.0003, 0.0934] });
const WARM = 0.3;                                      // v4 Marston warm: lerp(lamp, cream, 0.3) (README v4)
// The pendant per camera: B′ at s15's exposure (so the cut in matches), the page inserts inside the pool's core at G4's
// 0.8 × 0.18 (or the page clips), the wide D in between. Same light; an exposure change per setup.
const ZONE_I = { B: 0.25, P: 0.8 * 0.18, D: 0.5 };
const FLUOR_I = 0.25, AMB_K = 0.6, FILL_I = 0.02;
const FILL_OFF = [0.029, 0.040, 0.114];                // character fill: x off the hip, then world y, z (s15's (−0.046, 0.040, 0.114))
const MIR = 0.350;                                     // neighbor unit: x' = MIR − x
const N = { hip: [0.425, -0.012], blob: [0.350, OTHER_R.neighbor, 0.098], phone: /** @type {Vec3} */ ([0.360, 0.0015, 0.114]) };
const VIEW_GLOW = [0.3, 0.45];
const INSERT_TINT = /** @type {Vec3} */ ([0.62, 0.85, 0.9]);
const INSERT_ARM = [0.030, -35, -0.006, 0.0014, 0.0022];   // the insert's sleeve: reach (m), turn (deg), hand behind the nib (m), arm height, pen height (m)

// ---------- the hero ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
const P = { ...POSES, line1: seat({ lean: 14, arm: -21 }), antic: seat({ lean: 10, arm: -21 }),
  still: seat({ lean: 18, arm: -22 }) };               // 6.5: the brace with the pen lifted 2 mm
// The montage (v4): pops on a 0.5 s grid, each pose held 6 drawings. 9.5–11.5 is the P2 insert (he's off screen).
/** @type {[number, string][]} */
const POPS = [[9, 'flip'], [9.5, 'write_a'], [10, 'write_b'], [10.5, 'write_c'], [11, 'write_a'],
  [11.5, 'solve'], [12, 'write_c'], [12.5, 'write_a'], [13, 'solve'], [13.5, 'write_b'], [14, 'solve'], [14.5, 'flip'],
  [15, 'solve'], [15.5, 'write_a']];
/** @param {[number, string][]} pops @returns {[number, string][]} */
const held = (pops) => pops.flatMap(([t, n], i) => (i + 1 < pops.length ? [[t, n], [pops[i + 1][0] - dr(1), n]] : [[t, n]]));   // pop, hold, pop
const BODY = [[0, 'line1'], [dr(1), 'line1'], [dr(2), 'antic'], [dr(3), 'brace'], [6.5, 'brace'], [6.5 + 1e-3, 'still'], [9 - dr(1), 'still'], ...held(POPS)];
const popAt = (tc) => (tc < 9 ? null : POPS.findLast(([t]) => tc >= t - 1e-6)?.[1]);
const isWrite = (n) => !!n?.startsWith('write');
// Head on body (deg): s15 ends at −4; the brace 4 more; 7.167 another −4; montage −8, think +6
const headAt = (tc) => (tc < 9 ? kf(tc, [[0, -4], [dr(2), -4], [dr(3), -8], [dr(85), -8], [dr(86), -12]]) : -8);
// The acting kit carries brows, breath and the anticipations; the eyes and mouth follow the spec's own table on top.
/** @type {[number, string][]} */
const CUES = [[-0.1, 'resolve'], [7.0, 'pride'], [9.0, 'neutral']];
const eyesAt = (tc) => (tc < 7 ? 'worried' : tc < 8 ? 'gasp' : tc < 9 ? 'side' : 'open');
const mouthAt = (tc) => { const p = popAt(tc);
  if (tc < 9) return tc < dr(88) ? 'line' : tc < 8.5 ? 'o' : 'smile';
  return p === 'solve' || tc >= SOLVES[2] - 1e-6 ? 'smile' : 'line'; };

// ---------- the neighbor (crowd_sheet, mirrored to face −x), working from the first frame ----------
const NP = { ...POSES, n_write2: specPose({ lean: 16, arm: -22, far: null, head: -12 }) };
const NPOPS = /** @type {[number, string][]} */ ([[0, 'crowd_write'], ...Array.from({ length: 14 }, (_, i) => [9 + 0.5 * i, i % 2 ? 'crowd_write' : 'n_write2'])]);

const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));   // s15's: peaks on the beat

// ---------- the pages ----------
// Problem 1 in P (practice_1, sheet pixels): line a 0.5–3.1, line b 3.1–4.1, the pause and the tap (4.333), the strike
// on crossOut (two drawings), line c 4.75–6.1, the check 6.167 / 6.333. Code strokes: the two '+' bars under the painted
// strike (until it lands) and the check. Problem 2 in P2 (practice_2): one part per pop. The time-lapse writes scribble
// lines on page 2 (below the problem) and on a blank page 3, each whole on its pop, with a check on each solve.
const I1 = SHEET_INK.practice_1, I2 = SHEET_INK.practice_2;
const CHECK1 = [[216, 284], [223, 293], [240, 270]], CHECK2 = [[154, 266], [160, 274], [176, 252]];
const UNDER2 = [[34, 284], [143, 283]];
const A = [0.5, 3.1], LB = [3.1, 4.1], TAP = dr(52), LC = [4.75, 6.1], CHK = [dr(74), dr(76)];
const both = (box, f) => [[box, 0, f], [box, 1, f]];
const span = (tc, a, b) => clamp((tc - a) / (b - a));
function page1(tc, t) {
  const fb = span(tc, ...LB), strike = t >= B.crossOut ? (t >= B.crossOut + dr(1) ? 1 : 0.5) : 0;
  return {
    spans: [...both(I1.name, 1), ...both(I1.problem, 1), ...both(I1.a, span(tc, ...A)), ...(strike ? [[I1.b, 0, 1], [I1.b, 1, strike]] : [[I1.b, 2, fb]]),
      ...both(I1.c, span(tc, ...LC))],
    extra: (g, K) => {
      if (strike < 1) for (const x of I1.plus) {   // the '+' bars the painted strike covers, drawn as the pen passes them
        const f = clamp(((I1.b[0] + (I1.b[2] - I1.b[0]) * fb) - (x - 7)) / 14);
        penLine(g, K, [[x - 7, I1.plusY], [x + 7, I1.plusY]], f, 2.4);
      }
      penLine(g, K, CHECK1.slice(0, 2), tc >= CHK[0] - 1e-6 ? 1 : 0);
      penLine(g, K, CHECK1.slice(1), tc >= CHK[1] - 1e-6 ? 1 : 0);
    },
  };
}
// the pen tip in P, in sheet pixels: along the line being written, over the '+' in the pause, along the strike and check
function tip1(tc, t) {
  /** @param {number[]} box @param {number} f */
  const along = ([x0, , x1, y1], f) => [x0 + (x1 - x0) * f, y1 - 4];
  if (tc < A[0]) return [I1.a[0], I1.a[3] - 4];
  if (tc < A[1]) return along(I1.a, span(tc, ...A));
  if (tc < LB[1]) return along(I1.b, span(tc, ...LB));
  if (t < B.crossOut) return [I1.plus[0], I1.plusY - (Math.abs(tc - TAP) < 0.05 ? 0 : 2)];
  if (tc < LC[0]) return [I1.strike[0] + (I1.strike[2] - I1.strike[0]) * (t >= B.crossOut + dr(1) ? 1 : 0.5), 240];
  if (tc < LC[1]) return along(I1.c, span(tc, ...LC));
  return tc < CHK[1] ? CHECK1[1] : CHECK1[2];
}
// Time-lapse: [t, row] scribble lines, each whole on its pop; [t, row] checks after a line that ends a problem.
const LAPSE = {
  2: { lines: [[12, 305], [12.5, 335]], checks: [[13, 335]] },
  3: { lines: [[13.5, 70], [15, 110], [15.5, 150]], checks: [[14, 70], [15, 110]] },
};
const P2_AT = [[9.5, 'frac'], [10, 'arrow'], [10.5, 'word'], [10.75, 'under'], [11, 'check']];
function page2(tc) {
  const at = (x) => (tc >= x - 1e-6 ? 1 : 0), when = Object.fromEntries(P2_AT.map(([x, k]) => [k, x]));
  return {
    spans: [...both(I2.problem, 1), ...both(I2.name, 1), ...both(I2.frac, at(when.frac)), ...both(I2.arrow, at(when.arrow)), ...both(I2.word, at(when.word))],
    extra: (g, K) => {
      penLine(g, K, UNDER2, at(when.under));
      penLine(g, K, CHECK2, at(when.check));
      scribbles(g, K, 2, LAPSE[2], tc);
    },
  };
}
const scribRng = mulberry32(seedOf(ID, 'scribbles'));
const SCRIB = Array.from({ length: 24 }, () => Array.from({ length: 40 }, () => scribRng()));   // fixed jitter per line
const lineEnd = (page, i) => 60 + 140 * (0.6 + 0.4 * SCRIB[(page * 8 + i) % SCRIB.length][0]);
function scribbles(g, K, page, { lines, checks }, tc) {
  lines.forEach(([t, row], i) => {
    if (tc < t - 1e-6) return;
    const j = SCRIB[(page * 8 + i) % SCRIB.length], x1 = lineEnd(page, i);
    g.strokeStyle = 'rgb(30,42,63)'; g.lineWidth = 2.2 * K; g.beginPath();
    for (let k = 0; k < 40; k++) {
      const x = 34 + (x1 - 34) * k / 39, y = row - 5 * Math.abs(Math.sin(k * 1.1 + j[1] * 6)) - 2 * j[k % 40];
      g[k ? 'lineTo' : 'moveTo'](x * K, y * K);
    }
    g.stroke();
  });
  for (const [t, row] of checks) {
    if (tc < t - 1e-6) continue;
    const x1 = lineEnd(page, lines.findIndex(([, r]) => r === row));
    penLine(g, K, [[x1 + 12, row - 6], [x1 + 17, row], [x1 + 30, row - 14]]);
  }
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const tools = kitTools(ID), { sheet, boil, art } = tools;
  const { pendant, viewMat } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  // The neighbor's unit: marstonDesk again, mirrored. Its room (wall, windows, sky, view, carpet) and its cubicle panel
  // are the hero's, so they're hidden: everything at the wall (z < 0.03), the flat floor, and the panel at x 0.150.
  const nRoom = new THREE.Group(); nRoom.position.x = MIR; nRoom.scale.x = -1; scene.add(nRoom);
  const { pendant: nPendant } = await marstonDesk({ scene: nRoom, assets, PALETTE, tools, ID: `${ID}-nbr` });
  for (const c of nRoom.children) if (c.position.z < 0.03 || (c.rotation.x < 0 && c.position.y < -0.03) || c.position.x === 0.150) c.visible = false;
  const [props, kitp, gsheet] = await Promise.all(['study_props_sheet', 'props_kit', 'gator_sheet'].map((n) => assets.load(n)));
  /** @param {import('../assets.js').Kit} a @param {string} name @param {{ weight?: string, res?: number, parent?: THREE.Object3D, key?: string }} [o] */
  const cut = (a, name, { weight, res = 512, parent = scene, key = name } = {}) => {   // s15's: origin at the visible centre
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${key}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };

  // ---------- the hero's desk ----------
  { const b = cut(props, 'backpack_side'); b.position.set(-0.145, -0.034 + 0.02, 0.028); }
  const phone = new THREE.Group(); phone.position.set(...PHONE); phone.rotation.x = Math.PI; scene.add(phone);   // face-down since s11
  { const back = cut(kitp, 'phone_face_down', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }
  const pen = new THREE.Group(); scene.add(pen);   // origin at the tip; the painted pen points −x, so it's mirrored
  { const p = cut(kitp, 'pen', { parent: pen }); p.position.x = -0.006; p.scale.x = -1; }
  { const c = flat(cut(kitp, 'pen_cap')); c.scale.x = -1; c.position.set(-0.030, 0.0008, 0.100); }   // where s15 set it down
  // the pages: problem 1's sheet, problem 2's, then a blank sheet for the time-lapse; the finished stack beside the page
  const pages = [
    practiceSheet({ props: kitp, sheet, which: 'practice_1', at: PAGE, key: `${ID}-page1`, parent: scene, heal: I1.heal }),
    practiceSheet({ props: kitp, sheet, which: 'practice_2', at: PAGE, key: `${ID}-page2`, parent: scene }),
    practiceSheet({ props: kitp, sheet, which: 'blank_page', at: PAGE, key: `${ID}-page3`, parent: scene }),
  ];
  const stack = FLIPS.map((_, i) => {
    const g = flat(cut(kitp, 'blank_page', { key: `stack${i}` }));
    g.position.set(0.0275, 0.0003 + 0.0004 * (i + 1), 0.050); g.rotation.z = [-2, 3][i] * D; return g;
  });

  // ---------- the neighbor's desk (mirrored positions): their page, phone face-down, three energy drinks ----------
  flat(cut(kitp, 'blank_page', { key: 'nbr-page' })).position.set(MIR - PAGE[0], PAGE[1], PAGE[2]);
  const nPhoneG = new THREE.Group(); nPhoneG.position.set(...N.phone); nPhoneG.rotation.x = Math.PI; scene.add(nPhoneG);
  { const back = cut(kitp, 'phone_face_down', { parent: nPhoneG, key: 'nbr-phone-back' }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }
  const [, v0, , v1] = props.visible.energy_drink, ch = props.sizes.energy_drink[1] * (v1 - v0);
  [[0.245, 0.090, -4], [0.262, 0.0975, 0], [0.280, 0.105, 6]].forEach(([x, z, a], i) => {
    const g = cut(props, 'energy_drink', { key: `can${i}` }); g.position.set(x, ch / 2, z); g.rotation.z = a * D;
  });

  // ---------- the insert hand (P, P2): his sleeve and hand (gator_sheet arm_r) and the pen, lying flat on the page ----------
  // From above the side-view rig is edge-on, so the inserts get their own flat cutouts. Origin at the pen's tip; the pen
  // runs back toward him (−x) and toward the wall (−z), INSERT_ARM's turn off the lines; the hand holds it 8 mm up.
  const ihand = new THREE.Group(); ihand.rotation.y = INSERT_ARM[1] * D; scene.add(ihand);
  { const ip = art(kitp.pieces.pen, 'insert-pen', { mpp: mppOf(kitp, 'pen'), sx: -1, anchor: [6, kitp.pieces.pen.height / 2], parent: ihand });
    ip.rotation.x = -Math.PI / 2; ip.position.y = INSERT_ARM[4]; }   // the pen over the hand, so the hand reads as gripping it
  { const arm = gsheet.pieces.arm_r, ia = art(arm, 'insert-arm', { mpp: INSERT_ARM[0] / arm.width, anchor: [arm.width - 10, arm.height / 2], parent: ihand });
    ia.rotation.x = -Math.PI / 2; ia.position.set(INSERT_ARM[2], INSERT_ARM[3], 0.0004);
    /** @type {THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>} */ (ia.children[0]).material.color.setRGB(...INSERT_TINT); }   // the amber grade and the pool's glare turned the felt lime; this pulls it back to gator green

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ); scene.add(hero.group);
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });   // s15's blob
  scene.add(exam.mesh, exam.stain);

  const nbr = await makeCrowd({ assets }, 'neighbor', { seed: 16 });
  nbr.group.position.set(N.hip[0], N.hip[1], UNIT.bodyZ); nbr.group.scale.x = -1; scene.add(nbr.group);
  const nBlob = createBlob({ radius: OTHER_R.neighbor, seed: 13 });
  nBlob.mesh.position.set(N.blob[0], 0, N.blob[2]); nBlob.stain.position.set(N.blob[0], 0.0004, N.blob[2]);
  scene.add(nBlob.mesh, nBlob.stain);
  castOnly(scene, [exam.mesh, nBlob.mesh]);                 // only the blobs cast (README v4)

  // ---------- light: each desk's pendant, from above, constant ----------
  const warm = C('lamp').lerp(C('cream'), WARM);
  const zone = sensorLight({ at: UNIT.tube, aimAt: [0, 0, 0.098], intensity: ZONE_I.B });
  const nZone = sensorLight({ at: [MIR, 0.127, 0.040], aimAt: [MIR, 0, 0.098], intensity: ZONE_I.D });
  for (const z of [zone, nZone]) { z.light.color.copy(warm); z.light.shadow.mapSize.set(2048, 2048); scene.add(z.light, z.light.target); }
  pendant(1); nPendant(1);
  const fill = new THREE.PointLight(warm, FILL_I, 0.07, 2); scene.add(fill);   // README §10
  const nFill = new THREE.PointLight(warm, FILL_I, 0.07, 2);  // the hero's fill, mirrored
  nFill.position.set(MIR + 0.046, 0.040, 0.114); scene.add(nFill);
  const tubes = fluorescent({ intensity: FLUOR_I }); tubes.light.castShadow = false; scene.add(tubes.light);   // flicker 0: update() never called
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  const look = new THREE.Vector3(), dir = new THREE.Vector3(), focus = new THREE.Vector3(), hand = new THREE.Vector3(), w = new THREE.Vector3();
  const fx = post({ focus: 0.3, aperture: UNIT.aperture, maxblur: UNIT.maxblur, lut: 'amber' });

  function update(t) {
    const tc = on2s(t);
    boil(t, 10);
    const inP = t >= CUTS.P[0] && t < CUTS.P[1], inP2 = t >= CUTS.P2[0] && t < CUTS.P2[1], insert = inP || inP2;
    const camD = t >= CUTS.D && !inP2;

    // camera: B′ / P / B′ / D / P2 / D, each locked
    const cam = insert ? { ...CAM_P, focus: CAM_P.look } : camD ? CAM_D : { ...CAM_B2, focus: UNIT.focus };
    camera.up.set(0, insert ? 0 : 1, insert ? -1 : 0);
    camera.position.set(...cam.pos); camera.lookAt(look.set(...cam.look)); camera.getWorldDirection(dir);
    fx.set({ focus: dir.dot(focus.set(...cam.focus).sub(camera.position)) });

    // hero: seated at s15's hip; hidden in the inserts
    const pop = popAt(tc);
    hero.group.visible = !insert;
    hero.boil(t, 10);
    hero.blend(P, BODY, tc + 1e-6);
    hero.pose({ head: headAt(tc) * D });
    const f = act(hero, t, CUES, { slump: 0, tilt: 0, breath: tc < 6.5 ? 30 : 6, seed: 16 });
    if (f.eyes !== 'closed') hero.face({ eyes: eyesAt(tc), mouth: mouthAt(tc) });
    hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
    hero.group.updateMatrixWorld(true);
    hero.hand.getWorldPosition(hand);
    fill.position.set(hero.group.position.x + FILL_OFF[0], FILL_OFF[1], FILL_OFF[2]);

    // the pages: which one is in front of him, what's on it, the finished stack
    const flips = FLIPS.filter((x) => tc >= x - 1e-6).length;
    pages.forEach((p, i) => { p.holder.visible = i === flips; });
    stack.forEach((s, i) => { s.visible = flips > i; });
    if (flips === 0) { const p = page1(tc, t); pages[0].draw(p.spans, p.extra, 'p1' + tc.toFixed(3)); }
    else if (flips === 1) { const p = page2(tc); pages[1].draw(p.spans, p.extra, 'p2' + tc.toFixed(2)); }
    else pages[2].draw([], (g, K) => scribbles(g, K, 3, LAPSE[3], tc), 'p3' + tc.toFixed(2));

    // the insert hand: the pen tip on the line being written (P), or on each new part as it pops (P2)
    ihand.visible = insert;
    if (insert) {
      const pg = inP ? pages[0] : pages[1];
      pg.holder.updateMatrixWorld(true);
      const [sx, sy] = inP ? tip1(tc, t) : tc < 10 ? [I2.frac[2], I2.frac[3] - 4] : tc < 10.5 ? [I2.arrow[2], I2.arrow[3] - 4]
        : tc < 10.75 ? [I2.word[2], I2.word[3] - 4] : tc < 11 ? UNDER2[1] : CHECK2[2];
      pg.toWorld(sx, sy, w);
      ihand.position.set(w.x, w.y, w.z);
    }

    // side-view pen: tip on the fingertip at 45° (s15). Writing in D, the tip sits 2/4/6 mm up so it lands on a page line
    // (s15's flat-puppet cheat); lifted on solves, flips and 6.5–9.0.
    pen.visible = !insert;
    const line = Math.floor(2 * tc) % 3, lifted = pop === 'solve' || pop === 'flip' || (tc >= 6.5 && tc < 9);
    pen.rotation.set(0, 0, -Math.PI / 4);
    pen.position.set(hand.x, tc < 0.5 ? 0.002 : isWrite(pop) ? 0.002 * (line + 1) : lifted ? 0.004 : hand.y + 0.0003, 0.0868);

    // the hero's blob: braces with him, shrinks one step per solve with its contact on the mark for its size, watches him
    const solved = SOLVES.filter((s) => tc >= s - 1e-6).length, r = radiusAfter(solved), M = markOf(r);
    const s = r / BLOB_R.start, t0 = SOLVES[solved - 1];
    exam.mesh.visible = exam.stain.visible = !insert;
    exam.mesh.scale.setScalar(s); exam.stain.scale.setScalar(s);
    exam.mesh.position.set(M[0], 0, M[2]); exam.stain.position.set(M[0], 0.0004, M[2]);
    const braced = tc >= dr(2) && tc < 6.5;
    exam.update(t, {
      key: zone.light,
      wobble: braced ? 0.3 : 1,
      squash: braced ? 0.25 : t0 === undefined ? 0 : kick(tc, t0, 0.3),
      eyes: tc >= 15.5 || (tc >= dr(3) && tc < 6.75) ? 'closed' : 'open',
      look: -1,
    });
    const watching = (tc >= 8 && tc < 9) || (tc >= 9 && t0 !== undefined && tc - t0 >= 0.25 - 1e-6 && tc < 15.5);
    exam.mesh.rotation.z = (watching ? 10 : 0) * D;   // tilted toward him; upright for each squash

    // light (on 1s): both pendants constant; the exposure per setup
    zone.light.intensity = insert ? ZONE_I.P : camD ? ZONE_I.D : ZONE_I.B;
    nZone.light.intensity = ZONE_I.D;

    // the neighbor: working, popping between two write poses on the montage grid
    nbr.boil(t, 10);
    nbr.blend(NP, held(NPOPS), tc + 1e-6);
    idle(nbr, t, { breath: 0.008, sway: 0, phase: 0.37 });
    nBlob.update(t, { key: nZone.light, wobble: 0.5, eyes: 'open', look: 1 });

    // window: the night view brightens a little toward pre-dawn over 9–16 (no light reaches the room)
    viewMat.emissiveIntensity = VIEW_GLOW[0] + (VIEW_GLOW[1] - VIEW_GLOW[0]) * clamp((t - 9) / 7);
  }

  return { parts: { exam, nBlob, hero, camera, light: zone.light }, update };
}
