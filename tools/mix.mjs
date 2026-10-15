// node tools/mix.mjs [--range=a:b]
// Renders CUES (by beat name) and the score (src/audio/score.js) onto the timeline, writes
// out/audio/stems/{music,foley,ambience}.wav and out/audio/mix.wav normalized to -14 LUFS / -1 dBTP
// with ffmpeg loudnorm (two-pass), then prints the mix's measured LUFS and true peak (ebur128).
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { beat, DURATION } from '../src/timeline.js';
import { seedOf } from '../src/core/rng.js';
import { SR, mixInto } from '../src/audio/synth.js';
import { renderScore } from '../src/audio/score.js';
import { FOLEY } from '../src/audio/foley.js';
import { CUES } from '../src/audio/cues.js';
import { writeWav } from '../src/audio/wav.js';

const arg = process.argv.find((a) => a.startsWith('--range='));
const [a, b] = arg ? arg.slice(8).split(':').map(Number) : [0, DURATION];
if (!(b > a)) throw new Error(`bad --range: ${arg}`);

const n = Math.round((b - a) * SR);
const stems = { music: new Float32Array(n), foley: new Float32Array(n), ambience: new Float32Array(n) };

for (const c of CUES) {
  const t = beat(c.beat) - a;
  if (t >= b - a || t < -30) continue;           // ponytail: assumes no foley longer than 30 s
  mixInto(stems[c.stem ?? 'foley'], FOLEY[c.sound](c.seed ?? seedOf(c.sound)), t, c.gain);
}

mixInto(stems.music, renderScore(b), -a);       // score is rendered from 0 so its notes ring into the range

const dir = fileURLToPath(new URL('../out/audio', import.meta.url));
mkdirSync(`${dir}/stems`, { recursive: true });
for (const [name, s] of Object.entries(stems)) writeWav(`${dir}/stems/${name}.wav`, [s, s]);
const sum = new Float32Array(n);
for (const s of Object.values(stems)) for (let i = 0; i < n; i++) sum[i] += s[i];
writeWav(`${dir}/premix.wav`, [sum, sum]);

const ff = (args) => spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8' }).stderr;
const lastJson = (s) => JSON.parse(s.slice(s.lastIndexOf('{'), s.lastIndexOf('}') + 1));
const LN = 'loudnorm=I=-14:TP=-1.5:LRA=11';   // TP -1.5, not -1: the 192k→48k resample after loudnorm let -1.0 become -0.8 dBTP

const m1 = lastJson(ff(['-i', `${dir}/premix.wav`, '-af', `${LN}:print_format=json`, '-f', 'null', '-']));
if (!Number.isFinite(+m1.input_i)) throw new Error(`premix is silent in ${a}:${b} (input_i ${m1.input_i}); nothing to normalize`);
const p2 = `${LN}:measured_I=${m1.input_i}:measured_TP=${m1.input_tp}:measured_LRA=${m1.input_lra}` +
  `:measured_thresh=${m1.input_thresh}:offset=${m1.target_offset}:linear=true:print_format=json,aresample=${SR}`;
const m2 = lastJson(ff(['-i', `${dir}/premix.wav`, '-af', p2, '-c:a', 'pcm_s16le', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-y', `${dir}/mix.wav`]));

const meas = ff(['-i', `${dir}/mix.wav`, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
const I = meas.match(/I:\s+(-?[\d.]+|-inf) LUFS/g).pop().match(/(-?[\d.]+|-inf)/)[0];
const TP = meas.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/g).pop().match(/(-?[\d.]+|-inf)/)[0];

console.log(`range ${a}:${b} s  premix ${m1.input_i} LUFS, ${m1.input_tp} dBTP  →  loudnorm ${m2.normalization_type}`);
console.log(`mix.wav  integrated ${I} LUFS  true peak ${TP} dBTP (ebur128)  /  ${m2.output_i} LUFS, ${m2.output_tp} dBTP (loudnorm pass 2)  target -14 LUFS, ≤ -1 dBTP`);
console.log(execFileSync('shasum', ['-a', '256', `${dir}/mix.wav`], { encoding: 'utf8' }).trim());
