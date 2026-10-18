# Done · trims-home

## What shipped
The home shots (s01–s06, s18) follow the v4 timeline: s01 is 5 s, s02 has the wall clock at 9:00 beside the calendar, s03 is 7 s, s04 and s05 hold a 1.5× blob, s06 runs 1.5× → 2×, and s18 is 20 s with a sit-back under the lamp and the clock at ~4:10. Every shot drives its Student with the acting kit. Two rig fixes landed: the neck now takes the painted cream, and `resolve` reads against `neutral` at phone size.

## Where it lives
Branch `task/trims-home`:
- `9262011` `src/characters/gator.js`: the throat's cream (colour/texture only)
- `655e637` `src/characters/acting.js`: the `resolve` preset only
- `95ecd15` s01 · `10bc083` s02 · `3d25d82` s03 · `074b9a6` s04 · `2605d53` s05 · `869577a` s06 · `6b19c83` s18
- Evidence: `evidence/trims-home/` (the harness `blobs.html`/`blobs.js`/`blobs.mjs` is there too).

## How it was checked
- [x] **One sheet per shot:** `evidence/trims-home/s01_sheet.jpg` … `s06_sheet.jpg`, `s18_sheet.jpg` (rendered, looked at). s18's last cell is the black frame at 194.96.
- [x] **Clock:** `evidence/trims-home/clock.jpg`, left to right: s02 at 9:00, s18 at ~4:10 (both cropped from the W stills at the same pixels, so it is the same clock on the same wall), and `evidence/climax-a1/s07_clock_crop.png` (1:45, supplied at its own crop scale).
- [x] **Blob sizes:** `evidence/trims-home/blob_sizes.txt`, read from the live shot objects (`node evidence/trims-home/blobs.mjs`): r = created radius × mesh scale, and units = S · r / 0.012 from the light's and the blob's live depths. Measured: s02 0.012 at 1× (bead 0.17× at `inkDropForms`); s03 0.012 → **0.018** at 4.5; s04 and s05 **0.018** throughout; s06 **0.018** → **0.024** at 4.0; s18 0.004 → **0.0015** at 2.0. Not pixel-measured.
- [x] **Neck:** `evidence/trims-home/neck.jpg`, left to right: before | after | the frozen painted figure. Measured on the same 1920×1080 stills: the old throat averaged `e5 d5 bd` against the jaw's `ee da bd` and carried horizontal streaks; the new one averages `e8 d4 b7` with the jaw's mottle (the sample box includes some shaded paper, so the two jaw/throat numbers are not a like-for-like match to the digit).
- [x] **Resolve:** `evidence/trims-home/resolve.jpg`, top row at 220 px, bottom row the same at 2×: `neutral` | old `resolve` | new `resolve`. Every other preset is untouched.
- [x] **Still builds:** s00 (global 1), s07 (50), s09a (72): `builds_s00_s07_s09a.jpg`. s09a at its resolve beat (73.6 and 74.5): `s09a_resolve_frame.jpg` shows the new low brow and thick mouth bar.
- [x] **`node tools/check_timeline.mjs`:** `ok (21 shots, 70 beats, 195.0s)`.
- [x] **Determinism:** `node tools/determinism.mjs --t=6,12,21,29,36,42,183,190` → `determinism: PASS` (s01, s02, s03, s04, s05, s06, and s18 twice).
- [ ] **Not verified:** the wall shadows were not measured by the smoke-paper (pixel) method. Units come from the light/blob depths by formula; the sheets show the shadows in frame. I did not render the `neck`/`resolve` rigs in the roommates (`makeRoommateTall/Round` also build the throat; their cream now matches too, but I looked at no frame of them).

