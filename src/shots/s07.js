// @ts-check
// s07 · Bed rot (docs/shots/s07.md, v7-bed; README §1 2.5× peak, director 2026-10-18). The doom scroll, head-on (H): he
// lies propped on the pillow, the phone flat on his chest lighting his face from below, scrolling Reels, deadpan. Each
// flick (REELS' cuts) turns the phone's colour. The Exam sits big and dark on the blanket near the lens, its back to us.
// On clockGlance his eyes go to it and back. The phone insert carries the 7-hours reminder; the side-on wide (W) carries
// gulp3, where the ceiling shadow jumps (the rule); then H again, the silhouette 2.5×. Characters on 2s, light on 1s,
// boil 10/s.
//
// This file owns the bedroom (s07.md "s07 owns the numbers"): ROOM and bedroom() build it for s08 and s09a too, and
// ROOM.NIGHTSTAND / ROOM.LAMP are the nightstand lamp climax-a2's s09b matches (Q17, director 2026-10-18). headOn()
// builds H for s07 and s08.
import * as THREE from 'three';
import { phoneLight, ambient, aim } from '../lights.js';
import { onTwos } from '../core/ease.ts';
import { hash2, seedOf } from '../core/rng.ts';
import { createBlob } from '../blob.js';
import { makeGator, FIG_K } from '../characters/gator.js';
import { specPose } from '../characters/poses.js';
import { act } from '../characters/acting.js';
import { makeClock } from '../clock.js';
import { tools } from './s02.js';
import { reminderInsert } from './s03.js';
import { COUNTDOWN } from '../props/canvas.js';
import { REELS } from '../audio/cues.js';

const DEG = Math.PI / 180;
const F = (s) => Math.round(s * 12) / 12;                    // spec times are 2s drawings
export const at2 = (T, a, b) => T >= F(a) - 1e-6 && T < F(b) - 1e-6;

// ---------- the bedroom (m; back wall z 0, floor y 0, the kits' 1 real m = 0.055 film m) ----------
const BED = { x0: 0.125, w: 0.120, z: 0.355, back: 0.27, matB: 0.021, matH: 0.016 };
const MT = BED.matB + BED.matH;                               // mattress top, 0.037 (67 cm)
const DUVET_TUCK = 0.010;                                     // the duvet card's bottom, under the mattress top (v6-bed)
export const ROOM = {
  CEIL: 0.145, BED, MT,
  WIN: { A: -0.168, B: -0.088, y: 0.068, h: 0.062, hw: 0.0245 },
  BODY_Z: 0.31,                                               // his body plane
  BLANKET_Z: 0.318,
  BLOB_Z: 0.322,                                              // the Exam stands just in front of the blanket card
  DESK: { x0: -0.030, w: 0.077, top: 0.041 },                 // the desk corner against the back wall, left of the bed
  CAL: { x0: -0.020, w: 0.050, y0: 0.062, z: 0.0015, fri: [173 / 275, 183 / 292] },   // props_kit calendar, s02's art and cell
  CLOCK: /** @type {Vec3} */ ([0.044, 0.099, 0.0015]),                              // README §13: 0.014 right of the calendar, 0.70 of its height up
  // The nightstand lamp (s09a lampOn, s09b's light behind him): on the bed's door side (frame right, his feet's end),
  // at the bed's near corner and a little proud of it, so it is low and in front of the blob, and throws its shadow back
  // onto the wall behind the bed.
  NIGHTSTAND: { x0: 0.255, x1: 0.287, z0: 0.355, z1: 0.395, h: 0.033 },
  LAMP: /** @type {Vec3} */ ([0.271, 0.054, 0.380]),                                // the shade's mouth centre: the light (s09a, s09b)
  SHADE: [0.016, 0.012],                                      // the cream tissue shade, w × h (its centre 4 mm over LAMP)
  BACKPACK: /** @type {Vec3} */ ([0.180, 0, 0.392]),                                // on the floor in front of the bed, where he stands up
};
{ const c = ROOM.CAL; c.h = c.w * 292 / 275; c.friXY = [c.x0 + c.fri[0] * c.w, c.y0 + c.h * (1 - c.fri[1])]; }
// s07's camera: s08 C3 and s09a C3 use it exactly.
export const CAM = new THREE.Vector3(0.255, 0.040, 0.90), LOOK = new THREE.Vector3(0.255, 0.100, 0.20);

// ---------- him, lying (lie_phone, built here with specPose: brief) ----------
// On his back, head on the pillow at the bed's left end, snout up: the body turned +90° (lean −90), so his front faces
// the ceiling and his feet point +x. Both arms up to the phone on his chest; legs forward under the blanket.
// LIE_HEAD (v6-bed): the head lies back on the pillow, snout tilted ~40° up toward the phone. At −14° the snout stood on
// end (76°) and the eye dome dropped beside the headboard, reading as two heads. Every lying pose uses it.
export const HIP = /** @type {Vec3} */ ([0.195, MT + 0.011, ROOM.BODY_Z]);
export const LIE_HEAD = -50;
export const LIE = specPose({ lean: -90, arm: 0, far: 10, head: LIE_HEAD, leg: 80, farLeg: 84, tail: -88 });
const FLICK = 1.8;                                            // thumb flick: 1 mm at the near arm's tip (0.032)
// ---------- the Exam on his knees ----------
export const BLOB_R = { start: 0.024, gulp3: 0.030 };         // 2× → 2.5× (README §1, Q16 answered 2.5×)
export const KNEE = /** @type {Vec3} */ ([0.230, MT + 0.037, ROOM.BLOB_Z]);         // the blob's contact point on the blanket's top over his knees
// ---------- the phone (the key) ----------
export const PHONE = { at: /** @type {Vec3} */ ([0.193, MT + 0.023, 0.326]), long: 0.0083 };   // screen centre P: in his hands on his chest, under the blob

