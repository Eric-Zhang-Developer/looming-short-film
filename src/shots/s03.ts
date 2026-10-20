// s03 · The laptop: the shadow climbs (docs/shots/s03.md, G4). v2 on the real-scale home desk (s02.js's unit).
// He shrugs off the blob's look, opens his laptop and plays. The screen is a low, close light (README §4: a spot at
// the screen centre, aimed screen → blob → wall), so the blob's shadow climbs the wall at 3× (S = screenZ / (screenZ −
// B.z) = 0.0225 / 0.0075) the moment the screen wakes, and swells to 3.75 units on gulp 1 (4.5), the first meter step.
// Characters on 2s, light on 1s, boil 10/s.
import * as THREE from 'three';
import { phoneLight, dawnLight, ambient, aim } from '../lights.ts';
import { kf, ease } from '../core/ease.ts';
import { hash2 } from '../core/rng.ts';
import { createBlob } from '../blob.ts';
import { makeGator } from '../characters/gator.ts';
import { specPose } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import { DESK, B, LAPTOP, tools, homeDesk, seatReach, firing } from './s02.ts';
import { banner, todoScreen, COUNTDOWN } from '../props/canvas.ts';
import type { Pose } from '../puppet.ts';
import type { SpecOpts } from '../characters/poses.ts';
import type { ShotCtx, Palette } from './s02.ts';

const ID = 's03', DEG = Math.PI / 180;

