// Evidence driver for lab/post.html (render.mjs isn't in this worktree yet). Usage: node evidence/mod-post/render.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'evidence/mod-post');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${server.address().port}/lab/post.html`);
await page.waitForFunction('window.LOOMING && window.renderFrame', { timeout: 30000 }).catch(() => { console.error(logs.join('\n')); process.exit(1); });

// Contact sheet of frames at width w, cols columns, drawn into a page canvas and returned as a JPEG.
const sheet = (times, cols, w, name) => page.evaluate(async (times, cols, w) => {
  const h = Math.round(w * 9 / 16), rows = Math.ceil(times.length / cols), out = document.createElement('canvas');
  out.width = cols * w; out.height = rows * h;
  const ctx = out.getContext('2d');
  times.forEach((t, i) => { renderFrame(t); ctx.drawImage(document.querySelector('canvas'), (i % cols) * w, Math.floor(i / cols) * h, w, h); });
  return out.toDataURL('image/jpeg', 0.92);
}, times, cols, w).then((d) => fs.writeFileSync(path.join(OUT, name), Buffer.from(d.split(',')[1], 'base64')));

await sheet([0, 0.5, 1, 1.5, 2, 2.5, 3].map((t) => Math.min(t, 2.999)), 4, 480, 'focus_strip.jpg');
await sheet([2.999, 3.75, 5.25, 6.75, 8.25], 3, 640, 'luts.jpg');

// Determinism: hash the canvas at fixed t, render other frames, hash again; and a different t must differ (grain is live).
const hashAt = (t) => page.evaluate((t) => { renderFrame(t); return document.querySelector('canvas').toDataURL('image/png'); }, t)
  .then((d) => crypto.createHash('sha256').update(Buffer.from(d.split(',')[1], 'base64')).digest('hex'));
const lines = [];
let ok = true;
for (const t of [0.5, 4]) {
  const a = await hashAt(t); await hashAt(t + 0.5); await hashAt(8); const b = await hashAt(t);
  lines.push(`t=${t}  ${a}  ${b}  ${a === b ? 'IDENTICAL' : 'DIFFERENT'}`);
  ok &&= a === b;
}
// Control: with t differing by one frame the grain must change, so a pass above isn't a no-op.
const c1 = await hashAt(4.0), c2 = await hashAt(4.0 + 1 / 24);
lines.push(`control t=4 vs t=4+1/24 (focus and LUT held, only the grain frame changes): ${c1 === c2 ? 'SAME (bad)' : 'differ (good)'}`);
// Grain-only control: freeze everything but frame by checking frame uniform directly.
const g = await page.evaluate(() => {
  const { post, stage } = window.lab; const gl = stage.renderer.getContext();
  const px = (t) => { renderFrame(t); const a = new Uint8Array(4 * 64); gl.readPixels(900, 500, 16, 4, gl.RGBA, gl.UNSIGNED_BYTE, a); return a.join(','); };
  return [px(5), px(5), px(5 + 1 / 24 * 0.4)].map((s) => s.length + ':' + s.split(',').reduce((x, y) => (x * 31 + +y) >>> 0, 7));
});
lines.push(`pixel patch t=5 / t=5 / t=5+0.4 frame (rounds to same frame): ${g.join('  ')}`);
fs.writeFileSync(path.join(OUT, 'determinism.txt'), lines.join('\n') + '\n' + (ok ? 'PASS' : 'FAIL') + '\n');
console.log(lines.join('\n'), ok ? 'PASS' : 'FAIL');

// Timing: median ms/frame with post on vs the stage's plain render, GPU-synced with a 1-px readback.
const timed = (t) => page.evaluate((t) => { const t0 = performance.now(); renderFrame(t); const gl = document.querySelector('canvas').getContext('webgl2'); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); return performance.now() - t0; }, t);
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const run = async (label) => { const ms = []; for (let i = 0; i < 40; i++) ms.push(await timed(3.5 + (i % 8) * 0.1)); return `${label} (median of 40): ${med(ms).toFixed(1)} ms/frame  [min ${Math.min(...ms).toFixed(1)}, max ${Math.max(...ms).toFixed(1)}]`; };
await timed(3.5); // shader warmup
const on = await run('post ON ');
await page.evaluate(() => { const { stage } = window.lab; stage.setRender(() => stage.renderer.render(stage.scene, stage.camera)); });
const off = await run('post OFF');
const timing = [`lab/post.html, 1920x1080, headless Chrome ${await browser.version()} on ${process.platform}, MSAA x4 composer`, on, off, 'Timed from Node around page.evaluate with a 1-px readPixels to wait for the GPU. Includes shadow-free Lambert scene only (lab is light).'].join('\n');
fs.writeFileSync(path.join(OUT, 'timing.txt'), timing + '\n');
console.log(timing);
if (logs.length) console.log('page console:\n' + logs.join('\n'));
await browser.close(); server.close();
