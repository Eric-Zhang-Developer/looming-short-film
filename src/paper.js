// paper.js: painted art or a plain shape → a torn sheet of paper (doc 04 §paper.js, contract in docs/contracts.md).
//
// How the edge is torn: rasterize the silhouette (art alpha or `path`), take its exact signed distance field,
// then cut the paper where   sdf(p) > cut(q)   with q = p's nearest edge point. Evaluating every edge noise at q
// (not p) keeps it constant along each normal: the edge moves only in and out along normals (no islands), and
// noise read along the rim at q becomes streaks that run across the edge, like fibers.
//   cut = wobble (smooth, seeded by key only, so the silhouette holds still) + jag (linear-interpolated value
//   noise, so it has corners instead of lumps; re-seeded by the boil seed).
// The fiber rim is a pale band just inside the cut, plus a few hairs poking out past it. Only the band near the
// edge is recomputed per boil seed; the SDF, fill and grain are built once per (key, res).
import * as THREE from 'three';
import { hash, mulberry32, seedOf } from './core/rng.js';
import { PALETTE } from './core/palette.js';

// Pixel values are at 1024 px on the long edge and scale with `res`.
// tearAmp [wobble, jag]: peak px (layered value noise sits mostly within a third of it) · tearFreq [wobble, jag] features per 1024 px · rimPx [min, max] · grain 0..1 · thickness 0..1
export const WEIGHTS = Object.freeze({
  cardstock: { tearAmp: [20, 6],   tearFreq: [5, 50],  rimPx: [3, 6],   grain: 0.05, thickness: 0.9 },  // tight edge, white rim
  kraft:     { tearAmp: [24, 9],   tearFreq: [4, 35],  rimPx: [3, 6],   grain: 0.10, thickness: 0.8 },  // coarser tear, fibrous body
  tissue:    { tearAmp: [34, 15],  tearFreq: [4, 22],  rimPx: [3, 6],   grain: 0.06, thickness: 0.15 }, // ragged, uneven, long hairs
  vellum:    { tearAmp: [12, 3],   tearFreq: [6, 70],  rimPx: [1.5, 3], grain: 0.03, thickness: 0.3 },  // near-clean, fine edge
});

// floor(t * rate); the epsilon keeps frame times like 7/10 from landing a hair under the step.
export const boilSeed = (t, rate = 10) => Math.floor(t * rate + 1e-6);

const CAP = 300;
const sheets = new Map();  // `${key}|${seed}|${res}` → PaperSheet, in least-recently-used order
const bases = new Map();   // `${key}|${res}` → per-asset work shared by every boil seed
// ponytail: bases is unbounded (one ~10 MB entry per asset at 1024 px); add an LRU if a scene loads dozens of assets.
export function clearPaperCache() {
  for (const s of sheets.values()) { s.map.dispose(); s.alphaMap.dispose(); }
  sheets.clear(); bases.clear();
}

export function makePaper({ art, path, color, weight = 'cardstock', size, key, seed = 0, res = 1024 } = {}) {
  if (!key) throw new Error('makePaper: key is required (it names the cache entry)');
  if (!art && !path) throw new Error('makePaper: pass art or path');
  if (!size) throw new Error('makePaper: size [w, h] in meters is required');
  const W8 = WEIGHTS[weight];
  if (!W8) throw new Error(`makePaper: unknown weight "${weight}"`);
  const id = `${key}|${seed}|${res}`;
  if (sheets.has(id)) { const s = sheets.get(id); sheets.delete(id); sheets.set(id, s); return s; }  // LRU touch

  const bid = `${key}|${res}`;
  if (!bases.has(bid)) bases.set(bid, makeBase({ art, path, color, W8, size, key, res }));
  const b = bases.get(bid);
  const sheet = { ...tear(b, W8, seedOf(key, seed)), thickness: W8.thickness, size: b.size, key, seed };

  sheets.set(id, sheet);
  if (sheets.size > CAP) {
    const [oldId, old] = sheets.entries().next().value;
    sheets.delete(oldId); old.map.dispose(); old.alphaMap.dispose();
  }
  return sheet;
}

