// s13 · Everyone has one (docs/shots/s13.md, v4). One locked top-down shot of the Marston reading room, 5 s. G4's room
// read "everyone is stuck"; v4 reads it the other way: every occupied desk is lit from above by its own pendant, every
// blob is small and its shadow a pool under it, and everyone is working. He lifts his head (headLift 0.5), glances at the
// Sleeper, then at Drinks (revealDrinks 1.5) and over his shoulder at the Freshman (revealFreshman 2.75), and goes back
// to his page. His blob is the biggest in the room (2.5×, Q16), but its shadow is a pool like everyone's.
// The carpet is marston_kit's, the pages, pens and backpack props_kit's (seen from above); desk tops, figures, textbooks
// and cans are top_props_sheet / top_figures_sheet proxies (no top-view art is frozen). The pendants aren't drawn (they'd
// hang between camera and desks, README §8); their light is: a warm pool decal per occupied desk. Shadows are decals cut
// from each blob's own silhouette (doc 04 Crowds: decals, not lights). No phones lit, no laptops, no desk lamps.
// This shot only: the floor is z = 0 and z is height above it; +Y is north (up the frame).
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { ambient } from '../lights.js';
import { createBlob } from '../blob.js';
import { kf, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';
import { SHOTS } from '../timeline.js';
import { carpetCanvas } from './s11.js';

const ID = 's13', DEG = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID).beats;          // headLift 0.5, revealDrinks 1.5, revealFreshman 2.75
const XS = [-0.32, -0.16, 0, 0.16, 0.32], YS = [0.13, 0, -0.13];   // desk centers; d1 is top-left, row-major

// Crowd desks from the spec's desk table: pose piece, mirrored, faces (+1 N, −1 S), figure scale, blob r, props, and
// the working read: 'pen' wiggles a pen under the writing hand on 2s, a number is a page turn at that time. G4's radii
// and placements; the sheet has 6 poses for 10 figures, so 4 reuse a pose mirrored.
export const CROWD = {
  d1:  { who: 'G1', pose: 'seated_3', mir: 0, f: 1, sc: 0.95, r: 0.010, props: ['page', 'pen'], work: 'pen' },
  d2:  { who: 'sleeper', pose: 'seated_1', mir: 0, f: 1, sc: 1.05, r: 0.012, props: ['textbook'] },   // reads: head down over the book
  d4:  { who: 'drinks', pose: 'seated_2', mir: 0, f: -1, sc: 1.00, r: 0.013, props: ['page', 'pen', 'can', 'can', 'can'], work: 'pen' },
  d5:  { who: 'G2', pose: 'seated_4', mir: 0, f: 1, sc: 1.10, r: 0.009, props: ['page', 'pen'], work: 'pen' },
  d7:  { who: 'G3', pose: 'seated_5', mir: 0, f: -1, sc: 0.90, r: 0.011, props: ['page', 'textbook'], work: 2.0 },
  d9:  { who: 'G4', pose: 'seated_1', mir: 1, f: 1, sc: 1.15, r: 0.012, props: ['page', 'pen'], work: 'pen' },
  d11: { who: 'G5', pose: 'seated_2', mir: 1, f: 1, sc: 1.00, r: 0.010, props: ['page'], work: 3.5 },
  d12: { who: 'G6', pose: 'seated_4', mir: 1, f: -1, sc: 0.95, r: 0.014, props: ['page', 'pen', 'textbook'], work: 'pen' },
  d14: { who: 'G7', pose: 'seated_5', mir: 1, f: -1, sc: 1.05, r: 0.011, props: ['page', 'pen'], work: 'pen' },
  d15: { who: 'freshman', pose: 'seated_6', mir: 0, f: 1, sc: 0.80, r: 0.010, props: ['page', 'pen', 'backpack'], work: 'scribble' },
};
// Where props sit, in the occupant's frame (x to their right, y away from them), and their turn (deg).
const PROP_AT = { page: [0.026, 0.010, 8], pen: [0.016, -0.004, -30], textbook: [-0.024, -0.008, -6], backpack: [0, -0.088, 12] };
const BLOB_AT = [0, 0.005], SEAT_AT = [0, -0.050];
const HERO = { r: 0.030, at: [0.030, -0.028] };      // 2.5× (README §1, Q16), on the desk's right beside his page (s11's side);
                                                       // its contact point is its south edge, so it sits low enough to stay on the desk
