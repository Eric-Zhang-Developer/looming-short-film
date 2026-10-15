# Brief · mod-post

**Type:** builder
**Wave:** 2 · batch 2 · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §Camera and post, `docs/03-art-direction.md` §Camera and §Color script

## Goal
Make the diorama read as a miniature: shallow depth of field, a per-act color grade, grain and vignette. No bloom.

## Owns
- `src/post.js`
- `lab/post.html`
- `lab/post.js`
- `assets/luts/`
- `evidence/mod-post/`
- `done/mod-post.md`

## Inputs
`src/core/stage.js`. three's `EffectComposer`, `RenderPass`, `BokehPass` and `ShaderPass` from `three/examples/jsm/postprocessing/`, via the import map.

## Spec
Implement `src/post.js` per contracts.
- LUTs: start with simple procedural 3D LUTs (no external downloads) for `night`, `marston`, `amber`, `dawn`, matching doc 03's color script, written as small `.cube` or generated in code.
- Grain is seeded by frame so it's deterministic.
- The lab page has three layered planes at different depths, with the focus pulled from front to back over 3 s, then cycling LUTs.

## Acceptance
- [ ] Focus pull strip shows the background softening (miniature feel)
- [ ] Each LUT is visibly different and on palette
- [ ] Grain deterministic (same `t` gives same hash)
- [ ] Frame time with post on is recorded

## Evidence required
`evidence/mod-post/`: `focus_strip.jpg`, `luts.jpg`, `determinism.txt`, `timing.txt`.

## Out of scope
Bloom. Anything outside post.
