// Lab for src/material.js. Three sets side by side in one scene; t picks the view, so render.mjs pulls every view
// from one page. Every sheet boils at 10 Hz through updatePaperMesh.
//   [0,5)   lampshades lit from inside by lampLight: tissue (left) and cardstock (right), material as shipped
//   [5,10)  the same with translucency and edge catch off (plain Lambert)
//   [10,20) a cardstock cutout with a torn edge and three holes, lamp in front, shadow on a cream wall
//   [20,25) torn rims lit from behind: cardstock (left) and tissue (right), edge catch on
//   [25,30) the same with edge catch off
//   [30,40) the shadow set under a PointLight (tests customDistanceMaterial)
// window.lab exposes the meshes for evidence/mod-material/checks.mjs.
import * as THREE from 'three';
import { createStage, exposeForRender } from '../src/core/stage.js';
import { PALETTE } from '../src/core/palette.js';
import { makePaper, boilSeed } from '../src/paper.js';
import { paperMesh, updatePaperMesh } from '../src/material.js';
import { lampLight, ambient, placeForScale, aim } from '../src/lights.js';

const stage = createStage();
const { scene, camera, renderer } = stage;
scene.background = new THREE.Color(PALETTE.navy);
scene.add(ambient());

const pieces = [];  // { mesh, opts, on: { translucency, edgeCatch } }
function piece(opts, set, at, matOpts) {
  const mesh = paperMesh(makePaper({ ...opts, seed: 0 }), matOpts);
  mesh.position.set(...at); set.add(mesh);
  const u = mesh.material.userData.paper;
  pieces.push({ mesh, opts, on: { translucency: u.uTranslucency.value, edgeCatch: u.uEdgeCatch.value } });
  return mesh;
}
function wall(set, color, x, z = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, 0, z); m.receiveShadow = true; set.add(m); return m;
}
const sets = [new THREE.Group(), new THREE.Group(), new THREE.Group()];
scene.add(...sets);
const X = [-1.5, 0, 1.5];  // set centers, far enough apart that each set's lights miss the others

// ---------- set 0: lampshades lit from inside ----------
const SHADE = [[0.27, 0.06], [0.73, 0.06], [0.95, 0.94], [0.05, 0.94]];
wall(sets[0], PALETTE.navy, X[0], -0.1);
[['tissue', -0.08], ['cardstock', 0.08]].forEach(([weight, dx]) => {
  piece({ path: SHADE, color: PALETTE.cream, weight, size: [0.12, 0.1], key: 'mat-shade-' + weight }, sets[0], [X[0] + dx, 0, 0.1]);
  const lamp = lampLight({ intensity: 0.03, angle: 1.1, penumbra: 0.6 });
  lamp.light.position.set(X[0] + dx, -0.005, 0.06);  // inside the shade, 4 cm behind its front panel
  lamp.light.target.position.set(X[0] + dx, -0.005, 0.5);
  sets[0].add(lamp.light, lamp.light.target);
});

// ---------- set 1: cutout shadow on the wall ----------
const cut = document.createElement('canvas'); cut.width = 400; cut.height = 360;
{
  const g = cut.getContext('2d');
  g.fillStyle = PALETTE.gator;
  g.beginPath(); g.ellipse(190, 200, 150, 120, -0.15, 0, Math.PI * 2); g.fill();          // body
  g.beginPath(); g.ellipse(300, 110, 85, 70, 0.3, 0, Math.PI * 2); g.fill();              // head
  g.globalCompositeOperation = 'destination-out';
  for (const [x, y, r] of [[285, 95, 16], [335, 115, 13], [160, 215, 34]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
}
wall(sets[1], PALETTE.cream, X[1]);
const SUBJECT = new THREE.Vector3(X[1], 0, 0.12);
const lamp1 = lampLight({ intensity: 0.12, angle: 0.5, penumbra: 0.25 });
lamp1.light.position.copy(placeForScale({ subjectPos: SUBJECT, wallZ: 0, scale: 2.2, height: 0.03, side: -0.04 }));
sets[1].add(lamp1.light, lamp1.light.target);
const point = new THREE.PointLight(PALETTE.lamp, 0.12, 0, 2);
point.position.copy(lamp1.light.position); point.castShadow = true;
point.shadow.mapSize.set(1024, 1024); point.shadow.radius = 2; point.shadow.bias = -0.0003;
point.shadow.camera.near = 0.01; point.shadow.camera.far = 1;  // the default near (0.5) clips this whole set
sets[1].add(point);

// ---------- set 2: torn rims lit from behind ----------
wall(sets[2], PALETTE.navy, X[2], -0.1);
const rimLight = lampLight({ intensity: 0.01, angle: 1.3, penumbra: 0.3 });
rimLight.light.position.set(X[2], 0, 0.02);
rimLight.light.target.position.set(X[2], 0, 1);
sets[2].add(rimLight.light, rimLight.light.target);

let cutout;
stage.ready = (async () => {
  const art = await createImageBitmap(cut);
  cutout = piece({ art, weight: 'cardstock', size: [0.09, 0.09], key: 'mat-cutout' }, sets[1], SUBJECT.toArray());
  aim(lamp1.light, cutout);
  piece({ path: SHADE.map(([x, y]) => [y, x]), color: PALETTE.gator, weight: 'cardstock', size: [0.08, 0.08], key: 'mat-rim-card' }, sets[2], [X[2] - 0.045, 0, 0.06]);
  piece({ path: SHADE.map(([x, y]) => [1 - y, x]), color: PALETTE.lamp, weight: 'tissue', size: [0.08, 0.08], key: 'mat-rim-tissue' }, sets[2], [X[2] + 0.045, 0, 0.06]);
  window.lab = { scene, renderer, pieces, cutout, lamp: lamp1.light, point };
})();

stage.onFrame((t) => {
  const seed = boilSeed(t, 10);
  const view = t < 10 ? 0 : t < 20 ? 1 : t < 30 ? 2 : 3;
  const set = view === 3 ? 1 : view;
  const off = (t >= 5 && t < 10) || (t >= 25 && t < 30);
  for (const p of pieces) {
    updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed }));
    const u = p.mesh.material.userData.paper;
    u.uTranslucency.value = off ? 0 : p.on.translucency;
    u.uEdgeCatch.value = off ? 0 : p.on.edgeCatch;
  }
  sets.forEach((s, i) => { s.visible = i === set; });
  lamp1.light.visible = view === 1;
  point.visible = view === 3;
  const c = [[X[0], 0, 0.75], [X[1] - 0.02, 0, 0.85], [X[2], 0, 0.55]][set];
  camera.position.set(...c); camera.lookAt(c[0], 0, 0);
});

exposeForRender(stage, { duration: 40, fps: 24 });
