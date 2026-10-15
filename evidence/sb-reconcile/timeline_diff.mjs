// node evidence/sb-reconcile/timeline_diff.mjs <before.js> <after.js>
// Proves the sb-reconcile change is additive: same shots, starts, durations and old beat times; lists new beats.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const [a, b] = await Promise.all(process.argv.slice(2, 4).map((f) => import(pathToFileURL(resolve(f)))));
let bad = 0;
const say = (ok, m) => { if (!ok) bad++; console.log((ok ? 'same ' : 'DIFF ') + m); };
say(a.SHOTS.length === b.SHOTS.length && a.DURATION === b.DURATION, `shot count ${b.SHOTS.length}, DURATION ${b.DURATION}`);
const added = [];
a.SHOTS.forEach((s, i) => {
  const t = b.SHOTS[i];
  say(s.id === t.id && s.start === t.start && s.duration === t.duration, `${s.id} start ${t.start} duration ${t.duration}`);
  for (const [k, v] of Object.entries(s.beats)) say(t.beats[k] === v, `  ${k} @ ${v}`);
  for (const [k, v] of Object.entries(t.beats)) if (!(k in s.beats)) added.push(`${t.id}.${k} @ ${v} (global ${t.start + v})`);
});
console.log(`\nnew beats (${added.length}):\n  ` + added.join('\n  '));
console.log(bad ? `\nFAIL: ${bad} differences` : '\nPASS: no shot boundary or existing beat moved');
process.exit(bad ? 1 : 0);
