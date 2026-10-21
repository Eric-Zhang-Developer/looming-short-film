// s16 · Practice (docs/shots/s16.md, v8 block on top). 26 s: v4's 16 s with the relapse cut in at 4.75 (v8-beats).
// Picks up on s15's last frame: s11's desk set (marstonDesk) and, mirrored at x' = 0.350 − x, a second one for the
// neighbor (the Drinks gator from s13), who is working under their own lit pendant from the first frame.
// v8, the relapse (4.75–14.75): after the cross-out he freezes, reaches for the phone (face-down on the desk since s11),
// turns it up and the Reel plays, hunched over it low at the desk, its cyan on his face from below. The phone is a low,
// close light, so the blob's shadow is on the wall from the moment it wakes (the rule); gulp4 (9.1) takes the blob
// (v11: 4.5× → 5×) on the Reel's bass hit and the cut to the wide W shows the shadow up the wall, huge. He looks up at it, turns
// the phone face down himself (phoneDownLib 10.5), the light and the wall shadow go on that frame, a slow breath, the pen.
// v4's 4.75–16.0 then plays at 14.75–26.0 (V7() below): the right answer, the check, "That was it?", the montage.
// Cuts: B′ (0–0.5) · P (0.5–4.75) · B′ (4.75–9.1) · W (9.1–9.75) · B′ (9.75–10.333) · W (10.333–11.0) · B′ (11.0–14.75) ·
// P (14.75–16.5) · B′ (16.5–19.0) · D (19.0–19.5) · P2 (19.5–21.5) · D (21.5–26). The blob shrinks one step per solved problem, on the solve's drawing:
// (v11) 5 → 1.5 → 1 → 0.71 → 0.54 → 0.42. Both pendants are constant warm spots. Only the blob casts. Characters on 2s; light
// and camera at 24.
import * as THREE from 'three';
import { sensorLight, fluorescent, ambient } from '../lights.ts';
import { kf, clamp } from '../core/ease.ts';
import { mulberry32, seedOf, hash2 } from '../core/rng.ts';
import { createBlob } from '../blob.ts';
import { makeGator } from '../characters/gator.ts';
import { makeCrowd } from '../characters/crowd.ts';
import { BLOB_R as OTHER_R } from '../characters/exam.ts';
import { POSES, specPose } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import { SHOTS } from '../timeline.ts';
import { UNIT, BLOB_AT, PHONE, PAGE, practiceSheet, SHEET_INK, penLine } from './s15.ts';
import { screenHalo } from './s03.ts';
import { phoneLight, aim } from '../lights.ts';
import { loadHand } from './s17b.ts';
import { kitTools, marstonDesk, mppOf, idle, castOnly } from './s11.ts';
import type { ShotCtx } from '../film.ts';
import type { Kit } from '../assets.ts';
import type { SpecOpts } from '../characters/poses.ts';

const ID = 's16', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID)!.beats;
const dr = (n: number) => n / 12;
const on2s = (t: number) => Math.floor(t * 12 + 1e-4) / 12;   // core onTwos can land on the previous drawing (float error)

// ---------- tunables (the final pass changes these, not the staging) ----------
// v8: everything after the relapse is v4's staging on its own clock (V7), ten seconds later.
const SHIFT = 10, RELAPSE = [4.75, B.rewrite];         // 4.75–14.75
const V7 = (t: number) => (t >= RELAPSE[1] - 1e-6 ? t - SHIFT : Math.min(t, RELAPSE[0]));   // v4's clock; held at 4.75 in the relapse
// The meter (v11, docs/notes/v11-beats.md): s15 hands over 4.5× (r 0.054, taller than him), gulp4 takes it to 5×
// (0.060), the biggest it ever is; the first solve takes it to 1.5×, the film's biggest single drop; then down to 0.42×.
const BLOB_R = { start: 0.054, gulp4: 0.060, problemOneSolved: 0.018, problemSolved2: 0.012, problemSolved3: 0.0085,
  problemSolved4: 0.0065, problemSolved5: 0.005 };
