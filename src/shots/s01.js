// s01 · Dawn skyline, push to the window (docs/shots/s01.md). v2: the apartment is built from home_kit (frames, door,
// glass) on a brick-kraft facade. v3: the skyline and oaks are marston_ext_kit's (century tower, facade block, stepped bay,
// oak canopy) instead of the random proxy rooflines; skyline_sheet and foliage_sheet were never painted.
// No characters. What moves: the camera push (1s), the boil (10/s), the dawn warming (1s), the oak canopy sway (2s).
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { dawnLight, ambient } from '../lights.js';
import { definePuppet } from '../puppet.js';
import { kf, ease } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';

const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
// A shape that fills its canvas has no edge to tear (paper.js tears where alpha ends), so a visible rectangle is
// inset by a margin of 4% of its long side: { path, size } with the size grown so the inset shape keeps [w, h].
const PAD = 0.04;
function torn(w, h) {
  const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}
// The same margin around a piece of art (proxies fill their canvas edge to edge): → { cv, size } for makePaper.
function tornArt(art, [w, h]) {
  const m = Math.round(PAD * Math.max(art.width, art.height));
  const cv = Object.assign(document.createElement('canvas'), { width: art.width + 2 * m, height: art.height + 2 * m });
  cv.getContext('2d').drawImage(art, m, m);
  return { cv, size: [w * cv.width / art.width, h * cv.height / art.height] };
}
const DEG = Math.PI / 180;
const CAM = { pos: [[0, [0, 0.42, 2.5]], [6, [0.17, 0.33, 1.0]]], look: [[0, [0, 0.42, 0]], [6, [0.18, 0.32, 0.6]]] };
const FACADE_Z = 0.6;
const ROOM_I = 0.05, BOUNCE_I = 0.35;   // his room light behind the pane (cd), the street bounce on the facade

