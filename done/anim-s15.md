# Done · anim-s15

## What shipped
s15 is blocked for the animatic in `src/shots/s15.js`. It shows the Marston hero desk unit at night with proxy art: the window wall with six torn window holes and tissue panes, the floor, the desk top and apron, the chair, the closed laptop, the five-part `desk_lamp` with a separate knob, and the phone, page, pen and cap. The gator is `makeGator` at the hip, posed with `poses.js`. The blob is `makeExam`. Each spec beat is keyed on 2s for the characters and at 24 fps for light and camera:
- a 4.2× loom on the wall, fully in frame
- the K0–K7 press, with the phone handing the key to the lamp on 0.500: the loom collapses to a ghost and a pool
- the turn down to the blob, then the held look from 5.0 to 7.0
- the phone flipped face-down at 7.417 and the pen uncapped at 8.0
- the name squiggle written from 8.833 to 10.0, with the blob's flinch on `nameWritten`
- the exhale, the pen moving to problem line 1, and eyes `worried` at 13.5

The camera holds on A, pushes in to B from 5.0 to 10.0, and holds on B. DOF stays on the hand plane. The grade is `marston` before the click and `amber` from the click on.

## Where it lives
- `src/shots/s15.js`, which exports `UNIT` with the master numbers below
- `evidence/anim-s15/`: `sheet.jpg`, `strip_K0-K7.jpg`, `crop_knob_0.417_0.500.jpg`, `t100_40.jpg`, `t100_60.jpg`, `t110_00.jpg`, `measure.html`, `measure.mjs`, `measure.txt`, `ontwos.mjs`, `ontwos.txt`, `determinism.txt`
- Commits on `task/anim-s15`:
  - `d05d87a` shot
  - `fcda0c9` evidence
  - `bb32f65` first done note
  - `f22ac1d` loom fix, dust determinism fix and refreshed evidence
  - plus this note
- `wave/3-assets` was merged in first, for README §10 and §11.

## For s06: the numbers to copy (world meters, s15-local seconds)
s06 can `import { UNIT } from './s15.js'`, or copy these values. Entries marked **(dev)** differ from the spec; see Gaps.
- **Camera A** (fov 20): position (−0.010, 0.118, 0.392), **lookAt (−0.010, 0.0385, 0.080) (dev)**. It is locked from 0.0 to 5.0. DOF focus distance is the camera's view direction · ((−0.024, 0.020, 0.086) − camera position), with aperture 0.02 and maxblur 0.01. Camera B is unchanged: (−0.022, 0.090, 0.292) looking at (−0.022, 0.020, 0.084).
- **Gator:** `makeGator(ctx, { res: 1024 })`, group at (−0.075, −0.012, 0.074), unmirrored. The near arm is at z 0.086, and the `hand` fingertip group is at z 0.087.
- **Hand keys:** `hero.blend(P, pressKeys(0), on2s(t) + 1e-6)`, so K0–K7 are drawings 0–7 at n/12 s and the press (K6, `press`) is drawing 6 = 0.500. K7 is `touch`, the same pose as K5. Use `on2s = (t) => Math.floor(t * 12 + 1e-4) / 12`, not core `onTwos` (see Gaps). Head override: `pose({ head })` with keys [0, 0], [1/12, 0], [2/12, −3°], [3/12, 0].
- **Faces:** eyes `open`, `closed` from 0.500 to 0.667, then `open`. Mouth `line`.
- **Desk lamp,** cutout plane z 0.078:
  - base at centre (−0.020, 0.002)
  - stem at centre (−0.020, 0.035)
  - arm at centre (−0.008, 0.069), rotation atan2(−0.002, 0.024)
  - tissue shade turned +90°, scaled so the mouth is 0.016 wide, mouth centre (0.004, 0.056), z 0.0785, castShadow off
  - Each piece is placed by the centre of its visible shape (`cut()` in s15.js).
