# Brief · fix-walk (fix round 1: the door, the walk, the threshold)

**Type:** builder (fix round) · **Wave:** 6 (v4) · **Model:** given at dispatch · **Time box: committed by 18:00 today** (the final is due 23:59; the master render follows this round)
**Read first:** `AGENTS.md`, `evidence/cold-v4/report.md` (all of it: your spec is what a first-time viewer could and couldn't read), `docs/notes/v4-fixlist.md`, `docs/02-story.md` (s09b–s10 and the acting map), `docs/shots/s09b.md`, `s09c.md`, `s10.md`, `done/climax-a2.md`, `src/shots/s09b.js`, `s09c.js`, `s10.js`, `src/characters/acting.js`, `docs/shots/README.md` §12. Look at `evidence/cold-v4/sheet_04.jpg` and `sheet_05.jpg` (1:12–1:58 of the cut).

## Goal
The walk is the climax: "I'm super scared but I made the decision" (the director). The cold viewer read the shadow rule, but on the walk his face was "too small; plodding, but could read as 'out for a walk with his pet'", the door was "a cut-away, stage-set-looking room" where it couldn't tell "a door, a mirror or a poster", and the glass doors read as "frosted, iced-over". Make the fear and the geography read.

## Owns
`src/shots/s09b.js`, `s09c.js`, `s10.js`; `evidence/fix-walk/`; `done/fix-walk.md`

## Frozen (do not change)
- **Every beat time in `src/timeline.js`**, shot starts and durations. The sound is built on them (the pulse from 84.0, a layer per lamp, the dissonance 92.0 → 94.0, the door push 103.0, the chord on `lightFlood` 103.5). Picture changes must land on the same beats.
- **Exports** other shots import: s09b (`closeupRig`, `HEAD_AT`, `HEAD_K`, `NIGHTSTAND_LAMP`), s09c (`lamppost`, `lampKey`, `LAMP_COOL`, `LAMP_H`, `KEY_I`, `X`, `LAMP_X`, and his x(t), which the footsteps read). Keep names and behaviour; if s09c's x(t) must change, say exactly how in the done note.
- No other files. If a fix needs a sound change, write it in the done note; don't make it.

## Fixes, in priority order (stop at the time box; the first two matter most)
1. **s09c: his fear on the walk.** Add one close-up on his face at the block: from `blobBlocks` (92.0) he stops, cut to the painted `dread` head (sweat drop), hold, then the `resolve` head before `stepAround` (94.0), and back to the wide as he steps around. That's where the score's dissonance and its resolution are. Elsewhere, push the wide in or lower it so his body language (hunched, quick steps, glances at the blob) reads at 400 px.
2. **s09c: the shadow stretch reads.** Now it reads as "a ground puddle". Between lamps the blob's shadow must be visibly long and dark, ahead of or behind him, and pull in under each lamp. Measured: between lamps the shadow is ≥ 3× the blob's width and its luminance ≤ 50% of the lit path beside it, at sheet size.
3. **s09b: the door reads.** It must read as his bedroom door opening onto a dark hall, with the front door at the end, from the room he just left. Lower or straighten the camera so the set doesn't read as a cut-away diorama; make the end-wall front door read as a door (frame, knob, the shadow's eye holes on it).
4. **s10: the glass doors read as glass, not ice.** The white torn rims read as frost. Give the doors a dark frame (metal or kraft) and a subtle reflection; keep the backlit silhouette. Also the colour jump at 1:40–1:44 ("a different saturated green with a dark hoodie"): match his green and hoodie to the walk's.
5. **s10: the front view reads as a frog.** At 1:44 he's front-on and "his head reads as a frog, not a croc". Use a ¾ or side view in the doorway so the snout reads, or turn the head so the snout shows.

## Acceptance
- [ ] `evidence/fix-walk/before_after.jpg`: the cold viewer's frames (76–110 s every 2 s, from `evidence/cold-v4/`) against yours at the same times
- [ ] `evidence/fix-walk/block_strip.jpg`: every 4th frame from 91.5 to 95.0 (the stop, the close-up, the step around)
- [ ] The between-lamp shadow length and luminance ratio, measured at two points
- [ ] `node tools/check_timeline.mjs` ok; determinism passes for s09b, s09c, s10; one frame each of s15 and s17c still builds (they import `closeupRig`)
- [ ] Done note ends with `## Story`

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use (another builder renders in parallel). Sheets and strips only, in your worktree's `out/`; delete frames once the jpg is made. Stay inside your worktree. Commit on `task/fix-walk` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, merge or open PRs.
