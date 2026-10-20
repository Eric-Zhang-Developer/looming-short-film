// s23 · The sting (docs/shots/s23.md, v9-beats §1). After the credits: his desk at night under the lamp (s18's room, s18's
// last framing), his chair empty. The blob, hamster-sized (s17's r 0.005), dozes alone beside his phone, which lies face
// up and dark. 0.3 (stingBuzz) the phone buzzes and lights by itself, the Reel autoplays (s16's), and the blob's eyes
// slide to it. 0.8 (stingShadow) the phone's low light throws its shadow springing up the wall, huge (the light rule, one
// last time). 1.9 (stingLookUp) it looks up at its own shadow, a beat, and its lids go heavy. 2.3 (stingFlip) it flips the
// phone face down with a squash: the light goes, the shadow drops back to a puddle. 2.5 (stingLook) it looks at the
// camera, a slow blink, and the film cuts to black. The dread has learned the lesson too, and it obeys the film's rules:
// it doesn't grow (nothing gulped); only the shadow looms, and only while the phone's light is up.
// The wall shadow is s13's loom (the blob's own silhouette on the wall, springing up from 1× over half a second), sized
// and placed by the point-light projection from the screen (README §1: S = z_L / (z_L − z_B)).
// Eyes: the states that exist today. Its "here we go again" (1.9–2.3) is `tired` until v9-blob's `sad` merges; the
// orchestrator swapped it in (SAD below).
// Characters on 2s; light and camera on 1s; boil 10/s.
import * as THREE from 'three';
import { SHOTS } from '../timeline.ts';
import { lampLight, ambient } from '../lights.ts';
import { ease, easeOut, clamp, lerp } from '../core/ease.ts';
import { hash2, seedOf } from '../core/rng.ts';
import { createBlob } from '../blob.ts';
import { DESK, tools, homeDesk } from './s02.ts';
import { screenHalo } from './s03.ts';
import { LAMP_I, LAMP_Z, LAMP_AT, LAMP_AIM, PUSH } from './s18.ts';
import type { ShotCtx } from '../film.ts';

const ID = 's23', DEG = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID)!.beats;   // stingBuzz 0.3, stingShadow 0.8, stingLookUp 1.9, stingFlip 2.3, stingLook 2.5
const F = (n: number) => n / 12, on2s = (t: number) => Math.floor(t * 12 + 1e-4) / 12;

// ---------- tunables ----------
const R = 0.005;                                     // hamster-sized: s17's blob (SHRINK[6], README §1)
const BLOB: Vec3 = [0.026, 0, 0.0205];               // its contact point, on the desk's right, just behind and left of the phone
const PHONE: [number, number] = [0.039, 0.026];      // the phone, face up, long side along x, at the desk's right end, right of the
                                                     // blob so the blob doesn't hide it and the shadow is thrown up and left, clear of the lamp
const PHONE_TIP = 25 * DEG;                          // its screen tipped toward the lens (s16 tipped its 50°): flat, from W's low angle it's a sliver
const SCREEN_Y = 0.0009;                             // the screen's light, just over the glass
const GROW = 0.5, FALL = 0.25, LOOM_K = 0.85;        // s13's loom: springs up over 0.5 s, collapses in 0.25 s; its opacity
const REEL_AT = 0.65;                                // the lock screen, then the Reel with its sound (cues.ts: after the buzz's 0.33 s)
const FILL_I = 0.0016, FLICK = 0.03, HALO_K = 0.45;  // the phone's cyan on the wall and desk (no shadow), ±3% per drawing, the glow
const AMB = 0.9;                                     // night: the room's fill (s18's day ambient was 1.25)
const SAD = 'sad';
const CLOSE: CamKey = { pos: [0.008, 0.044, 0.170], look: [0.008, 0.026, 0.012] };   // where the push ends: the blob and its shadow
const PUSH_K = 0.45;                                 // how far toward CLOSE the camera pushes over the 3 s

