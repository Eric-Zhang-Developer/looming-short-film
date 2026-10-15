// Evidence for mod-lights. render.mjs isn't merged yet, so this is a small inline puppeteer driver
// modeled on smoke/paper/render.mjs. Usage: node evidence/mod-lights/render.mjs [quick]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import * as THREE from 'three';
import { placeForScale, shadowScale, flicker } from '../../src/lights.js';
import { seedOf } from '../../src/core/rng.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'evidence/mod-lights');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const QUICK = process.argv[2] === 'quick';

// ---------- scale round trip (pure math, no browser) ----------
const scaleLines = ['placeForScale(scale=3) → shadowScale, wall at z = 0', ''];
for (const [S, height, side] of [[[0, 0.0275, 0.15], -0.024, -0.02], [[0.3, 0.05, 0.08], 0.1, 0.05], [[-0.2, 0.2, 0.4], 0, 0.15]]) {
  const subjectPos = new THREE.Vector3(...S);
  const L = placeForScale({ subjectPos, wallZ: 0, scale: 3, height, side });
  const s = shadowScale(L, subjectPos, 0);
  scaleLines.push(`subject (${S.join(', ')})  height ${height}  side ${side}  → light (${L.toArray().map((v) => v.toFixed(4)).join(', ')})  shadowScale ${s.toFixed(6)}  error ${(Math.abs(s - 3) / 3 * 100).toFixed(4)}%`);
}

// ---------- flicker stats over the whole film (pure math) ----------
const fseed = seedOf('fluorescent', 5);
const frames = Array.from({ length: 180 * 24 }, (_, i) => flicker(fseed, i / 24));
const dipped = frames.filter((k) => k < 0.9).length;
const labDips = [];
for (let i = 4 * 24; i < 6 * 24; i++) if (flicker(fseed, i / 24) < 0.9) labDips.push(i / 24);
const fluorLines = [
  `flicker(seedOf('fluorescent', 5), t) at 24 fps over 0–180 s: ${dipped} of ${frames.length} frames below 0.9 (${(dipped / frames.length * 100).toFixed(1)}%), min ${Math.min(...frames).toFixed(3)}`,
  `dipped frames in the lab's fluorescent span (4–6 s): ${labDips.map((t) => t.toFixed(3)).join(', ') || 'none'}`,
];
console.log(scaleLines.join('\n')); console.log(fluorLines.join('\n'));

