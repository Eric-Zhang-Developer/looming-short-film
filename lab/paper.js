// Lab for src/paper.js: one sheet per weight (cardstock, kraft, tissue, vellum) and a painted lamp from the style
// tile, in front of a navy wall, under one soft overhead light and one low side light. Edges boil at 10 Hz.
// t picks the view, so render.mjs sheets can pull every view from one page (each view is 10 s long):
//   [0,10) all five   [10,20) cardstock edge   [20,30) kraft   [30,40) tissue   [40,50) vellum
//   [50,60) painted lamp as paper (left) beside the raw cut-out art with no tear (right)
// The lamp comes from assets/raw/style_tile_v1.png (unfrozen, gitignored): copy it there from the main checkout.
import * as THREE from 'three';
import { createStage, exposeForRender } from '../src/core/stage.js';
import { PALETTE } from '../src/core/palette.js';
import { makePaper, boilSeed } from '../src/paper.js';

const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color(PALETTE.navy);

const wall = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2), new THREE.MeshLambertMaterial({ color: PALETTE.navy }));
wall.position.set(0, 0.08, 0); wall.receiveShadow = true; scene.add(wall);
scene.add(new THREE.HemisphereLight(PALETTE.navy, PALETTE.kraft, 0.6));

const over = new THREE.DirectionalLight(PALETTE.cream, 3.2);           // soft overhead
over.position.set(0.1, 1, 0.7); over.castShadow = true;
over.shadow.mapSize.set(2048, 2048); over.shadow.radius = 4; over.shadow.bias = -0.0005;
Object.assign(over.shadow.camera, { left: -0.5, right: 0.5, top: 0.4, bottom: -0.3, near: 0.1, far: 3 });
const side = new THREE.SpotLight(PALETTE.cream, 0.6, 0, 0.9, 0.8, 2);  // low, from the left
side.position.set(-0.7, 0.02, 0.3); side.target.position.set(0, 0.06, 0.03); side.castShadow = true;
side.shadow.mapSize.set(2048, 2048); side.shadow.radius = 3; side.shadow.bias = -0.0005;
scene.add(over, side, side.target);

const H = 0.13, Z = 0.03;
const QUAD = [[0.1, 0.12], [0.9, 0.08], [0.88, 0.9], [0.12, 0.88]];
const pieces = [
  { weight: 'cardstock', color: PALETTE.gator, x: -0.26 },
  { weight: 'kraft', color: PALETTE.kraft, x: -0.13 },
  { weight: 'tissue', color: PALETTE.lamp, x: 0 },
  { weight: 'vellum', color: PALETTE.cream, x: 0.13 },
  { weight: 'cardstock', x: 0.26, lamp: true },
];
const mesh = (sheet) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(...sheet.size),
    new THREE.MeshLambertMaterial({ map: sheet.map, alphaMap: sheet.alphaMap, alphaTest: 0.5, side: THREE.DoubleSide }));
  m.castShadow = true; scene.add(m); return m;  // no self-shadow: the grazing side light striped the planes
};
const opts = (p, seed) => p.lamp
  ? { art: p.art, weight: p.weight, size: [H, H], key: 'lab-lamp', seed }
  : { path: QUAD, color: p.color, weight: p.weight, size: [0.1, H], key: 'lab-' + p.weight, seed };

let raw;  // the lamp art with only its own alpha, for the painted comparison
stage.ready = (async () => {
  const img = new Image(); img.src = '/assets/raw/style_tile_v1.png'; await img.decode();
  const c = Object.assign(document.createElement('canvas'), { width: 330, height: 420 }), ctx = c.getContext('2d');
  ctx.drawImage(img, 1300, 210, 330, 420, 0, 0, 330, 420);
  ctx.clearRect(290, 250, 40, 170);  // the laptop's corner pokes into this box
  pieces[4].art = await createImageBitmap(c);
  pieces.forEach((p, i) => {
    p.mesh = mesh(makePaper(opts(p, 0)));
    p.mesh.position.set(p.x, 0.08, Z);
    p.mesh.rotation.set(0, [0.06, -0.05, 0.08, -0.07, 0.04][i], [0.015, -0.01, 0.02, -0.015, 0.0][i]);  // nothing is flat
  });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  raw = new THREE.Mesh(new THREE.PlaneGeometry(H * 330 / 420, H), new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
  raw.position.set(0.40, 0.08, Z); raw.castShadow = true; scene.add(raw);
})();

stage.onFrame((t) => {
  const seed = boilSeed(t, 10), view = Math.min(5, Math.floor(t / 10));
  for (const p of pieces) {
    const s = makePaper(opts(p, seed)), m = p.mesh.material;
    if (m.map !== s.map) { m.map = s.map; m.alphaMap = s.alphaMap; m.needsUpdate = true; }
  }
  raw.visible = view === 5;
  if (view === 0) { camera.position.set(0, 0.08, 1.15); camera.lookAt(0, 0.08, Z); }
  else if (view < 5) {  // the piece's top-right corner, about 2 screen px per texel
    const x = pieces[view - 1].x + 0.03, y = 0.08 + 0.042;
    camera.position.set(x, y, Z + 0.15); camera.lookAt(x, y, Z);
  } else { camera.position.set(0.33, 0.08, 0.45); camera.lookAt(0.33, 0.08, Z); }
});

exposeForRender(stage, { duration: 60, fps: 24 });
