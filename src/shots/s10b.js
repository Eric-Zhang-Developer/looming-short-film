// @ts-check
// s10b · The stacks (docs/shots/s10b.md, v6). v3's s10 walk (git 228d5b2^:src/shots/s10.js) brought back after the
// threshold, with its meaning flipped by the v4 rule. Same locked camera down a Marston stacks aisle, the same kit bays as
// wings and coffered ceiling strips as borders; he walks toward the lens with the 2.5× blob waddling behind his right side.
// v3 lit him from the phone, low, and threw the blob's shadow huge on the end wall. Now he looks at the phone once and
// slides it into the hoodie pocket (pocketPhone 1.0), and the light comes from above: one warm strip light per bay, each a
// downward spot, so as the blob passes under one its shadow is a small pool on the carpet just ahead of it (underLight1,
// underLight2). No faltering tubes. Face: resolve, then relief under the first light, then eyes open on a small smile.
// Characters on 2s, light and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { ambient } from '../lights.js';
import { kf, ease, onTwos, clamp } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { SHOTS } from '../timeline.js';
import { makeGator, HIP } from '../characters/gator.js';
import { POSES, walk } from '../characters/poses.js';
import { act } from '../characters/acting.js';
import { createBlob } from '../blob.js';
import { kitTools, mppOf, wallCanvas, carpetCanvas, noCast, glow, castOnly } from './s11.js';

