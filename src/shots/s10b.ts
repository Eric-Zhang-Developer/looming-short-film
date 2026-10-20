// s10b · The stacks (docs/shots/s10b.md, v6). v3's s10 walk (git 228d5b2^:src/shots/s10.js) brought back after the
// threshold, with its meaning flipped by the v4 rule. Same locked camera down a Marston stacks aisle, the same kit bays as
// wings and coffered ceiling strips as borders; he walks toward the lens with the 2.5× blob waddling behind him. v6-stacks-2: the side rig turned 50° to us, so the snout reads.
// v3 lit him from the phone, low, and threw the blob's shadow huge on the end wall. Now he looks at the phone once and
// slides it into the hoodie pocket (pocketPhone 1.0), and the light comes from above: one warm strip light per bay, each a
// downward spot, so as the blob passes under one its shadow is a small pool on the carpet just ahead of it (underLight1,
// underLight2). No faltering tubes. Face: resolve, then relief under the first light, then eyes open on a small smile.
// Characters on 2s, light and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { ambient } from '../lights.ts';
import { kf, ease, onTwos, clamp } from '../core/ease.ts';
import { mulberry32, seedOf } from '../core/rng.ts';
import { SHOTS } from '../timeline.ts';
import { makeGator, hipHeight } from '../characters/gator.ts';
import { POSES, walk } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import { createBlob } from '../blob.ts';
import { kitTools, mppOf, wallCanvas, carpetCanvas, noCast, glow, castOnly } from './s11.ts';
import type { ShotCtx } from './s11.ts';
import type { PaperMesh } from '../material.ts';

const ID = 's10b';
const B = SHOTS.find((s) => s.id === ID)!.beats;          // pocketPhone 1, underLight1 2, underLight2 4.5
const BLOB_R = { start: 0.030 };                         // 2.5×, its size in s10 and s11 (README §1, Q16)
const STEP = 1 / 3, HOP = 2 / 3, HOP_H = 0.004;          // calmer than v3's 0.25: a footfall every 1/3 s; a hop per two steps
// v6-stacks-2: he comes on to z 0.45 (was 0.30), so his height on screen grows 0.89/0.50 ≈ 1.8× (was 1.37×), drifting
// 3 cm left to right across the aisle along the way he faces.
const V = 0.065, Z0 = 0.06, X0 = -0.03, VX = 0.01;
const zG = (t: number) => Z0 + V * t;                            // his walk line toward the camera: z 0.06 → 0.45
const xG = (t: number) => X0 + VX * t;
const D = Math.PI / 180;
const TURN_Y = -50;   // v6-stacks-2: the side rig turned 50° toward the lens (s10's fix for "front-on reads as a frog"): the snout shows
const CAM: Vec3 = [0, 0.125, 0.95], PITCH = -6;                // v6-stacks-2: 4 cm higher and tipped 6° down, so the pools open up
const BLOB = [-0.052, 0, -0.015];                        // behind him on screen left (he faces right), v3's offset widened for 2.5×
const WING_Z = [0.09, 0.19, 0.29, 0.39, 0.49], AISLE = 0.09;   // wings at these depths, inner edge ±0.09
// One strip light per bay. On underLight1 and underLight2 the blob has just passed under tube 1 and tube 2 (3 cm ahead
// of it; v6-stacks had 1.5, a sliver): a light straight over a cutout casts a line, so the pool shows once the blob is
// ahead of the tube, laid forward on the carpet where the camera sees it.
const UNDER = (b: number) => zG(b) + BLOB[2] - 0.03;
const TUBE_Z = [UNDER(B.underLight1) - 0.1, UNDER(B.underLight1), UNDER(B.underLight2), UNDER(B.underLight2) + 0.1], HEADER_Y = 0.16;
const CEILING_K = 0.45, TUBE_GLOW = 0.75;                // coffers dimmed under the lit tubes; the tube's painted glow
const KEY_I = 0.6, SET_I = 0.75, AMB_K = 0.4, FILL_I = 0.006;   // by eye on the sheet

