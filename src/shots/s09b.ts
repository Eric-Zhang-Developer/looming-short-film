// s09b · The door (docs/shots/s09b.md, v4 + the director's 2026-10-18 block; climax-a2). The poster image.
// Restaged for Q17: there is no night-light. The light is his own nightstand lamp, clicked on in s09a and left on. His
// door is at the hall's NEAR end, so lamp → doorway → blob → hall → the front door on the end wall lie on one line, and
// the lamp throws the blob's shadow down the hall, over the door he has to reach. The camera is in his room, high,
// behind the lamp, looking through his doorway: the lamp low in the foreground, the blob, him, and the shadow filling
// the far end of the hall. He opens the door, steps out, the blob squeezes through after him and turns back to him;
// the shadow fills the hall; a close-up (C5, the painted heads, dread → resolve); he steps into the dark.
// Characters on 2s, light and camera on 1s, boil 10/s. s10 imports closeupRig() from here.
import * as THREE from 'three';
import { ambient, aim } from '../lights.ts';
import { kf, ease, clamp, onTwos } from '../core/ease.ts';
import { SHOTS } from '../timeline.ts';
import { makeGator, HIP } from '../characters/gator.ts';
import { POSES, specPose, walk } from '../characters/poses.ts';
import { createBlob } from '../blob.ts';
import { kitTools, mppOf, noCast, glow } from './s11.ts';
import type { ShotCtx } from '../film.ts';
import type { AssetCtx, Kit } from '../assets.ts';
import type { PaperOptions } from '../paper.ts';

const ID = 's09b', D = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID)!.beats;         // doorOpen 1, shadowAhead 2.5, stepIntoShadow 4.5
const BLOB_R = { start: 0.030 };                         // 2.5× (README §1, Q16)

// The set (m). Hall: end wall z 0 (the front door), his door wall at the hall's near end z DOOR_Z; his room beyond.
const DOOR_Z = 0.50, HALL_X = 0.065, CEIL = 0.145;       // the hall 13 cm wide (spec 10): the 2.5× blob is 6.8 cm
const DOORWAY = [0.090, 0.110];                          // his doorway, centred x 0 (wide: the 2.5× blob is 0.068 across)
// PLACEHOLDER: the nightstand lamp's bulb. climax-a1 builds the nightstand in s07.ts and will export its position; match
// this to it (height above his floor, door side of the bed) when that lands. Here it sits 0.30 inside his room (about
// 5.5 m real), near the doorway's axis, with the bulb at 0.027 (about 50 cm real: a low nightstand). The distance is what
// lets the blob stay on his threshold and still throw S 2.7 on the end wall. See done/climax-a2.md, Gaps.
export const NIGHTSTAND_LAMP = [-0.012, 0.027, 0.80];
// The blob at the poster frame: on his threshold (just inside his room), on the lamp → front-door line. Its shadow scale
// on the end wall is S = z_L / (z_L − z_B) = 2.71: both eye holes land on the front door (±0.034) and the shadow's top
// reaches 0.116 of the wall's 0.145. Staying on the threshold also keeps it low in the frame, so the eye holes show above it.
const BLOB_Z = DOOR_Z + 0.005, S = NIGHTSTAND_LAMP[2] / (NIGHTSTAND_LAMP[2] - BLOB_Z);
const BLOB_AT = [NIGHTSTAND_LAMP[0] * (1 - 1 / S), BLOB_Z];   // (−0.0076, 0.505)
const BLOB_ROOM = [-0.070, 0.62];                        // before: in his room, left of the door, its loom on the wall
// Him: in his room right of his door (clear of its swing), then out through the doorway to the hall's right side, where
// he faces the shadow without standing in front of its eyes; the step into the shadow at stepIntoShadow.
const HIM: [number, number[]][] = [[0, [0.035, 0.600]], [1.25, [0.035, 0.600]], [1.583, [0.020, 0.500]], [2.0, [0.045, 0.400]],
  [B.stepIntoShadow, [0.045, 0.400]], [B.stepIntoShadow + 0.5, [0.032, 0.360]], [B.stepIntoShadow + 1.0, [0.022, 0.320]], [6.0, [0.018, 0.300]]];
