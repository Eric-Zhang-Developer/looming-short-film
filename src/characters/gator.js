// The Student's rig, and the helpers every character file builds with (contract: docs/contracts.md §characters).
// Pieces come from assets.load(): cut frozen art where it exists (gator_sheet, face_sheet), proxies elsewhere.
// Geometry is s15's desk unit (docs/shots/README.md §2): shoulder = hip + (0.013, 0.030), near arm 0.032 to the
// fingertip, near arm 12 mm in front of the body, far arm 4 mm behind, pocket 3 mm in front. Everything × scale.
import * as THREE from 'three';
import { PIECES } from '../assets.js';
import { PALETTE } from '../core/palette.js';
import { makePaper } from '../paper.js';
import { definePuppet } from '../puppet.js';

// ---------- art helpers: each returns a canvas, built once at rig time ----------
const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const mirror = (img) => { const c = canvas(img.width, img.height), g = c.getContext('2d'); g.scale(-1, 1); g.drawImage(img, -img.width, 0); return c; };
const rot90 = (img) => {  // clockwise: a piece pointing +x now points down
  const c = canvas(img.height, img.width), g = c.getContext('2d');
  g.translate(img.height, 0); g.rotate(Math.PI / 2); g.drawImage(img, 0, 0); return c;
};
// Multiplies the green paint by green / PALETTE.gator per channel, so painted shading survives. Only green pixels
// take it (weight by how far g leads r and b), so a tinted cut keeps its cream hoodie, sleeves and rim.
function tint(img, green) {
  const c = canvas(img.width, img.height), g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const S = THREE.SRGBColorSpace, to = new THREE.Color(green).getRGB({}, S), from = new THREE.Color(PALETTE.gator).getRGB({}, S);  // pixels are sRGB
  const k = [to.r / from.r, to.g / from.g, to.b / from.b], d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const w = Math.min(1, Math.max(0, (p[i + 1] - Math.max(p[i], p[i + 2])) / 24));
    for (let j = 0; j < 3; j++) p[i + j] = Math.min(255, p[i + j] * (1 + w * (k[j] - 1)));
  }
  g.putImageData(d, 0, 0);
  return c;
}

// Mixed from PALETTE so no hex is typed here. Crowds are never cloned: every figure gets its own i.
const MIX = [['navy', 0.22], ['kraft', 0.3], ['cream', 0.2], ['ink', 0.3], ['kraft', 0.55], ['navy', 0.4], ['cream', 0.35], ['phone', 0.14]];
export function greenVariant(i) {
  const c = new THREE.Color(PALETTE.gator), [a, ka] = MIX[i % MIX.length];
  c.lerp(new THREE.Color(PALETTE[a]), ka);
  if (i >= MIX.length) { const [b, kb] = MIX[(i + 3) % MIX.length]; c.lerp(new THREE.Color(PALETTE[b]), kb * 0.5); }
  return '#' + c.getHexString();
}

