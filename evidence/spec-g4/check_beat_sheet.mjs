// node evidence/spec-g4/check_beat_sheet.mjs: every "**m:ss · sNN" or "(m:ss · sNN)" entry in doc 02's beat sheet starts where src/timeline.js starts that shot.
import { readFileSync } from 'node:fs';
import { SHOTS } from '../../src/timeline.js';
const md = readFileSync(new URL('../../docs/02-story.md', import.meta.url), 'utf8');
const seen = new Map([...md.matchAll(/(?:\*\*|\()(\d):(\d\d) · (s\d\d[a-z]?)\b/g)].map((m) => [m[3], +m[1] * 60 + +m[2]]));
let bad = 0;
for (const s of SHOTS) {
  const t = seen.get(s.id);
  const ok = t === s.start;
  if (!ok) bad++;
  console.log(`${s.id.padEnd(5)} timeline ${String(s.start).padStart(3)} s   doc 02 ${t === undefined ? 'missing' : String(t).padStart(3) + ' s'}${ok ? '' : '   <- differs'}`);
}
const end = SHOTS.at(-1).start + SHOTS.at(-1).duration;
const endInDoc = /\*\*3:15\*\* Black/.test(md);
console.log(`end ${end} s; doc 02 ends "3:15 Black": ${endInDoc}`);
if (bad || !endInDoc || end !== 195) { console.log('FAIL'); process.exit(1); }
console.log('PASS: 21 shots, doc 02 and the timeline agree');
