#!/usr/bin/env node
// Radii of a clock face crop along the 12 o'clock column, in px from the face centre: outer edge, rim/face boundary, tick start/end.
//   node clock_radii.mjs <face.png (cut crop with alpha)>
import { execFileSync } from 'node:child_process';
const f = process.argv[2];
const [{ width: W, height: H }] = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', f], { encoding: 'utf8' })).streams;
const px = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: W * H * 4 + 99 });
const cx = (W - 1) / 2, cy = (H - 1) / 2, x = Math.round(cx);
const kind = y => { const i = (y * W + x) * 4, [r, g, b, a] = [px[i], px[i + 1], px[i + 2], px[i + 3]];
  return a < 128 ? 'none' : r > 215 && g > 200 && b > 170 ? 'cream' : b > r ? 'navy' : 'kraft'; };
const runs = []; let cur = null;
for (let y = 0; y <= Math.round(cy); y++) { const k = kind(y); if (!cur || cur.k !== k) runs.push(cur = { k, y0: y, y1: y }); else cur.y1 = y; }
console.log(JSON.stringify({ face: f.split('/').pop(), W, H, centre: [cx, cy], runs_from_top_as_radius: runs.filter(r => r.k !== 'none').map(r => [r.k, +(cy - r.y0).toFixed(0), +(cy - r.y1).toFixed(0)]) }));
