# Brief · contract-puppet

**Type:** builder · **Wave:** 3 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` §paper, §material, §puppet, `docs/03-art-direction.md` §Motion (edge boil), `done/mod-puppet.md`, `done/mod-material.md`, `src/puppet.js`, `src/paper.js`, `src/material.js`

## Goal
Puppets must boil like every other paper piece. Today each part takes one fixed `PaperSheet`, so a character's edges never re-tear while the set around it boils. Fix it additively, and write down the face-slot convention mod-puppet invented.

## Owns
- `src/puppet.js`, `lab/puppet.js`
- `docs/contracts.md` §puppet (additive only)
- `evidence/contract-puppet/`, `done/contract-puppet.md`

## Spec
1. A part's `sheet` may also be a function `(seed) => PaperSheet` (e.g. `(s) => makePaper({ art, key: 'gator-arm', seed: s })`). Add `Puppet.boil(t, rate = 10)`, which computes `boilSeed(t, rate)` and, when the seed changes, swaps textures with `updatePaperMesh`, with no new geometry. Plain sheets keep working unchanged. Face takes may be functions too.
2. Document in contracts.md:
   - the face-slot convention (slots are parts named `eyes` and `mouth`, and takes match the slot size)
   - `pivot` is v-down
   - the `gain` option on `follow`
   - exposed `joints` and `meshes`
   - the rule that `pose()` after `blend()` overrides
   - `face()` must be called every frame
3. Update the lab so the test gator boils, while keeping the existing determinism times passing.

## Acceptance
- [ ] Boil strip of the test gator: edges re-tear every step at rate 10, silhouette holds
- [ ] Geometry and program counts don't grow over 48 frames (same method as mod-material's swap check)
- [ ] `tools/determinism.mjs --page=lab/puppet.html --t=0.5,2,3.5` passes
- [ ] contracts.md diff is additive only
