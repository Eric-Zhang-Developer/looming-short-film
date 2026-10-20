// rig-v4 evidence page (flat-lit on grey, as cut-gator/turnaround). Cells by integer t:
//   5 the roommates standing beside the Student   6 the same three seated (s05's mashing poses)
//   10..17 the eight presets on the side head (act() 3 s into a hold), 18 pride's first beat
//   20..27 the same eight on the whole figure, seated, framed small (phone-size read)
//   40..46 the breath and blink strip (local t = t − 40): left dread → resolve at 3.0, right numb → relief at 3.5,
//   both seated, blinks on (seeds 1 and 2). Each frame logs both body y-scales (breath.txt).
//   0 frozen turn_side   1 side rig, stand   3 / 4 neck close-up: rig / figure (same cameras, so ffmpeg can blend 0 with 1)
import * as THREE from 'three';
import { createStage, exposeForRender } from '/src/core/stage.js';
import * as assets from '/src/assets.js';
import { makePaper } from '/src/paper.js';
import { paperMesh } from '/src/material.js';
import { makeGator, hipHeight } from '/src/characters/gator.js';
import { POSES } from '/src/characters/poses.js';
import { act } from '/src/characters/acting.js';
const PRE = ['neutral', 'numb', 'guilt', 'flinch', 'dread', 'resolve', 'relief', 'pride'];
import { makeRoommateTall, makeRoommateRound, TALL_STAND_Y, ROUND_STAND_Y, ROUND_DROP } from '/src/characters/roommates.js';

const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color('#7d8088');
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(-0.3, 0.5, 1);
scene.add(key, new THREE.AmbientLight(0xffffff, 1.2));
const ctx = { assets };

const ready = (async () => {
  const side = await makeGator(ctx, { res: 1024 });
  const g = await assets.load('gator_sheet'), [u0, v0, u1, v1] = g.visible.turn_side, [W, H] = g.sizes.turn_side;
  const fig = paperMesh(makePaper({ art: g.pieces.turn_side, size: [W, H], key: 'rigv4-fig', res: 1024 }));
  fig.position.set((0.5 - (u0 + u1) / 2) * W, (v1 - 0.5) * H, 0);  // visible box: bottom at y 0, centred on x 0
  const tall = await makeRoommateTall(ctx, { res: 1024 }), round = await makeRoommateRound(ctx, { res: 1024 });
  const hero = await makeGator(ctx, { res: 1024, seed: 3 });
  const twin = await makeGator(ctx, { res: 1024, seed: 5 });
  scene.add(twin.group);
  scene.add(side.group, fig, tall.group, round.group, hero.group);
  return { side, fig, tall, round, hero, twin };
})();
stage.ready = ready;
let L = null;
ready.then((r) => { L = r; });
const look = (cx, cy, h) => { camera.position.set(cx, cy, h / 2 / Math.tan(10 * Math.PI / 180)); camera.lookAt(cx, cy, 0); };

stage.onFrame((t) => {
  const { side, fig, tall, round, hero, twin } = L, i = Math.round(t);
  side.group.visible = fig.visible = false;
  for (const r of [tall, round, hero, twin]) { r.group.visible = false; r.boil(0); r.face({ eyes: 'open', mouth: 'neutral' }); }
  side.boil(0); side.face({ eyes: 'open', mouth: 'neutral' });
  // the rig stands with its feet where the figure's are: the figure's boots are at its box bottom
  const stand = () => { side.group.visible = true; side.blend(POSES, [[0, 'stand']], 0); side.group.position.set(-0.01, hipHeight(POSES.stand), 0); };
  if (i === 0) { fig.visible = true; look(0, 0.05, 0.12); }
  else if (i === 1) { stand(); look(0, 0.05, 0.12); }
  else if (i === 3) { stand(); look(0.012, 0.062, 0.045); }
  else if (i === 4) { fig.visible = true; look(0.012, 0.062, 0.045); }
  else if (t >= 39.99 && t <= 46.01) {
    const T = t - 40, out = [];
    for (const [r, x, cues, seed] of [[side, -0.03, [[0, 'dread'], [3, 'resolve']], 1], [twin, 0.045, [[0, 'numb'], [3.5, 'relief']], 2]]) {
      r.group.visible = true; r.blend(POSES, [[0, 'sit']], 0); r.group.position.set(x, 0.022, 0);
      const st = act(r, T, cues, { seed });
      out.push(`${st.name} ${st.eyes} ${r.joints.body.scale.y.toFixed(4)}`);
    }
    console.warn(`breath t ${T.toFixed(3)} | ${out.join(' | ')}`);
    look(0.03, 0.07, 0.085);
  } else if (i >= 10 && i <= 18) {
    stand(); act(side, i === 18 ? 0.25 : 3, [[0, PRE[i === 18 ? 7 : i - 10]]], { blink: false });
    look(0.016, 0.07, 0.06);
  } else if (i >= 20 && i <= 27) {
    side.group.visible = true; side.blend(POSES, [[0, 'sit']], 0); side.group.position.set(-0.01, 0.022, 0);
    act(side, 3, [[0, PRE[i - 20]]], { blink: false });
    look(0, 0.06, 0.13);
  } else if (i === 5 || i === 6) {
    const sit = i === 6, all = [[hero, sit ? 'sit' : 'stand', 0.07], [tall, sit ? 'tall_mash_a' : 'stand', -0.075], [round, sit ? 'round_mash_a' : 'stand', 0]];
    for (const [r, p, x] of all) { r.group.visible = true; r.blend(POSES, [[0, p]], 0); r.group.position.set(x, 0, 0); }
    hero.group.position.y = sit ? 0.022 : hipHeight(POSES.stand);
    tall.group.position.y = sit ? 0.022 : TALL_STAND_Y;
    round.group.position.y = (sit ? 0.022 : ROUND_STAND_Y) - ROUND_DROP * 0.97;
    look(0, 0.06, 0.16);
  }
});
exposeForRender(stage, { duration: 60 });
