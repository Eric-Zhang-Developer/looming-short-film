# NOW

**Wave:** 3 · Assets, with wave 4 (animatic) under way · branch `wave/3-assets` (cut from main after wave 2 merged in #2)
**Updated:** 2026-10-15

## In flight
| Task | Kind | Notes |
|---|---|---|
| `anim-s15` | builder (fix round) | the loom shadow must be in frame before the click; s06 waits on it |
| `exam-ink` | builder | Q7 matte ink; owns `src/blob.js` |

Merged so far: s01–s05, s07–s10, s13 (10 of 18). Style tile v3 is built and **awaiting the director's G1/G2 pick** (recommendation: v3_4).

**Disk:** it filled up on 2026-10-15; the director freed space (5.2 GB free).

**RAM (2026-10-15, director: "my ram is dying"):** each builder's headless Chrome GPU process held 3–6 GB, about 14 GB in all, and one orphaned `measure.mjs` (s14) held 5.5 GB. **The builder ceiling is now 3**, with one Chrome per builder at a time, closed when finished. s17 is paused with its worktree kept; resume it once s14, s16 and s18 land. Before starting a batch, check `top -o mem` for orphaned `Google Chrome Helper` processes whose `measure.mjs` or `render.mjs` parent is gone.

## Director decisions (2026-10-15)
- **G1:** "make style tile v3 with the value-contrast rule (+4 generations)". `asset-style-tile-v3` is running: 4 variants, each a different gator design direction. The director also said "the gator is really ugly ngl", so appeal is the priority. **G1/G2 pick comes next.**
- **Q1–Q9:** "go with every recommendation". The specs already follow them. Still to do: **Q7 Exam matte ink** (task `exam-ink`, queued until a code-writer slot frees; it owns `src/blob.js`).
- Still open: removing the third-party transcription file from the repo, and the deadline.

## Next moves
1. Merge batch 1 as each shot finishes. Merge pattern: check the diff touches only its owns, run `determinism.mjs` on `index.html` across the shot, convert any PNG over 2 MB to JPEG, squash with a "why" message, remove the worktree, update the board.
2. Batch 2: s05, s06 (mirror s15's numbers from `done/anim-s15.md`), s07, s10, s16. Batch 3: s08, s11, s12, s14, s17. Batch 4: s18. Brief: `tasks/anim-shot.md`. Builders use `src/characters/` rigs, take `visible` sizes from `assets.load`, and save JPEG evidence. **Pace:** at most 5 concurrent builders; use Sonnet for simpler shots (s05, s08, s10, s14), and check `get_usage` before each batch.
3. When all 18 are blocked: assemble the animatic (`render.mjs --frames` then `--encode` with `out/audio/mix.wav`), run 3 cold viewers (doc 02's readability questions) and a judge, then gate **G4**. Tag `v1-animatic` with a Release.
5. **Type checking (director asked about TypeScript, 2026-10-15):** after G4, when no builders are writing, add `// @ts-check` plus JSDoc to the contract modules and a `tsc --noEmit --checkJs` check. No `.ts` renames and no build step: `index.html` loads `src/` straight into Chrome. It's a mechanical commit of its own.
6. **Music motif pass:** waiting on the director's call: keep the score synthesized (doc 05, recommended) or switch to licensed tracks. Doc 05 already defines the Exam motif, the avoidance groove and the theme (built from the Exam's intervals). The pass audits where they recur across 3:00 and measures the exported MP4 with ebur128, with peaks under −4 dBFS.
4. After G1: v3 style tile → freeze → gator and face sheets (G2) → sets and props per `docs/assets.md` (20 frozen) → G3 test shot.

## Carry-overs and known gaps
- **Mix headroom:** premix PLR is 12.36 dB against loudnorm's 12.5 dB linear limit, so s05/s07 foley sits under spec level. Wave 6: a limiter or makeup gain in `tools/mix.mjs`.
- **s01:** the window reads grey and the dawn could pass for dusk. Its local proxy padding now stacks with proxy-margin, so the building is about 8% big. Fix in the final pass.
- **s13:** reads dark and busy at thumbnail size (check at G4). Back-to-back figures merge.
- **s07:** the seam light at 8.0 is 7.3% (spec 5%), and he's a backlit silhouette during the montage. Fix in the final lighting pass. Its straight-cut curtains conflict with s08's torn, glowing rims.
- **s08:** his face is a few px of proxy, so the yawn reads from the shadow's eyes. The ladder from s07 is still in frame (fine for continuity, but check at G4).
- **s12 is meant to be the film's darkest frame and only just is:** mean luma 26.3 (s12 at 86.0) vs 26.9 (s11 at 72.5) on the 16–235 scale. Brighten s11's laptop beat at G4 rather than darken s12 further.
- **s11:** the first 2.6 s are very dark (the gator barely reads), the lid opening is small, and the face fill is 83% of the desk top (rule 30–45%). Check at G4.
- **Shadow-scale chain across the night:** s11 ends 5.96×, s12 and s13 hold 7.1× (s12's phone z solved to about 0.103), and s15 opens 4.2× on its own closer camera.
- **Lamp click count:** doc 05 says the click is heard three times. The reconciled reading is home on, home off, Marston on; the neighbour's click is seen, not heard (Q2). `cues.js` has no click on `lampOffHome` yet, so add it in the sound pass with the same buffer.
- **s06/s15 shot specs still say 7.1×.** Both shots run at 4.2× (s15's in-frame fix). Update the specs' numbers in a spec commit.
- **The blob draws 2.73 cm, not 2.4.** Any shot spec that derives a shadow width from 2.4 is off by 14%. The scale is the truth.
- **The rig's legs are 37% of the gator's height** (the tile's are about 20%); flagged on Q9. `hipHeight` must be re-measured from the real `leg_l` once art is frozen.
- **Paper rim** at wide framing: fixed by look passes 1–2. Rims take the light's colour, where the reference's are painted white.
- `render.mjs` takes no query strings.
- **`determinism.mjs` can't see render-order bugs:** every run starts from the same first frame, so the lamp-dust bug passed it. A cross-order check (render t after a different frame, compare across runs) would have caught it.
- The paper cache won't hold a 25 s held shot at 4 Hz boil.
- Cut PNGs (`assets/cut/*.png`) are gitignored. Unfrozen `*.boxes.json` stay untracked.

## Models
- Orchestrator: claude-opus-5-5
- Builders: opus for rigs, contracts and hard shots; sonnet for well-specified fixes and simpler shots
- Painters: opus

## Session hand-off
Read AGENTS.md, docs/09-orchestration.md, this file and tasks/board.md. Resume the /loop. Subagent reports arrive as messages; merge per step 1.
