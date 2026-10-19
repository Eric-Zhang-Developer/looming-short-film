# Brief · walk-redo (s09c: make him walk, and look like himself)

**Type:** builder · **Model:** given at dispatch · **HARD time box: committed by 22:45 tonight.** The final is due 23:59; after you, the orchestrator re-renders 1:00–2:00 and splices it into the master. Anything not committed and working by 22:45 doesn't ship.
**Read first (quickly):** `AGENTS.md`, `src/shots/s09c.js`, `done/fix-walk.md`, `src/characters/gator.js` and `poses.js` (how other shots walk him: grep for `walk` across `src/shots/`), `src/characters/acting.js`. Look at the orchestrator's diagnosis frames: `evidence/walk-redo/gait_84.jpg` (12 fps over 84–86 s) and `evidence/walk-redo/walk_1s.jpg` (1 s over 82–102 s).

## The director, verbatim
"the gator walking to the library its a little fucked up can you redo that walk"

## What's wrong (orchestrator's read of the final master)
1. **He doesn't walk.** Over 2 s at 12 fps his legs barely change: he glides, crouched and stiff. He needs a clear walk cycle: alternating legs that plant and push, a body bob on each step, arms swinging (or holding the backpack straps), tail swaying. Footfalls should land on the 120 bpm pulse (whole half-seconds of global time from 84.0), which matches the score. Step rate may quicken toward Marston (the brief said pace quickens).
2. **He looks like a different, dirty character.** The hoodie reads muddy brown-grey, not the cream it is everywhere else, and every edge has a jagged white rim (the street lamps' rim light catching the cutout's torn edge). Fix his lighting so he reads as himself: a character fill that keeps the cream hoodie cream and the green green (match the s09b and s10 look), and kill or soften the white edge fringe.
3. **His head changes between frames:** some frames show a bug-eyed or frog-like head. Use one consistent side-view head for the whole walk, except the planned close-up at the block (92.333–93.667, keep it).
4. **The blob overlaps his lower body** and merges into one silhouette. Keep it beside or behind him with a clear gap, except at the block, where it plants in his path on purpose.

## Owns
`src/shots/s09c.js` only, plus `evidence/walk-redo/` and `done/walk-redo.md`.

## Frozen
- Every beat in `src/timeline.js`. The sound is built on them: lamps 84.0, 87.5, 90.5, 95.5, 97.0; `blobBlocks` 92.0; `stepAround` 94.0; `marstonSeen` 98.0.
- s09c's exports (`lamppost`, `lampKey`, `LAMP_COOL`, `LAMP_H`, `KEY_I`, `X`, `LAMP_X`, and his x(t)). The footsteps in `src/audio/cues.js` are placed from x(t), one per 0.024 m. If your walk cycle needs a different stride, keep x(t) as is and fit the cycle to it, or say exactly what changed so the sound can follow.
- Keep the shadow work from fix-walk (the lamps behind the blob throwing a long wedge).

## Acceptance (keep it lean; time matters more than polish)
- [ ] `evidence/walk-redo/gait.jpg`: 12 fps over 84.0–86.0 (24 frames), showing alternating legs and a bob
- [ ] `evidence/walk-redo/sheet.jpg`: one frame per second, 82–101 s
- [ ] `node tools/check_timeline.mjs` ok; determinism passes at three times in s09c; one frame of s10 still builds
- [ ] Short done note (`done/walk-redo.md`) with a `## Story` section (a few lines is fine tonight)

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use. Disk is tight: sheets and strips only, delete frames after. Stay in your worktree. Commit on `task/walk-redo`. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge.
