# Done · v3-fix-home

## What shipped
The v3 polish on the home shots. Every fix-list item is fixed or partly fixed (table below). s03's wall shadow is bigger and dark, s04's reads as a navy blob shape, s05's roommates are fitted to the painted heron and bear, s06's lamp is 80 cm instead of 120, s01's skyline and oaks come from `marston_ext_kit`, and the Student, heron and bear breathe.

| Item | Status | Evidence |
|---|---|---|
| s03 shadow looms | **fixed** | `after_a.jpg` row 2, `after_s03_extra.jpg`, `checks.txt` |
| s04 shadow reads as the blob | **fixed** | `after_a.jpg` row 3, `checks.txt` |
| s05 roommates fitted to the art | **fixed**, with gaps below | `after_b.jpg` row 1 |
| s06 lamp | **partly**: 80 cm, not a 45 cm desk lamp | `after_b.jpg` rows 2–3 |
| s01 proxies replaced | **fixed** | `after_a.jpg` row 1 |
| secondary motion | **fixed** as breathing, heron nod and tail springs; sleeve swing not done | commit e0be192 |

## Where it lives
Branch `task/v3-fix-home`, commits `0f4776a` (s03), `165e2d9` (s04), `3be5153` (s06 lamp), `8aa96b2` (s05), `8a81b49` (s01), `e0be192` (breathing), `8199292` (s05 bounce, s03 fill).
- `src/shots/s03.js`: `SCREEN_Z` 0.0195 (was 0.0225), so S goes 3.0 → 4.33 and the 1.25× shadow is 5.4 units (was 3.75). Camera pulled back and right (`CAM`, `FOCUS` re-solved) so it fits. After the wake the window drops from 30% to 3% and ambient to `AMB_K` 0.2, so the shadow is the darkest thing on the wall. Before the wake they stay at the old levels.
- `src/shots/s04.js`: the ambient is a navy-to-cool hemisphere light instead of `ambient()`'s kraft bounce, and the uppers and microwave sit at `UPPER_Z` 0.004 (were 0.014–0.016), so the shadow doesn't jump at their edges.
- `src/shots/s05.js`, `src/characters/roommates.js`: see below. `POSES_5` holds s05's own leg swing, because `poses.js` isn't mine.
- `src/shots/s02.js`: only `DESK.lamp` (h 0.066 → 0.044, x −0.004 → 0.008). `src/shots/s06.js`: `LAMP_I` 0.12 → 0.06 for the lamp's new distance.
- `src/shots/s01.js`: the `roofline()` proxy is deleted.
- `evidence/v3-fix-home/`: `before_a.jpg`, `after_a.jpg` (s01, s03, s04: times 4.5, 6.5, 8.5, 9.9, 21.5, 23, 24.6, 25.8, 27, 29, 31, 33), `before_b.jpg`, `after_b.jpg` (s05, s06: 35, 37.5, 38.5, 39.5, 40.5, 41.5, 42.2, 43.5, 45.5, 47, 48, 49.5), `after_s03_extra.jpg` (20.5 pre-wake to 25.5), `after_s00_s02_lamp_check.jpg`, `checks.txt`. All at `--w=320` or 480, one time per beat.

