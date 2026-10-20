// Builds each home shot as film.js does and reads the live Exam at the beats: r = the blob's created radius × its mesh scale,
// the key light's depth, and the wall-shadow units (README §1: S = z_L / (z_L − z_B), units = S · r / 0.012).
// window.measure(id, [[label, localT], …]) → text lines. Driven by blobs.mjs.
import * as THREE from 'three';
import { createStage } from '/src/core/stage.js';
import { createPost } from '/src/post.js';
import { PALETTE } from '/src/core/palette.js';
import * as assets from '/src/assets.js';

const stage = createStage();
window.renderFrame = () => {};
window.measure = async (id, rows) => {
  const { scene, camera, renderer } = stage, s = { scene, camera: camera.clone(), fns: [] };
  const sstage = { renderer, scene, camera: s.camera, onFrame: (fn) => s.fns.push(fn), setRender: () => {} };
  const post = (o) => createPost(sstage, o);
  const m = await import(`/src/shots/${id}.js`);
  const shot = await m.build({ stage: sstage, scene, camera: s.camera, renderer, assets, PALETTE, post });
  const exam = shot.exam ?? shot.parts?.exam, spot = shot.spot ?? shot.parts?.spot, lamp = shot.lamp;
  const v = new THREE.Vector3(), out = [];
  for (const [label, t] of rows) {
    shot.update(t);
    scene.updateMatrixWorld(true);
    const mesh = exam.mesh, base = mesh.geometry.parameters.width / 5, r = base * mesh.scale.x;
    mesh.getWorldPosition(v);
    let line = `${id}  t ${t.toFixed(3).padStart(6)}  ${label.padEnd(22)} visible ${mesh.visible ? 'y' : 'n'}  r ${r.toFixed(5)} (${(r / 0.012).toFixed(3)}x)`;
    if (spot) {
      const zL = spot.getWorldPosition(new THREE.Vector3()).z, zB = v.z, S = zL / (zL - zB);
      line += `  zL ${zL.toFixed(4)} zB ${zB.toFixed(4)} S ${S.toFixed(2)} units ${(S * r / 0.012).toFixed(2)}`;
    }
    if (lamp && lamp.light.visible) {
      const yL = lamp.light.getWorldPosition(new THREE.Vector3()).y, yc = v.y + r;
      line += `  lamp pool ${(yL / (yL - yc)).toFixed(2)}x (mouth y ${yL.toFixed(4)})`;
    }
    out.push(line);
  }
  return out;
};
