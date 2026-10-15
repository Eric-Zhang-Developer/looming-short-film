// node evidence/anim-s08/seam_blur.mjs → how soft the seams are on the graded frame at 5.99 s (spec: blur 3 px or less).
// For each row of the right seam (y 260..520 px) the 10–90 % distance of the edge from the seam's plateau to the wall to its
// right (x 560..640), median over rows. The torn edge's own wobble is in it, so it is an upper bound on the blur.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const film = await openPage(browser, base, 'index.html');
const r = await film.evaluate(async (t) => {
  await window.renderFrame(t);
  const src = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
  const c = Object.assign(document.createElement('canvas'), { width: 1920, height: 1080 }), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(src, 0, 0);
  const widths = [];
  for (let y = 260; y < 520; y++) {
    const d = g.getImageData(560, y, 80, 1).data, L = [];
    for (let i = 0; i < 80; i++) L.push(0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]);
    const hi = Math.max(...L.slice(0, 40)), lo = Math.min(...L.slice(40)), at = L.findIndex((v, i) => i > L.indexOf(hi) && v < lo + 0.9 * (hi - lo));
    if (hi - lo < 60) continue;
    const a = L.findIndex((v, i) => i >= L.indexOf(hi) && v < lo + 0.9 * (hi - lo)), b = L.findIndex((v, i) => i >= L.indexOf(hi) && v < lo + 0.1 * (hi - lo));
    if (a >= 0 && b >= 0) widths.push(b - a);
  }
  widths.sort((x, y) => x - y);
  return { n: widths.length, median: widths[widths.length >> 1], p25: widths[widths.length >> 2], p75: widths[(3 * widths.length) >> 2] };
}, 59.99);
console.log(`right seam edge 10–90 %: median ${r.median} px (quartiles ${r.p25}..${r.p75}, ${r.n} rows)`);
await browser.close(); server.close();
