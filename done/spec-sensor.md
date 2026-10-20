# Done · spec-sensor

## What shipped
The spec now has no desk lamp at Marston. Each Marston desk unit has a ceiling fluorescent trough on its own motion-sensor zone. Stillness lets the zone time out (s11, s14). Movement wakes it (s15 the pen, s16 standing, s18 walking past) with one shared three-strike stutter and one `sensorWake` sound. The home lamp, its click and its amber stay for s06 (and E in s18). Every beat time is unchanged.

**The fixture** (README §3): `sensor_trough`, a louvred cardstock trough 0.060 × 0.016 × 0.006 hung on rods, centred at **(0.000, 0.128, 0.040)** in desk-unit coordinates (bottom y 0.125), between the blob mark and the wall. Its light is `sensorLight`: a `SpotLight` at the tube (0.000, 0.127, 0.040), `angle: 0.8, penumbra: 0.5`, aimed at the blob mark's foot, in the fluorescent tone ≈ `#DEDBC3`. **Pool scale 0.127 / (0.127 − r) = 1.10× at r 0.012** (1.04× at 0.005, 1.11× at 0.013). The pool falls about 6 mm toward camera. A trough recessed above the 0.300 windows would give 1.04×, hidden under the blob from Camera A, which is why it hangs.

## Where it lives
- Branch `task/spec-sensor`:
  - `6fd13e5`: film-wide rules in `docs/shots/README.md` §2–§6, §9 and §10, plus docs 02, 03 (lighting and color script) and 05, and `docs/assets.md`
  - `2c97b0a`: `docs/shots/s10.md`–`s18.md` and `QUESTIONS.md`
  - plus this note
- No `src/`, `tools/` or other docs were touched.

## Shot by shot

