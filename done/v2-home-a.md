# Done · v2-home-a

## What shipped
v2 of s00, s01, s02, s03 and s06, built from the frozen art on the G4 timeline. The four home desk shots now sit on one **real-scale** home desk unit: the home_kit desk at 75 cm, its chair, a home_kit lamp and laptop, and the props_kit planner, page, pen and phone. `s02.js` exports the unit (`DESK`, `tools`, `homeDesk`, `seatReach`, `B`), and s00, s03 and s06 import it, so the four shots can't drift apart. s00 is new: the phone buzzes and wakes to props_kit's painted "Calc 2 Exam · Fri" card. s01's apartment is now built from home_kit frames, glass and a door. `src/assets.js` has a separate `props_kit` PIECES block.

## Where it lives
- `src/assets.js`: the props_kit block (9e115dc)
- `src/shots/s02.js`: the unit and the shot (e042eab; tuned in ea0dabe and 4b55e24)
- `src/shots/s03.js`: ea0dabe
- `src/shots/s06.js`: 4b55e24
- `src/shots/s00.js`: e8838f9, 2c92a8b
- `src/shots/s01.js`: 73112e5
- `evidence/v2-home-a/`: `s00.jpg`, `s01.jpg`, `s02.jpg`, `s03.jpg`, `s06.jpg`, `checks.txt` (24c3342)
- The cut PNGs stay gitignored. I symlinked `node_modules` to the main checkout's to render, then removed the link.

## How it was checked
- [x] **Key-moment sheets**, one per shot (`render.mjs --sheet=… --cols=6 --w=320`, global times). I looked at each one and fixed what didn't read; the fixes are in the commits above. What a cold viewer should take from each:
  - `s00.jpg` (0.25, 0.5, 0.875, 1.5, 2.0, 3.8): black, then a phone lights up on a dark desk with one banner, "Calc 2 Exam · Fri" next to a red badge. The words are legible at 320 px wide. It shakes on both buzzes, and the screen dims at the end.
  - `s01.jpg` (4, 5.5, 7, 8.5, 9.5, 9.95): a brick apartment block against a dawn skyline, with one warm window lit among dark ones. The camera pushes in until that window fills the frame (about 45% of the height at the end).
  - `s02.jpg` (10.5 … 19.9, 16 frames): a gator slumped at a small desk, under a wall planner with one red circle. The camera pushes in until "Calc 2 exam", circled, fills the frame. An ink bead forms on the circle, runs down the sheet, sits on the curled bottom edge and opens its eyes. It looks up at the words, then off left. Back in the wide, it drops to the desk, swells to the size of his head, hops over and looks up at him. He finally glances at it.
  - `s03.jpg` (20, 20.25, 20.83, 20.96, 21.0, 22, 23.0, 24.42, 24.5, 25.5): he looks at the blob and shrugs, opens a laptop and plays. On the frame the screen wakes, a huge blob shadow with two eye holes appears on the wall, over the calendar. The blob glances at its own shadow, swallows, and both get bigger. He never looks up.
  - `s06.jpg` (42.0, 42.5, 42.583, 43.083, 43.6, 44.0, 44.9, 45.0, 45.5, 45.92, 46.0, 47.0): night, and the laptop shadow looms across the wall. He pulls the lamp's chain: the room goes amber, the wall shadow is gone, and the blob is just a blob beside him. He recoils. It hops toward him, and he pulls the chain again. The loom snaps back, he turns back to the game, and the blob gulps and the loom grows.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 58 beats, 195.0s)` (`checks.txt`).
- [x] `node tools/determinism.mjs --t=1.5,7,15,24.5,43.6` (one time per shot) → PASS ×5, with the hashes in `checks.txt`.
- [ ] **Shadow scales: not measured.** S is set by depth alone: s03 is 0.0225 / (0.0225 − 0.015) = 3.0, and s06 is 0.0225 / (0.0225 − 0.01696) = 4.06. That's the light rule computed from positions, not a smoke-paper measurement.
- [ ] **The spec files' own strips and crops: not done.** That covers the 24 fps strips, the luminance checks, s00's < 3% black, the lamp-intensity prints and the hand-tip prints. The brief's acceptance asks only for the sheets and the two checks.

