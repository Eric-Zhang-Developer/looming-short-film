# Done · sb-act1

## What shipped
Eight shot specs for Act 1 and Act 2a (s01–s08), each following `templates/shot.md` with all 8 sections. Each spec gives layer z positions, light positions solved from the doc 02 shadow rule, camera FOV, position and look-at, poses at local times, face swaps on beats, and sound placement. s06 also carries the camera and right-hand-path tables that s15 must copy. All blocking numbers were checked with a three.js script (not committed; see How it was checked).

## Where it lives
- `docs/shots/s01.md` … `docs/shots/s08.md`
- Commits on `task/sb-act1`: `f8cd1ab` (s01–s03), `03b2988` (s04–s08), plus the commit for this note.

## How it was checked
- [x] **Every template section filled, with numbers.** `grep -c '^## '` gives 8 for every file, matching the 8 sections of `templates/shot.md`. Positions, scales, times, FOVs and ratios are numeric. Light intensities are relative ratios only (see Gaps).
- [x] **Every timeline beat in the right shot.** From `src/timeline.js`: s02 `inkDropForms` @ 4.0, s03 `phoneUp` @ 0.5, s06 `lampClickHome` @ 0.5 and `lampOffHome` @ 3.0, s07 `curtainsDone` @ 8.0. Each one is in that shot's Beats line, its action list and its Sound section. s01, s04, s05 and s08 have `beats: {}`, and their Beats lines say so.
- [x] **Blob shadow scale stated wherever the blob is visible.** s02 1.0× (directional). s03 2.76× → 3.00× → 3.21×. s04 4.17× → 5.0× → 6.25×. s05 8.0×. s06 7.0× on the wall, 1.16× lamp pool, 8.1× spring overshoot. s07 20.0× (no readable shadow 0–8 s, explained). s08 12.6×. s01 has no blob.
- [x] **Geometry verified, not asserted.** Scratch scripts using `node_modules/three` computed, for every light/blob pair: the first receiver hit (wall, desk, floor or ceiling), the scale `t = |L→hit| / |L→B|`, the shadow extent, the blob's half-angle from the light, the off-axis angle to each thing that must stay out of the phone cone, and NDC projections of every acting element through each camera. Every number in the specs comes from that output, for example `s06 phone: 7.01x on wall at (-0.090,0.066,0.000)` and `s07 phone: 20.00x on wall at (-0.100,0.164,0.000); top-ray ceiling … 0.104`. The scripts stayed in the session scratchpad: the brief asks for no evidence files and `evidence/` isn't in my owns.
- [x] **Asset list:** below.
- [x] **Spec conflicts:** below, under Gaps.
- [ ] **Visual check: not verified.** Nothing was rendered, because `paper.js`, `lights.js`, `blob.js` and `puppet.js` don't exist yet. Whether the 1.16× pool, the moon patch and the dawn slash read as intended is unchecked until wave 4 blocking.

### Consolidated asset list (s01–s08)
28 entries: 21 NEW, 7 from the brief's shared names. The blob, the lamp cone and dust, and every light are code, not painted assets. The TV in s05 is a light only.

