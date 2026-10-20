# Done · ts-convert-shots-a

## What shipped
Eleven shot files are now strict TypeScript: `src/shots/s01.ts`, `s02.ts`, `s04.ts`, `_template.ts`, `s00.ts`,
`s03.ts`, `s05.ts`, `s06.ts`, `s07.ts`, `s08.ts` and `s09a.ts`. Each was converted bottom-up, so every commit imports
only `.ts` from `.ts`. The changes are types only. The emitted JS differs from 629d7ce only by redundant parentheses,
and the mix and the frame hashes match the baseline.

## Where it lives
Branch `worktree-agent-ae4ca9559e7f54433`, cut from `refactor/typescript` at 629d7ce. Not pushed or merged. There is one
commit per dependency layer, and each one type-checks on its own (I ran `npm run -s typecheck` on each tree before
committing it). The specifiers in shots not yet converted were moved forward in the same commit as the file they
point at.
- `71c4581` s01, s02, s04, _template (plus the `./s02.ts` specifier in s00, s03, s05, s06, s07, s17b, s17c, s18)
- `e5c350e` s00, s03, s05 (plus `./s03.ts` in s06, s07, s09a)
- `4a0a773` s06, s07 (plus `./s07.ts` in s08, s09a)
- `8466a45` s08 (plus `./s08.ts` in s09a)
- `27b039d` s09a
- the last commit: `evidence/ts-convert-shots-a/` and this note