// ---------- the generic rig builder ----------
// parts: [{ name, from: [asset, piece], size: [w, h] at scale 1, pivot: [u, v], parent?, at: [x, y] at scale 1, z = 0,
//   weight?, turn?: 'mirror' | 'rot90' (applied always) | 'mirrorProxy' (only to proxies, whose tapers point +x),
//   reach?: L (pivot at the round end, tip exactly L away along the piece; size and pivot come from the art's aspect),
//   hidden? }]
// faces: true adds eyes and mouth slots from face_sheet (parts named eyes/mouth must be in `parts`, from: null).
// facePair: draw every eye take as a front-view pair this many face px apart (makeFaces).
export async function buildRig(ctx, { name, seed = 0, scale = 1, green, res = 512, parts, faces = null, facePair = 0 }) {
  const id = `${name}${seed}`;
  const loaded = {};
  for (const p of parts) if (p.from && !loaded[p.from[0]]) loaded[p.from[0]] = await ctx.assets.load(p.from[0]);
  const s = (v) => v.map((x) => x * scale);
  const faceSet = faces ? await makeFaces(ctx, { id, scale, res: Math.min(res, 256), pair: facePair }) : null;
  const hands = {}, defs = [];
  for (const p of parts) {
    if (!p.from) {  // face slot
      const takes = faceSet.takes[p.name];
      defs.push({ name: p.name, parent: p.parent, sheet: takes[faces[p.name]], pivot: [0.5, 0.5], at: s(p.at), z: (p.z ?? 0) * scale });
      continue;
    }
    const [asset, piece] = p.from, a = loaded[asset];
    let art = a.pieces[piece];
    if (!art) throw new Error(`${name}: ${asset} has no piece "${piece}"`);
    // size and pivot are the visible shape's (a.visible: its box inside the bitmap's transparent margin)
    let [u0, v0, u1, v1] = a.visible?.[piece] ?? [0, 0, 1, 1];
    if (p.turn === 'mirror' || (p.turn === 'mirrorProxy' && a.proxy)) { art = mirror(art); [u0, u1] = [1 - u1, 1 - u0]; }
    if (p.turn === 'rot90') { art = rot90(art); [u0, v0, u1, v1] = [1 - v1, u0, 1 - v0, u1]; }
    if (green && PIECES[asset]?.[piece]?.[3] === 'gator') art = tint(art, green);
    const fw = u1 - u0, fh = v1 - v0;
    let size = p.size && s(p.size), pivot = p.pivot;
    if (p.reach) {  // exact reach: the joint sits at the round end's center, the tip is `reach` away
      const asp = (art.width * fw) / (art.height * fh), L = p.reach * scale;
      if (asp >= 1) { const w = L / (1 - 0.5 / asp); size = [w, w / asp]; pivot = [0.5 / asp, 0.5]; }
      else { const h = L / (1 - 0.5 * asp); size = [h * asp, h]; pivot = [0.5, 0.5 * asp]; }
    }
    size = [size[0] / fw, size[1] / fh]; pivot = [u0 + pivot[0] * fw, v0 + pivot[1] * fh];
    const key = `${id}-${p.name}`, weight = p.weight ?? 'cardstock';
    defs.push({ name: p.name, parent: p.parent, pivot, at: s(p.at), z: (p.z ?? 0) * scale,
      sheet: (sd) => makePaper({ art, size, key, weight, res, seed: sd }) });
    if (p.reach) hands[p.name] = [p.reach * scale, art.width >= art.height];
  }
  const puppet = definePuppet({ name, parts: defs, faces: faceSet?.takes ?? {} });
  for (const p of parts) if (p.hidden) puppet.meshes[p.name].visible = false;
  for (const [part, [L, alongX]] of Object.entries(hands)) {
    const g = new THREE.Group();
    g.name = `${part}-hand`;
    if (alongX) g.position.set(L, 0, 0.001); else g.position.set(0, -L, 0.001);
    puppet.joints[part].add(g);
    hands[part] = g;
  }
  return Object.assign(puppet, { hands, hand: hands.arm_r ?? null, scale });
}

// Faces: every take is drawn at one scale, FACE m per face_sheet px, onto one canvas per slot (sizes in face px), so
// face() swaps never change geometry. FACE puts the open eye (129.5 px) at the frozen head's painted eye (59.5 figure
// px, evidence/asset-face-sheet/measure.txt). Each take is centred on its box centre, except where ANCHOR moves it
// (worried: the eye, not the eye plus its sweat drops). pair: the front view's two eyes, `pair` face px apart, the
// right one mirrored so both look at the camera.
const EYES = ['open', 'closed', 'tired', 'gasp', 'worried', 'side'], MOUTHS = ['neutral', 'smile', 'o', 'line'];
const SLOTS = { eyes: [EYES, [232, 160]], mouth: [MOUTHS, [232, 100]] };
const ANCHOR = { eyes_worried: [22, 0] };
async function makeFaces(ctx, { id, scale, res, pair = 0 }) {
  const a = await ctx.assets.load('face_sheet'), takes = {};
  for (const [slot, [names, [CW0, CH]]] of Object.entries(SLOTS)) {
    const two = slot === 'eyes' && pair, CW = CW0 + (two ? pair : 0);
    takes[slot] = {};
    for (const n of names) {
      const key = `${slot}_${n}`, art = a.pieces[key], [w, h] = a.sizes[key], [ax, ay] = ANCHOR[key] ?? [0, 0];
      const dw = w / FACE, dh = h / FACE;  // the bitmap, in face px
      const c = canvas(CW, CH), g = c.getContext('2d');
      const put = (cx, flip) => {
        g.save(); g.translate(cx, CH / 2); if (flip) g.scale(-1, 1);
        g.drawImage(art, -dw / 2 - ax, -dh / 2 - ay, dw, dh); g.restore();
      };
      if (two) { put(CW / 2 - pair / 2, false); put(CW / 2 + pair / 2, true); } else put(CW / 2, false);
      takes[slot][n] = (sd) => makePaper({ art: c, size: [CW * FACE * scale, CH * FACE * scale], key: `${id}-${slot}-${n}`, res, seed: sd });
    }
  }
  return { takes };
}

