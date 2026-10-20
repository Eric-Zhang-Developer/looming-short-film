// node evidence/anim-s14/measure.mjs → measure.txt. Builds s14 on measure.html (no post, so pixels are the lit scene) and checks
// the spec's acceptance items from the live scene: the Custodian's x and head (2), the swaps (3), the camera and focus (4), the lamp
// (5), the tiny blob's focus and pool and the hero's wall shadow (1), and the README §10 face fill. Times are s14-local seconds.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s14/measure.html');
const ev = (f, ...a) => page.evaluate(f, ...a);
const out = [];
const log = (s = '') => { out.push(s); console.log(s); };
const T = (a, b) => { const r = []; for (let i = Math.round(a * 24); i <= Math.round(b * 24); i++) r.push(i / 24); return r; };

log('== Acceptance 2: Custodian x_k and head, every frame 0.5–5.0 (24 fps)');
let maxX = 0, maxC = 0, heads = new Set(), n = 0;
for (const t of T(0.5, 5.0)) {
  const p = await ev((t) => window.frame(t), t), want = 0.27 - 0.11 * (t - 0.5);
  maxX = Math.max(maxX, Math.abs(p.x - want)); maxC = Math.max(maxC, Math.abs(p.cartX - (want - 0.07))); heads.add((p.custHead * 180 / Math.PI).toFixed(6)); n++;
}
log(`  ${n} frames: max |x_k − (0.27 − 0.11·(t − 0.5))| = ${maxX.toFixed(4)} m → ${maxX <= 0.005 ? 'PASS' : 'FAIL'} (≤ 0.005); cart centre vs x_k − 0.07: ${maxC.toFixed(4)} m`);
log(`  Custodian head joint angle (deg), distinct values over all frames: ${[...heads].join(', ')} → ${heads.size === 1 && [...heads][0] === '-20.000000' ? 'PASS (never changes from −20°)' : 'FAIL'}`);
for (const [label, t] of [['cart leading edge enters frame right (x_k − 0.10 = 0.150 at the walk plane)', 0.68], ['Custodian enters (spec 1.36)', 1.36], ['cart centre passes the hero, x −0.080 (spec 3.05)', 3.05], ['Custodian passes the hero, x_k −0.080 (spec 3.68)', 3.68]]) {
  const p = await ev((t) => window.frame(t), t); log(`  t ${t}: x_k ${p.x.toFixed(4)}, cart ${p.cartX.toFixed(4)}  (${label})`);
}

log('\n== Acceptance 3: the 3/4 head is on 2.8–4.4 only, as a one-frame swap');
{
  const rows = []; for (const t of T(2.7, 2.9).concat(T(4.3, 4.5))) rows.push([t, (await ev((t) => window.frame(t), t)).h34]);
  const flips = rows.filter((r, i) => i && r[1] !== rows[i - 1][1] && Math.abs(r[0] - rows[i - 1][0] - 1 / 24) < 1e-9);
  log('  ' + rows.map(([t, v]) => `${t.toFixed(3)}:${v ? '3/4' : 'profile'}`).join(' '));
  log(`  swaps at ${flips.map((f) => f[0].toFixed(3)).join(' and ')}: each between two adjacent 24 fps frames → ${flips.length === 2 ? 'PASS' : 'FAIL'}`);
}

