# Done · mod-lights

## What shipped
`src/lights.js` implements the contract: `phoneLight`, `lampLight` (a SpotLight plus an additive vellum cone and 20–40 seeded dust specks that drift on `t`), `dawnLight` (cold to gold on `k`), `fluorescent` (a seeded stutter flicker) and `ambient`. It also has the rule math: `shadowScale`, `placeForScale` (a closed form, not a search) and `aim` (fits the shadow frustum to the target). `lab/lights.html` has a wall, a desk and a flat cutout, and runs phone (t < 2) → lamp (2–4) → fluorescent (4–6) → dawn (6–9).

## Where it lives
- `src/lights.js`, `lab/lights.html`, `lab/lights.js`
- `evidence/mod-lights/`: `phone.jpg`, `lamp.jpg`, `fluor_strip.jpg`, `dawn_strip.jpg`, `scale.txt`, `crop.jpg`, `determinism.txt`, plus `fluor.txt`, `console.txt` and `render.mjs` (the driver: `node evidence/mod-lights/render.mjs`)
- Commits on `task/mod-lights`: `3201008` (code), `9b407a3` (evidence), plus the commit for this note.

## How it was checked
- [x] **Round trip within 2% at 3 positions.** See `scale.txt`. Three subjects at z = 0.15, 0.08 and 0.40 with different height/side offsets each gave `shadowScale` **3.000000**, error **0.0000%**. This round trip is algebraic, since both functions use the same geometry. The pixel check below is the independent one.
- [x] **Phone shadow about 3×.** See `phone.jpg` and `scale.txt`. The light was placed by `placeForScale(scale=3)`. I measured the way smoke-paper did: a camera-invisible caster, a diff against no cast, and every pixel back-projected to its plane. The measured width ratio is **3.036×** (1.2% off). The measured shadow runs x −4.83..12.84 cm with its top at 17.46 cm. The prediction from 3·P − 2·L is −4.73..12.73 cm with the top at 17.30 cm, so every edge is within about 1–2 mm. The foot of the shadow runs onto the desk, so I checked height by the top edge, not by a ratio.
- [x] **Lamp: visible cone, dust, small pool.** See `lamp.jpg`. The amber cone fades out toward the target, dust specks show inside it, and the pool on the desk is bounded and hard-edged. The cutout's own shadow is a small dark pool at its base.
- [x] **Dawn ramp, 4 frames from cold to gold.** See `dawn_strip.jpg` (t = 6, 7, 8, 9). It goes from navy-lavender with a long, low shadow reaching the wall to warm gold with a shorter desk shadow.
- [x] **No acne and no detached shadows.** See `crop.jpg` (full-res 400 px crops at the base: phone, lamp, fluorescent, dawn). The lamp, fluorescent and dawn shadows meet the base, and I found no acne on the lit wall or desk. I also checked a 4× zoom of the dawn and fluorescent shadows (scratch only, not committed). The phone's wall shadow sits apart from the cutout because the cutout stands 15 cm off the wall, which is correct.
- [x] **Determinism.** See `determinism.txt`. Four times (0.5, 3, 5.2, 7.5) were rendered in order, then in reverse on the same page, then on a fresh page. All sha256 values are **IDENTICAL**, so it PASSES. I didn't use `tools/determinism.mjs` because it isn't on this branch.
- [x] **Flicker mostly steady with rare dips.** See `fluor.txt`. Over 0–180 s at 24 fps, 192 of 4320 frames (4.4%) fall below 0.9. `fluor_strip.jpg` shows 12 consecutive frames across one stutter (4.58–4.88 s).

## Gaps
- **Fluorescent uses no RectAreaLight.** Doc 04 pairs a RectAreaLight with a DirectionalLight, but in r186 `RE_Direct_RectArea` is defined only for Physical materials, so it would do nothing on Lambert paper. `fluorescent().light` is one DirectionalLight that carries both the color and the shadow. Doc 04 should be updated.
- **customDepthMaterial looks redundant in r186.** The lab cutout has none, yet both eye holes show in every shadow. This confirms smoke-paper's unverified claim for spot and directional lights. I didn't test point lights.
- **PCF softness has a ceiling.** At `shadow.radius` 10, r186's Vogel-disk PCF stipples visibly in the penumbra (seen in a zoom). Dawn and fluorescent use 5, the phone 3 and the lamp 2. A softer dawn shadow would need VSM or post blur.
- **Choices where the spec was silent:**
  - `height` and `side` in `placeForScale` are offsets from the subject, not absolute y and x.
  - `aim` takes a Vector3 or an Object3D. Its far plane is about 10× the target distance, so a receiver farther than that loses its shadow.
  - `lampLight` returns `cone` and `dust` as world-space siblings, and the caller adds both. It also takes an optional `seed`.
  - `fluorescent` takes an optional `intensity`.
  - `flicker(seed, t)` is exported as an extra for the evidence script.
  - Default intensities were tuned by eye under NoToneMapping.
- **`dawnLight.update(t, k)` ignores `t`.** The ramp comes only from `k`.
- **The lab deviates from contract defaults.** It uses lamp `angle: 0.35, penumbra: 0.4`, because the contract default of 0.6 rad (a 69° full cone) throws a pool too big to read as small. Doc 04 says ~35°. It also uses `flickerSeed: 5`, picked by a search so that a stutter falls inside 4–6 s.
- **Color reads are mine.** The fluorescent reads more warm-grey than green-white once the kraft-bounce ambient is added. The ambient is navy over kraft at 0.8, so unlit vertical stock reads dark warm brown, not navy. The phone-lit cutout runs bright because it gets 9× the wall's irradiance at a 3× scale, the same point as smoke-paper. The lab cutout is plain gator green, not ink.
- **Console.** There's one 404 in `console.txt`, probably the favicon, the same as smoke-paper.
- `tools/check_timeline.mjs` wasn't run because this task doesn't touch the timeline.

## State
built · 2026-10-15
