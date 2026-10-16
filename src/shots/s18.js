// s18 · Crossed off; the ink goes home; the next date (docs/shots/s18.md, G4). v2 on s02's real-scale home desk, at
// night, the lamp on. Setups (README §8): W 0–3 (s02's wide), I 3–7 (s02's calendar insert), I2 7–11.5 (the sheet),
// W 11.5–17. He crosses the exam off the calendar (examCrossedOff 2.0) and the blob shrinks to a dot; the dot climbs
// the sheet it ran down in s02 and soaks into the circle it was born from (blobAbsorbed 5.5), leaving a faint trace.
// Then he writes the next exam, "Final", and circles it in red (newDate 9.5); a new bead of ink forms on the circle and
// quivers (dropQuivers 11.0); he looks at it and uncaps his pen (tagPenUncap 13.5), and it goes still. Fade to black.
// The room is s02's: DESK, homeDesk and the calendar come from s02.js, so the ending is the birth's own frame.
// Characters on 2s; the quiver on 1s; light, camera and fade on 1s; boil 10/s.
import * as THREE from 'three';
import { SHOTS } from '../timeline.js';
import { lampLight, ambient } from '../lights.js';
import { loadLUT } from '../post.js';
import { ease, easeOut, clamp, lerp } from '../core/ease.js';
import { createBlob } from '../blob.js';
import { makeGator } from '../characters/gator.js';
import { specPose } from '../characters/poses.js';
import { DESK, tools, homeDesk, seatReach } from './s02.js';

const ID = 's18', DEG = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;   // examCrossedOff 2, blobAbsorbed 5.5, newDate 9.5, dropQuivers 11, tagPenUncap 13.5
const CUT_I = 3, CUT_I2 = 7, CUT_W = 11.5, FADE = 16;

// ---------- tunables ----------
const BLOB_R = { start: 0.004, examCrossedOff: 0.0015 };   // SHRINK[7] → SHRINK[8], the dot (README §1); soaks away at blobAbsorbed
const BEAD = 0.17;                                           // the tag's new drop: s02's bead, 0.17 of a 1× (r 0.012) blob
const LAMP_I = 0.035, AMB = 0.5, FACE_I = 0.004;             // the lamp on (constant), night ambient, warm character fill
// ponytail: the light sits 16 mm in front of the painted shade's mouth, so its soft pool spills up the calendar; at the
// mouth's own depth (against the wall) it grazed the sheet. A lamp re-aim in the art would remove the cheat.
const LAMP_AT = [DESK.lampMouth[0] + 0.004, DESK.lampMouth[1] + 0.004, 0.020], LAMP_AIM = [0.036, 0.018, 0.004];
const STAIN = [1.0, 0.4];                                  // the soak's trace: opacity at the bloom, and the trace it leaves
// Cameras: s02's W and I (copied from s02.js, which doesn't export them), and I2 on the lower sheet.
const C = DESK.cal, [FX, FY] = C.friXY;
const LIP_Y = C.y0 + 0.0005 + 0.012 * 0.4;                   // s02's perch on the curl
const CAM_W = { pos: [0.004, 0.062, 0.40], look: [0.004, 0.030, 0.012] };
const CAM_I = { pos: [FX, (FY + LIP_Y) / 2 + 0.001, 0.09], look: [FX, (FY + LIP_Y) / 2, 0] };
const CAM_I2 = { pos: [0.040, 0.0465, 0.104], look: [0.040, 0.046, 0] };   // the lamp's shade stays out of frame
// The calendar's painted grid (art px of props_kit_calendar, 275 × 292): rows at 92/128/165/202/238/275, columns at
// 17/51/86/120/155/190/224/258. "Final" goes in row 4, column 3 (the spec's cell), on Friday's clean paper.
const NEW_CELL = [103, 220], CLEAN = [157, 167, 188, 200];
const XS = 44, X1 = [[8, 8], [36, 37]], X2 = [[37, 7], [7, 36]];   // the X's canvas (calendar art px) and its two strokes
const FONT = 13, FONT_FACE = '"Noteworthy", "Bradley Hand", "Chalkboard SE", cursive', INK = 'rgb(30, 42, 63)';
const NS = 58, CIRCLE_R = 23, A0 = -2.2;                     // "Final"'s canvas, its red circle (art px), the stroke's start