const STEPS: (keyof typeof BLOB_R)[] = ['problemOneSolved', 'problemSolved2', 'problemSolved3', 'problemSolved4', 'problemSolved5'];
const SOLVES = STEPS.map((k) => B[k] - SHIFT);         // on v4's clock: 6.5, 11.5, 13, 14, 15
// Marston mark (s15's, BLOB_DX included) while bigger than 1×; the old page-corner mark from 1× (#2) on (README §1).
// v11: while it towers (above 3×) its contact steps back to z BIG_Z, behind every layer of him (0.067–0.086), so his
// snout and the phone hand pass in front of it instead of through it; the snap at the first solve brings it forward.
const BIG_Z = 0.060;
const markOf = (r: number) => (r > 0.036 ? [BLOB_AT(r)[0], 0, BIG_Z] : r > 0.012 + 1e-9 ? BLOB_AT(r) : [0, 0, 0.098]);
const FLIPS = [9, 14.5];                               // page to the stack (v4's clock)
const CUTS = { P: [0.5, 6.5], P2: [9.5, 11.5], D: 9 };   // v4's clock
// v8 (real time): W for the gulp and the shadow, B′ for his face as he sees it, W again as the phone goes down and the
// shadow with it
const W_CUTS = [[B.gulp4, 9.75], [10.25 + dr(1), 11.0]];
// v8 Camera W: the wide for the relapse's wall. Him at frame left, the blob, and the wall shadow climbing past the
// cubicle panel to the right of it (the phone is left of the blob, so the shadow is thrown right and up).
const CAM_W: CamKey = { pos: [0.150, 0.150, 1.020], look: [0.150, 0.138, 0.040], focus: [0.040, 0.030, 0.074] };
// The phone in his hand: its screen centre's z sets the shadow scale on the wall, S = z / (z − 0.074) (README §1), so
// 0.0987 gives S ≈ 4 at v8's contact (12 units at 3×); v11, with the towering contact at BIG_Z: S 2.54, 12.7 units at 5×
// (evidence/v11-relapse/shadows.txt). Held low over the desk, so the
// eye holes land above the window band.
const PHONE_Z = 0.0987, PHONE_OFF = [0.004, -0.004];  // screen centre: z, and its x, y off the fingertip (2 mm over the desk)
const SPOT_I = 2.0, FACE_I = 0.05, HALO_K = 0.45, FLICK = 0.03;   // the phone: key (cd), the cyan under his face, the glow, ±3% per drawing
const ZONE_W = 0.4;                                    // the pendant's exposure in W
// v11 Camera B″: s15's B′ (−0.010, 0.112, 0.358) pulled back and down along the same line of sight, so him and the
// 5× blob (12 cm tall, x 0.003…0.139) are both whole in frame and its top stands clear above his head.
const CAM_B3: CamKey = { pos: [0.000, 0.125, 0.620], look: [0.000, 0.054, 0.074] };
// v11: the pendant is aimed at the page; at 5× the blob's far eye (x ≈ 0.10) sits outside its cone and went dark brown.
// While it towers the pendant leans toward the blob so both eyes read, and the page stays inside the pool.
const ZONE_AIM = { page: new THREE.Vector3(0, 0, 0.098), big: new THREE.Vector3(0.045, 0, 0.074) };
const CAM_D: CamKey = { pos: [0.168, 0.230, 1.010], look: [0.168, 0.040, 0.080], focus: [0.168, 0.020, 0.086] };
// Camera P: straight down on the page from 0.075 (README §8), centred on the written lines (sheet rows 38–298)
const CAM_P: CamKey = { pos: [-0.0205, 0.0753, 0.0934], look: [-0.0205, 0.0003, 0.0934] };
const WARM = 0.3;                                      // v4 Marston warm: lerp(lamp, cream, 0.3) (README v4)
// The pendant per camera: B′ at s15's exposure (so the cut in matches), the page inserts inside the pool's core at G4's
// 0.8 × 0.18 (or the page clips), the wide D in between. Same light; an exposure change per setup.
const ZONE_I = { B: 0.25, P: 0.8 * 0.18, D: 0.5 };
const FLUOR_I = 0.25, AMB_K = 0.6, FILL_I = 0.02;
const FILL_OFF = [0.029, 0.040, 0.114];                // character fill: x off the hip, then world y, z (s15's (−0.046, 0.040, 0.114))
const MIR = 0.350;                                     // neighbor unit: x' = MIR − x
const N = { hip: [0.425, -0.012], blob: [0.350, OTHER_R.neighbor, 0.098], phone: [0.360, 0.0015, 0.114] as Vec3 };
const VIEW_GLOW = [0.3, 0.45];
const INSERT_TINT: Vec3 = [0.62, 0.85, 0.9];
const INSERT_ARM = [0.030, -35, -0.006, 0.0014, 0.0022];   // the insert's sleeve: reach (m), turn (deg), hand behind the nib (m), arm height, pen height (m)

