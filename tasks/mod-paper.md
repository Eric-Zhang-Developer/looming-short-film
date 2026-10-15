# Brief · mod-paper

**Type:** builder
**Wave:** 2 · batch 2 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §paper.js, `docs/03-art-direction.md` §The paper and the ink, `done/smoke-paper.md`

## Goal
Turn painted art or a simple shape into a sheet of paper: torn edge by weight, fiber rim, grain and boil. This is the module most responsible for the film reading as paper and not vector.

## Owns
- `src/paper.js`
- `lab/paper.html`
- `lab/paper.js`
- `evidence/mod-paper/`
- `done/mod-paper.md`

## Inputs
- `src/core/` (merged in batch 1).
- `smoke/paper/scene.js` `makeCutout`/`makeStock`: lift what works.
- A real painted piece: the style tile's parts in `assets/cut/` if `tool-gen` produced them, otherwise crop the lamp from `assets/raw/style_tile_v1.png` (main checkout, gitignored, copy locally).

## Spec
Implement `src/paper.js` per contracts.
- The smoke test's edge read as **lumpy, not torn**. Use two noise scales (a large wobble plus a fine jagged tear) and vary the tear by weight per doc 03. The fiber rim should be visibly white and streaky, 2–6 px at 1024 px.
- Painted art keeps its own colors and texture. Only the alpha edge, rim and a light grain are applied.
- The cache is keyed by `(key, seed, res)` and evicts least-recently-used entries past 300.
- The lab page shows four pieces side by side, one per weight (cardstock, kraft, tissue, vellum), plus one painted piece from the style tile. They're lit by one soft overhead light and one low side light, and the boil runs at 10 Hz.

## Acceptance
- [ ] All four weights look visibly different at the edge (crop in evidence)
- [ ] The painted piece keeps its painting, with a torn edge and rim added
- [ ] Boil: a 6-frame strip shows edges changing and the silhouette staying put
- [ ] Determinism passes
- [ ] Your honest read: paper or vector? Compare against the reference frame `reference-videos/frames/torn_paper_ref.jpg` in the main checkout

## Evidence required
`evidence/mod-paper/`: `weights.jpg`, `edge_crops.jpg`, `boil_strip.jpg`, `painted.jpg`, `determinism.txt`.

## Out of scope
Material/translucency (mod-material), lights, puppets.