## Gaps
**Where the brief's "keep the units" had to give, and what I chose** (the specs' own units were for 1.25×/1.5× blobs):
- **s03:** the light is re-solved to S 3.6 (screen z 0.0208), so the shadow is 3.6 units before the gulp and 5.4 after. At v3's S 4.33 the 1.5× blob threw 6.5 units, which ran off the top and right of frame (my first sheet). The spec says 3.0 → 3.75; v3 had built 4.33 → 5.4 for readability, and I kept v3's 5.4 end state.
- **s04:** 4.0 / 4.5 / 5.2 units as the spec, by moving the stool/blob mark back (z 0.173 / 0.184 / 0.197) rather than the fridge light. x is unchanged, so the shadow sits 2–3.5 cm further right than v3's.
- **s05:** 8.0 units as the spec (blob z 0.337, x 0.057; light unchanged).
- **s06:** 5.1 units before the gulp, **6.8 after** (spec says 6.1; the ratio of the new sizes is 1.33). Whole shadow in frame on the sheet. **The lamp pool is 1.77× against the spec's 1.37×**: the lamp mouth is 0.0413 high, only 5 mm over the 1.5× blob's top. Raising it enough to restore 1.37× would push the chain bead past his reach, and I did not try it. The wall shadow still collapses to a pool on the sheet.
- **s02:** the perched drop is 0.4× (v3's `PERCH`), not the spec's 0.5×; I left it.

**Acting:**
- `act()`'s 12-frame minimum hold cannot take s02's 0.33 s flinch (9.33 → 9.67). As built: `flinch` 9.33, `numb` 9.92 (the last drawing). s03's `guilt` → `numb` is cued at 0.67, not 0.42, for the same reason; the spec's shrug eyes (closed 0.17–0.42, tired from 0.42) are set over the preset's face.
- `slump: 0` on every shot, because every hand is pinned (chain, keys, pen, fridge) and the poses own the lean. The spec's gag eyes and mouths (s04's jar glances, s06's squint, stare and flinch, s03's smile, s05's snort) are set over the presets' faces, so the kit contributes brows, tilt, tail and breath. s06 uses the presets' own breath rates; the others use 5–6 s.
- The s05 roommates have no acting calls (the brief says optional).
- s18: no separate warm pool "on him from above" at the sit-back. The lamp is the key as before; the sit-back is the pose, the `relief` face and the clock glance (eyes `side`, head up 9°). Daytime is ambient 2.5×, a shadowless pale window light (`DAY_I` 0.8, no shadow) and the amber grade mixed 0.8 toward dawn. I judged it by eye on `s18_sheet.jpg` only.
- s18's I2 camera is widened and moved right ((0.0535, 0.054, 0.136)) so the whole clock sits beside "Final" and its circle. The lamp shade still shows in its lower left, as it did before.

**Rig fixes:**
- The throat now tiles a mirrored patch of the painted jaw (`paintedLike` in `gator.js`; `paper.like` on the part). Roommates' throats change with it.
- The `resolve` mouth is a code-drawn torn strip (78 × 16 figure px, the brow's colour) built lazily in `acting.js` on the head, boiled at 10/s, shown only while `resolve` is the current preset, and it hides the face sheet's mouth then. Rigs without a head/mouth joint are skipped. It does not follow a shot's own `rig.face({ mouth })` override (the bar replaces it while `resolve` shows). Brow: `[-7, 10]` → `[-2, 13]`.

## Story
I started by reading the climax builders' sheets, because their numbers set the rhythm for these shots: the film is 3:15 now, and the home shots are the quiet opening that has to carry the same clock and the same meter. The two rig fixes came first because they were small and measurable. The neck turned out to be darker and greyer than the jaw, not paler as the note said. The reason was plain: a flat fill gets paper.js's dry-brush streaks, which I could see as horizontal stripes in `neck.jpg`. Tiling the painted jaw's own paper fixed it. My first patch grabbed the jaw's painted rim and drew lines across the throat; I moved the sample inside the jaw and the lines went.

The shot work was mostly arithmetic with a render to check it. The brief said to keep the shadow's units while the blob grew, but the specs' units were for the old sizes. In s03 the arithmetic gave a shadow that ran out of frame: I only saw it on the first sheet, with the top of the shadow cropped, and re-solved the light. In s04 and s05 I moved the blob instead of the light so the rooms did not change. s06 is the one I could not finish: the lamp pool came out at 1.77× and I left it, because raising the lamp would break the hand's reach, and I would rather say that than guess.

The moment I liked: the first s18 sheet had a clock at the edge of the calendar insert, cut in half. Widening I2 until the whole clock sat beside "Final" is the cut where the ending says it is afternoon (`clock.jpg`, `s18_sheet.jpg`).

## State
built · 2026-10-18
