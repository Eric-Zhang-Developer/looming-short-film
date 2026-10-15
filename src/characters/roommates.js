// The roommates (s05), from roommates_sheet. Both face +x. roommates_sheet has no arm pieces, so both borrow the
// Student's arm cutouts (tinted to their green): s05 has them mash a controller and cheer.
import { buildRig, greenVariant } from './gator.js';

const R = (piece) => ['roommates_sheet', piece], G = (piece) => ['gator_sheet', piece];
const FACES = { eyes: 'open', mouth: 'neutral' };

// Root at the hip (body bottom). Legs hang from it: standing feet are 0.027 × scale below the root.
export function makeRoommateTall(ctx, { seed = 0, scale = 1, green = greenVariant(2), res = 512 } = {}) {
  return buildRig(ctx, { name: 'tall', seed, scale, green, res, faces: FACES, parts: [
    { name: 'body', from: R('tall_body'), size: [0.035, 0.07], pivot: [0.5, 0.97], at: [0, 0] },
    { name: 'leg_l', from: R('tall_leg_l'), parent: 'body', size: [0.008, 0.03], pivot: [0.5, 0.12], at: [-0.004, 0.002], z: -0.003 },
    { name: 'leg_r', from: R('tall_leg_r'), parent: 'body', size: [0.008, 0.03], pivot: [0.5, 0.12], at: [0.004, 0.002], z: 0.003 },
    { name: 'tail', from: R('tall_tail'), parent: 'body', size: [0.05, 0.012], pivot: [0.92, 0.5], at: [-0.012, 0.008], z: -0.002, turn: 'mirrorProxy' },
    { name: 'arm_l', from: G('arm_l'), parent: 'body', reach: 0.036, at: [0.010, 0.052], z: -0.004 },
    { name: 'head', from: R('tall_head'), parent: 'body', size: [0.035, 0.025], pivot: [0.3, 0.8], at: [0.004, 0.064], z: 0.003 },
    { name: 'eyes', from: null, parent: 'head', at: [0.012, 0.010], z: 0.002 },
    { name: 'mouth', from: null, parent: 'head', at: [0.022, -0.003], z: 0.002 },
    { name: 'arm_r', from: G('arm_r'), parent: 'body', reach: 0.036, at: [0.010, 0.052], z: 0.008 },
  ] });
}

// One painted piece (seated, side view), root at its bottom centre, plus borrowed arms and the shared faces.
export function makeRoommateRound(ctx, { seed = 0, scale = 1, green = greenVariant(3), res = 512 } = {}) {
  return buildRig(ctx, { name: 'round', seed, scale, green, res, faces: FACES, parts: [
    { name: 'body', from: R('round'), size: [0.08, 0.075], pivot: [0.5, 1], at: [0, 0] },
    { name: 'arm_l', from: G('arm_l'), parent: 'body', reach: 0.03, at: [0.010, 0.040], z: -0.004 },
    { name: 'eyes', from: null, parent: 'body', at: [0.014, 0.063], z: 0.002 },
    { name: 'mouth', from: null, parent: 'body', at: [0.030, 0.052], z: 0.002 },
    { name: 'arm_r', from: G('arm_r'), parent: 'body', reach: 0.03, at: [0.010, 0.040], z: 0.008 },
  ] });
}
