# NOW

**Wave:** 2 · Foundations · branch `wave/2-foundations` · **planned, waiting on the director to dispatch batch 1**
**Updated:** 2026-10-15

## Plan
`docs/contracts.md` fixes every module interface. 11 tasks in 4 dependency batches, at most 4–5 builders at once:

| Batch | Tasks | Needs |
|---|---|---|
| 1 | `mod-core`, `mod-render`, `mod-timeline`, `tool-gen` | nothing |
| 2 | `mod-paper`, `mod-lights`, `mod-blob`, `mod-post` | `mod-core` merged |
| 3 | `mod-material` | `mod-paper`, `mod-lights` |
| 4 | `mod-puppet`, `lookdev-composite` | everything |

Each batch's tasks are squash-merged into `wave/2-foundations` after the orchestrator checks the evidence. `lookdev-composite` is the real paper test: painted Codex pieces lit in the full rig.

## Blocked
- none

## Next 3 moves
1. Director approves batch 1. Dispatch 4 builders in worktrees.
2. Check evidence, merge, dispatch batch 2.
3. Batches 3–4, then the wave 2 PR with the lookdev result.

## Open director questions
- Dispatch batch 1?
- Final submission deadline (confirm on ProposalSpace).

## Models
- Orchestrator: claude-opus-5-5
- Builders: opus for paper, lights, blob, material, puppet, core, tool-gen and lookdev; sonnet for render, timeline and post (well-specified ports)
