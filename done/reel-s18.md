# Done · reel-s18

## What shipped
`src/shots/s18.js` replaces the stub. It holds the spec's three setups in one shot ID, with cuts at 2.0 and 11.0:
- **E:** the home calendar. Friday's sheet (s02's art, seed and tilt) curls at 0.083, folds away along the diagonal and drops out. The new sheet holds with a new red circle.
- **G:** the Freshman's desk unit, which is s15's unit with the trough, blob and phone mirrored. The Freshman is frozen under the 7.1× phone loom. The hero walks the aisle on `walk('side')` at 0.006 per drawing and never stops. The Freshman's `sensorLight` zone wakes at 4.0 on the shared `SENSOR_WAKE` keys, the phone is outshone and the loom collapses into a pool.
- **H:** his hoodie pocket. His r 0.005 blob peeks out, yawns at 14.0 (stretch 1.3 × 0.85, eyes closed), settles by 15.2 and sinks back. The fade runs on 1s to black at 179.958.

There are no desk lamps at Marston. E keeps the home lamp as light only, with no cone, shade or dust.

## Where it lives
- `src/shots/s18.js`, `evidence/reel-s18/sheet.jpg`
- Commit `f5be256` on `task/anim-s18`, with this note in the commit after it

## How it was checked
- [x] Sheet at local 0.0, 0.3, 0.65, 1.5, 3.0, 3.9, 4.0, 4.042, 4.5, 5.5, 8.0, 10.0, 12.5, 13.5, 14.4, 15.6, 18.0, 19.958:
  `node render.mjs --page=index.html --sheet=160.0,…,179.958 --cols=6 --w=320 --out=evidence/reel-s18/sheet.jpg`. I looked at it, fixed the problems below and re-rendered.
  - Problems fixed: the pocket was hidden behind the arm and head, the tucked blob poked out under the pocket, the last frame wasn't black, the lamp blew out the sheet, and the circle sat beside Friday.
- [x] `node tools/determinism.mjs --t=160.65,164.042,174.4,179.958`: all `PASS`, `determinism: PASS`
- [x] `node tools/check_timeline.mjs`: `ok (18 shots, 41 beats, 180.0s)`. Beat times and the shot's start and end are unchanged.
- What a cold viewer gets from the sheet alone:
  - A calendar page with a red-circled date is torn away to a new month with a different circled date.
  - At a library desk, a small figure is frozen under a huge dark blob-shadow.
  - A gator walks past in the foreground. Their light comes on, the shadow is gone and the blob sits in a warm pool.
  - Close on his pocket, a small sleepy blob peeks out, stretches tall with its eyes shut (the yawn), settles and sinks back. Then black.
- Orchestrator continuity note (s17 now ends with the blob asleep and peeking over the rim): the yawn comes out of the same `gator_sheet` pocket part on the same rig. H opens with the blob tucked just under the rim, which the note says is fine after the wipe.
- [ ] Spec acceptance 2–4 (24 fps strips 3.75–4.5 and 13.0–16.0, the ≥ 6× / ≤ 1.2× crops): **not rendered**. The brief skips precision checks. The wake frames 4.0 (dark) and 4.042 (lit) are on the sheet, and the stretch at 14.4 is visible.

## Gaps
- **Spec numbers changed for readability**, all named constants at the top of the file:
  - `FALL_Y` is 0.22, not 0.08. At 0.08 the sheet stays in frame at 1.0.
  - The new circle is at the 1-based row 2, column 4. Read 0-based (s02's convention), it sat one cell left of Friday, and the new sheet looked like the old one.
  - `PHONE_OUTSHONE` is 0.02, s15's built value, not README §4's 0.2.
  - `LAMP_I` is 0.5, set by eye.
  - The spill is 20× the spec's 25%, and `H_FLUOR` is 1.5.
  - The tear's lift reaches 120°: the flap turns over, so the wipe reads.
- **Flat-puppet cheats in H:** the near arm tucks behind the pocket (z 0.001), the pocket comes forward (0.0055) and the blob sits between them in front of the head. Without this, the rig's arm and head cover the peek. The tucked blob is scaled to 0.75 height (`TUCK`) because the 9.4 mm drop doesn't fit the 8 mm pocket.
- **H framing follows the rig, not the spec's numbers:** the camera keeps the spec's offsets from the pocket's real position. The current rig puts the pocket under the head (y about 0.022, not 0.008), so the head is cut at the frame top.
- **Rough:**
  - Faces are too small to check at 320 px: the hero's side glance at 4.083, the Freshman's gasp, side look and smile.
  - The tear edge is the sheet's own torn rim with a fold. It isn't a procedural tear line running across the sheet.
  - At 0.3 the anticipation curl barely reads.
  - In G the hero shows his whole body at the bottom of the frame, not just his head and shoulders.
- **No yawn mouth:** `blob.js` can't draw one, and a dark oval on the ink blob wouldn't read anyway. The stretch and closed eyes carry the yawn (a `mod-blob` gap).
- **Not checked here:** the `sensorWake` cue for `lampClickFreshman` (audio isn't mine).
- **Copied code:** s02's `calendarArt` is copied in with the cell and seed as parameters. s02 doesn't export it, and s02 isn't mine to change.

## State
built · 2026-10-15
