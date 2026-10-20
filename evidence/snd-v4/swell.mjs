// node evidence/snd-v4/swell.mjs [--in=out/audio/mix.wav] [--from=60] [--to=110] > evidence/snd-v4/swell.txt
// Short-term (3 s) and momentary (400 ms) loudness from ffmpeg's ebur128 (the same meter as loudness.txt), every 0.5 s
// across the climax, with the beat that lands there and a bar per LU. Also the film's own max S outside the window.
import { spawnSync } from 'node:child_process';
import { SHOTS } from '../../src/timeline.js';

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d;
const file = arg('in', 'out/audio/mix.wav'), from = +arg('from', 60), to = +arg('to', 110);
const log = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-loglevel', 'verbose', '-i', file, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
const frames = [...log.matchAll(/t: ([\d.]+)\s+TARGET:\S+ LUFS\s+M:\s*(-?[\d.]+) S:\s*(-?[\d.]+)/g)].map((m) => [+m[1], +m[2], +m[3]]);
const at = (t) => frames.reduce((b, f) => (Math.abs(f[0] - t) < Math.abs(b[0] - t) ? f : b));
const beats = SHOTS.flatMap((s) => [[s.start, `[${s.id}]`], ...Object.entries(s.beats).map(([k, v]) => [s.start + v, k])]);
const label = (t) => beats.filter(([b]) => b >= t - 0.25 && b < t + 0.25).map(([, k]) => k).join(' ');
const bar = (v) => '#'.repeat(Math.max(0, Math.round(v + 50)));   // one # per LU above -50 LUFS
console.log(`# ${file}: ebur128 every 0.5 s, ${from}-${to} s. S = short-term (3 s window ending at t), M = momentary (0.4 s). Bar: one # per LU above -50 LUFS (of S).`);
console.log('#     t       M       S');
for (let t = from; t <= to + 1e-9; t += 0.5) { const [, M, S] = at(t); console.log(`${t.toFixed(1).padStart(7)}  ${M.toFixed(1).padStart(6)}  ${S.toFixed(1).padStart(6)}  ${bar(S).padEnd(42)} ${label(t)}`); }
const outside = frames.filter(([t]) => t < from || t > to);
const top = (fs) => fs.reduce((b, f) => (f[2] > b[2] ? f : b), [NaN, 0, -Infinity]);
const inside = top(frames.filter(([t]) => t >= from && t <= to)), maxS = top(outside);
console.log(`# max S inside ${from}-${to}: ${inside[2].toFixed(1)} LUFS at ${inside[0].toFixed(1)} s` + (outside.length ? `; max S in the rest of the film: ${maxS[2].toFixed(1)} LUFS at ${maxS[0].toFixed(1)} s` : ''));
console.log(`# integrated: ${log.match(/I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold/)?.[1]} LUFS`);
