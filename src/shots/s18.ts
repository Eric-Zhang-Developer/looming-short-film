// s18 · Crossed off; the ink goes home; the next date (docs/shots/s18.md, G4). v2 on s02's real-scale home desk, at
// night, the lamp on. Setups (README §8): W 0–3 (s02's wide), I 3–7 (s02's calendar insert), I2 7–11.5 (the sheet),
// W 11.5–17. He crosses the exam off the calendar (examCrossedOff 2.0) and the blob shrinks to a dot; the dot climbs
// the sheet it ran down in s02 and soaks into the circle it was born from (blobAbsorbed 5.5), leaving a faint trace.
// Then he writes the next exam, "Final", and circles it in red (newDate 9.5); a new bead of ink forms on the circle and
// quivers (dropQuivers 11.0); he looks at it and uncaps his pen (tagPenUncap 13.5), and it goes still. Fade to black.
// The room is s02's: DESK, homeDesk and the calendar come from s02.ts, so the ending is the birth's own frame.
// Characters on 2s; the quiver on 1s; light, camera and fade on 1s; boil 10/s.
import * as THREE from 'three';
import { SHOTS } from '../timeline.ts';
import { lampLight, ambient } from '../lights.ts';
import { loadLUT } from '../post.ts';
import { ease, easeOut, clamp, lerp } from '../core/ease.ts';
import { createBlob } from '../blob.ts';
import { makeGator } from '../characters/gator.ts';
import { specPose } from '../characters/poses.ts';
import { DESK, tools, homeDesk, seatReach } from './s02.ts';
import { loadHand, handFont } from './s17b.ts';
import { act } from '../characters/acting.ts';
import { makeClock } from '../clock.ts';
import type { ShotCtx } from '../film.ts';
import type { SpecOpts } from '../characters/poses.ts';
import type { Pose } from '../puppet.ts';

const ID = 's18', DEG = Math.PI / 180;
const F = (n: number) => n / 12, fr = (t: number) => Math.floor(t * 12 + 1e-6);
const B = SHOTS.find((s) => s.id === ID)!.beats;   // examCrossedOff 2, blobAbsorbed 5.5, lampSitBack 7.5, newDate 12.5, dropQuivers 14, tagPenUncap 16.5
// v4 (20 s): W 0–3, I 3–7, W 7–10 (he sits back under the lamp: lampSitBack 7.5), I2 10–14.5, W 14.5–20, the fade 19–20. Every G4 time from 7.0 is +3.0.
const CUT_I = 3, CUT_SIT = 7, CUT_I2 = 10, CUT_W = 14.5, FADE = 19;

// ---------- tunables ----------
const BLOB_R = { start: 0.004, examCrossedOff: 0.0015 };   // SHRINK[7] → SHRINK[8], the dot (README §1); soaks away at blobAbsorbed
const BEAD = 0.17;                                           // the tag's new drop: s02's bead, 0.17 of a 1× (r 0.012) blob
const LAMP_I = 0.035, AMB = 1.25, FACE_I = 0.008;            // the lamp on (constant), v4: a daytime ambient (2.5× G4's 0.5), warm character fill
const DAY_I = 0.8;                                           // v4: pale window light from the right, an ordinary afternoon (no shadow: the lamp is still the key)
// v3: the lamp stands 8.5 mm off the wall (15 cm real), in front of the calendar's curled lip, and its bulb is inside the
// shade (the bell's own axis), not 16 mm out in front of it as in v2. A bulb at the shade means the pool is a real raking light.
const LAMP_Z = 0.0085;
const LAMP_AT: Vec3 = [DESK.lampMouth[0] + 0.001, DESK.lampMouth[1] + 0.004, LAMP_Z + 0.0005], LAMP_AIM: Vec3 = [0.036, 0.020, 0.0035];
const STAIN = [1.0, 0.4];                                  // the soak's trace: opacity at the bloom, and the trace it leaves
// Cameras: s02's W and I (copied from s02.ts, which doesn't export them), and I2 on the lower sheet.
const C = DESK.cal, [FX, FY] = C.friXY;
const LIP_Y = C.y0 + 0.0005 + 0.012 * 0.4;                   // s02's perch on the curl
const CAM_W: CamKey = { pos: [0.004, 0.062, 0.40], look: [0.004, 0.030, 0.012] };
const CAM_I: CamKey = { pos: [FX, (FY + LIP_Y) / 2 + 0.001, 0.09], look: [FX, (FY + LIP_Y) / 2, 0] };
// v4: widened and moved right so the clock (x 0.062–0.082, y 0.057–0.077) sits inside the frame beside "Final" and its circle (x ≈ 0.026).
const CAM_I2: CamKey = { pos: [0.0535, 0.054, 0.136], look: [0.0535, 0.0535, 0] };
// The calendar's painted grid (art px of props_kit_calendar, 275 × 292): rows at 92/128/165/202/238/275, columns at
// 17/51/86/120/155/190/224/258. "Final" goes in row 4, column 3 (the spec's cell), on Friday's clean paper.
const NEW_CELL: [number, number] = [103, 220], CLEAN = [157, 167, 188, 200];
const XS = 44, X1 = [[8, 8], [36, 37]], X2 = [[37, 7], [7, 36]];   // the X's canvas (calendar art px) and its two strokes
const HEAD_X = 12;                                           // the head's pitch while he crosses the exam off (+ chin up)
const HOME_MIX = 0.8;                                        // grade: amber (act 3) blended this far toward s02's dawn, so the ending stays in the home's palette
// v6-ending: after the uncap he half-stands and holds the nib out by the drop (T_REACH); it blinks up at him (T_BLINK, one),
// hops onto the nib (T_HOP → T_LAND, squash on landing) and sinks into it (T_IN); he sits and writes "1." in its ink.
const T_REACH = F(205), T_BLINK = F(207), T_HOP = F(209), T_LAND = F(213), T_IN = F(216), T_TOUCH = F(221), T_MARK = F(226);
const REACH_UP = 0.5;                                        // how far up out of the chair he comes (0 seated … 1 STAND): the drop is beyond a seated reach
const DROP_INK = 'rgb(12, 10, 20)';                          // the blob's ink (near-black), not the pen's navy
const PAD = { x: -0.0155, zf: 0.028, w: 0.016, tilt: 50 };  // the new sheet, propped at 50° so the camera can read a mark on it
const PH = PAD.w * 366 / 263, PH_RAD = PAD.tilt * DEG;      // the sheet's height and tilt
// A point on the propped sheet: u from its left edge, v up from its lower edge (both 0–1), in the world.
const padPoint = (u: number, v: number) => new THREE.Vector3(PAD.x + (u - 0.5) * PAD.w, 0.0004 + v * PH * Math.sin(PH_RAD), PAD.zf - v * PH * Math.cos(PH_RAD));
const PUSH: CamKey = { pos: [-0.008, 0.052, 0.24], look: [-0.008, 0.030, 0.012] };   // W's slow push-in over the tag (11.5–16)
const FONT = 17, INK = 'rgb(30, 42, 63)';   // the hand is s17b's bundled Caveat
const NS = 58, CIRCLE_R = 23, A0 = -2.2;                     // "Final"'s canvas, its red circle (art px), the stroke's start

