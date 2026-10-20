// node evidence/exam-ink/s13_diff.mjs <before.png> <after.png> [out.jpg]  (full frames of index.html at t 89.6, from render.mjs --stills)
// Prints how many pixels changed and the bounding box of each changed patch (8 px grid, 8-connected), and writes
// out.jpg (default evidence/exam-ink/s13_diff.jpg): the after frame with every changed pixel painted magenta.
import { execFileSync } from 'node:child_process';
const [A, B, OUT = 'evidence/exam-ink/s13_diff.jpg'] = process.argv.slice(2), W = 1920, H = 1080;
const raw = (f) => execFileSync('ffmpeg', ['-loglevel', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 });
const a = raw(A), b = raw(B), G = 8, gw = W / G, gh = Math.ceil(H / G), cell = new Uint8Array(gw * gh);
let n = 0, maxd = 0;
const out = Buffer.from(b);
for (let i = 0; i < W * H; i++) {
  const d = Math.max(...[0, 1, 2].map((c) => Math.abs(a[3 * i + c] - b[3 * i + c])));
  if (!d) continue;
  n++; maxd = Math.max(maxd, d);
  cell[((i / W / G) | 0) * gw + ((i % W) / G | 0)] = 1;
  out[3 * i] = 255; out[3 * i + 1] = 0; out[3 * i + 2] = 255;
}
const seen = new Uint8Array(gw * gh), boxes = [];
for (let s = 0; s < gw * gh; s++) if (cell[s] && !seen[s]) {
  let [x0, y0, x1, y1] = [gw, gh, 0, 0]; const st = [s]; seen[s] = 1;
  while (st.length) {
    const c = st.pop(), x = c % gw, y = (c / gw) | 0;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy, k = yy * gw + xx;
      if (xx >= 0 && yy >= 0 && xx < gw && yy < gh && cell[k] && !seen[k]) { seen[k] = 1; st.push(k); }
    }
  }
  boxes.push(`x ${x0 * G}–${(x1 + 1) * G}, y ${y0 * G}–${(y1 + 1) * G}`);
}
console.log(`changed pixels: ${n} of ${W * H} (max channel delta ${maxd}); ${boxes.length} patches:\n  ${boxes.join('\n  ')}`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', '-q:v', '4', OUT], { input: out });