// ---------- the Student ----------
// Side layout at scale 1 (m), fitted to the frozen sheet's turn_side figure (gator_sheet v2_1; evidence/cut-gator/).
// The painter drew each part at its own scale, so a part's size is its opaque box (sheet px) × its fit scale × K, and
// every joint is a point on the figure (figure px, y down) measured from its parent's. K comes from the s15 desk unit:
// the hip (the top of the boot, 352) to the shoulder (the top of the sleeve, 222) is 130 figure px = SHOULDER's 0.030.
// The joints the shots choreograph keep their numbers: the hip is the root, SHOULDER, ARM. The rest follows the
// figure: a 9.3 cm gator with stubby boots and the big head of the sheet. The head hangs 3.5 mm behind the body so
// the hood wraps the neck; the jaw sits in front of the snout so its teeth show, as painted.
const K = 0.030 / 130;                          // m per figure px
const FACE = 0.4595 * K;                        // m per face_sheet px (makeFaces)
const SHOULDER = [0.013, 0.030], ARM = 0.032;
const HIP_F = [200, 352], NECK_F = [240, 180];  // figure px of the hip and the neck
const at = (x, y, [ox, oy] = HIP_F) => [(x - ox) * K, (oy - y) * K];
const px = (w, h, s) => [w * s * K, h * s * K];
const LEG = px(140, 127, 0.56), LEG_PIVOT = [0.35, 0.06];
export const HIP = LEG[1] * (1 - LEG_PIVOT[1]);  // the boot's height below its pivot: 0.01543
// The foot in the leg's frame (hip at the origin): a sole with round heel and toe of radius R, centred at x = SOLE.
// hipHeight(pose) is how high the root must sit for the lower foot to touch the floor, from the legs' world angles
// (body + leg). Measured on the cut boot (leg_l, sheet px): heel and toe circles of r 14 at x 21 and 133, pivot x 56.
const LK = 0.56 * K, SOLE = [(21 - 56) * LK, (133 - 56) * LK], R = 14 * LK;
const drop = (a) => R + Math.max(...SOLE.map((x) => (HIP - R) * Math.cos(a) - x * Math.sin(a)));
export const hipHeight = (p) => Math.max(drop((p.body ?? 0) + (p.leg_r ?? 0)), drop((p.body ?? 0) + (p.leg_l ?? 0)));
export function sideParts(sheet, { pocket = true, backpack = false, head34 = false } = {}) {
  const P = (piece) => [sheet, piece], N = (x, y) => at(x, y, NECK_F), neck = at(...NECK_F);
  return [
    { name: 'body', from: P('body'), size: px(210, 231, 1.0), pivot: [0.286, 0.788], at: [0, 0] },
    { name: 'leg_l', from: P('leg_l'), parent: 'body', size: LEG, pivot: LEG_PIVOT, at: [0.001, 0], z: -0.003 },
    { name: 'leg_r', from: P('leg_r'), parent: 'body', size: LEG, pivot: LEG_PIVOT, at: [0.001, 0], z: 0.001 },
    { name: 'tail', from: P('tail'), parent: 'body', size: px(295, 138, 0.66), pivot: [0.919, 0.5], at: at(192, 310), z: -0.002, turn: 'mirrorProxy' },
    ...(backpack ? [{ name: 'backpack', from: P('backpack'), parent: 'body', size: [0.047, 0.053], pivot: [0.7, 0.45], at: [-0.010, 0.024], z: -0.007 }] : []),
    { name: 'arm_l', from: P('arm_l'), parent: 'body', reach: ARM, at: SHOULDER, z: -0.004 },
    ...(pocket ? [{ name: 'pocket', from: P('pocket'), parent: 'body', size: [0.014, 0.008], pivot: [0.5, 0], at: [0.012, 0.026], z: 0.003, weight: 'tissue' }] : []),
    { name: 'head', from: P('head'), parent: 'body', size: px(206, 176, 0.91), pivot: [0.415, 1.024], at: neck, z: -0.0035 },
    ...(head34 ? [{ name: 'head34', from: ['gator_sheet', 'turn_head34'], parent: 'body', size: px(276, 243, 0.78), pivot: [0.339, 0.865], at: neck, z: -0.0035, hidden: true }] : []),
    { name: 'snout', from: P('snout'), parent: 'head', size: px(296, 108, 0.69), pivot: [0.118, 0.5], at: N(286, 90), z: -0.001 },
    { name: 'jaw', from: P('jaw'), parent: 'head', size: px(268, 105, 0.7), pivot: [0.086, 0.362], at: N(278.5, 133), z: 0.001 },
    { name: 'eyes', from: null, parent: 'head', at: N(258.5, 66), z: 0.002 },
    { name: 'mouth', from: null, parent: 'head', at: N(318, 124), z: 0.003 },
    { name: 'arm_r', from: P('arm_r'), parent: 'body', reach: ARM, at: SHOULDER, z: 0.012 },
  ];
}
const FACES = { eyes: 'open', mouth: 'neutral' };

