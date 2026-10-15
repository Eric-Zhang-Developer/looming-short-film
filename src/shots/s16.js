// s16 · Problem #1, the montage, the neighbor's light (docs/shots/s16.md). Picks up on s15's last frame.
// Marston reading room at night, side view, s15's hero desk unit (UNIT from s15.js) plus the neighbor's unit mirrored
// (x' = 0.350 − x). Each desk has its own motion-sensor zone (README §3): his stays lit because he keeps working;
// the neighbor's is dead until he stands beside it at 15.0. Part 1 (0–6) on Camera B; part 2 (6–21) a locked wide
// Camera D time-lapse where every pose pops and holds 0.5 s. Characters on 2s; light and camera at 24.
// Q2 (b): the neighbor's wake is seen, not heard (no sound lives here anyway).
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, sensorLight, fluorescent, ambient, aim } from '../lights.js';
import { kf, clamp, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { makeCrowd } from '../characters/crowd.js';
import { SHRINK, BLOB_R as OTHER_R } from '../characters/exam.js';
import { POSES, specPose } from '../characters/poses.js';
import { UNIT } from './s15.js';

// ---------- tunables (the final pass changes these, not the staging) ----------
const BLOB_R = 0.012;   // the hero's blob coming in from s15 (blob-meter pass: one line)
// r after n problems solved, as a fraction of BLOB_R: README §1's 0.012 → 0.0105 → 0.009 → 0.008 → 0.007 → 0.006 → 0.005
const BLOB_STEPS = SHRINK.map((r) => BLOB_R * r / SHRINK[0]);

const ID = 's16', D = Math.PI / 180;
const dr = (n) => n / 12;
// s15's light levels, so the cut in from s15 doesn't jump.
const PHONE_I = 1.0, FLUOR_I = 1.0, AMB_K = 0.45, FILL_PHONE = 0.003, FILL_ZONE = 0.02;
const ZONE_I = 0.8;     // sensorLight's default: s15's lamp pool at the blob
const ZONE_AT = [0.000, 0.127, 0.040], N_ZONE_AT = [0.350, 0.127, 0.040];   // tube centres (README §3, mirrored for the neighbor)
const FILL_OFF = [0.029, 0.040, 0.114];   // character fill: x off the hip, then world y, z (s15's (−0.046, 0.040, 0.114))
const TROUGH_DARK = 0.3; // the troughs' card, unlit (× kraft): the phone's cone hits the neighbor's housing and made a dead zone look lit
const LIP_H = 0.0025;   // the diffuser lip under each trough (see the light section)
const OUTSHONE = 0.05;  // README §4 says 0.2; at 0.2 the loom still read after the wake (s15 measured 43% contrast), so s15's 0.05
const FLUOR_D = 0.4;    // room light on Camera D: at s15's 1.0 a dead zone looked as lit as a live one (readability over continuity at the cut)
const WAKE = 15;        // sensorWakeNeighbor (timeline; the spec's lampClickNeighbor)
const SOLVES = [3, 8.5, 11, 13, 14.5, 16];   // problemOneSolved … problemSolved6
const FLIPS = [11.5, 16.5];                   // page to the stack
const CUT = 6, END = 21;
const CAM_D = { pos: [0.168, 0.230, 1.010], look: [0.168, 0.040, 0.080], focus: [0.168, 0.020, 0.086] };
const MIR = 0.350;                            // neighbor unit: x' = MIR − x
const N = { hip: [0.425, -0.012], blob: [0.350, OTHER_R.neighbor, 0.098], phoneZ: 0.114, phoneLight: [0.360, 0.004, 0.114] };   // spec positions
const STAND_X = 0.175, FLOOR = -0.034;        // the gap between the desks
const K_DAWN = 0.08;                          // window k at 21.0 (s17 starts here)

// ---------- the hero: part 1 drawing by drawing, part 2 pops held 6 drawings ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
const up = (o) => specPose({ leg: 0, farLeg: 8, ...o });   // poses.js's standing legs
const P = { ...POSES, line1: seat({ lean: 14, arm: -21 }), antic: seat({ lean: 10, arm: -21 }),
  stand_stretch: up({ lean: -6, arm: 100, far: 80, head: 10 }), stand_look: up({ lean: 0, arm: -95, far: -95 }) };
const STANDING = new Set(['stand_stretch', 'stand_look']);
const WRITE = ['write_a', 'write_b', 'write_c'];
const PART1 = [
  [0, 'line1'], [dr(2), 'line1'], [dr(3), 'antic'], [dr(5), 'antic'], [dr(6), 'brace'],   // carried in, anticipation, brace
  ...Array.from({ length: 28 }, (_, i) => [dr(7 + i), WRITE[i % 3]]),   // 0.583–2.917 the answer; drawing 34 = write_a
  [dr(71), 'write_a'],                                                  // 3.0 the pen lifts; still to 6.0
];
// Part 2 pop table (spec). 17.0–20.5 cycles c, a, b so the last pose is write_a (s17 opens on it) and no pose repeats.
const POPS = [[6, 'write_a'], [6.5, 'write_c'], [7, 'think'], [7.5, 'write_b'], [8, 'write_a'], [8.5, 'solve'],
  [9, 'write_c'], [9.5, 'think'], [10, 'write_b'], [10.5, 'write_a'], [11, 'solve'], [11.5, 'flip'], [12, 'write_b'],
  [12.5, 'write_c'], [13, 'solve'], [13.5, 'write_a'], [14, 'think'], [14.5, 'solve'], [15, 'stand_stretch'], [15.5, 'stand_look'],
  [16, 'solve'], [16.5, 'flip'], ...['write_c', 'write_a', 'write_b', 'write_c', 'write_a', 'write_b', 'write_c', 'write_a'].map((n, i) => [17 + i / 2, n])];
const held = (pops) => pops.flatMap(([t, n], i) => (i + 1 < pops.length ? [[t, n], [pops[i + 1][0] - dr(1), n]] : [[t, n]]));   // pop, hold, pop
const BODY = [...PART1, ...held(POPS)];
const popAt = (tc, pops = POPS) => pops.findLast(([t]) => tc >= t - 1e-6)?.[1];
const isWrite = (n) => !!n?.startsWith('write');
// Head on body (deg): s15 ends at −14. Brace −4 more, the disbelief another −4; montage −14, think +6; standing from the pose.
const HEAD1 = [[0, -14], [dr(5), -14], [dr(6), -18], [dr(43), -18], [dr(44), -22]];
const headAt = (tc) => { const p = popAt(tc);
  return tc < CUT ? kf(tc, HEAD1) : p === 'stand_stretch' ? 10 : p === 'stand_look' ? 0 : -14 + (p === 'think' ? 6 : 0); };
const eyesAt = (tc) => { const p = popAt(tc);
  return tc < CUT ? (tc < 3.5 ? 'worried' : tc < 4.5 ? 'gasp' : 'side')
    : p === 'stand_stretch' ? 'closed' : p === 'think' ? 'side' : 'open'; };
const mouthAt = (tc) => { const p = popAt(tc);
  return tc < CUT ? (tc < dr(46) ? 'line' : tc < 5.25 ? 'o' : 'smile')
    : p === 'stand_stretch' ? 'o' : p === 'stand_look' ? 'neutral' : (p === 'solve' || tc >= SOLVES[3]) ? 'smile' : 'line'; };

// ---------- the neighbor (crowd_sheet, mirrored to face −x), pops on the same grid ----------
const NP = { ...POSES, n_phone: specPose({ lean: 24, arm: -10, far: null, head: -6 }) };   // reaching to turn the phone over
const NPOPS = [[0, 'crowd_hunch'], [15.5, 'crowd_look_up'], [16.5, 'n_phone'], [17, 'crowd_write']];

const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));   // s15's: peaks on the beat

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const [furn, props] = await Promise.all(['marston_furniture_sheet', 'study_props_sheet'].map((n) => assets.load(n)));
  const boiling = [];
  const sheet = (opts, parent = scene) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  const cut = (a, name, { weight, res = 512, parent = scene, key = name } = {}) => {   // s15's: origin at the visible centre
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${key}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // ---------- room (s15's; floor widened for Camera D) ----------
  const WALL = [1.3, 0.394], PX = 2048 / WALL[0], WINDOWS = [-0.51, -0.31, -0.11, 0.09, 0.29, 0.49];
  const wallArt = Object.assign(document.createElement('canvas'), { width: 2048, height: Math.round(WALL[1] * PX) });
  { const g = wallArt.getContext('2d'); g.fillStyle = PALETTE.navy; g.fillRect(0, 0, wallArt.width, wallArt.height);
    for (const cx of WINDOWS) g.clearRect((cx - 0.05 + 0.65) * PX, (0.36 - 0.300) * PX, 0.10 * PX, (0.300 - 0.066) * PX); }
  sheet({ art: wallArt, size: WALL, key: `${ID}-marston_window_wall`, res: 2048 }).position.set(0, (0.36 - 0.034) / 2, 0);
  // Panes are white tissue tinted by material.color, so the pre-dawn ramp is a colour change, not a re-tear.
  const PANE = { night: C('navy').lerp(C('ink'), 0.35).convertLinearToSRGB(), dawn: C('navy').lerp(C('cream'), 0.2).convertLinearToSRGB() };   // lerped in sRGB
  const panes = WINDOWS.map((cx) => {
    const m = sheet({ path: RECT, color: '#ffffff', weight: 'tissue', size: [0.11, 0.245], key: `${ID}-pane${cx}`, res: 256 });
    m.position.set(cx, 0.183, -0.001); m.castShadow = false; return m;
  });
  flat(sheet({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [1.3, 0.45], key: `${ID}-marston_floor`, res: 1024 }))
    .position.set(0.1, -0.034, 0.225);

  // ---------- desk units: the hero's, and the neighbor's mirrored (own keys, so own tears: doc 03, never clone) ----------
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;   // glyph bars, no text
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  function deskUnit(parent, tag, phoneZ) {
    const k = (n, o = {}) => ({ parent, key: `${tag}-${n}`, ...o });
    flat(cut(furn, 'desk_top', k('desk_top', { weight: 'kraft', res: 1024 }))).position.set(0.0585, 0, 0.075);
    cut(furn, 'desk_apron', k('desk_apron', { weight: 'kraft', res: 1024 })).position.set(0.0585, -0.017, 0.120);
    cut(furn, 'chair', k('chair', { weight: 'kraft' })).position.set(-0.076, -0.034 + 0.025, 0.071);
    flat(cut(props, 'exam_page', k('exam_page', { res: 1024 }))).position.set(-0.0205, 0.0003, 0.095);
    const phone = new THREE.Group(); phone.position.set(UNIT.phone[0], UNIT.phone[1], phoneZ); parent.add(phone);
    flat(cut(props, 'phone_face', { parent: phone, key: `${tag}-phone_face` })).position.y = 0.0004;
    const back = cut(props, 'phone_back', { parent: phone, key: `${tag}-phone_back` }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004;
    const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0064), new THREE.MeshBasicMaterial({ map: scrTex })));
    screen.position.y = 0.00045; phone.add(screen);
    return { phone, screen };
  }
  const heroUnit = deskUnit(scene, 'hero', UNIT.phone[2]);
  heroUnit.phone.rotation.x = Math.PI;   // face-down and dark since s15's 7.417
  const nGroup = new THREE.Group(); nGroup.position.x = MIR; nGroup.scale.x = -1; scene.add(nGroup);
  const nUnit = deskUnit(nGroup, 'nbr', N.phoneZ);

  // hero-only props: the closed laptop, pen and cap, the finished-page stack
  cut(props, 'laptop_base').position.set(-0.0075, 0.0015, 0.060);
  cut(props, 'laptop_lid').position.set(-0.0075, 0.0045, 0.0601);
  const pen = new THREE.Group(); scene.add(pen);
  cut(props, 'pen', { parent: pen }).position.x = -0.006;
  flat(cut(props, 'pen_cap')).position.set(-0.030, 0.0008, 0.100);   // where s15 set it down
  const stack = [0, 1].map((i) => {
    const g = flat(cut(props, 'exam_page', { key: `stack${i}`, res: 512 }));
    g.position.set(0.0275, 0.0003 + 0.0004 * (i + 1), 0.050); g.rotation.z = (i ? 3 : -2) * D; return g;
  });
  // the neighbor's three energy drinks, standing on their desk
  const [, v0, , v1] = props.visible.energy_drink, ch = props.sizes.energy_drink[1] * (v1 - v0);
  [[0.245, 0.090, -4], [0.262, 0.0975, 0], [0.280, 0.105, 6]].forEach(([x, z, a], i) => {
    const g = cut(props, 'energy_drink', { key: `can${i}` }); g.position.set(x, ch / 2, z); g.rotation.z = a * D;
  });

  // ---------- the working page's ink: problem glyphs, the name (first page only), the answers ----------
  const INK = Object.assign(document.createElement('canvas'), { width: 500, height: 600 });   // 0.025 × 0.030 m
  const inkTex = new THREE.CanvasTexture(INK); inkTex.colorSpace = THREE.SRGBColorSpace;
  const inkPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.030),
    new THREE.MeshLambertMaterial({ map: inkTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  flat(inkPlane).position.set(-0.0205, 0.00035, 0.095); inkPlane.receiveShadow = true; scene.add(inkPlane);
  const rng = mulberry32(seedOf('s15', 'ink'));   // s15's seed and draw order: the same glyphs and name across the cut
  const vOf = (z) => (z - 0.080) / 0.030 * 600, LINES = [0.093, 0.100, 0.107];
  const glyphs = props.proxy ? LINES.map((z) => {
    const pts = []; for (let u = 0.3; u <= 0.88; u += 0.02) pts.push([u * 500, vOf(z) + (rng() - 0.5) * 6]);
    return { y: vOf(z), x: 0.12 * 500, pts };
  }) : [];
  const NAME = []; for (let i = 0; i <= 90; i++) {
    const u = 0.15 + 0.45 * i / 90, ph = i * 0.55;
    NAME.push([u * 500 + 6 * Math.sin(ph * 1.3), vOf(0.086) - 9 * Math.sin(ph) * (0.6 + 0.4 * Math.sin(i * 0.21)) + (rng() - 0.5) * 2]);
  }
  const arng = mulberry32(seedOf(ID, 'answers'));   // answer squiggles, page u 0.15–0.55 on each line: illegible loops
  const ANS = LINES.map((z) => Array.from({ length: 61 }, (_, i) => {
    const u = 0.15 + 0.40 * i / 60, ph = i * 0.7 + arng() * 0.3;
    return [u * 500 + 5 * Math.sin(ph * 1.2), vOf(z) - 2 - 7 * Math.abs(Math.sin(ph)) + (arng() - 0.5) * 3];
  }));
  // How much of problem p (0 = #1 … 5 = #6; 6 = the one he starts on page 3) is written at tc.
  function written(p, tc) {
    if (p === 0) return clamp((tc * 12 - 6) / 28);   // drawings 7–34
    const [a, b] = p < 6 ? [Math.max(SOLVES[p - 1], CUT), SOLVES[p]] : [FLIPS[1], END];
    const w = POPS.filter(([t, n]) => t >= a && t < b && isWrite(n)), done = w.filter(([t]) => tc >= t - 1e-6).length;
    if (p < 6) return tc >= b - 1e-6 ? 1 : w.length ? done / w.length : 0;   // #6 has no writing pops (he's up): it lands whole on its solve
    return done / (w.length + 3);                                            // #7 isn't finished in this shot
  }
  let drawnKey = '';
  function drawInk(tc, page) {
    const fr = LINES.map((_, i) => written(page * 3 + i, tc)), key = page + ':' + fr.map((f) => f.toFixed(3)).join(',');
    if (key === drawnKey) return; drawnKey = key;
    const g = INK.getContext('2d'); g.clearRect(0, 0, 500, 600); g.lineCap = g.lineJoin = 'round';
    g.strokeStyle = '#' + C('navy').lerp(C('cream'), 0.25).getHexString(); g.lineWidth = 4;
    for (const l of glyphs) {
      g.beginPath(); g.arc(l.x, l.y, 9, 0.3, 5.9); g.stroke();
      g.beginPath(); l.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    }
    g.strokeStyle = PALETTE.ink; g.lineWidth = 5;
    const stroke = (pts, f) => { const n = Math.round(f * (pts.length - 1)); if (n < 1) return;
      g.beginPath(); for (let i = 0; i <= n; i++) g[i ? 'lineTo' : 'moveTo'](...pts[i]); g.stroke(); };
    if (page === 0) stroke(NAME, 1);
    fr.forEach((f, i) => stroke(ANS[i], f));
    inkTex.needsUpdate = true;
  }

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ); scene.add(hero.group);
  const exam = createBlob({ radius: BLOB_R, seed: 1 });   // makeExam's seed; s15's blob at its built mark
  exam.mesh.position.set(UNIT.blob[0], 0, UNIT.blob[2]);
  exam.stain.position.set(UNIT.blob[0], 0.0004, UNIT.blob[2]);
  scene.add(exam.mesh, exam.stain);

  const nbr = await makeCrowd({ assets }, 'neighbor', { seed: 16 });
  nbr.group.position.set(N.hip[0], N.hip[1], UNIT.bodyZ); nbr.group.scale.x = -1; scene.add(nbr.group);
  const nBlob = createBlob({ radius: OTHER_R.neighbor, seed: 13 });
  nBlob.mesh.position.set(N.blob[0], 0, N.blob[2]); nBlob.stain.position.set(N.blob[0], 0.0004, N.blob[2]);
  scene.add(nBlob.mesh, nBlob.stain);

  // ---------- light: one motion-sensor zone per desk (README §3), the neighbor's phone (§4) ----------
  const zone = sensorLight({ at: ZONE_AT, aimAt: [UNIT.blob[0], 0, UNIT.blob[2]], intensity: ZONE_I });   // his: lit all shot
  const nZone = sensorLight({ at: N_ZONE_AT, aimAt: [N.blob[0], 0, N.blob[2]], intensity: ZONE_I });      // theirs: dead until WAKE
  const troughCard = new THREE.MeshBasicMaterial({ color: C('kraft').multiplyScalar(TROUGH_DARK) });
  for (const z of [zone, nZone]) {
    scene.add(z.group, z.light, z.light.target);
    z.group.traverse((m) => { if (m.isMesh && m !== z.tube) m.material = troughCard; });
    // Camera D looks down on the troughs, so the tube inside is hidden: a diffuser lip under the front wall glows with
    // the zone's level (dark when dead), so the wide shot shows which zone is awake. The tube's own dull/lit pair was
    // too close to read at sheet size.
    z.lip = new THREE.Mesh(new THREE.PlaneGeometry(0.056, LIP_H), new THREE.MeshBasicMaterial());
    z.lip.position.set(0, ZONE_AT[1] - 0.002 - LIP_H / 2, 0.0085); z.lip.castShadow = false; z.group.add(z.lip);
  }
  const LIP = { dead: C('kraft').multiplyScalar(0.12), lit: C('cream').lerp(C('gator'), 0.15) };
  const glow = (z, level) => z.lip.material.color.copy(LIP.dead).lerp(LIP.lit, clamp(level));
  const FILL = { phone: C('phone').lerp(C('navy'), 0.35), zone: C('cream').lerp(C('gator'), 0.15) };   // README §10, fluorescent tone
  const fill = new THREE.PointLight(FILL.zone, FILL_ZONE, 0.07, 2);
  fill.castShadow = false; scene.add(fill);

  const nPhone = phoneLight({ angle: 0.9, penumbra: 0.4, intensity: PHONE_I });
  nPhone.position.set(...N.phoneLight); scene.add(nPhone, nPhone.target); aim(nPhone, V(N.blob));   // along phone → blob
  const nFill = new THREE.PointLight(FILL.phone, FILL_PHONE, 0.07, 2);   // the hero's fill, mirrored
  nFill.castShadow = false; nFill.position.set(MIR + 0.046, 0.040, 0.114); scene.add(nFill);

  const tubes = fluorescent({ intensity: FLUOR_I }); scene.add(tubes.light);   // flicker 0: update() never called
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera and post ----------
  const look = new THREE.Vector3(), dir = new THREE.Vector3(), focus = new THREE.Vector3(), hand = new THREE.Vector3();
  const fx = post({ focus: 0.3, aperture: UNIT.aperture, maxblur: UNIT.maxblur, lut: 'amber' });
  let lastSeed = null;

  function update(t) {
    const tc = onTwos(t), seed = boilSeed(t, 10);
    if (seed !== lastSeed) { lastSeed = seed; for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed })); }

    // camera: B locked to the cut at 6.0, D locked after
    const cam = t < CUT ? { pos: UNIT.camB.pos, look: UNIT.camB.look, focus: UNIT.focus } : CAM_D;
    camera.position.set(...cam.pos); camera.lookAt(look.set(...cam.look)); camera.getWorldDirection(dir);
    fx.set({ focus: dir.dot(focus.set(...cam.focus).sub(camera.position)) });
    tubes.light.intensity = t < CUT ? FLUOR_I : FLUOR_D;

    // hero: seated at s15's hip, or standing in the gap between the desks (15.0–16.0)
    const pop = tc < CUT ? null : popAt(tc), standing = STANDING.has(pop);
    hero.boil(t, 10);
    hero.blend(P, BODY, tc + 1e-6);
    hero.pose({ head: headAt(tc) * D });
    hero.face({ eyes: eyesAt(tc), mouth: mouthAt(tc) });
    if (standing) hero.group.position.set(STAND_X, FLOOR + hipHeight(P[pop]), UNIT.bodyZ);
    else hero.group.position.set(UNIT.hip[0], UNIT.hip[1] - (tc < dr(3) ? 0.001 : 0), UNIT.bodyZ);   // s15's exhale drop, then shoulders up
    hero.group.updateMatrixWorld(true);
    hero.hand.getWorldPosition(hand);
    fill.position.set(hero.group.position.x + FILL_OFF[0], FILL_OFF[1], FILL_OFF[2]);   // s15's spot in front of his face, wherever he is

    // pen: tip on the fingertip at 45° (s15). Writing, the tip sits 2/4/6 mm up so it lands on page line 1/2/3 (s15's
    // flat-puppet cheat); solved, 2 mm more. Standing, it lies on the page's front edge.
    const page = FLIPS.filter((f) => tc >= f - 1e-6).length;
    const solved = SOLVES.filter((s) => tc >= s - 1e-6).length;
    const line = tc < CUT ? 0 : (pop === 'solve' ? solved - 1 : solved) - page * 3;
    const lift = 0.002 * (clamp(line, 0, 2) + 1);
    const writing1 = tc >= dr(7) - 1e-6 && tc < 3, still1 = tc >= 3 && tc < CUT;
    const bob = writing1 ? (Math.round(tc * 12) % 2) * 0.0005 : 0;
    if (standing) { pen.rotation.set(-Math.PI / 2, 0, 0); pen.position.set(-0.016, 0.0006, 0.106); }
    else {
      pen.rotation.set(0, 0, -Math.PI / 4);
      pen.position.set(hand.x, writing1 || isWrite(pop) ? lift + bob : still1 || pop === 'solve' ? lift + 0.002 : hand.y + 0.0003, 0.0868);
    }
    drawInk(tc, page);
    stack.forEach((s, i) => { s.visible = page > i; });

    // hero blob: braces with him, shrinks one step per solve (bottom planted, its stain ring with it), watches him
    const s = BLOB_STEPS[solved] / BLOB_R;
    exam.mesh.scale.setScalar(s); exam.stain.scale.setScalar(s);
    const braced = tc >= dr(4) && tc < 3, t0 = SOLVES.findLast((x) => tc >= x - 1e-6);
    exam.update(t, {
      key: zone.light,
      wobble: braced ? 0.3 : 1,
      squash: braced ? 0.25 : t0 === undefined ? 0 : kick(tc, t0, 0.3),
      eyes: tc >= 18 || (tc >= dr(6) && tc < 3.25) ? 'closed' : tc >= 4.5 ? 'side' : 'open',
      look: standing ? 1 : -1,   // follows him into the gap
    });
    exam.mesh.rotation.z = (tc >= 4.5 && tc - t0 >= 0.25 - 1e-6 ? 10 : 0) * D;   // tilted toward him; upright for each squash

    // light (on 1s): his zone stays lit; theirs wakes when he stands beside it
    glow(zone, zone.update(t));
    const nLevel = nZone.update(t, { wake: WAKE }); glow(nZone, nLevel);
    const nDown = tc >= 16.5 - 1e-6, nLit = nLevel >= 0.5;
    nUnit.phone.rotation.x = nDown ? Math.PI : 0;
    nPhone.intensity = nDown ? 0 : PHONE_I * (nLit ? OUTSHONE : 1);
    nUnit.screen.material.color.setScalar(nLit ? 0.6 : 1);
    nFill.color.copy(t >= WAKE ? FILL.zone : FILL.phone); nFill.intensity = t >= WAKE ? FILL_ZONE : FILL_PHONE;

    // neighbor
    nbr.boil(t, 10);
    nbr.blend(NP, held(NPOPS), tc + 1e-6);
    nBlob.update(t, { key: nLit ? nZone.light : nPhone, squash: kick(tc, WAKE, 0.3), wobble: tc >= WAKE + 0.5 ? 0 : 1 });

    // window: pre-dawn k 0 → 0.08 over 6–21 as a pane colour only (elevation ≤ 3°: no light reaches the frame)
    const k = K_DAWN * clamp((t - CUT) / (END - CUT));
    for (const m of panes) m.material.color.copy(PANE.night).lerp(PANE.dawn, k / K_DAWN).convertSRGBToLinear();
  }

  return { update };
}
