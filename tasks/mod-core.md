# Brief · mod-core

**Type:** builder
**Wave:** 2 · batch 1 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §Determinism

## Goal
The shared base every page and shot imports: seeded randomness, easing, the palette, and a stage that renders a frame for any `t`. Everything later depends on it being small, correct and deterministic.

## Owns
- `src/core/`
- `lab/core.html`
- `lab/core.js`
- `evidence/mod-core/`
- `done/mod-core.md`

## Inputs
- `~/code/media/1776/src/rng.ts`: port `hash`, `hash2`, `mulberry32` to JS (keep the algorithms bit-identical).
- `~/code/hackathons/knighthacks-2026-video/src/core.js`: port `clamp`, `lerp`, `ease`, `easeIn`, `easeOut`, `kf`, `spring`. Read them, copy the logic, and drop beat/BPM coupling.
- `smoke/paper/scene.js`: the renderer setup that already works (shadow map type, preserveDrawingBuffer).

## Spec
Implement exactly the `src/core/` section of `docs/contracts.md`.
- `palette.js` values come from the doc 03 palette table. Add `calendarRed: '#C8473A'` (the single red in the film).
- `seedOf(...parts)` hashes strings and numbers into a uint32 (FNV-1a or similar, deterministic).
- `onTwos(t)` returns `Math.floor(t * 12) / 12`.
- The lab page builds a stage with a cream plane and a kraft plane, a single SpotLight, and a small box whose x position uses `kf` and whose wobble uses `spring`. It's only there to prove the stage and easing work.
- Add a tiny self-test (`src/core/selftest.js`, runnable with `node`) that asserts: `hash` and `mulberry32` give fixed known outputs for fixed seeds, `kf` hits its keys exactly, and `onTwos(0.09) === 1/12`.

## Acceptance
- [ ] Every export in the contract exists, with the documented signature
- [ ] `node src/core/selftest.js` passes (output in evidence)
- [ ] `lab/core.html` renders headless: render it with `smoke/paper/render.mjs`'s server approach, or a tiny inline puppeteer script, since `mod-render` is built in parallel
- [ ] Two renders of the same `t` give identical sha256
- [ ] No `Math.random`, `Date.now` or `performance.now` anywhere in `src/core/` (grep output in evidence)

## Evidence required
`evidence/mod-core/`: `selftest.txt`, `grep.txt`, `lab_t0.5.jpg`, `lab_t1.5.jpg`, `hashes.txt`.

## Out of scope
`render.mjs` (that's mod-render), paper, lights and anything else in contracts.
