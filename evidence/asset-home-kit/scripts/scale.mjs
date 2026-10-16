import { execFileSync } from 'node:child_process';
import { writeFileSync, readdirSync } from 'node:fs';
const S = process.argv[2], OUT = process.argv[3], TABLE = process.argv[4];
const PPM = 1 / (0.030 / 130);           // gator sheet px per metre (gator.js: K = 0.030/130 m per figure px)
const dims = f => execFileSync('ffprobe', ['-v','error','-show_entries','stream=width,height','-of','csv=p=0', f], {encoding:'utf8'}).trim().split(',').map(Number);
// [file, row, 'h'|'w', metres]   scale 0.055 film m per real m (gator 0.096 m = 1.75 m student)
const H = 'home', K = 'kitchen';
const items = [
 [H,'door',1,'h',0.110],[H,'bookshelf',1,'h',0.099],[H,'bed_frame',1,'h',0.055],[H,'window_frame',1,'h',0.0715],[H,'desk',1,'h',0.0413],[H,'desk_chair',1,'h',0.0495],[H,'floor_lamp',1,'h',0.088],
 [H,'bed_mattress',2,'w',0.100],[H,'bed_blanket',2,'w',0.090],[H,'bed_pillow',2,'w',0.030],[H,'window_glass',2,'h',0.0595],[H,'blind_up',2,'w',0.0753],[H,'blind_down',2,'w',0.0753],[H,'laundry_pile',2,'h',0.0183],[H,'poster_a',2,'h',0.0385],[H,'poster_b',2,'h',0.022],[H,'laptop_screen',2,'h',0.012],[H,'laptop_base',2,'w',0.018],[H,'rug',2,'w',0.088],
 [K,'fridge_body',3,'h',0.0935],[K,'fridge_door',3,'h',0.0935],[K,'stove',3,'h',0.0605],[K,'sink',3,'h',0.066],[K,'counter_run',3,'h',0.0495],[K,'upper_cabinets',3,'h',0.0385],
 [K,'microwave',4,'h',0.0196],[K,'kettle',4,'h',0.01375],[K,'dish_rack',4,'w',0.02475],[K,'fruit_bowl',4,'w',0.0165],[K,'cereal_box',4,'h',0.0165],[K,'mug',4,'h',0.0055],[K,'jar',4,'h',0.011],
 [H,'wall_strip',5,'h',0.055],[H,'floor_strip',5,'h',0.055],[K,'backsplash_strip',5,'h',0.0275],[K,'wall_strip',5,'h',0.055],[K,'floor_strip',5,'h',0.055],
];
const gator = `${S}/best/gator/gator_sheet_turn_side.png`;
const rows = {1:[],2:[],3:[],4:[],5:[]};
let table = '| piece | kit | cut px (w x h) | film w x h (m) | w, h in gator-heights (0.096 m) | texel density vs gator sheet |\n|---|---|---|---|---|---|\n';
const entries = items.map(([kit,name,row,dim,m]) => {
  const f = `${S}/best/${kit}/${name}.png`, [w,h] = dims(f);
  const hm = dim==='h' ? m : m*h/w, wm = dim==='w' ? m : m*w/h;
  table += `| ${name} | ${kit} | ${w} x ${h} | ${wm.toFixed(4)} x ${hm.toFixed(4)} | ${(wm/0.096).toFixed(2)} x ${(hm/0.096).toFixed(2)} | ${(h/(hm*PPM)).toFixed(2)} |\n`;
  return {f,row,w:Math.round(wm*PPM),h:Math.round(hm*PPM),name};
});
writeFileSync(TABLE, table);
const [gw,gh] = dims(gator); // already at PPM scale
const G = 40; let inputs=[], chains=[], y=0, W=0, idx=1;
const rowH = {1:520,2:520,3:520,4:300,5:260};
const placed=[];
for (const r of [1,2,3,4,5]) {
  const base = y + rowH[r]; let x = G;
  if (r===1||r===3) { placed.push({f:gator,x,y:base-gh,w:gw,h:gh}); x += gw + G; }
  for (const e of entries.filter(e=>e.row===r)) { placed.push({f:e.f,x,y:base-e.h,w:e.w,h:e.h}); x += e.w + G; }
  W = Math.max(W,x); y += rowH[r] + 20;
}
const args=['-v','error','-y','-f','lavfi','-i',`color=c=0x9aa0ad:s=${W}x${y}`];
let fc='', last='0:v';
placed.forEach((p,i)=>{ args.push('-i',p.f); fc += `[${i+1}:v]scale=${p.w}:${p.h}:flags=lanczos,format=rgba[p${i}];[${last}][p${i}]overlay=${p.x}:${p.y}:format=auto[o${i}];`; last=`o${i}`; });
fc += `[${last}]scale=2400:-2,format=yuvj420p[out]`;
args.push('-filter_complex',fc,'-map','[out]','-frames:v','1','-q:v','3',OUT);
execFileSync('ffmpeg',args);
console.log(`canvas ${W}x${y} -> ${OUT}`);
