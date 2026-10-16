// s14 · The Custodian passes (docs/shots/s14.md, G4). v2 on the frozen Marston kits: s11's desk set (marstonDesk), every
// position s15 opens on. Locked wide side view: the aisle in front of his desk is lit by a working fluorescent (the
// Custodian's light); his own desk is keyed by his phone, and the cart wakes his zone (the ring pendant, in frame at the
// top) for three seconds before it times out. The Custodian and his cart are still custodian_sheet proxies (not frozen).
// Characters (student, Custodian, cart, both blobs) step on 2s; light and focus run at 24.
import * as THREE from 'three';
import { phoneLight, sensorLight, fluorescent, ambient, aim, shadowScale } from '../lights.js';
import { kf, onTwos } from '../core/ease.js';
import { seedOf } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator } from '../characters/gator.js';
import { makeCustodian, makeCart } from '../characters/custodian.js';
import { POSES, walk } from '../characters/poses.js';
import { UNIT, BLOB_AT, PHONE, PHONE_L, PAGE, practiceSheet, SHEET_INK } from './s15.js';
import { kitTools, marstonDesk, noCast } from './s11.js';

const ID = 's14', D = Math.PI / 180;
const BLOB_R = { start: 0.030 };             // METER.gulp5 (README §1), at s15's mark (BLOB_AT)
const LAPTOP_Z = 0.078;                      // in front of the grown blob (README §2)
const TINY_R = 0.004;                        // the Custodian's blob
const ROLL = [0.014, 0.016];                 // paper-towel roll behind the tiny blob (w, h)
const WAKE = 1.0, TIMEOUT = 4.2;             // the cart trips the hero's zone; he stays still, so it times out (Q11 option a)
const ZONE_I = 0.8, PHONE_OUTSHONE = 0.02;   // s15's numbers: zone pool at the blob, and the phone's out-shone level
const CUST = { x0: 0.27, v: 0.11, t0: 0.5, z: 0.233, cartZ: 0.228, cartDx: -0.07, floor: -0.034 };
export const xk = (t) => CUST.x0 - CUST.v * Math.max(0, t - CUST.t0);   // spec: x_k = 0.27 − 0.11·(t − 0.5)

const PHONE_I = 0.6, FLUOR_I = 1.4, AMB_K = 0.45, FILL_PHONE = 0.008, FILL_AISLE = 0.12;   // fill: s15's number, the face has to read under the phone
export const FOCUS = [[0, 0.63], [1.4, 0.63], [1.8, 0.48], [3.2, 0.48], [3.6, 0.63]];   // metres from the camera (spec: hero / cart plane)

