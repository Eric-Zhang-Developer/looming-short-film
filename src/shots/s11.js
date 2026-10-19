// s11 · Under the light: the desk (docs/shots/s11.md, v4). Act 4 opens: Marston is the reward now, not the bottom.
// The Marston hero desk unit (docs/shots/README.md §2) seen side-on: maple desk row with its grey privacy panel, the
// perforated cubicle panel at its end, the Y-back chair, the ribbon window with the night view, and the ring pendant over
// the desk, lit all shot: a plain constant spot in v4's warm (no sensor, no wake, no timeout). He walks in, sits
// (deskSit 0.5), lays out the page and the pen, and puts his phone face-down (2.5: s09a's choice, small and calm now).
// The 2.5× blob (Q16) climbs up from the floor (blobClimbs 3.0) and settles beside him at the Marston mark (blobSettles
// 5.0): big, a little nervous, and under light from above its shadow is a small pool. No laptop. Only the blob casts.
// Characters and handled props on 2s, light and camera on 1s, boil 10/s.
// s09b, s09c, s10, s13, s15, s16 and s17 import the shared kit helpers and the desk set from here.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { sensorLight, fluorescent, ambient } from '../lights.js';
import { kf, ease } from '../core/ease.js';
import { SHOTS } from '../timeline.js';
import { makeGator } from '../characters/gator.js';
import { POSES, specPose, walk } from '../characters/poses.js';
import { act } from '../characters/acting.js';
import { createBlob } from '../blob.js';

const ID = 's11', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;          // deskSit 0.5, blobClimbs 3, blobSettles 5
const dr = (n) => n / 12;
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;   // core onTwos can land on the previous drawing (float error)

// ---------- tunables ----------
const BLOB_R = { start: 0.030 };                       // 2.5×, the v4 peak (README §1, Q16): nothing grows or shrinks here
export const MARK = (r) => [1.15 * (r - 0.012), 0, 0.074];   // README §1 Marston mark: left edge stays on the page corner
// s15's BLOB_DX: at its close Camera B′ the 2.5× blob on the spec's mark touched his snout, so s15 sits it 16 mm right.
// s11 uses the same spot so the s11 → s13 → s15 cuts don't move it.
const BLOB_DX = 0.016, AT = [MARK(BLOB_R.start)[0] + BLOB_DX, 0, 0.074];
const HIP = [-0.075, -0.012, 0.074], FLOOR = -0.034;
const PHONE = /** @type {Vec3} */ ([-0.010, 0.0015, 0.114]), PAGE = [-0.0205, 0.0003, 0.095];
const CAM = [0.020, 0.033], CAM_Z = [[3.0, 0.668], [7.0, 0.628]];
const WARM = 0.3;                                      // v4 Marston warm: lerp(PALETTE.lamp, PALETTE.cream, 0.3) (README v4)
// Intensities, by eye on the sheet: s15's built exposure (the old lamp pool at the blob), its fill and ambient.
const ZONE_I = 0.8, FLUOR_I = 0.25, AMB_K = 0.6, FILL_I = 0.02;

