// node evidence/climax-a2/probe.mjs --shot=s09c --t=2,3.75 --plane=ground|wall [--keep='{"z":[0.07,0.17]}'] [--rel=0.2] [--thr=10]
// shadow pixel: lit pass − shadow pass > max(10 luma, rel × lit). cover: shadow pixels / receiver pixels inside keep.
// Measures the blob's shadow on a receiver plane in metres (probe.html). One headless Chrome, closed at the end.
import { args, die, nums, serve, launch, openPage } from '../../tools/lib/page.mjs';
const ts = nums(args.t || die('--t'));
const plane = { ground: { n: [0, 1, 0], d: 0 }, wall: { n: [0, 0, 1], d: 0 } }[args.plane || 'ground'];
const keep = args.keep ? JSON.parse(args.keep) : null, rel = args.rel ? +args.rel : 0.2, thr = args.thr ? +args.thr : 10;
const { server, base } = await serve();
const browser = await launch();
try {
  const page = await openPage(browser, base, `evidence/climax-a2/probe.html?shot=${args.shot}`);
  for (const t of ts) {
    const r = await page.evaluate((t, o) => window.probe(t, o), t, { ...plane, keep, rel, thr });
    const f = (a) => a.map((v) => (v ?? NaN).toFixed(3)).join('…');
    const len = Math.max(r.shadow.x[1] - r.shadow.x[0], r.shadow.z[1] - r.shadow.z[0]);
    console.log(`t=${t.toFixed(3)}  blob w ${(r.blob.w ?? NaN).toFixed(4)} (x ${f(r.blob.x)})  shadow x ${f(r.shadow.x)} z ${f(r.shadow.z)} y ${f(r.shadow.y)}`
      + `  len/w ${(len / r.blob.w).toFixed(2)}  xlen/w ${((r.shadow.x[1] - r.shadow.x[0]) / r.blob.w).toFixed(2)}  zlen/w ${((r.shadow.z[1] - r.shadow.z[0]) / r.blob.w).toFixed(2)}  lit/dark ${(r.shadow.contrast ?? NaN).toFixed(2)}  cover ${(100 * r.shadow.cover).toFixed(0)}%  px ${r.shadow.px}`);
  }
} finally { await browser.close(); server.close(); }
