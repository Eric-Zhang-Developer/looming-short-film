// Lab for src/puppet.js: a TEMPORARY test gator (paper.js paths, gator green and cream) under a swaying lamp,
// standing on a kraft desk 3.5 cm in front of a cream wall. Frozen gator art replaces it in wave 3.
// One 4 s action: neutral → anticipation → reach for the lamp (overshoot, settle, hold) → worried face (t = 2)
// → relieved smile (t = 3). Tail and pocket follow on springs. The puppet steps on 2s; the lamp sways on 1s.
// Every part and face take boils at rate 10 (gator.boil(t)), in every view.
// window.renderFrame(t): t in [0, 4) is the action; [4, 8) joint stress poses; [8, 9) every face take. window.lab exposes the puppet and lamp for evidence/mod-puppet/twos.mjs.
import * as THREE from 'three';
import { createStage, exposeForRender } from '../src/core/stage.js';
import { PALETTE } from '../src/core/palette.js';
import { onTwos } from '../src/core/ease.js';
import { mulberry32 } from '../src/core/rng.js';
import { makePaper } from '../src/paper.js';
import { lampLight, ambient, aim } from '../src/lights.js';
import { definePuppet } from '../src/puppet.js';

const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color(PALETTE.navy);
camera.position.set(0.005, 0.07, 0.5);
camera.lookAt(0.005, 0.048, 0.035);

// ---------- set: wall and desk ----------
function stock(fill, seed, repeat) {
  const S = 512, c = Object.assign(document.createElement('canvas'), { width: S, height: S }), g = c.getContext('2d'), rng = mulberry32(seed);
  g.fillStyle = fill; g.fillRect(0, 0, S, S);
  for (let k = 0; k < 2500; k++) {
    const x = rng() * S, y = rng() * S, a = rng() * Math.PI, l = 4 + rng() * 18;
    g.strokeStyle = rng() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
  return t;
}
const plane = (w, h, map) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map }));
  m.receiveShadow = true; scene.add(m); return m;
};
plane(0.8, 0.5, stock(PALETTE.cream, 11, [3, 2])).position.set(0, 0.25, 0);
const desk = plane(0.8, 0.4, stock(PALETTE.kraft, 23, [3, 1.5]));
desk.rotation.x = -Math.PI / 2; desk.position.set(0, 0, 0.2);

// ---------- the test gator: shapes in mm, y down inside each part's box ----------
const arc = (cx, cy, rx, ry, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
});
const D = Math.PI / 180;
const RES = 512;
// Every sheet is a function of the boil seed, so gator.boil(t) re-tears it.
const sheet = (name, [w, h], pts, color, weight = 'cardstock') => (seed) =>
  makePaper({ path: pts.map(([x, y]) => [x / w, y / h]), size: [w / 1000, h / 1000], color, weight, key: 'testgator-' + name, res: RES, seed });
const fromArt = (name, [w, h], draw, weight = 'cardstock') => {  // faces: two colors, so drawn as art with alpha
  const s = 30, c = Object.assign(document.createElement('canvas'), { width: w * s, height: h * s }), g = c.getContext('2d');
  g.scale(s, s); g.lineCap = g.lineJoin = 'round'; draw(g);
  return (seed) => makePaper({ art: c, size: [w / 1000, h / 1000], weight, key: 'testgator-' + name, res: RES, seed });
};

const BODY = [36, 46], HEAD = [40, 26], JAW = [26, 8], ARM = [9, 28], TAIL = [44, 14], POCKET = [16, 10], EYES = [18, 12], MOUTH = [14, 7];
const ease = (x) => x * x * (3 - 2 * x);
const bodyPts = (() => {  // pear: narrow top, wide flat-ish bottom
  const hw = (y) => { const q = (y - 23) / 23; return (11 + 6.5 * ease(y / 46)) * Math.cbrt(Math.max(0, 1 - Math.abs(q) ** 3)); };
  const ys = Array.from({ length: 41 }, (_, i) => 46 * i / 40);
  return [...ys.map((y) => [18 + hw(y), y]), ...ys.reverse().map((y) => [18 - hw(y), y])];
})();
const headPts = [...arc(14, 13, 12, 12, 90 * D, 300 * D), [24, 4], [33, 7], ...arc(33, 14, 6.5, 7, -90 * D, 90 * D, 16), [20, 22]];
const capsule = (x0, y0, r0, x1, y1, r1) => [...arc(x0, y0, r0, r0, 90 * D, 270 * D, 16), ...arc(x1, y1, r1, r1, -90 * D, 90 * D, 16)];  // horizontal
const jawPts = capsule(4, 4, 3.6, 22, 4, 3.2);
const armPts = [...arc(4.5, 4.5, 4, 4, 180 * D, 360 * D, 16), ...arc(4.5, 23.5, 4.4, 4.4, 0, 180 * D, 16)];
const tailPts = (() => {
  const xs = Array.from({ length: 31 }, (_, i) => 2 + 36 * i / 30);
  const yc = (x) => 7 - 3 * ((38 - x) / 36) ** 2, ht = (x) => 0.8 + 5.2 * ((x - 2) / 36) ** 0.8;
  return [...xs.map((x) => [x, yc(x) - ht(x)]), ...arc(38, 7, 6, 6, -90 * D, 90 * D, 16), ...xs.reverse().map((x) => [x, yc(x) + ht(x)])];
})();
const pocketPts = [...arc(3, 3, 2, 2, 180 * D, 270 * D, 6), ...arc(13, 3, 2, 2, 270 * D, 360 * D, 6), ...arc(12, 6, 3.5, 3.5, 0, 90 * D, 8), ...arc(4, 6, 3.5, 3.5, 90 * D, 180 * D, 8)];

