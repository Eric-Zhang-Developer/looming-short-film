// node evidence/spec-g4/geometry.mjs  → the numbers spec-g4 put into docs/02-story.md and docs/shots/*.md
// Shadow rule (docs/shots/README.md §1): a point light at depth z_L, a blob plane at z_B parallel to a wall at z 0,
// S = z_L / (z_L − z_B); units = S × r / 0.012. Overhead pool = h / (h − r).
import assert from 'node:assert/strict';

const BIRTH = 0.012;
const METER = { birth: 0.012, gulp1: 0.015, gulp2: 0.018, gulp3: 0.021, gulp4: 0.024, gulp5: 0.030 };
const SHRINK = [0.030, 0.024, 0.018, 0.012, 0.009, 0.007, 0.005, 0.004, 0.0015];
const S = (zL, zB) => zL / (zL - zB);
const units = (s, r) => s * r / BIRTH;
const f = (x, n = 2) => x.toFixed(n);
const out = [];
const row = (...a) => out.push(a.join('  '));

row('## The ladder (r / birth)');
for (const [k, r] of Object.entries(METER)) row(k.padEnd(6), f(r, 4), f(r / BIRTH) + '×');
SHRINK.forEach((r, i) => row(`SHRINK[${i}]`, f(r, 4), f(r / BIRTH) + '×'));

row('\n## Home shots after the G4 re-ladder (gulp2 moves s04 → s06, gulps 3 and 4 are the two blinds)');
// s03: laptop screen light at z 0.090 (the old phone grip depth), blob B at z 0.060
const s03 = S(0.090, 0.060);
row('s03 laptop S', f(s03), 'units 1×', f(units(s03, METER.birth)), '→ gulp1', f(units(s03, METER.gulp1)));
// s03 wall hit of the ray light → blob centre (laptop screen centre (−0.0033, 0.0055, 0.090), blob centre (0.040, 0.012·1.08, 0.060))
{
  const L = [-0.0033, 0.0055, 0.090], B = [0.040, 0.012 * 1.08, 0.060], t = L[2] / (L[2] - B[2]);
  row('s03 shadow centre on wall (1×)', f(L[0] + t * (B[0] - L[0]), 3), f(L[1] + t * (B[1] - L[1]), 3));
}
// s04: fridge light at z 0.2763, blob at 1.25× all shot (no gulp now)
for (const zB of [0.19, 0.20, 0.21]) row('s04 zB', zB, 'S', f(S(0.2763, zB)), 'units', f(units(S(0.2763, zB), METER.gulp1), 1));
// s05: laptop at z 0.4308 (old phone L), blob z 0.35, now 1.25×
const s05 = S(0.4308, 0.35);
row('s05 S', f(s05), 'units at 1.25×', f(units(s05, METER.gulp1), 1));
// s05 keeps the spec's 8.0 units at 1.25× by moving the laptop: z_L = S·z_B/(S − 1) with S = 8.0 / 1.25
{ const Sx = 8.0 / 1.25, zL = Sx * 0.35 / (Sx - 1); row('s05 re-solved laptop z', f(zL, 4), 'S', f(S(zL, 0.35)), 'units', f(units(S(zL, 0.35), METER.gulp1), 2)); }
// s06: screen at the phone rest z 0.114, home contact z 0.0859; lamp mouth 0.056 above the desk
const s06 = S(0.114, 0.0859);
row('s06 S', f(s06), 'units 1.25×', f(units(s06, METER.gulp1), 1), '→ gulp2 1.5×', f(units(s06, METER.gulp2), 1));
row('s06 lamp pool 1.25×', f(0.056 / (0.056 - METER.gulp1)), ' x_m 1.25×', f(1.15 * (METER.gulp1 - BIRTH), 4), ' x_m 1.5×', f(1.15 * (METER.gulp2 - BIRTH), 4));
// s07: laptop at z 0.4222, blob z 0.38
const s07 = S(0.4222, 0.38);
row('s07 S', f(s07, 1), 'units 1.5×', f(units(s07, METER.gulp2), 1), '→ blind 1 1.75×', f(units(s07, METER.gulp3), 1), '→ blind 2 2×', f(units(s07, METER.gulp4), 1));
// s07 sun patch: window sill 0.041, top 0.095 in the back wall; elevation e puts the floor patch at z = y / tan e
for (const e of [12, 13, 14]) { const t = Math.tan(e * Math.PI / 180); row('s07 sun elev', e + '°', 'patch z', f(0.041 / t, 3), '…', f(0.095 / t, 3)); }
// s08: laptop in bed z 0.3447, blob z 0.29, 2×
const s08 = S(0.3447, 0.29);
row('s08 S', f(s08, 1), 'units 2×', f(units(s08, METER.gulp4), 1));

