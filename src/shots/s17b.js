// s17b · Test day: he recognizes it (docs/shots/s17b.md, G4). New in G4, on the frozen exam_room_kit and props_kit.
// Three setups (README §8): T1 the exam room wide from the back (0–2), T2 his test page from above (2–4, 5.5–9), T3 his
// profile at the exam desk (4–5.5). On the page, problem 3 is the one he practised; the pen stops on it (testRecognise
// 3.0), he smiles (testSmile 4.5) and writes the working in one pass, and the blob shrinks one step (testSolved 8.5).
// Each setup is a Group shown only in its own time, lights included, so nothing leaks across a cut. T2 and T3 share the
// desk unit (page, its ink, the blob, the overhead light). This file exports the page and Camera P for s17c, so the
// graded paper lands where he wrote and carries his own three lines. Characters on 2s, light and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { SHOTS } from '../timeline.js';
import { sensorLight, fluorescent, ambient } from '../lights.js';
import { kf, ease, easeOut, spring, clamp, lerp } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator, greenVariant } from '../characters/gator.js';
import { specPose } from '../characters/poses.js';
import { tools } from './s02.js';

const ID = 's17b', DEG = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;          // examRoom 0, testRecognise 3, testSmile 4.5, testSolved 8.5
const CUT_T2 = 2, CUT_T3 = 4, CUT_BACK = 5.5, HOLD_HERO = 0.75;

// ---------- tunables ----------
const BLOB_R = { start: 0.005, testSolved: 0.004 };      // SHRINK[6] → SHRINK[7] (README §1; exam.js has no SHRINK ladder yet)
const OTHER_R = [0.004, 0.007];                           // the room's blobs, seeded in this range (never cloned)
const ROOM = { table: 0.041, rows: [0.25, 0.19, 0.13, 0.07], x: [-0.32, 0.32], depth: 0.022 };   // 75 cm tables at 0.055 m/m
const SEATED_DROP = 0.022, SEAT_BACK = 0.024;                                // the standing back figure lowered to a seated height
const FLUOR_I = 0.8, WIN_I = 0.15, AMB_K = 0.6;          // T1 (window fill ≤ 30% of the fluorescent); v3: the room is dim, he is the lit one
const CROWD_DIM = 0.45, HERO_I = 3.2;                    // the crowd is tinted toward navy; his spot (cold viewer v2: "a lecture hall of frogs")
const CAM_HERO = { pos: [0.0, 0.115, 0.42], look: [0.004, 0.05, 0.093] };   // the establishing beat: on him, then the room
const SPOT_I = 0.2, AMB_P = 0.45, FILL_T3 = 0.006;        // T2/T3: the overhead spot, ambient, T3 character fill
const ARM_LEN = 0.020;                                    // the flat near arm in the insert (gator_sheet arm_r at insert scale)

// ---------- the desk unit at the exam table (README §2 coordinates) ----------
// The page: props_kit test_page, centred on the unit page; its art is 276 × 380 px with the paper at x 7…270, y 5…371.
export const PAGE = { at: [-0.0205, 0.0003, 0.095], w: 0.0218, px: [276, 380], paper: [7, 5, 270, 371] };
// His working on problem 3, in the page art's pixels: [x, baseline y, runs]; a run is [text, superscript?].
// One pass, the same method and hand as s16's problem 1 (done/spec-g4.md has the working).
export const LINES = [
  { x: 46, y: 321, runs: [['u = x    dv = e'], ['2x', 1], [' dx']] },
  { x: 46, y: 342, runs: [['= (x/2) e'], ['2x', 1], [' − ∫ ½ e'], ['2x', 1], [' dx']] },
  { x: 46, y: 363, runs: [['= (x/2) e'], ['2x', 1], [' − ¼ e'], ['2x', 1], [' + C']] },
];
export const WRITE = [[5.5, 6.5], [6.5, 7.5], [7.5, 8.4]];   // local times per line (s17b's table)
// The hand is Caveat (SIL OFL 1.1, assets/fonts/OFL-Caveat.txt), bundled so a render never depends on the machine's fonts.
// It has no integral sign, so the ∫ is a stroked path (INT) rather than a system fallback glyph.
const FONT = 22, FONT_FACE = 'LoomingHand', INK = 'rgb(30, 42, 63)';
let handLoad = null;
export const loadHand = () => handLoad ??= new FontFace(FONT_FACE, `url(${new URL('assets/fonts/Caveat.ttf', document.baseURI)})`, { weight: '400 700' })
  .load().then((f) => { document.fonts.add(f); });
