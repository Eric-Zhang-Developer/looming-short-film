// s17c · The grade comes back (docs/shots/s17c.md, v4). 7 s. G4's 0–3 on s17b's Camera P, days later: the paper slides
// in face-down (gradeSlide 0.5), his hand turns it over, and it lands face-up exactly where he wrote it (gradeReveal
// 2.0): props_kit's graded_test with its painted red checks and circled 94, carrying his own three lines from s17b (the
// same lettering code), so the 94 is earned on screen. The blob, 0.33× now, startles at the slide, looks down at the
// grade and closes its eyes, content. v4: 3.0 cuts to a close-up on the painted heads (README §12), his profile in the
// exam room's top light: the still beat, eyes wide (surprised_smile), then the grin (pride) on gradeGrin 4.0. 6.0 cuts
// back to P, and his fingertip taps the 94 once at 6.25.
// Characters and the paper on 2s, light on 1s, boil 10/s.
import * as THREE from 'three';
import { SHOTS } from '../timeline.js';
import { ambient } from '../lights.js';
import { easeOut, ease, clamp, lerp } from '../core/ease.js';
import { createBlob } from '../blob.js';
import { tools } from './s02.js';
import { kitTools } from './s11.js';
import { closeupRig, HEAD_AT } from './s09b.js';
import { specPose } from '../characters/poses.js';
import { PAGE, CAM_P, BLOB_AT, pageWithInk, flatHand, overheadSpot, loadHand } from './s17b.js';

const ID = 's17c', DEG = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;          // gradeSlide 0.5, gradeReveal 2.0

// ---------- tunables ----------
const BLOB_R = { start: 0.004 };                          // SHRINK[7]: no change here (a grade isn't a solved problem)
const SPOT_I = 0.2, AMB_K = 0.45, WARM = [0.12, 0.32];    // s17b's overhead; the window fill warms 0.12 → 0.32 over the reveal (≤ 30%)
const PAGE_H = PAGE.w * 366 / 263;                        // the page's paper height (art px 5…371 over 7…270)
const SLIDE_FROM = 0.045, SKID = 0.001;                   // the slide starts above frame (−z), overshoots 1 mm, settles
const NINETY_FOUR = [214, 58];                            // the circled 94 on graded_test, art px (measured on the cut PNG)

