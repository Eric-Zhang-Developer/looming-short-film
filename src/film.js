// @ts-check
// The whole film by time (contract: docs/contracts.md §film, §shots). Each shot gets its own scene and camera on the
// one shared renderer, so nothing a shot does can leak into another, and any t renders the same in any order.
import * as THREE from 'three';
import { SHOTS, shotAt } from './timeline.js';
import { PALETTE } from './core/palette.js';
import { createPost } from './post.js';
import * as assets from './assets.js';

export function createFilm(stage) {
  const { renderer } = stage;
  const live = new Map();  // shot id → Promise of { shot, scene, camera, fns, draw, composer }

  function build(id) {
    const scene = new THREE.Scene(), camera = stage.camera.clone(), fns = [];
    const s = { scene, camera, fns, draw: () => renderer.render(scene, camera), composer: null };
    const sstage = { renderer, scene, camera, onFrame: (fn) => fns.push(fn), setRender: (fn) => { s.draw = fn; } };
    const post = (opts) => { const p = createPost(sstage, opts); s.composer = p.composer; return p; };
    return import(`./shots/${id}.js`)
      .then((m) => m.build({ stage: sstage, scene, camera, renderer, assets, PALETTE, post }))
      .then((shot) => Object.assign(s, { shot }));
  }

  async function dispose(id) {
    const s = await live.get(id);
    live.delete(id);
    s.shot.dispose?.();
    s.composer?.dispose();
    // Paper textures stay: they belong to paper.js's cache and other shots may reuse them.
    s.scene.traverse((o) => {
      o.geometry?.dispose();
      for (const m of [o.material, o.customDepthMaterial, o.customDistanceMaterial].flat()) m?.dispose();
    });
    s.scene.clear();
  }

  async function renderFrame(t) {
    const { shot, tLocal } = shotAt(t);
    const i = SHOTS.indexOf(shot), keep = [shot.id, SHOTS[i + 1]?.id];
    for (const id of [...live.keys()]) if (!keep.includes(id)) await dispose(id);
    if (!live.has(shot.id)) live.set(shot.id, build(shot.id));
    const s = await live.get(shot.id);
    s.shot.update(tLocal);
    for (const fn of s.fns) fn(t);
    s.draw();
  }

  return { renderFrame, ready: Promise.resolve() };
}