// The student: `sit` (arm −30, hand on the desk) until 4.5, then the hand drops to s15's opening drawing `rest`.
const BODY = [[0, 'sit'], [4.5, 'sit'], [4.667, 'rest']];
const HEAD = [[0, 0], [1.2, 0], [1.4, -5], [3.4, -5], [3.6, 5], [4.4, 5], [4.5, 0]];   // + snout up
const eyesAt = (t) => (t >= 3.4 && t < 4.4 ? 'side' : 'open');
const MOP = Array.from({ length: 12 }, (_, i) => [CUST.t0 + 0.5 * (i - 1), (i % 2 ? -1 : 1) * 12.4 * D]);   // stroke ends every 0.5 s

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const tools = kitTools(ID), { sheet, boil } = tools;
  const { pendant } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  const [props, kitp] = await Promise.all(['study_props_sheet', 'props_kit'].map((n) => assets.load(n)));
  const cut = (a, name, { weight, res = 512, parent = scene } = {}) => {   // origin = centre of the piece's visible shape
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${name}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // ---------- set: s11's desk unit (its carpet reaches z 0.45, the aisle), and what s15 opens on ----------
  { const b = cut(props, 'backpack_side'); b.position.set(-0.145, -0.034 + 0.02, 0.028); }
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, LAPTOP_Z);   // closed
  cut(props, 'laptop_lid').position.set(-0.0075, 0.0045, LAPTOP_Z + 0.0001);
  // page (problem 1's practice sheet, nothing written yet), pen and cap at rest, phone face up: s15's props
  practiceSheet({ props: kitp, sheet, which: 'practice_1', at: PAGE, key: `${ID}-page`, parent: scene }).draw([[SHEET_INK.practice_1.problem, 0, 1]]);
  const pen = new THREE.Group(); scene.add(pen);
  { const p = cut(kitp, 'pen', { parent: pen }); p.position.x = -0.006; p.scale.x = -1; }
  pen.position.set(-0.016, 0.0006, 0.106); pen.rotation.set(-Math.PI / 2, 0, 0);
  const cap = cut(kitp, 'pen_cap'); cap.scale.x = -1; cap.position.set(-0.016 - 0.002, 0.0006 + 0.0002, 0.106 + 0.0002); cap.rotation.set(-Math.PI / 2, 0, 0);
  const phone = new THREE.Group(); phone.position.set(...PHONE); scene.add(phone);
  flat(cut(kitp, 'phone_face_up', { parent: phone })).position.y = 0.0004;
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0128, 0.0054), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);
  noCast(phone);

  // ceiling_header: out of frame over his desk, so the aisle tube never reaches it. Wider than the spec's z 0.03–0.15 because the
  // tube is tilted 15° toward camera: its rays reach the desk's front edge through z 0.17 at y 0.20.
  const header = flat(sheet({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [0.40, 0.17], key: `${ID}-ceiling_header`, res: 256 }, scene));
  header.position.set(0, 0.20, 0.115);

  // ---------- aisle: the Custodian, his cart, the tiny blob ----------
  const cust = await makeCustodian({ assets }, { res: 512 });
  const cart = await makeCart({ assets }, { res: 512 });
  for (const r of [cust, cart]) { r.group.scale.x = -1; scene.add(r.group); }   // rigs face +x; he walks −x
  cart.group.position.set(0, CUST.floor, CUST.cartZ);
  const TRAY_Y = CUST.floor + 0.05 + 0.002;   // the rig's tray: centre 0.05 above the floor, 4 mm thick
  const tiny = createBlob({ radius: TINY_R, seed: seedOf('custodianBlob') });
  tiny.mesh.castShadow = false;               // its pool is the decal below (see done note)
  scene.add(tiny.mesh);
  const trayTop = flat(sheet({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [0.05, 0.016], key: `${ID}-tray_top`, res: 128 }, scene));
  trayTop.castShadow = false;
  // A paper-towel roll standing on the tray just behind the tiny blob: a lit cream card it reads against. Without it the
  // sleeping ink blob (eyes closed, no cream showing) vanished into the dark desk behind it at sheet size.
  const roll = sheet({ path: [[0, 0.1], [0.1, 0], [0.9, 0], [1, 0.1], [1, 0.9], [0.9, 1], [0.1, 1], [0, 0.9]], color: PALETTE.cream,
    size: ROLL, key: `${ID}-towel_roll`, res: 128 }, scene);
  roll.castShadow = false;
  const pool = new THREE.Mesh(tiny.mesh.geometry, tiny.silhouette());   // 1.0×: the blob's own outline, laid on the tray toward camera
  pool.rotation.x = Math.PI / 2; pool.scale.set(1, 0.5, 1); scene.add(pool);

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
  scene.add(hero.group);
  const M = BLOB_AT(BLOB_R.start), BLOB_C = new THREE.Vector3(M[0], BLOB_R.start, M[2]);
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.stain.position.set(M[0], 0.0004, M[2]);
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  // Rival: his phone, s15's rig (4.2×), dimmed to the spec's 0.6. Its cone points at the wall, away from the aisle.
  const phoneSpot = phoneLight({ angle: 0.9, penumbra: 0.4, intensity: PHONE_I });
  phoneSpot.position.copy(V(PHONE_L));
  scene.add(phoneSpot, phoneSpot.target);
  aim(phoneSpot, BLOB_C); phoneSpot.shadow.camera.near = 0.004; phoneSpot.shadow.camera.updateProjectionMatrix();
  const fill = new THREE.PointLight(C('phone').lerp(C('navy'), 0.35), FILL_PHONE, 0.07, 2);   // README §10 character fill, s15's
  fill.castShadow = false; fill.position.set(-0.046, 0.040, 0.114); scene.add(fill);
  // His desk zone (README §3): dead, then the cart wakes it at 1.0; it times out at 4.2 because he doesn't move.
  // Its fixture is s11's ring pendant, in frame at the top; the procedural trough isn't added.
  const zone = sensorLight({ at: UNIT.tube, aimAt: [0, 0, 0.098], intensity: ZONE_I });
  scene.add(zone.light, zone.light.target);
  const FILL_ZONE = 0.06, FILL_COLS = { phone: fill.color.clone(), zone: C('cream').lerp(C('gator'), 0.15) };
  // Key: the aisle tube, steady (its update() is never called), tilted 15° toward camera.
  const tube = fluorescent({ flickerSeed: seedOf(ID, 1), intensity: FLUOR_I });
  const tgt = new THREE.Object3D(); tgt.position.set(0, 0, 0.15); scene.add(tgt);
  tube.light.target = tgt;
  tube.light.position.set(0, 1.5 * Math.cos(15 * D), 0.15 + 1.5 * Math.sin(15 * D));
  Object.assign(tube.light.shadow.camera, { left: -0.35, right: 0.35, top: 0.35, bottom: -0.35 });
  tube.light.shadow.camera.updateProjectionMatrix();
  scene.add(tube.light);
  // Character fill (README §10) for the aisle: shadowless, ≤ 30% of the tube at the cutouts, short range so it never reaches the wall or his desk.
  const aisleFill = new THREE.SpotLight(C('cream').lerp(C('gator'), 0.15), FILL_AISLE, 0.4, 0.7, 0.8, 2);
  aisleFill.castShadow = false; aisleFill.position.set(0, 0.05, 0.50); aisleFill.target.position.set(0, 0, 0.23);
  scene.add(aisleFill, aisleFill.target);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  camera.position.set(0, 0.033, 0.708);
  camera.lookAt(0, 0.033, 0);
  const fx = post({ focus: 0.63, aperture: 0.025, maxblur: 0.01, lut: 'marston' });   // spec LUT act2b doesn't exist; s13 and s15 use marston

  function update(t) {
    const tc = onTwos(t);
    boil(t, 10);
    const level = zone.update(t, { wake: WAKE, timeoutAt: TIMEOUT }), lit = level >= 0.5;   // on 1s; README §4's outshone rule
    pendant(level);
    fx.set({ focus: kf(t, FOCUS) });

    // Custodian: root on 2s, a step every 0.25 s, the mop's stroke ends at 0.5 + 0.5n
    cust.boil(t, 10); cart.boil(t, 10);
    const w = walk(t, { set: 'stoop', step: 0.25, t0: CUST.t0 });
    cust.blend(POSES, w.keys, t);
    cust.pose({ mop: kf(tc, MOP) });
    const x = xk(tc + 1 / 24);   // centred on the 2-frame hold, so the drawn x stays within 0.005 m of the spec's line (a floored step is up to 0.009 off)
    cust.group.position.set(x, CUST.floor + 0.002 + w.lift, CUST.z);
    cart.group.position.x = x + CUST.cartDx;
    tiny.update(t, { wobble: 0.3, eyes: 'closed', key: tube.light });
    tiny.mesh.position.set(x + CUST.cartDx, TRAY_Y, CUST.cartZ + 0.003);
    tiny.mesh.scale.setScalar(1 + 0.05 * Math.sin(2 * Math.PI * tc / 3));
    trayTop.position.set(x + CUST.cartDx, TRAY_Y - 0.0002, CUST.cartZ + 0.003 + 0.004);
    pool.position.set(x + CUST.cartDx, TRAY_Y + 0.0001, CUST.cartZ + 0.003);
    roll.position.set(x + CUST.cartDx + 0.002, TRAY_Y + ROLL[1] / 2, CUST.cartZ - 0.002);

    // student: sits, notices, follows the cart, looks back along the desk; the 3/4 head is on one drawing 2.8–4.4
    hero.boil(t, 10);
    hero.blend(POSES, BODY, tc + 1e-6);
    const head = kf(tc, HEAD) * D;
    hero.pose({ head, head34: head });
    hero.head34(tc >= 2.8 && tc < 4.4);
    hero.face({ eyes: eyesAt(tc), mouth: tc < 4.4 ? 'neutral' : 'line' });
    hero.group.position.y = UNIT.hip[1];

    // his blob: eyes follow the tiny one from 2.3 to 4.0; a small startle as the light comes
    const kick = tc < WAKE ? 0 : 0.2 * Math.exp(-6 * (tc - WAKE)) * Math.cos(18 * (tc - WAKE));
    exam.update(t, { wobble: 1, squash: kick, eyes: t >= 2.3 - 1e-6 && t < 4.0 ? 'side' : 'open', look: -1, key: lit ? zone.light : phoneSpot });
    exam.mesh.position.set(...M);
    phoneSpot.intensity = PHONE_I * (lit ? PHONE_OUTSHONE : 1);
    fill.color.copy(lit ? FILL_COLS.zone : FILL_COLS.phone); fill.intensity = lit ? FILL_ZONE : FILL_PHONE;
    screen.material.color.setScalar(lit ? 0.6 : 1);
  }

  const probe = () => ({
    h34: hero.meshes.head34.visible, tinyZ: tiny.mesh.position.z, tinyW: new THREE.Box3().setFromObject(tiny.mesh).getSize(new THREE.Vector3()).x, poolW: new THREE.Box3().setFromObject(pool).getSize(new THREE.Vector3()).x,
    x: cust.group.position.x, cartX: cart.group.position.x, custHead: cust.joints.head.rotation.z, head: hero.meshes.head.getWorldPosition(new THREE.Vector3()).toArray(),
    wallScale: shadowScale(phoneSpot.position, BLOB_C, 0),
    joints: Object.fromEntries(Object.entries(hero.joints).map(([k, j]) => [k, j.rotation.z])),
  });
  return { update, probe };
}