export async function build(ctx: ShotCtx) {
  const { scene, camera, PALETTE, post } = ctx;
  const Cc = (k: keyof ShotCtx['PALETTE']) => new THREE.Color(PALETTE[k]);
  scene.background = Cc('navy').lerp(Cc('ink'), 0.5);
  const T = tools(ctx, ID);
  const set = await homeDesk(ctx, T, { pen: false });
  // His desk tonight: the lamp on, the chair empty. The laptop, page and calendar are put away: s18's calendar carries
  // marks (the X, "Final") drawn in s18 itself, and an un-crossed exam on the wall would undo the ending.
  set.lamp.g.position.z = LAMP_Z;
  set.page.g.visible = false; set.laptop.visible = false;
  set.calendar.g.visible = set.square.g.visible = set.circle.g.visible = false;
  const fx = post({ focus: 0.24, aperture: 0.006, lut: 'dawn' });

  // ---------- the phone: s02's face-up phone where it rests, a face-down twin, the Reel on its screen ----------
  const phone = set.phone;
  phone.g.position.set(PHONE[0], 0.0004, PHONE[1]); phone.g.rotation.set(-Math.PI / 2 + PHONE_TIP, 0, 0.04);
  const down = T.cut(set.props, 'phone_face_down', [0.0083, null], 'phone_down');
  down.g.position.set(PHONE[0], 0.0004, PHONE[1]); down.g.rotation.set(-Math.PI / 2 + PHONE_TIP, 0, 0.04);
  const reel = (() => {   // s16's Reel, no text: a tall video card in the phone's cyan, the UI's two bars
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 64 }), g = c.getContext('2d')!;
    const col = (a: keyof ShotCtx['PALETTE'], b: keyof ShotCtx['PALETTE'], k: number) => '#' + Cc(a).lerp(Cc(b), k).getHexString();
    g.fillStyle = col('phone', 'navy', 0.55); g.fillRect(0, 0, 128, 64);
    g.fillStyle = col('phone', 'cream', 0.3); g.fillRect(30, 6, 68, 52);
    g.fillStyle = col('phone', 'navy', 0.2); g.beginPath(); g.arc(64, 30, 13, 0, 2 * Math.PI); g.fill();
    g.fillStyle = col('cream', 'phone', 0.2); g.fillRect(104, 14, 8, 8); g.fillRect(104, 30, 8, 8);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const screenMat = new THREE.MeshBasicMaterial({ map: reel, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.0083 * 0.86, 0.0083 * 0.0068 / 0.015 * 0.8), screenMat);
  screen.position.z = 0.0001; phone.inner.add(screen);
  const halo = screenHalo(PALETTE, 0.010); scene.add(halo);
  halo.position.set(PHONE[0], SCREEN_Y + 0.0004, PHONE[1]);
  const L = new THREE.Vector3(PHONE[0], SCREEN_Y, PHONE[1]);   // the light: the screen's centre
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.09, 2); fill.position.set(L.x - 0.004, 0.012, L.z - 0.004); scene.add(fill);

  // ---------- the blob, its puddle, and its shadow on the wall ----------
  const exam = createBlob({ radius: R, seed: 1 });   // seed 1: the Exam itself
  exam.mesh.position.set(...BLOB); exam.mesh.castShadow = true;   // the lamp is behind it: its own shadow falls forward on the desk
  exam.stain.position.set(BLOB[0], 0.0003, BLOB[2]); exam.stain.material.opacity = 0.3;
  scene.add(exam.mesh, exam.stain);
  const loom = new THREE.Mesh(exam.mesh.geometry, exam.silhouette()); scene.add(loom);
  const SHADOW_S = L.z / (L.z - BLOB[2]);              // ≈ 4.6: the phone's light 5.5 mm in front of the blob
  const placeLoom = (s: number) => {                   // the projection from the screen at scale s (1 = the blob's own size)
    loom.position.set(L.x + (BLOB[0] - L.x) * s, L.y + (0 - L.y) * s, 0.0005);
    loom.scale.setScalar(s);
    (loom.material as THREE.MeshBasicMaterial).userData.soft.value = 0.003 / (s * R) * 0.2;
  };

  // ---------- light: s18's lamp, on; a night ambient; the shade glowing ----------
  const lamp = lampLight({ angle: 0.95, penumbra: 0.9, intensity: LAMP_I });
  lamp.light.position.set(...LAMP_AT); lamp.light.target.position.set(...LAMP_AIM); lamp.light.shadow.camera.near = 0.002;
  const amb = ambient(); amb.intensity *= AMB;
  scene.add(lamp.light, lamp.light.target, amb);
  {   // s18's: the painted shade's trapezoid, lit from inside
    const k = DESK.lamp.h / 212, s = new THREE.Shape([[-52, 0], [52, 0], [30, 75], [-30, 75]].map(([x, y]) => new THREE.Vector2(x * k * 0.92, y * k * 0.94)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: PALETTE.lamp, transparent: true, opacity: 0.55, toneMapped: false }));
    m.position.set(DESK.lamp.x, DESK.lampMouth[1] + 0.0005, LAMP_Z + 0.0008); scene.add(m);
  }

  const look = new THREE.Vector3();
  return {
    exam,
    update(t: number) {
      T.boil(t);
      const tc = on2s(t);

      // camera (on 1s): s18's last framing, pushing slowly in toward the blob and its wall
      const tf = Math.floor(t * 24 + 1e-6) / 24, k = PUSH_K * ease(tf / 3);
      camera.position.set(...(PUSH.pos.map((v, i) => lerp(v, CLOSE.pos[i], k)) as Vec3));
      camera.lookAt(look.set(...(PUSH.look.map((v, i) => lerp(v, CLOSE.look[i], k)) as Vec3)));
      fx.set({ focus: camera.position.distanceTo(exam.mesh.position) });

      // the phone (light on 1s): dark; lit from the buzz (lock screen, then the Reel, ±3% per drawing) to the flip
      const lit = tf >= B.stingBuzz - 1e-6 && tf < B.stingFlip - 1e-6;
      const level = lit ? (tf < REEL_AT - 1e-6 ? 0.6 : 1) * (1 + FLICK * (2 * hash2(seedOf(ID, 'feed') % 65536, Math.round(tf * 12)) - 1)) : 0;
      screen.visible = lit; screenMat.color.setScalar(level);
      halo.visible = lit; halo.material.opacity = HALO_K * level;
      fill.intensity = FILL_I * level;
      // the buzz: the phone shivers on the desk for a quarter second (on 1s)
      const buzz = tf >= B.stingBuzz - 1e-6 && tf < B.stingBuzz + 0.25 ? 0.00025 * (Math.round(tf * 24) % 2 ? 1 : -1) : 0;
      // the flip (on 2s): two drawings on edge (s13's), then face down from stingFlip + 2 drawings
      const flip = tc < B.stingFlip - 1e-6 ? -1 : Math.floor((tc - B.stingFlip) * 12 + 1e-4);
      phone.g.visible = flip < 1; down.g.visible = !phone.g.visible;
      phone.g.scale.y = down.g.scale.y = flip === 0 || flip === 1 ? 0.45 : 1;
      phone.g.position.x = down.g.position.x = PHONE[0] + buzz;

      // the shadow: springs up from 1× over GROW from stingShadow (easeOut), collapses to 1× over FALL from the flip
      const dw = tf - B.stingShadow, dd = tf - B.stingFlip, fall = clamp(dd / FALL);
      const grown = 1 + (SHADOW_S - 1) * easeOut(dw / GROW), s = dd < 0 ? grown : 1 + (grown - 1) * (1 - easeOut(fall));
      loom.visible = dw > 0 && fall < 1;
      placeLoom(s);
      (loom.material as THREE.MeshBasicMaterial).opacity = LOOM_K * clamp(dw / 0.1) * (1 - fall);

      // ---- the blob (on 2s) ----
      let eyes = 'closed', lookDir = 1, squash = 0, lean = 0;
      const kick = (t0: number, a: number) => (tc < t0 ? 0 : a * Math.exp(-6 * (tc - t0)) * Math.cos(18 * (tc - t0)));
      if (tc < B.stingBuzz + F(1)) eyes = 'closed';                                 // dozing
      else if (tc < B.stingBuzz + F(3)) eyes = 'open';                              // the buzz wakes it
      else if (tc < B.stingLookUp) eyes = 'side';                                   // eyes slide to the phone (+x)
      else if (tc < B.stingLookUp + F(2)) { eyes = 'side'; lookDir = -1; }         // up and back at its shadow
      else if (tc < B.stingFlip - F(1)) { eyes = SAD; lookDir = -1; }              // a beat: here we go again
      else if (tc < B.stingLook) eyes = 'closed';                                   // the push, eyes shut with effort
      else if (tc < B.stingLook + F(2)) eyes = 'open';                              // at the camera
      else if (tc < B.stingLook + F(3)) eyes = 'tired';                             // the slow blink: down,
      else if (tc < B.stingLook + F(5)) eyes = 'closed';                            // held,
      else if (tc < B.stingLook + F(6)) eyes = 'tired';                             // up
      else eyes = 'open';
      squash += kick(B.stingBuzz, 0.25);                                            // a startle at the buzz
      if (tc >= B.stingLookUp && tc < B.stingFlip - F(1)) { squash -= 0.15; lean = 6; }   // stretched up, tipped toward its shadow to see the top of it
      if (tc >= B.stingLookUp + F(2) && tc < B.stingFlip - F(1)) squash += 0.25;          // …and it sags
      if (tc >= B.stingFlip - F(1) && tc < B.stingFlip + F(1)) { squash = 0.6; lean = -14; }   // over onto the phone's edge: the squash
      else squash += kick(B.stingFlip + F(1), 0.4);
      exam.mesh.position.x = BLOB[0] + (tc >= B.stingFlip - F(1) && tc < B.stingFlip + F(1) ? 0.0012 : 0);
      exam.mesh.rotation.z = lean * DEG;   // + tips its top left (toward its shadow), − right (onto the phone)
      exam.update(t, { squash: clamp(squash, -1, 1), wobble: 0.6, eyes, look: lookDir, key: lamp.light });
    },
  };
}
