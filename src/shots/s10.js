// s10 · The stacks (docs/shots/s10.md, G4). v2 on the frozen Marston kit.
// He walks down a stacks aisle toward the locked camera, phone low in his right hand; the 2× blob waddles on the carpet
// behind his right side. The aisle is the kit's bookshelf bays as wings, coffered ceiling strips as borders with strip
// lights under them, and the navy end wall. The phone is the key: it throws the blob's shadow on the end wall, and the
// shadow grows as he nears the lens. Tubes 1 and 2 falter as the blob passes under them. Characters on 2s, light and
// camera on 1s, boil 10/s.
import * as THREE from 'three';
import { ambient, aim, phoneLight, fluorescent } from '../lights.js';
import { kf, ease, onTwos } from '../core/ease.js';
import { hash2, mulberry32, seedOf } from '../core/rng.js';
import { SHOTS } from '../timeline.js';
import { makeGator, HIP } from '../characters/gator.js';
import { POSES, walk } from '../characters/poses.js';
import { createBlob } from '../blob.js';
import { kitTools, mppOf, wallCanvas, carpetCanvas, noCast, glow } from './s11.js';

const ID = 's10';
const B = SHOTS.find((s) => s.id === ID).beats;          // stacksEnter 0, stacksFlicker1 0.4, stacksFlicker2 3.4
const BLOB_R = { start: 0.024 };                         // METER.gulp4, 2× (README §1)
const STEP = 0.25, HOP = 0.5, HOP_H = 0.004;             // a footfall every 0.25 s; the blob hops every 0.5 s, 4 mm
const zG = (t) => 0.08 + 0.04 * t;                       // the gator's walk line, toward the camera
const CAM = [0, 0.085, 0.95];
const PHONE = [-0.040, 0.019, 0.035], BLOB = [-0.045, 0, -0.025];   // offsets from his root (the feet): spec, G4
const WING_Z = [0.06, 0.18, 0.30, 0.42], AISLE = 0.09;   // wings stand at these depths, inner edge ±0.09
const TUBE_Z = [0.08, 0.20, 0.32], HEADER_Y = 0.16;
const WINDOW = [[B.stacksFlicker1, B.stacksFlicker1 + 0.6], [B.stacksFlicker2, B.stacksFlicker2 + 0.6], null];
const CEILING_K = 0.3;                   // the cream coffers under the tubes: dimmed so the ceiling doesn't outshine the loom
const TUBE_I = 0.7;                      // intensity at envelope 1.0; the envelope is 0.5 / 0.18 (spec), so 0.35 / 0.126
const TUBE_GLOW = 0.9;                   // the strip light's painted tube at envelope 0.5
const SPOT_REF = 0.25, WALL_REF = 0.12;  // phone cd that lights the navy end wall 12 cm away to a readable level
const FILL_I = 0.012;                    // face fill cd at the phone; its 6 cm reach, d² clamps at 10 cm, so ×100 on him

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (k) => new THREE.Color(PALETTE[k]);
  const FL = col('cream').lerp(col('gator'), 0.15);   // the Marston fluorescent tone (README §6)
  scene.background = col('navy').multiplyScalar(0.5);

  const tools = kitTools(ID), { sheet, art, boil } = tools;
  const kit = await assets.load('marston_kit');
  const flat = (m) => { m.rotation.x = -Math.PI / 2; return m; };

  // ---- z 0: the end wall, the kit's navy wall with its baseboard, floor to y 0.35. It only receives.
  const wall = sheet({ art: wallCanvas(kit, [0.6, 0.35]), size: [0.6, 0.35], key: `${ID}-wall`, res: 2048 }, scene);
  wall.position.set(0, 0.175, 0); wall.castShadow = false;
  // the exit sign over the aisle end (glyph and arrow, no letters), glowing faintly
  const exit = noCast(art(kit.pieces.exit_sign, 'exit_sign', { mpp: mppOf(kit, 'exit_sign'), parent: scene }));
  exit.position.set(-0.055, 0.138, 0.001); glow(exit).emissiveIntensity = 0.25;

  // ---- y = 0: carpet, x ±0.35, z 0 → 1.0.
  const floor = flat(sheet({ art: carpetCanvas(kit, [0.7, 1.0]), size: [0.7, 1.0], key: `${ID}-carpet`, res: 1024 }, scene));
  floor.position.set(0, 0, 0.5); floor.castShadow = false;

  // ---- Wings: at each depth, bookshelf bays side by side outward from the aisle edge, at the kit's scale (2.1 m tall).
  // Never the same twice in a row: every other bay is mirrored and each takes a slightly different tint (seeded).
  const bk = mppOf(kit, 'bookshelf_bay'), bayW = 226 * bk, rnd = mulberry32(seedOf(ID, 'bays'));
  WING_Z.forEach((z, w) => [-1, 1].forEach((side) => {
    for (let i = 0; i < 3; i++) {
      const flip = (w + i + (side > 0 ? 1 : 0)) % 2 ? -1 : 1;
      const bay = noCast(art(kit.pieces.bookshelf_bay, `bay-${w}-${side}-${i}`, { mpp: bk, sx: flip, anchor: [123, 286], parent: scene, weight: 'kraft' }));
      bay.position.set(side * (AISLE + bayW * (i + 0.5)), 0, z + 0.0005 * i);
      bay.children[0].material.color.setScalar(0.85 + 0.15 * rnd());
    }
  }));

  // ---- Ceiling borders: the coffered ceiling strip, three across, bottom at y 0.16; a strip light under each, its
  // painted tube glowing with that tube's envelope.
  const ck = mppOf(kit, 'ceiling_strip'), stripW = 417 * ck, sk = mppOf(kit, 'strip_light');
  const tubeMat = TUBE_Z.map((z, n) => {
    for (let i = -1; i <= 1; i++) {
      const c = noCast(art(kit.pieces.ceiling_strip, `ceiling-${n}-${i}`, { mpp: ck, sx: i ? -1 : 1, anchor: [214.5, 106], parent: scene }));
      c.position.set(i * stripW, HEADER_Y, z); c.children[0].material.color.setScalar(CEILING_K);
    }
    const strip = noCast(art(kit.pieces.strip_light, `strip-${n}`, { mpp: sk, anchor: [259, 62], parent: scene }));
    strip.position.set(0, HEADER_Y - 0.006, z + 0.002);
    return glow(strip);
  });

  // ---- The Student, front view, root at the feet. His right side is screen left (−x).
  const gator = await makeGator({ assets }, { seed: 10, facing: 'front', res: 1024 });
  scene.add(gator.group);
  gator.meshes.arm_r.castShadow = false;   // its tip is at the phone, inside the cone: it would throw a wall-sized shadow
  const eyes0 = gator.joints.eyes.position.y, mouth0 = gator.joints.mouth.position.y;
  const props = await assets.load('study_props_sheet');
  const prop = (name) => {
    const [w, h] = props.sizes[name], [u0, v0, u1, v1] = props.visible[name], g = new THREE.Group();
    const m = sheet({ art: props.pieces[name], size: [w, h], key: `${ID}-${name}`, res: 512 }, g);
    m.castShadow = false;
    m.position.set(-((u0 + u1) / 2 - 0.5) * w, ((v0 + v1) / 2 - 0.5) * h, 0);   // centre the visible shape on the origin
    return g;
  };
  {  // backpack_front hangs behind him, poking out on his right. Not casting: inside the cone it throws a 9× rectangle.
    const pack = prop('backpack_front');
    pack.position.set(-0.020, 0.048, -0.030);
    gator.joints.body.add(pack);
  }
  // The phone: a card tilted screen-up toward his face, with a cyan screen, at the spec's hand offset each frame.
  const phone = new THREE.Group();
  {
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0058), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
    screen.position.z = 0.0006;
    phone.add(prop('phone_face'), screen);
    phone.rotation.x = -1.0;
    scene.add(phone);
  }

  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh);

  // ---- Light. Key: the phone's shadow spot, aimed phone → blob. angle 0.7 (40°, spec): the blob's half-angle is about
  // 30°, his body 56–63° off the axis, so he casts nothing into it.
  const spot = phoneLight({ angle: 0.7, penumbra: 0.3, distance: 0.6 });
  scene.add(spot, spot.target);
  const fill = new THREE.PointLight(PALETTE.phone, FILL_I, 0.06, 2);   // face fill (doc 03 rule 3, same source)
  scene.add(fill);
  // Set light: one dim directional per tube, the flicker seeded on/off per 24 fps frame inside each window.
  const tubes = TUBE_Z.map((z, n) => {
    const f = fluorescent({ flickerSeed: seedOf(ID, n + 1) });
    f.light.color.copy(FL);
    f.light.shadow.mapSize.set(1024, 1024);
    f.light.position.set(0, 1.5, z + 0.8);
    f.light.target.position.set(0, 0, z);
    scene.add(f.light, f.light.target);
    return { ...f, seed: seedOf(ID, 'tube', n + 1) };
  });
  const envelope = (n, t) => {
    const w = WINDOW[n];
    if (!w || t < w[0]) return 0.5;
    if (t >= w[1]) return n === 2 ? 0.5 : 0.18;
    return t - w[0] < 1 / 24 || hash2(tubes[n].seed % 65536, Math.floor(t * 24)) < 0.5 ? 0 : 0.5;   // chatter: starts dark
  };
  const amb = ambient();
  amb.intensity *= 0.5;
  scene.add(amb);

  const fx = post({ focus: CAM[2] - zG(0), aperture: 0.02, maxblur: 0.01, lut: 'night' });
  const root = new THREE.Vector3(), P = new THREE.Vector3(), Cn = new THREE.Vector3();

  return {
    parts: { exam, spot, gator, phone, fill, tubes, wall, zG },
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
      // The phone sits at the spec's hand offset; arm_r points at it from its shoulder (body sways ±3° about the feet).
      const rb = gator.joints.body.rotation.z, sx = -0.0175, sy = HIP + 0.030;
      const vx = PHONE[0] - (sx * Math.cos(rb) - sy * Math.sin(rb)), vy = PHONE[1] - w.lift - (sx * Math.sin(rb) + sy * Math.cos(rb));
      gator.joints.arm_r.rotation.z = Math.atan2(vx, -vy) - rb;
      // Head: the front turnaround has no head joint, so the face slides on the body (−12° down, +6° up).
      const head = kf(T, [[0, -12], [3.25, -12], [3.333, -15], [3.417, 6], [4.0, 6], [4.167, -12]], ease);
      gator.joints.eyes.position.y = eyes0 + 0.00012 * head;
      gator.joints.mouth.position.y = mouth0 + 0.00012 * head;
      gator.face({ eyes: T >= 3.4 && T < 4.0 ? 'open' : 'tired', mouth: 'line' });

      // Phone and blob ride his root. The blob hops on the carpet, one hop per two of his steps, squashing on landing.
      P.set(root.x + PHONE[0], root.y + PHONE[1], root.z + PHONE[2]);
      phone.position.copy(P);
      const ph = (T % HOP) / HOP, land = ph < 1 / 6 + 1e-6;
      exam.mesh.position.set(root.x + BLOB[0], HOP_H * Math.sin(Math.PI * ph), root.z + BLOB[2]);
      Cn.copy(exam.mesh.position).setY(exam.mesh.position.y + BLOB_R.start);
      exam.update(tLocal, { wobble: 1, squash: land ? 0.15 : 0, eyes: T >= 2.5 && T < 2.58 ? 'closed' : 'open', key: spot });

      spot.position.copy(P);
      spot.intensity = SPOT_REF * (P.z / WALL_REF) ** 2;   // the wall gets farther as he walks; hold its brightness
      aim(spot, Cn);
      fill.position.copy(P);

      tubes.forEach(({ light }, n) => {
        const e = envelope(n, tLocal);
        light.intensity = TUBE_I * e;
        tubeMat[n].emissiveIntensity = TUBE_GLOW * (0.15 + 0.85 * e / 0.5);
      });
    },
  };
}
