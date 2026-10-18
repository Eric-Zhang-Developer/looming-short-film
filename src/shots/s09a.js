// s09a · The choice (docs/shots/s09a.md, v4, with the director's 2026-10-18 block: 2.5×, the nightstand lamp). He turns
// the phone face down and the room goes black: the ceiling shadow dies with the light that made it, on the same frame.
// Only the blob's eyes are left. One slow breath (eyes closed), his face sets (dread → resolve), he sits up, reaches out
// of frame and clicks his nightstand lamp ON (lampOn, the rhyme with s06's click-off). Cut to the wide: the room lit low
// and warm from the nightstand, the blob's shadow the biggest of the film on the wall behind the bed. He gets up anyway,
// grabs his backpack and takes the first step toward the door. Setups: C3 (s07's camera) 0–1.5 and 4.25–6, C4 (his face,
// close) 1.5–4.25. Characters on 2s, light on 1s, boil 10/s.
import * as THREE from 'three';
import { onTwos, lerp } from '../core/ease.js';
import { act } from '../characters/acting.js';
import { hipHeight } from '../characters/gator.js';
import { specPose, POSES } from '../characters/poses.js';
import { bedroom, closeHeads, ROOM, CAM, LOOK, LIE, KNEE, HIP, PHONE, at2, SPOT, FACE_FILL, SPILL, MOON_PANES, FACE_LIGHT } from './s07.js';

const ID = 's09a', DEG = Math.PI / 180;
export const BLOB_R = { start: 0.030 };                       // 2.5× (README §1, Q16)
const F = (s) => Math.round(s * 12) / 12;
// C4: his head in profile from the camera side, framing the lying head low and the sitting head high (re-solved at build).
const C4 = { pos: [0.165, 0.095, 0.53], look: [0.165, 0.095, 0.31] };
const inC4 = (T) => T >= 1.5 - 1e-6 && T < 4.25 - 1e-6;
// Poses (specPose). SIT: upright in bed, legs forward under the blanket, hands in his lap; REACH: the near arm out to the
// lamp (3.67–4.0, out of frame); EDGE: sitting on the bed's near edge, legs down; STAND, GRAB (bent to the backpack),
// LIFT, SLUNG (backpack on), STEP (walk contact).
const SIT = specPose({ lean: 0, arm: -40, far: -50, head: 0, leg: 80, farLeg: 84, tail: -60 });
const REACH = specPose({ lean: 8, arm: 5, far: -50, head: 0, leg: 80, farLeg: 84, tail: -60 });
const EDGE = specPose({ lean: 4, arm: -70, far: -80, head: 0, leg: 70, farLeg: 66, tail: -40 });
const STAND_ANTIC = specPose({ lean: 18, arm: -80, far: -90, leg: 20, farLeg: 16, tail: -20 });
const STAND = specPose({ lean: 0, arm: -95, far: -95, leg: 0, farLeg: 8, tail: 0 });
const GRAB = specPose({ lean: 38, arm: -78, far: -100, head: -10, leg: 0, farLeg: 8, tail: 6 });
const LIFT = specPose({ lean: 8, arm: -25, far: -95, head: 4, leg: 0, farLeg: 8, tail: 4 });
const SLUNG = specPose({ lean: 2, arm: -90, far: -95, head: 2, leg: 0, farLeg: 8, tail: 0 });
const STEP = POSES.walk_side_a;
const STAND_AT = [0.150, 0, 0.385];                           // on the floor in front of the bed, left of the blob
const EDGE_AT = [0.175, ROOM.MT + 0.006, 0.352];
const FOOT = [0.232, ROOM.MT + 0.001, 0.300];                 // the blob, slid off his knees to the bed's foot (3.5–3.67), back on the mattress
const FLOOR = [0.236, 0, 0.368];                              // ...and hopped down after him (5.75–6.0)
// Light levels.
export const LAMP = 0.32, LAMP_SHADE = 1.4, CHAR_FILL = 0.006;
// C4's exposure: his face is 8 cm from the shade (the wall is 40 cm), so the close-up stops down for the lamp, a camera
// change, not a light change: the lamp's level in C4 is LAMP × C4_STOP.
const C4_STOP = 0.12;
const LAMPC0 = (P) => new THREE.Color(P.lamp).lerp(new THREE.Color(P.cream), 0.5);                   // the warm character fill (the lamp spot itself is s07's lerp 0.35)
const AMB_DARK = 0.8 * 0.003, AMB_LAMP = 0.8 * 0.05;           // 0.3% of s02's in the black (the spec's 1% measured 5.1% mean luma), 5% once the lamp is on
const MOON_RIM = 0.03, MOON_PATCH = 0.006;                   // C4's moon rim; the floor patch on the backpack (0.5–4.0)
const GLOW = 0.3;                                            // the blob's eyes in the black: an in-shot self-light (gap: contract-blob)

