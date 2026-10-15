// node evidence/contract-blob/eyes.mjs → evidence/contract-blob/eyes.jpg (+ eyes_determinism.txt)
// lab/blob.html?cam=eyes, one state per second. Rows: s07's distance (1.2 m) at film size, the same pixels at 4×
// (nearest neighbour, no smoothing), then s15's Camera A distance (0.31 m) at film size.
// render.mjs and determinism.mjs refuse a page path with a query, hence this script.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, serve, launch, openPage, grab, toBuf } from '../../tools/lib/page.mjs';

const TS = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5];   // open, closed, tired, gasp, worried, side +1, side −1
const { server, base } = await serve();
const browser = await launch();
const far = await openPage(browser, base, 'lab/blob.html?cam=eyes&d=1.2');
const near = await openPage(browser, base, 'lab/blob.html?cam=eyes&d=0.31');

// Each frame's blob crop as a data URL, centred on the blob (the camera looks at its middle, frame centre 960, 540).
const crop = (w, h) => [960 - w / 2, 540 - h / 2 - h * 0.05, w, h];
const cells = async (page, c) => { const out = []; for (const t of TS) out.push(await grab(page, t, 'png', c)); return out; };
const farCells = await cells(far, crop(100, 84)), nearCells = await cells(near, crop(360, 300));

// Determinism of the eyes view: every t again in reverse order on the same page, compared by hash.
const sha = async (page, t) => crypto.createHash('sha256').update(toBuf(await grab(page, t, 'png'))).digest('hex').slice(0, 16);
const lines = [];
for (const [name, page] of [['d=1.2', far], ['d=0.31', near]]) {
  const a = []; for (const t of TS) a.push(await sha(page, t));
  const b = []; for (const t of [...TS].reverse()) b.unshift(await sha(page, t));
  TS.forEach((t, i) => lines.push(`${name} t=${t}  ${a[i]} ${b[i]}  ${a[i] === b[i] ? 'PASS' : 'FAIL'}`));
}
lines.push(lines.every((l) => l.endsWith('PASS')) ? 'eyes view determinism: PASS' : 'eyes view determinism: FAIL');

const jpg = await far.evaluate(async (rows) => {
  const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  const imgs = await Promise.all(rows.map((r) => Promise.all(r.cells.map(load))));
  const gap = 8, W = Math.max(...rows.map((r, k) => r.cells.length * (imgs[k][0].width * r.scale + gap) - gap));
  const H = rows.reduce((h, r, k) => h + imgs[k][0].height * r.scale + gap, -gap);
  const c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.imageSmoothingEnabled = false;
  let y = 0;
  rows.forEach((r, k) => {
    imgs[k].forEach((im, i) => g.drawImage(im, i * (im.width * r.scale + gap), y, im.width * r.scale, im.height * r.scale));
    y += imgs[k][0].height * r.scale + gap;
  });
  return c.toDataURL('image/jpeg', 0.9);
}, [{ cells: farCells, scale: 1 }, { cells: farCells, scale: 4 }, { cells: nearCells, scale: 1 }]);

const OUT = path.join(ROOT, 'evidence/contract-blob');
fs.writeFileSync(path.join(OUT, 'eyes.jpg'), toBuf(jpg));
fs.writeFileSync(path.join(OUT, 'eyes_determinism.txt'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
await browser.close(); server.close();