const CU = [3, 6], TAP = 6.25;                             // the close-up's cut in and out; the tap on the 94
const CU_AT = [0.6, 0, 0];                                  // the CU set, off to the side of the page set
const CU_HIP = [-0.054, -0.0134, 0.074];                    // s17b's seat at the exam desk
const CAM_CU = { pos: [-0.028, 0.036, 0.074 + 0.24], look: [-0.028, 0.036, 0.074] };   // s15's CU framing
const CU_KEY = 0.024, CU_AMB = 0.8;
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
  // fix-payoff: a plain white back read as "a blank page" (cold viewer: "handed in? turned over?"). A returned test shows its
  // red marks through the paper: faint, no number, so the 94 is still the reveal. The paper is turned about its centre line,
  // so the front's marks sit at the mirrored height from here (circle low, checks above it).
  {
    const [sw, sh] = props.sizes.blank_page, W = 138, H = Math.round(W * sh / sw), cv = Object.assign(document.createElement('canvas'), { width: W * 4, height: H * 4 }), g = cv.getContext('2d');
    g.scale(4, 4); g.strokeStyle = PALETTE.calendarRed; g.lineWidth = 2.4; g.lineCap = g.lineJoin = 'round';
    g.beginPath(); g.ellipse(0.77 * W, 0.86 * H, 17, 15, 0.2, 0, 7); g.stroke();
    for (const v of [0.72, 0.52, 0.32]) { g.beginPath(); g.moveTo(0.74 * W, (v - 0.01) * H); g.lineTo(0.79 * W, (v + 0.03) * H); g.lineTo(0.88 * W, (v - 0.04) * H); g.stroke(); }
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.z = 0.00003; back.mesh.add(m);
  }
  const P0 = new THREE.Vector3(PAGE.at[0], PAGE.at[1], PAGE.at[2] - PAGE_H / 2);

  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.mesh.position.set(BLOB_AT[0], 0, BLOB_AT[1]); exam.mesh.rotation.x = -55 * DEG;   // s17b's insert lean
  scene.add(exam.mesh);

  const hand = flatHand(T, ctx, { gator: gsheet, props }, 'hand', { parent: scene, pen: false });
  const spot = overheadSpot(SPOT_I);
  const amb = ambient(); amb.intensity *= AMB_K;
  const win = new THREE.DirectionalLight(C('lamp').lerp(C('cream'), 0.4), WARM[0]); win.position.set(0.3, 0.4, -0.6);
  scene.add(spot, spot.target, amb, win);

  // ---------- the close-up: his profile at the exam desk, the painted heads, the room's top light ----------
  const kt = kitTools(ID), cuSet = new THREE.Group(); cuSet.position.set(...CU_AT); scene.add(cuSet);
  T.rect('cu_wall', '#' + C('cream').lerp(C('kraft'), 0.2).getHexString(), [0.6, 0.3], [0, 0.10, -0.02], { parent: cuSet });
  T.rect('cu_desk', '#' + C('kraft').lerp(C('cream'), 0.25).getHexString(), [0.06, 0.05], [0.0, 0, 0.092], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft', parent: cuSet });
  const cu = await closeupRig(ctx, kt, ['surprised_smile', 'pride'], { seed: 173 });
  cu.rig.group.position.set(...CU_HIP); cuSet.add(cu.rig.group);
  cu.rig.group.traverse((o) => { o.castShadow = false; });
  const CU_POSE = specPose({ lean: 12, arm: -26, head: -8, leg: 60, farLeg: 54 });   // s17b's T3 'write': looking down at the page
  const cuKey = new THREE.PointLight(C('cream').lerp(C('lamp'), 0.3), 0, 0.09, 2);   // the overhead as it falls on a profile cutout
  cuKey.position.set(CU_AT[0] - 0.040, 0.075, 0.105); scene.add(cuKey);
  const cuAmb = ambient(); cuAmb.intensity *= CU_AMB; cuAmb.visible = false; scene.add(cuAmb);
  const camLook = new THREE.Vector3();

  const nearEdge = new THREE.Vector3(), tap = new THREE.Vector3();
  pivot.position.copy(P0); front.toWorld(...NINETY_FOUR, tap);   // the 94 at rest: face-up, in place
  return {
    update(t) {
      T.boil(t); kt.boil(t, 10);
      const f = fr(t), tc = F(f), close = t >= CU[0] && t < CU[1];
      // camera on 1s: P, the CU (3.0–6.0), P again
      if (close) { camera.position.set(CAM_CU.pos[0] + CU_AT[0], CAM_CU.pos[1], CAM_CU.pos[2]); camera.lookAt(camLook.set(CAM_CU.look[0] + CU_AT[0], CAM_CU.look[1], CAM_CU.look[2])); }
      else { camera.position.set(...CAM_P.pos); camera.lookAt(...CAM_P.look); }
      fx.set({ focus: close ? CAM_CU.pos[2] - CAM_CU.look[2] : new THREE.Vector3(...CAM_P.pos).distanceTo(new THREE.Vector3(...CAM_P.look)), aperture: close ? 0.008 : 0.002 });
      cuSet.visible = close; cuKey.intensity = close ? CU_KEY : 0; cuAmb.visible = close;
      // the CU: the still beat, eyes wide, 3.0–4.0 (nothing moves); the grin on gradeGrin with one anticipation drawing
      // on the outgoing head (3.917); a laugh-breath out and the head up 3° on the grin
      cu.rig.boil(t, 10);
      cu.rig.blend({ s: CU_POSE }, [[0, 's']], tc);
      const grin = tc >= B.gradeGrin - 1e-6;
      cu.show(grin ? 'pride' : 'surprised_smile', { antic: !grin && tc >= B.gradeGrin - 1 / 12 - 1e-6 });
      cu.rig.joints.head.rotation.z += (grin ? 3 : 0) * DEG;
      cu.holder.position.y = HEAD_AT[1] + (grin && tc < B.gradeGrin + 0.25 ? 0.0006 : 0);

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

      // His hand: it draws the paper in by the near edge from 0.58 (it comes down with the slide), turns it over (1.33–2.33)
      // and is out by 2.33; back at 3.33 for one tap on the 94. fix-payoff: it used to appear only at the flip, so the paper
      // arrived by itself and read as "handed in?".
      let hv = false;
      if (tc >= 0.5 + 1 / 12 && tc < 2.333) {
        hv = true;
        const out = clamp((tc - 2.0) / 0.333), inn = ease(clamp((tc - 0.5) / 0.4));
        const a = (p?.ang ?? 0) * DEG;
        nearEdge.set(PAGE.at[0] - 0.002, 0.0012 + PAGE_H * Math.sin(a), P0.z + (p?.dz ?? 0) + PAGE_H * Math.cos(a) - 0.001);
        // drawing it in: the fingertips on the paper's left edge, a third of the way down, riding the slide; then to the near edge for the flip
        const m = ease(clamp((tc - 1.0) / 0.333)), slide = new THREE.Vector3(PAGE.at[0] - PAGE.w / 2 + 0.004, 0.0012, P0.z + (p?.dz ?? 0) + 0.45 * PAGE_H);
        hand.hand.position.set(lerp(slide.x, nearEdge.x, m) - 0.03 * ease(out) - 0.02 * (1 - inn), lerp(slide.y, nearEdge.y, m), lerp(slide.z, nearEdge.z, m) + 0.012 * ease(out));
      } else if (tc >= TAP - 0.167 && tc < TAP + 0.417) {
        hv = true;
        const k = tc < TAP ? (tc - TAP + 0.167) / 0.167 : tc < TAP + 0.25 ? 1 : 1 - (tc - TAP - 0.25) / 0.167;
        const down = f === Math.round(TAP * 12) ? 0.0004 : 0.0022;   // 6.25: the one drawing down
        hand.hand.position.set(lerp(tap.x - 0.03, tap.x, ease(k)), down, lerp(tap.z + 0.012, tap.z, ease(k)));
      }
      hand.hand.visible = hv;

      // The Exam (G4's): waiting; startles as the paper slides past; looks down at the 94 (2.0); closes its eyes,
      // content, and settles lower (2.75), held to the end. The wide eyes and the grin are his now, in the CU.
      let squash = 0, eyes = 'open', look = -1, wobble = 0.6;
      if (tc >= B.gradeSlide && tc < 1.0) squash = 0.2 * Math.exp(-6 * (tc - B.gradeSlide)) * Math.cos(18 * (tc - B.gradeSlide));
      if (tc >= B.gradeReveal) eyes = 'side';
      if (tc >= 2.75) { eyes = 'closed'; squash = 0.15 + 0.25 * Math.exp(-7 * (tc - 2.75)) * Math.cos(16 * (tc - 2.75)); }
      exam.update(t, { squash, wobble, eyes, look, key: spot });

      // Light on 1s: the window fill warms over the reveal (the theme enters resolved here).
      win.intensity = lerp(WARM[0], WARM[1], ease((t - B.gradeReveal) / 1.0));
    },
  };
}
