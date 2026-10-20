# Done · v2-marston-a

## What shipped
s09–s12 rebuilt on the frozen `marston_kit` and `marston_ext_kit`, on the G4 timeline (beat times read from `src/timeline.js`) and the G4 meter (2× through s10, gulp 5 to 2.5× at s11 5.25, 2.5× breathing in s12). v1's staging and light behaviour are kept: the phone loom, the zone timeout, the flickering stack tubes and the lit doorway. The placeholder art is replaced with ribbon windows over the Century Tower night view, a perforated cubicle panel, the Y-back chair, the ring pendant, bookshelf bays, coffered ceiling strips, carpet, and the brick exterior with Century Tower in the breezeway. `src/assets.js` has the two kits' PIECES rows as their own block.

## Where it lives
- `src/assets.js` (marston_kit, marston_ext_kit block): d513120
- `src/shots/s11.js`: af2ba1e. It also exports the shared kit helpers and the desk set (`kitTools`, `marstonDesk`, `wallCanvas`, `carpetCanvas`, `MARK`…) that s10 and s12 import.
- `src/shots/s12.js`: 0ee562b · `src/shots/s10.js`: b198749 · `src/shots/s09.js`: 855391d
- Evidence: `evidence/v2-marston-a/s09.jpg`, `s10.jpg`, `s11.jpg`, `s12.jpg` (key-moment sheets, `--cols=6 --w=320`), `s11_gulp_strip.jpg` (85.083–85.583, every frame), `checks.txt`

