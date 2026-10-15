# NOW

**Wave:** 2 · Foundations · branch `wave/2-foundations` · **batch 1 merged; batch 2: post + lights merged; sound engine merged; style tile + foley + score started early**
**Updated:** 2026-10-15

## In flight
| Task | Kind | Notes |
|---|---|---|
| `sb-act1`, `sb-act2`, `sb-act3` | storyboard (docs) | parallel track |
| **G1** | director | revised after lookdev: recommend a v3 tile with a value-contrast rule (+4 generations) instead of freezing a v2 |
| `look-pass-1` | builder | code-side look fixes: rim, night grade, light shapes, paper cache |

## Plan
| Batch | Tasks | Needs | State |
|---|---|---|---|
| 1 | `mod-core`, `mod-render`, `mod-timeline`, `tool-gen` | nothing | merged |
| 2 | `mod-paper`, `mod-lights`, `mod-blob`, `mod-post` | `mod-core` | merged |
| 3 | `mod-material` | `mod-paper`, `mod-lights` | merged |
| 4 | `mod-puppet`, `lookdev-composite` | everything | merged (lookdev: look half passes) |

## Blocked
- none

## Next 3 moves
1. Open the wave 2 PR once look-pass-1, contract-puppet and snd-score-clicks merge (lookdev before/after as headline evidence).
2. **Waiting on G1.** On the pick: freeze it to `assets/frozen/style_tile.png` (despilled), then dispatch the gator sheet painter (G2).
3. `sb-reconcile` running (one pass over all 18 shot specs: blob size, s06/s15 lamp continuity, s10 fluorescent vs. shadow rule, s13 crane ban, 11 proposed beat names + snd-score's fridge/gameNight/curtainsStart/scrollStart/marstonEnter into `src/timeline.js`). Then fold the storyboard asset lists into `assets/specs.json` for wave 3; batch 4, then the wave 2 PR.

## Carry-overs for wave 3
- `assets/prompts/style_tile.v1.md` asks for a green key; v2 (alpha-first) is in progress in `asset-style-tile`.
- `reference-videos/` exists only in the main checkout. Painters in worktrees use the absolute path, and `gen.mjs` should resolve it against the main checkout.
- Cut PNGs are gitignored (`assets/cut/*.png`); they regenerate from a frozen sheet plus its boxes JSON.
- Stage gained `setRender` (implemented by `mod-post`). Addon pages need `three/examples/jsm/` in the import map (contracts updated).

## Open director questions
- **Story-beat conflicts from sb-act3 (one-way doors, ask after reconcile):** s17 "only light and boil move" vs doc 02's sit-back and pocket climb; a 4th lamp click (the neighbor's); s18's click at 2:44 squeezes the walk-over; a second red circle on the new calendar.
- **For G2/animatic (from sb-act2):** (a) blob size: contract 0.025 m is over half the gator's height; storyboard used 0.012 m. (b) A phone that lights the blob also lights its holder, so a true phone loom throws the gator's own giant shadow too; sb-act2 aimed the light at the blob only. Film-wide call.
- **G2 agenda: the Exam's look.** `mod-blob` reads as glossy CG gel (cute, nervous), not ink on paper; the specular highlight can sit where a mouth would. Options to show at G2: keep gel, matte ink with a painted highlight, or a painted Codex blob on paper. Evidence: `evidence/mod-blob/squash_strip.jpg`.
- Final submission deadline (confirm on ProposalSpace).

## Models
- Orchestrator: claude-opus-5-5
- Builders: opus for paper, lights, blob, material, puppet, core, tool-gen and lookdev; sonnet for render, timeline and post (well-specified ports)
- Painters: opus

## Notes
- Fluorescent is a DirectionalLight (doc 04 updated). Lamp angle 0.35 reads better than the contract default 0.6 in the lab; shots pass it explicitly.
- `src/audio/selftest.js` needs a full `node tools/mix.mjs` run first (a `--range` mix overwrites `out/audio/mix.wav`).
- Paper rim reads ~1 px at wide framing (reference ~2% of object size). Revisit after lookdev; likely a `contract-paper` change to object-relative rim width.
- r186 casts cut-out shadows from `alphaMap` alone (confirmed by lights and paper builders).
- Score: `evidence/snd-score/score.mp3` (full mix, listenable). Nothing has been checked by ear yet; the director's first listen is due at G4.
