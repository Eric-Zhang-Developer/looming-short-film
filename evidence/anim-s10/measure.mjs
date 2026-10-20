// node evidence/anim-s10/measure.mjs → blob wall-shadow scale from pixels at the spec's table times.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s10/measure.html');
const SPEC = { 0: 2.8, 1: 4.2, 2: 5.5, 3: 6.8, 4: 8.2, 5: 9.5, 6: 10.8 };
for (const [t, want] of Object.entries(SPEC)) {
  const tt = Math.min(+t, 5.99);
  const r = await page.evaluate((t) => window.measure(t), tt);
  const f = (v) => (v * 100).toFixed(1);
  console.log(`tLocal ${t}: shadow x ${f(r.shadow.x0)}..${f(r.shadow.x1)} cm, y ${f(r.shadow.y0)}..${f(r.shadow.y1)} cm (${r.shadow.n} px); ` +
    `blob ${f(r.blob.w)} cm wide; scale ${r.scale.toFixed(2)}x, spec ${want}x (${((r.scale / want - 1) * 100).toFixed(1)}%); ` +
    `gator+pack shadow ${r.others.n} px = ${(r.ratio * 100).toFixed(1)}% of the blob's`);
}
await browser.close(); server.close();
