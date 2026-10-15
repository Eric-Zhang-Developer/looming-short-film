// s14 stub, copied from _template.js (docs/contracts.md §shots). The s14 shot builder replaces this whole file.
// Shows: navy wall, kraft desk strip, one proxy, the shot number as cream dots and tLocal as a cream bar. No text.
import * as THREE from 'three';
import { SHOTS } from '../timeline.js';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { ambient } from '../lights.js';

const ID = 's14', ASSET = 'custodian_sheet', PIECE = 'custodian_body';

export async function build({ scene, camera, assets, PALETTE }) {
  const shot = SHOTS.find((s) => s.id === ID), n = Number(ID.slice(1));
  scene.background = new THREE.Color(PALETTE.navy);
  camera.position.set(0, 0.06, 0.55);
  camera.lookAt(0, 0.035, 0.06);

  const key = new THREE.DirectionalLight(PALETTE.cream, 2.2);
  key.position.set(0.25, 0.45, 0.6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3, near: 0.1, far: 2 });
  key.shadow.bias = -0.0005;
  scene.add(key, ambient());

  const boiling = [];  // { mesh, opts }: re-torn every boil step
  const piece = (opts) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); scene.add(mesh); return mesh;
  };
  const RECT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  piece({ path: RECT, color: PALETTE.navy, size: [0.5, 0.3], key: `${ID}-wall` }).position.set(0, 0.06, 0);
  piece({ path: RECT, color: PALETTE.kraft, weight: 'kraft', size: [0.5, 0.034], key: `${ID}-desk` }).position.set(0, -0.017, 0.12);

  const a = await assets.load(ASSET), [w, h] = a.sizes[PIECE] ?? [0.06, 0.06], fit = Math.min(1, 0.07 / h, 0.16 / w);
  const prop = piece({ art: a.pieces[PIECE], size: [w, h], key: `${ID}-${ASSET}-${PIECE}` });
  prop.scale.setScalar(fit);
  prop.position.set(0.03, (prop.geometry.parameters.height * fit) / 2, 0.08);

  const dot = makePaper({ path: Array.from({ length: 16 }, (_, i) => [0.5 + 0.5 * Math.cos(i * Math.PI / 8), 0.5 + 0.5 * Math.sin(i * Math.PI / 8)]),
    color: PALETTE.cream, size: [0.01, 0.01], key: 'stub-dot' });
  for (let i = 0; i < n; i++) {
    const m = paperMesh(dot);
    m.position.set(-0.13 + (i % 6) * 0.016, 0.105 - Math.floor(i / 6) * 0.015, 0.003);
    scene.add(m);
  }
  const bar = piece({ path: RECT, color: PALETTE.cream, size: [0.16, 0.006], key: `${ID}-bar` });

  return {
    update(tLocal) {
      const seed = boilSeed(tLocal, 10);
      for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed }));
      const k = Math.max(0.01, Math.min(1, tLocal / shot.duration));
      bar.scale.x = k;
      bar.position.set(0.02 + 0.08 * k, 0.105, 0.003);
    },
  };
}
