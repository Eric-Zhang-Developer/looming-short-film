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

**Marston light (director, 2026-10-15): motion-sensor fluorescents, no desk lamps** (process log). `spec-sensor` is rewriting docs 02/03/05, assets and s09–s18. **s14, s16, s17 and s18 stay paused until it merges**; then re-brief them, rework s15 (pen trips the sensor) and strip the unlit lamp from s11/s12.

**Swap caused both disk-full events:** RAM pressure from headless Chrome wrote about 13.8 GB of swap. Resume at most 2 builders, render measurements at --w ≤ 960, and check `sysctl vm.swapusage` and `df -h /` before each batch.

**RAM (2026-10-15, director: "my ram is dying"):** each builder's headless Chrome GPU process held 3–6 GB, about 14 GB in all, and one orphaned `measure.mjs` (s14) held 5.5 GB. **The builder ceiling is now 3**, with one Chrome per builder at a time, closed when finished. s17 is paused with its worktree kept; resume it once s14, s16 and s18 land. Before starting a batch, check `top -o mem` for orphaned `Google Chrome Helper` processes whose `measure.mjs` or `render.mjs` parent is gone.

## Director decisions (2026-10-15)
- **G1:** "make style tile v3 with the value-contrast rule (+4 generations)". `asset-style-tile-v3` is running: 4 variants, each a different gator design direction. The director also said "the gator is really ugly ngl", so appeal is the priority. **G1/G2 pick comes next.**
- **Q1–Q9:** "go with every recommendation". The specs already follow them. Still to do: **Q7 Exam matte ink** (task `exam-ink`, queued until a code-writer slot frees; it owns `src/blob.js`).
- Still open: removing the third-party transcription file from the repo, and the deadline.

## HAND-OFF (2026-10-15 evening; the session hit its usage limit)
**Deadlines:** tonight, an incomplete draft (answers in `docs/10b-submission-oct15.md`, plus the Act 1 preview `out/preview_act1_720p.mp4`). **Final: Sunday, Oct 18, 11:59 PM**, with a YouTube link and the GitHub repo allowed. The plan is `docs/11-roadmap.md`.

**State of the reel (v1-animatic):** 17 of 18 shots are merged on `wave/3-assets`. s14–s17 are on the reel bar with motion-sensor lights, and s15 is the sensor turn. **s18 was building in `~/.worktrees/looming/anim-s18`** (`task/anim-s18`): check its commits and done note, verify (owns, determinism, timeline), and squash-merge. Then:
1. Clear `out/frames`. Run `node render.mjs --page=index.html --frames --range=0:180 --workers=2` in the background (about 45 min, one Chrome), then `node render.mjs --encode --out=out/v1_animatic.mp4 --audio=out/audio/mix.wav`, plus a 720p copy. Send it to the director, tag `v1-animatic` and make a GitHub Release with the MP4.
2. Collect the director's notes (G4) and Q11–Q15 (`docs/shots/QUESTIONS.md`). The face sheet is awaiting a pick: recommend v1_3, and see `done/asset-face-sheet.md` (eyes painted 2.2–2.5× large, so scale them in code).
3. Then follow the roadmap: blob meter into the shots (`done/spec-blob-meter.md` has the code-change list), rig refit to the frozen gator, sets and props from `docs/ref-ufl.md`, and the 4K master Saturday night.

**Machine rules (hard):** at most 2 builders; one headless Chrome per builder, foreground only, `--w ≤ 960` for evidence. Before each batch, check `df -h /`, `sysctl vm.swapusage` and `top -o mem` for orphaned Chrome. Swap filled the disk twice today.

## Roadmap
`docs/11-roadmap.md`: **M1 rough draft tonight (`v1-animatic`, submitted by 11:59 PM EDT, director review by 8 PM) → story lock → look lock → final art → `v3-final` → a rough-vs-final split screen for Oct 26.** The rough and the final share one timeline: beat times and cut points are frozen after M1 except by director notes. Tag and release `v1-animatic` before any later work.

## Standing duty: submission answers
`docs/10-submission.md` is the living draft of the ProposalSpace answers (director, 2026-10-15). After every merge, gate or director decision that changes a claim or number, update the matching answer and its tag, and log it in doc 07. The **10 MB per-file cap** shapes the final encode (see its §Submission files).

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
