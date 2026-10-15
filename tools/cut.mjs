#!/usr/bin/env node
// Split a sheet into parts: each box's RGBA crop goes to assets/cut/<part>.png.
//   node tools/cut.mjs --in=assets/frozen/<f>.png --boxes=assets/cut/<name>.boxes.json     boxes: { part: [x, y, w, h] }
//   node tools/cut.mjs --in=... --auto [--boxes=...] [--pad=4] [--min-area=500]           propose boxes from alpha islands, write them, then cut
// A sheet with no transparency is keyed first (--key=#00FF00, --tol=80): Codex usually returns real alpha (wave 1),
// so the key is the fallback doc 08 asks for.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets/cut');
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const die = msg => { console.error(`cut: ${msg}`); process.exit(1); };
if (!args.in || (!args.boxes && !args.auto)) die('usage: node tools/cut.mjs --in=<png> (--boxes=<json> | --auto [--boxes=<json>])');

const input = resolve(ROOT, args.in);
const stem = basename(input).replace(/\.\w+$/, '');
const boxesPath = resolve(ROOT, args.boxes ?? `assets/cut/${stem}.boxes.json`);

// Decode to raw RGBA with ffmpeg (no image library in this repo).
const [{ width: W, height: H }] = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'json', input], { encoding: 'utf8' })).streams;
const px = execFileSync('ffmpeg', ['-v', 'error', '-i', input, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: W * H * 4 + 1024 });
if (px.length !== W * H * 4) die(`decoded ${px.length} bytes, expected ${W * H * 4}`);

let opaque = true;
for (let i = 3; i < px.length; i += 4) if (px[i] < 255) { opaque = false; break; }
if (opaque) {
  const hex = String(args.key ?? '#00FF00').replace('#', ''), tol = Number(args.tol ?? 80);
  const [kr, kg, kb] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  let n = 0;
  for (let i = 0; i < px.length; i += 4)
    if ((px[i] - kr) ** 2 + (px[i + 1] - kg) ** 2 + (px[i + 2] - kb) ** 2 < tol * tol) { px[i + 3] = 0; n++; }
  // ponytail: hard key, no despill or soft edge; add both if a keyed (non-alpha) sheet ever gets frozen
  console.log(`no alpha in ${stem}: keyed #${hex} (tol ${tol}), ${n} px cleared`);
}

// Islands on a 4 px grid (8-connected), so hairline gaps inside one piece don't split it
// while the ~40 px gaps between pieces do.
const C = 4, gw = Math.ceil(W / C), gh = Math.ceil(H / C), cnt = new Uint32Array(gw * gh);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
  if (px[(y * W + x) * 4 + 3] >= 16) cnt[((y / C) | 0) * gw + ((x / C) | 0)]++;
const label = new Int32Array(gw * gh).fill(-1), islands = [];
for (let s = 0; s < cnt.length; s++) {
  if (!cnt[s] || label[s] >= 0) continue;
  const isl = { x0: Infinity, y0: Infinity, x1: -1, y1: -1, area: 0 }, stack = [s];
  label[s] = islands.length;
  while (stack.length) {
    const c = stack.pop(), cx = c % gw, cy = (c / gw) | 0;
    isl.area += cnt[c];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = cx + dx, ny = cy + dy, n = ny * gw + nx;
      if (nx >= 0 && ny >= 0 && nx < gw && ny < gh && cnt[n] && label[n] < 0) { label[n] = islands.length; stack.push(n); }
    }
  }
  islands.push(isl);
}
const islandAt = (x, y) => label[((y / C) | 0) * gw + ((x / C) | 0)];
// Exact pixel bounds per island (any alpha, so faint edge pixels count too).
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!px[(y * W + x) * 4 + 3] || islandAt(x, y) < 0) continue;
  const t = islands[islandAt(x, y)];
  t.x0 = Math.min(t.x0, x); t.x1 = Math.max(t.x1, x); t.y0 = Math.min(t.y0, y); t.y1 = Math.max(t.y1, y);
}

let boxes;
if (args.auto) {
  // Islands smaller than --min-area opaque px are dropped as specks.
  const minArea = Number(args['min-area'] ?? 500), pad = Number(args.pad ?? 4);
  const kept = islands.filter(t => t.area >= minArea).sort((a, b) => a.x0 - b.x0 || a.y0 - b.y0);
  const dropped = islands.filter(i => i.area < minArea);
  console.log(`${islands.length} alpha island(s): ${kept.length} kept, ${dropped.length} dropped under ${minArea} px` +
    (dropped.length ? ` (areas ${dropped.map(d => d.area).join(', ')})` : ''));
  boxes = Object.fromEntries(kept.map((t, i) => {
    const x = Math.max(0, t.x0 - pad), y = Math.max(0, t.y0 - pad);
    return [`${stem}_${i + 1}`, [x, y, Math.min(W, t.x1 + 1 + pad) - x, Math.min(H, t.y1 + 1 + pad) - y]];
  }));
  mkdirSync(dirname(boxesPath), { recursive: true });
  writeFileSync(boxesPath, JSON.stringify(boxes, null, 2) + '\n');
  console.log(`boxes for review: ${boxesPath}`);
} else {
  boxes = JSON.parse(readFileSync(boxesPath, 'utf8'));
}

mkdirSync(OUT, { recursive: true });
for (const [part, [x, y, w, h]] of Object.entries(boxes)) {
  if (!(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= W && y + h <= H)) die(`box ${part} [${x}, ${y}, ${w}, ${h}] is outside ${W}x${H}`);
  const crop = Buffer.alloc(w * h * 4);
  for (let r = 0; r < h; r++) px.copy(crop, r * w * 4, ((y + r) * W + x) * 4, ((y + r) * W + x + w) * 4);
  // Clear any island that pokes into the box but isn't wholly inside it (a neighbour), and alpha<16 dust outside every island.
  const inside = islands.map(t => t.x0 >= x && t.y0 >= y && t.x1 < x + w && t.y1 < y + h);
  let cleared = 0;
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const i = islandAt(x + c, y + r), o = (r * w + c) * 4 + 3;
    if ((i < 0 || !inside[i]) && crop[o]) { crop.fill(0, o - 3, o + 1); cleared++; }
  }
  if (cleared) console.log(`${part}: cleared ${cleared} px (neighbouring islands, alpha<16 dust)`);
  const out = join(OUT, `${part}.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-i', '-', '-pix_fmt', 'rgba', out], { input: crop });
  console.log(`${part}: [${x}, ${y}, ${w}, ${h}] -> ${out}`);
}
