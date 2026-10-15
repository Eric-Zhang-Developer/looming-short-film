// s18 · Next semester, the Freshman's light, the yawn (docs/shots/s18.md). Three setups in one shot ID (README §8):
//   E 0–2   the home calendar: Friday's sheet tears away, next semester's sheet with a new red circle holds.
//   G 2–11  Marston at night, the Freshman's desk unit (s15's, trough/blob/phone mirrored x' = 0.110 − x): he walks the
//           aisle past them (s14 turned around) and never stops; his movement wakes their zone at 4.0 (s15's wake keys).
//   H 11–20 his pocket: his own small blob peeks out and yawns at 14.0, sinks back; fade to black by 179.958.
// Each setup is a Group shown only in its own time, lights included, so nothing leaks across a cut. Coordinates are the
// spec's unit-local ones (G's −0.50 world x offset only matters between setups, and they never share a frame).
// Characters on 2s; light, camera and fade on 1s.
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, sensorLight, lampLight, fluorescent, ambient, aim } from '../lights.js';
import { loadLUT } from '../post.js';
import { kf, ease, easeIn, clamp, spring } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { createBlob } from '../blob.js';
import { makeGator, hipHeight } from '../characters/gator.js';
import { makeFreshman } from '../characters/freshman.js';
import { POSES, walk } from '../characters/poses.js';

// ---------- tunables (the final pass changes these, not the staging) ----------
const BLOB_R = 0.012;          // the Freshman's blob (next semester's exam); the blob-meter pass changes this line
const HERO_BLOB_R = 0.005;     // his blob, s17's end
const PHONE_I = 1.0, ZONE_I = 0.8, FLUOR_I = 1.0, AMB_K = 0.45, FILL_PHONE = 0.003, FILL_ZONE = 0.02;   // s15's
const PHONE_OUTSHONE = 0.02;   // README §4 says 0.2; s15 as built uses 0.02 so the loom doesn't survive the wake
const LAMP_I = 0.5;            // E: by eye (s06's irradiance, 1.2, blew the sheet out)
const SPILL_K = 0.25;          // H: zone_spill = 25% of their zone
const SPILL_BOOST = 20;        // ponytail: readability over the spec's 25% (at 0.248 m it barely lit the pocket); final pass re-tunes
const H_FLUOR = 1.5;           // H room light on the hoodie
// Flat-puppet cheats for H (gaps in front of the body, m): the rig's head (0.003) and near arm (0.012) cover the pocket, so in
// H the arm tucks behind and the pocket comes forward, with the blob between it and the head.
const ARM_Z = 0.012, POCKET_Z = 0.003, H_ARM_Z = 0.001, H_POCKET_Z = 0.0055, H_BLOB_GAP = 0.001;
const FALL_Y = 0.22;           // E: the torn sheet's drop. Spec says 0.08, which leaves it in frame; 0.22 clears it by 1.0

// ---------- times (shot-local seconds) ----------
const ID = 's18', D = Math.PI / 180;
const CUT_G = 2, CUT_H = 11, WAKE = 4, YAWN = 14, FADE = 19;
const dr = (n) => n / 12;
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;   // s15's float-safe onTwos
const FLOOR = -0.034;

// ---------- E: the calendar (s02's prop and placement) ----------
const CAL = [0.150, 0.100, 0.006], CAL_W = 0.10, CAL_H = 0.12;
const LAMP_AT = [0.004, 0.056, 0.078];   // shade mouth (unit), out of frame

