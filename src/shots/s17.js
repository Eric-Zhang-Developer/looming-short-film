// s17 · Quiet 2: the dawn reading room, blob to pocket (docs/shots/s17.md). A 25 s locked wide of the Marston wall row
// at dawn. 4.0–12.0 he sits back and the blob hops to his hand and climbs into his hoodie pocket; after the 12.000
// drawing only the light and the boil move. Desk-unit numbers are s15's revised ones (done/anim-s15.md, "For s06").
// Characters step on 2s (boil at the quiet rate, 4/s); light, grade and camera run at 24.
// Marston has no desk lamps (README §3): each desk has a motion-sensor zone. His and the neighbor's stay lit (both moved
// minutes ago), the empty desk's is dead. Dawn through the windows is the warm light that crawls in over the shot.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { sensorLight, dawnLight, fluorescent, ambient } from '../lights.js';
import { loadLUT } from '../post.js';
import { kf, clamp, onTwos, ease } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator } from '../characters/gator.js';
import { makeCrowd } from '../characters/crowd.js';
import { BLOB_R as OTHER_R } from '../characters/exam.js';
import { createBlob } from '../blob.js';
import { POSES, specPose } from '../characters/poses.js';
import { UNIT } from './s15.js';

// ---------- tunables (the final pass changes these, not the staging) ----------
const BLOB_R = 0.005;   // hamster-sized, s16's last step (README §1); the blob-meter pass changes this line

const ID = 's17', D = Math.PI / 180, lin = (x) => x;

// ---------- numbers (world m, s17-local s) ----------
const HIP = [-0.075, -0.012], BODY_Z = 0.074;
const BLOB0 = [UNIT.blob[0], UNIT.blob[2]];            // s15/s16's built mark (x, z)
const PHONE = UNIT.phone;                               // face-down since s15's 7.417
const NB = 0.350;                                       // neighbor unit: x' = 0.350 − x (s16)
const NB_BLOB = [0.350, OTHER_R.neighbor, 0.098], NB_PHONE = [0.360, 0.0015, 0.114];   // s16's spec
const NB_HIP = [0.425, -0.012];                         // s16's
const EMPTY_DX = -0.25;
const CAM = { pos: [0.050, 0.292, 1.058], look: [0.050, 0.080, 0.060], fov: 20 }, FOCUS = [-0.060, 0.010, 0.077];
// Orchestrator ruling (reel): locked wide to dawnBird3, then one slow eased push-in to the pocket so the beat s18's yawn
// pays off reads on a sheet. Same 12° down angle, 0.4 m out, centred between his chest and the pocket.
const PUSH = { from: 19, to: 25, look: [-0.062, 0.022, 0.077], dist: 0.4, fov: 11 };
const RIM_I = 0.12, RIM_AT = [-0.070, 0.060, 0.080];    // dawn-side rim over his shoulder: separates the blob from his body
const FG = { z: 0.354, head: [0.120, 0.035], blob: [0.150, 0.006, 0.360] };      // the foreground sleeper
// Zones at s16's level, constant. Dawn is dawnLight's own k ramp; DAWN_K scales it so dawn overtakes the zones by 22 (by eye).
const ZONE_I = 0.8, FLUOR_I = 0.4, AMB_K = 0.45, FILL_I = 0.02, DAWN_K = 12;   // FLUOR_I: s16's Camera D level
const ZONES = { hero: [UNIT.tube, [BLOB0[0], 0, BLOB0[1]]], nbr: [[NB, 0.127, 0.040], [NB_BLOB[0], 0, NB_BLOB[2]]] };
const EMPTY_TUBE = [EMPTY_DX, 0.127, 0.040];
const TROUGH_DARK = 0.3, LIP_H = 0.0025;                // s16's: the camera looks down on the troughs, so a lip shows the level
const GOLD_AT = 22;                                     // elevation, k and grade ramps end here, then hold

// ---------- the hero (s15 convention: lean + forward, arm = the near arm's world angle) ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
const P = {
  ...POSES,                                             // write_a (lean 10, arm −30), sit_back (lean −8, arm −50, head 6)
  antic: seat({ lean: 14, arm: -30 }),                  // 4.000
  back1: seat({ lean: 4, arm: -38 }),                   // 4.500
  back2: seat({ lean: -4, arm: -46, head: 3 }),         // 5.000
  settle: seat({ lean: -7, arm: -50, head: 6 }),        // 6.000, held to 25.0
};
const BODY = [[0, 'write_a'], [47 / 12, 'write_a'], [4, 'antic'], [4.5, 'back1'], [5, 'back2'], [5.5, 'sit_back'], [6, 'settle']];
const heroEyes = (t) => (t < 5.5 ? 'open' : t < 7 ? 'tired' : t < 11.5 ? 'side' : 'closed');
const PEN_DOWN = 50 / 12;                               // 4.167

