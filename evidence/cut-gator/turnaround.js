// cut-gator evidence page: the cut gator next to the frozen figure, flat-lit on grey.
//   t 0: the frozen sheet's turn_side as one flat piece   t 1: side rig, stand   t 2: side rig, head34(true)
//   t 3: front rig   t 4: back rig   t 5..10: side head close-ups, eyes open/closed/tired/gasp/worried/side
//   t 11: front close-up, eyes tired (s10)   t 12: side rig seated at s15's desk unit, pose 'press'
//   t 13: freshman (proxy sheet) and both roommates, tinted, at their scales
//   t 14 / 15: the head piece flat and unlit on navy, no paper.js: 14 the cut PNG as cut.mjs wrote it, 15 the loader's
//   despilled bitmap (assets.js despill). For halo.jpg's raw row.
// Cells 0–4 share one camera, so sizes compare across them.
import * as THREE from 'three';
import { createStage, exposeForRender } from '/src/core/stage.js';
import * as assets from '/src/assets.js';
import { makePaper } from '/src/paper.js';
import { paperMesh } from '/src/material.js';
import { makeGator, hipHeight } from '/src/characters/gator.js';
import { makeFreshman } from '/src/characters/freshman.js';
import { makeRoommateTall, makeRoommateRound } from '/src/characters/roommates.js';
import { POSES } from '/src/characters/poses.js';

const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color('#7d8088');
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(-0.3, 0.5, 1);
scene.add(key, new THREE.AmbientLight(0xffffff, 1.2));
const ctx = { assets };

const ready = (async () => {
  const side = await makeGator(ctx, { res: 1024 }), front = await makeGator(ctx, { facing: 'front', res: 1024 }), back = await makeGator(ctx, { facing: 'back' });
  const fresh = await makeFreshman(ctx), tall = await makeRoommateTall(ctx), round = await makeRoommateRound(ctx);
  const g = await assets.load('gator_sheet'), [u0, v0, u1, v1] = g.visible.turn_side, [W, H] = g.sizes.turn_side;
  const fig = paperMesh(makePaper({ art: g.pieces.turn_side, size: [W, H], key: 'cutgator-fig', res: 1024 }));
  fig.position.set((0.5 - (u0 + u1) / 2) * W + 0.0, (v1 - 0.5) * H, 0);  // visible box: bottom at y 0, centred on x 0
  const rigs = { side, front, back, fresh, tall, round };
  const raw = await new THREE.TextureLoader().loadAsync('/assets/cut/gator_sheet_head.png');
  const flat = (tex) => { tex.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(0.044, 0.044 * 192 / 220),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(0.3, 0, 0); scene.add(m); return m; };
  const before = flat(raw), after = flat(new THREE.CanvasTexture(Object.assign(document.createElement('canvas'), { width: 220, height: 192 })));
  after.material.map.image.getContext('2d').drawImage(g.pieces.head, 0, 0); after.material.map.needsUpdate = true;
  for (const r of Object.values(rigs)) scene.add(r.group);
  scene.add(fig);
  // halo numbers for the done note: mean colour of the fringe (16 <= alpha < 128) in each cut PNG and in the loader's bitmap
  const pixels = (src) => { const c = Object.assign(document.createElement('canvas'), { width: src.width, height: src.height }), x = c.getContext('2d');
    x.drawImage(src, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
  const fringe = (d) => { const m = [0, 0, 0]; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 16 && d[i + 3] < 128) { n++; for (let j = 0; j < 3; j++) m[j] += d[i + j]; }
    return `n ${n} rgb(${m.map((v) => Math.round(v / n)).join(',')})`; };
  for (const [sheet, a] of [['gator_sheet', g], ['face_sheet', await assets.load('face_sheet')]]) for (const [n, bmp] of Object.entries(a.pieces)) {
    const img = new Image(); img.src = `/assets/cut/${sheet}_${n}.png`; await img.decode();
    console.warn(`halo ${sheet}_${n}: cut.mjs ${fringe(pixels(img))} -> loader ${fringe(pixels(bmp))}`);
  }
  return { rigs, fig, before, after };
})();
stage.ready = ready;
let L = null;
ready.then((r) => { L = r; });

const look = (cx, cy, h) => { camera.position.set(cx, cy, h / 2 / Math.tan(10 * Math.PI / 180)); camera.lookAt(cx, cy, 0); };
const EYES = ['open', 'closed', 'tired', 'gasp', 'worried', 'side'], MOUTHS = ['neutral', 'smile', 'o', 'line', 'smile', 'neutral'];

stage.onFrame((t) => {
  const { rigs, fig, before, after } = L, i = Math.round(t);
  before.visible = i === 14; after.visible = i === 15; scene.background.set(i >= 14 ? '#1E2440' : '#7d8088');
  for (const r of Object.values(rigs)) { r.group.visible = false; r.group.position.set(0, 0, 0); r.boil(0); }
  fig.visible = false;
  rigs.side.head34(false);
  rigs.side.face({ eyes: 'open', mouth: 'neutral' }); rigs.front.face({ eyes: 'open', mouth: 'neutral' });
  const show = (n, pose, y = 0, x = 0) => { const r = rigs[n]; r.group.visible = true; r.group.position.set(x, y, 0); if (pose) r.blend(POSES, [[0, pose]], 0); return r; };
  if (i === 0) { fig.visible = true; look(0, 0.05, 0.12); }
  else if (i === 1 || i === 2) { show('side', 'stand', hipHeight(POSES.stand), -0.01); rigs.side.head34(i === 2); look(0, 0.05, 0.12); }
  else if (i === 3) { show('front', 'stand_front'); look(0, 0.05, 0.12); }
  else if (i === 4) { show('back', 'stand_back'); look(0, 0.05, 0.12); }
  else if (i <= 10) {
    show('side', 'stand', hipHeight(POSES.stand), -0.01);
    rigs.side.face({ eyes: EYES[i - 5], mouth: MOUTHS[i - 5] });
    look(0.018, 0.075, 0.045);
  } else if (i === 11) { show('front', 'stand_front'); rigs.front.face({ eyes: 'tired', mouth: 'line' }); look(0, 0.08, 0.04); }
  else if (i === 12) { show('side', 'press', 0.022); look(0.02, 0.05, 0.12); }
  else if (i >= 14) look(0.3, 0, 0.05);
  else { show('fresh', 'stand', hipHeight(POSES.stand) * 0.85, -0.05); show('tall', 'tall_stand', 0.027, 0.03); show('round', 'round_mash_a', 0, 0.12); look(0.04, 0.05, 0.16); }
});
exposeForRender(stage, { duration: 16 });
