// @ts-check
// node src/core/selftest.js — invariants of the core module. Exits non-zero on the first failure.
// Expected rng values were produced by 1776's original src/rng.ts, so these also pin the port as bit-identical.
import assert from 'node:assert/strict';
import { hash, hash2, mulberry32, seedOf } from './rng.js';
import { ease, easeIn, easeOut, kf, spring, onTwos } from './ease.js';
import { PALETTE } from './palette.js';
import { shotAt } from '../timeline.js';

const ok = (name, fn) => { fn(); console.log(`ok  ${name}`); };

ok('hash fixed outputs', () => {
  assert.equal(hash(0), 0.11478774505667388);
  assert.equal(hash(1), 0.24678996880538762);
  assert.equal(hash(42), 0.6052086122799665);
  assert.equal(hash(-1), 0.9985320025589317);
  assert.equal(hash2(1, 2), 0.3251380540896207);
});
ok('mulberry32 fixed outputs', () => {
  const r = mulberry32(42);
  assert.deepEqual([r(), r(), r()], [0.6011037519201636, 0.44829055899754167, 0.8524657934904099]);
  const s = mulberry32(0);
  assert.deepEqual([s(), s()], [0.26642920868471265, 0.0003297457005828619]);
});
ok('seedOf is a stable uint32 and separates parts', () => {
  assert.equal(seedOf('gator', 'arm_l', 7), 100964578);
  assert.equal(seedOf('gator', 'arm_l', 7), seedOf('gator', 'arm_l', '7'));
  assert.notEqual(seedOf('ab'), seedOf('a', 'b'));
  assert.ok(Number.isInteger(seedOf('x')) && seedOf('x') >= 0 && seedOf('x') < 2 ** 32);
});
ok('kf hits its keys exactly', () => {
  const keys = [[0, -0.3], [1, 0.25], [2.5, 0.1], [3, 7]];
  for (const [t, v] of keys) assert.equal(kf(t, keys), v);
  assert.equal(kf(-5, keys), -0.3);
  assert.equal(kf(99, keys), 7);
  const arr = [[0, [0, 1]], [1, [2, 3]], [2, [4, 5]]];
  for (const [t, v] of arr) assert.deepEqual(kf(t, arr), v);
  assert.equal(kf(0.5, [[0, 0], [1, 1]]), 0.5); // smoothstep midpoint
});
ok('ease endpoints', () => {
  for (const e of [ease, easeIn, easeOut]) { assert.equal(e(0), 0); assert.equal(e(1), 1); assert.equal(e(-1), 0); assert.equal(e(2), 1); }
});
ok('spring is 0 before t0 and at t0', () => {
  assert.equal(spring(0.99, 1), 0);
  assert.equal(spring(1, 1), 0);
  assert.ok(Math.abs(spring(1.05, 1)) > 0);
});
ok('onTwos(0.09) === 1/12', () => {
  assert.equal(onTwos(0.09), 1 / 12);
  assert.equal(onTwos(0), 0);
  assert.equal(onTwos(1), 1);
});
ok('onTwos survives the film\'s global-to-local subtraction', () => {
  assert.equal(onTwos(2402 / 24 - 100), 1 / 12);   // s15 frame 2402: 0.0833333333333286 (the literal 100.0833 − 100 is a rounded 0.0833, below 1/12)
  for (let n = 0; n <= 4320; n++) {            // exactly film.js: shotAt(n/24).tLocal = t − shot.start
    const { shot, tLocal } = shotAt(n / 24), want = Math.floor((n - shot.start * 24) / 2);
    assert.equal(Math.round(onTwos(tLocal) * 12), want, `frame ${n} (${shot.id}, tLocal ${tLocal})`);
  }
});
ok('palette has the contract keys', () => {
  assert.deepEqual(Object.keys(PALETTE), ['navy', 'cream', 'gator', 'kraft', 'phone', 'lamp', 'ink', 'calendarRed']);
  assert.equal(PALETTE.calendarRed, '#C8473A');
});
console.log('selftest: all passed');
