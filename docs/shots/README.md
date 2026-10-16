# Shot specs · film-wide conventions

`s01.md` … `s18.md` were written by three storyboard passes and reconciled into one film by `sb-reconcile`; `spec-g4` rewrote them to the director's G4 notes and added `s00`, `s17b` and `s17c`. The rules below apply to every shot.

**Shot order (the G4 cut, 3:15; `src/timeline.js`):** s00 notification · s01 skyline · s02 calendar and the birth · s03 laptop · s04 fridge · s05 game night · s06 lamp · s07 blinds · s08 game to sunrise · s09 Marston · s10 stacks · s11 laptop, then phone · s12 Quiet 1 · s13 everyone has one · s14 Custodian · s15 the name · s16 practice · s17 Quiet 2 · **s17b test day** · **s17c grade** · s18 crossed off, and the tag. A letter after a number means a shot added after the numbering froze: it plays after the number it carries (s00 before s01). Where a shot file and this page disagree, this page wins and the shot file is the bug. Open director calls are in [`QUESTIONS.md`](QUESTIONS.md); asset names are in [`docs/assets.md`](../assets.md). The numbers quoted here come from `evidence/sb-reconcile/geometry.mjs` (output in `geometry.txt`).

## 1. The Exam's size: the dread meter
Director, 2026-10-15 (process log): **the blob's own size is the readable meter of dread.** It grows one step each time he avoids the exam and shrinks one step per solved problem. The shadow stays on top as *how it feels*: it is still the big thing, and it still obeys the light rule. This supersedes Q5's answer (body constant through Act 2).

- **Units.** Size is the radius over the birth radius, **1× = r 0.012** (2.4 cm across, 30% of the 8 cm gator). `createBlob` keeps its contract default of 0.025, so every shot passes `radius` (`makeExam`). The field draws about **2.28 r wide and 2.0 r tall** (the lobes: 2.73 cm wide at 1×, the anim-s03 finding), with its eyes centred **1.08 r** above the contact point.
- **Shadow units.** What the audience reads is the shadow's size on the wall, so every shadow table in the shot files gives it in birth units: **units = S × r / 0.012**, where S is the shadow scale. For a point light, a blob plane parallel to a wall at z = 0 and the contact point at z_B, **S = z_L / (z_L − z_B)**, so **z_L = S · z_B / (S − 1)**. When a blob grows, the shot moves its light (or, at the desks, the blob mark) so the shadow keeps the units the spec had. A shadow that gets bigger on screen does so on purpose and says so in its shot file. Pixel positions come from a pinhole projection of each shot's camera (fov 20, 1920 × 1080).

