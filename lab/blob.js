// Lab for src/blob.js: the blob on a kraft desk in front of a cream wall, lit by a low phone-style spotlight.
// 0–2 s idle wobble (one blink at 1.4 s), 2–3 s hop with anticipation, squash landing and settle,
// 3–4 s worried eyes with a nervous shiver. The big wall shadow is on screen throughout.
// ?cam=close frames the blob for close-ups; the default frames the blob and its wall shadow.
// ?cam=eyes&d=<m>: the film-size blob (r 0.012) seen from d m (default 1.2, s07's distance; s15's Camera A is 0.31),
// one eye state per second: open, closed, tired, gasp, worried, side (look +1), side (look −1).
import * as THREE from 'three';
import { createStage, exposeForRender } from '../src/core/stage.js';
import { PALETTE } from '../src/core/palette.js';
import { kf, onTwos } from '../src/core/ease.js';
import { createBlob } from '../src/blob.js';

const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color(PALETTE.navy);

const plane = (w, h, color) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ color: PALETTE[color] }));
  m.receiveShadow = true; scene.add(m); return m;
};
plane(1.6, 0.9, 'cream').position.set(0, 0.45, 0);   // wall at z = 0
const desk = plane(1.6, 1.2, 'kraft');
desk.rotation.x = -Math.PI / 2; desk.position.set(0, 0, 0.6);

const BLOB_Z = 0.24;
const q = new URLSearchParams(location.search), EYES_VIEW = q.get('cam') === 'eyes';
const blob = createBlob({ radius: EYES_VIEW ? 0.012 : 0.025, seed: 1 });
blob.mesh.position.set(0, 0, BLOB_Z);
blob.stain.position.set(0, 0.0003, BLOB_Z);
scene.add(blob.mesh, blob.stain);

// Phone on the desk, a little left and in front: shadow scale ≈ 0.37 / 0.13 ≈ 2.8x (light-to-wall over light-to-blob in z), thrown up the wall.
// Decay 1 keeps the blob from blowing out this close to the source.
const phone = new THREE.SpotLight(PALETTE.phone, 0.55, 0, 1.0, 0.6, 1);
phone.position.set(-0.12, 0.018, 0.37);
phone.target.position.set(0, 0.06, 0);
phone.castShadow = true;
phone.shadow.mapSize.set(2048, 2048);
phone.shadow.camera.near = 0.02; phone.shadow.camera.far = 1.5;
phone.shadow.radius = 3; phone.shadow.bias = -0.0004;
scene.add(phone, phone.target, new THREE.HemisphereLight(PALETTE.navy, PALETTE.kraft, 0.06));

if (EYES_VIEW) {
  const d = Number(q.get('d') || 1.2), mid = new THREE.Vector3(0, 0.012, BLOB_Z);
  camera.position.set(-0.032, 0.339, 0.940).multiplyScalar(d).add(mid);   // Camera A's direction onto the blob
  camera.lookAt(mid);
} else if (q.get('cam') === 'close') {
  camera.position.set(0, 0.04, 0.62); camera.lookAt(0, 0.03, BLOB_Z);
} else {
  camera.position.set(0.12, 0.16, 1.55); camera.lookAt(0, 0.1, 0.1);
}

const HOP = 0.028; // hop height, m
const STATES = [['open'], ['closed'], ['tired'], ['gasp'], ['worried'], ['side', 1], ['side', -1]];
if (EYES_VIEW) stage.onFrame((t) => {
  const [eyes, look] = STATES[Math.min(STATES.length - 1, Math.floor(t))];
  blob.update(t, { eyes, look });
});
else stage.onFrame((tRaw) => {
  const t = onTwos(tRaw);
  // squash: crouch (anticipation) → stretch on launch → stretch falling → squash on impact → damped settle
  // Keys sit on the 12 fps grid (frame n at n / 12) so every pose is actually drawn.
  const LAND = 31 / 12;
  let squash = kf(t, [[24 / 12, 0], [26 / 12, 0.5], [27 / 12, -0.6], [29 / 12, 0], [30 / 12, -0.5], [LAND, 1]]);
  if (t >= LAND) squash = Math.exp(-6 * (t - LAND)) * Math.cos(16 * (t - LAND));
  const u = (t - 27 / 12) / (LAND - 27 / 12);
  blob.mesh.position.y = u > 0 && u < 1 ? 4 * HOP * u * (1 - u) : 0;
  const eyes = t >= 3 ? 'worried' : (t >= 1.4 && t < 1.55) || (t >= LAND && t < LAND + 2 / 12) ? 'closed' : 'open';
  blob.update(tRaw, { squash, wobble: t >= 3 ? 1.7 : 1, eyes });
});

exposeForRender(stage, { duration: EYES_VIEW ? STATES.length : 4 });