// ---------- noise (seeded through core/rng's hash; no Math.random) ----------
const lat = (ix, iy, s) => hash(Math.imul(ix, 73856093) ^ Math.imul(iy, 19349663) ^ Math.imul(s, 83492791));
function vnoise(x, y, s, smooth) {  // value noise in [-1, 1]; smooth = smoothstep (lumps), else linear (corners)
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  if (smooth) { fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); }
  const a = lat(ix, iy, s), b = lat(ix + 1, iy, s), c = lat(ix, iy + 1, s), d = lat(ix + 1, iy + 1, s);
  return 2 * (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) - 1;
}
function fbm(x, y, s, octaves, smooth) {
  let sum = 0, amp = 1, norm = 0, f = 1;
  for (let o = 0; o < octaves; o++) {
    sum += amp * vnoise(x * f + o * 17.3, y * f + o * 31.7, s + o, smooth);
    norm += amp; amp *= 0.55; f *= 2.03;
  }
  return sum / norm;
}

// ---------- exact Euclidean distance transform (Felzenszwalb & Huttenlocher) ----------
const FAR = 1e20;
function edt1d(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -FAR; z[1] = FAR;
  for (let q = 1; q < n; q++) {
    const s0 = (r) => (f[q] + q * q - f[r] - r * r) / (2 * q - 2 * r);
    let s = s0(v[k]);
    while (s <= z[k]) s = s0(v[--k]);  // z[0] = -FAR and |s| < FAR / 2, so k never drops below 0
    k++; v[k] = q; z[k] = s; z[k + 1] = FAR;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const r = v[k]; d[q] = (q - r) * (q - r) + f[r]; }
}
// Squared distance from every pixel to the nearest pixel where site[i] is true.
function edt(site, W, H) {
  const g = new Float64Array(W * H), n = Math.max(W, H);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) f[y] = site[y * W + x] ? 0 : FAR;
    edt1d(f, H, d, v, z);
    for (let y = 0; y < H; y++) g[y * W + x] = d[y];
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) f[x] = g[y * W + x];
    edt1d(f, W, d, v, z);
    for (let x = 0; x < W; x++) g[y * W + x] = d[x];
  }
  return g;
}

// ---------- per asset: fill, grain, SDF, edge band ----------
const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };

