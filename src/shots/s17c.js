// s17c · The grade comes back (docs/shots/s17c.md, G4). New in G4. One locked insert on s17b's Camera P, days later:
// the paper slides in face-down (gradeSlide 0.5), his hand turns it over, and it lands face-up exactly where he wrote it
// (gradeReveal 2.0): props_kit's graded_test with its painted red checks and circled 94, carrying his own three lines
// from s17b (the same lettering code), so the 94 is earned on screen. His fingertip taps the 94 once (3.5). The blob,
// 0.33× now, startles at the slide, looks down at the grade, and closes its eyes, content.
// Characters and the paper on 2s, light on 1s, boil 10/s.
import * as THREE from 'three';
import { SHOTS } from '../timeline.js';
import { ambient } from '../lights.js';
import { easeOut, ease, clamp, lerp } from '../core/ease.js';
import { createBlob } from '../blob.js';
import { tools } from './s02.js';
import { PAGE, CAM_P, BLOB_AT, pageWithInk, flatHand, overheadSpot, loadHand } from './s17b.js';

const ID = 's17c', DEG = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;          // gradeSlide 0.5, gradeReveal 2.0

// ---------- tunables ----------
const BLOB_R = { start: 0.004 };                          // SHRINK[7]: no change here (a grade isn't a solved problem)
const SPOT_I = 0.2, AMB_K = 0.45, WARM = [0.12, 0.32];    // s17b's overhead; the window fill warms 0.12 → 0.32 over the reveal (≤ 30%)
const PAGE_H = PAGE.w * 366 / 263;                        // the page's paper height (art px 5…371 over 7…270)
const SLIDE_FROM = 0.045, SKID = 0.001;                   // the slide starts above frame (−z), overshoots 1 mm, settles
const NINETY_FOUR = [214, 58];                            // the circled 94 on graded_test, art px (measured on the cut PNG)

const STILL = 3.917, WIDE = 4.167, SMILE = 4.417;          // the 94's landing: stillness, wide eyes, the smile
const F = (n) => n / 12, fr = (t) => Math.floor(t * 12 + 1e-6);

// The paper per drawing: [z offset from the page position, flip angle about its far edge (deg; 180 = face-down there,
// 0 = face-up), lift of the near edge]. On 2s. The flip is the flat-puppet cheat of s15's phone: down, on edge, up.
function paperAt(f) {
  if (f < 6) return null;                                                  // 0.0–0.5: the empty table
  if (f < 12) { const k = easeOut((f - 6) / 5); return { dz: -SLIDE_FROM * (1 - k) + (f === 11 ? SKID : 0), down: true, ang: 0 }; }
  if (f < 16) return { dz: f === 12 ? SKID : 0, down: true, ang: 0 };    // 1.0 skid, settled by 1.083
  if (f < 18) return { dz: 0, down: true, ang: 20 };                       // 1.33: his hand lifts the near edge
  if (f < 20) return { dz: 0, down: true, ang: 65 };                       // 1.5: on edge (65°: at 90° it left the frame)
  if (f < 22) return { dz: 0, down: false, ang: 30 };                      // 1.67: coming down face-up
  return { dz: 0, down: false, ang: 0 };                                    // 1.83: face-up
}

