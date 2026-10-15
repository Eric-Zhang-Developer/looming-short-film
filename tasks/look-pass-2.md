# Brief · look-pass-2

**Type:** builder · **Wave:** 3 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/03-art-direction.md`, `docs/contracts.md` §material, §blob, §lights, `done/look-pass-1.md`, `done/mod-blob.md`, `done/mod-material.md`, and look at `evidence/look-pass-1/before_after.jpg` and `vs_reference.jpg`

## Goal
Close the three rig gaps look-pass-1 left, all in code. Don't touch palette, painted art or the Exam's overall design. The Exam's look is a G2 question. This task only removes a regression.

## Owns
- `src/material.js`, `src/blob.js`, `src/lights.js`
- `lab/lookdev.js` (only if the fix needs a scene change)
- `docs/contracts.md` §material, §blob, §lights (additive only)
- `evidence/look-pass-2/`, `done/look-pass-2.md`

## Spec
1. **Backlit shade rim is an even band.** `material.js`'s edge catch uses a fixed 12-texel radius, so the tissue shade glows as a constant-width outline. Make it vary along the edge (seeded by the sheet's boil seed so it boils too): thinner, broken, brighter where the tear is thinnest. No constant-width rim anywhere.
2. **Blob regressed to grey glass.** `blob.js` adds the room fill into its edge highlight, so the lifted night fill greys it. The ink must stay ink black (`PALETTE.ink`) with only the key light's highlight and the eye catchlights. Cap or tint the fill contribution. Compare against `evidence/mod-blob/closeup.jpg` and `evidence/lookdev-composite/lamp.jpg`.
3. **Cone sides are straight mesh lines.** Soften the lamp cone's silhouette edges (fade by view angle to the cone surface, or a feathered alpha) so it reads as vellum or light, not a polygon.

Re-render the lookdev evidence set. The v2_4 cut parts are at `/Users/ericzhang/code/media/looming/assets/cut/style_tile_v2_4_*.png`; copy them into your worktree's `assets/cut/` (uncommitted).

## Acceptance
- [ ] Shade rim crop at 200%: varies in width and breaks
- [ ] Blob crop in phone and lamp states: ink black body, one key highlight, no grey cast (sample the body's mean RGB, should be within 10 of `#0A0A0F` outside the highlight)
- [ ] Cone edge crop: no hard straight line
- [ ] Determinism passes for lab/lookdev, lab/material, lab/blob, lab/lights
- [ ] `before_after.jpg` against look-pass-1's frames
