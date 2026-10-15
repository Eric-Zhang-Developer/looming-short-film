# Done · anim-s06

## What shipped
s06 is blocked for the animatic in `src/shots/s06.js`. It shows the home desk unit at night with proxy art: the cream `apt_wall`, the `apt_desk` top and apron flush to the wall, the floor, the chair, the calendar's lower-left corner, s15's five-part `desk_lamp`, the blank page with glyph lines, the pen and cap, and the phone face-up and glowing.

It imports `UNIT` from `s15.js`, so Camera A, the knob, the blob mark, the phone and both lights are s15's numbers, including the (dev) entries. The shot is keyed on 2s:
- K0–K7 with the press on 0.500 (`lampClickHome`), handing the key from the phone to the lamp
- the flinch at 1.083, the frozen stare, and the 3 mm hop at 2.0 that makes him lean away at 2.167
- the second press, K2–K7 shifted +2.5 s, with the off on 3.000 (`lampOffHome`). The phone shadow springs back at full size with the blob's squash and its one closed-eye drawing.
- the grip on the phone at 3.5 and thumb flicks every 0.5 s
- the blob's sag at 4.5 and its look up at him from 5.0

## Where it lives
- `src/shots/s06.js`
- `evidence/anim-s06/`:
  - `sheet.jpg`
  - stills `t36_75.jpg` (lamp on, blob small), `t37_50.jpg` (the 1.5 s still) and `t39_00.jpg` (`lampOffHome`, the spring-back)
  - `crop_wall_0.25.jpg` and `crop_knob_s06_vs_s15.jpg`
  - `measure.html`, `measure.mjs`, `measure.txt`, `clicks.mjs`, `clicks.txt`, `determinism.txt`
- Commits on `task/anim-s06`: `f5bc967` (shot), `06f48f1` (evidence), and this note.

## How it was checked
Brief:
- [x] **Key-moment sheet:** `node render.mjs --page=index.html --sheet=36,36.25,36.41667,36.5,36.58334,36.75,36.83334,37.0,37.08334,37.25,37.75,38.0,38.08334,38.16667,38.66667,38.91667,39.0,39.08334,39.33334,39.5,40.0,41.0,42.5,43.95 --cols=6 --w=400 --out=evidence/anim-s06/sheet.jpg`. I looked at it.
  - Times sit just past each drawing (36.08334, not 36.083). At 37.083 the render floors to the previous drawing and the flinch doesn't show. That is the onTwos float problem again.
- [x] **Two or more full-res stills,** each about 0.5 MB, written as PNG by `--stills` and converted with `sips` to JPEG q85.
- [~] **Shadow scale** (`measure.txt`): by geometry the wall shadow is **4.203×** at 0.25 and 5.0, and the pool 1.273×. From pixels, the wall shadow is 4.16× (0.25) and 4.10× (5.0), and the pool is 1.05–1.08× in front of the blob at 2.0. See Gaps for both.
- [x] **Determinism:** `node tools/determinism.mjs --page=index.html --t=37.5,39.04167,30,37.5` → `determinism: PASS`, at the lamp with dust, just after the off, in s05, then 37.5 again. `check_timeline` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] **Readability:** see below.

Spec acceptance:
- [~] **Pool at 2.0 is 1.27× ± 0.15, in front of the blob.**
  - Geometry gives 1.273×.
  - The pixels give 1.05–1.08×, lying in front (z +3 and +5 mm). They show 0.72× behind, which is where the blob itself occludes.
  - The pixel figure is a lower bound for the same reason as in s15: the pool's edge runs into the lamp's own falloff.
- [~] **Wall shadow 7.1× ± 0.7 at 0.25 and 5.0: FAIL by design.** It measures 4.16× and 4.10×, because these are s15's (dev) loom-fix numbers, which the dispatch said supersede the spec. See Gaps.
- [~] **Wall contrast ≤ 20% at 1.5:**
  - On anim-s15's metric (shadow depth after ÷ before) it is **11.4% display: PASS**.
  - On the local contrast (lit − shadow) ÷ lit it is **44.1% display / 64.1% linear: FAIL**. Reaching 20% on that metric means turning the phone off entirely, which kills the ghost.
- [x] **Lamp and phone multipliers** (`measure.txt`):

  | t (s) | Lamp | Phone |
  |---|---|---|
  | 0.46 | 0 | 1 |
  | 0.50 | 0 | 0.025 |
  | 0.54 | 1.104 | 0.025 |
  | 2.96 | 1.0 | 0.025 |
  | 3.00 | 0 | 1.000 |
  | 3.04 | 0 | 1.000 |

  The lamp keys and the phone's timing pass. The phone's out-shone level is **0.025**, not the spec's 0.2; see Gaps.
