// node evidence/char-rigs/tips.mjs: poses the side gator at the s15 desk-unit hip (−0.075, −0.012) and reads the near
// fingertip (gator.hand) from the scene graph, against the fingertips the shot specs solved for ℓ 0.032.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const SPEC = { rest: [-0.051, -0.012], reach_antic: [-0.059, -0.013], reach_lift: [-0.027, 0.017], reach: [-0.026, 0.026],
  touch: [-0.024, 0.023], press: [-0.0233, 0.0215], grab: [-0.019, 0.005], grip: [-0.017, 0.001], sit_back: [-0.046, -0.005] };
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/characters.html');
const got = await page.evaluate((names) => {
  const g = window.lab.rigs.gator, out = {};
  g.group.position.set(-0.075, -0.012, 0); g.group.rotation.set(0, 0, 0);
  for (const n of names) {
    g.blend(window.lab.POSES, [[0, n]], 0); g.group.updateMatrixWorld(true);
    const p = g.hand.getWorldPosition(g.hand.position.clone()); out[n] = [p.x, p.y];
  }
  return out;
}, Object.keys(SPEC));
let worst = 0;
for (const [n, [x, y]] of Object.entries(SPEC)) {
  const [gx, gy] = got[n], e = Math.hypot(gx - x, gy - y) * 1000; worst = Math.max(worst, e);
  console.log(`${n.padEnd(12)} spec (${x.toFixed(4)}, ${y.toFixed(4)})  rig (${gx.toFixed(4)}, ${gy.toFixed(4)})  off ${e.toFixed(2)} mm`);
}
console.log(`worst ${worst.toFixed(2)} mm: ${worst < 1 ? 'PASS' : 'FAIL'} (< 1 mm)`);
await browser.close(); server.close();
process.exit(worst < 1 ? 0 : 1);
