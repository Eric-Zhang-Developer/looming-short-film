// The Custodian and his cart (s14), from custodian_sheet. He faces +x; s14 walks him −x with group.scale.x = −1.
// The mop is his (it trails him at x_k + 0.020), hung from the handle top so a small angle swings its head.
// v3 (v3-fix-marston): the painter drew the pieces off the PIECES aspect ratios (asset-cast-kit/aspect_table.md: the mop
// 3.5× too wide, arms 0.55× as long, tail 0.5×), and the old sizes squeezed every piece to those ratios. Each size now keeps
// its piece's own aspect (visible box, assets.load), set by one long dimension, so the tortoise is drawn as painted.
import { buildRig, greenVariant } from './gator.ts';
import type { AssetCtx } from '../assets.ts';

const C = (piece: string) => ['custodian_sheet', piece];
// one number per piece, the long side in metres; the other side follows the art (tools: asset-cast-kit aspect table)
const BODY_H = 0.046, HEAD_W = 0.030, CAP_W = 0.0155, TAIL_W = 0.016, ARM_REACH = 0.030, MOP_H = 0.064;
const asp = { body: 242 / 313, head: 256 / 193, cap: 255 / 111, tail: 173 / 89, mop: 107 / 386, frame: 346 / 266, tray: 735 / 73, bucket: 241 / 208 };

export function makeCustodian(ctx: AssetCtx, { seed = 0, scale = 1, green = greenVariant(4), res = 512 } = {}) {
  return buildRig(ctx, { name: 'custodian', seed, scale, green, res, parts: [
    { name: 'body', from: C('custodian_body'), size: [BODY_H * asp.body, BODY_H], pivot: [0.45, 0.97], at: [0, 0] },
    { name: 'tail', from: C('custodian_tail'), parent: 'body', size: [TAIL_W, TAIL_W / asp.tail], pivot: [0.92, 0.5], at: [-0.010, 0.004], z: -0.002, turn: 'mirrorProxy' },
    { name: 'arm_l', from: C('custodian_arm_l'), parent: 'body', reach: ARM_REACH, at: [0.010, 0.030], z: -0.004 },
    { name: 'mop', from: C('mop'), parent: 'body', size: [MOP_H * asp.mop, MOP_H], pivot: [0.5, 0.04], at: [-0.015, 0.066], z: -0.008, weight: 'kraft' },
    { name: 'head', from: C('custodian_head'), parent: 'body', size: [HEAD_W, HEAD_W / asp.head], pivot: [0.3, 0.8], at: [0.006, 0.036], z: 0.003 },
    { name: 'cap', from: C('custodian_cap'), parent: 'head', size: [CAP_W, CAP_W / asp.cap], pivot: [0.5, 1], at: [0.000, 0.0125], z: 0.001 },
    { name: 'arm_r', from: C('custodian_arm_r'), parent: 'body', reach: ARM_REACH, at: [0.010, 0.030], z: 0.010 },
  ] });
}

export function makeCart(ctx: AssetCtx, { seed = 0, scale = 1, res = 512 } = {}) {
  return buildRig(ctx, { name: 'cart', seed, scale, res, parts: [
    { name: 'frame', from: C('cart_frame'), size: [0.0624, 0.0624 / asp.frame], pivot: [0.5, 1], at: [0, 0], weight: 'kraft' },
    { name: 'bucket', from: C('cart_bucket'), parent: 'frame', size: [0.021, 0.021 / asp.bucket], pivot: [0.5, 1], at: [0.012, 0.004], z: 0.003 },
    { name: 'tray', from: C('cart_tray'), parent: 'frame', size: [0.0607, 0.0607 / asp.tray], pivot: [0.5, 0.5], at: [0, 0.048], z: 0.002, weight: 'kraft' },
  ] });
}
