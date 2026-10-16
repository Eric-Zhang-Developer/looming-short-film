// s16 · Practice: problem 1, the crossing-out, the montage, the neighbor's light (docs/shots/s16.md, G4). v2 on the frozen
// Marston kits and props_kit. Picks up on s15's last frame: s11's desk set (marstonDesk) and, mirrored at x' = 0.350 − x,
// a second one for the neighbor, each with its own motion-sensor zone (README §3) shown by its ring pendant.
// Cuts: B′ (0–1, the brace) · P (1–7, problem 1 written on the practice sheet, the cross-out, the check) · B′ (7–10, "that
// was it?") · D (10–11) · P2 (11–13.5, problem 2) · D (13.5–24, the time-lapse, the neighbor's wake at 20.0).
// The blob shrinks one step per solved problem, on the solve's drawing. Characters on 2s; light and camera at 24.
import * as THREE from 'three';
import { phoneLight, sensorLight, fluorescent, ambient, aim } from '../lights.js';
import { kf, clamp } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { makeCrowd } from '../characters/crowd.js';
import { BLOB_R as OTHER_R } from '../characters/exam.js';
import { POSES, specPose } from '../characters/poses.js';
import { SHOTS } from '../timeline.js';
import { UNIT, BLOB_AT, PHONE, PAGE, CAM_B2, practiceSheet, SHEET_INK, penLine } from './s15.js';
import { kitTools, marstonDesk, mppOf, noCast, idle } from './s11.js';

const ID = 's16', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;
const dr = (n) => n / 12;
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;   // core onTwos can land on the previous drawing (float error)

// ---------- tunables (the final pass changes these, not the staging) ----------
// The meter (README §1): SHRINK[0..6]; exam.js has no G4 SHRINK export yet, so the numbers are written here.
const BLOB_R = { start: 0.030, problemOneSolved: 0.024, problemSolved2: 0.018, problemSolved3: 0.012, problemSolved4: 0.009,
  problemSolved5: 0.007, problemSolved6: 0.005 };
const STEPS = ['problemOneSolved', 'problemSolved2', 'problemSolved3', 'problemSolved4', 'problemSolved5', 'problemSolved6'];
const SOLVES = STEPS.map((k) => B[k]);                 // 7, 13.5, 16, 18, 19.5, 21
const radiusAfter = (n) => (n ? BLOB_R[STEPS[n - 1]] : BLOB_R.start);
// Marston mark (s15's, BLOB_DX included) while bigger than 1×; the old page-corner mark from #3 on (README §1)
const markOf = (r) => (r > 0.012 + 1e-9 ? BLOB_AT(r) : [0, 0, 0.098]);
const WAKE = B.sensorWakeNeighbor;                     // 20.0
const FLIPS = [10, 15.5, 21.5];                        // page to the stack
const CUTS = { P: [1, 7], P2: [11, 13.5], D: [10, 24] };
const CAM_D = { pos: [0.168, 0.230, 1.010], look: [0.168, 0.040, 0.080], focus: [0.168, 0.020, 0.086] };
// v3 (v3-fix-marston): the six-step shrink was hard to follow in the wide (blob 2.3 cm wide at best, 1 cm at the end, in a
// 58 cm frame). Each solve from #2 now cuts to Camera E, a close two-shot of the blob on its mark with the page corner and
// the pen beside it, from a quarter second before the solve (the old size) to a second after, then back to D. #5's cutaway
// ends at 19.95 so the neighbor's wake (20.0) and his stretch still play in the wide. Cuts: [in, out, solve number].
const CUTAWAYS = [[13.5, 14.5, 2], [15.75, 16.85, 3], [17.75, 18.85, 4], [19.25, 19.95, 5], [20.75, 21.85, 6]];
const E_DIST = 0.17, E_DX = 0.004, E_Y = [0.030, 0.012];   // camera distance from the mark's plane, x offset, then eye and look heights
// Camera P: straight down on the page from 0.075 (README §8), centred on the written lines (sheet rows 38–298)
const CAM_P = { pos: [-0.0205, 0.0753, 0.0934], look: [-0.0205, 0.0003, 0.0934] };
const PHONE_I = 1.0, ZONE_I = 0.8, FLUOR_I = 0.25, AMB_K = 0.45, FILL_PHONE = 0.003, FILL_ZONE = 0.02;   // s15's
const OUTSHONE = 0.02;                                 // s15's PHONE_OUTSHONE (README §4 says 0.2)
const FILL_OFF = [0.029, 0.040, 0.114];                // character fill: x off the hip, then world y, z (s15's (−0.046, 0.040, 0.114))
const MIR = 0.350;                                     // neighbor unit: x' = MIR − x
const N = { hip: [0.425, -0.012], blob: [0.350, OTHER_R.neighbor, 0.098], phone: [0.360, 0.0015, 0.114], light: [0.360, 0.004, 0.114] };
const STAND = [0.175, 0.080];                          // x in the gap; z 6 mm in front of the body plane, so the cubicle panel
                                                       // at the desk's end (z 0.076) stands behind him, not across his legs
