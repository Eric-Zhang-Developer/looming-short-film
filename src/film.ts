// The whole film by time (contract: docs/contracts.md §film, §shots). Each shot gets its own scene and camera on the
// one shared renderer, so nothing a shot does can leak into another, and any t renders the same in any order.
import * as THREE from 'three';
import { SHOTS, shotAt } from './timeline.ts';
import { PALETTE } from './core/palette.ts';
import { createPost } from './post.ts';
import type { Post } from './post.ts';
import type { Stage } from './core/stage.ts';
import * as assets from './assets.ts';

// What a shot module's build() returns (docs/contracts.md §shots). The modules are imported by a template, so untyped.
type ShotInstance = { update(tLocal: number): void, dispose?(): void };

export function createFilm(stage: Pick<Stage, 'renderer' | 'camera'>) {
  const { renderer } = stage;
  const live = new Map<string, ReturnType<typeof build>>();  // shot id → Promise of { shot, scene, camera, fns, draw, composer }

  function build(id: string) {
    const scene = new THREE.Scene(), camera = stage.camera.clone(), fns: ((t: number) => void)[] = [];
    const s = { scene, camera, fns, draw: () => renderer.render(scene, camera), composer: null as Post['composer'] | null };
    const sstage = { renderer, scene, camera, onFrame: (fn: (t: number) => void) => fns.push(fn), setRender: (fn: () => void) => { s.draw = fn; } };
    const post = (opts?: Parameters<typeof createPost>[1]) => { const p = createPost(sstage, opts); s.composer = p.composer; return p; };
    return import(`./shots/${id}.js`)
      .then((m) => m.build({ stage: sstage, scene, camera, renderer, assets, PALETTE, post }))
      .then((shot: ShotInstance) => Object.assign(s, { shot }));
  }

  async function dispose(id: string) {
    const s = await live.get(id)!;
    live.delete(id);
    s.shot.dispose?.();
    s.composer?.dispose();
    // Paper textures stay: they belong to paper.js's cache and other shots may reuse them.
    s.scene.traverse((o) => {
      (o as Partial<THREE.Mesh>).geometry?.dispose();   // any Object3D: a Group has neither geometry nor material
      for (const m of [(o as Partial<THREE.Mesh>).material, o.customDepthMaterial, o.customDistanceMaterial].flat()) m?.dispose();
    });
    s.scene.clear();
  }

  async function renderFrame(t: number) {
    const { shot, tLocal } = shotAt(t);
    const i = SHOTS.indexOf(shot), keep = [shot.id, SHOTS[i + 1]?.id];
    for (const id of [...live.keys()]) if (!keep.includes(id)) await dispose(id);
    if (!live.has(shot.id)) live.set(shot.id, build(shot.id));
    const s = await live.get(shot.id)!;
    s.shot.update(tLocal);
    for (const fn of s.fns) fn(t);
    s.draw();
  }

  return { renderFrame, ready: Promise.resolve() };
}