log('\n== Acceptance 4: camera identical in every frame; focus moves only 1.4–1.8 and 3.2–3.6');
{
  let c0 = null, camDiff = 0, moved = [];
  let prev = null;
  for (const t of T(0, 4.99)) {
    await ev((t) => window.frame(t), t);
    const c = JSON.stringify(await ev(() => window.cam())), f = await ev((t) => window.focusAt(t), t);
    if (c0 === null) c0 = c; else if (c !== c0) camDiff++;
    if (prev !== null && Math.abs(f - prev[1]) > 1e-12) moved.push(t);
    prev = [t, f];
  }
  log(`  camera transform differs from t 0 in ${camDiff} of 120 frames → ${camDiff === 0 ? 'PASS' : 'FAIL'}`);
  log(`  focus changes between frames from ${moved[0].toFixed(3)} to ${moved.at(-1).toFixed(3)}; ranges: ` + (() => { const r = []; let s = moved[0], l = moved[0];
    for (const t of moved.slice(1)) { if (t - l > 1.5 / 24) { r.push([s, l]); s = t; } l = t; } r.push([s, l]); return r.map(([a, b]) => `${(a - 1 / 24).toFixed(3)}→${b.toFixed(3)}`).join(', '); })());
}

log('\n== Acceptance 5: the unlit lamp is visible in every frame (shade centre, 9×9 px; frame with the Custodian, cart and tiny blob hidden vs shown)');
{
  const shade = [0.004, 0.056 + 0.004, 0.0785];
  let worst = 0, hid = [];
  for (const t of T(0, 4.99).filter((_, i) => i % 2 === 0)) {
    await ev((t) => { window.setAisle(true); window.frame(t); }, t);
    const a = await ev((w) => window.lumAvg(w, 4), shade);
    await ev((t) => { window.setAisle(false); window.frame(t); window.setAisle(true); }, t);
    const b = await ev((w) => window.lumAvg(w, 4), shade);
    worst = Math.max(worst, Math.abs(a - b)); if (Math.abs(a - b) > 0.02) hid.push(t.toFixed(3));
  }
  log(`  shade centre luminance with vs without the aisle figures: worst difference ${worst.toFixed(3)}; frames where something covers it: ${hid.length ? hid.join(', ') : 'none'}`);
  const l = await ev((w) => window.lumAvg(w, 4), shade), bg = await ev((w) => window.lumAvg(w, 4), [0.004, 0.09, 0.0785]);
  log(`  lamp has no light object in the scene (none is built); the shade reads ${l.toFixed(3)} against the wall above it ${bg.toFixed(3)} (lit only by his phone's cone)`);
}

