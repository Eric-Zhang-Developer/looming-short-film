// node evidence/snd-g4/solo.mjs — renders snd-g4's new foley one after another (0.4 s gaps) into out/audio/solo/g4_new.wav
// and prints where each sits and a few measurements, so the sounds can be checked by eye on a spectrogram
// (evidence/snd-g4/spectrogram.jpg) by an agent that cannot listen.
import { mkdirSync } from 'node:fs';
import { FOLEY, BLIND_CLACK } from '../../src/audio/foley.js';
import { SR, mixInto } from '../../src/audio/synth.js';
import { writeWav } from '../../src/audio/wav.js';
import { seedOf } from '../../src/core/rng.js';

const LIST = [['phoneBuzz'], ['gameBlip', 0], ['gameBlip', 9], ['gameBlip', 3], ['gameBlip', 103], ['gameBlip', 203], ['blindRattle'],
  ['penTap'], ['penStroke'], ['cough'], ['clockTick', null, 3], ['examHush', null, 4], ['paperSlide'], ['inkSoak'], ['markerScratch', null, 2]];
const bufs = LIST.map(([k, seed, dur]) => FOLEY[k](seed ?? seedOf(k), dur));
const out = new Float32Array(bufs.reduce((n, b) => n + b.length + 0.4 * SR, 0.2 * SR));
let t = 0.2;
const peak = (x) => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
// Time of the loudest 5 ms window: where the ear's "hit" is.
const hit = (x) => { let best = 0, at = 0; for (let i = 0; i + 240 < x.length; i += 120) { let e = 0; for (let j = i; j < i + 240; j++) e += x[j] * x[j]; if (e > best) { best = e; at = i; } } return at / SR; };
for (const [k, [name, seed, dur]] of bufs.map((b, i) => [i, LIST[i]])) {
  const b = bufs[k];
  console.log(`${t.toFixed(2).padStart(6)} s  ${(name + (seed != null ? ` seed ${seed}` : '')).padEnd(18)} ${(b.length / SR).toFixed(3)} s  peak ${peak(b).toFixed(3)}  loudest 5 ms at ${hit(b).toFixed(3)} s`);
  mixInto(out, b, t, Math.min(1, 0.5 / peak(b)));   // each shown at the same peak, so quiet beds are visible
  t += b.length / SR + 0.4;
}
console.log(`blindRattle: BLIND_CLACK ${BLIND_CLACK} s (the clack should be the loudest 5 ms)`);
// Ticks at whole seconds: the loudest 5 ms in each second of clockTick.
const ck = FOLEY.clockTick(seedOf('clockTick'), 3);
console.log('clockTick hits per second:', [0, 1, 2].map((s) => (s + hit(ck.slice(s * SR, (s + 1) * SR))).toFixed(3)).join(', '));
const dir = new URL('../../out/audio/solo/', import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
writeWav(`${dir}g4_new.wav`, [out]);
console.log(`wrote ${dir}g4_new.wav, ${(out.length / SR).toFixed(2)} s`);
