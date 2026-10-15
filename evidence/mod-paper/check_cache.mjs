// Cache and boil-seed invariants of src/paper.js, run in headless Chrome (makePaper needs a canvas).
// Usage, from the repo root: node evidence/mod-paper/check_cache.mjs   (needs tools/lib/page.mjs from mod-render)
import { serve, launch, openPage } from '../../tools/lib/page.mjs';

const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/paper.html');
const out = await page.evaluate(async () => {
  const { makePaper, boilSeed, clearPaperCache } = await import('/src/paper.js');
  const res = [], ok = (name, cond) => res.push(`${cond ? 'ok  ' : 'FAIL'} ${name}`);
  clearPaperCache();
  const p = (seed, r = 64) => makePaper({ path: [[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8]], size: [0.1, 0.1], key: 'cc', seed, res: r });
  ok('boilSeed(0.69)=6, (0.7)=7, (7/10)=7, (1, 4)=4', boilSeed(0.69) === 6 && boilSeed(0.7) === 7 && boilSeed(7 / 10) === 7 && boilSeed(1, 4) === 4);
  const a = p(0);
  ok('same (key, seed, res) returns the cached sheet', p(0) === a);
  ok('another seed is a new sheet', p(1) !== a && p(1).map !== a.map);
  ok('another res is a new sheet', p(0, 128) !== a);
  clearPaperCache();
  const first = p(0), second = p(1);
  for (let s = 2; s < 300; s++) p(s);   // 300 entries: at the cap, nothing evicted yet
  ok('300 entries kept', p(0) === first);  // touching seed 0 makes seed 1 the least recently used
  p(300);                                 // 301st entry: LRU evicts seed 1 (FIFO would evict seed 0)
  ok('past 300, the least recently used is evicted', p(0) === first && p(1) !== second);
  const s = p(5);
  ok('sheet shape', s.size.length === 2 && s.key === 'cc' && s.seed === 5 && s.thickness === 0.9 && s.map.isTexture && s.alphaMap.isTexture);
  clearPaperCache();
  return res;
});
console.log(out.join('\n'));
await browser.close(); server.close();
process.exit(out.some((l) => l.startsWith('FAIL')) ? 1 : 0);