| Shot | Start | End | Steps (local t → size) | r (m) |
|---|---|---|---|---|
| s02 | born | 1× | bead 0.17 on the circle at 5.0 (`inkDropForms`), gathers to 0.5 hanging from the calendar's lip by 6.0, full 1× after it lands (7.75–8.25) | → 0.012 |
| s03 | 1× | 1.25× | **gulp 1 @ 4.5** | 0.012 → 0.015 |
| s04 | 1.25× | 1.25× | — (G4: he never looks at it; its shadow grows by scooting toward the light) | 0.015 |
| s05 | 1.25× | 1.25× | — | 0.015 |
| s06 | 1.25× | 1.5× | **gulp 2 @ 4.0** (the lamp shows it at 1.25× first) | 0.015 → 0.018 |
| s07 | 1.5× | 2× | **gulp 3 @ 6.5** (blind 1) → 1.75×, **gulp 4 @ 8.5** (blind 2) → 2× | 0.018 → 0.021 → 0.024 |
| s08–s10 | 2× | 2× | — | 0.024 |
| s11 | 2× | **2.5×** | **gulp 5 @ 5.25**: the peak | 0.024 → 0.030 |
| s12–s14 | 2.5× | 2.5× | (s12's ±6% breath is a breath, not growth) | 0.030 |
| s15 | 2.5× | 2.5× | the wake shows its real size: a 1.31× pool under what was a 7.1-unit loom | 0.030 |
| s16 | 2.5× | 0.42× | solve #1 @ 7.0 → 2×, #2 @ 13.5 → 1.5×, #3 @ 16.0 → **1× (birth size)**, #4 @ 18.0 → 0.75×, #5 @ 19.5 → 0.58×, #6 @ 21.0 → 0.42× | 0.030 → 0.024 → 0.018 → 0.012 → 0.009 → 0.007 → 0.005 |
| s17 | 0.42× | 0.42× | asleep on the page | 0.005 |
| s17b | 0.42× | 0.33× | **the test @ 8.5** (`testSolved`) | 0.005 → 0.004 |
| s17c | 0.33× | 0.33× | — (a grade isn't a solved problem) | 0.004 |
| s18 | 0.33× | gone | **the cross-off @ 2.0** → the dot (0.125×); soaks into the calendar @ 5.5. The tag's new drop is s02's bead, r 0.002, a new exam | 0.004 → 0.0015 → 0 |

**As named values** (doc 11: shots keep tunables like `BLOB_R` as constants at the top of the file, so the final pass changes values without restaging). Each shot's `BLOB_R` holds its start size and one key per step, named after the step's beat:

```js
// src/characters/exam.js: the film-wide ladder (radius, m)
export const METER = { birth: 0.012, gulp1: 0.015, gulp2: 0.018, gulp3: 0.021, gulp4: 0.024, gulp5: 0.030 };
export const SHRINK = [0.030, 0.024, 0.018, 0.012, 0.009, 0.007, 0.005, 0.004, 0.0015];   // r after n solved: s16's six, the test (s17b), the cross-off dot (s18)
// top of each shot file
s02: const BLOB_R = { start: METER.birth };                        // bead and perch are mesh scales on it
s03: const BLOB_R = { start: METER.birth, gulp1: METER.gulp1 };
s04, s05: const BLOB_R = { start: METER.gulp1 };
s06: const BLOB_R = { start: METER.gulp1, gulp2: METER.gulp2 };
s07: const BLOB_R = { start: METER.gulp2, gulp3: METER.gulp3, gulp4: METER.gulp4 };
s08, s09, s10: const BLOB_R = { start: METER.gulp4 };
s11: const BLOB_R = { start: METER.gulp4, gulp5: METER.gulp5 };
s12, s13, s14, s15: const BLOB_R = { start: METER.gulp5 };
s16: const BLOB_R = { start: SHRINK[0], problemOneSolved: SHRINK[1], problemSolved2: SHRINK[2], problemSolved3: SHRINK[3],
                      problemSolved4: SHRINK[4], problemSolved5: SHRINK[5], problemSolved6: SHRINK[6] };
s17: const BLOB_R = { start: SHRINK[6] };
s17b: const BLOB_R = { start: SHRINK[6], testSolved: SHRINK[7] };
s17c: const BLOB_R = { start: SHRINK[7] };
s18: const BLOB_R = { start: SHRINK[7], examCrossedOff: SHRINK[8] };   // then soaks away at blobAbsorbed; the tag's drop is a new birth-bead
```
The blob is built at `start`; a step is a mesh scale of `BLOB_R[step] / BLOB_R.start` from its drawing on (as s16's `scaleAt` does now). Other people's blobs stay in `exam.js`'s existing `BLOB_R` map (Freshman, neighbor, Custodian, sleeper, and the s17b exam room's); rename that one (e.g. `OTHER_R`) so the per-shot name is free.

**Beat times and cuts moved once, at G4** (doc 11 allows it when the director's notes change the story; the v1/v3 comparison aligns by scene). The five `gulpN` beats are in `src/timeline.js` from `spec-g4`.

- **The peak is 2.5× (r 0.030)**: 6.8 cm wide and 6.0 cm tall, bigger than his head. Sitting on the desk, its eyes are 3.2 cm up, level with his (0.030), so by Marston it looks him in the eye. On the floor it would stand three-quarters of his height. The brief asked for about 3×, at the gator's head height; 2.5× is the size at which it meets him eye to eye at the desk. Q13 has the 3× option.
- **The shrink walks back down the sizes it grew through** (2× and 1.5× are gulp 4's and gulp 2's sizes), and it passes birth size at #3, so "back to where it started" is visible. The test and the cross-off take it the rest of the way, to a dot the calendar soaks back up.

**The gulp** (every growth step, and nothing else grows it):
- It follows an **avoidance beat**: he looks toward the exam (the blob, the calendar, the page), then away to something easier (the laptop game, the phone, a blind). The gulp lands after the look-away, **on a beat** (`gulp1`…`gulp5`, §9), with **its eyes on him**.
- Drawings on 2s: t₀ − 0.083, anticipation squash 0.3 and eyes `closed` (the swallow). **t₀: snaps to the next size in one drawing**, stretched (squash −0.2), eyes `open` on him. t₀ → t₀ + 0.25: settles with `spring(t, t₀)`. Wobble steps down 0.2 for the next second (it holds still, unsure what just happened).
- The contact point stays planted and the body grows up and out from it. At the desk marks (below) the contact point slides to the new mark on the snap drawing, so its left edge stays put.
- Its shadow swells with it on the same frame. A shadow is never resized on its own.
- **No slow morphing.** Size changes only on gulp and solve drawings and holds in between. The one exception is the end: the soak at `blobAbsorbed` (s18), one flattened drawing and then nothing.
- **Never evil.** A gulp is a nervous swallow, not feeding: no mouth, no teeth, no narrowed eyes, no lunge toward him. Bigger means heavier and more anxious (it sags a little lower on its squash), never menacing. No text, no thought bubbles, and no face on the exam: the calendar's glyph and the page stay plain glyphs.
- **It goes home at the end** (G4; the pocket is cut): 0.42× after s16, 0.33× after the test, a dot (r 0.0015) on the cross-off, then absorbed into the calendar circle it was born from (s18).

**Where it sits as it grows** (desk-unit coordinates, §2):
- **Home desk, s06:** contact point (x_m, 0, **0.0859**), with **x_m = 1.15 (r − 0.012)**, so its left edge stays on the page's right corner (x −0.014) at every size and never covers the page or the pen. 0.0034 at 1.25×, 0.0069 at 1.5× (G4 sizes). At this z the laptop screen at the rest depth throws S 4.06 (§4).
- **Marston desk, s11–s15 and s16 to #2:** contact point (x_m, 0, **0.074**): 0.0138 at 2×, 0.0207 at 2.5×. It sits just behind the page's back edge, so his hand, pen and name (z 0.086–0.106) draw in front of it. **The laptop moves forward to z 0.078** so it stands in front of the blob (§2). At this z the resting phone throws S 2.85, which is 7.1 units at 2.5×, the spec's number.
- **From s16 #3 (1×) on:** the old mark (0.000, 0, 0.098) on the page's right corner, where s17 starts and s17b–s17c sit (at the exam desk).
- s03–s05, s07–s10, s17b (T1) and s18 (at the calendar's foot) have their own blocking (each shot file).

**Other blobs keep their sizes** (Q14): the Freshman's 0.010 (s13; their s18 scene is cut); the Drinks gator / neighbor 0.013 (s13, s16, s17); the s13 crowd 0.009–0.014 per its desk table (doc 03: never clone); the Custodian's 0.004; the s17 foreground sleeper's 0.006. A crowd figure who reappears keeps its s13 radius. Seen through his eyes, other people's exams look small; only his own has been fed.

- Blob eye names are the gator's: `open`, `closed`, `tired`, `gasp`, `worried`, `side`.

## 2. The desk unit (s15 is the master)
Every desk the hero works at uses s15's coordinates: desk top y = 0, wall z = 0, floor y = −0.034, the gator in profile at the desk's left end facing +x.

| Item | Position (m) |
|---|---|
| Gator | hip (−0.075, −0.012); shoulder = hip + (0.013, 0.030) rotated by the lean; one-segment arm ℓ 0.032. Body plane z 0.074, `pocket` 0.077, near arm 0.086, far arm 0.070 |
| Eye (estimate) | ≈ (−0.056, 0.030, 0.074), back-projected from s15's Camera A pixel |
| Chair | `marston_chair` profile at z 0.071, seat top y −0.013, x −0.092…−0.060 |
| `desk_lamp` (home desk only) | cutout plane z 0.078. Base x −0.028…−0.012, y 0…0.004. Stem x −0.022…−0.018 to y 0.070. **Knob** (separate part, r 0.001) at (−0.0228, 0.0228). Arm (−0.020, 0.070)→(0.004, 0.068). Tissue shade, mouth center (0.004, 0.056), width 0.016 |
| `sensor_trough` (Marston only) | Centre (0.000, 0.128, 0.040), bottom y 0.125: over the blob mark, between it and the wall (§3) |
| Blob mark | At 1×: (0.000, r, 0.098), on the page's right corner. Grown: §1's marks (home contact z 0.0859, Marston 0.074, x = 1.15 (r − 0.012)) |
| Phone rest | (−0.010, 0.0015, 0.114), lying flat, 0.015 × 0.008 |
| Page | `exam_page` x −0.033…−0.008, z 0.080…0.110, y 0.0003; name line z 0.086, problem lines 0.093 / 0.100 / 0.107 |
| Pen + cap | on the page's front edge, x −0.028…−0.016, z 0.106 |

- **Home desk** (s00, s02, s03, s06, s18): the `home_kit` desk (was the procedural `apt_desk`) over x −0.033…0.300, z **0…0.120** (flush to the wall, unlike Marston's), front at z 0.120. `apt_wall` at z 0. `calendar` on the wall, plane z 0.006, center (0.150, 0.100), 0.10 × 0.12 (x 0.100…0.200, y 0.040…0.160); bottom 0.015 curls out to z 0.014; red circle center (0.170, 0.095), Ø 0.012. The `home_kit` desk chair (it was Marston's chair art standing in).
- **The home laptop** (s03, s06; G4): `home_kit` laptop in profile, screen toward him, base 0.0105 deep, lid 0.010, hinged at the base's back edge and opened 110°. Its **screen centre is the light** (§4). s03 puts it at z 0.090 (the old phone grip depth), s06 at z 0.114 (the old phone rest depth), so both shots keep their S.
- **Scale (G4, not solved here):** the desk unit's heights are real at the 1:22 set scale (desk 0.034 = 75 cm, seat 0.021 = 46 cm), but its plan is not: the home desk is 7.3 m × 2.6 m at that scale, and the page, phone and pen are about 2.2× real. That is the "massive table" the director saw. Shrinking the plan re-solves every desk shot (s02, s03, s06, s11–s18), so it's left to a scale task; `docs/assets.md` gives the kits' real sizes for when it happens.
- **Marston hero desk** (s11, s12, s14, s15, s16, s17): `marston_desk` x −0.033…0.150, z 0.030…0.120, apron at z 0.120, against the `marston_window_wall` (z 0; windows 0.10 wide at x −0.51, −0.31, −0.11, +0.09, +0.29, +0.49, sill y 0.066, top 0.300). Laptop: a profile cutout at **z 0.078** (moved from 0.060 so it stands in front of the grown blob, §1), base x −0.030…0.015, lid hinged at (0.015, 0.002). Backpack on the floor behind the chair at (−0.145, −0.034, 0.028).
- **Mirrored units:** the s16/s17 neighbor (x′ = 0.350 − x). (The s18 Freshman's unit is gone with their scene.)
- **The exam desk** (s17b T3, s17c): the hero unit with the `exam_room_kit` table in place of `marston_desk`, no laptop, no phone, a plain overhead light at the trough's position (§3 numbers, no sensor story).

## 3. The light over the desk
The rule (doc 02) needs light from above wherever he works. At home that's the desk lamp. **Marston has no desk lamps** (director, 2026-10-15; `docs/ref-ufl.md` §0): its light from above is a ceiling fluorescent on a motion sensor.

**Home: the `desk_lamp`** (s02, s03, s06, s18, where it's on)
- One model: architect lamp, **switch knob on the stem**, tissue shade. The base-front switch from the first s06 draft is gone.
- `lampLight({ angle: 0.35, penumbra: 0.5 })` at the shade mouth, aimed at (−0.008, 0, 0.102) in unit coordinates. 0.35 rad matches doc 04's "narrow (~35°)" and the lab finding in `NOW.md`; the contract default 0.6 lit the whole desk. The pool is about 4.5 cm across (radius ≈ 0.023 at the aim point) and holds the page, the blob and the phone.
- The lamp sits **behind** the blob (2 cm behind the 1× mark, 8 mm behind s06's contact z 0.0859), so its pool falls forward where the camera sees it (the smoke-paper finding). Pool scale = 0.056 / (0.056 − r): 1.27× at r 0.012, **1.47× at s06's 1.5× (r 0.018)**.
- Intensity keys on the click (1s): [click, 0], [+0.042, 1.15], [+0.125, 0.95], [+0.208, 1.0]. Cone and dust show from the click frame.
- Both s06 clicks use the identical `lampClick` buffer and s06's K0–K7 hand path. s15 shares its timing and K0–K3 (s15's table).

**Marston: one motion-sensor zone per desk** (s11, s12, s14–s17)
- **The fiction.** A ceiling fluorescent hangs over every desk unit, each on its own motion sensor, so one desk can be dark while the next is lit. A zone stays lit while someone in it moves (writing, standing, walking past) and times out when they go still. It sees bodies, not thumbs: scrolling a phone doesn't keep it awake. Nobody switches one by hand. Stillness lets the light die; movement brings it back.
- **The fixture, `sensor_trough`** (procedural; the look is `docs/ref-ufl.md` §1's louvred trough with its faint green-cream light): a cardstock trough 0.060 long (x) × 0.016 deep (z) × 0.006 tall, hung level on two thin rods from the high ceiling (the film's windows run to y 0.300, so the ceiling is above that). Five cross louvres. The tube is a vellum strip 0.056 × 0.004 inside it at y 0.127. Unit position: **centre (0.000, 0.128, 0.040), bottom y 0.125**, over the blob mark and between it and the wall. Mirrored units mirror it (the neighbor's at x 0.350).
  - The housing and rods have `castShadow` off. They hang about 40° off the phone's axis, inside its cone, and would print a stray band high on the wall.
  - The tube glows in the fluorescent tone (§6) while the zone is lit and is dull grey-cream vellum when it's dead, so a wide shot shows which zones are awake.
  - In frame in s11, s14, s16 (Camera D) and s17. Just above frame in s12 and s15 (Cameras A and B): there the zone reads on the desk, the page, the blob, his face and the wall.
- **The light, `sensorLight`:** a `SpotLight` at the tube centre (0.000, 0.127, 0.040), aimed at (0.000, 0, 0.098), the 1× mark's foot, at every blob size (the 2.5× blob at (0.021, 0.030, 0.074) is 12.6° off the axis and the page 8.3°, both inside the core), `angle: 0.8, penumbra: 0.5`, shadow-casting, frustum fitted to the desk. Fluorescent tone. The full-bright core (to about 23° off-axis) holds the blob, page, phone and pen. The seated gator (about 29°) is in the penumbra. The wall under the trough (≥ 55°) and the neighbor's desk (≥ 57°) are outside it. Irradiance at the blob is the same as the old lamp pool's, so s15's built exposure, fill and grade carry over. No cone mesh and no dust: a fluorescent makes a soft pool, not a beam.
- **Shadow scale:** pool = 0.127 / (0.127 − r): **1.31× at 2.5×** (r 0.030), 1.23× at 2×, 1.17× at 1.5×, **1.10× at 1×**, 1.08× at 0.75×, 1.06× at 0.58×, 1.04× at 0.42× (r 0.005), and 1.11× at 0.013 (the neighbor). That's a small pool like the lamp's 1.27×. The trough sits between the blob and the wall, so the pool falls about 6 mm toward the camera (5 mm at the built blob z 0.0884), where it can be seen.
- **Wake** (`sensorWake`), an intensity multiplier on 1s, stepped (no easing). t₀ is the wake frame, where the relay clacks:

  | t₀ + | 0 | 0.042 | 0.083 | 0.167 | 0.208 | 0.292 | 0.375 on |
  |---|---|---|---|---|---|---|---|
  | level | 0 | 0.9 | 0.1 | 1.0 | 0.2 | 1.15 | 1.0 |

  Three strikes; the third catches and settles. It's s11's death run backwards, shorter. Every wake (s14, s15, s16) uses these keys, so they look like one event.
- **Timeout** (`sensorTimeout`): s11's death as built, a seeded on/off chatter per 24 fps frame for 0.8 s under a ceiling falling 1 → 0.3, first frame a drop, dead after. Every timeout (s11, s14) uses s11's seed.
- **A timeout on screen is film time.** It lands where stillness means something (s11, s14), not after a real sensor's minutes. A zone whose occupant went still only recently stays lit (s17). Director question Q10.

## 4. The screen light (stylized, film-wide)
The low, close light is a screen: **his laptop at home** (s03, s05–s08; G4) and **his phone at Marston** (s10–s15; the neighbor's in s16). Everything below says "phone" for either; for the laptop, "at the phone" means at the screen's centre. A real screen faces its user, so a truly physical screen light would throw the gator's own giant shadow over the blob's. The film uses one stylized rig instead (director question Q6 asks whether to keep it):
- **Shadow light:** `phoneLight({ angle, penumbra: 0.4 })` placed at the phone and aimed every frame with `aim(spot, wallHit)` along phone → blob, **whatever way the screen faces**. Each shot picks `angle` so the blob is inside the cone and the holder is outside it, and states both angles.
- **Face fill:** an unshadowed `THREE.PointLight` in Phone Cyan at the phone, `distance` 0.06, `decay` 2, 15–30% of the spot. It lights his snout and throws nothing.
- **When a lamp or a desk zone comes on in the same shot,** the phone spot drops to 0.2 (the screen is out-shone, a stylized exposure change), so the wall shadow keeps ≤ 20% contrast and the pool reads as the only shadow. It's at 0.2 on every frame the overhead light is at ≥ 0.5 of full, and back at its earlier level on every frame it's below: the lamp's click and off frames, and a zone's stutter and timeout frames. So the loom flashes back on a wake's dark frames and the wake reads on the wall too. A downward light can't fill the wall, so this is the mechanism, not fill.
- **Daylight out-shines it too** (s07, G4): while sun bands are in the room the screen spot is 0.2, with one band 0.5, with none 1.0, so each blind steps the loom's contrast up. Same mechanism, a different overhead source.
- In the desk unit a screen at the rest depth throws **S 4.06** on the home blob (contact z 0.0859: 5.1 units at 1.25×, 6.1 at 1.5×, s06's G4 sizes) and **S 2.85** on the Marston blob (contact z 0.074: 7.1 units at 2.5×). Both need `angle: 0.9` (the blob's half-angle is 39.5° and 38.7°; his eye is 72.5° and 76.7° off-axis). On the old 1× mark it was 7.1× (0.114 / 0.016). At home the unlit lamp's shade, stem and knob sit 31–47° off-axis, so **the lamp throws its own 3.2× shadow** on the wall beside the blob's (s06 checks it). Marston has no lamp, and the trough doesn't cast (§3).

## 5. One key at a time (doc 03 rule 1)
Each shot names one key light at every moment. Any other source is either:
- **fill**, at most 30% of the key at the key's receiver (s03 morning window, s04 fridge interior, s05 TV at 25%), or
- **the rule-6 rival** in a two-temperature room, where the shadow direction shows which light is winning (s07 sun vs laptop, s08 dawn seams vs laptop, s14 aisle fluorescent vs the hero's phone, s17 dawn vs the desk zones).

Keys switch only on beats, cuts or a zone's wake and timeout: s03 window → laptop, s06 laptop → lamp → laptop, s07 sun → laptop (at `blind2`), s11 desk zone → phone, s14 phone → desk zone → phone at the hero's desk (the aisle fluorescent stays the Custodian's key), s15 phone → desk zone, s16 the neighbor's phone → their zone. s17b, s17c and s18 have no screen on at all: overhead light only.

## 6. Other light
- `fluorescent()` is one dim `DirectionalLight` (doc 04; `RectAreaLight` has no effect on Lambert paper in r186). It's the room and aisle light (s10's tubes, s14's aisle). Desk zones are `sensorLight` spots (§3). The fluorescent tone is `lerp(PALETTE.cream, PALETTE.gator, 0.15)` (≈ `#DEDBC3`) in every Marston shot, zones included, until PALETTE gets a `fluorescent` entry (a contract addition). Overhead fluorescents make small shadows, which agrees with the rule: in s10 the loom comes from the phone in his hand and the tubes are set light (doc 06 lists s10's key as fluorescent; read that as the room light).
- Mixed light colors stay inside doc 03's two: fridge `lerp(phone, cream, 0.4)`, TV `lerp(phone, cream, 0.6)`.

## 7. Materials
- **Blackout blinds are opaque Night Navy cardstock** (G4: roller blinds replace the curtains; doc 02 says blackout). Doc 03's tissue applies to window glass, panes, the lampshade and the hoodie. In s08, dawn enters only through the blinds' 1.5 mm side gaps.
- **Words are drawn, not inked.** The notification, the calendar lettering, the math and the grade are lines drawn on paper (pencil-grey or red pen), matte and part of the sheet. Only the Exam is ink-material (doc 03). **All of it is drawn in code over painted paper, never painted** (`docs/assets.md` §Code): where a shot file says "hand-lettered", this is how.

## 8. Camera and quiet shots
- Locked by default; slow push-ins and lateral parallax only. **No crane or pull-back:** s13 is one locked top-down shot that reads the head lift from above.
- Quiet shots (s12, s17) are fully locked with boil at 4/s. What else may move in them (s12's breathing blob, s17's sit-back and the blob's one blink; the pocket climb is cut) is director question Q1.
- Several shots hold more than one setup inside one shot ID: s02 (a push-in to the calendar insert at 1.5–3.5, a cut back at 7.083), s16 (cuts at 1.0, 7.0, 10.0, 11.0, 13.5: the page inserts P and P2), s17b (cuts at 2.0, 4.0, 5.5), s18 (cuts at 3.0, 7.0, 11.5). Each shot file lists its cuts.
- **Camera P** (s16, s17b, s17c): straight down on the desk unit's page, about 0.075 above it, the page filling ~70% of the frame height, so hand-lettering at 0.0012 cap height reads at ≥ 40 px. One camera for every page the audience must read, so the hand and paper match.
- **Camera A′** (s06, s15): Camera A pulled back 0.26 m along its own axis and shifted to frame the grown blob's loom: position (0.025, 0.239, 0.642), lookAt (0.025, 0.080, 0.080), the same 15.8° down, at a distance of 0.584. Camera A (0.324 away) saw only about 9 cm of wall above the desk, which a 7.1-unit shadow behind a 1.5–2.5× blob can't fit in. s15's push-in to **Camera B′** (B pulled back 0.07 so the 2.5× blob's top stays in frame) brings the closeness back. Q15.
- **Room maps:** s13's top-down grid is schematic (desks 0.11 × 0.065 at 0.16 spacing, the hero at the center desk). The side-view rows in s15–s17 use the full desk unit at 0.25 spacing with the hero's desk against the window wall. No shot shows both, and the top-down cut hides the difference. If the animatic shows it, restage s13 with the hero in the wall row.

## 9. Sound anchors
Cues hang on beat names only (doc 05). `src/timeline.js` names every anchor the specs use (58 beats, `spec-g4`). G4 renamed the beats whose moment changed: `phoneUp` → `laptopUp` (s03), `curtainsStart` → `blindsStart` and `curtainsDone` → `blind2` (s07, with `blind1` new), `scrollStart` → `sunriseGame` (s08); removed `nextSemester`, `sensorWakeFreshman` and `blobYawn` (old s18); and added `notifyBuzz` (s00), `calendarZoom` (s02), the five `gulpN` (s03 4.5, s06 4.0, s07 6.5 and 8.5, s11 5.25), `crossOut` (s16), `examRoom`, `testRecognise`, `testSmile`, `testSolved` (s17b), `gradeSlide`, `gradeReveal` (s17c), `examCrossedOff`, `blobAbsorbed`, `newDate`, `dropQuivers`, `tagPenUncap` (s18). `src/audio/cues.js` and `score.js` still name the removed beats until the sound pass renames them (doc 05 has the map). `lampClickMarston` in older shot text means `sensorWakeMarston`; `tableLightDies` (s11) is a timeout.

## 10. Character fill (added by the orchestrator after s04 and s09)
Faces have to read: the story is told by eyes and mouths, and doc 03's single key often lands behind the characters (s04's fridge, s09's doorway), turning them into black silhouettes. So every shot with a character **measures the face first**: if it reads below ~30% of the key-lit wall, add **one character fill** (s02, lit from the front by its window, needed none):
- a dim `PointLight` or `SpotLight` in front of the character, slightly above eye line, at **`castShadow = false`**
- intensity set so the face reads at about 30–45% of the key-lit wall's brightness, which keeps it clearly secondary
- colour from the shot's key: cool cyan-navy under the phone, warm cream under the lamp, the fluorescent tone under a desk zone
- light layers or a short `distance` so it doesn't light the wall: the loom shadow's contrast must not drop

It's a fill, not a second key, so doc 03 rule 1 (one key, one shadow) still holds. This is reversible; the director can veto it at G4.

## 11. Light helpers
- `aim()` now defaults the shadow near plane to `min(0.004, d/20)` (contract-light-key), so no manual `near` is needed.
- The blob keys its highlight off the light with the biggest contribution at the blob. A §10 character fill near the blob can win that, so pass `exam.update(t, { key: <your key light> })` whenever a fill sits close to the blob.
- The colour grade for s09 and s10 is `night` (the spec's `act2b` doesn't exist, and `marston` crushes the exterior), so the s09→s10 cut doesn't jump.