// ---------- the hero ----------
const seat = (o: SpecOpts) => specPose({ leg: 60, farLeg: 54, ...o });
const P = { ...POSES, line1: seat({ lean: 14, arm: -21 }), antic: seat({ lean: 10, arm: -21 }),
  still: seat({ lean: 18, arm: -22 }),                 // 6.5: the brace with the pen lifted 2 mm
  // v8, the relapse
  set_pen: seat({ lean: 16, arm: -27 }),               // 5.583: the pen down on the page
  reach_phone: seat({ lean: 26, arm: -14, head: -10 }),   // 5.667–5.75: hand to the face-down phone (s11's rest spot)
  lift_phone: seat({ lean: 22, arm: -9, head: -12 }),  // 5.833: the phone on edge, coming up
  hunch: seat({ lean: 26, arm: -6, head: -16 }),       // 5.917–9.167: hunched over it, low over the desk: the Reel
  look_wall: seat({ lean: 22, arm: -6, head: 14 }),    // 9.25–10.167: the same hand, his head up at the wall
  tip_phone: seat({ lean: 26, arm: -13, head: -6 }),   // 10.25–10.917: face down on the rest spot (s09a's drawing)
  hands_flat: seat({ lean: 6, arm: -30 }),             // 11.0: back in the chair (s11's settle): the breath
  pen_reach: seat({ lean: 19, arm: -15 }), pen_touch: seat({ lean: 21, arm: -19 }) };   // 13.25 / 13.5 (s15's)
// The relapse's body keys (real time, drawings on 2s). The phone is in his hand 5.75–10.5.
const RBODY: [number, string][] = [[4.75, 'brace'], [5.5, 'brace'], [5.5 + dr(1), 'set_pen'], [5.5 + dr(2), 'reach_phone'],
  [5.75, 'reach_phone'], [5.75 + dr(1), 'lift_phone'], [5.75 + dr(2), 'hunch'], [9.25 - dr(1), 'hunch'], [9.25, 'look_wall'],
  [10.25 - dr(1), 'look_wall'], [10.25, 'tip_phone'], [11 - dr(1), 'tip_phone'], [11, 'hands_flat'], [13.25 - dr(1), 'hands_flat'],
  [13.25, 'pen_reach'], [13.5 - dr(1), 'pen_reach'], [13.5, 'pen_touch'], [13.75 - dr(1), 'pen_touch'], [13.75, 'poise'],
  [14.25 - dr(1), 'poise'], [14.25, 'line1']];
const PHONE_UP = [5.75 + dr(1), 10.5];                 // the phone off the desk (on edge on the first drawing)
const SCREEN_ON = 6.0, THUMBS = [6.0, 6.5];            // phoneOut: thumbs it on; 6.5 the Reel (cues.ts: the tick and the clip)
const PEN_DOWN = [5.5 + dr(1), 13.5];                  // the pen lies on the page
const BREATH = [11.0, 12.25, 13.25];                   // in, out, done (eyes closed to 12.25)
// The montage (v4): pops on a 0.5 s grid, each pose held 6 drawings. 9.5–11.5 is the P2 insert (he's off screen).
const POPS: [number, string][] = [[9, 'flip'], [9.5, 'write_a'], [10, 'write_b'], [10.5, 'write_c'], [11, 'write_a'],
  [11.5, 'solve'], [12, 'write_c'], [12.5, 'write_a'], [13, 'solve'], [13.5, 'write_b'], [14, 'solve'], [14.5, 'flip'],
  [15, 'solve'], [15.5, 'write_a']];
const held = (pops: [number, string][]): [number, string][] => pops.flatMap(([t, n], i) => (i + 1 < pops.length ? [[t, n], [pops[i + 1][0] - dr(1), n]] : [[t, n]]));   // pop, hold, pop
const BODY: [number, string][] = [[0, 'line1'], [dr(1), 'line1'], [dr(2), 'antic'], [dr(3), 'brace'], [6.5, 'brace'], [6.5 + 1e-3, 'still'], [9 - dr(1), 'still'], ...held(POPS)];
const popAt = (tc: number) => (tc < 9 ? null : POPS.findLast(([t]) => tc >= t - 1e-6)?.[1]);
const isWrite = (n: string | null | undefined) => !!n?.startsWith('write');
// Head on body (deg): s15 ends at −4; the brace 4 more; 7.167 another −4; montage −8, think +6
const headAt = (tc: number) => (tc < 9 ? kf(tc, [[0, -4], [dr(2), -4], [dr(3), -8], [dr(85), -8], [dr(86), -12]]) : -8);
// The acting kit carries brows, breath and the anticipations; the eyes and mouth follow the spec's own table on top
// (v4's, on its clock). Real time: v8's relapse is the kit's own presets (flinch, guilt, numb, dread, resolve).
const CUES: [number, string][] = [[-0.1, 'resolve'], [4.75, 'flinch'], [5.5, 'guilt'], [6.5, 'numb'], [9.25, 'dread'], [11.0, 'resolve'],
  [7.0 + SHIFT, 'pride'], [9.0 + SHIFT, 'neutral']];
const eyesAt = (tc: number) => (tc < 7 ? 'worried' : tc < 8 ? 'gasp' : tc < 9 ? 'side' : 'open');
const mouthAt = (tc: number) => { const p = popAt(tc);
  if (tc < 9) return tc < dr(88) ? 'line' : tc < 8.5 ? 'o' : 'smile';
  return p === 'solve' || tc >= SOLVES[2] - 1e-6 ? 'smile' : 'line'; };

