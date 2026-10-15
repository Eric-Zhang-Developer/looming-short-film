// s13 · Everyone has one (docs/shots/s13.md). One locked top-down shot of the Marston reading room.
// This shot only: the floor is z = 0 and z is height above it; +Y is north (up the frame).
// He lifts his head and looks at three desks as their phones light; every occupied desk gets the same rig as his:
// a phone glow decal and an ink shadow decal cut from its blob's own field (doc 04 Crowds: decals, not lights).
// Figures are built straight from top_figures_sheet pieces (the src/characters rigs don't exist yet).
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.js';
import { paperMesh, updatePaperMesh } from '../material.js';
import { ambient } from '../lights.js';
import { createBlob } from '../blob.js';
import { kf, clamp, easeOut, onTwos } from '../core/ease.js';
import { mulberry32, seedOf } from '../core/rng.js';

const ID = 's13', DEG = Math.PI / 180;
const XS = [-0.32, -0.16, 0, 0.16, 0.32], YS = [0.13, 0, -0.13];   // desk centers; d1 is top-left, row-major

// Crowd desks from the spec's desk table: pose piece, mirrored, faces (+1 N, −1 S), figure scale, blob r,
// shadow scale, wake (local s), props. ph −1 puts the phone on the occupant's left (the spec doesn't pick a corner):
// the Drinks shadow then falls toward the hero instead of across the Freshman's, which would fill its eye holes. The sheet has 6 poses for 10 figures, so 4 reuse a pose mirrored (see done note).
export const CROWD = {
  d1:  { who: 'G1', pose: 'seated_3', mir: 0, f: 1, sc: 0.95, r: 0.010, S: 4, wake: 4.4, props: ['page', 'pen'] },
  d2:  { who: 'sleeper', pose: 'seated_1', mir: 0, f: 1, sc: 1.05, r: 0.012, S: 5, wake: 1.4, props: ['textbook'] },
  d4:  { who: 'drinks', pose: 'seated_2', mir: 0, f: -1, ph: -1, sc: 1.00, r: 0.013, S: 7, wake: 2.4, props: ['can', 'can', 'can'] },
  d5:  { who: 'G2', pose: 'seated_4', mir: 0, f: 1, sc: 1.10, r: 0.009, S: 3, wake: 4.6, props: ['laptop'] },
  d7:  { who: 'G3', pose: 'seated_5', mir: 0, f: -1, sc: 0.90, r: 0.011, S: 6, wake: 4.8, props: ['textbook'] },
  d9:  { who: 'G4', pose: 'seated_1', mir: 1, f: 1, sc: 1.15, r: 0.012, S: 5, wake: 5.0, props: ['laptop'] },
  d11: { who: 'G5', pose: 'seated_2', mir: 1, f: 1, sc: 1.00, r: 0.010, S: 4, wake: 5.2, props: ['page'] },
  d12: { who: 'G6', pose: 'seated_4', mir: 1, f: -1, sc: 0.95, r: 0.014, S: 6, wake: 5.4, props: ['textbook'] },
  d14: { who: 'G7', pose: 'seated_5', mir: 1, f: -1, sc: 1.05, r: 0.011, S: 3, wake: 5.6, props: ['page'] },
  d15: { who: 'freshman', pose: 'seated_6', mir: 0, f: 1, sc: 0.80, r: 0.010, S: 9, wake: 3.4, props: ['page', 'pen', 'backpack'] },
};
// Where props sit, in the occupant's frame (x to their right, y away from them), and their turn (deg).
const PROP_AT = { page: [0.026, 0.010, 8], pen: [0.016, -0.004, -30], textbook: [-0.024, -0.008, -6], laptop: [0.028, 0.010, 4],
  backpack: [0, -0.088, 12] };
const PHONE_AT = [0.030, -0.020], BLOB_AT = [0, 0.005], SEAT_AT = [0, -0.050];

// Hero head (relative to his body, deg, + = clockwise from camera) and body turn, keyed on his action table.
const HEAD_ROT = [[0.5, -70], [1.0, 0], [1.6, 0], [1.8, -42], [2.6, -42], [2.8, 42], [3.6, 42], [3.9, 65], [5.0, 65], [5.3, 0]];
const BODY_ROT = [[3.6, 0], [3.9, 40], [5.0, 40], [5.3, 0]];
const HEAD_Z = [[0.3, 0.036], [0.5, 0.034], [1.0, 0.075]];
const HEAD_Y = [[0.5, 0.030], [1.0, 0.012]];
const SAT = [[0.5, 0.55], [2.0, 0.75]];
const eyesAt = (t) => (t < 0.5 ? 'closed' : t < 1.6 ? 'open' : t < 3.6 ? 'gasp' : t < 5.0 ? 'worried' : 'open');

