// @ts-check
// node tools/determinism.mjs --page=<html> --t=0.5,4
// Renders each t, renders other times in between, renders it again, then loads a fresh page and renders it a third time.
// All hashes of a given t must match. Exits 1 on any mismatch.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { args, die, nums, ROOT, serve, launch, openPage, grab, toBuf } from './lib/page.mjs';

const pagePath = typeof args.page === 'string' ? args.page : 'index.html';
const ts = args.t ? nums(args.t) : die('usage: node tools/determinism.mjs --page=<html> --t=0.5,4');
if (ts.some(isNaN)) die('bad --t');
if (!fs.existsSync(path.join(ROOT, pagePath))) die(`page not found: ${pagePath}`);

const sha = async (page, t) => crypto.createHash('sha256').update(toBuf(await grab(page, t, 'png'))).digest('hex');
const { server, base } = await serve();
const browser = await launch();
const a = await openPage(browser, base, pagePath);
const first = [], again = [], fresh = [];
for (const t of ts) first.push(await sha(a, t));
for (const t of [...ts].reverse()) again.unshift(await sha(a, t));  // reversed order: state left by later frames must not leak
const b = await openPage(browser, base, pagePath);
for (const t of ts) fresh.push(await sha(b, t));
let ok = true;
ts.forEach((t, i) => {
  const same = first[i] === again[i] && first[i] === fresh[i];
  ok &&= same;
  console.log(`t=${t}  ${first[i].slice(0, 16)} ${again[i].slice(0, 16)} ${fresh[i].slice(0, 16)}  ${same ? 'PASS' : 'FAIL'}`);
});
console.log(ok ? 'determinism: PASS' : 'determinism: FAIL');
await browser.close(); server.close();
process.exit(ok ? 0 : 1);