## How it was checked
- [x] Before and after sheets per shot: the files above. I looked at all of them and at 1920 px stills of s03, s04 and s05 along the way.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 58 beats, 195.0s)`
- [x] `node tools/determinism.mjs --t=5.5,24.6,29,38.5,44` → PASS at all five, one per shot (`checks.txt`).
- [x] s03 darker: shadow luma 76 → 43–49 against a lit wall of 74–85 (before: 81, so the shadow was 7% darker than the wall and read only by hue). Wider by geometry: 5.4 units against 3.75, 1.44×.
- [x] s04 colour: shadow patch rgb(62,54,53) → rgb(18,29,41), lit wall unchanged at luma 122 → 126.
- [ ] Spec acceptance for the s03/s04/s05 shadow *scales* (smoke-paper measurement): **not re-measured.** s03's scale changed on purpose (S 4.33, not the spec's 3.0). The spec and README §1 and §4 still say 3.0 / 3.75 units and need updating by whoever owns docs.
- [ ] Foot slide in the s05 walk: **not measured.** The legs swing ±38° on 3.3 cm legs for a 5 cm step, which should leave about 6 mm of slide by arithmetic, but I only looked at `strip` frames, not at foot positions.

## Gaps
- **s06 lamp is 80 cm, not a "normal" 45–60 cm desk lamp.** The reason is scale, not the head: at the film's 0.055 m per real m the 1.25× blob is 0.03 m tall, i.e. 55 cm. A 45 cm lamp's mouth sits below the blob's top and can't light it from above. 80 cm puts the mouth at 0.0284, just over the blob's top, and moving the lamp right of his snout (x 0.008) keeps the shade visible. A real fix is a kit asset: an architect lamp, as the s06 spec describes, which the frozen `home_kit` doesn't have. The lamp is part of the shared desk set, so it moved in s00, s02 and s03 as well; I checked s00 and s02 in `after_s00_s02_lamp_check.jpg` and nothing collides.
- **s03 changed S from 3.0 to 4.33 on purpose**, and the shadow now crosses the calendar's Friday cell. The camera also moved (`pos` 0.055, 0.075, 0.40), so the cut from s02 is less "on the same axis" than the spec says. Doc updates (s03 spec, README §1 table, §4) are not mine to make.
- **s04:** the shadow now reads, but where it falls on the stove and the counter (z 0.026) it still shifts against the wall behind, because those pieces are 2.6 cm closer to the light. The eye holes show the tile and the fruit bowl through them, a little muddy. The top of the shadow still runs up into the ceiling (the same as before).
- **s05:** the face-sheet eyes are drawn at the Student's size, so on the heron and the bear they look large and googly. I can't scale faces separately without editing `gator.js` (not mine). The heron's mouth is hidden (the beak is the mouth). Both roommates borrow the Student's arms, multiplied by their body colour; the heron's arm still reads as a cream-and-grey pill. The painted "bear seen from behind" has the faces overlaid on its turned head; that works but the placement was by eye. In the second half of his walk the heron's legs are hidden behind the laptop cushion at the front, as they were before.
- **Sleeve swing** (the brief's third example): not done. The Student's arms are pose-solved to hit the keys and the lamp chain, so a spring on them would break the reach.
- The `404 Failed to load resource` the renders print is the same before and after my changes; I didn't chase it.
- Spec silent: I set the heron's standing height to the sheet's own 0.098 m (spec 0.10), the bear's head top to 0.08, the breath period to 2.8 s and its amplitude to 0.7–1°.

## Story
I started with s03, because it was the most obvious: the shadow was pale and about the size of the blob's head. I first assumed the wall was too bright, so I turned the window light down. That helped, but the shadow was still a warm brown on a grey wall, which is why it had read as pink. The brown came from `ambient()`, whose ground colour is kraft. So the real fix was two things: pull the screen 3 mm closer (S 3.0 to 4.33) and drain the ambient and window light once the screen wakes. The bigger shadow ran off the right of the frame, so I pulled the camera back and re-solved the focus distances; the first try forgot the focus and it showed (`after_s03_extra.jpg` has the right version).

The same ambient was the s04 problem. I'd expected to fight the cabinets, and I did flatten the uppers to the wall, but the muddy look was the brown again. Swapping to a cool hemisphere light turned the blotch navy in one render (`checks.txt`: rgb 62,54,53 to 18,29,41).

s05 was the long one. The painter had drawn a heron with a long neck and a bear seen from behind, and v2's sizes ignored their proportions: the tail was stretched twice over and the bear squashed. I replaced every size with the cut's own pixel box times one scale, found the neck, leg and tail joints by reading the art, and the heron came out at 0.098 m, almost exactly the spec's 0.10. I also walked him with a wider leg swing, because his stride was longer than his legs.

The lamp is the item I couldn't finish properly. Working out why the lamp needed to be 120 cm showed it was the blob's size, not his head, so I stopped at 80 cm and wrote it up above.
`evidence/v3-fix-home/after_b.jpg` is the s05 walk-through.

## State
built · 2026-10-16
