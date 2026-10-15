// node evidence/rig-legs/feet.mjs: the side walk's foot contacts, measured on drawn pixels. For each of the 8 drawings
// of one cycle (t = 2000 + k/12, step 1/3 s) the root goes at walk().hip above a floor at y = 0, and window.probe draws
// each leg alone at 0.05 mm/px: its lowest pixel is that foot's height above the floor. Contact drawings (k = 0, 4):
// both feet on the floor (within ±0.5 mm). Between them: the stance foot (far leg in k 1–3, near in k 5–7) on the
// floor and the swing foot above it.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/rig-legs/lab.html');
const TOL = 0.0005;
let ok = true;
for (let k = 0; k < 8; k++) {
  const t = 2000 + k / 12;
  const r = await page.evaluate(async (t) => {
    const { keys, hip, lift } = window.lab.walk(t, { set: 'side', t0: 2000 });
    const near = await window.probe('gator', null, { t, keys, y: hip, parts: ['leg_r'] });
    const far = await window.probe('gator', null, { t, keys, y: hip, parts: ['leg_l'] });
    return { hip, lift, near, far };
  }, t);
  const n = r.near.bottom, f = r.far.bottom;
  const contact = k % 4 === 0, [stance, swing] = k < 4 ? [f, n] : [n, f];
  const pass = contact ? Math.abs(n) <= TOL && Math.abs(f) <= TOL : Math.abs(stance) <= TOL && swing > stance;
  ok &&= pass;
  const mm = (v) => (v * 1000).toFixed(2).padStart(6);
  console.log(`k ${k}${contact ? ' contact' : '        '}  hip ${mm(r.hip)}  lift ${mm(r.lift)}  near foot ${mm(n)}  far foot ${mm(f)} mm  ${contact ? 'both down' : 'swing clears by ' + ((swing - stance) * 1000).toFixed(2) + ' mm'}  ${pass ? 'ok' : 'FAIL'}`);
}
console.log(ok ? 'feet: PASS' : 'feet: FAIL');
await browser.close(); server.close();
process.exit(ok ? 0 : 1);
