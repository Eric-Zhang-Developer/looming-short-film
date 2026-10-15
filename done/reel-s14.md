# Done · reel-s14

## What shipped
s14 on motion-sensor lights. The desk lamp is gone. The hero's `sensorLight` zone is dead until the cart trips it at 1.0 (shared wake stutter, phone spot out-shone on lit frames), stays lit while both blobs read small at `tinyBlobSeen` 2.3, and times out from 4.2 (s11's seed) because he never moves. The aisle fluorescent stays the Custodian's key. Named constants at the top: `BLOB_R`, `TINY_R`, `WAKE`, `TIMEOUT`, `ZONE_I`, `FLUOR_I`, fills.

## Where it lives
`src/shots/s14.js`, `evidence/reel-s14/` (sheet.jpg, determinism.txt). Commit `ba3aa33` on `task/anim-s14`, plus this note.

## How it was checked
- [x] Sheet: `--sheet=95.2,96.05,96.5,97.0,97.3,97.6,98.05,98.7,99.15,99.25,99.45,99.95` looked at.
- [x] `node tools/determinism.mjs --page=index.html --t=96.05,97.3` PASS.
- [x] `node tools/check_timeline.mjs` ok (18 shots, 41 beats, 180.0s).
- Cold viewer: a gator under a huge phone-shadow on the wall; a cart and a stooped custodian pass; the lamp over the gator flickers on, the wall shadow vanishes, he sits still; the light dies and the huge shadow returns.

## Gaps
- The tiny blob on the tray is hard to see (ink on dark, overlapping his blob at 2.3); the cart frame art is near-black. Left rough.
- Hero blob's 1.10x pool on the desk is not readable at sheet size. Not measured.
- Aisle tube is 1.4 (spec 0.6) and fills were raised, because the cart and student were silhouettes at this camera distance.
- LUT is `marston`, not `act2b` (does not exist). Sound cues not touched.

## State
built · 2026-10-15
