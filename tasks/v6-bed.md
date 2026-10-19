# Brief · v6-bed (s07 bed rot: he lies on the bed, not above it)

**Type:** builder · **Version:** v6 · **Model:** given at dispatch · **Time box:** about 45 minutes; committed working beats polished.
**Read first:** `AGENTS.md`, `docs/shots/s07.md`, `src/shots/s07.js`, `done/fix-bedroom.md`, `src/characters/gator.js`, `poses.js`, `acting.js`.

## The director, verbatim
"few other problems you see how the gator is floating" (with a 1080p frame of s07's wide at about 0:49).

## What's wrong (orchestrator's read of v5, `out/looming_v5.mp4` 48–60 s)
1. **He and the blue duvet float above the bed.** In the wide, the duvet's underside sits roughly a mattress height above the mattress, with the dark bed frame and mattress visible beneath it. He should lie *on* the mattress, under or on the duvet, with the duvet draped onto the mattress (no gap), his head on a pillow by the headboard.
2. **His head breaks apart when he reclines.** In the wide and in the closer framing (about 50–53 s) the head reads as two pieces: the snout points straight up and a separate bump with an eye sits lower, beside the headboard, like two heads. Recline him so the head is one piece: lying back on the pillow, snout toward the ceiling or tilted toward the phone, with the eye on the head.
3. Keep: the phone's low cool light and the huge ceiling shadow (the rule), the blob on the bed, the clock and calendar on the wall, every beat and the cut-in to the phone.

## Owns
`src/shots/s07.js` only, plus `evidence/v6-bed/` and `done/v6-bed.md`. If the fix truly needs a pose in `poses.js`, add a new named pose there rather than changing an existing one, and say so.

## Frozen
Every beat in `src/timeline.js`. Exports other shots import from s07, if any (grep before changing). No other files.

## Acceptance
- [ ] `evidence/v6-bed/before_after.jpg`: v5 against yours at 49, 51, 54, 57 s
- [ ] `evidence/v6-bed/sheet.jpg`: one frame per second, 48–59
- [ ] `node tools/check_timeline.mjs` ok; determinism at three s07 times; `npx tsc --noEmit -p .` clean
- [ ] Done note `done/v6-bed.md` ending with `## Story`

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use; one other builder runs in parallel. Sheets and strips only; delete frames after. Stay in your worktree. Commit on `task/v6-bed` with a message that argues the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge.
