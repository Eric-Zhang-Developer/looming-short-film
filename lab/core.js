// Lab for src/core: a cream wall, a kraft floor, one SpotLight and a box that slides on kf and wobbles on spring.
// It only proves the stage, palette and easing work. window.renderFrame(t) for t in [0, 3].
import * as THREE from 'three';
import { createStage, exposeForRender } from '../src/core/stage.js';
import { PALETTE } from '../src/core/palette.js';
import { kf, spring } from '../src/core/ease.js';

const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color(PALETTE.navy);
camera.position.set(0, 0.35, 2.6);
camera.lookAt(0, 0.2, 0.2);

const plane = (w, h, color) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ color: PALETTE[color] }));
  m.receiveShadow = true; scene.add(m); return m;
};
plane(1.6, 0.9, 'cream').position.set(0, 0.45, 0);                    // wall at z = 0
const floor = plane(1.6, 0.6, 'kraft');
floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0.3);

const spot = new THREE.SpotLight(PALETTE.lamp, 6, 0, 0.6, 0.4, 2);
spot.position.set(0.5, 0.9, 1.1);
spot.target.position.set(0, 0.15, 0.2);
spot.castShadow = true;
spot.shadow.mapSize.set(2048, 2048);
spot.shadow.camera.near = 0.3; spot.shadow.camera.far = 3;
spot.shadow.radius = 3; spot.shadow.bias = -0.0005;
scene.add(spot, spot.target);

const S = 0.08;
const box = new THREE.Mesh(new THREE.BoxGeometry(S, S, S).translate(0, S / 2, 0), new THREE.MeshLambertMaterial({ color: PALETTE.gator }));
box.castShadow = true; box.receiveShadow = true; box.position.z = 0.3;
scene.add(box);

stage.onFrame((t) => {
  box.position.x = kf(t, [[0, -0.4], [1.4, 0.25], [2.5, 0.1]]);  // slide, then a small step back
  box.rotation.z = 0.5 * (spring(t, 1.4) + spring(t, 2.5));       // wobble when each move lands
  box.position.y = (S / 2) * Math.abs(Math.sin(box.rotation.z)); // keep the low corner on the floor
});

exposeForRender(stage, { duration: 3 });
