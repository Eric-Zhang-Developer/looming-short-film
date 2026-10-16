// The roommates (s05), fitted to the painted roommates_sheet (v3-fix-home): a heron (tall) and a bear (round), both facing +x.
// Every size is the cut's painted pixel box × a metres-per-pixel constant, so the painter's proportions are held exactly
// (v2 stretched the tail 2× and squashed the bear 24%). roommates_sheet has no arm pieces, so both borrow the Student's arm
// cutouts, multiplied by the roommate's own body colour so they read as a wing and a paw, not a green sleeve.
import { buildRig } from './gator.js';

const R = (piece) => ['roommates_sheet', piece];
const FACES = { eyes: 'open', mouth: 'neutral' };

export const HERON_K = 0.0001;       // m per painted px: 440 px of body = 4.4 cm, the whole bird about 0.098 m to the crest (the spec's 0.10)
export const BEAR_K = 0.000193;      // m per painted px: 440 px = 8.5 cm, head top 0.08 m with the bottom 3 cm behind the seat strip
export const HERON_STAND_Y = 0.0326; // root height with both feet on the floor (the leg shaft below its pivot, from the art)

const px = (w, h, k) => [w * k, h * k];

// The mean colour of a piece's opaque pixels, for tinting the borrowed arms.
async function meanColor(ctx, [asset, piece]) {
  const bmp = (await ctx.assets.load(asset)).pieces[piece];
  const c = Object.assign(document.createElement('canvas'), { width: 16, height: 16 }), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(bmp, 0, 0, 16, 16);
  const d = g.getImageData(0, 0, 16, 16).data;
  let r = 0, gr = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; n++; }
  return `rgb(${Math.round(r / n)},${Math.round(gr / n)},${Math.round(b / n)})`;
}

// A ctx whose assets.load('roommate_arms') is the gator's two arm cutouts multiplied by `color`.
async function withArms(ctx, color) {
  const gs = await ctx.assets.load('gator_sheet'), pieces = {};
  for (const n of ['arm_l', 'arm_r']) {
    const src = gs.pieces[n], c = Object.assign(document.createElement('canvas'), { width: src.width, height: src.height }), g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(src, 0, 0);
    pieces[n] = c;
  }
  return { assets: { load: async (n) => (n === 'roommate_arms' ? { pieces, sizes: gs.sizes, visible: gs.visible, proxy: false } : ctx.assets.load(n)) } };
}

// Root at the hip (the body's lower third). Legs hang from it; standing, the feet are HERON_STAND_Y below the root.
// Body, head and legs are boxes from the sheet (204×440, 432×304, 148×340, 140×343, 376×192 px). Pivots read off the art:
// the neck's base at the head's bottom (u 0.43), the collar's centre at the body's top (u 0.45), the leg shaft's top, the tail's stub.
export async function makeRoommateTall(ctx, { seed = 0, scale = 1, res = 512 } = {}) {
  const c2 = await withArms(ctx, await meanColor(ctx, R('tall_body')));
  const K = HERON_K, A = (n) => ['roommate_arms', n], body = px(204, 440, K);
  const onBody = (u, v) => [(u - 0.45) * body[0], (0.88 - v) * body[1]];   // a point on the body art, from its pivot
  return buildRig(c2, { name: 'tall', seed, scale, green: null, res, faces: FACES, parts: [
    { name: 'body', from: R('tall_body'), size: body, pivot: [0.45, 0.88], at: [0, 0] },
    { name: 'leg_l', from: R('tall_leg_l'), parent: 'body', size: px(148, 340, K), pivot: [0.22, 0.07], at: onBody(0.36, 0.9), z: -0.003 },
    { name: 'leg_r', from: R('tall_leg_r'), parent: 'body', size: px(140, 343, K), pivot: [0.22, 0.07], at: onBody(0.58, 0.9), z: 0.003 },
    { name: 'tail', from: R('tall_tail'), parent: 'body', size: px(376, 192, K), pivot: [0.95, 0.45], at: onBody(0.1, 0.74), z: -0.002 },
    { name: 'arm_l', from: A('arm_l'), parent: 'body', reach: 0.03, at: onBody(0.52, 0.2), z: -0.004 },
    { name: 'head', from: R('tall_head'), parent: 'body', size: px(432, 304, K), pivot: [0.43, 0.97], at: onBody(0.45, 0.07), z: 0.003 },
    { name: 'eyes', from: null, parent: 'head', at: [0.0148, 0.0145], z: 0.002 },
    { name: 'mouth', from: null, parent: 'head', at: [0.03, 0.0085], z: 0.002, hidden: true },   // the beak is the mouth
    { name: 'arm_r', from: A('arm_r'), parent: 'body', reach: 0.03, at: onBody(0.52, 0.2), z: 0.008 },
  ] });
}

// One painted piece (seated, back three-quarter, head turned to +x, 380×440 px), root at its bottom centre, plus the
// borrowed paws and the shared faces on the turned head.
export async function makeRoommateRound(ctx, { seed = 0, scale = 1, res = 512 } = {}) {
  const c2 = await withArms(ctx, await meanColor(ctx, R('round')));
  const [w, h] = px(380, 440, BEAR_K), on = (u, v) => [(u - 0.5) * w, (1 - v) * h];   // a point on the art, from the root at its bottom centre
  return buildRig(c2, { name: 'round', seed, scale, green: null, res, faces: FACES, parts: [
    { name: 'body', from: R('round'), size: [w, h], pivot: [0.5, 1], at: [0, 0] },
    { name: 'arm_l', from: ['roommate_arms', 'arm_l'], parent: 'body', reach: 0.03, at: on(0.62, 0.55), z: -0.004 },
    { name: 'eyes', from: null, parent: 'body', at: on(0.76, 0.27), z: 0.002 },
    { name: 'mouth', from: null, parent: 'body', at: on(0.93, 0.4), z: 0.002 },
    { name: 'arm_r', from: ['roommate_arms', 'arm_r'], parent: 'body', reach: 0.03, at: on(0.62, 0.55), z: 0.008 },
  ] });
}
