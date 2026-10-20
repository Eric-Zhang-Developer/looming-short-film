# Done · v2-payoff

## What shipped
v2 of the payoff: s17 (Quiet 2) rebuilt on the frozen Marston kits at 18 s with the pocket climb cut. Two new shots, s17b (test day: exam room, his page, his profile) and s17c (the graded paper with the circled 94). s18 is rewritten as the G4 calendar ending on s02's real-scale home desk: the cross-off, the dot soaking into the circle, "Final" in red, the quivering bead, the uncap, and the fade. `src/assets.js` gets a separate `exam_room_kit` PIECES block.

## Where it lives
- `src/assets.js`: exam_room_kit block (8077c29)
- `src/shots/s17b.js`: 72a445d. It exports `PAGE`, `LINES`, `CAM_P`, `BLOB_AT`, `pageWithInk`, `flatHand` and `overheadSpot`, which s17c imports.
- `src/shots/s17c.js`: 2113997, 80a46fd
- `src/shots/s18.js`: 4088257, 490dc70. It imports `DESK`, `tools`, `homeDesk` and `seatReach` from s02.js, as `done/v2-home-a.md` asks.
- `src/shots/s17.js`: f177620. It imports `kitTools`, `marstonDesk` and the other helpers from s11.js.
- `evidence/v2-payoff/`: `s17.jpg`, `s17b.jpg`, `s17c.jpg`, `s18.jpg`, `s18_soak_strip.jpg`, `checks.txt` (544b5ba)

