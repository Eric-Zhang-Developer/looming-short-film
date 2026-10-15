// node evidence/snd-foley/check.mjs: renders every FOLEY sound twice with seedOf(name), checks the two
// renders are sample-identical and finite, prints a hash/level table, writes out/audio/solo/<name>.wav
// (50 ms of silence each side) and a spectrogram per sound, then tiles them into spectra.jpg (alphabetical).
import { createHash } from 'node:crypto';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FOLEY } from '../../src/audio/foley.js';
import { SR } from '../../src/audio/synth.js';
import { writeWav } from '../../src/audio/wav.js';
import { seedOf } from '../../src/core/rng.js';

const root = fileURLToPath(new URL('../../', import.meta.url)), here = `${root}evidence/snd-foley`, solo = `${root}out/audio/solo`;
mkdirSync(solo, { recursive: true }); rmSync(`${here}/spec`, { recursive: true, force: true }); mkdirSync(`${here}/spec`);
const sha = (x) => createHash('sha256').update(Buffer.from(x.buffer, x.byteOffset, x.byteLength)).digest('hex');
const db = (v) => (20 * Math.log10(v)).toFixed(1).padStart(6);
let fail = 0;
console.log('name                 secs   sha256 (run 1)     same  finite  peak dBFS  rms dBFS  dc/peak   edge(first,last)');
for (const name of Object.keys(FOLEY).sort()) {
  const a = FOLEY[name](seedOf(name)), b = FOLEY[name](seedOf(name));
  const same = sha(a) === sha(b), finite = a.every(Number.isFinite);
  let peak = 0, sum = 0, sq = 0;
  for (const v of a) { peak = Math.max(peak, Math.abs(v)); sum += v; sq += v * v; }
  const dc = sum / a.length / peak, edge = Math.max(Math.abs(a[0]), Math.abs(a[a.length - 1])) / peak;
  const bad = !same || !finite || peak === 0 || peak >= 1 || Math.abs(dc) > 0.01 || edge > 0.01;
  if (bad) fail++;
  console.log(`${name.padEnd(20)} ${(a.length / SR).toFixed(2).padStart(5)}  ${sha(a).slice(0, 16)}…  ${same ? 'yes ' : 'NO  '}  ${finite ? 'yes   ' : 'NO    '}  ${db(peak)}    ${db(Math.sqrt(sq / a.length))}   ${dc.toExponential(1).padStart(8)}  ${edge.toFixed(4)}${bad ? '  FAIL' : ''}`);
  const y = new Float32Array(a.length + SR / 10); y.set(a, SR / 20);
  writeWav(`${solo}/${name}.wav`, [y]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${solo}/${name}.wav`, '-lavfi', 'showspectrumpic=s=480x256:legend=1:scale=log:fscale=lin:stop=16000', `${here}/spec/${name}.png`]);
}
execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', `${here}/spec/*.png`, '-vf', 'tile=4x5:padding=4:color=white', '-frames:v', '1', '-q:v', '3', `${here}/spectra.jpg`]);
console.log(`\nsheet: evidence/snd-foley/spectra.jpg, tiles left→right, top→bottom in the alphabetical order above`);
console.log(fail ? `${fail} FAILED` : 'all deterministic, finite, |peak| < 1, |dc| < 1% of peak, edges < 1% of peak');
process.exit(fail ? 1 : 0);
