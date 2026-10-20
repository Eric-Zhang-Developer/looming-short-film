// s06 · The lamp beat (docs/shots/s06.md, G4). v2 on the real-scale home desk (s02.js's unit), at night.
// He's gaming; the laptop screen throws the 1.25× blob's shadow 4.06× up the wall (S = screenZ / (screenZ − z_B)).
// He pulls the lamp's chain (lampClickHome 0.5): light from above shrinks the shadow to a small pool and shows the
// blob as it is, right there. He flinches, stares, pulls it off again (lampOffHome 3.0), the loom springs back, he
// turns back to the game, and the blob gulps to 1.5× (gulp2 4.0): meter step 2.
// The K0–K7 hand path keeps s15's timing; its targets are re-solved onto this lamp's chain bead (the unit moved).
// Characters on 2s, light on 1s, boil 10/s.
import * as THREE from 'three';
import { phoneLight, lampLight, ambient, aim } from '../lights.ts';
import { kf, onTwos } from '../core/ease.ts';
import { hash2 } from '../core/rng.ts';
import { createBlob } from '../blob.ts';
import { makeGator } from '../characters/gator.ts';
import { specPose } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import { DESK, LAPTOP, tools, homeDesk, seatReach, firing } from './s02.ts';
import { screenHalo, reminderInsert, HALO } from './s03.ts';
import { COUNTDOWN } from '../props/canvas.ts';
import type { Pose } from '../puppet.ts';
import type { SpecOpts } from '../characters/poses.ts';
import type { ShotCtx } from './s02.ts';

const ID = 's06', DEG = Math.PI / 180;
const BLOB_R = { start: 0.018, gulp2: 0.024 };            // METER.gulp1 → METER.gulp2 (README §1, v4: 1.5× → 2×)
// v4: the wall shadow keeps the spec's 5.1 units before the gulp (units = S · r / 0.012), so S = 5.1 · 0.012 / 0.018 = 3.4 and the mark sits
// at z = screenZ · (1 − 1 / S) = 0.0159 (v3: 0.01696 for S 4.06 on the 1.25× blob). The gulp then swells it by the meter's step, to 6.8 units.
const UNITS0 = 5.1, S_WALL = UNITS0 * 0.012 / BLOB_R.start;
const MARK_Z = DESK.screenZ * (1 - 1 / S_WALL);
const MARK_X = 0.026 + 1.15 * (BLOB_R.start - 0.015), GROW_DX = 1.15 * (BLOB_R.gulp2 - BLOB_R.start), HOP_DX = -0.003;   // v3's left edge (0.0088) stays put, on the gulp too
// v7-laptop: the 1.8× laptop centred 1 cm nearer him than s02's, so its lid clears the blob's left edge (0.0088).
const LAPTOP_AT = [-0.010, 0.022];
const ON = 0.5, OFF = 3.0, GULP = 4.0;                     // lampClickHome, lampOffHome, gulp2 (local)
const CAM: CamKey = { pos: [0.05, 0.125, 0.60], look: [0.05, 0.058, 0.02] };   // high and wide enough to hold the 6.1-unit loom
const FOCUS = 0.58;
// v3-readability: the lamp has to read as light from *above*. At s02's 0.044 its mouth (0.028) sat level with the blob's
// top, so it lit the blob from the side and threw its shadow off the desk front, and no pool showed. Here it stands
// right behind the blob, tall enough (mouth 0.041) that the shade hangs over the blob's head and the pool falls under
// it. s02/s03's lamp (DESK.lamp) is unchanged: s06 is another night and another cut.
const LAMP = { x: 0.020, h: 0.064 };
const LAMP_MOUTH = [LAMP.x, LAMP.h * 0.646, DESK.lamp.z], LAMP_BEAD = [LAMP.x - LAMP.h * 21 / 212, LAMP.h * 0.505, DESK.lamp.z];
// OUTSHONE: v3 left a ghost loom (eye holes) on the lit wall at 0.05. LAMP_I: the mouth is 1.45× higher.
const SPOT_I = 0.03, OUTSHONE = 0.004, LAMP_I = 0.12, AMB = 0.45, FACE_SCREEN = 0.006, FACE_LAMP = 0.004;
const LAMP_KEYS = [[ON, 0], [ON + 1 / 24, 1.15], [ON + 3 / 24, 0.95], [ON + 5 / 24, 1.0]];
const BREATHE = 0.7 * DEG;                                  // v3 secondary motion: a 2.8 s breath, on 2s
const F = (n: number) => n / 12, fr = (t: number) => Math.floor(t * 12 + 1e-6);
const TAPS = [48, 54, 60, 66, 72, 78, 84, 90];               // every 0.5 s from 4.0

