#!/usr/bin/env node
// Composite cut eye pieces onto the frozen gator_sheet's side head (turn_side) at the measured eye position, 1:1 scale.
//   node on_head.mjs <out.jpg> orig <piece.png>:<cx>:<cy>:<k> ...
// cx, cy: the eye disc's centre inside the unscaled piece (measured with measure.mjs). k: the sheet's one uniform scale
// (59.5 / that variant's open-eye diameter), applied to every piece alike. "orig" is the head as frozen.
// The painted eye is first filled with the head green (its flood region, grown 3 px), so no old cream shows round the swap.
import { execFileSync } from 'node:child_process';
const SHEET = new URL('../../assets/frozen/gator_sheet.png', import.meta.url).pathname;
const EYE = [298.5, 130], CROP = [190, 60, 330, 190], ZOOM = 3;  // measured: 59 x 60 px disc at (298.5, 130)
const [out, ...tiles] = process.argv.slice(2);
const probe = f => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
  'stream=width,height', '-of', 'json', f], { encoding: 'utf8' })).streams[0];
const rgba = (f, k = 1) => { const p = probe(f), w = Math.round(p.width * k), h = Math.round(p.height * k);
  return { w, h, px: execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', `scale=${w}:${h}:flags=lanczos`, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: w * h * 4 + 1024 }) }; };
const S = rgba(SHEET), [X, Y, CW, CH] = CROP;
const crop = () => { const b = Buffer.alloc(CW * CH * 4);
  for (let r = 0; r < CH; r++) S.px.copy(b, r * CW * 4, ((Y + r) * S.w + X) * 4, ((Y + r) * S.w + X + CW) * 4); return b; };
// Erase the painted eye: flood the non-green opaque region from the disc centre's left edge, grow 3 px, fill with mean head green.
const erase = b => {
  const green = i => b[i + 1] > b[i] + 12 && b[i + 1] > b[i + 2] + 12, eye = new Uint8Array(CW * CH);
  const st = [[Math.round(EYE[0] - X - 24), Math.round(EYE[1] - Y)]];
  while (st.length) { const [x, y] = st.pop(), p = y * CW + x;
    if (x < 0 || y < 0 || x >= CW || y >= CH || eye[p] || b[p * 4 + 3] < 128 || green(p * 4)) continue;
    eye[p] = 1; st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
  let n = 0; const sum = [0, 0, 0];
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const d = Math.hypot(x + X - EYE[0], y + Y - EYE[1]);
    if (d > 34 && d < 44 && green((y * CW + x) * 4)) { for (let c = 0; c < 3; c++) sum[c] += b[(y * CW + x) * 4 + c]; n++; } }
  const g = sum.map(s => Math.round(s / n));
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    let hit = false; for (let dy = -3; dy <= 3 && !hit; dy++) for (let dx = -3; dx <= 3; dx++) {
      const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < CW && ny < CH && eye[ny * CW + nx]) { hit = true; break; } }
    if (hit) for (let c = 0; c < 3; c++) b[(y * CW + x) * 4 + c] = g[c];
  }
};
const over = (b, f, cx, cy) => { const P = rgba(f, K), ox = Math.round(EYE[0] - X - cx), oy = Math.round(EYE[1] - Y - cy);
  for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) { const tx = x + ox, ty = y + oy;
    if (tx < 0 || ty < 0 || tx >= CW || ty >= CH) continue;
    const s = (y * P.w + x) * 4, d = (ty * CW + tx) * 4, a = P.px[s + 3] / 255;
    for (let c = 0; c < 3; c++) b[d + c] = Math.round(P.px[s + c] * a + b[d + c] * (1 - a)); } };
let K = 1;
const frames = tiles.map(t => { const b = crop(); if (t !== 'orig') { const [f, cx, cy, k] = t.split(':'); K = +k; erase(b); over(b, f, cx * K, cy * K); } return b; });
// Tiles stacked, laid over mid grey, then split, zoomed and set side by side.
const all = Buffer.concat(frames);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${CW}x${CH * frames.length}`, '-i', '-',
  '-filter_complex', `color=0x808080:s=${CW}x${CH * frames.length}[g];[g][0]overlay=format=auto,split=${frames.length}` +
  frames.map((_, i) => `[p${i}]`).join('') + ';' + frames.map((_, i) => `[p${i}]crop=${CW}:${CH}:0:${i * CH},scale=${CW * ZOOM}:-1:flags=lanczos[t${i}]`).join(';') +
  ';' + frames.map((_, i) => `[t${i}]`).join('') + (frames.length > 1 ? `hstack=inputs=${frames.length}` : 'null') + ',format=yuvj444p',
  '-frames:v', '1', '-q:v', '3', out], { input: all });
console.log(`${out}: ${frames.length} tile(s), eye centre (${EYE}) on gator_sheet turn_side, crop ${CROP}, x${ZOOM}`);
