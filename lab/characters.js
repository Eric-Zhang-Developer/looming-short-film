// Lab for src/characters/: every rig and every named pose, on proxies until frozen art lands.
// window.renderFrame(t) picks the view:
//   t in [0, N): pose i = floor(t) of POSES (in table order) on the rig POSE_INFO names, flat-lit on cream so the
//                silhouette reads; seated side poses get a chair, the desk edge and the lamp stem + knob for context.
//   t = N:       the side gator with head34(true) (s14's swap).
//   t in [1000, 1001): the cast side by side at scale (bottom row side views + the Exam's s16 shrink steps,
//                top row the s13 top-view figures).
//   t >= 2000:   every walk set walking in place: side, front, back, tall, stoop (step 1/3 s, from t0 = 2000).
// window.lab = { rigs, POSES, NAMES, walk } for evidence/char-rigs/walk_loop.mjs.
import * as THREE from 'three';
import { createStage, exposeForRender } from '/src/core/stage.js';
import { PALETTE } from '/src/core/palette.js';
import * as assets from '/src/assets.js';
import { makePaper } from '/src/paper.js';
import { paperMesh } from '/src/material.js';
import { makeGator, HIP as GHIP, hipHeight } from '/src/characters/gator.js';
import { makeFreshman } from '/src/characters/freshman.js';
import { makeRoommateTall, makeRoommateRound } from '/src/characters/roommates.js';
import { makeCustodian, makeCart } from '/src/characters/custodian.js';
import { makeCrowd, makeHeroTop, makeSeated } from '/src/characters/crowd.js';
import { makeExam, SHRINK } from '/src/characters/exam.js';
import { POSES, POSE_INFO, walk } from '/src/characters/poses.js';

const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color(PALETTE.cream);
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(-0.3, 0.5, 1);
scene.add(key, new THREE.AmbientLight(0xffffff, 1.2));

const ctx = { assets };
const NAMES = Object.keys(POSES);
const FLOOR = new Set(['kneel_reach', 'kneel_antic', 'inspect', 'place', 'shake_a', 'shake_b', 'sit_heels', 'stand', 'look_up', 'sigh', 'nod',
  'drill_a', 'drill_b', 'blow', 'crouch', 'lift_rod', 'tug', 'pull_curtain', 'prone', 'prone_flick', 'yawn', 'walk_side_a', 'walk_side_pass', 'walk_side_b', 'walk_side_pass_b']);
const HIP = 0.022;  // seated hip height above the floor (s15: hip −0.012, floor −0.034)

async function build() {
  const rigs = {
    gator: await makeGator(ctx), front: await makeGator(ctx, { facing: 'front' }), back: await makeGator(ctx, { facing: 'back' }),
    freshman: await makeFreshman(ctx), tall: await makeRoommateTall(ctx), round: await makeRoommateRound(ctx),
    custodian: await makeCustodian(ctx), cart: await makeCart(ctx),
    neighbor: await makeCrowd(ctx, 'neighbor'), sleeper: await makeCrowd(ctx, 'sleeper'), heroTop: await makeHeroTop(ctx),
  };
  for (let n = 1; n <= 6; n++) rigs['seated' + n] = await makeSeated(ctx, n, { seed: n });
  for (const r of Object.values(rigs)) scene.add(r.group);
  const exams = SHRINK.map((_, n) => { const e = makeExam({ shot: 's16', seed: 1 }); e.mesh.scale.setScalar(e.scaleAt(n)); scene.add(e.mesh); return e; });

  // Context for seated poses: chair, desk edge, lamp stem and knob (s15 unit relative to the hip, plain paper).
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const flat = (k, color, [x0, y0, x1, y1], z) => {
    const m = paperMesh(makePaper({ path: RECT, color, size: [x1 - x0, y1 - y0], key: 'charlab-' + k, res: 256 }));
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z); m.castShadow = false; return m;
  };
  const context = new THREE.Group();
  context.add(flat('chair', PALETTE.kraft, [-0.017, 0, 0.015, HIP - 0.001], -0.006), flat('desk', PALETTE.kraft, [0.042, 0, 0.17, 0.034], -0.012),
    flat('stem', PALETTE.navy, [0.053, 0.034, 0.057, 0.104], -0.009), flat('knob', PALETTE.navy, [0.0512, 0.0558, 0.0532, 0.0578], -0.008));
  const floor = flat('floor', PALETTE.kraft, [-0.3, -0.03, 1.3, 0], -0.02);
  scene.add(context, floor);
  return { rigs, exams, context, floor };
}

const ready = build();
stage.ready = ready;
let L = null;
ready.then((r) => { L = r; window.lab = { ...r, POSES, NAMES, walk }; });

const look = (cx, cy, h) => {  // frame a box of height h centred on (cx, cy)
  camera.position.set(cx, cy, h / 2 / Math.tan(10 * Math.PI / 180) + 0.02);
  camera.lookAt(cx, cy, 0);
};
const FRAME = {
  gator: [0.03, 0.045, 0.1], freshman: [0.03, 0.04, 0.09], neighbor: [0.03, 0.045, 0.1], sleeper: [0.03, 0.045, 0.1],
  front: [0, 0.042, 0.095], back: [0, 0.042, 0.095], tall: [0.01, 0.065, 0.16], round: [0, 0.045, 0.11],
  custodian: [0, 0.04, 0.1], heroTop: [0, -0.005, 0.11],
};
const ROOT_Y = { tall: 0.027, gator: GHIP, freshman: GHIP * 0.85 };
const LIFT = { prone: 0.012, prone_flick: 0.012, yawn: 0.012 };  // a pose can't carry translation: the shot lifts the root
const FACES = ['gator', 'front', 'freshman', 'tall', 'round'];

