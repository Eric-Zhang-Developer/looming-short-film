# Brief · asset-style-tile

**Type:** painter
**Wave:** 3 (started early, alongside wave 2) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md` (all), `docs/03-art-direction.md` §Palette, §The paper and the ink, §Banned AI tells, `docs/contracts.md` §tools, `done/smoke-codex.md`, `done/tool-gen.md`

## Goal
Produce 3–4 style-tile variants for the director to pick at **gate G1**, and do it through `tools/gen.mjs`. This is that tool's first live run, so it counts as the end-to-end test too.

## Owns
- `assets/prompts/style_tile.v2.md`
- the `style_tile` entry in `assets/specs.json`
- `tools/gen.mjs` (fixes only, if the live run exposes bugs; keep the CLI in `docs/contracts.md`)
- `assets/raw/` (full-size is gitignored; commit `assets/raw/thumbs/` only)
- `evidence/asset-style-tile/`
- `done/asset-style-tile.md`

## Inputs
- Reference frame (absolute path, gitignored, lives only in the main checkout): `/Users/ericzhang/code/media/looming/reference-videos/frames/torn_paper_ref.jpg`. Your worktree doesn't have it. Make `gen.mjs` resolve `reference-videos/` refs against the main checkout (the parent of `git rev-parse --git-common-dir`), not the worktree. Never copy the frame into the repo.
- The v1 tile is at `/Users/ericzhang/code/media/looming/assets/raw/style_tile_v1.png`. Look at it. Wave 1 judged it promising but it asked for a green key.

## Spec
1. Write `style_tile.v2.md` from `assets/prompts/_blocks/` (style, lighting, technical verbatim). It must be **alpha-first** per doc 08, not green-key. The asset block:
   - **Subject:** the same apartment corner at night, built as a paper diorama: a wall section, a desk edge, a paper calendar with one day circled in calendar red, a desk lamp with a tissue shade, a closed laptop, plus **one small gator figure** (about 8 cm scale relative to the desk, side view, standing), so the tile also sets character style.
   - **Layout:** pieces spaced apart, not overlapping, each one cuttable.
   - **Banned:** text, numbers on the calendar, cast shadows, glows, a baked-in light direction.
2. Point the `style_tile` entry in `specs.json` at v2 and set `variants` to 4.
3. Run `node tools/gen.mjs --asset=style_tile --variants=4`. **At most 2 Codex calls at once.** At most 8 generations total for this asset (the tool enforces it). If `--skip-git-repo-check` or anything else fails live, fix `gen.mjs` and record what broke.
4. Screen every variant yourself with the Read tool against doc 08's checklist: baked light, alpha clean, pieces separated, text, palette, resolution, banned AI tells. Drop clear failures (they count toward the 8).
5. Make `evidence/asset-style-tile/contact.jpg`: the 3–4 survivors side by side, each over mid-grey **and** over navy so alpha halos show, labelled only by filename in the done note (no text burned into the image is fine either way, since it's evidence).
6. Run `node tools/cut.mjs --auto` on your best variant into a scratch dir outside the repo, to prove the pieces cut. Put a small contact of the parts in evidence.

## Acceptance
- [ ] `gen.mjs` ran live end to end with no manual copy (or the done note says exactly which step was manual and why)
- [ ] 3–4 screened variants, thumbs and sidecars in `assets/raw/thumbs/`
- [ ] Contact sheet over grey and navy
- [ ] Cut test on the best variant
- [ ] Generation count and wall-clock recorded; usage "unknown" if not reported
- [ ] Your ranking of the variants with one line each on why. **You do not freeze anything.** The director picks at G1.

## Out of scope
Freezing, the gator sheet, any other asset. Never read or print `~/.codex/auth.json` or any token file.
