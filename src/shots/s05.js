// @ts-check
// s05 · Game night: a roommate walks through it (docs/shots/s05.md, G4). v2: the living room dressed from the frozen
// home_kit (planked floor, rug, door, poster, window, floor lamp) with the couch and coffee table at real height (their
// apt_furniture_sheet isn't frozen: still proxies). The Student on a floor cushion at frame right games on his laptop
// (the key, README §4; its screen glows) and never looks up; the 1.25× Exam sits on the coffee table, so its wall
// shadow is S 6.40, 8.0 units. roommate_round sits inside that shadow on the couch; roommate_tall gets up at 3.0 and
// walks straight through it at z 0.16. What moves: all puppets on 2s (the Student, both roommates, the Exam), the TV flicker on 1s,
// the window ramp at 24, boil 10/s. The camera, the phone and the blob don't move.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.ts';
import { paperMesh, updatePaperMesh } from '../material.ts';
import { phoneLight, dawnLight, ambient, aim } from '../lights.ts';
import { kf, spring, onTwos } from '../core/ease.ts';
import { hash, mulberry32, seedOf } from '../core/rng.ts';
import { makeGator } from '../characters/gator.ts';
import { makeRoommateTall, makeRoommateRound, HERON_STAND_Y } from '../characters/roommates.ts';
import { POSES, specPose, walk } from '../characters/poses.ts';
import { createBlob } from '../blob.ts';
import { act } from '../characters/acting.ts';
import { DESK, gameScreen, firing } from './s02.js';

const DEG = Math.PI / 180;
const F = (s) => Math.round(s * 12) / 12;  // spec times (2.67, 3.33, 4.83 ...) are 2s drawings: snap them to twelfths
const BLOB_R = { start: 0.018 };          // METER.gulp1 (README §1, v4): 1.5× all shot
// Real heights at the scale table's 0.055 m per real m: couch seat and coffee-table top 45 cm, couch back 88 cm,
// the pulled-down couch cushion the laptop sits on 18 cm.
const SEAT = 0.025, BACK = 0.048, TABLE = 0.025, CUSHION = 0.010;
const TABLE_TRIM = 0.3;                    // coffee-table fascia albedo (ponytail: per-object exposure, by eye)
/** @type {Vec3} */ const L = [0.075, CUSHION + 0.0075, 0.4148]; // the laptop screen's centre: the key (spec x, z: S = 0.4148 / 0.0648 = 6.40)
// v7-laptop: the laptop at s02's cartoon scale (DESK.laptop), turned further to the camera (v6: 50°, its screen almost edge-on).
// Its screen's centre stays on L (the base sinks into a thinner cushion), so the key, S and the 8.0 units are v6's exactly.
const LAP_K = DESK.laptop.scale, LAP_YAW = 35 * DEG;
// v4: the blob is 1.5×, the wall shadow keeps the spec's 8.0 units (README §1): S = 8.0 · 0.012 / r = 5.33, so with the laptop's light
// where it is (L.z 0.4148) the blob's depth is z = L.z · (1 − 1 / S) = 0.337 (G4: 0.35 for the 1.25× blob). x keeps the shadow's centre
// where G4 had it: L.x + (x − L.x) · S = 0.075 − 0.015 · 6.4. The blob still sits on the table top (z 0.33…0.36, x 0.025…0.080).
const UNITS = 8.0, S_WALL = UNITS * 0.012 / BLOB_R.start;
const B = /** @type {Vec3} */ ([L[0] - 0.096 / S_WALL, TABLE, L[2] * (1 - 1 / S_WALL)]);   // blob contact point on the table top
const CAM = { pos: [-0.04, 0.17, 1.15], look: [-0.04, 0.10, 0.15] };
const KEY = 0.40;                          // phone spot, cd: a cream wall 0.42 m away lands lit but below white (NoToneMapping)
const TV = 0.36;                           // 25% of the key's irradiance at the wall: 0.25 · 0.40 / 0.42² · 0.80²
const HERON_SEAT_Y = SEAT + 0.0035;         // the heron's hip on the couch seat (standing it is HERON_STAND_Y: the sheet's own proportions give his 0.098 m, the spec's 0.10)
const LEG_SWING = 38 * DEG;                // v3: his stride is 0.05 m a step on legs 0.033 m long, so the legs swing ±38° (v2's ±22° skated)
const HEAD_BOB = 3 * DEG, BREATHE = 0.9 * DEG;   // secondary motion: the heron's head nods with each step; everyone breathes on a 2.8 s cycle
const WALK = { x0: -0.15, x1: 0.30, t0: F(3.33), t1: F(6.33), z: 0.16 };
const STUDENT_HIP_Y = 0.012;               // sits on his floor cushion
const lerp01 = (u) => u;
// The library's poses plus s05's: the cheer, and the heron's stride at his own leg length.
const POSES_5 = { ...POSES, round_cheer60: { arm_r: 60 * DEG, arm_l: 60 * DEG },
  walk_tall_a: { ...POSES.walk_tall_a, leg_r: LEG_SWING, leg_l: -LEG_SWING },
  walk_tall_b: { ...POSES.walk_tall_b, leg_r: -LEG_SWING, leg_l: LEG_SWING } };

