// v7-laptop: where his hand (the rig's hand joint) and the keys target (3 mm over the deck, s03/s06's `keys`) land in the 1920×1080 frame.
import * as THREE from 'three';
import { createStage } from '/src/core/stage.js';
import { createPost } from '/src/post.js';
import { PALETTE } from '/src/core/palette.js';
import * as assets from '/src/assets.js';
const stage = createStage();
window.renderFrame = () => {};
window.measure = async (id, ts, yawDeg) => {
  const { scene, camera, renderer } = stage, s = { camera: camera.clone() };
  scene.clear();
  const sstage = { renderer, scene, camera: s.camera, onFrame: () => {}, setRender: () => {} };
  const m = await import(`/src/shots/${id}.js`);
  const shot = await m.build({ stage: sstage, scene, camera: s.camera, renderer, assets, PALETTE, post: (o) => createPost(sstage, o) });
  const laptop = scene.children.find((o) => o.type === 'Group' && Math.abs(o.rotation.y - yawDeg * Math.PI / 180) < 1e-6);
  const px = (v) => { const p = v.clone().project(s.camera); return `(${((p.x + 1) * 960).toFixed(0)}, ${((1 - p.y) * 540).toFixed(0)})`; };
  const out = [];
  for (const t of ts) {
    shot.update(t); scene.updateMatrixWorld(true); s.camera.updateMatrixWorld(true);
    const hand = shot.gator.hand.getWorldPosition(new THREE.Vector3());
    const keys = laptop.localToWorld(new THREE.Vector3(0, 0.0038, 0.0036));
    out.push(`${id} t ${t}: hand ${px(hand)} world (${hand.toArray().map((x) => x.toFixed(4))})  keys ${px(keys)} world (${keys.toArray().map((x) => x.toFixed(4))})`);
  }
  return out;
};
