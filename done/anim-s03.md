# Done · anim-s03

## What shipped
s03 blocked for the animatic on proxies. The home desk unit is at README §2 coordinates: wall, desk top and apron, calendar sheet 1 with a drawn grid and Friday's red circle, the unlit lamp, exam_page, chair and floor. The camera is locked at the spec's position (FOV 20). The Student is the legged `makeGator` rig at hip (−0.075, −0.012), on 2s: anticipation, shrug, drop back, then phoneUp on the 0.50 drawing (lean 16, arm −6), an ease-out into the hunch (lean 24, arm −11) and six thumb flicks. The phone is a two-sided card that flips screen-up on the beat. The key light is `phoneLight({ angle 0.9, penumbra 0.4, distance 0.6 })` at the phone, re-aimed every frame with `aim(spot, wallHit)` along phone → blob. It is dark until 0.50 and full from that frame. Other lights: a 15% cyan face fill, s02's `dawnLight` at k 0.35 held at 30%, and `ambient()`. The Exam (`makeExam`, r 0.012) glances at the phone, then at its own shadow, then scoots 7 mm at 3.50–3.67. DOF is on the blob, pulled to the wall over 1.5–2.5. LUT `night`.

## Where it lives
- `src/shots/s03.js`
- `evidence/anim-s03/`: `sheet.jpg`, `still_15_54.jpg`, `still_16_5.jpg`, `spot_0.46_0.54.jpg`, `crop_wall_2.5.jpg`, `crop_eyes_2.5.jpg`, `measure.html` + `measure.mjs` → `measure.txt`, `determinism.txt`, `check_timeline.txt`
- Commits on `task/anim-s03`: `57031de` (shot), `fa168a2` (evidence), plus this note

## How it was checked
I looked at every image listed below.

Brief:
- [x] Key-moment sheet: `node render.mjs --page=index.html --sheet=15,15.17,15.25,15.34,15.42,15.5,15.59,16,16.5,17,17.5,18,18.34,18.5,18.59,18.67,19.5,19.95 --cols=6 --out=evidence/anim-s03/sheet.jpg`. That is one frame per beat or key drawing, ending at 19.95. Times like 0.33 are nudged to 0.34 so `onTwos` lands on that drawing.
- [x] Two full-res stills, rendered as 1920-wide JPEG sheets: `still_15_54.jpg` (phoneUp, the screen awake, 2.33×) and `still_16_5.jpg` (the hunch, 3.0×).
- [x] Shadow scale measured (`measure.txt`), well inside ±20%:
  - 0.5: 2.38× against the spec's 2.33×
  - 1.5: **3.12×** against 3.0×
  - 3.75 and 4.5: 3.40× against 3.33×
- [x] `node tools/determinism.mjs --page=index.html --t=15.6,18.7,10,15.6` → `determinism: PASS`. A grep for clocks and Math.random in s03.js finds nothing.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- [x] Readability (below)

Spec acceptance:
- [x] 1. The shadow at 1.5 s measures 3.12×, inside 3.0 ± 0.3. Method (smoke-paper): the blob's colorWrite is off, the shadow is diffed between casting and not casting with the window light's shadow off, and the changed pixels are back-projected to z 0, counting only wall hits above the desk. The scale is that width over the blob's own back-projected width. The blob measures 2.74–2.86 cm wide, not 2.4, because of its lobes and wobble. The ratio is what matters.
- [x] 2. `spot_0.46_0.54.jpg`: at 0.46 there's no cyan and no wall shadow. At 0.54 there's the full wedge and the shadow.
- [x] 3. `crop_wall_2.5.jpg`: the only cast silhouette from the phone is the blob's. There's no Student or lamp shadow. The calendar does throw a thin phone-shadow strip on the wall along its right and bottom edges (it stands 6 mm off the wall). That is the calendar's own edge, not a figure.
- [x] 4. `crop_eyes_2.5.jpg`: both eye holes show in the wall shadow, as half-lids because the blob's eyes are `side` at 2.5.
- [x] 5. The sheet includes 0, 0.25, 0.5, 1.0, 1.5, 3.0 and 4.5: the shrug, the phone up and the shadow climbing from half-on-the-desk to above his eye line.

**Readability:** From the sheet alone, a cold viewer sees a gator at a desk shrug and pick up his phone. A cyan light comes on, and the little ink blob's shadow rises on the wall, about three times its size, eyes and all. He stays bent over the screen and never looks up, while the blob glances at its shadow. That matches the Story job. Two things are weaker. The shrug is small at sheet size, because the proxy gator is cropped at frame left by the spec's framing. "He doesn't notice" rests on the pose alone, since his eyes are tiny proxies.

## Gaps
- **The shadow steps at the calendar's bottom edge** (`crop_eyes_2.5.jpg`). The top of the shadow lands on the calendar at z 0.006 and the rest on the wall at z 0. The phone is about 15 cm to the left, so that 6 mm of depth shifts the top part about 8 mm toward the light. It's real geometry and reads as paper, but it breaks the silhouette at the spec's "lies over the calendar's lower edge". The calendar's 1.5 cm bottom curl (to z 0.014) **isn't built**. It would bend the step rather than cut it. Director/look call: keep the step, or move the calendar so the 3× shadow clears it.
- **aim() workaround (lights.js isn't mine).** `aim(spot, point)` sets the shadow camera's near plane to half the light→target distance. Aiming at the wall hit puts near about 6 cm out, behind the blob (5 cm from the phone), so the blob dropped out of its own shadow map and there was no wall shadow at all. The shot sets `spot.shadow.camera.near = 0.004` after each `aim()`. Every phone shot that aims at a wall hit will hit this. Suggest that `contract-lights` make `aim` take the caster into account.
- **Window at 30% from frame 0** (the literal spec). That makes the first 0.5 s darker than s02's last frame. If the cut reads as a jump, drop the window at phoneUp instead.
- **The blob's highlight follows the window, not the phone.** blob.js picks the brightest shadow-casting light by raw intensity, and the directional 0.26 beats the spot's 0.04 cd. The body still reads as ink, so I left it.
- Tilts: only the calendar gets s02's ±1.5° seeded tilt. The wall, desk top and apron stay true: the wall is the shadow's receiver, and a tilted apron would cut into the phone's rest spot. The lamp pieces are untilted. Whether s02 seeds its tilts the same way is **not verified**, because s02 is being built in parallel.
- Choices where the spec was silent:
  - The phone lies flat, screen up, as the spec says, so from this camera it reads as a thin cyan sliver.
  - The far arm holds −40° throughout, except the shrug's −20°.
  - Head −10° from 0.42 (POSES.scroll).
  - The shrug uses POSES.shrug's absolute head 6°, not slump +6.
  - Shoulders rise 1 mm on the shrug before dropping back.
  - The scoot's mid drawing is lifted 2 mm.
  - The settle is 0.2·spring.
  - The tail runs `follow` as in s02.
  - LUT `night`, as in s01, since there is no morning grade.
  - Aperture is the default 0.02.
  - Chair: the proxy is scaled to the spec's 0.032 width and stands on the floor. Floor added at y −0.034.
  - The wall doesn't boil, because its edges are off-frame.
- The proxy calendar gets a faint grid and the red circle drawn on, so the circle matches s02. Real art will carry its own.
- **Not verified:** the match to s02's last frame (s02 isn't built in this worktree; it's still the stub), the look with frozen art, and render time (about 2.5–4 s per frame cold, mostly makePaper at res 1024 and 2048).

## State
built · 2026-10-15
