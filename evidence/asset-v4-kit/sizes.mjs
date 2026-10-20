#!/usr/bin/env node
// heads sheet vs hero: per head, the scale s = W/W_hero and the shape ratios (snout thickness / W, bump rise / W, eye / W) vs the hero's.
//   node sizes.mjs <variant 1|2|3>        uses closeup_heads_v1_<n>.png and its boxes file; prints a table and writes sizes_v1_<n>.json
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const v = process.argv[2], here = new URL('.', import.meta.url).pathname, root = here + '../../';
const m = (png, box, seed, row) => JSON.parse(execFileSync('node', [here + 'measure.mjs', png, ...box, ...seed, ...(row ? [row] : [])], { encoding: 'utf8' }));
const hero = m(root + 'assets/frozen/gator_hero.png', [560, 0, 900, 420], [820, 140], 385);
const boxes = JSON.parse(readFileSync(`${here}closeup_heads_v1_${v}.boxes.json`, 'utf8'));
const png = `${root}assets/raw/closeup_heads_v1_${v}.png`;
const names = ['numb', 'dread', 'resolve', 'relief', 'surprised_smile', 'pride'];
const list = Object.values(boxes).map(b => ({ b, row: b[1] > 400 ? 1 : 0 })).sort((p, q) => p.row - q.row || p.b[0] - q.b[0]);
const pct = (a, b) => +(((a / b) - 1) * 100).toFixed(1);
const out = list.map(({ b }, i) => {
  const r = m(png, b, ['auto']);
  return { head: names[i], box: b, W: r.W, s: +(r.W / hero.W).toFixed(3), snout_thick_over_W: r.snout_thick_over_W, bump_rise_over_W: r.bump_rise_over_W, eye_w_over_W: r.eye_w_over_W,
    d_snout_pct: pct(r.snout_thick_over_W, hero.snout_thick_over_W), d_bump_x: +(r.bump_rise_over_W / hero.bump_rise_over_W).toFixed(2), d_eye_pct: r.eye_w_over_W ? pct(r.eye_w_over_W, hero.eye_w_over_W) : null };
});
const ss = out.map(o => o.s), mean = ss.reduce((a, c) => a + c) / ss.length;
const res = { variant: v, hero: { W: hero.W, snout_thick_over_W: hero.snout_thick_over_W, bump_rise_over_W: hero.bump_rise_over_W, eye_w_over_W: hero.eye_w_over_W },
  heads: out, scale_mean: +mean.toFixed(3), scale_spread_pct: +((Math.max(...ss) - Math.min(...ss)) / mean * 100).toFixed(1) };
writeFileSync(`${here}sizes_v1_${v}.json`, JSON.stringify(res, null, 1) + '\n');
console.log(`v1_${v}: hero W=${hero.W} snout/W=${hero.snout_thick_over_W} eye/W=${hero.eye_w_over_W}; scale mean ${res.scale_mean}, spread ${res.scale_spread_pct}%`);
for (const o of out) console.log(`  ${o.head.padEnd(16)} W=${String(o.W).padEnd(4)} s=${o.s}  snout/W=${o.snout_thick_over_W} (${o.d_snout_pct}%)  eye/W=${o.eye_w_over_W} (${o.d_eye_pct}%)  bump x${o.d_bump_x}`);