## How it was checked
All output is in `evidence/ts-convert-shots-a/proof.txt`. These were run after the last code commit (27b039d), in the brief's order.
- [x] `npm run -s typecheck` → no errors in either config (exit 0)
- [x] `node src/core/selftest.ts` → `selftest: all passed`. Audio selftest: not run, because this batch touches no audio file.
- [x] `node tools/mix.ts` → `9801f68535b73559936b6c221e7c3b7dd361c1c8c39624ab0331b318896f51d2`, equal to the first hash in `evidence/ts-refactor/baseline_audio.txt`
- [x] `node tools/check_timeline.ts` → `ok (22 shots, 77 beats, 204.0s)`
- [x] `node tools/hashes.ts --check=evidence/ts-refactor/baseline.json` → `hashes: PASS (240 frames identical)`, exit 0. Run 23:51:50–23:58:52, started with 1128 MB of swap free and no other puppeteer Chrome running. The page logged 4 resource 404s (the unfrozen kits' `boxes.json`, which fall back to proxies by design); `proof.txt` leaves those lines out.
- [x] Extra, covering every line and not just the 240 frames: I compiled 629d7ce's `src/` and this branch's `src/` with
  `tsconfig.build.json --removeComments` (as ESM, with the repo's `package.json`) and diffed the `build/` trees
  (`evidence/ts-convert-shots-a/emit_diff.txt`, 99 lines). Every difference is a redundant pair of parentheses left by a
  JSDoc cast (`([…])` → `[…]`, `(KEYS)` → `KEYS`, `(shade.children[0]).material` → `shade.children[0].material`).
  s00, s01, s04, _template, s17b, s17c and s18 emit byte-identical JS, and no token of logic moved.
- [x] `grep` over the 11 files: no `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, no `any`, and no JSDoc type tags left.

## Legacy importers touched
Specifier changes only (`'./s02.js'` → `'./s02.ts'`, one token each): `src/shots/s17b.js`, `s17c.js` and `s18.js`. None needed a
JSDoc fix. The legacy program type-checks clean against the new `s02.ts` types: DESK's `hip`, `lampMouth` and `bead` are
`Vec3`, which is what s18's spreads already expected.

## Gaps
- **`any`: none.** Where the old JSDoc used `any`, there is now a real type:
  - s03's `/** @type {any} */ (deg < 30)` (arithmetic on a boolean) is `(deg < 30) as unknown as number`. It emits the same `(deg < 30)`.
  - s04's `inFridge(o: any, …)` takes `ReturnType<typeof prop>`.
  - s01's and s05's `[mat: string]: any` rest options are `& MatOpts` (paperMesh's own option type).
- **`ShotCtx` is declared in `s02.ts`, not `film.ts`.** Every shot's `build(ctx)` needs the type, and `film.ts` makes the
  context, so that is where it belongs. `film.ts` isn't this task's, so the type is exported from `s02.ts`, the shared root of the home
  shots, along with `Palette`, `MatOpts`, `Tools` and `Cut`. s01, s04 and _template import it as `import type` (erased:
  no runtime edge). It lists only what shots read (scene, camera, assets, PALETTE, post); film also passes stage and
  renderer. Batch B (s09b…s17) will need the same type. Whoever owns `film.ts` could move it there and re-export it.
- **A cast that works around another module's type:** s07 calls `exam.silhouette({ color: PALETTE.phone as string as Palette['ink'] })`.
  `blob.ts` infers `silhouette()`'s `color` parameter from its default, `PALETTE.ink` on a frozen object, as the literal
  `'#0A0A0F'`, so no other colour type-checks. The real fix is `color = PALETTE.ink as string` (or an annotation) in
  `blob.ts`, which is a contract file and not this task's.
- **Assertions where the code builds a value in steps.** A rewrite would be a runtime change, so these are typed with assertions:
  - `DESK` is `as Desk`, a written-out type, because `lampMouth`, `bead`, `cal.h` and `cal.friXY` are assigned after the literal.
    `ROOM.CAL` in s07 is cast the same way, on its own literal.
  - `seatReach`'s and s04 `reachTo`'s `best!`: the loops always run.
  - `h!` in the two `cut()`s: a null width implies a height.
  - `getContext('2d')!`, `m.parent!` (s05's piece group), `gator.hand!`/`rig.hand!` (side rigs have arm_r),
    `round.hand!`/`tall.hand!`, `wk.hip!` ('side' is a legged walk set), `at!` (the glint shows only when `at` is set), and
    `q.d!` (set for every ink pixel before the drip runs), `SHOTS.find(…)!` in the template.
  - `KNEE.map(…) as Vec3` and `CAM.toArray() as Vec3`: map() and @types/three's no-argument `toArray()` return `number[]`.
- **Types I chose where the JSDoc was silent:**
  - `examAt` returns a discriminated `ExamState` (`space: 'page' | 'fall' | 'desk'`), which needed `space: 'desk' as const` on the shared `land` object.
  - The camera tables are annotated with the global `CamKey`.
  - Several loop tables got tuple annotations: s01's sky bands (`as [string, string, number, number, number][]`), s04's `BLOB` keys, s07's `GLANCE`.
- **Stale comments kept on purpose.** The brief says to keep every comment, so several still name `.js` files.
  `_template.ts` still says "Copy to sNN.js", and s00, s03 and s06 still say "s02.js's unit".
- **Setup (not committed):** the `node_modules` symlink, `assets/cut/*.png` and `assets/raw/reels/*.mp3` copied from the main
  checkout, as the brief says.
- **Swap and Chrome wait:** the hash run waited about 5 minutes (23:46:44 to 23:51:42) for another builder's puppeteer Chrome to exit. My first wait loop never could have finished: its `pgrep -f` pattern matched the loop's own shell command line. I killed it after a minute and restarted it with `backgroundin[g]` in the pattern so it can't match itself. The long-lived headless Chrome on port 9333 was left alone.

## Story
The brief asked for types only, proven by hashes, and the dispatch gave the order: s02 first, since nearly every
home shot builds on its desk unit. Before touching anything I had to decide where the build() context type lives.
`film.ts` makes the context and calls it "untyped", but it isn't mine. So `ShotCtx` went into `s02.ts`, and I flagged it
for whoever owns film.

The conversion itself was mechanical and driven by the strict compiler. s02 started at 143 errors, s04 at 107. I wrote
each file's edits as exact find-and-replace pairs and applied them with a small script that refuses any pair that doesn't
match exactly once. That kept the diffs to annotations, with nothing reflowed. The surprises were types other modules
had inferred too tightly. `blob.ts`'s `silhouette()` would only accept the colour ink, because its default is a
literal from a frozen palette. And a JSDoc `any` on `2 * (deg < 30)` turned out to need no `any` at all.

I had renamed all eleven files up front, so at first only the final tree type-checked. I rebuilt the history as five
layered commits instead, laying each one out from HEAD's `.js` files with only the specifiers moved and running the
typecheck on each tree before committing it. Then, to cover more than 240 frames, I compiled the old and new `src/` and
diffed the JS. The first diff was 513 lines of renamed `require` bindings: my scratch copy had no `package.json`, so tsc
emitted CommonJS. With the repo's `"type": "module"` copied in, it came to 99 lines, all of them parentheses.

One honest stumble: my first wait loop for the shared Chrome matched its own command line and would have waited forever.
I caught it on the first status check. The hash run then passed on all 240 frames.

## State
built · 2026-10-19
