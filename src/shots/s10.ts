// s10 · The threshold (docs/shots/s10.md, v4; climax-a2). Rebuilt under the old file name (the stacks shot is cut).
// Marston's entrance vestibule at night, from inside, looking out through the glass doors at the plaza he crossed, lamp 5
// behind him. He pushes the door; on lightFlood he and the blob stand under the warm overhead panel and the shadow snaps
// from a long tongue (lamp 5, far and low) to a puddle (the panel, overhead): one frame, because the far light was out-shone,
// not because anything moved. The blob blinks, confused; he looks up; close-up: the painted heads, resolve → relief on the
// exhale. Characters on 2s, light and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { ambient, aim } from '../lights.ts';
import { kf, ease, onTwos } from '../core/ease.ts';
import { SHOTS } from '../timeline.ts';
import { makeGator, HIP, hipHeight } from '../characters/gator.ts';
import { POSES, specPose, walk } from '../characters/poses.ts';
import { act } from '../characters/acting.ts';
import { createBlob } from '../blob.ts';
import { kitTools, mppOf, noCast, glow, wallCanvas } from './s11.ts';
import { lamppost, lampKey, LAMP_COOL, LAMP_H, KEY_I } from './s09c.ts';
import { closeupRig, HEAD_AT } from './s09b.ts';
import type { ShotCtx } from '../film.ts';
import type { PaperOptions } from '../paper.ts';

const ID = 's10', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID)!.beats;          // doorPush 1, lightFlood 1.5, blobBlinks 2.5, exhale 5
const BLOB_R = { start: 0.030 };                         // 2.5× (README §1, Q16)

// The doors at z 0.10, not the spec's table's 0.20: the spec's own panel (z 0.13, "just inside the door"), its pool
// (0.07…0.19) and his stop (z 0.13) are all inside only if the sill is nearer the plaza. Everything else as specced.
const DOOR_Z = 0.10, DOOR_W = 0.06, DOOR_H = 0.12, BAR_Y = 0.045, OPEN = 80;   // 80°, not 60: at 60 the leaf's tip met his side
const LAMP5 = [-0.03, -0.25];                            // s09c's lamp 5 (its light point at LAMP_H)
const PANEL = [0.0, 0.145, 0.13], SPOT_Y = 0.142;        // the recessed panel over the threshold
const STOP = [-0.040, 0.13];   // him under the panel at lightFlood. fix-threshold: 1.8 cm left of climax-a2's −0.022, so
                               // his snout, now in profile toward the blob, ends at its edge instead of behind it
const BLOB_IN = [0.032, 0.16];   // at his feet, in the pool, 3 cm in front of the panel: a cutout lit from straight above casts a
                                 // line; this lays its puddle forward on the floor where the camera sees it (README §3's 6 mm, more)
// Him on 2s: [t, [x, z]]. A step from the glass, the hand to the bar, the push, one step across the sill, the stop.
const HIM: [number, number[]][] = [[0, [-0.02, 0.060]], [0.5, [-0.02, 0.080]], [B.doorPush, [-0.02, 0.082]], [B.lightFlood, STOP]];
const CU_I = 0.010, WARM_I = 0.020, ROOM_I = 0.15, ROOM_FLOOD = 0.30, AMB_K = 0.35, FILL_I = 0.006, PANEL_GLOW = 0.9;
const CAM_W: CamKey = { pos: [0.0, 0.060, 0.75], look: [0.0, 0.068, 0.10] };   // the panel in the top 15%, the door pair whole
const CU = B.exhale - 1.0;                               // the cut to the close-up, 4.0
const TURN_Y = -20;   // fix-threshold: on the stop he turns to the blob, side view angled 20° to us (cold-v4 1:44: front-on "reads as a frog")

