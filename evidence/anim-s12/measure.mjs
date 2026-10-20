// node evidence/anim-s12/measure.mjs → measure.txt. Builds s12 on measure.html (no post, so pixels are the lit scene) and
// checks, from the live scene and its pixels: the wall-shadow scale (acceptance 3), its width at the breath's peak and
// trough (2), the locked camera and puppet (1), and the character fill. Times are s12-local. Then, on index.html (with
// post), the mean luminance of s12 at 8.0 against stills from the other built shots (4).
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'evidence/anim-s12/measure.html');
const ev = (f, ...a) => page.evaluate(f, ...a);
const out = [];
const log = (s = '') => { out.push(s); console.log(s); };
const extent = (s, thr) => { const h = s.filter((q) => q[1] != null && !isNaN(q[1]) && q[2] - q[1] > thr); return h.length ? [h[0][0], h.at(-1)[0]] : null; };

// The blob's own drawn width, from pixels: only the blob on a white background, so no shadow or room confuses the edge.
await ev(() => window.frame(3.0));
const blobW = async (t) => ev((t) => {
  const { scene, camera, renderer } = window.__s; scene.traverse((o) => { if (o.isMesh && o.name !== 'blob') { o.userData.v = o.visible; o.visible = false; } });
  const bg = scene.background; scene.background = new window.__T.Color(1, 1, 1);
  const p = window.frame(t); // renders with the blob and bright background
  const b = scene.getObjectByName('blob'), c = b.getWorldPosition(new window.__T.Vector3());
  const r = window.scanBoth([c.x - 0.04, c.y + 0.012, c.z], [c.x + 0.04, c.y + 0.012, c.z], 800).filter((q) => !isNaN(q[1]));
  scene.background = bg; scene.traverse((o) => { if (o.isMesh && o.name !== 'blob') o.visible = o.userData.v; });
  const dark = r.filter((q) => q[1] < 0.5); return dark.length ? [dark[0][0], dark.at(-1)[0]] : null;
}, t);

log('== Shadow scale (geometry) and the locked rig');
const p0 = await ev(() => window.frame(3.0));
log(`  spot at (${p0.spot.map((v) => v.toFixed(4)).join(', ')}), wall scale ${p0.wallScale.toFixed(3)}x (spec 7.1)`);
const cy = 0.061;
const widths = {};
for (const t of [1.25, 3.0, 3.75]) {
  await ev((t) => window.frameBoth(t), t);
  const row = await ev((y) => window.scanBoth([-0.095, y, 0.0005], [0.175, y, 0.0005], 1080), cy);
  const e = extent(row, 0.04), bw = await blobW(t);
  widths[t] = { w: e[1] - e[0], b: bw[1] - bw[0] };
  log(`  t ${t}: wall row y ${cy}: shadow x ${e[0].toFixed(4)}…${e[1].toFixed(4)} = ${(e[1] - e[0]).toFixed(4)} m (centre ${((e[0] + e[1]) / 2).toFixed(4)}; spec 0.061, frame x −0.098…0.178); blob drawn ${(widths[t].b).toFixed(4)} m → ${((e[1] - e[0]) / widths[t].b).toFixed(2)}x`);
}
const r = widths[1.25].w / widths[3.75].w;
log(`  breath: width at 1.25 ÷ at 3.75 = ${r.toFixed(3)} (${((1 - 1 / r) * 100).toFixed(1)}% narrower at the trough; spec 10–14%) → ${(1 - 1 / r) >= 0.10 && (1 - 1 / r) <= 0.14 ? 'PASS' : 'FAIL'}`);
log(`  scale at 3.0: ${(widths[3.0].w / widths[3.0].b).toFixed(2)}x vs 7.1 → ${Math.abs(widths[3.0].w / widths[3.0].b / 7.1 - 1) <= 0.2 ? 'PASS' : 'FAIL'} (±20%)`);

