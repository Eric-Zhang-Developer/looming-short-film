// usage: node scale.mjs <best-dir> <out.jpg> <table.md>   (best-dir holds props/, exam/, gator/ cut parts)
// Lays the winners at film scale beside the frozen gator side figure (0.0962 m tall = 432 px on the sheet).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const [, , S, OUT, TABLE] = process.argv;
const PPM = 432 / 0.0962 * 1.5;   // 1.5x the gator sheet's px per metre, for legibility
const dims = f => execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim().split(',').map(Number);
// [kit dir, file stem, row, 'h'|'w', metres, why]
const I = [
 ['exam','exam_room_kit_exam_desk_side',1,'h',0.050,'desk+chair back ~0.9 m x 0.055'],
 ['exam','exam_room_kit_wall_clock',1,'w',0.014,'docs/assets.md: clock O 0.014'],
 ['exam','exam_room_kit_board',1,'h',0.055,'docs/assets.md: board strip y 0.045-0.100'],
 ['exam','exam_room_kit_proctor',1,'h',0.105,'adult gator ~1.9 m x 0.055'],
 ['exam','exam_room_kit_door',1,'h',0.110,'as home_kit door'],
 ['exam','exam_room_kit_wall_strip',2,'h',0.055,'as home_kit wall strip'],
 ['exam','exam_room_kit_floor_strip',2,'h',0.055,'as home_kit floor strip'],
 ['props','props_kit_practice_1',3,'h',0.030,'desk-unit page 0.025 x 0.030 (README s2)'],
 ['props','props_kit_practice_2',3,'h',0.030,'same'],
 ['props','props_kit_test_page',3,'h',0.030,'same'],
 ['props','props_kit_graded_test',3,'h',0.030,'same'],
 ['props','props_kit_blank_page',3,'h',0.030,'same'],
 ['props','props_kit_calendar',3,'w',0.100,'s02: calendar 0.10 w x 0.12 h'],
 ['props','props_kit_calc_exam_square',4,'w',0.0125,'about one calendar cell (0.10 / 7 = 0.0143, less the grid margin)'],
 ['props','props_kit_red_circle',4,'w',0.012,'s02: red circle O 0.012'],
 ['props','props_kit_notification_card',4,'w',0.0135,'fits the phone face 0.015 x 0.008'],
 ['props','props_kit_red_x',4,'w',0.012,'covers one calendar square (s18)'],
 ['props','props_kit_strike_line',4,'w',0.012,'as the X'],
 ['props','props_kit_phone_face_up',4,'w',0.015,'s00: phone 0.015 x 0.008'],
 ['props','props_kit_phone_face_down',4,'w',0.015,'same'],
 ['props','props_kit_pen',4,'w',0.012,'s18: pen x -0.028...-0.016'],
 ['props','props_kit_pen_cap',4,'w',0.012 * 156 / 348,'same px/m as the pen (cap 156 px vs pen 348 px)'],
 ['props','props_kit_backpack',4,'h',0.025,'real ~45 cm x 0.055'],
 ['props','props_kit_ink_drop',4,'h',0.006,'about 1.5x blob r 0.004'],
];
let table = '| piece | cut px (w x h) | film w x h (m) | w, h in gator-heights (0.096 m) | basis |\n|---|---|---|---|---|\n';
const E = I.map(([d, n, row, dim, m, why]) => {
  const f = `${S}/${d}/${n}.png`, [w, h] = dims(f), hm = dim === 'h' ? m : m * h / w, wm = dim === 'w' ? m : m * w / h;
  table += `| ${n} | ${w} x ${h} | ${wm.toFixed(4)} x ${hm.toFixed(4)} | ${(wm / 0.096).toFixed(2)} x ${(hm / 0.096).toFixed(2)} | ${why} |\n`;
  return { f, row, w: Math.round(wm * PPM), h: Math.round(hm * PPM) };
});
writeFileSync(TABLE, table);
const gator = `${S}/gator/gator_sheet_turn_side.png`, [gw, gh] = dims(gator).map(v => Math.round(v * 1.5));
const G = 40, rowH = { 1: 760, 2: 400, 3: 760, 4: 360 }, placed = []; let y = 0, W = 0;
for (const r of [1, 2, 3, 4]) {
  const base = y + rowH[r]; let x = G;
  if (r === 1 || r === 3) { placed.push({ f: gator, x, y: base - gh, w: gw, h: gh }); x += gw + G; }
  for (const e of E.filter(e => e.row === r)) { placed.push({ f: e.f, x, y: base - e.h, w: e.w, h: e.h }); x += e.w + G; }
  W = Math.max(W, x); y += rowH[r];
}
const a = ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0x9aa0ad:s=${W}x${y}`]; let fc = '', last = '0:v';
placed.forEach((p, i) => { a.push('-i', p.f); fc += `[${i + 1}:v]scale=${p.w}:${p.h}:flags=lanczos,format=rgba[p${i}];[${last}][p${i}]overlay=${p.x}:${p.y}:format=auto[o${i}];`; last = `o${i}`; });
fc += `[${last}]scale=2400:-2,format=yuvj420p[out]`;
execFileSync('ffmpeg', [...a, '-filter_complex', fc, '-map', '[out]', '-frames:v', '1', '-q:v', '3', OUT]);
console.log(`canvas ${W}x${y} -> ${OUT}`);
