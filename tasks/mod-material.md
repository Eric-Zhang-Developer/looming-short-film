# Brief · mod-material

**Type:** builder
**Wave:** 2 · batch 3 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §paperMaterial and the shadows gotcha, `done/smoke-paper.md` (tissue result)

## Goal
The paper material: light through thin paper, glowing torn rims when lit from behind, and cutout-shaped shadows. It turns `paper.js` sheets into meshes that sit in the light rig.

## Owns
- `src/material.js`
- `lab/material.html`
- `lab/material.js`
- `evidence/mod-material/`
- `done/mod-material.md`

## Inputs
`src/core/`, `src/paper.js`, `src/lights.js` (merged in batch 2).

## Spec
Implement `src/material.js` per contracts.
- Back-light translucency term per doc 04, scaled by `(1 − thickness)`. The edge catch is near alpha edges when light is behind.
- Custom depth and distance materials sample the alphaMap.
- **Test whether r186 already handles alpha shadows without a custom depth material**, and record the answer. Keep custom depth regardless.
- `updatePaperMesh` swaps maps without rebuilding geometry.
- The lab page has a tissue lampshade lit from inside by `lampLight`, a cardstock cutout casting onto the wall, and a backlit torn rim. Show translucency on and off.

## Acceptance
- [ ] Tissue glows when lit from behind, and cardstock barely does (side by side)
- [ ] Backlit torn rim visibly catches light (crop)
- [ ] Cutout shadow keeps torn edge and holes
- [ ] Boil swap via `updatePaperMesh` doesn't allocate new geometry (note how you checked)
- [ ] Answer recorded on r186 native alpha shadows
- [ ] Determinism passes

## Evidence required
`evidence/mod-material/`: `tissue_on_off.jpg`, `rim_crop.jpg`, `shadow.jpg`, `alpha_shadow_test.txt`, `determinism.txt`.

## Out of scope
Puppets and post.
