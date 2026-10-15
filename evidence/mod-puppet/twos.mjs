// node evidence/mod-puppet/twos.mjs   (from the repo root)
// Steps lab/puppet.html through t = 0..4 at 24 fps and reads the scene graph after each renderFrame(t):
// the puppet's state (every part's world matrix and current map) and the lamp's world position.
// Pass: the puppet changes only between frames 2m-1 and 2m (12 fps), and the lamp changes on every frame (24 fps).
import { serve, launch, openPage } from '../../tools/lib/page.mjs';

const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/puppet.html');
const states = await page.evaluate(() => {
  const { gator, lamp, THREE } = window.lab, v = new THREE.Vector3(), out = [];
  for (let i = 0; i <= 96; i++) {
    window.renderFrame(i / 24);
    const puppet = Object.values(gator.meshes).map((m) => m.matrixWorld.elements.join(',') + '|' + m.material.map.uuid).join(';');
    out.push({ puppet, light: lamp.light.getWorldPosition(v).toArray().join(',') });
  }
  return out;
});
await browser.close(); server.close();

let pChanged = 0, pOnOdd = 0, lChanged = 0;
const lines = [];
for (let i = 1; i < states.length; i++) {
  const p = states[i].puppet !== states[i - 1].puppet, l = states[i].light !== states[i - 1].light;
  if (p) { pChanged++; if (i % 2 === 1) pOnOdd++; }
  if (l) lChanged++;
  lines.push(`frame ${String(i - 1).padStart(2)}→${String(i).padStart(2)}  puppet ${p ? 'moved' : 'same '}  lamp ${l ? 'moved' : 'same'}`);
}
const n = states.length - 1;
console.log(lines.join('\n'));
console.log(`\n${n} frame steps at 24 fps (t = 0..4)`);
console.log(`puppet changed on ${pChanged} steps; ${pOnOdd} of them land between frames 2m and 2m+1 (must be 0)`);
console.log(`lamp changed on ${lChanged} of ${n} steps (must be ${n})`);
const ok = pOnOdd === 0 && lChanged === n && pChanged > 0;
console.log(ok ? 'twos: PASS' : 'twos: FAIL');
process.exit(ok ? 0 : 1);
