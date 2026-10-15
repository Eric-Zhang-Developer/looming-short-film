// node evidence/contract-audio/linear_check.mjs — after a full `node tools/mix.mjs`.
// Shows the master path is one fixed gain: fits g by least squares (mix.wav ≈ g · premix.wav) and prints the
// worst residual in 16-bit LSB over the whole film. Then prints how much music sits under each lamp click
// (in mix LSB), which is what any click-to-click difference in mix.wav has to come from.
import { readFileSync } from 'node:fs';
import { CUES } from '../../src/audio/cues.js';
import { beat } from '../../src/timeline.js';
const SR = 48000, o = new URL('../../out/audio/', import.meta.url);
const f32 = (p) => { const b = readFileSync(new URL(p, o)); return (i) => b.readFloatLE(44 + i * 8); };
const m = readFileSync(new URL('mix.wav', o)), d = m.indexOf('data') + 8, mix = (i) => m.readInt16LE(d + i * 4) / 32768;
const pre = f32('premix.wav'), mus = f32('stems/music.wav'), n = (m.length - d) / 4;
let xy = 0, xx = 0;
for (let i = 0; i < n; i++) { xy += pre(i) * mix(i); xx += pre(i) ** 2; }
const g = xy / xx;
let worst = 0;
for (let i = 0; i < n; i++) worst = Math.max(worst, Math.abs(mix(i) - g * pre(i)) * 32768);
console.log(`gain ${g.toFixed(6)} (${(20 * Math.log10(g)).toFixed(3)} dB); max |mix - g·premix| = ${worst.toFixed(2)} LSB over ${n} samples`);
for (const c of CUES.filter((c) => c.sound === 'lampClick')) {
  const i0 = Math.round((beat(c.beat) + (c.offset ?? 0)) * SR);
  let pk = 0; for (let i = i0; i < i0 + 14400; i++) pk = Math.max(pk, Math.abs(mus(i)) * g * 32768);
  console.log(`${c.beat.padEnd(18)} music under the click: peak ${pk.toFixed(2)} LSB`);
}
