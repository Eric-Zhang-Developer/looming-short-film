# Done · v2-marston-b

## What shipped
s13–s16 rebuilt on the frozen kits at the G4 meter and beat times. s14–s16 stand on s11's Marston desk set (`marstonDesk`), with the ring pendant as each desk zone's fixture. They use the props_kit page, pen, cap and phones, and the 2.5× blob with the phone light back at the phone (S 2.85). s16 is the G4 practice beat. Problem 1 and problem 2 are written out in two top-down inserts on the painted practice sheets, with the crossing-out and a check. A six-step shrink follows, one step per solve, and the neighbor gets a mirrored desk. s13 is on the Marston carpet, with the 2.5× blob, its 7.1-unit decal and a top-view eye pair.

## Where it lives
- `src/shots/s15.js`: 7752af5, 9f10b63. It holds the G4 constants (`BLOB_AT`, `CAM_A2`, `CAM_B2`, `PHONE`, `PAGE`) and the practice-sheet helpers (`practiceSheet`, `SHEET_INK`, `penLine`) that s14 and s16 import. `UNIT` keeps its pre-G4 values for s12 and s17.
- `src/shots/s16.js`: 9f10b63 · `src/shots/s14.js`: 04a05e0 · `src/shots/s13.js`: d2ecaa8
- `src/assets.js`: I added a props_kit block (2d7b468), then removed it (099f2bd) and merged `wave/3-assets` (c535e07) as the coordinator asked. The props_kit rows on this branch are v2-home-a's, and there's only one copy.
- Evidence: `evidence/v2-marston-b/s13.jpg`, `s14.jpg`, `s15.jpg`, `s16.jpg` (key-moment sheets, `--cols=6 --w=320`) and `checks.txt`.

