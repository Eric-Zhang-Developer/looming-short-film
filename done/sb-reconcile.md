# Done · sb-reconcile

## What shipped
The 18 shot specs now describe one film. Film-wide rules are written once in `docs/shots/README.md` (blob radius, the shared desk unit, the lamp, the phone light, one key light, materials, quiet shots, cue anchors). s02/s03/s06 and s11/s12/s14 are re-blocked onto s15's desk unit, and every changed number comes from a script. `docs/assets.md` merges the three asset lists: 55 painted names become **19 frozen assets plus the style tile (20)**. `docs/shots/QUESTIONS.md` holds the **8** director questions. `src/timeline.js` gains 25 beat names; nothing existing moved.

## Where it lives
- `docs/shots/README.md`, `docs/shots/QUESTIONS.md`, `docs/shots/s01.md`–`s18.md`, `docs/assets.md`
- `src/timeline.js`
- `evidence/sb-reconcile/`: `geometry.mjs` + `geometry.txt` (every new or changed coordinate, scale, angle and pixel), `check_assets.mjs` + `.txt`, `timeline_diff.mjs` + `.txt`, `check_timeline.txt`
- Branch `task/sb-reconcile`: `14cde12` contract(timeline), `21270d1` spec, plus the commit for this note

## How it was checked
- [x] **Every conflict is resolved or in QUESTIONS.md, none dropped.** 33 conflicts are listed in the three storyboard done notes (sb-act1 10, sb-act2 13, sb-act3 10). Of those, 25 are resolved, 7 are only in QUESTIONS, and 1 (B6) is resolved as a convention and also asked as Q6. I found 13 more while reconciling: 11 resolved, 2 forwarded (N8, N13). snd-score's beat request is resolved. The log is below. QUESTIONS has 8 entries: 7 from the notes and the brief, plus Q7 (the Exam's look, from the brief and `NOW.md`).
- [x] **`docs/assets.md` total ≤ 35, each used by ≥ 1 shot, and every shot points at its names.** `node evidence/sb-reconcile/check_assets.mjs` → `frozen in shots: 19; + style_tile = 20 (cap 35); procedural: 16; shots checked: 18` / `PASS`. It parses every shot's Assets section and fails on an unknown name, an unused asset, or a Shots column that differs from actual use. Negative test: putting `bogus_sheet` into s05 made it FAIL with 3 errors; restored.
- [x] **`check_timeline.mjs` passes:** `ok (18 shots, 41 beats, 180.0s)` (`check_timeline.txt`). New beats (25), local times:
  - s04 `fridge` 0, s05 `gameNight` 0, s07 `curtainsStart` 0, s08 `scrollStart` 0, s09 `marstonEnter` 0
  - s10 `stacksEnter` 0, `stacksFlicker1` 0.4, `stacksFlicker2` 3.4
  - s11 `laptopOpen` 1, `phoneWake` 3.6, `tableLightDies` 4.2
  - s13 `revealSleeper` 1.4, `revealDrinks` 2.4, `revealFreshman` 3.4
  - s14 `tinyBlobSeen` 2.3
  - s15 `phoneFaceDown` 7.417
  - s16 `problemSolved2` 8.5, `problemSolved3` 11, `problemSolved4` 13, `problemSolved5` 14.5, `lampClickNeighbor` 15, `problemSolved6` 16
  - s17 `dawnBird1` 6, `dawnBird2` 13.5, `dawnBird3` 19

  That's snd-score's 5, sb-act2's 11 minus `marstonArrive` (merged into `marstonEnter`, the same instant), and sb-act3's 10.
- [x] **No existing beat or shot boundary moved.** `node evidence/sb-reconcile/timeline_diff.mjs <HEAD~ timeline> <new>` → `PASS: no shot boundary or existing beat moved` (`timeline_diff.txt`: all 18 starts and durations and all 16 old beats `same`). `score.js` still imports (229 events).
- [ ] **Visual check: not verified.** Nothing was rendered; there are no shot modules yet. Pixel positions are pinhole projections (fov 20, 1920×1080) without DOF. The s06 ↔ s15 overlay within 4 px is an acceptance item for the wave 4 builder.

## Conflict log
Format: conflict → resolution → shots touched. Q = in `QUESTIONS.md`.

