// node evidence/anim-s17/measure.mjs → measure.txt. Builds s17 on measure.html (no post) and checks, from the live
// scene and its pixels: the locked camera and the 4 Hz boil (acceptance 1), the blob path and the stillness after the
// 12.000 drawing (3), when the dawn reaches his head and his pocket rim (4), the blob shadow scales, the spec's
// projected points, the face fill, and the paper cache on a 25 s shot. Times are s17-local.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s17/measure.html');
const ev = (f, ...a) => page.evaluate(f, ...a);
const f = (v, d = 4) => (Array.isArray(v) ? v.map((x) => x.toFixed(d)).join(', ') : v.toFixed(d));
const out = [];
const log = (s = '') => { out.push(s); console.log(s); };

log('== Acceptance 1: the camera, every frame 0.000–24.958 (600 frames; boil held so only update() runs)');
await ev(() => window.hold({ boil: 0, light: null }));
const cam0 = (await ev(() => window.step(0))).cam;
let camMoves = 0;
for (let i = 1; i < 600; i++) if ((await ev((t) => window.step(t), i / 24)).cam !== cam0) camMoves++;
log(`  frames whose camera world or projection matrix differs from frame 0: ${camMoves} → ${camMoves === 0 ? 'PASS' : 'FAIL'}`);

log('\n== Acceptance 1: boil rate. Light held at 15.0; frames 15.000–16.000 at 24 fps, each against the one before');
await ev(() => window.hold({ boil: null, light: 15 }));
await ev(() => { window.frame(15); window.keep(); });
const changed = [];
for (let i = 361; i <= 384; i++) {
  await ev((t) => window.frame(t), i / 24);
  const d = await ev(() => { const d = window.diffPrev(); window.keep(); return d; });
  if (d.n) changed.push(`${(i / 24).toFixed(3)} (${d.n} px, max ${d.max})`);
}
log(`  frames that differ from the previous one: ${changed.join('; ') || 'none'}`);
log(`  expected: only 15.250, 15.500, 15.750, 16.000 (boilSeed(t, 4)) → ${changed.length === 4 && ['15.250', '15.500', '15.750', '16.000'].every((t, j) => changed[j].startsWith(t)) ? 'PASS' : 'FAIL'}`);

log('\n== Acceptance 3: the blob path, every drawing 6.500–12.083 (centre = mesh + r), against the spec table');
await ev(() => window.hold({ boil: 0, light: null }));
const TABLE = { '7.000': [0, 0.005, 0.0884], '7.333': [-0.012, 0.012, 0.0884], '7.500': [-0.020, 0.005, 0.0884], '8.583': [-0.036, 0.012, 0.090],
  '8.750': [-0.046, 0.000, 0.088], '9.500': [-0.050, 0.004, 0.088], '10.000': [-0.055, 0.010, 0.088], '10.500': [-0.059, 0.016, 0.088],
  '10.750': [-0.060, 0.012, 0.0755], '11.000': [-0.060, 0.012, 0.0755], '12.000': [-0.060, 0.009, 0.0755] };
let pocket = null;
for (let n = 78; n <= 145; n++) {
  const t = n / 12, p = await ev((t) => window.step(t), t + 1e-6), k = t.toFixed(3);
  pocket = p.pocket;
  const c = p.blob ? [p.blob[0], p.blob[1] + 0.005, p.blob[2]] : null;
  const spec = TABLE[k];
  if (spec || n % 3 === 0 || !c) log(`  ${k}  blob ${c ? f(c) : 'hidden'}${spec ? `   spec (${f(spec)})  Δ ${f(c.map((v, j) => (v - spec[j]) * 1000), 1)} mm` : ''}`);
}
log(`  this rig's pocket (settled pose): centre x ${pocket[0].toFixed(4)}, rim y ${pocket[1].toFixed(4)}, z ${pocket[2]} (spec: x −0.060 centre, rim 0.014)`);

log('\n== Acceptance 3: stillness after the 12.000 drawing (it carries the pocket bulge and the last blob drawing)');
const s0 = (await ev(() => window.step(12 + 2 / 24))).state;
let stillMoves = 0;
for (let i = 291; i < 600; i++) if ((await ev((t) => window.step(t), i / 24)).state !== s0) stillMoves++;
log(`  frames 12.083–24.958 (309): puppet part matrices, visibility, face, blob: ${stillMoves} differ from 12.083 → ${stillMoves === 0 ? 'PASS' : 'FAIL'}`);
const s12 = (await ev(() => window.step(12))).state, s11 = (await ev(() => window.step(11.9))).state;
log(`  12.000 differs from 12.083: ${s12 !== s0}; 11.917 differs from 12.000: ${s11 !== s12} (the last two drawings that move)`);
await ev(() => window.hold({ boil: 13, light: 15 }));
await ev(() => { window.frame(12 + 2 / 24); window.keep(); });
const px = [];
for (const t of [13, 15.5, 18, 21, 24.958]) { await ev((t) => window.frame(t), t); px.push(`${t}: ${(await ev(() => window.diffPrev())).n} px`); }
log(`  pixels with boil and light held, against 12.083: ${px.join(', ')} → ${px.every((s) => s.endsWith(' 0 px')) ? 'PASS' : 'FAIL'}`);