// The bedroom, built once per shot. Returns handles; each shot animates what it needs.
export async function bedroom(ctx, ID) {
  const { scene, assets, PALETTE } = ctx;
  const T = tools(ctx, ID), { cut, rect, tiled, paper, group, col } = T;
  const [home, props] = await Promise.all([assets.load('home_kit'), assets.load('props_kit')]);
  scene.background = new THREE.Color(PALETTE.navy);

  // Shell: wall (z 0), ceiling (the shot's main receiver: navy cardstock lifted a little so the loom reads), floor.
  const { CEIL, WIN } = ROOM;
  rect('apt_wall', PALETTE.cream, [1.1, CEIL + 0.03], [0.05, CEIL / 2, 0], { res: 2048, mat: { translucency: 0, edgeCatch: 0 } });
  rect('apt_ceiling', col('navy', 'cream', 0.32), [1.1, 0.95], [0.05, CEIL, 0.47], { rot: [Math.PI / 2, 0, 0], res: 1024, mat: { translucency: 0, edgeCatch: 0 } });
  group(paper('apt_floor', { art: tiled(home, 'floor_strip', 4, 12), size: [1.1, 0.8], weight: 'kraft', res: 2048 }, { translucency: 0, edgeCatch: 0 }),
    [0.05, 0, 0.40], { rot: [-Math.PI / 2, 0, 0] });

  // Windows (no blinds, v4): the kit's frame over tissue glass that glows faint moon-blue (emissive: the moon is behind
  // the wall and lights nothing in the room).
  const MOON = new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.cream), 0.3);
  const panes = [];
  for (const k of ['A', 'B']) {
    const glass = cut(home, 'window_glass', [2 * WIN.hw + 0.004, 0.052], `glass${k}`, { weight: 'tissue', mat: { translucency: 0, edgeCatch: 0 } });
    glass.g.position.set(WIN[k], WIN.y, 0.002);
    glass.mesh.material.color.setRGB(0.25, 0.3, 0.42);
    panes.push(glass.mesh.material);
    const fr = cut(home, 'window_frame', [null, WIN.h], `frame${k}`, { mat: { edgeCatch: 0 } });
    fr.g.position.set(WIN[k], WIN.y - 0.002, 0.003);
  }
  const moonPanes = (k) => { for (const m of panes) m.emissive.copy(MOON).multiplyScalar(k); };

  // The desk corner, the calendar ("Calc 2 exam", the red circle) and the clock on the wall above it (s02's pieces).
  const { DESK, CAL } = ROOM;
  cut(home, 'desk', [DESK.w, DESK.top], 'desk', { anchor: [0, 0], flip: true }).g.position.set(DESK.x0, 0, 0.030);
  const calendar = cut(props, 'calendar', [CAL.w, null], 'calendar', { anchor: [0, 0] });
  calendar.g.position.set(CAL.x0, CAL.y0, CAL.z);
  const [fx, fy] = CAL.friXY, cell = CAL.w * 34.8 / 275;
  cut(props, 'calc_exam_square', [cell * 1.06, null], 'calc_exam_square', { tilt: true }).g.position.set(fx, fy, CAL.z + 0.0004);
  const circle = cut(props, 'red_circle', [cell * 1.5, null], 'red_circle');
  circle.g.position.set(fx, fy - 0.0002, CAL.z + 0.0007);
  circle.g.rotation.z = 0.2;
  const clock = await makeClock(ctx, { seed: 7 });
  clock.group.position.set(...ROOM.CLOCK);
  scene.add(clock.group);
  clock.group.updateMatrixWorld(true);
  cut(home, 'poster_b', [0.034, null], 'poster', { tilt: true }).g.position.set(0.335, 0.088, 0.002);

  // The bed, seen from its long side: frame and mattress faces at the near side (z 0.355), the mattress top a card back
  // to z 0.27, the pillow under his head, the tissue blanket over him from the chest down (its top is the knees' line).
  cut(home, 'bed_frame', [BED.w, null], 'bed_frame', { anchor: [0, 0] }).g.position.set(BED.x0, 0, BED.z);
  cut(home, 'bed_mattress', [0.104, BED.matH], 'bed_mattress', { anchor: [0, 0] }).g.position.set(BED.x0 + 0.008, BED.matB, BED.z + 0.002);
  rect('bed-top', col('cream', 'kraft', 0.12), [0.104, BED.z - BED.back], [BED.x0 + 0.060, MT - 0.0005, (BED.z + BED.back) / 2], { rot: [-Math.PI / 2, 0, 0] });
  cut(home, 'bed_pillow', [0.036, null], 'bed_pillow', { anchor: [0.5, 0] }).g.position.set(0.143, MT - 0.003, 0.296);
  const blanket = cut(home, 'bed_blanket', [0.086, null], 'bed_blanket', { anchor: [0.5, 1], weight: 'tissue' });
  blanket.g.position.set(0.211, KNEE[1] + 0.001, ROOM.BLANKET_Z);
  // v6-bed (director: "you see how the gator is floating"): at its art's height the card stopped about 5 mm short of the
  // mattress, and his boots and the wall showed under it. Stretched down from its top (anchor [0.5, 1]) to DUVET_TUCK under
  // the mattress top, where the mattress face in front hides its edge, it drapes onto the bed.
  blanket.g.scale.y = (blanket.g.position.y - (MT - DUVET_TUCK)) / blanket.size[1];
  cut(home, 'laundry_pile', [0.030, null], 'laundry', { anchor: [0.5, 0], tilt: true }).g.position.set(0.100, 0, 0.36);

  // The nightstand and its lamp (procedural paper; s09a clicks it on). Kraft box, navy base and stem, tissue shade.
  const NS = ROOM.NIGHTSTAND, [lx, ly, lz] = ROOM.LAMP;
  rect('nightstand', col('kraft', 'navy', 0.55), [NS.x1 - NS.x0, NS.h], [(NS.x0 + NS.x1) / 2, NS.h / 2, NS.z1], { weight: 'kraft' });
  rect('nightstand-top', col('kraft', 'navy', 0.45), [NS.x1 - NS.x0, NS.z1 - NS.z0], [(NS.x0 + NS.x1) / 2, NS.h, (NS.z0 + NS.z1) / 2], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft' });
  rect('lamp-base', col('navy', 'kraft', 0.2), [0.010, 0.002], [lx, NS.h + 0.001, lz + 0.001]);
  rect('lamp-stem', col('navy', 'kraft', 0.2), [0.0012, ly - NS.h - 0.002], [lx, (ly + NS.h) / 2, lz + 0.0012]);
  const shade = group(paper('lamp-shade', { path: [[0.22, 0.04], [0.78, 0.04], [0.97, 0.96], [0.03, 0.96]], color: PALETTE.cream, weight: 'tissue', size: ROOM.SHADE, res: 512 },
    { translucency: 0.9 }), [lx, ly + 0.004, lz + 0.002]);
  const shadeMat = /** @type {THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>} */ (shade.children[0]).material;

  // The backpack on the floor by the nightstand (s09a picks it up).
  const backpack = cut(props, 'backpack', [null, 0.021], 'backpack', { anchor: [0.5, 0] });
  backpack.g.position.set(...ROOM.BACKPACK);

  // ---------- the Student ----------
  const rig = await makeGator(ctx, { seed: 7, res: 1024 });
  rig.group.position.set(...HIP);
  scene.add(rig.group);
  rig.group.traverse((o) => { o.castShadow = false; });     // only the blob casts
  // The phone in both hands on his chest, its screen toward his face, turned so the camera sees the glow edge-on-ish.
  const phone = new THREE.Group();
  phone.position.set(...PHONE.at);
  phone.rotation.set(0, -55 * DEG, 78 * DEG);
  scene.add(phone);
  const ph = cut(props, 'phone_face_up', [PHONE.long, null], 'phone', { parent: phone });
  const glowTex = (() => {   // a feed: cards of cyan and cream, no text
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 64 }), g = c.getContext('2d');
    g.fillStyle = col('phone', 'cream', 0.35); g.fillRect(0, 0, 128, 64);
    g.fillStyle = col('phone', 'navy', 0.25); for (let i = 0; i < 4; i++) g.fillRect(6 + i * 31, 6, 20, 52);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(PHONE.long * 0.86, ph.size[1] * 0.8), new THREE.MeshBasicMaterial({ map: glowTex }));
  glow.position.z = 0.0003;
  phone.add(glow);
  const phoneDown = cut(props, 'phone_face_down', [PHONE.long, null], 'phone_down', { parent: phone });
  phoneDown.g.visible = false;

  // ---------- the Exam on the blanket over his knees ----------
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.mesh.position.set(...KNEE);
  exam.mesh.castShadow = false;
  scene.add(exam.mesh);
  // The phone is 7 mm in front of the blob's plane, so it would see the flat ink field edge-on and throw a line. A twin
  // of the field that only the shadow pass sees stands where the blob stands, turned to face the phone: the shadow is the
  // blob's own outline (same uniforms: it wobbles, gulps and blinks with it), as a paper cutout held up to the light.
  const caster = new THREE.Mesh(exam.mesh.geometry, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide }));
  caster.customDepthMaterial = exam.mesh.customDepthMaterial;
  caster.customDistanceMaterial = exam.mesh.customDistanceMaterial;
  caster.castShadow = true;
  caster.onBeforeShadow = exam.mesh.onBeforeShadow;
  scene.add(caster);

  // ---------- light ----------
  const P = new THREE.Vector3(...PHONE.at);
  const spot = phoneLight({ angle: SPOT_ANGLE, penumbra: 0.5, distance: 1.0, intensity: 0 });
  spot.position.copy(P);
  spot.shadow.mapSize.set(2048, 2048);
  scene.add(spot, spot.target);
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.05, 2);   // his snout and jaw from below
  fill.position.set(P.x - 0.024, P.y + 0.030, P.z + 0.004);
  // The screen's own spill, up and left where it faces (his face, the wall over the desk): no shadow, dim, so the clock
  // and the calendar read on the wall (s07.md Light: "catch only the faint spill").
  // decay 0 (stylized, like README §4's screen spot): at decay 2 the hands 1 cm from the screen blew out white.
  const spill = new THREE.SpotLight(PALETTE.phone, 0, 1.2, 0.7, 0.8, 0);
  spill.position.copy(P);
  spill.target.position.set(ROOM.CLOCK[0] - 0.01, ROOM.CLOCK[1] - 0.012, 0);
  spill.castShadow = true;                                          // only the clock's hands are in its frustum (aim below)
  spill.shadow.mapSize.set(1024, 1024); spill.shadow.radius = 2; spill.shadow.bias = -0.0003;
  scene.add(spill, spill.target);
  // README §10 character fill under the phone: cool cyan-navy, in front of his face and a little above, no shadow, short
  // reach so the wall's loom keeps its contrast. The fill above lights the snout from the screen; this one his eye.
  const face = new THREE.PointLight(new THREE.Color(PALETTE.phone).lerp(new THREE.Color(PALETTE.navy), 0.35), 0, 0.09, 2);
  face.position.set(0.128, 0.078, 0.37);
  scene.add(face);
  const amb = ambient();
  amb.intensity = 0.8 * 0.05;                                      // 5% of s02's
  scene.add(fill, amb);
  // The nightstand lamp: a low warm spot from the shade's mouth, aimed at the blob, wide enough to light the room.
  const lamp = new THREE.SpotLight(new THREE.Color(PALETTE.lamp).lerp(new THREE.Color(PALETTE.cream), 0.35), 0, 1.2, 1.3, 0.9, 2);
  lamp.position.set(lx, ly, lz);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.radius = 3; lamp.shadow.bias = -0.0004;
  scene.add(lamp, lamp.target);

  // Blob placement and the lights' aim, every frame: r is its current radius, at its contact point.
  const C = new THREE.Vector3(), nrm = new THREE.Vector3(), ax = new THREE.Vector3(), ay = new THREE.Vector3(), az = new THREE.Vector3(), basis = new THREE.Matrix4();
  const placeBlob = (r, contact = KNEE) => {
    exam.mesh.position.set(...contact);
    exam.mesh.scale.setScalar(r / BLOB_R.start);
    // The caster faces the phone with its width along world x (its top toward the wall), so on the ceiling the shadow
    // lies across the frame, eyes side by side, top away from the camera: the blob looming over him, not end-on.
    C.set(contact[0], contact[1] + 0.88 * r, contact[2]);
    nrm.copy(P).sub(C).normalize();
    ax.set(1, 0, 0).addScaledVector(nrm, -nrm.x).normalize();
    ay.crossVectors(ax, nrm);
    caster.quaternion.setFromRotationMatrix(basis.makeBasis(ax, ay, az.crossVectors(ax, ay)));
    caster.position.copy(C).addScaledVector(ay, -0.88 * r);
    caster.scale.copy(exam.mesh.scale);
    exam.mesh.updateMatrixWorld(); caster.updateMatrixWorld();
    aim(spot, caster);
    aim(lamp, exam.mesh);
  };

  aim(spill, clock.group);
  return { T, rig, exam, caster, spot, fill, face, spill, amb, lamp, shadeMat, moonPanes, panes, clock, calendar, circle, phone, glow, phoneDown, backpack, blanket, placeBlob, P, C };
}

