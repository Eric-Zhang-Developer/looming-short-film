# Shot specs · film-wide conventions

`s01.md` … `s18.md` were written by three storyboard passes and reconciled into one film by `sb-reconcile`. The rules below apply to every shot. Where a shot file and this page disagree, this page wins and the shot file is the bug. Open director calls are in [`QUESTIONS.md`](QUESTIONS.md); asset names are in [`docs/assets.md`](../assets.md). The numbers quoted here come from `evidence/sb-reconcile/geometry.mjs` (output in `geometry.txt`).

## 1. The Exam's size
- **The hero's blob is `createBlob({ radius: 0.012 })`** (2.4 cm across, 30% of the 8 cm gator) from s02 to s15. `createBlob` keeps its contract default of 0.025, so **every shot passes `radius`**.
- It shrinks only where doc 02 says it does, in s16, one step per solved problem: #1 0.0105, #2 0.009, #3 0.008, #4 0.007, #5 0.006, #6 **0.005** ("hamster-sized"). It is 0.005 in s17 and s18 (the pocket geometry is built for it).
- Other blobs: the Freshman's 0.012 (s18); the Drinks gator / neighbor 0.013 (s13, s16, s17); the s13 crowd 0.009–0.014 per its desk table (doc 03: never clone); the Custodian's 0.004; the s17 foreground sleeper's 0.006. A crowd figure who reappears keeps its s13 radius.
- Whether the hero's blob body also grows through Act 2 is director question Q5. Until it's answered, growth is the shadow's job alone.
- Blob eye names are the gator's: `open`, `closed`, `tired`, `gasp`, `worried`, `side`.

## 2. The desk unit (s15 is the master)
Every desk the hero works at uses s15's coordinates: desk top y = 0, wall z = 0, floor y = −0.034, the gator in profile at the desk's left end facing +x.

| Item | Position (m) |
|---|---|
| Gator | hip (−0.075, −0.012); shoulder = hip + (0.013, 0.030) rotated by the lean; one-segment arm ℓ 0.032. Body plane z 0.074, `pocket` 0.077, near arm 0.086, far arm 0.070 |
| Eye (estimate) | ≈ (−0.056, 0.030, 0.074), back-projected from s15's Camera A pixel |
| Chair | `marston_chair` profile at z 0.071, seat top y −0.013, x −0.092…−0.060 |
| `desk_lamp` | cutout plane z 0.078. Base x −0.028…−0.012, y 0…0.004. Stem x −0.022…−0.018 to y 0.070. **Knob** (separate part, r 0.001) at (−0.0228, 0.0228). Arm (−0.020, 0.070)→(0.004, 0.068). Tissue shade, mouth center (0.004, 0.056), width 0.016 |
| Blob mark | (0.000, r, 0.098), on the page's right corner |
| Phone rest | (−0.010, 0.0015, 0.114), lying flat, 0.015 × 0.008 |
| Page | `exam_page` x −0.033…−0.008, z 0.080…0.110, y 0.0003; name line z 0.086, problem lines 0.093 / 0.100 / 0.107 |
| Pen + cap | on the page's front edge, x −0.028…−0.016, z 0.106 |

