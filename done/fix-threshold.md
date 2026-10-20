# Done · fix-threshold

## What shipped
s10 only, three fixes in priority order, all done, plus the snap unchanged:
- **Fix 1, glass not ice: done.** The doors sit in a dark metal-grey surround with dark grey frames. The panes are clear with one soft diagonal sheen. He is still a rim-lit figure behind the glass before the push.
- **Fix 2, the colour jump: done, by light.** His hoodie and green now match the walk, measured.
- **Fix 3, the frog: done.** On the `lightFlood` drawing he turns to the blob: side rig, angled 20° to the lens, so the snout reads. The front view stays for the approach and the push, behind the glass.
- **Fix 4, the snap: kept.** The shadow extents are identical. 5.97× → 1.15× (it was 5.70× → 1.14×).

## Where it lives
- `src/shots/s10.js`
- Commits on `task/fix-threshold`:
  - `2499fec`: glass
  - `7f93d24`: colour
  - `2d31529`: fix 3
  - `835f577` and this one: evidence and done note
- `evidence/fix-threshold/`: `before_after.jpg`, `snap.jpg`, `snap.txt`, `colour.txt`, `checks.txt`, `measure.mjs`

## How it was checked
- [x] `evidence/fix-threshold/before_after.jpg`: top row is the cold viewer's frames at 100, 102, 104, 106, 108, 110, cropped from `evidence/cold-v4/sheet_05.jpg`. The bottom row is mine at the same times. 100 is s09c (fix-walk's) and 110 is s11, neither of which I touched. The cold sampling may sit a frame off; I didn't check.
- [x] `evidence/fix-threshold/snap.jpg`: 103.458 and 103.5. Ratios are in `snap.txt` (climax-a2's `probe.mjs`, ground plane, kept to z 0.10–0.8). Before (475e2eb, re-run today): **5.70× → 1.14×**, which matches `done/climax-a2.md`. After: **5.97× → 1.15×**. The shadow's extent and pixel count are identical (82756 / 3748 px). Only the blob's measured width moved (0.0465 → 0.0444 and 0.0662 → 0.0654). I can't explain that change; it's probably his figure moving in the probe's blob pass. lit/dark is unchanged (1.52 / 1.42).
- [x] Colour (`colour.txt`). Hoodie / green luma:
  - walk 101.5: 86 / 45
  - CU: 51 / 54
  - s10 wide before: 56 / 42
  - s10 wide after: 86 / 52 on the front rig, 96 / 43 on the side rig
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`. `src/timeline.js` is untouched (`git diff 475e2eb -- src/timeline.js` is empty).
- [x] `node tools/determinism.mjs --t=102.5,103.458,103.5,105,107.5` → all PASS, `determinism: PASS` (`checks.txt`, after the last code change).
- [x] Lamp 5 with `LAMP_H` 0.095: the snap numbers above are the same as before, and the lit/dark on the tongue is unchanged. Lamp 5's post isn't in the wide's frame, so there's nothing else to look at.

## Gaps
- **CU background (106–110):** the door opening's vertical edge, seen at an angle on the left of frame, still has a pale torn edge, out of focus. It reads as an edge, not frost, but I didn't fix it.
- **The sheen** is a fixed canvas band on both panes. It doesn't move with the open leaf's angle.
- **His silhouette behind the glass** is the same rim-lit figure as before (edge catch on him left on), not a designed silhouette. Lit by the room, his front still shows some green.
- **The side rig is 10 luma brighter on the hoodie than the walk** (96 vs 86). I left it.
- **Spec drift:**
  - s10.md's acting table has him front view through to the CU. The turn on `lightFlood` is new.
  - The look up at 3.0 is now a head rotation (6°), not the front face sliding up.
  - `STOP` x moved −0.022 → −0.040. The CU follows it, so its framing is unchanged.
- **Oak:** `oak_canopy` moved up 5 cm (0.16 → 0.21) to take its moss out of the door opening.
- **Machine:** the watchdog killed one of my renders at 17:43 (exit 144). I re-ran it once. Early on I rendered four 1920 PNG stills (`--stills` ignores `--w`) to measure colour; after that, sheets only. All frames and scratch sheets are deleted.

## Notes for the sound
No beat, timing or motion that the score keys on changed. The door still opens on `doorPush` 103.0, and the snap and chord are still on `lightFlood` 103.5. One new picture event: **he turns from front to side on the 103.5 frame**, the same frame as the chord. A cloth rustle there is optional; nothing needs moving.

## Story
I expected the ice to be a door problem. Once edge catch was off, the first render showed brown torn tongues still hanging into the top of the opening. The doors' grey frames were in front of them, so they had to be behind the glass. They were the oak's Spanish moss, out on the plaza and seen through the doorway. Climax-a2's backlight had rimmed them white, and white is what made them icicles. The other half of the frost was the wall's own torn hole catching lamp 5 from behind. So I didn't repaint any doors. I turned off edge catch on the wall, the surround and the frames, put a grey surround over the torn hole, and moved the oak up 5 cm (`2499fec`).

The reflection taught me something small. I asked for a 7% white band and got a searchlight beam, because alpha blends in linear light and the background was almost black. It ended at under 1%.

For the colour I stopped trusting my eyes. The stills looked like a bright cream hoodie at 101.5, but the mean was luma 83. In s10 it was 56. The fill the README asks for was already in the shot at 0.003, which does nothing. I first overshot to 0.015 (green 78). At 0.006 the hoodie matches the walk exactly (`colour.txt`).

The frog fix came last and was the quickest. The side rig already existed, so I turn him to it on the flood frame, then check the snap probe. Its shadow pixel counts came back identical.

## State
built · 2026-10-18