export async function build({ scene, camera, assets, PALETTE, post }) {
  const hex = (a, b, k) => '#' + new THREE.Color(PALETTE[a]).lerp(new THREE.Color(PALETTE[b]), k).getHexString();
  const tiltOf = (layer) => { const r = mulberry32(seedOf('s01', layer)); return [(2 * r() - 1) * 1.5 * DEG, (2 * r() - 1) * 1.5 * DEG, 0]; };
  scene.background = new THREE.Color(PALETTE.navy);

  const boiling = [];  // [mesh, seed => PaperSheet], re-torn every boil step
  const sheet = (layer, opts, { at, parent = scene, tilt = true, ...mat } = {}) => {
    const make = (s) => makePaper({ ...opts, key: `s01-${layer}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    if (tilt) mesh.rotation.set(...tiltOf(layer));
    mesh.position.set(...at);
    parent.add(mesh); boiling.push([mesh, make]);
    return mesh;
  };

  // ---- Back (z 0): dawn_sky, three overlapping torn tissue bands, navy at the top to cream-amber at the horizon.
  // The key sits behind the sky, so the sky casts nothing: it would black out every layer in front of it.
  // The bands share one tilt: at 1.8 m wide a separate ±1.5° tilt each swings their edges ±24 mm, through the 4 mm gaps.
  const sky0 = new THREE.Group();
  sky0.rotation.set(...tiltOf('dawn_sky'));
  scene.add(sky0);
  for (const [layer, color, y0, y1, z] of [
    ['sky-navy', PALETTE.navy, 0.30, 0.95, 0],
    ['sky-mid', hex('navy', 'lamp', 0.42), 0.10, 0.52, 0.004],
    ['sky-low', hex('cream', 'lamp', 0.4), -0.05, 0.27, 0.008],
  ]) sheet(layer, { ...torn(1.8, y1 - y0), color, weight: 'tissue' }, { at: [0, (y0 + y1) / 2, z], parent: sky0, tilt: false }).castShadow = false;

  // ---- Far (z 0.12) and mid (z 0.30): marston_ext_kit. Far: a long brick block, the stepped bay and the century tower (the
  // one landmark). Mid: two oak canopies as the tree line. Backlit, so they read as silhouettes with a lit torn rim, and
  // the blocks' window holes show the sky. Each is placed by its visible width and the centre of its visible box.
  const ext = await assets.load('marston_ext_kit');
  const kitPiece = (kit, p, w, key, at, o = {}) => {
    const [sw, sh] = kit.sizes[p], [u0, v0, u1, v1] = kit.visible[p], k = w / (sw * (u1 - u0));
    const m = sheet(key, { art: kit.pieces[p], size: [sw * k, sh * k], weight: o.weight ?? 'cardstock' }, { at, parent: o.parent ?? scene, tilt: o.tilt ?? true, ...o.mat });
    m.position.x += (0.5 - (u0 + u1) / 2) * sw * k; m.position.y += ((v0 + v1) / 2 - 0.5) * sh * k;
    return m;
  };
  const FAR = [['facade_block', 0.95, -0.50], ['stepped_bay', 0.36, 0.52], ['century_tower', 0.07, -0.18]];   // [piece, visible width, centre x]
  for (const [p, w, x] of FAR) {
    const h = w * ext.sizes[p][1] * (ext.visible[p][3] - ext.visible[p][1]) / (ext.sizes[p][0] * (ext.visible[p][2] - ext.visible[p][0]));
    // The far layer casts nothing: at this ~5° key its shadow would cover the whole mid layer's back, and the mid
    // layer's rim (spec acceptance) would go dark. Its shadow is never visible otherwise (it lands on unlit backs).
    kitPiece(ext, p, w, `far_${p}`, [x, 0.0 + h / 2, p === 'century_tower' ? 0.125 : 0.12]).castShadow = false;
  }
  kitPiece(ext, 'oak_canopy', 0.62, 'near_oak_a', [-0.62, 0.17, 0.30]);
  kitPiece(ext, 'oak_canopy', 0.5, 'near_oak_b', [0.42, 0.16, 0.30]);

  // ---- Hero (z 0.60): the apartment, built from home_kit (G4: "the house is really ugly"). A three-storey brick-kraft
  // facade with cornice bands, a 3 × 3 grid of the kit's window frames (dark panes), the kit's door on the ground floor,
  // and his window, the one lit pane, through a hole in the facade. Facade space: origin at the facade's centre.
  const home = await assets.load('home_kit');
  const FW = 0.40, FH = 0.54, COLS = [-0.09, 0.03, 0.15], ROWS = [-0.13, 0.05, 0.20];   // window centres (facade space)
  const HERO = [0.03, 0.05], WIN = 0.075, HOLE = [0.054, 0.056];                         // hero = world (0.18, 0.32)
  const facade = new THREE.Group();
  facade.rotation.set(...tiltOf('facade'));
  facade.position.set(0.15, 0.27, FACADE_Z);
  scene.add(facade);
  const body = (() => {   // the stock, with the hero hole cut through it
    const W = 1024, H = Math.round(W * FH / FW), c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d');
    g.fillStyle = hex('kraft', 'navy', 0.5); g.fillRect(0, 0, W, H);
    g.strokeStyle = hex('kraft', 'navy', 0.62); g.lineWidth = 2;                           // faint brick courses
    for (let y = 0; y < H; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const px = (x) => (x / FW + 0.5) * W, py = (y) => (0.5 - y / FH) * H;
    g.clearRect(px(HERO[0] - HOLE[0] / 2), py(HERO[1] + HOLE[1] / 2), HOLE[0] / FW * W, HOLE[1] / FH * H);
    return tornArt(c, [FW, FH]);
  })();
  sheet('facade', { art: body.cv, size: body.size }, { at: [0, 0, 0], parent: facade, tilt: false });
  // Cornice and floor bands, cream-kraft strips proud of the wall; a flat roof edge in navy.
  for (const [i, y, h] of [[0, FH / 2 - 0.01, 0.02], [1, -0.04, 0.008], [2, 0.125, 0.008]])
    sheet(`band${i}`, { ...torn(FW + (i ? 0 : 0.02), h), color: hex('kraft', 'cream', 0.35) }, { at: [0, y, 0.004], parent: facade, tilt: false });
  // The kit's frames: navy panes behind the dark ones, the tissue glass behind his.
  const cutPiece = (p, w, key, at, o = {}) => {
    const [sw, sh] = home.sizes[p], [u0, v0, u1, v1] = home.visible[p], k = w / (sw * (u1 - u0));
    const m = sheet(key, { art: home.pieces[p], size: [sw * k, sh * k], weight: o.weight ?? 'cardstock' }, { at, parent: facade, tilt: false, ...o.mat });
    m.position.x += (0.5 - (u0 + u1) / 2) * sw * k; m.position.y += ((v0 + v1) / 2 - 0.5) * sh * k;
    return m;
  };
  ROWS.forEach((y, r) => COLS.forEach((x, c) => {
    const hero = x === HERO[0] && y === HERO[1];
    if (r === 0 && c === 0) return;   // the door's bay
    if (!hero) sheet(`pane${r}${c}`, { path: RECT, color: hex('navy', 'ink', 0.3), size: [WIN * 0.72, WIN * 0.66] }, { at: [x, y + 0.003, 0.001], parent: facade, tilt: false });
    cutPiece('window_frame', WIN, `frame${r}${c}`, [x, y, 0.003]);
  }));
  cutPiece('door', 0.05, 'door', [COLS[0], -FH / 2 + 0.04, 0.003]);
  // His pane: home_kit's glass, tissue, behind the hole. It glows by translucency (0.8), never emissive.
  cutPiece('window_glass', HOLE[0] + 0.006, 'apt_window', [HERO[0], HERO[1] + 0.003, -0.002], { weight: 'tissue', mat: { translucency: 0.8 } }).castShadow = false;

  // ---- Foreground (z 0.95): the kit's oak canopy hanging in from the top-left as a small puppet, a branch plus a
  // second, smaller sprig that lags it on a spring (secondary motion), so the moss doesn't move as one card.
  const limb = tornArt(ext.pieces.oak_canopy, [0.62, 0.62 * 212 / 652]);
  const lm = PAD * 0.62;  // tornArt's margin in m, so the pivot stays on the canopy's top-left corner
  const oak = definePuppet({
    name: 's01-oak',
    parts: [
      { name: 'branch', pivot: [lm / limb.size[0], lm / limb.size[1]], at: [0, 0], z: 0,
        sheet: (s) => makePaper({ art: limb.cv, size: limb.size, key: 's01-oak_canopy', seed: s }) },
      { name: 'sprig', pivot: [0.5, 0.05], parent: 'branch', at: [0.30, -0.10], z: 0.004,
        sheet: (s) => makePaper({ art: limb.cv, size: limb.size.map((v) => v * 0.5), key: 's01-oak_sprig', seed: s }) },
    ],
  });
  oak.group.position.set(-0.60, 0.80, 0.95);  // the top-left pivot of x −0.60..0.02, y 0.80 down to 0.64
  oak.group.rotation.set(...tiltOf('oak_branch'));
  scene.add(oak.group);
  // ±0.6° about the pivot, period 3 s: eased keys between the extremes trace a sine that starts at 0, rising.
  const SWAY = { l: { branch: -0.6 * DEG, sprig: 0 }, r: { branch: 0.6 * DEG, sprig: 0 } };
  const swayKeys = [-0.75, 0.75, 2.25, 3.75, 5.25, 6.75].map((t, i) => [t, i % 2 ? 'r' : 'l']);

  // ---- Key: dawn behind the skyline, about 5° up, so every cardstock layer is a backlit silhouette with a lit rim.
  // Fill: ambient() at its default.
  const dawn = dawnLight();
  dawn.light.target.position.set(0.15, 0.3, 0.6);
  Object.assign(dawn.light.shadow.camera, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: 0.1, far: 5 });
  dawn.light.shadow.camera.updateProjectionMatrix();
  scene.add(dawn.light, dawn.light.target, ambient());

  // His room's light is on behind the pane (he's up: s00's buzz), so the one window glows warm through the tissue.
  const room = new THREE.PointLight(PALETTE.lamp, ROOM_I, 0.25, 2);
  room.position.set(0.18, 0.32, FACADE_Z - 0.04);
  room.castShadow = false;
  // A faint warm bounce off the street onto the facade front, so the kit's frames and bands read (no shadow).
  const bounce = new THREE.DirectionalLight(PALETTE.lamp, BOUNCE_I);
  bounce.position.set(0.3, 0.2, 3);
  scene.add(room, bounce);

  const fx = post({ focus: 1.9, lut: 'dawn' });
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), dir = new THREE.Vector3();

  return {
    update(tLocal) {
      // Light on 1s. dawnLight places itself by k; the spec places it, so the position is set after update.
      dawn.update(tLocal, kf(tLocal, [[0, 0.1], [6, 0.25]]));
      dawn.light.position.set(-1.2, 0.5, -1.5);

      // Camera on 1s: one eased push, position and look-at together. Focus on the facade plane every frame.
      pos.fromArray(kf(tLocal, CAM.pos, ease)); look.fromArray(kf(tLocal, CAM.look, ease));
      camera.position.copy(pos); camera.lookAt(look);
      dir.subVectors(look, pos).normalize();
      fx.set({ focus: (pos.z - FACADE_Z) / -dir.z });

      // Paper on its boil (10/s); the branch on 2s.
      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));
      oak.boil(tLocal, 10);
      oak.blend(SWAY, swayKeys, tLocal);
      oak.follow('sprig', tLocal, { k: 6, w: 18, gain: 3 });
    },
  };
}
