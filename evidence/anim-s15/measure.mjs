// node evidence/anim-s15/measure.mjs → measure.txt. Builds s15 on measure.html (no post) and checks, from the live scene
// and its pixels: the fingertip on the knob (acceptance 2), the K0–K7 drawings on 2s (3), the wall shadow and the lamp
// pool (1, shadow scale), and that no puppet part moves 5.0–7.0 (4). Times are s15-local.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s15/measure.html');
const ev = (f, ...a) => page.evaluate(f, ...a);
const f3 = (v) => v.map((x) => x.toFixed(4)).join(', ');
const out = [];
const log = (s = '') => { out.push(s); console.log(s); };

log('== Acceptance 2/3: fingertip vs knob, 0.000–0.583 at 24 fps (Camera A, 1920×1080)');
const rows = [];
for (let i = 0; i <= 14; i++) {
  const t = i / 24, p = await ev((t) => window.frame(t), t);
  const left = [p.knob[0] - 0.001, p.knob[1], p.knob[2]];
  const [hp, kp] = await ev((a, b) => [window.project(a), window.project(b)], p.hand, left);
  const d = Math.hypot(hp[0] - kp[0], hp[1] - kp[1]);
  rows.push({ t, hand: p.hand, hp, d });
  log(`  t ${t.toFixed(3)}  drawing ${Math.floor(t * 12 + 1e-4)}  tip (${f3(p.hand)})  tip px (${hp.map((x) => x.toFixed(1)).join(', ')})  knob-left px (${kp.map((x) => x.toFixed(1)).join(', ')})  gap ${d.toFixed(1)} px`);
}
const key = (r) => r.hand.map((x) => x.toFixed(5)).join(',');
const pairsHeld = [0, 2, 4, 6, 8, 10, 12].every((i) => key(rows[i]) === key(rows[i + 1]));
const drawings = [0, 2, 4, 6, 8, 10, 12, 14].map((i) => key(rows[i]));
log(`  each drawing held 2 frames: ${pairsHeld ? 'yes' : 'NO'}; drawings K0–K7: ${drawings.length}, distinct poses: ${new Set(drawings).size} (K0 = K1: ${drawings[0] === drawings[1]})`);
for (const t of [5 / 12, 0.5]) { const r = rows.find((r) => Math.abs(r.t - t) < 1e-9); log(`  ${t.toFixed(3)}: gap ${r.d.toFixed(1)} px → ${r.d <= 4 ? 'PASS' : 'FAIL'} (≤ 4 px)`); }

log('\n== Shadow scale, geometry (lights.js shadowScale, pool ratio as the spec writes it)');
const p0 = await ev(() => window.frame(0.4));
log(`  wall (phone→wall / phone→blob): ${p0.wallScale.toFixed(3)}x  (spec 7.1 ± 0.2)`);
log(`  pool (lamp h / (lamp h − r)):    ${p0.poolScale.toFixed(3)}x  (spec 1.27)`);

log('\n== Acceptance 1: the blob\'s shadow, from pixels. Each frame is rendered twice, with and without the blob; the shadow is');
log('   where hiding the blob brightens the receiver by > 0.1 (display luminance); depth also in linear light (sRGB-decoded).');
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
// The shadow's extent along a row: first to last sample in [x0, x1] where hiding the blob brightens it by > 0.1 (display).
// First-to-last, because the blob's eyes cut holes through its shadow (doc 03) and the rows cross them.
const extent = (s, x0, x1) => { const h = s.filter((q) => q[1] != null && q[2] != null && q[0] >= x0 && q[0] <= x1 && q[2] - q[1] > 0.1);
  return h.length ? [h[0][0], h.at(-1)[0]] : null; };
const depth = (s, x0, x1, f = (v) => v) => { const q = s.filter((q) => q[1] != null && q[0] >= x0 && q[0] <= x1);
  return q.reduce((a, r) => a + f(r[2]) - f(r[1]), 0) / q.length; };
