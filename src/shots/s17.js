// @ts-check
// s17 · Quiet 2: the dawn reading room (docs/shots/s17.md, v4). 12 s (G4's 18 × 2/3), locked but for one two-shot.
// Morning comes, the morning of the exam. He puts the pen down and sits back (3.0), looks once at the blob (small now,
// asleep on his page's corner), and closes his eyes (6.0); it opens its eyes once, looks up at him, and sleeps again.
// After 6.0 only the light, the boil and his slow breath move: dawn crawls in through the ribbon windows from the
// foreground toward the wall, the panes warm night to gold under s16's amber grade (v3-readability).
// Three desk units on s11's set: the empty desk (its pendant unlit: nobody switched it on), his and the neighbor's (lit,
// constant warm: they fell asleep working). No sensors, no laptop. Only the blobs, the wall and the desk tops cast.
// Characters on 2s, boil 4/s (quiet rate), light, grade at 24.
import * as THREE from 'three';
import { sensorLight, dawnLight, fluorescent, ambient } from '../lights.js';
import { clamp, onTwos } from '../core/ease.ts';
import { act } from '../characters/acting.js';
import { makeGator } from '../characters/gator.js';
import { makeCrowd } from '../characters/crowd.js';
import { BLOB_R as OTHER_R } from '../characters/exam.js';
import { createBlob } from '../blob.js';
import { POSES, specPose } from '../characters/poses.js';
import { kitTools, marstonDesk, crop, mppOf, noCast, glow, castOnly } from './s11.js';

const ID = 's17', D = Math.PI / 180, RATE = 4;

// ---------- tunables (the final pass changes these, not the staging) ----------
const BLOB_R = { start: 0.005 };                        // SHRINK[6], s16's last step (README §1)
const BLOB = [0.000, 0.098];                            // the page-corner mark (x, z)
const HIP = /** @type {Vec3} */ ([-0.075, -0.012, 0.074]);                    // s11's seat (UNIT.hip, bodyZ)
// The neighbor's unit is mirrored about x 0.155 (x' = 0.310 − x), not s16's 0.350: at 0.350 the sleeping neighbor and
// their chair fell just outside the locked frame, leaving only their blob at the edge.
const NB = 0.310, EMPTY_DX = -0.25;                     // the empty desk Δx
const NB_BLOB = [NB, 0.098], NB_PHONE = [NB + 0.010, 0.0015, 0.114], NB_HIP = [NB + 0.075, -0.012];
// Camera: the spec's distance and angle (1.02 m, 12° down), aimed 2 cm lower, because s11's ribbon window is one low
// band (panes y 0.078–0.132), not the spec's 0.066–0.300 openings: at the spec's aim the top of the frame was bare wall.
// v3 (v3-fix-marston): the blob (r 0.005, 1.1 cm wide) was 32 px in a 60 cm frame. The wide moves in to 0.95 m and re-centres on
// his desk (the empty desk is cut by the left edge: it only has to read as empty), and the blob's one look at him (7.0–8.5)
// gets Camera E, a close two-shot of the blob on the page corner and his face above it, so the size he shrank to reads next to him.
// v4: E's window is G4's × 2/3 like every other time here.
const CAM = /** @type {CamKey} */ ({ pos: [0.100, 0.250, 0.950], look: [0.100, 0.058, 0.062] }), FOCUS = /** @type {Vec3} */ ([0.000, 0.010, 0.098]);
const CAM_E = /** @type {CamKey} */ ({ pos: [-0.030, 0.028, 0.338], look: [-0.030, 0.028, 0.098], focus: [0.000, 0.010, 0.098] }), E_WINDOW = [4.5, 5.833];
const GOLD_AT = 10.667;                                 // elevation, k, panes and grade ramps end here (G4's 16 × 2/3), then hold
const WARM = 0.3;                                       // v4 Marston warm: lerp(lamp, cream, 0.3) (README v4)
const ZONE_I = 0.35, FLUOR_I = 0.35, AMB_K = 0.45, FILL_I = 0.02, DAWN_K = 9;   // DAWN_K: dawn overtakes the pendants by ~9 s (by eye)
// v3-readability: the cold viewer saw 18 s of near-identical wides, "the ceiling strip blown out to white", and an
// unexplained brown foreground object. The panes went to 0.9 glow and the grade crossfaded amber → dawn, which cooled and
// washed the room, so the dawn read as the lights going grey. Now the panes start as night (navy, barely lit) and warm to
// gold at a glow that keeps their paper, and the grade holds s16's amber: the one change is the windows filling with
// gold. The foreground sleeper (the brown object, cut by the frame) and its desk are gone.
const PANE = { cold: 0.02, gold: 0.18 };                // window tissue glow, night → gold

