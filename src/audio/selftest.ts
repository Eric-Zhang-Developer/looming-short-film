// node src/audio/selftest.ts — run after a full `node tools/mix.ts`. Exits non-zero on the first failure.
// Checks every cue and score beat resolves, the three lamp clicks are sample-identical in the foley stem and within ±1 LSB in mix.wav,
// the clock is one buffer, a bed cue with dur/until fills its span, and voices and every foley sound are deterministic and finite.
// Writes solo WAVs to out/audio/solo/ for spectrograms.
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SR, feltPiano, musicBox, pad, subSwell } from './synth.ts';
import { FOLEY } from './foley.ts';
import { CUES } from './cues.ts';
import type { Cue } from './cues.ts';
import { SCORE } from './score.ts';
import { writeWav } from './wav.ts';
import { beat, DURATION } from '../timeline.ts';
import { seedOf } from '../core/rng.ts';

const out = fileURLToPath(new URL('../../out/audio', import.meta.url));
const ok = (name: string, fn: () => void) => { fn(); console.log(`ok  ${name}`); };

// The off click is followed by the spring-back's rustle at +0.17 s (s06.md), so the lamp clicks are compared over their first
// 0.17 s; what the buffer does after that is the tink's tail, which must stay under 1% of the click's peak (asserted below).
const CLICK_CMP = 0.17;
const CLICK_BEATS = ['lampClickHome', 'lampOffHome', 'lampOn'];
const cuesOf = (sound: string) => CUES.filter((c) => c.sound === sound);
const stemL = () => {
  const b = readFileSync(`${out}/stems/foley.wav`);
  const L = new Float32Array((b.length - 44) / 8).map((_, i) => b.readFloatLE(44 + i * 8)); // left channel
  assert.equal(L.length, DURATION * SR, `run the full ${DURATION} s mix first`);
  return L;
};
const sliceAt = (L: Float32Array, c: Cue, n: number) => { const i0 = Math.round((beat(c.beat) + (c.offset ?? 0)) * SR); return L.slice(i0 - 4800, i0 + n + 4800); };
const peakOf = (x: Float32Array) => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

