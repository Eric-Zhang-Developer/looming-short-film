# Done · anim-s04

## What shipped
`src/shots/s04.js` blocks the 8 s fridge dodge with a locked camera (FOV 20, (−0.11, 0.15, 1.00) looking at (−0.11, 0.12, 0.12)). The set is a procedural kitchen: a wall plate with a window hole, upper and lower cabinet doors with round knobs, a kraft counter and floor, and a tissue pane with mullions. It also has a box fridge built from the `mini_fridge` cut plus top, back and interior panels, the door, the stool, three jars and a carton.

The Student is the shared legged rig, kneeling with his hip at `hipHeight(kneel_reach)`. He works pose to pose on 2s through the spec's action table. The three placement poses are solved with `specPose` so his fingertip covers each jar's spot as the camera sees it. The Exam (`makeExam`, r 0.012) scoots twice on the stool. The fridge spot sits at the spec's L and is aimed each frame along L → blob to the wall, so the shadow scale comes from the geometry. A README §10 character fill (shadowless, cool, 0.15 m reach) lights his face from the front, and the key's shadow near plane follows §11. All art is proxy.

## Where it lives
- `src/shots/s04.js`: commit `09c9d9a`, then `4021a84` (character fill, §11 near plane)
- `evidence/anim-s04/`: `sheet.jpg`, `t20_83.jpg`, `t25_00.jpg`, `t27_50.jpg`, `crop_labels_3.4.jpg`, `crop_wall_5.0.jpg`, `measure.html` + `measure.mjs` → `measure.txt`, `light.mjs` → `light.txt`, `face_before_after.jpg`, `determinism.txt`: commits `c559d07`, then `46f96d7` (everything re-rendered after the fill)
- Branch `task/anim-s04` (`wave/3-assets` merged in at `13b60e0` for README §10–11), plus the commits for this note

## How it was checked
Brief:
- [x] Key-moment sheet: `node render.mjs --page=index.html --sheet=20,20.67,20.83,21.5,22.17,22.33,22.75,23.33,23.75,24.33,25,25.5,25.83,26.17,26.5,27,27.5,27.95 --cols=6 --out=evidence/anim-s04/sheet.jpg`. That is 18 frames, one per beat and key pose, ending at 27.95 because 28.0 is s05. I looked at it:
  - jars 1–3 land on the fridge top in size order
  - the shadow steps left and grows at 2.33 and 5.33
  - the blob's eyes close at 5.0 and open again at 5.5
- [x] Stills: `t20_83.jpg` (jar 1 placed, 4.2× shadow), `t25_00.jpg` (the content beat: his sit-back, the blob copying his closed eyes, 5×) and `t27_50.jpg` (6.25×, over the cabinets). Each is 0.6 MB, converted from render.mjs PNG with `sips`.
- [x] Shadow scale, from pixels (`measure.txt`). Method: the blob's cast-on vs cast-off diff, back-projected to the wall, against the blob rendered alone and back-projected to its own plane. Width / height:

  | Local t | Target | Measured | Result | Center | Spec center |
  |---|---|---|---|---|---|
  | 1.0 | 4.2× | 4.31× / 4.18× | PASS | (−0.154, 0.128) | (−0.158, 0.127) |
  | 3.5 | 5.0× | 5.08× / 5.04× | PASS | — | — |
  | 7.5 | 6.25× | 6.31× / 6.48× | PASS | (−0.278, 0.175) | (−0.282, 0.172) |

  The mask leaves out the blob's own screen box, because the blob also shades the stool 1 mm behind it.
