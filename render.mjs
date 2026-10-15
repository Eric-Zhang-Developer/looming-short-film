// render.mjs: renders any Looming page (one that exposes window.renderFrame(t)) in headless Chrome.
// Port of the KnightHacks render.mjs. Pages: --page=<repo-relative html> (default index.html).
//
//   node render.mjs --page=lab/paper.html --sheet=0,0.5,1 [--cols=4] [--w=480] --out=evidence/<id>/sheet.jpg
//   node render.mjs --page=... --strip=0:0.5 [--cols=6] [--w=320] --out=...        every frame of a stretch
//   node render.mjs --page=... --stills=0.5,4 --out=evidence/<id>/                 full-res PNG per time
//   node render.mjs --page=... --crop=x,y,w,h --sheet=... --out=...                full-res crops (canvas px)
//   node render.mjs --page=index.html --frames [--range=a:b] --workers=4           → out/frames/%06d.jpg (resumable)
//   node render.mjs --encode --out=out/film.mp4 [--audio=out/mix.wav] [--fps=24]
//
// Output type follows the extension of --out (.png → PNG, else JPEG q90). fps comes from window.LOOMING.fps
// (override with --fps, default 24). Chrome: --chrome=<path> or CHROME_PATH. Prints ms/frame at the end.
// Not ported from KnightHacks: --crop-at, --loop, --clip, --png, --soft-gl (p5/studio specifics).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { args, die, nums, ROOT, serve, launch, openPage, grab, sheet, toBuf } from './tools/lib/page.mjs';

const FRAMES_DIR = 'out/frames';
const pagePath = typeof args.page === 'string' ? args.page : 'index.html';
const span = (s) => String(s).split(':').map(Number);
const type = (out) => (/\.png$/i.test(out) ? 'png' : 'jpeg');
const run = (cmd, a) => new Promise((ok, bad) => {
  const p = spawn(cmd, a, { stdio: 'inherit' });
  p.on('error', bad); p.on('close', (c) => (c ? bad(new Error(`${cmd} exited ${c}`)) : ok()));
});

if (args.encode) {
  const out = args.out || 'out/film.mp4', fps = String(args.fps || 24);
  const idx = fs.existsSync(FRAMES_DIR) ? fs.readdirSync(FRAMES_DIR).filter((f) => /^\d{6}\.jpg$/.test(f)).map((f) => +f.slice(0, 6)).sort((a, b) => a - b) : [];
  if (!idx.length) die(`no frames in ${FRAMES_DIR}: run --frames first`);
  const audio = typeof args.audio === 'string' ? args.audio : null;
  if (audio && !fs.existsSync(audio)) die(`audio not found: ${audio}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  console.log(`encoding ${idx.length} frames @ ${fps} fps → ${out}${audio ? ' with ' + audio : ''}`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', fps, '-start_number', String(idx[0]), '-i', `${FRAMES_DIR}/%06d.jpg`,
    ...(audio ? ['-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
    '-vf', 'scale=out_range=tv', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  console.log('wrote ' + out);
  process.exit(0);
}

if (!(args.sheet || args.strip || args.stills || args.frames)) die('nothing to do: see the usage notes at the top of render.mjs');
if (!fs.existsSync(path.join(ROOT, pagePath))) die(`page not found: ${pagePath} (looked in ${ROOT}). Pass --page=<repo-relative html>, e.g. --page=smoke/paper/index.html`);

const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, pagePath);
const loomings = await page.evaluate(() => window.LOOMING ? { fps: window.LOOMING.fps, duration: window.LOOMING.duration } : {});
const fps = +(args.fps || loomings.fps || 24);
const crop = args.crop ? nums(args.crop) : null;
if (crop && (crop.length !== 4 || crop.some(isNaN))) die('--crop must be x,y,w,h');
const ms = [];
const timed = async (f) => { const t0 = performance.now(); const r = await f(); ms.push(performance.now() - t0); return r; };
const report = () => console.log(`ms/frame: ${(ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(0)} (${ms.length} frames, fps ${fps})`);

if (args.sheet || args.strip) {
  const out = args.out || 'out/sheet.jpg';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let ts;
  if (args.strip) { const [a, b] = span(args.strip); ts = []; for (let i = Math.round(a * fps); i <= Math.round(b * fps); i++) ts.push(i / fps); }
  else ts = nums(args.sheet);
  if (ts.some(isNaN) || !ts.length) die('bad times in --sheet/--strip');
  const url = await timed(() => sheet(page, ts, +(args.cols || (args.strip ? 6 : 3)), +(args.w || (args.strip ? 320 : 640)), crop, type(out)));
  ms.splice(0, 1, ...Array(ts.length).fill(ms[0] / ts.length));
  fs.writeFileSync(out, toBuf(url));
  console.log(`${out}  (${ts.length} frames)`);
} else if (args.stills) {
  const out = args.out || 'out/stills';
  fs.mkdirSync(out, { recursive: true });
  for (const s of nums(args.stills)) {
    const f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`;
    fs.writeFileSync(f, toBuf(await timed(() => grab(page, s, 'png', crop))));
    console.log(f);
  }
} else {
  // Parallel and resumable: each worker pulls the next missing frame; files are written atomically.
  const [a, b] = args.range ? span(args.range) : [0, loomings.duration];
  if (isNaN(a) || isNaN(b)) die('--frames needs --range=a:b (the page sets no window.LOOMING.duration)');
  const first = Math.round(a * fps), last = Math.round(b * fps) - 1, workers = +(args.workers || 4);
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  const name = (i) => `${FRAMES_DIR}/${String(i).padStart(6, '0')}.jpg`;
  const todo = [];
  for (let i = first; i <= last; i++) if (!fs.existsSync(name(i)) || fs.statSync(name(i)).size < 1000) todo.push(i);
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} already done), ${workers} workers`);
  const pages = [page];  // open one at a time: a page loading while others render is starved of CPU
  for (let w = 1; w < Math.min(workers, todo.length); w++) pages.push(await openPage(browser, base, pagePath, '#' + w));
  let next = 0, done = 0; const start = performance.now();
  await Promise.all(pages.map(async (p) => {
    while (next < todo.length) {
      const i = todo[next++], f = name(i);
      fs.writeFileSync(f + '.tmp', toBuf(await grab(p, i / fps, 'jpeg', crop)));
      fs.renameSync(f + '.tmp', f);
      if (++done % 24 === 0 || done === todo.length) console.log(`frame ${done}/${todo.length}`);
    }
  }));
  if (done) ms.push(...Array(done).fill((performance.now() - start) / done));  // effective, across workers
}
if (ms.length) report();
await browser.close();
server.close();
