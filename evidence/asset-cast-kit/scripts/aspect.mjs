// usage: node aspect.mjs  -> table of each named box's w/h vs the src/assets.js PIECES w/h (ratio of ratios; 1.00 = exact)
import { readFileSync, readdirSync } from 'node:fs';
const src = readFileSync('src/assets.js', 'utf8');
const P = {};
for (const sheet of ['roommates_sheet', 'custodian_sheet', 'crowd_sheet', 'top_figures_sheet']) {
  const body = src.match(new RegExp(`${sheet}: \\{([\\s\\S]*?)\\n  \\},?\\n`))[1];
  for (const m of body.matchAll(/(\w+): \[([\d.]+), ([\d.]+),/g)) P[`${sheet}_${m[1]}`] = [+m[2], +m[3]];
}
const dir = 'evidence/asset-cast-kit';
let out = '| variant | piece | cut w x h (box, padded) | box w/h | PIECES w/h | off by |\n|---|---|---|---|---|---|\n';
for (const f of readdirSync(dir).filter(f => f.endsWith('.named.json')).sort()) {
  const v = f.replace('.named.json', ''), b = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  let worst = 0;
  for (const [k, [, , w, h]] of Object.entries(b)) {
    const want = P[k][0] / P[k][1], got = w / h, off = got / want;
    worst = Math.max(worst, Math.abs(Math.log(off)));
    out += `| ${v} | ${k.replace(/^[a-z_]*?sheet_/, '')} | ${w} x ${h} | ${got.toFixed(2)} | ${want.toFixed(2)} | ${off.toFixed(2)}x |\n`;
  }
  out += `| ${v} | **worst** | | | | ${Math.exp(worst).toFixed(2)}x |\n`;
}
console.log(out);
