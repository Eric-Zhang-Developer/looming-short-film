// node tools/mix.ts [--range=a:b]
// Renders CUES (by beat name) and the score (src/audio/score.ts) onto the timeline, writes
// out/audio/stems/{music,foley,ambience}.wav and out/audio/mix.wav normalized to -16 LUFS / -4 dBTP (snd-g4's brief)
// with ffmpeg loudnorm (two-pass, linear; the full mix throws if loudnorm falls back to dynamic, or if the result
// misses -16 ±1 LUFS or goes over -4 dBTP), then prints the mix's measured LUFS and true peak (ebur128).
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { beat, DURATION } from '../src/timeline.ts';
import { seedOf } from '../src/core/rng.ts';
import { SR, mixInto } from '../src/audio/synth.ts';
import { renderScore } from '../src/audio/score.ts';
import { FOLEY } from '../src/audio/foley.ts';
import { CUES } from '../src/audio/cues.ts';
import { writeWav } from '../src/audio/wav.ts';

// Music bus: fixed makeup gain into a sample-peak limiter (no RNG, no state beyond its 2 ms attack / 80 ms
// release). It lifts the score so the premix peak-to-loudness ratio fits linear loudnorm, while the music
// still peaks below the lamp click, the loudest transient. It touches only the music stem. snd-g4 raised the makeup
// 5 → 7.5 dB: the brief's -16 LUFS / -4 dBTP allows a premix PLR of 11.5 dB, and the 3:15 cut measured 12.7 at 5 dB
// (7 dB gave 11.55, still over; 7.5 gives 11.24).
// snd-v4: the v4 cut trades G4's 12 s of full groove (s07-s08) for the quiet climax, and the premix PLR rose to 12.8 dB.
// The true peak is the lamp click (measured: -4.8 dBTP at 40.5 and 74.0, every other 10 s span lower), so the fix is the
// click's level against the film, not the music's against the foley: the click's cue gain went 0.8 → 0.6 (cues.ts) and this
// ceiling moved down with it, to just under the click's new peak (-7.15 dBFS). The makeup stays 7.5, so music and foley
// keep G4's balance. Measured: PLR 11.3 dB, linear. (Raising the makeup to 8.5 also passed, at +1 dB of music over foley.)
const MUSIC_MAKEUP_DB = 7.5, MUSIC_CEIL_DB = -7.6;
function limit(x: Float32Array<ArrayBuffer>, makeupDb: number, lim: number, att = 0.002, rel = 0.08): Float32Array<ArrayBuffer> {
  const n = x.length, g = new Float64Array(n), k = 10 ** (makeupDb / 20);
  for (let i = 0; i < n; i++) g[i] = Math.min(1, lim / (Math.abs(x[i] * k) || 1e-30));           // gain each sample needs
  for (let i = 1; i < n; i++) g[i] = Math.min(g[i], g[i - 1] + (1 - g[i - 1]) / (rel * SR));      // slow release
  for (let i = n - 2; i >= 0; i--) g[i] = Math.min(g[i], g[i + 1] + (1 - g[i + 1]) / (att * SR)); // ramp down ahead of peaks
  return x.map((v, i) => v * k * g[i]) as Float32Array<ArrayBuffer>;           // both passes only lower g, so no sample exceeds the ceiling
}

const arg = process.argv.find((a) => a.startsWith('--range='));
const [a, b] = arg ? arg.slice(8).split(':').map(Number) : [0, DURATION];
if (!(b > a)) throw new Error(`bad --range: ${arg}`);

const n = Math.round((b - a) * SR);
const stems = { music: new Float32Array(n), foley: new Float32Array(n), ambience: new Float32Array(n) };

// v7, third-party audio (s07's reels, the laptop's CS2; cues.ts): a window of a clip, decoded mono at SR through a phone speaker's band,
// levelled to RMS 1 (the cue's gain sets the level) with 5 ms edges so the hard cuts don't click. The clips are
// gitignored: without one, its cue stays silent and the mix says so.
const CLIP_DIR = fileURLToPath(new URL('../assets/raw/reels/', import.meta.url));
function clip(file: string, inSec: number, dur: number): Float32Array {
  const path = `${CLIP_DIR}${file}.mp3`;
  if (!existsSync(path)) { console.warn(`clip ${file}.mp3 missing from assets/raw/reels/: its cue is silent`); return new Float32Array(0); }
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-ss', `${inSec}`, '-t', `${dur}`, '-i', path,
    '-af', 'highpass=f=350,lowpass=f=4500', '-ac', '1', '-ar', `${SR}`, '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length >> 2).slice();
  const rms = Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length) || 1, edge = Math.round(0.005 * SR);
  return x.map((v, i) => (v / rms) * Math.min(1, i / edge, (x.length - 1 - i) / edge));
}

for (const c of CUES) {                          // mixInto clips to the range, so cues outside it add nothing
  const at = beat(c.beat) + (c.offset ?? 0);
  const dur = c.dur ?? (c.until ? beat(c.until) - at : undefined);
  const src = c.sound === 'clip' ? clip(c.file!, c.in!, dur!) : FOLEY[c.sound](c.seed ?? seedOf(c.sound), dur);
  mixInto(stems[c.stem ?? 'foley'], src, at - a, c.gain);
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
const click = CUES.find((c) => c.sound === 'lampClick')!;
const clickPeak = FOLEY.lampClick(click.seed ?? seedOf('lampClick')).reduce((m, v) => Math.max(m, Math.abs(v)), 0) * click.gain;
sum = limit(sum, 0, clickPeak);
// The fade (doc 05, s18): everything fades with the picture over 3:14-3:15 to digital silence at 195.0.
for (let i = 0; i < n; i++) { const t = a + i / SR; if (t > DURATION - 1) sum[i] *= Math.max(0, DURATION - t); }
writeWav(`${dir}/premix.wav`, [sum, sum]);

const ff = (args: string[]): string => spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8' }).stderr;
const lastJson = (s: string) => JSON.parse(s.slice(s.lastIndexOf('{'), s.lastIndexOf('}') + 1));
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
const I = meas.match(/I:\s+(-?[\d.]+|-inf) LUFS/g)!.pop()!.match(/(-?[\d.]+|-inf)/)![0];
const TP = meas.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/g)!.pop()!.match(/(-?[\d.]+|-inf)/)![0];

if (m2.normalization_type !== 'linear' && !arg) throw new Error(`loudnorm fell back to ${m2.normalization_type}: premix PLR ${(m1.input_tp - m1.input_i).toFixed(2)} dB > 11.5 (TP -4.5 minus I -16), so click identity would break. Raise MUSIC_MAKEUP_DB or lower foley peaks.`);
console.log(`range ${a}:${b} s  premix ${m1.input_i} LUFS, ${m1.input_tp} dBTP  →  loudnorm ${m2.normalization_type}`);
console.log(`mix.wav  integrated ${I} LUFS  true peak ${TP} dBTP (ebur128)  /  ${m2.output_i} LUFS, ${m2.output_tp} dBTP (loudnorm pass 2)  target -16 ±1 LUFS, ≤ -4 dBTP`);
if (!arg && !(Math.abs(+I + 16) <= 1 && +TP <= -4)) throw new Error(`mix.wav misses the target: ${I} LUFS, ${TP} dBTP`);
console.log(execFileSync('shasum', ['-a', '256', `${dir}/mix.wav`], { encoding: 'utf8' }).trim());
