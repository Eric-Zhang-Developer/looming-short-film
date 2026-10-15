# Done · anim-s08

## What shipped
`src/shots/s08.js` blocks the 6 s scroll-to-sunrise on a locked camera (FOV 20, (0.04, 0.15, 1.15) → (0.04, 0.13, 0.15)). The bedroom is procedural (wall with a window plate, tissue pane, two navy curtain panels with a 3 mm / 1 mm seam, rod, ceiling, floor) plus the s07 ladder and drill, the bed, the phone, the Student and the Exam. The Student is the front turnaround lying on his side (head −x, feet 0.25), on 2s: thumb flick every 0.5 s from 0.25, slow blink 1.50, head tip 2.83, yawn 3.00–3.50, blink 4.50. The Exam blinks with his yawn and looks at the seams from 5.00. The phone spot is aimed L → blob every frame (12.6×), and dawn is a directional light behind the wall that gets in only through the seams.

## Where it lives
- `src/shots/s08.js`: commit `786b9f9`
- `evidence/anim-s08/`: `sheet.jpg`, `t57_25.jpg`, `t59_95.jpg`, `crop_seams.jpg`, `crop_phone.jpg`, `strip_slash.jpg`, `strip_thumb.jpg`, `measure.html` + `measure.mjs` → `measure.txt`, `light.mjs` → `light.txt`, `thumb.mjs`, `seam_blur.mjs` → `seam_blur.txt`, `determinism.txt`, `check_timeline.txt`: commit with this note
- Branch `task/anim-s08`

