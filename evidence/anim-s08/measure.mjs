// node evidence/anim-s08/measure.mjs → the blob's wall-shadow scale from pixels at the spec's time (1.0 s), plus the
// sun slash overlap against his head/body and the blob (strip 0–6) from sun-on vs sun-off diffs.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s08/measure.html');
const f = (v) => (v * 100).toFixed(2);
for (const t of [1.0, 3.5, 5.0]) {
  const r = await page.evaluate((t) => window.measure(t), t);
  console.log(`tLocal ${t}: shadow on wall x ${f(r.shadow.x0)}..${f(r.shadow.x1)} cm (w ${f(r.shadow.w)}), y ${f(r.shadow.y0)}..${f(r.shadow.y1)} cm (h ${f(r.shadow.h)}); ` +
    `blob ${f(r.blob.w)} cm wide ${f(r.blob.h)} high; scale ${r.scale.toFixed(2)}x wide, ${r.scaleH.toFixed(2)}x high, spec 12.6x (${((r.scale / 12.6 - 1) * 100).toFixed(1)}%)`);
}
for (const t of [2.0, 4.0, 5.0, 5.5, 5.99]) {
  const r = await page.evaluate((t) => window.sunMask(t), t);
  console.log(`tLocal ${t}: sun-added px ${r.sun.n} box x ${r.sun.x0}..${r.sun.x1} y ${r.sun.y0}..${r.sun.y1}; blob box ${r.blob.x0}..${r.blob.x1} x ${r.blob.y0}..${r.blob.y1}; ` +
    `student box ${r.student.x0}..${r.student.x1} x ${r.student.y0}..${r.student.y1}; sun px inside blob ${r.vsBlob.inside}, inside student ${r.vsStudent.inside}; ` +
    `min screen distance to blob ${r.vsBlob.minDist.toFixed(0)} px, to student ${r.vsStudent.minDist.toFixed(0)} px`);
}
await browser.close(); server.close();
