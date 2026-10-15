// s02 · The ink drop is born (docs/shots/s02.md). Animatic blocking: the home desk unit on proxies.
// A bead swells on Friday's red circle, runs down the calendar, drops to the desk, swells into the Exam and hops to B.
// He slumps at the desk's left end and never looks up. Locked camera, one window key (dawnLight, k 0.35), boil 10/s.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { dawnLight, ambient } from '../lights.js';
import { kf, ease, easeIn, easeOut, spring, lerp, clamp } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator } from '../characters/gator.js';
import { POSES } from '../characters/poses.js';
import { makeExam } from '../characters/exam.js';

const ID = 's02', DEG = Math.PI / 180;
const F = (n) => n / 12;                                // a 12 fps drawing number → seconds (the spec's times are on 2s)
const frameOf = (t) => Math.floor(t * 12 + 1e-6);       // which 2s drawing t shows (onTwos, float-safe)

// Calendar (README §2): plane z 0.006, center (0.150, 0.100), 0.10 × 0.12; the bottom 0.015 curls out to z 0.014.
const CAL = [0.150, 0.100, 0.006], CAL_W = 0.10, CAL_H = 0.12, LIP = 0.015, LIP_Z = 0.008;
const curl = (y) => { const k = (-CAL_H / 2 + LIP - y) / LIP; return k > 0 ? LIP_Z * k * k : 0; };  // y in calendar space
const CIRCLE = [0.020, -0.005];                         // the red circle (0.170, 0.095) in calendar space
const LIP_Y = -0.058;                                   // the lip point (0.170, 0.042)
const LAND = [0.170, 0, 0.020];                         // contact point on the desk (spec: center y 0.002 at scale 0.17)
const HOPS = [[0.127, 0.033], [0.083, 0.047], [0.040, 0.060]];   // hop targets (x, z); the last is B
const BEAD = 0.17;                                      // bead scale: 4 mm across on the 0.012 radius

// The Exam on its 2s grid. `page`: y of the drop's center in calendar space. `fall`: progress from the lip to the
// landing. `desk`: contact point (x, z) plus hop lift. s is the mesh scale on the 0.012 radius.
export function examAt(t) {
  const f = frameOf(t), tc = F(f);
  if (f < 40) return null;
  if (f < 48) {   // 3.33–4.00: the bead swells on the circle, eyes not drawn yet
    return { space: 'page', y: CIRCLE[1], s: BEAD * easeOut((tc - F(40)) / F(8)), squash: 0, eyes: 'closed' };
  }
  if (f < 60) {   // 4.00: squash pulse 0.2 → 0 over 4.00–4.17; 4.00–5.00 it runs to the lip, accelerating, stretched
    const k = easeIn(tc - 4);
    return { space: 'page', y: lerp(CIRCLE[1], LIP_Y, k), s: BEAD, squash: f < 50 ? 0.2 * (1 - (f - 48) / 2) : -0.3, eyes: 'closed' };
  }
  if (f < 64) return { space: 'fall', k: easeIn((tc - 5) / F(4)), s: BEAD, squash: -0.4, eyes: 'closed' };   // 5.00–5.33
  // 5.33 lands: squash 0.6 for one drawing, then a spring back to 0 by 5.67. The spring is kicked a drawing early:
  // the spec's spring(t, 5.33) is 0 on the landing drawing (the 0.6 overrides it) and 0.6 again on the next.
  const land = { space: 'desk', x: LAND[0], z: LAND[2], lift: 0, eyes: 'closed' };
  if (f < 68) return { ...land, s: BEAD, squash: f === 64 ? 0.6 : 0.6 * spring(tc, F(63)) };
  // 5.67–6.33: swells 0.17 → 1.08 at 6.17, settles to 1.0 at 6.33. Eyes open at 6.33, side at 6.50, open at 6.67.
  const s = kf(tc, [[F(68), BEAD], [F(74), 1.08], [F(76), 1]], easeOut);
  if (f < 82) return { ...land, s, squash: 0, eyes: f < 76 ? 'closed' : f >= 78 && f < 80 ? 'side' : 'open', look: -1 };
  // 6.83–8.83: three hops of 8 drawings: anticipation squash 0.25 (2), airborne on a 6 mm arc with stretch −0.15 (3),
  // landing squash 0.3 (1), settle (2). Each reaches its target on drawing 5 and holds it through the settle.
  const i = Math.min(2, Math.floor((f - 82) / 8)), k = f - 82 - 8 * i, done = f >= 106;
  const [x0, z0] = i ? HOPS[i - 1] : [LAND[0], LAND[2]], [x1, z1] = HOPS[i];
  const p = done ? 1 : k < 2 ? 0 : Math.min(1, (k - 1) / 4);
  const squash = done ? 0 : k < 2 ? 0.25 : k < 5 ? -0.15 : k === 5 ? 0.3 : k === 6 ? -0.08 : 0.03;
  return { space: 'desk', x: lerp(x0, x1, p), z: lerp(z0, z1, p), lift: p > 0 && p < 1 ? 0.006 * Math.sin(Math.PI * p) : 0,
    s: 1, squash, eyes: 'open' };
}

