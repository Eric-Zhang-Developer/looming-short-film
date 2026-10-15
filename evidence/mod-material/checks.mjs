// node evidence/mod-material/checks.mjs   (from the repo root)
// 1. Does r186 cut shadows from the alphaMap without customDepthMaterial / customDistanceMaterial?
//    The cutout writes no color and no depth (colorWrite/depthWrite off) but still casts, so each frame is wall +
//    shadow alone. (Moving it to a layer only the shadow camera sees doesn't work: r186's shadow pass tests object
//    layers against the main camera.)
//    Modes: shipped (custom depth/distance set) · native (both removed) · control (removed and alphaTest 0, which
//    must give a solid rectangle, so the test can tell the difference) · none (cutout casts nothing: the baseline).
//    Shadow area = pixels at least 10 levels darker (luma) than the baseline.
// 2. Does updatePaperMesh allocate geometry? Renders 48 frames (20 boil steps) and compares geometry identity and
//    renderer.info.memory.geometries before and after.
// Writes alpha_shadow_test.txt, alpha_shadow_test.jpg and swap_check.txt next to this file.
import fs from 'node:fs';
import { serve, launch, openPage, toBuf } from '../../tools/lib/page.mjs';

const OUT = 'evidence/mod-material';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/material.html');

const shadowRun = (t, mode) => page.evaluate(async (t, mode) => {
  const { cutout } = window.lab;
  window.__keep ??= { d: cutout.customDepthMaterial, p: cutout.customDistanceMaterial };
  cutout.material.colorWrite = cutout.material.depthWrite = false;
  cutout.castShadow = mode !== 'none';
  const custom = mode === 'shipped';
  cutout.customDepthMaterial = custom ? window.__keep.d : undefined;
  cutout.customDistanceMaterial = custom ? window.__keep.p : undefined;
  cutout.material.alphaTest = mode === 'control' ? 0 : 0.5;
  cutout.material.needsUpdate = true;
  window.renderFrame(t);
  const c = document.querySelector('canvas'), o = document.createElement('canvas');
  o.width = c.width; o.height = c.height;
  const g = o.getContext('2d'); g.drawImage(c, 0, 0);
  const px = g.getImageData(0, 0, o.width, o.height).data;
  const luma = new Float32Array(px.length / 4);
  for (let i = 0; i < luma.length; i++) luma[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
  (window.__luma ??= {})[mode] = luma;
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', px))].map((b) => b.toString(16).padStart(2, '0')).join('');
  return { sha, url: o.toDataURL('image/jpeg', 0.9) };
}, t, mode);
const area = (mode) => page.evaluate((m) => { const a = window.__luma[m], b = window.__luma.none; let n = 0; for (let i = 0; i < a.length; i++) n += b[i] - a[i] >= 10; return n; }, mode);
const diff = (m1, m2) => page.evaluate((m1, m2) => { const a = window.__luma[m1], b = window.__luma[m2]; let n = 0; for (let i = 0; i < a.length; i++) n += a[i] !== b[i]; return n; }, m1, m2);

const lines = ['r186 native alpha-tested shadows: lab/material.html cutout, camera-invisible caster (colorWrite/depthWrite off), 1920x1080', ''];
const shots = [];
let answer = true, blind = false;
for (const [t, light] of [[12, 'SpotLight (customDepthMaterial)'], [32, 'PointLight (customDistanceMaterial)']]) {
  const r = {};
  for (const m of ['none', 'shipped', 'native', 'control']) { r[m] = await shadowRun(t, m); if (m !== 'none') shots.push(r[m].url); }
  const same = r.shipped.sha === r.native.sha;
  const sees = r.none.sha !== r.shipped.sha && r.control.sha !== r.shipped.sha;  // else the test is blind
  answer &&= same; blind ||= !sees;
  lines.push(`${light}, t=${t}`);
  for (const m of ['none', 'shipped', 'native', 'control']) lines.push(`  ${m.padEnd(8)} sha256 ${r[m].sha.slice(0, 16)}  shadow px ${m === 'none' ? 0 : await area(m)}`);
  lines.push(`  shipped vs native: ${await diff('shipped', 'native')} px differ → ${same ? 'IDENTICAL' : 'DIFFERENT'}`);
  lines.push(`  shipped vs control: ${await diff('shipped', 'control')} px differ (the test can see a rectangle)`, '');
}
lines.push(`answer: ${blind ? 'INCONCLUSIVE. A control matched the shipped frame, so the test cannot see shadow shape.' : answer
  ? 'YES. r186 cuts shadows from the material alphaMap + alphaTest on its own, for spot (depth) and point (distance) lights. The custom materials change no pixel. They stay per doc 04.'
  : 'NO. Without the custom materials the shadow changes; keep them.'}`);
fs.writeFileSync(`${OUT}/alpha_shadow_test.txt`, lines.join('\n') + '\n');
console.log(lines.join('\n'));

// The six shadow-only frames (spot: shipped, native, control · point: same) as one sheet, cropped to the shadow.
const sheetUrl = await page.evaluate(async (urls) => {
  const imgs = await Promise.all(urls.map((u) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = u; })));
  const [sx, sy, sw, sh] = [760, 300, 900, 640], w = 450, h = 320;
  const c = document.createElement('canvas'); c.width = 3 * w + 16; c.height = 2 * h + 8;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  imgs.forEach((im, i) => g.drawImage(im, sx, sy, sw, sh, (i % 3) * (w + 8), Math.floor(i / 3) * (h + 8), w, h));
  return c.toDataURL('image/jpeg', 0.9);
}, shots);
fs.writeFileSync(`${OUT}/alpha_shadow_test.jpg`, toBuf(sheetUrl));

// Swap check on a fresh page so the shadow test's toggles can't leak in.
const p2 = await openPage(browser, base, 'lab/material.html');
const swap = await p2.evaluate(() => {
  const { renderer, pieces } = window.lab;
  const snap = () => ({ geos: renderer.info.memory.geometries, progs: renderer.info.programs.length, tex: renderer.info.memory.textures,
    ids: pieces.map((p) => p.mesh.geometry.uuid).join(','), mats: pieces.map((p) => p.mesh.material.uuid).join(','),
    maps: pieces.map((p) => p.mesh.material.map.uuid).join(',') });
  window.renderFrame(0);  // first frame compiles and uploads everything
  const a = snap();
  for (let f = 1; f <= 48; f++) window.renderFrame(f / 24);
  const b = snap();
  return { a, b };
});
const sw = [
  'updatePaperMesh: lab/material.html view 0 (2 sheets), frames 0..48 at 24 fps = boil seeds 0..20',
  `  renderer.info.memory.geometries  before ${swap.a.geos}  after ${swap.b.geos}`,
  `  renderer.info.programs           before ${swap.a.progs}  after ${swap.b.progs}`,
  `  renderer.info.memory.textures    before ${swap.a.tex}  after ${swap.b.tex}   (new boil textures are expected)`,
  `  geometry uuids unchanged: ${swap.a.ids === swap.b.ids}`,
  `  material uuids unchanged: ${swap.a.mats === swap.b.mats}`,
  `  map uuids changed (the swap happened): ${swap.a.maps !== swap.b.maps}`,
  `result: ${swap.a.geos === swap.b.geos && swap.a.ids === swap.b.ids && swap.a.progs === swap.b.progs && swap.a.maps !== swap.b.maps ? 'PASS' : 'FAIL'}`,
];
fs.writeFileSync(`${OUT}/swap_check.txt`, sw.join('\n') + '\n');
console.log(sw.join('\n'));
await browser.close(); server.close();
