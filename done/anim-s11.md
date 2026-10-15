# Done · anim-s11

## What shipped
s11 is blocked for the animatic. It uses the Marston hero desk unit seen side-on at desk height: the window wall with torn window holes and dark panes, the floor, the desk, the chair, the backpack, the laptop with a hinged lid, the unlit desk lamp, the blank page with the pen, and the phone. The proxy gator sits at the desk. He reaches, lifts and flicks the laptop lid open (1.0–1.5), and the screen lights. He stares at it, glances down, then grips and lifts the phone. It wakes at 3.6, he hunches over it, and the phone spot throws the blob's shadow up the window wall: 4.8× springing to 5.9×. The desk fluorescent chatters from 4.2 and is dead by 5.0. The camera holds to 2.6, then pushes in 0.04 m. All art is proxy.

## Where it lives
- `src/shots/s11.js`: commit `170d1af` (branch `task/anim-s11`)
- `evidence/anim-s11/`: `sheet.jpg`, `t74_00.jpg`, `t77_50.jpg`, `strip_3.4-5.0.jpg`, `crop_laptop_2.0.jpg`, `measure.html` + `measure.mjs` → `measure.txt`, `determinism.txt`, `check_timeline.txt`

## How it was checked
Brief:
- [x] Key-moment sheet: `node render.mjs --page=index.html --sheet=72,72.75,73,73.17,73.5,74,74.7,75.33,75.6,76.4,77,77.95 --cols=6 --w=480 --out=evidence/anim-s11/sheet.jpg`. It covers the hold, the lean-back, the lid reach, the lid lift, the open lid, the screen hold, the glance, the grip, phoneWake, the flicker, the dead tube and the end. I looked at it.
- [x] Two full-res stills, saved as JPEG via `--stills` then `sips` (PNGs deleted): `t74_00.jpg` (local 2.0, looking at the open laptop; 409 KB) and `t77_50.jpg` (local 5.5, hunched over the phone under the 5.9× shadow; 398 KB).
- [x] Shadow scale (`node evidence/anim-s11/measure.mjs` → `measure.txt`). Method: the s10 one, with pixels toggled by the blob's castShadow and back-projected onto the receiver.
  - Pool at 2.0 on the desk top: **0.94×**, centred 0.2 mm from the blob's x (spec 1.0×, ≤ 1.2×).
  - Wall at 3.65: **4.80×** (spec 4.77×, +0.6%).
  - Wall at 4.0: 5.29×.
  - Wall at 4.4: **5.89×** (spec 5.9×, −0.1%).
  - Wall at 5.5: **5.96×** (spec 5.9×, +1.0%), centre (0.072, 0.037).