// v3-readability: a soft glow round a screen so the light source reads at phone size (s06 uses it too). Additive, no
// shadow, unlit: it only says "this is where the light comes from".
export function screenHalo(PALETTE: Palette, size = 0.022) {
  const c = Object.assign(document.createElement('canvas'), { width: 64, height: 64 }), g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)'); grd.addColorStop(0.25, 'rgba(255,255,255,0.35)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: PALETTE.phone, blending: THREE.AdditiveBlending,
    transparent: true, depthWrite: false, toneMapped: false }));
  s.scale.setScalar(size); s.castShadow = false;
  return s;
}
const card = (W: number, H: number, draw: (g: CanvasRenderingContext2D, W: number, H: number) => void) => {
  const c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d')!;
  draw(g, W, H);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

// v6-canvas-b: the reminder as an insert. The banner has to read at 400 px, and on a phone 8 mm long or a laptop 18 mm
// wide in a wide shot it can't, so each reminder cuts to the screen: the device fills the frame, drawn over the shot's
// scene in front of its camera (unlit: screens are self-lit; the thumb is lit by the screen). Everything is in frame
// units (1 = the frame's height) and the group is scaled to the frustum at D, so it frames the same at any camera.
// update(camera, { on, arrive, swipe, open, touch }): arrive 0..1 slides the banner in; swipe 0..1 flicks it along
// `dir`; touch 0..1 brings the thumb from off frame onto the banner. todo: true (s09a) makes the phone's screen
// v6-canvas-a's To-do screen with the banner drawn in it, so open 0..1 expands it into the exam's detail (the module's
// set(); its swipe goes right); otherwise the module's banner card rides on its own plane over the shot's screen.
export function reminderInsert({ PALETTE }: Pick<ShotCtx, 'PALETTE'>, { body, kind = 'phone', screen = null, back = PALETTE.navy, dir = [-1, 0], todo = false }: { body: string, kind?: string, screen?: THREE.Texture | null, back?: THREE.ColorRepresentation, dir?: number[], todo?: boolean }) {
  const D = 0.06, g = new THREE.Group(); g.visible = false;
  let order = 1000;
  const plane = (w: number, h: number, map: THREE.Texture, at: number[]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, toneMapped: false, transparent: true, depthTest: false }));
    m.renderOrder = order++; m.position.set(at[0], at[1], 0); g.add(m); return m;
  };
  const bg = new THREE.Color(back), hex = (c: THREE.Color) => '#' + c.getHexString();
  plane(2.4, 1.4, card(64, 64, (x) => {
    const r = x.createRadialGradient(32, 26, 4, 32, 32, 46);
    r.addColorStop(0, hex(bg.clone().lerp(new THREE.Color(PALETTE.cream), 0.2))); r.addColorStop(1, hex(bg.clone().multiplyScalar(0.35)));
    x.fillStyle = r; x.fillRect(0, 0, 64, 64);
  }), [0, 0]);
  const solid = (c: string) => card(8, 8, (x) => { x.fillStyle = c; x.fillRect(0, 0, 8, 8); });
  const roundCard = (w: number, h: number, r: number, fill: string) => card(256, Math.round(256 * h / w), (x, W, H) => { rr(x, 0, 0, W, H, r * W / w); x.fillStyle = fill; x.fill(); });
  // The device: a phone's top (w 1.7) or a laptop screen's top-right corner; the banner's rest box [cx, top, w].
  let rest;
  const scr = todo ? todoScreen() : null;
  if (scr) {   // the To-do screen, w 1.5, its top at 0.46: down to the detail's due line (242 pt of 390) in frame
    const sw = 1.5, sh = sw * scr.H / 390;
    plane(sw + 0.1, sh + 0.1, roundCard(sw + 0.1, sh + 0.1, 0.2, '#16182A'), [0, 0.51 - (sh + 0.1) / 2]);
    plane(sw, sh, scr.texture, [0, 0.46 - sh / 2]);
    rest = [0, 0.46, sw];
  } else if (kind === 'phone') {
    plane(1.7, 2.6, roundCard(1.7, 2.6, 0.2, '#16182A'), [0, 0.47 - 1.3]);
    plane(1.6, 2.5, screen ?? solid('#2A3A66'), [0, 0.42 - 1.25]);
    rest = [0, 0.37, 1.5];
  } else {
    plane(3.34, 2.14, roundCard(3.34, 2.14, 0.06, '#202231'), [0.86 - 1.6, 0.44 - 1.0 + 0.04]);
    plane(3.2, 2.0, screen ?? solid('#2A3A66'), [0.86 - 1.6, 0.44 - 1.0]);
    rest = [0.06, 0.38, 1.5];
  }
  const B = banner({ body });
  const ban = plane(1, 1, B.texture, [0, 0]);
  ban.visible = !scr;
  // The thumb: gator green, darkened (lit only by the screen), a lighter nail; it comes in from the bottom right.
  const thumb = plane(0.42, 0.84, card(256, 512, (x) => {
    x.fillStyle = hex(new THREE.Color(PALETTE.gator).multiplyScalar(0.8));
    rr(x, 28, 10, 200, 560, 100); x.fill(); x.lineWidth = 8; x.strokeStyle = '#2C3A26'; x.stroke();
    x.fillStyle = hex(new THREE.Color(PALETTE.gator).lerp(new THREE.Color(PALETTE.cream), 0.45));
    rr(x, 70, 40, 116, 130, 50); x.fill();
  }), [0, 0]);
  thumb.rotation.z = 0.45;
  const fwd = new THREE.Vector3();
  return {
    group: g,
    update(camera: THREE.PerspectiveCamera, { on = false, arrive = 1, swipe = 0, open = 0, touch = 0 }: { on?: boolean, arrive?: number, swipe?: number, open?: number, touch?: number } = {}) {
      g.visible = on;
      if (!on) return;
      camera.updateMatrixWorld(); camera.getWorldDirection(fwd);
      g.position.copy(camera.position).addScaledVector(fwd, D); g.quaternion.copy(camera.quaternion);
      g.scale.setScalar(2 * D * Math.tan(camera.fov * Math.PI / 360));
      if (scr) scr.set(0, { banner: arrive > 0 ? B : null, swipe, open, clock: '3:00' });
      // (todo) the banner sits in the texture at x 14, y 52 pt, 362 × 82: the plane below only places the thumb on it.
      const [cx, top, w] = scr ? [0, rest[1] - 52 * rest[2] / 390 + rest[2] * 362 / 390 * B.h / B.w / 2, rest[2] * 362 / 390] : rest, h = w * B.h / B.w;
      ban.scale.set(w, h, 1);
      ban.position.set(cx + dir[0] * 2.2 * swipe, top - h / 2 + 0.14 * (1 - arrive) + dir[1] * 1.2 * swipe, 0);
      ban.material.opacity = arrive * (1 - 0.6 * swipe);
      // The thumb's tip rests on the banner's right third, and rides it while swiping.
      const tx = ban.position.x + 0.22 * w + 0.17, ty = ban.position.y - 0.05 - 0.38, ox = 1.3, oy = -1.0;
      thumb.visible = touch > 0;
      thumb.position.set(ox + (tx - ox) * touch, oy + (ty - oy) * touch, 0);
    },
  };
}
const BLOB_R = { start: 0.012, gulp1: 0.018 };            // METER.birth → METER.gulp1 (README §1, v4: 1.5×)
// v3-readability: the light now sits at the *open* screen's centre (v3 lit from the closed lid's, S ≈ 2.5 in practice),
// so the shadow is the 4.33× the v3 note asked for; pulled back again so the gulp's 5.4 units stay in frame.
const CAM: CamKey = { pos: [0.068, 0.088, 0.47], look: [0.068, 0.056, 0.012] };
const FOCUS = [[2.0, 0.455], [3.0, 0.47]];                 // blob → wall over 2–3, eased, on 1s
// v4: the gulp is now 1 → 1.5×, so at v3's S 4.33 the swollen shadow (6.5 units) ran out of the top and right of frame. The light is re-solved to keep
// v3's 5.4 units after the gulp, which fit: S = 5.4 · 0.012 / 0.018 = 3.6, so SCREEN_Z = S · B.z / (S − 1) = 0.0208. Before the gulp it is 3.6 units.
const SCREEN_Z = 3.6 * B[2] / (3.6 - 1);
const SPOT_I = 0.022, FILL_K = 0.15, SUN_K = 0.35, SUN_SCALE = 0.8 * 0.03, SUN_SCALE_OFF = 0.8 * 0.3;   // v3: after the wake the window drops from 30% to 3% so the shadow goes dark, not pink
const AMB_K = 0.2, AMB_K_OFF = 0.55;                                        // v3: ambient trimmed so the shadow is the darkest thing on the wall
// v7-laptop: the halo was for a screen too small to read as a light; on the 1.8× screen at full strength it milked the game out.
export const HALO = 0.45;
const FLICK = 0.05;                                        // ±5% game flicker per 2s drawing
const FACE_I = 0.012;                                      // character fill (README §10): cyan-navy, no shadow, dies before the wall
const F = (n: number) => n / 12, fr = (t: number) => Math.floor(t * 12 + 1e-6);
// v3-readability: the rule has to be seen as cause and effect. The screen wakes as the lid cracks and the light rides the
// lid up, toward the wall and the blob (the open screen sits 5 mm nearer the wall than the closed one), so the shadow
// climbs and swells with each drawing of the lift: S 2.6 at 15° → 4.33 at 110°. Brightness rides the angle too.
const LID = [[5, 0], [6, 15], [7, 30], [8, 45], [9, 60], [10, 75], [11, 92], [12, 110]];   // [drawing, degrees]
const lidAt = (f: number) => LID.reduce((d, [n, deg]) => (f >= n ? deg : d), 0);
const wakeK = (deg: number) => (deg < 15 ? 0 : 0.3 + 0.7 * (deg - 15) / 95);   // 0.3 on the crack, 1 open
const TAPS = [2.33, 2.67, 3.17, 3.5, 4.0, 4.67, 5.17, 5.67, 6.17, 6.67].map((s) => Math.round(s * 12));   // v4: the shot runs to 7.0; he keeps gaming

