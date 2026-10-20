// node scale.mjs <named-cuts-dir> <gator-side.png> <int|ext> <out.jpg> <out.md>
// Lays the cut pieces beside the frozen gator at true film scale. 0.055 film m per real m (gator 0.096 m = 1.75 m student, src/characters/gator.js; same as asset-home-kit).
import { execFileSync } from 'node:child_process'; import { writeFileSync } from 'node:fs';
const [,, DIR, GATOR, KIT, OUT, TABLE] = process.argv;
const PPM = 1 / (0.030 / 130), FILM = 0.055; // gator sheet px per film metre; film m per real m
const P = KIT === 'int' ? 'marston_kit_' : 'marston_ext_kit_';
const dims = f => execFileSync('ffprobe', ['-v','error','-show_entries','stream=width,height','-of','csv=p=0', f], {encoding:'utf8'}).trim().split(',').map(Number);
// [row, name, 'h'|'w', real metres]  (real metres = my reading of the real object; see the table in done/)
const INT = [
 [1,'cubicle_front','h',1.4],[1,'cubicle_side','h',1.4],[1,'desk_row_front','h',1.05],[1,'round_table','h',0.75],
 [1,'chair_side','h',1.0],[1,'chair_34','h',1.0],[1,'chair_back','h',1.0],[1,'bookshelf_bay','h',2.1],[1,'column','h',3.0],
 [2,'ring_light_lit','w',2.0],[2,'ring_light_unlit','w',2.0],[2,'strip_light','w',2.4],[2,'recessed_panel','w',0.6],[2,'exit_sign','w',0.35],[2,'ceiling_strip','w',4.8],[2,'carpet_tile','w',1.2],
 [3,'ribbon_window','h',1.5],[3,'wall_strip','h',3.0]];
// exterior: film metres straight from docs/shots/s09.md (facade 1.2 x 0.42, windows 0.07 x 0.05) and s11 (windows 0.10 wide, sill 0.066, top 0.300); tower and lamps are distance-layer sizes, not real scale
const EXT = [
 [1,'facade_block','w',1.2/FILM],[1,'stepped_bay','w',0.40/FILM],[1,'breezeway_frame','h',0.33/FILM],[1,'century_tower','h',0.50/FILM],
 [2,'night_view','w',0.50/FILM],[2,'oak_canopy','w',0.80/FILM],[2,'lit_window_strip','w',0.85/FILM],
 [3,'brick_strip','h',0.075/FILM],[3,'band_strip','h',0.03/FILM],[3,'planter_hex','w',0.14/FILM],[3,'sculpture_yellow','w',0.20/FILM],
 [3,'lantern_post','h',0.165/FILM],[3,'lantern_cluster','w',0.08/FILM],[3,'lamppost_black','h',0.22/FILM]];
const items = KIT === 'int' ? INT : EXT;
const [gw, gh] = dims(GATOR);
let table = '| piece | cut px (w x h) | real size (m) assumed | film w x h (m) | w, h in gator-heights (0.096 m) | texel density vs gator sheet |\n|---|---|---|---|---|---|\n';
const E = items.map(([row, n, dim, rm]) => {
  const f = `${DIR}/${P}${n}.png`, [w, h] = dims(f);
  const rh = dim === 'h' ? rm : rm * h / w, rw = dim === 'w' ? rm : rm * w / h;
  const fh = rh * FILM, fw = rw * FILM;
  table += `| ${n} | ${w} x ${h} | ${rw.toFixed(2)} x ${rh.toFixed(2)} | ${fw.toFixed(4)} x ${fh.toFixed(4)} | ${(fw/0.096).toFixed(2)} x ${(fh/0.096).toFixed(2)} | ${(h/(fh*PPM)).toFixed(2)} |\n`;
  return { f, row, w: Math.round(fw * PPM), h: Math.round(fh * PPM), n };
});
writeFileSync(TABLE, table);
const G = 40, rows = [...new Set(E.map(e => e.row))], placed = []; let y = 0, W = 0;
for (const r of rows) {
  const es = E.filter(e => e.row === r), rh = Math.max(gh, ...es.map(e => e.h)), base = y + rh; let x = G;
  placed.push({ f: GATOR, x, y: base - gh, w: gw, h: gh }); x += gw + G;
  for (const e of es) { placed.push({ f: e.f, x, y: base - e.h, w: e.w, h: e.h }); x += e.w + G; }
  W = Math.max(W, x); y = base + 30;
}
const a = ['-v','error','-y','-f','lavfi','-i',`color=c=0x9aa0ad:s=${W}x${y}`]; let fc = '', last = '0:v';
placed.forEach((p, i) => { a.push('-i', p.f); fc += `[${i+1}:v]scale=${p.w}:${p.h}:flags=lanczos,format=rgba[p${i}];[${last}][p${i}]overlay=${p.x}:${p.y}:format=auto[o${i}];`; last = `o${i}`; });
fc += `[${last}]scale=2400:-2,format=yuvj420p[out]`;
a.push('-filter_complex', fc, '-map', '[out]', '-frames:v', '1', '-q:v', '3', OUT);
execFileSync('ffmpeg', a); console.log(`canvas ${W}x${y} -> ${OUT}`);