// ---------- the blob: centre positions from the spec table (x, y, z); mesh y = centre y − r ----------
// Hops are linear between their keys on 2s; the climb pops one drawing per step (held between). The pocket
// waypoints are measured off the rig at build time (see CLIMB).
const R = BLOB_R;
const HOPS = [
  [0, [0, 0.005, BLOB0[1]]], [7, [0, 0.005, BLOB0[1]]], [7 + 4 / 12, [-0.012, 0.012, BLOB0[1]]], [7.5, [-0.020, 0.005, BLOB0[1]]],
  [8 + 4 / 12, [-0.020, 0.005, BLOB0[1]]], [8 + 7 / 12, [-0.036, 0.012, 0.090]], [8.75, [-0.046, 0.000, 0.088]],
];
const SQUASH = [[83 / 12, 0], [7, 0.25], [85 / 12, -0.1], [7 + 4 / 12, -0.2], [89 / 12, -0.1], [7.5, 0.2], [7.75, 0],
  [99 / 12, 0], [8 + 4 / 12, 0.25], [101 / 12, -0.1], [8 + 7 / 12, -0.2], [104 / 12, -0.1], [8.75, 0.2], [9, 0]];

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  const V = (a) => new THREE.Vector3(...a);
  scene.background = C('navy').lerp(C('ink'), 0.5);

  const [furn, props] = await Promise.all(['marston_furniture_sheet', 'study_props_sheet'].map((n) => assets.load(n)));
  const boiling = [];
  const sheet = (opts, parent = scene) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  // An asset piece in a holder whose origin is the centre of its visible shape (s15's cut()). tag keeps keys unique.
  const cut = (a, name, { weight, res = 512, parent = scene, tag = '' } = {}) => {
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${name}${tag}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // ---------- room ----------
  // marston_window_wall as s15 (x −0.65…0.65, y −0.034…0.36, windows 0.10 wide, sill 0.066, top 0.300), plus a cross
  // mullion (6 mm) in each window, so the dawn patches carry the window's shape (spec: "the wall and mullions cast").
  const WALL = [1.3, 0.394], PX = 2048 / WALL[0], WINDOWS = [-0.51, -0.31, -0.11, 0.09, 0.29, 0.49], MUL = 0.006;
  const wallArt = Object.assign(document.createElement('canvas'), { width: 2048, height: Math.round(WALL[1] * PX) });
  { const g = wallArt.getContext('2d'); g.fillStyle = PALETTE.navy; g.fillRect(0, 0, wallArt.width, wallArt.height);
    const yMid = (0.066 + 0.300) / 2;
    for (const cx of WINDOWS) for (const [x0, x1] of [[cx - 0.05, cx - MUL / 2], [cx + MUL / 2, cx + 0.05]])
      for (const [y0, y1] of [[0.066, yMid - MUL / 2], [yMid + MUL / 2, 0.300]])
        g.clearRect((x0 + 0.65) * PX, (0.36 - y1) * PX, (x1 - x0) * PX, (y1 - y0) * PX); }
  sheet({ art: wallArt, size: WALL, key: `${ID}-marston_window_wall`, res: 2048 }).position.set(0, (0.36 - 0.034) / 2, 0);
  // window_tissue: pale tissue behind each hole, lit from behind by the dawn (translucency); casts nothing.
  // s16's: white tissue tinted by material.color. Cold grey (s16's last frame) → gold by 22.0, lerped in sRGB.
  const PANE = { cold: C('navy').lerp(C('cream'), 0.2).convertLinearToSRGB(), gold: C('lamp').lerp(C('cream'), 0.5).convertLinearToSRGB() };
  const panes = WINDOWS.map((cx) => {
    const m = sheet({ path: RECT, color: '#ffffff', weight: 'tissue', size: [0.11, 0.245], key: `${ID}-pane${cx}`, res: 256 });
    m.position.set(cx, 0.183, -0.001); m.castShadow = false; return m;
  });
  flat(sheet({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [1.0, 0.6], key: `${ID}-marston_floor`, res: 512 }))
    .position.set(0.05, -0.034, 0.30);

  // One desk unit in hero-unit coordinates (README §2) inside `g`: desk, chair. No lamp: Marston. g mirrors or shifts it.
  const unit = (g, tag) => {
    flat(cut(furn, 'desk_top', { weight: 'kraft', res: 1024, parent: g, tag })).position.set(0.0585, 0, 0.075);
    cut(furn, 'desk_apron', { weight: 'kraft', res: 1024, parent: g, tag }).position.set(0.0585, -0.017, 0.120);
    cut(furn, 'chair', { weight: 'kraft', parent: g, tag }).position.set(-0.076, -0.034 + 0.025, 0.071);
    scene.add(g); return g;
  };
  const heroU = new THREE.Group(), empty = new THREE.Group(), nbrU = new THREE.Group();
  empty.position.x = EMPTY_DX;
  nbrU.position.x = NB; nbrU.scale.x = -1;              // x' = 0.350 − x
  unit(heroU, ''); unit(empty, '-empty'); unit(nbrU, '-nbr');

  // Foreground row: a bare desk top and apron, z 0.310…0.400, x 0.020…0.200 (only its sleeper peeks into frame).
  flat(cut(furn, 'desk_top', { weight: 'kraft', res: 1024, tag: '-fg' })).position.set(0.1115, 0, 0.355);
  cut(furn, 'desk_apron', { weight: 'kraft', res: 1024, tag: '-fg' }).position.set(0.1115, -0.017, 0.400);

  // ---------- hero desk props (s16's out-state) ----------
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, 0.060);
  cut(props, 'laptop_lid').position.set(-0.0075, 0.0045, 0.0601);
  flat(cut(props, 'exam_page', { res: 1024 })).position.set(-0.0205, 0.0003, 0.095);
  for (let i = 1; i <= 2; i++) flat(cut(props, 'exam_page', { tag: `-stack${i}` })).position.set(0.0275, 0.0003 + 0.0004 * i, 0.050);
  // Ink on the working page: glyph problem lines (proxy art only), the name squiggle and two answer squiggles. No text.
  const INK = Object.assign(document.createElement('canvas'), { width: 500, height: 600 });
  { const g = INK.getContext('2d'), rng = mulberry32(seedOf(ID, 'ink')), vOf = (z) => (z - 0.080) / 0.030 * 600;
    g.lineCap = g.lineJoin = 'round';
    if (props.proxy) {
      g.strokeStyle = '#' + C('navy').lerp(C('cream'), 0.25).getHexString(); g.lineWidth = 4;
      for (const z of [0.093, 0.100, 0.107]) {
        g.beginPath(); g.arc(60, vOf(z), 9, 0.3, 5.9); g.stroke();
        g.beginPath(); for (let u = 0.3; u <= 0.88; u += 0.02) g.lineTo(u * 500, vOf(z) + (rng() - 0.5) * 6); g.stroke();
      }
    }
    g.strokeStyle = PALETTE.ink; g.lineWidth = 5;
    for (const [z, u0, u1] of [[0.086, 0.15, 0.60], [0.0915, 0.15, 0.55], [0.0985, 0.15, 0.40]]) {
      g.beginPath();
      for (let i = 0; i <= 90; i++) { const u = u0 + (u1 - u0) * i / 90, ph = i * 0.55;
        g.lineTo(u * 500 + 6 * Math.sin(ph * 1.3), vOf(z) - 9 * Math.sin(ph) * (0.6 + 0.4 * Math.sin(i * 0.21)) + (rng() - 0.5) * 2); }
      g.stroke();
    } }
  const inkTex = new THREE.CanvasTexture(INK); inkTex.colorSpace = THREE.SRGBColorSpace;
  const inkPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.030),
    new THREE.MeshLambertMaterial({ map: inkTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  flat(inkPlane).position.set(-0.0205, 0.00035, 0.095); inkPlane.receiveShadow = true; scene.add(inkPlane);

  const phoneDown = (pos, tag) => {                       // face-down: the back up, nothing glows
    const ph = new THREE.Group(); ph.position.set(...pos); scene.add(ph);
    flat(cut(props, 'phone_back', { parent: ph, tag })).position.y = 0.0004;
  };
  phoneDown(PHONE, ''); phoneDown(NB_PHONE, '-nbr');
  const pen = new THREE.Group(); scene.add(pen);          // origin at the tip (+x end)
  cut(props, 'pen', { parent: pen }).position.x = -0.006;
  flat(cut(props, 'pen_cap')).position.set(-0.030, 0.0008, 0.100);   // where s15 set it down

  // neighbor desk props: their page (the mirrored unit's), 3 energy drinks (s16)
  flat(cut(props, 'exam_page', { tag: '-nbr' })).position.set(NB + 0.0205, 0.0003, 0.095);
  [[0.245, -4, 0.095], [0.262, 0, 0.100], [0.280, 6, 0.105]].forEach(([x, a, z], i) => {
    const c = cut(props, 'energy_drink', { tag: `-${i}` }); c.position.set(x, 0.006, z); c.rotation.z = a * D;
  });

  // ---------- characters ----------
  const gator = await makeGator({ assets }, { res: 512 });
  gator.group.position.set(HIP[0], HIP[1], BODY_Z);
  scene.add(gator.group);

  // The pocket on this rig in the settled pose. Its joint is the pivot, the top centre of the visible shape: the rim.
  // The head (z +0.003) and the near arm on his lap (+0.012) cover the spec's in-pocket spot (x −0.060 is under the
  // arm here), so nothing would peek out. The pocket moves 3 mm forward (still behind the arm) and the blob sits between
  // head and pocket, in the pocket's left half, which the arm doesn't cross.
  gator.blend(P, BODY, 24); gator.group.updateMatrixWorld(true);
  const rim = gator.joints.pocket.getWorldPosition(new THREE.Vector3());
  gator.joints.pocket.position.z += 0.003;
  const IN_Z = BODY_Z + 0.0045, inL = rim.x - 0.0045;
  const CLIMB = [   // [t, centre]: one drawing per step, held between
    [8.75, [-0.046, 0.000, 0.088]], [9.5, [-0.050, 0.004, 0.088]], [10, [-0.055, 0.010, 0.088]],
    [10.5, [inL + 0.002, rim.y + 0.003, 0.088]],        // on the rim (spec (−0.059, 0.016) for rim y 0.014)
    [10.75, [inL, rim.y - 0.001, IN_Z]], [11, [inL, rim.y - 0.001, IN_Z]],
    // The spec sinks it out of sight at 12.0. The push-in has to find it, so it stays put and sleeps with its eyes
    // over the rim (the 12.000 bulge stays). Still nothing moves after 12.0.
    [12, [inL, rim.y - 0.001, IN_Z]],
  ];

  const nb = await makeCrowd({ assets }, 'neighbor', { seed: 16 });   // s16's figure
  nb.group.scale.x = -1;                                // faces −x, toward the hero
  nb.group.position.set(NB_HIP[0] - 0.025, NB_HIP[1], BODY_Z);   // s16's hip slid to the seat edge so the head reaches the desk
  nb.pose(specPose({ lean: 62, arm: -5, far: null, head: -12 }));
  scene.add(nb.group);
  const fg = await makeCrowd({ assets }, 'sleeper', { seed: 2 });
  fg.pose(POSES.crowd_sleep);
  fg.group.updateMatrixWorld(true);
  { const hc = new THREE.Box3().setFromObject(fg.meshes.head).getCenter(new THREE.Vector3());   // head centre → (0.120, 0.035)
    fg.group.position.set(FG.head[0] - hc.x, FG.head[1] - hc.y, FG.z); }
  scene.add(fg.group);

  const exam = createBlob({ radius: BLOB_R, seed: 1 });   // s16's blob (seed 1), at its last size
  exam.stain.position.set(BLOB0[0], 0.0004, BLOB0[1]);  // stays where it slept: the ring it leaves on the page corner
  scene.add(exam.mesh, exam.stain);
  const nbBlob = createBlob({ radius: OTHER_R.neighbor, seed: 13 });   // s16's
  nbBlob.mesh.position.set(NB_BLOB[0], 0, NB_BLOB[2]); nbBlob.stain.position.set(NB_BLOB[0], 0.0004, NB_BLOB[2]);
  const fgBlob = createBlob({ radius: OTHER_R.sleeper17, seed: 11 });
  fgBlob.mesh.position.set(FG.blob[0], 0, FG.blob[2]); fgBlob.stain.position.set(FG.blob[0], 0.0004, FG.blob[2]);
  scene.add(nbBlob.mesh, nbBlob.stain, fgBlob.mesh, fgBlob.stain);

  // ---------- light ----------
  // Motion-sensor zones (README §3). His and the neighbor's lit at constant level; the empty desk's trough hangs dead
  // (no light added). s16's dark housing card and level lip, so the camera looking down on them sees which is awake.
  const troughCard = new THREE.MeshBasicMaterial({ color: C('kraft').multiplyScalar(TROUGH_DARK) });
  const LIP = { dead: C('kraft').multiplyScalar(0.12), lit: C('cream').lerp(C('gator'), 0.15) };
  const trough = (z, level) => {
    z.group.traverse((m) => { if (m.isMesh && m !== z.tube) m.material = troughCard; });
    const lip = new THREE.Mesh(new THREE.PlaneGeometry(0.056, LIP_H), new THREE.MeshBasicMaterial({ color: LIP.dead.clone().lerp(LIP.lit, level) }));
    lip.position.set(0, 0.127 - 0.002 - LIP_H / 2, 0.0085); lip.castShadow = false; z.group.add(lip);
    scene.add(z.group);
  };
  const zones = Object.values(ZONES).map(([at, to]) => {
    const z = sensorLight({ at, aimAt: to, intensity: ZONE_I }); z.update(0); trough(z, 1);
    scene.add(z.light, z.light.target); return z;
  });
  { const z = sensorLight({ at: EMPTY_TUBE }); z.update(0, { timeoutAt: -10 }); trough(z, 0); }   // dead: tube dull
  const dawn = dawnLight();
  dawn.light.target.position.set(0.05, 0, 0.2); scene.add(dawn.light, dawn.light.target);
  const travel = new THREE.Vector3();
  const tubes = fluorescent({ intensity: FLUOR_I }); scene.add(tubes.light);   // flicker amplitude 0: update() never called
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);
  const ambSky = amb.color.clone(), ambWarm = C('cream').lerp(C('lamp'), 0.4);
  const fill = new THREE.PointLight(C('cream').lerp(C('gator'), 0.15), FILL_I, 0.07, 2);   // README §10, fluorescent tone (s16)
  fill.castShadow = false; fill.position.set(...UNIT.fill); scene.add(fill);
  const rimL = new THREE.PointLight(C('lamp').lerp(C('cream'), 0.35), 0, 0.06, 2);   // dawn gold, rises with the dawn
  rimL.castShadow = false; rimL.position.set(...RIM_AT); scene.add(rimL);

  // ---------- camera, post, grade ----------
  const camLook = V(CAM.look), camPos = V(CAM.pos), pushLook = V(PUSH.look);
  const pushPos = pushLook.clone().addScaledVector(camPos.clone().sub(camLook).normalize(), PUSH.dist);
  const look = new THREE.Vector3(), dir = new THREE.Vector3(), focusP = V(FOCUS);
  const fx = post({ focus: 1, aperture: 0.02, maxblur: 0.01 });
  function setCamera(t) {   // on 1s; locked until PUSH.from
    const e = ease((t - PUSH.from) / (PUSH.to - PUSH.from));
    camera.fov = CAM.fov + (PUSH.fov - CAM.fov) * e; camera.updateProjectionMatrix();
    camera.position.lerpVectors(camPos, pushPos, e); camera.lookAt(look.lerpVectors(camLook, pushLook, e));
    camera.updateMatrixWorld(true); camera.getWorldDirection(dir);
    fx.set({ focus: dir.dot(focusP.clone().sub(camera.position)) });
  }
  setCamera(0);
  // The grade crossfades amber (act 3) → dawn (Quiet 2) over 0–22: one LUT texture, rewritten when the 8-bit mix steps.
  const LA = loadLUT('amber').image, LB = loadLUT('dawn').image;
  const lut = new THREE.Data3DTexture(new Uint8Array(LA.data.length), LA.width, LA.height, LA.depth);
  Object.assign(lut, { format: THREE.RGBAFormat, type: THREE.UnsignedByteType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, wrapR: THREE.ClampToEdgeWrapping, unpackAlignment: 1 });
  let lutStep = -1;
  const setGrade = (k) => {
    const s = Math.round(clamp(k) * 255);
    if (s === lutStep) return; lutStep = s;
    const d = lut.image.data;
    for (let i = 0; i < d.length; i++) d[i] = Math.round(LA.data[i] + (LB.data[i] - LA.data[i]) * s / 255);
    lut.needsUpdate = true; fx.set({ lut });
  };

  const hand = new THREE.Vector3(), tmp = new THREE.Vector3();
  const hold = { light: null, boil: null };            // measure hooks: hold the light or the boil at a fixed local t
  let lastSeed = null, eyesNow = '';

  function update(t) {
    const tc = onTwos(t), tb = hold.boil ?? t, tl = hold.light ?? t;
    const seed = boilSeed(tb, 4);
    if (seed !== lastSeed) { lastSeed = seed; for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed })); }

    // hero
    for (const p of [gator, nb, fg]) p.boil(tb, 4);
    gator.blend(P, BODY, tc);
    eyesNow = heroEyes(tc);
    gator.face({ eyes: eyesNow, mouth: 'smile' });
    gator.meshes.pocket.scale.setScalar(Math.abs(tc - 12) < 1e-6 ? 1.05 : 1);   // the bulge, 12.000 drawing only
    gator.group.updateMatrixWorld(true);
    gator.hand.getWorldPosition(hand);

    // pen: in his hand (s15's 45° grip, tip on the fingertip) until 4.167, then on the page's front edge
    if (tc < PEN_DOWN) { pen.rotation.set(0, 0, -Math.PI / 4); pen.position.set(hand.x, hand.y + 0.0003, 0.0868); }
    else { pen.rotation.set(-Math.PI / 2, 0, 0); pen.position.set(-0.016, 0.0006, 0.106); }

    // light first (on 1s), so the blob reads this frame's key. Dawn elevation 3° → 40° and k 0.08 → 1 over 0–22, travelling +z with +10° toward +x
    const g = clamp(tl / GOLD_AT), el = (3 + 37 * g) * D, az = 10 * D, k = 0.08 + 0.92 * g;
    dawn.update(tl, k);
    dawn.light.intensity *= DAWN_K;
    travel.set(Math.sin(az) * Math.cos(el), -Math.sin(el), Math.cos(az) * Math.cos(el));
    dawn.light.position.copy(dawn.light.target.position).addScaledVector(travel, -1.5);
    amb.color.copy(ambSky).lerp(ambWarm, 0.5 * g);
    rimL.intensity = RIM_I * g;
    setCamera(t);
    for (const m of panes) m.material.color.copy(PANE.cold).lerp(PANE.gold, g).convertSRGBToLinear();
    setGrade(g);

    // blob
    const c = tc < 8.75 ? kf(tc, HOPS, lin) : CLIMB.filter(([k]) => k <= tc + 1e-6).at(-1)[1];
    const climbStep = CLIMB.some(([k]) => k > 8.75 && k < 10.75 && Math.abs(tc - k) < 1e-6);
    exam.mesh.visible = true;
    exam.mesh.position.set(c[0], c[1] - R, c[2]);
    exam.mesh.rotation.z = (tc >= 7.5 && tc < 8 + 4 / 12 ? 10 : 0) * D;   // tilted toward him while it watches
    exam.update(t, {
      squash: kf(tc, SQUASH, lin) + (climbStep ? 0.12 : 0) + (Math.abs(tc - 10.75) < 1e-6 ? -0.15 : 0),
      wobble: tc < 6.5 ? 0.4 : 1,
      eyes: tc < 6.5 || tc >= 11.5 ? 'closed' : 'open',
      key: tc < 8.75 ? zones[0].light : tc < 10.5 ? dawn.light : rimL,
    });
    for (const b of [nbBlob, fgBlob]) b.update(0, { eyes: 'closed', wobble: 0 });   // still drawings

  }

  // For evidence/anim-s17/measure.html: world points, and the state that must hold still after the 12.000 drawing.
  const mat = (o) => o.matrixWorld.elements.map((x) => x.toFixed(7)).join(',');
  const probe = () => ({
    hand: hand.toArray(), pocket: [rim.x, rim.y, 0.080], head: gator.meshes.head.getWorldPosition(tmp).toArray(),
    nbHead: new THREE.Box3().setFromObject(nb.meshes.head).getCenter(new THREE.Vector3()).toArray(),
    blob: exam.mesh.visible ? exam.mesh.position.toArray() : null,
    cam: mat(camera) + '|' + camera.projectionMatrix.elements.join(','),
    state: [gator, nb, fg].map((p) => Object.values(p.meshes).map((m) => `${m.visible}:${mat(m)}`).join(';')).join('|')
      + `|blob ${exam.mesh.visible}:${mat(exam.mesh)}|eyes ${eyesNow}`,
  });
  return { update, probe, hold, dawn: dawn.light, blob: exam.mesh, nbBlob: nbBlob.mesh };
}
