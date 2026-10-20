// @ts-check
// s15 · The name (docs/shots/s15.md, v4). 8 s, Camera B′ locked, with one close-up. No sensor (the light has been on
// since s10), no phone light (it's face-down since s11), no laptop. He picks up the pen, uncaps it (penUncap 1.5),
// hesitates, writes his name at the top of the practice sheet (nameWritten 4.5), and the blob flinches. He looks at it;
// cut to the close-up on the painted surprised_smile head (nameSmile 5.5): the first mark is smaller than he thought.
// Back on B′ at 7.5 he moves the pen to problem line 1, the brace s16 opens on. s11's desk set (marstonDesk), the 2.5×
// blob (Q16) at the Marston mark under the ring pendant's constant warm light. Only the blob casts.
// Characters and the props he handles on 2s; light and camera on 1s.
// UNIT below is the pre-G4 master that s16 imports: its values are left as they were. s16 also imports BLOB_AT, PHONE,
// PAGE, CAM_B2 and the practice-sheet helpers from here.
import * as THREE from 'three';
import { sensorLight, fluorescent, ambient } from '../lights.ts';
import { kf, clamp } from '../core/ease.ts';
import { makeGator } from '../characters/gator.ts';
import { createBlob } from '../blob.ts';
import { POSES, specPose } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import { SHOTS } from '../timeline.ts';
import { kitTools, marstonDesk, MARK, castOnly } from './s11.js';
import { closeupRig, HEAD_AT } from './s09b.js';
import { loadHand, handFont, runParts, drawInt } from './s17b.js';
import { mulberry32, seedOf } from '../core/rng.ts';

const ID = 's15', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;            // penUncap 1.5, nameWritten 4.5, nameSmile 5.5
const dr = (n) => n / 12;                                    // drawing n (12 fps) → local seconds
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;          // onTwos, but 100.0833 − 100 = 0.08333333333332860 floors to drawing 0 there (evidence/anim-s15/ontwos.txt)

// ---------- the pre-G4 master numbers (imported by s16; not this shot's staging) ----------
export const UNIT = {
  hip: [-0.075, -0.012], bodyZ: 0.074,                       // gator root (makeGator puts the near arm at +0.012 → z 0.086)
  camA: /** @type {CamKey} */ ({ pos: [-0.010, 0.118, 0.392], look: [-0.010, 0.0385, 0.080] }),   // spec look y 0.030, tilted up 1.45° (loom fix)
  camB: /** @type {CamKey} */ ({ pos: [-0.022, 0.090, 0.292], look: [-0.022, 0.020, 0.084] }),
  focus: /** @type {Vec3} */ ([-0.024, 0.020, 0.086]), aperture: 0.02, maxblur: 0.01,
  fill: /** @type {Vec3} */ ([-0.046, 0.040, 0.114]),                             // character fill (README §10): before him, just above eye line
  tube: /** @type {Vec3} */ ([0, 0.127, 0.040]),                                   // the pendant's light (README §3's trough position)
  blob: [0, 0.012, 0.0884], phone: [-0.010, 0.0015, 0.116], phoneLight: [-0.014, 0.006, 0.116],
  press: 0.5,                                                // G4's press drawing (kept for the importers' numbers)
};

