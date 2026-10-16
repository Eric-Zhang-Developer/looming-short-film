// node luma.mjs <png> cam=x,y,z look=x,y,z  name:x,y,z ...   → mean luma (0..255) of a 16x16 patch at each world point
import { execFileSync } from 'node:child_process';
const [png, ...rest] = process.argv.slice(2);
const kv = Object.fromEntries(rest.filter((a) => a.startsWith('cam=') || a.startsWith('look=')).map((a) => a.split('=')));
const v = (s) => s.split(',').map(Number);
const PW = +(process.env.PW || 16), PH = +(process.env.PH || 16);
const C = v(kv.cam), Lk = v(kv.look), W = 1920, H = 1080, f = 1 / Math.tan(10 * Math.PI / 180);
const sub = (a, b) => a.map((x, i) => x - b[i]), dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const norm = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const fw = norm(sub(Lk, C)), rt = norm(cross(fw, [0, 1, 0])), upv = cross(rt, fw);
for (const a of rest.filter((a) => a.includes(':'))) {
  const [name, p] = a.split(':'), d = sub(v(p), C), z = dot(d, fw);
  const px = Math.round(W / 2 + (dot(d, rt) / z) * f * H / 2), py = Math.round(H / 2 - (dot(d, upv) / z) * f * H / 2);
  const out = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', png, '-vf', `crop=${PW}:${PH}:${px - (PW >> 1)}:${py - (PH >> 1)},format=gray,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`, '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const m = /YAVG=([\d.]+)/.exec(out + '') ;
  console.log(`${name.padEnd(10)} (${p}) px ${px},${py}  luma ${m ? (+m[1]).toFixed(1) : '?'}`);
}
