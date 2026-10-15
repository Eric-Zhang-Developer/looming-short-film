// Asset loader (contract: docs/contracts.md §assets). Frozen art when it has been cut, flat proxies until then.
// Proxies are a palette-coloured silhouette on transparent canvas, so they go through makePaper exactly like real
// art and blocking reads. The `proxy` flag is the label: frames never carry text.
import { PALETTE } from './core/palette.js';

// name → piece → [w, h (m), shape, PALETTE key]. Names from docs/assets.md; rough sizes from the shot specs
// (desk unit README §2, s01, s05, s09, s10, s13, s14, s15, s18). Shot specs win over these numbers.
// Shapes: gator (side silhouette), torso, head, taper, limb, rect, round (rounded rect), ellipse.
const G = 'gator', C = 'cream', K = 'kraft', N = 'navy', I = 'ink';
export const PIECES = {
  gator_sheet: {
    turn_side: [0.10, 0.08, 'gator', G], turn_front: [0.04, 0.08, 'torso', G], turn_back: [0.04, 0.08, 'torso', G],
    turn_head34: [0.03, 0.025, 'head', G], body: [0.03, 0.045, 'torso', G], head: [0.03, 0.022, 'head', G],
    snout: [0.022, 0.008, 'taper', G], jaw: [0.02, 0.006, 'taper', G], arm_l: [0.032, 0.007, 'limb', G],
    arm_r: [0.032, 0.007, 'limb', G], tail: [0.05, 0.012, 'taper', G], pocket: [0.014, 0.008, 'round', C],
  },
  face_sheet: {
    eyes_open: [0.008, 0.004, 'eyes', C], eyes_closed: [0.008, 0.0015, 'rect', I], eyes_tired: [0.008, 0.003, 'eyes', C],
    eyes_gasp: [0.009, 0.005, 'eyes', C], eyes_worried: [0.008, 0.004, 'eyes', C], eyes_side: [0.008, 0.004, 'eyes', C],
    mouth_neutral: [0.008, 0.0012, 'rect', I], mouth_smile: [0.008, 0.002, 'ellipse', I],
    mouth_o: [0.003, 0.003, 'ellipse', I], mouth_line: [0.008, 0.0008, 'rect', I],
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
  const table = PIECES[name];
  const sizes = Object.fromEntries(Object.entries(table).map(([p, [w, h]]) => [p, [w, h]]));
  const boxes = await fetch(`/assets/cut/${name}.boxes.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const frozen = boxes && (await fetch(`/assets/frozen/${name}.png`, { method: 'HEAD' }).then((r) => r.ok, () => false));
  if (frozen) {
    const pieces = {};
    await Promise.all(Object.keys(boxes).map(async (key) => {
      const img = new Image(); img.src = `/assets/cut/${key}.png`; await img.decode();
      pieces[key.startsWith(name + '_') ? key.slice(name.length + 1) : key] = await createImageBitmap(img);
    }));
    return { pieces, sizes, proxy: false };
  }
  const pieces = {};
  for (const [p, [w, h, shape, col]] of Object.entries(table)) pieces[p] = await createImageBitmap(proxy(w, h, shape, PALETTE[col]));
  return { pieces, sizes, proxy: true };
}

// A flat silhouette at the piece's aspect, 256 px on the long edge (makePaper resamples it to its own res).
function proxy(w, h, shape, color) {
  const L = 256, W = Math.max(8, Math.round(w >= h ? L : L * w / h)), H = Math.max(8, Math.round(w >= h ? L * h / w : L));
  const c = Object.assign(document.createElement('canvas'), { width: W, height: H }), g = c.getContext('2d');
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
    case 'eyes': ell(W * 0.25, H / 2, W * 0.23, H * 0.48); ell(W * 0.75, H / 2, W * 0.23, H * 0.48); break;
    case 'round': round(0, 0, W, H, Math.min(W, H) * 0.25); break;
    case 'ellipse': ell(W / 2, H / 2, W / 2, H / 2); break;
    default: g.rect(0, 0, W, H);  // 'rect'
  }
  g.fill();
  return c;
}
