#!/usr/bin/env node
// Gap check for a sheet: alpha islands (alpha >= 16, 8-connected, full res, under 500 px dropped as dust, as cut.mjs),
// then for every pair the bounding-box gap (negative = boxes overlap) and the true pixel gap (Euclidean, edge to edge),
// and each island's distance to the frame edge. Prints a table; --json=<f> writes the islands for sheets.mjs.
//   node measure.mjs <sheet.png> [--json=<out.json>]
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [file, ...rest] = process.argv.slice(2);
const jsonOut = rest.find(a => a.startsWith('--json='))?.slice(7);
const [{ width: W, height: H }] = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'json', file], { encoding: 'utf8' })).streams;
const px = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: W * H * 4 + 1024 });
let opaque = true;
for (let i = 3; i < px.length; i += 4) if (px[i] < 255) { opaque = false; break; }
// No alpha: treat pixels near the magenta key as background (cut.mjs's default tolerance, 80).
const on = opaque
  ? p => (px[p * 4] - 255) ** 2 + px[p * 4 + 1] ** 2 + (px[p * 4 + 2] - 255) ** 2 >= 80 * 80
  : p => px[p * 4 + 3] >= 16;

const label = new Int32Array(W * H).fill(-1), islands = [];
for (let s = 0; s < W * H; s++) {
  if (label[s] >= 0 || !on(s)) continue;
  const t = { x0: W, y0: H, x1: -1, y1: -1, area: 0, edge: [] }, stack = [s];
  label[s] = islands.length;
  while (stack.length) {
    const p = stack.pop(), x = p % W, y = (p / W) | 0;
    t.area++; t.x0 = Math.min(t.x0, x); t.x1 = Math.max(t.x1, x); t.y0 = Math.min(t.y0, y); t.y1 = Math.max(t.y1, y);
    let border = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy, n = ny * W + nx;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || !on(n)) { border = true; continue; }
      if (label[n] < 0) { label[n] = islands.length; stack.push(n); }
    }
    if (border) t.edge.push(x, y);
  }
  islands.push(t);
}
const kept = islands.filter(t => t.area >= 500).sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
const dust = islands.length - kept.length;

const boxGap = (a, b) => {
  const gx = Math.max(a.x0 - b.x1, b.x0 - a.x1) - 1, gy = Math.max(a.y0 - b.y1, b.y0 - a.y1) - 1;
  return Math.max(gx, gy);  // < 0 only when the boxes overlap
};
const pixGap = (a, b) => {
  if (boxGap(a, b) > 400) return Infinity;
  let best = Infinity;
  for (let i = 0; i < a.edge.length; i += 2) for (let j = 0; j < b.edge.length; j += 2) {
    const d = (a.edge[i] - b.edge[j]) ** 2 + (a.edge[i + 1] - b.edge[j + 1]) ** 2;
    if (d < best) best = d;
  }
  return Math.sqrt(best) - 1;
};

console.log(`${file}: ${W}x${H}, ${opaque ? 'no alpha (magenta key)' : 'alpha'}, ${kept.length} island(s) kept, ${dust} dust island(s) under 500 px dropped`);
kept.forEach((t, i) => console.log(`  #${i + 1} box [${t.x0}, ${t.y0}, ${t.x1 - t.x0 + 1}, ${t.y1 - t.y0 + 1}] area ${t.area} frame-edge ${Math.min(t.x0, t.y0, W - 1 - t.x1, H - 1 - t.y1)} px`));
let minBox = { d: Infinity }, minPix = { d: Infinity }, overlaps = [];
for (let i = 0; i < kept.length; i++) for (let j = i + 1; j < kept.length; j++) {
  const b = boxGap(kept[i], kept[j]), p = pixGap(kept[i], kept[j]);
  if (b < 0) overlaps.push(`#${i + 1}/#${j + 1}`);
  if (b < minBox.d) minBox = { d: b, pair: `#${i + 1}/#${j + 1}` };
  if (p < minPix.d) minPix = { d: p, pair: `#${i + 1}/#${j + 1}` };
}
const minEdge = Math.min(...kept.map(t => Math.min(t.x0, t.y0, W - 1 - t.x1, H - 1 - t.y1)));
console.log(`  smallest pixel gap ${minPix.d.toFixed(0)} px (${minPix.pair}); smallest box gap ${minBox.d} px (${minBox.pair}); ` +
  `box overlaps: ${overlaps.join(', ') || 'none'}; nearest frame edge ${minEdge} px`);
console.log(`  40 px rule (pixel gap >= 40, no box overlap, frame margin >= 40): ${minPix.d >= 40 && !overlaps.length && minEdge >= 40 ? 'PASS' : 'FAIL'}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ file, W, H, islands: kept.map(({ edge, ...t }) => t) }, null, 1));
