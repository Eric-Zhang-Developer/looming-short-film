// ms/frame of lab/lookdev.html in headless Chrome, 1920x1080, post on. Run from the repo root.
// "cold" = first visit to a boil step (paper.js tears new textures); "warm" = the same frames replayed (cache hits only if the scene fits paper.js's 300-entry cache).
// Each frame ends with a 1-px readPixels (a full GPU sync; gl.finish does not block in Chrome). performance.now() here is the harness timing the page; the page itself reads no clock.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/lookdev.html');
const ts = Array.from({ length: 240 }, (_, i) => i / 24);  // the whole 10 s test at 24 fps
const run = () => page.evaluate(async (ts) => {
  const gl = window.lab.stage.renderer.getContext(), px = new Uint8Array(4), out = [];
  for (const t of ts) { const a = performance.now(); window.renderFrame(t); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); out.push(performance.now() - a); }
  return out;
}, ts);
const stats = (xs) => { const s = [...xs].sort((a, b) => a - b); return `median ${s[s.length >> 1].toFixed(1)} ms, p90 ${s[Math.floor(s.length * 0.9)].toFixed(1)} ms, max ${s.at(-1).toFixed(1)} ms`; };
const cold = await run(), warm = await run();
const step = cold.filter((_, i) => Math.floor(ts[i] * 4 + 1e-6) !== Math.floor((ts[i] - 1 / 24) * 4 + 1e-6) || i === 0);
console.log(`frames: ${ts.length} (0-10 s @ 24 fps), 1920x1080, post on (bokeh + night LUT + grain)`);
console.log(`cold pass: ${stats(cold)}`);
console.log(`  frames that start a new 4 Hz boil step (${step.length}): ${stats(step)}`);
console.log(`warm pass: ${stats(warm)}`);
await browser.close(); server.close();
