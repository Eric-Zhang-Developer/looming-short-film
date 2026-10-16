// Asset loader (contract: docs/contracts.md §assets). Frozen art when it has been cut, flat proxies until then.
// Proxies are a palette-coloured silhouette on transparent canvas, so they go through makePaper exactly like real
// art and blocking reads. The `proxy` flag is the label: frames never carry text.
import { PALETTE } from './core/palette.js';

// name → piece → [w, h (m), shape, PALETTE key]. Names from docs/assets.md; rough sizes from the shot specs
// (desk unit README §2, s01, s05, s09, s10, s13, s14, s15, s18). Shot specs win over these numbers.
// Shapes: gator (side silhouette), torso, head, taper, limb, leg (shin with a foot toward +x), rect, round (rounded rect), ellipse.
const G = 'gator', C = 'cream', K = 'kraft', N = 'navy', I = 'ink';
export const PIECES = {
  // gator_sheet and face_sheet: the frozen art's opaque boxes at the side rig's fit (characters/gator.js: K, FACE).
  gator_sheet: {
    turn_side: [0.1057, 0.0962, 'gator', G], turn_front: [0.0522, 0.0958, 'torso', G], turn_back: [0.0619, 0.0976, 'torso', G],
    turn_head34: [0.0497, 0.0437, 'head', G], body: [0.0485, 0.0533, 'torso', G], head: [0.0433, 0.0370, 'head', G],
    snout: [0.0471, 0.0172, 'taper', G], jaw: [0.0433, 0.0170, 'taper', G], arm_l: [0.0411, 0.0183, 'limb', G],
    arm_r: [0.0411, 0.0183, 'limb', G], tail: [0.0449, 0.0210, 'taper', G], pocket: [0.014, 0.0069, 'round', C],
    leg_l: [0.0181, 0.0164, 'leg', G], leg_r: [0.0181, 0.0164, 'leg', G],
  },
  face_sheet: {
    eyes_open: [0.01368, 0.01379, 'ellipse', C], eyes_closed: [0.01453, 0.00583, 'rect', I], eyes_tired: [0.0141, 0.01442, 'ellipse', C],
    eyes_gasp: [0.01516, 0.01538, 'ellipse', C], eyes_worried: [0.01845, 0.014, 'ellipse', C], eyes_side: [0.01347, 0.01357, 'ellipse', C],
    mouth_neutral: [0.02089, 0.00286, 'rect', I], mouth_smile: [0.0228, 0.00551, 'ellipse', I],
    mouth_o: [0.00594, 0.00912, 'ellipse', I], mouth_line: [0.01548, 0.00148, 'rect', I],
  },
  roommates_sheet: {
    tall_body: [0.035, 0.07, 'torso', G], tall_head: [0.035, 0.025, 'head', G], tall_leg_l: [0.008, 0.03, 'limb', G],
    tall_leg_r: [0.008, 0.03, 'limb', G], tall_tail: [0.05, 0.012, 'taper', G], round: [0.08, 0.075, 'gator', G],
  },
  custodian_sheet: {
    custodian_body: [0.025, 0.04, 'torso', G], custodian_head: [0.025, 0.018, 'head', G],
    custodian_cap: [0.012, 0.005, 'round', N], custodian_arm_l: [0.022, 0.005, 'limb', G],
    custodian_arm_r: [0.022, 0.005, 'limb', G], custodian_tail: [0.035, 0.009, 'taper', G],
    cart_frame: [0.06, 0.05, 'rect', N], cart_tray: [0.06, 0.004, 'rect', K], cart_bucket: [0.02, 0.018, 'round', N],
    mop: [0.006, 0.07, 'rect', K],
  },
  freshman_sheet: {
    body: [0.026, 0.038, 'torso', G], head: [0.026, 0.019, 'head', G], snout: [0.019, 0.007, 'taper', G],
    jaw: [0.017, 0.005, 'taper', G], arm_l: [0.027, 0.006, 'limb', G], arm_r: [0.027, 0.006, 'limb', G],
    tail: [0.043, 0.01, 'taper', G], backpack: [0.04, 0.045, 'round', N],
    leg_l: [0.0136, 0.0272, 'leg', G], leg_r: [0.0136, 0.0272, 'leg', G],
  },
  skyline_sheet: { skyline_far: [1.8, 0.28, 'rect', N], skyline_near: [1.8, 0.2, 'rect', N] },
  apt_exterior: { facade: [0.4, 0.5, 'rect', K] },
  foliage_sheet: { oak_branch: [0.4, 0.25, 'taper', N], campus_trees: [1.6, 0.2, 'rect', N], hedge: [0.12, 0.05, 'round', N] },
  apt_furniture_sheet: {
    mini_fridge: [0.05, 0.07, 'rect', C], mini_fridge_door: [0.05, 0.07, 'rect', C], kitchen_stool: [0.03, 0.05, 'rect', K],
    apt_couch: [0.2, 0.08, 'round', N], apt_coffee_table: [0.1, 0.035, 'rect', K],
    apt_bed_mattress: [0.2, 0.03, 'round', C], apt_bed_pillow: [0.05, 0.015, 'ellipse', C], apt_bed_blanket: [0.16, 0.035, 'round', C],
  },
  marston_ext: { facade: [1.2, 0.42, 'rect', K] },
  // ≥ 4 crops so the 8 s10 wings don't repeat (docs/assets.md)
  marston_stacks: { shelf_1: [0.26, 0.3, 'rect', K], shelf_2: [0.26, 0.3, 'rect', K], shelf_3: [0.26, 0.3, 'rect', K], shelf_4: [0.26, 0.3, 'rect', K] },
  marston_furniture_sheet: { desk_top: [0.183, 0.09, 'rect', K], desk_apron: [0.183, 0.034, 'rect', K], chair: [0.035, 0.05, 'rect', K] },
  desk_lamp: {
    base: [0.016, 0.004, 'round', N], stem: [0.004, 0.07, 'rect', N], knob: [0.002, 0.002, 'ellipse', N],
    arm: [0.024, 0.003, 'rect', N], shade: [0.016, 0.014, 'taper', C],
  },
  calendar: { sheet1: [0.1, 0.12, 'rect', C], sheet2: [0.1, 0.12, 'rect', C] },
  study_props_sheet: {
    phone_face: [0.015, 0.008, 'round', I], phone_back: [0.015, 0.008, 'round', N], laptop_base: [0.045, 0.003, 'rect', N],
    laptop_lid: [0.045, 0.003, 'rect', N], pen: [0.012, 0.0015, 'rect', N], pen_cap: [0.004, 0.0017, 'rect', N],
    exam_page: [0.025, 0.03, 'rect', C], energy_drink: [0.007, 0.012, 'round', C],
    backpack_side: [0.025, 0.04, 'round', N], backpack_front: [0.035, 0.04, 'round', N], backpack_back: [0.035, 0.04, 'round', N],
  },
  apt_props_sheet: {
    jar_l: [0.008, 0.012, 'round', C], jar_m: [0.007, 0.01, 'round', C], jar_s: [0.006, 0.008, 'round', C],
    carton: [0.008, 0.014, 'rect', C], controller_1: [0.012, 0.007, 'ellipse', N], controller_2: [0.012, 0.007, 'ellipse', N],
    ladder: [0.04, 0.18, 'rect', K], drill: [0.02, 0.018, 'rect', N],
  },
  top_props_sheet: {
    desk_top: [0.11, 0.065, 'rect', K], phone: [0.008, 0.015, 'round', I], laptop: [0.045, 0.03, 'rect', N],
    desk_lamp: [0.016, 0.016, 'ellipse', N], textbook: [0.04, 0.028, 'rect', C], can: [0.007, 0.007, 'ellipse', C],
    page: [0.022, 0.028, 'rect', C], pen: [0.012, 0.0015, 'rect', N], backpack: [0.04, 0.03, 'round', N],
  },
  crowd_sheet: {
    neighbor_body: [0.03, 0.045, 'torso', G], neighbor_head: [0.03, 0.022, 'head', G], neighbor_arm: [0.032, 0.007, 'limb', G],
    sleeper_body: [0.03, 0.045, 'torso', G], sleeper_head: [0.03, 0.022, 'head', G], sleeper_arm: [0.032, 0.007, 'limb', G],
  },
  // seated_1..6: the 6 top-view seated poses (the Sleeper, the Drinks gator and the Freshman among them)
  top_figures_sheet: {
    hero_body: [0.03, 0.04, 'ellipse', G], hero_head: [0.02, 0.025, 'ellipse', G], hero_arms: [0.045, 0.012, 'limb', G],
    hero_tail: [0.012, 0.045, 'taper', G], hero_backpack: [0.03, 0.025, 'round', N],
    seated_1: [0.04, 0.06, 'ellipse', G], seated_2: [0.04, 0.06, 'ellipse', G], seated_3: [0.04, 0.06, 'ellipse', G],
    seated_4: [0.04, 0.06, 'ellipse', G], seated_5: [0.04, 0.06, 'ellipse', G], seated_6: [0.034, 0.05, 'ellipse', G],
  },
};

