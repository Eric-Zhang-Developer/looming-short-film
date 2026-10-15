// node evidence/anim-s08/light.mjs [--tl=0,3,6]  → luma on graded index.html frames (the film, post and grade on):
//   wall   brightest phone-lit wall pixel (max and 99.9th percentile of luma over the open wall, left of the bed, window box excluded)
//   seams  max / mean luma in 6 px wide boxes on the right seam (x −0.1015), left seam (−0.1985) and the centre gap (−0.150),
//          y 0.13..0.23 on the pane (z 0.002), and the ratio of the right seam's max to the wall's brightest
//   face   mean luma of a 36 × 24 px box on his head against the key-lit wall (README §10, target 30–45 %)
import * as THREE from 'three';
import { serve, launch, openPage, args } from '../../tools/lib/page.mjs';
const cam = new THREE.PerspectiveCamera(20, 16 / 9, 0.05, 20);
cam.position.set(0.04, 0.15, 1.15); cam.lookAt(0.04, 0.13, 0.15); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
const px = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(cam); return [(v.x + 1) / 2 * 1920, (1 - v.y) / 2 * 1080]; };
const box = (x, y0, y1, z, w) => { const a = px(x, y0, z), b = px(x, y1, z); return [Math.round(a[0] - w / 2), Math.round(b[1]), w, Math.round(a[1] - b[1])]; };
const BOXES = {
  right: box(-0.1015, 0.13, 0.23, 0.002, 6), left: box(-0.1985, 0.13, 0.23, 0.002, 6), centre: box(-0.150, 0.13, 0.23, 0.002, 4),
  lit: [1080, 380, 40, 40],  // a key-lit patch of wall right of the shadow, inside the cone at every time
  face: (() => { const c = px(0.19, 0.052, 0.30); return [Math.round(c[0] - 18), Math.round(c[1] - 12), 36, 24]; })(),
};
const WALL = [0, 95, 1240, 760], SKIP = [300, 150, 440, 460];  // x y w h: the open wall; the window box inside it
const { server, base } = await serve();
const browser = await launch();
const film = await openPage(browser, base, 'index.html');
for (const tl of (args.tl ?? '0,3,6').split(',').map(Number)) {
  const r = await film.evaluate(async (t, BOXES, WALL, SKIP) => {
    await window.renderFrame(t);
    const src = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const c = Object.assign(document.createElement('canvas'), { width: 1920, height: 1080 }), g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(src, 0, 0);
    const Y = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    const stat = ([x, y, w, h]) => { const d = g.getImageData(x, y, w, h).data; let s = 0, m = 0; for (let i = 0; i < d.length; i += 4) { const v = Y(d, i); s += v; m = Math.max(m, v); } return { mean: s / (d.length / 4), max: m }; };
    const out = {};
    for (const [k, b] of Object.entries(BOXES)) out[k] = stat(b);
    const [x, y, w, h] = WALL, d = g.getImageData(x, y, w, h).data, vals = [];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const X = x + i, Yy = y + j; if (X >= SKIP[0] && X < SKIP[0] + SKIP[2] && Yy >= SKIP[1] && Yy < SKIP[1] + SKIP[3]) continue; vals.push(Y(d, (j * w + i) * 4)); if (vals[vals.length-1] > (out.at?.v ?? 0)) out.at = { v: vals[vals.length-1], X, Y: Yy }; }
    vals.sort((a, b) => a - b);
    out.wall = { max: vals[vals.length - 1], p999: vals[Math.floor(vals.length * 0.999)] };
    return out;
  }, 54 + tl, BOXES, WALL, SKIP);
  const f = (v) => v.toFixed(1);
  console.log(`tLocal ${tl}: wall max ${f(r.wall.max)} p99.9 ${f(r.wall.p999)} | seam max right ${f(r.right.max)} left ${f(r.left.max)} centre ${f(r.centre.max)} ` +
    `(mean ${f(r.right.mean)} / ${f(r.left.mean)} / ${f(r.centre.mean)}) | right/wall ${(r.right.max / r.wall.max).toFixed(2)}x, vs p99.9 ${(r.right.max / r.wall.p999).toFixed(2)}x | max at ${r.at.X},${r.at.Y} | face ${f(r.face.mean)} vs lit patch ${f(r.lit.mean)} = ${(100 * r.face.mean / r.lit.mean).toFixed(0)} %`);
}
await browser.close(); server.close();
