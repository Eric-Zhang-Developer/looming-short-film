// node timeline.mjs <repo> : per-section score timeline (SVG via headless Chrome) → evidence/snd-score/timeline.png
import { readFileSync, writeFileSync } from 'node:fs';
const R = process.argv[2];
const { SCORE } = await import(`${R}/src/audio/score.js`);
const { SHOTS, beat } = await import(`${R}/src/timeline.js`);
const { launch } = await import(`${R}/tools/lib/page.mjs`);
const W = 1800, L = 150, X = (t) => L + (t / 180) * (W - L - 20), SR = 48000;
const secs = [[0,20,'Birth · Exam motif'],[20,60,'Avoidance · groove builds'],[60,78,'Marston · lone low note'],[78,88,'Quiet 1 · silence'],[88,100,'Reveal · chords'],[100,135,'First step · note, theme'],[135,160,'Quiet 2 · silence'],[160,180,'Button · theme resolved']];
const lanes = [['groove', (e) => e.motif === 'groove', '#d98c2b'], ['theme', (e) => e.motif === 'theme', '#3b7dd8'], ['piano other', (e) => e.voice === 'piano' && !e.motif, '#7a8aa0'],
  ['exam (box)', (e) => e.motif === 'exam', '#c0392b'], ['pad', (e) => e.voice === 'pad', '#5aa469'], ['sub', (e) => e.voice === 'sub', '#6c3483']];
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="520" font-family="Helvetica" font-size="12"><rect width="${W}" height="520" fill="#fff"/>`;
secs.forEach(([a, b, n], i) => { s += `<rect x="${X(a)}" y="20" width="${X(b) - X(a)}" height="480" fill="${n.includes('silence') ? '#eee' : i % 2 ? '#fbf6ee' : '#f3f7fb'}" stroke="#bbb"/><text x="${X(a) + 4}" y="36" font-weight="bold">${n}</text>`; });
for (const sh of SHOTS) for (const [n] of Object.entries(sh.beats)) { const x = X(beat(n)); s += `<line x1="${x}" x2="${x}" y1="44" y2="500" stroke="#999" stroke-dasharray="3,3"/><text transform="translate(${x + 3},54) rotate(90)" font-size="10" fill="#555">${n} ${beat(n)}s</text>`; }
lanes.forEach(([name, f, col], k) => {
  const y = 170 + k * 36; s += `<text x="8" y="${y + 16}">${name}</text>`;
  for (const e of SCORE.filter(f)) { const t = beat(e.beat) + e.at, d = (e.dur ?? 1) + (e.release ?? 0); s += `<rect x="${X(t)}" y="${y}" width="${Math.max(1.5, X(t + d) - X(t))}" height="24" fill="${col}" opacity="${0.35 + 0.6 * (e.vel ?? e.gain ?? 0.5)}"/>`; }
});
const b = readFileSync(`${R}/out/audio/stems/music.wav`), n = (b.length - 44) / 8; let pts = '';
for (let w = 0; w < 1800; w++) { const i0 = Math.floor(w * n / 1800), i1 = Math.floor((w + 1) * n / 1800); let ss = 0; for (let i = i0; i < i1; i++) { const v = b.readFloatLE(44 + i * 8); ss += v * v; }
  const db = Math.max(-60, 10 * Math.log10(ss / (i1 - i0) + 1e-12)); pts += `${X(w * 180 / 1800)},${500 - (db + 60) * 1.4} `; }
s += `<text x="8" y="480">music RMS</text><text x="8" y="494" font-size="10">(−60…0 dBFS)</text><polyline points="${pts}" fill="none" stroke="#222" stroke-width="1.2"/>`;
for (let t = 0; t <= 180; t += 10) s += `<text x="${X(t) - 8}" y="515" font-size="10">${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</text>`;
s += '</svg>';
const br = await launch(), pg = await br.newPage(); await pg.setViewport({ width: W, height: 520 });
await pg.setContent(s); writeFileSync(`${R}/evidence/snd-score/timeline.png`, await pg.screenshot()); await br.close();
