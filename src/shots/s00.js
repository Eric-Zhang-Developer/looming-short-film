// s00 · The notification (docs/shots/s00.md, G4). Cold open: a phone face-up on the real-scale home desk (s02.js's
// unit), pre-dawn dark. It buzzes (notifyBuzz 0.5), the screen wakes to one banner, props_kit's painted card
// "Calc 2 Exam · Fri" with its red badge, buzzes again at 2.0, and dims as it times out (3.5) for the cut to s01.
// No character, no blob. Camera straight down, locked. Phone and light on 1s (a real vibration), boil 10/s.
import * as THREE from 'three';
import { ambient } from '../lights.js';
import { DESK, tools, homeDesk } from './s02.js';

const ID = 's00';
const BUZZ = [0.5, 2.0], BUZZ_LEN = 0.33, JIT = 0.0004;    // notifyBuzz and the second buzz; ±0.4 mm on alternating frames
const DIM_AT = 3.5, DIM = 0.4;                             // the screen times out
const PULSE = [0.75, 1.0];                                 // the badge: 1 → 1.1 → 1
const HEIGHT = 0.022;                                      // camera above the phone: it fills ~60% of the frame width
const GLOW_I = 0.0006, AMB = 0.15;                         // screen face fill (cd), ambient at 15% of s02's (pre-dawn)

export async function build(ctx) {
  const { scene, camera, PALETTE, post } = ctx;
  scene.background = new THREE.Color(PALETTE.navy).lerp(new THREE.Color(PALETTE.ink), 0.6);
  const T = tools(ctx, ID);
  const set = await homeDesk(ctx, T);
  const [px, pz] = DESK.phone, phone = set.phone.g, turn = phone.rotation.z;
  camera.near = 0.002; camera.updateProjectionMatrix();   // the stage's near plane is farther than 2 cm
  camera.up.set(0, 0, -1);
  camera.position.set(px, HEIGHT, pz + 0.001);
  camera.lookAt(px, 0, pz);
  post({ focus: HEIGHT, aperture: 0.002, maxblur: 0.006, lut: 'night' });

  // The lock screen: an unlit navy-cyan face over the painted dark screen, and on it the painted banner (unlit: it's
  // the screen's own light), its badge a separate square so it can pulse.
  const props = set.props, bmp = props.pieces.notification_card, [u0, v0, u1, v1] = props.visible.notification_card;
  const crop = (a, b) => {
    const c = document.createElement('canvas'), sx = u0 * bmp.width + a * (u1 - u0) * bmp.width, w = (b - a) * (u1 - u0) * bmp.width, h = (v1 - v0) * bmp.height;
    Object.assign(c, { width: Math.round(w), height: Math.round(h) });
    c.getContext('2d').drawImage(bmp, sx, v0 * bmp.height, w, h, 0, 0, c.width, c.height);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const CW = 0.0062, CH = CW * ((v1 - v0) * bmp.height) / ((u1 - u0) * bmp.width), BADGE = 0.25;   // badge: the card's left quarter
  /** @param {THREE.Texture | null} map @param {THREE.ColorRepresentation} [color] */
  const unlit = (map, color = 0xffffff) => new THREE.MeshBasicMaterial({ map, color, transparent: true, toneMapped: false });
  const screen = new THREE.Group();
  screen.position.set(px, 0.0009, pz);
  screen.rotation.set(-Math.PI / 2, 0, turn);
  scene.add(screen);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.0067, 0.0029), unlit(null, new THREE.Color(PALETTE.navy).lerp(new THREE.Color(PALETTE.phone), 0.35)));
  face.position.set(0.0003, 0, 0);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(CW * (1 - BADGE), CH), unlit(crop(BADGE, 1)));
  card.position.set(0.0003 + CW * BADGE / 2, 0.0004, 0.00005);
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(CW * BADGE, CH), unlit(crop(0, BADGE)));
  badge.position.set(0.0003 - CW * (1 - BADGE) / 2, 0.0004, 0.0001);
  screen.add(face, card, badge);
  const mats = [face, card, badge].map((m) => /** @type {[THREE.MeshBasicMaterial, THREE.Color]} */ ([m.material, m.material.color.clone()]));

  const glow = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);
  glow.position.set(px, 0.004, pz);
  const amb = ambient(); amb.intensity *= AMB;
  scene.add(glow, amb);

  return {
    update(t) {
      T.boil(t);
      const on = t >= BUZZ[0] - 1e-6, level = t >= DIM_AT - 1e-6 ? DIM : 1;
      screen.visible = on;
      for (const [m, c] of mats) m.color.copy(c).multiplyScalar(level);
      glow.intensity = on ? GLOW_I * level : 0;
      const k = t > PULSE[0] && t < PULSE[1] ? Math.sin(Math.PI * (t - PULSE[0]) / (PULSE[1] - PULSE[0])) : 0;
      badge.scale.setScalar(1 + 0.1 * k);
      // Buzz: ±JIT in x on alternating 24 fps frames for 0.33 s.
      const n = Math.floor(t * 24 + 1e-6), b = BUZZ.find((s) => t >= s - 1e-6 && t < s + BUZZ_LEN);
      const dx = b === undefined ? 0 : (n % 2 ? JIT : -JIT);
      phone.position.x = px + dx; screen.position.x = px + dx;
    },
  };
}