// A path rectangle that fills its canvas has no edge to tear, so it's inset 4% and the size grown to keep [w, h] (as s03).
function torn(w, h) {
  const m = 0.04 * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] };
}
const ellipse = (w, h) => ({ path: Array.from({ length: 24 }, (_, i) => [0.5 + 0.46 * Math.cos(i * Math.PI / 12), 0.5 + 0.46 * Math.sin(i * Math.PI / 12)]), size: [w / 0.92, h / 0.92] });

export async function build({ scene, camera, assets, PALETTE, post }) {
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.set(...CAM.pos);
  camera.lookAt(...CAM.look);

  /** @returns {Vec3} */
  const tiltOf = (layer) => { const r = mulberry32(seedOf('s02', layer)); return [(2 * r() - 1) * 1.5 * DEG, (2 * r() - 1) * 1.5 * DEG, 0]; };
  const boiling = [];
  // One paper piece. `at` is where the VISIBLE shape's centre goes (`vis` is its uv box inside the padded bitmap),
  // `flat` lays it on the floor/table (normal +y), `tilt` applies s02's seeded tilt, `fit` squeezes it to [w, h].
  // Returns the mesh; mesh.parent is the placed group.
  /**
   * @param {string} layer
   * @param {import('../paper.ts').PaperOptions} opts
   * @param {{ at: Vec3, flat?: boolean, tilt?: boolean, boil?: boolean, rotZ?: number, vis?: number[], parent?: THREE.Object3D, fit?: number[], [mat: string]: any }} o the rest goes to paperMesh
   */
  function piece(layer, opts, { at, flat = false, tilt = false, boil = true, rotZ = 0, vis = [0, 0, 1, 1], parent = scene, fit, ...mat }) {
    const make = (s) => makePaper({ ...opts, key: `s05-${layer}`, seed: s });
    const sheet = make(0), mesh = paperMesh(sheet, mat), [w, h] = sheet.size;
    mesh.position.set((0.5 - (vis[0] + vis[2]) / 2) * w, ((vis[1] + vis[3]) / 2 - 0.5) * h, 0);
    const g = new THREE.Group();
    g.add(mesh);
    g.position.set(...at);
    if (fit) g.scale.set(fit[0] / (w * (vis[2] - vis[0])), fit[1] / (h * (vis[3] - vis[1])), 1);
    if (tilt) g.rotation.set(...tiltOf(layer));
    if (flat) g.rotation.x = -Math.PI / 2;
    g.rotation.z = rotZ;
    parent.add(g);
    if (boil) boiling.push([mesh, make]);
    return mesh;
  }
  const art = (a, name, extra = {}) => ({ opts: { art: a.pieces[name], size: a.sizes[name], ...extra }, vis: a.visible?.[name] });

  // ---- Wall (z 0): apt_wall, cream cardstock x −0.6…0.4, y −0.02…0.32, the shadow's receiver. Its edges are out of frame.
  piece('apt_wall', { ...torn(1.0, 0.34), color: PALETTE.cream, res: 2048 }, { at: [-0.1, 0.15, 0], boil: false }).castShadow = false;
  // Floor (y 0, z 0…0.66): home_kit's plank strip tiled, the same boards as the bedroom.
  const home = await assets.load('home_kit');
  const planks = (() => {
    const bmp = home.pieces.floor_strip, [u0, v0, u1, v1] = home.visible.floor_strip, E = 4, nx = 4, ny = 12;
    const tw = Math.round((u1 - u0) * bmp.width) - 2 * E, th = Math.round((v1 - v0) * bmp.height) - 2 * E;
    const c = Object.assign(document.createElement('canvas'), { width: tw * nx, height: th * ny }), g = c.getContext('2d');
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g.drawImage(bmp, u0 * bmp.width + E, v0 * bmp.height + E, tw, th, i * tw, j * th, tw, th);
    return c;
  })();
  piece('apt_floor', { art: planks, size: [1.0, 0.66], weight: 'kraft', res: 2048 }, { at: [-0.1, 0, 0.33], flat: true, boil: false }).castShadow = false;
  // Room dressing (home_kit), all at their scale-table sizes and out of the loom's way: door far left, floor lamp by the
  // couch, a poster, the window at real sill height (the spec's y 0.17–0.23 was the old giant scale), the rug in
  // the walk lane. ponytail: no hole behind the window, so the dusk light is front fill (as v1).
  const kit = (name, at, o = {}) => { const { opts, vis } = art(home, name, o.weight ? { weight: o.weight } : {}); const m = piece(`kit-${name}`, opts, { at, vis, tilt: !o.flat, flat: o.flat, boil: true }); m.castShadow = false; return m; };
  kit('door', [-0.33, 0.055, 0.002]);
  kit('poster_a', [-0.24, 0.085, 0.002]);
  kit('window_glass', [0.21, 0.081, 0.0015], { weight: 'tissue' });
  kit('window_frame', [0.21, 0.080, 0.003]);
  kit('floor_lamp', [-0.215, 0.044, 0.03]);
  kit('bookshelf', [0.30, 0.0495, 0.012]);
  kit('rug', [-0.06, 0.0006, 0.19], { flat: true });   // in the walk lane: under the key's graze it burnt white

  // ---- Couch (z 0.02…0.10, x −0.24…0.04, seat top 0.035, back top 0.075): the art as the back, behind the roommates
  // (z 0.05); a kraft seat-cushion strip in front (z 0.10) hides their legs.
  const fur = await assets.load('apt_furniture_sheet');
  { const { opts, vis } = art(fur, 'apt_couch'); piece('apt_couch', opts, { at: [-0.105, BACK / 2, 0.05], tilt: true, vis, fit: [0.13, BACK] }); }
  piece('couch_seat', { ...torn(0.13, SEAT), color: PALETTE.kraft, weight: 'kraft' }, { at: [-0.105, SEAT / 2, 0.10], tilt: true });
  const tableTop = '#' + new THREE.Color(PALETTE.kraft).lerp(new THREE.Color(PALETTE.navy), 0.5).getHexString();  // the key grazes it at 5°: kraft would burn out
  // ---- Coffee table (x 0.025…0.080, top y 0.025, z 0.33…0.36: 1.2 m × 0.6 m, 45 cm): the art as the front fascia, a kraft top.
  // Its fascia stands 5 cm from the key and burns to white (inverse square): an albedo trim, as s04's stool.
  { const { opts, vis } = art(fur, 'apt_coffee_table', { weight: 'kraft' }); piece('apt_coffee_table', opts, { at: [0.0525, TABLE / 2, 0.36], tilt: true, vis, fit: [0.055, TABLE] }).material.color.setScalar(TABLE_TRIM); }
  piece('table_top', { ...torn(0.055, 0.03), color: tableTop, weight: 'kraft' }, { at: [0.0525, TABLE, 0.345], flat: true }).castShadow = false;
  // ---- The Student's floor cushion (z 0.405), and the couch cushion pulled to the floor that the laptop sits on.
  piece('cushion', { ...ellipse(0.06, 0.014), color: PALETTE.kraft, weight: 'kraft' }, { at: [0.12, 0.007, 0.405], tilt: true }).castShadow = false;
  const lapCushion = piece('laptop_cushion', { ...torn(0.032, CUSHION), color: '#' + new THREE.Color(PALETTE.navy).lerp(new THREE.Color(PALETTE.kraft), 0.3).getHexString(), res: 256 },
    { at: [L[0] - 0.002, CUSHION / 2, L[2] + 0.009], tilt: true, fit: [0.032 * LAP_K, CUSHION] });
  lapCushion.castShadow = false;

  // ---- Roommates. roommate_tall at x −0.15 (feet on the floor when standing), roommate_round at x −0.06: the root is
  // its bottom, so the hidden 3 cm sit behind the seat strip and the head top lands at the spec's 0.08.
  const ctx = { assets };
  const tall = await makeRoommateTall(ctx, { res: 512 });
  const round = await makeRoommateRound(ctx, { res: 512 });
  scene.add(tall.group, round.group);
  round.group.position.set(-0.06, SEAT - 0.03, 0.09);   // its bottom 3 cm behind the seat strip
  // Controllers (apt_props_sheet) in the near hands; the tall one's goes to the couch arm at 2.67.
  const props = await assets.load('apt_props_sheet');
  /** @param {string} layer @param {string} name @param {THREE.Object3D} parent @param {Vec3} [at] */
  const ctrl = (layer, name, parent, at = [0, 0, 0]) => {
    const { opts, vis } = art(props, name);
    const m = piece(layer, opts, { at, vis, parent });
    m.castShadow = false;
    return m.parent;
  };
  ctrl('ctrl_round', 'controller_1', round.hand);
  const tallCtrlHand = ctrl('ctrl_tall_hand', 'controller_2', tall.hand);
  const tallCtrlCouch = ctrl('ctrl_tall_couch', 'controller_2', scene, [-0.165, SEAT + 0.003, 0.098]);

  // ---- The Student (side rig, mirrored to face frame-left), on the cushion, body plane z 0.405. The hand is placed so the
  // fingertip lands on the laptop's keyboard, just in front of the screen.
  const gator = await makeGator(ctx, { res: 1024 });
  gator.group.scale.x = -1;
  scene.add(gator.group);
  const HUNCH = { lean: 24, arm: 2, far: -40, head: -10, leg: 60, farLeg: 54 };
  const studentPose = (flick) => specPose({ ...HUNCH, arm: HUNCH.arm + flick });
  gator.pose(studentPose(0));
  gator.group.position.set(0, STUDENT_HIP_Y, 0.405);
  gator.group.updateMatrixWorld(true);
  const tip = gator.hand.getWorldPosition(new THREE.Vector3());
  gator.group.position.x = L[0] + 0.008 - tip.x;
  const STUDENT_POSE = { flat: studentPose(0), flick: studentPose(2) };

  // The laptop (home_kit) on the cushion: screen toward his face (+x), turned 55° toward camera (v7), the screen glowing a game
  // (no text). Nothing on it casts.
  const laptop = new THREE.Group();
  laptop.position.set(L[0], CUSHION, L[2]);
  laptop.rotation.y = LAP_YAW;
  laptop.scale.setScalar(LAP_K);
  scene.add(laptop);
  const lap = (name, w, y) => {
    const { opts, vis } = art(home, name), [sw] = home.sizes[name], vw = sw * (vis[2] - vis[0]), k = w / vw;
    const m = piece(`laptop-${name}`, { ...opts, size: opts.size.map((v) => v * k) }, { at: [0, y, name === 'laptop_base' ? 0.004 : 0], vis, parent: laptop });
    m.castShadow = false;
    return opts.size[1] * k * (vis[3] - vis[1]);
  };
  lap('laptop_base', 0.018, 0.0028);
  const scrH = lap('laptop_screen', 0.0185, 0.0015 + 0.006);
  const game = gameScreen(PALETTE);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.0185 * 0.78, scrH * 0.70), new THREE.MeshBasicMaterial({ map: game.texture }));
  glow.position.set(0, 0.0075 + scrH * 0.03, 0.0006);
  laptop.add(glow);
  // v7: scaled, the screen's centre would rise 6 mm and put the key above his snout (his head then threw a giant shadow over the
  // room). The laptop sinks into a thinner cushion instead, so the screen's centre stays on v6's L and the key stays there.
  laptop.updateMatrixWorld(true);
  laptop.position.y -= glow.getWorldPosition(new THREE.Vector3()).y - L[1];
  lapCushion.parent.scale.y *= laptop.position.y / CUSHION; lapCushion.parent.position.y = laptop.position.y / 2;

  // ---- The Exam on the coffee table.
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh, exam.stain);
  exam.mesh.position.set(...B);
  exam.stain.position.set(B[0], B[1] + 0.0003, B[2]);

  // ---- Light. Key: the phone spot (angle 1.0, penumbra 0.4), at L, aimed along L → blob to its wall hit (README §4).
  // Student face fill: unshadowed cyan point at the phone, distance 0.06. TV fill (spec): a flickering cream-cyan spot
  // from the camera side, 25% of the key at the wall. §10 character fills for the roommates: short-reach points in front of
  // them, no shadow, so they reach the roommates and not the wall. Window: s04's dusk-to-night ramp, front fill here.
  const spot = phoneLight({ angle: 1.0, penumbra: 0.4, distance: 0.8, intensity: KEY });
  spot.position.set(...L);
  const C = new THREE.Vector3(B[0], B[1] + 1.08 * BLOB_R.start, B[2]), P = new THREE.Vector3(...L);
  aim(spot, new THREE.Vector3().subVectors(C, P).multiplyScalar(-P.z / (C.z - P.z)).add(P));  // the blob centre's wall hit
  const face = new THREE.PointLight(PALETTE.phone, 0.03, 0.06, 2);
  face.position.set(L[0] - 0.006, L[1] + 0.006, L[2] + 0.01);
  const tvColor = new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.cream), 0.6);
  const tv = phoneLight({ color: tvColor, angle: 0.5, penumbra: 0.5, distance: 2, intensity: TV });
  tv.position.set(-0.04, 0.06, 0.80);
  aim(tv, new THREE.Vector3(-0.08, 0.05, 0.09));
  const stFill = new THREE.PointLight(PALETTE.phone, 0.03, 0.2, 2);    // §10: the Student's body, 9.5 cm in front of him; the wall is 0.5 m away
  stFill.position.set(0.10, 0.09, 0.50);
  const coFill = new THREE.PointLight(PALETTE.phone, 0.05, 0.17, 2);   // seated pair
  coFill.position.set(-0.10, 0.12, 0.20);
  const wlFill = new THREE.PointLight(PALETTE.phone, 0.05, 0.17, 2);   // follows the walker
  const dawn = dawnLight();
  dawn.light.target.position.set(0.0, 0.05, 0.1);
  dawn.light.castShadow = false;
  const amb = new THREE.HemisphereLight(PALETTE.navy, '#' + new THREE.Color(PALETTE.navy).lerp(new THREE.Color(PALETTE.phone), 0.25).getHexString(), 0.8 * 0.55);   // v3: cool bounce, as s04: the heron walks through a navy shadow, not a brown one
  scene.add(spot, spot.target, face, stFill, tv, tv.target, coFill, wlFill, dawn.light, dawn.light.target, amb);

  const fx = post({ focus: 0.95, aperture: 0.012, lut: 'night' });

  return {
    parts: { exam, spot, tv, dawn, gator, tall, round },  // read by evidence/anim-s05/measure.html only
    update(tLocal) {
      const T = onTwos(tLocal);

      // Paper boils at 10/s.
      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));
      for (const r of [gator, tall, round]) r.boil(tLocal, 10);

      // ---- The Student: hunched over the phone the whole shot. Thumb flick (+2°) for one drawing every 0.5 s from 0.33.
      const flick = Array.from({ length: 16 }, (_, i) => F(0.33 + 0.5 * i)).some((f) => Math.abs(T - f) < 1e-6);
      gator.pose(flick ? STUDENT_POSE.flick : STUDENT_POSE.flat);
      gator.joints.body.rotation.z += BREATHE * Math.sin(2 * Math.PI * T / 2.8 + 2.1);   // v3: the Student breathes too
      gator.follow('tail', tLocal, { k: 6, w: 18 });
      // v4 acting: numb all shot; slump 0 (his hand is on the keys), the spec's snort (the smile) goes over the preset's face.
      act(gator, tLocal, [[0, 'numb']], { slump: 0, breath: 6, blink: false });
      gator.face({ eyes: 'tired', mouth: T >= F(4.5) && T < F(4.83) ? 'smile' : 'neutral' });

      // ---- roommate_round: mashes (arms alternate every 0.25 s), 4.83 dip, 5.00 wins, back to mashing at 6.00.
      const mash = Math.floor((T + 1e-6) / 0.25) % 2 ? 'b' : 'a';
      let rp = `round_mash_${mash}`, rf = { eyes: 'open', mouth: 'line' };
      if (T >= F(4.83) && T < F(5.0)) rp = 'round_cheer_antic';
      else if (T >= F(5.0) && T < F(5.67)) { rp = 'round_cheer60'; rf = { eyes: 'closed', mouth: 'smile' }; }
      else if (T >= F(5.67) && T < F(6.0)) rp = 'round_cheer_antic';
      round.blend(POSES_5, [[0, rp], [1, rp]], tLocal);
      round.face(rf);

      // ---- roommate_tall: mashes to 2.67, controller to the couch arm and a 12° lean to 3.0, stands and steps to z 0.16 by
      // 3.33, then walks frame-right 3.33–6.33 (one step per 0.33 s, 2 mm bob), eyes and mouth unchanged through the shadow.
      let x = WALK.x0, y = HERON_SEAT_Y, z = 0.09, keys, handCtrl = false;
      if (T < F(2.67)) { const p = `tall_mash_${mash}`; keys = [[0, p], [1, p]]; handCtrl = true; }
      else if (T < F(3.0)) keys = [[0, 'tall_lean'], [1, 'tall_lean']];
      else if (T < WALK.t0) { keys = [[0, 'tall_stand'], [1, 'tall_stand']]; y = HERON_STAND_Y; z = kf(T, [[F(3.0), 0.09], [WALK.t0, WALK.z]], lerp01); }
      else {
        const w = walk(T, { set: 'tall', step: 1 / 3, t0: WALK.t0, rise: 0.0015 });
        keys = w.keys; y = HERON_STAND_Y + w.lift; z = WALK.z;
        x = kf(T, [[WALK.t0, WALK.x0], [WALK.t1, WALK.x1]], lerp01);
      }
      tall.blend(POSES_5, keys, tLocal);
      tall.follow('tail', tLocal, { k: 6, w: 18 });
      if (T >= WALK.t0) tall.joints.head.rotation.z += HEAD_BOB * Math.sin(2 * Math.PI * (T - WALK.t0) / (1 / 3));   // a nod per step
      for (const [r, ph] of /** @type {[import('../puppet.ts').Puppet, number][]} */ ([[tall, 0], [round, 1.3]])) r.joints.body.rotation.z += BREATHE * Math.sin(2 * Math.PI * T / 2.8 + ph);
      tall.face(T < F(2.67) ? { eyes: 'open', mouth: 'line' } : { eyes: 'open', mouth: 'neutral' });
      tall.group.position.set(x, y, z);
      tall.group.visible = T <= WALK.t1;
      tallCtrlHand.visible = handCtrl;
      tallCtrlCouch.visible = !handCtrl;

      game.fire(firing(tLocal, 0.33, 5.75));   // v7: the muzzle flashes on the CS2 clip's bursts (cues.js: from gameNight + 0.33, in 5.75)

      // ---- The Exam: eyes up toward the roommates and the TV (side, −x), track the walker (flip as he passes at 4.5),
      // 5.00 squash, 5.08 hop (4 mm up), 5.17 lands and settles on a spring, 5.50 eyes open on the Student.
      let eyes = 'side', look = -1;
      if (T >= F(3.33)) look = T < F(4.5) ? -1 : 1;
      if (T >= F(5.5)) eyes = 'open';
      const at = (t) => Math.abs(T - F(t)) < 1e-6;
      const squash = at(5.0) ? 0.25 : at(5.08) ? 0 : 0.2 * spring(T, F(5.17));
      exam.mesh.position.y = B[1] + (at(5.08) ? 0.004 : 0);
      exam.update(tLocal, { squash, wobble: 1, eyes, look, key: spot });

      // ---- Light. The key is steady (the phone doesn't move); the TV flickers on 1s (4 Hz); the window ramps at 24.
      tv.intensity = TV * (0.85 + 0.15 * hash(Math.floor(tLocal * 4)));
      wlFill.position.set(x, 0.13, 0.30);
      wlFill.visible = T >= WALK.t0 && T <= WALK.t1;
      dawn.update(tLocal, kf(tLocal, [[0, 0.3], [8, 0.0]], lerp01));
      dawn.light.position.set(0.8, 0.6, 0.6);
      dawn.light.intensity *= 0.3;
    },
  };
}