**sb-act1**
- A1 Blob size (doc 03 "mug", contract 0.025, gator 8 cm) → r 0.012 film-wide; `createBlob` keeps 0.025 and shots pass `radius` (README §1) → s02–s18
- A2 Does the blob itself grow? → **Q5**
- A3 `lampOffHome` @ 3.0 not in docs → kept as given (a beat can't move) → s06
- A4 The shadow "springs back" while the phone stays on → the phone spot drops to 0.2 while a lamp is on and returns on the off frame; the blob's squash spring at 3.0 makes the spring-back (README §4) → s06, s15, s16, s18
- A5 "Overhead" lamp hides a camera-facing blob's pool → s15's lamp sits 2 cm behind the blob and the pool falls forward (README §3) → s06, s15–s18
- A6 Curtains tissue (doc 03) vs blackout (doc 02) → opaque Night Navy cardstock; tissue is for glass, panes, shade and hoodie (README §7) → s07, s08
- A7 One key vs "TV + phone" → the phone is the key, the TV a 25% fill (README §5) → s05
- A8 s07 key "phone" vs the moonlit montage → keys switch on beats: moon → black → phone (README §5) → s07
- A9 Only two light colors → fridge, TV and fluorescent are mixes of doc 03 colors, not new entries (README §6) → s04, s05, s09–s14
- A10 "Thursday" can't be shown → **Q8**

**sb-act2**
- B1 s10's fluorescent key vs the rule → the phone in his hand is the key; tubes are set light (README §6) → s10
- B2 s13 has two jobs, and doc 03 bans a crane → one locked top-down shot reads the head lift from above → s13
- B3 Quiet 1 "breathes" vs "only light and boil" → **Q1** (built as breathing until answered) → s12
- B4 Cues with no beats → 10 beats added; `marstonArrive` merged into `marstonEnter` → s09–s11, s13, s14
- B5 Blob size → as A1
- B6 A phone faces its user → the stylized rig is written once (README §4); whether he should cast too is **Q6** → all phone shots
- B7 PALETTE has no fluorescent → `lerp(cream, gator, 0.15)` everywhere (README §6); a PALETTE key is a contract addition (Gaps) → s09–s15
- B8 No API to desaturate one puppet → forwarded (Gaps) → s12–s14
- B9 `fluorescent()` has no flicker window → the shot multiplies intensity by its own envelope, kept → s10, s11
- B10 Blob eye names aren't listed → the gator's set (README §1) → all
- B11 The s06 ↔ s15 match constrains the Marston desk (lamp at x 0.15) → s11/s12/s14 re-blocked onto s15's desk unit: lamp in front of him, window wall behind, page and pen planted, laptop a profile cutout at z 0.060 → s11, s12, s14, s15
- B12 "A few faint phone glows" vs "every gator has a shadow" → as storyboarded: 10 crowd phones at 0.35, 4 empty desks → s13
- B13 Exam motif on the Custodian's blob (s14) vs the built score (none) → follow the score; the beat anchors the eye swap and focus hold → s14

**sb-act3**
- C1 Quiet 2 sit-back and pocket climb vs "only light and boil" → **Q1**
- C2 A 4th lamp click (the neighbor's) → **Q2**
- C3 s18's click at 2:44 squeezes the walk-over → **Q3**
- C4 A second red circle → **Q4**
- C5 Phone face-down vs `penUncap` both at 1:48 → the flip at 7.0–7.42, now beat `phoneFaceDown` 7.417 → s15
- C6 "Same gesture, other direction" vs "same hand path" → identical K0–K7; s06's second press reuses K2–K7 shifted +2.5 s → s06, s15, s18
- C7 Blob size (r 0.010 → 0.005; Freshman 0.012) → hero starts at 0.012 and steps 0.0105 / 0.009 / 0.008 / 0.007 / 0.006 / 0.005 on the six solves; growth is Q5 → s15–s18
- C8 Lamp cone: doc 04 "~35°" vs contract 0.6 rad → `angle: 0.35` (doc 04 plus the lab note in `NOW.md`), aimed at (−0.008, 0, 0.102) so the pool holds the page, blob and phone → s06, s15–s18
- C9 s16/s18 need internal cuts → setups inside one shot ID; timeline unchanged (README §8) → s16, s18
- C10 Cues by beat name only → 10 beats added → s15–s17

**snd-score:** beat names `fridge`, `gameNight`, `curtainsStart`, `scrollStart`, `marstonEnter` → added.

**Found while reconciling**
- N1 s15's "lamp fill brings the wall shadow to ≤ 20%" is impossible: a downward 0.35–0.6 rad cone can't reach the wall → the A4 mechanism → s06, s15, s16, s18
- N2 In the desk unit the unlit lamp sits 31–47° off the phone's axis, inside any cone that holds the blob (35.8° half-angle), so it throws its own 3.2× wall shadow → accepted as real; an acceptance check keeps it smaller than the blob's (README §4) → s06, s11, s12, s14, s15
- N3 s11–s14 have stacks behind the desk, s15–s17 a window wall → window wall (s17's dawn needs it); stacks only in s10 → s11, s12, s14
- N4 s15's laptop lay flat at x 0.05, out of his reach for s11's open → a profile cutout at z 0.060, x −0.030…0.015; closed across the s11→s12 cut → s11, s12, s14, s15
- N5 s12–s14's propped phone (7.5×) vs s15's flat phone (7.1×) → the rest spot, 7.1× from s12 on, including s13's decal → s12–s14
- N6 Drinks blob r 0.013 (s13) vs neighbor 0.010 (s16) → 0.013 → s16, s17
- N7 s13's grid (hero at the center desk, 0.11 m desks at 0.16 spacing) vs the side-view wall row (0.183 m desks at 0.25) → accepted as a schematic top-down map, with no shot showing both; restage if the animatic shows it (README §8) → s13
- N8 The built score's reveal chords (`headLift` + 1/2.5/4/5.5) don't land on the reveal beats (1.4/2.4/3.4) → forwarded: a score task (Gaps) → s13
- N9 s10/s11/s14 used `RectAreaLight`, which doc 04 says has no effect in r186 → one `DirectionalLight` → s10, s11, s14
- N10 A straight-down fluorescent hides a camera-facing blob's pool → tilted 15° toward camera; a `ceiling_header` keeps s14's aisle light off the hero's dead desk → s11, s14
- N11 s18 assumed a 0.05 × 0.06 calendar; s02's is 0.10 × 0.12 → s02's; camera E at 0.486 → s18
- N12 The s02/s03 home desk (gator at z 0.25, lamp to his right) vs the s06 = s15 desk unit → the home desk is the unit with home paper (desk flush to the wall). s02's drop path, B, s03's phone path and its 2.33× / 3.00× / 3.33× shadows, the cameras and the reach poses were all recomputed (`geometry.txt`) → s02, s03, s06
- N13 Docs outside my owns now disagree with the specs → forwarded (Gaps)

## Gaps
- **Docs outside my owns (N13):**
  - doc 06's shot list names s10's key "Fluorescent", and its shared asset list is superseded by `docs/assets.md`
  - doc 03 still lists curtains as tissue, and "red exactly once" waits on Q4
  - `assets/specs.json` still holds only the style tile; folding `docs/assets.md` into it is the orchestrator's next move
- **Contract requests, forwarded:**
  - `contract-palette`: a `fluorescent` PALETTE key
  - `contract-lights`: `shadowScale`/`placeForScale` for any plane, not just `wallZ` (desk pools were computed by hand-written ray math), and a `faceFill` option on `phoneLight`
  - `contract-audio`: an `offset` or `repeat` field on `CUES`, for hop taps, drill, footsteps and the 10 mop strokes
  - `mod-blob`: a list of eye names, gaze, a radius change after creation (s16 shrinks six times), and an optional mouth for the yawn
  - `mod-puppet` or `mod-post`: per-puppet desaturation (s12–s14)
- **Score (N8):** the reveal chords should move onto `revealSleeper`/`revealDrinks`/`revealFreshman`. Q2's answer may also drop the neighbor click. Not in my owns.
- **Unverified numbers:**
  - Reach poses come from the s15 one-segment arm model in `geometry.mjs`, not a puppet.
  - The ≈ 4.5 cm lamp pool is the cone radius at the aim point (distance × tan 0.35), not a render.
  - The gator's eye position is back-projected from s15's quoted pixel, so it's an estimate.
  - s15's other quoted pixels (knob, gator eye at B, name) were left as sb-act3 computed them. My projector puts the knob at (841, 600) against their (839, 607), so treat them as ±10 px.
- **Asset resolution risk:** sheets give about 400 px per piece (doc 08). The 15 spare slots are reserved for splitting out any piece that screens too soft.
- **Decided because the spec was silent:**
  - an exam page and pen on the home desk (s02, s03, s06)
  - the Marston chair art reused as the home chair
  - the laptop closed across the s11→s12 cut
  - the backpack's floor spot
  - the empty s17 desk explained as "went home"
- **Repo hygiene, flagged and not touched:** the repo root tracks `Gator Create Competition - Transcription.md`, a copy of the competition's own web page (committed in 309bb41). It isn't journal material, but it's third-party text in a repo that will be public. The orchestrator should decide whether it belongs there.
- A `node_modules` symlink to the main checkout exists in this worktree (gitignored, uncommitted).

## State
built · 2026-10-15
