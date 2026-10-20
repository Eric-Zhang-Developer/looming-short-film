// node evidence/contract-timing/ontwos.mjs: drawing index per frame, old floor vs fixed onTwos, via the film's shotAt(t).tLocal.
import { onTwos } from '../../src/core/ease.js';
import { shotAt } from '../../src/timeline.js';
const old = (t) => Math.floor(t * 12) / 12, d = (f, tl) => Math.round(f(tl) * 12);
let film = { before: 0, after: 0 }, s15 = { before: 0, after: 0, changed: [] }, w = { before: 0, after: 0, changed: [] };
for (let f = 0; f < 4320; f++) {
  const { shot, tLocal } = shotAt(f / 24), want = Math.floor((f - shot.start * 24) / 2);
  const b = d(old, tLocal), a = d(onTwos, tLocal);
  if (b !== want) film.before++; if (a !== want) film.after++;
  if (shot.id === 's15') { if (b !== want) s15.before++; if (a !== want) s15.after++; }
  if (f >= 2400 && f <= 2424 && b !== a) w.changed.push(`f${f} t=${(f / 24).toFixed(3)} ${b}->${a}`);
  if (shot.id === 's15' && b !== a) s15.changed.push(f);
}
console.log(`film-wide frames on the wrong drawing: before ${film.before}, after ${film.after} (of 4320)`);
console.log(`s15 (t 100-114): before ${s15.before}, after ${s15.after}; frames whose drawing changes with the fix: ${s15.changed.length}`);
console.log(`s15 window t 100.0-101.0 (frames 2400-2424): ${w.changed.length} change, each one drawing later`);
console.log(w.changed.join('\n'));