log('\n== Acceptance 1: camera matrix and every puppet transform, local 0…10: every 5th frame plus every frame of the 6.0–6.5 dim, vs t 0');
const key = (p) => JSON.stringify({ cam: p.cam, puppet: p.puppet, head: p.head, spot: p.spot });
const base0 = key(await ev(() => window.frame(0)));
let moved = 0, n = 0;
const idx = new Set([...Array.from({ length: 48 }, (_, i) => 1 + 5 * i), ...Array.from({ length: 13 }, (_, i) => 144 + i), 239]);
for (const i of idx) { n++; if (key(await ev((t) => window.frame(t), i / 24)) !== base0) moved++; }
log(`  ${n} frames: ${moved} differ in the camera matrix, any joint transform, the head's world position or the spot's position → ${moved === 0 ? 'PASS' : 'FAIL'}`);

log('\n== README §10 character fill: face against the phone-lit wall where the shadow falls (blob hidden)');
for (const t of [1.0, 5.0, 8.0]) {
  const p = await ev((t) => window.frameBoth(t), t);
  const face = await ev((a) => window.lumAvg(a, 4), p.head);
  const wall = await ev(() => { const q = window.scanBoth([0.04, 0.061, 0.0005], [0.08, 0.061, 0.0005], 20); return q.reduce((a, r) => a + r[2], 0) / q.length; });
  log(`  t ${t}: face ${face.toFixed(3)}, wall ${wall.toFixed(3)} → ${(face / wall * 100).toFixed(0)}% (README §10: 30–45%)`);
}
for (const t of [0.5, 5.0, 6.0, 6.25, 6.5, 8.0]) { await ev((t) => window.frame(t), t); log(`  mean luminance (no post) t ${t}: ${(await ev(() => window.meanLum())).toFixed(4)}`); }
await page.close();

log('\n== Acceptance 4: mean display luminance (index.html, with post) of s12 at global 86.0 against other shots');
const film = await openPage(browser, base, 'index.html');
const lum = (t) => film.evaluate(async (t) => {
  await window.renderFrame(t);
  const c = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
  const o = document.createElement('canvas'); o.width = 480; o.height = 270; const g = o.getContext('2d'); g.drawImage(c, 0, 0, 480, 270);
  const d = g.getImageData(0, 0, 480, 270).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  return s / (d.length / 4) / 255;
}, t);
const mine = await lum(86.0);
log(`  s12 @ 86.0: ${mine.toFixed(4)}   (@ 78.5: ${(await lum(78.5)).toFixed(4)}, @ 82.0: ${(await lum(82)).toFixed(4)}, @ 87.9: ${(await lum(87.9)).toFixed(4)})`);
const rows = [];
const ts = [];
for (const [a, b] of [[0, 8], [8, 16], [16, 24], [24, 33], [33, 42], [42, 50], [50, 58], [58, 66], [66, 72], [72, 78], [88, 95], [95, 103], [103, 110], [110, 120], [120, 130], [130, 140], [140, 150], [150, 160], [160, 170], [170, 180]]) for (let k = 0; k < 4; k++) ts.push(a + (b - a) * (k + 0.5) / 4);
for (const t of ts) rows.push([t, await lum(t)]);
rows.sort((x, y) => x[1] - y[1]);
log(`  darkest of ${rows.length} samples elsewhere (4 per ~8 s block, s01–s11 and s13–s18; unbuilt shots are stubs and count too):`);
for (const [t, l] of rows.slice(0, 6)) log(`    t ${t.toFixed(2)}: ${l.toFixed(4)}`);
log(`  s12 @ 86.0 (${mine.toFixed(4)}) vs the darkest other sample (${rows[0][1].toFixed(4)}) → ${mine < rows[0][1] ? 'PASS' : 'FAIL'}`);

(await import('node:fs')).writeFileSync(new URL('./measure.txt', import.meta.url), out.join('\n') + '\n');
await browser.close(); server.close();
