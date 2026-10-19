// @ts-check
// The roommates (s05), rig-v4: two gators built from the Student's own side rig (gator_sheet), because in a film where
// everyone is a gator a heron and a bear read as a mistake (director, 2026-10-17). They differ from him, and from each
// other, by hoodie colour, green and proportions, so they read as three different gators at a glance:
//   tall: lanky, a blue hoodie (navy lifted toward the phone cyan so it reads as blue, not charcoal), a yellower green, long body and legs.
//   round: stout, a kraft hoodie, a darker green, a wide short body.
// roommates_sheet stays frozen but is no longer used. Both face +x and take every side pose (specPose, s15 convention).
// Root at the hip, as the Student. s05's numbers are kept: HERON_STAND_Y is the tall one's standing hip height, and the
// round one's root sits ROUND_DROP below its hip so s05's `SEAT − 0.03` placement still puts him on the couch.
import * as THREE from 'three';
import { PALETTE } from '../core/palette.js';
import { buildRig, sideParts, greenVariant, HIP } from './gator.js';

const FACES = { eyes: 'open', mouth: 'neutral' };
const mix = (a, b, k) => '#' + new THREE.Color(PALETTE[a]).lerp(new THREE.Color(PALETTE[b]), k).getHexString();

// body: [x, y] stretch of the hoodie about the hip (every joint on the body moves with it), leg: the boots' length, arm: reach,
// head: the head joint's scale (face, brow and throat with it).
const BUILD = {
  tall: { scale: 1.04, body: [0.72, 1.3], leg: 1.8, arm: 1.12, head: 0.9, green: greenVariant(1), hoodie: mix('navy', 'phone', 0.4) },
  round: { scale: 0.97, body: [1.35, 0.88], leg: 0.8, arm: 0.92, head: 0.96, green: greenVariant(3), hoodie: mix('kraft', 'cream', 0.1) },
};
export const TALL_STAND_Y = HIP * BUILD.tall.leg * BUILD.tall.scale;   // hip height with the boots straight down on the floor
export const ROUND_STAND_Y = HIP * BUILD.round.leg * BUILD.round.scale;
export const HERON_STAND_Y = TALL_STAND_Y;                              // the name s05 imports (from the v3 heron)
export const ROUND_DROP = 0.038;  // the round one's hip above his root: s05 sets the root 0.03 under the seat, so the hip is 8 mm over it

function proportion(parts, { body: [bx, by], leg, arm }) {
  return parts.map((p) => {
    if (p.name === 'body') return { ...p, size: [p.size[0] * bx, p.size[1] * by] };
    if (p.parent !== 'body') return p;
    const q = { ...p, at: [p.at[0] * bx, p.at[1] * by] };
    if (p.name.startsWith('leg_')) q.size = [p.size[0], p.size[1] * leg];
    if (p.reach) q.reach = p.reach * arm;
    return q;
  });
}

/**
 * @param {import('../assets.js').AssetCtx} ctx
 * @param {string} who
 * @param {{ seed?: number, scale?: number, green?: string, hoodie?: string, res?: number, root?: number[] }} opts
 */
async function makeRoommate(ctx, who, { seed = 0, scale = 1, green, hoodie, res = 512, root = [0, 0] }) {
  const b = BUILD[who], g = green ?? b.green;
  const parts = proportion(sideParts('gator_sheet', { throat: true, brow: true, green: g }), b);
  parts[0] = { ...parts[0], at: root };
  const rig = await buildRig(ctx, { name: who, seed, scale: scale * b.scale, green: g, hoodie: hoodie ?? b.hoodie, res, parts, faces: FACES });
  rig.joints.head.scale.setScalar(b.head);
  return rig;
}

// Parts: body (root at the hip), leg_l, leg_r, tail, arm_l, pocket, head, snout, throat, jaw, eyes, brow, mouth, arm_r.
export const makeRoommateTall = (ctx, opts = {}) => makeRoommate(ctx, 'tall', opts);
// The same parts; the hip is ROUND_DROP × scale above the root (s05's couch placement).
export const makeRoommateRound = (ctx, opts = {}) => makeRoommate(ctx, 'round', { ...opts, root: [0, ROUND_DROP / BUILD.round.scale] });
