# Brief · tool-cut-fixes

**Type:** builder · **Wave:** 3 · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md`, `docs/contracts.md` §tools, `done/tool-gen.md`, `done/asset-style-tile.md` (§Gaps)

## Goal
Fix the three pipeline gaps the first live style-tile run exposed, before any asset gets frozen.

## Owns
- `tools/cut.mjs`, `tools/gen.mjs`
- `evidence/tool-cut-fixes/`, `done/tool-cut-fixes.md`

## Spec
1. **Despill.** When a sheet uses a key colour (magenta `#FF00FF` or green `#00FF00`) instead of real alpha, `cut.mjs` must remove the 1 px fringe: soft-key the edge band and pull the key hue out of edge pixels (standard despill: clamp the key channel(s) toward the others). Test on `/Users/ericzhang/code/media/looming/assets/raw/style_tile_v2_4.png` (magenta) and `style_tile_v2_1.png`. Read them; never copy them into the repo.
2. **Alpha clamp.** Sheets with real alpha leave pieces at alpha ~253. Clamp interior alpha ≥ 250 to 255 so cut pieces are fully opaque, leaving edge antialiasing alone. Test on `style_tile_v2_2.png`.
3. **Real generation count.** Codex can generate more than one image per call. The 8-per-asset cap in `gen.mjs` must count `codex_images_generated` from the sidecars (default 1 when absent), not sidecar files. Prove it with `--dry-run` against the existing style_tile sidecars (they total 7 real generations, so 1 remains).

Write cut parts to a scratch dir **outside the repo** for testing.

## Acceptance
- [ ] Before/after crops of a magenta-keyed edge over navy, at 400% (`evidence/tool-cut-fixes/despill.jpg`), with no visible fringe after
- [ ] Alpha histogram of a cut piece before/after the clamp (text is fine)
- [ ] Dry run shows the cap counting 7 real generations
- [ ] `cut.mjs --auto` still finds the same islands on v2_4 (6)
