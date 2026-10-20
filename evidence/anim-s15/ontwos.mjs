// node evidence/anim-s15/ontwos.mjs → ontwos.txt: every film frame f (t = f/24), core onTwos(tLocal) vs the drawing floor((f − start·24) / 2).
import { onTwos } from '../../src/core/ease.js';
import { SHOTS, shotAt } from '../../src/timeline.js';
let bad = [], n = 0;
for (let f = 0; f < 180 * 24; f++) {
  const t = f / 24, { shot, tLocal } = shotAt(t), got = Math.round(onTwos(tLocal) * 12), want = Math.floor((f - shot.start * 24) / 2);
  n++; if (got !== want) bad.push(`${shot.id} frame ${f} t=${t} tLocal=${tLocal} → drawing ${got}, expected ${want}`);
}
console.log(`${bad.length} of ${n} frames land on the wrong drawing`); console.log(bad.slice(0, 12).join('\n'));
const s15 = bad.filter((b) => b.startsWith('s15')); console.log(`s15: ${s15.length}`); console.log(s15.slice(0, 6).join('\n'));