// Eyes: two cream bumps with ink pupils. Mouths: ink marks. All takes in a slot share its box.
const bumps = (g, f) => { for (const x of [5, 13]) { g.fillStyle = PALETTE.cream; g.beginPath(); g.ellipse(x, 7.5, 3.8, 4, 0, 0, 2 * Math.PI); g.fill(); f(g, x); } };
const pupil = (g, x, y, r) => { g.fillStyle = PALETTE.ink; g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.fill(); };
const ink = (g, w, path) => { g.strokeStyle = PALETTE.ink; g.lineWidth = w; g.beginPath(); path(g); g.stroke(); };
const EYE_TAKES = {
  open: (g) => bumps(g, (g, x) => pupil(g, x + 0.8, 7.4, 1.6)),
  closed: (g) => bumps(g, (g, x) => ink(g, 0.9, (g) => g.arc(x, 8.6, 2.2, 200 * D, 340 * D))),  // content ∩
  tired: (g) => bumps(g, (g, x) => {  // half lid: the bump's top half in skin color, clipped to the bump
    pupil(g, x + 0.6, 8.6, 1.5);
    g.save(); g.beginPath(); g.ellipse(x, 7.5, 3.8, 4, 0, 0, 2 * Math.PI); g.clip();
    g.fillStyle = PALETTE.gator; g.fillRect(x - 4, 3, 8, 4.8); g.restore();
    ink(g, 0.7, (g) => { g.moveTo(x - 3.6, 7.8); g.lineTo(x + 3.6, 7.8); });
  }),
  gasp: (g) => bumps(g, (g, x) => pupil(g, x, 7.5, 0.9)),
  worried: (g) => {
    bumps(g, (g, x) => pupil(g, x + 0.3, 8.2, 1.4));
    ink(g, 0.8, (g) => { g.moveTo(1.6, 2.6); g.lineTo(6.6, 1.2); g.moveTo(11.4, 1.2); g.lineTo(16.4, 2.6); });  // brows up in the middle
    g.fillStyle = PALETTE.cream; for (const [x, y] of [[17.2, 5.2], [17.4, 8]]) { g.beginPath(); g.arc(x, y, 0.55, 0, 2 * Math.PI); g.fill(); }  // sweat dots
  },
  side: (g) => bumps(g, (g, x) => pupil(g, x + 2, 7.6, 1.5)),
};
const MOUTH_TAKES = {
  neutral: (g) => ink(g, 0.9, (g) => { g.moveTo(1.5, 3.2); g.quadraticCurveTo(7, 4.2, 12.5, 3.2); }),
  smile: (g) => ink(g, 1, (g) => { g.moveTo(1.5, 2); g.quadraticCurveTo(7, 7.2, 12.5, 2); }),
  o: (g) => { g.fillStyle = PALETTE.ink; g.beginPath(); g.ellipse(7, 3.5, 2.2, 2.6, 0, 0, 2 * Math.PI); g.fill(); },
  line: (g) => ink(g, 0.9, (g) => { g.moveTo(3, 3.6); g.lineTo(11, 3.4); }),
};
const map = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(k, v)]));
const faces = {
  eyes: map(EYE_TAKES, (k, d) => fromArt('eyes-' + k, EYES, d)),
  mouth: map(MOUTH_TAKES, (k, d) => fromArt('mouth-' + k, MOUTH, d)),
};

