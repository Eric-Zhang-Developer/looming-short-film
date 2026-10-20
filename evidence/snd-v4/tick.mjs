// node evidence/snd-v4/tick.mjs > evidence/snd-v4/tick.txt — is s08's lone tick audible on a phone? Measured, not heard.
// For each tick: its sample peak in mix.wav (dBFS) and how far it stands over the floor between ticks (RMS of t+0.4…t+0.9:
// room tone, paper boil, his breath), full band and through a 500 Hz high-pass (a phone speaker's bass roll-off, roughly).
import { readFileSync } from 'node:fs';
import { SR, highpass } from '../../src/audio/synth.js';

const b = readFileSync('out/audio/mix.wav'), d = b.indexOf('data') + 8, n = (b.length - d) / 4;
const L = new Float32Array(n).map((_, i) => b.readInt16LE(d + i * 4) / 32768);
const H = highpass(highpass(L, 500), 500);
const db = (v) => (20 * Math.log10(v)).toFixed(1).padStart(6);
const stat = (x, t0, t1) => { let p = 0, e = 0; const a = Math.round(t0 * SR), z = Math.round(t1 * SR); for (let i = a; i < z; i++) { p = Math.max(p, Math.abs(x[i])); e += x[i] ** 2; } return [p, Math.sqrt(e / (z - a))]; };
const row = (label, t) => {
  const [p] = stat(L, t - 0.005, t + 0.1), [, f] = stat(L, t + 0.4, t + 0.9), [ph] = stat(H, t - 0.005, t + 0.1), [, fh] = stat(H, t + 0.4, t + 0.9);
  return `${label.padEnd(22)} ${t.toFixed(1).padStart(6)}  peak ${db(p)}  floor ${db(f)}  over ${(20 * Math.log10(p / f)).toFixed(1).padStart(5)} dB   | >500 Hz: peak ${db(ph)}  floor ${db(fh)}  over ${(20 * Math.log10(ph / fh)).toFixed(1).padStart(5)} dB`;
};
console.log('# mix.wav (16-bit, after loudnorm), dBFS. "over" = tick peak / floor RMS between ticks.');
for (let t = 60; t <= 69; t++) console.log(row(t < 62 ? 's08 C1 clockTick' : t < 67 ? 's08 C2 clockTickMid' : 's08 C3 clockTickFar', t));
for (const t of [9, 17, 176]) console.log(row(t < 100 ? 's02 W, -30 dB' : 's18 W, -30 dB', t));
for (const t of [158, 160]) console.log(row('s17b exam room', t));
console.log(row('lamp click (s06 on)', 40.5));
// The faint ticks (s02, s18) sit under other sounds, so their "peak" above is whatever else is loudest there. Their own peak:
const gain = 10 ** ((-15.92 - -18.44) / 20);   // loudnorm's linear gain, from mix_run1.txt (output I minus premix I)
console.log(`# a -30 dB tick's own peak in mix.wav: ${db(0.9 * 10 ** (-30 / 20) * gain)} dBFS (buffer peak 0.9 x cue gain x loudnorm's +${(20 * Math.log10(gain)).toFixed(2)} dB); the s02/s18/s17b rows' peaks are other sounds.`);