const C5 = [3.5, B.stepIntoShadow];                      // the close-up's cut in and out
// A camera near a light can't see that light's shadow: the caster hides it. Looking through the doorway from behind the
// lamp, the 2.5× blob on the threshold covered its own eye holes. So the set is a paper-theatre cutaway: the hall's right
// wall and the room's right half are left out, and the camera stands off to the right of the lamp → blob → door line,
// seeing all three in one frame: the lamp in the room (left), the blob on his threshold, the shadow down the hall, the
// eye holes on the front door, and him at the near side of the dark road. Locked.
// fix-walk: cold-v4 read that cutaway as "a cut-away, stage-set-looking room" and couldn't tell the front door from "a
// mirror or a poster". The camera now stands square to his door wall, in his room behind the lamp, a few cm right of the
// lamp → front-door line and high enough to see the eye holes over the blob: his door frame is the frame, the hall runs
// straight away through it, and the front door at its end gets a lit gap under it and a transom (the night outside).
const CAM: CamKey = { pos: [0.040, 0.112, 1.02], look: [0.000, 0.058, 0.0] };
const LAMP_I = 0.45, AMB_K = 0.25, SHADE_GLOW = 0.9, FILL_I = 0.006;

// ---------- the close-up rig (README §12): the side Student with a painted closeup_heads head on the hood ----------
// The heads are swaps, not a parts face. show(name) picks one; antic() is the anticipation drawing on the outgoing head
// (a 2° dip and a 3% squash, the kit's "push the other way"). The painted heads drift from the rig's head (taller eye
// bump, greener), so they're only ever used on their own framing.
export const HEAD_AT = [-0.0015, -0.0072], HEAD_K = 1.0;   // the head's neck anchor from the head joint (m), and its scale
export async function closeupRig(ctx: AssetCtx, tools: ReturnType<typeof kitTools>, names: string[], { seed = 0 } = {}) {
  const rig = await makeGator(ctx, { seed, res: 1024 }), a = await ctx.assets.load('closeup_heads');
  for (const p of ['head', 'snout', 'jaw', 'eyes', 'mouth', 'throat', 'brow', 'head34']) if (rig.meshes[p]) rig.meshes[p].visible = false;
  const holder = new THREE.Group(); holder.position.set(HEAD_AT[0], HEAD_AT[1], 0); rig.joints.head.add(holder);
  const heads = Object.fromEntries(names.map((n): [string, THREE.Group] => {
    const img = a.pieces[n];
    const h = tools.art(img, `closeup-${n}-${seed}`, { mpp: mppOf(a, n) * HEAD_K, anchor: [0.27 * img.width, img.height - 2], parent: holder, res: 1024 });
    noCast(h); return [n, h];
  }));
  const show = (name: string, { antic = false } = {}) => {
    for (const [n, h] of Object.entries(heads)) h.visible = n === name;
    holder.rotation.z = antic ? -2 * D : 0; holder.scale.set(1, antic ? 0.97 : 1, 1);
  };
  return { rig, heads, holder, show };
}