// ---------- the close-up heads (closeup_heads, frozen): swaps, not a parts face (brief) ----------
// Each painted head is a whole side head cut at the neck. It rides on the rig's head joint, so it lies on the pillow,
// turns and breathes with him, and the rig's own head, snout, jaw, face and brow hide while it shows. Scale: the painted
// eye (its disc centre, head px (142, 104) on all three, measured) sits at the rig's eye height above the neck (114 figure
// px over 213 head px: 0.535 figure px per head px). The neck is each bitmap's bottom row centre (measured: x 120, y 317),
// sunk 2 mm under the hood.
const HEAD_K = (114 / 213) * FIG_K, HEAD_EYE = [142, 104], HEAD_NECK = [120, 317], HEAD_SINK = 0.002;
export async function closeHeads(ctx, T, rig, names = ['numb', 'dread', 'resolve']) {
  const kit = await ctx.assets.load('closeup_heads'), g = new THREE.Group(), heads = {};
  rig.joints.head.add(g);
  g.position.y = -HEAD_SINK;
  /** @param {number[]} xy @param {number} W @param {number} H */
  const at = ([x, y], W, H) => [(W / 2 - x) * -HEAD_K, (H / 2 - y) * HEAD_K];   // bitmap px → offset from the bitmap centre
  for (const n of names) {
    const bmp = kit.pieces[n], W = bmp.width, H = bmp.height;
    const mesh = T.paper(`head-${n}`, { art: bmp, size: [W * HEAD_K, H * HEAD_K], res: 1024 });
    const [nx, ny] = at(HEAD_NECK, W, H);
    mesh.position.set(-nx, -ny, 0);
    mesh.visible = false;
    g.add(mesh);
    heads[n] = mesh;
  }
  // A closed lid for the breath (s09a): a patch of the heads' painted green (mean of their green pixels, measured
  // rgb 101,148,84) over the eye disc, with a dark lash arc. Drawn in code like the rig's brow.
  const lid = (() => {
    const c = Object.assign(document.createElement('canvas'), { width: 256, height: 256 }), x = c.getContext('2d');
    x.fillStyle = 'rgb(101,148,84)'; x.beginPath(); x.ellipse(128, 128, 112, 106, 0, 0, 7); x.fill();
    x.strokeStyle = 'rgb(38,62,34)'; x.lineWidth = 16; x.lineCap = 'round';
    x.beginPath(); x.arc(128, 70, 92, 0.25 * Math.PI, 0.75 * Math.PI); x.stroke();
    const W = 457, H = 317, mesh = T.paper('head-lid', { art: c, size: [128 * HEAD_K, 128 * HEAD_K], res: 256 });   // the lid's radius: 56 head px
    const [ex, ey] = at(HEAD_EYE, W, H), [nx, ny] = at(HEAD_NECK, W, H);
    mesh.position.set(ex - nx, ey - ny, 0.0004);
    mesh.visible = false;
    g.add(mesh);
    return mesh;
  })();
  const RIG_HEAD = ['head', 'snout', 'jaw', 'eyes', 'mouth', 'throat', 'brow'];
  // show(name): that painted head (or none: the rig's head back). Call every frame after act(), like face().
  const show = (name, { closed = false } = {}) => {
    for (const [n, m] of Object.entries(heads)) m.visible = n === name;
    for (const p of RIG_HEAD) if (rig.meshes[p]) rig.meshes[p].visible = !name;   // every act() preset shows the brow
    lid.visible = !!name && closed;
  };
  return { group: g, heads, lid, show, k: HEAD_K };
}

