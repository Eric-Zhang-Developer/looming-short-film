# Done · sb-act3

## What shipped
Shot specs for Act 3, Quiet 2 and the Button: s15, s16, s17 and s18. Each follows `templates/shot.md` and gives meters, angles and local times for every layer, light, camera and pose.

All four Marston shots share one coordinate frame and one **desk unit**: desk top y = 0, window wall z = 0, and the gator in profile at the left end facing +x.

**s15 is the master for the s06 match.** Its Camera A, desk unit, hand keys K0–K7 and press at local 0.500 are pinned as numbers, so sb-act1 can copy them.

## Where it lives
- `docs/shots/s15.md`, `docs/shots/s16.md`, `docs/shots/s17.md`, `docs/shots/s18.md`, and this note
- Commits on `task/sb-act3`:
  - `5983334` s15
  - `a302a2c` s16
  - `19a4436` s17
  - `c2f3aaa` s18
  - plus the commit for this note

## For sb-act1 / orchestrator: s06 must mirror s15
s06 must use, unchanged:
- **Camera A:** `fov` 20, position (−0.010, 0.118, 0.392), lookAt (−0.010, 0.030, 0.080).
- **The desk unit:**
  - desk top x −0.033…0.150, z 0.030…0.120
  - `desk_lamp` plane z 0.078: stem x −0.022…−0.018, knob (−0.0228, 0.0228), shade mouth (0.004, 0.056)
  - page x −0.033…−0.008, z 0.080…0.110
  - blob mark (0.000, r, 0.098)
  - gator hip (−0.075, −0.012), shoulder at hip + (0.013, 0.030), one-segment arm ℓ = 0.032
- **Hand keys K0–K7** (s15 §Characters, table) at local 0.000–0.583, with the **press at 0.500** = `lampClickHome`, the same as the timeline.
- The same `lampClick` buffer.

s06 may swap the set paper (`apt_wall`, `apt_desk`), hold the phone differently, and use its own blob size and phone scale. Everything after K7 (the flinch, the lamp off at 3.0) is s06's own. sb-act1 wrote s06 in parallel, so **this match is not verified.**

## Asset list (s15–s18)

| Name | What it is | Shots | Use | Kind |
|---|---|---|---|---|
| `gator_sheet` | The Student: body, head, snout, jaw, arm_l, arm_r, tail, `pocket` (cream tissue hoodie) | s15, s16, s17, s18 | close-up | painted |
| `face_sheet` | Eyes open, closed, tired, gasp, worried, side; mouths neutral, smile, o, line. Shared by the Student and the Freshman | s15, s16, s17, s18 | close-up | painted |
| `freshman_sheet` | The Freshman at 0.85× the Student, with an oversized backpack part (also needed for s13) | s18 | close-up | painted |
| `crowd_sheet` | Marston extras, 2–3 parts each: the energy-drink neighbor (body, head, arm) and one sleeping extra | s16, s17 | background | painted |
| `desk_lamp` | Architect lamp: base, stem, separate `knob` part, arm, tissue shade. Used mirrored too | s15, s16 (×2), s17 (×3), s18 (home + Marston); also s06 | close-up | painted |
| `phone` | Phone with two faces: glyph screen (no text) and back | s15, s16 (×2), s17 (×2), s18 | close-up | painted |
| `exam_page` | Practice exam page, glyph problems only | s15, s16 (×4), s17 (×4), s18 | close-up | painted |
| `pen` | Pen with a separate cap part | s15, s16, s17, s18 | close-up | painted |
| `laptop` | Closed laptop (continuity from s11) | s15, s16, s17 | background | painted |
| `energy_drink` | Can, ×3 per desk | s16, s17 | background | painted |
| `calendar` | Two sheets: the old Friday sheet circled red, and a new sheet with a new circled date (shared with s02) | s18 | close-up | painted |
| `marston_desk` | Kraft reading desk: top plus front apron | s15, s16 (×2), s17 (×4), s18 | close-up and background | painted |
| `marston_chair` | Chair in profile | s15, s16 (×2), s17 (×4), s18 | background | painted |
| `marston_window_wall` | Navy cardstock wall with 6 tall window openings (x centers −0.51 … +0.49, sill y 0.066, top 0.300) | s15, s16, s17, s18 | background | painted |
| `window_tissue` | Tissue window panes, castShadow off | s15, s16, s17, s18 | background | painted |
| `marston_floor` | Kraft floor | s17, s18 | background | procedural (`makePaper` color) |
| `apt_wall`, `apt_desk` | Reused from sb-act1, behind the calendar | s18 | background | painted (sb-act1) |

That's 18 names: 17 painted (2 of them sb-act1's) and 1 procedural.

These are procedural, not assets: every blob (`blob.js`), the vellum cones and dust, the name and answer squiggles, the calendar tear edge, and the `lamp_spill` light.

## How it was checked
- [x] **Every template section is filled.** `grep '^## '` on each file shows all 8 sections in template order. Values are numbers: z, positions, angles, times, scales.
- [x] **Every timeline beat appears in the right shot.** A grep for each beat name hits the right file:
  - s15: `lampClickMarston`, `penUncap`, `nameWritten`
  - s16: `problemOneSolved`
  - s17: `quiet2Start`
  - s18: `nextSemester`, `lampClickFreshman`, `blobYawn`
  - Each is on its Beats line, in the action at its local time, and in Sound.
- [x] **Blob shadow scale is stated wherever the blob is visible.** Phone: 7.1× (s15 0–7.4, the s16 neighbor, the s18 Freshman). Lamp: 1.22× → 1.10× as the blob shrinks; 1.27× for the Freshman. Dawn: 1.0×. Pocket: ≈ 1.01×.
  - Phone positions come from L.z = k·S.z / (k − 1).
  - Lamp pools come from L.y / (L.y − blob.y).
