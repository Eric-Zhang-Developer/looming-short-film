# Done · ts-convert-shots-c

## What shipped
The last five shots are now strict TypeScript: `src/shots/s17b.ts`, `s17c.ts`, `s15.ts`, `s16.ts` and `s18.ts`. No `.js`
file is left under `src/`: `git ls-files 'src/*.js' 'src/**/*.js'` prints nothing. The changes are types only. The
frames, the mix and the emitted JS are unchanged, apart from the redundant parentheses the old JSDoc casts left behind.

## Where it lives
Branch `worktree-agent-ae9a70f8b30756ab9`, reset to `refactor/typescript` at 49e66fb. Not pushed or merged.
- `7cba5b2`: s17b and s17c, plus the `./s17b.js` → `./s17b.ts` specifier in s15.js, s16.js and s18.js.
- `c697288`: s15 and s16, plus the `./s15.js` → `./s15.ts` specifier in s16.js.
- `b264929`: s18.
- The last commit: `evidence/ts-convert-shots-c/` and this note.

I checked each intermediate commit's tree on its own (`git archive` into a scratch dir, `npm run -s typecheck` → exit 0
for 7cba5b2 and c697288).

## How it was checked
All output is in `evidence/ts-convert-shots-c/proof.txt`. Everything ran after b264929, in the brief's order.
- [x] `npm run -s typecheck` → no errors in either config (exit 0)
- [x] `node src/core/selftest.ts` → `selftest: all passed`. I didn't run the audio selftest because this batch touches no audio file.
- [x] `node tools/mix.ts` → `9801f68535b73559936b6c221e7c3b7dd361c1c8c39624ab0331b318896f51d2`, the first hash in `baseline_audio.txt`
- [x] `node tools/check_timeline.ts` → `ok (22 shots, 77 beats, 204.0s)`
- [x] `node tools/hashes.ts --check=evidence/ts-refactor/baseline.json` → `hashes: PASS (240 frames identical)`, exit 0.
  It ran 00:11:56–00:19:06, with 1572 MB of swap free and no other puppeteer Chrome running. The page logged 4 resource
  404s (the unfrozen kits' `boxes.json`, which fall back to proxies by design). `proof.txt` leaves those lines out.
- [x] Emit diff (`evidence/ts-convert-shots-c/emit_diff.txt`): `src/` at 49e66fb and at b264929, each compiled with
  `tsconfig.build.json --removeComments`. Only the five converted shots differ. A script that deletes every `(` and `)`
  and then compares the files found all five identical (`5 files differ, 0 with non-parenthesis changes`).

## Legacy importers touched
Only the specifier token changed: s15.js, s16.js and s18.js (`./s17b.js`), and s16.js (`./s15.js`). All of them were
converted later in this batch. No JSDoc fix was needed in a file that stayed `.js`. Two conversions forced the commit
grouping, though. s17b's typed `toWorld(px: number, …)` broke s17c.js's spread of an untyped `[214, 58]`, and s15's typed
`draw(spans)` broke s16.js's untyped span arrays. So each dependent went into the same commit as its dependency. A
JSDoc patch would only have been deleted one step later. `src/film.ts`'s dynamic `import(\`./shots/${id}.js\`)` is unchanged.

## Gaps
- **`any`: none.** No `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck`. s17b's two JSDoc `any` casts (`fig.pose`,
  `fig.eyes`) and the `any[] & { hero?: any }` figures array are gone. The one hit for the word "any" in these files is a
  comment in s15.
- **s17b's crowd figures overwrite the rig's `pose()` method** with their pose angles (`fig.pose = seat(…)`), and store
  `fig.eyes` on the rig. This was already true before this change. It works because `blend()` uses its own closure, not
  `this.pose`. I typed it as it is: `type CrowdFig = Omit<Gator, 'pose'> & { pose: Pose, eyes: string }`. `makeGator(…)`'s
  result is widened to `Omit<Gator, 'pose'>` first and then narrowed to `CrowdFig`, so no hop through `unknown` is needed.
  Any later call to `fig.pose(...)` on a crowd figure is now a type error, which it should be. Renaming the field would
  fix the hazard, but that is a runtime change and not for this task.
