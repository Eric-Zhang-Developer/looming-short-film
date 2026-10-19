// Builds each shot as film.js does (trims-home/blobs.js's harness) and reads the live key light and Exam at a time:
// units = S · r / 0.012 (README §1, S = z_L / (z_L − z_B), depth only), and a projection from the key's world position:
// the blob is a flat card, so its body circle (radius r, centred r above the contact, in the mesh's own frame and world
// matrix) is projected onto the wall (z 0); width = its x extent in units of the 1× blob's diameter (0.024), centre = its
// middle on the wall. window.measure(id, [[label, t]]).
import * as THREE from 'three';
import { createStage } from '/src/core/stage.js';
import { createPost } from '/src/post.js';
import { PALETTE } from '/src/core/palette.js';
import * as assets from '/src/assets.js';

const stage = createStage();
window.renderFrame = () => {};
window.measure = async (id, rows) => {
  const { scene, camera, renderer } = stage, s = { scene, camera: camera.clone(), fns: [] };
  scene.clear();
  const sstage = { renderer, scene, camera: s.camera, onFrame: (fn) => s.fns.push(fn), setRender: () => {} };
  const post = (o) => createPost(sstage, o);
  const m = await import(`/src/shots/${id}.js`);
  const shot = await m.build({ stage: sstage, scene, camera: s.camera, renderer, assets, PALETTE, post });
  const exam = shot.exam ?? shot.parts?.exam, spot = shot.spot ?? shot.parts?.spot;
  const v = new THREE.Vector3(), Lw = new THREE.Vector3(), q = new THREE.Vector3(), out = [];
  for (const [label, t] of rows) {
    shot.update(t);
    scene.updateMatrixWorld(true);
    const mesh = exam.mesh, r = mesh.geometry.parameters.width / 5 * mesh.scale.x;
    mesh.getWorldPosition(v);
    spot.getWorldPosition(Lw);
    const S = Lw.z / (Lw.z - v.z);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const R0 = mesh.geometry.parameters.width / 5;
    for (let i = 0; i < 128; i++) {
      const th = 2 * Math.PI * i / 128;
      mesh.localToWorld(q.set(R0 * Math.cos(th), R0 + R0 * Math.sin(th), 0));
      const k = Lw.z / (Lw.z - q.z), px = Lw.x + (q.x - Lw.x) * k, py = Lw.y + (q.y - Lw.y) * k;
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    }
    out.push(`${id} ${label.padEnd(18)} r ${r.toFixed(4)}  L (${Lw.x.toFixed(4)}, ${Lw.y.toFixed(4)}, ${Lw.z.toFixed(4)})  zB ${v.z.toFixed(4)}`
      + `  S ${S.toFixed(3)}  units ${(S * r / 0.012).toFixed(3)}  projected width ${((x1 - x0) / 0.024).toFixed(3)} u  centre (${((x0 + x1) / 2).toFixed(4)}, ${((y0 + y1) / 2).toFixed(4)})`);
  }
  return out;
};
