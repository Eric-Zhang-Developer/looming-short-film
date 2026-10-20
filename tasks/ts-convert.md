# Brief · ts-convert-* (one batch of files to strict TypeScript, changing no pixel and no sample)

**Type:** builder · **Branch:** `refactor/typescript` · **Model:** given at dispatch · **Time box:** about 2 hours.
**Read first:** `AGENTS.md`, `tsconfig.json`, `tsconfig.strict.json`, `tsconfig.build.json`, and the converted core as the pattern: `src/core/*.ts`, `src/timeline.ts`, `src/post.ts` (commit `8532bfc`). Your dispatch message names your batch: the files you convert.

## The director, verbatim
"I don't like the JavaScript there. It scares me." Approved: "full strict ... pause film work until it merges."

## The contract: types only
The film must render **bit-identical frames and audio** after your change. That is checked by hashes, not by reading diffs.
- `git mv` each file in your batch from `.js` to `.ts`, delete its `// @ts-check` line, and turn its JSDoc types into TypeScript annotations (`@param`/`@returns`/`@type`/`@typedef` → real types; casts `/** @type {X} */ (e)` → `e as X`). Keep every other comment.
- **No runtime change.** No new `if`/guards, no `??`/`?.` that wasn't there, no reordering, no changed defaults, no renamed or removed exports, no reformatting. A value that can't be null gets `!`. A gap in `@types/three` gets an `as` cast with a short comment.
- **Full strict, honestly:** no `@ts-ignore`, no `@ts-expect-error`, no `// @ts-nocheck`. `any` only where the value is genuinely untyped, each one with a one-line comment saying why. Prefer `unknown` plus a cast.
- `erasableSyntaxOnly`: no `enum`, `namespace`, parameter properties, or `import =`. Use `import type` for type-only imports (`verbatimModuleSyntax`).
- **Imports:** inside `.ts` files, import other `.ts` files with the `.ts` extension. For each file you rename, change its importers' specifiers from `'…/x.js'` to `'…/x.ts'` (that one token only) in `src/` and `tools/`. A `.ts` file may import **only `.ts` files**: if your file imports a `.js` file outside your batch, stop and say so under Gaps rather than converting the dependency.
- A legacy `.js` importer that stops type-checking because your new types are stricter than its JSDoc (as `src/audio/score.js` did with `beat()`): add the smallest JSDoc annotation in that importer to fix it, and list it in the done note.
- `film.js` keeps its dynamic `import(\`./shots/${id}.js\`)`: the build emits `.js`, and nothing type-checks that template.

## Proof (all required, in this order, after your last code commit)
1. `npm run -s typecheck` → no errors (both configs).
2. `node src/core/selftest.ts` passes. If your batch touches audio: `node src/audio/selftest.(js|ts)` passes, and its output (minus the `wrote …` line) matches `evidence/ts-refactor/baseline_selftest.txt`.
3. `node tools/mix.mjs` → `out/audio/mix.wav`'s sha256 (the last line it prints) equals the first hash in `evidence/ts-refactor/baseline_audio.txt` (`9801f685…`).
4. `node tools/check_timeline.mjs` ok.
5. `node tools/hashes.mjs --check=evidence/ts-refactor/baseline.json` → `hashes: PASS (240 frames identical)`. About 8 minutes; one Chrome. A FAIL means a runtime change slipped in: find it and fix it. Never update the baseline.
Save the outputs to `evidence/ts-convert-<batch>/proof.txt`.

## Owns
The files in your batch (as `.ts`), the import specifiers that point at them, any minimal JSDoc fix in a legacy importer, `evidence/ts-convert-<batch>/`, `done/ts-convert-<batch>.md`.
**Not yours:** any other file's code, the tsconfigs, `package.json`, the baseline, the docs.

## Machine and git
You're in a fresh git worktree. First: `git log --oneline -1 refactor/typescript`; if your HEAD isn't at or after it, `git reset --hard refactor/typescript`. Then `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`; `mkdir -p assets/raw/reels && cp /Users/ericzhang/code/media/looming/assets/raw/reels/*.mp3 assets/raw/reels/` (the mix needs the clips to match the baseline). Never commit those.
One headless Chrome at a time. Before the hash run, wait until `sysctl vm.swapusage` shows at least 1 GB free (another builder runs beside you). Commit in small groups with messages that argue the decision; no `Co-Authored-By:` or `Claude-Session:` trailers. Don't push or merge. Write `done/ts-convert-<batch>.md` last (from `templates/done-note.md`, ending with `## Story`). Report your branch name and last commit at the end.