- **Assertions where a rewrite would change the code:**
  - s15 `inkLayers(which)`: the sheet name can be any props_kit piece (s16 passes `blank_page`, which has no writing).
    `SHEET_INK[which]` is read as `(SHEET_INK as Record<string, unknown>)[which] as Record<string, number[]>`, with a
    comment. The direct cast fails because of practice_1's scalar `plusY`, which `inkLayers` never reads. Retyping
    `SHEET_INK` itself would have turned s16's `I1.plusY` into `number[]`.
  - s16 page1's strike spans: `(strike ? […] : […]) as Span[]`. Contextual typing doesn't reach through a parenthesized
    conditional inside a spread.
  - `!` for values that can't be null: `SHOTS.find(…)!` (all five), every `getContext('2d')!`, `hero.hand!` and
    `gator.hand!` (the side rig always has one), `r.at(-1)!` in s17b (guarded by `r.length`), s16's `cam.focus!` (all
    three cameras in that expression carry a focus, as the comment on that line says), s18's `loadLUT('amber')!` and
    `loadLUT('dawn')!` plus `image.data!` (as in s13), and s18's `at!` in padInk (the existing `if (k > 0 && !at) k = 0`
    is the guard).
- **Types added (erased at run time):** s15's `Tok` (the writing tokens: text, a superscript tuple, or an object with
  optional `sum`/`arrow`/`frac`/`scribble`, so `typeset()` narrows on the checks it already makes). Also s16's
  `Span`/`PageInk`, s17b's `Run` and `CrowdFig`, and s18's `Anchor`. s18's four camera literals (`CAM_W`, `CAM_I`,
  `CAM_I2`, `PUSH`) are now annotated `CamKey`. Before, they had no type, and the old checker let them spread into
  `Vector3`.
- **Stale comments kept on purpose.** The brief says to keep every comment, so comments that still name `.js` files stay
  (s18's "come from s02.js", "copied from s02.js", "evidence/trims-home/blobs.js"; s15's "poses.js's seated legs").
- **The `tsconfig.json` legacy program** now matches only `src/globals.d.ts`, since no `.js` file is left under `src/`.
  It still passes. Whether to retire it, and `allowJs` in `tsconfig.build.json`, is a contract change and not part of my task.
- **Setup (not committed):** the `node_modules` symlink, plus `assets/cut/*.png` and `assets/raw/reels/*.mp3` copied from the
  main checkout.
- **Swap wait:** none needed. At the check, 1572 MB of swap was free and `pgrep` found no puppeteer Chrome. I left alone the
  long-lived headless Chrome on port 9333.

## Story
The batch was the tail of the dependency chain. s17b supplies the hand font, the test page rig and Camera P that s15,
s16, s17c and s18 all borrow, so it had to go first. I worked the way the earlier builders did. For each file I wrote an
exact-match replacement list, applied it with a script that refuses any pattern matching more than once, and then read
what the strict compiler still flagged. s17b alone started at 83 errors, almost all of them untyped parameters.

The batch order from the dispatch didn't survive contact. Once s17b's `toWorld` took typed numbers, s17c.js (still
JavaScript) stopped type-checking, because it spread an untyped `[214, 58]` into it. The same thing happened one level
up: s15's typed `draw(spans)` broke s16.js. The brief allows a minimal JSDoc patch in a legacy importer. But both
importers were mine to convert next, so I converted them in the same commit and checked each commit's tree on its own.

The interesting typing was in s17b's crowd. Each figure stores its pose angles over the rig's own `pose()` method, and
the JSDoc had papered over this with `any`. I didn't make it look safe. I gave it a type that says what it is: a Gator
whose `pose` is data. s15's `SHEET_INK` lookup was the other one: practice_1's lone scalar `plusY` is why no direct
cast works.

Before spending the render, I diffed the emitted JS against 49e66fb. Then I wrote a check that deletes every parenthesis
and compares again. All five files came back identical, and the frame hashes then passed all 240 frames, as the diff
had predicted. With s18 done, `git ls-files 'src/**/*.js'` prints nothing.

## State
built · 2026-10-20