// ---------- the Student ----------
const WALK_X = [-0.147, HIP[0]];                       // 0–0.5: three short steps in from frame left, to the chair
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
const P = {
  ...POSES,
  dip: seat({ lean: 6, arm: -60 }),                    // 0.417: the sit's anticipation drawing
  sit: seat({ lean: 0, arm: -40 }),                    // 0.5 deskSit
  pack_off: seat({ lean: -6, arm: -125, head: -4 }),   // 0.583–0.75: the backpack off and down behind the chair
  to_pack: seat({ lean: -4, arm: -120, head: -6 }),    // 1.0 / 1.5: back into it, for the sheet, then the pen
  lay: seat({ lean: 16, arm: -18, head: -6 }),         // 1.25 / 1.75: lays it on the desk
  pocket: seat({ lean: 2, arm: -80 }),                 // 2.0: the phone out of his pocket
  look_phone: seat({ lean: 6, arm: 12, head: -8 }),    // 2.17: holds it up, looks at it
  tip_phone: seat({ lean: 20, arm: -12, head: -6 }),   // 2.33–2.5: lays it down face-down at the rest spot
  hands_flat: seat({ lean: 6, arm: -30 }),             // 2.67: hands flat either side of the page (s15's settle)
  to_page: seat({ lean: 10, arm: -30 }),               // 6.25: leans 4° toward the page
};
const BODY = [
  [dr(5), 'dip'], [dr(6), 'sit'], [dr(7), 'pack_off'], [dr(9), 'pack_off'], [dr(10), 'sit'],
  [1.0, 'to_pack'], [dr(14), 'lay'], [dr(16), 'lay'], [1.5, 'to_pack'], [dr(20), 'to_pack'], [dr(21), 'lay'],
  [dr(23), 'lay'], [2.0, 'pocket'], [dr(26), 'look_phone'], [dr(27), 'look_phone'], [dr(28), 'tip_phone'], [2.5, 'tip_phone'],
  [dr(32), 'hands_flat'], [6.25 - dr(1), 'hands_flat'], [6.25, 'to_page'],
];
// The acting kit: resolve softening to neutral on the sit (its anticipation is the dip), quiet resolve at the page,
// neutral watching the blob, resolve back to the page. The first cue sits before 0 so the sit's change keeps its hold.
/** @type {[number, string][]} */
const CUES = [[-0.1, 'resolve'], [B.deskSit, 'neutral'], [B.blobClimbs, 'resolve'], [B.blobSettles, 'neutral'], [6.25, 'resolve']];
/** @type {[number, number, string][]} */
const LOOKS = [[2.0, 2.5, 'side'], [3.25, 5.0, 'side']];   // eyes down at the phone; down-right at the blob climbing

// ---------- the Exam: hops in at his heels, waits on the floor in front of the desk, climbs, settles ----------
// Contact point keys [t, x, y, z] on 2s (it hops: held between drawings). It trails him in at his heels, then hops past
// his knees to wait on the floor in front of the desk (z 0.145, just out of the desk top's shadow, where the camera sees
// it); at 2.5× it stands as tall as the desk top, looking up at it. Then up the apron and onto the mark.
const FLOOR_AT = [0.072, FLOOR, 0.145];
const PATH = [
  [0, -0.235, FLOOR, 0.145], [dr(2), -0.215, FLOOR, 0.145], [dr(4), -0.190, FLOOR, 0.145], [dr(6), -0.165, FLOOR, 0.145],
  [dr(7), -0.090, FLOOR, 0.145], [dr(8), -0.010, FLOOR, 0.145], [dr(9), ...FLOOR_AT], [3.0, ...FLOOR_AT],
  [dr(38), 0.066, -0.018, 0.124],                     // 3.17: lands clinging to the desk's front edge
  [3.5, 0.062, -0.010, 0.123],                        // 3.5: stretched up, holding on
  [dr(44), 0.056, 0, 0.114],                          // 3.67: pulls itself up onto the top
  [dr(46), 0.046, 0, 0.098],                          // 3.83
  [4.0, ...AT],
];
const hopping = (T) => T < dr(9) && Math.round(T * 12) % 2 === 1;   // the walk-in hops: up on every other drawing
const SQUASH = [[3.0 - dr(1), 0], [3.0, 0.3], [dr(38), -0.2], [3.5, -0.25], [dr(44), 0.2], [dr(46), 0], [4.0, 0.1], [dr(49), 0]];
const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));   // spring() in cosine phase

