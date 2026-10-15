// s12 · Quiet 1 (docs/shots/s12.md). The low point: fully locked camera, one held pose, the blob's shadow breathing.
// The Marston hero desk unit with s15's revised numbers (done/anim-s15.md): blob, phone and lamp aim come from UNIT.
// Only light, the edge boil (4/s) and the blob's breath move. Characters step on 2s; light at 24.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, ambient, aim } from '../lights.js';
import { kf, ease, onTwos } from '../core/ease.js';
import { makeGator } from '../characters/gator.js';
import { makeExam } from '../characters/exam.js';
import { POSES } from '../characters/poses.js';
import { UNIT } from './s15.js';

const ID = 's12', RATE = 4;
const CAM = [0.040, 0.038, 0.440];                       // looks straight down −Z, locked
const SCALE = 7.1;                                       // spec: the wall shadow, constant; s13's hero decal opens on the same number
const SPOT_I = 1.0, FILL_I = 0.009, AMB_K = 0.15;       // fill, set against the face/wall ratio (README §10)
const DIM = [[0, 1], [6, 1], [6.5, 0.6]];                // auto-dim, shared by the spot, the fill and the screen
const FILL_DIM = 0.6;                                    // fill 0.30 → 0.18 with the dim
const SAT = [[0, 1], [2, 0.55]];                         // gator saturation: ease(0–2), then hold