// ---------- H, head-on (v7-bed): the doom scroll from the foot of the bed ----------
// The director: "I'm looking forward at the gator as it's lying in bed with the screen facing behind ... the dot is big in
// the foreground." A cheat set staged for one lens, not the side-on room seen from another angle: it stands HX off to the
// side, where none of the bedroom's lights reach and neither set's camera sees the other. Front to back: the blob on the
// blanket near the lens (frame right), a dark silhouette with a thin rim of the phone's light; him propped on the pillow,
// front rig, blanket to the chest, the phone flat on his chest lighting his face from below; the headboard, the
// nightstand (lamp off), and the wall with the calendar's red circle and the clock.
const HX = 3.0;
// Four reels, four phone colours, all turns of phone cyan [hue, saturation, lightness]. Red is the exam's (doc 03), and
// a warm yellow would read as the lamp's amber, so: cyan, violet, green, and a pale cool white.
const HUE_TURNS = [[0, 0, 0], [0.21, 0, 0], [-0.19, 0, 0], [0, -0.5, 0.12]];
export const HUES = (P) => HUE_TURNS.map(([h, s, l]) => new THREE.Color(P.phone).offsetHSL(h, s, l));
/** Which reel's colour is on the phone at s07 local drawing T: each flick (REELS' cuts) turns it; before the first flick
 * the feed is on the last reel's, so the loop reads as one feed. */