function makeBase({ art, path, color, W8, size, key, res }) {
  const aspect = art ? art.width / art.height : size[0] / size[1];
  const W = Math.round(aspect >= 1 ? res : res * aspect), H = Math.round(aspect >= 1 ? res / aspect : res);
  const long = Math.max(...size);
  const sz = aspect >= 1 ? [long, long / aspect] : [long * aspect, long];
  const k = res / 1024;

  // Fill: the painting as-is, or the flat stock color, then a few fibers and a fine grain multiplied in.
  const c = canvas(W, H), ctx = c.getContext('2d');
  const mask = canvas(W, H), mctx = mask.getContext('2d');
  if (art) {
    ctx.drawImage(art, 0, 0, W, H);
    mctx.drawImage(art, 0, 0, W, H);
  } else {
    ctx.fillStyle = color || PALETTE.cream; ctx.fillRect(0, 0, W, H);
    mctx.fillStyle = '#000'; mctx.beginPath();
    path.forEach(([x, y], i) => (i ? mctx.lineTo(x * W, y * H) : mctx.moveTo(x * W, y * H)));
    mctx.closePath(); mctx.fill();
  }
  const rng = mulberry32(seedOf(key, 'fibers'));
  ctx.lineWidth = Math.max(1, k);
  for (let n = Math.round(W8.grain * W * H / 120); n > 0; n--) {
    const x = rng() * W, y = rng() * H, a = rng() * Math.PI, l = (6 + rng() * 26) * k;
    ctx.strokeStyle = rng() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  const img = ctx.getImageData(0, 0, W, H), px = img.data;
  const ma = mctx.getImageData(0, 0, W, H).data;
  if (art) for (let i = 3; i < px.length; i += 4) px[i] = 255;  // map is opaque; alpha lives in alphaMap
  const gs = seedOf(key, 'grain');
  for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) {
    const g = 1 + W8.grain * (0.6 * vnoise(x / k, y / k, gs, false) + 0.4 * vnoise(x / (5 * k), y / (5 * k), gs + 9, true));
    px[i] *= g; px[i + 1] *= g; px[i + 2] *= g;
  }

  // Signed distance (px, + inside), its gradient (inward normal) and the band of pixels any tear can reach.
  const N = W * H, inside = new Uint8Array(N);
  for (let i = 0; i < N; i++) inside[i] = ma[i * 4 + 3] >= 128;
  const dOut = edt(inside.map((v) => !v), W, H), dIn = edt(inside, W, H);
  const sdf = new Float32Array(N);
  for (let i = 0; i < N; i++) sdf[i] = inside[i] ? Math.sqrt(dOut[i]) - 0.5 : 0.5 - Math.sqrt(dIn[i]);
  const reach = (W8.tearAmp[0] + 1.5 * W8.tearAmp[1] + 1.5 * W8.rimPx[1] + 2) * k;  // |cut| + rim + hair can't pass this
  const band = [], alpha = new Uint8ClampedArray(N);
  for (let i = 0; i < N; i++) {
    if (Math.abs(sdf[i]) < reach) band.push(i);
    else alpha[i] = sdf[i] > 0 ? 255 : 0;
  }
  const at = (x, y) => sdf[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  const nx = new Float32Array(band.length), ny = new Float32Array(band.length);
  band.forEach((i, j) => {
    const x = i % W, y = (i / W) | 0, gx = at(x + 1, y) - at(x - 1, y), gy = at(x, y + 1) - at(x, y - 1), gl = Math.hypot(gx, gy) || 1;
    nx[j] = gx / gl; ny[j] = gy / gl;
    // The tear can push past the painted edge, where there's no paint: bleed in the color from just inside it.
    if (art && sdf[i] < 0) {
      const d = sdf[i] - 1.5, sx = Math.round(x - nx[j] * d), sy = Math.round(y - ny[j] * d);
      const src = (Math.min(H - 1, Math.max(0, sy)) * W + Math.min(W - 1, Math.max(0, sx))) * 4;
      for (let c = 0; c < 3; c++) px[i * 4 + c] = px[src + c];
    }
  });
  // Painted art already has its own silhouette, so it gets less of the large wobble (it would distort the drawing).
  const wob = art ? 0.4 : 1;
  return { W, H, size: sz, k, px, sdf, band: Int32Array.from(band), nx, ny, alpha, wob, wobSeed: seedOf(key, 'wobble') };
}

// ---------- per boil seed: cut, rim, hairs ----------
const RIM = rgb(PALETTE.cream).map((v) => v + (255 - v) * 0.45);  // the paper's white core, a touch warm
function tear(b, W8, s) {
  const { W, H, k, sdf, band } = b;
  const px = b.px.slice(), alpha = b.alpha.slice();
  const [wobA, jagA] = W8.tearAmp.map((v) => v * k), [wobF, jagF] = W8.tearFreq.map((v) => v / 1024);
  const [rimLo, rimHi] = W8.rimPx.map((v) => v * k), hairLen = 0.5 * rimHi + 0.4 * jagA;
  const white = 0.4 + 0.6 * W8.thickness;  // thin stock is dyed through, so its torn core shows less white
  for (let j = 0; j < band.length; j++) {
    const i = band[j], x = i % W, y = (i / W) | 0, d = sdf[i];
    const qx = (x - b.nx[j] * d) / k, qy = (y - b.ny[j] * d) / k;  // nearest edge point, in 1024-px units
    const cut = b.wob * wobA * fbm(qx * wobF, qy * wobF, b.wobSeed, 3, true) + jagA * fbm(qx * jagF, qy * jagF, s, 4, false);
    const e = d - cut;  // depth inside the torn edge, px
    const streak = 0.5 + 0.5 * vnoise(qx / 2.2, qy / 2.2, s + 7, true);
    const hair = hairLen * Math.max(0, vnoise(qx / 3, qy / 3, s + 11, false) - 0.6) / 0.4;
    alpha[i] = 255 * Math.min(1, Math.max(0, e + hair + 0.5));
    // Rim width wanders slowly between min and max, its inner edge is jagged, and fibers streak across it.
    const wide = Math.min(1, Math.max(0, 0.5 + 0.9 * fbm(qx / 24, qy / 24, s + 5, 2, true)));
    const rimW = (rimLo + (rimHi - rimLo) * wide) * (0.75 + 0.5 * streak) + 0.5 * jagA * fbm(qx / 4, qy / 4, s + 3, 2, false);
    const m = (e < 0 ? 1 : Math.min(1, Math.max(0, rimW - e + 0.5))) * white * (0.45 + 0.55 * streak);
    if (m > 0) for (let c = 0; c < 3; c++) px[i * 4 + c] += (RIM[c] * (0.94 + 0.06 * streak) - px[i * 4 + c]) * m;
  }
  const mapC = canvas(W, H), aC = canvas(W, H);
  mapC.getContext('2d').putImageData(new ImageData(px, W, H), 0, 0);
  const a = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) { a[i * 4] = a[i * 4 + 1] = a[i * 4 + 2] = alpha[i]; a[i * 4 + 3] = 255; }
  aC.getContext('2d').putImageData(new ImageData(a, W, H), 0, 0);
  const map = new THREE.CanvasTexture(mapC); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const alphaMap = new THREE.CanvasTexture(aC);
  return { map, alphaMap };
}
