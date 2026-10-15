# NOW

**Wave:** 3 · Assets, with wave 4 (animatic) under way · branch `wave/3-assets` (cut from main after wave 2 merged in #2)
**Updated:** 2026-10-15

## In flight
| Task | Kind | Notes |
|---|---|---|
| `anim-s02`, `anim-s03`, `anim-s04`, `anim-s09`, `anim-s15` | animatic shot builders (opus), batch 1 | Cut off by the 5-hour usage limit and resumed with SendMessage after the reset. Worktrees are in `~/.worktrees/looming/anim-sNN`. |

## Waiting on the director
- **G1 · style tile.** The recommendation is a **v3 tile under a value-contrast rule**: props in cream, kraft, green, amber or red; navy only for walls and sky; +4 generations on top of the style_tile cap (7 of 8 used). Lookdev showed the v2 navy props disappearing into the navy wall. v2 variants are in `evidence/asset-style-tile/contact.jpg`; lookdev evidence is in `evidence/look-pass-2/`.
- **Q1–Q9** in `docs/shots/QUESTIONS.md`: quiet-shot motion, neighbour click, s18 timing, second red circle, blob growth, phone shadow, the Exam's look, Thursday marker, gator legs. The specs and the animatic follow each question's "(current)" option until answered.
- **Repo hygiene:** `Gator Create Competition - Transcription.md` (third-party page text) is tracked at the repo root since 309bb41. I recommended removing it; waiting on a yes.
- The deadline is still unconfirmed (ProposalSpace).

## Next moves
1. Merge batch 1 as each shot finishes. Merge pattern: check the diff touches only its owns, run `determinism.mjs` on `index.html` across the shot, convert any PNG over 2 MB to JPEG, squash with a "why" message, remove the worktree, update the board.
2. Batch 2: s05, s06 (mirror s15's numbers from `done/anim-s15.md`), s07, s10, s16. Batch 3: s08, s11, s12, s14, s17. Batch 4: s18. Brief: `tasks/anim-shot.md`. Builders use `src/characters/` rigs, take `visible` sizes from `assets.load`, and save JPEG evidence. **Pace:** at most 5 concurrent builders; use Sonnet for simpler shots (s05, s08, s10, s14), and check `get_usage` before each batch.
3. When all 18 are blocked: assemble the animatic (`render.mjs --frames` then `--encode` with `out/audio/mix.wav`), run 3 cold viewers (doc 02's readability questions) and a judge, then gate **G4**. Tag `v1-animatic` with a Release.
4. After G1: v3 style tile → freeze → gator and face sheets (G2) → sets and props per `docs/assets.md` (20 frozen) → G3 test shot.

## Carry-overs and known gaps
- **Mix headroom:** premix PLR is 12.36 dB against loudnorm's 12.5 dB linear limit, so s05/s07 foley sits under spec level. Wave 6: a limiter or makeup gain in `tools/mix.mjs`.
- **s01:** the window reads grey and the dawn could pass for dusk. Its local proxy padding now stacks with proxy-margin, so the building is about 8% big. Fix in the final pass.
- **s13:** reads dark and busy at thumbnail size (check at G4). Back-to-back figures merge.
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