## How it was checked
- [x] Key-moment sheets, one per shot, each viewed: s09 at 68.0 (`marstonEnter`), 70.0, 71.5, 72.2, 73.0, 73.6; s10 at 74.0 (`stacksEnter`), 74.6 (`stacksFlicker1`), 76.0, 77.45 (`stacksFlicker2`), 77.7, 79.95; s11 at 80.5, 81.1 (`laptopOpen`), 82.0, 83.7 (`phoneWake`), 84.4 (`tableLightDies`), 85.17, 85.25 (`gulp5`), 85.9; s12 at 86.0 (`quiet1Start`), 87.25, 88.75, 91.0, 92.25, 94.5.
- [x] Gulp 5 on the beat: `s11_gulp_strip.jpg` shows eyes closed on 85.167 and 85.208, then the bigger blob and loom from 85.250.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 58 beats, 195.0s)`
- [x] `node tools/determinism.mjs --t=70,77,84.4,91` (one time per shot) → each hash ×3 matches, `determinism: PASS` (`checks.txt`)
- [ ] The specs' numeric acceptance (shadow scales measured on frames, the "5 of 24 windows" count, eye-level match): **not verified**. The scales are set by the spec's geometry in code (s10 S = (z_g + 0.035)/0.060, s11 phone z 0.118 over the 0.074 mark, s12 0.114/0.040 = 2.85). None was measured on a render.

### What a cold viewer would get from each sheet
- **s09:** a brick university building at night with a few lit windows, a clock tower framed in a gateway, and one lit door. A small gator walks to it with a dark blob at his heels, and both go in. It reads, but it's dark. The gator is small (as specced) and the brick is nearly black at 320 px.
- **s10:** a library aisle of colourful bookshelves under strip lights. He walks toward us on his phone with the blob beside him, and the blob's shadow grows on the end wall until it fills the end of the aisle. The clearest of the four.
- **s11:** a gator at a library desk under a ceiling light, with tall dark windows and a tower outside. He opens a laptop, then picks up his phone. The blob's shadow leaps up the windows, the light goes out, and the blob gets bigger. The loom and the gulp read. The blob's body, black on near-black, reads mostly by its eyes after the light dies.
- **s12:** a sleeping gator's head at the left, a huge blob with open eyes in the middle, and its shadow above. The eye holes in the shadow show the lit window band as two cyan half-moons. It reads as "the blob is watching him sleep" more than "the shadow owns the room": at 2.5× the blob's body fills the centre, and the loom is cropped at the top.

## Gaps
- **METER isn't in `exam.js`.** README §1 says `METER`/`SHRINK` live there, but `exam.js` still has the pre-meter values, and it isn't mine. Each shot writes its `BLOB_R` radii (0.024 and 0.030) as literals and calls `createBlob` directly, as s15 does.
- **The blob mark contradicts "keep UNIT".** I kept UNIT's desk, chair, hip, phone rest and tube positions, but put the blob on README §1's Marston mark (x 1.15(r − 0.012), z 0.074) and the laptop at z 0.078, as the G4 spec says. UNIT still has the blob at z 0.0884 for r 0.012, so s15 doesn't match s12 until s15's v2 pass moves it.
- **Eye level:** the cut gator's seated eye is about y 0.054 (`done/cut-gator.md`), and the 2.5× blob's eyes are about 0.032. "Eye to eye" doesn't hold. Fixing it needs the README doc pass that cut-gator flagged.
- **Props are still proxies.** `props_kit` and `home_kit` (laptop) have no PIECES rows on this branch, and adding them isn't in my owns. The phone, laptop, page, pen and backpack are `study_props_sheet` proxy shapes. `foliage_sheet` isn't frozen either, so s09's far tree line is still procedural.
- **The kit doesn't match the spec everywhere:** the facade has 2 × 8 openings, not 3 × 8. Five lamps light three facade windows and two bay windows. The bay's lamps light a few adjacent panes each, so "exactly 5 windows" is approximate. I darkened the brick with a material tint (`NIGHT 0.35`), not a repaint.
- **Choices I made where the spec was silent:**
  - The night view is one far layer behind the ribbon, with a faint self-glow (0.3 in s11, 0.1 in s12) because nothing behind the wall lights it.
  - The ribbon window is at the kit's scale (panes y 0.078–0.132), not the spec's 0.066–0.300 openings. One ribbon row is what s11/s12 frame.
  - The desk row's legs are stretched 1.25× so the kit desk fits UNIT's 0.034 height at UNIT's 0.183 width.
  - The breezeway is placed at the door's x. Facade and bay are at 0.8 of the kit's distance-layer size so four facade bays fit left of it.
  - The s10 bookshelf bays repeat one painted bay. They are mirrored and tinted per bay but are still visibly one design. That is set dressing, not a crowd, but a second bay painting would help.
- **Shared helpers live in `s11.js`.** s10 and s12 import from a shot file. A small `src/sets/marston.js` module would be cleaner, but it isn't in my owns.
- **Still rough:** s09 is very dark at sheet size. The lit windows read as flat white tiles. The ribbon frames' painted rim still catches light as a pale fringe. In s12 the loom is mostly off the top of the frame, behind the blob.
- `evidence/anim-s10` and `anim-s11` measure pages read `parts`. I kept most of those names, but those pages were not re-run.

## Story
I started with the director's note. He liked this scene and its lighting and wanted it refined, so I treated v1's light behaviour as fixed and only changed what sits in it. The first render of v1 (in scratch) showed how much was placeholder: navy boxes for windows, kraft rectangles for the desk, and a blob still riding the backpack from before G4.

The kit pieces don't line up with the desk unit on their own, so I measured them. ffmpeg dumped raw alpha, and a short Python script printed opaque runs along a row or column. That's how I found the desk row's top board at pixel row 49, its legs ending at 152, the ribbon panes between rows 22 and 95, and the facade's 2 × 8 openings (the spec wants 3 × 8). With those numbers, a desk painted for a 0.75 m real table fits UNIT's 0.034 by stretching only its legs.

The surprise was the night view. In the first s11 render the windows were black boxes, because the light that reaches the view behind the wall arrives at a grazing angle. Even after I gave it a faint glow, the tower sat behind a mullion. Moving it 17 mm put it in a pane. Then in s12 the same glow was the brightest thing in the darkest shot of the film, so it gets a third there.

The second render of s10 showed the coffered ceiling outshining the shadow it was meant to frame, so it's dimmed to 0.3. The gulp strip (`s11_gulp_strip.jpg`) confirmed the snap lands on 85.25. Eleven Chrome runs in total (scratch tests, the sheets, the strip, determinism), one at a time.

## State
built · 2026-10-15
