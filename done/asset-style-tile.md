# Done · asset-style-tile

## What shipped
Four style-tile v2 variants are ready for the director at G1. They come from one live `node tools/gen.mjs --asset=style_tile --variants=4` run, with no manual copy. Each variant is a six-piece paper diorama sheet: wall, desk, calendar with one red circle, lamp with a tissue shade, closed laptop, and a side-view gator in a cream hoodie. All four passed screening. Thumbs, sidecars with screening, a grey/navy contact sheet, a cut test and the raw Codex logs are committed. Two bugs turned up in gen.mjs during the live run, and both are fixed. Nothing was frozen.

## Where it lives
- `tools/gen.mjs`: refs under `reference-videos/` now resolve against the main checkout (6ad25a0). The sidecar now names the image Codex kept and counts the images it made (0aecb27).
- `assets/prompts/style_tile.v2.md` and the `style_tile` entry in `assets/specs.json` (prompt → v2, `variants: 4`, fallback key magenta `#FF00FF`): 50c550a. The dry run is in `evidence/asset-style-tile/dryrun.txt`.
- `assets/raw/thumbs/style_tile_v2_{1..4}.{jpg,json}` and `style_tile_v2_contact.jpg`, plus `evidence/asset-style-tile/` `contact.jpg`, `cut_parts.jpg`, `cut.txt`, `style_tile_v2_4.boxes.json`, `gen_run.txt`, `wallclock.txt`, `codex/v2_N/{events.jsonl,last_message.txt}`: 2836de4.
- Full-size outputs are in `assets/raw/style_tile_v2_{1..4}.png`. They are gitignored and exist only in this worktree.

## How it was checked
- [x] **gen.mjs ran live end to end with no manual copy.** `evidence/asset-style-tile/gen_run.txt` shows 4 of 4 `-> assets/raw/style_tile_v2_N.png`, then the contact sheet, then `exit 0`. Each sidecar has `copied_into_workspace_by: gen.mjs (copied out.png out of the Codex temp dir)`.
  - `--skip-git-repo-check` worked: Codex ran in a mkdtemp dir that is not a git repo, triggered `image_gen` and saved `out.png` there.
  - Codex read only its own `imagegen/SKILL.md`. It read no repo docs, because the temp dir works as doc 08 intends.
  - What broke, and is now fixed:
    - (a) The ref frame was missing in the worktree, so a live run would refuse. Fixed in 6ad25a0. The dry run now prints `-i /Users/ericzhang/code/media/looming/reference-videos/frames/torn_paper_ref.jpg` with no warning.
    - (b) The sidecar's `codex_source_file` took the first `generated_images/` path, which was a discarded image whenever Codex re-rolled. Fixed in 0aecb27 to take the last path. That is the `cp` source, which I checked against all four event streams. The fix also adds `codex_images_generated`. The four sidecars were backfilled from the saved logs, and each one carries a `backfill_note` saying so.
- [x] **3–4 screened variants.** 4 of 4 survive. Each sidecar's `screening` covers baked light, background/alpha, separation, text, palette, resolution and banned AI tells, and gives a rank.
  - Method: full-size Read of every PNG, composites over #808080 and #1E2440, a 3x zoom of the gator-head edges, and alpha islands counted with `cut.mjs --auto`. Every variant gives exactly 6 islands.
- [x] **Contact over grey and navy:** `evidence/asset-style-tile/contact.jpg`, 3726x872. From left to right: `style_tile_v2_1.png`, `v2_2`, `v2_3`, `v2_4`. The top row is over grey, the bottom row over navy.
  - v2_1 and v2_4 have no alpha, so for the contact they were keyed with ffmpeg `colorkey=0xFF00FF:0.18:0`, a hard key close to cut.mjs's.
- [x] **Cut test on the best variant (v2_4):** `evidence/asset-style-tile/cut.txt`.
  - The output reads `keyed #FF00FF (tol 80)`, `6 alpha island(s): 6 kept, 0 dropped`, and the exit code is 0.
  - It was run from a byte-identical copy of `tools/cut.mjs` (the sha256 values match in the log) so that the parts land in a scratch dir outside the repo. cut.mjs has no `--out` option and is not in my owns.
  - `evidence/asset-style-tile/cut_parts.jpg` shows all six parts whole over grey and navy, with nothing pulled in from neighbouring pieces. There is a 1 px pink fringe, covered under Gaps.
