// Lab for src/post.js: three paper layers at different depths. t in [0, 3] pulls focus front -> back;
// then each LUT holds 1.5 s (night, marston, amber, dawn). window.renderFrame(t) for t in [0, 9].
import * as THREE from 'three';
import { createStage, exposeForRender } from '../src/core/stage.js';
import { PALETTE } from '../src/core/palette.js';
import { kf } from '../src/core/ease.js';
import { createPost } from '../src/post.js';

const stage = createStage();
const { scene, camera } = stage;
camera.position.set(0, 0.45, 2.6);
camera.lookAt(0, 0.45, 0);

const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
const add = (geo, c, x, y, z) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); scene.add(m); return m; };
// A layer = a backing sheet plus a grid of dots, so blur has something to chew on. Layers are staggered so none hides another.
const layer = (z, x0, w, h, base, ink, cols, rows, r) => {
  add(new THREE.PlaneGeometry(w, h), base, x0, 0.45, z);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++)
    add(new THREE.CircleGeometry(r, 24), ink, x0 + (i - (cols - 1) / 2) * r * 3, 0.45 + (j - (rows - 1) / 2) * r * 3, z + 0.002);
};
layer(-0.3, 0, 2.4, 1.4, PALETTE.cream, PALETTE.navy, 26, 14, 0.03);   // back wall, 2.9 m from camera
layer(0.3, 0.2, 0.5, 0.5, PALETTE.kraft, PALETTE.cream, 5, 5, 0.025);   // middle shelf, 2.3 m
layer(1.0, -0.2, 0.3, 0.45, PALETTE.gator, PALETTE.cream, 3, 4, 0.03);  // front cutout, 1.6 m

scene.add(new THREE.HemisphereLight(PALETTE.cream, PALETTE.navy, 1.4));
const sun = new THREE.DirectionalLight(PALETTE.cream, 1.8);
sun.position.set(0.6, 1, 2); scene.add(sun);

const post = createPost(stage, { focus: 1.6, aperture: 0.02, maxblur: 0.01 });
const LUTS = ['night', 'marston', 'amber', 'dawn'];
stage.onFrame((t) => {
  post.set({
    focus: kf(t, [[0, 1.6], [3, 2.9]]),
    lut: t < 3 ? null : LUTS[Math.min(3, Math.floor((t - 3) / 1.5))],
  });
});

window.lab = { stage, post };
exposeForRender(stage, { duration: 9 });
