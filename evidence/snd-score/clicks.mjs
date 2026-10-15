import { readFileSync } from 'node:fs';
const b = readFileSync(process.argv[2]); const off = b.indexOf('data') + 8, SR = 48000;
const L = (i) => b.readInt16LE(off + i * 4);
const win = (t) => { const i0 = Math.round(t * SR); return Array.from({ length: 0.3 * SR }, (_, k) => L(i0 - 0.05 * SR + k)); };
const ws = [36.5, 100.5, 164].map(win);
const pk = ws.map((w) => w.reduce((m, v) => Math.max(m, Math.abs(v)), 0));
console.log('click peaks in final 16-bit mix (L):', pk.map((p) => (20 * Math.log10(p / 32768)).toFixed(2) + ' dBFS').join(', '));
for (const k of [1, 2]) console.log(`max |diff| click ${k + 1} vs click 1:`, ws[k].reduce((m, v, i) => Math.max(m, Math.abs(v - ws[0][i])), 0), 'LSB');
