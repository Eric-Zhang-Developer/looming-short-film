// node evidence/anim-s04/measure.mjs  → blob shadow scale on the wall (from pixels), cabinet overlap, Student wall shadow.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s04/measure.html');
const f = (v, d = 3) => v.toFixed(d);
const TARGET = { 1.0: [4.2, 0.4], 3.5: [5.0, 0.5], 7.5: [6.25, 0.6] };
for (const t of [1.0, 3.5, 7.5]) {
  const r = await page.evaluate((t) => window.measure(t), t), s = r.shadow, b = r.blob, [tg, tol] = TARGET[t];
  const k = (r.scaleW + r.scaleH) / 2, ok = Math.abs(r.scaleW - tg) <= tol;
  console.log(`tLocal ${t}: blob z ${f(r.bz)}  blob ${f(b.w * 100, 2)} x ${f(b.h * 100, 2)} cm  shadow ${f(s.w * 100, 1)} x ${f(s.h * 100, 1)} cm` +
    `  x ${f(s.x0)}..${f(s.x1)} y ${f(s.y0)}..${f(s.y1)}  center (${f((s.x0 + s.x1) / 2)}, ${f((s.y0 + s.y1) / 2)})`);
  console.log(`  scale: width ${f(r.scaleW, 2)}x  height ${f(r.scaleH, 2)}x  (target ${tg} ± ${tol}: ${ok ? 'PASS' : 'FAIL'} on width)`);
  if (t === 7.5) console.log(`  upper-cabinet band y 0.09..0.22: shadow covers y ${f(Math.max(0.09, s.y0))}..${f(Math.min(0.22, s.y1))} → ${s.y0 < 0.22 && s.y1 > 0.09 ? 'OVERLAPS' : 'NO OVERLAP'}`);
}
const st = await page.evaluate(() => window.student(5.0));
console.log(`Student wall shadow at 5.0: ${st.changed} px change when every Student part stops casting${st.box ? ` (box x ${f(st.box.x0)}..${f(st.box.x1)} y ${f(st.box.y0)}..${f(st.box.y1)})` : ''}`);
await browser.close(); server.close();
