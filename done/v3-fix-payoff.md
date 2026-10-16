# Done · v3-fix-payoff

## What shipped
The v3 polish on s17b, s17c and s18, plus the coordinator's three cold-viewer items. Handwriting is now the bundled Caveat font (SIL OFL 1.1), no system font is left in the three shots, s17b's hero is the only lit figure, s17c's 94 lands with a still beat and a small reaction, and s18's lamp, shadows, reach, grade, ghost and ending are reworked.

| Item | Status | Evidence |
|---|---|---|
| Handwriting off the system font | **fixed**: Caveat bundled, loaded explicitly; ∫ drawn as a path (Caveat has none). Painted pieces kept where the art exists (test_page, graded_test, blank_page); his working, "Final" and the new "1." are live because they animate | `checks.txt` (grep: none), `after_s17b.jpg`, `after_s17c.jpg` |
| s18 lamp "in front of its shade" | **fixed**: bulb at the shade (z 0.009), lamp stood in front of the calendar's curl | `after_s18.jpg` |
| s18 cast shadows (ink, gator) | **partly**: the blob/dot on the desk and the gator now cast; on the sheet the dot and drop get a soft contact decal, not the lamp's shadow (below) | `after_s18.jpg` |
| s18 reach / legs over the desk | **fixed**: he stands behind the desk, legs hidden, hoodie ends at the desktop line | `after_s18.jpg` row 1 |
| s17c 94 lands | **fixed**: hand leaves 3.92, still to 4.17, wide eyes 4.17, content smile 4.42, held to the cut | `after_s17c.jpg` |
| s18 tag held | **fixed**: uncap at 13.5 holds to 14.1 | `after_s18.jpg` row 3 |
| Cold viewer 1: s17b hero | **partly**: front row, centre, 1.1×, only lit figure, crowd dimmed toward navy, camera opens on him (0–0.75) then pulls to the room. From behind he still reads somewhat frog-like | `after_s17b.jpg` frame 1 |
| Cold viewer 2: heavy orange, drop size | **fixed**: grade is amber blended 50% toward s02's dawn; a dashed ghost of the old blob at its 0.33× size sits beside the new drop (I2, from 10.5) | `after_s18.jpg` rows 2–3 |
| Cold viewer 3: weak ending | **fixed**: hold on the uncap, pen goes down, "1." is written on a fresh propped sheet, the hand lifts to show it, then the fade; the W camera eases in over 11.5–16 | `after_s18.jpg` last row |
| Secondary motion | **partly**: the push-in, the lift of the hand and the blob's rise and settle. No new character secondary motion | |

## Where it lives
Branch `task/v3-fix-payoff`: `ba61123` (font), `22dd686` (s17b), `715c7bb` (s17c), `ef20cbd` (s18).
- `assets/fonts/Caveat.ttf` (Google Fonts, `ofl/caveat`, variable weight 400–700, 404 KB) and `assets/fonts/OFL-Caveat.txt`. Licence: SIL Open Font License 1.1, copyright 2014 The Caveat Project Authors.
- `src/shots/s17b.js` exports `loadHand`, `handFont`, `runParts`, `drawInt`; s17c and s18 import them.
- `evidence/v3-fix-payoff/`: `before_s17b|s17c|s18.jpg`, `after_s17b|s17c|s18.jpg` (`--w=320`), `before_s18_soak_strip.jpg`, `s18_soak_strip.jpg`, `checks.txt`.

## How it was checked
- [x] Before and after sheets per shot at the same times (above), and the soak strip. I looked at all of them and at 640–960 px sheets while working.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 58 beats, 195.0s)`
- [x] `node tools/determinism.mjs --t=165,167,175,186,193.4` → PASS ×5, and `--t=172.4,177.9` (frames with the bundled hand on the page) → PASS ×2 (`checks.txt`). The first run failed at 186 and caught a real bug (see Story).
- [x] No system-font dependency: grep for Noteworthy, Bradley, Chalkboard, cursive, serif, system-ui, font-family in the three shots → none. The only font in canvas text is `LoomingHand`, loaded from `assets/fonts/Caveat.ttf` before the first frame.
- [x] The soak still reads (`s18_soak_strip.jpg`): the dot flattens at 183.5 and is gone by 183.583, the ring blooms.
- [ ] The spec files' numeric acceptance (cap height px, the exactly-three-cuts frame dump, shadow scale ≤ 1.1×): **not verified**, as in v2.

## Gaps
- **Shadow scale.** The spec says no shadow over 1.1×. With the bulb at the shade the blob's shadow on the desk is longer than that (about 1.3–1.4×, by geometry: a 3 cm lamp at low angle). That follows the director's "real light, real shadows"; the spec needs updating. The gator's shadow falls forward onto the desk top; it is hard to see at sheet size and I did not isolate it.
- **Dot and drop on the sheet.** The bulb is 7 mm in front of the paper, so a real shadow of a 3 mm dot lands several cells away and reads as a second dot (that was v2's problem too). They get a soft decal under them instead. This is a cheat, not the light's shadow.
- **Reach.** The gator still stands inside the desk's depth (z 0.016, desk is 0.033 deep); the desk front hides him below the top, and his leg meshes are switched off while he is up. A camera that looked from below would show it. His hand sits near his snout at the top of the reach.
- **s17b hero.** From behind, the `turn_back` figure has round ears and reads as a frog; a lit, centred, bigger figure with a dimmed crowd finds him, but I could not give him a tail or a profile without new art. A tail piece or a back view with arms is the real fix.
- **New props not in the spec:** a fresh sheet propped at 50° on the desk (`blank_page` from props_kit; flat, a mark would be a sliver at the W camera's angle), the "1." mark, and the old blob's ghost outline. The s18 spec's ending (uncap then hold to the fade) is extended with the mark; the beat times didn't move.
- **Lamp z.** In s18 only, the lamp stands at z 0.0085 (s02/s06 have 0.004). It is invisible head-on, but it is a continuity cheat.
- **Font:** Caveat has no ∫, so it is a stroked path. The ½ and ¼ are Caveat's. The "Final" weight and the working look heavier than the painted hand and lighter than Noteworthy did; they are close, not the same.
- The `404 Failed to load resource` the renders print is unchanged.

## Story
I started by trying to save the s18 reach by moving his feet, and that was the wrong end. At v2's hip height his legs poked up over the desktop. Lowering the hip until the legs hid put his head in front of the X he was drawing, so I tried pitching the snout down; the arm then wrapped around his face (a scratch sheet, since deleted). The fix that worked was boring: keep v2's standing pose, which already kept the snout above Friday's row, and just switch the leg meshes off while he is behind the desk.

The lamp took a wrong turn too. I assumed "the lamp is in front of its shade" meant the light, which v2 had put 16 mm in front of the painted shade. It did, but a crop of the shade showed a dark bar cutting across it, and that was the calendar's curled lip, which hangs in front of the lamp. Standing the lamp 5 mm further out fixed both at once and let the bulb sit in the shade.

The coordinator's cold-viewer note changed the plan midway. "A lecture hall of frogs" was fair: from behind, the Student is a frog. I moved him to the front row, dimmed the crowd toward navy, added one spot, and opened on him. It helps; it doesn't fix the silhouette.

The determinism check caught one real mistake: the decal under the new drop never switched off, so rendering 193.4 and then 186 showed a ghost shadow at 186. I found it from the reversed-order render in `determinism.mjs` and fixed it in `ef20cbd` (`checks.txt`).

The ending is the part I like best. The first "1." was hidden behind his own hand, so I added a lift pose: he writes, then the pen rises and the mark shows.

## State
built · 2026-10-16
