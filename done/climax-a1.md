# Done · climax-a1

## What shipped
- **The bedroom.** s07 (bed rot, 12 s), s08 (3:00 a.m., 10 s) and s09a (the choice, 6 s) are built on one bedroom set. `s07.js` builds the set and exports it, and s08 and s09a import it.
- **The clock.** `src/clock.js` is the film's one wall clock, made from the painted clock_kit.
- **The close-ups.** These use the painted `closeup_heads`, swapped in on the rig's head joint.
- **The Q16 peak.** The blob peaks at 2.5× (r 0.030) at s07's gulp3 and holds there through s08 and s09a.
- **The Q17 lamp.** The nightstand lamp clicks on at s09a 4.0 (global 74.0) and stays on.

## Where it lives
**Files**
- `src/clock.js`
- `src/shots/s07.js`, `src/shots/s08.js`, `src/shots/s09a.js`
- `evidence/climax-a1/`
- `done/climax-a1.md`

**Commits on `task/climax-a1`.** The branch fast-forwarded to `wave/3-assets` 09bd2ff first.

| Commit | What |
|---|---|
| d6ce24e | clock |
| 3a6d636 | s07 and the bedroom |
| a8d45a0 | s08 |
| 99db404 | s09a and the lamp |
| e79a271 | light and framing pass |
| 9ad2e87 | evidence |
| (this note's commit) | the done note |

**The clock API, as built**
```
const clock = await makeClock(ctx, { seed, diameter = 0.020, face = 'home' | 'exam' })
→ { group, set(h, m, s), boil(t) }
```
- **Pivots.** The hands pivot on their round ends. `pivotOf()` measures each one from the cut bitmap: the narrowest waist in the bottom 40%, then the boss's widest row.
- **Measured values** (uv, v down): hour [0.500, 0.842], minute [0.492, 0.886].
- **Reach** at Ø 0.020: hour 4.53 mm, minute 7.20 mm. The code-drawn Night Navy second hand reaches 7.6 mm, with a 1.6 mm tail. These are all in `group.userData.clock`.
- **Stepping.** `set` steps the second hand on `floor(s)`. On the first 24 fps frame of each second it overshoots +1.5° clockwise. The minute hand moves on each whole second, and the hour hand moves with the minutes.
- **Shadows.** The hands cast shadows; the face and pin don't.

**Bedroom exports in `s07.js`**
- `ROOM` (CEIL, BODY_Z, BLANKET_Z, BLOB_Z, DESK, CAL, CLOCK, NIGHTSTAND, LAMP, SHADE, BACKPACK).
- `CAM`, `LOOK`, `HIP`, `LIE`, `BLOB_R`, `KNEE`, `PHONE`.
- The light levels: `SPOT`, `SPOT_ANGLE`, `FACE_FILL`, `SPILL`, `MOON_PANES`, `FACE_LIGHT`.
- `bedroom(ctx, id)` and `closeHeads(ctx, T, rig, names)`.
- s09a exports `LAMP` (the lamp's intensity, 0.32).

**The lamp, for s09b**
- `ROOM.LAMP = [0.271, 0.054, 0.380]`: the shade mouth, which is where the light sits.
- `ROOM.SHADE = [0.016, 0.012]`: the shade's w × h, with its centre 4 mm above LAMP.
- `ROOM.NIGHTSTAND = { x0 0.255, x1 0.287, z0 0.355, z1 0.395, h 0.033 }`: 32 mm wide × 33 mm tall.
- The look:
  - The shade is cream tissue (translucency 0.9) with emissive × 1.4 once on.
  - The nightstand is kraft→navy 0.55, top 0.45.
  - The base and stem are navy→kraft 0.2.
  - The light is a `SpotLight` coloured `PALETTE.lamp`→cream 0.35, with angle 1.3, penumbra 0.9 and decay 2.

## How it was checked
All numbers are in `evidence/climax-a1/checks.txt`, along with the commands and scripts that produced them.

- [x] **Sheets** at the timeline beats: `s07_sheet.jpg` (9 frames), `s08_sheet.jpg` (9), `s09a_sheet.jpg` (12).
- [x] **`clock_times.jpg`.** It shows the home face at 9:00, 1:45, 3:00:00, 3:00:09 and 4:10, plus the exam face at 9:00. The hands sit on their pivots, inside the dial. `s07_clock_crop.png` is the clock in s07's wide: 68 px across by pinhole projection (spec ≥ 60).
- [x] **`closeups.jpg`.** Every close-up frame in the three shots (81) at about 400 px: s08 C2 numb and dread, and s09a C4 dread, lid closed, then resolve.
- [x] **The tick.**
  - `s08_tick_strip.jpg` and `s08_tick_overshoot.jpg` show the second hand across s08's opening ticks.
  - `ticks.txt` (`node evidence/climax-a1/ticks.mjs`) reads 1.5°, 7.5° and 13.5° at frames 0, 24 and 48, and the rest angle on every other frame. That is 0/6/12° plus the one-frame 1.5° overshoot.
- [x] **The s07 ceiling shadow, measured.**
  - Method (`measure.mjs` → `ceiling_shadow.txt`): render with the shadow caster on and off, then back-project the pixels that darken by more than 12% onto the ceiling plane y 0.145.

    | Local t | Blob r | Whole shadow ÷ blob width | In frame ÷ visible ceiling width | Depth across the ceiling |
    |---|---|---|---|---|
    | 5.0 | 0.024 | 0.280 m, **5.11×** (blob 0.0547) | 0.237 of 0.369 = 64% | 0.168, 3.1× |
    | 9.0 | 0.030 | 0.311 m, **4.55×** (blob 0.0684) | 0.248 of 0.365 = **68%** (spec ≥ 80%: not met) | 0.177, 2.6× |

  - The ceiling loom contrast is 85%.
- [x] **Motion strips**: `s07_flick_strip.jpg` (thumb flicks and the pause), `s07_gulp_strip.jpg` (7.417 squash, 7.5 snap) and `s09a_facedown_strip.jpg`.
- [x] **`node tools/check_timeline.mjs`** → `ok (21 shots, 70 beats, 195.0s)`.
- [x] **Determinism.** `node tools/determinism.mjs` at 18 times across s07–s09a → `determinism: PASS`. Re-run on the final code.
- [x] **Acting.** `node src/characters/acting.js` → `acting: ok`.
- [ ] **Q17's biggest wall shadow: not verified.** The claim is that the blob's wall shadow in s09a after 4.25 is the biggest of the film. It is visibly the largest thing in the frame (`s09a_sheet.jpg`, row 3), but I didn't measure it against s07's ceiling shadow.

## Gaps
**Against the spec**
- **Ceiling coverage.** s07's ceiling shadow covers 68% of the visible ceiling after the gulp, not ≥ 80%. The whole shadow is 4.55× the blob's width, but a third of it runs off frame right. Moving the camera right to catch it took the clock and calendar out of frame on the left, so I kept the clock in.
- **s08 isn't darker.** It is not the "lowest so far except s09a". s08 C3 is s07's light exactly, as s08.md specifies, so the mean luma matches: 68.17 vs 68.18.
- **s09a black.** It measures 12.76 mean luma (5.0%) with the windows and eyes counted. The spec says "under 5% excluding them", which it meets. To get there I lowered AMB_DARK from the spec's 1% to 0.3% of s02's ambient, because 1% measured 5.1%. The blob's body stays faintly visible in the black (27 against the room's 39). Its eyes measure 143 (5.3× the body, 3.7× the room).
- **s07 face fill.** The snout is 68% of the ceiling surround and the head dome 28%, against a spec of 30–45%. The snout runs over because it sits right over the phone.
- **s07 head angle.** It's −14° (chin tucked to the phone), not the spec's +15°.
- **s08's look at the circle.** The pupils don't move; the CC insert cut carries the look (brief decision). `guilt` at s08 3.0 plays on the `numb` painted head plus the head roll, because there's no guilt head in `closeup_heads`.
- **s08 C2 framing.** The blob's eyes aren't at the frame's right edge in C2. C2 is framed for the painted head first.
- **Sweat drop.** I added a code-drawn drop at s08 6.5 (`sweatDrop`). The painted dread head already has drops from 5.0, so 6.5 adds one more that slides.
- **s09a deviations.**
  - The blob slides from his knees to the mattress (z 0.300) at the sit-up, 3.5–3.667, not 4.25–4.75. Decided at build so it moves with his legs; the gasp still lands at 4.25.
  - The blanket drops 0.02 at 3.5, so the blob isn't hidden behind it.
  - The phone doesn't slide off his chest at 4.25. It's hidden 3.5–4.25 and lies face down on the blanket from the 4.25 cut.
  - His reach to the lamp is 3.917–4.0, not 3.67–4.0.
  - The lamp light uses `PALETTE.lamp`, not `PALETTE.amber`.
  - C4 stops the lamp down to 12% (`C4_STOP`), as an exposure change: at full level it blew his face out in the close-up.
- **s07 flicks.** The spec lists "7.00, 7.75 … 11.75", but 11.75 isn't on the 0.75 s grid from 7.00. It's built as 7.00 … 11.50 (7 flicks).

**Set and light decisions** (the spec was silent or the render forced them)
- **Bed and backpack.** The bed group is shifted +0.025 in x so the shadow lands on the ceiling in frame. The backpack is moved to the floor in front of the bed, at the spot where he stands up (`ROOM.BACKPACK`).
- **Lamp placement.** The lamp is near right, on the door side, its nightstand 4 cm in front of the bed's back.
- **README §10 fills.**
  - The `face` point light (cyan→navy, 9 cm reach, `FACE_LIGHT`).
  - The fill under the phone.
  - In s09a, a warm character fill once the lamp is on (outside C4), a moon rim in C4, and a moon patch on the backpack 0.5–4.0.
- **Spill decay.** The screen spill uses decay 0, as stylized as README §4's screen spot. At decay 2 the hands, 1 cm from the source, blew out.
- **s08 C1 camera.** It's 0.096 from the clock, not 0.055. That size makes the dial 60% of the frame at fov 20.
- **Eyelid.** The painted heads' closed lid (s09a C4 1.75–3.0) is a code-drawn green ellipse with a dark arc, not a painted asset: a parts-face exception for one blink. There's no green multiply on the heads either; the cuts hide the colour step against the rig.

**Contract changes needed**
- **contract-blob.** It needs an eye-glow option. s09a's in-shot fallback wraps `exam.mesh.onBeforeRender` and adds 0.3 to the `uAmb` uniform from 0.5 to 4.0. That reaches into blob.js's shader uniforms, which a contract option should replace.
- **`makeClock` is async**, because the kit is a bitmap. It also gains an additive `boil(t)`. Batch B's s02, s17b and s18 must `await makeClock(...)` and call `clock.boil(t)`.

**Not verified or left over**
- **Hand shadows.** The clock hands' small upward shadows on the face under the screen spill: I didn't check them at a size where they'd show.
- **Phone on edge.** At s09a 0.417 the phone stands on its edge for one drawing. That pose isn't clearly readable in `s09a_facedown_strip.jpg`.
- **Old strips.** The gulp, flick, tick and face-down strips were rendered before the last light pass (spill decay, face light, nightstand colour). They're right for motion and timing, but not for final exposure. The sheets, closeups and lumas are current.
- **Dead file.** `src/shots/s09.js` (the cut Marston exterior) is still in the tree. It isn't mine to delete.

**s09b's lamp placeholder.** Don't repoint its x/z. s09b is a different set in its own coordinates (the hall, z 0 at the front door), so my bedroom's [0.271, 0.054, 0.380] means nothing there. Two things should match:
- **Height.** Its `NIGHTSTAND_LAMP` y 0.027 is half mine. My shade mouth is 0.054 above the floor, on a 0.033 nightstand. Repoint y to `ROOM.LAMP[1]` if its floor is y 0 at the same scale.
- **Look.** Import `ROOM.SHADE` for the shade and use a dark nightstand, as in the lamp section above. s09b's light colour is lamp→cream 0.45 against my 0.35, close enough that nobody will see it. Its intensity can't be compared with mine, because the distances differ.

**Times for the sound pass** (global, s)

*s07*
- **Thumb flicks (`scrollTick`):** 48.50, 49.25, 50.00, 50.75, 51.50, 52.25, 53.00, 53.75 · then 55.00, 55.75, 56.50, 57.25, 58.00, 58.75, 59.50.
  - They pause at 54.0–54.75 (`clockGlance` 54.0).
  - Change from spec: the last flick is 59.50, not 59.75.
- **`gulp3`:** anticipation at 55.417, snap at 55.50.
- **The clock:** its second hand already steps every whole second in s07, from 1:45:00 at 48.0. Ticking it there is the sound pass's call.

*s08*
- **`clockTick`:** every whole second 60–69 (3:00:00 at 60.0). The cuts land on ticks: 62, 64 (circle), 65, 67.
- **Breath:**
  - The rate is 8/min from 60.0, held 63.0–63.5, then 14/min at 65.0 rising to 20/min by 66.5. The chest rise doubles at 65.0.
  - The drawn breath turns over (on 2s) at: exhale 61.92, inhale 65.67, exhale 67.25, inhale 68.75.
- **Sweat drop:** 66.5.
- **Blob blink:** 68.5.

*s09a* (ticks continue on every whole second, 70–75, from 3:00:10)
- **`phoneFaceDown`:** the phone tips onto its edge at 70.417 and lands face down at 70.5. The room goes black at 70.5.
- **Blob blink:** 71.0.
- **`breathIn`** at 71.5: the breath in is 71.75–72.50 and out 72.50–72.92, matching the spec.
- **`resolveFace`:** 73.0.
- **`sitUp`:** 73.5 (sitting by 73.67).
- **Blob slide** to the mattress: 73.50–73.67. Change from spec: it was 74.25–74.75.
- **Reach** to the lamp: 73.917.
- **`lampOn`:** the click and the light both land at exactly 74.0, on the tick.
- **Cut to the wide:** 74.25. The blob gasps at 74.25. There's no visible phone slide here (change from spec), so a slide sound would land on the cut.
- **Feet on the floor:** about 74.67. Stand at 74.75.
- **`backpackGrab`:** 75.0. The backpack is slung on his back at 75.58.
- **First step:** 75.75.
- **Blob hop** down to the floor: 75.75–76.0.

## Story
s07 has one idea: the phone under his chin is so low and close that the blob's shadow fills the ceiling. My first render gave a thin line across the ceiling, not a shadow. The blob is a flat card, and the phone sits almost in its plane, so the light saw it edge-on.

The fix was a shadow-only twin. It shares the blob's geometry and depth material, draws nothing, and turns to face the light. My first try used `lookAt`, which put the two eye holes one behind the other on the ceiling. Building the twin's basis by hand fixed that: width along x, then up toward the wall. The eyes now sit side by side over the bed (`s07_sheet.jpg`).

I had planned to read the 80% coverage off the sheet. In the end I didn't trust my eye on a shadow that runs off the frame, so `measure.mjs` renders with the twin on and off and back-projects the difference onto the ceiling. It gave 68%. I kept the number rather than move the camera, because the clock and calendar at frame left are what s08 cuts to.

The late surprise was mine. My first `checks.txt` listed the s07 and s08 mean lumas as 0. A grep had cut the number onto the next line, and I only caught it near the end, rereading the file. Re-measured, they are 68.18 and 68.17. They're equal because s08 C3 is s07's light by spec, so "darker than s07" was never going to hold.

In s09a, the lamp the director added blew his face white in the close-up. I stopped the camera down for C4 instead of dimming the lamp, so the wide still gets the full warm room.

## State
built · 2026-10-18
