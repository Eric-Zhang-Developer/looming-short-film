// s02 · The ink drop is born (docs/shots/s02.md, G4). v2 on the frozen kits, and the home desk unit re-staged at real
// scale (brief v2-home-a: the director's "massive table"). The desk, chair, lamp and laptop are home_kit art at the
// scale table's sizes (evidence/asset-home-kit/scale_table.md: 1 real m = 0.055 film m against the 0.096 m gator); the
// calendar, the "Calc 2 exam" square, its red circle, the page, pen and phone are props_kit art at real size (the
// calendar is a 90 cm wall planner). This file also exports the unit (DESK, tools, homeDesk) so s00, s03 and s06 build
// the same room: change it here.
// The shot: W, a push-in to the calendar insert (calendarZoom 1.5–3.5), the bead on the circle (inkDropForms 5.0), the
// run, perch and two looks, a cut back to W on the let-go (7.083), the landing, the swell to 1× and two hops to B.
// He slumps at the desk's left end and never looks up until 9.33 (v4: numb, one small flinch). The wall clock reads 9:00 beside the
// calendar. Characters on 2s, light and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.ts';
import { paperMesh, updatePaperMesh } from '../material.ts';
import { dawnLight, ambient } from '../lights.ts';
import { kf, ease, easeIn, easeOut, spring, lerp, clamp } from '../core/ease.ts';
import { mulberry32, seedOf } from '../core/rng.ts';
import { createBlob } from '../blob.ts';
import { makeGator } from '../characters/gator.ts';
import { POSES } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import { makeClock } from '../clock.ts';
import type { PaperOptions, PaperSheet } from '../paper.ts';
import type { PaperMesh } from '../material.ts';
import type { Kit } from '../assets.ts';
import type { PALETTE as PALETTE_T } from '../core/palette.ts';
import type { ShotCtx } from '../film.ts';

const DEG = Math.PI / 180;

export type Palette = typeof PALETTE_T;
// paperMesh's options (translucency, edgeCatch).
export type MatOpts = NonNullable<Parameters<typeof paperMesh>[1]>;
// DESK, with the fields computed after the literal (lampMouth, bead, cal.h, cal.friXY).
type Desk = {
  floor: number, x0: number, w: number, d: number, hip: Vec3,
  chair: { h: number, x: number, z: number },
  lamp: { x: number, z: number, h: number },
  cal: { x0: number, w: number, y0: number, z: number, lip: number, lipZ: number, fri: number[], h: number, friXY: [number, number] },
  page: number[], phone: number[], pen: number[], screenZ: number,
  laptop: { scale: number, yaw: number },
  lampMouth: Vec3, bead: Vec3,
};

// ---------- the home desk unit at real scale (m). Wall z 0, desk top y 0, the Student in profile facing +x. ----------
export const DESK = {
  floor: -0.0413,                  // the desk's painted height (75 cm): its top edge is y 0
  x0: -0.033, w: 0.0768, d: 0.033, // painted desk front (mirrored: drawers right, kneehole left by him), 60 cm deep
  hip: [-0.056, -0.0135, 0.016] as Vec3,   // seated hip on the desk_chair's cushion; body plane z 0.016 (near arm +0.012)
  chair: { h: 0.0495, x: -0.061, z: 0.008 },
  // A tall table lamp (home_kit's "floor_lamp" art at 80 cm; v3: it was a 120 cm cartoon allowance so its shade cleared his
  // head). Now a normal tall table lamp, moved right of his snout so the shade stays visible, behind the blob's mark;
  // mirrored so the pull chain hangs on his side. Painted: shade mouth at 0.646 of its height, the chain's bead at
  // 0.505, 21 px (of 212 tall) off the stem.
  lamp: { x: 0.008, z: 0.004, h: 0.044 },
  // Wall planner over the desk. Friday's empty cell (row 3, column 5 of the painted grid) holds the lettered square,
  // circled in red. fri: the cell centre in the art's uv (from the left, from the top), measured on the cut PNG.
  cal: { x0: 0.008, w: 0.050, y0: 0.030, z: 0.0015, lip: 0.008, lipZ: 0.006, fri: [173 / 275, 183 / 292] },
  page: [-0.016, 0.022],           // blank practice sheet (x, z), real letter size
  phone: [0.031, 0.026],           // phone rest (x, z), face-up, long side along x
  pen: [-0.016, 0.0305],
  screenZ: 0.0225,                 // the open laptop screen's centre (the screen light): S 3.0 on s03's blob at z 0.015, S 4.06 on s06's at 0.0170
  // v7-laptop: the laptop at cartoon scale next to his cartoon head (real scale, 33 cm, read as a phone at 0:20), turned
  // toward the camera so the lit screen shows (v6: −55°, edge-on). homeDesk's laptopScale/laptopYaw default to v6's for
  // the shots that don't ask (s00, s18).
  laptop: { scale: 1.8, yaw: -30 * DEG },
} as Desk;
DESK.lampMouth = [DESK.lamp.x, DESK.lamp.h * 0.646, DESK.lamp.z];
DESK.bead = [DESK.lamp.x - DESK.lamp.h * 21 / 212, DESK.lamp.h * 0.505, DESK.lamp.z];
/** homeDesk's options for the v7 laptop (s02, s03, s06). */
export const LAPTOP = { laptopScale: DESK.laptop.scale, laptopYaw: DESK.laptop.yaw };
{ const c = DESK.cal; c.h = c.w * 292 / 275; c.friXY = [c.x0 + c.fri[0] * c.w, c.y0 + c.h * (1 - c.fri[1])]; }

