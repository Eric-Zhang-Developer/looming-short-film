# NOW

**Wave:** 2 · Foundations · branch `wave/2-foundations` · **batch 1 merged; batch 2 half merged; wave 3 style tile started early**
**Updated:** 2026-10-15

## In flight
| Task | Kind | Notes |
|---|---|---|
| `mod-paper`, `mod-lights`, `mod-blob` | batch 2 builders | `mod-post` merged |
| `snd-engine` | builder | parallel track |
| `sb-act1`, `sb-act2`, `sb-act3` | storyboard (docs) | parallel track |
| `asset-style-tile` | painter | first live `gen.mjs` run; ends at **G1** |

## Plan
| Batch | Tasks | Needs | State |
|---|---|---|---|
| 1 | `mod-core`, `mod-render`, `mod-timeline`, `tool-gen` | nothing | merged |
| 2 | `mod-paper`, `mod-lights`, `mod-blob`, `mod-post` | `mod-core` | post merged |
| 3 | `mod-material` | `mod-paper`, `mod-lights` | todo |
| 4 | `mod-puppet`, `lookdev-composite` | everything | todo |

## Blocked
- none

## Next 3 moves
1. Merge batch 2 builders as each one finishes; dispatch `mod-material` once paper and lights are in.
2. When the style tile lands, bring the variants to the director for **G1** (contact sheet over grey and navy).
3. Fold the storyboard asset lists into `assets/specs.json` for wave 3; batch 4, then the wave 2 PR.

## Carry-overs for wave 3
- `assets/prompts/style_tile.v1.md` asks for a green key; v2 (alpha-first) is in progress in `asset-style-tile`.
- `reference-videos/` exists only in the main checkout. Painters in worktrees use the absolute path, and `gen.mjs` should resolve it against the main checkout.
- Cut PNGs are gitignored (`assets/cut/*.png`); they regenerate from a frozen sheet plus its boxes JSON.
- Stage gained `setRender` (implemented by `mod-post`). Addon pages need `three/examples/jsm/` in the import map (contracts updated).

## Open director questions
- Final submission deadline (confirm on ProposalSpace).

## Models
- Orchestrator: claude-opus-5-5
- Builders: opus for paper, lights, blob, material, puppet, core, tool-gen and lookdev; sonnet for render, timeline and post (well-specified ports)
- Painters: opus
