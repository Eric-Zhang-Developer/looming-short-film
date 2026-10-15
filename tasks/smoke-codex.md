# Brief · smoke-codex

**Type:** painter
**Wave:** 1 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md` (all of it), `docs/03-art-direction.md` §Palette and §The paper and the ink, `docs/06-production-plan.md` §Image pipeline smoke test

## Goal
Prove that Claude can drive Codex image generation headless: one call to `codex exec` produces one style-tile image that lands in this repo, with no person in the loop. Doc 08's whole image pipeline depends on this.

## Owns
- `assets/prompts/style_tile.v1.md`
- `assets/raw/` (full-size output is gitignored; commit only `assets/raw/thumbs/`)
- `evidence/smoke-codex/`
- `done/smoke-codex.md`

## Inputs
- Reference frame: `/Users/ericzhang/code/media/looming/reference-videos/frames/torn_paper_ref.jpg`. It's a still from the torn-paper picture-book loop. It lives outside the worktree and is gitignored, so attach it by absolute path and never copy it into the repo.
- `codex` CLI at `/opt/homebrew/bin/codex` (0.157.1). Its `image_gen` feature is enabled and it's logged in through ChatGPT. Relevant `codex exec` flags: `-C <dir>`, `-i <image>`, `-s workspace-write`, `--json`, `-o <file>`, and prompt on stdin with `-`.
- Codex's image skill saves to `~/.codex/generated_images/<session>/` and is told to copy outputs into the workspace.

## Spec
1. Write `assets/prompts/style_tile.v1.md` using the five-block structure in doc 08, using the style, lighting and technical blocks **verbatim**. The asset block:
   - **Subject:** a small corner of a student's apartment at night, built as a paper diorama: a wall, a desk edge, a paper calendar with one day circled in red, a desk lamp with a tissue shade, a closed laptop.
   - **Layout:** pieces spaced apart and not overlapping, so they can be cut out separately.
   - **Background key:** green `#00FF00`. Nothing in the image is green, and the palette has no gator green here.
   - **Banned:** no text, no numbers on the calendar.
   - **Size:** ask for the largest landscape size available.
2. Run Codex once from the worktree root, with the prompt on stdin and the reference attached, e.g.:
   `codex exec -C <worktree> -s workspace-write --json -o evidence/smoke-codex/last_message.txt -i <ref> - < assets/prompts/style_tile.v1.md > evidence/smoke-codex/codex_events.jsonl`
   - Add an instruction to the end of the prompt *at run time*, not in the committed prompt file: save the result as `assets/raw/style_tile_v1.png`.
   - If Codex asks for approval or hangs for more than 10 minutes, stop and record exactly what happened.
3. If the file isn't in `assets/raw/`, find the newest PNG under `~/.codex/generated_images/` created during your run, and copy it to `assets/raw/style_tile_v1.png`. Record that the copy step was manual.
4. **At most 2 generation attempts in total.** Don't regenerate for quality: this test is about the pipeline, not the art.
5. Write `assets/raw/thumbs/style_tile_v1.jpg` (≤1024 px long edge, via `sips` or `ffmpeg`) and `assets/raw/thumbs/style_tile_v1.json`, containing:
   - prompt file path
   - reference file name and sha256
   - model if reported, otherwise "unknown"
   - timestamp
   - output sha256, width, height
   - your screening verdict
6. Screen the image yourself (open it with the Read tool) against doc 08's checklist:
   - baked-in light or shadow
   - background flat and keyable
   - pieces separated
   - any text
   - on-palette
   - resolution

   Then test that it's keyable: with ffmpeg `colorkey` (or a tiny script), produce `evidence/smoke-codex/keyed_preview.png` over a mid-grey background, and look at it for halos.
7. Record usage: whatever `--json` events report (token or usage fields). If nothing reports image cost, say "unknown." Don't guess.

## Acceptance
- [ ] `codex exec` ran with no interactive prompt (quote the exit code and the relevant event lines)
- [ ] `assets/raw/style_tile_v1.png` exists, and the done note says whether Codex saved it there itself or you copied it
- [ ] Thumbnail and sidecar exist in `assets/raw/thumbs/`
- [ ] The keyed preview shows a clean cutout, or the done note describes the halo/spill exactly
- [ ] The screening verdict covers each checklist item
- [ ] Usage recorded (or "unknown," with what you looked for)
- [ ] Wall-clock time of the run recorded

## Evidence required
`evidence/smoke-codex/`: `codex_events.jsonl`, `last_message.txt`, `keyed_preview.png`, and a `contact.jpg` showing the thumbnail and the keyed preview side by side.

## Out of scope
Writing `tools/gen.mjs`, freezing anything, more than 2 generations, and judging whether this is the final style tile. The director does that at gate G1.

Never read or print `~/.codex/auth.json` or any token file.
