# Brief · v2-marston-a

**Type:** builder · **Wave:** 5b (v2) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/notes/g4-2026-10-15.md`, `docs/02-story.md`, `docs/shots/README.md`, **`docs/shots/s09 s10 s11 s12.md`**, `docs/03-art-direction.md` (paper vs ink), `docs/assets.md`, `src/assets.js`, the current shot files, `src/characters/gator.js`, `done/cut-gator.md`, the done notes of the kits you use (marston_kit, marston_ext_kit), and `done/v2-home-b.md` if it exists (how the first v2 builder wired kits)

## Goal
v2 of these shots: built from the frozen art, on the G4 timeline, reading at a glance to a cold viewer.

## Owns
`src/shots/s09 s10 s11 s12.js`; `src/assets.js` (**append** PIECES entries only for: marston_kit, marston_ext_kit, if not already there; names = the keys in `assets/cut/<kit>.boxes.json`, sizes from the kit's scale table); `evidence/v2-marston-a/`; `done/v2-marston-a.md`

## Spec
- Build each shot from its G4 spec with the frozen kits (already cut into `assets/cut/`) and the real gator.
- Sets are sized against the gator using the scale tables.
- The blob stays ink: smooth, too alive, not paper. BLOB_R and the meter come from the spec.
- Beat times come from `src/timeline.js`. Don't move them.
- Keep tunables as named constants at the top of each file.
- The director: "I like this scene. I want it refined. I really like how lighting is used." Keep each shot's staging and its sensor-light behaviour; replace the placeholder art with the Marston kits: ribbon windows, perforated cubicles, Y-back chairs, ring pendants, coffered ceiling.
- s09 uses `marston_ext_kit`, with the brick darkened by night light, and Century Tower in the breezeway.
- The night window view goes behind the ribbon window in the desk shots.
- **Keep Marston's desk unit geometry** (UNIT in s15.js): only the art on it changes.

## Acceptance
- [ ] `evidence/v2-marston-a/<shot>.jpg` per shot: a key-moment sheet (one time per beat), `render.mjs --sheet=… --cols=6 --w=320`. Look at each one and fix anything that doesn't read.
- [ ] `determinism` passes at one time per shot; `check_timeline` ok
- [ ] Done note: what a cold viewer would understand from each sheet, what's still rough, and `## Story`

**Machine (hard):** at most one headless Chrome, foreground only, closed after use, `--w ≤ 960`. A watchdog kills Chrome under 3 GB free disk or over 12 GB swap; if that happens, stop and report.
