// node evidence/v8-s16/probe.ts --t=5,8,9.75,10.5,12 > evidence/v8-s16/shadows.txt
// s16's wall shadow in numbers at shot-local times (probe.html): the phone's screen as the light, the blob's field box
// projected onto the wall z 0. One headless Chrome, closed at the end.
import { args, die, nums, serve, launch, openPage } from '../../tools/lib/page.ts';

const ts = nums(args.t || die('--t'));
const { server, base } = await serve();
const browser = await launch();
const f = (v: number) => v.toFixed(3);
try {
  const page = await openPage(browser, base, 'evidence/v8-s16/probe.html');
  console.log('s16 local t | global | blob r (×) | phone light (m) | S | shadow on the wall: x, eyes y, top y, height over the panel (m) | units (S·r/0.012)');
  for (const t of ts) {
    // in-page: probe() is the page's own
    const w = await page.evaluate((t: number) => (window as unknown as { probe: (t: number) => Record<string, any> }).probe(t), t);   // any: the page's JSON
    const head = `t ${t.toFixed(2).padStart(5)} | ${(140 + t).toFixed(2)} | r ${w.r.toFixed(3)} (${(w.r / 0.012).toFixed(2)}×)`;
    console.log(w.lit
      ? `${head} | (${w.light.map(f).join(', ')}) | S ${w.S.toFixed(2)} | x ${f(w.x[0])}…${f(w.x[1])} (${f(w.x[1] - w.x[0])} wide), eyes ${f(w.eyes)}, top ${f(w.top)}, height ${f(w.height)} | ${w.units.toFixed(1)}`
      : `${head} | phone dark | no wall shadow: the pendant's desk pool only (0.127 / (0.127 − r) = ${(0.127 / (0.127 - w.r)).toFixed(2)}×)`);
  }
} finally { await browser.close(); server.close(); }
