// node evidence/snd-g4/master_limiter.mjs out/audio — how hard the master safety limiter worked: premix vs the sum of the stems (pre-limiter), before the fade.
import { readFileSync } from 'node:fs';
const rd = (f) => { const b = readFileSync(f), n = (b.length - 44) / 8, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = b.readFloatLE(44 + i * 8); return x; };
const d = process.argv[2], P = rd(`${d}/premix.wav`), S = ['music', 'foley', 'ambience'].map((s) => rd(`${d}/stems/${s}.wav`));
let worst = 0, n = 0, wt = 0; const spans = new Set();
for (let i = 0; i < 194 * 48000; i++) { const s = S[0][i] + S[1][i] + S[2][i]; if (Math.abs(s) > 1e-4) { const gr = Math.abs(P[i] / s); if (gr < 0.9999) { n++; spans.add(Math.floor(i / 24000) / 2); if (20 * Math.log10(gr) < worst) { worst = 20 * Math.log10(gr); wt = i / 48000; } } } }
console.log(`master limiter active on ${n} samples (${(n / 48000).toFixed(3)} s), worst ${worst.toFixed(2)} dB at ${wt.toFixed(3)} s; half-second windows: ${[...spans].join(', ')}`);
