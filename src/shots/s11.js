// s11 · Laptop, then phone (docs/shots/s11.md, G4). v2 on the frozen Marston kits.
// The Marston hero desk unit (docs/shots/README.md §2) seen side-on: a maple desk row with its grey privacy panel, a
// perforated cubicle panel at its end, a Y-back chair, the ribbon window with the night view behind it, and the ring
// pendant over the desk. He opens the laptop (1.0), stares at it, then picks up the phone instead (3.6): the phone becomes
// the key and the blob's shadow springs up the window wall, while his zone times out (4.2–5.0). In the dark the blob
// gulps one last time (5.25): its peak. Characters and handled props on 2s, light and camera on 1s, boil 10/s.
// s10 and s12 import the shared kit helpers and the desk set from here.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, fluorescent, ambient, aim, sensorLevel } from '../lights.js';
import { kf, ease, clamp } from '../core/ease.js';
import { seedOf } from '../core/rng.js';
import { SHOTS } from '../timeline.js';
import { makeGator } from '../characters/gator.js';
import { specPose } from '../characters/poses.js';
import { createBlob } from '../blob.js';

const ID = 's11', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;          // laptopOpen 1, phoneWake 3.6, tableLightDies 4.2, gulp5 5.25
const dr = (n) => n / 12;
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;   // core onTwos can land on the previous drawing (float error)

// The meter (README §1): METER.gulp4 → METER.gulp5. exam.js has no METER export yet, so the numbers are written here.
const BLOB_R = { start: 0.024, gulp5: 0.030 };
export const MARK = (r) => [1.15 * (r - 0.012), 0, 0.074];   // README §1 Marston mark: left edge stays on the page corner
const HIP = [-0.075, -0.012, 0.074];                    // UNIT.hip, UNIT.bodyZ
const REST = [-0.010, 0.0015, 0.116];                   // UNIT.phone
const LIFT = [-0.012, 0.008, 0.124], SETTLE = [-0.014, 0.008, 0.118];   // spec: S 2.48 → 2.68 on the 0.074 mark
const LAPTOP_Z = 0.078;                                 // README §2: in front of the grown blob
const CAM = [0.020, 0.033], CAM_Z = [[2.6, 0.668], [6.0, 0.628]];
const HINGE = [0.015, 0.002], LID_LEN = 0.035;

// Intensities (cd for spots/points, lux for the directional), by eye on the key-moment sheet.
const FLUOR_I = 0.6, PHONE_I = 1.0, LAPTOP_I = 0.15, FILL_I = 0.3 * 0.03, AMB_K = 0.4, CHAR_FILL_I = 0.008;

// The Student in the s15 convention: [t, lean, arm, head]. Every key is a 2s drawing.
const seat = (lean, arm, head = 0) => specPose({ lean, arm, head, leg: 60, farLeg: 54 });
const BODY = [
  [0, 0, -30, 0], [dr(6), 0, -30, 0],                   // sit_upright, hand on the desk edge
  [dr(9), -4, -50, 0], [dr(10), -4, -50, 0],            // anticipation: leans back
  [dr(12), 23, -12, -3],                                // lid_reach: fingertip on the closed lid's front edge
  [dr(14), 28, 10, -3],                                 // lid_lift: edge at 20°, then the flick
  [dr(15), 18, 14, -3],                                 // follow-through of the flick
  [dr(18), 4, -30, -5], [dr(31), 4, -30, -5],           // sit_screen
  [dr(32), 4, -30, -8], [dr(35), 4, -30, -8],           // glance down at the phone
  [dr(37), -2, -50, -8],                                // anticipation: shoulders drop
  [dr(40), 30, -12, -10], [dr(41), 30, -12, -10],       // grip: fingertip on the phone's left end
  [dr(43), 23, -5, -10],                                // lift_phone
  [dr(53), 22, -6, -15], [6, 22, -6, -15],              // sit_phone_hunch
];
const LID = [[dr(12), 0], [dr(14), 20], [dr(16), 75], [dr(17), 96], [dr(18), 100]];   // degrees, swings on by itself
const PHONE = [[dr(41), REST], [dr(43), LIFT], [dr(53), SETTLE]];
const TILT = [[dr(41), [0, 0]], [dr(43), [0.5, 0.6]]];   // [toward camera, toward his face] rad: the lifted screen reads
const eyesAt = (T) => T < 2 ? 'open' : T < 2.6 ? 'tired' : T < 3.6 ? 'side' : T < 5 ? 'open' : 'tired';
const mouthAt = (T) => (T >= 2 && T < 3.6 ? 'line' : 'neutral');
// The gulp's settle: spring()'s damping in cosine phase, so the stretch peaks on the snap drawing.
const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));

// ---------- shared by s10, s11, s12 ----------
const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: Math.round(w), height: Math.round(h) });
export const crop = (img, x0, y0, x1, y1) => {   // a pixel box of a cut piece as its own canvas
  const c = canvas(x1 - x0, y1 - y0); c.getContext('2d').drawImage(img, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0); return c;
};
// metres per pixel of a loaded piece at the kit's scale-table size
export const mppOf = (a, name) => a.sizes[name][0] / a.pieces[name].width;
export const noCast = (g) => { g.traverse((o) => { o.castShadow = false; }); return g; };