// ---------- shared: the kit helpers and the desk set (s09b, s09c, s10, s13, s15, s16, s17 import them) ----------
const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: Math.round(w), height: Math.round(h) });
export const crop = (img, x0, y0, x1, y1) => {   // a pixel box of a cut piece as its own canvas
  const c = canvas(x1 - x0, y1 - y0); c.getContext('2d').drawImage(img, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0); return c;
};
// metres per pixel of a loaded piece at the kit's scale-table size
export const mppOf = (a, name) => a.sizes[name][0] / a.pieces[name].width;
export const noCast = (g) => { g.traverse((o) => { o.castShadow = false; }); return g; };

// Idle life (v3-fix-marston), a pure function of t on the drawing's 2s: a breath is the body joint's y scale about the hip
// (the head rises under a millimetre), a tail sway is added to the pose's tail angle. Call it after blend() each frame.
export const idle = (rig, t, { breath = 0.012, period = 3.2, sway = 0.06, swayPeriod = 2.6, phase = 0 } = {}) => {
  const T = Math.floor(t * 12 + 1e-4) / 12;
  rig.joints.body.scale.y = 1 + breath * Math.sin(2 * Math.PI * (T / period + phase));
  if (rig.joints.tail) rig.joints.tail.rotation.z += sway * Math.sin(2 * Math.PI * (T / swayPeriod + phase));
};

// Paper bookkeeping: every sheet re-tears on the boil; a lit fixture's glow (emissiveMap) follows its map.
/** @typedef {{ translucency?: number, edgeCatch?: number }} PaperMat paperMesh's material options */
export function kitTools(ID) {
  const boiling = [];
  let last = null;
  /** @param {import('../paper.js').PaperOptions & { mat?: PaperMat }} opts @param {THREE.Object3D} parent */
  const sheet = (opts, parent) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }), opts.mat);
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  // A bitmap at mpp metres per pixel, in a holder whose origin is the bitmap pixel `anchor` (default: its centre).
  /**
   * @param {HTMLCanvasElement | ImageBitmap} img
   * @param {string} key
   * @param {{ mpp: number, sx?: number, sy?: number, anchor?: number[], weight?: string, res?: number, parent: THREE.Object3D, mat?: PaperMat }} o
   */
  const art = (img, key, { mpp, sx = 1, sy = 1, anchor = [img.width / 2, img.height / 2], weight, res = 512, parent, mat }) => {
    const holder = new THREE.Group(), w = img.width * mpp, h = img.height * mpp;
    const mesh = sheet({ art: img, size: [w, h], key: `${ID}-${key}`, weight, res, mat }, holder);
    mesh.position.set(w / 2 - anchor[0] * mpp, anchor[1] * mpp - h / 2, 0);
    holder.scale.set(sx, sy, 1); parent.add(holder); return holder;
  };
  const boil = (t, rate) => {
    const seed = boilSeed(t, rate);
    if (seed === last) return; last = seed;
    for (const { mesh, opts } of boiling) {
      updatePaperMesh(mesh, makePaper({ ...opts, seed }));
      if (mesh.material.emissiveMap) mesh.material.emissiveMap = mesh.material.map;
    }
  };
  return { sheet, art, boil };
}
// Only the blob casts (README v4): one light, one shadow. The exception is marstonDesk's flat desk top (local z 0.075,
// y 0): it's what a blob's pool lands on, and without it a light from above reaches through the desk and prints the
// blob's shadow again on the floor under it. Call it once after the scene is built; `casters` are the blobs' meshes.
export function castOnly(scene, casters) {
  scene.traverse((o) => { o.castShadow = o.isMesh && o.rotation.x < 0 && Math.abs(o.position.y) < 1e-9 && Math.abs(o.position.z - 0.075) < 1e-9; });
  for (const m of casters) m.castShadow = true;
}
export const glow = (holder) => {   // the painted face lights itself (a lit fixture), scaled by emissiveIntensity
  const m = holder.children[0].material; m.emissive.set(0xffffff); m.emissiveMap = m.map; return m;
};