| Shot | What changed in the spec | Code state → rework |
|---|---|---|
| s09 | Nothing. No lamp; the lit windows are already fluorescent. | Built → none |
| s10 | One line: the aisle tubes are sensor zones lit because he's walking. The falter is the blob, not a timeout. | Built → none |
| s11 | `desk_lamp` removed. The trough is in frame at the top. `tableLightDies` (4.2) is now his zone timing out because he went still over the phone. The 0–3.6 key is his zone. | **Merged → rework:** delete the unlit lamp and its shade-translucency tune. Add the trough, with its tube emissive following the existing 4.2–5.0 chatter. Swapping the tilted `DirectionalLight` for `sensorLight` is optional (the built 0.94× pool passes). |
| s12 | Lamp removed. The zone is dead and its trough is just above frame. | **Merged → small rework:** delete the unlit lamp and its 0.04 shade dim. Otherwise phone-only already. |
| s13 | The top-view lamp is removed. Every zone is dead (everyone is still). Troughs aren't drawn in the top view. | Built → remove the hero desk's top-view lamp prop |
| s14 | **The Custodian's cart wakes the hero's zone at 1.0.** The hero stays still and it times out over 4.2–5.0 (s11's chatter, the same local times). Both blobs are small at `tinyBlobSeen`. The wake is silent (the mop covers it). The timeout crackles at `custodianPass` + 3.7 / 4.0 / 4.25. The trough is in frame. The hero's blob has a 0.2 startle at 1.0. | **Paused → rework:** add `sensorLight` and the trough, make the phone follow the zone (0.6 ↔ 0.2), remove the lamp. The aisle light is unchanged. |
| s15 | **The reach is for the pen.** K0–K3 and the 0.500 press are kept. K4 (19, −15) to (−0.022, 0.004). K5 (21, −19) grips the pen at (−0.022, 0.001). **K6 (24, −16) at 0.500: the capped pen tips to 45° and touches the name line.** K7 = K6. The pen is put back at 1.167; everything after is unchanged. The wake runs from 0.500: dark, then strikes at 0.542, 0.667 and 0.792, settled at 0.875. The loom flashes back on the dark frames. `sensorWake` sound. Acceptance re-timed (0.90; a new wake strip; 6 distinct poses). | **Merged → rework:** new `penKeys`, keeping `pressKeys` for s06. Replace the lamp, cone, dust and bulb with `sensorLight` at the old pool's irradiance. Phone at its outshone level by the zone level. Fill colour becomes the fluorescent tone. Grade switch at the wake (Q12). Keep `UNIT`'s lamp fields, because s06 and s12 import them. |
| s16 | He pops to `stand_stretch` (15.0) and `stand_look` (15.5) in the gap between the desks (x 0.175), then back for solve #6. The neighbor is frozen to 14.5. Their zone wakes at 15.0, they look up at 15.5, and the rest is unchanged. Seen, not heard (Q2). Lamps become zones (pool 1.10× → 1.04×; neighbor 1.11×). | **Paused → rework:** two new standing poses, two `sensorLight`s and troughs (in frame in Camera D), remove both lamps. |
| s17 | Lamps become zones: the hero's and the neighbor's lit, the empty desk's dull, the foreground row's not drawn. Scales are now 1.04× and 1.11×. No new motion. | **Paused → rework:** swap lamps for zones and troughs |
| s18 | The knob press is replaced by **a walk-past without stopping**: +x on the s14 aisle plane z 0.228, x(t) = −0.090 + 0.072·(t − 2.0). The wake lands mid-stride at 4.0. The Freshman's zone is at local (0.110, 0.127, 0.040); pool 1.10×. In H, `lamp_spill` becomes `zone_spill` (≈ 1.01× unchanged), and H is a cutaway where he looks back. E's home lamp is unchanged. | **Paused → rework:** one walk replaces the walk-in, press, turn and walk-out. Add the Freshman's `sensorLight` and relight H. |

## Code changes for the orchestrator
1. **`src/timeline.js` renames** (times unchanged). Specs use the old names until these land (README §9):
   - `lampClickMarston` → `sensorWakeMarston`
   - `lampClickNeighbor` → `sensorWakeNeighbor`
   - `lampClickFreshman` → `sensorWakeFreshman`
   - Keep `tableLightDies` (still accurate), `lampClickHome` and `lampOffHome`.
   - Every reference in `src/audio/cues.js` and the shots must follow, then a doc pass on the spec headers.
2. **`src/audio/cues.js`** (plus a synth in `foley.js`):
   - A new `sensorWake` buffer (relay clack derived from `lampClick`'s transient, ticks at +0.042 and +0.167, a ping at +0.292, the hum rising over about 0.3 s). It goes on the s15 and s18 wake beats in place of `lampClick`, with one seed and one gain.
   - `lampClick` stays on `lampClickHome`. **Add it on `lampOffHome` too:** s06 and doc 05 both say the off click is heard, but `cues.js` skips it ("three only").
   - No cue on the neighbor's wake (already the case).
   - s14: three `fluorescentFlicker` on `custodianPass` + 3.7 / 4.0 / 4.25 at −6 dB against s11's.
   - Update the "three lamp clicks" comment.
3. **`src/lights.js`: `sensorLight`.** A SpotLight plus the `sensor_trough` mesh: housing, 5 louvres, 2 rods, `castShadow` off, and a vellum tube whose emissive follows the level.
   - It exposes `wake(t0)` (README §3 keys, stepped), `timeout(t0)` (s11's chatter and seed, moved in from `s11.js`) and `level(t)`, so shots can drive the phone's outshone rule.
   - Optional: `PALETTE.fluorescent` (a contract addition, already flagged in README §6).
4. **Rig:** `penKeys` (s15 K4–K7), plus `stand_stretch` and `stand_look` (s16).
5. **Shots:** as in the table above.
6. **Assets:**
   - `desk_lamp` is home-only now (s02, s03, s06), so the s15 close-up need goes.
   - `top_props_sheet` loses its desk-lamp piece.
   - New procedural `sensor_trough` (`paper.js`).
   - Per the process log, nothing affected is frozen.

## How it was checked
- [x] Asset names and shot columns: `node evidence/sb-reconcile/check_assets.mjs` → `desk_lamp s02 s03 s06`, `sensor_trough s11 s14 s16 s17`, `frozen in shots: 19; + style_tile = 20 (cap 35); procedural: 17; shots checked: 18`, `PASS`.
- [x] Beat times untouched: `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`. `src/timeline.js` is unchanged.
- [x] Pen poses: solved in a scratch script from the hip (−0.075, −0.012), shoulder offset (0.013, 0.030) and ℓ 0.032. The script reproduces the spec's existing tips: K6 gives (−0.0233, 0.0215), and the phone grip gives (−0.0174, 0.0008).
- [x] Pool scales and trough off-axis angles, by hand from README §3's geometry: core 23°, gator about 29°, wall 55° or more, neighbor desk 57° or more, about 40° off the phone's axis.
- [ ] Trough visibility per camera: **not verified in a render.** I computed the frame top at the trough's depth from each camera (s11 y 0.144, s12 0.109, s14 0.151, s15 A about 0.09 and B 0.05, s18 G 0.115, s16 D about 0.20). No renders were made (brief).
- [x] **Remaining lamp mentions** (`grep -n -i lamp` over every owned doc). Each is home-only, a beat name, a colour name, history, or a statement that Marston has none:
  - **02:** 20 (the rule: lamp at home, none at Marston), 23 and 58 (the home beat), 31 (the arc: home click), 73 ("the same gesture as the home lamp beat"), 105 (the old cut, now noting s14), 106 (the cut row "Desk lamps at Marston").
  - **03:** 5 (north-star diorama image), 19 and 63 (tissue lampshade, home), 39 (Lamp Amber, home), 43 (dawn colour named after the lamp), 50 (Act 2a home beat), 54 (Button: home amber in s18 E), 60, 61 and 65 (lamp as the home key), 67 (rule 8: no lamps at Marston), 97 (lamp reach, s06), 109 (a reference film).
  - **05:** 30, 36 and 73 (home lamp click and its caption), 31 (the wake is built from the lamp click's transient).
  - **assets.md:** 27 (`desk_lamp` home-only), 61 (home lamp cone), 66 (storyboard-name history), 79 ("lost its desk lamps").
  - **README:** 20 and 32–39 (home lamp), 63–64 (the phone rule at home vs in a zone), 78 (lampshade tissue), 87 (beat names), 93 (fill colour at home).
  - **QUESTIONS:** 13 and 18 (superseded), 35 (Q6 at home), 58, 65, 68 and 70–72 (new questions).
  - **Shots:** s11:49 and s15:97 ("no lamp"), s11:61 (clicks belong to the home lamp), s13:75 ("no desk has a lamp"), s15:6 and 134 (s06's lamp beat and its knob), s15:99 (the zone matches the old lamp pool's irradiance). s15:3, 53, 119 and 144, s16:3 and 135, and s18:3, 54, 123 and 141 are `lampClick*` beat names. s17:84 is the dawn colour "lamp amber". s18:90 and 131 are E's home lamp. s18:113 is history.
  - No owned doc places a lamp at a Marston desk.

## Gaps
- **Docs I don't own still put the lamp at Marston:**
  - `docs/shots/s06.md:6, 101` ("Mirrors s15 exactly", the knob-crop overlay with s15). It should say s06 is now the knob master and shares K0–K3 and the 0.500 press with s15.
  - `docs/contracts.md:396` (`press` used by s15 and s18). This needs a contract-* task.
  - `docs/01-competition.md:50` ("the hero turns on his own lamp", submission text).
  - `docs/06-production-plan.md:77, 78, 80` (shot list keys "Lamp").
  - `docs/04-technical.md` has no `sensorLight` row.
  - `docs/ref-ufl.md` §0's closing "consequence" paragraph is now decided.
- **Decided because the spec was silent (all reversible):**
  - the trough's height and position
  - the wake key values
  - s14's wake at 1.0 (a light key, not a new beat) and its silence
  - s16's stand in the gap between the desks
  - s18's walk direction (+x) and plane (z 0.228)
  - H as a look-back cutaway with unchanged numbers
  - s17's zones staying lit
  - the foreground trough in s17 not being drawn
- **Open for the director:**
  - Q10: timeouts are film time. s11's starts at 4.2 while his hunch settles until 4.4.
  - Q11: s14's wake edges toward the cut "Custodian turns on the lamp". I used it because it teaches the mechanism and rhymes with s18.
  - Q12: green-cream vs warm at the turn. The built s15 uses an `amber` grade.
- **Built s15 deviations are still not in the spec** (wall 4.2×, blob z 0.0884, phone ×0.05). README §3 gives the pool offset for both blob depths. The s18 walk's screen projections weren't computed.
- **README §9 is stale:** it says `CUES` lacks an `offset` field, but `cues.js` already uses one. I didn't change it.

## State
built · 2026-10-15