| Asset | What it is | Shots | Close-up or background |
|---|---|---|---|
| `gator_sheet` | The Student puppet parts | s02–s08 | Close-up in s03, s06, s08; wide in s04, s05, s07 (needs ladder, reach-up, prone and lying-on-side poses) |
| `face_sheet` | Eye and mouth swaps (doc 03 set) | s02–s08; scaled for both roommates in s05 | Close-up |
| `phone` | Phone; the screen shows only a soft gradient, no UI | s03, s05, s06, s07, s08 (s02 dark, s04 in pocket) | Close-up s03, s06; medium elsewhere |
| `desk_lamp` | Architect lamp, **switch on the base front**, tissue shade | s02, s03 (off), s06 | Background s02/s03; **close-up s06** (s15's lamp needs the same switch geometry) |
| `calendar` | Sheet 1: scribble-glyph month grid, Friday circled red with an exam glyph (the film's only red) | s02, s03, s06 | Close-up s02; background s03, s06 (sheet 2 for s18 is act 3's) |
| `apt_wall` | Interior wall plate, cream cardstock, the main shadow receiver | s02, s03, s05, s06, s07, s08 | Background, but needs visible paper tooth because it carries every big shadow |
| `apt_desk` | Kraft desk top plus front edge | s02, s03, s06 | Close-up (the drop lands on it; the lamp pool lies on it) |
| `apt_window` NEW | Tissue window pane with a cross mullion | s01, s04, s05, s07, s08 | Close-up s01 (exterior); background elsewhere |
| `dawn_sky` NEW | Tissue sky, navy to cream-rose | s01 | Background |
| `skyline_far` NEW | Low Gainesville rooftops plus one clock-tower silhouette, no signage | s01 | Background |
| `skyline_near` NEW | Rooftops and oak canopies | s01 | Background |
| `oak_branch` NEW | Live-oak branch with tissue moss | s01 | Foreground, always defocused |
| `apt_exterior` NEW | Apartment facade with one window hole | s01 | Close-up at the end of the push |
| `apt_kitchen` NEW | Kitchen wall with upper and lower cabinets (plain panels, round knobs) | s04 | Background (shadow receiver) |
| `apt_floor` NEW | Kraft floor (a real paper scan is fine, doc 04) | s04, s05, s07, s08 | Background |
| `mini_fridge` NEW | Dorm mini-fridge with an opening door | s04 | Medium |
| `fridge_contents` NEW | 3 jars of falling size and 1 carton, blank labels | s04 | Close-up (small) |
| `kitchen_stool` NEW | Stool, the blob's perch | s04 | Background |
| `apt_couch` NEW | Couch | s05 | Background |
| `apt_coffee_table` NEW | Coffee table | s05 | Medium |
| `controllers` NEW | 2 game controllers | s05 | Background |
| `roommate_tall` NEW | Tall roommate puppet sheet, split for a walk cycle | s05 | Medium-wide |
| `roommate_round` NEW | Round roommate puppet sheet | s05 | Background |
| `blackout_curtains` NEW | 2 opaque cardstock panels, rod, 2 brackets | s07, s08 | Medium s07, background s08 |
| `ladder` NEW | 0.20 m ladder | s07, s08 | Medium s07, background s08 |
| `drill` NEW | Drill | s07, s08 | Medium s07, background s08 |
| `apt_bed` NEW | Bed, pillow, tissue blanket | s07, s08 | Background s07, medium s08 |
| `apt_ceiling` NEW | Flat Night Navy cardstock | s07, s08 | Background; **procedural, no generation** |

## Gaps

**Spec conflicts (between doc 02, doc 03, doc 06 and the timeline) and what I assumed**
1. **Blob size.** Doc 03 says "about the size of a coffee mug", `contracts.md` defaults `createBlob` to radius 0.025 (5 cm), and the gator is 8 cm. A 5 cm blob is 60% of his height and can't read as small under the lamp. I used **radius 0.012 m** everywhere. sb-act2 and sb-act3 should use the same number.
2. **Does the blob itself grow?** Doc 02 says the Exam "grows because it is ignored" and later "shrinks" to "hamster-sized". The logline, the README and the visual rule say the *shadow* grows. I kept the blob body constant through s08 and drove all growth with light geometry ("the metaphor is the algorithm"). Act 3 still needs a number for "hamster-sized" relative to r 0.012.
3. **`lampOffHome` @ 3.0** isn't in any doc (the timeline comment says so). I used it as given.
4. **Shadow "springs back" at lamp-off (doc 02).** With the phone still on, the lamp can't erase the wall shadow. So he sets the phone face-up at the click (its cone then misses the blob) and snatches it back at 3.08–3.17. The shadow returns 0.17 s after `lampOffHome`, with a spring overshoot.
5. **"The desk lamp is overhead" (doc 02).** The blob is a camera-facing plane, so a straight-overhead light hides its pool behind it (smoke-paper finding). The lamp is 65° up and front-right, so the pool shows on the left. s15 must copy this.
6. **Curtains.** Doc 03 lists curtains as tissue (glowing), but doc 02's are *blackout*. I made them opaque cardstock, so dawn comes only through 3 mm and 1 mm seams (doc 03 lighting rule 5).
7. **One motivated source (doc 03) vs "TV + phone" (doc 06, s05).** The phone is the key; the TV is a 25% flickering fill.
8. **s07 key "Phone" (doc 06).** He installs curtains all night, so moonlight keys 0–8 s and the phone keys 8.5–10 s.
9. **Light colors.** Doc 03 has two light colors. The fridge light is Phone Cyan mixed 40% toward Cream, and the TV is a 60% mix.
10. **"Thursday" (doc 02, s08)** can't be shown without text. The read is "dawn while he's still scrolling". Option for the director: a cross-off scribble on the calendar in a later desk shot.

**Contract changes needed (could not do them; not my owns)**
- **`contract-lights`:** `shadowScale` and `placeForScale` take only a `wallZ` receiver. The lamp pool (desk y = 0) and s07's floor/ceiling spill need any plane, e.g. `shadowScale(lightPos, subjectPos, { normal, point })`. I computed those numbers by hand-written ray math.
- **`contract-lights`:** the phone-rig convention puts a shadow spot at the phone, aimed at the blob (a real screen faces him and wouldn't light it), plus an unshadowed cyan face fill. `phoneLight` returns one SpotLight, so the specs tell builders to add a raw `THREE.PointLight`. A `faceFill` option would keep shot code on the contract.
- **`snd-engine` / timeline:** `CUES` anchor by beat name only, with no offset. s01, s04, s05 and s08 have no beats, and most foley (drip landing, hops, drill, footsteps, clicks after the beat) sits at beat + offset. Needed: an `offset` field plus a shot-start anchor, or more beats in `src/timeline.js`. Every unanchorable cue is marked in the Sound sections.
- **`mod-blob`:** `update(…, { eyes })` doesn't list eye names. I used the gator set (`open`, `closed`, `side`, `worried`, `tired`).

**Decided because the spec was silent**
- The phone-rig cheat above, used in s03–s08. Every phone shot lists off-axis angles showing the Student stays outside the cone, so his own shadow never competes with the blob's.
- Room heights of 0.30–0.32 m (about 3.75× the gator, roughly twice real proportion), so the 20× shadow fits on a wall.
- Escalation was checked on screen as well as in ratio: 36% → 43% → 47% → 55% → 105% → 74% of frame height (s03 → s08).
- I tried a raked ceiling for s07. It hid the curtain rod, so I kept it flat. With a 20° lens the ceiling is a strip (NDC 0.70–1.0), and the peak reads as one band from floor to ceiling.
- Light intensities are given as ratios only. Absolute values wait on `mod-lights` calibration (smoke-paper used ACES, while the contract says NoToneMapping).
- No dawn birds outside Quiet 2. No music in s01; the motif starts at `inkDropForms`.
- The roommates reuse `face_sheet`, scaled.

**Budget flag.** Act 1–2a alone needs about 26 generated assets (28, minus the procedural ceiling and a possibly scanned floor). Doc 08 budgets 25–35 frozen assets for the whole film. The orchestrator should merge or cut set pieces across acts (for example, one `apt_room` plate instead of separate kitchen and wall art).

## State
built · 2026-10-15