// at: a point of the parent's box (mm, y down) → the parent's joint frame (m, y up).
const inBox = (pivotMM) => ([x, y]) => [(x - pivotMM[0]) / 1000, (pivotMM[1] - y) / 1000];
const PIV = { body: [18, 45], head: [14, 20], jaw: [4, 4], arm: [4.5, 4.5], tail: [38, 7], pocket: [8, 1], eyes: [9, 6], mouth: [7, 3.5] };
const uv = (p, [w, h]) => [p[0] / w, p[1] / h];
const body = inBox(PIV.body), head = inBox(PIV.head);
const G = PALETTE.gator, C = PALETTE.cream;
const gator = definePuppet({
  name: 'testgator',
  faces,
  parts: [
    { name: 'body', sheet: sheet('body', BODY, bodyPts, G), pivot: uv(PIV.body, BODY), at: [0, 0] },
    { name: 'tail', parent: 'body', sheet: sheet('tail', TAIL, tailPts, G), pivot: uv(PIV.tail, TAIL), at: body([8, 38]), z: -0.003 },
    { name: 'arm_l', parent: 'body', sheet: sheet('arm_l', ARM, armPts, G), pivot: uv(PIV.arm, ARM), at: body([12, 19]), z: -0.003 },
    { name: 'pocket', parent: 'body', sheet: sheet('pocket', POCKET, pocketPts, C, 'tissue'), pivot: uv(PIV.pocket, POCKET), at: body([19, 28]), z: 0.002 },
    { name: 'head', parent: 'body', sheet: sheet('head', HEAD, headPts, G), pivot: uv(PIV.head, HEAD), at: body([18, 8]), z: 0.003 },
    { name: 'jaw', parent: 'head', sheet: sheet('jaw', JAW, jawPts, C), pivot: uv(PIV.jaw, JAW), at: head([18, 20]), z: -0.002 },
    { name: 'eyes', parent: 'head', sheet: faces.eyes.open, pivot: uv(PIV.eyes, EYES), at: head([16, 3]), z: 0.002 },
    { name: 'mouth', parent: 'head', sheet: faces.mouth.neutral, pivot: uv(PIV.mouth, MOUTH), at: head([31, 18]), z: 0.002 },
    { name: 'arm_r', parent: 'body', sheet: sheet('arm_r', ARM, armPts, G), pivot: uv(PIV.arm, ARM), at: body([23, 20]), z: 0.005 },
  ],
});
gator.group.position.set(-0.012, 0.0008, 0.035);
scene.add(gator.group);

// ---------- the action (poses are plain objects, as a shot or character file would hold them) ----------
const POSES = {
  neutral:  { body: 0,     head: 0,     jaw: 0,     arm_r: 0.12, arm_l: -0.1 },
  antic:    { body: 0.15,  head: 0.1,   jaw: 0,     arm_r: -0.5, arm_l: -0.35 },  // lean back, arm swings back
  over:     { body: -0.26, head: 0.55,  jaw: -0.16, arm_r: 2.4,  arm_l: 0.6 },    // overshoots the reach
  reach:    { body: -0.2,  head: 0.45,  jaw: -0.12, arm_r: 2.2,  arm_l: 0.5 },   // arm out under the raised chin
  worried:  { body: 0.07,  head: -0.2,  jaw: -0.04, arm_r: 1.25, arm_l: 0.2 },
  relieved: { body: -0.03, head: 0.14,  jaw: 0,     arm_r: 0.3,  arm_l: -0.15 },
};
// Key times sit on the 12 fps grid (n / 12), so each key pose is actually sampled on 2s.
const KEYS = [[0, 'neutral'], [6 / 12, 'neutral'], [10 / 12, 'antic'], [13 / 12, 'antic'], [16 / 12, 'over'], [18 / 12, 'reach'], [24 / 12, 'reach'],
  [28 / 12, 'worried'], [34 / 12, 'worried'], [38 / 12, 'relieved'], [48 / 12, 'relieved']];
const FACES = [[0, { eyes: 'open', mouth: 'neutral' }], [2, { eyes: 'worried', mouth: 'line' }], [3, { eyes: 'closed', mouth: 'smile' }]];

// ---------- light: one lamp, up and to the right, swaying gently on real t ----------
scene.add(ambient());
const lamp = lampLight({ intensity: 0.2, angle: 0.35, penumbra: 0.4 });
scene.add(lamp.light, lamp.light.target, lamp.cone, lamp.dust);
const AIM = new THREE.Vector3(0, 0.04, 0.035);

// Past the action, two views for evidence: [4, 8) holds every joint at an extreme (gap check),
// [8, 9) steps through every face take on 2s.
const STRESS = [
  { body: 0, head: 0.6, jaw: -0.4, arm_r: 3.0, arm_l: -1.2, tail: 0.6, pocket: 0.6 },
  { body: 0, head: -0.6, jaw: 0.1, arm_r: -1.5, arm_l: 1.5, tail: -0.5, pocket: -0.6 },
];
const EYES_ALL = Object.keys(EYE_TAKES), MOUTHS_ALL = Object.keys(MOUTH_TAKES);

stage.onFrame((t) => {
  lamp.light.position.set(0.07 + 0.006 * Math.sin(t * 2.3), 0.15, 0.28 + 0.004 * Math.cos(t * 1.7));
  aim(lamp.light, AIM);
  lamp.update(t);
  gator.boil(t);
  const ft = onTwos(t);
  if (t >= 8) {
    const i = Math.round((ft - 8) * 12);
    gator.pose(POSES.neutral); gator.pose({ tail: 0, pocket: 0 });
    gator.face({ eyes: EYES_ALL[i % EYES_ALL.length], mouth: MOUTHS_ALL[i % MOUTHS_ALL.length] });
    return;
  }
  if (t >= 4) {
    gator.pose(STRESS[t < 6 ? 0 : 1]);
    gator.face(FACES[0][1]);
    return;
  }
  gator.blend(POSES, KEYS, t);
  gator.follow('tail', t, { k: 4, w: 13, gain: 0.8 });
  gator.follow('pocket', t, { k: 5, w: 20, gain: 1.2 });
  gator.face(FACES.findLast(([k]) => ft >= k)[1]);
});

exposeForRender(stage, { duration: 9 });
window.lab = { THREE, stage, gator, lamp };
