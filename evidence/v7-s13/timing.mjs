// node evidence/v7-s13/timing.mjs > evidence/v7-s13/timing.txt   (after node tools/mix.mjs)
// Every s13 shadow event (S13_DESKS in src/timeline.js, which src/shots/s13.js draws from) against the score notes and
// cues that start on the same frame (src/audio/score.js, cues.js), and the music stem's level jump there, measured in
// out/audio/stems/music.wav (RMS of its first difference, a crude high-pass so the sub and held chords don't mask the hammer, over the 40 ms after the event minus the 40 ms before it).
import { readFileSync } from 'node:fs';
import { beat, SHOTS, S13_DESKS } from '../../src/timeline.js';
import { SCORE } from '../../src/audio/score.js';
import { CUES } from '../../src/audio/cues.js';

const s13 = SHOTS.find((s) => s.id === 's13'), SR = 48000, EPS = 1e-6;
const wav = readFileSync(new URL('../../out/audio/stems/music.wav', import.meta.url));
const rms = (t0, t1) => { let s = 0; const a = Math.round(t0 * SR), b = Math.round(t1 * SR); for (let i = a; i < b; i++) s += (wav.readFloatLE(44 + i * 8) - wav.readFloatLE(36 + i * 8)) ** 2; return 10 * Math.log10(s / (b - a) + 1e-30); };
const name = (m) => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][Math.round(m) % 12] + (Math.floor(Math.round(m) / 12) - 1);
const notesAt = (t) => SCORE.filter((e) => Math.abs(beat(e.beat) + e.at - t) < EPS && ['piano', 'box'].includes(e.voice))
  .flatMap((e) => [e.midi].flat().map((m) => name(m) + (e.voice === 'box' ? ' (box)' : '')));
const cuesAt = (t) => CUES.filter((c) => Math.abs(beat(c.beat) + (c.offset ?? 0) - t) < EPS).map((c) => c.sound);

const rows = Object.entries(S13_DESKS).flatMap(([d, e]) => [['wake', e.wake], ['down', e.down]].map(([k, [b, o]]) => ({ d, k, b, o, t: beat(b) + o })))
  .sort((x, y) => x.t - y.t);
console.log(`s13 ${s13.start}-${s13.start + s13.duration} s. Beats (local): ${Object.entries(s13.beats).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log('desk  event  local   global   frame  beat+offset            notes starting on it          cues on it   music jump');
let missing = 0;
for (const r of rows) {
  const n = notesAt(r.t), c = cuesAt(r.t), jump = rms(r.t, r.t + 0.04) - rms(r.t - 0.04, r.t);
  if (!n.length) missing++;
  console.log(`${r.d.padEnd(5)} ${r.k.padEnd(6)} ${(r.t - s13.start).toFixed(3).padStart(6)} ${r.t.toFixed(3).padStart(8)} ${String(Math.round(r.t * 24)).padStart(6)}  ${`${r.b}+${r.o}`.padEnd(22)} ${(n.join(' ') || 'NONE').padEnd(29)} ${(c.join(' ') || '-').padEnd(12)} ${jump >= 0 ? '+' : ''}${jump.toFixed(1)} dB`);
}
console.log(`\n${rows.length} shadow events, ${rows.length - missing} on a note${missing ? `, ${missing} WITHOUT ONE` : ': every one'}.`);
console.log('Frames are on the 24 fps grid when frame × 1/24 = global (all events are multiples of 1/8 s).');
process.exitCode = missing ? 1 : 0;
