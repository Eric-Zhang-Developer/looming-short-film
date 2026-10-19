# Brief · v6-math (the practice sheets' math, drawn sharp)

**Type:** builder · **Version:** v6 · **Model:** given at dispatch · **Time box:** about 50 minutes.
**Read first:** `AGENTS.md`, `src/shots/s15.js` (`practiceSheet`, `SHEET_INK`, `penLine`), `src/shots/s16.js`, and how `src/shots/s17b.js` draws the test page's math crisply in code (`pageWithInk`, `drawLines`, `LINES`, `handFont`, `K = 4`). `done/spec-g4.md` has the math (every line is real Calc 2 except the crossed-out one, wrong on purpose: a sign error).

## The director, verbatim
"the og text like the one when gator is writing the practice papers if you see the math equations they are a little blurry"

## Cause (orchestrator's read)
s15 and s16's practice sheets (`practice_1`, `practice_2`) are props_kit paintings about 300 px tall; their math is pixels of that painting (`unmix` layers revealed by `SHEET_INK` boxes), magnified in the close-ups, so it blurs. The test page in s17b is sharp because its math is drawn by code at 4× in his hand font.

## Do
Draw the practice sheets' writing (name, problem, the working lines, the crossed-out line and its strike, the check, practice_2's parts, and anything s16's time-lapse writes) as code-drawn handwriting at high resolution, the s17b way (reuse `drawLines`/`handFont`, or export a shared helper from s17b if needed without changing s17b's output). Keep the paper (the painting's sheet) as the background, with the painted ink hidden or healed. Keep every reveal's timing: the pen still writes each line over the same beats, the strike lands on `crossOut`, the check on `problemOneSolved`. The math must stay correct (copy the lines from the painting or `done/spec-g4.md`, keeping the deliberate sign error).

## Owns
`src/shots/s15.js`, `src/shots/s16.js` (and an export-only addition to `s17b.js` if you must share its helper; s17b's frames must hash identical: check it), `evidence/v6-math/`, `done/v6-math.md`.

## Frozen
Every beat. s15's exports used elsewhere (`UNIT`, `BLOB_AT`, `PHONE`, `PAGE`, `CAM_B2`, `practiceSheet`, `SHEET_INK`, `penLine`): keep their behaviour for other importers (grep). s17b, s17c, s18 frames unchanged.

## Acceptance
- [ ] `evidence/v6-math/before_after.jpg`: full-res crops of the sheet at 3 times in s15 and 4 in s16 (global times from `src/timeline.js`), before and after
- [ ] check_timeline ok; determinism at 2 times in s15 and 3 in s16; s17b at one time hashes identical to before; tsc clean
- [ ] Done note ending with `## Story`

## Machine and git
One headless Chrome at a time, `--w ≤ 960` for sheets (full-res crops are fine); the orchestrator is rendering the v6 master in parallel. Commit on `task/v6-math`. **No trailers.** Don't push or merge.
