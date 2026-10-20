# Done · spec-blob-meter

## What shipped
The spec now treats the blob's own size as the dread meter (director, process log 2026-10-15). It is born at 1× (r 0.012) and gulps one step bigger after five written avoidance beats, peaking at **2.5×** in s11. At that size its eyes are level with his at the desk. It shrinks one step per solved problem in s16 to 0.42× (r 0.005), small enough for his pocket. The shadow stays on top: every shadow keeps its spec size, measured in birth units (S × r / 0.012), by moving the light or the desk blob mark. Where it gets bigger on screen, the shot file says it's on purpose. The s02 birth now plays in a tight calendar insert. **No beat time, cut or shot boundary moved.** Five new gulp beats are added, at new times only.

Rules (README §1): growth comes only from gulps, each on a beat with the eyes on him; there's no slow morphing; it's never evil (no mouth, no teeth, no lunge); no text, thought bubbles or face on the exam; and it fits the pocket by s16 #6.

## Size table (`docs/shots/README.md` §1, as named values)
`METER = { birth: 0.012, gulp1: 0.015, gulp2: 0.018, gulp3: 0.021, gulp4: 0.024, gulp5: 0.030 }`, `SHRINK = [0.030, 0.024, 0.018, 0.012, 0.009, 0.007, 0.005]`. Each shot defines `BLOB_R = { start, <step beat>: r }` at the top of its file.

| Shot | Start | End | Change |
|---|---|---|---|
| s01 | none | none | |
| s02 | born | 1× | bead 0.17 → 0.45 running → 0.5 perched → 1× after landing |
| s03 | 1× | 1.25× | gulp 1 |
| s04 | 1.25× | 1.5× | gulp 2 |
| s05 | 1.5× | 1.5× | |
| s06 | 1.5× | 1.75× | gulp 3 |
| s07 | 1.75× | 2× | gulp 4 |
| s08–s10 | 2× | 2× | |
| s11 | 2× | 2.5× | gulp 5 (peak) |
| s12–s15 | 2.5× | 2.5× | s12 breathes ±6%; s15's wake shows the real size |
| s16 | 2.5× | 0.42× | six shrinks |
| s17, s18 | 0.42× | 0.42× | hamster, then pocket |

## Gulp beats (all new beat names; global times on the 120 bpm grid where the groove runs)
| Beat | Shot @ local | Global | Before → after | The look, then the look-away |
|---|---|---|---|---|
| `gulp1` | s03 @ 3.5 | 0:18.5 | 1× → 1.25× (0.012 → 0.015) | looks at the blob and the calendar, shrugs, takes the phone |
| `gulp2` | s04 @ 6.5 | 0:26.5 | 1.25× → 1.5× (0.015 → 0.018) | glances at it on the stool (5.83), back to a jar (6.0) |
| `gulp3` | s06 @ 4.0 | 0:40.0 | 1.5× → 1.75× (0.018 → 0.021) | sees it under the lamp, clicks off, grips the phone (3.5); lands on the groove's re-entry downbeat |
| `gulp4` | s07 @ 9.0 | 0:53.0 | 1.75× → 2× (0.021 → 0.024) | glances down at it (7.67), shuts the last gap (8.0) |
| `gulp5` | s11 @ 5.25 | 1:17.25 | 2× → 2.5× (0.024 → 0.030) | the laptop (1.5–2.6), then the phone (3.6); gulps after the light dies |

Three gulps land by the lamp beat and four in Acts 1 and 2a. Drawings: t₀ − 0.083 squash 0.3 with eyes closed; t₀ snap with stretch, eyes open on him; settled by t₀ + 0.25.

## Shrink beats (existing beats, unchanged)
`problemOneSolved` s16 @ 3.0 → 2×, `problemSolved2` @ 8.5 → 1.5×, `problemSolved3` @ 11.0 → **1×, back on the page corner (0, ·, 0.098)**, `problemSolved4` @ 13.0 → 0.75×, `problemSolved5` @ 14.5 → 0.58×, `problemSolved6` @ 16.0 → 0.42×.