## Gaps
- **Real scale changed the spec's geometry.** The specs are solved on s15's oversized desk unit. Re-staging at the scale table's size (the brief) kept every S, every beat time and every eye and pose change, but these all moved: positions, cameras, the K0–K7 hand targets and the pool size. Specifically:
  - Desk 0.077 × 0.033 m, top 0.041 above the floor. His hip is at (−0.056, −0.0135, 0.016).
  - Laptop screen centre at z 0.0225 in every shot. The blob's mark is z 0.015 in s03 and 0.017 in s06.
  - Both cameras are new: s03 is at 0.33 m, s06 at 0.60 m so the 1.5× loom's whole outline fits.
- **Cartoon allowances (my decisions, worth a director look):**
  - The planner is 90 cm wide (0.050 m). At a real 30 cm, the spec's 4 mm bead would have covered Friday.
  - The lamp is home_kit's "floor_lamp" art used as a 120 cm table lamp, so its shade clears his head and lights the blob from above. The pool is about 0.043 / (0.043 − 0.015) ≈ 1.5× (computed; spec 1.37×).
  - The bead, run and perch scales are 0.17 / 0.36 / 0.4 (spec 0.17 / 0.45 / 0.5). A bigger drop dwarfed the real-size cell.
- **Real-size side effects:** at 1×, the blob is wider than the laptop and about a third of the desk. Seated, his snout reaches over the desk.
- **Lamp:**
  - There's no `desk_lamp` kit art, and the frozen lamp's chain is painted on, so the pull can't move the bead.
  - The lamp casts no shadow of its own (the spec has a 3.2× lamp shadow beside the loom).
  - The lit shade is an unlit amber trapezoid over the painted shade.
- **s06 screen while the lamp is on:** 0.05, not README §4's 0.2. At 0.2 the loom still read plainly through the amber on the cream wall.
- **s03 and s06 laptop:** it's turned 55° toward the camera, not in strict profile, because in profile the painted laptop is a line. The light is still a stylized spot aimed screen → blob.
- **Character fills (README §10)** added to s02, s03 and s06. Their levels were set by eye, not measured.
- **s00:**
  - The lock-screen face is a flat unlit plane a little bigger than the painted screen at its bottom edge.
  - The badge is a cropped square, so a faint seam shows next to it.
  - The half-in-frame blank page is left out: it's 4.7 cm from the phone at real scale.
- **s01:** `apt_exterior`, `skyline_sheet` and `foliage_sheet` aren't frozen. The facade is home_kit pieces on a procedural brick-kraft stock, the skyline and oak are the old proxies, and the sky is procedural. The window hole is 0.054 × 0.056 to fit the kit's frame (spec 0.06 × 0.08). I added a room light behind the pane and a faint street bounce on the facade.
- **Grades:** s01, s02 and s03 use `dawn` (they were `night`). s06 uses `night`, and `amber` while the lamp is lit.
- **Not my files, now out of step:**
  - `docs/shots/README.md` §2 and `docs/assets.md` still describe the old unit.
  - s18 shares the home calendar ("change one, change all four") and is still on the old unit.
  - `evidence/anim-s02/measure.html` reads s02's old API. It is stale.

## Story
I started by reading the scale table, which says a 75 cm desk is 4 cm tall and 7.7 cm wide next to a 9.6 cm gator. That's the fix for the "massive table". It also meant every desk number in the four specs was solved on a desk four times too long. I kept what the story needs: each shadow scale comes from depth alone, so I pinned the open screen's centre at one depth for all the home shots and put the blob at the depth that gives the spec's S. Positions, cameras and hand targets all had to move.

The first s02 render (`s02.jpg` is the final) had his snout and the lamp shade poking into the calendar insert, so the planner moved right. s00 came back as an empty navy frame. The stage's near plane is 5 cm, and the camera sat 2.2 cm above the phone.

s06 took the most passes. At real scale the lamp sat behind his head, out of sight. Making it taller put the chain out of his reach, so he moved 3 mm closer to the desk, and his arm now lands on the bead through the camera. Then the 1.5× loom ran off the top of the frame, so the camera went back to 0.6 m. Last, the lamp frames still showed the loom faintly through the amber at README's 0.2. I took the screen down to 0.05, since the beat is that the lamp makes the loom vanish (`s06.jpg`, frames 3–7).

## State
built · 2026-10-16