ok('every cue and score event hangs on a beat the v4 timeline has', () => {
  for (const c of [...CUES, ...SCORE]) beat(c.beat);
  for (const e of SCORE) if (e.until) beat(e.until);
  console.log(`    ${CUES.length} cues, ${SCORE.length} score events`);
});
ok('three lamp clicks (s06 on, s06 off, s09a nightstand) are sample-identical in out/audio/stems/foley.wav', () => {
  const L = stemL(), clicks = cuesOf('lampClick');
  assert.deepEqual(clicks.map((c) => c.beat), CLICK_BEATS);
  assert.ok(clicks.every((c) => c.seed === clicks[0].seed && c.gain === clicks[0].gain && !c.offset), 'one seed, one gain, on the beat');
  const buf = FOLEY.lampClick(seedOf('lampClick')), n = Math.round(CLICK_CMP * SR);
  const tail = peakOf(buf.slice(n)) / peakOf(buf);
  assert.ok(tail < 0.01, `click tail past ${CLICK_CMP} s is ${(100 * tail).toFixed(2)}% of its peak`);
  const slices = clicks.map((c) => sliceAt(L, c, n).slice(0, 4800 + n));
  for (const s of slices.slice(1)) assert.deepEqual(s, slices[0]);
  const peak = peakOf(slices[0]);
  assert.ok(peak > 0.1, `click present (peak ${peak})`);
  console.log(`    ${clicks.map((c) => `${c.beat}@${beat(c.beat)}s`).join(', ')}; ${slices[0].length} samples each (-0.1…+${CLICK_CMP} s), peak ${peak.toFixed(4)}, tail past ${CLICK_CMP} s ${(100 * tail).toFixed(3)}% of peak`);
});
ok('the clock is one buffer: clockTick ignores its seed, and every tick cue sits on a whole second of global time', () => {
  assert.deepEqual(FOLEY.clockTick(1), FOLEY.clockTick(999));
  const ts = CUES.filter((c) => c.sound.startsWith('clockTick')).map((c) => beat(c.beat) + (c.offset ?? 0));
  for (const t of ts) assert.ok(Math.abs(t - Math.round(t)) < 1e-9, `tick at ${t}`);
  assert.ok(!ts.some((t) => Math.abs(t - beat('lampOn')) < 1e-9), 'no tick under the nightstand click');
  console.log(`    ${ts.length} ticks, ${Math.min(...ts)}…${Math.max(...ts)} s`);
});
// Doc 05's other "one buffer, identical every time" sets: s15's uncap and the tag's; s00's two buzzes and (v9) the sting's.
for (const [sound, count] of [['penUncap', 2], ['phoneBuzz', 3]] as [string, number][]) ok(`the ${count} ${sound}s are one seed and gain, sample-identical in foley.wav`, () => {
  const L = stemL(), cs = cuesOf(sound), n = FOLEY[sound](seedOf(sound)).length;
  assert.equal(cs.length, count);
  assert.ok(cs.every((c) => c.seed === cs[0].seed && c.gain === cs[0].gain), 'one seed, one gain');
  const [a, ...rest] = cs.map((c) => Math.round((beat(c.beat) + (c.offset ?? 0)) * SR)), A = L.slice(a, a + n);
  for (const b of rest) assert.deepEqual(L.slice(b, b + n), A);
  console.log(`    ${cs.map((c) => `${c.beat}${c.offset ? (c.offset > 0 ? '+' : '') + c.offset : ''}@${(beat(c.beat) + (c.offset ?? 0)).toFixed(2)}s`).join(', ')}; ${n} samples each, peak ${peakOf(A).toFixed(4)}`);
});
ok('every bed cue with a length sounds at both ends of its own span', () => {
  // Checks each cue's own span, not the whole stem, so several beds can share a stem.
  const stems: Record<string, Buffer> = {}, read = (st: string) => (stems[st] ??= readFileSync(`${out}/stems/${st}.wav`));
  const live = (b: Buffer, t0: number, t1: number) => { for (let i = Math.floor(t0 * SR); i < t1 * SR; i++) if (b.readFloatLE(44 + i * 8) !== 0) return true; return false; };
  const beds = CUES.filter((c) => (c.until || c.dur) && c.stem === 'ambience');  // beds live on ambience; one-shot foley with a dur may fade
  for (const c of beds) {
    const b = read(c.stem ?? 'foley'), at = beat(c.beat) + (c.offset ?? 0), end = c.dur ? at + c.dur : beat(c.until!);
    assert.ok(live(b, at, at + 0.05) && live(b, end - 0.05, end), `${c.sound} @ ${c.beat}: silent at an end of ${at}–${end} s`);
  }
  console.log(`    ${beds.length} bed cues sound at both ends of their spans`);
});
ok('voices and foley are deterministic and finite', () => {
  const make = [() => feltPiano(60), () => musicBox(72.14), () => pad([60, 64, 67], { dur: 2 }), () => subSwell({ dur: 3 }),
    ...['lampClick', 'penUncap', 'inkDrip', 'paperRustle', 'fluorescentHum', 'clockTick', 'footstep'].map((k) => () => FOLEY[k](7))];
  for (const f of make) { const x = f(), y = f(); assert.deepEqual(x, y); assert.ok(x.every(Number.isFinite)); assert.ok(x.some((v) => v !== 0)); }
});
ok('every foley sound renders, deterministic and finite', () => {
  for (const [k, f] of Object.entries(FOLEY)) { const x = f(7), y = f(7); assert.deepEqual(x, y, k); assert.ok(x.every(Number.isFinite) && x.some((v) => v !== 0), k); }
});

for (const [sound, n, label] of ([['lampClick', Math.round(CLICK_CMP * SR), 'lamp clicks']] as [string, number, string][])) {
  ok(`the three ${label} are identical within ±1 LSB in out/audio/mix.wav (over the first ${(n / SR).toFixed(2)} s)`, () => {
    const b = readFileSync(`${out}/mix.wav`), d = b.indexOf('data') + 8;              // 16-bit stereo, 48 kHz
    const L = (i: number) => b.readInt16LE(d + i * 4);
    assert.equal((b.length - d) / 4, DURATION * SR, `run the full ${DURATION} s mix first`);
    const cs = cuesOf(sound), at = cs.map((c) => Math.round((beat(c.beat) + (c.offset ?? 0)) * SR));
    let peak = 0;
    for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L(at[0] + i)));
    const diff = at.map((a) => { let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(L(a + i) - L(at[0] + i))); return m; });
    console.log(`    max diff vs ${cs[0].beat} [${diff}] LSB over ${n} samples each, peak ${peak} LSB`);
    assert.ok(peak > 3000, `${sound} present (peak ${peak})`);
    assert.ok(Math.max(...diff) <= 1, `${label} differ by up to ${Math.max(...diff)} LSB`);
  });
}

mkdirSync(`${out}/solo`, { recursive: true });
const pad0 = (x: Float32Array) => { const y = new Float32Array(x.length + SR / 10); y.set(x, SR / 20); return y; };
const click = pad0(FOLEY.lampClick(seedOf('lampClick'))), piano = pad0(feltPiano(60, { vel: 0.7, dur: 1.5 }));
writeWav(`${out}/solo/lampclick.wav`, [click]);
writeWav(`${out}/solo/clocktick.wav`, [pad0(FOLEY.clockTick())]);
writeWav(`${out}/solo/piano_c4.wav`, [piano]);
console.log(`wrote ${out}/solo/{lampclick,clocktick,piano_c4}.wav (${click.length}, ${piano.length} samples)`);
