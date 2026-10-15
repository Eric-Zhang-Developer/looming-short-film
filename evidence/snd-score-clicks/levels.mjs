// node evidence/snd-score-clicks/levels.mjs — music stem peak/RMS inside each click's own 0.3 s window, gated vs ungated score.
import { readFileSync } from 'node:fs';
import { beat } from '../../src/timeline.js';
import { SR } from '../../src/audio/synth.js';
const b = readFileSync(new URL('../../out/audio/stems/music.wav', import.meta.url));
const L = (i) => b.readFloatLE(44 + i * 8);
for (const k of ['lampClickHome', 'lampClickMarston', 'lampClickFreshman']) {
  const i0 = Math.round(beat(k) * SR); let pk = 0, ss = 0, nz = 0;
  for (let i = i0; i < i0 + 0.3 * SR; i++) { const v = L(i); pk = Math.max(pk, Math.abs(v)); ss += v * v; if (v !== 0) nz++; }
  console.log(`${k} @${beat(k)}s  window ${i0}..${i0 + 0.3 * SR}: peak ${pk}  rms ${Math.sqrt(ss / (0.3 * SR))}  nonzero samples ${nz}`);
}
