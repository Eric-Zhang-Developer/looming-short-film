// node tools/check_timeline.ts [--file=path/to/timeline.ts]
// Fails on gaps, overlaps, total outside TARGET ±5 s, duplicate beat names, beats outside their shot.
// TARGET is the director's runtime: 3:47 (v9, docs/notes/v9-beats.md: the ending grows from an abrupt fade into a closing sequence,
// "I like this longer exit", 2026-10-20); 3:30 before (v8: "We can try to expand the time to 3 minutes 30 seconds", 2026-10-20; 3:24 from v7-s13: s13 grows 5 → 8 s under the v7 brief's "the director allows small timeline changes"; 3:21 from v6-stacks, he approved "Runtime goes to 3:21" for the stacks walk, 2026-10-18;
// was 3:15 from G4, 2026-10-15, and 180 before that).
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = process.argv.find((a) => a.startsWith('--file='));
const file = arg ? resolve(arg.slice(7)) : new URL('../src/timeline.ts', import.meta.url).pathname;
const { SHOTS, DURATION }: typeof import('../src/timeline.ts') = await import(pathToFileURL(file).href);

const errs: string[] = [];
const seen = new Map<string, string>();
const rows: string[] = [];
const E = 1e-6;
const TARGET = 227;
let end = 0;
for (const s of SHOTS) {
  if (s.start > end + E) errs.push(`gap: ${end}s to ${s.start}s before ${s.id}`);
  if (s.start < end - E) errs.push(`overlap: ${s.id} starts at ${s.start}s, previous shot ends at ${end}s`);
  end = s.start + s.duration;
  rows.push(`${s.id}  ${s.start.toFixed(1).padStart(6)} - ${end.toFixed(1).padStart(6)}`);
  for (const [name, tl] of Object.entries(s.beats)) {
    if (tl < 0 || tl > s.duration + E) errs.push(`beat ${name} (local ${tl}s) outside ${s.id} (0..${s.duration}s)`);
    if (seen.has(name)) errs.push(`duplicate beat name ${name} in ${seen.get(name)} and ${s.id}`);
    seen.set(name, s.id);
    rows.push(`        ${name.padEnd(20)} local ${tl.toFixed(1).padStart(5)}  global ${(s.start + tl).toFixed(1).padStart(6)}`);
  }
}
if (Math.abs(end - TARGET) > 5) errs.push(`total ${end}s is outside ${TARGET} ±5 s`);
if (DURATION !== end) errs.push(`DURATION ${DURATION} does not match end of last shot ${end}`);

console.log(rows.join('\n'));
if (errs.length) {
  console.error('\nFAIL\n' + errs.map((e) => '  ' + e).join('\n'));
  process.exit(1);
}
console.log(`\nok (${SHOTS.length} shots, ${seen.size} beats, ${end.toFixed(1)}s)`);
