// node evidence/anim-s13/measure.mjs  → shadow scale (decal width ÷ blob width, from pixels) and eye holes per desk.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s13/measure.html');
for (const t of [0.2, 4.5, 6.5]) {
  console.log(`tLocal=${t}`);
  for (const r of await page.evaluate((t) => window.measure(t), t)) {
    if (!r.decal && r.decal !== undefined) { console.log(`  ${r.key.padEnd(4)} ${r.who.padEnd(9)} no shadow yet`); continue; }
    const ok = Math.abs(r.scale / r.target - 1) <= 0.2;
    console.log(`  ${r.key.padEnd(4)} ${r.who.padEnd(9)} target ${r.target.toFixed(1)}x  measured ${r.scale.toFixed(2)}x ${r.growing ? 'growing (wake + < 0.5 s)' : ok ? 'PASS' : 'FAIL'}` +
      `  (decal ${(r.decalW * 100).toFixed(1)} x ${(r.decalL * 100).toFixed(1)} cm, blob ${(r.blobW * 100).toFixed(2)} cm, l/w ${r.lw.toFixed(2)}, eye holes ${r.holes})`);
  }
}
const cast = await page.evaluate(() => window.cast());
console.log('crowd figures (acceptance 4: no two share pose + mirror + turn + scale)');
for (const c of cast) console.log(`  ${c.who.padEnd(9)} ${c.pose}${c.mirror ? ' mirrored' : '         '}  turn ${String(c.turnDeg).padStart(6)} deg  scale ${c.scale.toFixed(2)}`);
const ids = cast.map((c) => [c.pose, c.mirror, c.turnDeg, c.scale].join('|'));
console.log(`  unique: ${new Set(ids).size}/${ids.length}; poses shared (mirror or not): ${cast.length - new Set(cast.map((c) => c.pose)).size}`);
await browser.close(); server.close();
