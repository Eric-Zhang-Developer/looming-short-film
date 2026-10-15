#!/usr/bin/env node
// Value-contrast check for G1: greyscale each cut piece and compare its mean luminance with the wall's.
//   node contrast.mjs <wall.png> <prop.png>...   (cut.mjs part PNGs, RGBA)
// Luminance: Rec.709 luma Y' = 0.2126R + 0.7152G + 0.0722B on the 8-bit values, mean over pixels with alpha >= 128.
// Pass: |Y'prop - Y'wall| >= 25% of full scale (64 of 255 levels). The relative ratio vs the wall is printed too.
// "near-wall %": share of the piece's pixels whose own Y' is within 64 levels of the wall mean (catches a navy stem
// hiding inside a piece whose mean is lifted by a cream shade).
import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';

const stats = f => {
  const [{ width: w, height: h }] = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'json', f], { encoding: 'utf8' })).streams;
  const px = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: w * h * 4 + 1024 });
  const ys = [];
  for (let i = 0; i < px.length; i += 4) if (px[i + 3] >= 128) ys.push(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]);
  return { ys, mean: ys.reduce((a, b) => a + b, 0) / ys.length };
};

const [wallF, ...props] = process.argv.slice(2);
if (!props.length) { console.error('usage: node contrast.mjs <wall.png> <prop.png>...'); process.exit(1); }
const wall = stats(wallF);
console.log(`wall ${basename(wallF)}: mean Y' ${wall.mean.toFixed(1)} (${wall.ys.length} px)`);
console.log('piece | mean Y\' | ΔY\' (levels) | ΔY\' / 255 | ratio vs wall | near-wall % | pass (>= 25%)');
let fails = 0;
for (const f of props) {
  const s = stats(f), d = s.mean - wall.mean, pct = Math.abs(d) / 255;
  const near = s.ys.filter(y => Math.abs(y - wall.mean) < 64).length / s.ys.length;
  if (pct < 0.25) fails++;
  console.log(`${basename(f)} | ${s.mean.toFixed(1)} | ${d >= 0 ? '+' : ''}${d.toFixed(1)} | ${(pct * 100).toFixed(1)}% | ${(s.mean / wall.mean).toFixed(2)}x | ${(near * 100).toFixed(1)}% | ${pct >= 0.25 ? 'PASS' : 'FAIL'}`);
}
console.log(fails ? `${fails} FAIL` : 'all PASS');