export async function build({ scene, camera, assets, PALETTE, post }: ShotCtx) {
  const col = (k: keyof ShotCtx['PALETTE']) => new THREE.Color(PALETTE[k]);
  const WARM = col('lamp').lerp(col('cream'), 0.3);      // v4 Marston warm (s10, s11)
  scene.background = col('navy').lerp(col('ink'), 0.5);

  const tools = kitTools(ID), { sheet, art, boil } = tools;
  const kit = await assets.load('marston_kit');
  const flat = <T extends THREE.Object3D>(m: T): T => { m.rotation.x = -Math.PI / 2; return m; };

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
      (bay.children[0] as PaperMesh).material.color.setScalar(0.85 + 0.15 * rnd());
    }
  }));

  // ---- Ceiling borders and the strip lights: one coffered strip across per tube, the painted tube under it, lit.
  const ck = mppOf(kit, 'ceiling_strip'), stripW = 417 * ck, sk = mppOf(kit, 'strip_light');
  TUBE_Z.forEach((z, n) => {
    for (let i = -1; i <= 1; i++) {
      const c = art(kit.pieces.ceiling_strip, `ceiling-${n}-${i}`, { mpp: ck, sx: i ? -1 : 1, anchor: [214.5, 106], parent: scene });
      c.position.set(i * stripW, HEADER_Y, z); (c.children[0] as PaperMesh).material.color.setScalar(CEILING_K);
    }
    const strip = art(kit.pieces.strip_light, `strip-${n}`, { mpp: sk, anchor: [259, 62], parent: scene });
    strip.position.set(0, HEADER_Y - 0.006, z + 0.002);
    glow(strip).emissiveIntensity = TUBE_GLOW;
  });

  // ---- The Student, the side rig (root at the hip) turned TURN_Y toward the lens, facing screen right; the blob trails
  // him on screen left. v6-stacks used the front turnaround, which reads as a frog (no snout).
  const gator = await makeGator({ assets }, { seed: 10, res: 1024 });
  scene.add(gator.group);
  const props = await assets.load('study_props_sheet');
  const prop = (name: string) => {
    const [w, h] = props.sizes[name], [u0, v0, u1, v1] = props.visible[name], g = new THREE.Group();
    const m = sheet({ art: props.pieces[name], size: [w, h], key: `${ID}-${name}`, res: 512 }, g);
    m.position.set(-((u0 + u1) / 2 - 0.5) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    return g;
  };
  { const pk = (await assets.load('props_kit')).pieces.backpack, pack = art(pk, 'pack', { mpp: 0.034 / pk.height, sx: -1, parent: gator.joints.body });
    pack.position.set(-0.020, 0.026, -0.0045); }        // s09c's side backpack, hip space, behind the body plane
  const phone = new THREE.Group();
  {
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0058), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
    screen.position.z = 0.0006;
    phone.add(prop('phone_face'), screen);
    phone.scale.setScalar(0.8);
    gator.hand!.add(phone);                               // in his near hand
  }
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh);
  castOnly(scene, [exam.mesh]);   // only the blob casts (README v4): one shadow per tube, a pool

  // ---- Light. Key: one downward spot per strip light, warm, each casting the blob's pool on the carpet below it.
  const tubes = TUBE_Z.map((z) => {
    const s = new THREE.SpotLight(WARM, KEY_I, 0.3, 0.6, 0.6, 2);
    s.position.set(0, HEADER_Y - 0.008, z); s.target.position.set(0, 0, z + 0.04);   // leaning a little toward the lens, so the tube ahead of him lights his face
    s.castShadow = true; s.shadow.camera.near = 0.004; s.shadow.camera.far = 0.5; s.shadow.mapSize.set(1024, 1024); s.shadow.radius = 3; s.shadow.bias = -0.0004;
    scene.add(s, s.target);
    return s;
  });
  const set = new THREE.DirectionalLight(WARM, SET_I);   // the room's spill on the shelves, front and high (v3's tube angle)
  set.position.set(0, 0.45, 1.0); set.target.position.set(0, 0, 0.2); scene.add(set, set.target);
  const fill = new THREE.PointLight(PALETTE.phone, FILL_I, 0.06, 2);   // the phone's glow on his face, until it's pocketed
  scene.add(fill);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  const fx = post({ focus: CAM[2] - zG(0), aperture: 0.02, maxblur: 0.01, lut: 'amber' });
  const root = new THREE.Vector3(), P = new THREE.Vector3();
  // The near arm on 2s (absolute degrees, 0 = forward, −95 hanging): the phone held up before him and looked at, a beat,
  // then down to the hoodie pocket by 0.917; from pocketPhone the walk takes the arm back over 0.25 s.
  const ARM: [number, number][] = [[0, -35], [0.5, -35], [0.75, -60], [0.917, -88]];
  // Face: resolve on the phone (from s10's close-up), relief on the first light (eyes closed, the slow breath), then eyes
  // open on relief's small smile for the rest of the walk.
  const CUES: [number, string][] = [[-0.1, 'resolve'], [B.underLight1, 'relief']];
  const OPEN = B.underLight1 + 1.0;

  return {
    parts: { exam, gator, phone, tubes, wall, zG },
    update(tLocal: number) {
      camera.position.set(...CAM);   // locked
      camera.rotation.set(PITCH * D, 0, 0);
      fx.set({ focus: CAM[2] - zG(tLocal) });
      boil(tLocal, 10);

      // Characters on 2s.
      const T = onTwos(tLocal), j = gator.joints;
      gator.boil(tLocal, 10);
      const w = walk(tLocal, { set: 'side', step: STEP });
      gator.blend(POSES, w.keys, tLocal);
      const f = act(gator, tLocal, CUES, { seed: 101 });
      gator.face({ eyes: T >= OPEN ? 'open' : f.eyes, mouth: f.mouth });
      // The root's height from the final legs (after act's lean), so the lower foot stays on the carpet.
      root.set(xG(T), hipHeight({ body: j.body.rotation.z, leg_r: j.leg_r.rotation.z, leg_l: j.leg_l.rotation.z }), zG(T));
      gator.group.position.copy(root);
      gator.group.rotation.y = TURN_Y * D;

      // The phone: the near arm holds it up, then puts it in the pocket; it hands back to the walk over 0.25 s.
      const held = T < B.pocketPhone;
      phone.visible = held;
      const k = 1 - clamp((T - B.pocketPhone) / 0.25);
      j.arm_r.rotation.z += k * (kf(T, ARM, ease) * D - j.body.rotation.z - j.arm_r.rotation.z);
      phone.rotation.z = -(j.body.rotation.z + j.arm_r.rotation.z);   // upright in the hand, face to us
      phone.getWorldPosition(P);
      fill.position.copy(P); fill.intensity = held ? FILL_I : 0;
      // Head: down at the phone, level after.
      j.head.rotation.z += kf(T, [[0, -12], [0.5, -12], [0.583, 0]], ease) * D;

      // The blob rides his root behind him, one hop per two of his steps, squashing on landing.
      const ph = (T % HOP) / HOP, land = ph < 1 / 8 + 1e-6;
      exam.mesh.position.set(root.x + BLOB[0], HOP_H * Math.sin(Math.PI * ph), root.z + BLOB[2]);
      exam.update(tLocal, { wobble: 0.8, squash: land ? 0.12 : 0, eyes: 'open' });   // key: the tube that lights it most (v6-stacks-2: the cones are narrower now)
    },
  };
}