- **Knob** (r 0.001): (−0.0228, 0.0228) at **z 0.0855 (dev)**. On the press drawing only, it moves to **(−0.0223, 0.0211) (dev)**.
- **Blob (dev):** `makeExam({ shot, seed: 1 })`, mesh at **(0, 0, 0.0884)**, stain at (0, 0.0004, 0.0884). Before the press, wobble 1.4. Squash is `0.3·e^(−6s)·cos(18s)` from 0.500.
- **Phone (dev):** group at **(−0.010, 0.0015, 0.116)**, face up.
- **Page:** centre (−0.0205, 0.0003, 0.095), lying flat.
- **Pen:** tip at (−0.016, 0.0006, 0.106), lying flat.
- **Phone spot:** `phoneLight({ angle: 0.9, penumbra: 0.4, intensity: 1.0 })` at **(−0.014, 0.006, 0.116) (dev)**. Call `aim(spot, (0, 0.012, 0.0884))`, then set `shadow.camera.near = 0.004`. This gives **4.20×**, with the shadow centred at (0.045, 0.031) on the wall. It is ×1 before the click, **×0.05 from 0.500 (dev)**, and 0 when the screen goes face-down.
- **Lamp:** `lampLight({ angle: 0.35, penumbra: 0.5 })` at (0.004, 0.056, 0.078), **`aim` at (−0.008, 0, 0.096) (dev)**, then near 0.004. Visible from 0.500. Intensity is 0.16 × the linear keys [12/24, 0], [13/24, 1.15], [15/24, 0.95], [17/24, 1.0]. After every `lamp.update(t)`, call `lamp.dust.geometry.computeBoundingSphere()` (see Gaps). The bulb is a PointLight(lamp, 0.03 × the same keys, distance 0.02) at (0.004, 0.063, 0.075).
- **Character fill** (README §10): a shadowless PointLight at (−0.046, 0.040, 0.114), distance 0.07.
  - Under the phone: colour lerp(phone, navy, 0.35), intensity 0.003.
  - Under the lamp: colour lerp(cream, lamp, 0.3), intensity 0.02.
- **Other light:** `fluorescent({ intensity: 1.0 })` with `update` never called, so flicker amplitude is 0. `ambient()` × 0.45. Background is lerp(navy, ink, 0.5).

## How it was checked
Brief:
- [x] **Key-moment sheet:** `node render.mjs --page=index.html --sheet=100,100.167,100.25,100.333,100.4,100.5,100.6,101.333,102.833,103.75,106,107,107.333,107.417,107.75,108,108.333,109,109.4,110,111,112.167,113,113.95 --cols=6 --w=400 --out=evidence/anim-s15/sheet.jpg`. I looked at it. Before the click, the whole blob-shaped loom and both its eye holes sit on the wall above the lamp. From 100.5 it is a faint ghost and the amber pool sits under the blob.
- [x] **Full-res stills:** `t100_40.jpg` (the loom, hand on the knob), `t100_60.jpg` (after the click) and `t110_00.jpg` (`nameWritten`). Each is about 0.5 MB.
- [x] **Shadow scale,** from `measure.txt`:
  - By geometry: the wall is **4.203×** (the spec's 7.1× was replaced under the orchestrator's ≥ 4× fix), and the pool 1.273×.
  - From pixels, with each frame rendered with and without the blob: the wall shadow is 4.10× the blob's own pixel width (0.0268 m). It is fully inside the frame on the left, right and top, with 3 mm to spare at the top. The bottom is hidden behind the desk. The pool shadow measures 1.01–1.07× (≤ 1.3×). Its right edge meets the pool's own falloff, so 1.01–1.07× is a lower bound.
- [x] **Determinism:** `node tools/determinism.mjs --page=index.html --t=100.5,109.4,90,100.5` gives `determinism: PASS`, after the dust fix below; it failed at 109.4 before it. 102, 107 and 112 also pass. `check_timeline` gives `ok (18 shots, 41 beats, 180.0s)`.
- [x] **Readability:** see below.

Spec acceptance:
- [~] **1. Before and after the click.**
  - Before the click the wall shadow is 4.1–4.2×, below the spec's ≥ 6×. This is the orchestrator's accepted floor; see Gaps.
  - After the click the shadow depth falls to **18.4% display / 5.1% linear (≤ 20%)**, and a pool of ≤ 1.3× sits in front of the blob.
- [x] **2. Fingertip on the knob.** With the tilted Camera A, the screen gap is 1.3 px at 0.417 and 0.9 px at 0.500 (≤ 4 px). See `crop_knob_0.417_0.500.jpg`. The overlay against s06 is **not verified**: s06 isn't built.
- [~] **3. Drawings on 2s.** Every drawing is held 2 frames, in the order K0–K7, 8 drawings. They make **6 distinct poses, not 7**: the spec's table has K7 = K5 as well as K0 = K1.
- [~] **4. The held look.** No joint or fingertip changes over the 48 frames from 5.0 to 7.0. The spec's own push-in (5.0–10.0) moves the camera during the look.
- [x] **5. No legible text, and the cues.** The page glyphs, phone screen and name are scribbles and bars only. `cues.js` lacks `nameWritten` and `phoneFaceDown`; that file isn't mine.

**Readability:** from the sheet alone, a cold viewer sees a gator in a cyan-lit room with a huge blob-shaped shadow, eyes and all, looming on the wall over a small ink creature. He reaches out and clicks the lamp. The wall shadow fades to a ghost, amber light falls, and the creature sits small in a bright pool. Then the look, the phone turned over, the pen and the name. "His click shrinks the monster to its real size" now reads from the frames.

