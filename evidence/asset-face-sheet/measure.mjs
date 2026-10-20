#!/usr/bin/env node
// Flood-fill from a seed pixel and print the region's bounding box, so eye sizes are measured, not guessed.
//   node measure.mjs <png> <x> <y> <eye|dark|stroke>
//   eye: opaque and not green (cream disc + pupil + highlight, stops at the green head). dark: luminance < 90 (the pupil).
//   stroke: darker than the head green (the smile line).
import { execFileSync } from 'node:child_process';
const [png, sx, sy, mode = 'eye'] = process.argv.slice(2);
const [{ width: W, height: H }] = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'json', png], { encoding: 'utf8' })).streams;
const px = execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: W * H * 4 + 1024 });
const at = (x, y) => { const i = (y * W + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
const green = ([r, g, b]) => g > r + 12 && g > b + 12;
const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
const test = { eye: p => p[3] >= 128 && !green(p), dark: p => p[3] >= 128 && lum(p) < 90,
  stroke: p => p[3] >= 128 && lum(p) < 95 }[mode];
const seen = new Uint8Array(W * H), stack = [[+sx, +sy]];
if (!test(at(+sx, +sy))) { console.error(`seed ${sx},${sy} fails "${mode}": rgba ${at(+sx, +sy)}`); process.exit(1); }
let x0 = W, y0 = H, x1 = -1, y1 = -1, n = 0;
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= W || y >= H || seen[y * W + x] || !test(at(x, y))) continue;
  seen[y * W + x] = 1; n++;
  x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}
const w = x1 - x0 + 1, h = y1 - y0 + 1;
console.log(JSON.stringify({ png: png.split('/').pop(), mode, seed: [+sx, +sy], box: [x0, y0, w, h],
  centre: [+(x0 + w / 2).toFixed(1), +(y0 + h / 2).toFixed(1)], diameter_px: +((w + h) / 2).toFixed(1),
  area_px: n, equiv_diameter_px: +(2 * Math.sqrt(n / Math.PI)).toFixed(1) }));
