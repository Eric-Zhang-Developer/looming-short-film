// s21 · Card A (docs/shots/s21.md, v9-beats §1): who made it, where to find him, what it was made for. A hard cut, a card
// tap; the director's strings, character for character.
import { card, block } from './s19.ts';
import type { ShotCtx } from '../film.ts';

export async function build(ctx: ShotCtx) {
  const c = await card(ctx, 's21', (g, W, H) => block(g, W, H, [
    ['A film by Eric Zhang', 112, 0.45],
    ['eric-zhang.dev · @ericz.exe', 68, 0.9],
    ['Made for the AI² Gator Create Competition 2026 · University of Florida', 56, 0],
  ]));
  return { update: c.update };
}
