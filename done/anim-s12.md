# Done · anim-s12

## What shipped
s12 (Quiet 1, 78–88 s) is blocked in `src/shots/s12.js`: a locked camera, the Marston desk unit with s15's revised numbers (blob mesh (0, 0, 0.0884), stain (0, 0.0004, 0.0884), phone (−0.010, 0.0015, 0.116) face up, lamp aim (−0.008, 0, 0.096), all read from s15's `UNIT`), the laptop closed, and the gator in `head_down` from 0 to 10 with eyes `closed`. Saturation eases 1.0 to 0.55 over 0–2. The blob breathes ±6% on a 5 s period. The phone spot auto-dims from 6.0 to 6.5. Boil is 4/s.

## Where it lives
- `src/shots/s12.js`
- `evidence/anim-s12/`: `sheet.jpg`, `strip.jpg` (78–87.75 at 4 fps), `t79_25.jpg` (breath peak), `t84_25.jpg` (after the dim, second peak), `measure.html` + `measure.mjs` → `measure.txt`, `determinism.txt`
- Commits on `task/anim-s12`: `4bca90d` (shot), `189624f` (evidence), plus this note

## How it was checked
Brief:
- [x] Sheet: `node render.mjs --page=index.html --sheet=78,79.25,81.75,83,84.25,85,86,87.9 --cols=4 --w=480 --out=evidence/anim-s12/sheet.jpg`. I looked at it.
- [x] Two full-res stills at 1920×1080, JPEG under 0.2 MB each: `t79_25.jpg`, `t84_25.jpg`. Both match the spec's projected pixels: head about (291, 791), phone about (490, 883), blob eyes about (600, 750), shadow centre near x 1100.
- [x] Shadow scale, from `measure.txt` (wall shadow's width ÷ the blob's own drawn width, from pixels):
  - t 3.0: **7.12×** (target 7.1 ± 20%). t 1.25: 7.14×. t 3.75: 7.16×.
  - Centre x 0.062–0.065 (spec 0.061). Right edge 0.152–0.165 is inside the frame (x to 0.178). It runs off the top.
- [x] `node tools/determinism.mjs --page=index.html --t=79.25,84.25,100.5,79.25` → `determinism: PASS`. `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] Readability: below.

Spec acceptance:
- [x] 1. Camera matrix, joint transforms, the head's world position and the spot position are identical in all 59 sampled local frames (every 5th frame plus every frame of 6.0–6.5): 0 differ. The pixel hashes at 79.25 and 84.25 differ.
- [x] 2. Breath: width at 1.25 is 0.2035 m and at 3.75 is 0.1755 m, so the trough is **13.8%** narrower (spec 10–14%, at the top of the range: the blob's wobble adds to the ±6%). The spec's absolute 0.181 / 0.161 m used the 2.4 cm blob; the real blob draws 2.5–2.85 cm, so absolute widths run about 12% high.
- [x] 3. 7.12× at t 3.0.
- [x] 4. Mean display luminance, with post: s12 at 86.0 is **0.0516** against the darkest other sample (s13 at 88.88, **0.0586**), over 80 samples across s01–s11 and s13–s18. s12 at 87.9 is 0.0508. The cyan cone rim is visible to the right and top of the shadow in every sheet frame. Caveat: only about 4 samples per 8 s block were tried, and s11, s14, s16, s17 and s18 are still stubs.
- [x] 5. The strip shows the edge boil and the breath. Nothing else moves except the 6.0–6.5 dim; the dim is subtle in the strip because the shadow edge stays put and only the cone's brightness drops.

**Readability:** from the strip alone, a cold viewer sees a dark room with a small gator folded over the desk at the lower left, and a huge soft-edged blob silhouette with two glowing eye holes covering most of the wall, breathing slowly. The little black creature with two white eyes sits on the desk below it. "He has given up and the thing has taken the room" reads in the first frame, and the dim at 6.0 makes it grimmer. Weak points: the gator is a dark-green proxy shape in the corner, so "asleep" depends on pose and desaturation rather than his closed eye, and the blob's body is ink on near-black, so only its eyes show.

## Gaps
- **Spot z deviates from the spec's phone position (orchestrator ruling).** The spot keeps the spec's x and y (−0.010, 0.004) but sits at **z 0.1029**, not 0.114/0.116, so scale = z / (z − 0.0884) = 7.1. The phone cutout stays at s15's z 0.116, so the light is 13 mm behind the phone. s15's 4.2× came from its own closer camera and doesn't apply here.
- **The spec's spot intensity of "1.0" and fill of "0.30"** are relative. Spot is `intensity: 1.0` (then 0.6). The fill is a shadowless PointLight at (−0.028, 0.032, 0.108), distance 0.07, `FILL_I` 0.009 → 0.0054 with the dim, tuned to README §10: the face reads at **41–42%** of the key-lit wall (30–45%). At the spec's position and distance 0.06 it would barely reach his head.
- **Unlit lamp shade dimmed to 0.04** (colour multiplier). The phone spot over-exposes its tissue into the brightest object in the frame. It's a proxy tune.
- **Phone screen dims with the spot** (×0.6 at 6.5), which the spec doesn't ask for ("the only light change"). It's a one-line removal.
- **LUT:** `marston`, because `act2b` isn't in `post.js` (the same as s13/s15).
- **DOF focus** is 0.3516 (camera to the blob's z 0.0884), not the spec's 0.342, which was for the old blob z 0.098. Aperture 0.03 and maxblur 0.012 as spec'd.
- **Desaturation** is a colour multiplier on the gator's paper meshes (the same as s13), exact on proxies and approximate on painted art.
- **Backpack** is out of frame (x −0.145), so it isn't built. **The blob's `look`** isn't used (it only applies to `side` eyes); eyes are `open`.
- **The breath is on 2s** (`onTwos`), 12 steps a second. It is indistinguishable at a 5 s period, and the peak and trough frames land exactly.
- **Q1 (a)** is built: breathing on, per the director's "go with every recommendation".
- **Not verified:** the cuts from s11 and into s13 (neither the s11 stub nor s13's matching frame was compared); sound (not added, per the brief); `measure.mjs` takes about 3 minutes under load.
- The render logs three or four 404s for unrelated resources on `index.html`; they aren't from s12 (the first, mis-timed render on 0–10 s showed them too).

## State
built · 2026-10-15
