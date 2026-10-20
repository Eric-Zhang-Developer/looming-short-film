// node evidence/fix-threshold/measure.mjs <image> <label>=x,y,w,h ...   mean sRGB and luma (Rec.709) of each box, via ffmpeg
import { execFileSync } from 'node:child_process';
const [img, ...boxes] = process.argv.slice(2);
for (const b of boxes) {
  const [label, spec] = b.split('='), [x, y, w, h] = spec.split(',').map(Number);
  const raw = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', img, '-vf', `crop=${w}:${h}:${x}:${y}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  const s = [0, 0, 0]; for (let i = 0; i < raw.length; i += 3) for (let c = 0; c < 3; c++) s[c] += raw[i + c];
  const m = s.map((v) => v / (raw.length / 3)), Y = 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
  console.log(`${label.padEnd(14)} rgb ${m.map((v) => v.toFixed(0).padStart(3)).join(' ')}  luma ${Y.toFixed(0)}`);
}
