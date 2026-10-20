// s22 · Card B (docs/shots/s22.md, v9-beats §1): how it was made, the code's address, and smaller, the third-party audio.
// A hard cut, a card tap; the director's strings, character for character (a long line breaks after a " ·").
import { card, block } from './s19.ts';
import type { ShotCtx } from '../film.ts';

export async function build(ctx: ShotCtx) {
  const c = await card(ctx, 's22', (g, W, H) => block(g, W, H, [
    ['Every frame drawn in code (three.js) · score and sound synthesized in code · surfaces painted with Codex image generation · code written with Claude', 64, 0.8],
    ['github.com/Eric-Zhang-Developer/looming-short-film', 60, 1.1],
    ['Counter-Strike 2 audio © Valve · Minecraft audio © Mojang · Reels audio © its creators', 42, 0],
  ]));
  return { update: c.update };
}