## How it was checked
- [x] Key-moment sheets, each one viewed:
  - s13 at 96.2, 96.6 (`headLift`), 97.9, 98.9, 100.0, 102.5
  - s14 at 103.4, 104.4, 105.3 (`tinyBlobSeen`), 106.0, 107.3, 107.95
  - s15 at 108.4, 108.9 (after `sensorWakeMarston`), 114.0, 115.45 (`phoneFaceDown`), 116.05 (`penUncap`), 118.05 (`nameWritten`), 121.6
  - s16 at 122.6, 124.5, 126.4, 127.25 (`crossOut`), 128.95, 129.9 (after `problemOneSolved`), 132.6, 135.6, 138.5, 141.9, 142.6 (`sensorWakeNeighbor`), 145.0
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 58 beats, 195.0s)`
- [x] `node tools/determinism.mjs --t=98.9,105.3,116.05,127.25` (one time per shot) → each hash ×3 matches, `determinism: PASS` (`checks.txt`)
- [x] The P insert at 640 px wide (scratch, not kept) reads line by line. "∫xeˣdx = xeˣ − ∫eˣdx" comes first. Then "= xeˣ + eˣ + C" appears unstruck, it is struck by 5.25, and then "= xeˣ − eˣ + C" with a ✓. P2 reads "(n+1)/2n → ½ < 1", then "converges" underlined, with a ✓.
- [ ] The specs' numeric acceptance (shadow scales measured on frames, blob widths ±5%/±10%, 40 px cap height at 1080p, the 24 fps strips): **not verified**. Scales come from the geometry in code, and nothing was measured on a render.

### What a cold viewer would get from each sheet
- **s13:** a dark room seen from above. Desks light up one by one with phone glow, and a long dark blob-shaped shadow springs from each. The biggest shadow is his, in the middle. The idea "everyone has one" reads. It is very dark at 320 px, and the figures are flat green ovals (proxies).
- **s14:** a gator at a desk under a hanging light, with a huge shadow on the windows behind him. A cart rolls by in front, the light over his desk flickers on, the shadow drops, and the blob sits there big but plain. Then the light dies and the shadow is back. The tiny blob on the cart is just readable against the paper-towel roll. The cart and Custodian look like proxies.
- **s15:** he reaches for the pen, the pendant comes on, and the loom becomes a pool under a blob that looks at him. He flips the phone over, uncaps the pen and writes, in a slow push-in. This one reads best.
- **s16:** a brace, then a close-up of a hand writing real calculus, a crossed-out line and a check. The blob is smaller after the cut back. A wide time-lapse follows: he works, stands, and a neighbor's light comes on. The inserts read clearly. In the wide shot the shrink is too small to follow at 320 px.

## Gaps
- **Off the spec's mark:** the blob sits `BLOB_DX` = 16 mm right of README §1's Marston mark in s14–s16. On the mark, the cut gator's bigger snout reached the blob at B′, the cut-gator finding. As a result, its left edge no longer sits on the page corner. s12, which isn't mine, still uses the plain mark. `BLOB_DX = 0` restores the spec.
- **The math lines differ from s16's acceptance 2.** The painted sheet has three lines, not four: no "u = x  dv = eˣ dx" setup line. Line A is the whole parts formula, written over 1.0–3.6. The strike crosses the whole wrong line ("= xeˣ + eˣ + C"), not only "+ eˣ". Matching the spec needs a repaint or code lettering.
- **Ink tricks on the painted sheets:** an unmix into navy and grey layers, healed rows under the strike, code-drawn '+' bars and checks, and an ink gain of 1.6, because the struck line is painted lighter. The ink reads brown under the amber grade.
- **Insert framing.** Camera P is at the spec's 0.075 height, centred on the written rows. The insert sleeve and hand are `gator_sheet` arm_r laid flat at 0.026 reach, smaller than the rig's 0.032, and the sleeve covers the sheet's upper left. While the inserts are on, the zone light is multiplied by `INSERT_EXPOSURE` 0.45 (an exposure cheat), or the page clips.
- **Later pages:** problems 3–7 are code scribbles on blank pages, and the stack pages are blank.
- **Standing plane:** in s16 he stands at z 0.080, not 0.074, so the cubicle panel at the desk's end stays behind him. The neighbor's duplicate room and panel are hidden by position.
- **Dawn:** the pre-dawn ramp is only the night view's glow (0.3 → 0.45). The panes don't go grey, because marstonDesk doesn't expose the sky plate. s17 may not match.
- **Light values I changed or kept:**
  - The aisle `fluorescent` is 0.25 in s15/s16, where v1 had 1.0, so dead zones read dark as in s11.
  - The phone out-shone level stays 0.02. README §4 says 0.2.
  - The amber LUT on a lit zone is kept from v1.
- **Still proxies:** the Custodian, cart, neighbor, s13's figures, desks, textbooks, laptops and cans, plus study_props' laptop, backpack and energy drinks. Their sheets aren't frozen.
- **No sound.** Cue names weren't touched.
- **Still rough:** s13 is very dark, the s14 cart is a navy box, and in s16's wide shot the hero's blob steps are hard to see at sheet size.

## Story
I began from the shots as they stood, and the first scratch sheet showed how much had changed. s15 and s16 were still on the pre-G4 1× blob, navy proxy walls and a 21-second s16. The useful decision was not to touch s15's `UNIT`. s12 and s17 still read it, so the G4 numbers went in beside it.

The practice sheet was the real puzzle. The frozen page arrives with the whole answer painted on, wrong line struck through and all, and the beat is him writing it. Zooming into the pixels showed the strike is grey and the pen ink navy. So each pixel is solved as paper plus some navy plus some grey, and the lines are revealed left to right. The first insert render was a cream blank: the page and desk both clipped under the zone light, and the sleeve covered half the frame. I cut the light in the inserts and shortened the arm. Then the wrong line came out in fragments, even after healing the strike's rows. A pixel dump showed why: that line is painted lighter, mostly half-alpha. An ink gain fixed it, and the next render read "= xeˣ + eˣ + C" cleanly before the strike landed.

s13 had a row of dots across the room. They weren't a light. They were pinholes at the carpet tiles' rounded corners, seen from straight above, and backing the carpet with its own colour removed them. One headless Chrome at a time throughout, and no watchdog trips.

## State
built · 2026-10-16
