// node evidence/anim-s06/measure.mjs → measure.txt. Builds s06 on measure.html (no post, as anim-s15's rig) and prints
// what docs/shots/s06.md's acceptance asks for. Times are s06-local. Shadows are found by rendering each frame with and
// without the blob: the shadow is where hiding the blob brightens the receiver by > 0.1 (display luminance).
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s06/measure.html');
const ev = (f, ...a) => page.evaluate(f, ...a);
const f3 = (v, d = 4) => v.map((x) => x.toFixed(d)).join(', ');
const out = [], log = (s = '') => { out.push(s); console.log(s); };
const frame = (t) => ev((t) => window.frame(t), t);

log('== Lamp and phone spot (multipliers: lamp = intensity / LAMP_I; phone = intensity / PHONE_I)');
for (const t of [0.46, 0.5, 0.54, 1.5, 2.96, 3.0, 3.04, 5.0]) { const p = await frame(t); log(`  t ${t.toFixed(2)}  lamp ${p.lamp.toFixed(3)}  phone ${p.phone.toFixed(3)}  lamp visible ${p.lit}`); }

log('\n== Near-hand fingertip vs s15 (evidence/anim-s15/measure.txt, same rig) and the spec table');
const S15 = [[-0.0511, -0.0121], [-0.0511, -0.0121], [-0.0586, -0.0127], [-0.0269, 0.0165], [-0.0255, 0.0260], [-0.0238, 0.0231], [-0.0233, 0.0215], [-0.0238, 0.0231]];
const SPEC = [[-0.051, -0.012], [-0.051, -0.012], [-0.059, -0.013], [-0.027, 0.017], [-0.026, 0.026], [-0.024, 0.023], [-0.0233, 0.0215], [-0.024, 0.023]];
let worst = 0;
for (const [t0, from] of [[0, 0], [2.5, 2]]) for (let k = from; k < 8; k++) {
  const t = t0 + k / 12 + 0.01, p = await frame(t);
  const d15 = Math.hypot(p.hand[0] - S15[k][0], p.hand[1] - S15[k][1]) * 1000, ds = Math.hypot(p.hand[0] - SPEC[k][0], p.hand[1] - SPEC[k][1]) * 1000;
  worst = Math.max(worst, d15);
  log(`  K${k} t ${(t0 + k / 12).toFixed(3)}  tip (${f3(p.hand)})  vs s15 ${d15.toFixed(2)} mm  vs spec ${ds.toFixed(2)} mm`);
}
log(`  worst vs s15: ${worst.toFixed(2)} mm → ${worst <= 1 ? 'PASS' : 'FAIL'} (≤ 1 mm)`);

log('\n== Shadow scale, geometry (lights.js shadowScale)');
for (const t of [0.25, 2.0, 5.0]) { const p = await frame(t); log(`  t ${t}  wall ${p.wallScale.toFixed(3)}x  pool ${p.poolScale.toFixed(3)}x  blob centre (${f3(p.blob)})`); }

