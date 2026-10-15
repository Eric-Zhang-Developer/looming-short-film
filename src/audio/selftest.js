// node src/audio/selftest.js — run after a full `node tools/mix.mjs`. Exits non-zero on the first failure.
// Checks the three lamp clicks are sample-identical in the rendered foley stem, voices are deterministic
// and finite, and stubs throw. Writes solo WAVs to out/audio/solo/ for spectrograms.
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
  const slices = clicks.map((c) => { const i0 = Math.round(beat(c.beat) * SR); return L.slice(i0 - 4800, i0 + n + 4800); });
  for (const s of slices.slice(1)) assert.deepEqual(s, slices[0]);
  const peak = slices[0].reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  assert.ok(peak > 0.1, `click present (peak ${peak})`);
  console.log(`    ${clicks.map((c) => `${c.beat}@${beat(c.beat)}s`).join(', ')}; ${slices[0].length} samples each (±0.1 s), peak ${peak.toFixed(4)}`);
});
ok('voices and foley are deterministic and finite', () => {
  const make = [() => feltPiano(60), () => musicBox(72.14), () => pad([60, 64, 67], { dur: 2 }), () => subSwell({ dur: 3 }),
    ...['lampClick', 'penUncap', 'inkDrip', 'paperRustle', 'fluorescentHum'].map((k) => () => FOLEY[k](7))];
  for (const f of make) { const x = f(), y = f(); assert.deepEqual(x, y); assert.ok(x.every(Number.isFinite)); assert.ok(x.some((v) => v !== 0)); }
});
ok('unbuilt foley throws "not implemented"', () => assert.throws(() => FOLEY.penScratch(1), /not implemented/));

mkdirSync(`${out}/solo`, { recursive: true });
const pad0 = (x) => { const y = new Float32Array(x.length + SR / 10); y.set(x, SR / 20); return y; };
const click = pad0(FOLEY.lampClick(seedOf('lampClick'))), piano = pad0(feltPiano(60, { vel: 0.7, dur: 1.5 }));
writeWav(`${out}/solo/lampclick.wav`, [click]);
writeWav(`${out}/solo/piano_c4.wav`, [piano]);
console.log(`wrote ${out}/solo/{lampclick,piano_c4}.wav (${click.length}, ${piano.length} samples)`);
