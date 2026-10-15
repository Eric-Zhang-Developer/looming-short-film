# NOW

**Wave:** 1 · Smoke tests · branch `wave/1-smoke` · **both tasks built and checked; wave PR open**
**Updated:** 2026-10-15

## In flight
- Wave 1 PR to `main`, waiting on the director.

## Results
- `smoke-codex`: **pass.** Headless `codex exec` works (exit 0, 88 s, no prompt). Real alpha returned. Image cost unknown (not in events).
- `smoke-paper`: **pass on every acceptance item.** Cutout-shaped shadows, 2.95x phone loom, small lamp pool, deterministic, ~10 ms/frame. Surfaces read as vector/3D, not paper.

## Blocked
- none

## Next 3 moves
1. Director merges the wave 1 PR.
2. Write `docs/contracts.md` and plan wave 2 (foundations).
3. Early look-dev task: composite the Codex style-tile pieces onto the smoke-paper light rig. That's the real paper test, since procedural surfaces didn't read as paper.

## Open director questions
- Final submission deadline (confirm on ProposalSpace).
- Merge wave 1?

## Models
- Orchestrator: claude-opus-5-5
- Builders and painters: claude-opus-5-5