export const hueAt = (T) => (FLICKS.filter((f) => T >= f - 1e-6).length + 3) % 4;
export const H_CAM = { pos: /** @type {Vec3} */ ([HX - 0.004, 0.066, 0.263]), look: /** @type {Vec3} */ ([HX - 0.004, 0.071, 0.03]) };
const H_BED = 0.036;                                                // the blanket's top over his legs
const H_ROOT = /** @type {Vec3} */ ([HX - 0.022, 0.0, 0.030]);       // his feet (front rig root); the blanket hides everything below the chest
const H_PHONE = /** @type {Vec3} */ ([HX - 0.022, 0.048, 0.051]);   // on his chest, over the blanket's fold, in his hands
export const H_FOCUS = H_CAM.pos[2] - H_ROOT[2];                     // his face
export const H_BLOB = /** @type {Vec3} */ ([HX + 0.047, H_BED, 0.100]);   // contact on the blanket near the lens, frame right
export async function headOn(ctx, ID) {
  const { scene, assets, PALETTE } = ctx;
  const T = tools(ctx, `${ID}-h`), { cut, rect, paper, group, col } = T;
  const [home, props, faces] = await Promise.all([assets.load('home_kit'), assets.load('props_kit'), assets.load('face_sheet')]);
  const dull = { translucency: 0, edgeCatch: 0 };
  // The wall, the floor, the bed's top (the blanket running toward the lens).
  rect('wall', PALETTE.cream, [0.5, 0.22], [HX, 0.11, 0], { res: 1024, mat: dull });
  rect('floor', col('kraft', 'navy', 0.5), [0.5, 0.45], [HX, 0, 0.22], { rot: [-Math.PI / 2, 0, 0], weight: 'kraft', mat: dull });
  const BX = [HX - 0.058, HX + 0.085];                                 // the bed's sides (a cheat: wide enough for the blob)
  rect('bed-top', col('navy', 'cream', 0.08), [BX[1] - BX[0], 0.30], [(BX[0] + BX[1]) / 2, H_BED, 0.19], { rot: [-Math.PI / 2, 0, 0], weight: 'tissue', res: 1024, mat: dull });
  // The headboard: a kraft panel with two round-topped posts, seen face-on.
  const HB = [BX[0] + 0.01, BX[1] - 0.025];
  group(paper('headboard', { path: [[0, 1], [0, 0.06], [0.03, 0], [0.07, 0.06], [0.07, 0.2], [0.93, 0.2], [0.93, 0.06], [0.97, 0], [1, 0.06], [1, 1]],
    color: col('kraft', 'navy', 0.25), weight: 'kraft', size: [HB[1] - HB[0], 0.050], res: 1024 }, dull), [(HB[0] + HB[1]) / 2, 0.049, 0.006]);   // its top under the calendar's circle
  cut(home, 'bed_pillow', [0.064, null], 'pillow', { anchor: [0.5, 0] }).g.position.set(H_ROOT[0], 0.040, 0.016);
  // The nightstand at frame left, its lamp off: a kraft box, a navy stem, the cream tissue shade unlit.
  const NS = [HX - 0.084, HX - 0.056];
  rect('nightstand', col('kraft', 'navy', 0.55), [NS[1] - NS[0], 0.050], [(NS[0] + NS[1]) / 2, 0.025, 0.030], { weight: 'kraft' });
  rect('lamp-stem', col('navy', 'kraft', 0.2), [0.0012, 0.018], [(NS[0] + NS[1]) / 2, 0.059, 0.031]);
  group(paper('lamp-shade', { path: [[0.22, 0.04], [0.78, 0.04], [0.97, 0.96], [0.03, 0.96]], color: PALETTE.cream, weight: 'tissue', size: [0.020, 0.015], res: 512 }, dull),
    [(NS[0] + NS[1]) / 2, 0.072, 0.032]);
  // The wall over the bed: the calendar (s02's art, the Friday square, the red circle) frame right of his head, the clock
  // frame left, over the nightstand, both clear of the blob.
  const CW = 0.036, CAL_Y = 0.066, cal = cut(props, 'calendar', [CW, null], 'calendar', { anchor: [0, 0] });
  cal.g.position.set(HX - 0.004, CAL_Y, 0.0015);
  const cell = CW * 34.8 / 275, fxy = [HX - 0.004 + ROOM.CAL.fri[0] * CW, CAL_Y + cal.size[1] * (1 - ROOM.CAL.fri[1])];
  cut(props, 'calc_exam_square', [cell * 1.06, null], 'calc_exam_square', { tilt: true }).g.position.set(fxy[0], fxy[1], 0.0019);
  const circle = cut(props, 'red_circle', [cell * 1.5, null], 'red_circle');
  circle.g.position.set(fxy[0], fxy[1] - 0.0002, 0.0022); circle.g.rotation.z = 0.2;
  const clock = await makeClock(ctx, { seed: 8 });
  clock.group.position.set(HX - 0.068, 0.098, 0.0015);
  scene.add(clock.group);

  // ---------- him, head-on: the front rig, propped on the pillow; the blanket to his chest; both hands on the phone ----------
  const rig = await makeGator(ctx, { seed: 7, facing: 'front', res: 1024 });
  rig.group.position.set(...H_ROOT);
  scene.add(rig.group);
  rig.group.traverse((o) => { o.castShadow = false; });
  // The arms come forward over the blanket to the phone: in front of it, and foreshortened (they point at the lens).
  for (const a of ['arm_l', 'arm_r']) { rig.joints[a].position.z = 0.019; rig.joints[a].scale.y = 0.45; }
  // The blanket's turned-down fold across his chest (home_kit's blanket: navy, a cream fold along the top).
  const blanket = cut(home, 'bed_blanket', [BX[1] - BX[0] - 0.01, null], 'blanket', { anchor: [0.5, 1], weight: 'tissue', mat: dull });
  blanket.g.position.set((BX[0] + BX[1]) / 2 - 0.005, 0.041, 0.044);
  // The glance (6.0): the tired half-lid take drawn twice unmirrored, so both pupils go down and right, toward the blob
  // in the foreground. The rig's own pair mirrors the right eye, so its pupils meet below: on the phone.
  const glance = (() => {
    const FACE = 0.4595 * FIG_K, art = faces.pieces.eyes_tired, [w, h] = faces.sizes.eyes_tired, pair = 98 / 0.4595;
    const CW0 = 232 + pair, CH = 160, c = Object.assign(document.createElement('canvas'), { width: Math.round(CW0), height: CH }), g = c.getContext('2d');
    for (const cx of [CW0 / 2 - pair / 2, CW0 / 2 + pair / 2]) g.drawImage(art, cx - w / FACE / 2, CH / 2 - h / FACE / 2, w / FACE, h / FACE);
    const m = paper('glance', { art: c, size: [CW0 * FACE, CH * FACE], res: 256 });
    m.position.z = 0.0002; m.visible = false;
    rig.joints.eyes.add(m);
    return m;
  })();
  // The phone: lying on his chest, screen up toward his face, so from the foot of the bed it's a dark slab seen nearly
  // edge-on, its screen's light spilling past its far edge. Never the screen toward us (the reference's flashlight).
  const phone = new THREE.Group();
  phone.position.set(...H_PHONE);
  scene.add(phone);
  const slab = paper('phone', { path: [[0.1, 0], [0.9, 0], [1, 0.25], [1, 0.75], [0.9, 1], [0.1, 1], [0, 0.75], [0, 0.25]], color: col('navy', 'ink', 0.5), size: [0.0092, 0.0036], res: 256 }, dull);
  phone.add(slab);
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.0086, 0.0014), new THREE.MeshBasicMaterial({ color: PALETTE.phone }));
  edge.position.set(0, 0.0019, -0.0005);                              // the screen's lit edge, just over the slab's top
  phone.add(edge);

  // ---------- the blob near the lens: a silhouette, its eyes on him, a thin rim of the phone's light ----------
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  exam.mesh.position.set(...H_BLOB);
  exam.mesh.castShadow = false;
  scene.add(exam.mesh);
  // From behind there's no face and nothing lit on our side: the eyes and the painted highlight are on his side. So every
  // frame, after the blob reads the scene, its eyes go off the plane and its light goes out (shot-side, as s09a's glow).
  const U = exam.mesh.material.uniforms, ob = exam.mesh.onBeforeRender;
  exam.mesh.onBeforeRender = (...a) => { ob(...a); U.uLightKind.value = 0; U.uAmb.value.setRGB(0, 0, 0); for (const e of U.uEye.value) e.y = 99; U.uHiR.value = 99; };
  // The rim: the blob's own outline a touch bigger, just behind it, in the phone's colour, nudged toward the phone (up and
  // left), so the light catches the edge on his side.
  const rimMat = exam.silhouette({ color: PALETTE.phone, soft: 0.04 });
  const rim = new THREE.Mesh(exam.mesh.geometry, rimMat);
  rim.castShadow = false;
  scene.add(rim);

  // ---------- light: the phone, nothing else (the lamp is off) ----------
  const under = new THREE.PointLight(PALETTE.phone, 0, 0.06, 2);     // his chin and snout from below
  under.position.set(H_PHONE[0], H_PHONE[1] + 0.003, H_ROOT[2] + 0.008);
  const room = new THREE.PointLight(PALETTE.phone, 0, 0.6, 1);       // the screen's spill on the pillow, headboard and wall
  room.position.set(H_PHONE[0], H_PHONE[1] + 0.012, H_PHONE[2] + 0.004);
  scene.add(under, room);

  const hues = HUES(PALETTE), hue = new THREE.Color(), base = new THREE.Color(PALETTE.phone);
  /** Place the blob at radius r (its contact stays planted); colour the phone's light. */
  const set = (t, { r, colour, squash = 0, wobble = 1, level = 1 }) => {
    exam.mesh.scale.setScalar(r / BLOB_R.start);
    exam.update(t, { squash, wobble, eyes: 'open' });
    rim.position.set(H_BLOB[0] - 0.0012 * r / BLOB_R.start, H_BLOB[1] + 0.0010 * r / BLOB_R.start, H_BLOB[2] - 0.003);
    rim.scale.setScalar(1.022 * r / BLOB_R.start);
    hue.copy(colour);
    rimMat.color.copy(hue).multiplyScalar(0.8);
    edge.material.color.copy(hue);
    // The hue is the screen's, at full strength only close to it (his face, the hands, the phone's edge, the rim); the
    // spill that reaches the wall and the bed is mostly the phone's own cyan with a third of the reel's colour in it.
    under.color.copy(hue); room.color.copy(base).lerp(hue, WALL_HUE);
    under.intensity = H_UNDER * level; room.intensity = H_ROOM * level;
  };
  return { T, rig, exam, rim, glance, phone, edge, under, room, clock, hues, set };
}
const H_UNDER = 0.016, H_ROOM = 0.012;
export const WALL_HUE = 0.3;                                  // how much of a reel's colour reaches the room (orchestrator: ≤ a third)

