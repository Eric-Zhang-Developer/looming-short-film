// s20 · Seneca (docs/shots/s20.md, v9-beats §1). A fresh card on a hard cut: the director's quote, and under it the name.
// It holds and is read in silence apart from the piano's last chord ringing out (score.ts). The strings are the director's,
// character for character.
import { card, block } from './s19.ts';
import type { ShotCtx } from '../film.ts';

export async function build(ctx: ShotCtx) {
  const c = await card(ctx, 's20', (g, W, H) => block(g, W, H, [
    ['"We suffer more often in imagination than in reality."', 92, 0.7],
    ['Seneca', 72, 0],
  ]));
  return { update: c.update };
}
