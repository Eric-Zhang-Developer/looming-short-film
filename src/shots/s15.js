// s15 · The pen, the light, the look, the name (docs/shots/s15.md, G4). v2 on the frozen Marston kits and props_kit.
// The film's turn: the reach for the pen wakes the motion-sensor zone over his desk (README §3) on the press drawing, the
// 7.1-unit loom drops to a 1.31× pool under the 2.5× blob, and he writes his name. s11's desk set (marstonDesk: ribbon
// window, desk row, Y-back chair, ring pendant as the zone's fixture), Camera A′ → B′ (README §8).
// Characters (gator, blob, the props he handles) step on 2s; light and camera run at 24.
// UNIT below is the pre-G4 master that s06, s12, s14, s16 and s17 import: its values are left as they were, and this
// shot's G4 numbers are the constants after it. s16 imports the practice-sheet helpers from here.
import * as THREE from 'three';
import { phoneLight, sensorLight, fluorescent, ambient, aim, shadowScale } from '../lights.js';
import { kf, ease, clamp } from '../core/ease.js';
import { makeGator } from '../characters/gator.js';
import { createBlob } from '../blob.js';
import { POSES, specPose, pressKeys } from '../characters/poses.js';
import { kitTools, marstonDesk, MARK, noCast } from './s11.js';

const ID = 's15', D = Math.PI / 180;
const dr = (n) => n / 12;                                    // drawing n (12 fps) → local seconds
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;          // onTwos, but 100.0833 − 100 = 0.08333333333332860 floors to drawing 0 there (evidence/anim-s15/ontwos.txt)

// ---------- the pre-G4 master numbers (imported by s06, s12, s14, s16, s17; not this shot's G4 staging) ----------
export const UNIT = {
  hip: [-0.075, -0.012], bodyZ: 0.074,                       // gator root (makeGator puts the near arm at +0.012 → z 0.086)
  camA: { pos: [-0.010, 0.118, 0.392], look: [-0.010, 0.0385, 0.080] },   // spec look y 0.030, tilted up 1.45° (loom fix)
  camB: { pos: [-0.022, 0.090, 0.292], look: [-0.022, 0.020, 0.084] },
  focus: [-0.024, 0.020, 0.086], aperture: 0.02, maxblur: 0.01,
  fill: [-0.046, 0.040, 0.114],                             // character fill (README §10): before him, just above eye line
  tube: [0, 0.127, 0.040],                                   // sensor_trough tube centre (README §3), above the frame in A and B
  blob: [0, 0.012, 0.0884], phone: [-0.010, 0.0015, 0.116], phoneLight: [-0.014, 0.006, 0.116],   // loom fix: 4.2x, see done note
  press: 0.5,                                                // K6, drawing 6: the pen's capped point meets the page = the sensor
                                                             // wake time (lampClickMarston). Beat-locked: don't move it.
};

// ---------- G4 (this shot) ----------
const BLOB_R = { start: 0.030 };                             // METER.gulp5 (README §1); exam.js has no METER export yet
// The Marston mark (README §1), moved BLOB_DX along +x: at B′ the 9.3 cm cut gator's snout (cut-gator) reached the
// 2.5× blob. 0 puts it back on the spec's mark.
export const BLOB_DX = 0.016;
export const BLOB_AT = (r) => { const m = MARK(r); return [m[0] + BLOB_DX, 0, m[2]]; };
export const PHONE = [-0.010, 0.0015, 0.114], PHONE_L = [-0.010, 0.004, 0.114];   // rest spot and its light: S 0.114 / 0.040 = 2.85
const LAPTOP_Z = 0.078;                                      // in front of the grown blob (README §2)
export const CAM_A2 = { pos: [0.025, 0.239, 0.642], look: [0.025, 0.080, 0.080] };    // Camera A′ (README §8)
export const CAM_B2 = { pos: [-0.010, 0.112, 0.358], look: [-0.010, 0.020, 0.084] };  // Camera B′
export const PAGE = [-0.0205, 0.0003, 0.095];                // page centre (x −0.033…−0.008, z 0.080…0.110)
// Intensities (candela for spots/points, lux for the directional), tuned by eye on the key-moment sheet.
const PHONE_I = 1.0, ZONE_I = 0.8, FLUOR_I = 0.25, AMB_K = 0.45;   // ZONE_I: lights.js's default, the old lamp pool at the blob
const PHONE_OUTSHONE = 0.02;   // README §4 says 0.2. anim-s15 took 0.05 (0.2 left the loom at 43%); reel-s15 0.02, by eye
const FILL_PHONE = 0.012, FILL_ZONE = 0.02;   // character fill (README §10). v3-readability: 0.003 left him a black shape
                                              // in the loom, so nobody could see that the reach was his