row('\n## Overhead pools (sensor tube 0.127 above the desk)');
for (const r of [0.030, 0.024, 0.018, 0.012, 0.009, 0.007, 0.005, 0.004]) row('r', f(r, 4), 'pool', f(0.127 / (0.127 - r)) + '×');
row('home lamp at s18 (shade mouth 0.056), r 0.004:', f(0.056 / (0.056 - 0.004)) + '×');

row('\n## Runtime budget (s)');
const plan = { s00: 4, s01: 6, s02: 10, s03: 6, s04: 8, s05: 8, s06: 8, s07: 12, s08: 6, s09: 6, s10: 6, s11: 6, s12: 10, s13: 7, s14: 5, s15: 14, s16: 24, s17: 18, s17b: 9, s17c: 5, s18: 17 };
let t = 0;
for (const [id, d] of Object.entries(plan)) { row(id.padEnd(4), String(t).padStart(4), '→', String(t + d).padStart(4)); t += d; }
row('total', t, `= ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`);
assert.ok(t >= 190 && t <= 200, 'runtime outside 3:10–3:20');

row('\n## The math on screen (checked numerically; h = 1e-5 central differences)');
const d = (F, x, h = 1e-5) => (F(x + h) - F(x - h)) / (2 * h);
const close = (a, b) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));
const xs = [-2, -0.5, 0, 0.7, 1.3, 2.5];
// practice 1: ∫ x eˣ dx = x eˣ − eˣ + C ; the crossed-out line x eˣ + eˣ is wrong
const F1 = (x) => x * Math.exp(x) - Math.exp(x), wrong = (x) => x * Math.exp(x) + Math.exp(x);
assert.ok(xs.every((x) => close(d(F1, x), x * Math.exp(x))));
assert.ok(xs.every((x) => !close(d(wrong, x), x * Math.exp(x))));
row('∫ x eˣ dx = x eˣ − eˣ + C   ok: d/dx matches x eˣ at', xs.join(', '));
row('crossed-out x eˣ + eˣ        wrong: its derivative is x eˣ + 2eˣ, e.g. at 1:', f(d(wrong, 1), 4), 'vs', f(Math.exp(1), 4));
// practice 2: Σ n / 2ⁿ by the ratio test: a(n+1)/a(n) = (n+1)/(2n) → 1/2 < 1, converges (to 2)
const a = (n) => n / 2 ** n, ratio = (n) => a(n + 1) / a(n);
for (const n of [1, 10, 100, 1000]) assert.ok(close(ratio(n), (n + 1) / (2 * n)));
let sum = 0; for (let n = 1; n <= 200; n++) sum += a(n);
assert.ok(Math.abs(sum - 2) < 1e-12);
row('Σ n/2ⁿ: ratio (n+1)/2n at n = 1, 10, 100, 1000:', [1, 10, 100, 1000].map((n) => f(ratio(n), 4)).join(', '), '→ ½ < 1, converges (partial sum to 200:', f(sum, 12) + ')');
// test: ∫ x e²ˣ dx = (x/2) e²ˣ − ¼ e²ˣ + C
const F3 = (x) => (x / 2) * Math.exp(2 * x) - Math.exp(2 * x) / 4;
assert.ok(xs.every((x) => close(d(F3, x), x * Math.exp(2 * x))));
row('∫ x e²ˣ dx = (x/2)e²ˣ − ¼e²ˣ + C   ok: d/dx matches x e²ˣ at', xs.join(', '));

console.log(out.join('\n'));
