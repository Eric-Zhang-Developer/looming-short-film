# Done · reel-s17

## What shipped
`src/shots/s17.js` is rebuilt for motion-sensor lights. The paused WIP's lamp build supplied the set, the hero's sit-back, the blob's hop-and-climb table and the dawn ramp. Its two desk lamps are now `sensorLight` zones: his and the neighbour's stay lit at s16's constant level, and the empty desk's trough is dead. The dawn overtakes the zones: window-shaped patches reach the floor by about 15 s, and the panes go from cold grey to gold to cream. Following the orchestrator's ruling, the camera stays locked to `dawnBird3` (19.0). From there one eased push-in ends on his chest and pocket, where the blob sleeps with its top over the rim, separated from his body by a dawn-gold rim light. Beat times and the shot's start and end are unchanged.

## Where it lives
- `src/shots/s17.js`
- `evidence/reel-s17/sheet.jpg`: 16 frames, w 320
- `evidence/reel-s17/determinism.txt`
- Commits on `task/anim-s17`: `628ba4c` (sensor zones and dawn), `6014710` (push-in, rim light, sleeping blob), plus the done-note commits

## How it was checked
- [x] Sheet at local t 0.5, 4.0, 5.5, 6.0, 7.5, 8.75, 10.5, 11.0, 12.0, 13.5, 19.0, 20.5, 22.0, 23.0, 24.0 and 24.95, made with `node render.mjs --page=index.html --sheet=135.5,139,140.5,141,142.5,143.75,145.5,146,147,148.5,154,155.5,157,158,159,159.95 --cols=4 --w=320 --out=evidence/reel-s17/sheet.jpg`. I looked at it after each change. Cols is 4 rather than 6 so the push-in sits on its own row.
- [x] `node tools/determinism.mjs --t=143.75,158` → `PASS` at both times (`40f193c9…`, `dc4137b9…`). 158 is mid push-in.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- What a cold viewer gets from the sheet:
  - Night turns to morning in a still, wide reading room: the windows warm, and light patches spread across the floor.
  - A gator at a lit desk, a figure asleep at the right edge and a sleeper slumped in the foreground.
  - The camera then closes in on the gator. By 23–25 s a dark round lump sits in his hoodie pocket, rimmed in gold against his lit green body.
  - **The pocket reads, but small:** the blob is about 20 px at 320. Its closed eyes don't show at that size. The hop and climb itself (7–12 s) happens in the wide, at about 5 px, so the sheet shows the result, not the climb.

## Gaps
- **Spec departures:**
  - **Push-in from 19.0, by orchestrator ruling.** Fov goes 20 → 11 and the camera dollies to 0.4 m from (−0.062, 0.022, 0.077) along the same 12° down axis. The constants are `PUSH` and `RIM_I`/`RIM_AT`. This breaks spec acceptance 1 (no camera move).
  - **The blob doesn't sink out of sight at 12.0.** It stays at the in-pocket drawing with its top over the rim and its eyes closed, so the push has something to find. The 12.000 bulge stays, and nothing on the puppets moves after 12.0. s18 H opens with the blob inside the pocket before its peek. That's a cut and a time jump, so I left it, but s18's builder should know.
  - **`DAWN_K` is 12, not the WIP's 1.6.** At 1.6 the zones swamped the dawn, and no window patch showed on any frame.
  - **The fluorescent is 0.4**, s16's Camera D level.
  - **Rim light:** an unshadowed dawn-gold point light (distance 0.06) over his shoulder, ramping with the dawn. The blob keys its edge highlight off it from 10.5.
- **Rough:**
  - The desk-top patches are faint next to the zone pools. The crawl reads mostly on the floor and the windows.
  - At sheet size the empty desk's dead trough looks much like the lit ones.
  - His sit-back and closed eyes don't read in the wide.
  - The spec says the foreground sleeper's head is lit at about 1 s. I didn't check it.
- **Not done:** the precision acceptance items were skipped per the brief. These are spec items 1, 3 and 4: pixel diffs, the freeze check and the rim timing on stills.
- **Left alone:** the WIP's `probe`/`hold` hooks feed `evidence/anim-s17/measure.html`, which isn't mine. The WIP's pocket offset (+3 mm) is kept, and commit `88ce0a7` explains why.

## State
built · 2026-10-15
