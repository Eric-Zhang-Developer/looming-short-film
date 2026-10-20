# v4 fix list (open)

## Fix round 1 (2026-10-18, after `evidence/cold-v4/report.md`): ranked, two builders, timeline frozen
The cold viewer read the rule unprompted. It missed **the decision** and found bed rot and the walk the weakest stretches, so the round spends everything on the climax (s07–s10). Re-render after it is chunks 30–120 only.
- **fix-bedroom** (`tasks/fix-bedroom.md`): 1) s09a: the decision on his face, not the blob's eye (C4 read as "the blob's huge eye looming over his body"; "I never see him decide"). 2) s07: plainly in bed on his phone, face visible, one cut in, a ceiling shadow that reads as the blob's ("reads as a UFO"). 3) s08 darker than s07. 4) s09a after `lampOn` reads as night, not day.
- **fix-walk** (`tasks/fix-walk.md`): 1) s09c: his fear on the walk (a close-up at the block; "could read as out for a walk with his pet"). 2) s09c: shadows long and dark enough to read the stretch. 3) s09b: the door reads as his bedroom door onto the hall ("a door, a mirror or a poster?"). 4) s10: the glass doors read as ice; the colour jump at 1:40–1:44. 5) s10: his front view reads as a frog.
- **Not this round (time):** the exam-hall heads read as frogs (2:40), the s17b clock unreadable (2:38), the blank page at 2:48, the ending's tone, the kitchen and game-night geography (0:26–0:38), the 0:40 lamp reading as a time jump.

Known issues from the batch-A builders' own measurements and the orchestrator's review of their sheets. The cold viewer on the v4 render adds to this; one fix round takes the top of it.

## After the deadline (found in fix round 1)
- **s09a determinism, 73.6–74.5:** frames differ only when rendered out of order (a fresh page and the in-order run match); the base commit 134495b does the same, and it isn't the lamp shadow. Likely state built lazily on first use. The chunked render is in order, so the master is safe; find it before any out-of-order re-render.
- **s09b, the blob blocks him in the doorway** for most of 1:17.5–1:21 in the final master: no frame makes a poster still (the spec's poster frame, the shadow thrown down the hall ahead of him, isn't clearly in any of them).
- **s07 ceiling shadow** still reads flat ("a UFO"); two caster flips were tried and rejected (`evidence/fix-bedroom/s07_caster_tried_*.jpg`).
- **Orchestration lessons:** a completion notice that says background work is still running is interim, so keep the worktree until the final one; never run a heavy encode (x265 slow) beside builders' renders; four headless Chromes grew swap by about 3 GB of disk.

## Climax, from the builders (measured)
- **s07** ceiling shadow covers 68% of the visible ceiling (spec ≥ 80%); a third runs off frame right (`done/climax-a1.md`).
- **s08** is not darker than s07 (mean luma 68.17 vs 68.18). The 3 a.m. bottom should read darker.
- **s09a** lamp's wall shadow is unmeasured against s07's ceiling shadow; Q17 wants it the biggest of the film.
- **s09b** end-wall shadow covers 57% of the wall (spec 80%); the C5 close-up has a soft blurred shadow edge at frame right (`done/climax-a2.md`).
- **s09c** lamp-beat puddles 1.32–1.36× (target ≤ 1.3); **the ground shadow is a faint thin streak on screen**, so long → under his feet → long doesn't read at sheet size. The side-step around the blob skates.
- **s10** before the push he shows only as white edge rims behind the glass, not a designed silhouette.

## Orchestrator review (by eye, sheets only)
- **s07: is he obviously in bed on his phone?** The director asked for it "really obvious and really plain". In the wide the lying gator reads as a green shape propped at the left, and the phone glow isn't clearly a phone in his hands. Check on the render; if the cold viewer misses it, add a close or medium on the phone in his hands under his chin.
- **s09a** close-up C4: the blob's huge eye at frame right next to his face reads oddly (a big grey disc). Check at speed.

## Carried from rig-v4
- The neck's cream is a little paler and smoother than the painted cream.
- `resolve` and `neutral` are hard to tell apart at 220 px (only the brow and a hair-thin line mouth differ).
