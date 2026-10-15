// Mean RGB of the blob's ink body in lab/lookdev.html, phone (t=3) and lamp (t=8).
// Run from the repo root: node evidence/look-pass-2/blob_measure.mjs
// Mask: the blob is rendered alone over two different backgrounds; pixels that don't change are its opaque body.
// Highlight and eyes: the blob is rendered alone once more with its ink colour and room fill zeroed, which leaves only
// the key light's reflection, the eyes and their catchlights; pixels brighter than luma 40 there, grown by 3 px, are left out.
// The body is then sampled in the full scene, raw (renderer output, no post) and graded (the page's post: DOF, night LUT,
// grain). The graded reference is #0A0A0F itself pushed through the same night LUT, since the grade lifts every black.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';

const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/lookdev.html');
const out = await page.evaluate(async () => {
  const { THREE, stage, scene, camera, blob } = window.lab;
  const r = stage.renderer, gl = r.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
  const read = () => { const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };
  const raw = () => { r.setRenderTarget(null); r.render(scene, camera); return read(); };
  const res = {};
  for (const t of [3, 8]) {
    stage.renderFrame(t); const graded = read();
    const full = raw();
    const hidden = []; scene.traverse((o) => { if ((o.isMesh || o.isPoints) && o !== blob.mesh && o.visible) { hidden.push(o); o.visible = false; } });
    const bg = scene.background; scene.background = new THREE.Color(1, 0, 1); const m1 = raw();
    scene.background = new THREE.Color(0, 1, 0); const m2 = raw();
    const u = blob.mesh.material.uniforms, ink = u.uInk.value.clone(), obr = blob.mesh.onBeforeRender;
    blob.mesh.onBeforeRender = (...a) => { obr(...a); u.uAmb.value.setRGB(0, 0, 0); u.uInk.value.setRGB(0, 0, 0); };
    scene.background = new THREE.Color(0, 0, 0); const hl = raw();
    blob.mesh.onBeforeRender = obr; u.uInk.value.copy(ink);
    scene.background = bg; hidden.forEach((o) => { o.visible = true; });
    const body = new Uint8Array(W * H), hot = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const o = i * 4;
      if (m1[o] === m2[o] && m1[o + 1] === m2[o + 1] && m1[o + 2] === m2[o + 2]) {
        body[i] = 1;
        if (0.2126 * hl[o] + 0.7152 * hl[o + 1] + 0.0722 * hl[o + 2] > 40) hot[i] = 1;
      }
    }
    const R = 3, excl = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) if (hot[i]) {
      const x = i % W, y = (i / W) | 0;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) excl[yy * W + xx] = 1; }
    }
    const mean = (px) => { const s = [0, 0, 0]; let n = 0; for (let i = 0; i < W * H; i++) if (body[i] && !excl[i]) { n++; for (let c = 0; c < 3; c++) s[c] += px[i * 4 + c]; } return { n, rgb: s.map((v) => +(v / n).toFixed(1)) }; };
    let nb = 0, nx = 0; for (let i = 0; i < W * H; i++) { nb += body[i]; nx += body[i] && excl[i]; }
    res[t] = { bodyPx: nb, excludedPx: nx, raw: mean(full).rgb, graded: mean(graded).rgb };
  }
  // #0A0A0F through the night LUT (trilinear, as LUTPass samples it).
  const { loadLUT } = await import('/src/post.js');
  const lut = loadLUT('night'), S = lut.image.width, d = lut.image.data;
  const ink = [10, 10, 15].map((v) => v / 255 * (S - 1));
  const at = (r, g, b, c) => d[(r + g * S + b * S * S) * 4 + c];
  res.inkThroughNight = [0, 1, 2].map((c) => {
    const [x, y, z] = ink, [x0, y0, z0] = [x, y, z].map(Math.floor), [fx, fy, fz] = [x - x0, y - y0, z - z0];
    let v = 0;
    for (const [i, wx] of [[0, 1 - fx], [1, fx]]) for (const [j, wy] of [[0, 1 - fy], [1, fy]]) for (const [k, wz] of [[0, 1 - fz], [1, fz]]) v += wx * wy * wz * at(x0 + i, y0 + j, z0 + k, c);
    return +v.toFixed(1);
  });
  return res;
});
const dist = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
for (const t of [3, 8]) {
  const o = out[t];
  console.log(`t=${t}  body ${o.bodyPx} px, ${o.excludedPx} left out as highlight/eyes`);
  console.log(`  raw    mean ${o.raw.join(',')}  max |Δ| vs #0A0A0F (10,10,15): ${dist(o.raw, [10, 10, 15]).toFixed(1)}`);
  console.log(`  graded mean ${o.graded.join(',')}  max |Δ| vs #0A0A0F through night (${out.inkThroughNight.join(',')}): ${dist(o.graded, out.inkThroughNight).toFixed(1)}`);
}
await browser.close();
server.close();
