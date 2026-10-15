// Headless render of lab/blob.html (stand-in until mod-render's render.mjs lands on this branch).
// Usage: node evidence/mod-blob/render_lab.mjs [raw]   — "raw" only dumps full frames to $RAW_DIR for looking.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'evidence/mod-blob');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
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
const open = async (query) => {
  const page = await browser.newPage();
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/lab/blob.html${query}`);
  await page.waitForFunction('window.LOOMING', { timeout: 30000 });
  await page.evaluate(() => window.LOOMING.ready);
  return page;
};
const bytes = (url) => Buffer.from(url.split(',')[1], 'base64');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const frame = (page, t, type = 'image/png') => page.evaluate((t, type) => { renderFrame(t); return document.querySelector('canvas').toDataURL(type, 0.92); }, t, type);
// Grid of crops: each cell renders time t and copies rect [x, y, w, h] from the canvas, scaled to cellW.
const grid = (page, cells, cols, cellW) => page.evaluate((cells, cols, cellW) => {
  const src = document.querySelector('canvas');
  const cellH = Math.round(cellW * cells[0].h / cells[0].w), gap = 6, rows = Math.ceil(cells.length / cols);
  const out = document.createElement('canvas');
  out.width = cols * cellW + (cols - 1) * gap; out.height = rows * cellH + (rows - 1) * gap;
  const ctx = out.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, out.width, out.height);
  cells.forEach((c, i) => { renderFrame(c.t); ctx.drawImage(src, c.x, c.y, c.w, c.h, (i % cols) * (cellW + gap), Math.floor(i / cols) * (cellH + gap), cellW, cellH); });
  return out.toDataURL('image/jpeg', 0.92);
}, cells, cols, cellW);

const wide = await open('');
const close = await open('?cam=close');

if (process.argv[2] === 'raw') {
  const dir = process.env.RAW_DIR; fs.mkdirSync(dir, { recursive: true });
  for (const t of [0.5, 3.5]) fs.writeFileSync(path.join(dir, `wide_${t}.jpg`), bytes(await frame(wide, t, 'image/jpeg')));
  for (const t of [0.5, 1.45, 2.12, 2.33, 2.58, 3.5]) fs.writeFileSync(path.join(dir, `close_${t}.jpg`), bytes(await frame(close, t, 'image/jpeg')));
} else {
  // Crop rects in 1920x1080 frame pixels, picked by looking at the raw frames.
  const C = { close: { x: 560, y: 230, w: 800, h: 600 }, strip: { x: 610, y: 110, w: 700, h: 700 }, eyes: { x: 740, y: 400, w: 440, h: 300 }, wide: { x: 780, y: 400, w: 960, h: 440 } };
  fs.writeFileSync(path.join(OUT, 'closeup.jpg'), bytes(await grid(close, [{ t: 0.5, ...C.close }], 1, C.close.w)));
  fs.writeFileSync(path.join(OUT, 'shadow.jpg'), bytes(await grid(wide, [{ t: 0.5, ...C.wide }, { t: 3.5, ...C.wide }], 2, 900)));
  const strip = []; for (let n = 23; n <= 36; n++) strip.push({ t: (n + 0.5) / 12, ...C.strip });   // one cell per 12 fps pose, 1.96–3.04 s
  fs.writeFileSync(path.join(OUT, 'squash_strip.jpg'), bytes(await grid(close, strip, 7, 300)));
  fs.writeFileSync(path.join(OUT, 'eyes.jpg'), bytes(await grid(close, [0.5, 1.45, 3.5].map((t) => ({ t, ...C.eyes })), 3, 500)));
  // Determinism: PNG hashes, every t rendered twice with other times in between, in both camera views.
  const ts = [0.5, 1.45, 2.58, 3.5], lines = [], fails = [];
  for (const [name, page] of [['wide', wide], ['close', close]]) {
    const h = [];
    for (const t of [...ts, ...[...ts].reverse()]) h.push([t, sha(bytes(await frame(page, t)))]);
    for (const t of ts) {
      const [a, b] = h.filter(([x]) => x === t).map(([, s]) => s);
      lines.push(`${name} t=${t}  ${a}  ${b}  ${a === b ? 'IDENTICAL' : 'DIFFERENT'}`);
      if (a !== b) fails.push(`${name} t=${t}`);
    }
    const uniq = new Set(h.map(([, s]) => s)).size;
    lines.push(`${name}: ${uniq} distinct hashes for ${ts.length} times (each time must differ from the others)`);
    if (uniq !== ts.length) fails.push(`${name} distinct`);
  }
  lines.push(fails.length ? `FAIL: ${fails.join(', ')}` : 'PASS');
  console.log(lines.join('\n'));
  fs.writeFileSync(path.join(OUT, 'determinism.txt'), lines.join('\n') + '\n');
}
if (logs.length) console.log('page console:\n' + logs.join('\n'));
await browser.close();
server.close();