const extent = (s, x0, x1) => { const h = s.filter((q) => q[1] != null && q[2] != null && q[0] >= x0 && q[0] <= x1 && q[2] - q[1] > 0.1);
  return h.length ? [h[0][0], h.at(-1)[0]] : null; };
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
log('\n== From pixels');
// s06 has no frame where the blob can be isolated by hiding it (its own 4x wall shadow sits behind it all shot), so the
// blob's width is anim-s15's pixel measure of the same blob (makeExam seed 1, r 0.012, evidence/anim-s15/measure.txt).
const blobW = 0.0268;
log(`  blob width at its centre height: ${blobW} m (anim-s15's pixel measure of the same blob)`);
const wallAt = async (t) => {
  const p = await ev((t) => window.frameBoth(t), t), L = [-0.014, 0.006, 0.116], S = p.wallScale;
  const cx = L[0] + (p.blob[0] - L[0]) * S, cy = L[1] + (p.blob[1] - L[1]) * S;
  const row = await ev((y) => window.scanBoth([-0.14, y, 0.0005], [0.20, y, 0.0005], 680), cy);
  const vr = row.filter((q) => q[1] != null), e = extent(row, -0.14, 0.20);
  const body = await ev((x, y) => window.scanBoth([x - 0.01, y, 0.0005], [x + 0.01, y, 0.0005], 40), cx, cy - 0.02);
  const q = body.filter((r) => r[1] != null), lit = q.reduce((a, r) => a + r[2], 0) / q.length, sh = q.reduce((a, r) => a + r[1], 0) / q.length;
  const litL = q.reduce((a, r) => a + lin(r[2]), 0) / q.length, shL = q.reduce((a, r) => a + lin(r[1]), 0) / q.length;
  return { cx, cy, S, e, vr, lit, sh, c: (lit - sh) / lit, cL: (litL - shL) / litL };
};
const W = {};
for (const t of [0.25, 1.5, 5.0]) {
  const w = W[t] = await wallAt(t);
  log(`  wall t ${t}: centre (${w.cx.toFixed(4)}, ${w.cy.toFixed(4)}); row y ${w.cy.toFixed(3)}: shadow x ${w.e ? `${w.e[0].toFixed(4)}…${w.e[1].toFixed(4)}` : 'none (below threshold)'} ` +
    `(frame x ${w.vr[0][0].toFixed(3)}…${w.vr.at(-1)[0].toFixed(3)})${w.e ? ` = ${((w.e[1] - w.e[0]) / blobW).toFixed(2)}x the blob` : ''}`);
  log(`    body below the eyes: lit ${w.lit.toFixed(3)}, in shadow ${w.sh.toFixed(3)} → contrast ${(w.c * 100).toFixed(1)}% display, ${(w.cL * 100).toFixed(1)}% linear`);
}
log(`  1.5 s wall-shadow contrast ${(W[1.5].c * 100).toFixed(1)}% display / ${(W[1.5].cL * 100).toFixed(1)}% linear → ${W[1.5].c <= 0.2 ? 'PASS' : 'FAIL'} (≤ 20%)`);
log(`  shadow depth 1.5 / 0.25: ${((W[1.5].lit - W[1.5].sh) / (W[0.25].lit - W[0.25].sh) * 100).toFixed(1)}% display (anim-s15's measure)`);

for (const t of [2.0]) {
  const p = await ev((t) => window.frameBoth(t), t);
  for (const dz of [-0.003, 0.003, 0.005]) {
    const z = p.blob[2] + dz, e = extent(await ev((z, x) => window.scanBoth([x - 0.04, 0.0004, z], [x + 0.04, 0.0004, z], 400), z, p.blob[0]), -1, 1);
    log(`  pool t ${t} z ${z.toFixed(4)} (${dz > 0 ? 'in front of' : 'behind'} the blob centre): shadow x ${e ? `${e[0].toFixed(4)}…${e[1].toFixed(4)} = ${((e[1] - e[0]) / blobW).toFixed(2)}x the blob's width` : 'none'}`);
  }
}

log('\n== Lamp vs out-shone phone at the blob (inverse square × cone, the spec\'s ≥ 4×)');
{ const p = await frame(1.5), b = p.blob;   // three's spot: I · smoothstep(cos θo, cos θi, cos θ) / d², at the blob's centre
  const sub = (a, c) => a.map((v, i) => v - c[i]), len = (a) => Math.hypot(...a), dot = (a, c) => a.reduce((s, v, i) => s + v * c[i], 0);
  const ss = (a, c, x) => { const k = Math.min(1, Math.max(0, (x - a) / (c - a))); return k * k * (3 - 2 * k); };
  const [lamp, phone] = p.spots.map((s) => { const v = sub(b, s.pos), ax = sub(s.aim, s.pos), d = len(v);
    return s.I * ss(Math.cos(s.angle), Math.cos(s.angle * (1 - s.penumbra)), dot(v, ax) / d / len(ax)) / d ** 2; });
  log(`  t 1.5: lamp ${lamp.toFixed(1)} / phone ${phone.toFixed(1)} = ${(lamp / phone).toFixed(1)}x → ${lamp / phone >= 4 ? 'PASS' : 'FAIL'}`); }

log('\n== README §10: face (head centre, 9×9 px) against the key-lit receiver');
{ const p = await frame(0.25), face = await ev((a) => window.lumAvg(a, 4), p.head);
  log(`  t 0.25: face ${face.toFixed(3)} / phone-lit wall ${W[0.25].lit.toFixed(3)} = ${(face / W[0.25].lit * 100).toFixed(0)}% (30–45%)`);
  const p2 = await frame(1.5), [f2, k2] = await ev((a, b) => [window.lumAvg(a, 4), window.lumAvg(b, 4)], p2.head, [-0.020, 0.0004, 0.095]);
  log(`  t 1.5: face ${f2.toFixed(3)} / lamp-lit page ${k2.toFixed(3)} = ${(f2 / k2 * 100).toFixed(0)}% (30–45%)`); }

(await import('node:fs')).writeFileSync(new URL('./measure.txt', import.meta.url), out.join('\n') + '\n');
await browser.close(); server.close();
