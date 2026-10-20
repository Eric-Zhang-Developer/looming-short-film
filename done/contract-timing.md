# Done · contract-timing

## What shipped
- `onTwos` floors with a 1e-4 epsilon, so the film's float-error local t lands on its drawing. It was the only such floor in `ease.js`; `paper.js` `boilSeed` already carries a 1e-6 epsilon.
- `lampLight.update` refits the dust's bounding sphere every call (`dustGeo.computeBoundingSphere()`), so pixels no longer depend on which frame drew first.
- Selftest check over every frame 0..4320 using the runner's own arithmetic (`shotAt(n/24).tLocal`, from `timeline.js`, called by `film.js`). One-line additive notes in `docs/contracts.md` §core and §lights.

## Where it lives
`src/core/ease.js`, `src/lights.js`, `src/core/selftest.js`, `docs/contracts.md`, `evidence/contract-timing/`. Commits on `task/contract-timing`: see `git log`.

## How it was checked
- [x] Selftest: `node src/core/selftest.js` → `selftest: all passed`. With `ease.js` reverted it fails on the new check.
- [x] Every frame: `evidence/contract-timing/ontwos.txt`: wrong drawing before 681 of 4320 frames, after 0.
- [x] Determinism `index.html --t=109.4,100.5,109.4` PASS, and 109.4 hashes the same (`33ce8df6…`) whichever frame renders first. `--t=16.5,45,53.5,89.6` PASS. `determinism_after.txt`.
- [x] `check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] Drawing changes: s15 t 100.0–101.0 has 4 frames that change drawing (2402, 2408, 2414, 2420, each one later); all of s15 has 56, all one drawing later. Counted from the arithmetic in `ontwos.txt`, not from rendered strips (no renders; disk).

## Gaps
- The brief's example `100.0833 - 100` is a rounded literal and is below 1/12, so it correctly gives drawing 0. The selftest uses the real frame-2402 value (`2402/24 - 100`) instead.
- The lamp bug is only partly reproduced. With `lights.js` at HEAD and s15's `computeBoundingSphere` line off, `determinism.mjs` still reports PASS for `109.4,100.5,109.4` and `100.5,109.4,100.5`, because that tool only compares frames within a run that started with the same first frame. The order dependence does show across runs: with the bug, 109.4 hashes `9d60b1b0…` after 100.5 first and `33ce8df6…` after 109.4 first; with the fix both orders give `33ce8df6…` (`determinism_before*.txt`, `determinism_after.txt`).
- Untracked `assets/cut/` was already in the worktree; not mine, not committed.
- s11 and s15 workarounds untouched; now no-ops.

## State
built · 2026-10-15