// ---------- the neighbor (crowd_sheet, mirrored to face −x), working from the first frame ----------
const NP = { ...POSES, n_write2: specPose({ lean: 16, arm: -22, far: null, head: -12 }) };
const NPOPS = [[0, 'crowd_write'], ...Array.from({ length: 14 }, (_, i) => [9 + 0.5 * i, i % 2 ? 'crowd_write' : 'n_write2'])] as [number, string][];

const kick = (t: number, t0: number, a: number) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));   // s15's: peaks on the beat

// ---------- the pages ----------
// Problem 1 in P (practice_1, sheet pixels): line a 0.5–3.1, line b 3.1–4.1, the pause and the tap (4.333), the strike
// on crossOut (two drawings), line c 4.75–6.1, the check 6.167 / 6.333. All of it is s15's code-drawn hand (practiceSheet),
// the check a code stroke. Problem 2 in P2 (practice_2): one part per pop. The time-lapse writes scribble
// lines on page 2 (below the problem) and on a blank page 3, each whole on its pop, with a check on each solve.
const I1 = SHEET_INK.practice_1, I2 = SHEET_INK.practice_2;
const CHECK1 = [[216, 284], [223, 293], [240, 270]], CHECK2 = [[154, 266], [160, 274], [176, 252]];
const UNDER2 = [[34, 284], [143, 283]];
const A: [number, number] = [0.5, 3.1], LB: [number, number] = [3.1, 4.1], TAP = dr(52), LC: [number, number] = [4.75, 6.1], CHK = [dr(74), dr(76)];
// a practiceSheet draw() span, and what page1/page2 hand it
type Span = [box: number[], layer: number, f: number];
type PageInk = { spans: Span[], extra: (g: CanvasRenderingContext2D, K: number) => void };
const both = (box: number[], f: number): Span[] => [[box, 0, f], [box, 1, f]];
const span = (tc: number, a: number, b: number) => clamp((tc - a) / (b - a));
function page1(tc: number, t: number): PageInk {
  const fb = span(tc, ...LB), strike = t >= B.crossOut ? (t >= B.crossOut + dr(1) ? 1 : 0.5) : 0;
  return {
    spans: [...both(I1.name, 1), ...both(I1.problem, 1), ...both(I1.a, span(tc, ...A)), ...(strike ? [[I1.b, 0, 1], [I1.b, 1, strike]] : [[I1.b, 2, fb]]) as Span[],
      ...both(I1.c, span(tc, ...LC))],
    extra: (g, K) => {
      penLine(g, K, CHECK1.slice(0, 2), tc >= CHK[0] - 1e-6 ? 1 : 0);
      penLine(g, K, CHECK1.slice(1), tc >= CHK[1] - 1e-6 ? 1 : 0);
    },
  };
}
// the pen tip in P, in sheet pixels: along the line being written, over the '+' in the pause, along the strike and check
function tip1(tc: number, t: number) {
  const along = ([x0, , x1, y1]: number[], f: number) => [x0 + (x1 - x0) * f, y1 - 4];
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
const P2_AT: [number, string][] = [[9.5, 'frac'], [10, 'arrow'], [10.5, 'word'], [10.75, 'under'], [11, 'check']];
function page2(tc: number): PageInk {
  const at = (x: number) => (tc >= x - 1e-6 ? 1 : 0), when = Object.fromEntries(P2_AT.map(([x, k]): [string, number] => [k, x]));
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
const lineEnd = (page: number, i: number) => 60 + 140 * (0.6 + 0.4 * SCRIB[(page * 8 + i) % SCRIB.length][0]);
function scribbles(g: CanvasRenderingContext2D, K: number, page: number, { lines, checks }: { lines: number[][], checks: number[][] }, tc: number) {
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

export async function build({ scene, camera, assets, PALETTE, post }: ShotCtx) {
  await loadHand();
  const C = (k: keyof ShotCtx['PALETTE']) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a: Vec3) => new THREE.Vector3(...a);

  const tools = kitTools(ID), { sheet, boil, art } = tools;
  const { pendant, viewMat } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  // The neighbor's unit: marstonDesk again, mirrored. Its room (wall, windows, sky, view, carpet) and its cubicle panel
  // are the hero's, so they're hidden: everything at the wall (z < 0.03), the flat floor, and the panel at x 0.150.
  const nRoom = new THREE.Group(); nRoom.position.x = MIR; nRoom.scale.x = -1; scene.add(nRoom);
  const { pendant: nPendant } = await marstonDesk({ scene: nRoom, assets, PALETTE, tools, ID: `${ID}-nbr` });
  for (const c of nRoom.children) if (c.position.z < 0.03 || (c.rotation.x < 0 && c.position.y < -0.03) || c.position.x === 0.150) c.visible = false;
  const [props, kitp, gsheet] = await Promise.all(['study_props_sheet', 'props_kit', 'gator_sheet'].map((n) => assets.load(n)));
  const cut = (a: Kit, name: string, { weight, res = 512, parent = scene, key = name }: { weight?: string, res?: number, parent?: THREE.Object3D, key?: string } = {}) => {   // s15's: origin at the visible centre
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${key}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g: THREE.Object3D) => { g.rotation.x = -Math.PI / 2; return g; };

  // ---------- the hero's desk ----------
  { const b = cut(props, 'backpack_side'); b.position.set(-0.145, -0.034 + 0.02, 0.028); }
  const phone = new THREE.Group(); phone.position.set(...PHONE); phone.rotation.x = Math.PI; scene.add(phone);   // face-down since s11
  { const back = cut(kitp, 'phone_face_down', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }
  // v8: the same phone in his hand, screen up (5.75–10.5): the face-up art tipped 50° toward the lens so the camera sees
  // the screen, the Reel on it (one tone: the clip holds its build), and s03's glow so the source reads as a light.
  const inHand = new THREE.Group(); scene.add(inHand);
  const heldArt = cut(kitp, 'phone_face_up', { parent: inHand });
  const [pw, ph] = kitp.sizes.phone_face_up, [pu0, pv0, pu1, pv1] = kitp.visible.phone_face_up;
  const reel = (() => {   // a Reel, no text: a tall video card in the phone's cyan, the UI's two bars
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 64 }), g = c.getContext('2d')!;
    const col = (a: keyof ShotCtx['PALETTE'], b: keyof ShotCtx['PALETTE'], k: number) => '#' + C(a).lerp(C(b), k).getHexString();
    g.fillStyle = col('phone', 'navy', 0.55); g.fillRect(0, 0, 128, 64);
    g.fillStyle = col('phone', 'cream', 0.3); g.fillRect(30, 6, 68, 52);
    g.fillStyle = col('phone', 'navy', 0.2); g.beginPath(); g.arc(64, 30, 13, 0, 2 * Math.PI); g.fill();
    g.fillStyle = col('cream', 'phone', 0.2); g.fillRect(104, 14, 8, 8); g.fillRect(104, 30, 8, 8);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const screenMat = new THREE.MeshBasicMaterial({ map: reel, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(pw * (pu1 - pu0) * 0.86, ph * (pv1 - pv0) * 0.8), screenMat);
  screen.position.z = 0.0003; screen.castShadow = false; heldArt.add(screen);
  const halo = screenHalo(PALETTE, 0.014); scene.add(halo);
  const pen = new THREE.Group(); scene.add(pen);   // origin at the tip; the painted pen points −x, so it's mirrored
  { const p = cut(kitp, 'pen', { parent: pen }); p.position.x = -0.006; p.scale.x = -1; }
  { const c = flat(cut(kitp, 'pen_cap')); c.scale.x = -1; c.position.set(-0.030, 0.0008, 0.100); }   // where s15 set it down
  // the pages: problem 1's sheet, problem 2's, then a blank sheet for the time-lapse; the finished stack beside the page
  const pages = [
    practiceSheet({ props: kitp, sheet, which: 'practice_1', at: PAGE, key: `${ID}-page1`, parent: scene }),
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
    (ia.children[0] as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>).material.color.setRGB(...INSERT_TINT); }   // the amber grade and the pool's glare turned the felt lime; this pulls it back to gator green

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
  // v8: the phone in his hand (README §4's screen spot, as s03's laptop): a low, close cyan spot at the screen, aimed
  // screen → blob → wall, so the blob's shadow is thrown up the wall at S = z / (z − 0.074); and the screen's cyan on his
  // face from below (s07's `under`), no shadow, short reach.
  const spot = phoneLight({ angle: 1.1, penumbra: 0.4, distance: 0.6, intensity: 0 });
  spot.shadow.mapSize.set(2048, 2048); scene.add(spot, spot.target);   // v11: angle 1.1 (was 0.9), so the 5× blob is inside the cone
  const under = new THREE.PointLight(PALETTE.phone, 0, 0.05, 2); scene.add(under);
  const fill = new THREE.PointLight(warm, FILL_I, 0.07, 2); scene.add(fill);   // README §10
  const nFill = new THREE.PointLight(warm, FILL_I, 0.07, 2);  // the hero's fill, mirrored
  nFill.position.set(MIR + 0.046, 0.040, 0.114); scene.add(nFill);
  const tubes = fluorescent({ intensity: FLUOR_I }); tubes.light.castShadow = false; scene.add(tubes.light);   // flicker 0: update() never called
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  const look = new THREE.Vector3(), dir = new THREE.Vector3(), focus = new THREE.Vector3(), hand = new THREE.Vector3(), w = new THREE.Vector3();
  const fx = post({ focus: 0.3, aperture: UNIT.aperture, maxblur: UNIT.maxblur, lut: 'amber' });

  const L = new THREE.Vector3(), Cb = new THREE.Vector3(), hit = new THREE.Vector3();
  const wall: Record<string, unknown> = {};
  function update(t: number) {
    // v8: two clocks. `t` is the shot's; `to` is v4's (the relapse holds it at 4.75, after it it runs 10 s behind), and
    // everything v4 staged reads `to`. The relapse (4.75–14.75) is staged on `t` below.
    const to = V7(t), tc = on2s(to), tr = on2s(t), relapse = t >= RELAPSE[0] - 1e-6 && t < RELAPSE[1] - 1e-6;
    boil(t, 10);
    const inP = !relapse && to >= CUTS.P[0] && to < CUTS.P[1], inP2 = to >= CUTS.P2[0] && to < CUTS.P2[1], insert = inP || inP2;
    const camD = to >= CUTS.D && !inP2, camW = W_CUTS.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);

    // camera: B′ / P / B′ / W / B′ / P / B′ / D / P2 / D, each locked
    const cam = insert ? { ...CAM_P, focus: CAM_P.look } : camW ? CAM_W : camD ? CAM_D : { ...CAM_B3, focus: UNIT.focus };
    camera.up.set(0, insert ? 0 : 1, insert ? -1 : 0);
    camera.position.set(...cam.pos); camera.lookAt(look.set(...cam.look)); camera.getWorldDirection(dir);
    fx.set({ focus: dir.dot(focus.set(...cam.focus!).sub(camera.position)) });   // every camera here has a focus (CAM_D's own, the others' set just above)

    // hero: seated at s15's hip; hidden in the inserts
    const pop = popAt(tc);
    hero.group.visible = !insert;
    hero.boil(t, 10);
    if (relapse) hero.blend(P, RBODY, tr + 1e-6);
    else { hero.blend(P, BODY, tc + 1e-6); hero.pose({ head: headAt(tc) * D }); }
    const f = act(hero, t, CUES, relapse ? { slump: 0, seed: 16 } : { slump: 0, tilt: 0, breath: tc < 6.5 ? 30 : 6, seed: 16 });
    if (relapse) {
      // the breath (11.0–13.25): in to 12.25 with the eyes closed and the head up 3°, out by 13.25; then resolve's open eyes
      if (tr >= BREATH[0] - 1e-6 && tr < BREATH[2] - 1e-6) {
        const k = tr < BREATH[1] ? (tr - BREATH[0]) / (BREATH[1] - BREATH[0]) : 1 - (tr - BREATH[1]) / (BREATH[2] - BREATH[1]);
        hero.joints.body.scale.y = 1 + 0.03 * Math.sin(k * Math.PI / 2);
        hero.joints.head.rotation.z += 3 * k * D;
        if (tr < BREATH[1] - 1e-6) hero.face({ eyes: 'closed', mouth: 'line' });
      }
      if (tr >= 5.5 - 1e-6 && tr < 5.75 - 1e-6) hero.face({ eyes: 'side' });   // to the phone
    } else if (f.eyes !== 'closed') hero.face({ eyes: eyesAt(tc), mouth: mouthAt(tc) });
    if (THUMBS.some((x) => Math.abs(tr - x) < 1e-6)) hero.joints.arm_r.rotation.z += 4 * D;   // the thumb, one drawing
    hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
    hero.group.updateMatrixWorld(true);
    hero.hand!.getWorldPosition(hand);
    fill.position.set(hero.group.position.x + FILL_OFF[0], FILL_OFF[1], FILL_OFF[2]);

    // the pages: which one is in front of him, what's on it, the finished stack
    const flips = FLIPS.filter((x) => tc >= x - 1e-6).length;
    pages.forEach((p, i) => { p.holder.visible = i === flips; });
    stack.forEach((s, i) => { s.visible = flips > i; });
    if (flips === 0) { const p = page1(tc, to); pages[0].draw(p.spans, p.extra, 'p1' + tc.toFixed(3)); }
    else if (flips === 1) { const p = page2(tc); pages[1].draw(p.spans, p.extra, 'p2' + tc.toFixed(2)); }
    else pages[2].draw([], (g, K) => scribbles(g, K, 3, LAPSE[3], tc), 'p3' + tc.toFixed(2));

    // the insert hand: the pen tip on the line being written (P), or on each new part as it pops (P2)
    ihand.visible = insert;
    if (insert) {
      const pg = inP ? pages[0] : pages[1];
      pg.holder.updateMatrixWorld(true);
      const [sx, sy] = inP ? tip1(tc, to) : tc < 10 ? [I2.frac[2], I2.frac[3] - 4] : tc < 10.5 ? [I2.arrow[2], I2.arrow[3] - 4]
        : tc < 10.75 ? [I2.word[2], I2.word[3] - 4] : tc < 11 ? UNDER2[1] : CHECK2[2];
      pg.toWorld(sx, sy, w);
      ihand.position.set(w.x, w.y, w.z);
    }

    // side-view pen: tip on the fingertip at 45° (s15). Writing in D, the tip sits 2/4/6 mm up so it lands on a page line
    // (s15's flat-puppet cheat); lifted on solves, flips and 6.5–9.0. v8: in the relapse it lies on the page while his
    // hand has the phone (5.583–13.5).
    pen.visible = !insert;
    const line = Math.floor(2 * tc) % 3, lifted = pop === 'solve' || pop === 'flip' || (tc >= 6.5 && tc < 9);
    const penDown = relapse && tr >= PEN_DOWN[0] - 1e-6 && tr < PEN_DOWN[1] - 1e-6;
    pen.rotation.set(0, 0, penDown ? -3 * D : -Math.PI / 4);
    if (penDown) pen.position.set(-0.018, 0.0009, 0.0868);
    else pen.position.set(hand.x, tc < 0.5 ? 0.002 : isWrite(pop) ? 0.002 * (line + 1) : lifted ? 0.004 : hand.y + 0.0003, 0.0868);

    // the phone: face down on the desk, or in his hand screen up (5.75–10.5) with the drawings either side on edge
    const up = relapse && tr >= PHONE_UP[0] - 1e-6 && tr < PHONE_UP[1] - 1e-6;
    const lastUp = PHONE_UP[1] - dr(1), down2 = PHONE_UP[1] - dr(2);   // 10.417 on edge over the rest spot; 10.333 lifted 2 mm over it
    const onEdge = up && (Math.abs(tr - PHONE_UP[0]) < 1e-6 || Math.abs(tr - lastUp) < 1e-6);
    const lit = up && tr >= SCREEN_ON - 1e-6;   // dies on the face-down frame (s09a)
    phone.visible = !up;
    inHand.visible = up;
    if (up) {
      inHand.position.set(hand.x + PHONE_OFF[0], hand.y + PHONE_OFF[1], PHONE_Z);
      if (tr >= down2 - 1e-6) inHand.position.set(PHONE[0], PHONE[1] + 0.002, PHONE[2]);   // over the rest spot
      inHand.rotation.set(onEdge ? 0 : -50 * D, 0, onEdge ? 80 * D : 0);
    }
    screen.visible = lit;
    screenMat.color.setScalar(tr < THUMBS[1] - 1e-6 ? 0.6 : 1);   // the lock screen, then the Reel

    // the hero's blob: braces with him, shrinks one step per solve with its contact on the mark for its size, watches him.
    // v8: gulp4 (real 9.1) takes it 4.5× → 5× (v11) in the relapse (README §1's gulp: swallow, snap, settle, wobble down 0.2).
    // gulp4 (9.1) is off the 2s grid (the bass hit's time): the snap lands on the first frame at or after it, the swallow
    // on the drawing before; the cut to W is on the same frame.
    const solved = SOLVES.filter((s) => tc >= s - 1e-6).length, grown = t >= B.gulp4 - 1e-6;
    const r = solved ? BLOB_R[STEPS[solved - 1]] : grown ? BLOB_R.gulp4 : BLOB_R.start, M = markOf(r);
    const s = r / BLOB_R.start, t0 = SOLVES[solved - 1];
    aim(zone.light, r > 0.036 && !insert ? ZONE_AIM.big : ZONE_AIM.page);
    exam.mesh.visible = exam.stain.visible = !insert;
    exam.mesh.scale.setScalar(s); exam.stain.scale.setScalar(s);
    exam.mesh.position.set(M[0], 0, M[2]); exam.stain.position.set(M[0], 0.0004, M[2]);
    if (relapse) {
      const swallow = t >= B.gulp4 - dr(1) - 1e-6 && !grown, settle = grown && t < B.gulp4 + 1;
      // v9 (v9-beats §2): at the phone (phoneOut 6.0) `sad`, "here we go again"; after the gulp's snap, `plead` up at its
      // own shadow on the wall until he turns the phone down (phoneDownLib 10.5); open, watching him, after.
      const eyes = swallow ? 'closed' : tr >= B.phoneOut - 1e-6 && !grown ? 'sad' : grown && tr >= B.gulp4 + 0.25 - 1e-6 && tr < B.phoneDownLib - 1e-6 ? 'plead' : 'open';
      exam.update(t, {
        key: lit ? spot : zone.light,
        wobble: settle ? 0.8 : 1,
        squash: swallow ? 0.3 : grown ? -0.2 * kick(t, B.gulp4, 1) : 0,
        eyes,
        look: -1,
      });
      const gulping = t >= B.gulp4 - dr(1) - 1e-6 && t < B.gulp4 + 0.25 - 1e-6;
      exam.mesh.rotation.z = (tr >= 5 - 1e-6 && !gulping ? 10 : 0) * D;   // the head tilt at 5.0; upright for the gulp
    } else {
      const braced = tc >= dr(2) && tc < 6.5;
      // v9: "That was it?" (problemOneSolved, v4's 6.5): when its eyes open again (6.75) it is `shy`, embarrassed at how
      // small the problem was: a glance down and away from him and a little extra squash, to 7.5; then open, watching.
      const shy = tc >= 6.75 && tc < 7.5;
      exam.update(t, {
        key: zone.light,
        wobble: braced ? 0.3 : 1,
        squash: braced ? 0.25 : (t0 === undefined ? 0 : kick(tc, t0, 0.3)) + (shy ? 0.1 : 0),
        eyes: tc >= 15.5 || (tc >= dr(3) && tc < 6.75) ? 'closed' : shy ? 'shy' : 'open',
        look: shy ? 1 : -1,
      });
      const watching = (tc >= 8 && tc < 9) || (tc >= 9 && t0 !== undefined && tc - t0 >= 0.25 - 1e-6 && tc < 15.5);
      exam.mesh.rotation.z = (watching ? 10 : 0) * D;   // tilted toward him; upright for each squash
    }

    // v8, the phone's light (on 1s, ±3% per drawing: the feed): at the screen, aimed screen → blob → wall (s03's), so its
    // shadow is on the wall exactly while the screen is lit, and gone on the face-down frame. The cyan under his face with
    // it. (Lowered to the rest spot on 10.333–10.417, the light goes with the phone, so the shadow drops toward the desk.)
    const k = lit ? (tr < THUMBS[1] - 1e-6 ? 0.6 : 1) * (1 + FLICK * (2 * hash2(seedOf(ID, 'feed') % 65536, Math.round(tr * 12)) - 1)) : 0;
    spot.intensity = SPOT_I * k; under.intensity = FACE_I * k;
    halo.visible = lit; halo.material.opacity = HALO_K * k;
    if (lit) {
      inHand.updateMatrixWorld(true); screen.getWorldPosition(L);
      spot.position.copy(L);
      under.position.set(L.x - 0.010, L.y + 0.006, L.z + 0.004);
      halo.position.copy(L).add(w.set(0, 0, 0.002));
      exam.mesh.updateMatrixWorld(true);
      Cb.set(M[0], r, M[2]);
      hit.subVectors(Cb, L).multiplyScalar(-L.z / (Cb.z - L.z)).add(L);
      aim(spot, exam.mesh);
      spot.shadow.camera.near = 0.002; spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hit); spot.target.updateMatrixWorld();
    }
    // the wall shadow in numbers (evidence/v8-s16/probe.ts): the field's box (2.28 r wide, 2 r tall, eyes at 1.08 r)
    // projected from the screen onto the wall z 0; its foot is behind the desk's privacy panel (top y 0.019)
    const S = L.z / (L.z - M[2]), Y = (y: number) => L.y + (y - L.y) * S, X = (x: number) => L.x + (x - L.x) * S;
    Object.assign(wall, lit ? { lit, r, S, units: S * r / 0.012, x: [X(M[0] - 1.14 * r), X(M[0] + 1.14 * r)], eyes: Y(1.08 * r), top: Y(2 * r),
      height: Y(2 * r) - Math.max(Y(0), 0.019), light: L.toArray() } : { lit, r, S: 0, units: 0, x: [0, 0], eyes: 0, top: 0, height: 0, light: null });

    // light (on 1s): both pendants constant; the exposure per setup
    zone.light.intensity = insert ? ZONE_I.P : camW ? ZONE_W : camD ? ZONE_I.D : ZONE_I.B;
    nZone.light.intensity = ZONE_I.D;

    // the neighbor: working, popping between two write poses on the montage grid
    nbr.boil(t, 10);
    nbr.blend(NP, held(NPOPS), tc + 1e-6);
    idle(nbr, t, { breath: 0.008, sway: 0, phase: 0.37 });
    nBlob.update(t, { key: nZone.light, wobble: 0.5, eyes: 'open', look: 1 });

    // window: the night view brightens a little toward pre-dawn over 9–16 (no light reaches the room)
    viewMat.emissiveIntensity = VIEW_GLOW[0] + (VIEW_GLOW[1] - VIEW_GLOW[0]) * clamp((to - 9) / 7);
  }

  return { parts: { exam, nBlob, hero, camera, light: zone.light, spot, wall }, update };
}