stage.onFrame((t) => {
  const { rigs, exams, context, floor } = L;
  floor.visible = true;
  for (const r of Object.values(rigs)) { r.group.visible = false; r.group.position.set(0, 0, 0); r.group.rotation.set(0, 0, 0); r.boil(t); }
  for (const f of FACES) rigs[f].face({ eyes: 'open', mouth: 'neutral' });
  rigs.heroTop.face({ eyes: 'open' });
  rigs.gator.head34(false);
  for (const e of exams) { e.mesh.visible = false; e.update(t, { wobble: 1 }); }
  context.visible = false;
  const show = (name, x, y, pose) => { const r = rigs[name]; r.group.visible = true; r.group.position.set(x, y, 0); if (pose) r.blend(POSES, [[0, pose]], 0); return r; };

  if (t < 1000) {  // one pose per cell
    const i = Math.floor(t), name = NAMES[Math.min(i, NAMES.length - 1)], rig = i < NAMES.length ? POSE_INFO[name].rig : 'gator';
    const seated = ['gator', 'freshman', 'neighbor', 'sleeper'].includes(rig) && !FLOOR.has(name);
    show(rig, 0, seated ? HIP : rig === 'gator' ? Math.max(LIFT[name] ?? 0, hipHeight(POSES[name])) : (ROOT_Y[rig] ?? LIFT[name] ?? 0), i < NAMES.length ? name : 'sit');
    if (i >= NAMES.length) rigs.gator.head34(true);
    context.visible = seated;
    floor.visible = rig !== 'heroTop';
    look(...FRAME[rig]);
  } else if (t < 2000) {  // the cast, at scale
    const row = [['gator', 0, 'stand'], ['front', 0.08, 'stand_front'], ['back', 0.14, 'stand_back'], ['freshman', 0.21, 'stand'],
      ['tall', 0.31, 'tall_stand'], ['round', 0.43, 'round_mash_a'], ['custodian', 0.55, 'walk_stoop_pass'], ['cart', 0.63, null],
      ['neighbor', 0.73, 'crowd_hunch'], ['sleeper', 0.82, 'crowd_sleep']];
    for (const [n, x, p] of row) show(n, x, ROOT_Y[n] ?? 0, p);
    exams.forEach((e, k) => { e.mesh.visible = true; e.mesh.position.set(0.9 + k * 0.026, 0, 0); });
    show('heroTop', 0.2, 0.15, 'top_head_up');
    for (let n = 1; n <= 6; n++) show('seated' + n, 0.28 + n * 0.07, 0.15, null);
    look(0.5, 0.1, 0.68);
  } else {  // every walk set walking in place
    const sets = [['gator', 'side', 0], ['front', 'front', 0.09], ['back', 'back', 0.16], ['tall', 'tall', 0.25], ['custodian', 'stoop', 0.36]];
    for (const [n, set, x] of sets) {
      const { keys, lift, hip } = walk(t, { set, t0: 2000 }), r = show(n, x, hip ?? (ROOT_Y[n] ?? 0) + lift, null);
      r.blend(POSES, keys, t);
    }
    look(0.17, 0.09, 0.26);
  }
});

exposeForRender(stage, { duration: 2010 });

// Draws one rig alone (root at the origin) through an orthographic camera at 0.05 mm/px on cream and returns the box
// around every non-background pixel, in meters: what the paper actually shows, torn edges included.
// opts: keys + t (a blend instead of one pose), y (root height), parts (draw only these parts).
window.probe = async (rigName, pose, { t = 0, keys = [[0, pose]], y = 0, parts = null } = {}) => {
  await ready;
  const { renderer } = stage, PX = 0.00005, W = 3000, H = 3000;
  window.renderFrame(t);
  L.floor.visible = false; L.context.visible = false; L.exams.forEach((e) => (e.mesh.visible = false));
  for (const r of Object.values(L.rigs)) r.group.visible = false;
  const r = L.rigs[rigName]; r.group.visible = true; r.group.position.set(0, y, 0); r.blend(POSES, keys, t);
  const drawn = parts ?? Object.keys(r.meshes).filter((n) => n !== 'head34');
  for (const [n, m] of Object.entries(r.meshes)) m.visible = drawn.includes(n);
  const cam = new THREE.OrthographicCamera(-W * PX / 2, W * PX / 2, 0.1, 0.1 - H * PX, 0.01, 10);
  cam.position.set(0, 0, 1);
  const rt = new THREE.WebGLRenderTarget(W, H), px = new Uint8Array(W * H * 4);
  renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); renderer.setRenderTarget(null);
  rt.dispose();
  for (const [n, m] of Object.entries(r.meshes)) m.visible = n !== 'head34';
  const B = [px[0], px[1], px[2]];  // a corner is always background
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (Math.abs(px[i] - B[0]) + Math.abs(px[i + 1] - B[1]) + Math.abs(px[i + 2] - B[2]) < 12) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  // readRenderTargetPixels rows run bottom-up: row y is at world 0.1 − H·PX + (y + 0.5)·PX
  const wy = (y) => 0.1 - H * PX + (y + 0.5) * PX, wx = (x) => -W * PX / 2 + (x + 0.5) * PX;
  return { bottom: wy(y0), top: wy(y1), left: wx(x0), right: wx(x1), height: wy(y1) - wy(y0) };
};
