// climax-a1 evidence: src/clock.js set to the brief's readings, one per integer t (flat-lit, face-on).
//   0 home 9:00   1 home 1:45   2 home 3:00:00   3 home 3:00:09   4 home 4:10   5 exam 9:00
// t 10 + f/24 (f 0..30): the home clock running from 3:00:00 at 24 fps, to show the step and its one-frame overshoot.
// Each cell logs the measured pivots and reaches once (console).
import * as THREE from 'three';
import { createStage, exposeForRender } from '/src/core/stage.js';
import * as assets from '/src/assets.js';
import { makeClock } from '/src/clock.js';

const stage = createStage(), { scene, camera } = stage;
scene.background = new THREE.Color('#7d8088');
const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(-0.3, 0.4, 1);
scene.add(key, new THREE.AmbientLight(0xffffff, 1.3));
camera.position.set(0, 0, 0.0145 / Math.tan(10 * Math.PI / 180)); camera.lookAt(0, 0, 0);
const READ = [[9, 0, 0.5], [1, 45, 0.5], [3, 0, 0.5], [3, 0, 9.5], [4, 10, 0.5], [9, 0, 0.5]];
let home, exam;
stage.ready = (async () => {
  home = await makeClock({ assets }, { seed: 1 }); exam = await makeClock({ assets }, { seed: 2, face: 'exam' });
  scene.add(home.group, exam.group);
  console.warn('clock', JSON.stringify(home.group.userData.clock));
})();
stage.onFrame((t) => {
  const i = Math.round(t), c = i === 5 ? exam : home;
  home.group.visible = c === home; exam.group.visible = c === exam;
  if (t >= 9.9) home.set(3, 0, t - 10); else c.set(...READ[i]);
  c.boil(0);
});
exposeForRender(stage, { duration: 12, fps: 24 });
// The second hand's angle (degrees clockwise from 12) for clock time 3:00:00 + s, as s08 sets it (clock.set(3, 0, tLocal)).
window.secDeg = (s) => { home.set(3, 0, s); return +(-home.group.children[3].rotation.z * 180 / Math.PI).toFixed(3); };
