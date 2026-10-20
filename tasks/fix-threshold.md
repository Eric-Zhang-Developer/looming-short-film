# Brief · fix-threshold (fix round 1: s10, the glass doors and his face at the door)

**Type:** builder (fix round) · **Wave:** 6 (v4) · **Model:** given at dispatch · **Time box: committed by 19:00 today** (the final is due 23:59; the master render follows)
**Read first:** `AGENTS.md`, `evidence/cold-v4/report.md` (1:40–1:48 especially), `tasks/fix-walk.md` (fixes 4 and 5 are yours now), `done/fix-walk.md`, `done/climax-a2.md`, `docs/shots/s10.md`, `src/shots/s10.js`, `src/shots/s09c.js` (its exports), `docs/shots/README.md` §12. Look at `evidence/cold-v4/sheet_05.jpg` (1:36–1:58).

## Goal
The threshold is the release: he pushes Marston's door and the light from above shrinks the shadow to a puddle. The cold viewer saw "a frosted, iced-over glass door" (1:42), "a different saturated green with a dark hoodie" (1:40–1:44), and at 1:44 "his head reads as a frog, not a croc".

## Owns
`src/shots/s10.js`; `evidence/fix-threshold/`; `done/fix-threshold.md`

## Frozen
Every beat time in `src/timeline.js` (the sound peaks on `doorPush` 103.0 and cuts to one chord on `lightFlood` 103.5). s09c's exports, which s10 imports: note fix-walk changed **`LAMP_H` from 0.105 to 0.095**, so re-check s10's lamp 5 looks right. No other files.

## Fixes, in priority order
1. **Glass, not ice.** The white torn rims on the doors read as frost. Give the doors a dark frame (Night Navy or a dark metal grey, in the paper material), clear panes with one soft diagonal reflection, and keep his backlit silhouette behind the glass before the push.
2. **The colour jump.** His green and hoodie at 1:40–1:44 must match the walk's (s09c) and the close-up's. Compare frames at 101.5 (end of s09c) and 102.5 and fix the grade or the light, not the art.
3. **The front view reads as a frog.** In the doorway wide (from about 1:44) he's front-on. Turn him to ¾ or side so the snout reads, or turn the head so the snout shows in profile; the blob beside him stays.
4. Keep the snap: the floor shadow tongue just before `lightFlood` and the puddle on it must still measure as before (5.7× → 1.14×, `done/climax-a2.md`), or better.

## Acceptance
- [ ] `evidence/fix-threshold/before_after.jpg`: the cold viewer's frames at 100–110 s every 2 s against yours
- [ ] `evidence/fix-threshold/snap.jpg`: just before and on `lightFlood`, with the shadow ÷ blob ratio measured
- [ ] `node tools/check_timeline.mjs` ok; determinism passes for s10
- [ ] Done note ends with `## Story`

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use; up to three other builders run in parallel. Sheets and strips only, in your worktree's `out/`; delete frames once the jpg is made. Stay inside your worktree. Commit on `task/fix-threshold` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, merge or open PRs.
