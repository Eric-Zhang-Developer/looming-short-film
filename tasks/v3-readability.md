# Brief · v3-readability

**Type:** builder (story readability) · **Wave:** 5c (v3) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, **`evidence/cold-v2/report.md`** (the cold viewer on v2), `docs/notes/g4-2026-10-15.md`, `docs/02-story.md` (the visual rule, the meter, the readability test), `docs/shots/README.md`, the specs and current code for **s03, s06, s08, s10, s11, s12, s15, s17**, the done notes `v3-fix-home.md` and `v3-fix-marston.md`

## Goal
A cold viewer couldn't say **why the shadow grows and shrinks**, and saw **"no clear turning point"**. That's the film's thesis, so it outranks all polish. Make the rule and the turn unmistakable, in pictures and timing, with no words.

## Owns
`src/shots/s03.js`, `s06.js`, `s08.js`, `s10.js`, `s11.js`, `s12.js`, `s15.js`, `s17.js`, `evidence/v3-readability/`, `done/v3-readability.md`

## Priorities
1. **The rule, shown as cause and effect** (s03 and s06 are its demonstrations at home). The viewer must *see the light move* and the shadow answer within the same second: the screen lifts toward the blob and the shadow swells; the lamp clicks on overhead and the shadow collapses to a puddle. Frame the light source and the shadow together, and hold a beat on each result. If the light isn't in frame when the shadow changes, the rule is invisible.
2. **The turn (s15)** is the film's hinge: dark Marston, stillness, the shadow at its peak. He moves (the pen), the sensor lights snap on, and the shadow collapses. It must read as *his movement caused the light*: a beat of stillness before, the motion clearly his, the light following his motion with a tiny lag, the shrink immediate, then a held beat on the small blob and on his face. If the camera doesn't show both him and the light coming on, add a cut that does.
3. **Stalls:** s12 (~86–100 s) read as 14 s of near-identical close-ups "with the croc cropped off". Keep the quiet, but keep him in frame and give it one slow development (a push, or a breath-held change). s17 (~144–162 s) read as 18 s of near-identical wides with a blown-out ceiling strip and an unexplained brown foreground object: fix the exposure, remove or explain the object, and give the dawn one visible change (light warming, the blob's shrink).
4. **Dark frames:** ~72 s and ~80–84 s were near-black (s10/s11). Keep night, but readable on a phone.
5. **s08:** the gator in bed read as "a green frog". Make him read as himself: hoodie and silhouette, less cyan cast.

Beat times don't move (the music is cut to them). Within a shot you may re-pace motion and cameras.

## Acceptance
- [ ] Before and after sheets for each shot touched, plus `rule_s03.jpg`, `rule_s06.jpg` and `turn_s15.jpg`: dense strips (every 2–3 frames) across the cause and effect, showing source and shadow together
- [ ] `determinism` at one time per shot; `check_timeline` ok
- [ ] Done note: for each priority, what a cold viewer would now see, and `## Story`

**Machine (hard):** one headless Chrome, foreground only, `--w ≤ 960`. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap; if your render dies, wait 2 minutes and retry once.
