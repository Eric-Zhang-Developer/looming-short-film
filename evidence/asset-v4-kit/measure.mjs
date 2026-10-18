#!/usr/bin/env node
// Head-size metrics, so "same head" is measured. No image library: ffmpeg decodes to RGBA.
//   node measure.mjs <png> <x> <y> <w> <h> <eyeX> <eyeY> [maxRow]
// Box = the head's island (hero: the head region above the hoodie collar; maxRow = last row counted, hero only).
// (eyeX may be the word auto) Prints W (back of head to snout tip, alpha>=128), snout thickness (top to bottom of the opaque pixels in the column
// at 88% of W), bump rise (head top at 40% of W above the snout top at 88%), and the eye disc: flood from the eye seed
// through opaque non-green pixels (stops at head green and at the dark-green lid/brow), as evidence/asset-face-sheet/measure.mjs.
import { execFileSync } from 'node:child_process';
const [png, bx, by, bw, bh, ex, ey, maxRow] = process.argv.slice(2);
const [{ width: W, height: H }] = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'json', png], { encoding: 'utf8' })).streams;
const px = execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: W * H * 4 + 1024 });
// Raw Codex sheets here are opaque on a flat #FF00FF key: treat key-coloured pixels (and their blended edge) as transparent.
for (let i = 0; i < px.length; i += 4) if (px[i + 3] === 255 && px[i] > 170 && px[i + 2] > 170 && px[i] - px[i + 1] > 90 && px[i + 2] - px[i + 1] > 90) px[i + 3] = 0;
const X0 = +bx, Y0 = +by, X1 = X0 + +bw, Y1 = Math.min(Y0 + +bh, maxRow ? +maxRow + 1 : 1e9);
const a = (x, y) => px[(y * W + x) * 4 + 3];
const gr = i => px[i + 1] > px[i] + 12 && px[i + 1] > px[i + 2] + 12; // W is measured on green pixels, so a cream breath puff or sweat drop can't stretch it
let x0 = 1e9, x1 = -1;
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) if (a(x, y) >= 128 && gr((y * W + x) * 4)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
const Wd = x1 - x0 + 1;
const col = f => { const x = Math.round(x0 + f * Wd); let t = -1, b = -1;
  for (let y = Y0; y < Y1; y++) if (a(x, y) >= 128) { if (t < 0) t = y; b = y; } return [t, b]; };
const [tB] = col(0.40), [tS, bS] = col(0.88);
const green = i => px[i + 1] > px[i] + 12 && px[i + 1] > px[i + 2] + 12;
// eyeX = auto: the largest cream blob in the upper-left 70% x 55% of the box that doesn't touch the box bottom
let seedX = +ex, seedY = +ey;
if (ex === 'auto') {
  const cream = i => px[i + 3] >= 128 && px[i] > 215 && px[i + 1] > 200 && px[i + 2] > 170;
  const lab = new Uint8Array(W * H); let best = 0;
  const lx1 = X0 + 0.7 * (X1 - X0), ly1 = Y0 + 0.55 * (Y1 - Y0);
  for (let y = Y0; y < ly1; y++) for (let x = X0; x < lx1; x++) {
    if (lab[y * W + x] || !cream((y * W + x) * 4)) continue;
    const s2 = [[x, y]]; let c = 0; lab[y * W + x] = 1;
    while (s2.length) { const [a2, b2] = s2.pop(); c++;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = a2 + dx, ny = b2 + dy;
        if (nx >= X0 && nx < lx1 && ny >= Y0 && ny < ly1 && !lab[ny * W + nx] && cream((ny * W + nx) * 4)) { lab[ny * W + nx] = 1; s2.push([nx, ny]); } } }
    if (c > best) { best = c; seedX = x; seedY = y; }
  }
}
const seen = new Uint8Array(W * H), st = Number.isFinite(seedX) ? [[seedX, seedY]] : [];
let q0 = 1e9, q1 = -1, r0 = 1e9, r1 = -1, n = 0;
while (st.length) { const [x, y] = st.pop();
  if (x < X0 || y < Y0 || x >= X1 || y >= Math.min(Y1, Y0 + 0.55 * (Y1 - Y0)) || seen[y * W + x]) continue;
  const i = (y * W + x) * 4; if (px[i + 3] < 128 || green(i)) continue;
  seen[y * W + x] = 1; n++; q0 = Math.min(q0, x); q1 = Math.max(q1, x); r0 = Math.min(r0, y); r1 = Math.max(r1, y);
  st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
const eyeOk = n > 700 && (q1 - q0 + 1) < 0.3 * Wd; // wider than 30% of the head = it leaked into the jaw (closed eye: no disc)
const r = v => +v.toFixed(4);
console.log(JSON.stringify({ png: png.split('/').pop(), head_x: [x0, x1], W: Wd, eye_area: n,
  snout_thick: bS - tS + 1, bump_rise: tS - tB,
  eye_box: eyeOk ? [q0, r0, q1 - q0 + 1, r1 - r0 + 1] : null, eye_w: eyeOk ? q1 - q0 + 1 : null,
  snout_thick_over_W: r((bS - tS + 1) / Wd), bump_rise_over_W: r((tS - tB) / Wd), eye_w_over_W: eyeOk ? r((q1 - q0 + 1) / Wd) : null }));