## The s02 birth
The shot stays 9 s, and `inkDropForms` stays at 4.0. It cuts to **Camera I** at 2.5, face-on to the calendar from 0.21 m: the circle and glyph sit in a 0.074 m frame at 14.6 px/mm. The bead (4 mm, about 58 px) forms below the glyph at 3.33–4.0. It runs down the sheet, gathering to 0.45, and perches on the curled lip at 5.0, at 0.5 scale (1.2 cm). Its eyes open at 5.17. It looks up at the glyph (5.33–5.67), then over at him (5.75), and lets go at 6.0. It cuts back to the wide at 6.083 on the drop. It lands at 6.42, swells to 1× by 7.25 and makes two hops to B by 8.83, matching s03. The extra time comes from cutting the three hops to two. **No extra seconds are needed**, so I didn't open a question for them.

## Shadows that change on screen (all deliberate)
- **s03:** 3.0 → 3.75 units at gulp 1. The light is unchanged; this replaces the old scoot to 3.33. The top is in frame (row 248).
- **s06:** 6.1 units, then 7.1 after gulp 3 (built: 4.2). It is wholly in frame under Camera A′.
- **s07:** 17.5 units for the half-second before gulp 4, then the spec's 20.
- **s10:** about 1 unit bigger all along (3.8 → 11.8 against 2.8 → 10.8), because the dread peaks there.
- **s11:** ends at 6.7 units against 5.9, because gulp 5 swells it. Its top touches the frame edge.
- **s15:** 7.1 units (the spec's number) against the built 4.2. Camera A′ holds it.
- **Same units as the spec:** s04 (end 6.25), s05 (8), s08 (12.6), s12–s14 (7.1, S 2.85).
- **s04 sits 10 cm right**, and s07 and s05 a few cm, because the light moved in z.

## Per shot: what changes and the rework
| Shot | Spec change | Code → rework |
|---|---|---|
| s01 | none | none |
| s02 | Calendar insert (Camera I 2.5–6.083), new drop path and looks, two hops, cue offsets | **Built → rework:** second camera, retimed drop, the perch and looks |
| s03 | Gulp 1 replaces the scoot at 3.5; `gulp1` cue | **Built → small:** gulp at 3.5, remove the scoot |
| s04 | Fridge light z 0.25 → 0.2763; his look at 5.83 and look-away at 6.0; gulp 2 | **Built → small:** light z, two face keys, gulp |
| s05 | Blob 1.5×; phone and light z 0.40 → 0.4308; walk-through 4.1–5.1 | **Built → small:** r and light z; maybe drop the TV's blob ghost |
| s06 | Camera A′; blob contact (0.0069 → 0.0104, 0, 0.0859); gulp 3 at 4.0; pool 1.47× | **Built → rework:** camera, blob mark, gulp. The phone light goes back to the spec's (−0.010, 0.004, 0.114) |
| s07 | Phone z 0.40 → 0.4222; his glance at 7.67; gulp 4 at 9.0; blob eye keys shifted | **Built → small** |
| s08 | Blob 2× at x 0.135; phone z 0.315 → 0.3447; cone 0.6 (he stays non-casting if 0.78 is kept) | **Built → small** |
| s09 | The blob hops at his heels on the plaza and follows him through the doorway (5.4–5.75) | **Built → rework:** new blob path |
| s10 | The blob waddles on the floor at (−0.045, 0, −0.025); phone at (−0.040, 0.019, +0.035); cone 0.7 | **Built → rework:** blob and phone offsets |
| s11 | Laptop z 0.060 → 0.078; blob contact (0.0138 → 0.0207, 0, 0.074); phone z back to the spec's 0.124 / 0.118; gulp 5 | **Built → rework** |
| s12 | Blob 2.5× at the Marston mark; the spot goes back to the phone's z 0.114 (S 2.85) | **Built → small** |
| s13 | Hero r 0.030, decal 2.84× (same width) | **Built → one constant** |
| s14 | Blob 2.5× at the mark; pool 1.31×; reworded beat (shadow small, not blob) | **Paused → fold into its brief** |
| s15 | Camera A′, Camera B′ (B pulled back 0.07); blob 2.5× at the mark; S 2.85; pool 1.31×; the (dev) loom fix retired | **Built → rework:** cameras, `UNIT` blob and phone fields (s06 imports them) |
| s16 | Camera B′; shrink to the new ladder; the blob returns to the page corner at #3; pools 1.31× → 1.04×; music-box shrink answers | **Paused → fold into its brief** |
| s17 | Named size only | none |
| s18 | Named size only | none |

## Code-change list for the orchestrator
1. **`src/blob.js`: no change needed.** Size is `createBlob({ radius })`, and an in-shot step is `mesh.scale`, which the shadow (`customDepthMaterial`) follows. One latent edge: `syncFloor` divides by `radius`, not `radius × mesh.scale`, which matters only if a scaled blob lifts off its surface. No gulped blob hops in the same shot.
2. **`src/characters/exam.js`:** replace `EXAM_R`/`examRadius` with `METER` and the new `SHRINK` (README §1). Rename the other-blobs map `BLOB_R` → e.g. `OTHER_R` so shots can own `BLOB_R`. Add a shared `gulp(t, t0)` → `{ scale step, squash, eyes }` for the five gulp shots (s16's shrink can use it reversed).
3. **`src/timeline.js`:** add `gulp1` (s03 3.5), `gulp2` (s04 6.5), `gulp3` (s06 4.0), `gulp4` (s07 9.0), `gulp5` (s11 5.25). No existing beat moves.
4. **`src/audio/score.js`:** a gulp event per beat: EXAM's first two notes, 0.275 s apart, transposed −1…−5 semitones, vel 0.30 → 0.42, second note a few cents flatter each time. Shrink answers on `problemOneSolved`…`problemSolved6` at +0.25 s: the pair falling, −4 … +1 semitones, −6 dB. **`cues.js`:** `inkDrip` at −18 dB on each gulp. The s02 cue offsets are now perch +1.0, land +2.42, hops +4.04 / +4.83.
5. **Shot constants:** the desk-unit blob marks (home contact z 0.0859, Marston z 0.074, x = 1.15 (r − 0.012)), the Marston laptop at z 0.078, and Camera A′ / B′ (README §8), in `s15.js`'s `UNIT` and its camera export.

## How it was checked
- [x] Only owned docs changed: `git diff --stat 98c0955..HEAD` lists docs 02, 03, 05, `docs/shots/README.md`, `QUESTIONS.md` and s02–s18, plus this note. No `src/` or `tools/` changes.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`. Run as a read-only guard; the beats are unchanged.
- [x] Act 1 preview looked at: every 48th frame of `out/frames/000000–001055` as two contact sheets, plus a crop of frames 228–270. Finding: the s02 bead is about 3 px in the wide and unreadable, and no shot has him look at the exam before he dodges. Both are addressed.
- [x] Shadow numbers: a pinhole projection script (fov 20, 1920 × 1080) reproduces the spec's own s03 numbers (centre (1442, 559), S 3.000) and s15's Camera A projections (blob (1058, 758), eye (533, 525)) exactly, and every new S, unit count, extent and pixel position quoted in the shot files comes from it.
- [ ] Renders: **not done** (docs only, by brief). Every framing claim is computed, not seen. In particular: Camera A′ (the shadow top at row 50 in s15 and 76 in s06), s11's top touching the frame edge, s12's right edge at the breath peak, and whether 1.25× and 1.5× read in s04/s05's wide frames.

## Gaps
- **The peak is 2.5×, not the brief's "around 3×"** (Q13). Also, the process log's wording was "head size", which is closer to 1.6×.
- **The geometry script isn't committed**, because `evidence/` isn't in this brief's owns. It sits in my scratchpad (`geo.py`, `shots*.py`, `camA.py`). Say if you want it under `evidence/spec-blob-meter/`.
- The off-axis angles of his eye in s11 and s12 weren't recomputed for the moved blob. The specs say "re-measure". s07's blob half-angle is approximate (about 36°).
- The repo `README.md` logline ("growing with every hour he avoids the work") isn't in my owns, so it's unchanged. It still reads true but doesn't mention the meter.
- In s13, the crowd keeps its sizes (Q14), so the hero's blob is the largest in the room.
- Camera A′ changes the framing of two built shots against doc 11's "keep framing" rule. It's flagged as Q15, including keeping A for the rough only.
- `contract-sensor`'s beat renames (`lampClickMarston` → `sensorWakeMarston` etc.) are in flight; these specs still use the current names.

## State
built · 2026-10-15
