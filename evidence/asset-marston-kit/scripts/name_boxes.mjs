// node name_boxes.mjs <auto.boxes.json> <int|ext> <out.named.json>
// Names cut.mjs --auto boxes by row (sorted by box centre y, chunked by the prompt's row sizes), then by x within the row.
import { readFileSync, writeFileSync } from 'node:fs';
const [,, file, kit, out] = process.argv;
const P = { int: 'marston_kit_', ext: 'marston_ext_kit_' }[kit];
const ROWS = { int: [['cubicle_front','cubicle_side','desk_row_front','round_table'],['chair_side','chair_34','chair_back','bookshelf_bay','column'],['ring_light_lit','ring_light_unlit','strip_light','recessed_panel','exit_sign'],['ceiling_strip','carpet_tile','ribbon_window','wall_strip']],
  ext: [['facade_block','stepped_bay','breezeway_frame','century_tower'],['night_view','oak_canopy','lit_window_strip'],['brick_strip','band_strip','planter_hex','sculpture_yellow'],['lantern_post','lantern_cluster','lamppost_black']] }[kit];
const byY = Object.values(JSON.parse(readFileSync(file, 'utf8'))).sort((a, b) => (a[1] + a[3] / 2) - (b[1] + b[3] / 2));
const res = {}; let i = 0;
for (const row of ROWS) { byY.slice(i, i += row.length).sort((a, b) => a[0] - b[0]).forEach((r, j) => res[P + row[j]] = r); }
writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
console.log(out, Object.keys(res).length);
