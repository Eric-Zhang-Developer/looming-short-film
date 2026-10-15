# NOW

**Wave:** 3 · Assets, with wave 4 (animatic) under way · branch `wave/3-assets` (cut from main after wave 2 merged in #2)
**Updated:** 2026-10-15

## In flight
| Task | Kind | Notes |
|---|---|---|
| `anim-s15` | builder (fix round) | the loom shadow must be in frame before the click; s06 waits on it |
| `exam-ink` | builder | Q7 matte ink; owns `src/blob.js` |

Merged so far: s01–s05, s07–s10, s13 (10 of 18). Style tile v3 is built and **awaiting the director's G1/G2 pick** (recommendation: v3_4).

**Disk:** the machine ran out of space on 2026-10-15 (about 1.7 GB free after). Looming itself uses about 600 MB, so the cause is elsewhere. Keep at most 3 builders until there's more room.

## Director decisions (2026-10-15)
- **G1:** "make style tile v3 with the value-contrast rule (+4 generations)". `asset-style-tile-v3` is running: 4 variants, each a different gator design direction. The director also said "the gator is really ugly ngl", so appeal is the priority. **G1/G2 pick comes next.**
- **Q1–Q9:** "go with every recommendation". The specs already follow them. Still to do: **Q7 Exam matte ink** (task `exam-ink`, queued until a code-writer slot frees; it owns `src/blob.js`).
- Still open: removing the third-party transcription file from the repo, and the deadline.

## Next moves
1. Merge batch 1 as each shot finishes. Merge pattern: check the diff touches only its owns, run `determinism.mjs` on `index.html` across the shot, convert any PNG over 2 MB to JPEG, squash with a "why" message, remove the worktree, update the board.
2. Batch 2: s05, s06 (mirror s15's numbers from `done/anim-s15.md`), s07, s10, s16. Batch 3: s08, s11, s12, s14, s17. Batch 4: s18. Brief: `tasks/anim-shot.md`. Builders use `src/characters/` rigs, take `visible` sizes from `assets.load`, and save JPEG evidence. **Pace:** at most 5 concurrent builders; use Sonnet for simpler shots (s05, s08, s10, s14), and check `get_usage` before each batch.
3. When all 18 are blocked: assemble the animatic (`render.mjs --frames` then `--encode` with `out/audio/mix.wav`), run 3 cold viewers (doc 02's readability questions) and a judge, then gate **G4**. Tag `v1-animatic` with a Release.
4. After G1: v3 style tile → freeze → gator and face sheets (G2) → sets and props per `docs/assets.md` (20 frozen) → G3 test shot.

## Carry-overs and known gaps
- **Mix headroom:** premix PLR is 12.36 dB against loudnorm's 12.5 dB linear limit, so s05/s07 foley sits under spec level. Wave 6: a limiter or makeup gain in `tools/mix.mjs`.
- **s01:** the window reads grey and the dawn could pass for dusk. Its local proxy padding now stacks with proxy-margin, so the building is about 8% big. Fix in the final pass.
- **s13:** reads dark and busy at thumbnail size (check at G4). Back-to-back figures merge.
- **s07:** the seam light at 8.0 is 7.3% (spec 5%), and he's a backlit silhouette during the montage. Fix in the final lighting pass. Its straight-cut curtains conflict with s08's torn, glowing rims.
- **s08:** his face is a few px of proxy, so the yawn reads from the shadow's eyes. The ladder from s07 is still in frame (fine for continuity, but check at G4).
- **The blob draws 2.73 cm, not 2.4.** Any shot spec that derives a shadow width from 2.4 is off by 14%. The scale is the truth.
- **The rig's legs are 37% of the gator's height** (the tile's are about 20%); flagged on Q9. `hipHeight` must be re-measured from the real `leg_l` once art is frozen.
- **Paper rim** at wide framing: fixed by look passes 1–2. Rims take the light's colour, where the reference's are painted white.
- `render.mjs` takes no query strings.
- The paper cache won't hold a 25 s held shot at 4 Hz boil.
- Cut PNGs (`assets/cut/*.png`) are gitignored. Unfrozen `*.boxes.json` stay untracked.

## Models
- Orchestrator: claude-opus-5-5
- Builders: opus for rigs, contracts and hard shots; sonnet for well-specified fixes and simpler shots
- Painters: opus

## Session hand-off
Read AGENTS.md, docs/09-orchestration.md, this file and tasks/board.md. Resume the /loop. Subagent reports arrive as messages; merge per step 1.
