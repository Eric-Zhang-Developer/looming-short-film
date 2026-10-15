// s09 · Marston at night (docs/shots/s09.md). Animatic blocking: proxies until art is frozen.
// He walks in from frame left with the blob riding his backpack, stops under the door, looks up, sighs, turns (side →
// back on one frame) and walks into the lit doorway. Characters on 2s, light and camera on 1s, boil 10/s.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { ambient, aim } from '../lights.js';
import { kf, ease, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { POSES, specPose, walk } from '../characters/poses.js';
import { makeExam } from '../characters/exam.js';

// A shape that fills its canvas has no edge to tear, so procedural rectangles sit inside a 4% margin (as s01 does).
const PAD = 0.04;
const inset = (pts, w, h) => {
  const m = PAD * Math.max(w, h), W = w + 2 * m, H = h + 2 * m;
  return { path: pts.map(([u, v]) => [(m + u * w) / W, (m + v * h) / H]), size: [W, H] };
};
const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
const STEP = 0.25;              // a footfall every 0.25 s (spec)
const WALK_Z = 0.40, DOOR_X = 0.14;
const x0 = (t) => -0.50 + 0.168 * Math.min(t, 3.8);   // the spec's walk line, stopping under the door at 3.8

export async function build({ scene, camera, assets, PALETTE, post }) {
  const col = (k) => new THREE.Color(PALETTE[k]);
  const hex = (c) => '#' + c.getHexString();
  const FL = col('cream').lerp(col('gator'), 0.15);   // the Marston fluorescent tone (README §6)
  scene.background = col('navy');

  const boiling = [];  // [mesh, seed => PaperSheet]
  const sheet = (key, opts, at, mat) => {
    const make = (s) => makePaper({ ...opts, key: `s09-${key}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    mesh.position.set(...at);
    scene.add(mesh); boiling.push([mesh, make]);
    return mesh;
  };
  // Centre a loaded piece's visible shape (not its padded bitmap) on (x, y).
  const placeArt = (mesh, [w, h], [u0, v0, u1, v1], x, y) =>
    mesh.position.set(x - ((u0 + u1) / 2 - 0.5) * w, y + ((v0 + v1) / 2 - 0.5) * h, mesh.position.z);

  // ---- z 0: night_sky, a navy plate, and the moon, a torn cream disk lit by ambient only.
  sheet('night_sky', { ...inset(RECT, 1.6, 0.9), color: PALETTE.navy }, [0, 0.25, 0]).castShadow = false;
  const DISK = Array.from({ length: 24 }, (_, i) => [0.5 + 0.5 * Math.cos(i * Math.PI / 12), 0.5 + 0.5 * Math.sin(i * Math.PI / 12)]);
  sheet('moon', { ...inset(DISK, 0.06, 0.06), color: PALETTE.cream }, [0.42, 0.30, 0.002]).castShadow = false;

  // ---- z 0.08: campus_trees, navy at 0.7, ragged top between y 0.12 and 0.20. The proxy is a flat rectangle, so a
  // seeded canopy line stands in for it until foliage_sheet is frozen.
  const fol = await assets.load('foliage_sheet');
  const navy7 = hex(col('navy').multiplyScalar(0.7));
  if (fol.proxy) {
    const r = mulberry32(seedOf('s09', 'trees')), pts = [[0, 1]];
    for (let u = 0; u < 1; u += 0.01 + 0.025 * r()) pts.push([u, 0.6 * r() * r()]);  // tops in v 0..0.6 → y 0.12..0.20
    pts.push([1, 0.3], [1, 1]);
    sheet('trees', { ...inset(pts, 1.6, 0.20), color: navy7 }, [0, 0.10, 0.08]);
  } else {
    placeArt(sheet('trees', { art: fol.pieces.campus_trees, size: fol.sizes.campus_trees }, [0, 0, 0.08]),
      fol.sizes.campus_trees, fol.visible.campus_trees, 0, 0.10);
  }

  // ---- z 0.20: marston_ext, 1.20 × 0.42, bottom y 0, centred x 0.05, with a 3 × 8 grid of 0.07 × 0.05 window holes
  // punched through (rows at y 0.10 / 0.20 / 0.30, columns 0.13 apart). The tissue strips behind them carry the glow.
  const COLS = Array.from({ length: 8 }, (_, c) => 0.05 + (c - 3.5) * 0.13), ROWS = [0.10, 0.20, 0.30];
  const ext = await assets.load('marston_ext'), fa = ext.pieces.facade, [fu0, fv0, fu1, fv1] = ext.visible.facade;
  const fcv = Object.assign(document.createElement('canvas'), { width: fa.width, height: fa.height }), fg = fcv.getContext('2d');
  fg.drawImage(fa, 0, 0);
  for (const y of ROWS) for (const x of COLS) {
    const u = fu0 + (x - 0.05 + 0.6) / 1.2 * (fu1 - fu0), v = fv0 + (1 - y / 0.42) * (fv1 - fv0);
    const hw = 0.035 / 1.2 * (fu1 - fu0) * fa.width, hh = 0.025 / 0.42 * (fv1 - fv0) * fa.height;
    fg.clearRect(u * fa.width - hw, v * fa.height - hh, 2 * hw, 2 * hh);
  }
  placeArt(sheet('facade', { art: fcv, size: ext.sizes.facade, res: 2048 }, [0, 0, 0.20]), ext.sizes.facade, ext.visible.facade, 0.05, 0.21);
  // z 0.195: the panes. Tissue passes light, so they cast nothing. Cream dipped toward navy, so the unlit 19 stay dark
  // under the ambient fill while the lit 5 still glow.
  const paneCol = hex(col('cream').lerp(col('navy'), 0.6));
  for (const y of ROWS) sheet(`pane-${y}`, { ...inset(RECT, 1.10, 0.06), color: paneCol, weight: 'tissue' }, [0.05, y, 0.195]).castShadow = false;

  // ---- y = 0: plaza_ground, navy at 0.8, x ±0.8, z 0.18 → 1.40.
  const plaza = sheet('plaza', { ...inset(RECT, 1.6, 1.22), color: hex(col('navy').multiplyScalar(0.8)) }, [0, 0, 0.79]);
  plaza.rotation.x = -Math.PI / 2;

  // ---- z 0.33: the lobby glow plate; z 0.38: marston_doors, a navy flat with the doorway hole (0.06 × 0.09) at x 0.14.
  sheet('lobby', { ...inset(RECT, 0.07, 0.09), color: PALETTE.cream, weight: 'tissue' }, [DOOR_X, 0.045, 0.33]).castShadow = false;
  const dw = 0.03 / 0.20, dh = 1 - 0.09 / 0.11;
  const DOORS = [[0, 0], [1, 0], [1, 1], [0.5 + dw, 1], [0.5 + dw, dh], [0.5 - dw, dh], [0.5 - dw, 1], [0, 1]];
  sheet('doors', { ...inset(DOORS, 0.20, 0.11), color: PALETTE.navy }, [DOOR_X, 0.055, 0.38]);

  // ---- z 0.55: two low hedges, one mirrored.
  const hedge = (x, flip) => {
    const m = sheet(`hedge-${flip ? 'r' : 'l'}`, { art: fol.pieces.hedge, size: fol.sizes.hedge, res: 512 }, [0, 0, 0.55]);
    placeArt(m, fol.sizes.hedge, fol.visible.hedge, x, 0.025);
    if (flip) m.scale.x = -1;
  };
  hedge(-0.42, false); hedge(0.46, true);

  // ---- The Student: the side rig, and the back turnaround swapped in on one frame at 4.6. Both carry a backpack, and
  // the blob rides its right side pocket (camera-facing in profile, screen right from behind).
  const side = await makeGator({ assets }, { seed: 9 }), back = await makeGator({ assets }, { seed: 9, facing: 'back' });
  scene.add(side.group, back.group);
  const props = await assets.load('study_props_sheet');
  const pack = (rig, piece, x, y, z) => {
    const make = (s) => makePaper({ art: props.pieces[piece], size: props.sizes[piece], key: `s09-${piece}`, res: 512, seed: s });
    const m = paperMesh(make(0));
    placeArt(m, props.sizes[piece], props.visible[piece], x, y);
    m.position.z = z;
    rig.joints.body.add(m); boiling.push([m, make]);
  };
  pack(side, 'backpack_side', -0.024, 0.024, -0.001);   // on his back, hip space; the body's edge overlaps it
  pack(back, 'backpack_back', 0, 0.050, 0.002);          // feet space
  const exam = makeExam({ shot: 's09' }), R = exam.radius;
  // The spec's offset (−0.030, 0.050, +0.012) from the feet is the blob's centre; the mesh origin is its contact point.
  const BLOB_SIDE = [-0.030, 0.050 - hipHeight(POSES.stand) - 0.88 * R, 0.012], BLOB_BACK = [0.024, 0.045 - 0.88 * R, 0.006];

  // ---- Light. Key: five lit windows (point lights behind the tissue, no shadows). The lobby spot is the only caster:
  // it shines out through the doorway hole, lights the plate from behind and pools on the plaza.
  // Distance 0.065, not the spec's 0.25: three clamps 1/d² at d = 0.1 m, so at this scale only the cutoff keeps a
  // window's light off its neighbours (0.13 / 0.10 m away).
  // ponytail: intensities tuned by eye for the animatic (absolute values wait on mod-lights calibration).
  const LIT = [[1, 5], [2, 1], [2, 2], [3, 4], [3, 7]];   // [row, column], row 1 at the bottom
  for (const [r, c] of LIT) {
    const p = new THREE.PointLight(FL, 0.12, 0.065, 2);
    p.position.set(COLS[c - 1], ROWS[r - 1], 0.17);
    scene.add(p);
  }
  const spot = new THREE.SpotLight(FL, 0.5, 0, 0.7, 0.4, 2);
  // Spec deviation: y 0.145, not 0.05. Level with the blob (centre y 0.045) the spot threw a 10× plaza shadow; from
  // 0.145 the scale is 0.145 / (0.145 − 0.045) = 1.45×, under the spec's 1.5× (1.49× with the walk's 3 mm lift).
  spot.position.set(DOOR_X, 0.145, 0.30);
  spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.bias = -0.0004;
  scene.add(spot, spot.target);
  // The raised spot passes over the plate (47° off its axis), so a short unshadowed lamp inside the lobby lights it and
  // fills it evenly; its reach (0.08) stops short of the doors flat and the plaza.
  const lobby = new THREE.PointLight(FL, 0.3, 0.08, 2);
  lobby.position.set(DOOR_X, 0.045, 0.31);
  scene.add(lobby);
  aim(spot, new THREE.Vector3(DOOR_X, 0, 0.60));
  // aim() puts near at half the target distance; the doors flat and the gator are 0.08–0.15 m from the light.
  spot.shadow.camera.near = 0.004;   // README §11
  spot.shadow.camera.updateProjectionMatrix();
  // Character fill (README §10): shadowless, cool, in front of him just above eye line. Distance 0.06 reaches his
  // planes (0.035 away) but not the plaza (0.085 below), the doors flat or the facade. Off from the turn at 4.6 on, so
  // the doorway beat stays a backlit silhouette (he has no face from behind).
  const fill = new THREE.PointLight(col('phone').lerp(col('navy'), 0.4), 0.06, 0.06, 2);
  scene.add(fill);
  const amb = ambient();
  amb.intensity *= 0.5;
  scene.add(amb);

  const fx = post({ focus: 1.5, aperture: 0.015, maxblur: 0.008, lut: 'night' });
  const INHALE = specPose({ lean: -3, arm: -95, far: -95, head: 10, leg: 0, farLeg: 8 });  // 4.3: shoulders up, still looking
  const STAND = hipHeight(POSES.stand), STOP = hipHeight(POSES.walk_side_b);

  return {
    update(tLocal) {
      // Camera on 1s: a 0.10 m eased push, no tilt. Focus tracks the gator plane.
      const cz = kf(tLocal, [[0, 1.90], [6, 1.80]], ease);
      camera.position.set(0, kf(tLocal, [[0, 0.140], [6, 0.135]], ease), cz);
      camera.rotation.set(0, 0, 0);
      fx.set({ focus: cz - WALK_Z });

      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));

      // Characters on 2s.
      const t = onTwos(tLocal), turned = t >= 4.6;
      side.group.visible = !turned; back.group.visible = turned;
      let plant = false;
      if (!turned) {
        side.boil(tLocal, 10);
        let y;
        if (t < 3.75) {                                   // the walk: contact, down, pass, up, every 0.25 s
          const w = walk(tLocal, { set: 'side', step: STEP });
          side.blend(POSES, w.keys, tLocal);
          y = w.hip;
          plant = t % STEP < 1 / 24;
        } else {                                          // stop, settle, look up, sigh
          const P = { ...POSES, inhale: INHALE };
          side.blend(P, [[3.75, 'walk_side_b'], [3.917, 'stand'], [4.0, 'stand'], [4.3, 'inhale'], [4.6, 'look_up']], tLocal);
          y = kf(t, [[3.75, STOP], [3.917, STAND - 0.002], [4.0, STAND]]);
          plant = t >= 3.833 && t < 3.917;
        }
        side.group.position.set(x0(t), y, WALK_Z);
        fill.intensity = 0.06;
        fill.position.set(x0(t) + 0.02, y + 0.06, WALK_Z + 0.035);   // the eye is ≈ hip + 0.042
        side.face({ eyes: t < 4.0 ? 'tired' : 'open', mouth: t < 4.3 ? 'line' : 'neutral' });
        side.joints.body.add(exam.mesh);
        exam.mesh.position.set(...BLOB_SIDE);
      } else {
        back.boil(tLocal, 10);
        fill.intensity = 0;
        let lift = 0;
        if (t < 4.8) back.blend(POSES, [[4.6, 'stand_back']], tLocal);
        else {                                            // into the doorway, then right, behind the jamb
          const w = walk(tLocal, { set: 'back', step: STEP, t0: 4.8 });
          back.blend(POSES, w.keys, tLocal);
          lift = w.lift;
          plant = (t - 4.8 + 1e-6) % STEP < 1 / 24;
        }
        back.group.position.set(kf(t, [[5.4, DOOR_X], [5.67, 0.215]], (x) => x), lift, kf(t, [[4.8, WALK_Z], [5.4, 0.35]], (x) => x));
        back.joints.body.add(exam.mesh);
        exam.mesh.position.set(...BLOB_BACK);
      }
      exam.update(tLocal, { wobble: 1, squash: plant ? 0.08 : 0, eyes: t >= 2.0 && t < 2.08 ? 'closed' : 'open' });
    },
  };
}
