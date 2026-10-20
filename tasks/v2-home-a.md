# Brief · v2-home-a

**Type:** builder · **Wave:** 5b (v2) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/02-story.md`, `docs/shots/README.md`, **`docs/shots/s00 s01 s02 s03 s06.md`**, `docs/03-art-direction.md` (paper vs ink), `docs/assets.md`, `src/assets.js`, the current shot files, `src/characters/gator.js`, `done/cut-gator.md`, the done notes of the kits you use (home_kit, kitchen_kit, props_kit), and `done/v2-home-b.md` if it exists (how the first v2 builder wired kits)

## Goal
v2 of these shots: built from the frozen art, on the G4 timeline, reading at a glance to a cold viewer.

## Owns
`src/shots/s00 s01 s02 s03 s06.js`; `src/assets.js` (**append** PIECES entries only for: home_kit, kitchen_kit, props_kit, if not already there; names = the keys in `assets/cut/<kit>.boxes.json`, sizes from the kit's scale table); `evidence/v2-home-a/`; `done/v2-home-a.md`

## Spec
- Build each shot from its G4 spec with the frozen kits (already cut into `assets/cut/`) and the real gator.
- Sets are sized against the gator using the scale tables.
- The blob stays ink: smooth, too alive, not paper. BLOB_R and the meter come from the spec.
- Beat times come from `src/timeline.js`. Don't move them.
- Keep tunables as named constants at the top of each file.
- s00 is new: the phone buzz and the notification card "Calc 2 Exam · Fri" (props_kit).
- s02 pushes in to the hand-lettered "Calc 2 exam" on the calendar, and the ink drop is born from the circle.
- The home desk shots (s02, s03, s06) are **re-staged on the home kit's desk at real scale** (the director's "massive table"): don't reuse s15's oversized desk UNIT for home. The lamp beat in s06 stays.
- s03's avoidance is the laptop game: the screen is the low light, so the shadow is big.
- s01 is the dawn exterior; the home exterior is from the kits where possible.

## Acceptance
- [ ] `evidence/v2-home-a/<shot>.jpg` per shot: a key-moment sheet (one time per beat), `render.mjs --sheet=… --cols=6 --w=320`. Look at each one and fix anything that doesn't read.
- [ ] `determinism` passes at one time per shot; `check_timeline` ok
- [ ] Done note: what a cold viewer would understand from each sheet, what's still rough, and `## Story`

**Machine (hard):** at most one headless Chrome, foreground only, closed after use, `--w ≤ 960`. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap; if that happens, stop and report.
