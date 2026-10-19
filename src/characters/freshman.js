// @ts-check
// The Freshman (s18): the Student's side rig rebuilt from freshman_sheet at 0.85×, with the oversized backpack
// behind and no hoodie pocket. Same part names and the same s15 convention, so every gator pose works on it.
import { buildRig, sideParts } from './gator.js';

/** @param {import('../assets.js').AssetCtx} ctx @param {{ seed?: number, scale?: number, green?: string, res?: number }} [opts] */
export function makeFreshman(ctx, { seed = 0, scale = 0.85, green, res = 512 } = {}) {
  return buildRig(ctx, { name: 'freshman', seed, scale, green, res, parts: sideParts('freshman_sheet', { pocket: false, backpack: true }),
    faces: { eyes: 'open', mouth: 'neutral' } });
}
