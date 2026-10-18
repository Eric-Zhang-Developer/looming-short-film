// s08 · 3:00 a.m., rock bottom (docs/shots/s08.md, v4; brief climax-a1). s07's bedroom, unchanged: him on his back with
// the phone on under his chin, the Exam at 2.5× on his knees and its shadow over the ceiling. The music is out; the clock
// ticks alone. Four setups, cut on ticks:
//   C1 0–2   the clock insert, 3:00:00, the second hand stepping
//   C2 2–4   his face, the painted `numb` head lying on the pillow; on the 3.0 tick his head rolls back toward the clock
//   CC 4–5   the red circle on the calendar (circleGlance): his look, carried by the cut (brief: the painted pupils don't move)
//   C2 5–7   his face again, now the painted `dread` head (the swap is hidden by the cut), breathing faster; a sweat drop at 6.5
//   C3 7–10  s07's camera: him small in bed, frozen, the rig's own `dread` face; the blob blinks at 8.5
// Characters on 2s, light and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { onTwos } from '../core/ease.js';
import { act } from '../characters/acting.js';
import { bedroom, closeHeads, ROOM, CAM, LOOK, LIE, at2, SPOT, FACE_FILL, SPILL, MOON_PANES, FACE_LIGHT } from './s07.js';

const ID = 's08', DEG = Math.PI / 180;
export const BLOB_R = { start: 0.030 };                       // 2.5× all shot (README §1, Q16)
// Cameras (re-solved at build). C1: face-on to the clock, the dial 60% of the frame height (Ø 0.020 / 0.6 = 0.0333 m of
// frame at fov 20 → 0.0945 away), nudged right so the calendar's edge is just in at frame left.
const C1 = { pos: [0.047, 0.099, 0.0960], look: [0.047, 0.099, 0] };
// C2: in front of the bed, level with his head, close: the head fills the lower right; the clock and the red circle soft
// on the wall behind and above, up and left (his eye-line).
export const C2 = { pos: [0.114, 0.074, 0.51], look: [0.114, 0.076, 0.31] };
// CC: the calendar's Friday square and its red circle, face-on, a little soft.
const CC = { pos: [ROOM.CAL.friXY[0] + 0.004, ROOM.CAL.friXY[1] + 0.002, 0.075], look: [ROOM.CAL.friXY[0] + 0.004, ROOM.CAL.friXY[1] + 0.002, 0] };
const setupAt = (T) => (T < 2 ? 'C1' : T < 4 ? 'C2' : T < 5 ? 'CC' : T < 7 ? 'C2' : 'C3');
export const SPILL_C1 = 1.4;                                 // the clock's spill in its own insert: just enough for the hands (s08.md C1)

// Breath in breaths per minute, integrated so a rate change never jumps: 8 to 5.0 (held 3.0–3.5), 14 at 5.0 rising to
// 20 by 6.5, then 20 (s08.md Acting). → phase in cycles at drawing T.
function breathPhase(T) {
  let ph = 0;
  for (let s = 0; s < T - 1e-6; s += 1 / 12) {
    const held = s >= 3.0 - 1e-6 && s < 3.5 - 1e-6;
    const bpm = s < 5 ? 8 : s < 6.5 ? 14 + 6 * (s - 5) / 1.5 : 20;
    if (!held) ph += bpm / 60 / 12;
  }
  return ph;
}

