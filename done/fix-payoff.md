# Done · fix-payoff

## What shipped
- **Fix 1, s18, the ending as calm readiness: done.** `relief` now carries from the sit-back to the end (no second `resolve` at the tag), with the small smile from the tag's first frame, a 5 s breath, and the first mark as before (touch 17.55, mark done 18.1). The dashed ghost of the old blob beside "Final" is removed; the tiny drop stays tiny.
- **Fix 2, s17b, exam morning: done.** The clock insert reads 9:00: the second hand is now thin and red (it was navy and minute-hand weight, which at :12 read as "12:10"), the dial fills 84% → 92% of frame (was 70%), held the same 1.0 s. In the hall, the classmates sit in profile (turned 12–32°) with snouts, in dimmed greens and hoodies. He is the one in the cream hoodie in the spotlight, and his snout shows.
- **Fix 3, s17c, the hand-in: done.** His hand rides the paper in by its left edge from 0.58 and carries on to the flip at 1.33, and the back shows the red circle and checks faintly through the paper (no number, so the 94 is still the reveal at 2.0).

## Where it lives
`src/shots/s18.js` (27753e0), `src/shots/s17b.js` (643c37f), `src/shots/s17c.js` (commit after those). Evidence in `evidence/fix-payoff/`. Exports of s17b are unchanged (`PAGE`, `CAM_P`, `BLOB_AT`, `pageWithInk`, `flatHand`, `overheadSpot`, `loadHand`, `handFont`); s02, `timeline.js` and `clock.js` untouched.

## How it was checked
- [x] `evidence/fix-payoff/before_after.jpg`: frames 156–194 every 2 s. Rows 1, 3, 5, 7 are the cold viewer's (cropped from `evidence/cold-v4/sheet_07/08/09.jpg`), rows 2, 4, 6, 8 are mine at the same times. Cold has no 194 frame (black cell). The cold sheets' start times were inferred (sheet_07 = 144, sheet_08 = 168, sheet_09 = 192) from the report's own timestamps. At 168.0 the cold frame shows a blank page where mine shows the empty table (the paper enters at 0.5 in the code); I didn't find out why they differ.
- [x] `evidence/fix-payoff/ending_strip.jpg`: every 4th frame, 185.0 → 194.0 (55 frames).
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`; `node tools/determinism.mjs --t=158.5,160,161.5,165,168.8,169.4,171,176,182,187,189,193` → all PASS (`checks.txt`). That covers s17b, s17c and s18 (and s17 at 158.5 is s17b, 176 and 182 are s18).
- Calm vs dread is my reading of the strip, not a cold-viewer test. **Not verified by anyone fresh.**

## Gaps
- **The clock hold is still 1.0 s** (0–1.0 then the wide). The brief said ≥ 1 s; I didn't move the cut so no picture event shifts under the sound. Two second-hand steps only (at 0.0 and 1.0).
- The red second hand is a code mesh added into `clock.group.children[3]` (the second-hand group, by clock.js's build order), hiding the navy one. It breaks if clock.js's child order changes. Only s17b is affected; s02 and s18 keep the navy hand.
- s17b sets `camera.near = 0.002` (the stage's 0.05 clipped the clock). This is per shot, as s00 does.
- The classmates are side-view cutouts turned 12–32°, not true ¾ heads; at the wide they read as gators but all face the same way (right, toward their pages). The heads look sleepy ("tired" eyes).
- The T1 wide is sparser at centre than before (his aisle is kept clear so he isn't hidden), and the rows are less full of tails and blobs than the old crowd.
- The ghost in s17c is hand-placed from the cold frame, not measured against the cut art; at 400 px it reads as faint red marks.
- Not rendered: the full film, s17c's close-up cut (unchanged), s17b T3 (unchanged).
- A machine watchdog killed Chromes at 17:43:34; one of my renders was running then. I re-ran it once.

## For the sound
No beat moved. Picture events that are new: s17b K shows the red second hand stepping on 0.0 and 1.0 (as before); s17c has his hand in frame from 0.58 (slide) through 2.33 (before: from 1.33); s18 has no ghost at 13.5–14.5.

## Story
I started with the ending because it was the cheapest fix with the biggest payoff in the report. The cold viewer couldn't tell calm from dread, and looking at the last seconds I found why: the tag's wide cued `resolve` a second time, whose lowered brow and bar mouth is exactly what a worried face looks like on a slow push-in. Letting `relief` run to the end and holding the little smile fixed it in one edit; the strip shows him smiling as he uncaps. The dashed ghost went too. Its two cream eyes made it a second creature, and the last image should be one small bead.

The clock took a wrong turn. I made the dial bigger, rendered, and got a blank grey wall: the stage's near plane is 5 cm and the camera was now 4.7 cm from the clock. s00 had hit the same thing, so the fix was one line. The real reason it was unreadable was the second hand: at :12 it pointed where a minute hand would, and the cold viewer's "12:10" was the second hand and the minute hand read as a pair. Making it red settled it.

The frogs were the satisfying one. I'd assumed I'd have to paint something, but the side rig was already there: put in profile and turned a little, they're gators at once. My first render made him vanish at the wide cut, because I subtracted 3 from a joint angle in radians. Fixing that to degrees gave the frame in `before_after.jpg` row 4: a hall of snouts and one cream hoodie in the light.

## State
built · 2026-10-18
