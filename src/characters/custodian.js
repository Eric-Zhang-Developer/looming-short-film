// The Custodian and his cart (s14), from custodian_sheet. He faces +x; s14 walks him −x with group.scale.x = -1.
// The mop is his (it trails him at x_k + 0.020), hung from the handle top so a small angle swings its head.
import { buildRig, greenVariant } from './gator.js';

const C = (piece) => ['custodian_sheet', piece];

export function makeCustodian(ctx, { seed = 0, scale = 1, green = greenVariant(4), res = 512 } = {}) {
  return buildRig(ctx, { name: 'custodian', seed, scale, green, res, parts: [
    { name: 'body', from: C('custodian_body'), size: [0.025, 0.04], pivot: [0.45, 0.97], at: [0, 0] },
    { name: 'tail', from: C('custodian_tail'), parent: 'body', size: [0.035, 0.009], pivot: [0.92, 0.5], at: [-0.008, 0.004], z: -0.002, turn: 'mirrorProxy' },
    { name: 'arm_l', from: C('custodian_arm_l'), parent: 'body', reach: 0.022, at: [0.010, 0.027], z: -0.004 },
    { name: 'mop', from: C('mop'), parent: 'body', size: [0.006, 0.07], pivot: [0.5, 0.04], at: [-0.020, 0.066], z: -0.008, weight: 'kraft' },
    { name: 'head', from: C('custodian_head'), parent: 'body', size: [0.025, 0.018], pivot: [0.3, 0.75], at: [0.004, 0.030], z: 0.003 },
    { name: 'cap', from: C('custodian_cap'), parent: 'head', size: [0.012, 0.005], pivot: [0.5, 1], at: [0.000, 0.012], z: 0.001 },
    { name: 'arm_r', from: C('custodian_arm_r'), parent: 'body', reach: 0.022, at: [0.010, 0.027], z: 0.010 },
  ] });
}

export function makeCart(ctx, { seed = 0, scale = 1, res = 512 } = {}) {
  return buildRig(ctx, { name: 'cart', seed, scale, res, parts: [
    { name: 'frame', from: C('cart_frame'), size: [0.06, 0.05], pivot: [0.5, 1], at: [0, 0], weight: 'kraft' },
    { name: 'bucket', from: C('cart_bucket'), parent: 'frame', size: [0.02, 0.018], pivot: [0.5, 1], at: [0.012, 0.004], z: 0.003 },
    { name: 'tray', from: C('cart_tray'), parent: 'frame', size: [0.06, 0.004], pivot: [0.5, 0.5], at: [0, 0.05], z: 0.002, weight: 'kraft' },
  ] });
}
