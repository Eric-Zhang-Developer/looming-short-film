#!/usr/bin/env node
// Line weight: for a stroke inside box [x, y, w, h], the median of the vertical run of "ink" pixels per column over the
// box's middle half (near-horizontal strokes, so a column's run is the stroke's thickness; arcs read a little thick at the ends).
//   node strokes.mjs <png> <x> <y> <w> <h> [alpha|dark]   alpha: alpha >= 128 (a cut line piece); dark: lum < 105, midway between the stroke (~88) and the head green (~123)
import { execFileSync } from 'node:child_process';
const [png, ...rest] = process.argv.slice(2), [X, Y, BW, BH] = rest.slice(0, 4).map(Number), mode = rest[4] ?? 'alpha';
const [{ width: W, height: H }] = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'json', png], { encoding: 'utf8' })).streams;
const px = execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: W * H * 4 + 1024 });
const ink = (x, y) => { const i = (y * W + x) * 4;
  return mode === 'dark' ? px[i + 3] >= 128 && 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2] < 105 : px[i + 3] >= 128; };
const runs = [];
for (let x = X + Math.round(BW / 4); x < X + Math.round(BW * 3 / 4); x++) {
  let best = 0, cur = 0;
  for (let y = Y; y < Y + BH; y++) { cur = ink(x, y) ? cur + 1 : 0; best = Math.max(best, cur); }
  if (best) runs.push(best);
}
runs.sort((a, b) => a - b);
console.log(JSON.stringify({ png: png.split('/').pop(), box: [X, Y, BW, BH], mode, columns: runs.length,
  min: runs[0], median: runs[runs.length >> 1], max: runs.at(-1) }));