const cache = new Map();  // name → Promise of the load result
export function load(name) {
  if (!PIECES[name]) return Promise.reject(new Error(`assets: unknown asset "${name}" (docs/assets.md)`));
  if (!cache.has(name)) cache.set(name, loadUncached(name));
  return cache.get(name);
}

async function loadUncached(name) {
  const table = PIECES[name], pieces = {};
  const boxes = await fetch(`/assets/cut/${name}.boxes.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const frozen = boxes && (await fetch(`/assets/frozen/${name}.png`, { method: 'HEAD' }).then((r) => r.ok, () => false));
  if (frozen) {
    await Promise.all(Object.keys(boxes).map(async (key) => {
      const img = new Image(); img.src = `/assets/cut/${key}.png`;
      await img.decode().catch(() => { throw new Error(`assets: ${img.src} is missing: run node tools/cut.mjs --in=assets/frozen/${name}.png`); });
      pieces[key.startsWith(name + '_') ? key.slice(name.length + 1) : key] = await createImageBitmap(despill(img));
    }));
  } else {
    for (const [p, [w, h, shape, col]] of Object.entries(table)) pieces[p] = await createImageBitmap(proxy(w, h, shape, PALETTE[col]));
  }
  // Proxy margins and cut padding are transparent, so each size is the whole bitmap's, scaled so its opaque box is the
  // PIECES size along the PIECES long axis, at the bitmap's own aspect (makePaper never stretches art, so this is
  // exactly the sheet it makes).
  const visible = Object.fromEntries(Object.entries(pieces).map(([p, bmp]) => [p, opaqueBox(bmp)]));
  const sizes = Object.fromEntries(Object.entries(table).map(([p, [w, h]]) => {
    const bmp = pieces[p];
    if (!bmp) return [p, [w, h]];
    const [u0, v0, u1, v1] = visible[p], k = w >= h ? w / (u1 - u0) / bmp.width : h / (v1 - v0) / bmp.height;
    return [p, [bmp.width * k, bmp.height * k]];
  }));
  return { pieces, sizes, visible, proxy: !frozen };
}

// Codex paints a soft fringe outside each piece (alpha < 128) in the colour it was painted against, a yellow-green,
// and paper.js resamples every piece, which mixes that fringe into the edge it keeps (alpha >= 128). So each fringe
// pixel takes the colour of its nearest kept one (a breadth-first fill outward), and alpha < 16 dust goes. The kept
// pixels, the painted cream rim among them, and all alpha >= 16 are untouched, so the silhouette paper.js cuts at 0.5
// doesn't move. evidence/cut-gator/halo.jpg.
function despill(img) {
  const W = img.width, H = img.height, c = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H), p = d.data, seen = new Uint8Array(W * H);
  let q = [];
  for (let i = 0; i < W * H; i++) if (p[i * 4 + 3] >= 128) { seen[i] = 1; q.push(i); }
  while (q.length) {
    const next = [];
    for (const i of q) {
      const x = i % W;
      for (const n of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
        if (n < 0 || n >= W * H || seen[n] || !p[n * 4 + 3]) continue;
        seen[n] = 1; p[n * 4] = p[i * 4]; p[n * 4 + 1] = p[i * 4 + 1]; p[n * 4 + 2] = p[i * 4 + 2]; next.push(n);
      }
    }
    q = next;
  }
  for (let i = 3; i < p.length; i += 4) if (p[i] < 16) p[i] = 0;
  g.putImageData(d, 0, 0);
  return c;
}

// [u0, v0, u1, v1]: the box around pixels with alpha ≥ 128 (paper.js cuts at the same 0.5), in uv, v down.
function opaqueBox(bmp) {
  const W = bmp.width, H = bmp.height, g = Object.assign(document.createElement('canvas'), { width: W, height: H }).getContext('2d');
  g.drawImage(bmp, 0, 0);
  const a = g.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (a[(y * W + x) * 4 + 3] < 128) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? [0, 0, 1, 1] : [x0 / W, y0 / H, (x1 + 1) / W, (y1 + 1) / H];
}

// A flat silhouette at the piece's aspect, 256 px on the long edge (makePaper resamples it to its own res), inside a
// transparent margin of 4 % of the long edge (min 8 px) so makePaper has an edge to tear on every side. The bitmap is
// bigger than the shape, and `sizes` is bigger by the same factor, so the shape itself lands at the PIECES size.
function proxy(w, h, shape, color) {
  const L = 256, M = Math.max(8, Math.round(L * 0.04));
  const W = Math.max(8, Math.round(w >= h ? L : L * w / h)), H = Math.max(8, Math.round(w >= h ? L * h / w : L));
  const c = Object.assign(document.createElement('canvas'), { width: W + 2 * M, height: H + 2 * M }), g = c.getContext('2d');
  g.translate(M, M);
  g.fillStyle = color; g.beginPath();
  const ell = (x, y, rx, ry) => { g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); };
  const round = (x, y, w, h, r) => g.roundRect(x, y, w, h, r);
  switch (shape) {
    case 'gator':  // side view facing +x: tail, body, head with snout, little legs
      g.moveTo(0, H * 0.78); g.quadraticCurveTo(W * 0.2, H * 0.6, W * 0.35, H * 0.55); g.lineTo(W * 0.35, H * 0.95); g.closePath();
      round(W * 0.3, H * 0.35, W * 0.38, H * 0.6, W * 0.12);
      ell(W * 0.66, H * 0.25, W * 0.14, H * 0.22); round(W * 0.66, H * 0.2, W * 0.34, H * 0.14, H * 0.06);
      round(W * 0.36, H * 0.85, W * 0.08, H * 0.15, 4); round(W * 0.56, H * 0.85, W * 0.08, H * 0.15, 4);
      break;
    case 'torso': round(W * 0.05, 0, W * 0.9, H, Math.min(W, H) * 0.4); break;
    case 'head': ell(W * 0.35, H * 0.5, W * 0.33, H * 0.48); round(W * 0.35, H * 0.3, W * 0.65, H * 0.4, H * 0.2); break;
    case 'taper': g.moveTo(0, 0); g.quadraticCurveTo(W * 0.6, H * 0.2, W, H * 0.5); g.quadraticCurveTo(W * 0.6, H * 0.8, 0, H); g.closePath(); break;
    case 'limb': round(0, 0, W, H, Math.min(W, H) / 2); break;
    case 'leg': round(0, 0, W * 0.62, H, W * 0.3); round(0, H * 0.74, W, H * 0.26, H * 0.13); break;
    case 'eyes': ell(W * 0.25, H / 2, W * 0.23, H * 0.48); ell(W * 0.75, H / 2, W * 0.23, H * 0.48); break;
    case 'round': round(0, 0, W, H, Math.min(W, H) * 0.25); break;
    case 'ellipse': ell(W / 2, H / 2, W / 2, H / 2); break;
    default: g.rect(0, 0, W, H);  // 'rect'
  }
  g.fill();
  return c;
}
