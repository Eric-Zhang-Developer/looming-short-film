// s03 · The laptop: the shadow climbs (docs/shots/s03.md, G4). v2 on the real-scale home desk (s02.ts's unit).
// He shrugs off the blob's look, opens his laptop and plays. The screen is a low, close light (README §4: a spot at
// the screen centre, aimed screen → blob → wall), so the blob's shadow climbs the wall at 3× (S = screenZ / (screenZ −
// B.z) = 0.0225 / 0.0075) the moment the screen wakes, and swells to 3.75 units on gulp 1 (4.5), the first meter step.
// Characters on 2s, light on 1s, boil 10/s.
// v8 (docs/notes/v8-beats.md, the flinch; 10 s): the lid opens on the practice problem (canvas.ts's practicePage), not the
// game. An insert holds it 1.5–5.0 to read; the countdown banner drops over it at 4.0; the wide comes back on his flinch at
// 5.0 (pen up, then down); on gulp1 (5.5) the game snaps over the problem on a hard cut (the alt-tab) and the AK sprays.
// The light, the blob's sizes and so every shadow number are v7's; only their times moved (the gulp 4.5 → 5.5).
import * as THREE from 'three';
import { phoneLight, dawnLight, ambient, aim } from '../lights.ts';
import { kf, ease } from '../core/ease.ts';
import type { Key } from '../core/ease.ts';
import { hash2 } from '../core/rng.ts';
import { createBlob } from '../blob.ts';
import { makeGator } from '../characters/gator.ts';
import { specPose } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import { DESK, B, LAPTOP, tools, homeDesk, seatReach } from './s02.ts';
import { banner, todoScreen, practicePage, COUNTDOWN } from '../props/canvas.ts';
import type { Pose } from '../puppet.ts';
import type { SpecOpts } from '../characters/poses.ts';
import type { ShotCtx } from '../film.ts';
import type { Palette } from './s02.ts';

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
  } else if (kind === 'page') {   // v8-s03: the whole laptop screen, centred and filling the frame's height (the practice problem)
    plane(1.62, 1.06, roundCard(1.62, 1.06, 0.03, '#202231'), [0, 0]);
    plane(1.52, 0.95, screen ?? solid('#2A3A66'), [0, 0]);
    rest = [0.4, 0.44, 0.7];
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
const BLOB_R = { start: 0.005, gulp1: 0.010 };            // v11 (docs/notes/v11-beats.md): the drop → 0.8× v10's birth on the alt-tab
// v3-readability: the light now sits at the *open* screen's centre (v3 lit from the closed lid's, S ≈ 2.5 in practice),
// so the shadow is the 4.33× the v3 note asked for; pulled back again so the gulp's 5.4 units stay in frame.
const CAM: CamKey = { pos: [0.068, 0.088, 0.47], look: [0.068, 0.056, 0.012] };
const FOCUS: Key<number>[] = [[6.0, 0.455], [7.0, 0.47]];                 // blob → wall over 6–7 (v8: after the gulp, with its glance up), eased, on 1s
// v4: the gulp is now 1 → 1.5×, so at v3's S 4.33 the swollen shadow (6.5 units) ran out of the top and right of frame. The light is re-solved to keep
// v3's 5.4 units after the gulp, which fit: S = 5.4 · 0.012 / 0.018 = 3.6, so SCREEN_Z = S · B.z / (S − 1) = 0.0208. Before the gulp it is 3.6 units.
// v11: the light stays where v10 put it (S 3.6); the shadow follows the smaller body, 1.5 units before the gulp and 3.0 after.
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
// v8: the AK in the mix (cues.ts): its spray (clip 8.7–10.6 s) from gulp1 for 2 s, then its single taps from clip 0.25 s.
// The taps' onsets (clip 0.36, 1.69, 2.64 s, by envelope, assets/raw/reels/cs2_ak.mp3) land at local 7.61, 8.94, 9.89: the
// nearest 2s drawings carry the muzzle flash and his key tap. During the spray the muzzle flashes on every 2s drawing.
const SPRAY = [66, 89], TAPS = [92, 108, 118];
const firingAt = (f: number) => (f >= SPRAY[0] && f < SPRAY[1] && f % 2 === 0) || TAPS.includes(f);
const PROBLEM = [1.5, 5.0];                                 // the insert on the practice problem (problemShown → the flinch)
const GULP = 66;                                            // gulp1, 5.5: the alt-tab

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
  // front edge, 0.67 / 0.83 the lid at 30° / 60°, 1.00 the lid open (laptopUp). v8: 1.17 the hand on the pen, 1.33 the pen
  // up and the lean in to read (held through the insert, leaning further); 5.0 the flinch jerks him upright, pen still up;
  // 5.17 the pen drops (pen down); 5.5 the hand on the keys (the alt-tab), 6.5 settled into v7's hunch.
  const penAt = new THREE.Vector3(DESK.pen[0] + 0.003, 0.001, DESK.pen[1]);
  const P: Record<string, Pose> = {
    grab: at(penAt, [0, 30], { head: -12 }),
    penUp: seat({ lean: 20, arm: 38, head: -6 }),
    penIn: seat({ lean: 24, arm: 40, head: -8 }),
    startle: seat({ lean: 4, arm: 58, far: -20, head: 8 }),
    recoil: seat({ lean: 8, arm: 5, head: 2 }),
    slump: seat({ lean: 10, arm: 35, head: -8 }),
    antic: seat({ lean: 10, arm: 35, head: -11 }),
    shrug: seat({ lean: 8, arm: 55, far: -20, head: 6 }),
    back: seat({ lean: 10, arm: 35, head: -10 }),
    keys: at(keys, [18, 30], { head: -10 }),
    hunch: at(keys, [22, 34], { head: -14 }),
  };
  P.tap = { ...P.hunch, arm_r: P.hunch.arm_r + 2 * DEG };
  for (const [, deg] of LID) P['lid' + deg] = at(lidEdge(deg), [6, 30], { head: -8 - 2 * ((deg < 30) as unknown as number) });   // true counts as 1
  const KEYS = [[0, 'slump'], [F(1), 'antic'], [F(3), 'shrug'], [F(4), 'back'], ...LID.map(([n, deg]) => [F(n), 'lid' + deg]),
    [F(14), 'grab'], [F(16), 'penUp'], [F(58), 'penIn'], [F(60), 'startle'], [F(62), 'recoil'], [F(64), 'recoil'],
    [F(GULP), 'keys'], [F(78), 'hunch'], ...TAPS.flatMap((n) => [[F(n - 1), 'hunch'], [F(n), 'tap'], [F(n + 1), 'hunch']]), [10, 'hunch']];
  // The pen (mirrored so its nib points +x, origin at the nib, as s18's): on the page's front edge, in his hand 1.17–5.17.
  const pen = T.cut(set.props, 'pen', [0.0075, null], 'pen', { anchor: [1, 0.5], flip: true });
  const penRest = [DESK.pen[0] + 0.0075, 0.0006, DESK.pen[1]] as const;
  const hp = new THREE.Vector3();

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
  // v8: the screen is the practice problem until the alt-tab. An insert of the whole screen 1.5–5.0 (PROBLEM); the
  // countdown banner drops into the page itself at 4.0 (so the wide's screen has it too at 5.0); on gulp1 the game.
  const page = practicePage({ body: COUNTDOWN.s03 }), game = set.glow.material.map;
  const ins = reminderInsert(ctx, { body: COUNTDOWN.s03, kind: 'page', screen: page.texture });
  scene.add(ins.group);

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
      // v8: guilt, then open-eyed on the problem (neutral), the flinch on 5.0, numb for the game once the spray settles.
      const took = act(gator, t, [[0, 'guilt'], [0.67, 'neutral'], [5.0, 'flinch'], [6.0, 'numb']], { slump: 0, breath: 6, blink: false });
      gator.face({ eyes: f < 2 ? 'side' : f < 5 ? 'closed' : took.eyes, mouth: took.mouth });
      gator.group.updateMatrixWorld(true);
      gator.hand!.getWorldPosition(hp);
      if (f >= 14 && f < 62) {
        const a = (f < 16 ? 15 : 50) * DEG;   // nib up and forward once it's lifted
        pen.g.rotation.set(0, 0, a); pen.g.position.set(hp.x + 0.003 * Math.cos(a), hp.y + 0.003 * Math.sin(a), DESK.hip[2] + 0.0128);
      } else { pen.g.rotation.set(-Math.PI / 2, 0, -0.1); pen.g.position.set(...penRest); }

      // The laptop: the hand on the lid at 0.42, the lift over 0.5–0.92, open on laptopUp (1.00). The screen glows from the
      // crack and the light rides it (see LID); the window and ambient give way as it brightens.
      const deg = lidAt(f), k = wakeK(deg), on = k > 0;
      set.setLid(deg);
      set.screenCentre(L);
      set.glow.visible = on;
      set.glow.material.color.setScalar(f >= 12 ? 1 : 0.35 + 0.5 * k);   // full game on laptopUp
      // v8: the problem until gulp1, then the game on a hard cut (the alt-tab), the muzzle on the AK (firingAt).
      page.set(f < 48 ? 0 : f < 50 ? 0.5 : 1);   // the banner arrives at 4.0: a full second to read before the flinch
      set.glow.material.map = f >= GULP ? game : page.texture;
      set.game.fire(firingAt(f));
      sun.light.intensity = sunI * (SUN_SCALE_OFF + (SUN_SCALE - SUN_SCALE_OFF) * k);   // before the wake the window is the room; after it the screen is
      amb.intensity = ambI * (AMB_K_OFF + (AMB_K - AMB_K_OFF) * k);

      // The Exam: open on him; side toward the screen at 1.08; back on him for the flinch (5.0). Gulp 1 (5.5, v8; v7 4.5):
      // squash 0.3 eyes closed on 5.417, snap to 1.5× stretched on 5.5, settled by 5.75. Then v7's glance up-right at its
      // own shadow (7.0–8.5, after the gulp now: it leads the eye to the rule), back on him, one held blink at 9.25.
      // v9 (v9-beats §2): `plead` up at him from 5.67 until the glance; the blink at 9.25 is two drawings (9.25–9.42).
      let eyesB = 'open', look = 1, squash = 0;
      if (f >= 13 && f < 60) { eyesB = 'side'; look = -1; }
      // v9: after the gulp it pleads up at him while he alt-tabs (5.67–6.92): "please don't".
      if (f >= GULP + 2 && f < 84) eyesB = 'plead';
      if (f >= 84 && f < 102) eyesB = 'side';
      if (f === GULP - 1 || f === 111 || f === 112) { squash = f === GULP - 1 ? 0.3 : 0; eyesB = 'closed'; }   // v9: the blink is two drawings
      const grown = f >= GULP, tg = F(f) - F(GULP);
      if (grown && f < GULP + 3) squash = -0.2 * Math.exp(-6 * tg) * Math.cos(18 * tg);   // settles by 5.75
      const r = grown ? BLOB_R.gulp1 : BLOB_R.start;
      exam.mesh.scale.setScalar(r / BLOB_R.start);
      exam.update(t, { squash, wobble: grown && f < GULP + 12 ? 0.8 : 1, eyes: eyesB, look, key: on ? spot : sun.light });

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

      const insert = t >= PROBLEM[0] - 1e-6 && t < PROBLEM[1] - 1e-6;
      fx.set(insert ? { focus: 0.06, aperture: 0.002 } : { focus: kf(t, FOCUS, ease), aperture: 0.01 });
      ins.update(camera, { on: insert, arrive: 0 });   // the banner is drawn in the page (page.set), not on the insert's own card
    },
  };
}
