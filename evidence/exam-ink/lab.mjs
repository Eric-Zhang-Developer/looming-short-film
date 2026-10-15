// node evidence/exam-ink/lab.mjs --save=<dir> [--before=<dir>]   |   --stain   |   --s15=<png>   |   --eyes
// Renders lab/blob.html?cam=close under the phone key and ?key=lamp (idle 0.5 s, worried 3.5 s) and saves each crop as
// a PNG in --save. With --before (a --save dir rendered from the old blob.js), writes evidence/exam-ink/before_after.jpg:
// top row old, bottom row new. --stain writes evidence/exam-ink/stain_fade.jpg from ?cam=stain (blob leaves at 1 s).
// --s15 writes one crop of the film-size blob from s15's Camera A direction and distance under the lamp key
// (?cam=eyes&d=0.31&key=lamp, t 0.5): s15 itself is still a stub. --eyes writes evidence/exam-ink/eyes.jpg, the seven
// eye cells of ?cam=eyes&d=0.31 (open, closed, tired, gasp, worried, side +1, side −1) with the highlight beside them. render.mjs refuses a page path with a query, hence this script.
import fs from 'node:fs';
import path from 'node:path';
import { args, ROOT, serve, launch, openPage, grab, sheet, toBuf } from '../../tools/lib/page.mjs';

const VIEWS = [['lab/blob.html?cam=close', 0.5], ['lab/blob.html?cam=close', 3.5], ['lab/blob.html?cam=close&key=lamp', 0.5], ['lab/blob.html?cam=close&key=lamp', 3.5]];
const CROP = [640, 260, 640, 660];
const { server, base } = await serve();
const browser = await launch();
if (args.s15) {
  const page = await openPage(browser, base, 'lab/blob.html?cam=eyes&d=0.31&key=lamp');
  fs.writeFileSync(args.s15, toBuf(await grab(page, 0.5, 'png', [660, 360, 600, 400])));
  await browser.close(); server.close(); process.exit(0);
}
if (args.eyes) {
  const page = await openPage(browser, base, 'lab/blob.html?cam=eyes&d=0.31');
  fs.writeFileSync(path.join(ROOT, 'evidence/exam-ink/eyes.jpg'),
    toBuf(await sheet(page, [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5], 7, 300, [680, 340, 560, 420], 'jpeg')));
  console.log('wrote evidence/exam-ink/eyes.jpg');
  await browser.close(); server.close(); process.exit(0);
}
if (args.stain) {
  const page = await openPage(browser, base, 'lab/blob.html?cam=stain&key=lamp');
  fs.writeFileSync(path.join(ROOT, 'evidence/exam-ink/stain_fade.jpg'),
    toBuf(await sheet(page, [0.5, 1.5, 3, 6, 9, 11.5], 3, 640, [360, 200, 1200, 700], 'jpeg')));
  console.log('wrote evidence/exam-ink/stain_fade.jpg');
  await browser.close(); server.close(); process.exit(0);
}
fs.mkdirSync(args.save, { recursive: true });
const pages = {};
let i = 0;
for (const [url, t] of VIEWS) {
  pages[url] ??= await openPage(browser, base, url);
  fs.writeFileSync(path.join(args.save, `cell${i++}.png`), toBuf(await grab(pages[url], t, 'png', CROP)));
}
if (args.before) {
  const urls = (dir) => VIEWS.map((_, k) => 'data:image/png;base64,' + fs.readFileSync(path.join(dir, `cell${k}.png`)).toString('base64'));
  const page = Object.values(pages)[0];
  const jpg = await page.evaluate(async (rows) => {
    const load = (src) => new Promise((r) => { const im = new Image(); im.onload = () => r(im); im.src = src; });
    const imgs = await Promise.all(rows.map((r) => Promise.all(r.map(load))));
    const s = 0.6, w = imgs[0][0].width * s, h = imgs[0][0].height * s, gap = 6;
    const c = Object.assign(document.createElement('canvas'), { width: 4 * w + 3 * gap, height: 2 * h + gap }), g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    imgs.forEach((row, y) => row.forEach((im, x) => g.drawImage(im, x * (w + gap), y * (h + gap), w, h)));
    return c.toDataURL('image/jpeg', 0.9);
  }, [urls(args.before), urls(args.save)]);
  fs.writeFileSync(path.join(ROOT, 'evidence/exam-ink/before_after.jpg'), toBuf(jpg));
  console.log('wrote evidence/exam-ink/before_after.jpg');
}
await browser.close(); server.close();