// ---------- v4 (this shot) ----------
const BLOB_R = { start: 0.030 };                             // 2.5×, the v4 peak (README §1, Q16)
// The Marston mark (README §1), moved BLOB_DX along +x: at B′ the 9.3 cm cut gator's snout (cut-gator) reached the
// 2.5× blob. 0 puts it back on the spec's mark. s11 and s13 use the same spot.
export const BLOB_DX = 0.016;
export const BLOB_AT = (r) => { const m = MARK(r); return [m[0] + BLOB_DX, 0, m[2]]; };
export const PHONE = /** @type {Vec3} */ ([-0.010, 0.0015, 0.114]), PHONE_L = [-0.010, 0.004, 0.114];   // rest spot (and G4's light above it)
export const CAM_A2 = /** @type {CamKey} */ ({ pos: [0.025, 0.239, 0.642], look: [0.025, 0.080, 0.080] });    // Camera A′ (README §8; G4's opening)
export const CAM_B2 = /** @type {CamKey} */ ({ pos: [-0.010, 0.112, 0.358], look: [-0.010, 0.020, 0.084] });  // Camera B′
export const PAGE = /** @type {Vec3} */ ([-0.0205, 0.0003, 0.095]);                // page centre (x −0.033…−0.008, z 0.080…0.110)
const CU = [B.nameSmile, 7.5];                               // the close-up's cut in and out
// CU: level with his head from in front, close enough that the painted head fills the frame's left half and the blob's
// eyes are in at the right, so "he and the blob look at each other" holds in one frame.
const CAM_CU = /** @type {CamKey} */ ({ pos: [-0.028, 0.036, 0.074 + 0.24], look: [-0.028, 0.036, 0.074] });
const WARM = 0.3;                                            // v4 Marston warm: lerp(lamp, cream, 0.3) (README v4)
// Intensities, by eye on the sheet: G4's lit zone (the old lamp pool at the blob), its fill and ambient.
const ZONE_I = 0.25, FLUOR_I = 0.25, AMB_K = 0.6, FILL_I = 0.02, CU_KEY = 0.010;   // ZONE_I: s11's 0.8 blew the desk out from B′'s height

// ---------- the hand: s15's table, to the pen and the name ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });   // poses.js's seated legs
const P = {
  ...POSES,
  settle: seat({ lean: 6, arm: -30 }),        // 0.0: hands flat on the desk either side of the page (s11's end)
  pen_reach: seat({ lean: 19, arm: -15 }),    // 0.5: hand 3 mm over the capped pen
  pen_touch: seat({ lean: 21, arm: -19 }),    // 0.75: fingertip on the pen, picks it up
  squeeze: seat({ lean: 10, arm: -8, far: -6 }),   // 1.17: hands 1 mm closer
  line1: seat({ lean: 14, arm: -21 }),        // 7.5–8.0: tip 2 mm above the desk at problem line 1 (s16's first pose)
};
const WRITE = ['write_a', 'write_b', 'write_c'];
const NAME = [dr(28), dr(54)];                               // 2.333–4.5: the name, 26 drawings
const BODY = [
  [0, 'settle'], [dr(5), 'settle'], [dr(6), 'pen_reach'], [dr(8), 'pen_reach'], [dr(9), 'pen_touch'], [dr(11), 'pen_touch'],
  [dr(12), 'uncap'], [dr(13), 'uncap'], [dr(14), 'squeeze'], [dr(17), 'squeeze'], [dr(18), 'uncap_pull'], [dr(19), 'uncap_pull'],
  [dr(22), 'poise'], [dr(27), 'poise'],
  ...Array.from({ length: 26 }, (_, i) => [dr(28 + i), WRITE[i % 3]]),
  [dr(54), 'poise'], [7.5 - dr(1), 'poise'], [7.5, 'line1'],
];
// Head on body (deg, + snout up), added after act(): 4.5–5.0 down 4° at the name; up 3° on the smile (in the CU).
const HEAD = [[dr(54), 0], [dr(56), -4], [B.nameSmile - dr(1), -4], [B.nameSmile, 3], [7.5 - dr(1), 3], [7.5, -4]];
// The acting kit: quiet resolve; the smile is pride's wide → smile (README §12), played on the painted head in the CU;
// resolve again for the brace. The 4-drawing flicker of dread (2.00–2.33) is too short for a preset (12-frame hold), so
// it's the brow alone, set after act(): brows up.
/** @type {[number, string][]} */
const CUES = [[-0.1, 'resolve'], [B.nameSmile, 'pride'], [7.5, 'resolve']];
const FLICKER = [2.0, NAME[0]], DREAD_BROW = [32, -4];
/** @type {[number, number, string][]} */
const EYES = [[5.0, B.nameSmile, 'side']];                  // 5.0: eyes to the blob (it just flinched)

