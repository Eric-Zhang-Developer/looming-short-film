// Measures the blob's shadow in lab/lookdev.html from pixels, independent of placeForScale's algebra.
// Run from the repo root: node evidence/look-pass-1/measure.mjs
// Per time: render plain (no post) with the blob casting, then not casting, then hidden. Changed pixels are the shadow
// (cast vs not) and the blob's silhouette (not casting vs hidden). Each pixel is back-projected through the camera
// onto whatever it sees (wall z = 0, desktop y = 0, or the blob's plane), so widths come out in meters.
// Every piece but the wall and desktop is hidden while measuring, so props in front can't cover the shadow.
import { serve, launch, openPage } from '../../tools/lib/page.mjs';

const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'lab/lookdev.html');
const out = await page.evaluate(async () => {
  const { THREE, stage, scene, camera, blob, pieces, BLOB_C } = window.lab;
  const r = stage.renderer, gl = r.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
  const grab = () => { r.render(scene, camera); const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };
  const lum = (px, i) => 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
  const plane = (n, c) => new THREE.Plane(new THREE.Vector3(...n), c);
  const WALL = plane([0, 0, 1], 0), DESK = plane([0, 1, 0], 0), BLOBP = plane([0, 0, 1], -BLOB_C.z);
  // World point a pixel sees on the wall or the desktop (the nearer surface), or on the blob's plane.
  function project(x, y, onBlob) {
    ndc.set((x + 0.5) / W * 2 - 1, (y + 0.5) / H * 2 - 1);  // readPixels rows run bottom-up, like NDC
    ray.setFromCamera(ndc, camera);
    if (onBlob) return ray.ray.intersectPlane(BLOBP, hit)?.clone();
    const w = ray.ray.intersectPlane(WALL, new THREE.Vector3()), d = ray.ray.intersectPlane(DESK, new THREE.Vector3());
    if (d && d.z >= 0 && d.z <= 0.33 && (!w || w.y < 0)) return Object.assign(d, { on: 'desk' });
    return w && w.y >= 0 ? Object.assign(w, { on: 'wall' }) : null;
  }
  function extent(a, b, onBlob, thresh) {
    const box = {};
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (Math.abs(lum(a, i) - lum(b, i)) < thresh) continue;
      const p = project(x, y, onBlob); if (!p) continue;
      const k = onBlob ? 'blob' : p.on, e = (box[k] ??= { n: 0, x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 });
      e.n++; e.x0 = Math.min(e.x0, p.x); e.x1 = Math.max(e.x1, p.x); e.y0 = Math.min(e.y0, p.y); e.y1 = Math.max(e.y1, p.y); e.z0 = Math.min(e.z0, p.z); e.z1 = Math.max(e.z1, p.z);
    }
    return box;
  }
  const res = {};
  for (const t of [1, 3, 6, 8]) {
    stage.renderFrame(t);
    const keep = new Set(['ld-wall', 'ld-desktop']);
    pieces.forEach((p) => { p.mesh.visible = keep.has(p.opts.key); });
    blob.stain.visible = false;
    blob.mesh.castShadow = true; const cast = grab();
    blob.mesh.castShadow = false; const none = grab();
    blob.mesh.visible = false; const hidden = grab();
    blob.mesh.visible = blob.stain.visible = blob.mesh.castShadow = true;
    pieces.forEach((p) => { p.mesh.visible = true; });
    res[t] = { shadow: extent(cast, none, false, 4), blob: extent(none, hidden, true, 4).blob };
  }
  return res;
});
const cm = (v) => (v * 100).toFixed(2);
for (const [t, { shadow, blob }] of Object.entries(out)) {
  const bw = blob.x1 - blob.x0, bh = blob.y1 - blob.y0;
  console.log(`t=${t}  blob on its plane: ${cm(bw)} x ${cm(bh)} cm (x ${cm(blob.x0)}..${cm(blob.x1)})`);
  for (const [on, e] of Object.entries(shadow)) {
    const w = e.x1 - e.x0;
    console.log(`  shadow on ${on}: ${e.n} px, x ${cm(e.x0)}..${cm(e.x1)} cm, y ${cm(e.y0)}..${cm(e.y1)}, z ${cm(e.z0)}..${cm(e.z1)}  width ratio ${(w / bw).toFixed(2)}x`);
  }
}
await browser.close(); server.close();