log('\n== Acceptance 4: where the dawn lands. Each t rendered with and without the dawn light; pixels the dawn brightens by > 0.05');
await ev(() => window.hold({ boil: null, light: null }));
const p0 = await ev(() => window.frame(13));
const H = p0.head, PK = p0.pocket;
const boxes = {
  head: [[H[0] - 0.010, H[1] - 0.010, 0.077], [H[0] + 0.022, H[1] + 0.012, 0.077]],
  'pocket rim': [[PK[0] - 0.007, PK[1] - 0.002, 0.077], [PK[0] + 0.007, PK[1] + 0.001, 0.077]],
  'fg sleeper head': [[0.105, 0.025, 0.354], [0.135, 0.047, 0.354]],
};
const first = {};
for (let i = 0; i <= 50; i++) {
  const t = i / 2;
  await ev((t) => window.frameWithout(t, 'dawn'), t);
  const r = [];
  for (const [name, [a, b]] of Object.entries(boxes)) {
    const d = await ev((a, b) => window.boxDiff(a, b, 0.05), a, b);
    r.push(`${name} ${String(d.n).padStart(4)}/${d.tot} px (max ${d.max.toFixed(2)})`);
    if (d.n >= 20 && first[name] === undefined) first[name] = t;
  }
  log(`  t ${t.toFixed(1).padStart(4)}  el ${(3 + 37 * Math.min(1, t / 22)).toFixed(1).padStart(4)}°  ${r.join('   ')}`);
}
log(`  first t with ≥ 20 dawn-lit px: head ${first.head ?? 'never'} (spec ≈ 11.7, by 12 ±1.5 → ${first.head <= 13.5 && first.head >= 10.2 ? 'PASS' : 'FAIL'}), ` +
  `pocket rim ${first['pocket rim'] ?? 'never'} (spec ≈ 19 ±1.5 → ${first['pocket rim'] >= 17.5 && first['pocket rim'] <= 20.5 ? 'PASS' : 'FAIL'}), fg sleeper head ${first['fg sleeper head'] ?? 'never'} (spec ≈ 1)`);

log('\n== Shadow scale. Each frame rendered with and without the blob; the shadow is where hiding it brightens by > 0.1');
const extent = (s) => { const h = s.filter((q) => q[1] !== null && q[2] !== null && q[2] - q[1] > 0.1); return h.length ? [h[0][0], h.at(-1)[0]] : null; };
for (const [what, c, r, lampY] of [['blob', [0, 0.005, 0.0884], 0.005, 0.056], ['nbBlob', [0.350, 0.013, 0.098], 0.013, 0.056]]) {
  await ev((w) => window.frameWithout(2, w), what);
  const own = extent(await ev((c, r) => window.scanBoth([c[0] - 3 * r, c[1], c[2] + 0.0001], [c[0] + 3 * r, c[1], c[2] + 0.0001], 300), c, r));
  if (!own) { log(`  ${what}: not in frame`); continue; }
  const w = own[1] - own[0];
  log(`  ${what} at t 2: own width from pixels ${(w * 1000).toFixed(2)} mm (r ${r}); geometry pool ${(lampY / (lampY - c[1])).toFixed(3)}x`);
  for (const dz of [0.003, 0.005]) {
    const e = extent(await ev((c, r, dz) => window.scanBoth([c[0] - 4 * r, 0.0004, c[2] + dz], [c[0] + 4 * r, 0.0004, c[2] + dz], 400), c, r, dz));
    log(`    pool row z ${(c[2] + dz).toFixed(4)}: ${e ? `${(e[1] - e[0]) * 1000 > 0 ? ((e[1] - e[0]) * 1000).toFixed(2) : 0} mm = ${((e[1] - e[0]) / w).toFixed(2)}x its width` : 'no shadow'}`);
  }
}

log('\n== The spec\'s projected points (1920×1080)');
const pp = await ev(() => { const p = window.frame(13); return { p, q: {
  'hero head': window.project(p.head), pocket: window.project(p.pocket), 'blob start': window.project([0, 0.005, 0.0884]),
  'neighbor head': window.project(p.nbHead), 'fg sleeper head': window.project([0.120, 0.035, 0.354]) } }; });
const SPEC = { 'hero head': [604, 681], pocket: [624, 760], 'blob start': [807, 789], 'neighbor head': [1889, 760], 'fg sleeper head': [1247, 968] };
for (const [k, v] of Object.entries(pp.q)) log(`  ${k.padEnd(16)} (${v.map((x) => x.toFixed(0)).join(', ')})  spec (${SPEC[k].join(', ')})`);
log(`  neighbor head world (${f(pp.p.nbHead)}), spec "near (0.360, 0.008)"`);

log('\n== README §10 fill: face (head centre, 9×9 px) against the lamp pool on the page (−0.020, 0.0004, 0.095)');
for (const t of [2, 6]) {
  const p = await ev((t) => window.frame(t), t);
  const [fc, k] = await ev((a) => [window.lumAvg(a, 4), window.lumAvg([-0.020, 0.0004, 0.095], 4)], p.head);
  log(`  t ${t}: face ${fc.toFixed(3)}, pool ${k.toFixed(3)} → ${(fc / k * 100).toFixed(0)}% (30–45%)`);
}

log('\n== Paper cache on a 25 s shot (boil 4/s = 100 steps). ms per frame(); a frame on a new boil step re-tears every sheet');
const time = async (t) => { const a = Date.now(); await ev((t) => window.frame(t), t); return Date.now() - a; };
const cold = await time(13), warm = await time(13), same = await time(13 + 1 / 24);
let all = 0; const a0 = Date.now();
for (let i = 0; i < 100; i++) { await ev((t) => window.frame(t), i / 4); all++; }
const sweep = (Date.now() - a0) / all, again = await time(13);
log(`  t 13.000 first visit ${cold} ms; again ${warm} ms; 13.042 (same step) ${same} ms`);
log(`  every boil step once (100 frames): ${sweep.toFixed(0)} ms/frame; then t 13.000 again: ${again} ms → ${again > 3 * warm ? 'evicted: a replay of this shot runs cold' : 'still cached'}`);

(await import('node:fs')).writeFileSync(new URL('./measure.txt', import.meta.url), out.join('\n') + '\n');
await browser.close(); server.close();
