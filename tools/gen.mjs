#!/usr/bin/env node
// Doc 08 loop for one asset: assemble the five-block prompt, run `codex exec` once per variant
// in a fresh temp dir, copy each image into assets/raw/, write a thumb + sidecar, print a contact sheet.
//   node tools/gen.mjs --asset=<name> [--variants=N] [--dry-run]
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdtempSync, copyFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CAP_DEFAULT = 8; // doc 08: at most 8 generations per asset; a spec's "cap" overrides it (director raised style_tile to 12 at G1)
const RAW = join(ROOT, 'assets/raw'), THUMBS = join(RAW, 'thumbs');

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const die = msg => { console.error(`gen: ${msg}`); process.exit(1); };
if (!args.asset) die('usage: node tools/gen.mjs --asset=<name> [--variants=N] [--dry-run]');

const spec = JSON.parse(readFileSync(join(ROOT, 'assets/specs.json'), 'utf8')).find(a => a.name === args.asset);
if (!spec) die(`no asset "${args.asset}" in assets/specs.json`);
const name = spec.name;
const CAP = spec.cap ?? CAP_DEFAULT;
const version = spec.prompt.match(/\.v(\d+)\.md$/)?.[1] ?? die(`prompt path must end in .vN.md: ${spec.prompt}`);
const variants = Number(args.variants ?? spec.variants ?? 3);
if (!(variants >= 1)) die(`bad --variants: ${args.variants}`);

// Cap: count every generation this asset has, from local raw PNGs and committed sidecars
// (raw/ is gitignored, so sidecars keep the count honest across worktrees).
const isMine = f => new RegExp(`^${name}_v\\d+(_\\d+)?\\.(png|json)$`).test(f);
const ls = d => existsSync(d) ? readdirSync(d) : [];
const outputs = new Set([...ls(RAW), ...ls(THUMBS)].filter(isMine).map(f => f.replace(/\.(png|json)$/, '')));
// One Codex call can generate several images, so count codex_images_generated from each sidecar (1 when absent).
const gens = o => { try { return JSON.parse(readFileSync(join(THUMBS, `${o}.json`), 'utf8')).codex_images_generated ?? 1; } catch { return 1; } };
const used = [...outputs].reduce((n, o) => n + gens(o), 0);
if (used + variants > CAP)
  die(`REFUSED: ${name} already has ${used} of ${CAP} generations; ${variants} more would exceed the cap. ` +
      `Doc 08: rethink the spec instead of re-rolling.\n  existing: ${[...outputs].sort().map(o => `${o} (${gens(o)})`).join(', ') || 'none'}`);

// Prompt: shared blocks 1, 2, 4 plus the asset file's "## 3." block and optional "## 5." notes block.
// A per-asset file with no numbered headings is taken whole as block 3.
const block = f => readFileSync(join(ROOT, 'assets/prompts/_blocks', f), 'utf8').trim();
const assetText = readFileSync(join(ROOT, spec.prompt), 'utf8');
const section = n => assetText.match(new RegExp(`^## ${n}\\..*?(?=^## \\d\\.|(?![\\s\\S]))`, 'ms'))?.[0].trim();
const assetBlock = section(3) ?? assetText.replace(/^# .*\n/, '').trim();
const key = spec.key ?? { name: 'green', hex: '#00FF00' };
const technical = block('technical.md').replaceAll('{KEYNAME}', key.name).replaceAll('{KEYHEX}', key.hex);
const prompt = [block('style.md'), block('lighting.md'), assetBlock, technical, section(5)].filter(Boolean).join('\n\n');
const OUT_LINE = 'Generate exactly one image. Save it as `out.png` in the current working directory (the workspace root).';
const runPrompt = `${prompt}\n\n## Output\n\n${OUT_LINE}\n`;

// reference-videos/ is gitignored and lives only in the main checkout, so resolve it there
// (parent of the shared .git dir); every other ref resolves in this tree.
const MAIN = resolve(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'],
  { cwd: ROOT, encoding: 'utf8' }).trim(), '..');
const refs = spec.refs.map(r => resolve(r.startsWith('reference-videos/') ? MAIN : ROOT, r));
const codexArgs = run => ['exec', '-C', run, '-s', 'workspace-write', '--json', '--skip-git-repo-check',
  '-o', join(run, 'last_message.txt'), ...refs.flatMap(r => ['-i', r]), '-'];
const q = s => s.includes('$RUN') ? `"${s}"` : /^[\w./=-]+$/.test(s) ? s : `'${s.replaceAll("'", "'\\''")}'`;
const firstK = Math.max(0, ...[...outputs].map(o => +(o.match(new RegExp(`^${name}_v${version}_(\\d+)$`))?.[1] ?? 0))) + 1;