log('\n== Acceptance 1: tiny blob sharp and its pool ≤ 1.1×; the hero\'s wall shadow');
for (const t of [2.3, 3.0]) {
  const p = await ev((t) => window.frame(t), t), f = await ev((t) => window.focusAt(t), t), d = 0.708 - p.tinyZ;
  log(`  t ${t}: tiny blob ${d.toFixed(4)} m from the camera, focus ${f.toFixed(3)} m → ${(Math.abs(d - f) * 1000).toFixed(1)} mm off (the cart plane, held 1.8–3.2) → ${Math.abs(d - f) < 0.005 ? 'sharp' : 'NOT sharp'}`);
  log(`    pool width / blob width (world boxes of the decal and the blob plane, same geometry) = ${(p.poolW / p.tinyW).toFixed(3)}x (spec ≤ 1.1x)`);
}
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const extent = (s, x0, x1, th = 0.1) => { const h = s.filter((q) => q[1] != null && q[2] != null && q[0] >= x0 && q[0] <= x1 && q[2] - q[1] > th); return h.length ? [h[0][0], h.at(-1)[0]] : null; };
const U = await ev(() => window.UNIT), L = U.phoneLight, B = U.blob;
const p0 = await ev(() => window.frame(0.2)), S = p0.wallScale, cx = L[0] + (B[0] - L[0]) * S, cy = L[1] + (B[1] - L[1]) * S;
log(`  wall shadow by geometry (phone → wall / phone → blob): ${S.toFixed(3)}x; predicted centre (${cx.toFixed(4)}, ${cy.toFixed(4)})`);
await ev(() => { window.setPhone(0); window.frameBoth(0.2, 1); });   // the blob's own width: phone dark, so hiding it changes only the blob
const bRow = await ev((y, z) => window.scanBoth([-0.03, y, z], [0.03, y, z], 300), B[1], B[2] + 0.0001);
const be = extent(bRow, -0.03, 0.03, 0.012), blobW = be[1] - be[0];
log(`  (hidden-blob difference peaks at ${Math.max(...bRow.map((q) => (q[2] ?? 0) - (q[1] ?? 0))).toFixed(3)}; edge threshold 0.012 since only ambient lights the wall behind it)`);
log(`  blob's own width at its centre height, from pixels (phone dark): ${blobW.toFixed(4)} m`);
for (const t of [0.2, 2.3]) {
  await ev((t) => { window.setPhone(0.6); window.frameBoth(t, 1); }, t);
  const row = await ev((y) => window.scanBoth([-0.14, y, 0.0005], [0.14, y, 0.0005], 560), cy), e = extent(row, -0.14, 0.14);
  const body = await ev((x, y) => window.scanBoth([x - 0.01, y, 0.0005], [x + 0.01, y, 0.0005], 40), cx, cy - 0.02);
  const depth = body.reduce((a, q) => a + lin(q[2]) - lin(q[1]), 0) / body.length, key = body.reduce((a, q) => a + lin(q[2]), 0) / body.length;
  log(`  t ${t}: wall shadow x ${e ? e[0].toFixed(4) + '…' + e[1].toFixed(4) : 'none'} → ${e ? ((e[1] - e[0]) / blobW).toFixed(2) : '?'}x the blob's width (spec 7.1 ± 20%; s15's moved unit gives ${S.toFixed(2)}x); depth ${(depth / key * 100).toFixed(0)}% of the lit wall`);
}
{ // the aisle floor vs the wall: the tube is the key
  await ev(() => { window.setPhone(0.6); window.frame(1.0); });
  const floor = await ev(() => window.lumAvg([0.0, -0.034, 0.30], 6)), wallLit = await ev((a) => window.lumAvg(a, 6), [0.075, 0.03, 0.0005]), wallDark = await ev(() => window.lumAvg([-0.20, 0.05, 0.0005], 6));
  log(`  luminance: aisle floor ${floor.toFixed(3)}, phone-lit wall ${wallLit.toFixed(3)}, unlit wall ${wallDark.toFixed(3)} (the wall away from the phone is ${(wallDark / floor * 100).toFixed(0)}% of the aisle floor; spec ≤ 30%)`);
}

log('\n== README §10 character fill for the Custodian: the aisle fill\'s share of the light on his body (tube + fill vs tube alone), 9×9 px at his torso');
for (const t of [2.0, 3.6]) {
  const p = await ev((t) => window.frame(t), t), w = [p.x, -0.034 + 0.022, 0.233];
  const on = await ev((w) => window.lumAvg(w, 4), w);
  await ev((t) => { window.setFill(0); window.frame(t); }, t);
  const off = await ev((w) => window.lumAvg(w, 4), w);
  await ev(() => window.setFill(0.02));
  log(`  t ${t}: torso luminance ${off.toFixed(3)} (tube + ambient) → ${on.toFixed(3)} with the fill: the fill adds ${((on - off) / off * 100).toFixed(0)}% (README §5: ≤ 30% of the key)`);
}

log('\n== README §10 character fill: his face (head centre, 9×9 px) against the phone-lit wall where the loom falls (blob hidden)');
for (const t of [0.5, 4.8]) {
  await ev((t) => window.frameBoth(t, 1), t);
  const p = await ev((t) => window.frame(t), t), face = await ev((w) => window.lumAvg(w, 4), p.head);
  const key = await ev((w) => window.lumAvg(w, 4), [cx, cy - 0.02, 0.0005]);
  log(`  t ${t}: face ${face.toFixed(3)} against wall ${key.toFixed(3)} → ${(face / key * 100).toFixed(0)}% (README §10: 30–45%)`);
}
(await import('node:fs')).writeFileSync(new URL('./measure.txt', import.meta.url), out.join('\n') + '\n');
await browser.close(); server.close();
