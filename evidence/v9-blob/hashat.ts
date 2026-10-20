// tools/hashes.ts at chosen times only, so the proof fits the memory rule (a few shots per Chrome, not the whole film).
//   node evidence/v9-blob/hashat.ts --t=a,b,c --out=<file.json>     add these frames' hashes to <file.json>
//   node evidence/v9-blob/hashat.ts --t=a,b,c --check=<file.json>   compare against <file.json> where it has the time
// Same grab and hash as tools/hashes.ts (PNG, sha256, one page, ascending order).
import crypto from 'node:crypto';
import fs from 'node:fs';
import { args, die, nums, serve, launch, openPage, grab, toBuf } from '../../tools/lib/page.ts';

const ts = args.t ? nums(args.t).sort((a, b) => a - b) : die('need --t');
const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'index.html');
const got: Record<string, string> = {};
for (const t of ts) got[t] = crypto.createHash('sha256').update(toBuf(await grab(page, t, 'png'))).digest('hex');
await browser.close(); server.close();

if (typeof args.out === 'string') {
  const prev = fs.existsSync(args.out) ? JSON.parse(fs.readFileSync(args.out, 'utf8')) : {};
  fs.writeFileSync(args.out, JSON.stringify({ ...prev, ...got }, null, 1) + '\n');
  console.log(`wrote ${ts.length} hashes to ${args.out}`);
}
if (typeof args.check === 'string') {
  const want: Record<string, string> = JSON.parse(fs.readFileSync(args.check, 'utf8'));
  let bad = 0, n = 0;
  for (const t of ts.map(String)) {
    if (!(t in want)) { console.log(`t=${t}  not in ${args.check}`); continue; }
    n++; if (want[t] !== got[t]) bad++;
    console.log(`t=${t}  want ${want[t].slice(0, 16)}  got ${got[t].slice(0, 16)}  ${want[t] === got[t] ? 'same' : 'DIFF'}`);
  }
  console.log(bad ? `hashes: FAIL (${bad} of ${n} differ)` : `hashes: PASS (${n} frames identical)`);
}