if (args['dry-run']) {
  console.log(`# gen.mjs dry run · ${name} · prompt v${version} · ${variants} variant(s) · ${used}/${CAP} used`);
  for (const r of refs) if (!existsSync(r)) console.log(`# WARNING: ref missing: ${r} (a live run refuses)`);
  console.log('\n## Assembled prompt (piped on stdin)\n');
  console.log(runPrompt);
  console.log('## Commands (one per variant, each in its own fresh temp dir)\n');
  for (let k = firstK; k < firstK + variants; k++) {
    console.log(`RUN=$(mktemp -d "${tmpdir()}/looming-gen-XXXXXX")`);
    console.log(`codex ${codexArgs('$RUN').map(q).join(' ')} < <assembled prompt> > "$RUN/events.jsonl"`);
    console.log(`#   then copy the new image to assets/raw/${name}_v${version}_${k}.png, thumb + sidecar to assets/raw/thumbs/\n`);
  }
  process.exit(0);
}

for (const r of refs) if (!existsSync(r)) die(`ref missing: ${r}`);
mkdirSync(THUMBS, { recursive: true });
const sha = f => createHash('sha256').update(readFileSync(f)).digest('hex');
const refInfo = refs.map(r => ({ file: spec.refs[refs.indexOf(r)], sha256: sha(r) }));
const thumbs = [];

for (let k = firstK; k < firstK + variants; k++) {
  const stem = `${name}_v${version}_${k}`;
  const run = mkdtempSync(join(tmpdir(), 'looming-gen-'));
  const start = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  console.log(`[${stem}] codex exec in ${run}`);
  const res = spawnSync('codex', codexArgs(run), { input: runPrompt, encoding: 'utf8', maxBuffer: 1 << 28 });
  const end = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  writeFileSync(join(run, 'events.jsonl'), res.stdout ?? '');
  const images = ls(run).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  if (res.status !== 0 || images.length !== 1) {
    console.error(`[${stem}] FAILED: exit ${res.status}, ${images.length} image(s) in ${run}; events in ${run}/events.jsonl\n${res.stderr ?? ''}`);
    continue;
  }
  const src = join(run, images[0]), dst = join(RAW, `${stem}.png`), thumb = join(THUMBS, `${stem}.jpg`);
  copyFileSync(src, dst);
  const events = (res.stdout ?? '').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return {}; } });
  const [probe] = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,pix_fmt', '-of', 'json', dst], { encoding: 'utf8' })).streams;
  // ≤1024 px JPEG, alpha flattened over white (as in wave 1's style_tile_v1.jpg)
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', dst, '-filter_complex',
    "[0]scale='min(1024,iw)':'min(1024,ih)':force_original_aspect_ratio=decrease,format=rgba[f];color=white,format=rgba[w];[w][f]scale2ref[w2][f2];[w2][f2]overlay=format=auto,format=yuvj444p",
    '-frames:v', '1', '-q:v', '3', thumb]);
  thumbs.push(thumb);
  const raw = res.stdout ?? '';
  writeFileSync(join(THUMBS, `${stem}.json`), JSON.stringify({
    output: `assets/raw/${stem}.png`,
    prompt_file: spec.prompt,
    prompt_blocks: ['assets/prompts/_blocks/style.md', 'assets/prompts/_blocks/lighting.md', spec.prompt, 'assets/prompts/_blocks/technical.md'],
    run_time_prompt_addition: `## Output\n\n${OUT_LINE}`,
    references: refInfo,
    model: 'unknown (Codex image_gen)',
    model_note: 'The image_gen call does not appear in the --json event stream, so the model name is not reported.',
    codex_thread_id: events.find(e => e.type === 'thread.started')?.thread_id ?? null,
    // Codex sometimes re-rolls inside one call; the copied image is the last one it names, and every
    // distinct image is a generation the 8-cap's file count can't see.
    codex_source_file: [...raw.matchAll(/[~\w/.-]*generated_images\/[\w/.-]+\.png/g)].at(-1)?.[0] ?? null,
    codex_images_generated: new Set(raw.match(/generated_images\/[\w/.-]+\.png/g) ?? []).size,
    codex_run_dir: run,
    copied_into_workspace_by: `gen.mjs (copied ${images[0]} out of the Codex temp dir)`,
    usage: events.findLast(e => e.type === 'turn.completed')?.usage ?? null,
    timestamp_start_utc: start,
    timestamp_end_utc: end,
    output_sha256: sha(dst),
    width: probe.width,
    height: probe.height,
    pixel_format: probe.pix_fmt,
    thumbnail: `assets/raw/thumbs/${stem}.jpg`,
    screening: null, // Claude fills this in after viewing (doc 08 step 4)
  }, null, 2) + '\n');
  console.log(`[${stem}] -> ${dst}`);
}

if (!thumbs.length) die('no variant produced an image');
const contact = join(THUMBS, `${name}_v${version}_contact.jpg`);
if (thumbs.length === 1) copyFileSync(thumbs[0], contact);
else execFileSync('ffmpeg', ['-v', 'error', '-y', ...thumbs.flatMap(t => ['-i', t]), '-filter_complex',
  thumbs.map((_, i) => `[${i}]scale=-2:400[s${i}]`).join(';') + ';' + thumbs.map((_, i) => `[s${i}]`).join('') + `hstack=inputs=${thumbs.length}`,
  '-q:v', '3', contact]);
console.log(`contact sheet: ${contact} (${thumbs.length} of ${variants} variants)`);
