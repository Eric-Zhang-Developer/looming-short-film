# Brief · v2-marston-b

**Type:** builder · **Wave:** 5b (v2) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/02-story.md`, `docs/shots/README.md`, **`docs/shots/s13 s14 s15 s16.md`**, `docs/03-art-direction.md` (paper vs ink), `docs/assets.md`, `src/assets.js`, the current shot files, `src/characters/gator.js`, `done/cut-gator.md`, the done notes of the kits you use (marston_kit, props_kit), and `done/v2-home-b.md` if it exists (how the first v2 builder wired kits)

## Goal
v2 of these shots: built from the frozen art, on the G4 timeline, reading at a glance to a cold viewer.

## Owns
`src/shots/s13 s14 s15 s16.js`; `src/assets.js` (**append** PIECES entries only for: marston_kit, props_kit, if not already there; names = the keys in `assets/cut/<kit>.boxes.json`, sizes from the kit's scale table); `evidence/v2-marston-b/`; `done/v2-marston-b.md`

## Spec
- Build each shot from its G4 spec with the frozen kits (already cut into `assets/cut/`) and the real gator.
- Sets are sized against the gator using the scale tables.
- The blob stays ink: smooth, too alive, not paper. BLOB_R and the meter come from the spec.
- Beat times come from `src/timeline.js`. Don't move them.
- Keep tunables as named constants at the top of each file.
- Keep the staging and the sensor-light turn (s15 is the reference desk unit); swap in the Marston kit art.
- s13's top-down view needs the hero's own top-view eye pair (done/cut-gator.md: it shows one big disc now).
- s15/s16 include the payoff's practice beat per the G4 spec: the Calc 2 sheet with real math, hand writing, a crossing-out, a check, and the blob shrinking one step per solved problem.
- If the snout reaches the blob in s15's close-up (cut-gator note), fix the spacing in the shot.

## Acceptance
- [ ] `evidence/v2-marston-b/<shot>.jpg` per shot: a key-moment sheet (one time per beat), `render.mjs --sheet=… --cols=6 --w=320`. Look at each one and fix anything that doesn't read.
- [ ] `determinism` passes at one time per shot; `check_timeline` ok
- [ ] Done note: what a cold viewer would understand from each sheet, what's still rough, and `## Story`

**Machine (hard):** at most one headless Chrome, foreground only, closed after use, `--w ≤ 960`. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap; if that happens, stop and report.