- [x] **Framing and reach.** I didn't guess these: a throwaway pinhole projection (fov 20, 16:9) and the one-segment arm solve, run from the scratchpad and not committed. The pixel positions quoted in each Camera section come from it.
  - The arm solve gave every fingertip in K0–K7 and the writing and phone poses.
  - The lift drawing (K3) clears the desk edge, because the sweep goes below y = 0 only at x < −0.0336, left of the desk.
- [ ] **Nothing rendered.** `lights.js`, `blob.js`, `puppet.js` and `post.js` don't exist yet. Pixel positions ignore DOF and lens effects, and every Acceptance item in the shot files is for the wave 4 builder.
- [ ] **The s06 ↔ s15 match is not verified.** s06 isn't written yet, or I haven't seen it.

## Spec conflicts found (and what I assumed)
1. **Quiet 2 motion.** The brief and doc 03 say quiet shots are locked with "only light and boil" moving. Doc 02 has him sit back and the blob climb into his pocket in s17.
   - Assumed: camera fully locked. The two actions are packed into 4.0–12.0, and from 12.0 to 25.0 only the light and boil move.
2. **Lamp click count.** Doc 05 says the click is heard three times (0:36, 1:40, 2:44). Doc 02's neighbor "clicks on their own lamp" in s16, which makes a fourth.
   - Assumed: the same `lampClick` buffer at −12 dB, panned right, at s16 15.0.
3. **s18 timing.** The timeline puts `lampClickFreshman` at 2:44. Doc 02 starts the walk-over at 2:44, before the click.
   - Followed the timeline: the calendar wipe runs 0–2.0, the walk-in 2.0–3.33, and the press lands at 4.0.
4. **Red exactly once.** Doc 03 says red appears exactly once (the calendar circle). Doc 02's "a new circled date" makes a second red circle, and both are on screen during the tear.
   - Assumed red, as the same motif. The alternative is a navy pencil circle; that's a director call.
5. **The phone flip at 1:48.** Doc 02 puts "phone face-down, then uncap" at 1:48, but the timeline has `penUncap` at 1:48.
   - The flip happens at 7.0–7.42 local (1:47.0–1:47.4).
6. **"Same gesture, in the other direction"** (doc 02) against "same hand path" (doc 06).
   - Assumed an identical path. "Other direction" means the outcome: the light stays on.
7. **Blob size.** The contract's `createBlob` default radius of 0.025 makes the blob wider than half of the 8 cm gator.
   - Used r 0.010 at s15, stepping to 0.005 by the end of s16 (hamster), and 0.012 for the Freshman's.
   - sb-act1 should size the s02 mug-sized drop below 0.010. Doc 02 implies the blob grows through Act 2.
8. **Lamp cone angle.** Doc 04 says "~35°", while the contract's `lampLight` defaults to angle 0.6 rad, which is a three.js half-angle (≈ 69° full).
   - Used 0.6 rad. The pool is about 7.7 cm across, covering the page, the blob and the phone.
9. **Shots with cuts.** Doc 06 lists s16 and s18 as single shots, but they need setups: s16 cuts once (at 6.0, the 2:00 montage beat) and s18 twice (2.0 and 11.0).
   - If the orchestrator wants one setup per shot ID, split them in the timeline (a `contract-timeline` task).
10. **Cues by beat name.** Several cues have no beat:
    - s15 phone face-down at 7.417
    - s16 solves #2–#6 at 8.5, 11.0, 13.0, 14.5, 16.0, and the neighbor click at 15.0
    - s17 birds at 6.0, 13.5, 19.0
    - The contract's `CUES` entries are `{ beat, sound, gain }`, with no offset field.
    - I wrote these as beat + offset. A `contract-timeline` or `contract-audio` task should add beats (`phoneFaceDown`, `problemSolved2`…`6`, `lampClickNeighbor`, `dawnBird1`…`3`) or an `offset` field.

## Gaps
- **Contract gaps for `blob.js`.** The shots need:
  - eye states `open` and `closed`
  - a gaze direction (I used a 10° plane tilt instead)
  - a radius change after creation (s16 shrinks it six times; `mesh.scale` would work if the shadow follows, which it should)
  - optionally a mouth for the yawn (s18 falls back to stretch plus closed eyes)
- **Puppet limits.** The parts are flat at a fixed z, and doc 03 gives one-segment arms. All reach was solved for ℓ = 0.032, which is why the desk props sit within about 3 cm of him.
  - Writing on lower page lines uses a screen-space cheat: tip height = Δz · tan(down angle).
  - If `mod-puppet` adds elbows, treat the fingertips in K0–K7 as targets.
- **Lamp pool scale.** `shadowScale()` only takes a z-plane wall, so I computed the desk pool scales by hand.
- **Not checked against sb-act2.** The handoff from s14, the Marston room layout (the hero desk against the window wall at z = 0) and the s13 figures (neighbor, Freshman) are unchecked. If their room differs, keep the desk unit and move the rest.
- **Decided where the spec was silent:**
  - one `desk_lamp` model at home and in Marston
  - the hero desk sits against the window wall, so the dawn in s17 comes through the same wall seen at night in s15
  - the neighbor is s13's energy-drink gator, and faces the hero
  - small sleeping blobs for the s17 extras, lit by dawn at 1.0×
  - lamps left on through s17
  - fluorescent hum kept at −12 dB as s17's room tone
  - no footsteps in s18 (not in doc 05)
  - the Freshman doesn't write (doc 02 doesn't ask for it)
  - the lamp sits behind the blob so the pool falls toward camera (the smoke-paper finding)
- **Skipped:** an optional cyan seam glowing under the face-down phone (doc 03 rule 5).

## State
built · 2026-10-15
