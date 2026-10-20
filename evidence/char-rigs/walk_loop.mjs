// node evidence/char-rigs/walk_loop.mjs: reads every walking rig's joint angles and root height from the scene graph
// over 2 cycles at 24 fps (lab/characters.html, t from 2000, step 1/3 s) and checks
//   twos: frame 2m equals frame 2m+1 (drawings change only on 12 fps steps)
//   loop: frame k equals frame k + 16 (one cycle = 2 steps = 8 drawings = 16 frames)
//   moves: the cycle has at least 4 distinct drawings per step (contact, down, pass, up)
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/characters.html');
const states = await page.evaluate(async () => {
  const out = [];
  for (let k = 0; k < 34; k++) {
    window.renderFrame(2000 + k / 24);
    const s = {};
    for (const n of ['gator', 'front', 'back', 'tall', 'custodian']) {
      const r = window.lab.rigs[n];
      s[n] = [r.group.position.y, ...Object.values(r.joints).map((j) => j.rotation.z)].map((v) => Math.round(v * 1e7) + 0).join(',');
    }
    out.push(s);
  }
  return out;
});
let ok = true;
for (const n of Object.keys(states[0])) {
  let twos = 0, loop = 0;
  for (let k = 0; k + 1 < 34; k += 2) if (states[k][n] !== states[k + 1][n]) twos++;
  for (let k = 0; k + 16 < 34; k++) if (states[k][n] !== states[k + 16][n]) loop++;
  const distinct = new Set(states.slice(0, 16).map((s) => s[n])).size;
  const pass = twos === 0 && loop === 0 && distinct >= 6;
  ok &&= pass;
  console.log(`${n.padEnd(10)} odd-frame changes ${twos}/17  loop mismatches ${loop}/18  distinct drawings per cycle ${distinct}  ${pass ? 'PASS' : 'FAIL'}`);
}
console.log(ok ? 'walk loop: PASS' : 'walk loop: FAIL');
await browser.close(); server.close();
process.exit(ok ? 0 : 1);