const visibleSize = (a, name) => { const [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name]; return [w * (u1 - u0), h * (v1 - v0)]; };

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  const V = (a) => new THREE.Vector3(...a);
  scene.background = C('navy').lerp(C('ink'), 0.5);

  const [furn, lampA, props] = await Promise.all(['marston_furniture_sheet', 'desk_lamp', 'study_props_sheet'].map((n) => assets.load(n)));
  const boiling = [];
  const sheet = (opts, parent = scene) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  const cut = (a, name, { weight, res = 512, parent = scene } = {}) => {   // holder origin = centre of the visible shape
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${name}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // ---------- set: the same as s11/s15, every position unchanged ----------
  const WALL = [1.3, 0.394], PX = 2048 / WALL[0], WINDOWS = [-0.51, -0.31, -0.11, 0.09, 0.29, 0.49];
  const wallArt = Object.assign(document.createElement('canvas'), { width: 2048, height: Math.round(WALL[1] * PX) });
  { const g = wallArt.getContext('2d'); g.fillStyle = PALETTE.navy; g.fillRect(0, 0, wallArt.width, wallArt.height);
    for (const cx of WINDOWS) g.clearRect((cx - 0.05 + 0.65) * PX, (0.36 - 0.300) * PX, 0.10 * PX, (0.300 - 0.066) * PX); }
  sheet({ art: wallArt, size: WALL, key: `${ID}-marston_window_wall`, res: 2048 }).position.set(0, (0.36 - 0.034) / 2, 0);
  const paneCol = '#' + C('navy').lerp(C('ink'), 0.35).getHexString();
  for (const cx of WINDOWS) {
    const m = sheet({ path: RECT, color: paneCol, weight: 'tissue', size: [0.11, 0.245], key: `${ID}-pane${cx}`, res: 256 });
    m.position.set(cx, 0.183, -0.001); m.castShadow = false;
  }
  flat(sheet({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [0.8, 0.45], key: `${ID}-marston_floor`, res: 512 }))
    .position.set(0, -0.034, 0.225);
  flat(cut(furn, 'desk_top', { weight: 'kraft', res: 1024 })).position.set(0.0585, 0, 0.075);
  cut(furn, 'desk_apron', { weight: 'kraft', res: 1024 }).position.set(0.0585, -0.017, 0.120);
  cut(furn, 'chair', { weight: 'kraft' }).position.set(-0.076, -0.034 + 0.025, 0.071);
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, 0.060);        // closed: he shut it across the cut
  cut(props, 'laptop_lid').position.set(-0.0075, 0.0045, 0.0601);

  const LZ = UNIT.lampZ;                                                  // unlit desk_lamp, s15's placement
  cut(lampA, 'base').position.set(-0.020, 0.002, LZ);
  cut(lampA, 'stem').position.set(-0.020, 0.035, LZ);
  cut(lampA, 'knob').position.set(...UNIT.knob, UNIT.knobZ);
  const arm = cut(lampA, 'arm'); arm.position.set(-0.008, 0.069, LZ); arm.rotation.z = Math.atan2(-0.002, 0.024);
  const shade = cut(lampA, 'shade', { weight: 'tissue' });
  const [sw, sh] = visibleSize(lampA, 'shade'), sk = 0.016 / sh;
  shade.rotation.z = Math.PI / 2; shade.scale.setScalar(sk);
  shade.position.set(UNIT.shadeMouth[0], UNIT.shadeMouth[1] + sw * sk / 2, LZ + 0.0005);
  // The phone spot lights the unlit shade's tissue to the brightest thing in the frame, which fights "the shadow owns the
  // frame". Pull it down to a dim paper shape (proxy tune; revisit with frozen art).
  shade.traverse((o) => { if (o.material) o.material.color.setScalar(0.04); });

  flat(cut(props, 'exam_page', { res: 1024 })).position.set(-0.0205, 0.0003, 0.095);   // blank
  const pen = new THREE.Group(); scene.add(pen);                          // capped, on the page's front edge
  cut(props, 'pen', { parent: pen }).position.x = -0.006;
  pen.position.set(-0.016, 0.0006, 0.106); pen.rotation.set(-Math.PI / 2, 0, 0);
  const cap = new THREE.Group(); scene.add(cap); cut(props, 'pen_cap', { parent: cap });
  cap.position.set(-0.018, 0.0006, 0.1062); cap.rotation.set(-Math.PI / 2, 0, 0);

  // phone: face up at s15's rest spot, screen glowing (glyph bars only)
  const phone = new THREE.Group(); phone.position.set(...UNIT.phone); scene.add(phone);
  flat(cut(props, 'phone_face', { parent: phone })).position.y = 0.0004;
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0064), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
  scene.add(hero.group);
  hero.blend(POSES, [[0, 'head_down']], 0); hero.face({ eyes: 'closed', mouth: 'neutral' });
  // desaturation: paper keeps its painting, so tint it with the multiplier that takes gator green to saturation s
  const g0 = C('gator'), L = 0.2126 * g0.r + 0.7152 * g0.g + 0.0722 * g0.b;
  const satTint = (s) => new THREE.Color(...[g0.r, g0.g, g0.b].map((v) => (L + s * (v - L)) / v));
  const skin = Object.entries(hero.meshes).filter(([n]) => n !== 'eyes' && n !== 'mouth').map(([, m]) => m);

  const exam = makeExam({ shot: ID, seed: 1 });
  exam.mesh.position.set(0, 0, UNIT.blob[2]); exam.stain.position.set(0, 0.0004, UNIT.blob[2]);
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  // Phone spot (README §4): at the phone's x/y, set back in z to give the spec's 7.1× with the blob at s15's z 0.0884
  // (s15's own 4.2× came from the phone's z 0.116; this camera sees the whole wall, so no need to give up the spec's scale).
  const BLOB_C = V(UNIT.blob);
  const spotZ = SCALE * BLOB_C.z / (SCALE - 1);
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 0.6, intensity: SPOT_I });
  spot.position.set(-0.010, 0.004, spotZ);
  scene.add(spot, spot.target);
  aim(spot, BLOB_C);
  const fill = new THREE.PointLight(PALETTE.phone, FILL_I, 0.07, 2);   // cyan on his closed eye and snout; throws nothing
  fill.castShadow = false; fill.position.set(-0.028, 0.032, 0.108); scene.add(fill);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  camera.position.set(...CAM); camera.lookAt(CAM[0], CAM[1], 0); camera.updateMatrixWorld(true);
  const fx = post({ focus: CAM[2] - BLOB_C.z, aperture: 0.03, maxblur: 0.012, lut: 'marston' });   // spec's act2b isn't in post.js; s13/s15 use marston

  let lastSeed = null;
  function update(t) {
    const seed = boilSeed(t, RATE), tc = onTwos(t);
    if (seed !== lastSeed) { lastSeed = seed; for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed })); }

    hero.boil(t, RATE);
    hero.blend(POSES, [[0, 'head_down']], tc + 1e-6);
    hero.face({ eyes: 'closed', mouth: 'neutral' });
    const tint = satTint(kf(t, SAT, ease));
    for (const m of skin) m.material.color.copy(tint);

    exam.update(t, { wobble: 0.5, eyes: 'open', key: spot });
    exam.mesh.scale.setScalar(1 + 0.06 * Math.sin(2 * Math.PI * tc / 5));   // Q1 (a): two slow breaths, peaks at 1.25 and 6.25

    const dim = kf(t, DIM, ease);
    spot.intensity = SPOT_I * dim;
    fill.intensity = FILL_I * (1 - (1 - FILL_DIM) * (1 - dim) / 0.4);
    screen.material.color.setScalar(0.6 + 0.4 * (dim - 0.6) / 0.4);
  }

  const probe = () => ({
    spot: spot.position.toArray(), wallScale: spotZ / (spotZ - BLOB_C.z), blob: exam.mesh.position.toArray(),
    head: hero.meshes.head.getWorldPosition(new THREE.Vector3()).toArray(),
    puppet: Object.fromEntries(Object.entries(hero.joints).map(([n, j]) => [n, [j.position.x, j.position.y, j.rotation.z]])),
    cam: camera.matrixWorld.toArray(),
  });
  return { update, probe };
}