export async function build(ctx: ShotCtx) {
  const { scene, camera, PALETTE, post } = ctx;
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.set(...CAM.pos);
  camera.lookAt(...CAM.look);
  const T = tools(ctx, ID);
  const set = await homeDesk(ctx, T, LAPTOP);
  set.laptop.position.z += SCREEN_Z - DESK.screenZ;
  const fx = post({ focus: FOCUS[0][1], aperture: 0.01, lut: 'dawn' });

  // ---- the Student and his hand targets (solved through this camera) ----
  const gator = await makeGator(ctx, { seed: 2 });
  gator.group.position.set(...DESK.hip);
  scene.add(gator.group);
  const cam = new THREE.Vector3(...CAM.pos), wp = (o: THREE.Object3D, x: number, y: number, z: number) => { set.laptop.updateMatrixWorld(true); return o.localToWorld(new THREE.Vector3(x, y, z)); };
  set.setLid(0);
  const lidEdge = (deg: number) => { set.setLid(deg); const p = wp(set.lid.g, 0, set.lid.size[1], 0); set.setLid(0); return p; };
  // v7: the 1.8× deck reaches in front of his hand's plane (z 0.029), so a fingertip solved onto the keys themselves sat under
  // the deck, hidden; it hovers 3 mm over them instead (the camera ray through it still lands on the keys).
  const keys = wp(set.laptop, 0, 0.0038, 0.002 * LAPTOP.laptopScale);
  const seat = (o: SpecOpts) => specPose({ leg: 60, farLeg: 54, far: -40, ...o });
  const at = (p: THREE.Vector3, range: [number, number], o: SpecOpts = {}) => { const r = seatReach(cam, p, range); return seat({ lean: r.lean, arm: r.arm, ...o }); };
  // [drawing, pose, shoulder drop (m)]. 0–0.17 anticipation, 0.17–0.33 the shrug, 0.42 back, 0.50 hand on the lid's
  // front edge, 0.67 / 0.83 the lid at 30° / 60°, 1.00 hands on the keys (laptopUp), 2.00 settled into the hunch.
  const P: Record<string, Pose> = {
    slump: seat({ lean: 10, arm: 35, head: -8 }),
    antic: seat({ lean: 10, arm: 35, head: -11 }),
    shrug: seat({ lean: 8, arm: 55, far: -20, head: 6 }),
    back: seat({ lean: 10, arm: 35, head: -10 }),
    keys: at(keys, [18, 30], { head: -10 }),
    hunch: at(keys, [22, 34], { head: -14 }),
  };
  P.tap = { ...P.hunch, arm_r: P.hunch.arm_r + 2 * DEG };
  for (const [, deg] of LID) P['lid' + deg] = at(lidEdge(deg), [6, 30], { head: -8 - 2 * ((deg < 30) as unknown as number) });   // true counts as 1
  const KEYS = [[0, 'slump'], [F(1), 'antic'], [F(3), 'shrug'], [F(4), 'back'], ...LID.slice(0, -1).map(([n, deg]) => [F(n), 'lid' + deg]),
    [F(12), 'keys'], [F(24), 'hunch'], ...TAPS.flatMap((n) => [[F(n - 1), 'hunch'], [F(n), 'tap'], [F(n + 1), 'hunch']]), [7, 'hunch']];

  // ---- the Exam at B ----
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh, exam.stain);
  exam.mesh.position.fromArray(B);
  exam.stain.position.set(B[0], 0.0003, B[2]);

  // ---- light. Key: the laptop screen (README §4). Fill: the window at 30%, ambient, a cyan face fill at the screen.
  const L = new THREE.Vector3();
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 0.6, intensity: 0 });
  spot.position.copy(L);
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);
  fill.position.copy(L).add(new THREE.Vector3(-0.004, 0.004, 0));
  const sun = dawnLight();
  sun.light.target.position.set(0.01, 0.03, 0.01);
  Object.assign(sun.light.shadow.camera, { left: -0.15, right: 0.15, top: 0.15, bottom: -0.15 });
  sun.light.shadow.camera.updateProjectionMatrix();
  sun.update(0, SUN_K);
  sun.light.position.set(0.8, 0.6, 0.6);
  const sunI = sun.light.intensity;
  const face = new THREE.PointLight(new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.navy), 0.4), 0, 0.07, 2);
  face.position.set(-0.025, 0.035, 0.065);
  scene.add(face);
  const amb = ambient();
  const ambI = amb.intensity;
  scene.add(spot, spot.target, fill, sun.light, sun.light.target, amb);
  const halo = screenHalo(PALETTE); scene.add(halo);
  // v6-canvas-b: gulp1's cause. Mid-game the Canvas reminder pops top-right on his screen: an insert of the laptop's
  // screen 3.25–4.5 (the banner in at 3.25, read to 4.25, flicked off to the right 4.25–4.42, his trackpad swipe), cut
  // back to the wide on the gulp (4.5), so the swipe lands on it.
  const ins = reminderInsert(ctx, { body: COUNTDOWN.s03, kind: 'laptop', screen: set.glow.material.map, dir: [1, 0] });
  scene.add(ins.group);
  const INS = [3.25, 4.5];

  const C = new THREE.Vector3(), hit = new THREE.Vector3();
  return {
    exam, gator, spot,
    update(t: number) {
      T.boil(t);
      const f = fr(t);

      // The Student.
      gator.boil(t, 10);
      gator.blend(P, KEYS as [number, string][], t);
      gator.follow('tail', t, { k: 6, w: 18 });
      gator.group.position.y = DESK.hip[1] + (f >= 2 && f < 4 ? -0.0015 : 0);
      // v4 acting: guilt (the look at the blob), then numb for the game. slump 0: his hands are on the lid and keys, so the pose
      // owns the lean. The spec's own eye and mouth beats (the shrug's shut eyes, the small smile) go over the preset's face.
      act(gator, t, [[0, 'guilt'], [0.67, 'numb']], { slump: 0, breath: 6, blink: false });
      const eyes = f < 2 ? 'side' : f < 5 ? 'closed' : 'tired';
      const mouth = f < 24 ? 'line' : f >= 42 && f < 46 ? 'smile' : 'neutral';
      gator.face({ eyes, mouth });

      // The laptop: the hand on the lid at 0.42, the lift over 0.5–0.92, open on laptopUp (1.00). The screen glows from the
      // crack and the light rides it (see LID); the window and ambient give way as it brightens.
      const deg = lidAt(f), k = wakeK(deg), on = k > 0;
      set.setLid(deg);
      set.screenCentre(L);
      set.glow.visible = on;
      set.glow.material.color.setScalar(f >= 12 ? 1 : 0.35 + 0.5 * k);   // full game on laptopUp
      set.game.fire(firing(t, 1.25, 0));   // v7: the muzzle flashes on the CS2 clip's bursts (cues.js: from laptopUp + 0.25, in 0)
      sun.light.intensity = sunI * (SUN_SCALE_OFF + (SUN_SCALE - SUN_SCALE_OFF) * k);   // before the wake the window is the room; after it the screen is
      amb.intensity = ambI * (AMB_K_OFF + (AMB_K - AMB_K_OFF) * k);

      // The Exam: open on him; side toward the screen at 1.08; up-right at its shadow at 3.0; back to him at 4.33.
      // Gulp 1 (4.5): squash 0.3 eyes closed on 4.417, snap to 1.25× stretched on 4.5, settled by 4.75.
      let eyesB = 'open', look = 1, squash = 0;
      if (f >= 13 && f < 52) { eyesB = 'side'; look = f < 36 ? -1 : 1; }
      if (f === 53 || f === 78) { squash = f === 53 ? 0.3 : 0; eyesB = 'closed'; }   // 4.417 the swallow; 6.5 the held blink (v4)
      const grown = f >= 54;
      if (f >= 54 && f < 57) squash = -0.2 * Math.exp(-6 * (F(f) - 4.5)) * Math.cos(18 * (F(f) - 4.5));   // settles by 4.75
      const r = grown ? BLOB_R.gulp1 : BLOB_R.start;
      exam.mesh.scale.setScalar(r / BLOB_R.start);
      exam.update(t, { squash, wobble: f >= 54 && f < 66 ? 0.8 : 1, eyes: eyesB, look, key: on ? spot : sun.light });

      // Key on 1s: 0 before 1.00, full from that frame, ±5% flicker per drawing. Aimed screen → blob centre → wall.
      const flick = 1 + FLICK * (2 * hash2(1303, f) - 1);
      spot.intensity = SPOT_I * k * flick;
      spot.position.copy(L);
      fill.position.copy(L).add(new THREE.Vector3(-0.004, 0.004, 0));
      fill.intensity = FILL_K * spot.intensity;
      face.intensity = FACE_I * k;
      halo.position.copy(L).add(new THREE.Vector3(0, 0, 0.002));
      halo.visible = on; halo.material.opacity = HALO * k * flick;
      C.set(B[0], r, B[2]);
      hit.subVectors(C, L).multiplyScalar(-L.z / (C.z - L.z)).add(L);
      aim(spot, exam.mesh);
      spot.shadow.camera.near = 0.002;
      spot.shadow.camera.updateProjectionMatrix();
      spot.target.position.copy(hit);
      spot.target.updateMatrixWorld();

      const insert = t >= INS[0] - 1e-6 && t < INS[1] - 1e-6;
      fx.set(insert ? { focus: 0.06, aperture: 0.002 } : { focus: kf(t, FOCUS, ease), aperture: 0.01 });
      ins.update(camera, { on: insert, arrive: f < 40 ? 0.5 : 1, swipe: f === 51 ? 0.35 : f === 52 ? 0.75 : f >= 53 ? 1 : 0 });
    },
  };
}
