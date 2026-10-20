// node evidence/anim-s16/measure.mjs → measure.txt. Builds s16 alone on measure.html (no post, so pixels are the lit
// scene) and checks the spec's acceptance items from the live scene and its pixels. Times are s16-local.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s16/measure.html');
const ev = (f, ...a) => page.evaluate(f, ...a);
const out = [];
const log = (s = '') => { out.push(s); console.log(s); };
const SOLVES = [3, 8.5, 11, 13, 14.5, 16], f = (x, n = 4) => x.toFixed(n);

// The blob's width in px on its centre row: render with and without it, first to last pixel that changes by > thr.
async function blobWidth(t, which, centre) {
  const p = await ev((t, w) => { window.hide(w); return window.frameBoth(t); }, t, which);
  const [cx, cy] = await ev((c) => window.project(c), centre(p));
  const row = await ev((y, a, b) => window.rowBoth(y, a, b), Math.round(cy), Math.round(cx - 150), Math.round(cx + 150));
  const hit = row.filter((q) => Math.abs(q[2] - q[1]) > 0.06);
  return { p, w: hit.length ? hit.at(-1)[0] - hit[0][0] + 1 : 0, cx, cy };
}
const heroC = (p) => [0, 0.88 * p.r, 0.0884], N = await ev(() => window.N);
const nC = () => [N.blob[0], 0.88 * N.blob[1], N.blob[2]];

log('== Acceptance 1: face swaps (probe at the frame before and on the beat)');
for (const [t, what] of [[3.5, 'eyes → gasp'], [3.5 + 1 / 3, 'mouth → o']]) {
  for (const s of [t - 1 / 24, t]) { const p = await ev((s) => window.probeAt(s), s); log(`  t ${f(s, 3)}: eyes ${p.eyes}, mouth ${p.mouth}   (${what} on ${f(t, 3)})`); }
}

log('\n== Acceptance 2: Camera D strip 6.0–20.5 every 0.5 s: pose and blob width (px, its centre row, blob hidden vs shown)');
const rows = [];
for (let i = 0; i <= 29; i++) {
  const t = 6 + i / 2 + 0.25;   // mid-hold: past each solve's squash kick, same drawing as the pop at 6 + i/2
  const { p, w } = await blobWidth(t, 'h', heroC);
  rows.push({ t: 6 + i / 2, p, w });
}
const w0 = (await blobWidth(5.9, 'h', heroC)).w;   // not used for the ratio (Camera B); the D reference is r 0.0105 at 6.25
const ref = rows[0];
for (let i = 0; i < rows.length; i++) {
  const { t, p, w } = rows[i], prev = rows[i - 1];
  const differs = !prev || JSON.stringify(prev.p.joints) !== JSON.stringify(p.joints) || prev.p.pop !== p.pop;
  const want = ref.w * p.r / ref.p.r, err = (w - want) / want * 100;
  log(`  ${f(t, 1)}  ${(p.pop ?? '').padEnd(8)} pose differs from last: ${differs ? 'yes' : 'NO '}  r ${f(p.r)}  width ${w} px  (r-scaled from 6.0: ${want.toFixed(1)} px, ${err >= 0 ? '+' : ''}${err.toFixed(1)}%)`);
}
log(`  all poses differ from the previous: ${rows.every((r, i) => !i || JSON.stringify(rows[i - 1].p.joints) !== JSON.stringify(r.p.joints)) ? 'PASS' : 'FAIL'}`);
log('  steps land on the beat (probe r at the frame before and on each solve):');
for (const s of SOLVES) {
  const [a, b] = [await ev((x) => window.probeAt(x), s - 1 / 24), await ev((x) => window.probeAt(x), s)];
  log(`    ${f(s, 1)}: r ${f(a.r)} → ${f(b.r)}  ${b.r < a.r - 1e-6 ? 'PASS' : 'FAIL'}`);
}
const last = rows.at(-1);
log(`  end: r ${f(last.p.r)} (spec 0.005); width ${last.w} px vs ${(ref.w * 0.005 / ref.p.r).toFixed(1)} px expected → ${Math.abs(last.w / (ref.w * 0.005 / ref.p.r) - 1) <= 0.1 ? 'PASS (±10%)' : 'FAIL'}`);
log(`  (Camera B, 5.9: ${w0} px at r 0.0105)`);