- [x] `node tools/determinism.mjs --page=index.html --t=73.5,77,62,73.5` → `determinism: PASS`. `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] Readability: see below.

Spec acceptance (`docs/shots/s11.md`):
- [x] 1. At 2.0 the pool is 0.94×, directly under the blob. At 5.5 the shadow is 5.96× on the window wall, and `t77_50.jpg` shows it climbing the wall and the right window. Caveat: at this desk-height camera the pool is only 6.6 mm deep (z 0.0888–0.0954), which is about 2 px on screen. It reads as a dark contact line under the blob, not as a pool.
- [x] 2. `strip_3.4-5.0.jpg` (75.4–77.0 at 8 fps, 14 frames): the shadow appears on the 3.65 frame and grows through 4.4. The left of the frame (lit only by the tube) chatters from 4.2 and is dark from 5.0. The strip runs to 5.0, not the spec's 4.6, so the death shows.
- [x] 3. `crop_laptop_2.0.jpg`: the screen is a cream strip with wavy scribble lines and no letters.
- [x] 4. The lamp's stem and shade show in every frame of the sheet and the strip. Before 3.6 the character fill lights it; after 3.6 the phone spot does.
- [x] 5. The camera, logged in `measure.txt`: (0.020, 0.033, 0.668) with rotation 0 at 0, 1, 2 and 2.6. Then only z moves: 0.66647 at 3, 0.62800 at 5.99. That is 0.040 m of travel and nothing else.

**Readability:** From the strip alone, a cold viewer sees a small gator at a dark library desk at night. He opens his laptop and its screen glows. Then he grabs his phone instead, and a huge dark copy of the little blob beside him, with two eye holes, springs up the wall behind the desk as the room light stutters out. That carries the Story job: he tries, gives up for the phone, and the shadow closes over the table. Two things read weakly:
- "He tries" depends on the lid opening, which is small at this framing. The closed laptop is hidden behind the blob and the lamp base until the lid rises.
- His face is dim. His eyes read, but his expression changes (`tired`, `side`) are hard to see at full frame.

## Gaps
- **Orchestrator's shared positions replace the spec's:** blob mesh (0, 0, 0.0884), stain (0, 0.0004, 0.0884), phone rest (−0.010, 0.0015, 0.116), and s15's lamp-piece placements and knob z 0.0855. The lamp aim doesn't apply, because the lamp is unlit here.
- **Held phone z (deviation).** With the blob at z 0.0884, the spec's held phone (z 0.124 / 0.118) would throw only 3.4× / 4.0× and fail acceptance 1.
  - I kept the spec's x and y and solved z = s·Bz/(s − 1) for the spec's scales: **lift (−0.012, 0.008, 0.1118), settle (−0.014, 0.008, 0.1064)**.
  - The wall shadow's centre and size are therefore the spec's. The phone sits 6–12 mm nearer the wall than written.
  - **Continuity flag for s12:** s12 at the new rest spot is 4.2× (s15's number), so the shadow shrinks from 5.9× to 4.2× across the s11→s12 cut. The spec's chain was 5.9 → 7.1. This needs a call in s12's spec.
- **Fluorescent from behind.** The spec tilts the tube's light 15° toward the camera, so it arrives from the wall side. It lights no camera-facing cutout, and the gator was a black silhouette (first sheet).
  - I added a README §10 character fill: a shadowless PointLight in the fluorescent tone at s15's fill spot (−0.046, 0.040, 0.114), distance 0.07, 0.008 cd. It dies with the tube.
  - Face luma at 2.0 is **83%** of the lit desk top (`measure.txt`), above §10's 30–45%. The desk top is the only key-lit receiver, since the wall gets nothing from the tube. At 0.001 cd the gator was unreadable, so I kept the face readable over the ratio. This needs a director call (G4).
  - After 3.6 no extra fill is needed: the face is 69% of the phone-lit wall.
  - Lamp shade: at tissue's default translucency of 0.8, the tube's back light made the unlit shade glow as if switched on. I set its translucency to 0.15 so s15's click keeps its first light.
- **Light numbers by eye.** Tube 0.6 lx (spec), phone spot 1.0 cd (s15's), laptop point 0.15 cd (spec), ambient ×0.4 (spec). The face fill at the phone is 0.009 cd (0.3 × an s15-scale 0.03), because the spec's "0.3" read literally as cd would flood him.
- **Tube death** is my seeded on/off chatter per 24 fps frame, 4.2–5.0, under a ceiling falling from 1 to 0.3. Its first frame at 4.2 is a drop. I didn't use `fluorescent().update()`, whose rare stutters could fire before 4.2.
- **`arm_r` doesn't cast.** Its tip is at the phone, about 49° off-axis inside the 51.6° cone, and would throw a 3.7× arm across the wall. The phone pieces don't cast either. The wall, panes and floor only receive.
- **Phone tilt (cheat).** Flat at rest, the phone is edge-on to this camera (about 2 px). Lifted, it tilts 0.5 rad toward the camera and 0.6 rad toward his face, so the cyan screen reads. The lid screen is a cream strip on the lid's inner face, since a true profile shows no screen.
- **Poses** are built per frame with `specPose` from the spec's lean, arm and head numbers.
  - The hunch arm is solved to −6° for the settled phone's left end.
  - The flick has a one-drawing follow-through (lean 18, arm 14) that I added.
  - The lid swings 20 → 75 → 96 → 100° over 1.17–1.5.
  - The blob's stretch eases back to 0 by 2.25. The spec doesn't say when it returns.
- **Squash and wobble timing** run on drawings: 0.15 squash from 1.583, −0.10 stretch from 1.75, and wobble peaking at 1.6 at 3.833. `blob.update` still calls core `onTwos` internally.
- **Orchestrator's known bugs, not touched here:**
  1. Core `onTwos` can land on the previous drawing because of float error. s11 uses a local `on2s = (t) => Math.floor(t * 12 + 1e-4) / 12`.
  2. `lampLight` dust needs `computeBoundingSphere()` after each `update`. s11 doesn't use `lampLight`, so it doesn't apply.
- **LUT:** `marston`, as in s13 and s15 (`act2b` doesn't exist). s10 uses `night`, so the s10→s11 cut changes grade; not checked against s10's frames.
- **Blob shading:** this branch predates `0870fef` (the matte-ink Exam, Q7). The merged film will show the newer blob, and I haven't looked at it.
- **Pen and page** lie flat and are effectively invisible from this camera.
- **Not verified:** real art (nothing is frozen), the cuts from s10 and into s12 (s12 isn't built), and the lamp's own smaller wall shadow, which I couldn't separate visually from the blob's and didn't measure.
- **Sound:** not placed (brief).

## State
built · 2026-10-15
