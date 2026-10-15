// node evidence/anim-s08/thumb.mjs → every 1/24 s of the shot on measure.html's page (the shot's own update, local t):
// the near arm's angle (the thumb flick is +2° for one 2s drawing), the face takes, the head tilt, and the blob's eyes,
// printed as the runs where each state changes, against the spec's list.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s08/measure.html');
const rows = await page.evaluate(() => {
  const { rig } = window.shot, out = [];
  for (let i = 0; i < 144; i++) {
    const t = i / 24; window.renderFrame(t);
    const g = (n) => rig.meshes[n].userData.sheet?.key ?? '';
    out.push({ t, arm: +(rig.joints.arm_r.rotation.z * 180 / Math.PI).toFixed(2), tilt: +(rig.joints.body.rotation.z * 180 / Math.PI).toFixed(2), eyes: g('eyes'), mouth: g('mouth') });
  }
  return out;
});
const base0 = rows[0].arm, flicks = rows.filter((r) => r.arm !== base0).map((r) => r.t.toFixed(3));
const want = Array.from({ length: 12 }, (_, i) => 0.25 + 0.5 * i);
console.log(`arm baseline ${base0}°; frames with the arm off baseline (24 fps samples): ${flicks.join(' ')}`);
const starts = rows.filter((r, i) => r.arm !== base0 && rows[i - 1].arm === base0).map((r) => r.t), ends = rows.filter((r, i) => r.arm === base0 && i && rows[i - 1].arm !== base0).map((r) => r.t);
console.log(`flick starts ${starts.map((x) => x.toFixed(3)).join(' ')}\nflick ends   ${ends.map((x) => x.toFixed(3)).join(' ')}`);
console.log(`spec list    ${want.join(' ')}\nall 12 match (start within 1/24 s, lasting one 2s drawing): ${want.every((w, i) => Math.abs(starts[i] - w) < 1 / 24 && Math.abs(ends[i] - starts[i] - 1 / 12) < 1 / 24 + 1e-9)}`);
const change = (k) => rows.filter((r, i) => !i || r[k] !== rows[i - 1][k]).map((r) => `${r.t.toFixed(3)}:${r[k]}`).join(' ');
console.log(`head tilt  ${change('tilt')}\neyes key   ${change('eyes')}\nmouth key  ${change('mouth')}`);
await browser.close(); server.close();
