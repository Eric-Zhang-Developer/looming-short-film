// node evidence/v7-fridge/measure.mjs > evidence/v7-fridge/shadows.txt
// The blob's wall shadow (from pixels) mid-way through each open, and with the door shut between them.
// Units (README §1) = scale · r / 0.012, with r = 0.018 (METER.gulp1).
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/v7-fridge/measure.html');
const f = (v, d = 3) => v.toFixed(d);
const TIMES = [[1.0, 'open 1'], [2.0, 'shut (away)'], [3.25, 'open 2'], [4.25, 'shut'], [6.0, 'open 3']];
const rows = [];
for (const [t, what] of TIMES) {
  const r = await page.evaluate((t) => window.measure(t), t), s = r.shadow, b = r.blob;
  if (!s.n) { console.log(`t ${f(t, 2)} (global ${f(26 + t, 2)}) ${what}: key ${r.key}  no wall shadow (0 px)`); continue; }
  const units = r.scaleW * 0.018 / 0.012;
  rows.push([what, s.w]);
  console.log(`t ${f(t, 2)} (global ${f(26 + t, 2)}) ${what}: key ${r.key}  blob z ${f(r.bz)}  blob ${f(b.w * 100, 2)} cm wide  ` +
    `shadow ${f(s.w * 100, 1)} x ${f(s.h * 100, 1)} cm  x ${f(s.x0)}..${f(s.x1)} y ${f(s.y0)}..${f(s.y1)}  scale ${f(r.scaleW, 2)}x  units ${f(units, 2)}`);
}
const grows = rows.every(([, w], i) => i === 0 || w > rows[i - 1][1]);
console.log(`shadow width by open: ${rows.map(([n, w]) => `${n} ${f(w * 100, 1)} cm`).join(' → ')}  ${grows ? 'GROWING' : 'NOT GROWING'}`);
await browser.close(); server.close();
