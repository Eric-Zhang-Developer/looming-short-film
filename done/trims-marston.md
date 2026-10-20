# Done · trims-marston

## What shipped
Marston is the reward now. s11, s13 and s15 are rebuilt around one constant warm pendant from above, with the 2.5× blob (Q16) and no laptop, sensors or phone light. s16, s17, s17b and s17c run on the v4 timeline. s16 has five solves on SHRINK. s17 is 12 s. s17b opens on the film's clock reading 9:00. s15 and s17c get close-ups on the painted heads: `surprised_smile` on the name, `pride` on the 94. The cut shots s12 and s14 are deleted.

## Where it lives
- `src/shots/s11.js`, `s13.js`, `s15.js`, `s16.js`, `s17.js`, `s17b.js`, `s17c.js`; `src/shots/s12.js` and `s14.js` are deleted
- `evidence/trims-marston/`, `done/trims-marston.md`
- Commits on `task/trims-marston`:
  - `e95972d` s11/s13/s15
  - `0d7c461` s16
  - `1a2e1d4` s17
  - `1c5ba9f` s17b/s17c
  - `fda3a4c` deletes s12/s14
  - `250a3b6` merges `wave/3-assets` (trims-home, as the orchestrator asked)
  - `ee38019` clock second hand and CU light
  - `14b29af` evidence
  - this note
- **Exports.** Every export the brief lists is kept, with the same names and behaviour.
  - `s11.js` adds `castOnly(scene, casters)`. It's additive: s15, s16 and s17 use it.
  - `s17b.js` `WRITE` moved +1.0 s. It isn't on the brief's list, and nothing outside s17b imports it.
  - s15 and s17c now import `closeupRig` and `HEAD_AT` from `s09b.js`, read-only.

## How it was checked
- [x] **One sheet per shot**, rendered after the merge. I looked at every one.
  - `s11_sheet.jpg` (12 frames)
  - `s13_sheet.jpg` (6)
  - `s15_sheet.jpg` (12)
  - `s16_sheet.jpg` (16)
  - `s17_sheet.jpg` (10)
  - `s17b_sheet.jpg` (12)
  - `s17c_sheet.jpg` (12)
  - Also: `s11_phone_strip.jpg` (2.333–2.667), `s13_crop_3.0.jpg`, `s17b_clock_tick.jpg`.
- [x] **`closeups.jpg`**, 400 px.
  - s15: the 5.417 anticipation on the rig at B′, then `surprised_smile` at 5.5, 6.0 and 7.0.
  - s17c: `surprised_smile` at 3.0, the anticipation drawing at 3.917, `pride` at 4.0 and 5.5.
