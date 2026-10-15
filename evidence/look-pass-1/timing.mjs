// ms/frame of lab/lookdev.html in headless Chrome, 1920x1080, post on, two passes over the same 240 frames (0-10 s @ 24 fps).
// "cold" = first visit to each 4 Hz boil step (paper.js tears new textures); "warm" = the same frames replayed, which
// hits paper.js's cache only if the whole shot fits in it. Run from the repo root: node evidence/look-pass-1/timing.mjs
// Each frame ends with a 1-px readPixels (a full GPU sync). performance.now() here is the harness timing the page;
// the page itself reads no clock. Chrome's total RSS is sampled with ps after each pass.
import { execSync } from 'node:child_process';
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/lookdev.html');
const ts = Array.from({ length: 240 }, (_, i) => i / 24);
const run = () => page.evaluate(async (ts) => {
  const gl = window.lab.stage.renderer.getContext(), px = new Uint8Array(4), out = [];
  for (const t of ts) { const a = performance.now(); window.renderFrame(t); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); out.push(performance.now() - a); }
  return out;
}, ts);
const pid = browser.process().pid;
const rss = () => { const all = execSync('ps -A -o pid=,ppid=,rss=').toString().trim().split('\n').map((l) => l.trim().split(/\s+/).map(Number));
  const kids = new Set([pid]); let grew = true;
  while (grew) { grew = false; for (const [p, pp] of all) if (kids.has(pp) && !kids.has(p)) { kids.add(p); grew = true; } }
  return (all.filter(([p]) => kids.has(p)).reduce((s, [, , r]) => s + r, 0) / 1048576).toFixed(2) + ' GB'; };
const stats = (xs) => { const s = [...xs].sort((a, b) => a - b), sum = xs.reduce((a, b) => a + b, 0);
  return `total ${(sum / 1000).toFixed(1)} s, mean ${(sum / xs.length).toFixed(1)} ms, median ${s[s.length >> 1].toFixed(1)} ms, p90 ${s[Math.floor(s.length * 0.9)].toFixed(1)} ms, max ${s.at(-1).toFixed(1)} ms`; };
const step = (i) => i === 0 || Math.floor(ts[i] * 4 + 1e-6) !== Math.floor(ts[i - 1] * 4 + 1e-6);
const cold = await run(); const rssCold = rss();
const warm = await run(); const rssWarm = rss();
console.log(`frames: ${ts.length} (0-10 s @ 24 fps), 1920x1080, post on (bokeh + night LUT + grain)`);
console.log(`cold pass: ${stats(cold)}   Chrome RSS after: ${rssCold}`);
console.log(`  frames that start a new 4 Hz boil step (${cold.filter((_, i) => step(i)).length}): ${stats(cold.filter((_, i) => step(i)))}`);
console.log(`warm pass: ${stats(warm)}   Chrome RSS after: ${rssWarm}`);
console.log(`  the same boil-step frames: ${stats(warm.filter((_, i) => step(i)))}`);
await browser.close(); server.close();