// Pool scale: the pendant 0.127 above the desk, the blob's height ≈ its radius above it (README §3: 0.127 / (0.127 − r)).
// The crowd's G4 table says 1.1× for all of them; written out per blob it's 1.08–1.12×, so the formula is used for both.
const POOL = (r) => 0.127 / (0.127 - r);
const SOUTH = 0.002, SOFT = 0.004;                     // decals 2 mm south of the blob (the pendants hang north); soft edge
const EYE_PAIR = { w: 0.0125, h: 0.0062, gap: 0.55 }; // top-view eyes (m): both eyes in one sheet, centres gap × w apart
const FROZEN_PROPS = new Set(['page', 'pen', 'backpack']);   // drawn from props_kit; the rest stay top_props_sheet proxies

// Hero head (relative to his body, deg, + = clockwise from camera) and body turn, keyed on his action table.
const HEAD_ROT = [[0.75, 0], [0.917, -42], [1.25, -42], [B.revealDrinks, 0], [1.667, 42], [B.revealFreshman, 42], [3.0, 65],
  [3.75, 65], [4.0, 0]];
const BODY_ROT = [[B.revealFreshman, 0], [3.0, 40], [3.75, 40], [4.0, 0]];
const HEAD_Z = [[0.3, 0.036], [B.headLift, 0.034], [0.667, 0.075], [4.0, 0.075], [4.5, 0.040]];   // the 0.3–0.5 sink, the lift, down to work
const HEAD_Y = [[B.headLift, 0.030], [0.667, 0.012], [4.0, 0.012], [4.5, 0.028]];
const eyesAt = (t) => (t >= B.revealDrinks && t < 2.0 ? 'gasp' : 'open');   // the small surprise at Drinks
const ARMS_Y = [[4.25 - 1 / 12, 0.024], [4.25, 0.030]];   // 4.25: his pen hand comes forward onto the page
const blobLook = (t) => (t < 0.75 || t >= 4.0 ? null : t < B.revealDrinks ? -1 : 1);   // his blob looks where he looks

const POOL_I = 0.55;                                  // light-pool decal opacity (additive)
const ROOM_I = 0.55, AMB_K = 0.6;                     // the dim warm light from straight above (no shadows), ambient ×0.6
const HOODIE_K = 0.8;                                 // v3: the hero's hoodie (green[0]), as a multiplier
const BREATH = 0.012;                                 // v3 seated breath, as a scale
const tone = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);

