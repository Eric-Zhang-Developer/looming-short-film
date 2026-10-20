# Done · anim-s10

## What shipped
s10 is blocked for the animatic. The set is a stacks aisle seen down its length: a navy end wall, a gridded floor, 8 shelf wings (proxy art, a seeded shelf drawing per flat, no two alike), 3 ceiling headers each with a glowing tube. The legged gator's front turnaround walks toward the locked camera from z 0.08 to 0.32, phone in his right hand, backpack behind him, the blob beside it. The phone spot throws the blob's shadow (eye holes and all) onto the end wall, and it swells from 2.8x to 10.8x until it fills the aisle end. Tubes 1 and 2 flicker in their windows. All art is proxy.

## Where it lives
- `src/shots/s10.js`: commit `a4a29e7`
- `evidence/anim-s10/`: `sheet.jpg`, `still_t69_00.jpg`, `still_t71_95.jpg`, `strip_flicker1.jpg`, `strip_flicker2.jpg`, `shadow.txt`, `fill.txt`, `determinism.txt`, `check_timeline.txt`, plus the measuring tools `measure.html`, `measure.mjs`, `luma.mjs`.

## How it was checked
Brief:
- [x] Key-moment sheet: `node render.mjs --page=index.html --sheet=66,66.4,66.7,67,68.5,69,69.4,69.7,70.2,71,71.5,71.95 --cols=6 --w=480 --out=evidence/anim-s10/sheet.jpg`. I looked at it: the shadow grows left to right, eyes show from 68.5 (blink drawing) on.
- [x] Two full-res stills (JPEG, under 2 MB): `still_t69_00.jpg` (local 3.0, both eye holes in the shadow) and `still_t71_95.jpg` (local 5.95, the shadow fills the aisle end).
- [x] Shadow scale: `node evidence/anim-s10/measure.mjs` (shadow vs blob mask, back-projected onto the wall, wings hidden for the measurement). Scale 2.83 / 4.20 / 5.50 / 6.89 / 8.15 / 9.58 / 10.76x at t = 0…6 (6 taken at 5.99) against 2.8 / 4.2 / 5.5 / 6.8 / 8.2 / 9.5 / 10.8x: all within 1.3% (`shadow.txt`).
- [x] `node tools/determinism.mjs --page=index.html --t=67,70,62,67` → `determinism: PASS`. `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] Readability: see below.

Spec acceptance (`docs/shots/s10.md`):
- [x] 1. Sheet includes 0, 1, 3, 5, 6 (66, 67, 69, 71, 71.95). Monotonic growth; scale at 1.0 is 4.20x and at 5.0 is 9.58x (spec 4.2 / 9.5).
- [x] 2. At 5.99 the shadow spans x −0.143…+0.156 m and y 0.001…0.252 m (the frame's top), so it covers the aisle width ±0.09 from the floor to above 0.16 (`shadow.txt`, `still_t71_95.jpg`).
- [x] 3. Gator + backpack + phone shadow on the end wall: 0 px at every table time, i.e. 0% of the blob's (`shadow.txt`). The method detects such a shadow: with `arm_r` casting it measured 2.4x the blob's at t = 3 (run once as a check, not saved). Both eye holes show in `still_t69_00.jpg`.
- [x] 4. `strip_flicker1.jpg` (66.3–67.1) and `strip_flicker2.jpg` (69.3–70.1), every frame, cropped to the tubes: tube 1 (bottom bar) flickers in the first, tube 2 (middle bar) in the second; tube 3 (top bar, nearest) stays steady in both, and in the code it has no window.
- [x] 5. Camera: set to (0, 0.085, 0.95), rotation 0, every frame; no other camera code.

**Readability:** From the strip alone a cold viewer sees a small green gator walk toward us down a library aisle, a phone glowing in his hand, a dark blob with eyes at his side, and a huge dark copy of that blob with two glowing eye holes growing across the wall behind him until it fills the aisle end, while the lights above stutter and then dim. That carries "the shadow follows him and grows to fill the end of the aisle, the lights falter"; that the shadow is the blob's reads from the eye holes and the shape match. That he never sees it is carried only by his face staying on the phone (his eyes are tiny at this size).

## Gaps
- **Light numbers I chose (spec silent or unphysical):**
  - Phone spot half-angle **0.75 rad (43°)**, penumbra 0.3, not the spec's 0.85 / "half-angle 0.425". three's `angle` is a half-angle, so the spec's two numbers disagree. At 24° the blob's 21° half-size left no lit wall around its shadow to read against. His body is 70° off the axis, so he still casts nothing into it.
  - Spot intensity = 0.25 cd × (phone-to-wall distance / 0.12)^2, not a constant 1.0: a constant would dim the wall 14x between t = 0 and 6. 0.25 is by eye for a Night Navy wall (s03's 0.04 is for cream); absolute values wait on calibration.
  - Face fill (spec, 0.3 of the key, distance 0.06, no shadow): 0.012 cd. **README §10 check:** his face is 61.0 against 68.2 for the key-lit wall seen through an eye hole (89%, far over the 30% line), so I added no extra character fill. The spec's own fill adds about 1 luma (`fill.txt`: 61.0 with, 60.1 without).
  - Tube flicker is my seeded on/off per 24 fps frame (starts dark), not `fluorescent().update(t)`: its stutter happens in about 1 of 8 windows and wouldn't reliably show in 0.6 s. The `fluorescent()` object still supplies the light and its shadow. Directional lights have no position, so each tube's envelope dims the whole set a little, not just near the tube; the visible local cue is the tube strip's own brightness. Intensity is 0.7 × envelope (0.35 / 0.126), by eye.
- **Casting:** wings, headers, floor, wall, `arm_r` and the backpack are set not to cast. The arm tip is 3 mm from the phone, inside the cone; casting it threw a 2.4x wall shadow. At the spec's z −0.025 the backpack sits in the cone's core and would throw a 9x rectangle beside the blob's shadow. The wings would shade the wall left of the aisle once the phone is deep in it. So the fluorescents' small floor shadows come from the gator body and blob only.
- **Hand point:** the spec's hand offset (−0.050, 0.045) is 0.0355 m from the rig's shoulder, 3.5 mm beyond the 0.032 arm, and the spec's "arm swung 25° out" cannot reach it. I kept the phone and blob at the spec offsets (the shadow geometry depends on them) and aimed `arm_r` at the phone (about −66°, solved each frame with the body's sway), so the fingertip stops 3 mm short of the phone's centre. The phone is a card tilted screen-up (−1 rad) with a cyan screen, at the offset in world space.
- **Root:** the front turnaround's root is the feet, not the hip (contracts), so the spec's "from his root" offsets are read from the feet, as in s09. The blob's mesh origin is its contact point, so it is placed 0.88 r below the offset.
- **Head tilt:** the front turnaround has no head joint, so the −12° / −15° / +6° head moves are a vertical slide of the eyes and mouth (0.12 mm per degree), plus the eye swap (`open` 3.4–4.0). This reads weakly at 36% of frame height.
- **Backpack** (`backpack_front`) hangs from his body 3 cm behind it, so the blob (z −0.025) sits in front of it: at the spec's depth of −0.010 it hid the blob's inner eye. It pokes out on his right (screen left).
- **Frame content:** at the end the shadow's top (y 0.252) is the frame edge, and the nearest tube bar and header hide part of it; the wings cover the wall outside x ±0.09, so most of the shadow's width is seen only through the aisle (that is the spec's "fills the end of the aisle").
- **LUT:** `night` (README §11). **DOF:** focus 0.95 − z_g, aperture 0.02, maxblur 0.01.
- Not verified: how this looks with real `marston_stacks`, `study_props_sheet` or `gator_sheet` art (none frozen; the real-crop branch for the wings is written but never run); the cut from s09 (not built on this branch) or into s11.
- The 404 lines in render output are a missing favicon or similar from the page, not from this shot.

## State
built · 2026-10-15
