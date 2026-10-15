// node evidence/contract-puppet/checks.mjs   (from the repo root)
// 1. Swap check, same method as evidence/mod-material/checks.mjs: render frame 0 (compiles and uploads everything),
//    snapshot renderer.info and object identity, render frames 1..48 at 24 fps, snapshot again.
// 2. Boil steps: lab/puppet.html holds stress pose A over [4, 6), so only boil changes the gator. For each boil step
//    t = 4.05, 4.15, ... (rate 10) it reads every part's sheet seed and the alphaMap of body and head, and counts
//    alpha px that flipped since the previous step (re-tear) against the silhouette's area (holds = small fraction).
// Writes swap_check.txt and boil_check.txt next to this file.
import fs from 'node:fs';
import { serve, launch, openPage } from '../../tools/lib/page.mjs';

const OUT = 'evidence/contract-puppet';
const { server, base } = await serve();
const browser = await launch();

const p1 = await openPage(browser, base, 'lab/puppet.html');
const swap = await p1.evaluate(() => {
  const { stage, gator } = window.lab, renderer = stage.renderer, ms = Object.values(gator.meshes);
  const snap = () => ({ geos: renderer.info.memory.geometries, progs: renderer.info.programs.length, tex: renderer.info.memory.textures,
    ids: ms.map((m) => m.geometry.uuid).join(','), mats: ms.map((m) => m.material.uuid).join(','), maps: ms.map((m) => m.material.map.uuid).join(',') });
  window.renderFrame(0);
  const a = snap(), seeds = new Set();
  for (let f = 1; f <= 48; f++) { window.renderFrame(f / 24); seeds.add(gator.meshes.body.userData.sheet.seed); }
  return { a, b: snap(), seeds: [...seeds] };
});
const okSwap = swap.a.geos === swap.b.geos && swap.a.progs === swap.b.progs && swap.a.ids === swap.b.ids && swap.a.mats === swap.b.mats && swap.a.maps !== swap.b.maps;
const sw = [
  `gator.boil: lab/puppet.html (9 parts), frames 0..48 at 24 fps, body boil seeds seen: ${swap.seeds.join(',')}`,
  `  renderer.info.memory.geometries  before ${swap.a.geos}  after ${swap.b.geos}`,
  `  renderer.info.programs           before ${swap.a.progs}  after ${swap.b.progs}`,
  `  renderer.info.memory.textures    before ${swap.a.tex}  after ${swap.b.tex}   (new boil textures are expected; paper.js caches them)`,
  `  geometry uuids unchanged: ${swap.a.ids === swap.b.ids}`,
  `  material uuids unchanged: ${swap.a.mats === swap.b.mats}`,
  `  map uuids changed (the swap happened): ${swap.a.maps !== swap.b.maps}`,
  `result: ${okSwap ? 'PASS' : 'FAIL'}`,
];
fs.writeFileSync(`${OUT}/swap_check.txt`, sw.join('\n') + '\n');
console.log(sw.join('\n') + '\n');

const p2 = await openPage(browser, base, 'lab/puppet.html');
const steps = await p2.evaluate(() => {
  const { gator } = window.lab, out = [], prev = {};
  const alpha = (part) => { const c = gator.meshes[part].material.alphaMap.image; return c.getContext('2d').getImageData(0, 0, c.width, c.height).data; };
  for (let k = 0; k < 10; k++) {
    const t = 4.05 + k / 10;
    window.renderFrame(t);
    const row = { t, seeds: Object.fromEntries(Object.entries(gator.meshes).map(([n, m]) => [n, m.userData.sheet.seed])) };
    for (const part of ['body', 'head']) {
      const a = alpha(part);
      let area = 0, flip = 0;
      for (let i = 1; i < a.length; i += 4) { const on = a[i] > 127; area += on; if (prev[part]) flip += on !== (prev[part][i] > 127); }
      row[part] = { area, flip };
      prev[part] = a;
    }
    out.push(row);
  }
  return out;
});
await browser.close(); server.close();

const lines = ['Boil steps at rate 10, stress pose A held (lab/puppet.html t in [4, 6)). flip = alphaMap px (green channel, which three samples, > 0.5) changed since the previous step.'];
let ok = true;
steps.forEach((r, k) => {
  const seeds = new Set(Object.values(r.seeds));
  const f = (p) => `${p} area ${r[p].area} flip ${r[p].flip} (${(100 * r[p].flip / r[p].area).toFixed(2)}%)`;
  lines.push(`t=${r.t.toFixed(2)}  all 9 parts at seed ${[...seeds].join('/')}  ${f('body')}  ${f('head')}`);
  if (seeds.size !== 1) ok = false;
  if (k > 0 && (r.body.flip === 0 || r.head.flip === 0 || r.body.flip / r.body.area > 0.05 || r.head.flip / r.head.area > 0.05)) ok = false;
});
lines.push(`pass rule: every step re-tears (flip > 0), silhouette holds (flip < 5% of area), all parts share the seed → ${ok ? 'PASS' : 'FAIL'}`);
fs.writeFileSync(`${OUT}/boil_check.txt`, lines.join('\n') + '\n');
console.log(lines.join('\n'));
process.exit(okSwap && ok ? 0 : 1);
