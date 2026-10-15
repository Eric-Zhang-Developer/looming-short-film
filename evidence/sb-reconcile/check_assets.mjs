// node evidence/sb-reconcile/check_assets.mjs
// Checks docs/assets.md against every docs/shots/sNN.md "Assets needed" section:
// every name a shot uses exists in assets.md, every frozen asset is used by >= 1 shot,
// the Shots column matches actual use, and the frozen total (plus the style tile) is <= 35.
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../../', import.meta.url).pathname;
const md = readFileSync(root + 'docs/assets.md', 'utf8');
const section = (s, head) => s.slice(s.indexOf(head), s.indexOf('\n## ', s.indexOf(head) + 1));
const expand = (cell) => cell.split(',').flatMap((p) => {
  const m = p.trim().match(/^s(\d\d)(?:–s(\d\d))?$/);
  if (!m) return [];
  const a = +m[1], b = m[2] ? +m[2] : a;
  return Array.from({ length: b - a + 1 }, (_, i) => 's' + String(a + i).padStart(2, '0'));
});

const frozen = new Map();
for (const line of section(md, '## Frozen assets').split('\n')) {
  const m = line.match(/^\| \d+ \| `([a-z_]+)` \| [^|]+ \| [^|]+ \| ([^|]+) \|/);
  if (m) frozen.set(m[1], expand(m[2]));
}
const procedural = new Map();
for (const line of section(md, '## Procedural pieces').split('\n')) {
  const m = line.match(/^\| `([a-z_]+)` \| [^|]+ \| ([^|]+) \|/);
  if (m) procedural.set(m[1], expand(m[2]));
}

const errs = [];
const used = { F: new Map(), P: new Map() };
const shots = readdirSync(root + 'docs/shots').filter((f) => /^s\d\d\.md$/.test(f)).sort();
for (const f of shots) {
  const id = f.slice(0, 3);
  const s = readFileSync(root + 'docs/shots/' + f, 'utf8');
  const a = s.slice(s.indexOf('## Assets needed'), s.indexOf('## Matching'));
  if (a.length < 20) errs.push(`${id}: no Assets needed section`);
  for (const line of a.split('\n')) {
    const kind = line.startsWith('- Frozen') ? 'F' : line.startsWith('- Procedural') ? 'P' : null;
    if (!kind) continue;
    for (const [, name] of line.matchAll(/`([a-z_]+)`/g)) {
      const table = kind === 'F' ? frozen : procedural;
      if (!table.has(name)) errs.push(`${id}: ${kind === 'F' ? 'frozen' : 'procedural'} name \`${name}\` is not in docs/assets.md`);
      if (!used[kind].has(name)) used[kind].set(name, []);
      used[kind].get(name).push(id);
    }
  }
}

const report = (kind, table) => {
  for (const [name, listed] of table) {
    const actual = used[kind].get(name) ?? [];
    if (!actual.length) errs.push(`\`${name}\` is used by no shot`);
    const same = listed.join() === actual.join();
    if (!same) errs.push(`\`${name}\` Shots column ${listed.join(' ')} != actual ${actual.join(' ')}`);
    console.log(`${kind} ${name.padEnd(26)} ${actual.join(' ')}${same ? '' : '   <- column differs'}`);
  }
};
report('F', frozen);
report('P', procedural);

const total = frozen.size + 1; // + style_tile (reference, not in a shot)
console.log(`\nfrozen in shots: ${frozen.size}; + style_tile = ${total} (cap 35); procedural: ${procedural.size}; shots checked: ${shots.length}`);
if (total > 35) errs.push(`frozen total ${total} > 35`);
if (errs.length) { console.error('\nFAIL\n  ' + errs.join('\n  ')); process.exit(1); }
console.log('PASS');
