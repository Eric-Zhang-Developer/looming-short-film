// node src/audio/selftest.js — run after a full `node tools/mix.mjs`. Exits non-zero on the first failure.
// Checks the three lamp clicks are sample-identical in the foley stem and within ±1 LSB in mix.wav, a bed cue
// with dur/until fills its span, and voices and every foley sound are deterministic and finite. Writes solo WAVs to out/audio/solo/ for spectrograms.
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SR, feltPiano, musicBox, pad, subSwell } from './synth.js';
import { FOLEY } from './foley.js';
import { CUES } from './cues.js';
import { writeWav } from './wav.js';
import { beat, DURATION } from '../timeline.js';
import { seedOf } from '../core/rng.js';

const out = fileURLToPath(new URL('../../out/audio', import.meta.url));
const ok = (name, fn) => { fn(); console.log(`ok  ${name}`); };

ok('three lamp clicks are sample-identical in out/audio/stems/foley.wav', () => {
  const b = readFileSync(`${out}/stems/foley.wav`);
  const L = new Float32Array((b.length - 44) / 8).map((_, i) => b.readFloatLE(44 + i * 8)); // left channel
  assert.equal(L.length, DURATION * SR, 'run the full 180 s mix first');
  const clicks = CUES.filter((c) => c.sound === 'lampClick');
  assert.equal(clicks.length, 3);
  const n = FOLEY.lampClick(seedOf('lampClick')).length;
  const slices = clicks.map((c) => { const i0 = Math.round((beat(c.beat) + (c.offset ?? 0)) * SR); return L.slice(i0 - 4800, i0 + n + 4800); });
  for (const s of slices.slice(1)) assert.deepEqual(s, slices[0]);
  const peak = slices[0].reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  assert.ok(peak > 0.1, `click present (peak ${peak})`);
  console.log(`    ${clicks.map((c) => `${c.beat}@${beat(c.beat)}s`).join(', ')}; ${slices[0].length} samples each (±0.1 s), peak ${peak.toFixed(4)}`);
});
ok('a bed cue with a length fills it in its stem', () => {
  const c = CUES.find((c) => c.until || c.dur);
  const b = readFileSync(`${out}/stems/${c.stem ?? 'foley'}.wav`);
  const at = beat(c.beat) + (c.offset ?? 0), end = c.dur ? at + c.dur : beat(c.until);
  let first = -1, last = -1;
  for (let i = 0; i < (b.length - 44) / 8; i++) if (b.readFloatLE(44 + i * 8) !== 0) { if (first < 0) first = i; last = i; }
  console.log(`    ${c.sound} in ${c.stem}: cue ${at}–${end} s, non-zero samples ${first / SR}–${(last + 1) / SR} s`);
  assert.ok(Math.abs(first / SR - at) < 0.01 && Math.abs((last + 1) / SR - end) < 0.01);
});
ok('voices and foley are deterministic and finite', () => {
  const make = [() => feltPiano(60), () => musicBox(72.14), () => pad([60, 64, 67], { dur: 2 }), () => subSwell({ dur: 3 }),
    ...['lampClick', 'penUncap', 'inkDrip', 'paperRustle', 'fluorescentHum'].map((k) => () => FOLEY[k](7))];
  for (const f of make) { const x = f(), y = f(); assert.deepEqual(x, y); assert.ok(x.every(Number.isFinite)); assert.ok(x.some((v) => v !== 0)); }
});
ok('every foley sound renders, deterministic and finite', () => {
  for (const [k, f] of Object.entries(FOLEY)) { const x = f(7), y = f(7); assert.deepEqual(x, y, k); assert.ok(x.every(Number.isFinite) && x.some((v) => v !== 0), k); }
});

ok('three lamp clicks are identical within ±1 LSB in out/audio/mix.wav (over the click\'s own samples)', () => {
  const b = readFileSync(`${out}/mix.wav`), d = b.indexOf('data') + 8;              // 16-bit stereo, 48 kHz
  const L = (i) => b.readInt16LE(d + i * 4);
  assert.equal((b.length - d) / 4, DURATION * SR, 'run the full 180 s mix first');
  const n = FOLEY.lampClick(seedOf('lampClick')).length;
  const at = CUES.filter((c) => c.sound === 'lampClick').map((c) => Math.round((beat(c.beat) + (c.offset ?? 0)) * SR));
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L(at[0] + i)));
  const diff = at.map((a) => { let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(L(a + i) - L(at[1] + i))); return m; });
  console.log(`    max diff vs ${CUES.filter((c) => c.sound === 'lampClick')[1].beat} [${diff}] LSB over ${n} samples each, peak ${peak} LSB`);
  assert.ok(peak > 3000, `click present (peak ${peak})`);
  assert.ok(Math.max(...diff) <= 1, `clicks differ by up to ${Math.max(...diff)} LSB`);
});

mkdirSync(`${out}/solo`, { recursive: true });
const pad0 = (x) => { const y = new Float32Array(x.length + SR / 10); y.set(x, SR / 20); return y; };
const click = pad0(FOLEY.lampClick(seedOf('lampClick'))), piano = pad0(feltPiano(60, { vel: 0.7, dur: 1.5 }));
writeWav(`${out}/solo/lampclick.wav`, [click]);
writeWav(`${out}/solo/piano_c4.wav`, [piano]);
console.log(`wrote ${out}/solo/{lampclick,piano_c4}.wav (${click.length}, ${piano.length} samples)`);
