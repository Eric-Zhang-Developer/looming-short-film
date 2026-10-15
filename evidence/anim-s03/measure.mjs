// node evidence/anim-s03/measure.mjs → blob wall-shadow scale from pixels at the spec's three table times.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s03/measure.html');
const SPEC = { 0.5: 2.33, 1.5: 3.0, 3.75: 3.33, 4.5: 3.33 };
for (const [t, want] of Object.entries(SPEC)) {
  const r = await page.evaluate((t) => window.measure(t), +t);
  const f = (v) => (v * 100).toFixed(2);
  console.log(`tLocal ${t}: shadow on wall x ${f(r.shadow.x0)}..${f(r.shadow.x1)} cm, y ${f(r.shadow.y0)}..${f(r.shadow.y1)} cm (${r.shadow.n} px); ` +
    `blob ${f(r.blob.w)} cm wide; scale ${r.scale.toFixed(2)}x, spec ${want}x (${((r.scale / want - 1) * 100).toFixed(1)}%)`);
}
await browser.close(); server.close();
