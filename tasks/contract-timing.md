# Brief · contract-timing

**Type:** builder · **Wave:** 4 · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (§core, §lights), `src/core/ease.js`, `src/lights.js`, `done/anim-s15.md` (Gaps)

## Goal
Fix two shared bugs that anim-s15 found, at the root, so no shot needs a local workaround.

1. **`onTwos` lands on the previous drawing.** The film's global-to-local subtraction leaves float error. For example, s15 frame 2402 (global t 100.0833) gives tLocal 0.0833333333333286, so `Math.floor(t * 12) / 12` returns drawing 0 instead of 1. Film-wide, 681 of 4320 frames land one drawing early (list: `evidence/anim-s15/ontwos.txt` on `wave/3-assets`). Fix: snap with an epsilon, `Math.floor(t * 12 + 1e-4) / 12`. Fix any sibling helper in `ease.js` with the same floor too (e.g. a boil or on-threes clock).
2. **The lamp dust breaks determinism.** three computes the dust Points' bounding sphere, which it uses for draw order and culling, once on first render, but `lampLight.update(t)` moves the dust every frame. So a frame's pixels depend on which frame drew first. Fix it inside `lampLight`'s `update`: recompute the bounding sphere, or set one fixed sphere that covers the cone, whichever is simpler and deterministic.

## Owns
- `src/core/ease.js`, `src/lights.js`, `src/core/selftest.js` (add checks)
- `docs/contracts.md` §core and §lights (a one-line note each; additive)
- `evidence/contract-timing/`, `done/contract-timing.md`

Don't touch `src/shots/`. s11 and s15 carry local workarounds; they become harmless no-ops and are removed later.

## Acceptance
- [ ] A selftest check: `onTwos(100.0833 - 100)` → drawing 1, and every frame boundary n/24 for n in 0..4320, after the global-to-local subtraction the film runner actually does, lands on drawing `floor(n/2)`. Find where `film.js` converts global t to shot-local t and test with that exact arithmetic.
- [ ] Determinism on `index.html` at `--t=109.4,100.5,109.4`, i.e. render 109.4 after a different frame first, passes. Before the fix it should fail with s15's workaround commented out locally; say whether you could reproduce that.
- [ ] Determinism at `--t=16.5,45,53.5,89.6` passes. `check_timeline.mjs` is ok.
- [ ] Before and after strips: count how many frames in s15 (`t` 100.0–101.0 at 24 fps) change drawing. Expect about 56 film-wide in s15, all one drawing later.

**The disk is nearly full** (about 1.8 GB free): render only what the acceptance needs and delete your own scratch.