log('\n== Acceptance 3: the neighbor (blob r 0.013 at (0.350, 0.013, 0.098))');
const pN = await ev(() => window.probeAt(14.9));
log(`  geometry: wall ${f(pN.nWallScale, 2)}x (spec 7.1x), pool ${f(pN.nPool, 3)}x (spec 1.30x)`);
const bw = (await blobWidth(17.25, 'n', nC)).w;   // phone face-down, lamp on: only the body changes on its row
log(`  their blob's own width at t 17.25: ${bw} px`);
// wall shadow centre: along phone → blob to z 0
const L = [0.360, 0.004, 0.114], B = N.blob, k = L[2] / (L[2] - B[2]);
const wc = [L[0] + (B[0] - L[0]) * k, L[1] + (B[1] - L[1]) * k, 0.0005];
log(`  predicted wall shadow centre (${f(wc[0])}, ${f(wc[1])})`);
const depth = {};
for (const t of [14.9, 15.2]) {
  await ev((t) => { window.hide('n', 'castShadow'); return window.frameBoth(t); }, t);
  const [cx, cy] = await ev((c) => window.project(c), wc);
  const row = await ev((y, a, b) => window.rowBoth(y, a, b), Math.round(cy), Math.max(0, Math.round(cx - 500)), Math.min(1919, Math.round(cx + 500)));
  const hit = row.filter((q) => q[2] - q[1] > 0.06);
  const body = await ev((y, a, b) => window.rowBoth(y, a, b), Math.round(cy + 150), Math.round(cx - 40), Math.round(cx + 40));
  depth[t] = body.reduce((a, q) => a + q[2] - q[1], 0) / body.length;
  const w = hit.length ? hit.at(-1)[0] - hit[0][0] + 1 : 0;
  log(`  t ${t}: wall row y ${Math.round(cy)} px: shadow ${w} px wide = ${(w / bw).toFixed(2)}x the blob's width; body depth (no-blob − blob, 150 px below centre) ${f(depth[t], 3)}`);
  if (t === 14.9) log(`    ≥ 6x before the click → ${w / bw >= 6 ? 'PASS' : 'FAIL'}`);
}
log(`  wall shadow depth after / before: ${(depth[15.2] / depth[14.9] * 100).toFixed(1)}% (README §4: ≤ 20%)`);
await ev(() => { window.hide('n', 'castShadow'); return window.frameBoth(15.25); });
for (const dz of [0.003, 0.005]) {
  const a = await ev((c) => window.project(c), [B[0] - 0.03, 0.0004, B[2] + dz]), b = await ev((c) => window.project(c), [B[0] + 0.03, 0.0004, B[2] + dz]);
  const row = await ev((y, x0, x1) => window.rowBoth(y, x0, x1), Math.round((a[1] + b[1]) / 2), Math.round(a[0]), Math.round(b[0]));
  const hit = row.filter((q) => q[2] - q[1] > 0.06), w = hit.length ? hit.at(-1)[0] - hit[0][0] + 1 : 0;
  log(`  pool t 15.25, desk row z ${f(B[2] + dz)}: shadow ${w} px = ${(w / bw).toFixed(2)}x the blob's width → ${w > 0 && w / bw <= 1.35 ? 'PASS (≤ 1.35x)' : 'CHECK'}`);
}

log('\n== Acceptance 4: the hero lamp (every frame, 0–21 at 24 fps) and the hero\'s wall');
let minI = Infinity, maxI = 0;
for (let i = 0; i < 504; i++) { const p = await ev((t) => window.probeAt(t), i / 24); minI = Math.min(minI, p.lamp); maxI = Math.max(maxI, p.lamp); }
log(`  lamp on and intensity in [${minI}, ${maxI}] over 504 frames → ${minI > 0 && minI === maxI ? 'PASS (constant, never off)' : 'FAIL'}`);
for (const t of [0.4, 3.2, 8.25, 14.9, 20.9]) {
  await ev((t) => { window.hide('h', 'castShadow'); return window.frameBoth(t); }, t);
  const pool = await ev(() => window.lumAt([-0.012, 0.0004, 0.100]));
  let n = 0, hit = 0;
  for (let x = -0.06; x <= 0.16; x += 0.005) for (let y = 0.005; y <= 0.2; y += 0.005) {
    const s = await ev((a) => window.scanBoth(a, a, 0)[0], [x, y, 0.0005]);
    if (s[1] == null || Number.isNaN(s[1])) continue; n++; if (s[2] - s[1] > 0.03) hit++;
  }
  log(`  t ${t}: pool lum ${f(pool, 3)}; wall behind the hero desk: ${hit} of ${n} visible points darkened > 0.03 by his blob's shadow → ${hit === 0 ? 'no wall shadow' : 'WALL SHADOW'}`);
}

log('\n== Acceptance 5: cuts (camera position every frame)');
let cuts = [], prev = null;
for (let i = 0; i < 504; i++) { const c = JSON.stringify((await ev((t) => window.probeAt(t), i / 24)).cam); if (prev && c !== prev) cuts.push(i / 24); prev = c; }
log(`  camera changes at: ${cuts.map((x) => f(x, 3)).join(', ') || 'none'} → ${cuts.length === 1 && cuts[0] === 6 ? 'PASS (one cut, at 6.0)' : 'FAIL'}`);

log('\n== README §10: faces (head piece centre, 9×9 px mean) against the key-lit receiver');
for (const [t, who, recv, name] of [[3.2, 'head', [-0.012, 0.0004, 0.100], 'hero lamp pool'], [10.25, 'head', [-0.012, 0.0004, 0.100], 'hero lamp pool'],
  [10.25, 'nHead', wc, 'neighbor phone-lit wall'], [17.25, 'nHead', [N.blob[0] + 0.01, 0.0004, N.blob[2] + 0.004], 'neighbor lamp pool']]) {
  const p = await ev((t) => window.frame(t), t), [a, b] = await ev((h, r) => [window.lumAvg(h, 4), window.lumAvg(r, 4)], p[who], recv);
  log(`  t ${t} ${who}: face ${f(a, 3)}, ${name} ${f(b, 3)} → ${(a / b * 100).toFixed(0)}% (30–45%)`);
}

(await import('node:fs')).writeFileSync(new URL('./measure.txt', import.meta.url), out.join('\n') + '\n');
await browser.close(); server.close();