// The proxy calendar face: s02's calendarArt with the circle's cell and the glyph seed as arguments. With s02's seed and
// cell [2, 5] it draws s02's Friday sheet. Real `calendar` art (sheet1 / sheet2) replaces it.
function calendarArt(PALETTE, seedKey, [row, col]) {
  const W = 1000, H = 1200, m = 40, rng = mulberry32(seedKey);
  const cv = Object.assign(document.createElement('canvas'), { width: W + 2 * m, height: H + 2 * m }), g = cv.getContext('2d');
  const grey = '#' + new THREE.Color(PALETTE.navy).lerp(new THREE.Color(PALETTE.cream), 0.45).getHexString();
  g.translate(m, m);
  g.fillStyle = PALETTE.cream; g.fillRect(0, 0, W, H);
  g.fillStyle = PALETTE.navy; g.fillRect(0, 0, W, 0.045 * H);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const scribble = (x, y, w, h, lw) => {
    g.strokeStyle = PALETTE.navy; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y);
    const n = 4 * (3 + Math.floor(rng() * 4));
    for (let i = 1; i <= n; i++) g.lineTo(x + (w * i) / n, y + h * Math.sin(i * 1.7 + rng()) * (0.5 + 0.5 * rng()));
    g.stroke();
  };
  scribble(0.25 * W, 0.11 * H, 0.5 * W, 0.025 * H, 9);
  const X0 = 0.06 * W, CW = 0.116 * W, Y0 = 0.282 * H, RH = 0.104 * H;
  for (let c = 0; c < 7; c++) scribble(X0 + c * CW + 0.25 * CW, 0.235 * H, 0.5 * CW, 0.008 * H, 5);
  g.strokeStyle = grey; g.lineWidth = 3;
  for (let c = 0; c <= 7; c++) { g.beginPath(); g.moveTo(X0 + c * CW + (rng() - 0.5) * 4, Y0); g.lineTo(X0 + c * CW + (rng() - 0.5) * 4, Y0 + 6 * RH); g.stroke(); }
  for (let r = 0; r <= 6; r++) { g.beginPath(); g.moveTo(X0, Y0 + r * RH + (rng() - 0.5) * 4); g.lineTo(X0 + 7 * CW, Y0 + r * RH + (rng() - 0.5) * 4); g.stroke(); }
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) if (rng() < 0.92) scribble(X0 + c * CW + 0.12 * CW, Y0 + r * RH + 0.22 * RH, 0.3 * CW, 0.05 * RH, 4);
  const cx = X0 + (col + 0.5) * CW, cy = Y0 + (row + 0.5) * RH, R = 0.06 * W, gw = 0.036 * W, gh = 0.046 * W;
  g.fillStyle = '#fff'; g.strokeStyle = PALETTE.navy; g.lineWidth = 3;
  g.fillRect(cx - gw / 2, cy - gh / 2, gw, gh); g.strokeRect(cx - gw / 2, cy - gh / 2, gw, gh);
  g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 0.010 * W, cy); g.lineTo(cx - 0.002 * W, cy + 0.010 * W); g.lineTo(cx + 0.013 * W, cy - 0.012 * W); g.stroke();
  g.strokeStyle = PALETTE.calendarRed; g.lineWidth = 10;
  for (const [dx, dy, a0] of [[0, 0, -0.4], [5, -4, 0.3]]) { g.beginPath(); g.ellipse(cx + dx, cy + dy, R, R * 0.93, 0.2, a0, a0 + 2 * Math.PI * 1.04); g.stroke(); }
  return { cv, size: [CAL_W * (W + 2 * m) / W, CAL_H * (H + 2 * m) / H] };
}

// The wipe (drawings on 2s). peel: how far the tear front has run from the top-right corner (0) to the bottom-left (1);
// lift: how far the freed part folds toward camera (deg). Anticipation on drawing 1 (0.083) curls the corner 15°.
const PEEL = [[0, 0], [dr(1) - 1e-3, 0], [dr(1), 0.18], [0.25, 0.18], [0.75, 1]];
const LIFT = [[0, 0], [dr(1) - 1e-3, 0], [dr(1), 15], [0.25, 15], [0.75, 120]];   // past 90° the flap turns over and the wipe reads

// ---------- G: the Freshman's desk unit ----------
const G = {
  cam: { pos: [0.060, 0.162, 0.573], look: [0.060, 0.030, 0.080] }, focus: [0.060, 0.020, 0.086],
  blob: [0.110, BLOB_R, 0.098], phone: [0.120, 0.0015, 0.114], phoneLight: [0.120, 0.004, 0.114],
  tube: [0.110, 0.127, 0.040], hip: [-0.075, -0.012], bodyZ: 0.074, fill: [-0.046, 0.040, 0.114],
  aisleZ: 0.228,
};
const heroX = (tc) => -0.090 + 0.072 * (tc - CUT_G);   // never stops: 0.006 per drawing
const F_BODY = [[0, 'freeze'], [dr(48), 'freeze'], [dr(49), 'glance_up'], [dr(89), 'glance_up'], [dr(90), 'freeze']];
const fEyes = (tc) => tc < WAKE ? 'worried' : tc < dr(49) ? 'gasp' : tc < 4.5 ? 'worried' : tc < 5.5 ? 'open' : tc < 7.5 ? 'side' : 'open';
const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));   // s15's: peaks on the beat

