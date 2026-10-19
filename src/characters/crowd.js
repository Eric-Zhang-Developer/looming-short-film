// @ts-check
// Marston extras. Side view (s16, s17): the neighbor and the sleeping extra from crowd_sheet, 3 parts each, laid out
// like the Student (s15 convention, near arm only). Top view (s13): hero_top and the six seated figures from
// top_figures_sheet; they face +y (north), and + head angles turn them clockwise as seen from above (poses.js).
// Doc 03: never clone a figure. Every call takes its own seed (paper tears) and green.
import { buildRig, greenVariant } from './gator.js';

// v3 (v3-fix-marston): the painter's pieces came back off the PIECES aspect ratios (bodies about 1.0 wide where 0.67 was asked,
// asset-cast-kit/aspect_table.md) and the old sizes squeezed them to it. Sizes keep each piece's own visible aspect, with
// the long side set to the Student's (a 9.3 cm gator's body is 0.053 high, his head 0.043 wide), so the neighbours are peers.
const SIDE = {
  neighbor: { green: 5, body: [0.043, 0.048], head: [0.036, 0.0248] },   // 275×308 and 448×308 visible px
  sleeper: { green: 6, body: [0.052, 0.047], head: [0.036, 0.0220] },    // 334×302 and 451×275
};
/** @param {import('../assets.js').AssetCtx} ctx @param {string} who @param {{ seed?: number, scale?: number, green?: string, res?: number }} [opts] */
export function makeCrowd(ctx, who, { seed = 0, scale = 1, green, res = 512 } = {}) {
  if (!SIDE[who]) throw new Error(`makeCrowd: unknown figure "${who}"`);
  const P = (piece) => ['crowd_sheet', `${who}_${piece}`];
  return buildRig(ctx, { name: who, seed, scale, green: green ?? greenVariant(SIDE[who].green), res, parts: [
    { name: 'body', from: P('body'), size: SIDE[who].body, pivot: [0.45, 0.95], at: [0, 0] },
    { name: 'head', from: P('head'), parent: 'body', size: SIDE[who].head, pivot: [0.3, 0.75], at: [0.004, 0.036], z: 0.003 },
    { name: 'arm_r', from: P('arm'), parent: 'body', reach: 0.032, at: [0.013, 0.032], z: 0.012 },
  ] });
}

const T = (piece) => ['top_figures_sheet', piece];
// Root at the body's centre. s13 moves joints.head.position for the lift (offset (0, 0.030) down, (0, 0.012) up).
export function makeHeroTop(ctx, { seed = 0, scale = 1, res = 512 } = {}) {
  return buildRig(ctx, { name: 'herotop', seed, scale, res, faces: { eyes: 'closed' }, parts: [
    { name: 'body', from: T('hero_body'), size: [0.03, 0.04], pivot: [0.5, 0.5], at: [0, 0] },
    { name: 'tail', from: T('hero_tail'), parent: 'body', size: [0.012, 0.045], pivot: [0.5, 0.03], at: [0, -0.016], z: -0.002 },
    { name: 'backpack', from: T('hero_backpack'), parent: 'body', size: [0.03, 0.025], pivot: [0.5, 0.5], at: [0, -0.032], z: -0.004 },
    { name: 'head', from: T('hero_head'), parent: 'body', size: [0.02, 0.025], pivot: [0.5, 0.75], at: [0, 0.012], z: 0.004 },
    { name: 'eyes', from: null, parent: 'head', at: [0, 0.006], z: 0.001 },
    { name: 'arms', from: T('hero_arms'), parent: 'body', size: [0.045, 0.012], pivot: [0.5, 0.5], at: [0, 0.006], z: 0.002 },
  ] });
}

export function makeSeated(ctx, n, { seed = 0, scale = 1, green = greenVariant(n), res = 512 } = {}) {
  if (!(n >= 1 && n <= 6)) throw new Error(`makeSeated: n is 1..6, got ${n}`);
  return buildRig(ctx, { name: `seated${n}`, seed, scale, green, res,
    parts: [{ name: 'body', from: T(`seated_${n}`), size: [0.04, 0.06], pivot: [0.5, 0.5], at: [0, 0] }] });
}