const F = (n) => n / 12, fr = (t) => Math.floor(t * 12 + 1e-6);
const xAt = (tc) => [clamp((tc - 1.5 + F(1)) / F(2)), clamp((tc - 1.833 + F(1)) / F(2))];   // drawings 18–19, 22–23
const wordAt = (tc) => clamp((tc - 7.5) / 1.25);
const circleAt = (tc) => (tc < 8.833 ? 0 : clamp((tc - 8.833 + F(2)) / 0.833));            // 4 drawings, closed on 9.5

export async function build(ctx) {
  const { scene, camera, PALETTE, post } = ctx;
  const Cc = (k) => new THREE.Color(PALETTE[k]);
  scene.background = Cc('navy').lerp(Cc('ink'), 0.5);
  const T = tools(ctx, ID);
  const set = await homeDesk(ctx, T, { pen: false });
  const { props } = set;
  const gsheet = await ctx.assets.load('gator_sheet');
  const fx = post({ focus: 0.39, aperture: 0.01, lut: 'amber' });

  // ---------- the desk tonight: the graded test, his pen and its cap, the red marker; the laptop shut at the back ----------
  set.page.g.visible = false; set.phone.g.visible = false;
  const graded = T.cut(props, 'graded_test', [0.0119, null], 'graded_test');
  graded.g.position.set(DESK.page[0], 0.0003, DESK.page[1]); graded.g.rotation.set(-Math.PI / 2, 0, 0.06);
  const MARKER = [-0.004, 0.029];
  T.rect('marker', PALETTE.calendarRed, [0.0055, 0.0009], [MARKER[0], 0.0005, MARKER[1]], { rot: [-Math.PI / 2, 0, 0.12] });
  T.rect('marker_cap', PALETTE.cream, [0.0018, 0.0010], [MARKER[0] + 0.0035, 0.0006, MARKER[1] - 0.0004], { rot: [-Math.PI / 2, 0, 0.12] });
  set.laptop.position.set(0.016, 0.0004, 0.008); set.laptop.rotation.y = 0; set.setLid(0);
  // The pen (mirrored so its nib points +x, origin at the nib) and its cap (open end on the nib).
  const pen = T.cut(props, 'pen', [0.0075, null], 'pen', { anchor: [1, 0.5], flip: true });
  const cap = T.cut(props, 'pen_cap', [0.0034, null], 'pen_cap', { anchor: [0.75, 0.5], flip: true });
  const penRest = [DESK.pen[0] + 0.0075, 0.0006, DESK.pen[1]];   // nib of the pen lying on the page's front edge

  // ---------- the calendar's new marks: the X (his pen), "Final" and its red circle (code, drawn on the sheet) ----------
  const cal = props.pieces.calendar, [cu0, cv0, cu1, cv1] = props.visible.calendar, AW = cal.width, AH = cal.height;
  const calH = C.w * ((cv1 - cv0) * AH) / ((cu1 - cu0) * AW);
  const artToWorld = (px, py) => [C.x0 + (px / AW - cu0) / (cu1 - cu0) * C.w, C.y0 + (cv1 - py / AH) / (cv1 - cv0) * calH];
  const mpp = C.w / ((cu1 - cu0) * AW);                        // metres per calendar art px
  const overlay = ([w, h], [x, y], z, K = 24) => {             // a canvas over the sheet, w × h art px, centred at world (x, y)
    const cv = Object.assign(document.createElement('canvas'), { width: Math.round(w * K), height: Math.round(h * K) });
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * mpp, h * mpp), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.position.set(x, y, C.z + z); m.receiveShadow = true; scene.add(m);
    let drawn = null;
    return (id, draw) => { if (id === drawn) return; drawn = id; const g = cv.getContext('2d'); g.setTransform(K, 0, 0, K, 0, 0); g.clearRect(0, 0, w, h); draw(g); tex.needsUpdate = true; };
  };
  // The X over Friday's square (placed at s02's friXY, so the X is too).
  const xo = overlay([XS, XS], [FX, FY], 0.0011);
  const seg = (g, [[a, b], [c, d]], k) => { if (k <= 0) return; g.beginPath(); g.moveTo(a, b); g.lineTo(lerp(a, c, k), lerp(b, d, k)); g.stroke(); };
  const drawX = (k1, k2) => xo(`${k1}|${k2}`, (g) => { g.strokeStyle = INK; g.lineWidth = 1.8; g.lineCap = 'round'; seg(g, X1, k1); seg(g, X2, k2); });
  const xw = ([px, py]) => [FX + (px - XS / 2) * mpp, FY - (py - XS / 2) * mpp, C.z];
  // "Final" on a clean cell (Friday's empty paper over the printed glyph), and its red circle.
  const [NX, NY] = artToWorld(...NEW_CELL);
  const no = overlay([NS, NS], [NX, NY], 0.0008);
  const drawFinal = (kw, kc) => no(`${kw.toFixed(3)}|${kc.toFixed(3)}`, (g) => {
    const c = NS / 2;
    g.drawImage(cal, CLEAN[0], CLEAN[1], CLEAN[2] - CLEAN[0], CLEAN[3] - CLEAN[1], c - 15.5, c - 16.5, 31, 33);
    if (kw > 0) {
      g.font = `${FONT}px ${FONT_FACE}`; g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 0.5;
      const w = g.measureText('Final').width, x0 = c - w / 2;
      g.save(); g.beginPath(); g.rect(x0 - 1, 0, w * kw + 1, NS); g.clip();
      g.fillText('Final', x0, c + FONT * 0.35); g.strokeText('Final', x0, c + FONT * 0.35); g.restore();
    }
    if (kc > 0) {
      g.strokeStyle = PALETTE.calendarRed; g.lineWidth = 2.8; g.lineCap = 'round'; g.beginPath();
      g.ellipse(c, c, CIRCLE_R, CIRCLE_R * 0.92, 0.15, A0, A0 + 2 * Math.PI * 1.06 * kc); g.stroke();
    }
  });
  const finalW = (() => { const g = document.createElement('canvas').getContext('2d'); g.font = `${FONT}px ${FONT_FACE}`; return g.measureText('Final').width; })();

  // ---------- the Student ----------
  const gator = await makeGator(ctx, { seed: 2 });
  gator.group.position.set(...DESK.hip); scene.add(gator.group);
  // the lamp stands in front of him (LAMP_AT): his own shadow would loom up the wall when he stands, so he casts none
  gator.group.traverse((o) => { o.castShadow = false; });
  const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
  const camW = new THREE.Vector3(...CAM_W.pos);
  // Up behind the desk, at the calendar's left edge, chin up: in W he stands between the camera and the sheet, so his
