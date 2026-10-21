# Done · v11-walk

## What shipped
The blob is at 4.5× (r 0.054, 10.8 cm tall against his 8.5 cm head top) in s09c, s10, s10b, s11, s13 and s15, and each shot is re-staged so the size reads without the blob clipping him or a prop. In the walk and the stacks it towers beside and behind him. At the door it stops in the doorway, too big for it, before the light. At the desk it can't climb up: it looms behind the desk, tries (blobClimbs), and settles leaning on it (blobSettles). Shot lengths, beat times, his acting and the v9 eye map are unchanged.

## Where it lives
Branch `worktree-agent-ae60ea99b8355249b`. Commits: `0c5ee55` (s09c, s10), `254f640` (s10b), `ff85187` (s11, s15), `8d7fae7` (s13), `21f4c26` (v11 blocks on the six shot docs), plus the commit adding this note and the evidence.
- `src/shots/s09c.ts`, `s10.ts`, `s10b.ts`, `s11.ts`, `s13.ts`, `s15.ts`; a **v11** block at the top of each `docs/shots/<id>.md`.
- `evidence/v11-walk/`: `sheet.jpg` (the acceptance sheet), `determinism.txt`, `checks.txt`, `s09c-block.jpg` (the hop, the block and the step-around, 94.5–98.0), `s10-zoom.jpg` (the doorway at 960), `s15-before-wash.jpg` (B′ before the wall wash), `v10-sizes.jpg` (the same shots at the v11 tag, before this work).

Per shot:
- **s09c:** `BLOB_R` 0.054. `LAMP_H` 0.095 → 0.135, because a lamp below the blob's crown (0.108) throws the top of its silhouette into the sky. `GAP` 0.035 → 0.055, and `LAMP_X` now includes it, so each `lampN` is still the frame the blob is under its lamp. The block moved to (0.700, 0.080): past his snout and 2 cm behind his walk line, so his side-steps toward the lens pass in front of it. The hop after him changes planes on one drawing. Camera y 0.175, look y 0.060.
- **s10:** it trails him across the plaza, hops once to the doorway (x 0.030, 8 mm outside the glass) and stays there, filling the door. The wall cuts off its right flank. The flood takes lamp 5's tongue off his floor. The door squeeze is gone.
- **s10b:** it walks the aisle at a fixed x of −0.025, 4.5 cm behind him. When it rode his drift, it popped through the shelf wings' line.
- **s11:** new export `BEHIND` (0.045, −0.034, 0.015): on the floor between the privacy panel and the window wall. A new path keeps it behind him the whole time. blobClimbs is tiptoe against the back edge (+8 mm) and a 9° lean over the top. blobSettles is a 3° lean. New export `WASH`: a non-casting warm fill on the wall behind it. Focus is on his plane.
- **s13:** the hero blob is at r 0.054 at (0.030, 0.030), behind his desk and over the empty d3. Its pool shadow follows the existing formula (1.74×). The crowd's sizes are untouched.
- **s15:** the blob is at `BEHIND` with the wash. The shot has its own B′, `CAM_B15` (4 cm back, tipped up 4°). The CU moves 1.8 cm right. `CAM_B2`, `BLOB_AT`, `MARK` and `UNIT` are unchanged, because s16 imports them.

**New beats: none.** The v11 table gives s09c–s15 no gulp (they hold at 0.054), so `src/timeline.ts` is untouched.

## How it was checked
- [x] `evidence/v11-walk/sheet.jpg`, 16 frames: s09c at lamp1 (87), blobBlocks (95), stepAround (97) and marstonSeen (101); s10 at 0.5, 1.5 and 3.0 (105.5, 106.5, 108); s10b at 1.0 and 3.0 (114, 116); s11 at 0.5, 3.0 and 6.0 (117.5, 120, 123); s13 at 0.5 and 5.0 (124.5, 129); s15 at 1.5 and 5.5 (133.5, 137.5). I looked at every frame. The blob's crown is above his head in every s09c, s10b and s11 frame.
- [x] `node tools/determinism.ts --page=index.html --t=<t>`, one Chrome per time, at 95.25, 106.5, 114, 120, 129 and 133.5: all six PASS (`determinism.txt`).
- [x] `node tools/check_timeline.ts` gives `ok (27 shots, 91 beats, 228.0s)`, and `npm run typecheck` is clean (`checks.txt`).
- [x] No clipping at the block and the step-around: `s09c-block.jpg`, 12 frames over 94.5–98.0. Checked by eye at sampled frames, not with a full strip.
- Every render ran through a memory gate: at least 25% free and no other headless Chrome, one page per Chrome, w ≤ 960, sheets only.

## Gaps
- **s10 legibility (weak):** in the dark doorway the ink body barely separates from the night behind the glass. Its eyes, its highlight arc and the doorframe it fills carry the read (`s10-zoom.jpg`). I didn't add a backdrop light there. A fill like s11's `WASH` on the plaza behind it is the next thing to try if the director wants more.
- **s15 → s16 continuity is not mine to close.** s15 now ends with the blob behind the desk under `CAM_B15`, while s16 still opens on `CAM_B2` with whatever placement the v11-relapse builder chooses (`BLOB_AT` on the desk mark, as of v11). The orchestrator should check the cut at 140.0 after the merge.
- **s11's shadow is out of sight.** The pendant is in front of the blob and above it, so its shadow falls behind the desk. The old spec's "small pool under light from above" isn't on screen in s11. It follows from the light, but it's a change.
- **s13's pool shadow** is centred under the blob (deskRig's generic placement), not thrown north away from his pendant. Its scale is the formula's.
- At s15's B′ the crown sits just inside the top of the frame (a few px of margin at 480).
- The head-height comparison in s11 ("his head top about 6 cm over the desk") is measured by eye on the sheet, not computed.
- Sound for any new beat: none needed (no new beats). Nothing in `src/audio` was touched.

## Story
I started by rendering my six shots as they stood at the v11 tag (`v10-sizes.jpg`), so I'd know what the 2.5× staging looked like before I broke it. Then I set the radius to 0.054 and went shot by shot.

The walk gave the first surprise. The lamps had been tuned to sit just above his head, and the blob's crown is now higher than they are. A light below the crown throws the top of the shadow upward, so the lamps had to rise, and the posts with them. The block needed rethinking, not just resizing. A 12 cm wall on his own walk plane meant his snout went into it, and stepping back onto the line after going around would have walked him through it. Moving it 2 cm behind his line made the step-around pass cleanly in front (`s09c-block.jpg`).

The library was harder. Behind the desk was the only spot where it never crossed his hands or his page, and where s13's top-down could follow it onto an empty desk. But the first B′ render (`s15-before-wash.jpg`) showed two eyes and a floating highlight on a black wall: no body at all. Ink on a night wall is invisible. A warm, non-casting wash on the wall behind it fixed that, and the blob still keys off the zone light, so the ink stays ink. The doorway in s10 has the same problem, and I've left it named rather than solved.

## State
built · 2026-10-20
