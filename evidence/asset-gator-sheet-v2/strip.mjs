// node strip.mjs <out.jpg> <height> <bg1,bg2,...> <file[:x:y:w:h]> ...
// One row of tiles (optional crop, scaled to <height>, 30 px gaps) composited over each bg colour, bands stacked. ffmpeg only.
import { execFileSync } from 'node:child_process';
const [out, H, bgs, ...tiles] = process.argv.slice(2);
const ins = [], f = [];
tiles.forEach((t, i) => {
  const [file, ...c] = t.split(':');
  ins.push('-i', file);
  f.push(`[${i}]format=rgba${c.length ? `,crop=${c[2]}:${c[3]}:${c[0]}:${c[1]}` : ''}${H === 'native' ? '' : `,scale=-2:${H}:flags=lanczos`},pad=iw+30:ih+60:30:30:color=black@0[t${i}]`);
});
f.push(`${tiles.map((_, i) => `[t${i}]`).join('')}${tiles.length > 1 ? `hstack=inputs=${tiles.length}` : "null"},pad=iw+30:ih:0:0:color=black@0,split=${bgs.split(',').length}${bgs.split(',').map((_, b) => `[r${b}]`).join('')}`);
bgs.split(',').forEach((bg, b) => f.push(`color=${bg},format=rgba[c${b}];[c${b}][r${b}]scale2ref[cc${b}][rr${b}];[cc${b}][rr${b}]overlay=format=auto[b${b}]`));
f.push(`${bgs.split(',').map((_, b) => `[b${b}]`).join('')}${bgs.split(',').length > 1 ? `vstack=inputs=${bgs.split(',').length}` : 'null'},format=yuvj444p`);
execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', f.join(';'), '-frames:v', '1', '-q:v', '3', out]);
console.log(out);