// The calendar's face for proxies: a month grid of scribble glyphs (nothing legible), Friday of the third row circled
// in red with a small exam glyph (a sheet with a check). No other red. Real `calendar` art replaces all of it.
function calendarArt(PALETTE) {
  const W = 1000, H = 1200, m = 40, rng = mulberry32(seedOf(ID, 'calendar-glyphs'));
  const cv = Object.assign(document.createElement('canvas'), { width: W + 2 * m, height: H + 2 * m }), g = cv.getContext('2d');
  const grey = '#' + new THREE.Color(PALETTE.navy).lerp(new THREE.Color(PALETTE.cream), 0.45).getHexString();
  g.translate(m, m);
  g.fillStyle = PALETTE.cream; g.fillRect(0, 0, W, H);
  g.fillStyle = PALETTE.navy; g.fillRect(0, 0, W, 0.045 * H);                  // binding strip
  g.lineCap = 'round'; g.lineJoin = 'round';
  const scribble = (x, y, w, h, lw) => {   // a wavy pencil line: reads as writing, spells nothing
    g.strokeStyle = PALETTE.navy; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y);
    const n = 4 * (3 + Math.floor(rng() * 4));
    for (let i = 1; i <= n; i++) g.lineTo(x + (w * i) / n, y + h * Math.sin(i * 1.7 + rng()) * (0.5 + 0.5 * rng()));
    g.stroke();
  };
  scribble(0.25 * W, 0.11 * H, 0.5 * W, 0.025 * H, 9);                         // month header
  const X0 = 0.06 * W, CW = 0.116 * W, Y0 = 0.282 * H, RH = 0.104 * H;         // 7 × 6 grid; row 2, column 5 holds the circle
  for (let c = 0; c < 7; c++) scribble(X0 + c * CW + 0.25 * CW, 0.235 * H, 0.5 * CW, 0.008 * H, 5);   // weekday glyphs
  g.strokeStyle = grey; g.lineWidth = 3;
  for (let c = 0; c <= 7; c++) { g.beginPath(); g.moveTo(X0 + c * CW + (rng() - 0.5) * 4, Y0); g.lineTo(X0 + c * CW + (rng() - 0.5) * 4, Y0 + 6 * RH); g.stroke(); }
  for (let r = 0; r <= 6; r++) { g.beginPath(); g.moveTo(X0, Y0 + r * RH + (rng() - 0.5) * 4); g.lineTo(X0 + 7 * CW, Y0 + r * RH + (rng() - 0.5) * 4); g.stroke(); }
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) if (rng() < 0.92) scribble(X0 + c * CW + 0.12 * CW, Y0 + r * RH + 0.22 * RH, 0.3 * CW, 0.05 * RH, 4);
  // The exam glyph and the red circle at (0.7, 0.542) of the sheet, Ø 0.12 of its width, gone over twice like a marker.
  const cx = 0.7 * W, cy = 0.542 * H, R = 0.06 * W, gw = 0.036 * W, gh = 0.046 * W;
  g.fillStyle = '#fff'; g.strokeStyle = PALETTE.navy; g.lineWidth = 3;
  g.fillRect(cx - gw / 2, cy - gh / 2, gw, gh); g.strokeRect(cx - gw / 2, cy - gh / 2, gw, gh);
  g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 0.010 * W, cy); g.lineTo(cx - 0.002 * W, cy + 0.010 * W); g.lineTo(cx + 0.013 * W, cy - 0.012 * W); g.stroke();
  g.strokeStyle = PALETTE.calendarRed; g.lineWidth = 10;
  for (const [dx, dy, a0] of [[0, 0, -0.4], [5, -4, 0.3]]) { g.beginPath(); g.ellipse(cx + dx, cy + dy, R, R * 0.93, 0.2, a0, a0 + 2 * Math.PI * 1.04); g.stroke(); }
  return { cv, size: [CAL_W * (W + 2 * m) / W, CAL_H * (H + 2 * m) / H] };
}

