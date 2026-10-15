// node evidence/rig-legs/height.mjs: draws the side gator (and the front and back turnarounds, and the Freshman) alone
// through an orthographic camera at 0.05 mm/px (evidence/rig-legs/lab.html window.probe) and reports the box around
// the drawn pixels with the root at y = 0: sole (bottom), head top, and height. Passes if the side gator stands 8 cm ±0.3 mm.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/rig-legs/lab.html');
const rows = [['gator', 'stand'], ['gator', 'walk_side_pass'], ['gator', 'walk_side_a'], ['front', 'stand_front'], ['back', 'stand_back'], ['freshman', 'stand']];
let ok = true;
for (const [rig, pose] of rows) {
  const r = await page.evaluate((a, b) => window.probe(a, b), rig, pose);
  const mm = (v) => (v * 1000).toFixed(2).padStart(6);
  let verdict = '';
  if (rig === 'gator' && pose === 'stand') { const pass = Math.abs(r.height - 0.08) <= 0.0003; ok &&= pass; verdict = pass ? '  PASS (8 cm ±0.3 mm)' : '  FAIL (8 cm ±0.3 mm)'; }
  console.log(`${(rig + ' ' + pose).padEnd(22)} sole ${mm(r.bottom)} mm  top ${mm(r.top)} mm  height ${mm(r.height)} mm${verdict}`);
}
console.log(ok ? 'height: PASS' : 'height: FAIL');
await browser.close(); server.close();
process.exit(ok ? 0 : 1);