- [x] **Generation count and wall-clock:**
  - Wall-clock: 531 s for the whole run, 13:42:40Z → 13:51:31Z. Per variant: 162 s, 88 s, 112 s and 169 s.
  - Files toward the cap: 5 of 8 (v1 plus the four v2s). A dry run with `--variants=4` is now `REFUSED`, as it should be.
  - **Actual `image_gen` calls: 6 for v2.** v2_1 and v2_4 each re-rolled once inside the Codex call ("The first render added unwanted halos"). Counting v1, that is 7 real images against the cap of 8.
  - Usage from `turn.completed`, summed over the four runs: input 806,926 tokens (702,336 cached), output 7,070, reasoning 411. Per run, input ran from 102,962 to 281,850.
  - Image cost and model are **unknown**. Neither appears in the event stream.
- [x] **Ranking.** I froze nothing; the director picks.
  1. **v2_4.** It has the flattest light, reads most like gouache on card, has the highest resolution (2048x768), and its gator-to-desk scale is closest to the spec. Its weaknesses are the magenta key instead of alpha, the 1 px pink fringe, an amber-painted shade interior, and the same cream torn rim on every piece.
  2. **v2_2.** It has real alpha with clean edges, varied edges and the best calendar. Its weaknesses are the tightest gaps (16–20 px), a desk that reads as a bench, mild hoodie shading and the same amber shade interior.
  3. **v2_1.** It has the magenta key with a fringe, the desk came back as a lidded box, it has stitched felt lines and heavy impasto, and its box front is darker than its top, which reads as a light direction.
  4. **v2_3.** It is borderline: fuzzy felt/plush instead of cardstock, volumetric shading on the gator, and a gator nearly 3x the desk height. I kept it because no checklist item fails outright, and it has the best desk-edge shape and the only gaps near 40 px.

## Gaps
- **Codex chose the magenta fallback in 2 of 4 runs**, after rejecting its own alpha render for halos. That means "alpha-first" is not reliable.
  - Fixing this lies outside my owns. cut.mjs's hard key leaves a visible 1 px pink fringe on every edge of v2_1 and v2_4. If either is frozen, cut.mjs needs despill or a soft edge. Its own `ponytail:` note already names this.
- **Alpha variants are never fully opaque.** In v2_2 and v2_3 the piece interiors sit at alpha 253, and only 0.1% of pixels are at 255. Under three.js they would be about 1% see-through. A cut-time clamp (alpha ≥ 240 → 255) would fix it. That is cut.mjs again, so I did not change it.
- **Hidden generations.** The 8-cap counts files, not `image_gen` calls, so it saw 5 when the real count is 7. A revision round has one real generation left. gen.mjs now records `codex_images_generated` but does not enforce it. Whether the cap should count it is an orchestrator call.
- **Gaps between pieces are under the asked ~40 px in 3 of 4 variants** (16–32 px). They still cut cleanly.
- **Repeated torn rim.** v2_1 and v2_4 give every piece the same thin cream torn rim, even though the prompt asked for tears that vary with paper weight. Doc 03 bans the same procedural edge on every shape.
- **Amber shade interior.** v2_2 and v2_4 paint the lamp-shade interior amber, which reads as lit even though it is flat. The director should decide whether that counts as baked light.
- **Interpretation where the spec was silent:**
  - I read "about 8 cm scale relative to the desk" as character scale, meaning the head comes a little above the desktop. I did not read it as a figurine on the desk.
  - The fallback key is magenta per doc 08's rule for green characters.
  - Only the torn-paper frame was attached as a reference. The v1 tile was not attached, because doc 08 says only frozen assets are references.
- **The cut test parts were not committed.** They are in the session scratch dir only, and the evidence is `cut_parts.jpg` plus `cut.txt`.
- **Not done:** freezing, the manifest, and the process log (doc 07), which is not in my owns.

## State
built · 2026-10-15