- [x] Determinism: `node tools/determinism.mjs --page=index.html --t=21.5,25,10,21.5` → `determinism: PASS` (`determinism.txt`, re-run after the fill). t = 10 is in s02.
- [x] Character fill (README §10), measured on graded frames by `light.mjs` (`light.txt`). Face = mean luma of a 36 × 24 px box on his head; lit wall = a key-lit cabinet door right of every shadow position; shadow = inside the 6.25× shadow.

  | Local t | Face / lit wall, before | Face / lit wall, after | 6.25× shadow contrast, before → after |
  |---|---|---|---|
  | 5.0 | 17 % | **35 %** | — (the box is outside the 5× shadow) |
  | 7.5 | 18 % | **36 %** | 71 % → **72 %** |

  The lit wall reads 185.1 → 185.2 and 182.6 → 182.8, so the fill doesn't reach it. `face_before_after.jpg` shows face crops at 5.0 (top) and 7.5 (bottom), before on the left and after on the right. After the fill he reads as green paper with his arm, pocket and open eyes (7.5) visible. The closed eyes at 5.0 are a thin dark line, still small at frame size. The 6.25× scale is unchanged at 6.31× (`measure.txt`, re-run).
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`
- [x] Readability (below)

Spec acceptance:
- [x] 4.2× ± 0.4 at 1.0 s, 6.25× ± 0.6 at 7.5 s: 4.31× and 6.31× (above).
- [x] At 7.5 the shadow overlaps the upper-cabinet band: it spans y 0.095–0.254, covering 0.095–0.220 of the band (`measure.txt`, `t27_50.jpg`).
- [x] No Student shadow on the wall at 5.0. When every Student part stops casting, **0 px** change (`measure.txt`). See `crop_wall_5.0.jpg`.
- [x] Every jar and carton label is blank: `crop_labels_3.4.jpg`. The proxies carry no marks.
- [x] Contact sheet 0 / 0.83 / 1.5 / 3.3 / 5.0 / 6.2 / 7.5 are all in `sheet.jpg`, along with the in-between key poses.

**Readability:** From the strip alone, a cold viewer sees a small creature fussing at a glowing fridge while a blob on a stool behind him casts a giant shadow on the kitchen wall. The shadow creeps left, swells across the cabinets each time the blob shuffles closer, and copies his closed-eye contentment. "The thing he's ignoring is getting bigger while he busies himself" reads. "He *lovingly* reorganizes" reads better since the fill: he is now green paper, and his poses, the jar in hand and his open eyes show. The face swaps are still small at this framing (proxy face parts about 10 px), so the contentment reads more from the sit-back pose and the blob's copied closed eyes than from his own face.

## Gaps
- **He is backlit, by the spec's own geometry,** and the §10 character fill is now what lights him. He kneels at z 0.30, in front of L (z 0.25), and the spec's interior fill doesn't reach his snout. The fill:
  - is a `PointLight` at (0.03, 0.075, 0.38), in front of and above his eye line, with no shadow
  - is coloured Phone Cyan 40% toward Navy
  - has `distance` 0.15, so it stops well short of the wall (0.38 m) and the stool (0.20 m)
  - has intensity 0.014 cd, set to 35–36 % of the wall, mid-band rather than the 30 % floor because the proxy face parts are tiny
  - also lightly lights the fridge's front panel and the floor at his knees, which sit inside its reach. That doesn't touch the wall or the shadow.
- §11: `spot.shadow.camera.near = 0.004` after every `aim()`. The blob already cast before this change: `aim()` put the near plane at ~0.019 m against the blob's 0.078 m. The measured scale didn't change.
- **Spec geometry conflicts I resolved (each is a one-line change in s04.js):**
  - **Door.** At the spec's 100°, the ray from L to the blob's center crosses the door 3 cm from the hinge at y 0.048, under the door's 0.05 top, so the door would shade the blob's lower half. The door would also stand in front of the stool. I swung it to **135°**, where it sits behind the stool and every ray from L to the blob clears it. Its own wall shadow was then a large wedge beside the blob's, so the door has `castShadow = false`.
  - **Upper cabinets stop at x 0.01, not 0.05.** At 0.05 they would cover the window (x 0.02–0.08, same height).
  - **Lower cabinets sit at z 0.026, behind the counter's front edge,** not on the wall plate. Otherwise the 3 cm counter overhang floats.
  - **DOF focus is 0.70 m, where he actually kneels.** The spec's 0.89 m isn't his distance. Aperture 0.015 keeps wall blur at ≈ 3.4 px by BokehShader's math (768 × aperture × 0.30 m). That blur is **computed, not measured from pixels**.
  - **The stool is one profile cut at z 0.189,** the back of its 0.19–0.21 range, so the blob is never behind it. There is no seat disc.
  - **Jars sit at z 0.245** (inside 0.24–0.26). At L's z of 0.25 they would be edge-on to both lights.
- **Exposure trim.** The stool and door are 5–8 cm from the key, which gives them ~15–20× the wall's irradiance, and they blew to white. Their material colour is scaled by 0.15 (`NEAR_TRIM`, marked `ponytail:`). It is a stand-in for exposure, and only on those two.
- **The stool throws its own 4.17× shadow** under the blob's, across the counter and lower cabinets. That's physical and kept: the giant shadow sits on a giant stool. The spec doesn't mention it.
- **Spec silent, I chose:**
  - LUT `night`.
  - Key intensity 0.3 cd, tuned by eye so the lit wall stays under white.
  - Wall and cream stocks for the cabinets.
  - Jar 2 lands 2 mm right (x 0.062) and is nudged to 0.060.
  - Blob eyes go `side` again at 5.83.
  - His eyes open at 7.0 when he reaches back in.
  - Jar 3's turns are a scale.x flip.
  - The carton's ±10° comes from the shake poses' arm angle.
  - Wall and floor are untilted: the wall is the measured receiver. Cabinet doors and props get the ±1.5° seeded tilt.
- **Window:** the pane barely glows. The dawn rig is capped at 20% of the key's wall irradiance, as specified, and at that level the tissue reads as a faint pale square with a mullion cross, not gold.
- **Not built:**
  - The blob's stain: the profile stool has no seat top to stain.
  - "Opened 3/4 to camera": the rig is a flat side profile.
  - Jars travel straight from hand to spot. Seen from the camera they rise "through" the fridge top while being lifted out.
  - The fridge top renders dark navy with pale torn-edge flecks, because it is lit only from below.
- **No sound.** Cues belong to `src/audio/cues.js`, per the brief.
- **Not verified:** the cut from s03 and to s05 (both are stubs); how frozen art looks (none exists for these sheets). `build()` also returns `exam`, `rig` and `spot` beside `update`, for the measure page. The film ignores them.

## State
built · 2026-10-15
