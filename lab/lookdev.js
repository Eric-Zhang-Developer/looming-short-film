// Lookdev composite: the v2_4 style-tile pieces as torn paper in the full rig (paper, material, lights, blob, post).
// An apartment corner in three depth layers: navy wall + calendar (z 0), desktop with lamp, laptop, gator and the
// blob (z 0.05–0.2), painted desk front (z 0.32). 0–5 s phone light (blob shadow ~3x on the wall); 5 s the lamp
// clicks on and the phone goes dark; 6–10 s hold, the blob blinks, dust drifts. Post: DOF on the blob, night LUT, grain.
// Art: assets/cut/style_tile_v2_4_{1..6}.png (unfrozen, gitignored), made with
//   node tools/cut.mjs --in=<main checkout>/assets/raw/style_tile_v2_4.png --auto --out=assets/cut/
import * as THREE from 'three';
import { createStage, exposeForRender } from '../src/core/stage.js';
import { PALETTE } from '../src/core/palette.js';
import { makePaper, boilSeed } from '../src/paper.js';
import { paperMesh, updatePaperMesh } from '../src/material.js';
import { phoneLight, lampLight, ambient, placeForScale, aim } from '../src/lights.js';
import { createBlob } from '../src/blob.js';
import { createPost } from '../src/post.js';

const CLICK = 5;
const stage = createStage();
const { scene, camera } = stage;
scene.background = new THREE.Color(PALETTE.navy).multiplyScalar(0.5);
scene.add(ambient());
camera.position.set(0.02, 0.2, 1.2);
camera.lookAt(0, 0.1, 0.15);

const BLOB = new THREE.Vector3(0, 0, 0.2);
const blob = createBlob({ radius: 0.025, seed: 1 });
blob.mesh.position.copy(BLOB);
blob.stain.position.set(BLOB.x, 0.0003, BLOB.z);
scene.add(blob.mesh, blob.stain);

const pieces = [];  // { mesh, opts }: every sheet re-boils through updatePaperMesh
function piece(opts, matOpts) {
  const mesh = paperMesh(makePaper({ ...opts, seed: 0 }), matOpts);
  pieces.push({ mesh, opts }); scene.add(mesh); return mesh;
}
// Stand a piece on the desk (y = 0) with its bottom edge at `y0`, centered at x, z; a small tilt so nothing is flat.
function stand(mesh, x, z, { y0 = 0, ry = 0, rz = 0 } = {}) {
  mesh.position.set(x, y0 + mesh.geometry.parameters.height / 2, z);
  mesh.rotation.set(0, ry, rz);
  return mesh;
}
const load = async (n) => { const img = new Image(); img.src = `/assets/cut/style_tile_v2_4_${n}.png`; await img.decode(); return img; };

// The lamp art splits in two: the cream shade becomes tissue (so it glows), the navy arm and base stay cardstock.
// Shade = bright pixels right of the neck and above the arm's bend (piece px, 266x392); everything else is the arm.
const SHADE_X = 96, SHADE_Y = 258;
async function splitLamp(img) {
  const W = img.width, H = img.height;
  const draw = () => { const c = Object.assign(document.createElement('canvas'), { width: W, height: H }); const g = c.getContext('2d'); g.drawImage(img, 0, 0); return [c, g]; };
  const [shadeC, sg] = draw(), [armC, ag] = draw();
  const sd = sg.getImageData(0, 0, W, H), ad = ag.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 4, inShade = sd.data[o] > 110 && x >= SHADE_X && y <= SHADE_Y;
    (inShade ? ad : sd).data[o + 3] = 0;
  }
  sg.putImageData(sd, 0, 0); ag.putImageData(ad, 0, 0);
  return { shade: await createImageBitmap(shadeC), arm: await createImageBitmap(armC), W, H };
}

// ---------- lights ----------
const BLOB_C = BLOB.clone().setY(0.022);  // the blob's middle, the point the rule is measured from
const phone = phoneLight({ intensity: 0.3, distance: 0 });
phone.position.copy(placeForScale({ subjectPos: BLOB_C, wallZ: 0, scale: 3, height: -0.014, side: -0.035 }));
scene.add(phone, phone.target);