export const handFont = (px) => `500 ${px}px ${FONT_FACE}`;
// One text run as drawable parts: text pieces (measured in the hand) and integral signs.
export function runParts(g, s, px, x0) {
  const out = []; let x = x0;
  s.split(/(∫)/).forEach((q) => { if (!q) return; g.font = handFont(px);
    const w = q === '∫' ? px * 0.42 : g.measureText(q).width; out.push({ s: q, w, x }); x += w; });
  return out;
}
export function drawInt(g, x, y, px) {   // baseline y; a slanted stem with a hook at each end
  const h = px, w = px * 0.3;
  g.beginPath(); g.moveTo(x + 0.02 * w, y + 0.2 * h); g.quadraticCurveTo(x + 0.35 * w, y + 0.32 * h, x + 0.55 * w, y + 0.02 * h);
  g.lineTo(x + 0.95 * w, y - 0.72 * h); g.quadraticCurveTo(x + 1.2 * w, y - 1.0 * h, x + 1.55 * w, y - 0.8 * h);
  g.lineWidth = px * 0.075; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INK; g.stroke();
}
export const BLOB_AT = [-0.002, 0.098];                   // the page-corner mark (x, z): 2 mm in from 0.000 so it sits on the exam desk's top
// Camera P: high over the lower page (problem 3 and the working), tilted 18° off vertical toward camera so the blob,
// which stands on the page, still shows its face. Cap height 11 px of art ≈ 0.0009 m → ≈ 45 px at 1080p.
export const CAM_P = { pos: [-0.012, 0.0814, 0.1221], look: [-0.012, 0.0003, 0.0965] };
const CAM_T1 = { pos: [0.0, 0.29, 0.70], look: [0.0, 0.045, 0.125] };
const CAM_T3 = { pos: [-0.015, 0.055, 0.400], look: [-0.015, 0.018, 0.086] };
const DESK_K = 1.2;                                       // the exam desk art at 1.2× its scale-table size, so its top holds the page and the blob
const HIP = [-0.054, -0.0134, 0.074];                     // on the chair's seat at DESK_K (seat top −0.0144)

const F = (n) => n / 12, fr = (t) => Math.floor(t * 12 + 1e-6);

// Draws LINES[0..] onto a canvas in page-art pixels × K, line i revealed left to right to fraction f[i]. Returns the
// pen tip's art-pixel position for the line being written.
export function drawLines(g, K, f) {
  g.save(); g.scale(K, K); g.fillStyle = INK; g.textBaseline = 'alphabetic';
  let tip = null;
  LINES.forEach((L, i) => {
    const k = clamp(f[i] ?? 0);
    if (k <= 0) return;
    let x = L.x;
    const parts = L.runs.flatMap(([s, sup]) => { const px = sup ? FONT * 0.62 : FONT, r = runParts(g, s, px, x).map((p) => ({ ...p, px, sup })); x = r.length ? r.at(-1).x + r.at(-1).w : x; return r; });
    const end = L.x + (x - L.x) * k;
    g.save(); g.beginPath(); g.rect(L.x - 2, L.y - FONT * 1.4, end - L.x + 2, FONT * 2); g.clip();
    g.strokeStyle = INK; g.lineWidth = 0.35; g.lineJoin = 'round';
    for (const p of parts) { const y = L.y - (p.sup ? FONT * 0.42 : 0);
      if (p.s === '∫') { drawInt(g, p.x, y, p.px); continue; }
      g.font = handFont(p.px); g.fillText(p.s, p.x, y); g.strokeText(p.s, p.x, y); }
    g.restore();
    if (k < 1) tip = [end, L.y];
  });
  g.restore();
  return tip;
}