const U = await ev(() => window.UNIT), L = U.phoneLight, B = U.blob;
const S = (await ev(() => window.frame(0.4))).wallScale, cx = L[0] + (B[0] - L[0]) * S, cy = L[1] + (B[1] - L[1]) * S;
log(`  predicted wall shadow centre (${cx.toFixed(4)}, ${cy.toFixed(4)}), scale ${S.toFixed(3)}x`);
await ev(() => window.frameBoth(8.0));   // phone face-down and dark: hiding the blob changes only the blob itself on this row
const bRow = await ev((y, z) => window.scanBoth([-0.03, y, z], [0.03, y, z], 300), B[1], B[2] + 0.0001);
const be = extent(bRow, -0.03, 0.03), blobW = be[1] - be[0];
log(`  blob's own width at its centre height, from pixels at t 8.0: ${blobW.toFixed(4)} m (x ${be[0].toFixed(4)}…${be[1].toFixed(4)})`);
const wall = {};
for (const t of [0.4, 0.6]) {
  await ev((t) => window.frameBoth(t), t);
  const row = await ev((y) => window.scanBoth([-0.14, y, 0.0005], [0.14, y, 0.0005], 560), cy);
  const col = await ev((x) => window.scanBoth([x, -0.03, 0.0005], [x, 0.14, 0.0005], 340), cx);
  const vr = row.filter((q) => q[1] != null), vc = col.filter((q) => q[1] != null);
  const e = extent(row, -0.14, 0.14), ec = extent(col.map((q) => [q[0], q[1], q[2], q]), -1, 1);
  const yOf = (q) => q[3] ? null : null;
  const colY = col.map((q, i) => [-0.03 + 0.17 * i / 340, q[1], q[2]]);
  const ey = extent(colY, -0.03, 0.14), topVis = colY.filter((q) => q[1] != null).at(-1)[0];
  const body = await ev((x, y) => window.scanBoth([x - 0.01, y, 0.0005], [x + 0.01, y, 0.0005], 40), cx, cy - 0.02);
  wall[t] = { d: depth(body, -1, 1), l: depth(body, -1, 1, lin), key: body.reduce((a, q) => a + q[2], 0) / body.length };
  log(`  wall t ${t}: row y ${cy.toFixed(3)}: shadow x ${e ? e[0].toFixed(4) + '…' + e[1].toFixed(4) : 'none'} (frame x ${vr[0][0].toFixed(3)}…${vr.at(-1)[0].toFixed(3)}); ` +
    `column x ${cx.toFixed(3)}: shadow y ${ey ? ey[0].toFixed(4) + '…' + ey[1].toFixed(4) : 'none'} (wall visible to y ${topVis.toFixed(3)}, below that the desk hides it from y ${colY.filter((q) => q[1] != null)[0][0].toFixed(3)})`);
  log(`    shadow depth (no-blob − blob, body below the eyes) ${wall[t].d.toFixed(3)} display`);
  if (t === 0.4 && e) {
    const r = (e[1] - e[0]) / blobW;
    log(`    silhouette inside the frame: left ${e[0] > vr[0][0] ? 'yes' : 'NO'}, right ${e[1] < vr.at(-1)[0] ? 'yes' : 'NO'}, top ${ey && ey[1] < topVis - 0.001 ? 'yes' : 'NO'} (margin ${ey ? ((topVis - ey[1]) * 1000).toFixed(1) : '?'} mm); bottom hidden by the desk`);
    log(`    width on the wall ÷ the blob's width = ${r.toFixed(2)}x (geometry ${S.toFixed(2)}x; ≥ 6x in the spec, ≥ 4x in the orchestrator's fix) → ${r >= 4 ? 'PASS (≥ 4x)' : 'FAIL'}`);
  }
}
log(`  wall shadow depth after / before the click: ${(wall[0.6].d / wall[0.4].d * 100).toFixed(1)}% display, ${(wall[0.6].l / wall[0.4].l * 100).toFixed(1)}% linear (spec ≤ 20%)`);
for (const t of [0.6, 2.0]) {   // untilted (3.5–4.8 it leans 10° toward him, widening its shadow)
  await ev((t) => window.frameBoth(t), t);
  for (const z of [B[2] + 0.003, B[2] + 0.005]) {
    const e = extent(await ev((z) => window.scanBoth([-0.04, 0.0004, z], [0.04, 0.0004, z], 400), z), -0.035, 0.035);
    log(`  pool t ${t} z ${z.toFixed(4)}: shadow x ${e ? `${e[0].toFixed(4)}…${e[1].toFixed(4)} = ${((e[1] - e[0]) / blobW).toFixed(2)}x the blob's width` : 'none'} (geometry 1.27x, ≤ 1.3x)`);
  }
}

log('\n== README §10 character fill: face (head piece centre, 9×9 px mean) against the key-lit receiver');
{
  const p = await ev(() => window.frame(0.4)), face = await ev((a) => window.lumAvg(a, 4), p.head);
  log(`  t 0.4: face ${face.toFixed(3)}, phone-lit wall where the shadow falls (with the blob hidden) ${wall[0.4].key.toFixed(3)} → ${(face / wall[0.4].key * 100).toFixed(0)}% (README §10: 30–45%)`);
  const p2 = await ev(() => window.frame(4.0)), [f2, k2] = await ev((a, b) => [window.lumAvg(a, 4), window.lumAvg(b, 4)], p2.head, [-0.020, 0.0004, 0.095]);
  log(`  t 4: face ${f2.toFixed(3)}, lamp pool on the page (−0.020, 0.0003, 0.095) ${k2.toFixed(3)} → ${(f2 / k2 * 100).toFixed(0)}% (README §10: 30–45%)`);
}

log('\n== Acceptance 4: 5.0–7.0, every puppet joint and the fingertip, sampled every 1/24 s');
let base0 = null, moved = 0, n = 0;
for (let i = 120; i < 168; i++) {
  const p = await ev((t) => window.frame(t), i / 24); n++;
  const k = JSON.stringify({ j: Object.fromEntries(Object.entries(p.joints).map(([a, b]) => [a, b.toFixed(6)])), h: p.hand.map((x) => x.toFixed(6)) });
  if (base0 === null) base0 = k; else if (k !== base0) moved++;
}
const c0 = await ev(() => { window.frame(5.0); return window.cam(); }), c1 = await ev(() => { window.frame(6.9); return window.cam(); });
log(`  ${n} frames: ${moved} differ from 5.000 in any joint angle or the fingertip → ${moved === 0 ? 'PASS' : 'FAIL'}`);
log(`  camera 5.000 pos (${f3(c0.pos)}) → 6.900 (${f3(c1.pos)}): the spec's push-in (5.0–10.0) moves it; see done note`);

(await import('node:fs')).writeFileSync(new URL('./measure.txt', import.meta.url), out.join('\n') + '\n');
await browser.close(); server.close();