## How it was checked
- [x] Key-moment sheet (12 frames, 54.0 … 59.95, ends before s09): `sheet.jpg`. I looked at it: the egg-shaped shadow sits over the curtains with sleepy-eye holes during the yawn, seams grow from nothing to hot lines, gold slashes appear on the floor late.
- [x] Two stills: `t57_25.jpg` (yawn, eyes closed, thumb flick drawing, shadow with closed-eye arcs) and `t59_95.jpg` (dawn at full, blob looking at the seams). 0.5 MB each.
- [x] Shadow scale from pixels (`measure.txt`, cast-on vs cast-off diff back-projected to z 0, over the blob's own mask): 12.68× at 1.0 s (spec 12.6 ± 1.3), 12.83× at 3.5, 12.74× at 5.0. Centre x −0.135 as spec (−0.308..0.038 incl. the blob's wobble lumps). Height reads 11.8× because the shadow's foot sits on the floor line.
- [x] Determinism: `node tools/determinism.mjs --page=index.html --t=55,58,70,55` → `determinism: PASS` (`determinism.txt`). `check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] Readability: below.

Spec acceptance:
- [x] 12.6× ± 1.3 at 1.0 s: 12.68×.
- [x] No seam light at 0.0 and ≥1.5× at 6.0 (`light.txt`, graded 8-bit luma, brightest phone-lit wall pixel 126.7): right seam 238.9 (1.89×), left 201.7 (1.59×), centre gap 237.5. At 0.0 the seam boxes read 63–73 (the pane under ambient, no brighter than the wall); `crop_seams.jpg` left panel shows no glow.
- [x] Gold slash never overlaps him or the blob: sun-on vs sun-off diffs at 2, 4, 5, 5.5, 5.99 s have 0 lit pixels inside the blob or the Student; nearest approach is 16–17 px to the blob and 23 px to the Student (`measure.txt`, `strip_slash.jpg`). Close in screen space: the part of the beam that lands on the mattress top crosses just in front of the bed's top edge, 3–5 cm toward the camera from the blob.
- [x] Thumb flick on every listed time: all 12 start on the listed time and last one 2s drawing (`thumb.mjs` output below), including 3.25 inside the yawn (`strip_thumb.jpg`). The 2° move is ~1 mm, so it is small in the strip; the numbers are the proof.
  - `flick starts 0.250 0.750 … 5.750`, `all 12 match: true`; eyes closed 1.500–1.667, 3.000–3.667, 4.500–4.583; mouth `o` 3.000–3.667; head tilt 2.833–3.667.
- [x] No legible text: `crop_phone.jpg` (the phone back is a plain navy card, the screen faces him and is a flat cyan quad; the frame has no glyphs at all).

**Readability:** From the strip alone a cold viewer sees a small figure curled up with a glowing phone in a dark room, and a huge dark shape from the blob filling the wall behind (with its own sleepy eyes closing when he yawns); then a hot gold line appears in the curtains and grows while he never looks up, and the blob does: "a night went by, the day is arriving, and he is still scrolling" reads. His own face is small (proxy parts a few px) so the yawn reads more from the blob's shadow eyes and the `o` dot than from him.

## Gaps
- **Cone 0.78 rad / penumbra 0.2, not the spec's 0.6 / 0.3.** At 0.6 the blob's 19° shadow nearly fills the cone and the lit wall around it is a sliver, so the 12.6× shape does not read. At 0.78 (44.7°) his head (47°) is still outside. One constant, `ANGLE`.
- **DOF aperture 0.009, not 0.012.** The spec wants seams at ≤ 3 px; at 1080 px the blur is 1080·aperture·0.30 m = 3.9 px at 0.012, 2.9 px at 0.009. Measured edge 10–90 % on the right seam is 4 px median, which includes the torn edge's own wobble (`seam_blur.txt`).
- **Student and bed cast nothing for the phone.** The arm is 2 cm from the phone and threw its own 24× shadow, the pillow's left end sits 20° off axis and threw a 10× one; the spec says the phone's shadow is the only big one. They do not need to cast for the sun either. The wall, curtains, ladder, rod and drill do cast.
- **Student rig:** the spec's "lying on his side facing camera" is the `front` turnaround rotated 90°, not the side-rig `prone`/`yawn` poses (those are in profile, facing frame-left). The proxy torso has no head, no hoodie, no thumb: the flick is arm_r +2°; head tip is the whole body +2°. Arm tip lands 2 cm left of the phone and slightly overlaps the blob's foot on screen (the arm is a fixed 3.2 cm). The pillow is hidden behind his torso.
- **Face light:** his face reads 70 % of a key-lit wall patch (`light.txt`), above the §10 30 % floor, so no extra character fill was added; the spec's cyan face fill (0.2 × key, distance 0.06) does it. Blob key pinned with `{ key: spot }` (§11).
- **Window build:** a 1.4 m torn wall wanders by centimetres at its edge, so the wall has a generous opening and the exact window hole is a small cream plate (z 0.001) in front. The right seam measures 7–9 mm wide, not 3 mm (the plate's tear); the left seam is ragged and thin. Panels are untilted (a 1.5° lean would close the seams). Wall, floor and ceiling do not boil (hole edges are static); everything small does.
- **Sun:** position (−0.9, 0.45 → 0.70, −1.0), target window centre, as spec; intensity 15 × ease-in (0 at 0.0), colour pulled 50 % toward lamp amber because the `night` grade turns pale gold into lilac. The spec's "near end at x 0.20–0.25 at z 0.36" is inconsistent with its own sun (the beam crosses z 0.36 at x 0.17 and reaches z 0.46 at x 0.245); I kept the sun and the slash is where the geometry puts it. A faint pale strip also shows on the mattress front where the sun shines through its translucent card.
- **Key intensity** 0.10 cd, tuned so the lit wall is ~125/255 and the seams can reach 1.5× (`light.txt`). Dim for a "night" shot by design; raise `SPOT` and `SUN.I` together.
- **Not verified:** the cuts from s07 and into s09 (s07 is built in parallel); frozen art (all proxies; the ladder is opened up between rungs only when it is a proxy). No sound.
- Disk was at 100 % during the work on this machine (other jobs); no evidence is lost, but check it if a render fails.

## State
built · 2026-10-15