// A page lying flat at PAGE.at (top edge toward the wall) with an ink plane over it. setInk(f) redraws the lines when
// their reveal changes; toWorld(px, py) maps a page-art pixel to the world.
export function pageWithInk(T, art, piece, key, { parent }) {
  const page = T.cut(art, piece, [PAGE.w, null], key, { parent });
  page.g.position.set(...PAGE.at); page.g.rotation.set(-Math.PI / 2, 0, 0);
  const [sw, sh] = art.sizes[piece], K = 4, [W, H] = PAGE.px;
  const cv = Object.assign(document.createElement('canvas'), { width: W * K, height: H * K });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const ink = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2 }));
  ink.position.z = 0.00003; ink.receiveShadow = true; page.mesh.add(ink);
  let drawn = null;
  const setInk = (f, extra) => {
    const id = f.map((x) => clamp(x).toFixed(3)).join() + (extra ? 'x' : '');
    if (id === drawn) return; drawn = id;
    const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
    drawLines(g, K, f); extra?.(g, K); tex.needsUpdate = true;
  };
  const v = new THREE.Vector3();
  const toWorld = (px, py, out = new THREE.Vector3()) => { page.g.updateMatrixWorld(true);
    return page.mesh.localToWorld(out.copy(v.set((px / W - 0.5) * sw, (0.5 - py / H) * sh, 0))); };
  // the line's full width in art px (for the pen's travel)
  const meas = cv.getContext('2d');
  const widths = LINES.map((L) => L.runs.reduce((a, [s, sup]) => a + runParts(meas, s, sup ? FONT * 0.62 : FONT, 0).reduce((b, p) => b + p.w, 0), 0));
  return { ...page, setInk, toWorld, widths };
}

// The flat near hand for the page inserts (s17b T2, s17c): gator_sheet's arm_r lying on its side over the page, the
// sleeve off toward the lower left, and (pen: true) props_kit's pen in the mitt, nib at the group's origin.
export function flatHand(T, ctx, { gator, props }, key, { parent, pen = true }) {
  const hand = new THREE.Group(); hand.rotation.x = -Math.PI / 2; parent.add(hand);
  const arm = T.cut(gator, 'arm_r', [ARM_LEN, null], `${key}-arm`, { anchor: [0.88, 0.5], parent: hand });
  arm.g.rotation.z = 40 * DEG; arm.g.position.set(-0.0035, -0.003, 0.0012);
  arm.mesh.castShadow = true;
  let penO = null;
  if (pen) {
    penO = T.cut(props, 'pen', [0.012, null], `${key}-pen`, { anchor: [0, 0.5], parent: hand });
    penO.g.rotation.z = -128 * DEG; penO.g.position.z = 0.0018; penO.mesh.castShadow = true;
  }
  return { hand, arm, pen: penO };
}

// The overhead fixture over his seat (README §2/§3 numbers, no sensor story): sensorLight's spot only.
export function overheadSpot(intensity) {
  const z = sensorLight({ at: [0, 0.127, 0.040], aimAt: [0, 0, BLOB_AT[1]], intensity });
  z.light.shadow.mapSize.set(2048, 2048);
  return z.light;
}