export async function build(ctx) {
  const { scene, camera, assets, PALETTE, post } = ctx;
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.set(0.060, 0.130, 0.640);   // locked
  camera.lookAt(0.060, 0.072, 0.060);
  const fx = post({ focus: 0.641, lut: 'night' });   // s01's grade, so the cut from the window doesn't shift colour

  // Planes tip by a seeded ±1.5° (doc 03). The desk top, apron, wall and floor stay true: the blob sits and hops on
  // the desk, and a 1.5° tip on a 0.33 m desk lifts one end 9 mm.
  const tiltOf = (layer) => { const r = mulberry32(seedOf(ID, layer)); return [(2 * r() - 1) * 1.5 * DEG, (2 * r() - 1) * 1.5 * DEG, 0]; };
  const boiling = [];  // [mesh, seed → PaperSheet]
  const sheet = (layer, opts, { at = [0, 0, 0], parent = scene, ...mat } = {}) => {
    const make = (s) => makePaper({ ...opts, key: `${ID}-${layer}`, seed: s });
    const mesh = paperMesh(make(0), mat);
    mesh.position.set(...at);
    parent.add(mesh); boiling.push([mesh, make]);
    return mesh;
  };
  // A RECT that fills its canvas has no edge to tear: inset it 4% and grow the size so the visible shape keeps [w, h].
  const torn = (w, h) => {
    const m = 0.04 * Math.max(w, h), W = w + 2 * m, H = h + 2 * m;
    return { path: [[m / W, m / H], [1 - m / W, m / H], [1 - m / W, 1 - m / H], [m / W, 1 - m / H]], size: [W, H] };
  };
  const flat = (mesh, turn = 0) => { mesh.rotation.set(-Math.PI / 2, 0, turn); return mesh; };   // lie down, turn in plane

  // ---- Wall (z 0), desk top (y 0, z 0…0.120), apron (z 0.120), procedural. The floor (y −0.034) is the unit's,
  // not a listed layer: without it the navy background shows under the wall behind the chair.
  sheet('apt_wall', { ...torn(0.85, 0.434), color: PALETTE.cream, res: 1024 }, { at: [0.025, 0.183, 0] });
  flat(sheet('apt_desk_top', { ...torn(0.333, 0.120), color: PALETTE.kraft, weight: 'kraft', res: 1024 }, { at: [0.1335, 0, 0.060] }));
  sheet('apt_desk_apron', { ...torn(0.333, 0.034), color: PALETTE.kraft, weight: 'kraft', res: 1024 }, { at: [0.1335, -0.017, 0.120] });
  const floorCol = '#' + new THREE.Color(PALETTE.kraft).lerp(new THREE.Color(PALETTE.navy), 0.55).getHexString();
  flat(sheet('floor', { ...torn(0.85, 0.3), color: floorCol, weight: 'kraft', res: 512 }, { at: [0.025, -0.034, 0.15] }));

  // ---- Calendar (z 0.006), its bottom 0.015 bent out to z 0.014 so the drop has a lip to fall from.
  const calA = await assets.load('calendar');
  const cal = calA.proxy ? calendarArt(PALETTE) : { cv: calA.pieces.sheet1, size: calA.sizes.sheet1 };
  const calendar = sheet('calendar', { art: cal.cv, size: cal.size, res: 1024 }, { at: CAL });
  calendar.rotation.set(...tiltOf('calendar'));
  {
    const geo = new THREE.PlaneGeometry(cal.size[0], cal.size[1], 1, 32), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, curl(pos.getY(i)));
    geo.computeVertexNormals();
    calendar.geometry.dispose(); calendar.geometry = geo;
  }
  calendar.updateMatrixWorld(true);
  const onPage = (y, out = new THREE.Vector3()) => calendar.localToWorld(out.set(CIRCLE[0], y, curl(y) + 0.002));
  const lipW = onPage(LIP_Y);

  // ---- Lamp (z 0.078, off): the unit lamp from desk_lamp pieces, one tipped group.
  const lampA = await assets.load('desk_lamp');
  const lamp = new THREE.Group();
  lamp.position.set(0, 0, 0.078); lamp.rotation.set(...tiltOf('desk_lamp'));
  scene.add(lamp);
  const lampPiece = (p, at, rotZ = 0, opts = {}) => {
    const m = sheet(`lamp-${p}`, { art: lampA.pieces[p], size: lampA.sizes[p], res: 256, ...opts }, { at, parent: lamp });
    m.rotation.z = rotZ; return m;
  };
  lampPiece('base', [-0.020, 0.002, 0.0005]);
  lampPiece('stem', [-0.020, 0.037, 0]);
  lampPiece('knob', [-0.0228, 0.0228, 0.001]);
  lampPiece('arm', [-0.008, 0.069, 0.0005], Math.atan2(-0.002, 0.024));
  // The proxy taper is wide at its left end; turned +90° that end is the shade mouth, centered at (0.004, 0.056).
  // A cream proxy shade lit like the cream wall disappears into it, so the proxy is tinted toward kraft (real art keeps its paint).
  const shade = lampPiece('shade', [0.004, 0.056 + lampA.sizes.shade[0] / 2, 0.001], lampA.proxy ? Math.PI / 2 : 0, { weight: 'tissue' });
  if (lampA.proxy) shade.material.color.lerp(new THREE.Color(PALETTE.kraft), 0.5);

  // ---- Props on the desk: the blank exam_page he ignores, and the phone screen-down at the rest spot (for s03).
  const props = await assets.load('study_props_sheet');
  const pr = mulberry32(seedOf(ID, 'props'));
  flat(sheet('exam_page', { art: props.pieces.exam_page, size: props.sizes.exam_page, res: 512 }, { at: [-0.0205, 0.0003, 0.095] }), (2 * pr() - 1) * 1.5 * DEG);
  flat(sheet('phone', { art: props.pieces.phone_back, size: props.sizes.phone_back, res: 256 }, { at: [-0.010, 0.0015, 0.114] }), (2 * pr() - 1) * 1.5 * DEG);

  // ---- Chair (z 0.071): marston_chair art as the home chair, visible x −0.092…−0.060, standing on the floor.
  const furn = await assets.load('marston_furniture_sheet');
  const [chW, chH] = furn.sizes.chair, [u0, , u1] = furn.visible?.chair ?? [0, 0, 1, 1];
  const chair = sheet('chair', { art: furn.pieces.chair, size: furn.sizes.chair, weight: 'kraft', res: 512 }, { at: [-0.076, 0, 0.071] });
  chair.scale.setScalar(0.032 / (chW * (u1 - u0)));
  chair.position.y = -0.034 + (chH * chair.scale.y) / 2;
  chair.rotation.set(...tiltOf('chair'));

  // ---- The Student: in profile facing +x at the desk's left end, hip (−0.075, −0.012), body plane z 0.074.
  const gator = await makeGator(ctx, { seed: 2 });
  gator.group.position.set(-0.075, -0.012, 0.074);
  scene.add(gator.group);
  const SLUMP = [[0, 'slump'], [9, 'slump']];

  // ---- The Exam, its stain on the desk where it lands and its trail down the calendar.
  const exam = makeExam({ shot: ID, seed: 1 }), R = exam.radius;
  scene.add(exam.mesh, exam.stain);   // the stain is always parented: blob.js clips the drop's floor against it
  exam.stain.position.set(LAND[0], 0.0003, LAND[2]);
  const trail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: PALETTE.ink,
    alphaMap: exam.stain.material.alphaMap, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  calendar.add(trail);
  const glint = new THREE.Mesh(new THREE.CircleGeometry(0.0007, 12), new THREE.MeshBasicMaterial({ color: PALETTE.cream }));
  scene.add(glint);

  // ---- Key: the morning window, off-screen frame-right. Fill: ambient(). No change over the shot.
  const sun = dawnLight();
  sun.update(0, 0.35);                                   // colour and intensity for k 0.35; the spec places it
  sun.light.position.set(0.8, 0.6, 0.6);
  sun.light.target.position.set(0.06, 0.05, 0.06);
  Object.assign(sun.light.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3 });   // 0.3 mm texels for a 4 mm bead
  sun.light.shadow.camera.updateProjectionMatrix();
  scene.add(sun.light, sun.light.target, ambient());

  const c = new THREE.Vector3();
  function place(e) {   // sets the mesh (origin = contact point) and returns the drop's center in world space
    if (e.space === 'page') onPage(e.y, c);
    else if (e.space === 'fall') c.set(lerp(lipW.x, LAND[0], e.k), lerp(lipW.y, LAND[1] + R * e.s, e.k), lerp(lipW.z, LAND[2], e.k));
    else c.set(e.x, e.lift + R * e.s, e.z);
    exam.mesh.position.set(c.x, c.y - R * e.s, c.z);
    exam.mesh.scale.setScalar(Math.max(1e-4, e.s));
    return c;
  }

  const api = {
    exam, gator, face: null,   // read by evidence/anim-s02/measure.html
    update(tLocal) {
      const seed = boilSeed(tLocal, 10);
      for (const [mesh, make] of boiling) updatePaperMesh(mesh, make(seed));

      // DOF on 1s: the calendar (0.641) until 5.0, then pull to the blob at B (0.592) by 6.0, and hold.
      fx.set({ focus: kf(tLocal, [[5, 0.641], [6, 0.592]], ease) });

      // The Student, on 2s. Slump throughout; blinks at 1.50 and 2.92 for one drawing; eyes to the blob at 8.33,
      // mouth tightens at 8.67. The tail idles a 2° sway, period 2.5 s, on top of follow().
      const f = frameOf(tLocal);
      gator.boil(tLocal, 10);
      gator.blend(POSES, SLUMP, tLocal);
      gator.follow('tail', tLocal, { k: 6, w: 18 });
      gator.joints.tail.rotation.z += 2 * DEG * Math.sin((2 * Math.PI * F(f)) / 2.5);
      api.face = { eyes: f >= 100 ? 'side' : f === 18 || f === 35 ? 'closed' : 'tired', mouth: f >= 104 ? 'line' : 'neutral' };
      gator.face(api.face);

      // The Exam.
      const e = examAt(tLocal);
      exam.mesh.visible = !!e;
      exam.stain.visible = f >= 64;
      exam.stain.scale.setScalar(f >= 82 ? 1 : clamp(e?.s ?? 0, 0.01, 1));   // grows with the swell, then stays put
      const at = e ? place(e) : null;
      if (e) exam.update(tLocal, { squash: e.squash, wobble: 1, eyes: e.eyes, look: e.look ?? 1 });

      // Trail: from the circle down to the drop over the flat of the page (the lip hides the rest), fading over 3 s from 5.0.
      const yEnd = f >= 60 ? -0.045 : e?.space === 'page' && f >= 48 ? Math.max(e.y, -0.045) : CIRCLE[1];
      const len = CIRCLE[1] - yEnd;
      trail.visible = len > 0.001 && tLocal < 8;
      trail.scale.set(0.0016, len + 0.002, 1);
      trail.position.set(CIRCLE[0], (CIRCLE[1] + yEnd) / 2, 0.0004);
      trail.material.opacity = 0.4 * clamp(1 - (tLocal - 5) / 3);

      // One-frame glint on the bead at 4.00 (light on 1s: the 24 fps frame on the beat).
      glint.visible = !!at && Math.round(tLocal * 24) === 96;
      if (glint.visible) glint.position.set(at.x + 0.0006, at.y + 0.0007, at.z + 0.0025);
    },
  };
  return api;
}
