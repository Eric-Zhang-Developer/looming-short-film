// node evidence/anim-s02/measure.mjs → evidence/anim-s02/measure.txt (stdout)
// Blob position at 8.83, shadow scale at 8.9, the eye-swap frame, the bead/run/fall/land/swell/eyes order, and the
// red-hue check on the 3.0 s still (evidence/anim-s02/t09_00.jpg, the film's frame with post).
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s02/measure.html');
const f3 = (v) => v.toFixed(4);

const B = [0.040, 0.012, 0.060];
const p = await page.evaluate(() => window.blobAt(8.8334));
const err = Math.hypot(p.x - B[0], p.y - B[1], p.z - B[2]);
console.log(`blob center at local 8.83: (${f3(p.x)}, ${f3(p.y)}, ${f3(p.z)}) scale ${p.s.toFixed(3)}; B = (${B.join(', ')}); error ${(err * 1000).toFixed(2)} mm → ${err <= 0.002 ? 'PASS' : 'FAIL'} (≤ 2 mm)`);

const s = await page.evaluate(() => window.shadow(8.9));
console.log(`shadow at local 8.9 (widest x chord, blob vs its shadow on the desk): blob ${(s.blob.chord * 1000).toFixed(2)} mm, ` +
  `shadow ${(s.shadow.chord * 1000).toFixed(2)} mm, scale ${s.scale.toFixed(3)}x → ${Math.abs(s.scale - 1) <= 0.1 ? 'PASS' : 'FAIL'} (1.0 ± 0.1)`);
console.log(`  overall x extent: blob ${(s.blob.w * 1000).toFixed(2)} mm (x ${f3(s.blob.x0)}..${f3(s.blob.x1)}), shadow ${(s.shadow.w * 1000).toFixed(2)} mm ` +
  `(x ${f3(s.shadow.x0)}..${f3(s.shadow.x1)}, ${s.shadow.n} px; longer by the light's shear); shadow centroid on the desk ` +
  `(${f3(s.centroid[0])}, 0, ${f3(s.centroid[1])}), spec's blob-center shadow (0.024, 0, 0.048)`);

console.log('his face by 24 fps frame around the swap:');
for (const k of [198, 199, 200, 201, 207, 208]) {
  const fc = await page.evaluate((t) => window.faceAt(t), k / 24);
  console.log(`  local ${(k / 24).toFixed(4)}  eyes ${fc.eyes.padEnd(6)} mouth ${fc.mouth}`);
}

console.log('the Exam through 3.33–6.5 (12 fps drawings, center and scale):');
for (let k = 39; k <= 78; k++) {
  const t = k / 12 + 1e-4, e = await page.evaluate((t) => window.blobAt(t), t);
  console.log(`  ${(k / 12).toFixed(2)}  ${e.visible ? `(${f3(e.x)}, ${f3(e.y)}, ${f3(e.z)}) s ${e.s.toFixed(3)}` : 'not visible'}`);
}

// Red-hue check on the full-res 3.0 s still: pixels with hue within 20° of red, value > 0.2 and saturation above a
// threshold, counted inside a 110 px box around the circle's projection (1493, 404) and outside it, at two thresholds.
for (const minSat of [0.35, 0.2]) {
  const red = await page.evaluate(async (minSat) => {
    const img = new Image(); img.src = '/evidence/anim-s02/t09_00.jpg'; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let inside = 0, outside = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      if (mx < 0.2 || mx - mn < minSat * mx || mx !== r) continue;
      let h = 60 * (gg - b) / (mx - mn); if (h < 0) h += 360;
      if (h > 20 && h < 340) continue;
      const x = (i / 4) % c.width, y = Math.floor(i / 4 / c.width);
      if (Math.abs(x - 1493) <= 55 && Math.abs(y - 404) <= 55) inside++; else outside++;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return { inside, outside, x0, x1, y0, y1, w: c.width, h: c.height };
  }, minSat);
  console.log(`red-hued pixels in t09_00.jpg (${red.w}x${red.h}), saturation > ${minSat}: ${red.inside} around the circle (1493, 404), ` +
    `${red.outside} elsewhere; all of them in x ${red.x0}..${red.x1}, y ${red.y0}..${red.y1}`);
}

// Character fill (README §10): his face against the key-lit wall, mean luma of 21 px boxes on the graded still.
const [head, snout] = await page.evaluate(() => window.headPx(6.4));
const luma = await page.evaluate(async (boxes) => {
  const img = new Image(); img.src = '/evidence/anim-s02/t12_40.jpg'; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  return boxes.map(([x, y]) => { const d = g.getImageData(x - 10, y - 10, 21, 21).data; let s = 0;
    for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; return s / (d.length / 4); });
}, [head, snout, [800, 300]]);
console.log(`face vs key-lit wall in t12_40.jpg: head (${head}) luma ${luma[0].toFixed(1)}, snout (${snout}) ${luma[1].toFixed(1)}, ` +
  `wall (800,300) ${luma[2].toFixed(1)} → head ${(100 * luma[0] / luma[2]).toFixed(0)}%, snout ${(100 * luma[1] / luma[2]).toFixed(0)}% (README §10: 30–45%)`);
await browser.close(); server.close();
