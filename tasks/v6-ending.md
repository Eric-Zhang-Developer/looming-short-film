# Brief · v6-ending (s18's tag: the drop becomes his first mark, and he smiles)

**Type:** builder · **Version:** v6 (v5 is submitted; this is for competition day, Oct 26) · **Model:** given at dispatch · **Time box:** about 60 minutes, committed working beats polished.
**Read first:** `AGENTS.md`, `docs/02-story.md` (Theme, the Ending, Story rules), `docs/shots/s18.md`, `done/fix-payoff.md`, `src/shots/s18.js`, `src/characters/acting.js`, and how `closeup_heads` is used (grep `closeup_heads` and `HEAD_AT` in `src/shots/`). Look at s02's birth bead (`src/shots/s02.js`), which the tag rhymes with.

## The director, verbatim
On the old tag: "I do like how there's another blob that comes out with the [Final], but it's not that satisfying. It doesn't come to a wholesome resolution." Approving the new one: "lets do that and maybe gator smiles".

## The idea
The blob was always ink, and ink is for writing. The film opens with ink running off a date and turning into dread; it should end with ink going back onto the page as work. The new drop comes back (exams do), but this time he looks at it and doesn't look away, so by the film's own rule it doesn't grow. Under the lamp its shadow is a dot. It hops onto his pen nib on its own, and the first stroke of the Final is written in its ink. He smiles. Same material, opposite meaning.

## Beats (s18 local; all frozen: newDate 12.5, dropQuivers 14.0, tagPenUncap 16.5, end 20.0)
- **12.5 newDate:** unchanged ("Final" and its red circle).
- **14.0 dropQuivers:** the drop beads on the circle as now (s02's bead). **He looks straight at it and holds the look** (≥ 1 s, no glance away). It quivers but does **not** gulp or grow. Its shadow under the lamp stays a small dot; make that visible.
- **16.5 tagPenUncap:** he uncaps the pen and holds the nib out near the drop. The drop blinks up at him (the blob's blink, one), then **hops onto the nib willingly** (a small arc, squash on landing, it goes into the nib). Willing, never taken: he doesn't stab or scoop it.
- **The smile:** a clear, warm smile, not the small relief mouth. It reads at 400 px. Use the painted `surprised_smile` (or `relief`) close-up head if a framing allows, or the acting kit's smile on the wide, held ≥ 1 s, landing as the drop settles into the nib or as the stroke goes down.
- **The first stroke:** the nib touches the sheet and draws one dark stroke (the "1." or a first line) in the drop's ink: black, slightly glossy like the blob, not the pen's usual line. Hold on it, then the existing fade to black by 20.0.

## Owns
`src/shots/s18.js`; in `src/audio/cues.js`, only new cue lines in s18's tag (at most two, e.g. a soft ink "plip" on the hop landing, using an existing foley sound); `evidence/v6-ending/`; `done/v6-ending.md`.

## Frozen
Every beat in `src/timeline.js`. s18 before local 12.0 (the cross-off, the absorb, the sit-back) stays as is. Its imports from s02 and s17b stay; don't edit those files. The score (`score.js`) as is: the reprise on dropQuivers and the theme on the uncap already fit.

## Acceptance
- [ ] `evidence/v6-ending/strip.jpg`: every 4th frame from 185.0 to 195.0 (global), at 1080p cropped readable
- [ ] `evidence/v6-ending/beats.jpg`: one frame each at the look, the hop, the landing, the smile, the stroke
- [ ] `node tools/check_timeline.mjs` ok; determinism passes at 189.5, 192.0, 193.5; `npx tsc --noEmit -p .` clean
- [ ] Done note `done/v6-ending.md` ending with `## Story`, saying plainly anything that didn't land

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use. Sheets and strips only; delete frames after. Stay in your worktree. Commit on `task/v6-ending` with a message that argues the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge.
