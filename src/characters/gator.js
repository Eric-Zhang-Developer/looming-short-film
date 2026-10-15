// The Student's rig, and the helpers every character file builds with (contract: docs/contracts.md §characters).
// Pieces come from assets.load(), proxies today and cut frozen art later; the rig code doesn't change when art lands.
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
// Multiplies the art by green / PALETTE.gator per channel, so painted shading survives.
function tint(img, green) {
  const c = canvas(img.width, img.height), g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const S = THREE.SRGBColorSpace, to = new THREE.Color(green).getRGB({}, S), from = new THREE.Color(PALETTE.gator).getRGB({}, S);  // pixels are sRGB
  const k = [to.r / from.r, to.g / from.g, to.b / from.b], d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) for (let j = 0; j < 3; j++) p[i + j] = Math.min(255, p[i + j] * k[j]);
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
export async function buildRig(ctx, { name, seed = 0, scale = 1, green, res = 512, parts, faces = null }) {
  const id = `${name}${seed}`;
  const loaded = {};
  for (const p of parts) if (p.from && !loaded[p.from[0]]) loaded[p.from[0]] = await ctx.assets.load(p.from[0]);
  const s = (v) => v.map((x) => x * scale);
  const faceSet = faces ? await makeFaces(ctx, { id, scale, res: Math.min(res, 256) }) : null;
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

// Every take of a slot is padded, centred, onto one canvas of the slot's size, so face() swaps never change geometry.
const EYES = ['open', 'closed', 'tired', 'gasp', 'worried', 'side'], MOUTHS = ['neutral', 'smile', 'o', 'line'];
const SLOTS = { eyes: [EYES, [0.009, 0.005]], mouth: [MOUTHS, [0.008, 0.003]] };
async function makeFaces(ctx, { id, scale, res }) {
  const a = await ctx.assets.load('face_sheet'), takes = {};
  for (const [slot, [names, [W, H]]] of Object.entries(SLOTS)) {
    const PX = 256, CW = PX, CH = Math.round(PX * H / W);
    takes[slot] = {};
    for (const n of names) {
      const art = a.pieces[`${slot}_${n}`], [w, h] = a.sizes[`${slot}_${n}`];
      const k = Math.min(w / art.width, h / art.height), dw = art.width * k * PX / W, dh = art.height * k * PX / W;  // contain in [w, h]
      const c = canvas(CW, CH);
      c.getContext('2d').drawImage(art, (CW - dw) / 2, (CH - dh) / 2, dw, dh);
      takes[slot][n] = (sd) => makePaper({ art: c, size: [W * scale, H * scale], key: `${id}-${slot}-${n}`, res, seed: sd });
    }
  }
  return { takes };
}

// ---------- the Student ----------
// Side layout at scale 1 (m). Body pivot = hip at the body's bottom; head pivot = neck. Both legs hang from one pivot
// at the hip; a plumb leg's sole is HIP below it, which stands him 8 cm (the hip to head top is 0.0505).
const SHOULDER = [0.013, 0.030], ARM = 0.032;
export const HIP = 0.032 * 0.92;  // leg piece height × (1 − pivot v): 0.02944
// The foot in the leg's frame (hip at the origin): a sole with round heel and toe of radius R, centred at x = SOLE.
// hipHeight(pose) is how high the root must sit for the lower foot to touch the floor, from the legs' world angles
// (body + leg). ponytail: SOLE and R are the proxy foot's; re-measure them from the cut leg_l when art lands.
const SOLE = [-0.0008, 0.0069], R = 0.0042;
const drop = (a) => R + Math.max(...SOLE.map((x) => (HIP - R) * Math.cos(a) - x * Math.sin(a)));
export const hipHeight = (p) => Math.max(drop((p.body ?? 0) + (p.leg_r ?? 0)), drop((p.body ?? 0) + (p.leg_l ?? 0)));
export function sideParts(sheet, { pocket = true, backpack = false, head34 = false } = {}) {
  const P = (piece) => [sheet, piece];
  return [
    { name: 'body', from: P('body'), size: [0.03, 0.045], pivot: [0.45, 0.95], at: [0, 0] },
    { name: 'leg_l', from: P('leg_l'), parent: 'body', size: [0.016, 0.032], pivot: [0.31, 0.08], at: [0.001, 0], z: -0.003 },
    { name: 'leg_r', from: P('leg_r'), parent: 'body', size: [0.016, 0.032], pivot: [0.31, 0.08], at: [0.001, 0], z: -0.001 },
    { name: 'tail', from: P('tail'), parent: 'body', size: [0.05, 0.012], pivot: [0.92, 0.5], at: [-0.010, 0.004], z: -0.002, turn: 'mirrorProxy' },
    ...(backpack ? [{ name: 'backpack', from: P('backpack'), parent: 'body', size: [0.047, 0.053], pivot: [0.7, 0.45], at: [-0.010, 0.024], z: -0.007 }] : []),
    { name: 'arm_l', from: P('arm_l'), parent: 'body', reach: ARM, at: SHOULDER, z: -0.004 },
    ...(pocket ? [{ name: 'pocket', from: P('pocket'), parent: 'body', size: [0.014, 0.008], pivot: [0.5, 0], at: [0.012, 0.026], z: 0.003, weight: 'tissue' }] : []),
    { name: 'head', from: P('head'), parent: 'body', size: [0.03, 0.022], pivot: [0.3, 0.75], at: [0.004, 0.034], z: 0.003 },
    ...(head34 ? [{ name: 'head34', from: ['gator_sheet', 'turn_head34'], parent: 'body', size: [0.03, 0.025], pivot: [0.4, 0.75], at: [0.004, 0.034], z: 0.0035, hidden: true }] : []),
    { name: 'snout', from: P('snout'), parent: 'head', size: [0.022, 0.008], pivot: [0.1, 0.5], at: [0.016, 0.002], z: 0.001 },
    { name: 'jaw', from: P('jaw'), parent: 'head', size: [0.02, 0.006], pivot: [0.1, 0.3], at: [0.014, -0.003], z: -0.001 },
    { name: 'eyes', from: null, parent: 'head', at: [0.010, 0.010], z: 0.002 },
    { name: 'mouth', from: null, parent: 'head', at: [0.022, -0.002], z: 0.003 },
    { name: 'arm_r', from: P('arm_r'), parent: 'body', reach: ARM, at: SHOULDER, z: 0.012 },
  ];
}
const FACES = { eyes: 'open', mouth: 'neutral' };

export async function makeGator(ctx, { seed = 0, scale = 1, green, res = 512, facing = 'side' } = {}) {
  const G = (piece) => ['gator_sheet', piece];
  let parts;
  if (facing === 'side') parts = sideParts('gator_sheet', { head34: true });
  // The turnarounds are whole figures sized to the side rig standing (8 cm, sole to head top), so s09's side → back
  // swap holds the figure's size; shoulders, eyes and arm length match the side rig's. turn_front is painted without
  // arms (the rig adds them).
  else if (facing === 'front') parts = [  // root at the feet; the arms hang (rot90), so 0 = down
    { name: 'body', from: G('turn_front'), size: [0.04, 0.08], pivot: [0.5, 1], at: [0, 0] },
    { name: 'arm_l', from: G('arm_l'), parent: 'body', reach: ARM, turn: 'rot90', at: [0.0175, HIP + 0.030], z: 0.002 },
    { name: 'arm_r', from: G('arm_r'), parent: 'body', reach: ARM, turn: 'rot90', at: [-0.0175, HIP + 0.030], z: 0.002 },
    { name: 'eyes', from: null, parent: 'body', at: [0, HIP + 0.041], z: 0.001 },
    { name: 'mouth', from: null, parent: 'body', at: [0, HIP + 0.035], z: 0.001 },
  ];
  else if (facing === 'back') parts = [{ name: 'body', from: G('turn_back'), size: [0.04, 0.08], pivot: [0.5, 1], at: [0, 0] }];
  else throw new Error(`makeGator: unknown facing "${facing}"`);
  const rig = await buildRig(ctx, { name: `gator-${facing}`, seed, scale, green, res, parts, faces: facing === 'back' ? null : FACES });
  rig.facing = facing;
  // s14: the 3/4 head replaces head, snout and jaw on one drawing. Stateful, like face(): call it every frame.
  rig.head34 = (on) => {
    if (facing !== 'side') return;
    rig.meshes.head34.visible = on;
    for (const p of ['head', 'snout', 'jaw']) rig.meshes[p].visible = !on;
  };
  return rig;
}
