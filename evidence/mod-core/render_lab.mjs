// Headless render of lab/core.html (stand-in until mod-render's render.mjs lands).
// Saves lab_t0.5.jpg and lab_t1.5.jpg, renders each t twice (interleaved) and prints PNG sha256s.
// Usage: node evidence/mod-core/render_lab.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'evidence/mod-core');
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
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${server.address().port}/lab/core.html`);
await page.waitForFunction('window.LOOMING', { timeout: 30000 });
await page.evaluate(() => window.LOOMING.ready);

const frame = (t, type) => page.evaluate((t, type) => { renderFrame(t); return document.querySelector('canvas').toDataURL(type, 0.92); }, t, type);
const bytes = (url) => Buffer.from(url.split(',')[1], 'base64');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

const lines = [];
for (const t of [0.5, 1.5]) fs.writeFileSync(path.join(OUT, `lab_t${t}.jpg`), bytes(await frame(t, 'image/jpeg')));
const order = [0.5, 1.5, 0.5, 1.5];
const h = [];
for (const t of order) h.push(sha(bytes(await frame(t, 'image/png'))));
order.forEach((t, i) => lines.push(`${h[i]}  t=${t} render ${i < 2 ? 1 : 2} (PNG of the canvas)`));
lines.push(`t=0.5 ${h[0] === h[2] ? 'IDENTICAL' : 'DIFFERENT'}`, `t=1.5 ${h[1] === h[3] ? 'IDENTICAL' : 'DIFFERENT'}`);
lines.push(`t=0.5 vs t=1.5 ${h[0] === h[1] ? 'SAME (box did not move?)' : 'differ (as expected)'}`);
console.log(lines.join('\n'));
if (logs.length) console.log('page console:\n' + logs.join('\n'));
await browser.close();
server.close();
if (h[0] !== h[2] || h[1] !== h[3]) process.exit(1);
