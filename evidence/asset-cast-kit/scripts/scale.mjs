// usage: node scale.mjs <best-dir> <out.jpg>   (best-dir has gator/ and one dir per winning sheet, keyed pieces cut by cut.mjs)
// Lays each winning sheet's pieces at their src/assets.js PIECES size (long axis exact, the other at the cut's own aspect,
// which is what loadUncached does) beside the frozen gator side figure (0.0962 m tall = 432 px on the sheet), one row per sheet.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
const [, , S, OUT] = process.argv;
const PPM = 432 / 0.0962 * 1.6;
const src = readFileSync('src/assets.js', 'utf8');
const dims = f => execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim().split(',').map(Number);
const sheets = { roommates_sheet: 'roommates_sheet_v1_2', custodian_sheet: 'custodian_sheet_v1_2', crowd_sheet: 'crowd_sheet_v1_2', top_figures_sheet: 'top_figures_sheet_v1_1' };
const gator = `${S}/gator/gator_sheet_turn_side.png`, [gw0, gh0] = dims(gator), gh = Math.round(0.0962 * PPM), gw = Math.round(gw0 * gh / gh0);
const G = 30, placed = []; let y = 0, W = 0, table = '| sheet | piece | film size w x h (m) | cut px | px on this sheet |\n|---|---|---|---|---|\n';
for (const [sheet, dir] of Object.entries(sheets)) {
  const body = src.match(new RegExp(`${sheet}: \\{([\\s\\S]*?)\\n  \\},?\\n`))[1];
  const items = [...body.matchAll(/(\w+): \[([\d.]+), ([\d.]+),/g)].map(m => [m[1], +m[2], +m[3]]);
  const row = items.map(([k, pw, ph]) => {
    const f = `${S}/${dir}/${sheet}_${k}.png`, [w, h] = dims(f), long = Math.max(pw, ph), k2 = long * PPM / (pw >= ph ? w : h);
    table += `| ${sheet} | ${k} | ${pw} x ${ph} | ${w} x ${h} | ${Math.round(w * k2)} x ${Math.round(h * k2)} |\n`;
    return { f, w: Math.round(w * k2), h: Math.round(h * k2) };
  });
  const rowH = Math.max(gh, ...row.map(r => r.h)) + 2 * G;
  let x = G; const base = y + rowH - G;
  placed.push({ f: gator, x, y: base - gh, w: gw, h: gh }); x += gw + 2 * G;
  for (const r of row) {
    if (x + r.w > 2600) { y += rowH; x = G; }  // wrap long rows
    placed.push({ f: r.f, x, y: y + rowH - G - r.h, w: r.w, h: r.h }); x += r.w + G;
  }
  W = Math.max(W, x); y += rowH;
}
const a = ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0x9aa0ad:s=${W}x${y}`]; let fc = '', last = '0:v';
placed.forEach((p, i) => { a.push('-i', p.f); fc += `[${i + 1}:v]scale=${p.w}:${p.h}:flags=lanczos,format=rgba[p${i}];[${last}][p${i}]overlay=${p.x}:${p.y}:format=auto[o${i}];`; last = `o${i}`; });
fc += `[${last}]scale=2400:-2,format=yuvj420p[out]`;
execFileSync('ffmpeg', [...a, '-filter_complex', fc, '-map', '[out]', '-frames:v', '1', '-q:v', '3', OUT]);
console.log(table + `\ncanvas ${W}x${y} -> ${OUT}`);
