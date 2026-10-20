// node evidence/anim-s04/light.mjs [--img=<prefix>]  → README §10 check on graded frames: his face's luma against the
// key-lit wall (target 30–45 %), and the 6.25× shadow's contrast (1 − shadow / lit). Boxes come from measure.html's
// projection; frames from index.html (the film, post and grade on), or from saved stills <prefix>t25_00.jpg etc.
import { serve, launch, openPage, args } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const m = await openPage(browser, base, 'evidence/anim-s04/measure.html');
const film = await openPage(browser, base, 'index.html');
const BOX = { head: [36, 24], lit: [30, 30], shadow: [30, 30] };
for (const tl of [5.0, 7.5]) {
  const pts = await m.evaluate((t) => window.points(t), tl), t = 20 + tl;
  const img = args.img ? `${args.img}t${t.toFixed(2).replace('.', '_')}.jpg` : null;
  const L = await film.evaluate(async (t, pts, BOX, img) => {
    let src;
    if (img) src = await createImageBitmap(await (await fetch('/' + img)).blob());
    else { await window.renderFrame(t); src = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]; }
    const c = Object.assign(document.createElement('canvas'), { width: 1920, height: 1080 }), g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(src, 0, 0);
    const out = {};
    for (const [k, [w, h]] of Object.entries(BOX)) {
      const [x, y] = pts[k], d = g.getImageData(x - w / 2, y - h / 2, w, h).data;
      let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      out[k] = s / (d.length / 4);
    }
    return out;
  }, t, pts, BOX, img);
  console.log(`tLocal ${tl} (${img ?? 'index.html render'}): face ${L.head.toFixed(1)}  lit wall ${L.lit.toFixed(1)}  shadow ${L.shadow.toFixed(1)}  ` +
    `face/wall ${(100 * L.head / L.lit).toFixed(0)} %  shadow contrast ${tl === 7.5 ? (100 * (1 - L.shadow / L.lit)).toFixed(0) + " %" : "n/a (box is outside the 5× shadow)"}  (head px ${pts.head})`);
}
await browser.close(); server.close();
