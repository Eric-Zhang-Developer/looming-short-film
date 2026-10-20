// usage: node name_boxes.mjs <kit> <in.boxes.json> <out.named.json> <sheetW> <sheetH>
// Names an auto-cut boxes file by reading order (rows by centre y, then x), against the prompt's piece order.
import { readFileSync, writeFileSync } from 'node:fs';
const [,, kit, file, out, W0, H0] = process.argv;
const ROWS = {
  roommates_sheet: [['tall_body','tall_head','tall_leg_l','tall_leg_r','tall_tail'],['round']],
  custodian_sheet: [['custodian_body','custodian_head','custodian_cap','custodian_arm_l','custodian_arm_r','custodian_tail'],['cart_frame','cart_tray','cart_bucket','mop']],
  crowd_sheet: [['neighbor_body','neighbor_head','neighbor_arm'],['sleeper_body','sleeper_head','sleeper_arm']],
  top_figures_sheet: [['hero_body','hero_head','hero_arms','hero_tail','hero_backpack'],['seated_1','seated_2','seated_3','seated_4','seated_5','seated_6']],
}[kit];
const b = Object.values(JSON.parse(readFileSync(file, 'utf8')));
const byY = b.map(r => ({ r, cy: r[1] + r[3] / 2 })).sort((a, c) => a.cy - c.cy).map(o => o.r);
let i = 0; const res = {};
for (const row of ROWS) { byY.slice(i, i + row.length).sort((a, c) => a[0] - c[0]).forEach((r, j) => res[`${kit}_${row[j]}`] = r); i += row.length; }
writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
const e = Object.entries(res); let min = 1e9;
for (let a = 0; a < e.length; a++) for (let c = a + 1; c < e.length; c++) { const [, [x, y, w, h]] = e[a], [, [X, Y, W, H]] = e[c]; min = Math.min(min, Math.hypot(Math.max(X - (x + w), x - (X + W), 0), Math.max(Y - (y + h), y - (Y + H), 0))); }
const edge = Math.min(...e.map(([, [x, y, w, h]]) => Math.min(x, y, +W0 - (x + w), +H0 - (y + h))));
console.log(`${out}: ${e.length} named, min box gap ${min.toFixed(0)} px, min edge margin ${edge} px`);
