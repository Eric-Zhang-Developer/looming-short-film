// s06 · The lamp beat at home (docs/shots/s06.md). The rule stated the first time; s15 pays it off and is the master:
// Camera A, the desk unit, the lamp, knob, blob mark, phone and both lights are s15's UNIT (done/anim-s15.md, including
// its (dev) numbers). s06 differs in its paper (home wall, desk, calendar), no laptop or window, and everything after K7.
// Characters (gator, blob) step on 2s; light at 24. Phone key → lamp on lampClickHome (0.5) → phone on lampOffHome (3.0).
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { phoneLight, lampLight, ambient, aim, shadowScale } from '../lights.js';
import { kf, clamp, spring } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { makeGator } from '../characters/gator.js';
import { makeExam } from '../characters/exam.js';
import { POSES, specPose, pressKeys } from '../characters/poses.js';
import { UNIT as S15 } from './s15.js';
// s15 went to motion-sensor lights (44cc607) and dropped its desk-lamp geometry; the home lamp keeps it, values as of 8b1d916.
const UNIT = { ...S15, lampZ: 0.078, knob: [-0.0228, 0.0228], knobZ: 0.0855, knobPressed: [-0.0223, 0.0211],
  shadeMouth: [0.004, 0.056], lampAim: [-0.008, 0, 0.096] };

const ID = 's06', D = Math.PI / 180;
const dr = (n) => n / 12;                                    // drawing n (12 fps) → local seconds
const on2s = (t) => Math.floor(t * 12 + 1e-4) / 12;          // core onTwos floors e.g. 36.0833 − 36 to the previous drawing (anim-s15 Gaps)
const ON = UNIT.press, OFF = 3.0;                            // lampClickHome, lampOffHome (local)
const R = 0.012;                                             // the Exam's radius (README §1)
const MARK = [UNIT.blob[0], 0, UNIT.blob[2]];                // blob contact point (s15 dev z 0.0884)
const HOP = [MARK[0] - 0.003, 0, MARK[2]];                   // 2.0 hop: 3 mm toward him, landing 2.167

// s15's lamp numbers, so the two lamp beats match. The phone is s15's 1.0 scaled down: on the cream home wall (navy in s15)
// 0.35 burned the lit wall to white.
const PHONE_I = 0.12, LAMP_I = 0.16, BULB_I = 0.03, AMB_K = 0.45;
// README §4 says 0.2, s15 (dev) 0.05 on its navy wall. The cream home wall reflects far more of what's left: at 0.05 the
// shadow kept 33% of its depth (measure.txt). 0.025 brings it under 20%.
const PHONE_OUTSHONE = 0.025;
const FILL_PHONE = 0.032, FILL_LAMP = 0.024;   // README §10, set against measure.txt's face / key-lit receiver (s15: 0.003, 0.02)
const LAMP_KEYS = [[12 / 24, 0], [13 / 24, 1.15], [15 / 24, 0.95], [17 / 24, 1.0]];

// ---------- the Student: K0–K7 from poses.js, then s06's own ----------
const seat = (o) => specPose({ leg: 60, farLeg: 54, ...o });
const P = {
  ...POSES,
  stare: seat({ lean: -6, arm: -70 }),          // after the flinch: hand back at K0, body recoiled
  grip_flick: seat({ lean: 30, arm: -10 }),     // thumb flick: grip's arm +2°
};
const FLICKS = Array.from({ length: 8 }, (_, i) => 48 + 6 * i);   // drawings at 4.0, 4.5 … 7.5
const BODY = [
  ...pressKeys(0),                                          // K0–K7, press on drawing 6 (0.500)
  [dr(12), 'touch'],                                        // hand held on the knob to 1.000
  [dr(13), 'recoil'],                                       // 1.083 the flinch: K0 hand, lean −6, arms +15°, tail +12°
  [dr(14), 'stare'], [dr(25), 'stare'], [dr(26), 'lean_away'], [dr(31), 'lean_away'],   // 2.167 leans back to −9
  ...pressKeys(2.5).slice(2),                               // K2–K7 at 2.667…3.083, press (lampOffHome) on 3.000
  [dr(38), 'rest'], [dr(40), 'grab'], [dr(42), 'grip'],     // 3.167 K0, 3.333 reach, 3.500 grip on the phone
  ...FLICKS.flatMap((n) => [[dr(n - 1), 'grip'], [dr(n), 'grip_flick'], [dr(n + 1), 'grip']]),
];
const HEAD = [[0, 0], [dr(1), 0], [dr(2), -3], [dr(3), 0], [dr(7), 0], [dr(8), -10], [dr(12), -10], [dr(13), 4],
  [dr(15), -4], [dr(31), -4], [dr(32), -3], [dr(33), 0], [dr(37), 0], [dr(40), -6], [dr(42), -10]];