const ID = 's10b';
const B = SHOTS.find((s) => s.id === ID).beats;          // pocketPhone 1, underLight1 2, underLight2 4.5
const BLOB_R = { start: 0.030 };                         // 2.5×, its size in s10 and s11 (README §1, Q16)
const STEP = 1 / 3, HOP = 2 / 3, HOP_H = 0.004;          // calmer than v3's 0.25: a footfall every 1/3 s; a hop per two steps
const V = 0.04, Z0 = 0.06;
const zG = (t) => Z0 + V * t;                            // his walk line toward the camera: z 0.06 → 0.30
const CAM = [0, 0.085, 0.95];
const BLOB = [-0.052, 0, -0.015];                        // behind his right side (screen left), v3's offset widened for 2.5×
const PHONE = [-0.040, 0.019, 0.035], POCKET = [-0.006, HIP + 0.012, 0.006];   // offsets from his root (the feet)
const WING_Z = [0.09, 0.19, 0.29, 0.39], AISLE = 0.09;   // wings at these depths, inner edge ±0.09
// One strip light per bay, 0.1 apart. On underLight1 and underLight2 the blob has just passed under tube 1 and tube 2
// (1.5 cm ahead of it): a light straight over a cutout casts a line, so the pool shows once the blob is ahead of the tube,
// laid forward on the carpet where the camera sees it, and grows to about 2 cm as he walks on.
const UNDER = (b) => zG(b) + BLOB[2] - 0.015;
const TUBE_Z = [UNDER(B.underLight1) - 0.1, UNDER(B.underLight1), UNDER(B.underLight2), UNDER(B.underLight2) + 0.1], HEADER_Y = 0.16;
const CEILING_K = 0.45, TUBE_GLOW = 0.75;                // coffers dimmed under the lit tubes; the tube's painted glow
const KEY_I = 0.2, SET_I = 1.0, AMB_K = 0.55, FILL_I = 0.006;   // by eye on the sheet

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (k) => new THREE.Color(PALETTE[k]);
  const WARM = col('lamp').lerp(col('cream'), 0.3);      // v4 Marston warm (s10, s11)
  scene.background = col('navy').lerp(col('ink'), 0.5);

  const tools = kitTools(ID), { sheet, art, boil } = tools;
  const kit = await assets.load('marston_kit');
  const flat = (m) => { m.rotation.x = -Math.PI / 2; return m; };

  // ---- z 0: the end wall, the kit's navy wall with its baseboard. The exit sign over the aisle end, faint.
  const wall = sheet({ art: wallCanvas(kit, [0.6, 0.35]), size: [0.6, 0.35], key: `${ID}-wall`, res: 2048 }, scene);
  wall.position.set(0, 0.175, 0);
  const exit = noCast(art(kit.pieces.exit_sign, 'exit_sign', { mpp: mppOf(kit, 'exit_sign'), parent: scene }));
  exit.position.set(-0.055, 0.138, 0.001); glow(exit).emissiveIntensity = 0.25;

  // ---- y = 0: carpet, the receiver for the pools.
  const floor = flat(sheet({ art: carpetCanvas(kit, [0.7, 1.0]), size: [0.7, 1.0], key: `${ID}-carpet`, res: 1024 }, scene));
  floor.position.set(0, 0, 0.5);

  // ---- Wings: bookshelf bays side by side outward from the aisle edge (v3), every other one mirrored, tints seeded.
  const bk = mppOf(kit, 'bookshelf_bay'), bayW = 226 * bk, rnd = mulberry32(seedOf(ID, 'bays'));
  WING_Z.forEach((z, w) => [-1, 1].forEach((side) => {
    for (let i = 0; i < 3; i++) {
      const flip = (w + i + (side > 0 ? 1 : 0)) % 2 ? -1 : 1;
      const bay = art(kit.pieces.bookshelf_bay, `bay-${w}-${side}-${i}`, { mpp: bk, sx: flip, anchor: [123, 286], parent: scene, weight: 'kraft' });
      bay.position.set(side * (AISLE + bayW * (i + 0.5)), 0, z + 0.0005 * i);
      (/** @type {any} */ (bay.children[0])).material.color.setScalar(0.85 + 0.15 * rnd());
    }
  }));

  // ---- Ceiling borders and the strip lights: one coffered strip across per tube, the painted tube under it, lit.
  const ck = mppOf(kit, 'ceiling_strip'), stripW = 417 * ck, sk = mppOf(kit, 'strip_light');
  TUBE_Z.forEach((z, n) => {
    for (let i = -1; i <= 1; i++) {
      const c = art(kit.pieces.ceiling_strip, `ceiling-${n}-${i}`, { mpp: ck, sx: i ? -1 : 1, anchor: [214.5, 106], parent: scene });
      c.position.set(i * stripW, HEADER_Y, z); (/** @type {any} */ (c.children[0])).material.color.setScalar(CEILING_K);
    }
    const strip = art(kit.pieces.strip_light, `strip-${n}`, { mpp: sk, anchor: [259, 62], parent: scene });
    strip.position.set(0, HEADER_Y - 0.006, z + 0.002);
    glow(strip).emissiveIntensity = TUBE_GLOW;
  });

  // ---- The Student, front view, root at the feet. His right side is screen left (−x).
  const gator = await makeGator({ assets }, { seed: 10, facing: 'front', res: 1024 });
  scene.add(gator.group);
  const eyes0 = gator.joints.eyes.position.y, mouth0 = gator.joints.mouth.position.y;
  const props = await assets.load('study_props_sheet');
  const prop = (name) => {
    const [w, h] = props.sizes[name], [u0, v0, u1, v1] = props.visible[name], g = new THREE.Group();
    const m = sheet({ art: props.pieces[name], size: [w, h], key: `${ID}-${name}`, res: 512 }, g);
    m.position.set(-((u0 + u1) / 2 - 0.5) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    return g;
  };
  { const pack = prop('backpack_front'); pack.position.set(-0.020, 0.048, -0.030); gator.joints.body.add(pack); }
  const phone = new THREE.Group();
  {
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0058), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
    screen.position.z = 0.0006;
    phone.add(prop('phone_face'), screen);
    scene.add(phone);
  }
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh);
  castOnly(scene, [exam.mesh]);   // only the blob casts (README v4): one shadow per tube, a pool

  // ---- Light. Key: one downward spot per strip light, warm, each casting the blob's pool on the carpet below it.
  const tubes = TUBE_Z.map((z) => {
    const s = new THREE.SpotLight(WARM, KEY_I, 0.5, 0.9, 0.6, 2);
    s.position.set(0, HEADER_Y - 0.008, z); s.target.position.set(0, 0, z + 0.04);   // leaning a little toward the lens, so the tube ahead of him lights his face
    s.castShadow = true; s.shadow.camera.near = 0.004; s.shadow.camera.far = 0.5; s.shadow.mapSize.set(1024, 1024); s.shadow.radius = 3; s.shadow.bias = -0.0004;
    scene.add(s, s.target);
    return s;
  });
  const set = new THREE.DirectionalLight(WARM, SET_I);   // the room's spill on the shelves, front and high (v3's tube angle)
  set.position.set(0, 1.5, 1.0); set.target.position.set(0, 0, 0.2); scene.add(set, set.target);
  const fill = new THREE.PointLight(PALETTE.phone, FILL_I, 0.06, 2);   // the phone's glow on his face, until it's pocketed
  scene.add(fill);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  const fx = post({ focus: CAM[2] - zG(0), aperture: 0.02, maxblur: 0.01, lut: 'amber' });
  const root = new THREE.Vector3(), P = new THREE.Vector3();
  // The phone on 2s, as an offset from his root: held low and looked at, a beat, then up and into the pocket by 0.917.
  const PH = [[0, PHONE], [0.5, PHONE], [0.75, [-0.022, 0.026, 0.020]], [0.917, POCKET]];
  // Face: resolve on the phone (from s10's close-up), relief on the first light (eyes closed, the slow breath), then eyes
  // open on relief's small smile for the rest of the walk.
  /** @type {[number, string][]} */
  const CUES = [[-0.1, 'resolve'], [B.underLight1, 'relief']];
  const OPEN = B.underLight1 + 1.0;

  return {
    parts: { exam, gator, phone, tubes, wall, zG },
    update(tLocal) {
      camera.position.set(...CAM);   // locked
      camera.rotation.set(0, 0, 0);
      fx.set({ focus: CAM[2] - zG(tLocal) });
      boil(tLocal, 10);

      // Characters on 2s.
      const T = onTwos(tLocal);
      gator.boil(tLocal, 10);
      const w = walk(tLocal, { set: 'front', step: STEP });
      gator.blend(POSES, w.keys, tLocal);
      root.set(0, w.lift, zG(T));
      gator.group.position.copy(root);
      const f = act(gator, tLocal, CUES, { seed: 101 });
      if (T >= OPEN) gator.face({ eyes: 'open', mouth: f.mouth });

      // The phone: arm_r points at it from its shoulder until the pocket, then hands back to the walk over 0.25 s.
      const off = kf(T, PH, ease);
      const held = T < B.pocketPhone;
      phone.visible = held;
      P.set(root.x + off[0], root.y + off[1], root.z + off[2]);
      phone.position.copy(P);
      phone.rotation.set(kf(T, [[0.5, -1.0], [0.917, 0]], ease), 0, 0);   // screen up to his face, then upright into the pocket
      const rb = gator.joints.body.rotation.z, sx = -0.0175, sy = HIP + 0.030;
      const vx = off[0] - (sx * Math.cos(rb) - sy * Math.sin(rb)), vy = off[1] - w.lift - (sx * Math.sin(rb) + sy * Math.cos(rb));
      const k = 1 - clamp((T - B.pocketPhone) / 0.25);
      gator.joints.arm_r.rotation.z += k * (Math.atan2(vx, -vy) - rb - gator.joints.arm_r.rotation.z);
      fill.position.copy(P); fill.intensity = held ? FILL_I : 0;
      // Head: the front turnaround has no head joint, so the face slides on the body: down at the phone, level after.
      const head = kf(T, [[0, -12], [0.5, -12], [0.583, 0]], ease);
      gator.joints.eyes.position.y = eyes0 + 0.00012 * head;
      gator.joints.mouth.position.y = mouth0 + 0.00012 * head;

      // The blob rides his root behind his right side, one hop per two of his steps, squashing on landing.
      const ph = (T % HOP) / HOP, land = ph < 1 / 8 + 1e-6;
      exam.mesh.position.set(root.x + BLOB[0], HOP_H * Math.sin(Math.PI * ph), root.z + BLOB[2]);
      const near = tubes.reduce((a, s) => (Math.abs(s.position.z - exam.mesh.position.z) < Math.abs(a.position.z - exam.mesh.position.z) ? s : a));
      exam.update(tLocal, { wobble: 0.8, squash: land ? 0.12 : 0, eyes: 'open', key: near });
    },
  };
}
