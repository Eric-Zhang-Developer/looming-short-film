# Brief · v6-stacks-2 (s10b: he comes toward us, and looks like himself)

**Type:** builder · **Version:** v6 · **Model:** given at dispatch · **Time box:** about 50 minutes.
**Read first:** `AGENTS.md`, `done/v6-stacks.md`, `docs/shots/s10b.md`, `src/shots/s10b.js`, v3's original (`git show 228d5b2^:src/shots/s10.js`), `evidence/v6-stacks/sheet.jpg`, `src/characters/gator.js`.

## What's wrong (orchestrator's review of v6-stacks)
1. **He barely approaches the lens.** Over 6 s he grows only slightly in frame; v3's walk brought him visibly toward the camera. Make the walk read as coming toward us: he should end clearly closer (roughly 1.5–2× his starting height on screen), with the blob following.
2. **His front view reads as a frog** (the known front-view problem: a wide flat head with eyes on top, no snout). Use a ¾ view so his snout shows, as other shots solve it (grep how s17b and s10 handle "snout" and "frog"), or angle the camera so his snout reads.
3. **The shadow pools are a thin sliver** at this low camera. Raise the camera a little or lower the lens tilt so the small pool on the carpet reads as a pool at 400 px.

## Owns
`src/shots/s10b.js`, `docs/shots/s10b.md`, `evidence/v6-stacks-2/`, `done/v6-stacks-2.md`. Beats `pocketPhone` 1.0, `underLight1` 2.0, `underLight2` 4.5 are frozen (the score and cues use them).

## Acceptance
- [ ] `evidence/v6-stacks-2/sheet.jpg`: every 0.5 s over 110–116, plus v6-stacks' frames at 110.5 and 115.5 beside yours
- [ ] check_timeline ok; determinism at 110.5, 112.5, 115.2; tsc clean
- [ ] Done note ending with `## Story`

## Machine and git
One headless Chrome at a time, `--w ≤ 960`; two other builders render in parallel; disk ≈ 6 GB. Sheets only. Commit on `task/v6-stacks-2`. **No trailers.** Don't push or merge.