const FLOOR = -0.034;
const VIEW_GLOW = [0.3, 0.45];
const INSERT_TINT = [0.62, 0.85, 0.9];
const INSERT_EXPOSURE = 0.18;                          // P and P2 sit inside the zone's core: its light × this, or the page clips
const INSERT_ARM = [0.030, -35, -0.006, 0.0014, 0.0022];   // the insert's sleeve: reach (m), turn (deg), hand behind the nib (m), arm height, pen height (m)

// ---------- the hero ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
const up = (o) => specPose({ leg: 0, farLeg: 8, ...o });   // poses.js's standing legs
const P = { ...POSES, line1: seat({ lean: 14, arm: -21 }), antic: seat({ lean: 10, arm: -21 }),
  still: seat({ lean: 18, arm: -22 }),                 // 7.0: the brace with the pen lifted 2 mm
  stand_stretch: up({ lean: -6, arm: 100, far: 80, head: 10 }), stand_look: up({ lean: 0, arm: -95, far: -95 }) };
const STANDING = new Set(['stand_stretch', 'stand_look']);
const POPS = [[10, 'flip'], [10.5, 'write_a'], [11, 'write_b'], [11.5, 'write_c'], [12, 'write_a'], [12.5, 'write_b'], [13, 'write_c'],
  [13.5, 'solve'], [14, 'write_c'], [14.5, 'think'], [15, 'write_b'], [15.5, 'flip'], [16, 'solve'], [16.5, 'write_a'],
  [17, 'write_b'], [17.5, 'write_c'], [18, 'solve'], [18.5, 'write_a'], [19, 'think'], [19.5, 'solve'], [20, 'stand_stretch'],
  [20.5, 'stand_look'], [21, 'solve'], [21.5, 'flip'], [22, 'write_a'], [22.5, 'write_b'], [23, 'write_c'], [23.5, 'write_a']];
const held = (pops) => pops.flatMap(([t, n], i) => (i + 1 < pops.length ? [[t, n], [pops[i + 1][0] - dr(1), n]] : [[t, n]]));   // pop, hold, pop
const BODY = [[0, 'line1'], [dr(3), 'antic'], [dr(5), 'antic'], [dr(6), 'brace'], [7, 'brace'], [7 + 1e-3, 'still'], [10 - dr(1), 'still'], ...held(POPS)];
const popAt = (tc) => (tc < 10 ? null : POPS.findLast(([t]) => tc >= t - 1e-6)?.[1]);
const isWrite = (n) => !!n?.startsWith('write');
// Head on body (deg): s15 ends at −14; brace −4 more; 7.667 another −4; montage −14, think +6; standing from the pose
const headAt = (tc) => { const p = popAt(tc);
  return tc < 10 ? kf(tc, [[0, -14], [dr(5), -14], [dr(6), -18], [dr(91), -18], [dr(92), -22]])
    : p === 'stand_stretch' ? 10 : p === 'stand_look' ? 0 : -14 + (p === 'think' ? 6 : 0); };
