// Shared by render.ts and tools/determinism.ts: local HTTP server (ES modules don't load from file://),
// headless Chrome via puppeteer-core, and in-page frame grabbing. Every grab happens in the same task as
// renderFrame(t), so it works whether or not the page uses preserveDrawingBuffer.
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import type { Browser, Page } from 'puppeteer-core';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const args: Record<string, string | true> = Object.fromEntries(process.argv.slice(2).map((a) => {
  const i = a.indexOf('=');
  return i < 0 ? [a.replace(/^--/, ''), true] : [a.slice(2, i), a.slice(i + 1)];
}));
export const die = (msg: string): never => { console.error('error: ' + msg); process.exit(1); };
export const nums = (s: unknown): number[] => String(s).split(',').map(Number);

const TYPES: Record<string, string> = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary',
};
// The page loads build/, compiled from src/ (tsconfig.build.json), so every serve compiles first: a render can never
// run against a stale build. A few seconds; it throws (and so stops the render) if tsc fails.
export async function serve() {
  execFileSync(path.join(ROOT, 'node_modules/.bin/tsc'), ['-p', path.join(ROOT, 'tsconfig.build.json')], { stdio: 'inherit' });
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(new URL(req.url!, 'http://x').pathname));
    if (p === path.join(ROOT, 'favicon.ico')) { res.writeHead(204); return res.end(); }
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  return { server, base: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
}

export async function launch() {
  const chrome = [args.chrome as string | undefined, process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && fs.existsSync(p));
  if (!chrome) die('Chrome not found: pass --chrome=<path> or set CHROME_PATH');
  return puppeteer.launch({ executablePath: chrome, headless: true, protocolTimeout: 0,
    args: ['--hide-scrollbars', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
}

// Opens `pagePath` (repo-relative), waits for window.renderFrame and LOOMING.ready (if the page sets one).
export async function openPage(browser: Browser, base: string, pagePath: string, tag = ''): Promise<Page> {
  const page = await browser.newPage();
  page.on('console', (m) => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}] ${m.text()}`); });
  page.on('pageerror', (e) => console.log(`[page error${tag}] ${(e as Error).message}`));
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(`${base}/${pagePath.replace(/^\/+/, '')}`, { waitUntil: 'networkidle0', timeout: 180000 });
  await page.waitForFunction('typeof window.renderFrame === "function"', { timeout: 60000 })
    .catch(() => die(`${pagePath} never defined window.renderFrame(t)`));
  await page.evaluate(() => window.LOOMING?.ready);
  return page;
}

// In-page helpers. `crop` is [x, y, w, h] in canvas px or null. `type` is 'png' or 'jpeg'. These functions run in
// the page: puppeteer sends their source text, which Node has already stripped of types.
export type Crop = [number, number, number, number] | null | undefined;
type CanvasOf = () => HTMLCanvasElement;
const canvasOf = () => [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];

// One frame at time t → data URL. With a crop, only that region (full-res).
export const grab = (page: Page, t: number, type: string, crop?: Crop, q = 0.9): Promise<string> => page.evaluate(async (t: number, type: string, crop: Crop, q: number, canvasOf: string) => {
  await window.renderFrame(t);
  const c = (eval(`(${canvasOf})`) as CanvasOf)(), mime = 'image/' + type;
  if (!crop) return c.toDataURL(mime, q);
  const o = document.createElement('canvas'); o.width = crop[2]; o.height = crop[3];
  o.getContext('2d')!.drawImage(c, crop[0], crop[1], crop[2], crop[3], 0, 0, crop[2], crop[3]);
  return o.toDataURL(mime, q);
}, t, type, crop, q, canvasOf.toString());

// Contact sheet of times `ts`: cells `w` px wide (aspect kept), `cols` columns, 8 px black gaps.
export const sheet = (page: Page, ts: number[], cols: number, w: number, crop: Crop, type: string, q = 0.9): Promise<string> => page.evaluate(async (ts: number[], cols: number, w: number, crop: Crop, type: string, q: number, canvasOf: string) => {
  cols = Math.min(cols, ts.length);
  const gap = 8, get = eval(`(${canvasOf})`) as CanvasOf;
  let cell: number[] | undefined, out: HTMLCanvasElement | undefined, ctx: CanvasRenderingContext2D | undefined;
  for (let i = 0; i < ts.length; i++) {
    await window.renderFrame(ts[i]);
    const c = get(), [sx, sy, sw, sh] = crop || [0, 0, c.width, c.height];
    if (!out) {
      cell = [w, Math.round(w * sh / sw)];
      out = document.createElement('canvas');
      out.width = cols * w + (cols - 1) * gap; out.height = Math.ceil(ts.length / cols) * (cell[1] + gap) - gap;
      ctx = out.getContext('2d')!; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, out.width, out.height);
    }
    ctx!.drawImage(c, sx, sy, sw, sh, (i % cols) * (w + gap), Math.floor(i / cols) * (cell![1] + gap), cell![0], cell![1]);
  }
  return out!.toDataURL('image/' + type, q);
}, ts, cols, w, crop, type, q, canvasOf.toString());

export const toBuf = (url: string): Buffer => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
