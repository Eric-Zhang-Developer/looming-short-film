// s10 · The stacks (docs/shots/s10.md). Animatic blocking: proxies until art is frozen.
// He walks down a stacks aisle toward the locked camera, phone low in his right hand, the blob clinging to his
// backpack. The phone is the key: it throws the blob's shadow on the end wall, and the shadow grows as he nears the lens.
// Fluorescent tubes 1 and 2 falter as the blob passes under them. Characters on 2s, light and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { ambient, aim, phoneLight, fluorescent } from '../lights.js';
import { kf, ease, onTwos } from '../core/ease.js';
import { hash2, mulberry32, seedOf } from '../core/rng.js';
import { makeGator, greenVariant, HIP } from '../characters/gator.js';
import { POSES, walk } from '../characters/poses.js';
import { makeExam } from '../characters/exam.js';

const PAD = 0.04;   // a shape that fills its canvas has no edge to tear, so procedural art sits inside a 4% margin
const inset = (pts, w, h) => {
  const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m;
  return { path: pts.map(([u, v]) => [(m + u * w) / W, (m + v * h) / H]), size: [W, H] };
};
const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
const STEP = 0.25;                                   // a footfall every 0.25 s (spec)
const zG = (t) => 0.08 + 0.04 * t;                   // the gator's walk line, toward the camera
const CAM = [0, 0.085, 0.95];
const PHONE = [-0.050, 0.045, 0.005], BLOB = [-0.045, 0.050, -0.025];   // offsets from his root (the feet), spec
const TUBE_Z = [0.08, 0.20, 0.32], WINDOW = [[0.4, 1.0], [3.4, 4.0], null];
const SPOT_REF = 0.25, WALL_REF = 0.12;   // phone cd that lights a Night Navy wall 12 cm away to a readable level (s03's 0.04 is for cream)
const FILL_I = 0.012;                    // face fill cd at the phone; its 6 cm reach, d² clamps at 10 cm, so ×100 on him

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (k) => new THREE.Color(PALETTE[k]);
  const hex = (c) => '#' + c.getHexString();
  const FL = col('cream').lerp(col('gator'), 0.15);   // the Marston fluorescent tone (README §6)
  scene.background = col('navy').multiplyScalar(0.5);

  const boiling = [];  // [mesh, seed => PaperSheet]
  const sheet = (key, opts, at, mat) => {
    const make = (s) => makePaper({ ...opts, key: `s10-${key}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    mesh.position.set(...at);
    scene.add(mesh); boiling.push([mesh, make]);
    return mesh;
  };
  const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });

  // ---- z 0: marston_wall, plain Night Navy, 0.60 × 0.35 centred (0, 0.15). It only receives.
  const wall = sheet('wall', { ...inset(RECT, 0.60, 0.35), color: PALETTE.navy, res: 2048 }, [0, 0.15, 0]);
  wall.castShadow = false;

  // ---- y = 0: marston_floor, navy-grey with a faint scribbled tile grid, x ±0.35, z 0 → 1.0.
  {
    const K = 1000, w = 0.70, h = 1.0, m = Math.round(PAD * h * K), cv = canvas(w * K + 2 * m, h * K + 2 * m), g = cv.getContext('2d');
    g.fillStyle = hex(col('navy').lerp(col('cream'), 0.16));
    g.fillRect(m, m, w * K, h * K);
    const r = mulberry32(seedOf('s10', 'floor'));
    g.strokeStyle = hex(col('navy').lerp(col('cream'), 0.05)); g.lineWidth = 3;
    for (let i = 1; i < 7; i++) { g.beginPath(); g.moveTo(m + i * 100 + 4 * r(), m); for (let y = 0; y <= 1000; y += 100) g.lineTo(m + i * 100 + 5 * (r() - 0.5), m + y); g.stroke(); }
    for (let j = 1; j < 10; j++) { g.beginPath(); g.moveTo(m, m + j * 100); for (let x = 0; x <= 700; x += 100) g.lineTo(m + x, m + j * 100 + 5 * (r() - 0.5)); g.stroke(); }
    const floor = sheet('floor', { art: cv, size: [cv.width / K, cv.height / K], res: 1024 }, [0, 0, 0.5]);
    floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  }

  // ---- Wings: 8 shelf faces at z 0.06 / 0.18 / 0.30 / 0.42, one each side, inner edge ±0.09, outer ±0.35, 0.26 × 0.16.
  // Proxy art is a plain kraft rectangle, so each flat gets its own seeded shelf drawing: blank-colour spines, a few
  // scribble strokes, no letters. Real crops (shelf_1…4) are mirrored on alternate rows so no two match.
  const stacks = await assets.load('marston_stacks');
  const BOOKS = [hex(col('navy')), hex(col('ink')), hex(col('cream').lerp(col('kraft'), 0.3)), hex(col('kraft').lerp(col('navy'), 0.35)),
    greenVariant(1), greenVariant(5), hex(col('navy').lerp(col('cream'), 0.3)), hex(col('lamp').lerp(col('navy'), 0.55))];
  const wing = (i) => {
    const side = i % 2 ? 1 : -1, z = [0.06, 0.18, 0.30, 0.42][i >> 1], x = side * 0.22;
    let mesh;
    if (stacks.proxy) {
      const K = 2000, w = 0.26, h = 0.16, m = Math.round(PAD * w * K), cv = canvas(w * K + 2 * m, h * K + 2 * m), g = cv.getContext('2d');
      const r = mulberry32(seedOf('s10', 'wing', i));
      g.fillStyle = hex(col('kraft').lerp(col('navy'), 0.45)); g.fillRect(m, m, w * K, h * K);
      const row = h * K / 4;
      for (let s = 0; s < 4; s++) {
        let bx = m + 4;
        while (bx < m + w * K - 20) {
          const bw = 22 + 40 * r(), bh = row * (0.6 + 0.32 * r()), y = m + (s + 1) * row - 10 - bh;
          g.fillStyle = BOOKS[Math.floor(r() * BOOKS.length)]; g.fillRect(bx, y, bw, bh);
          if (r() < 0.4) {
            g.strokeStyle = hex(col('cream')); g.globalAlpha = 0.45; g.lineWidth = 3;
            for (let k = 0; k < 2; k++) { const yy = y + bh * (0.25 + 0.3 * k + 0.1 * r()); g.beginPath(); g.moveTo(bx + 5, yy); g.lineTo(bx + bw - 5 - 6 * r(), yy + 3 * (r() - 0.5)); g.stroke(); }
            g.globalAlpha = 1;
          }
          bx += bw + 2 + 3 * r();
        }
        g.fillStyle = hex(col('kraft')); g.fillRect(m, m + (s + 1) * row - 10, w * K, 10);   // the shelf board
      }
      mesh = sheet(`wing-${i}`, { art: cv, size: [cv.width / K, cv.height / K], weight: 'kraft', res: 512 }, [x, 0.08, z]);
    } else {
      // Real crop: stretch its visible box to 0.26 × 0.16, mirrored on alternate rows.
      const piece = `shelf_${(i * 3) % 4 + 1}`, [w, h] = stacks.sizes[piece], [u0, v0, u1, v1] = stacks.visible[piece];
      const kx = 0.26 / (w * (u1 - u0)), ky = 0.16 / (h * (v1 - v0)), flip = (i >> 1) & 1, uc = flip ? 1 - (u0 + u1) / 2 : (u0 + u1) / 2;
      mesh = sheet(`wing-${i}`, { art: stacks.pieces[piece], size: [w, h], weight: 'kraft', res: 512 },
        [x - (uc - 0.5) * w * kx, 0.08 + ((v0 + v1) / 2 - 0.5) * h * ky, z]);
      mesh.scale.set(flip ? -kx : kx, ky, 1);
    }
    mesh.castShadow = false;   // set dressing: only the characters shade the phone's wall (README §5, one shadow at a time)
  };
  for (let i = 0; i < 8; i++) wing(i);

  // ---- Ceiling headers across the aisle (0.70 × 0.08, y 0.16–0.24), each with a fluorescent tube along its bottom edge.
  const tubeMat = TUBE_Z.map(() => new THREE.MeshBasicMaterial({ color: FL }));
  TUBE_Z.forEach((z, n) => {
    sheet(`header-${n}`, { ...inset(RECT, 0.70, 0.08), color: hex(col('navy').lerp(col('cream'), 0.12)) }, [0, 0.20, z]).castShadow = false;
    const tube = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.008), tubeMat[n]);   // a vellum strip, glowing
    tube.position.set(0, 0.163, z + 0.001);
    scene.add(tube);
  });

  // ---- The Student, front view, root at the feet. His right side is screen left (−x).
  const gator = await makeGator({ assets }, { seed: 10, facing: 'front', res: 1024 });
  scene.add(gator.group);
  gator.meshes.arm_r.castShadow = false;   // its tip is 3 mm from the phone, inside the cone: it would throw a wall-sized shadow
  const eyes0 = gator.joints.eyes.position.y, mouth0 = gator.joints.mouth.position.y;
  const props = await assets.load('study_props_sheet');
  const prop = (name) => {
    const make = (s) => makePaper({ art: props.pieces[name], size: props.sizes[name], key: `s10-${name}`, res: 512, seed: s });
    const m = paperMesh(make(0)), [w, h] = props.sizes[name], [u0, v0, u1, v1] = props.visible[name];
    m.castShadow = false;
    boiling.push([m, make]);
    m.position.set(-((u0 + u1) / 2 - 0.5) * w, ((v0 + v1) / 2 - 0.5) * h, 0);   // centre the visible shape on the origin
    return m;
  };
  {  // backpack_front hangs behind him, poking out on his right, with the blob beside it at the pocket
    const pack = new THREE.Group(), m = prop('backpack_front');
    // Behind the blob (z −0.025), or it hides the blob's inner eye. Not casting: at this depth it sits in the cone's core
    // and would throw a 9× rectangle across the aisle beside the blob's shadow (spec: the backpack's shadow is a faint edge).
    m.castShadow = false;
    pack.add(m); pack.position.set(-0.020, 0.048, -0.030);
    gator.joints.body.add(pack);
  }
  // The phone: a card tilted screen-up toward his face, with a cyan screen. Placed at the spec's hand offset in the
  // world each frame; the arm reaches for it (the rig's 0.032 arm is ~3 mm short of the spec's hand point).
  const phone = new THREE.Group();
  {
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0058), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
    screen.position.z = 0.0006;
    phone.add(prop('phone_face'), screen);
    phone.rotation.x = -1.0;
    scene.add(phone);
  }

  const exam = makeExam({ shot: 's10' }), R = exam.radius;
  scene.add(exam.mesh);

  // ---- Light. Key: the phone's shadow spot, aimed phone → blob. Half-angle 0.75 rad (43°): full to 30°, which holds the
  // blob's 21° half-size with a lit ring around its shadow; his body is > 60° off the axis, so he casts nothing into it.
  const spot = phoneLight({ angle: 0.75, penumbra: 0.3, distance: 0.6 });
  scene.add(spot, spot.target);
  // Face fill (doc 03 rule 3, same source): shadowless cyan at the phone, 0.3 of the key at its own range.
  const fill = new THREE.PointLight(PALETTE.phone, FILL_I, 0.06, 2);
  scene.add(fill);
  // Set light: one dim directional per tube. Their flicker is mine (seeded on/off per 24 fps frame), because the
  // module's update() stutters about 1 window in 8 and these windows are only 0.6 s.
  const tubes = TUBE_Z.map((z, n) => {
    const f = fluorescent({ flickerSeed: seedOf('s10', n + 1) });
    f.light.color.copy(FL);
    f.light.shadow.mapSize.set(1024, 1024);
    f.light.position.set(0, 1.5, z + 0.8);
    f.light.target.position.set(0, 0, z);
    scene.add(f.light, f.light.target);
    return { ...f, seed: seedOf('s10', 'tube', n + 1) };
  });
  const TUBE_I = 0.7;   // intensity at envelope 1.0; the envelope is 0.5 / 0.18 (spec), so 0.35 / 0.126
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
  const root = new THREE.Vector3(), P = new THREE.Vector3(), C = new THREE.Vector3();

  return {
    parts: { exam, spot, gator, phone, fill, tubes, wall, zG },   // read by evidence/anim-s10/measure.html only
    update(tLocal) {
      // Camera: locked.
      camera.position.set(...CAM);
      camera.rotation.set(0, 0, 0);
      fx.set({ focus: CAM[2] - zG(tLocal) });

      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));

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
      // Head: the front turnaround has no head joint, so the face slides on the body (−12° down, +6° up ≈ 0.12 mm / degree).
      const head = kf(T, [[0, -12], [3.25, -12], [3.333, -15], [3.417, 6], [4.0, 6], [4.167, -12]], ease);
      gator.joints.eyes.position.y = eyes0 + 0.00012 * head;
      gator.joints.mouth.position.y = mouth0 + 0.00012 * head;
      gator.face({ eyes: T >= 3.4 && T < 4.0 ? 'open' : 'tired', mouth: 'line' });

      // Phone, spot, fill: phone offset from his root; the blob at its pocket. Only z (+0.005 / −0.025) sets the scale.
      P.set(root.x + PHONE[0], root.y + PHONE[1], root.z + PHONE[2]);
      phone.position.copy(P);
      C.set(root.x + BLOB[0], root.y + BLOB[1], root.z + BLOB[2]);
      exam.mesh.position.set(C.x, C.y - 0.88 * R, C.z);   // the mesh origin is the blob's contact point
      const plant = ((T + 1e-6) % STEP) < 1 / 24;
      exam.update(tLocal, { wobble: 1, squash: plant ? 0.10 : 0, eyes: T >= 2.5 && T < 2.58 ? 'closed' : 'open', key: spot });

      spot.position.copy(P);
      spot.intensity = SPOT_REF * (P.z / WALL_REF) ** 2;   // the wall gets farther as he walks; hold its brightness
      aim(spot, C);
      fill.position.copy(P);

      tubes.forEach(({ light }, n) => {
        const e = envelope(n, tLocal);
        light.intensity = TUBE_I * e;
        tubeMat[n].color.copy(FL).multiplyScalar(0.2 + 0.7 * e / 0.5);
      });
    },
  };
}
