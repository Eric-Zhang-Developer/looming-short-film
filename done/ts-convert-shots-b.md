# Done · ts-convert-shots-b

## What shipped
Seven shots are now strict TypeScript: `src/shots/s11.ts`, `s09b.ts`, `s10b.ts`, `s13.ts`, `s17.ts`, `s09c.ts` and `s10.ts`.
Every import specifier pointing at them in `src/` and `tools/` now says `.ts`. The changes are types only. The frames, the
mix and the emitted JS are unchanged, except for redundant parentheses the casts left behind.

## Where it lives
Branch `worktree-agent-a8865c677a04dcac5`, reset to `refactor/typescript` at 629d7ce. Not pushed or merged.
- `e1d2c42`: s11, s09b, s09c and s10 (the kit chain), plus the specifier changes in the legacy importers. I checked this commit's
  tree on its own (`git checkout-index` into a scratch dir, `npm run -s typecheck` → exit 0).
- `7dc29d5`: s10b, s13 and s17.
- The last commit: `evidence/ts-convert-shots-b/` and this note.

## How it was checked
All output is in `evidence/ts-convert-shots-b/proof.txt`. Everything ran after 7dc29d5, in the brief's order.
- [x] `npm run -s typecheck` → no errors in either config (exit 0)
- [x] `node src/core/selftest.ts` → `selftest: all passed`. I didn't run the audio selftest because this batch touches no audio file.
- [x] `node tools/mix.ts` → `9801f68535b73559936b6c221e7c3b7dd361c1c8c39624ab0331b318896f51d2`, the first hash in `baseline_audio.txt`
- [x] `node tools/check_timeline.ts` → `ok (22 shots, 77 beats, 204.0s)`
- [x] `node tools/hashes.ts --check=evidence/ts-refactor/baseline.json` → `hashes: PASS (240 frames identical)`, exit 0.
  It ran 23:43:22–23:50:27, started with 1174 MB of swap free and no other puppeteer Chrome running. The page logged 4
  resource 404s (the unfrozen kits' `boxes.json`, which fall back to proxies by design). `proof.txt` leaves those lines out.
- [x] Extra: I compiled 629d7ce's and 7dc29d5's `src/` with `tsconfig.build.json --removeComments` and diffed the output
  (`evidence/ts-convert-shots-b/emit_diff.txt`). Six lines changed, all of them cast parentheses (`(o).material` → `o.material`,
  `([…]).map` → `[…].map`, and similar). s09b, s10 and s13 emit identical JS.

## Legacy importers touched
Only the specifier token changed in each: `s15.js` (`./s11.js`, `./s09b.js`), `s16.js` (`./s11.js`), `s17c.js` (`./s11.js`,
`./s09b.js`). None needed a JSDoc fix: all three type-check against the new types as they are. `src/film.ts`'s
dynamic `import(\`./shots/${id}.js\`)` is unchanged.

## Gaps
- **`any`: none.** No `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck`. The two old JSDoc `any` casts became typed casts:
  s10b's bay and ceiling tints are now `as PaperMesh`, and so is s09c's `selfLit`.
- **New type export.** s11 now exports `type ShotCtx`, the context `film.ts` passes to `build()`, and all seven shots type
  their `build()` with it. It's erased at run time. Batch A may define its own. If both land, one of them should go.
- **Types I corrected where the JSDoc was wrong or too narrow (all type-only):**
  - `glow()` now takes `{ children: Object3D[] }`, which is all it reads. s17 passes it a bare `{ children: [tissue] }`.
  - `lamppost()`'s `color` is now `THREE.Color`. The JSDoc said `ColorRepresentation`, but the value goes to
    `emissive.copy()`, which takes only a Color.
  - Its `art: Function` is now `ReturnType<typeof kitTools>['art']`. A plain `Function` returns `any`.
- **Assertions where a rewrite would change the code:**
  - s11 `castOnly`: `isMesh` read through `Partial<THREE.Mesh>`, and the whole expression is `as boolean`. On a non-mesh it is
    `undefined`, which three reads as false. That was true before too, and a comment says so.
  - s09c `selfLit`: `(o as PaperMesh).material` on any Object3D. The existing `m?.` skips Groups. Commented.
  - s13 `rig.off` for a crowd desk is cast to `Extract<DeskRig, { off: number }>`. `DeskRig` is a union with the base member's
    `loom?: undefined`, so the loop's existing `if (!g.loom) continue;` narrows it with no cast.
  - `!` for values that can't be null: `SHOTS.find(…)!`, `getContext('2d')!`, `hand!`, s11's walk `w.hip!` (the side set
    always returns one), s13's `loadLUT(…)!` and `image.data!`, s17's `focus!` (both `aimCam` calls pass a focus).
- **Stale comments kept on purpose.** The brief says to keep every comment, so comments that still name `.js` files stay:
  s13's "S13_DESKS in timeline.js", `src/audio/cues.ts`'s two mentions of `s09c.js` and `timeline.ts`'s `src/shots/s13.js`.
  The docs (`docs/09-orchestration.md` and others) aren't mine to change.
- **Setup (not committed):** the `node_modules` symlink, plus `assets/cut/*.png` and `assets/raw/reels/*.mp3` copied from the
  main checkout.
- **Swap wait:** about 30 s (swap free went from 950 MB to 1174 MB). I left alone the long-lived headless Chrome on port 9333.

## Story
The batch was a dependency chain: s11 is the kit every Marston shot borrows, s09b lends its close-up rig, and s09c lends its
lamps to s10. I went bottom-up with one script that applies exact-match replacements and refuses any that match twice, then
read the strict compiler's errors for each file. s11 came out of that with one leftover error, `w.hip` maybe undefined, and
s09b came out clean.

The surprise came from the legacy side, as it did for the modules batch. As soon as s11 had real types, s09c.js and s17.js
(still JavaScript) broke. s17 calls `glow({ children: [tissue] })` with a fake holder, and `glow` had just been typed to
take an `Object3D`. The fix was to type the parameter as what `glow` actually reads, not to cast at the call. s09c's lamppost
JSDoc had claimed a `ColorRepresentation` that `emissive.copy` would never accept. It turned out to be wrong all along, and
the old `Function` type had been hiding that.

Before spending the render, I compiled the old and new trees and diffed the JS. The first diff had one real shape change. In
s13 I had split `const breathers = [], workers = []` into two statements so the annotations read better. That isn't a
behavior change, but the brief says no reformatting, so I joined them back. The diff was then six lines of parentheses. That
made committing in two parts possible: s10b, s13 and s17 went back to `.js` with only the specifier changed, and I checked the
first commit's tree on its own. The render then passed all 240 frames, as the diff had predicted.

## State
built · 2026-10-19
