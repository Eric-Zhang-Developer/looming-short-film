// climax-a1 evidence: the s07 ceiling shadow, measured. Builds s07 alone (as film.js builds a shot) and exposes
//   renderFrame(t)   s07 at local t, as the film draws it
//   measure(t)       → the shadow's extent on the ceiling: renders local t with the shadow caster on and off, takes the
//                      pixels that the caster darkens by > 12% of their lit value, back-projects each one through the camera
//                      onto the ceiling plane (y = CEIL), and reports the world x / z span, the blob's width (2.28 r at its
//                      current radius) and their ratio, plus the visible ceiling width at the shadow's mean depth.
import * as THREE from 'three';
import { createStage, exposeForRender } from '/src/core/stage.js';
import * as assets from '/src/assets.js';
import { PALETTE } from '/src/core/palette.js';
import { createPost } from '/src/post.js';
import { build, ROOM, BLOB_R } from '/src/shots/s07.js';

const stage = createStage(), { renderer, scene, camera } = stage;
let shot, draw = () => renderer.render(scene, camera);
const sstage = { renderer, scene, camera, onFrame: () => {}, setRender: (fn) => { draw = fn; } };
stage.ready = build({ stage: sstage, scene, camera, renderer, assets, PALETTE, post: (o) => createPost(sstage, o) }).then((s) => { shot = s; });
window.renderFrame = (t) => { shot.update(t); draw(); };
window.LOOMING = { duration: 12, fps: 24, ready: stage.ready };

const grabPx = () => {
  const c = renderer.domElement, o = Object.assign(document.createElement('canvas'), { width: c.width, height: c.height }), g = o.getContext('2d');
  g.drawImage(c, 0, 0); return g.getImageData(0, 0, c.width, c.height).data;
};
window.measure = (t, { fov } = {}) => {
  const fov0 = camera.fov; if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  shot.caster.visible = true; window.renderFrame(t); const on = grabPx();
  shot.caster.visible = false; window.renderFrame(t); const off = grabPx();
  shot.caster.visible = true; window.renderFrame(t);
  const W = renderer.domElement.width, H = renderer.domElement.height, ray = new THREE.Raycaster(), v = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), ROOM.CEIL), hit = new THREE.Vector3();
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, n = 0, zs = 0, px0 = W, px1 = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    const i = (y * W + x) * 4, a = on[i] + on[i + 1] + on[i + 2], b = off[i] + off[i + 1] + off[i + 2];
    if (b < 30 || a > 0.88 * b) continue;
    v.set((x + 0.5) / W * 2 - 1, -((y + 0.5) / H * 2 - 1)); ray.setFromCamera(v, camera);
    if (!ray.ray.intersectPlane(plane, hit) || hit.z < 0) continue;   // only the ceiling (the wall is z < 0 past it)
    n++; zs += hit.z; x0 = Math.min(x0, hit.x); x1 = Math.max(x1, hit.x); z0 = Math.min(z0, hit.z); z1 = Math.max(z1, hit.z);
    px0 = Math.min(px0, x); px1 = Math.max(px1, x);
  }
  const zm = zs / n, r = shot.exam.mesh.scale.x * BLOB_R.start, bw = 2.28 * r;
  // the ceiling's visible width at depth zm: where the camera's left and right frame edges meet the ceiling there
  const edge = (sx) => { v.set(sx, 0); ray.setFromCamera(v, camera); const d = ray.ray.direction, o = ray.ray.origin; const k = (zm - o.z) / d.z; return o.x + d.x * k; };
  const vis = edge(1) - edge(-1);
  camera.fov = fov0; camera.updateProjectionMatrix();
  return { t, fov: fov ?? fov0, pixels: n * 4, x: [x0, x1].map((q) => +q.toFixed(4)), z: [z0, z1].map((q) => +q.toFixed(4)), zMean: +zm.toFixed(4), screenPx: [px0, px1],
    shadowWidthX: +(x1 - x0).toFixed(4), shadowDepthZ: +(z1 - z0).toFixed(4), blobR: r, blobWidth: +bw.toFixed(4),
    ratioX: +((x1 - x0) / bw).toFixed(2), ratioZ: +((z1 - z0) / bw).toFixed(2), visibleCeilingWidth: +vis.toFixed(4), spanOfVisible: +((x1 - x0) / vis).toFixed(2) };
};
