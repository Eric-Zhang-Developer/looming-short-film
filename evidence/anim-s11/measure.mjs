// node evidence/anim-s11/measure.mjs → shadow scales, camera track and face/key luma for s11 (local seconds).
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s11/measure.html');
const cm = (v) => (v * 100).toFixed(2);
const r = await page.evaluate(() => window.measure(2.0, 'desk'));
console.log(`pool t 2.0 (fluorescent, on the desk top y 0): x ${cm(r.shadow.x0)}..${cm(r.shadow.x1)} cm, z ${cm(r.shadow.z0)}..${cm(r.shadow.z1)} cm (${r.shadow.n} px); ` +
  `blob ${cm(r.blob.x0)}..${cm(r.blob.x1)} cm; scale ${r.scale.toFixed(2)}x (spec 1.0x, <= 1.2x); centre x ${cm(r.cx)} cm vs blob x 0`);
for (const [t, want] of [[3.65, 4.77], [4.0, null], [4.4, 5.90], [5.5, 5.90]]) {
  const r = await page.evaluate((t) => window.measure(t, 'wall'), t);
  console.log(`wall t ${t}: x ${cm(r.shadow.x0)}..${cm(r.shadow.x1)} cm, y ${cm(r.shadow.y0)}..${cm(r.shadow.y1)} cm (${r.shadow.n} px); blob ${cm(r.blob.w)} cm wide; ` +
    `scale ${r.scale.toFixed(2)}x` + (want ? `, spec ${want}x (${((r.scale / want - 1) * 100).toFixed(1)}%)` : '') + `; centre (${cm(r.cx)}, ${cm(r.cy)}) cm`);
}
for (const t of [0, 1, 2, 2.6, 3, 4, 5, 5.99]) {
  const [p, rot] = await page.evaluate((t) => window.cam(t), t);
  console.log(`camera t ${t}: pos (${p.map((v) => v.toFixed(5)).join(', ')}) rot (${rot.join(', ')})`);
}
// §10: face (eye/snout box) against the key-lit receiver. Pre-3.6 the key lights the desk top only; from 3.6 the wall.
for (const [t, faceBox, keyBox, what] of [[2.0, [540, 520, 70, 60], [900, 640, 120, 8], 'lit desk top right of the blob'], [5.5, [560, 590, 60, 50], [760, 140, 100, 100], 'phone-lit wall outside the shadow']]) {
  const [face, key] = await page.evaluate((t, b) => window.luma(t, b), t, [faceBox, keyBox]);
  console.log(`luma t ${t} (no post): face ${face}, ${what} ${key}, ratio ${(face / key * 100).toFixed(0)}%`);
}
await browser.close(); server.close();