export async function build(ctx) {
  await loadHand();
  const { scene, camera, assets, PALETTE, post } = ctx;
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('cream'), 0.15);
  const T = tools(ctx, ID);
  const [room, props, gsheet] = await Promise.all([assets.load('exam_room_kit'), assets.load('props_kit'), assets.load('gator_sheet')]);
  const t1 = new THREE.Group(), unit = new THREE.Group(), t2 = new THREE.Group(), t3 = new THREE.Group();
  scene.add(t1, unit); unit.add(t2, t3);
  const fx = post({ focus: 0.5, aperture: 0.012, maxblur: 0.01, lut: 'dawn' });

  // ================= T1 · the exam room, from the back =================
  {
    const W = 0.80, Hh = 0.24, pxm = 1600;
    // Far wall: the kit's wall strip (cream, kraft rail, navy dado) along the floor, its cream run on up to the ceiling.
    const s = room.pieces.wall_strip, [u0, v0, u1, v1] = room.visible.wall_strip;
    const sx0 = u0 * s.width + 6, sx1 = u1 * s.width - 6, sy0 = v0 * s.height + 6, sy1 = v1 * s.height - 4;
    const tw = 0.24 * pxm, th = 0.055 * pxm;
    const cv = Object.assign(document.createElement('canvas'), { width: W * pxm, height: Hh * pxm }), g = cv.getContext('2d');
    g.drawImage(s, sx0, sy0, sx1 - sx0, (sy1 - sy0) * 0.25, 0, 0, cv.width, cv.height - th + 2);   // the cream run, stretched
    for (let x = 0; x < cv.width; x += tw) g.drawImage(s, sx0, sy0, sx1 - sx0, sy1 - sy0, x, cv.height - th, tw, th);
    T.group(T.paper('exam_wall', { art: cv, size: [W, Hh], res: 2048 }), [0, Hh / 2, 0], { parent: t1 });
    const fl = T.group(T.paper('exam_floor', { art: T.tiled(room, 'floor_strip', 3, 6), size: [0.84, 0.66], weight: 'kraft', res: 1024 }),
      [0, 0, 0.33], { rot: [-Math.PI / 2, 0, 0], parent: t1 });
    fl.children[0].receiveShadow = true;
    // Board (blank but for chalk scribbles), the clock (ticks only), the door, two tall morning windows.
    T.cut(room, 'board', [0.125, null], 'board', { parent: t1 }).g.position.set(-0.03, 0.0825, 0.0006);
    T.cut(room, 'wall_clock', [0.014, null], 'clock', { parent: t1 }).g.position.set(0.12, 0.10, 0.0008);
    T.cut(room, 'door', [null, 0.11], 'door', { anchor: [0.5, 0], parent: t1 }).g.position.set(-0.33, 0, 0.0006);
    const WIN = C('lamp').lerp(C('cream'), 0.55);
    for (const x of [-0.20, 0.23]) {
      const frame = T.rect(`win${x}`, PALETTE.kraft, [0.062, 0.122], [x, 0.105, 0.0005], { parent: t1 });
      const pane = T.rect(`pane${x}`, '#' + WIN.getHexString(), [0.054, 0.114], [x, 0.105, 0.0009], { parent: t1, weight: 'tissue' });
      const m = pane.children[0].material; m.emissive.copy(WIN); m.emissiveIntensity = 0.8;
      T.rect(`mull${x}`, PALETTE.kraft, [0.003, 0.114], [x, 0.105, 0.0012], { parent: t1 });
      T.rect(`mullh${x}`, PALETTE.kraft, [0.054, 0.003], [x, 0.12, 0.0012], { parent: t1 });
      frame.children[0].receiveShadow = false;
    }
  }
  // Rows of long tables, three or four gators a row from behind, each with a test page and their own small blob.
  const rng = mulberry32(seedOf(ID, 'room'));
  const figures = [], bobbers = [], blobs1 = [];
  const tableCol = '#' + C('kraft').lerp(C('cream'), 0.25).getHexString();
  const seatCol = '#' + C('navy').lerp(C('kraft'), 0.15).getHexString();
  // long thin strips: T.rect's tear margin scales with the long side, which ate a 2 cm deep table; this one is fixed
  const strip = (key, color, [w, h], at, { rot, weight = 'cardstock' }) => {
    const m = 0.0015, W = w + 2 * m, H = h + 2 * m;
    return T.group(T.paper(key, { path: [[m / W, m / H], [1 - m / W, m / H], [1 - m / W, 1 - m / H], [m / W, 1 - m / H]], size: [W, H], color, weight, res: 2048 }),
      at, { rot, parent: t1 });
  };
  let gi = 0;
  for (const [ri, z] of ROOM.rows.entries()) {
    const top = strip(`table${ri}`, tableCol, [ROOM.x[1] - ROOM.x[0], ROOM.depth], [0, ROOM.table, z], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft' });
    top.children[0].receiveShadow = true;
    strip(`apron${ri}`, PALETTE.kraft, [ROOM.x[1] - ROOM.x[0], 0.004], [0, ROOM.table - 0.002, z + ROOM.depth / 2], { weight: 'kraft' });
    strip(`seats${ri}`, seatCol, [ROOM.x[1] - ROOM.x[0], SEAT_BACK], [0, SEAT_BACK / 2, z + ROOM.depth / 2 + 0.019], {});
    const xs = ri === 3 ? [-0.20, 0.0, 0.21] : ri === 0 ? [-0.24, -0.06, 0.12, 0.27] : [-0.27, -0.10, 0.08, 0.25];   // v3: he sits front and centre
    for (const x0 of xs) {
      const hero = ri === 3 && x0 === 0;
      const x = hero ? 0 : x0 + (rng() - 0.5) * 0.03;
      const fig = await makeGator(ctx, { facing: 'back', seed: 30 + gi, res: hero ? 512 : 256, green: hero ? undefined : '#' + new THREE.Color(greenVariant(gi)).lerp(C('navy'), CROWD_DIM).getHexString() });
      fig.group.position.set(x, -SEATED_DROP, z + ROOM.depth / 2 + 0.012);
      fig.group.scale.setScalar(hero ? 1.1 : 0.94 + 0.1 * rng());
      t1.add(fig.group); figures.push(fig);
      if (hero) figures.hero = fig; else if (bobbers.length < 2 && rng() < 0.5) bobbers.push(fig);
      // their page and their blob on the table, to the figure's right
      const pg = T.cut(props, 'test_page', [0.0119, null], `page${gi}`, { parent: t1 });
      pg.g.position.set(x + 0.006, ROOM.table + 0.0003, z + 0.003); pg.g.rotation.set(-Math.PI / 2, 0, (rng() - 0.5) * 0.3);
      const r = hero ? BLOB_R.start : lerp(OTHER_R[0], OTHER_R[1], rng());
      const b = createBlob({ radius: r, seed: hero ? 1 : 40 + gi });
      const bx = x + 0.028 + rng() * 0.006;
      b.mesh.position.set(bx, ROOM.table, z + 0.004); b.stain.position.set(bx, ROOM.table + 0.0003, z + 0.004);
      b.stain.material.opacity = 0.25;
      t1.add(b.mesh, b.stain);
      blobs1.push({ b, eyes: hero ? 'closed' : rng() < 0.5 ? 'open' : 'closed', look: rng() < 0.5 ? -1 : 1 });
      gi++;
    }
  }
  // T1 light: the ceiling fluorescents from above and a little behind the room (pools fall toward camera), the windows'
  // morning fill from the far wall, low ambient.
  const tubes = fluorescent({ intensity: FLUOR_I });
  tubes.light.position.set(0.15, 1.5, 0.75); tubes.light.target.position.set(0, 0, 0.15);   // from over the camera's shoulder: the backs face it
  Object.assign(tubes.light.shadow.camera, { left: -0.45, right: 0.45, top: 0.45, bottom: -0.45 });
  tubes.light.shadow.mapSize.set(4096, 4096);
  const win = new THREE.DirectionalLight(C('lamp').lerp(C('cream'), 0.5), WIN_I); win.position.set(0, 0.3, -1); win.target.position.set(0, 0, 0.2);
  const amb1 = ambient(); amb1.intensity *= AMB_K;
  // His pool: a narrow warm spot from over the camera onto him, his page and his blob; nothing else in the room gets one.
  const heroSpot = new THREE.SpotLight(C('lamp').lerp(C('cream'), 0.55), HERO_I, 0, 0.13, 0.9, 2);
  heroSpot.position.set(0.02, 0.36, 0.55); heroSpot.target.position.set(0.012, 0.045, 0.093);
  t1.add(tubes.light, tubes.light.target, win, win.target, amb1, heroSpot, heroSpot.target);

  // ================= the desk unit (T2 and T3) =================
  const page = pageWithInk(T, props, 'test_page', 'test_page', { parent: unit });
  page.mesh.receiveShadow = true;
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.mesh.position.set(BLOB_AT[0], 0, BLOB_AT[1]); exam.stain.position.set(BLOB_AT[0], 0.0006, BLOB_AT[1]);
  unit.add(exam.mesh);   // no stain: it's a test page, and the pool reads
  const spot = overheadSpot(SPOT_I);
  const ambP = ambient(); ambP.intensity *= AMB_P;
  const winP = new THREE.DirectionalLight(C('lamp').lerp(C('cream'), 0.5), 0.15); winP.position.set(0.3, 0.4, -0.6);
  unit.add(spot, spot.target, ambP, winP);

  // ---- T2: the exam table top filling the frame, and his flat near hand with the pen ----
  T.rect('t2_table', '#' + C('kraft').lerp(C('navy'), 0.12).getHexString(), [0.12, 0.08], [-0.012, 0, 0.095], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft', parent: t2 })
    .children[0].receiveShadow = true;
  const flat = flatHand(T, ctx, { gator: gsheet, props }, 't2hand', { parent: t2 });

  // ---- T3: the exam desk side-on (the tablet desk and its chair), a flat top under the page, him ----
  {
    // anchor: the desk top's left end (art px 189, 99; the opaque box is x 6…423, y 7…329) at the unit's (−0.040, 0)
    const k = DESK_K, desk = T.cut(room, 'exam_desk_side', [0.0643 * k, null], 'exam_desk', { anchor: [(189 - 6) / 417, (329 - 99) / 322], parent: t3 });
    desk.g.position.set(-0.040, 0, 0.066);
  }
  T.rect('t3_top', tableCol, [0.044, 0.048], [-0.018, 0, 0.092], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft', parent: t3 }).children[0].receiveShadow = true;
  T.rect('t3_floor', '#' + C('kraft').lerp(C('navy'), 0.35).getHexString(), [0.5, 0.3], [0, -0.043, 0.1], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft', parent: t3 });
  T.rect('t3_wall', '#' + C('cream').lerp(C('kraft'), 0.2).getHexString(), [0.6, 0.3], [0, 0.10, -0.02], { parent: t3 });
  const hero = await makeGator(ctx, { seed: 2, res: 1024 });
  hero.group.position.set(...HIP); t3.add(hero.group);
  const pen3 = T.cut(props, 'pen', [0.012, null], 't3pen', { anchor: [0, 0.5], parent: t3 });
  const fill3 = new THREE.PointLight(C('cream').lerp(C('gator'), 0.15), FILL_T3, 0.08, 2); fill3.position.set(-0.03, 0.045, 0.13);
  t3.add(fill3);
  const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
  const P3 = { write: seat({ lean: 12, arm: -26, head: -8 }), breath: seat({ lean: 11, arm: -27, head: -8 }), lean: seat({ lean: 16, arm: -22, head: -10 }) };
  const BODY3 = [[0, 'write'], [4.333, 'write'], [4.334, 'breath'], [4.999, 'breath'], [5.0, 'lean'], [6, 'lean']];

  // ---- the pen's path over the page (T2), in page-art px ----
  const L0 = LINES[0], startPx = [L0.x - 2, L0.y - 3];
  const tipAt = (t, f) => {   // [px, py, lift (m)]
    if (t < 3) { const k = easeOut((t - 2) / 1); return [lerp(startPx[0] - 70, startPx[0] + 4, k), lerp(startPx[1] + 55, startPx[1], k), 0.003]; }
    if (t < WRITE[0][0]) return [startPx[0] + 4, startPx[1], 0.003];
    for (let i = 0; i < 3; i++) if (t < WRITE[i][1] || (i === 2 && t < B.testSolved)) {
      const k = clamp(f[i]), L = LINES[i];
      return [L.x + page.widths[i] * k, L.y - 3 + 1.5 * Math.sin(k * 40), t >= WRITE[i][1] ? 0.0012 : 0.0004];
    }
    const k = ease((t - B.testSolved - 0.1) / 0.4);   // lifts, then drifts to the next line's start
    return [lerp(LINES[2].x + page.widths[2], LINES[0].x + 10, k), lerp(LINES[2].y - 3, LINES[2].y + 14, k), 0.002];
  };
  const tip = new THREE.Vector3(), hp = new THREE.Vector3(), look = new THREE.Vector3(), dir = new THREE.Vector3();

  return {
    update(t) {
      T.boil(t);
      const f = fr(t), tc = F(f);
      const inT1 = t < CUT_T2, inT3 = t >= CUT_T3 && t < CUT_BACK, inT2 = !inT1 && !inT3;
      t1.visible = inT1; unit.visible = !inT1; t2.visible = inT2; t3.visible = inT3;

      // the writing: each line revealed over its time, on 2s; the pen tip follows the reveal
      const fl = WRITE.map(([a, b]) => clamp((tc - a) / (b - a)));
      page.setInk(fl);

      // The Exam: dozing, eyes open on him at 3.0, meets his look and stretches on the smile, calm, then the shrink.
      const solved = tc >= B.testSolved - 1e-6, s = solved ? BLOB_R.testSolved / BLOB_R.start : 1;
      let eyes = tc < B.testRecognise ? 'closed' : 'open', squash = 0, look1 = -1;
      if (inT3 && tc >= 4.333) eyes = 'side';
      if (tc >= B.testSmile && tc < 5.0) squash = -0.1;
      if (solved) squash = 0.3 * Math.exp(-6 * (tc - B.testSolved)) * Math.cos(18 * (tc - B.testSolved));
      exam.mesh.scale.setScalar(s); exam.stain.scale.setScalar(s);
      exam.mesh.rotation.x = inT2 ? -55 * DEG : 0;   // in the overhead insert it leans back to face the lens
      exam.update(t, { squash, wobble: 0.6, eyes, look: look1, key: spot });

      if (inT1) {
        // 0–0.75 held on him; then it eases out to the wide (the room, with him still front and centre). On 1s.
        const k = ease(clamp((t - HOLD_HERO) / (CUT_T2 - HOLD_HERO)));
        camera.position.set(...CAM_HERO.pos.map((v, i) => lerp(v, CAM_T1.pos[i], k)));
        camera.lookAt(look.set(...CAM_HERO.look.map((v, i) => lerp(v, CAM_T1.look[i], k))));
        fx.set({ focus: camera.position.distanceTo(hp.set(0, 0.05, 0.093)), aperture: lerp(0.004, 0.009, k) });
        for (const fig of figures) fig.boil(t, 10);
        // he reads: 2 more degrees of head-down at 1.5, a hair lower on the figure; two pens bob on 2s
        figures.hero.group.position.y = -SEATED_DROP - (tc >= 1.5 ? 0.0006 : 0);
        bobbers.forEach((b, i) => { b.group.rotation.z = (f + i) % 4 < 2 ? 1 * DEG : -1 * DEG; });
        blobs1.forEach(({ b, eyes: e, look: l }) => b.update(t, { wobble: 0.5, eyes: e, look: l, key: tubes.light }));
        return;
      }

      if (inT2) {
        camera.position.set(...CAM_P.pos); camera.lookAt(look.set(...CAM_P.look));
        fx.set({ focus: camera.position.distanceTo(look), aperture: 0.002 });
        const [px, py, lift] = tipAt(tc, fl);
        page.toWorld(px, py, tip);
        flat.hand.position.set(tip.x, 0.0006 + lift, tip.z);
        return;
      }

      // T3: profile, the breath and the smile, the lean in to write
      camera.position.set(...CAM_T3.pos); camera.lookAt(look.set(...CAM_T3.look)); camera.getWorldDirection(dir);
      fx.set({ focus: dir.dot(hp.set(-0.02, 0.02, 0.09).sub(camera.position)), aperture: 0.01 });
      hero.boil(t, 10);
      hero.blend(P3, BODY3, t);
      hero.group.position.y = HIP[1] - (tc >= 4.333 && tc < 5 ? 0.0005 : 0);
      hero.face({ eyes: tc >= 4.333 && tc < B.testSmile ? 'side' : 'open', mouth: tc >= B.testSmile ? 'smile' : 'line' });
      hero.group.updateMatrixWorld(true);
      hero.hand.getWorldPosition(hp);
      pen3.g.rotation.set(0, 0, 125 * DEG); pen3.g.position.set(hp.x + 0.003, hp.y - 0.003, 0.0868);
    },
  };
}
