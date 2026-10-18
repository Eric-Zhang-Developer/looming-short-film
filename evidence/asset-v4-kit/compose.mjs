#!/usr/bin/env node
// heads_vs_hero: each head (cut crop, scaled by 1/s so the sheet's own scale cancels) beside the hero's head, on white.
// phone: the six heads at phone-thumbnail size (head width 150 px) on the navy of the film.
//   node compose.mjs <variant> <cutdir> <outdir>      cutdir = the cut.mjs --out dir holding closeup_heads_v1_<v>_<k>.png
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [v, cut, out] = process.argv.slice(2), here = new URL('.', import.meta.url).pathname, root = here + '../../';
const res = JSON.parse(readFileSync(`${here}sizes_v1_${v}.json`, 'utf8'));
const boxes = JSON.parse(readFileSync(`${here}closeup_heads_v1_${v}.boxes.json`, 'utf8'));
const files = Object.fromEntries(Object.entries(boxes).map(([k, b]) => [b.join(), `${cut}/${k}.png`]));
const sc = res.scale_mean, hero = root + 'assets/frozen/gator_hero.png';
const cells = res.heads.map(h => ({ h, f: files[h.box.join()] }));
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const pairs = cells.map(({ h, f }, i) => {
  const p = `${out}/_pair_${i}.png`;
  ff(['-f', 'lavfi', '-i', 'color=white:s=1660x560', '-i', hero, '-i', f, '-filter_complex',
    `[1]crop=820:560:560:0[a];[2]scale=iw/${sc}:-1[b];[0][a]overlay=0:0:format=auto[c];[c][b]overlay=840+(820-w)/2:(560-h)/2:format=auto`, '-frames:v', '1', '-update', '1', p]);
  return p;
});
ff([...pairs.flatMap(p => ['-i', p]), '-filter_complex',
  `${pairs.map((_, i) => `[${i}]`).join('')}xstack=inputs=6:layout=0_0|1660_0|0_560|1660_560|0_1120|1660_1120,scale=1800:-1`, '-frames:v', '1', '-update', '1', '-q:v', '3', `${out}/heads_vs_hero_v1_${v}.jpg`]);
const th = cells.map(({ f }, i) => { const p = `${out}/_ph_${i}.png`;
  ff(['-f', 'lavfi', '-i', 'color=0x1E2440:s=190x130', '-i', f, '-filter_complex', '[1]scale=150:-1[b];[0][b]overlay=20:(130-h)/2:format=auto', '-frames:v', '1', '-update', '1', p]); return p; });
ff([...th.flatMap(p => ['-i', p]), '-filter_complex', `${th.map((_, i) => `[${i}]`).join('')}hstack=inputs=6`, '-frames:v', '1', '-update', '1', '-q:v', '3', `${out}/phone_v1_${v}.jpg`]);