export async function build(ctx) {
  await loadHand();
  const { scene, camera, assets, PALETTE, post } = ctx;
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('cream'), 0.15);
  const T = tools(ctx, ID);
  const [props, gsheet] = await Promise.all([assets.load('props_kit'), assets.load('gator_sheet')]);
  camera.position.set(...CAM_P.pos); camera.lookAt(...CAM_P.look);
  const fx = post({ focus: new THREE.Vector3(...CAM_P.pos).distanceTo(new THREE.Vector3(...CAM_P.look)), aperture: 0.002, lut: 'dawn' });

  T.rect('table', '#' + C('kraft').lerp(C('navy'), 0.12).getHexString(), [0.12, 0.08], [-0.012, 0, 0.095], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft' })
    .children[0].receiveShadow = true;

  // The paper: a pivot on its far edge; inside, the graded face (with his lines) up and the plain back down.
  const pivot = new THREE.Group(); scene.add(pivot);
  const flip = new THREE.Group(); pivot.add(flip);
  const front = pageWithInk(T, props, 'graded_test', 'graded_test', { parent: flip });
  front.g.position.set(0, 0, PAGE_H / 2);
  front.setInk([1, 1, 1]);
  front.mesh.receiveShadow = true;   // the paper casts nothing: on edge, its shadow printed a black slab across the table
  const back = T.cut(props, 'blank_page', [PAGE.w, null], 'graded_back', { parent: flip });
  back.g.position.set(0, -0.00006, PAGE_H / 2); back.g.rotation.set(Math.PI / 2, 0, 0);   // faces down
  const P0 = new THREE.Vector3(PAGE.at[0], PAGE.at[1], PAGE.at[2] - PAGE_H / 2);

  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.mesh.position.set(BLOB_AT[0], 0, BLOB_AT[1]); exam.mesh.rotation.x = -55 * DEG;   // s17b's insert lean
  scene.add(exam.mesh);

  const hand = flatHand(T, ctx, { gator: gsheet, props }, 'hand', { parent: scene, pen: false });
  const spot = overheadSpot(SPOT_I);
  const amb = ambient(); amb.intensity *= AMB_K;
  const win = new THREE.DirectionalLight(C('lamp').lerp(C('cream'), 0.4), WARM[0]); win.position.set(0.3, 0.4, -0.6);
  scene.add(spot, spot.target, amb, win);

  const nearEdge = new THREE.Vector3(), tap = new THREE.Vector3();
  pivot.position.copy(P0); front.toWorld(...NINETY_FOUR, tap);   // the 94 at rest: face-up, in place
  return {
    update(t) {
      T.boil(t);
      const f = fr(t), tc = F(f);

      const p = paperAt(f);
      pivot.visible = !!p;
      if (p) {
        // face-down: turned over about its own centre line (it stays on the page position); the flip lifts the near
        // edge about the far edge.
        pivot.position.set(P0.x, P0.y + (p.down ? 0.0001 : 0), P0.z + p.dz);
        flip.rotation.set(0, 0, 0); flip.position.set(0, 0, 0);
        if (p.down) { flip.rotation.x = Math.PI; flip.position.set(0, 0, PAGE_H); }   // mirrored about z = h/2
        pivot.rotation.x = -p.ang * DEG;   // lifts the near edge, both sides of the cheat
      }

      // His hand: in at 1.33 to the near edge, with it through the flip, out by 2.33; back at 3.33 for one tap on the 94.
      let hv = false;
      if (tc >= 1.333 && tc < 2.333) {
        hv = true;
        const out = clamp((tc - 2.0) / 0.333);
        const a = (p?.ang ?? 0) * DEG;
        nearEdge.set(PAGE.at[0] - 0.002, 0.0012 + PAGE_H * Math.sin(a), P0.z + PAGE_H * Math.cos(a) - 0.001);
        hand.hand.position.set(nearEdge.x - 0.03 * ease(out), nearEdge.y, nearEdge.z + 0.012 * ease(out));
      } else if (tc >= 3.333 && tc < 3.917) {
        hv = true;
        const k = tc < 3.5 ? (tc - 3.333) / 0.167 : tc < 3.75 ? 1 : 1 - (tc - 3.75) / 0.167;
        const down = f === 42 ? 0.0004 : 0.0022;   // 3.5: the one drawing down
        hand.hand.position.set(lerp(tap.x - 0.03, tap.x, ease(k)), down, lerp(tap.z + 0.012, tap.z, ease(k)));
      }
      hand.hand.visible = hv;

      // The Exam: waiting; startles as the paper slides past; looks down at the 94 and watches the tap. v3: the 94 gets a
      // beat of stillness once the hand is gone (3.92–4.17: eyes on it, no wobble), then eyes go wide (4.17), then the
      // content smile (4.42) with one small rise and settle, and it holds to the cut.
      let squash = 0, eyes = 'open', look = -1, wobble = 0.6;
      if (tc >= B.gradeSlide && tc < 1.0) squash = 0.2 * Math.exp(-6 * (tc - B.gradeSlide)) * Math.cos(18 * (tc - B.gradeSlide));
      if (tc >= B.gradeReveal) { eyes = 'side'; look = -1; }
      if (tc >= STILL) wobble = 0.1;
      if (tc >= WIDE) { eyes = 'gasp'; squash = -0.12; }
      if (tc >= SMILE) { eyes = 'closed'; wobble = 0.5; squash = 0.15 + 0.25 * Math.exp(-7 * (tc - SMILE)) * Math.cos(16 * (tc - SMILE)); }
      exam.update(t, { squash, wobble, eyes, look, key: spot });

      // Light on 1s: the window fill warms over the reveal (the theme enters resolved here).
      win.intensity = lerp(WARM[0], WARM[1], ease((t - B.gradeReveal) / 1.0));
    },
  };
}