## How it was checked
- [x] Key-moment sheets, one per shot (`render.mjs --sheet=… --cols=6 --w=320`, global times, one time per beat plus the key drawings between). I looked at each one and fixed what didn't read; the fixes are in the commits. What a cold viewer should take from each:
  - `s17.jpg` (146.0 … 163.9): a library reading room at dawn. A gator sits at a desk under a lit pendant, a small black blob on the desk beside his page, another blob on the next desk, and a sleeping figure in the foreground. The window band goes from grey to gold, and patches of light crawl in from the foreground floor up to the desk fronts and tops. The gator sits back. The blob and his look at each other are too small to read at sheet size; they show at full res (a 1080p still at 153.6 shows the blob's side-eyes on him).
  - `s17b.jpg` (164.0 … 172.9): an exam room from the back, with rows of gators from behind, each with a page and a small blob, a blackboard, a clock and morning windows. Then a test page from above: "3. ∫ x e²ˣ dx", a hand with a pen coming in, and the blob waking. Then the gator in profile at a tablet desk, smiling at the blob. Then the page again as the three lines of working appear, and the blob is visibly smaller after 172.5.
  - `s17c.jpg` (173.25 … 177.9): an empty table and the blob. A blank sheet slides in, a hand turns it, and it's the same test with red checks and a circled 94 over his three lines. The blob side-eyes it, then closes its eyes, content. The hand taps the 94.
  - `s18.jpg` (178.5 … 194.958): night, lamp on, the home desk from s02. He stands, reaches up and crosses out the circled "Calc 2 exam", and the blob on the desk becomes a dot. In close-up the dot climbs the calendar to the red circle, flattens into it and leaves an ink ring. His hand writes "Final" in a new red circle, and a tiny new drop forms on it. Back in the wide, he looks at it and picks up his pen. The last frame is black.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 58 beats, 195.0s)` (`checks.txt`)
- [x] `node tools/determinism.mjs --t=150,167,175,186` (one time per shot) → PASS ×4, with hashes in `checks.txt`
- [x] The soak, frame by frame: `s18_soak_strip.jpg` (183.25–184.0 at 24 fps). The eyes close, it flattens on 183.5, it's gone on 183.583, and the ring blooms and stays.
- [ ] The spec files' own numeric acceptance: **not verified**. That covers cap-height px, the 0.80 width snap, the 2 px landing, the luminance of the stain against clean paper, shadow-scale measurements, the camera-layer pixel diff, and the exactly-three-cuts check on a frame dump.

## Gaps
- **Spec geometry I changed, each to keep the beat in frame or readable:**
  - **s17:** the camera aims 2 cm lower than the spec. The neighbor's unit mirrors about x 0.155, not 0.175, otherwise they fall outside the locked frame. The window is s11's single low ribbon (panes y 0.078–0.132), not the spec's 0.066–0.300 openings, so the light's landing times are approximate.
  - **s17b:** Camera P is tilted 18° off vertical, not straight down, because a standing blob vanishes from directly above. In the inserts the blob also leans back 55°. The blob mark is x −0.002, not 0.000. The exam desk art is scaled 1.2× so its top holds the page and the blob.
  - **s18:** "Final" is in row 4, column 3, as the spec's cell name says. The spec's "two rows down" from Friday would have put it in the lip's curl. I2 frames the lower sheet tighter than the spec, so "Final" reads and the lamp shade stays out of frame.
- **Cheats (marked `ponytail:` or in comments):**
  - **s18 lamp:** the light sits 16 mm in front of the painted shade. At the shade's own depth it only grazed the calendar.
  - **s18 shadows:** the blob, the dot, the drop and the gator cast none. The lamp is left of the blob and in front of him, so it threw a 1.5× shadow off the desk and a body-sized shadow up the wall, and the spec forbids anything over 1.1×. The stain and the trace ground the ink instead.
  - **s17c paper:** the graded paper casts no shadow, and its turnover is the flat-puppet cheat: face-down, on edge at 65°, then face-up. On the edge drawing the page leaves the top of the frame.
- **Missing art:**
  - `exam_room_kit` has no seated-from-behind figures and no table back view. T1 uses the gator's `turn_back` (tinted per figure, lowered to seated height behind a navy seat strip) and procedural table strips.
  - There is no red-marker art. The marker is two procedural rects.
  - The new drop has 'closed' eyes, not "no eyes", because `blob.js` has no eyeless state.
  - `crowd_sheet` and `study_props_sheet` are still proxies. That affects s17's neighbor and sleeper, the laptop and the energy drinks.
  - s17b's foreground gator in T3 was cut: it filled the frame and read as clutter.
- **Lettering:**
  - His working (s17b, s17c) and "Final" use the system "Noteworthy" font (fallbacks Bradley Hand, Chalkboard SE), drawn in code. It looks close to the painted hand but isn't it.
  - The ½ and ¼ glyphs come out small.
  - A machine without Noteworthy renders a different hand, and determinism holds per machine only.
- **Continuity:** "Final" sits on a patch of Friday's clean paper over the printed glyph in that cell. s02's calendar shows a glyph there.
- **Still rough:**
  - s17's hero and blob are small in the wide, as the spec intends, and the sit-back doesn't read at sheet size.
  - s18's reach has him standing behind the desk, chin up. At real scale his head covers the calendar from any lower stance, and his legs show above the desk top as he rises.
  - T3 and W2 are dim.
  - s17b T1's crowd reads more frog than gator from behind.
- **Not mine, flagged:**
  - `exam.js` still has the pre-meter `SHRINK`, so each shot writes its `BLOB_R` as literals.
  - s02 doesn't export its cameras, so s18 copies `CAM_W` and `CAM_I`. A change to s02's cameras has to be made in s18 too.
  - `assets/cut/` lacked the `marston_ext_kit_*` PNGs that s11's `marstonDesk` loads. I copied the 15 cuts from the main checkout (gitignored, not committed).
  - `node_modules` was symlinked from the main checkout to render, then removed.

## Story
I started with the two new shots, because s17c had to inherit s17b's page. The first problem was that props_kit's test page leaves problem 3 unanswered, and so does the graded copy. So his working became code lettering under the painted problem, and s17c draws the same three lines on the graded paper. The test he writes and the test he gets back can't disagree.

The first s17b sheet looked cleaner than it was. The insert was blown out to white, and the painted answers to problems 1 and 2 had vanished into the glare. The exam room was a row of silhouettes, because I'd lit it from behind the figures, so their backs were in shadow. Halving the overhead light and moving the fluorescent over the camera's shoulder fixed both.

s18 fought back the hardest. The first lamp read as a flashlight beam out of his snout. The dot showed up twice, once as itself and once as its own shadow beside it. His first reach to cross off Friday put his head over the X he was drawing. It took two restagings to get there: chin up, standing behind the desk at the calendar's edge (`s18.jpg`, frame 2).

The ending was the one I cared most about, and it was almost invisible. At the spec's opacity the ink ring disappeared at sheet size. The stain texture is a dried rim over a thin wash, so its darkness is a fraction of its opacity. Blooming it from the flattened dot's width at full strength made the paper look like it drank the ink (`s18_soak_strip.jpg`).

## State
built · 2026-10-16
