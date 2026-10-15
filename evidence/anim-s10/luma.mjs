// node evidence/anim-s10/luma.mjs <png> name:x,y,w,h ... → mean Rec.709 luma (0-255) of each box of a full-res still.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const [png, ...boxes] = process.argv.slice(2);
const { server, base } = await serve(); const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s10/measure.html');
const out = await page.evaluate(async (png, boxes) => {
  const bm = await createImageBitmap(await (await fetch('/' + png)).blob());
  const cv = Object.assign(document.createElement('canvas'), { width: bm.width, height: bm.height }), g = cv.getContext('2d');
  g.drawImage(bm, 0, 0);
  return boxes.map((b) => { const [n, r] = b.split(':'), [x, y, w, h] = r.split(',').map(Number), d = g.getImageData(x, y, w, h).data; let s = 0;
    for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return `${n} ${(s / (d.length / 4)).toFixed(1)}`; });
}, png, boxes);
console.log(out.join('\n'));
await browser.close(); server.close();