// ---------- browser ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
const logs = [];
async function open() {
  const page = await browser.newPage();
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/lab/lights.html`);
  await page.waitForFunction('window.LOOMING && window.lab', { timeout: 30000 }).catch(() => { console.error(logs.join('\n')); process.exit(1); });
  // Page-side helpers: grab, crop and tile frames from the WebGL canvas.
  await page.evaluate(() => {
    const cv = () => document.querySelector('canvas');
    window.tile = (cells, cols, cw, ch, type = 'image/jpeg') => {   // cells: [{ t, x, y, w, h }]
      const gap = 6, rows = Math.ceil(cells.length / cols), o = document.createElement('canvas');
      o.width = cols * cw + (cols - 1) * gap; o.height = rows * ch + (rows - 1) * gap;
      const g = o.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, o.width, o.height);
      cells.forEach((c, k) => { renderFrame(c.t); g.drawImage(cv(), c.x ?? 0, c.y ?? 0, c.w ?? 1920, c.h ?? 1080, (k % cols) * (cw + gap), Math.floor(k / cols) * (ch + gap), cw, ch); });
      return o.toDataURL(type, 0.92);
    };
    window.frameJpg = (t) => { renderFrame(t); return cv().toDataURL('image/jpeg', 0.92); };
    window.framePng = (t) => { renderFrame(t); return cv().toDataURL('image/png'); };
  });
  return page;
}
const save = (name, dataUrl) => { const b = Buffer.from(dataUrl.split(',')[1], 'base64'); fs.writeFileSync(path.join(OUT, name), b); return b; };
const sha = (dataUrl) => crypto.createHash('sha256').update(Buffer.from(dataUrl.split(',')[1], 'base64')).digest('hex');

let page = await open();
save('phone.jpg', await page.evaluate(() => frameJpg(1)));
save('lamp.jpg', await page.evaluate(() => frameJpg(3)));
if (QUICK) {
  save('quick_fluor.jpg', await page.evaluate(() => frameJpg(5)));
  save('quick_dawn.jpg', await page.evaluate(() => tile([6, 7, 8, 9].map((t) => ({ t })), 4, 480, 270)));
  console.log(logs.join('\n')); await browser.close(); server.close(); process.exit(0);
}

// Phone shadow, measured from pixels the way smoke-paper did: render with the cutout invisible to the
// camera but still casting, diff against a frame with no cast, back-project every shadow pixel onto the
// wall and every cutout pixel onto the cutout plane, then compare world-space extents.
const m = await page.evaluate((t) => {
  const { THREE, stage, cutout, wall, desk, SUBJECT } = lab, { renderer, scene, camera } = stage;
  const W = 1920, H = 1080, gl = renderer.getContext();
  const px = () => { const p = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, p); return p; };
  renderFrame(t);
  const mat = cutout.material;
  mat.colorWrite = false; mat.depthWrite = false; renderer.render(scene, camera); const A = px();
  cutout.castShadow = false; renderer.render(scene, camera); const B = px();
  cutout.castShadow = true; mat.colorWrite = true; mat.depthWrite = true;
  const bg = scene.background; wall.visible = desk.visible = false; scene.background = new THREE.Color('#000');
  const flat = new THREE.MeshBasicMaterial({ color: '#fff', alphaMap: mat.alphaMap, alphaTest: 0.5, side: THREE.DoubleSide });
  cutout.material = flat; renderer.render(scene, camera); const C = px();
  cutout.material = mat; wall.visible = desk.visible = true; scene.background = bg; flat.dispose();
  const ray = new THREE.Raycaster(), v = new THREE.Vector2(), hit = new THREE.Vector3();
  const extent = (test, plane, keep = () => true) => {
    const e = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, n: 0 };
    for (let r = 0; r < H; r++) for (let x = 0; x < W; x++) {
      const i = (r * W + x) * 4; if (!test(i)) continue;
      v.set((x + 0.5) / W * 2 - 1, (r + 0.5) / H * 2 - 1);  // readPixels rows run bottom-up, same as NDC y
      ray.setFromCamera(v, camera); if (!ray.ray.intersectPlane(plane, hit) || !keep(hit)) continue;
      e.n++; e.x0 = Math.min(e.x0, hit.x); e.x1 = Math.max(e.x1, hit.x); e.y0 = Math.min(e.y0, hit.y); e.y1 = Math.max(e.y1, hit.y);
    }
    return { ...e, w: e.x1 - e.x0, h: e.y1 - e.y0 };
  };
  const sh = extent((i) => (B[i] + B[i + 1] + B[i + 2]) - (A[i] + A[i + 1] + A[i + 2]) > 24, new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), (h) => h.y >= 0);  // wall pixels only
  const cu = extent((i) => C[i] > 128, new THREE.Plane(new THREE.Vector3(0, 0, 1), -SUBJECT.z));
  renderFrame(t);
  return { shadow: sh, cutout: cu, ratioW: sh.w / cu.w, L: lab.phonePos.toArray() };
}, 1);
const cm = (v) => (v * 100).toFixed(2);
const f = (e) => `x ${(e.x0 * 100).toFixed(2)}..${(e.x1 * 100).toFixed(2)} cm, y ${(e.y0 * 100).toFixed(2)}..${(e.y1 * 100).toFixed(2)} cm (${e.n} px)`;
scaleLines.push('', 'Phone frame t = 1, measured from pixels (world extents after back-projection):',
  `  cutout on z = 0.15: ${f(m.cutout)}`, `  shadow on the wall:  ${f(m.shadow)}`,
  `  width ratio ${m.ratioW.toFixed(3)}× (target 3, error ${(Math.abs(m.ratioW - 3) / 3 * 100).toFixed(1)}%)`,
  `  predicted from 3·P − 2·L with L = (${m.L.map((v) => (v * 100).toFixed(2)).join(', ')}) cm: shadow x ${cm(3 * m.cutout.x0 - 2 * m.L[0])}..${cm(3 * m.cutout.x1 - 2 * m.L[0])} cm, top y ${cm(3 * m.cutout.y1 - 2 * m.L[1])} cm`,
  '  (the bottom of the shadow runs onto the desk, so height is checked by the top edge, not a ratio)');
fs.writeFileSync(path.join(OUT, 'scale.txt'), scaleLines.join('\n') + '\n');
fs.writeFileSync(path.join(OUT, 'fluor.txt'), fluorLines.join('\n') + '\n');
console.log(scaleLines.slice(-4).join('\n'));

// Fluorescent strip: 12 consecutive frames at 24 fps around the first dip in 4–6 s (whole frame, scaled).
const d0 = labDips.length ? Math.max(4, labDips[0] - 3 / 24) : 4.5;
const fluorTimes = Array.from({ length: 12 }, (_, i) => d0 + i / 24);
save('fluor_strip.jpg', await page.evaluate((ts) => tile(ts.map((t) => ({ t })), 6, 400, 225), fluorTimes));
fs.appendFileSync(path.join(OUT, 'fluor.txt'), `fluor_strip.jpg frames (row-major): ${fluorTimes.map((t) => t.toFixed(3)).join(', ')}\n` +
  `flicker at those frames: ${fluorTimes.map((t) => flicker(fseed, t).toFixed(3)).join(', ')}\n`);

// Dawn: 4 frames from cold (t = 6, k = 0) to gold (t = 9, k = 1).
save('dawn_strip.jpg', await page.evaluate(() => tile([6, 7, 8, 9].map((t) => ({ t })), 4, 480, 270)));

// Crop: full-res around the cutout's base and its shadows, phone (t = 1), lamp (t = 3), fluorescent (t = 4.5), dawn (t = 9).
save('crop.jpg', await page.evaluate(() => tile([1, 3, 4.5, 9].map((t) => ({ t, x: 760, y: 560, w: 400, h: 400 })), 4, 400, 400)));

// Determinism: four times in order, again in reverse after the others, then on a fresh page.
const TS = [0.5, 3, 5.2, 7.5];
const run = async (p, ts) => { const o = {}; for (const t of ts) o[t] = sha(await p.evaluate((t) => framePng(t), t)); return o; };
const h1 = await run(page, TS), h2 = await run(page, [...TS].reverse());
await page.close(); page = await open();
const h3 = await run(page, [7.5, 0.5, 5.2, 3]);
const det = TS.map((t) => `t=${t}  ${h1[t]}  ${h1[t] === h2[t] && h2[t] === h3[t] ? 'IDENTICAL' : `DIFFERENT (${h2[t]} / ${h3[t]})`}`);
const allSame = TS.every((t) => h1[t] === h2[t] && h2[t] === h3[t]);
fs.writeFileSync(path.join(OUT, 'determinism.txt'), [
  'sha256 of the PNG of lab/lights.html at each t: pass 1 in order, pass 2 in reverse order on the same page, pass 3 on a fresh page.',
  ...det, allSame ? 'PASS' : 'FAIL',
].join('\n') + '\n');
console.log(det.join('\n'), allSame ? 'PASS' : 'FAIL');
fs.writeFileSync(path.join(OUT, 'console.txt'), (logs.join('\n') || '(no console output)') + '\n');
console.log('console:\n' + (logs.join('\n') || '(none)'));
await browser.close();
server.close();