export async function build(ctx) {
  const { scene, camera, post, PALETTE } = ctx;
  const R = await bedroom(ctx, ID), { T: tl, rig, exam, caster, spot, fill, spill, lamp, shadeMat, clock, phone, glow, phoneDown, backpack, blanket } = R;
  const blanketY = blanket.g.position.y;
  const H = await closeHeads(ctx, tl, rig, ['dread', 'resolve']);
  const ph = phone.children.filter((c) => c !== glow && c !== phoneDown.g);
  const fx = post({ focus: 0.6, aperture: 0.012, lut: 'night' });
  const cues = [[0, 'dread'], [3, 'resolve']];
  R.moonPanes(MOON_PANES);
  const headBase = rig.joints.head.position.x;
  const moonCol = new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.cream), 0.3);
  // The moon rim (C4 only): from behind him and above, on the window side, so the paper's torn edge catches it.
  const rim = new THREE.SpotLight(moonCol, 0, 0.6, 0.35, 0.6, 2);
  rim.position.set(0.07, 0.17, 0.40);
  scene.add(rim, rim.target);
  // The moon's patch on the floor where the backpack is (dim, no shadow).
  const patch = new THREE.SpotLight(moonCol, 0, 1.0, 0.09, 0.7, 2);
  patch.position.set(ROOM.WIN.B, ROOM.WIN.y, 0.004);
  patch.target.position.set(ROOM.BACKPACK[0], 0, ROOM.BACKPACK[2]);
  scene.add(patch, patch.target);
  // README §10 character fill once the lamp is on: dim, warm, in front of him and a little above, no shadow, short reach,
  // so his face reads against the lit wall without lifting the shadow (the lamp is nearly in his plane and grazes him).
  const cfill = new THREE.PointLight(LAMPC0(PALETTE), 0, 0.16, 2);
  cfill.position.set(0.17, 0.085, 0.47);
  scene.add(cfill);
  // The blob's eyes in the black: contract-blob has no glow, so the shot adds a fixed cream to the eye paint's room term
  // after the blob reads the scene's lights (s09a.md Light: "raise only the blob's eye material's emissive in the shot").
  let glowOn = 0;
  const ob = exam.mesh.onBeforeRender, U = exam.mesh.material.uniforms;
  exam.mesh.onBeforeRender = (...a) => { ob(...a); U.uAmb.value.addScalar(glowOn); };
  const shadeBase = shadeMat.emissive.clone();
  const LAMPC = lamp.color.clone();
  const hand = new THREE.Vector3(), q = new THREE.Quaternion();
  const bag = new THREE.Group(); scene.add(bag);              // the backpack follows his hand, then his back
  backpack.g.removeFromParent(); bag.add(backpack.g); backpack.g.position.set(0, 0, 0);

  return {
    ...R, heads: H, rim, patch,
    update(t) {
      const T = onTwos(t), c4 = inC4(t), dark = t >= 0.5 - 1e-6, lit = t >= 4 - 1e-6;
      tl.boil(t); clock.boil(t); rig.boil(t, 10);
      clock.set(3, 0, 10 + t);                                // 3:00:10 at 0.0: s08's clock, still going

      // ---- camera: C3 (s07's) and C4 ----
      const cam = c4 ? C4 : { pos: CAM.toArray(), look: LOOK.toArray() };
      camera.position.set(...cam.pos); camera.lookAt(...cam.look);
      fx.set(c4 ? { focus: 0.25, aperture: 0.03 } : { focus: new THREE.Vector3(0.2, 0.06, 0.33).sub(CAM).dot(LOOK.clone().sub(CAM).normalize()), aperture: 0.012 });

      // ---- him ----
      rig.group.position.set(...HIP);
      if (T < F(3.5)) rig.blend({ lie: LIE }, [[0, 'lie']], 0);
      else if (T < 4.25 - 1e-6) {
        rig.blend({ lie: LIE, sit: SIT, reach: REACH }, [[3.417, 'lie'], [F(3.667), 'sit'], [F(3.75), 'sit'], [F(3.917), 'reach'], [4.0, 'reach'], [F(4.167), 'sit']], t);
      } else if (T < F(4.417)) rig.blend({ sit: SIT }, [[0, 'sit']], 0);
      else if (T < F(4.667)) { rig.group.position.set(...EDGE_AT); rig.blend({ e: EDGE }, [[0, 'e']], 0); }
      else {
        const k = T < 4.75 - 1e-6 ? 'antic' : T < 5 - 1e-6 ? 'stand' : T < F(5.25) ? 'grab' : T < F(5.583) ? 'lift' : T < F(5.75) ? 'slung' : 'step';
        const P = { antic: STAND_ANTIC, stand: STAND, grab: GRAB, lift: LIFT, slung: SLUNG, step: STEP }[k];
        rig.blend({ p: P }, [[0, 'p']], 0);
        rig.group.position.set(STAND_AT[0] + (k === 'step' ? 0.006 : 0), hipHeight(P), STAND_AT[2]);
      }
      act(rig, t, cues, { slump: 0, tilt: 0, tail: 0, depth: 0, blink: false });
      // The one slow breath (1.75–2.50 in, 2.50–2.92 out: the head and jaw rise 1.5 mm, lying the body's x is up);
      // otherwise 20/min to 1.5, then 12/min.
      let rise = 0;
      if (T >= 1.75 - 1e-6 && T < F(2.5)) rise = 0.0015 * (T - 1.75) / 0.75;
      else if (T >= F(2.5) && T < 2.92) rise = 0.0015 * (1 - (T - 2.5) / 0.42);
      else rise = 0.0005 * Math.sin(2 * Math.PI * T * (T < 1.5 ? 20 : 12) / 60);
      rig.joints.head.position.x = T < F(3.5) ? (at2(T, 3.417, 3.5) ? headBase - 0.001 : headBase) + rise : headBase;   // every frame: pure in t
      // Close-up heads in C4: dread (eyes open, then the lid for the breath and the 2.917 squeeze), resolve from 3.0.
      const closed = T >= 1.75 - 1e-6 && T < 3 - 1e-6;
      H.show(c4 ? (T < 3 - 1e-6 ? 'dread' : 'resolve') : null, { closed });

      // ---- the blanket drops to his lap when he sits up (3.5), so the blob at the bed's foot shows over it ----
      blanket.g.position.y = blanketY - (T >= F(3.5) ? 0.02 : 0);

      // ---- the phone: lift 2 mm (0.25), on edge (0.417), face down on his chest (0.5); slides onto the blanket (4.25) ----
      phone.position.set(...PHONE.at);
      phone.rotation.set(0, -55 * DEG, 78 * DEG);
      const down = T >= 0.5 - 1e-6;
      for (const m of ph) m.visible = !down;
      glow.visible = !down;
      phoneDown.g.visible = down;
      if (at2(T, 0.25, 0.5)) phone.position.y += 0.002;
      if (at2(T, 0.417, 0.5)) phone.rotateX(90 * DEG);
      if (down) phone.rotation.set(-75 * DEG, 0, 4 * DEG);
      if (down && T >= F(3.5)) phone.visible = T >= 4.25 - 1e-6;   // it rides his chest up out of the sit-up's way; off the cut it's on the blanket
      else phone.visible = true;
      if (T >= 4.25 - 1e-6) phone.position.set(0.200, KNEE[1] + 0.0008, 0.326);

      // ---- the backpack: on the floor; in his hand from 5.0; on his back from 5.583 ----
      rig.group.updateMatrixWorld(true);
      if (T >= 5 - 1e-6 && T < F(5.583)) {
        rig.hand.getWorldPosition(hand);
        bag.position.set(hand.x, hand.y - 0.013, hand.z + 0.002); bag.rotation.set(0, 0, 0);
      } else if (T >= F(5.583)) {
        rig.joints.body.getWorldPosition(hand); rig.joints.body.getWorldQuaternion(q);
        bag.position.copy(new THREE.Vector3(-0.021, 0.022, -0.004).applyQuaternion(q).add(hand)); bag.quaternion.copy(q);
      } else { bag.position.set(...ROOM.BACKPACK); bag.rotation.set(0, 0, 0); }

      // ---- the Exam: its eyes in the black, a blink at 1.0; slides to the bed's foot as he sits up (3.5–3.67); gasps at
      // 4.25; watches him to the backpack; hops down after him (5.75–6.0) ----
      let contact = KNEE, eyes = 'open', look = 1, squash = 0;
      if (T >= F(3.5)) contact = T < F(3.667) ? KNEE.map((v, i) => lerp(v, FOOT[i], (T - 3.5 + 1 / 12) / (1 / 6)) + (i === 1 ? 0.006 : 0)) : FOOT;
      if (T >= F(5.75)) { const k = Math.min(1, (T - 5.75) / 0.25); contact = FOOT.map((v, i) => lerp(v, FLOOR[i], k) + (i === 1 ? 0.01 * Math.sin(Math.PI * k) : 0)); squash = k >= 1 ? 0.15 : -0.1; }
      if (at2(T, 1.0, 1.08)) eyes = 'closed';
      if (T >= 4.25 - 1e-6) eyes = 'gasp';
      if (T >= 5 - 1e-6) { eyes = 'side'; look = -1; }
      R.placeBlob(BLOB_R.start, contact);
      exam.update(t, { wobble: 0.8, eyes, look, squash, key: lit ? lamp : dark ? null : spot });

      // ---- light. 0.5: the phone spot, its fill and its spill go to 0 on one frame, and the ceiling shadow with them.
      // 4.0 lampOn: the nightstand lamp, low and warm; only the blob casts (its own field now: the lamp sees its face). ----
      spot.intensity = dark ? 0 : SPOT;
      fill.intensity = dark ? 0 : FACE_FILL * SPOT;
      spill.intensity = dark ? 0 : SPILL;
      R.face.intensity = dark ? 0 : FACE_LIGHT;
      caster.visible = !dark;
      exam.mesh.castShadow = lit;
      lamp.intensity = lit ? LAMP * (c4 ? C4_STOP : 1) : 0;
      lamp.color.copy(LAMPC);
      shadeMat.emissive.copy(lit ? LAMPC : shadeBase).multiplyScalar(lit ? LAMP_SHADE : 1);
      R.amb.intensity = lit ? AMB_LAMP : dark ? AMB_DARK : 0.8 * 0.05;
      glowOn = dark && !lit ? GLOW : 0;
      rim.intensity = c4 ? MOON_RIM : 0;
      rig.joints.head.getWorldPosition(hand); rim.target.position.copy(hand); rim.target.updateMatrixWorld();
      patch.intensity = dark && !lit ? MOON_PATCH : 0;
      cfill.intensity = lit && !c4 ? CHAR_FILL : 0;
    },
  };
}
