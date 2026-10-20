// s19 · The title (docs/shots/s19.md, v9-beats §1). A hard cut from s18's black to a cream card: "Looming", hand-lettered in
// navy, and the dot of its i is the drop: tiny and black, a real blob (s18's bead), which quivers once at titleDotQuivers
// (0.8) and settles. This file also exports card(), the paper card s20–s22 are set on: cream cardstock filling the
// frame under the lamp's warm key, the paper boil at 10/s, and a lettering layer in the film's hand (s17b's Caveat) that
// boils with it. No red: red marks only the exam.
import * as THREE from 'three';
import { SHOTS } from '../timeline.ts';
import { lampLight, ambient } from '../lights.ts';
import { clamp } from '../core/ease.ts';
import { mulberry32, seedOf } from '../core/rng.ts';
import { boilSeed } from '../paper.ts';
import { createBlob } from '../blob.ts';
import { PALETTE } from '../core/palette.ts';
import { tools } from './s02.ts';
import { loadHand, handFont } from './s17b.ts';
import type { ShotCtx } from '../film.ts';

// ---------- the card (shared by s19–s22) ----------
const D = 0.30;                                     // camera to card (m); fov 20 → the frame is VW × VH on the card
const VH = 2 * D * Math.tan(10 * Math.PI / 180), VW = VH * 16 / 9;
const PX = 1920 / VW;                               // lettering canvas px per metre: one canvas px is one 1080p px
const KEY_I = 0.3, KEY_WARM = 0.45, AMB = 0.9;      // the lamp's key on the card (lamp amber this far toward cream), and the room's fill
const BOIL = 0.00012, BOIL_ROT = 0.0012;            // the lettering's boil: up to ±1.2 px and ±0.07° per step
export const SAFE = 0.1;                            // safe margin, a fraction of the frame on each side
export const INK = PALETTE.navy;                    // navy lettering

export type Card = { g: CanvasRenderingContext2D, W: number, H: number, toWorld: (px: number, py: number) => THREE.Vector3,
  key: THREE.SpotLight, update: (tLocal: number) => void };

// draw(g) letters the card once (the lettering only moves with the boil). Lines are drawn centred with fill and a thin
// stroke of the same ink, as s18 letters "Final".
export async function card(ctx: ShotCtx, ID: string, draw: (g: CanvasRenderingContext2D, W: number, H: number) => void): Promise<Card> {
  await loadHand();
  const { scene, camera, post } = ctx;
  scene.background = new THREE.Color(PALETTE.ink);
  camera.position.set(0, 0, D); camera.lookAt(0, 0, 0);
  const T = tools(ctx, ID);
  T.rect('card', PALETTE.cream, [VW * 1.12, VH * 1.14], [0, 0, 0], { res: 2048 });   // torn edges outside the frame

  const W = 1920, H = 1080, cv = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = cv.getContext('2d')!;
  draw(g, W, H);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const ink = new THREE.Mesh(new THREE.PlaneGeometry(VW, VH), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false }));
  ink.position.z = 0.0006; scene.add(ink);

  // the lamp, off frame up and left, its pool falling across the card; the room's fill
  const lamp = lampLight({ angle: 0.9, penumbra: 1, intensity: KEY_I, color: new THREE.Color(PALETTE.cream).lerp(new THREE.Color(PALETTE.lamp), KEY_WARM) });
  lamp.light.position.set(-0.10, 0.11, 0.16); lamp.light.target.position.set(0.012, -0.004, 0);
  const amb = ambient(); amb.intensity *= AMB;
  scene.add(lamp.light, lamp.light.target, amb);
  const fx = post({ focus: D, aperture: 0, lut: 'dawn' });
  fx.set({ grain: 0.04 });

  const toWorld = (px: number, py: number) => new THREE.Vector3((px / W - 0.5) * VW, (0.5 - py / H) * VH, 0);
  return {
    g, W, H, toWorld, key: lamp.light,
    update(t: number) {
      T.boil(t);
      const r = mulberry32(seedOf(ID, 'boil', boilSeed(t, 10)));
      ink.position.set((2 * r() - 1) * BOIL, (2 * r() - 1) * BOIL, 0.0006);
      ink.rotation.z = (2 * r() - 1) * BOIL_ROT;
    },
  };
}

// Lettering helpers: the hand at px, measured; a line wider than the safe width breaks after its last " ·" that fits
// (every character kept, the break only drops the space after the ·).
export function lines(g: CanvasRenderingContext2D, s: string, px: number, maxW: number): string[] {
  g.font = handFont(px);
  if (g.measureText(s).width <= maxW) return [s];
  const parts = s.split(' · '), out: string[] = [];
  let cur = parts[0];
  for (const p of parts.slice(1)) {
    if (g.measureText(`${cur} · ${p}`).width <= maxW) cur = `${cur} · ${p}`;
    else { out.push(`${cur} ·`); cur = p; }
  }
  out.push(cur);
  return out;
}
export function letter(g: CanvasRenderingContext2D, s: string, px: number, cx: number, y: number, color = INK) {
  g.font = handFont(px); g.fillStyle = color; g.strokeStyle = color; g.lineWidth = px / 60; g.textAlign = 'center';
  g.fillText(s, cx, y); g.strokeText(s, cx, y);
}