// snout has to ride above Friday's row or it hides the X it draws.
const STAND = [-0.003, 0.010, DESK.hip[2]];
  const reach = (p, hip) => { const r = seatReach(camW, new THREE.Vector3(...p), [-10, 10], hip); return specPose({ lean: r.lean, arm: r.arm, far: -60, head: 12, leg: 0, farLeg: 8 }); };   // legs down, behind the desk
  const P = {
    look: seat({ lean: 0, arm: -40, head: 12 }),
    up: reach(xw(X1[0]), [-0.03, 0.0, DESK.hip[2]]),
    x1a: reach(xw(X1[0]), STAND), x1b: reach(xw(X1[1]), STAND),
    x2a: reach(xw(X2[0]), STAND), x2b: reach(xw(X2[1]), STAND),
    down: seat({ lean: 4, arm: -60, head: -4 }),
    gaze: seat({ lean: 0, arm: -60, head: 8 }),
    breath: seat({ lean: -1, arm: -62, head: 8 }),
    pick: (() => { const r = seatReach(camW, new THREE.Vector3(DESK.pen[0] + 0.003, 0.001, DESK.pen[1]), [0, 30]); return seat({ lean: r.lean, arm: r.arm, head: 0 }); })(),
    level: seat({ lean: 6, arm: -35, far: -32, head: 4 }),
    uncap: seat({ lean: 6, arm: -35, far: -24, head: 4 }),
  };
  // [t, pose, stand (0 seated at DESK.hip … 1 at STAND)], eased between keys and sampled on 2s.
  const KEYS = [[0, 'look', 0], [0.5, 'look', 0], [F(8), 'up', 0.5], [F(16), 'x1a', 1], [F(17), 'x1a', 1], [F(18), 'x1b', 1], [F(19), 'x1b', 1],
    [F(21), 'x2a', 1], [F(22), 'x2b', 1], [F(23), 'x2b', 1], [F(26), 'down', 0], [CUT_I, 'down', 0],
    [CUT_W, 'gaze', 0], [12.5, 'gaze', 0], [F(150), 'breath', 0], [F(152), 'pick', 0], [F(154), 'pick', 0], [F(156), 'level', 0],
    [F(161), 'level', 0], [F(162), 'uncap', 0], [17, 'uncap', 0]];
  const poseAt = (tc) => {
    const i = KEYS.findLastIndex(([k]) => k <= tc + 1e-6), [k0, a, h0] = KEYS[i], [k1, b, h1] = KEYS[Math.min(i + 1, KEYS.length - 1)];
    const e = ease(k1 > k0 ? clamp((tc - k0) / (k1 - k0)) : 0);
    return { pose: Object.fromEntries(Object.keys(P[a]).map((j) => [j, lerp(P[a][j], P[b][j] ?? P[a][j], e)])), stand: lerp(h0, h1, e) };
  };
  const eyesAt = (tc) => (tc < F(26) ? 'open' : tc < 12 ? 'side' : 'open');
  const mouthAt = (tc) => (tc >= 14.5 ? 'smile' : tc >= 12.5 ? 'neutral' : 'line');

  // ---------- the Exam, the dot, its trace, and the new drop ----------
  const exam = createBlob({ radius: BLOB_R.start, seed: 1 });
  scene.add(exam.mesh, exam.stain);
  // No cast shadows from the ink here: the lamp stands left of the blob and threw a 1.5× shadow off the desk's end
  // (the spec allows none over 1.1×), and on the sheet it doubled the dot. The stain and the trace ground them.
  exam.mesh.castShadow = false;
  const LAND = [FX, 0, 0.008];                                   // where it first landed in s02, at the calendar's foot
  exam.stain.position.set(LAND[0], 0.0003, LAND[2]); exam.stain.material.opacity = 0.3;
  const DOT = BLOB_R.examCrossedOff / BLOB_R.start;
  const onPage = (y, out, s) => { const k = (C.y0 + C.lip - (y - BLOB_R.start * s)) / C.lip;   // s02's: clear of the curl
    return out.set(FX, y, C.z + 0.0009 + (k > 0 ? C.lipZ * Math.min(1, k) ** 2 : 0)); };
  const LIP_DOT = C.y0 + 0.0006;                                  // the dot's centre, sitting on the curled lip
  const RED_LINE = FY - 0.0036;                                   // the painted circle's bottom line, under the X (measured on a still)
  // The soak's trace: the stain's blot stood upright on the sheet, blooming as the paper drinks the dot.
  const trace = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: PALETTE.ink, map: exam.stain.material.map,
    alphaMap: exam.stain.material.alphaMap, transparent: true, depthWrite: false, opacity: 0 }));
  trace.position.set(FX, RED_LINE, C.z + 0.0009); scene.add(trace);
  const drop = createBlob({ radius: 0.012, seed: 9 });           // a new birth-bead, not the old blob back
  drop.mesh.castShadow = false; scene.add(drop.mesh);
  const DROP_AT = [NX, NY - CIRCLE_R * 0.92 * mpp];              // on the new circle's bottom line, under the word

  // ---------- his hand in I2 (the near arm seen face-on), holding the red marker; its tip is the group's origin ----------
  const hand = new THREE.Group(); scene.add(hand);
  const arm = T.cut(gsheet, 'arm_r', [0.022, null], 'i2_arm', { anchor: [0.9, 0.5], parent: hand });
  arm.g.rotation.z = 35 * DEG; arm.g.position.set(-0.0022, -0.0028, 0.0006);
  T.rect('i2_marker', PALETTE.calendarRed, [0.0065, 0.0011], [-0.0026, -0.0022, 0.0003], { rot: [0, 0, 40 * DEG], parent: hand });

  // ---------- light: the lamp, on; night ambient; a warm character fill; the shade glowing ----------
  const lamp = lampLight({ angle: 0.95, penumbra: 0.9, intensity: LAMP_I });
  lamp.light.position.set(...LAMP_AT);
  lamp.light.target.position.set(...LAMP_AIM);
  lamp.light.shadow.camera.near = 0.002;
  const face = new THREE.PointLight(Cc('cream').lerp(Cc('lamp'), 0.3), FACE_I, 0.08, 2); face.position.set(-0.035, 0.035, 0.06);
  const amb = ambient(); amb.intensity *= AMB;
  scene.add(lamp.light, lamp.light.target, face, amb);
  {   // s06's: the painted shade's trapezoid, lit from inside
    const k = DESK.lamp.h / 212, s = new THREE.Shape([[-52, 0], [52, 0], [30, 75], [-30, 75]].map(([x, y]) => new THREE.Vector2(x * k * 0.92, y * k * 0.94)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: PALETTE.lamp, transparent: true, opacity: 0.55, toneMapped: false }));
    m.position.set(DESK.lamp.x, DESK.lampMouth[1] + 0.0005, DESK.lamp.z + 0.0008); scene.add(m);
  }

  // ---------- the fade: the amber grade scaled to black over 16.0–17.0, on 1s (frame 23 = 194.958 is black) ----------
  const amber = loadLUT('amber'), fades = [];
  const fadeLUT = (k) => fades[k] ??= (() => {
    const src = amber.image.data, data = new Uint8Array(src.length), e = 1 - k / 23;
    for (let i = 0; i < src.length; i += 4) { for (let j = 0; j < 3; j++) data[i + j] = Math.round(src[i + j] * e); data[i + 3] = 255; }
    const tex = new THREE.Data3DTexture(data, amber.image.width, amber.image.height, amber.image.depth);
    Object.assign(tex, { format: amber.format, type: amber.type, minFilter: amber.minFilter, magFilter: amber.magFilter,
      wrapS: amber.wrapS, wrapT: amber.wrapT, wrapR: amber.wrapR, unpackAlignment: 1, needsUpdate: true });
    return tex;
  })();

  const c = new THREE.Vector3(), hp = new THREE.Vector3(), look = new THREE.Vector3();
  return {
    update(t) {
      T.boil(t);
      const f = fr(t), tc = F(f);
      const inI = t >= CUT_I && t < CUT_I2, inI2 = t >= CUT_I2 && t < CUT_W, inW = !inI && !inI2;

      // camera (on 1s), straight cuts; the fade on the grade
      const cam = inI ? CAM_I : inI2 ? CAM_I2 : CAM_W;
      camera.position.set(...cam.pos); camera.lookAt(look.set(...cam.look));
      const k = t < FADE ? -1 : Math.min(23, Math.round((t - FADE) * 24));
      fx.set({ focus: inW ? 0.39 : camera.position.z - C.z, aperture: inW ? 0.01 : 0.003, lut: k < 0 ? 'amber' : fadeLUT(k), grain: k === 23 ? 0 : 0.04 });

      // the calendar's marks
      const [k1, k2] = xAt(tc);
      drawX(k1, k2);
      const kw = wordAt(tc), kc = circleAt(tc);
      drawFinal(kw, kc);

      // ---- the Student (seen in W) ----
      const { pose, stand } = poseAt(tc);
      gator.boil(t, 10);
      gator.blend({ now: pose }, [[0, 'now']], 0);
      gator.group.position.set(lerp(DESK.hip[0], STAND[0], stand), lerp(DESK.hip[1], STAND[1], stand) - (tc >= 12.5 && tc < F(152) ? 0.0005 : 0), DESK.hip[2]);
      gator.face({ eyes: eyesAt(tc), mouth: mouthAt(tc) });
      gator.follow('tail', t, { k: 6, w: 18 });
      gator.group.updateMatrixWorld(true);
      gator.hand.getWorldPosition(hp);
      gator.group.visible = inW;
      // the pen: in his hand (nib to the sheet) for the X, on the page's front edge, picked up at 12.67, level from 13.0
      const holding = tc < F(26) || tc >= F(152), level = tc >= F(156), uncapped = tc >= B.tagPenUncap - 1e-6;
      const a = level ? 0 : 40 * DEG;
      if (holding) { pen.g.rotation.set(0, 0, a); pen.g.position.set(hp.x + 0.003 * Math.cos(a), hp.y + 0.003 * Math.sin(a), DESK.hip[2] + 0.0128); }
      else { pen.g.rotation.set(-Math.PI / 2, 0, -0.1); pen.g.position.set(...penRest); }
      cap.g.rotation.copy(pen.g.rotation);
      cap.g.position.copy(pen.g.position);
      if (uncapped) cap.g.position.x += 0.005;   // s15's uncap drawing: the far hand jerks back with the cap
      if (holding) cap.g.position.z -= 0.0002;
      pen.g.visible = cap.g.visible = inW;

      // ---- the Exam ----
      let vis = true, s = 1, squash = 0, eyes = 'open', lookDir = 1;
      if (tc < B.examCrossedOff) { c.set(LAND[0], 0, LAND[2]); lookDir = -1; }
      else if (tc < CUT_I) { s = DOT; c.set(LAND[0], 0, LAND[2]); squash = 0.3 * Math.exp(-6 * (tc - 2)) * Math.cos(18 * (tc - 2)); }
      else if (tc < B.blobAbsorbed + F(1)) {
        s = DOT;
        if (tc < 3.5) {   // the hop up from below frame onto the lip, one arc
          const h = easeOut((tc - 3) / 0.5);
          onPage(lerp(LIP_DOT - 0.006, LIP_DOT, h) + 0.003 * Math.sin(Math.PI * h), c, s); eyes = 'closed'; squash = -0.2;
        } else if (tc < 4) { onPage(LIP_DOT, c, s); squash = tc < 3.667 ? 0.3 : 0; eyes = tc < 3.667 ? 'closed' : 'open'; }
        else if (tc < 5) { onPage(lerp(LIP_DOT, RED_LINE, ease(tc - 4)), c, s); squash = -0.2; }
        else { onPage(RED_LINE, c, s); eyes = tc < 5.333 ? 'side' : 'closed'; lookDir = -1; if (tc >= B.blobAbsorbed - 1e-6) squash = 0.8; }
        c.y -= BLOB_R.start * s;   // centre → contact point
      } else vis = false;
      exam.mesh.visible = vis;
      exam.mesh.position.copy(c); exam.mesh.scale.setScalar(s);
      exam.stain.visible = tc < CUT_I; exam.stain.scale.setScalar(tc < B.examCrossedOff ? 1 : DOT);
      exam.update(t, { squash, wobble: 0.6, eyes, look: lookDir, key: lamp.light });
      // the trace: blooms over 5.5–6.0 as the paper drinks it, and stays
      const tk = easeOut(clamp((t - B.blobAbsorbed) / 0.5));
      trace.visible = t >= B.blobAbsorbed;
      trace.material.opacity = lerp(STAIN[0], STAIN[1], easeOut(clamp((t - B.blobAbsorbed - 0.1) / 0.9)));
      trace.scale.set(lerp(0.0036, 0.0066, tk), lerp(0.0024, 0.0044, tk), 1);   // the dot's flattened width, spreading as the paper drinks it

      // ---- the new drop: beads 10.0–10.67, quivers on 1s from 11.0, still from the uncap's drawing ----
      drop.mesh.visible = tc >= 10;
      if (drop.mesh.visible) {
        const ds = Math.max(1e-3, BEAD * easeOut((tc - 10) / 0.667));
        drop.mesh.scale.setScalar(ds);
        drop.mesh.position.set(DROP_AT[0], DROP_AT[1] - 0.012 * ds, C.z + 0.0010);
        const quiver = tc >= B.dropQuivers && !uncapped;
        drop.update(quiver ? 2 * t : uncapped ? 2 * B.tagPenUncap : t, { wobble: quiver ? 1.6 : 0.4, eyes: 'closed', key: lamp.light });
      }

      // ---- his hand in I2: in 7.0–7.5 with the marker, writes "Final", circles it, leaves after 9.67 ----
      hand.visible = inI2 && tc >= 7 && tc < 9.833;
      if (hand.visible) {
        let px, py;
        if (tc < 7.5) { const h = ease((tc - 7) / 0.5); px = lerp(NX - 0.03, NX - finalW / 2 * mpp, h); py = lerp(NY - 0.02, NY, h); }
        else if (tc < 8.833) { px = NX + (kw - 0.5) * finalW * mpp; py = NY - 0.0003 + 0.0003 * Math.sin(kw * 30); }
        else if (tc < 9.667) { const an = A0 + 2 * Math.PI * 1.06 * kc; px = NX + Math.cos(an) * CIRCLE_R * mpp; py = NY - Math.sin(an) * CIRCLE_R * 0.92 * mpp; }
        else { const h = ease((tc - 9.667) / 0.167); px = lerp(NX, NX - 0.03, h); py = lerp(NY, NY - 0.02, h); }
        hand.position.set(px, py, C.z + 0.004);
      }
    },
  };
}