- **Home desk** (s02, s03, s06; the calendar in s18): `apt_desk` x −0.033…0.300, z **0…0.120** (flush to the wall, unlike Marston's), apron at z 0.120. `apt_wall` at z 0. `calendar` on the wall, plane z 0.006, center (0.150, 0.100), 0.10 × 0.12 (x 0.100…0.200, y 0.040…0.160); bottom 0.015 curls out to z 0.014; red circle center (0.170, 0.095), Ø 0.012. The same chair art as Marston.
- **Marston hero desk** (s11, s12, s14, s15, s16, s17): `marston_desk` x −0.033…0.150, z 0.030…0.120, apron at z 0.120, against the `marston_window_wall` (z 0; windows 0.10 wide at x −0.51, −0.31, −0.11, +0.09, +0.29, +0.49, sill y 0.066, top 0.300). Laptop: a profile cutout at z 0.060, base x −0.030…0.015, lid hinged at (0.015, 0.002). Backpack on the floor behind the chair at (−0.145, −0.034, 0.028).
- **Mirrored units:** the s16/s17 neighbor (x′ = 0.350 − x) and the s18 Freshman (x′ = 0.110 − x, then world + (−0.50, 0, 0)).

## 3. The lamp
- One `desk_lamp` model everywhere: architect lamp, **switch knob on the stem** (s15), tissue shade. The base-front switch from the first s06 draft is gone.
- `lampLight({ angle: 0.35, penumbra: 0.5 })` at the shade mouth, aimed at (−0.008, 0, 0.102) in unit coordinates. 0.35 rad matches doc 04's "narrow (~35°)" and the lab finding in `NOW.md`; the contract default 0.6 lit the whole desk. The pool is about 4.5 cm across (radius ≈ 0.023 at the aim point) and holds the page, the blob and the phone.
- The lamp sits 2 cm **behind** the blob, so its pool falls forward where the camera sees it (the smoke-paper finding). Pool scale = 0.056 / (0.056 − r): 1.27× at r 0.012, 1.30× at 0.013, 1.10× at 0.005.
- Intensity keys on the click (1s): [click, 0], [+0.042, 1.15], [+0.125, 0.95], [+0.208, 1.0]. Cone and dust show from the click frame.
- Every click uses the identical `lampClick` buffer and the identical K0–K7 hand path (s15 table; mirrored in s18).

## 4. The phone light (stylized, film-wide)
A real screen faces its user, so a truly physical phone light would throw the gator's own giant shadow over the blob's. The film uses one stylized rig instead (director question Q6 asks whether to keep it):
- **Shadow light:** `phoneLight({ angle, penumbra: 0.4 })` placed at the phone and aimed every frame with `aim(spot, wallHit)` along phone → blob, **whatever way the screen faces**. Each shot picks `angle` so the blob is inside the cone and the holder is outside it, and states both angles.
- **Face fill:** an unshadowed `THREE.PointLight` in Phone Cyan at the phone, `distance` 0.06, `decay` 2, 15–30% of the spot. It lights his snout and throws nothing.
- **When a lamp comes on in the same shot,** the phone spot drops to 0.2 on the click frame (the screen is out-shone, a stylized exposure change), so the wall shadow keeps ≤ 20% contrast and the pool reads as the only shadow. It returns to 1.0 on the frame a lamp goes off. A downward lamp cone can't fill the wall, so this is the mechanism, not lamp fill.
- In the desk unit the phone at rest throws **7.1×** (0.114 / 0.016) and needs `angle: 0.9` (the blob's half-angle is 35.8°; the eye is 73° off-axis). The unlit lamp's shade, stem and knob sit 31–47° off-axis, so **the lamp throws its own 3.2× shadow** on the wall beside the blob's. It's real and stays smaller than the blob's; shots check it.

## 5. One key at a time (doc 03 rule 1)
Each shot names one key light at every moment. Any other source is either:
- **fill**, at most 30% of the key at the key's receiver (s03 morning window, s04 fridge interior, s05 TV at 25%), or
- **the rule-6 rival** in a two-temperature room, where the shadow direction shows which light is winning (s08 dawn seams vs phone, s14 aisle fluorescent vs the hero's phone, s17 dawn vs lamps).

Keys switch only on beats or cuts: s06 phone → lamp → phone, s07 moon → black → phone, s11 fluorescent → phone, s15 phone → lamp, s18 phone → lamp.

## 6. Other light
- `fluorescent()` is one dim `DirectionalLight` (doc 04; `RectAreaLight` has no effect on Lambert paper in r186). Its tone is `lerp(PALETTE.cream, PALETTE.gator, 0.15)` in every Marston shot until PALETTE gets a `fluorescent` entry (a contract addition). Overhead fluorescents make small shadows, which agrees with the rule: in s10 the loom comes from the phone in his hand and the tubes are set light (doc 06 lists s10's key as fluorescent; read that as the room light).
- Mixed light colors stay inside doc 03's two: fridge `lerp(phone, cream, 0.4)`, TV `lerp(phone, cream, 0.6)`.

## 7. Materials
- **Blackout curtains are opaque Night Navy cardstock** (doc 02 says blackout). Doc 03's tissue applies to window glass, panes, the lampshade and the hoodie. In s08, dawn enters only through the curtain seams.

## 8. Camera and quiet shots
- Locked by default; slow push-ins and lateral parallax only. **No crane or pull-back:** s13 is one locked top-down shot that reads the head lift from above.
- Quiet shots (s12, s17) are fully locked with boil at 4/s. What else may move in them (s12's breathing blob, s17's sit-back and pocket climb) is director question Q1.
- s16 (cut at 6.0) and s18 (cuts at 2.0 and 11.0) hold several setups inside one shot ID. The timeline is unchanged.
- **Room maps:** s13's top-down grid is schematic (desks 0.11 × 0.065 at 0.16 spacing, the hero at the center desk). The side-view rows in s15–s17 use the full desk unit at 0.25 spacing with the hero's desk against the window wall. No shot shows both, and the top-down cut hides the difference. If the animatic shows it, restage s13 with the hero in the wall row.

## 9. Sound anchors
Cues hang on beat names only (doc 05). `src/timeline.js` now names every anchor the specs use (41 beats). Foley a spec still places as "beat + offset" (drill whirrs, footsteps, hop taps) waits for an `offset` field on `CUES`, a contract-audio addition.

## 10. Character fill (added by the orchestrator after s04 and s09)
Faces have to read: the story is told by eyes and mouths, and doc 03's single key often lands behind the characters (s04's fridge, s09's doorway), turning them into black silhouettes. So every shot with a character adds **one character fill**:
- a dim `PointLight` or `SpotLight` in front of the character, slightly above eye line, at **`castShadow = false`**
- intensity set so the face reads at about 30–45% of the key-lit wall's brightness, which keeps it clearly secondary
- colour from the shot's key: cool cyan-navy under the phone, warm cream under the lamp
- light layers or a short `distance` so it doesn't light the wall: the loom shadow's contrast must not drop

It's a fill, not a second key, so doc 03 rule 1 (one key, one shadow) still holds. This is reversible; the director can veto it at G4.

## 11. Light helpers
- `aim()`'s default shadow near plane can sit behind close casters. Until `contract-light-key` merges, set `spot.shadow.camera.near = 0.004` after every `aim()` where a caster is within 10 cm of the light.
- The colour grade for s09 and s10 is `night` (the spec's `act2b` doesn't exist, and `marston` crushes the exterior), so the s09→s10 cut doesn't jump.
