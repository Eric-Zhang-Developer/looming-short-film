// s09 · Marston at night (docs/shots/s09.md, G4). v2 on the frozen marston_ext_kit.
// Marston's brick ribbon facade on the left and its stepped bay on the right, darkened by the night; between them the
// breezeway, with Century Tower standing in its opening and the lit entrance at its foot. A moss oak hangs over the
// foreground. He walks in from frame left, the 2× blob hopping at his heels, stops under the door, looks up, sighs,
// turns (side → back on one frame) and walks into the lit doorway; the blob hops in after him. Characters on 2s, light
// and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { ambient, aim } from '../lights.js';
import { kf, ease, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { POSES, specPose, walk } from '../characters/poses.js';
import { createBlob } from '../blob.js';
import { kitTools, mppOf, crop, noCast, idle } from './s11.js';

const ID = 's09';
const BLOB_R = { start: 0.024 };                        // METER.gulp4, 2× (README §1): half his height, too big to ride
const STEP = 0.25, HOP = 0.5, HOP_H = 0.004;            // his footfall every 0.25 s; the blob hops every 0.5 s, 4 mm arc
const WALK_Z = 0.40, DOOR_X = 0.14;
const x0 = (t) => -0.50 + 0.168 * Math.min(t, 3.8);    // the spec's walk line, stopping under the door at 3.8
const HEEL = [-0.045, 0.020];                            // blob contact from his root: a step behind, on the camera side
// The blob after he turns: [t, x, z]. To the door, through the hole in the entrance wall, right behind the jamb.
const BLOB_IN = [[4.8, x0(3.8) + HEEL[0], WALK_Z + HEEL[1]], [5.4, DOOR_X, 0.41], [5.583, DOOR_X, 0.355], [5.75, 0.215, 0.355]];
const NIGHT = 0.35;                                       // brick under night light: its paint mixed this far toward navy
const SKY_Z = 0, TREE_Z = 0.08, TOWER_Z = 0.10, FACADE_Z = 0.20, BREEZE_Z = 0.39, DOORS_Z = 0.38, LOBBY_Z = 0.33;
const BUILD_K = 0.8;                                     // facade and bay at 0.8 of the kit's distance-layer size
const WINDOW_I = 0.06;                                   // each lit window's lamp, cd: a glow, not a hole
const TOWER_H = 0.25, CANOPY_K = 0.6, PLANTER_K = 0.6;
// v3 (v3-fix-marston): the night read as black at phone brightness. A cool moon from camera left and above lifts the
// brick, the tower and the plaza; the gator's fill is stronger. Still night: nothing here is warmer than the windows.
const MOON_I = 1.3, MOON_K = 0.45, AMB_K = 0.9, FILL_I = 0.16;   // moon lux, its blend toward cream, hemisphere scale, his fill cd
const CAM_Z = [[0, 1.72], [6, 1.58]];                              // was 1.90 → 1.80: the gator was 18% of the frame

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (k) => new THREE.Color(PALETTE[k]);
  const hex = (c) => '#' + c.getHexString();
  const FL = col('cream').lerp(col('gator'), 0.15);   // the Marston fluorescent tone (README §6)
  scene.background = col('navy');

  const tools = kitTools(ID), { sheet, art, boil } = tools;
  const ext = await assets.load('marston_ext_kit');
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const PAD = 0.04;   // a procedural shape that fills its canvas has no edge to tear, so it sits inside a 4% margin
  const inset = (pts, w, h) => {
    const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m;
    return { path: pts.map(([u, v]) => [(m + u * w) / W, (m + v * h) / H]), size: [W, H] };
  };
  const night = col('navy').lerp(new THREE.Color(1, 1, 1), 1 - NIGHT);
  const brick = (h) => { h.children[0].material.color.copy(night); return h; };

  // ---- z 0: night sky, a navy plate, and the moon, a torn cream disk lit by ambient only.
  const flat = (opts, [x, y, z]) => { const m = sheet(opts, scene); m.position.set(x, y, z); m.castShadow = false; return m; };
  flat({ ...inset(RECT, 1.6, 0.9), color: PALETTE.navy, key: `${ID}-night_sky` }, [0, 0.25, SKY_Z]);
  const DISK = Array.from({ length: 24 }, (_, i) => [0.5 + 0.5 * Math.cos(i * Math.PI / 12), 0.5 + 0.5 * Math.sin(i * Math.PI / 12)]);
  flat({ ...inset(DISK, 0.06, 0.06), color: PALETTE.cream, key: `${ID}-moon` }, [0.42, 0.30, 0.002]);

  // ---- z 0.08: tree line. foliage_sheet isn't frozen, so a seeded canopy line in navy at 0.7 stands in (as v1).
  {
    const r = mulberry32(seedOf('s09', 'trees')), pts = [[0, 1]];
    for (let u = 0; u < 1; u += 0.01 + 0.025 * r()) pts.push([u, 0.6 * r() * r()]);   // tops in v 0..0.6 → y 0.12..0.20
    pts.push([1, 0.3], [1, 1]);
    sheet({ ...inset(pts, 1.6, 0.20), color: hex(col('navy').multiplyScalar(0.7)), key: `${ID}-trees` }, scene).position.set(0, 0.10, TREE_Z);
  }

  // ---- z 0.10: Century Tower, in the breezeway's opening, its foot behind the entrance wall.
  noCast(art(ext.pieces.century_tower, 'century_tower', { mpp: TOWER_H / 366, anchor: [44, 372], parent: scene }))
    .position.set(DOOR_X, 0, TOWER_Z);

  // ---- z 0.20: the facade block (two ribbons of 8 openings), its right end hidden behind the breezeway's left pier,
  // and the stepped bay right of the breezeway. Tissue panes behind every opening; five glow (lit from behind, below).
  const fm = BUILD_K * mppOf(ext, 'facade_block'), FR = 0.0;   // facade's right edge (px 688) at x 0
  brick(art(ext.pieces.facade_block, 'facade', { mpp: fm, anchor: [688, 171], parent: scene, res: 2048 })).position.set(FR, 0, FACADE_Z);
  const bm = BUILD_K * mppOf(ext, 'stepped_bay'), BL = 0.30;   // bay's left foot (px 14, 222) at x 0.30
  brick(art(ext.pieces.stepped_bay, 'stepped_bay', { mpp: bm, anchor: [14, 222], parent: scene, res: 1024 })).position.set(BL, 0, FACADE_Z);
  const fx_ = (px) => FR + (px - 688) * fm, fy = (row) => (171 - row) * fm;
  const bx = (px) => BL + (px - 14) * bm, by = (row) => (222 - row) * bm;
  const paneCol = hex(col('cream').lerp(col('navy'), 0.6));
  for (const [y0, y1] of [[45, 79], [112, 146]]) {   // facade window rows (px)
    flat({ path: RECT, color: paneCol, weight: 'tissue', size: [0.85, (y1 - y0 + 24) * fm], key: `${ID}-pane-${y0}`, res: 256 },
      [FR - 0.43, fy((y0 + y1) / 2), FACADE_Z - 0.005]);
  }
  flat({ path: RECT, color: paneCol, weight: 'tissue', size: [0.33, 0.2], key: `${ID}-pane-bay`, res: 256 }, [BL + 0.165, 0.1, FACADE_Z - 0.005]);
  // The five lit windows: three on the facade, two on the bay. [x, y]
  const LIT = [[fx_(447.5), fy(129)], [fx_(514.5), fy(62)], [fx_(583), fy(129)], [bx(200), by(115)], [bx(160), by(184)]];

  // ---- the breezeway: brick piers and beam at z 0.39, centred on the door; inside it at z 0.38 the entrance wall
  // (the kit's brick tiled, darkened) with the doorway hole (0.06 × 0.09), and the lit lobby plate behind at z 0.33.
  const wm = 0.4009 / 285;                               // the kit's size: opening 0.205 wide, beam top 0.325
  brick(art(ext.pieces.breezeway_frame, 'breezeway', { mpp: wm, anchor: [156.5, 247], parent: scene, res: 1024 })).position.set(DOOR_X, 0, BREEZE_Z);
  {
    const W = 0.21, H = 0.11, pxm = 2000, c = Object.assign(document.createElement('canvas'), { width: W * pxm, height: H * pxm }), g = c.getContext('2d');
    const bs = crop(ext.pieces.brick_strip, 5, 8, 479, 76), tw = 0.21 * pxm, th = tw * bs.height / bs.width;
    for (let y = c.height; y > -th; y -= th) g.drawImage(bs, 0, y - th, tw, th);
    g.clearRect((W / 2 - 0.03) * pxm, (H - 0.09) * pxm, 0.06 * pxm, 0.09 * pxm);
    const doors = sheet({ art: c, size: [W, H], key: `${ID}-doors`, res: 1024 }, scene);
    doors.material.color.copy(night); doors.position.set(DOOR_X, H / 2, DOORS_Z);
  }
  flat({ ...inset(RECT, 0.07, 0.09), color: PALETTE.cream, weight: 'tissue', key: `${ID}-lobby` }, [DOOR_X, 0.045, LOBBY_Z]);

  // ---- y = 0: plaza, navy at 0.8, x ±0.8, z 0.18 → 1.40.
  const plaza = sheet({ ...inset(RECT, 1.6, 1.22), color: hex(col('navy').multiplyScalar(0.8)), key: `${ID}-plaza` }, scene);
  plaza.position.set(0, 0, 0.79); plaza.rotation.x = -Math.PI / 2;

  // ---- z 0.55: two brick hex planters with their shrubs, one mirrored (where the spec had hedges).
  const pm = PLANTER_K * mppOf(ext, 'planter_hex');
  [[-0.34, 1], [0.37, -1]].forEach(([x, sx], i) =>
    brick(art(ext.pieces.planter_hex, `planter-${i}`, { mpp: pm, sx, anchor: [120, 124], parent: scene })).position.set(x, 0, 0.55));
  // ---- z 0.80: the moss oak hanging into the top-left corner, out of focus. Casts nothing.
  noCast(art(ext.pieces.oak_canopy, 'oak_canopy', { mpp: CANOPY_K * mppOf(ext, 'oak_canopy'), anchor: [326, 10], parent: scene }))
    .position.set(-0.30, 0.37, 0.80);

  // ---- The Student: the side rig, and the back turnaround swapped in on one frame at 4.6. Both carry a backpack.
  const side = await makeGator({ assets }, { seed: 9 }), back = await makeGator({ assets }, { seed: 9, facing: 'back' });
  scene.add(side.group, back.group);
  const props = await assets.load('study_props_sheet');
  const pack = (rig, piece, x, y, z) => {
    const [w, h] = props.sizes[piece], [u0, v0, u1, v1] = props.visible[piece], g = new THREE.Group();
    const m = sheet({ art: props.pieces[piece], size: [w, h], key: `${ID}-${piece}`, res: 512 }, g);
    m.position.set(x - ((u0 + u1) / 2 - 0.5) * w, y + ((v0 + v1) / 2 - 0.5) * h, z);
    rig.joints.body.add(g);
  };
  pack(side, 'backpack_side', -0.024, 0.024, -0.001);   // on his back, hip space; the body's edge overlaps it
  pack(back, 'backpack_back', 0, 0.050, 0.002);          // feet space
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh);

  // ---- Light. Key: five lit windows (point lights behind the tissue, no shadows). The lobby spot is the only caster:
  // it shines out through the doorway hole, lights the plate from behind and pools on the plaza.
  // Distance 0.065, not the spec's 0.25: three clamps 1/d² at d = 0.1 m, so only the cutoff keeps a window's light off
  // its neighbours. ponytail: intensities by eye (absolute values wait on mod-lights calibration).
  for (const [x, y] of LIT) {
    const p = new THREE.PointLight(FL, WINDOW_I, 0.065, 2);
    p.position.set(x, y, FACADE_Z - 0.03);
    scene.add(p);
  }
  const spot = new THREE.SpotLight(FL, 0.5, 0, 0.7, 0.4, 2);
  // Spec deviation (v1): y 0.145, not 0.05, so the blob's plaza shadow stays under the spec's 1.5×.
  spot.position.set(DOOR_X, 0.145, 0.30);
  spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.bias = -0.0004;
  scene.add(spot, spot.target);
  const lobby = new THREE.PointLight(FL, 0.3, 0.08, 2);   // fills the plate evenly; stops short of the doors and plaza
  lobby.position.set(DOOR_X, 0.045, 0.31);
  scene.add(lobby);
  aim(spot, new THREE.Vector3(DOOR_X, 0, 0.60));
  spot.shadow.camera.near = 0.004;   // README §11
  spot.shadow.camera.updateProjectionMatrix();
  // Character fill (README §10): shadowless, cool, in front of him just above eye line; off from the turn (4.6) on, so
  // the doorway beat stays a backlit silhouette.
  const fill = new THREE.PointLight(col('phone').lerp(col('navy'), 0.4), FILL_I, 0.09, 2);
  scene.add(fill);
  const amb = ambient();
  amb.intensity *= AMB_K;
  scene.add(amb);
  const moon = new THREE.DirectionalLight(col('phone').lerp(col('cream'), MOON_K), MOON_I);   // no shadows: the lobby spot stays the only caster
  moon.position.set(-0.6, 1.0, 1.6);
  scene.add(moon, moon.target);

  const fx = post({ focus: 1.5, aperture: 0.015, maxblur: 0.008, lut: 'night' });
  const INHALE = specPose({ lean: -3, arm: -95, far: -95, head: 10, leg: 0, farLeg: 8 });  // 4.3: shoulders up, still looking
  const STAND = hipHeight(POSES.stand), STOP = hipHeight(POSES.walk_side_b);

  return {
    update(tLocal) {
      // Camera on 1s: a 0.10 m eased push, no tilt. Focus tracks the gator plane.
      const cz = kf(tLocal, CAM_Z, ease);
      camera.position.set(0, kf(tLocal, [[0, 0.140], [6, 0.135]], ease), cz);
      camera.rotation.set(0, 0, 0);
      fx.set({ focus: cz - WALK_Z });
      boil(tLocal, 10);

      // Characters on 2s.
      const t = onTwos(tLocal), turned = t >= 4.6;
      side.group.visible = !turned; back.group.visible = turned;
      if (!turned) {
        side.boil(tLocal, 10);
        let y;
        if (t < 3.75) {                                   // the walk: contact, down, pass, up, every 0.25 s
          const w = walk(tLocal, { set: 'side', step: STEP });
          side.blend(POSES, w.keys, tLocal);
          y = w.hip;
        } else {                                          // stop, settle, look up, sigh
          const P = { ...POSES, inhale: INHALE };
          side.blend(P, [[3.75, 'walk_side_b'], [3.917, 'stand'], [4.0, 'stand'], [4.3, 'inhale'], [4.6, 'look_up']], tLocal);
          y = kf(t, [[3.75, STOP], [3.917, STAND - 0.002], [4.0, STAND]]);
        }
        idle(side, tLocal, { breath: t < 3.8 ? 0 : 0.014, sway: t < 3.8 ? 0.03 : 0.07 });   // standing he breathes; the tail follows him
        side.group.position.set(x0(t), y, WALK_Z);
        fill.intensity = FILL_I;
        fill.position.set(x0(t) + 0.02, y + 0.06, WALK_Z + 0.035);
        side.face({ eyes: t < 4.0 ? 'tired' : 'open', mouth: t < 4.3 ? 'line' : 'neutral' });
      } else {
        back.boil(tLocal, 10);
        fill.intensity = 0;
        let lift = 0;
        if (t < 4.8) back.blend(POSES, [[4.6, 'stand_back']], tLocal);
        else {                                            // into the doorway, then right, behind the jamb
          const w = walk(tLocal, { set: 'back', step: STEP, t0: 4.8 });
          back.blend(POSES, w.keys, tLocal);
          lift = w.lift;
        }
        back.group.position.set(kf(t, [[5.4, DOOR_X], [5.67, 0.215]], (x) => x), lift, kf(t, [[4.8, WALK_Z], [5.4, 0.35]], (x) => x));
      }

      // The blob, on the plaza a step behind him: hops while he walks, stops and looks up with him, follows him in.
      const moving = t < 3.8 || (t >= 4.8 && t < 5.75), ph = ((t + 1e-6) % HOP) / HOP;
      const [bx, bz] = t < 4.8 ? [x0(t) + HEEL[0], WALK_Z + HEEL[1]] : [kf(t, BLOB_IN.map(([k, x]) => [k, x]), (u) => u), kf(t, BLOB_IN.map(([k, , z]) => [k, z]), (u) => u)];
      exam.mesh.visible = t < 5.75;
      exam.mesh.position.set(bx, moving ? HOP_H * Math.sin(Math.PI * ph) : 0, bz);
      const looking = t >= 3.8 && t < 4.8;
      exam.update(tLocal, {
        wobble: 1, squash: moving && ph < 1 / 6 ? 0.2 : 0, look: 1,
        eyes: t >= 2.0 && t < 2.08 ? 'closed' : looking ? 'side' : 'open',
      });
    },
  };
}