- [x] **Fingertip K0–K7 and 2.667–3.083 vs s15:** worst 0.06 mm (≤ 1 mm). Against the spec table, worst 0.54 mm. The knob crop shows s06 and s15 at 0.417 and 0.500 with the same knob and fingertip pixels, which is expected from an identical camera, rig and knob.
- [ ] **Both clicks are the same buffer: FAIL, not mine.** `clicks.txt`: `lampClickHome` has the `lampClick` cue, sha256 `d1bee20f…4513`. `lampOffHome` has **no** `lampClick` cue. `cues.js` says this is deliberate: "No click for lampOffHome (three only)", per doc 05. The spec and the cue sheet disagree.
- [x] **At 0.25 the blob's wall shadow is the largest; the lamp's is smaller:** `crop_wall_0.25.jpg`. The lamp throws a stem stripe and a knob dot, both far smaller than the blob's shadow.
- [x] **README §10 fill:** the face is 30% of the phone-lit wall at 0.25 and 31% of the lamp-lit page at 1.5. Lamp vs out-shone phone irradiance at the blob is 25.7× (≥ 4×).

**Readability:** from the sheet alone, a cold viewer sees:
- a gator at a desk under a cyan screen glow, with a huge blob-shaped shadow, eyes and all, filling the wall behind a small ink creature
- him reaching up and clicking the lamp: amber light falls, the wall shadow drops to a ghost, and the creature sits small in a bright pool
- him jerking back from it and staring
- him clicking it off: the giant shadow is back at once, and he hunches over his phone and doesn't look again

"Light shrinks it, and he chooses the dark" reads. Weak spots:
- The flinch's gasp face and `o` mouth are too small to read at sheet size. The body recoil carries the beat.
- The 3 mm hop barely shows.

## Gaps
- **The two known core bugs, guarded locally** (a contract task is fixing them; core files untouched):
  - `onTwos` lands on the previous drawing through float error. s06 uses `on2s = (t) => Math.floor(t * 12 + 1e-4) / 12` and passes `on2s(t) + 1e-6` to `blend`.
  - `lampLight`'s dust bounding sphere: after every `lamp.update(t)`, s06 calls `lamp.dust.geometry.computeBoundingSphere()`.
  - `blob.update` still uses core `onTwos` internally, so the blob's wobble can land on the previous drawing on some frames, as in s15.
- **4.2×, not 7.1×.** I used s15's (dev) loom-fix numbers:
  - blob z 0.0884, phone z 0.116
  - phone light at (−0.014, 0.006, 0.116)
  - Camera A look y 0.0385, lamp aim z 0.096
  - knob z 0.0855, press knob (−0.0223, 0.0211)

  The spec's escalation (s05 8.0×, s06 7.1×, s07 20×) now dips to 4.2× here. A director call: the shadow is still bigger *on screen* than s05's, but not by the spec's numbers.
- **Phone intensity changed for the cream wall** (s15's wall is navy):
  - `PHONE_I` 0.12 instead of s15's 1.0. At 0.35 the lit wall burned to white.
  - Out-shone ×**0.025** instead of s15's 0.05 or README §4's 0.2. At 0.05 the ghost kept 33% of its depth.
  - Fill raised to phone 0.032 and lamp 0.024 (s15: 0.003 and 0.02) to reach 30%.

  The "phone 0.2" acceptance numbers are therefore not met as written.
- **Contrast metric:** the two readings at 1.5 s are 11.4% and 44.1%, as above. The graded still `t37_50.jpg` shows a clearly visible ghost with its eyes. Someone should pick the metric. If it's local contrast, the phone has to go fully dark under the lamp.
- **Blob width for the pixel ratios** is anim-s15's measured 0.0268 m (same `makeExam` seed 1, r 0.012). Hiding the blob in s06 also removes its wall shadow behind it, so it can't be isolated in-shot.
- **His own shadow:** before the click and after the off, the gator's head and arm throw a large soft shadow on the wall's left side, at the cone's penumbra. s15 has the same. It's smaller than the blob's but noticeable.
- **Decisions where the spec was silent:**
  - Closed eyes at 0.500 are held for 2 drawings to 0.667, "as s15"; the spec also says "single frame".
  - The recoil spring is 3° on the body joint.
  - The head stares down at −4° from 1.25.
  - The second press keeps the leaned-away K1 (lean −9) before K2.
  - Gator eyes are `worried` through the second press until 3.5.
  - Blob eyes are `worried` 1.333–3.0.
  - Pen and cap lie on the page's front edge.
  - The calendar gets s02's seeded tilt.
  - LUT is `night`, then `amber` 0.5–3.0, then `night`.
- **Not built / unverified:**
  - the s05→s06 and s06→s07 cuts
  - frozen art (all proxies)
  - sound
  - DOF strength (aperture 0.02, mild, as s15)
- **Scratch accident:** my first stills went into a pre-existing `st/` folder in the shared scratchpad. My loop converted every `*.png` there to JPEG and deleted the PNGs, including another task's `z1–z4.png` and `zooms.png`. I converted them back to PNG, but they went through JPEG q85, so they're lossy now. Nothing in the repo was affected.

## State
built · 2026-10-15