## Gaps
- **Loom fix (deviation from the spec and README §2/§4; s06 copies all of it).** At 7.1× the wall shadow is about 0.17 m tall, but Camera A sees only about 0.09 m of wall between the desk edge and the frame top. The pre-click frames showed only two eye holes, which read as moons. Changes:
  - Scale 4.2×: blob z 0.098 → **0.0884**, phone (and its light) z 0.114 → **0.116**, phone light at **(−0.014, 0.006)** (x moved 4 mm left of the phone's centre so the shadow clears the lamp shade; y raised 2 mm so the shadow sits lower).
  - **Camera A tilted up 1.45°** (lookAt y 0.030 → 0.0385). This moves the desk content about 78 px down. The phone and page stay in frame, and the knob crop still passes.
  - **Lamp aim** z 0.102 → **0.096**, because the blob now stands nearer the lamp. Without it, the cone's far wall drew over the blob.
  - The blob now sits on the page's far-right corner area and only about 2 mm behind the near-arm plane. The flip and grip hands clear it by about 3 mm.
  - **Outshone phone ×0.05**, not README §4's 0.2. At 0.2 the ghost kept 43% display contrast and the collapse didn't read.
  - s11–s14 and s16–s18 still use the spec's desk-unit numbers. They should adopt the new blob, phone and light positions, or the blob jumps 1 cm at the s14/s15 and s15/s16 cuts.
- **The `onTwos` bug (core `src/core/ease.js`, `onTwos = Math.floor(t * 12) / 12`).** Shots receive `tLocal = t − start`, and that subtraction leaves values a hair under an exact drawing time. Floor then returns the previous drawing.
  - Example: s15 frame 2402, global t = 100.08333333333333. tLocal = 0.0833333333333286. `onTwos` gives drawing **0**; the expected drawing is **1**.
  - Same at frames 2408 (t 100.333 → 3, expected 4) and 2414 (t 100.583 → 6, expected 7: K6 shows instead of K7).
  - Film-wide, **681 of 4320 frames** land on the previous drawing (56 in s15). Those drawings show for 1 frame and the previous one for 3. The full list is in `evidence/anim-s15/ontwos.txt` (`node evidence/anim-s15/ontwos.mjs`).
  - Fix: snap with an epsilon, `Math.floor(t * fps + 1e-4) / fps`, or compute from the frame index.
  - `Puppet.blend` and `blob.update` call `onTwos` internally. s15 passes `on2s(t) + 1e-6` to `blend`. The blob's wobble still uses the core helper, so its wobble lands on the previous drawing on those frames.
- **Dust determinism (a `lights.js` bug, guarded here).** three sorts transparent objects by `geometry.boundingSphere`. It computes that sphere on first draw and never again. `lampLight`'s dust moves its points in place, so its sort depth, and with it the additive blend order against the cone, depended on which t first drew it. Result: up to 2/255 on 78 px at t 109.4 when s15 was built there. s15 calls `computeBoundingSphere()` after each `lamp.update`. It belongs in `lampLight`'s `update`, so other lamp shots (s06, s16–s18) get it too.
- **Knob z is 0.0855, not 0.078.** At 0.078 the fingertip, which is 8 mm nearer the camera, lands about 21 px under the knob from Camera A. Side effect: the knob reads as a stub beside the stem's edge rather than on it.
- **Press knob position:** the spec's K6 tip (−0.0233, 0.0215) is 1.3 mm below the knob it presses. On the press drawing the knob moves to (−0.0223, 0.0211), which reads as a toggle being pushed down.
- **Pen grip:** the spec's tip offset (0.004, −0.004) puts the pen tip under the desk in every write pose. The tip sits on the fingertip (+0.3 mm) at 45° instead. When level for the uncap, the pen is centred on the fingertip.
- Smaller deviations from the spec:
  - The 7.833 "hands 1 mm closer" squeeze is skipped.
  - The cap jumps to the far hand at 8.0 and is lerped to the desk by 8.333.
  - The 7.333 on-edge pose is my own solve: lean 30, arm −4.5.
  - The blob's startle and flinch use spring's damping in cosine phase, so they peak on the beat frame.
  - "Looks up at him" (3.5–7.0) is blob eyes `side`, look −1.
  - The ghost wall shadow stays faintly visible from 0.5 until the phone goes face-down at 7.417.
- **README §10 fill:** the face is at 41% of the phone-lit wall before the click and 39% of the lamp-lit page after (target 30–45%). One fill covers both §4's phone face fill and §10.
- **DOF** at aperture 0.02 is mild (about 2 px of blur on the wall). The lamp spec's 30 dust specks come out as `lampLight`'s own seeded count of 20–40. The shade's +90° turn is for the proxy taper.
- **Not built / unverified:** the backpack (out of frame); the cuts from s14 and to s16; frozen art; sound.

## State
built · 2026-10-15