export async function build(ctx) {
  const { camera, post } = ctx;
  const R = await bedroom(ctx, ID), { T: tl, rig, exam, spot, fill, spill, clock } = R;
  const H = await closeHeads(ctx, tl, rig, ['numb', 'dread']);
  // The sweat drop (6.5): one drawn tissue drop at his temple on the dread head, sliding 1.5 mm down by 7.0.
  const drop = tl.paper('sweat', { path: [[0.5, 0.02], [0.8, 0.5], [0.85, 0.75], [0.5, 0.98], [0.15, 0.75], [0.2, 0.5]], color: '#' + new THREE.Color(ctx.PALETTE.cream).lerp(new THREE.Color(ctx.PALETTE.phone), 0.35).getHexString(), weight: 'vellum', size: [0.0024, 0.0034], res: 256 });
  H.group.add(drop);
  const DROP_AT = [(75 - 120) * H.k, (317 - 62) * H.k, 0.0006];   // head px (75, 62): the temple, behind the brow
  const fx = post({ focus: 0.5, aperture: 0.012, lut: 'night' });
  const q = new THREE.Quaternion(), down = new THREE.Vector3();
  const focusOf = (pos, look, p) => new THREE.Vector3(...p).sub(new THREE.Vector3(...pos)).dot(new THREE.Vector3(...look).sub(new THREE.Vector3(...pos)).normalize());
  const cues = [[0, 'numb'], [3, 'guilt'], [5, 'dread']];
  R.moonPanes(MOON_PANES);
  const headBase = rig.joints.head.position.x;

  return {
    ...R, heads: H,
    update(t) {
      const T = onTwos(t), S = setupAt(t);
      tl.boil(t); clock.boil(t); rig.boil(t, 10);
      clock.set(3, 0, t);                                       // 3:00:00 at 0.0, ticking on every whole second

      // ---- camera (cuts on the ticks 2, 4, 5, 7) ----
      const cam = S === 'C1' ? C1 : S === 'C2' ? C2 : S === 'CC' ? CC : { pos: CAM.toArray(), look: LOOK.toArray() };
      camera.position.set(...cam.pos); camera.lookAt(...cam.look);
      if (S === 'C1') fx.set({ focus: focusOf(C1.pos, C1.look, ROOM.CLOCK), aperture: 0.002 });
      else if (S === 'C2') fx.set({ focus: focusOf(C2.pos, C2.look, [0.16, 0.07, 0.31]), aperture: 0.03 });
      else if (S === 'CC') fx.set({ focus: focusOf(CC.pos, CC.look, [0, 0, 0]) * 0.8, aperture: 0.01 });
      else fx.set({ focus: focusOf(CAM.toArray(), LOOK.toArray(), [0.145, 0.062, 0.31]), aperture: 0.012 });

      // ---- him: frozen; his thumb has stopped. On the 3.0 tick his head rolls back toward the clock (anticipation 1°
      // forward at 2.917), and stays there; breathing quickens from 5.0 ----
      rig.blend({ lie: LIE }, [[0, 'lie']], 0);
      if (at2(T, 2.917, 3.0)) rig.joints.head.rotation.z -= 1 * DEG;
      if (T >= 3 - 1e-6) rig.joints.head.rotation.z += (T >= 5 - 1e-6 ? 6 : 5) * DEG;
      act(rig, t, cues, { slump: 0, tilt: 0, tail: 0, depth: 0, blink: false });
      const b = Math.sin(2 * Math.PI * breathPhase(T)), amp = T < 5 ? 0.0005 : 0.001;   // chest rise 0.5 mm, 1 mm from 5.0
      rig.joints.body.scale.x = 1 + 0.010 * b;
      rig.joints.head.position.x = headBase + amp * b;          // lying, the body's x is up: the jaw rises with the chest
      // Close-ups use the painted heads; C3 the rig's dread face (worried eyes on the clock).
      H.show(S === 'C2' ? (T < 4 ? 'numb' : 'dread') : null);
      drop.visible = S === 'C2' && T >= 6.5 - 1e-6;
      if (drop.visible) {   // slide 1.5 mm world-down by 7.0, in the head's frame
        rig.group.updateMatrixWorld(true);
        H.group.getWorldQuaternion(q);
        down.set(0, -1, 0).applyQuaternion(q.invert());
        const k = Math.min(1, (T - 6.5) / 0.5);
        drop.position.set(...DROP_AT).addScaledVector(down, 0.0015 * k);
      }

      // ---- the Exam: 2.5× on his knees; follows his look to the circle at 4.0 and back at 5.0; blinks at 8.5 ----
      let eyes = 'open', look = -1;
      if (T >= 4 - 1e-6 && T < 5 - 1e-6) eyes = 'side';
      if (at2(T, 8.5, 8.58)) eyes = 'closed';
      R.placeBlob(BLOB_R.start);
      exam.update(t, { wobble: 0.8, eyes, look, key: spot });

      // ---- light: s07's end state; the spill lifted only in the clock insert ----
      spot.intensity = SPOT;
      fill.intensity = FACE_FILL * SPOT;
      spill.intensity = S === 'C1' ? SPILL_C1 : SPILL;
      R.face.intensity = FACE_LIGHT;
    },
  };
}
