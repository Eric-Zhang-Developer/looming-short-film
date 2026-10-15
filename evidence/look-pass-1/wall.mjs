// Is the wall's texture visible across the whole frame? Run from the repo root: node evidence/look-pass-1/wall.mjs
// For each image: luminance (0-255) via ffmpeg, band-passed as (5x5 box blur) - (41x41 box blur): the dry-brush
// streaks and mottling at 5-40 px. Caveat: post's film grain (0.04) survives the 5x5 blur at roughly 1 grey level, so tiles
// near 1 can't be told apart from grain; trust the luminance numbers and the images for the plain wall. Over 12 x 6 tiles of 160 x 120 px covering y = 0..720 (the wall, above the desk line), report each tile's
// mean luminance and the RMS of the texture (the grid is printed row by row, top first, above each summary). Tiles with props in them are included: the minimum is what matters.
import { execFileSync } from 'node:child_process';
const W = 1920, H = 1080;
const gray = (f, vf) => execFileSync('ffmpeg', ['-loglevel', 'error', '-i', f, '-vf', `${vf}format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
for (const f of ['evidence/lookdev-composite/phone.jpg', 'evidence/look-pass-1/phone.jpg', 'evidence/lookdev-composite/lamp.jpg', 'evidence/look-pass-1/lamp.jpg']) {
  const a = gray(f, 'boxblur=2:1,'), b = gray(f, 'boxblur=20:1,');
  const mean = [], rms = [];
  for (let ty = 0; ty < 6; ty++) for (let tx = 0; tx < 12; tx++) {
    let s = 0, q = 0, n = 0;
    for (let y = ty * 120; y < ty * 120 + 120; y++) for (let x = tx * 160; x < tx * 160 + 160; x++) { const i = y * W + x, d = a[i] - b[i]; s += a[i]; q += d * d; n++; }
    mean.push(s / n); rms.push(Math.sqrt(q / n));
  }
  const st = (v) => { const s = [...v].sort((x, y) => x - y); return `min ${s[0].toFixed(1)}  median ${s[s.length >> 1].toFixed(1)}  max ${s.at(-1).toFixed(1)}`; };
  for (let r = 0; r < 6; r++) console.log("   " + rms.slice(r * 12, r * 12 + 12).map((v) => v.toFixed(1).padStart(5)).join(""));
  console.log(`${f}\n  tile mean luminance: ${st(mean)}\n  tile texture RMS:    ${st(rms)}`);
}
