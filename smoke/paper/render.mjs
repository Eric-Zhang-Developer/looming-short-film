// Headless render of the smoke-paper scene: stills, shadow crop, boil strip, tissue test,
// a pixel measurement of shadow scale, a determinism hash check and ms/frame.
// Usage: node smoke/paper/render.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'evidence/smoke-paper');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
fs.mkdirSync(OUT, { recursive: true });

// ES modules don't load from file://, so serve the repo root on a throwaway port.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${server.address().port}/smoke/paper/index.html`);
await page.waitForFunction('window.ready === true', { timeout: 30000 }).catch(() => {
  console.error(logs.join('\n')); process.exit(1);
});

const save = (name, dataUrl) => {
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(path.join(OUT, name), buf);
  return crypto.createHash('sha256').update(buf).digest('hex');
};
// One timed frame: render, then force the GPU to finish with a 1-px readback.
const timed = async (t) => {
  const t0 = performance.now();
  await page.evaluate((t) => { renderFrame(t); const gl = document.querySelector('canvas').getContext('webgl2'); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); }, t);
  return performance.now() - t0;
};
const still = async (t, name) => { await timed(t); return save(name, await page.evaluate(() => png())); };

const info = await page.evaluate(() => window.info);
console.log('computed shadow scale (doc 02 formula, along light->cutout-center ray):');
console.log(`  phone ${info.phone.scale.toFixed(3)}x  light at ${info.phone.pos.map((v) => v.toFixed(3))}`);
console.log(`  lamp  ${info.lamp.scale.toFixed(3)}x  light at ${info.lamp.pos.map((v) => v.toFixed(3))}`);

// Determinism, part 1: t=0.5 before anything else is cached.
const hashA = await still(0.5, 'phone_t0.5.jpg');

const lampHash = await still(4.0, 'lamp_t4.0.jpg');

// Measure the shadow against the cutout (pixels, then back-projected to meters).
const mPhone = await page.evaluate(() => measure(0.5, 'wall'));
const mLamp = await page.evaluate(() => measure(4.0, 'desk'));
fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify({ computed: info, phone_t0_5: mPhone, lamp_t4_0: mLamp }, null, 2));
for (const [k, m] of [['phone', mPhone], ['lamp', mLamp]])
  console.log(`observed ${k}: shadow ${m.shadowPx.w}x${m.shadowPx.h}px vs cutout ${m.cutoutPx.w}x${m.cutoutPx.h}px -> screen ${m.screenRatioW.toFixed(2)}x wide, world ${m.worldRatioW.toFixed(2)}x wide (${(m.shadowWidth_m * 100).toFixed(1)} cm / ${(m.cutoutWidth_m * 100).toFixed(1)} cm)`);

// Shadow crop from the real t=0.5 frame, framed on the measured shadow box.
const pad = 30, s = mPhone.shadowPx;
await page.evaluate(() => renderFrame(0.5));
save('shadow_crop.png', await page.evaluate((x, y, w, h) => crop(x, y, w, h), s.x0 - pad, s.y0 - pad, s.w + 2 * pad, s.h + 2 * pad));

// Boil strip: t = 0.0, 0.1, 0.2 cropped at full res around the cutout.
const c = mPhone.cutoutPx, cp = 40;
save('boil_strip.png', await page.evaluate((x, y, w, h) => strip([0.0, 0.1, 0.2], x, y, w, h), c.x0 - cp, c.y0 - cp, c.w + 2 * cp, c.h + 2 * cp));

// Tissue: same shade and bulb, translucency off (left) vs on (right).
save('tissue.png', await page.evaluate(() => {
  const x = 1150, y = 380, w = 420, h = 420, out = document.createElement('canvas');
  out.width = 2 * w + 8; out.height = h;
  const ctx = out.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, out.width, h);
  [0, 0.6].forEach((tr, k) => { renderTissue(tr); ctx.drawImage(document.querySelector('canvas'), x, y, w, h, k * (w + 8), 0, w, h); });
  return out.toDataURL('image/png');
}));

// Timing: steady-state render (shaders compiled), plus a boil-step frame that rebuilds textures.
const ms = [];
for (let i = 0; i < 20; i++) ms.push(await timed(0.5));
const boilMs = [];
for (let i = 0; i < 20; i++) boilMs.push(await timed(5 + i * 0.1)); // new seed every frame, uncached
const capMs = [];
for (let i = 0; i < 5; i++) { const t0 = performance.now(); await still(0.5, 'tmp.png'); capMs.push(performance.now() - t0); }
fs.unlinkSync(path.join(OUT, 'tmp.png'));
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const timing = [
  `render.mjs on ${process.platform}, Chrome ${await browser.version()}, three ${JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/three/package.json'))).version}, 1920x1080`,
  `render only, cached boil step (median of ${ms.length}): ${med(ms).toFixed(1)} ms/frame  [min ${Math.min(...ms).toFixed(1)}, max ${Math.max(...ms).toFixed(1)}]`,
  `render with a new boil step, texture rebuild (median of ${boilMs.length}): ${med(boilMs).toFixed(1)} ms/frame  [min ${Math.min(...boilMs).toFixed(1)}, max ${Math.max(...boilMs).toFixed(1)}]`,
  `render + PNG capture to disk (median of ${capMs.length}): ${med(capMs).toFixed(1)} ms/frame`,
  'Timed from Node around page.evaluate, with a 1-px readPixels to wait for the GPU.',
];
fs.writeFileSync(path.join(OUT, 'timing.txt'), timing.join('\n') + '\n');
console.log(timing.join('\n'));

// Determinism, part 2: t=0.5 again, after other frames, a lamp switch and many boil seeds.
const hashB = await still(0.5, 'phone_t0.5_again.png');
const same = hashA === hashB;
fs.writeFileSync(path.join(OUT, 'hashes.txt'), [
  `${hashA}  phone_t0.5.jpg (first render of the session)`,
  `${hashB}  phone_t0.5_again.png (re-render after t=4.0, measurements, boil frames, tissue test)`,
  `${lampHash}  lamp_t4.0.jpg`,
  same ? 'IDENTICAL' : 'DIFFERENT',
].join('\n') + '\n');
console.log(`determinism t=0.5: ${same ? 'IDENTICAL' : 'DIFFERENT'} ${hashA.slice(0, 16)} ${hashB.slice(0, 16)}`);
if (same) fs.unlinkSync(path.join(OUT, 'phone_t0.5_again.png'));
if (logs.length) console.log('page console:\n' + logs.join('\n'));

await browser.close();
server.close();
