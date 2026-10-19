# NOW

**Wave:** 3 · Assets, with wave 4 (animatic) under way · branch `wave/3-assets` (cut from main after wave 2 merged in #2)
**Updated:** 2026-10-18

## v7 (2026-10-19, 11:31): `out/looming_v7.mp4` (3:24, −16.0 LUFS) and `out/looming_v7_backup.mp4` (9.48 MB) are rendered · director: "your goal is to get version 7"
What changed and how: the process log's v7 entry. Next is the director's: watch v7 with sound (no agent has listened: the Reels, the CS2, the fridge doors, s13's music), then notes. Known gaps: s18's shut laptop is still v6's size (smaller than Act 1's); `docs/05-sound.md` still lists `revealSleeper` as cut; the fridge has no preview or measured re-run of its shadows; s09a at 74.0/74.5 is order-dependent (old). `out/` is still the local folder; the Seagate drive is plugged in.

## v6 (2026-10-19, 00:50): `out/looming_v6.mp4` (3:21, −16.0 LUFS) and `out/looming_v6_backup.mp4` (8.91 MB) are ready for competition day · v5 (2026-10-18, 22:03; was "final"): the master is rendered (walk redone and spliced in) · submission is the director's · due 11:59 PM tonight
**Read `docs/notes/submit-tonight.md` first.** Ready: `out/looming_v5.mp4` (1080p, 3:15, −15.9 LUFS / −4.8 dBTP; for YouTube), `out/looming_v5_backup.mp4` (720p, 8.65 MB; the ProposalSpace upload), `out/stills/` (three PNGs). Everything is merged and pushed on `wave/3-assets`; no task worktrees are left. Fix round 1 (four builders after `evidence/cold-v4/report.md`) is merged; what's left is in `docs/notes/v4-fixlist.md`.
- **The director's, not the orchestrator's:** watch with sound (no agent has listened), upload to YouTube, confirm the flagged lines in doc 10 (and cut "captions" and "flash check": they don't exist), fill and submit the form. After: a PR from `wave/3-assets` to `main`, a tag and release, the `@ts-check` pass (plan step 9, a frame-hash no-op, deferred until after the deadline).
- **`out/` is a local folder** while the Seagate drive is unplugged. To restore after copying the finals across: `mv out out.local && ln -s "/Volumes/Seagate Storage/Media/Looming/out" out`.

## MORNING (2026-10-16): the overnight run finished at about 3 AM
**Read `docs/notes/morning-picks.md` first.** v2 (`out/v2_rough_cut.mp4`, 01:29) and v3 draft (`out/v3_draft.mp4`, 02:44) are rendered, both 3:15. All work is merged and pushed on `wave/3-assets`. No task worktrees are left except `asset-face-sheet` (stale, safe to remove). Fix list: `docs/notes/v3-fixlist.md`, plus `evidence/cold-v3/report.md`. Making-of ch 11 covers the night. Next: the director's notes on v3 → a v3.1 pass on the turn and the cold-viewer list → captions and the flash check → the 4K master Saturday night.

## OVERNIGHT RUN (2026-10-15 → 16): director asleep. Read this first.
Brief: G4 notes in `docs/notes/g4-2026-10-15.md`; decisions in doc 07 ("G4 on v1-animatic"). Goal: **v2 complete, then v3 close to complete**, both rendered (1080p, chunked), by morning. 4K stays Saturday.
**Authority:** freeze art by rule (most cut-paper, most Marston, simplest), and log every freeze plus its alternatives in `docs/notes/morning-picks.md`. No public actions (no tags, releases or PRs to main). No story changes beyond G4. The director does not review between v2 and v3.
**Usage (director: "go sparingly on the subagents, don't go ham, cause my usage limit"):** at most 2 subagents running at once; Sonnet for routine painter, docs and fix tasks, Opus only for design-heavy ones. Queue rather than parallelise. Loop heartbeat: 30 min.
**In flight:** `asset-home-kit` (Sonnet), `snd-g4` (Opus). **Merged:** `cut-gator` (the real gator), `spec-g4` (3:15, 21 shots), face sheet v1_3 frozen. **Queued:** `asset-marston-kit` (Sonnet), `asset-props-kit` (calendar, laptop, Calc 2 sheet/test, graded paper, blinds; plus `exam_room_kit` for s17b), then the v2 shot rebuilds. These include s00, s17b and s17c as new modules; home shots re-solved on the home-kit desk at real scale (the 'massive table': the desk unit is 2.2× real, flagged by spec-g4; Marston keeps its unit); s13's top-view eyes; the walk feet.
**Watchdog:** a scratchpad `watchdog.sh` logs to `out/watchdog.log` and kills headless Chrome when free disk < 3 GB or swap > 12 GB.
**Machine:** at most 2 Chromes; render with `--w ≤ 960` except final renders; full renders chunked (the script is in the making-of ch 10; the render script is in the session scratchpad). Stop builders if free disk < 3 GB or swap > 12 GB.
**Plan:**
1. **Wave 5a (no Chrome):**
   - Orchestrator: story doc 02 + shot specs for the new and changed scenes (s00 notification, s01/s02 calendar zoom with ∫, home laptop game, blinds made causal, Calc 2 practice, test day, grade back, calendar dissolve + tag replacing the pocket), the timeline extended to ~3:15 (`contract-timing`), and the cue sheet.
   - Painters (max 2 Codex at once): `cut-gator` (cut the frozen sheet, refit the rig, faces scaled 2.2–2.5× down, face sheet v1_3), `asset-home-kit` (bedroom + kitchen, scale-checked against the gator), `asset-marston-kit` (from the director's photos: maple desks, perforated cubicles facing ribbon windows, mesh Y-back chairs, ring pendants, linear strips), `asset-props-kit` (laptop, calendar, Calc 2 sheet/test with math glyphs, graded paper, blinds), `asset-boil-kit`.
2. **Wave 5b, v2:** rebuild shots with the frozen kits and the new scenes; blob dread meter; sound re-timed, new cues, loudness to -16 LUFS / -4 dBFS. Render `out/v2_rough_cut.mp4`. A cold-viewer subagent judges the frames and writes a fix list.
3. **Wave 5c, v3:** fixes plus polish (motion, secondary motion, light, colour, final mix). Render `out/v3_draft.mp4`.
4. **Chronicler** after each wave. Every done note has a `## Story` section.

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

**State of the reel (v1-animatic):** RENDERED 2026-10-15 15:33. `out/v1_animatic.mp4` (1080p, CRF 18, 617 MB, 3:00.00) and `out/v1_animatic_720p.mp4` (19 MB), sent to the director. The first render crashed in s06/s12 on s15's removed lamp geometry (fixed in `993b169`); it was re-rendered in 30 s chunks because the disk had about 670 MB free. Mix measured -13.9 LUFS, peak -1.6 dBFS: louder than the sound pass's -16 LUFS / -4 dBFS targets, to fix in the final mix. **Next:** the director watches it, then tag `v1-animatic` and make a GitHub Release with the MP4 (outward-facing: ask first).
1. For any future full render, use the chunked approach (render 30 s, encode, delete frames; see the making-of ch 10). A full frame set is about 1.3 GB.
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
