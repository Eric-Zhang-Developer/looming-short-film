# Done · reel-s15

## What shipped
s15 is the motion-sensor version of the turn. The desk lamp, knob, bulb and lamp light are gone. His K4–K7 reach now goes down to the capped pen: hand above it at 0.333, fingertip on it at 0.417, then the pen tips to 45° and its capped point touches the name line at 0.500. That drawing is the wake. `sensorLight` over the desk plays the shared stutter: dark at 0.500, strikes at 0.542, 0.667 and 0.792, steady from 0.875. The phone spot follows the zone level, so the loom flashes back on the dark frames and drops to a faint ghost on the lit ones. Camera, desk unit, gator and K0–K3 and drawing timing are unchanged from anim-s15.

## Where it lives
- `src/shots/s15.js`
- `evidence/reel-s15/sheet.jpg` and `determinism.txt`
- Commits on `task/reel-s15`: `1cb2dab` (shot), `7522dbf` (evidence), plus this note.

## How it was checked
- [x] **Key-moment sheet:** `node render.mjs --page=index.html --sheet=100,100.25,100.333,100.417,100.5,100.542,100.625,100.667,100.75,100.792,100.9,101.333,102.833,103.75,106,107.333,107.75,108,108.5,109.4,110,112.167,113,113.95 --cols=6 --w=320 --out=evidence/reel-s15/sheet.jpg`. I looked at it, and at a 960-wide scratch render of 0.333–1.333 (deleted). The first sheet used 100.583 and 100.708, which land on strike frames (0.9 and 1.0) because those decimals fall just short of 7/12 and 17/24. I re-rendered with the real dark frames, 100.625 and 100.75.
- [x] **Determinism:** `node tools/determinism.mjs --page=index.html --t=100.625,109.4` → `determinism: PASS` (`evidence/reel-s15/determinism.txt`).
- [x] **Timeline:** `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] **What a cold viewer gets from the sheet:**
  - The gator sits in cyan phone light with a huge blob-shaped shadow, eyes and all, on the wall.
  - He reaches down to the page.
  - The room lights up warm from above, flashes back to the looming shadow twice, then stays lit.
  - The wall shadow is a faint ghost, and the blob sits small on a bright desk with a small pool in front of it.
  - He turns the phone over (the ghost goes), uncaps the pen and writes.
  - "He moved toward the work, and the light showed the monster's real size" reads from the frames.

## Gaps
- **Out-shone phone is 0.02, not README §4's 0.2 (or anim-s15's 0.05).** The zone doesn't light the wall the way the lamp's cone did, so at 0.05 the ghost still read as a face with eyes. At 0.02 it's faint, though the eye holes are still just visible until the phone goes face-down at 7.417. Contrast wasn't measured: the reel brief skips measurement.
- **The grade switches `marston` → `amber` on frames where the zone is ≥ 0.5.** I kept the lamp version's grade (README §3: exposure and grade carry over) and made it follow the stutter. So the lit desk reads warm-yellow, not the green-cream fluorescent tone. If the director wants fluorescent, a cooler LUT is a one-line change.
- **Pen press position.** I used the spec's lean and arm values with no tip solve. The pen hangs off the fingertip at 45°, with its point at y 0.0003 on the arm plane z 0.0868 (the flat-puppet cheat, the same as the write poses). At 0.417 it lies flat under the fingertip. The 4 px contact crop and the s06 overlay are **not verified** (crops are skipped tonight).
- **Desk unit stays at anim-s15's built numbers** (blob z 0.0884, phone 0.116, 4.2× loom, Camera A tilted up 1.45°), not the spec's 7.1×, as instructed. `sensorLight` aims at the blob's foot at z 0.0884.
- **The blob is now built from `createBlob({ radius: BLOB_R })`, not `makeExam`.** This gives the same radius (0.012) and seed. `exam.update` gets `key` (README §11) because the face fill sits near the blob.
- `poses.js` still holds the knob poses (`reach`, `touch`, `press`) for s06. s15's pen poses (`pen_reach`, `pen_touch`, `pen_press`, `let_go`) are local to s15.js.
- Not done: no sound work, and cue changes for the sensor wake are not mine. The trough is above frame, so it isn't seen. There's no check of the cuts against s14 or s16.
- Every render logs one `404 (Not Found)` page resource. I didn't trace it; it doesn't affect the frames.

## For the final pass (`v1-animatic` comparison, docs/11-roadmap.md on `wave/3-assets`)
- **Locked:**
  - Beat times and shot bounds are untouched (`check_timeline` ok, 100.0–114.0).
  - The wake is `UNIT.press` = 0.5 = `lampClickMarston`.
  - Camera A/B framing is what I'd keep.
- **Tunables at the top of `s15.js`:**
  - `BLOB_R`
  - `UNIT`: tube, fill, phone and phone-light positions, blob, cameras, press
  - Intensities: `PHONE_I`, `ZONE_I`, `FLUOR_I`, `AMB_K`, `PHONE_OUTSHONE`, `FILL_*`
  - The fill position moved into `UNIT` after the director's note (`3cda564`). Determinism hashes at 100.625 and 109.4 are identical before and after (`a665b20a…`, `d7fa24c4…`), so it's a no-op.
- **Expect to restage:**
  1. **The blob dread meter.** If the blob's radius at s15 grows toward the planned ~3× peak, the phone light and the blob z must be re-solved to keep the loom in frame. The blob also then crowds the pen, the phone and the hand path (K4–K7 and the 7.25 phone grip clear it by about 3 mm today). That is staging, not just a value change.
  2. **The desk-unit drift.** s15 runs anim-s15's loom-fix numbers (blob z 0.0884, phone 0.116, 4.2×, Camera A tilted up 1.45°). The spec and s14/s16 use 0.098, 0.114 and 7.1×. One side has to move, or the blob jumps at both cuts. I'd move the neighbours to s15's numbers, so this framing stays.
  3. **Pen contact.** The pen's point is placed at the fingertip x, not tip-solved. Final art may want the K4–K6 tips re-solved, with the error absorbed in lean as the spec says. That shifts the hand slightly, but the timing stays.
  4. Grade and out-shone level are light changes, not staging.

## State
built (reel) · 2026-10-15