// v3-readability: the turn must read as *his movement* waking the light. Two still drawings, then one big reach: the arm
// swings up high (arm +45) and comes down on the pen, which lands on drawing 5 (0.417). The relay clacks on the
// beat at 0.5, two frames behind his hand. Then A′ holds on the lit result until 2.5 and pushes slowly to B′ by 9.0.
const PUSH = [2.5, 9.0];

// ---------- the hand: K0–K3 from poses.js (shared with s06), K4–K7 down to the pen, then the rest of s15's table ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });   // poses.js's seated legs
const P = {
  ...POSES,
  big_lift: seat({ lean: 8, arm: 45, head: 6 }),   // 0.250: the arm swings up high, clearly a decision
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
  ...pressKeys(0).slice(0, 3),                                // K0–K2: still, still, anticipation (as s06)
  [dr(3), 'big_lift'], [dr(4), 'pen_reach'], [dr(5), 'pen_press'], [dr(7), 'pen_press'],   // the press on 5 (0.417), the wake on 6
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

// ---------- the practice sheet (props_kit practice_1 / practice_2), shared with s16 ----------
// The frozen sheets come with the writing already painted. To let him write it, each sheet is split into blank paper
// (props_kit blank_page) and an ink overlay: every pixel is unmixed into paper, navy pen and grey pencil (two linear
// equations: brightness r+g+b and blue lead b−r), so a line can be revealed left to right and the grey strike-through on
// problem 1's wrong line can wait for the cross-out. Boxes are [x0, y0, x1, y1] in the sheet's own pixels (measured on the
// cut PNGs). plus: the x of the two '+' stems on the struck line, whose cross bars lie under the strike.
export const SHEET_INK = {
  practice_1: { name: [27, 38, 114, 56], problem: [31, 76, 158, 132], a: [26, 162, 262, 210], b: [28, 225, 230, 250],
    strike: [6, 236, 244, 245], heal: [24, 237, 234, 244], c: [33, 273, 206, 298], plus: [118, 180], plusY: 240 },
  practice_2: { name: [30, 37, 118, 56], problem: [30, 77, 143, 129], frac: [32, 167, 100, 225], arrow: [117, 167, 225, 225],
    word: [34, 255, 143, 278] },
};
const NAVY = [30, 42, 63], GREY = [95, 92, 90];   // medians measured on practice_1 (pen ink, the strike)
const INK_GAIN = 1.6;                              // ink alpha × this: the struck line is painted lighter than the rest
function unmix(img) {
  const W = img.width, H = img.height, c = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const src = g.getImageData(0, 0, W, H).data;
  const bright = [[], [], []];   // paper: the median of the bright opaque pixels
  for (let i = 0; i < src.length; i += 16) if (src[i + 3] === 255 && src[i] + src[i + 1] + src[i + 2] > 600) for (let k = 0; k < 3; k++) bright[k].push(src[i + k]);
  const P = bright.map((v) => v.sort((a, b) => a - b)[v.length >> 1]);
  const f = (q) => [q[0] + q[1] + q[2], q[2] - q[0]], [Lp, cp] = f(P), [Ln, cn] = f(NAVY), [Lg, cg] = f(GREY);
  const a11 = Ln - Lp, a12 = Lg - Lp, a21 = cn - cp, a22 = cg - cp, det = a11 * a22 - a12 * a21;
  const out = [new ImageData(W, H), new ImageData(W, H)];
  for (let i = 0; i < src.length; i += 4) {
    if (src[i + 3] < 128) continue;
    const dL = src[i] + src[i + 1] + src[i + 2] - Lp, dc = src[i + 2] - src[i] - cp;
    let a = clamp((dL * a22 - a12 * dc) / det), b = clamp((a11 * dc - a21 * dL) / det);
    if (a + b < 0.12) continue;                        // paper grain
    a = clamp(a * INK_GAIN); b = clamp(b * INK_GAIN);   // the painted pen is thin and half-transparent at this size
    if (a + b > 1) { const s = a + b; a /= s; b /= s; }
    [a, b].forEach((v, k) => { const d = out[k].data, col = k ? GREY : NAVY;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = Math.round(255 * v); });
  }
  return out.map((d) => { const l = Object.assign(document.createElement('canvas'), { width: W, height: H }); l.getContext('2d').putImageData(d, 0, 0); return l; });
}
// A sheet lying flat at `at` (centre), top edge toward the wall: blank paper that boils with the set, and an ink plane
// over it whose canvas is redrawn only when the reveal state changes.
// draw(spans, extra): spans = [[box, layer (0 navy, 1 grey, 2 healed navy), fraction revealed left to right]]; extra(g, K)
// draws code pen strokes in sheet pixels (K = canvas px per sheet px). heal: the strike's rows; layer 2 is both layers
// with those rows replaced by the rows above and below (the letters' strokes carried across, the strike gone).
export function practiceSheet({ props, sheet, which, at, key, parent, heal }) {
  const img = props.pieces[which], [w, h] = props.sizes[which], [u0, v0, u1, v1] = props.visible[which];
  const holder = new THREE.Group(); holder.rotation.x = -Math.PI / 2; holder.position.set(...at); parent.add(holder);
  const [bw, bh] = props.sizes.blank_page, [b0, c0, b1, c1] = props.visible.blank_page;
  const blank = sheet({ art: props.pieces.blank_page, size: [bw, bh], key, res: 1024 }, holder);
  blank.position.set((0.5 - (b0 + b1) / 2) * bw, ((c0 + c1) / 2 - 0.5) * bh, 0);
  const layers = props.proxy ? null : unmix(img), K = 2;
  if (layers && heal) {
    const [x0, y0, x1, y1] = heal, c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
    const g = c.getContext('2d'); g.drawImage(layers[0], 0, 0); g.drawImage(layers[1], 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height), a = (x, y) => d.data[(y * c.width + x) * 4 + 3];
    for (let x = x0; x <= x1; x++) {
      const top = a(x, y0 - 1), bot = a(x, y1 + 1);
      for (let y = y0; y <= y1; y++) {
        const k = (y - y0 + 1) / (y1 - y0 + 2), i = (y * c.width + x) * 4;
        d.data[i] = NAVY[0]; d.data[i + 1] = NAVY[1]; d.data[i + 2] = NAVY[2]; d.data[i + 3] = (1 - k) * top + k * bot;
      }
    }
    g.putImageData(d, 0, 0); layers.push(c);
  }
  const ink = Object.assign(document.createElement('canvas'), { width: img.width * K, height: img.height * K });
  const tex = new THREE.CanvasTexture(ink); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  plane.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0.00005);
  plane.castShadow = false; plane.receiveShadow = true; holder.add(plane);
  let drawn = null;
  const draw = (spans, extra, tag = '') => {
    const id = tag + JSON.stringify(spans.map(([b, l, fr]) => [b, l, +clamp(fr).toFixed(3)]));
    if (id === drawn) return; drawn = id;
    const g = ink.getContext('2d'); g.clearRect(0, 0, ink.width, ink.height);
    if (layers) for (const [[x0, y0, x1, y1], l, fr] of spans) {
      const xe = x0 - 1 + (x1 - x0 + 3) * clamp(fr);
      if (xe <= x0 - 1) continue;
      g.drawImage(layers[l], x0 - 1, y0 - 1, xe - x0 + 1, y1 - y0 + 3, (x0 - 1) * K, (y0 - 1) * K, (xe - x0 + 1) * K, (y1 - y0 + 3) * K);
    }
    if (extra) { g.save(); g.lineCap = g.lineJoin = 'round'; extra(g, K); g.restore(); }
    tex.needsUpdate = true;
  };
  // sheet pixel → world point on the page (for the insert's pen tip)
  const toWorld = (x, y, v = new THREE.Vector3()) => holder.localToWorld(v.set(plane.position.x + (x / img.width - 0.5) * w, plane.position.y + (0.5 - y / img.height) * h, 0));
  return { holder, blank, plane, draw, toWorld };
}
// A code pen line in sheet pixels, NAVY, drawn up to fraction f of its length (the check, the underline, the '+' bars).
export function penLine(g, K, pts, f = 1, width = 2.6) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), L = seg.reduce((a, b) => a + b, 0);
  let left = clamp(f) * L;
  if (left <= 0) return;
  g.strokeStyle = `rgb(${NAVY})`; g.lineWidth = width * K; g.beginPath(); g.moveTo(pts[0][0] * K, pts[0][1] * K);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const s = Math.min(1, left / seg[i - 1]), [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    g.lineTo((ax + (bx - ax) * s) * K, (ay + (by - ay) * s) * K); left -= seg[i - 1];
  }
  g.stroke();
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const tools = kitTools(ID), { sheet, boil } = tools;
  const { pendant } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  const [props, kitp] = await Promise.all(['study_props_sheet', 'props_kit'].map((n) => assets.load(n)));
  // An asset piece in a holder whose origin is the centre of the piece's visible shape, so the spec's boxes place it.
  const cut = (a, name, { weight, res = 512, parent = scene, key = name } = {}) => {
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${key}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };   // lying on the desk: local +y runs away from camera

  // ---------- set: s11's desk unit, the closed laptop and the backpack as s11–s14 left them ----------
  { const b = cut(props, 'backpack_side'); b.position.set(-0.145, -0.034 + 0.02, 0.028); }
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, LAPTOP_Z);
  cut(props, 'laptop_lid').position.set(-0.0075, 0.0045, LAPTOP_Z + 0.0001);

  // ---------- props he handles ----------
  // The page: problem 1's practice sheet, its printed problem showing, his name revealed under the pen (8.833–10.0).
  const page = practiceSheet({ props: kitp, sheet, which: 'practice_1', at: PAGE, key: `${ID}-page`, parent: scene });
  const INK = SHEET_INK.practice_1;

  // phone: props_kit, face up (dark screen) at rest with a glyph-bar glow over it; turns over onto its painted back.
  const phone = new THREE.Group(); phone.position.set(...PHONE); scene.add(phone);
  flat(cut(kitp, 'phone_face_up', { parent: phone })).position.y = 0.0004;
  { const back = cut(kitp, 'phone_face_down', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;   // glyph bars, no text
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0128, 0.0054), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);
  noCast(phone);

  // pen + cap (props_kit): the pen holder's origin is its tip (+x end) so it can hang off the fingertip. The painted pen
  // points −x, so it's mirrored.
  const pen = new THREE.Group(); scene.add(pen);
  { const p = cut(kitp, 'pen', { parent: pen }); p.position.x = -0.006; p.scale.x = -1; }
  const cap = new THREE.Group(); scene.add(cap); cut(kitp, 'pen_cap', { parent: cap }).scale.x = -1;

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
  scene.add(hero.group);
  const M = BLOB_AT(BLOB_R.start);
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.stain.position.set(M[0], 0.0004, M[2]);
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  const BLOB_C = V([M[0], BLOB_R.start, M[2]]);
  const phoneSpot = phoneLight({ angle: 0.9, penumbra: 0.4, intensity: PHONE_I });
  phoneSpot.position.copy(V(PHONE_L));
  scene.add(phoneSpot, phoneSpot.target);
  aim(phoneSpot, BLOB_C);   // along phone → blob, i.e. at its wall hit
  // Character fill (README §10, which also covers §4's face fill): shadowless, in front of him just above eye line, short
  // range so it never reaches the wall. Cool under the phone, the fluorescent tone under the zone.
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.07, 2);
  fill.castShadow = false; fill.position.set(...UNIT.fill); scene.add(fill);
  const FILL = { phone: C('phone').lerp(C('navy'), 0.35), zone: C('cream').lerp(C('gator'), 0.15) };   // README §6 tone

  // His desk zone (README §3): dead until the press, then the shared wake. Its fixture is s11's ring pendant (the
  // procedural trough isn't added); the light aims at the 1× mark's foot.
  const zone = sensorLight({ at: UNIT.tube, aimAt: [0, 0, 0.098], intensity: ZONE_I });
  scene.add(zone.light, zone.light.target);

  const tubes = fluorescent({ intensity: FLUOR_I });   // the distant aisle light; flicker 0: its update() is never called
  scene.add(tubes.light);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  const FOCUS = V(UNIT.focus), look = new THREE.Vector3(), dir = new THREE.Vector3();
  const fx = post({ focus: 0.3, aperture: UNIT.aperture, maxblur: UNIT.maxblur, lut: 'marston' });

  const hand = new THREE.Vector3(), far = new THREE.Vector3(), capOff = new THREE.Vector3();

  function update(t) {
    const tc = on2s(t);
    boil(t, 10);

    // camera: A′ locked to PUSH[0], eased push to B′ by PUSH[1], locked after (on 1s)
    const k = ease((t - PUSH[0]) / (PUSH[1] - PUSH[0])), A = CAM_A2, B = CAM_B2;
    camera.position.set(...A.pos.map((v, i) => v + (B.pos[i] - v) * k));
    camera.lookAt(look.set(...A.look.map((v, i) => v + (B.look[i] - v) * k)));
    camera.getWorldDirection(dir);
    const level = zone.update(t, { wake: UNIT.press }), lit = level >= 0.5;   // on 1s; README §4's outshone switch
    pendant(level);
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
    phone.position.y = PHONE[1] + 0.0025 * Math.sin(flip);

    // pen and cap
    const pressing = tc >= dr(5) && tc < dr(14), held = tc >= dr(4) && tc < dr(14);   // grab on 4, press on 5, let go 1.167
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
    // the page: the printed problem, and the name written over drawings 106–119
    page.draw([[INK.problem, 0, 1], [INK.name, 1, (tc - dr(105)) * 12 / 14]]);

    // blob (on 2s)
    exam.update(t, {
      wobble: tc < UNIT.press ? 1.4 : tc >= 5 && tc < 7 ? 0 : 1,
      squash: kick(tc, UNIT.press, 0.3) + kick(tc, 10, 0.35),
      eyes: (tc >= dr(21) && tc < dr(23)) || (tc >= dr(138) && tc < dr(139)) ? 'closed' : tc >= 3.5 && tc < 7 ? 'side' : 'open',
      look: -1, key: lit ? zone.light : phoneSpot,   // README §11: the face fill sits near the blob
    });
    exam.mesh.scale.set(1, tc >= 5 && tc < 7 ? 1 + 0.03 * Math.sin(2 * Math.PI * (tc - 5) / 1.6) : 1, 1);   // breathing
    exam.mesh.rotation.z = kf(tc, [[3.5, 0], [dr(44), 10], [4.5, 10], [dr(58), 0]]) * D;                   // tilts toward him
    exam.mesh.position.set(M[0] + kick(tc, 10, 0.002), Math.abs(tc - dr(45)) < 1e-6 ? 0.001 : 0, M[2]);

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
    poolScale: zone.light.position.y / (zone.light.position.y - BLOB_R.start),
    joints: Object.fromEntries(Object.entries(hero.joints).map(([n, j]) => [n, j.rotation.z])),
  });
  return { update, probe };
}