// Navy wall from the kit's wall_strip: its painted navy tiled at the kit's scale, the cream baseboard along the bottom,
// and `holes` ([x0, y0, x1, y1] in wall metres from its bottom-left) cleared for windows. pxm: canvas pixels per metre.
/** @param {import('../assets.js').Kit} kit @param {number[]} WH [W, H] @param {number[][]} [holes] @param {number} [pxm] */
export function wallCanvas(kit, [W, H], holes = [], pxm = 1500) {
  const img = kit.pieces.wall_strip, k = mppOf(kit, 'wall_strip') * pxm, c = canvas(W * pxm, H * pxm), g = c.getContext('2d');
  const [x0, y0, x1, y1] = [8, 10, 373, 90], tw = (x1 - x0) * k, th = (y1 - y0) * k, base = 15 * k;
  for (let y = c.height - base; y > 0; y -= th) for (let x = 0; x < c.width; x += tw) g.drawImage(img, x0, y0, x1 - x0, y1 - y0, x, y - th, tw, th);
  g.drawImage(img, x0, 91, x1 - x0, 15, 0, c.height - base, c.width, base);
  for (const [a, b, e, f] of holes) g.clearRect(a * pxm, c.height - f * pxm, (e - a) * pxm, (f - b) * pxm);
  return c;
}
// Carpet: carpet_tile laid in a grid at the kit's scale, every other tile mirrored.
export function carpetCanvas(kit, [W, H], pxm = 1000) {
  const img = kit.pieces.carpet_tile, k = mppOf(kit, 'carpet_tile') * pxm, c = canvas(W * pxm, H * pxm), g = c.getContext('2d');
  const [x0, y0, x1, y1] = [5, 8, 259, 116], tw = (x1 - x0) * k, th = (y1 - y0) * k;
  for (let j = 0, y = 0; y < c.height; y += th, j++) for (let i = 0, x = 0; x < c.width; x += tw, i++) {
    const m = (i + j) % 2;
    g.save(); g.translate(x + (m ? tw : 0), y); g.scale(m ? -1 : 1, 1);
    g.drawImage(img, x0, y0, x1 - x0, y1 - y0, 0, 0, tw, th); g.restore();
  }
  return c;
}

