// @ts-check
// The film's one wall clock (docs/shots/README.md §13; brief climax-a1). The painted clock_kit: a face (kraft rim at
// home, navy rim in the exam room), the hour and minute hands, the amber pin; a thin second hand drawn in code on the
// paper material in Night Navy. Every hand is its own paper plane in front of the face, so a low light gives each a
// small shadow. A pure function of the time you set: no clock is read.
//
//   const clock = await makeClock(ctx, { seed, diameter = 0.020, face = 'home' })   // ctx needs { assets }
//   → { group, set(h, m, s), boil(t) }
//     group     add it to the scene; its origin is the dial's centre, the face in its local xy plane facing +z.
//     set(h, m, s)  h 0..23 (12-hour face), m 0..59, s real seconds. The second hand shows floor(s) and steps on whole
//               seconds: on the first 24 fps frame of each second (frac(s) < 1/24) it overshoots +1.5° (clockwise),
//               back at rest from the next frame (README §13). The minute hand moves on each whole second, the hour hand
//               with the minutes. For a clock that should stand still, pass a fraction past the step, e.g. s = 0.5.
//     boil(t)   re-tears the paper at the film's 10/s boil (additive to README §13's API: the clock is paper too).
//   The async is assets.load's (the kit is a bitmap). seed picks the boil pattern so two clocks never boil alike.
import * as THREE from 'three';
import { makePaper, boilSeed } from './paper.js';
import { paperMesh, updatePaperMesh } from './material.js';
import { PALETTE } from './core/palette.js';

const KIT_D = 0.020;           // the PIECES sizes are for a Ø 0.020 dial; everything scales with diameter / KIT_D
const STEP_FRAME = 1 / 24, OVERSHOOT = 1.5 * Math.PI / 180;
const Z = { hour: 0.0003, minute: 0.0006, second: 0.0009, pin: 0.0012 };   // each hand on its own plane (× scale)

// The round end of a hand, from its cut bitmap: the hand stands upright, tip at the top, with a narrow waist above a
// round boss at the bottom. The boss's centre is its widest width / 2 above its bottom row (it's a circle). → [u, v]
// in the bitmap (v down), and the opaque top row's v (the tip).
function pivotOf(bmp) {
  const W = bmp.width, H = bmp.height, g = Object.assign(document.createElement('canvas'), { width: W, height: H }).getContext('2d');
  g.drawImage(bmp, 0, 0);
  const a = g.getImageData(0, 0, W, H).data, rows = [];
  for (let y = 0; y < H; y++) {
    let x0 = -1, x1 = -1;
    for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] >= 128) { if (x0 < 0) x0 = x; x1 = x; }
    rows.push(x0 < 0 ? null : [x0, x1]);
  }
  const ys = rows.map((r, y) => (r ? y : -1)).filter((y) => y >= 0), top = ys[0], bot = ys.at(-1);
  const wd = (y) => (rows[y] ? rows[y][1] - rows[y][0] + 1 : 0);
  let waist = bot, wmin = Infinity;   // the narrowest row in the bottom 40%, above the boss's own rounding
  for (let y = Math.round(bot - 0.4 * (bot - top)); y < bot - 0.15 * (bot - top); y++) if (wd(y) < wmin) { wmin = wd(y); waist = y; }
  let wmax = 0, cx = W / 2;
  for (let y = waist; y <= bot; y++) if (wd(y) > wmax) { wmax = wd(y); cx = (rows[y][0] + rows[y][1] + 1) / 2; }
  return { pivot: [cx / W, (bot + 1 - wmax / 2) / H], tip: top / H };
}

export async function makeClock(ctx, { seed = 0, diameter = KIT_D, face = 'home' } = {}) {
  if (face !== 'home' && face !== 'exam') throw new Error(`makeClock: face is 'home' or 'exam', not "${face}"`);
  const kit = await ctx.assets.load('clock_kit'), k = diameter / KIT_D, key = `clock-${face}-${seed}`;
  const group = new THREE.Group(), boiling = [];
  const sheet = (name, opts) => {
    const make = (s) => makePaper({ ...opts, key: `${key}-${name}`, seed: s });
    const mesh = paperMesh(make(0), { translucency: 0, edgeCatch: 0.3 });
    mesh.castShadow = false;           // the face, the pin: only the hands may cast (and only the blob, unless a shot opts in)
    boiling.push([mesh, make]);
    return mesh;
  };
  // A kit piece, its opaque box scaled to the PIECES size × k, placed so bitmap point [u, v] sits at the origin of `holder`.
  /** @param {string} name @param {number[]} uv [u, v] @param {number} z */
  const piece = (name, [u, v], z) => {
    const bmp = kit.pieces[name], [sw, sh] = kit.sizes[name];
    const mesh = sheet(name, { art: bmp, size: [sw * k, sh * k], res: name.startsWith('face') ? 1024 : 512 });
    mesh.position.set((0.5 - u) * sw * k, (v - 0.5) * sh * k, 0);
    const holder = new THREE.Group(); holder.position.z = z * k; holder.add(mesh); group.add(holder);
    return { holder, mesh };
  };
  const box = (name) => { const [u0, v0, u1, v1] = kit.visible[name]; return [(u0 + u1) / 2, (v0 + v1) / 2]; };

  piece(`face_${face}`, box(`face_${face}`), 0);
  const pv = {}, hand = {};
  for (const n of ['hour', 'minute']) {
    pv[n] = pivotOf(kit.pieces[n]);
    hand[n] = piece(n, pv[n].pivot, Z[n]);
    hand[n].mesh.castShadow = true;    // README §13: a low light gives the hands small shadows on the face
  }
  // The second hand: a thin Night Navy strip, 7.6 mm from the centre to the edge of the ticks plus a 1.6 mm tail, about
  // 0.4 mm wide. The canvas is wider than the strip so the paper's torn edge has room and doesn't eat it.
  const SL = 0.0076 * k, ST = 0.0016 * k, SW = 0.0016 * k;
  const sec = new THREE.Group(); sec.position.z = Z.second * k; group.add(sec);
  const secMesh = sheet('second', { path: [[0.38, 0], [0.62, 0], [0.6, 1], [0.4, 1]], color: PALETTE.navy, weight: 'vellum', size: [SW, SL + ST], res: 1024 });
  secMesh.position.y = (SL - ST) / 2;
  secMesh.castShadow = true;
  sec.add(secMesh);
  piece('pin', box('pin'), Z.pin);

  // The measured pivots, for the done note and anyone checking (bitmap uv, v down; reach in m at this diameter).
  const reach = (n) => (pv[n].pivot[1] - pv[n].tip) * kit.sizes[n][1] * k;
  group.userData.clock = { pivots: { hour: pv.hour.pivot, minute: pv.minute.pivot }, reach: { hour: reach('hour'), minute: reach('minute'), second: SL } };

  const cw = (turns) => -turns * 2 * Math.PI;   // clockwise from 12, as rotation.z
  function set(h, m, s = 0) {
    const whole = Math.floor(s + 1e-6), frac = s - whole;
    const over = frac < STEP_FRAME - 1e-6 ? OVERSHOOT : 0;
    sec.rotation.z = cw(whole / 60) - over;
    hand.minute.holder.rotation.z = cw((m + whole / 60) / 60);
    hand.hour.holder.rotation.z = cw(((h % 12) + (m + whole / 60) / 60) / 12);
  }
  function boil(t) { const sd = boilSeed(t, 10); for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(sd)); }
  set(0, 0, 0.5);
  return { group, set, boil };
}