export async function makeGator(ctx, { seed = 0, scale = 1, green, res = 512, facing = 'side' } = {}) {
  const G = (piece) => ['gator_sheet', piece];
  let parts;
  if (facing === 'side') parts = sideParts('gator_sheet', { head34: true });
  // The turnarounds are whole figures at the side figure's scale K (sole to head top 0.096), so s09's side → back swap
  // holds his size. turn_front is painted without arms (the rig adds them at the side rig's shoulder height) and
  // without eyes or mouth: the eyes go on its two eye bumps (figure px 72 and 170, y 38) as a pair, the mouth on the
  // jaw seam under the teeth (y 163). Its feet are at figure y 420.
  else if (facing === 'front') parts = [  // root at the feet; the arms hang (rot90), so 0 = down
    { name: 'body', from: G('turn_front'), size: px(226, 415, 1), pivot: [0.5, 1], at: [0, 0] },
    { name: 'arm_l', from: G('arm_l'), parent: 'body', reach: ARM, turn: 'rot90', at: [0.0175, HIP + 0.030], z: 0.002 },
    { name: 'arm_r', from: G('arm_r'), parent: 'body', reach: ARM, turn: 'rot90', at: [-0.0175, HIP + 0.030], z: 0.002 },
    { name: 'eyes', from: null, parent: 'body', at: at(121, 38, [119, 420]), z: 0.001 },
    { name: 'mouth', from: null, parent: 'body', at: at(119, 163, [119, 420]), z: 0.001 },
  ];
  else if (facing === 'back') parts = [{ name: 'body', from: G('turn_back'), size: px(268, 423, 1), pivot: [0.5, 1], at: [0, 0] }];
  else throw new Error(`makeGator: unknown facing "${facing}"`);
  const rig = await buildRig(ctx, { name: `gator-${facing}`, seed, scale, green, res, parts, faces: facing === 'back' ? null : FACES,
    facePair: facing === 'front' ? 98 / 0.4595 : 0 });
  rig.facing = facing;
  // s14: the 3/4 head replaces head, snout and jaw on one drawing. It has its own painted eyes and smile, so the face
  // slots hide with it. Stateful, like face(): call it every frame.
  rig.head34 = (on) => {
    if (facing !== 'side') return;
    rig.meshes.head34.visible = on;
    for (const p of ['head', 'snout', 'jaw', 'eyes', 'mouth']) rig.meshes[p].visible = !on;
  };
  return rig;
}
