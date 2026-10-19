# Done · v6-bed

## What shipped
- **The float is fixed (s07).** The duvet card used to end about 5 mm above the mattress, so his boots and a strip of wall showed under it. Now it stretches down from its top edge to 10 mm under the mattress top. The mattress face in front hides the bottom edge, so the duvet rests on the bed. His body (`HIP`) didn't move: his back was already at the mattress top. The gap was under the duvet.
- **The head is one piece (s07, the wide and the cut-in).** In s07 the head sits at −50° on the body instead of LIE's −14°. The snout now tilts about 40° up toward the phone instead of 76°. The dome and eye lie on the pillow, on the same head as the snout. The painted `numb` head in the cut-in rides the same joint, so it gets the same fix.
- The light, the ceiling shadow, the blob, the clock and calendar, every beat and the cut-in (2.0–5.5) are unchanged. The glance's ±1°/4° head moves still add on top.

## Where it lives
- `src/shots/s07.js`, in `build()` only: `HEAD_ON_PILLOW`, `DUVET_TUCK`, one blanket scale line and one head line. `bedroom()`, `LIE`, `HIP`, `KNEE` and every other export are untouched. `poses.js` is untouched.
- `evidence/v6-bed/`: `before_after.jpg`, `sheet.jpg`, `s08_continuity.jpg`
- Commit on `task/v6-bed`: this note's commit.

## How it was checked
- [x] `evidence/v6-bed/before_after.jpg`: top row v5 (`looming_v5.mp4`, ffmpeg `-ss` 49, 51, 54, 57), bottom row this branch at the same times. 51 is the cut-in, mid-blink.
- [x] `evidence/v6-bed/sheet.jpg`: one frame per second, 48–59. In the wide frames the duvet meets the mattress and the head is one profile. In the cut-in (50–53) the eye is on the head. At 54 the eye rolls toward the clock. After 55.5 the blob is bigger.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`
- [x] `node tools/determinism.mjs --t=49,51.1,55.5` → `determinism: PASS` (all three times)
- [x] `npx tsc --noEmit -p .` → clean
- [x] Checked by eye on a 3× crop of the wide at 49: no wall between the duvet and the mattress, and no boots under the duvet.

## Gaps
- **(Fixed by the scope extension below.) s08's wide showed the old float and the two-piece head.** s08 C3 (68 s, the same camera) builds from `bedroom()` and `LIE`, which the brief froze, so it still has the short duvet and the snout standing on end. See `evidence/v6-bed/s08_continuity.jpg` (59.9, 60.1, 68). The hard cut to the clock at 60 hides the jump, but once s08 returns to the wide, the duvet floats again. s09a's lying part probably has it too (not rendered). The fix is the same two lines in s08's `build()` (s09a needs care because it drops the blanket by moving `blanket.g`). A better fix is to move both lines into `bedroom()` and `LIE` in a task that owns all three shots.
- The duvet's right end now hangs a few mm below the mattress top past the bed's foot (x > 0.237, where no mattress face covers it). It reads as a drape over the foot, so I left it.
- −50° was my first pick and I kept it. I didn't try any other angle.
- I didn't re-measure the spec's light acceptance numbers (shadow width, face luma), because nothing in the light or blob path changed.

## Scope extension (coordinator, after 427cb4f): one fix for s07, s08 and s09a
- **Moved into the shared code.** `DUVET_TUCK` (0.010) and the blanket stretch now live in `bedroom()`. The head angle is a new export, `LIE_HEAD = -50`, which `LIE` uses. The s07-only overrides are gone. s07 is pixel-identical to 427cb4f: its determinism hashes at 49, 51.1 and 55.5 are the same strings as before the move (`f0960bf7…`, `3e52c3b4…`, `d3dfd5d6…`). So `before_after.jpg` still stands, and I didn't re-render it.
- **s08** needed no edit. Its wide (68) and its close-up (65) pick up both fixes through `bedroom()` and `LIE`. Its +5°/+6° head glance still adds on top.
- **s09a:**
  - `REACH_LIE` uses `LIE_HEAD`, so through the reach (73.5–74.17) his head stays on the pillow and only the arm moves.
  - The blanket drop used to move the card down 2 cm, which would now hang its bottom 2 cm under the mattress top. Instead the card gets 2 cm shorter as it drops: its top falls to his lap and its bottom stays tucked.
  - The sit-up is still the same two drawings (74.167 → 74.333, on the cut to C5). The head turns −50° → 0° over them instead of −14° → 0°, so the half-up drawing at 74.25 has the snout higher. It's a two-drawing blend on a cut, not a pop.
- **Evidence:** `evidence/v6-bed/continuity.jpg`: s07 57, s08 61, 65, 68, s09a 70.5, 72.5, 73.6, 74.5. I also looked at a sit-up sheet (73.5–74.42, 8 frames) by eye and deleted it.
- **Checks:**
  - `check_timeline` → `ok (21 shots, 70 beats, 195.0s)`
  - `determinism --t=49,51.1,55.5,65,72.5` → PASS
  - `tsc` → clean
  - `determinism --t=70.5,73.6,74.5` → 70.5 and 73.6 PASS, **74.5 FAIL** (`78382b39…` / `241c3a4a…` / `78382b39…`). This is the order-dependent s09a failure that fix-bedroom found on its base commit. I didn't touch its cause.
- `s08_continuity.jpg` shows the state *before* this extension (s08 still floating). It's kept as the "before" for `continuity.jpg`.

## Story
The brief named two things, a float and a split head. Cropping v5 at 49 s showed the float wasn't where it looked. His back was already at the mattress top. The duvet card, which hangs from the line of his knees, ended about 5 mm early, and in that gap you saw his dark boots and a strip of lit wall. To the eye, that made the whole bed of blankets float. I projected the mattress's front edge through the camera (row 410 of 540) and saw the duvet's bottom at about 397. The first stretch, to 4 mm under the mattress top, still left a hairline of wall, probably the torn edge of the art. At 10 mm, still hidden behind the mattress face, it closed.

The head was simpler. LIE stands the snout almost on end (76°). The eye dome then drops down by the headboard and reads as a second head. Setting s07's head to −50° tilts the snout toward the phone, and the dome lies on the pillow. The first render showed one gator looking down at his phone, in the wide and in the cut-in.

The surprise was the continuity check. I rendered s08 at 68 s to make sure I'd changed nothing there, and that is exactly the problem: s08's wide, same camera and same room, still floats. I left it alone, because those numbers are frozen, and I wrote it up above.

## State
built · 2026-10-18. s07, s08 and s09a share one fix (scope extension above). The s09a 74.5 determinism failure was there before this task and is still open.