// Phone fills (candela at FILL_Z): the hero's carries s12's dim, the crowd's are nearly as strong so each wake visibly
// opens up its own patch. Each hangs over its own shadow (phone + 0.4 of the shadow's length) and reaches just past
// it, so the far end, where the eye holes are, is lit too: the phone's light read as a low wedge (doc 03 rule 2).
const FILL_HERO = 0.16, FILL_CROWD = 0.14, FILL_Z = 0.2;
// The drop's silhouette is ~0.91 as tall as it is wide (evidence/anim-s13/measure.txt), so this gives length = 1.5 × width.
const LONG = 1.5 / 0.91;
const hex = (c) => '#' + c.getHexString();
const tone = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);

export async function build({ scene, camera, assets, PALETTE, post }) {
  scene.background = tone(PALETTE.navy, PALETTE.ink, 0.5);
  camera.up.set(0, 1, 0);
  camera.position.set(0, 0, 1.60);
  camera.lookAt(0, 0, 0);
  post({ focus: 1.56, aperture: 0.008, maxblur: 0.004, lut: 'marston' });  // spec says LUT act2b: post.js has no such grade

  const amb = ambient();
  amb.intensity *= 0.3;
  amb.position.set(0, 0, 1);  // sky is above in this shot
  scene.add(amb);

  const [figs, props, face] = await Promise.all(['top_figures_sheet', 'top_props_sheet', 'face_sheet'].map((n) => assets.load(n)));
  const boiling = [];
  const piece = (opts, parent = scene) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  const art = (sheet, name, key, extra = {}) => ({ art: sheet.pieces[name], size: sheet.sizes[name], key, res: 128, ...extra });
  const place = (m, x, y, z, rot = 0) => { m.position.set(x, y, z); m.rotation.z = rot; return m; };

  // ---------- floor: marston_floor, procedural tile with a scribbled grid ----------
  const rng = mulberry32(seedOf(ID, 'set'));
  const floorArt = (() => {
    const c = Object.assign(document.createElement('canvas'), { width: 1200, height: 700 }), g = c.getContext('2d');
    g.fillStyle = hex(tone(PALETTE.navy, PALETTE.cream, 0.1)); g.fillRect(0, 0, 1200, 700);
    g.strokeStyle = hex(tone(PALETTE.navy, PALETTE.ink, 0.55)); g.lineCap = 'round';
    const line = (x0, y0, x1, y1) => {   // two loose passes, like a pencil going over a ruled line
      for (let p = 0; p < 2; p++) {
        g.lineWidth = 1.5 + rng() * 2; g.beginPath(); g.moveTo(x0 + (rng() - 0.5) * 6, y0 + (rng() - 0.5) * 6);
        g.quadraticCurveTo((x0 + x1) / 2 + (rng() - 0.5) * 10, (y0 + y1) / 2 + (rng() - 0.5) * 10, x1 + (rng() - 0.5) * 6, y1 + (rng() - 0.5) * 6);
        g.stroke();
      }
    };
    for (let x = 30; x < 1200; x += 60) line(x, 0, x, 700);   // 0.06 m tiles
    for (let y = 20; y < 700; y += 60) line(0, y, 1200, y);
    return c;
  })();
  piece({ art: floorArt, size: [1.2, 0.7], key: `${ID}-marston_floor`, res: 1024 });

  // ---------- 15 desk tops, each torn from its own seed, each turned a little ----------
  for (let i = 0; i < 15; i++) {
    place(piece(art(props, 'desk_top', `${ID}-desk-${i + 1}`, { weight: 'kraft', res: 256 })),
      XS[i % 5], YS[Math.floor(i / 5)], 0.032, (rng() * 6 - 3) * DEG);
  }

  // ---------- shared desk rig: phone, its glow, a blob and its shadow decal ----------
  const glowTex = (() => {
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 }), g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.35, 'rgba(255,255,255,0.45)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const flat = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);

  const rigs = [];
  function deskRig({ key, who, cx, cy, f, ph = 1, r, S, wake, strength }) {
    const at = ([x, y]) => [cx + f * x, cy + f * y];   // occupant frame → world (f = −1 turns the desk round)
    const [px, py] = at([ph * PHONE_AT[0], PHONE_AT[1]]), [bx, by] = at(BLOB_AT);
    const phoneRot = f < 0 ? Math.PI : 0;
    place(piece(art(props, 'phone', `${ID}-${key}-phone`)), px, py, 0.033, phoneRot);
    const screen = place(flat(0.0062, 0.0125, new THREE.MeshBasicMaterial({ color: PALETTE.phone, transparent: true, depthWrite: false })), px, py, 0.0335, phoneRot);
    const glow = place(flat(0.08, 0.08, new THREE.MeshBasicMaterial({ color: PALETTE.phone, map: glowTex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false })), px, py, 0.0332);
    // The shadow falls away from the phone; the blob's drop points the same way, its eyes on the far side.
    const u = new THREE.Vector2(bx - px, by - py).normalize(), rot = Math.atan2(u.y, u.x) - Math.PI / 2;
    const blob = createBlob({ radius: r, seed: seedOf(ID, key) });
    place(blob.mesh, bx - u.x * 0.9 * r, by - u.y * 0.9 * r, 0.036, rot);
    // Spec puts it on the floor (z 0.001), but a 3–9× shadow runs under the neighbouring desks and they hide its eye holes;
    // just above the desk-top plane it lands on desks and floor alike (≤ 8 mm parallax at the frame edge) and stays under
    // every prop, blob and figure.
    const decal = place(new THREE.Mesh(blob.mesh.geometry, shadowMaterial(blob, PALETTE)), bx, by, 0.0325, rot);
    // Unshadowed cyan fill above the screen: lights this desk and the floor round it, so the room appears desk by desk
    // and the decal has light to darken. Throws nothing (the decal is the shadow).
    const len = S * 2.2 * r * 1.5;   // final shadow length (the silhouette is ~1.1 × 2r wide)
    const fill = place(new THREE.PointLight(PALETTE.phone, 0, 0.75 * len + FILL_Z, 2), px + 0.4 * len * u.x, py + 0.4 * len * u.y, FILL_Z);
    scene.add(screen, glow, blob.mesh, decal, fill);
    rigs.push({ key, who, blob, decal, screen, glow, fill, r, S, wake, strength });
  }

  // ---------- the crowd ----------
  const figRng = mulberry32(seedOf(ID, 'crowd'));
  let n = 0;
  const cast = [];   // (who, pose, mirror, turn, scale): read by evidence/anim-s13/measure.html for acceptance 4
  for (const [key, d] of Object.entries(CROWD)) {
    const i = Number(key.slice(1)) - 1, cx = XS[i % 5], cy = YS[Math.floor(i / 5)], f = d.f;
    const at = ([x, y]) => [cx + f * x, cy + f * y], facing = f < 0 ? Math.PI : 0;
    const [sx, sy] = at(SEAT_AT), rot = facing + (figRng() * 16 - 8) * DEG;
    place(piece(art(figs, d.pose, `${ID}-${key}-${d.pose}`)), sx, sy, 0.048 + 0.002 * n++, rot)
      .scale.set(d.mir ? -d.sc : d.sc, d.sc, 1);
    d.props.forEach((p, j) => {
      if (p === 'can') { const [x, y] = at([0.006 + 0.0085 * j, 0.014]); return place(piece(art(props, 'can', `${ID}-${key}-can${j}`)), x, y, 0.033); }
      const [ox, oy, deg] = PROP_AT[p], [x, y] = at([ox, oy]);
      place(piece(art(props, p, `${ID}-${key}-${p}`)), x, y, p === 'backpack' ? 0.045 : 0.033, facing + deg * DEG);
    });
    cast.push({ who: d.who, pose: d.pose, mirror: !!d.mir, turnDeg: +(rot / DEG).toFixed(1), scale: d.sc });
    deskRig({ key, who: d.who, cx, cy, f, ph: d.ph, r: d.r, S: d.S, wake: d.wake, strength: 0.35 });
  }

  // ---------- the hero (d8, centre), from hero_top parts ----------
  const hero = place(new THREE.Group(), SEAT_AT[0], SEAT_AT[1], 0);
  scene.add(hero);
  const green = [
    place(piece(art(figs, 'hero_body', `${ID}-hero-body`), hero), 0, 0, 0.055),
    place(piece(art(figs, 'hero_arms', `${ID}-hero-arms`), hero), 0, 0.024, 0.034),
    place(piece(art(figs, 'hero_tail', `${ID}-hero-tail`), hero), 0.004, -0.038, 0.030, 8 * DEG),
  ];
  const neck = new THREE.Group(); hero.add(neck);   // the neck pivot; the head sits just in front of it
  green.push(place(piece(art(figs, 'hero_head', `${ID}-hero-head`), neck), 0, 0.006, 0));
  const eyes = Object.fromEntries(['open', 'closed', 'gasp', 'worried'].map((e) =>
    [e, place(piece(art(face, `eyes_${e}`, `${ID}-hero-eyes-${e}`), neck), 0, 0.013, 0.001)]));   // forward on the head, so they show where he looks
  place(piece(art(figs, 'hero_backpack', `${ID}-hero-backpack`)), -0.042, -0.072, 0.010, -15 * DEG);
  place(piece(art(props, 'desk_lamp', `${ID}-hero-lamp`)), 0.04, 0.02, 0.034);   // unlit
  deskRig({ key: 'd8', who: 'hero', cx: 0, cy: 0, f: 1, r: 0.012, S: 7.1, wake: -1, strength: 1.0 });

  // Desaturation: paper keeps its painting, so tint it with the multiplier that takes gator green to saturation s.
  const g0 = new THREE.Color(PALETTE.gator), L = 0.2126 * g0.r + 0.7152 * g0.g + 0.0722 * g0.b;
  const satTint = (s) => new THREE.Color(...[g0.r, g0.g, g0.b].map((v) => (L + s * (v - L)) / v));

  return {
    rigs, cast,   // read by evidence/anim-s13/measure.html
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
      const tint = satTint(kf(tLocal, SAT));
      for (const m of green) m.material.color.copy(tint);

      // Desks: the phone lights over 2 frames at wake, the shadow springs up from 1× over 0.5 s (light on 1s).
      for (const g of rigs) {
        const dt = tLocal - g.wake, on = clamp(dt * 12 + 0.5), s = 1 + (g.S - 1) * easeOut(dt / 0.5);
        g.screen.material.opacity = on * (0.4 + 0.6 * g.strength);
        g.glow.material.opacity = on * g.strength;
        g.fill.intensity = on * (g.who === 'hero' ? FILL_HERO : FILL_CROWD);
        g.decal.visible = dt > 0;
        g.decal.scale.set(s, LONG * s, 1);
        g.decal.material.opacity = 0.85 * clamp(dt / 0.1);
        g.decal.material.userData.soft.value = 0.003 / (s * g.r);   // half of the 0.006 m soft edge, in blob-radius units
        g.blob.update(tLocal, { wobble: g.who === 'hero' ? 1 : 0.5, eyes: g.who === 'sleeper' ? 'closed' : 'open' });
      }
    },
  };
}

