# Done · ts-convert-modules

## What shipped
Seventeen modules are now strict TypeScript: `src/paper.ts`, `src/material.ts`, `src/props/canvas.ts`, `src/lights.ts`,
`src/blob.ts`, `src/assets.ts`, `src/clock.ts`, `src/puppet.ts`, `src/film.ts`, and all of `src/characters/` (exam, gator,
custodian, crowd, poses, roommates, acting, freshman). Every importer specifier in `src/` points at the `.ts` files. Twelve
legacy shots got small JSDoc fixes where the new types are stricter than what they used to infer. The changes are types only:
frames, mix and self-checks are unchanged.

## Where it lives
Branch `worktree-agent-a62945dad4c5ab365`, cut from `refactor/typescript` at 3b50a98. Not pushed or merged.
- `183b48f` the JSDoc fixes in 12 shots, landed first so each commit type-checks on its own (I checked this commit's tree by
  itself: `npm run -s typecheck` clean)
- `9f9b06f` the conversion: 17 `git mv`s, the annotations, and the specifier changes in the shots
- the last commit: `evidence/ts-convert-modules/` and this note

## How it was checked
All output is in `evidence/ts-convert-modules/proof.txt`. These were run after the last code commit (9f9b06f), in the brief's order.
- [x] `npm run -s typecheck` → no errors in either config (exit 0)
- [x] `node src/core/selftest.ts` → `selftest: all passed`. Audio selftest: not run, because this batch touches no audio file (the brief asks for it only if it does).
- [x] `node tools/mix.mjs` → `9801f68535b73559936b6c221e7c3b7dd361c1c8c39624ab0331b318896f51d2`, equal to the first hash in `evidence/ts-refactor/baseline_audio.txt`
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 77 beats, 204.0s)`
- [x] `node tools/hashes.mjs --check=evidence/ts-refactor/baseline.json` → `hashes: PASS (240 frames identical)`, exit 0. It started at 23:23:21 with 1120 MB of swap free, the only headless render running, and took about 7 minutes. The page logged 4 resource 404s (the unfrozen kits' `boxes.json`, which fall back to proxies by design, as `done/ts-check.md` describes); `proof.txt` leaves those lines out.
- [x] Extra: `node src/characters/acting.ts` → `acting: ok 1.67 4.92 8.42`, the same line the old `acting.js` printed at 183b48f
- [x] Extra, covering all the code and not just the 240 frames: I compiled 3b50a98's `src/` and this branch's `src/` with
  `tsconfig.build.json` plus `--removeComments` and diffed the two `build/` trees (`evidence/ts-convert-modules/emit_diff.txt`,
  62 lines). The only differences are redundant parentheses left by the casts (`({})` → `{}`, `('left')` → `'left'`, and the
  shots' `(KEYS)` and `([…])`) and one `hands` written as `hands: hands`. No token of logic moved.

## Legacy importers annotated (JSDoc only, listed per the brief)
The cause was the same each time. These calls used to receive `any` and now get typed signatures, while JS infers array
literals as `(string | number)[][]` or `number[]`, never tuples.
- `blend()` keys `[number, string][]`: `@type` on the keys const in s01 (`swayKeys`), s02 (`SLUMP`), s04 (`KEYS`), s11
  (`BODY`), s16 (`BODY`), s17 (`BODY`) and s17b (`BODY3`). Where the keys are built by spread `map`/`flatMap`, the cast goes on
  the one `blend()` call instead: s03 (`KEYS`), s06 (`KEYS`) and s15 (`BODY`).
- `Vec3` for `position.set(...v)` and `sensorLight({ at, aimAt })`: s02 `SUN.pos`, s05 `L`, s15 `UNIT.tube` (s16 imports it),
  s17's `zones` table (`[Vec3, Vec3][]`), s18 `LAMP_AT` and `LAMP_AIM`.
- s17b: `CLOCK.reads` as `[number, number]` (spread into `clock.set(h, m, s)`), and `fig.eyes = …` written as
  `/** @type {any} */ (fig).eyes`, the same pattern as its `fig.pose` line just above.

## Gaps
- **`any`, 2, both commented.** `blob.ts`: the `traverseVisible` callback's `o: any`. It reads any Object3D by its
  `isLight`/`isSpotLight`… flags, as three's renderer does, and `traverseVisible`'s `(object: Object3D) => any` callback type
  can't be narrowed without a cast per field. The old JSDoc had the same `any`. The light it picks is typed after that: `AnyLight`
  is Light plus each kind's fields, all optional. `acting.ts`: the node self-check's stub rig, which is plain objects standing in
  for Groups and meshes (also `any` before). No `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck`.
- **Assertions where the code builds a value in steps.** A rewrite would be a runtime change, so these are typed with assertions:
  - `buildRig`'s `hands` holds `[reach, alongX]` and then Groups, so it's a union, cast at the two points where its state is known.
  - `makeGator`'s result is cast to `Gator` just before `facing` and `head34` are assigned.
  - `puppet.follow`'s `t0 = track?.ks[0][0]!` is read only when `idx` is non-empty, which needs a track.
  - `paper.ts` stores booleans into a `Uint8Array` (`as unknown as number`). The old JSDoc used `any` there.
  - `film.ts` reads `geometry`/`material` through `Partial<THREE.Mesh>`.
  - `!` marks values that can't be null: `getContext('2d')!`, map lookups after `has()`, and similar.
- **Types I chose where the JSDoc was silent:**
  - `WEIGHTS` is `Readonly<Record<string, PaperWeight>>`, so `makePaper` keeps taking any string and throwing at run time, as before.
  - `PIECES` is `Record<string, Record<string, Piece>>`.
  - `EYES` (blob), `Z` (clock), `SIDE` (crowd) and `BUILD` (roommates) are `Record`s.
  - `PaperMesh` is `Mesh<PlaneGeometry, MeshLambertMaterial>`.
  - `sensorLight`'s `at`/`aimAt` are `Vec3`, which is what made 4 shots need a cast.
  None of these is a runtime change.
- **Contract files.** `paper`, `material`, `lights`, `puppet` and `blob` are contract files in `docs/09-orchestration.md`, and
  this brief owns them. Every export kept its name and behaviour, so the interface didn't change. `docs/09-orchestration.md`,
  `docs/contracts.md` (11 mentions) and `docs/04-technical.md` (8) still name them `.js`. The docs aren't mine to change. Someone
  who owns them should update the names.
- **Stale comments kept on purpose.** The brief says to keep every comment, so a few that name the old `.js` files stay. The
  clearest is acting's "node src/characters/acting.js", which now runs as `.ts`.
- **git shows `film.js` → `film.ts` as delete plus add.** The file is short, so the edit fell under git's rename threshold.
  `git log --follow` won't cross it.
- **Hazard still in place, not this task's:** s17b's `fig.pose = seat(…)` overwrites the rig's `pose()` method (already reported in
  `done/ts-check.md`). The new `Gator` type would reject it, but the existing `any` cast hides it.
- **Setup (not committed):** `node_modules` symlink, `assets/cut/*.png` and `assets/raw/reels/*.mp3` copied from the main
  checkout, as the brief says.
- **Swap wait:** the hash run waited about 5 minutes (23:17:50 to 23:23:21) for swap free to climb from 552 MB to 1 GB. A long-lived headless Chrome on port 9333 (up 3.5 days, not a puppeteer render) is running on this machine. I left it alone, and the wait counted only puppeteer-launched Chromes.

## Story
The brief asked for types only, proven by hashes, so I needed a check faster than the 8-minute render for every edit. I went
bottom-up. Each file was `git mv`'d and stripped of `// @ts-check`, then fixed against the strict config's errors. paper and
material went first, then the lights, the blob, assets, clock, puppet and film, and gator under all the characters. The
strict program went to zero (`tsc -p tsconfig.strict.json` clean) before the legacy one had moved at all.

The surprise was on the legacy side. With my modules typed, 23 errors appeared in 12 shots that nobody had touched. They
weren't real bugs. `blend(P, KEYS, t)` used to take `any`, and a JS array literal like `[[0, 'slump'], [10, 'slump']]` is
`(string | number)[][]`, not a list of tuples. My first fix put a `@type` on each keys const. That made things worse in s03, s06
and s15, where the keys are built by spread `map`/`flatMap`: the annotation pushed into the callbacks and gave dozens of new
errors. I moved those three casts onto the single `blend()` call.

Before spending the 8-minute render, I wanted proof that covered the code the 240 frames might miss. I compiled the old and new
`src/` the same way, with comments stripped, and diffed the output. The first diff was huge: the old tree had compiled as
CommonJS, because the scratch copy had no `package.json` saying `"type": "module"`. With that copied over, the diff came down to
62 lines of parentheses and one `hands: hands` (`emit_diff.txt`). The commit split came from the same caution. The shot JSDoc
fixes went in first, so that neither commit leaves the tree failing its own typecheck. I confirmed that by type-checking
`183b48f`'s tree on its own.
 The render then passed 240 out of 240 frames, the result the parentheses diff had predicted.

## State
built · 2026-10-19
