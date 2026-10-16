# Brief · v2-payoff

**Type:** builder · **Wave:** 5b (v2) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/02-story.md`, `docs/shots/README.md`, **`docs/shots/s17 s17b s17c s18.md`**, `docs/03-art-direction.md` (paper vs ink), `docs/assets.md`, `src/assets.js`, the current shot files, `src/characters/gator.js`, `done/cut-gator.md`, the done notes of the kits you use (props_kit, exam_room_kit, home_kit), and `done/v2-home-b.md` if it exists (how the first v2 builder wired kits)

## Goal
v2 of these shots: built from the frozen art, on the G4 timeline, reading at a glance to a cold viewer.

## Owns
`src/shots/s17 s17b s17c s18.js`; `src/assets.js` (**append** PIECES entries only for: props_kit, exam_room_kit, home_kit, if not already there; names = the keys in `assets/cut/<kit>.boxes.json`, sizes from the kit's scale table); `evidence/v2-payoff/`; `done/v2-payoff.md`

## Spec
- Build each shot from its G4 spec with the frozen kits (already cut into `assets/cut/`) and the real gator.
- Sets are sized against the gator using the scale tables.
- The blob stays ink: smooth, too alive, not paper. BLOB_R and the meter come from the spec.
- Beat times come from `src/timeline.js`. Don't move them.
- Keep tunables as named constants at the top of each file.
- s17 is Quiet 2 per the G4 spec.
- s17b is new: test day in the exam room (exam_room_kit). He recognises the problem, gives a small smile, and writes calmly.
- s17c is new: the graded paper comes back with red checks and a circled 94.
- s18 is the calendar ending: the date is crossed off, the blob shrinks to an ink dot and soaks into the calendar. Then the tag: a new date, a tiny ink drop quivers, he uncaps his pen.
- The sound cues for these already exist (snd-g4): match the picture to the cue times in doc 05.

## Acceptance
- [ ] `evidence/v2-payoff/<shot>.jpg` per shot: a key-moment sheet (one time per beat), `render.mjs --sheet=… --cols=6 --w=320`. Look at each one and fix anything that doesn't read.
- [ ] `determinism` passes at one time per shot; `check_timeline` ok
- [ ] Done note: what a cold viewer would understand from each sheet, what's still rough, and `## Story`

**Machine (hard):** at most one headless Chrome, foreground only, closed after use, `--w ≤ 960`. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap; if that happens, stop and report.
