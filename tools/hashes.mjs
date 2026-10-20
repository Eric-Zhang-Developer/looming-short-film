// @ts-check
// node tools/hashes.mjs --out=<file.json>        hash the film's frames at every whole second and every beat
// node tools/hashes.mjs --check=<file.json>      hash the same times and compare; exits 1 on any difference
// The proof for refactors that must not change a pixel (the TypeScript pass): one page, the times in ascending
// order every run, so even order-dependent frames (s09a around 74 s) come out the same as long as nothing changed.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { args, die, serve, launch, openPage, grab, toBuf } from './lib/page.mjs';
import { SHOTS, DURATION } from '../src/timeline.ts';

const out = typeof args.out === 'string' ? args.out : null, check = typeof args.check === 'string' ? args.check : null;
if (!out === !check) die('usage: node tools/hashes.mjs --out=<file.json> | --check=<file.json>');
const ts = [...new Set([...Array.from({ length: Math.floor(DURATION) }, (_, i) => i),
  ...SHOTS.flatMap((s) => Object.values(s.beats).map((b) => +(s.start + b).toFixed(4)))])].sort((a, b) => a - b);

const { server, base } = await serve();
const browser = await launch();
const page = await openPage(browser, base, 'index.html');
/** @type {Record<string, string>} */
const got = {};
for (const t of ts) got[t] = crypto.createHash('sha256').update(toBuf(await grab(page, t, 'png'))).digest('hex');
await browser.close(); server.close();

if (out) { fs.writeFileSync(out, JSON.stringify(got, null, 1) + '\n'); console.log(`wrote ${ts.length} frame hashes to ${out}`); process.exit(0); }
const want = JSON.parse(fs.readFileSync(/** @type {string} */ (check), 'utf8'));
const bad = Object.keys(want).filter((t) => want[t] !== got[t]);
for (const t of bad) console.log(`t=${t}  want ${want[t].slice(0, 16)}  got ${(got[t] ?? 'missing').slice(0, 16)}`);
console.log(bad.length ? `hashes: FAIL (${bad.length} of ${Object.keys(want).length} differ)` : `hashes: PASS (${Object.keys(want).length} frames identical)`);
process.exit(bad.length ? 1 : 0);