// The blob's own silhouette (eyes as holes) as a flat ink decal: reuse the blob's shadow-pass shader hook on a basic
// material, then soften its hard discard into a 0.006 m edge. Shares the blob's uniforms, so it wobbles with it.
// ponytail: leans on blob.js's depth-material hook (not in contracts.md); a contract `blob.silhouette()` would replace it.
function shadowMaterial(blob, PALETTE) {
  const m = new THREE.MeshBasicMaterial({ color: PALETTE.ink, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const soft = { value: 0.1 };
  m.userData.soft = soft;
  m.onBeforeCompile = (sh) => {
    blob.mesh.customDepthMaterial.onBeforeCompile(sh);
    sh.uniforms.uSoft = soft;
    const cut = /if \(bp\.y < uFloor \|\| field\(bp\) < ([\d.]+) \|\| eyesDist\(bp\) < 0\.0\) discard;/;
    if (!cut.test(sh.fragmentShader)) throw new Error('s13: blob.js shadow hook changed; rebuild the decal shader');
    sh.fragmentShader = 'uniform float uSoft;\n' + sh.fragmentShader
      .replace(cut, (_, T) => `const float hh = 0.01;
        vec2 gg = vec2(field(bp + vec2(hh, 0.0)) - field(bp - vec2(hh, 0.0)), field(bp + vec2(0.0, hh)) - field(bp - vec2(0.0, hh))) / (2.0 * hh);
        float inside = (field(bp) - ${T}) / max(length(gg), 1e-4);
        float sA = smoothstep(-uSoft, uSoft, inside) * smoothstep(-uSoft, uSoft, eyesDist(bp)) * step(uFloor, bp.y);
        if (sA <= 0.0) discard;`)
      .replace('#include <alphamap_fragment>', 'diffuseColor.a *= sA;\n#include <alphamap_fragment>');
  };
  m.customProgramCacheKey = () => 's13-shadow-decal';
  return m;
}