export async function build({ scene, camera, assets, PALETTE, post }: ShotCtx) {
  const C = (k: keyof ShotCtx['PALETTE']) => new THREE.Color(PALETTE[k]), hex = (c: THREE.Color) => '#' + c.getHexString();
  const WARM = C('lamp').lerp(C('cream'), 0.45);
  scene.background = C('ink');
  const tools = kitTools(ID), { sheet, art, boil } = tools;
  const [home, props] = await Promise.all([assets.load('home_kit'), assets.load('props_kit')]);
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const canvas = (w: number, h: number) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const plain = (color: string, size: number[], key: string, parent: THREE.Object3D = scene, opts: PaperOptions = {}) => { const m = sheet({ path: RECT, color, size, key: `${ID}-${key}`, res: 1024, rim: 'none', ...opts }, parent); m.castShadow = false; return m; };
  const flat = <T extends THREE.Object3D>(m: T): T => { m.rotation.x = -Math.PI / 2; return m; };
  const planks = (W: number, H: number, pxm = 2000) => {                  // home_kit floor_strip tiled at its scale
    const img = home.pieces.floor_strip, k = mppOf(home, 'floor_strip') * pxm, c = canvas(W * pxm, H * pxm), g = c.getContext('2d')!;
    g.fillStyle = PALETTE.kraft; g.fillRect(0, 0, c.width, c.height);   // the strip's torn margins would show as gaps
    for (let y = 0; y < c.height; y += img.height * k) for (let x = 0; x < c.width; x += img.width * k) g.drawImage(img, x, y, img.width * k, img.height * k);
    return c;
  };
  const cream = hex(C('cream').lerp(C('kraft'), 0.08)), creamSide = hex(C('cream').lerp(C('kraft'), 0.08).multiplyScalar(0.85));

  // ---- The hall (seen only through his doorway). The end wall is the main shadow receiver.
  plain(cream, [2 * HALL_X + 0.01, CEIL + 0.01], 'end_wall').position.set(0, CEIL / 2, 0);
  const front = noCast(art(home.pieces.door, 'front_door', { mpp: 0.110 / (home.pieces.door.height - 8), sx: 0.069 / 0.0690, anchor: [home.pieces.door.width / 2, home.pieces.door.height - 4], parent: scene }));
  front.position.set(0, 0, 0.001);
  { // fix-walk: the front door reads as the way out: the night's cool light under it and through a transom above it
    const NIGHT = C('cream').lerp(C('phone'), 0.4);
    const gap = plain(hex(NIGHT), [0.060, 0.0022], 'front_gap'); gap.position.set(0, 0.0012, 0.0015);
    const tr = plain(hex(NIGHT), [0.052, 0.012], 'transom', scene, { weight: 'tissue' }); tr.position.set(0, 0.121, 0.0012);
    for (const m of [gap, tr]) { m.material.emissive.copy(NIGHT); m.material.emissiveIntensity = 0.35; }
    const bar = plain(hex(C('kraft').multiplyScalar(0.6)), [0.058, 0.003], 'transom_bar'); bar.position.set(0, 0.1135, 0.0014);
  }
  { const w = plain(creamSide, [DOOR_Z + 0.01, CEIL + 0.01], 'hall_wall_left'); w.rotation.y = Math.PI / 2; w.position.set(-HALL_X, CEIL / 2, DOOR_Z / 2); }   // the right wall is cut away
  flat(sheet({ art: planks(2 * HALL_X + 0.01, DOOR_Z), size: [2 * HALL_X + 0.01, DOOR_Z], key: `${ID}-hall_floor`, res: 1024, rim: 'none' }, scene)).position.set(0, 0, DOOR_Z / 2);
  { // the runner down the middle: home_kit's rug, stretched along the hall
    const r = new THREE.Group(); r.rotation.set(-Math.PI / 2, 0, Math.PI / 2); r.position.set(0, 0.0003, DOOR_Z / 2 - 0.02); scene.add(r);
    noCast(art(home.pieces.rug, 'runner', { mpp: (DOOR_Z - 0.06) / home.pieces.rug.width, sy: (0.045 / (DOOR_Z - 0.06)) * (home.pieces.rug.width / home.pieces.rug.height), parent: r, mat: { edgeCatch: 0.2 } }));
  }
  const hallCeil = flat(plain(creamSide, [2 * HALL_X + 0.01, DOOR_Z], 'hall_ceiling')); hallCeil.rotation.x = Math.PI / 2; hallCeil.position.set(0, CEIL, DOOR_Z / 2);

  // ---- His room: the door wall (room side) with the doorway cut through it, his floor, his ceiling.
  {
    const W = 0.68, WH = 0.22, pxm = 3000, c = canvas(W * pxm, WH * pxm), g = c.getContext('2d')!;   // taller than the
    // ceiling: the camera looks down over the room's (unseen, hidden) ceiling line
    // his room's wall is home_kit's navy wall strip (cream baseboard), so the lit hall in the doorway is the bright shape
    const ws = home.pieces.wall_strip, wk = mppOf(home, 'wall_strip') * pxm, NAVY = [8, 30, ws.width - 8, 80], BASE = [8, 86, ws.width - 8, 102];
    const tw = (NAVY[2] - NAVY[0]) * wk, th = (NAVY[3] - NAVY[1]) * wk, bh = (BASE[3] - BASE[1]) * wk;
    for (let y = c.height - bh; y > -th; y -= th) for (let x = 0; x < c.width; x += tw) g.drawImage(ws, NAVY[0], NAVY[1], tw / wk, th / wk, x, y - th, tw, th);
    for (let x = 0; x < c.width; x += tw) g.drawImage(ws, BASE[0], BASE[1], tw / wk, bh / wk, x, c.height - bh, tw, bh);
    g.clearRect((W / 2 - DOORWAY[0] / 2) * pxm, (WH - DOORWAY[1]) * pxm, DOORWAY[0] * pxm, DOORWAY[1] * pxm);
    { // fix-walk: his door's casing, cream, so the doorway reads as a door frame
      const k = 0.006 * pxm, x0 = (W / 2 - DOORWAY[0] / 2) * pxm, y0 = (WH - DOORWAY[1]) * pxm;
      g.fillStyle = cream; g.fillRect(x0 - k, y0 - k, k, DOORWAY[1] * pxm + k); g.fillRect(x0 + DOORWAY[0] * pxm, y0 - k, k, DOORWAY[1] * pxm + k);
      g.fillRect(x0 - k, y0 - k, DOORWAY[0] * pxm + 2 * k, k);
    }
    const w = sheet({ art: c, size: [W, WH], key: `${ID}-door_wall`, res: 2048, rim: 'none' }, scene);
    w.position.set(0, WH / 2, DOOR_Z);   // fix-walk: the whole wall, the doorway in its middle (was cut away right of it)
    // The one exception to "only the blob casts": this wall and his door cast, so the lamp reaches the hall only through
    // the doorway. With the right half cut away the hall is in view the whole shot; this keeps it dark until doorOpen.
    w.castShadow = true;
  }
  flat(sheet({ art: planks(0.60, 0.6), size: [0.60, 0.6], key: `${ID}-room_floor`, res: 1024 }, scene)).position.set(0, 0, DOOR_Z + 0.30);
    // His door: home_kit door, hinged on the doorway's left edge, opening into his room (toward us), away from the view.
  const hinge = new THREE.Group(); hinge.position.set(-DOORWAY[0] / 2, 0, DOOR_Z + 0.001); scene.add(hinge);
  const door = noCast(art(home.pieces.door, 'his_door', { mpp: 0.110 / (home.pieces.door.height - 8), sx: DOORWAY[0] / 0.0690, anchor: [home.pieces.door.width / 2, home.pieces.door.height - 4], parent: hinge }));
  door.position.set(DOORWAY[0] / 2, 0, 0);
  door.traverse((o) => { o.castShadow = true; });

  // ---- The nightstand and its lamp (procedural paper; placeholder until s07's lands): a kraft stand, a navy stem and
  // a tissue shade that glows warm.
  const [lx, ly, lz] = NIGHTSTAND_LAMP;
  plain(PALETTE.kraft, [0.034, ly - 0.009], 'nightstand', scene, { weight: 'kraft' }).position.set(lx, (ly - 0.009) / 2, lz + 0.004);
  plain(PALETTE.navy, [0.0016, 0.006], 'lamp_stem').position.set(lx, ly - 0.006, lz);
  const shade = plain(hex(WARM), [0.016, 0.012], 'lamp_shade', scene, { weight: 'tissue', path: [[0.2, 0], [0.8, 0], [1, 1], [0, 1]] });
  shade.position.set(lx, ly + 0.0015, lz + 0.001); shade.material.emissive.copy(WARM); shade.material.emissiveIntensity = SHADE_GLOW;

  // ---- The Student: the back turnaround in the wide, the close-up rig in C5. Both wear the backpack.
  const back = await makeGator({ assets }, { seed: 92, facing: 'back', res: 1024 });
  scene.add(back.group); noCast(back.group);
  noCast(art(props.pieces.backpack, 'pack-back', { mpp: 0.034 / props.pieces.backpack.height, parent: back.joints.body })).position.set(0, 0.046, 0.003);
  const cu = await closeupRig({ assets }, tools, ['dread', 'resolve'], { seed: 93 });
  scene.add(cu.rig.group); noCast(cu.rig.group);
  noCast(art(props.pieces.backpack, 'pack-side', { mpp: 0.034 / props.pieces.backpack.height, sx: -1, parent: cu.rig.joints.body })).position.set(-0.020, 0.026, -0.0045);
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh);

  // ---- Light. Key: the nightstand lamp, a warm spot at the bulb aimed at the blob every frame (README §4's aim),
  // decay 1 so the hall darkens toward the far end. Only the blob casts. Ambient a few percent.
  const lamp = new THREE.SpotLight(WARM, LAMP_I, 0, 1.0, 0.4, 1);
  lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0004; lamp.shadow.radius = 2;
  lamp.position.set(lx, ly, lz); scene.add(lamp, lamp.target);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);
  // C5's character fill (README §10): his face is backlit by the lamp; a dim warm point ahead of his snout, low, no
  // shadow, short reach, so the expression reads without lighting the hall.
  const fill = new THREE.PointLight(WARM, 0, 0.07, 2); scene.add(fill);

  const fx = post({ focus: 0.6, aperture: 0.012, maxblur: 0.006, lut: 'night' });
  const BC = new THREE.Vector3();
  const STAND_C5 = specPose({ lean: 0, arm: -92, far: -92, head: 0, leg: 0, farLeg: 8 });

  function update(t: number) {
    const T = onTwos(t);
    boil(t, 10);
    const close = t >= C5[0] && t < C5[1];

    // ---------- his door, on 2s: three drawings to 80° on doorOpen
    hinge.rotation.y = -kf(T, [[B.doorOpen - 1e-3, 0], [B.doorOpen, 30], [B.doorOpen + 1 / 12, 62], [B.doorOpen + 2 / 12, 80]], (x) => x) * D;

    // ---------- the Student, on 2s
    const [hx, hz] = kf(T, HIM, ease);
    back.group.visible = !close; cu.rig.group.visible = close;
    back.boil(t, 10);
    const stepping = (T >= 1.25 && T < 2.0) || (T >= B.stepIntoShadow && T < B.stepIntoShadow + 1.0);
    const w = walk(T, { set: 'back', step: 0.25, t0: T < 2 ? 1.25 : B.stepIntoShadow });
    back.blend(POSES, stepping ? w.keys : [[0, 'stand_back']], T);
    back.group.position.set(hx, stepping ? w.lift : 0, hz);
    // breath (back view: the body's y scale), 14/min, then the catch at shadowAhead (shoulders up 1 mm), 18/min after
    const per = T < B.shadowAhead ? 60 / 14 : 60 / 18, catchUp = T >= B.shadowAhead && T < B.shadowAhead + 1 ? 0.012 : 0;
    back.joints.body.scale.y = 1 + 0.008 * Math.sin(2 * Math.PI * T / per) + catchUp;

    // C5: his head in profile facing down the hall (screen right). dread, the swallow, then resolve with the chin up.
    if (close) {
      cu.rig.boil(t, 10);
      cu.rig.group.position.set(hx, HIP, hz);
      cu.rig.group.rotation.y = Math.PI / 2;
      cu.rig.blend({ s: STAND_C5 }, [[0, 's']], T);
      const RES = 4.0, swallow = T >= 3.667 - 1e-6 && T < 3.833 - 1e-6;
      cu.show(T < RES ? 'dread' : 'resolve', { antic: T >= RES - 1 / 12 - 1e-6 && T < RES });
      cu.holder.position.y = HEAD_AT[1] + (swallow ? (T < 3.75 ? 0.0006 : -0.0003) : 0);
      cu.rig.joints.head.rotation.z = kf(T, [[RES, 0], [RES + 1 / 6, 3]], ease) * D;
      cu.rig.joints.body.scale.y = 1 + 0.006 * Math.sin(2 * Math.PI * T / (60 / 14));
      fill.position.set(hx + 0.035, 0.062, hz - 0.045);
    }
    fill.intensity = close ? FILL_I : 0;
    {
    }

    // ---------- the Exam, on 2s
    let p, y = 0, sx = 1, sq = 0;
    const HOP0 = 1.75, LAND = 2.0 + 1 / 6;
    if (T < HOP0) p = BLOB_ROOM;
    else if (T < LAND) {                                 // one hop after him, onto his threshold
      const k = (T - HOP0) / (LAND - HOP0);
      p = [BLOB_ROOM[0] + (BLOB_AT[0] - BLOB_ROOM[0]) * k, BLOB_ROOM[1] + (BLOB_AT[1] - BLOB_ROOM[1]) * k];
      y = 0.015 * Math.sin(Math.PI * k); sx = 0.9; sq = k < 0.2 ? 0.25 : -0.15;
    } else { p = BLOB_AT; sq = T < LAND + 1 / 12 ? 0.2 : 0; }
    // v9 (v9-beats §2): `blank` throughout and no wobble (v8 glanced, looked up and went worried here). It still hops
    // after him: it moves, it doesn't feel. Blank eyes are full discs, so the poster frame's eye holes stay round.
    exam.mesh.visible = !close;
    exam.mesh.position.set(p[0], y, p[1]);
    exam.mesh.scale.set(sx, 1, 1);
    exam.update(t, { squash: sq, wobble: 0, eyes: 'blank', key: lamp });

    // ---------- light, on 1s
    BC.set(p[0], 0.03, p[1]);
    aim(lamp, BC);
    lamp.shadow.camera.near = 0.004; lamp.shadow.camera.updateProjectionMatrix();

    // ---------- camera, on 1s: locked behind the lamp; C5 from his right (the hall's centre line side)
    if (close) {
      camera.position.set(hx + 0.26, 0.064, hz - 0.015);
      camera.lookAt(hx, 0.062, hz - 0.015);
      fx.set({ focus: 0.26, aperture: 0.008 });
    } else {
      camera.position.set(...CAM.pos);
      camera.lookAt(...CAM.look);
      fx.set({ focus: camera.position.distanceTo(BC), aperture: 0.006 });   // the eye holes on the far door must stay readable
    }
  }

  return { parts: { exam, camera, back, cu, lamp }, update };
}