const lamp = lampLight({ intensity: 0.35, angle: 0.35, penumbra: 0.4 });
scene.add(lamp.light, lamp.light.target, lamp.cone, lamp.dust);
const bulb = new THREE.PointLight(PALETTE.lamp, 0.04, 0.1, 2);  // inside the shade: back-lights the tissue only
scene.add(bulb);
const bounce = new THREE.HemisphereLight(PALETTE.lamp, PALETTE.kraft, 0.35);  // the lamp's pool bouncing off the desk: fill only, no shadow
scene.add(bounce);

const post = createPost(stage, { aperture: 0.09, maxblur: 0.01, lut: 'night', grain: 0.04 });

stage.ready = (async () => {
  const [wallA, deskA, calA, lampA, laptopA, gatorA] = await Promise.all([1, 2, 3, 4, 5, 6].map(load));
  const bmp = (img) => createImageBitmap(img);

  // Layer 1: the wall, with the calendar pinned to it.
  const wall = piece({ art: await bmp(wallA), weight: 'cardstock', size: [0.86, 1.35], key: 'ld-wall' });
  wall.position.set(0, 0.2, 0); wall.rotation.z = 0.004;
  stand(piece({ art: await bmp(calA), weight: 'cardstock', size: [0.12, 0.12], key: 'ld-cal' }), 0.17, 0.006, { y0: 0.16, rz: -0.03 });

  // Layer 2: the desktop (plain kraft sheet) and what stands on it.
  const top = piece({ path: [[0, 0], [1, 0], [1, 1], [0, 1]], color: PALETTE.kraft, weight: 'kraft', size: [0.66, 0.34], key: 'ld-desktop' });
  top.rotation.x = -Math.PI / 2; top.position.set(0, -0.001, 0.16);
  stand(piece({ art: await bmp(laptopA), weight: 'cardstock', size: [0.12, 0.12], key: 'ld-laptop' }), 0.2, 0.04, { ry: -0.08, rz: 0.12 });
  const gator = stand(piece({ art: await bmp(gatorA), weight: 'cardstock', size: [0.066, 0.08], key: 'ld-gator' }), 0.085, 0.09, { ry: 0.05 });
  gator.scale.x = -1;  // face the blob
  const L = await splitLamp(lampA), LH = 0.24, LW = LH * L.W / L.H, LX = -0.1, LZ = 0.16;
  stand(piece({ art: L.arm, weight: 'cardstock', size: [LW, LH], key: 'ld-lamp-arm' }), LX, LZ, { ry: 0.04 });
  const shade = stand(piece({ art: L.shade, weight: 'tissue', size: [LW, LH], key: 'ld-lamp-shade' }), LX, LZ + 0.003, { ry: 0.04 });
  shade.castShadow = false;  // the bulb sits behind it; the shade must not black out the lamp's own pool

  // Layer 3: the painted desk front; its top board is the desktop's front edge.
  const front = piece({ art: await bmp(deskA), weight: 'kraft', size: [0.72, 0.72], key: 'ld-desk' });
  stand(front, 0, 0.33, { y0: 0.004 - front.geometry.parameters.height });

  // The lamp's opening (shade px ~ (200, 175)) is the spot's apex; the bulb sits just behind the shade plane.
  const px = (u, v) => new THREE.Vector3(LX - LW / 2 + LW * u / L.W, LH * (1 - v / L.H), LZ);
  lamp.light.position.copy(px(200, 175)).setZ(LZ + 0.012);
  bulb.position.copy(px(185, 120)).setZ(LZ - 0.006);
  aim(lamp.light, blob.mesh);
  aim(phone, blob.mesh);
  window.lab = { THREE, stage, scene, camera, phone, lamp, bulb, blob, pieces, BLOB_C };  // for evidence/lookdev-composite/measure.mjs
})();

stage.onFrame((t) => {
  const seed = boilSeed(t, 4);  // a held shot boils at 4 Hz (doc 03)
  for (const p of pieces) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed }));
  const on = t >= CLICK;
  phone.visible = !on;
  lamp.light.visible = bulb.visible = bounce.visible = on;
  lamp.update(t);
  const blink = (t >= 2.5 && t < 2.67) || (t >= 7.4 && t < 7.57) || (t >= 9.0 && t < 9.17);
  blob.update(t, { wobble: on ? 1 : 1.5, eyes: blink ? 'closed' : on ? 'open' : 'worried' });
  post.set({ focus: camera.getWorldDirection(new THREE.Vector3()).dot(BLOB_C.clone().sub(camera.position)) });
});

exposeForRender(stage, { duration: 10 });
