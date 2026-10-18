# Brief · fix-payoff (fix round 1: test day, the grade, the ending)

**Type:** builder (fix round) · **Wave:** 6 (v4) · **Model:** given at dispatch · **Time box: committed by 19:00 today** (the final is due 23:59; the master render follows)
**Read first:** `AGENTS.md`, `evidence/cold-v4/report.md` (2:22–3:12 especially), `docs/02-story.md` (the Payoff and the Ending), `docs/shots/s17b.md`, `s17c.md`, `s18.md`, `done/trims-marston.md`, `done/trims-home.md`, `src/shots/s17b.js`, `s17c.js`, `s18.js`, `src/clock.js`, `src/characters/acting.js`. Look at `evidence/cold-v4/sheet_07.jpg`, `sheet_08.jpg`, `sheet_09.jpg` (2:24–3:15).

## Goal
The payoff landed (the 94 and his grin were one of the cold viewer's three strongest moments), but the way in and the way out are murky: "I can't read the clock, so it doesn't say 'exam morning'" (2:38); "the heads look like frogs" in the exam hall, and it couldn't confirm the spotlit figure is him (2:40); "blank paper: handed in? turned over?" (2:48); and the ending's tone: "calm readiness or creeping dread? I can't tell" (3:10–3:12). The director's ending: the light from above, chosen now; a tiny drop for the Final; he makes a first mark. It should read as calm readiness.

## Owns
`src/shots/s17b.js`, `s17c.js`, `s18.js`; `evidence/fix-payoff/`; `done/fix-payoff.md`

## Frozen
Every beat time in `src/timeline.js` (the sound is built on them). Exports others import: `s17b.js` `PAGE`, `CAM_P`, `BLOB_AT`, `pageWithInk`, `flatHand`, `overheadSpot`, `loadHand`, `handFont`; `s02.js` imports in s18 (don't edit s02). `makeClock` as is. No other files.

## Fixes, in priority order
1. **s18, the ending reads as calm readiness.** At 3:02–3:12 his face is "neutral half-lids". Use the acting kit: a small, settled smile (`relief`'s mouth, or the painted `surprised_smile` held small if a close framing fits) as he looks at "Final", one slow breath, and the first mark made with intent. The tiny drop stays tiny. The dashed outline at 3:08 ("its old size, or the next one forming?") should read as the next one forming: fainter and smaller, or remove it if it can't be read in time.
2. **s17b, exam morning reads.** The clock insert must be legible at 400 px: bigger in frame, held ≥ 1 s, at 9:00 with the second hand stepping. In the hall, the classmates' heads from behind read as frogs: give them gator snouts in profile or ¾ (turn a few heads), or frame so his snout shows, and make the spotlit figure clearly him (his hoodie colour, the snout).
3. **s17c, the hand-in.** The blank page at 2:48 must read as "the paper comes back": e.g. the page slides in face down and flips to the 94, or a hand sets it down. Within the existing beats.

## Acceptance
- [ ] `evidence/fix-payoff/before_after.jpg`: the cold viewer's frames 2:36–3:14 every 2 s against yours
- [ ] `evidence/fix-payoff/ending_strip.jpg`: every 4th frame from 185.0 to 194.0
- [ ] `node tools/check_timeline.mjs` ok; determinism passes for s17b, s17c, s18
- [ ] Done note ends with `## Story`

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use; up to three other builders run in parallel. Sheets and strips only, in your worktree's `out/`; delete frames once the jpg is made. Stay inside your worktree. Commit on `task/fix-payoff` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, merge or open PRs.