const eyesAt = (tc) => { const p = popAt(tc);
  if (tc < 10) return tc < 7.5 ? 'worried' : tc < 8.5 ? 'gasp' : 'side';
  return p === 'stand_stretch' ? 'closed' : p === 'think' ? 'side' : 'open'; };
const mouthAt = (tc) => { const p = popAt(tc);
  if (tc < 10) return tc < dr(94) ? 'line' : tc < 9.25 ? 'o' : 'smile';
  return p === 'stand_stretch' ? 'o' : p === 'stand_look' ? 'neutral' : p === 'solve' || tc >= SOLVES[3] ? 'smile' : 'line'; };

// ---------- the neighbor (crowd_sheet, mirrored to face −x), pops on the same grid ----------
const NP = { ...POSES, n_phone: specPose({ lean: 24, arm: -10, far: null, head: -6 }) };   // turning the phone over
const NPOPS = [[0, 'crowd_hunch'], [20.5, 'crowd_look_up'], [21.5, 'n_phone'], [22, 'crowd_write']];

const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));   // s15's: peaks on the beat

// ---------- the pages ----------
// Problem 1 in P (practice_1, sheet pixels): line a 1.0–3.6, line b 3.6–4.6, the pause and tap, the strike 5.10–5.17 (two
// drawings), line c 5.25–6.6, the check 6.667 / 6.833. Code strokes: the two '+' bars under the painted strike (until it
// lands) and the check. Problem 2 in P2 (practice_2): one part per pop. Later pages: blank, a scribble line per writing pop.
const I1 = SHEET_INK.practice_1, I2 = SHEET_INK.practice_2;
const CHECK1 = [[216, 284], [223, 293], [240, 270]], CHECK2 = [[154, 266], [160, 274], [176, 252]];
const UNDER2 = [[34, 284], [143, 283]];
const both = (box, f) => [[box, 0, f], [box, 1, f]];
const span = (tc, a, b) => clamp((tc - a) / (b - a));
function page1(tc, t) {
  const fb = span(tc, 3.6, 4.6), strike = t >= B.crossOut ? (t >= B.crossOut + dr(1) ? 1 : 0.5) : 0;
  return {
    spans: [...both(I1.name, 1), ...both(I1.problem, 1), ...both(I1.a, span(tc, 1, 3.6)), ...(strike ? [[I1.b, 0, 1], [I1.b, 1, strike]] : [[I1.b, 2, fb]]),
      ...both(I1.c, span(tc, 5.25, 6.6))],
    extra: (g, K) => {
      if (strike < 1) for (const x of I1.plus) {   // the '+' bars the painted strike covers, drawn as the pen passes them
        const f = clamp(((I1.b[0] + (I1.b[2] - I1.b[0]) * fb) - (x - 7)) / 14);
        penLine(g, K, [[x - 7, I1.plusY], [x + 7, I1.plusY]], f, 2.4);
      }
      penLine(g, K, CHECK1.slice(0, 2), tc >= dr(80) - 1e-6 ? 1 : 0);
      penLine(g, K, CHECK1.slice(1), tc >= dr(82) - 1e-6 ? 1 : 0);
    },
  };
}
// the pen tip in P, in sheet pixels: along the line being written, over the '+' in the pause, along the strike and check
function tip1(tc, t) {
  const along = ([x0, , x1, y1], f) => [x0 + (x1 - x0) * f, y1 - 4];
  if (tc < 1) return [I1.a[0], I1.a[3] - 4];
  if (tc < 3.6) return along(I1.a, span(tc, 1, 3.6));
  if (tc < 4.6) return along(I1.b, span(tc, 3.6, 4.6));
  if (t < B.crossOut) return [I1.plus[0], I1.plusY - (Math.abs(tc - 4.833) < 0.05 ? 0 : 2)];
  if (tc < 5.25) return [I1.strike[0] + (I1.strike[2] - I1.strike[0]) * (t >= B.crossOut + dr(1) ? 1 : 0.5), 240];
  if (tc < 6.6) return along(I1.c, span(tc, 5.25, 6.6));
  return tc < dr(81) ? CHECK1[1] : CHECK1[2];
}
function page2(tc) {
  const at = (x) => (tc >= x - 1e-6 ? 1 : 0);
  return {
    spans: [...both(I2.problem, 1), ...both(I2.name, at(10.5)), ...both(I2.frac, at(11)), ...both(I2.arrow, at(11.5)), ...both(I2.word, at(12))],
    extra: (g, K) => {
      penLine(g, K, UNDER2, at(12.5));
      penLine(g, K, CHECK2, at(13));
      scribbles(g, K, 2, [[14, 305], [15, 335]], tc);
    },
  };
}
// Time-lapse lines: [t, row]; a scribble line appears whole on its pop, a check after it when it ends a problem.
const PAGE3 = [[16, 70, 1], [16.5, 110], [17, 150], [17.5, 190, 0], [18, 190, 1], [18.5, 230], [19.5, 270, 1], [21, 310, 1]];
const PAGE4 = [[22, 70], [22.5, 110], [23, 150], [23.5, 190]];
const scribRng = mulberry32(seedOf(ID, 'scribbles'));
const SCRIB = Array.from({ length: 24 }, () => Array.from({ length: 40 }, () => scribRng()));   // fixed jitter per line
function scribbles(g, K, page, lines, tc) {
  lines.forEach(([t, row, check], i) => {
    if (tc < t - 1e-6) return;
    if (check === 0) return;   // a row that only gets its check later
    const j = SCRIB[(page * 8 + i) % SCRIB.length], x1 = 60 + 140 * (0.6 + 0.4 * j[0]);
    if (check !== 1 || i === 0 || lines[i - 1][1] !== row) {   // the line itself (not for a check on the row above's line)
      g.strokeStyle = 'rgb(30,42,63)'; g.lineWidth = 2.2 * K; g.beginPath();
      for (let k = 0; k < 40; k++) {
        const x = 34 + (x1 - 34) * k / 39, y = row - 5 * Math.abs(Math.sin(k * 1.1 + j[1] * 6)) - 2 * j[k % 40];
        g[k ? 'lineTo' : 'moveTo'](x * K, y * K);
      }
      g.stroke();
    }
    if (check === 1) penLine(g, K, [[x1 + 12, row - 6], [x1 + 17, row], [x1 + 30, row - 14]]);
  });
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const tools = kitTools(ID), { sheet, boil, art } = tools;
  const { pendant, viewMat } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  // The neighbor's unit: marstonDesk again, mirrored. Its room (wall, windows, sky, view, carpet) and its cubicle panel
  // (where he stands to stretch) are the hero's, so they're hidden: everything at the wall (z < 0.03), the flat floor,
  // and the panel at the desk's end (x 0.150).
  const nRoom = new THREE.Group(); nRoom.position.x = MIR; nRoom.scale.x = -1; scene.add(nRoom);
  const { pendant: nPendant } = await marstonDesk({ scene: nRoom, assets, PALETTE, tools, ID: `${ID}-nbr` });
  for (const c of nRoom.children) if (c.position.z < 0.03 || (c.rotation.x < 0 && c.position.y < -0.03) || c.position.x === 0.150) c.visible = false;
  const [props, kitp, gsheet] = await Promise.all(['study_props_sheet', 'props_kit', 'gator_sheet'].map((n) => assets.load(n)));
  const cut = (a, name, { weight, res = 512, parent = scene, key = name } = {}) => {   // s15's: origin at the visible centre
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${key}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };

  // ---------- the hero's desk ----------
  { const b = cut(props, 'backpack_side'); b.position.set(-0.145, -0.034 + 0.02, 0.028); }
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, 0.078);   // closed, in front of the blob (README §2)
  cut(props, 'laptop_lid').position.set(-0.0075, 0.0045, 0.0781);
  const phone = new THREE.Group(); phone.position.set(...PHONE); phone.rotation.x = Math.PI; scene.add(phone);   // face-down since s15
  { const back = cut(kitp, 'phone_face_down', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }
  noCast(phone);
  const pen = new THREE.Group(); scene.add(pen);   // origin at the tip; the painted pen points −x, so it's mirrored
  { const p = cut(kitp, 'pen', { parent: pen }); p.position.x = -0.006; p.scale.x = -1; }
  { const c = flat(cut(kitp, 'pen_cap')); c.scale.x = -1; c.position.set(-0.030, 0.0008, 0.100); }   // where s15 set it down
  // the pages: problem 1's sheet, problem 2's, then blank sheets for the time-lapse; the finished stack beside the page
  const pages = [
    practiceSheet({ props: kitp, sheet, which: 'practice_1', at: PAGE, key: `${ID}-page1`, parent: scene, heal: I1.heal }),
    practiceSheet({ props: kitp, sheet, which: 'practice_2', at: PAGE, key: `${ID}-page2`, parent: scene }),
    practiceSheet({ props: kitp, sheet, which: 'blank_page', at: PAGE, key: `${ID}-page3`, parent: scene }),
    practiceSheet({ props: kitp, sheet, which: 'blank_page', at: PAGE, key: `${ID}-page4`, parent: scene }),
  ];
  const stack = FLIPS.map((_, i) => {
    const g = flat(cut(kitp, 'blank_page', { key: `stack${i}` }));
    g.position.set(0.0275, 0.0003 + 0.0004 * (i + 1), 0.050); g.rotation.z = [-2, 3, -1][i] * D; return g;
  });

  // ---------- the neighbor's desk (mirrored positions) ----------
  flat(cut(kitp, 'blank_page', { key: 'nbr-page' })).position.set(MIR - PAGE[0], PAGE[1], PAGE[2]);
  const nPhoneG = new THREE.Group(); nPhoneG.position.set(...N.phone); scene.add(nPhoneG);
  flat(cut(kitp, 'phone_face_up', { parent: nPhoneG, key: 'nbr-phone' })).position.y = 0.0004;
  { const back = cut(kitp, 'phone_face_down', { parent: nPhoneG, key: 'nbr-phone-back' }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;   // glyph bars, no text
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const nScreen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0128, 0.0054), new THREE.MeshBasicMaterial({ map: scrTex })));
  nScreen.position.y = 0.00045; nPhoneG.add(nScreen);
  noCast(nPhoneG);
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
    ia.children[0].material.color.setRGB(...INSERT_TINT); }   // the amber grade and the zone's glare turned the felt lime; this pulls it back to gator green

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

  // ---------- light: one motion-sensor zone per desk (README §3), the neighbor's phone (§4) ----------
  const zone = sensorLight({ at: UNIT.tube, aimAt: [0, 0, 0.098], intensity: ZONE_I });                 // his: lit all shot
  const nZone = sensorLight({ at: [MIR, 0.127, 0.040], aimAt: [MIR, 0, 0.098], intensity: ZONE_I });    // theirs: dead until WAKE
  for (const z of [zone, nZone]) scene.add(z.light, z.light.target);   // fixtures: the two ring pendants
  const FILL = { phone: C('phone').lerp(C('navy'), 0.35), zone: C('cream').lerp(C('gator'), 0.15) };   // README §10
  const fill = new THREE.PointLight(FILL.zone, FILL_ZONE, 0.07, 2); fill.castShadow = false; scene.add(fill);
  const nPhone = phoneLight({ angle: 0.9, penumbra: 0.4, intensity: PHONE_I });
  nPhone.position.set(...N.light); scene.add(nPhone, nPhone.target); aim(nPhone, V(N.blob));   // along phone → blob: S 7.1
  const nFill = new THREE.PointLight(FILL.phone, FILL_PHONE, 0.07, 2);   // the hero's fill, mirrored
  nFill.castShadow = false; nFill.position.set(MIR + 0.046, 0.040, 0.114); scene.add(nFill);
  const tubes = fluorescent({ intensity: FLUOR_I }); scene.add(tubes.light);   // flicker 0: update() never called
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  const look = new THREE.Vector3(), dir = new THREE.Vector3(), focus = new THREE.Vector3(), hand = new THREE.Vector3(), w = new THREE.Vector3();
  const fx = post({ focus: 0.3, aperture: UNIT.aperture, maxblur: UNIT.maxblur, lut: 'amber' });

  function update(t) {
    const tc = on2s(t);
    boil(t, 10);
    const inP = t >= CUTS.P[0] && t < CUTS.P[1], inP2 = t >= CUTS.P2[0] && t < CUTS.P2[1], insert = inP || inP2;
    const cutaway = CUTAWAYS.find(([a, b]) => t >= a && t < b), camD = t >= CUTS.D[0] && !inP2 && !cutaway;

    // camera: B′ / P / B′ / D / P2 / D, each locked
    let cam = insert ? { ...CAM_P, focus: CAM_P.look } : camD ? CAM_D : { ...CAM_B2, focus: UNIT.focus };
    if (cutaway) {   // Camera E: straight at the blob's mark, midway between its old and new size's marks
      const M1 = markOf(radiusAfter(cutaway[2])), M0 = markOf(radiusAfter(cutaway[2] - 1)), x = (M0[0] + M1[0]) / 2 + E_DX;
      cam = { pos: [x, E_Y[0], M1[2] + E_DIST], look: [x, E_Y[1], M1[2]], focus: [x, E_Y[1], M1[2]] };
    }
    camera.up.set(0, insert ? 0 : 1, insert ? -1 : 0);
    camera.position.set(...cam.pos); camera.lookAt(look.set(...cam.look)); camera.getWorldDirection(dir);
    fx.set({ focus: dir.dot(focus.set(...cam.focus).sub(camera.position)) });

    // hero: seated at s15's hip, or standing in the gap between the desks (20.0–21.0); hidden in the inserts
    const pop = popAt(tc), standing = STANDING.has(pop);
    hero.group.visible = !insert;
    hero.boil(t, 10);
    hero.blend(P, BODY, tc + 1e-6);
    hero.pose({ head: headAt(tc) * D });
    idle(hero, t, { breath: 0.01, sway: standing ? 0 : 0.04 });
    hero.face({ eyes: eyesAt(tc), mouth: mouthAt(tc) });
    if (standing) hero.group.position.set(STAND[0], FLOOR + hipHeight(P[pop]), STAND[1]);
    else hero.group.position.set(UNIT.hip[0], UNIT.hip[1] - (tc < dr(3) ? 0.001 : 0), UNIT.bodyZ);   // s15's exhale drop, then shoulders up
    hero.group.updateMatrixWorld(true);
    hero.hand.getWorldPosition(hand);
    fill.position.set(hero.group.position.x + FILL_OFF[0], FILL_OFF[1], FILL_OFF[2]);

    // the pages: which one is in front of him, what's on it, the finished stack
    const flips = FLIPS.filter((f) => tc >= f - 1e-6).length;
    pages.forEach((p, i) => { p.holder.visible = i === flips; });
    stack.forEach((s, i) => { s.visible = flips > i; });
    if (flips === 0) { const p = page1(tc, t); pages[0].draw(p.spans, p.extra, 'p1' + tc.toFixed(3)); }
    else if (flips === 1) { const p = page2(tc); pages[1].draw(p.spans, p.extra, 'p2' + tc.toFixed(2)); }
    else if (flips === 2) pages[2].draw([], (g, K) => scribbles(g, K, 3, PAGE3, tc), 'p3' + PAGE3.filter(([x]) => tc >= x - 1e-6).length);
    else pages[3].draw([], (g, K) => scribbles(g, K, 4, PAGE4, tc), 'p4' + PAGE4.filter(([x]) => tc >= x - 1e-6).length);

    // the insert hand: the pen tip on the line being written (P), or on each new part as it pops (P2)
    ihand.visible = insert;
    if (insert) {
      const pg = inP ? pages[0] : pages[1];
      pg.holder.updateMatrixWorld(true);
      const [sx, sy] = inP ? tip1(tc, t) : tc < 11.5 ? [I2.frac[2], I2.frac[3] - 4] : tc < 12 ? [I2.arrow[2], I2.arrow[3] - 4]
        : tc < 12.5 ? [I2.word[2], I2.word[3] - 4] : tc < 13 ? UNDER2[1] : CHECK2[2];
      pg.toWorld(sx, sy, w);
      ihand.position.set(w.x, w.y, w.z);
    }

    // side-view pen: tip on the fingertip at 45° (s15). Writing in D, the tip sits 2/4/6 mm up so it lands on a page line
    // (s15's flat-puppet cheat); lifted 2 mm on solves and at 7.0. Standing, it lies on the page's front edge.
    pen.visible = !insert;
    if (standing) { pen.rotation.set(-Math.PI / 2, 0, 0); pen.position.set(-0.016, 0.0006, 0.106); }
    else {
      const line = Math.floor(2 * tc) % 3, lifted = pop === 'solve' || (tc >= 7 && tc < 10) || pop === 'think' || pop === 'flip';
      pen.rotation.set(0, 0, -Math.PI / 4);
      pen.position.set(hand.x, tc < 1 ? 0.0025 : isWrite(pop) ? 0.002 * (line + 1) : lifted ? 0.004 : hand.y + 0.0003, 0.0868);
    }

    // the hero's blob: braces with him, shrinks one step per solve with its contact on the mark for its size, watches him
    const solved = SOLVES.filter((s) => tc >= s - 1e-6).length, r = radiusAfter(solved), M = markOf(r);
    const s = r / BLOB_R.start, t0 = SOLVES[solved - 1];
    exam.mesh.visible = exam.stain.visible = !insert;
    exam.mesh.scale.setScalar(s); exam.stain.scale.setScalar(s);
    exam.mesh.position.set(M[0], 0, M[2]); exam.stain.position.set(M[0], 0.0004, M[2]);
    const braced = tc >= dr(4) && tc < 7;
    exam.update(t, {
      key: zone.light,
      wobble: braced ? 0.3 : 1,
      squash: braced ? 0.25 : t0 === undefined ? 0 : kick(tc, t0, 0.3),
      eyes: tc >= 22.5 || (tc >= dr(6) && tc < 7.25) ? 'closed' : 'open',
      look: standing ? 1 : -1,   // follows him into the gap
    });
    const watching = (tc >= 8.5 && tc < 10) || (tc >= 10 && (t0 === undefined || tc - t0 >= 0.25 - 1e-6));
    exam.mesh.rotation.z = (watching ? 10 : 0) * D;   // tilted toward him; upright for each squash

    // light (on 1s): his zone stays lit; theirs wakes when he stands beside it
    pendant(zone.update(t));
    zone.light.intensity *= insert ? INSERT_EXPOSURE : 1;
    const nLevel = nZone.update(t, { wake: WAKE }), nLit = nLevel >= 0.5, nDown = tc >= 21.5 - 1e-6;
    nPendant(nLevel);
    nPhoneG.rotation.x = nDown ? Math.PI : 0;
    nPhone.intensity = nDown ? 0 : PHONE_I * (nLit ? OUTSHONE : 1);
    nScreen.material.color.setScalar(nLit ? 0.6 : 1);
    nFill.color.copy(t >= WAKE ? FILL.zone : FILL.phone); nFill.intensity = t >= WAKE ? FILL_ZONE : FILL_PHONE;

    // the neighbor
    nbr.boil(t, 10);
    nbr.blend(NP, held(NPOPS), tc + 1e-6);
    idle(nbr, t, { breath: 0.008, sway: 0, phase: 0.37 });   // frozen at their phone, still breathing
    nBlob.update(t, { key: nLit ? nZone.light : nPhone, squash: kick(tc, WAKE, 0.3), wobble: tc >= WAKE + 0.5 ? 0 : 1 });

    // window: the night view brightens a little toward pre-dawn over 10–24 (no light reaches the room)
    viewMat.emissiveIntensity = VIEW_GLOW[0] + (VIEW_GLOW[1] - VIEW_GLOW[0]) * clamp((t - 10) / 14);
  }

  return { update };
}
