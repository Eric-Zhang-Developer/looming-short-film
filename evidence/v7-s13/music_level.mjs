// node evidence/v7-s13/music_level.mjs out/audio/stems/music.wav 121 137 0.5 > evidence/v7-s13/music_level.txt: RMS and peak per window of a float32 stereo WAV (ZERO = digital silence)
import { readFileSync } from 'node:fs';
const [f, a, b, st] = process.argv.slice(2);
const buf = readFileSync(f), SR = 48000;
const L = (i) => buf.readFloatLE(44 + i * 8);
const out = [];
for (let t = +a; t < +b - 1e-9; t += +st) {
  let s = 0, pk = 0; const i0 = Math.round(t * SR), n = Math.round(+st * SR);
  for (let i = i0; i < i0 + n; i++) { const v = L(i); s += v * v; pk = Math.max(pk, Math.abs(v)); }
  out.push(`${t.toFixed(2)} ${(10 * Math.log10(s / n + 1e-30)).toFixed(1)} dB  peak ${pk === 0 ? 'ZERO' : (20 * Math.log10(pk)).toFixed(1)}`);
}
console.log(out.join('\n'));
