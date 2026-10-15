// Lab for src/lights.js: a cream wall, a kraft desk and one flat cutout 15 cm off the wall.
// t < 2 phone (placed for a 3× shadow) · 2–4 lamp · 4–6 fluorescent · 6–9 dawn ramp. window.renderFrame(t), t in [0, 9].
import * as THREE from 'three';
import { createStage, exposeForRender } from '../src/core/stage.js';
import { PALETTE } from '../src/core/palette.js';
import { ease } from '../src/core/ease.js';
import { mulberry32 } from '../src/core/rng.js';
import { phoneLight, lampLight, dawnLight, fluorescent, ambient, placeForScale, aim } from '../src/lights.js';

const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color(PALETTE.navy);
camera.position.set(0, 0.2, 1.1);
camera.lookAt(0, 0.09, 0.1);

// Plain paper stock: fill, short fibers, grain. Seeded.
function stock(fill, seed, repeat) {
  const S = 512, c = Object.assign(document.createElement('canvas'), { width: S, height: S }), g = c.getContext('2d'), rng = mulberry32(seed);
  g.fillStyle = fill; g.fillRect(0, 0, S, S);
  for (let k = 0; k < 2500; k++) {
    const x = rng() * S, y = rng() * S, a = rng() * Math.PI, l = 4 + rng() * 18;
    g.strokeStyle = rng() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
  return t;
}
const plane = (w, h, map) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map }));
  m.receiveShadow = true; scene.add(m); return m;
};
const wall = plane(1.6, 0.9, stock(PALETTE.cream, 11, [5, 2.8]));
wall.position.set(0, 0.45, 0);
const desk = plane(1.6, 0.42, stock(PALETTE.kraft, 23, [5, 1.3]));
desk.rotation.x = -Math.PI / 2; desk.position.set(0, 0, 0.21);

// The cutout: a blob with a flat base and two eye holes, parallel to the wall so the rule is exact.
const SUBJECT = new THREE.Vector3(0, 0.035, 0.15), SIZE = 0.075;
const mask = (() => {
  const S = 256, c = Object.assign(document.createElement('canvas'), { width: S, height: S }), g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(128, 120, 100, 104, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#000'; g.fillRect(0, 222, S, S - 222);                                    // flat base on the desk
  for (const x of [100, 156]) { g.beginPath(); g.arc(x, 96, 11, 0, Math.PI * 2); g.fill(); } // eye holes
  return new THREE.CanvasTexture(c);
})();
const cutout = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE),
  new THREE.MeshLambertMaterial({ map: stock(PALETTE.gator, 31, [1, 1]), alphaMap: mask, alphaTest: 0.5, side: THREE.DoubleSide }));
// The flat base (mask row 222 of 256) sits on the desk.
cutout.position.copy(SUBJECT).setY(SIZE * (222 / 256 - 0.5));
SUBJECT.y = cutout.position.y;
cutout.castShadow = true; cutout.receiveShadow = true;
scene.add(cutout);

// ---------- lights ----------
scene.add(ambient());

const phone = phoneLight();
const phonePos = placeForScale({ subjectPos: SUBJECT, wallZ: 0, scale: 3, height: -0.024, side: -0.02 });
phone.position.copy(phonePos);
scene.add(phone, phone.target);
aim(phone, cutout);

const lamp = lampLight({ angle: 0.35, penumbra: 0.4 });
lamp.light.position.set(0.15, 0.36, 0.27);
scene.add(lamp.light, lamp.light.target, lamp.cone, lamp.dust);
aim(lamp.light, cutout);

const fluor = fluorescent({ flickerSeed: 5 });
scene.add(fluor.light, fluor.light.target);

const dawn = dawnLight();
dawn.light.target.position.copy(SUBJECT);
scene.add(dawn.light, dawn.light.target);

stage.onFrame((t) => {
  phone.visible = t < 2;
  lamp.light.visible = t >= 2 && t < 4;
  fluor.light.visible = t >= 4 && t < 6;
  dawn.light.visible = t >= 6;
  lamp.update(t);
  fluor.update(t);
  dawn.update(t, ease((t - 6) / 3));
});

exposeForRender(stage, { duration: 9 });
window.lab = { THREE, stage, cutout, wall, desk, SUBJECT, phonePos, phone, lamp, fluor, dawn };