// A centred block of strings, each [text, px, space after (× px)], wrapped to the safe width and set as one block centred
// on the frame (a hair above the middle, where the lamp's pool is). Line pitch 1.2 × px.
export function block(g: CanvasRenderingContext2D, W: number, H: number, items: [string, number, number][]) {
  const maxW = W * (1 - 2 * SAFE), set = items.map(([s, px, gap]) => ({ ls: lines(g, s, px, maxW), px, gap }));
  const height = set.reduce((h, { ls, px, gap }) => h + ls.length * 1.2 * px + gap * px, 0) - set.at(-1)!.gap * set.at(-1)!.px;
  let y = (H - height) / 2 - H * 0.02;
  for (const { ls, px, gap } of set) { for (const l of ls) { y += 1.2 * px; letter(g, l, px, W / 2, y - 0.3 * px); } y += gap * px; }
  if (y > H * (1 - SAFE) + 1 || (H - height) / 2 < H * SAFE) throw new Error(`card: lettering runs into the safe margin (${height.toFixed(0)} px tall)`);
}

// ---------- s19 ----------
const ID = 's19';
const B = SHOTS.find((s) => s.id === ID)!.beats;   // titleCard 0, titleDotQuivers 0.8
const TITLE_PX = 300;                               // "Looming": about 45% of the frame wide
const QUIVER = 0.5;                                 // seconds of quiver, then it is still

export async function build(ctx: ShotCtx) {
  let dotAt: [number, number] = [0, 0], dotW = 0;
  const c = await card(ctx, ID, (g, W, H) => {
    // "Looming" centred a little above the middle; the i's own dot is cleared from the lettering layer and the drop
    // sits in its place. The tittle is found on the glyph itself: the i's column, above its x-height.
    const y = H * 0.56, s = 'Looming';
    letter(g, s, TITLE_PX, W / 2, y);
    g.font = handFont(TITLE_PX);
    const x0 = W / 2 - g.measureText(s).width / 2, xi0 = x0 + g.measureText('Loom').width, xi1 = x0 + g.measureText('Loomi').width;
    const xh = g.measureText('x').actualBoundingBoxAscent;   // the x-height above the baseline
    // The hand slants, so the tittle floats right of the i's advance box: search from the i into the n's column (an n has
    // nothing above the x-height), from the cap line down to just above the x-height.
    const top = y - TITLE_PX, bottom = y - xh - TITLE_PX * 0.05, rx = xi0, rw = 2.2 * (xi1 - xi0);
    const im = g.getImageData(Math.floor(rx), Math.floor(top), Math.ceil(rw), Math.ceil(bottom - top));
    let sx = 0, sy = 0, n = 0, lo = Infinity, hi = -Infinity;
    for (let j = 0; j < im.height; j++) for (let i = 0; i < im.width; i++) if (im.data[(j * im.width + i) * 4 + 3] > 128) { sx += i; sy += j; n++; lo = Math.min(lo, i); hi = Math.max(hi, i); }
    if (!n) throw new Error('s19: no tittle found over the i');
    dotAt = [rx + sx / n, top + sy / n]; dotW = hi - lo + 1;
    g.clearRect(rx, top, rw, bottom - top);
  });
  // the drop: s18's bead, a new blob, on the i
  const DOT_R = Math.min(dotW, 34) / PX / 2.28;   // the drop's radius: as wide as the tittle it replaces (the field is 2.28 r wide), 34 px at most: tiny
  const drop = createBlob({ radius: DOT_R, seed: 19 });
  drop.mesh.castShadow = false; ctx.scene.add(drop.mesh);
  const at = c.toWorld(...dotAt);
  drop.mesh.position.set(at.x, at.y - 1.0 * DOT_R, 0.0012);   // contact point under its centre

  return {
    update(t: number) {
      c.update(t);
      // the quiver (on 1s): s18's (doubled time, wobble up) plus one shiver of squash that dies away over the half second,
      // so a 34 px drop visibly trembles; then it is still. Its squash is spring() at a faster rate, read on 1s.
      const u = Math.floor((t - B.titleDotQuivers) * 24 + 1e-6) / 24, q = u >= 0 && u < QUIVER;
      const shiver = q ? 0.45 * Math.exp(-7 * u) * Math.sin(30 * u + 0.6) : 0;
      drop.update(q ? 2 * t : B.titleDotQuivers, { wobble: q ? 1.6 : 0, squash: clamp(shiver, -1, 1), eyes: 'closed', key: c.key });
    },
  };
}
