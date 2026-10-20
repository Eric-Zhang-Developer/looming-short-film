import { readFileSync, writeFileSync } from 'node:fs';
const [,, file, kit, out, W0, H0] = process.argv;
const NAMES = { home: [['bed_frame','bed_mattress','bed_blanket','bed_pillow','door'],['bookshelf','window_frame','window_glass','blind_up','blind_down'],['desk','desk_chair','floor_lamp','laundry_pile','poster_a','poster_b'],['laptop_screen','laptop_base','rug','wall_strip','floor_strip']],
 kitchen: [['fridge_body','fridge_door','stove','sink','counter_run'],['upper_cabinets','microwave','kettle','dish_rack','fruit_bowl'],['backsplash_strip','wall_strip','floor_strip'],['cereal_box','mug','jar']] }[kit];
const b = Object.values(JSON.parse(readFileSync(file,'utf8')));
const byY = b.map(r=>({r,cy:r[1]+r[3]/2})).sort((a,c)=>a.cy-c.cy).map(o=>o.r);
// rows: split by the row sizes, then sort each by x
let i=0; const res={};
for (const row of NAMES){ const g = byY.slice(i,i+row.length).sort((a,c)=>a[0]-c[0]); i+=row.length; g.forEach((r,j)=>res[row[j]]=r); }
writeFileSync(out, JSON.stringify(res,null,1)+'\n');
// gaps
const e=Object.entries(res); let minGap=1e9, who='';
for(let a=0;a<e.length;a++)for(let c=a+1;c<e.length;c++){const [n1,[x,y,w,h]]=e[a],[n2,[X,Y,W,H]]=e[c];const dx=Math.max(X-(x+w),x-(X+W),0),dy=Math.max(Y-(y+h),y-(Y+H),0);const g=Math.hypot(dx,dy);if(g<minGap){minGap=g;who=n1+' / '+n2;}}
const edge=Math.min(...e.map(([n,[x,y,w,h]])=>Math.min(x,y,+W0-(x+w),+H0-(y+h))));
console.log(`${out}: ${e.length} named, min gap between boxes ${minGap.toFixed(0)} px (${who}), min edge margin ${edge} px`);
for(const [n,r] of e) console.log(n.padEnd(15), r.join(' '));