// ---------- the hero (s15 convention: lean + forward, arm = the near arm's world angle) ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
const P = {
  write_a: POSES.write_a,                               // lean 10, arm −30: pen in hand, from s16
  antic: seat({ lean: 14, arm: -30 }),                  // 3.000
  back1: seat({ lean: 4, arm: -38 }),                   // 3.500
  back2: seat({ lean: -4, arm: -46, head: 3 }),         // 4.000
  sit_back: seat({ lean: -8, arm: -50, head: 6 }),      // 4.500, hand on his lap
  settle: seat({ lean: -7, arm: -50, head: 6 }),        // 5.000, held to 18.0
};
// G4's keys × 2/3 on the 2s grid: the anticipation 2.0, the sit-back 3.0, settled 3.333.
const BODY = [[0, 'write_a'], [23 / 12, 'write_a'], [2, 'antic'], [28 / 12, 'back1'], [32 / 12, 'back2'], [3, 'sit_back'], [40 / 12, 'settle']];
// The acting kit: neutral with G4's small smile, relief from the sit-back (its anticipation is the lean in at 2.917).
// relief's own eyes are closed, so they're half-lid (tired) for the sit-back, to the blob at 4.0, and closed from 6.0.
/** @type {[number, string][]} */
const CUES = [[-0.1, 'neutral'], [3, 'relief']];
const heroEyes = (t) => (t < 3 ? null : t < 4 ? 'tired' : t < 6 ? 'side' : 'closed');
const PEN_DOWN = 25 / 12;                               // 2.083
// the blob: asleep; one slow blink drawing at 4.583, open 4.667, up at him 5.0, asleep again 5.667
const blobEyes = (t) => (t < 55 / 12 ? 'closed' : t < 56 / 12 ? 'tired' : t < 5 ? 'open' : t < 68 / 12 ? 'side' : 'closed');

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const tools = kitTools(ID), { sheet, art, boil } = tools;
  const { pendant, kit, viewMat, wall } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  viewMat.visible = false;                               // dawn: the tissue panes below stand in for the night view
  wall.castShadow = true;                                // the wall and mullions cast: dawn comes in only through the panes
  const [props, study] = await Promise.all([assets.load('props_kit'), assets.load('study_props_sheet')]);
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };
  // An asset piece in a holder whose origin is the centre of its visible shape; [w] sets its visible width.
  /** @param {import('../assets.js').Kit} a @param {string} name @param {{ w?: number, weight?: string, res?: number, parent?: THREE.Object3D, tag?: string }} [o] */
  const cut = (a, name, { w, weight, res = 512, parent = scene, tag = '' } = {}) => {
    const holder = new THREE.Group(), [sw, sh] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [sw, sh], key: `${ID}-${name}${tag}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * sw, ((v0 + v1) / 2 - 0.5) * sh, 0);
    if (w) holder.scale.setScalar(w / (sw * (u1 - u0)));
    parent.add(holder); return holder;
  };

  // ---------- the room: s11's window wall, carpet and hero desk; two more units and the foreground row ----------
  // window_tissue behind the ribbon panes: grey at first light, gold by 16 s. It glows and casts nothing.
  const tissue = sheet({ path: RECT, color: '#ffffff', weight: 'tissue', size: [1.36, 0.056], key: `${ID}-window_tissue`, res: 1024 }, scene);
  tissue.position.set(0, 0.105, -0.0006); tissue.castShadow = false;
  const tissueMat = glow({ children: [tissue] });
  const TISSUE = { cold: C('navy').lerp(C('ink'), 0.3), gold: C('lamp').lerp(C('cream'), 0.35).multiplyScalar(0.55) };   // ×0.55: DAWN_K's sun lights the tissue too
  // A desk unit like s11's (privacy panel, apron, maple top, Y-back chair, ring pendant) inside group g.
  const dk = kit.pieces.desk_row_front, dm = 0.183 / 599, pk = mppOf(kit, 'ring_light_lit');
  const unit = (g, tag, lit, chair = true) => {
    art(crop(dk, 0, 0, dk.width, 63), `desk_panel${tag}`, { mpp: dm, anchor: [10, 63], parent: g, weight: 'kraft' }).position.set(-0.033, 0, 0.0305);
    art(crop(dk, 0, 63, dk.width, dk.height), `desk_apron${tag}`, { mpp: dm, sy: 0.034 / (89 * dm), anchor: [10, 0], parent: g, weight: 'kraft', res: 1024 })
      .position.set(-0.033, 0, 0.120);
    flat(sheet({ path: RECT, color: '#d9b98a', weight: 'kraft', size: [0.183, 0.09], key: `${ID}-desk_top${tag}`, res: 512 }, g)).position.set(0.0585, 0, 0.075);
    if (chair) art(kit.pieces.chair_side, `chair_side${tag}`, { mpp: 0.021 / (285 - 143), anchor: [104, 285], parent: g }).position.set(-0.076, -0.034, 0.071);
    if (lit !== undefined) {
      const p = noCast(art(kit.pieces[lit ? 'ring_light_lit' : 'ring_light_unlit'], `ring${tag}`, { mpp: pk, anchor: lit ? [164, 109] : [162, 108], parent: g }));
      p.position.set(0, 0.125, 0.040);
      if (lit) glow(p).emissiveIntensity = 0.55;
    }
    scene.add(g); return g;
  };
  const empty = new THREE.Group(); empty.position.x = EMPTY_DX; unit(empty, '-empty', false);
  const nbrU = new THREE.Group(); nbrU.position.x = NB; nbrU.scale.x = -1; unit(nbrU, '-nbr', true);
  pendant(1);

  // ---------- his desk (s16's out-state): the worked practice sheet, the stack, phone face-down, pen ----------
  flat(cut(props, 'practice_1', { w: 0.025, res: 1024 })).position.set(-0.0205, 0.0003, 0.095);
  flat(cut(props, 'practice_2', { w: 0.025, tag: '-s1' })).position.set(0.0275, 0.0007, 0.050);
  flat(cut(props, 'blank_page', { w: 0.025, tag: '-s2' })).position.set(0.0285, 0.0011, 0.051);
  flat(cut(props, 'phone_face_down', { w: 0.015 })).position.set(-0.010, 0.0015, 0.114);
  const pen = new THREE.Group(); scene.add(pen);          // origin at the nib (props_kit's pen points −x)
  cut(props, 'pen', { w: 0.012, parent: pen }).position.x = 0.006;
  // the neighbor's desk: their page, phone face-down, 3 energy drinks (s16)
  flat(cut(props, 'blank_page', { w: 0.025, tag: '-nbr' })).position.set(NB + 0.0205, 0.0003, 0.095);
  flat(cut(props, 'phone_face_down', { w: 0.015, tag: '-nbr' })).position.set(...NB_PHONE);
  [[NB - 0.105, -4, 0.095], [NB - 0.088, 0, 0.100], [NB - 0.070, 6, 0.105]].forEach(([x, a, z], i) => {
    const c = cut(study, 'energy_drink', { tag: `-${i}` }); c.position.set(x, 0.006, z); c.rotation.z = a * D;
  });

  // ---------- characters ----------
  const gator = await makeGator({ assets }, { res: 512 });
  gator.group.position.set(...HIP); scene.add(gator.group);
  const nb = await makeCrowd({ assets }, 'neighbor', { seed: 16 });   // s16's figure, asleep on their desk
  nb.group.scale.x = -1;
  nb.group.position.set(NB_HIP[0] - 0.025, NB_HIP[1], HIP[2]);
  nb.pose(specPose({ lean: 62, arm: -5, far: null, head: -12 }));
  scene.add(nb.group);

  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });   // s16's blob, its last size
  exam.mesh.position.set(BLOB[0], 0, BLOB[1]);
  const nbBlob = createBlob({ radius: OTHER_R.neighbor, seed: 13 });
  nbBlob.mesh.position.set(NB_BLOB[0], 0, NB_BLOB[1]);
  scene.add(exam.mesh, nbBlob.mesh);

  // ---------- light ----------
  // The pendants (README v4): his and the neighbor's lit at a constant level, warm; the empty desk's unlit.
  castOnly(scene, [exam.mesh, nbBlob.mesh]); wall.castShadow = true;   // the wall and mullions cast: dawn comes in only through the panes
  const zones = [[[0, 0.127, 0.040], [BLOB[0], 0, BLOB[1]]], [[NB, 0.127, 0.040], [NB_BLOB[0], 0, NB_BLOB[1]]]].map(([at, to]) => {
    const z = sensorLight({ at, aimAt: to, intensity: ZONE_I }); z.light.color.copy(C('lamp').lerp(C('cream'), WARM));
    scene.add(z.light, z.light.target); return z;
  });
  // Dawn through the ribbon: travels +z (in through the windows toward camera), 10° toward +x; elevation 3° → 40°.
  const dawn = dawnLight();
  dawn.light.target.position.set(0.05, 0, 0.2); scene.add(dawn.light, dawn.light.target);
  const travel = new THREE.Vector3();
  const tubes = fluorescent({ intensity: FLUOR_I }); scene.add(tubes.light);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);
  const ambSky = amb.color.clone(), ambWarm = C('cream').lerp(C('lamp'), 0.4);
  const fill = new THREE.PointLight(C('cream').lerp(C('gator'), 0.15), FILL_I, 0.07, 2);   // README §10, fluorescent tone
  fill.position.set(-0.046, 0.040, 0.114); scene.add(fill);

  // ---------- camera (locked), post ----------
  const dir = new THREE.Vector3(), V3 = new THREE.Vector3();
  /** @param {CamKey} cam */
  const aimCam = ({ pos, look, focus }) => {   // sets the camera and returns the focus distance along its axis
    camera.position.set(...pos); camera.lookAt(...look); camera.updateMatrixWorld(true);
    return camera.getWorldDirection(dir).dot(V3.set(...focus).sub(camera.position));
  };
  const fx = post({ focus: aimCam({ ...CAM, focus: FOCUS }), aperture: 0.02, maxblur: 0.01, lut: 'amber' });   // s16's grade, held

  const hand = new THREE.Vector3();
  return {
    update(t) {
      const tc = onTwos(t);
      boil(t, RATE);
      fx.set({ focus: aimCam(t >= E_WINDOW[0] && t < E_WINDOW[1] ? CAM_E : { ...CAM, focus: FOCUS }) });   // the cut to E and back, on 1s
      for (const p of [gator, nb]) p.boil(t, RATE);

      // the hero, on 2s: still, puts the pen down, sits back; looks at the blob; eyes closed from 9.0
      gator.blend(P, BODY, tc);
      const f = act(gator, t, CUES, { slump: 0, tilt: 0, breath: tc < 3 ? 6 : tc < 6 ? 7.5 : 10, seed: 17 });   // 10, 8, 6 a minute
      if (f.eyes !== 'closed' || tc >= 6) gator.face({ eyes: heroEyes(tc) ?? f.eyes, mouth: 'smile' });
      gator.group.updateMatrixWorld(true);
      gator.hand.getWorldPosition(hand);
      if (tc < PEN_DOWN) { pen.rotation.set(0, 0, -Math.PI / 4 + Math.PI); pen.position.set(hand.x, hand.y + 0.0003, 0.0868); }
      else { pen.rotation.set(-Math.PI / 2, 0, Math.PI); pen.position.set(-0.016, 0.0006, 0.106); }   // nib at −0.016, body to −0.028

      // light first (on 1s), so the blob reads this frame's key
      const g = clamp(t / GOLD_AT), el = (3 + 37 * g) * D, az = 10 * D;
      dawn.update(t, 0.08 + 0.92 * g);
      dawn.light.intensity *= DAWN_K;
      travel.set(Math.sin(az) * Math.cos(el), -Math.sin(el), Math.cos(az) * Math.cos(el));
      dawn.light.position.copy(dawn.light.target.position).addScaledVector(travel, -1.5);
      amb.color.copy(ambSky).lerp(ambWarm, 0.5 * g);
      tissueMat.color.copy(TISSUE.cold).lerp(TISSUE.gold, g);
      tissueMat.emissiveIntensity = PANE.cold + (PANE.gold - PANE.cold) * g;

      // the blob: asleep on the page corner; one look at him, 7.0–8.5. The others are still drawings.
      exam.update(t, { wobble: 0.4, eyes: blobEyes(tc), look: -1, key: zones[0].light });
      nbBlob.update(0, { eyes: 'closed', wobble: 0 });
    },
  };
}
