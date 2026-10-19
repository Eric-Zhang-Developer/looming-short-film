// @ts-check
// s00 · The notification (docs/shots/s00.md; v6-canvas-a). Cold open: a phone face-up on the real-scale home desk
// (s02.js's unit), pre-dawn dark. It buzzes (notifyBuzz 0.5) and the screen wakes on Canvas Student's To-do list, light
// mode (src/props/canvas.js), its last row "MAC2312 · Calc 2 Exam · Tomorrow 9:00 AM". A slow push toward that row; the
// second buzz (2.0) drops the reminder banner in and brings the row's red marker up; the screen dims as it times out
// (3.5) for the cut to s01. No character, no blob. Camera straight down, the phone's top up. Phone, light and camera
// on 1s (a real vibration), boil 10/s on the paper only: the screen type stays crisp.
import * as THREE from 'three';
import { ambient } from '../lights.js';
import { ease } from '../core/ease.js';
import { DESK, tools, homeDesk } from './s02.js';
import { todoScreen, banner, COUNTDOWN, EXAM_Y } from '../props/canvas.js';

const ID = 's00';
const BUZZ = [0.5, 2.0], BUZZ_LEN = 0.33, JIT = 0.0004;    // notifyBuzz and the second buzz; ±0.4 mm on alternating frames
const DIM_AT = 3.5, DIM = 0.4;                             // the screen times out
const MARK = 0.33;                                         // the exam row's red marker rises over 0.33 s from 2.0
const SCR = [0.94, 0.86];                                  // the painted phone's dark screen, of its visible box (long, short)
const D0 = 0.0165, D1 = 0.011, PUSH = [0.5, 3.5];          // camera height: header to the exam row → the banner and the exam row
const FOCUS_Y = (52 + EXAM_Y + 46) / 2;                    // UI points: midway between the banner's top and the exam row's bottom
const GLOW_I = 0.0009, AMB = 0.15;                         // screen face fill (cd), ambient at 15% of s02's (pre-dawn)

export async function build(ctx) {
  const { scene, camera, PALETTE, post } = ctx;
  scene.background = new THREE.Color(PALETTE.navy).lerp(new THREE.Color(PALETTE.ink), 0.6);
  const T = tools(ctx, ID);
  const set = await homeDesk(ctx, T);
  const [px, pz] = DESK.phone, phone = set.phone.g, turn = phone.rotation.z;
  camera.near = 0.002; camera.updateProjectionMatrix();   // the stage's near plane is farther than 2 cm
  const fx = post({ focus: D0, aperture: 0.002, maxblur: 0.006, lut: 'night' });

  // The screen: the To-do list on an unlit plane over the painted dark screen (it's the screen's own light), portrait,
  // the UI's top toward the phone's camera dot (−x).
  const [L, Sh] = set.phone.size, sl = L * SCR[0], ss = Sh * SCR[1];
  const scr = todoScreen({ aspect: sl / ss }), card = banner({ body: COUNTDOWN.s00 });
  const mat = new THREE.MeshBasicMaterial({ map: scr.texture, transparent: true, toneMapped: false });
  const screen = new THREE.Group();
  screen.position.set(px, 0.0009, pz);
  screen.rotation.set(-Math.PI / 2, 0, turn);
  scene.add(screen);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(ss, sl), mat);
  face.rotation.z = Math.PI / 2;
  screen.add(face);
  scene.updateMatrixWorld(true);
  const up = new THREE.Vector3(0, 1, 0).transformDirection(face.matrixWorld);
  const ui = (y) => face.localToWorld(new THREE.Vector3(0, (0.5 - y / scr.H) * sl, 0));   // a UI row's centre, world
  const at = ui(FOCUS_Y);                                  // the push is straight down onto it: the banner stays in frame
  camera.up.copy(up);

  const glow = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);
  glow.position.set(px, 0.004, pz);
  const amb = ambient(); amb.intensity *= AMB;
  scene.add(glow, amb);

  return {
    update(t) {
      T.boil(t);
      const on = t >= BUZZ[0] - 1e-6, level = t >= DIM_AT - 1e-6 ? DIM : 1, tc = Math.floor(t * 24 + 1e-6) / 24;   // on 1s
      screen.visible = on;
      mat.color.setScalar(level);
      glow.intensity = on ? GLOW_I * level : 0;
      // The second buzz: the banner lands in one frame (as the screen woke) and the exam row's red marker rises.
      const m = Math.min(1, Math.max(0, (tc - BUZZ[1]) / MARK));
      scr.set(t, { banner: tc >= BUZZ[1] - 1e-6 ? card : null, marker: ease(m) });
      // The push, on 1s: from the header-to-exam-row view to the banner and the exam row.
      const k = ease(Math.min(1, Math.max(0, (tc - PUSH[0]) / (PUSH[1] - PUSH[0]))));
      const h = D0 + (D1 - D0) * k;
      camera.position.set(at.x, at.y + h, at.z + 1e-5); camera.lookAt(at);
      fx.set({ focus: h });
      // Buzz: ±JIT in x on alternating 24 fps frames for 0.33 s.
      const n = Math.floor(t * 24 + 1e-6), b = BUZZ.find((s) => t >= s - 1e-6 && t < s + BUZZ_LEN);
      const dx = b === undefined ? 0 : (n % 2 ? JIT : -JIT);
      phone.position.x = px + dx; screen.position.x = px + dx;
    },
  };
}