const eyesAt = (t) => t < dr(6) ? 'tired' : t < dr(8) ? 'closed' : t < dr(10) ? 'open' : t < dr(13) ? 'side'
  : t < dr(21) ? 'gasp' : t < dr(42) ? 'worried' : 'tired';
const mouthAt = (t) => (t >= dr(13) && t < dr(21) ? 'o' : 'line');

// s15's blob kick: spring()'s damping in cosine phase, so it peaks on the beat frame.
const kick = (t, t0, a) => (t < t0 ? 0 : a * Math.exp(-6 * (t - t0)) * Math.cos(18 * (t - t0)));
const same = (a, b) => Math.abs(a - b) < 1e-6;

const visibleSize = (a, name) => { const [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name]; return [w * (u1 - u0), h * (v1 - v0)]; };
// A path rectangle that fills its canvas has no edge to tear: inset 4%, size grown to keep [w, h] (as s03).
const torn = (w, h) => { const m = 0.04 * Math.max(w, h), W = w + 2 * m, H = h + 2 * m, u = m / W, v = m / H;
  return { path: [[u, v], [1 - u, v], [1 - u, 1 - v], [u, 1 - v]], size: [W, H] }; };

export async function build({ scene, camera, assets, PALETTE, post }) {
  const C = (k) => new THREE.Color(PALETTE[k]);
  scene.background = C('navy').lerp(C('ink'), 0.5);
  const V = (a) => new THREE.Vector3(...a);

  const [furn, lampA, props, cal] = await Promise.all(['marston_furniture_sheet', 'desk_lamp', 'study_props_sheet', 'calendar'].map((n) => assets.load(n)));
  const boiling = [];
  const sheet = (opts, parent = scene) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  const cut = (a, name, { weight, res = 512, parent = scene, art } = {}) => {   // holder origin = centre of the visible shape
    const holder = new THREE.Group(), [w, h] = a.sizes[name], [u0, v0, u1, v1] = a.visible[name];
    const mesh = sheet({ art: art ?? a.pieces[name], size: [w, h], key: `${ID}-${name}`, weight, res }, holder);
    mesh.position.set((0.5 - (u0 + u1) / 2) * w, ((v0 + v1) / 2 - 0.5) * h, 0);
    parent.add(holder); return holder;
  };
  const flat = (g) => { g.rotation.x = -Math.PI / 2; return g; };

  // ---------- set: the home desk unit (README §2), as s02/s03 ----------
  const wall = sheet({ ...torn(0.85, 0.434), color: PALETTE.cream, key: `${ID}-apt_wall`, res: 2048 });
  wall.position.set(0.025, 0.183, 0); wall.castShadow = false;
  flat(sheet({ ...torn(0.6, 0.3), color: PALETTE.kraft, weight: 'kraft', key: `${ID}-floor` })).position.set(0, -0.034, 0.15);
  const top = flat(sheet({ ...torn(0.333, 0.120), color: PALETTE.kraft, weight: 'kraft', key: `${ID}-apt_desk_top`, res: 1024 }));
  top.position.set(0.1335, 0, 0.060); top.castShadow = false;
  sheet({ ...torn(0.333, 0.034), color: PALETTE.kraft, weight: 'kraft', key: `${ID}-apt_desk_apron`, res: 1024 }).position.set(0.1335, -0.017, 0.120);
  cut(furn, 'chair', { weight: 'kraft' }).position.set(-0.076, -0.034 + 0.025, 0.071);

  // calendar sheet 1, centre (0.150, 0.100), z 0.006, s02's seeded tilt. Proxy: s03's faint glyph-free grid + Friday's circle.
  let calArt = cal.pieces.sheet1;
  if (cal.proxy) {
    const src = calArt, cv = Object.assign(document.createElement('canvas'), { width: src.width, height: src.height }), g = cv.getContext('2d');
    g.drawImage(src, 0, 0);
    const [u0, v0, u1, v1] = cal.visible.sheet1, X = (u) => (u0 + u * (u1 - u0)) * cv.width, Y = (v) => (v0 + v * (v1 - v0)) * cv.height;
    g.strokeStyle = PALETTE.navy; g.globalAlpha = 0.25; g.lineWidth = cv.width * 0.004;
    for (let i = 1; i < 7; i++) { g.beginPath(); g.moveTo(X(i / 7), Y(0.22)); g.lineTo(X(i / 7), Y(0.95)); g.stroke(); }
    for (let j = 0; j < 6; j++) { const v = 0.22 + j * 0.146; g.beginPath(); g.moveTo(X(0.03), Y(v)); g.lineTo(X(0.97), Y(v)); g.stroke(); }
    g.globalAlpha = 1; g.strokeStyle = PALETTE.calendarRed; g.lineWidth = cv.width * 0.012;
    g.beginPath(); g.arc(X(0.7), Y(0.5417), 0.06 * (u1 - u0) * cv.width, 0, 2 * Math.PI); g.stroke();
    calArt = cv;
  }
  const calendar = cut(cal, 'sheet1', { art: calArt, res: 1024 });
  calendar.position.set(0.150, 0.100, 0.006);
  { const r = mulberry32(seedOf('s02', 'calendar')); calendar.rotation.set((2 * r() - 1) * 1.5 * D, (2 * r() - 1) * 1.5 * D, 0); }

  // desk_lamp, exactly s15's (the knob stands off to z 0.0855 so the fingertip meets it from Camera A).
  const LZ = UNIT.lampZ;
  cut(lampA, 'base').position.set(-0.020, 0.002, LZ);
  cut(lampA, 'stem').position.set(-0.020, 0.035, LZ);
  const knob = cut(lampA, 'knob');
  const arm = cut(lampA, 'arm'); arm.position.set(-0.008, 0.069, LZ); arm.rotation.z = Math.atan2(-0.002, 0.024);
  const shade = cut(lampA, 'shade', { weight: 'tissue' });
  const [sw, sh] = visibleSize(lampA, 'shade'), sk = 0.016 / sh;
  shade.rotation.z = Math.PI / 2; shade.scale.setScalar(sk);
  shade.position.set(UNIT.shadeMouth[0], UNIT.shadeMouth[1] + sw * sk / 2, LZ + 0.0005);
  shade.traverse((o) => { o.castShadow = false; });

  // ---------- props: blank exam_page with glyph lines, pen + cap on it, phone face-up glowing ----------
  flat(cut(props, 'exam_page', { res: 1024 })).position.set(-0.0205, 0.0003, 0.095);
  if (props.proxy) {   // problem-line glyphs (a circle and a wavy rule each), as s15; no name: he hasn't started
    const INK = Object.assign(document.createElement('canvas'), { width: 500, height: 600 }), g = INK.getContext('2d');
    const rng = mulberry32(seedOf(ID, 'ink')), vOf = (z) => (z - 0.080) / 0.030 * 600;
    g.lineCap = g.lineJoin = 'round'; g.strokeStyle = '#' + C('navy').lerp(C('cream'), 0.25).getHexString(); g.lineWidth = 4;
    for (const z of [0.093, 0.100, 0.107]) {
      g.beginPath(); g.arc(60, vOf(z), 9, 0.3, 5.9); g.stroke(); g.beginPath();
      for (let u = 0.3; u <= 0.88; u += 0.02) g.lineTo(u * 500, vOf(z) + (rng() - 0.5) * 6);
      g.stroke();
    }
    const tex = new THREE.CanvasTexture(INK); tex.colorSpace = THREE.SRGBColorSpace;
    const ink = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.030),
      new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    flat(ink).position.set(-0.0205, 0.00035, 0.095); ink.receiveShadow = true; scene.add(ink);
  }
  const pen = new THREE.Group(); scene.add(pen);   // lying on the page's front edge, tip at x −0.016 (s15)
  cut(props, 'pen', { parent: pen }).position.x = -0.006;
  flat(pen).position.set(-0.016, 0.0006, 0.106);
  const cap = new THREE.Group(); scene.add(cap); cut(props, 'pen_cap', { parent: cap });
  flat(cap).position.set(-0.018, 0.0008, 0.1062);

  const phone = new THREE.Group(); phone.position.set(...UNIT.phone); scene.add(phone);
  flat(cut(props, 'phone_face', { parent: phone })).position.y = 0.0004;
  const back = cut(props, 'phone_back', { parent: phone }); back.rotation.x = Math.PI / 2; back.position.y = -0.0004;
  const SCR = Object.assign(document.createElement('canvas'), { width: 120, height: 64 });
  { const g = SCR.getContext('2d'); g.fillStyle = PALETTE.phone; g.fillRect(0, 0, 120, 64); g.fillStyle = PALETTE.navy;   // glyph bars, no text
    [[14, 12, 70], [14, 28, 88], [14, 44, 52]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 8, 4); g.fill(); }); }
  const scrTex = new THREE.CanvasTexture(SCR); scrTex.colorSpace = THREE.SRGBColorSpace;
  const screen = flat(new THREE.Mesh(new THREE.PlaneGeometry(0.0125, 0.0064), new THREE.MeshBasicMaterial({ map: scrTex })));
  screen.position.y = 0.00045; phone.add(screen);

  // ---------- characters ----------
  const hero = await makeGator({ assets }, { res: 1024 });
  hero.group.position.set(UNIT.hip[0], UNIT.hip[1], UNIT.bodyZ);
  scene.add(hero.group);
  const exam = makeExam({ shot: ID, seed: 1 });
  scene.add(exam.mesh, exam.stain);

  // ---------- light ----------
  const phoneSpot = phoneLight({ angle: 0.9, penumbra: 0.4, intensity: PHONE_I });
  phoneSpot.position.copy(V(UNIT.phoneLight));
  scene.add(phoneSpot, phoneSpot.target);
  const fill = new THREE.PointLight(PALETTE.phone, 0, 0.07, 2);   // README §10 character fill, s15's numbers
  fill.castShadow = false; fill.position.set(-0.046, 0.040, 0.114); scene.add(fill);
  const FILL = { phone: C('phone').lerp(C('navy'), 0.35), lamp: C('cream').lerp(C('lamp'), 0.3) };

  const lamp = lampLight({ angle: 0.35, penumbra: 0.5, intensity: 0 });
  lamp.light.position.set(UNIT.shadeMouth[0], UNIT.shadeMouth[1], LZ);
  scene.add(lamp.light, lamp.light.target, lamp.cone, lamp.dust);
  aim(lamp.light, V(UNIT.lampAim));
  const bulb = new THREE.PointLight(PALETTE.lamp, 0, 0.02, 2);   // inside the shade: back-lights the tissue only
  bulb.position.set(UNIT.shadeMouth[0], UNIT.shadeMouth[1] + 0.007, LZ - 0.003); scene.add(bulb);
  const amb = ambient(); amb.intensity *= AMB_K; scene.add(amb);

  // ---------- camera (Camera A, locked all 8 s) and post ----------
  camera.position.set(...UNIT.camA.pos);
  camera.lookAt(...UNIT.camA.look);
  const dir = camera.getWorldDirection(new THREE.Vector3());
  const fx = post({ focus: dir.dot(V(UNIT.focus).sub(camera.position)), aperture: UNIT.aperture, maxblur: UNIT.maxblur, lut: 'night' });

  const hand = new THREE.Vector3(), blobC = new THREE.Vector3();
  let lastSeed = null, lit = false, ph = 1;

  function update(t) {
    const tc = on2s(t), seed = boilSeed(t, 10);
    if (seed !== lastSeed) { lastSeed = seed; for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed })); }
    lit = t >= ON && t < OFF;
    fx.set({ lut: lit ? 'amber' : 'night' });

    // the Student
    hero.boil(t, 10);
    hero.blend(P, BODY, tc + 1e-6);
    const recoil = 3 * spring(tc, dr(13));   // the flinch's lean springs about −6 (+ = further back)
    hero.pose({ head: kf(tc, HEAD) * D, body: hero.joints.body.rotation.z + recoil * D });
    hero.face({ eyes: eyesAt(tc + 1e-6), mouth: mouthAt(tc + 1e-6) });
    hero.group.position.y = UNIT.hip[1] - (same(tc, dr(12)) ? 0.001 : 0);   // 1.000: the 1 mm settle before the flinch
    hero.group.updateMatrixWorld(true);
    hero.hand.getWorldPosition(hand);

    knob.position.set(...(same(tc, dr(6)) || same(tc, dr(36)) ? UNIT.knobPressed : UNIT.knob), UNIT.knobZ);

    // the Exam: startle on the click, the hopeful hop at 2.0, the spring-back on the off click, the sag at 4.5
    const at = tc < dr(25) ? MARK : same(tc, dr(25)) ? [(MARK[0] + HOP[0]) / 2, 0.002, MARK[2]] : HOP;
    exam.mesh.position.set(...at);
    exam.stain.position.set(at[0], 0.0004, at[2]);
    exam.update(t, {
      wobble: tc < ON ? 1.4 : tc < dr(9) ? 1 : tc < OFF ? 0.4 : 1,
      squash: kick(tc, ON, 0.3) + (same(tc, dr(24)) ? 0.25 : 0) + kick(tc, dr(26), 0.2) + kick(tc, OFF, 0.25) + 0.15 * clamp((tc - 4.5) / 0.5),
      eyes: same(tc, dr(8)) || same(tc, dr(36)) ? 'closed' : tc >= 5 ? 'side' : tc >= dr(16) && tc < OFF ? 'worried' : 'open',
      look: -1, key: lit ? lamp.light : phoneSpot,
    });

    // light (on 1s): phone key, out-shone by the lamp 0.5–3.0, full again on the off frame
    blobC.set(at[0], at[1] + R, at[2]);
    aim(phoneSpot, blobC);   // along phone → blob, i.e. at its wall hit (README §4)
    ph = lit ? PHONE_OUTSHONE : 1;
    phoneSpot.intensity = PHONE_I * ph;
    fill.color.copy(lit ? FILL.lamp : FILL.phone); fill.intensity = lit ? FILL_LAMP : FILL_PHONE;
    screen.material.color.setScalar(lit ? 0.6 : 1);
    const lk = lit ? kf(t, LAMP_KEYS, (x) => x) : 0;
    lamp.light.visible = lit;
    lamp.light.intensity = LAMP_I * lk;
    bulb.intensity = BULB_I * lk;
    lamp.update(t);
    lamp.dust.geometry.computeBoundingSphere();   // three sorts by a bounding sphere it never recomputes (anim-s15 Gaps)
  }

  // For evidence/anim-s06/measure.html: what the acceptance prints.
  const probe = () => ({
    hand: hand.toArray(), lamp: lamp.light.intensity / LAMP_I, phone: ph, lit,
    wallScale: shadowScale(phoneSpot.position, blobC, 0),
    poolScale: lamp.light.position.y / (lamp.light.position.y - R),
    blob: blobC.toArray(), head: hero.meshes.head.getWorldPosition(new THREE.Vector3()).toArray(),
    knob: knob.getWorldPosition(new THREE.Vector3()).toArray(),
    spots: [lamp.light, phoneSpot].map((l) => ({ I: l.visible ? l.intensity : 0, pos: l.position.toArray(),
      aim: l.target.getWorldPosition(new THREE.Vector3()).toArray(), angle: l.angle, penumbra: l.penumbra })),
  });
  return { update, probe };
}