const CLOCK = { at: [C.x0 + C.w + 0.014, C.y0 + 0.70 * C.h, C.z] as Vec3, h: 4, m: 10 };   // v4: s02's spot beside the calendar, ~4:10 (README §13)
const xAt = (tc: number) => [clamp((tc - 1.5 + F(1)) / F(2)), clamp((tc - 1.833 + F(1)) / F(2))];   // drawings 18–19, 22–23
const wordAt = (tc: number) => clamp((tc - 10.5) / 1.25);
const circleAt = (tc: number) => (tc < 11.833 ? 0 : clamp((tc - 11.833 + F(2)) / 0.833));          // 4 drawings, closed on 12.5 (newDate)

// padInk's anchor: the nib and the camera at the end of the stroke
type Anchor = { nib: THREE.Vector3, cam: THREE.Vector3 };

export async function build(ctx: ShotCtx) {
  await loadHand();
  const { scene, camera, PALETTE, post } = ctx;
  const Cc = (k: keyof ShotCtx['PALETTE']) => new THREE.Color(PALETTE[k]);
  scene.background = Cc('navy').lerp(Cc('ink'), 0.5);
  const T = tools(ctx, ID);
  const set = await homeDesk(ctx, T, { pen: false });
  const { props } = set;
  const gsheet = await ctx.assets.load('gator_sheet');
  const fx = post({ focus: 0.39, aperture: 0.01, lut: 'dawn' });
  const clock = await makeClock(ctx, { seed: 18 });   // the same clock as s02's, on the same wall, at ~4:10
  clock.group.position.set(...CLOCK.at);
  scene.add(clock.group);

  // ---------- the desk tonight: the graded test, his pen and its cap, the red marker; the laptop shut at the back ----------
  set.page.g.visible = false; set.phone.g.visible = false;
  set.lamp.g.position.z = LAMP_Z;   // in front of the calendar's curl, so the lip no longer cuts across its shade
  const graded = T.cut(props, 'graded_test', [0.0119, null], 'graded_test');
  graded.g.position.set(DESK.page[0], 0.0003, DESK.page[1]); graded.g.rotation.set(-Math.PI / 2, 0, 0.06);
  const MARKER = [-0.004, 0.029];
  T.rect('marker', PALETTE.calendarRed, [0.0055, 0.0009], [MARKER[0], 0.0005, MARKER[1]], { rot: [-Math.PI / 2, 0, 0.12] });
  T.rect('marker_cap', PALETTE.cream, [0.0018, 0.0010], [MARKER[0] + 0.0035, 0.0006, MARKER[1] - 0.0004], { rot: [-Math.PI / 2, 0, 0.12] });
  set.laptop.position.set(0.016, 0.0004, 0.008); set.laptop.rotation.y = 0; set.setLid(0);
  // The pen (mirrored so its nib points +x, origin at the nib) and its cap (open end on the nib).
  const pen = T.cut(props, 'pen', [0.0075, null], 'pen', { anchor: [1, 0.5], flip: true });
  const cap = T.cut(props, 'pen_cap', [0.0034, null], 'pen_cap', { anchor: [0.75, 0.5], flip: true });
  const penRest: Vec3 = [DESK.pen[0] + 0.0075, 0.0006, DESK.pen[1]];   // nib of the pen lying on the page's front edge

  // ---------- the calendar's new marks: the X (his pen), "Final" and its red circle (code, drawn on the sheet) ----------
  const cal = props.pieces.calendar, [cu0, cv0, cu1, cv1] = props.visible.calendar, AW = cal.width, AH = cal.height;
  const calH = C.w * ((cv1 - cv0) * AH) / ((cu1 - cu0) * AW);
  const artToWorld = (px: number, py: number) => [C.x0 + (px / AW - cu0) / (cu1 - cu0) * C.w, C.y0 + (cv1 - py / AH) / (cv1 - cv0) * calH];
  const mpp = C.w / ((cu1 - cu0) * AW);                        // metres per calendar art px
  const overlay = ([w, h]: number[], [x, y]: number[], z: number, K = 24) => {             // a canvas over the sheet, w × h art px, centred at world (x, y)
    const cv = Object.assign(document.createElement('canvas'), { width: Math.round(w * K), height: Math.round(h * K) });
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * mpp, h * mpp), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.position.set(x, y, C.z + z); m.receiveShadow = true; scene.add(m);
    let drawn: string | null = null;
    return (id: string, draw: (g: CanvasRenderingContext2D) => void) => { if (id === drawn) return; drawn = id; const g = cv.getContext('2d')!; g.setTransform(K, 0, 0, K, 0, 0); g.clearRect(0, 0, w, h); draw(g); tex.needsUpdate = true; };
  };
  // The X over Friday's square (placed at s02's friXY, so the X is too).
  const xo = overlay([XS, XS], [FX, FY], 0.0011);
  const seg = (g: CanvasRenderingContext2D, [[a, b], [c, d]]: number[][], k: number) => { if (k <= 0) return; g.beginPath(); g.moveTo(a, b); g.lineTo(lerp(a, c, k), lerp(b, d, k)); g.stroke(); };
  const drawX = (k1: number, k2: number) => xo(`${k1}|${k2}`, (g) => { g.strokeStyle = INK; g.lineWidth = 1.8; g.lineCap = 'round'; seg(g, X1, k1); seg(g, X2, k2); });
  const xw = ([px, py]: number[]): Vec3 => [FX + (px - XS / 2) * mpp, FY - (py - XS / 2) * mpp, C.z];
  // "Final" on a clean cell (Friday's empty paper over the printed glyph), and its red circle.
  const [NX, NY] = artToWorld(...NEW_CELL);
  const no = overlay([NS, NS], [NX, NY], 0.0008);
  const drawFinal = (kw: number, kc: number) => no(`${kw.toFixed(3)}|${kc.toFixed(3)}`, (g) => {
    const c = NS / 2;
    g.drawImage(cal, CLEAN[0], CLEAN[1], CLEAN[2] - CLEAN[0], CLEAN[3] - CLEAN[1], c - 15.5, c - 16.5, 31, 33);
    if (kw > 0) {
      g.font = handFont(FONT); g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 0.3;
      const w = g.measureText('Final').width, x0 = c - w / 2;
      g.save(); g.beginPath(); g.rect(x0 - 1, 0, w * kw + 5, NS); g.clip();
      g.fillText('Final', x0, c + FONT * 0.35); g.strokeText('Final', x0, c + FONT * 0.35); g.restore();
    }
    if (kc > 0) {
      g.strokeStyle = PALETTE.calendarRed; g.lineWidth = 2.8; g.lineCap = 'round'; g.beginPath();
      g.ellipse(c, c, CIRCLE_R, CIRCLE_R * 0.92, 0.15, A0, A0 + 2 * Math.PI * 1.06 * kc); g.stroke();
    }
  });
  const finalW = (() => { const g = document.createElement('canvas').getContext('2d')!; g.font = handFont(FONT); return g.measureText('Final').width; })();

  // ---------- the Student ----------
  const gator = await makeGator(ctx, { seed: 2 });
  gator.group.position.set(...DESK.hip); scene.add(gator.group);
  // v3: he casts. The bulb is behind him now (z 0.0090 against his 0.016), so his shadow falls forward onto the desk, not up the wall.
  gator.group.traverse((o: THREE.Object3D & { isMesh?: boolean }) => { if (o.isMesh) o.castShadow = true; });
  const seat = (o: SpecOpts) => specPose({ leg: 60, farLeg: 54, ...o });
  const camW = new THREE.Vector3(...CAM_W.pos);
    // v3 restage: v2 kept his legs on show above the desktop as he rose, which read as a gator standing on his desk. He now
  // stands *behind* it: v2's hip height and chin-up pose (so the snout rides above Friday's row and the X stays visible),
  // but the legs are hidden while he is up (legs are the part that read as standing on the desk), and the hoodie's hem
  // ends at the desktop line, so the desk front is what he stands behind.
  const STAND: Vec3 = [-0.003, 0.010, DESK.hip[2]];
  const reach = (p: Vec3, hip: Vec3) => { const r = seatReach(camW, new THREE.Vector3(...p), [-10, 10], hip); return specPose({ lean: r.lean, arm: r.arm, far: -60, head: HEAD_X, leg: 0, farLeg: 8 }); };   // legs down, behind the desk
  const P: Record<string, Pose> = {
    look: seat({ lean: 0, arm: -40, head: 12 }),
    up: reach(xw(X1[0]), [-0.03, 0.0, DESK.hip[2]]),
    x1a: reach(xw(X1[0]), STAND), x1b: reach(xw(X1[1]), STAND),
    x2a: reach(xw(X2[0]), STAND), x2b: reach(xw(X2[1]), STAND),
    down: seat({ lean: 4, arm: -60, head: -4 }),
    gaze: seat({ lean: 0, arm: -60, head: 8 }),
    breath: seat({ lean: -1, arm: -62, head: 8 }),
    sitback: seat({ lean: -8, arm: -62, head: 4 }),                   // v4 lampSitBack: leans back in the chair, head up 4°
    glance: seat({ lean: -8, arm: -62, head: 9 }),                    // …and lifts it a little toward the clock
    pick: (() => { const r = seatReach(camW, new THREE.Vector3(DESK.pen[0] + 0.003, 0.001, DESK.pen[1]), [0, 30]); return seat({ lean: r.lean, arm: r.arm, head: 0 }); })(),
    level: seat({ lean: 6, arm: -35, far: -32, head: 4 }),
    uncap: seat({ lean: 6, arm: -35, far: -24, head: 4 }),
    // v6-ending: aimed left of the sheet, so the nib (3 mm past the hand, tipped down) lands on it, not past its right edge
    mark: (() => { const r = seatReach(camW, padPoint(-0.15, 0.70), [0, 30]); return seat({ lean: r.lean, arm: r.arm, far: -24, head: -6 }); })(),
    lift: seat({ lean: 5, arm: 18, far: -24, head: 4 }),   // the pen comes up off the sheet and holds, so the mark shows
    // v6-ending: half up out of the chair, the nib held level just left of and below the drop (the hand is 3 mm behind the nib)
    offer: (() => { const hip = DESK.hip.map((v, i) => lerp(v, STAND[i], REACH_UP)) as Vec3, at = artToWorld(...NEW_CELL);
      const r = seatReach(camW, new THREE.Vector3(at[0] - 0.0100, at[1] - CIRCLE_R * 0.92 * mpp - 0.0012, C.z), [-10, 20], hip);
      return specPose({ lean: r.lean, arm: r.arm, far: -85, head: 12, leg: 0, farLeg: 8 }); })(),
  };
  // [t, pose, stand (0 seated at DESK.hip … 1 at STAND)], eased between keys and sampled on 2s.
  const KEYS: [number, string, number][] = [[0, 'look', 0], [0.5, 'look', 0], [F(8), 'up', 0.5], [F(16), 'x1a', 1], [F(17), 'x1a', 1], [F(18), 'x1b', 1], [F(19), 'x1b', 1],
    [F(21), 'x2a', 1], [F(22), 'x2b', 1], [F(23), 'x2b', 1], [F(26), 'down', 0], [CUT_I, 'down', 0], [CUT_SIT, 'down', 0],
    [B.lampSitBack, 'sitback', 0], [8.5, 'sitback', 0], [F(104), 'glance', 0], [F(110), 'glance', 0], [F(112), 'sitback', 0], [CUT_I2, 'sitback', 0],   // 7.5 sits back; 8.5–9.25 the clock; back to the circle
    [CUT_W, 'gaze', 0], [15.5, 'gaze', 0], [F(186), 'breath', 0], [F(188), 'pick', 0], [F(190), 'pick', 0], [F(192), 'level', 0],
    [F(197), 'level', 0], [F(198), 'uncap', 0], [F(200), 'uncap', 0], [T_REACH, 'offer', REACH_UP], [T_IN, 'offer', REACH_UP],
    [T_TOUCH, 'mark', 0], [T_MARK, 'mark', 0], [T_MARK + 0.33, 'lift', 0], [20, 'lift', 0]];
  const poseAt = (tc: number) => {
    const i = KEYS.findLastIndex(([k]) => k <= tc + 1e-6), [k0, a, h0] = KEYS[i], [k1, b, h1] = KEYS[Math.min(i + 1, KEYS.length - 1)];
    const e = ease(k1 > k0 ? clamp((tc - k0) / (k1 - k0)) : 0);
    return { pose: Object.fromEntries(Object.keys(P[a]).map((j) => [j, lerp(P[a][j], P[b][j] ?? P[a][j], e)])), stand: lerp(h0, h1, e) };
  };
  // Eyes: on the pen, down at the blob (2.17), half-lidded under the lamp (7.5), the glance up-right at the clock (8.5–9.25), back
  // on the calendar's circle; the tag's look up at the new drop (14.5), then level. Mouth: the small relief smile at the sit-back.
  const eyesAt = (tc: number) => (tc < F(26) ? 'open' : tc < B.lampSitBack ? 'side' : tc < 8.5 ? 'tired' : tc < 9.25 ? 'side' : 'open');   // v6-ending: from 14.5 a straight, held look at the drop (no glance away)
  const mouthAt = (tc: number) => (tc >= CUT_W || (tc >= B.lampSitBack && tc < CUT_I2) ? 'smile' : 'line');   // fix-payoff: the small smile from the sit-back, again from the tag's first frame to the end

  // ---------- the Exam, the dot, its trace, and the new drop ----------
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh, exam.stain);
  // v3: the blob casts a real shadow while it is on the desk (the bulb is at the shade now, behind it). On the sheet the bulb
  // is 7 mm out in front of the paper, so a real shadow of the dot would land a few cells away and read as a second dot;
  // there the dot and the drop get a soft contact shadow decal on the sheet instead (ponytail: a decal, not the light's).
  const LAND = [FX, 0, 0.008];                                   // where it first landed in s02, at the calendar's foot
  exam.stain.position.set(LAND[0], 0.0003, LAND[2]); exam.stain.material.opacity = 0.3;
  const DOT = BLOB_R.examCrossedOff / BLOB_R.start;
  const onPage = (y: number, out: THREE.Vector3, s: number) => { const k = (C.y0 + C.lip - (y - BLOB_R.start * s)) / C.lip;   // s02's: clear of the curl
    return out.set(FX, y, C.z + 0.0009 + (k > 0 ? C.lipZ * Math.min(1, k) ** 2 : 0)); };
  const LIP_DOT = C.y0 + 0.0006;                                  // the dot's centre, sitting on the curled lip
  const RED_LINE = FY - 0.0036;                                   // the painted circle's bottom line, under the X (measured on a still)
  // The soak's trace: the stain's blot stood upright on the sheet, blooming as the paper drinks the dot.
  const trace = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: PALETTE.ink, map: exam.stain.material.map,
    alphaMap: exam.stain.material.alphaMap, transparent: true, depthWrite: false, opacity: 0 }));
  trace.position.set(FX, RED_LINE, C.z + 0.0009); scene.add(trace);
  const drop = createBlob({ radius: 0.012, seed: 9 });           // a new birth-bead, not the old blob back
  drop.mesh.castShadow = false; scene.add(drop.mesh);
  const softTex = (() => { const cv = Object.assign(document.createElement('canvas'), { width: 64, height: 64 }), g = cv.getContext('2d')!;
    const r = g.createRadialGradient(32, 32, 2, 32, 32, 31); r.addColorStop(0, 'rgba(14,10,24,1)'); r.addColorStop(1, 'rgba(14,10,24,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const contact = () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: softTex, transparent: true, depthWrite: false, opacity: 0.5 }));
    m.visible = false; scene.add(m); return m; };
  const dotShadow = contact(), dropShadow = contact();
  // The first mark: a fresh sheet propped on the desk at the pad (leaning at 50°), "1." going down in the hand.
  const pad = T.cut(props, 'blank_page', [PAD.w, null], 'pad');
  pad.g.rotation.set(-(Math.PI / 2 - PH_RAD), 0, 0);
  pad.g.position.copy(padPoint(0.5, 0.5));
  pad.g.visible = false;
  const padInk = (() => { const W = 256, H = Math.round(W * PH / PAD.w), cv = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = cv.getContext('2d')!;
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PAD.w, PH), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.z = 0.00003; pad.mesh.add(m);
    let drawn = '';
    const MARK_PX = 120;   // the "1." is about 120 px tall on a 256 px sheet
    // v6-ending: the "1." is written where the nib really is (the ray from the camera through the nib, onto the sheet), ending
    // on its dot, so the stroke comes out of the nib instead of from under his hand. k: how much of it is down.
    return (k: number, at: Anchor | null) => {
      let ex = 0, ey = 0;
      if (k > 0 && !at) k = 0;
      if (k > 0) {   // the sheet's plane (a plane, not a mesh hit, so its edges and facing can't drop the stroke)
        const n = new THREE.Vector3(0, 0, 1).transformDirection(m.matrixWorld), o = new THREE.Vector3().setFromMatrixPosition(m.matrixWorld);
        const q = new THREE.Ray(at!.cam, at!.nib.clone().sub(at!.cam).normalize()).intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(n, o), new THREE.Vector3());
        if (q) { const l = m.worldToLocal(q); ex = Math.round((l.x / PAD.w + 0.5) * W); ey = Math.round((0.5 - l.y / PH) * H); } else k = 0; }
      const id = `${Math.round(k * 200)}|${ex}|${ey}`; if (id === drawn) return; drawn = id; g.clearRect(0, 0, W, H);
      if (k > 0) { g.font = handFont(MARK_PX); const w = g.measureText('1.').width, x0 = ex - w, y0 = ey + 4;
        g.save(); g.beginPath(); g.rect(0, 0, x0 + (w + 8) * k, H); g.clip(); g.fillStyle = DROP_INK; g.strokeStyle = DROP_INK; g.lineWidth = 5;
        g.fillText('1.', x0, y0); g.strokeText('1.', x0, y0);
        // the drop's ink, so the blob's gloss: a pale highlight up and left inside the stroke
        g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(235, 230, 255, 0.45)'; g.fillText('1.', x0 - 4, y0 - 5);
        g.fillStyle = DROP_INK; g.fillText('1.', x0 + 1, y0 + 1); g.restore(); }
      tex.needsUpdate = true; }; })();
  const DROP_AT = [NX, NY - CIRCLE_R * 0.92 * mpp];              // on the new circle's bottom line, under the word

  // ---------- his hand in I2 (the near arm seen face-on), holding the red marker; its tip is the group's origin ----------
  const hand = new THREE.Group(); scene.add(hand);
  const arm = T.cut(gsheet, 'arm_r', [0.022, null], 'i2_arm', { anchor: [0.9, 0.5], parent: hand });
  arm.g.rotation.z = 35 * DEG; arm.g.position.set(-0.0022, -0.0028, 0.0006);
  T.rect('i2_marker', PALETTE.calendarRed, [0.0065, 0.0011], [-0.0026, -0.0022, 0.0003], { rot: [0, 0, 40 * DEG], parent: hand });

  // ---------- light: the lamp, on; night ambient; a warm character fill; the shade glowing ----------
  const lamp = lampLight({ angle: 0.95, penumbra: 0.9, intensity: LAMP_I });
  lamp.light.position.set(...LAMP_AT);
  lamp.light.target.position.set(...LAMP_AIM);
  lamp.light.shadow.camera.near = 0.002;
  const face = new THREE.PointLight(Cc('cream').lerp(Cc('lamp'), 0.3), FACE_I, 0.08, 2); face.position.set(-0.035, 0.035, 0.06);
  const amb = ambient(); amb.intensity *= AMB;
  const day = new THREE.DirectionalLight(Cc('cream').lerp(Cc('phone'), 0.12), DAY_I);   // the window, off right: pale afternoon, no shadow of its own
  day.position.set(0.8, 0.6, 0.6); day.target.position.set(0.06, 0.05, 0.06); day.castShadow = false;
  scene.add(lamp.light, lamp.light.target, face, amb, day, day.target);
  {   // s06's: the painted shade's trapezoid, lit from inside
    const k = DESK.lamp.h / 212, s = new THREE.Shape([[-52, 0], [52, 0], [30, 75], [-30, 75]].map(([x, y]) => new THREE.Vector2(x * k * 0.92, y * k * 0.94)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: PALETTE.lamp, transparent: true, opacity: 0.55, toneMapped: false }));
    m.position.set(DESK.lamp.x, DESK.lampMouth[1] + 0.0005, LAMP_Z + 0.0008); scene.add(m);
  }

  // ---------- the fade: the amber grade scaled to black over 16.0–17.0, on 1s (frame 23 = 194.958 is black) ----------
  // The base grade is amber blended toward s02's dawn (HOME_MIX), so the ending keeps the home's palette instead of the full act-3 orange.
  const amber = loadLUT('amber')!, dawn = loadLUT('dawn')!, fades: THREE.Data3DTexture[] = [];
  const base = Uint8Array.from(amber.image.data!, (v, i) => (i % 4 === 3 ? 255 : Math.round(v * (1 - HOME_MIX) + dawn.image.data![i] * HOME_MIX)));
  const lutOf = (data: Uint8Array<ArrayBuffer>) => { const tex = new THREE.Data3DTexture(data, amber.image.width, amber.image.height, amber.image.depth);
    return Object.assign(tex, { format: amber.format, type: amber.type, minFilter: amber.minFilter, magFilter: amber.magFilter,
      wrapS: amber.wrapS, wrapT: amber.wrapT, wrapR: amber.wrapR, unpackAlignment: 1, needsUpdate: true }); };
  const baseLUT = lutOf(base);
  const fadeLUT = (k: number) => fades[k] ??= lutOf(Uint8Array.from(base, (v, i) => (i % 4 === 3 ? 255 : Math.round(v * (1 - k / 23)))));

  const c = new THREE.Vector3(), hp = new THREE.Vector3(), look = new THREE.Vector3();
  let anchor: Anchor | null = null;   // the nib and the camera at the end of the stroke (filled below by one dry run of update), so the ink stays put when the pen lifts
  const shot = {
    exam,   // read by evidence/trims-home/blobs.js
    update(t: number) {
      T.boil(t);
      clock.boil(t); clock.set(CLOCK.h, CLOCK.m, t);   // the second hand steps on every whole second
      const f = fr(t), tc = F(f);
      const inI = t >= CUT_I && t < CUT_SIT, inI2 = t >= CUT_I2 && t < CUT_W, inW = !inI && !inI2;

      // camera (on 1s), straight cuts; the fade on the grade
      // The tag's W (11.5 on) eases in over four and a half seconds, so the drop, the pen and the first mark are bigger as they land.
      const push = t >= CUT_W ? ease(clamp((t - CUT_W) / (FADE - CUT_W))) : 0;
      const cam = inI ? CAM_I : inI2 ? CAM_I2 : CAM_W;
      camera.position.set(...(cam.pos.map((v, i) => lerp(v, PUSH.pos[i], push)) as Vec3)); camera.lookAt(look.set(...(cam.look.map((v, i) => lerp(v, PUSH.look[i], push)) as Vec3)));
      const k = t < FADE ? -1 : Math.min(23, Math.round((t - FADE) * 24));
      fx.set({ focus: inW ? camera.position.distanceTo(look) : camera.position.z - C.z, aperture: inW ? 0.01 : 0.003, lut: k < 0 ? baseLUT : fadeLUT(k), grain: k === 23 ? 0 : 0.04 });

      // the calendar's marks
      const [k1, k2] = xAt(tc);
      drawX(k1, k2);
      const kw = wordAt(tc), kc = circleAt(tc);
      drawFinal(kw, kc);

      // ---- the Student (seen in W) ----
      const { pose, stand } = poseAt(tc);
      gator.boil(t, 10);
      gator.blend({ now: pose }, [[0, 'now']], 0);
      gator.group.position.set(lerp(DESK.hip[0], STAND[0], stand), lerp(DESK.hip[1], STAND[1], stand) - (tc >= 15.5 && tc < F(188) ? 0.0005 : 0), DESK.hip[2]);
      gator.follow('tail', t, { k: 6, w: 18 });
      // v4 acting: resolve at the cross-off, then relief from the sit-back to the end (fix-payoff: no second resolve at the tag, whose
      // lowered brow and bar mouth read as dread; one slow breath of 5 s instead). slump 0, tilt 0:
      // his hand is on the pen, the calendar and the desk, so the poses own the lean. The face goes over the preset's (the eyes follow the beats above).
      act(gator, t, [[0, 'resolve'], [F(26), 'relief']], { slump: 0, tilt: 0, breath: 5, blink: false });
      gator.face({ eyes: eyesAt(tc), mouth: mouthAt(tc) });
      // v6-ending: the warm smile as the drop lands on the nib: the smile take drawn bigger (it reads at 400 px), held to the end
      { const grin = tc >= T_LAND; gator.meshes.mouth.scale.set(grin ? 1.9 : 1, grin ? 1.7 : 1, 1); }
      gator.group.updateMatrixWorld(true);
      gator.hand!.getWorldPosition(hp);
      gator.group.visible = inW;
      gator.meshes.leg_l.visible = gator.meshes.leg_r.visible = stand < 0.5;   // behind the desk: no legs over the desktop
      // the pen: in his hand (nib to the sheet) for the X, on the page's front edge, picked up at 12.67, level from 13.0
      const holding = tc < F(26) || tc >= F(188), level = tc >= F(192), uncapped = tc >= B.tagPenUncap - 1e-6;
      const a = tc >= T_IN ? -40 * DEG * ease(clamp((tc - T_IN) / (T_TOUCH - T_IN))) : level ? 0 : 40 * DEG;   // 40° at first, level for the uncap and the offer, then tipped nib-down for the mark
      if (holding) { pen.g.rotation.set(0, 0, a); pen.g.position.set(hp.x + 0.003 * Math.cos(a), hp.y + 0.003 * Math.sin(a), DESK.hip[2] + 0.0128); }
      else { pen.g.rotation.set(-Math.PI / 2, 0, -0.1); pen.g.position.set(...penRest); }
      cap.g.rotation.set(0, 0, level ? 0 : 40 * DEG);   // the far hand keeps the cap, so it doesn't follow the nib down
      cap.g.position.set(hp.x + 0.003 * Math.cos(level ? 0 : 40 * DEG), hp.y + 0.003 * Math.sin(level ? 0 : 40 * DEG), pen.g.position.z);
      if (uncapped) cap.g.position.x += 0.005;   // s15's uncap drawing: the far hand jerks back with the cap
      if (holding) cap.g.position.z -= 0.0002;
      if (tc >= F(202)) { cap.g.rotation.set(-Math.PI / 2, 0, -0.1); cap.g.position.set(penRest[0] - 0.004, 0.0006, penRest[2]); }   // v6-ending: the cap set down on the desk
      pen.g.visible = cap.g.visible = inW;

      // ---- the Exam ----
      let vis = true, s = 1, squash = 0, eyes = 'open', lookDir = 1;
      if (tc < B.examCrossedOff) { c.set(LAND[0], 0, LAND[2]); lookDir = -1; }
      else if (tc < CUT_I) { s = DOT; c.set(LAND[0], 0, LAND[2]); squash = 0.3 * Math.exp(-6 * (tc - 2)) * Math.cos(18 * (tc - 2)); }
      else if (tc < B.blobAbsorbed + F(1)) {
        s = DOT;
        if (tc < 3.5) {   // the hop up from below frame onto the lip, one arc
          const h = easeOut((tc - 3) / 0.5);
          onPage(lerp(LIP_DOT - 0.006, LIP_DOT, h) + 0.003 * Math.sin(Math.PI * h), c, s); eyes = 'closed'; squash = -0.2;
        } else if (tc < 4) { onPage(LIP_DOT, c, s); squash = tc < 3.667 ? 0.3 : 0; eyes = tc < 3.667 ? 'closed' : 'open'; }
        else if (tc < 5) { onPage(lerp(LIP_DOT, RED_LINE, ease(tc - 4)), c, s); squash = -0.2; }
        else { onPage(RED_LINE, c, s); eyes = tc < 5.333 ? 'side' : 'closed'; lookDir = -1; if (tc >= B.blobAbsorbed - 1e-6) squash = 0.8; }
        c.y -= BLOB_R.start * s;   // centre → contact point
      } else vis = false;
      exam.mesh.visible = vis; exam.mesh.castShadow = tc < CUT_I;   // real shadow on the desk; none on the sheet (decal below)
      exam.mesh.position.copy(c); exam.mesh.scale.setScalar(s);
      exam.stain.visible = tc < CUT_I; exam.stain.scale.setScalar(tc < B.examCrossedOff ? 1 : DOT);
      exam.update(t, { squash, wobble: 0.6, eyes, look: lookDir, key: lamp.light });
      dotShadow.visible = vis && tc >= CUT_I;
      if (dotShadow.visible) { dotShadow.position.set(c.x + 0.0005, c.y + BLOB_R.start * s * 0.8 - 0.0004, C.z + 0.00085 + (c.z - C.z - 0.0009)); dotShadow.scale.set(0.0042, 0.0032, 1); }
      // the trace: blooms over 5.5–6.0 as the paper drinks it, and stays
      const tk = easeOut(clamp((t - B.blobAbsorbed) / 0.5));
      trace.visible = t >= B.blobAbsorbed;
      trace.material.opacity = lerp(STAIN[0], STAIN[1], easeOut(clamp((t - B.blobAbsorbed - 0.1) / 0.9)));
      trace.scale.set(lerp(0.0036, 0.0066, tk), lerp(0.0024, 0.0044, tk), 1);   // the dot's flattened width, spreading as the paper drinks it

      // ---- the new drop: beads 10.0–10.67, quivers on 1s from 11.0, still from the uncap's drawing ----
      drop.mesh.visible = tc >= 13;
      dropShadow.visible = drop.mesh.visible;
      if (drop.mesh.visible) {
        const ds = Math.max(1e-3, BEAD * easeOut((tc - 13) / 0.667));
        drop.mesh.scale.setScalar(ds);
        drop.mesh.position.set(DROP_AT[0], DROP_AT[1] - 0.012 * ds, C.z + 0.0010);
        // v6-ending: light from above, so its shadow is a dot, smaller than the drop, just under it (it never grows: he's looking)
        { const y = DROP_AT[1] - 0.0042 * ds / BEAD, kc = clamp((C.y0 + C.lip - y) / C.lip); dropShadow.position.set(DROP_AT[0] + 0.0002, y, C.z + 0.0012 + C.lipZ * kc); }
        dropShadow.scale.set(0.0034 * ds / BEAD, 0.0017 * ds / BEAD, 1);   // on the curl, which comes forward here
        dropShadow.material.opacity = 1;
        const quiver = tc >= B.dropQuivers && !uncapped;
        let squash = 0, eyes = tc >= T_REACH && inW ? (tc >= T_BLINK && tc < T_BLINK + F(1) ? 'closed' : 'open') : 'closed';   // it opens its eyes at the nib, blinks once
        if (tc >= T_HOP) {   // the hop: a small arc off the circle onto the nib, stretched in the air, squash on landing, then into the nib
          const nib = pen.g.position, h = clamp((tc - T_HOP) / (T_LAND - T_HOP)), e = ease(h);
          const sink = clamp((tc - T_LAND - F(1)) / (T_IN - T_LAND - F(1)));
          drop.mesh.position.set(lerp(DROP_AT[0], nib.x, e), lerp(DROP_AT[1] - 0.012 * ds, nib.y + 0.0003, e) + 0.0012 * Math.sin(Math.PI * h), lerp(C.z + 0.001, nib.z + 0.0004, e));
          squash = h < 1 ? -0.25 : 0.5 * Math.exp(-8 * (tc - T_LAND));
          drop.mesh.scale.setScalar(Math.max(1e-3, ds * (1 - sink)));
          drop.mesh.visible = sink < 1; dropShadow.visible = false; eyes = sink > 0 ? 'closed' : 'open';
        }
        drop.update(quiver ? 2 * t : uncapped ? 2 * B.tagPenUncap : t, { wobble: quiver ? 1.6 : 0.4, squash, eyes, look: -1, key: lamp.light });
      }

      // ---- the first mark (fix-payoff: the dashed ghost of the old blob is gone, cold viewer: "its old size, or the next one forming?") on the propped sheet ----
      pad.g.visible = inW && tc >= CUT_W;
      const kMark = inW ? clamp((tc - T_TOUCH) / (T_MARK - T_TOUCH)) : 0;
      if (kMark > 0) pad.g.updateMatrixWorld(true);
      padInk(kMark, anchor);
      // the nib follows the stroke: from the top of the "1" down to its dot (where the ink is anchored), then rests there
      if (kMark > 0 && kMark < 1 && holding) pen.g.position.add(new THREE.Vector3(-0.003 * (1 - kMark), 0.004 * (1 - kMark), 0));
      // ---- his hand in I2: in 7.0–7.5 with the marker, writes "Final", circles it, leaves after 9.67 ----
      hand.visible = inI2 && tc >= 10 && tc < 12.833;
      if (hand.visible) {
        let px, py;
        if (tc < 10.5) { const h = ease((tc - 10) / 0.5); px = lerp(NX - 0.03, NX - finalW / 2 * mpp, h); py = lerp(NY - 0.02, NY, h); }
        else if (tc < 11.833) { px = NX + (kw - 0.5) * finalW * mpp; py = NY - 0.0003 + 0.0003 * Math.sin(kw * 30); }
        else if (tc < 12.667) { const an = A0 + 2 * Math.PI * 1.06 * kc; px = NX + Math.cos(an) * CIRCLE_R * mpp; py = NY - Math.sin(an) * CIRCLE_R * 0.92 * mpp; }
        else { const h = ease((tc - 12.667) / 0.167); px = lerp(NX, NX - 0.03, h); py = lerp(NY, NY - 0.02, h); }
        hand.position.set(px, py, C.z + 0.004);
      }
    },
  };
  shot.update(T_MARK - 1e-4);
  anchor = { nib: pen.g.position.clone(), cam: camera.position.clone() };
  return shot;
}
