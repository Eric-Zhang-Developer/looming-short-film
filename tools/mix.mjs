// node tools/mix.mjs [--range=a:b]
// Renders CUES (by beat name) and the score (src/audio/score.js) onto the timeline, writes
// out/audio/stems/{music,foley,ambience}.wav and out/audio/mix.wav normalized to -16 LUFS / -4 dBTP (snd-g4's brief)
// with ffmpeg loudnorm (two-pass, linear; the full mix throws if loudnorm falls back to dynamic, or if the result
// misses -16 ±1 LUFS or goes over -4 dBTP), then prints the mix's measured LUFS and true peak (ebur128).
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

// Music bus: fixed makeup gain into a sample-peak limiter (no RNG, no state beyond its 2 ms attack / 80 ms
// release). It lifts the score so the premix peak-to-loudness ratio fits linear loudnorm, while the music
// still peaks below the lamp click, the loudest transient. It touches only the music stem. snd-g4 raised the makeup
// 5 → 7.5 dB: the brief's -16 LUFS / -4 dBTP allows a premix PLR of 11.5 dB, and the 3:15 cut measured 12.7 at 5 dB
// (7 dB gave 11.55, still over; 7.5 gives 11.24).
const MUSIC_MAKEUP_DB = 7.5, MUSIC_CEIL_DB = -6;
function limit(x, makeupDb, lim, att = 0.002, rel = 0.08) {
  const n = x.length, g = new Float64Array(n), k = 10 ** (makeupDb / 20);
  for (let i = 0; i < n; i++) g[i] = Math.min(1, lim / (Math.abs(x[i] * k) || 1e-30));           // gain each sample needs
  for (let i = 1; i < n; i++) g[i] = Math.min(g[i], g[i - 1] + (1 - g[i - 1]) / (rel * SR));      // slow release
  for (let i = n - 2; i >= 0; i--) g[i] = Math.min(g[i], g[i + 1] + (1 - g[i + 1]) / (att * SR)); // ramp down ahead of peaks
  return x.map((v, i) => v * k * g[i]);           // both passes only lower g, so no sample exceeds the ceiling
}

const arg = process.argv.find((a) => a.startsWith('--range='));
const [a, b] = arg ? arg.slice(8).split(':').map(Number) : [0, DURATION];
if (!(b > a)) throw new Error(`bad --range: ${arg}`);

const n = Math.round((b - a) * SR);
const stems = { music: new Float32Array(n), foley: new Float32Array(n), ambience: new Float32Array(n) };

for (const c of CUES) {                          // mixInto clips to the range, so cues outside it add nothing
  const at = beat(c.beat) + (c.offset ?? 0);
  const dur = c.dur ?? (c.until ? beat(c.until) - at : undefined);
  mixInto(stems[c.stem ?? 'foley'], FOLEY[c.sound](c.seed ?? seedOf(c.sound), dur), at - a, c.gain);
}

mixInto(stems.music, renderScore(b), -a);       // score is rendered from 0 so its notes ring into the range
stems.music = limit(stems.music, MUSIC_MAKEUP_DB, 10 ** (MUSIC_CEIL_DB / 20));

const dir = fileURLToPath(new URL('../out/audio', import.meta.url));
mkdirSync(`${dir}/stems`, { recursive: true });
for (const [name, s] of Object.entries(stems)) writeWav(`${dir}/stems/${name}.wav`, [s, s]);
let sum = new Float32Array(n);
for (const s of Object.values(stems)) for (let i = 0; i < n; i++) sum[i] += s[i];
// Doc 05: the lamp click is the film's loudest transient. A cue that lands on the music at its ceiling can sum past
// it (s02's landing drip on the motif, s07's bracket snap on the groove), and the brief's -4 dBTP at -16 LUFS leaves a
// 12 dB peak-to-loudness ratio, so the premix goes through the same limiter with its ceiling at the click's own peak:
// it only ever touches what would beat the click, and the clicks themselves pass at gain 1 (the selftest checks them).
// Nothing else sounds under a click (beds and music stop for it), so its peak is the buffer's times its cue gain.
const click = CUES.find((c) => c.sound === 'lampClick');
const clickPeak = FOLEY.lampClick(click.seed ?? seedOf('lampClick')).reduce((m, v) => Math.max(m, Math.abs(v)), 0) * click.gain;
sum = limit(sum, 0, clickPeak);
// The fade (doc 05, s18): everything fades with the picture over 3:14-3:15 to digital silence at 195.0.
for (let i = 0; i < n; i++) { const t = a + i / SR; if (t > DURATION - 1) sum[i] *= Math.max(0, DURATION - t); }
writeWav(`${dir}/premix.wav`, [sum, sum]);

const ff = (args) => spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8' }).stderr;
const lastJson = (s) => JSON.parse(s.slice(s.lastIndexOf('{'), s.lastIndexOf('}') + 1));
// Linear loudnorm is one fixed gain for the whole file, so identical cues stay identical in mix.wav (dynamic mode's
// gain follows the neighbouring music). loudnorm only goes linear if measured TP + gain <= TP and measured LRA <= LRA.
// LRA=50 (its max) turns that LRA gate off: doc 05 sets no LRA target, and squashing the film's quiet shots to hit
// one would cost more than it buys.
// TP -4.5 keeps 0.5 dB of headroom on the -4 dBTP spec.
const LN = 'loudnorm=I=-16:TP=-4.5:LRA=50';

const m1 = lastJson(ff(['-i', `${dir}/premix.wav`, '-af', `${LN}:print_format=json`, '-f', 'null', '-']));
if (!Number.isFinite(+m1.input_i)) throw new Error(`premix is silent in ${a}:${b} (input_i ${m1.input_i}); nothing to normalize`);
const p2 = `${LN}:measured_I=${m1.input_i}:measured_TP=${m1.input_tp}:measured_LRA=${m1.input_lra}` +
  `:measured_thresh=${m1.input_thresh}:offset=${m1.target_offset}:linear=true:print_format=json,aresample=${SR}`;
const m2 = lastJson(ff(['-i', `${dir}/premix.wav`, '-af', p2, '-c:a', 'pcm_s16le', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-y', `${dir}/mix.wav`]));

const meas = ff(['-i', `${dir}/mix.wav`, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
const I = meas.match(/I:\s+(-?[\d.]+|-inf) LUFS/g).pop().match(/(-?[\d.]+|-inf)/)[0];
const TP = meas.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/g).pop().match(/(-?[\d.]+|-inf)/)[0];

if (m2.normalization_type !== 'linear' && !arg) throw new Error(`loudnorm fell back to ${m2.normalization_type}: premix PLR ${(m1.input_tp - m1.input_i).toFixed(2)} dB > 11.5 (TP -4.5 minus I -16), so click identity would break. Raise MUSIC_MAKEUP_DB or lower foley peaks.`);
console.log(`range ${a}:${b} s  premix ${m1.input_i} LUFS, ${m1.input_tp} dBTP  →  loudnorm ${m2.normalization_type}`);
console.log(`mix.wav  integrated ${I} LUFS  true peak ${TP} dBTP (ebur128)  /  ${m2.output_i} LUFS, ${m2.output_tp} dBTP (loudnorm pass 2)  target -16 ±1 LUFS, ≤ -4 dBTP`);
if (!arg && !(Math.abs(+I + 16) <= 1 && +TP <= -4)) throw new Error(`mix.wav misses the target: ${I} LUFS, ${TP} dBTP`);
console.log(execFileSync('shasum', ['-a', '256', `${dir}/mix.wav`], { encoding: 'utf8' }).trim());
