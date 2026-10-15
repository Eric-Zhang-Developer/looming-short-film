// node evidence/anim-s07/measure.mjs → measure.txt: shadow scale at 9.5, the black's luminance, the moon patch and
// seams, and the face against the key-lit receiver (README §10). Times are shot-local (s07 starts at 44).
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const f2 = (v) => (v * 100).toFixed(2), pc = (v) => (v * 100).toFixed(1) + '%';

const raw = await openPage(browser, base, 'evidence/anim-s07/measure.html?raw');
for (const t of [9.0, 9.5]) {
  const r = await raw.evaluate((t) => window.scale(t), t);
  console.log(`scale tLocal ${t}: wall shadow x ${f2(r.shadow.x0)}..${f2(r.shadow.x1)} cm (width ${f2(r.shadow.w)} cm, spec 48 ± 5), ` +
    `y ${f2(r.shadow.y0)}..${f2(r.shadow.y1)} cm; blob ${f2(r.blob.w)} cm wide; scale ${r.scale.toFixed(2)}x (spec 20 ± 2); ` +
    `width / (2r = 2.4 cm) = ${(r.shadow.w / 0.024).toFixed(2)}x`);
}

const page = await openPage(browser, base, 'evidence/anim-s07/measure.html');
const L = (t, pts) => page.evaluate((t, pts) => window.luma(t, Object.fromEntries(Object.entries(pts).map(([k, [p, r]]) => [k, [new window.V(...p), r]]))), t, pts);
console.log('\nblack (curtainsDone 8.0 → phone 8.5), mean frame luma, graded:');
let worst = 0;
for (let i = 1; i <= 11; i++) {
  const t = 8 + i / 24, r = await L(t, {});
  worst = Math.max(worst, r.frame);
  console.log(`  ${t.toFixed(3)}: mean ${pc(r.frame)}, brightest px ${pc(r.max)}`);
}
console.log(`  worst mean ${pc(worst)} (spec < 5%): ${worst < 0.05 ? 'PASS' : 'FAIL'}`);

console.log('\nmoon patch (floor under the window, p95 and median luma) and the seams (mean luma per strip):');
for (const t of [1.0, 7.5, 7.96, 8.0, 8.25]) {
  const s = await page.evaluate((t) => window.seams(t), t);
  console.log(`  ${t.toFixed(2)}: floor p95 ${pc(s.floorP95)}, median ${pc(s.floorMed)}; seams left ${pc(s.left)}, centre ${pc(s.centre)}, right ${pc(s.right)}; panel ${pc(s.panel)}`);
}

console.log('\nface vs key-lit receiver (README §10: fill if under ~30%):');
for (const [t, rx] of [[1.0, 'patch'], [3.0, 'patch'], [5.0, 'patch'], [7.5, 'patch'], [9.5, 'wall']]) {
  const r = await L(t, { wall: [[0.25, 0.20, 0], 6] });
  const key = r[rx].mean;
  console.log(`  ${t.toFixed(1)}: face ${r.face.px} ${pc(r.face.mean)}; ${rx} ${r[rx].px} ${pc(key)}; ratio ${pc(r.face.mean / key)}`);
}
await browser.close(); server.close();