// The blob's startle and flinch: spring()'s own damping (k 6, w 18) in cosine phase, so the kick peaks on the beat frame.
const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));

// ---------- the practice sheet (props_kit practice_1 / practice_2), shared with s16 ----------
// The frozen sheets come with the writing already painted, but at ~300 px a sheet its pen lines blur in the inserts.
// So the painting supplies only the paper (props_kit blank_page, the same sheet with nothing on it) and the writing is
// drawn by code in his hand at K = 4 canvas px per sheet px, the way s17b draws the test page: Caveat (s17b's
// handFont), the ∫ and Σ and → as stroked paths. Each line sits in its painted box (SHEET_INK, [x0, y0, x1, y1] in the
// sheet's own pixels, measured on the cut PNGs), so the reveals and the insert's pen keep their places. Layers: 0 navy
// pen, 1 grey pencil (the name, and problem 1's strike-through, waiting for the cross-out), 2 = 0 (it was the painting
// with the strike healed out; drawn, the navy layer never had it). plus/plusY/heal/strike: the painted '+' stems and
// strike rows, kept for importers.
export const SHEET_INK = {
  practice_1: { name: [27, 38, 114, 56], problem: [31, 76, 158, 132], a: [26, 162, 262, 210], b: [28, 225, 230, 250],
    strike: [6, 236, 244, 245], heal: [24, 237, 234, 244], c: [33, 273, 206, 298], plus: [118, 180], plusY: 240 },
  practice_2: { name: [30, 37, 118, 56], problem: [30, 77, 143, 129], frac: [32, 167, 100, 225], arrow: [117, 167, 225, 225],
    word: [34, 255, 143, 278] },
};
const NAVY = [30, 42, 63], GREY = [95, 92, 90];   // medians measured on practice_1 (pen ink, the strike)
const K = 4, PX = 30 * K, BOLD = 0.035;   // canvas px per sheet px; the hand on the work canvas (fitted down); its stroke (em)
// What's written, copied from the paintings (done/spec-g4.md has the math; line b is wrong on purpose, a sign error).
// A token is text (∫ inside is a stroke), [text, 1] a superscript, { sum }, { arrow }, { frac: [num, den] } or
// { scribble } (the name: the painting's pencil squiggle, not letters).
const X = /** @type {[string, number]} */ (['x', 1]);
const WRITING = {
  practice_1: [
    ['name', 1, [{ scribble: 1 }]],
    ['problem', 0, ['1.  ∫ x e', X, ' dx']],
    ['a', 0, ['∫ x e', X, ' dx = x e', X, ' − ∫ e', X, ' dx']],
    ['b', 0, ['= x e', X, ' + e', X, ' + C']],
    ['c', 0, ['= x e', X, ' − e', X, ' + C']],
  ],
  practice_2: [
    ['name', 1, [{ scribble: 2 }]],
    ['problem', 0, ['2. ', { sum: 1 }, ' ', { frac: [['n'], ['2', ['n', 1]]] }]],
    ['frac', 0, [{ frac: [['(n + 1)'], ['2n']] }]],
    ['arrow', 0, [{ arrow: 1 }, ' ', { frac: [['1'], ['2']] }, '  < 1']],
    ['word', 0, ['converges']],
  ],
};
// Draws tokens at baseline y from x on g (work-canvas px, hand size px); returns the advance.
function typeset(g, toks, px, x, y, col) {
  const x0 = x, lw = px * 0.075;
  g.fillStyle = g.strokeStyle = col; g.lineWidth = BOLD * px; g.lineCap = g.lineJoin = 'round';
  for (const t of toks) {
    if (typeof t === 'string' || Array.isArray(t)) {
      const [s, sup] = typeof t === 'string' ? [t, 0] : t, q = sup ? px * 0.62 : px, yy = y - (sup ? px * 0.46 : 0);
      if (sup) x += px * 0.09;   // Caveat's letters lean right: a superscript set flush sits on the e
      for (const p of runParts(g, s, q, x)) {
        if (p.s === '∫') drawInt(g, p.x, yy, q);
        else { g.font = handFont(q); g.fillStyle = g.strokeStyle = col; g.lineWidth = BOLD * q; g.fillText(p.s, p.x, yy); g.strokeText(p.s, p.x, yy); }
        x = p.x + p.w;
      }
      g.fillStyle = g.strokeStyle = col;
    } else if (t.sum) {   // Σ: top bar, in to the waist, out to the foot
      const w = px * 0.55, top = y - px * 0.72, bot = y + px * 0.04;
      g.lineWidth = lw; g.beginPath(); g.moveTo(x + w, top + px * 0.06); g.lineTo(x + w * 0.96, top); g.lineTo(x, top);
      g.lineTo(x + w * 0.55, (top + bot) / 2); g.lineTo(x, bot); g.lineTo(x + w, bot); g.lineTo(x + w * 1.02, bot - px * 0.07); g.stroke();
      x += w + px * 0.1;
    } else if (t.arrow) {
      const w = px * 0.8, ay = y - px * 0.3, hd = px * 0.2;
      g.lineWidth = lw * 0.8; g.beginPath(); g.moveTo(x, ay); g.lineTo(x + w, ay);
      g.moveTo(x + w - hd, ay - hd * 0.85); g.lineTo(x + w, ay); g.lineTo(x + w - hd, ay + hd * 0.85); g.stroke();
      x += w + px * 0.1;
    } else if (t.frac) {   // numerator over a bar over the denominator, both centred, at 0.85 size
      const q = px * 0.85, meas = (tk) => { const c = document.createElement('canvas').getContext('2d'); return typeset(c, tk, q, 0, 0, col); };
      const [wn, wd] = t.frac.map(meas), bw = Math.max(wn, wd) + px * 0.25, bar = y - px * 0.3;
      typeset(g, t.frac[0], q, x + (bw - wn) / 2, bar - px * 0.16, col);
      typeset(g, t.frac[1], q, x + (bw - wd) / 2, bar + px * 0.72, col);
      g.lineWidth = lw * 0.8; g.beginPath(); g.moveTo(x, bar); g.lineTo(x + bw, bar); g.stroke();
      x += bw + px * 0.08;
    } else if (t.scribble) {   // a cursive pencil squiggle: a lead-in and four humps trailing off
      const r = mulberry32(seedOf('practice-name', t.scribble)), h = px * 0.32;
      g.lineWidth = px * 0.06; g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + px * 0.1, y - h * 1.6, x + px * 0.28, y - h * 1.4);
      let cx = x + px * 0.28;
      for (let i = 0; i < 5; i++) {
        const hw = px * (0.26 + 0.06 * r()), hh = h * (1.1 - 0.12 * i + 0.2 * r());
        g.bezierCurveTo(cx + hw * 0.2, y - hh * 1.3, cx + hw * 0.8, y - hh * 1.3, cx + hw, y - h * 0.1);
        cx += hw;
      }
      g.quadraticCurveTo(cx + px * 0.3, y - h * 0.9, cx + px * 0.55, y - h * 0.7);
      g.stroke(); x = cx + px * 0.55;
    }
  }
  return x - x0;
}
// Ink bounds of a canvas (alpha > 8) as [x0, y0, x1, y1].
function bounds(c) {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1 + 1, y1 + 1];
}
// The sheet's writing as [navy, grey, navy] canvases at W·K × H·K. Each line at the largest size that fits its painted
// box (so the sizes are the painting's), left-aligned in it and centred on it vertically.
function inkLayers(which, W, H) {
  const out = [0, 1].map(() => Object.assign(document.createElement('canvas'), { width: W * K, height: H * K }));
  const lines = WRITING[which] ?? [], box = SHEET_INK[which];
  const cut = lines.map(([k, l, toks]) => {
    const c = Object.assign(document.createElement('canvas'), { width: PX * 14, height: PX * 3 }), g = c.getContext('2d');
    typeset(g, toks, PX, PX * 0.5, PX * 2, `rgb(${l ? GREY : NAVY})`);
    return { b: box[k], l, c, r: bounds(c) };
  });
  const fit = ({ b, r }) => Math.min((b[2] - b[0]) * K / (r[2] - r[0]), (b[3] - b[1]) * K / (r[3] - r[1]));
  for (const q of cut) {
    const k = fit(q), [x0, y0, x1, y1] = q.r, w = (x1 - x0) * k, h = (y1 - y0) * k;
    out[q.l].getContext('2d').drawImage(q.c, x0, y0, x1 - x0, y1 - y0, q.b[0] * K, ((q.b[1] + q.b[3]) / 2) * K - h / 2, w, h);
  }
  if (which === 'practice_1') {   // the strike-through: one fast grey pencil stroke, a little uphill, across line b
    const g = out[1].getContext('2d'), [x0, , x1] = box.strike, y = 240.5;
    g.strokeStyle = `rgb(${GREY})`; g.lineCap = 'round'; g.lineWidth = 5 * K; g.beginPath();
    g.moveTo((x0 + 3) * K, (y + 0.8) * K); g.quadraticCurveTo(((x0 + x1) / 2) * K, (y + 0.2) * K, (x1 - 3) * K, (y - 1) * K); g.stroke();
  }
  return [...out, out[0]];
}
// A sheet lying flat at `at` (centre), top edge toward the wall: blank paper that boils with the set, and an ink plane
// over it whose canvas is redrawn only when the reveal state changes. The hand font must be loaded (s17b's loadHand).
// draw(spans, extra): spans = [[box, layer (0 navy, 1 grey, 2 navy), fraction revealed left to right]]; extra(g, K)
// draws code pen strokes in sheet pixels (K = canvas px per sheet px).
/** @param {{ props: any, sheet: Function, which: string, at: Vec3, key: string, parent: THREE.Object3D }} o */
export function practiceSheet({ props, sheet, which, at, key, parent }) {
  const img = props.pieces[which], [w, h] = props.sizes[which], [u0, v0, u1, v1] = props.visible[which];
  const holder = new THREE.Group(); holder.rotation.x = -Math.PI / 2; holder.position.set(...at); parent.add(holder);
  const [bw, bh] = props.sizes.blank_page, [b0, c0, b1, c1] = props.visible.blank_page;
  const blank = sheet({ art: props.pieces.blank_page, size: [bw, bh], key, res: 1024 }, holder);
  blank.position.set((0.5 - (b0 + b1) / 2) * bw, ((c0 + c1) / 2 - 0.5) * bh, 0);
  const layers = props.proxy ? null : inkLayers(which, img.width, img.height);
  const ink = Object.assign(document.createElement('canvas'), { width: img.width * K, height: img.height * K });
  const tex = new THREE.CanvasTexture(ink); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
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
      const sx = (x0 - 1) * K, sy = (y0 - 1) * K, sw = (xe - x0 + 1) * K, sh = (y1 - y0 + 3) * K;
      g.drawImage(layers[l], sx, sy, sw, sh, sx, sy, sw, sh);
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
  await loadHand();
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const tools = kitTools(ID), { sheet, boil } = tools;
  const { pendant } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  const [props, kitp] = await Promise.all(['study_props_sheet', 'props_kit'].map((n) => assets.load(n)));
  // An asset piece in a holder whose origin is the centre of the piece's visible shape, so the spec's boxes place it.
  /** @param {import('../assets.ts').Kit} a @param {string} name @param {{ weight?: string, res?: number, parent?: THREE.Object3D, key?: string }} [o] */
  const cut = (a, name, { weight, res = 512, parent = scene, key = name } = {}) => {
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${key}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };   // lying on the desk: local +y runs away from camera

  // ---------- set: s11's desk unit, the backpack behind the chair, the phone face-down at the rest spot ----------
  { const b = cut(props, 'backpack_side'); b.position.set(-0.145, -0.034 + 0.02, 0.028); }
  const phone = new THREE.Group(); phone.position.set(...PHONE); phone.rotation.x = Math.PI; scene.add(phone);
  { const back = cut(kitp, 'phone_face_down', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }

  // ---------- props he handles ----------
  // The page: problem 1's practice sheet, its printed problem showing, his name revealed under the pen (2.333–4.5).
  const page = practiceSheet({ props: kitp, sheet, which: 'practice_1', at: PAGE, key: `${ID}-page`, parent: scene });
  const INK = SHEET_INK.practice_1;
  // pen + cap (props_kit): the pen holder's origin is its tip (+x end) so it can hang off the fingertip. The painted pen
  // points −x, so it's mirrored.
  const pen = new THREE.Group(); scene.add(pen);
  { const p = cut(kitp, 'pen', { parent: pen }); p.position.x = -0.006; p.scale.x = -1; }
  const cap = new THREE.Group(); scene.add(cap); cut(kitp, 'pen_cap', { parent: cap }).scale.x = -1;

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
  scene.add(hero.group);
  const cu = await closeupRig({ assets }, tools, ['surprised_smile'], { seed: 15 });   // README §12: the painted head
  cu.rig.group.position.copy(hero.group.position); scene.add(cu.rig.group);
  const M = BLOB_AT(BLOB_R.start);
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.stain.position.set(M[0], 0.0004, M[2]);
  scene.add(exam.mesh, exam.stain);
  castOnly(scene, [exam.mesh]);                              // only the blob casts (README v4)

  // ---------- light: s11's, constant ----------
  const warm = C('lamp').lerp(C('cream'), WARM);
  const zone = sensorLight({ at: UNIT.tube, aimAt: [0, 0, 0.098], intensity: ZONE_I });
  zone.light.color.copy(warm); zone.light.shadow.mapSize.set(2048, 2048);
  scene.add(zone.light, zone.light.target);
  pendant(1);
  const fill = new THREE.PointLight(warm, FILL_I, 0.07, 2);   // README §10: shadowless, before him just above eye line
  fill.position.set(...UNIT.fill); scene.add(fill);
  // CU key: the pendant's light as it falls on a profile cutout (it's edge-on from straight above): just above and in
  // front of the brow, no shadow (s10's CU key).
  const cuKey = new THREE.PointLight(warm, 0, 0.09, 2); cuKey.position.set(-0.040, 0.075, 0.105); scene.add(cuKey);
  const tubes = fluorescent({ intensity: FLUOR_I });   // the distant room light; flicker 0: its update() is never called
  tubes.light.castShadow = false; scene.add(tubes.light);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  const FOCUS = V(UNIT.focus), look = new THREE.Vector3(), dir = new THREE.Vector3(), fv = new THREE.Vector3();
  const fx = post({ focus: 0.3, aperture: UNIT.aperture, maxblur: UNIT.maxblur, lut: 'amber' });
  const hand = new THREE.Vector3(), far = new THREE.Vector3();

  function update(t) {
    const tc = on2s(t), close = t >= CU[0] && t < CU[1];
    boil(t, 10);

    // camera on 1s: B′ locked, the CU, B′ again
    const cam = close ? CAM_CU : CAM_B2;
    camera.position.set(...cam.pos); camera.lookAt(look.set(...cam.look)); camera.getWorldDirection(dir);
    fx.set({ focus: dir.dot(fv.copy(close ? look : FOCUS).sub(camera.position)), aperture: close ? 0.008 : UNIT.aperture });

    // the Student: the rig on B′, the close-up rig (same pose and hip) in the CU
    hero.group.visible = !close; cu.rig.group.visible = close;
    for (const r of [hero, cu.rig]) {
      r.boil(t, 10);
      r.blend(P, /** @type {[number, string][]} */ (BODY), tc + 1e-6);
    }
    const f = act(hero, t, CUES, { slump: 0, breath: tc >= FLICKER[0] && tc < NAME[0] ? 30 : 6, seed: 15 });
    hero.joints.head.rotation.z += kf(tc, HEAD) * D;
    if (tc >= FLICKER[0] && tc < FLICKER[1]) { hero.joints.brow.rotation.z = DREAD_BROW[0] * D; }
    const look2 = EYES.find(([a, b]) => tc >= a && tc < b);
    if (look2 && f.eyes !== 'closed') hero.face({ eyes: look2[2], mouth: f.mouth });
    cu.show('surprised_smile');
    cu.rig.joints.head.rotation.z += kf(tc, HEAD) * D;
    cu.holder.position.y = HEAD_AT[1] + (tc >= B.nameSmile && tc < B.nameSmile + 0.25 ? 0.0006 : 0);   // the laugh-breath out
    hero.group.updateMatrixWorld(true);
    hero.hand.getWorldPosition(hand); hero.hands.arm_l.getWorldPosition(far);

    // pen and cap. The pen's z is the drawing plane (0.0868, the flat-puppet cheat): the name line is behind it.
    const held = tc >= dr(9), levelPen = tc >= dr(12) && tc < dr(18), writing = tc >= NAME[0] && tc < NAME[1];
    if (!held) {   // on the page's front edge, x −0.028…−0.016
      pen.position.set(-0.016, 0.0006, 0.106); pen.rotation.set(-Math.PI / 2, 0, 0);
    } else {       // tip on the fingertip: level for the uncap, else 45° down-forward; touching y 0 while writing
      pen.rotation.set(0, 0, levelPen ? 0 : -Math.PI / 4);
      const bob = writing ? (Math.round(tc * 12) % 2) * 0.0005 : 0;
      const tremble = tc >= dr(22) && tc < NAME[0] ? 0.0003 * (Math.round(tc * 12) % 2 ? 1 : -1) : 0;
      const y = writing ? 0.0002 + bob : levelPen ? 0.012 : tc >= dr(22) && tc < NAME[0] ? 0.0015 + tremble
        : tc >= NAME[1] && tc < 7.5 ? 0.0022 : tc >= 7.5 ? 0.002 : hand.y + 0.0003;
      pen.position.set(hand.x + (levelPen ? 0.006 : 0), y, 0.0868);
    }
    if (tc < B.penUncap) {   // on the pen's tip end until the uncap
      cap.rotation.copy(pen.rotation);
      cap.position.copy(pen.position).add(fv.set(-0.002, 0, 0).applyEuler(pen.rotation)).add(fv.set(0, 0.0002, 0.0002));
    } else if (tc < dr(22)) {   // 1.5: jerked back 5 mm in the far hand in one drawing, then set down by 1.833
      const s = clamp((tc - dr(19)) / (dr(22) - dr(19)));
      cap.rotation.set(0, 0, 0);
      const x0 = far.x - 0.005, y0 = far.y;
      cap.position.set(x0 + (-0.030 - x0) * s, y0 + (0.001 - y0) * s, 0.0868 + (0.100 - 0.0868) * s);
    } else { cap.position.set(-0.030, 0.0008, 0.100); cap.rotation.set(-Math.PI / 2, 0, 0); }
    // the page: the printed problem, and the name written over drawings 28–53
    page.draw([[INK.problem, 0, 1], [INK.name, 1, (tc - NAME[0]) / (NAME[1] - NAME[0])]]);

    // blob (on 2s): watches the pen, startles at the uncap, leans to the writing, flinches on the name, looks at him
    const flinch = kick(tc, B.nameWritten, 0.35);
    exam.update(t, {
      wobble: 1.2,
      squash: kick(tc, B.penUncap, 0.2) + flinch,
      eyes: tc >= 6.5 && tc < dr(79) ? 'closed' : tc < 5.0 ? 'side' : 'open',
      look: -1, key: zone.light,
    });
    exam.mesh.rotation.z = (tc >= NAME[0] && tc < NAME[1] ? 6 : 0) * D;   // leans toward the writing
    exam.mesh.position.set(M[0] + kick(tc, B.nameWritten, 0.002), 0, M[2]);   // the recoil; its pool moves with it

    cuKey.intensity = close ? CU_KEY : 0;
    fill.intensity = close ? 0 : FILL_I;
  }

  return { parts: { exam, hero, cu, camera, light: zone.light }, update };
}
