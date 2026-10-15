// node evidence/snd-cues/stems.mjs : the three stems' RMS over 180 s with shot boundaries → stems.png (after node tools/mix.mjs)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SHOTS } from '../../src/timeline.js';
import { launch } from '../../tools/lib/page.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const W = 1800, L = 90, X = (t) => L + (t / 180) * (W - L - 20), H = 150, SR = 48000;
const lanes = [['music', '#3b7dd8'], ['foley', '#d98c2b'], ['ambience', '#5aa469']];
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${60 + lanes.length * (H + 20) + 20}" font-family="Helvetica" font-size="12"><rect width="100%" height="100%" fill="#fff"/>`;
for (const sh of SHOTS) s += `<text x="${X(sh.start) + 2}" y="14" font-size="10" fill="#555">${sh.id}</text>`;
lanes.forEach(([name, col], k) => {
  const y0 = 30 + k * (H + 20), b = readFileSync(`${root}out/audio/stems/${name}.wav`), n = (b.length - 44) / 8;
  s += `<rect x="${L}" y="${y0}" width="${W - L - 20}" height="${H}" fill="#fafafa" stroke="#ccc"/><text x="8" y="${y0 + 20}" font-weight="bold">${name}</text><text x="8" y="${y0 + 36}" font-size="10">RMS -60…0 dBFS</text>`;
  for (const sh of SHOTS) s += `<line x1="${X(sh.start)}" x2="${X(sh.start)}" y1="${y0}" y2="${y0 + H}" stroke="#bbb" stroke-dasharray="3,3"/>`;
  let pts = `${X(0)},${y0 + H} `;
  for (let w = 0; w < 1800; w++) {                                   // 0.1 s windows
    const i0 = Math.floor(w * n / 1800), i1 = Math.floor((w + 1) * n / 1800); let ss = 0;
    for (let i = i0; i < i1; i++) { const v = b.readFloatLE(44 + i * 8); ss += v * v; }
    const db = Math.max(-60, 10 * Math.log10(ss / (i1 - i0) + 1e-12));
    pts += `${X(w / 10)},${y0 + H - ((db + 60) / 60) * H} `;
  }
  s += `<polygon points="${pts}${X(180)},${y0 + H}" fill="${col}" opacity="0.55" stroke="${col}"/>`;
});
const yb = 30 + lanes.length * (H + 20);
for (let t = 0; t <= 180; t += 10) s += `<text x="${X(t) - 8}" y="${yb + 6}" font-size="10">${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</text>`;
s += '</svg>';
const br = await launch(), pg = await br.newPage(); await pg.setViewport({ width: W, height: 60 + lanes.length * (H + 20) + 20 });
await pg.setContent(s); writeFileSync(`${root}evidence/snd-cues/stems.png`, await pg.screenshot()); await br.close();