// The Marston hero desk unit dressed with the kits (UNIT geometry kept: desk x −0.033…0.150, z 0.030…0.120, top y 0,
// floor y −0.034, window wall z 0, chair seat y −0.013 over x −0.092…−0.060). Returns the pendant switch.
const WIN = [0.066, 0.0779, 0.1322];                    // ribbon window: sill, pane bottom, pane top (y)
const VIEW_X = -0.087, VIEW_GLOW = 0.3;                 // the tower between the mullions at −0.115 and −0.058
export async function marstonDesk({ scene, assets, PALETTE, tools: { sheet, art }, ID }) {
  const C = (k) => new THREE.Color(PALETTE[k]), hex = (c) => '#' + c.getHexString();
  const [kit, ext] = await Promise.all([assets.load('marston_kit'), assets.load('marston_ext_kit')]);
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const flat = (m) => { m.rotation.x = -Math.PI / 2; return m; };

  // Window wall, x −0.7…0.7, y −0.034…0.36, with one ribbon of panes cut through it. Receives only.
  const WALL = [1.4, 0.394], bottom = -0.034;
  const wall = sheet({ art: wallCanvas(kit, WALL, [[0.02, WIN[1] - bottom, 1.38, WIN[2] - bottom]]), size: WALL, key: `${ID}-wall`, res: 2048 }, scene);
  wall.position.set(0, bottom + WALL[1] / 2, 0); wall.castShadow = false;
  // Ribbon window frames (the kit's 462 px wide piece, 0.344 m), end to end, every other one mirrored.
  const rw = kit.pieces.ribbon_window, rk = mppOf(kit, 'ribbon_window');
  [-0.516, -0.172, 0.172, 0.516].forEach((x, i) => {
    noCast(art(rw, 'ribbon_window', { mpp: rk, sx: i % 2 ? -1 : 1, anchor: [248.5, 111], parent: scene, mat: { edgeCatch: 0.15 } }))
      .position.set(x, WIN[0], 0.0008);   // edge catch down: on thin mullions the lit rim read as frost
  });
  // Behind the panes: a night sky plate, and the night view (oak, moss, lamps, Century Tower) as a far layer, scaled so
  // the tower's top and clock sit in the pane band (between two mullions), left of where the loom climbs. Lit only from
  // behind the wall, so it carries a faint glow of its own: the campus lamps it shows.
  const sky = sheet({ path: RECT, color: hex(C('navy').lerp(C('ink'), 0.45)), size: [1.4, 0.1], key: `${ID}-night_sky`, res: 256 }, scene);
  sky.position.set(0, 0.105, -0.05); sky.castShadow = false;
  const nk = (WIN[2] - WIN[1]) / 100;                   // night view rows 60…160 fill the pane band
  const view = noCast(art(ext.pieces.night_view, 'night_view', { mpp: nk, anchor: [226, 110], parent: scene, res: 1024 }));
  view.position.set(VIEW_X, (WIN[1] + WIN[2]) / 2, -0.04);
  glow(view).emissiveIntensity = VIEW_GLOW;

  // Carpet floor.
  const floor = flat(sheet({ art: carpetCanvas(kit, [0.9, 0.45]), size: [0.9, 0.45], key: `${ID}-carpet`, res: 1024 }, scene));
  floor.position.set(0, bottom, 0.225); floor.castShadow = false;

  // The desk row: its painted privacy panel and top band stand at the back edge (z 0.0305); its front edge and legs are
  // the apron at z 0.120 (legs stretched 1.25× to reach the unit's floor); a flat maple top between them.
  const dk = kit.pieces.desk_row_front, dm = 0.183 / 599;   // opaque x 10…609 → the unit's 0.183
  art(crop(dk, 0, 0, dk.width, 63), 'desk_panel', { mpp: dm, anchor: [10, 63], parent: scene, weight: 'kraft' }).position.set(-0.033, 0, 0.0305);
  art(crop(dk, 0, 63, dk.width, dk.height), 'desk_apron', { mpp: dm, sy: 0.034 / (89 * dm), anchor: [10, 0], parent: scene, weight: 'kraft', res: 1024 })
    .position.set(-0.033, 0, 0.120);
  flat(sheet({ path: RECT, color: '#d9b98a', weight: 'kraft', size: [0.183, 0.09], key: `${ID}-desk_top`, res: 512 }, scene))
    .position.set(0.0585, 0, 0.075);
  // Perforated cubicle panel at the desk's right end (the right side panel of cubicle_front). Set dressing: casts nothing.
  noCast(art(crop(kit.pieces.cubicle_front, 297, 9, 351, 218), 'cubicle_panel', { mpp: mppOf(kit, 'cubicle_front'), anchor: [0, 209], parent: scene }))
    .position.set(0.150, bottom, 0.076);
  // Y-back chair in profile, back to the left: seat top (row 143) at y −0.013, wheels (row 285) on the floor.
  art(kit.pieces.chair_side, 'chair_side', { mpp: 0.021 / (285 - 143), anchor: [104, 285], parent: scene }).position.set(-0.076, bottom, 0.071);

  // Ring pendant over the desk (his zone's fixture, at README §3's trough position): slab bottom (row 109) at y 0.125.
  // Lit and unlit art swap with the zone; the lit face glows. Casts nothing.
  const pk = mppOf(kit, 'ring_light_lit');
  const lit = noCast(art(kit.pieces.ring_light_lit, 'ring_lit', { mpp: pk, anchor: [164, 109], parent: scene }));
  const unlit = noCast(art(kit.pieces.ring_light_unlit, 'ring_unlit', { mpp: pk, anchor: [162, 108], parent: scene }));
  for (const p of [lit, unlit]) p.position.set(0, 0.125, 0.040);
  const litMat = glow(lit);
  const pendant = (level) => {
    lit.visible = level >= 0.5; unlit.visible = !lit.visible;
    litMat.emissiveIntensity = 0.55 * Math.min(1.15, level);
  };
  pendant(1);
  return { pendant, wall, kit, ext, viewMat: view.children[0].material };
}

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);

  const tools = kitTools(ID), { sheet, boil } = tools;
  const { pendant, wall } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  const [props, kitp] = await Promise.all([assets.load('study_props_sheet'), assets.load('props_kit')]);
  // An asset piece in a holder whose origin is the centre of its visible shape (s15's cut()).
  /** @param {import('../assets.js').Kit} a @param {string} name @param {{ weight?: string, res?: number, parent?: THREE.Object3D }} [o] */
  const cut = (a, name, { weight, res = 512, parent = scene } = {}) => {
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${name}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    holder.userData.vis = [w * (u1 - u0), h * (v1 - v0)];
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  scene.add(hero.group);
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });   // s15's blob
  scene.add(exam.mesh);

  // ---------- props ----------
  // The backpack: on his back for the walk-in (on the body joint), then on the floor behind the chair from 0.75.
  const pack = cut(props, 'backpack_side'), [pw, ph] = pack.userData.vis;
  pack.scale.set(0.035 / pw, 0.04 / ph, 1);
  const PACK_FLOOR = /** @type {Vec3} */ ([-0.145, FLOOR + 0.02, 0.028]);
  // The page (blank at this distance; s15's practice sheet), the capped pen, the phone with its two faces.
  const page = flat(cut(kitp, 'blank_page', { res: 1024 })); page.position.set(...PAGE);
  { const [w] = page.userData.vis; page.scale.setScalar(0.025 / w); }
  const pen = new THREE.Group(); scene.add(pen);
  { const p = flat(cut(kitp, 'pen', { parent: pen })); p.scale.x = -1; const c = flat(cut(kitp, 'pen_cap', { parent: pen })); c.scale.x = -1; c.position.set(0.006, 0.0003, 0); }
  const phone = new THREE.Group(); scene.add(phone);
  flat(cut(kitp, 'phone_face_up', { parent: phone })).position.y = 0.0004;
  { const back = cut(kitp, 'phone_face_down', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }

  castOnly(scene, [exam.mesh]);

  // ---------- light: the ring pendant, from above, constant ----------
  const warm = C('lamp').lerp(C('cream'), WARM);
  const zone = sensorLight({ at: [0, 0.127, 0.040], aimAt: [0, 0, 0.098], intensity: ZONE_I, angle: 0.8, penumbra: 0.5 });
  zone.light.color.copy(warm); zone.light.shadow.mapSize.set(2048, 2048);
  scene.add(zone.light, zone.light.target);
  pendant(1);
  const tubes = fluorescent({ intensity: FLUOR_I });   // the distant room light; flicker 0: its update() is never called
  tubes.light.castShadow = false; scene.add(tubes.light);
  const fill = new THREE.PointLight(warm, FILL_I, 0.07, 2);   // README §10: warm, before him just above eye line
  scene.add(fill);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  const fx = post({ focus: CAM_Z[0][1] - AT[2], aperture: 0.025, maxblur: 0.01, lut: 'amber' });
  const hand = new THREE.Vector3();

  function update(t) {
    const T = on2s(t);
    boil(t, 10);

    // Camera: locked to 3.0, then a 0.04 push-in on z only, eased (on 1s). Focus rides the blob.
    const cz = kf(t, CAM_Z, ease);
    camera.position.set(CAM[0], CAM[1], cz); camera.rotation.set(0, 0, 0);
    fx.set({ focus: cz - AT[2] });

    // The Student on 2s: three steps in, the sit, then seated on s15's hip.
    hero.boil(t, 10);
    const walking = T < dr(5);
    if (walking) {
      const w = walk(t, { set: 'side', step: 1 / 6 });
      hero.blend(POSES, w.keys, T);
      hero.group.position.set(WALK_X[0] + (WALK_X[1] - WALK_X[0]) * T / dr(5), FLOOR + w.hip, HIP[2]);
    } else {
      hero.blend(P, BODY, T + 1e-6);
      hero.group.position.set(HIP[0], HIP[1] - (T < dr(6) ? 0.002 : T >= 2.5 ? 0.001 : 0), HIP[2]);   // the dip; shoulders down 1 mm after the phone
    }
    const f = act(hero, t, CUES, { slump: 0, breath: T < B.deskSit ? 2.5 : T < 2.5 ? 5 : 6, seed: 11 });
    const look = LOOKS.find(([a, b]) => T >= a && T < b);
    if (look && f.eyes !== 'closed') hero.face({ eyes: look[2], mouth: f.mouth });
    hero.group.updateMatrixWorld(true);
    hero.hand.getWorldPosition(hand);
    fill.position.set(hero.group.position.x + 0.029, 0.040, 0.114);

    // The backpack: on his back until 0.583, in his hand for one drawing, on the floor from 0.75.
    if (T < dr(7)) { hero.joints.body.add(pack); pack.position.set(-0.026, 0.030, -0.001); pack.rotation.set(0, 0, 0); }
    else if (T < dr(9)) { scene.add(pack); pack.position.set(hand.x, hand.y - 0.012, 0.03); pack.rotation.set(0, 0, 0); }
    else { scene.add(pack); pack.position.set(...PACK_FLOOR); pack.rotation.set(0, 0, 0); }
    page.visible = T >= dr(15);   // 1.25: laid flat

    // The pen: lying on the page's front edge from 1.75 (in his hand the drawing before).
    pen.visible = T >= dr(20);
    if (T < dr(21)) pen.position.set(hand.x + 0.004, hand.y, 0.0868); else pen.position.set(-0.022, 0.0006, 0.106);

    // The phone: out at 2.0, held up at 2.17, on its edge at 2.417, face-down at the rest spot on 2.5.
    phone.visible = T >= 2.0;
    if (T < dr(29)) { phone.position.set(hand.x + 0.003, hand.y, 0.088); phone.rotation.set(T >= dr(26) ? 1.1 : 0.4, 0, -0.3); }
    else if (T < 2.5) { phone.position.set(PHONE[0], PHONE[1] + 0.004, PHONE[2]); phone.rotation.set(Math.PI / 2, 0, 0); }
    else { phone.position.set(...PHONE); phone.rotation.set(Math.PI, 0, 0); }

    // The Exam on 2s: hops in, waits looking up at the desk, climbs, fidgets, settles nervous; a swallow at 6.0.
    const [x, y, z] = kf(T, PATH.map(([k, ...v]) => [k, v]), (u) => (u >= 1 - 1e-9 ? 1 : 0));   // held: it pops pose to pose
    exam.mesh.position.set(x, y + (hopping(T) ? 0.006 : 0), z);
    const squash = kf(T, SQUASH, (u) => (u >= 1 - 1e-9 ? 1 : 0)) + kick(T, dr(51), 0.12) + kick(T, dr(56), 0.12) + (Math.abs(T - 6) < 1e-6 ? 0.1 : 0);
    const eyes = Math.abs(T - 6) < 1e-6 ? 'closed' : T >= B.blobSettles ? 'worried' : T < 3.0 ? 'side' : 'open';
    exam.update(t, { squash, wobble: kf(t, [[5.0, 1.4], [6.0, 1.0]]), eyes, look: T < 3.0 ? 1 : -1, key: zone.light });
    exam.mesh.rotation.z = T < 3.0 && T >= dr(9) ? -6 * D : 0;   // waiting on the floor, tipped back to look up at the desk
  }

  return { parts: { exam, hero, phone, wall, camera, light: zone.light }, update };
}