- [x] **s11 shadow ÷ blob width** (`s11_s15_shadow_probe.txt`, a copy of climax-a2's probe):
  - **Desk pool at 5.5: 0.085 m wide.** That is 1.38× the probe-measured blob width (0.062 m), or 1.24× its nominal width (2.28 r = 0.068 m). At 4.5 and 6.9 the probe gives 1.54× and 1.43×.
  - The probe under-reads the blob's width in s11, because its edge is lost against the black wall. The same light and mark seen from s15's B′ measure 1.13–1.15×.
  - Floor pool before the climb: 1.40–1.43×.
  - **No wall shadow:** every shadow pixel lands below the desk top (wall-plane y ≤ −0.004).
- [x] **s16 sizes match SHRINK** (`s16_shrink_probe.txt`). Measured r = width / 2.28, against SHRINK:

  | When (local) | Measured r | SHRINK |
  |---|---|---|
  | 0.25 | 0.0310 | 0.030 |
  | 6.6 (#1) | 0.0201 | 0.021 |
  | 11.6 (#2) | 0.0113 | 0.012 |
  | 13.1 (#3) | 0.0086 | 0.009 |
  | 14.1 (#4) | 0.0064 | 0.007 |
  | 15.1 (#5) | 0.0048 | 0.005 |

  - So each step is 3–9% under its target, and the under-read grows as the blob gets smaller (the probe loses the edge).
  - The frames just before #3–#5 (12.9, 13.9, 14.9) still measure the old size, so each step lands on its solve.
  - From #2 on, the blob sits on the page corner (x −0.013…0.013).
- [x] **s12 and s14 are gone** (`checks.txt`). No shot file mentions them and nothing imports them. The `s12`/`s14` strings left in `src/` are comments and pose-table tags in files I don't own: timeline, lights, assets, poses, gator, custodian, foley.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`.
- [x] `node src/characters/acting.js` → `acting: ok`.
- [x] **Determinism** (`determinism.txt`): after the merge and the last code change, 14 times across s11–s17c plus s18 at 180 all PASS. A first run before the merge also covered s10 at 105 and passed.
- [ ] **Not verified by strip:**
  - s15's uncap and name strips, and s16's stop/tap/strike strip (spec acceptance).
  - The 12-frame holds. act() enforces them by throwing, and the sheets show the faces.
  - Legibility and cap height of the math. It's unchanged code from G4.

## Gaps
- **2.5× everywhere, against the specs' 2×.** The brief and the README v4 summary say 2.5×; the specs' own text still says 2×. I built 2.5×. On it:
  - s11's pool is 1.24–1.38×, not the spec's 1.23×.
  - At s15's B′ the blob's top is cut by the frame.
  - At s11 its eyes are about level with his, not 4 mm below.
- **s11 staging decided at build.**
  - The blob waits on the floor in front of the desk (z 0.145), not "beside the chair". At 2.5× it's as tall as the desk, and beside the chair it covered him.
  - The climb is cling, stretch, pull-up (3.17 / 3.5 / 3.67) up the apron, not via the chair seat, which he's sitting on.
  - The page at s11 is `blank_page`. The backpack on his back during the walk barely reads.
- **Only the blob casts, except the desk top** (`castOnly`). Without the desk top, the overhead light printed the blob's shadow on the floor under the desk.
  - In s17 the wall casts too, as the spec says.
  - In s16 and s17 the wide views now show a dark floor band under the desks.
- **Exposure per camera.**
  - s15 B′ runs the pendant at 0.25. At 0.8 the page clipped white and the name vanished.
  - s16 uses B′ 0.25, the page inserts 0.144, and D 0.5.
  - The name squiggle in s15 is still mostly under his mitt at B′. It reads in s16's P insert.
- **s16.**
  - v3's Camera E cutaways are removed, to meet the spec's exactly-five cuts. The small late steps are now read in D only (the 0.42× blob is about 37 px at 1080p).
  - The neighbor pops between two write poses from 9.0.
- **s17.**
  - v3's two-shot on the blob's look is kept, rescaled to 4.5–5.833. The spec says the camera is locked.
  - His breath keeps going after 6.0 (v4 acting asks for 6/min), against G4's "nothing moves after 9.0".
- **s17c.**
  - The wide-eyed still beat (3.0–4.0) uses `surprised_smile`. There's no wide-eyed head with a closed mouth.
  - The blob's v3 beats (still, wide, smile) went back to G4's: side at 2.0, content at 2.75.
  - The CU is on its own small set, a wall and desk 0.6 m off to the side. The face reads but is greyish.
- **s17b's clock reads 9:00:12 → 9:00:21.** Starting at :00 hid the second hand under the minute hand for all of K. It steps on whole seconds, with the +1.5° overshoot on frame 0.
- **s13.**
  - The hero's blob sits at (0.030, −0.028) so it stays on his desk (the mesh's contact point is its south edge).
  - Pool decals use 0.127 / (0.127 − r) per blob (1.08–1.12× for the crowd), not a flat 1.1×.
  - The decal sizes are by construction, not measured.
- **Merge (trims-home).**
  - resolve's torn-strip mouth now replaces the face-sheet mouth while resolve is current. My shots only override the eyes during resolve, or set `line`, so nothing fights the strip. The post-merge sheets render clean, but at sheet size I didn't check the strip itself.
  - The neck change is visible on every rig and needed nothing.

## For the sound pass (global s)
- **s11**
  - Steps: 110.0, 110.167, 110.333.
  - Sit: dip 110.417, `deskSit` 110.5.
  - Props down: backpack 110.75, page 111.25, pen 111.75.
  - Phone: out 112.0, up 112.167, on edge 112.417, face-down 112.5.
  - Climb: 113.0 crouch, 113.167 cling, 113.5 stretch, 113.667 pull-up, 113.833 on top, 114.0 on the mark.
  - Fidgets 114.25 and 114.667. Settle 115.0. Swallow 116.0.
  - No laptop and no gulp.
- **s13**
  - Head lift 117.5; Drinks 118.5; Freshman 119.75 (the blob's squash is on it too).
  - Page turns 119.0 and 120.5.
  - The Freshman's pen moves 119.75–120.5.
- **s15**
  - Pen picked up 122.75; `penUncap` 123.5 (cap set down by 123.833).
  - Hesitation 123.833–124.333. Writing 124.333–126.5.
  - Flinch 126.5. Eyes to the blob 127.0.
  - Cut to the CU smile 127.5; back to B′ 129.5; blob blink 128.5.
- **s16**
  - Lines 130.5–133.1 and 133.1–134.1. Tap 134.333.
  - Strike frames 134.625 and 134.708.
  - Line 134.75–136.1. Checks 136.167 and 136.333.
  - Solve #1 136.5. `gasp` 137.0, `o` 137.333, smile 138.5.
  - D 139.0. P2 pops 139.5, 140.0, 140.5, 140.75, 141.0.
  - Solves 141.5, 143.0, 144.0, 145.0. Blob dozes 145.5.
  - No neighbor wake, no phone hum.
- **s17**
  - Pen down 148.083; sit-back 149.0.
  - Two-shot 150.5–151.833. Blob opens 150.667 and sleeps 151.667.
  - His eyes close 152.0.
- **s17b**
  - Clock ticks on every whole second, 158–167; cut K → T1 at 159.
  - Pen stops 162.0. T3 163.0, breath 163.333, smile 163.5.
  - Writing 164.5–167.4. Solve 167.5.
- **s17c**
  - Slide 168.5–169.0. Flip 169.333–169.833. Reveal 170.0.
  - CU 171.0, grin 172.0. Back to P 174.0, tap 174.25.

## For the home trims
- s18 imports `loadHand` and `handFont` from s17b. Both are unchanged.
- s17b's `PAGE`, `CAM_P`, `BLOB_AT`, `pageWithInk`, `flatHand` and `overheadSpot` are unchanged.
- The blob arrives at s18 at r 0.004.

## Story
I started by reading s11's old code, because every other Marston shot imports its helpers. I kept that block untouched and rewrote only around it.

The first s11 render surprised me. The blob sat on the desk under a light from straight above, but the only shadow you could see was a dark oval on the floor in front of the desk (`s11_a`, scratch). I had turned shadows off for everything but the blob, so the light passed straight through the desk. The fix was the `castOnly` exception for the desk top. Then the pool sat where it belonged, a thin band at the blob's base: 0.085 m against its 0.068 m width.

The 2.5× blob kept fighting the 2× specs. On the floor it stood as tall as the desk and covered him, so it ended up waiting in front of the desk, clinging to the apron to climb.

In s15 the name I'd written wasn't visible. Hiding the rig showed the ink was there, washed out by a pendant tuned for s11's grazing view. Dropping it to 0.25 brought the wood grain and the squiggle back.

The last catch was small. The exam clock's second hand spent the whole insert hidden under the minute hand at 12, so the "calm tick" had nothing to show (`s17b_clock_tick.jpg`). Starting it at :12 fixed it.

## State
built · 2026-10-18