export async function build(ctx: ShotCtx) {
  const { scene, camera, PALETTE, post } = ctx;
  scene.background = new THREE.Color(PALETTE.navy).lerp(new THREE.Color(PALETTE.ink), 0.5);
  camera.position.set(...CAM.pos);
  camera.lookAt(...CAM.look);
  const T = tools(ctx, ID);
  const set = await homeDesk(ctx, T, { ...LAPTOP, laptopAt: LAPTOP_AT, pen: true });
  set.setLid(110);
  set.glow.visible = true;
  const fx = post({ focus: FOCUS, aperture: 0.012, lut: 'night' });

  // ---- the Student: K0–K7 on the chain's bead, the flinch, the second pull, back to the keys ----
  const gator = await makeGator(ctx, { seed: 2 });
  gator.group.position.set(...DESK.hip);
  scene.add(gator.group);
  set.lamp.g.position.x = LAMP.x;
  set.lamp.g.scale.multiplyScalar(LAMP.h / DESK.lamp.h);
  const cam = new THREE.Vector3(...CAM.pos), bead = new THREE.Vector3(...LAMP_BEAD);
  set.laptop.updateMatrixWorld(true);
  const keys = set.laptop.localToWorld(new THREE.Vector3(0, 0.0038, 0.002 * LAPTOP.laptopScale));   // v7: hovering 3 mm over the 1.8× deck (s03)
  const seat = (o: SpecOpts) => specPose({ leg: 60, farLeg: 54, ...o });
  const at = (p: THREE.Vector3, range: [number, number], o: SpecOpts = {}) => { const r = seatReach(cam, p, range); return seat({ lean: r.lean, arm: r.arm, ...o }); };
  const up = (dy: number) => bead.clone().add(new THREE.Vector3(0, dy, 0));
  const P: Record<string, Pose> = {
    rest: seat({ lean: 0, arm: -70 }), antic: seat({ lean: -4, arm: -80, head: -3 }), lift: seat({ lean: 6, arm: 0 }),
    reach: at(up(0.003), [8, 30]), touch: at(bead, [8, 30]), press: at(up(-0.0015), [8, 30]),
    recoil: seat({ lean: -6, arm: -55, far: -60, head: 4, tail: 12 }), stare: seat({ lean: -6, arm: -70, head: 4 }),
    away: seat({ lean: -9, arm: -70, head: 4 }),
    grab: at(keys.clone().add(new THREE.Vector3(-0.003, 0.004, 0)), [4, 34], { head: -6 }),   // v7: the laptop is 1 cm nearer him, so he leans less
    keys: at(keys, [4, 36], { head: -12 }),
  };
  P.tap = { ...P.keys, arm_r: P.keys.arm_r + 2 * DEG };
  const press = (t0: number) => ['rest', 'rest', 'antic', 'lift', 'reach', 'touch', 'press', 'touch'].map((n, i) => [t0 + F(i), n]);
  const KEYS = [
    ...press(0), [F(12), 'touch'], [F(13), 'recoil'], [F(14), 'stare'], [F(25), 'stare'], [F(26), 'away'], [F(31), 'away'],
    ...press(2.5).slice(2), [F(38), 'rest'], [F(40), 'grab'], [F(42), 'keys'],
    ...TAPS.flatMap((n) => [[F(n - 1), 'keys'], [F(n), 'tap'], [F(n + 1), 'keys']]), [8, 'keys'],
  ];
  const HEAD_DIP = [[F(8), -10]];   // 0.667: head turns down toward the blob
  const eyesAt = (f: number) => f < 6 ? 'tired' : f < 8 ? 'closed' : f < 10 ? 'open' : f < 13 ? 'side' : f < 21 ? 'gasp' : f < 42 ? 'worried' : 'tired';
  const mouthAt = (f: number) => (f >= 13 && f < 21 ? 'o' : 'line');

  // ---- the Exam on its mark ----
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh, exam.stain);
  exam.stain.position.set(MARK_X, 0.0003, MARK_Z);

  // ---- light: the laptop screen (README §4), the lamp (README §3), ambient at 45%, face fills ----
  const L = set.screenCentre();
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 0.6, intensity: SPOT_I });
  spot.position.copy(L);
  const screenFill = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);
  screenFill.position.copy(L).add(new THREE.Vector3(-0.004, 0.004, 0));
  const lamp = lampLight({ angle: 0.5, penumbra: 0.5, intensity: 0, reach: 1.3 });   // reach: the taller lamp's cone ran down the desk front to the floor
  lamp.light.position.fromArray(LAMP_MOUTH);
  lamp.dust.material.size = 0.0012;                         // the specks at desk scale
  const face = new THREE.PointLight(PALETTE.phone, 0, 0.07, 2);
  face.position.set(-0.025, 0.04, 0.06);
  const amb = ambient(); amb.intensity *= AMB;
  scene.add(spot, spot.target, screenFill, lamp.light, lamp.light.target, lamp.cone, lamp.dust, face, amb);
  // The lamp's shade glows while it's on (tissue lit from inside).
  const shadeGlow = (() => {   // the painted shade's trapezoid: 104 px wide at the mouth, 60 at the top, 75 tall (of 212)
    const k = LAMP.h / 212, s = new THREE.Shape([[-52, 0], [52, 0], [30, 75], [-30, 75]].map(([x, y]) => new THREE.Vector2(x * k * 0.92, y * k * 0.94)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: PALETTE.lamp, transparent: true, opacity: 0.55, toneMapped: false }));
    m.position.set(LAMP.x, LAMP_MOUTH[1] + 0.0005 * LAMP.h / DESK.lamp.h, DESK.lamp.z + 0.0008);
    return m;
  })();
  scene.add(shadeGlow);
  const halo = screenHalo(PALETTE); halo.position.copy(L).add(new THREE.Vector3(0, 0, 0.002)); scene.add(halo);
  // v6-canvas-b: gulp2's cause. As the lamp goes off (3.0) the phone face up on the desk lights with the reminder (a pale
  // screen and a small halo in the wide); an insert of the phone 3.167–4.0 (the banner, his thumb on it at 3.583, swiped
  // off to the left 3.75–3.92), cut back to the wide on the gulp (4.0), so the swipe lands on it. The lamp-off and the
  // loom's spring-back keep 3.0–3.167 in the wide, so the banner reads about 0.6 s, not the 1 s the others get.
  const PH_ON = 3.0, INS = [F(38), GULP];
  const [pw, phh] = set.phone.size;
  const phoneLit = new THREE.Mesh(new THREE.PlaneGeometry(pw * 0.8, phh * 0.82), new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.cream).lerp(new THREE.Color(PALETTE.phone), 0.3), toneMapped: false }));
  phoneLit.position.z = 0.0002; set.phone.g.add(phoneLit);
  const phoneHalo = screenHalo(PALETTE, 0.012); set.phone.g.updateMatrixWorld(true); phoneLit.getWorldPosition(phoneHalo.position); phoneHalo.position.y += 0.001; scene.add(phoneHalo);
  const ins = reminderInsert(ctx, { body: COUNTDOWN.s06, back: PALETTE.kraft });
  scene.add(ins.group);
  const faceCream = new THREE.Color(PALETTE.cream), faceCyan = new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.navy), 0.4);

  const C = new THREE.Vector3(), hit = new THREE.Vector3(), foot = new THREE.Vector3();
  return {
    exam, gator, spot, lamp,
    update(t: number) {
      T.boil(t);
      const f = fr(t);
      const lk = t >= ON - 1e-6 && t < OFF - 1e-6 ? kf(t, LAMP_KEYS, (x) => (x >= 1 ? 1 : 0)) : 0;   // stepped, on 1s
      const lit = lk >= 0.5;
      fx.set({ lut: lit ? 'amber' : 'night' });

      // The Student.
      gator.boil(t, 10);
      gator.blend(P, KEYS as [number, string][], t);
      if (f >= 8 && f < 12) gator.joints.head.rotation.z += HEAD_DIP[0][1] * DEG;
      if (f === 12) gator.group.position.y = DESK.hip[1] - 0.001; else gator.group.position.y = DESK.hip[1];
      if (f === 13) { gator.joints.arm_r.rotation.z += 15 * DEG; gator.joints.arm_l.rotation.z += 15 * DEG; }
      gator.joints.body.rotation.z += BREATHE * Math.sin(2 * Math.PI * onTwos(t) / 2.8);
      gator.follow('tail', t, { k: 6, w: 18 });
      // v4 acting: numb, the flinch at 1.083, dread at 1.75, numb again at 3.5. slump 0 (his hand is on the chain and the keys); the spec's
      // own gag eyes and mouth (the squint, the stare) go over the presets' faces. Breath is the presets' own.
      act(gator, t, [[0, 'numb'], [F(13), 'flinch'], [F(21), 'dread'], [3.5, 'numb']], { slump: 0, blink: false });
      gator.face({ eyes: eyesAt(f), mouth: mouthAt(f) });

      // The Exam: startle squash on the click, blink, nervous wobble, a hopeful 3 mm hop at 2.0, the dark's squash at
      // 3.0, gulp 2 at 4.0 (squash + eyes closed on 3.917, snap to 1.5× on 4.0, contact slides so its left edge stays).
      const grown = f >= 48, r = grown ? BLOB_R.gulp2 : BLOB_R.start;
      let x = MARK_X + (f >= 26 ? HOP_DX : f >= 24 ? HOP_DX / 2 : 0) + (grown ? GROW_DX : 0), lift = f >= 24 && f < 26 ? 0.003 : 0;
      let squash = 0, eyes = 'open', wobble = 1, look = -1;
      if (f >= 6 && f < 10) squash = 0.3 * Math.exp(-6 * (F(f) - ON)) * Math.cos(18 * (F(f) - ON));
      if (f === 8) eyes = 'closed';
      if (f >= 9 && f < 36) wobble = 0.4;
      if (f >= 16 && f < 36) eyes = 'worried';
      if (f === 23) squash = 0.25; if (f === 26) squash = 0.2;
      if (f === 36) { eyes = 'closed'; squash = 0.25; } else if (f > 36 && f < 40) squash = 0.25 * Math.exp(-6 * (F(f) - OFF)) * Math.cos(18 * (F(f) - OFF));
      if (f === 47) { eyes = 'closed'; squash = 0.3; }
      if (f >= 48 && f < 51) squash = -0.2 * Math.exp(-6 * (F(f) - GULP)) * Math.cos(18 * (F(f) - GULP));
      if (f >= 48 && f < 60) wobble = 0.8;
      if (f >= 54 && f < 60) squash = 0.15 * (f - 54) / 6; else if (f >= 60) { squash = 0.15; eyes = 'side'; }
      exam.mesh.position.set(x, lift, MARK_Z);
      exam.mesh.scale.setScalar(r / BLOB_R.start);
      exam.stain.position.x = x;
      exam.stain.scale.setScalar(r / BLOB_R.start);
      exam.update(t, { squash, wobble, eyes, look, key: lit ? lamp.light : spot });

      // Screen key: outshone to 0.2 while the lamp is lit (README §4), flickering ±5% per drawing.
      const flick = 1 + 0.05 * (2 * hash2(606, f) - 1);
      spot.intensity = SPOT_I * (lit ? OUTSHONE : 1) * flick;
      screenFill.intensity = 0.15 * spot.intensity;
      C.set(x, lift + r, MARK_Z);
      hit.subVectors(C, L).multiplyScalar(-L.z / (C.z - L.z)).add(L);
      aim(spot, exam.mesh);
      spot.shadow.camera.near = 0.002;
      spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hit);
      spot.target.updateMatrixWorld();

      // Lamp: stepped intensity keys on the click, dark on the off frame. Aimed at the blob's foot.
      lamp.light.visible = lk > 0;
      lamp.light.intensity = LAMP_I * lk;
      foot.set(x, 0, MARK_Z);
      aim(lamp.light, exam.mesh);
      lamp.light.target.position.copy(foot); lamp.light.target.updateMatrixWorld();
      lamp.update(t);
      shadeGlow.visible = lk > 0;
      halo.material.opacity = HALO * (lit ? 0.15 : 1) * flick;
      set.game.fire(firing(t, GULP + 0.5, 0));   // v7: the muzzle flashes on the CS2 clip's bursts (cues.js: from gulp2 + 0.5, in 0)
      face.color.copy(lit ? faceCream : faceCyan);
      face.intensity = lit ? FACE_LAMP : FACE_SCREEN;
      phoneLit.visible = phoneHalo.visible = t >= PH_ON - 1e-6 && t < GULP - 1e-6;
      const insert = t >= INS[0] - 1e-6 && t < INS[1] - 1e-6;
      if (insert) fx.set({ focus: 0.06, aperture: 0.002 }); else fx.set({ focus: FOCUS, aperture: 0.012 });
      ins.update(camera, { on: insert, arrive: f < 39 ? 0.5 : 1, touch: f === 42 ? 0.5 : f >= 43 ? 1 : 0, swipe: f === 45 ? 0.35 : f === 46 ? 0.75 : f >= 47 ? 1 : 0 });
    },
  };
}
