// s01 · Dawn skyline, push to the window (docs/shots/s01.md). Animatic blocking: proxies until art is frozen.
// No characters. What moves: the camera push (1s), the boil (10/s), the dawn warming (1s), the oak branch sway (2s).
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

// Proxy skyline: a rooftop line as a path (0..1, v down) with flat and pitched roofs, oak canopies and an optional
// clock tower [u, half-width]. Real skyline_sheet art replaces it.
function roofline(seed, { base, jitter, tower }) {
  const r = mulberry32(seed), pts = [[0, 1]];
  for (let x = 0; x < 1;) {
    const w = 0.025 + 0.05 * r(), top = base + jitter * (r() - 0.5);
    if (tower && x <= tower[0] && x + w > tower[0]) {
      const [tx, tw] = tower;
      pts.push([x, top], [tx - tw, top], [tx - tw, 0.14], [tx - tw * 0.5, 0.14], [tx, 0.02], [tx + tw * 0.5, 0.14], [tx + tw, 0.14], [tx + tw, top], [x + w, top]);
    } else if (r() < 0.35) {
      for (let i = 0; i <= 6; i++) pts.push([x + (w * i) / 6, top - 0.6 * jitter * Math.sin((Math.PI * i) / 6)]);
    } else {
      pts.push([x, top], r() < 0.5 ? [x + w / 2, top - 0.5 * jitter] : [x + w / 2, top], [x + w, top]);
    }
    x += w;
  }
  pts.push([1, 1]);
  return pts.map(([x, y]) => [Math.min(1, x), Math.max(0, y)]);
}

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
    ['sky-mid', hex('navy', 'cream', 0.45), 0.10, 0.52, 0.004],
    ['sky-low', hex('cream', 'lamp', 0.18), -0.05, 0.27, 0.008],
  ]) sheet(layer, { ...torn(1.8, y1 - y0), color, weight: 'tissue' }, { at: [0, (y0 + y1) / 2, z], parent: sky0, tilt: false }).castShadow = false;

  // ---- Far (z 0.12) and mid (z 0.30): skyline_sheet. Proxy rooflines until the sheet is frozen.
  const sky = await assets.load('skyline_sheet');
  const skyline = (piece, z, y0, y1, shape) => sheet(piece, sky.proxy
    ? { path: roofline(seedOf('s01', piece), shape), color: PALETTE.navy, size: [1.8, y1 - y0] }
    : { art: sky.pieces[piece], size: [1.8, y1 - y0] }, { at: [0, (y0 + y1) / 2, z] });
  // The far layer casts nothing: at this ~5° key its shadow would cover the whole mid layer's back, and the mid
  // layer's rim (spec acceptance) would go dark. Its shadow is never visible otherwise (it lands on unlit backs).
  skyline('skyline_far', 0.12, -0.05, 0.23, { base: 0.27, jitter: 0.12, tower: [(0.9 - 0.35) / 1.8, 0.014] }).castShadow = false;
  skyline('skyline_near', 0.30, -0.05, 0.15, { base: 0.3, jitter: 0.25 });

  // ---- Hero (z 0.60): apt_exterior with its window hole, and apt_window set in it, sharing the facade's tilt.
  const ext = await assets.load('apt_exterior');
  const art = ext.pieces.facade, { cv, size: facadeSize } = tornArt(art, [0.4, 0.5]), g = cv.getContext('2d');
  // The proxy comes in kraft; the spec wants the front near Night Navy, so the proxy is restocked navy (real art keeps its paint).
  if (ext.proxy) { g.globalCompositeOperation = 'source-in'; g.fillStyle = PALETTE.navy; g.fillRect(0, 0, cv.width, cv.height); g.globalCompositeOperation = 'source-over'; }
  const m = (cv.width - art.width) / 2;
  g.clearRect(m + 0.5 * art.width, m + 0.28 * art.height, 0.15 * art.width, 0.16 * art.height);  // hole 0.06 × 0.08 at (0.18, 0.32)
  const facade = new THREE.Group();
  facade.rotation.set(...tiltOf('facade'));
  facade.position.set(0.15, 0.25, FACADE_Z);
  scene.add(facade);
  sheet('facade', { art: cv, size: facadeSize }, { at: [0, 0, 0], parent: facade, tilt: false });
  // In facade space the window center is (0.03, 0.07). The pane runs a few mm past the hole so a torn hole edge never
  // shows a gap; the hole sets what is seen. It glows by translucency only (tissue, 0.8), never emissive.
  const win = (layer, opts, z, mat) => sheet(layer, opts, { at: [0.03, 0.07, z], parent: facade, tilt: false, ...mat });
  // Tissue passes light, so the pane casts nothing: its hard shadow would black out the hole's lit torn rim.
  win('window-pane', { path: RECT, color: PALETTE.cream, weight: 'tissue', size: [0.068, 0.088] }, -0.002, { translucency: 0.8 }).castShadow = false;
  // The mullions are scissor-cut strips: straight, since a torn 4 mm strip pinches through at this tear.
  win('window-mullion-v', { path: RECT, color: PALETTE.navy, size: [0.004, 0.088], res: 512 }, -0.001);
  win('window-mullion-h', { path: RECT, color: PALETTE.navy, size: [0.068, 0.004], res: 512 }, -0.001);

  // ---- Foreground (z 0.95): foliage_sheet oak_branch as a small puppet, branch plus tissue moss, so the moss lags.
  const fol = await assets.load('foliage_sheet'), limb = tornArt(fol.pieces.oak_branch, [0.4, 0.25]);
  const lm = PAD * 0.4;  // tornArt's margin in m, so the pivot stays on the limb's top-left corner
  const MOSS = [[0.06, -0.215, 0.09], [0.14, -0.19, 0.07], [0.22, -0.165, 0.085], [0.30, -0.14, 0.055]];  // [x, y, length] under the limb
  const STRAND = [[0.15, 0], [0.85, 0], [0.7, 0.35], [0.8, 0.6], [0.55, 1], [0.4, 0.7], [0.2, 0.45]];
  const oak = definePuppet({
    name: 's01-oak',
    parts: [
      { name: 'branch', pivot: [lm / limb.size[0], lm / limb.size[1]], at: [0, 0], z: 0,
        sheet: (s) => makePaper({ art: limb.cv, size: limb.size, key: 's01-oak_branch', seed: s }) },
      ...MOSS.map(([x, y, l], i) => ({
        name: `moss${i}`, pivot: [0.5, 0], parent: 'branch', at: [x, y], z: 0.004,
        sheet: (s) => makePaper({ path: STRAND, color: hex('navy', 'gator', 0.35), weight: 'tissue', size: [0.016, l], key: `s01-moss${i}`, seed: s }),
      })),
    ],
  });
  oak.group.position.set(-0.45, 0.8, 0.95);  // the top-left pivot of x −0.45..−0.05, y 0.55..0.80
  oak.group.rotation.set(...tiltOf('oak_branch'));
  scene.add(oak.group);
  // ±0.6° about the pivot, period 3 s: eased keys between the extremes trace a sine that starts at 0, rising.
  const SWAY = { l: { branch: -0.6 * DEG }, r: { branch: 0.6 * DEG } };
  const swayKeys = [-0.75, 0.75, 2.25, 3.75, 5.25, 6.75].map((t, i) => [t, i % 2 ? 'r' : 'l']);

  // ---- Key: dawn behind the skyline, about 5° up, so every cardstock layer is a backlit silhouette with a lit rim.
  // Fill: ambient() at its default.
  const dawn = dawnLight();
  dawn.light.target.position.set(0.15, 0.3, 0.6);
  Object.assign(dawn.light.shadow.camera, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: 0.1, far: 5 });
  dawn.light.shadow.camera.updateProjectionMatrix();
  scene.add(dawn.light, dawn.light.target, ambient());

  const fx = post({ focus: 1.9, lut: 'night' });
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
      MOSS.forEach((_, i) => oak.follow(`moss${i}`, tLocal, { k: 6, w: 18 }));
    },
  };
}