export async function build({ scene, camera, assets, PALETTE, post }) {
  scene.background = tone(PALETTE.navy, PALETTE.ink, 0.5);
  camera.up.set(0, 1, 0);
  camera.position.set(0, 0, 1.60);
  camera.lookAt(0, 0, 0);
  post({ focus: 1.56, aperture: 0.008, maxblur: 0.004, lut: 'amber' });   // the lit Marston grade s11 and s15 use

  const WARM = tone(PALETTE.lamp, PALETTE.cream, 0.3);   // v4 Marston warm (README v4)
  const amb = ambient();
  amb.intensity *= AMB_K;
  amb.position.set(0, 0, 1);  // sky is above in this shot
  scene.add(amb);
  const ROOM = new THREE.DirectionalLight(WARM, ROOM_I);   // the pendants' general light on the room's paper; casts nothing
  ROOM.position.set(0, 0, 2);
  scene.add(ROOM, ROOM.target);

  const [figs, props, face, kitp, mkit] = await Promise.all(['top_figures_sheet', 'top_props_sheet', 'face_sheet', 'props_kit', 'marston_kit'].map((n) => assets.load(n)));
  const KP = { page: 'blank_page', pen: 'pen', backpack: 'backpack' };
  const prop = (p, key) => (FROZEN_PROPS.has(p) ? art(kitp, KP[p], key) : art(props, p, key));
  const boiling = [];
  const piece = (opts, parent = scene) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  const art = (sheet, name, key, extra = {}) => ({ art: sheet.pieces[name], size: sheet.sizes[name], key, res: 128, ...extra });
  const place = (m, x, y, z, rot = 0) => { m.position.set(x, y, z); m.rotation.z = rot; return m; };

  // ---------- floor: marston_kit's carpet, laid tile by tile, seen from above; darkened so the lit desks are islands ----------
  const rng = mulberry32(seedOf(ID, 'set'));
  // On a backing of the tile's own colour: the tiles' rounded corners leave pinholes that read as rows of dots from above.
  const floorArt = (() => {
    const tiles = carpetCanvas(mkit, [1.2, 0.7]), c = Object.assign(document.createElement('canvas'), { width: tiles.width, height: tiles.height });
    const g = c.getContext('2d'), t = mkit.pieces.carpet_tile;
    g.drawImage(t, t.width / 2 - 8, t.height / 2 - 8, 16, 16, 0, 0, c.width, c.height);   // the tile's middle, stretched: its colour
    g.drawImage(tiles, 0, 0);
    g.fillStyle = 'rgba(20, 24, 40, 0.35)'; g.fillRect(0, 0, c.width, c.height);         // a little darker between the desks
    return c;
  })();
  piece({ art: floorArt, size: [1.2, 0.7], key: `${ID}-marston_floor`, res: 1024 });

  // ---------- 15 desk tops, each torn from its own seed, each turned a little ----------
  for (let i = 0; i < 15; i++) {
    place(piece(art(props, 'desk_top', `${ID}-desk-${i + 1}`, { weight: 'kraft', res: 256 })),
      XS[i % 5], YS[Math.floor(i / 5)], 0.032, (rng() * 6 - 3) * DEG);
  }

  // ---------- shared desk rig: the pendant's pool of light, a blob, its shadow decal ----------
  const glowTex = (() => {
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 }), g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.5, 'rgba(255,255,255,0.55)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const rigs = [];
  function deskRig({ key, who, cx, cy, f, r, bx = cx + f * BLOB_AT[0], by = cy + f * BLOB_AT[1] }) {
    // The pool: falls to 0 at r 0.05 round the desk centre, additive, on the desk top under every prop.
    const pool = place(new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.10), new THREE.MeshBasicMaterial({ color: WARM, map: glowTex,
      transparent: true, opacity: POOL_I, blending: THREE.AdditiveBlending, depthWrite: false })), cx, cy, 0.0322);
    const blob = createBlob({ radius: r, seed: seedOf(ID, key) });
    place(blob.mesh, bx, by, 0.036);
    // The shadow: the blob's own silhouette at its pool scale, centred under it, 2 mm south. There from frame 0. The mesh's
    // origin is its contact point (its south edge here), about r below its centre, so the scaled decal is moved back by
    // r (S − 1) to share the blob's centre.
    const S = POOL(r), decal = place(new THREE.Mesh(blob.mesh.geometry, blob.silhouette()), bx, by - r * (S - 1) - SOUTH, 0.0325);
    decal.scale.set(S, S, 1);
    decal.material.opacity = 0.85;
    decal.material.userData.soft.value = (SOFT / 2) / (S * r);   // half the soft edge, in blob-radius units
    scene.add(pool, blob.mesh, decal);
    rigs.push({ key, who, blob, decal, r, S });
  }

  // ---------- the crowd ----------
  const figRng = mulberry32(seedOf(ID, 'crowd'));
  let n = 0;
  const breathers = [], workers = [];
  const cast = [];   // (who, pose, mirror, turn, scale): read by evidence/anim-s13/measure.html
  for (const [key, d] of Object.entries(CROWD)) {
    const i = Number(key.slice(1)) - 1, cx = XS[i % 5], cy = YS[Math.floor(i / 5)], f = d.f;
    const at = ([x, y]) => [cx + f * x, cy + f * y], facing = f < 0 ? Math.PI : 0;
    const [sx, sy] = at(SEAT_AT), rot = facing + (figRng() * 16 - 8) * DEG;
    const fig = place(piece(art(figs, d.pose, `${ID}-${key}-${d.pose}`)), sx, sy, 0.048 + 0.002 * n++, rot);
    fig.scale.set(d.mir ? -d.sc : d.sc, d.sc, 1);
    breathers.push({ m: fig, sx: d.mir ? -d.sc : d.sc, sy: d.sc, ph: figRng(), slow: d.who === 'sleeper' });   // v3: a breath each, none in step
    const placed = {};
    d.props.forEach((p, j) => {
      if (p === 'can') { const [x, y] = at([0.006 + 0.0085 * (j - 2), 0.016]); return place(piece(art(props, 'can', `${ID}-${key}-can${j}`)), x, y, 0.033); }
      const [ox, oy, deg] = PROP_AT[p], [x, y] = at([ox, oy]);
      placed[p] = place(piece(prop(p, `${ID}-${key}-${p}`)), x, y, p === 'backpack' ? 0.045 : p === 'pen' ? 0.0335 : 0.033, facing + deg * DEG);
    });
    if (d.work !== undefined) workers.push({ d, f, ph: figRng(), ...placed, base: placed.pen?.position.clone() });
    cast.push({ who: d.who, pose: d.pose, mirror: !!d.mir, turnDeg: +(rot / DEG).toFixed(1), scale: d.sc });
    deskRig({ key, who: d.who, cx, cy, f, r: d.r });
  }

  // ---------- the hero (d8, centre), from hero_top parts ----------
  const hero = place(new THREE.Group(), SEAT_AT[0], SEAT_AT[1], 0);
  scene.add(hero);
  const arms = place(piece(art(figs, 'hero_arms', `${ID}-hero-arms`), hero), 0, 0.024, 0.034);
  const green = [
    place(piece(art(figs, 'hero_body', `${ID}-hero-body`), hero), 0, 0, 0.055),
    arms,
    place(piece(art(figs, 'hero_tail', `${ID}-hero-tail`), hero), 0.004, -0.038, 0.030, 8 * DEG),
  ];
  const neck = new THREE.Group(); hero.add(neck);   // the neck pivot; the head sits just in front of it
  green.push(place(piece(art(figs, 'hero_head', `${ID}-hero-head`), neck), 0, 0.006, 0));
  // A top-view eye pair per take: face_sheet's eye drawn twice side by side (the right one mirrored), so from above he
  // has two eyes on the top of his head, not one disc (done/cut-gator.md).
  const pair = (img) => {
    const c = Object.assign(document.createElement('canvas'), { width: 256, height: 128 }), g = c.getContext('2d');
    const s = Math.min(128 / img.height, 256 * (1 - EYE_PAIR.gap) / img.width) * 0.95, w = img.width * s, h = img.height * s;
    for (const k of [-1, 1]) { g.save(); g.translate(128 + k * 128 * EYE_PAIR.gap, 64); if (k > 0) g.scale(-1, 1); g.drawImage(img, -w / 2, -h / 2, w, h); g.restore(); }
    return c;
  };
  const eyes = Object.fromEntries(['open', 'gasp'].map((e) =>
    [e, place(piece({ art: pair(face.pieces[`eyes_${e}`]), size: [EYE_PAIR.w, EYE_PAIR.h], key: `${ID}-hero-eyes-${e}`, res: 256 }, neck), 0, 0.011, 0.001)]));   // forward on the head, so they show where he looks
  place(piece(art(figs, 'hero_backpack', `${ID}-hero-backpack`)), -0.042, -0.072, 0.010, -15 * DEG);
  // his page and pen as s11 left them (the phone lies face-down under the page's edge: not drawn from above)
  place(piece(prop('page', `${ID}-hero-page`)), -0.012, 0.004, 0.033, 4 * DEG);
  place(piece(prop('pen', `${ID}-hero-pen`)), -0.020, -0.012, 0.0335, -30 * DEG);
  deskRig({ key: 'd8', who: 'hero', cx: 0, cy: 0, f: 1, r: HERO.r, bx: HERO.at[0], by: HERO.at[1] });
  const heroRig = rigs.at(-1);

  return {
    rigs, cast,   // read by evidence/anim-s13/measure.html
    parts: { exam: heroRig.blob, camera },
    update(tLocal) {
      const seed = boilSeed(tLocal, 10);
      for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed }));

      // Hero: characters step on 2s; faces swap on the frame.
      const tc = onTwos(tLocal);
      hero.rotation.z = -kf(tc, BODY_ROT) * DEG;
      neck.position.set(0, kf(tc, HEAD_Y), kf(tc, HEAD_Z));
      neck.rotation.z = -kf(tc, HEAD_ROT) * DEG;
      const e = eyesAt(tLocal);
      for (const [k, m] of Object.entries(eyes)) m.visible = k === e;
      arms.position.y = kf(tc, ARMS_Y, (u) => (u >= 1 ? 1 : 0));
      for (const b of breathers) {   // v3 secondary motion: a seated breath on 2s, the Sleeper's slower and deeper
        const k = 1 + (b.slow ? BREATH * 1.6 : BREATH) * Math.sin(2 * Math.PI * (tc / (b.slow ? 4.2 : 3.2) + b.ph));
        b.m.scale.set(b.sx * k, b.sy * k, 1);
      }
      hero.scale.setScalar(1 + BREATH * Math.sin(2 * Math.PI * tc / 3.6));
      green.forEach((m, i) => m.material.color.setScalar(i === 0 ? HOODIE_K : 1));   // v3: the cream hoodie clipped to white

      // The crowd working, on 2s: pens wiggle ±1 mm, the Freshman's pen moves along the page 2.75–3.5, two page turns.
      const dn = Math.round(tc * 12);   // drawing number (12 per second)
      for (const w of workers) {
        if (w.pen && w.base) {
          const k = Math.floor(dn / 2 + 7 * w.ph) % 2 ? 1 : -1;
          let dx = 0.001 * k, dy = 0;
          if (w.d.work === 'scribble') {
            const u = Math.min(1, Math.max(0, (tc - B.revealFreshman) / 0.75));
            dx = 0.006 * u + 0.001 * k; dy = u > 0 && u < 1 ? 0.0015 * k : 0;
          }
          w.pen.position.set(w.base.x + w.f * dx, w.base.y + w.f * dy, w.base.z);
        }
        if (typeof w.d.work === 'number' && w.page) {   // one 2-drawing flip: the page folded over on its spine
          const turning = tc >= w.d.work - 1e-6 && tc < w.d.work + 2 / 12 - 1e-6;
          w.page.scale.x = turning ? (tc < w.d.work + 1 / 12 - 1e-6 ? 0.45 : -0.45) : 1;
        }
      }

      // Blobs: the crowd's look at their own gator's page; his follows his looks and squashes at the Freshman's blob.
      for (const g of rigs) {
        if (g.who !== 'hero') { g.blob.update(tLocal, { wobble: 0.5, eyes: 'open', look: g.who === 'sleeper' ? -1 : 1 }); continue; }
        const l = blobLook(tc), dt = tc - B.revealFreshman, sq = dt >= 0 ? 0.1 * Math.exp(-6 * dt) * Math.cos(18 * dt) : 0;
        g.blob.update(tLocal, { wobble: 1, eyes: l === null ? 'open' : 'side', look: l ?? 1, squash: sq });
      }
    },
  };
}