export async function build({ scene, camera, assets, PALETTE, post }: ShotCtx) {
  const C = (k: keyof ShotCtx['PALETTE']) => new THREE.Color(PALETTE[k]), hex = (c: THREE.Color) => '#' + c.getHexString();
  const COOL = LAMP_COOL(PALETTE), WARM = C('lamp').lerp(C('cream'), 0.3);
  scene.background = C('navy').lerp(C('ink'), 0.4);
  const tools = kitTools(ID), { sheet, art, boil } = tools;
  const [kit, ext] = await Promise.all([assets.load('marston_kit'), assets.load('marston_ext_kit')]);
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const canvas = (w: number, h: number) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const flat = <T extends THREE.Object3D>(m: T): T => { m.rotation.x = -Math.PI / 2; return m; };
  const plain = (color: string, size: number[], key: string, opts: PaperOptions = {}) => { const m = sheet({ path: RECT, color, size, key: `${ID}-${key}`, res: 1024, rim: 'none', ...opts }, scene); m.castShadow = false; return m; };

  // ---- Outside: the night sky, an oak, the plaza to the sill, lamp 5.
  plain(hex(C('navy').multiplyScalar(0.85)), [2.0, 1.0], 'night_sky').position.set(0, 0.2, -1.5);
  noCast(art(ext.pieces.oak_canopy, 'oak', { mpp: 0.5 * mppOf(ext, 'oak_canopy'), anchor: [326, 200], parent: scene, res: 1024 })).position.set(0.1, 0.21, -0.9);
  // fix-threshold: up 5 cm. At 0.16 its moss hung into the top of the door opening as torn tongues: the cold viewer's icicles.
  flat(plain(hex(C('navy').multiplyScalar(0.75)), [1.2, 0.8], 'plaza')).position.set(0, 0, DOOR_Z - 0.4);
  const lantern = lamppost(ext, art, scene, 'lamp5', LAMP5, COOL);
  const pool5 = new THREE.PointLight(COOL, 0.002, 0.22, 2); pool5.position.set(LAMP5[0], LAMP_H, LAMP5[1]); scene.add(pool5);

  // ---- The door wall: marston_kit's navy-grey wall with the door pair's opening; the glass doors in it.
  // fix-threshold: glass, not ice (cold-v4 1:42, "a frosted, iced-over glass door"). The ice was the wall's own torn hole:
  // its broken white fibre rim and the jags hanging off the top edge read as frost and icicles, the kraft frames as a
  // window, the cream haze on the panes as frosting. Now: the wall without a rim, a dark metal-grey surround that covers
  // the hole's torn edge, dark grey door frames, and clear panes that carry one soft diagonal reflection each.
  const METAL = C('navy').lerp(C('cream'), 0.10).lerp(C('ink'), 0.25), BAR = C('navy').lerp(C('cream'), 0.4);
  const DULL = { edgeCatch: 0 };                          // lamp 5 backlights these: a caught torn edge is the frost
  const WW = [0.6, 0.15];
  const wall = sheet({ art: wallCanvas(kit, WW, [[WW[0] / 2 - DOOR_W, 0, WW[0] / 2 + DOOR_W, DOOR_H]]), size: WW, key: `${ID}-door_wall`, res: 2048, rim: 'none', mat: DULL }, scene);
  wall.position.set(0, WW[1] / 2, DOOR_Z); wall.castShadow = false;
  const SUR = 0.011, PXM = 3000;                           // the surround's band (m) and its canvas px per metre
  const surround = (() => {                                // a frame round the opening: SUR wide outside it, 4 mm inside
    const w = 2 * (DOOR_W + SUR), h = DOOR_H + SUR, c = canvas(w * PXM, h * PXM), g = c.getContext('2d')!, k = 0.004 * PXM;
    g.fillStyle = hex(METAL); g.fillRect(0, 0, c.width, c.height);
    g.clearRect(SUR * PXM - k, SUR * PXM - k, 2 * DOOR_W * PXM + 2 * k, c.height);
    return { c, w, h };
  })();
  const sur = sheet({ art: surround.c, size: [surround.w, surround.h], key: `${ID}-door_surround`, weight: 'vellum', res: 1024, rim: 'none', mat: DULL }, scene);
  sur.position.set(0, surround.h / 2, DOOR_Z + 0.0006); sur.castShadow = false;
  const doorArt = (() => {                                 // a dark metal frame, a clear pane, a push bar
    const c = canvas(300, 600), g = c.getContext('2d')!;
    g.strokeStyle = hex(METAL); g.lineWidth = 34; g.strokeRect(17, 17, 266, 566);
    g.fillStyle = hex(BAR); g.fillRect(40, 600 - (BAR_Y / DOOR_H) * 600 - 10, 220, 20);
    return c;
  })();
  const glint = (() => {                                   // one soft diagonal band, the lobby light on the glass (alpha is blended in linear light: 1% reads as a sheen on the dark)
    const c = canvas(128, 256), g = c.getContext('2d')!, gr = g.createLinearGradient(0, 256, 128, 0);
    [[0.38, 0], [0.46, 0.006], [0.5, 0.009], [0.54, 0.006], [0.62, 0]].forEach(([o, a]) => gr.addColorStop(o, `rgba(255,255,255,${a})`));
    g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const pane = () => new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W - 0.007, DOOR_H - 0.007),
    new THREE.MeshBasicMaterial({ map: glint, color: hex(C('cream').lerp(C('lamp'), 0.2)), transparent: true, depthWrite: false }));
  const doors = [-1, 1].map((side) => {                  // his is the left one, hinged at its left edge, opening toward us
    const hinge = new THREE.Group(); hinge.position.set(side * DOOR_W, 0, DOOR_Z + 0.001); scene.add(hinge);
    const f = sheet({ art: doorArt, size: [DOOR_W, DOOR_H], key: `${ID}-glass_door${side}`, res: 512, rim: 'none', mat: DULL }, hinge);
    f.position.set(-side * DOOR_W / 2, DOOR_H / 2, 0); f.castShadow = false;
    const p = pane(); p.position.copy(f.position); p.castShadow = false; hinge.add(p);
    return hinge;
  });

  // ---- Inside: the vestibule floor (cream-grey tile, the receiver), side walls, the ceiling and its panel.
  const tile = (() => {
    const c = canvas(1200, 1400), g = c.getContext('2d')!;
    g.fillStyle = hex(C('cream').lerp(C('navy'), 0.15)); g.fillRect(0, 0, 1200, 1400);
    g.strokeStyle = hex(C('cream').lerp(C('navy'), 0.32)); g.lineWidth = 5;
    for (let x = 0; x <= 1200; x += 100) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1400); g.stroke(); }
    for (let y = 0; y <= 1400; y += 100) { g.beginPath(); g.moveTo(0, y); g.lineTo(1200, y); g.stroke(); }
    return c;
  })();
  const floor = flat(sheet({ art: tile, size: [0.6, 0.7], key: `${ID}-floor`, res: 2048, rim: 'none' }, scene));
  floor.position.set(0, 0, DOOR_Z + 0.35); floor.castShadow = false;
  [-1, 1].forEach((s) => {
    const w = sheet({ art: wallCanvas(kit, [0.7, 0.15]), size: [0.7, 0.15], key: `${ID}-side${s}`, res: 1024 }, scene);
    w.rotation.y = s * -Math.PI / 2; w.position.set(s * 0.3, 0.075, DOOR_Z + 0.35); w.castShadow = false;
  });
  const ceil = plain(hex(C('cream').multiplyScalar(0.55)), [0.6, 0.7], 'ceiling');
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, PANEL[1], DOOR_Z + 0.35);
  const panel = noCast(art(kit.pieces.recessed_panel, 'panel', { mpp: 0.033 / (kit.pieces.recessed_panel.width - 8), parent: scene }));
  panel.rotation.x = Math.PI / 2; panel.position.set(PANEL[0], PANEL[1] - 0.0005, PANEL[2]);
  const panelMat = glow(panel); panelMat.emissive.copy(WARM); panelMat.emissiveIntensity = PANEL_GLOW;

  // ---- The Student: front view in the wide, the close-up rig in CU. The Exam.
  const hero = await makeGator({ assets }, { seed: 101, facing: 'front', res: 1024 });
  scene.add(hero.group); noCast(hero.group);
  const side = await makeGator({ assets }, { seed: 101, facing: 'side', res: 1024 });   // from lightFlood: the snout reads
  scene.add(side.group); noCast(side.group);
  const eyes0 = hero.joints.eyes.position.y, mouth0 = hero.joints.mouth.position.y;
  const cu = await closeupRig({ assets }, tools, ['resolve', 'relief'], { seed: 102 });
  scene.add(cu.rig.group); noCast(cu.rig.group);
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh);

  // ---- Light. 0–1.5 key: lamp 5 behind him (s09c's: cool, decay 0, aimed at the blob). From lightFlood it's at 0.2
  // (out-shone, README §4) and the overhead panel's spot, on the whole shot, is the only key.
  const key5 = lampKey(COOL); key5.angle = 0.9; key5.penumbra = 0.3; key5.position.set(LAMP5[0], LAMP_H, LAMP5[1]); scene.add(key5, key5.target);
  const over = new THREE.SpotLight(WARM, WARM_I, 0, 0.7, 0.5, 2);
  over.castShadow = true; over.shadow.mapSize.set(2048, 2048); over.shadow.bias = -0.0004; over.shadow.radius = 1;
  over.position.set(PANEL[0], SPOT_Y, PANEL[2]); over.target.position.set(PANEL[0], 0, PANEL[2]); scene.add(over, over.target);
  over.shadow.camera.near = 0.004; over.shadow.camera.far = 0.5;
  const fill = new THREE.PointLight(WARM.clone().lerp(C('cream'), 0.5), 0, 0.06, 2); scene.add(fill);   // README §10, after the flood only
  // CU key: the panel's light as it falls on a cutout in profile. The panel is straight overhead, edge-on to the head's
  // paper, so on its own it lights nothing on the face; this stands in for it just above and in front of the brow, no
  // shadow, falling off down the face (brow brighter than the jaw).
  const cuKey = new THREE.PointLight(WARM, 0, 0.09, 2); scene.add(cuKey);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);
  // The vestibule's own dim room light (non-casting, from above). It sets the floor's base level to about lamp 5's
  // light on it, so lamp 5's tongue reads at 2:1 before the flood and at 1.2:1 (README §4's ≤ 20%) once it's at 0.2.
  const room = new THREE.DirectionalLight(WARM, ROOM_I); room.position.set(0, 1, 0.2); room.target.position.set(0, 0, 0.35); scene.add(room, room.target);

  const fx = post({ focus: 0.62, aperture: 0.015, maxblur: 0.008, lut: 'night' });
  const BC = new THREE.Vector3();
  const STAND = specPose({ lean: 0, arm: -92, far: -92, head: 0, leg: 0, farLeg: 8 });

  function update(t: number) {
    const T = onTwos(t);
    boil(t, 10);
    const close = t >= CU;

    // ---------- his door, on 2s: three drawings to 80° on doorPush
    doors[0].rotation.y = -kf(T, [[B.doorPush - 1e-3, 0], [B.doorPush, 25], [B.doorPush + 1 / 12, 55], [B.doorPush + 2 / 12, OPEN]], (x) => x) * D;

    // ---------- the Student
    const [hx, hz] = kf(T, HIM, (x) => x);
    const turned = T >= B.lightFlood;                    // the stop drawing is the turn: front → side, toward the blob
    hero.group.visible = !close && !turned; side.group.visible = !close && turned; cu.rig.group.visible = close; doors.forEach((d) => { d.visible = !close; });   // CU: the open leaf is between us and him
    if (!close && turned) {                               // standing in the pool, turned to the blob, lit from above
      side.boil(t, 10);
      side.blend({ s: STAND }, [[0, 's']], T);
      side.group.position.set(hx, hipHeight(STAND), hz); side.group.rotation.y = TURN_Y * D;
      act(side, t, [[0, 'resolve']], { slump: 0 });
      side.joints.head.rotation.z += kf(T, [[3.0 - 1 / 12, 0], [3.0, 6]], ease) * D;   // 3.0: he looks up at the light
      fill.position.set(hx, 0.052, hz + 0.04);
      fill.intensity = FILL_I;
    } else if (!close) {
      hero.boil(t, 10);
      const walking = T < 0.5 || (T >= B.doorPush + 1 / 12 && T < B.lightFlood);
      const w = walk(T, { set: 'front', step: 0.25 });
      hero.blend(POSES, walking ? w.keys : [[0, 'stand_front']], T);
      hero.group.position.set(hx, walking ? w.lift : 0, hz);
      // the push: hand to the bar (0.5), lean back (0.83), lean into it 8° on the push (front view: toward the lens)
      const lean = kf(T, [[0.75, 0], [0.833, -3], [B.doorPush, 8], [B.doorPush + 0.5, 8], [B.lightFlood, 0]], ease);
      hero.joints.body.rotation.x = -lean * D;
      hero.joints.arm_r.rotation.z = kf(T, [[0.417, 0], [0.5, -55], [B.doorPush + 1 / 6, -55], [B.doorPush + 0.333, 0]], ease) * D;
      act(hero, t, [[0, 'resolve']], { slump: 0 });
      const look = kf(T, [[3.0 - 1 / 12, 0], [3.0, 6]], ease);   // 3.0: he looks up at the light (the face slides up)
      hero.joints.eyes.position.y = eyes0 + 0.00012 * look; hero.joints.mouth.position.y = mouth0 + 0.00012 * look;
      fill.position.set(hx, 0.052, hz + 0.04);
      fill.intensity = T >= B.lightFlood ? FILL_I : 0;
    } else {                                              // CU: his head in profile facing right, lit from above
      cu.rig.boil(t, 10);
      cu.rig.group.position.set(STOP[0], HIP, STOP[1]);
      cu.rig.group.rotation.y = -Math.PI / 2;
      cu.rig.blend({ s: STAND }, [[0, 's']], T);
      const R = B.exhale;
      cu.show(T < R ? 'resolve' : 'relief', { antic: T >= R - 1 / 12 - 1e-6 && T < R });
      // 4.42: brows tighten (one drawing: the head dips), 5.0 the exhale (head back 3°, shoulders and jaw drop 1.5 mm),
      // then one slow breath: in 6.0–7.0, out 7.0–7.75
      const tilt = kf(T, [[4.417, 0], [4.5, -1], [R - 1 / 12, 0], [R, 3], [R + 0.5, 3]], ease);
      cu.rig.joints.head.rotation.z = tilt * D;
      const drop = kf(T, [[R, 0], [R + 0.5, -0.0015], [6.0, -0.0015], [7.0, -0.0003], [7.75, -0.0015]], ease);
      cu.holder.position.y = HEAD_AT[1] + drop;
      cu.rig.joints.body.scale.y = 1 + 0.5 * drop / 0.03;
      fill.intensity = 0;
      cuKey.position.set(STOP[0] - 0.03, 0.115, STOP[1] + 0.03);
    }
    cuKey.intensity = close ? CU_I : 0;

    // ---------- the Exam, on 2s: at his heels; one hop in after him (1.25 → 1.5); the blink; looks down, then up
    const HOP = [B.doorPush + 0.25, B.lightFlood];
    let p, y = 0, sq = 0, eyes = 'blank', look = 1;
    if (T < HOP[0]) {
      const h = kf(T, HIM, (x) => x); p = [h[0] + 0.03, h[1] - 0.03];
      const ph = ((T + 1e-6) % 0.5) / 0.5; if (T < 0.5) { y = 0.003 * Math.sin(Math.PI * ph); sq = ph < 1 / 6 ? 0.2 : 0; }
    } else if (T < HOP[1]) {                              // through his door's opening (squeezed: it's wider than the gap)
      const k = (T - HOP[0]) / (HOP[1] - HOP[0]), h0 = kf(HOP[0], HIM, (x) => x);
      p = [kf(k, [[0, h0[0] + 0.03], [0.5, -0.022], [1, BLOB_IN[0]]], (x) => x), kf(k, [[0, h0[1] - 0.03], [0.5, DOOR_Z], [1, BLOB_IN[1]]], (x) => x)];
      y = 0.012 * Math.sin(Math.PI * k); sq = -0.15;
    } else { p = BLOB_IN; sq = T < B.lightFlood + 1 / 12 ? 0.2 : T >= 3.25 ? 0.15 : 0; }
    // v9 (v9-beats §2): `blank` and still, as it has been since s07's gulp, until the light floods. Then the one confused
    // beat: wobble back on for the first time since s07, eyes side-glancing one way then the other (look flicks every
    // 1/3 s), the blink on blobBlinks (two drawings), down at its puddle (tired); then blank again from 3.25.
    const confused = T >= B.lightFlood && T < 3.25;
    if (confused) { eyes = 'side'; look = Math.floor((T - B.lightFlood + 1e-6) * 3) % 2 ? 1 : -1; }
    if (T >= B.blobBlinks && T < B.blobBlinks + 1 / 6) eyes = 'closed';
    else if (T >= 2.75 && T < 3.25) eyes = 'tired';      // down at its puddle
    const sx = T >= HOP[0] && T < HOP[1] && Math.abs(p[1] - DOOR_Z) < 0.03 ? 0.75 : 1;
    exam.mesh.visible = !close;
    exam.mesh.position.set(p[0], y, p[1]); exam.mesh.scale.set(sx, 1, 1);

    // ---------- light, on 1s. The snap: lamp 5 at 0.2 from the lightFlood frame, no fade.
    const flooded = t >= B.lightFlood - 1e-6;
    key5.intensity = KEY_I * (flooded ? 0.2 : 1);
    // ...and the lobby's warm fill doubles on the same frame: lamp 5 at 0.2 alone left the tongue at 17% contrast with
    // both eye holes still legible at 960; under the doubled fill it falls to ~9% and only the puddle reads.
    room.intensity = flooded ? ROOM_FLOOD : ROOM_I;
    BC.set(p[0], 0.03, p[1]); aim(key5, BC); key5.shadow.camera.near = 0.004; key5.shadow.camera.updateProjectionMatrix();
    exam.update(t, { squash: sq, wobble: confused ? 0.6 : 0, eyes, look, key: flooded ? over : key5 });
    lantern.emissiveIntensity = 0.9;

    // ---------- camera, on 1s: locked wide; locked CU from his left (he faces screen right)
    if (close) {
      camera.position.set(STOP[0] - 0.26, 0.071, STOP[1] + 0.022);
      camera.lookAt(STOP[0], 0.071, STOP[1] + 0.022);
      fx.set({ focus: 0.26, aperture: 0.008 });
    } else {
      camera.position.set(...CAM_W.pos); camera.lookAt(...CAM_W.look);
      fx.set({ focus: T < B.doorPush ? CAM_W.pos[2] - DOOR_Z : CAM_W.pos[2] - hz, aperture: 0.015 });
    }
  }

  return { parts: { exam, camera, key5, over, hero, cu }, update };
}
