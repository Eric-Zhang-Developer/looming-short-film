# Brief · tool-gen

**Type:** builder
**Wave:** 2 · batch 1 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md` (all), `docs/contracts.md` §tools, `evidence/smoke-codex/` and `done/smoke-codex.md` (how the smoke test ran)

## Goal
Turn the wave 1 smoke test into the tools that will make about 30 assets: `gen.mjs` runs the doc 08 loop for one asset, and `cut.mjs` splits a frozen sheet into parts.

## Owns
- `tools/gen.mjs`
- `tools/cut.mjs`
- `assets/specs.json`
- `assets/prompts/_blocks/`
- `evidence/tool-gen/`
- `done/tool-gen.md`

## Inputs
- Doc 08's five blocks. Store style, lighting and technical blocks once in `assets/prompts/_blocks/`, and have `gen.mjs` assemble prompts from them plus a per-asset block file.
- `codex exec` flags proven in wave 1 (see `done/smoke-codex.md`).

## Spec
- `gen.mjs --asset=<name> [--variants=N]` reads the asset from `assets/specs.json` (`{ name, purpose, refs: [paths], prompt: 'assets/prompts/<name>.vN.md', variants, target }`) and assembles the full prompt (blocks plus the asset prompt).
- Each variant runs `codex exec -C <fresh mkdtemp dir> -s workspace-write --json`, with `-i` for each ref and the prompt on stdin. It adds a run-time line asking Codex to save into the temp dir.
- Copy the result into `assets/raw/<name>_vN_<k>.png`, write `assets/raw/thumbs/<same>.jpg` (≤1024 px) and a `.json` sidecar (fields as in `assets/raw/thumbs/style_tile_v1.json`), and print a contact-sheet path.
- Hard cap: refuse if raw outputs for that asset already reach 8.
- `cut.mjs --in --boxes` reads `{ part: [x, y, w, h] }` and writes each part's RGBA crop to `assets/cut/<part>.png`. With `--auto` it proposes boxes from alpha islands and writes the boxes JSON for review.
- **Run no live Codex generation in this task**: test `gen.mjs` with `--dry-run` (prints the assembled prompt and command). Test `cut.mjs --auto` on the existing local `assets/raw/style_tile_v1.png` (in the main checkout at `/Users/ericzhang/code/media/looming/assets/raw/style_tile_v1.png`; copy it into your worktree's gitignored `assets/raw/`).

## Acceptance
- [ ] `gen.mjs --asset=style_tile --dry-run` prints the full five-block prompt and the exact `codex exec` command
- [ ] The 8-generation cap is enforced (show the refusal)
- [ ] `cut.mjs --auto` finds the 5 pieces of the style tile and writes 5 clean RGBA parts (contact sheet in evidence)
- [ ] No credential or auth file is read anywhere (grep for `auth` in the tools)

## Evidence required
`evidence/tool-gen/`: `dryrun.txt`, `cap.txt`, `cut_contact.jpg`.

## Out of scope
Live generation (that's wave 3, after the director approves). Freezing assets.
