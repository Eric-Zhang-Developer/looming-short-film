// s12 · Quiet 1 (docs/shots/s12.md, G4). v2 on the frozen Marston kits: s11's desk set, every position unchanged.
// The low point: fully locked camera, one held pose, the 2.5× blob's shadow breathing over him. His zone is dead (the
// ring pendant just above frame), so the faint phone is the only light. Only light, the edge boil (4/s) and the blob's
// breath move. Characters step on 2s; light at 24.
import * as THREE from 'three';
import { phoneLight, ambient, aim } from '../lights.js';
import { kf, ease, onTwos } from '../core/ease.js';
import { makeGator } from '../characters/gator.js';
import { createBlob } from '../blob.js';
import { POSES, specPose } from '../characters/poses.js';
import { UNIT } from './s15.js';
import { kitTools, marstonDesk, MARK, noCast } from './s11.js';

const ID = 's12', RATE = 4;
const BLOB_R = { start: 0.030 };                         // METER.gulp5, the peak (README §1)
const M = MARK(BLOB_R.start);                            // (0.0207, 0, 0.074)
const LAPTOP_Z = 0.078;                                  // as s11 (README §2)
// v3: the 7.1-unit loom is 17 cm tall on the wall, centred y 0.078 (spot y 0.004 over a blob eye-line of 0.03, × 2.85), so
// it runs to y 0.165. The old camera (z 0.44, y 0.038) saw up to 0.116 and cropped it. This one sees −0.038…0.174 and the
// loom's whole upper edge, with the desk, the gator and the blob still in the lower third.
// v3-readability: the cold viewer read v3's 10 s as a stall, "with the croc cropped off". One slow development instead
// of a lock: a push over the whole shot from a wide that holds him, the blob and the loom's top edge (centred between
// him and the blob, not on the blob) to a two-shot of his face and the blob's eyes, so the loom closes over the frame.
const CAM = [-0.012, 0.068, 0.600], CAM_END = [-0.018, 0.048, 0.400];   // straight down −Z; eased 0 → 10
const SPOT = [-0.010, 0.004, 0.114];                     // spec: S = 0.114 / 0.040 = 2.85 → 7.1 units at 2.5×
const SPOT_I = 1.0, FILL_I = 0.02, AMB_K = 0.15;        // fill (README §10). v3-readability: 0.009 left him a shape on a phone screen
const DIM = [[0, 1], [6, 1], [6.5, 0.6]];                // auto-dim, shared by the spot, the fill and the screen
const FILL_DIM = 0.6;                                    // fill 0.30 → 0.18 with the dim
const SAT = [[0, 1], [2, 0.55]];                         // gator saturation: ease(0–2), then hold
const VIEW_GLOW = 0.1;                                   // s11 has 0.3
// v3: head_down put his closed eyes at 0.027 after the 9.3 cm rig; the peak blob's are 0.0324 (README §1, spec: level).
// Lean 30, head −15 gives 0.0333. Same slump as 'head_down' (arms −30, tail −30), a little less folded.
const HEAD_DOWN = specPose({ lean: 30, arm: -30, far: -30, head: -15, leg: 60, farLeg: 54, tail: -30 });
const BREATH = 0.06, BREATH_T = 5;                       // Q1 (a): ±6%, peaks at 1.25 and 6.25

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);

  const tools = kitTools(ID), { sheet, boil } = tools;
  const { pendant, viewMat } = await marstonDesk({ scene, assets, PALETTE, tools, ID });
  pendant(0);                                            // timed out in s11; he hasn't moved since
  viewMat.emissiveIntensity = VIEW_GLOW;                 // the darkest frame of the film: the view outside dims too
  const props = await assets.load('study_props_sheet');
  const cut = (a, name, { weight, res = 512, parent = scene } = {}) => {   // holder origin = centre of the visible shape
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${name}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };

  { // backpack behind the chair, as s11
    const b = cut(props, 'backpack_side'); b.position.set(-0.145, -0.034 + 0.02, 0.028);
  }
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, LAPTOP_Z);   // closed: he shut it across the cut
  cut(props, 'laptop_lid').position.set(-0.0075, 0.0045, LAPTOP_Z + 0.0001);
  flat(cut(props, 'exam_page', { res: 1024 })).position.set(-0.0205, 0.0003, 0.095);   // blank
  const pen = new THREE.Group(); scene.add(pen);                          // capped, on the page's front edge
  cut(props, 'pen', { parent: pen }).position.x = -0.006;
  pen.position.set(-0.016, 0.0006, 0.106); pen.rotation.set(-Math.PI / 2, 0, 0);
  const cap = new THREE.Group(); scene.add(cap); cut(props, 'pen_cap', { parent: cap });
  cap.position.set(-0.018, 0.0006, 0.1062); cap.rotation.set(-Math.PI / 2, 0, 0);

  // phone: face up at the rest spot, screen glowing (glyph bars only)
  const phone = new THREE.Group(); phone.position.set(...UNIT.phone); scene.add(phone);
  flat(cut(props, 'phone_face', { parent: phone })).position.y = 0.0004;
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0064), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);
  noCast(phone);

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
  scene.add(hero.group);
  hero.blend({ ...POSES, head_down: HEAD_DOWN }, [[0, 'head_down']], 0); hero.face({ eyes: 'closed', mouth: 'neutral' });
  // desaturation: paper keeps its painting, so tint it with the multiplier that takes gator green to saturation s
  const g0 = C('gator'), L = 0.2126 * g0.r + 0.7152 * g0.g + 0.0722 * g0.b;
  const satTint = (s) => new THREE.Color(...[g0.r, g0.g, g0.b].map((v) => (L + s * (v - L)) / v));
  const skin = Object.entries(hero.meshes).filter(([n]) => n !== 'eyes' && n !== 'mouth').map(([, m]) => m);

  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.mesh.position.set(M[0], 0, M[2]); exam.stain.position.set(M[0], 0.0004, M[2]);
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  // Phone spot (README §4) at the phone, aimed through the blob's centre at its wall hit.
  const BLOB_C = new THREE.Vector3(M[0], BLOB_R.start, M[2]);
  const spot = phoneLight({ angle: 0.9, penumbra: 0.4, distance: 0.6, intensity: SPOT_I });
  spot.position.set(...SPOT);
  scene.add(spot, spot.target);
  aim(spot, BLOB_C);
  spot.shadow.camera.near = 0.004; spot.shadow.camera.updateProjectionMatrix();
  const fill = new THREE.PointLight(PALETTE.phone, FILL_I, 0.07, 2);   // cyan on his closed eye and snout; throws nothing
  fill.castShadow = false; fill.position.set(-0.028, 0.032, 0.108); scene.add(fill);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  const camAt = (t) => { const k = ease(t / 10); camera.position.set(...CAM.map((v, i) => v + (CAM_END[i] - v) * k));
    camera.lookAt(camera.position.x, camera.position.y, 0); camera.updateMatrixWorld(true); };
  camAt(0);
  const fx = post({ focus: CAM[2] - M[2], aperture: 0.03, maxblur: 0.012, lut: 'marston' });   // spec's act2b isn't in post.js

  function update(t) {
    const tc = onTwos(t);
    boil(t, RATE);
    camAt(t); fx.set({ focus: camera.position.z - M[2] });   // the push runs on 1s

    hero.boil(t, RATE);
    hero.blend({ ...POSES, head_down: HEAD_DOWN }, [[0, 'head_down']], tc + 1e-6);
    hero.face({ eyes: 'closed', mouth: 'neutral' });
    const tint = satTint(kf(t, SAT, ease));
    for (const m of skin) m.material.color.copy(tint);

    exam.update(t, { wobble: 0.5, eyes: 'open', key: spot });
    exam.mesh.scale.setScalar(1 + BREATH * Math.sin(2 * Math.PI * tc / BREATH_T));   // a breath, not growth

    const dim = kf(t, DIM, ease);
    spot.intensity = SPOT_I * dim;
    fill.intensity = FILL_I * (1 - (1 - FILL_DIM) * (1 - dim) / 0.4);
    screen.material.color.setScalar(0.6 + 0.4 * (dim - 0.6) / 0.4);
  }

  const probe = () => ({
    spot: spot.position.toArray(), wallScale: SPOT[2] / (SPOT[2] - M[2]), blob: exam.mesh.position.toArray(),
    head: hero.meshes.head.getWorldPosition(new THREE.Vector3()).toArray(),
    puppet: Object.fromEntries(Object.entries(hero.joints).map(([n, j]) => [n, [j.position.x, j.position.y, j.rotation.z]])),
    cam: camera.matrixWorld.toArray(),
  });
  return { update, probe };
}
