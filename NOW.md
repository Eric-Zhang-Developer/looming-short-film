# NOW

**Wave:** 2 · Foundations · branch `wave/2-foundations` · **batch 1 merged; batch 2: post + lights merged; sound engine merged; style tile + foley + score started early**
**Updated:** 2026-10-15

## In flight
| Task | Kind | Notes |
|---|---|---|
| `mod-material` | batch 3 builder | batch 2 all merged |
| `snd-foley`, `snd-score` | builders (wave 6, early) | `snd-engine` merged; full mix -14.5 LUFS |
| `sb-act1`, `sb-act2`, `sb-act3` | storyboard (docs) | parallel track |
| `asset-style-tile` | painter | first live `gen.mjs` run; ends at **G1** |

## Plan
| Batch | Tasks | Needs | State |
|---|---|---|---|
| 1 | `mod-core`, `mod-render`, `mod-timeline`, `tool-gen` | nothing | merged |
| 2 | `mod-paper`, `mod-lights`, `mod-blob`, `mod-post` | `mod-core` | merged |
| 3 | `mod-material` | `mod-paper`, `mod-lights` | in-progress |
| 4 | `mod-puppet`, `lookdev-composite` | everything | todo |

## Blocked
- none

## Next 3 moves
1. Merge `mod-material`, then dispatch batch 4 (`mod-puppet`, `lookdev-composite`).
2. When the style tile lands, bring the variants to the director for **G1** (contact sheet over grey and navy).
3. Fold the storyboard asset lists into `assets/specs.json` for wave 3; batch 4, then the wave 2 PR.

## Carry-overs for wave 3
- `assets/prompts/style_tile.v1.md` asks for a green key; v2 (alpha-first) is in progress in `asset-style-tile`.
- `reference-videos/` exists only in the main checkout. Painters in worktrees use the absolute path, and `gen.mjs` should resolve it against the main checkout.
- Cut PNGs are gitignored (`assets/cut/*.png`); they regenerate from a frozen sheet plus its boxes JSON.
- Stage gained `setRender` (implemented by `mod-post`). Addon pages need `three/examples/jsm/` in the import map (contracts updated).

## Open director questions
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