// Paper bookkeeping: every sheet re-tears on the boil; a lit fixture's glow (emissiveMap) follows its map.
export function kitTools(ID) {
  const boiling = [];
  let last = null;
  const sheet = (opts, parent) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }), opts.mat);
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  // A bitmap at mpp metres per pixel, in a holder whose origin is the bitmap pixel `anchor` (default: its centre).
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
export const glow = (holder) => {   // the painted face lights itself (a lit fixture), scaled by emissiveIntensity
  const m = holder.children[0].material; m.emissive.set(0xffffff); m.emissiveMap = m.map; return m;
};

// Navy wall from the kit's wall_strip: its painted navy tiled at the kit's scale, the cream baseboard along the bottom,
// and `holes` ([x0, y0, x1, y1] in wall metres from its bottom-left) cleared for windows. pxm: canvas pixels per metre.
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
  const props = await assets.load('study_props_sheet');
  // An asset piece in a holder whose origin is the centre of its visible shape (s15's cut()).
  const cut = (a, name, { weight, res = 512, parent = scene, mat } = {}) => {
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${name}`, weight, res, mat }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    holder.userData.vis = [w * (u1 - u0), h * (v1 - v0)];
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };

  { // backpack, side view, on the floor behind the chair: 0.035 × 0.04 centred x −0.145, z 0.028
    const b = cut(props, 'backpack_side'), [vw, vh] = b.userData.vis;
    b.scale.set(0.035 / vw, 0.04 / vh, 1); b.position.set(-0.145, -0.034 + 0.02, 0.028);
  }
  // laptop, profile cutout at z 0.078: base x −0.030…0.015, lid 0.035 hinged at (0.015, 0.002), closed at the start.
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, LAPTOP_Z);
  const lid = new THREE.Group(); lid.position.set(HINGE[0], HINGE[1] + 0.0015, LAPTOP_Z + 0.0001); scene.add(lid);
  { const l = cut(props, 'laptop_lid', { parent: lid }); l.scale.x = LID_LEN / l.userData.vis[0]; l.position.x = -LID_LEN / 2; }
  // The screen: a glowing cream strip on the lid's inner face with scribble glyphs, never letters.
  const SCRL = Object.assign(document.createElement('canvas'), { width: 280, height: 24 });
  { const g = SCRL.getContext('2d'); g.fillStyle = PALETTE.cream; g.fillRect(0, 0, 280, 24);
    g.strokeStyle = PALETTE.navy; g.globalAlpha = 0.45; g.lineWidth = 3;
    for (const [x0, x1, y] of [[20, 120, 8], [140, 250, 8], [20, 200, 16], [215, 260, 16]]) {
      g.beginPath(); for (let x = x0; x <= x1; x += 6) g.lineTo(x, y + 2 * Math.sin(x * 0.7)); g.stroke(); } }
  const scrlTex = new THREE.CanvasTexture(SCRL); scrlTex.colorSpace = THREE.SRGBColorSpace;
  const lidScreen = new THREE.Mesh(new THREE.PlaneGeometry(LID_LEN - 0.002, 0.0026), new THREE.MeshBasicMaterial({ map: scrlTex }));
  lidScreen.position.set(-LID_LEN / 2, -0.0028, 0.0002); lid.add(lidScreen);

  // exam_page, blank, flat; the capped pen on its front edge.
  flat(cut(props, 'exam_page', { res: 1024 })).position.set(-0.0205, 0.0003, 0.095);
  flat(cut(props, 'pen')).position.set(-0.022, 0.0006, 0.106);
  flat(cut(props, 'pen_cap')).position.set(-0.018, 0.0009, 0.106);

  // phone: flat face-up at rest, dark. Glyph-bar screen (s15's), dimmed until 3.6. Nothing on it casts.
  const phone = new THREE.Group(); phone.rotation.order = 'ZYX'; scene.add(phone);
  flat(cut(props, 'phone_face', { parent: phone })).position.y = 0.0004;
  { const back = cut(props, 'phone_back', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004; }
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0064), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);
  noCast(phone);

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(...HIP);
  scene.add(hero.group);
  hero.meshes.arm_r.castShadow = false;   // its tip is at the phone, inside the cone: it would throw a wall-sized arm
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  const FL = C('cream').lerp(C('gator'), 0.15);   // the Marston fluorescent tone (README §6)
  // Key 0–3.6: his zone, one dim directional pointing down and tilted 15° toward camera, so the pool falls in front of
  // the blob (the smoke-paper finding). It times out with README §3's shared chatter (sensorLevel, s11's seed).
  const tube = fluorescent({ flickerSeed: seedOf(ID, 1), intensity: FLUOR_I });
  const M0 = MARK(BLOB_R.start);
  tube.light.color.copy(FL);
  tube.light.target.position.set(M0[0], 0, M0[2]);
  tube.light.position.set(M0[0], 1.5 * Math.cos(15 * D), M0[2] - 1.5 * Math.sin(15 * D));
  Object.assign(tube.light.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3 });
  scene.add(tube.light, tube.light.target);
  const zoneLevel = (t) => sensorLevel(t, { timeoutAt: B.tableLightDies });
  // Laptop screen 1.5–5.0: cream point at the lid centre, no shadow.
  const screenLight = new THREE.PointLight(PALETTE.cream, 0, 0.08, 2); scene.add(screenLight);
  // Key from 3.6: the phone spot (README §4), aimed phone → blob every frame.
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 0.6, intensity: 0 });
  scene.add(spot, spot.target);
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2); scene.add(fill);   // face fill from 3.6
  // Character fill (README §10): shadowless, fluorescent-toned, before him just above eye line; dies with the zone.
  const charFill = new THREE.PointLight(FL, 0, 0.07, 2); charFill.position.set(-0.046, 0.040, 0.114); scene.add(charFill);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  const fx = post({ focus: 0.668 - M0[2], aperture: 0.025, maxblur: 0.01, lut: 'marston' });
  const P = new THREE.Vector3(), BC = new THREE.Vector3(), lc = new THREE.Vector3();

  function update(t) {
    const T = on2s(t);
    boil(t, 10);

    // Camera: held to 2.6, then a 0.04 m push-in on z only, eased (on 1s). Focus rides the blob.
    const cz = kf(t, CAM_Z, ease);
    camera.position.set(CAM[0], CAM[1], cz);
    camera.rotation.set(0, 0, 0);
    fx.set({ focus: cz - M0[2] });

    // The Student on 2s.
    const [lean, arm, head] = kf(T, BODY.map(([k, ...v]) => [k, v]));
    hero.boil(t, 10);
    hero.blend({ now: seat(lean, arm, head) }, [[0, 'now']], 0);
    hero.face({ eyes: eyesAt(T), mouth: mouthAt(T) });

    // Laptop lid (on 2s) and its screen: on at 1.5, asleep at 5.0.
    lid.rotation.z = -kf(T, LID) * D;
    const lit = t >= 1.5 && t < 5.0;
    lidScreen.visible = t >= 1.5;
    lidScreen.material.color.setScalar(lit ? 1 : 0.06);
    lid.updateMatrixWorld(true);
    screenLight.position.copy(lid.localToWorld(lc.set(-LID_LEN / 2, -0.004, 0)));
    screenLight.intensity = lit ? LAPTOP_I : 0;

    // Phone (on 2s): rest, then lifted and tilted toward his face, then settling as he hunches.
    phone.position.fromArray(kf(T, PHONE));
    const [ax, az] = kf(T, TILT);
    phone.rotation.set(ax, 0, az);
    const awake = t >= B.phoneWake;
    screen.material.color.setScalar(awake ? 1 : 0.06);

    // The Exam (on 2s): perks up at the lid, wobbles when the phone light hits it, then gulp 5 (README §1): squash and
    // eyes closed on the drawing before the beat, the 2.5× snap on the beat with the contact sliding to the new mark.
    const g = B.gulp5, grown = T >= g - 1e-6, swallow = !grown && T >= g - dr(1) - 1e-6;
    const r = grown ? BLOB_R.gulp5 : BLOB_R.start, s = r / BLOB_R.start, M = MARK(r);
    const squash = swallow ? 0.3 : grown ? kick(T, g, -0.2) : kf(T, [[1.5, 0], [dr(19), 0.15], [dr(20), 0.15], [dr(21), -0.1], [2.0, -0.1], [dr(27), 0]]);
    const wobble = grown ? 0.8 : kf(T, [[3.6, 1], [dr(46), 1.6], [dr(55), 1]]);
    exam.mesh.scale.setScalar(s); exam.stain.scale.setScalar(s);
    exam.mesh.position.set(M[0], 0, M[2]); exam.stain.position.set(M[0], 0.0004, M[2]);
    BC.set(M[0], r, M[2]);

    // Light on 1s.
    const level = zoneLevel(t);
    pendant(level);
    tube.light.intensity = FLUOR_I * level;
    charFill.intensity = CHAR_FILL_I * level;
    P.copy(phone.position);
    spot.position.copy(P);
    spot.intensity = awake ? PHONE_I * clamp(0.5 + (t - B.phoneWake) * 12) : 0;   // 0 → 1 over 2 frames at 3.6
    aim(spot, BC);
    spot.shadow.camera.near = 0.004; spot.shadow.camera.updateProjectionMatrix();
    fill.position.copy(P);
    fill.intensity = awake ? FILL_I * spot.intensity / PHONE_I : 0;
    exam.update(t, { squash, wobble, eyes: swallow ? 'closed' : 'side', look: -1, key: awake ? spot : tube.light });
  }

  return { parts: { exam, spot, tube, hero, phone, wall, lid, camera }, update };
}