// Paper helpers shared by the home desk shots (from s04: torn rects, kit pieces cut by their visible box, tiles).
const PAD = 0.04;
function torn(w: number, h: number) {
  const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}
export type Tools = ReturnType<typeof tools>;
export type Cut = ReturnType<Tools['cut']>;
export function tools({ scene, PALETTE }: Pick<ShotCtx, 'scene' | 'PALETTE'>, ID: string) {
  const col = (a: keyof Palette, b: keyof Palette, k: number) => '#' + new THREE.Color(PALETTE[a]).lerp(new THREE.Color(PALETTE[b]), k).getHexString();
  const tiltOf = (k: string, deg = 1.5): Vec3 => { const r = mulberry32(seedOf(ID, k)); return [(2 * r() - 1) * deg * DEG, (2 * r() - 1) * deg * DEG, 0]; };
  const boiling: [PaperMesh, (s: number) => PaperSheet][] = [];
  const paper = (key: string, opts: PaperOptions, mat?: MatOpts) => {
    const make = (s: number) => makePaper({ ...opts, key: `${ID}-${key}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    mesh.castShadow = false;   // only the blob casts, unless a shot turns a piece on
    boiling.push([mesh, make]);
    return mesh;
  };
  const group = (mesh: THREE.Object3D, at: Vec3, { rot = null, parent = scene }: { rot?: Vec3 | null, parent?: THREE.Object3D } = {}) => {
    const g = new THREE.Group(); g.add(mesh); g.position.set(...at);
    if (rot) g.rotation.set(...rot);
    parent.add(g);
    return g;
  };
  const rect = (key: string, color: string, [w, h]: number[], at: Vec3, o: { weight?: string, res?: number, mat?: MatOpts, rot?: Vec3 | null, parent?: THREE.Object3D } = {}) =>
    group(paper(key, { ...torn(w, h), color, weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat), at, o);
  // A cut piece whose visible box is [w, h] (null keeps the aspect), its origin at that box's anchor [ax, ay] (0..1 from
  // the left / bottom). flip mirrors it left-right about the same box.
  const cut = (a: Kit, p: string, [w, h]: (number | null)[], key: string, o: { anchor?: number[], weight?: string, res?: number, mat?: MatOpts, flip?: boolean, tilt?: boolean, parent?: THREE.Object3D } = {}) => {
    const [sw, sh] = a.sizes[p], [u0, v0, u1, v1] = a.visible[p], vw = sw * (u1 - u0), vh = sh * (v1 - v0);
    const sx = w != null ? w / vw : h! / vh, sy = h != null ? h / vh : sx, [ax, ay] = o.anchor ?? [0.5, 0.5];
    const mesh = paper(key, { art: a.pieces[p], size: [sw, sh], weight: o.weight ?? 'cardstock', res: o.res ?? 512 }, o.mat);
    const f = o.flip ? -1 : 1;
    mesh.scale.set(sx * f, sy, 1);
    mesh.position.set(f * -((u0 + u1) / 2 - 0.5) * sw * sx + (f > 0 ? 0.5 - ax : ax - 0.5) * vw * sx * f,
      ((v0 + v1) / 2 - 0.5) * sh * sy + (0.5 - ay) * vh * sy, 0);
    const inner = new THREE.Group(); inner.add(mesh);
    if (o.tilt) inner.rotation.set(...tiltOf(key));
    const g = new THREE.Group(); g.add(inner); (o.parent ?? scene).add(g);
    return { g, inner, mesh, size: [vw * sx, vh * sy] };
  };
  const tiled = (a: Kit, p: string, nx: number, ny: number) => {
    const bmp = a.pieces[p], [u0, v0, u1, v1] = a.visible[p], E = 4;
    const tw = Math.round((u1 - u0) * bmp.width) - 2 * E, th = Math.round((v1 - v0) * bmp.height) - 2 * E;
    const c = Object.assign(document.createElement('canvas'), { width: tw * nx, height: th * ny }), g = c.getContext('2d')!;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g.drawImage(bmp, u0 * bmp.width + E, v0 * bmp.height + E, tw, th, i * tw, j * th, tw, th);
    return c;
  };
  const boil = (t: number) => { const s = boilSeed(t, 10); for (const [m, make] of boiling) updatePaperMesh(m, make(s)); };
  return { col, tiltOf, paper, group, rect, cut, tiled, boil };
}

// The seated lean and near-arm angle (degrees, specPose) that put his fingertip, seen from camera `cam`, on world point p:
// p is slid along the camera ray to the hand's plane (body z + 0.013), then the lean in [l0, l1] whose shoulder is
// closest to one arm's length from it wins (the spec's "hold the tip, absorb the error in the lean").
export function seatReach(cam: THREE.Vector3, p: THREE.Vector3, [l0, l1] = [0, 34], hip = DESK.hip) {
  const z = hip[2] + 0.013, T = cam.clone().add(p.clone().sub(cam).multiplyScalar((z - cam.z) / (p.z - cam.z)));
  let best: { err: number, lean: number, arm: number } | null = null;
  for (let lean = l0; lean <= l1 + 1e-9; lean += 0.1) {
    const c = Math.cos(-lean * DEG), s = Math.sin(-lean * DEG), sx = hip[0] + 0.013 * c - 0.030 * s, sy = hip[1] + 0.013 * s + 0.030 * c;
    const err = Math.abs(Math.hypot(T.x - sx, T.y - sy) - 0.032);
    if (!best || err < best.err) best = { err, lean, arm: Math.atan2(T.y - sy, T.x - sx) / DEG };
  }
  return best!;   // the loop runs at least once
}

// The room: cream wall, plank floor, desk (top + painted front), chair, lamp, calendar, page, phone, laptop (and pen).
// Returns handles; each shot animates what it needs (lid, screen glow, phone screen, lamp).
export async function homeDesk(ctx: ShotCtx, T: Tools, { laptopAt = [0.0, 0.022], laptopYaw = -55 * DEG, laptopScale = 1, pen = false } = {}) {
  const { scene, assets, PALETTE } = ctx;
  const [home, props] = await Promise.all([assets.load('home_kit'), assets.load('props_kit')]);
  const { cut, rect, tiled, paper, group, col } = T;
  // Wall (the shadow receiver, never tilted), skirting, floor.
  rect('apt_wall', PALETTE.cream, [0.70, 0.40], [0.02, DESK.floor + 0.18, 0], { res: 2048 });
  rect('skirting', col('kraft', 'navy', 0.3), [0.70, 0.004], [0.02, DESK.floor + 0.002, 0.0008]);
  group(paper('apt_floor', { art: tiled(home, 'floor_strip', 3, 3), size: [0.6, 0.4], weight: 'kraft', res: 1024 }),
    [0.02, DESK.floor, 0.2], { rot: [-Math.PI / 2, 0, 0] });

  // Desk: a kraft top (z 0…d) over the painted front at z d, mirrored so the kneehole is on his side.
  rect('desk_top', col('kraft', 'cream', 0.08), [DESK.w, DESK.d], [DESK.x0 + DESK.w / 2, 0, DESK.d / 2], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft' });
  const desk = cut(home, 'desk', [DESK.w, -DESK.floor], 'desk', { anchor: [0, 1], flip: true });
  desk.g.position.set(DESK.x0, 0, DESK.d);
  const chair = cut(home, 'desk_chair', [null, DESK.chair.h], 'desk_chair', { anchor: [0.5, 0] });
  chair.g.position.set(DESK.chair.x, DESK.floor, DESK.chair.z);
  const lamp = cut(home, 'floor_lamp', [null, DESK.lamp.h], 'desk_lamp', { anchor: [0.5, 0], flip: true });
  lamp.g.position.set(DESK.lamp.x, 0, DESK.lamp.z);

  // Calendar on the wall, its bottom LIP curled out to lipZ so the drop has something to hang from.
  const C = DESK.cal;
  const calendar = cut(props, 'calendar', [C.w, null], 'calendar', { anchor: [0, 0] });
  calendar.g.position.set(C.x0, C.y0, C.z);
  {
    const m = calendar.mesh, [sw, sh] = props.sizes.calendar, v1 = props.visible.calendar[3], lipL = C.lip / m.scale.y;
    const geo = new THREE.PlaneGeometry(sw, sh, 1, 64), pos = geo.attributes.position, bottom = (0.5 - v1) * sh;
    for (let i = 0; i < pos.count; i++) { const k = (bottom + lipL - pos.getY(i)) / lipL; if (k > 0) pos.setZ(i, C.lipZ * Math.min(1, k) ** 2); }
    geo.computeVertexNormals(); m.geometry.dispose(); m.geometry = geo;
  }
  const [fx, fy] = C.friXY, cell = C.w * 34.8 / 275;
  const square = cut(props, 'calc_exam_square', [cell * 1.06, null], 'calc_exam_square', { tilt: true });
  square.g.position.set(fx, fy, C.z + 0.0004);
  const circle = cut(props, 'red_circle', [cell * 1.5, null], 'red_circle');
  circle.g.position.set(fx, fy - 0.0002, C.z + 0.0007);
  circle.g.rotation.z = 0.2;

  // Page, pen, phone, flat on the desk.
  const flat = (o: Cut, x: number, z: number, y: number, turn = 0) => { o.g.position.set(x, y, z); o.g.rotation.set(-Math.PI / 2, 0, turn); return o; };
  const page = flat(cut(props, 'blank_page', [0.0119, null], 'exam_page'), DESK.page[0], DESK.page[1], 0.0003, 0.06);
  const penO = pen ? flat(cut(props, 'pen', [0.0075, null], 'pen'), DESK.pen[0], DESK.pen[1], 0.0006, -0.1) : null;
  const phone = flat(cut(props, 'phone_face_up', [0.0083, null], 'phone'), DESK.phone[0], DESK.phone[1], 0.0004, 0.04);

  // Laptop: the keyboard deck flat, the lid (home_kit's open-laptop front, chin on the hinge) hinged at the deck's back
  // edge: setLid(0) lies face-down on the deck, setLid(110) is open. The laptop turns by laptopYaw so the screen faces
  // him (−x) and partly the camera.
  const laptop = new THREE.Group();
  laptop.position.set(laptopAt[0], 0.0004, laptopAt[1]);
  laptop.rotation.y = laptopYaw;
  scene.add(laptop);
  const LW = 0.018 * laptopScale, LD = 0.012 * laptopScale;
  const base = cut(home, 'laptop_base', [LW, LD], 'laptop_base', { parent: laptop });
  base.g.rotation.x = -Math.PI / 2;
  const hinge = new THREE.Group(); hinge.position.set(0, 0.0003, -LD / 2); laptop.add(hinge);
  const lid = cut(home, 'laptop_screen', [LW * 1.02, null], 'laptop_lid', { anchor: [0.5, 0], parent: hinge });
  lid.g.rotation.x = Math.PI / 2;   // lying along +z over the deck, face down
  const LH = lid.size[1];
  // The screen's glow: an unlit plane over the painted screen with the shooter on it (gameScreen; no text, no logo).
  const game = gameScreen(PALETTE);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(LW * 0.84, LH * 0.62), new THREE.MeshBasicMaterial({ map: game.texture, toneMapped: false }));
  glow.position.set(0, LH * 0.6, 0.0002);
  lid.g.add(glow);
  glow.visible = false;
  const setLid = (deg: number) => { hinge.rotation.x = -deg * DEG; };
  const screenCentre = (out = new THREE.Vector3()) => { laptop.updateMatrixWorld(true); return glow.getWorldPosition(out); };
  const screenNormal = (out = new THREE.Vector3()) => { laptop.updateMatrixWorld(true); return out.set(0, 0, 1).transformDirection(glow.matrixWorld); };
  // Slide the laptop in z so the open screen's centre sits at DESK.screenZ: the light's depth, which fixes every S.
  setLid(110);
  laptop.position.z += DESK.screenZ - screenCentre().z;
  setLid(0);

  return { home, props, desk, chair, lamp, calendar, square, circle, page, pen: penO, phone, laptop, lid, glow, game, setLid, screenCentre, screenNormal };
}

// v7-laptop: his game is a shooter (the director: real CS2 audio "makes it more relatable"), drawn in the paper style: a
// first-person view down a sandy lane between blocky walls and crates, a crosshair in the middle, his gun at lower right
// held in a green hand. No logos, no text, no HUD numbers. fire(on) redraws it with a muzzle flash and the gun kicked
// back (only when the state changes). Shared by every laptop screen (homeDesk's, s05's).
export function gameScreen(PALETTE: Palette) {
  const W = 320, H = 200, c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d')!;
  const col = (a: string, b: string, k: number) => '#' + new THREE.Color(PALETTE[a as keyof Palette] ?? a).lerp(new THREE.Color(PALETTE[b as keyof Palette] ?? b), k).getHexString();
  const r = mulberry32(seedOf('laptop', 'game'));
  const torn = (pts: number[][]) => pts.map(([x, y]) => [x + (r() - 0.5) * 2.4, y + (r() - 0.5) * 2.4]);   // cut-paper wobble, fixed once
  const SHAPES: [string, number[][]][] = [   // [fill, points] back to front, in canvas px; the horizon at y 92
    ['sky', [[0, 0], [W, 0], [W, 96], [0, 96]]],
    ['sand', [[0, 92], [W, 92], [W, H], [0, H]]],
    ['wallFar', [[120, 54], [205, 54], [205, 94], [120, 94]]],                  // the far wall, a dark doorway in it
    ['door', [[150, 66], [172, 66], [172, 94], [150, 94]]],
    ['wallL', [[0, 10], [122, 50], [122, 96], [0, 150]]],                       // the near-left wall, receding
    ['wallLtop', [[0, 10], [122, 50], [122, 56], [0, 26]]],
    ['wallR', [[W, 24], [203, 52], [203, 95], [W, 132]]],                      // the near-right building
    ['wallRtop', [[W, 24], [203, 52], [203, 58], [W, 40]]],
    ['crate', [[214, 82], [240, 82], [240, 108], [214, 108]]],                  // two crates on the right
    ['crate2', [[232, 92], [256, 92], [256, 116], [232, 116]]],
  ];
  const FILL: Record<string, string> = {
    sky: col('phone', 'cream', 0.25), sand: col('cream', 'phone', 0.3), wallFar: col('kraft', 'cream', 0.15), door: col('navy', 'ink', 0.2),
    wallL: col('kraft', 'navy', 0.15), wallLtop: col('kraft', 'cream', 0.3), wallR: col('kraft', 'navy', 0.3), wallRtop: col('kraft', 'cream', 0.2),
    crate: col('kraft', 'lamp', 0.25), crate2: col('kraft', 'navy', 0.1),
  };
  const shapes = SHAPES.map(([k, p]): [string, number[][]] => [FILL[k], k === 'sky' || k === 'sand' ? p : torn(p)]);
  const gun = torn([[318, 200], [236, 200], [214, 172], [196, 150], [205, 142], [226, 152], [262, 150], [292, 166], [318, 168]]);   // the receiver and barrel, aimed in
  const hand = torn([[250, 200], [238, 176], [256, 166], [282, 176], [290, 200]]);
  const star = (k0: number, k1: number) => Array.from({ length: 10 }, (_, i) => { const a = -2.4 + i * Math.PI / 5, k = i % 2 ? k0 : k1; return [200 + k * Math.cos(a), 146 + k * Math.sin(a)]; });
  const flash = star(14, 36), core = star(6, 16);   // at the barrel's tip
  const poly = (fill: string, pts: number[][], dx = 0, dy = 0) => {
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy))); g.closePath();
    g.fillStyle = fill; g.fill();
    g.strokeStyle = 'rgba(242,232,213,0.5)'; g.lineWidth = 1; g.stroke();   // the pale torn rim
  };
  const draw = (on: boolean) => {
    for (const [f, p] of shapes) poly(f, p);
    g.strokeStyle = col('navy', 'kraft', 0.3); g.lineWidth = 2;                // the crates' cross-braces
    for (const [x0, y0, s] of [[214, 82, 26], [232, 92, 24]]) { g.beginPath(); g.moveTo(x0 + 3, y0 + 3); g.lineTo(x0 + s - 3, y0 + s - 3); g.moveTo(x0 + s - 3, y0 + 3); g.lineTo(x0 + 3, y0 + s - 3); g.stroke(); }
    const [dx, dy] = on ? [6, 7] : [0, 0];                                     // the kick: back and down
    if (on) { poly(PALETTE.lamp, flash); poly(PALETTE.cream, core); }
    poly(col('navy', 'ink', 0.3), gun, dx, dy);
    poly(col('gator', 'navy', 0.15), hand, dx, dy);
    g.fillStyle = PALETTE.cream;                                               // the crosshair: four bars, a gap
    g.strokeStyle = PALETTE.navy; g.lineWidth = 2;
    for (const [x, y, w, h] of [[W / 2 - 20, H / 2 - 2.5, 14, 5], [W / 2 + 6, H / 2 - 2.5, 14, 5], [W / 2 - 2.5, H / 2 - 20, 5, 14], [W / 2 - 2.5, H / 2 + 6, 5, 14]]) { g.strokeRect(x, y, w, h); g.fillRect(x, y, w, h); }
  };
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  let state: boolean | null = null;
  const fire = (on: boolean) => { if (on === state) return; state = on; draw(on); texture.needsUpdate = true; };
  fire(false);
  return { texture, fire };
}
// The CS2 clip's bursts of fire, in the clip's own seconds (v7-laptop: its loudness envelope at 1/24 s, assets/raw/reels/cs2.mp3).
// cues.ts plays it from `inSec` at shot-local `from`; firing(t, from, inSec) is on during a burst, flashing on alternate 2s drawings.
const CS2_BURSTS = [[1.38, 1.82], [3.44, 4.70], [9.95, 10.72], [11.38, 12.0]];
export const firing = (t: number, from: number, inSec: number) => {
  const c = t - from + inSec, f = Math.floor(t * 12 + 1e-6);
  return t >= from && CS2_BURSTS.some(([a, b]) => c >= a && c < b) && f % 2 === 0;
};

// ---------- s02 ----------
const ID = 's02';
const BLOB_R = { start: 0.012 };                  // METER.birth (README §1); the bead and perch are mesh scales on it
const BEAD = 0.17, RUN = 0.36, PERCH = 0.4;   // mesh scales: the real-size planner is smaller than the spec's, so the run gathers less
const C = DESK.cal, [FX, FY] = C.friXY;
const BEAD_AT = FY - 0.0054;                      // on the circle's bottom line, under the words
const LIP_Y = C.y0 + 0.0005 + 0.012 * PERCH;        // the perched drop's centre: sitting on the curl
const LAND = [FX, 0, 0.008];                      // contact point under the lip
const HOP1 = [0.036, 0, 0.0115];
export const B = [0.030, 0, 0.015];                // s03's mark: S = screenZ / (screenZ − 0.015) = 3.0
// Cameras: W (the desk wide), I (face-on insert on Friday). Push W → I over 1.5–3.5, cut back to W at 7.083.
const CAM_W = { pos: [0.004, 0.062, 0.40], look: [0.004, 0.030, 0.012] };
const CAM_I = { pos: [FX, (FY + LIP_Y) / 2 + 0.001, 0.09], look: [FX, (FY + LIP_Y) / 2, 0] };
const SUN = { k: 0.35, pos: [0.8, 0.6, 0.6] as Vec3, scale: 0.8 };   // the morning window, off right
const FACE_I = 0.0045;                            // character fill (README §10)

const F = (n: number) => n / 12, frameOf = (t: number) => Math.floor(t * 12 + 1e-6);
// v4: the wall clock beside the calendar (README §13): 0.014 right of its right edge, 0.70 of its height up, in its plane. 9:00.
const CLOCK = { at: [C.x0 + C.w + 0.014, C.y0 + 0.70 * C.h, C.z] as Vec3, h: 9, m: 0 };
// v4 acting: numb, one small flinch as the blob arrives (9.33), numb again. act() needs 12 frames between changes, so the flinch
// holds 0.58 s and the second numb lands on the last drawing (9.92), not the spec's 9.67.
const ACT: [number, string][] = [[0, 'numb'], [9.33, 'flinch'], [9.92, 'numb']];

// The drop on its 2s grid. space 'page' (y on the calendar), 'fall' (k from lip to landing), 'desk' (contact x, z).
type ExamState = { s: number, squash: number, eyes: string, look?: number }
  & ({ space: 'page', y: number } | { space: 'fall', k: number } | { space: 'desk', x: number, z: number, lift: number });
export function examAt(t: number): ExamState | null {
  const f = frameOf(t), tc = F(f);
  if (f < 52) return null;                                                             // 4.33
  if (f < 60) return { space: 'page', y: BEAD_AT, s: BEAD * easeOut((tc - F(52)) / F(8)), squash: 0, eyes: 'closed' };
  if (f < 72) {                                                                        // 5.00 inkDropForms → the run
    const k = easeIn(tc - 5);
    return { space: 'page', y: lerp(BEAD_AT, LIP_Y, k), s: lerp(BEAD, RUN, k), squash: f < 62 ? 0.2 * (1 - (f - 60) / 2) : -0.3, eyes: 'closed' };
  }
  if (f < 85) {                                                                        // 6.00 perched on the lip
    const s = f < 74 ? lerp(RUN, PERCH, (f - 72) / 2) : PERCH;
    let squash = f < 74 ? 0.3 : 0.3 * spring(tc, 6.0), eyes = f < 74 ? 'closed' : 'open', look = 1;
    if (f >= 76 && f < 81) squash = -0.15;                                             // 6.33: stretches up at the words
    // v9: newborn and curious. It glances along the calendar (6.33), then the first slow blink: half down (6.42), shut
    // for two drawings, half up (6.67); then to him as v8 (6.75).
    if (f === 76) eyes = 'side';
    if (f >= 77 && f < 81) eyes = f === 77 || f === 80 ? 'sleepy' : 'closed';
    if (f >= 81) { eyes = 'side'; look = -1; squash = 0; }                             // 6.75: looks toward him
    if (f >= 84) squash = 0.2;                                                         // 7.00: lets go
    return { space: 'page', y: LIP_Y, s, squash, eyes, look };
  }
  if (f < 89) return { space: 'fall', k: easeIn((tc - F(85)) / F(4)), s: PERCH, squash: -0.35, eyes: 'open' };   // 7.083–7.42
  const land = { space: 'desk' as const, x: LAND[0], z: LAND[2], lift: 0, eyes: 'open', look: -1 };
  if (f < 93) return { ...land, s: PERCH, squash: f === 89 ? 0.6 : 0.6 * spring(tc, F(88)) };
  // v9: the second slow blink as it swells on the desk, looking at him (7.83–8.17)
  if (f < 99) return { ...land, s: kf(tc, [[F(93), PERCH], [F(97), 1.08], [F(99), 1]], easeOut), squash: 0, eyes: f === 94 || f === 97 ? 'sleepy' : f === 95 || f === 96 ? 'closed' : 'open' };   // 7.75–8.25
  // 8.25–9.83: two hops (0.79 s each): antic squash 0.25 (2 drawings), airborne on an 8 mm arc with stretch −0.15,
  // land squash 0.3, settle. Targets reached at 9.04 and 9.83.
  const hop = f < 109 ? 0 : 1, k = f - (hop ? 109 : 99), done = f >= 118;
  const [x0, , z0] = hop ? HOP1 : LAND, [x1, , z1] = hop ? B : HOP1;
  const p = done ? 1 : k < 2 ? 0 : Math.min(1, (k - 1) / 5);
  const squash = done ? 0 : k < 2 ? 0.25 : k < 6 ? -0.15 : k === 6 ? 0.3 : k === 7 ? -0.08 : 0.03;
  return { space: 'desk', x: lerp(x0, x1, p), z: lerp(z0, z1, p), lift: p > 0 && p < 1 ? 0.008 * Math.sin(Math.PI * p) : 0,
    s: 1, squash, eyes: 'open', look: -1 };
}

// v6-canvas-a: the word drips. The ink of "Calc 2 exam" runs out of the letters (DRIP, on 2s) and gathers into the bead
// as it swells (4.33–5.0), so the blob is visibly made of the exam's name; the square is left with a ghost of the words.
// An overlay on the square's tilted frame, in front of the red circle (the drips run over its line): each ink pixel of
// the painted letters is covered with the square's paper (GHOST of it left) when it leaves, and travels down to the
// bead, straight first and converging late, lower pixels first and columns staggered so the letters run in streaks.
const DRIP = [3.5, 5.0], GHOST = 0.18, RUNS = 0.55, K = 4;   // window (s), ghost alpha, one pixel's run (of the window), canvas px per art px
function wordDrip({ square, props }: { square: Cut, props: Kit }, PALETTE: Palette) {
  const bmp = props.pieces.calc_exam_square, [sw, sh] = props.sizes.calc_exam_square, [u0, v0, u1, v1] = props.visible.calc_exam_square;
  const bw = bmp.width, bh = bmp.height, m = square.mesh, px = m.scale.x * sw / bw, py = m.scale.y * sh / bh;
  const src = Object.assign(document.createElement('canvas'), { width: bw, height: bh }).getContext('2d')!;
  src.drawImage(bmp, 0, 0);
  const img = src.getImageData(0, 0, bw, bh).data;
  // The letters: dark pixels (their antialiased edges too, so no outline stays) inside the square's border (14% inset); the paper: the mean of the light ones there.
  const ink: { i: number, j: number, c: string, d?: number }[] = [], paper = [0, 0, 0, 0], r = mulberry32(seedOf(ID, 'drip')), cols = Array.from({ length: bw }, () => r());
  const [i0, i1, j0, j1] = [u0 + 0.14 * (u1 - u0), u1 - 0.14 * (u1 - u0), v0 + 0.14 * (v1 - v0), v1 - 0.14 * (v1 - v0)].map((u, k) => Math.round(u * (k < 2 ? bw : bh)));
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
    const o = 4 * (j * bw + i), lum = 0.3 * img[o] + 0.59 * img[o + 1] + 0.11 * img[o + 2];
    if (img[o + 3] < 128) continue;
    if (lum < 170) ink.push({ i, j, c: `rgb(${img[o]},${img[o + 1]},${img[o + 2]})` });
    else if (lum > 180) { paper[0] += img[o]; paper[1] += img[o + 1]; paper[2] += img[o + 2]; paper[3]++; }
  }
  const pap = `rgb(${paper.slice(0, 3).map((v) => Math.round(v / paper[3])).join(',')})`;
  // The overlay's box (inner-local m): the art's width, from its top down past the bead.
  const xL = m.position.x - m.scale.x * sw / 2, yT = m.position.y + m.scale.y * sh / 2, bead = [FX - square.g.position.x, BEAD_AT + 0.0006 - square.g.position.y];
  const yB = bead[1] - 0.0012, H = Math.ceil((yT - yB) / py);
  const c = Object.assign(document.createElement('canvas'), { width: bw * K, height: H * K }), g = c.getContext('2d')!;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(bw * px, H * py), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false }));
  plane.position.set(xL + bw * px / 2, yT - H * py / 2, 0.0005);   // in front of the circle (square + 0.0003)
  plane.receiveShadow = true;
  square.inner.add(plane);
  const bx = (bead[0] - xL) / px, by = (yT - bead[1]) / py, top = Math.min(...ink.map((q) => q.j)), bot = Math.max(...ink.map((q) => q.j));
  for (const q of ink) q.d = 0.3 * (bot - q.j) / Math.max(1, bot - top) + 0.15 * cols[q.i];   // lower pixels and staggered columns first
  let last = -1;
  return (t: number) => {
    const f = Math.floor(t * 12 + 1e-6), p = clamp((f / 12 - DRIP[0]) / (DRIP[1] - DRIP[0]));
    plane.visible = p > 0;
    if (!plane.visible || f === last) return;
    last = f;
    g.clearRect(0, 0, c.width, c.height);
    for (const q of ink) {                       // the hole each pixel leaves: paper, a ghost of the letter showing
      if (p <= q.d!) continue;
      g.fillStyle = pap; g.globalAlpha = 1 - GHOST; g.fillRect(q.i * K - 1, q.j * K - 1, K + 2, K + 2);
    }
    g.globalAlpha = 1;
    for (const q of ink) {                       // and the pixel on its way to the bead
      const k = clamp((p - q.d!) / RUNS);
      if (k <= 0 || k >= 1) continue;
      const x = lerp(q.i, bx, k ** 3), y = lerp(q.j, by, easeIn(k));
      g.fillStyle = q.c; g.fillRect(x * K - 1, y * K - K * 4 * k, K + 2, K * (1 + 4 * k));   // a streak, longer as it runs
    }
    tex.needsUpdate = true;
  };
}

export async function build(ctx: ShotCtx) {
  const { scene, camera, PALETTE, post } = ctx;
  scene.background = new THREE.Color(PALETTE.navy);
  const T = tools(ctx, ID);
  const room = await homeDesk(ctx, T, LAPTOP);
  const drip = wordDrip(room, PALETTE);
  const fx = post({ focus: 0.4, aperture: 0.01, lut: 'dawn' });
  const clock = await makeClock(ctx, { seed: 2 });
  clock.group.position.set(...CLOCK.at);
  scene.add(clock.group);

  const gator = await makeGator(ctx, { seed: 2 });
  gator.group.position.set(...DESK.hip);
  scene.add(gator.group);
  const SLUMP: [number, string][] = [[0, 'slump'], [10, 'slump']];

  // The Exam, its stain where it lands, and the faint trail it leaves down the calendar.
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 }), R = BLOB_R.start;
  scene.add(exam.mesh, exam.stain);
  exam.stain.position.set(LAND[0], 0.0003, LAND[2]);
  const trail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: PALETTE.ink,
    alphaMap: exam.stain.material.alphaMap, transparent: true, depthWrite: false }));
  scene.add(trail);
  const glint = new THREE.Mesh(new THREE.CircleGeometry(0.0003, 12), new THREE.MeshBasicMaterial({ color: PALETTE.cream }));
  scene.add(glint);

  // Key: the morning window, off right (dawnLight, k 0.35). Fill: ambient, plus a dim face fill for him.
  const sun = dawnLight();
  sun.light.target.position.set(0.01, 0.03, 0.01);
  Object.assign(sun.light.shadow.camera, { left: -0.15, right: 0.15, top: 0.15, bottom: -0.15 });
  sun.light.shadow.camera.updateProjectionMatrix();
  sun.update(0, SUN.k);
  sun.light.position.set(...SUN.pos);
  sun.light.intensity *= SUN.scale;
  const face = new THREE.PointLight(PALETTE.cream, FACE_I, 0.08, 2);
  face.position.set(-0.035, 0.035, 0.06);
  scene.add(sun.light, sun.light.target, ambient(), face);

  const onPage = (y: number, out: THREE.Vector3, s = 0) => { const k = (C.y0 + C.lip - (y - R * s)) / C.lip;   // clear of the curl under the drop's bottom
    return out.set(FX, y, C.z + 0.0015 + (k > 0 ? C.lipZ * Math.min(1, k) ** 2 : 0)); };
  const lip = onPage(LIP_Y, new THREE.Vector3(), PERCH);
  const c = new THREE.Vector3(), P = new THREE.Vector3(), L = new THREE.Vector3(), Pi = new THREE.Vector3(...CAM_I.pos), Li = new THREE.Vector3(...CAM_I.look);
  const place = (e: ExamState) => {
    if (e.space === 'page') onPage(e.y, c, e.s);
    else if (e.space === 'fall') c.set(lerp(lip.x, LAND[0], e.k), lerp(lip.y, R * e.s, e.k), lerp(lip.z, LAND[2], e.k));
    else c.set(e.x, e.lift + R * e.s, e.z);
    exam.mesh.position.set(c.x, c.y - R * e.s, c.z);
    exam.mesh.scale.setScalar(Math.max(1e-4, e.s));
    return c;
  };

  return {
    exam, gator,
    update(t: number) {
      T.boil(t);
      drip(t);
      clock.boil(t); clock.set(CLOCK.h, CLOCK.m, t);   // the second hand steps on every whole second of the shot
      // Camera on 1s: W, the push to I (calendarZoom 1.5–3.5), I held, cut to W on the let-go (7.083).
      const ins = t >= 3.5 && t < F(85), k = t < 1.5 ? 0 : t < 3.5 ? ease((t - 1.5) / 2) : ins ? 1 : 0;
      P.fromArray(CAM_W.pos).lerp(Pi, k); L.fromArray(CAM_W.look).lerp(Li, k);
      camera.position.copy(P); camera.lookAt(L);
      fx.set({ focus: k > 0 ? P.distanceTo(L) : kf(t, [[8.25, 0.395], [9.0, 0.385]], ease), aperture: k > 0 ? 0.004 : 0.01 });

      // The Student: slump; blinks at 1.00 and 3.92; eyes to the blob at 9.33, mouth tightens at 9.67.
      const f = frameOf(t);
      gator.boil(t, 10);
      gator.blend(POSES, SLUMP, t);
      gator.follow('tail', t, { k: 6, w: 18 });
      // act() adds the tail's idle sway and the breath; slump 0 because the pose already is the slump (chin on fist).
      const a = act(gator, t, ACT, { slump: 0, breath: 6, blink: false });
      if (f === 12 || f === 47) gator.face({ eyes: 'closed', mouth: a.mouth });

      const e = examAt(t);
      exam.mesh.visible = !!e;
      exam.stain.visible = f >= 89;
      exam.stain.scale.setScalar(f >= 99 ? 1 : clamp(e?.s ?? 0, 0.01, 1));
      const at = e ? place(e) : null;
      if (e) exam.update(t, { squash: e.squash, wobble: 1, eyes: e.eyes, look: e.look ?? 1, key: sun.light });

      // Trail from the bead down to the drop (or the lip), fading over 3 s from 5.0.
      const yEnd = f >= 72 ? LIP_Y + 0.002 : e?.space === 'page' && f >= 60 ? Math.max(e.y, LIP_Y + 0.002) : BEAD_AT;
      const len = BEAD_AT - yEnd;
      trail.visible = len > 0.0005 && t < 8;
      trail.scale.set(0.0012, len + 0.001, 1);
      trail.position.set(FX, (BEAD_AT + yEnd) / 2, C.z + 0.0011);
      trail.material.opacity = 0.4 * clamp(1 - (t - 5) / 3);

      // One-frame glint on the bead at 5.0 (the 24 fps frame on the beat).
      glint.visible = !!at && Math.round(t * 24) === 120;
      if (glint.visible) glint.position.set(at!.x - 0.0005, at!.y + 0.0006, at!.z + 0.0025);
    },
  };
}