// The key's level and the face fill (s08 and s09a keep them while the phone is on); the moon panes' glow.
export const SPOT = 0.9, SPOT_ANGLE = 1.05, FACE_FILL = 0.05, SPILL = 0.40, MOON_PANES = 0.10, FACE_LIGHT = 0.0035;

// The thumb flicks (v7): one per reel, on the sound's cuts (cues.js REELS), so each flick changes what the phone plays.
const FLICKS = REELS.map(([, , from]) => F(from));

const ID = 's07';
// v7-bed, the cut: H (head-on) 0–6.25, the phone insert 6.25–7.5 (v6-canvas-b, unchanged: the 7-hours reminder, swiped at
// 7.25), W (the side-on wide, CAM/LOOK) 7.5–8.5 for gulp3, where the ceiling shadow jumps: the rule, which H can't show
// (its shadow falls toward the lens). Then H to the end, the silhouette now 2.5×. H replaces v6's cut-in (2.0–5.5).
const INS = [6.25, 7.5], W = [7.5, 8.5];
const GLANCE = [6.0, 6.167];                                  // clockGlance: his eyes to the blob in the foreground, then back down
export async function build(ctx) {
  const { camera, post } = ctx;
  const R = await bedroom(ctx, ID), { rig, exam, spot, fill, clock } = R;
  const Hs = await headOn(ctx, ID);
  const WIDE_FOCUS = new THREE.Vector3(0.12, 0.062, 0.31).sub(CAM).dot(LOOK.clone().sub(CAM).normalize());
  const fx = post({ focus: WIDE_FOCUS, aperture: 0.012, lut: 'night' });
  R.moonPanes(MOON_PANES);
  const ins = reminderInsert(ctx, { body: COUNTDOWN.s07, screen: R.glow.material.map, back: ctx.PALETTE.navy, dir: [0, 1] });
  ctx.scene.add(ins.group);

  return {
    ...R, head: Hs,
    update(t) {
      const T = onTwos(t), insert = t >= INS[0] - 1e-6 && t < INS[1] - 1e-6, h = t < INS[0] - 1e-6 || t >= W[1] - 1e-6;
      R.T.boil(t); clock.boil(t); rig.boil(t, 10);
      Hs.T.boil(t); Hs.clock.boil(t); Hs.rig.boil(t, 10);
      clock.set(1, 45, t); Hs.clock.set(1, 45, t);
      const colour = Hs.hues[hueAt(T)];
      // ---- camera: H, or the wide (the insert rides in front of the wide's camera) ----
      if (h) { camera.position.set(...H_CAM.pos); camera.lookAt(...H_CAM.look); fx.set({ focus: H_FOCUS, aperture: 0.02 }); }
      else { camera.position.copy(CAM); camera.lookAt(LOOK); fx.set({ focus: WIDE_FOCUS, aperture: 0.012 }); }
      if (insert) fx.set({ focus: 0.06, aperture: 0.002 });
      ins.update(camera, { on: insert, arrive: T < F(6.333) ? 0.5 : 1,
        touch: at2(T, 7.083, 7.167) ? 0.5 : T >= F(7.167) ? 1 : 0, swipe: at2(T, 7.25, 7.333) ? 0.3 : at2(T, 7.333, 7.417) ? 0.7 : T >= F(7.417) ? 1 : 0 });
      const flick = FLICKS.some((f) => Math.abs(T - f) < 1e-6);

      // ---- H: him head-on, numb, deadpan. The flicks turn the phone's colour; on clockGlance his eyes go to the blob ----
      Hs.rig.pose({ body: 0, arm_l: -112 * DEG, arm_r: 112 * DEG });   // up and in over the blanket's fold to the phone
      if (flick) Hs.rig.joints.arm_r.rotation.z += 4 * DEG;      // the thumb
      act(Hs.rig, t, [[0, 'numb']], { slump: 0, tilt: 0, tail: 0 });
      const glancing = at2(T, ...GLANCE);
      Hs.glance.visible = glancing; Hs.rig.meshes.eyes.visible = !glancing;
      Hs.set(t, { r: t >= 7.5 - 1e-6 ? BLOB_R.gulp3 : BLOB_R.start, colour });

      // ---- W: lie_phone, the thumb, numb; the Exam gulps at 7.5 (README §1) ----
      rig.blend({ lie: LIE }, [[0, 'lie']], 0);
      if (flick) rig.joints.arm_r.rotation.z += FLICK * DEG;
      act(rig, t, [[0, 'numb']], { slump: 0, tilt: 0, tail: 0, depth: 0, blink: false });
      rig.joints.body.scale.x = 1 + 0.010 * Math.sin(2 * Math.PI * T / 7.5);   // 8/min; lying, the chest rises along the body's x
      const g = t >= 7.5 - 1e-6, r = g ? BLOB_R.gulp3 : BLOB_R.start;
      let squash = 0, eyes = 'side', wobble = 1;
      if (at2(T, 7.417, 7.5)) { squash = 0.3; eyes = 'closed'; }
      else if (g) { eyes = 'open'; wobble = 0.8; if (T < 7.75) squash = -0.2 * Math.exp(-10 * (T - 7.5)); }
      R.placeBlob(r);
      exam.update(t, { squash, wobble, eyes, look: -1, key: spot });

      // ---- light: the phone, constant with a ±3% seeded flicker per drawing (the feed scrolling), in the reel's colour ----
      spot.intensity = SPOT * (1 + 0.03 * (2 * hash2(seedOf(ID, 'feed') % 65536, Math.round(T * 12)) - 1));
      spot.color.set(ctx.PALETTE.phone).lerp(colour, WALL_HUE); fill.color.copy(colour);   // the ceiling and wall get a third; his face all
      fill.intensity = FACE_FILL * SPOT;
      R.spill.intensity = SPILL;
      R.face.intensity = FACE_LIGHT;
    },
  };
}