// ---------- H: the pocket ----------
const H = { hipX: 0.330, bodyZ: 0.086, camOff: [0, 0.022, 0.110], lookOff: [0, 0.004, 0] };
const BLOB_TOP = 1.88 * HERO_BLOB_R;   // the drop's height at rest (body ball centre 0.88 r + 1 r)
const TUCK = 0.75;                     // its height while tucked: the 9.4 mm drop doesn't fit the 8 mm pocket
// His blob's lift (m) from tucked (top 0.5 mm under the rim): the dip, the peek, the sink.
const RISE = [[0, 0], [12.833, 0], [12.917, -0.001], [13.0, -0.001], [13.333, 0.006], [16.0, 0.006], [16.667, -0.001]];
const STRETCH = [[0, 1], [YAWN, 1], [14.333, 1.3], [14.833, 1.3], [15.0, 1]];
const hEyes = (tc) => tc < 13.5 ? 'closed' : tc < YAWN ? 'tired' : tc < 15 ? 'closed' : tc < 15.5 ? 'tired' : 'closed';

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  const V = (a) => new THREE.Vector3(...a);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const torn = (w, h) => {   // s02's: inset the rect so it has an edge to tear
    const m = 0.04 * Math.max(w, h), W = w + 2 * m, Hh = h + 2 * m;
    return { path: [[m / W, m / Hh], [1 - m / W, m / Hh], [1 - m / W, 1 - m / Hh], [m / W, 1 - m / Hh]], size: [W, Hh] };
  };

  const [furn, props, calA] = await Promise.all(['marston_furniture_sheet', 'study_props_sheet', 'calendar'].map((n) => assets.load(n)));
  const boiling = [];
  const sheet = (opts, parent) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  const cut = (a, name, { weight, res = 512, parent, key = name } = {}) => {   // s15's: origin at the visible centre
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: a.pieces[name], size: [w, h], key: `${ID}-${key}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };
  const setE = new THREE.Group(), setG = new THREE.Group(), setH = new THREE.Group();
  scene.add(setE, setG, setH);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ================= E · calendar =================
  sheet({ ...torn(0.85, 0.434), color: PALETTE.cream, res: 1024, key: `${ID}-apt_wall` }, setE).position.set(0.025, 0.183, 0);
  const cal = new THREE.Group(); cal.position.set(...CAL); setE.add(cal);
  { const r = mulberry32(seedOf('s02', 'calendar')); cal.rotation.set((2 * r() - 1) * 1.5 * D, (2 * r() - 1) * 1.5 * D, 0); }   // s02's tilt
  const art = (n, seedKey, cell) => (calA.proxy ? calendarArt(PALETTE, seedKey, cell) : { cv: calA.pieces[n], size: calA.sizes[n] });
  const oldArt = art('sheet1', seedOf('s02', 'calendar-glyphs'), [2, 5]), newArt = art('sheet2', seedOf(ID, 'calendar-glyphs'), [1, 3]);   // spec row 2, column 4, read 1-based
  sheet({ art: newArt.cv, size: newArt.size, res: 1024, key: `${ID}-calendar-new` }, cal);
  // The old sheet hangs from a pivot at its bottom-left corner (the last of it to tear), 2 mm in front of the new one.
  const [OW, OH] = oldArt.size;
  const oldPivot = new THREE.Group(); oldPivot.position.set(-OW / 2, -OH / 2, 0.002); cal.add(oldPivot);
  const oldSheet = sheet({ art: oldArt.cv, size: oldArt.size, res: 1024, key: `${ID}-calendar-old` }, oldPivot);
  oldSheet.position.set(OW / 2, OH / 2, 0);
  oldSheet.geometry.dispose(); oldSheet.geometry = new THREE.PlaneGeometry(OW, OH, 24, 24);
  const oldPos = oldSheet.geometry.attributes.position, flatXY = Float32Array.from(oldPos.array);
  let bentAt = null;
  const bend = (peel, lift) => {   // the freed part (past the tear front) folds toward camera about the front line
    const key = `${peel}|${lift}`; if (key === bentAt) return; bentAt = key;
    const s = Math.sin(lift * D), c = Math.cos(lift * D), diag = (OW + OH) / 2;
    for (let i = 0; i < oldPos.count; i++) {
      const x = flatXY[3 * i], y = flatXY[3 * i + 1];
      const d = ((OW / 2 - x) / OW + (OH / 2 - y) / OH) / 2;           // 0 at the top-right corner, 1 at the bottom-left
      const over = Math.max(0, peel - d) * diag;                         // metres past the tear front
      const k = (1 - c) * over / Math.SQRT2;                             // pulled back along the diagonal as it folds
      oldPos.setXYZ(i, x - k, y - k, s * over);
    }
    oldPos.needsUpdate = true; oldSheet.geometry.computeVertexNormals();
  };
  const lamp = lampLight({ angle: 0.35, penumbra: 0.5, intensity: LAMP_I });   // light only: shade, cone and dust are out of frame
  lamp.light.position.set(...LAMP_AT); setE.add(lamp.light, lamp.light.target); aim(lamp.light, V(CAL));

  // ================= G · the Freshman's desk =================
  const WALL = [1.3, 0.394], PX = 2048 / WALL[0], WINDOWS = [-0.51, -0.31, -0.11, 0.09, 0.29, 0.49];
  const wallArt = Object.assign(document.createElement('canvas'), { width: 2048, height: Math.round(WALL[1] * PX) });
  { const g = wallArt.getContext('2d'); g.fillStyle = PALETTE.navy; g.fillRect(0, 0, wallArt.width, wallArt.height);
    for (const cx of WINDOWS) g.clearRect((cx - 0.05 + 0.65) * PX, (0.36 - 0.300) * PX, 0.10 * PX, (0.300 - 0.066) * PX); }
  sheet({ art: wallArt, size: WALL, key: `${ID}-marston_window_wall`, res: 2048 }, setG).position.set(0, (0.36 - 0.034) / 2, 0);
  const paneCol = '#' + C('navy').lerp(C('ink'), 0.35).getHexString();
  for (const cx of WINDOWS.filter((x) => Math.abs(x) < 0.4)) {
    const m = sheet({ path: RECT, color: paneCol, weight: 'tissue', size: [0.11, 0.245], key: `${ID}-pane${cx}`, res: 256 }, setG);
    m.position.set(cx, 0.183, -0.001); m.castShadow = false;
  }
  flat(sheet({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [0.8, 0.45], key: `${ID}-marston_floor`, res: 512 }, setG)).position.set(0, FLOOR, 0.225);
  flat(cut(furn, 'desk_top', { weight: 'kraft', res: 1024, parent: setG })).position.set(0.0585, 0, 0.075);
  cut(furn, 'desk_apron', { weight: 'kraft', res: 1024, parent: setG }).position.set(0.0585, -0.017, 0.120);
  cut(furn, 'chair', { weight: 'kraft', parent: setG }).position.set(-0.076, FLOOR + 0.025, 0.071);
  flat(cut(props, 'exam_page', { res: 1024, parent: setG })).position.set(-0.0205, 0.0003, 0.095);   // blank: no ink layer
  const pen = new THREE.Group(); setG.add(pen);                                                        // uncapped, on the page's front edge
  cut(props, 'pen', { parent: pen }).position.x = -0.006;
  pen.position.set(-0.016, 0.0006, 0.106); pen.rotation.set(-Math.PI / 2, 0, 0);
  const phone = new THREE.Group(); phone.position.set(...G.phone); setG.add(phone);
  flat(cut(props, 'phone_face', { parent: phone })).position.y = 0.0004;
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;   // glyph bars, no text
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0064), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);

  const fresh = await makeFreshman({ assets }, { res: 512 });
  fresh.group.position.set(G.hip[0], G.hip[1], G.bodyZ); setG.add(fresh.group);
  const fBlob = createBlob({ radius: BLOB_R, seed: 18 });
  fBlob.mesh.position.set(G.blob[0], 0, G.blob[2]); fBlob.stain.position.set(G.blob[0], 0.0004, G.blob[2]);
  setG.add(fBlob.mesh, fBlob.stain);

  const phoneSpot = phoneLight({ angle: 0.9, penumbra: 0.4, intensity: PHONE_I });
  phoneSpot.position.set(...G.phoneLight); setG.add(phoneSpot, phoneSpot.target); aim(phoneSpot, V(G.blob));   // along phone → blob: 7.1×
  const zone = sensorLight({ at: G.tube, aimAt: [G.blob[0], 0, G.blob[2]], intensity: ZONE_I });   // dead until the walk-past wakes it
  setG.add(zone.group, zone.light, zone.light.target);
  const FILL = { phone: C('phone').lerp(C('navy'), 0.35), zone: C('cream').lerp(C('gator'), 0.15) };
  const fill = new THREE.PointLight(FILL.phone, FILL_PHONE, 0.07, 2);   // README §10, the Freshman's face
  fill.castShadow = false; fill.position.set(...G.fill); setG.add(fill);
  const tubesG = fluorescent({ intensity: FLUOR_I }); setG.add(tubesG.light);

  // ================= H · the pocket =================
  const spill = new THREE.SpotLight(FILL.zone, ZONE_I * SPILL_K * SPILL_BOOST, 0, 0.3, 0.5, 2);   // zone_spill, from frame left
  spill.castShadow = true; spill.shadow.mapSize.set(1024, 1024); spill.shadow.bias = -0.0003;
  spill.position.set(...G.tube); setH.add(spill, spill.target);
  const tubesH = fluorescent({ intensity: FLUOR_I * H_FLUOR }); setH.add(tubesH.light);
  const heroBlob = createBlob({ radius: HERO_BLOB_R, seed: 1 });   // the Exam's seed: the same blob, small now
  setH.add(heroBlob.mesh);

  // ================= the hero (G and H) =================
  const hero = await makeGator({ assets }, { res: 1024 });
  scene.add(hero.group); hero.head34(false);

  // ---------- post and fade ----------
  const look = new THREE.Vector3(), dir = new THREE.Vector3(), tmp = new THREE.Vector3(), pc = new THREE.Vector3();
  const fx = post({ focus: 0.486, aperture: 0.02, maxblur: 0.01, lut: 'amber' });
  // Fade 19.0–20.0 on 1s: the amber grade scaled by 1 − k/23 on frame k, so frame 23 (179.958) is 0. Grain off there.
  const amber = loadLUT('amber'), fades = [];
  const fadeLUT = (k) => fades[k] ??= (() => {
    const src = amber.image.data, data = new Uint8Array(src.length), e = 1 - k / 23;
    for (let i = 0; i < src.length; i += 4) { for (let j = 0; j < 3; j++) data[i + j] = Math.round(src[i + j] * e); data[i + 3] = 255; }
    const tex = new THREE.Data3DTexture(data, amber.image.width, amber.image.height, amber.image.depth);
    Object.assign(tex, { format: amber.format, type: amber.type, minFilter: amber.minFilter, magFilter: amber.magFilter,
      wrapS: amber.wrapS, wrapT: amber.wrapT, wrapR: amber.wrapR, unpackAlignment: 1, needsUpdate: true });
    return tex;
  })();

  let lastSeed = null;
  function update(t) {
    const tc = on2s(t), seed = boilSeed(t, 10);
    if (seed !== lastSeed) { lastSeed = seed; for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed })); }
    const inE = t < CUT_G, inG = !inE && t < CUT_H;
    setE.visible = inE; setG.visible = inG; setH.visible = !inE && !inG; hero.group.visible = !inE;
    hero.boil(t, 10);

    if (inE) {
      // ---- E: the torn-paper wipe
      camera.position.set(CAL[0], CAL[1], CAL[2] + 0.486); camera.lookAt(look.set(...CAL));
      fx.set({ focus: 0.486, lut: 'amber', grain: 0.04 });
      bend(kf(tc, PEEL, (x) => x), kf(tc, LIFT, (x) => x));
      const f = clamp((tc - 0.5) / 0.5);
      oldPivot.rotation.z = -25 * D * ease(f);
      oldPivot.position.y = -OH / 2 - FALL_Y * easeIn(f);
      oldPivot.position.z = 0.002 + 0.02 * f;
      oldPivot.visible = tc < 1;
      return;
    }

    if (inG) {
      // ---- G: the walk-past and the Freshman's light
      camera.position.set(...G.cam.pos); camera.lookAt(look.set(...G.cam.look)); camera.getWorldDirection(dir);
      const level = zone.update(t, { wake: WAKE }), lit = level >= 0.5;   // on 1s; s15's wake keys
      fx.set({ focus: dir.dot(tmp.set(...G.focus).sub(camera.position)), lut: lit ? 'amber' : 'marston', grain: 0.04 });
      phoneSpot.intensity = PHONE_I * (lit ? PHONE_OUTSHONE : 1);       // README §4: the loom flashes back on the stutter's dark frames
      screen.material.color.setScalar(lit ? 0.6 : 1);
      fill.color.copy(lit ? FILL.zone : FILL.phone); fill.intensity = lit ? FILL_ZONE : FILL_PHONE;

      // hero: walks +x on the aisle plane, 4 drawings per step, never stops; one side glance 4.083–4.750
      const w = walk(t, { set: 'side', t0: CUT_G });
      hero.group.scale.x = 1; hero.joints.pocket.scale.y = 1; hero.joints.arm_r.position.z = ARM_Z; hero.joints.pocket.position.z = POCKET_Z;
      hero.blend(POSES, w.keys, tc + 1e-6);
      hero.face({ eyes: tc >= dr(49) - 1e-6 && tc < dr(57) - 1e-6 ? 'side' : 'open', mouth: 'neutral' });
      hero.group.position.set(heroX(tc), FLOOR + w.hip, G.aisleZ);

      // Freshman: frozen, the gasp on the wake drawing, looks up and after him, back down to the blob, the small smile
      fresh.boil(t, 10);
      fresh.blend(POSES, F_BODY, tc + 1e-6);
      fresh.face({ eyes: fEyes(tc + 1e-6), mouth: tc >= 9.5 - 1e-6 ? 'smile' : 'line' });
      fBlob.update(t, { key: lit ? zone.light : phoneSpot, wobble: tc < WAKE ? 1.4 : 1, squash: kick(tc, WAKE, 0.3),
        eyes: tc < WAKE ? 'worried' : 'open', look: -1 });
      fBlob.mesh.rotation.z = (tc >= 7.5 - 1e-6 ? 10 : 0) * D;   // tilts up toward the Freshman (s15's look)
      return;
    }

    // ---- H: the pocket
    hero.group.scale.x = -1;   // stopped a few steps on, facing −x, back toward their light
    hero.joints.arm_r.position.z = H_ARM_Z; hero.joints.pocket.position.z = H_POCKET_Z;
    hero.blend(POSES, [[0, 'stand'], [1, 'stand']], 0);
    hero.face({ eyes: 'open', mouth: 'neutral' });
    const breath = 0.0005 * 0.5 * (1 - Math.cos(2 * Math.PI * (tc - CUT_H) / 1.5));
    hero.group.position.set(H.hipX, FLOOR + hipHeight(POSES.stand) + breath, H.bodyZ);
    const on = (a, b) => tc >= a - 1e-6 && tc < b - 1e-6;
    hero.joints.pocket.scale.y = on(12.167, 12.333) ? 1.08 : on(17, 17.167) ? 1.05 : 1;
    hero.group.updateMatrixWorld(true);
    hero.joints.pocket.getWorldPosition(pc);   // pivot: the pocket's rim, centre
    const rimY = pc.y, center = tmp.set(pc.x, pc.y - 0.004, pc.z);
    camera.position.set(center.x + H.camOff[0], center.y + H.camOff[1], center.z + H.camOff[2]);
    camera.lookAt(look.set(center.x + H.lookOff[0], center.y + H.lookOff[1], center.z + H.lookOff[2]));
    aim(spill, center);

    const sy = kf(tc, STRETCH) - (tc >= 15 ? 0.1 * spring(tc, 15) : 0), sx = 1 - 0.15 * (sy - 1) / 0.3;   // y 1.3 ↔ x 0.85
    heroBlob.update(t, { key: spill, wobble: 0.4, eyes: hEyes(tc + 1e-6), look: -1 });
    const lift = kf(tc, RISE), tuck = TUCK + (1 - TUCK) * clamp(lift / 0.006);   // curled small while tucked, so it fits the pocket
    heroBlob.mesh.scale.set(sx, sy * tuck, 1);
    heroBlob.mesh.position.set(pc.x, rimY - BLOB_TOP * tuck - 0.0003 + lift, pc.z - H_BLOB_GAP);
    heroBlob.stain.visible = false;

    const k = t < FADE ? -1 : Math.min(23, Math.round((t - FADE) * 24));   // frames are n/24: 179.958 is frame 23   // fade, on 1s
    fx.set({ focus: H.camOff[2], lut: k < 0 ? 'amber' : fadeLUT(k), grain: k === 23 ? 0 : 0.04 });
  }

  return { update };
}
