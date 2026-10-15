// node evidence/rig-legs/sizes.mjs: the loader's sizes put the VISIBLE shape at the PIECES size, for proxies and for
// cut frozen art alike. Tears each piece with makePaper at sizes[piece] (evidence/rig-legs/sizes.html) and compares the
// torn alpha's opaque box to PIECES on the PIECES long axis (makePaper keeps the art's aspect, so the short axis is
// the art's: the torso proxy is drawn 0.9 of its box wide by design). For the frozen case, make a scratch fake first (never committed):
//   assets/cut/calendar.boxes.json, assets/cut/calendar_sheet1.png (an opaque rect inside cut.mjs's default 4 px pad),
//   assets/frozen/calendar.png. Also checks the rig: the drawn near arm in reach_lift (world angle 0) ends at gator.hand.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
let page = await openPage(browser, base, 'evidence/rig-legs/sizes.html');

const mm = (v) => (v * 1000).toFixed(2);
for (const [name, piece] of [['gator_sheet', 'body'], ['gator_sheet', 'leg_r'], ['desk_lamp', 'shade'], ['calendar', 'sheet1']]) {
  const r = await page.evaluate((n, p) => window.measure(n, p), name, piece);
  const L = r.pieces[0] >= r.pieces[1] ? 0 : 1, err = Math.abs(r.drawn[L] / r.pieces[L] - 1) * 100;  // makePaper keeps the art's aspect
  console.log(`${(name + '.' + piece).padEnd(20)} ${r.proxy ? 'proxy ' : 'frozen'} bitmap ${r.bitmap.join('×')} px  sizes ${r.size.map(mm).join(' × ')} mm  ` +
    `drawn ${r.drawn.map(mm).join(' × ')} mm  PIECES ${r.pieces.map(mm).join(' × ')} mm  long axis off ${err.toFixed(1)} %`);
}
page = await openPage(browser, base, 'evidence/rig-legs/lab.html');
const tip = await page.evaluate(async () => {
  const b = await window.probe('gator', 'reach_lift', { parts: ['arm_r'] }), h = window.lab.rigs.gator.hand;
  window.lab.rigs.gator.group.updateMatrixWorld(true);
  return { drawnRight: b.right, hand: h.getWorldPosition(h.position.clone()).x };
});
console.log(`reach_lift near arm: drawn tip x ${mm(tip.drawnRight)} mm, gator.hand x ${mm(tip.hand)} mm, off ${mm(Math.abs(tip.drawnRight - tip.hand))} mm`);
await browser.close(); server.close();
