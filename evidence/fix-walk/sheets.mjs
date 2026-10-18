// node evidence/fix-walk/sheets.mjs '<out>=<times>[@cols,w]' ...   several contact sheets from ONE headless Chrome page
// (the machine was shared; each page load cost minutes). times: a,b,c or a:b:step (frames at fps 24). Closed at the end.
import fs from 'node:fs';
import { serve, launch, openPage, sheet, toBuf } from '../../tools/lib/page.mjs';
const jobs = process.argv.slice(2).filter((a) => a.includes('=') && !a.startsWith('--')).map((a) => {
  const [out, spec] = a.split('='), [ts, opt = '6,320'] = spec.split('@'), [cols, w] = opt.split(',').map(Number);
  let times;
  if (ts.includes(':')) { const [a0, b0, st] = ts.split(':').map(Number); times = []; for (let f = Math.round(a0 * 24); f <= Math.round(b0 * 24); f += st) times.push(f / 24); }
  else times = ts.split(',').map(Number);
  return { out, times, cols, w };
});
const { server, base } = await serve();
const browser = await launch();
try {
  const page = await openPage(browser, base, 'index.html');
  for (const j of jobs) {
    const t0 = Date.now();
    fs.writeFileSync(j.out, toBuf(await sheet(page, j.times, j.cols, j.w, null, 'jpeg')));
    console.log(`${j.out}  (${j.times.length} frames, ${((Date.now() - t0) / j.times.length / 1000).toFixed(1)} s/frame)`);
  }
} finally { await browser.close(); server.close(); }
